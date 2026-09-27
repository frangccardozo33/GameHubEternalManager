// Una instancia por liga. Guarda el estado de la liga, corre los partidos en vivo por reloj real y los transmite por WebSocket.
// La lógica de cada deporte vive en un adaptador (nfl.js, basquet.js, ...; ver mods.js) con una interfaz común.
import { DurableObject } from 'cloudflare:workers';
import { MODS } from './mods.js';
import { PRE_MS, POST_MS, slotOf, firstDay, orderMatches } from './schedule.js';

const CHUNK = 400000;
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
    if (this.mod.setHumans) this.mod.setHumans(this.league, Object.keys(this.meta.clubs || {}));
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

  // ---------- calendario (ver schedule.js): una jornada por día, a la hora del módulo; los partidos de la jornada van en cola, uno atrás del otro
  preMs() { return this.meta.preMs ?? PRE_MS[this.meta.module] ?? 200e3; }
  plannedStart() {
    const m = this.meta, r = m.rounds || 0;
    m.day0 ??= firstDay(m.module, m.firstKickoff);
    const base = m.fast ? m.firstKickoff + r * m.everyMs : slotOf(m.module, m.day0 + r);
    return Math.max(base, m.notBefore || 0);
  }
  // cola de la jornada actual: primero los partidos entre dos DT humanos, después DT contra IA, al final IA contra IA
  plan() {
    const m = this.meta, r = this.mod.round(this.league); if (!r) return null;
    if (!m.q || m.q.round !== (m.rounds || 0)) { m.q = { round: m.rounds || 0, order: orderMatches(r.matches, Object.keys(m.clubs || {})), idx: 0, openAt: this.plannedStart() }; this.metaDirty = true; }
    return m.q;
  }
  cur() {
    const q = this.meta.q; if (!q || q.round !== (this.meta.rounds || 0)) return null;
    const id = q.order[q.idx]; return id ? { id, openAt: q.openAt, kickoff: q.openAt + this.preMs() } : null;
  }
  roundStart() { const q = this.meta.q; return q && q.round === (this.meta.rounds || 0) ? q.openAt : this.plannedStart(); }   // apertura de la transmisión del partido en curso (o del primero de la jornada)
  status(m, now) {
    if (m.played) return 'final';
    const lv = this.live.get(m.id); if (lv && lv.finished) return 'final';
    const c = this.cur(); if (c && c.id === m.id) return now >= c.kickoff ? 'live' : now >= c.openAt ? 'open' : 'scheduled';
    return 'queued';
  }
  publicState(now = Date.now()) {
    const mod = this.mod, r = mod.round(this.league), q = r ? this.plan() : null, c = this.cur(), st = r ? this.roundStart() : null;
    return {
      module: this.meta.module, year: r?.year ?? null, phase: r?.phase ?? null, week: this.meta.rounds || 0, label: r?.label || null, startAt: st, now,
      teams: mod.teams(this.league), clubs: this.meta.clubs || {},
      matches: r ? r.matches.map((f) => ({ ...f, startAt: c && c.id === f.id ? c.kickoff : null, openAt: c && c.id === f.id ? c.openAt : null, order: q ? q.order.indexOf(f.id) + 1 || null : null, status: this.status(f, now), hud: this.live.get(f.id)?.hud() || null, viewers: [...this.socks.values()].filter((a) => a.match === f.id).length })) : [],
      results: mod.results(this.league), standings: mod.standings(this.league),
    };
  }

  // ---------- ciclo de vida de partidos: solo el partido en curso tiene motor; al terminar se abre la transmisión del siguiente
  ensureLive(now) {
    const r = this.mod.round(this.league); if (!r) return;
    const q = this.plan(); if (!q) return;
    while (q.idx < q.order.length && r.matches.find((f) => f.id === q.order[q.idx])?.played) { q.idx++; this.metaDirty = true; }   // ya jugado (p. ej. tras un reinicio)
    const c = this.cur(); if (!c || this.live.has(c.id) || now < c.openAt) return;
    const saved = (this.meta.live ||= {})[c.id] || {};
    const lv = this.mod.makeLive(this.league, c.id, c.kickoff, { ...saved, gameplans: this.meta.gameplans || {} }, now);
    this.live.set(c.id, lv);
    this.meta.live[c.id] = lv.persist(); this.metaDirty = true;
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
    const rd = this.mod.round(this.league);
    if (rd && rd.type === 'draft' && this.mod.tickLeague) { // draft online: sin partidos, turnos con reloj
      if (now >= this.roundStart()) {
        const t = this.mod.tickLeague(this.league, now); let dirty = t.changed;
        if (t.done) { this.mod.finishRound(this.league); this.meta.rounds = (this.meta.rounds || 0) + 1; this.meta.notBefore = Date.now() + POST_MS; dirty = true; }
        if (dirty) { this.meta.rev = (this.meta.rev || 0) + 1; await this.save(); }
      }
      await this.reschedule(); return;
    }
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
      this.meta.rev = (this.meta.rev || 0) + 1;
      const q = this.meta.q, r = this.mod.round(this.league);
      if (q) { q.idx++; q.openAt = Date.now() + POST_MS; }   // apenas termina, empieza la transmisión del siguiente
      if (r && r.matches.every((f) => f.played)) {
        this.mod.finishRound(this.league);
        this.meta.rounds = (this.meta.rounds || 0) + 1;
        this.meta.notBefore = Date.now() + POST_MS;
        this.meta.q = null;
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
    const c = this.cur(), openAt = c ? c.openAt : this.plannedStart();
    await this.ctx.storage.setAlarm(this.live.size || now >= openAt ? now + ALARM_LIVE_MS : openAt);
  }
  async alarm() { await this.ready; await this.tick(); }

  // ---------- HTTP / WebSocket
  hello(matchId, club, now) {
    const r = this.mod.round(this.league), f = r?.matches.find((x) => x.id === matchId), lv = this.live.get(matchId);
    return { type: 'hello', teams: null, ...(lv ? lv.hello(club) : {}), startAt: (this.cur() && this.cur().id === matchId) ? this.cur().kickoff : null, now, status: f ? this.status(f, now) : 'final', fixtureType: r?.type, label: r?.label };
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
      this.meta = { module: b.module, firstKickoff: +b.firstKickoff, everyMs: Math.max(1e3, +b.everyMs || 864e5), fast: !!b.fast, preMs: b.preMs || undefined, day0: firstDay(b.module, +b.firstKickoff), rounds: 0, gameplans: {}, live: {}, clubs: {}, chunks: 0 };
      await this.save(); await this.reschedule();
      return json({ ok: true, clubs: this.mod.clubs(this.league) });
    }
    if (!this.meta) return json({ error: 'liga sin inicializar' }, 404);
    if (path === 'clubs') return json({ clubs: this.mod.clubs(this.league) });
    if (path === 'state') return json(this.publicState());
    if (path === 'humans' && req.method === 'POST') {
      this.meta.clubs = await req.json();
      if (this.mod.setHumans) { this.mod.setHumans(this.league, Object.keys(this.meta.clubs)); this.meta.rev = (this.meta.rev || 0) + 1; await this.save(); } else await this.saveMeta();
      return json({ ok: true });
    }
    // ---- gestión del club (mercado, plantel, tácticas previas): el cliente trabaja sobre una copia y manda órdenes que el servidor valida y aplica
    if (path === 'rev') return json({ rev: this.meta.rev || 0, now: Date.now() });
    if (path === 'career') {
      if (!club) return json({ error: 'sin club' }, 403);
      if (!this.mod.exportState) return json({ error: 'este módulo no tiene gestión online' }, 404);
      const st = this.mod.exportState(this.league, club);
      return new Response(`{"rev":${this.meta.rev || 0},"club":${JSON.stringify(club)},"now":${Date.now()},"startAt":${this.roundStart()},"state":${typeof st === 'string' ? st : JSON.stringify(st)}}`, { headers: { 'content-type': 'application/json' } });
    }
    if (path === 'cmd' && req.method === 'POST') {
      if (!club) return json({ error: 'sin club' }, 403);
      if (!this.mod.command) return json({ error: 'este módulo no tiene gestión online' }, 404);
      const now = Date.now(), body = await req.json();
      const locked = [...this.live.values()].some((lv) => lv.teamIdx && lv.teamIdx(club) >= 0);
      let res;
      try { res = this.mod.command(this.league, club, body, { now, locked, roundStart: this.roundStart() }); } catch (e) { return json({ ok: false, reason: String(e && e.message || e) }); }
      if (res && res.mutated) { this.meta.rev = (this.meta.rev || 0) + 1; await this.save(); }
      return json({ ok: !res || res.ok !== false, ...(res || {}), rev: this.meta.rev || 0 });
    }
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
