// Invariantes automatizados del motor (Fase 39 del prompt de reconstrucción): correr varios
// partidos completos (headless, con y sin manager) y verificar que nunca aparezcan NaN/Infinity,
// jugadores o pelota fuera de los límites de cancha, xG inválido, ni un "restart" atascado.
// Uso: node manager/tests/invariants.test.mjs
import { loadCore } from "./load.mjs";
import { loadEngine } from "../headless.mjs";
const TLM = loadCore();
const Engine = loadEngine();
let pass = 0, fail = 0; const failures = [];
const T = (name, fn) => { try { fn(); pass++; console.log("  ✓", name); } catch (e) { fail++; failures.push(name); console.log("  ✗", name, "\n     ", e.stack.split("\n").slice(0, 3).join(" | ")); } };
const ok = (c, m) => { if (!c) throw new Error(m || "falló la condición"); };

const USER = { name: "Club Prueba", shortName: "PRU", primaryColor: "#336699", secondaryColor: "#ffffff", stadium: "Estadio Prueba", capacity: 12000 };
function career(seed, n = 6) {
  const c = TLM.Career.create({ seed, totalClubs: n, userClub: USER }), s = c.state, u = c.user;
  for (const pos of ["POR", "POR", "DFC", "DFC", "LI", "LD", "MCD", "MC", "MC", "EI", "ED", "DC", "DC", "DFC", "MI", "MP", "DC"]) {
    const fa = s.market.freeAgents.map((id) => s.players[id]).filter((p) => p.primaryPosition === pos).sort((a, b) => b.overall - a.overall)[0];
    if (fa && TLM.signFreeAgent(s, u.id, fa.id, {}).ok) continue;
    const li = TLM.searchMarket(s, { pos, source: "listed", excludeClub: u.id }).find((r) => r.price < 5e6);
    if (li) TLM.buyNow(s, u.id, li.pid, {});
  }
  TLM.autoLineup(s, u);
  return c;
}
// Margen generoso sobre 52.5/34 (medidas de cancha): cobradores de córner/lateral, banderines y
// festejos legítimamente paran unos metros fuera de la línea; lo que este invariante busca es una
// explosión real (cientos/miles de metros o NaN), no la posición exacta del borde de cancha.
const FIELD_X = 58, FIELD_Z = 42;

function checkInvariants(m, label) {
  let maxAbsX = 0, maxAbsZ = 0, badFrames = 0, longestRestart = 0, restartSince = null;
  const maxSteps = 5400 * 60 + 60 * 400;
  let n = 0;
  while (!m.ended && n++ < maxSteps) {
    m.step(1 / 60);
    if (!Number.isFinite(m.ball.x) || !Number.isFinite(m.ball.z) || !Number.isFinite(m.ball.y)) badFrames++;
    for (const p of m.players) {
      if (!Number.isFinite(p.x) || !Number.isFinite(p.z) || !Number.isFinite(p.vx) || !Number.isFinite(p.vz)) { badFrames++; continue; }
      maxAbsX = Math.max(maxAbsX, Math.abs(p.x));
      maxAbsZ = Math.max(maxAbsZ, Math.abs(p.z));
    }
    // Una secuencia de cambio (tlmSubSeq) congiela DELIBERADAMENTE el partido -incluida la física
    // del balón vía el wrapper de step() en manager/engine.js- mientras dura la animación de
    // salida/entrada por la banda (README_MANAGER.md: "El reloj del partido queda congelado"); eso
    // puede coincidir con una parada ("restart") real y tardar 20-40s reales sin ser un bug.
    if (m.phase === "restart" && !m.tlmSubSeq) {
      if (restartSince == null) restartSince = m.elapsed;
      longestRestart = Math.max(longestRestart, m.elapsed - restartSince);
    } else restartSince = null;
  }
  ok(m.ended, label + ": el partido debe terminar (no colgarse) dentro del presupuesto de steps");
  ok(badFrames === 0, label + `: ${badFrames} frames con NaN/Infinity en pelota o jugadores`);
  ok(maxAbsX < FIELD_X, label + `: jugador fuera de límites en X (${maxAbsX.toFixed(2)})`);
  ok(maxAbsZ < FIELD_Z, label + `: jugador fuera de límites en Z (${maxAbsZ.toFixed(2)})`);
  ok(longestRestart < 15, label + `: reinicio atascado ${longestRestart.toFixed(1)}s seguidos`);
  for (let t = 0; t < 2; t++) {
    const st = m.stats[t];
    ok(Number.isFinite(st.xg) && st.xg >= 0, label + `: xG inválido equipo ${t} (${st.xg})`);
    ok(Number.isFinite(m.score[t]) && m.score[t] >= 0, label + `: marcador inválido equipo ${t}`);
  }
}

console.log("\nInvariantes — motor puro (exhibición, sin manager)");
for (const seed of [11, 22, 33]) {
  T(`exhibición seed ${seed}: sin NaN, sin fuera de límites, sin reinicio atascado`, () => {
    const m = new Engine(seed);
    m.start();
    checkInvariants(m, "seed " + seed);
  });
}

console.log("\nInvariantes — modo carrera (motor + manager, config real)");
for (const seed of [44, 55]) {
  T(`carrera seed ${seed}: partido real vía tlmLoad sin NaN ni fuera de límites`, () => {
    const c = career(seed);
    const cfg = c.matchConfig();
    const m = new Engine(cfg.seed);
    m.tlmLoad(cfg);
    m.start();
    checkInvariants(m, "carrera seed " + seed);
    const res = m.tlmResult();
    ok(res.goalScorers.length === res.score[0] + res.score[1], "goleadores coherentes con el marcador");
    ok(TLM.validate(c.state).length === 0, "estado de carrera sigue siendo válido tras el partido");
  });
}

console.log(`\n${pass} ok · ${fail} fallos`);
if (fail) { console.log(failures.join("\n")); process.exit(1); }
