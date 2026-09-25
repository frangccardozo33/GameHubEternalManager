import { clamp } from '../simulation/model.js';
import { ATTRIBUTES, OVR_W, ATTR_LABELS } from './data.js';
import { ovrOf } from './players.js';

export const INTENSITY = { low: { label: 'Suave', rate: 0.075, rec: 4 }, normal: { label: 'Normal', rate: 0.15, rec: 0 }, high: { label: 'Intensa', rate: 0.24, rec: -5 } };
export const facilityCost = (key, lvl) => (key === 'stadium' ? 25 : 20) * lvl;
export const capacityOf = lvl => 9000 + 3000 * lvl;
const ageMult = a => (a <= 22 ? 1.3 : a <= 25 ? 1.15 : a <= 29 ? 1 : a <= 32 ? 0.7 : 0.45);
const newLedger = () => ({ tickets: 0, playoffs: 0, tv: 0, sponsors: 0, merch: 0, bonus: 0, payroll: 0, facilities: 0, ops: 0, home: 0, att: 0 });
export const REV_KEYS = [['tickets', 'Entradas (liga)'], ['playoffs', 'Entradas (playoffs)'], ['tv', 'Derechos de TV'], ['sponsors', 'Patrocinadores'], ['merch', 'Merchandising'], ['bonus', 'Primas por resultados']];
export const EXP_KEYS = [['payroll', 'Salarios'], ['facilities', 'Mantenimiento de instalaciones'], ['ops', 'Operaciones del pabellón']];
export const sumKeys = (l, keys) => keys.reduce((a, [k]) => a + (l[k] || 0), 0);
// Sync the club's cash with the shared Touchline wallet (see ../../touchline-bridge.js).
export function syncCashToTouchline(delta) {
  if (!delta || typeof window === 'undefined' || !window.Touchline) return;
  if (delta > 0) window.Touchline.addSilver(delta);
  else window.Touchline.removeSilver(-delta);
}

