'use strict';
// Transmisión de LRO (assets/broadcast/broadcast.js): placas de eventos y estudio (previa, mitad de carrera y post-carrera).
// Es solo texto en pantalla, como el estudio del fútbol; no hay relato ni voz durante la carrera.
(function () {
  if (!window.Broadcast) return;
  let bc = null, preKey = '';
  function ensure() {
    if (bc && bc.layer.isConnected) return bc;
    const mount = document.querySelector('.broadcast'); if (!mount) return null;
    try { window.Broadcast.setBase(new URL('../assets/', location.href).href); bc = window.Broadcast.attach({ id: 'lro', sport: 'carreras', mount, accent: '#ff4b3e', logo: 'logos/lro-sm.png', league: 'Liga Racing Online' }); } catch (e) { console.warn('Transmisión no disponible', e); }
    return bc;
  }
  const ord = (n) => ['', 'primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'séptimo', 'octavo', 'noveno', 'décimo'][n] || 'puesto ' + n;
  const name = (c) => c.driver.name || c.driver.short;
  const PLATES = { '¡LARGARON!': 'LARGADA', 'CAMBIO DE LÍDER': 'NUEVO LÍDER', 'VUELTA RÁPIDA': 'VUELTA RÁPIDA', 'SPIN': 'TROMPO', 'ABANDONO MECÁNICO': 'ABANDONO', 'SAFETY CAR': 'SAFETY CAR', 'SAFETY CAR VIRTUAL': 'SAFETY CAR VIRTUAL', 'BANDERA ROJA': 'BANDERA ROJA', 'ÚLTIMA VUELTA': 'ÚLTIMA VUELTA', 'BANDERA A CUADROS': 'BANDERA A CUADROS' };
  window.LROcast = function (title, detail) {
    // las placas de carrera las muestra la cola propia (window.LROui.plate, abajo a la izquierda) para no tapar el centro
    if (!PLATES[title]) return; ensure();
  };
  const cars = () => (typeof state !== 'undefined' && state.order ? state.order : []);
  window.LROstudio = {
    // antes de la largada: pista y candidatos; llama a then() al terminar (una vez por carrera)
    pre(track, then) {
      const b = ensure(), key = track.id + '|' + (typeof Career !== 'undefined' ? Career.season + '-' + Career.roundIndex : '');
      if (!b || key === preKey) { then(); return; }
      preKey = key; const o = cars();
      b.studio({ kind: 'pre', onDone: then, lines: [
        ['A', `Bienvenidos a ${track.name}, en ${track.region || track.country}.`],
        ['B', `${track.lengthKm.toFixed(2).replace('.', ',')} kilómetros y ${track.corners} curvas: el desgaste de neumáticos va a marcar la estrategia.`],
        o.length >= 3 ? ['A', `Largan primero ${name(o[0])}, ${name(o[1])} y ${name(o[2])}.`] : null,
        ['B', `Probabilidad de lluvia: ${Math.round(track.wetChance * 100)} %. Temperatura de referencia, ${track.tempBase} grados.`]].filter(Boolean) });
    },
    // a mitad de carrera (pausa la carrera mientras habla el estudio)
    half() {
      const b = ensure(); if (!b) return; const o = cars(); if (o.length < 3) return;
      const was = state.paused; state.paused = true;
      b.studio({ kind: 'half', onDone: () => { state.paused = was; }, lines: [
        ['A', `Mitad de carrera: lidera ${name(o[0])}, seguido por ${name(o[1])} y ${name(o[2])}.`],
        ['B', state.fastestCarId != null && state.cars[state.fastestCarId] ? `La vuelta rápida hasta ahora es de ${name(state.cars[state.fastestCarId])}.` : 'Todavía no hay una vuelta rápida clara.'],
        ['B', 'Ahora empiezan a pesar las paradas y el estado de los neumáticos.']] });
    },
    // al terminar: llama a then() (los resultados) cuando cierra el estudio; devuelve true si lo mostró
    post(then) {
      const b = ensure(); const f = typeof state !== 'undefined' ? state.finishes : []; if (!b || !f || f.length < 3) return false;
      b.studio({ kind: 'post', onDone: then, lines: [
        ['A', `Ganó ${name(f[0])} (${f[0].team.name}). Segundo, ${name(f[1])}; tercero, ${name(f[2])}.`],
        state.fastestCarId != null && state.cars[state.fastestCarId] ? ['B', `La vuelta rápida fue de ${name(state.cars[state.fastestCarId])}.`] : null,
        ['B', 'La tabla del campeonato se mueve. Ahora, el resumen de la carrera.']].filter(Boolean) });
      return true;
    },
  };
})();

/* ---------------------------------------------------------------------------------------------------------------
 * LRO · UI de transmisión v2: torre de posiciones horizontal paginada, placas de eventos en cola, barra de cámaras
 * compacta con atajos (hoja en móvil) y mapa con números. Se instala en 'load' (después de engine/extras/post/cams)
 * envolviendo updateUI / buildStandings / buildMap / addEvent sin cambiar sus ids.
 * --------------------------------------------------------------------------------------------------------------- */
(function () {
  'use strict';
  const $id = (i) => document.getElementById(i);
  const hex = (n) => '#' + (n >>> 0).toString(16).padStart(6, '0').slice(-6);
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const lum = (n) => { const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return (r * 299 + g * 587 + b * 114) / 1000; };
  const surname = (d) => { const s = String(d.short || d.name || '').replace(/^[A-ZÁÉÍÓÚÑ]\.\s*/i, ''); return s.toUpperCase(); };
  const html = document.documentElement;

  // ------------------------------------------------------------------ placas de eventos (cola, máx. 2 visibles)
  const KIND = [
    [/ADELANT|CAMBIO DE LÍDER|BATALLA/, 'pass', '#3fa9ff', '⇄'],
    [/VUELTA RÁPIDA/, 'fast', '#b04dff', '⏱'],
    [/BOX|PIT/, 'pit', '#2fd3c5', 'P'],
    [/SPIN|TROMPO|CONTACTO|ABANDONO/, 'inc', '#ff8a1f', '!'],
    [/BANDERA ROJA/, 'red', '#e0302a', '▮'],
    [/SAFETY|VSC/, 'sc', '#f2c230', 'SC'],
    [/A CUADROS/, 'chk', '#ffffff', '🏁'],
    [/ÚLTIMA VUELTA|LARGARON|SE REANUDA|MOTORES/, 'flag', '#57e27b', '▶']
  ];
  const Q = { list: [], shown: [], max: 2, dur: 3800 };
  let host = null;
  function plateHost() { if (host && host.isConnected) return host; const b = document.querySelector('.broadcast'); if (!b) return null; host = document.createElement('div'); host.className = 'lx-plates'; host.setAttribute('aria-live', 'polite'); b.appendChild(host); return host; }
  function platesHeight() { const h = host ? host.getBoundingClientRect().height : 0; const b = document.querySelector('.broadcast'); if (b) b.style.setProperty('--plates-h', (h ? h + 6 : 0) + 'px'); }
  function pump() {
    const h = plateHost(); if (!h) return;
    const max = html.classList.contains('em-portrait') ? 1 : Q.max;
    while (Q.shown.length < max && Q.list.length) {
      const p = Q.list.shift(), k = KIND.find((x) => x[0].test(p.title)) || [null, 'info', '#e5233d', 'i'];
      const el = document.createElement('div'); el.className = 'lx-plate k-' + k[1]; el.style.setProperty('--pc', p.color || k[2]); el.style.setProperty('--pd', Q.dur + 'ms');
      el.innerHTML = `<i></i><div class="pk">${k[3]}</div><div class="pb"><strong>${esc(p.title)}</strong><span>${esc(p.detail)}</span></div>`;
      h.appendChild(el); Q.shown.push(el); void el.offsetWidth; setTimeout(() => { el.classList.add('in'); platesHeight(); }, 20);
      setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); Q.shown = Q.shown.filter((x) => x !== el); platesHeight(); pump(); }, 380); }, Q.dur);
    }
  }
  function plate(title, detail, color) {
    if (!title) return; const key = title + '|' + detail;
    if (Q.list.some((p) => p.key === key)) return;             // no duplicar lo que ya está esperando
    Q.list.push({ title, detail: detail || '', color, key }); if (Q.list.length > 6) Q.list.splice(0, Q.list.length - 6);
    pump();
  }

  // ------------------------------------------------------------------ torre de posiciones horizontal
  const T = { page: 0, pages: 1, per: 8, lastFlip: 0, prevRank: {}, lastPass: -99 };
  function perPage() {
    const tm = document.querySelector('.broadcast .timing'); if (!tm) return 8;
    if (html.classList.contains('em-portrait')) return 6;
    const head = tm.querySelector('.timing-head'), w = tm.clientWidth - (head ? head.offsetWidth : 0);
    return Math.max(4, Math.min(12, Math.floor(w / 136)));
  }
  function decorateRows() {
    document.querySelectorAll('#standings .driver-row').forEach((row) => {
      const c = state.cars[Number(row.dataset.driver)]; if (!c) return;
      row.setAttribute('role', 'listitem');
      const st = row.querySelector('.stripe'); if (st) { st.textContent = c.driver.number != null ? c.driver.number : ''; st.style.background = hex(c.team.color); st.style.setProperty('--tx', lum(c.team.color) > 150 ? '#0a0f18' : '#fff'); }
      const nm = row.querySelector('.name'); if (nm) { nm.textContent = surname(c.driver); nm.title = c.driver.name + ' · ' + c.team.name; }
      const lg = row.querySelector('.lx-logo'), gp = row.querySelector('.gap'); if (lg && gp && lg.nextElementSibling !== gp) row.insertBefore(lg, gp);
    });
  }
  function flagState() {
    if (state.redFlag) return ['red', 'BANDERA ROJA'];
    if (state.safetyCar) return ['sc', 'SAFETY CAR'];
    if (state.vsc) return ['vsc', 'VIRTUAL SC'];
    if (state.finishes && state.finishes.length) return ['chk', 'BANDERA A CUADROS'];
    if (state.phase === 'race' && state.cars.some((c) => c.state === 'Spin' && !c.dnf)) return ['yellow', 'AMARILLA'];
    if (state.phase === 'race') return ['green', 'VERDE'];
    if (state.phase === 'countdown') return ['grid', 'LARGADA'];
    return ['grid', state.phase === 'finished' ? 'FINAL' : 'PARRILLA'];
  }
  function gapText(c, running) {
    const ahead = state.order[c.rank - 2], leader = state.order[0];
    if (c.dnf) return 'DNF'; if (c.pitStage === 2) return 'PIT';
    if (c.finished) return c.rank === 1 ? 'GANADOR' : '+' + (c.finishTime - state.finishes[0].finishTime).toFixed(3).replace('.', ',');
    if (!running) return c.rank === 1 ? 'POLE' : 'P' + c.rank;
    if (c.rank === 1) return 'LÍDER';
    // intervalo con el de adelante (en la hoja «en foco» y en la página), estilo TV: +0,767
    const lapsDown = leader ? leader.lap - c.lap : 0;
    if (ahead) { const g = Math.max(0, (ahead.s - c.s) / Math.max(22, c.v)); if (g > 99) return '+' + Math.max(1, lapsDown) + 'V'; return '+' + g.toFixed(3).replace('.', ','); }
    return '—';
  }
  function layoutTower(now) {
    const rows = [...document.querySelectorAll('#standings .driver-row')]; if (!rows.length || !state.order.length) return;
    const per = perPage(), others = state.order.slice(1), pages = Math.max(1, Math.ceil(others.length / (per - 1)));
    if (per !== T.per || pages !== T.pages) { T.per = per; T.pages = pages; T.page = Math.min(T.page, pages - 1); }
    if (now - T.lastFlip > 6000) { T.lastFlip = now; if (pages > 1) T.page = (T.page + 1) % pages; }
    const n = per - 1, start = Math.max(0, Math.min(T.page * n, others.length - n)); // la última página se completa con los anteriores
    const vis = new Set([state.order[0], ...others.slice(start, start + n)]);
    const running = state.phase === 'race' || state.phase === 'finished';
    rows.forEach((row) => {
      const c = state.cars[Number(row.dataset.driver)]; if (!c) return;
      const on = vis.has(c), was = !row.classList.contains('tw-off');
      row.classList.toggle('tw-off', !on); row.classList.toggle('tw-lead', c.rank === 1);
      if (on && !was) { row.classList.remove('tw-in'); void row.offsetWidth; row.classList.add('tw-in'); }
      row.style.order = c.rank; row.querySelector('.gap').textContent = gapText(c, running);
      const pr = T.prevRank[c.id]; row.classList.toggle('tw-up', running && pr != null && c.rank < pr);
    });
    const dots = $id('tw-dots'); if (dots) { if (dots.childElementCount !== pages) dots.innerHTML = pages > 1 ? '<i></i>'.repeat(pages) : ''; [...dots.children].forEach((d, i) => d.classList.toggle('on', i === T.page)); }
  }
  function detectPasses() {
    if (state.phase !== 'race') { T.prevRank = {}; return; }
    const now = state.elapsed;
    state.cars.forEach((c) => {
      const pr = T.prevRank[c.id];
      if (pr != null && c.rank < pr && c.rank <= 10 && !c.pitStage && now - T.lastPass > 5) {
        const passed = state.order[c.rank]; // el que quedó justo detrás
        if (passed && !passed.pitStage && !passed.dnf && passed.state !== 'Spin' && T.prevRank[passed.id] === c.rank) {
          T.lastPass = now; plate(c.rank === 1 ? 'CAMBIO DE LÍDER' : 'ADELANTAMIENTO', `${surname(c.driver)} supera a ${surname(passed.driver)} · P${c.rank}`);
        }
      }
    });
    state.cars.forEach((c) => { T.prevRank[c.id] = c.rank; });
  }
  function headUpdate() {
    const leader = state.order[0]; if (!leader) return;
    const lap = state.phase === 'grid' || state.phase === 'countdown' ? 0 : Math.min(CONFIG.laps, leader.lap);
    const ld = $id('lap-display'); if (ld) ld.textContent = lap + '/' + CONFIG.laps;
    const [k, t] = flagState(), fl = $id('flag-label'); if (fl) { fl.className = 'tw-flag ' + k; fl.textContent = t; }
  }
  function mapUpdate() {
    const leader = state.order[0];
    state.cars.forEach((c) => {
      const m = $id('map-car-' + c.id), n = $id('map-num-' + c.id); if (!m) return;
      m.classList.toggle('lead', c === leader); m.classList.toggle('foc', c.id === state.focus);
      m.setAttribute('r', c === leader || c.id === state.focus ? '5' : '3.6');
      if (n) { n.setAttribute('x', +m.getAttribute('cx') + 5.5); n.setAttribute('y', +m.getAttribute('cy') - 4); n.textContent = c.driver.number; n.classList.toggle('lead', c === leader); n.style.display = c.dnf ? 'none' : ''; }
    });
    // el líder y el auto en foco quedan dibujados encima
    const svg = $id('minimap'); if (svg && leader) { const f = $id('map-car-' + state.focus); if (f) svg.appendChild(f); const l = $id('map-car-' + leader.id); if (l) svg.appendChild(l); }
  }

  // ------------------------------------------------------------------ barra de cámaras (iconos + atajos)
  const I = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const CAMS = {
    auto: ['AUTO TV', I('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 3l4 3 4-3"/>')],
    track: ['CIRCUITO', I('<path d="M5 17c-2-3 0-8 4-8 3 0 3 3 6 3 3 0 4 3 3 5s-4 2-7 2-5 0-6-2z"/>')],
    chase: ['PERSECUCIÓN', I('<path d="M4 15l2-5h12l2 5v3H4z"/><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/>')],
    onboard: ['A BORDO', I('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M3.5 10h6.5M14 10h6.5M12 14v7"/>')],
    orbit: ['ORBITAL', I('<ellipse cx="12" cy="12" rx="9" ry="4"/><circle cx="12" cy="12" r="2"/>')],
    drone: ['DRON', I('<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 7l3 3m4 0l3-3M7 17l3-3m4 0l3 3"/><rect x="10" y="10" width="4" height="4"/>')],
    tv: ['TV DINÁMICA', I('<path d="M4 8h11v8H4z"/><path d="M15 11l5-3v8l-5-3"/>')],
    rear: ['TRASERA', I('<path d="M19 12H5m5-5l-5 5 5 5"/>')],
    left: ['LATERAL IZQ.', I('<path d="M11 6l-6 6 6 6M5 12h14"/>')],
    right: ['LATERAL DER.', I('<path d="M13 6l6 6-6 6M19 12H5"/>')]
  };
  const EXTRA = { fx: ['FX TV', I('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>'), 'F'], pip: ['VENTANAS', I('<rect x="3" y="5" width="18" height="14" rx="1"/><rect x="12" y="11" width="7" height="6"/>'), 'V'], motion: ['MOVIMIENTO', I('<path d="M3 12c3-6 6 6 9 0s6 6 9 0"/>'), 'R'] };
  const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  function decorateButtons() {
    const bar = $id('view-controls'); if (!bar) return;
    const cams = [...bar.querySelectorAll('[data-camera]')];
    cams.forEach((b, i) => {
      if (b.dataset.dec) return; const d = CAMS[b.dataset.camera]; if (!d) return; b.dataset.dec = '1'; const k = KEYS[i];
      if (k) b.dataset.key = k;
      b.innerHTML = `${d[1]}<span class="vl">${d[0]}</span>${k ? `<kbd>${k}</kbd>` : ''}`; b.title = d[0] + (k ? ' · tecla ' + k : ''); b.setAttribute('aria-label', d[0]);
    });
    const fx = bar.querySelector('[data-fx]'), pip = $id('pip-toggle');
    const deco = (b, key) => {
      if (!b || b.dataset.dec) return; const d = EXTRA[key]; b.dataset.dec = '1';
      const upd = () => { const txt = (b.dataset.raw || '').replace(/^[^\wÁÉÍÓÚ]+/, '').trim(); b.innerHTML = `${d[1]}<span class="vl">${esc(key === 'fx' ? txt || d[0] : d[0])}</span><kbd>${d[2]}</kbd>`; };
      b.dataset.raw = b.textContent; upd(); b.title = (b.title ? b.title + ' · ' : '') + 'tecla ' + d[2]; b._upd = upd;
      if (key === 'fx') new MutationObserver(() => { if (!b.querySelector('svg')) { b.dataset.raw = b.textContent; upd(); } }).observe(b, { childList: true, characterData: true, subtree: true });
    };
    deco(fx, 'fx'); deco(pip, 'pip');
    if (!$id('motion-toggle')) {
      const m = document.createElement('button'); m.type = 'button'; m.id = 'motion-toggle'; m.title = 'Reducir movimiento de la cámara a bordo'; m.textContent = 'MOVIMIENTO';
      const set = () => { const r = window.LROonboard && LROonboard.reduced; m.classList.toggle('active', !r); m.setAttribute('aria-pressed', String(!r)); };
      m.onclick = () => { if (window.LROonboard) LROonboard.setReduced(!LROonboard.reduced); set(); };
      bar.appendChild(m); deco(m, 'motion'); set();
    }
    if (!bar.querySelector('.vc-sep')) { const first = cams[4]; if (first) { const sep = document.createElement('i'); sep.className = 'vc-sep'; bar.insertBefore(sep, first); } const sep2 = document.createElement('i'); sep2.className = 'vc-sep'; bar.insertBefore(sep2, fx || pip || $id('motion-toggle')); }
    syncToggle();
  }
  function syncToggle() {
    const a = document.querySelector('#view-controls [data-camera].active'), l = $id('cam-toggle-label');
    if (l && a) l.textContent = (CAMS[a.dataset.camera] || [a.textContent])[0];
  }
  function sheet(open) { const bar = $id('view-controls'), t = $id('cam-toggle'); if (!bar) return; bar.classList.toggle('open', open); if (t) t.setAttribute('aria-expanded', String(open)); }

  // ------------------------------------------------------------------ instalación
  function install() {
    if (typeof state === 'undefined' || typeof updateUI !== 'function') return;
    // series (de la cabecera) en la placa izquierda
    const eb = document.querySelector('#screen-race .masthead .eyebrow'); const ser = $id('tw-series');
    const setSeries = () => { if (!eb || !ser) return; const t = eb.textContent.replace($id('rc-round-label') ? $id('rc-round-label').textContent : '', '').trim(); if (t) ser.textContent = t; };
    setSeries();
    const _bs = buildStandings; buildStandings = function () { _bs.apply(this, arguments); decorateRows(); };
    const _bm = buildMap; buildMap = function () {
      _bm.apply(this, arguments);
      const svg = $id('minimap'); if (!svg) return;
      state.cars.forEach((c) => { const t = document.createElementNS('http://www.w3.org/2000/svg', 'text'); t.id = 'map-num-' + c.id; t.setAttribute('class', 'map-num'); svg.appendChild(t); });
    };
    const _ae = addEvent; addEvent = function (title, detail) { _ae.apply(this, arguments); plate(title, detail); };
    const _ui = updateUI; updateUI = function () {
      _ui.apply(this, arguments);
      if (!state.order.length) return;
      const now = performance.now(); detectPasses(); headUpdate(); layoutTower(now); mapUpdate(); setSeries();
    };
    // la torre existente ya está construida: redecorar y agregar números al mapa
    try { buildStandings(); buildMap(); } catch (e) { }
    // barra de cámaras
    decorateButtons(); new MutationObserver(() => { decorateButtons(); syncToggle(); }).observe($id('view-controls'), { childList: true, attributes: true, attributeFilter: ['class'], subtree: true });
    const t = $id('cam-toggle'); if (t) t.onclick = (e) => { e.stopPropagation(); sheet(!$id('view-controls').classList.contains('open')); };
    $id('view-controls').addEventListener('click', (e) => { if (e.target.closest('[data-camera]')) setTimeout(() => sheet(false), 120); });
    document.addEventListener('pointerdown', (e) => { if (!e.target.closest('#view-controls,#cam-toggle')) sheet(false); });
    // mapa ocultable
    const mb = $id('map-box'), mt = $id('map-toggle'); let off = false; try { off = localStorage.getItem('lro_map_off') === '1'; } catch (e) { }
    const setMap = (v) => { off = v; mb.classList.toggle('off', v); mt.setAttribute('aria-pressed', String(!v)); try { localStorage.setItem('lro_map_off', v ? '1' : '0'); } catch (e) { } };
    if (mb && mt) { setMap(off); mt.onclick = (e) => { e.stopPropagation(); setMap(!off); }; }
    // atajos: 1..0 cámaras · F FX · V ventanas · N mapa · R movimiento
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (typeof currentActiveScreen === 'function' && currentActiveScreen() !== 'race') return;
      if (/INPUT|SELECT|TEXTAREA/.test((document.activeElement || {}).tagName)) return;
      if (state.cameraMode === 'drone' && /^[wasdqe]$/i.test(e.key)) return;
      const bar = $id('view-controls'); let b = null;
      if (KEYS.includes(e.key)) b = bar.querySelector(`[data-key="${e.key}"]`);
      else if (/^f$/i.test(e.key)) b = bar.querySelector('[data-fx]');
      else if (/^v$/i.test(e.key)) b = $id('pip-toggle');
      else if (/^r$/i.test(e.key)) b = $id('motion-toggle');
      else if (/^n$/i.test(e.key) && mt) b = mt;
      if (b) { e.preventDefault(); b.click(); }
    });
    // test / consola: forzar una placa
    window.LROui = { plate, queue: Q, tower: T };
  }
  window.addEventListener('load', () => setTimeout(install, 0));
})();
