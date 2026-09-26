/* LRO · extras de carrera: clasificación simulada, radio del equipo, hora del día + lluvia, podio, calendario con mapas y logos de escuderías.
 * Se carga después de engine.js (scripts clásicos: comparte el ámbito global con engine.js / game-data.js / game-ui.js). */
(function () {
  'use strict';
  const ASSET = '../assets/';
  const hex = (n) => '#' + (n >>> 0).toString(16).padStart(6, '0').slice(-6);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const logoUrl = (team) => (team && team.logo ? ASSET + 'racingscuderias/' + team.logo : '');
  const logoImg = (team, w, h) => (team && team.logo ? `<img class="lx-logo" src="${logoUrl(team)}" alt="" style="width:${w || 44}px;height:${h || 30}px">` : '');
  const sfx = (n, o) => { try { window.EM && EM.sfx && EM.sfx.play(n, o); } catch (e) { /* sin sfx */ } };
  const $b = () => document.querySelector('.broadcast');
  window.LROX = { hex, esc, logoImg, logoUrl };

  // ------------------------------------------------------------------ música del hub: sólo suena fuera de la carrera
  let lastOn = null;
  function matchSignal() {
    const on = !!(window.Q && Q.active) || state.phase === 'countdown' || state.phase === 'race' || state.phase === 'finished' || !!window.__podiumOn;
    if (on === lastOn) return; lastOn = on;
    try { window.parent !== window && window.parent.postMessage({ type: 'EM_MATCH', on }, '*'); } catch (e) { /* standalone */ }
  }
  setInterval(matchSignal, 400);
  document.addEventListener('visibilitychange', () => { lastOn = null; });
  window.addEventListener('pagehide', () => { try { window.parent.postMessage({ type: 'EM_MATCH', on: false }, '*'); } catch (e) {} });

  // ------------------------------------------------------------------ hora del día + clima visual
  const TODS = {
    day:   { label: 'DÍA',        bg: 0xb6c4bd, fog: 0xc3cbbb, fd: .00075, hemi: 2.2, sun: 3.1, sunC: 0xffe5bc, exp: 1.14, sx: -160 },
    dawn:  { label: 'AMANECER',   bg: 0xd9a58a, fog: 0xd8b09a, fd: .0010,  hemi: 1.5, sun: 2.2, sunC: 0xffb27a, exp: 1.05, sx: -240 },
    dusk:  { label: 'ATARDECER',  bg: 0xc4785a, fog: 0xb98467, fd: .0011,  hemi: 1.2, sun: 2.4, sunC: 0xff8a45, exp: 1.02, sx: 260 },
    night: { label: 'NOCHE',      bg: 0x0a1226, fog: 0x0c1428, fd: .0016,  hemi: .55, sun: .35, sunC: 0x7d9bff, exp: .9,  sx: -160 }
  };
  let TOD = 'day', wxKey = 'CLEAR';
  const scratch = { lights: [] };
  function pickTod(track) {
    if (track && (track.theme === 'night' || /nocturna/i.test(track.name || ''))) return 'night';
    const r = Math.random();
    return r < .5 ? 'day' : r < .68 ? 'dawn' : r < .86 ? 'dusk' : 'night';
  }
  function applyVisual() {
    const t = TODS[TOD], wet = { CLEAR: 0, CLOUDY: .2, DRYING: .25, LIGHT_RAIN: .5, RAIN: .75, HEAVY_RAIN: 1 }[wxKey] || 0;
    const dim = 1 - wet * .35;
    const c = new THREE.Color(t.bg).lerp(new THREE.Color(TOD === 'night' ? 0x05080f : 0x7d878c), wet * .55);
    scene.background = c; scene.fog = new THREE.FogExp2(new THREE.Color(t.fog).lerp(c, wet * .6).getHex(), t.fd * (1 + wet * 1.6));
    hemi.intensity = t.hemi * (1 - wet * .2); sun.intensity = t.sun * dim; sun.color.setHex(t.sunC);
    renderer.toneMappingExposure = t.exp * (1 - wet * .06);
    scratch.sx = t.sx;
    const d = $('rc-weather-detail'); if (d && d.textContent.indexOf('·') < 0) d.textContent += ' · ' + t.label;
    if (!scratch.head) buildHeadlights();
    scratch.head.forEach((l) => { l.visible = TOD === 'night' || (wet > .7 && TOD !== 'day'); });
    rain.mesh.visible = wet > 0.3; rain.k = wet;
  }
  // luces de casco para el auto en foco de noche
  function buildHeadlights() {
    scratch.head = [];
    for (let i = 0; i < 2; i++) { const l = new THREE.SpotLight(0xfff2d0, 5200, 160, .5, .6, 1.6); l.castShadow = false; scene.add(l, l.target); scratch.head.push(l); }
  }
  // lluvia: rayitas que caen alrededor de la cámara
  const rain = (function () {
    const N = 1600, pos = new Float32Array(N * 6), g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xcfe3f5, transparent: true, opacity: .38, depthWrite: false }));
    m.frustumCulled = false; m.visible = false; scene.add(m);
    const seed = []; for (let i = 0; i < N; i++) seed.push([Math.random() * 90 - 45, Math.random() * 40, Math.random() * 90 - 45, .6 + Math.random() * .8]);
    return { mesh: m, pos, seed, N, k: 0, t: 0 };
  })();
  function updateRain(dt) {
    if (!rain.mesh.visible) return;
    rain.t += dt; const cp = camera.position, fall = 38 * (0.6 + rain.k * .6);
    const vis = Math.floor(rain.N * Math.min(1, .35 + rain.k * .65)); rain.mesh.geometry.setDrawRange(0, vis * 2);
    for (let i = 0; i < rain.N; i++) {
      const s = rain.seed[i], y = ((s[1] - rain.t * fall * s[3]) % 40 + 40) % 40, o = i * 6;
      const x = cp.x + s[0], z = cp.z + s[2], yy = cp.y - 6 + y;
      rain.pos[o] = x; rain.pos[o + 1] = yy; rain.pos[o + 2] = z; rain.pos[o + 3] = x - .12; rain.pos[o + 4] = yy + .9 * s[3]; rain.pos[o + 5] = z - .05;
    }
    rain.mesh.geometry.attributes.position.needsUpdate = true;
    // relámpagos en lluvia fuerte
    if (wxKey === 'HEAVY_RAIN' && Math.random() < dt * .05) { scratch.flash = .35; sfx('thunder'); }
    if (scratch.flash > 0) { scratch.flash -= dt; hemi.intensity = TODS[TOD].hemi * .8 + Math.max(0, scratch.flash) * 14; }
  }
  const _setWeather = setWeather;
  setWeather = function (key) { _setWeather(key); wxKey = key; applyVisual(); };
  const _rollW = rollInitialWeather;
  rollInitialWeather = function (td) { return window.__keepWx ? wxKey : _rollW(td); };
  const _reset = resetRace;
  resetRace = function () {
    if (!window.__keepWx) TOD = pickTod(currentTrack(Career));
    _reset(); applyVisual(); scratch.head && scratch.head.forEach((l) => { l.visible = false; }); applyVisual();
  };
  const _cars = updateCarsVisual;
  updateCarsVisual = function (dt) {
    _cars(dt);
    updateRain(Math.min(dt || 0, .05));
    if (scratch.head && scratch.head[0].visible && state.cars.length) {
      const c = state.cars[state.focus] || state.cars[0], f = sample(c.s, c.lane);
      scratch.head.forEach((l, i) => { l.position.copy(f.p).addScaledVector(f.normal, (i ? 1 : -1) * .7).add(new THREE.Vector3(0, .75, 0)); l.target.position.copy(f.p).addScaledVector(f.tangent, 40); });
    }
  };
  const _cam = updateCamera;
  updateCamera = function (dt) {
    _cam(dt);
    if (scratch.sx != null) { const f = sample((state.cars[state.focus] || state.cars[0] || { s: 0 }).s, 0); sun.position.copy(f.p).add(new THREE.Vector3(scratch.sx, TOD === 'night' ? 120 : 240, 110)); }
  };

  // ------------------------------------------------------------------ radio del equipo
  const RADIO = {
    'ADELANTAMIENTO': [['d', '¡Lo pasé! Ahora a defender la posición.'], ['e', 'Buen movimiento. Mantené el ritmo, no te relajes.']],
    'CAMBIO DE LÍDER': [['d', '¡Estoy adelante! Vamos a cuidar las gomas.'], ['e', 'Sos el líder. Nadie en el espejo por ahora.']],
    'CAMBIO DE CLIMA': [['e', 'Cambia el clima. Cuidado con el agarre, la pista se va a mover.'], ['d', 'Se está poniendo resbaladiza, avisen si entro a boxes.']],
    'SPIN': [['d', '¡Me fui de atrás! Estoy bien, sigo.'], ['e', 'Tranquilo, volvé a pista y cerrá la vuelta limpio.']],
    'CONTACTO': [['d', '¡Me tocaron! Revisen si hay daño.'], ['e', 'Anotado. Los comisarios lo van a mirar.']],
    'SAFETY CAR': [['e', 'Safety car, safety car. Reducí y mantené la distancia.'], ['d', 'Recibido, bajando el ritmo.']],
    'BANDERA ROJA': [['e', 'Bandera roja. Volvé a boxes con calma.']],
    'PARADA EN BOXES': [['e', 'Box, box. Entrás esta vuelta.'], ['d', 'Recibido, entro a boxes.']],
    'PIT NOW': [['e', 'Box, box, box. Cambio de gomas ahora.']],
    'VUELTA RÁPIDA': [['e', 'Vuelta más rápida de la carrera. Seguí así.'], ['d', 'Tengo ritmo, el auto responde muy bien.']],
    'ÚLTIMA VUELTA': [['e', 'Última vuelta. Todo lo que tengas.'], ['d', 'Voy con todo, sin errores.']],
    'BATALLA A TRES': [['d', 'Tres autos juntos, ¡cuidado en la frenada!'], ['e', 'Mantené la línea, no te dejes cerrar.']],
    'ABANDONO MECÁNICO': [['d', 'Perdí potencia… se cayó todo. Tengo que parar.'], ['e', 'Entendido. Estacioná en un lugar seguro.']],
    'BANDERA A CUADROS': [['e', 'Bandera a cuadros. Gran trabajo, equipo.'], ['d', '¡Lo logramos! Gracias a todos por el auto.']],
    '¡LARGARON!': [['e', 'Luces fuera. Pista libre, ¡a darle!']]
  };
  let radioBox = null, radioHide = 0, radioLast = -99;
  function radioPop(who, name, team, text) {
    const host = $b(); if (!host) return;
    if (!radioBox) { radioBox = document.createElement('div'); radioBox.className = 'lx-radio'; host.appendChild(radioBox); }
    const col = team ? hex(team.color) : '#ff5b36';
    radioBox.innerHTML = `<div class="lx-radio-h"><i class="lx-wave"><b></b><b></b><b></b><b></b></i><span>📻 RADIO · ${who === 'e' ? 'INGENIERO' : 'PILOTO'}</span>${team ? logoImg(team, 34, 22) : ''}</div><div class="lx-radio-b" style="border-color:${col}"><strong>${esc(name)}</strong><p>“${esc(text)}”</p></div>`;
    radioBox.classList.add('on'); clearTimeout(radioHide); radioHide = setTimeout(() => radioBox.classList.remove('on'), 5200);
    sfx('radio_click');
  }
  function radioFor(title, detail, car) {
    if (state.phase === 'grid' && title !== 'MOTORES ENCENDIDOS') return;
    const now = performance.now() / 1000; if (now - radioLast < 7) return;
    const tpl = RADIO[title]; if (!tpl) return;
    const c = car || (state.cars && state.cars[state.focus]); if (!c) return;
    // preferimos radios del equipo del jugador si está involucrado; si no, del auto en foco
    const [who, text] = tpl[Math.floor(Math.random() * tpl.length)];
    radioLast = now; radioPop(who, who === 'e' ? 'Ing. de pista · ' + c.team.name : c.driver.name, c.team, text);
  }
  const _add = addEvent;
  const TRANS = { '¡LARGARON!': 1, 'SAFETY CAR': 1, 'BANDERA ROJA': 1, 'ÚLTIMA VUELTA': 1, 'BANDERA A CUADROS': 1 };
  addEvent = function (title, detail, car, intensity) { _add.apply(this, arguments); try { radioFor(title, detail, car); if (TRANS[title] && window.EM && state.phase !== 'grid') EM.transition(title, null, { hold: 160 }); } catch (e) { /* radio opcional */ } };
  // radio espontánea: gomas gastadas, brecha, combustible
  setInterval(() => {
    if (state.phase !== 'race' || state.paused || !state.cars.length) return;
    const c = state.cars[state.focus]; if (!c || c.finished) return;
    const now = performance.now() / 1000; if (now - radioLast < 16) return;
    let l = null;
    if (c.wear > 72) l = ['d', 'Las gomas están muy cansadas, cuesta mucho en las curvas.'];
    else if (c.damage > .35) l = ['e', 'Tenés daño en el auto. Cuidá las curvas rápidas.'];
    else if (c.rank > 1) { const a = state.order[c.rank - 2], gap = (a.s - c.s) / Math.max(22, c.v); if (gap < 1) l = ['e', `Estás a ${gap.toFixed(1)} segundos del ${a.driver.short}. Podés atacar con el rebufo.`]; }
    if (!l && Math.random() < .3) l = ['e', `Vas P${c.rank}. Ritmo bien, ${c.fuel < 20 ? 'cuidá el combustible' : 'seguí empujando'}.`];
    if (l) { radioLast = now; radioPop(l[0], l[0] === 'e' ? 'Ing. de pista · ' + c.team.name : c.driver.name, c.team, l[1]); }
  }, 4000);

  // ------------------------------------------------------------------ clasificación simulada
  window.Q = { active: false };
  const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(3).padStart(6, '0')}`;
  let qBox = null;
  function qUI() {
    if (qBox) return qBox; const host = $b(); qBox = document.createElement('div'); qBox.className = 'lx-quali'; qBox.hidden = true;
    qBox.innerHTML = '<div class="lx-q-top"><b>CLASIFICACIÓN</b><span>1 VUELTA RÁPIDA POR AUTO</span><button type="button" class="lx-q-skip">SALTAR ⏭</button></div><div class="lx-q-cur"></div><div class="lx-q-list"></div>';
    host.appendChild(qBox); qBox.querySelector('.lx-q-skip').onclick = () => { Q.skip = true; }; return qBox;
  }
  function qRender() {
    const box = qUI(), cur = Q.order[Q.idx] != null ? Q.raw[Q.order[Q.idx]] : null;
    const done = Q.results.slice().sort((a, b) => a.time - b.time);
    box.querySelector('.lx-q-cur').innerHTML = cur && !Q.between
      ? `<div class="lx-q-drv" style="border-color:${hex(cur.entry.team.color)}">${logoImg(cur.entry.team, 46, 30)}<div><strong>${esc(cur.entry.driver.name.toUpperCase())}</strong><small>${esc(cur.entry.team.name.toUpperCase())}</small></div><em>${fmt(Math.min(Q.t, cur.time))}</em></div>`
      : (Q.last ? `<div class="lx-q-drv done" style="border-color:${hex(Q.last.entry.team.color)}">${logoImg(Q.last.entry.team, 46, 30)}<div><strong>${esc(Q.last.entry.driver.short)} · ${fmt(Q.last.time)}</strong><small>${Q.lastPos === 1 ? '¡PROVISIONAL POLE!' : 'P' + Q.lastPos + ' · +' + (Q.last.time - done[0].time).toFixed(3)}</small></div></div>` : '');
    box.querySelector('.lx-q-list').innerHTML = done.slice(0, 10).map((r, i) => `<div class="${r === Q.last ? 'hi' : ''}"><i>${i + 1}</i><i class="c" style="background:${hex(r.entry.team.color)}"></i><span>${esc(r.entry.driver.short)}</span><b>${i ? '+' + (r.time - done[0].time).toFixed(3) : fmt(r.time)}</b></div>`).join('');
  }
  function startQuali() {
    if (Q.active || state.phase !== 'grid') return;
    if (Career.qualifyingDoneRound === currentRound(Career).round) return;
    const grid = buildGrid(), base = trackLength / 34, wx = 1 / Math.sqrt(CURRENT_WEATHER_GRIP || 1);
    const raw = grid.map((entry) => ({ entry, pace: qualiPace(entry.driver, entry.team) })), mn = Math.min(...raw.map((r) => r.pace));
    raw.forEach((r) => { r.time = base * wx * (1 + (r.pace - mn) * .0011) + Math.random() * .09; });
    const order = raw.map((_, i) => i).sort(() => Math.random() - .5);
    Object.assign(Q, { active: true, raw, order, idx: 0, t: 0, between: 0, results: [], last: null, lastPos: 0, skip: false, prev: performance.now() });
    window.__keepWx = true; // clasificación y carrera comparten clima y hora
    $('intro').style.display = 'none'; $('quali-button').disabled = true; $('start-button').disabled = true;
    state.cars.forEach((c) => { c.mesh.group.visible = false; });
    qUI().hidden = false; qRender(); sfx('whistle');
  }
  function qFinish() {
    const res = Q.results.slice().sort((a, b) => a.time - b.time);
    state.grid = res.map((r) => r.entry); state.poleTeamId = state.grid[0].team.id; state.poleTime = res[0].time;
    Career.qualifyingDoneRound = currentRound(Career).round; Career.lastQuali = { round: Career.qualifyingDoneRound, times: res.map((r) => [r.entry.team.id, r.time]) };
    saveCareer(Career); Q.active = false; qBox.hidden = true; $('start-button').disabled = false;
    resetRace(); window.__keepWx = false; addEvent('CLASIFICACIÓN', 'Pole: ' + res[0].entry.driver.name + ' · ' + fmt(res[0].time), null, 40);
    const player = res.findIndex((r) => r.entry.team.isPlayer);
    const rows = res.map((r, i) => `<tr class="${r.entry.team.isPlayer ? 'me' : ''}"><td>${i + 1}</td><td class="tm">${logoImg(r.entry.team, 40, 26)}<span class="cb" style="background:${hex(r.entry.team.color)}"></span>${esc(r.entry.driver.name.toUpperCase())}</td><td>${esc(r.entry.team.name)}</td><td class="t">${i ? '+' + (r.time - res[0].time).toFixed(3) : fmt(r.time)}</td></tr>`).join('');
    GameUI.openModal(`<div class="eyebrow">${esc(CURRENT_TRACK.name)} · CLASIFICACIÓN</div><h2 id="modal-title">RESULTADO DE CLASIFICACIÓN</h2><p style="color:#9aaec7">Tu equipo larga P${player + 1}. ${TODS[TOD].label} · ${WEATHER_STATES[wxKey].label}.</p><table class="roster lx-qt"><thead><tr><th>POS</th><th>PILOTO</th><th>EQUIPO</th><th>TIEMPO / DIF.</th></tr></thead><tbody>${rows}</tbody></table><button class="primary" id="q-go">IR A LA CARRERA →</button>`);
    $('q-go').onclick = () => GameUI.closeModal();
    sfx('chime');
  }
  const _cars2 = updateCarsVisual;
  updateCarsVisual = function (dt) {
    _cars2(dt);
    if (!Q.active) return;
    const now = performance.now(), rdt = Math.min(.1, (now - Q.prev) / 1000); Q.prev = now;
    if (Q.skip) { while (Q.idx < Q.order.length) { const r = Q.raw[Q.order[Q.idx++]]; Q.results.push(r); } return qFinish(); }
    const SPEEDUP = 7;
    if (Q.between > 0) { Q.between -= rdt; if (Q.between <= 0) { Q.between = 0; Q.idx++; Q.t = 0; if (Q.idx >= Q.order.length) return qFinish(); qRender(); } return; }
    const r = Q.raw[Q.order[Q.idx]], car = state.cars.find((c) => c.team.id === r.entry.team.id);
    Q.t += rdt * SPEEDUP;
    state.cars.forEach((c) => { c.mesh.group.visible = c === car; });
    const p = Math.min(1, Q.t / r.time); car.s = p * trackLength; car.lane = Math.sin(p * 31) * .8; car.v = trackLength / r.time * 1.2;
    const f = sample(car.s, car.lane); car.position.copy(f.p); car.mesh.group.position.copy(f.p); car.mesh.group.rotation.y = Math.atan2(f.tangent.x, f.tangent.z);
    car.mesh.wheels.forEach((w) => { w.rotation.x += car.v * rdt * SPEEDUP / .6; });
    state.focus = car.id; state.cameraMode = state.cameraMode === 'auto' ? 'auto' : state.cameraMode;
    if (Math.floor(Q.t * 4) !== Q._lt) { Q._lt = Math.floor(Q.t * 4); qRender(); }
    if (p >= 1) {
      Q.results.push(r); Q.last = r; const sorted = Q.results.slice().sort((a, b) => a.time - b.time); Q.lastPos = sorted.indexOf(r) + 1; Q.between = 1.5; qRender(); sfx(Q.lastPos === 1 ? 'chime' : 'beep');
    }
  };
  const _cam2 = updateCamera;
  updateCamera = function (dt) {
    if (Q.active && state.phase === 'grid') {
      const car = state.cars.find((c) => c.visible !== false && c.mesh.group.visible) || state.cars[0], f = sample(car.s, car.lane);
      const t = performance.now() * .00035, shot = Math.floor(Q.t / 3.2) % 3;
      const pos = shot === 0 ? f.p.clone().addScaledVector(f.tangent, -15).addScaledVector(f.normal, -5).add(new THREE.Vector3(0, 6.5, 0))
        : shot === 1 ? f.p.clone().addScaledVector(f.tangent, 8).addScaledVector(f.normal, -20).add(new THREE.Vector3(0, 4.5, 0))
          : f.p.clone().addScaledVector(f.tangent, 25 * Math.cos(t)).addScaledVector(f.normal, 30 * Math.sin(t)).add(new THREE.Vector3(0, 18, 0));
      camera.position.lerp(pos, 1 - Math.exp(-dt * 4)); cameraAim.lerp(f.p.clone().add(new THREE.Vector3(0, 1, 0)), 1 - Math.exp(-dt * 6));
      camera.lookAt(cameraAim); camera.fov = 50; camera.updateProjectionMatrix();
      const lb = $('camera-label'); if (lb) lb.textContent = 'CAM · VUELTA DE CLASIFICACIÓN';
      return;
    }
    _cam2(dt);
  };
  $('quali-button').onclick = startQuali;

  // ------------------------------------------------------------------ podio
  let podiumDone = false;
  const _results = showRoundResults;
  showRoundResults = function () {
    if (state.phase !== 'finished') return;
    if (podiumDone || !state.order || state.order.length < 3) { podiumDone = false; return _results(); }
    podiumDone = true; showPodium(() => { _results(); podiumDone = false; });
  };
  function podiumMusic() {
    return new Promise((resolve) => {
      if (!window.Touchline || !Touchline.getCosmetics) return resolve(null);
      Touchline.getCosmetics().then((r) => {
        const c = r && r.cosmetics; if (!c) return resolve(null);
        const id = (c.equipMusic || []).find(Boolean); const it = id && (c.catalogMusic || []).find((m) => m.id === id);
        resolve(it ? '../01-futbol/celebrationost/' + encodeURIComponent(it.file) : null);
      }).catch(() => resolve(null));
    });
  }
  function showPodium(done) {
    const host = $b(); const top = state.order.slice(0, 3); window.__podiumOn = true;
    const wrap = document.createElement('div'); wrap.className = 'lx-podium';
    const slot = (c, i) => {
      const h = [150, 112, 84][i], col = hex(c.team.color);
      return `<div class="lx-p-slot p${i + 1}" style="--h:${h}px;--c:${col};--d:${[1.6, 0.8, 0.2][i]}s"><div class="lx-p-car">${RacingArt.image('car', c.team.bodyType, liveryFor(c.team))}</div><div class="lx-p-drv"><strong>${esc(c.driver.name.toUpperCase())}</strong><small>${logoImg(c.team, 36, 24)} ${esc(c.team.name.toUpperCase())}</small></div><div class="lx-p-step"><b>${i + 1}</b></div></div>`;
    };
    wrap.innerHTML = `<canvas class="lx-p-conf"></canvas><div class="lx-p-title"><small>${esc(CURRENT_TRACK.name)} · PODIO</small><h2>¡CELEBRACIÓN EN EL PODIO!</h2></div><div class="lx-p-stage">${[top[1], top[0], top[2]].map((c, k) => slot(c, [1, 0, 2][k])).join('')}</div><div class="lx-p-flash"></div><button type="button" class="lx-p-go">CONTINUAR ▶</button>`;
    host.appendChild(wrap);
    // confeti
    const cv = wrap.querySelector('.lx-p-conf'), cx = cv.getContext('2d'); let W = 0, H = 0, parts = [], alive = true;
    const fit = () => { W = cv.width = host.clientWidth; H = cv.height = host.clientHeight; }; fit();
    const cols = ['#ffd24a', '#ff5b36', '#36c2ff', '#7ed321', '#ff7ad9', '#ffffff'];
    const burst = (n) => { for (let i = 0; i < n; i++) parts.push({ x: Math.random() * W, y: -10 - Math.random() * H * .3, vx: (Math.random() - .5) * 3, vy: 2 + Math.random() * 3, r: Math.random() * 6, s: 4 + Math.random() * 6, c: cols[i % cols.length], sp: (Math.random() - .5) * .3 }); };
    let flashT = 0; burst(160);
    (function loop() {
      if (!alive) return; cx.clearRect(0, 0, W, H);
      parts.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += .03; p.r += p.sp; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore(); });
      parts = parts.filter((p) => p.y < H + 20); if (parts.length < 90 && Math.random() < .5) burst(6);
      flashT -= 1; if (flashT <= 0 && Math.random() < .03) { flashT = 6; wrap.querySelector('.lx-p-flash').classList.add('on'); setTimeout(() => wrap.querySelector('.lx-p-flash').classList.remove('on'), 90); }
      requestAnimationFrame(loop);
    })();
    // música: canción de celebración equipada, o fanfarria sintetizada
    let aud = null, fan = null;
    podiumMusic().then((url) => {
      if (!alive) return;
      if (url) { aud = new Audio(url); aud.volume = .7; aud.play().catch(() => { fan = sfx('fanfare', { loop: true }); }); }
      else fan = sfx('fanfare');
    });
    sfx('crowd_cheer');
    const end = () => { if (!alive) return; alive = false; try { aud && aud.pause(); } catch (e) {} try { fan && fan.stop && fan.stop(); } catch (e) {} wrap.classList.add('out'); setTimeout(() => { wrap.remove(); window.__podiumOn = false; done(); }, 350); };
    wrap.querySelector('.lx-p-go').onclick = end;
    window.addEventListener('resize', fit, { once: true });
  }

  // ------------------------------------------------------------------ calendario con mapas de los circuitos
  function trackPts(def, n) {
    try { const cv = RacingArt.trackCurve(def), a = []; for (let i = 0; i < n; i++) { const p = cv.getPoint(i / n); a.push([p.x, p.z]); } return a; } catch (e) { return null; }
  }
  function mapSvg(t) {
    const pts = trackPts(t, 140); if (!pts) return '';
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; pts.forEach(([x, z]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); });
    const W = 560, H = 400, pad = 46, sc = Math.min((W - pad * 2) / (x1 - x0), (H - pad * 2) / (z1 - z0)), ox = (W - (x1 - x0) * sc) / 2, oz = (H - (z1 - z0) * sc) / 2;
    const P = pts.map(([x, z]) => [ox + (x - x0) * sc, oz + (z - z0) * sc]);
    const d = 'M' + P.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L') + 'Z';
    let h = 0; for (const c of t.id) h = (h * 31 + c.charCodeAt(0)) >>> 0; const rnd = () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
    const theme = { desert: ['#c9a66b', '#b99456', '#8a7a3c'], mountain: ['#5f7a58', '#4b6549', '#2f4a2f'], coast: ['#5d8a63', '#4f7a56', '#2f5a3a'], forest: ['#3f6d3e', '#345c35', '#1f4a24'], city: ['#6b7079', '#5a5f68', '#484d56'], night: ['#26364d', '#1e2c40', '#16223a'], grass: ['#6f9a52', '#5f8a45', '#3d6b30'] }[t.theme] || ['#5f8a55', '#4f7a48', '#345c36'];
    let dec = ''; for (let i = 0; i < 70; i++) { const x = rnd() * W, y = rnd() * H; dec += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(3 + rnd() * 6).toFixed(1)}" fill="${theme[2]}" opacity=".55"/>`; }
    const sea = (t.theme === 'coast') ? `<path d="M0,0H${W}V${(H * .16).toFixed(0)}Q${W * .5},${(H * .26).toFixed(0)} 0,${(H * .12).toFixed(0)}Z" fill="#3f78a8"/>` : '';
    const sand = `<ellipse cx="${(rnd() * W).toFixed(0)}" cy="${(H * .8).toFixed(0)}" rx="70" ry="42" fill="#d8c08a" opacity=".85"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g-${t.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${theme[0]}"/><stop offset="1" stop-color="${theme[1]}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g-${t.id})"/>${sea}${sand}${dec}<path d="${d}" fill="none" stroke="#f3efe4" stroke-width="15" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#2c3038" stroke-width="11" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#e8e6df" stroke-width="1" stroke-dasharray="7 9" opacity=".5"/><rect x="${(P[0][0] - 3).toFixed(1)}" y="${(P[0][1] - 10).toFixed(1)}" width="6" height="20" fill="#fff" stroke="#000" stroke-width="1.2"/></svg>`;
  }
  renderCalendarScreen = function () {
    if (!$('cal-races')) return;
    const cur = currentRound(Career), total = Career.calendar.length, done = Career.calendar.filter((r) => r.completed).length, left = total - done;
    const N = window.LFONations, flag = (n) => (N && n ? N.flag(n) : '');
    $('cal-summary').innerHTML = `<div class="cal-summary"><div><span class="big">${left}</span><small>${left === 1 ? 'FECHA RESTANTE' : 'FECHAS RESTANTES'}</small></div><div><span class="big">${done}/${total}</span><small>DISPUTADAS · TEMPORADA ${Career.season}</small></div><div><span class="big">${fmtRaceDate(Career.season, cur.round).toUpperCase()}</span><small>PRÓXIMA CARRERA · ${esc((TRACKS.find((t) => t.id === cur.trackId) || {}).name || '')}</small></div><div class="cal-bar"><i style="width:${Math.round(done / total * 100)}%"></i></div></div>`;
    $('cal-races').innerHTML = Career.calendar.map((r) => {
      const t = TRACKS.find((x) => x.id === r.trackId) || TRACKS[0], isNow = cur && r.round === cur.round, f = flag(t.nation);
      return `<article class="cal-race lx-cal ${r.completed ? 'done' : ''} ${isNow ? 'now' : ''}"><div class="lx-map">${mapSvg(t)}<div class="lx-cal-title"><span>${String(r.round).padStart(2, '0')}</span>${esc(t.name)}</div><div class="lx-cal-st">${r.completed ? esc(r.result || 'DISPUTADA') : isNow ? 'PRÓXIMA' : 'PENDIENTE'}</div>${f ? `<img class="lx-cal-flag" src="${f}" alt="">` : ''}</div><div class="lx-cal-info"><div class="date">${fmtRaceDate(Career.season, r.round).toUpperCase()}</div><div>${esc(t.country)} · ${t.lengthKm ? Number(t.lengthKm).toFixed(2) + ' km' : ''} · ${t.corners || '?'} curvas</div><small>${esc(t.character || t.desc || '')}</small></div></article>`;
    }).join('');
  };
  try { if ($('cal-races')) renderCalendarScreen(); } catch (e) { /* aún no se muestra */ }
  // el juego llama refreshScreen('calendar') → renderCalendarScreen por nombre (global), así que ya usa esta versión.

  // ------------------------------------------------------------------ logos de escudería en la tabla de tiempos
  const _bs = buildStandings;
  buildStandings = function () {
    _bs();
    document.querySelectorAll('.driver-row').forEach((row) => { const c = state.cars[Number(row.dataset.driver)]; if (c && c.team.logo && !row.querySelector('.lx-logo')) row.querySelector('.stripe').insertAdjacentHTML('afterend', logoImg(c.team, 26, 18)); });
  };
  buildStandings();
  resetRace(); // aplica hora del día / clima visual al primer render
})();

