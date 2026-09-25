import { Engine } from "./harness.mjs";
const N = +(process.argv[2] || 3), MIN = +(process.argv[3] || 15); const d = []; let goals = 0, gz = 0, pass = 0;
for (let i = 0; i < N; i++) { const m = new Engine(500 + i); m.start(); const o = m.shoot.bind(m);
  m.shoot = (t, ...a) => { const dg = Math.hypot(52.5 * m.direction(t.team) - t.x, t.z); if (!a[0]) d.push(dg); return o(t, ...a); };
  const g0 = m.goal.bind(m); m.goal = (t) => { if (m.shot && m.shot.golazo) gz++; return g0(t); };
  for (let k = 0; k < 60 * 60 * MIN && !m.ended; k++) m.step(1 / 60); goals += m.score[0] + m.score[1]; pass += m.stats[0].passes + m.stats[1].passes; }
const pc = (f) => (100 * d.filter(f).length / d.length).toFixed(0) + "%";
console.log({ tiros: d.length, ">21m": pc((x) => x > 21), ">28m": pc((x) => x > 28), goles: goals, golazos: gz, pases: pass });
