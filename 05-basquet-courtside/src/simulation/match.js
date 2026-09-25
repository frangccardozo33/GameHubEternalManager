import { DEFAULT_RULES, COURT, STYLES, Random, Team, Ball, PLAY_NAMES, clamp, distance } from './model.js';
import { OffensiveAI, DefensiveAI, MovementSystem, StaminaSystem, SubstitutionSystem } from './ai.js';
import { DribbleSystem, PassingSystem, ShootingSystem, BallPhysics, ReboundSystem } from './ball.js';

// MatchSimulator has no DOM, renderer, audio context or wall-clock dependencies.
// Call step(1 / 60) for deterministic playback or headless match validation.
export class MatchSimulator {
  constructor({ seed = 41, rules = {}, styles = [], teams = null } = {}) {
    this.seed = seed; this.random = new Random(seed); this.rules = { ...DEFAULT_RULES, ...rules };
    if (this.rules.periodSeconds <= 0 || this.rules.shotClock <= 0 || this.rules.periods < 1) throw new Error('Invalid rules');
    this.teams = [new Team(0, this.random, teams?.[0]), new Team(1, this.random, teams?.[1])];
    styles.forEach((style, i) => { if (STYLES[style]) this.teams[i].style = style; });
    this.teams.forEach(t => t.timeouts = this.rules.timeouts);
    this.ball = new Ball(); this.phase = 'ready'; this.time = 0; this.period = 1;
    this.clock = this.rules.periodSeconds; this.shotClock = this.rules.shotClock;
    this.periodScores = [[0, 0]]; this.alternating = 1; this.events = []; this.audioEvents = []; this.metrics = {};
    this.shots = []; this.possession = null; this.pendingAction = null; this.lastShot = null;
    this.dead = null; this.freeThrows = null; this.aiAccumulator = 0; this.eventId = 0;
    this.offense = new OffensiveAI(); this.defense = new DefensiveAI(); this.movement = new MovementSystem();
    this.stamina = new StaminaSystem(); this.substitutions = new SubstitutionSystem();
    this.dribble = new DribbleSystem(); this.passing = new PassingSystem(); this.shooting = new ShootingSystem();
    this.physics = new BallPhysics(); this.rebounding = new ReboundSystem();
    this.assignAllMarks(); this.arrange(0); this.newPossession(0, this.teams[0].active[0], false);
  }
  // Asignaciones: assignments[idDefensor] = casilla (0-4) del rival al que debe marcar. El resto, por casilla.
  assignMarks(defId, offId) {
    const off = this.teams[offId].active, def = this.teams[defId].active, plan = this.teams[defId].assignments, used = new Set(), marks = new Map();
    for (const d of def) {
      const target = plan[d.id] != null ? off.find(p => p.slot === plan[d.id]) : null;
      if (target && !used.has(target.id)) { marks.set(d.id, target.id); used.add(target.id); }
    }
    for (const d of def) if (!marks.has(d.id)) {
      const free = off.filter(p => !used.has(p.id)), pick = free.find(p => p.slot === d.slot) || free[0] || off[0];
      marks.set(d.id, pick.id); used.add(pick.id);
    }
    def.forEach(d => { d.mark = marks.get(d.id); });
  }
  assignAllMarks() { this.assignMarks(1, 0); this.assignMarks(0, 1); }
  isClutch() {
    const last = this.period >= this.rules.periods, margin = Math.abs(this.teams[0].score - this.teams[1].score);
    return last && this.clock <= this.rules.periodSeconds * 0.3 && margin <= 8;
  }
  usageOf(p) { return p.usage * (p.id === this.teams[p.team].plan.closer && this.isClutch() ? 1.25 : 1); }
  // ---- Decisiones del manager en tiempo real (la IA lee estos valores en cada paso) ----
  setTactics(teamId, patch) { const t = this.teams[teamId]; Object.assign(t.tactics, patch); t.invalidate(); this.record('tactics', `${t.name} · ajuste táctico`, null, false); }
  setUsage(teamId, playerId, level) { const p = this.teams[teamId].roster.find(q => q.id === playerId); if (p) p.usage = level; }
  setAssignment(teamId, defenderId, slot) {
    const t = this.teams[teamId]; if (slot == null || slot === '') delete t.assignments[defenderId]; else t.assignments[defenderId] = Number(slot);
    this.assignMarks(teamId, 1 - teamId);
  }
  substitute(teamId, outId, inId) {
    const t = this.teams[teamId], out = t.roster.find(p => p.id === outId), inn = t.roster.find(p => p.id === inId);
    if (!out?.active || !inn || inn.active || inn.fouls >= this.rules.foulLimit) return 'invalid';
    if (this.phase === 'live' && this.ball.mode !== 'dead') { t.subQueue.push({ out: outId, inn: inId }); return 'queued'; }
    this.substitutions.swap(this, t, out, inn, `${inn.name} entra por ${out.name} · cambio del entrenador`); this.assignAllMarks();
    if (this.dead) { this.dead.inbounder = this.dead.inbounder === out ? inn : this.dead.inbounder; this.dead.receiver = this.dead.receiver === out ? inn : this.dead.receiver; }
    return 'done';
  }
  simulateToEnd(dt = 1 / 20, maxSteps = 200000) { if (this.phase === 'ready') this.start(); let n = 0; while (this.phase !== 'finished' && n++ < maxSteps) this.step(dt); return this; }
  result() {
    const gm = this.rules.periods * this.rules.periodSeconds / 60;
    return {
      periods: this.periodScores.map(p => [...p]), scores: this.teams.map(t => t.score), overtime: this.period > this.rules.periods, gameMinutes: gm, seed: this.seed,
      teams: this.teams.map(t => ({ score: t.score, stats: { ...t.stats }, players: t.roster.map(p => ({ pid: p.pid, id: p.id, name: p.name, number: p.number, role: p.role, starter: p.starter, minutes: p.minutes, fouls: p.fouls, energy: p.energy, ...p.stats })) })),
    };
  }
  get players() { return [...this.teams[0].active, ...this.teams[1].active]; }
  findPlayer(id) { return this.teams.flatMap(t => t.roster).find(p => p.id === id); }
  direction(team) { return (team === 0 ? 1 : -1) * (this.period > Math.ceil(this.rules.periods / 2) ? -1 : 1); }
  start() { if (this.phase === 'ready') { this.phase = 'live'; this.record('start', 'Salto inicial · comienza el partido'); } }
  record(type, text, player = null, visible = true) {
    this.metrics[type] = (this.metrics[type] || 0) + 1;
    if (visible) {
      this.events.unshift({ id: ++this.eventId, type, text, team: player?.team ?? null, time: this.time, clock: this.clock, period: this.period });
      if (this.events.length > 80) this.events.pop();
    }
  }
  emitAudio(type, player = null) {
    this.audioEvents.push({ type, x: player?.x ?? this.ball.x });
    if (this.audioEvents.length > 30) this.audioEvents.shift();
  }
  arrange(team) {
    const dir = this.direction(team);
    this.teams[team].active.forEach((p, i) => {
      p.x = dir * [-4.5, -1.2, -0.8, 3.8, 5.5][i]; p.z = [0, -4.6, 4.6, -5.5, 2.3][i];
      p.vx = p.vz = 0; p.target = { x: p.x, z: p.z };
    });
    this.teams[1 - team].active.forEach((p, i) => {
      const mark = this.teams[team].active[i]; p.x = mark.x + dir * 2.3; p.z = mark.z * 0.85;
      p.vx = p.vz = 0; p.mark = mark.id; p.target = { x: p.x, z: p.z };
    });
  }
  giveBall(p) {
    this.ball.owner = p; this.ball.mode = 'held'; this.ball.flight = null;
    this.ball.x = p.x; this.ball.y = 1.15; this.ball.z = p.z;
    this.ball.vx = this.ball.vy = this.ball.vz = 0;
    p.heldTime = 0; p.catchQuality = 1; p.driveUntil = 0;
  }
  newPossession(teamId, handler, transition = false) {
    const team = this.teams[teamId];
    const play = transition && this.random.next() < 0.65 * team.profile.pace * team.profile.transition ? 'transition' : this.random.pick(team.profile.plays);
    const big = [...team.active].filter(p => p !== handler).sort((a, b) => b.ratings.physical - a.ratings.physical)[0];
    const cutter = this.random.pick(team.active.filter(p => p !== handler && p !== big));
    this.possession = {
      team: teamId, started: this.time, play, transition, passes: 0, rotation: 0,
      side: this.random.next() < 0.5 ? -1 : 1,
      screener: ['pickRoll', 'pickPop'].includes(play) ? big.id : null,
      postPlayer: play === 'post' ? big.id : null, cutter: play === 'cut' ? cutter.id : null,
      screenSet: false, screenStarted: this.time, switched: false,
      lastPasser: null, lastPassTime: -100, recycled: false,
    };
    this.shotClock = this.rules.shotClock; this.pendingAction = null;
    this.giveBall(handler); team.stats.possessions++;
    this.assignMarks(1 - teamId, teamId);
    this.record(play, PLAY_NAMES[play], handler, false);
    if (transition) this.record('fastBreak', 'Salida en transición', handler, false);
  }
  makeLoose(x, y, z, vx, vy, vz, lastTouchedTeam) {
    Object.assign(this.ball, { x, y, z, vx, vy, vz, mode: 'loose', owner: null, flight: null, looseTime: 0, lastTouchedTeam });
    this.pendingAction = null;
  }
  deadBall(team, duration = 1.8, reason = 'inbound', keepClock = false) {
    this.phase = 'dead'; this.dead = { team, timer: duration, reason, keepClock, savedClock: this.shotClock };
    this.pendingAction = null; this.ball.owner = null;
    if (this.ball.mode !== 'scored') this.ball.mode = 'dead';
    this.substitutions.update(this); this.assignAllMarks();
    const dir = this.direction(team), offense = this.teams[team].active;
    const inbounder = [...offense].sort((a, b) => distance(a, this.ball) - distance(b, this.ball))[0];
    this.dead.inbounder = inbounder;
    this.dead.spot = { x: clamp(this.ball.x, -12.9, 12.9), z: reason === 'score' ? 0.3 : clamp(this.ball.z, -6.7, 6.7) };
    inbounder.target = { ...this.dead.spot };
    const receiver = [...offense].filter(p => p !== inbounder).sort((a, b) => b.ratings.handling - a.ratings.handling)[0];
    this.dead.receiver = receiver;
    receiver.target = { x: clamp(this.dead.spot.x + dir * 3, -12, 12), z: this.dead.spot.z > 0 ? -2 : 2 };
    for (const p of this.players) {
      p.state = 'walk'; p.action = null;
      if (p !== inbounder && p !== receiver) p.target = { x: clamp(p.x + dir * 2, -11, 11), z: p.z };
    }
  }
  inbound() {
    const d = this.dead, p = d.inbounder;
    this.phase = 'live'; this.newPossession(d.team, p, false);
    if (d.keepClock) this.shotClock = Math.max(this.rules.offensiveReset, d.savedClock);
    this.passing.prepare(this, p, d.receiver); this.dead = null;
    this.record('inbound', 'Saque', p, false);
  }
  score(shot) {
    if (shot.resolved) return;
    shot.resolved = true; shot.made = true;
    const p = this.findPlayer(shot.shooter), team = this.teams[shot.team];
    team.score += shot.points; p.stats.points += shot.points;
    this.periodScores[this.period - 1][shot.team] += shot.points;
    for (const q of this.players) q.stats.pm += q.team === shot.team ? shot.points : -shot.points;
    if (shot.freeThrow) { p.stats.ftm++; team.stats.ftm++; }
    else {
      p.stats.fgm++; team.stats.fgm++;
      if (shot.points === 3) { p.stats.tpm++; team.stats.tpm++; }
      if (shot.type === 'layup' || shot.type === 'dunk') p.stats.rimM++;
      if (shot.transition) team.stats.fastBreakPoints += shot.points;
      if (Math.abs(shot.origin.x) > 8.2 && Math.abs(shot.origin.z) < 2.5) team.stats.paintPoints += shot.points;
      const passer = this.findPlayer(this.possession.lastPasser);
      if (passer && passer !== p && this.time - this.possession.lastPassTime < 4) { passer.stats.assists++; team.stats.assists++; }
    }
    this.shots.push({ ...shot.origin, team: shot.team, made: true, points: shot.points });
    this.record('score', `${p.name} · +${shot.points}${shot.points === 3 ? ' TRIPLE' : ''}`, p);
    this.emitAudio('swish'); this.emitAudio('crowd');
    if (shot.freeThrow) { this.freeThrows.resolved = true; this.freeThrows.timer = 1.2; }
    else this.deadBall(1 - shot.team, 2.1, 'score');
  }
  miss(shot) {
    if (shot.resolved) return;
    shot.resolved = true; shot.made = false;
    this.shots.push({ ...shot.origin, team: shot.team, made: false, points: shot.points });
    this.record('miss', 'Tiro fallado', this.findPlayer(shot.shooter), false);
    if (shot.freeThrow) { this.freeThrows.resolved = true; this.freeThrows.timer = 1.2; }
  }
  foul(defender, shooter, shooting, points = 2) {
    defender.fouls++; this.teams[defender.team].fouls++;
    this.pendingAction = null;
    this.record('foul', `${defender.name} · falta ${shooting ? 'de tiro' : 'personal'}`, defender); this.emitAudio('whistle');
    if (shooting || this.teams[defender.team].fouls >= this.rules.bonusFouls) {
      this.phase = 'freeThrows';
      this.freeThrows = { shooter, remaining: shooting ? points : 2, timer: 1.8, resolved: false, shooting: false };
      this.setupFreeThrow();
    } else this.deadBall(shooter.team, 2, 'foul', true);
  }
  setupFreeThrow() {
    const f = this.freeThrows, p = f.shooter, dir = this.direction(p.team);
    this.giveBall(p); p.x = dir * 8.15; p.z = 0; p.vx = p.vz = 0;
    p.target = { x: p.x, z: 0 }; p.facing = Math.atan2(dir, 0);
    this.players.filter(q => q !== p).forEach((q, i) => {
      q.target = { x: dir * (10.6 - Math.floor(i / 2) * 1.1), z: i % 2 ? -2.8 : 2.8 };
      q.state = 'walk';
    });
    f.shooting = false; f.resolved = false;
  }
  stepFreeThrows(dt) {
    const f = this.freeThrows;
    this.movement.update(this, dt); this.dribble.update(this, dt);
    if (!f.shooting) {
      f.timer -= dt;
      if (f.timer <= 0) { f.shooting = true; this.shooting.prepare(this, f.shooter, true); }
    }
    this.updatePending(dt);
    if (['shot', 'scored', 'loose'].includes(this.ball.mode)) this.physics.update(this, dt);
    if (f.resolved) {
      f.timer -= dt;
      if (f.timer <= 0) {
        f.remaining--;
        if (f.remaining > 0) { f.timer = 1.5; this.setupFreeThrow(); }
        else {
          const made = this.ball.flight?.made;
          this.freeThrows = null;
          if (made) this.deadBall(1 - f.shooter.team, 1.6, 'score');
          else { this.phase = 'live'; this.ball.mode = 'loose'; this.ball.looseTime = 0; }
        }
      }
    }
  }
  outOfBounds() {
    const last = this.ball.flight?.team ?? this.ball.lastTouchedTeam ?? this.possession.team;
    this.record('out', 'Balón fuera · cambio de posesión'); this.emitAudio('whistle');
    this.deadBall(1 - last, 1.7, 'out');
  }
  timeout(teamId = this.possession.team) {
    const team = this.teams[teamId];
    if (!['live', 'dead'].includes(this.phase) || team.timeouts <= 0 || this.ball.mode === 'shot') return false;
    // Timeout is granted only to the team in possession, or during an existing dead ball.
    if (this.phase === 'live' && (this.possession.team !== teamId || !this.ball.owner)) return false;
    team.timeouts--; this.record('timeout', `${team.name} · tiempo muerto`); this.emitAudio('whistle');
    this.deadBall(teamId, 8, 'timeout', true);
    this.teams.forEach(t => t.roster.forEach(p => p.energy = Math.min(1, p.energy + 0.06)));
    return true;
  }
  finishPeriod() {
    this.emitAudio('buzzer'); this.pendingAction = null;
    if (this.period >= this.rules.periods && this.teams[0].score !== this.teams[1].score) {
      this.phase = 'finished'; this.ball.mode = 'dead'; this.ball.owner = null;
      this.record('end', 'Final del partido'); return;
    }
    this.phase = 'interval'; this.intervalTimer = 4;
    this.record('period', this.period >= this.rules.periods ? 'Empate · prórroga' : `Final del cuarto ${this.period}`);
  }
  updatePending(dt) {
    if (!this.pendingAction) return;
    this.pendingAction.remaining -= dt;
    if (this.pendingAction.remaining <= 0) {
      const action = this.pendingAction; this.pendingAction = null;
      if (action.type === 'pass') this.passing.release(this, action);
      else this.shooting.release(this, action);
    }
  }
  step(dt) {
    if (this.phase === 'ready' || this.phase === 'finished') return;
    if (!(dt > 0 && dt <= 0.1)) throw new Error('Use a fixed simulation step <= 0.1 seconds');
    this.time += dt;
    if (this.phase === 'interval') {
      this.intervalTimer -= dt;
      if (this.intervalTimer <= 0) {
        this.period++; this.periodScores.push([0, 0]); this.clock = this.period > this.rules.periods ? this.rules.overtimeSeconds : this.rules.periodSeconds;
        this.teams.forEach(t => { t.fouls = 0; t.roster.forEach(p => p.energy = Math.min(1, p.energy + 0.08)); });
        this.substitutions.update(this, true);
        const team = this.alternating; this.alternating = 1 - this.alternating;
        this.arrange(team); this.newPossession(team, this.teams[team].active[0], false); this.phase = 'live';
      }
      return;
    }
    if (this.phase === 'freeThrows') { this.stepFreeThrows(dt); return; }
    if (this.clock <= 0 && this.ball.mode !== 'shot') { this.finishPeriod(); return; }
    if (this.phase === 'dead') {
      this.dead.timer -= dt; this.movement.update(this, dt);
      if (this.ball.mode === 'scored') this.physics.update(this, dt);
      if (this.dead.timer <= 0) this.inbound();
      return;
    }
    this.clock = Math.max(0, this.clock - dt);
    if (this.ball.mode !== 'shot') this.shotClock = Math.max(0, this.shotClock - dt);
    if (this.shotClock <= 0 && this.ball.mode !== 'shot') {
      this.teams[this.possession.team].stats.turnovers++;
      if (this.ball.owner) this.ball.owner.stats.turnovers++;
      this.record('shotClock', '24 segundos · violación de posesión'); this.emitAudio('buzzer');
      this.deadBall(1 - this.possession.team); return;
    }
    this.offense.update(this, dt);
    this.defense.update(this, dt);
    if (this.phase !== 'live') return;
    if (['shot', 'loose'].includes(this.ball.mode)) this.rebounding.update(this, dt);
    this.movement.update(this, dt); this.stamina.update(this, dt);
    this.dribble.update(this, dt); this.updatePending(dt);
    if (this.phase !== 'live') return;
    if (this.ball.mode === 'pass') this.passing.update(this, dt);
    else if (['shot', 'loose', 'scored'].includes(this.ball.mode)) this.physics.update(this, dt);
  }
  snapshot() {
    return {
      time: this.time, phase: this.phase, period: this.period, clock: this.clock, shotClock: this.shotClock,
      scores: this.teams.map(t => t.score), possession: this.possession.team,
      play: PLAY_NAMES[this.possession.play], ball: { x: this.ball.x, y: this.ball.y, z: this.ball.z, mode: this.ball.mode, owner: this.ball.owner?.id },
      players: this.players.map(p => ({ id: p.id, x: p.x, z: p.z, facing: p.facing, state: p.state, energy: p.energy, action: p.action, target: { ...p.target }, decision: p.decision })),
    };
  }
}
