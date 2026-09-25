/* =============================================================================
   LFO POP-UPS DE TRANSMISIÓN
   ---------------------------------------------------------------------------
   Paneles animados que aparecen durante el partido, como en una transmisión de TV. No tocan la simulación: sólo leen `ht`
   (motor), `TLM_STUDIO.live()` (liga/copa del manager, si hay carrera) y escriben en el DOM.

   Por eventos (urgentes):   card    tarjeta amarilla / roja       sub     cambio (ENTRÓ / SALIÓ)
                             plate   cobrador (penal, tiro libre, córner) con número y nombre
                             added   tiempo agregado (cartel del cuarto árbitro)
   Rotativos (cada ~40 s de juego, sólo con la pelota en juego, nunca sobre replays, goles, penales ni pausas):
                             venue   estadio y público          standings  tabla de la liga / cuadro de La Cupidité
                             stats   estadísticas del partido   goals      GOLES (minuto, autor, marcador)
                             cards   TARJETAS AMARILLAS / ROJAS (o «NO HUBO»)      subs   CAMBIOS
                             mvp     figura hasta ahora         scorers    goleadores del torneo
                             sponsor banner de anunciante (placeholder: ver lfoskin/popups/README.md)

   Variante La Cupidité: las mismas piezas cambian de piel solas con :root[data-lfo-pkg="cupidite"] (lfoskin/popups.css).
   API: LFOPops.event(i) → true si mostró algo · LFOPops.show(kind) · LFOPops.clear() · LFOPops.enabled (ajuste "Pop-ups de TV")
   ========================================================================== */
