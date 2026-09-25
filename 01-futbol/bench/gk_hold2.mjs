import { Engine } from "./harness.mjs";
const m = new Engine(700); m.start(); let val = null, n = 0, cnt = 0;
Object.defineProperty(m, "owner", { get() { return val; }, set(v) { if (val && val.role === "GK" && (val.gkHoldUntil || 0) > m.elapsed && v !== val && cnt++ < 3 && m.elapsed > 30) { console.log("owner cleared", v && v.role, new Error().stack.split("\n").slice(2, 5).join(" | ")); } val = v; } });
for (let k = 0; k < 60 * 60 * 12 && !m.ended; k++) m.step(1 / 60);
