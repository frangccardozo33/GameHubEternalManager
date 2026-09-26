/* LFO · Aspecto de los cromos: cortes de pelo, barbas, accesorios y poses extra para el modelo 3D de los jugadores.
   Todo se construye con primitivas de three.js sobre el rig existente (createPlayer): `body`, `head`, brazos y piernas.
   Coordenadas: cabeza centrada en (0, 1.77, 0), radios ≈ (.136, .174, .143); el frente del jugador es +z. */
(function (g) {
  'use strict';
  const PI = Math.PI;

  const HAIR = [
    ['corto', 'Corto'], ['rapado', 'Rapado'], ['largo', 'Largo'],
    ['mohicano', 'Mohicano'], ['afro', 'Afro'], ['rulos', 'Rulos'], ['trenzas', 'Trenzas largas'], ['rastas', 'Rastas'],
    ['melena', 'Melena'], ['colita', 'Colita'], ['mono', 'Rodete alto'], ['rodete', 'Rodete bajo'], ['flequillo', 'Flequillo'],
    ['jopo', 'Jopo'], ['undercut', 'Undercut'], ['degradado', 'Degradado'], ['engominado', 'Engominado'], ['raya', 'Raya al costado'],
    ['puas', 'Púas'], ['media', 'Media melena'], ['taza', 'Taza'], ['corona', 'Corona (calvo)'], ['trencitas', 'Trencitas pegadas'],
    ['buzz', 'Buzz cut'], ['crop', 'French crop'], ['librito', 'Librito (raya al medio)'], ['mullet', 'Mullet moderno'], ['texturizado', 'Texturizado con fade'],
    ['cresta', 'Cresta (faux hawk)'], ['edgar', 'Edgar'], ['rulosfade', 'Rulos con fade'], ['brocoli', 'Rulos con flequillo'], ['twists', 'Twists'],
    ['manbun', 'Man bun'], ['mediacola', 'Media cola'], ['disenio', 'Fade con diseño'], ['hightop', 'High top'],
  ];
  const BEARDS = [
    ['ninguna', 'Sin barba'], ['completa', 'Barba completa'], ['corta', 'Barba corta prolija'], ['sombra', 'Sombra de barba'], ['larga', 'Barba larga'],
    ['vikinga', 'Barba vikinga'], ['canosa', 'Barba canosa'], ['desprolija', 'Barba desprolija'], ['candado', 'Candado'], ['perilla', 'Perilla'],
    ['chivera', 'Chivera larga'], ['chivo', 'Chivo dividido'], ['mosca', 'Mosca'], ['herradura', 'Herradura'], ['anclada', 'Anclada'],
    ['bigote', 'Bigote clásico'], ['manubrio', 'Bigote manubrio'], ['fumanchu', 'Fu Manchú'], ['mostacho', 'Mostacho grueso'], ['patillas', 'Patillas'], ['chuletas', 'Chuletas'],
  ];
  const ACCESSORIES = [
    ['vincha', 'Vincha', 'cabeza'], ['vinchaancha', 'Vincha ancha', 'cabeza'], ['bandana', 'Bandana', 'cabeza'], ['gorrolana', 'Gorro de lana', 'cabeza'], ['gorra', 'Gorra', 'cabeza'],
    ['mascaranariz', 'Máscara protectora de nariz', 'cara'], ['mascarafacial', 'Máscara facial transparente', 'cara'], ['tapabocas', 'Tapabocas', 'cara'],
    ['pinturaojos', 'Pintura bajo los ojos', 'cara'], ['curita', 'Curita en la nariz', 'cara'], ['aros', 'Aros', 'cara'],
    ['snood', 'Cuello térmico', 'cuerpo'], ['cadena', 'Cadena de oro', 'cuerpo'], ['munequera', 'Muñequera', 'cuerpo'], ['brazalete', 'Cinta de capitán', 'cuerpo'],
    ['guantes', 'Guantes', 'cuerpo'], ['mangalarga', 'Mangas largas', 'cuerpo'], ['rodillera', 'Rodillera', 'cuerpo'],
  ];
  const POSES = [
    ['retrato', 'Retrato'], ['carrera', 'Carrera'], ['victoria', 'Victoria'],
    ['cruzado', 'Brazos cruzados'], ['cintura', 'Manos en la cintura'], ['patada', 'Disparo'], ['cabezazo', 'Cabezazo'], ['punos', 'Festejo con puños'],
    ['saludo', 'Saludo'], ['atajada', 'Atajada en vuelo'], ['rodilla', 'Festejo de rodillas'], ['gambeta', 'Gambeta'], ['escudo', 'Señalando el escudo'],
  ];

  const ids = (l) => l.map((x) => x[0]);
  const HEAD = { x: 0.136, y: 0.174, z: 0.143, cy: 1.77 };

  function ctx(T, m, c) {
    const mat = (color, o) => new T.MeshStandardMaterial(Object.assign({ color, roughness: 0.85 }, o || {}));
    const add = (parent, geo, mt, x, y, z, sx, sy, sz, rx, ry, rz) => {
      const o = new T.Mesh(geo, mt);
      o.position.set(x || 0, y || 0, z || 0); o.scale.set(sx == null ? 1 : sx, sy == null ? 1 : sy, sz == null ? 1 : sz); o.rotation.set(rx || 0, ry || 0, rz || 0);
      o.userData.lfoLook = true; parent.add(o); return o;
    };
    return { T, m, c, mat, add, B: m.body };
  }

  // ---------- geometrías base ----------
  const cap = (T, r, th) => new T.SphereGeometry(r, 16, 10, 0, PI * 2, 0, th);
  const ball = (T, r) => new T.SphereGeometry(r, 10, 8);
  const box = (T, w, h, d) => new T.BoxGeometry(w, h, d);
  const cyl = (T, rt, rb, h, open) => new T.CylinderGeometry(rt, rb, h, 12, 1, !!open);
  const cone = (T, r, h) => new T.CylinderGeometry(0, r, h, 6);
  const tube = (T, rt, rb, h) => new T.CylinderGeometry(rt, rb, h, 6);
  // radio de la cabeza a la altura y (elipse)
  const hx = (y) => HEAD.x * Math.sqrt(Math.max(0.05, 1 - Math.pow((y - HEAD.cy) / HEAD.y, 2)));
  const hz = (y) => HEAD.z * Math.sqrt(Math.max(0.05, 1 - Math.pow((y - HEAD.cy) / HEAD.y, 2)));
  // punto sobre el cuero cabelludo (theta desde la coronilla, phi alrededor)
  const scalp = (th, ph, k) => { k = k || 1.06; return [Math.sin(th) * Math.cos(ph) * HEAD.x * k, HEAD.cy + Math.cos(th) * HEAD.y * k, Math.sin(th) * Math.sin(ph) * HEAD.z * k]; };

  // Fitted surfaces and tapered locks, shared by portraits and on-pitch models.
  // No randomness: a saved appearance renders identically in replays and cards.
  function surface(X, rows, cols, point, material) {
    const positions = [], indices = [];
    for (let i = 0; i <= rows; i++) for (let j = 0; j <= cols; j++) positions.push(...point(i / rows, j / cols));
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j, b = a + cols + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const geo = new X.T.BufferGeometry();
    geo.setAttribute('position', new X.T.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices); geo.computeVertexNormals();
    return X.add(X.B, geo, material);
  }
  function lock(X, points, radius, material, taper = 0.18, opt = {}) {
    // Barrido propio (Catmull-Rom + marco por transporte paralelo): el bundle de three.js del juego no trae
    // CatmullRomCurve3 ni TubeGeometry, y sin eso ningún cromo/jugador con pelo largo podía dibujarse.
    const segments = opt.seg || 12, radial = opt.radial || 5, n = points.length, sub = 24;
    const cr = (a, b, c, d, t) => a.map((_, k) => 0.5 * (2 * b[k] + (-a[k] + c[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t * t + (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * t * t * t));
    const at = s => { const i = Math.min(n - 2, Math.max(0, Math.floor(s))), t = s - i; return cr(points[Math.max(0, i - 1)], points[i], points[i + 1], points[Math.min(n - 1, i + 2)], t); };
    const dense = [], cum = [0], total = (n - 1) * sub;
    for (let k = 0; k <= total; k++) { dense.push(at(k / sub)); if (k) cum.push(cum[k - 1] + Math.hypot(...dense[k].map((v, q) => v - dense[k - 1][q]))); }
    const len = cum[total] || 1e-6, pointAt = u => { const want = u * len; let k = 1; while (k < total && cum[k] < want) k++; const f = (want - cum[k - 1]) / Math.max(1e-9, cum[k] - cum[k - 1]); return { p: dense[k - 1].map((v, q) => v + (dense[k][q] - v) * f), t: dense[k].map((v, q) => v - dense[k - 1][q]) }; };
    const norm = v => { const m = Math.hypot(...v) || 1; return v.map(c => c / m); };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const positions = [], indices = [], uvs = [];
    let nrm = null;
    for (let i = 0; i <= segments; i++) {
      const { p, t } = pointAt(i / segments), tan = norm(t), scale = opt.rf ? opt.rf(i / segments) : 1 - (1 - taper) * Math.pow(i / segments, 2.4), r = radius * scale;
      if (!nrm) { const ref = Math.abs(tan[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]; nrm = norm(cross(tan, ref)); }
      else { nrm = norm(cross(cross(tan, nrm), tan)); }
      const bin = cross(tan, nrm);
      for (let j = 0; j <= radial; j++) {
        const th = j / radial * PI * 2, c = Math.cos(th) * r, s = Math.sin(th) * r;
        positions.push(p[0] + c * nrm[0] + s * bin[0], p[1] + c * nrm[1] + s * bin[1], p[2] + c * nrm[2] + s * bin[2]);
        uvs.push(j / radial, i / segments * (opt.vRep || len / 0.25));
      }
    }
    for (let i = 0; i < segments; i++) for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j, b = a + radial + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const geo = new X.T.BufferGeometry();
    geo.setAttribute('position', new X.T.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new X.T.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices); geo.computeVertexNormals(); return X.add(X.B, geo, material || X.hairMat);
  }
  // Nacimiento del pelo en función de a (ángulo alrededor de la cabeza desde el frente +z, positivo hacia +x):
  // frente sobre las cejas, entradas, patilla delante de la oreja, arco sobre la oreja y nuca.
  const HL = [[0, 0.95], [0.1, 0.98], [0.2, 1.1], [0.3, 1.22], [0.37, 1.7], [0.42, 1.72], [0.46, 1.4], [0.55, 1.4], [0.62, 1.9], [0.8, 2.14], [1, 2.2]];
  function smoothTable(t, f) {
    for (let i = 1; i < t.length; i++) if (f <= t[i][0]) { const [f0, v0] = t[i - 1], [f1, v1] = t[i]; return v0 + (v1 - v0) * (1 - Math.cos((f - f0) / (f1 - f0) * PI)) / 2; }
    return t[t.length - 1][1];
  }
  const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
  const hlA = a => smoothTable(HL, Math.abs(wrapA(a)) / PI);
  const hairline = phi => hlA(PI / 2 - phi); // convención de scalp(): phi = 0 → +x, phi = PI/2 → frente
  function fittedCap(X, volume = 0.014, material, boundary = hairline) {
    return surface(X, 14, 40, (v, u) => {
      const phi = u * PI * 2, th = 0.001 + v * boundary(phi), ripple = 0.0016 * Math.cos(phi * 23 + th * 7);
      const r = volume * (0.4 + 0.6 * Math.sin(v * PI / 2)) + ripple;
      return [Math.sin(th) * Math.cos(phi) * (HEAD.x + r), HEAD.cy + Math.cos(th) * (HEAD.y + volume), Math.sin(th) * Math.sin(phi) * (HEAD.z + r)];
    }, material || X.hairMat);
  }
  function curls(X, afro) {
    fittedCap(X, afro ? 0.037 : 0.02);
    for (let i = 0; i < 84; i++) {
      const phi = i * 2.39996, th = Math.acos(1 - (i + 0.5) / 84 * 1.35);
      if (th > hairline(phi)) continue;
      const p = scalp(th, phi, afro ? 1.32 : 1.1), r = afro ? 0.042 : 0.025;
      X.add(X.B, ball(X.T, r), i % 5 ? X.hairMat : X.hairLight, p[0], p[1] + (afro ? 0.012 : 0), p[2], 1, 0.9, 1);
    }
  }
  // ================= peinados v2 =================
  // Casco esculpido (campo de alturas sobre el cráneo, con degradé por color de vértice), cortinas para pelo
  // largo que esquivan cuello y hombros, y mechones colgantes (trenzas, rastas, colitas) que caen por gravedad.
  // Todo determinista: la misma ficha se ve igual en cromos, repeticiones y en la cancha.
  const ss = (e0, e1, x) => { if (e0 === e1) return x < e0 ? 0 : 1; const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const nrm3 = v => { const m = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / m, v[1] / m, v[2] / m]; };
  const yOf = th => HEAD.cy + Math.cos(th) * HEAD.y;
  const onHead = (th, a, off) => [Math.sin(th) * Math.sin(a) * (HEAD.x + off), HEAD.cy + Math.cos(th) * (HEAD.y + off), Math.sin(th) * Math.cos(a) * (HEAD.z + off)];
  const hashN = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); };

  const TEX = {};
  function hairTex(T, kind) {
    if (TEX[kind]) return TEX[kind];
    const cv = document.createElement('canvas'), W = cv.width = 512, H = cv.height = 256, c = cv.getContext('2d');
    let seed = 9; const rnd = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
    c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
    if (kind === 'strand') {
      for (let i = 0; i < 1100; i++) {
        const x = rnd() * W, g = 120 + rnd() * 120 | 0, w = (rnd() - 0.5) * 10;
        c.strokeStyle = `rgba(${g},${g},${g},${0.25 + rnd() * 0.55})`; c.lineWidth = 0.7 + rnd() * 1.8;
        for (const dx of [-W, 0, W]) { c.beginPath(); c.moveTo(x + dx, -4); c.bezierCurveTo(x + dx + w, H * 0.35, x + dx - w, H * 0.65, x + dx, H + 4); c.stroke(); }
      }
    } else if (kind === 'curl') {
      c.fillStyle = '#c8c8c8'; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 2600; i++) {
        const x = rnd() * W, y = rnd() * H, r = 2.5 + rnd() * 5, g = rnd() < 0.5 ? 95 + rnd() * 60 | 0 : 225 + rnd() * 30 | 0;
        c.strokeStyle = `rgb(${g},${g},${g})`; c.lineWidth = 1.2 + rnd() * 1.6;
        c.beginPath(); c.arc(x, y, r, rnd() * 6, rnd() * 6 + 3.6); c.stroke();
      }
    } else if (kind === 'braid') {
      // trenza de tres cabos: chevrones en diagonal que se repiten a lo largo del mechón
      for (let y = -32; y < H + 32; y += 32) for (const side of [0, 1]) {
        const g = c.createLinearGradient(0, y, 0, y + 30); g.addColorStop(0, '#6e6e6e'); g.addColorStop(0.5, '#f4f4f4'); g.addColorStop(1, '#5a5a5a');
        c.fillStyle = g; c.beginPath();
        if (side) { c.moveTo(W / 2, y + 16); c.lineTo(W, y); c.lineTo(W, y + 30); c.lineTo(W / 2, y + 46); }
        else { c.moveTo(0, y); c.lineTo(W / 2, y + 16); c.lineTo(W / 2, y + 46); c.lineTo(0, y + 30); }
        c.closePath(); c.fill();
      }
    }
    const t = new T.CanvasTexture(cv); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
    return (TEX[kind] = t);
  }

  // Campo de alturas sobre el cráneo. o.vol(q) → espesor en metros; o.dens(q) → 0 piel … 1 pelo (degradé);
  // o.edge(a) → hasta dónde baja el pelo; o.soft(a) → cuán gradual es el borde; o.warp(p, q, vol) → deformación final.
  function sculpt(X, o) {
    const rows = o.rows || 30, cols = o.cols || 84, edge = o.edge || hlA, soft = o.soft || (() => 0.16);
    const hc = new X.T.Color(X.c.hair), sk = new X.T.Color(X.c.skin).multiplyScalar(1.08), col = new X.T.Color();
    const pos = [], uv = [], colors = [], idx = [];
    for (let i = 0; i <= rows; i++) for (let j = 0; j <= cols; j++) {
      const a = -PI + 2 * PI * j / cols, e = edge(a), t0 = o.thMin || 0.015, th = t0 + Math.pow(i / rows, 0.92) * (e - t0);
      const b = onHead(th, a, 0), A = Math.abs(a);
      const q = { th, a, A, e, hl: hlA(a), b, y: b[1], top: ss(1.3, 0.3, th), front: ss(1.05, 0.15, A), back: ss(1.9, 2.9, A),
        n: 0.5 + 0.5 * Math.sin(a * 13 + th * 7) * Math.cos(a * 7 - th * 11) * ss(0.05, 0.4, th) };
      const toEdge = e - th, taper = ss(0, soft(a), toEdge);
      const vol = Math.max(0, o.vol(q)) * taper;
      const p = onHead(th, a, 0.0024 + vol);
      if (o.warp) o.warp(p, q, vol);
      pos.push(p[0], p[1], p[2]); uv.push(j / cols * (o.uRep || 4), th * (o.vRep || 0.8));
      const d = Math.max(0, Math.min(1, (o.dens ? o.dens(q) : 1) * lerp(0.25, 1, ss(0, 0.07, toEdge))));
      col.copy(sk).lerp(hc, d); if (o.tint) o.tint(col, q);
      colors.push(col.r, col.g, col.b);
    }
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { const a = i * (cols + 1) + j, b = a + cols + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new X.T.BufferGeometry();
    geo.setAttribute('position', new X.T.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new X.T.Float32BufferAttribute(uv, 2));
    geo.setAttribute('color', new X.T.Float32BufferAttribute(colors, 3));
    geo.setIndex(idx); geo.computeVertexNormals();
    return X.add(X.B, geo, o.mat || X.hairSurf);
  }

  // El pelo que cae no atraviesa cuello ni torso: pasa por detrás de los hombros (o por delante si ya venía por delante).
  function avoidBody(p, pad = 0) {
    if (p[1] < 1.7 && p[1] > 1.4) {
      const r = Math.hypot(p[0], p[2]), R = 0.105 + pad;
      if (r < R) { const k = R / (r || 1e-6); p[0] *= k; p[2] *= k; }
    }
    const top = 1.585;
    if (p[1] < top + 0.04) {
      const ex = 0.29 + pad, ez = 0.195 + pad, u = (p[0] / ex) ** 2 + (p[2] / ez) ** 2;
      if (u < 1) {
        const zb = ez * Math.sqrt(Math.max(0, 1 - Math.min(0.96, (p[0] / ex) ** 2))), s = ss(top + 0.04, top - 0.04, p[1]);
        p[2] = lerp(p[2], (p[2] > 0.07 ? 1 : -1) * zb, s);
      }
    }
    return p;
  }

  // Cortina de pelo largo. o.aMin: media apertura para la cara; o.yS/o.yB: largo a los lados/atrás; o.gap/o.flare: volumen.
  function curtain(X, o) {
    const rows = o.rows || 24, cols = o.cols || 60, aMin = o.aMin, th0 = o.th0 || 0.55, gap = o.gap || 0.016, flare = o.flare || 0.03;
    const hc = new X.T.Color(X.c.hair), lt = hc.clone().lerp(new X.T.Color('#c9b394'), 0.16), col = new X.T.Color();
    const pos = [], uv = [], colors = [], idx = [];
    for (let j = 0; j <= cols; j++) {
      const a = aMin + (2 * PI - 2 * aMin) * j / cols, A = Math.abs(wrapA(a));
      const yEnd = lerp(o.yS, o.yB, ss(aMin, PI * 0.95, A)) + 0.02 * Math.sin(a * 11) + 0.012 * Math.sin(a * 23 + 1) - (o.jag || 0) * hashN(j, 3);
      const poly = [];
      for (let k = 0; k <= 10; k++) { const th = lerp(th0, 1.62, k / 10); poly.push(onHead(th, a, gap + flare * ss(th0, 1.62, th) * 0.6)); }
      const w = poly[10], ny = Math.max(2, Math.ceil((w[1] - yEnd) / 0.02));
      for (let k = 1; k <= ny; k++) {
        const t = k / ny, f = 1 + flare * 3.2 * Math.sin(t * PI * 0.6) * (o.bell || 1);
        poly.push(avoidBody([w[0] * f, lerp(w[1], yEnd, t), w[2] * f - (o.tuck || 0) * t], 0.012));
      }
      const cum = [0]; for (let k = 1; k < poly.length; k++) cum.push(cum[k - 1] + Math.hypot(poly[k][0] - poly[k - 1][0], poly[k][1] - poly[k - 1][1], poly[k][2] - poly[k - 1][2]));
      const L = cum[cum.length - 1];
      for (let i = 0; i <= rows; i++) {
        const want = i / rows * L; let k = 1; while (k < poly.length - 1 && cum[k] < want) k++;
        const f = (want - cum[k - 1]) / Math.max(1e-9, cum[k] - cum[k - 1]), P = poly[k - 1].map((v, q) => v + (poly[k][q] - v) * f);
        pos.push(P[0], P[1], P[2]); uv.push(j / cols * 5, want * 2.2);
        col.copy(hc).lerp(lt, ss(0.55, 1, i / rows) * 0.8).multiplyScalar(lerp(0.78, 1, ss(0, 0.25, i / rows)));
        colors.push(col.r, col.g, col.b);
      }
    }
    for (let j = 0; j < cols; j++) for (let i = 0; i < rows; i++) { const a = j * (rows + 1) + i, b = a + rows + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new X.T.BufferGeometry();
    geo.setAttribute('position', new X.T.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new X.T.Float32BufferAttribute(uv, 2));
    geo.setAttribute('color', new X.T.Float32BufferAttribute(colors, 3));
    geo.setIndex(idx); geo.computeVertexNormals();
    return X.add(X.B, geo, X.sheetMat);
  }

  // Recorrido de un mechón colgante desde la raíz: sale del cuero cabelludo, cae por gravedad y se apoya sobre cabeza y hombros.
  function hang(root, n, len, pad = 0.012, back = 0.3) {
    const pts = [root.slice()], step = 0.016;
    let p = root.slice(), v = nrm3([n[0], n[1] * 0.6 + 0.15, n[2] - back]);
    for (let d = 0; d < len; d += step) {
      v = nrm3([v[0] * 0.86, v[1] * 0.86 - 0.3, v[2] * 0.86 - back * 0.05]);
      p = [p[0] + v[0] * step, p[1] + v[1] * step, p[2] + v[2] * step];
      const u = (p[0] / (HEAD.x + pad)) ** 2 + ((p[1] - HEAD.cy) / (HEAD.y + pad)) ** 2 + (p[2] / (HEAD.z + pad)) ** 2;
      if (u < 1) { const k = 1 / Math.sqrt(u); p = [p[0] * k, HEAD.cy + (p[1] - HEAD.cy) * k, p[2] * k]; }
      avoidBody(p, pad * 0.6);
      pts.push(p.slice());
    }
    return pts;
  }
  // Raíces repartidas por el cuero cabelludo (filas de th, separación ~sep metros).
  function roots(sep, thMax = 2.1, minTh = 0.2) {
    const out = [];
    for (let th = minTh, r = 0; th < thMax; th += sep / HEAD.y, r++) {
      const n = Math.max(3, Math.round(2 * PI * Math.sin(th) * HEAD.x / sep));
      for (let k = 0; k < n; k++) {
        const a = -PI + (k + (r % 2) * 0.5) / n * 2 * PI;
        if (th < hlA(a) - 0.06) out.push({ th, a, row: r });
      }
    }
    return out;
  }
  function hangingLocks(X, o) {
    const list = roots(o.sep, o.thMax || 2.15, o.minTh || 0.25), maxRow = Math.max(...list.map(r => r.row));
    list.forEach((r, i) => {
      const root = onHead(r.th, r.a, 0.004), n = nrm3([root[0] / HEAD.x, (root[1] - HEAD.cy) / HEAD.y, root[2] / HEAD.z]);
      const layer = 1 - r.row / (maxRow + 1), pad = 0.008 + o.r * 1.1 + layer * o.r * 2.6;
      const len = o.len * (0.9 + 0.2 * hashN(i, 7)) * (Math.abs(r.a) < 0.9 ? o.frontLen || 1 : 1);
      const back = Math.abs(r.a) < 1.1 ? 0.9 : 0.35;
      const pts = hang(root, n, len, pad, back);
      lock(X, pts, o.r * (0.9 + 0.2 * hashN(i, 2)), i % 5 === 0 ? o.mat2 || o.mat : o.mat, 0.5, { seg: o.seg || 18, radial: 6, rf: o.rf && (t => o.rf(t, i)), vRep: len * (o.vDen || 30) });
    });
  }
  function bunAt(X, x, y, z, r) {
    X.add(X.B, new X.T.SphereGeometry(r, 16, 12), X.lockMat, x, y, z, 1, 0.82, 1);
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * PI * 2, c = Math.cos(a) * r * 0.95, s = Math.sin(a) * r * 0.95;
      lock(X, [[x + c, y - r * 0.2, z + s], [x + c * 0.8, y + r * 0.5, z + s * 0.8], [x - s * 0.3, y + r * 0.78, z + c * 0.3]], r * 0.28, X.lockMat, 0.4, { vRep: 0.5 });
    }
  }
  const fadeY = (q, lo, hi) => ss(lo, hi, q.y);
  // Degradé de costados que respeta el pelo de arriba: dens = 1 arriba, baja con la altura en los costados y la nuca.
  const sideFade = (q, lo, hi) => Math.max(fadeY(q, lo, hi), ss(0.95, 0.55, q.th));
  const partGroove = (q, xp, w = 0.006) => (q.b[2] > -0.03 && q.y > 1.84 ? Math.exp(-(((q.b[0] - xp) / w) ** 2)) : 0);
  const fringeEdge = (len, jag = 0.03, span = 1.05, freq = 29) => a => hlA(a) + (len + jag * Math.sin(a * freq) + jag * 0.6 * Math.sin(a * 17 + 2)) * ss(span, span * 0.35, Math.abs(a));
  const bluntFront = (w = 0.025, span = 1.05) => a => (Math.abs(a) < span ? w : 0.16);
  function slickBack(X, lift = 0.012) {
    sculpt(X, { vol: q => 0.006 + 0.008 * q.top + lift * Math.exp(-(((q.th - 0.85) / 0.3) ** 2)) * q.front, vRep: 1.4 });
  }

  const HAIR_FN = {
    // ---- clásicos rehechos ----
    corto(X) {
      sculpt(X, { edge: fringeEdge(0.05, 0.03), vol: q => 0.007 + 0.011 * q.top + 0.005 * q.front * q.top + 0.004 * q.n * q.top, dens: q => lerp(0.72, 1, fadeY(q, 1.68, 1.78)) });
    },
    largo(X) {
      sculpt(X, { vol: q => (0.011 + 0.007 * q.top) * (1 - 0.8 * partGroove(q, 0.012)), dens: q => 1 - 0.45 * partGroove(q, 0.012) });
      curtain(X, { aMin: 0.62, yS: 1.5, yB: 1.36, gap: 0.014, flare: 0.022, th0: 0.45, jag: 0.02 });
    },
    trenzas(X) {
      sculpt(X, { vol: () => 0.003, dens: q => 1 - 0.6 * Math.min(1, Math.pow(Math.abs(Math.sin(q.th * 18)), 10) + 0.8 * Math.pow(Math.abs(Math.sin(q.a * 9)), 10)) });
      hangingLocks(X, { sep: 0.042, r: 0.0095, len: 0.36, mat: X.braidMat, mat2: X.braidMat2, vDen: 6, seg: 22, rf: t => 1 - 0.45 * t ** 3 });
    },
    rastas(X) {
      sculpt(X, { vol: () => 0.006, mat: X.curlSurf });
      hangingLocks(X, { sep: 0.05, r: 0.0135, len: 0.3, mat: X.locMat, mat2: X.locMat2, vDen: 3, seg: 18, rf: (t, i) => (0.86 + 0.14 * Math.sin(t * 19 + i)) * (1 - 0.3 * t ** 2) });
    },
    melena(X) {
      sculpt(X, { vol: q => (0.014 + 0.01 * q.top) * (1 - 0.75 * partGroove(q, -0.03)) + 0.004 * q.n, dens: q => 1 - 0.4 * partGroove(q, -0.03) });
      curtain(X, { aMin: 0.72, yS: 1.6, yB: 1.49, gap: 0.018, flare: 0.034, bell: 1.2, th0: 0.45, jag: 0.03 });
    },
    media(X) {
      sculpt(X, { vol: q => 0.012 + 0.009 * q.top + 0.003 * q.n });
      curtain(X, { aMin: 0.8, yS: 1.67, yB: 1.62, gap: 0.015, flare: 0.026, th0: 0.5, jag: 0.015 });
    },
    colita(X) {
      slickBack(X, 0.008);
      const root = [0, 1.822, -0.163];
      X.add(X.B, cyl(X.T, 0.027, 0.027, 0.014), X.mat('#1c1c1f', { roughness: 0.5 }), root[0], root[1], root[2] - 0.006, 1, 1, 1, PI / 2 + 0.35, 0, 0);
      for (const [dx, dy, r] of [[0, 0, 0.032], [0.013, 0.006, 0.018], [-0.013, 0.006, 0.018], [0, -0.013, 0.019]]) {
        const pts = hang([root[0] + dx, root[1] + dy, root[2] - 0.01], [dx * 8, 0.25, -1], 0.26 - Math.abs(dx) * 3, 0.03, 0);
        lock(X, pts, r, X.lockMat, 0.2, { seg: 16, radial: 7, rf: t => (0.8 + 0.4 * Math.sin(Math.min(1, t * 3) * PI / 2)) * (1 - 0.8 * t ** 1.8) });
      }
    },
    flequillo(X) {
      sculpt(X, { edge: fringeEdge(0.24, 0.03), soft: bluntFront(0.03),
        vol: q => (q.th > q.hl ? 0.009 : 0.012 + 0.01 * q.top + 0.004 * q.n),
        warp: (p, q) => { p[2] += 0.005 * ss(q.hl, q.e, q.th) * q.front; } });
    },
    jopo(X) {
      const pomp = q => 0.056 * Math.exp(-(((q.th - 0.72) / 0.38) ** 2)) * ss(1.2, 0.2, q.A);
      sculpt(X, { vRep: 1.4, vol: q => 0.007 + 0.01 * q.top + pomp(q), dens: q => lerp(0.75, 1, fadeY(q, 1.7, 1.8)),
        warp: (p, q) => { const k = pomp(q); p[2] += k * 0.45; p[1] += k * 0.22; } });
    },
    engominado(X) { X.hairSurf.roughness = 0.3; X.hairSurf.bumpScale = 0.3; slickBack(X, 0.018); },
    raya(X) {
      const xp = -0.045;
      sculpt(X, { vRep: 1.2,
        vol: q => (0.009 + 0.012 * q.top + (q.b[0] > xp ? 0.006 * q.top * q.front : 0)) * (1 - 0.85 * partGroove(q, xp)),
        dens: q => 1 - 0.5 * partGroove(q, xp),
        warp: (p, q) => { if (q.b[0] > xp) p[1] += 0.005 * q.front * q.top; } });
    },
    degradado(X) { sculpt(X, { vol: q => 0.003 + 0.01 * q.top + 0.002 * q.n, dens: q => sideFade(q, 1.7, 1.82) }); },
    undercut(X) {
      sculpt(X, { vRep: 1.3, soft: () => 0.05,
        vol: q => (q.th < 0.98 ? 0.013 + 0.012 * q.front * ss(0.98, 0.5, q.th) : 0.0015),
        dens: q => (q.th < 0.98 ? 1 : 0.3) });
    },
    // ---- estilos modernos ----
    buzz(X) { sculpt(X, { vol: () => 0.0035, dens: q => lerp(0.55, 0.82, fadeY(q, 1.68, 1.8)) }); },
    crop(X) {
      sculpt(X, { edge: fringeEdge(0.12, 0.015), soft: bluntFront(0.02),
        vol: q => 0.005 + 0.013 * q.top + 0.004 * q.n * q.top + (q.th > q.hl ? 0.004 : 0),
        dens: q => (q.th > q.hl - 0.05 && q.A < 1.1 ? 1 : sideFade(q, 1.71, 1.82)),
        warp: (p, q) => { p[2] += 0.004 * ss(q.hl, q.e, q.th) * q.front; } });
    },
    librito(X) {
      sculpt(X, { vRep: 1.1,
        edge: a => hlA(a) + (0.3 + 0.02 * Math.sin(a * 27)) * ss(0.05, 0.4, Math.abs(a)) * ss(1.15, 0.6, Math.abs(a)),
        soft: a => (Math.abs(a) < 1.1 ? 0.03 : 0.16),
        vol: q => (0.013 + 0.012 * q.top) * (1 - 0.85 * partGroove(q, 0, 0.008)),
        dens: q => (q.th > q.hl - 0.05 && q.A < 1.15 ? 1 : sideFade(q, 1.69, 1.79)) * (1 - 0.5 * partGroove(q, 0, 0.008)),
        warp: (p, q) => { const f = ss(q.hl - 0.1, q.e, q.th) * ss(1.15, 0.5, q.A); p[0] += Math.sign(q.a) * 0.012 * f; p[2] += 0.006 * f; } });
    },
    mullet(X) {
      sculpt(X, { edge: fringeEdge(0.07, 0.03), vol: q => 0.006 + 0.016 * q.top + 0.004 * q.n * q.top, dens: q => (q.A > 2.0 ? 1 : sideFade(q, 1.72, 1.82)) });
      curtain(X, { aMin: 2.05, yS: 1.67, yB: 1.56, gap: 0.012, flare: 0.02, th0: 1.0, jag: 0.025, rows: 14, cols: 24 });
    },
    texturizado(X) {
      sculpt(X, { edge: fringeEdge(0.1, 0.05, 1.05, 23), soft: bluntFront(0.04),
        vol: q => 0.005 + 0.021 * q.top * (0.45 + q.n * q.n) + (q.th > q.hl ? 0.004 : 0),
        dens: q => (q.th > q.hl - 0.05 && q.A < 1.1 ? 1 : sideFade(q, 1.7, 1.79)) });
    },
    cresta(X) {
      const ridge = q => Math.exp(-((q.b[0] / 0.045) ** 2)) * ss(1.8, 0.5, q.th);
      sculpt(X, { vol: q => 0.004 + 0.046 * ridge(q) * (0.6 + 0.4 * q.front) + 0.004 * q.n * ridge(q),
        dens: q => Math.max(Math.min(1, ridge(q) * 1.4), sideFade(q, 1.75, 1.87)),
        warp: (p, q) => { p[2] += 0.016 * ridge(q) * q.front; } });
    },
    edgar(X) {
      const edge = a => (Math.abs(a) < 0.95 ? 1.06 : lerp(1.06, hlA(a), ss(0.95, 1.25, Math.abs(a))));
      sculpt(X, { edge, soft: a => (Math.abs(a) < 1 ? 0.012 : 0.16),
        vol: q => 0.006 + 0.016 * ss(1.35, 0.4, q.th),
        dens: q => (q.A < 1.0 && q.th < 1.1 ? 1 : sideFade(q, 1.77, 1.87)) });
    },
    rulosfade(X) {
      const c = q => 0.5 + 0.5 * Math.sin(q.a * 16 + q.th * 21) * Math.sin(q.a * 9 - q.th * 17);
      sculpt(X, { mat: X.curlSurf, edge: fringeEdge(0.06, 0.05, 1, 19), vol: q => 0.006 + 0.03 * q.top * (0.7 + 0.6 * c(q)), dens: q => sideFade(q, 1.72, 1.82) });
    },
    brocoli(X) {
      const c = q => 0.5 + 0.5 * Math.sin(q.a * 16 + q.th * 21) * Math.sin(q.a * 9 - q.th * 17);
      sculpt(X, { mat: X.curlSurf, edge: fringeEdge(0.2, 0.06, 1.1, 19), soft: bluntFront(0.06),
        vol: q => 0.008 + 0.042 * q.top * (0.65 + 0.7 * c(q)) + (q.th > q.hl ? 0.018 * c(q) : 0),
        dens: q => (q.th > q.hl - 0.05 && q.A < 1.1 ? 1 : sideFade(q, 1.75, 1.85)) });
    },
    twists(X) {
      sculpt(X, { mat: X.curlSurf, vol: q => 0.005 + 0.006 * q.top, dens: q => sideFade(q, 1.72, 1.82) });
      roots(0.026, 1.0, 0.05).forEach((r, i) => {
        const p = onHead(r.th, r.a, 0.005), n = nrm3([p[0] / HEAD.x, (p[1] - HEAD.cy) / HEAD.y + 0.8, p[2] / HEAD.z]), L = 0.028 + 0.014 * hashN(i, 4);
        const bend = [0.006 * Math.sin(i * 2.3), -0.004, 0.006 * Math.cos(i * 1.7)];
        lock(X, [p, [p[0] + n[0] * L * 0.55, p[1] + n[1] * L * 0.55, p[2] + n[2] * L * 0.55], [p[0] + n[0] * L + bend[0], p[1] + n[1] * L + bend[1], p[2] + n[2] * L + bend[2]]],
          0.0098, i % 4 ? X.braidMat : X.braidMat2, 0.7, { seg: 6, vRep: 1 });
      });
    },
    manbun(X) {
      sculpt(X, { vRep: 1.4, soft: () => 0.05, vol: q => (q.th < 1.0 ? 0.009 + 0.004 * q.top : 0.0018), dens: q => (q.th < 1.0 ? 1 : lerp(0.2, 0.55, fadeY(q, 1.7, 1.8))) });
      bunAt(X, 0, 1.955, -0.075, 0.046);
    },
    mediacola(X) {
      sculpt(X, { vRep: 1.2, vol: q => 0.011 + 0.008 * q.top });
      curtain(X, { aMin: 0.85, yS: 1.66, yB: 1.6, gap: 0.007, flare: 0.024, th0: 0.9, jag: 0.015 });
      bunAt(X, 0, 1.905, -0.14, 0.036);
    },
    disenio(X) {
      const lines = q => (q.A > 0.9 && q.A < 2.6 ? Math.max(Math.exp(-(((q.y - 1.835 - 0.22 * q.b[2]) / 0.005) ** 2)), Math.exp(-(((q.y - 1.812 - 0.22 * q.b[2]) / 0.005) ** 2)) * ss(2.4, 1.6, q.A)) : 0);
      sculpt(X, { edge: fringeEdge(0.04, 0.02), vol: q => 0.004 + 0.011 * q.top + 0.002 * q.n, dens: q => sideFade(q, 1.7, 1.79) * (1 - 0.95 * lines(q)) });
    },
    hightop(X) {
      sculpt(X, { mat: X.curlSurf, rows: 36, soft: () => 0.1,
        vol: q => 0.006 + 0.086 * ss(1.45, 0.25, q.th),
        dens: q => sideFade(q, 1.74, 1.85),
        warp: p => { if (p[1] > 2.03) p[1] = 2.03 + (p[1] - 2.03) * 0.08; } });
    },
    rapado(X) { fittedCap(X, 0.0025, X.dimHairMat); },
    mohicano(X) {
      const ridge = q => Math.exp(-((q.b[0] / 0.034) ** 2)) * ss(2.1, 1.6, q.th);
      sculpt(X, { soft: () => 0.08, vol: q => 0.0015 + 0.075 * ridge(q) * ss(2.0, 0.6, q.th) + 0.006 * q.n * ridge(q),
        dens: q => Math.max(Math.min(1, ridge(q) * 1.6), 0.18),
        warp: (p, q) => { p[2] -= 0.01 * ridge(q) * q.top; } });
    },
    afro(X) { curls(X, true); }, rulos(X) { curls(X, false); },
    mono(X) { slickBack(X, 0.008); bunAt(X, 0, 1.975, -0.05, 0.05); },
    rodete(X) { slickBack(X, 0.006); bunAt(X, 0, 1.8, -0.185, 0.052); },
    puas(X) {
      fittedCap(X, 0.008);
      for (let i = 0; i < 25; i++) {
        const th = 0.1 + i / 25 * 1.12, ph = i * 2.4, p = scalp(th, ph, 1.03);
        lock(X, [p, [p[0] * 1.14, p[1] + 0.03, p[2] * 1.1], [p[0] * 1.3, p[1] + 0.075, p[2] * 1.27]], 0.018, i % 4 ? X.hairMat : X.hairLight, 0.04);
      }
    },
    taza(X) {
      fittedCap(X, 0.021, null, () => 1.42);
      for (let i = 0; i < 28; i++) {
        const ph = i / 28 * PI * 2;
        lock(X, [scalp(0.55, ph, 1.13), scalp(1.04, ph, 1.16), scalp(1.44, ph, 1.14)], 0.009, i % 3 ? X.hairMat : X.hairLight, 0.3);
      }
    },
    corona(X) { sculpt(X, { thMin: 1.2, rows: 12, soft: () => 0.1, vol: q => 0.005 * ss(1.2, 1.45, q.th), dens: q => ss(1.2, 1.4, q.th) }); },
    trencitas(X) {
      fittedCap(X, 0.002, X.dimHairMat);
      for (let i = -3; i <= 3; i++) {
        const x = i * 0.033, r = Math.sqrt(1 - (x / 0.148) ** 2), pts = [];
        for (let k = 0; k <= 12; k++) {
          const a = 0.45 + k / 12 * 2.5;
          pts.push([x + 0.003 * Math.sin(k * 2.5), 1.77 + Math.sin(a) * 0.181 * r, Math.cos(a) * 0.15 * r]);
        }
        lock(X, pts, 0.01, i % 2 ? X.hairLight : X.hairMat, 0.65);
      }
    },
  };
  function band(X, geoOpen, y, h, color, grow) {
    grow = grow == null ? 0.012 : grow;
    return X.add(X.B, cyl(X.T, 1, 1, h, true), X.mat(color, { side: X.T.DoubleSide }), 0, y, 0, hx(y) + grow, 1, hz(y) + grow);
  }
  // Accessory shells retain the original rig convention (+z is the face).
  function shell(X, mt, hw, t0, t1, cx) {
    return X.add(X.B, new X.T.SphereGeometry(0.162, 24, 16, PI / 2 - hw + (cx || 0), hw * 2, t0, t1 - t0), mt, 0, HEAD.cy, 0, 0.88, 1.12, 0.92);
  }
  function facePoint(phi, theta, grow = 0.005) {
    return [Math.sin(phi) * Math.sin(theta) * (HEAD.x + grow), HEAD.cy + Math.cos(theta) * (HEAD.y + grow), Math.cos(phi) * Math.sin(theta) * (HEAD.z + grow)];
  }
  function beardPatch(X, width = 1.4, length = 0.008, material = X.bMat) {
    // U-shaped upper boundary: cheeks are covered, lips and nose remain unobstructed.
    surface(X, 12, 32, (v, u) => {
      const ph = (u * 2 - 1) * width, top = 2.12 - 0.52 * Math.min(1, Math.abs(ph) / 0.9);
      const th = top + v * (3.04 - top), p = facePoint(ph, th, 0.006 + length * Math.sin(v * PI / 2));
      p[1] -= length * v * v; return p;
    }, material);
    for (let i = 0; i < 27; i++) {
      const ph = (i / 26 * 2 - 1) * width, th = 2.22 - 0.43 * Math.min(1, Math.abs(ph));
      const p = facePoint(ph, th, 0.009);
      lock(X, [p, facePoint(ph, th + 0.23, 0.011 + length * 0.5), facePoint(ph * 0.9, 2.85, 0.007 + length)], 0.0018, X.beardLight, 0.15);
    }
  }
  function moustache(X, kind = 'classic') {
    const thick = kind === 'thick';
    for (const side of [-1, 1]) {
      const pts = [[side * 0.006, 1.732, 0.145], [side * 0.026, 1.731, 0.143], [side * 0.057, 1.716, 0.128]];
      if (kind === 'handle') pts.push([side * 0.075, 1.727, 0.117], [side * 0.077, 1.75, 0.11]);
      if (kind === 'fu' || kind === 'horse') pts.push([side * 0.06, 1.66, 0.12], [side * 0.059, kind === 'fu' ? 1.56 : 1.625, 0.1]);
      lock(X, pts, thick ? 0.021 : 0.011, X.bMat, kind === 'horse' ? 0.65 : 0.12);
      lock(X, pts.map(p => [p[0], p[1] + 0.005, p[2] + 0.008]), 0.0018, X.beardLight, 0.1);
    }
  }
  function longBeard(X, length, split) {
    beardPatch(X, split ? 0.48 : 1.35, 0.016);
    for (let i = -4; i <= 4; i++) {
      const x = i * 0.014, endX = split ? Math.sign(i || 1) * 0.037 : x * 0.3;
      lock(X, [[x, 1.64 + Math.abs(x) * 0.35, 0.108], [x * 0.9, 1.59, 0.11], [endX, 1.61 - length, 0.084]], 0.017, i % 3 ? X.bMat : X.beardLight, 0.06);
    }
  }
  const BEARD_FN = {
    ninguna() {},
    completa(X) { beardPatch(X, 1.45, 0.013); moustache(X); },
    corta(X) { beardPatch(X, 1.35, 0.003); moustache(X); },
    sombra(X) { beardPatch(X, 1.38, 0, X.bMatSoft); },
    larga(X) { longBeard(X, 0.19); moustache(X); },
    vikinga(X) { longBeard(X, 0.25, true); moustache(X, 'thick');
      for (const side of [-1, 1]) X.add(X.B, ball(X.T, 0.017), X.mat('#c9a13b', { metalness: 0.65, roughness: 0.35 }), side * 0.037, 1.4, 0.086, 1, 0.6, 1);
    },
    canosa(X) { X.bMat.color.set('#a9a8a1'); X.beardLight.color.set('#e2e0d8'); beardPatch(X, 1.45, 0.011); moustache(X); },
    desprolija(X) { beardPatch(X, 1.5, 0.022); moustache(X);
      for (let i = 0; i < 15; i++) { const ph = (i / 14 * 2 - 1) * 1.4, p = facePoint(ph, 2.65, 0.026);
        lock(X, [p, [p[0] * 1.08, p[1] - 0.018, p[2]], [p[0] * 1.12, p[1] - 0.03 - 0.01 * Math.sin(i), p[2]]], 0.006, X.bMat);
      }
    },
    candado(X) { beardPatch(X, 0.48, 0.007); moustache(X, 'horse'); },
    perilla(X) { beardPatch(X, 0.4, 0.01); },
    chivera(X) { longBeard(X, 0.13, true); },
    chivo(X) { longBeard(X, 0.17, true); },
    mosca(X) { lock(X, [[0, 1.682, 0.128], [0, 1.67, 0.124], [0, 1.655, 0.115]], 0.012, X.bMat, 0.35); },
    herradura(X) { moustache(X, 'horse'); },
    anclada(X) { beardPatch(X, 0.72, 0.004); moustache(X); BEARD_FN.mosca(X); },
    bigote(X) { moustache(X); }, manubrio(X) { moustache(X, 'handle'); },
    fumanchu(X) { moustache(X, 'fu'); }, mostacho(X) { moustache(X, 'thick'); },
    patillas(X) { for (const side of [-1, 1]) surface(X, 8, 6, (v, u) => facePoint(side * (1.25 + u * 0.23), 1.28 + v * 0.76, 0.006), X.bMat); },
    chuletas(X) { for (const side of [-1, 1]) surface(X, 10, 12, (v, u) => facePoint(side * (0.65 + u * 0.9), 1.53 + v * (0.65 + 0.2 * Math.sin(u * PI)), 0.014), X.bMat); },
  };

  // Batch meshes by material/parent: detailed locks do not add one draw call each.
  function batchLook(X) {
    const groups = new Map();
    X.m.root.traverse(o => {
      if (!o.isMesh || !o.userData.lfoLook || o.geometry.attributes.color) return;
      const key = o.parent.uuid + o.material.uuid + !!o.geometry.attributes.uv;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(o);
    });
    for (const objects of groups.values()) {
      if (objects.length < 2) continue;
      const positions = [], normals = [], uvs = [], parent = objects[0].parent, material = objects[0].material;
      for (const o of objects) {
        const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        o.updateMatrix(); geo.applyMatrix4(o.matrix);
        for (const value of geo.attributes.position.array) positions.push(value);
        for (const value of geo.attributes.normal.array) normals.push(value);
        if (geo.attributes.uv) for (const value of geo.attributes.uv.array) uvs.push(value);
        geo.dispose(); o.geometry.dispose(); o.removeFromParent();
      }
      const geo = new X.T.BufferGeometry();
      geo.setAttribute('position', new X.T.Float32BufferAttribute(positions, 3));
      geo.setAttribute('normal', new X.T.Float32BufferAttribute(normals, 3));
      if (uvs.length) geo.setAttribute('uv', new X.T.Float32BufferAttribute(uvs, 2));
      X.add(parent, geo, material);
    }
  }

  // ---------- accesorios ----------
  const GOLD = '#d4a93a';
  const ACC_FN = {
    vincha(X) { band(X, 0, 1.88, 0.045, X.c.accent, 0.014); },
    vinchaancha(X) { band(X, 0, 1.87, 0.085, X.c.kit, 0.014); },
    bandana(X) {
      band(X, 0, 1.875, 0.07, X.c.accent, 0.014);
      X.add(X.B, ball(X.T, 0.03), X.mat(X.c.accent), 0, 1.875, -0.135); X.add(X.B, box(X.T, 0.035, 0.11, 0.008), X.mat(X.c.accent), -0.02, 1.8, -0.145, 1, 1, 1, 0, 0, 0.2); X.add(X.B, box(X.T, 0.035, 0.09, 0.008), X.mat(X.c.accent), 0.025, 1.81, -0.145, 1, 1, 1, 0, 0, -0.25);
    },
    gorrolana(X) {
      const mt = X.mat(X.c.kit, { roughness: 0.95 });
      X.add(X.B, cap(X.T, 0.175, 1.75), mt, 0, 1.8, -0.005, 0.96, 1.08, 1.02);
      X.add(X.B, cyl(X.T, 1, 1, 0.06, true), X.mat(X.c.accent, { side: X.T.DoubleSide }), 0, 1.85, 0, hx(1.85) + 0.02, 1, hz(1.85) + 0.02);
      X.add(X.B, ball(X.T, 0.042), X.mat(X.c.accent), 0, 2.0, -0.005);
    },
    gorra(X) {
      const mt = X.mat(X.c.kit);
      X.add(X.B, cap(X.T, 0.172, 1.62), mt, 0, 1.815, -0.005, 0.95, 0.98, 1.0);
      X.add(X.B, new X.T.CylinderGeometry(0.12, 0.12, 0.012, 16, 1, false, -PI / 2 - 0.1, PI + 0.2), X.mat(X.c.accent), 0, 1.86, 0.11, 1, 1, 0.9, 0.18, 0, 0).position.z += 0.06;
    },
    mascaranariz(X) { shell(X, X.mat('#1d2229', { roughness: 0.4, metalness: 0.4 }), 0.62, 1.62, 2.12); shell(X, X.mat('#e8e6dc'), 0.64, 1.6, 1.65); },
    mascarafacial(X) {
      shell(X, X.mat('#bfe6f2', { transparent: true, opacity: 0.38, roughness: 0.15, metalness: 0.1 }), 1.15, 1.2, 2.55);
      shell(X, X.mat('#1d2229'), 1.16, 1.18, 1.24);
      shell(X, X.mat('#1d2229'), 1.16, 2.5, 2.56);
    },
    tapabocas(X) { shell(X, X.mat('#a9d3e6'), 1.1, 1.78, 2.42); for (const s of [-1, 1]) X.add(X.B, box(X.T, 0.006, 0.01, 0.16), X.mat('#eaeaea'), s * 0.14, 1.74, 0.0); },
    pinturaojos(X) { for (const s of [-1, 1]) X.add(X.B, box(X.T, 0.075, 0.013, 0.008), X.mat('#0d0d0d'), s * 0.052, 1.745, 0.141, 1, 1, 1, 0, s * -0.42, 0); },
    curita(X) { const mt = X.mat('#e9c9a0', { roughness: 0.6 }); X.add(X.B, box(X.T, 0.075, 0.02, 0.012), mt, 0, 1.755, 0.147); X.add(X.B, box(X.T, 0.02, 0.06, 0.012), mt, 0, 1.755, 0.147); },
    aros(X) { for (const s of [-1, 1]) X.add(X.B, ball(X.T, 0.016), X.mat(GOLD, { metalness: 0.7, roughness: 0.3 }), s * 0.137, 1.735, 0.0); },
    snood(X) { X.add(X.B, cyl(X.T, 0.11, 0.12, 0.13, true), X.mat(X.c.accent, { side: X.T.DoubleSide }), 0, 1.6, 0.0, 1, 1, 1); },
    cadena(X) {
      const gm = X.mat(GOLD, { metalness: 0.8, roughness: 0.25 });
      for (let k = 0; k < 20; k++) { const a = (k / 20) * PI * 2, sag = Math.max(0, Math.sin(a)) * 0.07; X.add(X.B, ball(X.T, 0.0085), gm, Math.cos(a) * 0.13, 1.565 - sag, Math.sin(a) * 0.115 * 1.08); }
      X.add(X.B, ball(X.T, 0.028), gm, 0, 1.485, 0.15);
    },
    munequera(X) { X.add(X.m.leftArm.lower, cyl(X.T, 0.074, 0.07, 0.05), X.mat('#f4f4f0'), 0, -0.19, 0.02); X.add(X.m.rightArm.lower, cyl(X.T, 0.074, 0.07, 0.05), X.mat('#f4f4f0'), 0, -0.19, 0.02); },
    brazalete(X) { X.add(X.m.leftArm.pivot, cyl(X.T, 0.104, 0.098, 0.065), X.mat('#ffd23a'), 0, -0.13, 0); },
    guantes(X) {
      const mt = X.mat('#ffe14a', { roughness: 0.6 });
      for (const a of [X.m.leftArm, X.m.rightArm]) { X.add(a.lower, ball(X.T, 0.088), mt, 0, -0.245, 0.02); X.add(a.lower, cyl(X.T, 0.075, 0.075, 0.06), mt, 0, -0.19, 0.02); }
    },
    mangalarga(X) {
      const mt = X.mat(X.c.kit, { roughness: 0.7 });
      for (const a of [X.m.leftArm, X.m.rightArm]) { X.add(a.pivot, cyl(X.T, 0.082, 0.07, 0.2), mt, 0, -0.28, 0); X.add(a.lower, cyl(X.T, 0.072, 0.06, 0.25), mt, 0, -0.115, 0.02); }
    },
    rodillera(X) { X.add(X.m.rightLeg.lower, cyl(X.T, 0.098, 0.092, 0.13), X.mat('#2b2f36', { roughness: 0.7 }), 0, -0.005, 0.01); },
  };

  function decorate(T, m, c) {
    // limpia una decoración anterior del mismo modelo
    const old = []; m.root.traverse((o) => { if (o.userData && o.userData.lfoLook) old.push(o); });
    old.forEach((o) => { o.removeFromParent(); if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    const X = ctx(T, m, c);
    X.hairMat = X.mat(c.hair, { roughness: 0.82, side: T.DoubleSide });
    X.hairLight = X.mat(new T.Color(c.hair).lerp(new T.Color('#ad987b'), 0.13), { roughness: 0.8 });
    X.hairMatDS = X.mat(c.hair, { roughness: 0.9, side: T.DoubleSide });
    const dim = new T.Color(c.hair).lerp(new T.Color(c.skin), 0.55);
    X.dimHairMat = X.mat('#' + dim.getHexString(), { roughness: 0.9 });
    const strand = hairTex(T, 'strand'), curl = hairTex(T, 'curl'), braid = hairTex(T, 'braid'), lighter = new T.Color(c.hair).lerp(new T.Color('#b49f82'), 0.14);
    // Los cascos esculpidos van con cara simple: la cabeza es low-poly y con doble cara se veía el interior del casco en los bordes.
    X.hairSurf = X.mat('#ffffff', { vertexColors: true, map: strand, bumpMap: strand, bumpScale: 0.6, roughness: 0.6 });
    X.curlSurf = X.mat('#ffffff', { vertexColors: true, map: curl, bumpMap: curl, bumpScale: 1.6, roughness: 0.86 });
    X.sheetMat = X.mat('#ffffff', { vertexColors: true, map: strand, bumpMap: strand, bumpScale: 0.6, roughness: 0.6, side: T.DoubleSide });
    X.lockMat = X.mat(c.hair, { map: strand, roughness: 0.62 });
    X.braidMat = X.mat(c.hair, { map: braid, bumpMap: braid, bumpScale: 1.4, roughness: 0.7 });
    X.braidMat2 = X.mat(lighter, { map: braid, bumpMap: braid, bumpScale: 1.4, roughness: 0.7 });
    X.locMat = X.mat(c.hair, { map: curl, bumpMap: curl, bumpScale: 1.2, roughness: 0.92 });
    X.locMat2 = X.mat(lighter, { map: curl, bumpMap: curl, bumpScale: 1.2, roughness: 0.92 });
    X.skinMat = X.mat(c.skin);
    const bc = c.beardColor || c.hair;
    X.bMat = X.mat(bc, { roughness: 0.95, side: T.DoubleSide });
    X.beardLight = X.mat(new T.Color(bc).lerp(new T.Color('#c3b7a4'), 0.16));
    X.bMatSoft = X.mat(new T.Color(c.skin).lerp(new T.Color(bc), 0.35), { roughness: 1, side: T.DoubleSide });
    const orig = m.body.children.find((o) => o.isMesh && Math.abs(o.position.y - 1.82) < 0.001);
    const fn = HAIR_FN[c.hairStyle];
    if (orig && fn) orig.visible = false;
    if (fn) fn(X);
    const bf = BEARD_FN[c.beard]; if (bf) bf(X);
    (c.acc || []).forEach((id) => { const f = ACC_FN[id]; if (f) f(X); });
    batchLook(X);
    const used = new Set(); m.root.traverse(o => { if (o.material) used.add(o.material); });
    for (const value of Object.values(X)) if (value && value.isMaterial && !used.has(value)) value.dispose();
  }

  // ---------- poses extra ----------
  // Devuelve una pista de cámara { dist, look } para que la pose entre en el cuadro.
  const TALL = new Set(['mohicano', 'afro', 'rulos', 'mono', 'jopo', 'puas', 'rastas', 'undercut', 'cresta', 'hightop', 'brocoli', 'manbun']);
  function pose(m, c) {
    const r = poseRig(m, c), tall = TALL.has(c.hairStyle) || (c.acc || []).includes('gorrolana');
    if (tall) { const o = r || {}; o.dist = Math.max(o.dist || 0, 4.3); return o; }
    return r;
  }
  function poseRig(m, c) {
    const p = c.pose, L = m.leftArm, R = m.rightArm, LL = m.leftLeg, RL = m.rightLeg, s = m.root.scale.y;
    const lift = (y) => { m.root.position.y = y; if (m.shadow) m.shadow.visible = false; };
    const tilt = (th) => { const H = 0.94; m.body.rotation.z = th; m.body.position.set(H * Math.sin(th), H * (1 - Math.cos(th)), 0); };
    switch (p) {
      case 'cruzado':
        L.pivot.rotation.set(-0.3, 0, 0.35); R.pivot.rotation.set(-0.3, 0, -0.35);
        L.lower.rotation.set(-1.85, 0, 0.9); R.lower.rotation.set(-1.85, 0, -0.9); break;
      case 'cintura':
        L.pivot.rotation.set(0.1, 0, -0.62); R.pivot.rotation.set(0.1, 0, 0.62);
        L.lower.rotation.set(-0.35, 0, 1.55); R.lower.rotation.set(-0.35, 0, -1.55);
        LL.pivot.rotation.z = -0.06; RL.pivot.rotation.z = 0.06; break;
      case 'patada':
        RL.pivot.rotation.x = -1.25; RL.lower.rotation.x = 0.25; LL.pivot.rotation.x = 0.12; LL.lower.rotation.x = 0.15;
        m.body.rotation.x = -0.14; L.pivot.rotation.set(-0.35, 0, -1.0); R.pivot.rotation.set(0.6, 0, 0.75); L.lower.rotation.x = -0.5; break;
      case 'cabezazo':
        lift(0.38 * s); m.body.rotation.x = -0.32; m.head.rotation.x = -0.25;
        LL.pivot.rotation.x = 0.35; LL.lower.rotation.x = 1.0; RL.pivot.rotation.x = -0.15; RL.lower.rotation.x = 0.9;
        L.pivot.rotation.set(-0.3, 0, -0.95); R.pivot.rotation.set(-0.3, 0, 0.95); return { dist: 4.3, look: 1.08 };
      case 'punos':
        R.pivot.rotation.set(-0.35, 0, 0.55); R.lower.rotation.set(-2.25, 0, 0); L.pivot.rotation.set(0.25, 0, -0.3); L.lower.rotation.set(-1.15, 0, 0.3);
        m.body.rotation.x = 0.1; m.head.rotation.x = -0.15; LL.pivot.rotation.x = -0.15; RL.pivot.rotation.x = 0.12; break;
      case 'saludo':
        R.pivot.rotation.set(0, 0, 2.55); R.lower.rotation.set(0, 0, 0.55); L.pivot.rotation.set(0.1, 0, -0.18); m.body.rotation.z = 0.04; break;
      case 'atajada':
        lift(0.5 * s); tilt(-0.95); L.pivot.rotation.set(-0.1, 0, 3.0); R.pivot.rotation.set(-0.1, 0, -3.0);
        LL.pivot.rotation.set(0.1, 0, -0.25); RL.pivot.rotation.set(0.35, 0, 0.1); RL.lower.rotation.x = 0.7; return { dist: 5.6, look: 1.0 };
      case 'rodilla':
        lift(-0.42 * s); RL.pivot.rotation.x = -1.4; RL.lower.rotation.x = 1.4; LL.pivot.rotation.x = 0.15; LL.lower.rotation.x = 1.5;
        L.pivot.rotation.set(-0.2, 0, -1.25); R.pivot.rotation.set(-0.2, 0, 1.25); m.body.rotation.x = -0.12; m.head.rotation.x = -0.18; return { dist: 4.3, look: 0.86 };
      case 'gambeta':
        lift(-0.13 * s); m.body.rotation.x = 0.38; m.__dist = 4.25; m.head.rotation.x = -0.4; LL.pivot.rotation.x = -0.7; LL.lower.rotation.x = 1.25; RL.pivot.rotation.x = -0.5; RL.lower.rotation.x = 1.05;
        L.pivot.rotation.set(-0.55, 0, -0.95); R.pivot.rotation.set(0.25, 0, 0.9); return { dist: 4.3, look: 0.98 };
      case 'escudo':
        R.pivot.rotation.set(-0.45, 0, 0.2); R.lower.rotation.set(-2.05, 0, -0.75); L.pivot.rotation.set(0.05, 0, -0.2); L.lower.rotation.set(-0.5, 0, 0.1);
        m.body.rotation.x = -0.06; m.head.rotation.x = -0.14; break;
      default: break;
    }
    return null;
  }

  g.LFOLook = { HAIR, BEARDS, ACCESSORIES, POSES, hairIds: ids(HAIR), beardIds: ids(BEARDS), accIds: ids(ACCESSORIES), poseIds: ids(POSES), decorate, pose };
})(typeof window !== 'undefined' ? window : globalThis);
