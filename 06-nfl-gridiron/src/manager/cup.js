// Copa LGO: torneo corto de eliminatoria a partido único que se juega entre semanas de la liga regular.
// Cuartos de final, semifinales y final con los 8 mejores equipos por nivel de plantilla (4 si la liga es chica); el equipo del usuario
// siempre entra. Las semanas de copa son semanas del calendario (type:'cup'): pasan el entrenamiento, la recuperación y las finanzas,
// pero no cuentan para el récord de la liga regular. En empate se define por el equipo de mayor siembra (igual que los playoffs).
import { syncCashToTouchline } from './economy.js';
import { r1 } from './util.js';

export const CUP = { name: 'Copa LGO', fractions: { 3: [0.22, 0.52, 0.82], 2: [0.4, 0.8] }, prizes: [0.8, 1.5, 3], champion: 5, runnerUp: 1.5 };   // premios en M$
const NAMES = { 8: ['Cuartos de final', 'Semifinales', 'Final'], 4: ['Semifinales', 'Final'] };
const bracketOrder = n => { let o = [1]; while (o.length < n) { const m = o.length * 2 + 1; o = o.flatMap(x => [x, m - x]); } return o; };
const strength = (lg, t) => { const v = lg.roster(t).map(p => p.ovr).sort((a, b) => b - a).slice(0, 22); return v.reduce((a, b) => a + b, 0) / Math.max(1, v.length); };

// Arma la copa de la temporada y devuelve el calendario con las semanas de copa intercaladas (se llama desde buildCalendar).
export function insertCup(lg, calendar) {
  const d = lg.data, ids = [...d.teamOrder];
  if (ids.length < 4) { d.cup = null; return calendar; }
  const size = ids.length >= 8 ? 8 : 4, k = Math.log2(size), names = NAMES[size];
  const seeds = ids.slice().sort((a, b) => strength(lg, d.teams[b]) - strength(lg, d.teams[a])).slice(0, size);
  if (!seeds.includes(d.userTeam)) seeds[size - 1] = d.userTeam;
  const L = calendar.length, slots = CUP.fractions[k].map(f => Math.max(1, Math.round(L * f)));
  d.cup = { name: CUP.name, year: d.year, size, seeds, names, done: false, champion: null, runnerUp: null };
  return pushWeeks(lg, calendar, slots, names, seeds);
}
function pairs(lg, order, seeds) {
  const out = [];
  for (let i = 0; i < order.length; i += 2) { const a = order[i], b = order[i + 1], hi = seeds.indexOf(a) <= seeds.indexOf(b); out.push({ id: lg.uid('g'), type: 'cup', home: hi ? a : b, away: hi ? b : a, played: false, score: null }); }
  return out;
}
function pushWeeks(lg, calendar, slots, names, seeds) {
  const out = [];
  calendar.forEach((w, i) => {
    out.push(w);
    const r = slots.indexOf(i + 1);
    if (r >= 0) out.push({ type: 'cup', label: `${CUP.name} · ${names[r]}`, cupRound: r, fixtures: r === 0 ? pairs(lg, bracketOrder(seeds.length).map(x => seeds[x - 1]), seeds) : [] });
  });
  return out;
}

const pay = (lg, id, m, why) => { if (id !== lg.data.userTeam || !m) return; const t = lg.team(id); t.finance.cash = r1(t.finance.cash + m); syncCashToTouchline(lg, t, m); lg.news(`Premio de copa: ${why} (+${m} M$).`, 'info', id); };

// Después de completar una semana de copa: ganadores, premios y armado de la ronda siguiente.
export function advanceCup(lg, wk) {
  const d = lg.data, c = d.cup; if (!c || wk.type !== 'cup') return;
  const winners = wk.fixtures.map(f => f.winner ?? f.home), last = wk.fixtures.length === 1 && wk.cupRound === c.names.length - 1;
  for (const f of wk.fixtures) {
    const w = lg.team(f.winner ?? f.home), l = lg.team((f.winner ?? f.home) === f.home ? f.away : f.home);
    if (f.home === d.userTeam || f.away === d.userTeam || lg.team(f.home).id !== w.id) lg.news(`${CUP.name} · ${c.names[wk.cupRound]}: ${w.name} elimina a ${l.name} (${f.score[0]}-${f.score[1]}).`, 'info', w.id);
  }
  if (last) {
    const f = wk.fixtures[0]; c.done = true; c.champion = f.winner ?? f.home; c.runnerUp = c.champion === f.home ? f.away : f.home;
    (d.cupHistory ??= []).unshift({ year: d.year, champion: c.champion, runnerUp: c.runnerUp, score: `${f.score[0]}-${f.score[1]}` });
    pay(lg, c.champion, CUP.champion, `campeón de la ${CUP.name}`); pay(lg, c.runnerUp, CUP.runnerUp, `subcampeón de la ${CUP.name}`);
    lg.news(`${lg.team(c.champion).name} gana la ${CUP.name}.`, 'champion', c.champion);
    return;
  }
  const idx = wk.cupRound + (3 - c.names.length);
  for (const id of winners) pay(lg, id, CUP.prizes[Math.min(CUP.prizes.length - 1, idx)], `pasa de ronda en la ${CUP.name}`);
  const next = d.calendar.find(w => w.type === 'cup' && w.cupRound === wk.cupRound + 1);
  if (next) next.fixtures = pairs(lg, winners, c.seeds);
}
