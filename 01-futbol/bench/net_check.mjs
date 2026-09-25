import { Engine } from "./harness.mjs";
const run = (x, z, vx, vz, vy = 0, y = 0.5) => { const m = new Engine(5); m.start(); for (let k = 0; k < 200; k++) m.step(1 / 60); const s0 = m.score.join();
  m.owner = null; m.shot = null; const b = m.ball; Object.assign(b, { x, z, y, vx, vz, vy }); let minx = 99, ev = "";
  for (let k = 0; k < 120; k++) { m.step(1 / 60); if (m.phase !== "playing") { ev = m.phase; break; } }
  return { score: m.score.join(), phase: m.phase, ball: [b.x, b.z, b.y].map((v) => +v.toFixed(2)) }; };
console.log("lateral fuera del palo (no gol):", run(51.5, 6, 9, -7));
console.log("centro al arco (gol):", run(45, 0, 20, 0));
console.log("gol y rebote red:", run(50, 2, 30, 6, 0));
