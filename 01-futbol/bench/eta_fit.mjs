import { Engine } from "./harness.mjs";
const m = new Engine(1); m.start(); const p = m.players[6];
function approx(P, v0, d, k) { const vm = P.vsp, a = P.a0 * k; let al = Math.min(v0, vm * 0.98), t;
  if (al >= 0) { const dA = (vm * vm - al * al) / (2 * a); t = d <= dA ? (Math.sqrt(al * al + 2 * a * d) - al) / a : (vm - al) / a + (d - dA) / vm; }
  else { const dd = d + al * al / (2 * a), dA = vm * vm / (2 * a); t = -al / a + (dd <= dA ? Math.sqrt(2 * a * dd) / a : vm / a + (dd - dA) / vm); }
  return t; }
let best = null;
for (const k of [0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.8, 0.9, 1]) {
  let err = 0, n = 0, maxe = 0;
  for (const sp of [55, 75, 95]) for (const ac of [55, 75, 95]) for (const d of [1, 3, 6, 10, 15, 25, 40, 60]) for (const v0 of [-4, 0, 3, 6]) {
    p.stats.speed = sp; p.stats.acceleration = ac; p.stamina = 100; p.x = 0; p.z = 0; p.vx = v0; p.vz = 0;
    const ex = m.p1ETA(p, d, 0, { react: 0 }), ap = approx(m.p1Phys(p), v0, d, k); err += (ex - ap) ** 2; n++; maxe = Math.max(maxe, Math.abs(ex - ap));
  }
  console.log("k", k, "rmse", Math.sqrt(err / n).toFixed(3), "max", maxe.toFixed(2)); if (!best || err < best.err) best = { k, err };
}
console.log("mejor", best.k);
