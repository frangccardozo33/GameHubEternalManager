import { PROFILE, ATTRIBUTES, POSITIONS, ROSTER_TARGET, STARTERS, KEY_ATTRS, FIRST, LAST, TEAM_TEMPLATES, ovrAt, refreshOvr, marketValue } from './constants.js';
import { normal, rint, ci, clone } from './util.js';
import { makeGameplan } from '../sim/gameplan.js';

export const emptySeasonLine = () => ({ gp: 0, passAtt: 0, passComp: 0, passYds: 0, passTD: 0, int: 0, sacksTaken: 0, rushAtt: 0, rushYds: 0, rushTD: 0, fumbles: 0, tgt: 0, rec: 0, recYds: 0, recTD: 0, drops: 0, tackles: 0, sacks: 0, ints: 0, ff: 0, missed: 0, fgm: 0, fga: 0, xpm: 0, xpa: 0, punts: 0, puntYds: 0 });
export const emptyTeamSeason = () => ({ gp: 0, plays: 0, yards: 0, passYds: 0, rushYds: 0, passAtt: 0, passComp: 0, rushAtt: 0, sacksTaken: 0, sackYds: 0, turnovers: 0, takeaways: 0, thirdAtt: 0, thirdConv: 0, fourthAtt: 0, fourthConv: 0, rzTrips: 0, rzTD: 0, penalties: 0, penYds: 0, top: 0, firstDowns: 0, pf: 0, pa: 0,
  deep: 0, short: 0, screens: 0, playAction: 0, runs: 0, passes: 0, fourthGo: 0, fourthFG: 0, fourthPunt: 0, defSnaps: 0, blitzes: 0, cov: {}, oppYards: 0, oppPassYds: 0, oppRushYds: 0, oppPlays: 0, sacks: 0, oppThirdAtt: 0, oppThirdConv: 0, oppRzTrips: 0, oppRzTD: 0 });

export class World {
  constructor(data) { this.data = data; }
  get rng() { return this.data.rng; }
  nextId(prefix) { return prefix + (++this.data.counters[prefix]); }
}

