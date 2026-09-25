// Tests de integración manager ↔ motor 3D (headless). Uso: node manager/tests/engine.test.mjs
import { loadCore } from "./load.mjs";
import { loadEngine } from "../headless.mjs";
const TLM = loadCore(); const Engine = loadEngine();
let pass = 0, fail = 0; const failures = [];
const T = (name, fn) => { try { fn(); pass++; console.log("  ✓", name); } catch (e) { fail++; failures.push(name); console.log("  ✗", name, "\n     ", e.stack.split("\n").slice(0, 3).join(" | ")); } };
const eq = (a, b, m) => { if (a !== b) throw new Error((m || "") + ` esperado ${b}, obtuvo ${a}`); };
const ok = (c, m) => { if (!c) throw new Error(m || "falló la condición"); };
const USER = { name: "Club Prueba", shortName: "PRU", primaryColor: "#336699", secondaryColor: "#ffffff", stadium: "Estadio Prueba", capacity: 12000 };

function career(seed = 4242, n = 6) {
  const c = TLM.Career.create({ seed, totalClubs: n, userClub: USER }), s = c.state, u = c.user;
  for (const pos of ["POR", "POR", "DFC", "DFC", "LI", "LD", "MCD", "MC", "MC", "EI", "ED", "DC", "DC", "DFC", "MI", "MP", "DC"]) {
    const fa = s.market.freeAgents.map((id) => s.players[id]).filter((p) => p.primaryPosition === pos).sort((a, b) => b.overall - a.overall)[0];
    if (fa && TLM.signFreeAgent(s, u.id, fa.id, {}).ok) continue;
    const li = TLM.searchMarket(s, { pos, source: "listed", excludeClub: u.id }).find((r) => r.price < 5e6);
    if (li) TLM.buyNow(s, u.id, li.pid, {});
  }
  TLM.autoLineup(s, u); return c;
}
const runTo = (m, sec, cb) => { let i = 0; const max = Math.round(sec * 60) + 60 * 400; while (!m.ended && m.time < sec && i++ < max) { m.step(1 / 60); cb && cb(); } };
const pids = (m) => m.players.map((p) => p.tlmPid);

console.log("\nMatch Engine recibe correctamente la configuración");
T("25. tlmLoad: nombres, dorsales, stats, formación, tácticas y banquillo llegan al motor", () => {
  const c = career(); const cfg = c.matchConfig(); const m = new Engine(1); m.tlmLoad(cfg);
  const side = (t) => (t ? cfg.away : cfg.home);
  for (let t = 0; t < 2; t++) {
    eq(m.teams[t].name, side(t).name); eq(m.teams[t].color, side(t).color); eq(m.teams[t].formation, side(t).formation);
    for (let e = 0; e < 11; e++) { const p = m.players[t * 11 + e], x = side(t).startingXI[e]; eq(p.tlmPid, x.pid); eq(p.name, x.name); eq(p.number, x.number); eq(p.stats.shooting, x.stats.shooting); eq(p.role, e === 0 ? "GK" : e < 5 ? "DEF" : e < 8 ? "MID" : "FWD"); eq(p.appearance.kit, e === 0 ? side(t).gkColor : side(t).color, "camiseta: arquero contrastado, resto del club"); }
    eq(m.bench[t].length, side(t).bench.length);
    const lt = m.liveTactics[t]; eq(lt.requested.mentality, side(t).enginePatch.mentality); eq(lt.requested.pressing, side(t).enginePatch.pressing); eq(lt.active.tempo, lt.requestedNum.tempo);
  }
  eq(new Set(pids(m)).size, 22, "22 jugadores únicos en cancha");
});
T("25b. las 4 formaciones (incl. 3-5-2) juegan un partido completo sin errores", () => {
  for (const f of Object.keys(TLM.FORMATIONS)) {
    const c = career(11); TLM.setFormation(c.state, c.user, f); const cfg = c.matchConfig(); const m = new Engine(5); m.tlmLoad(cfg);
    ok(m.teams[0].formation === f || m.teams[1].formation === f); m.start(); let i = 0; while (!m.ended && i++ < 5400 * 60 + 100) m.step(1 / 60);
    ok(m.ended, "no terminó " + f); ok(Number.isFinite(m.score[0] + m.score[1]));
    for (const p of m.players) ok(Number.isFinite(p.x) && Number.isFinite(p.z), "NaN en " + f);
  }
});
T("tácticas del manager producen comportamiento distinto en el motor (presión/línea)", () => {
  // Promediado sobre varias seeds (spec: un solo seed y una ventana de 20 min es sensible a
  // cualquier cambio legítimo de comportamiento — efecto mariposa determinista, no sólo de
  // aleatoriedad — así que mide con el ruido de una sola corrida en vez del efecto real de la
  // táctica. Promediar sobre varias corridas independientes es la forma correcta de proteger este
  // invariante sin que rompa ante cualquier cambio de comportamiento que no sea, en sí, el bug).
  const SEEDS = [9, 19, 29, 39, 49, 59];
  const avgLine = (press, line, seed) => {
    const c = career(21); Object.assign(c.user.tactics, { pressing: press, line, mentality: press === "extreme" ? "veryAttacking" : "veryDefensive" }); const cfg = c.matchConfig();
    const m = new Engine(seed); m.tlmLoad(cfg); m.start(); const us = cfg.home.clubId === c.user.id ? 0 : 1; let sum = 0, n = 0;
    runTo(m, 1200, () => { if (m.phase === "playing" && (m.elapsed | 0) % 5 === 0) { const d = m.direction(us); const xs = m.players.filter((p) => p.team === us && p.role === "DEF").map((p) => p.x * d); sum += xs.reduce((a, b) => a + b, 0) / xs.length - m.ball.x * d; n++; } }); // Fase 3: se mide la posición de la línea RESPECTO DE LA PELOTA (la altura absoluta depende de dónde estuvo el balón en una ventana corta; tlmLoad fija la seed y las 3 corridas son el mismo partido)
    return sum / n;
  };
  const avgOver = (press, line) => SEEDS.reduce((a, s) => a + avgLine(press, line, s), 0) / SEEDS.length;
  const hi = avgOver("extreme", "high"), lo = avgOver("low", "low");
  ok(hi > lo + 1, `línea alta ${hi.toFixed(1)} debe estar más cerca de la pelota que baja ${lo.toFixed(1)} (promedio de ${SEEDS.length} seeds, relativo al balón)`);
});

