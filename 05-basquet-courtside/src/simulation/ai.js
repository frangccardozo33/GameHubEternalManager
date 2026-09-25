import { COURT, clamp, lerp, distance, normalize, segmentDistance } from './model.js';

export class OffensiveAI {
  update(sim, dt) {
    const possession = sim.possession, team = sim.teams[possession.team];
    const offense = team.active, defense = sim.teams[1 - team.id].active;
    const dir = sim.direction(team.id), hoop = { x: dir * COURT.hoopX, z: 0 };
    const owner = sim.ball.owner;
    const elapsed = sim.time - possession.started;
    // Slots are spacing responsibilities, not restrictions on who may handle or finish.
    const slots = [[5.1, 0], [7.4, -5.1], [7.8, 5.1], [11.8, -6.3], [10.2, 2.3]];
    if (team.style === 'INTERIOR') slots[4] = [11, 1.7];
    if (team.style === 'PACE & SPACE') slots[4] = [10.8, 6.2];
    const transition = elapsed < 5 && possession.transition;
    for (const p of offense) {
      const slot = (p.slot + possession.rotation) % 5;
      let [x, z] = slots[slot];
      x *= dir;
      // Drift into actual open space; the defender and ball both modify the spacing anchor.
      const nearest = defense.reduce((a, b) => distance(p, a) < distance(p, b) ? a : b);
      const away = normalize(p.x - nearest.x, p.z - nearest.z);
      const phase = sim.time * 0.5 + p.index * 1.8;
      const target = { x: x + Math.sin(phase) * 0.5 + away.x * 0.35, z: z + Math.cos(phase) * 0.45 + away.z * 0.4 };
      p.state = 'spacing'; p.decision = 'Ocupar espacio libre';
      if (transition && p !== owner) {
        target.x = dir * (p.ratings.speed > 77 ? 11.1 : 6.5);
        target.z = (p.slot % 3 - 1) * 4.2;
        p.state = 'sprint'; p.decision = 'Correr carril de transición';
      }
      if (p.id === possession.cutter && elapsed > 3.5 && elapsed < 9 && !transition) {
        target.x = dir * 11.5; target.z = Math.sin(elapsed * 0.6) * 1.7;
        p.state = 'cut'; p.decision = 'Corte por espalda de defensa';
      }
      if (p.id === possession.screener && owner && p !== owner && !transition) {
        const screenAge = sim.time - possession.screenStarted;
        if (!possession.screenSet) {
          const defender = defense.find(d => d.mark === owner.id) || nearest;
          target.x = owner.x + dir * 0.9; target.z = owner.z + (defender.z > owner.z ? 0.85 : -0.85);
          p.state = 'screen'; p.decision = 'Establecer pantalla';
          if (distance(p, target) < 0.7 || screenAge > 4) {
            possession.screenSet = true; possession.screenStarted = sim.time;
            sim.record('screen', 'Pantalla', p, false);
          }
        } else if (screenAge < 5.5) {
          const pop = possession.play === 'pickPop';
          target.x = dir * (pop ? 5.6 : 11.7); target.z = pop ? (owner.z > 0 ? -4.6 : 4.6) : -Math.sign(owner.z || 1) * 1.2;
          p.state = pop ? 'spacing' : 'cut'; p.decision = pop ? 'Abrirse tras pantalla' : 'Continuar hacia el aro';
        }
      }
      if (possession.play === 'post' && p.id === possession.postPlayer && !transition) {
        target.x = dir * 10.9; target.z = possession.side * 1.8;
        p.decision = 'Ganar posición al poste';
      }
      if (p === owner) {
        p.heldTime += dt;
        const advance = p.x * dir < 4.5;
        const driving = sim.time < p.driveUntil;
        if (advance) {
          target.x = dir * 6; target.z = p.z * 0.7;
          p.state = transition ? 'sprint' : 'dribble'; p.decision = 'Subir balón';
        } else if (driving) {
          target.x = dir * 12; target.z = p.z * 0.4;
          p.state = 'drive'; p.decision = 'Atacar intervalo';
        } else {
          target.x = p.x + dir * 0.14;
          target.z = p.z + Math.sin(sim.time * 1.5 + p.index) * 0.55;
          p.state = 'dribble'; p.decision = 'Leer defensa';
          if (possession.screenSet && sim.time - possession.screenStarted < 2) {
            target.x = p.x + dir * 1.5; target.z = p.z + possession.side * 1.8;
            p.decision = 'Usar pantalla';
          }
        }
        if (p.action === 'shoot' || p.action === 'freeThrow') { target.x = p.x; target.z = p.z; }
        if (p.cooldown <= 0 && !sim.pendingAction && sim.ball.mode === 'held' && p.heldTime > 0.35) {
          this.decide(sim, p, defense, hoop, elapsed, advance, transition);
          p.cooldown = sim.random.range(0.42, 0.85) * (1.25 - p.ratings.decisions / 250) / Math.max(0.65, p.energy) * (1 - (sim.teams[p.team].profile.tempo - 0.5) * 0.5);
        }
      }
      p.target = { x: clamp(target.x, -13.1, 13.1), z: clamp(target.z, -6.7, 6.7) };
    }
  }

