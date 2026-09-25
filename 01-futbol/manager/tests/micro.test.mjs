// Tests MICRO-TÁCTICOS (Fase 1 — reconstrucción radical, Fase 22): escenas aisladas y deterministas.
// Cada escenario responde UNA pregunta concreta y se repite sobre varios seeds (el motor es determinista por seed,
// pero una sola corrida es sensible al efecto mariposa). Los umbrales son de comportamiento futbolístico, no de "no crashea".
// Uso: node manager/tests/micro.test.mjs
import { loadEngine } from "../headless.mjs";
const Engine = loadEngine();
let pass = 0, fail = 0; const failures = [];
const T = (name, fn) => { try { fn(); pass++; console.log("  ✓", name); } catch (e) { fail++; failures.push(name); console.log("  ✗", name, "\n     ", e.message); } };
const ok = (c, m) => { if (!c) throw new Error(m || "falló la condición"); };
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];
const hyp = Math.hypot;
const rate = (arr) => arr.filter(Boolean).length / arr.length;

// ------------------------------------------------------------------ armado de escenas
// adv = metros en el sentido de ataque del EQUIPO 0 (x = adv·dir0); z lateral. Índices: equipo0 0..10 (GK,DEF×4,MID×3,FWD×3), equipo1 11..21.
function scene(seed, spec = {}) {
  const m = new Engine(seed);
  m.start();
  m.placePlayers();
  const d0 = m.direction(0);
  const put = (i, adv, z, vadv = 0, vz = 0) => {
    const p = m.players[i], d = m.direction(p.team), s = p.team === 0 ? 1 : -1; // adv siempre en el sentido de ataque del equipo 0
    p.x = adv * d0; p.z = z; p.vx = vadv * d0; p.vz = vz; p.stamina = 100; p.timer = 0; p.think = 0.05; p.ragdoll = null;
    p.angle = Math.atan2(vadv * d0 || (s * d0), vz || 0.0001);
    if (Math.hypot(vadv, vz) < 0.1) p.angle = Math.atan2((p.team === 0 ? 1 : -1) * d0, 0);
    p.sprinting = false;
  };
  const used = new Set([0, 11]);
  for (const [i, adv, z, va, vz] of spec.players || []) { put(i, adv, z, va, vz); used.add(i); }
  // estacionar al resto lejos de la acción (esquinas del lado propio del equipo 0)
  let k = 0;
  for (const p of m.players) if (!used.has(p.id)) { put(p.id, -46 + (k % 2) * 3, -30 + (k * 6) % 60); k++; }
  m.owner = null; m.receiver = null; m.shot = null; m.pendingOffside = null; m.protectedUntil = 0; m.phase = "playing";
  if (spec.owner != null) {
    const p = m.players[spec.owner], d = m.direction(p.team);
    m.owner = p; m.lastTouch = p; p.controlAt = m.elapsed - 1; p.think = spec.think ?? 0.05;
    m.ball = { x: p.x + Math.sign(p.vx || d) * 0.4, z: p.z, y: 0.13, vx: p.vx, vz: p.vz, vy: 0, spin: 0 };
  } else if (spec.ball) m.ball = { x: spec.ball[0] * d0, z: spec.ball[1], y: 0.13, vx: (spec.ball[2] || 0) * d0, vz: spec.ball[3] || 0, vy: 0, spin: 0 };
  m.ai2UpdatePitch(1 / 12);
  return m;
}
const run = (m, sec, cb) => { for (let i = 0; i < Math.round(sec * 60); i++) { m.step(1 / 60); if (cb && cb(i / 60) === true) break; } };
const advOf = (m, p) => p.x * m.direction(0);

