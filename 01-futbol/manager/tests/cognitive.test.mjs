// Escenarios de diferenciación cognitiva (prompt "Fase 2 — Reconstrucción conductual", Fase 38/47/49):
// evidencia de que dos jugadores con atributos muy distintos, en la MISMA geometría/situación,
// perciben y deciden distinto — no sólo ejecutan con distinto % de éxito.
//
// A diferencia de manager/tests/scenarios.test.mjs (que muestrea partidos completos porque el motor
// no tiene forma de fabricar una jugada aislada con precisión milimétrica), acá sí se puede probar
// una decisión puntual de forma controlada: ai2Perceive()/ai2PassCandidates() son funciones puras
// sobre el estado actual del partido, así que alcanza con fijar posiciones y llamarlas directo —
// no hace falta simular físicas ni fases de juego.
//
// Uso: node manager/tests/cognitive.test.mjs
import { loadEngine } from "../headless.mjs";
const Engine = loadEngine();
let pass = 0, fail = 0; const failures = [];
const T = (name, fn) => { try { fn(); pass++; console.log("  ✓", name); } catch (e) { fail++; failures.push(name); console.log("  ✗", name, "\n     ", e.stack.split("\n").slice(0, 3).join(" | ")); } };
const ok = (c, m) => { if (!c) throw new Error(m || "falló la condición"); };

const LOW = { it: 50, cr: 30, co: 40, cn: 40, di: 40, ag: 50 };
const HIGH = { it: 95, cr: 92, co: 88, cn: 90, di: 85, ag: 50 };

function applyCog(p, prof) {
  Object.assign(p.stats, { intelligence: prof.it });
  Object.assign(p.personality, { creativity: prof.cr, composure: prof.co, consistency: prof.cn, discipline: prof.di, aggression: prof.ag });
}

function makeMatch(seed) {
  const m = new Engine(seed);
  m.start();
  return m;
}

// Geometría fija de "cambio de frente" (Fase 35 / escenario B de Fase 37): jugador con la pelota en
// un costado, compañero completamente solo del otro lado del campo, rivales alejados (lane despejado).
function setupSwitchScene(m) {
  const dir = m.direction(0);
  const t = m.players[6]; // MID equipo 0
  Object.assign(t, { x: -20 * dir, z: 16, vx: 0, vz: 0, angle: dir > 0 ? Math.PI / 2 : -Math.PI / 2 });
  const mate = m.players[9]; // FWD equipo 0, lado débil
  Object.assign(mate, { x: -12 * dir, z: -16, vx: 0, vz: 0 });
  for (const p of m.players) if (p.team === 1) Object.assign(p, { x: 40 * dir, z: 0, vx: 0, vz: 0 });
  m.ai2UpdatePitch(1);
  return { t, mate, dir };
}

function candidatesFor(m, t, dir, elapsed) {
  m.elapsed = elapsed;
  const perc = m.ai2Perceive(t);
  const id = m.teamTactics(t.team);
  const ctx = { dir, id, perc, currentDanger: m.dangerAt(t.x, t.z, t.team), pressure: 0.2, desperate: false, wantsCounter: false, consolidating: false, facing: 1, memPressure: 0, memFatigue: 0, setpieceCross: false };
  return m.ai2PassCandidates(t, ctx);
}

T("CognitiveProfile: las facetas suben con mejores atributos, ninguna usa overall (Fase 1/2)", () => {
  const m = makeMatch(301), p = m.players[6];
  applyCog(p, LOW); m.ai2InitPlayer(p);
  const low = p.ai.cog;
  applyCog(p, HIGH); m.ai2InitPlayer(p);
  const high = p.ai.cog;
  for (const k of ["perception", "vision", "decisionQuality", "riskAssessment", "concentration", "spatialUnderstanding", "decisionHorizon"]) {
    ok(high[k] > low[k], `${k} debería subir con mejores atributos (bajo=${low[k].toFixed(2)} alto=${high[k].toFixed(2)})`);
  }
});

