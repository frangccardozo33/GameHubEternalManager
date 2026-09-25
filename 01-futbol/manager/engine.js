// ===== TLM engine layer — el manager consume/configura el motor sin reemplazarlo =====
// Se inyecta con manager/build.mjs entre <<TLM_ENGINE_BEGIN>> / <<TLM_ENGINE_END>> (mismo scope que la clase wc).
//  · tlmLoad(cfg): aplica un ManagerMatchConfig (clubes, XI, banquillo, táctica, plan, instrucciones).
//  · Cambios físicos: pedido → pendiente → punto de parada → presentación → sale (camina) → entra → aplicado → reanuda.
//  · Log por jugador (goles, asistencias, tiros, atajadas, tarjetas, minutos) y tlmResult(): MatchResult para el manager.
Fa["3-5-2"] = [[-49, 0], [-37, -13], [-39, 0], [-37, 13], [-20, 26], [-20, -26], [-25, 0], [-15, -9], [-6, 9], [8, -9], [8, 9]];
const TLM_MENT = { veryDefensive: "defensive", defensive: "defensive", balanced: "balanced", attacking: "attacking", veryAttacking: "attacking" };
{
  const _reset = wc.prototype.reset, _event = wc.prototype.event, _step = wc.prototype.step;
  wc.prototype.reset = function () {
    _reset.call(this);
    if (this.tlmCfg && !this._tlmLoading) this.tlmApply();
  };
  // registro de eventos con el ocupante REAL del hueco (tras un cambio el mismo hueco tiene otro jugador)
  wc.prototype.event = function (t, e, n, s, r, extra) {
    const res = _event.call(this, t, e, n, s, r, extra);
    if (this.tlmLog) {
      const pl = r != null && r.id != null ? r : null;
      this.tlmLog.push({ t: this.time, type: t, title: e, detail: n, team: s, slot: pl ? pl.id : null, pid: pl ? pl.tlmPid || null : null, extra: extra || null,
        assistPid: t === "goal" && this.tlGoal && this.tlGoal.assistId != null && this.players[this.tlGoal.assistId] ? this.players[this.tlGoal.assistId].tlmPid : null });
    }
    return res;
  };
  const _pass = wc.prototype.pass;
  wc.prototype.pass = function (t, ...a) {
    if (this.tlmPS && t && t.tlmPid) { const s = this.tlmPS[t.tlmPid]; if (s) s.passes++; }
    return _pass.call(this, t, ...a);
  };
  const _rag = wc.prototype.startRagdoll;
  wc.prototype.startRagdoll = function (p, severity, dir, injury) {
    if (injury && this.tlmInj && p && p.tlmPid) this.tlmInj.push({ pid: p.tlmPid, severity: severity == null ? 0.5 : severity, at: this.time });
    return _rag.call(this, p, severity, dir, injury);
  };
  // Congela el partido mientras dura la secuencia de cambio (sólo se mueven los jugadores del cambio).
  wc.prototype.step = function (t) {
    if (this.running && !this.ended && this.tlmSubQ && (this.tlmSubSeq || this.tlmSubQ.length)) {
      if (!this.tlmSubSeq && (this.phase === "restart" || this.phase === "halftime") && this.tlmSubStart) this.tlmSubStart();
      if (this.tlmSubSeq) { this.tlmSubTick(te(t, 0, 1 / 30)); return; }
    }
    return _step.call(this, t);
  };
}
const TLM_STYLE_IDX = (pos) => (pos === "LI" || pos === "LD" ? 1 : pos === "DFC" ? 2 : 5);
Object.assign(wc.prototype, {
  // ---------- carga de configuración ----------
  tlmLoad(cfg) {
    if (!this._tlmOrig) this._tlmOrig = this.teams.map((t) => ({ ...t }));
    const S = [cfg.home, cfg.away];
    this.tlmCfg = cfg; this.seed = (cfg.seed || this.seed) >>> 0;
    this.teams = S.map((s) => ({ name: s.name, short: s.shortName, color: s.color, colorAlt: s.colorAlt, crest: s.crest, formation: s.formation, mentality: TLM_MENT[s.mentality] || "balanced",
      kitPattern: s.kitPattern, gkColor: s.gkColor, names: s.startingXI.map((x, i) => (x ? x.name : "Jugador " + (i + 1))), numbers: s.startingXI.map((x, i) => (x ? x.number : i + 1)), tlmClubId: s.clubId, controlledBy: s.controlledBy, stadium: cfg.stadium }));
    this._tlmLoading = true; this.reset(); this._tlmLoading = false; this.tlmApply();
  },
  tlmRestore() { // vuelve a los dos equipos de exhibición del motor
    this.tlmCfg = null; this.tlmLog = null; this.tlmPS = null; this.tlmSubQ = null; this.tlmSubSeq = null; this._triggers = null; this.playerRoles = {};
    if (this._tlmOrig) this.teams = this._tlmOrig.map((t) => ({ ...t }));
    this.reset();
  },
  tlmAssign(p, x, t) {
    p.tlmPid = x.pid; p.name = x.name; p.fullName = x.fullName; p.number = x.number; p.stats = { ...x.stats }; p.personality = { ...x.personality };
    p.heightM = x.heightM; p.scale = x.heightM / BASE_MODEL_HEIGHT; p.stamina = x.stamina == null ? 100 : x.stamina; p.cards = { yellow: 0, red: false };
    p.cardData = x.card; p.tlmOvr = x.overall; p.primaryPosition = x.primaryPosition; p.tlmMorale = x.morale;
    const k = x.card || {};
    p.appearance = { skin: k.skin, hair: k.hair, cut: k.hairStyle === "largo" ? "long" : k.hairStyle === "rapado" ? "bald" : undefined, kit: p.role === "GK" ? this.teams[t].gkColor || this.teams[t].color : this.teams[t].color, trim: p.role === "GK" ? "#ffffff" : this.teams[t].colorAlt, pattern: p.role === "GK" ? "plain" : this.teams[t].kitPattern || "stripes" };
    delete p.collectibleId; delete p.collectionZones; delete p.preferredFoot;
    p.memory = { confidence: 50, recentMistakes: 0, recentSuccesses: 0, recentDuelResults: 0, lastOpponent: null, lastPassTarget: null, pressureMemory: 0, recentFatigue: 0 };
    this.deriveIdentity(p);
  },
  tlmBenchEntry(x, t, i) {
    const role = x.role, r = { name: x.name, fullName: x.fullName, number: x.number, role, stats: { ...x.stats }, personality: { ...x.personality }, heightM: x.heightM, scale: x.heightM / BASE_MODEL_HEIGHT,
      index: TLM_STYLE_IDX(x.primaryPosition), tlmPid: x.pid, card: x.card, stamina: x.stamina, overall: x.overall, primaryPosition: x.primaryPosition, morale: x.morale, team: t,
      memory: { confidence: 50, recentMistakes: 0, recentSuccesses: 0, recentDuelResults: 0, lastOpponent: null, lastPassTarget: null, pressureMemory: 0, recentFatigue: 0 } };
    this.deriveIdentity(r); return r;
  },
  tlmApply() {
    const cfg = this.tlmCfg; if (!cfg) return;
    const S = [cfg.home, cfg.away];
    this.tlmLog = []; this.tlmPS = {}; this.tlmInj = []; this.tlmMin = {}; this.tlmSubQ = []; this.tlmSubSeq = null; this.tlmSubsDone = []; this.tlmMode = "manager";
    this.maxSubs = 5; this.subsUsed = [0, 0]; this.playerRoles = {};
    for (let t = 0; t < 2; t++) {
      const s = S[t], lt = this.liveTactics[t];
      s.startingXI.forEach((x, e) => {
        const p = this.players[t * 11 + e]; if (!x) return;
        this.tlmAssign(p, x, t);
        this.tlmPS[x.pid] = { pid: x.pid, team: t, passes: 0 }; this.tlmMin[x.pid] = { team: t, on: 0, off: null, start: true, stamina: null };
        if (s.playerInstructions && s.playerInstructions[x.pid]) this.playerRoles[p.id] = s.playerInstructions[x.pid];
      });
      this.bench[t] = s.bench.map((x, i) => this.tlmBenchEntry(x, t, i));
      s.bench.forEach((x) => { this.tlmPS[x.pid] = { pid: x.pid, team: t, passes: 0 }; });
      // tácticas: se aplican YA (no hay retardo de "asimilación" antes del pitazo inicial)
      Object.assign(lt.requested, s.enginePatch); lt.requestedNum = this.tacticEnumToNum(lt.requested); lt.active = { ...lt.requestedNum }; lt.formation = s.formation; lt.requestedFormation = null; lt.formationBlend = 1;
      // plan de partido → triggers reales del motor (evaluateTriggers ya existente)
      this._triggers = this._triggers || [[], []];
      const rules = (s.planRules || []).map((r) => ({ id: "tlm_" + r.id, once: true, then: r.then,
        when: r.kind === "winning" ? (c) => c.winning && c.minute >= Math.max(25, r.minute) : r.kind === "losing" ? (c) => c.losing && c.minute >= Math.max(15, r.minute) : (c) => !c.winning && c.minute >= r.minute }));
      this._triggers[t] = rules;
      for (const k of Object.keys(this)) if (k.startsWith("_fired_tlm_")) delete this[k];
      this.teams[t].autoTactics = rules.length > 0 || s.controlledBy === "ai";
    }
    this.tlmClock = this.time;
  },
  // ---------- CAMBIOS FÍSICOS ----------
  tlmSubOptions(team) { return { used: this.subsUsed[team], max: this.maxSubs, pending: (this.tlmSubQ || []).filter((q) => q.team === team).length, bench: this.bench[team].map((b, i) => ({ i, pid: b.tlmPid, name: b.name, number: b.number, role: b.role, pos: b.primaryPosition, ovr: b.overall })) }; },
  tlmRequestSub(team, outId, benchIdx, reason = "táctico", opts = {}) {
    if (!this.tlmSubQ) this.tlmSubQ = [];
    const out = this.players.find((p) => p.id === outId && p.team === team), inn = this.bench[team][benchIdx];
    if (!out || !inn) return { ok: false, reason: "Cambio inválido." };
    if (inn.tlmPid == null) inn.tlmPid = "auto_" + team + "_" + inn.number + "_" + benchIdx; // partido de exhibición (sin carrera): identidad propia del suplente
    if (out.sentOff) return { ok: false, reason: "Ese jugador ya fue expulsado." };
    if (this.subsUsed[team] + this.tlmSubQ.filter((q) => q.team === team).length >= this.maxSubs) return { ok: false, reason: `Ya usaste los ${this.maxSubs} cambios.` };
    if (this.tlmSubQ.some((q) => q.team === team && q.outId === outId)) return { ok: false, reason: "Ya hay un cambio pendiente para ese jugador." };
    if (this.tlmSubQ.some((q) => q.team === team && q.inIdxPid === inn.tlmPid)) return { ok: false, reason: "Ese suplente ya está asignado a otro cambio." };
    if ((out.role === "GK") !== (inn.role === "GK") && !opts.force) return { ok: false, reason: "El portero sólo puede ser reemplazado por otro portero." };
    const q = { team, outId, inIdxPid: inn.tlmPid, reason, at: this.time, urgent: !!opts.urgent };
    this.tlmSubQ.push(q);
    this.event("substitution_requested", "CAMBIO SOLICITADO", `${inn.name} por ${out.name} (${reason})`, team, out, { outId, inPid: inn.tlmPid });
    this.event("substitution_pending", "CAMBIO EN ESPERA", "Se hará en el próximo parón del juego", team, out, { outId, inPid: inn.tlmPid });
    return { ok: true, queued: true };
  },
  tlmCancelSub(team, outId) { if (!this.tlmSubQ) return false; const n = this.tlmSubQ.length; this.tlmSubQ = this.tlmSubQ.filter((q) => !(q.team === team && q.outId === outId)); return this.tlmSubQ.length < n; },
  tlmSubStart() {
    const q = this.tlmSubQ.find((c) => { const out = this.players[c.outId]; if (!out || out.sentOff || out.ragdoll || this.subsUsed[c.team] >= this.maxSubs) return false; if (this.restartData && this.restartData.takerId === out.id) return false; return true; });
    if (!q) { this.tlmSubQ = this.tlmSubQ.filter((c) => { const o = this.players[c.outId]; return o && !o.sentOff && this.subsUsed[c.team] < this.maxSubs; }); return; }
    const out = this.players[q.outId], bi = this.bench[q.team].findIndex((b) => b.tlmPid === q.inIdxPid);
    if (bi < 0) { this.tlmSubQ = this.tlmSubQ.filter((c) => c !== q); return; }
    const side = out.z >= 0 ? 1 : -1, ex = te(out.x, -22, 22);
    this.tlmSubSeq = { q, phase: "present", t: 0, outId: out.id, benchIdx: bi, side, exit: { x: ex, z: side * 35.6 }, bench: { x: ex, z: side * 39.5 }, injured: /lesi/i.test(q.reason), swapped: false };
    this.event("substitution_stopping_point", "PARÓN DEL JUEGO", "Se detiene el reloj para el cambio", q.team, out);
    const inn = this.bench[q.team][bi];
    this.event("substitution_presentation", "CAMBIO", `Sale ${out.name} · Entra ${inn.name}`, q.team, out, { outId: out.id, outPid: out.tlmPid, inPid: inn.tlmPid, inName: inn.name, inNumber: inn.number });
  },
  tlmSubTick(dt) {
    const S = this.tlmSubSeq, p = this.players[S.outId]; S.t += dt; this.elapsed += dt;
    if (!this.tlmMin) this.tlmMin = {}; if (!this.tlmSubsDone) this.tlmSubsDone = [];
    const walk = (tx, tz, spd) => {
      const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
      if (d < 0.35) { p.vx = p.vz = 0; return true; }
      const v = Math.min(spd, d / Math.max(dt, 1e-3));
      p.vx = (dx / d) * v; p.vz = (dz / d) * v; p.x += p.vx * dt; p.z += p.vz * dt; p.angle = Math.atan2(p.vx, p.vz); p.state = "Positioning"; return false;
    };
    if (S.phase === "present") { p.vx = p.vz = 0; if (S.t > 1.6) { S.phase = "exit"; S.t = 0; this.event("player_exit", "SALE", `${p.name} abandona el campo`, p.team, p); } return; }
    if (S.phase === "exit") {
      const spd = S.injured ? 2.2 : 3.6;
      if (!S.leftPitch) { if (walk(S.exit.x, S.exit.z, spd)) S.leftPitch = true; }
      else if (walk(S.bench.x, S.bench.z, spd)) { p.tlmHid = true; S.phase = "swap"; S.t = 0; }
      if (S.t > 40) S.phase = "swap"; // salvavidas
      return;
    }
    if (S.phase === "swap") {
      // el saliente ya está fuera y oculto: recién ahora el suplente pasa a ser el jugador del hueco
      const q = S.q, inn = this.bench[q.team][S.benchIdx], outName = p.name, outPid = p.tlmPid, outStamina = p.stamina;
      const m = this.tlmMin[outPid]; if (m) { m.off = this.time; m.stamina = outStamina; }
      this.bench[q.team].splice(S.benchIdx, 1);
      this.tlmAssign(p, { ...inn, stats: inn.stats, personality: inn.personality, pid: inn.tlmPid, name: inn.name, fullName: inn.fullName, number: inn.number, heightM: inn.heightM, stamina: 100, card: inn.card, overall: inn.overall, primaryPosition: inn.primaryPosition, morale: inn.morale }, p.team);
      p.subbedIn = true; p.tlmHid = false; p.tlmHidden = false; p.sprinting = false; p.timer = 0; p.action = 0; p.tl = null;
      this.tlmMin[inn.tlmPid] = { team: p.team, on: this.time, off: null, start: false };
      this.tlmSubsDone.push({ team: p.team, minute: Math.floor(this.time / 60), outPid, inPid: inn.tlmPid });
      this.subsUsed[q.team]++; this.tlmSubQ = this.tlmSubQ.filter((c) => c !== q);
      S.outName = outName; S.outPid = outPid; S.phase = "enter"; S.t = 0; S.entered = false;
      p.vx = p.vz = 0;
      this.onTlmSwap && this.onTlmSwap(p.id, p);
      this.event("player_entry", "ENTRA", `${p.name} espera en la banda`, p.team, p);
      return;
    }
    if (S.phase === "enter") {
      const slot = this.formationSlot(p.team, p.index), dir = this.direction(p.team), tx = slot[0] * dir, tz = slot[1] * dir;
      if (!S.entered) { if (walk(S.exit.x, S.exit.z, 3.4)) S.entered = true; }
      else if (walk(tx, tz, 4.2) || S.t > 14) S.phase = "done";
      if (S.t > 30) S.phase = "done";
      return;
    }
    if (S.phase === "done") {
      const q = S.q;
      this.event("sub", "CAMBIO", `${p.name} entra por ${S.outName} (${q.reason})`, q.team, p, { applied: true, outPid: S.outPid, inPid: p.tlmPid });
      this.event("play_resumed", "SE REANUDA", "El juego continúa", q.team, p);
      this.tlmSubSeq = null; p.state = "Positioning";
    }
  },
  // Sustituciones automáticas (mismas reglas que checkSubs original) pero encoladas: nunca un "swap" instantáneo.
  checkSubs() {
    if (this.elapsed - this.lastSubCheck < 6) return;
    this.lastSubCheck = this.elapsed;
    for (let t = 0; t < 2; t++) {
      const side = this.tlmCfg ? [this.tlmCfg.home, this.tlmCfg.away][t] : null;
      if (side && side.controlledBy === "user" && !(side.matchPlan && side.matchPlan.autoSubs)) continue; // el usuario decide sus cambios (salvo que active el asistente; la lesión siempre fuerza el cambio)
      const used = this.subsUsed[t] + (this.tlmSubQ || []).filter((q) => q.team === t).length;
      if (used >= this.maxSubs || !this.bench[t].length || (this.tlmSubQ || []).some((q) => q.team === t)) continue;
      const on = this.players.filter((o) => o.team === t && !o.sentOff && o.role !== "GK"), diff = this.score[t] - this.score[1 - t], min = this.time / 60;
      let r = null, why = "cansancio";
      const dial = this.liveTactics ? this.liveTactics[t].active.substitutionPolicy : 0, th = te(58 - dial * 6, 44, 68);
      const tired = on.slice().sort((a, b) => a.stamina - b.stamina)[0];
      if (tired && tired.stamina < th && min > 55) r = tired;
      else if (min > 62 && diff < 0) { const c = on.filter((l) => l.role !== "FWD").sort((a, b) => a.stats.shooting - b.stats.shooting)[0]; if (c && this.bench[t].some((l) => l.role === "FWD")) { r = c; why = "cambio ofensivo"; } }
      else if (min > 70 && diff > 0) { const c = on.filter((l) => l.role === "FWD").sort((a, b) => a.stats.defense - b.stats.defense)[0]; if (c && this.bench[t].some((l) => l.role === "DEF")) { r = c; why = "cambio defensivo"; } }
      else { const c = on.find((l) => l.cards.yellow >= 1 && l.personality.aggression > 72 && l.stamina < 74 && min > 55); if (c) { r = c; why = "riesgo de expulsión"; } }
      if (!r && min > 75 && used === 0) { const c = on.slice().sort((a, b) => a.stamina - b.stamina)[0]; if (c && c.stamina < 70) r = c; }
      if (!r) continue;
      const want = why === "cambio ofensivo" ? "FWD" : why === "cambio defensivo" ? "DEF" : r.role;
      let bi = this.bench[t].findIndex((l) => l.role === want); if (bi < 0) bi = this.bench[t].findIndex((l) => l.role !== "GK"); if (bi < 0) continue;
      this.tlmRequestSub(t, r.id, bi, why);
    }
  },
  requestSubstitution(team, outId, reason = "táctico") {
    const out = this.players.find((p) => p.id === outId && p.team === team); if (!out) return false;
    let bi = this.bench[team].findIndex((l) => l.role === out.role); if (bi < 0) bi = this.bench[team].findIndex((l) => l.role !== "GK"); if (bi < 0) return false;
    return this.tlmRequestSub(team, outId, bi, reason).ok;
  },
  forceInjurySub(p) {
    const t = p.team, used = this.subsUsed[t] + (this.tlmSubQ || []).filter((q) => q.team === t).length;
    let bi = this.bench[t].findIndex((l) => l.role === p.role); if (bi < 0) bi = this.bench[t].findIndex((l) => l.role !== "GK");
    if (used >= this.maxSubs || bi < 0) { this.event("injury", "SIGUE EN CANCHA", `${p.name} continúa en el partido pese al golpe`, t, p); return; }
    const r = this.tlmRequestSub(t, p.id, bi, "lesión", { urgent: true, force: p.role === "GK" });
    if (r.ok) this.tlmSubQ.unshift(this.tlmSubQ.pop());
  },
  // ---------- RESULTADO ----------
  tlmResult() {
    const cfg = this.tlmCfg; if (!cfg) return null;
    const st = this.stats, tot = st[0].possession + st[1].possession || 1, log = this.tlmLog || [], ps = {};
    const P = (pid, team) => (ps[pid] = ps[pid] || { pid, team, minutes: 0, start: false, goals: 0, assists: 0, shots: 0, saves: 0, fouls: 0, yellow: 0, red: 0, tackles: 0, passes: 0, rating: 0, cleanSheet: false });
    const end = Math.round(this.time / 60 * 100) / 100, endMin = Math.min(90, Math.max(1, end));
    for (const pid in this.tlmMin) { const m = this.tlmMin[pid], s = P(pid, m.team); s.start = !!m.start; const off = m.off != null ? m.off / 60 : endMin; s.minutes = Math.max(0, Math.round(Math.min(90, off) - m.on / 60)); if (m.sentOffAt != null) s.minutes = Math.min(s.minutes, Math.round(m.sentOffAt / 60)); }
    const timeline = [], goalScorers = [];
    for (const e of log) {
      const minute = Math.max(1, Math.min(90, Math.ceil(e.t / 60)));
      if (e.type === "goal" && e.pid) { P(e.pid, e.team).goals++; if (e.assistPid) P(e.assistPid, e.team).assists++; goalScorers.push({ pid: e.pid, team: e.team, minute, assistPid: e.assistPid || null }); timeline.push({ minute, type: "goal", team: e.team, pid: e.pid, assist: e.assistPid || null, text: e.detail }); }
      else if (e.type === "shot" && e.pid) P(e.pid, e.team).shots++;
      else if (e.type === "save" && e.pid) P(e.pid, e.team).saves++;
      else if (e.type === "foul" && e.pid) P(e.pid, e.team).fouls++;
      else if ((e.type === "tackle" || e.type === "intercept") && e.pid) P(e.pid, e.team).tackles++;
      else if (e.type === "card" && e.pid) { const red = /ROJA/.test(e.title); const s = P(e.pid, e.team); if (red) { s.red = 1; if (this.tlmMin[e.pid]) this.tlmMin[e.pid].sentOffAt = e.t; s.minutes = Math.min(s.minutes || 90, minute); } else s.yellow++; timeline.push({ minute, type: "card", team: e.team, pid: e.pid, red, text: e.detail }); }
      else if (e.type === "sub" && e.extra && e.extra.applied) timeline.push({ minute, type: "sub", team: e.team, pid: e.pid, text: e.detail });
    }
    for (const pid in this.tlmPS) if (ps[pid]) ps[pid].passes = this.tlmPS[pid].passes;
    // stamina final de los que siguen en cancha (para el desgaste físico posterior)
    for (const p of this.players) if (p.tlmPid && ps[p.tlmPid]) ps[p.tlmPid].staminaEnd = Math.round(p.stamina);
    for (const pid in this.tlmMin) { const m = this.tlmMin[pid]; if (m.off != null && m.stamina != null && ps[pid]) ps[pid].staminaEnd = Math.round(m.stamina); }
    for (let t = 0; t < 2; t++) { const g0 = (t === 0 ? cfg.home : cfg.away).startingXI[0], gs = g0 && ps[g0.pid]; if (gs && gs.minutes > 0) gs.cleanSheet = this.score[1 - t] === 0; }
    const acc = (t) => (st[t].passes ? Math.round((st[t].completed / st[t].passes) * 100) : 0);
    const lineups = [cfg.home, cfg.away].map((s, t) => ({ team: t, xi: s.startingXI.map((x) => x && x.pid), bench: s.bench.map((x) => x.pid) }));
    timeline.sort((a, b) => a.minute - b.minute);
    return { fixtureId: cfg.fixtureId, homeClubId: cfg.homeClubId, awayClubId: cfg.awayClubId, score: this.score.slice(), possession: [Math.round((st[0].possession / tot) * 100), 100 - Math.round((st[0].possession / tot) * 100)],
      shots: [st[0].shots, st[1].shots], shotsOnTarget: [st[0].onTarget, st[1].onTarget], xg: [+(st[0].xg || 0).toFixed(2), +(st[1].xg || 0).toFixed(2)], passes: [st[0].passes, st[1].passes], passAccuracy: [acc(0), acc(1)],
      yellow: [st[0].yellow, st[1].yellow], red: [st[0].red, st[1].red], fouls: [st[0].fouls, st[1].fouls], corners: [st[0].corners, st[1].corners], offsides: [st[0].offside, st[1].offside], saves: [st[0].saves, st[1].saves],
      goalScorers, eventTimeline: timeline, substitutions: (this.tlmSubsDone || []).slice(), injuries: (this.tlmInj || []).map((i) => ({ pid: i.pid, severity: i.severity })), playerStats: ps, events: timeline, lineups,
      channels: [0, 1].map((t) => ({ left: st[t].attacksByChannel.left, center: st[t].attacksByChannel.center, right: st[t].attacksByChannel.right })), source: "engine", penalties: [st[0].penalties, st[1].penalties] };
  },
});
// <<TLM_ENGINE_LOCAL>>
