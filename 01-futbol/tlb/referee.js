// ===== TLB referee — árbitro como entidad del motor (mismo rig y animaciones que los jugadores) =====
// No forma parte de match.players (no juega, no marca, no afecta a la IA). Se anexa sólo a la lista de render
// (match.tlRL = 22 jugadores + árbitro) y a los frames de replay.
const TLB_FLUOR = ["#39ff14", "#ffea00", "#ff2e97", "#00e5ff", "#ff7a00", "#b6ff00", "#c400ff", "#ff3b3b"];
{
  const _init = wc.prototype.tlInit, _tick = wc.prototype.tlTick, _ev = wc.prototype.tlOnEvent;
  Object.assign(wc.prototype, {
    tlInit() {
      _init.call(this);
      // color fluor determinista por partido (hash de la seed; no consume this.random())
      const h = (Math.imul((this.seed || 1) >>> 0, 2654435761) >>> 0) % TLB_FLUOR.length;
      this.tlRef = {
        id: 22, team: 2, index: 22, role: "REF", name: "Árbitro", number: 0, x: 0, z: -8, vx: 0, vz: 0, angle: 0, state: "Idle",
        timer: 0, action: 0, burst: 0, dive: 0, diveDir: 1, moveZ: 1, sentOff: false, ragdoll: null, skillMove: null, sprinting: false,
        stats: { speed: 60, acceleration: 60, dribbling: 50, passing: 50, shooting: 40, defense: 50, physical: 60, intelligence: 60 },
        scale: 0.95, appearance: { skin: ["#e3b38c", "#c6865d", "#f5cbb1", "#8d5524"][(h + 1) % 4] }, color: TLB_FLUOR[h], tl: null, act: null, tlEmoji: null,
      };
      this.tlRL = new Array(23);
    },
    tlTick(t) {
      _tick.call(this, t);
      if (this.tlbEnabled && this.tlRef) this.tlRefTick(t);
    },
    tlOnEvent(ev) {
      _ev.call(this, ev);
      if (this.tlbEnabled && this.tlRef && ev) this.tlRefEvent(ev);
    },
    tlRefSay(anim, dur, extra = {}) {
      const R = this.tlRef;
      R.tl = { anim, kind: "ref", t0: this.elapsed, dur, ...extra };
    },
    tlRefEvent(ev) {
      const R = this.tlRef, P = ev.player != null ? this.players[ev.player] : null;
      switch (ev.type) {
        case "foul": this.tlRefSay("REF_WHISTLE", 0.9); break;
        case "offside": this.tlRefSay("REF_WHISTLE", 0.9); break;
        case "card": if (P) R.act = { type: "card", pid: P.id, red: /ROJA/.test(ev.title), at: this.elapsed, started: false }; break;
        case "penalty": R.act = { type: "penalty", at: this.elapsed, started: false, team: ev.team }; this.tlRefSay("REF_WHISTLE", 0.9); break;
        case "goal": R.act = { type: "goal", at: this.elapsed, started: false }; break;
        case "halftime": case "fulltime": this.tlRefSay("REF_WHISTLE_LONG", 1.6); break;
      }
    },
    tlRefTick(dt) {
      const R = this.tlRef, b = this.ball, now = this.elapsed;
      this.tlRL.length = 23;
      for (let i = 0; i < 22; i++) this.tlRL[i] = this.players[i];
      this.tlRL[22] = R;
      if (R.tl && now - R.tl.t0 > R.tl.dur) R.tl = null;
      let tx, tz, face = null, max = 6.3;
      const clampx = (v) => Math.max(-50, Math.min(50, v)), clampz = (v) => Math.max(-32, Math.min(32, v));
      const A = R.act;
      if (A && A.type === "card") {
        const P = this.players[A.pid];
        if (P) {
          tx = P.x - Math.sign(P.x - R.x || 1) * 2.0; tz = P.z; face = P; max = 7.6;
          const d = Math.hypot(P.x - R.x, P.z - R.z);
          if (!A.started && (d < 3.2 || now - A.at > 3.4)) { A.started = true; A.t = now; this.tlRefSay(A.red ? "REF_RED" : "REF_YELLOW", 2.6); }
          if (A.started && now - A.t > 2.8) R.act = null;
        } else R.act = null;
      } else if (A && A.type === "goal") {
        tx = 0; tz = 0; face = { x: 0, z: 0 };
        if (!A.started && now - A.at > 1.4) { A.started = true; this.tlRefSay("REF_POINT_CENTER", 1.8); }
        if (now - A.at > 4) R.act = null;
      } else if (A && A.type === "penalty") {
        const bx = this.ball.x, sx = Math.sign(bx || 1);
        tx = clampx(bx - sx * 12); tz = 8; face = { x: bx, z: 0 };
        if (!A.started && now - A.at > 0.9) { A.started = true; this.tlRefSay("REF_POINT_SPOT", 1.8); }
        if (now - A.at > 3) R.act = null;
      } else if (this.phase === "injury" && this.injuryData && this.players[this.injuryData.playerId]) {
        const q = this.players[this.injuryData.playerId]; tx = q.x + 1.6; tz = q.z + 1.2; face = q;
      } else if (this.phase === "restart" && this.restartData) {
        const rd = this.restartData, k = rd.kind;
        if (k === "corner") { tx = clampx(rd.x - Math.sign(rd.x) * 20); tz = Math.sign(rd.z || 1) * 9; }
        else { tx = clampx(rd.x * 0.9 - Math.sign(rd.x || 1) * 6); tz = clampz(rd.z + (rd.z >= 0 ? -9 : 9)); }
        face = { x: rd.x, z: rd.z };
      } else if (this.phase === "freekick" || this.phase === "penalty") {
        tx = clampx(b.x * 0.85 - Math.sign(b.x || 1) * 10); tz = clampz(b.z + (b.z >= 0 ? -9 : 9)); face = b;
      } else if (this.phase === "goal" || this.phase === "halftime" || this.phase === "ended") {
        tx = 0; tz = 4; face = { x: 0, z: 0 };
      } else {
        // juego: diagonal detrás de la jugada, manteniendo distancia (~10 m)
        tx = clampx(b.x * 0.92 - Math.sign(b.vx || b.x || 1) * 5); tz = clampz(b.z + (b.z >= 0 ? -10 : 10));
        face = b; max = Math.min(7.2, 5 + Math.hypot(b.vx, b.vz) * 0.12);
      }
      const busy = R.tl && R.tl.kind === "ref" && R.tl.dur > 1.0;
      const dx = tx - R.x, dz = tz - R.z, d = Math.hypot(dx, dz);
      let vd = 0;
      if (!busy && d > 1.6) vd = Math.min(max, (d - 1.2) * 1.5);
      const ux = d > 0.01 ? dx / d : 0, uz = d > 0.01 ? dz / d : 0, k = Math.min(1, dt * 3);
      R.vx += (ux * vd - R.vx) * k; R.vz += (uz * vd - R.vz) * k;
      R.x = Math.max(-52.5, Math.min(52.5, R.x + R.vx * dt)); R.z = Math.max(-34, Math.min(34, R.z + R.vz * dt));
      const sp = Math.hypot(R.vx, R.vz);
      let want = R.angle;
      if (sp > 0.6) want = Math.atan2(R.vx, R.vz); else if (face) want = Math.atan2(face.x - R.x, face.z - R.z);
      let da = want - R.angle; da = Math.atan2(Math.sin(da), Math.cos(da));
      R.angle += da * Math.min(1, dt * 6);
      R.state = sp > 0.35 ? "Run" : "Idle";
    },
  });
}
// Durante la espera de 4 s de corners y tiros libres el resto de los jugadores se mueve y se posiciona.
Object.assign(wc.prototype, {
  tlRoam(dt, team, frozen) {
    for (const p of frozen) p.tlFrozen = this.elapsed + 0.1;
    const st = this.lastTouch; this.lastTouch = { team };
    this.updatePlayers(dt);
    this.lastTouch = st;
  },
  tlCornerRoam(dt) {
    const rd = this.restartData;
    if (this.tlbEnabled && rd && rd.kind === "corner") this.tlRoam(dt, rd.team, []);
  },
  tlFreeKickRoam(dt) {
    const fd = this.freeKickData; if (!this.tlbEnabled || !fd) return;
    const ids = new Set([fd.takerId, ...(fd.wallerIds || [])]);
    this.tlRoam(dt, fd.team, this.players.filter((p) => ids.has(p.id)));
  },
});
// Predicción de balón aéreo: integra la misma física que updateBall (gravedad, arrastre) hasta el primer bote.
// Los jugadores apuntan al punto de caída con un error que depende de su inteligencia y del tiempo que falta.
Object.assign(wc.prototype, {
  tlBallLanding() {
    const b = this.ball;
    if (this._tlL && this._tlL.at === this.elapsed) return this._tlL;
    let x = b.x, y = b.y, z = b.z, vx = b.vx, vy = b.vy, vz = b.vz, t = 0;
    const dt = 1 / 30;
    while (t < 4.5) {
      vy -= 9.81 * dt; y += vy * dt;
      if (y < 0.13) break;
      { const sp = Math.hypot(vx, vz), o = sp > 0 ? Math.max(0, sp - ballDecel(sp, false) * dt) / sp : 1; vx *= o; vz *= o; }
      x += vx * dt; z += vz * dt; t += dt;
    }
    return (this._tlL = { at: this.elapsed, x: x + vx * 0.2, z: z + vz * 0.2, t });
  },
  tlAerialTarget(p) {
    const b = this.ball;
    if (this.tlAerialOn === false || !this.tlbEnabled || this.owner || (b.y < 0.9 && b.vy < 2.5)) return false;
    const L = this.tlBallLanding();
    if (L.t < 0.05) return false;
    const intel = (p.stats.intelligence || 60) / 100, k = Math.min(1, Math.max(0.15, L.t / 1.5));
    const r = (0.3 + (1 - intel) * 2.0) * k, h1 = Math.sin(p.id * 12.9898 + Math.floor(L.at * 0.5) * 78.233) * 43758.5453, h2 = Math.sin(p.id * 39.346 + 11.135) * 24634.6345;
    this._tlA = this._tlA || { x: 0, z: 0 };
    this._tlA.x = Math.max(-52, Math.min(52, L.x + ((h1 - Math.floor(h1)) - 0.5) * 2 * r));
    this._tlA.z = Math.max(-33.5, Math.min(33.5, L.z + ((h2 - Math.floor(h2)) - 0.5) * 2 * r));
    return true;
  },
});
