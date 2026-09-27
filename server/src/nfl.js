// Adaptador del módulo 06 (Gridiron): liga compartida + partido en vivo por reloj real.
// Reutiliza el motor del juego tal cual (06-nfl-gridiron/src). La simulación es determinista:
// un partido se reconstruye a partir de su semilla + el registro de cambios del DT (táctica y jugadas fijadas).
import { League } from '../../06-nfl-gridiron/src/manager/league.js';
import { FIXED_DT } from '../../06-nfl-gridiron/src/sim/match.js';
import { makeGameplan, DEFAULT_GAMEPLAN, COVERAGE_PREFS, PACKAGES, FRONTS, RED_ZONE } from '../../06-nfl-gridiron/src/sim/gameplan.js';
import { PLAYBOOK, DEFENSES } from '../../06-nfl-gridiron/src/sim/playbook.js';
import { setHumans, exportState, command, draftTick, extraOffers } from './nfl-manage.js';

export const STEP_MS = FIXED_DT * 1000;
export const OPEN_BEFORE_MS = 5 * 60e3; // la transmisión se abre 5 min antes (intro, estudio y anuncios en el cliente)
export const HALF_MS = 120e3;           // el medio tiempo dura lo que el estudio + la tanda de anuncios
const MAX_CATCHUP_STEPS = 400000;

export const createLeague = (seed) => League.create({ userTeam: 'NTH', seasonLength: 14, seed });
export const loadLeague = (json) => League.load(json);
export const teamIds = (league) => Object.keys(league.data.teams);

const ENUMS = { redZone: RED_ZONE, coverage: COVERAGE_PREFS, front: FRONTS, package: PACKAGES };
// Valida y normaliza un cambio táctico: solo claves conocidas, números 0-100 y enums permitidos.
export function cleanTactic(patch) {
  const out = { off: {}, def: {} };
  for (const side of ['off', 'def']) {
    for (const [k, def] of Object.entries(DEFAULT_GAMEPLAN[side])) {
      const v = patch?.[side]?.[k];
      if (v === undefined) continue;
      if (typeof def === 'number') { if (Number.isFinite(+v)) out[side][k] = Math.max(0, Math.min(100, Math.round(+v))); }
      else if (ENUMS[k]?.includes(v)) out[side][k] = v;
    }
  }
  return out;
}
export const cleanGameplan = (p) => makeGameplan(cleanTactic(p));
const PLAY_IDS = new Set(PLAYBOOK.map((p) => p.id));

const r2 = (n) => Math.round(n * 100) / 100;

