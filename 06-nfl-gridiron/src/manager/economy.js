import { marketValue, capHit, SALARY_CAP, ROSTER_MAX, ROSTER_MIN, ROSTER_TARGET, STARTERS, POSITIONS } from './constants.js';
import { avg, sum, r1, rint, clone } from './util.js';
import { syncDepth, isInjured } from './lineup.js';
import { STAFF_ROLES } from './generator.js';

export const payroll = (league, team) => r1(sum(team.roster.map(id => capHit(league.data.players[id]))) + (team.deadCap || 0));
export const capSpace = (league, team) => r1(SALARY_CAP - payroll(league, team));
export const offerValue = o => o.salary + (o.bonus || 0) / Math.max(1, o.years);

// ---------- Contracts / negotiation
export function askFor(league, p, teamId = null) {
  const mood = (60 - p.morale) / 400, discount = p.teamId === null && p.freeWeeks > 3 ? .92 : 1;
  const value = Math.max(.7, marketValue(p) * p.greed * (1 + mood) * discount);
  const years = p.age >= 32 ? 2 : p.age <= 23 ? 4 : 3;
  const bonus = p.ovr >= 65 ? Math.round(value * years * .1 * 10) / 10 : 0;
  return { salary: Math.max(.7, r1(value - bonus / years)), years, bonus };
}
export function evaluateOffer(league, p, offer, teamId) {
  const ask = askFor(league, p, teamId), a = offerValue(ask), v = offerValue(offer), ratio = v / a;
  if (ratio >= .985) return { status: 'accepted', ratio, ask, message: `${p.name} acepta la oferta.` };
  if (ratio >= .86) {
    const value = a * .97, bonus = offer.bonus || 0, salary = Math.max(.7, r1(value - bonus / offer.years));
    return { status: 'counter', ratio, ask, counter: { salary, years: offer.years, bonus }, message: `${p.name} pide un poco más: ${r1(value)}M anuales.` };
  }
  return { status: 'rejected', ratio, ask, message: `${p.name} rechaza la oferta (pide ~${r1(a)}M anuales).` };
}
const newContract = o => ({ salary: r1(o.salary), years: Math.max(1, Math.round(o.years)), yearsTotal: Math.max(1, Math.round(o.years)), bonus: r1(o.bonus || 0) });
export function canSign(league, team, p, offer, replacing = null) {
  const hit = offerValue(offer) - (replacing ? capHit(replacing) : 0);
  if (!replacing && team.roster.length >= ROSTER_MAX) return { ok: false, reason: `Plantilla completa (${ROSTER_MAX}).` };
  if (team.id === league.data.userTeam && team.finance.cash < 0) return { ok: false, reason: 'Saldo negativo: no puedes fichar.' };
  if (hit > capSpace(league, team) + 1e-9) return { ok: false, reason: `Sin espacio salarial (faltan ${r1(hit - capSpace(league, team))}M).` };
  return { ok: true };
}
export function attachPlayer(league, team, p, contract) {
  p.teamId = team.id; p.contract = contract; p.freeWeeks = 0; p.morale = Math.max(p.morale, 62); team.roster.push(p.id);
  league.data.freeAgents = league.data.freeAgents.filter(id => id !== p.id);
  const used = new Set(team.roster.filter(id => id !== p.id).map(id => league.data.players[id].number));
  if (!p.number || used.has(p.number)) for (let n = 1; n < 100; n++) if (!used.has(n)) { p.number = n; break; }
  syncDepth(league, team);
}
export function signFreeAgent(league, teamId, pid, offer) {
  const team = league.data.teams[teamId], p = league.data.players[pid];
  if (!p || p.teamId) return { ok: false, message: 'El jugador ya no está disponible.' };
  const v = evaluateOffer(league, p, offer, teamId);
  if (v.status !== 'accepted') return { ok: false, ...v };
  const c = canSign(league, team, p, offer); if (!c.ok) return { ok: false, status: 'blocked', message: c.reason };
  attachPlayer(league, team, p, newContract(offer));
  league.news(`${team.name} ficha a ${p.name} (${p.pos}, ${p.ovr}) por ${offer.years} año(s).`, 'signing', team.id);
  return { ok: true, status: 'accepted', message: `${p.name} firmó con ${team.name}.` };
}
export function renewPlayer(league, teamId, pid, offer) {
  const team = league.data.teams[teamId], p = league.data.players[pid];
  const v = evaluateOffer(league, p, offer, teamId); if (v.status !== 'accepted') return { ok: false, ...v };
  const c = canSign(league, team, p, offer, p); if (!c.ok) return { ok: false, status: 'blocked', message: c.reason };
  p.contract = newContract(offer); p.expiring = false; p.morale = Math.min(95, p.morale + 8);
  league.news(`${team.name} renueva a ${p.name} por ${p.contract.years} año(s).`, 'contract', team.id);
  return { ok: true, status: 'accepted', message: `${p.name} renovó.` };
}
export const deadCapFor = p => p.contract ? r1(p.contract.bonus / Math.max(1, p.contract.yearsTotal) * Math.max(0, p.contract.years)) : 0;
export function releasePlayer(league, teamId, pid, { silent = false } = {}) {
  const team = league.data.teams[teamId], p = league.data.players[pid];
  if (!p || p.teamId !== teamId) return { ok: false, message: 'Jugador no encontrado.' };
  const dead = deadCapFor(p), saved = capHit(p);
  team.deadCap = r1((team.deadCap || 0) + dead);
  team.roster = team.roster.filter(id => id !== pid);
  for (const k of Object.keys(team.depth)) team.depth[k] = team.depth[k].filter(id => id !== pid);
  p.teamId = null; p.contract = null; p.freeWeeks = 0; p.expiring = false; league.data.freeAgents.push(pid);
  syncDepth(league, team);
  if (!silent) league.news(`${team.name} libera a ${p.name}.`, 'release', teamId);
  return { ok: true, dead, saved: r1(saved - dead), message: `${p.name} liberado. Dead cap: ${dead}M.` };
}

