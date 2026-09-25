// Robos directos de los pies (Fase 5): intentos de duelo y robos, medidos con los MISMOS campos del motor en ambas versiones.
import { Engine } from "./harness.mjs";
let attempts = 0, wins = 0, fouls = 0, interceptions = 0, mins = 0;
for (const seed of [21, 22, 23]) {
  const m = new Engine(seed); m.start(); let prevOwner = null, f0 = 0;
  for (let i = 0; i < 60 * 900; i++) {
    const ow = m.owner; m.step(1 / 60);
    if (ow && ow.role !== "GK") {
      const att = m.players.filter((q) => q.team !== ow.team && q.tackleAt === m.elapsed || (q.team !== ow.team && Math.abs(q.tackleAt - m.elapsed) < 1e-9));
      if (att.length) { attempts++; if (m.owner === null && m.lastTouch === ow) wins++; }
    }
  }
  mins += 15;
  for (const t of [0, 1]) { fouls += m.stats[t].fouls; interceptions += m.aiTele[t].interceptions; }
}
console.log(JSON.stringify({ minutos: mins, intentosDuelo: attempts, robosDirectos: wins, porPartido90: +((wins / mins) * 90).toFixed(1), intercepciones: interceptions, faltas: fouls }));
