// Adaptador del módulo 04 (MMA / LLO): liga de peleadores (cada humano dirige uno) + combate en vivo por "lockstep"
// con el simulador Hs empaquetado por server/tools/build-mma.mjs. Cada "jornada" es una cartelera con todos los combates a la vez.
import { Hs, dl, La } from './vendor/mma-core.js';
import { Lockstep, cleanAction, LEAD_STEPS } from '../../04-mma/online/lockstep.mjs';

const PER_DIV = 4, ROUNDS = 3, ROUND_SECONDS = 300;
const fmt = (sec) => { sec = Math.max(0, Math.ceil(sec)); return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; };
const name = (p) => `${p.firstName} ${p.lastName}`;
const pub = (p) => ({ id: p.id, name: name(p), short: p.lastName.slice(0, 3).toUpperCase(), city: p.country, mascot: p.nickname, color: '#b4382e', dark: '#2a5fa8', crest: p.photo || '' });
const fighter = (g, id) => g.fighters.find((f) => f.id === id);
const eventOf = (g) => g.evs.find((e) => e.n === g.event);

function pairEvent(g, n) { // parejas por división, mezcladas con la semilla de la liga (mismo resultado siempre)
  const rng = new La((g.seed * 7919 + n * 104729) >>> 0), bouts = [];
  const divs = [...new Set(g.fighters.map((f) => f.division))];
  for (const d of divs) {
    const ids = g.fighters.filter((f) => f.division === d && !f.retired).map((f) => f.id);
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rng.next() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    for (let i = 0; i + 1 < ids.length; i += 2) bouts.push({ id: `e${n}_${bouts.length}`, a: ids[i], b: ids[i + 1], div: d, played: false, res: null });
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
  teamIdx(club) { return this.bout.a === club ? 0 : this.bout.b === club ? 1 : -1; }
  hud() {
    const s = this.sim, pts = [0, 1].map((k) => s.cards.reduce((t, r) => t + r.reduce((u, c) => u + c[k], 0), 0) / Math.max(1, s.cards.length));
    return { q: s.round, time: fmt(s.phase === 'break' ? s.breakTime : s.clock), score: pts.map((x) => Math.round(x)), state: s.phase, health: s.fighters.map((f) => Math.round(f.health)) };
  }
  hello(club) {
    const side = this.teamIdx(club);
    return { module: 'mma', cfg: this.cfg, actions: this.ls.actions, side, canTactic: side >= 0, userIndex: side, teams: this.cfg.profiles.map(pub) };
  }
  frames() { return this.ls.newSigs.splice(0).map(({ step, sig }) => ({ type: 'sync', step, sig })); }
  snapNow() { return { type: 'snap', step: this.ls.step, snap: snapOfSim(this.sim), st: this.ls.state() }; }
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
import { snapOf } from '../../04-mma/online/lockstep.mjs';
const snapOfSim = (s) => snapOf(s);

export const mma = {
  id: 'mma',
  create(seed) {
    const all = dl(), fighters = [];
    for (const d of [...new Set(all.map((f) => f.division))]) fighters.push(...all.filter((f) => f.division === d).sort((x, y) => y.rating - x.rating).slice(0, PER_DIV));
    const g = { v: 1, seed, event: 0, fighters, evs: [], done: [] };
    g.evs.push(pairEvent(g, 0));
    return g;
  },
  load: (json) => JSON.parse(json),
  serialize: (g) => JSON.stringify(g),
  clubs: (g) => g.fighters.map((f) => f.id),
  teams: (g) => g.fighters.map(pub),
  standings: (g) => [...g.fighters].sort((x, y) => y.record.wins - x.record.wins || x.record.losses - y.record.losses || y.rating - x.rating)
    .map((f, i) => ({ id: f.id, rank: i + 1, w: f.record.wins, l: f.record.losses, t: f.record.draws, diff: f.rating })),
  round(g) {
    const e = eventOf(g); if (!e) return null;
    return { label: `Cartelera ${e.n + 1}`, year: 2026, phase: 'regular', type: 'event', matches: e.bouts.map((b) => ({ id: b.id, home: b.a, away: b.b, played: b.played, score: b.res ? (b.res.winner === null ? [0, 0] : b.res.winner === b.a ? [1, 0] : [0, 1]) : null, type: 'event', div: b.div, method: b.res && b.res.method })) };
  },
  finishRound(g) {
    const e = eventOf(g);
    for (const b of e.bouts) {
      const A = fighter(g, b.a), B = fighter(g, b.b), w = b.res && b.res.winner;
      if (!w) { A.record.draws++; B.record.draws++; A.streak = B.streak = 0; }
      else { const W = w === b.a ? A : B, Lo = w === b.a ? B : A; W.record.wins++; Lo.record.losses++; W.rating += 18; Lo.rating -= 18; W.streak = Math.max(1, W.streak + 1); Lo.streak = Math.min(-1, Lo.streak - 1); }
      g.done.push({ id: b.id, week: e.n + 1, home: b.a, away: b.b, score: !w ? [0, 0] : w === b.a ? [1, 0] : [0, 1], method: b.res && b.res.method });
    }
    g.event++; g.evs.push(pairEvent(g, g.event));
    g.evs = g.evs.slice(-2); g.done = g.done.slice(-80);
  },
  results: (g) => g.done.slice(-40),
  makeLive: (g, matchId, startAt, extras, now) => new MmaLive(g, matchId, startAt, extras, now),
};