// ---------- Needs & trades
const POS_W = { QB: 1.5, RB: .7, WR: 1, TE: .8, OL: 1, DL: 1.1, LB: .8, CB: 1, S: .75, K: .2, P: .15 };
export function tradeValue(p) {
  let v = Math.pow(Math.max(0, p.ovr - 50), 1.9) / 12 * POS_W[p.pos];
  if (p.age <= 24) v *= 1.1 + Math.max(0, p.potential - p.ovr) * .02; else if (p.age >= 30) v *= Math.max(.25, 1 - (p.age - 29) * .11);
  if (p.contract) v += Math.max(-8, Math.min(10, (marketValue(p) - capHit(p)) * Math.min(p.contract.years, 3) * .6));
  if (isInjured(p)) v *= Math.max(.5, 1 - p.injury.weeks * .04);
  return Math.max(0, v);
}
export function leagueAverages(league) {
  const P = league.data.players, out = {};
  for (const pos of POSITIONS) {
    const vals = Object.values(league.data.teams).map(t => avg(t.roster.map(id => P[id]).filter(p => p.pos === pos).sort((a, b) => b.ovr - a.ovr).slice(0, STARTERS[pos]).map(p => p.ovr)));
    out[pos] = avg(vals);
  }
  return out;
}
export function teamNeeds(league, teamId, averages = leagueAverages(league)) {
  const team = league.data.teams[teamId], P = league.data.players, out = [];
  for (const pos of POSITIONS) {
    const all = team.roster.map(id => P[id]).filter(p => p.pos === pos).sort((a, b) => b.ovr - a.ovr), healthy = all.filter(p => !isInjured(p));
    const starters = healthy.slice(0, STARTERS[pos]), sAvg = starters.length ? avg(starters.map(p => p.ovr)) : 40;
    const hurt = all.slice(0, STARTERS[pos]).filter(isInjured).length;
    const lack = Math.max(0, ROSTER_MIN[pos] - healthy.length), thin = Math.max(0, ROSTER_TARGET[pos] - all.length);
    const need = Math.max(0, Math.min(100, (averages[pos] - sAvg) * 5 + lack * 25 + thin * 5 + hurt * 10 + 8));
    out.push({ pos, need: Math.round(need), starterAvg: Math.round(sAvg), leagueAvg: Math.round(averages[pos]), count: all.length, note: lack ? `Faltan ${lack} sano(s)` : hurt ? `${hurt} titular(es) lesionado(s)` : sAvg < averages[pos] - 2 ? 'Por debajo de la liga' : thin ? 'Poca profundidad' : 'Cubierto' });
  }
  return out.sort((a, b) => b.need - a.need);
}
export function evaluateTrade(league, { teamA, teamB, giveA, giveB }) {
  // A is the proposing (user) team; B is the AI team.
  const d = league.data, P = d.players, A = d.teams[teamA], B = d.teams[teamB];
  if (!giveA.length && !giveB.length) return { ok: false, accept: false, reason: 'Selecciona jugadores para intercambiar.' };
  const needsB = Object.fromEntries(teamNeeds(league, teamB).map(n => [n.pos, n.need]));
  const vA = sum(giveA.map(id => tradeValue(P[id]) * (1 + (needsB[P[id].pos] - 30) / 300))); // what B receives
  const vB = sum(giveB.map(id => tradeValue(P[id])));
  const rosterA = A.roster.length - giveA.length + giveB.length, rosterB = B.roster.length - giveB.length + giveA.length;
  const capA = payroll(league, A) - sum(giveA.map(id => capHit(P[id]))) + sum(giveB.map(id => capHit(P[id])));
  const capB = payroll(league, B) - sum(giveB.map(id => capHit(P[id]))) + sum(giveA.map(id => capHit(P[id])));
  const res = { valueGiven: Math.round(vA), valueReceived: Math.round(vB), capA: r1(capA), capB: r1(capB), rosterA, rosterB };
  if (rosterA > ROSTER_MAX || rosterB > ROSTER_MAX) return { ...res, ok: false, accept: false, reason: 'Alguna plantilla superaría el máximo de jugadores.' };
  if (capA > SALARY_CAP + 1e-9) return { ...res, ok: false, accept: false, reason: 'Tu equipo superaría el salary cap.' };
  if (capB > SALARY_CAP + 1e-9) return { ...res, ok: false, accept: false, reason: `${B.name} superaría el salary cap.` };
  if (vA < vB * 1.08 + 1) return { ...res, ok: true, accept: false, reason: `${B.name} pide más valor (recibe ${Math.round(vA)}, entrega ${Math.round(vB)}).` };
  return { ...res, ok: true, accept: true, reason: `${B.name} acepta el traspaso.` };
}
export function executeTrade(league, { teamA, teamB, giveA, giveB }) {
  const d = league.data, P = d.players, A = d.teams[teamA], B = d.teams[teamB];
  const move = (ids, from, to) => { for (const id of ids) { from.roster = from.roster.filter(x => x !== id); for (const k of Object.keys(from.depth)) from.depth[k] = from.depth[k].filter(x => x !== id); P[id].teamId = to.id; to.roster.push(id); } };
  move(giveA, A, B); move(giveB, B, A);
  for (const [t, ids] of [[A, giveB], [B, giveA]]) { const used = new Set(); for (const id of t.roster) { const p = P[id]; if (used.has(p.number) && ids.includes(id)) for (let n = 1; n < 100; n++) if (!t.roster.some(x => P[x].number === n)) { p.number = n; break; } used.add(p.number); } }
  syncDepth(league, A); syncDepth(league, B);
  league.news(`Traspaso: ${A.name} envía ${giveA.map(i => P[i].name).join(', ') || '—'} a ${B.name} por ${giveB.map(i => P[i].name).join(', ') || '—'}.`, 'trade', A.id);
}
export function generateOffers(league) {
  const d = league.data, P = d.players, rng = league.rng, user = d.teams[d.userTeam], avgs = leagueAverages(league);
  d.offers = d.offers.filter(o => o.expires >= d.week && o.year === d.year);
  if (d.offers.length >= 3) return;
  for (const t of Object.values(d.teams)) {
    if (t.id === user.id || !rng.chance(.09) || d.offers.length >= 3) continue;
    const needs = teamNeeds(league, t.id, avgs).slice(0, 3);
    for (const n of needs) {
      const target = user.roster.map(id => P[id]).filter(p => p.pos === n.pos && p.ovr > n.starterAvg && !isInjured(p)).sort((a, b) => b.ovr - a.ovr)[Math.floor(rng.next() * 2)];
      if (!target) continue;
      const want = tradeValue(target), give = t.roster.map(id => P[id]).filter(p => p.pos !== n.pos || t.roster.filter(x => P[x].pos === p.pos).length > ROSTER_TARGET[p.pos]).sort((a, b) => Math.abs(tradeValue(a) - want * 1.15) - Math.abs(tradeValue(b) - want * 1.15))[0];
      if (!give || tradeValue(give) < want * .95) continue;
      const o = { id: league.uid('o'), from: t.id, want: [target.id], give: [give.id], week: d.week, year: d.year, expires: d.week + 2 };
      const chk = evaluateTrade(league, { teamA: user.id, teamB: t.id, giveA: o.want, giveB: o.give });
      if (!chk.ok) continue;
      d.offers.push(o); break;
    }
  }
}

