// ===== TLB engine — capa de acciones/transmisión (lógica, sin visuales). Gated: match.tlbEnabled =====
// Estados visuales (actionType/tl), sincronización balón/contacto, decisión de barrida, GOAL_RUN,
// paquete de gol, emojis contextuales y telemetría. La presentación vive en el bloque TLB_APP.
const TLB_SHOT = {
  NORMAL_SHOT: { c: 0.14 }, POWER_SHOT: { c: 0.2 }, FINESSE_SHOT: { c: 0.14 }, LOW_SHOT: { c: 0.12 },
  CHIP_SHOT: { c: 0.16 }, LONG_SHOT: { c: 0.22 }, TRIVELA: { c: 0.16 }, RABONA: { c: 0.22 }, VOLLEY: { c: 0.18 },
  FIRST_TIME: { c: 0.07 }, HALF_VOLLEY: { c: 0.12 }, HEADER: { c: 0.24 }, BICYCLE_KICK: { c: 0.3 },
};
const TLB_SHOT_BY_NAME = {
  "Tiro potente": "POWER_SHOT", "Tiro colocado": "FINESSE_SHOT", "Tiro raso": "LOW_SHOT", Vaselina: "CHIP_SHOT", Rosca: "FINESSE_SHOT", Picada: "CHIP_SHOT", "Raso cruzado": "LOW_SHOT",
  "Tiro lejano": "LONG_SHOT", Trivela: "TRIVELA", Volea: "VOLLEY", "Primera intención": "FIRST_TIME", Cabeceo: "HEADER",
};
Object.assign(wc.prototype, {
  tlInit() {
    this.tlbEnabled = this.tlbEnabled !== false;
    this.tlSync = true;
    this.tlHold = null; this.tlGoal = null; this.tlEmoCd = 0; this.tlSlideAt = 0; this.tlPrev = [null, null]; this.tlSlideCd = [0, 0];
    this.tlTele = { shots: {}, skills: {}, slides: {}, slideFail: 0, lastDitch: 0, emoji: 0, goals: 0, holds: 0 };
    this.tlEmoOn = true;
  },
  tlCount(bag, k) { const o = this.tlTele && this.tlTele[bag]; o && (o[k] = (o[k] || 0) + 1); },
  // ---- REMATES: decisión → actionType → contacto sincronizado -------------------------------------
  tlOnShot(p, name, head, volley, trivela, dist) {
    if (!this.tlbEnabled) return;
    if (!this.tlTele) this.tlInit();
    const b = this.ball, dir = this.direction(p.team), cre = p.personality.creativity;
    let type = TLB_SHOT_BY_NAME[name] || "NORMAL_SHOT";
    const facing = Math.sin(p.angle) * dir; // angle = atan2(vx, vz): >0 mira al arco rival
    if (volley && !head) {
      if (b.y > 1.0 && facing < 0.6 && this.random() < 0.7) type = "BICYCLE_KICK";
      else if (b.y < 0.85) type = "HALF_VOLLEY";
    }
    if (!head && !volley && !trivela && (name === "Tiro colocado" || name === "Tiro potente" || name === "Primera intención") &&
        dist > 9 && dist < 27 && cre > 58 && this.random() < 0.02 + (cre - 58) * 0.0035) type = "RABONA";
    p.actionType = type;
    p.tl = { anim: type, t0: this.elapsed, dur: 0.75, contact: TLB_SHOT[type].c, kind: "shot" };
    this.tlCount("shots", type);
    // Sincronía balón/jugador: el resultado ya está decidido (determinista); el balón sale visualmente en CONTACT.
    if (this.tlSync && this.shot && this.phase === "playing") {
      const c = TLB_SHOT[type].c * (0.85 + 0.3 * (1 - p.stats.shooting / 100));
      p.tl.contact = c;
      this.tlHold = { p, until: this.elapsed + c, x: b.x, y: Math.max(b.y, 0.13), z: b.z, vx: b.vx, vy: b.vy, vz: b.vz, spin: b.spin };
      b.vx = b.vy = b.vz = 0; b.spin = 0; this.tlTele.holds++;
    }
  },
  tlOnSkill(p, key) {
    if (!this.tlbEnabled) return;
    if (!this.tlTele) this.tlInit();
    p.actionType = "DRIBBLE_" + key.toUpperCase();
    p.tl = { anim: "SK_" + key, t0: this.elapsed, dur: 1.0, kind: "skill", side: Math.sign(p.moveZ) || 1 };
    this.tlCount("skills", key);
  },
  tlTick(t) {
    if (!this.tlbEnabled) return;
    if (!this.tlTele) this.tlInit();
    const h = this.tlHold, b = this.ball;
    if (h) {
      if (this.owner || this.phase !== "playing" || this.lastTouch !== h.p) this.tlHold = null; // alguien tocó/cortó: no forzar
      else if (this.elapsed >= h.until) { b.vx = h.vx; b.vy = h.vy; b.vz = h.vz; b.spin = h.spin; this.tlHold = null; }
      else { b.x = h.x; b.y = h.y; b.z = h.z; b.vx = b.vy = b.vz = 0; }
    }
    const o = this.owner; // último pasador del equipo (para la asistencia)
    if (o) { const pv = this.tlPrev[o.team]; if (!pv || pv.p !== o) this.tlPrev[o.team] = { p: o, prev: pv && pv.p, at: this.elapsed }; }
    if (this.phase === "playing") {
      this.tlSlideAt -= t;
      if (this.tlSlideAt <= 0) { this.tlSlideAt = 0.15; this.tlSlideScan(); }
    }
    this.tlEmoCd = Math.max(0, this.tlEmoCd - t);
  },
  // Foot-guided ball velocity, not a render-only offset. Normal collisions, tackles and
  // touch ownership remain authoritative; never drag a ball back after a turnover.
  tlSkillBall(p, dt) {
    const a=p.tl, b=this.ball;
    if(!a || a.kind!=="skill" || this.owner!==p || this.phase!=="playing" || this.shot || this.tlHold) return false;
    const u=this.elapsed-a.t0;
    if(u<0 || u>=1 || Math.hypot(b.x-p.x,b.z-p.z)>2.5) return false;
    const s=a.side||1, e=Math.sin(Math.PI*u), w=Math.sin(2*Math.PI*u), key=a.anim.slice(3);
    let f=.65, lateral=0, y=.13;
    if(key==="roulette") { f=.65*Math.cos(2*Math.PI*u); lateral=s*.65*Math.sin(2*Math.PI*u); }
    else if(key==="elastico") { lateral=s*.7*w*e; f=.65+.25*e; }
    else if(key==="croqueta") lateral=s*.65*w;
    else if(key==="nutmeg") f=.65+1.1*e;
    else if(key==="sombrero") { f=.65+.6*e; y=.13+.85*e; }
    else if(key==="heelToHeel") f=.65-.5*w;
    else if(key==="dragBack") f=.65-.85*e;
    else if(key==="ballRoll") lateral=s*.55*w;
    const sn=Math.sin(p.angle), cs=Math.cos(p.angle);
    const tx=p.x+sn*f+cs*lateral, tz=p.z+cs*f-sn*lateral;
    // A bounded spring gives continuous trajectories and leaves the ball contestable.
    const gain=1-Math.exp(-dt*24), step=Math.max(dt,.001);
    b.vx=(tx-b.x)*gain/step; b.vz=(tz-b.z)*gain/step;
    b.vy=(y-b.y)*gain/step+9.81*dt; b.spin=s*w*1.2;
    return true;
  },
  // ---- BARRIDA: decisión contextual (no "closingFast + random") ------------------------------------
  tlSlideEval(d, v, ctx = {}) {
    const dir = this.direction(d.team), ownGoalX = -52.5 * dir;
    const dSp = Math.hypot(d.vx, d.vz), dist = Math.hypot(v.x - d.x, v.z - d.z);
    const danger = this.dangerAt(v.x, v.z, v.team) || 0;
    const behind = this.players.filter((q) => q.team === d.team && q.role !== "GK" && !q.sentOff && q !== d && (q.x - v.x) * dir < -1).length;
    const lastMan = behind === 0 ? 1 : 0;
    const nearLine = Math.max(0, 1 - Math.min(34 - Math.abs(v.z), 52.5 - Math.abs(v.x)) / 6);
    const reasons = [];
    let p = 0.03;
    if (dSp > 4 && dist < 3.4) { p += 0.1; reasons.push("closing"); }
    if (ctx.closingFast) p += 0.16;
    if (lastMan && danger > 0.35) { p += 0.28; reasons.push("last_man"); }
    if (ctx.loose) { p += 0.1; reasons.push("loose_ball"); }
    if (ctx.outgoing) { p += 0.3; reasons.push("last_ditch"); }
    if (ctx.pass) { p += 0.14; reasons.push("pass_beats_defender"); }
    p += danger * 0.16 + nearLine * 0.1;
    p += (d.personality.aggression - 50) / 220 + (d.stats.defense - 60) / 400 - (d.personality.discipline - 50) / 260;
    p -= (d.cards.yellow ? 0.2 : 0) + (d.stamina < 30 ? 0.06 : 0) + (ctx.canRun ? 0.18 : 0);
    const ownBox = Math.abs(d.x - ownGoalX) < 17 && Math.abs(d.z) < 21 ? 1 : 0;
    p -= ownBox && !lastMan ? 0.08 : 0;
    const foul = Math.min(0.6, 0.12 + (dSp - 4) * 0.02 + (ctx.behind ? 0.22 : 0) - d.stats.defense * 0.001 - d.personality.discipline * 0.001);
    const success = Math.max(0.12, Math.min(0.9, 0.48 + d.stats.defense * 0.004 + (ctx.outgoing ? 0.05 : 0) - Math.max(0, dist - 1.6) * 0.16));
    return { p: Math.max(0.01, Math.min(0.85, p)), foul, success, reasons, lastMan, danger };
  },
  tlSlideDecide(f, v, closingFast) {
    const e = this.tlSlideEval(f, v, { closingFast });
    f.tlSlideInfo = e;
    return this.random() < e.p;
  },
  // Barrida sobre balón suelto / que se va / pase que deja atrás. ~6 Hz, un solo candidato por vez.
  tlSlideScan() {
    const b = this.ball, sp = Math.hypot(b.vx, b.vz);
    if (this.owner || b.y > 1.1 || this.shot) return;
    const ox = b.x + b.vx * 0.95, oz = b.z + b.vz * 0.95, outSoon = !!this.lastTouch && (Math.abs(ox) > 52.6 || Math.abs(oz) > 34.1);
    let best = null, bestS = 0;
    for (const d of this.players) {
      if (d.sentOff || d.ragdoll || d.role === "GK" || (d.tl && d.tl.kind === "slide" && this.elapsed - d.tl.t0 < 1.2)) continue;
      if (this.elapsed - (d.tackleAt || -9) < 1.5 || d.state === "Shoot" || d.state === "Head") continue;
      if (sp < 1.5 && Math.hypot(b.x - d.x, b.z - d.z) > 2.6) continue;
      for (const tt of [0.35, 0.6, 0.85]) {
        const px = b.x + b.vx * tt * 0.86, pz = b.z + b.vz * tt * 0.86, dist = Math.hypot(px - d.x, pz - d.z);
        const outNow = outSoon && this.lastTouch.team === d.team;
        if (dist > (outNow ? 4.8 : 3.0) || dist < 0.5) continue;
        const canRun = dist / (4.2 + d.stats.speed * 0.035) < tt - 0.05;
        const outgoing = outNow;
        const ctx = { loose: true, outgoing, pass: !!this.receiver && this.receiver.team !== d.team && sp > 6, canRun, closingFast: Math.hypot(d.vx, d.vz) > 4.5 };
        const e = this.tlSlideEval(d, this.receiver || this.lastTouch || d, ctx);
        const s = e.p * (canRun ? 0.35 : 1) * (dist < 2.6 ? 1 : 0.7);
        if (s > bestS) { bestS = s; best = { d, px, pz, e, ctx, tt, dist }; }
        break;
      }
    }
    if (best && this.elapsed >= (this.tlSlideCd[best.d.team] || 0) && this.random() < best.e.p * (best.ctx.outgoing ? 0.12 : 0.035)) { this.tlSlideCd[best.d.team] = this.elapsed + 14; this.tlStartSlide(best); }
  },
  tlStartSlide(c) {
    const d = c.d, ctx = c.ctx;
    const type = ctx.outgoing ? "LAST_DITCH_SLIDE" : c.e.lastMan && c.e.danger > 0.4 ? "EMERGENCY_SLIDE" : ctx.pass ? "CLEARANCE_SLIDE" : ctx.loose ? "CLEAN_SLIDE" : "LATE_SLIDE";
    d.state = "Slide"; d.action = 0.6; d.slideType = type; d.tackleAt = this.elapsed;
    d.tl = { anim: type, t0: this.elapsed, dur: 0.7, kind: "slide", tx: c.px, tz: c.pz, hit: this.elapsed + Math.max(0.12, c.tt * 0.55), done: false, e: c.e, why: c.e.reasons.join(",") };
    d.tlLock = this.elapsed + 0.7;
    d.actionType = type;
    this.tlCount("slides", type);
    type === "LAST_DITCH_SLIDE" && this.tlTele.lastDitch++;
    this.event("tackle", "BARRIDA", `${d.name} se lanza (${type.replace("_SLIDE", "").toLowerCase()})`, d.team, d);
  },
  tlLockMove(p, t) {
    const s = p.tl;
    if (!s || s.kind !== "slide") { p.tlLock = 0; return; }
    if (this.elapsed - s.t0 < 0.5) this.move(p, s.tx, s.tz, t, this.elapsed - s.t0 < 0.3 ? 1.5 : 0.5);
    else { p.vx *= 0.9; p.vz *= 0.9; p.x += p.vx * t; p.z += p.vz * t; }
    if (s.done || this.elapsed < s.hit) return;
    s.done = true;
    const b = this.ball, reach = 1.9 + p.stats.speed * 0.004;
    const opp = this.owner && this.owner.team !== p.team ? this.owner : null;
    if (Math.hypot(b.x - p.x, b.z - p.z) < reach && b.y < 1.2 && this.random() < s.e.success) {
      const dir = this.direction(p.team), out = s.anim === "LAST_DITCH_SLIDE";
      const mate = this.players.filter((q) => q.team === p.team && q !== p && q.role !== "GK" && !q.sentOff)
        .sort((a, c) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(c.x - p.x, c.z - p.z))[0];
      const r = this.random();
      let tx, tz, spd, how;
      if (out && r < 0.55) { tx = b.x * 0.7; tz = -Math.sign(b.z || 1) * 12; spd = 9; how = "keep_in"; }
      else if (out && r < 0.75) { tx = b.x + dir * 6; tz = Math.sign(b.z || 1) * 40; spd = 10; how = "deflect_out"; }
      else if (mate && r < 0.6) { tx = mate.x; tz = mate.z; spd = 9; how = "to_mate"; }
      else { tx = p.x - dir * 22; tz = p.z + (b.z >= 0 ? -1 : 1) * 12; spd = 13; how = "clear"; }
      const dx = tx - b.x, dz = tz - b.z, n = Math.hypot(dx, dz) || 1;
      b.vx = (dx / n) * spd; b.vz = (dz / n) * spd; b.vy = how === "clear" ? 3 : 0.4;
      this.owner = null; this.receiver = null; this.lastTouch = p; this.kickedAt = this.elapsed;
      s.result = how;
      this.event("tackle", how === "deflect_out" ? "DESVÍO DE BARRIDA" : "¡BARRIDA SALVADORA!", `${p.name} llega en el último instante`, p.team, p);
      this.excitement = Math.min(100, this.excitement + 12);
    } else {
      s.result = "miss"; this.tlTele.slideFail++;
      if (opp && Math.hypot(opp.x - p.x, opp.z - p.z) < 1.4 && this.random() < s.e.foul) { s.result = "foul"; this.commitFoul(p, opp); }
    }
  },
  // ---- GOL: paquete + GOAL_RUN ---------------------------------------------------------------------
  tlOnGoal(team, scorer) {
    if (!this.tlbEnabled) return;
    if (!this.tlTele) this.tlInit();
    const pv = this.tlPrev[team], cand = pv && pv.p === scorer ? pv.prev : pv && pv.p;
    const as = cand && cand !== scorer && cand.team === team && pv && this.elapsed - pv.at < 9 ? cand : null;
    const dir = this.direction(team), sx = scorer ? scorer.x : 0, sz = scorer ? scorer.z : 0;
    const variants = ["arms", "knees", "jump", "sky", "open", "brake"];
    const G = this.tlGoal = {
      scorerId: scorer ? scorer.id : -1, scorerName: scorer ? scorer.name : this.teams[team].name, scorerTeam: team,
      goalType: scorer && scorer.tl && scorer.tl.kind === "shot" ? scorer.tl.anim : "NORMAL_SHOT",
      goalTime: this.time, assistId: as ? as.id : null, assistName: as ? as.name : null, x: sx, z: sz,
      phase: "run", t0: this.elapsed, dir, variant: variants[Math.floor(this.random() * variants.length)],
      corner: { x: 52.5 * dir - dir * 3.2, z: (sz >= 0 ? 1 : -1) * 31 }, followers: [],
    };
    this.tlTele.goals++;
    this.wait = Math.min(16, Math.max(9.6, Math.hypot(G.corner.x-sx, G.corner.z-sz)/7+4));
    if (scorer) {
      const mates = this.players.filter((q) => q.team === team && q !== scorer && !q.sentOff)
        .sort((a, c) => Math.hypot(a.x - sx, a.z - sz) - Math.hypot(c.x - sx, c.z - sz));
      G.followers = mates.slice(0, 4).map((q, i) => ({ id: q.id, delay: 0.35 + i * 0.25, ox: i < 2 ? (i ? .65 : -.65) : (this.random() - 0.5) * 3, oz: i < 2 ? .25 : (this.random() - 0.5) * 3, hug: i < 2 }));
      scorer.state = "Positioning"; scorer.tl = { anim: "CEL_" + G.variant, t0: this.elapsed, kind: "cel", dur: 9 };
    }
  },
  tlGoalTick(t) {
    const G = this.tlGoal; if (!G) return;
    const sc = this.players[G.scorerId], el = this.elapsed - G.t0;
    if (!sc) return;
    const cx = G.corner.x, cz = G.corner.z;
    if (G.phase === "run") {
      if (Math.hypot(cx - sc.x, cz - sc.z) > 2.2) { this.move(sc, cx, cz, t, 1.35); sc.state = "Positioning"; }
      else { G.phase = "cel"; G.celAt = this.elapsed; sc.state = "Celebrate"; if (sc.tl) sc.tl.t0 = this.elapsed; }
    } else if (G.variant === "knees" && this.elapsed - G.celAt < 0.7) { sc.x += sc.vx * t; sc.z += sc.vz * t; sc.vx *= 0.94; sc.vz *= 0.94; }
    else { sc.vx = sc.vz = 0; }
    for (const f of G.followers) {
      const q = this.players[f.id]; if (!q || el < f.delay) continue;
      const tx = sc.x + f.ox, tz = sc.z + f.oz;
      if (Math.hypot(tx - q.x, tz - q.z) > (f.hug ? .22 : .8)) { this.move(q, tx, tz, t, 1.1); q.state = "Positioning"; }
      else {
        q.vx = q.vz = 0; q.state = "Celebrate"; q.angle = Math.atan2(sc.x - q.x, sc.z - q.z);
        if (!q.tl || !String(q.tl.anim).startsWith("CEL_")) q.tl = { anim: f.hug ? "CEL_hug" : "CEL_group", t0: this.elapsed, kind: "cel" };
      }
    }
  },
  // ---- EMOJIS CONTEXTUALES ------------------------------------------------------------------------
  tlExpressive(p) {
    const pe = p.personality;
    return Math.max(0.12, Math.min(1, (pe.creativity * 0.35 + pe.aggression * 0.3 + (100 - pe.composure) * 0.35) / 100 + 0.1));
  },
  tlEmote(p, list, chance = 1) {
    if (!p || !this.tlEmoOn || this.tlEmoCd > 0) return;
    if (p.tlEmoji && p.tlEmoji.until > this.elapsed) return;
    if (this.random() > chance * this.tlExpressive(p)) return;
    const conf = p.memory ? p.memory.confidence : 50;
    const e = list[Math.floor(this.random() * list.length)];
    p.tlEmoji = { e: conf < 35 && e === "😎" ? "😅" : e, until: this.elapsed + 2.2, at: this.elapsed };
    this.tlEmoCd = 2.5; this.tlTele.emoji++;
  },
  tlOnEvent(ev) {
    if (!this.tlbEnabled || !ev) return;
    if (!this.tlTele) this.tlInit();
    const P = ev.player != null ? this.players[ev.player] : null;
    switch (ev.type) {
      case "goal":
        this.tlEmote(P, ["🙌", "🔥", "😎", "😂", "😭", "💪"], 1.6);
        this.players.filter((q) => q.team === ev.team && q !== P).slice(0, 3).forEach((q) => this.tlEmote(q, ["🙌", "🔥", "👏"], 0.7));
        { const gk = this.players[(1 - ev.team) * 11]; gk && this.tlEmote(gk, ["😭", "😔", "🤦"], 1.1); } break;
      case "save": this.tlEmote(P, ["🙌", "😮", "😱", "💪"], 1.2); break;
      case "post": this.tlEmote(P, ["😱", "🤦", "😩", "😮‍💨"], 1.3); break;
      case "block": case "tackle": this.tlEmote(P, ["😤", "😮", "💪", "🔥"], 0.8); break;
      case "foul": this.tlEmote(P, ["😤", "😡", "😮"], 0.7); break;
      case "card": this.tlEmote(P, ["😡", "🤦", "😔", "🫡"], 1.0); break;
    }
  },
});
// Gol tras un desvío/rebote del rival (o autogol): el motor acreditaba el gol a quien tocó la pelota por última vez, aunque fuera del equipo que
// recibió el gol → el rival salía a festejar y los del equipo goleador lo abrazaban. Se acredita al último atacante que tuvo la pelota (o al
// atacante más cercano) para que el festejo, el autor y las estadísticas sean coherentes.
{
  const _goal = wc.prototype.goal;
  wc.prototype.goal = function (t) {
    const sp = this.shot && this.players[this.shot.player], cur = sp || this.lastTouch;
    if (!cur || cur.team !== t || cur.id == null || cur.sentOff) {
      const pv = this.tlPrev && this.tlPrev[t];
      let a = pv && pv.p && pv.p.team === t && !pv.p.sentOff && pv.p.role !== "GK" ? pv.p : null;
      if (!a) {
        const b = this.ball;
        a = this.players.filter((q) => q.team === t && q.role !== "GK" && !q.sentOff).sort((x, y) => Math.hypot(x.x - b.x, x.z - b.z) - Math.hypot(y.x - b.x, y.z - b.z))[0] || null;
      }
      if (a) { this.lastTouch = a; if (sp && sp.team !== t) this.shot = null; }
    }
    return _goal.call(this, t);
  };
}
// Línea defensiva coherente: los defensas bajaban a distinta profundidad (marca/seguimiento de los delanteros, DROP individual, retroceso) y la
// línea se rompía y quedaba muy atrás → casi nunca había offside. Ahora, sin balón, la línea de zagueros se mueve como bloque: el objetivo de
// cada DEF queda a ±LINE_BAND de una línea común (anclas de formación + altura del manager + repliegue colectivo). Se exceptúan los que
// presionan/persiguen la pelota y el portador/receptor. Se aplica al objetivo final de move() dentro de updatePlayers().
{
  const LINE_BAND = 2.2, _up = wc.prototype.updatePlayers, _mv = wc.prototype.move;
  // Línea común: se define respecto de la PELOTA y del dial de altura del manager, no de las anclas de formación (que llegaban a quedar más
  // atrás que la propia línea de gol cuando la pelota estaba en campo propio → toda la defensa pegada al arco y sin fuera de juego).
  wc.prototype.lfoBackLine = function (tm, d) {
    const c = this._lfoBL || (this._lfoBL = [null, null]);
    if (c[tm] && c[tm].at === this.elapsed) return c[tm];
    const defs = this.ai2Outfield(tm).filter((p) => p.role === "DEF" && !p.sentOff);
    if (!defs.length) return (c[tm] = { at: this.elapsed, base: null, mean: 0 });
    let mean = 0; for (const p of defs) mean += this.formationSlot(tm, p.index)[0] * d; mean /= defs.length;
    const tt = this.teamTactics(tm), tr = this.transitionMode && this.transitionMode[tm], my = this.teams[tm].mentality;
    let gap = 22 - (tt.defensiveLine - 1) * 14;               // metros por detrás de la pelota (línea alta → más cerca)
    if (tr && tr.until > this.elapsed && tr.mode === "immediate_retreat") gap += 3;
    if (my === "defensive") gap += 4; else if (my === "attacking") gap -= 2;
    gap -= this.urgency(tm) * 0.5;
    const opps = this.ai2Outfield(1 - tm);
    if (opps.some((a) => a.x * d + 52.5 < 36 && Math.hypot(a.vx, a.vz) > 4.2 && a.vx * -d > 1.5)) gap += 2;   // repliegue colectivo, no individual
    const hi = -14 + (tt.defensiveLine - 1) * 8, base = Math.max(-40, Math.min(hi, this.ball.x * d - gap));
    return (c[tm] = { at: this.elapsed, base, mean });
  };
  wc.prototype.updatePlayers = function (t) { this._lfoUP = true; try { return _up.call(this, t); } finally { this._lfoUP = false; } };
  wc.prototype.move = function (p, x, z, t, v) {
    if (this._lfoUP && this.lfoLineFix !== false && p && p.role === "DEF" && this.phase === "playing" && !p.sentOff && p.ai && p !== this.owner && p !== this.receiver && p.aiChase !== this.elapsed) {
      const defending = this.owner ? this.owner.team !== p.team : !!(this.lastTouch && this.lastTouch.team !== p.team), tr = p.tacticalRole;
      if (defending && tr !== "PRESS" && tr !== "PRESS_DESCOORD" && tr !== "CONTAIN" && tr !== "LATE" && tr !== "BALL_WATCH" && tr !== "ASSUME_COVER") {
        const d = this.direction(p.team), B = this.lfoBackLine(p.team, d);
        if (B.base != null) {
          const L = B.base + (this.formationSlot(p.team, p.index)[0] * d - B.mean), xd = Math.max(L - LINE_BAND, Math.min(L + LINE_BAND, x * d));
          x = xd * d;
        }
      }
    }
    return _mv.call(this, p, x, z, t, v);
  };
}
// Enganche de eventos sin tocar la lógica de fútbol: el motor sigue llamando event(); acá sólo se observa.
{
  const _ev = wc.prototype.event;
  wc.prototype.event = function (...a) { const r = _ev.apply(this, a); this.tlOnEvent && this.tlOnEvent(this.events[0]); return r; };
}
