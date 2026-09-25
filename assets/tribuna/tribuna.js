/* Eternal Manager · TRIBUNA — álbum de cromos genérico (básquet, NFL, carreras, MMA).
 *
 * El fútbol tiene su propio "Archivo de tribuna" (01-futbol/collection.js). Este archivo hace lo mismo para los demás
 * módulos con un diseño de carta NORMAL (placeholder): marco por edición según el OVR, bandera de la nación, escudo del
 * club, retrato dibujado con formas simples, nombre, seis estadísticas y estrellas. Todo el arte está en las funciones
 * `art*` y en `drawCard` para que una IA/diseñador lo reemplace (ver assets/tribuna/TRIBUNA_PARA_IA.md).
 *
 *   Tribuna.register(cfg)       cfg = { id, title, sport, accent, logo?, tiers?, statLabels:[[key,label],..6], getCards() }
 *   Tribuna.open(id)            abre el álbum (overlay a pantalla completa)
 *   Tribuna.close()
 *   Tribuna.cardCanvas(id, card)  -> Promise<HTMLCanvasElement> 600×840 (para usar en las pantallas del módulo)
 *
 * card = { id, name, number, pos, posName?, ovr, age, team:{id,name,short,primary,secondary,crest?}, nation,
 *          stats:{key:valor}, info:[[etiqueta, valor], …], skin?: 0-4, stars?: 1-5 }
 */
