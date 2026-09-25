import { Engine } from "./harness.mjs";
const R = { on: [0, 0, 0], off: [0, 0, 0] };
for (let i = 0; i < 4; i++) for (const on of [true, false]) { const m = new Engine(1500 + i); m.start(); m.setRule(0, "lastDefender", { on }); m.setRule(1, "lastDefender", { on });
  for (let k = 0; k < 60 * 60 * 15 && !m.ended; k++) m.step(1 / 60);
  const a = R[on ? "on" : "off"]; a[0] += m.stats[0].offside + m.stats[1].offside; a[1] += m.stats[0].shots + m.stats[1].shots; a[2] += m.score[0] + m.score[1]; }
console.log("[fuera de juego, tiros, goles] en 4 partidos de 15 min", R);
