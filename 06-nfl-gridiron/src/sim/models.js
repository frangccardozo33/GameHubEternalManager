import { clamp } from './math.js';

export const TEAM_STYLES = ['BALANCED', 'RUN HEAVY', 'PASS HEAVY', 'DEEP PASS', 'QUICK PASS'];
export const DEFENSE_STYLES = ['BALANCED', 'PRESSURE', 'COVERAGE', 'RUN STOP'];
export const TEAMS = [
  { name: 'North Wolves', short: 'NTH', city: 'NORTH', mascot: 'WOLVES', color: '#49a6f5', dark: '#14375c', style: 'BALANCED', defense: 'COVERAGE' },
  { name: 'Austin Outlaws', short: 'ATX', city: 'AUSTIN', mascot: 'OUTLAWS', color: '#ff8552', dark: '#542b20', style: 'RUN HEAVY', defense: 'PRESSURE' },
];
export const ATTRIBUTES = ['speed','acceleration','agility','strength','awareness','armStrength','shortAccuracy','mediumAccuracy','deepAccuracy','mobility','decisionMaking','throwUnderPressure','vision','carrying','contactBalance','routeRunning','catching','release','contestedCatch','passBlocking','runBlocking','technique','passRush','tackling','pursuit','manCoverage','zoneCoverage','reaction','press','range','kickPower','kickAccuracy'];
// Base profile per position (0-1). The manager layer scales these by player talent.
export const PROFILE = {
  QB: { speed: .55, armStrength: .86, shortAccuracy: .88, mediumAccuracy: .81, deepAccuracy: .71, decisionMaking: .83, awareness: .81, mobility: .6, throwUnderPressure: .7 },
  RB: { speed: .87, acceleration: .9, agility: .88, vision: .82, carrying: .91, strength: .74, contactBalance: .85, catching: .72 },
  WR: { speed: .94, acceleration: .88, agility: .86, routeRunning: .88, release: .82, catching: .87, contestedCatch: .72 },
  TE: { speed: .73, strength: .8, catching: .85, contestedCatch: .86, routeRunning: .77, runBlocking: .76 },
  OL: { speed: .36, strength: .91, passBlocking: .85, runBlocking: .85, technique: .87 },
  DL: { speed: .59, strength: .89, passRush: .84, tackling: .81, pursuit: .7 },
  LB: { speed: .76, strength: .8, tackling: .88, awareness: .81, pursuit: .88, passRush: .74 },
  CB: { speed: .92, agility: .9, manCoverage: .83, zoneCoverage: .81, reaction: .82, press: .8, catching: .64 },
  S: { speed: .86, awareness: .86, zoneCoverage: .85, tackling: .82, reaction: .85, range: .92, catching: .69 },
  K: { kickPower: .86, kickAccuracy: .84 },
  P: { kickPower: .84, kickAccuracy: .8 },
};
export class PlayerStats {
  // With `values` (0-1 per attribute) the stats come from a persistent roster player; otherwise Phase 1 random stats.
  constructor(role, rng, values = null) {
    if (values) { for (const key of ATTRIBUTES) this[key] = clamp(values[key] ?? .62, .3, .98); return; }
    for (const key of ATTRIBUTES) {
      // Kicking attributes are neutral in random Phase 1 players and do not consume the PRNG (seed-stable).
      if (key.startsWith('kick')) { this[key] = .62; continue; }
      this[key] = clamp((PROFILE[role][key] ?? .62) + rng.range(-.08, .08), .3, .98);
    }
  }
}
export class Player {
  constructor(id, role, side, x, z, rng, number, profile = null) {
    Object.assign(this, { id, role, side, x, z, start: { x, z }, vx: 0, vz: 0, speed: 0, heading: side === 'O' ? 0 : Math.PI, number: profile?.number ?? number, state: 'stance', assignment: {}, routeIndex: 0, cooldown: 0, engaged: null, fallen: 0, pid: profile?.pid ?? null, name: profile?.name ?? null, ovr: profile?.ovr ?? null });
    this.stats = new PlayerStats(role, rng, profile?.stats ?? null);
  }
}
export class Ball {
  constructor() { this.x = 0; this.y = .65; this.z = 25; this.mode = 'dead'; this.owner = null; this.flight = null; this.vx = 0; this.vy = 0; this.vz = 0; }
  // Every transfer travels through space, including snap and handoff.
  launch(start, end, duration, arc, kind, target = null) {
    Object.assign(this, { x: start.x, y: start.y, z: start.z, owner: null, mode: 'flight' });
    this.flight = { start: { ...start }, end: { ...end }, duration, arc, kind, target, t: 0 };
  }
  attach(player) { this.owner = player.id; this.mode = 'carried'; this.flight = null; }
  step(dt, players) {
    if (this.mode === 'carried') {
      const p = players.find(p => p.id === this.owner);
      if (p) { this.x = p.x + Math.sin(p.heading) * .24; this.z = p.z + Math.cos(p.heading) * .24; this.y = p.fallen ? .32 : 1.12; }
    } else if (this.mode === 'flight') {
      const f = this.flight; f.t += dt; const t = clamp(f.t / f.duration, 0, 1);
      this.x = f.start.x + (f.end.x - f.start.x) * t;
      this.z = f.start.z + (f.end.z - f.start.z) * t;
      this.y = f.start.y + (f.end.y - f.start.y) * t + 4 * f.arc * t * (1 - t);
      return t >= 1 ? f : null;
    } else if (this.mode === 'loose') {
      this.vy -= 10.7 * dt; this.x += this.vx * dt; this.z += this.vz * dt; this.y += this.vy * dt;
      if (this.y < .16) { this.y = .16; this.vy = Math.abs(this.vy) * .47; this.vx *= .74; this.vz *= .74; }
    }
    return null;
  }
}