export class LiveMatch {
  // gameplans: {teamId: gameplan} de los DT humanos. actions: [{step, team, patch|force}] cambios ya aplicados.
  constructor(league, fixtureId, startAt, gameplans = {}, actions = [], now = startAt) {
    this.league = league; this.startAt = startAt; this.actions = actions.slice();
    const fx = league.currentWeek().fixtures.find((f) => f.id === fixtureId);
    if (!fx) throw new Error('fixture inexistente');
    this.fx = fx;
    this.ctx = league.buildMatch(fx, { gameplans });
    this.sim = this.ctx.sim; this.sim.start();
    this.step = 0; this.ai = 0; this.pausedTotal = 0; this.halfHold = null; this.halfSeen = false;
    this.lastPlay = -1; this.lastEv = 0; this.lastHn = -1;
    this.advanceTo(now);
  }
  get finished() { return this.sim.state === 'FINAL'; }
  targetStep(now) { return Math.max(0, Math.floor((now - this.startAt - this.pausedTotal) / STEP_MS)); }
  advanceSteps(target) {
    let guard = 0;
    while (this.step < target && !this.finished && !this.halfHold && guard++ < MAX_CATCHUP_STEPS) {
      while (this.ai < this.actions.length && this.actions[this.ai].step <= this.step) this.apply(this.actions[this.ai++]);
      this.sim.step(); this.step++;
      if (this.sim.state === 'HALFTIME' && !this.halfSeen) { this.halfSeen = true; this.halfHold = this.startAt + this.pausedTotal + this.step * STEP_MS + HALF_MS; }
    }
  }
  advanceTo(now) {
    for (let g = 0; g < 3; g++) {
      if (this.halfHold) { if (now < this.halfHold) return; this.pausedTotal += HALF_MS; this.halfHold = null; }
      this.advanceSteps(this.targetStep(now));
      if (!this.halfHold) return;
    }
  }
  teamIdx(id) { return this.sim.teams.findIndex((x) => x.id === id); }
  apply(a) {
    const i = this.teamIdx(a.team); if (i < 0) return;
    if (a.patch) { const gp = this.sim.teams[i].gameplan; if (gp) for (const side of ['off', 'def']) Object.assign(gp[side], a.patch[side] || {}); }
    if (a.force) {
      if (a.force.play !== undefined && this.sim.playOffense === i) this.sim.forcedPlay = a.force.play;
      if (a.force.coverage !== undefined && this.sim.playOffense !== i) this.sim.forcedCoverage = a.force.coverage;
    }
  }
  // Cambio del DT en vivo: se registra en el paso actual (reproducible tras un reinicio).
  record(teamId, part, now) {
    if (this.finished || this.teamIdx(teamId) < 0) return false;
    this.advanceTo(now);
    const a = { step: this.step, team: teamId, ...part };
    this.actions.push(a); this.apply(a); this.ai = this.actions.length;
    return a;
  }
  tactic(teamId, patch, now) { return this.record(teamId, { patch: cleanTactic(patch) }, now); }
  force(teamId, f, now) {
    const force = {};
    if (f?.play !== undefined) { if (f.play === null || PLAY_IDS.has(f.play)) force.play = f.play; }
    if (f?.coverage !== undefined) { if (f.coverage === null || DEFENSES.includes(f.coverage)) force.coverage = f.coverage; }
    return Object.keys(force).length ? this.record(teamId, { force }, now) : false;
  }
  gameplanOf(teamId) { const t = this.sim.teams.find((x) => x.id === teamId); return t?.gameplan ? JSON.parse(JSON.stringify(t.gameplan)) : null; }
  teamsMeta() { return this.sim.teams.map((t) => ({ id: t.id, name: t.name, short: t.short, city: t.city, mascot: t.mascot, color: t.color, dark: t.dark, crest: t.crest, style: t.style, defense: t.defense })); }
  hist() { return this.sim.history.map((r) => ({ o: r.before.offense, k: r.kind, y: r.yards })); }
  // Fotograma para los espectadores. full=true agrega datos estáticos (jugadores, asignaciones, eventos e historial completos).
  frame(full = false) {
    const s = this.sim, d = s.drive, c = s.clock, snap = s.snapshot();
    const newPlay = full || snap.playNumber !== this.lastPlay;
    const evs = full ? s.events : s.events.filter((e) => e.id > this.lastEv);
    if (!full && evs.length) this.lastEv = evs.at(-1).id;
    const hn = s.history.length;
    const f = {
      type: 'frame', step: this.step, held: this.halfHold, state: s.state, offense: s.playOffense, los: r2(s.los), ltg: d.lineToGain, liveTime: r2(snap.liveTime), playNumber: snap.playNumber,
      ball: { x: r2(snap.ball.x), y: r2(snap.ball.y), z: r2(snap.ball.z), mode: snap.ball.mode },
      pos: snap.players.map((p) => [r2(p.x), r2(p.z), r2(p.heading), r2(p.speed), p.state, p.fallen ? 1 : 0, p.engaged ? 1 : 0]),
      det: {
        play: { name: s.play.name, type: s.play.type, personnel: s.play.personnel, formation: s.play.formation, rpo: !!s.play.rpo, playAction: !!s.play.playAction, gap: s.play.gap || null },
        coverage: s.coverage, front: s.front, qbRead: s.qbRead, target: s.target, pressure: r2(s.pressure || 0), runCommitted: !!s.runCommitted,
        label: s.lastResult?.label || null,
        drive: { score: [...d.score], offense: d.offense, down: d.down, distance: r2(d.distance), lineToGain: d.lineToGain, spot: r2(d.spot), drive: d.drive, timeouts: [...d.timeouts] },
        clock: { quarter: c.quarter, display: c.display }, quarters: s.config.quarters,
      },
      events: evs.map((e) => ({ id: e.id, type: e.type, text: e.text, quarter: e.quarter, time: e.time, play: e.play })),
      hn,
    };
    if (full) f.hist = this.hist(); else if (hn !== this.lastHn && hn) { const r = s.history.at(-1); f.hl = { o: r.before.offense, k: r.kind, y: r.yards }; }
    if (full || hn !== this.lastHn) f.stats = JSON.parse(JSON.stringify(d.stats));
    this.lastHn = hn;
    if (newPlay) {
      f.players = s.players.map((p) => ({ id: p.id, role: p.role, side: p.side, number: p.number, name: p.name, ovr: p.ovr, look: p.look, start: p.start ? { x: r2(p.start.x), z: r2(p.start.z) } : null, assignment: p.assignment || {} }));
      this.lastPlay = snap.playNumber;
    }
    return f;
  }
  // Un espectador nuevo: no altera lo que reciben los demás.
  fullFrame() { const lp = this.lastPlay, le = this.lastEv, lh = this.lastHn; const f = this.frame(true); this.lastPlay = lp; this.lastEv = le; this.lastHn = lh; return f; }
  // Cierra el partido: aplica resultados a la liga.
  commit() {
    this.league.commitGame(this.ctx);
    return { score: [...this.sim.drive.score], winner: this.fx.winner, ot: !!this.fx.ot };
  }
  hud() {
    const s = this.sim, c = s.clock, d = s.drive;
    return { q: c.quarter, time: c.display, score: [...d.score], down: d.down, dist: d.distance, off: s.playOffense, state: s.state, ot: s.otPeriods, timeouts: [...d.timeouts] };
  }
}

