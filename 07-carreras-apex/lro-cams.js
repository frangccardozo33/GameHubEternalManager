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
    if ((window.Q && Q.active) || !names[mode]) { _cam(dt); if (active()) $('onboard-hud').style.display = 'none'; return; }
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

  // ---------------------------------------------------------------- cabina 3D
  const cock = new THREE.Scene(), cockCam = new THREE.PerspectiveCamera(62, 16 / 9, .05, 20);
  cock.add(new THREE.HemisphereLight(0xbfd8ff, 0x202028, 2.4)); const dl = new THREE.DirectionalLight(0xffffff, 1.6); dl.position.set(.5, 2, 1.5); cock.add(dl);
  const carbon = new THREE.MeshStandardMaterial({ color: 0x0c1016, roughness: .55, metalness: .3 }), rubber = new THREE.MeshStandardMaterial({ color: 0x14171c, roughness: .9 });
  const cab = new THREE.Group(); cock.add(cab);
  const dash = new THREE.Mesh(new THREE.BoxGeometry(2.6, .28, .8), carbon); dash.position.set(0, -.4, -1.05); dash.rotation.x = .12; cab.add(dash);
  const hoodMat = new THREE.MeshStandardMaterial({ color: 0xd96a32, roughness: .4, metalness: .35 }), hood = new THREE.Mesh(new THREE.BoxGeometry(1.7, .06, 2.4), hoodMat); hood.position.set(0, -.36, -2.4); hood.rotation.x = -.05; cab.add(hood);
  for (const sd of [-1, 1]) {
    const pil = new THREE.Mesh(new THREE.BoxGeometry(.09, 1.3, .09), carbon); pil.position.set(sd * 1.15, .18, -1.3); pil.rotation.set(-.55, 0, sd * .32); cab.add(pil);
    const door = new THREE.Mesh(new THREE.BoxGeometry(.12, .5, 1.6), carbon); door.position.set(sd * 1.25, -.55, -.5); cab.add(door);
    const mir = new THREE.Mesh(new THREE.BoxGeometry(.32, .18, .05), carbon); mir.position.set(sd * 1.02, -.12, -1.05); cab.add(mir);
  }
  const roofBar = new THREE.Mesh(new THREE.BoxGeometry(2.6, .1, .1), carbon); roofBar.position.set(0, .88, -.6); cab.add(roofBar);
  // pantalla del tablero
  const dc = document.createElement('canvas'); dc.width = 512; dc.height = 256; const dx = dc.getContext('2d'), dtex = new THREE.CanvasTexture(dc);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(.5, .25), new THREE.MeshBasicMaterial({ map: dtex })); screen.position.set(0, -.08, -1.05); screen.rotation.x = -.3; cab.add(screen);
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(.55, .3, .03), carbon); bezel.position.set(0, -.08, -1.07); bezel.rotation.x = -.3; cab.add(bezel);
  // luces de cambio
  const leds = []; for (let i = 0; i < 11; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.014, 8, 6), new THREE.MeshBasicMaterial({ color: 0x223 })); m.position.set(-.3 + i * .06, .12, -1.02); cab.add(m); leds.push(m); }
  // volante
  const wheel = new THREE.Group(); wheel.position.set(0, -.2, -.62); wheel.rotation.x = -.42; cab.add(wheel);
  const spin = new THREE.Group(); wheel.add(spin);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.15, .02, 10, 40), rubber); spin.add(rim);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(.42, .17, .03), carbon); spin.add(plate);
  for (const sd of [-1, 1]) { const gr = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .16, 10), new THREE.MeshStandardMaterial({ color: 0x1b1e24, roughness: 1 })); gr.position.set(sd * .19, -.02, 0); spin.add(gr); }
  const wc = document.createElement('canvas'); wc.width = 128; wc.height = 64; const wx = wc.getContext('2d'), wtex = new THREE.CanvasTexture(wc);
  const wscr = new THREE.Mesh(new THREE.PlaneGeometry(.16, .08), new THREE.MeshBasicMaterial({ map: wtex })); wscr.position.set(0, .015, .02); spin.add(wscr);
  const marker = new THREE.Mesh(new THREE.BoxGeometry(.02, .04, .01), new THREE.MeshBasicMaterial({ color: 0xffd24a })); marker.position.set(0, .17, .02); spin.add(marker);
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .01, 8), new THREE.MeshBasicMaterial({ color: [0xff3030, 0x30ff60, 0x3090ff, 0xffd030][i] })); b.rotation.x = Math.PI / 2; b.position.set(i < 2 ? -.1 - i * .03 : .1 + (i - 2) * .03, .06, .02); spin.add(b); }
  // limpiaparabrisas
  const wiper = new THREE.Group(); wiper.position.set(0, -.15, -1.55); const wb = new THREE.Mesh(new THREE.BoxGeometry(.7, .012, .025), carbon); wb.position.set(.35, 0, 0); wiper.add(wb); cab.add(wiper);

  const cock$ = { steer: 0, prevYaw: 0, ready: false, lastDraw: 0, gear: 1, shiftT: 0 };
  function gearOf(c) { return Math.max(1, Math.min(6, Math.floor(c.v / 14) + 1)); }
  function drawDash(c) {
    const kmh = Math.round(c.v * 3.6), g = gearOf(c), rpm = Math.min(9000, 4200 + ((c.v - (g - 1) * 14) / 14) * 4800), rf = Math.max(0, Math.min(1, (rpm - 4000) / 5000));
    dx.fillStyle = '#05080d'; dx.fillRect(0, 0, 512, 256);
    dx.fillStyle = '#0d1522'; dx.fillRect(8, 8, 496, 240);
    for (let i = 0; i < 24; i++) { dx.fillStyle = i / 24 < rf ? (i < 14 ? '#3dd16a' : i < 20 ? '#ffc93a' : '#ff3b30') : '#1a2436'; dx.fillRect(18 + i * 20, 16, 16, 20); }
    dx.fillStyle = '#fff'; dx.font = '900 96px monospace'; dx.textAlign = 'center'; dx.fillText(String(c.v < .5 ? 'N' : g), 256, 132);
    dx.font = '700 44px monospace'; dx.fillStyle = '#ffd24a'; dx.fillText(kmh + ' km/h', 256, 182);
    dx.textAlign = 'left'; dx.font = '700 26px monospace'; dx.fillStyle = '#9fd3ff';
    dx.fillText('POS ' + c.rank + '/10', 24, 74); dx.fillText('V ' + Math.min(CONFIG.laps, Math.max(1, c.lap)) + '/' + CONFIG.laps, 24, 106);
    dx.fillText('TYRE ' + c.tire + ' ' + Math.round(c.wear) + '%', 24, 138); dx.fillText('FUEL ' + Math.round(c.fuel) + 'L', 24, 170);
    dx.textAlign = 'right'; dx.fillStyle = '#9fd3ff'; dx.fillText(Math.round(rpm) + ' rpm', 488, 74);
    const ah = state.order[c.rank - 2], gap = ah ? (ah.s - c.s) / Math.max(22, c.v) : 0;
    dx.fillStyle = ah ? '#ff8a8a' : '#7ed321'; dx.fillText(ah ? '-' + gap.toFixed(2) + 's' : 'LÍDER', 488, 106);
    dx.fillStyle = c.slipstream ? '#3dd16a' : '#556'; dx.fillText(c.slipstream ? 'REBUFO' : 'TC 3 ABS 4', 488, 138);
    dx.fillStyle = '#ffd24a'; dx.fillText('BB 58.0', 488, 170);
    dx.textAlign = 'center'; dx.font = '600 20px monospace'; dx.fillStyle = state.safetyCar ? '#ffd24a' : '#5d708a'; dx.fillText(state.safetyCar ? '⚠ SAFETY CAR' : c.state.toUpperCase(), 256, 232);
    dtex.needsUpdate = true;
    wx.fillStyle = '#000'; wx.fillRect(0, 0, 128, 64); wx.fillStyle = '#fff'; wx.font = '900 46px monospace'; wx.textAlign = 'center'; wx.fillText(c.v < .5 ? 'N' : g, 64, 48); wtex.needsUpdate = true;
    leds.forEach((l, i) => { const on = rf > .55 && i / 11 < (rf - .55) / .45 * 1.05; l.material.color.setHex(on ? (i < 4 ? 0x30ff60 : i < 8 ? 0xff3030 : 0x3090ff) : 0x1a1f2b); });
  }
  const _cars = updateCarsVisual;
  updateCarsVisual = function (dt) {
    _cars(dt);
    if (!active()) return;
    const c = focusCar(); if (!c) return;
    const yaw = c.yaw || 0, d = Math.atan2(Math.sin(yaw - cock$.prevYaw), Math.cos(yaw - cock$.prevYaw)); cock$.prevYaw = yaw;
    const rate = dt > 0 ? d / dt : 0, target = Math.max(-2.3, Math.min(2.3, rate * 1.15 + (c.lateralV || 0) * .04));
    cock$.steer += (target - cock$.steer) * Math.min(1, (dt || .016) * 9);
    spin.rotation.z = cock$.steer; cab.rotation.z = -cock$.steer * .012; cab.position.y = Math.sin(c.s * 1.6) * .004 * Math.min(1, c.v / 40);
    if (c.state === 'Braking') cab.position.z = .012; else cab.position.z = 0;
    hoodMat.color.set(liveryFor(c.team).primary);
    const wet = ['LIGHT_RAIN', 'RAIN', 'HEAVY_RAIN'].includes(CURRENT_WEATHER_KEY);
    wiper.visible = wet; if (wet) wiper.rotation.z = -.05 + (Math.sin(performance.now() / (CURRENT_WEATHER_KEY === 'HEAVY_RAIN' ? 220 : 380)) * .5 + .5) * 1.1;
    const now = performance.now(); if (now - cock$.lastDraw > 60) { cock$.lastDraw = now; drawDash(c); }
    const g = gearOf(c); if (g !== cock$.gear) { if (g > cock$.gear) window.EM && EM.sfx.play('shift_up'); else if (c.v > 10) window.EM && EM.sfx.play('backfire'); cock$.gear = g; }
    $('onboard-hud').style.display = 'none';
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
    const r = dom.getBoundingClientRect(); const nar = r.width < 560, short = r.height < 420, w = nar ? Math.max(96, Math.min(130, r.width * .27)) : short ? 130 : Math.max(150, Math.min(250, r.width * .2)), h = Math.round(w * 9 / 16), x0 = r.width - w - (nar ? 8 : 14), y0 = nar ? 128 : short ? 74 : 116;
    PIP.rects = [];
    PIP.wins.forEach((d, i) => {
      const show = PIP.on && isRace() && state.phase !== 'finished' && !(window.Q && Q.active) && PIP.cars[i] && state.cameraMode !== 'onboard'; const y = y0 + i * (h + 8);
      d.style.display = show ? 'block' : 'none'; d.style.left = x0 + 'px'; d.style.top = y + 'px'; d.style.width = w + 'px'; d.style.height = h + 'px';
      PIP.rects[i] = show ? { x: x0, y, w, h } : null;
      if (show) { const c = PIP.cars[i]; d.querySelector('.pl').textContent = i === 0 && PIP.battle ? `P${PIP.pos}-P${PIP.pos + 1} · +${PIP.gap.toFixed(2)}s` : i === 1 ? c.driver.short + ' · P' + c.rank : c.driver.short + ' · ' + (c.state === 'Spin' ? 'TROMPO' : 'BOXES'); d.style.borderColor = hex(c.team.color); }
    });
  }
  new ResizeObserver(layoutPips).observe(document.querySelector('.broadcast'));
  const origRender = renderer.render.bind(renderer);
  renderer.render = function (sc, cam) {
    origRender(sc, cam);
    if (cam !== camera || sc !== scene) return;
    const r = dom.getBoundingClientRect(); if (!r.width) return;
    const ac = renderer.autoClear; renderer.autoClear = false; renderer.setScissorTest(true);
    if (active()) {
      const W = r.width, H = r.height; renderer.setViewport(0, 0, W, H); renderer.setScissor(0, 0, W, H); renderer.clearDepth();
      cockCam.aspect = W / H; cockCam.updateProjectionMatrix(); origRender(cock, cockCam);
    } else if (PIP.on && PIP.rects) {
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
