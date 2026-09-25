import { emptySeasonLine, emptyTeamSeason } from './generator.js';
import { DEEP_PLAYS, SHORT_PLAYS } from '../sim/gameplan.js';
import { r1, sum } from './util.js';

const ST = ['kickoff', 'punt', 'field-goal', 'extra-point', 'two-point'];
const fmtSpot = (spot, tid) => `${tid} ${Math.round(spot <= 50 ? spot : 100 - spot)}`;

// Turns engine play results into player/team statistics. It only observes the Phase 1 engine (sim.recorder hook).
export class GameRecorder {
  constructor(league, homeId, awayId) {
    this.league = league; this.ids = [homeId, awayId]; this.P = league.data.players;
    this.lines = {}; this.tg = [emptyTeamSeason(), emptyTeamSeason()];
    this.drives = []; this.cur = null; this.scoring = []; this.lastScore = [0, 0]; this.turnovers = []; this.injuries = []; this.done = false;
    this.playCount = 0; this.summaryData = null;
  }
  line(pid) { return this.lines[pid] ??= emptySeasonLine(); }
  name(pid) { return this.P[pid]?.name ?? '—'; }
  teamOf(pid) { return this.P[pid]?.teamId; }
  // ---- drives
  openDrive(sim, off, before) { this.cur = { team: off, q: sim.clock.quarter, clock: sim.clock.display, startSpot: before.spot, plays: 0, yards: 0, topStart: sim.top[off], secs: 0, result: '', rz: false, start: fmtSpot(before.spot, this.ids[off]) }; }
  closeDrive(sim, result) {
    const c = this.cur; if (!c) return;
    c.secs = Math.round(sim.top[c.team] - c.topStart); c.result = result || c.result || 'Fin del tiempo';
    if (c.rz && c.result === 'Touchdown') this.tg[c.team].rzTD++;
    this.drives.push({ team: c.team, q: c.q, clock: c.clock, start: c.start, plays: c.plays, yards: Math.round(c.yards), secs: c.secs, result: c.result });
    this.cur = null;
  }
  onPlay(sim, r) {
    this.playCount++;
    const d = r.detail || {}, before = r.before, off = before.offense, def = 1 - off, T = this.tg[off], D = this.tg[def];
    if (ST.includes(r.kind)) this.special(sim, r, d, off, T);
    else if (r.kind === 'false start' || r.kind === 'offside') { const t = r.kind === 'offside' ? D : T; t.penalties++; t.penYds += 5; }
    else if (r.holding) { T.penalties++; T.penYds += 10; }
    else this.scrimmage(sim, r, d, off, def, T, D, before);
    // scoring summary
    const s = sim.drive.score;
    for (let i = 0; i < 2; i++) if (s[i] !== this.lastScore[i]) this.scoring.push({ q: sim.clock.quarter, clock: sim.clock.display, team: i, pts: s[i] - this.lastScore[i], text: this.scoreText(r, d, i), score: [...s] });
    this.lastScore = [...s];
    for (const inj of sim.injuries.splice(0)) this.injuries.push({ ...inj, name: this.name(inj.pid) });
  }
  scoreText(r, d, team) {
    const yds = Math.round(r.yards);
    if (r.kind === 'field-goal') return `${this.name(d.kicker)} · field goal de ${Math.round(117 - r.before.spot)} yd`;
    if (r.kind === 'extra-point') return `${this.name(d.kicker)} · punto extra`;
    if (r.kind === 'two-point') return 'Conversión de dos puntos';
    if (r.kind === 'safety') return 'Safety';
    if (r.turnover && (r.kind === 'interception' || r.kind === 'fumble')) return `${this.name(d.interceptor || d.tackler)} · retorno de ${r.kind === 'interception' ? 'intercepción' : 'fumble'} para TD`;
    if (r.pass) return `${this.name(d.qb)} → ${this.name(d.catcher)} · TD de pase de ${yds} yd`;
    return `${this.name(d.carrier)} · TD de carrera de ${yds} yd`;
  }
  special(sim, r, d, off, T) {
    const k = d.kicker;
    if (r.kind === 'field-goal' && k) { const l = this.line(k); l.fga++; T.fourthFG++; T.fgAtt = (T.fgAtt || 0) + 1; if (r.good) { l.fgm++; T.fgMade = (T.fgMade || 0) + 1; } else this.turnovers.push({ team: off, text: `${this.name(k)} falla un field goal de ${Math.round(117 - r.before.spot)} yd`, kind: 'fg' }); this.closeDrive(sim, r.good ? 'Field goal' : 'FG fallado'); }
    else if (r.kind === 'extra-point' && k) { const l = this.line(k); l.xpa++; if (r.good) l.xpm++; }
    else if (r.kind === 'punt' && k) { const l = this.line(k), yds = r.touchback ? 100 - r.before.spot - 20 : Math.max(0, r.spot - sim.los); l.punts++; l.puntYds += yds; T.fourthPunt++; T.punts = (T.punts || 0) + 1; T.puntYds = (T.puntYds || 0) + yds; this.closeDrive(sim, 'Punt'); }
  }
  scrimmage(sim, r, d, off, def, T, D, before) {
    if (!this.cur || this.cur.team !== off || (this.cur.q <= 2 && sim.clock.quarter >= 3)) { if (this.cur) this.closeDrive(sim, 'Fin del tiempo'); this.openDrive(sim, off, before); }
    const C = this.cur, pass = !sim.runCommitted, yds = r.turnover ? 0 : Math.round(r.yards * 10) / 10;
    T.plays++; D.defSnaps++; C.plays++; C.yards += yds;
    if (before.spot >= 80 && !C.rz) { C.rz = true; T.rzTrips++; }
    if (pass) { T.passes++; if (DEEP_PLAYS.includes(d.playId)) T.deep++; else if (SHORT_PLAYS.includes(d.playId)) T.short++; if (d.playId === 'screen') T.screens++; if (d.playId === 'play-action') T.playAction++; } else T.runs++;
    if (d.coverage) { D.cov[d.coverage] = (D.cov[d.coverage] || 0) + 1; if (d.coverage === 'Blitz' || d.coverage === 'Zone blitz') D.blitzes++; }
    const conv = r.firstDown || r.kind === 'touchdown';
    if (before.down === 3) { T.thirdAtt++; D.oppThirdAtt++; if (conv) { T.thirdConv++; D.oppThirdConv++; } }
    if (before.down === 4) { T.fourthAtt++; T.fourthGo++; if (conv) T.fourthConv++; }
    if (r.firstDown) T.firstDowns++;
    T.yards += yds; D.oppYards += yds; D.oppPlays++;
    const qb = d.qb ? this.line(d.qb) : null;
    if (r.kind === 'sack') {
      T.sacksTaken++; T.sackYds += Math.max(0, -yds); D.sacks++; if (qb) qb.sacksTaken++;
      if (d.tackler) { this.line(d.tackler).sacks++; this.line(d.tackler).tackles++; }
    } else if (pass && r.pass) {
      T.passAtt++; T.passComp += r.complete ? 1 : 0; if (qb) { qb.passAtt++; }
      if (d.target) this.line(d.target).tgt++;
      if (r.complete) {
        T.passYds += yds; D.oppPassYds += yds; if (qb) { qb.passComp++; qb.passYds += yds; }
        if (d.catcher) { const l = this.line(d.catcher); l.rec++; l.recYds += yds; if (r.kind === 'touchdown') l.recTD++; }
        if (r.kind === 'touchdown' && qb) qb.passTD++;
      }
      for (const p of d.dropped) this.line(p).drops++;
    } else if (r.kind !== 'incomplete') {
      const carrier = d.carrier ?? sim.players.find(p => p.id === 'RB')?.pid;
      if (carrier) { const l = this.line(carrier); l.rushAtt++; l.rushYds += yds; if (r.kind === 'touchdown') l.rushTD++; }
      T.rushAtt++; T.rushYds += yds; D.oppRushYds += yds;
    }
    if (d.interceptor && r.turnover) { T.turnovers++; D.takeaways++; if (qb) qb.int++; this.line(d.interceptor).ints++; this.turnovers.push({ team: off, kind: 'int', text: `${this.name(d.qb)} lanza una intercepción (${this.name(d.interceptor)})` }); }
    if (r.kind === 'fumble' || d.forcedBy) {
      const fumbler = d.carrier ?? sim.players.find(p => p.id === 'RB')?.pid;
      if (fumbler) this.line(fumbler).fumbles++;
      if (d.forcedBy) this.line(d.forcedBy).ff++;
      if (r.turnover) { T.turnovers++; D.takeaways++; this.turnovers.push({ team: off, kind: 'fumble', text: `${this.name(fumbler)} pierde un fumble` }); }
    }
    if (d.tackler && r.kind !== 'sack') this.line(d.tackler).tackles++;
    for (const p of d.missed) this.line(p).missed++;
    // drive result
    if (r.kind === 'touchdown') this.closeDrive(sim, 'Touchdown');
    else if (r.turnover) this.closeDrive(sim, d.interceptor ? 'Intercepción' : 'Fumble perdido');
    else if (r.onDowns) this.closeDrive(sim, 'Pérdida por downs');
    else if (r.kind === 'safety') this.closeDrive(sim, 'Safety');
    if (r.onDowns) this.turnovers.push({ team: off, kind: 'downs', text: `Pérdida por downs en ${fmtSpot(before.spot, this.ids[off])}` });
  }
  onFinal(sim) {
    if (this.done) return; this.done = true;
    if (this.cur) this.closeDrive(sim, 'Fin del partido');
    for (let i = 0; i < 2; i++) { this.tg[i].top = Math.round(sim.top[i]); this.tg[i].pf = sim.drive.score[i]; this.tg[i].pa = sim.drive.score[1 - i]; this.tg[i].gp = 1; }
  }
  // Player of the game style ranking
  grade(l) { return l.passYds / 25 + l.passTD * 4 - l.int * 4 + l.rushYds / 10 + l.rushTD * 5 + l.recYds / 10 + l.recTD * 5 + l.tackles * .6 + l.sacks * 4 + l.ints * 5 + l.ff * 3 + l.fgm * 1.5 - l.fumbles * 3 - l.drops; }
  headline(l, pos) {
    const parts = [];
    if (l.passAtt) parts.push(`${l.passComp}/${l.passAtt} ${Math.round(l.passYds)} yd${l.passTD ? ` ${l.passTD} TD` : ''}${l.int ? ` ${l.int} INT` : ''}`);
    if (l.rushAtt) parts.push(`${l.rushAtt} car ${Math.round(l.rushYds)} yd${l.rushTD ? ` ${l.rushTD} TD` : ''}`);
    if (l.rec) parts.push(`${l.rec} rec ${Math.round(l.recYds)} yd${l.recTD ? ` ${l.recTD} TD` : ''}`);
    if (l.tackles || l.sacks || l.ints || l.ff) parts.push([l.tackles && `${l.tackles} tkl`, l.sacks && `${l.sacks} sack`, l.ints && `${l.ints} INT`, l.ff && `${l.ff} FF`].filter(Boolean).join(' · '));
    if (l.fga) parts.push(`${l.fgm}/${l.fga} FG`);
    return parts.join(' · ');
  }
  summary(sim, extra = {}) {
    const players = {};
    for (const [pid, l] of Object.entries(this.lines)) {
      const p = this.P[pid]; if (!p) continue;
      if (Object.values(l).every(v => !v)) continue;
      players[pid] = { name: p.name, pos: p.pos, team: this.teamOf(pid), number: p.number, line: { ...l } };
    }
    const ranked = Object.entries(players).map(([pid, x]) => ({ pid, ...x, grade: this.grade(x.line), headline: this.headline(x.line, x.pos) })).filter(x => x.headline).sort((a, b) => b.grade - a.grade);
    const top = ranked.slice(0, 5).map(({ pid, name, pos, team, number, grade, headline }) => ({ pid, name, pos, team, number, grade: r1(grade), headline }));
    const errors = this.errorList(players);
    return { score: [...sim.drive.score], overtime: sim.otPeriods > 0, teamStats: this.tg, players, drives: this.drives, scoring: this.scoring, errors, top, injuries: this.injuries, plays: sim.history.length, ...extra };
  }
  errorList(players) {
    const out = this.turnovers.map(t => ({ team: t.team, text: t.text, kind: t.kind }));
    for (const [pid, x] of Object.entries(players)) {
      if (x.line.drops >= 2) out.push({ team: this.ids.indexOf(x.team), text: `${x.name} deja caer ${x.line.drops} pases`, kind: 'drop' });
      if (x.line.missed >= 3) out.push({ team: this.ids.indexOf(x.team), text: `${x.name} falla ${x.line.missed} tackles`, kind: 'tackle' });
    }
    for (let i = 0; i < 2; i++) {
      const t = this.tg[i];
      if (t.sacksTaken >= 3) out.push({ team: i, text: `La línea permite ${t.sacksTaken} sacks (${Math.round(t.sackYds)} yd perdidas)`, kind: 'protection' });
      if (t.penalties >= 4) out.push({ team: i, text: `${t.penalties} penalizaciones (${t.penYds} yd)`, kind: 'penalty' });
      if (t.thirdAtt >= 6 && t.thirdConv / t.thirdAtt < .25) out.push({ team: i, text: `Solo ${t.thirdConv}/${t.thirdAtt} en tercer down`, kind: 'third' });
      if (t.rzTrips >= 2 && t.rzTD === 0) out.push({ team: i, text: `Cero TD en ${t.rzTrips} visitas a la red zone`, kind: 'redzone' });
    }
    return out;
  }
}
