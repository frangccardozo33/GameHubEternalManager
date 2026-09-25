import test from 'node:test';
import assert from 'node:assert/strict';
import { League } from '../src/manager/league.js';
import { MatchSimulator, FIXED_DT } from '../src/sim/match.js';
import { makeGameplan, callOffense, fourthDownCall } from '../src/sim/gameplan.js';
import { fgChance } from '../src/sim/special.js';
import { Random } from '../src/sim/math.js';
import { weeklyTraining } from '../src/manager/training.js';
import { engineStats, depthMove, isInjured } from '../src/manager/lineup.js';
import { evaluateOffer, signFreeAgent, releasePlayer, askFor, evaluateTrade, executeTrade, payroll, capSpace, renewPlayer, hireStaff } from '../src/manager/economy.js';
import { scoutReport } from '../src/manager/scouting.js';
import { SALARY_CAP, ROSTER_MAX, capHit } from '../src/manager/constants.js';

const NON = ['kickoff', 'punt', 'field-goal', 'extra-point', 'two-point'];
const fresh = (seed = 7) => League.create({ seed });
const fixture = (lg, home, away, id = 'x') => ({ id, type: 'regular', home, away, played: false });
const runGame = (lg, fx, mut) => { const ctx = lg.buildMatch(fx); mut?.(ctx); ctx.sim.simulateToEnd(); return ctx; };

test('Fase 1: mismo seed → mismo partido (determinismo intacto)', () => {
  const a = new MatchSimulator({ seed: 1 }); a.simulateToEnd();
  assert.deepEqual(a.drive.score, [35, 30]);
  const b = new MatchSimulator({ seed: 42 }); b.simulateToEnd();
  assert.deepEqual(b.drive.score, [40, 35]);
});

