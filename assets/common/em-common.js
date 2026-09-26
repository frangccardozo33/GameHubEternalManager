/* Eternal Manager · capa común de los módulos (todos menos Música).
 * La carga touchline-bridge.js. Da a cada módulo:
 *   EM.sfx        sonidos: archivos reales en assets/sfx/<nombre>.<ogg|mp3|wav|m4a> o, si falta, un placeholder sintetizado
 *   EM.pop        pop-ups informativos (8 tipos por deporte) y de anunciantes (banner, esquina, tercio inferior)
 *   EM.ads        tandas de video-comerciales (assets/videocomerciales) + anuncios pop-up
 *   EM.transition transición de pantalla
 *   EM.sponsors   contratos de patrocinio (máx. 3), pagan por partido + bonus por condiciones
 *   EM.celebrate  usa la música, el efecto de gol y la animación equipados en la Tienda del hub cuando se anota
 * Se engancha a Broadcast (assets/broadcast/broadcast.js) para enterarse de los eventos sin tocar los motores.
 * Lista de audios a reemplazar: assets/sfx/LEEME.md  ·  EM.sfx.list() en la consola.
 */
(function (g) {
  'use strict';
  if (g.EM) return;
  const SRC = (document.currentScript && document.currentScript.src) || '';
  const ROOT = SRC ? new URL('../', SRC).href : '../assets/';           // .../assets/
  const REPO = new URL('../', ROOT).href;                                // raíz del proyecto
  const P = location.pathname;
  const MOD = /01-futbol/.test(P) ? 'futbol' : /02-musica/.test(P) ? 'musica' : /03-casino/.test(P) ? 'casino' : /04-mma/.test(P) ? 'mma' : /05-basquet/.test(P) ? 'basquet' : /06-nfl/.test(P) ? 'nfl' : /07-carreras/.test(P) ? 'carreras' : '';
  if (!MOD || MOD === 'musica') return;
  const ACC = { futbol: '#27d468', basquet: '#ff9a3c', nfl: '#5ec98a', mma: '#d9463b', carreras: '#e97843', casino: '#e0b84a' }[MOD];
  const NAME = { futbol: 'Liga de Fútbol Online', basquet: 'Liga de Básquet Online', nfl: 'Liga de Gridiron Online', mma: 'Liga Lucha Online', carreras: 'Liga Racing Online', casino: 'Casino' }[MOD];
  const LOGO = { basquet: 'lbo-sm', nfl: 'lgo-sm', mma: 'llo-sm', carreras: 'lro-sm' }[MOD];
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const safe = (fn) => function () { try { return fn.apply(this, arguments); } catch (e) { if (g.console) console.warn('[EM]', e); } };
  const money = (n) => '$' + Math.round(n).toLocaleString('es-AR');

  // ------------------------------------------------------------------ opciones
  const OPT_KEY = 'em.opt.v1';
  const opt = Object.assign({ sfx: true, vol: .8, ads: true, pops: true, trans: true, ambient: true }, (() => { try { return JSON.parse(localStorage.getItem(OPT_KEY) || '{}'); } catch (e) { return {}; } })());
  try { if (localStorage.getItem('lfo.ads') === 'off') opt.ads = false; } catch (e) {}
  const saveOpt = () => { try { localStorage.setItem(OPT_KEY, JSON.stringify(opt)); localStorage.setItem('lfo.ads', opt.ads ? 'on' : 'off'); } catch (e) {} };

  // ------------------------------------------------------------------ CSS
  const css = document.createElement('style');
  css.textContent = `
.em-host,.em-bhost{position:fixed;inset:0;pointer-events:none;z-index:2147482000;font-family:"Barlow Condensed","Barlow","DM Sans",Arial,sans-serif;--a:${ACC}}
.em-bhost{position:absolute;z-index:40;overflow:hidden}
.em-pop{position:absolute;left:12px;top:64px;width:min(360px,calc(100vw - 32px));display:flex;gap:0;background:#0a1018f0;color:#fff;border:1px solid #ffffff22;box-shadow:0 8px 28px #000a;transform:translateX(-120%);transition:transform .45s cubic-bezier(.2,.9,.3,1),opacity .4s;opacity:0}
.em-pop.on{transform:none;opacity:1}.em-pop.out{transform:translateX(-120%);opacity:0}
.em-pop .em-bar{width:5px;background:var(--a);flex:none}
.em-pop .em-ic{width:50px;flex:none;display:flex;align-items:center;justify-content:center;font-size:24px;background:#ffffff0d}
.em-pop .em-tx{padding:9px 13px 10px;min-width:0}.em-pop .em-tag{font:700 10px/1 "Barlow Condensed",Arial;letter-spacing:.22em;color:var(--a);text-transform:uppercase}
.em-pop h4{margin:4px 0 3px;font:italic 800 19px/1.05 "Barlow Condensed",Arial;letter-spacing:.02em;text-transform:uppercase}.em-pop p{margin:0;font:500 13px/1.35 "Barlow","DM Sans",Arial;color:#dbe6f2}
.em-pop .em-prog{position:absolute;left:0;bottom:0;height:2px;background:var(--a);width:100%;transform-origin:left;animation:emprog linear forwards}
@keyframes emprog{to{transform:scaleX(0)}}
.em-ad{position:absolute;left:50%;bottom:64px;transform:translate(-50%,160%);width:min(620px,calc(100vw - 24px));display:flex;align-items:center;gap:14px;background:linear-gradient(90deg,#0a1018f2,#16202cf2);border-top:3px solid var(--a);color:#fff;padding:9px 16px;transition:transform .5s cubic-bezier(.2,.9,.3,1);box-shadow:0 10px 30px #000a}
.em-ad.on{transform:translate(-50%,0)}.em-ad small{display:block;font:700 10px "Barlow Condensed",Arial;letter-spacing:.24em;color:#9fb0c4}.em-ad b{display:block;font:italic 800 22px/1.05 "Barlow Condensed",Arial;letter-spacing:.03em}.em-ad span{font:500 13px "Barlow",Arial;color:#d5e0ec}
.em-ad .em-ad-lg{flex:none;width:58px;height:58px}
.em-bug{position:absolute;right:16px;top:64px;display:flex;align-items:center;gap:9px;background:#0a1018e6;border:1px solid #ffffff22;padding:5px 12px 5px 6px;color:#fff;transform:translateX(140%);transition:transform .5s cubic-bezier(.2,.9,.3,1)}.em-bug.on{transform:none}
.em-bug small{display:block;font:700 9px "Barlow Condensed";letter-spacing:.22em;color:#9fb0c4}.em-bug b{font:800 15px "Barlow Condensed";letter-spacing:.06em}
.em-lower{position:absolute;left:0;bottom:110px;display:flex;align-items:stretch;transform:translateX(-110%);transition:transform .55s cubic-bezier(.2,.9,.3,1)}.em-lower.on{transform:none}
.em-lower .lg{background:#fff;padding:6px}.em-lower .lg svg{display:block;width:52px;height:52px}.em-lower .tx{background:linear-gradient(90deg,var(--a),#0a1018 88%);color:#fff;padding:8px 44px 8px 16px;clip-path:polygon(0 0,100% 0,calc(100% - 26px) 100%,0 100%)}.em-lower .tx small{display:block;font:700 10px "Barlow Condensed";letter-spacing:.24em;opacity:.85}.em-lower .tx b{font:italic 800 22px "Barlow Condensed";letter-spacing:.03em}
.em-tr{position:absolute;inset:0;z-index:60;pointer-events:none;overflow:hidden}.em-tr i{position:absolute;top:-10%;bottom:-10%;width:52%;background:#070b12;transition:transform .5s cubic-bezier(.7,0,.2,1)}
.em-tr i.l{left:-4%;transform:translateX(-110%) skewX(-12deg);border-right:6px solid var(--a)}.em-tr i.r{right:-4%;transform:translateX(110%) skewX(-12deg);border-left:6px solid var(--a)}
.em-tr.on i{transform:skewX(-12deg)}.em-tr .em-trc{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#fff;opacity:0;transition:opacity .25s;font:italic 900 clamp(28px,6vw,64px) "Barlow Condensed",Arial;letter-spacing:.08em;text-transform:uppercase;text-shadow:0 0 30px var(--a)}.em-tr.on .em-trc{opacity:1}.em-tr img{height:clamp(40px,9vw,90px);filter:drop-shadow(0 0 12px #000)}
.em-fxc{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:50}
.em-cel{position:absolute;bottom:14%;left:50%;width:260px;height:260px;margin-left:-130px;pointer-events:none;z-index:55;background-repeat:no-repeat;image-rendering:auto;filter:drop-shadow(0 8px 12px #000a);animation:emcelin .4s both}
@keyframes emcelin{from{transform:scale(.4);opacity:0}}
.em-tab{position:fixed;left:0;top:44%;z-index:2147481900;background:#0a1018d8;color:#fff;border:1px solid #ffffff2a;border-left:0;padding:10px 6px;font:800 11px "Barlow Condensed",Arial;letter-spacing:.2em;writing-mode:vertical-rl;text-orientation:mixed;cursor:pointer;opacity:.5;transition:opacity .2s;pointer-events:auto}.em-tab:hover,.em-tab:focus-visible{opacity:1;background:var(--a);color:#000}
.em-modal{position:fixed;inset:0;z-index:2147483100;background:#000000b8;display:flex;align-items:center;justify-content:center;pointer-events:auto;font-family:"Barlow","DM Sans",Arial,sans-serif}
.em-panel{width:min(760px,calc(100vw - 24px));max-height:calc(100vh - 32px);overflow:auto;background:#0d141d;color:#fff;border:1px solid #ffffff26;border-top:4px solid var(--a);padding:18px 20px 20px;--a:${ACC}}
.em-panel h2{margin:0 0 2px;font:italic 900 28px "Barlow Condensed",Arial;letter-spacing:.05em;text-transform:uppercase}.em-panel .sub{color:#8fa2b8;font-size:12px;margin-bottom:12px}
.em-panel h3{font:800 12px "Barlow Condensed";letter-spacing:.22em;color:var(--a);margin:16px 0 8px;text-transform:uppercase}
.em-x{position:absolute;right:14px;top:10px;background:none;border:0;color:#fff;font-size:26px;cursor:pointer}
.em-sp{display:flex;align-items:center;gap:12px;background:#ffffff0a;border:1px solid #ffffff18;padding:9px 12px;margin-bottom:7px}.em-sp .lg{flex:none}.em-sp .in{flex:1;min-width:0}.em-sp b{display:block;font:italic 800 18px "Barlow Condensed";letter-spacing:.03em;text-transform:uppercase}.em-sp small{color:#9fb0c4;font-size:12px;line-height:1.35;display:block}
.em-sp button,.em-opts button{background:var(--a);color:#000;border:0;padding:8px 14px;font:800 12px "Barlow Condensed";letter-spacing:.14em;cursor:pointer;text-transform:uppercase}.em-sp button.alt{background:#ffffff1a;color:#fff}.em-sp button:disabled{opacity:.35;cursor:not-allowed}
.em-empty{border:1px dashed #ffffff30;color:#7c8ba0;padding:12px;font-size:12px;margin-bottom:7px}
.em-opts{display:flex;flex-wrap:wrap;gap:8px}.em-opts label{display:flex;gap:6px;align-items:center;font-size:12px;background:#ffffff0d;padding:6px 10px;cursor:pointer}
.em-toast{position:absolute;left:50%;top:72px;transform:translate(-50%,-140%);background:#0a1018f2;border:1px solid var(--a);color:#fff;padding:9px 16px;display:flex;gap:10px;align-items:center;transition:transform .45s cubic-bezier(.2,.9,.3,1);font:600 14px "Barlow",Arial}.em-toast.on{transform:translate(-50%,0)}

.em-cams{position:absolute;left:10px;bottom:38px;z-index:30;display:flex;gap:4px;align-items:center;background:#0a1018d8;border:1px solid #ffffff22;padding:4px 6px;font:700 10px "Barlow Condensed",Arial;letter-spacing:.16em;color:#9fb0c4;pointer-events:auto}
.em-cams button{background:#ffffff14;color:#fff;border:0;padding:5px 9px;font:700 11px "Barlow Condensed",Arial;letter-spacing:.1em;cursor:pointer;text-transform:uppercase}.em-cams button.on{background:${ACC};color:#000}.em-cams button:hover{background:#ffffff30}.em-cams button.on:hover{background:${ACC}}
.em-camhelp{position:absolute;left:50%;top:56px;transform:translateX(-50%);background:#000000cc;color:#fff;font:600 12px Arial;padding:7px 14px;border-left:3px solid ${ACC};opacity:0;transition:.3s;pointer-events:none;z-index:31;max-width:90%}.em-camhelp.on{opacity:1}
.em-cams{position:absolute;left:10px;bottom:38px;z-index:30;display:flex;gap:4px;align-items:center;background:#0a1018d8;border:1px solid #ffffff22;padding:4px 6px;font:700 10px "Barlow Condensed",Arial;letter-spacing:.16em;color:#9fb0c4;pointer-events:auto}
.em-cams button{background:#ffffff14;color:#fff;border:0;padding:5px 9px;font:700 11px "Barlow Condensed",Arial;letter-spacing:.1em;cursor:pointer;text-transform:uppercase}.em-cams button.on{background:${ACC};color:#000}.em-cams button:hover{background:#ffffff30}.em-cams button.on:hover{background:${ACC}}
.em-camhelp{position:absolute;left:50%;top:56px;transform:translateX(-50%);background:#000000cc;color:#fff;font:600 12px Arial;padding:7px 14px;border-left:3px solid ${ACC};opacity:0;transition:.3s;pointer-events:none;z-index:31;max-width:90%}.em-camhelp.on{opacity:1}
.em-tk{position:absolute;left:0;right:0;bottom:0;height:26px;display:flex;align-items:stretch;background:#0a1018f2;border-top:1px solid #ffffff22;transform:translateY(105%);transition:transform .45s cubic-bezier(.2,.9,.3,1);z-index:45;overflow:hidden}.em-tk.on{transform:none}
.em-tk .tag{flex:none;width:96px;background:var(--a);color:#000;font:900 12px/26px "Barlow Condensed",Arial;letter-spacing:.18em;text-align:center;clip-path:polygon(0 0,100% 0,calc(100% - 10px) 100%,0 100%);padding-right:8px}
.em-tk .tape{flex:1;overflow:hidden;position:relative}.em-tk .tape span{position:absolute;left:100%;top:0;white-space:nowrap;color:#fff;font:600 13px/26px "Barlow","DM Sans",Arial;letter-spacing:.02em}.em-tk .tape b{color:var(--a)}
@keyframes emtape{from{transform:translateX(0)}to{transform:translateX(calc(-100% - 100vw))}}
body.em-carreras .em-pop{left:auto;right:12px;top:auto;bottom:196px}
@media(max-width:700px){.em-pop{top:70px}.em-ad{bottom:56px}.em-tab{top:auto;bottom:90px}}
@media(prefers-reduced-motion:reduce){.em-pop,.em-ad,.em-bug,.em-lower,.em-tr i{transition:none}}`;
  document.head.appendChild(css);
  const host = document.createElement('div'); host.className = 'em-host';
  const mountHost = () => { const p = document.fullscreenElement || document.body; if (p && host.parentNode !== p) p.appendChild(host); };
  // Todo lo que es «de transmisión» (pop-ups, anuncios, transiciones, efectos de gol) vive DENTRO del visor del juego, así se ve en pantalla normal y en completa.
  const bhost = document.createElement('div'); bhost.className = 'em-bhost'; let MOUNT = null;
  function setMount(el) {
    if (!el || el === MOUNT) return; MOUNT = el;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.appendChild(bhost);
  }
  const B = () => (MOUNT ? bhost : host);
  if (MOD === 'carreras') document.documentElement.classList.add('em-carreras'), document.addEventListener('DOMContentLoaded', () => document.body.classList.add('em-carreras'));
  const boot = () => { mountHost(); if (MOD === 'carreras') setMount($('.broadcast')); };
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
  document.addEventListener('fullscreenchange', mountHost);

  // ------------------------------------------------------------------ SFX
  // Nombres reales que ya existen en assets/sfx/. Todo lo demás se busca como <nombre>.{ogg,mp3,wav,m4a} y, si no está, se sintetiza.
  // Los audios reales salen de assets/sfx/index.json (lo genera sfx/build-index.mjs). Si un nombre no está, se usa el placeholder sintetizado.
  const REAL = {};
  fetch(ROOT + 'sfx/index.json').then((r) => r.json()).then((j) => { (j.files || []).forEach((f) => { REAL[f.replace(/\.[^.]+$/, '')] = f.split('.').pop(); }); }).catch(() => {});
  const LOOPS = { crowd_basket: { trim: [3, 3], vol: .35 }, crowd_nfl: { vol: .35 } };
  const FAIL = new Set();
  const S = { ctx: null, master: null, nb: null };
  const enabled = () => opt.sfx && !(g.LFO_AUDIO && g.LFO_AUDIO.enabled === false);
  function AC() {
    if (!S.ctx) { const C = g.AudioContext || g.webkitAudioContext; if (!C) return null; S.ctx = new C(); S.master = S.ctx.createGain(); S.master.gain.value = opt.vol; S.master.connect(S.ctx.destination); }
    if (S.ctx.state === 'suspended') S.ctx.resume(); return S.ctx;
  }
  ['pointerdown', 'keydown'].forEach((e) => addEventListener(e, () => { try { AC(); } catch (x) {} }, { passive: true }));
  function noiseBuf() { const c = AC(); if (!S.nb) { S.nb = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const d = S.nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return S.nb; }
  function tone(f, dur, type, vol, o) {
    o = o || {}; const c = AC(), t = c.currentTime + (o.at || 0), os = c.createOscillator(), gn = c.createGain();
    os.type = type || 'sine'; os.frequency.setValueAtTime(f, t); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(vol, t + (o.a || .01)); gn.gain.exponentialRampToValueAtTime(.0001, t + dur);
    if (o.vib) { const lf = c.createOscillator(), lg = c.createGain(); lf.frequency.value = o.vib; lg.gain.value = f * .03; lf.connect(lg); lg.connect(os.frequency); lf.start(t); lf.stop(t + dur); }
    os.connect(gn); gn.connect(S.master); os.start(t); os.stop(t + dur + .05); return os;
  }
  function noise(dur, ftype, f, q, vol, o) {
    o = o || {}; const c = AC(), t = c.currentTime + (o.at || 0), s = c.createBufferSource(), fl = c.createBiquadFilter(), gn = c.createGain();
    s.buffer = noiseBuf(); s.loop = !!o.loop; fl.type = ftype; fl.frequency.setValueAtTime(f, t); if (o.to) fl.frequency.exponentialRampToValueAtTime(o.to, t + dur); fl.Q.value = q;
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(vol, t + (o.a || .02)); if (!o.loop) gn.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(fl); fl.connect(gn); gn.connect(S.master); s.start(t, Math.random()); if (!o.loop) s.stop(t + dur + .05);
    return { s, gn, stop() { try { gn.gain.setTargetAtTime(0, c.currentTime, .15); s.stop(c.currentTime + .6); } catch (e) {} } };
  }
  const SYN = {
    whistle: () => { tone(2650, .55, 'sine', .25, { vib: 28, a: .02 }); tone(2650, .35, 'sine', .25, { vib: 28, at: .7, a: .02 }); },
    crowd_cheer: () => { noise(2.6, 'bandpass', 900, .7, .5, { a: .5, to: 1500 }); noise(2.2, 'bandpass', 2600, 1.2, .18, { a: .7 }); },
    crowd_ooh: () => { noise(1.6, 'bandpass', 900, .8, .4, { a: .3, to: 380 }); },
    crowd_boo: () => { noise(2, 'lowpass', 420, 1, .55, { a: .4 }); tone(130, 2, 'sawtooth', .07, { vib: 5, a: .5 }); },
    applause: () => { for (let i = 0; i < 40; i++) noise(.08, 'highpass', 1800, .6, .18, { at: Math.random() * 2.4, a: .005 }); },
    chime: () => { [880, 1108, 1318].forEach((f, i) => tone(f, 1.1, 'sine', .22, { at: i * .16 })); },
    fanfare: () => { [[262, 0], [330, .22], [392, .44], [523, .66], [392, 1.0], [523, 1.22], [659, 1.5]].forEach(([f, at]) => { tone(f, .5, 'sawtooth', .12, { at, a: .03 }); tone(f * 2, .5, 'square', .04, { at, a: .03 }); }); },
    thunder: () => { noise(2.6, 'lowpass', 300, 1, .9, { a: .05, to: 60 }); },
    beep: () => tone(880, .12, 'sine', .2),
    radio_click: () => { noise(.06, 'highpass', 1500, 1, .35, { a: .003 }); noise(.05, 'highpass', 1500, 1, .35, { at: .35, a: .003 }); },
    pop_in: () => tone(520, .18, 'sine', .16, { to: 900 }),
    whoosh: () => noise(.6, 'bandpass', 400, 1, .28, { a: .2, to: 3200 }),
    punch: () => { noise(.14, 'lowpass', 500, 1, .8, { a: .003 }); tone(110, .18, 'sine', .5, { to: 45, a: .003 }); },
    kick: () => { noise(.18, 'lowpass', 380, 1, .9, { a: .003 }); tone(85, .25, 'sine', .55, { to: 40, a: .003 }); },
    bell: () => { [0, .55, 1.1].forEach((at) => [820, 1240, 1930].forEach((f, i) => tone(f, 1.4, 'sine', .16 / (i + 1), { at, a: .003 }))); },
    crowd_loop: (o) => noise(1, 'lowpass', 650, .4, .13, { loop: true, a: 1.2 }),
    cash: () => { tone(1568, .25, 'sine', .2); tone(2093, .4, 'sine', .2, { at: .09 }); },
    chip: () => { noise(.05, 'bandpass', 3000, 3, .5, { a: .002 }); },
    card_flip: () => { noise(.09, 'highpass', 2500, .5, .3, { a: .005 }); },
    slot_spin: () => { for (let i = 0; i < 14; i++) tone(500 + i * 30, .06, 'square', .05, { at: i * .05 }); },
    jackpot: () => { for (let i = 0; i < 12; i++) tone(523 * Math.pow(1.122, i % 8), .3, 'triangle', .16, { at: i * .09 }); },
    horn: () => { tone(220, .9, 'sawtooth', .16, { a: .03 }); tone(277, .9, 'sawtooth', .1, { a: .03 }); },
    swish: () => noise(.28, 'highpass', 4000, .5, .3, { a: .02 }),
    ball_bounce: () => { tone(140, .14, 'sine', .5, { to: 90, a: .003 }); }, ball_hit: () => { tone(200, .1, 'triangle', .5, { to: 110, a: .003 }); }, ball_hard_hit: () => { tone(160, .18, 'triangle', .6, { to: 70, a: .003 }); }, ball_catch: () => noise(.08, 'lowpass', 900, 1, .5, { a: .003 }), ball_net: () => noise(.35, 'bandpass', 3000, 1.5, .4, { a: .01 }),
    buzzer: () => tone(210, 1.1, 'square', .25, { a: .01 }),
    tackle: () => { noise(.22, 'lowpass', 700, 1, .9, { a: .003 }); tone(90, .2, 'sine', .4, { to: 50 }); },
    snap: () => noise(.06, 'bandpass', 1800, 2, .5, { a: .002 }),
    nfl_chime: () => SYN.chime(), nba_jingle: () => SYN.fanfare(), start_lights: () => tone(880, .2, 'sine', .25),
    shift_up: () => noise(.05, 'bandpass', 1400, 3, .3, { a: .002 }), backfire: () => { noise(.16, 'lowpass', 500, 1, .7, { a: .003 }); noise(.08, 'lowpass', 700, 1, .5, { at: .12, a: .003 }); },
    pit_gun: () => { for (let i = 0; i < 4; i++) noise(.09, 'bandpass', 2400, 4, .35, { at: i * .1, a: .003 }); },
    crowd_basket: () => SYN.crowd_loop(), crowd_nfl: () => SYN.crowd_loop()
  };
  function synth(name, o) {
    const c = AC(); if (!c || !SYN[name]) return { stop() {} };
    const r = SYN[name](o); const loop = name.indexOf('_loop') > 0 || (o && o.loop && r && r.stop);
    if (o && o.loop && !(r && r.stop)) { let alive = true; const again = () => { if (alive) { SYN[name](o); setTimeout(again, 2400); } }; setTimeout(again, 2400); return { stop() { alive = false; } }; }
    return (r && r.stop) ? r : { stop() {} };
  }
  function candidates(name) { return REAL[name] && !FAIL.has(name + '.' + REAL[name]) ? [REAL[name]] : []; }
  function playFile(name, exts, o) {
    const h = { stopped: false, a: null, stop() { this.stopped = true; try { const a = this.a; if (a) { let v = a.volume; const iv = setInterval(() => { v -= .08; if (v <= 0) { clearInterval(iv); a.pause(); } else a.volume = v; }, 60); } } catch (e) {} try { this.syn && this.syn.stop(); } catch (e) {} } };
    let i = 0;
    const next = () => {
      if (h.stopped) return;
      if (i >= exts.length) { h.syn = synth(name, o); return; }
      const ext = exts[i++], a = new Audio(ROOT + 'sfx/' + name + '.' + ext); let fell = false;
      const fail = () => { if (fell) return; fell = true; FAIL.add(name + '.' + ext); next(); };
      const lp = LOOPS[name] || {}; a.volume = Math.min(1, ((o && o.vol) || lp.vol || 1) * opt.vol); a.loop = !!(o && o.loop);
      if (a.loop && lp.trim) a.addEventListener('timeupdate', () => { if (a.duration && a.currentTime > a.duration - lp.trim[1]) a.currentTime = lp.trim[0]; });
      a.addEventListener('error', fail); h.a = a;
      const pr = a.play(); if (pr && pr.catch) pr.catch((err) => { if (!err || err.name === 'NotAllowedError' || err.name === 'AbortError') { fell = true; return; } fail(); });
    };
    next(); return h;
  }
  function play(name, o) {
    if (!enabled()) return { stop() {} };
    try { const ex = candidates(name); return ex.length ? playFile(name, ex, o || {}) : synth(name, o || {}); } catch (e) { return { stop() {} }; }
  }
  const sfxList = () => Object.keys(SYN).map((n) => ({ name: n, real: !!REAL[n], file: REAL[n] ? 'assets/sfx/' + n + '.' + REAL[n] : '(placeholder sintetizado → poné assets/sfx/' + n + '.ogg/.mp3/.wav)' }));

  // ------------------------------------------------------------------ logos ficticios de sponsors
  const CAT = [
    ['aurora', 'AURORA ENERGY', 'La energía que no para', 32, 'sun'], ['nova', 'NOVA BANK', 'Tu plata, en órbita', 215, 'ring'], ['turbo', 'TURBO COLA', 'Destapá la velocidad', 4, 'bolt'],
    ['pampa', 'PAMPA FOODS', 'Del campo a tu mesa', 95, 'leaf'], ['andes', 'ANDES TELECOM', 'Conectados hasta la cima', 200, 'peak'], ['kondor', 'KÓNDOR MOTORS', 'Nacidos para volar bajo', 355, 'wing'],
    ['lumen', 'LUMEN TECH', 'Ideas que encienden', 50, 'bulb'], ['rio', 'RÍO SPORT', 'Viví el juego', 175, 'wave'], ['fenix', 'FÉNIX AIRLINES', 'Siempre volvés', 18, 'flame'],
    ['titan', 'TITÁN GEAR', 'Equipo de campeones', 265, 'hex'], ['delta', 'DELTA PAY', 'Pagá sin frenar', 150, 'tri'], ['sol', 'SOL DE MAYO SEGUROS', 'Cubrimos tu jugada', 45, 'star'],
    ['surmotor', 'SUR MOTOR OIL', 'Lubricamos tu victoria', 20, 'bolt'], ['vertice', 'VÉRTICE', 'Llegá a lo más alto', 250, 'peak'], ['pampaholdings', 'PAMPA HOLDINGS', 'Inversiones con raíces', 120, 'leaf'],
    ['costabank', 'COSTA ATLÁNTICA BANK', 'Banca de mar a mar', 190, 'wave'], ['litoraltech', 'LITORAL TECH', 'Tecnología río abajo', 165, 'bulb'], ['aguilaneumaticos', 'ÁGUILA NEUMÁTICOS', 'Agarre de altura', 35, 'wing']
  ].map(([id, name, slogan, hue, sym]) => ({ id, name, slogan, hue, sym }));
  const BYID = Object.fromEntries(CAT.map((c) => [c.id, c]));
  const SYM = {
    sun: '<circle cx="24" cy="24" r="8" fill="#fff"/><g stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4"/></g>',
    ring: '<circle cx="24" cy="24" r="13" fill="none" stroke="#fff" stroke-width="5"/><circle cx="34" cy="14" r="4" fill="#fff"/>',
    bolt: '<path d="M27 5 13 27h9l-3 16 16-24h-10z" fill="#fff"/>',
    leaf: '<path d="M10 38C10 18 22 8 40 8c0 18-10 30-28 30z" fill="#fff"/><path d="M10 38 28 20" stroke="currentColor" stroke-width="2.5"/>',
    peak: '<path d="M4 38 18 14l8 12 6-8 12 20z" fill="#fff"/>',
    wing: '<path d="M6 32c10 0 18-4 24-16l4 4c-2 12-12 20-28 20z" fill="#fff"/><path d="M24 30c6-2 10-6 14-12" stroke="currentColor" stroke-width="2" fill="none"/>',
    bulb: '<circle cx="24" cy="20" r="11" fill="#fff"/><rect x="18" y="33" width="12" height="5" rx="2" fill="#fff"/><rect x="20" y="40" width="8" height="3" rx="1.5" fill="#fff"/>',
    wave: '<path d="M4 28c5-8 9-8 14 0s9 8 14 0 9-8 12 0v10H4z" fill="#fff"/>',
    flame: '<path d="M24 5c2 10 12 14 12 26a12 12 0 0 1-24 0c0-6 4-8 5-14 3 3 4 5 5 8 2-6 1-12 2-20z" fill="#fff"/>',
    hex: '<path d="M24 4 41 14v20L24 44 7 34V14z" fill="none" stroke="#fff" stroke-width="5"/><circle cx="24" cy="24" r="5" fill="#fff"/>',
    tri: '<path d="M24 6 42 40H6z" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><path d="M24 20l7 14H17z" fill="#fff"/>',
    star: '<path d="m24 4 6 13 14 2-10 10 3 14-13-7-13 7 3-14L4 19l14-2z" fill="#fff"/>'
  };
  function hashHue(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 360; }
  function sponsorLogo(id, name, size) {
    const c = BYID[id] || { hue: hashHue(id), sym: ['sun', 'ring', 'bolt', 'leaf', 'peak', 'wing', 'bulb', 'wave', 'hex', 'tri', 'star'][hashHue(id) % 11], name: name || id };
    const a = `hsl(${c.hue} 72% 46%)`, b = `hsl(${(c.hue + 40) % 360} 78% 30%)`, k = 'g' + id.replace(/\W/g, '');
    return `<svg class="em-logo" width="${size || 56}" height="${size || 56}" viewBox="0 0 48 48" role="img" aria-label="${esc(c.name || name || id)}" style="color:${b}"><defs><linearGradient id="${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect x="1" y="1" width="46" height="46" rx="11" fill="url(#${k})"/>${SYM[c.sym]}</svg>`;
  }
  const sponsorName = (id) => (BYID[id] ? BYID[id].name : id);

  // ------------------------------------------------------------------ pop-ups informativos: 8 tipos por deporte
  const TYPES = { dato: ['💡', 'Sabías que'], regla: ['📖', 'Reglamento'], consejo: ['🎯', 'Consejo del DT'], historia: ['🏛️', 'Historia'], record: ['🏆', 'Récord'], tabla: ['📊', 'En vivo'], liga: ['📰', 'Liga'], patrocinio: ['💼', 'Presentado por'] };
  const INFO = {
    basquet: {
      dato: ['Un partido dura 4 cuartos y cada posesión tiene 24 segundos para tirar al aro.', 'La línea de triple está a 6,75 m del aro en FIBA y a 7,24 m en la NBA.'],
      regla: ['Regla de los 3 segundos: un atacante no puede quedarse más de 3 segundos en la pintura.', 'Con 5 faltas personales el jugador queda eliminado (6 en la NBA).'],
      consejo: ['Contra una defensa en zona, mové la pelota rápido y buscá el triple.', 'Si el rival corre, cerrá bien el rebote defensivo y evitá los contragolpes.'],
      historia: ['El básquet lo inventó James Naismith en 1891, con canastas de duraznos.', 'Wilt Chamberlain anotó 100 puntos en un solo partido, en 1962.'],
      record: ['Récord de temporada: 73 victorias (Golden State, 2015-16).', 'Stephen Curry tiene el récord de triples en una temporada de la NBA.']
    },
    nfl: {
      dato: ['El campo mide 100 yardas más dos zonas de anotación de 10 yardas.', 'Un drive puede durar minutos: el reloj se detiene al salir de la cancha o en pase incompleto.'],
      regla: ['Tenés 4 intentos (downs) para avanzar 10 yardas; si no, pierdes la posesión.', 'Un touchdown vale 6 puntos; después se patea el punto extra (1) o se va por 2.'],
      consejo: ['En 3ª y corta, una carrera por el centro suele ser la jugada más segura.', 'Con poco tiempo, usá los tiempos muertos y jugadas hacia las bandas para frenar el reloj.'],
      historia: ['La primera final entre las dos ligas, el Super Bowl I, se jugó en 1967.', 'El pase hacia adelante se legalizó en 1906 y cambió el juego para siempre.'],
      record: ['Súper remontada: en el Super Bowl LI (2017) New England ganó tras ir 28-3 abajo.', 'Los récords de yardas por partido suelen caer en juegos de mucho pase.']
    },
    mma: {
      dato: ['Una pelea de MMA tiene 3 rounds de 5 minutos; las de título, 5 rounds.', 'El octágono mide unos 9,1 metros de diámetro.'],
      regla: ['Están prohibidos los cabezazos, los golpes a la nuca y los dedos en los ojos.', 'Se gana por KO, TKO, sumisión o decisión de los jueces.'],
      consejo: ['Si te llevan al suelo, cuidá el cuello y buscá volver a pararte contra la reja.', 'Gastar toda la energía en el primer round es una receta para perder en el tercero.'],
      historia: ['El primer UFC se hizo en 1993 con un torneo de eliminación en una sola noche.', 'El jiu-jitsu brasileño demostró en los primeros torneos lo importante que es el suelo.'],
      record: ['Georges St-Pierre defendió 9 veces el título de peso welter de la UFC.', 'Los KO más rápidos de la historia ocurrieron en menos de 10 segundos.']
    },
    carreras: {
      dato: ['Un GT3 pesa unos 1.250 kg y ronda los 500 CV.', 'Los discos de freno de un auto de carreras pueden superar los 700 °C.'],
      regla: ['Bandera amarilla: peligro en pista, prohibido adelantar.', 'Bandera azul: dejá pasar al líder que está por doblarte.'],
      consejo: ['Cuidá las gomas en las primeras vueltas: el desgaste castiga al final.', 'Con lluvia, frená antes y evitá pisar las líneas pintadas.'],
      historia: ['El primer Gran Premio de la historia se corrió en 1906 en Le Mans.', 'Las carreras de turismo carretera nacieron de pruebas de resistencia entre ciudades.'],
      record: ['Michael Schumacher ganó 91 carreras de F1; Lewis Hamilton llegó a 103.', 'Las paradas en boxes más rápidas de la F1 bajan de los 2 segundos.']
    },
    casino: {
      dato: ['La ruleta europea tiene un solo cero; la americana tiene dos.', 'Las tragamonedas modernas usan un generador de números aleatorios en cada tirada.'],
      regla: ['En blackjack el as vale 1 u 11 y las figuras valen 10.', 'En el póker, la mano se define por la mejor combinación de cinco cartas.'],
      consejo: ['Fijá un límite de pérdida antes de jugar y respetalo.', 'La casa siempre tiene ventaja a largo plazo: jugá por diversión.'],
      historia: ['El Ridotto de Venecia, de 1638, es considerado el primer casino público.', 'Las primeras tragamonedas mecánicas aparecieron a fines del siglo XIX.'],
      record: ['El mayor premio progresivo de una tragamonedas superó los 39 millones de dólares.', 'Una ruleta puede repetir el mismo número varias veces seguidas: el azar no tiene memoria.']
    }
  };
  const LIGA = { basquet: 'LBO · Seguí la clasificación y el calendario en la pestaña Liga.', nfl: 'LGO · Revisá el calendario y el draft desde el menú de franquicia.', mma: 'LLO · El ranking de tu división se actualiza después de cada combate.', carreras: 'LRO · Mirá el campeonato y el calendario en sus pestañas.', casino: 'Casino · Recordá: se juega con Plata del juego, no con dinero real.' };
  const EMx = { ctx: {}, matchActive: MOD === 'casino' };
  function tablaText() {
    const c = EMx.ctx || {};
    if (c.scores && c.names) return [`${c.names[0]} ${c.scores[0]} – ${c.scores[1]} ${c.names[1]}`, `Diferencia: ${Math.abs(c.scores[0] - c.scores[1])} ${MOD === 'basquet' ? 'puntos' : 'puntos'}.${c.period ? ' · Periodo ' + c.period : ''}`];
    if (c.order) return ['Podio provisional', c.order.slice(0, 3).map((n, i) => `${i + 1}º ${n}`).join(' · ')];
    if (MOD === 'casino' && g.Touchline) return ['Tu saldo', 'Mirá el contador de la esquina y jugá con cabeza.'];
    return ['Datos del partido', 'Todo lo importante está en el panel lateral.'];
  }
  const popHost = document.createElement('div'); popHost.className = 'em-pops';
  const popParent = () => { if (popHost.parentNode !== B()) B().appendChild(popHost); return popHost; };
  let popQ = [], popBusy = false;
  function busy() { return !!document.querySelector('.lfo-ad, .bc-studio.on, .bc-intro.on, .lx-podium'); }
  function popNext() {
    if (popBusy || !popQ.length) return;
    if (busy()) { setTimeout(popNext, 2500); return; }
    popBusy = true; const p = popQ.shift(), d = document.createElement('div'); d.className = 'em-pop';
    d.innerHTML = `<div class="em-bar"></div><div class="em-ic">${p.icon}</div><div class="em-tx"><div class="em-tag">${esc(p.tag)}</div><h4>${esc(p.title)}</h4><p>${esc(p.text)}</p></div><div class="em-prog" style="animation-duration:${p.ms}ms"></div>`;
    if (p.accent) d.style.setProperty('--a', p.accent);
    popParent().appendChild(d); requestAnimationFrame(() => d.classList.add('on')); play('pop_in');
    setTimeout(() => { d.classList.add('out'); setTimeout(() => { d.remove(); popBusy = false; popNext(); }, 500); }, p.ms);
  }
  function pop(kind, o) {
    if (!opt.pops) return; o = o || {}; const T = TYPES[kind] || TYPES.dato;
    let title = o.title, text = o.text;
    if (!text) {
      if (kind === 'tabla') [title, text] = tablaText();
      else if (kind === 'liga') { title = NAME; text = LIGA[MOD] || ''; }
      else if (kind === 'patrocinio') { const s = pickSponsor(); return banner(s); }
      else { const pool = (INFO[MOD] || {})[kind]; if (!pool) return; text = rnd(pool); title = title || T[1]; }
    }
    popQ.push({ kind, icon: o.icon || T[0], tag: o.tag || T[1], title: title || T[1], text, ms: o.ms || 7000, accent: o.accent }); popNext();
  }
  const KINDS = ['dato', 'regla', 'consejo', 'historia', 'record', 'tabla', 'liga', 'patrocinio'];
  let popIdx = Math.floor(Math.random() * 8);
  function popCycle() { pop(KINDS[popIdx++ % KINDS.length]); }
  setInterval(() => { if (EMx.matchActive && opt.pops && !document.hidden && MOD !== 'futbol') popCycle(); }, 80000);

  // ------------------------------------------------------------------ cintillo inferior (noticias, marcador y consejos que corren durante el partido)
  const tk = document.createElement('div'); tk.className = 'em-tk'; tk.innerHTML = '<b class="tag">● EN VIVO</b><div class="tape"><span></span></div>';
  let tkQ = [], tkBusy = false, tkOn = false;
  const tkPar = () => { if (tk.parentNode !== B()) B().appendChild(tk); return tk; };
  function tkRun() {
    if (tkBusy || !tkQ.length || !tkOn) return; tkBusy = true; const t = tkQ.shift(), p = tkPar(), sp = $('.tape span', p), tape = $('.tape', p);
    sp.innerHTML = t; sp.style.animation = 'none'; void sp.offsetWidth; const w = Math.max(300, tape.clientWidth), dur = Math.max(8, sp.textContent.length * .13 + w / 110);
    sp.style.animation = `emtape ${dur}s linear forwards`; sp.style.setProperty('--w', w + 'px'); setTimeout(() => { tkBusy = false; tkRun(); }, dur * 1000 * .82);
  }
  function tickerPush(t) { if (!opt.pops || MOD === 'futbol' || MOD === 'carreras') return; tkQ.push(t); if (tkQ.length > 3) tkQ.shift(); tkRun(); }
  function tickerShow(on) { tkOn = on && opt.pops && MOD !== 'futbol' && MOD !== 'carreras' && !!MOUNT; tkPar().classList.toggle('on', tkOn); if (!tkOn) { tkQ = []; } else tkAuto(); }
  function tkAuto() {
    if (!tkOn || tkQ.length) return; const c = EMx.ctx || {}, r = Math.random();
    if (r < .4 && c.scores && c.names) tickerPush(`<b>MARCADOR</b> · ${esc(c.names[0])} ${c.scores[0]} – ${c.scores[1]} ${esc(c.names[1])}`);
    else if (r < .75) { const pool = INFO[MOD]; if (pool) { const k = rnd(['dato', 'consejo', 'regla']); tickerPush(`<b>${TYPES[k][1].toUpperCase()}</b> · ${esc(rnd(pool[k]))}`); } }
    else { const s = pickSponsor(); tickerPush(`<b>PUBLICIDAD</b> · ${esc(s.name)} — ${esc(s.slogan)}`); }
  }
  setInterval(tkAuto, 22000);

  // ------------------------------------------------------------------ anuncios pop-up + video
  function activeSponsors() { try { return (sponsorsState().mods[MOD] || { active: [] }).active; } catch (e) { return []; } }
  function pickSponsor() { const a = activeSponsors(); if (a.length && Math.random() < .65) return BYID[rnd(a).id] || rnd(CAT); return rnd(CAT); }
  let bannerBusy = false;
  function banner(s, kind) {
    if (!opt.ads || bannerBusy || !s) return; if (busy()) return; bannerBusy = true; kind = kind || rnd(['banner', 'lower', 'bug']);
    const d = document.createElement('div');
    if (kind === 'banner') { d.className = 'em-ad'; d.innerHTML = `<div class="em-ad-lg">${sponsorLogo(s.id, s.name, 58)}</div><div><small>PUBLICIDAD · PRESENTADO POR</small><b>${esc(s.name)}</b><span>${esc(s.slogan)}</span></div>`; }
    else if (kind === 'lower') { d.className = 'em-lower'; d.innerHTML = `<div class="lg">${sponsorLogo(s.id, s.name, 52)}</div><div class="tx"><small>PRESENTADO POR</small><b>${esc(s.name)}</b></div>`; }
    else { d.className = 'em-bug'; d.innerHTML = `${sponsorLogo(s.id, s.name, 38)}<div><small>OFICIAL</small><b>${esc(s.name)}</b></div>`; }
    B().appendChild(d); requestAnimationFrame(() => d.classList.add('on')); play('whoosh', { vol: .4 });
    setTimeout(() => { d.classList.remove('on'); setTimeout(() => { d.remove(); bannerBusy = false; }, 700); }, kind === 'bug' ? 14000 : 8000);
  }
  setInterval(() => { if (EMx.matchActive && opt.ads && !document.hidden && MOD !== 'futbol') banner(pickSponsor()); }, 150000);
  function loadScript(u) { return new Promise((res) => { const s = document.createElement('script'); s.src = u; s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s); }); }
  async function videoBreak(cb, o) {
    o = o || {}; const done = () => { try { cb && cb(); } catch (e) {} };
    if (!opt.ads) return done();
    if (!g.LFO_ADS) await loadScript(ROOT + 'videocomerciales/manifest.js');
    if (!g.LFOAds) await loadScript(ROOT + 'broadcast/adbreak.js');
    if (!g.LFOAds || (g.LFOAds.enabled && !g.LFOAds.enabled())) return done();
    g.LFOAds.play({ mount: o.mount || MOUNT || document.body, channel: o.channel || NAME, onDone: done, maxSec: o.maxSec || 40 });
    const ad = document.querySelector('.lfo-ad'); if (ad && !o.mount && !MOUNT) ad.style.position = 'fixed';
  }
  if (MOD === 'casino') setInterval(() => { if (!document.hidden && !document.querySelector('.lfo-ad')) videoBreak(null, { maxSec: 30 }); }, 12 * 60 * 1000);

  // ------------------------------------------------------------------ transiciones (dentro de la transmisión, no de la página)
  let trEl = null;
  function transition(label, mid, o) {
    o = o || {}; if (!opt.trans || !MOUNT) { mid && mid(); return; }
    if (trEl) { mid && mid(); return; }
    trEl = document.createElement('div'); trEl.className = 'em-tr'; trEl.style.setProperty('--a', ACC);
    trEl.innerHTML = `<i class="l"></i><i class="r"></i><div class="em-trc">${LOGO ? `<img src="${ROOT}logos/${LOGO}.png" alt="" onerror="this.remove()">` : ''}<span>${esc(label || NAME)}</span></div>`;
    B().appendChild(trEl); void trEl.offsetWidth; trEl.classList.add('on'); play('whoosh', { vol: .5 });
    setTimeout(() => { try { mid && mid(); } catch (e) {} setTimeout(() => { const t = trEl; if (t) { t.classList.remove('on'); setTimeout(() => { t.remove(); if (trEl === t) trEl = null; }, 620); } }, o.hold || 420); }, 520);
  }

  // ------------------------------------------------------------------ toast
  function toast(html, ms) { const t = document.createElement('div'); t.className = 'em-toast'; t.innerHTML = html; B().appendChild(t); requestAnimationFrame(() => t.classList.add('on')); setTimeout(() => { t.classList.remove('on'); setTimeout(() => t.remove(), 600); }, ms || 6000); }

  // ------------------------------------------------------------------ sponsors
  const SP_KEY = 'em.sponsors.v1';
  const sponsorsState = () => { try { const s = JSON.parse(localStorage.getItem(SP_KEY) || '{}'); s.mods = s.mods || {}; return s; } catch (e) { return { mods: {} }; } };
  const saveSp = (s) => { try { localStorage.setItem(SP_KEY, JSON.stringify(s)); } catch (e) {} };
  const COND = {
    futbol: [['win', 'por victoria', (r) => r.won === true], ['goals3', 'por marcar 3 o más goles', (r) => r.points >= 3], ['clean', 'por valla invicta', (r) => r.opp === 0 && r.opp != null], ['margin2', 'por ganar por 2 o más', (r) => r.margin >= 2]],
    basquet: [['win', 'por victoria', (r) => r.won === true], ['margin15', 'por ganar por 15 o más', (r) => r.margin >= 15], ['pts100', 'por anotar 100 o más', (r) => r.points >= 100], ['defense', 'por dejar al rival bajo 80', (r) => r.opp != null && r.opp < 80]],
    nfl: [['win', 'por victoria', (r) => r.won === true], ['margin14', 'por ganar por 14 o más', (r) => r.margin >= 14], ['pts30', 'por anotar 30 o más', (r) => r.points >= 30], ['defense', 'por dejar al rival en 10 o menos', (r) => r.opp != null && r.opp <= 10]],
    mma: [['finish', 'si el combate termina antes del límite', (r) => !!r.finish], ['ko', 'por KO / TKO', (r) => !!r.ko], ['knockdown', 'si hay al menos un derribo', (r) => (r.knockdowns || 0) > 0]],
    casino: [['profit', 'si terminás la sesión en ganancia', (r) => r.profit > 0], ['profit10', 'si ganás un 10 % o más en la sesión', (r) => r.profitPct >= 10]],
    carreras: []
  };
  const UNIT = { futbol: 'partido', basquet: 'partido', nfl: 'partido', mma: 'combate', casino: 'sesión (10 min)', carreras: 'carrera' };
  const MONEY = { futbol: [20000, 60000], basquet: [15000, 50000], nfl: [20000, 70000], mma: [25000, 80000], casino: [10000, 30000], carreras: [30000, 90000] };
  function offersFor(mod) {
    const st = sponsorsState(), m = st.mods[mod] || { active: [], played: 0 }; let seed = (m.played >> 2) * 97 + mod.length * 131;
    const r = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const have = new Set(m.active.map((a) => a.id)), pool = CAT.slice(0, 12).filter((c) => !have.has(c.id)).sort(() => r() - .5).slice(0, 5), conds = COND[mod] || [];
    const [lo, hi] = MONEY[mod];
    return pool.map((c) => { const cd = conds.length ? conds[Math.floor(r() * conds.length)] : null; const base = Math.round((lo + (hi - lo) * r()) / 1000) * 1000, dur = 4 + Math.floor(r() * 7); return { id: c.id, name: c.name, slogan: c.slogan, base, dur, bonusKey: cd && cd[0], bonusLabel: cd && cd[1], bonus: cd ? Math.round((base * (1.2 + r() * 1.6)) / 1000) * 1000 : 0 }; });
  }
  function settle(res) {
    const st = sponsorsState(), m = st.mods[MOD] = st.mods[MOD] || { active: [], played: 0 }; m.played++;
    let base = 0, bonus = 0; const lines = [];
    m.active.forEach((a) => {
      base += a.base; const cd = (COND[MOD] || []).find((c) => c[0] === a.bonusKey);
      if (cd && cd[2](res)) { bonus += a.bonus; lines.push(`${a.name}: bonus ${cd[1]}`); }
      a.left--;
    });
    const ended = m.active.filter((a) => a.left <= 0).map((a) => a.name); m.active = m.active.filter((a) => a.left > 0); saveSp(st);
    const tot = base + bonus; if (!tot && !ended.length) return;
    if (tot && g.Touchline && g.Touchline.addSilver) g.Touchline.addSilver(tot);
    toast(`${m.active[0] ? sponsorLogo(m.active[0].id, '', 30) : '💼'}<div><b>Patrocinadores: +${money(tot)}</b><br><small>Base ${money(base)}${bonus ? ' · Bonus ' + money(bonus) : ''}${ended.length ? ' · Terminó el contrato de ' + esc(ended.join(', ')) : ''}</small></div>`, 8000);
    play('cash');
  }
  function sponsorPanel() {
    const modal = document.createElement('div'); modal.className = 'em-modal'; modal.style.setProperty('--a', ACC);
    const draw = () => {
      const st = sponsorsState(), m = st.mods[MOD] || { active: [], played: 0 }, offers = offersFor(MOD), full = m.active.length >= 3;
      modal.innerHTML = `<div class="em-panel" role="dialog" aria-label="Patrocinadores" style="position:relative"><button class="em-x" aria-label="Cerrar">×</button><h2>Patrocinadores</h2><div class="sub">${esc(NAME)} · hasta 3 contratos a la vez. Cobrás por cada ${UNIT[MOD]} y hay bonus si se cumple la condición. Terminar antes de tiempo cuesta una penalidad.</div>
      <h3>Contratos activos (${m.active.length}/3)</h3>${[0, 1, 2].map((i) => { const a = m.active[i]; return a ? `<div class="em-sp"><span class="lg">${sponsorLogo(a.id, a.name, 46)}</span><div class="in"><b>${esc(a.name)}</b><small>${money(a.base)} por ${UNIT[MOD]} · ${a.bonus ? '+' + money(a.bonus) + ' ' + esc(a.bonusLabel) : 'sin bonus'} · quedan ${a.left}</small></div><button class="alt" data-drop="${i}">Rescindir</button></div>` : `<div class="em-empty">Espacio libre — elegí una oferta.</div>`; }).join('')}
      <h3>Ofertas disponibles</h3>${offers.map((o, i) => `<div class="em-sp"><span class="lg">${sponsorLogo(o.id, o.name, 46)}</span><div class="in"><b>${esc(o.name)}</b><small>“${esc(o.slogan)}” · ${money(o.base)} por ${UNIT[MOD]} · ${o.dur} ${UNIT[MOD] === 'carrera' ? 'carreras' : UNIT[MOD] === 'combate' ? 'combates' : UNIT[MOD] === 'partido' ? 'partidos' : 'sesiones'}${o.bonus ? ' · +' + money(o.bonus) + ' ' + esc(o.bonusLabel) : ''}</small></div><button data-acc="${i}" ${full ? 'disabled' : ''}>Aceptar</button></div>`).join('')}
      <h3>Ajustes de transmisión</h3><div class="em-opts">${[['ads', 'Anuncios'], ['pops', 'Pop-ups informativos'], ['sfx', 'Sonidos extra'], ['trans', 'Transiciones']].map(([k, l]) => `<label><input type="checkbox" data-opt="${k}" ${opt[k] ? 'checked' : ''}> ${l}</label>`).join('')}</div></div>`;
      modal.querySelector('.em-x').onclick = () => modal.remove();
      modal.querySelectorAll('[data-acc]').forEach((b) => { b.onclick = () => { const o = offers[+b.dataset.acc], s2 = sponsorsState(), mm = s2.mods[MOD] = s2.mods[MOD] || { active: [], played: 0 }; if (mm.active.length >= 3) return; mm.active.push({ id: o.id, name: o.name, base: o.base, bonus: o.bonus, bonusKey: o.bonusKey, bonusLabel: o.bonusLabel, left: o.dur }); saveSp(s2); play('cash'); draw(); }; });
      modal.querySelectorAll('[data-drop]').forEach((b) => { b.onclick = () => { const s2 = sponsorsState(), mm = s2.mods[MOD], a = mm.active[+b.dataset.drop]; if (!a) return; const pen = a.base; if (!confirm(`Rescindir con ${a.name} cuesta ${money(pen)}. ¿Continuar?`)) return; const done = () => { mm.active.splice(+b.dataset.drop, 1); saveSp(s2); draw(); }; if (g.Touchline && g.Touchline.removeSilver) g.Touchline.removeSilver(pen).then((r) => { if (r && r.ok) done(); else alert('No te alcanza la Plata para pagar la penalidad.'); }); else done(); }; });
      modal.querySelectorAll('[data-opt]').forEach((c) => { c.onchange = () => { opt[c.dataset.opt] = c.checked; saveOpt(); }; });
    };
    draw(); modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); }); document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', k); } });
    host.appendChild(modal);
  }
  function addTab() {
    if (MOD === 'carreras') { const b = document.createElement('button'); b.className = 'em-tab'; b.textContent = 'AJUSTES DE TRANSMISIÓN'; b.style.pointerEvents = 'auto'; b.onclick = sponsorPanel; host.appendChild(b); return; }
    const b = document.createElement('button'); b.className = 'em-tab'; b.textContent = 'PATROCINIOS'; b.title = 'Contratos de patrocinio y ajustes de anuncios'; b.onclick = sponsorPanel; host.appendChild(b);
  }
  addTab();
  // sesiones de casino: cada 10 min de juego activo
  if (MOD === 'casino') { let b0 = null; g.Touchline && Touchline.getBalances().then((r) => { if (r && r.balances) b0 = r.balances.silver; }); setInterval(() => { if (document.hidden || !g.Touchline) return; Touchline.getBalances().then((r) => { if (!r || !r.balances) return; const now = r.balances.silver, prof = b0 == null ? 0 : now - b0; settle({ profit: prof, profitPct: b0 ? prof / b0 * 100 : 0 }); b0 = now; }); }, 10 * 60 * 1000); }

  // ------------------------------------------------------------------ celebraciones con los cosméticos del hub
  let COS = null; if (g.Touchline && Touchline.onCosmetics) { Touchline.onCosmetics((c) => { COS = c; }); Touchline.getCosmetics().then((r) => { if (r && r.cosmetics) COS = r.cosmetics; }); }
  const FXN = { g_explosion: 'explosion', g_fuegos: 'fuegos', g_rayo: 'rayo', g_confeti: 'confeti', g_agujero: 'agujero', g_hielo: 'hielo', g_oro: 'oro', g_tornado: 'tornado' };
  function fxCanvas() { const c = document.createElement('canvas'); c.className = 'em-fxc'; const r = (MOUNT || document.body).getBoundingClientRect(); c.width = Math.max(320, Math.round(r.width)); c.height = Math.max(240, Math.round(r.height)); B().appendChild(c); return c; }
  const FX = {
    confeti: (c, t) => { if (!c.p) c.p = Array.from({ length: 160 }, () => ({ x: Math.random() * c.w, y: -Math.random() * c.h * .5, vy: 2 + Math.random() * 4, vx: (Math.random() - .5) * 3, r: Math.random() * 6, s: 5 + Math.random() * 6, c: 'hsl(' + Math.random() * 360 + ' 90% 60%)' })); c.p.forEach((p) => { p.x += p.vx; p.y += p.vy; p.r += .1; c.x.save(); c.x.translate(p.x, p.y); c.x.rotate(p.r); c.x.fillStyle = p.c; c.x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.x.restore(); }); },
    oro: (c, t) => { if (!c.p) c.p = Array.from({ length: 130 }, () => ({ x: Math.random() * c.w, y: -Math.random() * c.h * .6, vy: 3 + Math.random() * 5, r: 4 + Math.random() * 6 })); c.p.forEach((p) => { p.y += p.vy; c.x.fillStyle = '#ffd24a'; c.x.beginPath(); c.x.ellipse(p.x, p.y, p.r, p.r * .5 + Math.abs(Math.sin(p.y / 20)) * p.r * .5, 0, 0, 7); c.x.fill(); c.x.strokeStyle = '#a5761a'; c.x.stroke(); }); },
    explosion: (c, t) => { const cx = c.w / 2, cy = c.h * .55, k = t / 1.6; if (k > 1) return; c.x.globalAlpha = 1 - k; const gr = c.x.createRadialGradient(cx, cy, 0, cx, cy, 60 + k * 420); gr.addColorStop(0, '#fff'); gr.addColorStop(.25, '#ffd24a'); gr.addColorStop(.6, '#ff5b1a'); gr.addColorStop(1, '#0000'); c.x.fillStyle = gr; c.x.fillRect(0, 0, c.w, c.h); c.x.globalAlpha = 1; },
    fuegos: (c, t) => { if (!c.b) c.b = []; if (Math.random() < .06 && t < 3) c.b.push({ x: c.w * (.15 + Math.random() * .7), y: c.h * (.15 + Math.random() * .4), t: 0, h: Math.random() * 360 }); c.b.forEach((b) => { b.t += .016; for (let i = 0; i < 36; i++) { const a = i / 36 * 6.283, r = b.t * 160; c.x.fillStyle = `hsla(${b.h},90%,60%,${Math.max(0, 1 - b.t / 1.5)})`; c.x.fillRect(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r + b.t * b.t * 60, 4, 4); } }); },
    rayo: (c, t) => { if (Math.random() < .12 && t < 2.5) { c.x.fillStyle = '#ffffff55'; c.x.fillRect(0, 0, c.w, c.h); let x = Math.random() * c.w, y = 0; c.x.strokeStyle = '#bfe0ff'; c.x.lineWidth = 4; c.x.beginPath(); c.x.moveTo(x, y); while (y < c.h) { x += (Math.random() - .5) * 80; y += 40 + Math.random() * 40; c.x.lineTo(x, y); } c.x.stroke(); } },
    hielo: (c, t) => { const k = Math.min(1, t / 1.2); c.x.fillStyle = `rgba(160,220,255,${.28 * k * (t > 2.4 ? Math.max(0, 1 - (t - 2.4) * 3) : 1)})`; c.x.fillRect(0, 0, c.w, c.h); if (!c.p) c.p = Array.from({ length: 60 }, () => ({ x: Math.random() * c.w, y: Math.random() * c.h, s: 8 + Math.random() * 26 })); c.p.forEach((p) => { c.x.strokeStyle = '#e8f6ff'; c.x.beginPath(); c.x.moveTo(p.x - p.s * k, p.y); c.x.lineTo(p.x + p.s * k, p.y); c.x.moveTo(p.x, p.y - p.s * k); c.x.lineTo(p.x, p.y + p.s * k); c.x.stroke(); }); },
    agujero: (c, t) => { const cx = c.w / 2, cy = c.h / 2, r = Math.sin(Math.min(1, t / 2.6) * Math.PI) * 170; for (let i = 0; i < 6; i++) { c.x.strokeStyle = `rgba(150,90,255,${.5 - i * .07})`; c.x.lineWidth = 5; c.x.beginPath(); c.x.ellipse(cx, cy, r * (1 + i * .25), r * (.5 + i * .13), t * 3 + i, 0, 7); c.x.stroke(); } c.x.fillStyle = '#000'; c.x.beginPath(); c.x.arc(cx, cy, r * .55, 0, 7); c.x.fill(); },
    tornado: (c, t) => { const cx = c.w / 2; for (let i = 0; i < 70; i++) { const k = i / 70, y = c.h * .85 - k * c.h * .6, r = 20 + k * 130, a = t * 7 + k * 14; c.x.fillStyle = `hsla(${20 + k * 30},100%,${50 + k * 15}%,${.8 - k * .5})`; c.x.beginPath(); c.x.arc(cx + Math.cos(a) * r, y, 8 + k * 14, 0, 7); c.x.fill(); } }
  };
  function runFx(name, ms) {
    const fx = FX[name] || FX.confeti, c = fxCanvas(); const o = { x: c.getContext('2d'), w: c.width, h: c.height }; const t0 = performance.now();
    (function loop() { const t = (performance.now() - t0) / 1000; if (t * 1000 > ms) { c.remove(); return; } o.x.clearRect(0, 0, o.w, o.h); try { fx(o, t); } catch (e) {} requestAnimationFrame(loop); })();
  }
  function runCel(variant, ms) {
    const d = document.createElement('div'); d.className = 'em-cel'; d.style.backgroundImage = `url(${ROOT}celebrations/${variant}.png)`; d.style.backgroundSize = '600% 400%';
    B().appendChild(d); const t0 = performance.now();
    (function loop() { const t = performance.now() - t0; if (t > ms) { d.remove(); return; } const f = Math.floor(t / 1000 * 14) % 24; d.style.backgroundPosition = `${(f % 6) * 20}% ${Math.floor(f / 6) * 33.333}%`; requestAnimationFrame(loop); })();
  }
  let celAudio = null;
  function celebrate(o) {
    o = o || {}; const slot = o.slot || 0; let played = false;
    try {
      const c = COS; if (c) {
        const gid = (c.equipGfx || [])[slot] || (c.equipGfx || [])[0], cid = (c.equipCel || [])[slot] || (c.equipCel || [])[0], mid = (c.equipMusic || [])[slot] || (c.equipMusic || [])[0];
        if (gid) { const it = (c.catalogGfx || []).find((x) => x.id === gid); runFx(it ? it.fx : FXN[gid], 3600); played = true; }
        if (cid) { const it = (c.catalogCel || []).find((x) => x.id === cid); if (it) { runCel(it.variant, 3400); played = true; } }
        if (mid) { const it = (c.catalogMusic || []).find((x) => x.id === mid); if (it && enabled()) { try { celAudio && celAudio.pause(); } catch (e) {} celAudio = new Audio(REPO + '01-futbol/celebrationost/' + encodeURIComponent(it.file)); celAudio.volume = Math.min(1, .7 * opt.vol); celAudio.play().catch(() => {}); const a = celAudio; setTimeout(() => { let v = a.volume; const iv = setInterval(() => { v -= .06; if (v <= 0) { clearInterval(iv); a.pause(); } else a.volume = v; }, 80); }, 9000); played = true; } }
      }
    } catch (e) {}
    if (!played) { runFx('confeti', 2600); }
    play(MOD === 'nfl' ? 'nfl_chime' : 'crowd_cheer');
  }

  // ------------------------------------------------------------------ enganche a Broadcast (basquet · nfl · mma · carreras)
  const M = { last: null, finalDone: false, amb: null };
  function ambientStart() { if (!opt.ambient || M.amb) return; const n = MOD === 'basquet' ? 'crowd_basket' : MOD === 'nfl' ? 'crowd_nfl' : MOD === 'mma' ? 'crowd_loop' : null; if (n) M.amb = play(n, { loop: true, vol: .3 }); }
  function ambientStop() { if (M.amb) { M.amb.stop(); M.amb = null; } }
  function matchOn(on) { if (EMx.matchActive === on) return; EMx.matchActive = on; tickerShow(on); if (on) { ambientStart(); if (MOD !== 'futbol') { setTimeout(() => banner(pickSponsor(), 'lower'), 9000); setTimeout(() => pop('dato'), 22000); } } else ambientStop(); }
  const onTick = safe((sport, b) => {
    if (!b || !b.scores) return;
    EMx.ctx = { scores: b.scores, names: b.names, period: b.period };
    matchOn(b.phase === 'live');
    if (b.phase === 'live' && M.period != null && b.period !== M.period) transition((sport === 'basquet' ? 'CUARTO ' : 'PERIODO ') + b.period, null, { hold: 200 });
    M.period = b.phase === 'live' ? b.period : null;
    const user = b.user, prev = M.last;
    if (prev) for (const side of [0, 1]) {
      const d = b.scores[side] - prev[side]; if (d <= 0) continue;
      const mine = user == null || user < 0 ? side === 0 : side === user;
      tickerPush(`<b>${sport === 'nfl' ? (d >= 6 ? 'TOUCHDOWN' : 'ANOTACIÓN') : d >= 3 ? 'TRIPLE' : 'CANASTA'}</b> · ${esc((b.names || [])[side] || '')} suma ${d} · ${b.scores[0]}–${b.scores[1]}`);
      if (sport === 'basquet') { play('ball_net'); if (d >= 3 && mine) celebrate({ slot: b.scores[side] - b.scores[1 - side] >= 25 ? 2 : 0 }); else if (d >= 3) play('crowd_ooh'); else play('crowd_cheer', { vol: .6 }); }
      else if (sport === 'nfl') { if (d >= 6 && mine) celebrate({ slot: b.scores[side] - b.scores[1 - side] >= 21 ? 2 : 0 }); else if (d >= 6) play('crowd_ooh'); else play('crowd_cheer', { vol: .6 }); }
    }
    M.last = b.scores.slice();
    if (b.phase === 'final' && !M.finalDone) {
      M.finalDone = true; play(sport === 'basquet' ? 'buzzer' : 'whistle'); ambientStop();
      const u = user == null || user < 0 ? 0 : user, my = b.scores[u], op = b.scores[1 - u];
      settle({ won: my > op ? true : my < op ? false : null, margin: my - op, points: my, opp: op });
    } else if (b.phase !== 'final') M.finalDone = false;
  });
  const onEvent = safe((sport, type, d) => {
    if (sport === 'mma') {
      if (type === 'round') { play('bell'); matchOn(true); M.kd = M.kd || 0; transition(d.plate || 'ROUND', null, { hold: 200 }); }
      else if (type === 'knockdown') { tickerPush(`<b>DERRIBO</b> · ${esc(d.sub || 'Un peleador toca la lona')}`); M.kd = (M.kd || 0) + 1; play('punch'); play('crowd_ooh'); pop('tabla', { title: 'Derribo', text: d.sub || 'Un peleador toca la lona.', ms: 5000 }); }
      else if (type === 'final') {
        play('bell'); const meth = String(d.sub || '').toUpperCase(); const ko = /KO|TKO/.test(meth), fin = ko || /SUM|SUB|SÚM/.test(meth) || !/DECIS|PUNTOS|UNAN|DIVID|MAYOR/.test(meth);
        settle({ finish: fin, ko, knockdowns: M.kd || 0 }); M.kd = 0; matchOn(false); play('crowd_cheer');
      }
    } else if (sport === 'nfl') {
      if (type === 'touchdown') play('horn'); else if (type === 'sack') { play('tackle'); pop('tabla', { title: 'Sack', text: 'La defensa llega al quarterback.', ms: 4500 }); }
      else if (type === 'interception') { play('crowd_ooh'); pop('tabla', { title: 'Intercepción', text: 'Cambio de posesión.', ms: 4500 }); }
      else if (type === 'bigplay') play('crowd_ooh');
    } else if (sport === 'basquet') {
      if (type === 'run') tickerPush(`<b>RACHA</b> · ${esc((d.plate || '') + ' ' + (d.sub || ''))}`);
      if (type === 'run') pop('tabla', { title: 'Racha', text: d.plate ? d.plate + ' · ' + (d.sub || '') : 'Una racha cambia el partido.', ms: 5000 });
      else if (type === 'lead') play('crowd_cheer', { vol: .5 });
    }
  });
  function hook(api, o) {
    if (!api || api.__em) return api; api.__em = true; if (o && o.mount) setMount(o.mount);
    const ev = api.event, tk = api.tick, st = api.studio;
    if (ev) api.event = function (type, d) { onEvent(o.sport, type, d || {}); return ev.apply(this, arguments); };
    if (tk) api.tick = function (b) { onTick(o.sport, b); return tk.apply(this, arguments); };
    if (st) api.studio = function (c) { try { if (c && c.kind === 'pre' && (o.sport === 'mma' || o.sport === 'carreras') && !c._em) { const d0 = c.onDone; c = Object.assign({}, c, { _em: 1, onDone: function () { videoBreak(d0); } }); } } catch (e) {} return st.call(this, c); };
    return api;
  }
  function wrapB(B) { if (!B || B.__em || typeof B.attach !== 'function') return B; const at = B.attach; B.attach = function (o) { return hook(at.apply(B, arguments), o || {}); }; B.__em = true; return B; }
  (function trap() {
    let cur = g.Broadcast; if (cur) { wrapB(cur); return; }
    try { Object.defineProperty(g, 'Broadcast', { configurable: true, get() { return cur; }, set(v) { cur = wrapB(v); } }); } catch (e) {}
  })();
  // carreras: pantallas + señal de carrera activa
  if (MOD === 'carreras') setInterval(() => { try { const s = g.Autodromo && g.Autodromo.state; if (s) matchOn(s.phase === 'race' || s.phase === 'countdown'); } catch (e) {} }, 800);
  // resultado de partido desde módulos sin Broadcast (fútbol)
  function matchEnd(r) { if (!r) return; settle(r); }
  function matchStart() { matchOn(true); }


  // ------------------------------------------------------------------ cámaras extra (orbital · dron libre · TV dinámica) para los controladores de cámara de LBO / LGO / LLO
  const EXT = { orbit: 'ORBITAL', drone: 'DRON LIBRE', tv: 'TV DINÁMICA' };
  function wrapCam(ctrl, cfg) {
    if (!ctrl || ctrl.__em) return; ctrl.__em = true;
    const T = cfg.THREE, cam = ctrl.camera, orig = ctrl.update.bind(ctrl), V = T.Vector3, baseFov = cam.fov;
    const st = { a: 0, lastMode: null, orig: ctrl.mode, tv: { t: 0, shot: -1 }, d: { p: new V(), yaw: 0, pitch: -.5, speed: cfg.speed || 14, keys: {} }, f: new V(), aim: new V(), fovT: baseFov };
    const hl = cfg.half[0], hw = cfg.half[1], cl = (cfg.center || [0, 0])[0], cw = (cfg.center || [0, 0])[1];
    const mk = (l, w, y) => (cfg.axis === 'x' ? new V(l + cl, y, w + cw) : new V(w + cw, y, l + cl));
    const lenOf = (v) => (cfg.axis === 'x' ? v.x - cl : v.z - cl);
    const bar = document.createElement('div'); bar.className = 'em-cams';
    bar.innerHTML = '<span>CÁMARA</span><button data-m="__o">Original</button>' + Object.keys(EXT).map((k) => `<button data-m="${k}">${EXT[k]}</button>`).join('');
    const mount = cfg.mount || cfg.dom.parentElement; if (mount) { if (getComputedStyle(mount).position === 'static') mount.style.position = 'relative'; mount.appendChild(bar); }
    const paint = () => bar.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.m === (EXT[ctrl.mode] ? ctrl.mode : '__o')));
    const helpEl = document.createElement('div'); helpEl.className = 'em-camhelp'; if (mount) mount.appendChild(helpEl); let ht = 0;
    function help(t) { helpEl.textContent = t; helpEl.classList.add('on'); clearTimeout(ht); ht = setTimeout(() => helpEl.classList.remove('on'), 6000); }
    bar.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; e.stopPropagation(); ctrl.mode = b.dataset.m === '__o' ? (st.orig && !EXT[st.orig] ? st.orig : cfg.defaultMode || 'broadcast') : b.dataset.m; paint(); if (ctrl.mode === 'drone') help('DRON · WASD mover · Q/E bajar-subir · arrastrá para mirar · rueda: velocidad · Shift: turbo'); });
    addEventListener('keydown', (e) => { if (ctrl.mode === 'drone' && /^(KeyW|KeyA|KeyS|KeyD|KeyQ|KeyE|ShiftLeft|ShiftRight)$/.test(e.code) && !/INPUT|SELECT|TEXTAREA/.test((document.activeElement || {}).tagName)) { st.d.keys[e.code] = true; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
    addEventListener('keyup', (e) => { delete st.d.keys[e.code]; });
    let drag = null; const dom = cfg.dom;
    dom.addEventListener('pointerdown', (e) => { if (ctrl.mode === 'drone') { drag = { x: e.clientX, y: e.clientY }; try { dom.setPointerCapture(e.pointerId); } catch (x) {} } });
    dom.addEventListener('pointermove', (e) => { if (!drag) return; st.d.yaw -= (e.clientX - drag.x) * .005; st.d.pitch = Math.max(-1.5, Math.min(1.3, st.d.pitch - (e.clientY - drag.y) * .004)); drag = { x: e.clientX, y: e.clientY }; });
    dom.addEventListener('pointerup', () => { drag = null; });
    dom.addEventListener('wheel', (e) => { if (ctrl.mode === 'drone') { e.preventDefault(); st.d.speed = Math.max(3, Math.min(120, st.d.speed * (e.deltaY < 0 ? 1.15 : .87))); } }, { passive: false });
    ctrl.update = function () {
      const args = arguments, m = ctrl.mode;
      if (!EXT[m]) { st.orig = m; st.lastMode = m; if (Math.abs(cam.fov - baseFov) > .01) { cam.fov += (baseFov - cam.fov) * .1; cam.updateProjectionMatrix(); } return orig.apply(ctrl, args); }
      const dt = Math.min(.1, args[1] || .016), fb = cfg.focus(args) || { x: cl, y: 1, z: cw }, tgt = new V(fb.x, fb.y || 1, fb.z);
      st.f.lerp(tgt, 1 - Math.exp(-dt * 4));
      if (st.lastMode !== m) { st.lastMode = m; paint(); if (m === 'drone') { st.d.p.copy(cam.position); const dir = new V(); cam.getWorldDirection(dir); st.d.yaw = Math.atan2(dir.x, dir.z); st.d.pitch = Math.asin(Math.max(-1, Math.min(1, dir.y))); } if (m === 'tv') st.tv.shot = -1; }
      let pos, aim = st.f.clone(), fov = baseFov, snap = false;
      if (m === 'orbit') { st.a += dt * .3; const r = cfg.r || 24; pos = st.f.clone().add(new V(Math.cos(st.a) * r, cfg.hOrb || 9, Math.sin(st.a) * r)); }
      else if (m === 'drone') {
        const k = st.d.keys, sp = st.d.speed * (k.ShiftLeft || k.ShiftRight ? 3 : 1) * dt, fw = new V(Math.sin(st.d.yaw) * Math.cos(st.d.pitch), Math.sin(st.d.pitch), Math.cos(st.d.yaw) * Math.cos(st.d.pitch)), rt = new V().crossVectors(fw, new V(0, 1, 0)).normalize().negate();
        if (k.KeyW) st.d.p.addScaledVector(fw, sp); if (k.KeyS) st.d.p.addScaledVector(fw, -sp); if (k.KeyD) st.d.p.addScaledVector(rt, sp); if (k.KeyA) st.d.p.addScaledVector(rt, -sp); if (k.KeyE) st.d.p.y += sp; if (k.KeyQ) st.d.p.y -= sp; st.d.p.y = Math.max(.6, st.d.p.y);
        pos = st.d.p.clone(); aim = pos.clone().add(fw); snap = true; fov = baseFov * 1.1;
      } else {
        st.tv.t -= dt; if (st.tv.t <= 0 || st.tv.shot < 0) { st.tv.shot = (st.tv.shot + 1 + Math.floor(Math.random() * 2)) % 6; st.tv.t = 4.5 + Math.random() * 3.5; st.tv.cut = true; }
        const s = st.tv.shot, l = lenOf(st.f), sgn = l >= 0 ? 1 : -1, hLow = cfg.hLow || 2, hHigh = cfg.hHigh || 24, pad = cfg.pad || 6;
        if (s === 0) { pos = mk(sgn * (hl + pad), 0, hLow * 2.2); fov = baseFov * .7; }
        else if (s === 1) { pos = mk(l * .9, -(hw + pad), hLow * 1.4); fov = baseFov * .6; }
        else if (s === 2) { pos = mk(l, hw * .05, hHigh * 1.5); fov = baseFov * .9; }
        else if (s === 3) { pos = mk(l - sgn * 7, hw * .55, hLow * 2); fov = baseFov * .85; }
        else if (s === 4) { pos = mk(-sgn * (hl + pad), hw * .3, hLow * 3); fov = baseFov * .65; }
        else { pos = mk(l + 4, hw + pad * .5, hHigh * .55); fov = baseFov * .75; }
        snap = st.tv.cut && s !== 3; st.tv.cut = false;
      }
      if (snap) { cam.position.copy(pos); st.aim.copy(aim); } else { const kk = 1 - Math.exp(-dt * 3); cam.position.lerp(pos, kk); st.aim.lerp(aim, Math.min(1, kk * 1.5)); }
      st.fovT += (fov - st.fovT) * .1; cam.fov = st.fovT; cam.updateProjectionMatrix(); cam.lookAt(st.aim);
    };
    paint();
  }

  // Sponsor de camiseta/auto para un lado (0 = el usuario: usa sus contratos aceptados; el resto, un anunciante ficticio fijo por equipo).
  function kitSponsor(side, seed) {
    const act = (sponsorsState().mods[MOD] || { active: [] }).active;
    if (side === 0 && act.length) { const a = act[0], c = BYID[a.id]; return { id: a.id, name: (c && c.name) || a.name, hue: c ? c.hue : hashHue(a.id) }; }
    const c = CAT[((side + 1) * 5 + (seed || 0)) % 12]; return { id: c.id, name: c.name, hue: c.hue };
  }
  function allSponsors(side) { const act = (sponsorsState().mods[MOD] || { active: [] }).active; return side === 0 ? act.map((a) => ({ id: a.id, name: (BYID[a.id] && BYID[a.id].name) || a.name, hue: BYID[a.id] ? BYID[a.id].hue : hashHue(a.id) })) : []; }
  g.EM = { module: MOD, kitSponsor, allSponsors, setMount, opt, sfx: { play, list: sfxList, enabled, get master() { return S.master; } }, pop, popKinds: KINDS, ads: { banner, videoBreak, pickSponsor }, transition, sponsors: { panel: sponsorPanel, catalog: CAT, settle }, sponsorLogo, sponsorName, celebrate, toast, cams: { wrap: wrapCam }, match: { on: matchOn, end: matchEnd, start: matchStart }, ctx: EMx, loaded: true };
})(window);
