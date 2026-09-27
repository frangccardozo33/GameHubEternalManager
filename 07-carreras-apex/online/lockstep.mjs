// Carrera en vivo online por "lockstep" (LRO): el servidor y todos los clientes corren el MISMO motor determinista (misma semilla,
// mismo Career) y avanzan por el reloj real; solo viajan las órdenes de los equipos (con el paso en que se aplican) y checkpoints.
import { snapOf as snapAny, applySnap as applyAny } from '../../01-futbol/online/lockstep.mjs';
export const STEP_MS = 1000 / 60;
export const LEAD_STEPS = 90;     // una orden se aplica 1,5 s después de pedirse, para que llegue a todos antes
export const CHECK_EVERY = 300;   // checkpoint de control cada 5 s de carrera
const MAX_STEPS_PER_CALL = 4000;
export const HOLD_MS = 75e3;      // a mitad de carrera espera al estudio + la tanda de anuncios (igual para todos: cuenta como tiempo pausado)
export const CMDS = { pace: ['push', 'standard', 'conserve'], tyres: ['push', 'standard', 'save'], pit: ['now', 'next', 'stay'], overtake: ['attack', 'standard', 'defend'], fuel: ['push', 'standard', 'save'] };
export const snapOf = (race) => ({ s: snapAny(race.state, true), v: race.vars() });
export const applySnap = (race, snap, d) => { applyAny(race.state, snap.s, d, true); race.setVars(snap.v); };

export function cleanAction(car, msg) {
  if (!msg || !Number.isInteger(car) || car < 0 || msg.k !== 'cmd' || !CMDS[msg.cmd] || !CMDS[msg.cmd].includes(msg.val)) return null;
  return { k: 'cmd', car, cmd: msg.cmd, val: msg.val };
}
export function applyAction(race, a) {
  const c = race.state.cars[a.car]; if (!c || !c.commands) return;
  if (a.cmd === 'pit' && a.val === 'next') { c.pitLap = c.lap + 1; c.commands.pit = 'next'; } else c.commands[a.cmd] = a.val;
}

export class Lockstep {
  constructor(race, startAt, actions = []) {
    this.m = race; this.startAt = startAt; this.actions = actions.map((a) => ({ ...a }));
    this.ai = 0; this.step = 0; this.pausedTotal = 0; this.hold = null; this.sigs = new Map(); this.newSigs = [];
  }
  get finished() { return this.m.state.phase === 'finished'; }
  targetStep(now) { return Math.max(0, Math.floor((now - this.startAt - this.pausedTotal) / STEP_MS)); }
  state() { return { pausedTotal: this.pausedTotal, hold: this.hold }; }
  addAction(a) {
    let i = this.actions.length; while (i > 0 && this.actions[i - 1].step > a.step) i--;
    this.actions.splice(i, 0, a);
    if (i < this.ai) this.ai++;
  }
  rewind(step, st) {
    if (st) { this.pausedTotal = st.pausedTotal; this.hold = st.hold; }
    this.step = step; const i = this.actions.findIndex((a) => a.step >= step); this.ai = i < 0 ? this.actions.length : i;
    for (const k of [...this.sigs.keys()]) if (k >= step) this.sigs.delete(k);
    this.newSigs = [];
  }
  lateAction(a) { return a.step < this.step; }
  signature() {
    const s = this.m.state; let h = 2166136261;
    const mix = (v) => { h ^= Math.round(v * 10) | 0; h = Math.imul(h, 16777619) >>> 0; };
    mix(s.elapsed); mix(s.countdown); for (const c of s.cars) { mix(c.s); mix(c.lane); mix(c.v); mix(c.wear); }
    return h >>> 0;
  }
  advanceSteps(target, each) {
    let n = 0;
    while (this.step < target && !this.finished && !this.hold && n++ < MAX_STEPS_PER_CALL) {
      while (this.ai < this.actions.length && this.actions[this.ai].step <= this.step) applyAction(this.m, this.actions[this.ai++]);
      this.m.stepSim(); this.step++;
      if (each) each(this.step);
      if (this.step % CHECK_EVERY === 0) { const sig = this.signature(); this.sigs.set(this.step, sig); this.newSigs.push({ step: this.step, sig }); if (this.newSigs.length > 100) this.newSigs.shift(); if (this.sigs.size > 40) this.sigs.delete(this.sigs.keys().next().value); }
      if (this.m.takeHalf()) this.hold = this.startAt + this.pausedTotal + this.step * STEP_MS + HOLD_MS;
    }
  }
  // Avanza hasta el instante `now` (reloj del servidor). Devuelve true si todavía queda por recorrer (límite por llamada).
  advanceTo(now, each) {
    for (let g = 0; g < 8; g++) {
      if (this.hold) { if (now < this.hold) return false; this.pausedTotal += HOLD_MS; this.hold = null; }
      const target = this.targetStep(now);
      this.advanceSteps(target, each);
      if (!this.hold) return this.step < target && !this.finished;
    }
    return false;
  }
}
