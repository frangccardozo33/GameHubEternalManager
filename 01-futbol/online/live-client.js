// Transmisión online de fútbol (lockstep). Se carga en fulbo-live.html (copia generada de fulbo.html): recibe del servidor la
// configuración del partido + las acciones de los DT, corre el MISMO motor con el reloj real y usa la pantalla de partido,
// la transmisión (TLB) y los anuncios de siempre. Ver server/src/futbol.js y online/lockstep.mjs.
import { Lockstep, applySnap } from './lockstep.mjs';

const QS = new URLSearchParams(location.search);
const API = (QS.get('api') || 'http://localhost:8787').replace(/\/+$/, ''), LEAGUE = QS.get('league'), MATCH = QS.get('match');
const PRE_MS = 200e3; // duración aproximada de la previa (presentación + estudio + anuncios + alineaciones)
const $ = (id) => document.getElementById(id);
const status = (t) => { const el = $('live-status'); if (!el) return; el.textContent = t || ''; el.style.display = t ? 'block' : 'none'; };
const mmss = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;

let ws = null, hello = null, ls = null, skew = 0, opened = false, preDone = false, retry = 0, finished = false, side = -1, B = null, m = null, proto = null;
let actions = [];
const known = new Set(), outbox = []; let outTimer = null;

const send = (o) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); };
function queue(a) { // el servidor limita la frecuencia: los cambios de táctica seguidos se juntan
  const last = outbox[outbox.length - 1];
  if (a.k === 'tactic' && last && last.k === 'tactic') Object.assign(last.patch, a.patch); else outbox.push(a);
  if (!outTimer) outTimer = setTimeout(flush, 350);
}
function flush() { outTimer = null; const a = outbox.shift(); if (a) send({ type: 'act', a }); if (outbox.length) outTimer = setTimeout(flush, 350); }

// El DT nunca aplica nada al instante (rompería el lockstep): sus controles piden al servidor, que lo aplica a todos en un paso futuro.
function intercept(mySide) {
  const mine = (t) => { if (t === mySide) return true; status('Solo podés ajustar a tu equipo'); setTimeout(() => status(''), 2500); return false; };
  if (mySide < 0) { for (const k of ['requestTactic', 'applyPreset', 'requestFormation', 'setPlayerRole', 'setRule', 'requestSubstitution']) m[k] = () => false; m.tlmRequestSub = () => ({ ok: false, reason: 'Sos espectador' }); return; }
  m.requestTactic = (t, patch) => { if (mine(t)) queue({ k: 'tactic', patch: { ...patch } }); return []; };
  m.applyPreset = (t, name) => { if (mine(t)) queue({ k: 'preset', name }); return true; };
  m.requestFormation = (t, formation) => { if (mine(t)) queue({ k: 'formation', formation }); return true; };
  m.setPlayerRole = (id, instr) => { queue({ k: 'role', id, instr: instr ?? null }); return true; };
  m.setRule = (t, id, patch) => { if (mine(t)) queue({ k: 'rule', id, patch }); return true; };
  m.tlmRequestSub = (t, outId, benchIdx, reason) => { if (!mine(t)) return { ok: false, reason: 'Solo tu equipo' }; queue({ k: 'sub', outId, benchIdx, reason }); return { ok: true }; };
  m.requestSubstitution = () => false;
}

// El conductor: fulbo-live.html llama a pump() en cada cuadro en lugar de avanzar el motor por su cuenta.
window.LFO_LIVE = {
  pump(each) {
    if (!hello) return;
    const t = Date.now() + skew;
    if (!ls) {
      if (!(preDone && t >= hello.startAt)) return;
      ls = new Lockstep(m, hello.startAt, actions, () => proto.start.call(m)); status(''); B.A.refresh();
      window.__lsdbg = { ls, hello, m };
    }
    if (!m.ended) m.running = true; // la interfaz puede pausar el motor (repeticiones, pestaña oculta): en vivo el reloj no se detiene
    ls.advanceTo(t, (st) => { each(); if (QS.get('nodesync')) (window.__s60 ||= new Map()).set(st, ls.signature()); });
  },
};

