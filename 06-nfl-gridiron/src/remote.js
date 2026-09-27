// RemoteSim: imita la interfaz de MatchSimulator que lee la pantalla de partido, pero se alimenta de los
// fotogramas que manda el servidor. Así la transmisión online usa exactamente la misma UI, estudio y anuncios que el modo local.
const SPECIAL = ['kickoff', 'punt', 'field-goal', 'extra-point', 'two-point'];
const emptyStats = () => ({ plays: 0, yards: 0, passing: 0, rushing: 0, completions: 0, attempts: 0, firstDowns: 0, turnovers: 0, sacks: 0, touchdowns: 0 });
const lerp = (a, b, t) => a + (b - a) * t;
const lerpAng = (a, b, t) => { const d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; };
const TICK_MS = 100;

export class RemoteSim {
  constructor() {
    const t = { name: '—', short: '—', city: '', mascot: '—', color: '#5786a0', dark: '#20303a', crest: '', style: '', defense: '', gameplan: null };
    this.teams = [{ ...t }, { ...t }];
    this.state = 'HUDDLE'; this.started = false; this.playNumber = 0; this.seed = 0; this.step = 0; this.held = null;
    this.events = []; this.history = [];
    // jugador de relleno para que la UI no falle antes del primer fotograma
    this.players = [{ id: 'QB', role: 'QB', side: 'O', number: 0, x: 0, z: 0, heading: 0, speed: 0, state: '', fallen: false, engaged: false, assignment: { reads: [] }, start: { x: 0, z: 0 } }]; this.los = 25; this.ltg = 35; this.playOffense = 0;
    this.drive = { score: [0, 0], offense: 0, down: 1, distance: 10, lineToGain: 35, spot: 25, drive: 1, timeouts: [3, 3], stats: [emptyStats(), emptyStats()] };
    this.clock = { quarter: 1, display: '5:00' }; this.config = { quarters: 4 };
    this.play = { name: '', type: 'pass', personnel: '11', formation: '' }; this.coverage = ''; this.front = '4-3'; this.qbRead = 'X'; this.target = null;
    this.pressure = 0; this.runCommitted = false; this.lastResult = null; this.forcedPlay = null; this.forcedCoverage = null; this.liveTime = 0;
    this.ball = { x: 0, y: 0.3, z: 25, mode: 'dead' };
    this.prev = null; this.cur = null; this.curAt = 0; this.hn = 0;
  }
  get specialPlay() { return SPECIAL.includes(this.play.type); }
  start() { this.started = true; }
  stepNoop() {}
  setTeams(meta) { this.teams = meta.map((m, i) => ({ ...this.teams[i], ...m })); }
  applyFrame(f) {
    this.started = true;
    if (f.players) this.players = f.players.map((p) => ({ ...p, x: 0, z: 0, heading: 0, speed: 0, state: '', fallen: false, engaged: false, assignment: p.assignment || {}, start: p.start || { x: 0, z: 0 } }));
    this.prev = this.cur; this.cur = f; this.curAt = performance.now();
    if (this.prev && this.prev.playNumber !== f.playNumber) this.prev = null;
    // estado "instantáneo" (HUD, diagramas, estadísticas)
    this.state = f.state; this.playOffense = f.offense; this.los = f.los; this.playNumber = f.playNumber; this.step = f.step; this.held = f.held; this.liveTime = f.liveTime;
    this.ball = f.ball;
    const D = f.det; Object.assign(this, { play: D.play, coverage: D.coverage, front: D.front, qbRead: D.qbRead, target: D.target, pressure: D.pressure, runCommitted: D.runCommitted });
    this.lastResult = D.label ? { label: D.label } : null;
    Object.assign(this.drive, D.drive); this.clock = D.clock; this.config = { quarters: D.quarters };
    f.pos.forEach((q, i) => { const p = this.players[i]; if (!p) return; p.x = q[0]; p.z = q[1]; p.heading = q[2]; p.speed = q[3]; p.state = q[4]; p.fallen = !!q[5]; p.engaged = !!q[6]; });
    if (f.hist) this.history = f.hist.map((r) => ({ before: { offense: r.o }, kind: r.k, yards: r.y }));
    else if (f.hl && f.hn > this.history.length) this.history.push({ before: { offense: f.hl.o }, kind: f.hl.k, yards: f.hl.y });
    if (f.stats) this.drive.stats = f.stats;
    if (f.events && f.events.length) {
      const seen = new Set(this.events.map((e) => e.id));
      for (const e of f.events) if (!seen.has(e.id)) this.events.push(e);
      this.events.sort((a, b) => a.id - b.id);
      if (this.events.length > 120) this.events.splice(0, this.events.length - 120);
    }
  }
  // Fotograma interpolado entre los dos últimos recibidos (llegan a ~10 Hz; la pantalla dibuja a 60).
  snapshot() {
    const c = this.cur;
    if (!c) return { state: this.state, offense: 0, los: this.los, lineToGain: this.ltg, ball: this.ball, players: [], liveTime: 0, playNumber: 0 };
    const t = this.prev ? Math.min(1, (performance.now() - this.curAt) / TICK_MS) : 1;
    const P = this.prev && this.prev.pos.length === (c?.pos.length || 0) ? this.prev : null;
    const players = this.players.map((p, i) => {
      const cc = c ? c.pos[i] : null; if (!cc) return { ...p };
      const pp = P ? P.pos[i] : cc;
      return { ...p, x: lerp(pp[0], cc[0], t), z: lerp(pp[1], cc[1], t), heading: lerpAng(pp[2], cc[2], t), speed: cc[3], state: cc[4], fallen: !!cc[5], engaged: !!cc[6] };
    });
    const b = this.ball, pb = P ? P.ball : b;
    return { state: this.state, offense: this.playOffense, los: this.los, lineToGain: this.drive.lineToGain, ball: { x: lerp(pb.x, b.x, t), y: lerp(pb.y, b.y, t), z: lerp(pb.z, b.z, t), mode: b.mode }, players, liveTime: this.liveTime, playNumber: this.playNumber };
  }
}