  decide(sim, p, defense, hoop, elapsed, advance, transition) {
    const team = sim.teams[p.team], pos = sim.possession;
    const d = distance(p, hoop), closest = Math.min(...defense.map(q => distance(p, q)));
    const shot = sim.shooting.quality(sim, p);
    const window = 8 + (team.profile.tempo - 0.5) * 6, hurry = clamp((window - sim.shotClock) / window, 0, 1);
    const prof = team.profile, tempo = prof.tempo, readyAfter = 5 - (tempo - 0.5) * 6.3, pace = 1 - (tempo - 0.5) * 0.4;
    const ready = elapsed > readyAfter || (transition && d < 4) || p.catchQuality > 1;
    const teammates = team.active.filter(q => q !== p);
    const options = teammates.map(q => {
      const open = Math.min(...defense.map(r => distance(q, r)));
      const lane = Math.min(...defense.map(r => segmentDistance(r, p, q)));
      const progress = (q.x - p.x) * sim.direction(p.team);
      let value = open * 0.22 + Math.min(lane, 2) * 0.3 + sim.shooting.quality(sim, q) * 0.8 + (sim.usageOf(q) - 1) * 1.1;
      value -= Math.max(0, distance(p, q) - 12) * 0.15;
      if (transition) value += progress * 0.15;
      if (q.id === pos.postPlayer && pos.play === 'post') value += 0.65;
      if (q.id === pos.screener && pos.screenSet) value += 0.75;
      if (q.state === 'cut' && open > 1) value += 0.65;
      if (sim.time < p.driveUntil && Math.abs(q.z) > 4.5 && closest < 1.8) value += 1.1;
      if (pos.lastPasser === q.id && sim.time - pos.lastPassTime < 2.5) value -= 1;
      return { q, value, lane, open };
    }).sort((a, b) => b.value - a.value);
    const best = options[0];
    const zoneMult = d > 6.75 ? prof.three : d < 2.8 ? prof.rim : prof.mid;
    const shootValue = (shot * 1.5 + hurry * 0.9 + (p.heldTime < 1.4 ? 0.16 : 0)) * zoneMult * sim.usageOf(p);
    const passValue = best.value * 0.7 * team.profile.pass + (closest < 1 ? 0.35 : 0);
    const rimLane = Math.min(...defense.filter(q => (q.x - p.x) * sim.direction(p.team) > 0.4).map(q => segmentDistance(q, p, hoop)), 4);
    const driveValue = (p.ratings.handling / 130 + rimLane * 0.22 + (closest > 1.5 ? 0.2 : 0)) * team.profile.drive * prof.rim * p.energy;
    const noise = () => sim.random.range(-0.15, 0.15);
    if (!advance && ready && (sim.shotClock < 1.8 || (d < 2.8 && p.heldTime > 0.45) || (shootValue + noise() > passValue && shootValue > driveValue && elapsed > readyAfter + 1))) {
      p.decision = d > 6.75 ? 'Triple contextual' : 'Finalizar'; sim.shooting.prepare(sim, p); return;
    }
    if (best && p.heldTime > (advance ? 1.3 : 1.0) * pace && distance(p, best.q) > 2 && distance(p, best.q) < 20 &&
      (passValue + noise() > driveValue || p.heldTime > 3.2 || (transition && (best.q.x - p.x) * sim.direction(p.team) > 4))) {
      p.decision = sim.time < p.driveUntil ? 'Kick-out' : 'Pase al espacio';
      if (sim.time < p.driveUntil) sim.record('kickOut', 'Pase a la esquina', p, false);
      sim.passing.prepare(sim, p, best.q); return;
    }
    if (!advance && p.driveUntil < sim.time && (driveValue > 0.8 || sim.shotClock < 7) && p.heldTime > 1.1) {
      p.driveUntil = sim.time + sim.random.range(1.5, 3.1); p.hand *= -1;
      p.animate('crossover', 0.42); sim.record('drive', 'Penetración', p, false);
    }
    // Recycle a stalled play rather than keeping a static arrangement indefinitely.
    if (elapsed > 12 && !pos.recycled && sim.shotClock > 7) {
      pos.rotation = (pos.rotation + 1) % 5; pos.recycled = true;
      sim.record('reset', 'Reiniciar ataque', p, false);
    }
  }
}

