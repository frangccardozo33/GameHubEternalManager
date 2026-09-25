/*
 * Eternal Manager · Chat
 * Núcleo + interfaz. Se monta en el hub (página "Chat" y cajón flotante para partidos, carreras, etc.).
 *
 *   EMChat.init({ profile: () => ({ name, avatar }), onStickerPlay: (playing) => {} })
 *   EMChat.mount(el, { compact })      // dibuja la interfaz completa en `el`
 *   EMChat.setRoom(id, label)          // sala de contexto (módulo, partido, carrera…); null = sin sala
 *   EMChat.sendText(channel, text) / EMChat.sendSticker(channel, stickerId)
 *   EMChat.onChange(fn)                // fn() cuando cambia algo (mensajes, no leídos, presencia)
 *
 * TRANSPORTE. No hay servidor: por defecto los mensajes viajan entre pestañas del mismo navegador (BroadcastChannel),
 * o sea que abrir el hub en dos pestañas ya da dos "jugadores" reales. Para conectarlo a un servidor propio:
 *   EMChat.useWebSocket("wss://tu-servidor/chat")     // o localStorage["em.chat.ws"] = "wss://…"
 * El servidor sólo tiene que reenviar a todos los clientes (o por sala) los paquetes JSON que llegan, tal cual.
 * Paquetes: {t:"msg", id, ch:"global"|"room"|"dm", room?, to?, from:{id,name,avatar}, kind:"text"|"sticker", text?, sticker?, ts}
 *           {t:"presence", from:{id,name,avatar}, room, ts}
 *
 * STICKERS: catálogo en chat/stickers.js (archivos de /reactions, video con audio). Enfriamiento de 10 s por usuario:
 * se aplica al enviar y también al recibir (se ignora un sticker de alguien que mandó otro hace menos de ~9 s).
 */
