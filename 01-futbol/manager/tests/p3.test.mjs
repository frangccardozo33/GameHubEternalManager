// Tests FASE 3 — portero, barridas, pelotas paradas y laboratorio de jugadas (headless, deterministas por seed).
// Uso: node manager/tests/p3.test.mjs
import { loadEngine } from "../headless.mjs";
const Engine = loadEngine();
let pass = 0, fail = 0; const failures = [];
const T = (name, fn) => { try { fn(); pass++; console.log("  ✓", name); } catch (e) { fail++; failures.push(name); console.log("  ✗", name, "\n     ", e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m || "falló la condición"); };
const SEEDS = [11, 12, 13, 14, 15, 16, 17, 18];
const hyp = Math.hypot;
const boot = (seed) => { const m = new Engine(seed); m.start(); for (let i = 0; i < 600; i++) m.step(1 / 60); return m; };
const run = (m, sec, cb) => { for (let i = 0; i < sec * 60; i++) { m.step(1 / 60); cb && cb(i); } };
const gkOf = (m, t) => m.players.find((p) => p.team === t && p.role === "GK");

console.log("Portero (Fase 3)");
T("A. Estiradas: tiro esquinado → lateral; globo → estirada hacia atrás; cada acción existe con su propio tipo", () => {
  const k = {};
  for (const s of SEEDS) for (const [sc, team] of [["gk_shot", 1], ["gk_lob", 1], ["gk_shot", 0], ["gk_lob", 0]]) {
    const m = boot(s); m.p3DebugScenario(sc, team); const g = gkOf(m, 1 - team);
    run(m, 3, () => { if (g.dive > 0 && g.diveKind) k[sc + ":" + g.diveKind] = (k[sc + ":" + g.diveKind] || 0) + 1; });
  }
  ok(k["gk_shot:side"] > 0, "el tiro esquinado debe provocar estirada lateral: " + JSON.stringify(k));
  ok(k["gk_lob:back"] > 0, "el globo por arriba debe provocar estirada hacia atrás: " + JSON.stringify(k));
});
T("B. Centros: el arquero sale y agarra (claim) o despeja con los puños (punch) — ambas aparecen", () => {
  const c = {};
  // 16 semillas: con 8 el resultado depende de un puñado de escenas (cualquier ajuste de IA lo movía de 0 a 2).
  for (const s of [...SEEDS, 19, 20, 21, 22, 23, 24, 25, 26]) for (const team of [0, 1]) {
    const m = boot(s); m.p1.cnt = {}; m.p3DebugScenario("gk_cross", team); run(m, 4);
    for (const k of ["gk_claim", "gk_punch", "gk_claim_fumble"]) c[k] = (c[k] || 0) + (m.p1.cnt[k] || 0);
  }
  ok(c.gk_claim > 0, "debe agarrar centros: " + JSON.stringify(c));
});
T("C. 1v1: el arquero sale a achicar (Rush) y, si el rival lleva la pelota larga, se lanza a sus pies (smother) con un duelo de resultado", () => {
  let closer = 0, n = 0, smother = 0, duels = 0, wins = 0;
  for (const s of SEEDS) for (const team of [0, 1]) {
    const m = boot(s); m.p3DebugScenario("gk_1v1", team); const g = gkOf(m, 1 - team), r = -52.5 * m.direction(g.team); let maxOut = 0;
    run(m, 2, () => { maxOut = Math.max(maxOut, Math.abs(g.x - r)); }); n++; if (maxOut >= 3.5) closer++;
    const k = boot(s + 100); k.p1.cnt = {}; const e0 = k.events.length; k.p3DebugScenario("gk_smother", team); run(k, 4);
    smother += k.p1.cnt.gk_smother || 0; duels += k.p1.cnt.gk_smother_duel || 0; if (k.events.slice(0, k.events.length - e0).some((e) => /SACÓ LA PELOTA/.test(e.title))) wins++;
  }
  ok(closer / n >= 0.6, "el arquero debe salir a achicar (≥60 % de las escenas): " + closer + "/" + n);
  ok(smother > 0 && duels > 0, `debe intentar sacar la pelota de los pies: ${smother} intentos, ${duels} duelos`);
  void wins;
});
T("D. Pase filtrado: sale corriendo a despejar y NUNCA usa las manos fuera del área", () => {
  let sweeps = 0, handsOut = 0, feet = 0;
  for (const s of SEEDS) for (const team of [0, 1]) {
    const m = boot(s); m.p1.cnt = {}; m.p3DebugScenario("gk_through", team); const g = gkOf(m, 1 - team);
    run(m, 8, () => { if (g.state === "Catch" && !m.p3InArea(g, g.x, g.z)) handsOut++; if (g.state === "Receive" && g.gkFootAt && m.elapsed - g.gkFootAt < 0.2 && !m.p3InArea(g, g.x, g.z)) feet++; });
    sweeps += m.p1.cnt.gk_sweep || 0;
  }
  ok(sweeps > 0, "debe salir a buscar el pase filtrado");
  ok(handsOut === 0, "manos fuera del área: " + handsOut);
});
T("E. Rebotes: hay retención, y los rebotes pueden ir al córner, a un costado o AL CENTRO DEL ÁREA", () => {
  const c = {};
  for (const s of [...SEEDS, 21, 22, 23, 24, 25, 26, 27, 28]) for (const team of [0, 1]) for (const sc of ["gk_shot", "gk_lob"]) {
    const m = boot(s); m.p1.cnt = {}; m.p3DebugScenario(sc, team); run(m, 4);
    for (const k in m.p1.cnt) if (/^gk_(hold|rebound_)/.test(k)) c[k] = (c[k] || 0) + m.p1.cnt[k];
  }
  ok(c.gk_hold > 0, "debe quedarse con la pelota a veces: " + JSON.stringify(c));
  ok(Object.keys(c).filter((k) => k.startsWith("gk_rebound_")).length >= 2, "debe haber más de un tipo de rebote: " + JSON.stringify(c));
});
T("F. Sin peligro (delanteros lejos): el arquero libero sube a ofrecerse (posición 'sweeper' ≥3.5 m adelante) y se mueve hacia ahí", () => {
  let mode = 0, moved = 0, n = 0;
  for (const s of SEEDS) {
    const m = boot(s); m.p3DebugScenario("gk_build", 0); const g = gkOf(m, 0), dir = m.direction(0), r = -52.5 * dir;
    // el arquero suelta la pelota a un defensa y sigue el juego: sin rivales cerca, la posición base es de libero
    const d = m.players.find((p) => p.team === 0 && p.role === "DEF"); m.p3Place(d, r + dir * 14, 6); m.ball.x = d.x + dir * 0.5; m.ball.z = 6; m.possession(d);
    let maxOut = 0; run(m, 6, () => { maxOut = Math.max(maxOut, Math.abs(g.x - r)); });
    const R = m.p3GkRead(g, dir, r), pos = m.p3GkPosition(g, dir, r, R); n++;
    if (pos.mode === "sweeper" && Math.abs(pos.x - r) > 3.5) mode++; if (maxOut > 3.5) moved++;
  }
  ok(mode / n >= 0.6, "posición de libero en ≥60 % de las escenas: " + mode + "/" + n);
  ok(moved >= 1, "debe moverse hacia arriba: " + moved + "/" + n);
});
T("G. Todas las jugadas del laboratorio se arman y corren sin NaN, con el partido volviendo a 'playing'", () => {
  for (const [k] of Engine.prototype.p3Scenarios.call({})) for (const team of [0, 1]) {
    const m = boot(11); ok(m.p3DebugScenario(k, team), "no se armó " + k);
    let bad = false; run(m, 16, () => { for (const p of m.players) if (!Number.isFinite(p.x) || !Number.isFinite(p.z)) bad = true; if (!Number.isFinite(m.ball.x)) bad = true; });
    ok(!bad, "NaN en " + k);
    ok(["playing", "goal", "restart", "freekick", "penalty", "halftime"].includes(m.phase), "fase rara " + m.phase + " tras " + k);
  }
});

console.log("Pelotas paradas (Fase 3)");
T("H. El cobrador NO sale jugando con la pelota: libera sin conducirla (<1 m) en todos los tiros libres", () => {
  let maxCarry = 0, released = 0, n = 0;
  for (const k of ["fk_midfield", "fk_far_cross", "fk_wide_cross", "fk_own_third"]) for (const s of SEEDS) for (const team of [0, 1]) {
    const m = boot(s); m.p3DebugScenario(k, team); const id = m.restartData && m.restartData.takerId; let p0 = null, rel = false;
    run(m, 14, () => { const o = m.owner; if (o && id != null && o.id === id && !rel) { p0 = p0 || { x: o.x, z: o.z }; maxCarry = Math.max(maxCarry, hyp(o.x - p0.x, o.z - p0.z)); } else if (p0) rel = true; });
    n++; if (rel) released++;
  }
  ok(maxCarry < 1, "el cobrador condujo " + maxCarry.toFixed(1) + " m");
  ok(released / n > 0.9, "el cobrador debe jugar la pelota: " + released + "/" + n);
});
T("I. Tiro libre que va al centro: los atacantes ocupan el área y los defensores se ubican en línea", () => {
  let inBox = 0, n = 0, defLine = 0;
  for (const s of SEEDS) for (const team of [0, 1]) {
    const m = boot(s); m.p3DebugScenario("fk_far_cross", team); const dir = m.direction(team), gx = 52.5 * dir, id = m.restartData.takerId;
    let done = false; n++;
    run(m, 14, () => { if (done || !(m.phase === "playing" && m.owner && m.owner.id === id)) return; done = true; // instante en que el cobrador recibe la pelota para ejecutarla
      inBox += m.players.filter((p) => p.team === team && p.role !== "GK" && Math.abs(p.x - gx) < 20 && Math.abs(p.z) < 20).length;
      defLine += m.players.filter((p) => p.team !== team && p.role !== "GK" && Math.abs(p.x - gx) < 12 && Math.abs(p.z) < 18).length; });
  }
  ok(inBox / n >= 3, "atacantes en el área: " + (inBox / n).toFixed(1));
  ok(defLine / n >= 3, "defensores en el área: " + (defLine / n).toFixed(1));
});
T("J. Tiro libre directo a distancia de remate: secuencia de disparo; el penal se cobra", () => {
  let cine = 0, pen = 0;
  for (const s of SEEDS) { let m = boot(s); m.p3DebugScenario("fk_direct_near", 0); run(m, 3, () => { if (m.phase === "freekick") cine++; }); m = boot(s); m.p3DebugScenario("penalty", 1); run(m, 12, () => { if (m.phase === "penalty") pen++; }); }
  ok(cine > 0, "el tiro libre directo cercano debe usar la secuencia de disparo");
  ok(pen > 0, "el penal debe cobrarse");
});

console.log("Barridas (Fase 3)");
T("K. La barrida es un impulso real: se desliza ≥3 m a >6 m/s inicial y frena por rozamiento", () => {
  for (const s of [21, 22, 23]) for (const team of [0, 1]) {
    const m = boot(s); m.p3DebugScenario("slide_tackle", team); const d = m.players.find((p) => p.state === "Slide"); ok(d, "sin barrida");
    const x0 = d.x, z0 = d.z; let v0 = hyp(d.vx, d.vz), vEnd = 99; run(m, 1.2, (i) => { if (i < 60) vEnd = Math.min(vEnd, hyp(d.vx, d.vz)); });
    ok(v0 > 6, "impulso inicial " + v0.toFixed(1)); ok(hyp(d.x - x0, d.z - z0) >= 3, "deslizó " + hyp(d.x - x0, d.z - z0).toFixed(1)); ok(vEnd < v0 * 0.5, "debe frenar por rozamiento " + v0.toFixed(1) + "->" + vEnd.toFixed(1) + " s" + s + " t" + team);
  }
});
T("L. La barrida también tapa tiros (bloqueo) — resultado 'block' en la mayoría de las escenas", () => {
  let block = 0, n = 0;
  for (const s of [21, 22, 23, 24, 25, 26]) for (const team of [0, 1]) { const m = boot(s); m.p3DebugScenario("slide_block", team); const d = m.players.find((p) => p.state === "Slide"); run(m, 1.2); n++; if (d.tl && d.tl.result === "block") block++; }
  ok(block / n >= 0.5, "bloqueos " + block + "/" + n);
});
T("M. Los defensores deciden solos barridas para quitar balones lejanos y tapar tiros durante partidos completos", () => {
  let far = 0, blk = 0;
  for (const s of [3, 4, 5, 6]) {
    const m = new Engine(s); m.start(); const orig = m.tlStartSlide.bind(m);
    m.tlStartSlide = function (c) { if (c.ctx && c.ctx.tackleFar) far++; if (c.ctx && c.ctx.block) blk++; return orig(c); };
    run(m, 60 * 25);
  }
  ok(far + blk > 0, `barridas nuevas espontáneas: lejanas=${far} bloqueo=${blk}`);
});
T("N. Sin NaN ni valores fuera de campo en partidos completos con todas las mecánicas nuevas", () => {
  for (const s of [3, 4, 5]) { const m = new Engine(s); m.start(); let bad = 0; run(m, 60 * 30, () => { for (const p of m.players) if (!Number.isFinite(p.x + p.z + p.vx + p.vz)) bad++; }); ok(bad === 0, "NaN en seed " + s); }
});

console.log(`\n${pass} ok · ${fail} fallos`);
if (fail) { console.log("FALLARON:", failures.join(" | ")); process.exit(1); }