function makeName(world) {
  const rng = world.rng, used = world.data.usedNames;
  for (let i = 0; i < 40; i++) { const n = `${rng.pick(FIRST)} ${rng.pick(LAST)}`; if (!used[n]) { used[n] = 1; return n; } }
  const n = `${rng.pick(FIRST)} ${rng.pick(LAST)} ${rint(rng, 2, 9)}`; used[n] = 1; return n;
}
function ageFor(rng, pos, level) {
  const mean = { QB: 28, RB: 25.2, WR: 26, TE: 26.5, OL: 27, DL: 26.5, LB: 26, CB: 25.8, S: 26.5, K: 29, P: 29.5 }[pos] - (level < 60 ? 1.5 : 0);
  return ci(normal(rng, mean, 3.1), 21, pos === 'K' || pos === 'P' ? 39 : 36);
}
export function potentialFor(rng, ovr, age) {
  const up = age <= 22 ? rint(rng, 4, 17) : age <= 24 ? rint(rng, 2, 11) : age <= 27 ? rint(rng, 0, 5) : age <= 29 ? rint(rng, 0, 2) : 0;
  return Math.min(99, ovr + up);
}
export function contractFor(world, p, { years = null, factor = null } = {}) {
  const rng = world.rng, value = marketValue(p) * (factor ?? rng.range(.8, 1.12));
  years ??= p.age >= 32 ? rint(rng, 1, 2) : p.age <= 23 ? rint(rng, 3, 4) : rint(rng, 1, 5);
  const bonus = p.ovr >= 65 ? Math.round(value * years * rng.range(.05, .2) * 10) / 10 : 0;
  const salary = Math.max(.7, Math.round((value - bonus / years) * 10) / 10);
  return { salary, years, yearsTotal: years, bonus };
}
export function makePlayer(world, pos, level, { age = null, forceAge = false } = {}) {
  const rng = world.rng;
  age = age ?? ageFor(rng, pos, level);
  const ratings = {};
  for (const k of ATTRIBUTES) ratings[k] = ci((PROFILE[pos][k] ?? .62) * 100 * (level / 78) + rng.range(-6, 6));
  const p = { id: world.nextId('p'), name: makeName(world), pos, age, number: 0, ratings, ovr: 0, potential: 0, stamina: ci(normal(rng, 72, 9) - Math.max(0, age - 30) * 1.5, 40, 98), durability: ci(normal(rng, 76, 10), 40, 98),
    contract: null, teamId: null, ovr0: 0, form: 50, fatigue: 0, morale: 60, greed: Math.round(rng.range(.92, 1.12) * 100) / 100, injury: null, season: emptySeasonLine(), history: [], log: [], acc: {}, joined: world.data.year };
  refreshOvr(p);
  const diff = level - p.ovr; if (diff) for (const k of KEY_ATTRS[pos]) ratings[k] = ci(ratings[k] + diff);
  refreshOvr(p); p.ovr0 = p.ovr;
  p.potential = potentialFor(rng, p.ovr, age);
  return p;
}
const NUM_RANGES = { QB: [[1, 19]], RB: [[20, 39], [1, 9]], WR: [[10, 19], [80, 89]], TE: [[80, 89], [40, 49]], OL: [[60, 79]], DL: [[90, 99], [70, 79]], LB: [[50, 59], [40, 49]], CB: [[20, 39]], S: [[20, 49]], K: [[1, 19]], P: [[1, 19]] };
export function assignNumber(world, team, p) {
  const players = world.data.players;
  const used = new Set(team.roster.map(id => players[id]?.number).filter(Boolean));
  for (const [a, b] of NUM_RANGES[p.pos]) { const opts = []; for (let n = a; n <= b; n++) if (!used.has(n)) opts.push(n); if (opts.length) return p.number = world.rng.pick(opts); }
  for (let n = 1; n < 100; n++) if (!used.has(n)) return p.number = n;
}
export function makeStaff(world, role, level) {
  const rng = world.rng, rating = ci(level + rng.range(-4, 4), 40, 97);
  const unit = Math.max(0, (rating - 45) / 45);
  const salary = { HC: 2 + unit * 10, OC: 1 + unit * 5, DC: 1 + unit * 5, SCOUT: .3 + unit * 1.4, TRAINER: .3 + unit * 1.4 }[role];
  return { id: world.nextId('s'), name: makeName(world), role, rating, age: rint(rng, 34, 64), salary: Math.round(salary * 10) / 10, years: rint(rng, 1, 3), teamId: null };
}
export const STAFF_ROLES = { HC: 'Head coach', OC: 'Coordinador ofensivo', DC: 'Coordinador defensivo', SCOUT: 'Scout', TRAINER: 'Preparador físico' };

const STYLE_BONUS = { 'RUN HEAVY': { RB: 3, OL: 2 }, 'PASS HEAVY': { QB: 3, WR: 3 }, 'DEEP PASS': { QB: 2, WR: 4 }, 'QUICK PASS': { QB: 2, WR: 2, TE: 2 }, BALANCED: {} };
const DEF_BONUS = { PRESSURE: { DL: 3, LB: 1 }, COVERAGE: { CB: 3, S: 3 }, 'RUN STOP': { LB: 3, DL: 2 }, BALANCED: {} };

export function styleGameplan(style, defense) {
  const off = { 'RUN HEAVY': { runPass: 25, deepPass: 45, shortPass: 50, playAction: 65 }, 'PASS HEAVY': { runPass: 75, shortPass: 60 }, 'DEEP PASS': { runPass: 65, deepPass: 82, shortPass: 35, aggression: 65 }, 'QUICK PASS': { runPass: 68, deepPass: 25, shortPass: 85, screen: 65, tempo: 65 }, BALANCED: {} }[style] || {};
  const def = { PRESSURE: { blitz: 22, pressure: 80, aggression: 58 }, COVERAGE: { blitz: 5, coverage: 'cover4', pressure: 40, runFocus: 40 }, 'RUN STOP': { runFocus: 65, blitz: 12, front: '4-3' }, BALANCED: {} }[defense] || {};
  return makeGameplan({ off, def });
}
export function defaultTraining() { return { focus: { passing: 15, routeRunning: 15, blocking: 15, passRush: 15, coverage: 15, tackling: 15, conditioning: 10 }, intensity: 'normal' }; }

