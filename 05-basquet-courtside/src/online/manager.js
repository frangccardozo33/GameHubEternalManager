// Gestión online del club (básquet): el modo carrera de siempre (plantilla, tácticas, mercado, copa, draft) sobre la liga compartida.
// El cliente trabaja sobre una copia del estado: cada acción se aplica acá (la interfaz responde al instante) y se manda al servidor,
// que la valida y la aplica sobre el estado real. Este módulo se importa ANTES de ui/app.js (top-level await) y deja window.EM_MGR.
import { Game } from '../manager/game.js';

const QS = new URLSearchParams(location.search);
const API = (QS.get('api') || 'http://localhost:8787').replace(/\/+$/, ''), LEAGUE = QS.get('league');
const base = `${API}/api/league/${encodeURIComponent(LEAGUE)}`;

const call = async (path, body) => {
  const r = await fetch(base + path, body ? { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : { credentials: 'include' });
  const d = await r.json().catch(() => ({})); if (!r.ok && !d.reason) throw new Error(d.error || 'Error de conexión'); return d;
};
const first = await call('/career');
if (!first.state) throw new Error(first.error || 'No se pudo cargar la liga');

let me = +first.club, rev = first.rev, startAt = first.startAt, skew = first.now - Date.now(), busy = false, queue = [], lastPatch = '', patchT = null, syncing = false, depth = 0;
const toastEl = () => document.getElementById('toast');
const toast = (t) => { const el = toastEl(); if (!el) return console.warn(t); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, 3200); };
const G = () => window.__app && window.__app.game;

// ---- lo que el DT edita a mano se manda entero (el servidor valida su forma)
const patchOf = () => {
  const g = G(); if (!g) return ''; const t = g.team(me), focus = {}; for (const id of t.roster) focus[id] = g.player(id).focus || null;
  return JSON.stringify({ lineup: t.lineup, plan: t.plan, tactics: t.tactics, assign: t.assign, usage: t.usage, focus, trainIntensity: g.s.trainIntensity });
};
async function sendPatch() {
  const p = patchOf(); if (!p || p === lastPatch) return; lastPatch = p;
  try { const r = await call('/cmd', { op: 'club', patch: JSON.parse(p) }); if (r.ok === false) { toast(r.reason || 'El servidor rechazó el cambio'); await resync(); } else rev = r.rev; }
  catch (e) { toast('No se pudo guardar: ' + e.message); }
}
const changed = () => { clearTimeout(patchT); patchT = setTimeout(sendPatch, 500); };

// ---- estado del servidor -> copia local
async function resync(msg) {
  if (syncing) return; syncing = true;
  try {
    const d = await call('/career'); if (!d.state) return;
    rev = d.rev; startAt = d.startAt; skew = d.now - Date.now();
    const A = window.__app; A.game = new Game(d.state); lastPatch = patchOf(); await A.go(A.ui.screen, A.ui.arg); if (msg) toast(msg);
  } catch (e) { console.warn(e); } finally { syncing = false; }
}

// ---- órdenes de mercado/club: se aplican local y viajan al servidor en orden
async function pump() {
  if (busy) return; busy = true;
  try {
    while (queue.length) {
      const cmd = queue.shift(); let r;
      try { r = await call('/cmd', cmd); } catch (e) { toast('Sin conexión con la liga: ' + e.message); queue.length = 0; break; }
      if (r.ok === false) { queue.length = 0; toast(r.reason || (r.result && r.result.msg) || 'El servidor rechazó la operación'); await resync(); break; }
      if (r.rev !== rev + 1) { rev = r.rev; if (!queue.length) await resync(); } else rev = r.rev; // otro DT movió el mercado: se trae el estado nuevo
    }
  } finally { busy = false; }
}
const send = (op, args) => { queue.push({ op, args: args.map((x) => (x === undefined ? null : x)) }); pump(); };
const isHuman = (g, id) => (g.s.humans || []).includes(id);

const P = Game.prototype, orig = {};
function wrap(name, pre, post) {
  orig[name] = P[name];
  P[name] = function (...a) {
    if (pre) { const ov = pre.call(this, a); if (ov !== undefined) return ov; }
    depth++; let r; try { r = orig[name].apply(this, a); } finally { depth--; }
    if (depth === 0 && post && !(r && r.ok === false)) post.call(this, a, r);
    return r;
  };
}
wrap('signFreeAgent', null, (a) => send('signFreeAgent', [a[0], a[1]]));
wrap('renewPlayer', null, (a) => send('renewPlayer', [a[0], a[1]]));
wrap('releasePlayer', null, function (a) { if (a[1] == null || a[1] === me) send('releasePlayer', [a[0]]); });
wrap('acceptOffer', null, (a) => send('acceptOffer', [a[0]]));
wrap('rejectOffer', null, (a) => send('rejectOffer', [a[0]]));
wrap('scoutProspect', null, (a) => send('scoutProspect', [a[0]]));
wrap('upgradeFacility', null, (a) => send('upgradeFacility', [a[0]]));
wrap('autoLineup', null, function (a) { if (a[0] && a[0].id === me) send('autoLineup', []); });
// traspasos: con la IA los evalúa el juego; con otro DT humano se manda una propuesta (no se ejecuta acá)
wrap('evalTrade', function (a) { if (isHuman(this, a[0])) return { ok: true, ratio: 9, msg: 'Se enviará como propuesta: tiene que aceptarla el otro DT.' }; });
wrap('executeTrade', function (a) {
  if (isHuman(this, a[0])) { send('tradePropose', [a[0], a[1], a[2]]); toast('Propuesta enviada al otro DT.'); return null; }
}, (a) => send('tradeAI', [a[0], a[1], a[2]]));
// draft: solo el pick propio (los de la IA los hace el servidor con su reloj)
wrap('draftSelect', function (a) { const off = this.s.off, pk = off && off.picks[off.pos]; if (!pk || pk.teamId !== me) { toast('Todavía no es tu turno.'); return null; } }, (a) => send('draftSelect', [a[0]]));
P.draftToUser = function () {}; P.completeDraft = function () {}; P.draftPickAI = function () {};

