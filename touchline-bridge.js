/*
 * Eternal Manager shared-economy bridge.
 * Include this from any module loaded inside hub.html's iframes:
 *   <script src="../touchline-bridge.js"></script>
 *
 * It talks to the hub via postMessage using the protocol hub.html documents
 * (type:'TOUCHLINE_ECONOMY' / 'TOUCHLINE_ECONOMY_RESULT' / 'TOUCHLINE_BALANCES'),
 * exposes window.Touchline for game code to call, and mounts a small read-only
 * balance badge in the corner so the shared currency is visible everywhere.
 *
 * window.Touchline.getBalances()      -> Promise<{ok,balances:{silver,rubies}}>
 * window.Touchline.addSilver(n)       -> Promise<{ok,balances}>
 * window.Touchline.removeSilver(n)    -> Promise<{ok,balances}>  (fails if balance would go negative)
 * window.Touchline.addRubies(n)       -> Promise<{ok,balances}>
 * window.Touchline.removeRubies(n)    -> Promise<{ok,balances}>
 * window.Touchline.onBalances(fn)     -> fn(balances) is called whenever the hub balance changes
 *
 * window.Touchline.getCosmetics()             -> Promise<{ok, cosmetics}>
 *   cosmetics = {shopKey, resetAt, shopMusic:[id], shopCel:[id], ownedMusic:[id], ownedCel:[id],
 *                equipMusic:[id|null,id|null,id|null], equipCel:[id|null,id|null,id|null],
 *                catalogMusic:[{id,file,title,price}], catalogCel:[{id,title,variant,price}]}
 *   equip slots are indexed [0]=situación normal, [1]=últimos 5 minutos, [2]=a partir del 4º gol.
 * window.Touchline.buyCosmetic(type,id,cur)    -> Promise<{ok, cosmetics}>  type: 'music'|'cel', cur: 'silver'|'rubies'
 * window.Touchline.equipCosmetic(type,slot,id) -> Promise<{ok, cosmetics}>  id may be null to unequip
 * window.Touchline.onCosmetics(fn)             -> fn(cosmetics) whenever the shop/owned/equipped state changes
 *
 * window.Touchline.chat.setRoom(id,label) / sendText(t) / sendSticker(id) / open()  -> chat del hub (sala del partido/carrera).
 *
 * This only does the plumbing (connection + read-only HUD). Hooking specific
 * in-game actions (transfer fees, bet payouts, entry costs, etc.) to
 * addSilver/removeSilver is a per-module decision left for later.
 */
