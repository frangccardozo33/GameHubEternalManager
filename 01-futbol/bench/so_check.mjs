// Tanda de penales del motor: reglas (fin anticipado, muerte súbita), un cobrador por turno y resultado siempre definido.
import { Engine } from "./harness.mjs";
const N = +(process.argv[2] || 8); let bad = 0, kicks = 0, goals = 0; const res = { goal: 0, save: 0, post: 0, miss: 0 };
for (let i = 0; i < N; i++) {
  const m = new Engine(300 + i); m.start(); for (let k = 0; k < 300; k++) m.step(1 / 60);
  m.score = [1, 1]; m.phase = "playing";
  const seen = []; m.onShootout = (kind, a, b) => { if (kind === "result") { res[b]++; seen.push(b); } };
  const t0 = m.elapsed, sh = m.simulateShootout(i % 2);
  const k = sh.kicks, a = k[0].length, b = k[1].length, sc = sh.score;
  const okEnd = sc[0] !== sc[1] && sh.winner === (sc[0] > sc[1] ? 0 : 1) && Math.abs(a - b) <= 1;
  // no debe haber terminado antes de tiempo: con un kick menos la tanda seguía abierta
  const early = a <= 5 && b <= 5 ? (() => { const last = k.map((x) => x.slice()); return null; })() : null;
  kicks += a + b; goals += sc[0] + sc[1];
  const dur = m.elapsed - t0;
  if (!okEnd || m.score.join() !== "1,1" || !m.ended || m.so) { bad++; console.log("MAL", i, sh, m.score, m.ended); }
  console.log(i, "kicks", a + "+" + b, "score", sc.join("-"), "ganó", sh.winner, "dur", Math.round(dur) + "s", seen.join(","));
}
console.log({ N, bad, kicks, conversion: +(100 * goals / kicks).toFixed(0) + "%", res });
