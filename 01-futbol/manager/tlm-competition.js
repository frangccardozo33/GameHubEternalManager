/* LFO MANAGER — COMPETICIÓN: calendario todos-contra-todos para CUALQUIER cantidad de equipos (método del círculo),
   tabla calculada desde los resultados con desempates parametrizables, jornada actual y ciclo de temporada.
   Arquitectura compatible con futuras divisiones: una Competition es una entidad más (state.competitions). */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { nextId } = TLM;

  // Método del círculo. Devuelve rondas [[home, away]...] y byes. n impar → se agrega un "descanso" (null).
  // Las localías se reparten con un pase voraz: en cada partido se elige la orientación que menos alarga las rachas
  // seguidas de local/visita de ambos equipos (desempate: quien lleva menos partidos de local). La vuelta invierte la ida.
  function roundRobin(teamIds) {
    const teams = teamIds.slice();
    if (teams.length < 2) return { rounds: [], byes: [] };
    if (teams.length % 2) teams.push(null);
    const n = teams.length, rounds = [], byes = [];
    const arr = teams.slice(), streak = {}, homes = {};
    for (const t of teamIds) { streak[t] = 0; homes[t] = 0; } // streak>0: locales seguidos; <0: visitas seguidas
    for (let r = 0; r < n - 1; r++) {
      const round = []; let bye = null;
      const pairs = [];
      for (let i = 0; i < n / 2; i++) { const a = arr[i], b = arr[n - 1 - i]; if (a === null || b === null) { bye = a === null ? b : a; continue; } pairs.push([a, b]); }
      // primero los equipos con racha más larga: eligen antes su orientación
      pairs.sort((x, y) => Math.max(Math.abs(streak[y[0]]), Math.abs(streak[y[1]])) - Math.max(Math.abs(streak[x[0]]), Math.abs(streak[x[1]])));
      for (const [a, b] of pairs) {
        const cost = (h, v) => (streak[h] > 0 ? streak[h] + 1 : 1) ** 2 + (streak[v] < 0 ? -streak[v] + 1 : 1) ** 2 + (homes[h] - homes[v]) * 0.3;
        const [h, v] = cost(a, b) <= cost(b, a) ? [a, b] : [b, a];
        streak[h] = streak[h] > 0 ? streak[h] + 1 : 1; streak[v] = streak[v] < 0 ? streak[v] - 1 : -1; homes[h]++;
        round.push([h, v]);
      }
      if (bye !== null) streak[bye] = 0;
      rounds.push(round); byes.push(bye);
      arr.splice(1, 0, arr.pop()); // rota todo menos el primero
    }
    return { rounds, byes };
  }

  // Calendario completo. rounds=1 → solo ida; rounds=2 → ida y vuelta (la vuelta invierte localías).
  function buildSchedule(teamIds, rounds) {
    const base = roundRobin(teamIds);
    const out = [], byes = [];
    for (let leg = 0; leg < (rounds || 2); leg++) {
      base.rounds.forEach((mr, i) => {
        out.push(mr.map(([h, a]) => (leg % 2 ? [a, h] : [h, a])));
        byes.push(base.byes[i]);
      });
    }
    return { rounds: out, byes };
  }

  function createCompetition(state, cfg) {
    const c = {
      id: cfg.id || nextId(state, 'competition', 'comp'), name: cfg.name, country: cfg.country || null, crest: cfg.crest || null,
      teams: cfg.teams.slice(), leagueSize: cfg.teams.length, format: 'league', rounds: cfg.format.rounds,
      pointsForWin: cfg.format.pointsForWin, pointsForDraw: cfg.format.pointsForDraw, pointsForLoss: cfg.format.pointsForLoss,
      tieBreakRules: cfg.format.tieBreakRules.slice(), calendar: [], byes: [], activeSeason: state.season, status: 'ready', level: 1,
    };
    state.competitions[c.id] = c;
    return c;
  }

  // Genera (o regenera) los fixtures de la temporada activa. Los IDs son estables: fx_<season>_<round>_<n>.
  function generateSeason(state, comp) {
    for (const id in state.fixtures) if (state.fixtures[id].competitionId === comp.id && state.fixtures[id].season === comp.activeSeason) delete state.fixtures[id];
    const sch = buildSchedule(comp.teams, comp.rounds);
    comp.calendar = []; comp.byes = sch.byes;
    sch.rounds.forEach((mr, ri) => {
      const ids = [];
      mr.forEach(([h, a], n) => {
        const id = `fx_${comp.activeSeason}_${ri + 1}_${n + 1}`;
        state.fixtures[id] = { id, competitionId: comp.id, season: comp.activeSeason, round: ri + 1, homeId: h, awayId: a, status: 'scheduled', result: null };
        ids.push(id);
      });
      comp.calendar.push(ids);
    });
    comp.status = 'active';
    return comp;
  }

  const fixturesOf = (state, comp, round) => (comp.calendar[round - 1] || []).map((id) => state.fixtures[id]);
  const totalRounds = (comp) => comp.calendar.length;
  // Jornada actual = primera con partidos sin jugar (null si terminó la temporada).
  function currentRound(state, comp) {
    for (let r = 1; r <= comp.calendar.length; r++) if (fixturesOf(state, comp, r).some((f) => f.status !== 'played')) return r;
    return null;
  }
  const isSeasonOver = (state, comp) => currentRound(state, comp) === null;

  function recordResult(state, fixture, hg, ag, extra) {
    fixture.status = 'played';
    fixture.result = Object.assign({ hg, ag }, extra || {});
  }

  // ---- Tabla: derivada de los fixtures jugados (siempre consistente con los resultados) ----
  function computeTable(state, comp, uptoRound) {
    const rows = {};
    for (const t of comp.teams) rows[t] = { clubId: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0, form: [] };
    const played = [];
    for (let r = 1; r <= comp.calendar.length; r++) {
      if (uptoRound && r > uptoRound) break;
      for (const f of fixturesOf(state, comp, r)) if (f.status === 'played') played.push(f);
    }
    for (const f of played) {
      const h = rows[f.homeId], a = rows[f.awayId], { hg, ag } = f.result;
      if (!h || !a) continue;
      h.played++; a.played++; h.gf += hg; h.ga += ag; a.gf += ag; a.ga += hg;
      if (hg > ag) { h.won++; a.lost++; h.points += comp.pointsForWin; a.points += comp.pointsForLoss; h.form.push('W'); a.form.push('L'); }
      else if (hg < ag) { a.won++; h.lost++; a.points += comp.pointsForWin; h.points += comp.pointsForLoss; a.form.push('W'); h.form.push('L'); }
      else { h.drawn++; a.drawn++; h.points += comp.pointsForDraw; a.points += comp.pointsForDraw; h.form.push('D'); a.form.push('D'); }
    }
    for (const t in rows) rows[t].gd = rows[t].gf - rows[t].ga;
    const list = Object.values(rows);
    const nameOf = (id) => (state.clubs[id] ? state.clubs[id].name : id);
    // mini-tabla entre empatados para 'headToHead'
    const h2h = (ids) => {
      const m = {}; ids.forEach((i) => (m[i] = 0));
      for (const f of played) if (m[f.homeId] != null && m[f.awayId] != null) {
        const { hg, ag } = f.result;
        if (hg > ag) m[f.homeId] += comp.pointsForWin; else if (hg < ag) m[f.awayId] += comp.pointsForWin; else { m[f.homeId] += comp.pointsForDraw; m[f.awayId] += comp.pointsForDraw; }
      }
      return m;
    };
    const cmpBy = (rule, a, b, ctx) => {
      switch (rule) {
        case 'points': return b.points - a.points;
        case 'goalDifference': return b.gd - a.gd;
        case 'goalsFor': return b.gf - a.gf;
        case 'wins': return b.won - a.won;
        case 'headToHead': return (ctx.h2h[b.clubId] || 0) - (ctx.h2h[a.clubId] || 0);
        case 'name': return nameOf(a.clubId).localeCompare(nameOf(b.clubId));
        default: return 0;
      }
    };
    // ordena por bloques: primero por la 1ª regla; los empatados se desempatan con las siguientes (h2h sólo entre ellos)
    const sortGroup = (arr, rules) => {
      if (arr.length < 2 || !rules.length) return arr;
      const [rule, ...rest] = rules;
      if (rule === 'headToHead') {
        const m = h2h(arr.map((x) => x.clubId));
        const s = arr.slice().sort((a, b) => (m[b.clubId] || 0) - (m[a.clubId] || 0));
        return groupApply(s, (x) => m[x.clubId] || 0, rest, sortGroup);
      }
      const s = arr.slice().sort((a, b) => cmpBy(rule, a, b, {}));
      const key = { points: (x) => x.points, goalDifference: (x) => x.gd, goalsFor: (x) => x.gf, wins: (x) => x.won, name: (x) => nameOf(x.clubId) }[rule] || (() => 0);
      return groupApply(s, key, rest, sortGroup);
    };
    const groupApply = (sorted, key, rest, fn) => {
      const out = []; let i = 0;
      while (i < sorted.length) {
        let j = i; while (j + 1 < sorted.length && key(sorted[j + 1]) === key(sorted[i])) j++;
        const grp = sorted.slice(i, j + 1);
        out.push(...(grp.length > 1 ? fn(grp, rest) : grp)); i = j + 1;
      }
      return out;
    };
    const sorted = sortGroup(list, comp.tieBreakRules);
    sorted.forEach((row, i) => { row.pos = i + 1; row.form = row.form.slice(-5); });
    return sorted;
  }

  // Racha reciente de un club (últimos n resultados, del más antiguo al más reciente).
  function recentResults(state, comp, clubId, n) {
    const out = [];
    for (let r = 1; r <= comp.calendar.length; r++) for (const f of fixturesOf(state, comp, r)) {
      if (f.status !== 'played' || (f.homeId !== clubId && f.awayId !== clubId)) continue;
      const home = f.homeId === clubId, gf = home ? f.result.hg : f.result.ag, ga = home ? f.result.ag : f.result.hg;
      out.push({ round: r, opp: home ? f.awayId : f.homeId, home, gf, ga, res: gf > ga ? 'W' : gf < ga ? 'L' : 'D', fixtureId: f.id });
    }
    return out.slice(-(n || 5));
  }

  function nextFixtureFor(state, comp, clubId) {
    for (let r = 1; r <= comp.calendar.length; r++) for (const f of fixturesOf(state, comp, r)) if (f.status !== 'played' && (f.homeId === clubId || f.awayId === clubId)) return f;
    return null;
  }

  Object.assign(TLM, { roundRobin, buildSchedule, createCompetition, generateSeason, fixturesOf, totalRounds, currentRound, isSeasonOver, recordResult, computeTable, recentResults, nextFixtureFor });
})(typeof globalThis !== 'undefined' ? globalThis : this);
