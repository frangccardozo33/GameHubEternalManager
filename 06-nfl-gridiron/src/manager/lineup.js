import { ATTRIBUTES, POSITIONS, ovrAt, PHYSICAL, INJURY_TYPES } from './constants.js';
import { clamp } from '../sim/math.js';
import { avg, weightedPick } from './util.js';

export const DEPTH_KEYS = [...POSITIONS, 'KR', 'PR'];
export const OFF_PACKAGES = { '11': { RB: 1, TE: 1, WR: 3 }, '12': { RB: 1, TE: 2, WR: 2 }, '21': { RB: 2, TE: 1, WR: 2 } };
export const DEF_PACKAGES = { '4-3': { DL: 4, LB: 3, CB: 2, S: 2 }, '3-4': { DL: 3, LB: 4, CB: 2, S: 2 }, nickel: { DL: 4, LB: 2, CB: 3, S: 2 }, dime: { DL: 4, LB: 1, CB: 4, S: 2 } };
// Max simultaneous players used at each position (drives rotation and depth-chart labels).
export const SLOTS = { QB: 1, RB: 2, WR: 3, TE: 2, OL: 5, DL: 4, LB: 4, CB: 4, S: 2, K: 1, P: 1, KR: 1, PR: 1 };
const FATIGUE_BASE = { QB: .35, RB: 1.5, WR: 1.1, TE: 1.0, OL: .85, DL: 1.3, LB: 1.1, CB: 1.15, S: 1.0 };
const ROTATE_AT = { RB: 62, WR: 78, TE: 78, DL: 70, LB: 78, CB: 82, S: 85, OL: 92, QB: 200 };
const SPECIAL = new Set(['kickoff', 'punt', 'field-goal', 'extra-point']);

export const isInjured = p => !!p.injury && p.injury.weeks > 0;
export const retScore = p => (p.ratings.speed * 1.2 + p.ratings.acceleration + p.ratings.agility + p.ratings.vision * .7 + p.ratings.carrying * .6 + p.ratings.contactBalance * .4) / 4.9;

export function autoDepth(league, team) {
  const P = league.data.players, depth = {};
  const byPos = pos => team.roster.map(id => P[id]).filter(p => p.pos === pos);
  for (const pos of POSITIONS) depth[pos] = byPos(pos).sort((a, b) => b.ovr - a.ovr || b.potential - a.potential).map(p => p.id);
  const starters = new Set(['WR', 'RB', 'CB'].flatMap(pos => depth[pos].slice(0, pos === 'WR' ? 2 : pos === 'RB' ? 1 : 2)));
  const cands = team.roster.map(id => P[id]).filter(p => ['RB', 'WR', 'CB', 'S'].includes(p.pos)).sort((a, b) => (retScore(b) - (starters.has(b.id) ? 8 : 0)) - (retScore(a) - (starters.has(a.id) ? 8 : 0)));
  depth.KR = cands.slice(0, 3).map(p => p.id);
  depth.PR = [...cands.slice(0, 3).map(p => p.id)];
  team.depth = depth; return depth;
}
// Keep depth lists consistent with the roster (after signings, releases, trades).
export function syncDepth(league, team) {
  const P = league.data.players, ids = new Set(team.roster);
  team.depth ??= {};
  for (const key of DEPTH_KEYS) team.depth[key] = (team.depth[key] || []).filter(id => ids.has(id));
  for (const id of team.roster) {
    const p = P[id], list = team.depth[p.pos];
    if (list.includes(id)) continue;
    let i = list.findIndex(o => P[o].ovr < p.ovr); if (i < 0) i = list.length; list.splice(i, 0, id);
  }
  for (const key of ['KR', 'PR']) if (team.depth[key].length < 1) team.depth[key] = autoDepth(league, team)[key];
}
export function depthMove(team, key, id, delta) {
  const l = team.depth[key], i = l.indexOf(id), j = i + delta;
  if (i < 0 || j < 0 || j >= l.length) return false;
  [l[i], l[j]] = [l[j], l[i]]; return true;
}
export function depthAdd(team, key, id) { if (!team.depth[key].includes(id)) team.depth[key].push(id); }
export function depthRemove(team, key, id) { team.depth[key] = team.depth[key].filter(x => x !== id); }
export function depthIssues(league, team) {
  const P = league.data.players, issues = [];
  for (const pos of POSITIONS) {
    const healthy = team.depth[pos].map(id => P[id]).filter(p => p && !isInjured(p));
    if (healthy.length < ({ QB: 1, RB: 2, WR: 3, TE: 2, OL: 5, DL: 4, LB: 4, CB: 4, S: 2, K: 1, P: 1 })[pos]) issues.push(`Faltan jugadores sanos en ${pos} (${healthy.length}).`);
    const first = team.depth[pos].slice(0, SLOTS[pos]).map(id => P[id]).filter(p => p && isInjured(p));
    for (const p of first) issues.push(`${p.name} (${pos}) está lesionado y figura como titular.`);
  }
  return issues;
}