(function (g) {
  'use strict';
  const BASE = (() => { try { return new URL('.', document.currentScript.src).href; } catch (e) { return ''; } })();
  let ROOT = BASE ? new URL('../', BASE).href : '';          // .../assets/
  const CFG = {};
  const OPT = { useFrames: false, portraitSets: {} };   // ver assets/tribuna/TRIBUNA_PARA_IA.md
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ls = {
    get(k, d) { try { const v = g.localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { g.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const FONT = '"Barlow Condensed","Arial Narrow",Arial,sans-serif';

  // ---- ediciones por OVR (cada módulo puede pasar las suyas en cfg.tiers) ------------------------------------------------
  const TIERS = [
    { id: 'comun', name: 'Común', min: 0, ink: '#3f4a57', paper: '#c9d0d8', glow: '#8b97a5', stars: 1 },
    { id: 'bronce', name: 'Bronce', min: 62, ink: '#6d3f22', paper: '#eec39a', glow: '#cf8447', stars: 2 },
    { id: 'plata', name: 'Plata', min: 72, ink: '#465464', paper: '#e6edf3', glow: '#b6c5d6', stars: 3 },
    { id: 'oro', name: 'Oro', min: 80, ink: '#6f5210', paper: '#ffe38f', glow: '#f2c230', stars: 4 },
    { id: 'elite', name: 'Élite', min: 87, ink: '#17356e', paper: '#bfe0ff', glow: '#4fa7ff', stars: 5 },
    { id: 'leyenda', name: 'Leyenda', min: 93, ink: '#45195f', paper: '#f0c8ff', glow: '#c25cff', stars: 5 },
  ];
  const tierOf = (cfg, ovr) => { const ts = cfg.tiers || TIERS; let t = ts[0]; for (const x of ts) if (ovr >= x.min) t = x; return t; };
  const SKIN = ['#f1c9a5', '#dcae86', '#bd8560', '#8c5a38', '#5a3a24'];

  // ---- imágenes --------------------------------------------------------------------------------------------------------------
  const imgCache = new Map();
  function image(src) {
    if (!src) return Promise.resolve(null);
    if (!imgCache.has(src)) imgCache.set(src, new Promise((res) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }));
    return imgCache.get(src);
  }
  const flagURL = (nation) => (g.LFONations && g.LFONations.flag(nation)) || '';
  const codeOf = (nation) => (g.LFONations ? g.LFONations.code(nation) : String(nation || '').slice(0, 3).toUpperCase());

  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function txt(ctx, s, x, y, size, color, weight = '800', align = 'left', max) { ctx.textAlign = align; ctx.fillStyle = color; ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillText(String(s), x, y, max); }
  function seeded(seed) { let s = seed >>> 0 || 1; return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; }; }
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  // =====================================================================================================================
  //  RETRATOS (PLACEHOLDER): formas simples por deporte. Reemplazar por arte real/renders (ver TRIBUNA_PARA_IA.md).
  // =====================================================================================================================
  function bust(ctx, cx, base, s, card, o) {   // torso + cabeza genérica
    const skin = SKIN[(card.skin != null ? card.skin : hash(String(card.id)) % 5) % 5], p = card.team.primary || '#3b6ea5', q = card.team.secondary || '#f3f0e6';
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(cx, base + 6, s * 0.75, s * 0.09, 0, 0, 6.3); ctx.fill();
    // hombros / camiseta
    ctx.fillStyle = o.torso || p; ctx.beginPath(); ctx.moveTo(cx - s * 0.78, base); ctx.quadraticCurveTo(cx - s * 0.8, base - s * 0.62, cx - s * 0.32, base - s * 0.74); ctx.lineTo(cx + s * 0.32, base - s * 0.74); ctx.quadraticCurveTo(cx + s * 0.8, base - s * 0.62, cx + s * 0.78, base); ctx.closePath(); ctx.fill();
    ctx.fillStyle = q; ctx.beginPath(); ctx.moveTo(cx - s * 0.32, base - s * 0.74); ctx.quadraticCurveTo(cx, base - s * 0.56, cx + s * 0.32, base - s * 0.74); ctx.lineTo(cx + s * 0.2, base - s * 0.74); ctx.quadraticCurveTo(cx, base - s * 0.64, cx - s * 0.2, base - s * 0.74); ctx.closePath(); ctx.fill();
    // cuello y cabeza
    ctx.fillStyle = skin; ctx.fillRect(cx - s * 0.11, base - s * 0.9, s * 0.22, s * 0.2);
    ctx.beginPath(); ctx.ellipse(cx, base - s * 1.08, s * 0.24, s * 0.3, 0, 0, 6.3); ctx.fill();
    if (!o.noHair) { ctx.fillStyle = o.hair || '#241a14'; ctx.beginPath(); ctx.ellipse(cx, base - s * 1.22, s * 0.25, s * 0.16, 0, Math.PI, 6.3); ctx.fill(); }
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.arc(cx - s * 0.09, base - s * 1.08, s * 0.025, 0, 6.3); ctx.arc(cx + s * 0.09, base - s * 1.08, s * 0.025, 0, 6.3); ctx.fill();
    if (card.number != null && o.number !== false) txt(ctx, card.number, cx, base - s * 0.2, s * 0.5, q, '900', 'center');
    ctx.restore();
  }
  const ART = {
    basquet(ctx, card, box) {      // jugador de básquet con aro de fondo
      const [x, y, w, h] = box, cx = x + w / 2;
      ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, y + h * 0.3, w * 0.28, 0, 6.3); ctx.stroke(); ctx.strokeRect(cx - w * 0.13, y + h * 0.1, w * 0.26, h * 0.18);
      bust(ctx, cx, y + h - 6, w * 0.42, card, {});
    },
    nfl(ctx, card, box) {          // casco + hombreras
      const [x, y, w, h] = box, cx = x + w / 2, p = card.team.primary || '#3b6ea5', q = card.team.secondary || '#f3f0e6', base = y + h - 6, s = w * 0.42;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(cx, base + 6, s * 0.9, s * 0.09, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = p; ctx.beginPath(); ctx.moveTo(cx - s * 0.95, base); ctx.quadraticCurveTo(cx - s * 1.0, base - s * 0.55, cx - s * 0.45, base - s * 0.7); ctx.lineTo(cx + s * 0.45, base - s * 0.7); ctx.quadraticCurveTo(cx + s * 1.0, base - s * 0.55, cx + s * 0.95, base); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = q; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(cx - s * 0.9, base - s * 0.2); ctx.lineTo(cx + s * 0.9, base - s * 0.2); ctx.stroke();
      // casco
      ctx.fillStyle = p; ctx.beginPath(); ctx.ellipse(cx, base - s * 1.12, s * 0.5, s * 0.52, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = q; ctx.fillRect(cx - s * 0.05, base - s * 1.64, s * 0.1, s * 0.56);
      ctx.fillStyle = '#20262d'; ctx.beginPath(); ctx.ellipse(cx + s * 0.2, base - s * 1.02, s * 0.36, s * 0.26, 0, -0.6, 2.4); ctx.fill();
      ctx.strokeStyle = '#c9ced4'; ctx.lineWidth = 5; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(cx - s * 0.05, base - s * (1.0 - i * 0.12)); ctx.lineTo(cx + s * 0.58, base - s * (0.98 - i * 0.12)); ctx.stroke(); }
      if (card.number != null) txt(ctx, card.number, cx, base - s * 0.28, s * 0.46, q, '900', 'center');
      ctx.restore();
    },
    carreras(ctx, card, box) {     // casco de piloto + monoplaza estilizado
      const [x, y, w, h] = box, cx = x + w / 2, p = card.team.primary || '#3b6ea5', q = card.team.secondary || '#f3f0e6', base = y + h - 6, s = w * 0.4;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 6; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x, y + h * 0.5 + i * 22); ctx.lineTo(x + w, y + h * 0.28 + i * 22); ctx.stroke(); }
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(cx, base + 6, s * 0.8, s * 0.09, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = p; ctx.beginPath(); ctx.moveTo(cx - s * 0.75, base); ctx.quadraticCurveTo(cx - s * 0.78, base - s * 0.5, cx - s * 0.3, base - s * 0.62); ctx.lineTo(cx + s * 0.3, base - s * 0.62); ctx.quadraticCurveTo(cx + s * 0.78, base - s * 0.5, cx + s * 0.75, base); ctx.closePath(); ctx.fill();
      ctx.fillStyle = q; ctx.fillRect(cx - s * 0.75, base - s * 0.26, s * 1.5, s * 0.1);
      ctx.fillStyle = p; ctx.beginPath(); ctx.arc(cx, base - s * 1.0, s * 0.5, 0, 6.3); ctx.fill();
      ctx.fillStyle = q; ctx.beginPath(); ctx.arc(cx, base - s * 1.0, s * 0.5, Math.PI * 1.1, Math.PI * 1.9); ctx.lineTo(cx, base - s * 1.0); ctx.fill();
      ctx.fillStyle = '#10161c'; rr(ctx, cx - s * 0.42, base - s * 1.08, s * 0.84, s * 0.3, s * 0.12); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.5)'; rr(ctx, cx - s * 0.34, base - s * 1.04, s * 0.3, s * 0.07, s * 0.03); ctx.fill();
      if (card.number != null) txt(ctx, card.number, cx, base - s * 0.14, s * 0.4, '#101418', '900', 'center');
      ctx.restore();
    },
    mma(ctx, card, box) {          // luchador con guantes arriba
      const [x, y, w, h] = box, cx = x + w / 2, p = card.team.primary || '#3b6ea5', q = card.team.secondary || '#f3f0e6', base = y + h - 6, s = w * 0.4;
      const skin = SKIN[(card.skin != null ? card.skin : hash(String(card.id)) % 5) % 5];
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 4; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(cx, y + h * 0.55, w * (0.22 + i * 0.12), h * (0.28 + i * 0.1), 0, 0, 6.3); ctx.stroke(); }
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(cx, base + 6, s * 0.8, s * 0.09, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = skin; ctx.beginPath(); ctx.moveTo(cx - s * 0.7, base); ctx.quadraticCurveTo(cx - s * 0.74, base - s * 0.62, cx - s * 0.3, base - s * 0.74); ctx.lineTo(cx + s * 0.3, base - s * 0.74); ctx.quadraticCurveTo(cx + s * 0.74, base - s * 0.62, cx + s * 0.7, base); ctx.closePath(); ctx.fill();
      ctx.fillStyle = p; ctx.fillRect(cx - s * 0.7, base - s * 0.16, s * 1.4, s * 0.16); ctx.fillStyle = q; ctx.fillRect(cx - s * 0.7, base - s * 0.2, s * 1.4, s * 0.05);
      ctx.fillStyle = skin; ctx.fillRect(cx - s * 0.11, base - s * 0.9, s * 0.22, s * 0.2); ctx.beginPath(); ctx.ellipse(cx, base - s * 1.08, s * 0.24, s * 0.3, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#1a1310'; ctx.beginPath(); ctx.ellipse(cx, base - s * 1.24, s * 0.24, s * 0.13, 0, Math.PI, 6.3); ctx.fill();
      for (const sd of [-1, 1]) { ctx.fillStyle = p; ctx.beginPath(); ctx.arc(cx + sd * s * 0.62, base - s * 0.95, s * 0.2, 0, 6.3); ctx.fill(); ctx.fillStyle = q; ctx.fillRect(cx + sd * s * 0.62 - s * 0.2, base - s * 0.84, s * 0.4, s * 0.08); ctx.fillStyle = skin; ctx.fillRect(cx + sd * s * 0.62 - s * 0.07, base - s * 0.78, s * 0.14, s * 0.3); }
      ctx.restore();
    },
  };

  // =====================================================================================================================
  //  CARTA (PLACEHOLDER de diseño "normal") — 600×840
  // =====================================================================================================================
  async function drawCard(canvas, card, cfg, back) {
    // Un módulo puede dibujar el frente con su propio diseño (cfg.drawFront) para que la carta sea idéntica a la de su Mercado.
    if (!back && typeof cfg.drawFront === 'function') { const done = await cfg.drawFront(canvas, card, cfg); if (done !== false) return canvas; }
    const W = 600, H = 840, ctx = canvas.getContext('2d'); canvas.width = W; canvas.height = H;
    const t = tierOf(cfg, card.ovr), rand = seeded(hash(card.id + t.id));
    ctx.clearRect(0, 0, W, H);
    // fondo con degradé de edición + trama
    ctx.save(); rr(ctx, 6, 6, W - 12, H - 12, 34); ctx.clip();
    const gr = ctx.createLinearGradient(0, 0, W, H); gr.addColorStop(0, t.paper); gr.addColorStop(0.28, t.ink); gr.addColorStop(0.62, t.ink); gr.addColorStop(1, t.paper);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = t.paper + '3a'; ctx.lineWidth = 2; for (let i = -H; i < W + H; i += 34) { ctx.beginPath(); ctx.moveTo(i, H); ctx.lineTo(i + H, 0); ctx.stroke(); }
    for (let i = 0; i < 1600; i++) { ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.07)'; ctx.fillRect(rand() * W, rand() * H, rand() * 2 + 0.5, rand() * 2 + 0.5); }
    if (cfg.tiers === undefined && (t.id === 'elite' || t.id === 'leyenda')) { const rg = ctx.createRadialGradient(W / 2, 330, 40, W / 2, 330, 420); rg.addColorStop(0, t.glow + '66'); rg.addColorStop(1, 'transparent'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
    // marco: si hay arte propio (Tribuna.useFrames = true) se usa tribuna/frames/<deporte>-<edición>.png (600×840, con transparencia)
    const fimg = OPT.useFrames ? await image(`${ROOT}tribuna/frames/${cfg.sport}-${t.id}.png`) : null;
    if (fimg) ctx.drawImage(fimg, 0, 0, W, H);
    else { ctx.lineWidth = 8; ctx.strokeStyle = t.paper; rr(ctx, 8, 8, W - 16, H - 16, 32); ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = t.glow; rr(ctx, 22, 22, W - 44, H - 44, 22); ctx.stroke(); }

    const logo = await image(cfg.logo);
    if (back) {
      ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(ctx, 40, 40, W - 80, H - 80, 20); ctx.fill();
      txt(ctx, card.name.toUpperCase(), 60, 110, 46, '#fff', '900', 'left', 480);
      txt(ctx, `${card.team.name.toUpperCase()} · ${card.pos}`, 60, 148, 22, t.paper, '700', 'left', 480);
      let y = 200; for (const [k, v] of card.info || []) { txt(ctx, k.toUpperCase(), 66, y, 20, t.paper + 'cc', '600'); txt(ctx, v, W - 66, y, 26, '#fff', '800', 'right'); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(60, y + 12, W - 120, 1); y += 46; }
      const all = Object.entries(card.stats || {}); y += 16;
      for (const [k, v] of all.slice(0, 12)) { txt(ctx, k, 66, y, 19, t.paper + 'cc', '600'); txt(ctx, v, 260, y, 24, '#fff', '800', 'right'); y += 34; if (y > H - 120) break; }
      if (logo) ctx.drawImage(logo, W / 2 - 40, H - 120, 80, 80 * logo.height / logo.width);
      txt(ctx, `${cfg.title}`, W / 2, H - 46, 18, t.paper + 'aa', '700', 'center');
      return canvas;
    }

    // banda superior
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.moveTo(40, 40); ctx.lineTo(W - 40, 40); ctx.lineTo(W - 40, 104); ctx.lineTo(120, 104); ctx.lineTo(40, 84); ctx.closePath(); ctx.fill();
    txt(ctx, t.name.toUpperCase(), 62, 84, 40, t.paper, '900', 'left', 330);
    if (logo) { const lh = 58, lw = lh * logo.width / logo.height; ctx.drawImage(logo, W - 56 - lw, 44, lw, lh); }
    // columna izquierda: OVR, posición, bandera, escudo
    txt(ctx, card.ovr, 96, 190, 88, '#fff', '900', 'center');
    txt(ctx, 'OVR', 96, 216, 20, t.paper, '700', 'center');
    ctx.fillStyle = t.paper; rr(ctx, 56, 232, 80, 40, 10); ctx.fill(); txt(ctx, card.pos, 96, 262, 30, t.ink, '900', 'center', 70);
    const fl = await image(flagURL(card.nation));
    if (fl) { const fw = 76, fh = Math.round(fw * fl.height / fl.width); ctx.save(); ctx.shadowColor = '#0009'; ctx.shadowBlur = 6; ctx.drawImage(fl, 58, 290, fw, fh); ctx.restore(); ctx.strokeStyle = t.paper; ctx.lineWidth = 2.5; ctx.strokeRect(58, 290, fw, fh); txt(ctx, codeOf(card.nation), 96, 290 + fh + 24, 20, t.paper, '800', 'center'); }
    const cr = await image(card.team.crest);
    const cyc = 410;
    if (cr) { const m = 74, sc = Math.min(m / cr.width, m / cr.height), cw = cr.width * sc, ch = cr.height * sc; ctx.save(); ctx.shadowColor = '#0009'; ctx.shadowBlur = 6; ctx.drawImage(cr, 96 - cw / 2, cyc + (m - ch) / 2, cw, ch); ctx.restore(); }
    else { ctx.fillStyle = card.team.primary || '#446'; ctx.beginPath(); ctx.arc(96, cyc + 36, 34, 0, 6.3); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = card.team.secondary || '#fff'; ctx.stroke(); txt(ctx, card.team.short || '', 96, cyc + 47, 26, card.team.secondary || '#fff', '900', 'center', 56); }

    // retrato
    ctx.save(); rr(ctx, 150, 118, 404, 440, 16); ctx.clip();
    const pg = ctx.createLinearGradient(0, 118, 0, 558); pg.addColorStop(0, 'rgba(255,255,255,.10)'); pg.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = pg; ctx.fillRect(150, 118, 404, 440);
    ctx.fillStyle = (card.team.primary || '#446') + '33'; ctx.fillRect(150, 118, 404, 440);
    txt(ctx, card.number == null ? '' : card.number, 352, 470, 340, t.paper + '30', '900', 'center');
    // retrato: 1) card.portrait (URL) 2) set de retratos genéricos del deporte (Tribuna.portraitSets) 3) placeholder dibujado (ART)
    const set = OPT.portraitSets[cfg.sport] | 0, purl = card.portrait || (set ? `${ROOT}tribuna/portraits/${cfg.sport}/${hash(String(card.id)) % set}.png` : '');
    const pimg = purl ? await image(purl) : null;
    if (pimg) { const sc = Math.min(404 / pimg.width, 440 / pimg.height), pw = pimg.width * sc, ph = pimg.height * sc; ctx.drawImage(pimg, 150 + (404 - pw) / 2, 118 + 440 - ph, pw, ph); }
    else (ART[cfg.sport] || ART.basquet)(ctx, card, [150, 118, 404, 440]);
    ctx.restore(); ctx.strokeStyle = t.paper + '88'; ctx.lineWidth = 2; rr(ctx, 150, 118, 404, 440, 16); ctx.stroke();

    // placa de nombre
    ctx.fillStyle = 'rgba(8,10,12,.82)'; rr(ctx, 40, 574, W - 80, 86, 12); ctx.fill(); ctx.strokeStyle = t.glow; ctx.lineWidth = 2; rr(ctx, 40, 574, W - 80, 86, 12); ctx.stroke();
    txt(ctx, (card.team.name || '').toUpperCase(), 58, 600, 20, t.paper, '700', 'left', W - 116);
    txt(ctx, card.name.toUpperCase(), 58, 646, 46, '#fff', '900', 'left', W - 116);
    // estadísticas
    const st = card.statLabels || cfg.statLabels || [], n = Math.min(6, st.length), cw = (W - 80) / Math.max(1, n);
    st.slice(0, 6).forEach(([k, label], i) => {
      const x = 40 + i * cw; ctx.fillStyle = 'rgba(0,0,0,.4)'; rr(ctx, x + 3, 672, cw - 6, 70, 8); ctx.fill();
      txt(ctx, card.stats && card.stats[k] != null ? card.stats[k] : '—', x + cw / 2, 712, 34, '#fff', '900', 'center');
      txt(ctx, label, x + cw / 2, 733, 15, t.paper, '700', 'center', cw - 8);
    });
    // pie
    const info = (card.info || []).slice(0, 3).map(([k, v]) => `${k} ${v}`).join('  ·  ');
    txt(ctx, info, 56, 780, 18, t.paper, '600', 'left', 320);
    for (let i = 0; i < (card.stars || t.stars || 3); i++) { ctx.fillStyle = t.glow; ctx.beginPath(); const sx = 470 + i * 22, sy = 772; for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 - Math.PI / 2, d = k % 2 ? 4.5 : 10; ctx[k ? 'lineTo' : 'moveTo'](sx + Math.cos(a) * d, sy + Math.sin(a) * d); } ctx.closePath(); ctx.fill(); }
    txt(ctx, `${String(card.serial || 0).padStart(3, '0')} / ${cfg.sport.slice(0, 3).toUpperCase()}`, W - 56, 806, 16, t.paper + 'aa', '700', 'right');
    return canvas;
  }
  async function cardCanvas(id, card, back) {
    const cfg = CFG[id]; if (!cfg) throw new Error('Tribuna: módulo no registrado ' + id);
    const cv = document.createElement('canvas'); await drawCard(cv, card, cfg, !!back); return cv;
  }

  // =====================================================================================================================
  //  ÁLBUM (overlay)
  // =====================================================================================================================
  const CSS = `
#trb{position:fixed;inset:0;z-index:2147483000;background:#0b0f13f2;backdrop-filter:blur(3px);color:#e9eef3;font-family:${FONT};display:none;flex-direction:column}
#trb.on{display:flex}
#trb *{box-sizing:border-box}
#trb header{display:flex;align-items:center;gap:14px;padding:12px 22px;border-bottom:1px solid #ffffff1a;background:linear-gradient(180deg,#141b22,#0d1217)}
#trb header img{height:34px;width:auto}
#trb header h1{margin:0;font-size:26px;letter-spacing:.06em;font-style:italic;font-weight:800;text-transform:uppercase}
#trb header h1 span{color:var(--a)}
#trb header .sp{flex:1}
#trb button{font:700 13px ${FONT};letter-spacing:.1em;text-transform:uppercase;color:#e9eef3;background:#1a232c;border:1px solid #ffffff2b;border-radius:6px;padding:8px 14px;cursor:pointer}
#trb button:hover{border-color:var(--a);color:#fff}
#trb button.on{background:var(--a);color:#0b0f13;border-color:var(--a)}
#trb .bar{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;padding:10px 22px;border-bottom:1px solid #ffffff12}
#trb .bar input,#trb .bar select{font:600 14px ${FONT};color:#e9eef3;background:#121a21;border:1px solid #ffffff2b;border-radius:6px;padding:7px 10px;min-width:140px}
#trb .chips{display:flex;gap:6px;flex-wrap:wrap}
#trb .chips button{padding:5px 10px;font-size:12px}
#trb .chips button b{opacity:.7;margin-left:4px}
#trb .body{flex:1;overflow:auto;padding:18px 22px}
#trb .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:16px}
#trb .cardbox{position:relative;cursor:pointer;transition:transform .15s}
#trb .cardbox:hover{transform:translateY(-4px) scale(1.02)}
#trb .cardbox canvas{width:100%;height:auto;display:block;border-radius:12px;box-shadow:0 8px 20px #0009}
#trb .cardbox .fav{position:absolute;right:8px;top:8px;background:#000a;border-radius:50%;width:28px;height:28px;display:grid;place-items:center;font-size:16px;color:#ffd34d;border:1px solid #ffffff44;padding:0}
#trb .empty{padding:60px;text-align:center;color:#8d9aa6;font-size:18px}
#trb .more{display:block;margin:20px auto}
#trb .det{position:fixed;inset:0;background:#000c;display:none;place-items:center;z-index:2}
#trb .det.on{display:grid}
#trb .detbox{display:flex;gap:26px;max-width:960px;width:94vw;max-height:94vh;overflow:auto;background:#10161c;border:1px solid #ffffff22;border-radius:14px;padding:22px}
#trb .detbox canvas{height:min(78vh,700px);width:auto;max-width:46vw;border-radius:14px;box-shadow:0 10px 30px #000b}
#trb .detinfo{flex:1;min-width:240px}
#trb .detinfo h2{margin:0 0 4px;font-size:34px;font-style:italic;text-transform:uppercase}
#trb .detinfo p{margin:0 0 14px;color:#9fb0bf}
#trb .detinfo table{width:100%;border-collapse:collapse;margin-bottom:14px}
#trb .detinfo td{padding:5px 0;border-bottom:1px solid #ffffff14;font-size:16px}
#trb .detinfo td:last-child{text-align:right;font-weight:800}
#trb .acts{display:flex;gap:8px;flex-wrap:wrap}
@media(max-width:700px){#trb .detbox{flex-direction:column}#trb .detbox canvas{max-width:100%;height:auto;width:100%}}
`;
  function ensureDOM() {
    if (g.document.getElementById('trb')) return g.document.getElementById('trb');
    const st = g.document.createElement('style'); st.textContent = CSS; g.document.head.appendChild(st);
    const el = g.document.createElement('div'); el.id = 'trb'; g.document.body.appendChild(el);
    return el;
  }
  const S = { id: null, cards: [], f: { tier: 'all', pos: 'all', team: 'all', q: '', sort: 'ovr', fav: false }, page: 1, favs: [] };
  const PER = 48;

  function filtered(cfg) {
    const f = S.f, q = f.q.trim().toLowerCase();
    let l = S.cards.filter((c) => (f.tier === 'all' || tierOf(cfg, c.ovr).id === f.tier) && (f.pos === 'all' || c.pos === f.pos) && (f.team === 'all' || String(c.team.id) === f.team)
      && (!f.fav || S.favs.includes(c.id)) && (!q || (c.name + ' ' + c.team.name + ' ' + c.nation + ' ' + c.pos).toLowerCase().includes(q)));
    const by = { ovr: (a, b) => b.ovr - a.ovr, name: (a, b) => a.name.localeCompare(b.name, 'es'), team: (a, b) => a.team.name.localeCompare(b.team.name, 'es') || b.ovr - a.ovr, age: (a, b) => a.age - b.age }[f.sort] || ((a, b) => b.ovr - a.ovr);
    return l.sort(by);
  }

  function render() {
    const cfg = CFG[S.id], el = ensureDOM(); el.style.setProperty('--a', cfg.accent || '#f2a03a');
    const tiers = cfg.tiers || TIERS, counts = {}; S.cards.forEach((c) => { const id = tierOf(cfg, c.ovr).id; counts[id] = (counts[id] || 0) + 1; });
    const poss = [...new Set(S.cards.map((c) => c.pos))].sort(), teams = [...new Map(S.cards.map((c) => [String(c.team.id), c.team.name])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'es'));
    const list = filtered(cfg);
    el.innerHTML = `<header>${cfg.logo ? `<img src="${esc(cfg.logo)}" alt="">` : ''}<h1>${esc(cfg.title || 'Tribuna')} <span>· álbum de cromos</span></h1><div class="sp"></div><span style="color:#8d9aa6">${S.cards.length} cromos · ${S.favs.length} favoritos</span><button data-a="close">Cerrar ✕</button></header>
      <div class="bar"><div class="chips"><button data-tier="all" class="${S.f.tier === 'all' ? 'on' : ''}">Todas <b>${S.cards.length}</b></button>${tiers.map((t) => `<button data-tier="${t.id}" class="${S.f.tier === t.id ? 'on' : ''}">${esc(t.name)} <b>${counts[t.id] || 0}</b></button>`).join('')}</div>
      <select data-k="pos"><option value="all">Todas las posiciones</option>${poss.map((p) => `<option ${S.f.pos === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>
      <select data-k="team"><option value="all">Todos los equipos</option>${teams.map(([id, n]) => `<option value="${esc(id)}" ${S.f.team === id ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
      <input data-k="q" type="search" placeholder="Buscar jugador, equipo o país…" value="${esc(S.f.q)}">
      <select data-k="sort">${[['ovr', 'Ordenar: OVR'], ['name', 'Nombre'], ['team', 'Equipo'], ['age', 'Edad']].map(([v, l]) => `<option value="${v}" ${S.f.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <button data-a="fav" class="${S.f.fav ? 'on' : ''}">★ Favoritos</button></div>
      <div class="body"><div class="grid" id="trbgrid"></div>${list.length ? '' : '<div class="empty">No hay cromos con esos filtros.</div>'}${list.length > S.page * PER ? '<button class="more" data-a="more">Ver más</button>' : ''}</div>
      <div class="det" id="trbdet"></div>`;
    const grid = el.querySelector('#trbgrid'), shown = list.slice(0, S.page * PER);
    shown.forEach((c, i) => {
      const box = g.document.createElement('div'); box.className = 'cardbox'; box.dataset.i = i; const cv = g.document.createElement('canvas'); cv.width = 300; cv.height = 420; box.appendChild(cv);
      const fv = g.document.createElement('button'); fv.className = 'fav'; fv.dataset.fav = c.id; fv.textContent = S.favs.includes(c.id) ? '★' : '☆'; box.appendChild(fv); grid.appendChild(box);
      queueDraw(cv, c, cfg);
    });
    el._list = list;
  }
  let drawQ = [], drawing = false;
  function queueDraw(cv, c, cfg) { drawQ.push([cv, c, cfg]); if (!drawing) pump(); }
  async function pump() { drawing = true; while (drawQ.length) { const [cv, c, cfg] = drawQ.shift(); if (!cv.isConnected) continue; try { const tmp = g.document.createElement('canvas'); await drawCard(tmp, c, cfg, false); cv.width = 300; cv.height = 420; cv.getContext('2d').drawImage(tmp, 0, 0, 300, 420); } catch (e) { /* carta sin dibujar */ } await new Promise((r) => setTimeout(r, 0)); } drawing = false; }

  async function detail(card) {
    const cfg = CFG[S.id], det = g.document.getElementById('trbdet'), fv = S.favs.includes(card.id);
    det.classList.add('on'); det.innerHTML = '<div class="detbox"><div style="padding:40px">Dibujando…</div></div>';
    const cv = g.document.createElement('canvas'); await drawCard(cv, card, cfg, false);
    const t = tierOf(cfg, card.ovr);
    det.innerHTML = `<div class="detbox"><div id="trbcv"></div><div class="detinfo"><h2>${esc(card.name)}</h2><p>${esc(card.team.name)} · ${esc(card.pos)}${card.posName ? ' (' + esc(card.posName) + ')' : ''} · ${esc(card.nation)} · edición <b style="color:${t.glow}">${esc(t.name)}</b></p>
      <table>${(card.info || []).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}${Object.entries(card.stats || {}).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>
      <div class="acts"><button data-a="flip">Dar vuelta</button><button data-a="dfav" data-id="${esc(card.id)}">${fv ? '★ Quitar de favoritos' : '☆ Favorito'}</button><button data-a="png">Descargar PNG</button><button data-a="dclose">Cerrar</button></div></div></div>`;
    det.querySelector('#trbcv').appendChild(cv); det._card = card; det._cv = cv; det._back = false;
  }

  function onClick(e) {
    const el = g.document.getElementById('trb'), cfg = CFG[S.id]; if (!el || !cfg) return;
    const b = e.target.closest('button,[data-i]'); if (!b || !el.contains(b)) return;
    const det = g.document.getElementById('trbdet');
    if (b.dataset.a === 'close') return close();
    if (b.dataset.tier) { S.f.tier = b.dataset.tier; S.page = 1; return render(); }
    if (b.dataset.a === 'fav') { S.f.fav = !S.f.fav; S.page = 1; return render(); }
    if (b.dataset.a === 'more') { S.page++; return render(); }
    if (b.dataset.fav) { e.stopPropagation(); toggleFav(b.dataset.fav); b.textContent = S.favs.includes(b.dataset.fav) ? '★' : '☆'; return; }
    if (b.dataset.a === 'dclose') return det.classList.remove('on');
    if (b.dataset.a === 'dfav') { toggleFav(b.dataset.id); return detail(det._card); }
    if (b.dataset.a === 'flip') { det._back = !det._back; return drawCard(det._cv, det._card, cfg, det._back); }
    if (b.dataset.a === 'png') { det._cv.toBlob((bl) => { const a = g.document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = (det._card.name + '-' + S.id + '.png').replace(/\s+/g, '_'); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); }); return; }
    if (b.dataset.i != null && b.classList.contains('cardbox')) return detail(el._list[+b.dataset.i]);
  }
  function toggleFav(id) { const i = S.favs.indexOf(id); if (i >= 0) S.favs.splice(i, 1); else S.favs.push(id); ls.set('tribuna-fav-' + S.id, S.favs); }
  function onChange(e) { const t = e.target; if (!t.dataset || !t.dataset.k || !g.document.getElementById('trb').contains(t)) return; S.f[t.dataset.k] = t.value; S.page = 1; render(); if (t.dataset.k === 'q') { const i = g.document.querySelector('#trb [data-k="q"]'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }

  function open(id) {
    const cfg = CFG[id]; if (!cfg) { console.warn('Tribuna: no registrado', id); return false; }
    S.id = id; S.page = 1; S.favs = ls.get('tribuna-fav-' + id, []);
    let cards = []; try { cards = cfg.getCards() || []; } catch (e) { console.error('Tribuna.getCards falló', e); }
    S.cards = cards.map((c, i) => Object.assign({ serial: i + 1 }, c));
    ensureDOM().classList.add('on'); render();
    if (!open._wired) { open._wired = true; g.document.addEventListener('click', onClick); g.document.addEventListener('change', onChange); g.document.addEventListener('input', (e) => { if (e.target.dataset && e.target.dataset.k === 'q') { clearTimeout(open._t); open._t = setTimeout(() => onChange(e), 250); } }); g.document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && g.document.getElementById('trb') && g.document.getElementById('trb').classList.contains('on')) close(); }); }
    return true;
  }
  function close() { const el = g.document.getElementById('trb'); if (el) el.classList.remove('on'); }

  g.Tribuna = {
    register(cfg) { cfg.sport = cfg.sport || 'basquet'; if (cfg.logo && !/^(https?:|data:|\/)/.test(cfg.logo)) cfg.logo = ROOT + cfg.logo.replace(/^\.\.\/assets\//, ''); CFG[cfg.id] = cfg; return cfg; },
    options: OPT, open, close, cardCanvas, tiers: TIERS, tierOf, ART, tiersWith: (mins) => TIERS.map((t, i) => Object.assign({}, t, { min: mins[i] })), get base() { return ROOT; }, setBase(b) { ROOT = String(b).replace(/\/?$/, '/'); },
    // botón "Tribuna" para meter en la navegación de un módulo
    mount(id, parent, label) { const b = g.document.createElement('button'); b.type = 'button'; b.className = 'tribuna-btn'; b.textContent = label || 'Tribuna'; b.onclick = () => open(id); (parent || g.document.body).appendChild(b); return b; },
  };
})(window);