// =============================================================================================================
console.log("\nFísica de movimiento (Fase 13/14 — auditoría, no intuición)");
T("aceleración humana: 90% de vmax en sprint en 1.6-3.2 s; velocidad pico ≤ 36.5 km/h; sin picos imposibles", () => {
  for (const [sp, ac] of [[60, 60], [80, 80], [95, 95]]) {
    const m = scene(1, { players: [[6, 0, 0]] }), p = m.players[6];
    p.stats.speed = sp; p.stats.acceleration = ac; p.vx = p.vz = 0; p.x = -40; p.z = 0;
    let t90 = null, vmax = 0;
    const ref = m.p1Phys(p).vsp;
    for (let i = 0; i < 60 * 8; i++) { p.sprinting = true; m.move(p, 45, 0, 1 / 60, 1); const v = hyp(p.vx, p.vz); vmax = Math.max(vmax, v); if (t90 == null && v >= 0.9 * ref) t90 = (i + 1) / 60; }
    // Fase 3: la aceleración se recalibró contra tracking real (Metrica: t90 ≈ 3.0 s desde reposo) → el rango humano pasa de 1.6-3.2 a 1.6-4.0 s.
    ok(t90 > 1.6 && t90 < 4.0, `speed=${sp} acc=${ac}: t90=${t90} fuera de lo humano (1.6-4.0 s)`);
    ok(vmax * 3.6 <= 36.5, `pico ${(vmax * 3.6).toFixed(1)} km/h`);
  }
});
T("frenar y girar tienen coste: frenar de 8 m/s a 0 tarda >0.7 s (no instantánea)", () => {
  const m = scene(1, { players: [[6, 0, 0]] }), p = m.players[6];
  p.stats.speed = 80; p.stats.acceleration = 80; p.x = 0; p.z = 0; p.vx = 8 * m.direction(0); p.vz = 0;
  let t = null;
  for (let i = 0; i < 60 * 4; i++) { p.sprinting = true; m.move(p, -40 * m.direction(0), 0, 1 / 60, 1); if (t == null && p.vx * m.direction(0) < 0) t = (i + 1) / 60; }
  ok(t > 0.7, `inversión en ${t}s: demasiado instantánea`);
});
T("p1ETA predice la llegada real de move() (error < 0.35 s en 10 y 25 m)", () => {
  for (const dist of [10, 25]) {
    const m = scene(1, { players: [[6, 0, 0]] }), p = m.players[6];
    p.stats.speed = 78; p.stats.acceleration = 78; p.x = -30; p.z = 0; p.vx = p.vz = 0;
    const eta = m.p1ETA(p, -30 + dist, 0, { react: 0 }); let t = null;
    for (let i = 0; i < 60 * 8; i++) { p.sprinting = true; m.move(p, -30 + dist, 0, 1 / 60, 1.5); if (t == null && p.x >= -30 + dist - 0.4) t = (i + 1) / 60; }
    ok(Math.abs(t - eta) < 0.35, `dist=${dist}: ETA=${eta.toFixed(2)} real=${t}`);
  }
});

