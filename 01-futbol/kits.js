/* LFO · Diseños de camiseta (compartido por el partido 3D, los cromos y el modo carrera).
   La textura cubre el cilindro del torso: x = vuelta alrededor del cuerpo (x = 0 y x = w son el centro del pecho, w/2 la espalda),
   y = alto (arriba el cuello). Las mangas son mallas aparte y toman el color base.
   LFOKits.paint(ctx, w, h, { kit, trim, pattern })  ·  LFOKits.numberStyle(ap)  ·  LFOKits.PATTERNS [[id, nombre]] */
(function (g) {
  'use strict';
  const PATTERNS = [
    ['plain', 'Lisa'], ['stripes', 'Rayas verticales'], ['pinstripes', 'Rayas finas'], ['hoops', 'Aros horizontales'],
    ['band', 'Banda horizontal'], ['vband', 'Banda vertical'], ['sash', 'Banda diagonal'], ['halves', 'Mitad y mitad'],
    ['quarters', 'Cuartos'], ['checks', 'A cuadros'], ['chevron', 'Chevrón (V)'], ['shoulders', 'Canesú en los hombros'],
    ['sidepanels', 'Paneles laterales'], ['gradient', 'Degradé'], ['geometric', 'Geométrica'],
  ];
  const ids = PATTERNS.map((p) => p[0]);
  // cromos viejos: rayas / banda / lisa
  const LEGACY = { rayas: 'stripes', banda: 'sash', lisa: 'plain' };
  const norm = (p) => (ids.includes(p) ? p : LEGACY[p] || 'plain');

  function rgb(hex) { const h = String(hex || '#888').replace('#', ''); const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h; return [0, 2, 4].map((i) => parseInt(f.substr(i, 2), 16) || 0); }
  const lum = (hex) => { const [r, g2, b] = rgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g2 + 0.0722 * b; };
  const shade = (hex, k) => `rgb(${rgb(hex).map((v) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)))).join(',')})`;

  // Dibuja fn tres veces (x - w, x, x + w) para que lo que cruza el centro del pecho se vea entero.
  function wrap(c, w, fn) { for (const dx of [-w, 0, w]) { c.save(); c.translate(dx, 0); fn(); c.restore(); } }
  function poly(c, pts) { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); }

  const DRAW = {
    plain() {},
    stripes(c, w, h) { const n = 8, sw = w / n; for (let i = 0; i < n; i += 2) c.fillRect(i * sw - sw / 2, 0, sw, h); c.fillRect(w - sw / 2, 0, sw, h); },
    pinstripes(c, w, h) { for (let x = 0; x < w; x += 32) c.fillRect(x - 3, 0, 6, h); },
    hoops(c, w, h) { for (let y = 40; y < h; y += 96) c.fillRect(0, y, w, 48); },
    band(c, w, h) { c.fillRect(0, h * 0.33, w, h * 0.2); },
    vband(c, w, h) { wrap(c, w, () => c.fillRect(-64, 0, 128, h)); },
    sash(c, w, h) { wrap(c, w, () => poly(c, [[-170, 0], [-80, 0], [170, h], [80, h]])); },
    halves(c, w, h) { c.fillRect(w / 2, 0, w / 2, h); },
    quarters(c, w, h) { c.fillRect(w / 2, 0, w / 2, h / 2); c.fillRect(0, h / 2, w / 2, h / 2); },
    checks(c, w, h) { const s = 64; for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) if (((x + y) / s) % 2 === 0) c.fillRect(x, y, s, s); },
    chevron(c, w, h) { wrap(c, w, () => poly(c, [[-190, h * 0.08], [-120, h * 0.08], [0, h * 0.34], [120, h * 0.08], [190, h * 0.08], [0, h * 0.5]])); },
    shoulders(c, w, h) { c.beginPath(); c.moveTo(0, 0); c.lineTo(w, 0); c.lineTo(w, h * 0.2); for (let x = w; x >= 0; x -= 16) c.lineTo(x, h * 0.2 + Math.sin((x / w) * Math.PI * 4) * h * 0.05); c.closePath(); c.fill(); },
    sidepanels(c, w, h) { for (const x of [w / 4, (3 * w) / 4]) c.fillRect(x - 40, 0, 80, h); },
    gradient(c, w, h, a) { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, a.kit); gr.addColorStop(0.35, a.kit); gr.addColorStop(1, a.trim); c.fillStyle = gr; c.fillRect(0, 0, w, h); },
    geometric(c, w, h, a) {
      let s = 17; const r = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
      for (let i = 0; i < 26; i++) { const x = r() * w, y = r() * h, k = 50 + r() * 90; c.globalAlpha = 0.18 + r() * 0.3; c.fillStyle = r() < 0.5 ? a.trim : shade(a.kit, lum(a.kit) > 0.5 ? -0.25 : 0.25); poly(c, [[x, y], [x + k, y + k * 0.3 * (r() - 0.5)], [x + k * (r() - 0.2), y + k]]); }
      c.globalAlpha = 1;
    },
  };

  function paint(c, w, h, ap) {
    const a = { kit: ap.kit || '#3f7fb5', trim: ap.trim || '#ffffff', pattern: norm(ap.pattern) };
    c.fillStyle = a.kit; c.fillRect(0, 0, w, h);
    c.fillStyle = a.trim; (DRAW[a.pattern] || DRAW.plain)(c, w, h, a);
    // cuello y ribete del bajo con el color secundario
    c.fillStyle = a.pattern === 'plain' ? a.trim : shade(a.kit, lum(a.kit) > 0.5 ? -0.35 : -0.45); c.fillRect(0, 0, w, 12);
    c.fillStyle = a.trim; c.fillRect(0, 12, w, 3);
    // costuras laterales (a los costados del cuerpo)
    for (const x of [w / 4, (3 * w) / 4]) { c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(x - 2, 0, 4, h); }
    // tejido: trama fina y luz suave arriba
    for (let y = 0; y < h; y += 3) { c.fillStyle = 'rgba(255,255,245,.035)'; c.fillRect(0, y, w, 1); }
    for (let x = 0; x < w; x += 9) { c.fillStyle = 'rgba(0,0,0,.028)'; c.fillRect(x, 0, 1, h); }
    const sh = c.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, 'rgba(255,255,255,.07)'); sh.addColorStop(0.6, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.14)');
    c.fillStyle = sh; c.fillRect(0, 0, w, h);
  }

  // Color del número: el que más contrasta con lo que hay detrás (base en la espalda), con contorno opuesto.
  function numberStyle(ap) {
    const kit = (ap && ap.kit) || '#3f7fb5', trim = (ap && ap.trim) || '#ffffff', p = norm(ap && ap.pattern);
    const back = ['halves', 'quarters'].includes(p) ? trim : kit; // en la espalda (x = w/2) manda ese color
    const contrast = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
    const cands = [trim, kit, '#ffffff', '#111418'].filter((x) => x !== back);
    const fill = cands.reduce((best, x) => (contrast(x, back) > contrast(best, back) + 1.2 ? x : best), cands[0]);
    const stroke = lum(fill) > 0.45 ? '#0d1116' : '#ffffff';
    return { fill: contrast(fill, back) < 2.2 ? (lum(back) > 0.45 ? '#111418' : '#ffffff') : fill, stroke };
  }

  // Camiseta por defecto cuando el jugador no trae apariencia (partidos de exhibición): usa los colores del equipo.
  function defaultFor(teamIdx, team, gk) {
    if (gk) return { kit: teamIdx === 0 ? '#2f6b4a' : '#c9a640', trim: '#111418', pattern: 'shoulders' };
    return { kit: (team && team.color) || (teamIdx === 0 ? '#e8e6d9' : '#a92e30'), trim: (team && (team.kitTrim || team.colorAlt)) || (teamIdx === 0 ? '#609cbb' : '#202c36'), pattern: (team && team.kitPattern) || (teamIdx === 0 ? 'stripes' : 'pinstripes') };
  }

  g.LFOKits = { PATTERNS, ids, norm, paint, numberStyle, defaultFor };
})(window);