// ---------- Finances
// Sync the user team's cash with the shared Touchline wallet (see ../../touchline-bridge.js).
export function syncCashToTouchline(league, team, delta) {
  if (!delta || team.id !== league.data.userTeam) return;
  if (typeof window === 'undefined' || !window.Touchline) return;
  if (delta > 0) window.Touchline.addSilver(delta);
  else window.Touchline.removeSilver(-delta);
}
const TV = 168, SPONSORS = 12, MERCH = 8, CAPACITY = 62000, OPS = 18;
export function staffPayroll(league, team) { return 0; }
function _legacyStaffPayroll(league, team) { const s = team.staff; return r1(sum([s.hc, s.oc, s.dc, ...s.scouts, ...s.trainers].filter(Boolean).map(id => league.data.staff[id]?.salary ?? 0))); }
export function projectedAttendance(team) { return Math.max(.3, Math.min(1, .5 + team.finance.hype / 100 * .42 - (team.finance.ticket - 85) / 100 * .55)); }
export function weeklyFinance(league, team, { home, playoff = false } = {}) {
  const n = league.data.seasonLength, f = team.finance, tv = TV / n, sponsors = SPONSORS / n, merch = MERCH / n * (.6 + f.hype / 100 * .8);
  let gate = 0, att = 0;
  if (home) { att = projectedAttendance(team); gate = att * CAPACITY * f.ticket / 1e6 * (14 / n) * (playoff ? 1.6 : 1); }
  const revenue = r1(tv + sponsors + merch + gate);
  const expenses = r1((payroll(league, team) - (team.deadCap || 0)) / n + (team.deadCap || 0) / n + staffPayroll(league, team) / n + OPS / n);
  f.cash = r1(f.cash + revenue - expenses);
  syncCashToTouchline(league, team, r1(revenue - expenses));
  f.log.push({ year: league.data.year, week: league.data.week + 1, revenue, expenses, profit: r1(revenue - expenses), gate: r1(gate), att: Math.round(att * 100) });
  if (f.log.length > 40) f.log.shift();
}

