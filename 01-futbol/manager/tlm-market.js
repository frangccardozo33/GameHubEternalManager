/* LFO MANAGER — MERCADO: valoración, listados, ofertas con estados claros
   (AVAILABLE · OFFERED · NEGOTIATING · ACCEPTED · REJECTED · TRANSFERRED · CANCELLED), contraofertas, ofertas múltiples
   con competencia real, contratos, agentes libres, ediciones de cromo y scouting con incertidumbre.
   Las respuestas son DETERMINISTAS + variables: ruido por hash(jugador, club, temporada), no por tirada global. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { clamp, round, hash01, nextId, roundMoney, money, R, addTx, addNews } = TLM;
  const D = () => TLM.DEFAULTS;

  const comp = (state) => state.competitions[state.worldConfigId];
  const curRound = (state) => TLM.currentRound(state, comp(state)) || comp(state).calendar.length;
  const clubOf = (state, id) => state.clubs[id];
  const profileOf = (club) => TLM.AI_PROFILES[club.aiProfile] || TLM.AI_PROFILES.balanced;

  // ---------- valoración ----------
  function squadDepth(state, club, p, excludeSelf) {
    const fam = TLM.FAMILY[p.primaryPosition];
    return club.squad.map((id) => state.players[id]).filter((q) => (!excludeSelf || q.id !== p.id) && TLM.FAMILY[q.primaryPosition] === fam);
  }
  function isStarter(state, club, p) { return club.lineup.xi.includes(p.id); }

  // Precio mínimo con el que el club VENDEDOR aceptaría vender (determinista con ruido ±5% por caso).
  function reserveValue(state, seller, p, ctx) {
    ctx = ctx || {};
    const prof = profileOf(seller), base = p.marketValue;
    let f = 1;
    const others = squadDepth(state, seller, p, true);
    const better = others.filter((q) => q.overall >= p.overall - 3).length;
    if (isStarter(state, seller, p) || others.filter((q) => q.overall > p.overall).length < 1) f *= 1.15; else f *= 0.92;
    if (!others.length) f *= 1.45; else if (better === 0) f *= 1.18; else if (better >= 2) f *= 0.93;
    if (p.age >= 31) f *= 0.85;
    if (p.age <= 22 && p.potential > p.overall + 8) f *= 1 + prof.youth * 0.3;
    const left = p.contract.endSeason - state.season;
    if (left <= 0) f *= 0.6; else if (left === 1) f *= 0.88;
    const bal = seller.finances.balance;
    if (bal < 0) f *= 0.8; else if (bal < 2e6) f *= 0.93;
    const avgOvr = TLM.avg(seller.squad.map((id) => state.players[id].overall));
    if (prof.star > 0.6 && p.overall >= avgOvr + 6) f *= 1.15;
    if (p.injury) f *= 0.9;
    f *= prof.sellGreed;
    const l = state.market.listings[p.id];
    if (l && l.clubId === seller.id) f *= 0.92;
    const noise = 1 + (hash01(p.id, seller.id, state.season, ctx.round || 0) - 0.5) * 0.1;
    return Math.max(20000, roundMoney(base * f * noise));
  }

  // Salario anual que el jugador pide para fichar por `club` (o renovar).
  function contractDemand(state, p, club, renewal) {
    let d = TLM.salaryOf(p);
    const gap = p.overall - (club ? club.reputation * 0.42 + 40 : 60);
    if (!renewal) d *= gap > 8 ? 1.2 : gap < -8 ? 0.94 : 1; // le cuesta ir a un club por debajo de su nivel
    if (renewal) d *= p.morale < 45 ? 1.22 : p.morale > 75 ? 0.96 : 1.04;
    return Math.max(30000, roundMoney(d));
  }

  const transferStatus = (state, pid) => {
    const offs = Object.values(state.market.offers).filter((o) => o.playerId === pid && (o.status === 'OFFERED' || o.status === 'NEGOTIATING'));
    if (offs.some((o) => o.status === 'NEGOTIATING')) return 'NEGOTIATING';
    if (offs.length) return 'OFFERED';
    if (state.market.listings[pid] || state.market.freeAgents.includes(pid)) return 'AVAILABLE';
    return null;
  };

  // ---------- listados ----------
  function listPlayer(state, clubId, pid, askingPrice) {
    const p = state.players[pid], club = clubOf(state, clubId);
    if (!p || p.clubId !== clubId) return { ok: false, reason: 'El jugador no pertenece a este club.' };
    const price = roundMoney(askingPrice || p.marketValue * 1.1);
    state.market.listings[pid] = { playerId: pid, clubId, askingPrice: price, listedRound: state.currentMatchday, season: state.season };
    void club;
    return { ok: true, price };
  }
  function unlistPlayer(state, pid) { delete state.market.listings[pid]; }

  // Los clubes IA ponen en venta sobrantes (banquillo profundo, veteranos, exceso en una posición).
  function refreshListings(state) {
    const r = R(state);
    for (const pid of Object.keys(state.market.listings)) { const l = state.market.listings[pid], p = state.players[pid]; if (!p || p.clubId !== l.clubId) delete state.market.listings[pid]; }
    for (const club of Object.values(state.clubs)) {
      if (club.controlledBy === 'user' || club.foreign) continue;
      const prof = profileOf(club);
      const listed = Object.values(state.market.listings).filter((l) => l.clubId === club.id).length;
      const want = Math.round(D().listedPerClub * (0.6 + prof.sellGreed * 0.5)) - listed;
      if (want <= 0 || club.squad.length <= 18) continue;
      const cands = club.squad.map((id) => state.players[id]).filter((p) => !state.market.listings[p.id] && !club.lineup.xi.includes(p.id) && transferStatus(state, p.id) == null)
        .map((p) => ({ p, s: (isSurplus(state, club, p) ? 3 : 0) + (p.age >= 30 ? 2 : 0) + (p.contract.endSeason <= state.season ? 2 : 0) + r.next() * 1.5 - (TLM.FAMILY[p.primaryPosition] === 'gk' && squadDepth(state, club, p).length <= 2 ? 9 : 0) }))
        .sort((a, b) => b.s - a.s).slice(0, want);
      for (const c of cands) listPlayer(state, club.id, c.p.id, reserveValue(state, club, c.p, { round: state.currentMatchday }) * r.range(1.02, 1.18));
    }
  }
  function isSurplus(state, club, p) {
    const fam = squadDepth(state, club, p, true);
    return fam.filter((q) => q.overall >= p.overall).length >= 2 && !club.lineup.xi.includes(p.id);
  }

  // ---------- búsqueda del usuario ----------
  function searchMarket(state, f) {
    f = f || {};
    const rows = [];
    const add = (p, kind) => {
      if (f.pos && !(p.primaryPosition === f.pos || (f.includeSecondary && p.secondaryPositions.includes(f.pos)))) return;
      if (f.role && TLM.roleOf(p.primaryPosition) !== f.role) return;
      if (f.minAge != null && p.age < f.minAge) return; if (f.maxAge != null && p.age > f.maxAge) return;
      if (f.minOvr != null && p.overall < f.minOvr) return; if (f.maxOvr != null && p.overall > f.maxOvr) return;
      if (f.minPot != null && p.potential < f.minPot) return;
      if (f.nationality && p.nationality !== f.nationality) return;
      if (f.clubId && p.clubId !== f.clubId) return;
      const price = kind === 'listed' ? state.market.listings[p.id].askingPrice : kind === 'free' ? 0 : p.marketValue;
      if (f.maxPrice != null && price > f.maxPrice) return; if (f.minPrice != null && price < f.minPrice) return;
      if (f.attr) for (const k in f.attr) if (p.attributes[k] < f.attr[k]) return;
      if (f.name && !p.canonicalName.toLowerCase().includes(String(f.name).toLowerCase())) return;
      rows.push({ pid: p.id, kind, price, status: transferStatus(state, p.id), value: p.marketValue });
    };
    if (f.source !== 'free') for (const pid in state.market.listings) { const p = state.players[pid]; if (p && p.clubId !== f.excludeClub) add(p, 'listed'); }
    if (f.source !== 'listed') for (const pid of state.market.freeAgents) add(state.players[pid], 'free');
    if (f.source === 'all') for (const p of Object.values(state.players)) if (p.clubId && p.clubId !== f.excludeClub && !state.market.listings[p.id] && !state.clubs[p.clubId].foreign) add(p, 'club');
    const key = f.sort || 'ovr';
    rows.sort((a, b) => { const pa = state.players[a.pid], pb = state.players[b.pid]; return key === 'price' ? a.price - b.price : key === 'age' ? pa.age - pb.age : key === 'value' ? pb.marketValue - pa.marketValue : key === 'pot' ? pb.potential - pa.potential : pb.overall - pa.overall; });
    return rows;
  }

  // ---------- transferencias ----------
  function finish(state, offer, status, reason) { offer.status = status; if (reason) offer.reason = reason; offer.closedRound = state.currentMatchday; return offer; }

  function cancelOtherOffers(state, pid, exceptId, reason) {
    for (const o of Object.values(state.market.offers)) if (o.playerId === pid && o.id !== exceptId && (o.status === 'OFFERED' || o.status === 'NEGOTIATING' || o.status === 'ACCEPTED')) finish(state, o, o.fromClubId === state.currentClubId ? 'REJECTED' : 'CANCELLED', reason);
  }

  function executeTransfer(state, offer) {
    const p = state.players[offer.playerId], buyer = clubOf(state, offer.fromClubId), seller = offer.toClubId ? clubOf(state, offer.toClubId) : null;
    if (!p || (seller && p.clubId !== seller.id) || (!seller && p.clubId)) { finish(state, offer, 'CANCELLED', 'El jugador ya no está disponible.'); return { ok: false, reason: offer.reason }; }
    const demand = contractDemand(state, p, buyer);
    const salary = Math.max(offer.salary || 0, Math.round(demand * (offer.demandLocked ? 1 : 0.9)));
    const cost = offer.amount + (seller ? 0 : 0);
    if (!TLM.canSpend(buyer, cost)) { finish(state, offer, 'CANCELLED', 'Saldo insuficiente para cerrar la operación.'); return { ok: false, reason: offer.reason }; }
    if (buyer.squad.length >= 32) { finish(state, offer, 'CANCELLED', 'Plantilla completa (máx. 32).'); return { ok: false, reason: offer.reason }; }
    const fromName = seller ? seller.name : 'agente libre';
    addTx(state, buyer, 'transfer_in', -cost, `Fichaje de ${p.canonicalName} (${fromName})`, p.id);
    if (seller) addTx(state, seller, 'transfer_out', cost, `Venta de ${p.canonicalName} a ${buyer.name}`, p.id);
    if (!seller) state.market.freeAgents = state.market.freeAgents.filter((id) => id !== p.id);
    delete state.market.listings[p.id];
    TLM.moveToClub(state, p.id, buyer.id, { salary, endSeason: state.season + (offer.years || 3) });
    p.morale = clamp(p.morale + 4, 0, 100);
    if (offer.edition && offer.edition !== p.card.edition) applyEdition(state, buyer, p, offer.edition, false); // la edición especial se paga aparte y es del MISMO jugador
    finish(state, offer, 'TRANSFERRED');
    cancelOtherOffers(state, p.id, offer.id, 'El jugador fue traspasado a otro club.');
    const rec = { id: nextId(state, 'transfer', 'tr'), season: state.season, round: state.currentMatchday, playerId: p.id, from: seller ? seller.id : null, to: buyer.id, fee: cost, salary };
    state.transfers.unshift(rec); if (state.transfers.length > 400) state.transfers.length = 400;
    const who = `${p.canonicalName} (${p.primaryPosition}, ${p.overall})`;
    if (seller) addNews(state, 'transfer', `${buyer.name} incorpora a ${who} desde ${seller.name} por ${money(cost)}.`, { playerId: p.id, from: seller.id, to: buyer.id, fee: cost });
    else addNews(state, 'transfer', `${buyer.name} ficha como agente libre a ${who}.`, { playerId: p.id, to: buyer.id, fee: cost });
    return { ok: true, rec, salary };
  }

  function makeOffer(state, buyerId, pid, amount, terms) {
    terms = terms || {};
    const p = state.players[pid], buyer = clubOf(state, buyerId);
    if (!p || !buyer) return { ok: false, reason: 'Datos inválidos.' };
    if (!p.clubId) return { ok: false, reason: 'Es agente libre: ficharlo no requiere oferta.' };
    if (p.clubId === buyerId) return { ok: false, reason: 'Ya es tuyo.' };
    if (Object.values(state.market.offers).some((o) => o.playerId === pid && o.fromClubId === buyerId && (o.status === 'OFFERED' || o.status === 'NEGOTIATING'))) return { ok: false, reason: 'Ya tenés una oferta abierta por este jugador.' };
    amount = roundMoney(amount);
    if (amount <= 0) return { ok: false, reason: 'Monto inválido.' };
    if (!TLM.canSpend(buyer, amount)) return { ok: false, reason: 'Tu saldo no alcanza para esa oferta.' };
    const demand = contractDemand(state, p, buyer);
    const salary = terms.salary || demand;
    if (salary < demand * 0.85) return { ok: false, reason: `El jugador exige al menos ${money(demand)} anuales.`, demand };
    const o = { id: nextId(state, 'offer', 'off'), playerId: pid, fromClubId: buyerId, toClubId: p.clubId, amount, salary: Math.max(salary, Math.round(demand * 0.95)), years: terms.years || 3, status: 'OFFERED',
      createdRound: state.currentMatchday, createdSeason: state.season, expiresRound: state.currentMatchday + D().offerLifeRounds, history: [{ by: 'buyer', amount, round: state.currentMatchday }], counterAmount: null, reason: null, source: buyer.controlledBy, edition: terms.edition || null };
    state.market.offers[o.id] = o;
    return { ok: true, offer: o };
  }

  // Evalúa una oferta contra el precio mínimo del vendedor. Devuelve {verdict, counter, reserve}.
  function evaluateOffer(state, offer) {
    const seller = clubOf(state, offer.toClubId), p = state.players[offer.playerId];
    const reserve = reserveValue(state, seller, p, { round: offer.createdRound });
    const ratio = offer.amount / reserve;
    // Un vendedor no deja al club sin arquero (mín. 2) ni con <15 jugadores.
    const gkLeft = seller.squad.filter((id) => id !== p.id && state.players[id].primaryPosition === 'POR').length;
    if ((p.primaryPosition === 'POR' && gkLeft < 1) || seller.squad.length <= 15) return { verdict: 'reject', reserve, reason: 'No puede desprenderse de él: se quedaría sin plantilla suficiente.' };
    if (ratio >= 1) return { verdict: 'accept', reserve };
    if (ratio >= 0.84) return { verdict: 'counter', reserve, counter: roundMoney(Math.max(offer.amount * 1.02, reserve * (1 + 0.02 * (1 - ratio) * 10))) };
    return { verdict: 'reject', reserve, reason: 'La oferta está muy por debajo de lo que vale para el club.' };
  }

  // Procesa TODAS las ofertas abiertas contra jugadores de clubes IA (ofertas múltiples = competencia real).
  function resolveOffers(state) {
    const events = [];
    const byPlayer = {};
    for (const o of Object.values(state.market.offers)) {
      if (o.status !== 'OFFERED') continue;
      const seller = clubOf(state, o.toClubId);
      if (!seller || seller.controlledBy === 'user') continue; // las ofertas al usuario las decide el usuario
      (byPlayer[o.playerId] = byPlayer[o.playerId] || []).push(o);
    }
    for (const pid in byPlayer) {
      const list = byPlayer[pid];
      const p = state.players[pid];
      // el vendedor prefiere la oferta más atractiva: dinero ajustado por prestigio del comprador
      list.sort((a, b) => scoreOffer(state, b) - scoreOffer(state, a));
      let done = false;
      for (const o of list) {
        if (done) { finish(state, o, 'REJECTED', 'Otro club ofreció más por el jugador.'); events.push({ type: 'lost', offer: o }); continue; }
        const ev = evaluateOffer(state, o);
        if (ev.verdict === 'accept') {
          finish(state, o, 'ACCEPTED');
          const r = executeTransfer(state, o);
          events.push({ type: r.ok ? 'transfer' : 'failed', offer: o }); done = r.ok;
        } else if (ev.verdict === 'counter') {
          o.status = 'NEGOTIATING'; o.counterAmount = ev.counter; o.history.push({ by: 'seller', amount: ev.counter, round: state.currentMatchday });
          o.expiresRound = state.currentMatchday + D().offerLifeRounds;
          events.push({ type: 'counter', offer: o });
        } else { finish(state, o, 'REJECTED', ev.reason); events.push({ type: 'rejected', offer: o }); }
      }
      void p;
    }
    // contraofertas de la IA al usuario: si el usuario respondió con otra cifra (NEGOTIATING por parte del comprador, ver counterOffer)
    for (const o of Object.values(state.market.offers)) {
      if (o.status === 'NEGOTIATING' && o.awaiting === 'seller') {
        o.awaiting = null;
        const seller = clubOf(state, o.toClubId);
        if (seller.controlledBy === 'user') continue;
        const ev = evaluateOffer(state, o);
        if (ev.verdict === 'accept') { finish(state, o, 'ACCEPTED'); const r = executeTransfer(state, o); events.push({ type: r.ok ? 'transfer' : 'failed', offer: o }); }
        else if (ev.verdict === 'counter') { o.counterAmount = ev.counter; o.history.push({ by: 'seller', amount: ev.counter, round: state.currentMatchday }); events.push({ type: 'counter', offer: o }); }
        else { finish(state, o, 'REJECTED', ev.reason); events.push({ type: 'rejected', offer: o }); }
      }
    }
    // caducidad
    for (const o of Object.values(state.market.offers)) {
      if ((o.status === 'OFFERED' || o.status === 'NEGOTIATING') && state.currentMatchday > o.expiresRound) { finish(state, o, 'CANCELLED', 'La oferta caducó sin respuesta.'); events.push({ type: 'expired', offer: o }); }
    }
    // limpieza de ofertas cerradas antiguas
    const all = Object.values(state.market.offers);
    if (all.length > 120) all.filter((o) => !['OFFERED', 'NEGOTIATING'].includes(o.status)).sort((a, b) => (a.closedRound || 0) - (b.closedRound || 0)).slice(0, all.length - 100).forEach((o) => delete state.market.offers[o.id]);
    return events;
  }
  function scoreOffer(state, o) { const b = clubOf(state, o.fromClubId); return o.amount * (1 + (b.reputation - 50) / 400) * (b.controlledBy === 'user' ? 1 : 1); }

  // El comprador (usuario) responde a una contraoferta.
  function acceptCounter(state, offerId) {
    const o = state.market.offers[offerId];
    if (!o || o.status !== 'NEGOTIATING' || !o.counterAmount) return { ok: false, reason: 'No hay contraoferta activa.' };
    const buyer = clubOf(state, o.fromClubId);
    if (!TLM.canSpend(buyer, o.counterAmount)) return { ok: false, reason: 'Saldo insuficiente.' };
    o.amount = o.counterAmount; o.counterAmount = null; o.history.push({ by: 'buyer', amount: o.amount, round: state.currentMatchday, note: 'acepta' });
    finish(state, o, 'ACCEPTED');
    return executeTransfer(state, o);
  }
  function counterOffer(state, offerId, amount) {
    const o = state.market.offers[offerId];
    if (!o || o.status !== 'NEGOTIATING') return { ok: false, reason: 'No hay una negociación abierta.' };
    const buyer = clubOf(state, o.fromClubId);
    amount = roundMoney(amount);
    if (!TLM.canSpend(buyer, amount)) return { ok: false, reason: 'Saldo insuficiente.' };
    o.amount = amount; o.awaiting = 'seller'; o.history.push({ by: 'buyer', amount, round: state.currentMatchday }); o.counterAmount = null;
    // respuesta inmediata en el mismo turno (no se bloquea): vuelve a evaluarse ya
    const ev = evaluateOffer(state, o);
    o.awaiting = null;
    if (ev.verdict === 'accept') { finish(state, o, 'ACCEPTED'); return executeTransfer(state, o); }
    if (ev.verdict === 'counter') { o.counterAmount = ev.counter; o.history.push({ by: 'seller', amount: ev.counter, round: state.currentMatchday }); return { ok: true, status: 'NEGOTIATING', counter: ev.counter }; }
    finish(state, o, 'REJECTED', ev.reason); return { ok: false, reason: o.reason };
  }
  function withdrawOffer(state, offerId) {
    const o = state.market.offers[offerId];
    if (!o || !['OFFERED', 'NEGOTIATING'].includes(o.status)) return { ok: false, reason: 'La oferta ya no está abierta.' };
    finish(state, o, 'CANCELLED', 'Retirada por el comprador.'); return { ok: true };
  }

  // Compra inmediata al precio pedido (jugador en la lista de transferibles).
  function buyNow(state, buyerId, pid, terms) {
    const l = state.market.listings[pid], p = state.players[pid], buyer = clubOf(state, buyerId);
    if (!l || !p) return { ok: false, reason: 'No está en venta.' };
    if (l.clubId === buyerId) return { ok: false, reason: 'Es tu propio jugador.' };
    if (!TLM.canSpend(buyer, l.askingPrice)) return { ok: false, reason: 'Saldo insuficiente (' + money(l.askingPrice) + ').' };
    const demand = contractDemand(state, p, buyer);
    const o = { id: nextId(state, 'offer', 'off'), playerId: pid, fromClubId: buyerId, toClubId: l.clubId, amount: l.askingPrice, salary: (terms && terms.salary) || demand, years: (terms && terms.years) || 3, status: 'ACCEPTED',
      createdRound: state.currentMatchday, createdSeason: state.season, expiresRound: state.currentMatchday, history: [{ by: 'buyer', amount: l.askingPrice, round: state.currentMatchday, note: 'compra directa' }], reason: null, source: buyer.controlledBy, edition: (terms && terms.edition) || null };
    if (o.salary < demand * 0.85) return { ok: false, reason: `El jugador exige al menos ${money(demand)} anuales.`, demand };
    state.market.offers[o.id] = o;
    return executeTransfer(state, o);
  }

  function signFreeAgent(state, clubId, pid, terms) {
    const p = state.players[pid], club = clubOf(state, clubId);
    if (!p || p.clubId || !state.market.freeAgents.includes(pid)) return { ok: false, reason: 'No es agente libre.' };
    const demand = contractDemand(state, p, club), bonus = roundMoney(p.marketValue * 0.12);
    const salary = (terms && terms.salary) || demand;
    if (salary < demand * 0.85) return { ok: false, reason: `Exige al menos ${money(demand)} anuales.`, demand };
    if (!TLM.canSpend(club, bonus)) return { ok: false, reason: 'Saldo insuficiente para la prima de fichaje (' + money(bonus) + ').' };
    const o = { id: nextId(state, 'offer', 'off'), playerId: pid, fromClubId: clubId, toClubId: null, amount: bonus, salary, years: (terms && terms.years) || 2, status: 'ACCEPTED', createdRound: state.currentMatchday, createdSeason: state.season,
      expiresRound: state.currentMatchday, history: [{ by: 'buyer', amount: bonus, round: state.currentMatchday, note: 'agente libre' }], source: club.controlledBy, edition: (terms && terms.edition) || null };
    state.market.offers[o.id] = o;
    return executeTransfer(state, o);
  }

  // ---------- el usuario VENDE: responde a ofertas de clubes IA ----------
  function respondToOffer(state, offerId, action, counter) {
    const o = state.market.offers[offerId];
    if (!o || !['OFFERED', 'NEGOTIATING'].includes(o.status)) return { ok: false, reason: 'La oferta ya no está abierta.' };
    if (action === 'accept') { finish(state, o, 'ACCEPTED'); return executeTransfer(state, o); }
    if (action === 'reject') { finish(state, o, 'REJECTED', 'Rechazada por el club vendedor.'); return { ok: true }; }
    if (action === 'counter') {
      const amt = roundMoney(counter);
      const buyer = clubOf(state, o.fromClubId);
      // el comprador IA evalúa hasta dónde llega: máx = valor percibido según su perfil
      const p = state.players[o.playerId], ceil = buyerCeiling(state, buyer, p);
      o.history.push({ by: 'seller', amount: amt, round: state.currentMatchday });
      if (amt <= ceil && TLM.canSpend(buyer, amt)) { o.amount = amt; finish(state, o, 'ACCEPTED'); return executeTransfer(state, o); }
      if (amt <= ceil * 1.12 && TLM.canSpend(buyer, Math.round(ceil))) { o.status = 'NEGOTIATING'; o.amount = roundMoney(Math.min(ceil, amt)); o.counterAmount = null; o.history.push({ by: 'buyer', amount: o.amount, round: state.currentMatchday }); return { ok: true, status: 'NEGOTIATING', buyerOffer: o.amount }; }
      finish(state, o, 'REJECTED', 'El comprador se retira: pide demasiado.'); return { ok: false, reason: o.reason };
    }
    return { ok: false, reason: 'Acción inválida.' };
  }
  // Máximo que un comprador IA pagaría por un jugador (mismo criterio que usa para ofertar).
  function buyerCeiling(state, buyer, p) {
    const prof = profileOf(buyer);
    const fit = need(state, buyer, p);
    return roundMoney(p.marketValue * (0.95 + prof.bidAggr * 0.3 + Math.max(0, fit) * 0.25) * (p.age <= 23 ? 1 + prof.youth * 0.2 : 1));
  }
  // necesidad del club por este jugador ∈ [-1,1]: mejora al once o cubre un hueco.
  function need(state, club, p) {
    const fam = squadDepth(state, club, p, false).sort((a, b) => b.overall - a.overall);
    const target = TLM.FAMILY[p.primaryPosition] === 'gk' ? 2 : TLM.FAMILY[p.primaryPosition] === 'st' ? 3 : TLM.FAMILY[p.primaryPosition] === 'cb' ? 4 : 3;
    if (fam.length < target) return 1;
    const worstStarter = fam[Math.min(target, fam.length) - 1];
    return clamp((p.overall - worstStarter.overall) / 8, -1, 1);
  }

  // ---------- contratos ----------
  function renewContract(state, clubId, pid, salary, years) {
    const p = state.players[pid], club = clubOf(state, clubId);
    if (!p || p.clubId !== clubId) return { ok: false, reason: 'No es jugador de tu club.' };
    const demand = contractDemand(state, p, club, true);
    if (p.morale < 25) { return { ok: false, reason: `${p.canonicalName} no quiere renovar: está muy desmotivado.` }; }
    salary = salary || demand;
    if (salary >= demand) { applyRenewal(state, p, salary, years); return { ok: true, status: 'accepted', salary }; }
    if (salary >= demand * 0.9) return { ok: false, status: 'counter', counter: demand, reason: `Acepta si le ofrecés ${money(demand)} anuales.` };
    p.morale = clamp(p.morale - 2, 0, 100);
    return { ok: false, status: 'rejected', counter: demand, reason: `Pide ${money(demand)} anuales.` };
  }
  function applyRenewal(state, p, salary, years) {
    p.contract.salary = salary; p.salary = salary; p.contract.endSeason = Math.max(p.contract.endSeason, state.season) + (years || 2); p.contract.status = 'active';
    p.morale = clamp(p.morale + 5, 0, 100);
    addNews(state, 'contract', `${state.clubs[p.clubId].name} renueva a ${p.canonicalName} hasta ${p.contract.endSeason}.`, { playerId: p.id });
  }
  const contractStatus = (state, p) => { const left = p.contract.endSeason - state.season; return !p.clubId ? 'free' : left <= 0 ? 'expiring' : left === 1 ? 'short' : 'active'; };

  // Venta directa al "mercado" (liquidez inmediata al 70% del valor): sale como agente libre no; lo compra un club IA con presupuesto.
  function sellNow(state, clubId, pid) {
    const p = state.players[pid], club = clubOf(state, clubId);
    if (!p || p.clubId !== clubId) return { ok: false, reason: 'No es tuyo.' };
    if (club.squad.length <= TLM.DEFAULTS.minSquadToPlay) return { ok: false, reason: `Necesitás al menos ${TLM.DEFAULTS.minSquadToPlay} jugadores.` };
    const buyers = Object.values(state.clubs).filter((c) => c.controlledBy !== 'user' && !c.foreign && c.squad.length < 30).map((c) => ({ c, ceil: buyerCeiling(state, c, p) })).filter((x) => TLM.canSpend(x.c, x.ceil * 0.7)).sort((a, b) => b.ceil - a.ceil);
    if (!buyers.length) return { ok: false, reason: 'Ningún club puede pagarlo ahora.' };
    const b = buyers[0], price = roundMoney(Math.min(b.ceil, p.marketValue) * 0.75);
    const o = { id: nextId(state, 'offer', 'off'), playerId: pid, fromClubId: b.c.id, toClubId: clubId, amount: price, salary: p.contract.salary, years: 2, status: 'ACCEPTED', createdRound: state.currentMatchday, createdSeason: state.season, expiresRound: state.currentMatchday, history: [{ by: 'buyer', amount: price, round: state.currentMatchday, note: 'venta directa' }], source: 'ai' };
    state.market.offers[o.id] = o;
    return executeTransfer(state, o);
  }

  // ---------- ediciones de cromo (el MISMO jugador; sólo cambia su carta) ----------
  function applyEdition(state, club, p, editionId, free) {
    const ed = TLM.EDITIONS.find((e) => e.id === editionId);
    if (!ed) return { ok: false, reason: 'Edición inexistente.' };
    const cost = free ? 0 : roundMoney(Math.max(20000, p.marketValue * ed.cost));
    if (cost && !TLM.canSpend(club, cost)) return { ok: false, reason: 'Saldo insuficiente (' + money(cost) + ').' };
    if (cost) addTx(state, club, 'card', -cost, `Edición «${ed.name}» de ${p.canonicalName}`, p.id);
    p.card.edition = ed.id; p.card.stars = ed.stars;
    return { ok: true, cost };
  }
  const buyEdition = (state, clubId, pid, editionId) => { const p = state.players[pid]; if (!p || p.clubId !== clubId) return { ok: false, reason: 'No es de tu club.' }; return applyEdition(state, clubOf(state, clubId), p, editionId, false); };

  // ---------- SCOUTING ----------
  function scout(state, clubId, req) {
    req = req || {};
    const club = clubOf(state, clubId);
    if ((state.scout.usedThisRound || 0) >= D().scoutPerRound) return { ok: false, reason: `Tu ojeador ya hizo ${D().scoutPerRound} informes esta jornada. Volvé después del próximo partido.` };
    state.scout.usedThisRound = (state.scout.usedThisRound || 0) + 1;
    const id = nextId(state, 'report', 'rep');
    const acc = clamp(0.6 + club.reputation / 250 + (club.stadium.level - 1) * 0.02, 0.6, 0.98);
    const wide = Math.round(1 + (1 - acc) * 9); // ± puntos de incertidumbre
    let list = Object.values(state.players).filter((p) => p.clubId !== clubId && !(p.clubId && state.clubs[p.clubId].foreign));
    if (req.pos) list = list.filter((p) => p.primaryPosition === req.pos || p.secondaryPositions.includes(req.pos));
    if (req.role) list = list.filter((p) => TLM.roleOf(p.primaryPosition) === req.role);
    if (req.minAge != null) list = list.filter((p) => p.age >= req.minAge); if (req.maxAge != null) list = list.filter((p) => p.age <= req.maxAge);
    const tgt = req.ovr != null ? req.ovr : null;
    if (tgt != null) list = list.filter((p) => Math.abs(p.overall - tgt) <= (req.tol || 6));
    const wantAttrs = (req.attrs || []).filter((k) => TLM.STAT_KEYS.includes(k));
    const prof = req.profile;
    const scored = list.map((p) => {
      let s = 50 - (tgt != null ? Math.abs(p.overall - tgt) * 3 : 0) + (wantAttrs.length ? TLM.avg(wantAttrs.map((k) => p.attributes[k])) - 60 : p.overall * 0.3);
      if (prof === 'young') s += (p.potential - p.overall) * 1.5 - (p.age - 20) * 1.2; else if (prof === 'veteran') s += (p.age - 27) * 1.2; else if (prof === 'star') s += p.overall - 70;
      if (req.maxPrice != null && p.marketValue > req.maxPrice) s -= 40;
      return { p, s };
    }).sort((a, b) => b.s - a.s).slice(0, req.limit || 8);
    const rows = scored.map(({ p }) => {
      const jit = (k) => Math.round((hash01(id, p.id, k) - 0.5) * 2 * wide);
      const top = TLM.STAT_KEYS.slice().sort((a, b) => p.attributes[b] - p.attributes[a]).slice(0, 3);
      const est = clamp(p.overall + jit('o'), 30, 99);
      return {
        pid: p.id, name: p.canonicalName, age: p.age, pos: p.primaryPosition, club: p.clubId ? clubOf(state, p.clubId).name : 'Agente libre', nationality: p.nationality,
        ovr: [Math.max(30, est - Math.ceil(wide / 2)), Math.min(99, est + Math.ceil(wide / 2))], potentialStars: clamp(Math.round((p.potential - 45) / 10 + (hash01(id, p.id, 'p') - 0.5)), 1, 5),
        keyAttrs: top.map((k) => { const v = p.attributes[k] + jit(k); return { key: k, range: [Math.max(20, v - wide), Math.min(99, v + wide)] }; }), value: p.marketValue,
        availability: state.market.listings[p.id] ? 'En venta' : p.clubId ? 'No transferible (requiere oferta)' : 'Libre', confidence: acc,
      };
    });
    const rep = { id, round: state.currentMatchday, season: state.season, clubId, request: req, accuracy: acc, rows };
    state.scoutReports[id] = rep;
    const ids = Object.keys(state.scoutReports); if (ids.length > 20) delete state.scoutReports[ids[0]];
    return { ok: true, report: rep };
  }

  Object.assign(TLM, { reserveValue, contractDemand, transferStatus, listPlayer, unlistPlayer, refreshListings, searchMarket, makeOffer, evaluateOffer, resolveOffers, acceptCounter, counterOffer, withdrawOffer, buyNow,
    signFreeAgent, respondToOffer, renewContract, contractStatus, sellNow, applyEdition, buyEdition, scout, executeTransfer, buyerCeiling, need, isSurplus, squadDepth, curRound, mainComp: comp });
})(typeof globalThis !== 'undefined' ? globalThis : this);
