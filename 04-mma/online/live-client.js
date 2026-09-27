// Transmisión online de MMA (lockstep). Se anexa al final de assets/app-live.js (copia generada de app.js, ver gen-live.py): recibe del
// servidor los peleadores + semilla + órdenes de las esquinas, corre el MISMO simulador con el reloj real y usa la pantalla de combate,
// la transmisión (presentación, estudio, anuncios) de siempre. Ver server/src/mma.js y online/lockstep.mjs.
const QS = new URLSearchParams(location.search);
const API = (QS.get('api') || 'http://localhost:8787').replace(/\/+$/, ''), LEAGUE = QS.get('league'), MATCH = QS.get('match');
const PRE_MS = 90e3; // duración aproximada de la previa (presentación + estudio)
const $$ = (id) => document.getElementById(id);
const lstatus = (t) => { const el = $$('live-status'); if (!el) return; el.textContent = t || ''; el.style.display = t ? 'block' : 'none'; };
let lws = null, lhello = null, lls = null, lsim = null, lskew = 0, lopened = false, lpre = false, lretry = 0, lfinished = false, lside = -1, lactions = [], lfixes = [];
const lknown = new Set();
const lsend = (o) => { if (lws && lws.readyState === 1) lws.send(JSON.stringify(o)); };

function lresync() {
  let last = 0; try { last = +sessionStorage.getItem('llo-resync') || 0; } catch (e) {}
  if (Date.now() - last < 15000) return;
  try { sessionStorage.setItem('llo-resync', String(Date.now())); } catch (e) {}
  location.reload();
}
function laskSnap() { // el simulador local se desvió: el servidor manda una foto completa del estado (si se repite mucho, se recarga)
  const now = Date.now(); lfixes = lfixes.filter((t) => now - t < 60000);
  if (lfixes.length >= 6) return lresync();
  lfixes.push(now); lsend({ type: 'snap' });
}

window.__llo = { get sim() { return lsim; }, get ls() { return lls; } };
window.LLO_LIVE = {
  get side() { return lside; },
  get skipIntro() { return !!lls; }, // entró con el combate empezado: sin presentación
  preDone() { lpre = true; },
  order(command) {
    if (lside < 0) return lstatus('Solo la esquina puede dar órdenes');
    lsend({ type: 'act', a: { k: 'order', command } });
  },
  pump() {
    if (!lhello) return;
    const t = Date.now() + lskew;
    if (!lls) { if (!(lpre && t >= lhello.startAt)) return; lls = new Lockstep(lsim, lhello.startAt, lactions); lstatus(''); }
    lls.advanceTo(t);
  },
};

function laddActions(list) {
  for (const a of list) {
    const key = JSON.stringify(a); if (lknown.has(key)) continue; lknown.add(key);
    if (lls) { lls.addAction(a); if (lls.lateAction(a)) lresync(); } else { lactions.push(a); lactions.sort((x, y) => x.step - y.step); }
  }
}

async function lopen(d) {
  const cfg = d.cfg; lside = d.side;
  lsim = new Hs(cfg.profiles, { seed: cfg.seed, rounds: cfg.rounds, roundSeconds: cfg.roundSeconds });
  const now = Date.now() + lskew, toKick = d.startAt - now;
  if (toKick <= 0) { // ya empezó: se pone al día antes de mostrar nada
    lstatus('Poniéndose al día con el combate…');
    lls = new Lockstep(lsim, d.startAt, lactions);
    await new Promise((res) => { const go = () => { const more = lls.advanceTo(Date.now() + lskew); if (more) setTimeout(go, 0); else res(); }; go(); });
    lpre = true; lstatus('');
  } else if (toKick < PRE_MS) lstatus('');
  if (toKick > PRE_MS) { lstatus(`La transmisión empieza en ${Math.ceil((toKick - PRE_MS) / 1000)} s…`); await new Promise((r) => setTimeout(r, toKick - PRE_MS)); lstatus(''); }
  Ya(lsim, 'live');
}

function lconnect() {
  lstatus('Conectando…');
  lws = new WebSocket(API.replace(/^http/, 'ws') + `/api/league/${encodeURIComponent(LEAGUE)}/ws?match=${encodeURIComponent(MATCH)}`);
  lws.onopen = () => { lretry = 0; if (!lopened) lstatus(''); };
  lws.onclose = () => { if (lfinished) return; lstatus('Conexión perdida · reintentando…'); setTimeout(lconnect, Math.min(5000, 1000 * (++lretry))); };
  lws.onmessage = (e) => lonMsg(JSON.parse(e.data));
}
function lonMsg(d) {
  if (d.type === 'hello') {
    if (lopened) { laddActions(d.actions || []); return; }
    if (!d.cfg) { lstatus('El combate todavía no está disponible.'); return; }
    lhello = d; lskew = d.now - Date.now(); lopened = true;
    for (const a of d.actions || []) lknown.add(JSON.stringify(a));
    lactions = (d.actions || []).map((a) => ({ ...a }));
    lopen(d).catch((e) => { console.error(e); lstatus('No se pudo abrir la transmisión.'); });
  } else if (d.type === 'action') laddActions([d.a]);
  else if (d.type === 'sync') {
    const mine = lls && lls.sigs.get(d.step);
    if (mine !== undefined && mine !== d.sig) { console.warn('DESYNC', d.step); window.__desync = { step: d.step, mine, srv: d.sig }; laskSnap(); }
  } else if (d.type === 'snap') { if (lls) { const df = []; applySnap(lsim, d.snap, df, true); lls.rewind(d.step, d.st); window.__snapdiff = df; console.warn('SNAP', d.step, JSON.stringify(df.slice(0, 20))); } }
  else if (d.type === 'final') lfinished = true;
  else if (d.type === 'error') { lstatus(d.error); setTimeout(() => lstatus(''), 3000); }
}
if (LEAGUE && MATCH) { const el = document.createElement('div'); el.id = 'live-status'; document.body.appendChild(el); lconnect(); }
