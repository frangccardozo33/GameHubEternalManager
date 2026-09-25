/* LFO MANAGER — SIMULACIÓN RÁPIDA (partidos IA vs IA) + APLICACIÓN DE RESULTADOS.
   El partido del usuario lo juega el motor 3D; el resto del mundo usa este simulador estadístico basado en la MISMA alineación,
   táctica y atributos efectivos. Ambos producen el mismo esquema MatchResult y pasan por el mismo applyMatchResult():
   una sola vía para actualizar tabla, estadísticas, lesiones, moral, finanzas y noticias. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { clamp, round, avg, R, addTx, addNews, money } = TLM;
  const MENT = { veryDefensive: -2, defensive: -1, balanced: 0, attacking: 1, veryAttacking: 2 };

  function poisson(r, lam) { const L = Math.exp(-lam); let k = 0, p = 1; do { k++; p *= r.next(); } while (p > L && k < 12); return k - 1; }

  function sideState(state, club) {
    TLM.repairLineup(state, club);
    const xi = club.lineup.xi.filter(Boolean).map((id) => state.players[id]);
    return { club, lr: TLM.lineRatings(state, club), xi, bench: club.lineup.bench.map((id) => state.players[id]), tac: club.tactics };
  }

  // Simula un partido y devuelve un MatchResult (sin tocar el estado; applyMatchResult lo aplica).
  function simulateMatch(state, fixture, opts) {
    const r = R(state), H = sideState(state, state.clubs[fixture.homeId]), A = sideState(state, state.clubs[fixture.awayId]);
    const mh = MENT[H.tac.mentality] || 0, ma = MENT[A.tac.mentality] || 0;
    const lam = (a, d, mid, gkOpp, mentAtk, mentOppAtk, homeAdv) => 1.28 * Math.exp((a.attack - d.defense) * 0.036 + (mid.midfield - a.midfieldOpp) * 0.018 - (gkOpp - 68) * 0.014) * homeAdv * (1 + mentAtk * 0.06) * (1 + mentOppAtk * 0.035);
    const lh = lam({ attack: H.lr.attack, midfieldOpp: A.lr.midfield }, { defense: A.lr.defense }, { midfield: H.lr.midfield }, A.lr.gk, mh, ma, 1.14);
    const la = lam({ attack: A.lr.attack, midfieldOpp: H.lr.midfield }, { defense: H.lr.defense }, { midfield: A.lr.midfield }, H.lr.gk, ma, mh, 0.94);
    const goals = [poisson(r, lh), poisson(r, la)];
    const sides = [H, A], res = { fixtureId: fixture.id, homeClubId: H.club.id, awayClubId: A.club.id, score: goals.slice(), source: 'sim', events: [], goalScorers: [], substitutions: [], injuries: [], playerStats: {}, lineups: [] };
    const ps = res.playerStats;
    const ensure = (p, side, start) => (ps[p.id] = ps[p.id] || { pid: p.id, team: side, minutes: 0, start: !!start, goals: 0, assists: 0, shots: 0, saves: 0, fouls: 0, yellow: 0, red: 0, tackles: 0, rating: 0, cleanSheet: false });
    // ---- cambios (0-3 por equipo, minuto 55-85) ----
    sides.forEach((S, t) => {
      res.lineups.push({ team: t, xi: S.xi.map((p) => p.id), bench: S.bench.map((p) => p.id) });
      S.xi.forEach((p) => { ensure(p, t, true).minutes = 90; });
      const nSubs = Math.min(S.bench.length, r.weighted([0, 1, 2, 3], (k) => [0.15, 0.3, 0.35, 0.2][k]));
      const used = new Set();
      for (let i = 0; i < nSubs; i++) {
        const out = S.xi.filter((p) => p.primaryPosition !== 'POR' && !used.has(p.id)).sort((a, b) => a.fitness - b.fitness + (r.next() - 0.5) * 20)[0];
        if (!out) break;
        const inn = S.bench.filter((b) => !used.has(b.id) && b.primaryPosition !== 'POR').sort((a, b) => TLM.compat(TLM.FORMATIONS[S.tac.formation][S.club.lineup.xi.indexOf(out.id)], b.primaryPosition, b.secondaryPositions) - TLM.compat(TLM.FORMATIONS[S.tac.formation][S.club.lineup.xi.indexOf(out.id)], a.primaryPosition, a.secondaryPositions))[0];
        if (!inn) break;
        const minute = r.int(55, 85);
        used.add(out.id); used.add(inn.id);
        ps[out.id].minutes = minute; ensure(inn, t, false).minutes = 90 - minute;
        res.substitutions.push({ team: t, minute, outPid: out.id, inPid: inn.id });
        res.events.push({ minute, type: 'sub', team: t, pid: inn.id, text: `${inn.canonicalName} entra por ${out.canonicalName}` });
        S._subs = (S._subs || []).concat([{ minute, out, inn }]);
      }
    });
    const onPitch = (S, t, minute) => {
      const subs = S._subs || [];
      return S.xi.filter((p) => !subs.some((s) => s.out.id === p.id && s.minute <= minute)).concat(subs.filter((s) => s.minute <= minute).map((s) => s.inn));
    };
    // ---- goles ----
    [0, 1].forEach((t) => {
      const S = sides[t];
      for (let i = 0; i < goals[t]; i++) {
        const minute = r.int(1, 90), pool = onPitch(S, t, minute);
        const sc = r.weighted(pool, (p) => { const ro = TLM.roleOf(p.primaryPosition); const st = TLM.effectiveStats(p, S.club); return (ro === 'FWD' ? 5.5 : ro === 'MID' ? 2 : ro === 'DEF' ? 0.55 : 0.02) * Math.pow(st.shooting / 70, 2.2); });
        let as = null;
        if (r.chance(0.72)) as = r.weighted(pool.filter((p) => p.id !== sc.id), (p) => { const ro = TLM.roleOf(p.primaryPosition); const st = TLM.effectiveStats(p, S.club); return (ro === 'MID' ? 3 : ro === 'FWD' ? 2.5 : ro === 'DEF' ? 1 : 0.1) * Math.pow(st.passing / 70, 2); });
        ps[sc.id].goals++; as && ps[as.id].assists++;
        res.goalScorers.push({ pid: sc.id, team: t, minute, assistPid: as ? as.id : null });
        res.events.push({ minute, type: 'goal', team: t, pid: sc.id, assist: as ? as.id : null, text: `${sc.canonicalName} marca para ${S.club.shortName}` });
      }
    });
    res.goalScorers.sort((a, b) => a.minute - b.minute); res.events.sort((a, b) => a.minute - b.minute);
    // ---- estadísticas de equipo ----
    const poss0 = clamp(round(50 + (H.lr.midfield - A.lr.midfield) * 1.3 + ({ possession: 4, balanced: 0, direct: -3, counter: -6 }[H.tac.buildUp] || 0) - ({ possession: 4, balanced: 0, direct: -3, counter: -6 }[A.tac.buildUp] || 0) + r.gauss() * 2.5), 32, 68);
    res.possession = [poss0, 100 - poss0];
    res.shots = [0, 1].map((t) => Math.max(goals[t], round(goals[t] / 0.11 * clamp(0.7 + r.next() * 0.6, 0.6, 1.4) * 0.6 + [lh, la][t] * 4 + r.range(0, 4))));
    res.shotsOnTarget = [0, 1].map((t) => Math.min(res.shots[t], goals[t] + round(res.shots[t] * r.range(0.16, 0.32))));
    res.xg = [0, 1].map((t) => +(res.shots[t] * 0.09 + goals[t] * 0.15 + r.range(-0.2, 0.3)).toFixed(2)).map((x) => Math.max(0.1, x));
    res.passes = [0, 1].map((t) => round(300 + res.possession[t] * 4.6 + r.range(-40, 40)));
    res.passAccuracy = [0, 1].map((t) => clamp(round(68 + (sides[t].lr.midfield - 60) * 0.5 + (t === 0 ? 1 : -1) * (poss0 - 50) * 0.15 + r.gauss() * 2), 60, 92));
    res.fouls = [0, 1].map((t) => clamp(round(10 + (['high', 'extreme'].includes(sides[t].tac.pressing) ? 3 : 0) + r.gauss() * 2.5), 5, 24));
    res.corners = [0, 1].map((t) => clamp(round(res.shots[t] * 0.38 + r.range(0, 2)), 0, 14));
    res.offsides = [0, 1].map(() => r.int(0, 4));
    const yl = [0, 1].map((t) => Math.min(5, poisson(r, 1.5 + (res.fouls[t] - 10) * 0.12))), rd = [0, 1].map(() => (r.chance(0.05) ? 1 : 0));
    res.yellow = yl; res.red = rd;
    res.saves = [0, 1].map((t) => Math.max(0, res.shotsOnTarget[1 - t] - goals[1 - t]));
    res.channels = sides.map((S) => { const w = S.tac.width === 'wide' ? 1.2 : S.tac.width === 'narrow' ? 0.7 : 1; const l = r.range(0.6, 1.4) * w, rr = r.range(0.6, 1.4) * w, c = r.range(0.8, 1.6) * (2 - w); const tot = l + rr + c; return { left: round(l / tot * 40), center: round(c / tot * 40), right: round(rr / tot * 40) }; });
    // ---- distribución por jugador ----
    [0, 1].forEach((t) => {
      const S = sides[t], all = S.xi.concat(S.bench.filter((b) => ps[b.id]));
      // tiros
      let remaining = res.shots[t];
      all.forEach((p) => { if (ps[p.id].goals) { ps[p.id].shots += ps[p.id].goals; remaining -= ps[p.id].goals; } });
      for (let i = 0; i < Math.max(0, remaining); i++) { const p = r.weighted(all.filter((x) => x.primaryPosition !== 'POR'), (x) => { const ro = TLM.roleOf(x.primaryPosition); return (ro === 'FWD' ? 4 : ro === 'MID' ? 2 : 0.5) * ps[x.id].minutes / 90; }); ps[p.id].shots++; }
      const gk = all.find((p) => p.primaryPosition === 'POR' && ps[p.id].minutes > 0); if (gk) { ps[gk.id].saves = res.saves[t]; ps[gk.id].cleanSheet = goals[1 - t] === 0; }
      // tarjetas / faltas / recuperaciones
      for (let i = 0; i < yl[t]; i++) { const p = r.weighted(all, (x) => 1 + x.personality.aggression / 40 + (TLM.roleOf(x.primaryPosition) === 'DEF' ? 1 : 0) + (TLM.roleOf(x.primaryPosition) === 'MID' ? 0.6 : 0)); ps[p.id].yellow++; res.events.push({ minute: r.int(5, 89), type: 'card', team: t, pid: p.id, text: `Tarjeta amarilla para ${p.canonicalName}` }); }
      if (rd[t]) { const p = r.pick(S.xi.filter((x) => x.primaryPosition !== 'POR')); ps[p.id].red = 1; ps[p.id].minutes = Math.min(ps[p.id].minutes, r.int(30, 85)); res.events.push({ minute: ps[p.id].minutes, type: 'card', team: t, pid: p.id, red: true, text: `Roja directa para ${p.canonicalName}` }); }
      all.forEach((p) => { const ro = TLM.roleOf(p.primaryPosition); ps[p.id].tackles = ro === 'GK' ? 0 : round(r.range(0.5, ro === 'DEF' ? 6 : ro === 'MID' ? 4.5 : 2) * ps[p.id].minutes / 90); ps[p.id].fouls = round(r.range(0, 2.2) * ps[p.id].minutes / 90); });
    });
    // ---- lesiones (baja frecuencia, más probable con poco fitness) ----
    [0, 1].forEach((t) => sides[t].xi.forEach((p) => { if (r.chance(0.012 * (1 + (100 - p.fitness) / 70))) { const sev = r.next(); res.injuries.push({ pid: p.id, severity: sev }); res.events.push({ minute: r.int(10, 88), type: 'injury', team: t, pid: p.id, text: `${p.canonicalName} se lesiona` }); } }));
    rate(state, res, sides);
    res.events.sort((a, b) => a.minute - b.minute);
    void opts;
    return res;
  }

  // Valoración 1-10 del jugador con lo que hizo (mismo criterio para motor y simulador). Sólo usa datos existentes.
  function rate(state, res, sides) {
    const r = R(state);
    [0, 1].forEach((t) => {
      const my = res.score[t], opp = res.score[1 - t], W = my > opp ? 1 : my < opp ? -1 : 0;
      const lus = res.lineups[t];
      for (const pid of lus.xi.concat(lus.bench)) {
        const s = res.playerStats[pid]; if (!s || s.minutes <= 0) continue;
        const p = state.players[pid], ro = TLM.roleOf(p.primaryPosition), share = Math.min(1, s.minutes / 90);
        let v = 6.0 + W * 0.3 * share + s.goals * 0.95 + s.assists * 0.55 + Math.min(1, s.shots * 0.05) + (ro === 'GK' ? s.saves * 0.14 + (s.cleanSheet ? 0.55 : 0) : 0) + (ro === 'DEF' ? (s.cleanSheet || opp === 0 ? 0.35 : -0.1 * opp) : 0) + s.tackles * 0.05 - s.yellow * 0.3 - s.red * 1.6 - (ro === 'GK' ? opp * 0.22 : 0);
        v += r.gauss() * (0.45 - (p.personality.consistency - 60) / 400);
        s.rating = +clamp(v, 3.5, 10).toFixed(1);
      }
    });
    void sides;
  }

  // ---- APLICAR RESULTADO (motor o simulador) ----
  function applyMatchResult(state, fixture, res) {
    const comp = state.competitions[fixture.competitionId], home = state.clubs[fixture.homeId], away = state.clubs[fixture.awayId];
    const clubs = [home, away];
    TLM.recordResult(state, fixture, res.score[0], res.score[1], { source: res.source });
    fixture.result.stats = { possession: res.possession, shots: res.shots, shotsOnTarget: res.shotsOnTarget };
    // estadísticas de jugadores + moral/forma/físico/lesiones/sanciones
    for (const pid in res.playerStats) {
      const s = res.playerStats[pid], p = state.players[pid]; if (!p) continue;
      const club = clubs[s.team], my = res.score[s.team], opp = res.score[1 - s.team];
      if (s.minutes > 0) {
        const t = p.seasonStats; t.matches++; if (s.start) t.starts++; t.minutes += s.minutes; t.goals += s.goals; t.assists += s.assists; t.shots += s.shots; t.saves += s.saves; t.yellow += s.yellow; t.red += s.red; t.tackles += s.tackles; t.fouls += s.fouls;
        if (s.cleanSheet) t.cleanSheets++; if (s.rating) { t.ratingSum += s.rating; t.ratingN++; p.form = clamp(p.form * 0.65 + (s.rating - 4) * 20 * 0.35, 0, 100); }
        const drop = s.staminaEnd != null ? (100 - s.staminaEnd) * 0.55 : s.minutes / 90 * (24 - (p.attributes.physical - 60) * 0.12);
        p.fitness = clamp(p.fitness - drop, 20, 100);
        p.morale = clamp(p.morale + (my > opp ? 3 : my < opp ? -3 : 0.3) + (s.goals ? 2.5 : 0) + (s.rating >= 8 ? 2 : 0), 0, 100);
        p.yellowAccum = (p.yellowAccum || 0) + s.yellow;
        if (p.yellowAccum >= 5) { p.suspension = 1; p.yellowAccum = 0; addNews(state, 'ban', `${p.canonicalName} (${club.name}) cumple una fecha de suspensión por acumulación de amarillas.`, { playerId: p.id }); }
        if (s.red) { p.suspension = Math.max(p.suspension, 1 + (s.rating < 4 ? 1 : 0)); addNews(state, 'ban', `${p.canonicalName} (${club.name}) es sancionado tras su expulsión.`, { playerId: p.id }); }
        p.played = true;
      } else { p.morale = clamp(p.morale - (p.overall >= 68 && club.lineup.xi.length ? 0.6 : 0.2), 0, 100); }
    }
    for (const inj of res.injuries || []) {
      const p = state.players[inj.pid]; if (!p) continue;
      const it = TLM.injure(state, p, inj.severity);
      if (it) { const lab = p.overall >= 70 ? `${p.canonicalName} (${state.clubs[p.clubId].name}) sufre ${it.name.toLowerCase()} y será baja ${it.matchdays} fecha${it.matchdays > 1 ? 's' : ''}.` : null; lab && addNews(state, 'injury', lab, { playerId: p.id }); }
    }
    // observaciones públicas (alimentan el informe del rival) — sólo datos que el partido produjo
    clubs.forEach((c, t) => { const ch = res.channels && res.channels[t]; c.observed.matches++; if (ch) { c.observed.channels.left += ch.left; c.observed.channels.center += ch.center; c.observed.channels.right += ch.right; } });
    // economía: entradas del local, premios por resultado
    const form = TLM.recentResults(state, comp, home.id, 3).reduce((a, x) => a + (x.res === 'W' ? 1 : x.res === 'L' ? -1 : 0), 0);
    const att = TLM.attendance(state, home, away, form), inc = round(att * TLM.ticketPrice(home));
    addTx(state, home, 'tickets', inc, `Entradas vs ${away.name} (${att.toLocaleString('es-AR')})`);
    fixture.result.attendance = att; fixture.result.income = inc;
    const prize = (c, s) => { const my = res.score[s], opp = res.score[1 - s]; const base = 80000 + c.reputation * 3500; if (my > opp) addTx(state, c, 'prize', base, 'Premio por victoria'); else if (my === opp) addTx(state, c, 'prize', round(base * 0.3), 'Premio por empate'); };
    clubs.forEach(prize);
    // reputación (lenta) y noticias
    clubs.forEach((c, t) => { const my = res.score[t], opp = res.score[1 - t]; c.reputation = clamp(c.reputation + (my > opp ? 0.06 : my < opp ? -0.05 : 0), 1, 100); });
    TLM.newsAfterMatch(state, fixture, res);
    fixture.result.top = topPerformer(res);
    return fixture;
  }
  function topPerformer(res) { let b = null; for (const pid in res.playerStats) { const s = res.playerStats[pid]; if (s.rating && (!b || s.rating > b.rating)) b = { pid, rating: s.rating }; } return b; }

  Object.assign(TLM, { simulateMatch, applyMatchResult, rateMatch: rate, topPerformer });
})(typeof globalThis !== 'undefined' ? globalThis : this);