// Zonas: [profundidad respecto al aro, desplazamiento lateral]. Se reparten por altura (bajos fuera, altos cerca del aro).
const ZONES = {
  zone23: [[6.2, -2.4], [6.2, 2.4], [2.5, -3.7], [2.0, 0], [2.5, 3.7]],
  zone32: [[6.4, -4.2], [6.0, 0], [6.4, 4.2], [2.6, -2.3], [2.6, 2.3]],
  zone131: [[6.0, 0], [5.4, -4.3], [5.0, 0], [5.4, 4.3], [0.9, 0]],
};
export class DefensiveAI {
  update(sim, dt) {
    const offense = sim.teams[sim.possession.team].active;
    const defense = sim.teams[1 - sim.possession.team].active;
    const dir = sim.direction(sim.possession.team), hoop = { x: dir * COURT.hoopX, z: 0 };
    const owner = sim.ball.owner, tac = sim.teams[1 - sim.possession.team].tactics;
    // Multiplicadores de la forma 1 + (x - 50)·c: valen exactamente 1 con tácticas neutras.
    const pr = tac.pressure - 50, ag = tac.aggression - 50, gapMul = 1 - pr * 0.0055, offGapMul = 1 - pr * 0.005;
    const stealMul = (1 + ag * 0.008) * (1 + pr * 0.003), foulMul = (1 + ag * 0.009) * (1 + pr * 0.002);
    const zone = tac.defense !== 'man' ? ZONES[tac.defense] : null;
    let zoneAnchor = null, zoneOnBall = null;
    if (zone) {
      const depthScale = clamp((COURT.hoopX - sim.ball.x * dir) / 7.5, 0.55, 1.15);
      const anchors = zone.map(([depth, lateral]) => ({ x: dir * (COURT.hoopX - depth * depthScale), z: clamp(lateral + sim.ball.z * 0.35, -6.5, 6.5), depth }))
        .sort((a, b) => b.depth - a.depth);
      const order = [...defense].sort((a, b) => a.height - b.height);
      zoneAnchor = new Map(order.map((d, i) => [d.id, anchors[i % anchors.length]]));
      if (owner) zoneOnBall = defense.reduce((a, b) => distance(a, owner) < distance(b, owner) ? a : b);
    }
    for (const d of defense) {
      let mark = offense.find(p => p.id === d.mark);
      if (!mark) { mark = offense[d.slot]; d.mark = mark.id; }
      const toHoop = normalize(hoop.x - mark.x, -mark.z);
      const onBall = mark === owner;
      const gap = (onBall ? 1.05 + (100 - d.ratings.defense) * 0.006 : 1.6) * (onBall ? gapMul : offGapMul);
      let target = { x: mark.x + toHoop.x * gap, z: mark.z + toHoop.z * gap };
      d.state = 'defense'; d.decision = 'Defensa individual';
      if (zone) {
        const a = zoneAnchor.get(d.id); target = { x: a.x, z: a.z }; d.decision = `Zona ${tac.defense === 'zone23' ? '2-3' : tac.defense === 'zone32' ? '3-2' : '1-3-1'}`;
        if (d === zoneOnBall) { const away = normalize(hoop.x - owner.x, -owner.z); target = { x: owner.x + away.x * gap, z: owner.z + away.z * gap }; d.decision = 'Presionar balón en zona'; }
      } else if (distance(d, target) > 3) { d.state = 'closeout'; d.decision = 'Recuperar marca'; }
      if (!zone && owner && !onBall && distance(owner, hoop) < 4.5 && distance(d, owner) < 4.2 && distance(mark, hoop) > 4) {
        target = { x: owner.x + dir * 1, z: owner.z * 0.65 };
        d.state = 'help'; d.decision = 'Ayuda interior';
      }
      const screener = offense.find(p => p.id === sim.possession.screener);
      if (!zone && screener && sim.possession.screenSet && onBall && distance(d, screener) < 1.3) {
        const pos = sim.possession, again = tac.switching === 'always' && sim.time - (pos.switchTime ?? -99) > 3;
        if (tac.switching === 'never') {
          if (!pos.fought) { pos.fought = true; d.stuck = 0.75; d.decision = 'Pelear la pantalla'; sim.record('fight', 'Pantalla bien puesta', d, false); }
        } else if (!pos.switched || again) {
          const partner = defense.find(q => q.mark === screener.id);
          if (partner && partner !== d) {
            partner.mark = d.mark; d.mark = screener.id; pos.switched = true; pos.switchTime = sim.time;
            d.decision = 'Switch de pantalla'; sim.record('switch', 'Cambio defensivo', d, false);
          }
        }
      }
      if (owner && distance(d, owner) < 1.05 && sim.ball.mode === 'held' && !sim.pendingAction && owner.heldTime > 0.8) {
        const pressure = (d.ratings.defense / 100) * (1.2 - owner.ratings.handling / 180) * (1.4 - owner.energy * 0.4);
        if (sim.random.next() < dt * 0.018 * pressure * foulMul) {
          sim.foul(d, owner, false); return;
        }
        if (sim.random.next() < dt * 0.032 * pressure * stealMul) {
          d.animate('steal', 0.4); owner.stats.turnovers++; sim.teams[owner.team].stats.turnovers++;
          d.stats.steals++; sim.teams[d.team].stats.steals++;
          sim.record('steal', `${d.name} roba el balón`, d);
          sim.makeLoose(d.x, 0.5, d.z, sim.direction(d.team) * 3, 1.2, 0, d.team);
        }
      }
      d.target = { x: clamp(target.x, -13.1, 13.1), z: clamp(target.z, -6.8, 6.8) };
    }
  }
}

