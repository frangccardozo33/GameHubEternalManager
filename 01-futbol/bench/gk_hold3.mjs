import { Engine } from "./harness.mjs";
let holds = 0;
for (let sd = 0; sd < 3; sd++) { const m = new Engine(700 + sd); m.start(); let cur = null;
  for (let k = 0; k < 60 * 60 * 12 && !m.ended; k++) { m.step(1 / 60);
    const ow = m.owner;
    if (!cur && ow && ow.role === "GK" && (ow.gkHoldUntil || 0) > m.elapsed) cur = { gk: ow, t0: m.elapsed, x0: ow.x, z0: ow.z, minD: 99, states: new Set(), maxOut: 0 };
    if (cur) { for (const p of m.players) if (m.elapsed - cur.t0 > 0.5 && p.team !== cur.gk.team && !p.sentOff) cur.minD = Math.min(cur.minD, Math.hypot(p.x - cur.gk.x, p.z - cur.gk.z));
      cur.states.add(cur.gk.state); const s = m.direction(cur.gk.team); cur.maxOut = Math.max(cur.maxOut, ((cur.gk.x - -52.5 * s) * s));
      if (m.owner !== cur.gk || m.elapsed > cur.gk.gkHoldUntil) { holds++; console.log("hold", (m.elapsed - cur.t0).toFixed(1) + "s", "se movió", Math.hypot(cur.gk.x - cur.x0, cur.gk.z - cur.z0).toFixed(1) + "m", "rival más cerca", cur.minD.toFixed(1) + "m", "salida máx", cur.maxOut.toFixed(1), [...cur.states].join(",")); cur = null; } } } }
console.log({ holds });