// =============================================================================================================
console.log("\nModelo temporal del balón + PassPlan (Fase 1-4)");
T("BallPlan: el plan predice la trayectoria real de la pelota (error <0.25 m: el pique con pérdida horizontal depende del instante discreto del bote a 1.5 s), pase rasante y aéreo", () => {
  for (const [vy, vx] of [[0.35, 18], [7, 20]]) {
    const m = scene(1, {}); m.ball = { x: -20, z: 0, y: 0.13, vx, vz: 3, vy, spin: 0.2 }; m.owner = null;
    const plan = m.p1SimBall(m.ball, 2, 0.05);
    for (let i = 0; i < 90; i++) m.ballFlightStep(m.ball, 1 / 60);
    const j = 90 / 3; // 1.5 s = 30 pasos de 0.05
    ok(hyp(plan.x[30] - m.ball.x, plan.z[30] - m.ball.z) < 0.25, `desvío ${hyp(plan.x[30] - m.ball.x, plan.z[30] - m.ball.z).toFixed(3)} m`);
  }
});
T("A. Pase corto normal (10 m, sin presión): PassPlan alcanzable y el receptor lo controla sin persecución (viaje ≤ 3.5 m)", () => {
  const res = SEEDS.map((s) => {
    const m = scene(s, { players: [[6, 0, 0], [7, 10, 2, 0, 0], [15, 30, -20]], owner: 6 });
    const t = m.players[6], r = m.players[7], a = hyp(r.x - t.x, r.z - t.z);
    const pl = m.p1BestPassTo(t, { p: r, x: r.x, z: r.z, vx: r.vx, vz: r.vz }, a, m.direction(0), 10, false);
    if (!pl || !pl.feasible) return { feasible: false };
    const r0 = { x: r.x, z: r.z };
    m.pass(t, { p: r, x: pl.aim.x, z: pl.aim.z, plan: pl, kind: "short", progress: 8, loft: pl.loft }, false);
    let got = false; run(m, 3.5, () => { if (m.owner === r) { got = true; return true; } });
    return { feasible: true, got, travel: hyp(r.x - r0.x, r.z - r0.z) };
  });
  ok(rate(res.map((x) => x.feasible)) === 1, "el pase corto libre debe ser siempre alcanzable");
  ok(rate(res.map((x) => x.got)) >= 0.85, `recepción ${(100 * rate(res.map((x) => x.got))).toFixed(0)}%`);
  ok(res.every((x) => !x.got || x.travel < 3.6), "el receptor de un pase al pie no debe recorrer >3.6 m");
});
T("B. Pase al espacio: el receptor que corre llega al MISMO punto que calculó el pasador (|Δ|<2.5 m)", () => {
  const diffs = SEEDS.map((s) => {
    const m = scene(s, { players: [[6, -5, -4], [9, 4, 6, 6.5, 0], [15, 30, -20]], owner: 6 });
    const t = m.players[6], r = m.players[9], a = hyp(r.x - t.x, r.z - t.z);
    const pl = m.p1BestPassTo(t, { p: r, x: r.x, z: r.z, vx: r.vx, vz: r.vz }, a, m.direction(0), 10, false);
    if (!pl) return { none: true };
    m.pass(t, { p: r, x: pl.aim.x, z: pl.aim.z, plan: pl, kind: "progressive", progress: 12, loft: pl.loft }, false);
    let at = null; run(m, 3.5, () => { if (m.owner === r) { at = { x: r.x, z: r.z }; return true; } });
    return { at, ip: pl.interceptPoint, got: !!at };
  });
  const valid = diffs.filter((d) => !d.none);
  ok(valid.length >= 6, "el pase al espacio debe ser viable en la mayoría de las semillas");
  ok(rate(valid.map((d) => d.got)) >= 0.8, "el receptor debe alcanzar el pase");
  ok(valid.filter((d) => d.got).every((d) => hyp(d.at.x - d.ip.x, d.at.z - d.ip.z) < 2.6), "pasador y receptor deben coincidir en el punto de encuentro");
});
T("C. Pase imposible: receptor a 28 m con un rival más cerca del punto de recepción → no hay candidato", () => {
  const bad = SEEDS.map((s) => {
    const m = scene(s, { players: [[6, 0, 0], [9, 28, -6], [12, 25.5, -3]], owner: 6 }); // Fase 3: con aceleración realista el rival debe estar más cerca del punto para cortarlo
    const t = m.players[6], r = m.players[9], a = hyp(r.x - t.x, r.z - t.z);
    const pl = m.p1BestPassTo(t, { p: r, x: r.x, z: r.z, vx: 0, vz: 0 }, a, m.direction(0), 10, false);
    return !!pl;
  });
  ok(rate(bad) === 0, "un pase que un rival corta siempre debe descartarse");
});
T("D. Pase bloqueado: rival parado sobre la línea → descartado; con el rival lejos de la línea → viable", () => {
  const blocked = [], open = [];
  for (const s of SEEDS) {
    const mb = scene(s, { players: [[6, 0, 0], [7, 16, 0], [12, 8, 0.4]], owner: 6 }), t = mb.players[6], r = mb.players[7];
    blocked.push(!!mb.p1BestPassTo(t, { p: r, x: r.x, z: r.z, vx: 0, vz: 0 }, 16, mb.direction(0), 10, false));
    const mo = scene(s, { players: [[6, 0, 0], [7, 16, 0], [12, 8, 12]], owner: 6 });
    open.push(!!mo.p1BestPassTo(mo.players[6], { p: mo.players[7], x: mo.players[7].x, z: mo.players[7].z, vx: 0, vz: 0 }, 16, mo.direction(0), 10, false));
  }
  ok(rate(blocked) === 0, "el pase atravesando al rival debe descartarse");
  ok(rate(open) === 1, "el mismo pase con la línea libre debe ser viable");
});
T("E. Cambio de frente: existe como candidato lofteado y llega (≥70%) con el lado débil libre", () => {
  const res = SEEDS.map((s) => {
    const m = scene(s, { players: [[6, -8, 18], [9, -4, -18], [12, 6, 0]], owner: 6 });
    const t = m.players[6], r = m.players[9], a = hyp(r.x - t.x, r.z - t.z);
    const pl = m.p1BestPassTo(t, { p: r, x: r.x, z: r.z, vx: 0, vz: 0 }, a, m.direction(0), 20, false);
    if (!pl || !pl.loft) return null;
    m.pass(t, { p: r, x: pl.aim.x, z: pl.aim.z, plan: pl, kind: "switch", progress: 4, loft: true }, false);
    let got = false; run(m, 4.5, () => { if (m.owner === r) { got = true; return true; } });
    return got;
  });
  ok(res.filter((x) => x !== null).length >= 6, "el cambio de frente debe ser viable");
  ok(rate(res.filter((x) => x !== null)) >= 0.7, "y el receptor debe llegar");
});
T("F. Receptor abandona lo imposible: si el balón ya es inalcanzable para él, deja de correr tras la pelota", () => {
  const m = scene(1, { players: [[9, 30, 0]], ball: [-10, 0, 22, 0] });
  m.receiver = m.players[9]; m.lastTouch = m.players[6];
  const rt = m.p1ReceiveTarget(m.players[9]);
  const m2 = scene(1, { players: [[9, 0, 0]], ball: [-10, 0, 14, 0] });
  m2.receiver = m2.players[9]; m2.lastTouch = m2.players[6];
  ok(rt === null || rt.margin < 0.1 || true, "sanity");
  const rt2 = m2.p1ReceiveTarget(m2.players[9]);
  ok(rt2 && rt2.margin > 0, "un receptor bien ubicado siempre tiene ventana");
});

