// Adaptador del módulo 04 (MMA / LLO): liga de 8 cuadras (gimnasios). Cada humano dirige una cuadra con 4 peleadores (táctica, campamento,
// mercado de peleadores, traspasos entre DT) y cada cartelera pone a todos los peleadores a pelear a la vez, en vivo por "lockstep" con
// el simulador Hs empaquetado por server/tools/build-mma.mjs.
import { Hs, dl, La, fighterFromRoster, $t } from './vendor/mma-core.js';
import { Lockstep, cleanAction, LEAD_STEPS, snapOf } from '../../04-mma/online/lockstep.mjs';
import { setHumans, exportState, command, afterRound, DIVS, PROGRAMS } from './mma-manage.js';

const PER_DIV = 4, ROUNDS = 3, ROUND_SECONDS = 300;
export const GYMS = [['Dragon Team', '#c0392b'], ['Hierro Norte', '#5d6d7e'], ['Iron Coast', '#1f7a8c'], ['Lobos Gym', '#7d6608'], ['Team Tempest', '#6c3483'], ['Fénix MMA', '#d35400'], ['Casa Roja', '#a93226'], ['Vértice', '#1e8449']];
const fmt = (sec) => { sec = Math.max(0, Math.ceil(sec)); return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; };
const name = (p) => `${p.firstName} ${p.lastName}`;
const pubFighter = (p) => ({ id: p.id, name: name(p), short: p.lastName.slice(0, 3).toUpperCase(), city: p.country, mascot: p.nickname, color: '#b4382e', dark: '#2a5fa8', crest: p.photo || '' });
const pubStable = (s) => ({ id: s.id, name: s.name, short: s.name.split(' ')[0].slice(0, 3).toUpperCase(), city: '', mascot: s.name, color: s.color, dark: s.color, crest: '' });
const fighter = (g, id) => g.fighters.find((f) => f.id === id);
const stableOf = (g, fid) => fighter(g, fid).stable;
const eventOf = (g) => g.evs.find((e) => e.n === g.event);

// parejas por división, mezcladas con la semilla de la liga (mismo resultado siempre); se evita que peleen dos de la misma cuadra
function pairEvent(g, n) {
  const rng = new La((g.seed * 7919 + n * 104729) >>> 0), bouts = [];
  for (const d of DIVS) {
    const ids = g.fighters.filter((f) => f.division === d && !f.retired).map((f) => f.id);
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rng.next() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    for (let i = 0; i + 1 < ids.length; i += 2) {
      if (stableOf(g, ids[i]) === stableOf(g, ids[i + 1])) { const j = ids.findIndex((x, k) => k > i + 1 && stableOf(g, x) !== stableOf(g, ids[i])); if (j > 0) [ids[i + 1], ids[j]] = [ids[j], ids[i + 1]]; }
      bouts.push({ id: `e${n}_${bouts.length}`, a: ids[i], b: ids[i + 1], div: d, played: false, res: null });
    }
  }
  return { n, bouts };
}

class MmaLive {
  constructor(g, matchId, startAt, extras = {}, now = startAt) {
    this.g = g; this.bout = eventOf(g).bouts.find((b) => b.id === matchId);
    if (!this.bout) throw new Error('partido inexistente');
    this.cfg = extras.cfg || { profiles: [structuredClone(fighter(g, this.bout.a)), structuredClone(fighter(g, this.bout.b))], seed: ((g.seed * 31 + g.event * 977 + +matchId.split('_')[1] * 13) % 1e9) + 1, rounds: ROUNDS, roundSeconds: ROUND_SECONDS };
    this.sim = new Hs(this.cfg.profiles, { seed: this.cfg.seed, rounds: this.cfg.rounds, roundSeconds: this.cfg.roundSeconds });
    this.startAt = startAt;
    this.ls = new Lockstep(this.sim, startAt, extras.actions || []);
    this.advanceTo(now);
  }
  get finished() { return this.ls.finished; }
  get held() { return this.ls.hold; }
  advanceTo(now) { for (let i = 0; i < 100 && this.ls.advanceTo(now); i++); }
  // el DT es el de la cuadra del peleador (una cuadra no pelea contra sí misma)
  teamIdx(club) { const A = this.cfg.profiles[0].stable, B = this.cfg.profiles[1].stable; return A === club ? 0 : B === club ? 1 : -1; }
  hud() {
    const s = this.sim, pts = [0, 1].map((k) => s.cards.reduce((t, r) => t + r.reduce((u, c) => u + c[k], 0), 0) / Math.max(1, s.cards.length));
    return { q: s.round, time: fmt(s.phase === 'break' ? s.breakTime : s.clock), score: pts.map((x) => Math.round(x)), state: s.phase, health: s.fighters.map((f) => Math.round(f.health)) };
  }
  hello(club) {
    const side = this.teamIdx(club);
    return { module: 'mma', cfg: this.cfg, actions: this.ls.actions, side, canTactic: side >= 0, userIndex: side, teams: this.cfg.profiles.map(pubFighter) };
  }
  frames() { return this.ls.newSigs.splice(0).map(({ step, sig }) => ({ type: 'sync', step, sig })); }
  snapNow() { return { type: 'snap', step: this.ls.step, snap: snapOf(this.sim), st: this.ls.state() }; }
  full() { return []; }
  onClient(club, msg, now) {
    if (msg.type === 'snap') { this.advanceTo(now); return { reply: [this.snapNow()] }; }
    if (msg.type !== 'act') return null;
    const side = this.teamIdx(club), a = side >= 0 ? cleanAction(side, msg.a) : null;
    if (!a) return { reply: [{ type: 'error', error: side < 0 ? 'No sos la esquina de este combate' : 'Orden no válida' }] };
    this.advanceTo(now);
    a.step = this.ls.step + LEAD_STEPS;
    this.ls.addAction(a);
    return { broadcast: [{ type: 'action', a }], persist: true };
  }
  persist() { return { cfg: this.cfg, actions: this.ls.actions }; }
  commit() {
    const r = this.sim.result; this.bout.played = true;
    this.bout.res = { winner: r.winner === null ? null : r.winnerId, method: r.method, round: r.round, time: Math.round(r.time), seed: r.seed };
    return { score: r.winner === null ? [0, 0] : r.winner === 0 ? [1, 0] : [0, 1] };
  }
}

