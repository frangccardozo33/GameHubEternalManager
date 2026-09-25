import { TRAINING_AREAS, RB_EXTRA, KEY_ATTRS, POSITIONS, refreshOvr, PHYSICAL } from './constants.js';
import { clamp } from '../sim/math.js';
import { avg, sum, normal, rint } from './util.js';
import { potentialFor } from './generator.js';
import { isInjured } from './lineup.js';

const INTENSITY = { light: .7, normal: 1, heavy: 1.3 };
const K_EFFORT = .9;
export const ageRate = age => age <= 23 ? 1.25 : age <= 26 ? 1 : age <= 29 ? .65 : age <= 32 ? .35 : .15;

// Weekly training changes REAL attributes (the same ones the Phase 1 engine reads). Returns [{pid, area, gains}] for reporting.
export function weeklyTraining(league, team) {
  const P = league.data.players, S = league.data.staff, plan = team.training, F = plan.focus;
  const total = sum(Object.values(F)) || 1, inten = INTENSITY[plan.intensity] ?? 1, rating = id => S[id]?.rating ?? 50;
  const coach = { off: .8 + rating(team.staff.oc) / 100 * .5, def: .8 + rating(team.staff.dc) / 100 * .5, all: .8 + avg(team.staff.trainers.map(rating)) / 100 * .5 };
  const hc = .9 + rating(team.staff.hc) / 100 * .2, changes = [];
  for (const id of team.roster) {
    const p = P[id], before = p.ovr, potF = clamp(.25 + (p.potential - p.ovr) * .08, 0, 1.4), mul = ageRate(p.age) * potF * hc * inten * (isInjured(p) ? .5 : 1);
    for (const [area, def] of Object.entries(TRAINING_AREAS)) {
      if (!def.positions.includes(p.pos)) continue;
      const effort = (F[area] || 0) / total * K_EFFORT * (p.pos === 'K' || p.pos === 'P' ? .3 : 1);
      if (area === 'conditioning') { p.stamina = clamp(p.stamina + effort * ageRate(p.age) * .5 * coach.all, 40, 98); p.durability = clamp(p.durability + effort * .08, 40, 98); continue; }
      const attrs = area === 'routeRunning' && p.pos === 'RB' ? [...def.attrs, ...RB_EXTRA] : def.attrs;
      const gain = Math.min(.5, effort * mul * coach[def.side]);
      for (const a of attrs) {
        if (!KEY_ATTRS[p.pos].includes(a) && a !== 'strength') continue;
        p.acc[a] = (p.acc[a] || 0) + gain;
        while (p.acc[a] >= 1) { p.acc[a] -= 1; p.ratings[a] = Math.min(98, p.ratings[a] + 1); }
      }
    }
    refreshOvr(p); if (p.ovr > p.potential) p.potential = p.ovr;
    if (p.ovr > before) changes.push({ pid: p.id, delta: p.ovr - before });
  }
  if (plan.intensity === 'heavy') for (const id of team.roster) P[id].fatigue = Math.min(100, P[id].fatigue + 6);
  return changes;
}

export function weeklyRecovery(league, team) {
  const P = league.data.players, trainer = avg(team.staff.trainers.map(id => league.data.staff[id]?.rating ?? 50)), healed = [];
  for (const id of team.roster) {
    const p = P[id];
    p.fatigue = Math.max(0, p.fatigue - (34 + trainer / 100 * 24 + (p.stamina - 70) * .25));
    p.form = clamp(p.form + (50 - p.form) * .25, 20, 80);
    if (p.injury) {
      p.injury.weeks -= 1 + (trainer > 72 && league.rng.chance(.25) ? 1 : 0);
      if (p.injury.weeks <= 0) { p.injury = null; healed.push(p.id); }
    }
  }
  return healed;
}

// Offseason: age, progression by age curve / potential, retirement.
export function offseasonProgression(league) {
  const d = league.data, rng = league.rng, retired = [], all = Object.values(d.players);
  for (const p of all) {
    p.age += 1;
    const gap = Math.max(0, p.potential - p.ovr);
    const mean = (p.age <= 22 ? 3 : p.age <= 24 ? 2 : p.age <= 26 ? .8 : p.age <= 28 ? .1 : p.age <= 30 ? -.8 : p.age <= 32 ? -1.8 : -3) + (p.age <= 27 ? gap * .12 : 0);
    const keys = new Set(KEY_ATTRS[p.pos]);
    for (const k of Object.keys(p.ratings)) {
      let delta = keys.has(k) ? mean : mean * .4;
      if (PHYSICAL.has(k) && p.age > 28) delta -= (p.age - 28) * .25;
      p.ratings[k] = Math.round(clamp(p.ratings[k] + delta + normal(rng, 0, 1.2), 30, 98));
    }
    p.stamina = clamp(Math.round(p.stamina + (p.age > 31 ? -2 : 1)), 40, 98);
    if (p.age >= 31) p.durability = clamp(p.durability - 1, 40, 98);
    refreshOvr(p);
    p.potential = p.age >= 28 ? p.ovr : Math.max(p.ovr, Math.min(99, p.potential + rint(rng, -2, 2)));
    p.acc = {}; p.fatigue = 0; p.form = 50;
    if (p.injury) p.injury.weeks = Math.max(0, p.injury.weeks - 10); if (p.injury && p.injury.weeks <= 0) p.injury = null;
    const limit = p.pos === 'K' || p.pos === 'P' ? 41 : 36;
    if (p.age >= limit || (p.age >= 34 && p.ovr < 72 && rng.chance(.45)) || (p.age >= 35 && rng.chance(.4))) retired.push(p.id);
  }
  return retired;
}
export const trainingAreaLabel = a => TRAINING_AREAS[a]?.label ?? a;
