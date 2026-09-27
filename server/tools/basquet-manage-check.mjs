// Prueba de la gestión online de básquet: dos DT humanos operan (rotación, tácticas, mercado, traspasos entre ellos) y la liga
// completa avanza (liga + copa + playoffs + draft con reloj) con partidos resueltos por simulación rápida.
import { MODS } from '../src/mods.js';
const M = MODS.basquet; let g = M.create(7);
const A = '1', B = '2';
M.setHumans(g, [A, B]); g = M.load(M.serialize(g)); M.setHumans(g, [A, B]);
const ok = (c, m) => console.log(c ? 'OK  ' : 'FALLA', m);
const ctx = { now: Date.now(), locked: false };
const cmd = (club, body, c = ctx) => { try { return M.command(g, club, body, c); } catch (e) { return { ok: false, reason: e.message }; } };
const s = g.s, tA = g.team(1), tB = g.team(2);

let ex = JSON.parse(M.exportState(g, A)); ok(ex.userId === 1 && ex.teams[1].isUser && !ex.teams[2].isUser && !ex.hum, 'exportState: contexto del DT');
// rotación y tácticas
const st = [...tA.lineup.starters], bn = [...tA.lineup.bench]; const sw = st.slice(); [sw[0], bn[0]] = [bn[0], sw[0]];
let r = cmd(A, { op: 'club', patch: { lineup: { starters: sw, bench: bn }, tactics: { tempo: 80, defense: 'zone23' }, plan: { closer: st[1], foulPolicy: 'normal' } } });
ok(r.ok && tA.lineup.starters[0] === sw[0] && tA.tactics.tempo === 80 && tA.tactics.defense === 'zone23', 'patch: rotación + tácticas');
r = cmd(A, { op: 'club', patch: { lineup: { starters: [...st.slice(0, 4), tB.roster[0]], bench: [] } } }); ok(!r.ok, 'patch: jugador ajeno rechazado (' + r.reason + ')');
r = cmd(A, { op: 'club', patch: { tactics: { tempo: 999 } } }); ok(r.ok && tA.tactics.tempo === 100, 'patch: números acotados');
r = cmd(A, { op: 'club', patch: { lineup: { starters: st, bench: bn } } }, { ...ctx, locked: true }); ok(!r.ok, 'rotación cerrada en partido');
r = cmd('3', { op: 'autoLineup' }); ok(!r.ok, 'equipo sin DT rechazado');
// mercado
const fa = s.fa.map((id) => g.player(id)).filter((p) => !p.retired).sort((a, b) => b.ovr - a.ovr)[0];
if (tA.roster.length >= 15) cmd(A, { op: 'releasePlayer', args: [tA.roster[tA.roster.length - 1]] });
r = cmd(A, { op: 'signFreeAgent', args: [fa.id, { salary: g.askFor(fa) + 1, years: 2, role: 'rotation' }] }); ok(r.ok, 'A ficha un agente libre'); console.log('  ', r.result && r.result.msg || r.reason || '');
const pa = tA.roster.map((id) => g.player(id)).sort((x, y) => y.ovr - x.ovr)[3], pb = tB.roster.map((id) => g.player(id)).sort((x, y) => y.ovr - x.ovr)[3];
r = cmd(A, { op: 'tradeAI', args: [2, [pa.id], [pb.id]] }); ok(!r.ok, 'tradeAI con un humano rechazado');
r = cmd(A, { op: 'tradePropose', args: [2, [pa.id], [pb.id]] }); const pid = r.result && r.result.id; ok(r.ok && pid != null, 'A propone traspaso a B');
r = cmd(A, { op: 'tradeAnswer', args: [pid, true] }); ok(!r.ok, 'A no puede responder su propia propuesta');
ex = JSON.parse(M.exportState(g, B)); ok(ex.tradeProps.length === 1, 'B ve la propuesta');
r = cmd(B, { op: 'tradeAnswer', args: [pid, true] }); ok(r.ok && g.player(pa.id).teamId === 2 && g.player(pb.id).teamId === 1, 'B acepta: los jugadores cambian de equipo'); console.log('  ', r.result && r.result.msg || r.reason || '');
const ai = 5, pa2 = tA.roster.map((id) => g.player(id)).sort((x, y) => y.ovr - x.ovr)[6], pai = g.team(ai).roster.map((id) => g.player(id)).sort((x, y) => y.ovr - x.ovr)[6];
r = cmd(A, { op: 'tradeAI', args: [ai, [pa2.id], [pai.id]] }); console.log('  tradeAI:', r.ok, r.result && r.result.msg || r.reason);
// liga completa
let rounds = 0, cups = 0, po = 0, guard = 0; const t0 = Date.now();
(async () => {
  while (guard++ < 400) {
    const rd = M.round(g); if (!rd || rd.type === 'draft') break;
    if (rd.type === 'cup') cups++; if (rd.type === 'playoff') po++;
    for (const m of rd.matches) { const e = g.currentDay().entries.find((x) => x.id === m.id); if (e && !e.done) await g.simulateEntry(e, true); }
    M.finishRound(g); rounds++;
  }
  ok(guard < 400, `temporada jugada: ${rounds} jornadas (${cups} de copa, ${po} de playoffs) en ${Date.now() - t0} ms`);
  const rd = M.round(g); ok(rd && rd.type === 'draft', 'después de los playoffs viene el draft');
  // draft con reloj: un humano elige a tiempo, el otro se pasa del reloj
  let now = Date.now(), steps = 0; const off = s.off; console.log('  picks', off.picks.length, 'primer pick equipo', off.picks[0].teamId);
  while (s.off.stage === 'draft' && steps++ < 400) {
    const pick = s.off.picks[s.off.pos];
    if (pick.teamId === 1 && !s.off._t1) { const best = g.draftAvailable().sort((a, b) => b.pot - a.pot)[0]; const rr = cmd(A, { op: 'draftSelect', args: [best.id] }, { ...ctx, now }); if (rr.ok) { s.off._t1 = 1; ok(true, 'A ficha en el draft (pick ' + pick.n + ')'); continue; } }
    const t = M.tickLeague(g, now); if (t.done) break; now += 30e3;
  }
  ok(s.off.stage !== 'draft', 'el draft termina (IA + reloj) tras ' + steps + ' avances'); M.finishRound(g); ok(M.round(g) === null, 'la liga cierra');
  console.log('   1º', M.standings(g)[0]);
})();
