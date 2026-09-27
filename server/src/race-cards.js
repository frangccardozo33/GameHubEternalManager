// Cartas especiales de piloto para el campeonato online de carreras (server/src/race.js): mismo catálogo/lógica
// que fútbol/básquet/NFL/MMA, traducido a carreras. Se ganan jugando (drop tras una carrera de rendimiento alto),
// son propiedad del equipo (no del piloto) y tienen usos limitados; se pueden vender por separado del piloto base.
export const EDITIONS = [
  { id: 'karting', name: 'Karting de Barrio', stars: 3 }, { id: 'bronce', name: 'Bronce', stars: 3 },
  { id: 'plata', name: 'Plata', stars: 4, special: true, uses: 20, logic: 'boost', boost: 2 },
  { id: 'oro', name: 'Oro de Boxes', stars: 4, special: true, uses: 20, logic: 'boost', boost: 3 },
  { id: 'idolo', name: 'Ídolo de la Grilla', stars: 4, special: true, uses: 20, logic: 'immune' },
  { id: 'debut', name: 'Primera Vuelta Rápida', stars: 4, special: true, uses: 20, logic: 'xp' },
  { id: 'rivalidad', name: 'Noche de Rivalidad', stars: 5, special: true, uses: 5, logic: 'derby', boost: 6 },
  { id: 'apertura', name: 'Largada de Temporada', stars: 5, special: true, uses: 5, logic: 'opener', boost: 6 },
  { id: 'capitan', name: 'Piloto Inquebrantable', stars: 5, special: true, uses: 5, logic: 'consistency' },
  { id: 'final', name: 'La Vuelta Decisiva', stars: 5, special: true, uses: 5, logic: 'cup', boost: 6 },
  { id: 'archivo', name: 'Leyenda del Archivo', stars: 4, special: true, uses: 20, logic: 'veteran' },
  { id: 'leyenda', name: 'Última Leyenda', stars: 5, special: true, uses: 5, logic: 'legend', boost: 5 },
];

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function fixCards(g) {
  g.specialCards ??= {}; g.cardListings ??= {}; g.cardSeq ??= 0;
  for (const d of g.career.driversPool) {
    d.xp ??= 0; d.careerRaces ??= 0;
    if (d.equippedCardId === undefined) d.equippedCardId = null;
    if (d.equippedCardLogic === undefined) d.equippedCardLogic = null;
    if (d.equippedCardBoost === undefined) d.equippedCardBoost = 0;
  }
}

export function cardBoostBits(d) {
  const none = { flat: 0, noiseMul: 1, xpMul: 1, immune: false };
  if (!d || !d.equippedCardLogic) return none;
  const ctx = d._cardCtx || {};
  switch (d.equippedCardLogic) {
    case 'boost': return { ...none, flat: d.equippedCardBoost || 0 };
    case 'legend': return { flat: d.equippedCardBoost || 0, noiseMul: 0.7, xpMul: 1.5, immune: true };
    case 'derby': return { ...none, flat: ctx.derby ? (d.equippedCardBoost || 0) : 0 };
    case 'opener': return { ...none, flat: ctx.opener ? (d.equippedCardBoost || 0) : 0 };
    case 'cup': return { ...none, flat: ctx.cup ? (d.equippedCardBoost || 0) : 0 };
    case 'consistency': return { ...none, noiseMul: 0.3 };
    case 'immune': return { ...none, immune: true };
    case 'xp': return { ...none, xpMul: 2 };
    case 'veteran': return { ...none, flat: Math.min(6, Math.floor((d.careerRaces || 0) / 20)) };
    default: return none;
  }
}
// Aplica el boost de la carta equipada a un clon de los stats (0-0.99) antes de pasarlo al motor de carrera,
// sin tocar el motor en sí (ver RaceLive en race.js).
export function boostedStats(d) {
  const bits = cardBoostBits(d); if (!bits.flat) return d.stats;
  return d.stats.map((v) => clamp(v + bits.flat / 100, 0, 0.99));
}

// Contexto de la carrera (derby por cercanía en el campeonato, apertura/final de temporada) para las cartas que
// sólo rinden en esas ocasiones.
export function primeCardContext(g) {
  const c = g.career, rank = {};
  [...c.teams].sort((a, b) => b.points - a.points).forEach((t, i) => (rank[t.id] = i + 1));
  const opener = c.roundIndex === 0, cup = c.roundIndex === c.calendar.length - 1;
  for (const t of c.teams) for (const did of t.driverIds) {
    const d = c.driversPool.find((x) => x.id === did); if (!d) continue;
    const rivals = c.teams.filter((o) => o.id !== t.id && rank[o.id] != null && Math.abs(rank[o.id] - rank[t.id]) <= 2);
    d._cardCtx = { derby: rivals.length > 0, opener, cup };
  }
}

// Rating de carrera 1-10 (estilo 365Scores) según la posición final: primero puntúa alto, un DNF puntúa bajo.
export function raceRating(dnf, position, gridSize) {
  if (dnf) return clamp(Math.round((2.5 + Math.random() * 0.8 - 0.4) * 10) / 10, 1, 10);
  const pct = 1 - position / Math.max(1, gridSize - 1);
  return clamp(Math.round((5.5 + pct * 4 + (Math.random() * 0.8 - 0.4)) * 10) / 10, 1, 10);
}

