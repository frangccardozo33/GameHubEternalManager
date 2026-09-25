// <<P1_BEGIN>>
// ============================================================================================
// FASE 1 — RECONSTRUCCIÓN DEL COMPORTAMIENTO DEL MATCH ENGINE  (fuente: p1/p1.js, inyectado por p1/inject.mjs)
//
// Una única cadena causal:  BALL PLAN → ETA/PITCH CONTROL → PASS PLAN → THREAT → DEFENSA/DUELO → PACE → move()
//
//  1. Movimiento ......... p1Phys / p1ETA (mismo modelo de aceleración que usa move(): ETA = física real)
//  2. Balón .............. ballFlightStep (integrador ÚNICO, también usado por updateBall) + p1SimBall / p1LivePlan
//  3. Pase ............... p1PlanPass (PassPlan) + p1PassVariants; pasador y receptor comparten interceptPoint
//  4. Receptor ........... p1ReceiveTarget: persigue el punto de la trayectoria viva (no un target congelado)
//  5. Defensa ............ p1CarrierRead / p1DefendCarrier (timeToShot vs timeToContact), p1DuelEval (duelo real)
//  6. Amenaza ............ p1ThreatMap (amenaza operativa que decide PRESS/COVER/MARK/TRACK/BLOCK)
//  7. Ataque sin balón ... p1PosExtras (línea de pase, triángulos, beneficio al compañero, anti-persecución)
//  8. Ritmo .............. p1Pace: velocidad = destino + intención + urgencia + atributos
//  9. Telemetría ......... p1Log / p1DebugPlayer
// ============================================================================================
// Física del balón (Fase 4, datos reales: ver REPORTE_FASE4.md). Balón FIFA: 0.43 kg, r = 0.11 m (A = 0.038 m²).
//  · Aire: arrastre cuadrático, F = ½·ρ·Cd·A·v² ⇒ a = 0.053·Cd·v². Cd cae de ≈0.47 (subcrítico, ≤12 m/s) a ≈0.22 (>25 m/s).
//  · Rodando sobre césped: resistencia casi constante (μ≈0.075 ⇒ 0.75 m/s²) + arrastre del aire; se detiene (no hay cola infinita).
//  · Pique: e ≈ 0.65 (0.64–0.68 medido en balones reglamentarios) y el césped frena la componente horizontal.
const BALL_ROLL_A = 0.75, BALL_E = 0.65, BALL_BOUNCE_H = 0.86;
function ballCd(v) { return v <= 12 ? 0.47 : v >= 25 ? 0.22 : 0.47 - 0.0192 * (v - 12); }
function ballDecel(v, ground) { return (ground ? BALL_ROLL_A : 0) + 0.053 * ballCd(v) * v * v; }
const P1_ARRIVAL = { feet: 11, space: 12.5, through: 14.5, switch: 12.5, cross: 12 };
const P1_TRAVEL = { feet: 3.6, space: 8.5, through: 14, switch: 9, cross: 9 };
const P1_MARGIN = { feet: 0.12, space: 0.0, through: -0.05, switch: 0.05, cross: -0.15 };

