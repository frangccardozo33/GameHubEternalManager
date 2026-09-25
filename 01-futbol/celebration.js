/* LFO · Canción de festejo de gol.
   Al marcarse un gol suena un tema (por ahora al azar) SIN fundido de entrada. Durante el festejo y la repetición se oye "limpio" (como en la
   transmisión). Cuando la repetición termina y se reanuda el juego, el tema pasa por un efecto de estadio (filtro + reverberación + eco) y
   se apaga con fundido: el tema termina ≈5 s después de que se reanude el juego.
   Es independiente del botón de sonido del ambiente (que arranca apagado): suena siempre salvo que se desactive con LFOCelebration.enabled = false.
   Las canciones salen de celebrationost/ (manifest.js). */
(function (g) {
  'use strict';
  const HOLD_AFTER_RESUME = 2.5;  // s con efecto de estadio antes de empezar el fundido de salida
  const FADE_OUT = 2.5;           // s de fundido de salida (HOLD + FADE = ≈5 s tras reanudar)
  const DIR = 'celebrationost/';

  const C = (g.LFOCelebration = {
    enabled: true,
    // Selección de tema. Si el jugador equipó una canción de la Tienda Diaria para esta situación, se usa esa;
    // si no, aleatoria (sin repetir la anterior) entre el pool de siempre.
    pickSong(goal, songs) {
      if (g.LFOCosmetics && g.LFOCosmetics.pickSong) {
        const picked = g.LFOCosmetics.pickSong(goal && goal.situation);
        if (picked) return (C._last = picked);
      }
      if (!songs.length) return null;
      let s; do { s = songs[Math.floor(Math.random() * songs.length)]; } while (songs.length > 1 && s === C._last);
      return (C._last = s);
    },
    _last: null, _cur: null, _ctx: null, _warned: false,
  });

  const $ = (id) => document.getElementById(id);

  function impulse(ctx, secs) {
    const n = Math.floor(ctx.sampleRate * secs), buf = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch); let lp = 0;
      for (let i = 0; i < n; i++) {
        const t = i / n, k = 0.55 + 0.42 * t;                 // el filtro se cierra con el tiempo (cola más oscura)
        lp = lp * k + (Math.random() * 2 - 1) * (1 - k);
        d[i] = lp * Math.pow(1 - t, 2.6) * 3.2;
      }
    }
    return buf;
  }

  function graph() {
    if (C._ctx) return C._ctx;
    const Ctx = g.AudioContext || g.webkitAudioContext; if (!Ctx) return null;
    const ctx = new Ctx(), out = ctx.createGain(), comp = ctx.createDynamicsCompressor();
    out.gain.value = 0.9; out.connect(comp); comp.connect(ctx.destination);
    const input = ctx.createGain();
    // camino limpio
    const dry = ctx.createGain(); dry.gain.value = 1; input.connect(dry); dry.connect(out);
    // camino "estadio": banda estrecha (parlantes lejanos) + reverberación larga + eco
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 220;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; lp.Q.value = 0.6;
    const fxIn = ctx.createGain(); fxIn.gain.value = 0; input.connect(hp); hp.connect(lp); lp.connect(fxIn);
    const direct = ctx.createGain(); direct.gain.value = 0.55; fxIn.connect(direct); direct.connect(out);
    const conv = ctx.createConvolver(); conv.buffer = impulse(ctx, 2.8);
    const wet = ctx.createGain(); wet.gain.value = 1.25; fxIn.connect(conv); conv.connect(wet); wet.connect(out);
    const delay = ctx.createDelay(1); delay.delayTime.value = 0.13; const fb = ctx.createGain(); fb.gain.value = 0.32;
    const echo = ctx.createGain(); echo.gain.value = 0.35; fxIn.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(echo); echo.connect(out);
    C._ctx = { ctx, input, dry, fxIn, out };
    return C._ctx;
  }

  const FILE = location.protocol === 'file:';   // desde file:// el audio del <audio> pasado por Web Audio sale mudo (origen opaco): se reproduce directo, sin efecto
  function setMode(p, mode) {
    if (p.direct) { p.mode = mode; return; }
    const { ctx, dry, fxIn } = C._ctx, t = ctx.currentTime;
    dry.gain.cancelScheduledValues(t); fxIn.gain.cancelScheduledValues(t);
    dry.gain.setTargetAtTime(mode === 'stadium' ? 0.14 : 1, t, 0.18);
    fxIn.gain.setTargetAtTime(mode === 'stadium' ? 1 : 0, t, 0.18);
    p.mode = mode;
  }

  function stop(p, quick) {
    if (!p || p.dead) return; p.dead = true;
    const a = p.el, t = C._ctx ? C._ctx.currentTime : 0;
    try { if (quick && p.gain) { p.gain.gain.cancelScheduledValues(t); p.gain.gain.setTargetAtTime(0, t, 0.05); setTimeout(() => { try { a.pause(); p.src.disconnect(); } catch (e) {} }, 300); } else { a.pause(); p.src.disconnect(); } } catch (e) {}
    if (C._cur === p) C._cur = null;
  }

  async function start(goal) {
    const songs = g.LFO_CELEBRATION_SONGS || []; const song = C.pickSong(goal, songs); if (!song) return;
    if (C._cur) stop(C._cur, true);
    const G = graph(); if (!G) return;
    try { await G.ctx.resume(); } catch (e) {}
    const el = new Audio(DIR + encodeURIComponent(song.file)); el.preload = 'auto';
    let src = null, gain = null;
    if (!FILE) { src = G.ctx.createMediaElementSource(el); gain = G.ctx.createGain(); gain.gain.value = 1; src.connect(gain); gain.connect(G.input); }   // sin fundido de entrada
    const p = { el, src, gain, song, mode: 'clean', fadeAt: null, dead: false, direct: FILE };
    el.volume = 1; C._cur = p; if (!FILE) setMode(p, 'clean'); p.mode = 'clean';
    el.onended = () => stop(p);
    el.play().catch((err) => { console.warn('[LFO] no se pudo reproducir la canción de festejo:', err && err.message); stop(p); });
    g.LFOCelebration.nowPlaying = song.title;
    try { g.lfoArchive.notify('♪ ' + song.title); } catch (e) {}
  }

  function fadeOut(p) {
    if (p.direct) {
      const t0 = performance.now(), v0 = p.el.volume; clearInterval(p.fadeTimer);
      p.fadeTimer = setInterval(() => { const k = (performance.now() - t0) / 1000 - HOLD_AFTER_RESUME; if (k >= FADE_OUT) { clearInterval(p.fadeTimer); stop(p); } else if (k > 0) p.el.volume = Math.max(0, v0 * (1 - k / FADE_OUT)); }, 50);
      return;
    }
    const t = C._ctx.ctx.currentTime;
    p.gain.gain.cancelScheduledValues(t); p.gain.gain.setValueAtTime(p.gain.gain.value, t);
    p.gain.gain.setValueAtTime(p.gain.gain.value, t + HOLD_AFTER_RESUME);
    p.gain.gain.linearRampToValueAtTime(0.0001, t + HOLD_AFTER_RESUME + FADE_OUT);
    p.fadeAt = performance.now();
    clearTimeout(p.fadeTimer); p.fadeTimer = setTimeout(() => { if (p.mode === 'stadium' && !p.dead) stop(p); }, (HOLD_AFTER_RESUME + FADE_OUT) * 1000 + 120);
  }

  let prevPhase = null, prevElapsed = 0;
  function loop() {
    const A = g.lfoArchive, m = A && A.match; if (!m) return;
    const phase = m.phase, replay = !!$('replay-badge') && !$('replay-badge').hidden;
    const p = C._cur;
    if (m.elapsed < prevElapsed - 1 || m.ended) { if (p) stop(p, true); }     // reinicio o final del partido
    prevElapsed = m.elapsed;
    if (C.enabled && phase === 'goal' && prevPhase !== 'goal') {
      start(m.tlGoal || null);
    }
    prevPhase = phase;
    if (!p || p.dead) return;
    const live = phase === 'goal' || replay;                                   // festejo + repetición → sonido limpio
    if (live && p.mode !== 'clean') {                                          // (p. ej. arranca la repetición) → cancela el fundido
      setMode(p, 'clean'); if (p.direct) p.el.volume = 1; else { const t = C._ctx.ctx.currentTime; p.gain.gain.cancelScheduledValues(t); p.gain.gain.setValueAtTime(1, t); } p.fadeAt = null; clearTimeout(p.fadeTimer); clearInterval(p.fadeTimer);
    } else if (!live && p.mode === 'clean') {                                  // se reanudó el juego → efecto de estadio + salida
      setMode(p, 'stadium'); fadeOut(p);
    }
  }
  // Los navegadores sólo dejan sonar audio tras un gesto del usuario: se prepara el contexto en el primer clic/tecla (antes del primer gol).
  const unlock = () => { const G = graph(); if (G && G.ctx.state === 'suspended') G.ctx.resume().catch(() => {}); };
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => document.addEventListener(ev, unlock, { capture: true, passive: true }));
  setInterval(loop, 100);   // temporizador (no rAF): sigue funcionando con la pestaña en segundo plano
})(window);
