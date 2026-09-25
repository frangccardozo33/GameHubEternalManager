/* LFO · Efectos de gol (cosmético de la Tienda Diaria, tipo "gfx").
 *
 * Cuando el equipo del usuario mete un gol, si tiene un efecto equipado para esa situación (normal / últimos 5' / 4º gol),
 * sale del balón, en el punto donde entró. Hoy hay uno solo: "Explosión" (destello, onda expansiva, chispas y humo).
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
    ctx = { T3, view, group, geo, textures: [softT, ringT],
      flash: inst(softT, '#fff0b8', 8, 2), ring: inst(ringT, '#ffc25a', 8, 2), sparks: inst(softT, '#ffb347', 260, 2), core: inst(softT, '#ff6a1f', 40, 2, 0.9), smoke: inst(softT, '#3b3833', 48, 1, 0.55) };
  }

  function bb(arr, k, x, y, z, s, roll, E) {
    const c = Math.cos(roll) * s, sn = Math.sin(roll) * s, o = k * 16;
    arr[o] = E[0] * c + E[4] * sn; arr[o + 1] = E[1] * c + E[5] * sn; arr[o + 2] = E[2] * c + E[6] * sn; arr[o + 3] = 0;
    arr[o + 4] = -E[0] * sn + E[4] * c; arr[o + 5] = -E[1] * sn + E[5] * c; arr[o + 6] = -E[2] * sn + E[6] * c; arr[o + 7] = 0;
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
  };

  let ac = null;
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
    if (!ctx || !live.length) { if (ctx && (ctx.flash.count || ctx.sparks.count)) clearAll(); return; }
    dt = clamp(dt || 0, 0, 0.1);
    const cam = view.camera, E = cam && cam.matrixWorld ? cam.matrixWorld.elements : null; if (!E) return;
    const out = { flash: [], ring: [], sparks: [], core: [], smoke: [] };
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
  }
  function clearAll() { ['flash', 'ring', 'sparks', 'core', 'smoke'].forEach((k) => { ctx[k].count = 0; ctx[k].instanceMatrix.needsUpdate = true; }); }

  // El motor avisó un gol: si es del equipo del usuario y tiene un efecto equipado para la situación, se dispara.
  g.addEventListener('lfo:goal', (e) => {
    const d = e.detail || {};
    if (!d.mine) return;
    const id = g.LFOCosmetics && g.LFOCosmetics.pickGoalFx ? g.LFOCosmetics.pickGoalFx(d.situation) : null;
    if (id) play(id, d);
  });

  g.LFOGoalFX = { effects: Object.keys(EFFECTS), play, tick, preview() { const m = g.lfoArchive && g.lfoArchive.match; const b = m && m.ball ? m.ball : { x: 0, y: 1, z: 0 }; return play('explosion', { x: b.x, y: b.y, z: b.z }); } };
})(window);
