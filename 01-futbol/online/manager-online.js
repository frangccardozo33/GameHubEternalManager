// Gestión online del club (fútbol): el modo carrera de siempre (plantel, tácticas, mercado, copa) pero sobre la liga compartida del servidor.
// Se carga en fulbo.html y solo actúa con ?mgr=online&api=..&league=.. El cliente trabaja sobre una copia del estado; cada acción se aplica
// acá (para que la interfaz responda al instante) y se manda al servidor, que la valida y la aplica sobre el estado real.
(function () {
  'use strict';
  const QS = new URLSearchParams(location.search);
  if (QS.get('mgr') !== 'online') return;
  const API = (QS.get('api') || 'http://localhost:8787').replace(/\/+$/, ''), LEAGUE = QS.get('league');
  const base = `${API}/api/league/${encodeURIComponent(LEAGUE)}`;
  const $ = (id) => document.getElementById(id);
  let depth = 0, UI = null, TLM = null, me = null, rev = 0, startAt = 0, skew = 0, busy = false, queue = [], lastPatch = '', patchT = null, banner = null, syncing = false;

  const call = async (path, body) => {
    const r = await fetch(base + path, body ? { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : { credentials: 'include' });
    const d = await r.json().catch(() => ({})); if (!r.ok && !d.reason) throw new Error(d.error || 'Error de conexión'); return d;
  };
  const toast = (m, k) => { try { UI.toast(m, k || 'bad'); } catch (e) { console.warn(m); } };

  // ---- estado del servidor -> copia local
  async function fetchState() {
    const d = await call('/career'); if (!d.state) throw new Error(d.error || 'No se pudo cargar la liga');
    me = d.club; rev = d.rev; startAt = d.startAt; skew = d.now - Date.now();
    const c = TLM.Career.fromJSON(d.state); c.state.currentClubId = me;
    return c;
  }
  async function resync(why) {
    if (syncing) return; syncing = true;
    try {
      const c = await fetchState(); UI.career.state = c.state; lastPatch = patchOf(); UI.render(); if (why) toast(why, 'ok');
    } catch (e) { console.warn(e); } finally { syncing = false; }
  }

  // ---- lo que el DT edita a mano en su club se manda entero (el servidor valida su forma)
  const patchOf = () => { const u = UI.career.state.clubs[me]; return JSON.stringify({ lineup: u.lineup, tactics: u.tactics, plan: u.plan, rules: u.rules == null ? null : u.rules, instructions: u.instructions || {}, lineupMode: u.lineupMode }); };
  function schedulePatch() { clearTimeout(patchT); patchT = setTimeout(sendPatch, 500); }
  async function sendPatch() {
    const p = patchOf(); if (p === lastPatch) return; lastPatch = p;
    try { const r = await call('/cmd', { op: 'club', patch: JSON.parse(p) }); if (r.ok === false) { toast(r.reason || 'El servidor rechazó el cambio'); await resync(); } else rev = r.rev; }
    catch (e) { toast('No se pudo guardar: ' + e.message); }
  }

  // ---- órdenes de mercado/club: se aplican local y viajan al servidor en orden
  const ARGS = { // qué argumentos (además del estado y del club propio) se mandan
    renewContract: (a) => [a[2], a[3], a[4]], listPlayer: (a) => [a[2], a[3]], unlistPlayer: (a) => [a[1]], sellNow: (a) => [a[2]], buyEdition: (a) => [a[2], a[3]],
    makeOffer: (a) => [a[2], a[3], a[4] || {}], buyNow: (a) => [a[2], a[3] || {}], signFreeAgent: (a) => [a[2], a[3] || {}],
    withdrawOffer: (a) => [a[1]], acceptCounter: (a) => [a[1]], counterOffer: (a) => [a[1], a[2]], respondToOffer: (a) => [a[1], a[2], a[3]],
    scout: (a) => [a[2] || {}], setTraining: (a) => [a[2] == null ? null : a[2], a[3] == null ? null : a[3]], upgradeStadium: () => [], editClub: (a) => [a[2]],
    setFormation: (a) => [a[2]], autoLineup: () => [],
  };
  function wrapOps() {
    for (const op of Object.keys(ARGS)) {
      const orig = TLM[op]; if (typeof orig !== 'function') continue;
      TLM[op] = function (...a) {
        depth++; let r; try { r = orig.apply(this, a); } finally { depth--; }
        // solo las llamadas de la interfaz sobre MI club (no las que el propio núcleo hace por dentro ni sobre clubes IA)
        const mine = a[1] == null || a[1] === me || (a[1] && a[1].id === me) || typeof a[1] === 'string' && !UI.career.state.clubs[a[1]];
        if (depth === 0 && a[0] === UI.career.state && mine && !(r && r.ok === false) && r !== false) { queue.push({ op, args: ARGS[op](a).map((x) => (x === undefined ? null : x)) }); pump(); }
        return r;
      };
    }
  }
  async function pump() {
    if (busy) return; busy = true;
    try {
      while (queue.length) {
        const cmd = queue.shift();
        let r; try { r = await call('/cmd', cmd); } catch (e) { toast('Sin conexión con la liga: ' + e.message); queue.length = 0; break; }
        if (r.ok === false) { queue.length = 0; toast(r.reason || 'El servidor rechazó la operación'); await resync(); break; }
        if (r.rev !== rev + 1) { rev = r.rev; if (!queue.length) await resync(); } else rev = r.rev; // otro DT también movió el mercado: se trae el estado nuevo
      }
    } finally { busy = false; }
  }

  // ---- avisos y navegación con el resto del hub
  function tick() {
    if (!banner) return;
    const now = Date.now() + skew, st = startAt;
    if (!st) { banner.querySelector('span').textContent = 'Sin partidos programados.'; return; }
    const left = st - now, fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return (h ? h + ' h ' : '') + m + ' min ' + (s % 60) + ' s'; };
    banner.querySelector('span').textContent = left > 0 ? `Próxima jornada: ${new Date(st).toLocaleString()} · faltan ${fmt(left)}` + (left < 5 * 60e3 ? ' · la transmisión está abierta' : ' · el once y las tácticas se cierran cuando se abre la transmisión de tu partido') : 'Partido en curso';
  }
  function watchMine() {
    const f = UI.career.userFixture(); if (!f) return toast('No hay partido programado para tu club.');
    window.parent.postMessage({ type: 'em-online-watch', match: f.id }, '*');
  }
  function build() {
    const st = document.createElement('style');
    st.textContent = '#tlm-online-bar{position:fixed;top:0;left:0;right:0;z-index:2147483000;display:flex;gap:10px;align-items:center;justify-content:space-between;background:#0b1118f0;color:#e8eef5;padding:6px 12px;font:600 12px system-ui}#tlm-online-bar button{background:#2a7a4a;color:#fff;border:0;border-radius:8px;padding:5px 12px;font:700 12px system-ui;cursor:pointer}' +
      '.site-header,#tlm-open,[data-act=quitCareer],[data-act=exportSave],[data-act=importSave],[data-act=loadSave],[data-act=closeManager],[data-act=saveNow]{display:none!important}.tlm{top:32px!important}';
    document.head.appendChild(st);
    banner = document.createElement('div'); banner.id = 'tlm-online-bar';
    banner.innerHTML = '<span></span><div><button id="tlm-online-go">Ir a mi partido</button></div>'; document.body.appendChild(banner);
    $('tlm-online-go').onclick = watchMine; tick(); setInterval(tick, 1000);
  }

  async function boot() {
    try {
      await window.TLM.Bridge.ready(); TLM = window.TLM; UI = TLM.UI || window.TLM_UI; if (!UI.root) UI.mount();
      TLM.Career.prototype.save = function () { return { ok: true, bytes: 0 }; };   // el estado vive en el servidor
      const c = await fetchState(); UI.career = c; UI.attach(); build(); wrapOps(); lastPatch = patchOf();
      const A = UI.actions, jugar = () => watchMine();
      A.playMatch = jugar; A.quickSim = () => toast('Los partidos se juegan en vivo, a la hora programada.'); A.closeRound = () => toast('La jornada la cierra el servidor cuando terminan los partidos.'); A.afterRound = () => UI.go('home');
      for (const ev of ['click', 'change', 'input']) document.addEventListener(ev, () => schedulePatch(), true);
      UI.show(); UI.go('home', {});
      setInterval(async () => { try { const d = await call('/rev'); if (d.rev !== rev && !busy && !queue.length) await resync(); } catch (e) {} }, 15000);
    } catch (e) { console.error(e); document.body.insertAdjacentHTML('afterbegin', '<div style="position:fixed;inset:0;z-index:2147483647;background:#0b1118;color:#fff;display:flex;align-items:center;justify-content:center;font:16px system-ui">' + String(e.message || e) + '</div>'); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
