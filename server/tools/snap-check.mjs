// Prueba: la foto completa del motor deja a un motor desviado idéntico al del servidor (misma firma tras N pasos).
import { TLM } from '../src/vendor/football-core.js';
import { makeEngine } from '../src/vendor/football-engine.js';
import { snapOf, applySnap, Lockstep } from '../../01-futbol/online/lockstep.mjs';
const Engine = makeEngine(globalThis), c = TLM.Career.create({ seed: 11 }); const cfg = c.matchConfig();
const mk = () => { const m = new Engine(5); m.tlmLoad(cfg); return m; };
const A = mk(), B = mk(), la = new Lockstep(A, 0), lb = new Lockstep(B, 0);
const T = (n) => n * 1000 / 60 + 0.001;
la.advanceTo(T(3000)); lb.advanceTo(T(2500));
B.players[3].x += 2; B.ball.vx = (B.ball.vx || 0) + 1; // desvío artificial
const t0 = Date.now(); const snap = JSON.parse(JSON.stringify(snapOf(A))); const js = JSON.stringify(snap);
console.log('tamaño', Math.round(js.length / 1024) + ' KB', 'ms', Date.now() - t0);
const df = []; applySnap(B, snap, df); lb.rewind(la.step); console.log('diffs', df.slice(0, 8));
la.advanceTo(T(9000)); lb.advanceTo(T(9000));
console.log(la.step, lb.step, la.signature() === lb.signature() ? 'IGUAL' : 'DISTINTO', A.score.join('-'), B.score.join('-'));