export function install(Game) {
  Object.assign(Game.prototype, {
    initClub() {
      const s = this.s; s.fin ??= { cash: 30, ticketPrice: 60, stadium: 1, trainFac: 1, pop: null, season: newLedger(), history: [], board: { conf: 60, obj: null } };
      s.fin.ticketPrice = 60; // fijo: el precio ya no es configurable (igual que en el módulo de fútbol)
      s.trainIntensity ??= 'normal';
    },
    pop() { return this.s.fin.pop ?? this.user.popularity; },
    // ---------- entrenamiento ----------
    recommendFocus(p) {
      const w = OVR_W[p.role]; let best = ATTRIBUTES[0], bv = -1;
      ATTRIBUTES.forEach((k, i) => { const v = w[i] * (95 - p.a[k]); if (v > bv) { bv = v; best = k; } }); return best;
    },
    trainMult() { return (1 + 0.08 * (this.fin.trainFac - 1)); },
    recoveryBonus() { return INTENSITY[this.s.trainIntensity].rec; },
    trainDay() {
      const rate = INTENSITY[this.s.trainIntensity].rate * 14 / this.s.schedule.length * this.trainMult();
      for (const p of this.roster(this.user)) if (p.focus) p.tp = (p.tp || 0) + rate * ageMult(p.age) * (p.ovr >= p.pot ? 0.4 : 1);
    },
    // Al final de la temporada: convierte los puntos de entrenamiento en mejora real del atributo trabajado.
    applyTraining(p) {
      const tp = p.tp || 0, k = p.focus; p.tp = 0; if (!k || tp <= 0) return null;
      const gain = Math.round(clamp(tp, 0, 5)), before = p.a[k], beforeOvr = p.ovr; p.a[k] = clamp(before + gain, 30, 98);
      p.ovr = ovrOf(p.a, p.role); p.pot = Math.max(p.pot, p.ovr); return { attr: k, gain: p.a[k] - before, ovrDelta: p.ovr - beforeOvr };
    },
    aiTraining(p) { p.focus = this.recommendFocus(p); p.tp = 1.0 * ageMult(p.age) * (0.6 + 0.8 * this.rng.next()); },
    // ---------- instalaciones ----------
    upgradeFacility(key) {
      const f = this.fin, lvl = f[key], cost = facilityCost(key, lvl);
      if (lvl >= 5) return { ok: false, msg: 'Ya está al máximo.' }; if (f.cash < cost) return { ok: false, msg: `Necesitas ${cost} M€ en caja (tienes ${f.cash.toFixed(1)}).` };
      f.cash -= cost; syncCashToTouchline(-cost); f[key] = lvl + 1; this.news('Instalaciones', `${key === 'stadium' ? 'Pabellón' : 'Centro de entrenamiento'} nivel ${lvl + 1} (${cost} M€).`); return { ok: true, msg: 'Mejora completada.' };
    },
    scoutPoints() { return 6; },
    // ---------- ingresos y gastos ----------
    annual() {
      const f = this.fin, pop = this.pop();
      return { tv: 45, sponsors: 22 + pop * 0.25, merch: 6 + pop * 0.15, facilities: f.stadium + f.trainFac, ops: 9 + 2 * f.stadium };
    },
    demand() {
      const rec = this.standings().find(x => x.id === this.s.userId), win = rec?.g ? rec.pct : 0.5;
      return clamp(0.5 + this.pop() / 200 + (win - 0.5) * 0.35, 0.3, 1.05);
    },
    attendance(price = this.fin.ticketPrice) { return Math.round(capacityOf(this.fin.stadium) * clamp(this.demand() * (1 - 0.012 * (price - 60)), 0.15, 1)); },
    gameRevenue(price = this.fin.ticketPrice, playoff = false) { const homeGames = Math.max(1, this.s.schedule.length / 2); return this.attendance(price) * price * (playoff ? 1.4 : 1) / 1e6 * (41 / homeGames); },
    book(l, key, v) { l[key] += v; },
    bookMatchRevenue(e) {
      const f = this.fin, po = !!e.series, r = this.gameRevenue(f.ticketPrice, po); f.season[po ? 'playoffs' : 'tickets'] += r; f.season.home++; f.season.att += this.attendance(); f.cash += r; syncCashToTouchline(r);
    },
    bookDay() {
      const f = this.fin, l = f.season, a = this.annual(), d = 1 / this.s.schedule.length, pay = this.payroll(this.user);
      const rev = (a.tv + a.sponsors + a.merch) * d, exp = (pay + a.facilities + a.ops) * d;
      l.tv += a.tv * d; l.sponsors += a.sponsors * d; l.merch += a.merch * d; l.payroll += pay * d; l.facilities += a.facilities * d; l.ops += a.ops * d; f.cash += rev - exp; syncCashToTouchline(rev - exp);
    },
    // ---------- cierre de temporada: tasa de lujo, primas, popularidad y directiva ----------
    closeFinance(champId, userPos) {
      const s = this.s, f = this.fin, l = f.season, P = this.cfg.playoffTeams;
      const won = champId === s.userId, made = P > 0 && userPos <= P; l.bonus = (made ? 4 : 0) + (won ? 8 : 0); f.cash += l.bonus; syncCashToTouchline(l.bonus);
      const rev = sumKeys(l, REV_KEYS), exp = sumKeys(l, EXP_KEYS), profit = rev - exp, rec = this.standings().find(x => x.id === s.userId), win = rec?.pct ?? 0.5;
      f.pop = clamp(this.pop() + (win - 0.5) * 14 + (won ? 6 : 0) - Math.max(0, f.ticketPrice - 80) * 0.08, 10, 100);
      f.history.unshift({ season: s.season, rev: +rev.toFixed(1), exp: +exp.toFixed(1), profit: +profit.toFixed(1), pos: userPos, cash: +f.cash.toFixed(1), pop: Math.round(f.pop), att: l.home ? Math.round(l.att / l.home) : 0 });
      this.news('Cierre de temporada', `Beneficio ${profit.toFixed(1)} M€. Caja: ${f.cash.toFixed(1)} M€.`);
    },
    newSeasonFinance() { const f = this.fin; f.season = newLedger(); this.s.scoutPts = this.scoutPoints(); },
    trainingReport(p, r) { return r ? { name: p.name, attr: ATTR_LABELS[r.attr], gain: r.gain, ovrDelta: r.ovrDelta } : null; },
  });
  Object.defineProperty(Game.prototype, 'fin', { get() { return this.s.fin; } });
}
