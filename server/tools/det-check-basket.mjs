// Diagnóstico de determinismo del motor de básquet entre entornos (Node/Workers vs navegador): firma del estado cada 3000 pasos.
// En Node: `node det-check-basket.mjs` genera bspec.json (equipos + semilla) y calcula las firmas; en el navegador, run(await (await fetch('bspec.json')).json()).
import { buildSim } from '../../05-basquet-courtside/src/online/lockstep.js';
export function run(init, every = 3000, max = 54000) {
  const sim = buildSim(init); sim.start(); const out = [];
  for (let i = 1; i <= max && sim.phase !== 'finished'; i++) {
    sim.step(1 / 60);
    if (i % every === 0) { let h = 2166136261; const mix = (v) => { h ^= Math.round(v * 1e6) | 0; h = Math.imul(h, 16777619) >>> 0; }; mix(sim.time); for (const p of sim.players) { mix(p.x); mix(p.z); } mix(sim.ball.x); mix(sim.ball.z); out.push(i + ':' + h); }
  }
  return out.join(' ');
}
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('det-check-basket.mjs')) {
  const { Game } = await import('../../05-basquet-courtside/src/manager/game.js');
  const fs = await import('node:fs');
  const g = Game.create({}, 0, 4242), e = g.currentDay().entries[0], home = g.team(e.home), away = g.team(e.away);
  const init = { seed: 123456, rules: { periodSeconds: g.cfg.periodSeconds, shotClock: g.cfg.shotClock }, specs: [g.buildSpec(home, 0, away), g.buildSpec(away, 1, home)] };
  fs.writeFileSync(new URL('./bspec.json', import.meta.url), JSON.stringify(init));
  console.log(run(init));
  fs.writeFileSync(new URL('./bfine.txt', import.meta.url), run(init, 60, 6000));
}
export function dump(init, from, to) {
  const sim = buildSim(init); sim.start(); const out = [];
  for (let i = 1; i <= to; i++) { sim.step(1 / 60); if (i >= from) out.push(i + ':' + [sim.time, sim.ball.x, sim.ball.y, sim.ball.z, sim.ball.mode, sim.players[0].x, sim.players[3].z, sim.players[7].x].join(',')); }
  return out;
}
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('det-check-basket.mjs')) {
  const fs = await import('node:fs'); const init = JSON.parse(fs.readFileSync(new URL('./bspec.json', import.meta.url), 'utf8'));
  fs.writeFileSync(new URL('./bdump.json', import.meta.url), JSON.stringify(dump(init, 481, 540)));
}
export function dump2(init, from, to) {
  const sim = buildSim(init); sim.start(); const out = [];
  const ser = (o) => JSON.stringify(o, (k, v) => (k === 'owner' || k === 'lastTouched' ? (v && v.id) : k === 'team' && typeof v === 'object' ? undefined : v));
  for (let i = 1; i <= to; i++) { sim.step(1 / 60); if (i >= from) out.push(i + ' ball=' + ser(sim.ball) + ' poss=' + JSON.stringify(sim.possession && { team: sim.possession.team, play: sim.possession.play, step: sim.possession.step }) + ' acts=' + sim.players.map((p) => p.action + '/' + (p.decision || '')).join('|')); }
  return out;
}
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('det-check-basket.mjs')) {
  const fs = await import('node:fs'); const init = JSON.parse(fs.readFileSync(new URL('./bspec.json', import.meta.url), 'utf8'));
  fs.writeFileSync(new URL('./bdump2.json', import.meta.url), JSON.stringify(dump2(init, 486, 488)));
}
export function dump3(init, from, to) {
  const sim = buildSim(init); sim.start(); const out = [];
  const num = (o) => { const r = {}; for (const [k, v] of Object.entries(o)) { if (typeof v === 'number') r[k] = v; else if (typeof v === 'string' || typeof v === 'boolean') r[k] = v; else if (v && typeof v === 'object' && !Array.isArray(v) && ['x', 'z'].every((q) => q in v)) r[k] = [v.x, v.z]; } return r; };
  for (let i = 1; i <= to; i++) {
    sim.step(1 / 60);
    if (i >= from) out.push({ i, sim: { time: sim.time, clock: sim.clock, shotClock: sim.shotClock, period: sim.period, phase: sim.phase, rng: sim.random.state, poss: sim.possession && num(sim.possession) }, ball: num(sim.ball), players: sim.players.map((p) => num(p)) });
  }
  return out;
}
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('det-check-basket.mjs')) {
  const fs = await import('node:fs'); const init = JSON.parse(fs.readFileSync(new URL('./bspec.json', import.meta.url), 'utf8'));
  fs.writeFileSync(new URL('./bdump3.json', import.meta.url), JSON.stringify(dump3(init, 300, 488)));
}
export function dump4(init, from, to) {
  const sim = buildSim(init); sim.start(); const out = []; let cur = [];
  const orig = sim.random.next.bind(sim.random);
  sim.random.next = function () { const st = new Error().stack.split('\n').slice(2, 5).map((l) => (l.match(/at (?:async )?([\w.$<>]+)/) || [0, '?'])[1] + ':' + ((l.match(/:(\d+):\d+\)?$/) || [0, 0])[1])).join('<'); cur.push(st); return orig(); };
  for (let i = 1; i <= to; i++) { cur = []; sim.step(1 / 60); if (i >= from && cur.length) out.push(i + ' ' + cur.join(' ; ')); }
  return out;
}
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('det-check-basket.mjs')) {
  const fs = await import('node:fs'); const init = JSON.parse(fs.readFileSync(new URL('./bspec.json', import.meta.url), 'utf8'));
  fs.writeFileSync(new URL('./bdump4.json', import.meta.url), JSON.stringify(dump4(init, 380, 408)));
}
