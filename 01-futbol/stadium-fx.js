/* LFO · Extras de estadio: alambrado perimetral, banderas y efectos de hinchada.
 *
 *   LFOStadiumFX.attach(T3, root, seats, seed) -> fx
 *   fx = { update(elapsed, energy, camera), setColors(primary, secondary, clubName), setQuality(0..1),
 *          goal(esLocal), kickoff(), dispose() }
 *
 * `seats` es un Float32Array (x,y,z) con la posición de cada simpatizante del estadio. Los export traían
 * las banderas apiladas en el origen (sin posición); acá se colocan sobre las butacas: banderas con palo,
 * trapos en alto, y el alambrado (poste, malla romboidal y remate curvado hacia la cancha) alrededor del campo.
 * Efectos: bengalas de humo de colores (gol y momentos de mucha hinchada), papelitos, globos y recibimiento.
 * Todo con las clases mínimas de T3 (BufferGeometry, InstancedMesh, materiales básicos, CanvasTexture).
 */
(function (g) {
  'use strict';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  function rng(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  function mkGeo(T3, pos, nor, uv, idx) {
    const G = new T3.BufferGeometry();
    G.setAttribute('position', new T3.Float32BufferAttribute(pos, 3));
    if (nor) G.setAttribute('normal', new T3.Float32BufferAttribute(nor, 3));
    if (uv) G.setAttribute('uv', new T3.Float32BufferAttribute(uv, 2));
    if (idx) G.setIndex(idx);
    return G;
  }

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }
  function tex(T3, cv, repeat) {
    const t = new T3.CanvasTexture(cv);
    if (repeat) { t.wrapS = 1000; t.wrapT = 1000; }
    t.colorSpace = T3.SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  }

  // ---- caja orientada (para postes, travesaños) ------------------------------------------------------
  function boxInto(B, c, ax, ay, az, sx, sy, sz) {
    const axes = [ax, ay, az], half = [sx / 2, sy / 2, sz / 2];
    for (let a = 0; a < 3; a++) {
      for (const s of [1, -1]) {
        const N = axes[a], u = axes[(a + 1) % 3], v = axes[(a + 2) % 3], hu = half[(a + 1) % 3], hv = half[(a + 2) % 3];
        const f = [c[0] + N[0] * half[a] * s, c[1] + N[1] * half[a] * s, c[2] + N[2] * half[a] * s];
        const b = B.p.length / 3;
        for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          B.p.push(f[0] + u[0] * hu * su + v[0] * hv * sv, f[1] + u[1] * hu * su + v[1] * hv * sv, f[2] + u[2] * hu * su + v[2] * hv * sv);
          B.n.push(N[0] * s, N[1] * s, N[2] * s);
        }
        if (s > 0) B.i.push(b, b + 1, b + 2, b, b + 2, b + 3); else B.i.push(b, b + 2, b + 1, b, b + 3, b + 2);
      }
    }
  }

  // ---- alambrado ---------------------------------------------------------------------------------------
  function buildFence(T3, parent, disposables) {
    const A = 60.3, B = 43.1, R = 7, cx = A - R, cz = B - R, ARC = 6, MAXSEG = 3.4;
    const corners = [[cx, cz, 0], [-cx, cz, Math.PI / 2], [-cx, -cz, Math.PI], [cx, -cz, Math.PI * 1.5]];
    const base = [];
    for (const [ox, oz, a0] of corners) {
      for (let k = 0; k <= ARC; k++) {
        const a = a0 + (k / ARC) * Math.PI / 2;
        base.push({ x: ox + R * Math.cos(a), z: oz + R * Math.sin(a), ix: -Math.cos(a), iz: -Math.sin(a) });
      }
    }
    const P = [];
    for (let i = 0; i < base.length; i++) {
      const a = base[i], b = base[(i + 1) % base.length];
      P.push(a);
      const n = Math.floor(Math.hypot(b.x - a.x, b.z - a.z) / MAXSEG);
      for (let k = 1; k <= n; k++) {
        const t = k / (n + 1), ix = a.ix + (b.ix - a.ix) * t, iz = a.iz + (b.iz - a.iz) * t, l = Math.hypot(ix, iz) || 1;
        P.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, ix: ix / l, iz: iz / l });
      }
    }
    const N = P.length;
    const dist = [0];
    for (let i = 1; i <= N; i++) { const a = P[i - 1], b = P[i % N]; dist.push(dist[i - 1] + Math.hypot(b.x - a.x, b.z - a.z)); }

    // malla: tira vertical + tira inclinada hacia la cancha
    const M = { p: [], n: [], u: [], i: [] };
    const ribbon = (yA, oA, yB, oB, v0, v1) => {
      const b0 = M.p.length / 3;
      for (let i = 0; i <= N; i++) {
        const q = P[i % N], u = dist[i] / 0.5;
        M.p.push(q.x + q.ix * oA, yA, q.z + q.iz * oA, q.x + q.ix * oB, yB, q.z + q.iz * oB);
        M.n.push(q.ix, 0, q.iz, q.ix, 0, q.iz);
        M.u.push(u, v0, u, v1);
      }
      for (let i = 0; i < N; i++) { const a = b0 + i * 2; M.i.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    };
    ribbon(0.15, 0, 2.65, 0, 0, 2.5 / 0.5);
    ribbon(2.65, 0, 3.15, 0.55, 0, 0.5 / 0.5);

    const cv = canvas(64, 64), cc = cv.getContext('2d');
    cc.strokeStyle = 'rgba(214,219,224,0.95)';
    cc.lineWidth = 6;
    cc.beginPath();
    cc.moveTo(0, 32); cc.lineTo(32, 0); cc.lineTo(64, 32); cc.lineTo(32, 64); cc.closePath();
    cc.stroke();
    const netTex = tex(T3, cv, true);
    const netMat = new T3.MeshStandardMaterial({ color: '#dfe4e8', roughness: 0.85, metalness: 0, emissive: '#5b636a', map: netTex, transparent: true, side: 2, depthWrite: false });
    const net = new T3.Mesh(mkGeo(T3, M.p, M.n, M.u, M.i), netMat);
    net.frustumCulled = false; net.renderOrder = 3;
    parent.add(net);

    // postes y travesaños
    const S = { p: [], n: [], i: [] }, UP = [0, 1, 0];
    for (let i = 0; i < N; i++) {
      const q = P[i], nx = P[(i + 1) % N];
      boxInto(S, [q.x, 1.55, q.z], [1, 0, 0], UP, [0, 0, 1], 0.14, 3.1, 0.14);
      const inw = [q.ix, 0, q.iz], tan = [nx.x - q.x, 0, nx.z - q.z], tl = Math.hypot(tan[0], tan[2]) || 1;
      tan[0] /= tl; tan[2] /= tl;
      const r = Math.SQRT1_2, dir = [inw[0] * r, r, inw[2] * r], nrm = [-inw[0] * r, r, -inw[2] * r];
      boxInto(S, [q.x + inw[0] * 0.28, 3.12 + 0.22, q.z + inw[2] * 0.28], tan, nrm, dir, 0.1, 0.1, 0.8);
      const len = Math.hypot(nx.x - q.x, nx.z - q.z), mx = (q.x + nx.x) / 2, mz = (q.z + nx.z) / 2;
      for (const y of [0.25, 1.4, 2.65]) boxInto(S, [mx, y, mz], tan, UP, [-tan[2], 0, tan[0]], len, 0.08, 0.08);
      boxInto(S, [mx + (q.ix + nx.ix) * 0.275, 3.15, mz + (q.iz + nx.iz) * 0.275], tan, UP, [-tan[2], 0, tan[0]], len, 0.08, 0.08);
    }
    const metal = new T3.MeshStandardMaterial({ color: '#a9b1b8', roughness: 0.8, metalness: 0, emissive: '#3c4247', side: 2 });
    const posts = new T3.Mesh(mkGeo(T3, S.p, S.n, null, S.i), metal);
    posts.frustumCulled = false;
    parent.add(posts);
    disposables.push(netMat, metal, netTex);
  }

  // ---- banderas ---------------------------------------------------------------------------------------
  const DESIGNS = 8, WEIGHTS = [1, 3, 3, 1, 1, 3, 1, 1];

  function paintDesign(cv, d, p, s, name) {
    const c = cv.getContext('2d'), W = cv.width, H = cv.height;
    const bands = (cols, horiz) => {
      cols.forEach((col, i) => {
        c.fillStyle = col;
        if (horiz) c.fillRect(0, (H * i) / cols.length, W, H / cols.length + 1);
        else c.fillRect((W * i) / cols.length, 0, W / cols.length + 1, H);
      });
    };
    switch (d) {
      case 0: bands(['#75aadb', '#ffffff', '#75aadb'], true); c.fillStyle = '#f6b40e'; c.beginPath(); c.arc(W / 2, H / 2, H * 0.11, 0, 6.29); c.fill(); break;
      case 1: bands([p, s, p], true); break;
      case 2: bands([p, s, p, s, p], false); break;
      case 3: bands(['#141414', '#f2f2f2', '#141414', '#f2f2f2', '#141414', '#f2f2f2'], false); break;
      case 4: bands(['#c8102e', '#f5f5f5', '#c8102e'], true); break;
      case 5: {
        c.fillStyle = p; c.fillRect(0, 0, W, H);
        c.strokeStyle = s; c.lineWidth = H * 0.06; c.strokeRect(H * 0.06, H * 0.06, W - H * 0.12, H - H * 0.12);
        const txt = (name || 'LFO').toUpperCase();
        let fs = H * 0.5;
        c.font = '900 ' + fs + 'px "Barlow Condensed", Impact, sans-serif';
        while (c.measureText(txt).width > W * 0.86 && fs > 12) { fs -= 4; c.font = '900 ' + fs + 'px "Barlow Condensed", Impact, sans-serif'; }
        c.fillStyle = s; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(txt, W / 2, H / 2 + fs * 0.05);
        break;
      }
      case 6: bands(['#1b3f8b', '#f2c200', '#1b3f8b'], true); break;
      default: bands(['#1f7a3a', '#ffffff', '#1f7a3a'], true); break;
    }
  }

  function flagGeom(T3, kind, phase) {
    const cols = 10, W = kind === 'pole' ? 2.6 : 3.2, H = kind === 'pole' ? 1.6 : 1.2;
    const pos = new Array((cols + 1) * 6).fill(0), uv = [], nor = [], idx = [];
    for (let i = 0; i <= cols; i++) {
      const u = i / cols;
      uv.push(u, 1, u, 0);
      nor.push(0, 0, 1, 0, 0, 1);
      if (i < cols) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const geo = mkGeo(T3, pos, nor, uv, idx);
    const arr = geo.attributes.position.array;
    const step = (t) => {
      for (let i = 0; i <= cols; i++) {
        const u = i / cols, x = kind === 'pole' ? u * W : (u - 0.5) * W, yT = kind === 'pole' ? 0 : H / 2;
        const z = kind === 'pole'
          ? u * (0.3 * Math.sin(u * 5.5 - t * 4.2 + phase) + 0.09 * Math.sin(u * 11 - t * 7 + phase * 2))
          : 0.16 * Math.sin(u * 7 - t * 3.2 + phase) * Math.sin(u * Math.PI);
        const o = i * 6;
        arr[o] = x; arr[o + 1] = yT; arr[o + 2] = z;
        arr[o + 3] = x; arr[o + 4] = yT - H; arr[o + 5] = z;
      }
      geo.attributes.position.needsUpdate = true;
    };
    step(0);
    return { geo, step };
  }

  function setM(arr, k, x, y, z, yaw, sc) {
    const c = Math.cos(yaw) * sc, s = Math.sin(yaw) * sc, o = k * 16;
    arr[o] = c; arr[o + 1] = 0; arr[o + 2] = -s; arr[o + 3] = 0;
    arr[o + 4] = 0; arr[o + 5] = sc; arr[o + 6] = 0; arr[o + 7] = 0;
    arr[o + 8] = s; arr[o + 9] = 0; arr[o + 10] = c; arr[o + 11] = 0;
    arr[o + 12] = x; arr[o + 13] = y; arr[o + 14] = z; arr[o + 15] = 1;
  }

  function buildFlags(T3, parent, seats, rand, disposables) {
    const n = seats.length / 3;
    let maxX = 1;
    for (let i = 0; i < n; i++) maxX = Math.max(maxX, Math.abs(seats[i * 3]));
    const taken = new Set();
    const pick = () => {
      for (let tries = 0; tries < 60; tries++) {
        const i = Math.floor(rand() * n), x = seats[i * 3], y = seats[i * 3 + 1], z = seats[i * 3 + 2];
        if (rand() > (Math.abs(x) > maxX * 0.72 ? 1 : 0.5)) continue;
        const key = Math.round(x / 3) + ',' + Math.round(z / 3) + ',' + Math.round(y / 3);
        if (taken.has(key)) continue;
        taken.add(key);
        return [x, y, z];
      }
      return null;
    };
    const design = () => {
      let t = rand() * 15, d = 0;
      while (d < DESIGNS - 1 && t >= WEIGHTS[d]) { t -= WEIGHTS[d]; d++; }
      return d;
    };
    const facing = (x, z) => {
      const rx = Math.abs(x) / 62, rz = Math.abs(z) / 44;
      let nx = 0, nz = 0;
      if (rx > rz * 1.25) nx = -Math.sign(x); else if (rz > rx * 1.25) nz = -Math.sign(z); else { nx = -Math.sign(x) * Math.SQRT1_2; nz = -Math.sign(z) * Math.SQRT1_2; }
      return Math.atan2(nx, nz);
    };

    const NP = 380, NH = 260;
    const items = []; // {kind, d, v, x,y,z, yaw}
    const polePos = [];
    for (let k = 0; k < NP; k++) {
      const s = pick(); if (!s) break;
      polePos.push(s);
      items.push({ kind: 0, d: design(), v: Math.floor(rand() * 3), x: s[0] + 0.05, y: s[1] + 3.25, z: s[2], yaw: (rand() - 0.5) * 1.1 });
    }
    for (let k = 0; k < NH; k++) {
      const s = pick(); if (!s) break;
      const yaw = facing(s[0], s[2]);
      items.push({ kind: 1, d: design(), v: Math.floor(rand() * 3), x: s[0] + Math.sin(yaw) * 0.25, y: s[1] + 2.6, z: s[2] + Math.cos(yaw) * 0.25, yaw });
    }

    // palos
    const PB = { p: [], n: [], i: [] };
    const AX = [1, 0, 0], AY = [0, 1, 0], AZ = [0, 0, 1];
    polePos.forEach((s) => boxInto(PB, [s[0], s[1] + 1.65, s[2]], AX, AY, AZ, 0.05, 3.3, 0.05));
    const poleMat = new T3.MeshStandardMaterial({ color: '#d9d2c0', roughness: 0.7, metalness: 0.1 });
    const poles = new T3.Mesh(mkGeo(T3, PB.p, PB.n, null, PB.i), poleMat);
    poles.frustumCulled = false;
    parent.add(poles);

    const cvs = [], texs = [], mats = [];
    for (let d = 0; d < DESIGNS; d++) {
      const cv = canvas(256, 160);
      paintDesign(cv, d, '#3f7fb5', '#f4f1e6', 'LFO');
      const t = tex(T3, cv, false);
      cvs.push(cv); texs.push(t);
      mats.push(new T3.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, metalness: 0, map: t, side: 2 }));
    }
    const geos = [[0, 1, 2].map((v) => flagGeom(T3, 'pole', v * 2.1)), [0, 1, 2].map((v) => flagGeom(T3, 'trapo', v * 2.1))];
    for (let kind = 0; kind < 2; kind++) {
      for (let v = 0; v < 3; v++) {
        for (let d = 0; d < DESIGNS; d++) {
          const list = items.filter((it) => it.kind === kind && it.v === v && it.d === d);
          if (!list.length) continue;
          const mesh = new T3.InstancedMesh(geos[kind][v].geo, mats[d], list.length);
          list.forEach((it, k) => setM(mesh.instanceMatrix.array, k, it.x, it.y, it.z, it.yaw, 1));
          mesh.instanceMatrix.needsUpdate = true;
          mesh.count = list.length;
          mesh.frustumCulled = false;
          parent.add(mesh);
        }
      }
    }
    disposables.push(poleMat, ...mats, ...texs);
    return {
      wave(t) { geos.forEach((row) => row.forEach((x) => x.step(t))); },
      paint(p, s, name) {
        for (const d of [1, 2, 5]) { paintDesign(cvs[d], d, p, s, name); texs[d].needsUpdate = true; }
      },
    };
  }

  // ---- efectos de hinchada -----------------------------------------------------------------------------
  function buildFX(T3, parent, seats, rand, disposables) {
    const nSeats = seats.length / 3;
    let maxX = 1;
    for (let i = 0; i < nSeats; i++) maxX = Math.max(maxX, Math.abs(seats[i * 3]));
    let quality = 1, prim = '#3f7fb5', sec = '#f4f1e6';
    const wind = [0.8, 0];
    const col = (c) => new T3.Color(c);

    // geometrías compartidas
    const quad = (w, h) => mkGeo(T3, [-w / 2, -h / 2, 0, w / 2, -h / 2, 0, w / 2, h / 2, 0, -w / 2, h / 2, 0], [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], [0, 0, 1, 0, 1, 1, 0, 1], [0, 1, 2, 0, 2, 3]);
    const sphere = (r, la, lo) => {
      const p = [], nn = [], id = [];
      for (let i = 0; i <= la; i++) {
        const th = (i / la) * Math.PI;
        for (let j = 0; j <= lo; j++) {
          const ph = (j / lo) * Math.PI * 2, x = Math.sin(th) * Math.cos(ph), y = Math.cos(th), z = Math.sin(th) * Math.sin(ph);
          p.push(x * r, y * r, z * r); nn.push(x, y, z);
        }
      }
      for (let i = 0; i < la; i++) for (let j = 0; j < lo; j++) { const a = i * (lo + 1) + j, b = a + lo + 1; id.push(a, b, a + 1, b, b + 1, a + 1); }
      return mkGeo(T3, p, nn, null, id);
    };
    const softCv = canvas(64, 64), sc = softCv.getContext('2d');
    const gr = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    sc.fillStyle = gr; sc.fillRect(0, 0, 64, 64);
    const softTex = tex(T3, softCv, false);
    const quadSoft = quad(1, 1), quadPaper = quad(0.5, 0.22), ball = sphere(0.38, 7, 10);
    disposables.push(softTex, quadSoft, quadPaper, ball);

    const mk = (geo, mat, cap) => {
      const m = new T3.InstancedMesh(geo, mat, cap);
      m.count = 0; m.frustumCulled = false; parent.add(m);
      disposables.push(mat);
      return m;
    };

    const SMOKE = [null, null, '#e5322d', '#2fb34a', '#f2c200', '#4cc3ff', '#f4f4f4', '#ff8a1f'];
    const smokeM = SMOKE.map((c, i) => {
      const m = mk(quadSoft, new T3.MeshBasicMaterial({ color: c || (i ? sec : prim), map: softTex, transparent: true, opacity: 0.5, depthWrite: false, side: 2 }), 420);
      m.renderOrder = 6; return m;
    });
    const glowM = mk(quadSoft, new T3.MeshBasicMaterial({ color: '#ffd48a', map: softTex, transparent: true, opacity: 1, depthWrite: false, side: 2 }), 48);
    glowM.renderOrder = 7;
    const paperM = [prim, sec, '#f4f4f4'].map((c) => mk(quadPaper, new T3.MeshBasicMaterial({ color: c, side: 2 }), 320));
    const ballM = [prim, sec, '#f4f4f4', '#e5322d'].map((c) => mk(ball, new T3.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0 }), 90));

    const puffs = [], flares = [], papers = [], balls = [], queue = [];
    let ambientPaper = 0, ambientBall = 0, ambientFlare = 0, last = null;

    const seat = (end) => {
      for (let t = 0; t < 30; t++) {
        const i = Math.floor(rand() * nSeats);
        if (!end || Math.abs(seats[i * 3]) > maxX * 0.7) return [seats[i * 3], seats[i * 3 + 1], seats[i * 3 + 2]];
      }
      const i = Math.floor(rand() * nSeats);
      return [seats[i * 3], seats[i * 3 + 1], seats[i * 3 + 2]];
    };
    const flare = (s, colorIdx) => flares.push({ x: s[0], y: s[1] + 1.5, z: s[2], c: colorIdx, t: 0, life: 9 + rand() * 4, acc: rand(), ph: rand() * 6.28 });
    const paper = (s, burst) => {
      if (papers.length >= 900) return;
      const up = burst ? 6 + rand() * 7 : 0;
      papers.push({ c: Math.floor(rand() * 3), x: s[0] + (rand() - 0.5) * 3, y: burst ? s[1] + 1.8 : s[1] + 10 + rand() * 14, z: s[2] + (rand() - 0.5) * 3, vx: (rand() - 0.5) * 2, vy: up ? up : -1, vz: (rand() - 0.5) * 2, fl: s[1], ph: rand() * 6.28, rs: 2 + rand() * 4, age: 0 });
    };
    const balloon = (s, burst) => {
      if (balls.length >= 160) return;
      balls.push({ c: Math.floor(rand() * 4), x: s[0], y: s[1] + 2, z: s[2], vx: (rand() - 0.5) * 3, vy: burst ? 5 + rand() * 5 : 1 + rand() * 2, vz: (rand() - 0.5) * 3, fl: s[1] + 0.3, ph: rand() * 6.28 });
    };

    function goal(home) {
      const nF = Math.round((home ? 14 : 3) * quality);
      if (home) {
        for (let i = 0; i < nF; i++) queue.push({ at: rand() * 2.5, f: () => flare(seat(true), Math.floor(rand() * SMOKE.length)) });
        for (let i = 0; i < 260 * quality; i++) queue.push({ at: rand() * 2.2, f: () => paper(seat(rand() < 0.7), true) });
        for (let i = 0; i < 22 * quality; i++) queue.push({ at: rand() * 1.5, f: () => balloon(seat(false), true) });
      } else {
        const c = seat(true);
        for (let i = 0; i < nF; i++) queue.push({ at: rand() * 1.5, f: () => flare([c[0] + (rand() - 0.5) * 8, c[1], c[2] + (rand() - 0.5) * 8], 5 + (i % 3)) });
        for (let i = 0; i < 30 * quality; i++) queue.push({ at: rand() * 1.5, f: () => paper([c[0] + (rand() - 0.5) * 8, c[1], c[2] + (rand() - 0.5) * 8], true) });
      }
    }
    function kickoff() {
      for (let i = 0; i < Math.round(8 * quality); i++) queue.push({ at: rand() * 3, f: () => flare(seat(true), Math.floor(rand() * SMOKE.length)) });
      for (let i = 0; i < 300 * quality; i++) queue.push({ at: rand() * 3, f: () => paper(seat(rand() < 0.6), true) });
      for (let i = 0; i < 14 * quality; i++) queue.push({ at: rand() * 3, f: () => balloon(seat(false), true) });
    }

    function billboard(arr, k, x, y, z, s, roll, E) {
      const c = Math.cos(roll) * s, sn = Math.sin(roll) * s, o = k * 16;
      arr[o] = E[0] * c + E[4] * sn; arr[o + 1] = E[1] * c + E[5] * sn; arr[o + 2] = E[2] * c + E[6] * sn; arr[o + 3] = 0;
      arr[o + 4] = -E[0] * sn + E[4] * c; arr[o + 5] = -E[1] * sn + E[5] * c; arr[o + 6] = -E[2] * sn + E[6] * c; arr[o + 7] = 0;
      arr[o + 8] = E[8] * s; arr[o + 9] = E[9] * s; arr[o + 10] = E[10] * s; arr[o + 11] = 0;
      arr[o + 12] = x; arr[o + 13] = y; arr[o + 14] = z; arr[o + 15] = 1;
    }

    function update(elapsed, energy, camera) {
      let dt = last == null ? 0 : elapsed - last;
      last = elapsed;
      dt = clamp(dt, 0, 0.1);
      const e = clamp(((energy || 0) - 0.035) / 0.24, 0, 1);

      // eventos programados
      for (let i = queue.length - 1; i >= 0; i--) {
        queue[i].at -= dt;
        if (queue[i].at <= 0) { queue[i].f(); queue.splice(i, 1); }
      }
      // ambiente: papelitos y globos según la hinchada; alguna bengala suelta si se calienta
      ambientPaper += dt * (4 + 30 * e) * quality;
      while (ambientPaper >= 1) { ambientPaper--; paper(seat(rand() < 0.5), false); }
      ambientBall += dt * (0.12 + 1.1 * e) * quality;
      while (ambientBall >= 1) { ambientBall--; balloon(seat(false), false); }
      ambientFlare += dt * 0.07 * e * quality;
      while (ambientFlare >= 1) { ambientFlare--; flare(seat(true), Math.floor(rand() * SMOKE.length)); }

      // bengalas -> humo
      for (let i = flares.length - 1; i >= 0; i--) {
        const f = flares[i];
        f.t += dt;
        if (f.t >= f.life) { flares.splice(i, 1); continue; }
        f.acc += dt * 8 * quality;
        while (f.acc >= 1) {
          f.acc--;
          if (puffs.length < 1400) puffs.push({ c: f.c, x: f.x + (rand() - 0.5) * 0.4, y: f.y, z: f.z + (rand() - 0.5) * 0.4, vx: wind[0] * (0.6 + rand() * 0.8) + (rand() - 0.5) * 0.6, vy: 1.5 + rand() * 0.9, vz: (rand() - 0.5) * 0.7, age: 0, life: 5 + rand() * 2, s0: 1.3, s1: 7 + rand() * 2.5, rot: rand() * 6.28, rs: (rand() - 0.5) * 0.5 });
        }
      }
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.age += dt;
        if (p.age >= p.life) { puffs.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        p.vy *= 1 - 0.22 * dt;
      }
      // papelitos y globos
      for (let i = papers.length - 1; i >= 0; i--) {
        const p = papers[i];
        p.age += dt;
        p.vy += (-1.0 - p.vy) * Math.min(1, dt * 1.6);
        p.x += (p.vx + wind[0] * 0.5 + Math.sin(p.age * 2.4 + p.ph) * 0.7) * dt;
        p.z += (p.vz + Math.cos(p.age * 2.1 + p.ph) * 0.7) * dt;
        p.y += p.vy * dt;
        if (p.y <= p.fl + 0.3) papers.splice(i, 1);
      }
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        b.vy += (-0.75 - b.vy) * Math.min(1, dt * 0.9);
        b.vx *= 1 - 0.5 * dt; b.vz *= 1 - 0.5 * dt;
        b.x += (b.vx + wind[0] * 0.3) * dt; b.z += b.vz * dt; b.y += b.vy * dt;
        if (b.y <= b.fl) balls.splice(i, 1);
      }

      // instancias
      const E = camera && camera.matrixWorld ? camera.matrixWorld.elements : null;
      const cnt = new Array(smokeM.length).fill(0);
      if (E) {
        for (const p of puffs) {
          const m = smokeM[p.c], f = p.age / p.life;
          if (cnt[p.c] >= 420) continue;
          const s = (p.s0 + (p.s1 - p.s0) * Math.sqrt(f)) * (f > 0.72 ? (1 - f) / 0.28 : 1);
          billboard(m.instanceMatrix.array, cnt[p.c]++, p.x, p.y, p.z, s, p.rot + p.age * p.rs, E);
        }
      }
      smokeM.forEach((m, i) => { m.count = cnt[i]; m.instanceMatrix.needsUpdate = true; });
      let gk = 0;
      if (E) {
        for (const f of flares) {
          if (gk >= 48) break;
          const fade = f.t < 0.6 ? f.t / 0.6 : f.life - f.t < 1.2 ? (f.life - f.t) / 1.2 : 1;
          billboard(glowM.instanceMatrix.array, gk++, f.x, f.y + 0.2, f.z, (0.9 + 0.3 * Math.sin(f.t * 23 + f.ph)) * fade, 0, E);
        }
      }
      glowM.count = gk; glowM.instanceMatrix.needsUpdate = true;

      const pc = [0, 0, 0];
      for (const p of papers) {
        const m = paperM[p.c];
        if (pc[p.c] >= 320) continue;
        const psi = p.ph + p.age * p.rs, phi = 0.9 * Math.sin(p.age * 4 + p.ph), cp = Math.cos(psi), sp = Math.sin(psi), cf = Math.cos(phi), sf = Math.sin(phi);
        const a = m.instanceMatrix.array, o = pc[p.c]++ * 16;
        a[o] = cp; a[o + 1] = 0; a[o + 2] = -sp; a[o + 3] = 0;
        a[o + 4] = sp * sf; a[o + 5] = cf; a[o + 6] = cp * sf; a[o + 7] = 0;
        a[o + 8] = sp * cf; a[o + 9] = -sf; a[o + 10] = cp * cf; a[o + 11] = 0;
        a[o + 12] = p.x; a[o + 13] = p.y; a[o + 14] = p.z; a[o + 15] = 1;
      }
      paperM.forEach((m, i) => { m.count = pc[i]; m.instanceMatrix.needsUpdate = true; });
      const bc = [0, 0, 0, 0];
      for (const b of balls) {
        const m = ballM[b.c];
        if (bc[b.c] >= 90) continue;
        const a = m.instanceMatrix.array, o = bc[b.c]++ * 16;
        a[o] = 1; a[o + 1] = 0; a[o + 2] = 0; a[o + 3] = 0;
        a[o + 4] = 0; a[o + 5] = 1.15; a[o + 6] = 0; a[o + 7] = 0;
        a[o + 8] = 0; a[o + 9] = 0; a[o + 10] = 1; a[o + 11] = 0;
        a[o + 12] = b.x; a[o + 13] = b.y; a[o + 14] = b.z; a[o + 15] = 1;
      }
      ballM.forEach((m, i) => { m.count = bc[i]; m.instanceMatrix.needsUpdate = true; });
    }

    function setColors(p, s) {
      prim = p; sec = s;
      smokeM[0].material.color.copy(col(p)); smokeM[1].material.color.copy(col(s));
      paperM[0].material.color.copy(col(p)); paperM[1].material.color.copy(col(s));
      ballM[0].material.color.copy(col(p)); ballM[1].material.color.copy(col(s));
    }
    return { update, goal, kickoff, setColors, setQuality(q) { quality = q; } };
  }

  g.LFOStadiumFX = {
    attach(T3, root, seats, seed) {
      const rand = rng(seed || 1234567);
      const grp = new T3.Group();
      grp.name = 'extras';
      root.add(grp);
      const disposables = [];
      buildFence(T3, grp, disposables);
      const flags = buildFlags(T3, grp, seats, rand, disposables);
      const fx = buildFX(T3, grp, seats, rand, disposables);
      return {
        // reloj propio: antes del pitazo el `elapsed` del motor queda en 0 y los efectos tienen que seguir corriendo
        update(elapsed, energy, camera) {
          const now = performance.now() / 1000;
          flags.wave(now);
          fx.update(now, energy, camera);
        },
        setColors(p, s, name) { flags.paint(p, s, name); fx.setColors(p, s); },
        setQuality(q) { fx.setQuality(q < 0.6 ? 0.5 : 1); },
        goal: fx.goal,
        kickoff: fx.kickoff,
        dispose() {
          grp.traverse((o) => { if (o.geometry && o.geometry.dispose) o.geometry.dispose(); });
          disposables.forEach((d) => d && d.dispose && d.dispose());
        },
      };
    },
  };
})(window);
