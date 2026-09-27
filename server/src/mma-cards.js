// Cartas especiales de peleador para la liga online de MMA (server/src/mma.js): mismo catálogo/lógica que
// fútbol/básquet/NFL, traducido a MMA. Se ganan jugando (drop tras un combate de rendimiento alto), son propiedad
// de la cuadra (no del peleador) y tienen usos limitados; se pueden vender por separado del peleador base.
export const EDITIONS = [
  { id: 'gimnasio', name: 'Gimnasio de Barrio', stars: 3 }, { id: 'bronce', name: 'Bronce', stars: 3 },
  { id: 'plata', name: 'Plata', stars: 4, special: true, uses: 20, logic: 'boost', boost: 2 },
  { id: 'oro', name: 'Oro del Octágono', stars: 4, special: true, uses: 20, logic: 'boost', boost: 3 },
  { id: 'idolo', name: 'Ídolo de la Cartelera', stars: 4, special: true, uses: 20, logic: 'immune' },
  { id: 'debut', name: 'Debut Inolvidable', stars: 4, special: true, uses: 20, logic: 'xp' },
  { id: 'rivalidad', name: 'Noche de Rivalidad', stars: 5, special: true, uses: 5, logic: 'derby', boost: 6 },
  { id: 'apertura', name: 'Cartelera de Apertura', stars: 5, special: true, uses: 5, logic: 'opener', boost: 6 },
  { id: 'capitan', name: 'Esquina Inquebrantable', stars: 5, special: true, uses: 5, logic: 'consistency' },
  { id: 'cinturon', name: 'El Cinturón', stars: 5, special: true, uses: 5, logic: 'cup', boost: 6 },
  { id: 'archivo', name: 'Leyenda del Archivo', stars: 4, special: true, uses: 20, logic: 'veteran' },
  { id: 'leyenda', name: 'Última Leyenda', stars: 5, special: true, uses: 5, logic: 'legend', boost: 5 },
];

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function fixCards(g) {
  g.specialCards ??= {}; g.cardListings ??= {}; g.cardSeq ??= 0;
  for (const f of [...g.fighters, ...(g.market || [])]) {
    f.xp ??= 0; f.careerFights ??= 0;
    if (f.equippedCardId === undefined) f.equippedCardId = null;
    if (f.equippedCardLogic === undefined) f.equippedCardLogic = null;
    if (f.equippedCardBoost === undefined) f.equippedCardBoost = 0;
  }
}

export function cardBoostBits(f) {
  const none = { flat: 0, noiseMul: 1, xpMul: 1, immune: false };
  if (!f || !f.equippedCardLogic) return none;
  const ctx = f._cardCtx || {};
  switch (f.equippedCardLogic) {
    case 'boost': return { ...none, flat: f.equippedCardBoost || 0 };
    case 'legend': return { flat: f.equippedCardBoost || 0, noiseMul: 0.7, xpMul: 1.5, immune: true };
    case 'derby': return { ...none, flat: ctx.derby ? (f.equippedCardBoost || 0) : 0 };
    case 'opener': return { ...none, flat: ctx.opener ? (f.equippedCardBoost || 0) : 0 };
    case 'cup': return { ...none, flat: ctx.cup ? (f.equippedCardBoost || 0) : 0 };
    case 'consistency': return { ...none, noiseMul: 0.3 };
    case 'immune': return { ...none, immune: true };
    case 'xp': return { ...none, xpMul: 2 };
    case 'veteran': return { ...none, flat: Math.min(6, Math.floor((f.careerFights || 0) / 15)) };
    default: return none;
  }
}
// Aplica el boost de la carta equipada a un clon de atributos (0-99) antes de pasarlo al simulador de combate,
// sin tocar el motor de simulación en sí (ver MmaLive en mma.js).
export function boostedAttributes(f) {
  const bits = cardBoostBits(f); if (!bits.flat) return f.attributes;
  const out = {}; for (const k of Object.keys(f.attributes)) out[k] = clamp(f.attributes[k] + bits.flat, 1, 99);
  return out;
}

// Contexto del combate (derby por cercanía en el ranking de la división, apertura de la liga, título/cima) para
// las cartas que sólo rinden en esas ocasiones.
export function primeCardContext(g, event) {
  const DIVS = [...new Set(g.fighters.map((f) => f.division))], rankOf = {};
  for (const d of DIVS) {
    g.fighters.filter((f) => f.division === d && !f.retired).sort((a, b) => b.rating - a.rating).forEach((f, i) => { rankOf[f.id] = i + 1; });
  }
  for (const b of event.bouts) {
    const A = g.fighters.find((f) => f.id === b.a), B = g.fighters.find((f) => f.id === b.b); if (!A || !B) continue;
    const ra = rankOf[A.id], rb = rankOf[B.id];
    const ctx = { derby: ra != null && rb != null && Math.abs(ra - rb) <= 2, opener: g.event === 0, cup: ra === 1 || rb === 1 };
    A._cardCtx = ctx; B._cardCtx = ctx;
  }
}

// Rating de combate 1-10 (estilo 365Scores) a partir del resultado: base por victoria/derrota/empate + bonus por
// finalización + ruido (reducido por la carta "consistencia"). Alimenta la XP y el drop de cartas.
export function fightRating(f, won, draw, method) {
  const finish = !!method && /KO|TKO|Sumis/i.test(method);
  let base = draw ? 6.3 : won ? (finish ? 8.2 : 7.0) : (finish ? 4.0 : 4.8);
  const noiseMul = cardBoostBits(f).noiseMul;
  return clamp(Math.round((base + (Math.random() * 0.8 - 0.4) * noiseMul) * 10) / 10, 1, 10);
}

