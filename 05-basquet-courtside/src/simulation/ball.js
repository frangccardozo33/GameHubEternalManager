import { COURT, TUNING, clamp, distance, normalize, segmentDistance } from './model.js';
const GRAVITY = 9.81;

export class DribbleSystem {
  update(sim, dt) {
    const b = sim.ball, p = b.owner;
    if (!p || b.mode !== 'held') return;
    const speed = Math.hypot(p.vx, p.vz);
    const before = Math.floor(p.dribblePhase);
    p.dribblePhase += dt * (1.6 + speed * 0.14);
    const phase = p.dribblePhase % 1;
    const nearest = sim.teams[1 - p.team].active.reduce((a, q) => distance(p, a) < distance(p, q) ? a : q);
    if (distance(p, nearest) < 1.4 && p.action !== 'crossover') {
      const side = (nearest.x - p.x) * Math.cos(p.facing) - (nearest.z - p.z) * Math.sin(p.facing);
      p.hand = side > 0 ? -1 : 1;
    }
    const side = p.hand * 0.38;
    b.x = p.x + Math.cos(p.facing) * side + Math.sin(p.facing) * 0.26;
    b.z = p.z - Math.sin(p.facing) * side + Math.cos(p.facing) * 0.26;
    // A gravity-shaped bounce travels independently between floor and controlling hand.
    b.y = 0.13 + 1.04 * Math.pow(Math.abs(phase * 2 - 1), 0.7);
    if (sim.pendingAction) {
      const a = sim.pendingAction;
      const progress = 1 - a.remaining / a.duration;
      b.y = a.type === 'shot' ? 1.45 + progress * 0.95 : 1.35;
      b.x = p.x + Math.sin(p.facing) * 0.34; b.z = p.z + Math.cos(p.facing) * 0.34;
    } else if (Math.floor(p.dribblePhase) !== before) sim.emitAudio('bounce', p);
  }
}

