/* LFO · Efectos de gol (cosmético de la Tienda Diaria, tipo "gfx").
 *
 * Cuando el equipo del usuario mete un gol, si tiene un efecto equipado para esa situación (normal / últimos 5' / 4º gol),
 * sale del balón, en el punto donde entró. Hay ocho: Explosión, Fuegos artificiales, Tormenta eléctrica, Lluvia de confeti,
 * Agujero negro, Congelado, Lluvia de oro y Tornado de fuego.
 * Para sumar otro: agregar una entrada a EFFECTS (con `spawn(ctx, pos)` y `update(ctx, dt)`), al catálogo del hub
 * (`GOALFX_CATALOG` en hub.html) y ya se puede comprar/equipar; el resto es genérico.
 *
 * El motor avisa con el evento `lfo:goal` (ver tlOnGoal en fulbo.html); el renderer llama a LFOGoalFX.tick() cada cuadro.
 * Todo con las clases mínimas de T3: InstancedMesh de cuadrados que miran a la cámara (no hay Points ni Sprite).
 */
(function (g) {
  'use strict';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rand = (a, b) => a + Math.random() * (b - a);

  let ctx = null;      // { T3, view, group, meshes, parts, mats… } — se crea al primer uso
  let last = null;
  const live = [];     // instancias en curso: { fx, t, ...estado propio }

  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function tex(T3, cv) { const t = new T3.CanvasTexture(cv); t.colorSpace = T3.SRGBColorSpace; t.needsUpdate = true; return t; }

  function build(view) {
    const T3 = g.lfoArchive.THREE;
    const geo = new T3.BufferGeometry();
    geo.setAttribute('position', new T3.Float32BufferAttribute([-.5, -.5, 0, .5, -.5, 0, .5, .5, 0, -.5, .5, 0], 3));
    geo.setAttribute('normal', new T3.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
    geo.setAttribute('uv', new T3.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
    geo.setIndex([0, 1, 2, 0, 2, 3]);

    const soft = canvas(64, 64), sc = soft.getContext('2d');
    let gr = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    sc.fillStyle = gr; sc.fillRect(0, 0, 64, 64);
    const ring = canvas(128, 128), rc = ring.getContext('2d');
    gr = rc.createRadialGradient(64, 64, 34, 64, 64, 62);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.55, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    rc.fillStyle = gr; rc.fillRect(0, 0, 128, 128);
    const softT = tex(T3, soft), ringT = tex(T3, ring);

    const group = new T3.Group(); group.name = 'goalfx';
    view.scene.add(group);
    const inst = (map, color, cap, blend, opacity) => {
      const mat = new T3.MeshBasicMaterial({ color, map, transparent: true, opacity: opacity == null ? 1 : opacity, depthWrite: false, side: 2, blending: blend });
      const m = new T3.InstancedMesh(geo, mat, cap);
      m.count = 0; m.frustumCulled = false; m.renderOrder = 8;
      group.add(m);
      return m;
    };
    // estrella de cuatro puntas y cuadrado lleno (confeti, monedas, esquirlas)
    const star = canvas(64, 64), st = star.getContext('2d'); st.fillStyle = '#fff'; st.shadowColor = '#fff'; st.shadowBlur = 8;
    st.beginPath(); st.moveTo(32, 2); st.quadraticCurveTo(32, 32, 62, 32); st.quadraticCurveTo(32, 32, 32, 62); st.quadraticCurveTo(32, 32, 2, 32); st.quadraticCurveTo(32, 32, 32, 2); st.fill();
    const sq = canvas(16, 16), qc = sq.getContext('2d'); qc.fillStyle = '#fff'; qc.fillRect(1, 1, 14, 14);
    const coin = canvas(64, 64), cc2 = coin.getContext('2d'); cc2.fillStyle = '#fff'; cc2.beginPath(); cc2.arc(32, 32, 30, 0, 7); cc2.fill(); cc2.strokeStyle = 'rgba(0,0,0,.35)'; cc2.lineWidth = 5; cc2.beginPath(); cc2.arc(32, 32, 22, 0, 7); cc2.stroke();
    const starT = tex(T3, star), sqT = tex(T3, sq), coinT = tex(T3, coin);
    const tint = (m) => { m.material.color.set('#ffffff'); return m; };
    const CH = { glow: tint(inst(softT, '#fff', 1600, 2)), ring2: tint(inst(ringT, '#fff', 24, 2)), puff: tint(inst(softT, '#fff', 220, 1, 0.8)), star: tint(inst(starT, '#fff', 400, 2)), shard: tint(inst(sqT, '#fff', 800, 1)), coin: tint(inst(coinT, '#fff', 300, 1)) };
    ctx = { T3, view, group, geo, textures: [softT, ringT, starT, sqT, coinT], CH, col: new T3.Color(),
      flash: inst(softT, '#fff0b8', 8, 2), ring: inst(ringT, '#ffc25a', 8, 2), sparks: inst(softT, '#ffb347', 260, 2), core: inst(softT, '#ff6a1f', 40, 2, 0.9), smoke: inst(softT, '#3b3833', 48, 1, 0.55) };
  }

  function bb(arr, k, x, y, z, s, roll, E, sy) {
    // cuadrado que mira a la cámara; sy (opcional) estira el eje vertical del cuadrado (rayos, esquirlas, monedas que giran)
    const cr = Math.cos(roll), sr = Math.sin(roll), s2 = sy == null ? s : sy, o = k * 16;
    arr[o] = (E[0] * cr + E[4] * sr) * s; arr[o + 1] = (E[1] * cr + E[5] * sr) * s; arr[o + 2] = (E[2] * cr + E[6] * sr) * s; arr[o + 3] = 0;
    arr[o + 4] = (-E[0] * sr + E[4] * cr) * s2; arr[o + 5] = (-E[1] * sr + E[5] * cr) * s2; arr[o + 6] = (-E[2] * sr + E[6] * cr) * s2; arr[o + 7] = 0;
    arr[o + 8] = E[8] * s; arr[o + 9] = E[9] * s; arr[o + 10] = E[10] * s; arr[o + 11] = 0;
    arr[o + 12] = x; arr[o + 13] = y; arr[o + 14] = z; arr[o + 15] = 1;
  }

  // ---- efectos -------------------------------------------------------------------------------------------------
  const EFFECTS = {
    explosion: {
      title: 'Explosión', life: 3.2,
      spawn(pos) {
        const st = { pos: { x: pos.x, y: Math.max(0.4, pos.y), z: pos.z }, t: 0, sparks: [], smoke: [], cores: [] };
        for (let i = 0; i < 150; i++) {   // chispas en todas direcciones (algo más hacia arriba)
          const a = rand(0, Math.PI * 2), e = Math.acos(rand(-0.35, 1)), sp = rand(7, 24);
          st.sparks.push({ x: st.pos.x, y: st.pos.y, z: st.pos.z, vx: Math.sin(e) * Math.cos(a) * sp, vy: Math.cos(e) * sp * 0.9 + 2, vz: Math.sin(e) * Math.sin(a) * sp, life: rand(0.9, 2.1), age: 0, s: rand(0.45, 1.0) });
        }
        for (let i = 0; i < 26; i++) {    // bolas de fuego
          const a = rand(0, Math.PI * 2), e = Math.acos(rand(-0.2, 1)), sp = rand(1.5, 6);
          st.cores.push({ x: st.pos.x, y: st.pos.y, z: st.pos.z, vx: Math.sin(e) * Math.cos(a) * sp, vy: Math.cos(e) * sp + 1, vz: Math.sin(e) * Math.sin(a) * sp, life: rand(0.5, 1.0), age: 0, s: rand(2.6, 5.4) });
        }
        for (let i = 0; i < 22; i++) {    // humo que sube
          const a = rand(0, Math.PI * 2), sp = rand(0.6, 2.4);
          st.smoke.push({ x: st.pos.x + Math.cos(a) * 0.4, y: st.pos.y, z: st.pos.z + Math.sin(a) * 0.4, vx: Math.cos(a) * sp, vy: rand(1.2, 3.2), vz: Math.sin(a) * sp, life: rand(1.8, 3.0), age: 0, s0: rand(2.5, 4), s1: rand(8, 14), rot: rand(0, 6.3) });
        }
        boom();
        return st;
      },
      update(st, dt, E, out) {
        st.t += dt;
        const t = st.t, p = st.pos;
        // destello y onda expansiva
        if (t < 0.5) out.flash.push({ x: p.x, y: p.y, z: p.z, s: 4 + (t / 0.5) * 24, a: 1 - t / 0.5 });
        if (t < 1.1) out.ring.push({ x: p.x, y: p.y, z: p.z, s: 3 + (t / 1.1) * 44, a: 1 - t / 1.1 });
        for (const q of st.sparks) { if (q.age >= q.life) continue; q.age += dt; q.vy -= 9.8 * dt; q.vx *= 1 - 0.7 * dt; q.vz *= 1 - 0.7 * dt; q.x += q.vx * dt; q.y = Math.max(0.05, q.y + q.vy * dt); q.z += q.vz * dt; if (q.y <= 0.06) q.vy *= -0.3; out.sparks.push({ x: q.x, y: q.y, z: q.z, s: q.s * (1 - q.age / q.life) }); }
        for (const q of st.cores) { if (q.age >= q.life) continue; q.age += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; q.vx *= 1 - 1.5 * dt; q.vz *= 1 - 1.5 * dt; const f = q.age / q.life; out.core.push({ x: q.x, y: q.y, z: q.z, s: q.s * (0.6 + f * 1.1) * (1 - f * f) }); }
        for (const q of st.smoke) { if (q.age >= q.life) continue; q.age += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; q.vx *= 1 - 0.5 * dt; q.vy *= 1 - 0.35 * dt; const f = q.age / q.life; out.smoke.push({ x: q.x, y: q.y, z: q.z, s: (q.s0 + (q.s1 - q.s0) * Math.sqrt(f)) * (f > 0.7 ? (1 - f) / 0.3 : 1), r: q.rot + q.age * 0.3 }); }
        return t < 3.2;
      },
    },
    // ---- efectos nuevos (canales con color: glow, ring2, puff, star, shard) ----
    fuegos: {
      title: 'Fuegos artificiales', life: 5,
      spawn(pos) {
        const st = { t: 0, rockets: [], stars: [] }, pal = [[1, .3, .3], [.3, .8, 1], [1, .85, .2], [.5, 1, .45], [1, .45, 1], [1, 1, 1]];
        for (let i = 0; i < 6; i++) { const a = (i / 6 - .5) * 1.4; st.rockets.push({ x: pos.x, y: Math.max(.5, pos.y), z: pos.z, vx: Math.sin(a) * 5 + rand(-1, 1), vy: rand(13, 16), vz: rand(-3, 3), fuse: .8 + i * .16, c: pal[i % pal.length], done: false, trail: [] }); }
        sfx('launch'); return st;
      },
      update(st, dt, E, out) {
        st.t += dt;
        for (const r of st.rockets) {
          if (r.done) continue;
          if (st.t < r.fuse) { r.vy -= 9.8 * dt * .5; r.x += r.vx * dt; r.y += r.vy * dt; r.z += r.vz * dt; r.trail.push([r.x, r.y, r.z]); if (r.trail.length > 12) r.trail.shift();
            r.trail.forEach((p, i) => out.glow.push({ x: p[0], y: p[1], z: p[2], s: .25 + i * .05, c: [1 * i / 12, .8 * i / 12, .5 * i / 12] })); out.glow.push({ x: r.x, y: r.y, z: r.z, s: 1.2, c: [1, .95, .8] }); }
          else { r.done = true; sfx('pop'); out.ring2.push({ x: r.x, y: r.y, z: r.z, s: 6, c: r.c });
            for (let k = 0; k < 90; k++) { const a = rand(0, 6.283), e = Math.acos(rand(-1, 1)), sp = rand(6, 11); st.stars.push({ x: r.x, y: r.y, z: r.z, vx: Math.sin(e) * Math.cos(a) * sp, vy: Math.cos(e) * sp, vz: Math.sin(e) * Math.sin(a) * sp, age: 0, life: rand(1.4, 2.4), c: r.c }); } }
        }
        for (const q of st.stars) { if (q.age >= q.life) continue; q.age += dt; q.vy -= 4 * dt; q.vx *= 1 - 1.2 * dt; q.vy *= 1 - .6 * dt; q.vz *= 1 - 1.2 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
          const f = 1 - q.age / q.life, tw = .6 + .4 * Math.sin(q.age * 30 + q.x); out.star.push({ x: q.x, y: q.y, z: q.z, s: .9 * f + .3, r: q.age * 3, c: q.c.map((v) => v * f * tw) }); out.glow.push({ x: q.x, y: q.y, z: q.z, s: 1.1 * f, c: q.c.map((v) => v * f * .35) }); }
        return st.t < 5;
      },
    },
    rayo: {
      title: 'Tormenta eléctrica', life: 3,
      spawn(pos) {
        const p = { x: pos.x, y: Math.max(.3, pos.y), z: pos.z }, bolts = [];
        for (const t0 of [0, .38, .85]) { const pts = []; let x = p.x + rand(-6, 6), z = p.z + rand(-4, 4); for (let y = 42; y > p.y; y -= 1.4) { x += rand(-1.1, 1.1) + (p.x - x) * .08; z += rand(-1.1, 1.1) + (p.z - z) * .08; pts.push([x, y, z]); } pts.push([p.x, p.y, p.z]);
          const br = []; for (let k = 0; k < 3; k++) { const i0 = Math.floor(rand(4, pts.length - 4)); let [bx, by, bz] = pts[i0]; const d = [rand(-1, 1), -1, rand(-1, 1)]; const b = []; for (let j = 0; j < 7; j++) { bx += d[0] + rand(-.5, .5); by += d[1] * 1.1; bz += d[2] + rand(-.5, .5); b.push([bx, by, bz]); } br.push(b); }
          bolts.push({ t0, pts, br }); }
        const sparks = []; for (let i = 0; i < 70; i++) { const a = rand(0, 6.283), sp = rand(4, 12); sparks.push({ x: p.x, y: p.y, z: p.z, vx: Math.cos(a) * sp, vy: rand(2, 9), vz: Math.sin(a) * sp, age: 0, life: rand(.4, 1) }); }
        sfx('thunder'); return { t: 0, p, bolts, sparks };
      },
      update(st, dt, E, out) {
        st.t += dt; const t = st.t, p = st.p;
        for (const b of st.bolts) { const age = t - b.t0; if (age < 0 || age > .45) continue; const fl = (Math.sin(age * 90) > -.3 ? 1 : .35) * (1 - age / .45);
          const seg = (list) => { for (let i = 1; i < list.length; i++) { const a = list[i - 1], c = list[i]; for (let k = 0; k < 3; k++) { const u = k / 3; const x = a[0] + (c[0] - a[0]) * u, y = a[1] + (c[1] - a[1]) * u, z = a[2] + (c[2] - a[2]) * u; out.glow.push({ x, y, z, s: .9, c: [.55 * fl, .75 * fl, 1 * fl] }); out.glow.push({ x, y, z, s: .3, c: [fl, fl, fl] }); } } };
          seg(b.pts); b.br.forEach(seg);
          if (age < .12) { out.ring2.push({ x: p.x, y: .2, z: p.z, s: 4 + age * 90, c: [.6, .8, 1] }); out.glow.push({ x: p.x, y: p.y + 1, z: p.z, s: 14, c: [.35 * fl, .45 * fl, .7 * fl] }); } }
        for (const q of st.sparks) { if (q.age >= q.life || t < 0) continue; q.age += dt; q.vy -= 12 * dt; q.x += q.vx * dt; q.y = Math.max(.05, q.y + q.vy * dt); q.z += q.vz * dt; const f = 1 - q.age / q.life; out.glow.push({ x: q.x, y: q.y, z: q.z, s: .35, c: [.7 * f, .85 * f, f] }); }
        return t < 1.8;
      },
    },
    confeti: {
      title: 'Lluvia de confeti', life: 5,
      spawn(pos) {
        const pal = [[1, .25, .3], [1, .8, .1], [.2, .75, 1], [.3, .9, .4], [1, .45, .9], [1, 1, 1], [.6, .4, 1]], bits = [];
        for (let i = 0; i < 600; i++) { const a = rand(0, 6.283), e = rand(0, .75), sp = rand(8, 20); bits.push({ x: pos.x, y: Math.max(.4, pos.y), z: pos.z, vx: Math.sin(e) * Math.cos(a) * sp, vy: Math.cos(e) * sp, vz: Math.sin(e) * Math.sin(a) * sp, r: rand(0, 6), w: rand(4, 12), f: rand(0, 6), c: pal[i % pal.length], s: rand(.3, .5) }); }
        sfx('pop'); sfx('pop', .12); return { t: 0, bits, p: { x: pos.x, y: Math.max(.4, pos.y), z: pos.z } };
      },
      update(st, dt, E, out) {
        st.t += dt;
        if (st.t < .35) out.glow.push({ x: st.p.x, y: st.p.y, z: st.p.z, s: 6 + st.t * 20, c: [1 - st.t * 2.5, .9 - st.t * 2.2, .8 - st.t * 2] });
        for (const q of st.bits) { q.vy -= 9.8 * dt * .35; q.vx *= 1 - 1.4 * dt; q.vz *= 1 - 1.4 * dt; if (q.vy < -2.4) q.vy = -2.4; q.x += q.vx * dt + Math.sin(st.t * 3 + q.f) * .01; q.y = Math.max(.02, q.y + q.vy * dt); q.z += q.vz * dt; q.r += q.w * dt;
          out.shard.push({ x: q.x, y: q.y, z: q.z, s: q.s, sy: q.s * .55 * Math.abs(Math.sin(st.t * q.w + q.f)) + .01, r: q.r, c: q.c }); }
        return st.t < 5;
      },
    },
    agujero: {
      title: 'Agujero negro', life: 3.6,
      spawn(pos) {
        const p = { x: pos.x, y: Math.max(3, pos.y + 2.5), z: pos.z }, parts = [];
        for (let i = 0; i < 420; i++) parts.push({ a: rand(0, 6.283), r: rand(3.5, 12), h: rand(-.6, .6), sp: rand(1.4, 3), c: [[.75, .3, 1], [.3, .8, 1], [1, .35, .75], [1, 1, 1]][i % 4] });
        sfx('whoosh'); return { t: 0, p, parts };
      },
      update(st, dt, E, out) {
        st.t += dt; const t = st.t, p = st.p, grow = Math.min(1, t / .5), collapse = t > 2.6 ? Math.min(1, (t - 2.6) / .35) : 0;
        out.puff.push({ x: p.x, y: p.y, z: p.z, s: 4.6 * grow * (1 - collapse) + .01, c: [0, 0, 0] });
        out.ring2.push({ x: p.x, y: p.y, z: p.z, s: 6.2 * grow * (1 - collapse) + .01, r: t, c: [.7, .3, 1] });
        for (const q of st.parts) { q.a += q.sp * dt * (6 / (q.r + 1)); q.r = Math.max(.5, q.r - dt * (1.5 + (6 - Math.min(6, q.r)) * .6) * (1 + collapse * 6)); const x = p.x + Math.cos(q.a) * q.r, z = p.z + Math.sin(q.a) * q.r * .45, y = p.y + q.h * q.r * .25 + Math.sin(q.a) * q.r * .2;
          const f = Math.min(1, t * 2) * (1 - collapse) * (q.r < .7 ? .3 : 1); out.glow.push({ x, y, z, s: .7, c: q.c.map((v) => v * f) }); }
        if (t > 2.95 && t < 3.5) { const k = (t - 2.95) / .55; out.glow.push({ x: p.x, y: p.y, z: p.z, s: 3 + k * 30, c: [(1 - k) * .9, (1 - k) * .6, 1 - k] }); out.ring2.push({ x: p.x, y: p.y, z: p.z, s: 2 + k * 40, c: [.8 * (1 - k), .5 * (1 - k), 1 - k] }); if (!st.boom) { st.boom = true; boom(); } }
        return t < 3.6;
      },
    },
    hielo: {
      title: 'Congelado', life: 4,
      spawn(pos) {
        const p = { x: pos.x, y: Math.max(.4, pos.y), z: pos.z }, shards = [], snow = [], mist = [];
        for (let i = 0; i < 90; i++) { const a = rand(0, 6.283), e = Math.acos(rand(-.2, 1)), sp = rand(6, 16); shards.push({ x: p.x, y: p.y, z: p.z, vx: Math.sin(e) * Math.cos(a) * sp, vy: Math.cos(e) * sp, vz: Math.sin(e) * Math.sin(a) * sp, r: rand(0, 6), s: rand(.12, .3), age: 0, life: rand(1, 2.2) }); }
        for (let i = 0; i < 140; i++) snow.push({ x: p.x + rand(-9, 9), y: rand(3, 14), z: p.z + rand(-9, 9), v: rand(.6, 1.6), s: rand(.15, .35), f: rand(0, 6) });
        for (let i = 0; i < 18; i++) { const a = rand(0, 6.283); mist.push({ x: p.x, y: .3, z: p.z, vx: Math.cos(a) * rand(3, 6), vz: Math.sin(a) * rand(3, 6), s: rand(1.2, 2) }); }
        sfx('ice'); return { t: 0, p, shards, snow, mist };
      },
      update(st, dt, E, out) {
        st.t += dt; const t = st.t, p = st.p;
        if (t < .4) out.glow.push({ x: p.x, y: p.y, z: p.z, s: 5 + t * 30, c: [.6 * (1 - t / .4), .9 * (1 - t / .4), 1 - t / .4] });
        if (t < 1.4) out.ring2.push({ x: p.x, y: .1, z: p.z, s: 3 + t * 16, c: [.4 * (1 - t / 1.4), .8 * (1 - t / 1.4), 1 - t / 1.4] });
        for (const q of st.shards) { if (q.age >= q.life) continue; q.age += dt; q.vy -= 9.8 * dt; q.vx *= 1 - .8 * dt; q.vz *= 1 - .8 * dt; q.x += q.vx * dt; q.y = Math.max(.05, q.y + q.vy * dt); q.z += q.vz * dt; if (q.y <= .06) { q.vx = q.vz = q.vy = 0; }
          out.shard.push({ x: q.x, y: q.y, z: q.z, s: q.s * .5, sy: q.s * 1.8, r: q.r + Math.atan2(q.vy, q.vx), c: [.75, .93, 1] }); out.glow.push({ x: q.x, y: q.y, z: q.z, s: q.s * 2, c: [.15, .3, .4] }); }
        for (const q of st.snow) { q.y -= q.v * dt; if (q.y < 0) q.y = 12; out.star.push({ x: q.x + Math.sin(t + q.f) * .4, y: q.y, z: q.z, s: q.s, r: t + q.f, c: [.8 * Math.min(1, t), .9 * Math.min(1, t), Math.min(1, t)] }); }
        for (const q of st.mist) { q.x += q.vx * dt; q.z += q.vz * dt; q.vx *= 1 - dt; q.vz *= 1 - dt; out.puff.push({ x: q.x, y: q.y, z: q.z, s: q.s * (1 + t * .3) * Math.max(0, 1 - t / 3.5), c: [.62, .74, .8] }); }
        return t < 4;
      },
    },
    oro: {
      title: 'Lluvia de oro', life: 4.6,
      spawn(pos) {
        const p = { x: pos.x, y: Math.max(.4, pos.y), z: pos.z }, coins = [], glit = [];
        for (let i = 0; i < 260; i++) { const a = rand(0, 6.283), e = rand(0, .5), sp = rand(9, 19); coins.push({ x: p.x, y: p.y, z: p.z, vx: Math.sin(e) * Math.cos(a) * sp, vy: Math.cos(e) * sp, vz: Math.sin(e) * Math.sin(a) * sp, w: rand(6, 14), f: rand(0, 6), s: rand(.45, .65), rest: false }); }
        for (let i = 0; i < 160; i++) glit.push({ x: p.x + rand(-5, 5), y: p.y + rand(0, 9), z: p.z + rand(-5, 5), f: rand(0, 6), v: rand(.3, 1) });
        sfx('coins'); return { t: 0, p, coins, glit };
      },
      update(st, dt, E, out) {
        st.t += dt; const t = st.t, p = st.p;
        if (t < .5) { out.glow.push({ x: p.x, y: p.y, z: p.z, s: 7 + t * 25, c: [1 - t * 2, .8 - t * 1.6, .2 - t * .4] }); out.ring2.push({ x: p.x, y: p.y, z: p.z, s: 3 + t * 40, c: [1 - t * 2, .75 - t * 1.5, .15] }); }
        for (const q of st.coins) { if (!q.rest) { q.vy -= 9.8 * dt * .8; q.vx *= 1 - .5 * dt; q.vz *= 1 - .5 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; if (q.y < .06) { q.y = .06; if (Math.abs(q.vy) > 2) { q.vy *= -.35; q.vx *= .5; q.vz *= .5; } else q.rest = true; } }
          const spin = q.rest ? .15 : Math.abs(Math.sin(t * q.w + q.f)); const sh = .75 + .25 * Math.sin(t * q.w * 2 + q.f); out.coin.push({ x: q.x, y: q.y, z: q.z, s: q.s * (spin * .85 + .15), sy: q.s, r: 0, c: [1 * sh, .78 * sh, .18 * sh] }); }
        for (const q of st.glit) { q.y -= q.v * dt; const tw = Math.max(0, Math.sin(t * 8 + q.f)); out.star.push({ x: q.x, y: q.y, z: q.z, s: .25 + .25 * tw, r: t + q.f, c: [tw, .85 * tw, .35 * tw] }); }
        return t < 4.6;
      },
    },
    tornado: {
      title: 'Tornado de fuego', life: 4.2,
      spawn(pos) {
        const p = { x: pos.x, y: 0, z: pos.z }, parts = [], embers = [];
        for (let i = 0; i < 380; i++) parts.push({ h: rand(0, 1), a: rand(0, 6.283), sp: rand(4, 7), s: rand(.6, 1.4) });
        for (let i = 0; i < 120; i++) embers.push({ x: p.x, y: rand(0, 3), z: p.z, vx: rand(-2, 2), vy: rand(2, 7), vz: rand(-2, 2), age: rand(-2.5, 0), life: rand(1, 2) });
        sfx('whoosh'); sfx('fire'); return { t: 0, p, parts, embers };
      },
      update(st, dt, E, out) {
        st.t += dt; const t = st.t, p = st.p, grow = Math.min(1, t / .8), fade = t > 3.4 ? 1 - (t - 3.4) / .8 : 1, H = 11 * grow;
        for (const q of st.parts) { q.a += q.sp * dt; q.h = (q.h + dt * .35) % 1; const y = q.h * H, R = .5 + q.h * 2.6 + Math.sin(t * 3 + q.h * 8) * .25; const x = p.x + Math.cos(q.a) * R, z = p.z + Math.sin(q.a) * R;
          const heat = 1 - q.h, f = fade * Math.min(1, t * 3); out.glow.push({ x, y, z, s: q.s * (1.2 - q.h * .5), c: [1 * f, (.35 + .5 * heat) * f, (.05 + .2 * heat * heat) * f] }); }
        out.glow.push({ x: p.x, y: .5, z: p.z, s: 6, c: [.8 * fade * grow, .35 * fade * grow, .05] });
        for (const q of st.embers) { q.age += dt; if (q.age < 0) continue; if (q.age > q.life) { q.age = rand(-.5, 0); q.x = p.x; q.y = rand(0, 3); q.z = p.z; } q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; const f = (1 - q.age / q.life) * fade; out.glow.push({ x: q.x, y: q.y, z: q.z, s: .18, c: [f, .55 * f, .1 * f] }); }
        if (t > .5) out.puff.push({ x: p.x, y: H + 1, z: p.z, s: 5 * grow, c: [.12, .1, .09] });
        return t < 4.2;
      },
    },
  };

  let ac = null;
  // Sonidos sintetizados de los efectos nuevos (sin archivos).
  function sfx(kind, delay = 0) {
    try {
      ac = ac || new (g.AudioContext || g.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume();
      const t0 = ac.currentTime + delay, out = ac.destination;
      const noise = (dur, shape = 2) => { const b = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, shape); const n = ac.createBufferSource(); n.buffer = b; return n; };
      const env = (node, peak, a, r) => { const gn = ac.createGain(); gn.gain.setValueAtTime(0.0001, t0); gn.gain.exponentialRampToValueAtTime(peak, t0 + a); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + a + r); node.connect(gn).connect(out); return gn; };
      const filt = (type, f, q = 1) => { const x = ac.createBiquadFilter(); x.type = type; x.frequency.value = f; x.Q.value = q; return x; };
      if (kind === 'launch') { const o = ac.createOscillator(); o.frequency.setValueAtTime(500, t0); o.frequency.exponentialRampToValueAtTime(1600, t0 + .9); env(o, .06, .05, .9); o.start(t0); o.stop(t0 + 1); }
      else if (kind === 'pop') { const n = noise(.35, 3), f = filt('highpass', 900); n.connect(f); env(f, .35, .005, .3); n.start(t0); }
      else if (kind === 'thunder') { const n = noise(2.2, 1.4), f = filt('lowpass', 420); n.connect(f); env(f, .7, .02, 2); n.start(t0); const c = noise(.25, 4), h = filt('highpass', 1500); c.connect(h); env(h, .4, .002, .2); c.start(t0); }
      else if (kind === 'whoosh') { const n = noise(1.4, 1), f = filt('bandpass', 300, 2); f.frequency.setValueAtTime(200, t0); f.frequency.exponentialRampToValueAtTime(2400, t0 + 1.2); n.connect(f); env(f, .4, .3, 1); n.start(t0); }
      else if (kind === 'ice') { [2093, 2637, 3136, 4186].forEach((fr, i) => { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = fr; const gn = ac.createGain(), t1 = t0 + i * .07; gn.gain.setValueAtTime(0.0001, t1); gn.gain.exponentialRampToValueAtTime(.08, t1 + .005); gn.gain.exponentialRampToValueAtTime(0.0001, t1 + 1.1); o.connect(gn).connect(out); o.start(t1); o.stop(t1 + 1.2); }); const n = noise(.3, 3), f = filt('highpass', 3000); n.connect(f); env(f, .3, .003, .25); n.start(t0); }
      else if (kind === 'coins') { for (let i = 0; i < 16; i++) { const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = 2400 + Math.random() * 2200; const gn = ac.createGain(), t1 = t0 + i * .06 + Math.random() * .03; gn.gain.setValueAtTime(0.0001, t1); gn.gain.exponentialRampToValueAtTime(.05, t1 + .004); gn.gain.exponentialRampToValueAtTime(0.0001, t1 + .18); o.connect(gn).connect(out); o.start(t1); o.stop(t1 + .2); } }
      else if (kind === 'fire') { const n = noise(3, .6), f = filt('lowpass', 900); n.connect(f); env(f, .25, .3, 2.6); n.start(t0); }
    } catch (e) {}
  }
  function boom() {
    try {
      ac = ac || new (g.AudioContext || g.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      const t0 = ac.currentTime, o = ac.createOscillator(), og = ac.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(140, t0); o.frequency.exponentialRampToValueAtTime(34, t0 + 0.55);
      og.gain.setValueAtTime(0.0001, t0); og.gain.exponentialRampToValueAtTime(0.5, t0 + 0.02); og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
      o.connect(og).connect(ac.destination); o.start(t0); o.stop(t0 + 0.75);
      const n = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.6), ac.sampleRate), d = n.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.2);
      const ns = ac.createBufferSource(), ng = ac.createGain(), lp = ac.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1600; ng.gain.value = 0.32; ns.buffer = n; ns.connect(lp).connect(ng).connect(ac.destination); ns.start(t0);
    } catch (e) {}
  }

  function play(id, pos) {
    const view = g.lfoArchive && g.lfoArchive.view; if (!view || !view.scene || !EFFECTS[id]) return false;
    if (!ctx) build(view);
    const fx = EFFECTS[id];
    live.push({ id, fx, st: fx.spawn(pos) });
    return true;
  }

  // Lo llama el renderer cada cuadro (hook en stadiumTick).
  function tick(view, dt) {
    if (!ctx || !live.length) { if (ctx && (ctx.flash.count || ctx.sparks.count || Object.values(ctx.CH).some((m) => m.count))) clearAll(); return; }
    dt = clamp(dt || 0, 0, 0.1);
    const cam = view.camera, E = cam && cam.matrixWorld ? cam.matrixWorld.elements : null; if (!E) return;
    const out = { flash: [], ring: [], sparks: [], core: [], smoke: [], glow: [], ring2: [], puff: [], star: [], shard: [], coin: [] };
    for (let i = live.length - 1; i >= 0; i--) if (!live[i].fx.update(live[i].st, dt, E, out)) live.splice(i, 1);
    const put = (m, list, cap, alpha) => {
      const a = m.instanceMatrix.array, n = Math.min(cap, list.length);
      for (let k = 0; k < n; k++) { const q = list[k]; bb(a, k, q.x, q.y, q.z, Math.max(0.001, q.s), q.r || 0, E); }
      m.count = n; m.instanceMatrix.needsUpdate = true;
      if (alpha != null && list.length) m.material.opacity = alpha;
    };
    put(ctx.flash, out.flash, 8, out.flash.length ? out.flash[0].a : 0);
    put(ctx.ring, out.ring, 8, out.ring.length ? out.ring[0].a * 0.9 : 0);
    put(ctx.sparks, out.sparks, 260);
    put(ctx.core, out.core, 40);
    put(ctx.smoke, out.smoke, 48);
    // canales con color por partícula: c = [r, g, b] (0..1); en los aditivos el color ya lleva el desvanecido
    for (const k of Object.keys(ctx.CH)) {
      const m = ctx.CH[k], list = out[k], cap = m.instanceMatrix.count, a = m.instanceMatrix.array, n = Math.min(cap, list.length);
      for (let i = 0; i < n; i++) { const q = list[i]; bb(a, i, q.x, q.y, q.z, Math.max(0.001, q.s), q.r || 0, E, q.sy); ctx.col.setRGB(q.c[0], q.c[1], q.c[2]); m.setColorAt(i, ctx.col); }
      m.count = n; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  }
  function clearAll() { ['flash', 'ring', 'sparks', 'core', 'smoke'].forEach((k) => { ctx[k].count = 0; ctx[k].instanceMatrix.needsUpdate = true; }); for (const m of Object.values(ctx.CH)) { m.count = 0; m.instanceMatrix.needsUpdate = true; } }

  // El motor avisó un gol: si es del equipo del usuario y tiene un efecto equipado para la situación, se dispara.
  g.addEventListener('lfo:goal', (e) => {
    const d = e.detail || {};
    if (!d.mine) return;
    const id = g.LFOCosmetics && g.LFOCosmetics.pickGoalFx ? g.LFOCosmetics.pickGoalFx(d.situation) : null;
    if (id) play(id, d);
  });

  g.LFOGoalFX = { effects: Object.keys(EFFECTS), play, tick, preview(id = 'explosion') { const m = g.lfoArchive && g.lfoArchive.match; const b = m && m.ball ? m.ball : { x: 0, y: 1, z: 0 }; return play(id, { x: b.x, y: b.y, z: b.z }); } };
})(window);
