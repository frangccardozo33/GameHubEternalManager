// Gestión de la cuadra por el DT humano de una liga online de MMA (LLO): táctica de cada peleador, campamento, mercado de peleadores y
// traspasos entre DT. El cliente es una página liviana (04-mma/mma-manager.html): recibe una vista de la cuadra (exportState) y manda órdenes.
import { equipCard, listCard, unlistCard, buyCard, EDITIONS, cardsOf } from './mma-cards.js';

export const DIVS = ['fly', 'bantam', 'feather', 'light', 'welter', 'middle', 'lightheavy', 'heavy'];
// Campamentos (mismos valores que el modo carrera): atributos que mejoran, costo y carga de cansancio.
export const PROGRAMS = {
  boxing: { name: 'Boxeo', attrs: ['accuracy', 'speed'], cost: 1600, load: 12 }, wrestling: { name: 'Wrestling', attrs: ['wrestling', 'defense'], cost: 1900, load: 15 },
  bjj: { name: 'Jiu-jitsu', attrs: ['grappling', 'intelligence'], cost: 1800, load: 11 }, cardio: { name: 'Cardio', attrs: ['cardio', 'initiative'], cost: 1200, load: 9 },
  strength: { name: 'Fuerza', attrs: ['power', 'chin'], cost: 1500, load: 14 }, recovery: { name: 'Recuperación', attrs: [], cost: 700, load: -32 },
  strategy: { name: 'Estrategia', attrs: ['intelligence', 'defense'], cost: 1000, load: 5 },
};
const MAX_ROSTER = 6, MIN_ROSTER = 2;
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const num = (v, lo, hi) => { v = +v; if (!Number.isFinite(v)) throw new Error('Número inválido'); return Math.min(hi, Math.max(lo, v)); };
const oneOf = (v, list) => { if (!list.includes(v)) throw new Error('Valor inválido'); return v; };
const stable = (g, id) => g.stables.find((s) => s.id === id);
const fighter = (g, id) => g.fighters.find((f) => f.id === id);
const isHuman = (g, id) => (g.humans || []).includes(id);
const mineF = (g, st, fid) => { const f = fighter(g, fid); if (!f || f.stable !== st.id) throw new Error('Ese peleador no es de tu cuadra'); return f; };
const fee = (f) => Math.round(4000 + f.rating * 3);

export function setHumans(g, ids, names = {}) {
  g.humans = ids.filter((id) => stable(g, id)); g.tradeProps ??= [];
  for (const s of g.stables) s.humanName = g.humans.includes(s.id) ? (names[s.id] || null) : null;
}

const view = (f) => ({ id: f.id, name: `${f.firstName} ${f.lastName}`, nickname: f.nickname, country: f.country, age: f.age, division: f.division, style: f.style, rating: f.rating, potential: f.potential,
  attributes: f.attributes, record: f.record, condition: Math.round(f.condition == null ? 100 : f.condition), morale: Math.round(f.morale == null ? 80 : f.morale), photo: f.photo || null, tactics: f.tactics, program: f.program || null, fee: fee(f),
  xp: f.xp || 0, equippedCardId: f.equippedCardId || null, equippedCardLogic: f.equippedCardLogic || null });
const cardView = (g, f) => cardsOf(g, f.id).map((c) => ({ id: c.id, editionId: c.editionId, name: EDITIONS.find((e) => e.id === c.editionId)?.name, uses: EDITIONS.find((e) => e.id === c.editionId)?.uses, usesLeft: c.usesLeft, ownerStableId: c.ownerStableId }));

