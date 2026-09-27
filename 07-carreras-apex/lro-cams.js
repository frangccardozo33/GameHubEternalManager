/* LRO · cámaras nuevas (orbital, dron libre, TV dinámica, trasera, laterales), cabina 3D con volante dinámico,
 * ventanas pequeñas (situación 2 + trasera) y motor con muestras reales (con respaldo sintetizado).
 * Se carga después de lro-extras.js. */
(function () {
  'use strict';
  const V = THREE.Vector3, dom = $('scene');
  const hex = (n) => '#' + (n >>> 0).toString(16).padStart(6, '0').slice(-6);
  const focusCar = () => state.cars[state.focus] || state.order[0] || state.cars[0];
  const isRace = () => state.phase === 'race' || state.phase === 'countdown' || state.phase === 'finished';

  // ---------------------------------------------------------------- botones de cámara
  const bar = document.querySelector('.view-controls');
  const NEW_CAMS = [['orbit', '⟲ ORBITAL'], ['drone', '✈ DRON'], ['tv', '📺 TV DINÁMICA'], ['rear', '◀ TRASERA'], ['left', '⬅ IZQ.'], ['right', 'DER. ➡']];
  if (bar) {
    NEW_CAMS.forEach(([k, l]) => { const b = document.createElement('button'); b.dataset.camera = k; b.textContent = l; bar.appendChild(b); });
    const pip = document.createElement('button'); pip.id = 'pip-toggle'; pip.className = 'active'; pip.textContent = '▣ VENTANAS'; pip.title = 'Ventanas pequeñas con otras situaciones de la carrera'; bar.appendChild(pip);
    pip.onclick = () => { PIP.on = !PIP.on; pip.classList.toggle('active', PIP.on); layoutPips(); };
    bar.querySelectorAll('[data-camera]').forEach((button) => {
      if (NEW_CAMS.some((c) => c[0] === button.dataset.camera)) button.onclick = () => {
        state.cameraMode = button.dataset.camera; state.focusLocked = state.focusLocked || button.dataset.camera !== 'auto'; state.cameraTimer = 0;
        bar.querySelectorAll('[data-camera]').forEach((b) => b.classList.toggle('active', b === button));
        if (state.cameraMode === 'drone') droneInit();
        layoutPips();
        showHelp(state.cameraMode === 'drone' ? (window.EMMobile && EMMobile.touch ? 'DRON LIBRE · cruz izquierda: mover · ↑/↓: subir-bajar · ⚡ turbo · arrastrá la escena para mirar' : 'DRON LIBRE · WASD mover · Q/E bajar-subir · arrastrar con el mouse para mirar · rueda: velocidad · Shift: turbo') : '');
      };
    });
  }
  let helpEl = null, helpT = 0;
  function showHelp(t) { if (!t) return; const h = document.querySelector('.broadcast'); if (!helpEl) { helpEl = document.createElement('div'); helpEl.className = 'lx-help'; h.appendChild(helpEl); } helpEl.textContent = t; helpEl.classList.add('on'); clearTimeout(helpT); helpT = setTimeout(() => helpEl.classList.remove('on'), 6000); }

  // ---------------------------------------------------------------- dron libre
  const drone = { p: new V(), yaw: 0, pitch: -.35, speed: 40, keys: {} };
  function droneInit() {
    const c = focusCar(), f = sample(c.s, c.lane);
    drone.p.copy(f.p).addScaledVector(f.tangent, -24).add(new V(0, 16, 0)); drone.yaw = Math.atan2(f.tangent.x, f.tangent.z); drone.pitch = -.4;
  }
  window.addEventListener('keydown', (e) => { if (state.cameraMode === 'drone' && /^(KeyW|KeyA|KeyS|KeyD|KeyQ|KeyE|ShiftLeft|ShiftRight)$/.test(e.code) && !/INPUT|SELECT|TEXTAREA/.test((document.activeElement || {}).tagName)) { drone.keys[e.code] = true; e.stopPropagation(); } }, true);
  window.addEventListener('keyup', (e) => { delete drone.keys[e.code]; });
  setInterval(() => { try { window.EMMobile && EMMobile.dronePad(state.cameraMode === 'drone' && !document.hidden, dom); } catch (e) {} }, 400);
  let drag = null;
  dom.addEventListener('pointerdown', (e) => { if (state.cameraMode === 'drone') { drag = { x: e.clientX, y: e.clientY }; dom.setPointerCapture(e.pointerId); } });
  dom.addEventListener('pointermove', (e) => { if (!drag) return; drone.yaw -= (e.clientX - drag.x) * .005; drone.pitch = Math.max(-1.5, Math.min(1.2, drone.pitch - (e.clientY - drag.y) * .004)); drag = { x: e.clientX, y: e.clientY }; });
  dom.addEventListener('pointerup', () => { drag = null; });
  dom.addEventListener('wheel', (e) => { if (state.cameraMode === 'drone') { e.preventDefault(); drone.speed = Math.max(8, Math.min(260, drone.speed * (e.deltaY < 0 ? 1.15 : .87))); } }, { passive: false });

  // ---------------------------------------------------------------- TV dinámica
  const tv = { shot: 0, t: 0, pos: new V(), fixed: null };
  function tvPick(car) {
    tv.shot = (tv.shot + 1) % 6; tv.t = 4.5 + Math.random() * 3; tv.fixed = null;
    if (tv.shot === 1 || tv.shot === 4) { const st = sample(car.s + 55, (Math.random() < .5 ? -1 : 1) * (12 + Math.random() * 8)); tv.fixed = st.p.clone().add(new V(0, 1.6 + Math.random() * 3, 0)); }
    if (tv.shot === 2) { const st = sample(car.s + 90, -35); tv.fixed = st.p.clone().add(new V(0, 22, 0)); }
  }
  const names = { orbit: 'ORBITAL', drone: 'DRON LIBRE', tv: 'TV DINÁMICA', rear: 'TRASERA', left: 'LATERAL IZQ.', right: 'LATERAL DER.' };
  const shake = { v: 0 };
  const _cam = updateCamera;
  const active = () => state.cameraMode === 'onboard' && isRace() && !(window.Q && Q.active);
  updateCamera = function (dt) {
    const mode = state.cameraMode;
    if ((window.Q && Q.active) || !names[mode]) { _cam(dt); if (active()) { $('onboard-hud').style.display = 'none'; onboardMotion(dt); } return; }
    if (state.phase === 'grid' && mode !== 'drone') return _cam(dt);
    const car = focusCar(), f = sample(car.s, car.lane); let pos, aim = f.p.clone().add(new V(0, 1.1, 0)), fov = 50, snap = false;
    if (mode === 'orbit') {
      tv.orb = (tv.orb || 0) + dt * .38; const r = 20 + Math.min(10, car.v * .08);
      pos = f.p.clone().add(new V(Math.cos(tv.orb) * r, 7 + Math.sin(tv.orb * .5) * 3, Math.sin(tv.orb) * r)); fov = 48;
    } else if (mode === 'drone') {
      const k = drone.keys, sp = drone.speed * (k.ShiftLeft || k.ShiftRight ? 3 : 1) * dt, fw = new V(Math.sin(drone.yaw) * Math.cos(drone.pitch), Math.sin(drone.pitch), Math.cos(drone.yaw) * Math.cos(drone.pitch)), rt = new V().crossVectors(fw, new V(0, 1, 0)).normalize().negate();
      if (k.KeyW) drone.p.addScaledVector(fw, sp); if (k.KeyS) drone.p.addScaledVector(fw, -sp);
      if (k.KeyD) drone.p.addScaledVector(rt, sp); if (k.KeyA) drone.p.addScaledVector(rt, -sp);
      if (k.KeyE) drone.p.y += sp; if (k.KeyQ) drone.p.y -= sp; drone.p.y = Math.max(1.5, drone.p.y);
      pos = drone.p.clone(); aim = drone.p.clone().add(fw); snap = true; fov = 60;
    } else if (mode === 'tv') {
      tv.t -= dt; if (tv.t <= 0) tvPick(car);
      const s = tv.shot;
      if (s === 0) { pos = f.p.clone().addScaledVector(f.tangent, -14).addScaledVector(f.normal, -6).add(new V(0, 5.5, 0)); fov = 50; }
      else if (s === 1 || s === 4) { pos = tv.fixed || f.p.clone().addScaledVector(f.normal, -14); aim = f.p.clone().addScaledVector(f.tangent, car.v * .12); fov = Math.max(14, 44 - Math.max(0, 1 - Math.hypot(car.position.x - pos.x, car.position.z - pos.z) / 80) * 30); snap = true; }
      else if (s === 2) { pos = tv.fixed; fov = 34; snap = true; }
      else if (s === 3) { pos = f.p.clone().addScaledVector(f.tangent, 4.8).addScaledVector(f.normal, -2.6).add(new V(0, .45, 0)); aim = f.p.clone().addScaledVector(f.tangent, 30).add(new V(0, .6, 0)); fov = 68; snap = true; }
      else { pos = f.p.clone().addScaledVector(f.tangent, 32).addScaledVector(f.normal, -30).add(new V(0, 26 + Math.sin(performance.now() / 2500) * 6, 0)); aim.addScaledVector(f.tangent, -4); fov = 40; }
      shake.v = Math.min(1, car.v / 80) * (s === 3 ? .05 : .012);
    } else if (mode === 'rear') {
      pos = f.p.clone().addScaledVector(f.tangent, -.9).add(new V(0, 1.6, 0)); aim = f.p.clone().addScaledVector(f.tangent, -60).add(new V(0, 1.2, 0)); fov = 62; snap = true;
    } else if (mode === 'left' || mode === 'right') {
      const sd = mode === 'left' ? 1 : -1; pos = f.p.clone().addScaledVector(f.normal, -sd * 1.7).addScaledVector(f.tangent, .6).add(new V(0, 1.15, 0)); aim = pos.clone().addScaledVector(f.normal, -sd * 30).addScaledVector(f.tangent, -8); fov = 70; snap = true;
    }
    if (snap) { camera.position.copy(pos); cameraAim.copy(aim); } else { const k = 1 - Math.exp(-dt * 3.4); camera.position.lerp(pos, k); cameraAim.lerp(aim, k); }
    if (shake.v > 0) camera.position.add(new V((Math.random() - .5) * shake.v, (Math.random() - .5) * shake.v, (Math.random() - .5) * shake.v));
    camera.fov += (fov - camera.fov) * .08; camera.updateProjectionMatrix(); camera.lookAt(cameraAim);
    $('camera-label').textContent = 'CAM · ' + names[mode] + (mode === 'tv' ? ' ' + (tv.shot + 1) + '/6' : '');
    $('onboard-hud').style.display = 'none';
    sun.position.copy(f.p).add(new V(-160, 240, 110)); sun.target.position.copy(f.p);
  };

  // ---------------------------------------------------------------- ventanas pequeñas (PiP)
  const PIP = { on: true, wins: [], t: 0, battle: null };
  const pcam = [new THREE.PerspectiveCamera(58, 16 / 9, .3, 2000), new THREE.PerspectiveCamera(62, 16 / 9, .3, 2000), new THREE.PerspectiveCamera(60, 16 / 9, .3, 2000)];
  const holder = document.createElement('div'); holder.className = 'lx-pips'; document.querySelector('.broadcast').appendChild(holder);
  const LABELS = ['SITUACIÓN 2', 'TRASERA', 'BOXES / INCIDENTE'];
  PIP.wins = LABELS.map((l, i) => { const d = document.createElement('div'); d.className = 'lx-pip'; d.innerHTML = `<span class="pl"></span><span class="pt">${l}</span>`; d.onclick = () => { if (PIP.cars && PIP.cars[i]) { state.focus = PIP.cars[i].id; state.focusLocked = true; state.cameraTimer = 5; } }; holder.appendChild(d); return d; });
  PIP.cars = [null, null, null];
  function pickPip() {
    const fc = focusCar(); if (!fc) return;
    // 1) batalla más cerrada que no incluya al auto en foco
    let best = null, bg = 1e9; const o = state.order;
    for (let i = 1; i < o.length; i++) { const a = o[i - 1], b = o[i]; if (a.finished || b.finished || a.dnf || b.dnf || a === fc || b === fc) continue; const g = (a.s - b.s) / Math.max(22, b.v); if (g < bg) { bg = g; best = [a, b, i]; } }
    PIP.battle = best; PIP.cars[0] = best ? best[1] : null; PIP.gap = bg; PIP.pos = best ? best[2] : 0;
    PIP.cars[1] = fc;
    // 3) incidente: spin, boxes o daño alto
    PIP.cars[2] = state.cars.find((c) => c !== fc && c !== PIP.cars[0] && !c.finished && (c.state === 'Spin' || c.state === 'PitStop' || c.state === 'PitEntry')) || null;
  }
  function layoutPips() {
    const r = dom.getBoundingClientRect(), bc = document.querySelector('.broadcast'), cs = getComputedStyle(bc), px = (v) => parseFloat(cs.getPropertyValue(v)) || 0;
    const lbl = $('camera-label').getBoundingClientRect(), br = bc.getBoundingClientRect(), mapEl = document.getElementById('map-box'), mr = mapEl ? mapEl.getBoundingClientRect() : null;
    const nar = r.width < 560, short = r.height < 420, w = nar ? Math.max(96, Math.min(130, r.width * .27)) : short ? 130 : Math.max(150, Math.min(250, r.width * .2)), h = Math.round(w * 9 / 16);
    const x0 = r.width - w - Math.max(px('--ui-in'), px('--em-sar')) , y0 = (lbl.bottom - br.top) + 8, yMax = (mr && mr.height > 30 ? mr.top : br.bottom - 60) - br.top - 8;
    PIP.rects = [];
    PIP.wins.forEach((d, i) => {
      const y = y0 + i * (h + 8), show = PIP.on && isRace() && state.phase !== 'finished' && !(window.Q && Q.active) && PIP.cars[i] && state.cameraMode !== 'onboard' && y + h <= yMax && !(document.documentElement.classList.contains('em-portrait') && i > 0);
      d.style.display = show ? 'block' : 'none'; d.style.left = x0 + 'px'; d.style.top = y + 'px'; d.style.width = w + 'px'; d.style.height = h + 'px';
      PIP.rects[i] = show ? { x: x0, y, w, h } : null;
      if (show) { const c = PIP.cars[i]; d.querySelector('.pl').textContent = i === 0 && PIP.battle ? `P${PIP.pos}-P${PIP.pos + 1} · +${PIP.gap.toFixed(2)}s` : i === 1 ? c.driver.short + ' · P' + c.rank : c.driver.short + ' · ' + (c.state === 'Spin' ? 'TROMPO' : 'BOXES'); d.style.borderColor = hex(c.team.color); }
    });
  }
  new ResizeObserver(layoutPips).observe(document.querySelector('.broadcast'));
  const origRender = renderer.render.bind(renderer);
  let mirrorTick = 0;
  renderer.render = function (sc, cam) {
    const main = cam === camera && sc === scene, onb = main && active(), fc = onb ? focusCar() : null;
    // a bordo: el auto propio no se dibuja en la escena (lo reemplaza la cabina: sin bloques ni cortes delante de la cámara)
    if (fc && fc.mesh) fc.mesh.group.visible = false;
    origRender(sc, cam);
    if (!main) { if (fc && fc.mesh) fc.mesh.group.visible = true; return; }
    const r = dom.getBoundingClientRect(); if (!r.width) { if (fc && fc.mesh) fc.mesh.group.visible = true; return; }
    const ac = renderer.autoClear;
    if (onb) {
      // retrovisores: render trasero (sin post-proceso) a una textura chica, cada 2 cuadros
      if ((mirrorTick++ & 1) === 0 && cabKind) {
        const f = sample(fc.s, fc.lane); rearCam.position.copy(f.p).addScaledVector(f.tangent, -.6).add(new V(0, 1.55, 0)); rearCam.lookAt(f.p.clone().addScaledVector(f.tangent, -60).add(new V(0, 1.1, 0)));
        rearCam.fov = 38; rearCam.aspect = 4; rearCam.updateProjectionMatrix();
        const prev = renderer.getRenderTarget(); renderer.setRenderTarget(mirrorRT); renderer.autoClear = true; origRender(scene, rearCam); renderer.setRenderTarget(prev);
      }
      if (fc.mesh) fc.mesh.group.visible = true;
      renderer.autoClear = false; renderer.setScissorTest(true);
      const W = r.width, H = r.height, portrait = H > W * 1.05; renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H); renderer.clearDepth();
      // vertical: volante recortado abajo (el tablero grande va arriba como panel); horizontal: cabina completa
      cockCam.aspect = W / H; cockCam.fov = portrait ? 64 : Math.max(62, Math.min(80, camera.fov)); cockCam.position.set(0, portrait ? .04 : .07, portrait ? -.18 : 0); cockCam.rotation.set(portrait ? -.06 : 0, 0, 0);
      cockCam.updateProjectionMatrix(); origRender(cock, cockCam);
    } else if (PIP.on && PIP.rects) {
      renderer.autoClear = false; renderer.setScissorTest(true);
      PIP.rects.forEach((rc, i) => {
        const c = PIP.cars[i]; if (!rc || !c) return;
        const f = sample(c.s, c.lane), pc = pcam[i];
        if (i === 1) { pc.position.copy(f.p).addScaledVector(f.tangent, -.9).add(new V(0, 1.6, 0)); pc.lookAt(f.p.clone().addScaledVector(f.tangent, -60).add(new V(0, 1.2, 0))); }
        else { pc.position.copy(f.p).addScaledVector(f.tangent, -13).addScaledVector(f.normal, -4).add(new V(0, 5, 0)); pc.lookAt(f.p.clone().addScaledVector(f.tangent, 12).add(new V(0, 1, 0))); }
        const y = r.height - rc.y - rc.h; renderer.setViewport(rc.x, y, rc.w, rc.h); renderer.setScissor(rc.x, y, rc.w, rc.h); renderer.clearDepth();
        pc.aspect = rc.w / rc.h; pc.updateProjectionMatrix(); origRender(scene, pc);
      });
    }
    renderer.setScissorTest(false); renderer.setViewport(0, 0, r.width, r.height); renderer.autoClear = ac;
  };
  setInterval(() => { if (isRace() && state.phase !== 'finished') { pickPip(); layoutPips(); } else layoutPips(); }, 1500);

  // ---------------------------------------------------------------- cabina 3D (por categoría) + movimiento de cámara a bordo
  // Se dibuja DESPUÉS del post-proceso (ver renderer.render más abajo): queda nítida mientras el fondo lleva motion blur.
  // Categorías: 'turismo' (classic/touring) y 'gt' (resto).
  const cock = new THREE.Scene(), cockCam = new THREE.PerspectiveCamera(62, 16 / 9, .05, 20);
  cock.add(new THREE.HemisphereLight(0xcfe0ff, 0x1a1c22, 2.1)); const dl = new THREE.DirectionalLight(0xffffff, 1.9); dl.position.set(.6, 2.2, .8); cock.add(dl);
  const rim$ = new THREE.DirectionalLight(0x9fc3ff, .6); rim$.position.set(-1, .4, -2); cock.add(rim$);
  function carbonTex() {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const g = x.createLinearGradient(i * 8, j * 8, i * 8 + 8, j * 8 + 8), o = (i + j) % 2; g.addColorStop(0, o ? '#1b2129' : '#0d1117'); g.addColorStop(1, o ? '#0b0e13' : '#1a1f27'); x.fillStyle = g; x.fillRect(i * 8, j * 8, 8, 8); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10); if ('colorSpace' in t) t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const M = {
    carbon: new THREE.MeshStandardMaterial({ map: carbonTex(), color: 0xffffff, roughness: .42, metalness: .35 }),
    matte: new THREE.MeshStandardMaterial({ color: 0x15181d, roughness: .95 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x101216, roughness: .85 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x8b9199, roughness: .35, metalness: .9 }),
    cage: new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: .5, metalness: .6 }),
    pad: new THREE.MeshStandardMaterial({ color: 0x1d2027, roughness: 1 }),
    paint: new THREE.MeshStandardMaterial({ color: 0xd96a32, roughness: .28, metalness: .45 }),
    glove: new THREE.MeshStandardMaterial({ color: 0x20242b, roughness: .8 }),
    gloveAcc: new THREE.MeshStandardMaterial({ color: 0xe5233d, roughness: .7 }),
    sleeve: new THREE.MeshStandardMaterial({ color: 0xe5233d, roughness: .85 }),
    glass: new THREE.MeshBasicMaterial({ color: 0xb8d4ff, transparent: true, opacity: .05, depthWrite: false })
  };
  const mk = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); (parent || cab).add(m); return m; };
  const tube = (a, b, r, mat, parent) => { const d = new V().subVectors(b, a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 10), mat); m.position.copy(a).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(new V(0, 1, 0), d.normalize()); (parent || cab).add(m); return m; };
  const cab = new THREE.Group(); cock.add(cab);
  let cabKind = '';

  // pantalla de datos (canvas compartido: 3D en el tablero y panel grande arriba en vertical)
  const dc = document.createElement('canvas'); dc.width = 640; dc.height = 320; const dx = dc.getContext('2d'), dtex = new THREE.CanvasTexture(dc);
  if ('colorSpace' in dtex) dtex.colorSpace = THREE.SRGBColorSpace;
  const wc = document.createElement('canvas'); wc.width = 256; wc.height = 128; const wx = wc.getContext('2d'), wtex = new THREE.CanvasTexture(wc);
  // espejos: un único render trasero de baja resolución, repartido por UV entre los retrovisores (espejado en X)
  const mirrorRT = new THREE.WebGLRenderTarget(480, 120, { depthBuffer: true });
  if ('colorSpace' in mirrorRT.texture) mirrorRT.texture.colorSpace = THREE.SRGBColorSpace;
  const rearCam = pcam[1];
  const mirrorMat = new THREE.MeshBasicMaterial({ map: mirrorRT.texture, toneMapped: false });
  function mirrorGeo(w, h, u0, u1) { const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, u1 - uv.getX(i) * (u1 - u0)); return g; }
  const leds = [], wheel = new THREE.Group(), spin = new THREE.Group(); wheel.add(spin);
  const hands = [], arms = [], shoulders = [new V(-.24, -.78, .05), new V(.24, -.78, .05)];
  let hood = null, wiper = null, screenMesh = null;

  function buildWheel(kind) {
    spin.clear(); leds.length = 0; hands.length = 0;
    {
      // volante GT / turismo: aro achatado abajo, placa central de carbono con pantalla
      const rim = mk(new THREE.TorusGeometry(.165, .021, 12, 48), M.rubber, 0, 0, 0, 0, 0, 0, spin); rim.scale.set(1, kind === 'gt' ? .86 : 1, 1);
      mk(new THREE.BoxGeometry(.3, .11, .03), M.carbon, 0, -.01, 0, 0, 0, 0, spin);
      for (const sd of [-1, 1]) mk(new THREE.BoxGeometry(.06, .025, .02), M.carbon, sd * .15, -.01, 0, 0, 0, 0, spin);
      mk(new THREE.PlaneGeometry(.09, .045), new THREE.MeshBasicMaterial({ map: wtex, toneMapped: false }), 0, .005, .017, 0, 0, 0, spin);
      mk(new THREE.BoxGeometry(.02, .035, .012), new THREE.MeshBasicMaterial({ color: 0xffd24a }), 0, kind === 'gt' ? .142 : .165, .012, 0, 0, 0, spin);
      [[-.1, .02, 0xff3030], [-.1, -.03, 0x30ff60], [.1, .02, 0x3090ff], [.1, -.03, 0xffd030]].forEach(([x, y, c]) => mk(new THREE.CylinderGeometry(.01, .01, .012, 10), new THREE.MeshStandardMaterial({ color: c, roughness: .4, emissive: c, emissiveIntensity: .25 }), x, y, .02, Math.PI / 2, 0, 0, spin));
      if (kind === 'gt') for (let i = 0; i < 10; i++) { const m = mk(new THREE.SphereGeometry(.006, 8, 6), new THREE.MeshBasicMaterial({ color: 0x222833 }), -.063 + i * .014, .04, .018, 0, 0, 0, spin); leds.push(m); }
    }
    // manos (guantes) sobre el aro a «las 9 y cuarto»
    const gx = .158, gy = .01;
    for (const sd of [-1, 1]) {
      const h = new THREE.Group(); h.position.set(sd * gx, gy, .01); spin.add(h);
      const palm = mk(new THREE.SphereGeometry(.036, 14, 10), M.glove, sd * .008, 0, .012, 0, 0, 0, h); palm.scale.set(.9, 1.25, .8);
      for (let f = 0; f < 4; f++) { const fg = mk(new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(.011, .03, 4, 8) : new THREE.CylinderGeometry(.011, .011, .05, 8), M.glove, -sd * .018, .028 - f * .019, -.012, 0, 0, Math.PI / 2, h); fg.scale.set(1, 1, 1); }
      const thumb = mk(new THREE.CylinderGeometry(.011, .012, .045, 8), M.glove, -sd * .02, .035, .02, .5, 0, sd * .9, h);
      mk(new THREE.BoxGeometry(.05, .02, .045), M.gloveAcc, sd * .012, -.045, .012, 0, 0, 0, h); // puño con color del equipo
      hands.push(h);
    }
    arms.forEach((a) => a.parent && a.parent.remove(a)); arms.length = 0;
    for (let i = 0; i < 2; i++) { const a = new THREE.Mesh(new THREE.CylinderGeometry(.032, .045, 1, 12), M.sleeve); cab.add(a); arms.push(a); }
  }

  function buildCockpit(kind) {
    if (kind === cabKind) return; cabKind = kind;
    cab.clear(); cab.add(wheel);
    // base común: parte baja de la cabina, laterales/puertas y piso (así no quedan vacíos en ningún formato)
    mk(new THREE.BoxGeometry(4.4, .9, 3.2), M.matte, 0, -1.2, -.4);
    {
      const gt = kind === 'gt', roofY = gt ? .44 : .5;
      // capó con el color del equipo (largo, sin cortes contra el tablero) y tablero de alcántara
      hood = mk(new THREE.BoxGeometry(2.3, .08, 3.2), M.paint, 0, -.5, -3.1, -.06);
      mk(new THREE.BoxGeometry(2.8, .3, .9), M.matte, 0, -.47, -1.25, .12);
      mk(new THREE.BoxGeometry(2.8, .06, .5), M.matte, 0, -.33, -1.55, .05);
      // bocina de instrumentos / pantalla central
      mk(new THREE.BoxGeometry(.52, .27, .12), M.carbon, 0, -.13, -1.12, -.2);
      screenMesh = mk(new THREE.PlaneGeometry(.46, .23), new THREE.MeshBasicMaterial({ map: dtex, toneMapped: false }), 0, -.13, -1.055, -.2);
      if (!gt) { mk(new THREE.BoxGeometry(.4, .03, .03), M.carbon, 0, .015, -1.13); for (let i = 0; i < 10; i++) { const m = mk(new THREE.SphereGeometry(.008, 8, 6), new THREE.MeshBasicMaterial({ color: 0x222833 }), -.162 + i * .036, .015, -1.11); leds.push(m); } }
      // parantes A, marco del parabrisas, techo, puertas y jaula
      for (const sd of [-1, 1]) {
        tube(new V(sd * 1.05, -.36, -1.75), new V(sd * .98, roofY, -.95), .05, M.carbon);
        mk(new THREE.BoxGeometry(.2, .75, 2.6), M.matte, sd * 1.12, -.62, -.2);
        mk(new THREE.BoxGeometry(.06, .08, 2.2), M.pad, sd * 1.0, -.2, -.1); // apoyabrazos/barra de puerta
        // jaula: barra en X en la puerta y montante
        tube(new V(sd * .98, -.42, -1.3), new V(sd * .93, roofY - .04, -.6), .022, M.cage);
        tube(new V(sd * .96, -.45, .2), new V(sd * .93, roofY - .04, -.6), .022, M.cage);
        tube(new V(sd * .95, -.3, -.9), new V(sd * .92, -.3, .3), .026, M.cage);
        // espejo exterior (en la esquina del parabrisas)
        const mp = new V(sd * .99, -.24, -1.28);
        mk(new THREE.BoxGeometry(.28, .15, .06), M.carbon, mp.x, mp.y, mp.z - .03, 0, -sd * .35);
        mk(mirrorGeo(.25, .12, sd < 0 ? 0 : .7, sd < 0 ? .3 : 1), mirrorMat, mp.x, mp.y, mp.z + .003, 0, -sd * .35);
        mk(new THREE.PlaneGeometry(1.2, 1.1), M.glass, sd * .95, -.05, -.8, 0, -sd * 1.3); // ventanilla
      }
      mk(new THREE.BoxGeometry(2.4, .12, 1.6), M.pad, 0, roofY + .06, -.15); // techo (se extiende hacia atrás: sin «cielo» arriba)
      mk(new THREE.BoxGeometry(2.2, .12, .16), M.carbon, 0, roofY, -.95); // marco superior del parabrisas
      tube(new V(-.93, roofY - .05, -.6), new V(.93, roofY - .05, -.6), .022, M.cage);
      // espejo interior central
      mk(new THREE.BoxGeometry(.42, .11, .04), M.carbon, 0, roofY - .19, -.95);
      mk(mirrorGeo(.39, .085, .3, .7), mirrorMat, 0, roofY - .19, -.925);
      tube(new V(0, roofY - .13, -.95), new V(0, roofY, -.95), .012, M.carbon);
      mk(new THREE.PlaneGeometry(2.1, 1.3), M.glass, 0, .05, -1.35, -.9); // parabrisas (apenas visible)
      wiper = new THREE.Group(); wiper.position.set(-.2, -.3, -1.62); mk(new THREE.BoxGeometry(.8, .014, .03), M.cage, .4, 0, 0, 0, 0, 0, wiper); cab.add(wiper);
      wheel.position.set(0, -.31, -.56); wheel.rotation.set(-.32, 0, 0);
    }
    buildWheel(kind);
  }
  const catOf = (c) => { const o = window.LROonboard && LROonboard.kind; if (o) return o; const b = String((c && c.team && c.team.bodyType) || ''); return /^(classic|touring)$/.test(b) ? 'turismo' : 'gt'; };

  const cock$ = { steer: 0, prevYaw: 0, lastDraw: 0, gear: 1, prevV: 0, acc: 0, roll: 0, pitch: 0, look: 0, fov: 74, sh: new V() };
  function gearOf(c) { return Math.max(1, Math.min(6, Math.floor(c.v / 14) + 1)); }
  function tyreTemps(c) { // estimación visual (la simulación no modela temperatura): velocidad, estado, desgaste y clima
    const wet = ['LIGHT_RAIN', 'RAIN', 'HEAVY_RAIN'].includes(CURRENT_WEATHER_KEY), base = (wet ? 62 : 78) + Math.min(18, c.v * .22) + (c.state === 'Cornering' ? 6 : c.state === 'Braking' ? 4 : 0) + (100 - c.wear) * .06;
    return [base + 3, base + 1, base - 2, base - 3].map((t, i) => Math.round(t + Math.sin(c.s * .01 + i) * 1.5));
  }
  const tCol = (t) => t < 70 ? '#3f8cff' : t < 90 ? '#3dd16a' : t < 102 ? '#ffc93a' : '#ff3b30';
  function flagOf() { return state.redFlag ? ['#e0302a', 'BANDERA ROJA'] : state.safetyCar ? ['#f2c230', 'SAFETY CAR'] : state.vsc ? ['#b7d86a', 'VSC'] : state.finishes.length ? ['#ffffff', 'A CUADROS'] : state.cars.some((x) => x.state === 'Spin' && !x.dnf) ? ['#f2c230', 'AMARILLA'] : null; }
  function drawDash(c) {
    const W = 640, H = 320, kmh = Math.round(c.v * 3.6), g = gearOf(c), rpm = Math.min(9000, 4200 + ((c.v - (g - 1) * 14) / 14) * 4800), rf = Math.max(0, Math.min(1, (rpm - 4000) / 5000));
    const ah = state.order[c.rank - 2], bh = state.order[c.rank], gA = ah ? (ah.s - c.s) / Math.max(22, c.v) : 0, gB = bh ? (c.s - bh.s) / Math.max(22, bh.v) : 0, fl = flagOf();
    dx.fillStyle = '#04070c'; dx.fillRect(0, 0, W, H);
    if (fl) { dx.fillStyle = fl[0]; dx.fillRect(0, 0, 10, H); dx.fillRect(W - 10, 0, 10, H); }
    // leds de RPM
    for (let i = 0; i < 20; i++) { const on = i / 20 < rf; dx.fillStyle = on ? (i < 8 ? '#3dd16a' : i < 15 ? '#ff3b30' : '#3f8cff') : '#141b28'; dx.beginPath(); dx.arc(40 + i * 29.5, 22, 10, 0, 7); dx.fill(); }
    // marcha y velocidad
    dx.textAlign = 'center'; dx.fillStyle = rf > .92 ? '#3f8cff' : '#fff'; dx.font = '900 128px Barlow Condensed, monospace'; dx.fillText(c.v < .5 ? 'N' : String(g), W / 2, 162);
    dx.font = '700 46px Barlow Condensed, monospace'; dx.fillStyle = '#ffd24a'; dx.fillText(kmh, W / 2, 214); dx.font = '600 16px IBM Plex Mono, monospace'; dx.fillStyle = '#7f8ba0'; dx.fillText('KM/H · ' + Math.round(rpm) + ' RPM', W / 2, 236);
    // izquierda: posición, vuelta, gaps
    dx.textAlign = 'left'; const L = (lb, v, y, col) => { dx.font = '600 15px IBM Plex Mono, monospace'; dx.fillStyle = '#7f8ba0'; dx.fillText(lb, 24, y - 26); dx.font = '800 32px Barlow Condensed, monospace'; dx.fillStyle = col || '#fff'; dx.fillText(v, 24, y); };
    L('POS', 'P' + c.rank + '/' + state.cars.length, 88); L('VUELTA', Math.min(CONFIG.laps, Math.max(1, c.lap)) + '/' + CONFIG.laps, 150);
    L('ADELANTE', ah ? '-' + gA.toFixed(2).replace('.', ',') : 'LÍDER', 212, ah ? '#ff8a8a' : '#7ed321'); L('ATRÁS', bh ? '+' + gB.toFixed(2).replace('.', ',') : '—', 274, bh && gB < 1 ? '#ffc93a' : '#9fd3ff');
    // derecha: neumáticos (temperatura y desgaste por rueda)
    const tt = tyreTemps(c), x0 = W - 170, wearC = c.wear > 55 ? '#3dd16a' : c.wear > 30 ? '#ffc93a' : '#ff3b30';
    dx.font = '600 15px IBM Plex Mono, monospace'; dx.fillStyle = '#7f8ba0'; dx.fillText('NEUM. ' + c.tire + ' · ' + Math.round(c.wear) + '%', x0 - 6, 62);
    tt.forEach((t, i) => { const x = x0 + (i % 2) * 84, y = 76 + Math.floor(i / 2) * 84; dx.fillStyle = tCol(t); dx.fillRect(x, y, 70, 72); dx.fillStyle = '#04070c'; dx.fillRect(x + 4, y + 4, 62, 42); dx.fillStyle = '#fff'; dx.font = '800 26px Barlow Condensed, monospace'; dx.textAlign = 'center'; dx.fillText(t + '°', x + 35, y + 36); dx.fillStyle = wearC; dx.fillRect(x + 4, y + 52, 62 * c.wear / 100, 14); dx.textAlign = 'left'; });
    // barra inferior: rebufo / bandera / estado
    dx.textAlign = 'center'; dx.font = '800 22px Barlow Condensed, monospace';
    const msg = fl ? '⚑ ' + fl[1] : c.slipstream ? '» REBUFO «' : c.pitStage ? 'BOXES · LIMITADOR' : 'COMB. ' + Math.round(c.fuel) + ' L · DAÑO ' + Math.round(c.damage * 100) + '%';
    dx.fillStyle = fl ? fl[0] : c.slipstream ? '#3dd16a' : '#1a2233'; dx.fillRect(W / 2 - 150, 262, 300, 40); dx.fillStyle = fl || c.slipstream ? '#04070c' : '#c9d3e6'; dx.fillText(msg, W / 2, 290);
    dtex.needsUpdate = true;
    wx.fillStyle = '#000'; wx.fillRect(0, 0, 256, 128); wx.textAlign = 'center'; wx.fillStyle = '#fff'; wx.font = '900 84px Barlow Condensed, monospace'; wx.fillText(c.v < .5 ? 'N' : g, 70, 96);
    wx.font = '800 38px Barlow Condensed, monospace'; wx.fillStyle = '#ffd24a'; wx.fillText(kmh, 186, 60); wx.fillStyle = ah ? '#ff8a8a' : '#7ed321'; wx.font = '700 28px Barlow Condensed, monospace'; wx.fillText(ah ? '-' + gA.toFixed(1) : 'P1', 186, 104);
    if (fl) { wx.fillStyle = fl[0]; wx.fillRect(0, 0, 256, 8); }
    wtex.needsUpdate = true;
    leds.forEach((l, i) => { const on = rf > .5 && i / leds.length < (rf - .5) / .5 * 1.05; l.material.color.setHex(on ? (i < 4 ? 0x30ff60 : i < 8 ? 0xff3030 : 0x3090ff) : 0x1a1f2b); });
    if (dashEl && dashEl.offsetParent) dashCtx.drawImage(dc, 0, 0, dashEl.width, dashEl.height);
  }
  // panel grande (sólo en teléfono vertical): copia del tablero arriba, debajo de la torre
  const dashEl = document.createElement('canvas'); dashEl.className = 'lx-dash'; dashEl.width = 640; dashEl.height = 320; const dashCtx = dashEl.getContext('2d');
  document.querySelector('.broadcast').appendChild(dashEl);

  // accesibilidad: «reducir movimiento» (se recuerda; por defecto sigue la preferencia del sistema)
  let reduced = false; try { const v = localStorage.getItem('lro_reduce_motion'); reduced = v != null ? v === '1' : !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { }
  window.LROonboard = { get reduced() { return reduced; }, setReduced(v) { reduced = !!v; try { localStorage.setItem('lro_reduce_motion', reduced ? '1' : '0'); } catch (e) { } }, kind: null };

  // doble toque / doble clic sobre la escena a bordo: siguiente piloto en foco
  let lastTap = 0;
  const nextFocus = () => { const o = state.order.filter((c) => !c.dnf && !c.finished); if (!o.length) return; const i = o.indexOf(focusCar()); state.focus = o[(i + 1) % o.length].id; state.focusLocked = true; state.cameraTimer = 5; updateUI(); };
  dom.addEventListener('dblclick', () => { if (active()) nextFocus(); });
  dom.addEventListener('pointerup', (e) => { if (e.pointerType !== 'touch' || !active()) return; const t = performance.now(); if (t - lastTap < 320) { nextFocus(); lastTap = 0; } else lastTap = t; });

  const _cars = updateCarsVisual;
  updateCarsVisual = function (dt) {
    _cars(dt);
    document.documentElement.classList.toggle('lx-onboard', active());
    if (!active()) return;
    const c = focusCar(); if (!c) return;
    buildCockpit(catOf(c));
    const yaw = c.yaw || 0, d = Math.atan2(Math.sin(yaw - cock$.prevYaw), Math.cos(yaw - cock$.prevYaw)); cock$.prevYaw = yaw;
    const rate = dt > 0 ? d / dt : 0, target = Math.max(-1.3, Math.min(1.3, rate * 1.15 + (c.lateralV || 0) * .04));
    cock$.steer += (target - cock$.steer) * Math.min(1, (dt || .016) * 9);
    spin.rotation.z = cock$.steer;
    // antebrazos: del hombro a la mano (siguen al volante)
    hands.forEach((h, i) => { const hp = h.getWorldPosition(new V()), a = arms[i]; if (!a) return; cab.worldToLocal(hp); const s = shoulders[i], dv = new V().subVectors(hp, s), L = dv.length(); a.scale.set(1, L, 1); a.position.copy(s).addScaledVector(dv, .5); a.quaternion.setFromUnitVectors(new V(0, 1, 0), dv.normalize()); });
    const col = liveryFor(c.team).primary; M.paint.color.set(col); M.sleeve.color.set(col); M.gloveAcc.color.set(col);
    const wet = ['LIGHT_RAIN', 'RAIN', 'HEAVY_RAIN'].includes(CURRENT_WEATHER_KEY);
    if (wiper) { wiper.visible = wet; if (wet) wiper.rotation.z = -.05 + (Math.sin(performance.now() / (CURRENT_WEATHER_KEY === 'HEAVY_RAIN' ? 220 : 380)) * .5 + .5) * 1.1; }
    const now = performance.now(); if (now - cock$.lastDraw > 66) { cock$.lastDraw = now; drawDash(c); }
    const g = gearOf(c); if (g !== cock$.gear) { if (g > cock$.gear) window.EM && EM.sfx && EM.sfx.play('shift_up'); else if (c.v > 10) window.EM && EM.sfx && EM.sfx.play('backfire'); cock$.gear = g; }
  };
  // movimiento de la cabeza a bordo: vibración (velocidad y pianos), roll en curva, cabeceo al frenar/acelerar, fov con la velocidad
  // y «head-look» hacia el vértice. Todo suavizado; con «reducir movimiento» queda fijo.
  function onboardMotion(dt) {
    const c = focusCar(); if (!c || !dt) return;
    const f = sample(c.s, c.lane), k = reduced ? 0 : 1, sm = (r) => 1 - Math.exp(-dt * r);
    const acc = (c.v - cock$.prevV) / Math.max(dt, 1e-3); cock$.prevV = c.v; cock$.acc += (Math.max(-40, Math.min(40, acc)) - cock$.acc) * sm(4);
    const lat = (f.curvature || 0) * c.v * c.v;
    cock$.roll += (Math.max(-.07, Math.min(.07, -lat * .0022)) * k - cock$.roll) * sm(3);
    cock$.pitch += (Math.max(-.045, Math.min(.045, -cock$.acc * .0016)) * k - cock$.pitch) * sm(3);
    // head-look: mirar hacia donde va la curva (punto adelantado de la trayectoria)
    const ahead = sample(c.s + 22 + c.v * .35, c.lane).p, dir = new V().subVectors(ahead, f.p).setY(0).normalize(), tg = f.tangent.clone().setY(0).normalize();
    const ang = Math.atan2(tg.x * dir.z - tg.z * dir.x, tg.x * dir.x + tg.z * dir.z);
    cock$.look += (Math.max(-.22, Math.min(.22, -ang * .55)) * k - cock$.look) * sm(2.5);
    const halfW = (CURRENT_TRACK && CURRENT_TRACK.halfWidth) || CONFIG.trackWidth / 2, curb = Math.abs(c.lane) > halfW - 2.2 ? 1 : 0;
    const amp = k * (Math.min(1, c.v / 85) * .010 + curb * .028 * Math.min(1, c.v / 30));
    const t = performance.now() * .001; cock$.sh.set(Math.sin(t * 57) * amp * .6, (Math.sin(t * 71) + Math.sin(t * 131) * .5) * amp, 0);
    const fovT = 72 + (reduced ? 0 : Math.min(9, c.v * .1)); cock$.fov += (fovT - cock$.fov) * sm(2);
    camera.fov = cock$.fov; camera.updateProjectionMatrix();
    camera.position.y += .45; // cámara más alta: se ve más pista por encima del tablero
    camera.rotateOnWorldAxis(new V(0, 1, 0), cock$.look); camera.rotateX(cock$.pitch - .05); camera.rotateZ(cock$.roll);
    camera.position.add(new V(cock$.sh.x, cock$.sh.y, 0).applyQuaternion(camera.quaternion));
    // la cabina acompaña (menos que la cabeza) y el tablero cabecea al frenar
    cab.rotation.set(-cock$.pitch * .35, 0, -cock$.roll * .45); cab.position.set(-cock$.sh.x * .4, -cock$.sh.y * .5, 0);
  }

  // ---------------------------------------------------------------- motor con muestras reales (si están las carpetas)
  const BASE = '../assets/carengines/GRID GT Sound Files v1.01/GameData/Sounds/GRID_GT/911_RSR_2017/';
  const SETS = {
    on: [['bcl_on_low.wav', 3200], ['mpl_on_midlow.wav', 4800], ['bcl_on_high3.wav', 7200]],
    off: [['bcl_off_shakey_low.wav', 3000], ['bcl_off_mid.wav', 5000], ['mpl_off_high_2.wav', 7400]]
  };
  const ONESHOT = { shift_up: 'int_shift_up_1.wav', shift_down: 'int_shift_down.wav', backfire: 'backfireEXT_2.wav', startup: '991_gt3_startup.wav' };
  const RE = { ready: false, loading: false, loops: [], shots: {} };
  async function loadReal() {
    if (RE.loading || !audio.ctx) return; RE.loading = true;
    try {
      const ctx = audio.ctx, get = async (f) => ctx.decodeAudioData(await (await fetch(BASE + encodeURIComponent(f))).arrayBuffer());
      const all = [];
      for (const kind of ['on', 'off']) for (const [f, rpm] of SETS[kind]) all.push(get(f).then((buf) => ({ kind, rpm, buf })));
      const loops = await Promise.all(all);
      for (const l of loops) {
        const src = ctx.createBufferSource(); src.buffer = l.buf; src.loop = true; const g = ctx.createGain(); g.gain.value = 0; src.connect(g); g.connect(audio.master); src.start(0, Math.random() * l.buf.duration * .5);
        RE.loops.push({ src, g, kind: l.kind, rpm: l.rpm });
      }
      for (const k of Object.keys(ONESHOT)) get(ONESHOT[k]).then((b) => { RE.shots[k] = b; }).catch(() => {});
      RE.ready = true; audio.engines.forEach((e) => e.gain.gain.setTargetAtTime(0, ctx.currentTime, .1)); audio.real = true;
    } catch (e) { console.info('Motor: sin muestras reales, se usa el sintetizador.', e && e.message); }
  }
  const _init = audio.init.bind(audio);
  audio.init = function () { _init(); loadReal(); };
  const _upd = audio.update.bind(audio);
  audio.update = function () {
    _upd();
    if (!RE.ready || !audio.ctx) return;
    const car = focusCar(); if (!car) return; const t = audio.ctx.currentTime;
    const active = state.phase === 'race' && !state.paused, g = gearOf(car), rpm = active ? 3600 + ((car.v - (g - 1) * 14) / 14) * 4400 : 1500 + (state.phase === 'countdown' ? 2400 : 0);
    const throttle = car.state === 'Braking' || car.state === 'Cornering' ? 0 : 1, close = state.cameraMode === 'onboard' ? 1 : .65;
    for (const l of RE.loops) {
      const near = Math.max(0, 1 - Math.abs(rpm - l.rpm) / 2600), mix = l.kind === 'on' ? throttle * .8 + .2 : (1 - throttle) * .8 + .2;
      l.g.gain.setTargetAtTime(active || state.phase === 'countdown' ? near * mix * .9 * close : 0, t, .08);
      l.src.playbackRate.setTargetAtTime(Math.max(.6, Math.min(1.6, rpm / l.rpm)), t, .06);
    }
    if (!RE.lastG) RE.lastG = g; if (g !== RE.lastG) { playShot(g > RE.lastG ? 'shift_up' : 'shift_down'); if (g < RE.lastG && Math.random() < .5) playShot('backfire'); RE.lastG = g; }
  };
  function playShot(k) { const b = RE.shots[k]; if (!b || !audio.ctx || audio.muted) return; const s = audio.ctx.createBufferSource(); s.buffer = b; const g = audio.ctx.createGain(); g.gain.value = .6; s.connect(g); g.connect(audio.master); s.start(); }
  window.LROaudio = { RE, playShot };
})();