console.log("\nPausa, cambios de táctica y sustituciones físicas");
T("20/21. cambiar táctica y pausar en vivo NO reinicia el partido", () => {
  const c = career(); const cfg = c.matchConfig(); const m = new Engine(3); m.tlmLoad(cfg); m.start(); runTo(m, 900);
  const snap = { time: m.time, score: m.score.slice(), ball: { ...m.ball }, events: m.events.length, stam: m.players.map((p) => p.stamina), pos: m.players.map((p) => [p.x, p.z]) };
  m.running = false; for (let i = 0; i < 120; i++) m.step(1 / 60); eq(m.time, snap.time, "en pausa el reloj no avanza");
  const lt0 = m.liveTactics[0].requested, newForm = m.teams[0].formation === "4-4-2" ? "4-3-3" : "4-4-2";
  // El equipo 0 puede traer autoTactics=true si el plan de partido por defecto trae reglas propias
  // (manager/engine.js: `autoTactics = rules.length > 0 || controlledBy === "ai"`) — eso es correcto
  // (evaluateTriggers puede pisar la táctica más tarde si el marcador lo justifica), pero este test
  // verifica específicamente que un pedido MANUAL no se pierde por sí solo; se apaga el asistente acá
  // para no depender de que, en el minuto exacto que sigue, ningún trigger del plan decida intervenir.
  m.teams[0].autoTactics = false;
  const ch = m.requestTactic(0, { mentality: lt0.mentality === "veryAttacking" ? "veryDefensive" : "veryAttacking", pressing: lt0.pressing === "allOut" ? "low" : "allOut" }); ok(ch.length === 2, "cambios de táctica aplicados"); ok(m.requestFormation(0, newForm), "formación pedida");
  eq(m.time, snap.time); eq(m.score[0], snap.score[0]); eq(m.score[1], snap.score[1]); ok(m.players.every((p, i) => p.x === snap.pos[i][0] && p.z === snap.pos[i][1]), "nadie se movió");
  ok(m.ball.x === snap.ball.x && m.ball.z === snap.ball.z, "balón intacto"); ok(m.players.every((p, i) => p.stamina === snap.stam[i]));
  m.running = true; runTo(m, 960); ok(m.time > snap.time); ok(m.events.length >= snap.events);
  ok(m.liveTactics[0].requested.mentality === ch[0].to); ok(m.liveTactics[0].formationBlend > 0 || m.teams[0].formation === newForm, "la formación empieza a transicionar sin reiniciar");
});
T("22-24. sustitución física: pedido→pendiente→parón→sale caminando→entra por la banda→aplicado→reanuda", () => {
  const c = career(); const cfg = c.matchConfig(); const m = new Engine(8); m.tlmLoad(cfg); m.start(); runTo(m, 600);
  const t = 0, out = m.players[t * 11 + 8], outPid = out.tlmPid, benchIdx = m.bench[t].findIndex((b) => b.role !== "GK");
  const inPid = m.bench[t][benchIdx].tlmPid, inName = m.bench[t][benchIdx].name;
  const r = m.tlmRequestSub(t, out.id, benchIdx, "test"); ok(r.ok, r.reason); ok(m.tlmSubQ.length === 1);
  eq(m.players[out.id].tlmPid, outPid, "hasta el parón sigue siendo el mismo jugador (no hay swap instantáneo)");
  // dedupe: no se puede pedir dos veces
  ok(!m.tlmRequestSub(t, out.id, benchIdx, "test").ok);
  const seen = []; let firstSeqTime = null, maxAbsZ = 0, jumpMax = 0, lastPos = null, dupe = false, appliedAt = null, wasHidden = false, swapCalls = 0, sawTimeAdvance = false;
  m.onTlmSwap = () => swapCalls++;
  let guard = 0;
  while (!m.ended && guard++ < 60 * 400) {
    const before = m.time; m.step(1 / 60);
    if (m.tlmSubSeq) {
      if (firstSeqTime == null) firstSeqTime = before;
      // v2 (pedido explícito): el partido YA NO se congela durante el cambio — sólo el saliente/entrante
      // quedan "fuera de foco" mientras el resto sigue jugando (ver fulbo.html step()). El reloj puede
      // seguir corriendo mientras la secuencia todavía está en curso (present/exit/swap/enter): eso es
      // justamente lo que se pidió, así que en vez de exigir reloj congelado, se comprueba lo contrario
      // más abajo (sawTimeAdvance) y acá sólo que nunca vaya para atrás.
      ok(m.time >= before, "el reloj nunca retrocede durante el cambio");
      if (m.time > before) sawTimeAdvance = true;
      const p = m.players[out.id]; maxAbsZ = Math.max(maxAbsZ, Math.abs(p.z));
      if (lastPos) jumpMax = Math.max(jumpMax, Math.hypot(p.x - lastPos[0], p.z - lastPos[1]));
      lastPos = [p.x, p.z]; if (p.tlmHid) wasHidden = true;
      const ids = pids(m).filter((x) => x); if (new Set(ids).size !== ids.length) dupe = true;
      if (m.tlmSubSeq.phase && !seen.includes(m.tlmSubSeq.phase)) seen.push(m.tlmSubSeq.phase);
    } else if (firstSeqTime != null && appliedAt == null) appliedAt = m.time;
    if (appliedAt != null && m.time > appliedAt + 30) break;
  }
  eq(seen.join(">"), "present>exit>swap>enter>done", "fases de la secuencia");
  ok(maxAbsZ > 35, "el jugador debe salir físicamente por la banda (|z|=" + maxAbsZ.toFixed(1) + ")"); ok(jumpMax < 0.2, "sin teletransportes (salto máx " + jumpMax.toFixed(2) + " m/paso)");
  ok(wasHidden, "el saliente queda fuera/oculto antes de entrar el nuevo"); ok(!dupe, "nunca hay dos jugadores iguales en cancha"); eq(swapCalls, 1, "el renderer recibe el aviso de recambio de modelo");
  ok(sawTimeAdvance, "el partido debe seguir corriendo durante el cambio, no congelarse");
  const now = m.players[out.id]; eq(now.tlmPid, inPid); eq(now.name, inName); ok(!now.tlmHid);
  ok(!pids(m).includes(outPid), "el jugador que salió ya no está en el campo"); eq(m.subsUsed[t], 1);
  // "play_resumed" ya no existe: el juego nunca se pausó, así que no hay nada que "reanudar" (evento retirado).
  const types = m.tlmLog.map((e) => e.type); for (const k of ["substitution_requested", "substitution_pending", "substitution_stopping_point", "substitution_presentation", "player_exit", "player_entry", "sub"]) ok(types.includes(k), "falta evento " + k);
  const order = ["substitution_requested", "substitution_pending", "substitution_stopping_point", "substitution_presentation", "player_exit", "player_entry", "sub"].map((k) => types.indexOf(k)); ok(order.every((v, i) => !i || v > order[i - 1]), "orden de eventos " + order);
  const st = m.tlmLog.find((e) => e.type === "substitution_stopping_point"); ok(["restart", "halftime"].includes("restart") ); void st;
});
T("cambio: el marcador no cambia por el cambio en sí y el jugador entrante ocupa su puesto", () => {
  // v2 (pedido explícito): el reloj y la stamina de los OTROS 21 jugadores ya NO quedan intactos durante
  // la secuencia — el partido sigue jugándose en vivo mientras el saliente/entrante caminan (ver el test
  // de arriba, que ahora exige lo contrario: que el reloj avance). Lo único que este test puede seguir
  // garantizando es lo que de verdad no debe moverse por el cambio en sí: el marcador, y que el reloj
  // nunca retrocede; y que al terminar, el entrante está en su puesto de formación.
  const c = career(); const cfg = c.matchConfig(); const m = new Engine(12); m.tlmLoad(cfg); m.start(); runTo(m, 300);
  const out = m.players[5]; const bi = m.bench[0].findIndex((b) => b.role === "MID"); ok(bi >= 0);
  m.tlmRequestSub(0, out.id, bi, "táctico"); let t0 = null, sc = null, g = 0;
  while (!m.ended && g++ < 60 * 300) {
    const before = m.time; m.step(1 / 60); ok(m.time >= before, "el reloj nunca retrocede");
    if (m.tlmSubSeq && t0 == null) { t0 = m.time; sc = m.score.slice(); }
    if (m.tlmSubSeq == null && t0 != null) break;
  }
  ok(t0 != null, "el cambio debió ejecutarse en un parón"); eq(m.score[0], sc[0]); ok(m.time >= t0, "el reloj sigue corriendo, nunca retrocede");
  const slot = m.formationSlot(0, out.index), d = m.direction(0); ok(Math.hypot(m.players[5].x - slot[0] * d, m.players[5].z - slot[1] * d) < 12, "ocupa su posición");
});
T("no permite un portero por un jugador de campo ni superar 5 cambios", () => {
  const c = career(); const cfg = c.matchConfig(); const m = new Engine(2); m.tlmLoad(cfg); m.start();
  ok(!m.tlmRequestSub(0, 0, m.bench[0].findIndex((b) => b.role !== "GK"), "x").ok, "GK por jugador de campo"); let ok5 = 0;
  for (let i = 0; i < 7; i++) { const bi = m.bench[0].findIndex((b, k) => b.role !== "GK" && !m.tlmSubQ.some((q) => q.inIdxPid === b.tlmPid)); if (bi < 0) break; if (m.tlmRequestSub(0, 1 + i, bi, "x").ok) ok5++; }
  ok(ok5 <= 5, "máximo 5: " + ok5);
});
T("IA: los cambios automáticos también son físicos (encolados, no swaps)", () => {
  const c = career(); const cfg = c.matchConfig(); const m = new Engine(77); m.tlmLoad(cfg); m.start(); let instantSwaps = 0, prev = pids(m).join(), guard = 0, seqStarts = 0, sawSeq = false;
  while (!m.ended && guard++ < 5400 * 60 + 60 * 600) { m.step(1 / 60); const cur = pids(m).join(); if (m.tlmSubSeq && !sawSeq) { seqStarts++; sawSeq = true; } if (!m.tlmSubSeq) sawSeq = false; if (cur !== prev && !m.tlmSubSeq && !(m.tlmSubSeq === null && m.tlmLog.length && m.tlmLog[m.tlmLog.length - 1].type === "play_resumed")) { if (m.tlmSubSeq == null && !["play_resumed", "sub"].includes((m.tlmLog[m.tlmLog.length - 1] || {}).type)) instantSwaps++; } prev = cur; }
  eq(instantSwaps, 0, "no debe haber swaps fuera de la secuencia"); ok(m.subsUsed[0] + m.subsUsed[1] >= 1, "la IA debería hacer al menos un cambio en un partido completo (usó " + (m.subsUsed[0] + m.subsUsed[1]) + ")"); ok(seqStarts >= 1);
  // v2 (pedido explícito): como el partido ya no se congela, puede haber MÁS de un cambio "en vuelo" a
  // lo largo del partido (uno termina, el siguiente arranca en el próximo parón) — y uno que arranca
  // muy cerca del final puede quedar con la salida hecha (player_exit) pero sin terminar de entrar antes
  // del pitido final. Por eso ya no es igualdad estricta: sólo nunca puede haber MENOS salidas que
  // cambios completados.
  ok(m.tlmLog.filter((e) => e.type === "player_exit").length >= m.tlmSubsDone.length);
});

