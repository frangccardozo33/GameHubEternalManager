/* LFO MANAGER — NOTICIAS Y STUDIO ANALYSIS. Todo por plantillas deterministas (hash del partido) + reglas:
   sin IA generativa y sin inventar datos — cada frase sólo se emite si la condición se cumple con datos reales. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { hash01, addNews } = TLM;

  const pickT = (arr, seed) => arr[Math.floor(hash01(seed) * arr.length) % arr.length];
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] != null ? o[k] : ''));
  const T = (key, seed, o) => fmt(pickT(TXT[key], seed + key), o);

  const TXT = {
    hugeWin: ['{w} golea {a}-{b} a {l} y manda un mensaje al resto de la liga.', 'Paliza de {w}: {a}-{b} frente a {l}.', 'Sin discusión: {w} arrasa a {l} por {a}-{b}.'],
    upset: ['Sorpresa: {w} supera a {l} ({a}-{b}) pese a ser, sobre el papel, el equipo inferior.', '{w} da el golpe ante {l} con un {a}-{b} inesperado.'],
    derbyDraw: ['{h} y {aw} igualan {a}-{b} en un partido muy disputado.', 'Reparto de puntos entre {h} y {aw}: {a}-{b}.'],
    hattrick: ['¡Triplete! {p} marca tres goles para {c}.', '{p} firma un hat-trick con la camiseta de {c}.'],
    brace: ['{p} anota un doblete para {c}.', 'Doblete de {p}: {c} se lleva el partido.'],
    streakW: ['{c} suma {n} victorias consecutivas.', 'Racha ganadora: {c} ya encadena {n} triunfos.'],
    streakL: ['{c} acumula {n} derrotas seguidas y su técnico está en el centro de las críticas.', 'Mala racha para {c}: {n} partidos sin ganar consecutivos perdidos.'],
    unbeaten: ['{c} lleva {n} partidos sin perder.', 'Invicto de {c}: {n} jornadas sin conocer la derrota.'],
    debut: ['{p} ({age}) debuta con {c}.', 'Debut en primera para {p}, de {age} años, en {c}.'],
    formPlayer: ['{p} atraviesa un gran momento de forma en {c}.', '{p} viene en racha: nueva actuación destacada con {c}.'],
    leader: ['{c} se instala como líder de la tabla.', '{c} manda en la clasificación tras la jornada {r}.'],
  };

  function newsAfterMatch(state, fx, res) {
    const comp = state.competitions[fx.competitionId], H = state.clubs[fx.homeId], A = state.clubs[fx.awayId], [a, b] = res.score, seed = fx.id;
    const diff = Math.abs(a - b), W = a > b ? H : b > a ? A : null, L = a > b ? A : b > a ? H : null;
    if (W && diff >= 4) addNews(state, 'result', T('hugeWin', seed, { w: W.name, l: L.name, a: Math.max(a, b), b: Math.min(a, b) }), { fixtureId: fx.id });
    else if (W && W.reputation + 8 < L.reputation && diff >= 1) addNews(state, 'result', T('upset', seed, { w: W.name, l: L.name, a: Math.max(a, b), b: Math.min(a, b) }), { fixtureId: fx.id });
    else if (!W && a >= 3) addNews(state, 'result', T('derbyDraw', seed, { h: H.name, aw: A.name, a, b }), { fixtureId: fx.id });
    for (const pid in res.playerStats) {
      const s = res.playerStats[pid], p = state.players[pid], club = state.clubs[p.clubId];
      if (!club) continue;
      if (s.goals >= 3) addNews(state, 'player', T('hattrick', seed + pid, { p: p.canonicalName, c: club.name }), { playerId: pid });
      else if (s.goals === 2 && p.overall < 78) addNews(state, 'player', T('brace', seed + pid, { p: p.canonicalName, c: club.name }), { playerId: pid });
      if (p.seasonStats.matches === 1 && s.minutes > 0 && p.age <= 20 && p.careerHistory.length === 0) addNews(state, 'player', T('debut', seed + pid, { p: p.canonicalName, age: p.age, c: club.name }), { playerId: pid });
    }
    for (const pid in res.playerStats) {
      const p = state.players[pid], club = state.clubs[p.clubId]; if (!club || res.playerStats[pid].minutes <= 0) continue;
      if (p.form >= 84 && p.seasonStats.matches >= 4 && !p.formNews) { p.formNews = state.currentMatchday; addNews(state, 'player', T('formPlayer', seed + pid + 'f', { p: p.canonicalName, c: club.name }), { playerId: pid }); }
      else if (p.formNews && p.form < 70) p.formNews = 0;
    }
    for (const c of [H, A]) {
      const rec = TLM.recentResults(state, comp, c.id, 6);
      const run = (t) => { let n = 0; for (let i = rec.length - 1; i >= 0 && t(rec[i]); i--) n++; return n; };
      const w = run((x) => x.res === 'W'), l = run((x) => x.res === 'L'), u = run((x) => x.res !== 'L');
      if (w === 3 || w === 5) addNews(state, 'streak', T('streakW', seed + c.id, { c: c.name, n: w }), { clubId: c.id });
      else if (l === 3) addNews(state, 'streak', T('streakL', seed + c.id, { c: c.name, n: l }), { clubId: c.id });
      else if (u === 6) addNews(state, 'streak', T('unbeaten', seed + c.id, { c: c.name, n: u }), { clubId: c.id });
    }
    void comp;
  }

  // Noticia de líder cada 5 jornadas (llamada desde advance)
  function roundNews(state) {
    const comp = TLM.mainComp(state), r = (TLM.currentRound(state, comp) || comp.calendar.length + 1) - 1;
    if (r >= 3 && r % 5 === 0) { const t = TLM.computeTable(state, comp)[0]; addNews(state, 'table', T('leader', 'lead' + r, { c: state.clubs[t.clubId].name, r }), { clubId: t.clubId }); }
  }

  // ================== STUDIO ANALYSIS ENGINE (2 presentadores 3D: A analítico, B narrativo) ==================
  // Devuelve [['A'|'B', texto]]. Todas las frases dependen de datos reales del MatchResult o de la tabla.
  const S = {
    open: ['Bienvenidos al análisis. {h} y {aw} nos dejaron un {a}-{b}.', 'Terminó el partido en {st}: {h} {a}, {aw} {b}.'],
    winPos: ['{w} se quedó con los tres puntos y ahora es {pos}° en la tabla con {pts} unidades.', 'Con este triunfo, {w} sube al {pos}° puesto ({pts} puntos).'],
    drawPos: ['El empate deja a {c} en el {pos}° lugar, con {pts} puntos.'],
    lossPos: ['{l} cae al {pos}° puesto tras la derrota.', 'Duro golpe para {l}, que queda {pos}° en la clasificación.'],
    poss: ['{n} controló gran parte del encuentro con la pelota ({x}% de posesión).', 'El dominio de la posesión fue para {n}: {x}%.'],
    shotsDiff: ['El volumen ofensivo terminó siendo una de las claves del partido: {x} tiros de {n} contra {y}.', '{n} disparó {x} veces contra {y} del rival: se notó en el trámite.'],
    xg: ['Las ocasiones respaldan el resultado: xG {x} de {n} frente a {y}.', 'Según el xG, {n} generó más peligro ({x} a {y}).'],
    xgUnfair: ['Curioso: el xG favorecía a {n} ({x} a {y}) pero el marcador no lo reflejó.'],
    subGoal: ['El cambio desde el banquillo tuvo impacto inmediato: {p} marcó tras entrar.', '{p} salió del banco y anotó: el técnico acertó con el cambio.'],
    early: ['El gol temprano de {p} (min. {m}) condicionó el partido.', 'Muy pronto, en el {m}′, golpeó {p}.'],
    late: ['Y un final dramático: {p} marcó en el minuto {m}.', 'Tarde pero con premio: gol de {p} a los {m} minutos.'],
    comeback: ['Gran remontada de {w}: llegó a ir perdiendo y terminó ganando.', '{w} dio vuelta el partido: carácter de campeón.'],
    cards: ['Hubo {n} tarjeta{s} en el partido; el juego fue áspero por momentos.', 'Se repartieron {n} amarilla{s}: mucha fricción.'],
    red: ['La expulsión de {p} cambió el rumbo del partido.', 'Con la roja a {p}, {c} tuvo que replantear todo.'],
    save: ['{p} fue figura bajo los tres palos con {x} atajadas.', 'Gran partido del arquero {p}: {x} intervenciones.'],
    mvp: ['La figura del partido: {p}, con {r} de valoración.', '{p} ({r}) fue el mejor de la cancha según nuestros datos.'],
    goals: ['Goles de {list}.', 'Marcaron {list}.'],
    assist: ['Una asistencia de {p} para el tanto de {q}.'],
    formLine: ['{c} acumula {r} en sus últimos partidos.', 'La racha reciente de {c}: {r}.'],
    tightGame: ['Partido cerrado, con pocas ocasiones.', 'Encuentro trabado: apenas {x} tiros entre los dos.'],
    wild: ['Un partido de ida y vuelta con {x} goles.', '{x} goles: no hubo respiro para las defensas.'],
    subs: ['{c} hizo {n} cambio{s} y modificó su planteo.'],
    close: ['Eso es todo por hoy. Nos vemos en la próxima jornada.', 'Hasta la próxima fecha, con más análisis.'],
  };
  Object.assign(TXT, S);
  const FORMSTR = (rs) => rs.map((x) => ({ W: 'V', D: 'E', L: 'D' }[x.res])).join(' ');

  function studioAnalysis(state, fx, res) {
    const comp = state.competitions[fx.competitionId], H = state.clubs[fx.homeId], A = state.clubs[fx.awayId], seed = fx.id + '|studio', [a, b] = res.score, out = [];
    const table = TLM.computeTable(state, comp), pos = (id) => table.find((r) => r.clubId === id);
    const name = (pid) => (state.players[pid] ? state.players[pid].canonicalName : 'un jugador');
    const W = a > b ? H : b > a ? A : null, L = a > b ? A : b > a ? H : null;
    out.push(['A', T('open', seed, { h: H.name, aw: A.name, a, b, st: a + '-' + b })]);
    if (comp.format === 'cup') out.push(...TLM.cupStudioLines(state, fx, res));
    else if (W) { const r = pos(W.id); out.push(['B', T('winPos', seed, { w: W.name, pos: r.pos, pts: r.points })]); const lr = pos(L.id); if (Math.abs(lr.pos - r.pos) >= 0) out.push(['A', T('lossPos', seed, { l: L.name, pos: lr.pos })]); }
    else { const r = pos(H.id); out.push(['B', T('drawPos', seed, { c: H.name, pos: r.pos, pts: r.points })]); }
    if (res.possession && Math.max(...res.possession) >= 58) { const i = res.possession[0] > res.possession[1] ? 0 : 1; out.push(['A', T('poss', seed, { n: [H, A][i].name, x: res.possession[i] })]); }
    if (res.shots && Math.abs(res.shots[0] - res.shots[1]) >= 7) { const i = res.shots[0] > res.shots[1] ? 0 : 1; out.push(['B', T('shotsDiff', seed, { n: [H, A][i].name, x: res.shots[i], y: res.shots[1 - i] })]); }
    if (res.xg && Math.abs(res.xg[0] - res.xg[1]) >= 0.9) {
      const i = res.xg[0] > res.xg[1] ? 0 : 1, xgWon = W === [H, A][i];
      out.push(['A', T(xgWon ? 'xg' : 'xgUnfair', seed, { n: [H, A][i].name, x: res.xg[i].toFixed(1), y: res.xg[1 - i].toFixed(1) })]);
    }
    const gs = res.goalScorers || [];
    if (gs.length) {
      const first = gs[0], last = gs[gs.length - 1];
      if (first.minute <= 12) out.push(['B', T('early', seed, { p: name(first.pid), m: first.minute })]);
      if (last.minute >= 85 && gs.length > 1) out.push(['B', T('late', seed, { p: name(last.pid), m: last.minute })]);
      const sc = [0, 0]; let trailed = [false, false]; gs.forEach((x) => { sc[x.team]++; if (sc[0] < sc[1]) trailed[0] = true; if (sc[1] < sc[0]) trailed[1] = true; });
      if (W && trailed[W === H ? 0 : 1]) out.push(['A', T('comeback', seed, { w: W.name })]);
      const subIn = new Map((res.substitutions || []).map((s) => [s.inPid, s.minute]));
      const sg = gs.find((x) => subIn.has(x.pid) && x.minute >= subIn.get(x.pid)); if (sg) out.push(['A', T('subGoal', seed, { p: name(sg.pid) })]);
      const withAs = gs.find((x) => x.assistPid); if (withAs && gs.length <= 4) out.push(['B', T('assist', seed, { p: name(withAs.assistPid), q: name(withAs.pid) })]);
      const list = gs.map((x) => `${name(x.pid)} (${x.minute}′)`).join(', '); out.push(['B', T('goals', seed, { list })]);
    }
    const yc = (res.yellow || [0, 0]).reduce((x, y) => x + y, 0); if (yc >= 6) out.push(['A', T('cards', seed, { n: yc, s: yc > 1 ? 's' : '' })]);
    const rp = Object.values(res.playerStats).find((s) => s.red); if (rp) out.push(['A', T('red', seed, { p: name(rp.pid), c: state.clubs[state.players[rp.pid].clubId].name })]);
    const gkTop = Object.values(res.playerStats).filter((s) => s.saves >= 5).sort((x, y) => y.saves - x.saves)[0]; if (gkTop) out.push(['A', T('save', seed, { p: name(gkTop.pid), x: gkTop.saves })]);
    if (a + b <= 1 && res.shots && res.shots[0] + res.shots[1] < 14) out.push(['B', T('tightGame', seed, { x: res.shots[0] + res.shots[1] })]); else if (a + b >= 5) out.push(['B', T('wild', seed, { x: a + b })]);
    [H, A].forEach((c, i) => { const n = (res.substitutions || []).filter((s) => s.team === i).length; if (n >= 3) out.push(['B', T('subs', seed + i, { c: c.name, n, s: n > 1 ? 's' : '' })]); });
    const top = TLM.topPerformer(res); if (top) out.push(['B', T('mvp', seed, { p: name(top.pid), r: top.rating.toFixed(1) })]);
    const rec = TLM.recentResults(state, comp, W ? W.id : H.id, 5); if (rec.length >= 3 && comp.format !== 'cup') out.push(['A', T('formLine', seed, { c: (W || H).name, r: FORMSTR(rec) })]);
    out.push(['A', T('close', seed, {})]);
    return out;
  }

  // Previa: sólo contexto real de liga (posición, forma, bajas) — complementa el análisis táctico de TLB.
  function studioPre(state, fx) {
    const comp = state.competitions[fx.competitionId], H = state.clubs[fx.homeId], A = state.clubs[fx.awayId], table = TLM.computeTable(state, comp), out = [];
    const rh = table.find((r) => r.clubId === H.id), ra = table.find((r) => r.clubId === A.id);
    if (comp.format === 'cup') out.push(...TLM.cupPreLines(state, fx));
    else if (rh && rh.played) out.push(['A', `${H.name} llega ${rh.pos}° con ${rh.points} puntos; ${A.name}, ${ra.pos}° con ${ra.points}.`]);
    else out.push(['A', `Arranca la temporada para ${H.name} y ${A.name}: todo por escribirse.`]);
    for (const c of [H, A]) { const rec = TLM.recentResults(state, comp.format === 'cup' ? TLM.mainComp(state) : comp, c.id, 5); if (rec.length >= 2) out.push(['B', `Últimos resultados de ${c.name}: ${FORMSTR(rec)}.`]); }
    for (const c of [H, A]) { const inj = c.squad.map((id) => state.players[id]).filter((p) => p.injury && p.overall >= 66); if (inj.length) out.push(['B', `${c.name} tiene bajas por lesión: ${inj.slice(0, 2).map((p) => p.canonicalName).join(' y ')}.`]); }
    return out;
  }

  // Sólo el contexto de liga (posición, racha): lo suma el estudio 3D del broadcast a su análisis del partido.
  function studioLeagueLines(state, fx, res) {
    if (state.competitions[fx.competitionId].format === 'cup') return TLM.cupStudioLines(state, fx, res);
    const keep = ['winPos', 'drawPos', 'lossPos', 'formLine'], all = studioAnalysis(state, fx, res), seed = fx.id + '|studio', out = [];
    for (const [w, t] of all) if (keep.some((k) => S[k].some((tpl) => sameShape(tpl, t)))) out.push([w, t]);
    void seed; return out;
  }
  // ¿la frase t salió de la plantilla tpl? (compara las partes fijas de la plantilla)
  function sameShape(tpl, t) { return tpl.split(/\{\w+\}/).filter((x) => x.length > 6).every((frag) => t.includes(frag)); }

  Object.assign(TLM, { newsAfterMatch, roundNews, studioAnalysis, studioPre, studioLeagueLines });
})(typeof globalThis !== 'undefined' ? globalThis : this);