// ---------- Staff
export function hireStaff(league, teamId, staffId, replaceId = null) {
  const d = league.data, team = d.teams[teamId], s = d.staff[staffId]; if (!s || s.teamId) return { ok: false, message: 'Ese miembro del staff ya no está disponible.' };
  const slot = { HC: 'hc', OC: 'oc', DC: 'dc' }[s.role];
  const current = slot ? [team.staff[slot]] : team.staff[s.role === 'SCOUT' ? 'scouts' : 'trainers'];
  if (!slot && current.length >= 2 && !replaceId) return { ok: false, message: 'Máximo 2. Elige a quién reemplazar.' };
  const out = slot ? team.staff[slot] : replaceId;
  if (out) fireStaff(league, teamId, out, { silent: true, free: true });
  s.teamId = teamId; d.staffPool = d.staffPool.filter(id => id !== staffId);
  if (slot) team.staff[slot] = s.id; else team.staff[s.role === 'SCOUT' ? 'scouts' : 'trainers'].push(s.id);
  league.news(`${team.name} contrata a ${s.name} (${STAFF_ROLES[s.role]}).`, 'staff', teamId);
  return { ok: true, message: `${s.name} contratado.` };
}
export function fireStaff(league, teamId, staffId, { silent = false, free = false } = {}) {
  const d = league.data, team = d.teams[teamId], s = d.staff[staffId]; if (!s) return { ok: false };
  if (!free) { const severance = r1(s.salary * s.years * .5); team.finance.cash = r1(team.finance.cash - severance); syncCashToTouchline(league, team, -severance); }
  for (const k of ['hc', 'oc', 'dc']) if (team.staff[k] === staffId) team.staff[k] = null;
  team.staff.scouts = team.staff.scouts.filter(x => x !== staffId); team.staff.trainers = team.staff.trainers.filter(x => x !== staffId);
  s.teamId = null; d.staffPool.push(staffId);
  if (!silent) league.news(`${team.name} despide a ${s.name}.`, 'staff', teamId);
  return { ok: true, message: `${s.name} despedido (indemnización ${r1(s.salary * s.years * .5)}M).` };
}

