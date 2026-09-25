import { Engine } from "./harness.mjs";
const m = new Engine(40); m.start(); let n = 0, sp = [], back = 0, front = 0;
for (let k = 0; k < 60 * 60 * 6 && !m.ended; k++) { m.step(1 / 60);
  const T = m._tac; if (!T || !m.owner) continue; const t = m.owner.team, d = m.direction(t);
  for (const [id, r] of T[t].passRole) { const p = m.players[id]; const rel = (p.x - m.owner.x) * d; if (r === "back") back++; else front++; sp.push(Math.hypot(p.vx, p.vz));
    if (k % 90 === 0 && n++ < 6) console.log(m.elapsed.toFixed(0), r, "rel x", rel.toFixed(1), "dist", Math.hypot(p.x - m.owner.x, p.z - m.owner.z).toFixed(1), "vel", Math.hypot(p.vx, p.vz).toFixed(1), p.state, "spr", p.sprinting); }
}
console.log({ back, front, velMedia: (sp.reduce((a, b) => a + b, 0) / sp.length).toFixed(2) });