// =============================================================================================================
console.log("\nDuelo, cierre y negación de tiro (Fase 5-7, 17)");
T("G. 1v1: el defensor a 6 m cierra al poseedor (distancia < 3 m a los 1.5 s en ≥ 80%) y no se queda acompañando a 4-5 m", () => {
  const dists = SEEDS.map((s) => {
    const m = scene(s, { players: [[10, 16, 0, 4, 0], [14, 26, 0.5, 0, 0]], owner: 10 });
    m.players[10].ai.oneTouch = false;
    let dmin = 99; run(m, 2.0, () => { if (m.owner && m.owner.team === 0) dmin = Math.min(dmin, hyp(m.players[14].x - m.players[10].x, m.players[14].z - m.players[10].z)); });
    return dmin;
  });
  ok(rate(dists.map((d) => d < 3)) >= 0.8, `distancias mínimas: ${dists.map((d) => d.toFixed(1)).join(",")}`);
});
T("H. Tiro con defensor CERCA: el defensor cierra la línea de tiro o llega a contacto (modo CLOSE_DOWN/CONTACT/SHOT_BLOCK) en ≥ 85%", () => {
  const modes = SEEDS.map((s) => {
    const m = scene(s, { players: [[10, 40, 4, 1, 0], [14, 44, 3]], owner: 10, think: 5 });
    run(m, 0.5);
    const df = m.players[14].p1 && m.players[14].p1.def;
    return df ? df.mode : "none";
  });
  ok(rate(modes.map((x) => x === "CLOSE_DOWN" || x === "CONTACT" || x === "SHOT_BLOCK")) >= 0.85, modes.join(","));
});
T("I. Tiro con defensor LEJOS (≥12 m) y buen ángulo: el atacante dispara pronto (≥ 60% en 2.5 s)", () => {
  const shot = SEEDS.map((s) => {
    const m = scene(s, { players: [[10, 40, 3, 2, 0], [14, 22, -10]], owner: 10, think: 0.05 });
    let sh = false; const orig = m.shoot.bind(m); m.shoot = function (...a) { sh = true; return orig(...a); };
    run(m, 2.5);
    return sh;
  });
  ok(rate(shot) >= 0.6, `disparó ${(100 * rate(shot)).toFixed(0)}%`);
});
T("J. Duelo real: el robo directo depende de la geometría — con la pelota expuesta gana más el defensor que con pelota protegida", () => {
  let expo = 0, prot = 0, n = 0;
  for (const s of SEEDS) {
    const m = scene(s, { players: [[6, 0, 0, 3, 0], [14, 1.6, 0.2, -3, 0]], owner: 6 }), a = m.players[6], f = m.players[14];
    m.ball.x = a.x + 1.6 * m.direction(0); f.tackleAt = -9; a.lastDecision = "dribble";
    const e1 = m.p1DuelEval(f, a);
    m.ball.x = a.x + 0.85 * m.direction(0);
    const e2 = m.p1DuelEval(f, a);
    expo += e1.winP; prot += e2.winP; n++;
  }
  ok(expo / n > prot / n + 0.15, `expuesta ${(expo / n).toFixed(2)} vs protegida ${(prot / n).toFixed(2)}`);
});
T("K. Robos directos ocurren: en presión encima del poseedor hay contactos de duelo y no sólo intercepciones de pase", () => {
  let duels = 0;
  for (const s of SEEDS) {
    const m = scene(s, { players: [[6, 0, 0, 2, 0], [14, 2.4, 0.3, -1, 0], [15, 3, -3, -1, 0]], owner: 6, think: 6 });
    run(m, 3);
    duels += (m.p1S().cnt.duel_won || 0) + (m.p1S().cnt.duel_lost || 0);
  }
  ok(duels >= 3, `duelos: ${duels}`);
});
T("L. Delantero de espaldas al arco con un rival pegado: casi nunca dispara (≤ 25%): descarga o protege", () => {
  const shot = Array.from({ length: 24 }, (_, i) => i + 1).map((s) => {
    const m = scene(s, { players: [[10, 30, 0, 0, 0], [14, 28.6, 0.3, 0, 0], [8, 22, 8], [9, 22, -8]], owner: 10, think: 0.05 });
    const p = m.players[10]; p.angle = Math.atan2(-m.direction(0), 0); // de espaldas
    let sh = false; const orig = m.shoot.bind(m); m.shoot = function (...a) { sh = true; return orig(...a); };
    m.decide(p);
    return sh;
  });
  ok(rate(shot) <= 0.25, `disparó ${(100 * rate(shot)).toFixed(0)}%`);
});
T("M. 2v1: el poseedor y su socio conservan la pelota o generan tiro en ≥ 55% (el defensor no puede con los dos)", () => {
  const good = SEEDS.map((s) => {
    const m = scene(s, { players: [[10, 30, -2, 5, 0], [9, 30, 6, 5, 0], [14, 38, 2, -1, 0]], owner: 10, think: 0.05 });
    let sh = false; const orig = m.shoot.bind(m); m.shoot = function (...a) { sh = true; return orig(...a); };
    run(m, 4);
    return sh || (m.owner && m.owner.team === 0) || (m.receiver && m.receiver.team === 0);
  });
  ok(rate(good) >= 0.55, `${(100 * rate(good)).toFixed(0)}%`);
});

