import { Engine } from "./harness.mjs";
for (let i = 0; i < 6; i++) { const m = new Engine(800 + i); m.start(); let log = [];
  const pc = m.periodCheck.bind(m); m.periodCheck = (dead) => { const before = m.half; const r = pc(dead); if (r) log.push({ half: before, dead, kind: m.restartData && m.restartData.kind, ballY: +m.ball.y.toFixed(2), inField: Math.abs(m.ball.x) < 52.6 && Math.abs(m.ball.z) < 34, t: Math.round(m.time) }); return r; };
  for (let k = 0; k < 60 * 60 * 30 && !m.ended; k++) m.step(1 / 60);
  console.log(i, "ended", m.ended, "score", m.score.join("-"), JSON.stringify(log)); }
