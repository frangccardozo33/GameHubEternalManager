// Gestión del club por el DT humano de una liga online de NFL (Gridiron): gameplan, depth chart, entrenamiento, mercado, traspasos entre DT,
// copa y draft con reloj. Cada humano tiene su propio contexto de ofertas; las finanzas ya son por equipo. El núcleo lee "el usuario" de
// data.userTeam, así que cada orden se ejecuta con ese contexto puesto (withUser).
import { League } from '../../06-nfl-gridiron/src/manager/league.js';
import { signFreeAgent, renewPlayer, releasePlayer, evaluateTrade, executeTrade, generateOffers } from '../../06-nfl-gridiron/src/manager/economy.js';
import { autoDepth, syncDepth } from '../../06-nfl-gridiron/src/manager/lineup.js';
import { makeGameplan } from '../../06-nfl-gridiron/src/sim/gameplan.js';
import { ROSTER_MAX } from '../../06-nfl-gridiron/src/manager/constants.js';
import { cleanGameplan } from './nfl.js';

const PICK_MS = 90e3;   // tiempo de cada pick del draft para un DT humano (después elige la IA)
const num = (v, lo, hi) => { v = +v; if (!Number.isFinite(v)) throw new Error('Número inválido'); return Math.min(hi, Math.max(lo, v)); };
const str = (v, n = 24) => { if (typeof v !== 'string' || v.length > n) throw new Error('Texto inválido'); return v; };
const isHuman = (lg, id) => (lg.data.humans || []).includes(id);

export function withUser(lg, id, fn) {
  const d = lg.data, prev = { userTeam: d.userTeam, offers: d.offers };
  const h = ((d.hum ||= {})[id] ||= { offers: [] });
  d.userTeam = id; d.offers = h.offers;
  try { return fn(); } finally { h.offers = d.offers; d.userTeam = prev.userTeam; d.offers = prev.offers; }
}

export function setHumans(lg, ids) {
  const d = lg.data, hs = ids.filter((id) => d.teams[id]); const before = (d.humans || []).join();
  d.humans = hs; for (const id of hs) { const t = d.teams[id]; t.gameplan ||= makeGameplan(); withUser(lg, id, () => {}); }
  if (hs.length) d.userTeam = hs[0];
  // la copa se arma con el calendario: mientras no se jugó nada, se rehace para que entren todos los DT humanos
  if (before !== hs.join() && d.week === 0 && !Object.keys(d.results).length && d.phase === 'regular') lg.buildCalendar();
}

// Copia del estado para el DT de `club`; el depth chart y el gameplan de OTROS humanos no se ven.
export function exportState(lg, club) {
  const d = JSON.parse(lg.serialize()), hum = d.hum || {}; delete d.hum;
  d.userTeam = club; d.offers = (hum[club] && hum[club].offers) || [];
  d.tradeProps = (d.tradeProps || []).filter((t) => t.from === club || t.to === club);
  const cl = League.load(JSON.stringify(d));
  for (const id of cl.data.humans || []) if (id !== club) { const t = cl.data.teams[id]; autoDepth(cl, t); t.gameplan = makeGameplan(); }
  return cl.serialize();
}

const mine = (lg, id, ids, max = 60) => {
  if (!Array.isArray(ids) || ids.length > max) throw new Error('Selección inválida');
  const ros = new Set(lg.data.teams[id].roster); for (const p of ids) if (!ros.has(p)) throw new Error('Ese jugador no es de tu equipo'); return [...new Set(ids)];
};
const theirs = (lg, id, ids, max = 60) => {
  if (!Array.isArray(ids) || ids.length > max) throw new Error('Selección inválida');
  const ros = new Set(lg.data.teams[id].roster); for (const p of ids) if (!ros.has(p)) throw new Error('Ese jugador no es del otro equipo'); return [...new Set(ids)];
};
const offerOf = (o) => { o = o || {}; return { salary: num(o.salary, 0.1, 80), years: Math.round(num(o.years, 1, 6)), bonus: num(o.bonus == null ? 0 : o.bonus, 0, 200) }; };

function applyPatch(lg, id, p) {
  const t = lg.data.teams[id], ros = new Set(t.roster); p = p || {};
  if (p.gameplan) t.gameplan = cleanGameplan(p.gameplan);
  if (p.depth) {
    const dep = {};
    for (const key of Object.keys(t.depth)) {
      const list = p.depth[key]; if (list === undefined) { dep[key] = t.depth[key]; continue; }
      if (!Array.isArray(list) || list.length > 30) throw new Error('Depth chart inválido');
      const seen = new Set(); for (const pid of list) { if (!ros.has(pid) || seen.has(pid)) throw new Error('Depth chart inválido: jugador repetido o ajeno'); seen.add(pid); }
      dep[key] = [...list];
    }
    t.depth = dep; syncDepth(lg, t);
  }
  if (p.training) {
    const tr = t.training, q = p.training;
    if (q.focus) for (const k of Object.keys(tr.focus)) if (k in q.focus) tr.focus[k] = Math.round(num(q.focus[k], 0, 100));
    if (q.intensity != null) tr.intensity = str(q.intensity, 12);
  }
  if (Array.isArray(p.offerIds)) { const keep = new Set(p.offerIds); withUser(lg, id, () => { lg.data.offers = lg.data.offers.filter((o) => keep.has(o.id)); }); }
}

