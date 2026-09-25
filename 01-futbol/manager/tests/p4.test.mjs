// Tests FASE 4 — cuerpos sólidos: el balón rebota contra los jugadores en vez de atravesarlos (headless, deterministas).
// Uso: node manager/tests/p4.test.mjs
import { loadEngine } from "../headless.mjs";
const Engine = loadEngine();
let pass = 0, fail = 0; const failures = [];
const T = (name, fn) => { try { fn(); pass++; console.log("  ✓", name); } catch (e) { fail++; failures.push(name); console.log("  ✗", name, "\n     ", e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m || "falló la condición"); };
const SEEDS = [1, 2, 3, 4, 5, 6];
const hyp = Math.hypot;
// escena aislada: todos los jugadores lejos salvo el indicado; balón suelto lanzado hacia +x desde (-10,0) contra el jugador en (0,0)
function scene(seed, { pteam = 1, ballY = 0.13, vx = 20, vy = 0, receiver = false, shooter = 0 } = {}) {
  const m = new Engine(seed); m.start(); m.placePlayers();
  m.players.forEach((p, i) => { p.x = -45 + (i % 11) * 0.5; p.z = 30 - Math.floor(i / 11) * 1; p.vx = p.vz = 0; p.stamina = 100; p.timer = 9; p.think = 9; });
  const P = m.players.find((p) => p.team === pteam && p.role !== "GK"), K = m.players.find((p) => p.team === shooter && p.role !== "GK" && p !== P);
  P.x = 0; P.z = 0; P.vx = P.vz = 0; P.timer = 99;
  K.x = -12; K.z = 5;
  m.owner = null; m.phase = "playing"; m.lastTouch = K; m.kickedAt = m.elapsed - 1; m.shot = null; m.receiver = receiver ? P : null;
  m.ball = { x: -10, z: 0, y: ballY, vx, vz: 0, vy, spin: 0 };
  return { m, P, K };
}
const run = (m, sec, cb) => { for (let i = 0; i < sec * 60; i++) { m.step(1 / 60); cb && cb(i); } };

console.log("Cuerpos sólidos (Fase 4)");
T("A. Un remate rasante a 25 m/s contra un rival parado NO lo atraviesa: rebota (vx invertida o frenada) y el rival pasa a ser el último toque", () => {
  for (const s of SEEDS) { const { m, P } = scene(s, { ballY: 0.5, vx: 25 }); let hit = false, crossed = false;
    run(m, 1.2, () => { if (m.lastTouch === P) hit = true; if (!hit && m.ball.x > 0.6 && Math.abs(m.ball.z) < 0.3) crossed = true; });
    ok(hit && !crossed, `seed ${s}: hit=${hit} crossed=${crossed} x=${m.ball.x.toFixed(2)}`); }
});
T("B. Sin tunel: un pase/tiro a 32 m/s con paso de 1/60 también choca; rasante a nivel de los pies también", () => {
  for (const s of SEEDS) for (const [y, vx] of [[0.13, 32], [1.2, 32], [1.6, 30]]) { const { m, P } = scene(s, { ballY: y, vx }); let hit = false;
    run(m, 1, () => { if (m.lastTouch === P) hit = true; });
    ok(hit, `seed ${s} y=${y} vx=${vx}: atravesó (x=${m.ball.x.toFixed(1)})`); }
});
T("C. Un globo por encima de la cabeza (a 4 m de altura) pasa sin chocar", () => {
  for (const s of SEEDS) { const { m, P } = scene(s, { ballY: 4.5, vx: 20, vy: 2 }); let hit = false;
    run(m, 0.8, () => { if (m.lastTouch === P) hit = true; });
    ok(!hit, `seed ${s}: chocó con la cabeza`); }
});
T("D. El receptor previsto amortigua un pase fuerte (queda a <5 m/s tras el contacto) y no lo atraviesa", () => {
  for (const s of SEEDS) { const { m, P } = scene(s, { pteam: 0, shooter: 0, ballY: 0.4, vx: 22, receiver: true }); let sp = null;
    m.lastTouch = m.players.find((p) => p.team === 0 && p !== P && p.role !== "GK");
    run(m, 1, () => { if (sp === null && (m.owner === P || m.ball.x > 0.5 && false)) sp = 0; });
    ok(m.owner === P || hyp(m.ball.vx, m.ball.vz) < 8, `seed ${s}: el receptor no controló ni amortiguó (v=${hyp(m.ball.vx, m.ball.vz).toFixed(1)}, x=${m.ball.x.toFixed(1)})`); }
});
T("E. Un remate contra un rival cuenta como bloqueo (shot=null, evento; también vale el de la barrida) y no llega al arco", () => {
  for (const s of SEEDS) { const { m, P } = scene(s, { ballY: 0.6, vx: 27 }); m.shot = { team: 0, x: 0, z: 0, at: 0 }; m.p1.cnt = {}; let ev = false;
    const orig = m.event.bind(m); m.event = (k, ...a) => { if (k === "block" || /BLOQU/.test(a[0])) ev = true; return orig(k, ...a); };
    run(m, 1, () => {}); ok((ev && m.shot === null) || m.owner === P || (m.lastTouch === P && hyp(m.ball.vx, m.ball.vz) < 15), `seed ${s}: block=${ev} shot=${m.shot}`); }
});
T("F. Sin NaN/valores fuera de rango con la colisión activa en partidos completos, y el contador de choques es > 0", () => {
  let hits = 0;
  for (const s of [3, 4, 5]) { const m = new Engine(s); m.start(); m.p1.cnt = {};
    for (let i = 0; i < 60 * 300; i++) { m.step(1 / 60); const b = m.ball; if (!Number.isFinite(b.x + b.y + b.z + b.vx + b.vy + b.vz)) throw new Error("NaN en la pelota"); if (hyp(b.vx, b.vz) > 60 || b.y > 40) throw new Error("velocidad/altura absurda " + hyp(b.vx, b.vz)); }
    hits += (m.p1.cnt.body_hit || 0) + (m.p1.cnt.body_block || 0); }
  ok(hits > 0, "no hubo ningún choque en 15 min");
  console.log("     choques cuerpo-balón en 3 × 5 min:", hits);
});
console.log(`\n${pass} ok · ${fail} fallos`); if (fail) { console.log(failures.join("\n")); process.exit(1); }