// XP por carrera según el rating: alimenta el mismo pozo de puntos de entrenamiento (tp) que la progresión semanal,
// para que subir de nivel corriendo no sea rápido ni "OP". "Ídolo de la grilla" protege el progreso en una mala carrera.
export function gainMatchXP(d, rating) {
  const bits = cardBoostBits(d), effRating = bits.immune ? Math.max(rating, 5.5) : rating;
  const gain = Math.max(0, Math.round((effRating - 5.5) * 3)) * bits.xpMul;
  if (!gain) return;
  d.xp = (d.xp || 0) + gain;
  while (d.xp >= 60) {
    d.xp -= 60;
    const ageF = d.age <= 23 ? 1.4 : d.age <= 28 ? 1 : d.age <= 33 ? 0.5 : 0.15;
    if (Math.random() < 0.35 * ageF) {
      const k = Math.floor(Math.random() * d.stats.length);
      if (d.stats[k] < 0.99) d.stats[k] = Math.min(0.99, d.stats[k] + 0.01);
      d.rating = Math.round(d.stats.reduce((a, b) => a + b, 0) / d.stats.length * 100);
    }
  }
}

export function rollCardDrop(g, d, rating) {
  if (d.teamId == null || rating < 8.7) return null;
  if (Math.random() >= (rating - 8.7) * 0.35) return null;
  const pool = EDITIONS.filter((e) => e.special), totalW = pool.reduce((a, e) => a + (e.stars >= 5 ? 1 : 4), 0);
  let r = Math.random() * totalW, ed = pool[0];
  for (const e of pool) { const w = e.stars >= 5 ? 1 : 4; if (r < w) { ed = e; break; } r -= w; }
  const id = 'card_' + (++g.cardSeq);
  const card = { id, editionId: ed.id, driverId: d.id, ownerTeamId: d.teamId, usesLeft: ed.uses, retired: false };
  g.specialCards[id] = card;
  return card;
}
export function consumeCardUse(g, d) {
  if (!d.equippedCardId) return;
  const card = g.specialCards[d.equippedCardId]; if (!card) { d.equippedCardId = null; return; }
  if (card.usesLeft == null) return;
  card.usesLeft--;
  if (card.usesLeft <= 0) { card.retired = true; unequipCard(d); }
}
export const clubCards = (g, teamId) => Object.values(g.specialCards).filter((c) => c.ownerTeamId === teamId && !c.retired);
export const cardsOf = (g, did) => Object.values(g.specialCards).filter((c) => c.driverId === did && !c.retired);
export function equipCard(g, teamId, did, cardId) {
  const d = g.career.driversPool.find((x) => x.id === did); if (!d || d.teamId !== teamId) return { ok: false, msg: 'Ese piloto no es de tu equipo.' };
  if (!cardId) { unequipCard(d); return { ok: true }; }
  const card = g.specialCards[cardId];
  if (!card || card.retired) return { ok: false, msg: 'Carta inexistente.' };
  if (card.ownerTeamId !== teamId) return { ok: false, msg: 'Esa carta no es de tu equipo.' };
  if (card.driverId !== did) return { ok: false, msg: 'Esa carta es de otro piloto: necesitás tenerlo también en tu equipo.' };
  const ed = EDITIONS.find((e) => e.id === card.editionId);
  d.equippedCardId = cardId; d.equippedCardLogic = ed.logic; d.equippedCardBoost = ed.boost || 0;
  return { ok: true };
}
export function unequipCard(d) { d.equippedCardId = null; d.equippedCardLogic = null; d.equippedCardBoost = 0; }
export function listCard(g, teamId, cardId, price) {
  const card = g.specialCards[cardId];
  if (!card || card.retired || card.ownerTeamId !== teamId) return { ok: false, msg: 'No es tu carta.' };
  const d = g.career.driversPool.find((x) => x.id === card.driverId); if (d && d.equippedCardId === cardId) return { ok: false, msg: 'Desequipala antes de vender.' };
  g.cardListings[cardId] = Math.max(1, Math.round(price));
  return { ok: true };
}
export function unlistCard(g, teamId, cardId) { const card = g.specialCards[cardId]; if (!card || card.ownerTeamId !== teamId) return { ok: false, msg: 'No es tu carta.' }; delete g.cardListings[cardId]; return { ok: true }; }
export function buyCard(g, teamId, cardId) {
  const card = g.specialCards[cardId], price = g.cardListings[cardId];
  if (!card || card.retired || price == null) return { ok: false, msg: 'Esa carta no está en venta.' };
  const buyer = g.career.teams.find((t) => t.id === teamId); if (!buyer) return { ok: false, msg: 'Equipo inexistente.' };
  if (buyer.credits < price) return { ok: false, msg: 'Presupuesto insuficiente.' };
  const seller = g.career.teams.find((t) => t.id === card.ownerTeamId);
  buyer.credits -= price; if (seller) seller.credits += price;
  card.ownerTeamId = teamId; delete g.cardListings[cardId];
  const d = g.career.driversPool.find((x) => x.id === card.driverId); if (d && d.equippedCardId === cardId) unequipCard(d);
  return { ok: true };
}
