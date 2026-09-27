// Gestión del club por el DT humano de una liga online de fútbol: plantel, tácticas previas y mercado.
// El cliente trabaja sobre una copia del estado y manda órdenes; acá se validan y las aplica el propio núcleo TLM sobre el estado del servidor.
import { TLM } from './vendor/football-core.js';

const clone = (o) => JSON.parse(JSON.stringify(o));
const num = (v, lo = -1e12, hi = 1e12) => { v = +v; if (!Number.isFinite(v)) throw new Error('Número inválido'); return Math.min(hi, Math.max(lo, v)); };
const str = (v, n = 40) => { if (typeof v !== 'string' || v.length > n) throw new Error('Texto inválido'); return v; };
// datos simples y acotados (los diales y reglas del DT)
const plainData = (v, depth = 0) => {
  if (v === null || typeof v === 'boolean') return v;
  if (typeof v === 'number') { if (!Number.isFinite(v)) throw new Error('Número inválido'); return v; }
  if (typeof v === 'string') { if (v.length > 40) throw new Error('Texto inválido'); return v; }
  if (depth > 3 || typeof v !== 'object') throw new Error('Dato inválido');
  const ks = Object.keys(v); if (ks.length > 60) throw new Error('Demasiados datos');
  const o = Array.isArray(v) ? [] : {};
  for (const k of ks) { if (k.length > 40 || k === '__proto__') throw new Error('Clave inválida'); o[k] = plainData(v[k], depth + 1); }
  return o;
};
const terms = (o) => { o = o || {}; const t = {}; if (o.salary != null) t.salary = num(o.salary, 0, 1e9); if (o.years != null) t.years = Math.round(num(o.years, 1, 6)); if (o.edition != null) t.edition = str(o.edition, 30); return t; };

function myPid(s, me, id) { if (typeof id !== 'string' || !s.players[id] || s.players[id].clubId !== me) throw new Error('Ese jugador no es de tu club'); return id; }
function anyPid(s, id) { if (typeof id !== 'string' || !s.players[id]) throw new Error('Jugador inexistente'); return id; }
function offerOf(s, id, side, me) { const o = s.market.offers[id]; if (!o) throw new Error('La oferta ya no existe'); if ((side === 'from' ? o.fromClubId : o.toClubId) !== me) throw new Error('Esa oferta no es tuya'); return id; }

const OPS = {
  renewContract: (s, me, a) => TLM.renewContract(s, me, myPid(s, me, a[0]), num(a[1], 0, 1e9), Math.round(num(a[2], 1, 6))),
  listPlayer: (s, me, a) => TLM.listPlayer(s, me, myPid(s, me, a[0]), num(a[1], 0, 1e10)),
  unlistPlayer: (s, me, a) => { const l = s.market.listings[a[0]]; if (!l || l.clubId !== me) throw new Error('Ese jugador no lo pusiste en venta'); TLM.unlistPlayer(s, a[0]); return { ok: true }; },
  sellNow: (s, me, a) => TLM.sellNow(s, me, myPid(s, me, a[0])),
  buyEdition: (s, me, a) => TLM.buyEdition(s, me, myPid(s, me, a[0]), str(a[1], 30)),
  makeOffer: (s, me, a) => TLM.makeOffer(s, me, anyPid(s, a[0]), num(a[1], 0, 1e10), terms(a[2])),
  buyNow: (s, me, a) => TLM.buyNow(s, me, anyPid(s, a[0]), terms(a[1])),
  signFreeAgent: (s, me, a) => TLM.signFreeAgent(s, me, anyPid(s, a[0]), terms(a[1])),
  withdrawOffer: (s, me, a) => TLM.withdrawOffer(s, offerOf(s, a[0], 'from', me)),
  acceptCounter: (s, me, a) => TLM.acceptCounter(s, offerOf(s, a[0], 'from', me)),
  counterOffer: (s, me, a) => TLM.counterOffer(s, offerOf(s, a[0], 'from', me), num(a[1], 0, 1e10)),
  respondToOffer: (s, me, a) => { const id = offerOf(s, a[0], 'to', me); if (!['accept', 'reject', 'counter'].includes(a[1])) throw new Error('Acción inválida'); return TLM.respondToOffer(s, id, a[1], a[2] == null ? undefined : num(a[2], 0, 1e10)); },
  scout: (s, me, a) => TLM.scout(s, me, plainData(a[0] || {})),
  setTraining: (s, me, a) => { TLM.setTraining(s, s.clubs[me], a[0] == null ? null : str(a[0], 30), a[1] == null ? null : str(a[1], 30)); return { ok: true }; },
  upgradeStadium: (s, me) => TLM.upgradeStadium(s, s.clubs[me]),
  editClub: (s, me, a) => { const p = plainData(a[0] || {}); for (const k of Object.keys(p)) if (!['name', 'shortName', 'stadium', 'primaryColor', 'secondaryColor', 'capacity'].includes(k)) delete p[k]; return TLM.editClub(s, me, p); },
  setFormation: (s, me, a) => { const ok = TLM.setFormation(s, s.clubs[me], str(a[0], 12)); s.clubs[me].lineupMode = 'manual'; return { ok }; },
  autoLineup: (s, me) => { TLM.autoLineup(s, s.clubs[me]); s.clubs[me].lineupMode = 'auto'; return { ok: true }; },
};
const LOCKED_OPS = new Set(['setFormation', 'autoLineup']);