T("Fase 7/35 — en la misma geometría, un jugador de baja visión detecta el cambio de frente mucho menos seguido que uno de alta visión", () => {
  const m = makeMatch(302);
  const { t, dir } = setupSwitchScene(m);
  const N = 300;
  const detectRate = (prof) => {
    applyCog(t, prof); m.ai2InitPlayer(t);
    let seen = 0;
    for (let i = 0; i < N; i++) {
      const cands = candidatesFor(m, t, dir, 10 + i * 0.33);
      if (cands.some((c) => c.kind === "switch")) seen++;
    }
    return seen / N;
  };
  const loRate = detectRate(LOW), hiRate = detectRate(HIGH);
  ok(hiRate > loRate + 0.15, `alta visión (${(100 * hiRate).toFixed(0)}%) debería detectar el cambio de frente bastante más seguido que baja visión (${(100 * loRate).toFixed(0)}%)`);
  ok(loRate < 0.7, `baja visión no debería detectarlo casi siempre (${(100 * loRate).toFixed(0)}%) — dejaría de ser un jugador limitado`);
  ok(hiRate > 0.35, `alta visión debería detectarlo con frecuencia real (${(100 * hiRate).toFixed(0)}%), no como excepción`);
});

T("Escenario D (Fase 38) — en el mismo duelo 1v1, un jugador de bajo dribbling/creatividad casi no intenta recursos vistosos; uno alto sí", () => {
  const m = makeMatch(305);
  const t = m.players[9], def = m.players[13]; // FWD equipo 0 vs DEF equipo 1
  const dir = m.direction(0);
  const BASIC = new Set(["change", "feint", "sprint", "cut", "dragBack", "sharpTouch", "autopase"]);
  const flashyRate = (dr, cr, co, N) => {
    let flashy = 0;
    for (let i = 0; i < N; i++) {
      m.elapsed = 100 + i * 20; // fuera de cualquier cooldown de recurso previo
      Object.assign(t, { x: 0, z: 0, vx: dir * 3, vz: 0, dribbleAt: -10, skillCooldowns: {} });
      Object.assign(def, { x: 2.6 * dir, z: 0, vx: -dir * 3, vz: 0 });
      Object.assign(t.stats, { dribbling: dr, intelligence: 65 });
      Object.assign(t.personality, { creativity: cr, composure: co, consistency: 60, aggression: 50, discipline: 50 });
      Object.assign(def.stats, { defense: 65, intelligence: 65 });
      t.memory = { confidence: 50, recentMistakes: 0, recentSuccesses: 0, recentDuelResults: 0, lastOpponent: null, lastPassTarget: null, pressureMemory: 0, recentFatigue: 0 };
      def.memory = { ...t.memory };
      m.startDuel(t, def);
      if (t.skillMove && !BASIC.has(t.skillMove)) flashy++;
    }
    return flashy / N;
  };
  const N = 400;
  const loRate = flashyRate(55, 30, 35, N), hiRate = flashyRate(90, 90, 85, N);
  ok(hiRate > loRate + 0.15, `dribbling/creatividad alta (${(100 * hiRate).toFixed(0)}% recursos vistosos) debería animarse mucho más seguido que baja (${(100 * loRate).toFixed(0)}%)`);
  ok(loRate < 0.2, `un jugador limitado no debería intentar recursos vistosos casi nunca (${(100 * loRate).toFixed(0)}%)`);
});

T("Escenarios E/F (Fase 24/38) — decisión y ejecución son independientes: inteligente-pero-impreciso decide mejor y ejecuta peor que preciso-pero-impulsivo", () => {
  const m = makeMatch(306);
  const A = m.players[6], B = m.players[7]; // decide bien / pasa mal  vs  decide peor / pasa muy bien
  for (const p of [A, B]) {
    Object.assign(p, { x: 0, z: 0, vx: 0, vz: 0 });
    p.memory = { confidence: 50, recentMistakes: 0, recentSuccesses: 0, recentDuelResults: 0, lastOpponent: null, lastPassTarget: null, pressureMemory: 0, recentFatigue: 0 };
    p.stamina = 100;
  }
  Object.assign(A.stats, { intelligence: 90, passing: 50 });
  Object.assign(A.personality, { creativity: 80, consistency: 70, composure: 70 });
  Object.assign(B.stats, { intelligence: 55, passing: 92 });
  Object.assign(B.personality, { creativity: 40, consistency: 55, composure: 55 });
  m.ai2InitPlayer(A); m.ai2InitPlayer(B);
  ok(A.ai.cog.decisionQuality > B.ai.cog.decisionQuality, "A (inteligente) debería tener mejor decisionQuality que B");
  ok(A.ai.cog.vision > B.ai.cog.vision, "A (inteligente/creativo) debería tener mejor vision que B");
  const qA = m.ai2ExecQuality(A, "pass", { dist: 18 }).q, qB = m.ai2ExecQuality(B, "pass", { dist: 18 }).q;
  ok(qB > qA, `B (mejor pase técnico) debería ejecutar mejor un pase que A pese a decidir peor (A=${qA.toFixed(2)} B=${qB.toFixed(2)})`);
});

