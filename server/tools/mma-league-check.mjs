// Prueba de la liga de MMA por cuadras: gestión de dos DT humanos (táctica, campamento, mercado, traspasos) + una cartelera en vivo completa.
import { MODS } from '../src/mods.js';
const M = MODS.mma; let g = M.create(5); const A = 's1', B = 's2';
M.setHumans(g, [A, B]); g = M.load(M.serialize(g)); M.setHumans(g, [A, B]);
const ok = (c, m) => console.log(c ? 'OK  ' : 'FALLA', m);
const ctx = { now: Date.now(), locked: false };
const cmd = (club, body, c = ctx) => { try { return M.command(g, club, body, c); } catch (e) { return { ok: false, reason: e.message }; } };
const sA = g.stables[1], sB = g.stables[2];
const r0 = M.round(g); console.log(r0.label, r0.matches.length, M.clubs(g).length, 'cuadras;', g.fighters.length, 'peleadores');
ok(r0.matches.every((m) => m.home !== m.away), 'nadie pelea contra su propia cuadra');
let ex = JSON.parse(M.exportState(g, A)); ok(ex.me === A && ex.fighters.length === 4 && ex.market.length > 10 && ex.myMatch, 'exportState');
const fa = sA.roster[0];
let r = cmd(A, { op: 'tactics', args: [fa, { focus: 'wrestling', target: 'leg', pace: 80, takedowns: 999 }] }); const F = g.fighters.find((f) => f.id === fa); ok(r.ok && F.tactics.focus === 'wrestling' && F.tactics.takedowns === 100 && F.tactics.pace === 80, 'táctica');
r = cmd(A, { op: 'tactics', args: [fa, { focus: 'karate' }] }); ok(!r.ok, 'táctica inválida rechazada');
r = cmd(A, { op: 'tactics', args: [sB.roster[0], { pace: 10 }] }); ok(!r.ok, 'peleador ajeno rechazado');
r = cmd(A, { op: 'tactics', args: [fa, { pace: 10 }] }, { ...ctx, locked: true }); ok(!r.ok, 'táctica cerrada en evento');
r = cmd('s5', { op: 'tactics', args: [fa, {}] }); ok(!r.ok, 'cuadra sin DT rechazada');
r = cmd(A, { op: 'program', args: [fa, 'boxing'] }); ok(r.ok && F.program === 'boxing', 'campamento');
r = cmd(A, { op: 'program', args: [fa, 'yoga'] }); ok(!r.ok, 'campamento inválido rechazado');
const m0 = sA.money, mk = g.market.slice().sort((a, b) => b.rating - a.rating)[0];
r = cmd(A, { op: 'signFighter', args: [mk.id] }); ok(r.ok && sA.roster.includes(mk.id) && sA.money < m0, 'ficha del mercado'); console.log('  ', r.result && r.result.msg || r.reason);
r = cmd(A, { op: 'signFighter', args: [g.market[0].id] }); r = cmd(A, { op: 'signFighter', args: [g.market[0].id] }); ok(!r.ok || sA.roster.length <= 6, 'cuadra limitada a 6 (' + sA.roster.length + ')');
r = cmd(A, { op: 'releaseFighter', args: [mk.id] }); ok(r.ok && !sA.roster.includes(mk.id) && g.market.some((f) => f.id === mk.id), 'libera un peleador');
const give = sA.roster[1], get = sB.roster[1];
r = cmd(A, { op: 'tradePropose', args: [B, give, get] }); const id = r.result && r.result.id; ok(r.ok && id, 'propone traspaso');
r = cmd(A, { op: 'tradeAnswer', args: [id, true] }); ok(!r.ok, 'A no responde su propia propuesta');
r = cmd(B, { op: 'tradeAnswer', args: [id, true] }); ok(r.ok && sA.roster.includes(get) && sB.roster.includes(give), 'B acepta: peleadores intercambiados');
// cartelera completa en vivo (una pelea con órdenes) + cierre
const rd = M.round(g), t0 = 1e6, mine = rd.matches.find((m) => m.entrants.includes(A)); const L = M.makeLive(g, mine.id, t0, {}, t0);
ok(L.teamIdx(A) >= 0 && L.teamIdx('s5') < 0, 'la esquina es la del DT de la cuadra');
L.onClient(A, { type: 'act', a: { k: 'order', command: 'pressure' } }, t0 + 5000);
const cfg = JSON.parse(JSON.stringify(L.persist()));
for (let now = t0; now < t0 + 1100e3 && !L.finished; now += 100) L.advanceTo(now);
const L2 = M.makeLive(g, mine.id, t0, cfg, t0 + 1100e3); ok(L.finished && L2.finished && L.ls.step === L2.ls.step, 'pelea completa; reconstruida de golpe da lo mismo (' + L.ls.step + ' pasos)');
L.commit(); for (const m of rd.matches) if (m.id !== mine.id) { const l = M.makeLive(g, m.id, t0, {}, t0 + 1100e3); l.commit(); }
const money = sA.money; M.finishRound(g); ok(M.round(g).label === 'Cartelera 2', 'avanza a la cartelera 2'); console.log('  dinero A', money, '->', sA.money, ' campamento aplicado:', Math.round(F.attributes.accuracy * 10) / 10);
console.log(M.standings(g).slice(0, 3), M.results(g)[0].text);
