import { loadEngine } from "../manager/headless.mjs";
import { loadEngineFrom } from "./harness.mjs";
const A = loadEngine(), B = loadEngineFrom("bench/results/fulbo_before.html");
function sample(E, seed) {
  const m = new E(seed); m.start(); m.placePlayers(); const rnd = (() => { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; })();
  const press = [], ctrl = [];
  for (let k = 0; k < 60; k++) {
    for (const p of m.players) { p.x = (rnd() - 0.5) * 100; p.z = (rnd() - 0.5) * 60; const a = rnd() * 6.28, v = rnd() * 6; p.vx = Math.cos(a) * v; p.vz = Math.sin(a) * v; p.stamina = 100; p.timer = 0; }
    m.ai2UpdatePitch(1 / 12); m.ai2UpdatePitch(1 / 12);
    const g = m.pc; for (let c = 0; c < g.n; c += 3) { press.push(g.press0[c]); ctrl.push(g.ctrl[c]); }
  }
  return { press, ctrl };
}
const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(p * (s.length - 1))]; };
const a = sample(A, 5), b = sample(B, 5);
for (const p of [0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95]) console.log("q" + p, "press old", q(b.press, p).toFixed(3), "new", q(a.press, p).toFixed(3), "| ctrl old", q(b.ctrl, p).toFixed(3), "new", q(a.ctrl, p).toFixed(3));