// ---------- CPU roster management
export function cpuMaintain(league) {
  const d = league.data, P = d.players;
  for (const t of Object.values(d.teams)) {
    if (t.id === d.userTeam) continue;
    for (const pos of POSITIONS) {
      let guard = 0;
      while (guard++ < 4 && t.roster.length < ROSTER_MAX) {
        const mine = t.roster.map(id => P[id]).filter(p => p.pos === pos);
        if (mine.length >= ROSTER_TARGET[pos] - (pos === 'QB' || pos === 'K' || pos === 'P' ? 0 : 1) && mine.filter(p => !isInjured(p)).length >= ROSTER_MIN[pos] + 1) break;
        const fa = d.freeAgents.map(id => P[id]).filter(p => p.pos === pos).sort((a, b) => b.ovr - a.ovr);
        const pick = fa.find(p => { const c = askFor(league, p, t.id); return canSign(league, t, p, c).ok; });
        if (!pick) break;
        attachPlayer(league, t, pick, newContract(askFor(league, pick, t.id)));
      }
    }
    // occasional upgrade with cap room
    if (league.rng.chance(.25) && t.roster.length <= ROSTER_MAX) {
      const best = d.freeAgents.map(id => P[id]).sort((a, b) => b.ovr - a.ovr)[0];
      if (best) {
        const starters = t.roster.map(id => P[id]).filter(p => p.pos === best.pos).sort((a, b) => b.ovr - a.ovr).slice(0, STARTERS[best.pos]);
        const weakest = starters.at(-1);
        if (weakest && best.ovr >= weakest.ovr + 3) {
          const ask = askFor(league, best, t.id);
          if (t.roster.length >= ROSTER_MAX) { const cut = t.roster.map(id => P[id]).filter(p => p.pos === best.pos).sort((a, b) => a.ovr - b.ovr)[0]; if (cut && cut.id !== weakest.id) releasePlayer(league, t.id, cut.id, { silent: true }); }
          if (canSign(league, t, best, ask).ok) attachPlayer(league, t, best, newContract(ask));
        }
      }
    }
  }
  for (const id of d.freeAgents) { const p = P[id]; p.freeWeeks = (p.freeWeeks || 0) + 1; }
}
export { newContract };