(function () {
  'use strict';
  if (window.top === window) return; // only makes sense inside the hub's iframes

  const listeners = [];
  const cosmeticsListeners = [];
  const pending = new Map();

  function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function request(action, extra) {
    return new Promise((resolve) => {
      const requestId = uid();
      pending.set(requestId, resolve);
      try {
        window.parent.postMessage(Object.assign({ type: 'TOUCHLINE_ECONOMY', requestId, action }, extra || {}), '*');
      } catch (e) {
        pending.delete(requestId);
        resolve({ ok: false, balances: null, cosmetics: null });
        return;
      }
      setTimeout(() => {
        if (pending.has(requestId)) {
          pending.delete(requestId);
          resolve({ ok: false, balances: null, cosmetics: null });
        }
      }, 4000);
    });
  }

  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === 'TOUCHLINE_ECONOMY_RESULT' && pending.has(d.requestId)) {
      pending.get(d.requestId)({ ok: d.ok, balances: d.balances, cosmetics: d.cosmetics });
      pending.delete(d.requestId);
      if (d.balances) updateHUD(d.balances);
      if (d.cosmetics) cosmeticsListeners.forEach((fn) => { try { fn(d.cosmetics); } catch (e) {} });
    } else if (d.type === 'TOUCHLINE_BALANCES') {
      listeners.forEach((fn) => {
        try { fn(d.balances); } catch (e) {}
      });
      updateHUD(d.balances);
      if (d.cosmetics) cosmeticsListeners.forEach((fn) => { try { fn(d.cosmetics); } catch (e) {} });
    }
  });

  const api = {
    getBalances: () => request('getBalances'),
    addSilver: (n) => request('addSilver', { amount: n }),
    removeSilver: (n) => request('removeSilver', { amount: n }),
    addRubies: (n) => request('addRubies', { amount: n }),
    removeRubies: (n) => request('removeRubies', { amount: n }),
    onBalances: (fn) => listeners.push(fn),
    getCosmetics: () => request('getCosmetics'),
    buyCosmetic: (ctype, cid, cur) => request('buyCosmetic', { ctype, cid, cur }),
    equipCosmetic: (ctype, slot, cid) => request('equipCosmetic', { ctype, slot, cid }),
    onCosmetics: (fn) => cosmeticsListeners.push(fn),
    // Chat del hub: el cajón flotante ya está sobre el juego; el módulo sólo le dice en qué sala está.
    chat: {
      setRoom: (id, label) => post({ type: 'TOUCHLINE_CHAT', action: 'setRoom', id: String(id), label: label || String(id) }), // p. ej. setRoom('futbol:partido-123', 'Partido · ARG vs IBU')
      sendText: (text) => post({ type: 'TOUCHLINE_CHAT', action: 'sendText', text }),
      sendSticker: (id) => post({ type: 'TOUCHLINE_CHAT', action: 'sendSticker', sticker: id }),  // respeta el enfriamiento de 10 s
      open: () => post({ type: 'TOUCHLINE_CHAT', action: 'open' })
    }
  };
  function post(m) { try { window.parent.postMessage(m, '*'); } catch (e) {} }
  window.Touchline = api;

  let badgeSilver = null, badgeRuby = null;

  function mountHUD() {
    if (!document.body || document.getElementById('touchline-hud')) return;
    const el = document.createElement('div');
    el.id = 'touchline-hud';
    el.style.cssText =
      'position:fixed;top:10px;right:10px;z-index:2147483647;display:flex;gap:8px;' +
      'font:600 12px/1.4 "Segoe UI",Tahoma,Arial,sans-serif;pointer-events:none;' +
      'text-shadow:0 1px 2px #000;';
    el.innerHTML =
      '<span style="background:linear-gradient(#1b2c3d,#0d1620);border:1px solid #4d7ea0cc;' +
      'border-radius:6px;padding:6px 10px;color:#eaf6ff;box-shadow:0 3px 8px #0007">' +
      '$<span id="tl-silver">…</span></span>' +
      '<span style="background:linear-gradient(#3a1d2a,#22111a);border:1px solid #b25a7acc;' +
      'border-radius:6px;padding:6px 10px;color:#ffd4e2;box-shadow:0 3px 8px #0007">' +
      '♦<span id="tl-ruby">…</span></span>';
    document.body.appendChild(el);
    badgeSilver = el.querySelector('#tl-silver');
    badgeRuby = el.querySelector('#tl-ruby');
  }

  function updateHUD(balances) {
    if (!balances) return;
    if (!badgeSilver) mountHUD();
    if (badgeSilver) badgeSilver.textContent = Number(balances.silver || 0).toLocaleString('en-US');
    if (badgeRuby) badgeRuby.textContent = balances.rubies;
  }

  function init() {
    mountHUD();
    api.getBalances().then((r) => { if (r.ok) updateHUD(r.balances); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/*
 * Chat del partido DENTRO del juego (estilo stream). El hub manda los mensajes y el estado por postMessage
 * (type "TOUCHLINE_CHAT_UI"); esto los dibuja en el propio documento del juego, así sigue visible en pantalla completa
 * (se re-monta dentro del elemento a pantalla completa). Desde acá se escribe y se mandan stickers sin salir del juego.
 */
(function () {
  'use strict';
  if (window.top === window) return;
  var st = { on: false, hidden: false, muted: false, label: '', room: false, cdUntil: 0, sound: true, vol: 0.8 }, stickers = [], root, feed, input, pick, grid, cdEl, stage, sv, hint, barSpan, muteBtn, showBtn, stickBtn, stageT = 0;
  var TTL = 14000, MAXN = 7;
  function post(a, x) { try { window.parent.postMessage(Object.assign({ type: 'TOUCHLINE_CHAT', action: a }, x || {}), '*'); } catch (e) {} }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var CSS = '#tlc-root,#tlc-root *,#tlc-stage,#tlc-stage *{box-sizing:border-box;font-family:"Segoe UI",Tahoma,Arial,sans-serif}' +
    '#tlc-root{position:fixed;left:14px;bottom:14px;z-index:2147483000;width:min(340px,calc(100vw - 28px));display:flex;flex-direction:column;gap:6px;pointer-events:none;font-size:13px;color:#fff}' +
    '#tlc-root[hidden],#tlc-stage[hidden]{display:none}' +
    '.tlc-bar{align-self:flex-start;display:flex;align-items:center;gap:4px;background:#0a121acc;border:1px solid #ffffff22;border-radius:7px;padding:3px 4px 3px 9px;font-size:10px;color:#cfe3f3;pointer-events:auto;opacity:.6;max-width:100%}' +
    '#tlc-root:hover .tlc-bar,#tlc-root:focus-within .tlc-bar{opacity:1}.tlc-bar span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-right:4px}' +
    '.tlc-bar button{background:#ffffff18;border:0;color:#fff;border-radius:5px;width:24px;height:22px;font-size:11px;cursor:pointer}.tlc-bar button.on{background:#f4487244}' +
    '.tlc-feed{display:flex;flex-direction:column;gap:3px;max-height:40vh;overflow:hidden;justify-content:flex-end}' +
    '.tlc-msg{align-self:flex-start;max-width:100%;background:#000000a6;border-radius:6px;padding:4px 9px;line-height:1.3;text-shadow:0 1px 2px #000;word-break:break-word;transition:opacity .6s;animation:tlcin .25s ease-out}.tlc-msg.out{opacity:0}' +
    '.tlc-msg b{color:hsl(var(--h) 80% 68%);margin-right:6px}.tlc-msg i{color:#ffd98a}@keyframes tlcin{from{transform:translateX(-10px);opacity:0}}' +
    '.tlc-form{display:flex;gap:4px;pointer-events:auto;opacity:.6;position:relative}#tlc-root:hover .tlc-form,.tlc-form:focus-within{opacity:1}' +
    '.tlc-form input{flex:1;min-width:0;background:#000000b3;border:1px solid #ffffff2a;border-radius:7px;color:#fff;padding:7px 10px;font-size:12px;outline:0}.tlc-form input:focus{border-color:#63d4ff}' +
    '.tlc-form button{background:#000000b3;border:1px solid #ffffff2a;border-radius:7px;width:36px;font-size:15px;color:#fff;cursor:pointer;position:relative}.tlc-form button.cd{opacity:.55}' +
    '#tlc-root.hid .tlc-form,#tlc-root.hid .tlc-feed,#tlc-root.hid .tlc-bar{display:none}#tlc-root.mut .tlc-form input{opacity:.6}' +
    '.tlc-show{pointer-events:auto;align-self:flex-start;width:40px;height:40px;border-radius:50%;background:#0a121acc;border:1px solid #ffffff33;font-size:17px;opacity:.7;cursor:pointer;color:#fff}.tlc-show[hidden]{display:none}' +
    '.tlc-pick{position:absolute;left:0;right:0;bottom:44px;max-height:min(340px,55vh);display:flex;opacity:1;flex-direction:column;background:#101e2c;border:1px solid #7296b388;border-radius:10px;box-shadow:0 12px 40px #000d;pointer-events:auto}.tlc-pick[hidden]{display:none}' +
    '.tlc-pick-h{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 10px;font-size:10px;color:#9be36b;border-bottom:1px solid #ffffff17}.tlc-pick-h.cool{color:#edcb79}' +
    '.tlc-grid{overflow:auto;padding:8px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:min-content;align-content:start;gap:7px}' +
    '#tlc-root .tlc-tile{background:#0a121a!important;border:1px solid #ffffff1a!important;border-radius:8px!important;padding:0!important;margin:0!important;overflow:hidden;text-align:left;color:#cfe3f3!important;cursor:pointer;display:block!important;width:auto!important;height:auto!important;min-height:0!important;flex:none!important;position:static!important}.tlc-tile:hover{border-color:#63d4ff}' +
    '#tlc-root .tlc-tile video{display:block!important;width:100%!important;height:64px!important;max-height:64px!important;object-fit:cover;background:#000;pointer-events:none;position:static!important;margin:0!important}#tlc-root .tlc-tile small{display:block!important;padding:3px 6px;font-size:10px;line-height:1.25;height:2.6em;overflow:hidden;color:#cfe3f3}' +
    '.tlc-pick.cool .tlc-tile{opacity:.5}' +
    '#tlc-stage{position:fixed;right:16px;bottom:16px;z-index:2147483001;width:min(340px,calc(100vw - 32px));background:#0a121a;border:1px solid #63d4ff88;border-radius:11px;box-shadow:0 14px 50px #000d;overflow:hidden}' +
    '#tlc-stage .tlc-sh{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;font-size:11px;background:#122334;color:#fff}#tlc-stage .tlc-sh b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '#tlc-stage .tlc-sh button{background:#ffffff18;border:0;color:#fff;border-radius:5px;width:24px;height:24px;font-size:15px;cursor:pointer}#tlc-stage video{display:block;width:100%;max-height:50vh;background:#000}' +
    '.tlc-hint{position:absolute;inset:32px 0 0;display:grid;place-items:center;background:#000a;color:#fff;font-size:12px;cursor:pointer}.tlc-hint[hidden]{display:none}';
  function build() {
    if (root) return;
    var style = h('style', null, CSS); document.head.appendChild(style);
    root = h('div'); root.id = 'tlc-root'; root.hidden = true;
    var bar = h('div', 'tlc-bar'); barSpan = h('span', null, '💬 Chat del partido');
    muteBtn = h('button', null, '🔔'); muteBtn.title = 'Silenciar el chat del partido (sin mensajes ni sonido de stickers)'; var hideBtn = h('button', null, '✕'); hideBtn.title = 'Ocultar el chat';
    bar.append(barSpan, muteBtn, hideBtn);
    feed = h('div', 'tlc-feed');
    var form = h('form', 'tlc-form'); input = h('input'); input.type = 'text'; input.maxLength = 300; input.placeholder = 'Escribir en el chat del partido…'; stickBtn = h('button', null, '☺'); stickBtn.type = 'button'; stickBtn.title = 'Stickers (uno cada 10 s)';
    pick = h('div', 'tlc-pick'); pick.hidden = true; cdEl = h('div', 'tlc-pick-h'); grid = h('div', 'tlc-grid'); pick.append(cdEl, grid);
    form.append(input, stickBtn);
    showBtn = h('button', 'tlc-show', '💬'); showBtn.type = 'button'; showBtn.hidden = true; showBtn.title = 'Mostrar el chat del partido';
    root.append(bar, feed, pick, form, showBtn); document.body.appendChild(root);
    stage = h('div'); stage.id = 'tlc-stage'; stage.hidden = true;
    stage.innerHTML = '<div class="tlc-sh"><b></b><button type="button" aria-label="Cerrar">×</button></div><video playsinline></video><div class="tlc-hint" hidden>Tocá para activar el sonido</div>';
    document.body.appendChild(stage); sv = stage.querySelector('video'); hint = stage.querySelector('.tlc-hint');
    stage.querySelector('button').onclick = stopStage; sv.onended = stopStage;
    hint.onclick = function () { sv.muted = false; sv.play().catch(function () {}); hint.hidden = true; };
    muteBtn.onclick = function () { post('mute'); }; hideBtn.onclick = function () { post('hide'); }; showBtn.onclick = function () { post('show'); };
    form.addEventListener('submit', function (e) { e.preventDefault(); var t = input.value.trim(); if (t && st.room) { post('sendText', { text: t }); input.value = ''; } input.blur(); });
    ['keydown', 'keyup', 'keypress'].forEach(function (k) { input.addEventListener(k, function (e) { e.stopPropagation(); if (k === 'keydown' && e.key === 'Escape') { input.blur(); pick.hidden = true; } }); });
    stickBtn.onclick = function () { pick.hidden = !pick.hidden; if (!pick.hidden) fillPick(); };
    grid.addEventListener('click', function (e) { var t = e.target.closest('[data-id]'); if (!t) return; if (Date.now() < st.cdUntil) return; post('sendSticker', { sticker: t.dataset.id }); pick.hidden = true; });
    document.addEventListener('fullscreenchange', remount);
    setInterval(tickCd, 250);
  }
  function remount() { var host = document.fullscreenElement && document.fullscreenElement.nodeName !== 'VIDEO' && document.fullscreenElement.nodeName !== 'CANVAS' ? document.fullscreenElement : document.body; if (root && root.parentNode !== host) { host.appendChild(root); host.appendChild(stage); } }
  function fillPick() {
    if (grid.dataset.n === String(stickers.length) && grid.children.length) return;
    grid.dataset.n = String(stickers.length);
    grid.innerHTML = stickers.map(function (s) { return '<button type="button" class="tlc-tile" data-id="' + esc(s.id) + '" title="' + esc(s.label) + '"><video preload="metadata" muted playsinline src="' + esc(s.url) + '#t=0.4"></video><small>' + esc(s.label) + '</small></button>'; }).join('');
  }
  function tickCd() {
    if (!root || root.hidden) return; var left = Math.max(0, st.cdUntil - Date.now());
    pick.classList.toggle('cool', left > 0); cdEl.classList.toggle('cool', left > 0); stickBtn.classList.toggle('cd', left > 0);
    cdEl.textContent = left ? 'Podés enviar otro sticker en ' + Math.ceil(left / 1000) + ' s' : 'Listo para enviar un sticker';
  }
  function render() {
    build(); root.hidden = !st.on || !st.room; root.classList.toggle('hid', st.hidden); root.classList.toggle('mut', st.muted);
    showBtn.hidden = !(st.on && st.room && st.hidden); muteBtn.textContent = st.muted ? '🔕' : '🔔'; muteBtn.classList.toggle('on', st.muted);
    barSpan.textContent = '💬 ' + (st.label || 'Chat del partido') + (st.muted ? ' · silenciado' : '');
    if (st.muted || st.hidden) feed.innerHTML = '';
    if (!st.on) { stopStage(); pick.hidden = true; }
    tickCd(); remount();
  }
  function addMsg(m) {
    build(); if (!st.on || st.hidden || st.muted) return;
    var d = h('div', 'tlc-msg'); d.style.setProperty('--h', m.hue || 200);
    d.innerHTML = '<b>' + esc(m.name) + '</b>' + (m.sticker ? '<i>envió ☺ ' + esc(m.sticker) + '</i>' : '<span>' + esc(m.text) + '</span>');
    feed.appendChild(d); while (feed.children.length > MAXN) feed.firstChild.remove();
    setTimeout(function () { d.classList.add('out'); }, TTL); setTimeout(function () { d.remove(); }, TTL + 700);
  }
  function playSticker(m) {
    build(); if (st.sound === false) return; stage.hidden = false; stage.querySelector('b').textContent = m.who + ' · ' + m.label;
    clearTimeout(stageT); sv.pause(); sv.src = m.url; sv.volume = st.vol; sv.muted = false; sv.currentTime = 0; hint.hidden = true;
    var p = sv.play(); if (p && p.catch) p.catch(function () { sv.muted = true; sv.play().catch(function () {}); hint.hidden = false; document.addEventListener('pointerdown', function () { sv.muted = false; hint.hidden = true; }, { once: true }); });
    stageT = setTimeout(stopStage, 15000); remount();
  }
  function stopStage() { if (!stage || stage.hidden) return; clearTimeout(stageT); sv.pause(); sv.removeAttribute('src'); sv.load(); stage.hidden = true; post('stickerDone'); }
  window.addEventListener('message', function (e) {
    var d = e.data; if (!d || d.type !== 'TOUCHLINE_CHAT_UI' || e.source !== window.parent) return;
    if (d.kind === 'stickers') { stickers = d.list || []; if (grid) grid.dataset.n = ''; }
    else if (d.kind === 'state') { Object.assign(st, { on: !!d.on, hidden: !!d.hidden, muted: !!d.muted, label: d.label || '', room: !!d.room, cdUntil: d.cdUntil || 0, sound: d.sound !== false, vol: d.vol == null ? 0.8 : d.vol }); render(); }
    else if (d.kind === 'msg') addMsg(d);
    else if (d.kind === 'sticker') playSticker(d);
  });
  function hello() { post('hello'); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hello); else hello();
})();