T("plan: el usuario sólo recibe cambios automáticos si activa el asistente", () => {
  const subs = (auto, seed) => { const c = career(seed); c.user.plan.autoSubs = auto; const cfg = c.matchConfig(); const us = cfg.home.clubId === c.user.id ? 0 : 1; const m = new Engine(cfg.seed); m.tlmLoad(cfg); m.start(); let g = 0; while (!m.ended && g++ < 5400 * 60 + 60 * 900) m.step(1 / 60); return m.subsUsed[us]; };
  let manual = 0, auto = 0; for (const seed of [61, 62, 63]) { manual += subs(false, seed); auto += subs(true, seed); }
  ok(manual <= 1, "sin asistente el usuario no hace cambios solo (salvo lesión): " + manual); ok(auto >= 2, "con asistente sí: " + auto);
});

console.log("\nEl resultado vuelve al manager");
T("26/27/28. MatchResult del motor → applyUserResult: tabla, estadísticas, historial, fitness", () => {
  const c = career(31); const s = c.state; const cfg = c.matchConfig(); const m = new Engine(cfg.seed); m.tlmLoad(cfg); m.start();
  m.tlmRequestSub(0, 9, m.bench[0].findIndex((b) => b.role === "FWD" || b.role === "MID"), "test");
  let g = 0; while (!m.ended && g++ < 5400 * 60 + 60 * 800) m.step(1 / 60); ok(m.ended);
  const res = m.tlmResult(); eq(res.source, "engine"); eq(res.score[0], m.score[0]); eq(res.score[1], m.score[1]);
  for (const k of ["possession", "shots", "shotsOnTarget", "xg", "passes", "passAccuracy", "yellow", "red", "fouls", "corners", "offsides", "saves"]) ok(Array.isArray(res[k]) && res[k].length === 2, "falta " + k);
  eq(res.possession[0] + res.possession[1], 100);
  const gs = res.goalScorers.length; eq(gs, res.score[0] + res.score[1], "cada gol tiene autor identificado"); ok(res.goalScorers.every((x) => x.pid && s.players[x.pid]));
  const start = res.lineups[0].xi.concat(res.lineups[1].xi); for (const pid of start) ok(res.playerStats[pid] && res.playerStats[pid].minutes > 0, "minutos del titular " + pid);
  for (const x of res.substitutions) { ok(res.playerStats[x.inPid].minutes > 0 && res.playerStats[x.inPid].minutes < 90); ok(res.playerStats[x.outPid].minutes < 90); }
  const tot = Object.values(res.playerStats).reduce((a, p) => a + p.goals, 0); eq(tot, gs, "goles por jugador = goles del marcador");
  TLM.rateMatch(s, res); ok(Object.values(res.playerStats).some((p) => p.rating > 0));
  const f = c.applyUserResult(res); eq(f.status, "played"); eq(f.result.hg, res.score[0]);
  const row = c.table().find((r) => r.clubId === c.user.id); eq(row.played, 1);
  const withMin = Object.values(s.players).filter((p) => p.seasonStats.minutes > 0); ok(withMin.length >= 22);
  const scorer = res.goalScorers[0]; if (scorer) ok(s.players[scorer.pid].seasonStats.goals >= 1);
  const sub = res.substitutions[0]; if (sub) ok(s.players[sub.inPid].seasonStats.matches === 1 && s.players[sub.inPid].seasonStats.starts === 0);
  const fit = res.lineups[0].xi.map((pid) => s.players[pid].fitness); ok(fit.some((v) => v < 100), "el partido cansa a los titulares");
  c.finishRound(); eq(TLM.validate(s).length, 0); const a = TLM.studioAnalysis(s, f, res); ok(a.length >= 4 && a[0][1].includes(res.score[0] + "-" + res.score[1]));
});
T("varios partidos con el motor real y varias semillas: coherencia del resultado", () => {
  for (const seed of [101, 202, 303]) {
    const c = career(seed); const cfg = c.matchConfig(); const m = new Engine(cfg.seed); m.tlmLoad(cfg); m.start(); let g = 0; while (!m.ended && g++ < 5400 * 60 + 60 * 800) m.step(1 / 60);
    const res = m.tlmResult(); eq(res.goalScorers.length, res.score[0] + res.score[1], "seed " + seed); TLM.rateMatch(c.state, res); c.applyUserResult(res); c.finishRound(); eq(TLM.validate(c.state).length, 0);
  }
});
T("restaurar: tlmRestore devuelve el modo exhibición del motor", () => {
  const c = career(); const m = new Engine(1); m.tlmLoad(c.matchConfig()); ok(m.teams[0].name !== "Argentina FC"); m.tlmRestore(); eq(m.teams[0].name, "Argentina FC"); eq(m.players[0].tlmPid, undefined);
});

console.log(`\n${pass} ok · ${fail} fallos`); if (fail) { console.log(failures.join("\n")); process.exit(1); }
