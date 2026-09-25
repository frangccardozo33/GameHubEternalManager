import { Engine } from "./harness.mjs";
const m = new Engine(900); m.start(); let starts = [];
const orig = m.p3GkStartAct.bind(m); m.p3GkStartAct = (t, k, o) => { if (m.elapsed > 83 && m.elapsed < 90) starts.push([+m.elapsed.toFixed(2), k, o && o.height]); return orig(t, k, o); };
for (let k = 0; k < 60 * 92; k++) { m.step(1 / 60);
  if (m.elapsed > 84.8 && m.elapsed < 86.2 && k % 6 === 0) { const g = m.players.find(p => p.role === "GK" && p.dive > 0); if (g) { const b = m.ball; console.log(m.elapsed.toFixed(2), g.name, "dive", g.dive.toFixed(2), g.diveKind, "age", (g.diveAge||0).toFixed(2), "z", g.z.toFixed(1), "ball", b.x.toFixed(1), b.z.toFixed(1), b.y.toFixed(2), "v", Math.hypot(b.vx, b.vz).toFixed(1), "shot", !!m.shot, "own", !!m.owner, m.phase); } } }
console.log(starts.join(" | "));