// XP por combate según el rating: misma gradación de edad/potencial que el campamento (afterRound), para que
// subir de nivel peleando no sea rápido ni "OP".
export function gainMatchXP(f) {
  const rating = f._lastRating; if (rating == null) return;
  const xpMul = cardBoostBits(f).xpMul, gain = Math.max(0, Math.round((rating - 5.5) * 3)) * xpMul;
  if (!gain) return;
  f.xp = (f.xp || 0) + gain;
  while (f.xp >= 60) {
    f.xp -= 60;
    const ageF = f.age <= 25 ? 1.4 : f.age <= 29 ? 1 : f.age <= 33 ? 0.5 : 0.15;
    const room = f.potential - Math.round(Object.values(f.attributes).reduce((a, b) => a + b, 0) / Object.keys(f.attributes).length);
    if (Math.random() < (room > 0 ? 0.5 : 0.12) * ageF) {
      const keys = Object.keys(f.attributes), k = keys[Math.floor(Math.random() * keys.length)];
      if (f.attributes[k] < 96) f.attributes[k]++;
    }
  }
}

export function rollCardDrop(g, f) {
  const rating = f._lastRating; if (f.retired || !f.stable || rating == null || rating < 8.7) return null;
  if (Math.random() >= (rating - 8.7) * 0.35) return null;
  const pool = EDITIONS.filter((e) => e.special), totalW = pool.reduce((a, e) => a + (e.stars >= 5 ? 1 : 4), 0);
  let r = Math.random() * totalW, ed = pool[0];
  for (const e of pool) { const w = e.stars >= 5 ? 1 : 4; if (r < w) { ed = e; break; } r -= w; }
  const id = 'card_' + (++g.cardSeq);
  const card = { id, editionId: ed.id, fighterId: f.id, ownerStableId: f.stable, usesLeft: ed.uses, retired: false };
  g.specialCards[id] = card;
  return card;
}
export function consumeCardUse(g, f) {
  if (!f.equippedCardId) return;
  const card = g.specialCards[f.equippedCardId]; if (!card) { f.equippedCardId = null; return; }
  if (card.usesLeft == null) return;
  card.usesLeft--;
  if (card.usesLeft <= 0) { card.retired = true; unequipCard(f); }
}
export const clubCards = (g, stableId) => Object.values(g.specialCards).filter((c) => c.ownerStableId === stableId && !c.retired);
export const cardsOf = (g, fid) => Object.values(g.specialCards).filter((c) => c.fighterId === fid && !c.retired);
export function equipCard(g, stableId, fid, cardId) {
  const f = g.fighters.find((x) => x.id === fid); if (!f || f.stable !== stableId) return { ok: false, msg: 'Ese peleador no es de tu cuadra.' };
  if (!cardId) { unequipCard(f); return { ok: true }; }
  const card = g.specialCards[cardId];
  if (!card || card.retired) return { ok: false, msg: 'Carta inexistente.' };
  if (card.ownerStableId !== stableId) return { ok: false, msg: 'Esa carta no es de tu cuadra.' };
  if (card.fighterId !== fid) return { ok: false, msg: 'Esa carta es de otro peleador: necesitás tenerlo también en tu cuadra.' };
  const ed = EDITIONS.find((e) => e.id === card.editionId);
  f.equippedCardId = cardId; f.equippedCardLogic = ed.logic; f.equippedCardBoost = ed.boost || 0;
  return { ok: true };
}
export function unequipCard(f) { f.equippedCardId = null; f.equippedCardLogic = null; f.equippedCardBoost = 0; }
export function listCard(g, stableId, cardId, price) {
  const card = g.specialCards[cardId];
  if (!card || card.retired || card.ownerStableId !== stableId) return { ok: false, msg: 'No es tu carta.' };
  const f = g.fighters.find((x) => x.id === card.fighterId); if (f && f.equippedCardId === cardId) return { ok: false, msg: 'Desequipala antes de vender.' };
  g.cardListings[cardId] = Math.max(1, Math.round(price));
  return { ok: true };
}
export function unlistCard(g, stableId, cardId) { const card = g.specialCards[cardId]; if (!card || card.ownerStableId !== stableId) return { ok: false, msg: 'No es tu carta.' }; delete g.cardListings[cardId]; return { ok: true }; }
export function buyCard(g, stableId, cardId) {
  const card = g.specialCards[cardId], price = g.cardListings[cardId];
  if (!card || card.retired || price == null) return { ok: false, msg: 'Esa carta no está en venta.' };
  const buyer = g.stables.find((s) => s.id === stableId); if (!buyer) return { ok: false, msg: 'Cuadra inexistente.' };
  if (buyer.money < price) return { ok: false, msg: 'Saldo insuficiente.' };
  const seller = g.stables.find((s) => s.id === card.ownerStableId);
  buyer.money -= price; if (seller) seller.money += price;
  card.ownerStableId = stableId; delete g.cardListings[cardId];
  const f = g.fighters.find((x) => x.id === card.fighterId); if (f && f.equippedCardId === cardId) unequipCard(f);
  return { ok: true };
}
