import { KEY_ATTRS, refreshOvr } from './constants.js';

// Cartas de jugador: 2 bases cosméticas (libres, ilimitadas) + 10 especiales (mismo catálogo/lógica que fútbol,
// traducido a NFL). Las especiales no se compran: salen como drop de partidos brillantes (ver rollCardDrop), son
// instancias con dueño propio (la franquicia) y usos limitados; cada `logic` es un efecto de juego real.
export const EDITIONS = [
  { id: 'lote', name: 'Lote Baldío', stars: 3 }, { id: 'bronce', name: 'Bronce', stars: 3 },
  { id: 'plata', name: 'Plata', stars: 4, special: true, uses: 20, logic: 'boost', boost: 2 },
  { id: 'oro', name: 'Oro de Franquicia', stars: 4, special: true, uses: 20, logic: 'boost', boost: 3 },
  { id: 'idolo', name: 'MVP de la Ciudad', stars: 4, special: true, uses: 20, logic: 'immune' },
  { id: 'debut', name: 'Primer Touchdown', stars: 4, special: true, uses: 20, logic: 'xp' },
  { id: 'rivalidad', name: 'Noche de Rivalidad', stars: 5, special: true, uses: 5, logic: 'derby', boost: 6 },
  { id: 'apertura', name: 'Kickoff de Temporada', stars: 5, special: true, uses: 5, logic: 'opener', boost: 6 },
  { id: 'capitan', name: 'Capitán Eterno', stars: 5, special: true, uses: 5, logic: 'consistency' },
  { id: 'anillo', name: 'El Anillo de Campeón', stars: 5, special: true, uses: 5, logic: 'cup', boost: 6 },
  { id: 'archivo', name: 'Leyenda del Archivo', stars: 4, special: true, uses: 20, logic: 'veteran' },
  { id: 'leyenda', name: 'Última Leyenda', stars: 5, special: true, uses: 5, logic: 'legend', boost: 5 },
];

export function cardBoostBits(p) {
  const none = { flat: 0, noiseMul: 1, xpMul: 1, immune: false };
  if (!p.equippedCardLogic) return none;
  const ctx = p._cardCtx || {};
  switch (p.equippedCardLogic) {
    case 'boost': return { ...none, flat: p.equippedCardBoost || 0 };
    case 'legend': return { flat: p.equippedCardBoost || 0, noiseMul: 0.7, xpMul: 1.5, immune: true };
    case 'derby': return { ...none, flat: ctx.derby ? (p.equippedCardBoost || 0) : 0 };
    case 'opener': return { ...none, flat: ctx.opener ? (p.equippedCardBoost || 0) : 0 };
    case 'cup': return { ...none, flat: ctx.cup ? (p.equippedCardBoost || 0) : 0 };
    case 'consistency': return { ...none, noiseMul: 0.3 };
    case 'immune': return { ...none, immune: true };
    case 'xp': return { ...none, xpMul: 2 };
    case 'veteran': return { ...none, flat: Math.min(6, Math.floor((p.careerGames || 0) / 40)) };
    default: return none;
  }
}

// XP por partido según el rating (ver recorder.js): igual gradación de edad/potencial que el entrenamiento semanal,
// para que subir de nivel jugando no sea rápido ni "OP".
export function gainMatchXP(league, p, rating) {
  const rng = league.rng, xpMul = cardBoostBits(p).xpMul;
  const gain = Math.max(0, Math.round((rating - 5.5) * 3)) * xpMul;
  if (!gain) return;
  p.xp = (p.xp || 0) + gain;
  while (p.xp >= 60) {
    p.xp -= 60;
    const ageF = p.age <= 23 ? 1.4 : p.age <= 27 ? 1 : p.age <= 30 ? 0.5 : 0.15;
    const room = p.potential - p.ovr;
    if (rng.next() < (room > 0 ? 0.5 : 0.12) * ageF) {
      const pool = KEY_ATTRS[p.pos] || Object.keys(p.ratings);
      const k = rng.pick(pool);
      if (p.ratings[k] < 96) { p.ratings[k]++; refreshOvr(p); }
    }
  }
}

// Contexto del partido (derby por cercanía en la tabla, apertura de temporada, playoffs/copa) para las cartas
// que sólo rinden en esas ocasiones.
export function primeCardContext(league, fx) {
  const d = league.data, rank = {};
  league.standings().forEach(r => (rank[r.id] = r.rank));
  const derby = fx.type === 'regular' && rank[fx.home] != null && rank[fx.away] != null && Math.abs(rank[fx.home] - rank[fx.away]) <= 2;
  const ctx = { derby, opener: d.week === 0 && fx.type === 'regular', cup: fx.type !== 'regular' };
  for (const tid of [fx.home, fx.away]) { const t = d.teams[tid]; if (!t) continue; for (const pid of t.roster) { const p = d.players[pid]; if (p) p._cardCtx = ctx; } }
}

