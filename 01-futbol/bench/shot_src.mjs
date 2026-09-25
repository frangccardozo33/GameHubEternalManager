import { Engine } from "./harness.mjs";
const c = {}; for (let i = 0; i < 3; i++) { const m = new Engine(500 + i); m.start(); const o = m.shoot.bind(m);
  m.shoot = (t, e, n, v, meta) => { const dg = Math.hypot(52.5 * m.direction(t.team) - t.x, t.z); if (dg > 21) { const k = (meta && meta.decision ? meta.decision.key : "sin-meta") + (e ? "/cabeza" : "") + (v ? "/volea" : "") + (n ? "/primera" : ""); c[k] = (c[k] || 0) + 1; } return o(t, e, n, v, meta); };
  for (let k = 0; k < 60 * 60 * 15 && !m.ended; k++) m.step(1 / 60); }
console.log(c);