// Corrección de desvíos: se le pide al servidor una foto del estado y se restaura (si se repite muy seguido, se recarga la transmisión).
let fixes = [];
function askSnap() {
  if (!QS.get('snapfix')) return resync(); // la foto de estado (solo variables numéricas) no alcanza: el desvío reaparece; por defecto se recarga
  const now = Date.now(); fixes = fixes.filter((t) => now - t < 60000);
  if (fixes.length >= 4) return resync();
  fixes.push(now); send({ type: 'snap' });
}
function resync() { // el estado local se desvió del servidor: se recarga la transmisión (rara vez)
  let last = 0; try { last = +sessionStorage.getItem('lfo-resync') || 0; } catch (e) {}
  if (Date.now() - last < 15000) return;
  try { sessionStorage.setItem('lfo-resync', String(Date.now())); } catch (e) {}
  location.reload();
}
function addActions(list) {
  for (const a of list) {
    const key = JSON.stringify(a); if (known.has(key)) continue; known.add(key);
    if (ls) { ls.addAction(a); if (ls.lateAction(a)) resync(); } else { actions.push(a); actions.sort((x, y) => x.step - y.step); }
  }
}

async function open(d) {
  await window.TLM.Bridge.ready();
  B = window.TLM.Bridge; m = B.A.match; proto = Object.getPrototypeOf(m); const cfg = d.cfg;
  // transmisión completa y sin opciones: los mismos ajustes para todos (algunos alteran el motor y romperían la sincronía)
  Object.assign(window.TLB.cfg, { emoji: true, bcast: true, trans: 'FULL', autoReplay: true, celeb: 'FULL', ads: true, pops: true });
  if (window.EM && window.EM.opt) window.EM.opt.ads = true;
  side = d.side;
  // puente con el partido del servidor (equivale a TLM.Bridge.start, sin carrera local)
  B.career = { state: { fixtures: {} }, user: { id: '', rules: null }, matchConfig: () => cfg, applyUserResult() {}, save() {} };
  B.cfg = cfg; B.ended = false; B.fixtureId = cfg.fixtureId; B.userTeam = Math.max(0, side);
  m.tlmLoad(cfg); m.tieBreak = cfg.cup ? { et: true, pens: true } : null;
  m.onTlmSwap = (idx) => { B.rebuildModel(idx); B.listeners.forEach((f) => { try { f('swap', idx); } catch (e) {} }); };
  if (!B._wired) { B._wired = true; const prev = m.onEvent; m.onEvent = (ev) => { (window.__evlog ||= []).push((ls ? ls.step : 0) + ':' + ev.type + ':' + (ev.title || '')); prev && prev(ev); B.onEvent(ev); }; }
  B.finish = () => { if (B.ended) return; B.ended = true; try { B.result = m.tlmResult(); } catch (e) {} B.listeners.forEach((f) => { try { f('finished', B.result); } catch (e) {} }); };
  B.rebuildModels();
  const btn = $('confirm-reset'); if (btn) btn.click();
  B.brand(cfg);
  if (window.LFOBroadcast) { if (cfg.cup && cfg.cup.pkg) window.LFOBroadcast.pushPackage(cfg.cup.pkg); else window.LFOBroadcast.popPackage(); }
  B.A.refresh(); B.showMatchView(); B.active = true; B.decorateControls(true); B.listeners.forEach((f) => { try { f('start', cfg); } catch (e) {} });
  // En vivo el motor no se puede pausar (repeticiones, paneles de cambios, pestaña oculta): correr menos pasos que el servidor rompe la sincronía.
  { let run = false; Object.defineProperty(m, 'running', { configurable: true, get() { return this.started && !this.ended ? true : run; }, set(v) { run = v; } }); }
  // desde acá el motor solo lo arranca el servidor (kickoff): el start del motor queda como aviso de "previa terminada"
  m.start = () => { preDone = true; };
  intercept(side);
  if (QS.get('nodesync')) { // diagnóstico: detecta cambios del motor hechos por fuera de step() (interfaz, capas de transmisión)
    const snapOf = () => { const o = {}; for (const k in m) { const v = m[k]; if (['number', 'boolean', 'string'].includes(typeof v)) o[k] = v; else if (v && typeof v === 'object' && !Array.isArray(v) && k !== 'ball' && k !== 'players') for (const q in v) { const w2 = v[q]; if (['number', 'boolean', 'string'].includes(typeof w2)) o[k + '.' + q] = w2; } } m.players.forEach((p, i) => { for (const k in p) { const v = p[k]; if (['number', 'boolean', 'string'].includes(typeof v)) o['p' + i + '.' + k] = v; } }); for (const k in m.ball) { const v = m.ball[k]; if (['number', 'boolean', 'string'].includes(typeof v)) o['ball.' + k] = v; } return o; };
    const origStep = m.step; let last = null; window.__mut = [];
    const prevOn = m.onEvent; m.onEvent = function (ev) { const a = snapOf(); const r = prevOn && prevOn.call(this, ev); const b = snapOf(); for (const k in b) if (a[k] !== b[k] && window.__mut.length < 60) window.__mut.push('EV ' + (ls ? ls.step : 0) + ' ' + ev.type + ' ' + k + ' ' + a[k] + '->' + b[k]); return r; };
    window.__ring = new Map(); window.__snapOf = snapOf;
    m.step = function (t) { const r = origStep.call(this, t); const st = (ls ? ls.step : 0) + 1; window.__ring.set(st, snapOf()); window.__ring.delete(st - 400); return r; };
  }

  const now = Date.now() + skew, toKick = d.startAt - now;
  if (toKick <= 0) { // ya empezó: se pone al día antes de mostrar nada (sin disparar efectos de transmisión)
    status('Poniéndose al día con el partido…');
    const ev = m.onEvent, sw = m.onTlmSwap; m.onEvent = () => {}; m.onTlmSwap = () => {};
    ls = new Lockstep(m, d.startAt, actions, () => proto.start.call(m));
    await new Promise((res) => { const go = () => { const more = ls.advanceTo(Date.now() + skew); if (more) setTimeout(go, 0); else res(); }; go(); });
    m.onEvent = ev; m.onTlmSwap = sw; B.rebuildModels(); B.A.refresh(); preDone = true; status('');
  } else if (toKick < PRE_MS) preDone = true; // llegó tarde para la previa completa
  else $('start-button').click();              // previa automática: TLB_START -> presentación, estudio, anuncios, alineaciones
}

