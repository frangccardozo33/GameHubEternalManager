// Detecta arqueros con dive>0 "congelado" (más tiempo que su duración) y goles con el arquero reteniendo la pelota.
import { Engine } from "./harness.mjs";
const N = +(process.argv[2] || 6); let stuck = 0, frames = 0, ownedDive = 0, goals = 0, sideGoals = 0;
for (let i = 0; i < N; i++) {
  const m = new Engine(900 + i); m.start(); const since = new Map();
  for (let k = 0; k < 60 * 60 * 20 && !m.ended; k++) {
    m.step(1 / 60); frames++;
    for (const p of m.players) if (p.role === "GK") {
      if (p.dive > 0) { const s = since.get(p.id) ?? m.elapsed; since.set(p.id, s); if (m.owner === p) ownedDive++; if ((p.diveAge || 0) > (p.diveDur || 0.7) + 0.2) { stuck++; if (stuck < 4) console.log("STUCK", i, p.name, p.diveKind, "dive", p.dive.toFixed(2), "owner", m.owner === p, "t", m.elapsed.toFixed(1)); since.delete(p.id); } }
      else since.delete(p.id);
    }
  }
  goals += m.score[0] + m.score[1];
}
console.log({ N, frames, stuck, ownedDive, goals });
