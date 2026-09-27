// Combate en vivo online por "lockstep" (MMA): el servidor y todos los clientes corren el MISMO simulador determinista (Hs, misma
// semilla) y avanzan por el reloj real; solo viajan las órdenes de las esquinas (con el paso en que se aplican) y checkpoints.
import { snapOf as snapAny, applySnap as applyAny } from '../../01-futbol/online/lockstep.mjs';
export const STEP = 1 / 30, STEP_MS = 1000 / 30;
export const LEAD_STEPS = 60;    // una orden se aplica 2 s después de pedirse, para que llegue a todos antes
export const CHECK_EVERY = 150;  // checkpoint de control cada 5 s de combate
const MAX_STEPS_PER_CALL = 4000;
export const HOLD_MS = 75e3;      // entre rounds la pelea espera al estudio + la tanda de anuncios (igual para todos: cuenta como tiempo pausado)
export const ORDERS = ['pressure', 'slow', 'takedown', 'body', 'leg', 'protect', 'finish', 'decision'];
export const snapOf = (m) => snapAny(m, true);
export const applySnap = (m, s, d) => applyAny(m, s, d, true);

export function cleanAction(side, msg) {
  if (!msg || (side !== 0 && side !== 1) || msg.k !== 'order' || !ORDERS.includes(msg.command)) return null;
  return { k: 'order', side, command: msg.command };
}
export function applyAction(sim, a) {
  try { Object.getPrototypeOf(sim).order.call(sim, a.side, a.command); } catch (e) { /* inválida: se ignora igual en todos */ }
}

export class Lockstep {
  constructor(sim, startAt, actions = []) {
    this.m = sim; this.startAt = startAt; this.actions = actions.map((a) => ({ ...a }));
    this.ai = 0; this.step = 0; this.pausedTotal = 0; this.hold = null; this.holdRound = 0; this.sigs = new Map(); this.newSigs = [];
  }
  get finished() { return !!this.m.result; }
  targetStep(now) { return Math.max(0, Math.floor((now - this.startAt - this.pausedTotal) / STEP_MS)); }
  state() { return { pausedTotal: this.pausedTotal, hold: this.hold, holdRound: this.holdRound }; }
  addAction(a) {
    let i = this.actions.length; while (i > 0 && this.actions[i - 1].step > a.step) i--;
    this.actions.splice(i, 0, a);
    if (i < this.ai) this.ai++;
  }
  rewind(step, st) {
    if (st) { this.pausedTotal = st.pausedTotal; this.hold = st.hold; this.holdRound = st.holdRound; }
    this.step = step; const i = this.actions.findIndex((a) => a.step >= step); this.ai = i < 0 ? this.actions.length : i;
    for (const k of [...this.sigs.keys()]) if (k >= step) this.sigs.delete(k);
    this.newSigs = [];
  }
  lateAction(a) { return a.step < this.step; }
  signature() {
    const m = this.m; let h = 2166136261;
    const mix = (v) => { h ^= Math.round(v * 10) | 0; h = Math.imul(h, 16777619) >>> 0; };
    mix(m.elapsed); mix(m.round); for (const f of m.fighters) { mix(f.position.x); mix(f.position.z); mix(f.health); mix(f.stamina); }
    return h >>> 0;
  }
  advanceSteps(target, each) {
    let n = 0;
    while (this.step < target && !this.finished && !this.hold && n++ < MAX_STEPS_PER_CALL) {
      while (this.ai < this.actions.length && this.actions[this.ai].step <= this.step) applyAction(this.m, this.actions[this.ai++]);
      this.m.step(); this.step++;
      if (each) each(this.step);
      if (this.step % CHECK_EVERY === 0) { const sig = this.signature(); this.sigs.set(this.step, sig); this.newSigs.push({ step: this.step, sig }); if (this.newSigs.length > 100) this.newSigs.shift(); if (this.sigs.size > 40) this.sigs.delete(this.sigs.keys().next().value); }
      if (this.m.phase === 'break' && this.holdRound !== this.m.round) { this.holdRound = this.m.round; this.hold = this.startAt + this.pausedTotal + this.step * STEP_MS + HOLD_MS; }
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
