import { Engine } from "./harness.mjs";
const N = +(process.argv[2] || 4), MIN = +(process.argv[3] || 15), rule = process.argv[4] === "rule";
let shots = 0, firstNear = 0, firstAll = 0, goals = 0, passes = 0, firstPass = 0, on = 0, nearShots = 0;
for (let i = 0; i < N; i++) { const m = new Engine(2000 + i); m.start(); if (rule) for (const t of [0, 1]) m.setRule(t, "oneTouchPlay", { on: true });
  const o = m.shoot.bind(m); m.shoot = (t, e, n, v, meta) => { const dg = Math.hypot(52.5 * m.direction(t.team) - t.x, t.z); if (!e && !v) { shots++; if (dg < 22) nearShots++; if (n) { firstAll++; if (dg < 22) firstNear++; } } return o(t, e, n, v, meta); };
  const p0 = m.pass.bind(m); m.pass = (t, pick, cross, x, meta) => { passes++; if (t.ai && t.ai.firstTime) firstPass++; return p0(t, pick, cross, x, meta); };
  for (let k = 0; k < 60 * 60 * MIN && !m.ended; k++) m.step(1 / 60); goals += m.score[0] + m.score[1]; }
console.log({ shots, tirosCerca: nearShots, primeraCerca: firstNear, primeraTotal: firstAll, pctPrimeraCerca: (100 * firstNear / Math.max(1, nearShots)).toFixed(0) + "%", pases: passes, goles: goals });
