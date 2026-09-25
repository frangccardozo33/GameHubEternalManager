import { Engine } from "./harness.mjs";
const m = new Engine(21); m.start(); for (let i = 0; i < 60 * 600; i++) m.step(1 / 60);
console.log(JSON.stringify(m.p1.cnt));
const by = {}; for (const e of m.p1.log) (by[e.kind] = by[e.kind] || []).push(e);
for (const k of Object.keys(by)) console.log(k, by[k].length, JSON.stringify(by[k][by[k].length - 1]).slice(0, 700));
