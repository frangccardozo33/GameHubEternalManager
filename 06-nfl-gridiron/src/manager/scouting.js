import { STARTERS, POSITIONS, KEY_ATTRS, posSide } from './constants.js';
import { avg, pct, r1, sum } from './util.js';
import { clamp } from '../sim/math.js';
import { isInjured } from './lineup.js';
import { styleGameplan } from './generator.js';
import { makeGameplan } from '../sim/gameplan.js';

const top = (league, team, pos, n = STARTERS[pos]) => team.roster.map(id => league.data.players[id]).filter(p => p.pos === pos && !isInjured(p)).sort((a, b) => b.ovr - a.ovr).slice(0, n);
const attrAvg = (ps, keys) => avg(ps.map(p => avg(keys.map(k => p.ratings[k]))));
export const UNITS = { qb: 'Quarterback', rb: 'Juego terrestre (RB)', rec: 'Receptores', passBlock: 'Protección de pase', runBlock: 'Bloqueo de carrera', passRush: 'Pass rush', runStop: 'Defensa de la carrera', coverage: 'Cobertura', kicking: 'Pateadores' };
export function unitRatings(league, teamId) {
  const t = league.data.teams[teamId], ol = top(league, t, 'OL'), dl = top(league, t, 'DL'), lb = top(league, t, 'LB', 3), cb = top(league, t, 'CB', 3), s = top(league, t, 'S');
  return {
    qb: avg(top(league, t, 'QB').map(p => p.ovr)), rb: avg(top(league, t, 'RB').map(p => p.ovr)), rec: avg([...top(league, t, 'WR'), ...top(league, t, 'TE', 1)].map(p => p.ovr)),
    passBlock: attrAvg(ol, ['passBlocking', 'technique']), runBlock: attrAvg(ol, ['runBlocking', 'strength']),
    passRush: attrAvg([...dl, ...lb.slice(0, 1)], ['passRush']), runStop: attrAvg([...dl, ...lb], ['tackling', 'strength', 'pursuit']),
    coverage: attrAvg([...cb, ...s], ['manCoverage', 'zoneCoverage', 'reaction']), kicking: avg([...top(league, t, 'K'), ...top(league, t, 'P')].map(p => p.ovr)),
  };
}
function leagueUnitAverages(league) {
  const all = Object.keys(league.data.teams).map(id => unitRatings(league, id)), out = {};
  for (const k of Object.keys(UNITS)) out[k] = avg(all.map(u => u[k]));
  return out;
}
const PRIOR_PASS = { 'RUN HEAVY': .4, BALANCED: .52, 'PASS HEAVY': .62, 'DEEP PASS': .55, 'QUICK PASS': .6 };
const hash = str => { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
export function tendencies(team) {
  const s = team.season, n = s.runs + s.passes, prior = PRIOR_PASS[team.style] ?? .52, w = 40;
  const blend = (obs, cnt, p) => (obs + p * w) / (cnt + w);
  const passRate = blend(s.passes, n, prior);
  return {
    plays: n, passRate, deepRate: blend(s.deep, s.passes, team.style === 'DEEP PASS' ? .4 : .22), shortRate: blend(s.short, s.passes, team.style === 'QUICK PASS' ? .6 : .45),
    screenRate: blend(s.screens, s.passes, .07), paRate: blend(s.playAction, s.passes, .1),
    blitzRate: blend(s.blitzes, s.defSnaps, team.defense === 'PRESSURE' ? .32 : team.defense === 'COVERAGE' ? .08 : .17),
    thirdPct: s.thirdAtt ? pct(s.thirdConv, s.thirdAtt) : null, rzPct: s.rzTrips ? pct(s.rzTD, s.rzTrips) : null,
    ypp: s.plays ? r1(s.yards / s.plays) : null, oppYpp: s.oppPlays ? r1(s.oppYards / s.oppPlays) : null,
    sacksPerGame: s.gp ? r1(s.sacks / s.gp) : null, turnoversPerGame: s.gp ? r1(s.turnovers / s.gp) : null, takeawaysPerGame: s.gp ? r1(s.takeaways / s.gp) : null,
    fourthGoRate: s.fourthGo + s.fourthFG + s.fourthPunt ? pct(s.fourthGo, s.fourthGo + s.fourthFG + s.fourthPunt) : null,
    pf: s.gp ? r1(s.pf / s.gp) : null, pa: s.gp ? r1(s.pa / s.gp) : null,
  };
}
export function scoutReport(league, myId, oppId) {
  const d = league.data, me = d.teams[myId], opp = d.teams[oppId], avgs = leagueUnitAverages(league);
  const scoutAvg = avg(me.staff.scouts.map(id => d.staff[id]?.rating ?? 45));
  const noise = (100 - scoutAvg) / 100 * 7; // rating points of blur
  const units = unitRatings(league, oppId), rows = [];
  for (const [k, label] of Object.entries(UNITS)) {
    const jitter = (hash(`${oppId}${k}${d.year}${d.week}`) - .5) * 2 * noise;
    rows.push({ key: k, label, value: Math.round(units[k] + jitter), diff: Math.round(units[k] + jitter - avgs[k]) });
  }
  const sorted = [...rows].sort((a, b) => b.diff - a.diff);
  const tend = tendencies(opp), P = d.players, key = [];
  for (const pos of ['QB', 'RB', 'WR', 'TE', 'DL', 'LB', 'CB', 'S']) for (const p of top(league, opp, pos, pos === 'WR' ? 2 : 1)) key.push({ pid: p.id, name: p.name, pos: p.pos, ovr: Math.max(30, Math.round(p.ovr + (hash(p.id + d.week) - .5) * noise)), age: p.age, injured: isInjured(p) });
  key.sort((a, b) => b.ovr - a.ovr);
  const s = opp.season;
  const eff = { offense: s.plays ? { ypp: r1(s.yards / s.plays), pass: r1(s.passYds / Math.max(1, s.gp)), rush: r1(s.rushYds / Math.max(1, s.gp)), third: s.thirdAtt ? pct(s.thirdConv, s.thirdAtt) : null, rz: s.rzTrips ? pct(s.rzTD, s.rzTrips) : null, turnovers: r1(s.turnovers / Math.max(1, s.gp)) } : null,
    defense: s.oppPlays ? { ypp: r1(s.oppYards / s.oppPlays), pass: r1(s.oppPassYds / Math.max(1, s.gp)), rush: r1(s.oppRushYds / Math.max(1, s.gp)), third: s.oppThirdAtt ? pct(s.oppThirdConv, s.oppThirdAtt) : null, sacks: r1(s.sacks / Math.max(1, s.gp)), takeaways: r1(s.takeaways / Math.max(1, s.gp)) } : null };
  return { opp: oppId, games: s.gp, tendencies: tend, units: rows, strengths: sorted.slice(0, 2), weaknesses: sorted.slice(-2).reverse(), keyPlayers: key.slice(0, 6), efficiency: eff,
    confidence: Math.round(clamp(46 + scoutAvg * .5 - (s.gp < 3 ? 12 : 0), 20, 95)), note: s.gp < 2 ? 'Muestra pequeña: las tendencias mezclan el estilo declarado del rival con pocos partidos.' : `Basado en ${s.gp} partido(s).` };
}
// Gameplan matching my strengths to the opponent's weaknesses. Used for CPU teams and as the "apply suggestions" button.
export function matchupGameplan(league, team, opp) {
  const g = styleGameplan(team.style, team.defense), o = g.off, df = g.def;
  const me = unitRatings(league, team.id), them = unitRatings(league, opp.id), t = tendencies(opp);
  const passEdge = ((me.qb + me.rec) / 2 - (them.coverage + them.passRush) / 2), runEdge = ((me.rb + me.runBlock) / 2 - them.runStop);
  o.runPass = clamp(o.runPass + passEdge * 1.1 - runEdge * 1.1, 15, 85);
  o.deepPass = clamp(o.deepPass + (me.qb - 72) * .8 + (me.rec - them.coverage) * .8, 20, 85);
  if (me.passBlock < them.passRush - 3) { o.shortPass = clamp(o.shortPass + 15, 0, 100); o.deepPass = clamp(o.deepPass - 12, 0, 100); o.screen = clamp(o.screen + 15, 0, 100); }
  o.playAction = clamp(o.playAction + (runEdge > 3 ? 12 : 0), 0, 100);
  o.fourthDown = clamp(o.fourthDown + (me.kicking < 68 ? 8 : 0), 0, 100);
  df.blitz = clamp(df.blitz + (them.passBlock < me.passRush - 2 ? 8 : -4) + (t.passRate - .5) * 12, 0, 45);
  df.runFocus = clamp(df.runFocus + (.5 - t.passRate) * 90 + (them.rb - 72) * .5, 10, 90);
  df.pressure = clamp(df.pressure + (me.passRush - them.passBlock) * 1.5, 10, 90);
  if (t.passRate > .58) df.package = 'nickel'; if (t.deepRate > .32) df.coverage = 'cover4'; else if (t.passRate < .45) df.coverage = 'cover1';
  for (const k of Object.keys(o)) if (typeof o[k] === 'number') o[k] = Math.round(o[k]);
  for (const k of Object.keys(df)) if (typeof df[k] === 'number') df[k] = Math.round(df[k]);
  return makeGameplan({ off: o, def: df, playWeights: team.gameplan?.playWeights || {}, featured: team.gameplan?.featured || {} });
}
export function suggestionNotes(report, gp) {
  const out = [], t = report.tendencies;
  if (t.passRate > .58) out.push('El rival pasa mucho: más nickel/dime y cobertura zona; presión si su línea es floja.');
  if (t.passRate < .45) out.push('El rival corre con frecuencia: sube el enfoque en la carrera y usa base defense.');
  if (t.blitzRate > .28) out.push('Blitzea a menudo: pases rápidos, screens y play action castigan las presiones.');
  for (const w of report.weaknesses) {
    if (w.key === 'coverage') out.push('Cobertura débil: ataca con pases profundos.');
    if (w.key === 'runStop') out.push('Defensa de carrera floja: prioriza el juego terrestre.');
    if (w.key === 'passRush') out.push('Poca presión: puedes sostener rutas largas y usar más play action.');
    if (w.key === 'passBlock') out.push('Su línea protege mal: blitz frecuente y presión alta.');
  }
  return [...new Set(out)];
}