// Estado de la semana para el centro de partidos.
export const teamsPublic = (league) => Object.values(league.data.teams).map((t) => ({ id: t.id, name: t.name, short: t.short, city: t.city, mascot: t.mascot, color: t.color, dark: t.dark, crest: t.crest }));
export const standings = (league) => league.standings();

// ---------- adaptador para el Durable Object (interfaz común de módulos) ----------
class NflLive {
  constructor(league, matchId, startAt, extras = {}, now = startAt) {
    // los DT humanos juegan con el gameplan que dejaron en su club (la CPU arma el suyo contra el rival)
    const gps = { ...(extras.gameplans || {}) }; for (const id of league.data.humans || []) if (league.data.teams[id] && league.data.teams[id].gameplan) gps[id] = league.data.teams[id].gameplan;
    this.m = new LiveMatch(league, matchId, startAt, gps, extras.actions || [], now);
  }
  get finished() { return this.m.finished; }
  get held() { return this.m.halfHold; }
  advanceTo(now) { this.m.advanceTo(now); }
  teamIdx(club) { return this.m.teamIdx(club); }
  hud() { return this.m.hud(); }
  hello(club) { const m = this.m, i = m.teamIdx(club); return { module: 'nfl', teams: m.teamsMeta(), canTactic: i >= 0, club, userIndex: i, gameplan: i >= 0 ? m.gameplanOf(club) : null }; }
  frames() { return [this.m.frame()]; }
  full() { return [this.m.fullFrame()]; }
  onClient(club, msg, now) {
    if (msg.type !== 'tactic' && msg.type !== 'force') return null;
    if (this.m.teamIdx(club) < 0) return { reply: [{ type: 'error', error: 'No sos DT de este partido' }] };
    const act = msg.type === 'tactic' ? this.m.tactic(club, msg.patch, now) : this.m.force(club, msg, now);
    if (!act) return { reply: [{ type: 'error', error: 'Cambio no válido' }] };
    return { reply: [{ type: 'tactic-ok', step: act.step, kind: msg.type }], persist: true };
  }
  persist() { return { actions: this.m.actions }; }
  commit() { return this.m.commit(); }
}
export const nfl = {
  id: 'nfl',
  create: createLeague,
  load: loadLeague,
  serialize: (l) => l.serialize(),
  clubs: teamIds,
  teams: teamsPublic,
  standings: (l) => standings(l),
  round(l) {
    if (l.data.draft && !l.data.draft.done) return { label: 'Draft', year: l.data.year, phase: 'draft', type: 'draft', matches: [] };
    const wk = l.currentWeek(); if (!wk) return null;
    return { label: wk.label, year: l.data.year, phase: l.data.phase, type: wk.type, matches: wk.fixtures.map((f) => ({ id: f.id, home: f.home, away: f.away, played: f.played, score: f.score, type: f.type })) };
  },
  finishRound(l) { l.completeWeek(); extraOffers(l); },
  results(l) { const d = l.data; return Object.values(d.results).filter((r) => r.year === d.year).slice(-40).map((r) => ({ id: r.id, week: r.week, home: r.home, away: r.away, score: r.score, ot: r.overtime })); },
  makeLive: (l, matchId, startAt, extras, now) => new NflLive(l, matchId, startAt, extras, now),
  setHumans, exportState, command, tickLeague: draftTick,
};