export class PassingSystem {
  prepare(sim, from, to) {
    const lane = Math.min(...sim.teams[1 - from.team].active.map(q => segmentDistance(q, from, to)));
    const d = distance(from, to);
    const type = lane < 0.9 ? (d > 7 ? 'overhead' : 'bounce') : (from.heldTime < 1.3 ? 'quick' : 'chest');
    from.animate('pass', 0.55);
    sim.pendingAction = { type: 'pass', from, to, passType: type, remaining: 0.2, duration: 0.2 };
  }
  release(sim, action) {
    const { from, to, passType } = action, b = sim.ball;
    const d = distance(from, to), duration = clamp(d / (passType === 'quick' ? 15 : 12), 0.28, 1.5);
    const accuracy = (from.ratings.passing + from.ratings.vision) / 200 * (0.7 + from.energy * 0.3);
    const pressure = Math.min(...sim.teams[1 - from.team].active.map(q => distance(q, from)));
    const bad = sim.random.next() < (1 - accuracy) * 0.14 + Math.max(0, 1.2 - pressure) * 0.035 + Math.max(0, d - 13) * 0.007;
    const spread = bad ? 2.2 : 0.12;
    const target = { x: to.x + to.vx * duration * 0.55 + sim.random.range(-spread, spread), z: to.z + to.vz * duration * 0.55 + sim.random.range(-spread, spread) };
    b.owner = null; b.mode = 'pass'; b.y = passType === 'overhead' ? 2.15 : 1.35;
    b.flight = { type: passType, from: from.id, to: to.id, team: from.team, start: { x: b.x, y: b.y, z: b.z }, target, duration, elapsed: 0, bad, bounced: false };
    b.vx = (target.x - b.x) / duration; b.vz = (target.z - b.z) / duration;
    sim.possession.lastPasser = from.id; sim.possession.lastPassTime = sim.time;
    sim.possession.passes++; sim.possession.rotation = (sim.possession.rotation + (sim.random.next() < 0.28 ? 1 : 0)) % 5;
    from.heldTime = 0; from.driveUntil = 0;
    const labels = { overhead: 'Pase por encima', bounce: 'Pase picado', quick: 'Circulación rápida', chest: 'Pase de pecho' };
    sim.record('pass', labels[passType], from, false); sim.metrics[passType] = (sim.metrics[passType] || 0) + 1;
  }
  update(sim, dt) {
    const b = sim.ball, f = b.flight;
    f.elapsed += dt;
    const t = clamp(f.elapsed / f.duration, 0, 1);
    b.x = f.start.x + (f.target.x - f.start.x) * t; b.z = f.start.z + (f.target.z - f.start.z) * t;
    if (f.type === 'bounce') {
      b.y = t < 0.58 ? 1.35 - 1.22 * (t / 0.58) ** 1.4 : 0.13 + 1.17 * (t - 0.58) / 0.42;
      if (t >= 0.58 && !f.bounced) { sim.emitAudio('bounce'); f.bounced = true; }
    } else b.y = f.start.y + (1.4 - f.start.y) * t + Math.sin(t * Math.PI) * (f.type === 'overhead' ? 1.05 : 0.2);
    const dtac = sim.teams[1 - f.team].tactics, grab = (1 + 0.008 * (dtac.aggression - 50)) * (1 + 0.003 * (dtac.pressure - 50));
    for (const defender of sim.teams[1 - f.team].active) {
      if (t > 0.12 && t < 0.94 && distance(defender, b) < 0.65 && b.y < defender.height + 0.4 && sim.random.next() < dt * TUNING.intercept * grab * (3 + defender.ratings.defense / 20)) {
        const passer = sim.findPlayer(f.from);
        passer.stats.turnovers++; sim.teams[f.team].stats.turnovers++;
        defender.stats.steals++; sim.teams[defender.team].stats.steals++;
        defender.animate('steal', 0.5); sim.record('steal', `${defender.name} intercepta`, defender);
        sim.makeLoose(b.x, b.y, b.z, sim.direction(defender.team) * 2, 0.5, 1, defender.team); return;
      }
    }
    if (t >= 1) {
      const receiver = sim.findPlayer(f.to);
      if (distance(receiver, b) < 1.65 && receiver.active && !f.bad) {
        sim.giveBall(receiver); receiver.catchQuality = f.type === 'quick' ? 1.12 : 1.04;
        receiver.animate('catch', 0.4); receiver.cooldown = 0.4;
        sim.record('catch', 'Recepción', receiver, false);
      } else {
        const passer = sim.findPlayer(f.from); passer.stats.turnovers++; sim.teams[f.team].stats.turnovers++;
        sim.record('badPass', 'Pase fuera de alcance', passer);
        sim.makeLoose(b.x, b.y, b.z, b.vx * 0.3, 0, b.vz * 0.3, 1 - f.team);
      }
    }
  }
}