T("Escenario C (Fase 5/38) — ante la misma amenaza de ruptura, un defensor de mejor anticipación cae más profundo que uno de anticipación baja", () => {
  const m = makeMatch(308);
  const dir = m.direction(0);
  const l = m.players[2]; // DEF
  const depthFor = (it, cn) => {
    Object.assign(l, { x: 0, z: 0 });
    Object.assign(l.stats, { intelligence: it });
    Object.assign(l.personality, { consistency: cn });
    m.ai2InitPlayer(l);
    l.ai.dintent = { role: "DROP", at: m.elapsed, depth: 4, ref: null };
    return m.ai2PositionDefend(l, 0, 0, dir).x * dir;
  };
  const lo = depthFor(50, 40), hi = depthFor(95, 92);
  ok(hi < lo, `alta anticipación (x=${hi.toFixed(2)}) debería caer más profundo (más retrasado) que baja (x=${lo.toFixed(2)}) ante la misma amenaza`);
});

T("Escenario G (Fase 8/38) — entre dos defensores igual de rápidos y a la misma distancia, el coordinador prefiere presionar con el de mejor lectura espacial", () => {
  const m = makeMatch(309);
  const dir = m.direction(0);
  const car = m.players[19];
  const run = (itA, diA, itB, diB) => {
    Object.assign(car, { x: 5 * dir, z: 0, vx: 0, vz: 0 });
    m.owner = car; m.lastTouch = car;
    const p2 = m.players[2], p3 = m.players[3]; // misma distancia al portador, lados opuestos
    Object.assign(p2, { x: 8 * dir, z: 4, vx: 0, vz: 0 });
    Object.assign(p3, { x: 8 * dir, z: -4, vx: 0, vz: 0 });
    for (const q of m.players) if (q !== car && q !== p2 && q !== p3) Object.assign(q, { x: q.team === 0 ? -30 * dir : 40 * dir, z: 0, vx: 0, vz: 0 });
    Object.assign(p2.stats, { intelligence: itA, speed: 75 });
    Object.assign(p2.personality, { discipline: diA, aggression: 50 });
    Object.assign(p3.stats, { intelligence: itB, speed: 75 }); // misma velocidad: aísla spatialUnderstanding del término de distancia
    Object.assign(p3.personality, { discipline: diB, aggression: 50 });
    m.ai2InitPlayer(p2); m.ai2InitPlayer(p3);
    m.ai2UpdatePitch(1);
    m.elapsed = 30;
    m.ai2CoordDefense(0);
    return { p2: p2.ai.dintent && p2.ai.dintent.role, p3: p3.ai.dintent && p3.ai.dintent.role };
  };
  const r1 = run(30, 20, 99, 95), r2 = run(99, 95, 30, 20);
  ok(r1.p3 === "PRESS" && r1.p2 !== "PRESS", `debería presionar el de mejor lectura espacial (p3): ${JSON.stringify(r1)}`);
  ok(r2.p2 === "PRESS" && r2.p3 !== "PRESS", `debería presionar el de mejor lectura espacial (p2): ${JSON.stringify(r2)}`);
});

T("Escenario J (Fase 20/22/38) — ante el mismo tiro marginal, un arquero de mejor anticipación/decisión se anima a volar; uno limitado se queda parado", () => {
  const m = makeMatch(310);
  const gk = m.players[0];
  const dived = (it, cn) => {
    Object.assign(gk.stats, { intelligence: it });
    Object.assign(gk.personality, { consistency: cn });
    m.ai2InitPlayer(gk);
    gk.z = 0; m.kickedAt = -1; m.elapsed = 5;
    const pred = { d: 0.6, l: 0.43, isHeader: false }; // margen/tiempo intermedios entre ambos perfiles
    return m.gkSaveDecision(gk, pred);
  };
  ok(dived(95, 90) === true, "un arquero de alta anticipación/decisión debería lanzarse ante este tiro marginal");
  ok(dived(50, 40) === false, "uno de baja anticipación/decisión no debería llegar a reaccionar a tiempo en el mismo tiro");
});

