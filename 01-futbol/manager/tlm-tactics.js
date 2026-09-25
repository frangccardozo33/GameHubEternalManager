/* LFO MANAGER — TÁCTICA: alineación (XI + banquillo por hueco de formación), fuerza de equipo, plan de partido,
   ManagerMatchConfig (lo que consume el motor) y análisis del rival con datos reales (nunca inventa). */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { clamp, round, avg, R } = TLM;

  const ORDER = [0, 9, 8, 10, 1, 4, 2, 3, 5, 6, 7]; // GK primero, luego los huecos más escasos/definidos

  function slotScore(p, slotPos, prefer) {
    const c = TLM.compat(slotPos, p.primaryPosition, p.secondaryPositions);
    const fit = 0.86 + 0.14 * (p.fitness / 100);
    const form = 1 + (p.form - 50) / 500;
    return p.overall * c * fit * form + (prefer ? 2.5 : 0);
  }

  // Elige el mejor XI disponible para una formación. `prefer` = ids ya alineados (estabilidad del once).
  function pickXI(state, club, formation, prefer) {
    const slots = TLM.FORMATIONS[formation] || TLM.FORMATIONS['4-3-3'];
    const pool = club.squad.map((id) => state.players[id]).filter(TLM.isAvailable);
    const xi = Array(11).fill(null), used = new Set();
    for (const i of ORDER) {
      let best = null, bs = -1;
      for (const p of pool) {
        if (used.has(p.id)) continue;
        if ((slots[i] === 'POR') !== (p.primaryPosition === 'POR')) continue; // el arquero sólo va al arco y viceversa
        const s = slotScore(p, slots[i], prefer && prefer.includes(p.id));
        if (s > bs) { bs = s; best = p; }
      }
      if (best) { xi[i] = best.id; used.add(best.id); }
    }
    return xi;
  }

  function pickBench(state, club, xi, max) {
    max = max || TLM.DEFAULTS.maxBench;
    const inXI = new Set(xi.filter(Boolean));
    const rest = club.squad.map((id) => state.players[id]).filter((p) => TLM.isAvailable(p) && !inXI.has(p.id)).sort((a, b) => b.overall - a.overall);
    const bench = [];
    const take = (fn) => { const p = rest.find((x) => !bench.includes(x.id) && fn(x)); if (p) bench.push(p.id); };
    take((p) => p.primaryPosition === 'POR');
    take((p) => TLM.roleOf(p.primaryPosition) === 'DEF'); take((p) => TLM.roleOf(p.primaryPosition) === 'MID'); take((p) => TLM.roleOf(p.primaryPosition) === 'FWD');
    for (const p of rest) { if (bench.length >= max) break; if (!bench.includes(p.id) && p.primaryPosition !== 'POR') bench.push(p.id); }
    return bench.slice(0, max);
  }

  function autoLineup(state, club, formation) {
    if (formation) club.tactics.formation = formation;
    const f = club.tactics.formation;
    club.lineup.xi = pickXI(state, club, f, club.lineup.xi.filter(Boolean));
    club.lineup.bench = pickBench(state, club, club.lineup.xi);
    return club.lineup;
  }

  // Valida el once manual: quita a los no disponibles/ajenos y rellena esos huecos con el mejor disponible.
  function repairLineup(state, club) {
    const f = club.tactics.formation, slots = TLM.FORMATIONS[f];
    const ok = (id) => id && state.players[id] && state.players[id].clubId === club.id && TLM.isAvailable(state.players[id]);
    const seen = new Set();
    club.lineup.xi = club.lineup.xi.map((id) => { if (ok(id) && !seen.has(id)) { seen.add(id); return id; } return null; });
    if (club.lineup.xi.some((x) => !x)) {
      const auto = pickXI(state, club, f, club.lineup.xi.filter(Boolean));
      club.lineup.xi = club.lineup.xi.map((id, i) => id || (auto[i] && !seen.has(auto[i]) ? (seen.add(auto[i]), auto[i]) : null));
      // un jugador del auto puede ya estar en otro hueco: se completa con quien reste
      const pool = club.squad.map((id) => state.players[id]).filter((p) => TLM.isAvailable(p) && !seen.has(p.id));
      club.lineup.xi = club.lineup.xi.map((id, i) => {
        if (id) return id;
        const cand = pool.filter((p) => (slots[i] === 'POR') === (p.primaryPosition === 'POR')).sort((a, b) => slotScore(b, slots[i]) - slotScore(a, slots[i]))[0];
        if (cand) { seen.add(cand.id); pool.splice(pool.indexOf(cand), 1); return cand.id; }
        return null;
      });
    }
    club.lineup.bench = club.lineup.bench.filter((id) => ok(id) && !seen.has(id));
    if (club.lineup.bench.length < Math.min(TLM.DEFAULTS.maxBench, club.squad.length - 11)) {
      const extra = pickBench(state, club, club.lineup.xi).filter((id) => !club.lineup.bench.includes(id));
      club.lineup.bench = club.lineup.bench.concat(extra).slice(0, TLM.DEFAULTS.maxBench);
    }
    return club.lineup;
  }

  function setFormation(state, club, formation) {
    if (!TLM.FORMATIONS[formation]) return false;
    const prev = club.lineup.xi.filter(Boolean);
    club.tactics.formation = formation;
    club.lineup.xi = pickXI(state, club, formation, prev);
    club.lineup.bench = pickBench(state, club, club.lineup.xi);
    return true;
  }

  // Intercambia dos jugadores entre huecos/banquillo (uso del editor visual). ref = {xi:i} | {bench:i}
  function swapLineup(state, club, a, b) {
    const get = (r) => (r.xi != null ? club.lineup.xi[r.xi] : club.lineup.bench[r.bench]);
    const set = (r, v) => { if (r.xi != null) club.lineup.xi[r.xi] = v; else club.lineup.bench[r.bench] = v; };
    const va = get(a), vb = get(b);
    set(a, vb); set(b, va);
    club.lineup.bench = club.lineup.bench.filter(Boolean);
    club.lineupMode = 'manual';
    return club.lineup;
  }

  // ---- fuerza del equipo por líneas (con stats efectivos: moral, forma, entrenamiento) ----
  function lineRatings(state, club, xi) {
    xi = xi || club.lineup.xi;
    const slots = TLM.FORMATIONS[club.tactics.formation], parts = { atk: [], mid: [], def: [], gk: [] };
    xi.forEach((id, i) => {
      if (!id) { parts[i === 0 ? 'gk' : i < 5 ? 'def' : i < 8 ? 'mid' : 'atk'].push(38); return; }
      const p = state.players[id], s = TLM.effectiveStats(p, club), c = TLM.compat(slots[i], p.primaryPosition, p.secondaryPositions);
      const fit = 0.9 + 0.1 * (p.fitness / 100);
      const fam = TLM.FAMILY[slots[i]];
      const A = (s.shooting * 0.34 + s.dribbling * 0.24 + s.speed * 0.16 + s.passing * 0.14 + s.acceleration * 0.12) * c * fit;
      const M = (s.passing * 0.32 + s.intelligence * 0.24 + s.dribbling * 0.16 + s.physical * 0.14 + s.defense * 0.14) * c * fit;
      const D = (s.defense * 0.44 + s.physical * 0.2 + s.speed * 0.12 + s.intelligence * 0.16 + s.passing * 0.08) * c * fit;
      if (fam === 'gk') parts.gk.push((s.defense * 0.5 + s.intelligence * 0.25 + s.physical * 0.15 + s.acceleration * 0.1) * c * fit);
      else if (fam === 'cb' || fam === 'wb') { parts.def.push(D); if (fam === 'wb') parts.mid.push(M * 0.7); }
      else if (fam === 'dm') { parts.def.push(D * 0.7); parts.mid.push(M); }
      else if (fam === 'cm' || fam === 'wm') { parts.mid.push(M); parts.atk.push(A * 0.55); }
      else if (fam === 'am') { parts.mid.push(M * 0.8); parts.atk.push(A); }
      else parts.atk.push(A);
    });
    const r = { attack: avg(parts.atk), midfield: avg(parts.mid), defense: avg(parts.def), gk: avg(parts.gk) };
    r.overall = r.attack * 0.3 + r.midfield * 0.28 + r.defense * 0.28 + r.gk * 0.14;
    return r;
  }

  // ---- táctica del manager → parche de diales del motor (sólo diales que el motor usa) ----
  function toEnginePatch(t) {
    const M = TLM.ENGINE_MAP, out = {};
    out.mentality = M.mentality[t.mentality] || 'balanced';
    out.pressing = M.pressing[t.pressing] || 'medium';
    out.tempo = M.tempo[t.tempo] || 'normal';
    out.defensiveLine = M.line[t.line] || 'normal';
    out.attackingWidth = t.width === 'wide' ? 'wide' : t.width === 'narrow' ? 'narrow' : 'balanced';
    out.defensiveWidth = t.width === 'wide' ? 'wide' : t.width === 'narrow' ? 'narrow' : 'balanced';
    switch (t.buildUp) {
      case 'possession': Object.assign(out, { buildUp: 'short', passingRisk: 'safe', counterAttack: 'rare', longBallFrequency: 'rare' }); break;
      case 'direct': Object.assign(out, { buildUp: 'direct', longBallFrequency: 'frequent', counterAttack: 'situational' }); break;
      case 'counter': Object.assign(out, { buildUp: 'direct', counterAttack: 'frequent', longBallFrequency: 'frequent', attackingPlayers: 'minimal' }); break;
      default: Object.assign(out, { buildUp: 'mixed', passingRisk: 'balanced', counterAttack: 'situational', longBallFrequency: 'normal' });
    }
    return out;
  }

  // Plan de partido → lista de reglas {id, when, then}. Se traduce a triggers del motor (evaluateTriggers ya existente).
  const PLAN_WIN = { keep: null, protect: { mentality: 'defensive', tempo: 'slower', pressing: 'low', defensiveLine: 'deep', passingRisk: 'safe', shotRisk: 'conservative', timeWasting: 'on' }, control: { mentality: 'balanced', tempo: 'slower', buildUp: 'short', passingRisk: 'safe', counterAttack: 'rare' } };
  const PLAN_LOSE = { keep: null, push: { mentality: 'attacking', pressing: 'high', tempo: 'faster', defensiveLine: 'high' }, allout: { mentality: 'veryAttacking', pressing: 'allOut', defensiveLine: 'veryHigh', attackingPlayers: 'maximal', shotRisk: 'eager', passingRisk: 'risky' } };
  const PLAN_MIN = { keep: null, chase: { mentality: 'attacking', pressing: 'high' }, hold: { tempo: 'slower', defensiveLine: 'deep', passingRisk: 'safe' } };
  function planRules(plan) {
    const rules = [];
    if (PLAN_WIN[plan.ifWinning]) rules.push({ id: 'plan_win', kind: 'winning', minute: 0, then: PLAN_WIN[plan.ifWinning] });
    if (PLAN_LOSE[plan.ifLosing]) rules.push({ id: 'plan_lose', kind: 'losing', minute: 0, then: PLAN_LOSE[plan.ifLosing] });
    const fm = plan.fromMinute;
    if (fm && fm.mode === 'chase') rules.push({ id: 'plan_min_chase', kind: 'notWinning', minute: fm.minute, then: PLAN_MIN.chase });
    if (fm && fm.mode === 'hold') rules.push({ id: 'plan_min_hold', kind: 'winning', minute: fm.minute, then: PLAN_MIN.hold });
    return rules;
  }
  const PLAN_LABELS = {
    ifWinning: [['keep', 'Mantener'], ['protect', 'Proteger ventaja'], ['control', 'Controlar con la pelota']],
    ifLosing: [['keep', 'Mantener'], ['push', 'Adelantar líneas'], ['allout', 'Todo al ataque']],
    fromMinute: [['keep', 'Sin cambios'], ['chase', 'Buscar el gol si no ganamos'], ['hold', 'Cerrar el partido si ganamos']],
  };

  const INSTR = {
    FWD: [['', 'Sin instrucción'], ['false9', 'Falso 9'], ['target', 'Referencia'], ['attack', 'Profundidad']],
    MID: [['', 'Sin instrucción'], ['attack', 'Llegar al área'], ['roam', 'Libre'], ['hold', 'Cubrir']],
    WIDE: [['', 'Sin instrucción'], ['wide', 'Pegado a la banda'], ['inside', 'Cerrarse'], ['attack', 'Profundidad']],
  };
  function instructionOptions(pos) { return ['EI', 'ED', 'MI', 'MD'].includes(pos) ? INSTR.WIDE : TLM.roleOf(pos) === 'FWD' ? INSTR.FWD : TLM.roleOf(pos) === 'MID' ? INSTR.MID : null; }

  // Datos de la carta (mismo jugador global, con su edición y los colores de su club) para el sistema de cartas existente.
  // Los porteros no llevan la camiseta titular: se elige un color de portero que se distinga de los dos colores del club.
  const GK_KITS = ['#e8a33a', '#3aa76d', '#7b5cd6', '#d8563f', '#2fa4c9', '#d94fa0'];
  function hexRgb(h) { const n = parseInt(String(h).replace('#', '').padEnd(6, '0').slice(0, 6), 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function colorDist(a, b) { const x = hexRgb(a), y = hexRgb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); }
  function gkKit(club, p) {
    const avoid = club ? [club.primaryColor, club.secondaryColor] : [];
    const start = Math.floor(TLM.hash01('gkkit', p.id) * GK_KITS.length) % GK_KITS.length;
    for (let i = 0; i < GK_KITS.length; i++) { const c = GK_KITS[(start + i) % GK_KITS.length]; if (avoid.every((a) => colorDist(a, c) > 110)) return c; }
    return GK_KITS[start];
  }
  // Aspecto extra de la carta (cortes, barbas, accesorios, poses del módulo cardlook.js). Determinista por jugador: no consume el RNG del mundo.
  const LOOK = {
    hair: ['mohicano', 'afro', 'rulos', 'trenzas', 'rastas', 'melena', 'colita', 'mono', 'rodete', 'flequillo', 'jopo', 'undercut', 'degradado', 'engominado', 'raya', 'puas', 'media', 'taza', 'trencitas', 'corona'],
    beard: ['completa', 'corta', 'sombra', 'larga', 'vikinga', 'canosa', 'desprolija', 'candado', 'perilla', 'chivera', 'chivo', 'mosca', 'herradura', 'anclada', 'bigote', 'manubrio', 'fumanchu', 'mostacho', 'patillas', 'chuletas'],
    acc: ['vincha', 'vinchaancha', 'bandana', 'gorrolana', 'munequera', 'cadena', 'aros', 'snood', 'mascaranariz', 'pinturaojos', 'rodillera', 'mangalarga'],
    pose: ['cruzado', 'cintura', 'patada', 'cabezazo', 'punos', 'saludo', 'rodilla', 'gambeta', 'escudo'],
  };
  function lookOf(p) {
    const h = (k) => TLM.hash01('look', k, p.id), pick = (arr, k) => arr[Math.floor(h(k) * arr.length) % arr.length];
    const out = { hairStyle: p.card.hairStyle, beard: 'ninguna', acc: [], pose: p.card.pose };
    if (h('h') < 0.6) out.hairStyle = pick(LOOK.hair, 'h2');
    if (h('b') < 0.34) out.beard = pick(LOOK.beard, 'b2');
    if (h('a') < 0.16) out.acc = [pick(LOOK.acc, 'a2')];
    if (h('a3') < 0.05) out.acc.push('brazalete');
    if (p.primaryPosition === 'POR' && h('p') < 0.5) out.pose = 'atajada';
    else if (p.card.pose === 'retrato' && h('p') < 0.3) out.pose = pick(LOOK.pose, 'p2');
    return out;
  }
  function cardData(state, p) {
    const club = p.clubId ? state.clubs[p.clubId] : null;
    const gk = p.primaryPosition === 'POR', lk = lookOf(p);
    return { edition: p.card.edition, stars: p.card.stars, year: state.season, foot: p.card.foot, height: p.card.height, build: p.card.build, skin: p.card.skin, hair: p.card.hair, hairStyle: lk.hairStyle, beard: lk.beard, acc: lk.acc,
      pose: lk.pose, angle: p.card.angle, position: p.primaryPosition, club: club ? club.name : 'Agente libre', country: p.nationality, kit: gk ? gkKit(club, p) : club ? club.primaryColor : '#e7dfc5', accent: club ? club.secondaryColor : '#285f75' };
  }
  function playerPayload(state, club, p, slotIdx, slots) {
    const eff = TLM.effectiveStats(p, club);
    return {
      pid: p.id, name: shortName(p.canonicalName), fullName: p.canonicalName, number: p.number, slot: slotIdx, pos: slotIdx != null ? slots[slotIdx] : p.primaryPosition, primaryPosition: p.primaryPosition,
      role: TLM.roleOf(p.primaryPosition), stats: eff, personality: Object.assign({}, p.personality), heightM: p.card.height / 100, stamina: clamp(round(42 + p.fitness * 0.58), 30, 100),
      overall: p.overall, edition: p.card.edition, card: cardData(state, p),
      morale: p.morale, form: p.form,
    };
  }
  function shortName(n) { const parts = String(n).trim().split(/\s+/); return parts.length > 1 ? parts[0][0] + '. ' + parts.slice(1).join(' ') : n; }

  // ManagerMatchConfig de UN club (el partido se arma con dos).
  // Camiseta: patrón determinista por club y camiseta de arquero contrastada con ambos equipos.
  const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const cdist = (a, b) => { const x = hexRGB(a), y = hexRGB(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
  function pickGkColor(club, opp) {
    const pool = ['#1fa971', '#f2c94c', '#e2725b', '#7a5cff', '#20b8d6', '#ff7ab0'];
    let best = pool[0], bs = -1;
    for (const c of pool) { const sc = Math.min(cdist(c, club.primaryColor), opp ? cdist(c, opp.primaryColor) : 999, cdist(c, club.secondaryColor) * 0.8); if (sc > bs) { bs = sc; best = c; } }
    return best;
  }
  const kitPattern = (club) => ['stripes', 'band', 'sash', 'plain'][Math.floor(TLM.hash01(club.id, 'kit') * 4) % 4];
  function sideConfig(state, club, instructions, opp) {
    repairLineup(state, club);
    const f = club.tactics.formation, slots = TLM.FORMATIONS[f];
    const xi = club.lineup.xi.map((id, i) => (id ? playerPayload(state, club, state.players[id], i, slots) : null));
    const bench = club.lineup.bench.map((id) => playerPayload(state, club, state.players[id], null, slots));
    return {
      clubId: club.id, name: club.name, shortName: club.shortName, color: club.primaryColor, colorAlt: club.secondaryColor, crest: club.crest, controlledBy: club.controlledBy, kitPattern: kitPattern(club), gkColor: pickGkColor(club, opp),
      formation: f, mentality: club.tactics.mentality, buildUpStyle: club.tactics.buildUp, pressing: club.tactics.pressing, width: club.tactics.width, tempo: club.tactics.tempo, defensiveLine: club.tactics.line,
      enginePatch: toEnginePatch(club.tactics), matchPlan: TLM.clone(club.plan), planRules: planRules(club.plan),
      startingXI: xi, bench, playerInstructions: Object.assign({}, instructions || club.instructions || {}), substitutions: [], tacticalChanges: [], stadium: club.stadium.name,
    };
  }
  function buildMatchConfig(state, fixture) {
    const home = state.clubs[fixture.homeId], away = state.clubs[fixture.awayId];
    const lab = TLM.fixtureLabel ? TLM.fixtureLabel(state, fixture) : null;
    return { fixtureId: fixture.id, homeClubId: home.id, awayClubId: away.id, season: state.season, round: fixture.round, competition: state.competitions[fixture.competitionId].name, seed: (state.seed + fixture.round * 977 + state.transfers.length + (fixture.cup ? 5003 : 0)) >>> 0,
      roundLabel: lab ? lab.round : 'Jornada ' + fixture.round, cup: fixture.cup ? { id: fixture.cup.id, roundName: fixture.cup.roundName, pkg: lab.pkg } : null,
      home: sideConfig(state, home, null, away), away: sideConfig(state, away, null, home), stadium: home.stadium.name };
  }
  // Un once incompleto (usuario sin jugadores suficientes) no puede jugar.
  function lineupProblems(state, club) {
    repairLineup(state, club);
    const p = [];
    const n = club.lineup.xi.filter(Boolean).length;
    if (n < 11) p.push(`Tu once tiene ${n}/11 jugadores: fichá ${11 - n} más en el mercado.`);
    if (club.lineup.xi[0] && state.players[club.lineup.xi[0]].primaryPosition !== 'POR') p.push('Falta un portero.');
    return p;
  }

  // ---- Análisis del rival: sólo datos reales del universo (resultados, plantilla pública, observaciones de partidos) ----
  function rivalReport(state, comp, rivalId, observerId) {
    const rv = state.clubs[rivalId];
    const res = TLM.recentResults(state, comp, rivalId, 5), table = TLM.computeTable(state, comp);
    const row = table.find((x) => x.clubId === rivalId);
    const lr = lineRatings(state, rv);
    const notes = [];
    const key = rv.squad.map((id) => state.players[id]).filter((p) => TLM.isAvailable(p)).sort((a, b) => b.overall - a.overall).slice(0, 3).map((p) => ({ pid: p.id, name: p.canonicalName, pos: p.primaryPosition, ovr: p.overall, goals: p.seasonStats.goals }));
    const scorers = rv.squad.map((id) => state.players[id]).sort((a, b) => b.seasonStats.goals - a.seasonStats.goals).filter((p) => p.seasonStats.goals >= 3).slice(0, 2);
    const obs = rv.observed, tot = obs.channels.left + obs.channels.center + obs.channels.right;
    let tendency = null;
    if (obs.matches >= 3 && tot >= 12) {
      const L = obs.channels.left / tot, C = obs.channels.center / tot, Rr = obs.channels.right / tot;
      if (Rr > 0.42) notes.push('Ataca principalmente por la banda derecha.'); else if (L > 0.42) notes.push('Ataca principalmente por la banda izquierda.'); else if (C > 0.46) notes.push('Ataca sobre todo por el centro.');
      tendency = { left: L, center: C, right: Rr };
    } else notes.push('Datos insuficientes sobre por dónde ataca (menos de 3 partidos observados).');
    if (rv.tactics.pressing === 'high' || rv.tactics.pressing === 'extreme') notes.push('Utiliza presión alta.');
    if (rv.tactics.buildUp === 'counter') notes.push('Prefiere esperar y salir al contraataque.');
    for (const s of scorers) notes.push(`${s.canonicalName} ha marcado ${s.seasonStats.goals} goles esta temporada.`);
    if (!res.length) notes.push('Todavía no hay resultados recientes de este rival.');
    return { clubId: rivalId, name: rv.name, formation: rv.tactics.formation, formationConfidence: res.length ? 'probable' : 'estimada', style: { mentality: rv.tactics.mentality, buildUp: rv.tactics.buildUp, pressing: rv.tactics.pressing },
      last5: res, position: row ? row.pos : null, points: row ? row.points : null, ratings: { attack: round(lr.attack), midfield: round(lr.midfield), defense: round(lr.defense), gk: round(lr.gk) }, keyPlayers: key, notes, tendency, sample: obs.matches,
      injuries: rv.squad.map((id) => state.players[id]).filter((p) => p.injury).length };
  }

  Object.assign(TLM, { cardData, pickXI, pickBench, autoLineup, repairLineup, setFormation, swapLineup, lineRatings, toEnginePatch, planRules, PLAN_LABELS, instructionOptions, playerPayload, shortName, sideConfig, buildMatchConfig, lineupProblems, rivalReport, slotScore });
})(typeof globalThis !== 'undefined' ? globalThis : this);