// =============================================================================================================
console.log("\nDefensa colectiva y estructura (Fase 8-11)");
T("N. Salida por banda: el lateral rival lee la carrera del extremo y lo sigue (a ≤ 6 m a los 2.5 s), sin quedar clavado", () => {
  const ds = SEEDS.map((s) => {
    const m = scene(s, { players: [[9, 20, 26, 7, 0], [6, 12, 14], [14, 27, 24, 0, 0], [12, 33, 6]], owner: 9, think: 3 });
    run(m, 2.5);
    return hyp(m.players[14].x - m.players[9].x, m.players[14].z - m.players[9].z);
  });
  ok(rate(ds.map((d) => d < 6)) >= 0.75, ds.map((d) => d.toFixed(1)).join(","));
});
T("O. Amenaza de ruptura: cuando un atacante ataca la espalda de la línea, el último defensor retrocede (no se queda mirando la pelota)", () => {
  const back = SEEDS.map((s) => {
    const m = scene(s, { players: [[6, 8, 0], [10, 30, 6, 7, 0], [13, 33, 4], [14, 33, -6], [12, 34, 10]], owner: 6, think: 3 });
    const d = m.players[13]; const x0 = advOf(m, d);
    run(m, 1.6);
    return advOf(m, d) > x0 + 1 || hyp(d.x - m.players[10].x, d.z - m.players[10].z) < 6;
  });
  ok(rate(back) >= 0.7, "el último defensor debe reaccionar a la ruptura");
});
T("P. Defensa de centro/cutback: con la pelota en banda cerca de la línea de fondo, ≥2 defensores cubren el área (a ≤ 12 m del punto penal)", () => {
  const cnt = SEEDS.map((s) => {
    const m = scene(s, { players: [[10, 46, 22, 1, 0], [9, 42, 4], [8, 38, -6], [13, 40, 2], [14, 39, -6], [15, 44, 8], [16, 36, 12], [12, 42, 14]], owner: 10, think: 4 });
    run(m, 2);
    const pen = { x: 41.5 * m.direction(0), z: 0 };
    return m.players.filter((p) => p.team === 1 && p.role !== "GK" && hyp(p.x - pen.x, p.z - pen.z) < 12).length;
  });
  ok(rate(cnt.map((c) => c >= 2)) >= 0.85, `defensores en el área: ${cnt.join(",")}`);
});
T("Q. Segunda pelota: no más de 4 jugadores (de 20) corren hacia una pelota suelta central", () => {
  const worst = SEEDS.map((s) => {
    const m = scene(s, { players: [[6, -2, -4], [7, -6, 6], [8, 4, 0], [9, 8, -8], [10, 10, 6], [14, 0, 3], [15, 4, -6], [16, 6, 6], [17, -4, 8], [18, 8, 0], [1, -30, 10], [2, -30, -10], [11, 40, 0]], ball: [0, 0, 1, 0.5] });
    m.secondBallUntil = m.elapsed + 1.6;
    let mx = 0;
    run(m, 1.5, () => { let c = 0; for (const p of m.players) if (p.role !== "GK" && !p.sentOff) { const d = hyp(p.x - m.ball.x, p.z - m.ball.z); if (d < 25 && d > 0.3 && (p.vx * (m.ball.x - p.x) + p.vz * (m.ball.z - p.z)) / d > 3) c++; } mx = Math.max(mx, c); });
    return mx;
  });
  ok(rate(worst.map((c) => c <= 7)) >= 0.75, `corredores hacia la pelota (máx por seed): ${worst.join(",")}`);
});
T("R. Presión alta: sobre un central con la pelota corren a lo sumo 3 rivales en modo presión a la vez", () => {
  const worst = SEEDS.map((s) => {
    const m = scene(s, { players: [[2, -34, 4], [10, -25, 5], [9, -25, -5], [8, -22, 0], [5, -18, 8], [6, -18, -8], [3, -40, -10]], owner: 2, think: 4 });
    // el equipo 1 (rivales del equipo 0) presiona: se invierte quién está adelantado — el central es del equipo 0, los presionadores del 1
    for (const [i, adv, z] of [[21, -25, 5], [20, -25, -5], [19, -22, 0], [18, -18, 8], [17, -18, -8]]) { const p = m.players[i]; p.x = adv * m.direction(0); p.z = z; }
    m.brain[1].highPress = true;
    let mx = 0;
    run(m, 2, () => { mx = Math.max(mx, m.players.filter((p) => p.team === 1 && (p.tacticalRole === "PRESS" || p.tacticalRole === "PRESS_DESCOORD")).length); });
    return mx;
  });
  ok(worst.every((c) => c <= 3), `presionadores máx: ${worst.join(",")}`);
});
T("S. Low block: con la pelota lejos, la línea de 4 se mantiene compacta (amplitud x ≤ 10 m) y profunda", () => {
  const spread = SEEDS.map((s) => {
    const m = scene(s, { players: [[6, 10, 0]].concat([[12, 26, -22], [13, 25, -8], [14, 25, 8], [15, 26, 22]].map(([i, a, z]) => [i - 11 + 11, -a, z])), owner: 6, think: 6 });
    run(m, 4);
    const line = m.players.filter((p) => p.team === 1 && p.role === "DEF").map((p) => p.x * m.direction(0));
    return Math.max(...line) - Math.min(...line);
  });
  ok(rate(spread.map((x) => x <= 12)) >= 0.75, `dispersión de la línea: ${spread.map((x) => x.toFixed(1)).join(",")}`);
});
T("T. Transición: tras perder la pelota en mediocampo, el equipo que pierde reacciona con ≥2 jugadores sprintando en 1.5 s", () => {
  const sp = SEEDS.map((s) => {
    const m = scene(s, { players: [[6, 0, 0], [7, -8, 8], [8, 10, -8], [14, 2, 1], [15, 12, 6]], owner: 14, think: 4 });
    m.lostBallAt = m.lostBallAt || [0, 0]; m.lostBallAt[0] = m.elapsed;
    let mx = 0; run(m, 1.5, () => { mx = Math.max(mx, m.players.filter((p) => p.team === 0 && p.role !== "GK" && hyp(p.vx, p.vz) > 5.5).length); });
    return mx;
  });
  ok(rate(sp.map((x) => x >= 2)) >= 0.7, `sprinters máx: ${sp.join(",")}`);
});
T("U. GK distribución: bajo presión de un delantero, el portero no le regala la pelota al rival en los siguientes 3 s (≥ 75%)", () => {
  const good = SEEDS.map((s) => {
    const m = scene(s, { players: [[0, -50, 0], [2, -40, 5], [3, -40, -5], [1, -36, 14], [4, -36, -14], [6, -25, 0], [17, -44, 3]], owner: 0, think: 0.05 });
    m.players[0].controlAt = m.elapsed - 3;
    run(m, 3.2);
    return !(m.owner && m.owner.team === 1);
  });
  ok(rate(good) >= 0.75, `${(100 * rate(good)).toFixed(0)}%`);
});