export function exportState(g, club) {
  const st = stable(g, club), ev = g.evs.find((e) => e.n === g.event);
  const mine = ev ? ev.bouts.filter((b) => fighter(g, b.a).stable === club || fighter(g, b.b).stable === club) : [];
  return JSON.stringify({
    module: 'mma', me: club, stable: { id: st.id, name: st.name, color: st.color, money: Math.round(st.money), w: st.w, l: st.l }, programs: PROGRAMS, maxRoster: MAX_ROSTER,
    fighters: st.roster.map((id) => ({ ...view(fighter(g, id)), cards: cardView(g, fighter(g, id)) })),
    cardListings: Object.entries(g.cardListings || {}).map(([id, price]) => { const c = g.specialCards[id], f = c && fighter(g, c.fighterId), sOwn = c && stable(g, c.ownerStableId); return c && f ? { id, price, fighterName: `${f.firstName} ${f.lastName}`, editionName: EDITIONS.find((e) => e.id === c.editionId)?.name, ownerStableId: c.ownerStableId, ownerName: sOwn && sOwn.name } : null; }).filter(Boolean),
    market: g.market.slice().sort((a, b) => b.rating - a.rating).map(view),
    stables: g.stables.map((s) => ({ id: s.id, name: s.name, color: s.color, w: s.w, l: s.l, human: isHuman(g, s.id), humanName: s.humanName || null, roster: s.roster.map((id) => { const f = fighter(g, id); return { id, name: `${f.firstName} ${f.lastName}`, division: f.division, rating: f.rating }; }) })),
    event: ev ? `Cartelera ${ev.n + 1}` : null, myMatch: mine.length ? mine[0].id : null,
    myBouts: mine.map((b) => ({ id: b.id, a: `${fighter(g, b.a).firstName} ${fighter(g, b.a).lastName}`, b: `${fighter(g, b.b).firstName} ${fighter(g, b.b).lastName}`, played: b.played })),
    tradeProps: (g.tradeProps || []).filter((t) => t.from === club || t.to === club),
  });
}

