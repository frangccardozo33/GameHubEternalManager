// node bench/summary.mjs <out.json> [seeds] [seconds]   (BENCH_HTML=... para medir otra versión del motor)
import fs from "node:fs";
import { measureMatch, summarize } from "./harness.mjs";
const out = process.argv[2], seeds = (process.argv[3] || "21,22,23,24").split(",").map(Number), sec = +(process.argv[4] || 900);
const list = seeds.map((s) => measureMatch(s, { seconds: sec }));
const S = summarize(list);
const extra = { ms: S.ms, msPer90min: (S.ms / (seeds.length * sec)) * 5400 };
fs.writeFileSync(out, JSON.stringify({ seeds, sec, ...S, ...extra }, null, 1));
console.log("escrito", out, "| tiempo de simulación por 90 min de partido:", (extra.msPer90min / 1000).toFixed(1), "s");
