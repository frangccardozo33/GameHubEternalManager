// Gestión del club por el DT humano de una liga online de básquet: rotación, tácticas, mercado, traspasos entre DT, copa y draft.
// Cada humano tiene su propio contexto (caja, ofertas, puntos de scouting): el motor del juego lee "el usuario" de s.userId, así que
// cada orden se ejecuta con ese contexto puesto (withUser) y se guarda de vuelta.
import { Game } from '../../05-basquet-courtside/src/manager/game.js';
import { defaultTactics } from '../../05-basquet-courtside/src/simulation/model.js';
import { LIM } from '../../05-basquet-courtside/src/manager/market.js';
import { TEAM_ROLES } from '../../05-basquet-courtside/src/manager/data.js';

const clone = (o) => JSON.parse(JSON.stringify(o));
const CTX = ['fin', 'offers', 'scoutPts', 'trainIntensity'];
const PICK_MS = 90e3;            // tiempo de cada pick del draft para un DT humano (después elige la IA)
const num = (v, lo, hi) => { v = +v; if (!Number.isFinite(v)) throw new Error('Número inválido'); return Math.min(hi, Math.max(lo, v)); };
const str = (v, n = 24) => { if (typeof v !== 'string' || v.length > n) throw new Error('Texto inválido'); return v; };

export function withUser(g, idx, fn) {
  const s = g.s, saved = { userId: s.userId }; for (const k of CTX) saved[k] = s[k];
  const hum = (s.hum ||= {}), h = (hum[idx] ||= { fin: clone(saved.fin), offers: [], scoutPts: saved.scoutPts ?? 6, trainIntensity: 'normal' });
  s.userId = idx; for (const k of CTX) s[k] = h[k];
  try { return fn(); } finally { for (const k of CTX) h[k] = s[k]; s.userId = saved.userId; for (const k of CTX) s[k] = saved[k]; }
}

export function setHumans(g, ids, names = {}) {
  const s = g.s, hs = ids.map(Number).filter((i) => s.teams[i]); s.humans = hs; s.tradeProps ??= [];
  s.teams.forEach((t) => { t.isUser = hs.includes(t.id); t.humanName = t.isUser ? (names[t.id] ?? names[String(t.id)] ?? null) : null; });
  for (const i of hs) { withUser(g, i, () => {}); g.ensureLineup(s.teams[i]); }
  if (hs.length) s.userId = hs[0];
}

// Copia del estado para el DT de `club`: sus cosas propias; el once y las tácticas de otros humanos se ocultan.
export function exportState(g, club) {
  const idx = +club, s = clone(g.toJSON()), hum = s.hum || {}; delete s.hum;
  s.userId = idx; const h = hum[idx]; if (h) for (const k of CTX) s[k] = h[k];
  s.tradeProps = (s.tradeProps || []).filter((t) => t.from === idx || t.to === idx);
  for (const t of s.teams) t.isUser = t.id === idx;
  const cg = new Game(s);
  for (const i of s.humans || []) if (i !== idx) { const t = cg.team(i); cg.autoLineup(t); t.tactics = defaultTactics(); t.assign = {}; t.usage = {}; }
  const out = cg.toJSON(); return JSON.stringify(out);
}

const mineIds = (g, idx, ids, max = 14) => {
  if (!Array.isArray(ids) || ids.length > max) throw new Error('Selección inválida');
  const ros = new Set(g.team(idx).roster); for (const id of ids) if (!ros.has(id)) throw new Error('Ese jugador no es de tu equipo');
  return [...new Set(ids)];
};
const theirIds = (g, to, ids, max = 14) => {
  if (!Array.isArray(ids) || ids.length > max) throw new Error('Selección inválida');
  const ros = new Set(g.team(to).roster); for (const id of ids) if (!ros.has(id)) throw new Error('Ese jugador no es del otro equipo');
  return [...new Set(ids)];
};
const offerOf = (o) => { o = o || {}; const role = str(o.role, 12); if (!TEAM_ROLES[role]) throw new Error('Rol inválido'); return { salary: num(o.salary, 0.4, 60), years: Math.round(num(o.years, 1, 5)), role }; };

