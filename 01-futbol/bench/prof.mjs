import { Engine } from "./harness.mjs";
const m = new Engine(21); m.start(); const t0 = performance.now();
for (let i = 0; i < 60 * 600; i++) m.step(1 / 60);
console.log("600 s de partido:", ((performance.now() - t0) / 1000).toFixed(1), "s");
