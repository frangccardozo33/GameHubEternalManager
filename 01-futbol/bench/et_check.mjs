// Comprueba la prórroga: con tieBreak.et y empate a los 90′ juega 2 × 15′ más y termina (finalTie si sigue igualado).
import { Engine } from "./harness.mjs";
for (const seed of [1, 2, 3, 4, 5, 6]) {
  const m = new Engine(seed); m.tieBreak = { et: true }; m.start();
  let n = 0, maxHalf = 1, forced = false;
  while (!m.ended && n++ < 60 * 4000) {
    m.step(1 / 60); maxHalf = Math.max(maxHalf, m.half);
    if (!forced && m.half === 2 && m.time > 5300) { m.score[0] = m.score[1] = 0; forced = true; } // fuerza empate para probar
  }
  console.log(seed, "half", maxHalf, "ended", m.ended, "clock", m.clock(), "score", m.score.join("-"), "finalTie", m.finalTie);
}