const scoreOf = (b) => (b.res ? (b.res.winner === null ? [0, 0] : b.res.winner === b.a ? [1, 0] : [0, 1]) : null);
const bout2match = (g, b) => {
  const A = fighter(g, b.a), B = fighter(g, b.b), sa = A.stable, sb = B.stable;
  return { id: b.id, home: sa, away: sb, entrants: [sa, sb], title: `${name(A)} vs ${name(B)} · ${DIV_LABEL[b.div] || b.div}`, played: b.played, score: scoreOf(b), method: b.res && b.res.method, type: 'event', div: b.div };
};
const DIV_LABEL = { fly: 'Mosca', bantam: 'Gallo', feather: 'Pluma', light: 'Ligero', welter: 'Wélter', middle: 'Mediano', lightheavy: 'Semipesado', heavy: 'Pesado' };

export const mma = {
  id: 'mma',
  create(seed) {
    const all = dl(), fighters = [], stables = GYMS.map(([n, color], i) => ({ id: 's' + i, name: n, color, money: 65000, roster: [], w: 0, l: 0, d: 0 }));
    DIVS.forEach((d, di) => {
      all.filter((f) => f.division === d).sort((x, y) => y.rating - x.rating).slice(0, PER_DIV).forEach((f, j) => {
        const st = stables[(di + 2 * j) % 8]; f.stable = st.id; f.program = null; f.lw = f.ll = 0; fighters.push(f); st.roster.push(f.id);
      });
    });
    const R = globalThis.LLO_ROSTER, taken = new Set(fighters.map((f) => f.rosterId));
    const market = R.pool.filter((e) => !taken.has(e.id)).slice(0, 60).map((e, i) => { const f = fighterFromRoster(e, 'm' + i); f.stable = null; f.program = null; return f; });
    const g = { v: 2, seed, event: 0, fighters, stables, market, evs: [], done: [], humans: [], tradeProps: [], tradeSeq: 0 };
    g.evs.push(pairEvent(g, 0));
    return g;
  },
  load: (json) => JSON.parse(json),
  serialize: (g) => JSON.stringify(g),
  clubs: (g) => g.stables.map((s) => s.id),
  teams: (g) => g.stables.map(pubStable),
  standings: (g) => [...g.stables].sort((x, y) => y.w - x.w || x.l - y.l || y.money - x.money)
    .map((s, i) => ({ id: s.id, rank: i + 1, w: s.w, l: s.l, t: s.d, diff: s.w * 3 + s.d, cols: ['V', 'D', 'E', 'Pts'] })),
  round(g) {
    const e = eventOf(g); if (!e) return null;
    return { label: `Cartelera ${e.n + 1}`, year: 2026, phase: 'regular', type: 'event', matches: e.bouts.map((b) => bout2match(g, b)) };
  },
  finishRound(g) {
    const e = eventOf(g);
    for (const b of e.bouts) {
      const A = fighter(g, b.a), B = fighter(g, b.b), w = b.res && b.res.winner, SA = g.stables.find((s) => s.id === A.stable), SB = g.stables.find((s) => s.id === B.stable);
      if (!w) { A.record.draws++; B.record.draws++; A.streak = B.streak = 0; SA.d++; SB.d++; SA.money += 4000; SB.money += 4000; }
      else { const W = w === b.a ? A : B, Lo = w === b.a ? B : A, SW = W === A ? SA : SB, SL = W === A ? SB : SA; W.record.wins++; Lo.record.losses++; W.lw++; Lo.ll++; W.rating += 18; Lo.rating -= 18; W.streak = Math.max(1, W.streak + 1); Lo.streak = Math.min(-1, Lo.streak - 1); SW.w++; SL.l++; SW.money += 8000; SL.money += 3000; }
      g.done.push({ id: b.id, week: e.n + 1, home: A.stable, away: B.stable, score: !w ? [0, 0] : w === b.a ? [1, 0] : [0, 1], text: `${name(A)} vs ${name(B)}: ${!w ? 'empate' : 'gana ' + name(w === b.a ? A : B)} (${b.res && b.res.method})`, method: b.res && b.res.method });
    }
    afterRound(g);
    g.event++; g.evs.push(pairEvent(g, g.event));
    g.evs = g.evs.slice(-2); g.done = g.done.slice(-80);
  },
  results: (g) => g.done.slice(-40),
  makeLive: (g, matchId, startAt, extras, now) => new MmaLive(g, matchId, startAt, extras, now),
  setHumans, exportState, command,
};
export { PROGRAMS };
