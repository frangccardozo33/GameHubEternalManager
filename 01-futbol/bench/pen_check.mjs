// Conversión de penales del motor (esperable ~70-80 %). Uso: node bench/pen_check.mjs [n]
import { Engine } from "./harness.mjs";
const N = +(process.argv[2] || 40); let goals = 0, saves = 0, other = 0;
for (let i = 0; i < N; i++) {
  const m = new Engine(100 + i); m.start(); for (let k = 0; k < 300; k++) m.step(1 / 60);
  const t = i % 2, s0 = m.score[t];
  m.phase = "playing"; m.owner = null; m.shot = null; m.awardPenalty(t, 1 - t);
  let kicked = null, res = null;
  for (let k = 0; k < 60 * 12 && !res; k++) {
    m.step(1 / 60);
    if (kicked == null && m.shot && m.shot.type === "Penal") kicked = m.elapsed;
    if (kicked != null) { const ev = m.events.find((e) => e.at >= kicked - 0.02 && ["goal", "save", "post"].includes(e.type)); if (ev) res = ev.type; else if (m.elapsed - kicked > 5) res = "other"; }
  }
  if (res === "goal") goals++; else if (res === "save") saves++; else other++;
}
console.log({ N, goals, saves, other, pct: +(100 * goals / N).toFixed(0) });