export class ShootingSystem {
  isThree(sim, p) {
    const x = p.x * sim.direction(p.team);
    return (x > 9.4 && Math.abs(p.z) >= 6.6) || distance(p, { x: sim.direction(p.team) * COURT.hoopX, z: 0 }) >= 6.75;
  }
  quality(sim, p) {
    const d = distance(p, { x: sim.direction(p.team) * COURT.hoopX, z: 0 });
    const three = this.isThree(sim, p);
    const defender = sim.teams[1 - p.team].active.reduce((a, q) => distance(p, a) < distance(p, q) ? a : q);
    const space = distance(p, defender);
    const contest = clamp((2 - space) / 2, 0, 1) * (d < 3 ? defender.ratings.interiorDefense : defender.ratings.defense) / 100;
    const rating = d < 2.8 ? p.ratings.finishing : three ? p.ratings.three : p.ratings.two;
    const base = d < 2.8 ? 0.78 : three ? 0.42 : 0.53;
    const movement = Math.hypot(p.vx, p.vz);
    return clamp(base + (rating - 78) * 0.006 + (p.ratings.shooting - 75) * 0.0015 - contest * 0.2 - Math.max(0, d - 7) * 0.05
      - (1 - p.energy) * 0.16 - (d > 3 ? movement * 0.013 : 0) + (p.catchQuality - 1) * 0.3 - (sim.shotClock < 2 ? 0.07 : 0), 0.06, 0.91);
  }
  prepare(sim, p, freeThrow = false) {
    if (sim.pendingAction) return;
    const d = distance(p, { x: sim.direction(p.team) * COURT.hoopX, z: 0 });
    const dunk = !freeThrow && d < 1.7 && p.ratings.physical > 80 && p.energy > 0.65;
    const type = freeThrow ? 'freeThrow' : dunk ? 'dunk' : d < 2.8 ? 'layup' : 'shoot';
    p.animate(type, type === 'shoot' ? 1.1 : 0.95);
    p.facing = Math.atan2(sim.direction(p.team) * COURT.hoopX - p.x, -p.z);
    const duration = type === 'dunk' ? 0.36 : 0.46;
    sim.pendingAction = { type: 'shot', from: p, shotType: type, remaining: duration, duration, freeThrow };
    if (!freeThrow) {
      for (const q of sim.teams[1 - p.team].active) if (distance(q, p) < 2) {
        q.animate('contest', 0.95); q.decision = 'Contestar lanzamiento';
      }
    }
  }
  release(sim, action) {
    const p = action.from, b = sim.ball, dir = sim.direction(p.team);
    const hoop = { x: dir * COURT.hoopX, z: 0 }, d = distance(p, hoop);
    const nearest = sim.teams[1 - p.team].active.reduce((a, q) => distance(p, a) < distance(p, q) ? a : q);
    const three = !action.freeThrow && this.isThree(sim, p);
    const points = action.freeThrow ? 1 : three ? 3 : 2;
    const drawn = (1 + 0.005 * (sim.teams[p.team].tactics.aggression - 50)) * (1 + 0.008 * (sim.teams[nearest.team].tactics.aggression - 50));
    if (!action.freeThrow && distance(p, nearest) < 1.35 && sim.random.next() < 0.07 * drawn) {
      sim.foul(nearest, p, true, points); return;
    }
    const quality = action.freeThrow ? clamp(0.73 + (p.ratings.shooting - 75) * 0.006, 0.5, 0.92) : this.quality(sim, p);
    const accurate = sim.random.next() < quality;
    const angle = sim.random.range(0, Math.PI * 2);
    const miss = accurate ? sim.random.range(0, 0.075) : sim.random.range(0.38, 0.85);
    const target = { x: hoop.x + Math.cos(angle) * miss, z: Math.sin(angle) * miss };
    b.owner = null; b.mode = 'shot'; b.x = p.x; b.z = p.z;
    b.y = action.shotType === 'dunk' ? 3.5 : action.shotType === 'layup' ? 2.75 : 2.45;
    const flightTime = action.shotType === 'dunk' ? 0.33 : action.shotType === 'layup' ? 0.75 : 1.12 + d * 0.033;
    b.vx = (target.x - b.x) / flightTime; b.vz = (target.z - b.z) / flightTime;
    b.vy = (COURT.rimY - b.y + GRAVITY * flightTime * flightTime / 2) / flightTime;
    b.flight = { shooter: p.id, team: p.team, points, elapsed: 0, type: action.shotType, quality, rim: false, board: false, resolved: false, freeThrow: action.freeThrow, origin: { x: p.x, z: p.z }, transition: sim.possession.transition && sim.time - sim.possession.started < 7 };
    sim.lastShot = b.flight;
    const team = sim.teams[p.team];
    if (action.freeThrow) { p.stats.fta++; team.stats.fta++; }
    else { p.stats.fga++; team.stats.fga++; if (three) { p.stats.tpa++; team.stats.tpa++; } if (action.shotType === 'layup' || action.shotType === 'dunk') p.stats.rimA++; }
    sim.record(action.freeThrow ? 'freeThrow' : 'shot', action.freeThrow ? 'Tiro libre' : action.shotType === 'dunk' ? 'Mate' : action.shotType === 'layup' ? 'Bandeja' : three ? 'Lanzamiento de tres' : 'Tiro de media distancia', p, false);
    sim.metrics[action.shotType] = (sim.metrics[action.shotType] || 0) + 1;
    if (!action.freeThrow && distance(p, nearest) < 0.95 && sim.random.next() < 0.08 * nearest.ratings.interiorDefense / 85) {
      nearest.stats.blocks++; team.stats.blocks += 0; sim.teams[nearest.team].stats.blocks++;
      nearest.animate('block', 0.9); b.vx *= -0.3; b.vz += sim.random.range(-3, 3); b.vy = 1;
      b.flight.blocked = true; sim.record('block', `${nearest.name} tapona`, nearest);
    }
  }
}

