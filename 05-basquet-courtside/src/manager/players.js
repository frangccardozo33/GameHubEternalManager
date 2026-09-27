import { BASE_RATINGS, clamp } from '../simulation/model.js';
import { ATTRIBUTES, ROLES, OVR_W, FIRST, LAST } from './data.js';
import { ROSTER } from './roster-data.js';

// ---- Roster fijo (roster-data.js) y nombres únicos por apellido (al jugador se lo identifica por el apellido) ----
export const PLACEHOLDER = ROSTER.placeholder;
export const RBYID = new Map(ROSTER.players.map(e => [e.id, e]));
const TONES = ['#b98257', '#65422f', '#d4a47d', '#986144', '#52382c'];
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toneIndex = hex => { const c = hexRgb(hex); let best = 0, bd = 1e9; TONES.forEach((t, i) => { const d = hexRgb(t).reduce((a, v, k) => a + (v - c[k]) ** 2, 0); if (d < bd) { bd = d; best = i; } }); return best; };
const surOf = n => String(n).replace(/-/g, ' ').trim().split(/\s+/).filter(x => !/^(jr|sr|ii|iii|iv)\.?$/i.test(x)).pop().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
export const NAMES_USED = new Set();
export const reserveNames = players => { NAMES_USED.clear(); for (const p of Object.values(players)) NAMES_USED.add(surOf(p.last || p.name)); };
const POOL_KEYS = ['lat', 'lat', 'lat', 'tam', 'gra', 'ibe', 'kai', 'mar', 'mel', 'ria', 'sah', 'zen', 'lat', 'kai'];
function genName(rng) {
  for (let i = 0; i < 300; i++) {
    const key = rng.pick(POOL_KEYS), [F, L] = ROSTER.pools[key], last = rng.pick(L);
    if (NAMES_USED.has(surOf(last))) continue;
    NAMES_USED.add(surOf(last)); const nats = ROSTER.poolNats[key]; return { first: rng.pick(F), last, nat: nats[Math.floor(rng.next() * nats.length)] };
  }
  const first = rng.pick(FIRST), last = rng.pick(LAST) + ' ' + Math.floor(rng.range(2, 9)); return { first, last, nat: 'Peronia' };
}
// makeFromRoster: mismo registro que makePlayer con datos fijos (atributos, edad, altura, aspecto y retrato del roster).
export function makeFromRoster(rng, id, e, { teamId = null } = {}) {
  const a = {}; ATTRIBUTES.forEach((k, i) => { a[k] = e.at[i]; });
  const parts = e.n.split(' '), first = parts[0], last = parts.slice(1).join(' ') || parts[0], ovr = ovrOf(a, e.r);
  NAMES_USED.add(surOf(last));
  return { id, first, last, name: `${first[0]}. ${last}`, age: e.a, h: e.h, role: e.r, num: e.num || 0, skin: toneIndex(e.sk), a, ovr, pot: Math.max(e.pt, ovr), form: 60, cond: 100, morale: 65, teamId, contract: null,
    st: NEW_STATS(), stpo: NEW_STATS(), hist: [], ovrHist: [], log: [], photo: e.ph, nat: e.nat, look: { skin: e.sk, hair: e.hr, hs: e.hs, bald: !!e.bald }, rosterId: e.id, note: e.nt || '' };
}
export const ovrOf = (a, role) => { const w = OVR_W[role]; let t = 0; ATTRIBUTES.forEach((k, i) => { t += a[k] * w[i]; }); return Math.round(t); };
export const NEW_STATS = () => ({ gp: 0, gs: 0, min: 0, pts: 0, reb: 0, oreb: 0, ast: 0, stl: 0, blk: 0, tov: 0, pf: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0, rim: 0, rima: 0, pm: 0 });
// Valor de mercado (M€/año): crece con la potencia del OVR y se ajusta por edad y potencial.
export function valueOf(p) {
  const young = clamp((27 - p.age) / 8, 0, 1) * 0.6, eff = clamp(p.ovr + Math.max(0, p.pot - p.ovr) * young, 55, 97);
  const base = 0.6 + 30 * Math.pow((eff - 55) / 40, 2.6), old = p.age > 31 ? 1 - 0.07 * (p.age - 31) : 1;
  return Math.max(0.5, Math.round(base * old * 10) / 10);
}
export function makePlayer(rng, id, { role, tier, age, teamId = null }) {
  const a = {}; ATTRIBUTES.forEach((k, i) => { a[k] = Math.round(clamp(BASE_RATINGS[ROLES.indexOf(role)][i] + tier + rng.range(-6, 6), 32, 97)); });
  const { first, last, nat } = genName(rng), ovr = ovrOf(a, role);
  const grow = age <= 21 ? rng.range(4, 16) : age <= 23 ? rng.range(2, 10) : age <= 26 ? rng.range(0, 5) : 0;
  const p = { id, first, last, name: `${first[0]}. ${last}`, age, h: +(([1.86, 1.94, 2.01, 2.08, 2.16][ROLES.indexOf(role)]) + rng.range(-0.04, 0.04)).toFixed(2), role, num: 0, skin: Math.floor(rng.range(0, 5)), photo: PLACEHOLDER, nat,
    a, ovr, pot: Math.min(97, Math.round(ovr + grow)), form: 60, cond: 100, morale: 65, teamId, contract: null, st: NEW_STATS(), stpo: NEW_STATS(), hist: [], ovrHist: [], log: [] };
  return p;
}
export function newContract(rng, p, role = null) {
  return { salary: 0, years: 1 + Math.floor(rng.range(0, 4)), role: role ?? autoRole(p), bonus: 0, clauses: { noTrade: false, rolePromise: false } };
}
export const autoRole = p => p.ovr >= 85 ? 'star' : p.ovr >= 78 ? 'starter' : p.ovr >= 73 ? 'sixth' : p.ovr >= 66 ? 'rotation' : p.age <= 22 ? 'prospect' : 'bench';
// Progresión anual: depende de edad, potencial y tipo de atributo (atlético vs técnico).
const ATHLETIC = new Set(['speed', 'acceleration', 'stamina', 'physical', 'finishing']);
export function progress(rng, p, boost = 0) {
  const before = p.ovr, changes = {};
  const base = p.age <= 21 ? rng.range(1, 3.2) : p.age <= 24 ? rng.range(0.2, 2.2) : p.age <= 28 ? rng.range(-0.8, 1) : p.age <= 31 ? rng.range(-1.8, 0.4) : rng.range(-3.2, -0.6);
  for (const k of ATTRIBUTES) {
    let d = base + boost; const ath = ATHLETIC.has(k);
    d *= d >= 0 ? (ath ? 0.8 : 1.2) : (ath ? 1.6 : 0.6);
    if (d > 0 && p.ovr >= p.pot) d = Math.min(d, 0.4);
    const v = Math.round(clamp(p.a[k] + d + rng.range(-0.8, 0.8), 30, 98)); if (v !== p.a[k]) changes[k] = v - p.a[k]; p.a[k] = v;
  }
  p.ovr = ovrOf(p.a, p.role);
  p.pot = p.age <= 24 ? Math.max(p.ovr, Math.min(97, Math.round(p.pot + rng.range(-2, 2.5)))) : p.ovr;
  return { delta: p.ovr - before, changes };
}
export const PLAYER_TAGS = p => {
  const a = p.a, t = [];
  if (a.three >= 84) t.push('Tirador de 3'); if (a.passing >= 84 && a.vision >= 84) t.push('Creador'); if (a.interiorDefense >= 84) t.push('Protector de aro');
  if (a.rebounding >= 86) t.push('Reboteador'); if (a.defense >= 84) t.push('Defensor exterior'); if (a.finishing >= 88) t.push('Finalizador'); if (a.speed >= 88) t.push('Explosivo');
  if (a.handling >= 86) t.push('Manejo elite'); if (p.pot - p.ovr >= 8 && p.age <= 23) t.push('Promesa'); if (p.age >= 32 && p.ovr >= 74) t.push('Veterano');
  return t;
};
