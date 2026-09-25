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
  function lock(X, points, radius, material, taper = 0.18) {
    // Barrido propio (Catmull-Rom + marco por transporte paralelo): el bundle de three.js del juego no trae
    // CatmullRomCurve3 ni TubeGeometry, y sin eso ningún cromo/jugador con pelo largo podía dibujarse.
    const segments = 12, radial = 5, n = points.length, sub = 24;
    const cr = (a, b, c, d, t) => a.map((_, k) => 0.5 * (2 * b[k] + (-a[k] + c[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t * t + (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * t * t * t));
    const at = s => { const i = Math.min(n - 2, Math.max(0, Math.floor(s))), t = s - i; return cr(points[Math.max(0, i - 1)], points[i], points[i + 1], points[Math.min(n - 1, i + 2)], t); };
    const dense = [], cum = [0], total = (n - 1) * sub;
    for (let k = 0; k <= total; k++) { dense.push(at(k / sub)); if (k) cum.push(cum[k - 1] + Math.hypot(...dense[k].map((v, q) => v - dense[k - 1][q]))); }
    const len = cum[total] || 1e-6, pointAt = u => { const want = u * len; let k = 1; while (k < total && cum[k] < want) k++; const f = (want - cum[k - 1]) / Math.max(1e-9, cum[k] - cum[k - 1]); return { p: dense[k - 1].map((v, q) => v + (dense[k][q] - v) * f), t: dense[k].map((v, q) => v - dense[k - 1][q]) }; };
    const norm = v => { const m = Math.hypot(...v) || 1; return v.map(c => c / m); };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const positions = [], indices = [];
    let nrm = null;
    for (let i = 0; i <= segments; i++) {
      const { p, t } = pointAt(i / segments), tan = norm(t), scale = 1 - (1 - taper) * Math.pow(i / segments, 2.4), r = radius * scale;
      if (!nrm) { const ref = Math.abs(tan[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]; nrm = norm(cross(tan, ref)); }
      else { nrm = norm(cross(cross(tan, nrm), tan)); }
      const bin = cross(tan, nrm);
      for (let j = 0; j <= radial; j++) {
        const th = j / radial * PI * 2, c = Math.cos(th) * r, s = Math.sin(th) * r;
        positions.push(p[0] + c * nrm[0] + s * bin[0], p[1] + c * nrm[1] + s * bin[1], p[2] + c * nrm[2] + s * bin[2]);
      }
    }
    for (let i = 0; i < segments; i++) for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j, b = a + radial + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const geo = new X.T.BufferGeometry();
    geo.setAttribute('position', new X.T.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices); geo.computeVertexNormals(); return X.add(X.B, geo, material || X.hairMat);
  }
  function hairline(phi) {
    const front = Math.max(0, Math.sin(phi));
    return 1.92 - 0.78 * Math.pow(front, 3) + 0.025 * Math.cos(phi * 9);
  }
  function fittedCap(X, volume = 0.014, material, boundary = hairline) {
    return surface(X, 14, 40, (v, u) => {
      const phi = u * PI * 2, th = 0.001 + v * boundary(phi), ripple = 0.0016 * Math.cos(phi * 23 + th * 7);
      const r = volume * (0.4 + 0.6 * Math.sin(v * PI / 2)) + ripple;
      return [Math.sin(th) * Math.cos(phi) * (HEAD.x + r), HEAD.cy + Math.cos(th) * (HEAD.y + volume), Math.sin(th) * Math.sin(phi) * (HEAD.z + r)];
    }, material || X.hairMat);
  }
  function swept(X, style) {
    const slick = style === 'engominado', part = style === 'raya', quiff = style === 'jopo';
    fittedCap(X, style === 'undercut' ? 0.004 : 0.012, style === 'undercut' ? X.dimHairMat : X.hairMat);
    for (let i = -6; i <= 6; i++) {
      const x = i * 0.018, arch = Math.sqrt(1 - Math.pow(x / 0.145, 2));
      const y = 1.77 + 0.172 * arch, shift = part ? 0.035 : 0;
      lock(X, [[x, y - 0.035, 0.093], [x + shift, y + (quiff ? 0.08 : 0.025), 0.048],
        [x + shift, y + (quiff ? 0.06 : 0.02), -0.055], [x, y - 0.065, -0.125]],
        slick ? 0.009 : 0.017, i % 3 === 0 ? X.hairLight : X.hairMat, 0.45);
    }
  }
  function longHair(X, length, braided = false, dread = false) {
    fittedCap(X, 0.016);
    // Leave the front open: locks follow temples and nape instead of a solid box.
    for (let i = 0; i < 15; i++) {
      const phi = PI * 0.87 + i / 14 * PI * 1.26, p = scalp(1.05, phi, 1.08);
      const endY = 1.77 - length + 0.025 * Math.cos(i * 2);
      const points = [p, [p[0] * 1.3, 1.78, p[2] * 1.3],
        [p[0] * 1.32, endY + 0.08, p[2] * 1.22 - 0.02], [p[0] * 1.22, endY, p[2] * 1.18 - 0.015]];
      lock(X, points, dread ? 0.019 : braided ? 0.015 : 0.027, i % 4 === 0 ? X.hairLight : X.hairMat, braided || dread ? 0.7 : 0.16);
      if (braided) for (let k = 0; k < 9; k++) {
        const t = k / 9, y = 1.8 + (endY - 1.8) * t;
        X.add(X.B, ball(X.T, 0.016), k % 2 ? X.hairMat : X.hairLight, p[0] * 1.3 + Math.sin(k * PI) * 0.004, y, p[2] * 1.27 - t * 0.02, 1, 0.65, 1);
      }
    }
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
  function bun(X, high) {
    swept(X, 'engominado');
    const y = high ? 1.98 : 1.79, z = high ? -0.07 : -0.17;
    X.add(X.B, ball(X.T, 0.061), X.hairMat, 0, y, z, 1, 0.85, 1);
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * PI * 2;
      lock(X, [[Math.cos(a) * 0.05, y, z + Math.sin(a) * 0.05], [Math.cos(a + 0.6) * 0.048, y + 0.04, z + Math.sin(a + 0.6) * 0.048], [0, y + 0.046, z]], 0.007, X.hairLight, 0.5);
    }
  }
  const HAIR_FN = {
    corto(X) { swept(X, 'corto'); },
    rapado(X) { fittedCap(X, 0.0025, X.dimHairMat); },
    largo(X) { longHair(X, 0.24); },
    mohicano(X) {
      fittedCap(X, 0.003, X.dimHairMat);
      for (let i = 0; i < 10; i++) {
        const z = -0.13 + i * 0.026, y = HEAD.cy + 0.18 * Math.sqrt(1 - (z / 0.17) ** 2);
        lock(X, [[0, y, z], [0, y + 0.05, z - 0.012], [0, y + 0.105, z - 0.035]], 0.026, i % 3 ? X.hairMat : X.hairLight);
      }
    },
    afro(X) { curls(X, true); }, rulos(X) { curls(X, false); },
    trenzas(X) { longHair(X, 0.3, true); }, rastas(X) { longHair(X, 0.27, false, true); },
    melena(X) { longHair(X, 0.32); }, media(X) { longHair(X, 0.13); },
    colita(X) {
      swept(X, 'engominado');
      for (let i = -2; i <= 2; i++) lock(X, [[i * 0.008, 1.84, -0.145], [i * 0.011, 1.8, -0.2], [i * 0.014, 1.62, -0.22], [i * 0.012, 1.54, -0.19]], 0.015, i % 2 ? X.hairLight : X.hairMat);
      X.add(X.B, ball(X.T, 0.028), X.dimHairMat, 0, 1.83, -0.172, 1, 0.45, 1);
    },
    mono(X) { bun(X, true); }, rodete(X) { bun(X, false); },
    flequillo(X) {
      fittedCap(X, 0.018);
      for (let i = -5; i <= 5; i++) lock(X, [[i * 0.022, 1.91, 0.05], [i * 0.023, 1.91, 0.103], [i * 0.021 + 0.008, 1.84 + 0.01 * Math.cos(i), 0.135]], 0.018, i % 3 ? X.hairMat : X.hairLight);
    },
    jopo(X) { swept(X, 'jopo'); }, undercut(X) { swept(X, 'undercut'); },
    degradado(X) {
      const mesh = fittedCap(X, 0.006), pos = mesh.geometry.attributes.position, colors = [];
      for (let i = 0; i < pos.count; i++) {
        const t = Math.max(0, Math.min(1, (pos.getY(i) - 1.76) / 0.13));
        const col = new X.T.Color(X.c.skin).lerp(new X.T.Color(X.c.hair), 0.12 + t * 0.88);
        colors.push(col.r, col.g, col.b);
      }
      mesh.geometry.setAttribute('color', new X.T.Float32BufferAttribute(colors, 3));
      mesh.material = X.mat('#ffffff', { vertexColors: true, side: X.T.DoubleSide });
    },
    engominado(X) { X.hairMat.roughness = 0.34; swept(X, 'engominado'); },
    raya(X) { swept(X, 'raya'); },
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
    corona(X) {
      surface(X, 8, 32, (v, u) => scalp(1.18 + v * 0.85, PI * 0.87 + u * PI * 1.26, 1.032), X.hairMat);
    },
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
      const key = o.parent.uuid + o.material.uuid;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(o);
    });
    for (const objects of groups.values()) {
      if (objects.length < 2) continue;
      const positions = [], normals = [], parent = objects[0].parent, material = objects[0].material;
      for (const o of objects) {
        const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
        o.updateMatrix(); geo.applyMatrix4(o.matrix);
        for (const value of geo.attributes.position.array) positions.push(value);
        for (const value of geo.attributes.normal.array) normals.push(value);
        geo.dispose(); o.geometry.dispose(); o.removeFromParent();
      }
      const geo = new X.T.BufferGeometry();
      geo.setAttribute('position', new X.T.Float32BufferAttribute(positions, 3));
      geo.setAttribute('normal', new X.T.Float32BufferAttribute(normals, 3));
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
  const TALL = new Set(['mohicano', 'afro', 'rulos', 'mono', 'jopo', 'puas', 'rastas', 'undercut']);
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
