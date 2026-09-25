// Simulation uses yards, seconds and a seeded PRNG. It never imports rendering code.
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export const lerp = (a, b, t) => a + (b - a) * t;
export class Random {
  constructor(seed = 42) { this.state = seed >>> 0; }
  next() { let t = this.state += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  range(a, b) { return lerp(a, b, this.next()); }
  chance(p) { return this.next() < clamp(p, 0, 1); }
  pick(items) { return items[Math.floor(this.next() * items.length)]; }
}
export function move(player, target, dt, factor = 1) {
  const dx = target.x - player.x, dz = target.z - player.z;
  const length = Math.hypot(dx, dz);
  const maxSpeed = (3.3 + player.stats.speed * 4.7) * factor;
  const desired = Math.min(maxSpeed, length / Math.max(dt, 0.001));
  const blend = Math.min(1, dt * (3 + player.stats.acceleration * 6));
  player.vx = lerp(player.vx, length > .01 ? dx / length * desired : 0, blend);
  player.vz = lerp(player.vz, length > .01 ? dz / length * desired : 0, blend);
  player.x += player.vx * dt; player.z += player.vz * dt;
  player.speed = Math.hypot(player.vx, player.vz);
  if (player.speed > .2) player.heading = Math.atan2(player.vx, player.vz);
  player.x = clamp(player.x, -28, 28);
  player.z = clamp(player.z, -12, 112);
}
