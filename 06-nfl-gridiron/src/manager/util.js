import { clamp } from '../sim/math.js';
export const rint = (rng, a, b) => Math.floor(rng.range(a, b + 1));
export const normal = (rng, mean, sd) => { let u = 0; for (let i = 0; i < 4; i++) u += rng.next(); return mean + (u - 2) * sd * 1.73; };
export const ci = (v, lo = 30, hi = 98) => Math.round(clamp(v, lo, hi));
export const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
export const sum = a => a.reduce((x, y) => x + y, 0);
export const r1 = v => Math.round(v * 10) / 10;
export const pct = (a, b) => b ? Math.round(a / b * 1000) / 10 : 0;
export const clone = o => JSON.parse(JSON.stringify(o));
export function shuffle(rng, arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function weightedPick(rng, items, weight) {
  const w = items.map(weight), t = sum(w); if (t <= 0) return rng.pick(items);
  let r = rng.next() * t; for (let i = 0; i < items.length; i++) { r -= w[i]; if (r <= 0) return items[i]; } return items.at(-1);
}
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Fechas de calendario: la semana 1 se juega el domingo 13 de septiembre del año de la temporada; una semana por domingo (los playoffs siguen la cuenta).
export const weekDate = (year, week) => new Date(Date.UTC(year, 8, 13 + Math.max(0, week) * 7));
export const fmtWeek = (year, week, short = false) => weekDate(year, week).toLocaleDateString('es-ES', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', ...(short ? {} : { year: 'numeric' }) });
