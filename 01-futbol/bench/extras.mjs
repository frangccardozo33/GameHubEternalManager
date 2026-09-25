// Extras por versión: intercepciones vs robos directos, tiros por zona/tipo, picos de velocidad (¿de dónde salen?).
import { measureMatch } from "./harness.mjs";
const seeds = (process.argv[2] || "21,22,23").split(",").map(Number), sec = +(process.argv[3] || 900);
const acc = { tackles: 0, intercepts: 0, shots: 0, longShots: 0, spec: 0, onTarget: 0, xg: 0, goals: 0, duelWon: 0, duelLost: 0, corners: 0, offside: 0 };
const spikes = [];
for (const s of seeds) {
  const m = new (await import("./harness.mjs")).Engine(s);
  m.start();
  let last = new Map(), n = 0;
  while (!m.ended && n++ < sec * 60) {
    m.step(1 / 60);
    for (const p of m.players) { const v = Math.hypot(p.vx, p.vz); if (v > 11.5 && spikes.length < 12) spikes.push({ s, t: +m.elapsed.toFixed(1), id: p.id, v: +v.toFixed(1), state: p.state, phase: m.phase, ragdoll: p.ragdoll && p.ragdoll.phase, lock: p.tlLock > m.elapsed, tier: p.tacticalRole }); }
  }
  for (const t of [0, 1]) { const st = m.stats[t]; acc.tackles += st.tackles; acc.shots += st.shots; acc.onTarget += st.onTarget; acc.xg += st.xg; acc.corners += st.corners; acc.offside += st.offside; const tl = m.aiTele[t]; acc.intercepts += tl.interceptions; acc.longShots += tl.long_shots; acc.spec += tl.speculative_shots; }
  acc.goals += m.score[0] + m.score[1];
  if (m.p1) { acc.duelWon += m.p1.cnt.duel_won || 0; acc.duelLost += m.p1.cnt.duel_lost || 0; }
}
console.log(JSON.stringify(acc), "\nspikes >11.5 m/s:", JSON.stringify(spikes.slice(0, 8)));
