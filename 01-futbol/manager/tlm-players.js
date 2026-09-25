/* LFO MANAGER — JUGADORES: identidad global única, generación, valor/contrato, forma/moral/físico, lesiones,
   entrenamiento y progresión. Un jugador existe UNA sola vez por partida (playerId global); las ediciones/cromos
   son sólo representación (player.card) del MISMO registro deportivo. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { RNG, clamp, round, avg, nextId, roundMoney } = TLM;

  // RNG ligado al estado guardado (state.rngState) — sin estado global.
  function R(state) {
    if (!state._rng) {
      const r = new RNG(state.rngState >>> 0);
      Object.defineProperty(r, 's', { get() { return state.rngState; }, set(v) { state.rngState = v >>> 0; }, configurable: true });
      Object.defineProperty(state, '_rng', { value: r, enumerable: false, writable: true, configurable: true });
    }
    return state._rng;
  }

  const roleOf = (pos) => TLM.ROLE_OF[pos] || 'MID';

  function overall(attrs, pos) {
    const w = TLM.OVR_WEIGHTS[roleOf(pos)];
    let s = 0, t = 0;
    for (const k in w) { s += attrs[k] * w[k]; t += w[k]; }
    return Math.round(s / t);
  }

  function ageValueFactor(age) { return age <= 19 ? 1.5 : age <= 21 ? 1.35 : age <= 24 ? 1.15 : age <= 28 ? 1 : age === 29 ? 0.9 : age === 30 ? 0.78 : age === 31 ? 0.62 : age === 32 ? 0.48 : age === 33 ? 0.36 : 0.26; }

  function valueOf(p) {
    const base = Math.exp((p.overall - 50) * 0.17) * 80000;
    const pot = p.age <= 24 ? 1 + Math.max(0, p.potential - p.overall) * 0.035 : 1;
    return Math.max(25000, roundMoney(base * ageValueFactor(p.age) * pot));
  }
  const salaryOf = (p) => Math.max(30000, roundMoney(valueOf(p) * 0.09 + 20000));

  function recalc(p) {
    p.overall = overall(p.attributes, p.primaryPosition);
    p.potential = Math.max(p.potential, p.overall);
    p.marketValue = valueOf(p);
    return p;
  }

  function usedNames(state) { const s = new Set(); for (const id in state.players) s.add(state.players[id].canonicalName); return s; }

  function genName(state, used) {
    const r = R(state), N = TLM.NAMES;
    for (let i = 0; i < 40; i++) {
      const n = r.pick(N.first) + ' ' + r.pick(N.last);
      if (!used.has(n)) { used.add(n); return n; }
    }
    const n = r.pick(N.first) + ' ' + r.pick(N.last) + ' ' + r.int(2, 9); used.add(n); return n;
  }

  const SKIN = ['#f5cbb1', '#e3b38c', '#c6865d', '#8d5524', '#4a2c11'], HAIR = ['#231e18', '#3f2b21', '#211b18', '#6b4423', '#111'];

  // Nación del jugador: ficticia (assets/nations); más probable la del club donde se crea.
  const pickNation = (r, home) => (g.LFONations ? g.LFONations.pick(() => r.next(), home) : r.pick(TLM.NAMES.nations));
  // Guardados viejos usaban países reales: se pasan a la nación ficticia equivalente (y los clubes reciben la suya).
  function migrateNations(state) {
    const N = g.LFONations; if (!N) return false;
    let changed = false;
    for (const c of Object.values(state.clubs)) if (!c.nation) { c.nation = N.forClub(c.name) || (c.controlledBy === 'user' ? 'peronia' : N.get(N.legacy('?', c.id)).id); changed = true; }
    for (const p of Object.values(state.players)) if (!N.list.some((n) => n.name === p.nationality)) { p.nationality = N.legacy(p.nationality, p.id); changed = true; }
    return changed;
  }
    // makePlayer: crea el registro global. opts: {pos, ovr, age, clubId, name, nationality, seedName}
  function makePlayer(state, opts) {
    const r = R(state), pos = opts.pos, role = roleOf(pos);
    const age = opts.age != null ? opts.age : r.int(18, 34);
    const target = clamp(round(opts.ovr), 38, 96);
    const prof = TLM.STAT_PROFILE[role];
    const attrs = {};
    for (const k of TLM.STAT_KEYS) attrs[k] = clamp(round(target + prof[k] + r.gauss() * 4), 25, 99);
    // Reescalado: se ajusta hasta que la media por posición coincida con el objetivo (mismos pesos que la carta).
    for (let i = 0; i < 6; i++) {
      const d = target - overall(attrs, pos);
      if (!d) break;
      for (const k of TLM.STAT_KEYS) if (TLM.OVR_WEIGHTS[role][k]) attrs[k] = clamp(attrs[k] + d, 25, 99);
    }
    const personality = {};
    for (const k of TLM.PERS_KEYS) personality[k] = clamp(round(r.range(k === 'consistency' ? 30 : 20, k === 'consistency' ? 95 : 92)), 5, 99);
    const sec = [];
    const fam = TLM.POSITIONS.filter((q) => q !== pos && TLM.compat(q, pos) >= 0.86 && q !== 'POR');
    if (role !== 'GK' && fam.length && r.chance(0.55)) sec.push(r.pick(fam));
    const growth = age <= 21 ? r.range(4, 16) : age <= 24 ? r.range(1, 9) : age <= 27 ? r.range(0, 3) : 0;
    const height = clamp(round((role === 'GK' ? 187 : role === 'DEF' ? 182 : role === 'FWD' ? 179 : 176) + r.gauss() * 5 + (attrs.physical - 75) * 0.25), 165, 204);
    const p = {
      id: nextId(state, 'player', 'player'),
      canonicalName: opts.name || genName(state, opts._used || usedNames(state)),
      nationality: opts.nationality || pickNation(r, opts.nationHome),
      age, primaryPosition: pos, secondaryPositions: sec, attributes: attrs, personality,
      overall: overall(attrs, pos), potential: 0, marketValue: 0, salary: 0,
      contract: { clubId: null, salary: 0, endSeason: 0, status: 'free' },
      fitness: 100, morale: 65, form: 50, injury: null, suspension: 0,
      card: { edition: 'potrero', stars: 3, year: state.season, foot: r.chance(0.72) ? 'Derecho' : r.chance(0.7) ? 'Izquierdo' : 'Ambos', height, build: clamp(round(100 + r.gauss() * 3 + (attrs.physical - 75) * 0.15), 88, 116), skin: r.pick(SKIN), hair: r.pick(HAIR), hairStyle: r.pick(['corto', 'corto', 'rapado', 'largo']), pose: 'retrato', angle: r.int(-14, 14), photo: null },
      clubId: null, number: 0, joinedSeason: state.season,
      careerHistory: [], seasonStats: emptySeason(), careerTotals: emptySeason(),
    };
    p.potential = clamp(p.overall + Math.round(growth), p.overall, 96);
    recalc(p);
    p.salary = salaryOf(p);
    // Edición inicial: los muy buenos salen en una edición especial (mismo playerId; sólo cambia el cromo).
    const specials = TLM.EDITIONS.filter((e) => e.stars >= 4);
    if (p.overall >= 82 && r.chance(0.55)) { const e = r.pick(specials); p.card.edition = e.id; p.card.stars = e.stars; }
    else p.card.stars = p.overall >= 78 ? 4 : p.overall >= 66 ? 3 : 2;
    state.players[p.id] = p;
    return p;
  }

  function emptySeason() { return { matches: 0, starts: 0, minutes: 0, goals: 0, assists: 0, shots: 0, saves: 0, yellow: 0, red: 0, tackles: 0, fouls: 0, cleanSheets: 0, ratingSum: 0, ratingN: 0 }; }

  // ---- movimiento entre clubes: ÚNICO punto donde cambia clubId → un jugador nunca está en dos clubes ----
  function moveToClub(state, playerId, clubId, contract) {
    const p = state.players[playerId];
    if (!p) throw new Error('Jugador inexistente: ' + playerId);
    const from = p.clubId && state.clubs[p.clubId];
    if (from) {
      from.squad = from.squad.filter((id) => id !== playerId);
      if (from.lineup) { from.lineup.xi = from.lineup.xi.map((id) => (id === playerId ? null : id)); from.lineup.bench = from.lineup.bench.filter((id) => id !== playerId); }
    }
    if (p.clubId) closeHistoryStint(state, p);
    p.clubId = clubId;
    if (clubId) {
      const to = state.clubs[clubId];
      if (!to.squad.includes(playerId)) to.squad.push(playerId);
      p.contract = Object.assign({ clubId, salary: p.salary, endSeason: state.season + 2, status: 'active' }, contract || {}, { clubId });
      p.salary = p.contract.salary;
      p.number = assignNumber(state, to, p);
      p.joinedSeason = state.season;
      p.morale = clamp(p.morale + 6, 0, 100);
    } else {
      p.contract = { clubId: null, salary: 0, endSeason: 0, status: 'free' };
      p.number = 0;
    }
    return p;
  }

  function assignNumber(state, club, p) {
    const taken = new Set(club.squad.filter((id) => id !== p.id).map((id) => state.players[id].number));
    const pref = p.primaryPosition === 'POR' ? [1, 13, 25, 12] : ['DFC', 'LI', 'LD'].includes(p.primaryPosition) ? [4, 5, 3, 2, 6, 15, 16, 22] : ['MCD', 'MC', 'MP', 'MI', 'MD'].includes(p.primaryPosition) ? [8, 6, 10, 14, 5, 20, 21, 18] : [9, 11, 7, 10, 17, 19, 23, 24];
    for (const n of pref) if (!taken.has(n)) return n;
    for (let n = 2; n < 100; n++) if (!taken.has(n)) return n;
    return 99;
  }

  // Historial de carrera: se cierra el tramo con el club al cambiar de equipo o de temporada.
  function closeHistoryStint(state, p) {
    const s = p.seasonStats, club = state.clubs[p.clubId];
    if (!club) return;
    if (s.matches || s.minutes) {
      p.careerHistory.push({ season: state.season, clubId: p.clubId, club: club.name, matches: s.matches, goals: s.goals, assists: s.assists, minutes: s.minutes, yellow: s.yellow, red: s.red, rating: s.ratingN ? +(s.ratingSum / s.ratingN).toFixed(2) : null });
      for (const k in s) p.careerTotals[k] = (p.careerTotals[k] || 0) + s[k];
      p.seasonStats = emptySeason();
    }
  }

  // ---- stats efectivos para el partido: base + moral + forma + entrenamiento de equipo ----
  function effectiveStats(p, club) {
    const mm = clamp(round((p.morale - 60) / 15), -4, 3), fm = clamp(round((p.form - 50) / 25), -2, 2);
    const tb = (club && club.training && club.training.teamBoost) || 0, focus = club && club.training && club.training.team;
    const eff = TLM.TRAINING.teamEffect[focus] || [];
    const out = {};
    for (const k of TLM.STAT_KEYS) out[k] = clamp(round(p.attributes[k] + mm + fm + (eff.includes(k) ? tb : 0)), 20, 99);
    return out;
  }

  function isAvailable(p) { return !p.injury && !(p.suspension > 0); }

  const INJURIES = [
    { name: 'Golpe', d: [1, 2], w: 5 }, { name: 'Contractura', d: [1, 3], w: 4 }, { name: 'Esguince de tobillo', d: [2, 5], w: 3 },
    { name: 'Desgarro muscular', d: [4, 8], w: 2 }, { name: 'Rotura de ligamentos', d: [10, 20], w: 0.6 },
  ];
  function injure(state, p, severity) {
    const r = R(state);
    if (p.injury) return p.injury;
    const pool = INJURIES.filter((i) => severity > 0.75 ? i.d[0] >= 4 : severity > 0.4 ? i.d[1] <= 8 : i.d[1] <= 5);
    const t = r.weighted(pool.length ? pool : INJURIES, (i) => i.w);
    const md = r.int(t.d[0], t.d[1]);
    p.injury = { name: t.name, matchdays: md, total: md };
    p.morale = clamp(p.morale - 4, 0, 100);
    return p.injury;
  }

  // Tick por jornada: recuperación física, lesiones, sanciones. `played` = jugó esta jornada (fitness lo fija applyMatchResult).
  function weeklyRecovery(state, p, played) {
    if (p.injury) { p.injury.matchdays--; if (p.injury.matchdays <= 0) p.injury = null; }
    if (p.suspension > 0 && !played) p.suspension--;
    p.fitness = clamp(p.fitness + (played ? 18 : 30), 0, 100);
    // sin jugar minutos, el jugador con ovr alto se molesta un poco; los que juegan suben.
    if (!played && !p.injury && p.suspension <= 0) p.morale = clamp(p.morale - (p.overall >= 70 ? 0.8 : 0.3), 20, 100);
    p.morale += (65 - p.morale) * 0.04; // deriva a neutro
  }

  // ---- Entrenamiento individual: probabilidad pequeña por jornada de +1 en los atributos del foco ----
  function trainRound(state, club) {
    const r = R(state), f = club.training && club.training.individual, def = TLM.TRAINING.individual.find((t) => t[0] === f);
    if (!def) return [];
    const out = [];
    for (const id of club.squad) {
      const p = state.players[id];
      if (p.injury) continue;
      const isGK = p.primaryPosition === 'POR';
      if (f === 'goalkeeping' ? !isGK : isGK) continue; // el foco de portería sólo entrena porteros; el resto, sólo jugadores de campo
      const room = p.potential - p.overall;
      const ageF = p.age <= 21 ? 1.4 : p.age <= 25 ? 1 : p.age <= 29 ? 0.5 : 0.15;
      const chance = (room > 0 ? 0.05 : 0.008) * ageF * (1 + (p.personality.consistency - 60) / 200);
      if (r.chance(chance)) {
        const k = r.pick(def[2]);
        if (p.attributes[k] < 96) { p.attributes[k]++; const before = p.overall; recalc(p); out.push({ id, key: k, from: before, to: p.overall }); }
      }
    }
    // Entrenamiento de equipo: acumula bonus temporal (0..3), decae al cambiar de foco (lo gestiona setTraining).
    const tr = club.training;
    if (tr && tr.team) tr.teamBoost = Math.min(3, (tr.teamBoost || 0) + 0.25);
    return out;
  }

  // ---- Progresión de fin de temporada ----
  function seasonProgress(state, p) {
    const r = R(state);
    const a = p.age;
    const trend = a <= 20 ? 2.3 : a <= 22 ? 1.6 : a <= 24 ? 0.9 : a <= 28 ? 0.1 : a <= 31 ? -0.8 : a <= 33 ? -1.6 : -2.4;
    for (const k of TLM.STAT_KEYS) {
      const phys = k === 'speed' || k === 'acceleration' || k === 'physical';
      let d = r.gauss() * 0.9 + trend + (phys && a >= 28 ? -0.7 : 0) + (!phys && a >= 30 ? 0.3 : 0);
      if (p.overall >= p.potential && d > 0) d *= 0.25;
      p.attributes[k] = clamp(round(p.attributes[k] + d), 25, 99);
    }
    p.age++;
    recalc(p);
    if (p.age > 29) p.potential = p.overall;
  }

  Object.assign(TLM, { migrateNations, R, roleOf, overall, valueOf, salaryOf, recalc, makePlayer, moveToClub, assignNumber, closeHistoryStint, effectiveStats, isAvailable, injure, weeklyRecovery, trainRound, seasonProgress, usedNames, emptySeason, ageValueFactor });
})(typeof globalThis !== 'undefined' ? globalThis : this);
