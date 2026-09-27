(function(){ /* lockstep */
const NOT_DATA = new Set(['Set', 'Map', 'WeakMap', 'WeakSet', 'Promise', 'Date', 'RegExp']);
// cls=true: también las instancias de clases propias del motor (p. ej. los peleadores de MMA); nunca colecciones, DOM ni objetos 3D
const plainObj = (v, cls) => { const pr = Object.getPrototypeOf(v); return pr === Object.prototype || pr === null || Array.isArray(v) || (!!cls && !NOT_DATA.has(v.constructor && v.constructor.name) && !v.nodeType && !v.isObject3D); };
function snapAny(m, cls = false) {
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
function applyAny(m, snap, diffs, cls = false) {
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


// Carrera en vivo online por "lockstep" (LRO): el servidor y todos los clientes corren el MISMO motor determinista (misma semilla,
// mismo Career) y avanzan por el reloj real; solo viajan las órdenes de los equipos (con el paso en que se aplican) y checkpoints.
const STEP_MS = 1000 / 60;
const LEAD_STEPS = 90;     // una orden se aplica 1,5 s después de pedirse, para que llegue a todos antes
const CHECK_EVERY = 300;   // checkpoint de control cada 5 s de carrera
const MAX_STEPS_PER_CALL = 4000;
const HOLD_MS = 75e3;      // a mitad de carrera espera al estudio + la tanda de anuncios (igual para todos: cuenta como tiempo pausado)
const CMDS = { pace: ['push', 'standard', 'conserve'], tyres: ['push', 'standard', 'save'], pit: ['now', 'next', 'stay'], overtake: ['attack', 'standard', 'defend'], fuel: ['push', 'standard', 'save'] };
const snapOf = (race) => ({ s: snapAny(race.state, true), v: race.vars() });
const applySnap = (race, snap, d) => { applyAny(race.state, snap.s, d, true); race.setVars(snap.v); };

function cleanAction(car, msg) {
  if (!msg || !Number.isInteger(car) || car < 0 || msg.k !== 'cmd' || !CMDS[msg.cmd] || !CMDS[msg.cmd].includes(msg.val)) return null;
  return { k: 'cmd', car, cmd: msg.cmd, val: msg.val };
}
function applyAction(race, a) {
  const c = race.state.cars[a.car]; if (!c || !c.commands) return;
  if (a.cmd === 'pit' && a.val === 'next') { c.pitLap = c.lap + 1; c.commands.pit = 'next'; } else c.commands[a.cmd] = a.val;
}

class Lockstep {
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

window.Lockstep = Lockstep; window.applySnap = applySnap;
})();
// Conductor de la transmisión online de carreras (se anexa a live/live-main.js, ver gen-live.py): corre el MISMO motor que el servidor
// (window.LROE, de live/engine.js) con el reloj del servidor. La previa, el estudio, los anuncios y la interfaz son los de siempre.
(function () {
  'use strict';
  const H = window.LRO_LIVE_HELLO, ws = window.LRO_LIVE_WS, status = window.LRO_LIVE_STATUS || (() => {});
  const E = window.LROE, PRE_MS = 60e3, skew = window.LRO_LIVE_SKEW || 0;
  const send = (o) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); };
  let ls = null, preDone = false, side = H.side, actions = (H.actions || []).map((a) => ({ ...a })), fixes = [];
  const known = new Set(actions.map((a) => JSON.stringify(a)));

  function resync() {
    let last = 0; try { last = +sessionStorage.getItem('lro-resync') || 0; } catch (e) {}
    if (Date.now() - last < 15000) return;
    try { sessionStorage.setItem('lro-resync', String(Date.now())); } catch (e) {}
    location.reload();
  }
  function askSnap() {
    const now = Date.now(); fixes = fixes.filter((t) => now - t < 60000);
    if (fixes.length >= 6) return resync();
    fixes.push(now); send({ type: 'snap' });
  }
  function addActions(list) {
    for (const a of list) {
      const key = JSON.stringify(a); if (known.has(key)) continue; known.add(key);
      if (ls) { ls.addAction(a); if (ls.lateAction(a)) resync(); } else { actions.push(a); actions.sort((x, y) => x.step - y.step); }
    }
  }
  function onMsg(d) {
    if (d.type === 'hello') { if (H) addActions(d.actions || []); }
    else if (d.type === 'action') addActions([d.a]);
    else if (d.type === 'sync') {
      const mine = ls && ls.sigs.get(d.step);
      if (mine !== undefined && mine !== d.sig) { console.warn('DESYNC', d.step); window.__desync = { step: d.step, mine, srv: d.sig }; askSnap(); }
    } else if (d.type === 'snap') { if (ls) { const df = []; applySnap(E, d.snap, df); ls.rewind(d.step, d.st); window.__snapdiff = df; console.warn('SNAP', d.step, JSON.stringify(df.slice(0, 20))); } }
    else if (d.type === 'final') window.LRO_LIVE_FINISHED = true;
    else if (d.type === 'error') { status(d.error); setTimeout(() => status(''), 3000); }
  }
  window.LRO_LIVE_MSG = onMsg;
  (window.LRO_LIVE_QUEUE || []).splice(0).forEach(onMsg);

  window.LRO_LIVE = {
    get teamId() { return side >= 0 && E.state.cars[side] ? E.state.cars[side].team.id : -1; },
    cmd(cmd, val) { if (side < 0) return status('Solo el equipo puede dar órdenes'); send({ type: 'act', a: { k: 'cmd', cmd, val } }); },
    pump() {
      const t = Date.now() + skew;
      if (!ls) { if (!(preDone && t >= H.startAt)) return; E.beginRace(); ls = new Lockstep(E, H.startAt, actions); status(''); }
      ls.advanceTo(t);
    },
  };

  async function start() {
    E.seedRng(H.cfg.seed); E.setSimT(0); E.qualify();
    if (window.GameUI) GameUI.showScreen('race');
    const now = Date.now() + skew, toKick = H.startAt - now;
    if (toKick <= 0) { // ya empezó: se pone al día antes de mostrar nada
      status('Poniéndose al día con la carrera…');
      E.beginRace(); ls = new Lockstep(E, H.startAt, actions);
      await new Promise((res) => { const go = () => { const more = ls.advanceTo(Date.now() + skew); if (more) setTimeout(go, 0); else res(); }; go(); });
      preDone = true; status('');
      return;
    }
    if (toKick > PRE_MS) { status(`La transmisión empieza en ${Math.ceil((toKick - PRE_MS) / 1000)} s…`); await new Promise((r) => setTimeout(r, toKick - PRE_MS)); status(''); }
    if (window.LROstudio) window.LROstudio.pre(E.track, () => { preDone = true; }); else preDone = true;
  }
  start().catch((e) => { console.error(e); status('No se pudo abrir la transmisión.'); });
})();