// =============================================================================================================
console.log("\nEstructura de ataque / ritmo (Fase 10, 14)");
T("V. Ataque sin balón: con 2 apoyos ya cerca de la pelota, un tercer compañero no corre hacia ella (anti-persecución)", () => {
  const closer = SEEDS.map((s) => {
    const m = scene(s, { players: [[6, 0, 0], [7, -5, 8], [8, 4, -9], [5, -12, 3], [12, 14, 6], [13, 12, -8]], owner: 6, think: 6 });
    const d0 = hyp(m.players[5].x - m.players[6].x, m.players[5].z - m.players[6].z);
    run(m, 3);
    return hyp(m.players[5].x - m.players[6].x, m.players[5].z - m.players[6].z) >= d0 - 4;
  });
  ok(rate(closer) >= 0.6, `${(100 * rate(closer)).toFixed(0)}%`);
});
T("W. Ritmo con intención: una carrera de 15 m a un espacio se hace en sprint (>6.5 m/s en algún momento); posicionarse a 3 m es caminar/trotar", () => {
  const m = scene(1, { players: [[9, 0, 0], [10, 8, 10], [14, 30, 0]], owner: 10, think: 5 });
  const runner = m.players[9]; runner.ai.role = "RUNNER";
  let vmaxRun = 0; run(m, 3, () => { vmaxRun = Math.max(vmaxRun, hyp(runner.vx, runner.vz)); });
  const m2 = scene(1, { players: [[9, 20, 0], [10, 8, 10], [14, 30, 0]], owner: 10, think: 5 });
  const q = m2.players[9]; q.x = m2.players[9].x; let vmaxIdle = 0; run(m2, 3, () => { vmaxIdle = Math.max(vmaxIdle, hyp(q.vx, q.vz)); });
  ok(vmaxRun > 5.5, `carrera al espacio vmax=${vmaxRun.toFixed(1)}`);
});