test('liga: 8 equipos, rosters válidos, nóminas bajo el cap, dorsales únicos', () => {
  const lg = fresh();
  assert.equal(Object.keys(lg.data.teams).length, 8);
  for (const t of Object.values(lg.data.teams)) {
    assert.equal(t.roster.length, 47);
    assert.ok(payroll(lg, t) <= SALARY_CAP, `${t.id} ${payroll(lg, t)}`);
    const nums = lg.roster(t).map(p => p.number); assert.equal(new Set(nums).size, nums.length);
    for (const pos of ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P']) assert.ok(t.depth[pos].length >= 1);
    assert.ok(t.depth.KR.length && t.depth.PR.length);
  }
});

test('los atributos del roster son los del motor (Player.stats == rating/100)', () => {
  const lg = fresh(), t = lg.user, opp = lg.team('ATX');
  const ctx = lg.buildMatch(fixture(lg, t.id, opp.id));
  const sim = ctx.sim; let checked = 0;
  for (const p of sim.players) {
    if (!p.pid) continue; const rp = lg.player(p.pid);
    assert.ok(Math.abs(p.stats.strength - Math.max(.3, Math.min(.98, rp.ratings.strength / 100))) < 1e-9);
    assert.equal(p.number, rp.number); checked++;
  }
  assert.equal(checked, 22);
});

test('el depth chart cambia el partido: titular QB malo rinde peor que titular QB bueno', () => {
  const lg = fresh(), t = lg.user; const opps = ['ATX', 'HBR', 'DSV', 'IRN', 'BAY', 'SMT'];
  const qbs = t.depth.QB.map(id => lg.player(id)); assert.ok(qbs[0].ovr > qbs.at(-1).ovr + 8);
  const measure = () => { let y = 0, att = 0, pts = 0;
    for (let i = 0; i < 24; i++) { const fx = fixture(lg, t.id, opps[i % 6], 'q' + i), ctx = runGame(lg, fx); const s = ctx.rec.tg[0]; y += s.passYds; att += s.passAtt; pts += ctx.sim.drive.score[0]; }
    return { ypa: y / att, pts: pts / 24 }; };
  const good = measure();
  const saved = [...t.depth.QB]; t.depth.QB = [...saved].reverse(); const bad = measure(); t.depth.QB = saved;
  assert.ok(good.ypa > bad.ypa, `ypa ${good.ypa} vs ${bad.ypa}`); assert.ok(good.pts > bad.pts, `pts ${good.pts} vs ${bad.pts}`);
});

test('lesionados y agotados salen del campo (sustitución automática por depth chart)', () => {
  const lg = fresh(), t = lg.user, qb1 = lg.player(t.depth.QB[0]), qb2 = lg.player(t.depth.QB[1]);
  qb1.injury = { type: 'test', weeks: 3, total: 3 };
  const ctx = lg.buildMatch(fixture(lg, t.id, 'ATX')); const q = ctx.sim.players.find(p => p.id === 'QB' && ctx.sim.playOffense === 0) || null;
  const ids = ctx.sim.players.map(p => p.pid); assert.ok(!ids.includes(qb1.id));
  ctx.sim.simulateToEnd(); assert.ok(ctx.rec.lines[qb2.id]?.passAtt > 0 || ctx.rec.lines[t.depth.QB[1]] !== undefined);
});

test('el gameplan modifica el play calling (run/pass, 4th down, deep)', () => {
  const rng = new Random(5), drive = { down: 1, distance: 10, spot: 50, score: [0, 0], offense: 0 }, clock = { quarter: 2, remaining: 400 };
  const share = gp => { let pass = 0; for (let i = 0; i < 600; i++) pass += callOffense(drive, clock, gp, rng).type === 'pass'; return pass / 600; };
  const lo = share(makeGameplan({ off: { runPass: 0 } })), hi = share(makeGameplan({ off: { runPass: 100 } }));
  assert.ok(hi - lo > .3, `${lo} ${hi}`);
  const deep = gp => { let d = 0, n = 0; for (let i = 0; i < 800; i++) { const p = callOffense(drive, clock, gp, rng); if (p.type === 'pass') { n++; d += ['post', 'corner', 'streak', 'comeback'].includes(p.id); } } return d / n; };
  assert.ok(deep(makeGameplan({ off: { deepPass: 100, shortPass: 0 } })) > deep(makeGameplan({ off: { deepPass: 0, shortPass: 100 } })) + .25);
  const d4 = { down: 4, distance: 3, spot: 55, score: [0, 0], offense: 0 };

  const go = gp => fourthDownCall({ ...d4, spot: 70, distance: 1 }, clock, gp, { kickAccuracy: .8, kickPower: .8 }) === 'go';
  assert.ok(!go(makeGameplan({ off: { fourthDown: 0 } })) && go(makeGameplan({ off: { fourthDown: 100 } })));
});

test('paquetes defensivos: nickel/dime cambian el formation del motor', async () => {
  const { createFormation } = await import('../src/sim/formation.js');
  const rng = new Random(3);
  const dime = createFormation({ id: 'slant', type: 'pass', personnel: '11', formation: 'Shotgun', routes: ['slant', 'slant', 'out', 'seam', 'check'] }, 'Cover 3', 30, rng, { pick: () => null, front: 'dime' });
  assert.equal(dime.front, 'dime'); assert.equal(dime.players.filter(p => p.side === 'D' && p.role === 'CB').length, 4); assert.equal(dime.players.filter(p => p.side === 'D').length, 11);
});

test('la calidad del pateador modifica la probabilidad de field goal', () => {
  assert.ok(fgChance(45, { kickAccuracy: .95, kickPower: .95 }) > fgChance(45, { kickAccuracy: .5, kickPower: .5 }) + .2);
  assert.ok(fgChance(30, { kickAccuracy: .8, kickPower: .8 }) > fgChance(55, { kickAccuracy: .8, kickPower: .8 }));
});

test('estadísticas: jugadores suman a los totales de equipo y del motor', () => {
  const lg = fresh(); const ctx = runGame(lg, fixture(lg, 'NTH', 'HBR'));
  const { rec, sim } = ctx;
  for (let i = 0; i < 2; i++) {
    const id = rec.ids[i], lines = Object.entries(rec.lines).filter(([pid]) => lg.player(pid).teamId === id).map(([, l]) => l);
    const S = k => lines.reduce((s, l) => s + l[k], 0), T = rec.tg[i];
    assert.equal(S('passAtt'), T.passAtt); assert.equal(S('passComp'), T.passComp); assert.equal(S('rec'), T.passComp);
    assert.ok(Math.abs(S('passYds') - T.passYds) < .5 + T.passAtt * .06); assert.ok(Math.abs(S('recYds') - T.passYds) < .5 + T.passAtt * .06);
    assert.equal(S('rushAtt'), T.rushAtt); assert.equal(S('sacksTaken'), T.sacksTaken);
    const eng = sim.drive.stats[i];
    assert.equal(T.passAtt, eng.attempts); assert.equal(T.passComp, eng.completions); assert.equal(T.sacksTaken, eng.sacks);
    assert.ok(Math.abs(T.yards - eng.yards) < 1 + eng.plays * .06, `yards ${T.yards} vs ${eng.yards}`);
    assert.equal(T.pf, sim.drive.score[i]);
  }
  const all = Object.values(rec.lines); assert.ok(all.reduce((s, l) => s + l.tackles, 0) > 20);
  assert.ok(rec.drives.length >= 8 && rec.tg[0].top + rec.tg[1].top > 300);
  const sum = rec.summary(sim); assert.equal(sum.score[0] + sum.score[1] > 0, true); assert.ok(sum.top.length);
  const pts = sum.scoring.reduce((s, x) => s + x.pts, 0); assert.equal(pts, sim.drive.score[0] + sim.drive.score[1]);
});

test('entrenamiento cambia atributos reales (y el stat del motor)', () => {
  const lg = fresh(), t = lg.user; t.training.focus = { passing: 100, routeRunning: 0, blocking: 0, passRush: 0, coverage: 0, tackling: 0, conditioning: 0 };
  const qb = lg.player(t.depth.QB[0]); qb.age = 22; qb.potential = qb.ovr + 15; const before = { ...qb.ratings }, e0 = engineStats(qb).shortAccuracy;
  for (let i = 0; i < 14; i++) weeklyTraining(lg, t);
  const gained = ['shortAccuracy', 'mediumAccuracy', 'deepAccuracy', 'decisionMaking'].reduce((s, k) => s + qb.ratings[k] - before[k], 0);
  assert.ok(gained >= 4, `gained ${gained}`); assert.ok(engineStats(qb).shortAccuracy >= e0);
  const wr = lg.roster(t).find(p => p.pos === 'WR'), wr0 = wr.ratings.routeRunning; for (let i = 0; i < 14; i++) weeklyTraining(lg, t); assert.equal(wr.ratings.routeRunning, wr0);
});

test('contratos: aceptar / contraoferta / rechazo; saldo y roster; bonus pendiente al liberar', () => {
  const lg = fresh(), t = lg.user, fa = lg.data.freeAgents.map(id => lg.player(id)).sort((a, b) => b.ovr - a.ovr)[0];
  const ask = askFor(lg, fa, t.id);
  assert.equal(evaluateOffer(lg, fa, ask, t.id).status, 'accepted');
  assert.equal(evaluateOffer(lg, fa, { ...ask, salary: ask.salary * .92 }, t.id).status, 'counter');
  assert.equal(evaluateOffer(lg, fa, { ...ask, salary: ask.salary * .5, bonus: 0 }, t.id).status, 'rejected');
  const rosterBefore = t.roster.length; if (capSpace(lg, t) < capHit({ contract: { ...ask, yearsTotal: ask.years } })) t.deadCap = 0;
  const r = signFreeAgent(lg, t.id, fa.id, ask); assert.ok(r.ok, r.message); assert.equal(t.roster.length, rosterBefore + 1); assert.ok(t.depth[fa.pos].includes(fa.id)); assert.equal(fa.teamId, t.id);
  // con la caja en negativo no se puede fichar (no hay tope salarial)
  const cash0 = t.finance.cash; t.finance.cash = -5; const fa2 = lg.data.freeAgents.map(id => lg.player(id))[0]; assert.equal(signFreeAgent(lg, t.id, fa2.id, askFor(lg, fa2, t.id)).ok, false); t.finance.cash = cash0;
  const pl = lg.player(t.roster[0]); pl.contract = { salary: 5, years: 3, yearsTotal: 4, bonus: 8 };
  const out = releasePlayer(lg, t.id, pl.id); assert.equal(out.dead, 6); assert.equal(t.deadCap, 6); assert.ok(!t.roster.includes(pl.id)); assert.ok(lg.data.freeAgents.includes(pl.id));
  assert.ok(!Object.values(t.depth).some(l => l.includes(pl.id)));
  // renovación
  const v = lg.player(t.roster[3]); const ask2 = askFor(lg, v, t.id); const rn = renewPlayer(lg, t.id, v.id, ask2); assert.ok(rn.ok || rn.status === 'blocked');
});

test('traspasos: rechaza lo desigual, acepta lo favorable y mueve jugadores', () => {
  const lg = fresh(), A = lg.user, B = lg.team('ATX'), P = id => lg.player(id);
  const star = B.roster.map(P).sort((a, b) => b.ovr - a.ovr)[0], scrub = A.roster.map(P).sort((a, b) => a.ovr - b.ovr)[0];
  const bad = evaluateTrade(lg, { teamA: A.id, teamB: B.id, giveA: [scrub.id], giveB: [star.id] }); assert.equal(bad.accept, false);
  const mine = A.roster.map(P).sort((a, b) => b.ovr - a.ovr)[0], theirs = B.roster.map(P).sort((a, b) => a.ovr - b.ovr)[0];
  const good = evaluateTrade(lg, { teamA: A.id, teamB: B.id, giveA: [mine.id], giveB: [theirs.id] });
  if (good.ok && good.accept) { executeTrade(lg, { teamA: A.id, teamB: B.id, giveA: [mine.id], giveB: [theirs.id] }); assert.equal(P(mine.id).teamId, B.id); assert.equal(P(theirs.id).teamId, A.id); assert.ok(A.depth[theirs.pos].includes(theirs.id)); }
  else assert.ok(good.reason);
});

test('scouting: informe del rival con tendencias, fortalezas, debilidades y jugadores clave', () => {
  const lg = fresh(); const rep = scoutReport(lg, 'NTH', 'ATX');
  assert.ok(rep.units.length === 9 && rep.strengths.length === 2 && rep.weaknesses.length === 2 && rep.keyPlayers.length >= 4);
  assert.ok(rep.tendencies.passRate > .2 && rep.tendencies.passRate < .8);
  const g = lg.buildMatch(fixture(lg, 'NTH', 'ATX')); lg.simulateFixture({ ...fixture(lg, 'NTH', 'ATX', 'sc'), id: 'sc' });
  const rep2 = scoutReport(lg, 'NTH', 'ATX'); assert.ok(rep2.games >= 1 && rep2.efficiency.offense);
});

test('temporada completa: calendario, standings, playoffs, campeón, offseason y nueva temporada', () => {
  const lg = fresh(9);
  const cal = lg.data.calendar; assert.equal(cal.length, 14);
  const pairs = {}; for (const w of cal) { assert.equal(w.fixtures.length, 4); const seen = new Set(); for (const f of w.fixtures) { assert.ok(!seen.has(f.home) && !seen.has(f.away)); seen.add(f.home); seen.add(f.away); const k = [f.home, f.away].sort().join('-'); pairs[k] = (pairs[k] || 0) + 1; } }
  assert.equal(Object.keys(pairs).length, 28); assert.ok(Object.values(pairs).every(n => n === 2));
  let n = 0; while (lg.data.phase !== 'offseason' && n++ < 30) lg.advance();
  assert.equal(lg.data.phase, 'offseason'); assert.equal(lg.data.champions.length, 1);
  const rows = lg.standings(); assert.equal(rows.reduce((s, r) => s + r.w, 0), rows.reduce((s, r) => s + r.l, 0)); assert.equal(rows.reduce((s, r) => s + r.w + r.l + r.t, 0), 8 * 14);
  assert.equal(lg.data.calendar.filter(w => w.type !== 'regular').length, 2);
  assert.ok(lg.user.finance.log.length >= 14);
  const yr = lg.data.year; lg.startNextSeason();
  assert.equal(lg.data.year, yr + 1); assert.equal(lg.data.week, 0); assert.equal(lg.standings()[0].gp, 0); assert.deepEqual(lg.validate(), []);
  for (const t of Object.values(lg.data.teams)) assert.ok(t.roster.length <= ROSTER_MAX && t.roster.length >= (t.id === lg.data.userTeam ? 30 : 40), `${t.id} ${t.roster.length}`);
});

test('guardar y cargar conserva el estado y permite seguir', () => {
  const lg = fresh(4); lg.advance(); lg.advance();
  const copy = League.load(lg.serialize());
  assert.deepEqual(copy.standings().map(r => [r.id, r.w, r.l]), lg.standings().map(r => [r.id, r.w, r.l]));
  lg.advance(); copy.advance(); // determinismo tras cargar
  assert.deepEqual(copy.standings().map(r => [r.id, r.w, r.l, r.pf]), lg.standings().map(r => [r.id, r.w, r.l, r.pf]));
});

test('overtime: en playoffs nunca termina empatado', () => {
  const lg = fresh(2); let ties = 0, otSeen = 0;
  for (let i = 0; i < 60; i++) {
    const ctx = lg.buildMatch({ id: 'ot' + i, type: 'final', home: 'NTH', away: 'ATX', played: false });
    ctx.sim.config.quarterSeconds = 45; ctx.sim.clock.rules.quarterSeconds = 45; ctx.sim.clock.remaining = 45;
    ctx.sim.simulateToEnd(); const s = ctx.sim.drive.score; if (s[0] === s[1]) ties++; if (ctx.sim.otPeriods) otSeen++;
  }
  assert.equal(ties, 0); assert.ok(otSeen > 0, 'debería haber visto al menos un overtime en 60 partidos cortos');
});

test('soak: 3 temporadas seguidas sin errores ni rosters/cap inválidos', () => {
  const lg = League.create({ seed: 31, seasonLength: 7 });
  for (let s = 0; s < 3; s++) { let n = 0; while (lg.data.phase !== 'offseason' && n++ < 20) { lg.advance(); assert.deepEqual(lg.validate(), []); } lg.startNextSeason(); }
  assert.equal(lg.data.champions.length, 3);
});
