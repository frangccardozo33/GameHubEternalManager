// Base común de las páginas de gestión online livianas (MMA, carreras): conexión con la liga, barra superior (próximo partido y cuenta
// regresiva), órdenes al servidor y actualización cuando otro DT mueve el mercado. Cada página aporta render(state).
(function () {
  'use strict';
  const QS = new URLSearchParams(location.search);
  const API = (QS.get('api') || 'http://localhost:8787').replace(/\/+$/, ''), LEAGUE = QS.get('league');
  const base = `${API}/api/league/${encodeURIComponent(LEAGUE)}`;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let state = null, meta = { rev: 0, startAt: 0, skew: 0 }, renderFn = null, bar = null, busy = false, uiState = {};

  const call = async (path, body) => {
    const r = await fetch(base + path, body ? { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : { credentials: 'include' });
    const d = await r.json().catch(() => ({})); if (!r.ok && !d.reason) throw new Error(d.error || 'Error de conexión'); return d;
  };
  function toast(msg, bad) {
    let t = document.getElementById('emm-toast'); if (!t) { t = document.createElement('div'); t.id = 'emm-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.className = bad ? 'bad' : 'ok'; t.style.display = 'block'; clearTimeout(toast.t); toast.t = setTimeout(() => { t.style.display = 'none'; }, 3500);
  }
  async function load() {
    const d = await call('/career'); if (!d.state) throw new Error(d.error || 'No se pudo cargar la liga');
    state = d.state; meta = { rev: d.rev, startAt: d.startAt, skew: d.now - Date.now() }; draw();
  }
  function draw() {
    const y = window.scrollY; document.getElementById('emm-app').innerHTML = renderFn(state, uiState); window.scrollTo(0, y); tick();
  }
  // Envía una orden; al terminar vuelve a traer el estado (el servidor es el que manda).
  async function cmd(op, args, extra) {
    if (busy) return; busy = true;
    try {
      const r = await call('/cmd', Object.assign({ op, args: args || [] }, extra || {}));
      if (r.ok === false) toast(r.reason || (r.result && (r.result.msg || r.result.message)) || 'No se pudo', true);
      else toast((r.result && (r.result.msg || r.result.message)) || 'Listo');
      await load();
    } catch (e) { toast(e.message, true); } finally { busy = false; }
  }
  function tick() {
    if (!bar || !state) return;
    const now = Date.now() + meta.skew, st = meta.startAt, span = bar.querySelector('span');
    const fmt = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return (h ? h + ' h ' : '') + m + ' min ' + (s % 60) + ' s'; };
    if (!st) span.textContent = 'La liga terminó.';
    else { const left = st - now; span.textContent = left > 0 ? `Próxima jornada: ${new Date(st).toLocaleString()} · faltan ${fmt(left)}${left < 300e3 ? ' · la transmisión está abierta' : ' · la estrategia y los pilotos se cierran cuando se abre la transmisión de tu partido'}` : 'Evento en curso'; }
  }
  function boot(title, render) {
    renderFn = render;
    document.title = title;
    document.body.innerHTML = '<div id="emm-bar"><span></span><button id="emm-go">Ir a mi evento</button></div><div id="emm-app"><p style="padding:20px">Cargando…</p></div>';
    const st = document.createElement('style');
    st.textContent = 'body{margin:0;background:#0d1117;color:#e6edf3;font:14px system-ui,sans-serif}#emm-bar{position:sticky;top:0;z-index:10;display:flex;gap:10px;align-items:center;justify-content:space-between;background:#0b1118;border-bottom:1px solid #22303c;padding:8px 14px;font-weight:600;font-size:12px}#emm-bar button{background:#2a7a4a;color:#fff;border:0;border-radius:8px;padding:6px 14px;font-weight:700;cursor:pointer}' +
      '#emm-app{max-width:1100px;margin:0 auto;padding:14px}h1{font-size:22px;margin:6px 0 2px}h2{font-size:15px;margin:0 0 8px;letter-spacing:.04em;text-transform:uppercase;color:#9fb3c8}.card{background:#131b24;border:1px solid #22303c;border-radius:12px;padding:12px;margin:12px 0}.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}' +
      '.item{background:#0f151d;border:1px solid #22303c;border-radius:10px;padding:10px}.item img{width:56px;height:56px;object-fit:cover;border-radius:10px;float:left;margin-right:10px;background:#1b2632}.muted{color:#8aa0b5;font-size:12px}button.b{background:#2b6cb0;color:#fff;border:0;border-radius:8px;padding:6px 12px;font-weight:600;cursor:pointer;margin:3px 3px 0 0}button.b.g{background:#2a7a4a}button.b.r{background:#8a2f2f}button.b.o{background:#26313d}button.b:disabled{opacity:.4;cursor:default}' +
      'select,input{background:#0b1118;color:#e6edf3;border:1px solid #2b3b46;border-radius:6px;padding:5px 8px}input[type=range]{width:160px}table{width:100%;border-collapse:collapse;font-size:13px}td,th{padding:5px 6px;border-bottom:1px solid #1d2934;text-align:left}.on{outline:2px solid #2a9d5a}.tag{display:inline-block;padding:1px 7px;border-radius:9px;background:#22303c;font-size:11px;margin-right:4px}' +
      '#emm-toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);padding:8px 16px;border-radius:10px;font-weight:600;z-index:20;display:none}#emm-toast.ok{background:#1f6f43}#emm-toast.bad{background:#8a2f2f}';
    document.head.appendChild(st); bar = document.getElementById('emm-bar');
    document.getElementById('emm-go').onclick = () => { if (state && state.myMatch) window.parent.postMessage({ type: 'em-online-watch', match: state.myMatch }, '*'); else toast('No hay evento programado para tu equipo.', true); };
    document.addEventListener('click', (e) => { const el = e.target.closest('[data-cmd]'); if (!el || el.disabled) return; e.preventDefault(); let args = []; try { args = JSON.parse(el.dataset.args || '[]'); } catch (x) {} cmd(el.dataset.cmd, args, el.dataset.extra ? JSON.parse(el.dataset.extra) : null); });
    document.addEventListener('change', (e) => { const el = e.target.closest('[data-cmd-change]'); if (!el) return; const args = JSON.parse(el.dataset.args || '[]'); args.push(el.type === 'checkbox' ? el.checked : el.value); cmd(el.dataset.cmdChange, args); });
    document.addEventListener('change', (e) => { const el = e.target.closest('[data-ui]'); if (!el) return; uiState[el.dataset.ui] = el.value; draw(); });
    setInterval(tick, 1000);
    setInterval(async () => { try { const d = await call('/rev'); if (d.rev !== meta.rev && !busy) await load(); } catch (e) {} }, 8000);
    load().catch((e) => { document.getElementById('emm-app').innerHTML = '<p style="padding:20px">' + esc(e.message) + '</p>'; });
  }
  window.EMMgr = { boot, cmd, toast, esc, call, get state() { return state; }, ui: uiState, redraw: draw, reload: load };
})();
