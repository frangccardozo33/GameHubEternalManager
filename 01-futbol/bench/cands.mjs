import { Engine } from "./harness.mjs";
const hist = new Array(8).fill(0); let n = 0, safeHist = 0;
for (const seed of [21, 22, 23]) {
  const m = new Engine(seed), o = m.ai2PassCandidates.bind(m);
  m.ai2PassCandidates = function (t, ctx) { const r = o(t, ctx); hist[Math.min(7, r.length)]++; n++; return r; };
  m.start(); for (let i = 0; i < 60 * 600; i++) m.step(1 / 60);
}
console.log("decisiones", n, "nº candidatos de pase (0..7+):", hist.join(","), "| sin candidatos:", (100 * hist[0] / n).toFixed(0) + "%");
