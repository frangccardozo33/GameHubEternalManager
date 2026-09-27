// Prueba de la gestión online de NFL: dos DT humanos operan (gameplan, depth chart, mercado, traspasos entre ellos) y la liga completa
// avanza (liga + copa + playoffs + draft con reloj) con partidos resueltos por simulación rápida.
import { MODS } from '../src/mods.js';
const M = MODS.nfl; let g = M.create(11);
const ids = M.clubs(g), A = ids[1], B = ids[2];
M.setHumans(g, [A, B]); g = M.load(M.serialize(g)); M.setHumans(g, [A, B]);
const ok = (c, m) => console.log(c ? 'OK  ' : 'FALLA', m);
const ctx = { now: Date.now(), locked: false };
const cmd = (club, body, c = ctx) => { try { return M.command(g, club, body, c); } catch (e) { return { ok: false, reason: e.message }; } };
const d = g.data, tA = d.teams[A], tB = d.teams[B];

let ex = JSON.parse(M.exportState(g, A)); ok(ex.userTeam === A && !ex.hum && ex.humans.includes(B), 'exportState: contexto del DT');
let r = cmd(A, { op: 'club', patch: { gameplan: { off: { tempo: 80, passRate: 70 }, def: { blitz: 60 } } } }); ok(r.ok && tA.gameplan.off.tempo === 80, 'patch: gameplan'); console.log('  ', JSON.stringify(tA.gameplan.off).slice(0, 120));
const qb = tA.depth.QB.slice(); const swapped = [qb[1], qb[0], ...qb.slice(2)];
r = cmd(A, { op: 'club', patch: { depth: { QB: swapped } } }); ok(r.ok && tA.depth.QB[0] === qb[1], 'patch: depth chart (QB2 titular)');
r = cmd(A, { op: 'club', patch: { depth: { QB: [tB.roster[0]] } } }); ok(!r.ok, 'patch: jugador ajeno rechazado (' + r.reason + ')');
r = cmd(A, { op: 'club', patch: { gameplan: { off: { tempo: 1 } } } }, { ...ctx, locked: true }); ok(!r.ok, 'plan cerrado en partido');
r = cmd(ids[5], { op: 'club', patch: {} }); ok(!r.ok, 'equipo sin DT rechazado');
r = cmd(A, { op: 'club', patch: { training: { focus: { speed: 999 }, intensity: 'high' } } }); ok(r.ok, 'patch: entrenamiento'); console.log('  ', JSON.stringify(tA.training).slice(0, 100));
// mercado
const fa = d.freeAgents.map((id) => d.players[id]).sort((a, b) => b.ovr - a.ovr)[0];
r = cmd(A, { op: 'signFreeAgent', args: [fa.id, { salary: Math.max(1, fa.ovr / 8), years: 2, bonus: 0 }] }); console.log('   ficha FA:', r.ok, r.result && r.result.message || r.reason);
const pa = tA.roster.map((id) => d.players[id]).sort((x, y) => y.ovr - x.ovr)[10], pb = tB.roster.map((id) => d.players[id]).sort((x, y) => y.ovr - x.ovr)[10];
r = cmd(A, { op: 'tradeAI', args: [B, [pa.id], [pb.id]] }); ok(!r.ok, 'tradeAI con un humano rechazado');
r = cmd(A, { op: 'tradePropose', args: [B, [pa.id], [pb.id]] }); const pid = r.result && r.result.id; ok(r.ok && pid, 'A propone traspaso a B');
r = cmd(A, { op: 'tradeAnswer', args: [pid, true] }); ok(!r.ok, 'A no puede responder su propia propuesta');
r = cmd(B, { op: 'tradeAnswer', args: [pid, true] }); ok(r.ok && d.players[pa.id].teamId === B && d.players[pb.id].teamId === A, 'B acepta: los jugadores cambian de equipo'); console.log('  ', r.result && r.result.message || r.reason);
const other = ids[6]; const pa2 = tA.roster.map((id) => d.players[id]).sort((x, y) => y.ovr - x.ovr)[20], po = d.teams[other].roster.map((id) => d.players[id]).sort((x, y) => y.ovr - x.ovr)[25];
r = cmd(A, { op: 'tradeAI', args: [other, [pa2.id], [po.id]] }); console.log('   tradeAI CPU:', r.ok, r.result && r.result.message || r.reason);
r = cmd(A, { op: 'releasePlayer', args: [tA.roster[tA.roster.length - 1]] }); ok(r.ok, 'A libera un jugador');
// liga completa
let rounds = 0, cups = 0, guard = 0; const t0 = Date.now();
while (guard++ < 100) {
  const rd = M.round(g); if (!rd || rd.type === 'draft') break;
  if (rd.type === 'cup') cups++;
  M.finishRound(g); rounds++;
}
ok(guard < 100, `temporada jugada: ${rounds} semanas (${cups} de copa) en ${Date.now() - t0} ms`);
ok(d.cup && d.cup.seeds.includes(A) && d.cup.seeds.includes(B), 'la copa incluye a los dos DT humanos');
const rd = M.round(g); ok(rd && rd.type === 'draft', 'después de los playoffs viene el draft');
console.log('  humanos:', A, B, 'primer pick:', g.draftCurrent());
let now = Date.now(), steps = 0, mine = false;
while (d.draft && !d.draft.done && steps++ < 800) {
  const cur = g.draftCurrent();
  if (cur && cur.teamId === A && !mine) { const best = d.draft.pool.map((id) => d.players[id]).sort((a, b) => b.potential - a.potential)[0]; const rr = cmd(A, { op: 'draftPick', args: [best.id] }, { ...ctx, now }); if (rr.ok) { mine = true; ok(true, 'A ficha en el draft (ronda ' + cur.round + ' pick ' + cur.n + ')'); continue; } }
  const t = M.tickLeague(g, now); if (t.done) break; now += 30e3;
}
ok(d.draft.done, 'el draft termina (CPU + reloj) tras ' + steps + ' avances'); M.finishRound(g); ok(M.round(g) === null, 'la liga cierra');
console.log('   1º', M.standings(g)[0]);
