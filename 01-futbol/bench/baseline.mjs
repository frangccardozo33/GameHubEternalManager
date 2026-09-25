import { measureMatch, summarize } from "./harness.mjs";
const seeds = (process.argv[2] || "21,22,23").split(",").map(Number), sec = +(process.argv[3] || 900);
const list = seeds.map((s) => measureMatch(s, { seconds: sec }));
const S = summarize(list);
const f = (x) => (typeof x === "number" ? +x.toFixed(3) : x);
console.log(JSON.stringify(Object.fromEntries(Object.entries(S).map(([k, v]) => [k, typeof v === "object" ? v : f(v)])), null, 1));
const m0 = list[0].match; console.log("stats keys:", Object.keys(m0.stats[0]).join(","));
console.log("ai2 tele sample:", JSON.stringify(m0.ai2Tele || m0.aiTele || null).slice(0, 300));
