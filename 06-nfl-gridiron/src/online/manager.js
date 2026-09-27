// Gestión online del club (NFL): el modo franquicia de siempre (plantilla, depth chart, gameplan, mercado, copa, draft) sobre la liga
// compartida. El cliente trabaja sobre una copia del estado: cada acción se aplica acá (la interfaz responde al instante) y se manda
// al servidor, que la valida y la aplica sobre el estado real. Se importa ANTES de ui/app.js (top-level await) y deja window.EM_MGR.
import { League } from '../manager/league.js';

const QS = new URLSearchParams(location.search);
const API = (QS.get('api') || 'http://localhost:8787').replace(/\/+$/, ''), LEAGUE = QS.get('league');
const base = `${API}/api/league/${encodeURIComponent(LEAGUE)}`;
const call = async (path, body) => {
  const r = await fetch(base + path, body ? { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : { credentials: 'include' });
  const d = await r.json().catch(() => ({})); if (!r.ok && !d.reason) throw new Error(d.error || 'Error de conexión'); return d;
};
const first = await call('/career');
if (!first.state) throw new Error(first.error || 'No se pudo cargar la liga');

const me = first.club;
let rev = first.rev, startAt = first.startAt, skew = first.now - Date.now(), busy = false, queue = [], lastPatch = '', patchT = null, syncing = false, lg = League.load(JSON.stringify(first.state));
const A = () => window.franchise;
const toast = (m) => { try { A().toast(m); } catch (e) { console.warn(m); } };
const isHuman = (id) => (lg.data.humans || []).includes(id);

const patchOf = () => {
  const t = lg.data.teams[me]; return JSON.stringify({ gameplan: t.gameplan, depth: t.depth, training: { focus: t.training.focus, intensity: t.training.intensity }, offerIds: lg.data.offers.map((o) => o.id) });
};
async function sendPatch() {
  const p = patchOf(); if (p === lastPatch) return; lastPatch = p;
  try { const r = await call('/cmd', { op: 'club', patch: JSON.parse(p) }); if (r.ok === false) { toast(r.reason || 'El servidor rechazó el cambio'); await resync(); } else rev = r.rev; }
  catch (e) { toast('No se pudo guardar: ' + e.message); }
}
const changed = (league) => { lg = league || lg; clearTimeout(patchT); patchT = setTimeout(sendPatch, 500); };

async function resync(msg) {
  if (syncing) return; syncing = true;
  try {
    const d = await call('/career'); if (!d.state) return;
    rev = d.rev; startAt = d.startAt; skew = d.now - Date.now();
    lg = League.load(JSON.stringify(d.state)); hook(lg); const a = A(); a.lg = lg; lastPatch = patchOf(); a.render(); if (msg) toast(msg);
  } catch (e) { console.warn(e); } finally { syncing = false; }
}
async function pump() {
  if (busy) return; busy = true;
  try {
    while (queue.length) {
      const cmd = queue.shift(); let r;
      try { r = await call('/cmd', cmd); } catch (e) { toast('Sin conexión con la liga: ' + e.message); queue.length = 0; break; }
      if (r.ok === false) { queue.length = 0; toast(r.reason || (r.result && r.result.message) || 'El servidor rechazó la operación'); await resync(); break; }
      if (r.rev !== rev + 1) { rev = r.rev; if (!queue.length) await resync(); } else rev = r.rev;
    }
  } finally { busy = false; }
}
const send = (op, args) => { queue.push({ op, args: args.map((x) => (x === undefined ? null : x)) }); return pump(); };

// Lo que la interfaz hace en el mercado se manda al servidor (el núcleo llama a league.onOp / onBeforeOp).
function hook(league) {
  league.onOp = (name, a, r) => {
    if (name === 'signFreeAgent' && a[0] === me) send('signFreeAgent', [a[1], a[2]]);
    else if (name === 'renewPlayer' && a[0] === me) send('renewPlayer', [a[1], a[2]]);
    else if (name === 'releasePlayer' && a[0] === me) send('releasePlayer', [a[1]]);
    else if (name === 'executeTrade' && a[0].teamA === me) send('tradeAI', [a[0].teamB, a[0].giveA, a[0].giveB]);
    else if (name === 'draftPick') send('draftPick', [a[0]]);
  };
  league.onBeforeOp = (name, a) => { // traspaso con otro DT humano: propuesta, no se ejecuta acá
    if (name === 'executeTrade' && a[0].teamA === me && isHuman(a[0].teamB)) { send('tradePropose', [a[0].teamB, a[0].giveA, a[0].giveB]); setTimeout(() => toast('Propuesta enviada: todavía no es un traspaso, tiene que aceptarla el otro DT.'), 80); return false; }
  };
}
hook(lg);

const BLOCK = ['advance-week', 'next-season', 'start-career', 'continue', 'import', 'new-career', 'save-now', 'export'];
function lock(GLOBAL, PAGES) {
  for (const k of BLOCK) GLOBAL[k] = () => toast('Las semanas y la temporada las maneja el servidor: los partidos se juegan en vivo a la hora programada.');
  GLOBAL['go-match'] = () => { const fx = lg.userFixture(); if (!fx) return toast('No hay partido programado para tu equipo.'); window.parent.postMessage({ type: 'em-online-watch', match: fx.id }, '*'); };
  const draft = PAGES.find((p) => p.id === 'draft');
  if (draft) {
    draft.handlers['dr-next'] = () => toast('El draft avanza solo: los equipos de la CPU eligen y a cada DT le toca su turno.');
    draft.handlers['dr-all'] = draft.handlers['dr-next'];
    draft.handlers['dr-pick'] = (app, el) => { const r = app.lg.draftPick(el.dataset.id); app.toast(r.message); app.commit(); app.refresh(); };
  }
}

// ---- barra superior y propuestas de traspaso de otros DT
function bar() {
  const st = document.createElement('style');
  st.textContent = '#em-bar{position:fixed;top:0;left:0;right:0;z-index:2147483000;display:flex;gap:10px;align-items:center;justify-content:space-between;background:#0b1118f0;color:#e8eef5;padding:6px 12px;font:600 12px system-ui}#em-bar button{background:#2a7a4a;color:#fff;border:0;border-radius:8px;padding:5px 12px;font:700 12px system-ui;cursor:pointer;margin-left:6px}#em-bar .no{background:#7a2a2a}body{padding-top:32px}' +
    '#em-trades{position:fixed;right:10px;top:40px;z-index:2147482999;background:#101820f2;color:#e8eef5;border:1px solid #2b3b46;border-radius:10px;padding:8px 10px;font:12px system-ui;max-width:340px}#em-trades:empty{display:none}#em-trades div{margin:6px 0}a[href="#/match"]{display:none!important}';
  document.head.appendChild(st);
  const b = document.createElement('div'); b.id = 'em-bar'; b.innerHTML = '<span></span><div><button id="em-go">Ir a mi partido</button></div>'; document.body.appendChild(b);
  const tr = document.createElement('div'); tr.id = 'em-trades'; document.body.appendChild(tr);
  document.getElementById('em-go').onclick = () => window.EM_MGR.lockedGlobal && window.EM_MGR.lockedGlobal['go-match']();
  const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return (h ? h + ' h ' : '') + m + ' min ' + (s % 60) + ' s'; };
  const name = (id) => lg.data.players[id] ? lg.data.players[id].name : '—';
  setInterval(() => {
    const now = Date.now() + skew, dr = lg.data.draft, span = b.querySelector('span');
    if (dr && !dr.done) { const cur = lg.draftCurrent(), mine = cur && cur.teamId === me; span.textContent = cur ? `DRAFT · ronda ${cur.round} pick ${cur.n} (${lg.team(cur.teamId).short})${mine ? ' · ¡ES TU TURNO! · te quedan ' + fmt(90e3 - (now - (dr.pickAt || now))) : ' · esperando'}` : 'Draft terminado'; }
    else if (!startAt) span.textContent = 'La liga terminó.';
    else { const left = startAt - now; span.textContent = left > 0 ? `Próxima jornada: ${new Date(startAt).toLocaleString()} · faltan ${fmt(left)}${left < 300e3 ? ' · la transmisión está abierta' : ' · el plan y el depth chart se cierran cuando se abre la transmisión de tu partido'}` : 'Partido en curso'; }
    const props = (lg.data.tradeProps || []).filter((t) => t.to === me);
    tr.innerHTML = props.length ? '<b>Propuestas de traspaso</b>' + props.map((t) => `<div>${lg.team(t.from).short} ofrece ${t.giveA.map(name).join(', ') || '—'} por ${t.giveB.map(name).join(', ') || '—'} <button data-tp="${t.id}" data-y="1">Aceptar</button><button class="no" data-tp="${t.id}" data-y="0">Rechazar</button></div>`).join('') : '';
  }, 1000);
  document.addEventListener('click', (e) => { const t = e.target.closest('[data-tp]'); if (!t) return; const id = t.dataset.tp, y = t.dataset.y === '1'; lg.data.tradeProps = (lg.data.tradeProps || []).filter((x) => x.id !== id); send('tradeAnswer', [id, y]).then(() => resync(y ? 'Respuesta enviada' : null)); });
}

window.EM_MGR = { league: () => lg, changed, lock: (G, P) => { window.EM_MGR.lockedGlobal = G; lock(G, P); } };
const start = () => { bar(); setInterval(async () => { try { const d = await call('/rev'); if (d.rev !== rev && !busy && !queue.length) await resync(); } catch (e) {} }, 8000); };
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', start); else start();