function applyPatch(g, idx, p) {
  const t = g.team(idx), ros = new Set(t.roster); p = p || {};
  if (p.lineup) {
    const { starters, bench } = p.lineup;
    if (!Array.isArray(starters) || starters.length !== 5 || !Array.isArray(bench) || bench.length > 8) throw new Error('Rotación inválida');
    const seen = new Set(); for (const id of [...starters, ...bench]) { if (!ros.has(id) || seen.has(id)) throw new Error('Rotación inválida: jugador repetido o ajeno'); seen.add(id); }
    t.lineup = { starters: [...starters], bench: [...bench] };
  }
  if (p.plan) {
    const q = p.plan, plan = t.plan;
    if (q.minutes) { const m = {}; for (const id of Object.keys(q.minutes)) if (ros.has(id)) m[id] = num(q.minutes[id], 0, 0.95); plan.minutes = m; }
    if (q.closer === null || (typeof q.closer === 'string' && ros.has(q.closer))) plan.closer = q.closer;
    if (q.foulPolicy != null) plan.foulPolicy = str(q.foulPolicy, 16); if (q.staminaPolicy != null) plan.staminaPolicy = str(q.staminaPolicy, 16);
  }
  if (p.tactics) {
    const base = defaultTactics(), q = p.tactics;
    for (const k of Object.keys(base)) if (k in q) { if (typeof base[k] === 'number') t.tactics[k] = Math.round(num(q[k], 0, 100)); else t.tactics[k] = str(q[k], 16); }
  }
  if (p.assign) { const a = {}; for (const id of Object.keys(p.assign)) if (ros.has(id)) { const v = p.assign[id]; if (v !== '' && v != null) a[id] = num(v, 0, 9); } t.assign = a; }
  if (p.usage) { const a = {}; for (const id of Object.keys(p.usage)) if (ros.has(id)) a[id] = str(p.usage[id], 12); t.usage = a; }
  if (p.focus) for (const id of Object.keys(p.focus)) if (ros.has(id)) g.player(id).focus = p.focus[id] == null || p.focus[id] === '' ? null : str(p.focus[id], 24);
  if (p.trainIntensity && ['low', 'normal', 'high'].includes(p.trainIntensity)) withUser(g, idx, () => { g.s.trainIntensity = p.trainIntensity; });
  g.ensureLineup(t);
}

const isHuman = (g, i) => (g.s.humans || []).includes(i);
const OPS = {
  signFreeAgent: (g, i, a) => { const pid = str(a[0], 20); return withUser(g, i, () => g.signFreeAgent(pid, offerOf(a[1]))); },
  renewPlayer: (g, i, a) => { const pid = mineIds(g, i, [a[0]], 1)[0]; return withUser(g, i, () => g.renewPlayer(pid, offerOf(a[1]))); },
  releasePlayer: (g, i, a) => { const pid = mineIds(g, i, [a[0]], 1)[0]; return g.releasePlayer(pid, i); },
  acceptOffer: (g, i, a) => withUser(g, i, () => g.acceptOffer(Math.round(num(a[0], 0, 1e9)))),
  rejectOffer: (g, i, a) => { withUser(g, i, () => g.rejectOffer(Math.round(num(a[0], 0, 1e9)))); return { ok: true }; },
  scoutProspect: (g, i, a) => withUser(g, i, () => g.scoutProspect(str(a[0], 20))),
  upgradeFacility: (g, i, a) => { const k = str(a[0], 12); if (!['stadium', 'trainFac'].includes(k)) throw new Error('Mejora inválida'); return withUser(g, i, () => g.upgradeFacility(k)); },
  autoLineup: (g, i) => { g.autoLineup(g.team(i)); return { ok: true }; },
  // traspaso con un equipo de la IA: lo evalúa el juego (igual que en el modo carrera)
  tradeAI: (g, i, a) => {
    const to = Math.round(num(a[0], 0, 99)); if (!g.s.teams[to] || isHuman(g, to)) throw new Error('Ese equipo lo dirige otro DT: mandá una propuesta');
    const mine = mineIds(g, i, a[1] || []), theirs = theirIds(g, to, a[2] || []);
    return withUser(g, i, () => { const r = g.evalTrade(to, mine, theirs); if (!r.ok) return r; g.executeTrade(to, mine, theirs); return { ok: true, msg: 'Traspaso completado' }; });
  },
  // traspaso con otro DT humano: queda como propuesta hasta que responda
  tradePropose: (g, i, a) => {
    const to = Math.round(num(a[0], 0, 99)); if (!isHuman(g, to) || to === i) throw new Error('Ese equipo no lo dirige otro DT');
    const mine = mineIds(g, i, a[1] || []), theirs = theirIds(g, to, a[2] || []); if (!mine.length && !theirs.length) throw new Error('Elegí jugadores');
    const s = g.s; s.tradeProps = (s.tradeProps || []).filter((t) => t.exp >= s.day); const id = s.nid.n++;
    s.tradeProps.push({ id, from: i, to, mine, theirs, exp: s.day + 8 }); return { ok: true, id, msg: 'Propuesta enviada' };
  },
  tradeAnswer: (g, i, a) => {
    const s = g.s, id = Math.round(num(a[0], 0, 1e9)), t = (s.tradeProps || []).find((x) => x.id === id && x.to === i);
    if (!t) throw new Error('La propuesta ya no existe');
    s.tradeProps = s.tradeProps.filter((x) => x !== t); if (!a[1]) return { ok: true, msg: 'Propuesta rechazada' };
    const A = g.team(t.from), B = g.team(t.to);
    const okA = t.mine.every((p) => A.roster.includes(p)), okB = t.theirs.every((p) => B.roster.includes(p)); if (!okA || !okB) return { ok: false, msg: 'Alguno de los jugadores ya no está en su equipo.' };
    const nA = A.roster.length - t.mine.length + t.theirs.length, nB = B.roster.length - t.theirs.length + t.mine.length;
    if (nA < LIM.min || nA > LIM.max || nB < LIM.min || nB > LIM.max) return { ok: false, msg: `Las plantillas deben quedar entre ${LIM.min} y ${LIM.max} jugadores.` };
    withUser(g, t.from, () => g.executeTrade(t.to, t.mine, t.theirs)); g.repairLineup(B); g.ensureLineup(A);
    return { ok: true, msg: 'Traspaso completado' };
  },
  // cartas especiales: se ganan jugando, se pueden vender por separado del jugador (ver game.js)
  equipCard: (g, i, a) => g.equipCard(i, str(a[0], 20), a[1] ? str(a[1], 20) : null),
  listCard: (g, i, a) => g.listCard(i, str(a[0], 20), num(a[1], 1, 1e9)),
  unlistCard: (g, i, a) => g.unlistCard(i, str(a[0], 20)),
  buyCard: (g, i, a) => g.buyCard(i, str(a[0], 20)),
};

