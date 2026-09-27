// Adaptador del módulo 07 (Carreras / LRO): campeonato compartido (los 10 equipos de la parrilla; cada humano dirige uno) +
// carrera en vivo por "lockstep" con el motor de engine.js empaquetado por server/tools/build-race.mjs. Una fecha = una carrera.
import { makeRace } from './vendor/race-core.js';
import { Lockstep, cleanAction, snapOf, LEAD_STEPS } from '../../07-carreras-apex/online/lockstep.mjs';
import { setHumans, exportState, command, afterRound } from './race-manage.js';
import { fixCards, boostedStats, primeCardContext, raceRating, gainMatchXP, rollCardDrop, consumeCardUse, clubCards, cardsOf, equipCard, listCard, unlistCard, buyCard } from './race-cards.js';

const hex = (n) => '#' + (n >>> 0).toString(16).padStart(6, '0');
const pub = (t) => ({ id: String(t.id), name: t.name, short: t.name.split(' ')[0].slice(0, 3).toUpperCase(), city: '', mascot: t.name, color: hex(t.color), dark: hex(t.color), crest: t.logo ? 'assets/logos/racing/' + t.logo : '' });
let DATA = null; const data = () => (DATA ||= makeRace(null));
const trackOf = (c) => data().TRACKS.find((t) => t.id === c.calendar[c.roundIndex].trackId) || data().TRACKS[0];

class RaceLive {
  constructor(g, matchId, startAt, extras = {}, now = startAt) {
    this.g = g; this.startAt = startAt;
    this.cfg = extras.cfg || { seed: (((g.seed * 2654435761 + g.career.roundIndex * 40503) >>> 0) % 1e9) + 1 };
    const career = JSON.parse(JSON.stringify(g.career)); this.round = career.roundIndex;
    for (const d of career.driversPool) if (d.equippedCardLogic) d.stats = boostedStats(d);
    this.R = makeRace(career);
    this.R.seedRng(this.cfg.seed); this.R.setSimT(0); this.R.qualify(); this.R.beginRace();
    this.ls = new Lockstep(this.R, startAt, extras.actions || []);
    this.advanceTo(now);
  }
  get finished() { return this.ls.finished; }
  get held() { return this.ls.hold; }
  advanceTo(now) { for (let i = 0; i < 100 && this.ls.advanceTo(now); i++); }
  teamIdx(club) { return this.R.state.cars.findIndex((c) => String(c.team.id) === club); }
  lap() { const lead = this.R.state.order[0]; return Math.min(this.R.CONFIG.laps, Math.max(1, (lead && lead.lap) || 1)); }
  hud() {
    const s = this.R.state, lead = s.order[0], laps = this.R.CONFIG.laps;
    return { q: 0, time: s.phase === 'finished' ? 'Final' : `Vuelta ${this.lap()}/${laps}`, score: [0, 0], state: s.phase,
      text: s.phase === 'finished' ? 'Bandera a cuadros' : s.phase === 'countdown' ? 'Largada' : `Vuelta ${this.lap()}/${laps} · líder ${lead ? lead.driver.short : ''}` };
  }
  hello(club) {
    const side = this.teamIdx(club);
    return { module: 'carreras', career: this.g.career, cfg: this.cfg, actions: this.ls.actions, side, canTactic: side >= 0, userIndex: side, teams: this.g.career.teams.map(pub) };
  }
  frames() { return this.ls.newSigs.splice(0).map(({ step, sig }) => ({ type: 'sync', step, sig })); }
  snapNow() { return { type: 'snap', step: this.ls.step, snap: snapOf(this.R), st: this.ls.state() }; }
  full() { return []; }
  onClient(club, msg, now) {
    if (msg.type === 'snap') { this.advanceTo(now); return { reply: [this.snapNow()] }; }
    if (msg.type !== 'act') return null;
    const car = this.teamIdx(club), a = car >= 0 ? cleanAction(car, msg.a) : null;
    if (!a) return { reply: [{ type: 'error', error: car < 0 ? 'No sos el equipo de esta carrera' : 'Orden no válida' }] };
    this.advanceTo(now);
    a.step = this.ls.step + LEAD_STEPS;
    this.ls.addAction(a);
    return { broadcast: [{ type: 'action', a }], persist: true };
  }
  persist() { return { cfg: this.cfg, actions: this.ls.actions }; }
  commit() {
    const g = this.g, c = g.career, s = this.R.state, pts = c.regulations.pointsSystem;
    const order = s.order.map((car) => ({ team: String(car.team.id), driver: car.driver.short, dnf: !!car.dnf }));
    const pole = s.cars.find((k) => k.team.id === s.poleTeamId);
    s.order.forEach((car, i) => {
      const team = c.teams.find((t) => t.id === car.team.id), p = pts[i] || 0;
      team.points += p; if (i === 0) team.wins++; if (i < 3) team.podiums++; if (car.dnf) team.dnfs++; if (pole && car.id === pole.id) team.poles++;
      c.championship.driverPoints[car.driver.id] = (c.championship.driverPoints[car.driver.id] || 0) + p;
      // rating de carrera (1-10) -> XP y drop de cartas especiales, para el piloto real del campeonato (no el clon de la sim)
      const d = g.career.driversPool.find((x) => x.id === car.driver.id);
      if (d) {
        d.careerRaces = (d.careerRaces || 0) + 1;
        const rating = raceRating(car.dnf, i, s.order.length);
        gainMatchXP(d, rating); rollCardDrop(g, d, rating); consumeCardUse(g, d);
      }
    });
    const r = c.calendar[this.round]; r.completed = true; r.result = order.slice(0, 3).map((o) => o.driver);
    g.last = { round: this.round, order, track: trackOf(c).name };
    return { score: [0, 0] };
  }
}

