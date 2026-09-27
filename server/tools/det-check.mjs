// Diagnóstico de determinismo del motor de fútbol entre entornos (Node/Workers vs navegador):
// imprime una firma del estado cada 600 pasos. Mismo archivo en ambos lados; si las firmas divergen, el entorno calcula distinto.
import { TLM } from '../src/vendor/football-core.js';
import { makeEngine } from '../src/vendor/football-engine.js';
export function run(steps = 30000) {
  const Engine = makeEngine(globalThis), c = TLM.Career.create({ seed: 11 }); const cfg = c.matchConfig();
  const m = new Engine(5); m.tlmLoad(cfg); m.start();
  const out = []; let first = null;
  for (let i = 1; i <= steps; i++) {
    m.step(1 / 60);
    if (i % 600 === 0) {
      let h = 2166136261; const mix = (v) => { h ^= Math.round(v * 1e6) | 0; h = Math.imul(h, 16777619) >>> 0; };
      mix(m.time); mix(m.ball.x); mix(m.ball.z); for (const p of m.players) { mix(p.x); mix(p.z); }
      out.push(i + ':' + h);
    }
  }
  return out.join(' ');
}
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('det-check.mjs')) console.log(run());

// Igual que run(), pero con acciones de DT aplicadas por Lockstep (formación en el paso 1900, táctica en 4000).
import { Lockstep } from '../../01-futbol/online/lockstep.mjs';
export function runAct(steps = 12000) {
  const Engine = makeEngine(globalThis), c = TLM.Career.create({ seed: 11 }); const cfg = c.matchConfig();
  const m = new Engine(5); m.tlmLoad(cfg);
  const ls = new Lockstep(m, 0, [{ step: 1900, k: 'formation', team: 0, formation: '4-4-2' }, { step: 4000, k: 'tactic', team: 1, patch: { mentality: 'attacking' }, meta: {} }]);
  const out = [];
  for (let i = 1; i <= steps; i++) {
    ls.advanceTo(i * 1000 / 60 + 0.001);
    if (i % 600 === 0) { let h = 2166136261; const mix = (v) => { h ^= Math.round(v * 1e6) | 0; h = Math.imul(h, 16777619) >>> 0; }; mix(m.time); mix(m.ball.x); mix(m.ball.z); for (const p of m.players) { mix(p.x); mix(p.z); } out.push(i + ':' + h + '/' + ls.step); }
  }
  return out.join(' ');
}
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('det-check.mjs') && process.argv[2] === 'act') console.log(runAct());