const BLOCKED = ['play', 'simDay', 'afterResult', 'nextSeason', 'simPhase', 'leaveMatch', 'startGame', 'continueGame', 'regen', 'pickTeam', 'draftGo', 'draftAuto'];
function lock(actions) {
  for (const k of BLOCKED) actions[k] = () => toast('Los partidos y las jornadas los maneja el servidor: se juegan en vivo a la hora programada.');
  actions.play = () => { const e = G().userEntry(); if (!e) return toast('No hay partido programado para tu equipo.'); window.parent.postMessage({ type: 'em-online-watch', match: e.id }, '*'); };
  actions.draftPick = (d) => { G().draftSelect(d.id); const A = window.__app; A.go(A.ui.screen, A.ui.arg); };
}

// ---- barra superior: próximo partido / draft, y propuestas de traspaso de otros DT
function bar() {
  const st = document.createElement('style');
  st.textContent = '#em-bar{position:fixed;top:0;left:0;right:0;z-index:2147483000;display:flex;gap:10px;align-items:center;justify-content:space-between;background:#0b1118f0;color:#e8eef5;padding:6px 12px;font:600 12px system-ui}#em-bar button{background:#2a7a4a;color:#fff;border:0;border-radius:8px;padding:5px 12px;font:700 12px system-ui;cursor:pointer;margin-left:6px}#em-bar .no{background:#7a2a2a}body{padding-top:32px}' +
    '#em-trades{position:fixed;right:10px;top:40px;z-index:2147482999;background:#101820f2;color:#e8eef5;border:1px solid #2b3b46;border-radius:10px;padding:8px 10px;font:12px system-ui;max-width:340px}#em-trades:empty{display:none}#em-trades div{margin:6px 0}';
  document.head.appendChild(st);
  const b = document.createElement('div'); b.id = 'em-bar'; b.innerHTML = '<span></span><div><button id="em-go">Ir a mi partido</button></div>'; document.body.appendChild(b);
  const tr = document.createElement('div'); tr.id = 'em-trades'; document.body.appendChild(tr);
  document.getElementById('em-go').onclick = () => window.__app && window.__app.ui && (window.__app.game.userEntry() ? window.parent.postMessage({ type: 'em-online-watch', match: window.__app.game.userEntry().id }, '*') : toast('No hay partido programado para tu equipo.'));
  const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return (h ? h + ' h ' : '') + m + ' min ' + (s % 60) + ' s'; };
  setInterval(() => {
    const g = G(); if (!g) return; const now = Date.now() + skew, off = g.s.off, span = b.querySelector('span');
    if (off && off.stage === 'draft') { const pk = off.picks[off.pos]; const mine = pk && pk.teamId === me; span.textContent = pk ? `DRAFT · pick #${pk.n} (${g.team(pk.teamId).short})${mine ? ' · ¡ES TU TURNO!' : ''} · ${mine ? 'te quedan ' + fmt(90e3 - (now - (off.pickAt || now))) : 'esperando'}` : 'Draft terminado'; }
    else if (!startAt) span.textContent = 'La liga terminó.';
    else { const left = startAt - now; span.textContent = left > 0 ? `Próxima jornada: ${new Date(startAt).toLocaleString()} · faltan ${fmt(left)}${left < 300e3 ? ' · la transmisión está abierta' : ' · la rotación y las tácticas se cierran cuando se abre la transmisión de tu partido'}` : 'Partido en curso'; }
    const props = (g.s.tradeProps || []).filter((t) => t.to === me);
    tr.innerHTML = props.length ? '<b>Propuestas de traspaso</b>' + props.map((t) => `<div>${g.team(t.from).short} ofrece ${t.mine.map((i) => g.player(i).name).join(', ') || '—'} por ${t.theirs.map((i) => g.player(i).name).join(', ') || '—'} <button data-tp="${t.id}" data-y="1">Aceptar</button><button class="no" data-tp="${t.id}" data-y="0">Rechazar</button></div>`).join('') : '';
  }, 1000);
  document.addEventListener('click', (e) => { const t = e.target.closest('[data-tp]'); if (!t) return; const id = +t.dataset.tp, y = t.dataset.y === '1'; G().s.tradeProps = (G().s.tradeProps || []).filter((x) => x.id !== id); queue.push({ op: 'tradeAnswer', args: [id, y] }); pump().then(() => resync(y ? 'Respuesta enviada' : null)); });
}

window.EM_MGR = { raw: first.state, club: me, changed, lock };
const start = () => {
  bar();
  setInterval(async () => { try { const d = await call('/rev'); if (d.rev !== rev && !busy && !queue.length) await resync(); } catch (e) {} }, 8000);
};
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', start); else start();