export class BallPhysics {
  update(sim, dt) {
    const b = sim.ball;
    // Substeps avoid tunnelling through rim, glass and floor at accelerated playback.
    const steps = Math.ceil(dt / (1 / 120));
    for (let i = 0; i < steps; i++) {
      if (!['shot', 'loose', 'scored'].includes(b.mode)) return;
      this.integrate(sim, dt / steps);
    }
  }
  integrate(sim, dt) {
    const b = sim.ball, old = { x: b.x, y: b.y, z: b.z };
    b.x += b.vx * dt; b.z += b.vz * dt; b.y += b.vy * dt - GRAVITY * dt * dt / 2; b.vy -= GRAVITY * dt;
    if (b.flight) b.flight.elapsed += dt;
    if (b.mode === 'shot') {
      const f = b.flight, dir = sim.direction(f.team), hoopX = dir * COURT.hoopX;
      const horizontal = Math.hypot(b.x - hoopX, b.z);
      if (!f.resolved && old.y >= COURT.rimY && b.y < COURT.rimY && b.vy < 0) {
        const t = (old.y - COURT.rimY) / (old.y - b.y);
        const crossX = old.x + (b.x - old.x) * t, crossZ = old.z + (b.z - old.z) * t;
        if (Math.hypot(crossX - hoopX, crossZ) < COURT.rimRadius - COURT.ballRadius * 0.45) {
          sim.score(f); b.mode = 'scored'; b.vx *= 0.2; b.vz *= 0.2; return;
        }
      }
      // Torus collision: closest point on the horizontal rim circle.
      if (horizontal > 0.01 && Math.abs(b.y - COURT.rimY) < 0.17) {
        const rimX = hoopX + (b.x - hoopX) / horizontal * COURT.rimRadius;
        const rimZ = b.z / horizontal * COURT.rimRadius;
        const nx = b.x - rimX, ny = b.y - COURT.rimY, nz = b.z - rimZ;
        const length = Math.hypot(nx, ny, nz), radius = COURT.ballRadius + 0.018;
        if (length < radius && length > 0.001) {
          const dot = (b.vx * nx + b.vy * ny + b.vz * nz) / length;
          if (dot < 0) {
            b.vx -= 1.65 * dot * nx / length; b.vy -= 1.65 * dot * ny / length; b.vz -= 1.65 * dot * nz / length;
            b.x = rimX + nx / length * radius; b.y = COURT.rimY + ny / length * radius; b.z = rimZ + nz / length * radius;
            if (!f.rim) { sim.emitAudio('rim'); sim.metrics.rim = (sim.metrics.rim || 0) + 1; }
            f.rim = true; sim.shotClock = sim.rules.offensiveReset;
          }
        }
      }
      const boardX = dir * 12.95;
      if (Math.abs(b.x - boardX) < COURT.ballRadius && Math.abs(b.z) < 0.95 && b.y > 2.95 && b.y < 4.1 && b.vx * dir > 0) {
        b.x = boardX - dir * COURT.ballRadius; b.vx *= -0.68;
        f.board = true; sim.emitAudio('board'); sim.metrics.board = (sim.metrics.board || 0) + 1;
      }
      if ((b.y < 2.7 && b.vy < 0 && f.elapsed > 0.55) || f.elapsed > 4) {
        sim.miss(f); b.mode = 'loose'; b.looseTime = 0;
      }
    }
    if (b.y < COURT.ballRadius) {
      b.y = COURT.ballRadius; b.vy = Math.abs(b.vy) * 0.62; b.vx *= 0.76; b.vz *= 0.76;
      if (b.vy > 0.7) sim.emitAudio('bounce');
    }
    if (b.mode === 'loose') {
      b.looseTime += dt;
      if (Math.abs(b.x) > 14.1 || Math.abs(b.z) > 7.6) sim.outOfBounds();
    }
  }
}