Object.assign(wc.prototype, {
  // ------------------------------------------------------------------ estado / telemetría
  p1S() {
    return this.p1 || (this.p1 = { log: [], threat: [[], []], cnt: {}, plan: null, planAt: -9, planKey: "", rt: null });
  },
  p1Count(k, n = 1) {
    const c = this.p1S().cnt;
    c[k] = (c[k] || 0) + n;
  },
  p1Log(kind, o) {
    const s = this.p1S();
    if (s.off) return;
    o.kind = kind;
    o.at = +this.elapsed.toFixed(2);
    s.log.push(o);
    if (s.log.length > 600) s.log.splice(0, 200);
  },
  // ------------------------------------------------------------------ 1) MOVIMIENTO: parámetros físicos + ETA
  // vrun/vsp conservan las velocidades máximas originales (auditadas: 24-29 km/h a ritmo de carrera,
  // hasta ~36 km/h en sprint — plausibles). Lo que se reemplazó es la CURVA: aceleración limitada
  // (m/s²) que decrece al acercarse a vmax, frenada y giro con límites propios.
  p1Phys(p) {
    const st = p.stamina ?? 100,
      fat = 0.8 + (0.2 * st) / 100,
      vrun = (4.4 + p.stats.speed * 0.037) * fat,
      ac = p.stats.acceleration,
      af = 0.88 + (0.12 * st) / 100;
    return { vrun, vsp: vrun * (st > 40 ? 1.24 : 1), a0: (3.3 + ac * 0.036) * af, aBrake: 4.6 + ac * 0.022, aLat: 5 + ac * 0.03 }; // Fase 3: calibrado contra Metrica (aceleración p99 ≈3-5, frenada ≈-5..-6 m/s²)
  },
  // Tiempo de llegada (s) a (x,z): resuelve x(t)=vm·t+(v0−vm)·τ·(1−e^(−t/τ)) — exactamente la dinámica de move()
  // (aceleración a0·(1−v/vm)) — más reacción y corrección lateral. `o.react` sobreescribe la reacción.
  p1ETA(p, x, z, o) {
    const dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz), P = this.p1Phys(p), an = p.ai ? p.ai.anticipation : 0.6;
    let react = o && o.react != null ? o.react : 0.1 + (1 - an) * 0.22;
    if (p.ragdoll) react += 1.2;
    else if (p.timer > 0) react += 0.45;
    const reach = o && o.reach ? o.reach : 0, dd = Math.max(0, d - reach);
    if (dd < 0.05) return react * 0.5;
    const vm = o && o.vm ? o.vm : P.vsp, ux = dx / d, uz = dz / d, v0 = p.vx * ux + p.vz * uz, perp = Math.abs(-p.vx * uz + p.vz * ux), tau = vm / P.a0;
    let t = dd / vm + tau * 0.6;
    for (let i = 0; i < 4; i++) {
      const ex = Math.exp(-t / tau), f = vm * t + (v0 - vm) * tau * (1 - ex) - dd, fp = vm + (v0 - vm) * ex;
      t -= f / Math.max(0.6, fp);
      if (t < 0.04) t = 0.04;
    }
    return react + t + (perp / P.aLat) * 0.55;
  },
  // ------------------------------------------------------------------ 2) MODELO TEMPORAL ÚNICO DEL BALÓN
  // Mismo integrador que updateBall (gravedad, efecto, rebote, rozamiento rodando/aire). Nadie más predice el balón.
  ballFlightStep(s, dt) {
    const r = s.spin * 0.12, a = s.vx;
    s.vx += -s.vz * r * dt;
    s.vz += a * r * dt;
    s.vy -= 9.81 * dt;
    s.y += s.vy * dt;
    if (s.y < 0.13) {
      s.y = 0.13;
      if (s.vy < -0.8) { s.vy = -s.vy * BALL_E; if (s.vy > 1.2) { s.vx *= BALL_BOUNCE_H; s.vz *= BALL_BOUNCE_H; } } else s.vy = 0;
    }
    const sp = Math.hypot(s.vx, s.vz);
    if (sp > 0) {
      const o = Math.max(0, sp - ballDecel(sp, s.y <= 0.24) * dt) / sp;
      s.vx *= o;
      s.vz *= o;
    }
    s.spin *= Math.exp(-dt * 0.5);
    s.x += s.vx * dt;
    s.z += s.vz * dt;
  },
  // BallPlan: posición/velocidad/altura de la pelota en t=0, step, 2·step… (arrays planos).
  p1SimBall(b, horizon = 3.4, step = 0.05) {
    const n = Math.ceil(horizon / step) + 1, P = { step, n, nValid: n, x: new Float32Array(n), z: new Float32Array(n), y: new Float32Array(n), vx: new Float32Array(n), vz: new Float32Array(n) };
    const s = { x: b.x, z: b.z, y: b.y, vx: b.vx, vz: b.vz, vy: b.vy, spin: b.spin || 0 };
    for (let i = 0; i < n; i++) {
      P.x[i] = s.x; P.z[i] = s.z; P.y[i] = s.y; P.vx[i] = s.vx; P.vz[i] = s.vz;
      if (P.nValid === n && (Math.abs(s.x) > 52.6 || Math.abs(s.z) > 34.2)) P.nValid = i + 1;
      this.ballFlightStep(s, step);
    }
    return P;
  },
  // Plan de la pelota ACTUAL (cacheado por tick). Receptor, interceptores y pasador lo consumen igual.
  p1LivePlan() {
    const S = this.p1S(), b = this.ball;
    if (S.plan && S.planAt === this.elapsed) return S.plan;
    S.plan = this.p1SimBall(b);
    S.planAt = this.elapsed;
    return S.plan;
  },
  // Velocidad de salida de un pase (única fórmula: usada por p1PlanPass y por pass()).
  // Rasante: la velocidad se resuelve para que la pelota LLEGUE con una velocidad controlable (v_arr) considerando
  // el rozamiento real (v_llegada = v0·e^(−0.27T) ⇒ v0 = v_arr + 0.27·dist). Aéreo: tiempo de vuelo elegido y
  // velocidad horizontal corregida por el arrastre del aire; se refina con el propio integrador.
  p1KickVel(b, ax, az, cls, loft) {
    const dx = ax - b.x, dz = az - b.z, dist = Math.max(1, Math.hypot(dx, dz)), ux = dx / dist, uz = dz / dist;
    if (!loft) {
      // se integra hacia atrás desde la velocidad de llegada: v·dv/ds = a(v) ⇒ v0 tal que la pelota llega a v_arr tras `dist`
      const arr = dist < 8 ? 9.5 : P1_ARRIVAL[cls] || 11;
      let v = arr, T = 0;
      const ds = dist / 12;
      for (let i = 0; i < 12; i++) { const a = ballDecel(v, true), v2 = v + (a / v) * ds; T += ds / ((v + v2) / 2); v = v2; }
      const v0 = te(v, 11, 30);
      return { vx: ux * v0, vz: uz * v0, vy: 0.35, speed: v0, dist, loft: false, T };
    }
    const T = te(0.75 + dist * 0.028, 1, 2.3);
    let sp = dist / T, vy = 4.905 * T;
    for (let k = 0; k < 5; k++) {
      const s = { x: b.x, z: b.z, y: Math.max(0.13, b.y || 0.13), vx: ux * sp, vz: uz * sp, vy, spin: 0 };
      let landed = false;
      for (let i = 0; i < 80 && !landed; i++) {
        this.ballFlightStep(s, 0.05);
        if (i > 4 && s.y <= 0.14 && s.vy > -0.3) landed = true;
        else if (i > 4 && s.y < 0.5 && s.vy < 0) { landed = true; }
      }
      const got = Math.hypot(s.x - b.x, s.z - b.z);
      if (got > 1) sp *= te(dist / got, 0.8, 1.25);
    }
    sp = te(sp, 10, 30);
    return { vx: ux * sp, vz: uz * sp, vy, speed: sp, dist, loft: true, T };
  },
  // ------------------------------------------------------------------ 3) PASS PLAN
  // Evalúa un pase concreto (receptor + tipo + punto de apunte) contra el modelo temporal del balón. Devuelve el
  // PassPlan completo; `feasible` sólo si existe una ventana espacio-temporal donde el receptor llega ANTES que
  // cualquier rival, la trayectoria no está cortada y la pelota llega a una velocidad controlable.
  p1PlanPass(t, r, cls, ax, az, o = {}) {
    const b = this.ball, dir = this.direction(t.team), loft = !!(o.loft || cls === "switch" || cls === "cross");
    const kv = o.kick || this.p1KickVel(b, ax, az, cls, loft), S = this.p1SimBall({ x: b.x, z: b.z, y: Math.max(0.13, b.y || 0.13), vx: kv.vx, vz: kv.vz, vy: kv.vy, spin: 0 }, 3.2, 0.05);
    const step = S.step, N = Math.min(S.nValid, S.n), plan = {
      passer: t, receiver: r, cls, kind: o.kind || cls, loft, aim: { x: ax, z: az }, kick: kv, ball: S, feasible: false, reason: "no_window", interceptPoint: null,
      flightTime: 0, receiverETA: 99, opponentETA: 99, controlMargin: -9, receiverMargin: -9, interceptionRisk: 1, blockRisk: 1, contestRisk: 1, progression: 0, firstTouchOutcome: "n/a", arrivalSpeed: 0, travel: 99, oppDist: 0,
    };
    const react = o.recvReact != null ? o.recvReact : 0.06, ux0 = Math.hypot(ax - r.x, az - r.z) || 1, along0 = (r.vx * (ax - r.x) + r.vz * (az - r.z)) / ux0, travelCap = (P1_TRAVEL[cls] || 4) + 0.6 * Math.max(0, along0),
      need = (P1_MARGIN[cls] ?? 0.1) - (o.slack || 0);
    let ir = -1, bestGap = -9;
    for (let i = 3; i < N; i++) {
      const y = S.y[i];
      if (y > (loft ? 1.5 : 1.25)) continue;
      if (loft && i * step < kv.T * 0.55) continue;
      const px = S.x[i], pz = S.z[i];
      if (Math.abs(px) > 52.2 || Math.abs(pz) > 33.8) break;
      const t_i = i * step, eta = this.p1ETA(r, px, pz, { react, reach: 0.45 }), gap = t_i - eta;
      if (gap > bestGap) bestGap = gap;
      if (gap >= need && Math.hypot(px - r.x, pz - r.z) <= travelCap) { ir = i; break; }
    }
    plan.receiverMargin = bestGap;
    if (ir < 0) {
      plan.reason = bestGap < need && bestGap > -9 ? (Math.hypot(ax - r.x, az - r.z) > travelCap ? "too_far_for_kind" : "receiver_cannot_reach") : "no_window";
      return plan;
    }
    const px = S.x[ir], pz = S.z[ir], tr = ir * step, arrSp = Math.hypot(S.vx[ir], S.vz[ir]);
    plan.interceptPoint = { x: px, z: pz, t: tr };
    plan.flightTime = tr;
    plan.receiverETA = tr - bestGap;
    plan.receiverMargin = tr - this.p1ETA(r, px, pz, { react, reach: 0.45 });
    plan.arrivalSpeed = arrSp;
    plan.travel = Math.hypot(px - r.x, pz - r.z);
    plan.progression = (px - b.x) * dir;
    // rivales: ¿alguno llega a ALGÚN punto de la trayectoria antes que la pelota (o antes que el receptor)?
    let slackMax = -9, atPoint = 99, dmin = 99, worst = null;
    const ex = S.x[ir] - S.x[0], ez = S.z[ir] - S.z[0], L2 = ex * ex + ez * ez || 1;
    for (const q of this.players) {
      if (q.team === t.team || q.sentOff) continue;
      const Pq = this.p1Phys(q), u = te(((q.x - S.x[0]) * ex + (q.z - S.z[0]) * ez) / L2, 0, 1), segd = Math.hypot(q.x - (S.x[0] + u * ex), q.z - (S.z[0] + u * ez));
      const dP = Math.hypot(q.x - px, q.z - pz);
      if (dP < dmin) dmin = dP;
      const rch = q.role === "GK" ? 1.8 : 1.0, etaP = this.p1ETA(q, px, pz, { reach: rch });
      if (etaP - tr < atPoint) atPoint = etaP - tr;
      if (segd > Pq.vsp * (tr + 0.15) + 1.3) continue;
      // el portero sólo intercepta con las manos cerca de su área
      for (let i = 2; i <= ir; i += 2) {
        if (S.y[i] > (q.role === "GK" ? 2.3 : 2.1)) continue;
        const ti = i * step, eta = this.p1ETA(q, S.x[i], S.z[i], { reach: rch }), s = ti - eta;
        if (s > slackMax) { slackMax = s; worst = q; }
      }
    }
    plan.opponentETA = tr + atPoint;
    plan.controlMargin = atPoint;
    plan.oppDist = dmin;
    plan.worstOpp = worst;
    // riesgo de bloqueo/corte: sigmoide de cuánto ANTES llega el rival a la trayectoria (s>0 ⇒ llega antes que la pelota)
    plan.blockRisk = ai2Clamp(1 / (1 + Math.exp(-(slackMax + 0.06) / 0.11)), 0, 1);
    plan.contestRisk = ai2Clamp(1 / (1 + Math.exp(-(-atPoint + 0.3) / 0.28)), 0, 1);
    plan.interceptionRisk = Math.max(plan.blockRisk, plan.contestRisk * 0.7);
    const fta = this.firstTouchAbility(r) / 100, ctlMax = (loft ? 17 : 14.5) + fta * 6;
    const diff = 0.3 * (arrSp / 15) + 0.4 * plan.contestRisk + 0.15 * (plan.travel / 8) - 0.25 * fta;
    plan.firstTouchOutcome = diff < 0.22 ? "clean" : diff < 0.42 ? "pressured" : "heavy";
    plan.expectedControl = ai2Clamp(1 - diff, 0, 1);
    if (arrSp > ctlMax) plan.reason = "arrival_too_fast";
    else if (plan.blockRisk >= 0.5) plan.reason = "lane_blocked";
    else if (atPoint < -0.2 && !o.allowContest) plan.reason = "opponent_first";
    else { plan.feasible = true; plan.reason = "ok"; }
    return plan;
  },
  // Variantes geométricas de un pase a un compañero: NO todos los pases tienen la misma geometría (pie/espacio/filtrado/cambio).
  p1PassVariants(t, m, a, dir, farSide, hf = 1) {
    const out = [], vx = m.vx, vz = m.vz, sp = Math.hypot(vx, vz), Tf = te(a / 13, 0.35, 2.4);
    // al pie: el receptor apenas se mueve — apunta a donde ESTARÁ a la llegada (con poco avance: el receptor frena/ajusta)
    const lead = Math.min(Tf * 0.8 * hf, 1.6);
    out.push({ cls: "feet", ax: te(m.x + vx * lead, -49, 49), az: te(m.z + vz * lead, -31, 31), loft: a > 30 });
    if (sp > 2 || (m.x - t.x) * dir > 5) {
      const T2 = (Tf + 0.55) * hf;
      out.push({ cls: "space", ax: te(m.x + vx * T2 + dir * (sp < 2 ? 3 : 1), -49, 49), az: te(m.z + vz * T2, -31, 31), loft: a > 26 });
    }
    if ((m.x - t.x) * dir > 6 && m.p.role !== "DEF" && a > 14 && a < 42)
      out.push({ cls: "through", ax: te(m.x + dir * (5 + 0.5 * sp) + vx * 0.4, -49, 49), az: te(m.z * 0.9 + vz * 0.4, -31, 31), loft: a > 30 });
    if (a > 20 && Math.sign(m.z) !== Math.sign(t.z) && farSide > 8) out.push({ cls: "switch", ax: te(m.x + vx * te(a * 0.04, 0.6, 1.6), -49, 49), az: te(m.z + vz * te(a * 0.04, 0.6, 1.6), -31, 31), loft: true });
    return out;
  },
  // Mejor plan alcanzable hacia un compañero (o el menos malo si `desperate`). null si nada es físicamente viable.
  p1BestPassTo(t, m, a, dir, farSide, desperate, hf = 1) {
    let best = null, bs = -1e9, fallback = null, fs = -1e9;
    for (const v of this.p1PassVariants(t, m, a, dir, farSide, hf)) {
      const pl = this.p1PlanPass(t, m.p, v.cls, v.ax, v.az, { loft: v.loft, recvReact: 0.06 });
      const q = (pl.interceptPoint ? Math.min(pl.receiverMargin, 1) * 0.5 : -1) - pl.blockRisk * 3.2 - pl.contestRisk * 1.0 + pl.progression * 0.02 + (v.cls === "feet" ? 0.18 : v.cls === "switch" ? 0.22 : 0) - (pl.travel > 5 ? 0.2 : 0);
      if (pl.feasible && q > bs) { bs = q; best = pl; }
      if (pl.interceptPoint && q > fs && pl.blockRisk < 0.75) { fs = q; fallback = pl; }
    }
    return best || (desperate ? fallback : null);
  },
  // Sustituye al viejo passOption(): mismo contrato de salida, pero cada candidato pasa por el PassPlan.
  passOption(t) {
    const dir = this.direction(t.team), out = [], opps = this.players.filter((r) => r.team !== t.team && r.role !== "GK" && !r.sentOff),
      farSide = this.spaceAt(t.x + 14 * dir, -t.z * 0.6, opps);
    for (const r of this.players) {
      if (r.team !== t.team || r.id === t.id || r.role === "GK" || r.sentOff) continue;
      const a = ze(t, r);
      if (a < 4.5 || a > 44) continue;
      const pl = this.p1BestPassTo(t, { p: r, x: r.x, z: r.z, vx: r.vx, vz: r.vz }, a, dir, farSide, false);
      if (!pl) continue;
      const v = pl.progression, dangerGain = (this.dangerAt(pl.interceptPoint.x, pl.interceptPoint.z, t.team) - this.dangerAt(t.x, t.z, t.team)) * 6;
      const score = v * 0.62 + Math.min(pl.oppDist, 12) * 1.45 - a * 0.12 - pl.blockRisk * 8 + (r.role === "FWD" ? 3 : 0) + this.chem(t, r) * 2.4 + dangerGain - (this.isOffside(t, r) ? 6 : 0) + this.range(-1.5, 1.5);
      const kind = pl.cls === "through" ? "through" : pl.cls === "switch" ? "switch" : v < -3 ? "backpass" : v > 9 ? "progressive" : a < 12 ? "short" : "safe";
      out.push({ p: r, x: pl.aim.x, z: pl.aim.z, length: a, loft: pl.loft, score, progress: v, risk: pl.blockRisk, kind, plan: pl });
    }
    return out.sort((x, y) => y.score - x.score)[0];
  },
  // Fase 23 — telemetría explicable de decisiones con balón
  p1LogDecision(t, sel, ctx, decisionError, worse) {
    if (this.p1S().off) return;
    const pick = sel.pick, ai = t.ai, pl = pick.plan, nd = ctx.nearest ? this.p1DefFor(ctx.nearest) : null;
    this.p1Log("decision", {
      player: t.name, role: t.role, tacticalRole: ai.role || null,
      attributesUsed: { vision: +ai.cog.vision.toFixed(2), anticipation: +ai.anticipation.toFixed(2), horizon: +ai.cog.decisionHorizon.toFixed(2), passing: t.stats.passing, composure: t.personality.composure },
      perceivedThreat: +ctx.pressure2.toFixed(2), timeToShot: nd ? nd.tShot : null, timeToContact: nd ? nd.tContact : null,
      receiverETA: pl ? +pl.receiverETA.toFixed(2) : null, opponentETA: pl ? +pl.opponentETA.toFixed(2) : null, predictedBall: pl && pl.interceptPoint ? { x: +pl.interceptPoint.x.toFixed(1), z: +pl.interceptPoint.z.toFixed(1), t: +pl.interceptPoint.t.toFixed(2) } : null,
      candidateActions: sel.plausible.map((c) => ({ k: c.key + (c.kind && c.kind !== c.key ? ":" + c.kind : ""), s: +c.score.toFixed(3) })),
      selectedAction: pick.key + (pick.kind && pick.kind !== pick.key ? ":" + pick.kind : ""), decisionQuality: +(1 - Math.min(1, worse / 0.4)).toFixed(2), decisionError: !!decisionError,
      reason: (pick.why && pick.why.length ? pick.why.join(", ") : pick.kind) + (pl ? " | " + pl.reason : ""),
    });
  },
  p1DefFor(q) { return q.p1 && q.p1.def ? q.p1.def : null; },
  p1LogPass(t, e, plan, kv, speed) {
    if (!plan) return;
    this.p1Count("passes");
    if (plan.feasible) this.p1Count("passes_feasible");
    else this.p1Count("passes_infeasible_" + plan.reason);
    this.p1Log("pass", { passer: t.name, receiver: e.p && e.p.name, cls: plan.cls, feasible: plan.feasible, reason: plan.reason, interceptPoint: plan.interceptPoint && { x: +plan.interceptPoint.x.toFixed(1), z: +plan.interceptPoint.z.toFixed(1), t: +plan.interceptPoint.t.toFixed(2) },
      flightTime: +plan.flightTime.toFixed(2), receiverETA: +plan.receiverETA.toFixed(2), opponentETA: +plan.opponentETA.toFixed(2), controlMargin: +plan.controlMargin.toFixed(2), receiverMargin: +plan.receiverMargin.toFixed(2), laneBlocked: plan.blockRisk >= 0.5,
      blockRisk: +plan.blockRisk.toFixed(2), interceptionRisk: +plan.interceptionRisk.toFixed(2), firstTouch: plan.firstTouchOutcome, speed: +speed.toFixed(1), arrival: +plan.arrivalSpeed.toFixed(1) });
  },
  // ¿Existe algún compañero con carril razonablemente libre? (barato: sólo geometría; el juicio fino lo hace el PassPlan)
  p1QuickPassOption(t) {
    const opps = this.players.filter((r) => r.team !== t.team && r.role !== "GK" && !r.sentOff);
    for (const r of this.players) {
      if (r.team !== t.team || r.id === t.id || r.role === "GK" || r.sentOff) continue;
      const a = ze(t, r);
      if (a < 5 || a > 34) continue;
      if (this.ai2LaneRisk(t.x, t.z, r.x, r.z, opps) < 0.38 && this._lf > 2) return true;
    }
    return false;
  },
  // ------------------------------------------------------------------ 4) RECEPTOR: persigue la trayectoria VIVA
  // Devuelve null si la pelota ya es inalcanzable para él (entonces deja de correr detrás de un imposible y vuelve a su
  // rol). Sino {x,z,t,margin,dist}: el primer punto de la trayectoria al que llega con ventaja.
  p1ReceiveTarget(l) {
    const S = this.p1S(), b = this.ball;
    const plan = this.p1LivePlan(), step = plan.step, N = Math.min(plan.nValid, plan.n), pp = this.passPlan;
    // el receptor comprometido con el pase conserva la ventana ya calculada por el pasador mientras siga siendo válida
    let best = null, bestGap = -9, bi = -1;
    for (let i = 2; i < N; i++) {
      const y = plan.y[i], loose = pp && pp.receiver === l && pp.loft;
      if (y > (loose ? 1.5 : 1.3)) continue;
      const px = plan.x[i], pz = plan.z[i];
      if (Math.abs(px) > 52.2 || Math.abs(pz) > 33.8) break;
      const t_i = i * step, eta = this.p1ETA(l, px, pz, { react: 0.04, reach: 0.45 }), gap = t_i - eta;
      if (gap > bestGap) { bestGap = gap; bi = i; }
      if (gap >= 0.02) { best = { x: px, z: pz, t: t_i, margin: gap, i }; break; }
    }
    if (!best) {
      // ninguna ventana: seguir sólo si está cerca del mejor punto (pelota rasante que se frena) — sino, abandonar
      if (bi < 0) return null;
      const px = plan.x[bi], pz = plan.z[bi], d = Math.hypot(px - l.x, pz - l.z);
      const near = bestGap > -0.35 && d < 9;
      if (!near) { this.p1Count("receiver_gave_up"); return null; }
      best = { x: px, z: pz, t: bi * step, margin: bestGap, i: bi };
    }
    best.dist = Math.hypot(best.x - l.x, best.z - l.z);
    // recepción "abierta": si sobra tiempo, se ubica del lado opuesto al rival más cercano y ligeramente hacia adelante
    if (best.margin > 0.25 && best.dist < 6) {
      const dir = this.direction(l.team);
      let nq = null, nd = 99;
      for (const q of this.players) if (q.team !== l.team && !q.sentOff && q.role !== "GK") { const d = Math.hypot(q.x - best.x, q.z - best.z); if (d < nd) { nd = d; nq = q; } }
      if (nq && nd < 6) {
        const away = $i(best.x - nq.x, best.z - nq.z), k = Math.min(0.9, best.margin * 0.8) * (1 - nd / 6);
        best.x = te(best.x + away.x * k, -50, 50);
        best.z = te(best.z + away.z * k + 0, -32, 32);
      }
      best.x = te(best.x + dir * 0.25, -50, 50);
    }
    return best;
  },
  // ------------------------------------------------------------------ 5) LECTURA DEL POSEEDOR + DEFENSA
  // Qué puede hacer el atacante AHORA: cuándo puede tirar / pasar con peligro, cuán expuesta tiene la pelota.
  p1CarrierRead(car) {
    const S = this.p1S();
    if (S.read && S.readAt === this.elapsed && S.readFor === car.id) return S.read;
    const tm = car.team, dir = this.direction(tm), gx = 52.5 * dir, dG = Math.hypot(gx - car.x, car.z), b = this.ball,
      sp = Math.hypot(car.vx, car.vz), toward = sp > 0.3 ? (car.vx * dir) / sp : 0, opps = this.ai2Outfield(1 - tm);
    const th = Math.abs(Math.atan((car.z + 3.66) / Math.max(1.5, dG)) - Math.atan((car.z - 3.66) / Math.max(1.5, dG)));
    const lane = 1 - this.ai2LaneRisk(car.x, car.z, gx, car.z * 0.3, opps.filter((q) => Math.hypot(q.x - car.x, q.z - car.z) > 1.2));
    const facing = Math.cos(car.angle - (dir > 0 ? Math.PI / 2 : -Math.PI / 2)), shooter = (car.stats.shooting - 50) / 50;
    // tiempo hasta un tiro con sentido: en zona ⇒ preparación mínima; fuera ⇒ tiempo de entrar (a su velocidad hacia el arco)
    const zone = dG < 27 && th > 0.15, prep = 0.3 + (facing < -0.1 ? 0.35 : 0) - 0.12 * ai2Clamp(shooter, -0.5, 1);
    let tShot = zone ? prep : 0.3 + Math.max(0, dG - 25) / Math.max(3.2, 4 + sp * Math.max(0, toward)) + prep * 0.5 + (dG < 27 ? 1.6 : 0);
    if (lane < 0.35) tShot += 0.5;
    if (dG > 34) tShot += 4;
    const exposure = Math.max(0, Math.hypot(b.x - car.x, b.z - car.z) - 0.9);
    const thr = this.p1S().threat[1 - tm] || [], recv = thr.length ? thr[0].recv : 0.3;
    const tPass = recv > 0.55 ? 0.35 : recv > 0.3 ? 0.55 : 0.85;
    const R = { car, dir, dG, zone, th, lane, tShot, tPass, exposure, facing, sp, danger: this.dangerAt(car.x, car.z, tm), shotThreat: ai2Sat((3 - tShot) / 2.6) * (zone ? 1 : 0.55) * (0.4 + 0.6 * lane) };
    S.read = R; S.readAt = this.elapsed; S.readFor = car.id;
    return R;
  },
  // Contacto: tiempo mínimo en que `def` alcanza la pelota del poseedor (que sigue con su velocidad ≤1.3 s).
  p1TimeToContact(def, car) {
    const b = this.ball, bvx = car.vx * 0.9, bvz = car.vz * 0.9;
    let best = { t: 4, x: b.x, z: b.z };
    for (let t = 0.15; t <= 2.6; t += 0.15) {
      const k = Math.min(t, 1.3), px = b.x + bvx * k, pz = b.z + bvz * k, d = Math.hypot(px - def.x, pz - def.z);
      const ux = d > 0.01 ? (px - def.x) / d : 0, uz = d > 0.01 ? (pz - def.z) / d : 0, rx = px - ux * 0.8, rz = pz - uz * 0.8;
      if (this.p1ETA(def, rx, rz) <= t) { best = { t, x: px, z: pz }; break; }
    }
    return best;
  },
  // Decisión del defensor más cercano: CLOSE_DOWN/PRESSURE/CONTACT (llega antes de que pueda tirar) o SHOT_BLOCK (no llega:
  // se planta en la línea de tiro) o CONTAIN (sin urgencia: temporiza/orienta a la banda con distancia que depende del peligro).
  p1DefendCarrier(l, car, opts = {}) {
    const R = this.p1CarrierRead(car), tm = l.team, d = this.direction(tm), goalSide = -d, gx = 52.5 * R.dir;
    const me = this.p1TimeToContact(l, car), ann = l.ai ? l.ai.cog.anticipation : 0.6, agg = (l.personality.aggression - 50) / 100;
    // lectura imperfecta del peligro: uno de mala anticipación estima el tiro más lejos de lo que está (sale tarde)
    const tShot = R.tShot + (0.55 - ann) * 0.5, dist = Math.hypot(l.x - car.x, l.z - car.z);
    const guard = this.players.filter((q) => q.team === tm && q.id !== l.id && q.role !== "GK" && !q.sentOff && (q.x - car.x) * R.dir > 0 && Math.hypot(q.x - car.x, q.z - car.z) < 11).length;
    const lastMan = guard === 0 && (car.x * R.dir) > 20;
    let mode, x, z, sprint, v = 1, why;
    const toGoalX = (gx - car.x) / Math.max(1, R.dG), toGoalZ = (0 - car.z) / Math.max(1, R.dG);
    const pk = opts.press || 1;
    if (me.t <= tShot + 0.2 + (pk - 1) * 0.6 && me.t < 2.3 && (!lastMan || tShot < 1.2 || R.exposure > 0.5)) {
      mode = dist < 2.6 ? "CONTACT" : "CLOSE_DOWN";
      const cx = me.x, cz = me.z;
      // llega por el lado que niega el tiro/avance: pegado, del lado del arco propio y hacia adentro
      x = cx + toGoalX * 0.7 + goalSide * 0.15;
      z = cz + toGoalZ * 0.7;
      sprint = dist > 2.2 || R.exposure > 0.4;
      v = 1.04;
      why = me.t.toFixed(2) + "<=" + tShot.toFixed(2);
    } else if (R.shotThreat > 0.35 || tShot < 1.6) {
      // no llega antes del tiro: se interpone en la línea de tiro (y molesta) en vez de acompañar a 4 m
      mode = "SHOT_BLOCK";
      const k = te(1.5 + 0.35 * Math.hypot(car.vx, car.vz), 1.4, 3.6);
      x = car.x + toGoalX * k;
      z = car.z + toGoalZ * k * 0.9;
      sprint = dist > 3;
      v = 1.04;
      why = "no_llega " + me.t.toFixed(2) + ">" + tShot.toFixed(2);
    } else {
      // CONTAIN: distancia de contención según peligro, cobertura, agresividad y velocidad del rival
      mode = "CONTAIN";
      const sp = R.sp, gap = te((2.4 + 0.22 * sp + (guard === 0 ? 0.9 : 0) - agg * 1.4 - 0.6 * ai2Sat((3.5 - tShot) / 2.2) - (R.exposure > 0.55 ? 0.8 : 0)) / Math.sqrt(pk), 1.7, 5);
      const u = $i(gx - car.x, 0 - car.z), side = Math.sign(car.z) || 1, force = Math.abs(car.z) > 15 ? -side * 0.7 : side * 0.0;
      // v16 (pedido explícito, videos de defensa): "dirigir el duelo" hacia la pierna mala del
      // rival en vez de encararlo simétrico/de frente — se sesga la aproximación hacia el lado del
      // pie hábil del atacante (lo empuja a salir por su lado débil), perpendicular a la línea
      // defensor→arco. Un defensor de mejor lectura espacial lo hace más marcado; uno limitado casi
      // no lo nota (aproximación ~simétrica, comportamiento previo). Magnitud acotada (probada contra
      // el arnés de portero en córners/centros: valores mayores desestabilizan la forma defensiva lo
      // suficiente como para que el arquero deje de poder salir a agarrar centros).
      const footSign = car.ai ? (car.ai.foot === "L" ? -1 : car.ai.foot === "R" ? 1 : 0) : 0,
        perpX = -u.z, perpZ = u.x, jockey = footSign * 0.18 * ann;
      x = car.x + u.x * gap + car.vx * 0.25 + perpX * jockey;
      z = car.z + u.z * gap + car.vz * 0.25 + force + perpZ * jockey;
      sprint = dist > gap + 3.2 || (me.t < 1.4 && R.exposure > 0.5);
      v = 0.92;
      why = "temporiza gap=" + gap.toFixed(1);
    }
    // arrival: el objetivo nunca se cruza más allá de la pelota hacia el arco propio
    const out = { x: te(x, -51, 51), z: te(z, -33, 33), sprint, v, mode, tShot, tContact: me.t, dist, why };
    if (l.p1 === undefined) l.p1 = {};
    l.p1.def = out;
    if (mode !== "CONTAIN") l.p1.urgentAt = this.elapsed;
    if (mode !== "CONTAIN" || dist < 5) this.p1Count("def_" + mode);
    if (this.elapsed - (l.p1.logAt || -9) > 0.6) {
      l.p1.logAt = this.elapsed;
      this.p1Log("defense", { defender: l.name, role: l.role, defenderTarget: car.name, threatTarget: R.zone ? "shot" : "progress", pressDistance: +dist.toFixed(1), shotDenial: mode === "SHOT_BLOCK", coverValue: guard, tackleWindow: +(me.t).toFixed(2), timeToShot: +tShot.toFixed(2), timeToContact: +me.t.toFixed(2), mode, why });
    }
    return out;
  },
  // Segundo defensor: si el poseedor puede tirar antes de que el presionador llegue, el segundo cierra la línea de tiro.
  p1ShotLaneBlock(l, car) {
    const R = this.p1CarrierRead(car);
    if (R.shotThreat < 0.35) return null;
    const gx = 52.5 * R.dir, u = $i(gx - car.x, 0 - car.z), k = te(3.4 + 0.15 * R.dG * 0.3, 3, 6.5);
    (l.p1 || (l.p1 = {})).urgentAt = this.elapsed;
    return { x: te(car.x + u.x * k, -51, 51), z: te(car.z + u.z * k, -33, 33), sprint: Math.hypot(l.x - car.x, l.z - car.z) > 5, v: 1.03 };
  },
  // ------------------------------------------------------------------ 5a) DUELO ATACANTE: ¿el defensor ya se comprometió?
  // 0 = sigue temporizando; 1 = viene cerrando fuerte y ya está a distancia de entrada (no puede frenar/cambiar de lado a tiempo).
  p1DefenderCommit(t, q, nd) {
    const dx = t.x - q.x, dz = t.z - q.z, d = Math.hypot(dx, dz) || 1, closing = (q.vx * dx + q.vz * dz) / d, sp = Math.hypot(q.vx, q.vz);
    const P = this.p1Phys(q), stopD = (sp * sp) / (2 * P.aBrake) + 0.5; // distancia que necesita para frenar/rectificar
    return ai2Sat((closing - 2.5) / 3.5) * ai2Sat((3.6 - nd) / 1.6) * (nd < stopD + 1.6 ? 1 : 0.6);
  },
  p1DuelBonus(t, q, key) {
    const commit = this.p1DefenderCommit(t, q, Math.hypot(t.x - q.x, t.z - q.z)), rhythm = key === "change" || key === "sprint" || key === "sharpTouch" || key === "cut" || key === "autopase";
    const acc = (t.stats.acceleration - q.stats.acceleration) * 0.0022 * (0.35 + 0.65 * commit), read = (t.stats.intelligence - 60) * 0.0008;
    return acc + read + (rhythm ? 0.07 * commit : -0.03 * commit);
  },
  // ------------------------------------------------------------------ 5b) DUELO REAL (geometría de la disputa)
  p1DuelReach(f, owner) {
    const b = this.ball, ex = Math.max(0, Math.hypot(b.x - owner.x, b.z - owner.z) - 0.9), dv = { x: owner.x - f.x, z: owner.z - f.z }, dl = Math.hypot(dv.x, dv.z) || 1;
    const closing = (f.vx * dv.x + f.vz * dv.z) / dl;
    return 1.15 + 0.3 * ai2Sat(ex / 0.8) + 0.1 * ai2Sat((closing - 2) / 4);
  },
  p1DuelEval(f, v) {
    const b = this.ball, dvx = b.x - v.x, dvz = b.z - v.z, ex = Math.max(0, Math.hypot(dvx, dvz) - 0.9);
    const toDef = $i(f.x - v.x, f.z - v.z), vsp = Math.hypot(v.vx, v.vz), vdir = vsp > 0.3 ? { x: v.vx / vsp, z: v.vz / vsp } : { x: Math.sin(v.angle), z: Math.cos(v.angle) };
    const front = vdir.x * toDef.x + vdir.z * toDef.z;                  // 1: el defensor está de frente al atacante
    const dsp = Math.hypot(f.vx, f.vz), closing = dsp > 0.3 ? (f.vx * -toDef.x + f.vz * -toDef.z) / dsp * dsp : 0;
    const atk = v.stats.dribbling * 0.3 + v.stats.speed * 0.12 + v.stats.acceleration * 0.12 + v.stats.physical * 0.1 + v.personality.composure * 0.1 + v.personality.creativity * 0.06;
    const def = f.stats.defense * 0.34 + f.stats.speed * 0.1 + f.stats.acceleration * 0.06 + f.stats.physical * 0.14 + f.stats.intelligence * 0.18 + f.personality.consistency * 0.08 + (f.style === "Ball Winner" ? 6 : 0);
    const shielding = v.lastDecision === "hold" && this.elapsed - v.controlAt < 2.5;
    let winP = 0.42 + (def - atk) * 0.006 + 0.42 * ai2Sat(ex / 0.9) + 0.06 * ai2Clamp(closing / 5, -1, 1) - (front < -0.3 ? 0.12 : 0) + (front > 0.5 ? 0.04 : 0) - (shielding ? 0.12 : 0);
    // lado/espalda: ganar la pelota entrando por detrás es raro y casi siempre falta
    const fromBehind = front < -0.35 && vsp > 1;
    const foulP = ai2Clamp(0.07 + (f.personality.aggression - 50) * 0.003 - (f.personality.discipline - 50) * 0.0025 - (f.stats.defense - 60) * 0.0012 + (fromBehind ? 0.2 : 0) + (closing > 6 ? 0.06 : 0) + (ex > 0.5 ? -0.03 : 0), 0.03, 0.5);
    return { winP: ai2Clamp(winP, 0.12, 0.88), foulP, exposure: ex, front, fromBehind };
  },
  // ------------------------------------------------------------------ 6) THREAT MAP OPERATIVO
  // Para cada atacante rival: qué peligro aparece si lo abandono (ahora, tras recibir, tras conducir, tras pase, a la espalda, remate).
  p1ThreatMap(tm) {
    const S = this.p1S(), opTeam = 1 - tm, car = this.owner && this.owner.team !== tm ? this.owner : null, list = [], d = this.direction(tm), dOp = this.direction(opTeam);
    const opps = this.ai2Outfield(opTeam), mine = this.ai2Outfield(tm), lineAdv = this.pc ? this.pc.line[opTeam] : 0;
    // última línea propia (por delante del arco propio) para "a la espalda"
    let last = -99;
    for (const q of mine) last = Math.max(last, -q.x * d + 0 * 0);
    const b = this.ball;
    for (const a of opps) {
      if (a === car) continue;
      const adv = a.x * dOp, dG = Math.max(1.5, 52.5 - adv), sp = Math.hypot(a.vx, a.vz);
      const now = this.dangerAt(a.x, a.z, opTeam);
      const carry = this.dangerAt(te(a.x + a.vx * 1.4, -50, 50), te(a.z + a.vz * 1.4, -31, 31), opTeam);
      let recv = 0, prog = 0;
      if (car) {
        const dd = Math.hypot(a.x - car.x, a.z - car.z);
        if (dd > 4 && dd < 46) {
          const pl = this.p1BestPassTo(car, { p: a, x: a.x, z: a.z, vx: a.vx, vz: a.vz }, dd, dOp, 10, false);
          if (pl) { recv = (1 - pl.interceptionRisk) * this.dangerAt(pl.interceptPoint.x, pl.interceptPoint.z, opTeam); prog = ai2Sat(pl.progression / 25); }
        }
      }
      // a la espalda: no sólo "ya está detrás" sino "estará detrás en ~1.2 s" (carrera de ruptura)
      const advF = adv + Math.max(0, a.vx * dOp) * 1.2, behind = sp > 2.5 && a.vx * dOp > 1.5 && advF > lineAdv - 0.5 ? 0.45 + 0.5 * ai2Sat((advF - lineAdv) / 8) : 0;
      const th = Math.abs(Math.atan((a.z + 3.66) / dG) - Math.atan((a.z - 3.66) / dG)), shot = dG < 24 ? ai2Sat(th / 0.5) * ai2Sat((24 - dG) / 16) : 0;
      const total = ai2Clamp(0.34 * recv + 0.2 * now + 0.12 * carry + 0.14 * behind + 0.14 * shot * (0.4 + 0.6 * Math.min(1, recv * 1.5)) + 0.06 * prog, 0, 1.2);
      list.push({ p: a, now, carry, recv, prog, behind, shot, total });
    }
    list.sort((x, y) => y.total - x.total);
    S.threat[tm] = list;
    return list;
  },
  // ------------------------------------------------------------------ 7) ATAQUE SIN BALÓN (extras de evaluación de posición)
  p1PosExtras(l, c, carrier, opps, mates, role) {
    const tm = l.team, dCar = Math.hypot(c.x - carrier.x, c.z - carrier.z);
    let sc = 0;
    // línea de pase real desde el poseedor: sin línea, un apoyo no existe (por muy "libre" que esté la celda)
    const lane = 1 - this.ai2LaneRisk(carrier.x, carrier.z, c.x, c.z, opps), inRange = ai2Sat(1 - Math.abs(dCar - 12) / 12);
    const wantsLane = role === "SUPPORT" || role === "THIRD_MAN" || role === "NONE" || role === "SPACE_CREATOR" ? 1 : role === "WIDTH" ? 0.6 : 0.3;
    sc += 0.34 * wantsLane * lane * inRange;
    // triángulo: (poseedor, yo, otro compañero) con lados jugables y ángulo abierto — emerge de la geometría, no de una forma rígida
    let tri = 0;
    for (const m of mates) {
      if (m === l || m === carrier) continue;
      const a1 = Math.hypot(m.x - carrier.x, m.z - carrier.z), a2 = Math.hypot(m.x - c.x, m.z - c.z);
      if (a1 < 5 || a1 > 20 || a2 < 5 || a2 > 22 || dCar < 5 || dCar > 20) continue;
      const cosA = ((c.x - carrier.x) * (m.x - carrier.x) + (c.z - carrier.z) * (m.z - carrier.z)) / (dCar * a1);
      if (cosA < 0.8 && cosA > -0.5) { tri = 0.1; break; }
    }
    sc += tri;
    // fijar/liberar: cerca de un rival lo ata (beneficio al compañero) sólo si no es un apoyo cercano
    let bound = 0;
    for (const q of opps) if (Math.hypot(q.x - c.x, q.z - c.z) < 4.5) bound++;
    if (bound && role !== "SUPPORT" && dCar > 12) sc += 0.05 * Math.min(2, bound);
    // anti-persecución de la pelota: sólo el apoyo elegido se acerca; con 2+ compañeros ya alrededor del balón, otro más sobra
    let near = 0;
    for (const m of mates) if (m !== l && m !== carrier && Math.hypot(m.x - carrier.x, m.z - carrier.z) < 10) near++;
    if (dCar < 8 && role !== "SUPPORT") sc -= 0.3;
    if (near >= 2 && dCar < 11) sc -= 0.28;
    return sc;
  },
  // ------------------------------------------------------------------ 8) RITMO: velocidad como consecuencia de destino + intención + urgencia + atributos
  // Devuelve el multiplicador `r` para move() y si corre en sprint. Sustituye los "v" y "sprinting" sueltos del código viejo.
  p1Pace(l, tx, tz, v0, sprint0) {
    const dx = tx - l.x, dz = tz - l.z, dist = Math.hypot(dx, dz), role = l.tacticalRole || l.state, st = l.stamina ?? 100;
    let urgency = 0, why = "cruise";
    const urgentRole = role === "PRESS" || role === "PRESS_DESCOORD" || role === "CONTACT" || role === "CLOSE_DOWN" || role === "SHOT_BLOCK" || role === "RECEIVE" || role === "CHASE" || role === "TRACK_RUN" || role === "PASS_LANE_BLOCK" || role === "DEPTH_RUN" || role === "BLIND_SIDE_RUN" || role === "RUNNER" || role === "BOX_CRASH" || role === "DROP" || role === "LATE";
    if (urgentRole || sprint0) { urgency = 0.7 + 0.3 * ai2Sat(dist / 10); why = urgentRole ? "intent:" + role : "run_to_space"; }
    else if (l.p1 && l.p1.urgentAt === this.elapsed) { urgency = 0.85; why = "deny_shot/close_down"; }
    else if (role === "CONTAIN") { urgency = 0.55; why = "contain"; }
    else if (v0 >= 1.05) { urgency = 0.5; why = "transition"; }
    let r;
    if (role === "RECEIVE" && l.p1 && l.p1.recv) {
      // el receptor no corre siempre a tope: corre lo que necesita para llegar con ventaja y frena antes de recibir
      const P = this.p1Phys(l), rc = l.p1.recv, need = dist / Math.max(0.2, rc.t - 0.08);
      const rr = te(need / P.vrun, 0.22, 1);
      return { r: rr, sprint: need > P.vrun * 0.93 && dist > 3 && st > 40, why: "receive need=" + need.toFixed(1) };
    }
    if (urgency > 0.5) r = urgency > 0.68 ? te(0.62 + 0.05 * dist, 0.62, 1) : 0.7; // Fase 3: la urgencia escala con la distancia (a 3 m no se sprinta)
    else r = te(0.2 + 0.03 * dist, 0.2, 0.7); // Fase 3: al posicionarse se camina/trota; sólo se corre fuerte con urgencia
    if (dist < 0.7) r = Math.min(r, 0.3);
    const sprint = urgency > 0.68 && dist > 3.5 && st > 40;
    if (!sprint && sprint0 && dist > 14 && st > 40 && urgency <= 0.68) return { r, sprint: true, why: "long_recover" };
    return { r, sprint, why };
  },
  // Snapshot explicable de un jugador (Fase 23 — movimiento)
  p1DebugPlayer(p) {
    const sp = Math.hypot(p.vx, p.vz);
    return { name: p.name, role: p.role, state: p.state, tactical: p.tacticalRole, speed: +sp.toFixed(2), kmh: +(sp * 3.6).toFixed(1), tier: p.speedTier, sprinting: !!p.sprinting, stamina: +(p.stamina ?? 100).toFixed(0), def: p.p1 && p.p1.def, mv: p.p1 && p.p1.mv };
  },
});
// <<P1_END>>
