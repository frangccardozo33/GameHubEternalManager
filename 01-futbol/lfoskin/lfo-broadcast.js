/* =============================================================================
   LFO BROADCAST DIRECTOR (capa de presentación)
   ---------------------------------------------------------------------------
   Qué hace:
     1. Inyecta escudos reales de los equipos en TODAS las gráficas:
        score bug, barra de marcador, lower third de gol, presentación
        pre-partido y alineaciones.
     2. Añade la barra de marcador permanente estilo pack de transmisión
        (logo COPA ONLINE + escudos + marcador + reloj + LIVE + tarjetas).
     3. Añade el ticker inferior con datos del partido.
     4. Transiciones/wipes con el logo de la liga y la copa.
     5. Dos paquetes gráficos:  'lfo' (ACTIVO) y 'cupidite' (DESACTIVADO).
        El de Cupidité está completo pero NO se aplica salvo que se active
        a mano: LFOBroadcast.setPackage('cupidite').
     6. Controles del filtro retro de TV (blur, motion blur, scanlines...).
   No toca la simulación: sólo lee `ht` / `lfoArchive` y escribe en el DOM.
   ========================================================================== */
(function (g) {
  'use strict';

  /* ------------------------------------------------------------ utilidades */
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const H = (s) => { const d = document.createElement('div'); d.innerHTML = s.trim(); return d.firstElementChild; };
  const LOGO = 'equiposfut/ligadefutbolonlinelogo.png';
  const TROPHY = 'equiposfut/copaonline.png';
  const CUP_TROPHY = 'equiposfut/cupidite/icon.png';

  /* =========================================================================
     PAQUETES GRÁFICOS
     ====================================================================== */
  const PACKAGES = {
    lfo: {
      id: 'lfo',
      label: 'LFO · COPA ONLINE',
      enabled: true,
      brand: 'LFD COPA ONLINE',
      channel: 'LFO · TRANSMISIÓN OFICIAL',
      tagline: 'LIGA DE FÚTBOL ONLINE',
      logo: LOGO,
      trophy: TROPHY,
      live: 'EN VIVO',
    },
    // ---- VARIANTE "LA CUPIDITÉ": la activan solos los partidos de la copa (pushPackage / popPackage) ----
    cupidite: {
      id: 'cupidite',
      label: 'LA CUPIDITÉ',
      enabled: true,
      auto: true,                   // no se guarda como preferencia: solo se usa en los partidos de la copa
      goalText: '¡¡¡GOOOOL!!!',
      brand: 'LA CUPIDITÉ',
      channel: 'LA CUPIDITÉ · AD ASTRA PER ASPERA',
      tagline: 'AD ASTRA PER ASPERA',
      logo: CUP_TROPHY,
      trophy: CUP_TROPHY,
      live: 'EN DIRECTO',
    },
  };

  const S = {
    pkg: 'lfo',                     // paquete activo
    allowDisabled: false,           // si true, se permite activar paquetes marcados enabled:false
    bar: null, ticker: null, goalAlert: null,
    lastScore: [-1, -1],
    lastClock: '',
    cards: [[0, 0], [0, 0]],        // [amarillas, rojas] por equipo
    wipeBusy: 0,                    // evita transiciones superpuestas
  };

  /* ---- persistencia de la preferencia (nunca activa un paquete desactivado) */
  try {
    const raw = localStorage.getItem('lfo.bc.pkg');
    if (raw && PACKAGES[raw] && PACKAGES[raw].enabled && !PACKAGES[raw].auto) S.pkg = raw;
  } catch (e) {}

  const P = () => PACKAGES[S.pkg] || PACKAGES.lfo;

  function applyPackage() {
    const p = P();
    document.documentElement.setAttribute('data-lfo-pkg', p.id);
    document.body && document.body.setAttribute('data-lfo-pkg', p.id);
    const tlb = $('tlb'); if (tlb) tlb.setAttribute('data-lfo-pkg', p.id);
    // Reetiqueta la marca visible de la transmisión
    document.querySelectorAll('.tlb-tvbrand').forEach((el) => { el.textContent = p.channel; });
    const wm = document.querySelector('.broadcast-watermark span');
    if (wm && /VIVO|DIRECTO/i.test(wm.textContent)) wm.textContent = p.live + ' · ' + p.tagline;
    rebuildBar();
  }

  /** Cambia el paquete gráfico.
   *  'cupidite' está marcado como desactivado: sólo se aplica con force=true. */
  function setPackage(id, force) {
    const p = PACKAGES[id];
    if (!p) { console.warn('[LFO] paquete desconocido:', id); return false; }
    if (!p.enabled && !force && !S.allowDisabled) {
      console.info('[LFO] el paquete "' + id + '" está desactivado. ' +
        'Para probarlo: LFOBroadcast.setPackage("' + id + '", true)');
      return false;
    }
    S.pkg = id;
    if (!p.auto) { try { localStorage.setItem('lfo.bc.pkg', id); } catch (e) {} }
    applyPackage();
    return true;
  }

  /** Paquete temporal (partidos de copa): guarda el actual y lo restaura con popPackage(). No toca la preferencia guardada. */
  function pushPackage(id) {
    if (!PACKAGES[id]) return false;
    if (S.stack == null) S.stack = S.pkg;
    S.pkg = id;
    applyPackage();
    const pk = $('lfo-pkg'); if (pk) pk.value = id;
    return true;
  }
  function popPackage() {
    if (S.stack == null) return false;
    S.pkg = S.stack; S.stack = null;
    applyPackage();
    const pk = $('lfo-pkg'); if (pk) pk.value = S.pkg;
    return true;
  }

  /* =========================================================================
     ACCESO AL ESTADO DEL PARTIDO
     ====================================================================== */
  const M = () => (g.ht || (g.lfoArchive && g.lfoArchive.match) || null);
  function teamOf(t) {
    const m = M(); if (!m || !m.teams || !m.teams[t]) return null;
    return m.teams[t];
  }
  function crestOf(t) {
    const T = teamOf(t);
    if (T && T.crest) return T.crest;
    // fallback: logo de la liga
    return LOGO;
  }
  const shortOf = (t) => { const T = teamOf(t); return (T && (T.short || T.name) || '').toString().slice(0, 3).toUpperCase(); };
  const nameOf = (t) => { const T = teamOf(t); return (T && T.name) || ''; };

  /* =========================================================================
     1. SCORE BUG — escudos + marcador fusionado
     ====================================================================== */
  /* UN SOLO MARCADOR EN PANTALLA (pedido explícito, al revés de como estaba planteado acá: se queda
     el chip nativo .tv-score, arriba a la izquierda, y se retira la barra del pack (.lfo-bc-bar +
     .lfo-bc-ticker) — ambas ya nacen con aria-hidden="true" en rebuildBar() y quedan ocultas por CSS
     (lfo-skin.css). Esta función ya NO oculta/retira .tv-score (eso rompía accesibilidad para nada).
     Corrección: sí sigue haciendo falta para inyectar los escudos de los equipos y fusionar el score
     — lfo-skin.css ya trae el grid (.lfo-bug-crest/.lfo-bug-score) esperando que esto los rellene;
     un intento anterior lo dio por "código muerto" y lo dejó vacío, por eso faltaban los escudos. */
  function enhanceScoreBug() {
    const el = document.querySelector('.tv-score');
    const m = M();
    if (!el || !m) return;
    let hi = el.querySelector('.lfo-bug-crest.home');
    if (!hi) { hi = H('<img class="lfo-bug-crest home" alt="">'); el.appendChild(hi); }
    let ai = el.querySelector('.lfo-bug-crest.away');
    if (!ai) { ai = H('<img class="lfo-bug-crest away" alt="">'); el.appendChild(ai); }
    let sc = el.querySelector('.lfo-bug-score');
    if (!sc) { sc = H('<div class="lfo-bug-score"><span class="h">0</span><i>—</i><span class="a">0</span></div>'); el.appendChild(sc); }
    const ch = crestOf(0), ca = crestOf(1);
    if (hi.getAttribute('src') !== ch) hi.setAttribute('src', ch);
    if (ai.getAttribute('src') !== ca) ai.setAttribute('src', ca);
    hi.alt = nameOf(0); ai.alt = nameOf(1);
    const th = document.getElementById('tv-home'), ta = document.getElementById('tv-away');
    const hSpan = sc.querySelector('.h'), aSpan = sc.querySelector('.a');
    if (th && hSpan && hSpan.textContent !== th.textContent) hSpan.textContent = th.textContent;
    if (ta && aSpan && aSpan.textContent !== ta.textContent) aSpan.textContent = ta.textContent;
    document.body.classList.add('lfo-bug-ready');
  }

  /* =========================================================================
     2. BARRA DE MARCADOR PERMANENTE (estilo del pack de transmisión)
     ====================================================================== */
  function rebuildBar() {
    const vp = $('viewport'); if (!vp) return;
    const p = P();
    if (S.bar) S.bar.remove();
    S.bar = H(`
      <div class="lfo-bc-bar" aria-hidden="true">
        <div class="bar-top"><i></i><b>${esc(p.brand)}</b><i></i></div>
        <div class="bar-main">
          <div class="bc-team home"><img alt=""><span></span></div>
          <div class="bc-score"><u>0</u><em>—</em><u>0</u></div>
          <div class="bc-team away"><img alt=""><span></span></div>
        </div>
        <div class="bar-clock">
          <div class="bc-cards home"></div>
          <div class="bc-clock">00:00</div>
          <div class="bc-per">PRE</div>
          <div class="bc-live">${esc(p.live)}</div>
          <div class="bc-cards away"></div>
        </div>
      </div>`);
    vp.appendChild(S.bar);

    if (S.ticker) S.ticker.remove();
    S.ticker = H(`
      <div class="lfo-bc-ticker" aria-hidden="true">
        <div class="tk-brand"><i></i>${esc(p.brand)}</div>
        <div class="tk-body"><div></div></div>
        <div class="tk-clock">00:00</div>
      </div>`);
    vp.appendChild(S.ticker);
    updateBar(true);
  }

  function cardPips(t) {
    const c = S.cards[t] || [0, 0];
    let out = '';
    for (let i = 0; i < Math.min(4, c[0]); i++) out += '<s class="y"></s>';
    for (let i = 0; i < Math.min(2, c[1]); i++) out += '<s class="r"></s>';
    return out;
  }

  function periodLabel(m) {
    if (!m) return 'PRE';
    if (m.ended) return 'FIN';
    if (!m.started) return 'PRE';
    if (m.half === 1) return '1T';
    return '2T';
  }

  function updateBar(full) {
    const m = M(); if (!m || !S.bar) return;
    const q = (s) => S.bar.querySelector(s);
    const hi = q('.bc-team.home img'), ai = q('.bc-team.away img');
    const ch = crestOf(0), ca = crestOf(1);
    if (hi && hi.getAttribute('src') !== ch) hi.setAttribute('src', ch);
    if (ai && ai.getAttribute('src') !== ca) ai.setAttribute('src', ca);
    if (full) {
      q('.bc-team.home span').textContent = shortOf(0) || 'LOC';
      q('.bc-team.away span').textContent = shortOf(1) || 'VIS';
    }
    const u = S.bar.querySelectorAll('.bc-score u');
    if (u[0]) u[0].textContent = m.score[0];
    if (u[1]) u[1].textContent = m.score[1];
    const clk = m.clock ? m.clock() : '00:00';
    q('.bc-clock').textContent = clk;
    q('.bc-per').textContent = periodLabel(m);
    q('.bc-live').style.opacity = (m.started && !m.ended) ? '1' : '.35';
    // tarjetas desde las estadísticas del motor
    try {
      const st = m.stats || m.st;
      if (st && st[0]) S.cards = [[st[0].yellow | 0, st[0].red | 0], [st[1].yellow | 0, st[1].red | 0]];
    } catch (e) {}
    q('.bc-cards.home').innerHTML = cardPips(0);
    q('.bc-cards.away').innerHTML = cardPips(1);
    // visibilidad: escondida durante pre/post show y repeticiones a pantalla
    const hide = !!document.querySelector('.tlb-pre, .tlb-post');
    S.bar.hidden = hide;
    if (S.ticker) { S.ticker.hidden = hide || !m.started; updateTicker(clk); }
  }

  let tickerKey = '';
  function updateTicker(clk) {
    const m = M(); if (!m || !S.ticker) return;
    S.ticker.querySelector('.tk-clock').textContent = clk;
    const st = m.stats || m.st || [{}, {}];
    const pos = (() => {
      try {
        const a = m.possession ? m.possession[0] : (st[0].possession || 50);
        return [Math.round(a), 100 - Math.round(a)];
      } catch (e) { return [50, 50]; }
    })();
    const items = [
      `<span><b>${esc(nameOf(0))}</b> ${m.score[0]} — ${m.score[1]} <b>${esc(nameOf(1))}</b></span>`,
      `<span>POSESIÓN <b>${pos[0]}%</b> · <b>${pos[1]}%</b></span>`,
      `<span>REMATES <b>${st[0].shots | 0}</b> · <b>${st[1].shots | 0}</b></span>`,
      `<span>AL ARCO <b>${st[0].onTarget | 0}</b> · <b>${st[1].onTarget | 0}</b></span>`,
      `<span>FALTAS <b>${st[0].fouls | 0}</b> · <b>${st[1].fouls | 0}</b></span>`,
      `<span>TARJETAS <b>${S.cards[0][0]}A/${S.cards[0][1]}R</b> · <b>${S.cards[1][0]}A/${S.cards[1][1]}R</b></span>`,
      `<span><b>${esc(P().tagline)}</b></span>`,
    ];
    const key = items.join('');
    if (key === tickerKey) return;
    tickerKey = key;
    // duplicado para el loop continuo
    S.ticker.querySelector('.tk-body > div').innerHTML = items.join('') + items.join('');
  }

  /* =========================================================================
     3. ESCUDOS EN LAS GRÁFICAS DEL TLB (lower third, alineaciones, intro)
     ====================================================================== */
  function decorateLower(node) {
    if (!node || node.querySelector('.lfo-gl-crest')) return;
    // deduce el equipo por el color de la tarjeta (--tc) comparando con los equipos
    const m = M(); if (!m) return;
    let team = 0;
    try {
      const tc = (node.style.getPropertyValue('--tc') || '').trim().toLowerCase();
      if (tc && m.teams[1] && (m.teams[1].color || '').toLowerCase() === tc) team = 1;
    } catch (e) {}
    const img = H(`<img class="lfo-gl-crest" src="${esc(crestOf(team))}" alt="">`);
    const info = node.querySelector('.tlb-glinfo');
    if (info) node.insertBefore(img, info); else node.appendChild(img);
  }

  function decorateLineup(node) {
    // node = .tlb-lp ; su cabecera recibe el escudo del equipo
    const head = node.querySelector('.tlb-lp-h');
    if (!head || head.querySelector('.lfo-lp-crest')) return;
    const m = M(); if (!m) return;
    const nm = (head.querySelector('b') || {}).textContent || '';
    let team = 0;
    if (m.teams[1] && nm.trim() === String(m.teams[1].name).trim()) team = 1;
    head.insertAdjacentHTML('afterbegin', `<img class="lfo-lp-crest" src="${esc(crestOf(team))}" alt="">`);
  }

  function decorateIntro(node) {
    // node = .tlb-intro : añade la copa de fondo + el enfrentamiento con escudos
    if (node.querySelector('.lfo-intro-trophy')) return;
    node.insertAdjacentHTML('afterbegin', `<div class="lfo-intro-trophy"></div>`);
    const title = node.querySelector('.tlb-intro-title') || node;
    if (!node.querySelector('.lfo-vs')) {
      title.insertAdjacentHTML('afterend', `
        <div class="lfo-vs">
          <div class="lfo-vs-side a">
            <img src="${esc(crestOf(0))}" alt=""><b>${esc(nameOf(0))}</b><small>LOCAL</small>
          </div>
          <div class="lfo-vs-mid">VS</div>
          <div class="lfo-vs-side b">
            <img src="${esc(crestOf(1))}" alt=""><b>${esc(nameOf(1))}</b><small>VISITANTE</small>
          </div>
        </div>`);
    }
    // el h1 original duplica los nombres: lo reducimos a la marca de la liga
    const sm = node.querySelector('.tlb-intro-title small');
    if (sm && P().id === 'cupidite') sm.textContent = 'LFO · ' + P().brand + ' · ' + P().tagline;
    const h1 = node.querySelector('h1');
    if (h1 && !h1.dataset.lfoDone) {
      h1.dataset.lfoDone = '1';
      h1.innerHTML = P().id === 'cupidite'
        ? 'LA <span>CUPIDITÉ</span>'
        : 'COPA <span>ONLINE</span>';
    }
  }

  /* --- observador: el TLB crea/destruye nodos constantemente --- */
  function scan(root) {
    root.querySelectorAll ? null : (root = document);
    document.querySelectorAll('.tlb-gl').forEach(decorateLower);
    document.querySelectorAll('.tlb-lp').forEach(decorateLineup);
    document.querySelectorAll('.tlb-intro').forEach(decorateIntro);
    document.querySelectorAll('.tlb-tvbrand').forEach((el) => {
      if (el.dataset.lfoPkg !== P().id) { el.dataset.lfoPkg = P().id; el.textContent = P().channel; }
    });
  }

  /* =========================================================================
     4. TRANSICIONES / WIPES con el logo de la liga
     ====================================================================== */
  /** Transición única del pack: barrido 3D con la copa girando.
   *  Nunca se superpone con otra (guard `S.wipeBusy`) y limpia cualquier
   *  transición previa que hubiera quedado en pantalla. */
  function wipe(ms) {
    const vp = $('viewport'); if (!vp) return;
    const now = performance.now();
    if (now < S.wipeBusy) return;       // ya hay una transición corriendo
    ms = ms || 900;
    S.wipeBusy = now + ms;
    vp.querySelectorAll('.lfo-wipe').forEach((n) => n.remove());
    const el = H(`<div class="lfo-wipe" style="--wpd:${ms}ms">
      <div class="wp-stage">
        <div class="wp-band b1"></div><div class="wp-band b2"></div><div class="wp-band b3"></div>
        <div class="wp-logo"></div>
        <div class="wp-flare"></div>
      </div></div>`);
    vp.appendChild(el);
    // glitch en la señal justo en el corte (se siente como un corte real de TV)
    glitch(0.85);
    setTimeout(() => el.remove(), ms + 120);
  }

  /** Pincha el glitch del shader retro (decae solo en el render loop). */
  function glitch(amount) {
    try {
      const v = g.lfoArchive && g.lfoArchive.view;
      if (v) v.retroGlitch = Math.max(v.retroGlitch || 0, Math.min(1, amount || 0.6));
    } catch (e) {}
  }

  /* =========================================================================
     5. CONTROLES DEL FILTRO RETRO (panel "SEÑAL DE ARCHIVO")
     ====================================================================== */
  const RETRO_DEFAULT = 'tv2011';   // <<< señal por defecto del juego
  const RETRO_PRESETS = {
    tv2011: { label: 'TV 2011 · digital',   style: 1, blur: 0.7,  motion: 0.34, scan: 0.55, curve: 0.45, chroma: 0.45, noise: 0.4, bloom: 0.8, vignette: 0.6, interlace: 0.35, wobble: 0.3 },
    tv2004: { label: 'TV 2004 · analógica', style: 0, blur: 1.15, motion: 0.62, scan: 1, curve: 1, chroma: 1.1, noise: 1, bloom: 1, vignette: 1, interlace: 1, wobble: 1 },
    vhs:    { label: 'VHS gastado',          style: 0, blur: 1.6,  motion: 0.82, scan: 1.15, curve: 1.2, chroma: 1.7, noise: 1.7, bloom: 1.2, vignette: 1.25, interlace: 1.15, wobble: 1.8 },
    clean:  { label: 'Imagen limpia',        style: 2, blur: 0,    motion: 0,    scan: 0, curve: 0, chroma: 0, noise: 0, bloom: 0, vignette: 0, interlace: 0, wobble: 0 },
  };

  function applyRetro(name) {
    const p = RETRO_PRESETS[name] || RETRO_PRESETS[RETRO_DEFAULT];
    const cfg = (g.LFO_RETRO_CFG = g.LFO_RETRO_CFG || {});
    Object.assign(cfg, { enabled: 1, blur: p.blur, motion: p.motion, scan: p.scan, curve: p.curve,
      chroma: p.chroma, noise: p.noise, bloom: p.bloom, vignette: p.vignette,
      interlace: p.interlace, wobble: p.wobble });
    try {
      const v = g.lfoArchive && g.lfoArchive.view;
      if (v) { v.archiveStyle = p.style; if (v.retroCfg) Object.assign(v.retroCfg, cfg); else v.retroCfg = cfg; }
    } catch (e) {}
    document.body.classList.toggle('lfo-crt-off', p.style === 2);
    try { localStorage.setItem('lfo.retro', name); } catch (e) {}
    S.retro = name;
  }

  /** Rehace el selector de "SEÑAL DE ARCHIVO" con los nuevos presets. */
  function upgradeArchiveControls() {
    const sel = $('archive-style'); if (!sel || sel.dataset.lfo) return;
    sel.dataset.lfo = '1';
    sel.innerHTML = Object.keys(RETRO_PRESETS)
      .map((k) => `<option value="${k}">${esc(RETRO_PRESETS[k].label)}</option>`).join('');
    let saved = RETRO_DEFAULT;
    try { const r = localStorage.getItem('lfo.retro'); if (r && RETRO_PRESETS[r]) saved = r; } catch (e) {}
    sel.value = saved;
    sel.addEventListener('change', (e) => { applyRetro(e.target.value); glitch(0.55); });

    // Selector de paquete gráfico junto a la señal
    const wrap = sel.closest('.archive-controls');
    if (wrap && !wrap.querySelector('#lfo-pkg')) {
      const lbl = H(`<label for="lfo-pkg">Gráficas</label>`);
      const pk = H(`<select id="lfo-pkg"></select>`);
      pk.innerHTML = Object.keys(PACKAGES)
        .map((k) => `<option value="${k}"${PACKAGES[k].enabled ? '' : ' disabled'}>${esc(PACKAGES[k].label)}</option>`).join('');
      pk.value = S.pkg;
      pk.addEventListener('change', (e) => { if (S.stack != null) S.stack = null; if (setPackage(e.target.value)) wipe(700); else e.target.value = S.pkg; });
      wrap.appendChild(lbl); wrap.appendChild(pk);
    }
    applyRetro(saved);
  }

  /* =========================================================================
     6. GANCHOS EN EL TLB PARA TRANSICIONES Y GLITCH
     ====================================================================== */
  function hookTLB() {
    if (!g.TLB || g.TLB.__lfoHooked) return;
    g.TLB.__lfoHooked = true;
    // los stingers importantes van acompañados de un corte de señal
    const origStinger = g.TLB.stinger;
    if (typeof origStinger === 'function') {
      g.TLB.stinger = function (kind) {
        if (kind === 'goal' || kind === 'final' || kind === 'half' || kind === 'replay') wipe(kind === 'replay' ? 620 : 860);
        else glitch(0.4);
        const out = origStinger.apply(this, arguments);
        // La Cupidité: la placa de gol dice el grito completo en lugar de "GOL"
        const gt = P().goalText;
        if (gt && kind === 'goal') setTimeout(() => {
          document.querySelectorAll('#tlb .tlb-st.k-goal .tlb-plate b').forEach((b) => { if (!b.dataset.cup) { b.dataset.cup = '1'; b.textContent = gt; } });
        }, 0);
        return out;
      };
    }
  }

  /* =========================================================================
     ARRANQUE
     ====================================================================== */
  function boot() {
    applyPackage();
    rebuildBar();
    upgradeArchiveControls();
    hookTLB();
    scan(document);
    // refresco periódico (el marcador y el TLB cambian constantemente)
    setInterval(() => {
      try { enhanceScoreBug(); updateBar(false); hookTLB(); } catch (e) {}
    }, 220);
    // observador del DOM para decorar gráficas nuevas del TLB
    try {
      new MutationObserver(() => { try { scan(document); } catch (e) {} })
        .observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
    // marca inicial completa
    setTimeout(() => { enhanceScoreBug(); updateBar(true); }, 400);
  }

  /* API pública */
  g.LFOBroadcast = {
    packages: PACKAGES,
    get package() { return S.pkg; },
    setPackage, pushPackage, popPackage,
    /** Habilita el uso de paquetes marcados como desactivados (ej. Cupidité). */
    enableDisabledPackages(v) { S.allowDisabled = v !== false; return S.allowDisabled; },
    retroPresets: RETRO_PRESETS,
    setRetro: applyRetro,
    wipe, glitch,
    refresh() { rebuildBar(); enhanceScoreBug(); scan(document); },
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