export class MovementSystem {
  update(sim, dt) {
    const players = sim.players;
    for (const p of players) {
      p.cooldown = Math.max(0, p.cooldown - dt); p.contact = Math.max(0, p.contact - dt * 2);
      if (p.actionTime > 0) p.actionTime = Math.max(0, p.actionTime - dt); else p.action = null;
      let dx = p.target.x - p.x, dz = p.target.z - p.z;
      const targetDistance = Math.hypot(dx, dz);
      const forward = normalize(dx, dz);
      let desiredX = forward.x, desiredZ = forward.z;
      // Predictive separation steers before contact; hard separation below is a safety net.
      for (const other of players) {
        if (other === p) continue;
        const px = p.x + p.vx * 0.15 - other.x - other.vx * 0.15;
        const pz = p.z + p.vz * 0.15 - other.z - other.vz * 0.15;
        const d = Math.hypot(px, pz);
        const radius = p.team === other.team ? 1.35 : 0.8;
        if (d < radius && d > 0.01) {
          const strength = (radius - d) / radius;
          desiredX += px / d * strength * 1.8; desiredZ += pz / d * strength * 1.8;
        }
      }
      const heading = normalize(desiredX, desiredZ);
      const sprint = ['sprint', 'drive', 'cut', 'closeout', 'rebound'].includes(p.state);
      const defensive = ['defense', 'help'].includes(p.state);
      let maxSpeed = (3.1 + p.ratings.speed * 0.033) * (0.65 + p.energy * 0.35);
      if (!sprint) maxSpeed *= defensive ? 0.7 : 0.78;
      if (sim.ball.owner === p) maxSpeed *= 0.87;
      if (p.action === 'shoot' || p.action === 'freeThrow') maxSpeed = 0;
      if (p.state === 'screen' && targetDistance < 0.6) maxSpeed *= 0.1;
      if (p.stuck > 0) { p.stuck -= dt; maxSpeed *= 0.3; }
      const speed = Math.min(maxSpeed, targetDistance * 3.8);
      const acc = (7 + p.ratings.acceleration * 0.075) * dt;
      const dv = normalize(heading.x * speed - p.vx, heading.z * speed - p.vz);
      const change = Math.min(acc, Math.hypot(heading.x * speed - p.vx, heading.z * speed - p.vz));
      p.vx += dv.x * change; p.vz += dv.z * change;
      p.x = clamp(p.x + p.vx * dt, -13.35, 13.35); p.z = clamp(p.z + p.vz * dt, -7.05, 7.05);
      const focus = defensive ? sim.ball : (sim.ball.owner === p && speed < 1 ? { x: sim.direction(p.team) * COURT.hoopX, z: 0 } : { x: p.x + p.vx, z: p.z + p.vz });
      if (distance(focus, p) > 0.1) {
        const angle = Math.atan2(focus.x - p.x, focus.z - p.z);
        const delta = Math.atan2(Math.sin(angle - p.facing), Math.cos(angle - p.facing));
        p.facing += delta * Math.min(1, dt * (defensive ? 9 : 7));
      }
    }
    for (let iteration = 0; iteration < 2; iteration++) {
      for (let i = 0; i < players.length; i++) for (let j = i + 1; j < players.length; j++) {
        const a = players[i], b = players[j], d = distance(a, b);
        if (d < 0.57) {
          const n = d < 0.001 ? { x: 1, z: 0 } : normalize(a.x - b.x, a.z - b.z);
          const push = (0.57 - d) * 0.5;
          a.x += n.x * push; a.z += n.z * push; b.x -= n.x * push; b.z -= n.z * push;
          a.contact = b.contact = 0.35;
        }
      }
    }
  }
}

