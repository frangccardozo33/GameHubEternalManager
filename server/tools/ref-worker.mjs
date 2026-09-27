// Motor de referencia en un Web Worker limpio (sin DOM ni listeners de la página): calcula la firma del estado cada 60 pasos
// para compararla con la del motor de la transmisión. Uso (diagnóstico): new Worker('/server/tools/ref-worker.mjs', { type: 'module' }).
import '../src/vendor/football-shim.js';
import { makeEngine } from '../src/vendor/football-engine.js';
const sigOf = (m) => { let h = 2166136261; const mix = (v) => { h ^= Math.round(v * 10) | 0; h = Math.imul(h, 16777619) >>> 0; }; mix(m.time); mix(m.score[0]); mix(m.score[1]); mix(m.ball.x); mix(m.ball.z); for (const p of m.players) { mix(p.x); mix(p.z); } return h >>> 0; };
// snapOf: mismas variables que la del cliente en modo diagnóstico (números, booleanos y textos del motor, sus objetos de un nivel, jugadores y balón)
const snapOf = (m) => { const o = {}; for (const k in m) { const v = m[k]; if (['number', 'boolean', 'string'].includes(typeof v)) o[k] = v; else if (v && typeof v === 'object' && !Array.isArray(v) && k !== 'ball' && k !== 'players') for (const q in v) { const w2 = v[q]; if (['number', 'boolean', 'string'].includes(typeof w2)) o[k + '.' + q] = w2; } } m.players.forEach((p, i) => { for (const k in p) { const v = p[k]; if (['number', 'boolean', 'string'].includes(typeof v)) o['p' + i + '.' + k] = v; } }); for (const k in m.ball) { const v = m.ball[k]; if (['number', 'boolean', 'string'].includes(typeof v)) o['ball.' + k] = v; } return o; };
self.onmessage = (e) => {
  const { cfg, steps, snapFrom, snapTo } = e.data, Engine = makeEngine(self), m = new Engine(cfg.seed); m.tlmLoad(cfg); m.start();
  const out = {}, snaps = {}; for (let i = 1; i <= steps; i++) { m.step(1 / 60); out[i] = sigOf(m); if (snapFrom && i >= snapFrom && i <= snapTo) snaps[i] = snapOf(m); }
  self.postMessage({ out, snaps });
};