export function command(g, club, body, ctx) {
  const i = +club, s = g.s;
  if (!isHuman(g, i)) throw new Error('No dirigís este equipo');
  if (!body || typeof body.op !== 'string') throw new Error('Orden inválida');
  if (body.op === 'club') {
    if (ctx.locked) throw new Error('El partido está por empezar o en juego: la rotación quedó cerrada. Usá los controles de la transmisión.');
    applyPatch(g, i, body.patch); return { ok: true, mutated: true };
  }
  if (body.op === 'draftSelect') {
    const off = s.off; if (!off || off.stage !== 'draft') throw new Error('No hay draft en curso');
    const pick = off.picks[off.pos]; if (!pick || pick.teamId !== i) throw new Error('No es tu turno');
    const pid = str((body.args || [])[0], 20); if (!s.prospects.includes(pid)) throw new Error('Ese jugador ya no está disponible');
    withUser(g, i, () => g.draftSelect(pid)); off.pickAt = ctx.now; return { ok: true, mutated: true };
  }
  const fn = OPS[body.op]; if (!fn) throw new Error('Orden desconocida');
  const r = fn(g, i, Array.isArray(body.args) ? body.args : []);
  return { ok: !r || r.ok !== false, result: r === undefined ? null : r, mutated: true };
}

// Draft online: los picks de la IA salen solos; el DT humano tiene PICK_MS por pick (después elige la IA por él).
export function draftTick(g, now) {
  const s = g.s, off = s.off; let changed = false;
  if (!off || off.stage !== 'draft') return { changed, done: true };
  if (!off.pickAt) { off.pickAt = now; changed = true; }
  for (let n = 0; n < 200 && off.stage === 'draft'; n++) {
    const pick = off.picks[off.pos]; if (!pick) break;
    const human = isHuman(g, pick.teamId);
    if (human && now - off.pickAt < PICK_MS) break;
    withUser(g, isHuman(g, pick.teamId) ? pick.teamId : s.userId, () => g.draftPickAI()); off.pickAt = now; changed = true;
  }
  return { changed, done: off.stage !== 'draft', pickAt: off.pickAt, pickMs: PICK_MS };
}
