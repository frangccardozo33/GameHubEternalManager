// ============================================================================================
// FASE 3 — PORTERO, BARRIDAS, PELOTAS PARADAS, LABORATORIO DE JUGADAS  (fuente: p1/p3.js, inyectado junto a p1.js)
//
//  A. Portero ........ keeper (reemplaza al anterior): lectura de situación → posición (línea / achica 1v1 / libero) → acción
//                      (atajada lateral, estirada hacia atrás, salida a cruces: agarra o despeja con los puños, "sacar la pelota de los pies",
//                      barrida de portero libero ante pase filtrado). p3GkContact resuelve el contacto: retiene o rebota (al córner, a un lado
//                      o AL CENTRO DEL ÁREA) y respeta el reglamento (fuera del área / pase de pie de un compañero → sólo con los pies).
//  B. Pelota parada .. p3SetPieceFilter (el cobrador NO puede llevar la pelota: pasa/tira/centra) + p3SetPieceShape (el resto se ubica).
//  C. Barrida ........ p3SlideScan: barrida para quitar el balón al portador desde lejos y para tapar tiros (el impulso/animación viven en
//                      tlStartSlide/tlLockMove y en TLB.pose).
//  D. Laboratorio .... p3DebugScenario(kind, team): arma jugadas (tiros libres, penales, córners, faltas, 1v1, centros, pases filtrados…).
// ============================================================================================
const P3_AREA_X = 16.5, P3_AREA_Z = 20.16;
const P3_SCENARIOS = [
  ["fk_direct_near", "Tiro libre directo · 20 m centrado"],
  ["fk_direct_mid", "Tiro libre directo · 26 m, ángulo"],
  ["fk_far_cross", "Tiro libre lejano centrado (centro al área) · 34 m"],
  ["fk_wide_cross", "Tiro libre lateral (centro al área)"],
  ["fk_midfield", "Tiro libre en mitad de cancha (saque jugado)"],
  ["fk_own_third", "Tiro libre en campo propio"],
  ["penalty", "Penal"],
  ["corner_l", "Córner (lado izquierdo)"],
  ["corner_r", "Córner (lado derecho)"],
  ["throwin_att", "Saque de banda en ataque"],
  ["goalkick", "Saque de arco"],
  ["foul_box", "Falta dentro del área (penal)"],
  ["foul_edge", "Falta en el borde del área"],
  ["foul_mid", "Falta en mitad de cancha"],
  ["gk_1v1", "Portero: 1v1 (achicar / sacar de los pies)"],
  ["gk_smother", "Portero: rival llega con el balón largo (sacársela de los pies)"],
  ["gk_cross", "Portero: centro al área (agarrar / puños)"],
  ["gk_through", "Portero: pase filtrado (salir a despejar)"],
  ["gk_lob", "Portero: globo por arriba (estirada hacia atrás)"],
  ["gk_shot", "Portero: tiro esquinado (atajada lateral)"],
  ["gk_build", "Portero: salida jugada con los defensas"],
  ["slide_tackle", "Barrida: quitarle el balón al portador desde lejos"],
  ["slide_block", "Barrida: tapar un tiro"],
];
Object.assign(wc.prototype, {
  // ================================================================== B. PELOTA PARADA
  // El cobrador de una pelota parada tiene su propio cerebro: sólo puede pasar, tirar (si el libre es directo y está a tiro), centrar o despejar.
  // Antes salía "jugando" con la pelota como si fuera un poseedor cualquiera (infracción: la pelota debe ser jugada por otro / tocada una vez).
  p3SetPieceFilter(t, ctx, cands) {
    const sp = t.spTaker;
    if (!sp || sp.until <= this.elapsed) return;
    const dg = ctx.distGoal;
    for (let i = cands.length - 1; i >= 0; i--) {
      const c = cands[i], ok = c.key === "pass" || c.key === "clear" || (c.kind === "shot" && sp.direct && dg <= 36);
      if (!ok) { cands.splice(i, 1); continue; }
      if (c.kind === "shot") c.score += dg < 26 ? 0.14 : 0.04; // tiro libre a distancia de remate: el tiro compite fuerte con el pase
    }
    if (!cands.length) cands.push({ key: "clear", kind: "clear", score: 0, diff: 0.3, risky: false, why: ["pelota parada"] });
  },
  // Coreografía del equipo mientras se prepara un tiro libre no cinemático (lejano / lateral): atacantes al área, defensores en línea.
  p3SetPieceShape(rd, dt) {
    if (!rd || rd.kind === "throwin" || rd.kind === "goalkick" || rd.kind === "corner" || rd.takerId == null) return;
    const A = rd.team, D = 1 - A, dir = this.direction(A), gx = 52.5 * dir, dGoal = Math.hypot(gx - rd.x, rd.z);
    const mode = dGoal < 44 ? "cross" : "build";
    rd.p3mode = mode;
    if (mode !== "cross") return;
    const until = this.elapsed + 0.25;
    const off = this.players.filter((p) => p.team === A && !p.sentOff && !p.ragdoll && p.id !== rd.takerId && p.role !== "GK");
    const def = this.players.filter((p) => p.team === D && !p.sentOff && !p.ragdoll && p.role !== "GK");
    const rest = new Set([...off].sort((a, b) => a.x * dir - b.x * dir).slice(0, 3).map((p) => p.id)); // defensa de descuento
    const going = off.filter((p) => !rest.has(p.id));
    let near = 0;
    const slots = [[6, 2.6], [8, -3.4], [11, 7], [11.5, -7], [15, 0], [7, 10.5], [14, 12], [14, -12]].map(([b, z]) => ({ x: gx - dir * b, z, taken: false }));
    for (const p of [...going].sort((a, b) => Math.abs(b.x * dir) - Math.abs(a.x * dir))) {
      let best = null, bd = 1e9;
      for (const s of slots) { if (s.taken) continue; const d = Math.hypot(s.x - p.x, s.z - p.z); if (d < bd) { bd = d; best = s; } }
      if (!best) break;
      best.taken = true;
      p.p3Move = { x: best.x, z: best.z, r: 1, until, role: "SET_PIECE_BOX" };
      if (Math.hypot(best.x - p.x, best.z - p.z) < 6) near++;
    }
    if (near >= Math.min(4, going.length) || this.elapsed - rd.since > 9) rd.p3ready = true;
    let k = 0;
    for (const p of [...rest]) { const q = off.find((z) => z.id === p); if (!q) continue; q.p3Move = { x: gx - dir * 34, z: (k++ - 1) * 14, r: 0.55, until, role: "REST_DEFENSE" }; }
    // defensores: línea zonal frente al área chica y dos marcando hombre a hombre a los atacantes más peligrosos
    const dl = [...def].sort((a, b) => Math.abs(a.z) - Math.abs(b.z));
    dl.forEach((p, i) => {
      const zone = -15 + (30 * i) / Math.max(1, dl.length - 1);
      let tx = gx - dir * (i % 3 === 0 ? 5.5 : 9), tz = zone;
      const mk = i < 3 ? going[i] : null;
      if (mk) { tx = mk.x + dir * 1.2; tz = mk.z * 0.94; }
      // respeta los 9.15 m a la pelota
      const dx = tx - rd.x, dz = tz - rd.z, dd = Math.hypot(dx, dz);
      if (dd < 9.6) { tx = rd.x + (dx / (dd || 1)) * 9.6; tz = rd.z + (dz / (dd || 1)) * 9.6; }
      p.p3Move = { x: te(tx, -51, 51), z: te(tz, -32, 32), r: 1, until, role: "SET_PIECE_MARK" };
    });
  },
  // ¿el arquero debe jugar la pelota con los pies? (pase atrás de un compañero, o pelota fuera del área)
  p3MustPlayByFoot(f) { return !!(this.p3Foot && this.p3Foot.id === f.id && this.elapsed - this.p3Foot.at < 8 && this.lastTouch && this.lastTouch.team === f.team); },
  // pase atrás al arquero: sólo con el equipo presionado, en campo propio y con el arquero libre
  p3GkBackpassOk(t, gk, ctx) {
    if (gk.sentOff || gk.ragdoll) return false;
    const dir = this.direction(t.team);
    if (t.x * dir > -6 || ctx.pressure < 0.4) return false;
    const d = Math.hypot(gk.x - t.x, gk.z - t.z);
    if (d < 6 || d > 34) return false;
    return !this.players.some((q) => q.team !== t.team && !q.sentOff && q.role !== "GK" && Math.hypot(q.x - gk.x, q.z - gk.z) < 9);
  },
  // ================================================================== A. PORTERO
  p3InArea(t, x, z) {
    const s = this.direction(t.team), r = -52.5 * s, l = (x - r) * s;
    return l > -1 && l < P3_AREA_X && Math.abs(z) < P3_AREA_Z;
  },
  // balón en tau segundos (rodando o en el aire) sin rebotes: suficiente para leer un pase filtrado / centro
  p3BallAt(tau) {
    const b = this.ball, ground = b.y < 0.3;
    let x = b.x, z = b.z, vx = b.vx, vz = b.vz;
    for (let t = 0; t < tau; t += 0.05) {
      const dt = Math.min(0.05, tau - t), sp = Math.hypot(vx, vz);
      x += vx * dt; z += vz * dt;
      if (sp > 0) { const o = Math.max(0, sp - ballDecel(sp, ground) * dt) / sp; vx *= o; vz *= o; }
    }
    return { x, z };
  },
  p3GkRead(t, s, r) {
    const b = this.ball, rivals = this.players.filter((p) => p.team !== t.team && !p.sentOff && p.role !== "GK"), mates = this.players.filter((p) => p.team === t.team && !p.sentOff && p.role !== "GK");
    const carrier = this.owner && this.owner.team !== t.team ? this.owner : null;
    let threat = 99;
    for (const p of rivals) threat = Math.min(threat, Math.hypot(p.x - r, p.z));
    return { b, rivals, mates, carrier, threat, ballLine: (b.x - r) * s, ownPoss: !!(this.owner && this.owner.team === t.team) };
  },
  // Posición base: línea / centro armándose / achica en 1v1 / libero cuando no hay peligro (sale a dar juego).
  p3GkPosition(t, s, r, R) {
    const b = R.b, sweeper = t.style === "Sweeper Keeper" ? 1.35 : 0.85;
    let x = r + s * 2.1, z = te(b.z * 0.16, -2.6, 2.6), mode = "line";
    if (R.carrier && !this.shot) {
      const c = R.carrier, dc = Math.hypot(c.x - r, c.z);
      const isolated = !R.rivals.some((q) => q !== c && ze(q, c) < 9) && !R.mates.some((m) => ze(m, c) < 6);
      if (dc < 27) {
        const out = isolated ? te(dc * 0.3 * sweeper, 1.6, 10.5) : te(dc * 0.14, 1.4, 4.2), ux = (c.x - r) / dc, uz = c.z / dc;
        x = r + ux * out; z = te(uz * out, -5.5, 5.5);
        mode = isolated ? "closedown" : "line";
      }
    } else if (!this.shot && R.threat > 30 && !(this.owner && this.owner.team !== t.team)) {
      // no hay delanteros cerca: libero — sube a ofrecer el pase de seguridad y a cubrir la espalda de la línea
      const depth = te((R.ballLine - 18) * 0.3 + 4, 3.5, 16) * Math.min(1.2, sweeper);
      x = r + s * depth;
      const o = this.owner && this.owner.team === t.team ? this.owner : null;
      z = o ? -Math.sign(o.z || 1) * Math.min(7, Math.abs(o.z) * 0.5 + 2) : te(b.z * 0.25, -7, 7);
      mode = "sweeper";
    }
    // PRIMER PALO en ángulo cerrado (pedido explícito: "disparan desde cerca de la línea del córner
    // en un costado y en vez de cuidar el palo el arquero está en el medio"): cuanto más ancho (cerca
    // de la línea de banda) y más cerca de la línea de fondo esté el balón, más se cierra hacia el
    // palo cercano — y sale un paso de la línea para recortar el ángulo. No aplica con la pelota en
    // el aire (un centro/globo cae en otro punto — ahí no corresponde "cerrar el palo", rompía el
    // agarre de centros) ni en "sweeper" (no hay ángulo de remate que cubrir, está armando juego).
    // v2 (pedido explícito, "le siguen metiendo goles por no cubrir el poste cuando alguien va por el
    // costado"): antes esto SÓLO se aplicaba en modo "line" — pero un delantero aislado yendo por el
    // costado hacia el fondo cae en "closedown" (líneas de arriba, lo sigue por la recta arco-pelota),
    // que es justo el caso típico de ángulo cerrado, y se saltaba el cierre de palo entero. Ahora
    // también se mezcla en "closedown" (con menos peso, para no romper el achique del 1v1 recto).
    if (mode !== "sweeper" && b.y < 1.4) {
      const wideness = te((Math.abs(b.z) - 12) / 18, 0, 1), depth = Math.max(1, (b.x - r) * s), closeness = te(1 - depth / 22, 0, 1), tight = wideness * closeness;
      if (tight > 0) {
        const nearPost = Math.sign(b.z || 1) * (2.8 + tight * 1.3);
        const blend = mode === "closedown" ? tight * 0.55 : tight;
        z = z * (1 - blend) + te(nearPost, -4.1, 4.1) * blend;
        if (mode === "line") x = r + s * (2.1 + tight * 1.4);
      }
    }
    return { x, z, mode };
  },
  // ¿Hay un balón suelto / pase filtrado que un rival alcanza antes que cualquiera de nuestros defensores y que el arquero SÍ puede ganar?
  p3GkSweepRead(t, s, r, R) {
    const b = this.ball;
    if (this.owner || this.shot || b.y > 1.5) return null;
    const sp = Math.hypot(b.vx, b.vz);
    let prevOk = false;
    for (let tau = 0.3; tau <= 2.8; tau += 0.25) {
      const P = this.p3BallAt(tau);
      if (Math.abs(P.x) > 52 || Math.abs(P.z) > 33) break;
      const line = (P.x - r) * s;
      if (line < 1.5 || line > 36 || Math.abs(P.z) > 27) continue;
      const gk = this.p1ETA(t, P.x, P.z, { reach: 0.7 });
      let riv = 99, def = 99;
      for (const q of R.rivals) riv = Math.min(riv, this.p1ETA(q, P.x, P.z, { reach: 0.6 }));
      for (const q of R.mates) def = Math.min(def, this.p1ETA(q, P.x, P.z, { reach: 0.6 }));
      if (sp < 2.5 && line > 22) continue;
      if (gk <= tau + 0.05 && gk + 0.12 < riv && riv < tau + 0.9 && def > riv - 0.1) return { x: P.x, z: P.z, tau, gk, riv, line };
      prevOk = true;
    }
    void prevOk;
    return null;
  },
  // tiempo en que el balón (cayendo) cruza la altura h; null si no llega
  p3BallHeightTime(h) {
    const b = this.ball, a = -4.905, B = b.vy, C = b.y - h, disc = B * B - 4 * a * C;
    if (disc < 0) return null;
    const t1 = (-B - Math.sqrt(disc)) / (2 * a), t2 = (-B + Math.sqrt(disc)) / (2 * a), T = Math.max(t1, t2);
    return T > 0 ? T : null;
  },
  // Centros: ¿salgo a por él? y ¿lo agarro o lo despejo con los puños?
  p3GkCrossRead(t, s, r) {
    const n = this.ball, airborne = !this.owner && n.y > 0.9 && Math.hypot(n.vx, n.vz) > 3;
    if (!airborne || this.shot) return null;
    const grav = 9.81, disc = n.vy * n.vy + 2 * grav * (n.y - 0.13);
    if (disc <= 0) return null;
    const tLand = (n.vy + Math.sqrt(disc)) / grav;
    const tHand = this.p3BallHeightTime(2.5), tt = tHand != null && tHand < tLand ? tHand : tLand;
    const P = this.p3BallAt(tt), lx = te(P.x, -52, 52), lz = te(P.z, -34, 34);
    if (!(Math.abs(lx - r) < 16 && Math.abs(lz) < 19.5)) return null;
    const gkSpeed = 5.4 + t.stats.acceleration * 0.022, gkETA = Math.hypot(lx - t.x, lz - t.z) / gkSpeed;
    const crowd = this.players.filter((p) => p.role !== "GK" && !p.sentOff && Math.hypot(p.x - lx, p.z - lz) < 5).length;
    const rivalsIn = this.players.filter((p) => p.team !== t.team && p.role !== "GK" && !p.sentOff && Math.hypot(p.x - lx, p.z - lz) < 3.2).length;
    const conf = te(0.55 + (t.stats.defense - 70) * 0.006 - crowd * 0.1 + (t.personality.composure - 55) * 0.004 + (t.style === "Sweeper Keeper" ? 0.15 : 0), 0.08, 0.92);
    if (!(gkETA < tt + 0.35)) return null;
    // rival ganándole de cabeza: no sale
    let rivETA = 99;
    for (const p of this.players) if (p.team !== t.team && p.role !== "GK" && !p.sentOff) rivETA = Math.min(rivETA, this.p1ETA(p, lx, lz, { reach: 0.5 }));
    if (rivETA + 0.15 < gkETA) return null;
    const fist = crowd >= 3 || rivalsIn >= 2 || conf < 0.45;
    return { x: lx, z: te(lz, -9, 9), tHit: tt, gkETA, kind: fist ? "punch" : "claim", conf, crowd };
  },
  // dispara una acción de portero (usa t.dive como temporizador: el render y el contacto leen diveKind/diveDur)
  p3GkStartAct(t, kind, o = {}) {
    const durs = { side: 0.66, back: 0.72, claim: 0.78, punch: 0.72, smother: 0.62, step: 0.34 };
    t.dive = durs[kind] || 0.66; t.diveKind = kind; t.diveDur = t.dive; t.diveDir = o.dir || 1; t.state = "Dive";
    // Estirada baja/alta (pedido explícito): antes toda estirada lateral usaba la misma animación "a
    // media altura" sin importar si el remate iba raso o a la escuadra. o.height ("low"/"high", lo
    // decide gkSaveDecision según la altura del balón predicha) sólo cambia la pose que dibuja el
    // render — no toca el alcance real de la atajada.
    t.diveHeight = o.height || "mid";
    t.gkAct = { kind, tx: o.tx ?? t.x, tz: o.tz ?? t.z, t0: this.elapsed, done: false };
    if (o.tx != null) t.angle = Math.atan2(o.tx - t.x, o.tz - t.z);
    t.gkCd = this.elapsed + (kind === "smother" ? 2.4 : 0.5);
    this.p1Count && this.p1Count("gk_" + kind);
  },
  p3GkAct(t, e) {
    if (!(t.dive > 0)) return false;
    t.dive = Math.max(0, t.dive - e);
    if (t.dive <= 0) { t.gkAct = null; t.diveKind = null; return false; }
    const A = t.gkAct || {}, k = t.diveKind || "side", s = this.direction(t.team), r = -52.5 * s, dur = t.diveDur || 0.66, prog = 1 - t.dive / dur;
    let dx = 0, dz = 0;
    if (k === "side") {
      // Alcance atado al destino real (pedido explícito: "se tira de más, en realidad iba más cerca
      // de lo que se tiró"): antes se movía a velocidad fija (6/s) durante toda la animación sin
      // importar a dónde iba el remate — siempre recorría los mismos ~4m, así que un tiro apenas
      // desviado del cuerpo lo mandaba a estirarse de más y terminaba fuera de posición cuando la
      // pelota llegaba (p3GkContact mide distancia a la posición ACTUAL, no a la de destino). Ahora
      // avanza hacia gkAct.tz (el punto real por donde predijo que cruza el balón, ver
      // gkSaveDecision) y frena al llegar, en vez de recorrer siempre la misma distancia.
      const rem = te((A.tz ?? t.z) - t.z, -5.3, 5.3);
      dz = (rem === 0 ? t.diveDir : Math.sign(rem)) * Math.min(Math.abs(rem), 6 * e);
    } else if (k === "step") {
      // Paso corto (pedido explícito): misma lógica de "frenar al llegar" que la estirada, pero con
      // techo de velocidad más bajo — es un paso reactivo, no un vuelo lateral completo.
      const rem = te((A.tz ?? t.z) - t.z, -5.3, 5.3);
      dz = (rem === 0 ? t.diveDir : Math.sign(rem)) * Math.min(Math.abs(rem), 4.2 * e);
    }
    else if (k === "back") { dx = -s * 3.4 * e; dz = te((A.tz - t.z) * 2.2, -4, 4) * e; }
    else if (k === "claim" || k === "punch") { const f = Math.min(1, 5 * e); dx = (A.tx - t.x) * f; dz = (A.tz - t.z) * f; }
    else if (k === "smother") { const L = Math.hypot(A.tx - t.x, A.tz - t.z), sp = prog < 0.6 ? 6.4 : 1.5; if (L > 0.05) { dx = ((A.tx - t.x) / L) * Math.min(L, sp * e); dz = ((A.tz - t.z) / L) * Math.min(L, sp * e); } }
    t.x = te(t.x + dx, -52.4, 52.4);
    const lateral = k === "side" || k === "step";
    t.z = te(t.z + dz, lateral ? -5.3 : -33, lateral ? 5.3 : 33);
    t.vx = dx / e; t.vz = dz / e;
    t.state = "Dive";
    if (k === "smother") this.p3GkSmotherHit(t);
    return true;
  },
  // Sacar la pelota de los pies: el arquero se lanza al balón; si el rival la lleva, es un duelo (puede terminar en falta/penal).
  p3GkSmotherHit(f) {
    const c = this.owner;
    if (!c || c.team === f.team || !f.gkAct || f.gkAct.done) return;
    if (Math.hypot(c.x - f.x, c.z - f.z) > 1.55 && Math.hypot(this.ball.x - f.x, this.ball.z - f.z) > 1.3) return;
    f.gkAct.done = true;
    const pWin = te(0.5 + (f.stats.defense - 70) * 0.004 + (f.ai ? (f.ai.anticipation - 0.6) * 0.25 : 0) - (c.stats.dribbling - 70) * 0.004 - (c.stats.physical - 70) * 0.002 - (c.lastDecision === "hold" ? 0.06 : 0), 0.14, 0.86);
    this.p1Count && this.p1Count("gk_smother_duel");
    if (this.random() < pWin) {
      c.timer = 0.6; c.tackleAt = this.elapsed; c.think = 0.7;
      this.possession(f); f.state = "Catch"; f.think = 0.8;
      this.event("save", "¡LE SACÓ LA PELOTA DE LOS PIES!", `${f.name} se lanza y se la quita a ${c.name}`, f.team, f);
      this.excitement = Math.min(100, this.excitement + 14);
    } else if (this.random() < 0.3 + (c.stats.dribbling - 70) * 0.002) {
      this.commitFoul(f, c);
    } else { f.timer = 0.55; }
  },
  // Decisión de salir a sacarle el balón de los pies al rival (lanzarse a sus pies) — con cadencia (no cada frame)
  p3GkSmotherRead(t, R) {
    const c = R.carrier, b = R.b;
    if (!c || this.shot || (t.gkCd || 0) > this.elapsed || (t.p3n || 0) > this.elapsed) return null;
    t.p3n = this.elapsed + 0.22;
    const dBall = Math.hypot(b.x - t.x, b.z - t.z), dCar = ze(c, t);
    if (dBall > 3.5 || dBall < 0.8 || dCar > 4.6) return null;
    const s = this.direction(t.team), line = (c.x - (-52.5 * s)) * s;
    if (line > 19 || Math.abs(c.z) > 22) return null;
    const exposed = Math.hypot(b.x - c.x, b.z - c.z) > 0.6 || Math.hypot(c.vx, c.vz) > 4.6;
    if (!exposed) return null;
    const p = te(0.42 + (t.personality.aggression - 50) / 160 + (t.style === "Sweeper Keeper" ? 0.16 : 0) + (t.stats.defense - 70) * 0.004 - (c.stats.dribbling - 70) * 0.003, 0.12, 0.88);
    if (this.random() > p) return null;
    return { tx: b.x + b.vx * 0.16, tz: b.z + b.vz * 0.16 };
  },
  // ---- keeper(): orquestador
  keeper(t, e) {
    if (this.owner === t) { this.goalKeeperDecide(t); return; }
    if (this.p3GkAct(t, e)) return;
    const s = this.direction(t.team), r = -52.5 * s, R = this.p3GkRead(t, s, r);
    let { x: a, z: o, mode } = this.p3GkPosition(t, s, r, R), rate = 0.7, sprint = false;
    const pred = this.gkShotPrediction(t, s);
    if (pred) {
      o = te(pred.d, pred.isHeader ? -5.4 : -4.5, pred.isHeader ? 5.4 : 4.5);
      t.state = "PrepareSave";
      if (this.gkSaveDecision(t, pred)) return;
    } else {
      t.state = "TrackBall";
      const smo = this.p3GkSmotherRead(t, R);
      if (smo) { this.p3GkStartAct(t, "smother", smo); return; }
      const sweep = this.p3GkSweepRead(t, s, r, R);
      const cross = sweep ? null : this.p3GkCrossRead(t, s, r);
      if (sweep) { a = sweep.x; o = sweep.z; rate = 1.05; sprint = true; t.state = "Sweep"; t.p1 = t.p1 || {}; this.p1Count && this.p1Count("gk_sweep"); }
      else if (cross) {
        a = cross.x; o = cross.z; t.state = "Rush"; rate = 1;
        const near = Math.hypot(cross.x - t.x, cross.z - t.z) < 2.1 && cross.tHit < 0.5;
        if (near) { this.p3GkStartAct(t, cross.kind, { tx: cross.x, tz: cross.z }); return; }
      } else if (mode === "closedown") { t.state = "Rush"; rate = 0.95; }
    }
    if (!this.shot && Math.abs(this.ball.x - r) < 12 && Math.abs(this.ball.z) < 13 && !this.owner) { a = this.ball.x; o = this.ball.z; }
    t.sprinting = sprint;
    // El arquero nunca le da la espalda a la pelota mientras achica/retrocede/se reacomoda en la línea
    // (pedido explícito) — mira siempre hacia el balón, sin importar hacia dónde tenga que moverse.
    // OJO: esto NO debe frenarlo cuando ya se comprometió a salir corriendo a algo (Rush/Sweep, cross,
    // 1v1) — ahí el destino es "adelantarse a dónde va a caer/estar la pelota", no "retroceder sin dar
    // la espalda", y la pelota en el aire suele estar bastante lejos del punto de caída que persigue:
    // aplicarle el freno de "retroceso" ahí lo hacía llegar tarde y dejó de atajar centros (0 agarres).
    if (!sprint && t.state !== "Rush" && t.state !== "Sweep") t.faceAt = { x: this.ball.x, z: this.ball.z };
    this.move(t, a, o, e, rate);
  },
  // ¿la predicción es un globo por encima del arquero? → estirada hacia atrás
  gkShotPrediction(t, s) {
    const n = this.ball, isHeader = this.shot && this.shot.type === "Cabeceo", l = n.vx * s < -5 ? (t.x - n.x) / n.vx : 100, shotWindow = isHeader ? 1.55 : 1.25;
    if (!(this.shot && this.shot.team !== t.team && l > 0 && l < shotWindow)) return null;
    return { d: n.z + n.vz * l, l, isHeader, h: n.y + n.vy * l - 4.905 * l * l };
  },
  gkSaveDecision(t, pred) {
    const cog = t.ai.cog, reactWindow = 0.4 * te(0.75 + cog.anticipation * 0.5, 0.7, 1.25), marginNeeded = 0.65 * te(1.3 - cog.decisionQuality * 0.5, 0.75, 1.3);
    if (this.elapsed - this.kickedAt <= 0.12) return false;
    // Cooldown tras tirarse (pedido explícito, medio segundo): t.gkCd ya lo fija p3GkStartAct pero
    // nunca se consultaba — apenas terminaba la animación del vuelo (t.dive llega a 0) el arquero
    // podía volver a lanzarse en el mismo frame si otra predicción de tiro lo disparaba.
    if ((t.gkCd || 0) > this.elapsed) return false;
    const lob = pred.h != null && pred.h > 2.05 && pred.h < 3.6 && pred.l < reactWindow * 1.5 && Math.abs(pred.d) < 4.2;
    if (lob) { this.p3GkStartAct(t, "back", { tx: t.x, tz: te(pred.d, -4.2, 4.2), dir: Math.sign(pred.d - t.z) || 1 }); return true; }
    const off = Math.abs(pred.d - t.z);
    if (pred.l < reactWindow && off > marginNeeded) {
      const height = pred.h == null ? "mid" : pred.h < 0.55 ? "low" : pred.h > 1.5 ? "high" : "mid";
      this.p3GkStartAct(t, "side", { dir: Math.sign(pred.d - t.z) || 1, tz: pred.d, height });
      return true;
    }
    // PASO CORTO (pedido explícito, "le hacen gol porque en realidad iba más cerca de lo que se
    // tiró"): entre el radio parado (p3GkContact, ~0.6-0.7m) y marginNeeded (el umbral que dispara la
    // estirada completa, ~0.5-0.85m) había una franja de tiros a media distancia que no llegaba a
    // taparse parado PERO tampoco disparaba ninguna reacción — el arquero se quedaba quieto y la
    // dejaba pasar. Cubre esa franja con un paso reactivo corto, sin comprometerse a la estirada
    // completa (que ahora además frena al llegar a destino, ver p3GkAct — esto es un refuerzo extra
    // para los casos que ni siquiera necesitan tanto viaje).
    if (pred.l < reactWindow * 1.15 && off > 0.5 && off <= marginNeeded * 1.4) {
      this.p3GkStartAct(t, "step", { dir: Math.sign(pred.d - t.z) || 1, tz: pred.d });
      return true;
    }
    return false;
  },
  gkTriggerDive(t, dir) { this.p3GkStartAct(t, "side", { dir }); },
  // ---- Contacto arquero-balón (reemplaza el bloque inline del bucle de balones divididos)
  p3GkContact(f, e) {
    const s = Math.hypot(e.vx, e.vz), g = ze(f, e), kind = f.dive > 0 ? f.diveKind || "side" : null, dd = this.direction(f.team);
    if (kind === "smother" && this.owner && this.owner.team !== f.team) { this.p3GkSmotherHit(f); return; }
    const reachMod = te((f.heightM || 1.8) / 1.85, 0.9, 1.08), reactMs = this.elapsed - this.kickedAt, diveGrow = f.dive > 0 ? te(reactMs * 2.1, 0, 0.55) : 0, groundedFast = e.y < 0.5 && s > 20 ? 0.82 : 1;
    let v = (0.66 + diveGrow) * reachMod * groundedFast, m = (f.dive > 0 ? 1.75 : 2.15) * reachMod;
    if (kind === "claim" || kind === "punch") { m = 3.05 * reachMod; v = 1.15 * reachMod + 0.3; }
    else if (kind === "back") { m = 3.0 * reachMod; v = 1.0 + diveGrow * 0.6; }
    else if (kind === "smother") { m = 0.9; v = 1.3 * reachMod; }
    else if (kind === "side") {
      // Hitbox atada a la pose real (pedido explícito: "ajustar la hitbox al área de contacto real
      // del modelo"): antes la estirada lateral usaba SIEMPRE el mismo techo de altura (m) y el mismo
      // alcance lateral (v), sin importar si diveHeight ("low"/"high", ver fulbo.html render) mostraba
      // al arquero tirándose raso con las manos abajo o estirándose hacia arriba a la escuadra — la
      // pose visual cambiaba pero la zona de contacto real no la seguía. Los factores salen de la
      // animación misma: sin(rollMax) de cada pose (low=0.85rad→~0.75, mid=1.48rad→~0.996,
      // high=1.85rad→~0.96) marca cuánto se estira realmente el cuerpo hacia el costado.
      const dh = f.diveHeight || "mid";
      v *= dh === "low" ? 0.8 : dh === "high" ? 0.97 : 1;
      m = (dh === "low" ? 1.15 : dh === "high" ? 2.3 : 1.75) * reachMod;
    }
    // PASO CORTO (pedido explícito, nueva reacción intermedia entre "parado" y "estirada completa",
    // ver gkSaveDecision): más alcance lateral que parado pero techo de altura más bajo que una
    // estirada — es un paso con las manos al costado, no llega a taparse remates altos con esto.
    else if (kind === "step") { m = 1.35 * reachMod; v = te(0.95 + diveGrow * 0.5, 0.95, 1.4) * reachMod; }
    if (!(g < v && e.y < m && !this.owner && this.elapsed - this.kickedAt > 0.15)) return;
    // Reglamento: fuera del área o pase de pie de un compañero → el arquero juega con los pies (sin manos).
    const inArea = this.p3InArea(f, e.x, e.z), foot = !inArea || this.p3MustPlayByFoot(f);
    if (foot) {
      this.possession(f); f.state = "Receive"; f.think = 0.45; f.gkFootAt = this.elapsed;
      if (inArea) this.event("restart", "PASE ATRÁS", `${f.name} debe jugarla con los pies`, f.team, f);
      return;
    }
    const skill = (f.stats.defense - 70) * 0.004 + (f.personality.consistency - 70) * 0.002;
    if (this.shot && this.shot.team !== f.team) {
      if (this.random() < 0.03) return;
      this.secondBallUntil = this.elapsed + 1.6; this.stats[f.team].saves++;
      this._aiShot && (this._aiShot.result = "save"); this.excitement = 90;
      this.event("save", f.dive > 0 ? "¡ATAJADÓN!" : "¡Buena atajada!", `${f.name} mantiene vivo a su equipo`, f.team, f);
      // ¿la retiene o rebota? Los remates fuertes / estirados / la mala mano rebotan; un arquero bien parado se queda con la pelota.
      const holdP = te(0.6 + skill - Math.max(0, s - 22) * 0.02 - (kind === "side" ? 0.14 : 0) - (kind === "back" ? 0.1 : 0) - (e.y < 0.4 && s > 20 ? 0.04 : 0), 0.12, 0.9);
      if (this.random() < holdP) { this.possession(f); f.state = "Catch"; f.think = 0.8; this.p1Count && this.p1Count("gk_hold"); return; }
      // rebote: córner (hacia atrás) / a un lado (sigue el juego) / AL CENTRO DEL ÁREA (peligroso). El buen arquero controla el rebote.
      const safe = te(0.5 + skill * 1.4, 0.2, 0.85), rr = this.random();
      const sd = e.z >= 0 ? 1 : -1;
      let how;
      if (rr < safe * 0.55) how = "corner"; else if (rr < safe) how = "wide"; else how = "centre";
      if (how === "corner") { this.deflectBehind = this.elapsed; e.vx = -dd * this.range(4, 8); e.vz = sd * this.range(10, 18); e.vy = this.range(3, 6); }
      else if (how === "wide") { e.vx = dd * this.range(0, 4); e.vz = sd * this.range(8, 14); e.vy = this.range(2, 4.5); }
      else { e.vx = dd * this.range(4, 8); e.vz = this.range(-3.5, 3.5) - Math.sign(e.z || 0) * 1.5; e.vy = this.range(2, 4); this.event("save", "REBOTE AL CENTRO DEL ÁREA", "la pelota queda viva frente al arco", f.team, f); }
      this.p1Count && this.p1Count("gk_rebound_" + how);
      this.shot = null; this.lastTouch = f; this.kickedAt = this.elapsed; f.state = "Parry";
      return;
    }
    if (e.y > 0.55) { // centro
      const crowded = this.players.filter((p) => p.role !== "GK" && !p.sentOff && Math.hypot(p.x - f.x, p.z - f.z) < 5).length;
      const punchNow = kind === "punch" || (kind == null && crowded >= 2 && this.random() < te(0.1 + crowded * 0.13 - (f.stats.defense - 70) * 0.003, 0.04, 0.6));
      if (punchNow) {
        const side = (e.z >= 0 ? 1 : -1) * (this.random() < 0.7 ? 1 : -1);
        e.vx = dd * this.range(8, 13); e.vz = side * this.range(3, 10); e.vy = this.range(4, 7);
        this.lastTouch = f; this.kickedAt = this.elapsed; this.secondBallUntil = this.elapsed + 1.6; f.state = "Parry";
        this.event("save", "DESPEJE CON PUÑOS", `${f.name} rechaza el centro`, f.team, f);
        this.p1Count && this.p1Count("gk_punch");
        return;
      }
      if (kind === "claim") {
        const okP = te(0.66 + skill - crowded * 0.07 - (e.y > 2.3 ? 0.07 : 0), 0.2, 0.95);
        if (this.random() > okP) { // se le escapa: cae suelto
          e.vx *= 0.3; e.vz += this.range(-3, 3); e.vy = this.range(1, 3); this.lastTouch = f; this.kickedAt = this.elapsed; f.state = "Parry";
          this.p1Count && this.p1Count("gk_claim_fumble");
          return;
        }
        this.event("save", "¡SALE Y SE QUEDA CON EL CENTRO!", `${f.name} agarra la pelota en el aire`, f.team, f);
        this.p1Count && this.p1Count("gk_claim");
      }
    }
    this.possession(f); f.state = "Catch"; f.think = 0.8;
  },
  // ================================================================== C. BARRIDAS
  // Barrida para (a) quitarle el balón al portador desde fuera del alcance de la pierna y (b) tapar un tiro.
  p3SlideScan() {
    if (!this.tlbEnabled) return;
    const b = this.ball, sp = Math.hypot(b.vx, b.vz);
    const free = (d) => !(d.sentOff || d.ragdoll || d.role === "GK" || (d.tl && d.tl.kind === "slide" && this.elapsed - d.tl.t0 < 1.2) || this.elapsed - (d.tackleAt || -9) < 2.2 || (d.slideCdAt || 0) > this.elapsed || d.state === "Shoot");
    if (this.shot && b.y < 1.15 && sp > 10) {
      let best = null;
      for (const d of this.players) {
        if (d.team === this.shot.team || !free(d)) continue;
        for (const tau of [0.15, 0.25, 0.35, 0.5, 0.65]) {
          const px = b.x + b.vx * tau, pz = b.z + b.vz * tau, dist = Math.hypot(px - d.x, pz - d.z);
          if (dist > 3.4 || dist < 0.6) continue;
          const stand = dist / (4.2 + d.stats.speed * 0.035) < tau - 0.04; // llega corriendo y se para: no hace falta tirarse
          if (stand && dist < 1.8) break;
          if (!best || tau < best.tt) best = { d, px, pz, tt: tau, dist };
          break;
        }
      }
      if (best) {
        const e = this.tlSlideEval(best.d, this.lastTouch || best.d, { loose: true, pass: false });
        const p = te(0.28 + (best.d.personality.aggression - 50) / 220 + (best.d.stats.defense - 60) / 500, 0.08, 0.6);
        best.d.slideCdAt = this.elapsed + 4;
        if (this.random() < p) this.tlStartSlide({ d: best.d, px: best.px, pz: best.pz, e: { ...e, success: te(0.5 + best.d.stats.defense * 0.003, 0.3, 0.8) }, ctx: { block: true, loose: true }, tt: best.tt, dist: best.dist });
      }
      return;
    }
    const c = this.owner;
    if (!c || this.elapsed - (c.controlAt || 0) < 0.2) return;
    for (const d of this.players) {
      if (d.team === c.team || !free(d)) continue;
      const dist = Math.hypot(c.x - d.x, c.z - d.z);
      if (dist < 2.3 || dist > 4.6) continue;
      const ux = (c.x - d.x) / dist, uz = (c.z - d.z) / dist, closing = d.vx * ux + d.vz * uz, dSp = Math.hypot(d.vx, d.vz);
      if (closing < 3.0 || dSp < 3.6) continue;
      if (this.owner.x * this.direction(d.team) < -46) continue;
      const reach = (4.2 + d.stats.speed * 0.035), tArrive = (dist - 1.7) / reach;
      if (tArrive < 0.28) continue; // ya llega con la pierna
      const ev = this.tlSlideEval(d, c, { closingFast: true, canRun: false });
      const p = te(ev.p * 0.55 + 0.05 + (c.stats.dribbling > 82 ? -0.04 : 0), 0.02, 0.5);
      d.slideCdAt = this.elapsed + 5;
      if (this.random() < p) { this.tlStartSlide({ d, px: c.x + c.vx * 0.3, pz: c.z + c.vz * 0.3, e: ev, ctx: { tackleFar: true, loose: false }, tt: Math.max(0.2, tArrive), dist }); break; }
    }
  },
  // ================================================================== D. LABORATORIO DE JUGADAS
  p3Scenarios() { return P3_SCENARIOS; },
  p3Place(p, x, z) { p.x = x; p.z = z; p.vx = p.vz = 0; p.state = "Positioning"; p.timer = 0; p.tl = null; p.tlLock = 0; p.dive = 0; p.ragdoll = null; },
  p3DebugScenario(kind, team = 0) {
    if (this.ended) return false;
    const A = team, D = 1 - team, dir = this.direction(A), gx = 52.5 * dir, own = -52.5 * dir;
    const outfield = (t) => this.players.filter((p) => p.team === t && p.role !== "GK" && !p.sentOff);
    const gkOf = (t) => this.players.find((p) => p.team === t && p.role === "GK" && !p.sentOff);
    const stop = () => { this.owner = null; this.receiver = null; this.shot = null; this.pendingOffside = null; const b = this.ball; b.vx = b.vz = b.vy = 0; b.y = 0.13; this.tlSlideCd = [0, 0]; };
    const outBall = (x, z, vx, vz) => { const b = this.ball; b.x = x; b.z = z; b.y = 0.13; b.vx = vx; b.vz = vz; b.vy = 0; if (this.restartData) this.restartData.since = this.elapsed; };
    const setBall = (x, z) => { const b = this.ball; b.x = x; b.z = z; b.y = 0.13; b.vx = b.vz = b.vy = 0; };
    this.phase = "playing"; this.wait = 0;
    stop();
    const cx = (m) => te(m, -51, 51);
    switch (kind) {
      case "fk_direct_near": stop(); return this.restart(A, gx - dir * 20, 1.5, "Tiro libre", true), true;
      case "fk_direct_mid": return this.restart(A, gx - dir * 25, -9, "Tiro libre", true), true;
      case "fk_far_cross": return this.restart(A, gx - dir * 34, 3, "Tiro libre", true), true;
      case "fk_wide_cross": return this.restart(A, gx - dir * 26, 26, "Tiro libre", true), true;
      case "fk_midfield": return this.restart(A, gx - dir * 52, 8, "Tiro libre", true), true;
      case "fk_own_third": return this.restart(A, own + dir * 22, -12, "Tiro libre", true), true;
      case "penalty": return this.awardPenalty(A, D), true;
      // Los reinicios "por fuera de la cancha" cancelan solos si el balón sigue adentro (backIn): se lo deja fuera, como en un partido real.
      case "corner_l": case "corner_r": { const z = kind === "corner_l" ? -1 : 1; this.restart(A, gx - dir * 1.2, z * 33.2, "Tiro de esquina", false, "corner"); return outBall(dir * 53.6, z * 30, dir * 2, 0), true; }
      case "throwin_att": { this.restart(A, cx(gx - dir * 22), -32, "Saque de banda", false, "throwin"); return outBall(cx(gx - dir * 22), -34.8, 0, -2), true; }
      case "goalkick": { this.restart(A, own + dir * 5.5, 0, "Saque de arco", false, "goalkick"); return outBall(-dir * 53.6, 1, -dir * 2, 0), true; }
      case "foul_box": case "foul_edge": case "foul_mid": {
        const fx = kind === "foul_box" ? gx - dir * 11 : kind === "foul_edge" ? gx - dir * 19 : dir * 0, fz = kind === "foul_box" ? 5 : 3;
        const vic = outfield(A).find((p) => p.role === "FWD") || outfield(A)[0], fou = outfield(D).find((p) => p.role === "DEF") || outfield(D)[0];
        this.p3Place(vic, fx, fz); this.p3Place(fou, fx - dir * 0.9, fz - 0.4); setBall(fx + dir * 0.4, fz);
        this.possession(vic); vic.vx = dir * 2; fou.vx = dir * 3;
        this.commitFoul(fou, vic); return true;
      }
      case "gk_1v1": {
        const c = outfield(A).find((p) => p.role === "FWD") || outfield(A)[0];
        for (const p of outfield(D)) this.p3Place(p, gx - dir * 44, p.z * 0.6);
        for (const p of outfield(A)) if (p !== c) this.p3Place(p, gx - dir * 46, p.z * 0.6);
        this.p3Place(c, gx - dir * 22, 3); setBall(c.x + dir * 0.5, 3); this.possession(c); return true;
      }
      case "gk_smother": {
        const c = outfield(A).find((p) => p.role === "FWD") || outfield(A)[0];
        for (const p of outfield(D)) this.p3Place(p, gx - dir * 44, p.z * 0.6);
        for (const p of outfield(A)) if (p !== c) this.p3Place(p, gx - dir * 46, p.z * 0.6);
        this.p3Place(c, gx - dir * 12, 1.2); c.vx = dir * 4.6; this.possession(c); c.think = 3; this.ball.x = c.x + dir * 1.5; this.ball.vx = dir * 5.2; return true;
      }
      case "gk_cross": {
        const c = outfield(A).find((p) => p.role !== "DEF") || outfield(A)[0];
        this.p3Place(c, gx - dir * 8, 30); setBall(c.x, 30); const b = this.ball;
        const tx = gx - dir * 6, tz = 2.5, T = 1.35;
        for (const p of outfield(A)) if (Math.hypot(p.x - tx, p.z - tz) < 9) this.p3Place(p, gx - dir * 24, p.z);
        for (const p of outfield(D)) if (Math.hypot(p.x - tx, p.z - tz) < 4) this.p3Place(p, gx - dir * 14, p.z); b.vx = (tx - b.x) / T; b.vz = (tz - b.z) / T; b.vy = 0.5 * 9.81 * T - (b.y - 0.13) / T; b.y = 0.5;
        this.lastTouch = c; this.receiver = null; this.kickedAt = this.elapsed; return true;
      }
      case "gk_through": {
        const f = outfield(A).find((p) => p.role === "FWD") || outfield(A)[0], m = outfield(A).find((p) => p.role === "MID" && p !== f) || outfield(A)[1];
        for (const p of outfield(D)) this.p3Place(p, gx - dir * (34 + Math.abs(p.z) * 0.15), p.z * 0.8);
        this.p3Place(f, gx - dir * 34, 5); this.p3Place(m, gx - dir * 48, 3); setBall(m.x, m.z); const b = this.ball;
        b.vx = dir * 15; b.vz = 0.4; b.vy = 0; this.lastTouch = m; this.receiver = f; this.kickedAt = this.elapsed; return true;
      }
      case "gk_lob": {
        const f = outfield(A).find((p) => p.role === "FWD") || outfield(A)[0], g = gkOf(D);
        this.p3Place(f, gx - dir * 19, 1); if (g) this.p3Place(g, gx - dir * 6, 0); setBall(f.x + dir * 0.4, 1); const b = this.ball;
        b.vx = dir * 15.5; b.vz = -0.5; b.vy = 7.3; b.y = 0.4; this.lastTouch = f; this.kickedAt = this.elapsed;
        this.shot = { team: A, player: f.id, type: "Tiro", at: this.elapsed, power: 1 }; return true;
      }
      case "gk_shot": {
        const f = outfield(A).find((p) => p.role === "FWD") || outfield(A)[0];
        this.p3Place(f, gx - dir * 17, 6); setBall(f.x + dir * 0.4, 6); const b = this.ball;
        b.vx = dir * 21; b.vz = -3.6; b.vy = 1.2; b.y = 0.2; this.lastTouch = f; this.kickedAt = this.elapsed;
        this.shot = { team: A, player: f.id, type: "Tiro", at: this.elapsed, power: 1 }; return true;
      }
      case "slide_tackle": {
        const c = outfield(A).find((p) => p.role === "MID") || outfield(A)[0], d = outfield(D).find((p) => p.role === "DEF") || outfield(D)[0], x0 = dir * -6;
        this.p3Place(c, x0, 8); setBall(c.x + dir * 0.6, 8); this.possession(c); c.vx = dir * 3.2;
        this.p3Place(d, x0 + dir * 5.2, 8.6); d.vx = -dir * 5.5; d.vz = 0; c.lastDecision = "carry";
        const ev = this.tlSlideEval(d, c, { closingFast: true });
        this.tlStartSlide({ d, px: c.x + dir * 0.9, pz: 8, e: { ...ev, success: 0.9 }, ctx: { tackleFar: true }, tt: 0.4, dist: 4.4 }); return true;
      }
      case "slide_block": {
        const f = outfield(A).find((p) => p.role === "FWD") || outfield(A)[0], d = outfield(D).find((p) => p.role === "DEF") || outfield(D)[0];
        this.p3Place(f, gx - dir * 19, 2); setBall(f.x + dir * 0.4, 2); const b = this.ball; b.vx = dir * 22; b.vz = -0.5; b.vy = 0; b.y = 0.2;
        this.lastTouch = f; this.kickedAt = this.elapsed; this.shot = { team: A, player: f.id, type: "Tiro", at: this.elapsed, power: 1 };
        this.p3Place(d, gx - dir * 13, 1.2); d.vx = dir * -1; d.vz = 0;
        const ev = this.tlSlideEval(d, f, { loose: true });
        this.tlStartSlide({ d, px: gx - dir * 12.4, pz: 1.4, e: { ...ev, success: 0.95 }, ctx: { block: true, loose: true }, tt: 0.26, dist: 1 }); return true;
      }
      case "gk_build": {
        const g = gkOf(A), d1 = outfield(A).find((p) => p.role === "DEF");
        for (const p of outfield(D)) this.p3Place(p, own + dir * 42 + (p.z > 0 ? 3 : -3), p.z * 0.7);
        if (g) { this.p3Place(g, own + dir * 3, 0); setBall(g.x + dir * 0.6, 0); this.possession(g); g.controlAt = this.elapsed - 2; }
        void d1; return true;
      }
    }
    return false;
  },
});