export const carreras = {
  id: 'carreras',
  create(seed) {
    const career = data().newCareer(); career.teams.forEach((t) => { t.isPlayer = false; t.parts = null; });
    const g = { v: 1, seed, career, done: [], last: null, humans: [], tradeProps: [] };
    fixCards(g); primeCardContext(g);
    return g;
  },
  load: (json) => { const g = JSON.parse(json); fixCards(g); return g; },
  serialize: (g) => JSON.stringify(g),
  clubs: (g) => g.career.teams.map((t) => String(t.id)),
  teams: (g) => g.career.teams.map(pub),
  standings: (g) => [...g.career.teams].sort((a, b) => b.points - a.points || b.wins - a.wins || a.id - b.id)
    .map((t, i) => ({ id: String(t.id), rank: i + 1, w: t.wins, l: t.podiums, t: t.dnfs, diff: t.points, cols: ['Vict', 'Pod', 'DNF', 'Pts'] })),
  round(g) {
    const c = g.career, r = c.calendar[c.roundIndex]; if (!r) return null;
    const tr = trackOf(c), ids = c.teams.map((t) => String(t.id));
    const fin = r.completed && g.last && g.last.round === c.roundIndex;
    return { label: `Fecha ${r.round} · ${tr.name}`, year: 2025 + c.season, phase: 'regular', type: 'race',
      matches: [{ id: 'race' + c.roundIndex, home: ids[0], away: ids[1], entrants: ids, title: `${tr.name} · ${c.teams.length} equipos`, played: !!fin, score: fin ? [0, 0] : null, summary: fin ? 'Ganó ' + g.last.order[0].driver : null, type: 'race' }] };
  },
  finishRound(g) {
    const c = g.career; afterRound(g);
    if (g.last) g.done.push({ id: 'race' + g.last.round, week: g.last.round + 1, home: g.last.order[0].team, away: g.last.order[1].team, score: [1, 2], text: `${g.last.track}: 1º ${g.last.order[0].driver}, 2º ${g.last.order[1].driver}, 3º ${g.last.order[2].driver}` });
    g.done = g.done.slice(-40);
    c.roundIndex++;
    if (c.roundIndex >= c.calendar.length) { c.roundIndex = 0; c.season++; c.calendar.forEach((r) => { r.completed = false; r.result = null; }); c.teams.forEach((t) => { t.points = 0; }); c.championship.driverPoints = {}; }
    g.last = null;
    primeCardContext(g);
  },
  results: (g) => g.done.slice(-40),
  makeLive: (g, matchId, startAt, extras, now) => new RaceLive(g, matchId, startAt, extras, now),
  setHumans, exportState, command,
  // cartas especiales (drop por carrera, dueño = equipo, uso limitado, mercado propio)
  clubCards: (g, teamId) => clubCards(g, teamId),
  cardsOf: (g, did) => cardsOf(g, did),
  equipCard: (g, teamId, did, cardId) => equipCard(g, teamId, did, cardId),
  listCard: (g, teamId, cardId, price) => listCard(g, teamId, cardId, price),
  unlistCard: (g, teamId, cardId) => unlistCard(g, teamId, cardId),
  buyCard: (g, teamId, cardId) => buyCard(g, teamId, cardId),
};
