/* LFO MANAGER — IA DE CLUBES ("manager brain"). Cada club IA usa la misma información pública que un humano
   (valor de mercado, OVR visible, contratos, plantillas) y decide según su PERFIL: distinta formación, distinta táctica,
   distinto apetito de gasto/venta/juventud/estrellas. No hay trampas: el potencial ajeno sólo se estima parcialmente. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { clamp, round, hash01, R, money, roundMoney, addNews } = TLM;
  const prof = (club) => TLM.AI_PROFILES[club.aiProfile] || TLM.AI_PROFILES.balanced;
  const aiState = (club) => (club.ai = club.ai || { signingsThisSeason: 0, lastBidRound: -9, notes: [] });
  const viewPotential = (p) => (p.age <= 23 ? p.overall + (p.potential - p.overall) * 0.6 : p.overall);

  const MENT = ['veryDefensive', 'defensive', 'balanced', 'attacking', 'veryAttacking'];
  const stepMent = (m, d) => MENT[clamp(MENT.indexOf(m) + d, 0, 4)];

  // Elige formación: la mejor para su plantilla entre las que prefiere su perfil (con sesgo de estilo).
  function chooseFormation(state, club) {
    const pr = prof(club);
    let best = club.tactics.formation, bs = -1;
    for (const f of pr.formations) {
      const xi = TLM.pickXI(state, club, f, club.lineup.xi.filter(Boolean));
      const lr = TLM.lineRatings(state, Object.assign({}, club, { tactics: Object.assign({}, club.tactics, { formation: f }) }), xi);
      const bias = (f === club.tactics.formation ? 0.6 : 0) + (f === pr.formations[0] ? 0.5 : 0); // estabilidad + preferencia
      const s = lr.overall + bias + xi.filter(Boolean).length * 0.3;
      if (s > bs) { bs = s; best = f; }
    }
    return best;
  }

  // Táctica frente a un rival concreto: base del perfil, corregida por la diferencia de nivel visible.
  function chooseTactics(state, club, opp, isHome) {
    const pr = prof(club), t = club.tactics;
    TLM.applyProfileTactics(club);
    const mine = TLM.lineRatings(state, club).overall, theirs = opp ? TLM.lineRatings(state, opp).overall : mine;
    const diff = mine - theirs;
    let m = pr.mentality;
    if (diff < -4 && !['aggressive', 'offensive'].includes(club.aiProfile)) m = stepMent(m, -1);
    else if (diff > 4 && !['conservative', 'defensive'].includes(club.aiProfile)) m = stepMent(m, +1);
    if (!isHome && club.aiProfile !== 'offensive' && club.aiProfile !== 'aggressive') m = stepMent(m, diff > 6 ? 0 : -0);
    t.mentality = m;
    // Sube la presión sólo si el plantel aguanta físicamente.
    const avgFit = TLM.avg(club.lineup.xi.filter(Boolean).map((id) => state.players[id].fitness)) || 100;
    if (avgFit < 70 && (t.pressing === 'high' || t.pressing === 'extreme')) t.pressing = 'medium';
    if (diff < -7 && club.aiProfile !== 'offensive') t.buildUp = club.aiProfile === 'youthDeveloper' ? t.buildUp : 'counter';
    // Reacción al rendimiento: tres derrotas seguidas → el manager se replantea (más cauto, sin presión extrema);
    // tres victorias seguidas → confía en su idea y sube un punto la intensidad si el plantel aguanta.
    const rec = TLM.recentResults(state, state.competitions[state.worldConfigId], club.id, 3), st = aiState(club);
    if (rec.length === 3 && rec.every((x) => x.res === 'L')) { t.mentality = stepMent(t.mentality, -1); if (t.pressing === 'extreme') t.pressing = 'high'; if (!st.crisisRound || state.currentMatchday - st.crisisRound > 4) { st.crisisRound = state.currentMatchday; TLM.addNews(state, 'tactic', `${club.name} replantea su estilo tras tres derrotas seguidas: el técnico apuesta por un equipo más cauto.`, { clubId: club.id }); } }
    else if (rec.length === 3 && rec.every((x) => x.res === 'W') && avgFit >= 75 && MENT.indexOf(t.mentality) < 3 && club.aiProfile !== 'conservative') t.mentality = stepMent(t.mentality, +1);
    club.plan = club.plan || {};
    club.plan.ifWinning = { conservative: 'protect', defensive: 'protect', lowBudget: 'protect', balanced: 'control', pragmaticSeller: 'control', youthDeveloper: 'control', aggressive: 'keep', offensive: 'keep', starBuyer: 'control' }[club.aiProfile] || 'keep';
    club.plan.ifLosing = { aggressive: 'allout', offensive: 'allout', starBuyer: 'push', balanced: 'push', conservative: 'keep', defensive: 'keep' }[club.aiProfile] || 'push';
    club.plan.fromMinute = { minute: 70, mode: ['aggressive', 'offensive', 'starBuyer', 'balanced'].includes(club.aiProfile) ? 'chase' : 'hold' };
    return t;
  }

  // Alineación con rotación: si un titular está muy cansado (<60) y hay recambio decente, descansa.
  function prepareMatch(state, club, opp, isHome) {
    if (club.controlledBy === 'user') return;
    ensureSquad(state, club, true);
    const prevForm = club.tactics.formation;
    club.tactics.formation = chooseFormation(state, club);
    if (prevForm !== club.tactics.formation && state.currentMatchday > 2 && (!aiState(club).formNewsRound || state.currentMatchday - aiState(club).formNewsRound > 6)) { aiState(club).formNewsRound = state.currentMatchday; TLM.addNews(state, 'tactic', `${club.name} cambia al ${club.tactics.formation} de cara al próximo partido.`, { clubId: club.id }); }
    TLM.autoLineup(state, club, club.tactics.formation);
    const tired = club.lineup.xi.map((id, i) => ({ id, i })).filter((x) => x.id && state.players[x.id].fitness < 62 && state.players[x.id].primaryPosition !== 'POR');
    if (tired.length) {
      const fitCount = (id) => state.players[id].fitness;
      tired.slice(0, 3).forEach((x) => {
        const slot = TLM.FORMATIONS[club.tactics.formation][x.i];
        const alt = club.lineup.bench.map((id) => state.players[id]).filter((p) => TLM.compat(slot, p.primaryPosition, p.secondaryPositions) >= 0.86 && p.fitness > fitCount(x.id) + 12 && p.overall >= state.players[x.id].overall - 7)[0];
        if (alt) { club.lineup.bench = club.lineup.bench.map((id) => (id === alt.id ? x.id : id)); club.lineup.xi[x.i] = alt.id; }
      });
    }
    chooseTactics(state, club, opp, isHome);
  }

  // ---------- plantilla mínima y posiciones débiles ----------
  const TARGET = { gk: 2, cb: 4, wb: 3, dm: 2, cm: 3, wm: 2, am: 1, w: 2, st: 3 };
  function positionGaps(state, club) {
    const gaps = [];
    for (const fam in TARGET) {
      const have = club.squad.map((id) => state.players[id]).filter((p) => TLM.FAMILY[p.primaryPosition] === fam);
      if (have.length < TARGET[fam]) gaps.push({ fam, missing: TARGET[fam] - have.length });
    }
    return gaps;
  }
  const famPositions = (fam) => TLM.POSITIONS.filter((p) => TLM.FAMILY[p] === fam);

  // Evita que la IA se quede sin jugadores: ficha agentes libres baratos para cubrir huecos.
  function ensureSquad(state, club, quiet) {
    const st = aiState(club);
    let guard = 0;
    while ((club.squad.length < 17 || positionGaps(state, club).length) && guard++ < 6) {
      const gaps = positionGaps(state, club), fam = gaps.length ? gaps[0].fam : null;
      const pool = state.market.freeAgents.map((id) => state.players[id]).filter((p) => (!fam || TLM.FAMILY[p.primaryPosition] === fam)).sort((a, b) => b.overall - a.overall);
      const p = pool.find((x) => TLM.canSpend(club, x.marketValue * 0.12 + 1000));
      if (!p) break;
      const r = TLM.signFreeAgent(state, club.id, p.id, { years: 2 });
      if (!r.ok) break;
      st.signingsThisSeason++;
    }
    void quiet;
  }

  // ---------- mercado IA ----------
  function targetsFor(state, club) {
    const pr = prof(club), out = [];
    const budget = Math.max(0, club.finances.balance) * pr.spend * 0.8;
    if (budget < 150000) return out;
    const pool = [];
    for (const pid in state.market.listings) pool.push(state.players[pid]);
    // además, ojea jugadores no listados de otros clubes (con menor probabilidad: requiere oferta)
    const r = R(state);
    const others = Object.values(state.players).filter((p) => p.clubId && p.clubId !== club.id && !state.market.listings[p.id] && !state.clubs[p.clubId].foreign);
    for (let i = 0; i < 24; i++) pool.push(others[Math.floor(r.next() * others.length)]);
    for (const p of pool) {
      if (!p || p.clubId === club.id || TLM.transferStatus(state, p.id) === 'NEGOTIATING') continue;
      const l = state.market.listings[p.id];
      const price = l ? l.askingPrice : p.marketValue * (1.05 + pr.bidAggr * 0.15);
      if (price > budget) continue;
      const nd = TLM.need(state, club, p);
      const upg = nd; if (upg < 0.25) continue;
      const star = clamp((p.overall - TLM.avg(club.squad.map((id) => state.players[id].overall)) - 3) / 10, 0, 1);
      const youth = p.age <= 23 ? clamp((viewPotential(p) - 60) / 25, 0, 1) : 0;
      const score = upg * 2 + star * pr.star * 2 + youth * pr.youth * 1.6 - (price / Math.max(budget, 1)) * (1.2 - pr.spend) - (p.age >= 31 ? 0.7 : 0) + (l ? 0.25 : 0) + hash01(club.id, p.id, state.currentMatchday) * 0.5;
      out.push({ p, price, score, listed: !!l });
    }
    return out.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  function marketRound(state) {
    const r = R(state), events = [];
    for (const club of Object.values(state.clubs)) {
      if (club.controlledBy === 'user' || club.foreign) continue;
      const pr = prof(club), st = aiState(club);
      // crisis financiera: vende al mejor pagado que no es titular
      if (club.finances.balance < 0) {
        const p = club.squad.map((id) => state.players[id]).filter((x) => !state.market.listings[x.id]).sort((a, b) => b.contract.salary - a.contract.salary)[0];
        if (p) TLM.listPlayer(state, club.id, p.id, TLM.reserveValue(state, club, p, { round: state.currentMatchday }) * 0.9);
      }
      if (st.signingsThisSeason >= 8 || club.squad.length >= 28) continue;
      if (r.next() > 0.22 + pr.spend * 0.3 + (positionGaps(state, club).length ? 0.3 : 0)) continue;
      const t = targetsFor(state, club)[0];
      if (!t) continue;
      const p = t.p;
      if (t.listed && r.next() < 0.35 + pr.bidAggr * 0.4) {
        const res = TLM.buyNow(state, club.id, p.id, {});
        if (res.ok) { st.signingsThisSeason++; events.push({ type: 'ai_buy', clubId: club.id, playerId: p.id, fee: res.rec.fee }); }
        continue;
      }
      const ceil = TLM.buyerCeiling(state, club, p);
      const bid = roundMoney(Math.min(ceil, p.marketValue * (0.86 + pr.bidAggr * 0.34) * (1 + hash01(club.id, p.id, 'b') * 0.06)));
      if (bid > club.finances.balance * 0.9) continue;
      const res = TLM.makeOffer(state, club.id, p.id, bid, {});
      if (res.ok) { st.lastBidRound = state.currentMatchday; events.push({ type: 'ai_offer', clubId: club.id, playerId: p.id, offer: res.offer }); }
    }
    return events;
  }

  // Los clubes IA también ofertan por jugadores del usuario (nunca más de uno por jornada, sólo si tiene sentido futbolístico).
  function offersForUser(state) {
    const user = state.clubs[state.currentClubId], r = R(state);
    if (!user || !user.squad.length) return [];
    const cands = user.squad.map((id) => state.players[id]).filter((p) => p.overall >= 62 && TLM.transferStatus(state, p.id) == null);
    if (!cands.length || !r.chance(0.28)) return [];
    const p = r.weighted(cands, (x) => Math.max(1, x.overall - 55) * (state.market.listings[x.id] ? 2.5 : 1));
    const buyers = Object.values(state.clubs).filter((c) => c.controlledBy !== 'user' && !c.foreign && c.finances.balance > p.marketValue).map((c) => ({ c, nd: TLM.need(state, c, p) })).filter((x) => x.nd > 0.15).sort((a, b) => b.nd - a.nd);
    if (!buyers.length) return [];
    const b = buyers[Math.floor(r.next() * Math.min(3, buyers.length))].c;
    const pr = prof(b);
    const bid = roundMoney(p.marketValue * (0.85 + pr.bidAggr * 0.3 + r.next() * 0.12));
    const res = TLM.makeOffer(state, b.id, p.id, bid, {});
    if (res.ok) { res.offer.toUser = true; return [{ type: 'offer_for_user', offer: res.offer }]; }
    return [];
  }

  // ---------- renovaciones / fin de contrato ----------
  function seasonEndContracts(state) {
    const out = [];
    for (const club of Object.values(state.clubs)) {
      if (club.controlledBy === 'user' || club.foreign) continue;
      const pr = prof(club);
      for (const id of club.squad.slice()) {
        const p = state.players[id];
        if (p.contract.endSeason > state.season) continue;
        const valued = p.overall >= TLM.avg(club.squad.map((x) => state.players[x].overall)) - 2 && p.age < 34;
        if (valued && hash01(club.id, p.id, state.season, 'renew') < 0.35 + pr.renew * 0.6) {
          const demand = TLM.contractDemand(state, p, club, true);
          if (TLM.canSpend(club, demand)) { const r = TLM.renewContract(state, club.id, p.id, demand, 2); if (r.ok) { out.push({ type: 'renew', playerId: p.id, clubId: club.id }); continue; } }
        }
        out.push({ type: 'release', playerId: p.id, clubId: club.id });
      }
    }
    return out;
  }

  function prepareAll(state) { for (const c of Object.values(state.clubs)) if (c.controlledBy !== 'user') ensureSquad(state, c, true); }

  Object.assign(TLM, { aiChooseFormation: chooseFormation, aiChooseTactics: chooseTactics, aiPrepareMatch: prepareMatch, aiEnsureSquad: ensureSquad, aiPositionGaps: positionGaps, aiTargets: targetsFor, aiMarketRound: marketRound, aiOffersForUser: offersForUser, aiSeasonEndContracts: seasonEndContracts, aiPrepareAll: prepareAll, aiState });
  void round; void money; void addNews; void famPositions;
})(typeof globalThis !== 'undefined' ? globalThis : this);
