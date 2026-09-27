// Adaptador del módulo 01 (Fútbol): liga compartida (núcleo TLM) + partido en vivo por "lockstep" con el motor 3D de fulbo.html
// empaquetado por server/tools/build-football.mjs. Todos los clubes los prepara la IA; el DT ajusta en vivo.
import { TLM } from './vendor/football-core.js';
import { makeEngine } from './vendor/football-engine.js';
import { setHumans, exportState, command } from './futbol-manage.js';
import { Lockstep, cleanAction, snapOf, LEAD_STEPS } from '../../01-futbol/online/lockstep.mjs';

let Engine = null;
const engine = () => (Engine ||= makeEngine(globalThis));
const teamOf = (c, id) => c.state.clubs[id];
const pub = (cl) => ({ id: cl.id, name: cl.name, short: cl.shortName, city: '', mascot: cl.name, color: cl.primaryColor, dark: cl.secondaryColor, crest: cl.crest, humanName: cl.humanName || null });
const leagueIds = (c) => c.comp.teams.map((t) => t.id || t);
const claimableIds = (c) => leagueIds(c).filter((id) => !TLM.isClubBlocked(teamOf(c, id).name));

class FootballLive {
  constructor(c, matchId, startAt, extras = {}, now = startAt) {
    this.c = c; const f = c.state.fixtures[matchId];
    if (!f) throw new Error('partido inexistente');
    this.f = f;
    if (!extras.cfg) { // los clubes IA arman XI y táctica una sola vez por jornada
      const key = f.cup ? 'c' + f.id : 'r' + c.state.currentMatchday;
      if (c.state.onlinePrep !== key) { c.prepareRound(); c.state.onlinePrep = key; }
      for (const id of [f.homeId, f.awayId]) { const cl = c.state.clubs[id]; if (cl && cl.controlledBy === 'user') { if (cl.lineupMode === 'auto') TLM.autoLineup(c.state, cl); TLM.repairLineup(c.state, cl); } } // los DT humanos juegan con su once y tácticas
    }
    this.cfg = extras.cfg || TLM.buildMatchConfig(c.state, f);
    this.m = new (engine())(this.cfg.seed);
    this.m.tlmLoad(this.cfg);
    this.m.tieBreak = this.cfg.cup ? { et: true, pens: true } : null;
    this.startAt = startAt;
    this.ls = new Lockstep(this.m, startAt, extras.actions || []);
    this.advanceTo(now);
  }
  get finished() { return this.ls.finished; }
  get held() { return this.ls.halfHold; }
  advanceTo(now) { for (let i = 0; i < 100 && this.ls.advanceTo(now); i++); }
  teamIdx(club) { return this.cfg.home.clubId === club ? 0 : this.cfg.away.clubId === club ? 1 : -1; }
  hud() { const m = this.m; return { q: m.half || 1, time: `${Math.floor(m.time / 60)}'`, score: [...m.score], state: m.phase }; }
  hello(club) {
    const side = this.teamIdx(club);
    return { module: 'futbol', cfg: this.cfg, actions: this.ls.actions, side, canTactic: side >= 0, userIndex: side, teams: [pub(teamOf(this.c, this.cfg.home.clubId)), pub(teamOf(this.c, this.cfg.away.clubId))] };
  }
  frames() { return this.ls.newSigs.splice(0).map(({ step, sig }) => ({ type: 'sync', step, sig })); }
  // Foto del estado en el paso `step` (checkpoint más reciente), para corregir a un cliente desviado: se pide con {type:'snap'}
  snapNow() { return { type: 'snap', step: this.ls.step, snap: snapOf(this.m) }; }
  full() { return []; }
  onClient(club, msg, now) {
    if (msg.type === 'snap') { this.advanceTo(now); return { reply: [this.snapNow()] }; }
    if (msg.type !== 'act') return null;
    const side = this.teamIdx(club), a = side >= 0 ? cleanAction(this.m, side, msg.a) : null;
    if (!a) return { reply: [{ type: 'error', error: side < 0 ? 'No sos DT de este partido' : 'Cambio no válido' }] };
    this.advanceTo(now);
    a.step = this.ls.step + LEAD_STEPS;
    this.ls.addAction(a);
    return { broadcast: [{ type: 'action', a }], persist: true };
  }
  persist() { return { cfg: this.cfg, actions: this.ls.actions }; }
  // El resultado se guarda y se aplica al cerrar la jornada (finishRound), para que la liga avance entera y de una vez.
  commit() {
    const res = this.m.tlmResult();
    (this.c.state.onlineRes ||= {})[this.f.id] = res;
    return { score: [...res.score] };
  }
}

export const futbol = {
  id: 'futbol',
  create(seed) { const c = TLM.Career.create({ seed }); for (const cl of Object.values(c.state.clubs)) cl.controlledBy = 'ai'; c.state.onlineSeason0 = c.state.season; c.state.onlineLive = true; return c; },
  load: (json) => TLM.Career.fromJSON(json),
  serialize: (c) => c.toJSON(),
  clubs: claimableIds,
  teams: (c) => leagueIds(c).map((id) => pub(teamOf(c, id))),
  standings: (c) => c.table().map((r) => ({ id: r.clubId, rank: r.pos, w: r.won, l: r.lost, t: r.drawn, diff: r.gd })),
  round(c) {
    const s = c.state; if (s.onlineSeason0 != null && s.season > s.onlineSeason0) return null; // la liga online dura una sola temporada
    const cp = TLM.cupPendingRound(s);
    let fixtures, label;
    if (cp) { fixtures = cp.fixtures; label = TLM.fixtureLabel(s, fixtures[0]).round; }
    else { const r = c.round; if (r == null) return null; fixtures = TLM.fixturesOf(s, c.comp, r); label = `Jornada ${r}`; }
    return { label, year: s.season, phase: cp ? 'copa' : 'liga', type: cp ? 'cup' : 'liga',
      matches: fixtures.map((f) => { const pr = s.onlineRes && s.onlineRes[f.id]; return { id: f.id, home: f.homeId, away: f.awayId, played: f.status === 'played' || !!pr, score: pr ? [...pr.score] : f.result ? [f.result.hg, f.result.ag] : null, type: f.cup ? 'cup' : 'liga' }; }) };
  },
  // El motor de la carrera cierra una jornada simulando los partidos pendientes: se le entregan los resultados de los partidos en vivo.
  finishRound(c) {
    const s = c.state, pend = s.onlineRes || {}, orig = TLM.simulateMatch, uf = c.userFixture;
    TLM.simulateMatch = (st, f) => { const r = pend[f.id]; if (r) { TLM.rateMatch(st, r); return r; } return orig(st, f); };
    c.userFixture = () => null; // no hay "usuario": el chequeo de partido del usuario no aplica
    try { c.finishRound(); } finally { TLM.simulateMatch = orig; c.userFixture = uf; delete s.onlineRes; delete s.onlinePrep; }
  },
  results(c) {
    const out = []; for (const f of Object.values(c.state.fixtures)) if (f.status === 'played' && f.result && f.competitionId === c.comp.id) out.push({ id: f.id, week: f.round, home: f.homeId, away: f.awayId, score: [f.result.hg, f.result.ag] });
    return out.slice(-40);
  },
  makeLive: (c, matchId, startAt, extras, now) => new FootballLive(c, matchId, startAt, extras, now),
  setHumans, exportState, command,
};