(function (g) {
  'use strict';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LOGO = 'equiposfut/ligadefutbolonlinelogo.png';
  const CHAN = 'LFO · TRANSMISIÓN OFICIAL';
  const M = () => (g.lfoArchive && g.lfoArchive.match) || null;
  const replaying = () => { const b = document.getElementById('replay-badge'); return !!(b && !b.hidden); };
  const cupSkin = () => document.documentElement.getAttribute('data-lfo-pkg') === 'cupidite';
  const crestOf = (t) => { const m = M(); return (m && m.teams[t] && m.teams[t].crest) || LOGO; };
  const nameOf = (t) => { const m = M(); return (m && m.teams[t] && m.teams[t].name) || ''; };
  const colorOf = (t) => { const m = M(); return (m && m.teams[t] && m.teams[t].color) || '#ffffff'; };
  const shortOf = (t) => nameOf(t).replace(/^(Club|CA|FC|SC)\s+/i, '').slice(0, 14).toUpperCase();
  const minOf = (e) => Math.floor(e.time / 60) + '′';
  const tagOf = (e) => (e.time < 2700 ? 'PT' : e.time < 5460 ? 'ST' : 'PR');
  const POS = { GK: 'ARQUERO', DEF: 'DEFENSOR', MID: 'MEDIOCAMPISTA', FWD: 'DELANTERO' };
  const SPONSORS = [
    { id: 'lfoplay', name: 'LFO PLAY', line: 'TODA LA LIGA, EN VIVO', sub: 'lfoplay.tv', c: '#0a4a86' },
    { id: 'bancoeterno', name: 'BANCO ETERNO', line: 'TU CLUB, TU CUENTA', sub: 'Más de 970 mil hinchas ya la tienen', c: '#1c7c54' },
    { id: 'aerovia', name: 'AEROVÍA', line: 'VOLÁ A LA PRÓXIMA FECHA', sub: 'Pasajes con el hincha primero', c: '#0093d0' },
    { id: 'arena', name: 'ISOTÓNICA ARENA', line: 'ENERGÍA HASTA EL FINAL', sub: 'La bebida oficial de la liga', c: '#d4541a' },
    { id: 'diamantepay', name: 'DIAMANTE PAY', line: 'PAGÁ COMO UN CAMPEÓN', sub: 'Pagos oficiales de La Cupidité', c: '#0c9c50', cup: true },
  ];
  const S = { q: [], el: null, until: 0, kill: null, nextAt: 0, order: 0, venue: false, added: [false, false], sponsorN: 0, root: null, hooked: false, lastReplay: 0 };
  const api = { enabled: true };

  function root() {
    if (S.root && S.root.isConnected) return S.root;
    const vp = document.getElementById('viewport'); if (!vp) return null;
    S.root = document.createElement('div'); S.root.id = 'lfo-pops'; vp.appendChild(S.root); return S.root;
  }
  // ---------- ciclo de vida de un pop-up (uno por vez, con salida animada) ----------
  function dismiss(now) {
    const el = S.el; if (!el) return;
    S.el = null; clearTimeout(S.kill);
    if (now) return el.remove();
    el.classList.add('out'); setTimeout(() => el.remove(), 520);
  }
  function present(spec) {
    const r = root(); if (!r) return false;
    dismiss(true);
    const el = document.createElement('div'); el.className = `pop pop-${spec.kind} ${spec.cls || ''} ${cupSkin() ? 'cup' : ''}`;
    if (spec.style) el.setAttribute('style', spec.style);
    el.innerHTML = spec.html; r.appendChild(el); S.el = el;
    const ms = api.holdMs || spec.ms; // holdMs: sólo para revisar el diseño a mano
    S.until = performance.now() + ms;
    S.kill = setTimeout(() => { if (S.el === el) dismiss(); }, ms);
    return true;
  }
  function push(spec, urgent) {
    if (!api.enabled || !M()) return false;
    if (urgent) { S.q = S.q.filter((x) => x.urgent); S.q.unshift(Object.assign({ urgent: true }, spec)); dismiss(false); S.until = 0; }
    else if (!S.q.length) S.q.push(spec);
    return true;
  }
  function clear() { S.q = []; dismiss(true); }
  const rows = (arr, cls) => arr.map((h, i) => `<div class="r ${cls || ''}" style="--i:${i}">${h}</div>`).join('');
  const chip = (t) => `<img class="c" src="${esc(crestOf(t))}" alt="">`;
  const frame = (kind, title, body, opt) => {
    opt = opt || {};
    return `<div class="pop-crest" style="--tc:${opt.tc || '#123'}"><img src="${esc(opt.crest || LOGO)}" alt=""></div><div class="pop-main"><div class="pop-title ${opt.tcls || ''}"><b>${title}</b></div><div class="pop-body">${body}</div><div class="pop-chan">${CHAN}</div></div>`;
  };
  const live = () => { try { return (g.TLM_STUDIO && TLM_STUDIO.live && TLM_STUDIO.live()) || null; } catch (e) { return null; } };

  // ---------- constructores ----------
  const goalsAll = () => M().events.filter((e) => e.type === 'goal').reverse();
  const B = {
    goals() {
      const gl = goalsAll(), sc = [0, 0];
      const body = gl.length ? rows(gl.map((e) => { sc[e.team]++; const p = M().players[e.player]; return `<span class="m">${minOf(e)} ${tagOf(e)}</span><span class="n">${esc(p ? p.name : nameOf(e.team))}</span><span class="s">${sc[0]}-${sc[1]}</span>`; })) : '<div class="r none">TODAVÍA NO HUBO GOLES</div>';
      return { kind: 'goals', ms: 7500, html: frame('goals', 'GOLES', body, { tc: colorOf(gl.length ? gl[gl.length - 1].team : 0), crest: crestOf(gl.length ? gl[gl.length - 1].team : 0) }) };
    },
    cards(red) {
      red = !!red; const ev = M().events.filter((e) => e.type === 'card' && red === /ROJA/.test(e.title)).reverse();
      const body = ev.length ? rows(ev.map((e) => { const p = M().players[e.player]; return `<span class="m">${minOf(e)}</span><span class="n">${p ? '#' + p.number + ' ' + esc(p.name) : ''}</span><span class="s">${esc(shortOf(e.team))}</span>`; })) : '<div class="r none">NO HUBO</div>';
      return { kind: 'cards', cls: red ? 'red' : 'yellow', ms: 6500, html: frame('cards', red ? 'TARJETAS ROJAS' : 'TARJETAS AMARILLAS', body, { tc: red ? '#b32020' : '#d9b21b', tcls: red ? 'red' : 'yellow' }) };
    },
    subs() {
      const ev = M().events.filter((e) => e.type === 'sub').reverse();
      const line = (e) => { const p = M().players[e.player], mm = /entra por (.+?)(?: \(|$)/.exec(e.detail || ''); return { i: p ? p.name : '', o: mm ? mm[1] : '', t: e.team, m: minOf(e) }; };
      const body = ev.length ? `<div class="r hd"><span class="in">ENTRÓ ▸</span><span class="out">◂ SALIÓ</span></div>` + rows(ev.slice(-6).map(line).map((x) => `<span class="m">${x.m}</span><span class="in">${esc(x.i)}</span><span class="out">${esc(x.o)}</span>`)) : '<div class="r none">SIN CAMBIOS POR EL MOMENTO</div>';
      return { kind: 'subs', ms: 7000, html: frame('subs', 'CAMBIOS', body, { tc: 'var(--pk-bg1)' }) };
    },
    sub(e) {
      const p = M().players[e.player], mm = /entra por (.+?)(?: \(|$)/.exec(e.detail || ''), t = e.team == null ? (p ? p.team : 0) : e.team;
      return { kind: 'subs', cls: 'one', ms: 5200, html: frame('subs', 'CAMBIO', `<div class="r hd"><span class="in">ENTRÓ ▸</span><span class="out">◂ SALIÓ</span></div><div class="r" style="--i:0"><span class="m">${minOf(e)}</span><span class="in">${p ? '#' + p.number + ' ' + esc(p.name) : ''}</span><span class="out">${esc(mm ? mm[1] : '')}</span></div>`, { tc: colorOf(t), crest: crestOf(t) }) };
    },
    standings() {
      const L = live();
      if (L && L.cup) {
        const rr = (L.ties || []).map((t) => `<span class="cr"><img class="c" src="${esc(t.hc)}" alt=""></span><span class="n ${t.me ? 'me' : ''}">${esc(t.home)}</span><span class="s">${t.score == null ? 'vs' : esc(t.score)}</span><span class="n r2 ${t.me ? 'me' : ''}">${esc(t.away)}</span><span class="cr"><img class="c" src="${esc(t.ac)}" alt=""></span>`);
        return { kind: 'standings', cls: 'cupties', ms: 8500, html: frame('standings', esc((L.comp || 'LA CUPIDITÉ').toUpperCase()) + ' · ' + esc((L.round || '').toUpperCase()), rows(rr.length ? rr : ['<span class="n">SIN DATOS</span>']), { tc: 'var(--pk-bg1)' }) };
      }
      if (L && L.table && L.table.length) {
        // cinco filas centradas en los dos equipos (o en los primeros si no entran)
        const tb = L.table, ids = L.ids || [], at = Math.max(0, Math.min(...ids.map((id) => tb.findIndex((r) => r.id === id)).filter((x) => x >= 0)));
        const from = Math.max(0, Math.min(tb.length - 5, at - 1)), sl = tb.slice(from, from + 5);
        const hd = '<div class="r hd"><span class="pos"></span><span class="n"></span><span class="s">PTS</span><span class="s">PJ</span><span class="s">DG</span></div>';
        const body = hd + rows(sl.map((r) => `<span class="pos">${r.pos}</span><span class="n ${r.mine ? 'me' : ''}"><img class="c" src="${esc(r.crest)}" alt="">${esc(r.short || r.name)}</span><span class="s">${r.pts}</span><span class="s">${r.pj}</span><span class="s">${r.gd > 0 ? '+' : ''}${r.gd}</span>`), 'tb');
        return { kind: 'standings', ms: 8500, html: frame('standings', 'TABLA DE POSICIONES', body, { tc: 'var(--pk-bg1)' }) };
      }
      return null;
    },
    scorers() {
      const L = live(); if (!L || !L.scorers || !L.scorers.length) return null;
      return { kind: 'goals', cls: 'scorers', ms: 7500, html: frame('goals', 'GOLEADORES DEL TORNEO', rows(L.scorers.map((x, i) => `<span class="pos">${i + 1}</span><span class="n"><img class="c" src="${esc(x.crest)}" alt="">${esc(x.name)}</span><span class="s">${x.goals}</span>`), 'tb'), { tc: 'var(--pk-bg1)' }) };
    },
    stats() {
      const m = M(), st = m.stats, tp = (st[0].possession + st[1].possession) || 1, pos = [Math.round(st[0].possession / tp * 100), 0]; pos[1] = 100 - pos[0];
      const bar = (label, a, b, fmt) => { const t = (+a + +b) || 1, pa = Math.round(100 * a / t); return `<span class="v">${fmt ? fmt(a) : a}</span><span class="bar"><i class="a" style="width:${pa}%;--c:${colorOf(0)}"></i><i class="b" style="width:${100 - pa}%;--c:${colorOf(1)}"></i><em>${label}</em></span><span class="v">${fmt ? fmt(b) : b}</span>`; };
      const body = `<div class="r hd stt"><span><img class="c" src="${esc(crestOf(0))}" alt=""> ${esc(shortOf(0))}</span><span></span><span>${esc(shortOf(1))} <img class="c" src="${esc(crestOf(1))}" alt=""></span></div>` +
        rows([bar('POSESIÓN', pos[0], pos[1], (v) => v + '%'), bar('TIROS', st[0].shots, st[1].shots), bar('AL ARCO', st[0].onTarget, st[1].onTarget), bar('xG', st[0].xg.toFixed(1), st[1].xg.toFixed(1)), bar('CÓRNERS', st[0].corners || 0, st[1].corners || 0), bar('FALTAS', st[0].fouls || 0, st[1].fouls || 0)], 'st');
      return { kind: 'stats', ms: 8500, html: frame('stats', 'ESTADÍSTICAS', body, { tc: 'var(--pk-bg1)' }) };
    },
    mvp() {
      const m = M(), sco = {}; const add = (id, v, why) => { if (id == null || !m.players[id]) return; (sco[id] = sco[id] || { v: 0, w: [] }).v += v; sco[id].w.push(why); };
      m.events.forEach((e) => { if (e.type === 'goal') add(e.player, 3, 'gol'); else if (e.type === 'save') add(e.player, 1.1, 'atajada'); else if (e.type === 'tackle') add(e.player, 0.6, 'recuperación'); else if (e.type === 'block') add(e.player, 0.5, 'bloqueo'); else if (e.type === 'shot') add(e.player, 0.35, 'remate'); });
      const best = Object.entries(sco).sort((a, b) => b[1].v - a[1].v)[0]; if (!best || best[1].v < 1.4) return null;
      const p = m.players[+best[0]], c = {}; best[1].w.forEach((w) => (c[w] = (c[w] || 0) + 1));
      const why = Object.entries(c).map(([w, n]) => `${n} ${w}${n > 1 ? 's' : ''}`).slice(0, 3).join(' · ');
      return { kind: 'mvp', ms: 6800, html: `<div class="pop-crest" style="--tc:${colorOf(p.team)}"><img src="${esc(crestOf(p.team))}" alt=""></div><div class="pop-main"><div class="pop-title"><b>FIGURA HASTA AHORA</b></div><div class="pop-body"><div class="r big" style="--i:0"><span class="num">${p.number}</span><span class="n">${esc(p.name)}</span></div><div class="r" style="--i:1"><span class="n sm">${esc(nameOf(p.team))} · ${POS[p.role] || ''}</span></div><div class="r" style="--i:2"><span class="n sm">${esc(why)}</span></div></div><div class="pop-chan">${CHAN}</div></div>` };
    },
    venue() {
      const m = M(), L = g.LFOStadiums, id = g.lfoArchive && g.lfoArchive.view && g.lfoArchive.view.stadiumWanted ? g.lfoArchive.view.stadiumWanted() : '', st = L && L.list ? L.list.find((x) => x.id === id) : null;
      let seed = 0; for (const ch of nameOf(0) + nameOf(1)) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
      const crowd = 28000 + (seed % 27000), stadium = (st && st.name) || 'Estadio ' + nameOf(0);
      const L2 = live();
      return { kind: 'venue', ms: 6500, html: `<div class="pop-main"><div class="pop-title"><b>${esc(L2 && L2.cup ? (L2.comp + ' · ' + L2.round).toUpperCase() : 'EN DIRECTO')}</b></div><div class="pop-body"><div class="r" style="--i:0"><span class="n">${esc(stadium.toUpperCase())}</span></div><div class="r" style="--i:1"><span class="n sm">PÚBLICO: ${crowd.toLocaleString('es-AR')} ESPECTADORES</span></div></div><div class="pop-chan">${CHAN}</div></div>` };
    },
    added(n) {
      return { kind: 'added', ms: 7200, html: `<div class="board"><small>TIEMPO AGREGADO</small><b>+${n}</b><em>MINUTO${n > 1 ? 'S' : ''}</em></div>` };
    },
    card(e) {
      const p = M().players[e.player], red = /ROJA/.test(e.title), t = e.team == null ? (p ? p.team : 0) : e.team, why = /\((.+)\)/.exec(e.detail || '');
      return { kind: 'card', cls: red ? 'red' : 'yellow', ms: 5600, html: `<div class="cardico"><i></i></div><div class="pop-main"><div class="pop-title ${red ? 'red' : 'yellow'}"><b>${red ? 'TARJETA ROJA' : 'TARJETA AMARILLA'}</b><span>${minOf(e)}</span></div><div class="pop-body"><div class="r big" style="--i:0"><span class="num" style="--tc:${colorOf(t)}">${p ? p.number : ''}</span><span class="n">${p ? esc(p.name) : ''}</span><img class="c" src="${esc(crestOf(t))}" alt=""></div><div class="r" style="--i:1"><span class="n sm">${esc(nameOf(t))}${why ? ' · ' + esc(why[1]) : ''}</span></div></div><div class="pop-chan">${CHAN}</div></div>` };
    },
    plate(label, pid) {
      const p = M().players[pid]; if (!p) return null;
      return { kind: 'plate', ms: 4600, html: `<div class="tag" style="--tc:${colorOf(p.team)}"><small>${esc(label)}</small><em>${p.number}</em></div><div class="pop-main"><div class="pop-body"><div class="r big" style="--i:0"><span class="n">${esc(p.name)}</span></div><div class="r" style="--i:1"><span class="n sm">${esc(nameOf(p.team))} · ${POS[p.role] || ''}</span></div></div></div>` };
    },
    sponsor() {
      const cup = cupSkin(), pool = SPONSORS.filter((s) => !!s.cup === cup || (!cup && !s.cup)); const sp = pool[S.sponsorN++ % pool.length];
      return { kind: 'sponsor', ms: 6800, style: `--sc:${sp.c}`, html: `<div class="logo" data-ad-slot="sponsor-${sp.id}"><img src="lfoskin/popups/sponsors/${sp.id}.png" alt="" onerror="this.remove()"><span>${esc(sp.name[0])}</span></div><div class="txt"><b>${esc(sp.line)}</b><small>${esc(sp.sub)}</small></div><div class="brand">${esc(sp.name)}</div><i class="fold"></i>` };
    },
  };
  // ---------- rotación ----------
  const ORDER = ['venue', 'sponsor', 'standings', 'stats', 'sponsor', 'goals', 'cards', 'mvp', 'subs', 'scorers', 'sponsor', 'standings', 'stats', 'cards', 'goals'];
  function build(kind) {
    const m = M();
    if (kind === 'goals' && !goalsAll().length) return null;
    if (kind === 'subs' && !m.events.some((e) => e.type === 'sub')) return null;
    if (kind === 'cards') { const r = m.events.some((e) => e.type === 'card' && /ROJA/.test(e.title)); return B.cards(r && Math.random() < 0.5); }
    return B[kind] ? B[kind]() : null;
  }
  const calm = () => {
    const m = M(); if (!m) return false;
    const T = g.TLB, tst = T && T.state;
    return m.started && !m.ended && m.running && m.phase === 'playing' && !m.so && !replaying() && !(tst && (tst.pkg || tst.pre || tst.half)) && !document.querySelector('.lfo-ad,.tlb-pre,.tlb-post,.pk-board') && !(m.varReview);
  };
  function tick() {
    const m = M(); if (!m || !api.enabled || (g.TLB && g.TLB.cfg && g.TLB.cfg.pops === false)) { if (S.el || S.q.length) clear(); return; }
    const now = performance.now(), free = !S.el || now >= S.until;
    // sobre replays, goles, penales de tanda, descansos, anuncios y estudios no se muestra nada
    const hard = replaying() || m.so || m.phase === 'goal' || m.phase === 'halftime' || m.ended || !m.started || document.querySelector('.lfo-ad,.tlb-pre,.tlb-post,.tlb-half');
    if (hard) { if (S.el || S.q.length) clear(); return; }
    if (S.q.length && free) { present(S.q.shift()); return; } // urgentes (tarjeta, cambio, cobrador): también en pelota parada
    if (!calm() || !free) return;
    if (m.elapsed >= S.nextAt) {
      S.nextAt = m.elapsed + 36 + Math.random() * 10;
      for (let k = 0; k < ORDER.length; k++) {
        const kind = ORDER[S.order++ % ORDER.length]; let spec = null;
        try { spec = kind === 'venue' && S.venue ? null : build(kind); } catch (e) { spec = null; }
        if (spec) { if (kind === 'venue') S.venue = true; present(spec); return; }
      }
    }
    // tiempo agregado: una sola vez por mitad, apenas el reloj lo fija
    for (const h of [0, 1]) { const n = m.injuryTime && m.injuryTime[h]; if (n > 0 && !S.added[h] && m.half === h + 1) { S.added[h] = true; present(B.added(n)); return; } }
  }
  function onEvent(i) {
    const m = M(); if (!m || !api.enabled || (g.TLB && g.TLB.cfg && g.TLB.cfg.pops === false)) return false;
    try {
      if (i.type === 'card') { push(B.card(i), true); return true; }
      if (i.type === 'sub') { push(B.sub(i), true); return true; }
      if (i.type === 'penalty' || (i.type === 'restart' && (/libre/i.test(i.title || '') || i.title === 'Tiro de esquina'))) {
        const rd = m.restartData, pd = m.penaltyData, pid = i.type === 'penalty' ? (pd && pd.takerId) : (rd && rd.takerId);
        if (pid != null) { const sp = B.plate(i.type === 'penalty' ? 'PENAL' : i.title === 'Tiro de esquina' ? 'CÓRNER' : 'TIRO LIBRE', pid); sp && push(sp, true); }
        return false; // el stinger central sigue saliendo
      }
    } catch (e) { console.error('[pops]', e); }
    return false;
  }
  function reset() { clear(); S.nextAt = 0; S.order = 0; S.venue = false; S.added = [false, false]; }
  // el partido se reinicia (nuevo partido / reset): se vuelve a empezar
  let lastStart = null;
  setInterval(() => { const m = M(); if (m && lastStart !== m.seed + ':' + m.started) { if (!m.started) reset(); lastStart = m.seed + ':' + m.started; } tick(); }, 400);
  Object.assign(api, { event: onEvent, show: (k, a) => { const s = B[k] && B[k](a); return s ? push(s, true) : false; }, clear, reset, sponsors: SPONSORS, get current() { return S.el; } });
  g.LFOPops = api;
})(window);
