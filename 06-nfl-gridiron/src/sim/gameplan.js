// Gameplan-driven play calling. Pure data in, play out: it plugs into the Phase 1 engine (MatchSimulator.prepare)
// and never simulates anything by itself.
import { PLAYBOOK } from './playbook.js';
import { clamp } from './math.js';
import { fgChance, fgDistance } from './special.js';

export const DEEP_PLAYS = ['post', 'corner', 'streak', 'comeback'];
export const SHORT_PLAYS = ['slant', 'mesh', 'out', 'curl', 'shallow'];
export const COVERAGE_PREFS = ['balanced', 'man', 'cover1', 'cover2', 'cover3', 'cover4'];
export const PACKAGES = ['auto', 'base', 'nickel', 'dime'];
export const FRONTS = ['auto', '4-3', '3-4'];
export const RED_ZONE = ['balanced', 'run', 'pass', 'quick'];

export const DEFAULT_GAMEPLAN = {
  off: { runPass: 50, tempo: 50, deepPass: 50, shortPass: 50, playAction: 50, screen: 50, redZone: 'balanced', fourthDown: 50, aggression: 50 },
  def: { blitz: 15, coverage: 'balanced', runFocus: 50, pressure: 50, aggression: 50, front: 'auto', package: 'auto' },
  playWeights: {},
  featured: { RB: null, target: null },
};
export function makeGameplan(over = {}) {
  const g = JSON.parse(JSON.stringify(DEFAULT_GAMEPLAN));
  for (const k of ['off', 'def', 'featured']) Object.assign(g[k], over[k] || {});
  Object.assign(g.playWeights, over.playWeights || {});
  return g;
}

const FG = { id: 'field-goal', name: 'Field goal', type: 'field-goal', personnel: '12', formation: 'Special teams' };
const PUNT = { id: 'punt', name: 'Punt', type: 'punt', personnel: '12', formation: 'Punt unit' };

function weighted(items, weight, rng) {
  const w = items.map(weight), total = w.reduce((a, b) => a + b, 0);
  if (total <= 0) return rng.pick(items);
  let r = rng.next() * total;
  for (let i = 0; i < items.length; i++) { r -= w[i]; if (r <= 0) return items[i]; }
  return items.at(-1);
}

// Decision on fourth down. `kicker` are engine stats of the kicker (or null).
export function fourthDownCall(drive, clock, gp, kicker) {
  const { distance, spot, score, offense } = drive, lead = score[offense] - score[1 - offense];
  const yards = fgDistance(spot), fg = fgChance(yards, kicker), a = gp.off.fourthDown / 100;
  const late = clock.quarter >= 4 && clock.remaining < 120 && lead < 0;
  let maxGo = .6 + a * 6.5;
  if (spot < 40) maxGo *= .25 + a * .5; else if (spot < 50) maxGo *= .8;
  const inRange = fg >= .42 && yards <= 63;
  if (late && !(lead >= -3 && inRange)) return 'go';
  if (inRange) return distance <= maxGo * .55 && a > .6 && spot > 62 ? 'go' : 'fg';
  return distance <= maxGo && spot > 35 ? 'go' : 'punt';
}

export function callOffense(drive, clock, gp, rng, kicker = null) {
  const o = gp.off, { down, distance, spot, score, offense } = drive;
  const lead = score[offense] - score[1 - offense], losing = lead < 0;
  const lateGame = clock.quarter >= 4 && clock.remaining < 120, urgency = lateGame && losing;
  if (down === 4) {
    const call = fourthDownCall(drive, clock, gp, kicker);
    if (call === 'fg') return { ...FG };
    if (call === 'punt') return { ...PUNT };
  }
  let run = 1 - (.30 + o.runPass / 100 * .45);
  if (distance <= 3) run += .22;
  if (down >= 3 && distance > 6) run -= .3;
  if (urgency) run = .08;
  if (lateGame && !losing) run += .25;
  if (spot > 80) run += { balanced: 0, run: .2, pass: -.15, quick: -.1 }[o.redZone] || 0;
  if (spot > 95) run += .12;
  run = clamp(run, .03, .93);
  const weightOf = p => (gp.playWeights?.[p.id] ?? 1);
  if (rng.chance(run)) {
    const runs = PLAYBOOK.filter(p => p.type === 'run');
    return { ...weighted(runs, weightOf, rng) };
  }
  const short = distance <= 4 || spot > 92 || (o.redZone === 'quick' && spot > 80), long = distance >= 12;
  const aggro = o.aggression / 100;
  const passes = PLAYBOOK.filter(p => p.type === 'pass');
  const w = p => {
    let x = weightOf(p);
    if (DEEP_PLAYS.includes(p.id)) x *= o.deepPass / 50 * (short ? .12 : long ? 2.2 : 1) * (.8 + aggro * .4);
    else if (SHORT_PLAYS.includes(p.id)) x *= o.shortPass / 50 * (short ? 2 : long ? .6 : 1);
    else if (p.id === 'screen') x *= .55 * o.screen / 50 * (long ? .6 : 1);
    else if (p.id === 'play-action') x *= o.playAction / 50 * (short ? .7 : 1);
    else if (p.id === 'rpo') x *= .6;
    if (p.id === 'screen' && spot > 92) x *= .3;
    return x;
  };
  return { ...weighted(passes, w, rng) };
}

// Returns { coverage, front }. `play` is the offensive call: personnel is visible pre-snap, the route concept is not used.
export function callDefense(drive, gp, rng, play) {
  const d = gp.def, { down, distance } = drive;
  const runLikely = clamp(.45 + (distance <= 3 ? .25 : 0) - (down >= 3 && distance > 6 ? .3 : 0) + (play.personnel !== '11' ? .12 : -.08), .1, .9);
  const blitzP = clamp(.03 + d.blitz / 100 * .44 + (distance < 3 ? .05 : 0) + (down === 3 ? .04 : 0) + (d.aggression - 50) / 100 * .10, 0, .8);
  let coverage;
  if (rng.chance(blitzP)) coverage = rng.chance(.7) ? 'Blitz' : 'Zone blitz';
  else if (rng.chance(d.runFocus / 100 * runLikely * .55)) coverage = rng.chance(.35) ? 'Blitz' : 'Cover 1';
  else {
    const base = { Man: 1, 'Cover 1': 1, 'Cover 2': 1, 'Cover 3': 1.2, 'Cover 4': .7 };
    const pref = { man: ['Man', 'Cover 1'], cover1: ['Cover 1'], cover2: ['Cover 2'], cover3: ['Cover 3'], cover4: ['Cover 4'] }[d.coverage] || [];
    coverage = weighted(Object.keys(base), c => base[c] * (pref.includes(c) ? 3 : 1) * (distance > 10 && ['Cover 2', 'Cover 3', 'Cover 4'].includes(c) ? 1.5 : 1) * (c === 'Cover 1' ? .85 + d.aggression / 100 * .3 : 1), rng);
  }
  let pkg = d.package;
  if (pkg === 'auto') {
    pkg = play.personnel === '11' ? 'nickel' : 'base';
    if (play.personnel === '11' && down >= 3 && distance >= 8) pkg = 'dime';
    if (d.runFocus >= 75 && distance <= 4) pkg = 'base';
  }
  const front = pkg === 'base' ? (d.front === 'auto' ? (rng.chance(.5) ? '4-3' : '3-4') : d.front) : pkg;
  return { coverage, front };
}
