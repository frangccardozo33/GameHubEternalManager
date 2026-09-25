/* LFO MANAGER — CAREER: orquesta jornada → resultado → actualización del mundo, fin de temporada, guardado/carga.
   Flujo: prepareRound() → (partido del usuario: motor 3D o simulación rápida) → finishRound() (resto de partidos, economía,
   entrenamiento, mercado IA, noticias). Career no guarda estado propio: todo vive en `state` (serializable). */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { clamp, round, R, addNews, addTx, money } = TLM;
  const SAVE_KEY = 'lfo-manager-save-v1';

  const validateCfg = (o) => o;

  class Career {
    constructor(state) { this.state = state; this.bus = new TLM.Bus(); }
    static create(opts) { const c = new Career(TLM.createWorld(validateCfg(opts))); TLM.cupEnsure(c.state); return c; }
    static fromJSON(json) { const s = typeof json === 'string' ? JSON.parse(json) : json; if (!s || s.version !== 1 || !s.clubs || !s.players) throw new Error('Guardado inválido o de otra versión.'); const c = new Career(s); TLM.migrateNations(c.state); TLM.cupEnsure(c.state); return c; }
    toJSON() { return JSON.stringify(this.state); }

    get user() { return this.state.clubs[this.state.currentClubId]; }
    get comp() { return TLM.mainComp(this.state); }
    get round() { return TLM.currentRound(this.state, this.comp); }
    get seasonOver() { return TLM.isSeasonOver(this.state, this.comp); }
    club(id) { return this.state.clubs[id]; }
    player(id) { return this.state.players[id]; }
    table() { return TLM.computeTable(this.state, this.comp); }
    squad(clubId) { return this.state.clubs[clubId || this.state.currentClubId].squad.map((id) => this.state.players[id]); }
    // Si hay una ronda de copa pendiente, el partido del usuario es el de la copa (la liga espera).
    get cupPending() { return TLM.cupPendingRound(this.state); }
    userFixture() { const cf = TLM.cupPendingFixture(this.state, this.state.currentClubId); if (cf) return cf; const r = this.round; return r ? TLM.fixturesOf(this.state, this.comp, r).find((f) => f.homeId === this.state.currentClubId || f.awayId === this.state.currentClubId) || null : null; }
    nextUserFixture() { const cf = TLM.cupPendingFixture(this.state, this.state.currentClubId); return cf || TLM.nextFixtureFor(this.state, this.comp, this.state.currentClubId); }

    // Antes del partido: los clubes IA preparan XI y táctica (mismas reglas que el usuario, sin ver su once).
    prepareRound() {
      const s = this.state, cp = TLM.cupPendingRound(s);
      if (cp) {
        for (const f of cp.fixtures) for (const [id, opp, home] of [[f.homeId, f.awayId, true], [f.awayId, f.homeId, false]]) if (s.clubs[id].controlledBy !== 'user') TLM.aiPrepareMatch(s, s.clubs[id], s.clubs[opp], home);
        TLM.repairLineup(s, this.user);
        return cp.round;
      }
      const r = this.round; if (!r) return null;
      s.currentMatchday = r;
      for (const f of TLM.fixturesOf(s, this.comp, r)) {
        for (const [id, opp, home] of [[f.homeId, f.awayId, true], [f.awayId, f.homeId, false]]) if (s.clubs[id].controlledBy !== 'user') TLM.aiPrepareMatch(s, s.clubs[id], s.clubs[opp], home);
      }
      TLM.repairLineup(s, this.user);
      return r;
    }

    // Configuración del partido del usuario para el motor.
    matchConfig() { const f = this.userFixture(); if (!f) return null; this.prepareRound(); return TLM.buildMatchConfig(this.state, f); }

    // El usuario juega su partido con la simulación rápida (misma vía de resultados que el motor).
    quickSimUser() {
      this.prepareRound(); const f = this.userFixture(); if (!f) return null;
      const res = TLM.simulateMatch(this.state, f); return this.applyUserResult(res);
    }
    applyUserResult(res) {
      const f = this.state.fixtures[res.fixtureId];
      if (!f || f.status === 'played') throw new Error('El partido ya fue registrado.');
      TLM.applyMatchResult(this.state, f, res);
      if (f.cup) TLM.cupAfterMatch(this.state, f, res);          // copa: define quién pasa (penales si hay empate)
      this.state.matchRecords[f.id] = trimRecord(res);
      const keys = Object.keys(this.state.matchRecords); if (keys.length > 60) delete this.state.matchRecords[keys[0]];
      this.bus.emit('userMatch', { fixture: f, result: res });
      return f;
    }

    // Cierra la jornada: simula el resto, cobra/paga, entrena, mueve el mercado y avanza.
    finishRound() {
      const s = this.state, cp = TLM.cupPendingRound(s);
      if (cp) return this._finishCupRound(cp);
      const r = this.round; if (!r) return { events: [] };
      const out = { round: r, results: [], events: [], seasonEnded: false };
      const uf = this.userFixture();
      if (uf && uf.status !== 'played') throw new Error('Jugá (o simulá) tu partido antes de cerrar la jornada.');
      this.prepareRound();
      for (const f of TLM.fixturesOf(s, this.comp, r)) {
        if (f.status === 'played') continue;
        const res = TLM.simulateMatch(s, f); TLM.applyMatchResult(s, f, res);
        out.results.push({ fixtureId: f.id, score: res.score });
      }
      // los que no jugaron (descanso por número impar) también cobran/pagan y se recuperan
      for (const club of Object.values(s.clubs)) {
        if (!club.foreign) TLM.roundAccounting(s, club);      // los invitados del Continente Viejo no tienen sueldos ni entrenamiento simulados
        for (const id of club.squad) TLM.weeklyRecovery(s, s.players[id], !!s.players[id].played);
        if (!club.foreign) TLM.trainRound(s, club);
      }
      for (const p of Object.values(s.players)) p.played = false;
      // mercado (ofertas abiertas, pujas IA, nuevas ofertas por jugadores del usuario)
      s.currentMatchday = r + 1;
      s.scout.usedThisRound = 0;
      const ev = TLM.resolveOffers(s).concat(TLM.aiMarketRound(s), TLM.aiOffersForUser(s));
      TLM.refreshListings(s);
      TLM.roundNews(s);
      // consecuencias financieras del usuario
      const st = TLM.financeStatus(s, this.user);
      if (st === 'crisis') { const forced = this._forcedSale(); if (forced) ev.push(forced); }
      out.events = ev;
      // ¿toca una ronda de copa entre semana? (queda pendiente si el usuario juega; si no, se simula sola)
      out.cup = TLM.cupAfterLeagueRound(s, r);
      if (TLM.isSeasonOver(s, this.comp)) { out.seasonEnded = true; out.season = this.endSeason(); }
      else s.currentMatchday = this.round;
      this.bus.emit('round', out);
      return out;
    }

    // Cierra la ronda de copa: el usuario ya jugó, se simula el resto y se libera la liga.
    _finishCupRound(cp) {
      const s = this.state, uf = this.userFixture();
      if (uf && uf.status !== 'played') throw new Error('Jugá (o simulá) tu partido de copa antes de cerrar la ronda.');
      this.prepareRound();
      const res = TLM.cupClosePending(s);
      const out = { round: null, cup: true, cupResult: res, results: (res.results || []).map((x) => ({ fixtureId: x.fixtureId, score: x.score, pens: x.pens })), events: [], seasonEnded: false };
      this.bus.emit('round', out);
      return out;
    }

    // Crisis: si el saldo cae por debajo del umbral, la directiva vende al mejor pagado no titular (consecuencia real de gastar de más).
    _forcedSale() {
      const s = this.state, u = this.user;
      if (u.finances.debtRounds < 3 || u.squad.length <= TLM.DEFAULTS.minSquadToPlay) return null;
      const p = u.squad.map((id) => s.players[id]).filter((x) => !u.lineup.xi.includes(x.id)).sort((a, b) => b.contract.salary - a.contract.salary)[0];
      if (!p) return null;
      const r = TLM.sellNow(s, u.id, p.id);
      if (r.ok) { addNews(s, 'club', `La directiva de ${u.name} vende a ${p.canonicalName} por la crisis económica del club.`, { playerId: p.id }); return { type: 'forced_sale', playerId: p.id, fee: r.rec.fee }; }
      return null;
    }

    // ---- fin de temporada ----
    endSeason() {
      const s = this.state, comp = this.comp, table = TLM.computeTable(s, comp), N = table.length;
      TLM.cupEndSeason(s);   // si quedaba algo de la copa, se juega solo antes de cerrar la temporada
      const champion = s.clubs[table[0].clubId];
      const scorers = Object.values(s.players).filter((p) => p.seasonStats.goals > 0 && !(p.clubId && s.clubs[p.clubId].foreign)).sort((a, b) => b.seasonStats.goals - a.seasonStats.goals).slice(0, 8).map((p) => ({ pid: p.id, name: p.canonicalName, club: p.clubId ? s.clubs[p.clubId].name : '—', goals: p.seasonStats.goals, assists: p.seasonStats.assists }));
      const rec = { season: s.season, champion: champion.id, championName: champion.name, table: table.map((r) => ({ clubId: r.clubId, name: s.clubs[r.clubId].name, pos: r.pos, played: r.played, won: r.won, drawn: r.drawn, lost: r.lost, gf: r.gf, ga: r.ga, points: r.points })), scorers, transfers: s.transfers.filter((t) => t.season === s.season).length };
      s.history.seasons.push(rec);
      // premios por posición
      table.forEach((row) => {
        const c = s.clubs[row.clubId], prize = round(6e6 * (N - row.pos + 1) / N + (row.pos === 1 ? 4e6 : 0));
        addTx(s, c, 'prize', prize, `Premio de la liga (${row.pos}° puesto)`);
        c.history.seasons.push({ season: s.season, pos: row.pos, points: row.points, gf: row.gf, ga: row.ga });
        if (row.pos === 1) c.history.titles++;
        c.history.bestFinish = c.history.bestFinish ? Math.min(c.history.bestFinish, row.pos) : row.pos;
        c.reputation = clamp(c.reputation + (row.pos <= 3 ? 1.2 : row.pos > N - 3 ? -0.8 : 0.1), 1, 100);
      });
      // récords
      const bestScorer = scorers[0]; if (bestScorer && (!s.history.records.topScorer || bestScorer.goals > s.history.records.topScorer.goals)) s.history.records.topScorer = { ...bestScorer, season: s.season };
      const bestPts = table[0].points; if (!s.history.records.mostPoints || bestPts > s.history.records.mostPoints.points) s.history.records.mostPoints = { club: champion.name, points: bestPts, season: s.season };
      addNews(s, 'season', `${champion.name} se consagra campeón de la ${comp.name} ${TLM.seasonLabel(s)} con ${table[0].points} puntos.`, { clubId: champion.id });
      // contratos: IA renueva/libera; usuario: los vencidos pasan a libres
      const ev = TLM.aiSeasonEndContracts(s);
      for (const p of Object.values(s.players)) {
        if (!p.clubId) continue;
        const mine = s.clubs[p.clubId].controlledBy === 'user';
        if (mine && p.contract.endSeason <= s.season) { ev.push({ type: 'release', playerId: p.id, clubId: p.clubId, user: true }); }
      }
      for (const e of ev) if (e.type === 'release') { const p = s.players[e.playerId]; if (p.clubId === e.clubId) { const cn = s.clubs[e.clubId].name; TLM.moveToClub(s, p.id, null); s.market.freeAgents.push(p.id); delete s.market.listings[p.id]; addNews(s, 'contract', `${p.canonicalName} deja ${cn} al finalizar su contrato y queda libre.`, { playerId: p.id }); } }
      // envejecimiento / progresión / retiros
      for (const p of Object.values(s.players)) {
        if (p.retired) continue;
        if (p.clubId) TLM.closeHistoryStint(s, p);
        else { p.seasonStats = TLM.emptySeason(); }
        TLM.seasonProgress(s, p);
        p.fitness = 100; p.form = 50; p.suspension = 0; p.yellowAccum = 0; p.card.year = s.season + 1;
        if (p.injury) p.injury.matchdays = Math.max(0, p.injury.matchdays - 6), p.injury.matchdays <= 0 && (p.injury = null);
        if (p.age >= 37 || (p.age >= 34 && p.overall < 55 && !p.clubId)) { p.retired = true; if (p.clubId) TLM.moveToClub(s, p.id, null); s.market.freeAgents = s.market.freeAgents.filter((x) => x !== p.id); delete s.market.listings[p.id]; }
        if (!p.retired) { p.salary = p.clubId ? p.contract.salary : TLM.salaryOf(p); }
      }
      // nueva generación: cantera para los clubes IA + agentes libres
      this._youthIntake();
      // nueva temporada
      s.season++; comp.activeSeason = s.season;
      for (const c of Object.values(s.clubs)) { c.finances.seasonIncome = 0; c.finances.seasonExpense = 0; c.observed = { matches: 0, channels: { left: 0, center: 0, right: 0 }, pressing: 0, possession: 0 }; c.training.teamBoost = 0; }
      // limpiar fixtures de temporadas anteriores (la tabla queda en history)
      for (const id in s.fixtures) if (s.fixtures[id].season < s.season) delete s.fixtures[id];
      s.matchRecords = {};
      TLM.generateSeason(s, comp);
      TLM.cupNewSeason(s);
      s.currentMatchday = 1; s.scout.usedThisRound = 0;
      for (const c of Object.values(s.clubs)) { if (c.ai) c.ai.signingsThisSeason = 0; if (c.controlledBy !== 'user') TLM.aiEnsureSquad(s, c, true); TLM.autoLineup(s, c); }
      TLM.refreshListings(s);
      addNews(s, 'season', `Comienza la temporada ${TLM.seasonLabel(s)}.`);
      return rec;
    }

    _youthIntake() {
      const s = this.state, r = R(s), used = TLM.usedNames(s);
      for (const c of Object.values(s.clubs)) {
        if (c.controlledBy === 'user') continue;
        const n = 2 + (TLM.AI_PROFILES[c.aiProfile].youth > 0.7 ? 1 : 0);
        for (let i = 0; i < n; i++) {
          const pos = r.pick(TLM.SQUAD_TEMPLATE);
          const p = TLM.makePlayer(s, { pos, ovr: clamp(40 + c.reputation * 0.15 + r.gauss() * 4, 38, 62), age: r.int(17, 19), _used: used, nationHome: c.nation });
          p.potential = clamp(p.overall + r.int(12, 30), p.overall, 90);
          TLM.recalc(p); p.salary = TLM.salaryOf(p);
          TLM.moveToClub(s, p.id, c.id, { salary: p.salary, endSeason: s.season + 3 });
        }
        while (c.squad.length > 27) { const w = c.squad.map((id) => s.players[id]).sort((a, b) => (a.overall + a.potential * 0.3) - (b.overall + b.potential * 0.3))[0]; TLM.moveToClub(s, w.id, null); s.market.freeAgents.push(w.id); }
      }
      for (let i = 0; i < 26; i++) {
        const pos = r.pick(TLM.POSITIONS);
        const p = TLM.makePlayer(s, { pos, ovr: clamp(56 + r.gauss() * 6, 42, 72), age: clamp(round(24 + r.gauss() * 6), 18, 35), _used: used });
        s.market.freeAgents.push(p.id);
      }
    }

    // ---- guardado ----
    save(slot) {
      const key = SAVE_KEY + (slot ? ':' + slot : '');
      const payload = JSON.stringify({ savedAt: Date.now(), summary: { club: this.user.name, season: this.state.season, round: this.state.currentMatchday }, state: this.state });
      try { g.localStorage.setItem(key, payload); return { ok: true, bytes: payload.length }; } catch (e) { return { ok: false, reason: 'No hay espacio para guardar (' + (e && e.name) + '). Exportá la carrera a un archivo.' }; }
    }
    static load(slot) {
      const raw = g.localStorage && g.localStorage.getItem(SAVE_KEY + (slot ? ':' + slot : ''));
      if (!raw) return null;
      try { return Career.fromJSON(JSON.parse(raw).state); } catch (e) { return null; }
    }
    static saveInfo(slot) { try { const raw = g.localStorage.getItem(SAVE_KEY + (slot ? ':' + slot : '')); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
    static clear(slot) { try { g.localStorage.removeItem(SAVE_KEY + (slot ? ':' + slot : '')); } catch (e) {} }
  }

  // Los registros guardados no llevan el log completo de eventos, sólo lo necesario para el historial.
  function trimRecord(res) {
    return { fixtureId: res.fixtureId, score: res.score, possession: res.possession, shots: res.shots, shotsOnTarget: res.shotsOnTarget, xg: res.xg, passes: res.passes, passAccuracy: res.passAccuracy, yellow: res.yellow, red: res.red, fouls: res.fouls, corners: res.corners, offsides: res.offsides, saves: res.saves,
      goalScorers: res.goalScorers, substitutions: res.substitutions, injuries: res.injuries, playerStats: res.playerStats, events: (res.events || []).slice(0, 80), lineups: res.lineups, source: res.source };
  }

  // Consistencia global: un jugador existe una sola vez y en un solo lugar.
  function validate(state) {
    const errs = [], seen = new Set();
    for (const id in state.players) {
      const p = state.players[id];
      if (p.id !== id) errs.push('ID inconsistente ' + id);
      if (seen.has(id)) errs.push('ID duplicado ' + id); seen.add(id);
    }
    const inClub = {};
    for (const c of Object.values(state.clubs)) for (const pid of c.squad) {
      if (inClub[pid]) errs.push(`${pid} está en dos clubes (${inClub[pid]} y ${c.id})`); inClub[pid] = c.id;
      if (!state.players[pid]) errs.push('plantilla con jugador inexistente ' + pid); else if (state.players[pid].clubId !== c.id) errs.push(`${pid}: clubId no coincide con la plantilla`);
    }
    for (const p of Object.values(state.players)) {
      if (p.clubId && inClub[p.id] !== p.clubId) errs.push(`${p.id}: clubId ${p.clubId} pero no está en su plantilla`);
      if (!p.clubId && inClub[p.id]) errs.push(`${p.id}: libre pero figura en un club`);
      if (p.clubId && state.market.freeAgents.includes(p.id)) errs.push(`${p.id}: club y agente libre a la vez`);
    }
    return errs;
  }

  TLM.Career = Career; TLM.validate = validate; TLM.SAVE_KEY = SAVE_KEY;
})(typeof globalThis !== 'undefined' ? globalThis : this);