export function makeTeam(world, tpl, bias = 0) {
  const rng = world.rng, d = world.data;
  const team = { id: tpl.id, name: tpl.name, city: tpl.city, mascot: tpl.mascot, short: tpl.id, color: tpl.color, dark: tpl.dark, style: tpl.style, defense: tpl.defense,
    roster: [], depth: {}, gameplan: styleGameplan(tpl.style, tpl.defense), training: defaultTraining(), staff: { hc: null, oc: null, dc: null, scouts: [], trainers: [] },
    finance: { cash: 45, ticket: 85, hype: 50, log: [], attendance: [] }, record: { w: 0, l: 0, t: 0, pf: 0, pa: 0, streak: '' }, season: emptyTeamSeason(), deadCap: 0, form: [], tips: {} };
  d.teams[team.id] = team;
  const sb = STYLE_BONUS[tpl.style] || {}, db = DEF_BONUS[tpl.defense] || {};
  for (const pos of POSITIONS) {
    const n = ROSTER_TARGET[pos], starters = STARTERS[pos];
    for (let i = 0; i < n; i++) {
      const tier = i < starters ? 0 : i < starters + Math.ceil(starters / 2) ? 1 : 2;
      let level = tier === 0 ? normal(rng, 75.5 + bias, 5) : tier === 1 ? normal(rng, 65 + bias * .5, 5) : normal(rng, 55, 4.5);
      level += (sb[pos] || 0) + (db[pos] || 0);
      if (pos === 'K' || pos === 'P') level = normal(rng, 74 + bias, 7);
      const p = makePlayer(world, pos, ci(level, 42, 94));
      p.teamId = team.id; team.roster.push(p.id); d.players[p.id] = p;
      assignNumber(world, team, p);
      p.contract = contractFor(world, p);
    }
  }
  const mk = (role, lvl) => { const s = makeStaff(world, role, lvl + bias * 1.5); s.teamId = team.id; d.staff[s.id] = s; return s.id; };
  team.staff = { hc: mk('HC', 68), oc: mk('OC', 66), dc: mk('DC', 66), scouts: [mk('SCOUT', 62), mk('SCOUT', 56)], trainers: [mk('TRAINER', 62), mk('TRAINER', 56)] };
  return team;
}
// Free agents: a mix of veterans and undrafted youngsters with a few valuable ones.
export function makeFreeAgents(world, count = 45, { young = false } = {}) {
  const d = world.data, rng = world.rng, ids = [];
  for (let i = 0; i < count; i++) {
    const pos = ({ QB: 3, RB: 5, WR: 7, TE: 4, OL: 9, DL: 8, LB: 6, CB: 6, S: 5, K: 2, P: 2 }); const list = POSITIONS.flatMap(p => Array(pos[p]).fill(p));
    const position = rng.pick(list);
    const level = ci(normal(rng, young ? 56 : 59, 8) + (i < 4 ? 12 : 0), 42, 84);
    const age = young ? rint(rng, 21, 23) : null;
    const p = makePlayer(world, position, level, { age });
    p.teamId = null; p.contract = null; d.players[p.id] = p; ids.push(p.id);
  }
  return ids;
}
// Initial league balancing: every club starts under the cap with different amounts of room.
export function normalizePayroll(world, team, target) {
  const players = team.roster.map(id => world.data.players[id]);
  const total = players.reduce((s, p) => s + p.contract.salary + p.contract.bonus / p.contract.yearsTotal, 0), f = target / total;
  for (const p of players) { p.contract.salary = Math.max(.7, Math.round(p.contract.salary * f * 10) / 10); p.contract.bonus = Math.round(p.contract.bonus * f * 10) / 10; }
}
export function seedTeams(world) {
  const d = world.data; d.teamOrder = [];
  for (const tpl of TEAM_TEMPLATES) { const t = makeTeam(world, tpl, (tpl.talent - 1) * 2.0 + world.rng.range(-1, 1)); normalizePayroll(world, t, 168 + world.rng.range(-6, 14)); d.teamOrder.push(tpl.id); }
  const pool = []; for (let i = 0; i < 14; i++) { const role = ['HC', 'OC', 'DC', 'SCOUT', 'TRAINER'][i % 5]; const s = makeStaff(world, role, 60 + rint(world.rng, -8, 8)); d.staff[s.id] = s; pool.push(s.id); }
  d.staffPool = pool;
  d.freeAgents = makeFreeAgents(world, 48);
}
