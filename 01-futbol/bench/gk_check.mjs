// Arquero: acciones (spread/gather/...), retención mínima de 5 s, estirada colgada y posición vs distancia del rival.
import { Engine } from "./harness.mjs";
const N = +(process.argv[2] || 3); const acts = {}, holds = [], stuck = { n: 0 }, pos = [];
for (let i = 0; i < N; i++) {
  const m = new Engine(700 + i); m.start();
  const o = m.p3GkStartAct.bind(m); m.p3GkStartAct = (t, k, a) => { acts[k] = (acts[k] || 0) + 1; return o(t, k, a); };
  let cur = null;
  for (let k = 0; k < 60 * 60 * 20 && !m.ended; k++) {
    m.step(1 / 60);
    const ow = m.owner;
    if (ow && ow.role === "GK" && (ow.gkHoldUntil || 0) > m.elapsed - 0.001 && !cur) cur = { gk: ow, t0: m.elapsed };
    if (cur && (m.owner !== cur.gk || m.elapsed >= cur.gk.gkHoldUntil)) { if (m.owner !== cur.gk) { holds.push(+(m.elapsed - cur.t0).toFixed(2)); } cur = m.owner === cur.gk ? null : null; }
    for (const p of m.players) if (p.role === "GK" && p.dive > 0 && (p.diveAge || 0) > (p.diveDur || 0.7) + 0.2) stuck.n++;
    const c = m.owner && m.owner.role !== "GK" ? m.owner : null;
    if (c && k % 30 === 0) { const g = m.players.find((p) => p.role === "GK" && p.team !== c.team); const d = Math.hypot(c.x - 52.5 * -m.direction(g.team) * -1, 0); const dist = Math.hypot(c.x - (-52.5 * m.direction(g.team)), c.z); if (dist < 45) pos.push([Math.round(dist / 5) * 5, +(Math.abs(g.x - (-52.5 * m.direction(g.team)))).toFixed(1)]); }
  }
}
const by = {}; for (const [d, off] of pos) (by[d] = by[d] || []).push(off);
console.log("acciones", acts, "stuck", stuck.n);
console.log("holds (s, ganados por rival o soltados)", holds.length, "min", Math.min(...holds), "mediana", holds.sort((a,b)=>a-b)[holds.length>>1]);
console.log("distancia del rival con pelota -> salida promedio del arquero (m)"); for (const d of Object.keys(by).sort((a, b) => a - b)) console.log(String(d).padStart(3), (by[d].reduce((a, b) => a + b, 0) / by[d].length).toFixed(1), "n=" + by[d].length);