export function engineStats(p, { fatigue = p.fatigue, mods = {}, gp = null, side = 'O' } = {}) {
  const fatMul = 1 - Math.max(0, fatigue - 25) / 100 * .2, formMul = 1 + (p.form - 50) / 100 * .1;
  const out = {};
  for (const k of ATTRIBUTES) {
    let v = (p.ratings[k] ?? 55) / 100 * formMul * (PHYSICAL.has(k) ? fatMul : Math.sqrt(fatMul));
    const m = mods[k]; if (m) v *= 1 + m;
    out[k] = clamp(v, .3, .98);
  }
  return out;
}
export function staffMods(league, team) {
  const s = id => league.data.staff[id]?.rating ?? 50, o = (s(team.staff.oc) - 50) / 100 * .06, d = (s(team.staff.dc) - 50) / 100 * .06;
  const trainers = team.staff.trainers.map(s);
  return { off: { awareness: o, decisionMaking: o, technique: o, vision: o }, def: { awareness: d, reaction: d, zoneCoverage: d, manCoverage: d }, discipline: clamp(1.25 - s(team.staff.hc) / 100 * .5, .75, 1.3), trainer: avg(trainers) };
}

export class LineupProvider {
  constructor(league, teamId) {
    this.league = league; this.team = league.data.teams[teamId]; this.P = league.data.players; this.staff = staffMods(league, this.team);
    this.discipline = this.staff.discipline;
    this.fat = {}; this.out = new Set(); this.played = {}; this.injuries = []; this.cur = {}; this.used = new Set(); this.retPid = null; this.sim = null; this.idx = 0;
  }
  fatigueOf(p) { return this.fat[p.id] ?? p.fatigue; }
  gp() { return this.sim?.teams[this.idx]?.gameplan ?? this.team.gameplan; }
  kickerStats() { const p = this.cur.K?.[0] ?? this.firstHealthy('K'); return p ? this.profileOf(p, 'O').stats : null; }
  firstHealthy(key) { return (this.team.depth[key] || []).map(id => this.P[id]).find(p => p && !isInjured(p) && !this.out.has(p.id)); }
  beginPlay(sim) {
    this.sim = sim; this.idx = sim.teams.findIndex(t => t.roster === this); this.used = new Set(); this.retPid = null;
    const gp = this.gp(), cur = {};
    for (const key of DEPTH_KEYS) {
      const L = (this.team.depth[key] || []).map(id => this.P[id]).filter(p => p && !isInjured(p) && !this.out.has(p.id));
      const n = SLOTS[key], thr = ROTATE_AT[key];
      if (thr && L.length > n) for (let i = 0; i < Math.min(n, L.length); i++) {
        if (this.fatigueOf(L[i]) > thr) { const j = L.findIndex((q, k) => k >= n && this.fatigueOf(q) < thr - 18); if (j >= 0) [L[i], L[j]] = [L[j], L[i]]; }
      }
      cur[key] = L;
    }
    const featured = gp?.featured?.RB && cur.RB.find(p => p.id === gp.featured.RB);
    if (featured && this.fatigueOf(featured) < 88) cur.RB = [featured, ...cur.RB.filter(p => p !== featured)];
    this.cur = cur;
  }
  profileOf(p, side) {
    const gp = this.gp(), mods = { ...(side === 'O' ? this.staff.off : this.staff.def) };
    if (side === 'D' && gp) {
      const d = gp.def, k = (d.pressure - 50) / 100 * .08, a = (d.aggression - 50) / 100 * .05;
      mods.passRush = (mods.passRush || 0) + k; mods.pursuit = (mods.pursuit || 0) + a; mods.reaction = (mods.reaction || 0) + a;
      mods.zoneCoverage = (mods.zoneCoverage || 0) - a; mods.awareness = (mods.awareness || 0) - a * .6;
    }
    return { pid: p.id, name: p.name, number: p.number, ovr: p.ovr, pos: p.pos, stats: engineStats(p, { fatigue: this.fatigueOf(p), mods }) };
  }
  pick(pos, index) {
    const sim = this.sim, special = sim && SPECIAL.has(sim.play?.type), side = sim && sim.playOffense === this.idx ? 'O' : 'D';
    if (special && (pos === 'KR' || pos === 'PR')) {
      const p = (this.cur[pos] || []).find(q => !this.used.has(q.id)) || (this.cur.RB || [])[0];
      if (p) { this.used.add(p.id); return this.profileOf(p, side); }
    }
    const L = this.cur[pos] || [];
    let p = L.find(q => !this.used.has(q.id)) ?? null; // slots of a position are requested in order: take the first unused
    if (!p) { // fallback: nobody at the position -> the best healthy unused player by rating at that position
      const all = this.team.roster.map(id => this.P[id]).filter(q => !isInjured(q) && !this.out.has(q.id) && !this.used.has(q.id));
      p = all.sort((a, b) => ovrAt(b.ratings, pos) - ovrAt(a.ratings, pos))[0] ?? null;
    }
    if (!p) return null;
    this.used.add(p.id); return this.profileOf(p, side);
  }
  afterPlay(sim, res) {
    if (SPECIAL.has(sim.play.type) || !res) return;
    const side = sim.playOffense === this.idx ? 'O' : 'D', gp = this.gp();
    const tempo = side === 'O' ? 1 + ((gp?.off.tempo ?? 50) - 50) / 100 * .4 : 1, d = res.detail || {};
    for (const sp of sim.players) {
      if (sp.side !== side || !sp.pid) continue;
      const p = this.P[sp.pid]; if (!p) continue;
      this.played[p.id] = (this.played[p.id] || 0) + 1;
      this.fat[p.id] = Math.min(100, this.fatigueOf(p) + (FATIGUE_BASE[p.pos] ?? 1) * (1.16 - p.stamina / 100 * .38) * tempo);
      const involved = [d.carrier, d.tackler, d.target, d.qb].includes(p.id) ? 2.6 : 1;
      const chance = .00016 * (1 + (100 - p.durability) / 55) * (1 + this.fatigueOf(p) / 220) * involved * (this.team.training.intensity === 'heavy' ? 1.1 : 1);
      if (!this.out.has(p.id) && sim.rng.chance(chance)) this.hurt(sim, p);
    }
  }
  hurt(sim, p) {
    const t = weightedPick(sim.rng, INJURY_TYPES, x => x[3]);
    const weeks = Math.max(1, Math.round((t[1] + sim.rng.next() * (t[2] - t[1])) * (1 - this.staff.trainer / 100 * .25)));
    this.out.add(p.id); const inj = { pid: p.id, type: t[0], weeks };
    this.injuries.push(inj); sim.injuries.push({ ...inj, team: this.idx });
    sim.emit('injury', `LESIÓN · ${p.name} (${p.pos}) · ${t[0]}`);
  }
}
