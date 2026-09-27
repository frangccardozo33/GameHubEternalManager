// Cliente de la transmisión online de básquet (lockstep): recibe del servidor los equipos + semilla + acciones de los DT,
// corre el MISMO motor que el servidor con el reloj real y dibuja con la pantalla de partido de siempre (ui/match.js).
import { Match } from '../ui/match.js';
import { MatchSimulator } from '../simulation/match.js';
import { buildSim, Lockstep } from './lockstep.js';

const QS = new URLSearchParams(location.search);
const API = (QS.get('api') || 'http://localhost:8787').replace(/\/+$/, ''), LEAGUE = QS.get('league'), MATCH = QS.get('match');
const $ = (id) => document.getElementById(id);
const status = (t) => { const el = $('live-status'); el.textContent = t || ''; el.style.display = t ? 'block' : 'none'; };
const mmss = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;

let ws = null, hello = null, sim = null, ls = null, skew = 0, opened = false, preDone = false, retry = 0, finished = false, side = -1;
let actions = [];
const known = new Set(), outbox = []; let outTimer = null;

const send = (o) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); };
function queue(a) { // el servidor limita la frecuencia: los cambios de táctica seguidos se juntan
  const last = outbox[outbox.length - 1];
  if (a.k === 'tactics' && last && last.k === 'tactics') Object.assign(last.p, a.p); else outbox.push(a);
  if (!outTimer) outTimer = setTimeout(flush, 350);
}
function flush() { outTimer = null; const a = outbox.shift(); if (a) send({ type: 'act', a }); if (outbox.length) outTimer = setTimeout(flush, 350); }

// El DT nunca aplica nada al instante (rompería el lockstep): sus controles piden al servidor, que lo aplica a todos en un paso futuro.
function intercept(s, mySide) {
  const P = MatchSimulator.prototype, none = () => false;
  if (mySide < 0) { for (const k of ['setTactics', 'setUsage', 'setAssignment']) s[k] = () => {}; s.substitute = () => 'invalid'; s.timeout = none; return; }
  s.setTactics = (t, p) => queue({ k: 'tactics', p: { ...p } });
  s.setUsage = (t, id, level) => queue({ k: 'usage', id, level });
  s.setAssignment = (t, id, slot) => queue({ k: 'assign', id, slot });
  s.substitute = (t, out, inn) => { // se responde lo mismo que respondería el motor
    const tm = s.teams[t], o = tm.roster.find((p) => p.id === out), i = tm.roster.find((p) => p.id === inn);
    if (!o?.active || !i || i.active || i.fouls >= s.rules.foulLimit) return 'invalid';
    queue({ k: 'sub', out, in: inn });
    return s.phase === 'live' && s.ball.mode !== 'dead' ? 'queued' : 'done';
  };
  s.timeout = (t) => {
    const tm = s.teams[t];
    if (!['live', 'dead'].includes(s.phase) || tm.timeouts <= 0 || s.ball.mode === 'shot') return false;
    if (s.phase === 'live' && (s.possession.team !== t || !s.ball.owner)) return false;
    queue({ k: 'timeout' }); return true;
  };
}

const drv = {
  pump(now, each) {
    const t = Date.now() + skew;
    if (!ls) { if (preDone && t >= hello.startAt) { ls = new Lockstep(sim, hello.startAt, actions); status(''); } else return; }
    ls.advanceTo(t, each);
  },
  preShowDone() { preDone = true; },
  plan(s, key, val) { queue({ k: 'plan', key, val }); },
};

function resync() { // el estado local se desvió del servidor: se recarga la transmisión (rara vez)
  let last = 0; try { last = +sessionStorage.getItem('lbo-resync') || 0; } catch (e) {}
  if (Date.now() - last < 15000) return;
  try { sessionStorage.setItem('lbo-resync', String(Date.now())); } catch (e) {}
  location.reload();
}
function addActions(list) {
  for (const a of list) {
    const key = JSON.stringify(a); if (known.has(key)) continue; known.add(key);
    if (ls) { ls.addAction(a); if (ls.lateAction(a)) resync(); } else { actions.push(a); actions.sort((x, y) => x.step - y.step); }
  }
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
    hello = d; skew = d.now - Date.now();
    if (!d.init) { status('El partido todavía no está disponible.'); return; }
    opened = true; side = d.side; sim = buildSim(d.init); intercept(sim, side);
    for (const a of d.actions || []) known.add(JSON.stringify(a));
    actions = (d.actions || []).map((a) => ({ ...a }));
    const now = Date.now() + skew, toKick = d.startAt - now, late = toKick < 120000;
    let skipHalf = false;
    if (toKick <= 0) { // ya empezó: se pone al día antes de mostrar nada
      ls = new Lockstep(sim, d.startAt, actions); for (let i = 0; i < 300 && ls.advanceTo(now); i++);
      skipHalf = !!ls.halfHold && ls.halfHold - now < 100000; preDone = true;
    }
    const [h, a] = d.teams;
    Match.openLive({ sim, drv, homeName: [h.city.toUpperCase(), h.mascot.toUpperCase()], awayName: [a.city.toUpperCase(), a.mascot.toUpperCase()], userSide: side,
      title: `${h.city} vs ${a.city}`, sub: `${h.name} · ${a.name}`, eyebrow: String(d.label || 'Liga').toUpperCase(), skipPre: late, skipHalf });
  } else if (d.type === 'action') addActions([d.a]);
  else if (d.type === 'sync') { const mine = ls && ls.sigs.get(d.step); if (mine !== undefined && mine !== d.sig) resync(); }
  else if (d.type === 'final') finished = true;
  else if (d.type === 'error') Match.toast(d.error);
}

// cuenta regresiva del kickoff y aviso del descanso (el servidor retiene el partido)
setInterval(() => {
  if (!hello) return;
  const now = Date.now() + skew;
  if (!ls) { if (preDone && !document.querySelector('.lfo-ad,.bc-intro,.bc-studio')) { const l = hello.startAt - now; if (l > 0) status(`Kickoff en ${mmss(l)}`); } return; }
  status(ls.halfHold ? `Descanso · el partido sigue en ${mmss(Math.max(0, ls.halfHold - now))}` : '');
}, 500);

export function boot() { if (!LEAGUE || !MATCH) status('Faltan parámetros de la liga o del partido.'); else connect(); }
