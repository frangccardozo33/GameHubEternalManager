// Balance de remates: cuántos van al arco / afuera, atajadas y goles por partido (args: N MIN)
import { Engine } from "./harness.mjs";
const N = +(process.argv[2] || 6), MIN = +(process.argv[3] || 15);
let shots = 0, on = 0, goals = 0, saves = 0, wide = 0, blocked = 0; const fam = {};
for (let i = 0; i < N; i++) { const m = new Engine(3000 + i); m.start();
  const o = m.shoot.bind(m); m.shoot = (t, e, n, v, meta) => { const r = o(t, e, n, v, meta); if (m.shot && m.shot.at === m.elapsed) { shots++; const f = (fam[m.shot.type] ||= { n: 0, on: 0 }); f.n++; if (m.shot.onTarget) { on++; f.on++; } } return r; };
  for (let k = 0; k < 60 * 60 * MIN && !m.ended; k++) m.step(1 / 60);
  goals += m.score[0] + m.score[1]; saves += m.stats[0].saves + m.stats[1].saves; }
console.log({ partidos: N, min: MIN, tiros: shots, alArco: on, pctAlArco: (100 * on / Math.max(1, shots)).toFixed(0) + "%", atajadas: saves, goles: goals, golesPorPartido90: (goals / N * 90 / MIN).toFixed(2), conversionAlArco: (100 * goals / Math.max(1, on)).toFixed(0) + "%" }); console.log(fam);