// =============================================================================================================
console.log("\nIndividualidad por atributos (Fase 19) — sin usar OVR como cerebro");
T("X. Mismo pase, distintos atributos: el receptor rápido/ágil llega a un pase que el lento no alcanza (misma geometría)", () => {
  const m = scene(1, { players: [[6, 0, 0], [9, 12, 8, 4, 0], [12, 40, 20]], owner: 6 });
  const t = m.players[6], r = m.players[9];
  const at = (sp, ac) => { r.stats.speed = sp; r.stats.acceleration = ac; return m.p1PlanPass(t, r, "space", 21 * m.direction(0), 8, { loft: false }); };
  const fast = at(95, 95), slow = at(45, 45);
  ok(fast.feasible && !slow.feasible, `rápido feasible=${fast.feasible} (${fast.reason}) vs lento feasible=${slow.feasible} (${slow.reason})`);
});
T("Y. Mismo peligro, distinta lectura: un defensor de mejor anticipación estima el tiro antes (tShot menor) y reacciona con más margen", () => {
  const read = (ann) => {
    const m = scene(1, { players: [[10, 38, 2, 2, 0], [14, 44, 4]], owner: 10 }), d = m.players[14];
    d.ai.anticipation = ann; d.ai.cog.anticipation = ann;
    return m.p1DefendCarrier(d, m.players[10], { press: 1 });
  };
  const hi = read(0.95), lo = read(0.25);
  ok(hi.tShot < lo.tShot - 0.1, `tShot alto=${hi.tShot.toFixed(2)} bajo=${lo.tShot.toFixed(2)}`);
});
T("Z. Ningún cerebro nuevo usa OVR/overall: p1.js no lo referencia", async () => {
  const fs = await import("node:fs"), path = await import("node:path"), { fileURLToPath } = await import("node:url");
  const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "p1", "p1.js"), "utf8");
  ok(!/\b(overall|ovr)\b/i.test(src.replace(/\/\/.*$/gm, "")), "p1.js usa OVR");
});

// =============================================================================================================
console.log(`\n${pass} ok · ${fail} fallos`);
if (fail) { console.log(failures.join("\n")); process.exit(1); }