export class StaminaSystem {
  update(sim, dt) {
    for (const team of sim.teams) for (const p of team.roster) {
      if (!p.active) p.energy = Math.min(1, p.energy + dt * 0.0038);
      else {
        const effort = Math.hypot(p.vx, p.vz) / 6, tac = sim.teams[p.team].tactics;
        const load = (1 + 0.005 * (tac.pressure - 50) * (['defense', 'help', 'closeout'].includes(p.state) ? 1 : 0)) * (1 + 0.003 * (tac.tempo - 50));
        p.energy = clamp(p.energy - dt * (0.00018 + effort * 0.0015) * (1.35 - p.ratings.stamina / 200) * load, 0.25, 1);
        p.minutes += dt / 60;
      }
    }
  }
}

export class SubstitutionSystem {
  choose(sim, team, out) {
    const limit = sim.rules.foulLimit, gm = sim.rules.periods * sim.rules.periodSeconds / 60;
    const score = q => q.energy * 3 - Math.abs(q.height - out.height) + (q.targetMin != null ? (q.targetMin - q.minutes) / gm * 4 : 0);
    return team.roster.filter(q => !q.active && q.fouls < limit).sort((a, b) => score(b) - score(a))[0];
  }
  swap(sim, team, p, sub, text) {
    p.active = false; sub.active = true; sub.slot = p.slot; sub.enteredAt = sim.time;
    sub.x = p.x; sub.z = p.z; sub.vx = 0; sub.vz = 0; sub.target = { ...p.target }; sub.mark = p.mark;
    if (sim.ball.owner === p) sim.ball.owner = sub;
    sim.record('substitution', text ?? `${sub.name} entra por ${p.name}`, sub);
  }
  update(sim, forceRest = false) {
    const limit = sim.rules.foulLimit, gm = sim.rules.periods * sim.rules.periodSeconds / 60, clutch = sim.isClutch();
    for (const team of sim.teams) {
      const plan = team.plan, tiredAt = { low: 0.58, normal: 0.68, high: 0.78 }[plan.staminaPolicy] ?? 0.68;
      const troubleAt = plan.foulPolicy === 'careful' ? sim.period : plan.foulPolicy === 'risky' ? limit - 1 : sim.period + 1;
      while (team.subQueue.length) {
        const { out, inn } = team.subQueue.shift(), o = team.roster.find(p => p.id === out), i = team.roster.find(p => p.id === inn);
        if (o?.active && i && !i.active && i.fouls < limit) this.swap(sim, team, o, i, `${i.name} entra por ${o.name} · cambio del entrenador`);
      }
      const closer = clutch ? team.roster.find(p => p.id === plan.closer) : null;
      for (const p of team.active) {
        const disqualified = p.fouls >= limit, protectedCloser = closer === p && p.energy > 0.35;
        const tired = !protectedCloser && (p.energy < tiredAt || (forceRest && p.energy < 0.9));
        const foulTrouble = !(clutch && plan.closer) && p.fouls >= troubleAt && p.fouls > 1;
        if (!disqualified && !tired && !foulTrouble) continue;
        const sub = this.choose(sim, team, p);
        if (!sub || (!disqualified && sub.energy < p.energy + 0.08 && !foulTrouble)) continue;
        this.swap(sim, team, p, sub);
      }
      if (closer && !closer.active && closer.fouls < limit && closer.energy > 0.4) {
        const out = team.active.filter(p => p.id !== closer.id).sort((a, b) => a.ovr - b.ovr)[0];
        if (out) this.swap(sim, team, out, closer, `${closer.name} entra para el cierre`);
      }
      // Plan de minutos: intercambia al más "pasado" de minutos por el banquillo más "atrasado".
      if (team.roster.some(p => p.targetMin != null)) {
        const need = q => (q.targetMin ?? 0) - q.minutes, minStint = sim.rules.periodSeconds * 0.15;
        for (let i = 0; i < 2; i++) {
          const out = team.active.filter(p => p !== closer && sim.time - p.enteredAt > minStint).sort((a, b) => need(a) - need(b))[0];
          const inn = team.roster.filter(q => !q.active && q.fouls < limit && q.energy > 0.6 && q.targetMin > 0).sort((a, b) => need(b) - need(a))[0];
          if (!out || !inn || need(inn) - need(out) < 0.06 * gm) break;
          this.swap(sim, team, out, inn);
        }
      }
    }
  }
}
