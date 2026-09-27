// Partido en vivo online por "lockstep" (fútbol): el servidor y todos los clientes corren el MISMO motor determinista
// (misma semilla y configuración de partido) y avanzan por el reloj real; solo viajan las acciones de los DT (con el paso
// en que se aplican) y checkpoints de control. Lo usan el servidor (Cloudflare) y la transmisión del navegador.
export const STEP = 1 / 60, STEP_MS = 1000 / 60;
export const HALF_MS = 120e3;   // el descanso dura lo que el estudio + la tanda de anuncios
export const LEAD_STEPS = 90;   // una acción se aplica 1,5 s después de pedirse, para que llegue a todos antes
export const CHECK_EVERY = 300; // checkpoint de control cada 5 s de juego
const MAX_STEPS_PER_CALL = 4000;

const plain = (v, depth = 0) => { // datos simples y acotados (los valida el motor, acá solo se limita la forma)
  if (v === null || ['number', 'boolean'].includes(typeof v)) return typeof v !== 'number' || Number.isFinite(v);
  if (typeof v === 'string') return v.length <= 40;
  if (depth > 2 || typeof v !== 'object') return false;
  const ks = Object.keys(v); if (ks.length > 40) return false;
  return ks.every((k) => k.length <= 40 && plain(v[k], depth + 1));
};

// Aplica una acción de DT con los métodos ORIGINALES del motor (en el cliente los del DT están interceptados).
export function applyAction(m, a) {
  const P = Object.getPrototypeOf(m);
  try {
    if (a.k === 'tactic') P.requestTactic.call(m, a.team, a.patch, a.meta || {});
    else if (a.k === 'preset') P.applyPreset.call(m, a.team, a.name);
    else if (a.k === 'formation') P.requestFormation.call(m, a.team, a.formation);
    else if (a.k === 'role') P.setPlayerRole.call(m, a.id, a.instr);
    else if (a.k === 'rule') P.setRule.call(m, a.team, a.id, a.patch);
    else if (a.k === 'sub') P.tlmRequestSub.call(m, a.team, a.outId, a.benchIdx, a.reason || 'táctico', a.opts || {});
  } catch (e) { /* una orden inválida no debe romper el partido: se ignora igual en todos */ }
}

// Valida lo que pide un DT: solo su equipo y datos simples. El motor valida el resto (enums, rangos, cambios disponibles).
export function cleanAction(m, side, msg) {
  if (!msg || (side !== 0 && side !== 1)) return null;
  const mine = (id) => m.players.some((p) => p.id === id && p.team === side);
  if (msg.k === 'tactic' && plain(msg.patch) && typeof msg.patch === 'object') return { k: 'tactic', team: side, patch: msg.patch, meta: {} };
  if (msg.k === 'preset' && typeof msg.name === 'string' && msg.name.length < 40) return { k: 'preset', team: side, name: msg.name };
  if (msg.k === 'formation' && typeof msg.formation === 'string' && msg.formation.length < 20) return { k: 'formation', team: side, formation: msg.formation };
  if (msg.k === 'role' && mine(msg.id) && (msg.instr === null || plain(msg.instr))) return { k: 'role', team: side, id: msg.id, instr: msg.instr };
  if (msg.k === 'rule' && typeof msg.id === 'string' && msg.id.length < 40 && plain(msg.patch)) return { k: 'rule', team: side, id: msg.id, patch: msg.patch };
  if (msg.k === 'sub' && mine(msg.outId) && Number.isInteger(msg.benchIdx) && msg.benchIdx >= 0 && msg.benchIdx < 30) return { k: 'sub', team: side, outId: msg.outId, benchIdx: msg.benchIdx, reason: typeof msg.reason === 'string' ? msg.reason.slice(0, 30) : 'táctico', opts: {} };
  return null;
}