(function () {
  "use strict";
  const STICKER_CD = 10000, STICKER_CD_RX = 9000, MAX_TEXT = 300, MAX_HIST = 200, PRESENCE_MS = 4000, PEER_TTL = 12000, STAGE_MAX_MS = 15000;
  const KEY = "em.chat.v1", KEY_CD = "em.chat.cd", KEY_UID = "em.chat.uid", KEY_WS = "em.chat.ws";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const stickers = () => window.EM_STICKERS || [];
  const stickerById = (id) => stickers().find((s) => s.id === id);
  const stickerUrl = (s) => "reactions/" + encodeURIComponent(s.file).replace(/%2F/g, "/");

  // Jugadores de demostración (sin servidor no hay más gente): responden a los DMs para poder ver la interfaz completa.
  const BOTS = [
    { id: "bot:lucho", name: "Lucho_DT", avatar: "classic", status: "Tribuna · Fútbol", lines: ["¿Viste el partido de ayer? 🔥", "Dale, cuando quieras jugamos.", "Ese arquero está nerfeado, che."], sticker: "aburridomevoy" },
    { id: "bot:mari", name: "MariBox", avatar: "classic", status: "Boxes · Carreras", lines: ["Voy por la pole 🏁", "Hoy salgo con blandos.", "Buena vuelta la tuya."], sticker: "pisala" },
    { id: "bot:tano", name: "ElTano99", avatar: "classic", status: "Casino", lines: ["Todo al rojo.", "Perdí todo, qué bajón.", "¿Jugamos una mano?"], sticker: "quenomevoyair" },
    { id: "bot:cami", name: "CamiKO", avatar: "classic", status: "Liga Lucha", lines: ["¿Sparring mañana?", "Me duele hasta el orgullo.", "Vení que te enseño."], sticker: "ayayay" },
    { id: "bot:pipe", name: "Pipe_NFL", avatar: "classic", status: "Gridiron", lines: ["Touchdown!", "Ese pase estuvo largo.", "Mañana hay revancha."], sticker: "claroclaro" },
    { id: "bot:sofi", name: "SofiBeats", avatar: "classic", status: "Música", lines: ["Estoy grabando un tema nuevo 🎶", "¿Escuchaste mi single?", "Ahora sí, a los charts."], sticker: "quebailas" },
  ];
  const isBot = (id) => String(id).startsWith("bot:");

  const S = { me: { id: "", name: "Manager_01", avatar: "classic" }, chans: {}, peers: {}, prefs: { sound: true, vol: 0.8 }, room: null, roomLabel: "", cdUntil: 0, listeners: [], views: [], transport: null, hooks: {}, lastRx: {}, active: "global", frame: null, stream: { on: false, hidden: false, muted: false } };
  const load = () => {
    try { const j = JSON.parse(localStorage.getItem(KEY) || "{}"); if (j.chans) S.chans = j.chans; if (j.prefs) Object.assign(S.prefs, j.prefs); if (j.stream) Object.assign(S.stream, j.stream, { on: false }); if (j.peers) S.peers = j.peers; } catch (e) {}
    try { S.cdUntil = +localStorage.getItem(KEY_CD) || 0; } catch (e) {}
    try { S.me.id = localStorage.getItem(KEY_UID); if (!S.me.id) { S.me.id = "u" + rid(); localStorage.setItem(KEY_UID, S.me.id); } } catch (e) { S.me.id = S.me.id || "u" + rid(); }
  };
  let saveT = 0;
  const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { const peers = {}; for (const k in S.peers) if (!S.peers[k].live) peers[k] = S.peers[k]; localStorage.setItem(KEY, JSON.stringify({ chans: S.chans, prefs: S.prefs, peers, stream: { hidden: S.stream.hidden, muted: S.stream.muted } })); } catch (e) {} }, 250); };
  const emit = () => { S.listeners.forEach((f) => { try { f(); } catch (e) {} }); S.views.forEach((v) => v.refresh()); };
  const chan = (id) => (S.chans[id] || (S.chans[id] = { msgs: [], unread: 0 }));
  const profile = () => { try { const p = S.hooks.profile && S.hooks.profile(); if (p) { S.me.name = p.name || S.me.name; S.me.avatar = p.avatar || S.me.avatar; } } catch (e) {} return S.me; };
  const meRef = () => { const p = profile(); return { id: p.id, name: p.name, avatar: p.avatar }; };

  // ---------------------------------------------------------------- transporte
  const bcTransport = () => {
    let bc = null; try { bc = new BroadcastChannel("em-chat"); } catch (e) {}
    return { kind: "local", send(p) { if (bc) bc.postMessage(p); }, onMessage(fn) { if (bc) bc.onmessage = (e) => fn(e.data); }, status: () => (bc ? "Modo local · entre pestañas" : "Sin conexión") };
  };
  function wsTransport(url) {
    let ws = null, fn = () => {}, open = false, tries = 0, stopped = false;
    const t = { kind: "ws", send(p) { if (open) try { ws.send(JSON.stringify(p)); } catch (e) {} }, onMessage(f) { fn = f; }, status: () => (open ? "Conectado al servidor" : "Reconectando…"), close() { stopped = true; try { ws.close(); } catch (e) {} } };
    const connect = () => { if (stopped) return; try { ws = new WebSocket(url); } catch (e) { return; } ws.onopen = () => { open = true; tries = 0; emit(); sendPresence(); }; ws.onmessage = (e) => { try { fn(JSON.parse(e.data)); } catch (er) {} }; ws.onclose = () => { open = false; emit(); if (!stopped) setTimeout(connect, Math.min(15000, 1000 * ++tries)); }; ws.onerror = () => {}; };
    connect(); return t;
  }
  function setTransport(t) { S.transport = t; t.onMessage(receive); }
  function useWebSocket(url) { try { if (url) localStorage.setItem(KEY_WS, url); else localStorage.removeItem(KEY_WS); } catch (e) {} if (S.transport && S.transport.close) S.transport.close(); setTransport(url ? wsTransport(url) : bcTransport()); emit(); }
  const tx = (p) => { try { S.transport && S.transport.send(p); } catch (e) {} };

  // ---------------------------------------------------------------- presencia
  function sendPresence() { tx({ t: "presence", from: meRef(), room: S.room, roomLabel: S.roomLabel, ts: Date.now() }); }
  function prune() { const now = Date.now(); let ch = false; for (const k in S.peers) { const p = S.peers[k]; if (p.live && now - p.seen > PEER_TTL) { p.live = false; ch = true; } } if (ch) emit(); }
  function seePeer(from, extra) { if (!from || from.id === S.me.id || isBot(from.id)) return; const p = S.peers[from.id] || (S.peers[from.id] = {}); const was = p.live; Object.assign(p, { id: from.id, name: from.name, avatar: from.avatar, seen: Date.now(), live: true }, extra || {}); if (!was) emit(); }

  // ---------------------------------------------------------------- mensajes
  const chanOf = (m) => (m.ch === "global" ? "global" : m.ch === "room" ? "room:" + m.room : m.from.id === S.me.id ? "dm:" + m.to : "dm:" + m.from.id);
  function store(m) {
    const id = chanOf(m), c = chan(id);
    if (c.msgs.some((x) => x.id === m.id)) return null;
    c.msgs.push({ id: m.id, from: m.from, kind: m.kind, text: m.text, sticker: m.sticker, ts: m.ts });
    if (c.msgs.length > MAX_HIST) c.msgs.splice(0, c.msgs.length - MAX_HIST);
    if (m.from.id !== S.me.id && !viewing(id) && !streamShows(id)) c.unread = (c.unread || 0) + 1;
    save(); return id;
  }
  const viewing = (id) => S.views.some((v) => v.visible() && v.active === id);
  function receive(m) {
    if (!m || typeof m !== "object" || !m.from || m.from.id === S.me.id) return;
    if (m.t === "presence") { if (m.bye) { const p = S.peers[m.from.id]; if (p && p.live) { p.live = false; emit(); } return; } seePeer(m.from, { room: m.room, roomLabel: m.roomLabel }); return; }
    if (m.t !== "msg" || typeof m.id !== "string") return;
    if (m.ch === "dm" && m.to !== S.me.id) return;
    if (m.ch === "room" && m.room !== S.room) return;
    if (m.kind === "text") { m.text = String(m.text || "").slice(0, MAX_TEXT); if (!m.text.trim()) return; }
    else if (m.kind === "sticker") {
      if (!stickerById(m.sticker)) return;
      const now = Date.now(); if (now - (S.lastRx[m.from.id] || 0) < STICKER_CD_RX) return; S.lastRx[m.from.id] = now; // enfriamiento también del lado receptor
    } else return;
    seePeer(m.from);
    const id = store(m); if (!id) return;
    if (m.kind === "sticker" && S.prefs.sound !== false && !(S.stream.muted && id === "room:" + S.room)) playOnStage(m.sticker, m.from.name);
    streamPush(m, id);
    emit();
  }
  const cdLeft = () => Math.max(0, S.cdUntil - Date.now());
  function send(ch, payload) {
    const me = meRef(), [type, arg] = ch === "global" ? ["global"] : ch.startsWith("room:") ? ["room", ch.slice(5)] : ["dm", ch.slice(3)];
    if (type === "room" && arg !== S.room) return { ok: false, reason: "room" };
    const m = Object.assign({ t: "msg", id: rid(), ch: type, room: type === "room" ? arg : undefined, to: type === "dm" ? arg : undefined, from: me, ts: Date.now() }, payload);
    const sid = store(m); if (sid) streamPush(m, sid); if (!(type === "dm" && isBot(arg))) tx(m);
    if (type === "dm" && isBot(arg)) botReply(arg, payload);
    emit(); return { ok: true, msg: m };
  }
  function sendText(ch, text) { text = String(text || "").trim().slice(0, MAX_TEXT); if (!text) return { ok: false, reason: "empty" }; return send(ch, { kind: "text", text }); }
  function sendSticker(ch, id) {
    if (!stickerById(id)) return { ok: false, reason: "unknown" };
    const left = cdLeft(); if (left > 0) return { ok: false, reason: "cooldown", left };
    S.cdUntil = Date.now() + STICKER_CD; try { localStorage.setItem(KEY_CD, String(S.cdUntil)); } catch (e) {}
    const r = send(ch, { kind: "sticker", sticker: id }); if (r.ok && S.prefs.sound !== false) playOnStage(id, "Vos", true); fstate(); return r;
  }
  function botReply(botId, sent) {
    const b = BOTS.find((x) => x.id === botId); if (!b) return;
    setTimeout(() => {
      const useSticker = sent.kind === "sticker" || Math.random() < 0.18;
      const m = { t: "msg", id: rid(), ch: "dm", to: S.me.id, from: { id: b.id, name: b.name, avatar: b.avatar }, ts: Date.now() };
      if (useSticker && stickerById(b.sticker)) { m.kind = "sticker"; m.sticker = b.sticker; } else { m.kind = "text"; m.text = b.lines[Math.floor(Math.random() * b.lines.length)]; }
      const id = store(m); if (id && m.kind === "sticker" && S.prefs.sound) playOnStage(m.sticker, b.name); emit();
    }, 1100 + Math.random() * 1600);
  }
  function seedGlobal() {
    const c = chan("global"); if (c.msgs.length || c.seeded) return; c.seeded = true;
    const now = Date.now(), seed = [[0, "¡Bienvenidos al chat global de Eternal Manager!"], [1, "Los mensajes de estos jugadores son de demostración: hasta conectar un servidor sólo verás a quienes abran el hub en otra pestaña."], [2, "Probá los stickers con el botón ☺ (uno cada 10 s)."]];
    seed.forEach(([i, text]) => c.msgs.push({ id: "seed" + i, from: { id: "bot:sys", name: "Eternal Manager", avatar: "classic" }, kind: "text", text, ts: now - (3 - i) * 60000, demo: true }));
  }

  // ---------------------------------------------------------------- escenario de stickers (reproduce video + audio)
  let stage = null, stageT = 0;
  function ensureStage() {
    if (stage) return stage;
    stage = document.createElement("div"); stage.className = "emc-stage"; stage.hidden = true;
    stage.innerHTML = '<div class="emc-stage-head"><b></b><button type="button" aria-label="Cerrar sticker">×</button></div><video playsinline></video><div class="emc-stage-hint" hidden>Tocá para activar el sonido</div>';
    document.body.appendChild(stage);
    $("button", stage).onclick = stopStage;
    $(".emc-stage-hint", stage).onclick = () => { const v = $("video", stage); v.muted = false; v.play().catch(() => {}); $(".emc-stage-hint", stage).hidden = true; };
    return stage;
  }
  function playOnStage(sid, who, own) {
    const s = stickerById(sid); if (!s) return;
    if (S.frame) { fpost({ kind: "sticker", url: absUrl(s), who, label: s.label }); S.hooks.onStickerPlay && S.hooks.onStickerPlay(true); clearTimeout(S.frameDuck); S.frameDuck = setTimeout(() => S.hooks.onStickerPlay && S.hooks.onStickerPlay(false), STAGE_MAX_MS); return; }
    const st = ensureStage(), v = $("video", st);
    $("b", st).textContent = who + " · " + s.label; st.hidden = false; st.classList.toggle("own", !!own);
    clearTimeout(stageT); v.pause(); v.src = stickerUrl(s); v.volume = S.prefs.vol; v.muted = false; v.currentTime = 0; $(".emc-stage-hint", st).hidden = true;
    v.onended = stopStage;
    const p = v.play(); if (p && p.catch) p.catch(() => { v.muted = true; v.play().catch(() => {}); $(".emc-stage-hint", st).hidden = false; const un = () => { v.muted = false; $(".emc-stage-hint", st).hidden = true; }; document.addEventListener("pointerdown", un, { once: true }); });
    stageT = setTimeout(stopStage, STAGE_MAX_MS);
    S.hooks.onStickerPlay && S.hooks.onStickerPlay(true);
  }
  function stopStage() { if (S.frame) fpost({ kind: "stopSticker" }); if (!stage) return; clearTimeout(stageT); const v = $("video", stage); v.pause(); v.removeAttribute("src"); v.load(); stage.hidden = true; S.hooks.onStickerPlay && S.hooks.onStickerPlay(false); }

  // ---------------------------------------------------------------- listas
  const hue = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
  const avatarHTML = (u, cls) => `<span class="emc-av ${cls || ""}" style="--h:${hue(u.id || u.name)}">${esc((u.name || "?").trim().slice(0, 1).toUpperCase())}</span>`;
  function people() {
    const live = Object.values(S.peers).filter((p) => p.live).map((p) => ({ id: p.id, name: p.name, avatar: p.avatar, status: p.roomLabel || "En el hub", online: true }));
    const bots = BOTS.map((b) => ({ id: b.id, name: b.name, avatar: b.avatar, status: b.status, online: true, demo: true }));
    const past = Object.values(S.peers).filter((p) => !p.live).map((p) => ({ id: p.id, name: p.name, avatar: p.avatar, status: "Desconectado", online: false }));
    const all = [...live, ...bots, ...past], dup = {}; all.forEach((p) => (dup[p.name] = (dup[p.name] || 0) + 1));
    all.forEach((p) => { p.label = dup[p.name] > 1 && !p.demo ? p.name + " #" + p.id.slice(-3) : p.name; });
    return all;
  }
  const chanTitle = (id) => (id === "global" ? "Chat global" : id.startsWith("room:") ? "Sala · " + (id.slice(5) === S.room ? S.roomLabel || id.slice(5) : id.slice(5)) : (people().find((p) => "dm:" + p.id === id) || { label: "Mensaje directo" }).label);
  const totalUnread = () => Object.values(S.chans).reduce((a, c) => a + (c.unread || 0), 0);
  const fmtTime = (ts) => new Date(ts).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });

  // ---------------------------------------------------------------- interfaz
  function mount(el, opts) {
    opts = opts || {};
    const V = { el, compact: !!opts.compact, active: S.active, side: false, stickers: false, q: "", pq: "", tick: 0 };
    el.classList.add("emc"); el.classList.toggle("emc-compact", V.compact);
    el.innerHTML = `<aside class="emc-side"><div class="emc-side-head"><b>Conversaciones</b></div><div class="emc-list" data-list="chans"></div><div class="emc-side-head"><b>Jugadores</b><input type="search" class="emc-search" placeholder="Buscar…" aria-label="Buscar jugador"></div><div class="emc-list emc-people" data-list="people"></div><div class="emc-conn"><i class="dot"></i><span></span></div></aside>
<section class="emc-main"><header class="emc-head"><button type="button" class="emc-icon emc-side-toggle" aria-label="Conversaciones y jugadores">☰</button><div class="emc-title"><b></b><small></small></div><label class="emc-snd" title="Sonido de los stickers"><input type="checkbox" checked> <span>Sonido</span></label><input type="range" class="emc-vol" min="0" max="1" step="0.05" title="Volumen de los stickers" aria-label="Volumen de los stickers"></header>
<div class="emc-msgs" role="log" aria-live="polite"></div>
<div class="emc-stk" hidden><div class="emc-stk-head"><input type="search" placeholder="Buscar sticker…" aria-label="Buscar sticker"><span class="emc-stk-cd"></span></div><div class="emc-stk-grid"></div></div>
<form class="emc-form" autocomplete="off"><button type="button" class="emc-icon emc-stk-btn" aria-label="Stickers" title="Stickers (uno cada 10 s)"><span>☺</span><i class="emc-ring"></i></button><input type="text" class="emc-input" maxlength="${MAX_TEXT}" placeholder="Escribí un mensaje…" aria-label="Mensaje"><button class="emc-send" type="submit">Enviar</button></form></section>`;
    const q = (s) => $(s, el), msgs = q(".emc-msgs"), input = q(".emc-input"), stk = q(".emc-stk");
    V.visible = () => el.isConnected && el.offsetParent !== null;
    // lista de conversaciones y jugadores
    function drawSide() {
      const chans = ["global"]; if (S.room) chans.push("room:" + S.room);
      for (const k in S.chans) if (k.startsWith("dm:") && S.chans[k].msgs.length && !chans.includes(k)) chans.push(k);
      if (!chans.includes(V.active)) chans.push(V.active);
      q('[data-list="chans"]').innerHTML = chans.map((id) => { const c = chan(id), last = c.msgs[c.msgs.length - 1], icon = id === "global" ? "🌐" : id.startsWith("room:") ? "🎮" : "✉";
        return `<button type="button" class="emc-row ${id === V.active ? "on" : ""}" data-chan="${esc(id)}"><span class="emc-ic">${icon}</span><span class="emc-tx"><b>${esc(chanTitle(id))}</b><small>${last ? esc(last.kind === "sticker" ? "☺ sticker" : last.text).slice(0, 40) : "Sin mensajes"}</small></span>${c.unread ? `<em class="emc-badge">${c.unread > 99 ? "99+" : c.unread}</em>` : ""}</button>`; }).join("");
      const f = V.pq.toLowerCase(), ppl = people().filter((p) => !f || p.label.toLowerCase().includes(f));
      q('[data-list="people"]').innerHTML = ppl.map((p) => `<button type="button" class="emc-row" data-dm="${esc(p.id)}">${avatarHTML(p)}<span class="emc-tx"><b>${esc(p.label)}${p.demo ? ' <u class="emc-demo">demo</u>' : ""}</b><small>${esc(p.status)}</small></span><i class="emc-st ${p.online ? "on" : ""}" title="${p.online ? "En línea" : "Desconectado"}"></i></button>`).join("") || '<p class="emc-empty">Sin resultados.</p>';
      q(".emc-conn span").textContent = S.transport ? S.transport.status() : "";
    }
    function drawMsgs(stick) {
      const c = chan(V.active), near = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 80, me = S.me.id;
      msgs.innerHTML = c.msgs.length ? c.msgs.map((m) => { const mine = m.from.id === me, s = m.kind === "sticker" ? stickerById(m.sticker) : null;
        const body = s ? `<button type="button" class="emc-stk-msg" data-play="${esc(s.id)}" data-who="${esc(mine ? "Vos" : m.from.name)}" title="Reproducir"><video preload="metadata" muted playsinline src="${esc(stickerUrl(s))}#t=0.4"></video><span class="emc-play">▶</span><small>${esc(s.label)}</small></button>` : m.kind === "sticker" ? "<i>sticker no disponible</i>" : esc(m.text);
        return `<div class="emc-msg ${mine ? "mine" : ""}${s ? " sticker" : ""}">${mine ? "" : avatarHTML(m.from)}<div class="emc-bub">${mine ? "" : `<b class="emc-who">${esc(m.from.name)}${m.demo || isBot(m.from.id) ? ' <u class="emc-demo">demo</u>' : ""}</b>`}${body}<time>${fmtTime(m.ts)}</time></div></div>`; }).join("") : '<p class="emc-empty big">Todavía no hay mensajes. ¡Rompé el hielo!</p>';
      if (stick || near) msgs.scrollTop = msgs.scrollHeight;
    }
    function drawHead() {
      const id = V.active, c = chan(id); q(".emc-title b").textContent = chanTitle(id);
      q(".emc-title small").textContent = id === "global" ? "Todos los jugadores" : id.startsWith("room:") ? "Sólo quienes están en esta sala" : (people().find((p) => "dm:" + p.id === id) || {}).status || "Mensaje directo";
      q(".emc-snd input").checked = S.prefs.sound; q(".emc-vol").value = S.prefs.vol;
      input.placeholder = id.startsWith("room:") && id.slice(5) !== S.room ? "Esta sala ya no está activa" : "Escribí un mensaje…";
      input.disabled = id.startsWith("room:") && id.slice(5) !== S.room; c.unread = 0;
    }
    function drawCd() {
      const left = cdLeft(), b = q(".emc-stk-btn"); b.classList.toggle("cd", left > 0); b.style.setProperty("--p", left ? String(1 - left / STICKER_CD) : "1");
      q(".emc-stk-cd").textContent = left ? "Podés enviar otro en " + Math.ceil(left / 1000) + " s" : "Listo para enviar";
      stk.classList.toggle("cooling", left > 0);
    }
    function drawStickers() {
      const f = V.q.toLowerCase(), list = stickers().filter((s) => !f || s.label.toLowerCase().includes(f));
      q(".emc-stk-grid").innerHTML = list.map((s) => `<button type="button" class="emc-tile" data-st="${esc(s.id)}" title="${esc(s.label)}"><video preload="metadata" muted playsinline src="${esc(stickerUrl(s))}#t=0.4"></video><small>${esc(s.label)}</small></button>`).join("") || '<p class="emc-empty">No hay stickers con ese nombre.</p>';
    }
    V.refresh = () => { drawSide(); drawHead(); drawMsgs(); drawCd(); el.classList.toggle("show-side", V.side); };
    V.open = (id) => { V.active = id; S.active = id; chan(id).unread = 0; V.side = false; V.refresh(); save(); emit2(); msgs.scrollTop = msgs.scrollHeight; };
    const emit2 = () => S.listeners.forEach((f) => { try { f(); } catch (e) {} });
    // eventos
    el.addEventListener("click", (e) => {
      const r = e.target.closest("[data-chan]"); if (r) return V.open(r.dataset.chan);
      const d = e.target.closest("[data-dm]"); if (d) return V.open("dm:" + d.dataset.dm);
      const p = e.target.closest("[data-play]"); if (p) return playOnStage(p.dataset.play, p.dataset.who);
      const t = e.target.closest("[data-st]"); if (t) { const r2 = sendSticker(V.active, t.dataset.st); if (r2.ok) { stk.hidden = true; } else if (r2.reason === "cooldown") { const cd = q(".emc-stk-cd"); cd.classList.add("shake"); setTimeout(() => cd.classList.remove("shake"), 400); } return; }
      if (e.target.closest(".emc-stk-btn")) { stk.hidden = !stk.hidden; if (!stk.hidden) { drawStickers(); q(".emc-stk-head input").focus(); } return; }
      if (e.target.closest(".emc-side-toggle")) { V.side = !V.side; el.classList.toggle("show-side", V.side); }
    });
    q(".emc-form").addEventListener("submit", (e) => { e.preventDefault(); if (input.disabled) return; const r = sendText(V.active, input.value); if (r.ok) { input.value = ""; msgs.scrollTop = msgs.scrollHeight; } });
    q(".emc-stk-head input").addEventListener("input", (e) => { V.q = e.target.value; drawStickers(); });
    q(".emc-search").addEventListener("input", (e) => { V.pq = e.target.value; drawSide(); });
    q(".emc-snd input").addEventListener("change", (e) => { S.prefs.sound = e.target.checked; if (!S.prefs.sound) stopStage(); save(); fstate(); });
    q(".emc-vol").addEventListener("input", (e) => { S.prefs.vol = +e.target.value; if (stage) $("video", stage).volume = S.prefs.vol; save(); fstate(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !stk.hidden && V.visible()) stk.hidden = true; });
    V.timer = setInterval(() => { if (V.visible()) drawCd(); }, 250);
    S.views.push(V); V.refresh(); return V;
  }

  // ---------------------------------------------------------------- chat de partido (estilo stream)
  // Durante un partido los mensajes de la sala aparecen sobre el juego, se desvanecen solos, y se pueden ocultar (botón ✕) o silenciar (🔔).
  const absUrl = (s) => new URL(stickerUrl(s), location.href).href;
  const fpost = (m) => { try { S.frame && S.frame.postMessage(Object.assign({ type: "TOUCHLINE_CHAT_UI" }, m), "*"); } catch (e) {} };
  function fstate() { if (S.frame) fpost({ kind: "state", on: S.stream.on, hidden: S.stream.hidden, muted: S.stream.muted, label: S.roomLabel, room: !!S.room, cdUntil: S.cdUntil, sound: S.prefs.sound, vol: S.prefs.vol }); }
  // El chat del partido se dibuja dentro del propio juego (así sigue visible en pantalla completa); el hub sólo le manda mensajes y estado.
  function attachFrame(win) { S.frame = win; fpost({ kind: "stickers", list: stickers().map((s) => ({ id: s.id, label: s.label, url: absUrl(s) })) }); streamRender(); }
  function detachFrame() { if (!S.frame) return; fpost({ kind: "state", on: false }); S.frame = null; streamRender(); }
  function frameAction(d) {
    if (!S.frame) return;
    const ch = S.room ? "room:" + S.room : null;
    if (d.action === "sendText" && ch) sendText(ch, String(d.text || ""));
    else if (d.action === "sendSticker" && ch) sendSticker(ch, String(d.sticker));
    else if (d.action === "hide") S.stream.hidden = true; else if (d.action === "show") S.stream.hidden = false;
    else if (d.action === "mute") { S.stream.muted = !S.stream.muted; if (S.stream.muted) fpost({ kind: "stopSticker" }); }
    else if (d.action === "stickerDone") { S.hooks.onStickerPlay && S.hooks.onStickerPlay(false); return; }
    save(); fstate(); emit();
  }
  const STREAM_TTL = 14000, STREAM_MAX = 7;
  let streamEl = null;
  function streamShows(id) { return S.stream.on && !S.stream.hidden && !S.stream.muted && id === "room:" + S.room; }
  function ensureStream() {
    if (streamEl) return streamEl;
    streamEl = document.createElement("div"); streamEl.className = "emc-stream"; streamEl.hidden = true;
    streamEl.innerHTML = '<div class="emc-st-bar"><span>💬 Chat del partido</span><button type="button" data-s="mute" title="Silenciar el chat del partido (no se muestran mensajes y los stickers no suenan)">🔔</button><button type="button" data-s="hide" title="Ocultar el chat">✕</button></div><div class="emc-st-feed" aria-live="off"></div><form class="emc-st-form"><input type="text" maxlength="' + MAX_TEXT + '" placeholder="Escribir en el chat del partido…" aria-label="Mensaje al chat del partido"><button type="button" data-s="stk" title="Stickers" aria-label="Stickers">☺</button></form><button type="button" class="emc-st-show" data-s="show" title="Mostrar el chat del partido" hidden>💬</button>';
    document.body.appendChild(streamEl);
    streamEl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-s]"); if (!b) return; const k = b.dataset.s;
      if (k === "hide") S.stream.hidden = true; else if (k === "show") S.stream.hidden = false;
      else if (k === "mute") { S.stream.muted = !S.stream.muted; if (S.stream.muted) stopStage(); }
      else if (k === "stk") { S.hooks.openDrawer && S.hooks.openDrawer(); return; }
      save(); streamRender(); emit();
    });
    $("form", streamEl).addEventListener("submit", (e) => { e.preventDefault(); const i = $("input", streamEl); if (S.room && sendText("room:" + S.room, i.value).ok) i.value = ""; i.blur(); });
    $("input", streamEl).addEventListener("keydown", (e) => e.stopPropagation()); // que las teclas no lleguen al juego
    return streamEl;
  }
  function streamRender() {
    const el = ensureStream(), on = S.stream.on && !!S.room && !S.frame;
    fstate(); el.hidden = !on; if (!on) return;
    el.classList.toggle("hidden", S.stream.hidden); el.classList.toggle("muted", S.stream.muted);
    $(".emc-st-show", el).hidden = !S.stream.hidden;
    const mb = $('[data-s="mute"]', el); mb.textContent = S.stream.muted ? "🔕" : "🔔"; mb.classList.toggle("on", S.stream.muted);
    $(".emc-st-bar span", el).textContent = "💬 " + (S.roomLabel || "Chat del partido") + (S.stream.muted ? " · silenciado" : "");
    if (S.stream.muted || S.stream.hidden) $(".emc-st-feed", el).innerHTML = "";
  }
  function streamPush(m, id) {
    if (!streamShows(id)) return;
    if (S.frame) { const s0 = m.kind === "sticker" ? stickerById(m.sticker) : null; fpost({ kind: "msg", name: m.from.name, hue: hue(m.from.id || m.from.name), text: m.text, sticker: s0 ? s0.label : null }); return; }
    const el = ensureStream(), feed = $(".emc-st-feed", el), d = document.createElement("div");
    const s = m.kind === "sticker" ? stickerById(m.sticker) : null;
    d.className = "emc-st-msg"; d.style.setProperty("--h", hue(m.from.id || m.from.name));
    d.innerHTML = `<b>${esc(m.from.name)}</b>${s ? `<i>envió ☺ ${esc(s.label)}</i>` : `<span>${esc(m.text)}</span>`}`;
    feed.appendChild(d); while (feed.children.length > STREAM_MAX) feed.firstChild.remove();
    setTimeout(() => d.classList.add("out"), STREAM_TTL); setTimeout(() => d.remove(), STREAM_TTL + 700);
  }
  function setMatchActive(on) { on = !!on; if (S.stream.on === on) return; S.stream.on = on; if (!on) { const f = streamEl && $(".emc-st-feed", streamEl); if (f) f.innerHTML = ""; } streamRender(); emit(); }

  // ---------------------------------------------------------------- API pública
  function setRoom(id, label) {
    if (id === S.room && (label || "") === S.roomLabel) return;
    S.room = id || null; S.roomLabel = label || ""; if (S.room) chan("room:" + S.room);
    for (const v of S.views) if (v.active.startsWith("room:") && v.active.slice(5) !== S.room) v.active = "global";
    sendPresence(); streamRender(); emit();
  }
  function init(hooks) {
    Object.assign(S.hooks, hooks || {}); load(); profile(); seedGlobal();
    let url = null; try { url = localStorage.getItem(KEY_WS); } catch (e) {}
    setTransport(url ? wsTransport(url) : bcTransport());
    setInterval(() => { sendPresence(); prune(); }, PRESENCE_MS); sendPresence();
    window.addEventListener("beforeunload", () => tx({ t: "presence", from: meRef(), room: null, ts: 0, bye: true }));
    emit();
  }
  window.EMChat = { hasFrame: () => !!S.frame, attachFrame, detachFrame, frameAction, setMatchActive, get streamEl() { return ensureStream(); }, stream: S.stream, init, mount, setRoom, sendText, sendSticker, useWebSocket, setTransport, onChange: (f) => S.listeners.push(f), unread: totalUnread, cooldownLeft: cdLeft, stickers, open: (id) => { S.active = id; S.views.forEach((v) => v.open && v.open(id)); }, get me() { return profile(); }, get room() { return S.room; }, STICKER_COOLDOWN_MS: STICKER_CD };
})();