export class ReboundSystem {
  update(sim, dt) {
    const b = sim.ball;
    if (!['shot', 'loose'].includes(b.mode)) return;
    const fallTime = Math.max(0, (b.vy + Math.sqrt(b.vy * b.vy + 2 * GRAVITY * Math.max(0, b.y - 1.7))) / GRAVITY);
    const predicted = { x: clamp(b.x + b.vx * fallTime * 0.7, -13.2, 13.2), z: clamp(b.z + b.vz * fallTime * 0.7, -6.8, 6.8) };
    // Only the two best-positioned players on each team crash; others maintain floor balance.
    for (const team of sim.teams) {
      const ordered = team.active.map(p => ({ p, cost: distance(p, predicted) - p.ratings.rebounding * 0.012 - p.energy * 0.3 })).sort((a, b) => a.cost - b.cost);
      const crash = team.id === sim.possession.team ? (team.tactics.offReb < 25 ? 1 : team.tactics.offReb > 75 ? 3 : 2) : 2;
      ordered.forEach(({ p }, index) => {
        if (index < crash) {
          const offset = index === 0 ? 0 : 0.7;
          p.target = { x: predicted.x - sim.direction(p.team) * offset, z: predicted.z + offset * (p.slot % 2 ? 1 : -1) };
          p.state = 'rebound'; p.decision = 'Leer caída y ganar posición';
        } else {
          p.target = { x: p.x - sim.direction(p.team) * (b.mode === 'loose' ? 0.4 : 0.8), z: p.z };
          p.state = 'defense'; p.decision = 'Balance defensivo';
        }
      });
    }
    if (b.mode !== 'loose' || b.looseTime < 0.12) return;
    const candidates = sim.players.filter(p => distance(p, b) < 0.8 && b.y < p.height + 0.6 && b.vy < 2);
    candidates.sort((a, c) => {
      const value = p => distance(p, b) * 2 - p.ratings.rebounding / 160 - p.energy * 0.35 + sim.random.next() * 0.12;
      return value(a) - value(c);
    });
    const winner = candidates[0];
    if (winner) {
      const shot = b.flight?.shooter ? b.flight : null;
      const offense = shot && shot.team === winner.team;
      if (shot) {
        winner.stats.rebounds++; sim.teams[winner.team].stats.rebounds++;
        if (offense) { sim.teams[winner.team].stats.offensiveRebounds++; winner.stats.oreb++; }
        sim.record(offense ? 'offensiveRebound' : 'rebound', `${winner.name} · rebote ${offense ? 'ofensivo' : 'defensivo'}`, winner);
      }
      const changed = sim.possession.team !== winner.team;
      if (changed) sim.newPossession(winner.team, winner, true);
      else { sim.giveBall(winner); if (shot?.rim) sim.shotClock = sim.rules.offensiveReset; }
      winner.animate('rebound', 0.75); winner.cooldown = 0.65;
      if (offense && distance(winner, { x: sim.direction(winner.team) * COURT.hoopX, z: 0 }) < 1.8 && sim.random.next() < 0.35) {
        sim.record('tipIn', 'Palmeo de segunda oportunidad', winner); sim.shooting.prepare(sim, winner);
      }
    } else if (b.looseTime > 7) {
      // A tied-up ball has a rule-based exit, never an invisible teleport to a high-rated player.
      const team = sim.alternating; sim.alternating = 1 - sim.alternating;
      sim.record('heldBall', 'Balón dividido · posesión alterna'); sim.deadBall(team, 1.5);
    }
  }
}
