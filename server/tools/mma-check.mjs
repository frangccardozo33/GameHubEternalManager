import { Hs, dl, STEP_SEC } from '../src/vendor/mma-core.js';
const F = dl(); console.log(F.length, STEP_SEC, F[0].firstName, F[0].division);
const run = () => { const s = new Hs([F[0], F[1]], { seed: 7, rounds: 3, roundSeconds: 300 }); let n = 0; while (!s.result && n++ < 60000) { if (n === 900) s.order(0, 'pressure'); s.step(); } return [n, JSON.stringify(s.result).slice(0, 200)]; };
console.log(run()); console.log(run());
console.log(Object.keys(new Hs([F[0], F[1]], { seed: 7 }).fighters[0]).join(','));
