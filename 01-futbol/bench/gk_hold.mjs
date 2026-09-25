import { Engine } from "./harness.mjs";
const m = new Engine(700); m.start(); let cur = null, n = 0;
for (let k = 0; k < 60 * 60 * 12 && !m.ended && n < 12; k++) {
  m.step(1 / 60);
  const ow = m.owner;
  if (!cur && ow && ow.role === "GK" && (ow.gkHoldUntil || 0) > m.elapsed) cur = { gk: ow, t0: m.elapsed, ph: m.phase };
  else if (cur && (m.owner !== cur.gk || m.elapsed > cur.gk.gkHoldUntil)) { console.log("hold", (m.elapsed - cur.t0).toFixed(2), "fin:", m.owner === cur.gk ? "cumplido" : "perdida->" + (m.owner ? m.owner.role + m.owner.team : "libre"), "fase", m.phase, "state", cur.gk.state); cur = null; n++; }
}
