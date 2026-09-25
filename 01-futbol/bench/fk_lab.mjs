import { Engine } from "./harness.mjs";
const kinds = ["fk_direct_near", "fk_direct_mid", "fk_wide_cross", "fk_far_cross"]; const R = {};
for (const kind of kinds) { R[kind] = { shot: 0, pass: 0, other: 0, n: 0 };
  for (let i = 0; i < 12; i++) { const m = new Engine(1200 + i); m.start(); for (let k = 0; k < 200; k++) m.step(1 / 60);
    let shots0 = m.stats[0].shots + m.stats[1].shots, passes0 = m.stats[0].passes + m.stats[1].passes;
    m.p3DebugScenario(kind, 0); for (let k = 0; k < 60 * 25; k++) { m.step(1 / 60); if (m.phase === "playing" && k > 400) break; }
    const sh = m.stats[0].shots + m.stats[1].shots - shots0, ps = m.stats[0].passes + m.stats[1].passes - passes0;
    R[kind].n++; if (sh) R[kind].shot++; else if (ps) R[kind].pass++; else R[kind].other++; } }
console.log(R);
