import { Engine } from "./harness.mjs";
const N = +(process.argv[2] || 3), MIN = +(process.argv[3] || 15); const ty = {}, gl = {}, on = {}; let shots = 0, goals = 0, sv = 0, t0 = Date.now(), gkOnly = 0, atGk = 0;
for (let i = 0; i < N; i++) { const m = new Engine(500 + i); m.start(); const o = m.shoot.bind(m);
  m.shoot = (t, ...a) => { o(t, ...a); const sh = m.shot; if (sh && sh.player === t.id) { shots++; ty[sh.type] = (ty[sh.type] || 0) + 1; if (sh.onTarget) { on[sh.type] = (on[sh.type] || 0) + 1;
      const gk = m.players[(1 - t.team) * 11]; // ¿pasa a menos de 1 m del arquero? (proxy de "tiro al arquero")
      const b = m.ball; const tt = Math.abs((52.5 * m.direction(t.team) - b.x) / (b.vx || 1)); const zc = b.z + b.vz * tt; if (Math.abs(zc - gk.z) < 0.9) atGk++; else gkOnly++; } } };
  const g0 = m.goal.bind(m); m.goal = (tm) => { if (m.shot) gl[m.shot.type] = (gl[m.shot.type] || 0) + 1; goals++; return g0(tm); };
  for (let k = 0; k < 60 * 60 * MIN && !m.ended; k++) m.step(1 / 60); }
console.log({ shots, goals, ms: Date.now() - t0 }); console.log("tipos", ty); console.log("al arco", on); console.log("goles", gl); console.log("al arco pasando a <0.9 m del arquero:", atGk, "de", atGk + gkOnly);
