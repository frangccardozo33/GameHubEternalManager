import { MODS } from '../src/mods.js';
const M = MODS.mma; let g = M.create(5); g = M.load(M.serialize(g));
const r = M.round(g); console.log(r.label, r.matches.length, M.clubs(g).length);
const t0 = 1e6; const id = r.matches[0].id;
const L = M.makeLive(g, id, t0, {}, t0);
L.onClient(r.matches[0].home, { type: 'act', a: { k: 'order', command: 'pressure' } }, t0 + 5000);
const cfg = JSON.parse(JSON.stringify(L.persist()));
for (let now = t0; now < t0 + 1100e3 && !L.finished; now += 100) L.advanceTo(now);
const L2 = M.makeLive(g, id, t0, cfg, t0 + 1100e3);
console.log(L.finished, L.sim.result && L.sim.result.method, L2.finished, L2.sim.result && L2.sim.result.method, L.ls.step, L2.ls.step);
console.log(L.commit(), L.hud());
for (const m of r.matches.slice(1)) { const l = M.makeLive(g, m.id, t0, {}, t0 + 1100e3); l.commit(); }
M.finishRound(g); console.log(M.round(g).label, M.standings(g).slice(0, 3), M.results(g).length, M.serialize(g).length);
