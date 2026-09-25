// Bench headless de la capa TLB: tipos de remate/regate/barrida, goles con paquete, emojis. Uso: node tlb/bench.mjs [n]
import { loadEngine, runMatch } from "../ai2/sim.mjs";
const E = loadEngine(), N = +process.argv[2] || 8, agg = { shots: {}, skills: {}, slides: {}, slideFail: 0, lastDitch: 0, emoji: 0, goals: 0, holds: 0 };
const add = (o, k) => { if (typeof o[k] === "object") return; };
let ok = 0, celeb = 0, follow = 0, assists = 0, ms = 0;
for (let s = 1; s <= N; s++) {
  const m = runMatch(E, s * 7 + 3, { setup: (m) => { m.onEvent = (ev) => { if (ev.type === "goal" && m.tlGoal) { ok++; if (m.tlGoal.assistName) assists++; } }; } });
  const T = m.tlTele; ms += m._cpuMs;
  for (const k of ["shots", "skills", "slides"]) for (const [a, b] of Object.entries(T[k])) agg[k][a] = (agg[k][a] || 0) + b;
  for (const k of ["slideFail", "lastDitch", "emoji", "goals", "holds"]) agg[k] += T[k];
  if (!m.ended) console.log("NO TERMINÓ seed", s);
}
console.log(JSON.stringify(agg, null, 1)); console.log("goles con tlGoal:", ok, "con asistente:", assists, "cpu/match ms:", (ms / N).toFixed(0));
