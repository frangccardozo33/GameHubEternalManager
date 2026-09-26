/* LRO · post-proceso de la transmisión: motion blur por reproyección + look de TV.
 *
 * Se engancha a renderer.render ANTES de lro-cams.js (que agrega cabina y PiP encima), así esos recuadros quedan nítidos.
 * Pasadas: escena -> RT HDR (con profundidad) -> bloom (1/4) -> compuesto: motion blur, aberración cromática, bloom,
 * tone mapping ACES del renderer, gradación de "señal de TV" (negros levantados, desaturado, viñeta, grano).
 *
 * Motion blur: con la profundidad se reconstruye la posición de mundo de cada píxel y se reproyecta con la matriz de la
 * cámara del cuadro anterior; la diferencia es el vector de blur. Se protege una elipse alrededor del auto en foco
 * (así, en un travelling, el auto queda nítido y el fondo se estira, como en la referencia de TV).
 *
 * Calidad: window.LROFX.mode = 'high' | 'lite' | 'off' (botón «FX TV» en los controles de cámara; se recuerda). */
(function () {
  'use strict';
  if (typeof THREE === 'undefined' || typeof renderer === 'undefined' || typeof scene === 'undefined' || typeof camera === 'undefined') return;
  const KEY = 'lro_fx';
  const touch = document.documentElement.classList.contains('em-touch');
  let mode; try { mode = localStorage.getItem(KEY); } catch (e) { }
  if (!/^(high|lite|off)$/.test(mode || '')) mode = touch ? 'lite' : 'high';
  const FX = window.LROFX = { mode, blur: 1.5, get ok() { return ok; } };
  let ok = true;

  const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';

  // ---- bloom: umbral + desenfoque separable a 1/4 de resolución
  const BRIGHT = `varying vec2 vUv; uniform sampler2D tSrc; uniform vec2 uPx; uniform float uThr;
    void main(){ vec3 s = vec3(0.);
      vec2 d = uPx * 2.;
      s += texture2D(tSrc, vUv + vec2(-d.x,-d.y)).rgb; s += texture2D(tSrc, vUv + vec2(d.x,-d.y)).rgb;
      s += texture2D(tSrc, vUv + vec2(-d.x,d.y)).rgb;  s += texture2D(tSrc, vUv + vec2(d.x,d.y)).rgb; s *= .25;
      float l = max(s.r, max(s.g, s.b)); float k = smoothstep(uThr, uThr + 1.2, l);
      gl_FragColor = vec4(s * k, 1.); }`;
  const BLUR = `varying vec2 vUv; uniform sampler2D tSrc; uniform vec2 uDir;
    void main(){ vec3 s = texture2D(tSrc, vUv).rgb * .2270270;
      s += (texture2D(tSrc, vUv + uDir*1.3846).rgb + texture2D(tSrc, vUv - uDir*1.3846).rgb) * .3162162;
      s += (texture2D(tSrc, vUv + uDir*3.2308).rgb + texture2D(tSrc, vUv - uDir*3.2308).rgb) * .0702703;
      gl_FragColor = vec4(s, 1.); }`;

  // ---- compuesto final
  const COMP = `varying vec2 vUv;
    uniform sampler2D tScene, tDepth, tBloom;
    uniform mat4 uInvVP, uPrevVP;
    uniform vec2 uRes; uniform float uAspect, uBlur, uSamples, uCA, uBloom, uTime, uFull, uMaxLen, uRadial;
    uniform vec3 uCar; // xy = centro del auto en UV, z = radio (alto de pantalla); z<=0 sin máscara
    float hash(vec2 p){ p = fract(p*vec2(443.897,441.423)); p += dot(p, p.yx+19.19); return fract((p.x+p.y)*p.x); }
    vec3 fetch(vec2 uv, float ca){
      if (uFull < .5) return texture2D(tScene, uv).rgb;
      vec2 c = uv - .5; vec2 o = c * ca;
      return vec3(texture2D(tScene, uv + o).r, texture2D(tScene, uv).g, texture2D(tScene, uv - o).b);
    }
    void main(){
      vec2 uv = vUv;
      float z = texture2D(tDepth, uv).x;
      vec4 w = uInvVP * vec4(uv*2.-1., z*2.-1., 1.); w /= w.w;
      vec4 pc = uPrevVP * w; vec2 puv = pc.xy / pc.w * .5 + .5;
      vec2 v = (uv - puv) * uBlur;               // desplazamiento del cuadro, en UV
      // estela radial extra desde el centro (sensación de velocidad, sobre todo a bordo)
      vec2 rc = uv - .5; v += rc * uRadial * dot(rc, rc) * 2.2;
      float len = length(v * vec2(uAspect, 1.));
      if (len > uMaxLen) v *= uMaxLen / len;
      if (uCar.z > 0.){ vec2 d = (uv - uCar.xy) * vec2(uAspect, 1.); float m = smoothstep(uCar.z*.75, uCar.z*1.7, length(d)); v *= m; }
      float ca = uCA * (.4 + 1.6 * dot(rc, rc));
      vec3 col = vec3(0.); float n = uSamples; float jit = hash(uv*uRes + uTime) - .5;
      for (int i = 0; i < 16; i++){ if (float(i) >= n) break; float t = (float(i) + .5 + jit) / n - .5; col += fetch(uv + v * t, ca); }
      col /= n;
      col += texture2D(tBloom, uv).rgb * uBloom;
      // tone mapping del renderer (ACES + exposición) y a sRGB
      col = toneMapping(col);
      col = linearToOutputTexel(vec4(col, 1.)).rgb;
      // señal de TV: negros levantados, algo desaturado, contraste, sombras frías / luces cálidas
      float L = dot(col, vec3(.299,.587,.114));
      col = mix(vec3(L), col, .90);
      col = (col - .5) * 1.07 + .5;
      col = col * .97 + .022;
      col += vec3(-.010, .002, .014) * (1. - L) + vec3(.014, .006, -.010) * L * L;
      // viñeta y grano (ruido de sensor / compresión)
      col *= 1. - dot(rc, rc) * .55 * uFull - dot(rc, rc) * .12;
      col += (hash(uv * uRes + uTime * 61.) - .5) * (.034 * uFull + .012);
      gl_FragColor = vec4(clamp(col, 0., 1.), 1.);
    }`;

  const quadGeo = new THREE.BufferGeometry();
  quadGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  quadGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
  const quadScene = new THREE.Scene(), quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(quadGeo, null); quad.frustumCulled = false; quadScene.add(quad);
  const mk = (frag, uni) => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms: uni, depthTest: false, depthWrite: false });
  const mBright = mk(BRIGHT, { tSrc: { value: null }, uPx: { value: new THREE.Vector2() }, uThr: { value: 1.05 } });
  const mBlur = mk(BLUR, { tSrc: { value: null }, uDir: { value: new THREE.Vector2() } });
  const mComp = mk(COMP, {
    tScene: { value: null }, tDepth: { value: null }, tBloom: { value: null },
    uInvVP: { value: new THREE.Matrix4() }, uPrevVP: { value: new THREE.Matrix4() },
    uRes: { value: new THREE.Vector2(1, 1) }, uAspect: { value: 1.7 }, uBlur: { value: 0 }, uSamples: { value: 12 }, uCA: { value: .004 },
    uBloom: { value: .22 }, uTime: { value: 0 }, uFull: { value: 1 }, uMaxLen: { value: .09 }, uRadial: { value: 0 }, uCar: { value: new THREE.Vector3(.5, .5, 0) }
  });

  let rt = null, rtA = null, rtB = null, W = 0, H = 0, prevVP = new THREE.Matrix4(), hasPrev = false, lastT = performance.now(), lastPos = new THREE.Vector3(), lastFov = 0;
  const vp = new THREE.Matrix4(), tmp = new THREE.Vector3();

  function alloc(w, h) {
    [rt, rtA, rtB].forEach((t) => t && t.dispose());
    const depth = new THREE.DepthTexture(w, h); depth.type = THREE.UnsignedIntType; depth.minFilter = depth.magFilter = THREE.NearestFilter;
    rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthTexture: depth, samples: 4 });
    const bw = Math.max(2, w >> 2), bh = Math.max(2, h >> 2), o = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
    rtA = new THREE.WebGLRenderTarget(bw, bh, o); rtB = new THREE.WebGLRenderTarget(bw, bh, o);
    W = w; H = h;
  }
  const pass = (mat, target) => { quad.material = mat; renderer.setRenderTarget(target); renderer.render(quadScene, quadCam); };

  const origRender = renderer.render.bind(renderer);
  renderer.render = function (sc, cam) {
    if (!ok || FX.mode === 'off' || sc !== scene || cam !== camera || renderer.getRenderTarget() !== null) return origRender(sc, cam);
    try {
      const sz = renderer.getDrawingBufferSize(new THREE.Vector2()), w = sz.x | 0, h = sz.y | 0;
      if (w < 8 || h < 8) return origRender(sc, cam);
      if (!rt || w !== W || h !== H) { alloc(w, h); hasPrev = false; }
      const now = performance.now(), dt = Math.min(.05, Math.max(.007, (now - lastT) / 1000)); lastT = now;
      const full = FX.mode === 'high';

      camera.updateMatrixWorld(); vp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      // corte de cámara (cambio de plano / de auto): sin blur ese cuadro
      const cut = tmp.copy(camera.position).distanceTo(lastPos) > 60 || Math.abs(camera.fov - lastFov) > 9; lastPos.copy(camera.position); lastFov = camera.fov;
      if (!hasPrev || cut) prevVP.copy(vp);
      const u = mComp.uniforms;
      u.uInvVP.value.copy(vp).invert(); u.uPrevVP.value.copy(prevVP);
      // normaliza por frame-rate: obturador de 180° a 60 fps de referencia
      u.uBlur.value = (state.paused ? 0 : FX.blur) * (1 / 60) / dt;
      u.uSamples.value = full ? 14 : 7; u.uCA.value = full ? .0042 : 0; u.uBloom.value = full ? .24 : .12; u.uFull.value = full ? 1 : 0;
      u.uMaxLen.value = full ? .10 : .06; u.uTime.value = (now * .001) % 97; u.uRes.value.set(w, h); u.uAspect.value = w / h;
      // máscara del auto en foco + estela radial a bordo
      const onb = state.cameraMode === 'onboard' && state.phase !== 'grid', car = state.cars && (state.cars[state.focus] || null);
      if (car && !onb && state.phase !== 'grid' && typeof sample === 'function') {
        const f = sample(car.s, car.lane); tmp.copy(f.p); tmp.y += 1;
        const d = tmp.distanceTo(camera.position), c = tmp.clone().project(camera);
        const rad = 5.2 / (2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
        u.uCar.value.set(c.x * .5 + .5, c.y * .5 + .5, c.z < 1 ? Math.min(.5, rad) : 0);
      } else u.uCar.value.set(.5, .5, 0);
      u.uRadial.value = onb && car ? Math.min(1, (car.v || 0) * 3.6 / 300) * 1.4 : 0;

      // 1) escena al RT (sin tone mapping: lo hace el compuesto)
      renderer.setRenderTarget(rt); origRender(sc, cam); renderer.setRenderTarget(null);
      // 2) bloom
      mBright.uniforms.tSrc.value = rt.texture; mBright.uniforms.uPx.value.set(1 / w, 1 / h); pass(mBright, rtA);
      const bw = rtA.width, bh = rtA.height;
      mBlur.uniforms.tSrc.value = rtA.texture; mBlur.uniforms.uDir.value.set(1 / bw, 0); pass(mBlur, rtB);
      mBlur.uniforms.tSrc.value = rtB.texture; mBlur.uniforms.uDir.value.set(0, 1 / bh); pass(mBlur, rtA);
      mBlur.uniforms.tSrc.value = rtA.texture; mBlur.uniforms.uDir.value.set(1.6 / bw, 0); pass(mBlur, rtB);
      mBlur.uniforms.tSrc.value = rtB.texture; mBlur.uniforms.uDir.value.set(0, 1.6 / bh); pass(mBlur, rtA);
      // 3) compuesto a pantalla
      u.tScene.value = rt.texture; u.tDepth.value = rt.depthTexture; u.tBloom.value = rtA.texture;
      pass(mComp, null);
      prevVP.copy(vp); hasPrev = true;
    } catch (e) { ok = false; renderer.setRenderTarget(null); console.warn('[LRO post] desactivado:', e); origRender(sc, cam); }
  };

  // botón de calidad junto a las cámaras
  function ui() {
    const box = document.querySelector('.view-controls'); if (!box || box.querySelector('[data-fx]')) return;
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-fx', '1');
    const lab = () => { b.textContent = 'FX TV · ' + ({ high: 'ALTO', lite: 'LIGERO', off: 'NO' })[FX.mode]; b.classList.toggle('active', FX.mode !== 'off'); };
    b.onclick = () => { FX.mode = FX.mode === 'high' ? 'lite' : FX.mode === 'lite' ? 'off' : 'high'; try { localStorage.setItem(KEY, FX.mode); } catch (e) { } lab(); };
    lab(); box.appendChild(b);
  }
  ui();
})();
