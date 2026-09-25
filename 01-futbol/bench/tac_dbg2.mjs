import { Engine } from "./harness.mjs";
const m = new Engine(40); m.start(); let n = 0;
for (let k = 0; k < 60 * 60 * 8 && !m.ended; k++) { m.step(1 / 60);
  const T = m._tac; if (!T) continue;
  if (k % 30 === 0 && n < 10) for (const t of [0,1]) if (T[t].huntList.length && m.owner && m.owner.team===t) { n++; const d=m.direction(t); for (const id of T[t].huntList) { const p=m.players[id]; console.log(m.elapsed.toFixed(1), p.name, "pos", (p.x*d).toFixed(1), p.z.toFixed(1), "sp", Math.hypot(p.vx,p.vz).toFixed(1), JSON.stringify(p.p1&&p.p1.mv), "state", p.state, "frozen", p.tlFrozen>m.elapsed, "lock", p.tlLock>m.elapsed, "ai", p.aiChase===m.elapsed); } }
}