T("Escenario I (Fase 8/23/38) — el valor del tiro especulativo reacciona más al contexto (carril/arquero adelantado) en un jugador de mejor riskAssessment", () => {
  const m = makeMatch(311);
  const dir = m.direction(0);
  const t = m.players[7], gk = m.players[11];
  const specScore = (prof, goodCtx, elapsed) => {
    Object.assign(t, { x: (52.5 - 24) * dir, z: 0, vx: 0, vz: 0, angle: dir > 0 ? Math.PI / 2 : -Math.PI / 2, controlAt: -1, dribbleAt: -10 });
    Object.assign(gk, { x: goodCtx ? 44 * dir : 52 * dir, z: goodCtx ? 6 : 0, vx: 0, vz: 0 });
    for (const p of m.players) {
      if (p === t || p === gk) continue;
      if (p.team === 1 && !goodCtx && (p.id === 12 || p.id === 13)) { Object.assign(p, { x: (52.5 - 10) * dir, z: p.id === 12 ? 2 : -2, vx: 0, vz: 0 }); continue; }
      Object.assign(p, { x: p.team === 0 ? -35 * dir : 40 * dir, z: 20, vx: 0, vz: 0 });
    }
    m.ball.x = t.x; m.ball.z = t.z; m.ball.vx = 0; m.ball.vz = 0;
    m.owner = t;
    m.ai2UpdatePitch(1);
    m.elapsed = elapsed;
    Object.assign(t.stats, { intelligence: prof.it, shooting: 65 });
    Object.assign(t.personality, { creativity: prof.cr, composure: prof.co, consistency: prof.cn, discipline: prof.di });
    m.ai2InitPlayer(t);
    m.decide(t);
    const opt = t.ai.dbg.options.find((o) => o.key === "speculative");
    return opt ? opt.score : null;
  };
  const avgGap = (prof, N) => {
    let good = [], bad = [];
    for (let i = 0; i < N; i++) {
      const g = specScore(prof, true, 10 + i * 0.7), b = specScore(prof, false, 10 + i * 0.7);
      if (g != null) good.push(g);
      if (b != null) bad.push(b);
    }
    return good.reduce((a, x) => a + x, 0) / good.length - bad.reduce((a, x) => a + x, 0) / bad.length;
  };
  // mismo intelligence/creativity (para que ambos consideren el tiro con tasa similar), sólo
  // difiere composure/consistency/discipline → riskAssessment
  const LOW_RA = { it: 80, cr: 88, co: 35, cn: 35, di: 35 }, HIGH_RA = { it: 80, cr: 88, co: 90, cn: 90, di: 90 };
  const loGap = avgGap(LOW_RA, 200), hiGap = avgGap(HIGH_RA, 200);
  ok(hiGap > loGap * 1.15, `un jugador de mejor riskAssessment debería mostrar una brecha buen-mal contexto mayor (alto=${hiGap.toFixed(3)} bajo=${loGap.toFixed(3)})`);
});

T("Escenario H (Fase 16/38) — ante la misma pérdida de pelota, un jugador de baja anticipación tarda más en reaccionar a la transición que uno de anticipación alta", () => {
  const m = makeMatch(312);
  const p = m.players[7];
  Object.assign(p, { x: 0, z: 0 });
  m.elapsed = 20;
  const delayFor = (it, cn) => {
    Object.assign(p.stats, { intelligence: it });
    Object.assign(p.personality, { consistency: cn });
    m.ai2InitPlayer(p);
    m.ai2OnTurnover(p.team, 0, 0);
    return p.ai.slowUntil - m.elapsed;
  };
  const lo = delayFor(50, 40), hi = delayFor(95, 90);
  ok(lo > hi, `baja anticipación (retraso=${lo.toFixed(2)}s) debería tardar más en reaccionar a la transición que alta (retraso=${hi.toFixed(2)}s)`);
});

T("Escenario A (Fase 37/38) — bajo presión, un jugador más inteligente descarga de primera con más frecuencia que uno limitado, en la misma situación de recepción", () => {
  const m = makeMatch(313);
  const p = m.players[7];
  const oneTouchRate = (it, N) => {
    Object.assign(p.stats, { intelligence: it });
    m.ai2InitPlayer(p);
    let oneTouch = 0;
    for (let i = 0; i < N; i++) {
      const r = m.ai2ChooseTouch(p, "control_forward", { pressure: 0.5, backToGoal: false, ballSpeed: 5, fta: 0.7 });
      if (r === "one_touch") oneTouch++;
    }
    return oneTouch / N;
  };
  const N = 800;
  const lo = oneTouchRate(45, N), hi = oneTouchRate(98, N);
  ok(hi > lo + 0.08, `alta inteligencia (${(100 * hi).toFixed(0)}% un toque) debería descargar de primera más seguido que baja (${(100 * lo).toFixed(0)}%)`);
});

console.log(`\n${pass} ok · ${fail} fallos`);
if (fail) { console.log(failures.join("\n")); process.exit(1); }
