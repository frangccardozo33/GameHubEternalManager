/* Eternal Manager · Tandas publicitarias de la transmisión.
 *
 *   LFOAds.play({ mount, onDone, maxSec = 60, skipAfter = 5, label = 'PUBLICIDAD', channel = 'LFO · TRANSMISIÓN OFICIAL' })
 *
 * Emite una tanda de como máximo `maxSec` segundos: UN comercial largo o DOS cortos, elegidos entre los videos de
 * assets/videocomerciales/ (lista y duraciones en manifest.js → window.LFO_ADS). Se muestra a pantalla completa dentro de `mount`
 * con cortina de "PUBLICIDAD", cuenta atrás de "volvemos en…" y botón SALTAR a los `skipAfter` segundos.
 * El sonido sigue el mute del juego (`muted: true|false`, o window.LFO_AUDIO.enabled). Si no hay videos o el navegador los bloquea,
 * llama a onDone sin mostrar nada. Colores: variables --pk-a / --pk-a2 / --pk-bg1 / --pk-bg2 (cambian con el paquete La Cupidité).
 */
(function (g) {
  'use strict';
  const BASE = (() => { try { return new URL('../videocomerciales/', document.currentScript.src).href; } catch (e) { return ''; } })();
  const RECENT = 'lfo.ads.recent';
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.ceil(s % 60))).padStart(2, '0')}`;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CSS = `
.lfo-ad{position:absolute;inset:0;z-index:95;background:#000;color:#fff;font-family:"Barlow Condensed","DM Sans",Arial,sans-serif;display:flex;align-items:center;justify-content:center;overflow:hidden;animation:lfoad-in .5s ease both;pointer-events:auto}
.lfo-ad.out{animation:lfoad-out .4s ease forwards}
.lfo-ad video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000;opacity:0;transition:opacity .35s}
.lfo-ad video.on{opacity:1}
.lfo-ad .ad-tag{position:absolute;left:18px;top:16px;display:flex;align-items:center;gap:10px;z-index:3;text-shadow:0 2px 6px #000}
.lfo-ad .ad-tag b{background:var(--pk-a,#daa520);color:var(--pk-dark,#08101a);padding:4px 12px;letter-spacing:.24em;font-size:14px;font-weight:800;animation:lfoad-blink 2.4s infinite}
.lfo-ad .ad-tag span{letter-spacing:.2em;font-size:12px;font-weight:700;opacity:.85}
.lfo-ad .ad-bar{position:absolute;left:0;right:0;bottom:0;z-index:3;display:flex;align-items:center;gap:14px;padding:18px 18px 12px;background:linear-gradient(0deg,#000d,#0000);font-size:14px;letter-spacing:.14em;font-weight:700}
.lfo-ad .ad-bar .ad-back{color:var(--pk-a2,#f4d27a)}
.lfo-ad .ad-bar .ad-n{margin-left:auto;opacity:.75}
.lfo-ad .ad-prog{position:absolute;left:0;bottom:0;height:4px;width:100%;background:#ffffff26;z-index:4}
.lfo-ad .ad-prog i{display:block;height:100%;width:0;background:var(--pk-a,#daa520);transition:width .3s linear}
.lfo-ad .ad-skip{position:absolute;right:18px;bottom:52px;z-index:5;font:800 14px "Barlow Condensed",Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#fff;background:#000a;border:1px solid #fff8;padding:9px 18px;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .3s}
.lfo-ad .ad-skip.on{opacity:1;pointer-events:auto}.lfo-ad .ad-skip:hover{background:var(--pk-a,#daa520);color:var(--pk-dark,#08101a)}
.lfo-ad .ad-bump{position:absolute;inset:0;z-index:6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,var(--pk-bg1,#0a4a86),var(--pk-bg2,#012347));animation:lfoad-bump 1.5s ease both;pointer-events:none}
.lfo-ad .ad-bump small{letter-spacing:.4em;font-size:13px;font-weight:700;color:var(--pk-a2,#f4d27a)}
.lfo-ad .ad-bump b{font:italic 900 clamp(40px,8vw,96px)/1 "Barlow Condensed",sans-serif;letter-spacing:.06em;text-shadow:0 0 30px var(--pk-a,#daa520)}
.lfo-ad .ad-bump i{width:120px;height:4px;background:var(--pk-a,#daa520);animation:lfoad-line 1.5s ease both}
@keyframes lfoad-in{from{opacity:0}to{opacity:1}}@keyframes lfoad-out{to{opacity:0}}
@keyframes lfoad-blink{0%,88%,100%{opacity:1}94%{opacity:.35}}
@keyframes lfoad-bump{0%{opacity:0;transform:scale(1.08)}15%{opacity:1;transform:none}80%{opacity:1}100%{opacity:0}}
@keyframes lfoad-line{0%{width:0}40%{width:220px}100%{width:220px}}
@media(prefers-reduced-motion:reduce){.lfo-ad,.lfo-ad .ad-bump,.lfo-ad .ad-tag b{animation:none}}`;
  let css = false;
  const list = () => (Array.isArray(g.LFO_ADS) ? g.LFO_ADS.filter((a) => a && a.f && a.d > 3 && a.d <= 60) : []);
  const url = (a) => BASE + encodeURIComponent(a.f);
  function recent() { try { return JSON.parse(localStorage.getItem(RECENT) || '[]'); } catch (e) { return []; } }
  function remember(a) { try { const r = recent().filter((x) => x !== a.f); r.unshift(a.f); localStorage.setItem(RECENT, JSON.stringify(r.slice(0, 12))); } catch (e) { /* sin memoria */ } }
  // Elige la tanda: 1 largo, o 2 cortos que sumen ≤ maxSec. Evita repetir los últimos emitidos.
  function choose(maxSec) {
    const all = list().filter((a) => a.d <= maxSec), rec = recent(), fresh = all.filter((a) => !rec.includes(a.f)), pool = fresh.length >= 3 ? fresh : all;
    if (!pool.length) return [];
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const first = pick(pool);
    if (first.d <= maxSec / 2 && Math.random() < 0.7) {
      const rest = pool.filter((a) => a !== first && first.d + a.d <= maxSec);
      if (rest.length) return [first, pick(rest)];
    }
    return [first];
  }
  function play(o) {
    o = o || {};
    const mount = o.mount || document.body, maxSec = o.maxSec || 60, skipAfter = o.skipAfter == null ? 5 : o.skipAfter;
    if (g.__lfoAdActive) return { end() {}, ads: [] }; // una sola tanda a la vez
    let finished = false;
    const done = () => { if (finished) return; finished = true; g.__lfoAdActive = false; try { o.onDone && o.onDone(); } catch (e) { console.error(e); } };
    const ads = o.disabled ? [] : choose(maxSec);
    if (!ads.length) { done(); return null; }
    if (!css) { css = true; const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); }
    g.__lfoAdActive = true;
    const total = ads.reduce((s, a) => s + a.d, 0);
    const el = document.createElement('div'); el.className = 'lfo-ad';
    el.innerHTML = `<video playsinline preload="auto"></video><div class="ad-tag"><b>${esc(o.label || 'PUBLICIDAD')}</b><span>${esc(o.channel || 'LFO · TRANSMISIÓN OFICIAL')}</span></div>
      <div class="ad-bar"><span class="ad-back">VOLVEMOS EN <span class="ad-left">${fmt(total)}</span></span><span class="ad-n"></span></div><div class="ad-prog"><i></i></div><button class="ad-skip" type="button">SALTAR ▶▶</button>
      <div class="ad-bump"><small>${esc(o.channel || 'LFO')}</small><b>${esc(o.label || 'PUBLICIDAD')}</b><i></i></div>`;
    if (getComputedStyle(mount).position === 'static') mount.style.position = 'relative';
    mount.appendChild(el);
    const v = el.querySelector('video'), left = el.querySelector('.ad-left'), prog = el.querySelector('.ad-prog i'), nn = el.querySelector('.ad-n'), skip = el.querySelector('.ad-skip');
    let idx = 0, doneSec = 0, ended = false, tick = null, skipT = null, guard = null;
    const muted = () => o.muted === true; // los comerciales siempre suenan; el resto del audio del juego se pausa mientras dura la tanda
    const A = g.LFO_AUDIO; let resumed = false;
    try { if (A && A.ctx && A.ctx.state === 'running') { A.ctx.suspend(); resumed = true; } A && A._killAll && A._killAll(); } catch (e) { /* sin audio del juego */ }
    const end = () => {
      if (ended) return; ended = true; clearInterval(tick); clearTimeout(skipT); clearTimeout(guard);
      try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) { /* ya cerrado */ }
      try { if (resumed && A.ctx) A.ctx.resume(); } catch (e) { /* nada */ }
      el.classList.add('out'); setTimeout(() => { el.remove(); done(); }, 420);
    };
    const next = (failed) => { if (ended) return; doneSec += failed ? 0 : ads[idx].d; idx++; if (idx >= ads.length) end(); else load(); };
    function load() {
      const a = ads[idx]; v.classList.remove('on'); v.muted = muted(); v.src = url(a); nn.textContent = ads.length > 1 ? `ANUNCIO ${idx + 1} DE ${ads.length}` : '';
      remember(a);
      const go = () => v.play().catch(() => { v.muted = true; v.play().catch(() => next(true)); el.addEventListener('click', () => { v.muted = false; }, { once: true }); });
      v.oncanplay = () => { v.oncanplay = null; setTimeout(() => { if (ended) return; v.classList.add('on'); go(); }, idx === 0 ? 1100 : 250); };
    }
    v.onended = () => next(false);
    v.onerror = () => next(true);
    tick = setInterval(() => {
      const passed = Math.min(total, doneSec + (v.currentTime || 0));
      left.textContent = fmt(total - passed); prog.style.width = (100 * passed / total).toFixed(1) + '%';
    }, 250);
    skipT = setTimeout(() => skip.classList.add('on'), skipAfter * 1000);
    skip.onclick = end;
    // salvavidas: si ningún video arranca en ~9 s, se sigue con el partido
    guard = setTimeout(() => { if (!v.currentTime && !ended) end(); }, 9500);
    load();
    return { end, ads };
  }
  const enabled = () => { try { return localStorage.getItem('lfo.ads') !== 'off'; } catch (e) { return true; } };
  g.LFOAds = { play, choose, list, enabled };
})(window);
