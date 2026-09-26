/*
 * Eternal Manager · capa móvil común (todos los módulos, incluida música).
 * Se carga lo antes posible en <head>. Es autónomo: inyecta su CSS, no depende de em-common.js.
 *
 *  - Detecta táctil / pantalla angosta / apaisado corto y lo deja como clases en <html>:
 *      em-touch  em-narrow (<=760px)  em-land (apaisado con poca altura)  em-fs (pantalla completa)
 *    y variables CSS: --em-vh (1% del alto visible real), --em-sat/sar/sab/sal (áreas seguras).
 *  - Fija el meta viewport (viewport-fit=cover) y limita devicePixelRatio (rendimiento/batería en 3D).
 *  - Quita el retardo del doble toque y el "arrastrar para refrescar" sobre las escenas 3D.
 *  - Botón flotante "pantalla completa + apaisado" cuando hay un partido/carrera en vivo (evento em:match),
 *    aviso de girar el teléfono en vertical y bloqueo de apagado de pantalla (Wake Lock).
 *  - Joystick táctil para la cámara dron (teclas WASD/QE/Shift sintéticas) — EMMobile.dronePad().
 *  - Ajustes de comodidad: objetivos táctiles >= 40px, sin selección de texto en los HUD, tablas con scroll.
 */