const OPS = {
  signFreeAgent: (lg, i, a) => signFreeAgent(lg, i, str(a[0], 24), offerOf(a[1])),
  renewPlayer: (lg, i, a) => renewPlayer(lg, i, mine(lg, i, [a[0]], 1)[0], offerOf(a[1])),
  releasePlayer: (lg, i, a) => releasePlayer(lg, i, mine(lg, i, [a[0]], 1)[0]),
  // traspaso con un equipo de la CPU: lo evalúa el juego (igual que en el modo carrera)
  tradeAI: (lg, i, a) => {
    const to = str(a[0], 8); if (!lg.data.teams[to] || isHuman(lg, to)) throw new Error('Ese equipo lo dirige otro DT: mandá una propuesta');
    const args = { teamA: i, teamB: to, giveA: mine(lg, i, a[1] || []), giveB: theirs(lg, to, a[2] || []) };
    const ev = evaluateTrade(lg, args); if (!ev.accept) return { ok: false, message: ev.reason };
    executeTrade(lg, args);
    withUser(lg, i, () => { lg.data.offers = lg.data.offers.filter((o) => !(o.from === to && o.want.every((x) => args.giveA.includes(x)))); });
    return { ok: true, message: 'Traspaso completado.' };
  },
  // traspaso con otro DT humano: queda como propuesta hasta que responda
  tradePropose: (lg, i, a) => {
    const d = lg.data, to = str(a[0], 8); if (!isHuman(lg, to) || to === i) throw new Error('Ese equipo no lo dirige otro DT');
    const giveA = mine(lg, i, a[1] || []), giveB = theirs(lg, to, a[2] || []); if (!giveA.length && !giveB.length) throw new Error('Elegí jugadores');
    d.tradeProps = (d.tradeProps || []).filter((t) => t.exp >= d.week); const id = lg.uid('o');
    d.tradeProps.push({ id, from: i, to, giveA, giveB, exp: d.week + 3 }); return { ok: true, id, message: 'Propuesta enviada.' };
  },
  tradeAnswer: (lg, i, a) => {
    const d = lg.data, id = str(a[0], 16), t = (d.tradeProps || []).find((x) => x.id === id && x.to === i);
    if (!t) throw new Error('La propuesta ya no existe');
    d.tradeProps = d.tradeProps.filter((x) => x !== t); if (!a[1]) return { ok: true, message: 'Propuesta rechazada.' };
    const A = d.teams[t.from], B = d.teams[t.to];
    if (!t.giveA.every((p) => A.roster.includes(p)) || !t.giveB.every((p) => B.roster.includes(p))) return { ok: false, message: 'Alguno de los jugadores ya no está en su equipo.' };
    if (A.roster.length - t.giveA.length + t.giveB.length > ROSTER_MAX || B.roster.length - t.giveB.length + t.giveA.length > ROSTER_MAX) return { ok: false, message: 'Alguna plantilla superaría el máximo de jugadores.' };
    executeTrade(lg, { teamA: t.from, teamB: t.to, giveA: t.giveA, giveB: t.giveB }); return { ok: true, message: 'Traspaso completado.' };
  },
};

export function command(lg, club, body, ctx) {
  const d = lg.data;
  if (!isHuman(lg, club)) throw new Error('No dirigís este equipo');
  if (!body || typeof body.op !== 'string') throw new Error('Orden inválida');
  if (body.op === 'club') {
    if (ctx.locked && (body.patch && (body.patch.gameplan || body.patch.depth))) throw new Error('El partido está por empezar o en juego: el plan y el depth chart quedaron cerrados. Usá los controles de la transmisión.');
    applyPatch(lg, club, body.patch); return { ok: true, mutated: true };
  }
  if (body.op === 'draftPick') {
    const dr = d.draft, cur = dr && !dr.done ? lg.draftCurrent() : null; if (!cur) throw new Error('No hay draft en curso');
    if (cur.teamId !== club) throw new Error('No es tu turno');
    const pid = str((body.args || [])[0], 24); if (!dr.pool.includes(pid)) throw new Error('Ese jugador ya no está disponible');
    lg._draftSelect(pid); dr.pickAt = ctx.now; return { ok: true, mutated: true };
  }
  const fn = OPS[body.op]; if (!fn) throw new Error('Orden desconocida');
  const r = withUser(lg, club, () => fn(lg, club, Array.isArray(body.args) ? body.args : []));
  return { ok: !r || r.ok !== false, result: r === undefined ? null : r, mutated: true };
}

// Draft online: los picks de la CPU salen solos; el DT humano tiene PICK_MS por pick (después elige la IA por él).
export function draftTick(lg, now) {
  const d = lg.data, dr = d.draft; let changed = false;
  if (!dr || dr.done) return { changed, done: true };
  if (!dr.pickAt) { dr.pickAt = now; changed = true; }
  for (let n = 0; n < 500 && !dr.done; n++) {
    const cur = lg.draftCurrent(); if (!cur) break;
    if (isHuman(lg, cur.teamId)) {
      if (now - dr.pickAt < PICK_MS) break;
      const P = d.players, b = dr.pool.map((id) => P[id]).sort((x, y) => (y.ovr + y.potential) - (x.ovr + x.potential))[0]; lg._draftSelect(b.id);
    } else lg._draftCpuPick();
    dr.pickAt = now; changed = true;
  }
  return { changed, done: !!dr.done, pickAt: dr.pickAt, pickMs: PICK_MS };
}

// Ofertas de la CPU para los demás DT humanos (el núcleo genera las del usuario por defecto).
export function extraOffers(lg) { for (const id of lg.data.humans || []) if (id !== lg.data.userTeam) withUser(lg, id, () => generateOffers(lg)); }
