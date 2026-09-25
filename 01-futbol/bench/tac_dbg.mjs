import { Engine } from "./harness.mjs";
const m = new Engine(40); m.start(); let last = 0, n = 0, hunt = 0, frames = 0, st = {};
for (let k = 0; k < 60 * 60 * 8 && !m.ended; k++) { m.step(1 / 60);
  const T = m._tac; if (!T) continue;
  for (const t of [0,1]) { if (T[t].huntList.length) { hunt++; }
    for (const p of m.players) if (p.team===t && p.state==="BoxRun") st.box=(st.box||0)+1; }
  if (m.owner && m.owner.x*m.direction(m.owner.team) > 17.5) frames++;
  if (m.owner && m.owner.x*m.direction(m.owner.team) > 17.5 && k % 40 === 0 && n++ < 6) { const t=m.owner.team, d=m.direction(t); console.log("t",m.elapsed.toFixed(0),"carrier x*d",(m.owner.x*d).toFixed(0),"hunt",T[t].huntList, "positions", T[t].huntList.map(id=>[m.players[id].x*d|0, m.players[id].z|0, m.players[id].state, (m.players[id].vx**2+m.players[id].vz**2)**.5|0])); }
}
console.log({ hunt, frames, st });
