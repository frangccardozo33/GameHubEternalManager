// Una instancia por liga. Guarda el estado de la liga, corre los partidos en vivo por reloj real y los transmite por WebSocket.
// La lógica de cada deporte vive en un adaptador (nfl.js, basquet.js, ...; ver mods.js) con una interfaz común.
import { DurableObject } from 'cloudflare:workers';
import { MODS } from './mods.js';

const CHUNK = 400000;
const OPEN_BEFORE_MS = 5 * 60e3; // la transmisión se abre 5 min antes (intro, estudio y anuncios en el cliente)
const TICK_MS = 100;             // frecuencia de envío a los espectadores
const ALARM_LIVE_MS = 1000;      // avance del partido cuando no hay nadie mirando
const json = (o, status = 200) => Response.json(o, { status });

export class LeagueDO extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.meta = null; this.league = null; this.mod = null; this.live = new Map(); this.socks = new Map(); this.timer = null;
    this.ready = ctx.blockConcurrencyWhile(() => this.boot());
  }

  // ---------- persistencia
  async boot() {
    const s = this.ctx.storage;
    this.meta = (await s.get('meta')) || null;
    if (!this.meta) return;
    this.mod = MODS[this.meta.module];
    const keys = [...Array(this.meta.chunks)].map((_, i) => 'lg' + i), m = await s.get(keys);
    this.league = this.mod.load(keys.map((k) => m.get(k)).join(''));
  }
  async save() {
    const txt = this.mod.serialize(this.league), n = Math.ceil(txt.length / CHUNK), o = {};
    for (let i = 0; i < n; i++) o['lg' + i] = txt.slice(i * CHUNK, (i + 1) * CHUNK);
    const old = this.meta.chunks || 0;
    this.meta.chunks = n; o.meta = this.meta;
    await this.ctx.storage.put(o);
    if (old > n) await this.ctx.storage.delete([...Array(old - n)].map((_, j) => 'lg' + (n + j)));
  }
  async saveMeta() { await this.ctx.storage.put('meta', this.meta); }

  // ---------- calendario
  roundStart() { return Math.max(this.meta.firstKickoff + (this.meta.rounds || 0) * this.meta.everyMs, this.meta.notBefore || 0); }
  status(m, now) {
    if (m.played) return 'final';
    const st = this.roundStart(), lv = this.live.get(m.id);
    if (lv && lv.finished) return 'final';
    if (now >= st) return 'live';
    return now >= st - OPEN_BEFORE_MS ? 'open' : 'scheduled';
  }
  publicState(now = Date.now()) {
    const mod = this.mod, r = mod.round(this.league), st = r ? this.roundStart() : null;
    return {
      module: this.meta.module, year: r?.year ?? null, phase: r?.phase ?? null, week: this.meta.rounds || 0, label: r?.label || null, startAt: st, now,
      teams: mod.teams(this.league), clubs: this.meta.clubs || {},
      matches: r ? r.matches.map((f) => ({ ...f, startAt: st, status: this.status(f, now), hud: this.live.get(f.id)?.hud() || null, viewers: [...this.socks.values()].filter((a) => a.match === f.id).length })) : [],
      results: mod.results(this.league), standings: mod.standings(this.league),
    };
  }

  // ---------- ciclo de vida de partidos
  ensureLive(now) {
    const r = this.mod.round(this.league); if (!r) return;
    const st = this.roundStart();
    if (now < st - OPEN_BEFORE_MS) return;
    for (const f of r.matches) {
      if (f.played || this.live.has(f.id)) continue;
      const saved = (this.meta.live ||= {})[f.id] || {};
      const lv = this.mod.makeLive(this.league, f.id, st, { ...saved, gameplans: this.meta.gameplans || {} }, now);
      this.live.set(f.id, lv);
      this.meta.live[f.id] = lv.persist(); this.metaDirty = true;
    }
  }
  socketsOf(matchId) { return [...this.socks].filter(([, a]) => a.match === matchId); }
  send(ws, msg) { try { ws.send(typeof msg === 'string' ? msg : JSON.stringify(msg)); } catch { this.socks.delete(ws); } }
  cast(matchId, msgs) {
    for (const m of msgs) { const str = JSON.stringify(m); for (const [ws] of this.socketsOf(matchId)) this.send(ws, str); }
  }
  async tick() {
    if (!this.league) return;
    const now = Date.now();
    this.ensureLive(now);
    let committed = false;
    for (const [id, m] of [...this.live]) {
      m.advanceTo(now);
      const msgs = m.frames(now);
      if (this.socketsOf(id).length) this.cast(id, msgs);
      if (m.finished) {
        const res = m.commit();
        this.cast(id, [{ type: 'final', score: res.score }]);
        this.live.delete(id); delete (this.meta.live || {})[id]; committed = true;
      }
    }
    if (committed) {
      const r = this.mod.round(this.league);
      if (r && r.matches.every((f) => f.played)) {
        this.mod.finishRound(this.league);
        this.meta.rounds = (this.meta.rounds || 0) + 1;
        this.meta.notBefore = Date.now() + 60e3;
      }
      await this.save();
    } else if (this.metaDirty) { this.metaDirty = false; await this.saveMeta(); }
    await this.reschedule();
  }
  startTimer() { if (!this.timer) this.timer = setInterval(() => this.tick().catch(() => {}), TICK_MS); }
  stopTimerIfIdle() { if (!this.socks.size && this.timer) { clearInterval(this.timer); this.timer = null; } }
  async reschedule() {
    if (!this.league) return;
    const now = Date.now(), r = this.mod.round(this.league);
    if (!r) return;
    const openAt = this.roundStart() - OPEN_BEFORE_MS;
    await this.ctx.storage.setAlarm(this.live.size || now >= openAt ? now + ALARM_LIVE_MS : openAt);
  }
  async alarm() { await this.ready; await this.tick(); }

  // ---------- HTTP / WebSocket
  hello(matchId, club, now) {
    const r = this.mod.round(this.league), f = r?.matches.find((x) => x.id === matchId), lv = this.live.get(matchId);
    return { type: 'hello', teams: null, ...(lv ? lv.hello(club) : {}), startAt: this.roundStart(), now, status: f ? this.status(f, now) : 'final', fixtureType: r?.type, label: r?.label };
  }
  async fetch(req) {
    await this.ready;
    const url = new URL(req.url), path = url.pathname.slice(1);
    const uid = req.headers.get('x-uid'), club = req.headers.get('x-club') || '';
    if (path === 'init' && req.method === 'POST') {
      if (this.meta) return json({ ok: true });
      const b = await req.json();
      if (!MODS[b.module]) return json({ error: 'módulo no disponible' }, 400);
      this.mod = MODS[b.module];
      this.league = this.mod.create((Math.random() * 9e5 | 0) + 1);
      this.meta = { module: b.module, firstKickoff: +b.firstKickoff, everyMs: Math.max(60e3, +b.everyMs || 864e5), rounds: 0, gameplans: {}, live: {}, clubs: {}, chunks: 0 };
      await this.save(); await this.reschedule();
      return json({ ok: true, clubs: this.mod.clubs(this.league) });
    }
    if (!this.meta) return json({ error: 'liga sin inicializar' }, 404);
    if (path === 'clubs') return json({ clubs: this.mod.clubs(this.league) });
    if (path === 'state') return json(this.publicState());
    if (path === 'humans' && req.method === 'POST') { this.meta.clubs = await req.json(); await this.saveMeta(); return json({ ok: true }); }
    if (path === 'orders') {
      if (!club || this.meta.module !== 'nfl') return json({ error: 'sin club' }, 403);
      const { cleanGameplan } = await import('./nfl.js');
      if (req.method === 'GET') return json({ gameplan: this.meta.gameplans[club] || null });
      this.meta.gameplans[club] = cleanGameplan((await req.json()).gameplan);
      await this.saveMeta();
      return json({ ok: true });
    }
    if (path === 'ws') {
      if (req.headers.get('upgrade') !== 'websocket') return json({ error: 'ws' }, 426);
      const matchId = url.searchParams.get('match'), r = this.mod.round(this.league);
      if (!r?.matches.some((f) => f.id === matchId)) return json({ error: 'partido inexistente' }, 404);
      const pair = new WebSocketPair(), [cli, srv] = [pair[0], pair[1]];
      srv.accept();
      const a = { match: matchId, uid, club, last: 0 };
      this.socks.set(srv, a);
      srv.addEventListener('message', (ev) => this.onMsg(srv, a, ev.data));
      const drop = () => { this.socks.delete(srv); this.stopTimerIfIdle(); };
      srv.addEventListener('close', drop); srv.addEventListener('error', drop);
      this.greet(srv, a);
      this.startTimer(); this.tick().catch(() => {});
      return new Response(null, { status: 101, webSocket: cli });
    }
    return json({ error: 'not-found' }, 404);
  }
  greet(ws, a) {
    const now = Date.now();
    this.ensureLive(now);
    this.send(ws, this.hello(a.match, a.club, now));
    const lv = this.live.get(a.match);
    if (lv) for (const m of lv.full()) this.send(ws, m);
  }
  onMsg(ws, a, raw) {
    let d; try { d = JSON.parse(raw); } catch { return; }
    const now = Date.now(), lv = this.live.get(a.match);
    if (d.type === 'resync') return this.greet(ws, a);
    if (!lv) return;
    if (now - a.last < 300) return this.send(ws, { type: 'error', error: 'Muy rápido, esperá un instante' });
    const res = lv.onClient(a.club, d, now);
    if (!res) return;
    a.last = now;
    for (const m of res.reply || []) this.send(ws, m);
    if (res.broadcast) this.cast(a.match, res.broadcast);
    if (res.persist) { this.meta.live[a.match] = lv.persist(); this.saveMeta(); }
  }
}
