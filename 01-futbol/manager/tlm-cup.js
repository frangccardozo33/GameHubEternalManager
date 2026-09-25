/* LFO MANAGER — COPAS DE ELIMINATORIA (La Cupidité). JS puro, sin DOM.
   Una copa es una competición más (state.competitions['cup_<id>']) con su propio cuadro de partido único.
   Los partidos son fixtures normales (mismo simulador, mismo motor 3D, mismas estadísticas y finanzas); si terminan
   empatados se define por penales.

   FORMATO DE LA CUPIDITÉ (los porcentajes se aplican a la cantidad de jornadas de la liga; con 34 jornadas el corte es la J14):
     · CLASIFICACIÓN — 8 clubes de la LFO (los 8 primeros de la tabla en la jornada de corte, ≈40 % de la liga) y 8 clubes del
       Continente Viejo (los 9 invitados de tlm-data.js GUEST_CLUBS: los 7 mejores entran directo; los dos últimos juegan una
       RONDA PREVIA y el ganador ocupa el octavo lugar). Antes del corte, los clasificados son provisorios.
     · CUADRO — Ronda previa (1 partido) · Octavos · Cuartos · Semifinales · Final. Todo a partido único: si hay empate a los 90′,
       penales. Cada ronda se juega entre semana (miércoles) después de una jornada de liga (≈47 %, 53 %, 67 %, 80 % y 93 % de la liga).
     · SIEMBRA — por reputación (el mejor sembrado enfrenta al ganador de la previa).
     · PREMIOS — por cada ronda superada; subcampeón y campeón aparte.
   Los invitados NO juegan la liga: son clubes del Continente Viejo (state.clubs[id].foreign = true), sin mercado ni finanzas propias.

   Estado (todo serializable): state.cups[id] = { id, season, format:2, status:'qualifying'|'active'|'done'|'skipped', cutRound, hasPrelim,
   entrants[16 | null en el hueco de la previa], slots[], rounds[{name, fixtureIds, done}], champion, runnerUp },
   state.cupPending = { cupId, idx } | null, state.history.cups[id] = [ {season, champion…} ].
   Las copas guardadas con el formato anterior (sin format) se terminan con el formato anterior. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { clamp, round, R, addNews, addTx } = TLM;

  // Definición estática de cada copa. Agregar otra = agregar una entrada.
  const CUPS = {
    cupidite: {
      id: 'cupidite', name: 'La Cupidité', shortName: 'CUPIDITÉ', motto: 'Ad astra per aspera', size: 16, leagueSpots: 8, pkg: 'cupidite',
      crest: 'equiposfut/cupidite/icon.png', logo: 'equiposfut/cupidite/logo.png', wordmark: 'equiposfut/cupidite/wordmark.png', trophy: 'equiposfut/cupidite/icon.png',
      cut: 0.40,                                     // fracción de la liga jugada al cerrarse la clasificación
      slots: [0.47, 0.53, 0.67, 0.80, 0.93],         // fracción de la liga jugada antes de la previa, octavos, cuartos, semis y final
      prizes: [1.5e6, 2.5e6, 4e6, 8e6],              // por ganar octavos, cuartos, semifinales y la final (campeón)
      prelimPrize: 0.6e6, finalist: 3e6, appearance: 0.8e6,
    },
  };
  const ROUND_NAMES = { 64: 'Ronda de 64', 32: 'Dieciseisavos de final', 16: 'Octavos de final', 8: 'Cuartos de final', 4: 'Semifinales', 2: 'Final' };
  const roundName = (n) => ROUND_NAMES[n] || `Ronda de ${n}`;
  const PRELIM = 'Ronda previa';
  const compId = (id) => 'cup_' + id;
  const league = (state) => state.competitions[state.worldConfigId];
  const isNew = (cup) => cup.format === 2;
  const off = (cup) => (cup.hasPrelim ? 1 : 0);

  // Orden clásico de cuadro: 1-16, 8-9, 4-13, 5-12, 2-15, 7-10, 3-14, 6-11 (los mejores sembrados se cruzan lo más tarde posible).
  function bracketOrder(n) {
    let o = [1];
    while (o.length < n) { const m = o.length * 2 + 1; o = o.flatMap((x) => [x, m - x]); }
    return o;
  }
  const pow2Le = (n) => { let s = 2; while (s * 2 <= n) s *= 2; return s; };

  // ---------------------------------------------------------------- clubes invitados (Continente Viejo)
  const guestIds = (state) => Object.keys(state.clubs).filter((id) => state.clubs[id].foreign);
  const guestsByRep = (state) => guestIds(state).sort((a, b) => state.clubs[b].reputation - state.clubs[a].reputation || (a < b ? -1 : 1));

  // Crea los clubes invitados que falten (idempotente: sirve para carreras nuevas y para partidas viejas).
  function ensureGuests(state) {
    const have = new Set(guestIds(state).map((id) => state.clubs[id].name));
    const todo = (TLM.GUEST_CLUBS || []).filter((c) => !have.has(c.name));
    if (!todo.length) return false;
    // los invitados se generan con su propio generador: crearlos no altera el resto del mundo (la liga ni sus partidos)
    const keepRng = state.rngState; state.rngState = ((state.seed ^ 0x51ed270b) >>> 0) || 1;
    const r = R(state), used = TLM.usedNames(state);
    todo.forEach((c) => {
      const club = TLM.newClub(state, Object.assign({}, c, { foreign: true, base: false, balance: TLM.startingBalance(c.rep), profile: c.profile }));
      club.tactics.formation = r.pick(TLM.AI_PROFILES[club.aiProfile].formations);
      TLM.applyProfileTactics(club);
      TLM.fillSquad(state, club, c, used);
      // los jugadores de las naciones del Continente Viejo llevan nombres de su región
      for (const pid of club.squad) {
        const p = state.players[pid], pool = TLM.NAMES_VIEJO[p.nationality && g.LFONations && g.LFONations.get(p.nationality) ? g.LFONations.get(p.nationality).id : ''];
        if (!pool) continue;
        for (let k = 0; k < 30; k++) { const n = r.pick(pool.first) + ' ' + r.pick(pool.last); if (!used.has(n)) { used.delete(p.canonicalName); used.add(n); p.canonicalName = n; break; } }
      }
      // contratos de largo plazo: los invitados no renuevan ni venden jugadores en el mercado de la liga
      for (const pid of club.squad) { const p = state.players[pid]; p.contract.endSeason = state.season + 40; p.contract.salary = 0; p.salary = 0; }
      TLM.autoLineup(state, club);
    });
    state.rngState = keepRng;
    return true;
  }

  // ---------------------------------------------------------------- clasificación
  function leagueTop(state, n) {
    const lg = league(state), tb = TLM.computeTable(state, lg);
    // antes del primer partido la tabla no dice nada: el pronóstico sale de la reputación de los clubes
    if (tb.every((r) => r.played === 0)) return lg.teams.slice().sort((a, b) => state.clubs[b].reputation - state.clubs[a].reputation).slice(0, n);
    return tb.slice(0, n).map((r) => r.clubId);
  }
  // Clasificados para mostrar y para sortear. Devuelve {league[], guests[], prelim[]|null, size, seeded[]}
  function qualifiers(state, def) {
    ensureGuests(state);
    const lg = league(state), spots = Math.min(def.leagueSpots, lg.teams.length), lgIds = leagueTop(state, spots), gs = guestsByRep(state);
    const total = lgIds.length + gs.length, size = Math.min(def.size, pow2Le(total));
    let direct = gs.slice(), prelim = null;
    if (size === def.size && total === size + 1) { prelim = gs.slice(-2); direct = gs.slice(0, -2); }
    else if (total > size) direct = gs.slice(0, gs.length - (total - size));
    const rep = (id) => state.clubs[id].reputation;
    const seeded = lgIds.concat(direct).sort((a, b) => rep(b) - rep(a) || (a < b ? -1 : 1));
    return { league: lgIds, guests: direct, prelim, size, seeded };
  }

  function slotRounds(total, def, n) {
    const out = []; let prev = Math.max(2, round(total * def.cut));
    def.slots.slice(-n).forEach((f) => { const v = clamp(Math.max(round(total * f), prev + 1), 2, total - 1); out.push(v); prev = v; });
    return out;
  }

  function makeComp(state, def) {
    const c = { id: compId(def.id), name: def.name, country: null, crest: def.crest, teams: [], leagueSize: 0, format: 'cup', cupId: def.id, rounds: 1,
      pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0, tieBreakRules: ['points', 'name'], calendar: [], byes: [], activeSeason: state.season, status: 'active', level: 2 };
    state.competitions[c.id] = c;
    return c;
  }

  // Crea la copa de la temporada actual. Arranca en 'qualifying' (clasificación abierta) hasta la jornada de corte.
  function initCup(state, def) {
    const lg = league(state); if (!lg || !lg.calendar.length) return null;
    ensureGuests(state);
    const total = lg.calendar.length, hasPrelim = def.size === 16 && (Math.min(def.leagueSpots, lg.teams.length) + guestIds(state).length === def.size + 1);
    const nRounds = Math.log2(def.size) + (hasPrelim ? 1 : 0);
    const cup = { id: def.id, format: 2, season: state.season, status: 'qualifying', cutRound: clamp(round(total * def.cut), 1, total - 2), hasPrelim, size: def.size, entrants: [], slots: slotRounds(total, def, nRounds), rounds: [], champion: null, runnerUp: null };
    state.cups[def.id] = cup;
    makeComp(state, def);
    const cur = TLM.currentRound(state, lg);
    if (cur != null && cur > cup.slots[0]) { cup.status = 'skipped'; state.competitions[compId(def.id)].status = 'skipped'; return cup; }   // partida vieja empezada tarde
    if (cur != null && cur > cup.cutRound) finalize(state, cup, def);
    return cup;
  }

  // Cierra la clasificación: fija los 16 participantes y sortea la primera ronda.
  function finalize(state, cup, def) {
    const q = qualifiers(state, def), comp = state.competitions[compId(cup.id)];
    cup.size = q.size; cup.hasPrelim = !!q.prelim;
    cup.qualified = { league: q.league, guests: q.guests, prelim: q.prelim };
    cup.entrants = q.seeded.slice();
    if (q.prelim) cup.entrants.push(null);                    // hueco del ganador de la ronda previa (el peor sembrado)
    cup.slots = slotRounds(league(state).calendar.length, def, Math.log2(cup.size) + (cup.hasPrelim ? 1 : 0));
    comp.teams = cup.entrants.filter(Boolean).concat(q.prelim || []); comp.leagueSize = comp.teams.length;
    cup.status = 'active';
    drawRound(state, cup, 0);
    const lgN = q.league.length, gN = q.guests.length + (q.prelim ? 1 : 0);
    addNews(state, 'cup', `Se cerró la clasificación de ${def.name}: ${lgN} clubes de la liga y ${gN} del Continente Viejo${q.prelim ? ` (${state.clubs[q.prelim[0]].name} y ${state.clubs[q.prelim[1]].name} definen el último lugar en la ronda previa)` : ''}.`);
    return cup;
  }

  // Crea los fixtures de la ronda idx.
  function drawRound(state, cup, idx) {
    const comp = state.competitions[compId(cup.id)], o = off(cup);
    let pairs, name, seedOf;
    if (cup.hasPrelim && idx === 0) { pairs = [cup.qualified.prelim.slice()]; name = PRELIM; seedOf = (id) => state.clubs[id].reputation * -1; }
    else if (idx === o) {                                         // primera ronda del cuadro principal, sembrada
      if (cup.hasPrelim) { const pf = state.fixtures[cup.rounds[0].fixtureIds[0]]; cup.entrants[cup.entrants.length - 1] = pf.result.winnerId; comp.teams = cup.entrants.filter(Boolean); }
      const order = bracketOrder(cup.size); pairs = [];
      for (let i = 0; i < order.length; i += 2) pairs.push([cup.entrants[order[i] - 1], cup.entrants[order[i + 1] - 1]]);
      name = roundName(cup.size); seedOf = (id) => cup.entrants.indexOf(id);
    } else {
      const prev = cup.rounds[idx - 1].fixtureIds.map((id) => state.fixtures[id]); pairs = [];
      for (let i = 0; i < prev.length; i += 2) pairs.push([prev[i].result.winnerId, prev[i + 1].result.winnerId]);
      name = roundName(pairs.length * 2); seedOf = (id) => cup.entrants.indexOf(id);
    }
    const ids = [];
    pairs.forEach(([a, b], n) => {
      const [home, away] = seedOf(a) <= seedOf(b) ? [a, b] : [b, a];
      const id = `fx_cup_${cup.id}_${cup.season}_${idx + 1}_${n + 1}`;
      state.fixtures[id] = { id, competitionId: comp.id, season: cup.season, round: idx + 1, homeId: home, awayId: away, status: 'scheduled', result: null, cup: { id: cup.id, idx, tie: n, roundName: name } };
      ids.push(id);
    });
    cup.rounds[idx] = { name, fixtureIds: ids, done: false };
    comp.calendar[idx] = ids;
    return cup.rounds[idx];
  }

  function ensure(state) {
    if (!state.cups) state.cups = {};
    if (!state.history.cups) state.history.cups = {};
    ensureGuests(state);
    for (const id in CUPS) if (!state.cups[id]) initCup(state, CUPS[id]);
    return state.cups;
  }

  // ---------------------------------------------------------------- penales
  function shootout(state, fx) {
    const r = R(state), sides = [state.clubs[fx.homeId], state.clubs[fx.awayId]];
    const takers = sides.map((c) => {
      const xi = c.lineup.xi.filter(Boolean).map((id) => state.players[id]).filter((p) => p && p.primaryPosition !== 'POR');
      const eff = (p) => TLM.effectiveStats(p, c).shooting;
      return xi.sort((a, b) => eff(b) - eff(a)).map((p) => ({ p, s: eff(p) }));
    });
    const gk = sides.map((c) => TLM.lineRatings(state, c).gk);
    const kick = (t, i) => { const tk = takers[t][i % Math.max(1, takers[t].length)]; const s = tk ? tk.s : 65; return r.chance(clamp(0.76 + (s - 70) * 0.004 - (gk[1 - t] - 68) * 0.003, 0.5, 0.92)); };
    const score = [0, 0], seq = [[], []];
    let i = 0, done = false;
    for (; i < 5 && !done; i++) {
      for (const t of [0, 1]) {
        const ok = kick(t, i); seq[t].push(ok); if (ok) score[t]++;
        const left = [5 - seq[0].length, 5 - seq[1].length];
        if (score[0] > score[1] + left[1] || score[1] > score[0] + left[0]) { done = true; break; }
      }
    }
    while (!done && i < 30) {                 // muerte súbita
      const a = kick(0, i), b = kick(1, i); seq[0].push(a); seq[1].push(b); if (a) score[0]++; if (b) score[1]++;
      if (a !== b) done = true; i++;
    }
    if (score[0] === score[1]) score[r.chance(0.5) ? 0 : 1]++;
    return { pens: score, seq };
  }

  // Después de registrar un resultado de copa: decide quién pasa, paga premios y, si la ronda terminó, sortea la siguiente.
  function afterMatch(state, fx, res) {
    if (!fx.cup) return null;
    const cup = state.cups[fx.cup.id], def = CUPS[fx.cup.id], r = fx.result;
    if (r.hg !== r.ag) r.winnerId = r.hg > r.ag ? fx.homeId : fx.awayId;
    else if (res && res.pens && res.pens[0] !== res.pens[1]) { r.pens = res.pens.slice(); r.pensSeq = res.pensSeq || null; r.winnerId = r.pens[0] > r.pens[1] ? fx.homeId : fx.awayId; } // tanda jugada en 3D
    else { const so = shootout(state, fx); r.pens = so.pens; r.pensSeq = so.seq; r.winnerId = so.pens[0] > so.pens[1] ? fx.homeId : fx.awayId; }
    const W = state.clubs[r.winnerId], L = state.clubs[r.winnerId === fx.homeId ? fx.awayId : fx.homeId];
    const isFinal = fx.cup.roundName === 'Final', isPrelim = fx.cup.roundName === PRELIM;
    const mainIdx = fx.cup.idx - (isNew(cup) ? off(cup) : 0);
    const prize = isPrelim ? def.prelimPrize : def.prizes[Math.min(def.prizes.length - 1, Math.max(0, mainIdx + (def.prizes.length - Math.log2(cup.size))))];
    addTx(state, W, 'prize', prize, `${def.name}: ${fx.cup.roundName} superada`);
    const sc = r.pens ? `${r.hg}-${r.ag} (pen. ${r.pens[0]}-${r.pens[1]})` : `${r.hg}-${r.ag}`;
    if (isFinal) {
      addTx(state, L, 'prize', def.finalist, `${def.name}: subcampeón`);
      cup.champion = W.id; cup.runnerUp = L.id; cup.status = 'done';
      W.reputation = clamp(W.reputation + 1.5, 1, 100); L.reputation = clamp(L.reputation + 0.5, 1, 100);
      W.history.cups = (W.history.cups || 0) + 1;
      (state.history.cups[cup.id] = state.history.cups[cup.id] || []).push({ season: cup.season, champion: W.id, championName: W.name, championNation: W.nation || null, runnerUp: L.id, runnerUpName: L.name, score: sc });
      addNews(state, 'cup', `${W.name} conquista ${def.name} tras vencer a ${L.name} en la final (${sc}).`, { clubId: W.id, fixtureId: fx.id });
    } else if (W.controlledBy === 'user' || L.controlledBy === 'user' || W.reputation + 8 < L.reputation || isPrelim) {
      addNews(state, 'cup', `${def.name} · ${fx.cup.roundName}: ${W.name} elimina a ${L.name} (${sc}).`, { clubId: W.id, fixtureId: fx.id });
    }
    const rd = cup.rounds[fx.cup.idx];
    if (rd.fixtureIds.every((id) => state.fixtures[id].status === 'played' && state.fixtures[id].result.winnerId)) {
      rd.done = true;
      if (!isFinal) drawRound(state, cup, fx.cup.idx + 1);
    }
    void res;
    return r;
  }

  // ---------------------------------------------------------------- calendario
  const pendingOf = (state) => (state.cupPending ? state.cupPending : null);
  function pendingRound(state) {
    const p = pendingOf(state); if (!p) return null;
    const cup = state.cups[p.cupId], rd = cup && cup.rounds[p.idx]; if (!rd) { state.cupPending = null; return null; }
    return { cup, def: CUPS[cup.id], idx: p.idx, round: p.idx + 1, name: rd.name, fixtures: rd.fixtureIds.map((id) => state.fixtures[id]) };
  }
  function pendingFixtureFor(state, clubId) { const p = pendingRound(state); return p ? p.fixtures.find((f) => f.homeId === clubId || f.awayId === clubId) || null : null; }

  // Fecha real de una ronda: el miércoles siguiente a la jornada de liga en la que se inserta.
  function roundDate(state, cup, idx) {
    const lg = league(state), d = TLM.dateOfRound(cup.season, cup.slots[idx], lg.calendar.length);
    return new Date(d.getTime() + 4 * 86400000);
  }
  const fmtDate = (d, short) => d.toLocaleDateString('es-AR', Object.assign({ timeZone: 'UTC' }, short ? { weekday: 'short', day: 'numeric', month: 'short' } : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  const dateStr = (state, cup, idx, short) => fmtDate(roundDate(state, cup, idx), short);

  // Simula todos los partidos sin jugar de la ronda (los clubes IA preparan su once como en liga).
  function simulateRound(state, cup, idx) {
    const out = [];
    for (const id of cup.rounds[idx].fixtureIds) {
      const f = state.fixtures[id]; if (f.status === 'played') continue;
      for (const [cid, oid, home] of [[f.homeId, f.awayId, true], [f.awayId, f.homeId, false]]) if (state.clubs[cid].controlledBy !== 'user') TLM.aiPrepareMatch(state, state.clubs[cid], state.clubs[oid], home);
      const res = TLM.simulateMatch(state, f); TLM.applyMatchResult(state, f, res); afterMatch(state, f, res);
      out.push({ fixtureId: f.id, score: res.score, pens: f.result.pens || null, winnerId: f.result.winnerId });
    }
    return out;
  }

  // Después de cerrar la jornada de liga `leagueRound`: cierra la clasificación si toca y, si hay ronda de copa, queda pendiente
  // (o se juega sola si el usuario no está).
  function afterLeagueRound(state, leagueRound) {
    const info = [];
    ensure(state);
    for (const id in state.cups) {
      const cup = state.cups[id];
      if (cup.status === 'qualifying' && leagueRound >= cup.cutRound) { finalize(state, cup, CUPS[id]); info.push({ cupId: id, qualified: true }); }
      if (cup.status !== 'active') continue;
      const idx = cup.slots.indexOf(leagueRound); if (idx < 0 || !cup.rounds[idx] || cup.rounds[idx].done) continue;
      const mine = cup.rounds[idx].fixtureIds.map((fid) => state.fixtures[fid]).some((f) => f.homeId === state.currentClubId || f.awayId === state.currentClubId);
      if (mine) { state.cupPending = { cupId: id, idx }; info.push({ cupId: id, idx, pending: true, name: cup.rounds[idx].name }); }
      else { const res = simulateRound(state, cup, idx); info.push({ cupId: id, idx, pending: false, name: cup.rounds[idx].name, results: res }); }
    }
    return info;
  }

  // Cierra la ronda pendiente (el usuario ya jugó): simula el resto y libera la liga.
  function closePending(state) {
    const p = pendingRound(state); if (!p) return null;
    const results = simulateRound(state, p.cup, p.idx);
    state.cupPending = null;
    return { cupId: p.cup.id, idx: p.idx, name: p.name, results, done: p.cup.rounds[p.idx].done, champion: p.cup.champion };
  }

  // Al terminar la temporada de liga: lo que quede de la copa se juega solo; luego arranca la copa nueva.
  function endSeason(state) {
    for (const id in state.cups) {
      const cup = state.cups[id];
      if (cup.status === 'qualifying') finalize(state, cup, CUPS[id]);
      for (let idx = 0; idx < 8 && cup.status === 'active'; idx++) { if (!cup.rounds[idx]) break; if (!cup.rounds[idx].done) simulateRound(state, cup, idx); }
    }
    state.cupPending = null;
  }
  function newSeason(state) {
    for (const id in CUPS) { delete state.cups[id]; delete state.competitions[compId(id)]; initCup(state, CUPS[id]); }
  }

  // ---------------------------------------------------------------- lectura para la interfaz
  // Cuadro listo para mostrar: rondas con partidos (los de rondas futuras aparecen como "por definir").
  function bracket(state, id) {
    const cup = state.cups[id], out = [];
    if (isNew(cup)) {
      const names = (cup.hasPrelim ? [PRELIM] : []).concat(Array.from({ length: Math.log2(cup.size) }, (_, i) => roundName(cup.size / 2 ** i)));
      names.forEach((name, idx) => {
        const rd = cup.rounds[idx], nTies = name === PRELIM ? 1 : (cup.size / 2 ** (idx - off(cup))) / 2;
        out.push({ idx, name, date: cup.slots[idx] ? dateStr(state, cup, idx, true) : '', ties: rd ? rd.fixtureIds.map((fid) => state.fixtures[fid]) : Array.from({ length: nTies }, () => null), done: !!(rd && rd.done), prelim: name === PRELIM });
      });
      return out;
    }
    for (let t = cup.size, idx = 0; t >= 2; t /= 2, idx++) {
      const rd = cup.rounds[idx];
      out.push({ idx, name: roundName(t), date: cup.slots[idx] ? dateStr(state, cup, idx, true) : '', ties: rd ? rd.fixtureIds.map((fid) => state.fixtures[fid]) : Array.from({ length: t / 2 }, () => null), done: !!(rd && rd.done) });
    }
    return out;
  }

  // Resumen de La Cupidité para la pestaña Competiciones. phase: qualifying | active | done | skipped
  function overview(state, id) {
    ensure(state);
    const def = CUPS[id], cup = state.cups[id], lg = league(state), total = lg.calendar.length, cur = TLM.currentRound(state, lg) || total + 1;
    const out = { def, cup, phase: cup.status, total, cur };
    out.legacy = !isNew(cup);
    if (cup.status === 'qualifying') {
      const q = qualifiers(state, def), tb = TLM.computeTable(state, lg), row = (cid) => tb.find((r) => r.clubId === cid) || {};
      out.provisional = { league: q.league.map((cid) => ({ id: cid, pos: row(cid).pos, points: row(cid).points, played: row(cid).played })), guests: q.guests, prelim: q.prelim, size: q.size };
      out.cutIn = Math.max(0, cup.cutRound - (cur - 1)); out.cutRound = cup.cutRound; out.cutDate = TLM.roundDateStr(cup.season, cup.cutRound, total);
      out.startsIn = Math.max(0, cup.slots[0] - (cur - 1)); out.startDate = dateStr(state, cup, 0);
      out.startName = q.prelim ? PRELIM : roundName(q.size);
      // el equipo del usuario: ¿entraría hoy?
      out.userIn = q.league.includes(state.currentClubId);
    } else if (cup.status === 'active') {
      const i = cup.rounds.findIndex((r) => r && !r.done);
      out.nextIdx = i; out.nextName = i >= 0 ? cup.rounds[i].name : null; out.nextDate = i >= 0 ? dateStr(state, cup, i) : ''; out.nextIn = i >= 0 ? Math.max(0, cup.slots[i] - (cur - 1)) : 0;
    }
    return out;
  }
  // Resumen de la liga (trofeo): líder actual, ventaja sobre el segundo y jornadas que faltan.
  function leagueOverview(state) {
    const lg = league(state), tb = TLM.computeTable(state, lg), total = lg.calendar.length, cur = TLM.currentRound(state, lg);
    const pre = tb.every((r) => r.played === 0);
    if (pre) tb.sort((a, b) => state.clubs[b.clubId].reputation - state.clubs[a.clubId].reputation).forEach((r, i) => (r.pos = i + 1));
    const played = cur == null ? total : cur - 1, left = total - played;
    const lead = tb[0], second = tb[1], pts = (r) => (r ? r.points : 0);
    // puntos que aún puede sumar cada club = 3 × partidos que le faltan
    const maxLeft = 3 * (left - (lg.byes || []).slice(played).filter((b) => b === lead.clubId).length);
    const clinched = tb.length > 1 && left > 0 && pts(lead) - pts(second) > maxLeft;
    return { pre, comp: lg, table: tb, leader: lead, gap: pts(lead) - pts(second), total, played, left, done: cur == null, clinched, contenders: tb.filter((r) => pts(lead) - pts(r) <= 3 * left).length };
  }

  const isCupFixture = (f) => !!(f && f.cup);
  function labelOf(state, f) {
    if (f && f.cup) { const def = CUPS[f.cup.id], cup = state.cups[f.cup.id]; return { cup: true, cupId: f.cup.id, comp: def.name, round: f.cup.roundName, short: f.cup.roundName, date: cup ? dateStr(state, cup, f.cup.idx) : '', dateShort: cup ? dateStr(state, cup, f.cup.idx, true) : '', pkg: def.pkg }; }
    const lg = league(state);
    return { cup: false, comp: lg.name, round: 'Jornada ' + (f ? f.round : ''), short: 'Jornada ' + (f ? f.round : ''), date: f ? TLM.roundDateStr(state.season, f.round, lg.calendar.length) : '', dateShort: f ? TLM.roundDateStr(state.season, f.round, lg.calendar.length, true) : '', pkg: null };
  }

  // Frases de estudio de un partido de copa (reemplazan a las de tabla de liga).
  function studioLines(state, fx, res) {
    const r = fx.result, W = state.clubs[r.winnerId], L = state.clubs[r.winnerId === fx.homeId ? fx.awayId : fx.homeId], def = CUPS[fx.cup.id], cup = state.cups[fx.cup.id], out = [];
    const isFinal = fx.cup.roundName === 'Final';
    out.push(['A', r.pens ? `Empataron ${r.hg}-${r.ag} y todo se definió desde los doce pasos: ${r.pens[0]}-${r.pens[1]}. Pasa ${W.name}.` : `${W.name} se queda con el pase y deja afuera a ${L.name}.`]);
    if (isFinal) out.push(['B', `${W.name} es el campeón de ${def.name}. ${def.motto}.`]);
    else { const nx = cup.rounds[fx.cup.idx + 1]; out.push(['B', `${W.name} avanza a ${nx ? nx.name.toLowerCase() : 'la siguiente ronda'} de ${def.name}.`]); }
    void res;
    return out;
  }
  function preLines(state, fx) {
    const def = CUPS[fx.cup.id], H = state.clubs[fx.homeId], A = state.clubs[fx.awayId];
    const foreign = [H, A].filter((c) => c.foreign);
    const extra = foreign.length ? `${foreign.map((c) => c.name).join(' y ')} llega${foreign.length > 1 ? 'n' : ''} desde el Continente Viejo.` : 'Si el tiempo reglamentario termina igualado, se define por penales.';
    return [['A', `${def.name}, ${fx.cup.roundName.toLowerCase()}: ${H.name} recibe a ${A.name}. Partido único, sin revancha.`], ['B', extra]];
  }

  Object.assign(TLM, { CUPS, cupEnsure: ensure, cupInit: initCup, cupAfterMatch: afterMatch, cupAfterLeagueRound: afterLeagueRound, cupPendingRound: pendingRound, cupPendingFixture: pendingFixtureFor,
    cupClosePending: closePending, cupEndSeason: endSeason, cupNewSeason: newSeason, cupBracket: bracket, cupDateStr: dateStr, cupRoundDate: roundDate, cupSimulateRound: simulateRound, isCupFixture, fixtureLabel: labelOf,
    cupStudioLines: studioLines, cupPreLines: preLines, cupBracketOrder: bracketOrder, cupOverview: overview, leagueOverview, cupQualifiers: qualifiers, cupFinalize: finalize, ensureGuests, guestClubs: guestsByRep, cupIsNew: isNew, CUP_PRELIM: PRELIM });
})(typeof globalThis !== 'undefined' ? globalThis : this);
