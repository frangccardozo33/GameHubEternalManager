import { Engine } from "./harness.mjs";
const $i = (a, o) => { const c = Math.hypot(a, o); return c < 1e-6 ? { x: 0, z: 0 } : { x: a / c, z: o / c }; };
const te = (v, a, b) => Math.min(b, Math.max(a, v));
const which = process.argv[2] || "none";
const P = Engine.prototype;
if (which.includes("pace")) P.p1Pace = function (l, tx, tz, v0, s0) { return { r: v0, sprint: s0, why: "legacy" }; };
if (which.includes("move")) { const _m = P.move; P.move = function (t, e, n, s, r = 1) {
  t.timer > 0 && (r *= 0.35); t.ai && t.ai.slowUntil > this.elapsed && (r *= 0.62);
  const st = t.stamina ?? 100, fat = 0.8 + 0.2 * st / 100; r *= fat; t.sprinting && st > 40 && (r *= 1.24);
  const a = e - t.x, o = n - t.z, c = Math.hypot(a, o), l = $i(a, o), d = (4.4 + t.stats.speed * 0.037) * r, h = Math.min(d, c * 2.3), p = 1 - Math.exp(-(3 + t.stats.acceleration * 0.035) * s);
  t.vx += (l.x * h - t.vx) * p; t.vz += (l.z * h - t.vz) * p; t.x = te(t.x + t.vx * s, -52, 52); t.z = te(t.z + t.vz * s, -33.5, 33.5);
  Math.hypot(t.vx, t.vz) > 0.3 && (t.angle = Math.atan2(t.vx, t.vz)); t.speedTier = this.speedTier(Math.hypot(t.vx, t.vz)); }; }
let shots = 0, dg = [], press = [], comp = 0, pas = 0, lost = 0, ints = 0;
for (const seed of [21, 22, 23]) {
  const m = new Engine(seed); const orig = m.shoot.bind(m);
  m.shoot = function (t, ...a) { const dir = this.direction(t.team); dg.push(Math.hypot(52.5 * dir - t.x, t.z)); shots++; return orig(t, ...a); };
  m.start(); for (let i = 0; i < 60 * 600; i++) m.step(1 / 60);
  for (const t of [0, 1]) { pas += m.stats[t].passes; comp += m.stats[t].completed; ints += m.aiTele[t].interceptions; }
}
dg.sort((a, b) => a - b);
console.log(which.padEnd(10), "shots", shots, "medDist", dg[Math.floor(dg.length / 2)]?.toFixed(1), ">20m", dg.filter((x) => x > 20).length, "passes", pas, "comp%", (100 * comp / pas).toFixed(0), "interceptions", ints);
