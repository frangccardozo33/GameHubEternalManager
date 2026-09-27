// Partido en vivo online por "lockstep": el servidor y todos los clientes corren el MISMO motor determinista
// (misma semilla, mismos equipos) y avanzan por el reloj real. Solo viajan las acciones de los DT (con el paso en que
// se aplican) y checkpoints de control. Este archivo lo usan el servidor (Cloudflare) y la pantalla de partido.
import { MatchSimulator } from '../simulation/match.js';

export const STEP = 1 / 60, STEP_MS = 1000 / 60;
export const HALF_MS = 120e3;   // el descanso dura lo que el estudio + la tanda de anuncios
export const LEAD_STEPS = 90;   // una acción se aplica 1,5 s después de pedirse, para que llegue a todos antes
export const CHECK_EVERY = 300; // checkpoint de control cada 5 s de juego
const MAX_STEPS_PER_CALL = 4000;

export const buildSim = (init) => new MatchSimulator({ seed: init.seed, rules: init.rules, teams: init.specs });

// Aplica una acción de DT sobre un simulador. Se usa igual en servidor y clientes (siempre con los métodos originales:
// en el cliente los del DT están interceptados para enviar la orden al servidor en vez de aplicarla al instante).
const P = MatchSimulator.prototype;
export function applyAction(sim, a) {
  const t = a.team;
  if (t !== 0 && t !== 1) return;
  if (a.k === 'tactics') P.setTactics.call(sim, t, a.p);
  else if (a.k === 'usage') P.setUsage.call(sim, t, a.id, a.level);
  else if (a.k === 'assign') P.setAssignment.call(sim, t, a.id, a.slot);
  else if (a.k === 'sub') P.substitute.call(sim, t, a.out, a.in);
  else if (a.k === 'timeout') P.timeout.call(sim, t);
  else if (a.k === 'plan') sim.teams[t].plan[a.key] = a.val;
}

// Valida lo que pide un DT (forma y rangos); el motor valida el resto (jugador en cancha, faltas, etc.).
export function cleanAction(sim, side, m) {
  const t = sim.teams[side]; if (!t || !m) return null;
  const ids = new Set(t.roster.map((p) => p.id)), num = (v, lo, hi) => Number.isFinite(+v) && +v >= lo && +v <= hi;
  if (m.k === 'tactics') {
    const p = {};
    for (const [k, v] of Object.entries(m.p || {})) {
      if (!(k in t.tactics)) continue;
      const cur = t.tactics[k];
      if (typeof cur === 'number') { if (num(v, 0, 100)) p[k] = Math.round(+v); }
      else if (typeof cur === 'string' && typeof v === 'string' && v.length < 24) p[k] = v;
    }
    return Object.keys(p).length ? { k: 'tactics', team: side, p } : null;
  }
  if (m.k === 'usage') return ids.has(m.id) && num(m.level, 0.3, 1.8) ? { k: 'usage', team: side, id: m.id, level: +m.level } : null;
  if (m.k === 'assign') return ids.has(m.id) && (m.slot === '' || m.slot == null || num(m.slot, 0, 4)) ? { k: 'assign', team: side, id: m.id, slot: m.slot === '' ? null : m.slot } : null;
  if (m.k === 'sub') return ids.has(m.out) && ids.has(m.in) ? { k: 'sub', team: side, out: m.out, in: m.in } : null;
  if (m.k === 'timeout') return { k: 'timeout', team: side };
  if (m.k === 'plan' && ['closer', 'foulPolicy', 'staminaPolicy'].includes(m.key)) {
    const v = m.val == null ? null : String(m.val);
    if (v !== null && (v.length > 32 || (m.key === 'closer' && !ids.has(v)))) return null;
    return { k: 'plan', team: side, key: m.key, val: v };
  }
  return null;
}

export class Lockstep {
  constructor(sim, startAt, actions = []) {
    this.sim = sim; this.startAt = startAt; this.actions = actions.map((a) => ({ ...a }));
    this.ai = 0; this.step = 0; this.pausedTotal = 0; this.halfHold = null; this.halfSeen = false;
    this.sigs = new Map(); this.newSigs = [];
    sim.start();
  }
  get finished() { return this.sim.phase === 'finished'; }
  targetStep(now) { return Math.max(0, Math.floor((now - this.startAt - this.pausedTotal) / STEP_MS)); }
  // Inserta una acción en su lugar (estable: a igual paso, respeta el orden de llegada).
  addAction(a) {
    let i = this.actions.length; while (i > 0 && this.actions[i - 1].step > a.step) i--;
    this.actions.splice(i, 0, a);
    if (i < this.ai) this.ai++;   // ya hay pasos recorridos más allá: no se reaplica (el llamador detecta el desvío con lateAction)
  }
  lateAction(a) { return a.step < this.step; } // llegó después de su paso: hay que re-sincronizar
  signature() {
    const s = this.sim; let h = 2166136261;
    const mix = (v) => { h ^= Math.round(v * 10) | 0; h = Math.imul(h, 16777619) >>> 0; };
    mix(s.period); mix(s.clock); for (const t of s.teams) mix(t.score); for (const p of s.players) { mix(p.x); mix(p.z); }
    return h >>> 0;
  }
  advanceSteps(target, each) {
    let n = 0;
    while (this.step < target && !this.finished && !this.halfHold && n++ < MAX_STEPS_PER_CALL) {
      while (this.ai < this.actions.length && this.actions[this.ai].step <= this.step) applyAction(this.sim, this.actions[this.ai++]);
      this.sim.step(STEP); this.step++;
      if (each) each(this.step);
      if (this.step % CHECK_EVERY === 0) { const sig = this.signature(); this.sigs.set(this.step, sig); this.newSigs.push({ step: this.step, sig }); if (this.newSigs.length > 100) this.newSigs.shift(); if (this.sigs.size > 40) this.sigs.delete(this.sigs.keys().next().value); }
      if (this.sim.phase === 'interval' && this.sim.period === this.sim.rules.periods / 2 && !this.halfSeen) { this.halfSeen = true; this.halfHold = this.startAt + this.pausedTotal + this.step * STEP_MS + HALF_MS; }
    }
  }
  // Avanza hasta el instante `now` (reloj del servidor). Devuelve true si todavía queda por recorrer (límite por llamada).
  advanceTo(now, each) {
    for (let g = 0; g < 4; g++) {
      if (this.halfHold) { if (now < this.halfHold) return false; this.pausedTotal += HALF_MS; this.halfHold = null; }
      const target = this.targetStep(now);
      this.advanceSteps(target, each);
      if (!this.halfHold) return this.step < target && !this.finished;
    }
    return false;
  }
}