const TAC_NUM = ['pace', 'distance', 'takedowns', 'aggression', 'conservation'];
const OPS = {
  tactics: (g, st, a, ctx) => {
    if (ctx.locked) throw new Error('El evento está por empezar o en juego: la táctica quedó cerrada. Usá las órdenes de la transmisión.');
    const f = mineF(g, st, a[0]), t = a[1] || {};
    for (const k of TAC_NUM) if (t[k] != null) f.tactics[k] = clamp(num(t[k], 0, 100));
    if (t.focus != null) f.tactics.focus = oneOf(t.focus, ['balanced', 'boxing', 'wrestling', 'grappling']);
    if (t.target != null) f.tactics.target = oneOf(t.target, ['mixed', 'head', 'body', 'leg']);
    return { ok: true };
  },
  program: (g, st, a) => { const f = mineF(g, st, a[0]); f.program = a[1] == null || a[1] === '' ? null : oneOf(a[1], Object.keys(PROGRAMS)); return { ok: true }; },
  signFighter: (g, st, a) => {
    if (st.roster.length >= MAX_ROSTER) return { ok: false, msg: `Tu cuadra está completa (máximo ${MAX_ROSTER}). Liberá a alguien primero.` };
    const i = g.market.findIndex((f) => f.id === a[0]); if (i < 0) return { ok: false, msg: 'Ese peleador ya no está disponible.' };
    const f = g.market[i], cost = fee(f); if (st.money < cost) return { ok: false, msg: `No alcanza el dinero: la firma cuesta $${cost.toLocaleString('es')}.` };
    st.money -= cost; g.market.splice(i, 1); f.stable = st.id; f.program = null; f.lw = f.ll = 0; g.fighters.push(f); st.roster.push(f.id);
    return { ok: true, msg: `${f.firstName} ${f.lastName} firma con ${st.name}.` };
  },
  releaseFighter: (g, st, a) => {
    if (st.roster.length <= MIN_ROSTER) return { ok: false, msg: `Necesitás al menos ${MIN_ROSTER} peleadores.` };
    const f = mineF(g, st, a[0]); st.roster = st.roster.filter((id) => id !== f.id); g.fighters = g.fighters.filter((x) => x !== f); f.stable = null; f.program = null; g.market.push(f);
    return { ok: true, msg: `${f.firstName} ${f.lastName} deja la cuadra y vuelve al mercado.` };
  },
  // traspaso de peleadores con otro DT humano (uno por uno): propuesta hasta que responda
  tradePropose: (g, st, a) => {
    const to = stable(g, a[0]); if (!to || to.id === st.id || !isHuman(g, to.id)) throw new Error('Esa cuadra no la dirige otro DT');
    const give = mineF(g, st, a[1]), get = fighter(g, a[2]); if (!get || get.stable !== to.id) throw new Error('Ese peleador no es de la otra cuadra');
    g.tradeProps = (g.tradeProps || []).filter((x) => x.exp >= g.event); const id = (g.tradeSeq = (g.tradeSeq || 0) + 1);
    g.tradeProps.push({ id, from: st.id, to: to.id, give: give.id, get: get.id, giveName: `${give.firstName} ${give.lastName}`, getName: `${get.firstName} ${get.lastName}`, exp: g.event + 2 }); return { ok: true, id, msg: 'Propuesta enviada.' };
  },
  tradeAnswer: (g, st, a, ctx) => {
    const p = (g.tradeProps || []).find((x) => x.id === +a[0] && x.to === st.id); if (!p) throw new Error('La propuesta ya no existe');
    g.tradeProps = g.tradeProps.filter((x) => x !== p); if (!a[1]) return { ok: true, msg: 'Propuesta rechazada.' };
    if (ctx.locked) throw new Error('El evento está por empezar o en juego: no se pueden mover peleadores ahora.');
    const A = stable(g, p.from), B = st, fa = fighter(g, p.give), fb = fighter(g, p.get);
    if (!fa || !fb || fa.stable !== A.id || fb.stable !== B.id) return { ok: false, msg: 'Alguno de los peleadores ya no está en su cuadra.' };
    A.roster = A.roster.filter((x) => x !== fa.id).concat(fb.id); B.roster = B.roster.filter((x) => x !== fb.id).concat(fa.id); fa.stable = B.id; fb.stable = A.id; fa.program = fb.program = null;
    return { ok: true, msg: 'Traspaso completado.' };
  },
  // cartas especiales: se ganan peleando, se pueden vender por separado del peleador (ver mma-cards.js)
  equipCard: (g, st, a) => equipCard(g, st.id, a[0], a[1] || null),
  listCard: (g, st, a) => listCard(g, st.id, a[0], num(a[1], 1, 1e9)),
  unlistCard: (g, st, a) => unlistCard(g, st.id, a[0]),
  buyCard: (g, st, a) => buyCard(g, st.id, a[0]),
};

export function command(g, club, body, ctx) {
  const st = stable(g, club);
  if (!st || !isHuman(g, club)) throw new Error('No dirigís esta cuadra');
  if (!body || typeof body.op !== 'string') throw new Error('Orden inválida');
  const fn = OPS[body.op]; if (!fn) throw new Error('Orden desconocida');
  const r = fn(g, st, Array.isArray(body.args) ? body.args : [], ctx);
  return { ok: !r || r.ok !== false, result: r === undefined ? null : r, mutated: true };
}

// Campamento y descanso de los peleadores humanos al cerrar la cartelera (mismas fórmulas que el modo carrera).
export function afterRound(g) {
  for (const f of g.fighters) {
    f.condition = clamp((f.condition == null ? 100 : f.condition) + 12);   // descanso entre carteleras
    const st = f.stable && stable(g, f.stable); if (!st || !isHuman(g, st.id) || !f.program) continue;
    const p = PROGRAMS[f.program]; if (!p || st.money < p.cost) continue;
    if (f.program !== 'recovery' && f.condition < 40) continue;   // necesita recuperación
    st.money -= p.cost;
    for (const k of p.attrs) f.attributes[k] = clamp(f.attributes[k] + Math.max(0.1, (f.potential - f.attributes[k]) / 22) * (f.age > 33 ? 0.5 : 1), 1, f.potential);
    f.condition = clamp(f.condition - p.load + 5); f.morale = clamp((f.morale == null ? 80 : f.morale) + 2);
  }
}