// Foto COMPLETA del estado del motor (grafo de objetos simples, con referencias compartidas y ciclos) para corregir a un cliente
// que se desvió del servidor. Se recorre por claves ordenadas; los objetos no simples (modelos 3D, DOM, funciones) se omiten.
const SKIP = new Set(['onEvent', 'onTlmSwap', 'running']);
const NOT_DATA = new Set(['Set', 'Map', 'WeakMap', 'WeakSet', 'Promise', 'Date', 'RegExp']);
// cls=true: también las instancias de clases propias del motor (p. ej. los peleadores de MMA); nunca colecciones, DOM ni objetos 3D
const plainObj = (v, cls) => { const pr = Object.getPrototypeOf(v); return pr === Object.prototype || pr === null || Array.isArray(v) || (!!cls && !NOT_DATA.has(v.constructor && v.constructor.name) && !v.nodeType && !v.isObject3D); };
export function snapOf(m, cls = false) {
  const ids = new Map(); let n = 0;
  const walk = (v, root) => {
    if (typeof v === 'function' || typeof v === 'symbol' || typeof v === 'undefined') return undefined;
    if (typeof v === 'number') return Number.isFinite(v) ? v : { $n: String(v) };
    if (v === null || typeof v !== 'object') return v;
    if (ArrayBuffer.isView(v) && !(v instanceof DataView)) return { $t: v.constructor.name, d: Array.from(v) };
    if (!root && !plainObj(v, cls)) return undefined;
    if (ids.has(v)) return { $r: ids.get(v) };
    const id = n++; ids.set(v, id);
    if (Array.isArray(v)) return { $i: id, a: v.map((x) => { const w = walk(x); return w === undefined ? { $s: 1 } : w; }) };
    const o = {};
    for (const k of Object.keys(v).sort()) { if (SKIP.has(k)) continue; const w = walk(v[k]); if (w !== undefined) o[k] = w; }
    return { $i: id, o };
  };
  return walk(m, true);
}
const num = (x) => (x && x.$n !== undefined ? Number(x.$n) : x);
export function applySnap(m, snap, diffs, cls = false) {
  const map = new Map(), refs = [];
  const fix = (live, sn, path) => { // devuelve el valor que debe quedar en la posición
    if (sn === null || typeof sn !== 'object') { if (diffs && live !== sn && diffs.length < 40) diffs.push(path + ': ' + live + ' -> ' + sn); return sn; }
    if (sn.$n !== undefined) return num(sn);
    if (sn.$s !== undefined) return live;
    if (sn.$t !== undefined) { const C = globalThis[sn.$t]; if (live && live.constructor === C && live.length === sn.d.length) { live.set(sn.d); return live; } return C.from(sn.d); }
    if (sn.$r !== undefined) return { $$ref: sn.$r };
    const isArr = sn.a !== undefined;
    let t = live && typeof live === 'object' && (Array.isArray(live) === isArr) && (live === m || plainObj(live, cls)) ? live : (isArr ? [] : {});
    if (diffs && t !== live && diffs.length < 40) diffs.push(path + ': objeto distinto');
    map.set(sn.$i, t);
    if (isArr) {
      t.length = sn.a.length;
      sn.a.forEach((x, i) => { const r = fix(t[i], x, path + '[' + i + ']'); if (r && r.$$ref !== undefined) refs.push([t, i, r.$$ref]); else t[i] = r; });
    } else {
      for (const k in sn.o) { const r = fix(t[k], sn.o[k], path + '.' + k); if (r && r.$$ref !== undefined) refs.push([t, k, r.$$ref]); else t[k] = r; }
    }
    return t;
  };
  fix(m, snap, 'm');
  for (const [t, k, id] of refs) { const v = map.get(id); if (v) t[k] = v; }
}

export class Lockstep {
  // `start` es la función que arranca el partido (en el cliente, el start original del motor).
  constructor(m, startAt, actions = [], start = () => m.start()) {
    this.m = m; this.startAt = startAt; this.actions = actions.map((a) => ({ ...a }));
    this.ai = 0; this.step = 0; this.pausedTotal = 0; this.halfHold = null; this.halfSeen = false;
    this.sigs = new Map(); this.newSigs = [];
    start();
  }
  get finished() { return !!this.m.ended; }
  targetStep(now) { return Math.max(0, Math.floor((now - this.startAt - this.pausedTotal) / STEP_MS)); }
  addAction(a) {
    let i = this.actions.length; while (i > 0 && this.actions[i - 1].step > a.step) i--;
    this.actions.splice(i, 0, a);
    if (i < this.ai) this.ai++;
  }
  // Vuelve al paso `step` (el estado del motor ya fue restaurado con applySnap): se reaplican las acciones posteriores.
  rewind(step) {
    this.step = step; const i = this.actions.findIndex((a) => a.step >= step); this.ai = i < 0 ? this.actions.length : i;
    for (const k of [...this.sigs.keys()]) if (k >= step) this.sigs.delete(k);
    this.newSigs = [];
  }
  lateAction(a) { return a.step < this.step; } // llegó después de su paso: hay que re-sincronizar
  signature() {
    const m = this.m; let h = 2166136261;
    const mix = (v) => { h ^= Math.round(v * 10) | 0; h = Math.imul(h, 16777619) >>> 0; };
    mix(m.time); mix(m.score[0]); mix(m.score[1]); mix(m.ball.x); mix(m.ball.z); for (const p of m.players) { mix(p.x); mix(p.z); }
    return h >>> 0;
  }
  advanceSteps(target, each) {
    let n = 0;
    while (this.step < target && !this.finished && !this.halfHold && n++ < MAX_STEPS_PER_CALL) {
      while (this.ai < this.actions.length && this.actions[this.ai].step <= this.step) applyAction(this.m, this.actions[this.ai++]);
      this.m.step(STEP); this.step++;
      if (each) each(this.step);
      if (this.step % CHECK_EVERY === 0) { const sig = this.signature(); this.sigs.set(this.step, sig); this.newSigs.push({ step: this.step, sig }); if (this.newSigs.length > 100) this.newSigs.shift(); if (this.sigs.size > 40) this.sigs.delete(this.sigs.keys().next().value); }
      if (this.m.phase === 'halftime' && !this.halfSeen) { this.halfSeen = true; this.halfHold = this.startAt + this.pausedTotal + this.step * STEP_MS + HALF_MS; }
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
