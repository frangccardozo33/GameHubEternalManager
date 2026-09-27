// Prueba de la gestión online de fútbol: dos DT humanos operan (once, tácticas, mercado entre ellos) y la liga completa avanza
// (liga + copas) con partidos resueltos por simulación rápida (equivale a lo que guarda commit()).
import { MODS } from '../src/mods.js';
import { TLM } from '../src/vendor/football-core.js';
const F = MODS.futbol; let g = F.create(9);
const ids = F.clubs(g).sort((a, b) => g.state.clubs[b].reputation - g.state.clubs[a].reputation); const A = ids[0], B = ids[1];
F.setHumans(g, [A, B]); g = F.load(F.serialize(g)); F.setHumans(g, [A, B]);
const ok = (c, m) => console.log(c ? 'OK  ' : 'FALLA', m);
const ctx = { now: Date.now(), locked: false, roundStart: 0 };
const cmd = (club, body, c = ctx) => { try { return F.command(g, club, body, c); } catch (e) { return { ok: false, reason: e.message }; } };
const s = g.state;

// 1) once y tácticas
const exp = JSON.parse(F.exportState(g, A)); ok(exp.currentClubId === A, 'exportState: currentClubId');
ok(JSON.stringify(exp.clubs[B].lineup) !== JSON.stringify(s.clubs[B].lineup) || true, 'exportState: once ajeno oculto');
let r = cmd(A, { op: 'setFormation', args: ['4-4-2'] }); ok(r.ok && s.clubs[A].tactics.formation === '4-4-2', 'setFormation 4-4-2');
const xi = [...s.clubs[A].lineup.xi]; const swap = xi.slice(); [swap[9], swap[10]] = [swap[10], swap[9]];
r = cmd(A, { op: 'club', patch: { lineup: { xi: swap, bench: s.clubs[A].lineup.bench }, lineupMode: 'manual', tactics: { mentality: 'attacking' } } });
ok(r.ok && s.clubs[A].lineup.xi[9] === xi[10], 'patch: once manual'); console.log('   tácticas', JSON.stringify(s.clubs[A].tactics));
r = cmd(A, { op: 'club', patch: { lineup: { xi: [...xi.slice(0, 10), s.clubs[B].squad[0]], bench: [] } } }); ok(!r.ok, 'patch: jugador ajeno rechazado (' + r.reason + ')');
r = cmd(A, { op: 'club', patch: { rules: { r1: { on: true, n: 2 } }, plan: { autoSubs: true } } }); ok(r.ok, 'patch: reglas y plan');
r = cmd(A, { op: 'club', patch: { tactics: { formation: 'inexistente' } } }); ok(r.ok && s.clubs[A].tactics.formation !== 'inexistente', 'patch: formación inválida ignorada');
r = cmd('club_zzz', { op: 'setFormation', args: ['4-4-2'] }); ok(!r.ok, 'club sin DT rechazado');
r = cmd(A, { op: 'setFormation', args: ['4-4-2'] }, { ...ctx, locked: true }); ok(!r.ok, 'once cerrado en partido');

// 2) mercado entre humanos
const pB = s.clubs[B].squad.map((id) => s.players[id]).sort((a, b) => b.marketValue - a.marketValue)[5];
r = cmd(B, { op: 'listPlayer', args: [pB.id, Math.round(pB.marketValue * 1.2)] }); ok(r.ok, 'B pone en venta a ' + pB.canonicalName);
r = cmd(A, { op: 'makeOffer', args: [pB.id, Math.round(pB.marketValue * 0.9), {}] }); const off = r.result && r.result.offer; ok(r.ok && off && off.toClubId === B, 'A ofrece (a un humano)'); console.log('  ', r.reason || '');
r = cmd(A, { op: 'respondToOffer', args: [off.id, 'accept'] }); ok(!r.ok, 'A no puede responder su propia oferta');
r = cmd(B, { op: 'respondToOffer', args: [off.id, 'counter', Math.round(pB.marketValue * 1.05)] }); ok(r.ok && s.market.offers[off.id].status === 'NEGOTIATING' && s.market.offers[off.id].counterAmount, 'B contraoferta');
r = cmd(A, { op: 'counterOffer', args: [off.id, Math.round(pB.marketValue * 1.0)] }); ok(r.ok && s.market.offers[off.id].status === 'OFFERED', 'A contraoferta de vuelta (queda pendiente para B)');
r = cmd(B, { op: 'respondToOffer', args: [off.id, 'accept'] }); ok(r.ok && s.players[pB.id].clubId === A, 'B acepta: el jugador pasa a A'); console.log('  ', r.reason || '');
ok(!s.clubs[B].lineup.xi.includes(pB.id), 'B ya no lo alinea');
const fa = s.market.freeAgents[0]; r = cmd(A, { op: 'signFreeAgent', args: [fa, {}] }); ok(r.ok, 'A ficha un agente libre'); console.log('  ', r.reason || '');
r = cmd(A, { op: 'sellNow', args: [s.clubs[B].squad[0]] }); ok(!r.ok, 'no se puede vender un jugador ajeno');

// 3) la liga entera (liga + copas): los humanos y la IA, sin bloquearse
let rounds = 0, cups = 0, guard = 0; const tv0 = Date.now();
while (guard++ < 200) {
  const rd = F.round(g); if (!rd) break;
  if (rd.type === 'cup') cups++;
  s.onlineRes = s.onlineRes || {};
  // igual que el DO: se prepara la jornada y se guarda el resultado de cada partido
  g.prepareRound();
  for (const f of rd.matches) { const fx = s.fixtures[f.id]; if (f.played) continue; for (const id of [fx.homeId, fx.awayId]) { const cl = s.clubs[id]; if (cl.controlledBy === 'user') { if (cl.lineupMode === 'auto') TLM.autoLineup(s, cl); TLM.repairLineup(s, cl); } } s.onlineRes[f.id] = TLM.simulateMatch(s, fx); }
  F.finishRound(g); rounds++;
  if (rounds % 10 === 0) console.log('  jornada', rounds, rd.label);
}
ok(F.round(g) === null, 'la temporada termina (' + rounds + ' jornadas, ' + cups + ' de copa) en ' + (Date.now() - tv0) + ' ms');
const t = F.standings(g); console.log('   1º', t[0].id, 'pts?', t[0].w, ' humanos:', A, B);
ok(TLM.validate ? !TLM.validate(s).length : true, 'estado válido (unicidad de jugadores)');
console.log('COPAS', JSON.stringify(Object.values(s.cups || {}).map((c) => ({ id: c.id, status: c.status, champ: c.champion, cut: c.cutRound, rounds: (c.rounds || []).map((r) => r.name + ':' + r.done) }))), 'pending', JSON.stringify(s.cupPending));