(function () {
  'use strict';
  if (window.EMMobile) return;
  const d = document, root = d.documentElement, mq = (q) => { try { return matchMedia(q).matches; } catch (e) { return false; } };
  let forced = false; try { forced = /[?&]emtouch=1/.test(location.search) || localStorage.getItem('em_touch') === '1'; } catch (e) {}
  const touch = forced || mq('(pointer:coarse)') || 'ontouchstart' in window || navigator.maxTouchPoints > 1;
  // Teléfonos: la interfaz se ve un 25 % más chica (el diseño se calcula sobre un ancho 1/0,75 mayor y se reduce a la pantalla).
  // Se puede pellizcar para acercar. Tabletas y escritorio no cambian.
  // Se puede cambiar con ?emscale=1 (desactiva la reducción) o ?emscale=0.85, o guardando localStorage.em_scale.
  let SCALE = 0.75; try { const o = (location.search.match(/[?&]emscale=([\d.]+)/) || [])[1] || localStorage.getItem('em_scale'); if (o && +o >= 0.5 && +o <= 1) SCALE = +o; } catch (e) {}
  const phone = touch && SCALE < 1 && Math.min(screen.width || 9999, screen.height || 9999) <= 520;
  const EMM = window.EMMobile = { touch, phone, scale: phone ? SCALE : 1, listeners: [] };
  if (phone) root.classList.add('em-scaled');

  // ---- viewport ----------------------------------------------------------------------------
  function fixViewport() {
    let m = d.querySelector('meta[name="viewport"]');
    if (!m) { m = d.createElement('meta'); m.name = 'viewport'; (d.head || root).appendChild(m); }
    m.content = phone ? 'width=device-width, initial-scale=' + SCALE + ', minimum-scale=' + SCALE + ', maximum-scale=3, viewport-fit=cover' : 'width=device-width, initial-scale=1, viewport-fit=cover';
    if (!d.querySelector('meta[name="theme-color"]')) { const t = d.createElement('meta'); t.name = 'theme-color'; t.content = '#0c1520'; (d.head || root).appendChild(t); }
    if (!d.querySelector('meta[name="mobile-web-app-capable"]')) {
      ['mobile-web-app-capable', 'apple-mobile-web-app-capable'].forEach((n) => { const t = d.createElement('meta'); t.name = n; t.content = 'yes'; (d.head || root).appendChild(t); });
      const s = d.createElement('meta'); s.name = 'apple-mobile-web-app-status-bar-style'; s.content = 'black-translucent'; (d.head || root).appendChild(s);
    }
  }
  fixViewport();

  // ---- resolución: menos píxeles en pantallas densas (los 3D del juego leen devicePixelRatio) ----
  try {
    if (touch) {
      const real = window.devicePixelRatio || 1, lowEnd = (navigator.deviceMemory && navigator.deviceMemory <= 3) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
      const cap = phone ? (lowEnd ? 1.5 : 2) : (lowEnd ? 1.15 : 1.5);
      Object.defineProperty(window, 'devicePixelRatio', { configurable: true, get: () => Math.min(real, cap) });
      EMM.dprCap = cap;
    }
  } catch (e) {}

  // ---- clases y variables ----------------------------------------------------------------------
  const cs = () => {
    const w = innerWidth, h = innerHeight;
    root.style.setProperty('--em-vh', (h * .01) + 'px');
    root.classList.toggle('em-touch', touch);
    root.classList.toggle('em-narrow', w <= 760);
    root.classList.toggle('em-land', touch && w > h && h <= 520);
    root.classList.toggle('em-portrait', h > w);
    try { root.classList.toggle('em-iframe', window.top !== window); } catch (e) { root.classList.add('em-iframe'); }
    root.classList.toggle('em-fs', !!(d.fullscreenElement || d.webkitFullscreenElement));
    EMM.listeners.forEach((f) => { try { f(); } catch (e) {} });
  };
  cs(); addEventListener('resize', cs, { passive: true }); addEventListener('orientationchange', () => setTimeout(cs, 150), { passive: true });
  d.addEventListener('fullscreenchange', cs); d.addEventListener('webkitfullscreenchange', cs);

  // ---- CSS -------------------------------------------------------------------------------------
  const css = `
:root{--em-sat:env(safe-area-inset-top,0px);--em-sar:env(safe-area-inset-right,0px);--em-sab:env(safe-area-inset-bottom,0px);--em-sal:env(safe-area-inset-left,0px)}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%;-webkit-tap-highlight-color:transparent}
html.em-touch body{overscroll-behavior-y:contain}
html.em-touch button,html.em-touch a,html.em-touch [role=button],html.em-touch select,html.em-touch summary,html.em-touch label,html.em-touch input{touch-action:manipulation}
html.em-touch canvas{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
html.em-touch .broadcast,html.em-touch #court-view,html.em-touch #viewport,html.em-touch #scene,html.em-touch .scene,html.em-touch .stage{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html.em-touch input:not([type=checkbox]):not([type=radio]):not([type=range]),html.em-touch select,html.em-touch textarea{font-size:max(16px,1em)}
html.em-touch button,html.em-touch .btn,html.em-touch select{min-height:38px}
html.em-touch input[type=range]{min-height:30px}
html.em-touch input[type=checkbox],html.em-touch input[type=radio]{min-width:20px;min-height:20px}
html.em-touch table{max-width:100%}
html.em-touch .em-scrollx,html.em-narrow .table-wrap,html.em-narrow .tablewrap,html.em-narrow .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
html.em-narrow img,html.em-narrow video,html.em-narrow canvas{max-width:100%}
/* modales y diálogos nunca más altos que la pantalla visible */
html.em-touch dialog{max-height:calc(var(--em-vh,1vh)*96);max-width:calc(100vw - 12px);overflow:auto}
html.em-touch .modal,html.em-touch .modal-card,html.em-touch .modal-body{max-height:calc(var(--em-vh,1vh)*92);-webkit-overflow-scrolling:touch}
/* apaisado corto: compactar cabeceras */
html.em-land header,html.em-land .topbar,html.em-land .top,html.em-land #topbar{min-height:0}
html.em-land h1{font-size:clamp(20px,5vh,34px)}

/* --- controles móviles flotantes --- */
.emm-fab{position:fixed;z-index:2147483000;right:calc(10px + var(--em-sar));top:calc(10px + var(--em-sat));display:none;gap:8px;align-items:center}
.emm-fab.on{display:flex}
.emm-fab button{min-height:0!important;width:42px;height:42px;border-radius:50%;border:1px solid #ffffff44;background:#0a1018d9;color:#fff;font:700 18px/1 system-ui,Arial;display:grid;place-items:center;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 4px 14px #0007;cursor:pointer;padding:0}
.emm-fab button:active{transform:scale(.92)}
.emm-rot{position:fixed;z-index:2147483001;left:50%;top:calc(10px + var(--em-sat));transform:translateX(-50%);display:none;flex-direction:row;align-items:center;gap:10px;padding:8px 10px 8px 12px;border-radius:24px;background:#0a1018ee;border:1px solid #ffffff33;color:#fff;font:600 12px/1.3 system-ui,Arial;width:max-content;max-width:90vw;box-shadow:0 8px 26px #000a}
.emm-rot.on{display:flex}
.emm-rot i{font-style:normal;font-size:20px;display:block;animation:emmrot 2.2s ease-in-out infinite}
.emm-rot button{min-height:0!important;width:26px;height:26px;padding:0;border-radius:50%;border:1px solid #ffffff44;background:#ffffff14;color:#fff;font:700 12px system-ui,Arial}
@keyframes emmrot{0%,30%{transform:rotate(0)}60%,100%{transform:rotate(-90deg)}}
.emm-pad{position:fixed;z-index:2147483000;bottom:calc(14px + var(--em-sab));display:none;touch-action:none;user-select:none;-webkit-user-select:none}
.emm-pad.on{display:grid}
.emm-pad.l{left:calc(14px + var(--em-sal));grid-template:repeat(3,46px)/repeat(3,46px);gap:4px}
.emm-pad.r{right:calc(14px + var(--em-sar));grid-template:repeat(3,46px)/repeat(2,58px);gap:4px}
.emm-pad button{min-height:0!important;border-radius:12px;border:1px solid #ffffff44;background:#0a1018c8;color:#fff;font:800 15px system-ui,Arial;padding:0;touch-action:none;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
.emm-pad button.h{background:#ffffff40;border-color:#fff}
.emm-pad .sp{visibility:hidden}
html.em-scaled .emm-fab button,html.em-scaled .emm-chat{width:52px;height:52px;font-size:22px}
html.em-scaled .emm-chat{top:calc(72px + var(--em-sat))}
html.em-scaled.em-land .emm-chat{top:calc(104px + var(--em-sat))}
html.em-scaled .emm-pad.l{grid-template:repeat(3,58px)/repeat(3,58px)}
html.em-scaled .emm-pad.r{grid-template:repeat(3,58px)/repeat(2,72px)}
html.em-scaled .emm-tabbar{height:calc(60px + var(--em-sab))}
html.em-scaled.em-land .emm-tabbar{height:calc(48px + var(--em-sab))}
html.em-scaled.em-navbar-on body{padding-bottom:calc(62px + var(--em-sab)) !important}
/* --- barra de pestañas inferior generada desde el menú original (EMMobile.navbar) --- */
.emm-tabbar{position:fixed;left:0;right:0;bottom:0;z-index:2147482000;display:none;height:calc(56px + var(--em-sab));padding:0 var(--em-sar) var(--em-sab) var(--em-sal);background:#0a1018f4;border-top:1px solid #ffffff26;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
html.em-navbar-on .emm-tabbar{display:flex}
.emm-tabbar button{flex:1 1 0;min-width:0;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:transparent;border:0;color:#9fb0c4;font:700 10.5px/1.1 system-ui,Arial;letter-spacing:.3px;text-transform:uppercase;padding:2px 1px;min-height:0!important;cursor:pointer;touch-action:manipulation}
.emm-tabbar button.on{color:#fff;box-shadow:inset 0 2px 0 var(--emm-a,#f2a03a)}
.emm-tabbar button svg,.emm-tabbar button img{width:20px;height:20px;object-fit:contain}
.emm-tabbar button i{font-style:normal;font-size:18px;line-height:1}
.emm-tabbar button span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
html.em-land .emm-tabbar{height:calc(44px + var(--em-sab))}
html.em-land .emm-tabbar button{flex-direction:row;gap:6px}
html.em-navbar-on body{padding-bottom:calc(58px + var(--em-sab)) !important}
html.em-navbar-on.em-land body{padding-bottom:calc(46px + var(--em-sab)) !important}
html.em-navbar-on.em-live-land .emm-tabbar{display:none}
html.em-navbar-on.em-live-land body{padding-bottom:0 !important}
.emm-sheet{position:fixed;inset:0;z-index:2147483200;background:#000000b8;display:none;align-items:flex-end;justify-content:center}
.emm-sheet.on{display:flex}
.emm-sheet>div{width:min(560px,100%);max-height:86%;overflow:auto;background:#101923;border:1px solid #ffffff26;border-radius:14px 14px 0 0;padding:14px 12px calc(14px + var(--em-sab));color:#fff;font:600 12px system-ui,Arial}
.emm-sheet h4{margin:4px 4px 8px;font:800 12px system-ui;letter-spacing:.14em;text-transform:uppercase;color:#9fb0c4}
.emm-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px}
.emm-grid button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;min-height:66px!important;padding:8px 4px;background:#1a2634;border:1px solid #ffffff22;border-radius:10px;color:#fff;font:700 11px/1.15 system-ui,Arial;text-transform:uppercase;letter-spacing:.3px;text-align:center;cursor:pointer;touch-action:manipulation}
.emm-grid button.on{border-color:var(--emm-a,#f2a03a);background:#243447}
.emm-grid button svg,.emm-grid button img{width:22px;height:22px;object-fit:contain}
.emm-grid button i{font-style:normal;font-size:20px}

/* el saldo del hub ya se ve en la cabecera del hub en vertical; en apaisado queda chico y arriba a la derecha */
html.em-narrow.em-portrait #touchline-hud{display:none !important}
/* chat del partido (puente) : sólo la cinta de mensajes, chica y sin capturar toques; se escribe desde el botón de chat del hub */
html.em-touch #tlc-root{width:min(300px,calc(100vw - 84px));left:calc(8px + var(--em-sal));bottom:calc(118px + var(--em-sab));font-size:12px}
html.em-touch #tlc-root .tlc-feed{max-height:70px;overflow:hidden}
html.em-touch #tlc-root:not(.emm-open) .tlc-form,html.em-touch #tlc-root:not(.emm-open) .tlc-bar{display:none !important}
html.em-touch #tlc-root:not(.emm-open) .tlc-feed{max-height:44px}
html.em-touch #tlc-root.emm-open{pointer-events:auto}
html.em-touch #tlc-root .tlc-form{opacity:.95}
.emm-chat{position:fixed;z-index:2147483001;right:calc(10px + var(--em-sar));top:calc(62px + var(--em-sat));width:42px;height:42px;border-radius:50%;border:1px solid #ffffff44;background:#0a1018d9;color:#fff;font:700 18px/1 system-ui;display:none;place-items:center;padding:0;min-height:0!important;box-shadow:0 4px 14px #0007;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.emm-chat.on{display:grid}.emm-chat.open{background:#f2a03a;color:#000}
html.em-land .emm-chat{top:calc(92px + var(--em-sat))}
html.em-touch #tlc-root input{font-size:16px;min-height:36px}
html.em-touch #tlc-root button{min-height:36px;min-width:36px}
html.em-land #tlc-root{left:auto;right:calc(64px + var(--em-sar));bottom:calc(14px + var(--em-sab));width:min(280px,40vw)}
html.em-touch .em-tab{opacity:.7}
html.em-land #touchline-hud{top:calc(6px + var(--em-sat)) !important;right:calc(8px + var(--em-sar)) !important;transform:scale(.8);transform-origin:top right}
html.em-land .emm-fab{top:calc(44px + var(--em-sat))}
`;
  const st = d.createElement('style'); st.id = 'em-mobile-css'; st.textContent = css; (d.head || root).appendChild(st);

  // ---- pantalla completa / apaisado / wake lock -----------------------------------------------
  let wake = null;
  const fsEl = () => d.fullscreenElement || d.webkitFullscreenElement;
  async function lockLandscape() { try { await screen.orientation.lock('landscape'); } catch (e) {} }
  async function enterFs(target) {
    const el = target || root;
    try { if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' }); else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen(); } catch (e) {}
    lockLandscape();
  }
  function exitFs() { try { if (d.exitFullscreen) d.exitFullscreen(); else if (d.webkitExitFullscreen) d.webkitExitFullscreen(); } catch (e) {} try { screen.orientation.unlock(); } catch (e) {} }
  async function keepAwake(on) {
    try {
      if (on && !wake && navigator.wakeLock && !d.hidden) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); }
      else if (!on && wake) { await wake.release(); wake = null; }
    } catch (e) { wake = null; }
  }
  d.addEventListener('visibilitychange', () => { if (!d.hidden && EMM.live) keepAwake(true); });
  Object.assign(EMM, { enterFs, exitFs, keepAwake, live: false });

  const fab = d.createElement('div'); fab.className = 'emm-fab';
  fab.innerHTML = '<button type="button" data-a="fs" aria-label="Pantalla completa" title="Pantalla completa">⛶</button>';
  const rot = d.createElement('div'); rot.className = 'emm-rot'; rot.innerHTML = '<i>📱</i><div>Girá el teléfono para ver mejor</div><button type="button" aria-label="Cerrar">✕</button>';
  let rotDismissed = false, rotT = 0;
  function mountUi() {
    if (!d.body) return addEventListener('DOMContentLoaded', mountUi, { once: true });
    d.body.appendChild(fab); d.body.appendChild(rot);
  }
  mountUi();
  fab.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; if (fsEl()) exitFs(); else enterFs(); });
  rot.querySelector('button').addEventListener('click', () => { rotDismissed = true; paint(); });
  function paint() {
    const live = EMM.live && touch;
    fab.classList.toggle('on', live);
    fab.firstChild.textContent = fsEl() ? '✕' : '⛶';
    rot.classList.toggle('on', live && !rotDismissed && root.classList.contains('em-portrait') && innerWidth < 640 && !fsEl());
  }
  EMM.listeners.push(paint);
  // em-common avisa con este evento cuando empieza / termina un partido, pelea o carrera
  addEventListener('em:match', (e) => {
    EMM.live = !!(e.detail && e.detail.on !== undefined ? e.detail.on : e.detail);
    if (EMM.live) { rotDismissed = false; clearTimeout(rotT); rotT = setTimeout(() => { rotDismissed = true; paint(); }, 7000); focusMount((e.detail && e.detail.mount) || d.querySelector('#viewport,#court-view,.fight-viewport,.broadcast')); }
    keepAwake(EMM.live); paint(); if (!EMM.live && padL) EMM.dronePad(false);
  });

  // al empezar un partido en el teléfono, sube el visor de la transmisión al borde superior para verlo grande
  function focusMount(m) {
    try { if (!touch || !m || !m.scrollIntoView) return; m.style.scrollMarginTop = (root.classList.contains('em-land') ? 46 : 4) + 'px'; [400, 1800].forEach((t) => setTimeout(() => { if (EMM.live) m.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, t)); } catch (e) {}
  }

  // ---- chat del partido: botón 💬 que abre/cierra el cuadro de escritura (no tapa los controles del juego) ----
  const chat = d.createElement('button'); chat.type = 'button'; chat.className = 'emm-chat'; chat.textContent = '💬'; chat.setAttribute('aria-label', 'Chat del partido');
  (function mountChat() { if (!d.body) return addEventListener('DOMContentLoaded', mountChat, { once: true }); d.body.appendChild(chat); })();
  const tlc = () => d.getElementById('tlc-root');
  function chatSet(open) { const r = tlc(); if (!r) return; r.classList.toggle('emm-open', open); chat.classList.toggle('open', open); if (open) { const i = r.querySelector('input'); if (i) setTimeout(() => i.focus(), 60); } }
  chat.addEventListener('click', () => { const r = tlc(); chatSet(!(r && r.classList.contains('emm-open'))); });
  d.addEventListener('focusout', (e) => { if (e.target && e.target.closest && e.target.closest('#tlc-root')) setTimeout(() => { const r = tlc(); if (r && !r.contains(d.activeElement) && d.activeElement !== chat) chatSet(false); }, 350); });
  setInterval(() => { const r = tlc(); chat.classList.toggle('on', !!(touch && EMM.live && r && !r.hidden && r.getBoundingClientRect().width)); }, 700);

  // ---- barra de pestañas inferior ----------------------------------------------------------------
  // Toma los botones/enlaces del menú original del módulo (que en el teléfono queda como una tira que hay que deslizar y
  // nadie descubre) y arma: 4 pestañas principales + «Más» (hoja con todo). Cada toque se reenvía al botón original.
  //   EMMobile.navbar({ items: 'css de los botones', extra: 'css de botones sueltos (guardar…)', hide: 'css del menú a ocultar',
  //                     main: [regex de etiquetas preferidas], accent: '#hex', max: 760, label: (btn) => texto })
  EMM.navbar = function (cfg) {
    if (!touch) return;
    const tb = d.createElement('nav'); tb.className = 'emm-tabbar'; tb.setAttribute('aria-label', 'Secciones');
    const sh = d.createElement('div'); sh.className = 'emm-sheet'; sh.innerHTML = '<div></div>';
    if (cfg.accent) root.style.setProperty('--emm-a', cfg.accent);
    const q = (sel) => (sel ? [...d.querySelectorAll(sel)] : []);
    const txt = (b) => (b.getAttribute('aria-label') || b.textContent || '').replace(/\s+/g, ' ').trim();
    const AUTO = [[/inicio|home|panel|dashboard/i, '⌂'], [/plantilla|roster|equipo|squad|pilotos|drivers/i, '◍'], [/t[aá]ctic|gameplan|estrategia|depth/i, '✜'], [/calendar|fechas|schedule|fight/i, '▦'], [/clasific|standings|tabla|ranking|result/i, '≡'], [/estad[ií]st|stats|historial/i, '▤'], [/mercado|market|transfer|matchmaking|draft/i, '⇄'], [/contrat|finanz|money|garage/i, '$'], [/scout|entren|training|camp|pr[aá]ctica/i, '◎'], [/copa|carrera|match|partido|exhib/i, '▶'], [/patroc|sponsor/i, '★'], [/tribuna/i, '▧'], [/ajust|settings|regl/i, '⚙']];
    const icon = (b) => { const g = b.querySelector('svg,img'); if (g) return g.cloneNode(true).outerHTML; const i = b.querySelector('i'); if (i) return '<i>' + i.textContent + '</i>'; const t = label(b), m = AUTO.find((x) => x[0].test(t)); return '<i>' + (m ? m[1] : '•') + '</i>'; };
    const isOn = (b) => /(^|\s)(active|on|current)(\s|$)/.test(b.className || '') || b.getAttribute('aria-current') === 'page';
    const label = (b) => (cfg.label ? cfg.label(b) : txt(b).replace(/^[^\wÁÉÍÓÚÑáéíóúñ]+/, '').replace(/\d+$/, '').trim());
    let sig = '';
    const hideCss = d.createElement('style'); (d.head || root).appendChild(hideCss);
    function build() {
      const its = q(cfg.items).filter((b) => txt(b));
      const main = []; (cfg.main || []).forEach((re) => { const b = its.find((x) => re.test(label(x))); if (b && !main.includes(b)) main.push(b); });
      its.forEach((b) => { if (main.length < 4 && !main.includes(b)) main.push(b); });
      const now = its.map((b) => label(b) + (isOn(b) ? '*' : '')).join('|'); if (now === sig && tb.firstChild) return; sig = now;
      const moreOn = its.some((b) => isOn(b) && !main.includes(b));
      tb.innerHTML = main.map((b) => `<button type="button" data-i="${its.indexOf(b)}" class="${isOn(b) ? 'on' : ''}">${icon(b)}<span>${label(b)}</span></button>`).join('') + `<button type="button" data-more="1" class="${moreOn ? 'on' : ''}"><i>☰</i><span>Más</span></button>`;
      const ex = q(cfg.extra);
      sh.firstChild.innerHTML = `<h4>Secciones</h4><div class="emm-grid">${its.map((b, i) => `<button type="button" data-i="${i}" class="${isOn(b) ? 'on' : ''}">${icon(b)}<span>${label(b)}</span></button>`).join('')}</div>` + (ex.length ? `<h4>Más</h4><div class="emm-grid">${ex.map((b, i) => `<button type="button" data-x="${i}">${icon(b)}<span>${label(b)}</span></button>`).join('')}</div>` : '') + '<div class="emm-grid" style="grid-template-columns:1fr"><button type="button" data-close="1"><span>Cerrar</span></button></div>';
      tb._its = its; tb._ex = ex;
    }
    tb.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.more) { build(); sh.classList.add('on'); return; } const t = tb._its[+b.dataset.i]; if (t) { t.click(); setTimeout(build, 80); } });
    sh.addEventListener('click', (e) => { const b = e.target.closest('button'); if (e.target === sh || (b && b.dataset.close)) return sh.classList.remove('on'); if (!b) return; const t = b.dataset.x != null ? tb._ex[+b.dataset.x] : tb._its[+b.dataset.i]; sh.classList.remove('on'); if (t) setTimeout(() => { t.click(); setTimeout(build, 80); }, 30); });
    function upd() {
      const on = innerWidth <= (cfg.max || 760) || root.classList.contains('em-land');
      root.classList.toggle('em-navbar-on', !!on);
      root.classList.toggle('em-live-land', !!(on && EMM.live && root.classList.contains('em-land') && cfg.hideLive !== false));
      hideCss.textContent = on && cfg.hide ? cfg.hide + '{display:none !important}' : '';
      if (on) build();
    }
    (function mount() { if (!d.body) return addEventListener('DOMContentLoaded', mount, { once: true }); d.body.appendChild(tb); d.body.appendChild(sh); upd(); })();
    EMM.listeners.push(upd); setInterval(() => { if (root.classList.contains('em-navbar-on')) build(); }, 800);
    addEventListener('em:match', () => setTimeout(upd, 50));
  };

  // ---- joystick de dron -----------------------------------------------------------------------
  let padL = null, padR = null, padDom = null;
  function key(code, down) { try { window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, key: code, bubbles: true, cancelable: true })); } catch (e) {} }
  function mkPad(cls, rows) {
    const p = d.createElement('div'); p.className = 'emm-pad ' + cls;
    p.innerHTML = rows.map((r) => r ? `<button type="button" data-k="${r[0]}" aria-label="${r[2] || r[0]}">${r[1]}</button>` : '<span class="sp"></span>').join('');
    const held = new Map();
    const rel = (b) => { const c = b.dataset.k; if (held.has(b)) { held.delete(b); b.classList.remove('h'); key(c, false); } };
    p.addEventListener('pointerdown', (e) => { const b = e.target.closest('button'); if (!b) return; e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (x) {} held.set(b, 1); b.classList.add('h'); key(b.dataset.k, true); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => p.addEventListener(ev, (e) => { const b = e.target.closest('button'); if (b) rel(b); }));
    d.body.appendChild(p); return p;
  }
  EMM.dronePad = function (on, dom) {
    if (!touch) return;
    if (on && !padL) {
      padL = mkPad('l', [null, ['KeyW', '▲', 'Adelante'], null, ['KeyA', '◀', 'Izquierda'], ['KeyS', '▼', 'Atrás'], ['KeyD', '▶', 'Derecha']]);
      padR = mkPad('r', [['KeyE', '↑', 'Subir'], ['ShiftLeft', '⚡', 'Turbo'], ['KeyQ', '↓', 'Bajar'], null, null, null]);
    }
    padDom = dom || padDom;
    if (padL) { padL.classList.toggle('on', !!on); padR.classList.toggle('on', !!on); }
    if (padDom) padDom.style.touchAction = on ? 'none' : '';
  };

  // ---- utilidades para módulos ---------------------------------------------------------------
  // Arrastre con un dedo = mover, pellizco = acercar; devuelve fn para desmontar. (cb recibe {dx,dy,scale})
  EMM.gesture = function (el, cb) {
    const pts = new Map(); let last = 0;
    el.style.touchAction = 'none';
    const dist = () => { const a = [...pts.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); };
    const dn = (e) => { pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pts.size === 2) last = dist(); try { el.setPointerCapture(e.pointerId); } catch (x) {} };
    const mv = (e) => { const p = pts.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (pts.size === 2) { const n = dist(); cb({ dx: 0, dy: 0, scale: last ? n / last : 1 }); last = n; } else cb({ dx, dy, scale: 1 }); };
    const up = (e) => { pts.delete(e.pointerId); last = 0; };
    el.addEventListener('pointerdown', dn); el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    return () => { el.removeEventListener('pointerdown', dn); el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
  };

  // ---- configuración de la barra inferior por módulo ---------------------------------------------
  const P = location.pathname;
  { // dentro del hub, la cabecera propia del módulo ocupa alto útil sin aportar (el hub ya muestra el módulo y el saldo)
    const st2 = d.createElement('style');
    st2.textContent = /05-basquet/.test(P) ? 'html.em-iframe.em-narrow .site-header{display:none !important}' : /06-nfl/.test(P) ? 'html.em-iframe.em-narrow .app-header{display:none !important}' : '';
    if (st2.textContent) (d.head || root).appendChild(st2);
  }
  if (/05-basquet/.test(P)) EMM.navbar({ items: '.nav button[data-go]', hide: '.nav', main: [/^Inicio/, /^Plantilla/, /^Calendario/, /^Clasific/], accent: '#ff9a3c' });
  else if (/06-nfl/.test(P)) EMM.navbar({ items: '.sidebar nav a', extra: '.sidebar .side-foot button', hide: '.sidebar', main: [/Dashboard/, /Roster/, /^Match/, /Standings/], accent: '#5ec98a' });
  else if (/04-mma/.test(P)) EMM.navbar({ items: 'header.topbar nav .nav-item', hide: 'header.topbar nav', main: [/^Panel/, /^Mi equipo/, /^Matchmaking/, /^Calendario/], accent: '#ee713e' });
  else if (/07-carreras/.test(P)) EMM.navbar({ items: '#bottom-nav button', hide: '#bottom-nav', main: [/^HOME/, /^GARAGE/, /^CARRERA/, /^TABLA/], accent: '#e97843' });
})();
