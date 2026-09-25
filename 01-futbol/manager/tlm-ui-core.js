/* LFO MANAGER — UI núcleo: shell, navegación, helpers, escudos, asistente de nueva carrera, HOME, NOTICIAS,
   COMPETICIÓN, CALENDARIO y CLUB. Las demás pantallas se registran desde tlm-ui-team/market/match.js en TLM.UI.screens. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  if (typeof document === 'undefined') return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const UI = (TLM.UI = { career: null, screen: 'home', params: {}, screens: {}, actions: {}, root: null, nav: [], modalEl: null, dirty: false });
  UI.esc = esc; UI.$ = $;

  // ---------- helpers de presentación ----------
  const M = (v) => TLM.money(v);
  const posClass = (pos) => ({ GK: 'gk', DEF: 'df', MID: 'md', FWD: 'fw' }[TLM.roleOf(pos)]);
  const tone = (v) => (v >= 80 ? 'hi' : v >= 68 ? 'mid' : v >= 55 ? 'lo' : 'bad');
  const bar = (v, max, cls) => `<span class="tlm-bar ${cls || ''}"><i style="width:${Math.max(0, Math.min(100, (v / (max || 100)) * 100))}%"></i></span>`;
  const pill = (t, c) => `<span class="tlm-pill ${c || ''}">${esc(t)}</span>`;
  const formPills = (rs) => (rs && rs.length ? rs.map((x) => `<b class="tlm-f ${x.res || x}">${{ W: 'V', D: 'E', L: 'D' }[x.res || x]}</b>`).join('') : '<span class="muted">—</span>');
  Object.assign(UI, { M, posClass, tone, bar, pill, formPills });

  // ---------- escudos: imagen del club o escudo generado con sus colores ----------
  function crestSVG(o) {
    const p = o.primary || '#4a8fbf', s = o.secondary || '#ffffff', shape = o.shape || 'shield', pat = o.pattern || 'half', sym = (o.symbol || '★').slice(0, 2);
    const shapes = { shield: 'M8 6h44v26q0 18-22 28Q8 50 8 32Z', round: 'M30 4a26 26 0 1 1 0 52a26 26 0 1 1 0-52Z', diamond: 'M30 3l24 27-24 27L6 30Z', banner: 'M9 5h42v40l-21 13-21-13Z' };
    const d = shapes[shape] || shapes.shield, id = 'c' + Math.abs(hashStr(d + p + s + pat)).toString(36);
    const patterns = { plain: '', half: `<rect x="30" y="0" width="30" height="64" fill="${s}" opacity=".9"/>`, stripes: [0, 1, 2].map((i) => `<rect x="${12 + i * 14}" y="0" width="7" height="64" fill="${s}" opacity=".85"/>`).join(''), band: `<rect x="0" y="24" width="60" height="12" fill="${s}" opacity=".9"/>`, sash: `<path d="M0 0h14L60 46v14H46L0 14Z" fill="${s}" opacity=".9"/>` };
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 64"><defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})"><rect width="60" height="64" fill="${p}"/>${patterns[pat] || ''}</g><path d="${d}" fill="none" stroke="${s}" stroke-width="2.5"/><text x="30" y="${shape === 'diamond' ? 36 : 39}" text-anchor="middle" font-family="Barlow Condensed,Arial Narrow,sans-serif" font-weight="800" font-size="24" fill="${pat === 'plain' || pat === 'half' ? s : '#fff'}" stroke="#0007" stroke-width=".6" paint-order="stroke">${esc(sym)}</text></svg>`;
  }
  function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; return h; }
  const svgURL = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  function crestHTML(club, size) {
    size = size || 36;
    if (club.crest) return `<img class="tlm-crest" src="${esc(club.crest)}" width="${size}" height="${size}" alt="" loading="lazy">`;
    const shapes = ['shield', 'round', 'diamond', 'banner'], pats = ['half', 'stripes', 'band', 'sash', 'plain'], h = Math.abs(hashStr(club.id || club.name));
    return `<span class="tlm-crest" style="width:${size}px;height:${size}px">${crestSVG({ primary: club.primaryColor, secondary: club.secondaryColor, shape: shapes[h % 4], pattern: pats[(h >> 3) % 5], symbol: club.shortName ? club.shortName[0] : club.name[0] })}</span>`;
  }
  // URL de imagen del escudo (archivo del club o SVG generado como data-URL): la usan las cartas.
  function crestURL(club) {
    if (club.crest) return club.crest;
    const shapes = ['shield', 'round', 'diamond', 'banner'], pats = ['half', 'stripes', 'band', 'sash', 'plain'], h = Math.abs(hashStr(club.id || club.name));
    return svgURL(crestSVG({ primary: club.primaryColor, secondary: club.secondaryColor, shape: shapes[h % 4], pattern: pats[(h >> 3) % 5], symbol: club.shortName ? club.shortName[0] : club.name[0] }));
  }
  // Bandera de la nación del jugador (naciones ficticias, assets/nations).
  const flagHTML = (nat, h) => { const N = g.LFONations, u = N && N.flag(nat); return u ? `<img class="tlm-flag" src="${esc(u)}" alt="${esc(nat)}" title="${esc(nat)}" height="${h || 14}" loading="lazy">` : ''; };
  TLM.crestSVG = crestSVG; TLM.crestHTML = crestHTML; TLM.crestURL = crestURL; UI.svgURL = svgURL; UI.crest = crestHTML; UI.flag = flagHTML;

  // ---------- tarjetas (sistema de cartas ya existente en collection.js) ----------
  const cardCache = new Map();
  UI.cardFor = (pid) => {
    const s = UI.career.state, p = s.players[pid]; if (!p) return null;
    const cd = TLM.cardData(s, p), club = p.clubId ? s.clubs[p.clubId] : null;
    cd.flag = (g.LFONations && g.LFONations.flag(p.nationality)) || ''; cd.crest = club ? crestURL(club) : '';   // la carta muestra el escudo del club y la bandera del país
    return { cardData: cd, name: TLM.shortName(p.canonicalName), fullName: p.canonicalName, number: p.number || 10, stats: Object.assign({}, p.attributes), role: TLM.roleOf(p.primaryPosition), tlmPid: p.id, team: 0 };
  };
  UI.paintCard = async (canvasHost, pid) => {
    if (!canvasHost || !g.lfoCards) return;
    const p = UI.career.state.players[pid], key = pid + '|' + p.card.edition + '|' + p.overall + '|' + p.number + '|' + (p.clubId || '');
    try {
      let cv = cardCache.get(key);
      if (!cv) { cv = await g.lfoCards.cardCanvas(UI.cardFor(pid)); cardCache.set(key, cv); if (cardCache.size > 60) cardCache.delete(cardCache.keys().next().value); }
      if (!canvasHost.isConnected) return;
      const c2 = document.createElement('canvas'); c2.width = cv.width; c2.height = cv.height; c2.getContext('2d').drawImage(cv, 0, 0); c2.className = 'tlm-cardimg';
      canvasHost.replaceChildren(c2);
    } catch (e) { canvasHost.textContent = 'Carta no disponible'; }
  };
  UI.hydrateCards = () => document.querySelectorAll('[data-card-pid]').forEach((el) => { if (!el.dataset.done) { el.dataset.done = 1; UI.paintCard(el, el.dataset.cardPid); } });

  // ---------- toast / modal ----------
  UI.toast = (msg, kind) => { let t = $('tlm-toast'); if (!t) { t = document.createElement('div'); t.id = 'tlm-toast'; document.body.appendChild(t); } t.className = 'on ' + (kind || ''); t.textContent = msg; clearTimeout(UI._tt); UI._tt = setTimeout(() => (t.className = ''), 3800); };
  UI.modal = (html, cls) => { UI.closeModal(); const d = document.createElement('div'); d.className = 'tlm-modal-bg'; d.innerHTML = `<div class="tlm-modal ${cls || ''}" role="dialog" aria-modal="true"><button class="tlm-x" data-act="closeModal" aria-label="Cerrar">✕</button>${html}</div>`; document.body.appendChild(d); UI.modalEl = d; d.addEventListener('mousedown', (e) => { if (e.target === d) UI.closeModal(); }); UI.hydrateCards(); return d; };
  UI.closeModal = () => { if (UI.modalEl) { UI.modalEl.remove(); UI.modalEl = null; } };
  UI.actions.closeModal = () => UI.closeModal();

  // ---------- navegación ----------
  const NAV = [['home', 'HOME', '⌂'], ['squad', 'SQUAD', '◍'], ['tactics', 'TACTICS', '✜'], ['transfers', 'TRANSFERS', '⇄'], ['scout', 'SCOUT', '◎'], ['club', 'CLUB', '⛨'], ['competitions', 'COMPETICIONES', '☰'], ['calendar', 'CALENDAR', '▦'], ['matchday', 'MATCHDAY', '▶'], ['news', 'NEWS', '✎'], ['wardrobe', 'VESTUARIO', '✦']];
  UI.go = (screen, params) => { if (screen === 'cup') { screen = 'competitions'; params = Object.assign({}, params, { tab: 'cup' }); } UI.screen = screen; UI.params = params || {}; UI.closeModal(); UI.render(); const main = $('tlm-main'); if (main) main.scrollTop = 0; };
  UI.refresh = () => UI.render();

  function alerts() {
    const c = UI.career, s = c.state, u = c.user, out = [];
    const probs = TLM.lineupProblems(s, u); if (probs.length) out.push({ k: 'bad', t: probs[0], go: u.squad.length < 11 ? 'transfers' : 'tactics' });
    const inj = u.squad.map((id) => s.players[id]).filter((p) => p.injury), sus = u.squad.map((id) => s.players[id]).filter((p) => p.suspension > 0);
    if (inj.length) out.push({ k: 'warn', t: `${inj.length} lesionado${inj.length > 1 ? 's' : ''}: ${inj.slice(0, 2).map((p) => p.canonicalName).join(', ')}`, go: 'squad' });
    if (sus.length) out.push({ k: 'warn', t: `${sus.length} sancionado${sus.length > 1 ? 's' : ''}`, go: 'squad' });
    const exp = u.squad.map((id) => s.players[id]).filter((p) => p.contract.endSeason <= s.season && p.overall >= 60);
    if (exp.length) out.push({ k: 'info', t: `${exp.length} contrato${exp.length > 1 ? 's' : ''} vence${exp.length > 1 ? 'n' : ''} esta temporada`, go: 'squad' });
    const fs = TLM.financeStatus(s, u); if (fs !== 'ok') out.push({ k: 'bad', t: fs === 'crisis' ? 'Crisis económica: la directiva puede vender jugadores.' : 'Saldo negativo: no podés fichar.', go: 'club' });
    const offers = Object.values(s.market.offers).filter((o) => o.toClubId === u.id && ['OFFERED', 'NEGOTIATING'].includes(o.status));
    if (offers.length) out.push({ k: 'info', t: `${offers.length} oferta${offers.length > 1 ? 's' : ''} por tus jugadores`, go: 'transfers', p: { tab: 'offers' } });
    const counters = Object.values(s.market.offers).filter((o) => o.fromClubId === u.id && o.status === 'NEGOTIATING' && o.counterAmount);
    if (counters.length) out.push({ k: 'info', t: `${counters.length} contraoferta${counters.length > 1 ? 's' : ''} recibida${counters.length > 1 ? 's' : ''}`, go: 'transfers', p: { tab: 'offers' } });
    const tired = u.lineup.xi.map((id) => id && s.players[id]).filter((p) => p && p.fitness < 60);
    if (tired.length) out.push({ k: 'warn', t: `${tired.length} titular${tired.length > 1 ? 'es' : ''} con poco físico (<60)`, go: 'tactics' });
    return out;
  }
  UI.alerts = alerts;

  UI.render = () => {
    if (!UI.root) return;
    const c = UI.career;
    if (!c) { UI.root.innerHTML = renderStart(); return; }
    const s = c.state, u = c.user, f = c.userFixture();
    const scr = UI.screens[UI.screen] || UI.screens.home, main = scr();
    const cupHot = !!(f && TLM.isCupFixture(f) && f.status !== 'played');
    const badge = { competitions: cupHot ? '●' : 0, transfers: Object.values(s.market.offers).filter((o) => (o.toClubId === u.id || o.fromClubId === u.id) && o.status === 'NEGOTIATING' || (o.toClubId === u.id && o.status === 'OFFERED')).length, matchday: f && f.status !== 'played' ? '●' : 0, news: 0, squad: u.squad.filter((id) => s.players[id].injury).length };
    UI.root.innerHTML = `<div class="tlm-shell" data-screen="${UI.screen}">
      <aside class="tlm-side"><div class="tlm-brand">${crestHTML(u, 44)}<div><b>${esc(u.name)}</b><small>${esc(TLM.seasonLabel(s))} · J${c.round || c.comp.calendar.length}/${c.comp.calendar.length}</small><small>${TLM.roundDateStr(s.season, c.round || c.comp.calendar.length, c.comp.calendar.length)}</small></div></div>
        <nav>${NAV.map(([id, label, ic]) => `<button class="${UI.screen === id ? 'on' : ''} ${(id === 'matchday' || (id === 'competitions' && cupHot)) && f && f.status !== 'played' ? 'hot' : ''}" data-act="go" data-screen="${id}"><i>${ic}</i>${label}${badge[id] ? `<em>${badge[id]}</em>` : ''}</button>`).join('')}</nav>
        <div class="tlm-side-foot"><button data-act="saveNow" class="tlm-btn ghost sm">Guardar</button><button data-act="exportSave" class="tlm-btn ghost sm">Exportar</button><button data-act="quitCareer" class="tlm-btn ghost sm">Menú</button><button data-act="closeManager" class="tlm-btn ghost sm">Salir al partido de exhibición</button></div></aside>
      <section class="tlm-content"><header class="tlm-top"><div class="tlm-chip"><small>SALDO</small><b class="${u.finances.balance < 0 ? 'neg' : ''}">${M(u.finances.balance)}</b></div><div class="tlm-chip"><small>POSICIÓN</small><b>${(c.table().find((r) => r.clubId === u.id) || {}).pos || '-'}° / ${c.comp.teams.length}</b></div><div class="tlm-chip"><small>PLANTILLA</small><b>${u.squad.length}</b></div><div class="tlm-chip"><small>MORAL</small><b>${moraleAvg()}</b></div><span class="tlm-grow"></span>${f && f.status !== 'played' ? `<button class="tlm-btn primary" data-act="go" data-screen="matchday">▶ ${esc(TLM.fixtureLabel(s, f).short)}: ${esc(vsLabel(f))}</button>` : f ? `<button class="tlm-btn primary" data-act="go" data-screen="matchday">${TLM.isCupFixture(f) ? 'Partido de copa jugado' : 'Jornada jugada'} · cerrar</button>` : `<button class="tlm-btn" data-act="go" data-screen="matchday">Descansás esta jornada</button>`}</header>
        <main id="tlm-main" class="tlm-main">${main}</main></section></div>`;
    UI.hydrateCards();
    if (UI.afterRender) UI.afterRender();
  };
  const moraleAvg = () => { const c = UI.career, s = c.state, sq = c.state.clubs[c.state.currentClubId].squad; return sq.length ? Math.round(TLM.avg(sq.map((id) => s.players[id].morale))) : '-'; };
  const vsLabel = (f) => { const c = UI.career, u = c.user.id, opp = c.state.clubs[f.homeId === u ? f.awayId : f.homeId]; return `${f.homeId === u ? 'vs' : '@'} ${opp.name}`; };
  UI.vsLabel = vsLabel;

  // ---------- eventos ----------
  const A = UI.actions;
  A.go = (el) => UI.go(el.dataset.screen, el.dataset.param ? JSON.parse(el.dataset.param) : {});
  A.saveNow = () => { const r = UI.career.save(); UI.toast(r.ok ? 'Carrera guardada.' : r.reason, r.ok ? 'ok' : 'bad'); };
  A.exportSave = () => { const b = new Blob([UI.career.toJSON()], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `lfo-${UI.career.user.shortName}-${UI.career.state.season}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  A.quitCareer = () => { UI.career.save(); UI.career = null; UI.render(); };
  A.closeManager = () => { const B = TLM.Bridge; if (B && B.active && (B.ended || !B.A.match.started)) B.leave(); UI.hide(); };
  document.addEventListener('click', (e) => {
    if (!UI.root) return; const el = e.target.closest('[data-act]'); if (!el || (!UI.root.contains(el) && !(UI.modalEl && UI.modalEl.contains(el)) && !el.closest('.tlm-float'))) return;
    const fn = A[el.dataset.act]; if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('change', (e) => { const el = e.target.closest('[data-chg]'); if (el && A[el.dataset.chg]) A[el.dataset.chg](el, e); });
  document.addEventListener('input', (e) => { const el = e.target.closest('[data-inp]'); if (el && A[el.dataset.inp]) A[el.dataset.inp](el, e); });

  // Ir al Archivo de tribuna o al Centro de partidos cierra el overlay del manager (si no, lo tapaba).
  document.addEventListener('click', (e) => { if (UI.root && UI.root.classList.contains('on') && e.target.closest('#album-nav, #match-nav')) UI.hide(); }, true);

  // ---------- mostrar/ocultar overlay ----------
  UI.show = () => { UI.root.classList.add('on'); document.body.classList.add('tlm-open'); const m = g.lfoArchive && g.lfoArchive.match; if (m && m.running && !m.ended) { m.running = false; g.lfoArchive.refresh(); } UI.render(); };
  UI.hide = () => { UI.root.classList.remove('on'); document.body.classList.remove('tlm-open'); UI.closeModal(); };

  // =====================================================================================
  //                                   PANTALLA DE INICIO
  // =====================================================================================
  UI.wiz = { name: 'Club Nuevo', short: 'NUE', p: '#3f7fb5', s: '#f4f1e6', shape: 'shield', pattern: 'half', symbol: 'N', stadium: 'Estadio Nuevo', cap: 12000, total: 16, seed: '', upload: null, mode: 'create', take: 0 };
  function renderStart() {
    const save = TLM.Career.saveInfo(), auto = TLM.Career.saveInfo('auto');
    const w = UI.wiz, cl = TLM.WORLD_CONFIG.clubs;
    const crestPrev = w.upload ? `<img class="tlm-crest" src="${esc(w.upload)}" width="120" height="120" alt="">` : `<span class="tlm-crest big">${crestSVG({ primary: w.p, secondary: w.s, shape: w.shape, pattern: w.pattern, symbol: w.symbol })}</span>`;
    const sv = (s, l) => (s ? `<button class="tlm-btn" data-act="loadSave" data-slot="${l}">Continuar: ${esc(s.summary.club)} · ${s.summary.season}/${String((s.summary.season + 1) % 100).padStart(2, '0')} J${s.summary.round}</button>` : '');
    return `<div class="tlm-start"><div class="tlm-hero"><small>LFO / MODO CARRERA</small><h1>Modo carrera</h1><p>Armá la plantilla en el mercado, definí la táctica y jugá los partidos en 3D. Los rivales también fichan y venden jugadores.</p>
      <div class="tlm-row">${sv(save, '')}${sv(auto, 'auto')}<label class="tlm-btn ghost">Importar carrera<input type="file" accept="application/json" hidden data-chg="importSave"></label></div></div>
      <div class="tlm-wizard"><div class="tlm-tabs"><button class="${w.mode === 'create' ? 'on' : ''}" data-act="wizMode" data-m="create">Crear mi club</button><button class="${w.mode === 'take' ? 'on' : ''}" data-act="wizMode" data-m="take">Dirigir un club existente</button></div>
      ${w.mode === 'create' ? `<div class="tlm-wgrid"><div class="tlm-crestbox">${crestPrev}<div class="tlm-swatch"><label>Principal<input type="color" value="${w.p}" data-inp="wizP"></label><label>Secundario<input type="color" value="${w.s}" data-inp="wizS"></label></div></div>
        <div class="tlm-fields"><label>Nombre del club<input value="${esc(w.name)}" maxlength="32" data-inp="wizName"></label><label>Nombre corto (3-4)<input value="${esc(w.short)}" maxlength="4" data-inp="wizShort"></label>
          <label>Estadio<input value="${esc(w.stadium)}" maxlength="40" data-inp="wizStad"></label><label>Capacidad: <b>${w.cap.toLocaleString('es-AR')}</b><input type="range" min="8000" max="20000" step="1000" value="${w.cap}" data-inp="wizCap"></label>
          <div class="tlm-opts"><span>Forma</span>${['shield', 'round', 'diamond', 'banner'].map((x) => `<button class="${w.shape === x ? 'on' : ''}" data-act="wizShape" data-v="${x}">${{ shield: 'Escudo', round: 'Círculo', diamond: 'Rombo', banner: 'Banderín' }[x]}</button>`).join('')}</div>
          <div class="tlm-opts"><span>Diseño</span>${['half', 'stripes', 'band', 'sash', 'plain'].map((x) => `<button class="${w.pattern === x ? 'on' : ''}" data-act="wizPat" data-v="${x}">${{ half: 'Mitad', stripes: 'Franjas', band: 'Banda', sash: 'Diagonal', plain: 'Liso' }[x]}</button>`).join('')}</div>
          <label>Símbolo (1-2 letras)<input value="${esc(w.symbol)}" maxlength="2" data-inp="wizSym"></label>
          <label class="tlm-btn ghost sm">Subir escudo propio (PNG/JPG ≤ 250 KB)<input type="file" accept="image/png,image/jpeg,image/webp" hidden data-chg="wizUpload"></label>${w.upload ? '<button class="tlm-btn ghost sm" data-act="wizClearUpload">Quitar imagen</button>' : ''}</div></div>`
        : `<div class="tlm-takelist">${cl.map((c, i) => `<button class="tlm-take ${w.take === i ? 'on' : ''}" data-act="wizTake" data-i="${i}">${crestHTML({ name: c.name, id: c.name, shortName: c.shortName, primaryColor: c.primaryColor, secondaryColor: c.secondaryColor, crest: c.crest }, 34)}<span><b>${esc(c.name)}</b><small>${esc(c.stadium)} · reputación ${c.rep}</small></span></button>`).join('')}</div>`}
      <div class="tlm-wfoot"><label>Equipos en la liga: <b>${w.total}</b><input type="range" min="4" max="24" value="${w.total}" data-inp="wizTotal"></label><label>Semilla (opcional)<input value="${esc(w.seed)}" placeholder="aleatoria" data-inp="wizSeed"></label>
        <button class="tlm-btn primary big" data-act="startCareer">${w.mode === 'create' ? 'Fundar el club y entrar al mercado →' : 'Comenzar la carrera →'}</button></div>
      <p class="muted sm">${w.mode === 'create' ? `Recibís un presupuesto de ${M(TLM.DEFAULTS.userStartBudget)} y una plantilla vacía: tu primer once se arma en el mercado. Los jugadores existen una sola vez en el universo; no se pueden crear ni duplicar.` : 'Tomás la plantilla, contratos y finanzas del club elegido.'}</p></div></div>`;
  }
  const W = () => UI.wiz;
  A.wizMode = (el) => { W().mode = el.dataset.m; UI.render(); };
  A.wizShape = (el) => { W().shape = el.dataset.v; UI.render(); }; A.wizPat = (el) => { W().pattern = el.dataset.v; UI.render(); }; A.wizTake = (el) => { W().take = +el.dataset.i; UI.render(); };
  A.wizName = (el) => { W().name = el.value; if (!W().symbolTouched) { W().symbol = (el.value.trim()[0] || 'N').toUpperCase(); W().short = el.value.replace(/[^A-Za-zÁÉÍÓÚÑ]/g, '').slice(0, 3).toUpperCase() || 'NUE'; } liveCrest(); };
  A.wizShort = (el) => { W().short = el.value.toUpperCase(); }; A.wizStad = (el) => { W().stadium = el.value; }; A.wizSym = (el) => { W().symbol = el.value; W().symbolTouched = true; liveCrest(); };
  A.wizP = (el) => { W().p = el.value; liveCrest(); }; A.wizS = (el) => { W().s = el.value; liveCrest(); }; A.wizSeed = (el) => { W().seed = el.value; };
  A.wizCap = (el) => { W().cap = +el.value; const b = el.closest('label').querySelector('b'); if (b) b.textContent = W().cap.toLocaleString('es-AR'); };
  A.wizTotal = (el) => { W().total = +el.value; const b = el.closest('label').querySelector('b'); if (b) b.textContent = W().total; };
  function liveCrest() { const w = W(), host = document.querySelector('.tlm-crestbox .tlm-crest'); if (host && !w.upload) host.innerHTML = crestSVG({ primary: w.p, secondary: w.s, shape: w.shape, pattern: w.pattern, symbol: w.symbol }); }
  A.wizUpload = (el) => { const f = el.files[0]; if (!f) return; if (!/^image\/(png|jpeg|webp)$/.test(f.type) || f.size > 250 * 1024) { UI.toast('Usá PNG, JPG o WebP de hasta 250 KB.', 'bad'); return; } const r = new FileReader(); r.onload = () => { W().upload = r.result; UI.render(); }; r.readAsDataURL(f); };
  A.wizClearUpload = () => { W().upload = null; UI.render(); };
  A.importSave = (el) => { const f = el.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { UI.career = TLM.Career.fromJSON(r.result); UI.attach(); UI.go('home'); UI.toast('Carrera importada.', 'ok'); } catch (e) { UI.toast(e.message, 'bad'); } }; r.readAsText(f); };
  A.loadSave = (el) => { const c = TLM.Career.load(el.dataset.slot || undefined); if (!c) { UI.toast('No se pudo leer el guardado.', 'bad'); return; } UI.career = c; UI.attach(); UI.go('home'); };
  A.startCareer = () => {
    const w = W(), seed = w.seed ? Math.abs(hashStr(w.seed)) : (Date.now() >>> 0);
    try {
      let c;
      if (w.mode === 'create') {
        if (!w.name.trim()) { UI.toast('Poné un nombre al club.', 'bad'); return; }
        const crest = w.upload || svgURL(crestSVG({ primary: w.p, secondary: w.s, shape: w.shape, pattern: w.pattern, symbol: w.symbol }));
        c = TLM.Career.create({ seed, totalClubs: w.total, userClub: { name: w.name.trim(), shortName: (w.short || w.name.slice(0, 3)).trim(), primaryColor: w.p, secondaryColor: w.s, stadium: w.stadium.trim(), capacity: w.cap, crest } });
      } else c = TLM.Career.create({ seed, totalClubs: Math.max(w.total, w.take + 1), takeClub: w.take });
      UI.career = c; UI.attach(); c.save('auto'); UI.go(w.mode === 'create' ? 'transfers' : 'home', {});
      UI.toast(w.mode === 'create' ? '¡Club fundado! Armá tu primer once en el mercado.' : 'Carrera iniciada.', 'ok');
    } catch (e) { console.error(e); UI.toast('No se pudo crear la carrera: ' + e.message, 'bad'); }
  };
  UI.attach = () => { UI.career.bus.on('userMatch', () => {}); };

  // =====================================================================================
  //                                       HOME
  // =====================================================================================
  UI.screens.home = () => {
    const c = UI.career, s = c.state, u = c.user, f = c.userFixture(), nf = f || c.nextUserFixture(), tb = c.table(), me = tb.find((r) => r.clubId === u.id), comp = c.comp;
    const opp = nf ? s.clubs[nf.homeId === u.id ? nf.awayId : nf.homeId] : null, rec = TLM.recentResults(s, comp, u.id, 5);
    const rep = opp ? TLM.rivalReport(s, comp, opp.id, u.id) : null;
    const al = alerts(), news = s.news.slice(0, 7), pr = TLM.projection(s, u, 5);
    const inj = u.squad.filter((id) => s.players[id].injury).length, low = u.squad.filter((id) => s.players[id].fitness < 60).length;
    const offers = Object.values(s.market.offers).filter((o) => (o.toClubId === u.id || o.fromClubId === u.id) && ['OFFERED', 'NEGOTIATING'].includes(o.status));
    const top = tb.slice(0, 5);
    const seasonOver = c.seasonOver;
    return `<div class="tlm-grid home">
      <section class="tlm-panel hero ${nf ? 'hot' : ''}">${nf && !seasonOver ? `<small>${f ? 'MATCHDAY' : 'PRÓXIMO PARTIDO'} · ${esc(TLM.fixtureLabel(s, nf).comp.toUpperCase())} · ${esc(TLM.fixtureLabel(s, nf).round.toUpperCase())}</small><div class="tlm-vs"><div>${crestHTML(s.clubs[nf.homeId], 64)}<b>${esc(s.clubs[nf.homeId].name)}</b></div><span>VS</span><div>${crestHTML(s.clubs[nf.awayId], 64)}<b>${esc(s.clubs[nf.awayId].name)}</b></div></div>
        <p>${nf.homeId === u.id ? 'Local' : 'Visitante'} en ${esc(s.clubs[nf.homeId].stadium.name)} · Rival ${rep ? rep.position + '° con ' + rep.points + ' pts' : ''} · Su forma: ${formPills(rep ? rep.last5 : [])}</p>
        <div class="tlm-row"><button class="tlm-btn primary big" data-act="go" data-screen="matchday">Ir al Matchday →</button><button class="tlm-btn ghost" data-act="go" data-screen="tactics">Preparar táctica</button></div>` : `<small>TEMPORADA ${esc(TLM.seasonLabel(s))}</small><h2>${seasonOver ? 'Temporada terminada' : 'Sin partido esta jornada'}</h2><p>${seasonOver ? 'Cerrá la temporada desde el Matchday.' : 'Tu club descansa: aprovechá para fichar y ajustar.'}</p><button class="tlm-btn primary" data-act="go" data-screen="matchday">Matchday</button>`}</section>
      <section class="tlm-panel"><h3>Clasificación</h3><table class="tlm-table mini"><tbody>${top.map((r) => `<tr class="${r.clubId === u.id ? 'me' : ''}"><td>${r.pos}</td><td>${crestHTML(s.clubs[r.clubId], 18)} ${esc(s.clubs[r.clubId].name)}</td><td>${r.played}</td><td><b>${r.points}</b></td></tr>`).join('')}${me && me.pos > 5 ? `<tr class="me"><td>${me.pos}</td><td>${esc(u.name)}</td><td>${me.played}</td><td><b>${me.points}</b></td></tr>` : ''}</tbody></table><button class="tlm-link" data-act="go" data-screen="competition">Ver tabla completa →</button></section>
      <section class="tlm-panel"><h3>Tu club</h3><dl class="tlm-kv"><dt>Forma</dt><dd>${formPills(rec)}</dd><dt>Saldo</dt><dd class="${u.finances.balance < 0 ? 'neg' : ''}">${M(u.finances.balance)}</dd><dt>Próx. 5 jornadas</dt><dd class="${pr.balance < u.finances.balance ? 'neg' : 'pos'}">${M(pr.balance - u.finances.balance)}</dd><dt>Moral general</dt><dd>${moraleAvg()}/100</dd><dt>Plantilla</dt><dd>${u.squad.length} · ${inj} lesionados · ${low} con poco físico</dd><dt>Mercado</dt><dd>${offers.length} ofertas abiertas</dd></dl></section>
      <section class="tlm-panel wide"><h3>Alertas</h3>${al.length ? al.map((a) => `<button class="tlm-alert ${a.k}" data-act="go" data-screen="${a.go}" data-param='${JSON.stringify(a.p || {})}'>${esc(a.t)}<i>→</i></button>`).join('') : '<p class="muted">Todo en orden. ¡A jugar!</p>'}</section>
      <section class="tlm-panel wide"><h3>Noticias</h3><ul class="tlm-news">${news.map((n) => `<li class="k-${n.kind}"><small>${TLM.roundDateStr(n.season, n.round, UI.career.comp.calendar.length, true)} · J${n.round} · ${esc(n.kind)}</small>${esc(n.text)}</li>`).join('') || '<li class="muted">Sin novedades todavía.</li>'}</ul><button class="tlm-link" data-act="go" data-screen="news">Todas las noticias →</button></section></div>`;
  };

  // =====================================================================================
  //                                     NOTICIAS
  // =====================================================================================
  UI.screens.news = () => {
    const s = UI.career.state, kinds = ['all', 'cup', 'transfer', 'injury', 'result', 'player', 'streak', 'contract', 'ban', 'table', 'season', 'club', 'tactic'], k = UI.params.kind || 'all';
    const list = s.news.filter((n) => k === 'all' || n.kind === k);
    return `<h2 class="tlm-h">Noticias</h2><div class="tlm-tabs">${kinds.map((x) => `<button class="${k === x ? 'on' : ''}" data-act="go" data-screen="news" data-param='{"kind":"${x}"}'>${x === 'all' ? 'Todas' : x}</button>`).join('')}</div><ul class="tlm-news big">${list.map((n) => `<li class="k-${n.kind}"><small>${TLM.roundDateStr(n.season, n.round, UI.career.comp.calendar.length)} · J${n.round} · ${esc(n.kind)}</small>${esc(n.text)}</li>`).join('') || '<li class="muted">Nada por acá.</li>'}</ul>`;
  };

  // =====================================================================================
  //                                    COMPETICIÓN
  // =====================================================================================
  UI.screens.competition = () => {
    const c = UI.career, s = c.state, u = c.user, comp = c.comp, tab = UI.params.tab || 'table', tb = c.table();
    const players = Object.values(s.players).filter((p) => p.clubId && !s.clubs[p.clubId].foreign);
    const scorers = players.filter((p) => p.seasonStats.goals > 0).sort((a, b) => b.seasonStats.goals - a.seasonStats.goals || a.seasonStats.matches - b.seasonStats.matches).slice(0, 12);
    const assisters = players.filter((p) => p.seasonStats.assists > 0).sort((a, b) => b.seasonStats.assists - a.seasonStats.assists).slice(0, 8);
    const gks = players.filter((p) => p.seasonStats.cleanSheets > 0).sort((a, b) => b.seasonStats.cleanSheets - a.seasonStats.cleanSheets).slice(0, 5);
    const tabs = [['table', 'Tabla'], ['scorers', 'Goleadores'], ['history', 'Historial']];
    let body = '';
    if (tab === 'table') body = `<table class="tlm-table"><thead><tr><th>#</th><th>Club</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>PTS</th><th>Forma</th></tr></thead><tbody>${tb.map((r) => `<tr class="${r.clubId === u.id ? 'me' : ''}"><td>${r.pos}</td><td class="l">${crestHTML(s.clubs[r.clubId], 22)} ${esc(s.clubs[r.clubId].name)}</td><td>${r.played}</td><td>${r.won}</td><td>${r.drawn}</td><td>${r.lost}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.gd > 0 ? '+' : ''}${r.gd}</td><td><b>${r.points}</b></td><td>${formPills(r.form)}</td></tr>`).join('')}</tbody></table><p class="muted sm">Desempates: ${comp.tieBreakRules.join(' → ')} · ${comp.leagueSize} equipos · ${comp.rounds === 2 ? 'ida y vuelta' : 'una vuelta'}.</p>`;
    else if (tab === 'scorers') body = `<div class="tlm-cols"><div><h3>Goleadores</h3>${statTable(scorers, (p) => p.seasonStats.goals, 'G')}</div><div><h3>Asistencias</h3>${statTable(assisters, (p) => p.seasonStats.assists, 'A')}</div><div><h3>Vallas invictas</h3>${statTable(gks, (p) => p.seasonStats.cleanSheets, 'V')}</div></div>`;
    else body = s.history.seasons.length ? `<table class="tlm-table"><thead><tr><th>Temporada</th><th>Campeón</th><th>Pts</th><th>Goleador</th></tr></thead><tbody>${s.history.seasons.slice().reverse().map((h) => `<tr><td>${h.season}/${String((h.season + 1) % 100).padStart(2, '0')}</td><td class="l">${crestHTML(s.clubs[h.champion] || { name: h.championName }, 20)} ${esc(h.championName)}</td><td>${h.table[0].points}</td><td class="l">${h.scorers[0] ? esc(h.scorers[0].name) + ' (' + h.scorers[0].goals + ')' : '—'}</td></tr>`).join('')}</tbody></table>${records()}` : '<p class="muted">Todavía no hay temporadas completas en el historial.</p>';
    return `<h2 class="tlm-h">${crestHTML({ name: comp.name, crest: comp.crest, id: 'lg' }, 34)} ${esc(comp.name)}</h2><div class="tlm-tabs">${tabs.map(([id, l]) => `<button class="${tab === id ? 'on' : ''}" data-act="go" data-screen="competition" data-param='{"tab":"${id}"}'>${l}</button>`).join('')}</div>${body}`;
  };
  function statTable(list, val, lab) { const s = UI.career.state; return `<table class="tlm-table mini"><tbody>${list.map((p, i) => `<tr class="${p.clubId === s.currentClubId ? 'me' : ''}"><td>${i + 1}</td><td class="l"><a data-act="playerModal" data-pid="${p.id}">${esc(p.canonicalName)}</a><small> ${esc(s.clubs[p.clubId].shortName)}</small></td><td><b>${val(p)}</b> ${lab}</td></tr>`).join('') || '<tr><td class="muted">Sin datos</td></tr>'}</tbody></table>`; }
  function records() { const r = UI.career.state.history.records, o = []; if (r.topScorer) o.push(`Máximo goleador en una temporada: <b>${esc(r.topScorer.name)}</b> (${r.topScorer.goals}, ${r.topScorer.season})`); if (r.mostPoints) o.push(`Más puntos: <b>${esc(r.mostPoints.club)}</b> (${r.mostPoints.points}, ${r.mostPoints.season})`); return o.length ? `<h3>Récords</h3><ul class="tlm-news">${o.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''; }

  // =====================================================================================
  //                                    CALENDARIO
  // =====================================================================================
  UI.screens.calendar = () => {
    const c = UI.career, s = c.state, u = c.user.id, comp = c.comp, cur = c.round, sel = UI.params.round || cur || 1;
    const fx = TLM.fixturesOf(s, comp, sel), bye = comp.byes[sel - 1];
    // fechas de La Cupidité: el corte de la clasificación y cada ronda (entre semana, después de la jornada indicada)
    TLM.cupEnsure(s); const cup = s.cups.cupidite, cupMarks = {}, cupRows = [];
    if (cup && cup.status !== 'skipped' && cup.slots) {
      const names = TLM.cupBracket(s, 'cupidite').map((b) => b.name);
      if (cup.format === 2 && cup.status === 'qualifying') { cupMarks[cup.cutRound] = 'Cierra la clasificación de La Cupidité'; cupRows.push([cup.cutRound, 'Cierre de la clasificación', TLM.roundDateStr(s.season, cup.cutRound, comp.calendar.length), false]); }
      cup.slots.forEach((sl, i) => { const nm = names[i] || 'Ronda ' + (i + 1), done = !!(cup.rounds[i] && cup.rounds[i].done); cupMarks[sl] = (cupMarks[sl] ? cupMarks[sl] + ' · ' : '') + 'La Cupidité: ' + nm; cupRows.push([sl, nm, TLM.cupDateStr(s, cup, i), done]); });
    }
    const strip = comp.calendar.map((_, i) => { const r = i + 1, mine = TLM.fixturesOf(s, comp, r).find((f) => f.homeId === u || f.awayId === u); const res = mine && mine.status === 'played' ? (mine.result.hg === mine.result.ag ? 'D' : (mine.homeId === u) === (mine.result.hg > mine.result.ag) ? 'W' : 'L') : ''; return `<button class="${r === sel ? 'on' : ''} ${r === cur ? 'cur' : ''} ${res} ${cupMarks[r] ? 'cupmark' : ''}" ${cupMarks[r] ? `title="${esc(cupMarks[r])}"` : ''} data-act="go" data-screen="calendar" data-param='{"round":${r}}'>${r}</button>`; }).join('');
    return `<h2 class="tlm-h">Calendario · ${esc(TLM.seasonLabel(s))}</h2><div class="tlm-rounds">${strip}</div><h3>Jornada ${sel} · ${TLM.roundDateStr(s.season, sel, comp.calendar.length)} ${sel === cur ? '<span class="tlm-pill on">ACTUAL</span>' : ''}</h3><table class="tlm-table"><tbody>${fx.map((f) => `<tr class="${f.homeId === u || f.awayId === u ? 'me' : ''}"><td class="r">${esc(s.clubs[f.homeId].name)} ${crestHTML(s.clubs[f.homeId], 22)}</td><td class="sc">${f.status === 'played' ? `<b>${f.result.hg} – ${f.result.ag}</b>` : 'vs'}</td><td class="l">${crestHTML(s.clubs[f.awayId], 22)} ${esc(s.clubs[f.awayId].name)}</td><td>${f.status === 'played' && f.result.attendance ? `<small>${f.result.attendance.toLocaleString('es-AR')} esp.</small>` : ''}</td></tr>`).join('')}</tbody></table>${bye ? `<p class="muted">Descansa: <b>${esc(s.clubs[bye].name)}</b></p>` : ''}${cupRows.length ? `<section class="tlm-panel cal-cup"><h3>La Cupidité · fechas</h3><table class="tlm-table mini"><tbody>${cupRows.map(([r, nm, d, done]) => `<tr class="${done ? 'muted' : ''}"><td class="l"><b>${esc(nm)}</b></td><td class="l">${esc(d)}</td><td class="l muted">${r === (cup.cutRound) && nm.startsWith('Cierre') ? 'tras la jornada ' + r : 'tras la jornada ' + r}</td><td>${done ? 'jugada' : ''}</td></tr>`).join('')}</tbody></table><p class="muted sm">Los botones marcados en verde en la barra de jornadas indican cuándo se intercala una fecha de la copa.</p></section>` : ''}`;
  };

  // =====================================================================================
  //                                       CLUB
  // =====================================================================================
  UI.screens.club = () => {
    const c = UI.career, s = c.state, u = c.user, tab = UI.params.tab || 'finance';
    const tabs = [['finance', 'Finanzas'], ['stadium', 'Estadio'], ['training', 'Entrenamiento'], ['identity', 'Identidad'], ['history', 'Historia']];
    let body = '';
    if (tab === 'finance') {
      const pr = TLM.projection(s, u, 5), wb = TLM.wageBill(s, u), st = TLM.financeStatus(s, u);
      body = `<div class="tlm-grid c3"><div class="tlm-panel"><small>SALDO</small><div class="tlm-big ${u.finances.balance < 0 ? 'neg' : ''}">${M(u.finances.balance)}</div>${st !== 'ok' ? pill(st === 'crisis' ? 'CRISIS' : 'EN NÚMEROS ROJOS', 'bad') : pill('Saludable', 'ok')}</div>
        <div class="tlm-panel"><small>ESTA TEMPORADA</small><dl class="tlm-kv"><dt>Ingresos</dt><dd class="pos">${M(u.finances.seasonIncome)}</dd><dt>Gastos</dt><dd class="neg">${M(u.finances.seasonExpense)}</dd><dt>Masa salarial</dt><dd>${M(wb)} / año</dd></dl></div>
        <div class="tlm-panel"><small>PROYECCIÓN 5 JORNADAS</small><dl class="tlm-kv"><dt>Ingresos</dt><dd class="pos">${M(pr.income)}</dd><dt>Gastos</dt><dd class="neg">${M(pr.expense)}</dd><dt>Saldo previsto</dt><dd class="${pr.balance < 0 ? 'neg' : ''}">${M(pr.balance)}</dd></dl></div></div>
        <h3>Movimientos</h3><table class="tlm-table"><thead><tr><th>T/J</th><th>Concepto</th><th>Importe</th><th>Saldo</th></tr></thead><tbody>${u.finances.ledger.slice(0, 40).map((t) => `<tr><td>${t.season % 100}/${t.round}</td><td class="l">${esc(t.desc)}</td><td class="${t.amount < 0 ? 'neg' : 'pos'}">${M(t.amount)}</td><td>${M(t.balance)}</td></tr>`).join('')}</tbody></table><p class="muted sm">Gastar por encima del saldo tiene consecuencias: sin fichajes, moral en caída, menos público y, en crisis, la directiva vende jugadores.</p>`;
    } else if (tab === 'stadium') {
      const nx = TLM.stadiumUpgradeInfo(u), att = TLM.attendance(s, u, s.clubs[Object.keys(s.clubs).find((k) => k !== u.id)], 0);
      body = `<div class="tlm-grid c2"><div class="tlm-panel"><h3>${esc(u.stadium.name)}</h3><dl class="tlm-kv"><dt>Nivel</dt><dd>${u.stadium.level} / 5</dd><dt>Capacidad</dt><dd>${u.stadium.capacity.toLocaleString('es-AR')}</dd><dt>Precio de entrada</dt><dd>€${TLM.ticketPrice(u).toFixed(1)}</dd><dt>Mantenimiento</dt><dd>${M(TLM.maintenancePerRound(u))} / jornada</dd><dt>Ingreso potencial local</dt><dd>${M(att * TLM.ticketPrice(u))}</dd></dl></div>
        <div class="tlm-panel"><h3>Mejora</h3>${nx ? `<p>Nivel ${nx.level}: <b>+${nx.add.toLocaleString('es-AR')}</b> espectadores.</p><p>Costo <b>${M(nx.cost)}</b></p><button class="tlm-btn primary" data-act="upgradeStadium" ${TLM.canSpend(u, nx.cost) ? '' : 'disabled'}>Ampliar estadio</button>${TLM.canSpend(u, nx.cost) ? '' : '<p class="neg sm">Saldo insuficiente.</p>'}` : '<p>Tu estadio está al máximo nivel.</p>'}</div></div>`;
    } else if (tab === 'training') {
      const tr = u.training;
      body = `<p class="muted">El cuerpo técnico trabaja automáticamente; vos definís el foco. El entrenamiento individual mejora atributos de a poco; el de equipo da un bonus temporal (hasta +${3}) en el partido tras varias jornadas seguidas con el mismo foco.</p><div class="tlm-grid c2"><div class="tlm-panel"><h3>Individual</h3><div class="tlm-opts wrap">${TLM.TRAINING.individual.map(([id, l]) => `<button class="${tr.individual === id ? 'on' : ''}" data-act="setTrain" data-k="individual" data-v="${id}">${l}</button>`).join('')}</div></div><div class="tlm-panel"><h3>De equipo</h3><div class="tlm-opts wrap">${TLM.TRAINING.team.map(([id, l]) => `<button class="${tr.team === id ? 'on' : ''}" data-act="setTrain" data-k="team" data-v="${id}">${l}</button>`).join('')}</div><p>Bonus actual: <b>+${(tr.teamBoost || 0).toFixed(2)}</b> en ${TLM.TRAINING.teamEffect[tr.team].map((k) => TLM.STAT_LABEL[k]).join(' y ')}</p>${bar(tr.teamBoost || 0, 3)}</div></div>`;
    } else if (tab === 'identity') {
      body = `<div class="tlm-panel"><div class="tlm-fields"><label>Nombre<input id="idName" value="${esc(u.name)}" maxlength="32"></label><label>Nombre corto<input id="idShort" value="${esc(u.shortName)}" maxlength="4"></label><label>Estadio<input id="idStad" value="${esc(u.stadium.name)}" maxlength="40"></label><label>Color principal<input id="idP" type="color" value="${u.primaryColor}"></label><label>Color secundario<input id="idS" type="color" value="${u.secondaryColor}"></label></div><button class="tlm-btn primary" data-act="saveIdentity">Guardar identidad</button><p class="muted sm">El editor sólo toca al club. Los jugadores no se pueden crear ni duplicar: el universo es único.</p></div>`;
    } else {
      body = `<dl class="tlm-kv"><dt>Títulos</dt><dd>${u.history.titles}</dd><dt>Mejor puesto</dt><dd>${u.history.bestFinish || '—'}</dd><dt>Reputación</dt><dd>${Math.round(u.reputation)}/100</dd></dl><table class="tlm-table"><thead><tr><th>Temporada</th><th>Pos</th><th>Pts</th><th>GF</th><th>GC</th></tr></thead><tbody>${u.history.seasons.slice().reverse().map((h) => `<tr><td>${h.season}</td><td>${h.pos}°</td><td>${h.points}</td><td>${h.gf}</td><td>${h.ga}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">Sin temporadas completas.</td></tr>'}</tbody></table>`;
    }
    return `<h2 class="tlm-h">${crestHTML(u, 36)} ${esc(u.name)}</h2><div class="tlm-tabs">${tabs.map(([id, l]) => `<button class="${tab === id ? 'on' : ''}" data-act="go" data-screen="club" data-param='{"tab":"${id}"}'>${l}</button>`).join('')}</div>${body}`;
  };
  A.upgradeStadium = () => { const r = TLM.upgradeStadium(UI.career.state, UI.career.user); UI.toast(r.ok ? 'Estadio ampliado.' : r.reason, r.ok ? 'ok' : 'bad'); UI.render(); };
  A.setTrain = (el) => { const u = UI.career.user; TLM.setTraining(UI.career.state, u, el.dataset.k === 'individual' ? el.dataset.v : null, el.dataset.k === 'team' ? el.dataset.v : null); UI.render(); };
  A.saveIdentity = () => { const c = UI.career; TLM.editClub(c.state, c.user.id, { name: $('idName').value.trim() || c.user.name, shortName: $('idShort').value.trim() || c.user.shortName, stadium: $('idStad').value.trim() || c.user.stadium.name, primaryColor: $('idP').value, secondaryColor: $('idS').value }); UI.toast('Identidad actualizada.', 'ok'); UI.render(); };

  // ---------- montaje ----------
  UI.mount = () => {
    if (UI.root) return;
    const r = document.createElement('div'); r.id = 'tlm-root'; r.className = 'tlm'; document.body.appendChild(r); UI.root = r;
    const nav = document.querySelector('.site-header nav');
    if (nav) { const b = document.createElement('button'); b.id = 'tlm-open'; b.className = 'tlm-navbtn'; b.innerHTML = '★ Modo carrera'; b.onclick = () => UI.show(); nav.insertAdjacentElement('afterbegin', b); }
    const saved = TLM.Career.load('auto'); if (saved) UI.career = saved; UI.render();
  };
  UI.init = async () => { await TLM.Bridge.ready(); UI.mount(); };
  g.lfoManagerPlayers = () => (UI.career ? Object.keys(UI.career.state.players).map((pid) => UI.cardFor(pid)).filter(Boolean) : []);
  g.TLM_UI = UI;
})(typeof globalThis !== 'undefined' ? globalThis : this);
