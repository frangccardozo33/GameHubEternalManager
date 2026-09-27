// Arranque de la transmisión online de carreras (lro-live.html): abre el WebSocket, espera el "hello" del servidor (Career + semilla
// + órdenes) y recién ahí carga los scripts del juego en orden (el motor lee window.LRO_LIVE_CAREER al cargar).
(function () {
  'use strict';
  const QS = new URLSearchParams(location.search);
  const API = (QS.get('api') || 'http://localhost:8787').replace(/\/+$/, ''), LEAGUE = QS.get('league'), MATCH = QS.get('match');
  const st = document.createElement('div'); st.id = 'live-status'; document.addEventListener('DOMContentLoaded', () => document.body.appendChild(st));
  const status = (t) => { st.textContent = t || ''; st.style.display = t ? 'block' : 'none'; };
  window.LRO_LIVE_STATUS = status;
  const ORDER = ['vendor/three.min.js', 'roster-lro.js', 'live/dmath.js', 'live/game-data.js', 'live/circuits.js', '@circuits', 'live/motorsport-art.js', 'live/game-ui.js',
    '../assets/nations/nations.js', '../assets/tribuna/tribuna.js', 'tribuna-lro.js', '../assets/broadcast/broadcast.js', 'live/broadcast-lro.js', 'live/engine.js',
    'lro-extras.js', 'lro-post.js', 'lro-cams.js', 'live/live-main.js'];
  function load(i) {
    if (i >= ORDER.length) return;
    const src = ORDER[i];
    if (src === '@circuits') { Promise.resolve(window.CIRCUITS_READY).catch(() => {}).then(() => load(i + 1)); return; }
    const s = document.createElement('script'); s.src = src; s.async = false;
    s.onload = () => load(i + 1); s.onerror = () => { console.error('no se pudo cargar', src); load(i + 1); };
    document.head.appendChild(s);
  }
  if (!LEAGUE || !MATCH) { document.addEventListener('DOMContentLoaded', () => status('Falta la liga o la carrera.')); return; }
  let ws = null, retry = 0, opened = false; const queue = [];
  function connect() {
    ws = new WebSocket(API.replace(/^http/, 'ws') + `/api/league/${encodeURIComponent(LEAGUE)}/ws?match=${encodeURIComponent(MATCH)}`);
    window.LRO_LIVE_WS = ws;
    ws.onopen = () => { retry = 0; };
    ws.onclose = () => { if (window.LRO_LIVE_FINISHED) return; status('Conexión perdida · reintentando…'); setTimeout(connect, Math.min(5000, 1000 * (++retry))); };
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (window.LRO_LIVE_MSG) return window.LRO_LIVE_MSG(d);
      if (d.type === 'hello' && !opened) {
        if (!d.career) { status('La carrera todavía no está disponible.'); return; }
        opened = true; window.LRO_LIVE_HELLO = d; window.LRO_LIVE_CAREER = d.career; window.LRO_LIVE_SKEW = d.now - Date.now();
        load(0);
      } else queue.push(d);
    };
  }
  window.LRO_LIVE_QUEUE = queue;
  connect();
})();