function connect() {
  status('Conectando…');
  ws = new WebSocket(API.replace(/^http/, 'ws') + `/api/league/${encodeURIComponent(LEAGUE)}/ws?match=${encodeURIComponent(MATCH)}`);
  ws.onopen = () => { retry = 0; if (!opened) status(''); };
  ws.onclose = () => { if (finished) return; status('Conexión perdida · reintentando…'); setTimeout(connect, Math.min(5000, 1000 * (++retry))); };
  ws.onmessage = (e) => onMsg(JSON.parse(e.data));
}
function onMsg(d) {
  if (d.type === 'hello') {
    if (opened) { addActions(d.actions || []); return; }
    if (!d.cfg) { status('El partido todavía no está disponible.'); return; }
    hello = d; skew = d.now - Date.now(); opened = true;
    for (const a of d.actions || []) known.add(JSON.stringify(a));
    actions = (d.actions || []).map((a) => ({ ...a }));
    open(d).catch((e) => { console.error(e); status('No se pudo abrir la transmisión.'); });
  } else if (d.type === 'action') addActions([d.a]);
  else if (d.type === 'sync') {
    const mine = ls && ls.sigs.get(d.step);
    if (mine !== undefined && mine !== d.sig) {
      const info = { step: d.step, ls: ls.step, mine, srv: d.sig, phase: m.phase, time: m.time, ball: [m.ball.x, m.ball.z], p: m.players.slice(0, 4).map((q) => [q.x, q.z]), dbg: d.dbg, ev: (window.__evlog || []).slice(-8) };
      console.warn('DESYNC', JSON.stringify(info)); window.__desync = info;
      try { sessionStorage.setItem('lfo-desync', JSON.stringify(info)); } catch (e) {}
      if (!QS.get('nodesync')) askSnap();
    }
  }
  else if (d.type === 'snap') { if (ls) { applySnap(m, d.snap); ls.rewind(d.step); } }
  else if (d.type === 'final') finished = true;
  else if (d.type === 'error') { status(d.error); setTimeout(() => status(''), 3000); }
}

// cuenta regresiva del kickoff y aviso del descanso (el servidor retiene el partido)
setInterval(() => {
  if (!hello) return;
  const now = Date.now() + skew;
  if (!ls) { if (preDone && !document.querySelector('.lfo-ad,.tlb-pre')) { const l = hello.startAt - now; if (l > 0) status(`Kickoff en ${mmss(l)}`); } return; }
  status(ls.halfHold ? `Descanso · el partido sigue en ${mmss(Math.max(0, ls.halfHold - now))}` : '');
}, 500);

if (!LEAGUE || !MATCH) status('Faltan parámetros de la liga o del partido.'); else connect();