// ---- móvil: tabla desplegable y mandos rápidos dentro de la transmisión -------------------------
(function () {
  const $ = (q) => document.querySelector(q), bc = $('.broadcast'); if (!bc) return;
  const head = $('.timing-head'), tm = $('.timing');
  if (head && tm) { const b = document.createElement('button'); b.className = 'tw-btn'; b.type = 'button'; b.textContent = '▾'; b.setAttribute('aria-label', 'Ver toda la tabla'); b.onclick = (e) => { e.stopPropagation(); tm.classList.toggle('tw-open'); }; head.appendChild(b); }
  const ctl = document.createElement('div'); ctl.className = 'lm-ctl';
  ctl.innerHTML = '<button type="button" data-a="go" aria-label="Iniciar o pausar">▶</button><button type="button" data-a="spd" aria-label="Velocidad">1×</button>';
  bc.appendChild(ctl);
  const speeds = () => [...document.querySelectorAll('.speed-group [data-speed]')];
  ctl.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'go') { const s = $('#start-button'); if (s) s.click(); }
    else { const l = speeds(), i = l.findIndex((x) => x.classList.contains('active')); const n = l[(i + 1) % l.length]; if (n) n.click(); }
  });
  setInterval(() => {
    const a = speeds().find((x) => x.classList.contains('active')); if (a) ctl.querySelector('[data-a=spd]').textContent = a.textContent;
    const s = $('#start-label'); if (s) ctl.querySelector('[data-a=go]').textContent = /PAUS|PAUSE/i.test(s.textContent) ? '⏸' : '▶';
  }, 500);
})();

// ---- móvil vertical: la cinta de posiciones se ordena por puesto y sigue al piloto seleccionado -------------------------------
(function () {
  let lastSel = null;
  setInterval(() => {
    const rows = [...document.querySelectorAll('.driver-row')]; if (!rows.length || !document.documentElement.classList.contains('em-portrait')) return;
    rows.forEach((r) => { const p = parseInt(r.querySelector('.pos').textContent, 10); r.style.order = isNaN(p) ? 99 : p; });
    const sel = rows.find((r) => r.classList.contains('selected'));
    if (sel && sel !== lastSel) { lastSel = sel; const box = sel.parentElement; if (box && box.scrollWidth > box.clientWidth) box.scrollTo({ left: Math.max(0, sel.offsetLeft - box.clientWidth / 2 + sel.clientWidth / 2), behavior: 'smooth' }); }
  }, 350);
})();