// Lo que el DT edita a mano (once, banco, diales, reglas, plan de partido, instrucciones): se acepta solo con la forma del club.
export function applyClubPatch(s, me, p) {
  const cl = s.clubs[me]; p = p || {};
  if (p.tactics) { const t = plainData(p.tactics); for (const k of Object.keys(cl.tactics)) if (k in t && typeof t[k] === typeof cl.tactics[k]) { if (k === 'formation' && !TLM.FORMATIONS[t[k]]) continue; cl.tactics[k] = t[k]; } }
  if (p.plan) { const t = plainData(p.plan); cl.plan = cl.plan || {}; for (const k of Object.keys(t)) if (['ifWinning', 'ifLosing', 'autoSubs', 'fromMinute'].includes(k)) cl.plan[k] = t[k]; }
  if (p.rules !== undefined) { if (p.rules === null) delete cl.rules; else { const r = plainData(p.rules); for (const id of Object.keys(r)) if (!r[id] || typeof r[id] !== 'object') throw new Error('Reglas inválidas'); cl.rules = r; } }
  if (p.instructions) { const t = plainData(p.instructions), o = {}; for (const id of Object.keys(t)) if (cl.squad.includes(id) && typeof t[id] === 'string') o[id] = t[id]; cl.instructions = o; }
  if (p.lineup) {
    const xi = p.lineup.xi, bench = p.lineup.bench;
    if (!Array.isArray(xi) || xi.length !== 11 || !Array.isArray(bench) || bench.length > 12) throw new Error('Once inválido');
    const seen = new Set();
    for (const id of [...xi, ...bench]) { if (id == null) continue; if (typeof id !== 'string' || !cl.squad.includes(id) || seen.has(id)) throw new Error('Once inválido: jugador repetido o ajeno'); seen.add(id); }
    cl.lineup = { xi: xi.map((x) => x || null), bench: bench.filter(Boolean) };
  }
  if (p.lineupMode === 'auto' || p.lineupMode === 'manual') cl.lineupMode = p.lineupMode;
  TLM.repairLineup(s, cl);
}

export function setHumans(c, ids, names = {}) {
  const set = new Set(ids); c.state.humanClubs = [...set];
  for (const [id, cl] of Object.entries(c.state.clubs)) { if (!cl.foreign) cl.controlledBy = set.has(id) ? 'user' : 'ai'; cl.humanName = set.has(id) ? (names[id] || null) : null; }
  for (const id of set) { const cl = c.state.clubs[id]; if (cl) { cl.lineupMode = cl.lineupMode || 'auto'; TLM.repairLineup(c.state, cl); } }
}

// Copia del estado para el DT de `club`: el once y las tácticas de OTROS humanos no se ven (se muestra su mejor once automático).
export function exportState(c, club) {
  const s = clone(c.state); s.currentClubId = club; delete s.onlineRes; delete s.onlinePrep;
  for (const id of s.humanClubs || []) if (id !== club && s.clubs[id]) {
    const cl = s.clubs[id];
    cl.lineup = { xi: Array(11).fill(null), bench: [] }; cl.plan = { ifWinning: 'control', ifLosing: 'push', fromMinute: { minute: 70, mode: 'hold' } }; delete cl.rules; delete cl.instructions;
    TLM.autoLineup(s, cl);
  }
  return JSON.stringify(s);
}

// body: { op, args } (mercado/club) o { op: 'club', patch } (once, tácticas, reglas, plan)
export function command(c, club, body, ctx) {
  const s = c.state, cl = s.clubs[club];
  if (!cl || cl.controlledBy !== 'user') throw new Error('No dirigís este club');
  if (!body || typeof body.op !== 'string') throw new Error('Orden inválida');
  if (body.op === 'club') {
    if (ctx.locked) throw new Error('El partido está por empezar o en juego: el once quedó cerrado. Usá los controles de la transmisión.');
    applyClubPatch(s, club, body.patch); return { ok: true, mutated: true };
  }
  const fn = OPS[body.op];
  if (!fn || !Array.isArray(body.args || [])) throw new Error('Orden desconocida');
  if (ctx.locked && LOCKED_OPS.has(body.op)) throw new Error('El once quedó cerrado: el partido está por empezar o en juego.');
  const r = fn(s, club, body.args || []);
  if (cl.lineupMode === 'auto' && !ctx.locked) TLM.autoLineup(s, cl);
  return { ok: !r || r.ok !== false, result: r === undefined ? null : r, mutated: true };
}
