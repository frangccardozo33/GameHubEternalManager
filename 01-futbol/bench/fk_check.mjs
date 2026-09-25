import { Engine } from "./harness.mjs";
const out = []; const N = +(process.argv[2] || 4);
for (let i = 0; i < N; i++) { const m = new Engine(900 + i); m.start(); let cur = null;
  for (let k = 0; k < 60 * 60 * 15 && !m.ended; k++) { m.step(1 / 60);
    const o = m.owner;
    if (!cur && o && o.spTaker && o.spTaker.kind === "freekick" && o.spTaker.until > m.elapsed) cur = { p: o, t0: m.elapsed, x0: o.x, z0: o.z, bx: m.ball.x, bz: m.ball.z, d: o.spTaker.direct, dg: Math.hypot(52.5 * m.direction(o.team) - o.x, o.z), mode: m.restartData && m.restartData.p3mode };
    else if (cur && (m.owner !== cur.p || m.elapsed - cur.t0 > 8)) { out.push({ dt: +(m.elapsed - cur.t0).toFixed(1), moved: +Math.hypot(cur.p.x - cur.x0, cur.p.z - cur.z0).toFixed(1), direct: cur.d, dist: Math.round(cur.dg), state: cur.p.state, lastDecision: cur.p.lastDecision, ball: m.ball ? Math.round(Math.hypot(m.ball.vx, m.ball.vz)) : 0 }); cur = null; } } }
console.log(out.length, "tiros libres"); out.forEach((x) => console.log(JSON.stringify(x)));
