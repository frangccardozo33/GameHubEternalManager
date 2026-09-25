// Comprueba que ningún delantero cerca del arco queda sin defensor del lado del arco. Uso: node bench/defense_check.mjs [seeds] [segundos]
import { Engine } from "./harness.mjs";
const seeds = (process.argv[2] || "31,32,33").split(",").map(Number), sec = +(process.argv[3] || 600);
let frames = 0, alone = 0, aloneNoBall = 0, goals = 0;
for (const seed of seeds) {
  const m = new Engine(seed); m.start();
  for (let t = 0; t < sec * 60; t++) {
    m.step(1 / 60);
    if (t % 6) continue;
    for (const tm of [0, 1]) {
      const d = m.direction(tm), dfs = m.players.filter((p) => p.team === tm && p.role !== "GK" && !p.sentOff);
      for (const a of m.players.filter((p) => p.team !== tm && p.role !== "GK" && !p.sentOff)) {
        if (!m.owner || m.owner.team === tm || a.x * d + 52.5 > 28 || Math.abs(a.z) > 18 || m.ball.x * d + 52.5 > 45) continue;
        frames++;
        const covered = dfs.some((q) => Math.hypot(q.x - a.x, q.z - a.z) < 7 && q.x * d <= a.x * d + 1.5);
        if (!covered) { alone++; if (m.owner !== a) aloneNoBall++; }
      }
    }
  }
  goals += m.score ? m.score[0] + m.score[1] : 0;
}
console.log({ frames, alone, pctAlone: +(100 * alone / Math.max(1, frames)).toFixed(1), aloneNoBall, goals });
