// Adaptador del módulo 05 (Básquet): liga compartida + partido en vivo por "lockstep" (ver 05.../src/online/lockstep.js).
import { Game } from '../../05-basquet-courtside/src/manager/game.js';
import { buildSim, Lockstep, cleanAction, LEAD_STEPS } from '../../05-basquet-courtside/src/online/lockstep.js';

const fmtClock = (sec) => { sec = Math.max(0, sec); if (sec < 60) return sec.toFixed(1).padStart(4, '0'); return `${String(Math.floor(Math.ceil(sec) / 60)).padStart(2, '0')}:${String(Math.ceil(sec) % 60).padStart(2, '0')}`; };
const pub = (t) => ({ id: String(t.id), name: t.name, short: t.short, city: t.city, mascot: t.nick, color: t.color, dark: t.alt || t.color, crest: t.crest });

class BasketLive {
  constructor(g, matchId, startAt, extras = {}, now = startAt) {
    this.g = g; this.entry = g.currentDay().entries.find((e) => e.id === matchId);
    if (!this.entry) throw new Error('partido inexistente');
    const home = g.team(this.entry.home), away = g.team(this.entry.away);
    this.init = extras.init || { seed: Math.floor(g.rng.next() * 1e9) + 1, rules: { periodSeconds: g.cfg.periodSeconds, shotClock: g.cfg.shotClock }, specs: [g.buildSpec(home, 0, away), g.buildSpec(away, 1, home)] };
    this.sim = buildSim(this.init); this.startAt = startAt;
    this.ls = new Lockstep(this.sim, startAt, extras.actions || []);
    this.advanceTo(now);
  }
  get finished() { return this.ls.finished; }
  advanceTo(now) { for (let i = 0; i < 100 && this.ls.advanceTo(now); i++); } // el tope por llamada evita bloquear; se repite hasta ponerse al día
  get held() { return this.ls.halfHold; }
  teamIdx(club) { return String(this.entry.home) === club ? 0 : String(this.entry.away) === club ? 1 : -1; }
  hud() { const s = this.sim; return { q: s.period, time: fmtClock(s.clock), score: s.teams.map((t) => t.score), state: s.phase }; }
  hello(club) {
    const side = this.teamIdx(club);
    return { module: 'basquet', init: this.init, actions: this.ls.actions, side, canTactic: side >= 0, userIndex: side, teams: this.init.specs.map((sp, i) => ({ ...pub(this.g.team(i ? this.entry.away : this.entry.home)), name: sp.name })) };
  }
  // mensajes para todos los espectadores en cada tick: checkpoints de control
  frames() { return this.ls.newSigs.splice(0).map(({ step, sig }) => ({ type: 'sync', step, sig })); }
  full() { return []; }
  onClient(club, msg, now) {
    if (msg.type !== 'act') return null;
    const side = this.teamIdx(club), a = side >= 0 ? cleanAction(this.sim, side, msg.a) : null;
    if (!a) return { reply: [{ type: 'error', error: side < 0 ? 'No sos DT de este partido' : 'Cambio no válido' }] };
    this.advanceTo(now);
    a.step = this.ls.step + LEAD_STEPS;
    this.ls.addAction(a);
    return { broadcast: [{ type: 'action', a }], persist: true };
  }
  persist() { return { init: this.init, actions: this.ls.actions }; }
  commit() { this.g.commit(this.entry, this.sim); return { score: [this.entry.hs, this.entry.as] }; }
}

export const basquet = {
  id: 'basquet',
  create: (seed) => Game.create({}, 0, seed),
  load: (json) => new Game(JSON.parse(json)),
  serialize: (g) => JSON.stringify(g.toJSON()),
  clubs: (g) => g.s.teams.map((t) => String(t.id)),
  teams: (g) => g.s.teams.map(pub),
  standings: (g) => g.standings().map((r, i) => ({ id: String(r.id), rank: i + 1, w: r.w, l: r.l, t: 0, diff: r.diff })),
  round(g) {
    const d = g.currentDay(); if (!d) return null;
    return { label: d.label, year: g.s.season, phase: g.s.phase, type: d.kind, matches: d.entries.map((e) => ({ id: e.id, home: String(e.home), away: String(e.away), played: !!e.done, score: e.done ? [e.hs, e.as] : null, type: d.kind })) };
  },
  finishRound(g) { g.endDay(g.currentDay()); },
  results(g) {
    const out = []; g.s.schedule.forEach((d) => d.games.forEach((e) => { if (e.done) out.push({ id: e.id, week: d.day + 1, home: String(e.home), away: String(e.away), score: [e.hs, e.as] }); }));
    return out.slice(-40);
  },
  makeLive: (g, matchId, startAt, extras, now) => new BasketLive(g, matchId, startAt, extras, now),
};
