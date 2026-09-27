// Casino online (03-casino): una sola instancia compartida ("global") con la ruleta en vivo multijugador y el
// sportsbook (apuestas sobre los resultados de fútbol/básquet/NFL). El saldo es del servidor (tabla D1
// casino_wallet), separado del silver local del hub: es la ficha con la que se juega en las mesas compartidas.
// Las victorias grandes se anuncian en el chat global llamando a ChatDO.announce (server/src/chat-do.js).
import { DurableObject } from 'cloudflare:workers';

const json = (o, status = 200) => Response.json(o, { status });
const START_BALANCE = 5000;
const BET_MS = 18000;      // ventana para apostar en la ruleta
const SPIN_MS = 4000;      // tiempo de giro visual antes de mostrar el resultado
const TICK_MS = 250;
const BIG_WIN = 2000;      // a partir de esta ganancia neta se anuncia en el chat global
const MIN_BET = 1, MAX_BET = 2000;
const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const SPORT_MODULES = new Set(['futbol', 'basquet', 'nfl']);   // módulos con partidos de 2 lados (home/away) aptos para el sportsbook
const ODDS = { home: 1.8, away: 1.8, draw: 3 };

export class CasinoDO extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.socks = new Map();       // ws -> { uid, name }
    this.wallets = new Map();     // uid -> balance (cache; la fuente de verdad es D1, se escribe en cada cambio)
    this.round = null;            // ruleta: { phase:'betting'|'spinning', endsAt, bets: Map<uid,{name,bets:[]}>, number }
    this.timer = null;
    this.leaderboard = [];
    this.leaderboardAt = 0;
  }

  // ---------- saldo (D1)
  async loadWallet(uid) {
    if (this.wallets.has(uid)) return this.wallets.get(uid);
    const row = await this.env.DB.prepare('SELECT balance FROM casino_wallet WHERE user=?').bind(uid).first();
    let bal = row ? row.balance : null;
    if (bal == null) { bal = START_BALANCE; await this.env.DB.prepare('INSERT OR IGNORE INTO casino_wallet (user,balance,updated) VALUES (?,?,?)').bind(uid, bal, Date.now()).run(); }
    this.wallets.set(uid, bal);
    return bal;
  }
  async addBalance(uid, delta, won = 0, bigWin = false) {
    const bal = Math.max(0, (this.wallets.get(uid) ?? await this.loadWallet(uid)) + delta);
    this.wallets.set(uid, bal);
    await this.env.DB.prepare('UPDATE casino_wallet SET balance=?, won_total=won_total+?, big_wins=big_wins+?, updated=? WHERE user=?').bind(bal, Math.max(0, won), bigWin ? 1 : 0, Date.now(), uid).run();
    return bal;
  }

  // ---------- ruleta en vivo
  ensureRound(now) {
    if (this.round) return;
    this.round = { phase: 'betting', endsAt: now + BET_MS, bets: new Map(), number: null };
  }
  payoutFor(pick, n) {
    if (n === 0) return pick.type === 'number' && pick.value === 0 ? 35 : 0;
    if (pick.type === 'number') return pick.value === n ? 35 : 0;
    if (pick.type === 'color') return (pick.value === 'red') === RED.has(n) ? 1 : 0;
    if (pick.type === 'parity') return (pick.value === 'even') === (n % 2 === 0) ? 1 : 0;
    if (pick.type === 'half') return (pick.value === 'low' ? n <= 18 : n >= 19) ? 1 : 0;
    return 0;
  }
  async resolveRound(now) {
    const r = this.round, n = crypto.getRandomValues(new Uint32Array(1))[0] % 37;
    r.number = n; r.phase = 'spinning'; r.endsAt = now + SPIN_MS;
    this.cast({ type: 'spin', number: n });
    for (const [uid, entry] of r.bets) {
      let staked = 0, ret = 0;
      for (const b of entry.bets) { staked += b.amount; const mult = this.payoutFor(b.pick, n); if (mult) ret += b.amount * (mult + 1); }
      if (ret > 0) {
        const net = ret - staked, big = net >= BIG_WIN;
        await this.addBalance(uid, ret, Math.max(0, net), big);
        this.send([...this.socks].find(([, a]) => a.uid === uid)?.[0], { type: 'settle', game: 'roulette', payout: ret, net, balance: this.wallets.get(uid) });
        if (big) this.announceBigWin(entry.name, 'la ruleta', net);
      }
    }
  }
  roundView(now) {
    const r = this.round; if (!r) return null;
    return { phase: r.phase, msLeft: Math.max(0, r.endsAt - now), number: r.number, players: [...r.bets.values()].map((e) => ({ name: e.name, total: e.bets.reduce((a, b) => a + b.amount, 0) })) };
  }

  // ---------- sportsbook (futbol / basquet / nfl: apuesta a que gana el local, el visitante o empate)
  async placeSportsbet(a, d) {
    const module = String(d.module || ''), league = String(d.league || ''), match = String(d.match || ''), side = String(d.side || '');
    if (!SPORT_MODULES.has(module) || !league || !match || !['home', 'away', 'draw'].includes(side)) return { ok: false, reason: 'Apuesta inválida' };
    const amount = Math.floor(+d.amount); if (!Number.isFinite(amount) || amount < MIN_BET || amount > MAX_BET) return { ok: false, reason: 'Monto inválido' };
    const bal = await this.loadWallet(a.uid); if (bal < amount) return { ok: false, reason: 'Saldo insuficiente' };
    const stub = this.env.LEAGUE.get(this.env.LEAGUE.idFromName(league));
    const st = await (await stub.fetch('https://do/state')).json().catch(() => null);
    const fx = st && st.matches && st.matches.find((m) => m.id === match);
    if (!fx) return { ok: false, reason: 'Partido inexistente' };
    if (fx.status === 'final') return { ok: false, reason: 'Ese partido ya terminó' };
    await this.addBalance(a.uid, -amount);
    const id = 'sb' + Date.now() + Math.random().toString(36).slice(2, 8);
    await this.env.DB.prepare('INSERT INTO casino_sportsbets (id,user,name,league,module,match,side,amount,odds,status,payout,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
      .bind(id, a.uid, a.name, league, module, match, side, amount, ODDS[side], 'pending', 0, Date.now()).run();
    return { ok: true, id, balance: this.wallets.get(a.uid) };
  }
  async settleSportsbets() {
    const { results } = await this.env.DB.prepare("SELECT DISTINCT league, module FROM casino_sportsbets WHERE status='pending'").all();
    for (const { league } of results || []) {
      const stub = this.env.LEAGUE.get(this.env.LEAGUE.idFromName(league));
      const st = await (await stub.fetch('https://do/state')).json().catch(() => null); if (!st) continue;
      const finals = new Map((st.matches || []).filter((m) => m.status === 'final' && m.score).map((m) => [m.id, m.score]));
      if (!finals.size) continue;
      const { results: bets } = await this.env.DB.prepare("SELECT * FROM casino_sportsbets WHERE league=? AND status='pending'").bind(league).all();
      for (const b of bets || []) {
        const score = finals.get(b.match); if (!score) continue;
        const winSide = score[0] === score[1] ? 'draw' : score[0] > score[1] ? 'home' : 'away';
        const won = winSide === b.side, payout = won ? Math.round(b.amount * (1 + b.odds)) : 0;
        await this.env.DB.prepare("UPDATE casino_sportsbets SET status='settled', payout=? WHERE id=?").bind(payout, b.id).run();
        if (payout > 0) {
          const net = payout - b.amount, big = net >= BIG_WIN;
          await this.addBalance(b.user, payout, Math.max(0, net), big);
          this.send([...this.socks].find(([, a]) => a.uid === b.user)?.[0], { type: 'settle', game: 'sports', payout, net, balance: this.wallets.get(b.user) });
          if (big) this.announceBigWin(b.name, 'el sportsbook', net);
        }
      }
    }
  }
  async myBets(uid) {
    const { results } = await this.env.DB.prepare('SELECT id,league,module,match,side,amount,odds,status,payout FROM casino_sportsbets WHERE user=? ORDER BY created DESC LIMIT 30').bind(uid).all();
    return results || [];
  }

  // ---------- ranking (torneo del club: quién ganó más en el casino)
  async loadLeaderboard(now) {
    if (now - this.leaderboardAt < 15000) return this.leaderboard;
    const { results } = await this.env.DB.prepare('SELECT u.name, w.won_total, w.big_wins FROM casino_wallet w JOIN users u ON u.id=w.user ORDER BY w.won_total DESC LIMIT 10').all();
    this.leaderboard = results || []; this.leaderboardAt = now;
    return this.leaderboard;
  }

  // ---------- anuncio global (mientras alguien está en el casino y también en el chat de todos)
  announceBigWin(name, where, net) {
    const text = `🎰 ${name} acaba de ganar $${Math.round(net).toLocaleString('es-AR')} en ${where}.`;
    this.cast({ type: 'bigwin', name, where, net, text });
    const stub = this.env.CHAT.get(this.env.CHAT.idFromName('global'));
    stub.fetch('https://do/announce', { method: 'POST', body: JSON.stringify({ text }) }).catch(() => {});
  }

  // ---------- sockets
  send(ws, msg) { if (!ws) return; try { ws.send(JSON.stringify(msg)); } catch { this.socks.delete(ws); } }
  cast(msg) { const s = JSON.stringify(msg); for (const [ws] of this.socks) try { ws.send(s); } catch { this.socks.delete(ws); } }
  async hello(ws, a) {
    const now = Date.now();
    this.send(ws, { type: 'hello', balance: await this.loadWallet(a.uid), roulette: this.roundView(now), leaderboard: await this.loadLeaderboard(now), bets: await this.myBets(a.uid) });
  }
  async tick() {
    const now = Date.now();
    this.ensureRound(now);
    if (this.round.phase === 'betting' && now >= this.round.endsAt) await this.resolveRound(now);
    else if (this.round.phase === 'spinning' && now >= this.round.endsAt) { this.round = { phase: 'betting', endsAt: now + BET_MS, bets: new Map(), number: null }; this.cast({ type: 'round', roulette: this.roundView(now) }); }
    if (now % 4000 < TICK_MS) await this.settleSportsbets().catch(() => {});
  }
  startTimer() { if (!this.timer) this.timer = setInterval(() => this.tick().catch(() => {}), TICK_MS); }
  stopIfIdle() { if (!this.socks.size && this.timer) { clearInterval(this.timer); this.timer = null; } }

  async onMsg(ws, a, raw) {
    let d; try { d = JSON.parse(raw); } catch { return; }
    const now = Date.now();
    if (d.type === 'bet') {
      const r = this.round;
      if (!r || r.phase !== 'betting') return this.send(ws, { type: 'error', error: 'La ronda ya cerró' });
      const amount = Math.floor(+d.amount);
      const pick = d.pick && ['number', 'color', 'parity', 'half'].includes(d.pick.type) ? d.pick : null;
      if (!pick || !Number.isFinite(amount) || amount < MIN_BET || amount > MAX_BET) return this.send(ws, { type: 'error', error: 'Apuesta inválida' });
      if (pick.type === 'number' && (!Number.isInteger(pick.value) || pick.value < 0 || pick.value > 36)) return this.send(ws, { type: 'error', error: 'Número inválido' });
      const bal = await this.loadWallet(a.uid); if (bal < amount) return this.send(ws, { type: 'error', error: 'Saldo insuficiente' });
      await this.addBalance(a.uid, -amount);
      const entry = r.bets.get(a.uid) || { name: a.name, bets: [] }; entry.bets.push({ amount, pick }); r.bets.set(a.uid, entry);
      this.send(ws, { type: 'ack', balance: this.wallets.get(a.uid) });
      this.cast({ type: 'round', roulette: this.roundView(now) });
      return;
    }
    if (d.type === 'sportsbet') { const res = await this.placeSportsbet(a, d); return this.send(ws, Object.assign({ type: 'sportsbetResult' }, res)); }
    if (d.type === 'state') return this.hello(ws, a);
  }

  async fetch(req) {
    const url = new URL(req.url), path = url.pathname.slice(1);
    if (path === 'leaderboard') return json({ leaderboard: await this.loadLeaderboard(Date.now()) });
    if (path !== 'ws') return json({ error: 'not-found' }, 404);
    if (req.headers.get('upgrade') !== 'websocket') return json({ error: 'ws' }, 426);
    const uid = req.headers.get('x-uid'), name = req.headers.get('x-name') || 'Jugador';
    if (!uid) return json({ error: 'sin sesion' }, 403);
    const pair = new WebSocketPair(), [cli, srv] = [pair[0], pair[1]];
    srv.accept();
    const a = { uid, name: name.slice(0, 40) };
    this.socks.set(srv, a);
    srv.addEventListener('message', (ev) => this.onMsg(srv, a, ev.data).catch(() => {}));
    const drop = () => { this.socks.delete(srv); this.stopIfIdle(); };
    srv.addEventListener('close', drop); srv.addEventListener('error', drop);
    this.startTimer(); this.tick().catch(() => {});
    await this.hello(srv, a);
    return new Response(null, { status: 101, webSocket: cli });
  }
}