export function rollCardDrop(league, p, rating) {
  const d = league.data;
  if (!p.teamId || rating < 8.7) return null;
  if (league.rng.next() >= (rating - 8.7) * 0.35) return null;
  const pool = EDITIONS.filter(e => e.special), totalW = pool.reduce((a, e) => a + (e.stars >= 5 ? 1 : 4), 0);
  let r = league.rng.next() * totalW, ed = pool[0];
  for (const e of pool) { const w = e.stars >= 5 ? 1 : 4; if (r < w) { ed = e; break; } r -= w; }
  const id = 'card_' + (++d.cardSeq);
  const card = { id, editionId: ed.id, playerId: p.id, ownerTeamId: p.teamId, usesLeft: ed.uses, retired: false };
  d.specialCards[id] = card;
  if (p.teamId === d.userTeam) league.news(`¡${p.name} se ganó la carta especial «${ed.name}»!`, 'card', p.teamId);
  return card;
}
export const clubCards = (league, teamId) => Object.values(league.data.specialCards).filter(c => c.ownerTeamId === teamId && !c.retired);
export const cardsOf = (league, pid) => Object.values(league.data.specialCards).filter(c => c.playerId === pid && !c.retired);
export function equipCard(league, teamId, pid, cardId) {
  const p = league.data.players[pid]; if (!p || p.teamId !== teamId) return { ok: false, reason: 'No es jugador de tu equipo.' };
  if (!cardId) { unequipCard(p); return { ok: true }; }
  const card = league.data.specialCards[cardId];
  if (!card || card.retired) return { ok: false, reason: 'Carta inexistente.' };
  if (card.ownerTeamId !== teamId) return { ok: false, reason: 'Esa carta no es de tu equipo.' };
  if (card.playerId !== pid) return { ok: false, reason: 'Esa carta es de otro jugador: necesitás tenerlo también en tu plantilla.' };
  const ed = EDITIONS.find(e => e.id === card.editionId);
  p.equippedCardId = cardId; p.equippedCardLogic = ed.logic; p.equippedCardBoost = ed.boost || 0;
  return { ok: true };
}
export function unequipCard(p) { p.equippedCardId = null; p.equippedCardLogic = null; p.equippedCardBoost = 0; }
export function consumeCardUse(league, p) {
  if (!p.equippedCardId) return;
  const card = league.data.specialCards[p.equippedCardId]; if (!card) { p.equippedCardId = null; return; }
  if (card.usesLeft == null) return;
  card.usesLeft--;
  if (card.usesLeft <= 0) { card.retired = true; if (p.teamId === league.data.userTeam) league.news(`Se agotaron los usos de la carta de ${p.name}.`, 'card', p.teamId); unequipCard(p); }
}
export function listCard(league, teamId, cardId, price) {
  const card = league.data.specialCards[cardId];
  if (!card || card.retired || card.ownerTeamId !== teamId) return { ok: false, reason: 'No es tu carta.' };
  const p = league.data.players[card.playerId]; if (p && p.equippedCardId === cardId) return { ok: false, reason: 'Desequipala antes de vender.' };
  league.data.cardListings[cardId] = Math.max(1, Math.round(price * 10) / 10);
  return { ok: true };
}
export function unlistCard(league, teamId, cardId) { const card = league.data.specialCards[cardId]; if (!card || card.ownerTeamId !== teamId) return { ok: false, reason: 'No es tu carta.' }; delete league.data.cardListings[cardId]; return { ok: true }; }
export function buyCard(league, teamId, cardId) {
  const card = league.data.specialCards[cardId], price = league.data.cardListings[cardId];
  if (!card || card.retired || price == null) return { ok: false, reason: 'Esa carta no está en venta.' };
  const buyer = league.data.teams[teamId]; if (!buyer) return { ok: false, reason: 'Equipo inexistente.' };
  if (teamId === league.data.userTeam && buyer.finance.cash < price) return { ok: false, reason: 'Saldo insuficiente.' };
  const seller = league.data.teams[card.ownerTeamId];
  buyer.finance.cash = Math.round((buyer.finance.cash - price) * 10) / 10;
  if (seller) seller.finance.cash = Math.round((seller.finance.cash + price) * 10) / 10;
  card.ownerTeamId = teamId; delete league.data.cardListings[cardId];
  const p = league.data.players[card.playerId]; if (p && p.equippedCardId === cardId) unequipCard(p);
  return { ok: true };
}
