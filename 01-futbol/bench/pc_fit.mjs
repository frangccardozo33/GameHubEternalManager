import { loadEngine } from "../manager/headless.mjs";
import { loadEngineFrom } from "./harness.mjs";
const A = loadEngine(), B = loadEngineFrom("bench/results/fulbo_before.html");
function sample(E, seed, useT) {
  const m = new E(seed); m.start(); m.placePlayers(); const rnd = (() => { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; })();
  const out = [];
  for (let k = 0; k < 60; k++) {
    for (const p of m.players) { p.x = (rnd() - 0.5) * 100; p.z = (rnd() - 0.5) * 60; const a = rnd() * 6.28, v = rnd() * 6; p.vx = Math.cos(a) * v; p.vz = Math.sin(a) * v; p.stamina = 100; p.timer = 0; }
    m.ai2UpdatePitch(1 / 12); m.ai2UpdatePitch(1 / 12);
    const g = m.pc; for (let c = 0; c < g.n; c += 3) out.push(useT ? g.T1[c] : g.press0[c]);
  }
  return out;
}
const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(p * (s.length - 1))]; };
const old = sample(B, 5, false), T = sample(A, 5, true), qs = [0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99];
const target = qs.map((p) => q(old, p));
let best = null;
for (const Amp of [0.8, 1, 1.3, 1.6, 2]) for (const lam of [0.5, 0.7, 0.9, 1.1, 1.4]) for (const T0 of [0.2, 0.35, 0.5, 0.7]) for (const cap of [0.7, 0.95, 1.3]) {
  const pr = T.map((t) => 1 - Math.exp(-0.9 * Math.min(cap, Amp * Math.exp(-(t - T0) / lam))));
  const err = qs.reduce((s, p, i) => s + (q(pr, p) - target[i]) ** 2, 0);
  if (!best || err < best.err) best = { err, Amp, lam, T0, cap, got: qs.map((p) => +q(pr, p).toFixed(3)) };
}
console.log("objetivo (viejo)", target.map((x) => +x.toFixed(3)).join(","), "\nmejor", JSON.stringify(best));
