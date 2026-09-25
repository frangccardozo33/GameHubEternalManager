/* LFO MANAGER — UI de equipo: SQUAD (plantilla + ficha de jugador con carta) y TACTICS (once visual, formación,
   diales, plan de partido, instrucciones). Todo escribe sobre las mismas entidades que consume el motor. */
(function (g) {
  'use strict';
  const TLM = g.TLM, UI = TLM.UI; if (!UI) return;
  const { esc, M, bar, pill, crest, formPills } = { esc: UI.esc, M: UI.M, bar: UI.bar, pill: UI.pill, crest: UI.crest, formPills: UI.formPills };
  const A = UI.actions, S = () => UI.career.state, U = () => UI.career.user;
  const ROLES = [['all', 'Todos'], ['GK', 'Porteros'], ['DEF', 'Defensas'], ['MID', 'Medios'], ['FWD', 'Delanteros']];
  const stateTag = (p, st) => (p.injury ? pill(`Lesión ${p.injury.matchdays}J`, 'bad') : p.suspension > 0 ? pill('Sancionado', 'warn') : TLM.transferStatus(st, p.id) === 'OFFERED' ? pill('Oferta', 'info') : st.market.listings[p.id] ? pill('En venta', 'info') : '');
  const conTag = (st, p) => { const cs = TLM.contractStatus(st, p), left = p.contract.endSeason - st.season; return cs === 'expiring' ? pill('Vence', 'warn') : `${p.contract.endSeason}${left <= 1 ? ' ⚠' : ''}`; };
  UI.stateTag = stateTag;

  // =====================================================================================
  //                                       SQUAD
  // =====================================================================================
  UI.sq = { role: 'all', sort: 'ovr', dir: -1, q: '' };
  UI.screens.squad = () => {
    const c = UI.career, s = c.state, u = c.user, q = UI.sq;
    let list = u.squad.map((id) => s.players[id]).filter((p) => (q.role === 'all' || TLM.roleOf(p.primaryPosition) === q.role) && (!q.q || p.canonicalName.toLowerCase().includes(q.q.toLowerCase())));
    const key = { ovr: (p) => p.overall, pot: (p) => p.potential, age: (p) => p.age, form: (p) => p.form, morale: (p) => p.morale, fit: (p) => p.fitness, value: (p) => p.marketValue, sal: (p) => p.contract.salary, name: (p) => p.canonicalName, pos: (p) => TLM.POSITIONS.indexOf(p.primaryPosition), con: (p) => p.contract.endSeason }[q.sort] || ((p) => p.overall);
    list.sort((a, b) => { const x = key(a), y = key(b); return (typeof x === 'string' ? x.localeCompare(y) : x - y) * q.dir; });
    const th = (k, l, cls) => `<th class="${cls || ''} sortable ${q.sort === k ? 'on' : ''}" data-act="sortSquad" data-k="${k}">${l}${q.sort === k ? (q.dir < 0 ? ' ▾' : ' ▴') : ''}</th>`;
    const xi = new Set(u.lineup.xi), bench = new Set(u.lineup.bench);
    const empty = !u.squad.length;
    return `<h2 class="tlm-h">Plantilla <small>${u.squad.length} jugadores · masa salarial ${M(TLM.wageBill(s, u))}/año</small></h2>
      ${empty ? `<div class="tlm-panel hot"><h3>Tu plantilla está vacía</h3><p>Tu club recién fundado no tiene jugadores. Andá al mercado: hay agentes libres y jugadores transferibles de otros clubes. Necesitás al menos 11 para jugar.</p><button class="tlm-btn primary" data-act="go" data-screen="transfers">Ir al mercado →</button></div>` : ''}
      <div class="tlm-toolbar"><div class="tlm-tabs">${ROLES.map(([id, l]) => `<button class="${q.role === id ? 'on' : ''}" data-act="sqRole" data-v="${id}">${l}</button>`).join('')}</div><input placeholder="Buscar jugador…" value="${esc(q.q)}" data-inp="sqSearch"></div>
      <div class="tlm-scroll"><table class="tlm-table players"><thead><tr><th></th>${th('name', 'Jugador', 'l')}${th('pos', 'Pos')}${th('age', 'Edad')}${th('ovr', 'OVR')}${th('pot', 'POT')}${th('form', 'Forma')}${th('morale', 'Moral')}${th('fit', 'Físico')}${th('con', 'Contrato')}${th('sal', 'Salario')}${th('value', 'Valor')}<th>Estado</th></tr></thead><tbody>${list.map((p) => `<tr data-act="playerModal" data-pid="${p.id}" class="${xi.has(p.id) ? 'xi' : bench.has(p.id) ? 'bench' : ''}"><td><span class="tlm-num">${p.number}</span></td><td class="l"><b>${esc(p.canonicalName)}</b>${xi.has(p.id) ? '<small class="tag">XI</small>' : bench.has(p.id) ? '<small class="tag">BAN</small>' : ''} ${p.card.edition !== 'potrero' ? `<small class="ed" title="Edición ${esc(p.card.edition)}">★</small>` : ''}</td><td><span class="tlm-pos ${UI.posClass(p.primaryPosition)}">${p.primaryPosition}</span></td><td>${p.age}</td><td><b class="ovr ${UI.tone(p.overall)}">${p.overall}</b></td><td>${p.age <= 24 ? p.potential : '<span class="muted">—</span>'}</td><td>${bar(p.form, 100, p.form >= 60 ? 'ok' : p.form >= 40 ? 'warn' : 'bad')}</td><td>${bar(p.morale, 100, p.morale >= 60 ? 'ok' : p.morale >= 40 ? 'warn' : 'bad')}</td><td>${bar(p.fitness, 100, p.fitness >= 70 ? 'ok' : p.fitness >= 50 ? 'warn' : 'bad')}</td><td>${conTag(s, p)}</td><td>${M(p.contract.salary)}</td><td>${M(p.marketValue)}</td><td>${stateTag(p, s)}</td></tr>`).join('')}</tbody></table></div>`;
  };
  A.sortSquad = (el) => { const q = UI.sq, k = el.dataset.k; if (q.sort === k) q.dir *= -1; else { q.sort = k; q.dir = k === 'name' || k === 'pos' || k === 'age' || k === 'con' ? 1 : -1; } UI.render(); };
  A.sqRole = (el) => { UI.sq.role = el.dataset.v; UI.render(); };
  A.sqSearch = (el) => { UI.sq.q = el.value; clearTimeout(UI._sqT); UI._sqT = setTimeout(() => { UI.render(); const i = document.querySelector('[data-inp="sqSearch"]'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 250); };

  // ---------- ficha de jugador ----------
  const attrBars = (p, hidden) => TLM.STAT_KEYS.map((k) => `<div class="tlm-attr"><span>${TLM.STAT_LABEL[k]}</span>${hidden ? '<em>?</em>' : bar(p.attributes[k], 99, UI.tone(p.attributes[k]))}<b>${hidden ? '' : p.attributes[k]}</b></div>`).join('');
  A.playerModal = (el) => {
    const pid = el.dataset.pid, s = S(), p = s.players[pid], u = U(), mine = p.clubId === u.id, club = p.clubId ? s.clubs[p.clubId] : null;
    const listed = s.market.listings[pid], free = s.market.freeAgents.includes(pid), known = mine || listed || free || Object.values(s.scoutReports).some((r) => r.rows.some((x) => x.pid === pid));
    const st = p.seasonStats, ct = p.careerTotals, avgR = st.ratingN ? (st.ratingSum / st.ratingN).toFixed(1) : '—';
    const hist = p.careerHistory.slice(-8).reverse();
    let actions = '';
    if (mine) {
      const dem = TLM.contractDemand(s, p, u, true), sellPrice = Math.round(Math.min(p.marketValue, p.marketValue) * 0.75);
      actions = `<div class="tlm-box"><h4>Contrato</h4><p>Hasta <b>${p.contract.endSeason}</b> · Salario <b>${M(p.contract.salary)}</b>/año · Pide <b>${M(dem)}</b> para renovar</p>
        <div class="tlm-row"><input id="rnSal" type="number" step="10000" value="${dem}" style="width:130px"><select id="rnYrs">${[1, 2, 3, 4].map((y) => `<option ${y === 2 ? 'selected' : ''}>${y}</option>`).join('')}</select> años<button class="tlm-btn sm" data-act="renew" data-pid="${pid}">Renovar</button></div></div>
        <div class="tlm-box"><h4>Mercado</h4>${listed ? `<p>En venta por <b>${M(listed.askingPrice)}</b>.</p><button class="tlm-btn sm" data-act="unlist" data-pid="${pid}">Retirar de la venta</button>` : `<div class="tlm-row"><input id="lsPrice" type="number" step="50000" value="${Math.round(p.marketValue * 1.1)}" style="width:130px"><button class="tlm-btn sm" data-act="list" data-pid="${pid}">Poner en venta</button></div>`}
        <button class="tlm-btn sm danger" data-act="sellNow" data-pid="${pid}">Vender ya al mejor postor (~${M(sellPrice)})</button></div>
        <div class="tlm-box"><h4>Cromo · ediciones especiales</h4><p class="muted sm">Es el mismo jugador; sólo cambia su carta. Actual: <b>${esc((TLM.EDITIONS.find((e) => e.id === p.card.edition) || {}).name)}</b>.</p><div class="tlm-row"><select id="edSel">${TLM.EDITIONS.map((e) => `<option value="${e.id}" ${e.id === p.card.edition ? 'selected' : ''}>${esc(e.name)} — ${M(Math.max(20000, p.marketValue * e.cost))}</option>`).join('')}</select><button class="tlm-btn sm" data-act="buyEdition" data-pid="${pid}">Cambiar edición</button></div></div>`;
    } else if (club || free) {
      actions = `<div class="tlm-box"><h4>${free ? 'Agente libre' : 'Fichaje'}</h4>${free ? `<p>Prima de fichaje ~${M(p.marketValue * 0.12)}, sin traspaso.</p>` : listed ? `<p>En venta por <b>${M(listed.askingPrice)}</b> (${esc(club.name)}).</p>` : `<p>${esc(club.name)} no lo tiene en venta: podés ofertar (valor estimado ${M(p.marketValue)}).</p>`}<button class="tlm-btn primary" data-act="buyModal" data-pid="${pid}">${free ? 'Ficharlo' : listed ? 'Comprar / ofertar' : 'Hacer una oferta'}</button></div>`;
    }
    const d = UI.modal(`<div class="tlm-pmodal"><div class="tlm-pcard"><div data-card-pid="${pid}" class="tlm-cardhost">Cargando carta…</div></div><div class="tlm-pinfo"><h2>${esc(p.canonicalName)}</h2><p class="muted">${esc(TLM.POS_LABEL[p.primaryPosition])} (${p.primaryPosition}${p.secondaryPositions.length ? ' / ' + p.secondaryPositions.join(', ') : ''}) · ${p.age} años · ${UI.flag(p.nationality, 13)} ${esc(p.nationality)} · ${club ? esc(club.name) : 'Agente libre'}</p>
      <div class="tlm-row">${pill('OVR ' + p.overall, UI.tone(p.overall))} ${p.age <= 24 ? pill('POT ' + p.potential) : ''} ${pill('Valor ' + M(p.marketValue))} ${stateTag(p, s)} ${p.card.edition !== 'potrero' ? pill('Edición ' + (TLM.EDITIONS.find((e) => e.id === p.card.edition) || {}).name, 'info') : ''}</div>
      <div class="tlm-attrs">${attrBars(p, !known)}${!known ? '<p class="muted sm">Sin informe de scouting: atributos ocultos. Pedí un informe en SCOUT.</p>' : ''}</div>
      ${mine ? `<div class="tlm-row wrap"><span>Forma ${bar(p.form, 100)}</span><span>Moral ${bar(p.morale, 100)}</span><span>Físico ${bar(p.fitness, 100)}</span></div>` : ''}
      <table class="tlm-table mini"><thead><tr><th></th><th>PJ</th><th>Min</th><th>G</th><th>A</th><th>Amar.</th><th>Rojas</th><th>Nota</th></tr></thead><tbody><tr><td class="l">Temporada</td><td>${st.matches}</td><td>${st.minutes}</td><td>${st.goals}</td><td>${st.assists}</td><td>${st.yellow}</td><td>${st.red}</td><td>${avgR}</td></tr><tr><td class="l">Carrera</td><td>${ct.matches + st.matches}</td><td>${ct.minutes + st.minutes}</td><td>${ct.goals + st.goals}</td><td>${ct.assists + st.assists}</td><td>${ct.yellow + st.yellow}</td><td>${ct.red + st.red}</td><td>—</td></tr></tbody></table>
      ${hist.length ? `<details><summary>Historial por club (${p.careerHistory.length})</summary><table class="tlm-table mini"><thead><tr><th>Temp.</th><th>Club</th><th>PJ</th><th>G</th><th>A</th><th>Min</th><th>Nota</th></tr></thead><tbody>${hist.map((h) => `<tr><td>${h.season}</td><td class="l">${esc(h.club)}</td><td>${h.matches}</td><td>${h.goals}</td><td>${h.assists}</td><td>${h.minutes}</td><td>${h.rating || '—'}</td></tr>`).join('')}</tbody></table></details>` : ''}
      <div id="tlm-pactions">${actions}</div></div></div>`, 'wide');
    void d;
  };
  const refreshModal = (pid) => { const m = document.querySelector('.tlm-modal-bg'); if (m) m.remove(); UI.modalEl = null; A.playerModal({ dataset: { pid } }); UI.render(); };
  A.renew = (el) => { const r = TLM.renewContract(S(), U().id, el.dataset.pid, +document.getElementById('rnSal').value, +document.getElementById('rnYrs').value); UI.toast(r.ok ? 'Contrato renovado.' : r.reason, r.ok ? 'ok' : 'bad'); if (r.ok) refreshModal(el.dataset.pid); else if (r.counter) document.getElementById('rnSal').value = r.counter; };
  A.list = (el) => { const r = TLM.listPlayer(S(), U().id, el.dataset.pid, +document.getElementById('lsPrice').value); UI.toast(r.ok ? 'Puesto en venta por ' + M(r.price) + '.' : r.reason, r.ok ? 'ok' : 'bad'); refreshModal(el.dataset.pid); };
  A.unlist = (el) => { TLM.unlistPlayer(S(), el.dataset.pid); refreshModal(el.dataset.pid); };
  A.sellNow = (el) => { if (!confirm('¿Vender ahora? Se vende al mejor postor por debajo de su valor.')) return; const r = TLM.sellNow(S(), U().id, el.dataset.pid); UI.toast(r.ok ? 'Vendido por ' + M(r.rec.fee) + '.' : r.reason, r.ok ? 'ok' : 'bad'); if (r.ok) { UI.closeModal(); UI.render(); } };
  A.buyEdition = (el) => { const r = TLM.buyEdition(S(), U().id, el.dataset.pid, document.getElementById('edSel').value); UI.toast(r.ok ? 'Edición aplicada (' + M(r.cost) + ').' : r.reason, r.ok ? 'ok' : 'bad'); if (r.ok) { g.__tlmCardBust = 1; refreshModal(el.dataset.pid); } };

  // =====================================================================================
  //                                      TACTICS
  // =====================================================================================
  UI.tac = { sel: null };
  const refName = (r) => (r.xi != null ? 'xi' + r.xi : r.bench != null ? 'b' + r.bench : 'r' + r.pid);
  function pitchChips(u, s) {
    const f = u.tactics.formation, slots = TLM.FORMATIONS[f], xy = TLM.FORMATION_XY[f], sel = UI.tac.sel;
    return u.lineup.xi.map((id, i) => {
      const p = id && s.players[id], top = 50 - (xy[i][0] / 52.5) * 44, left = 50 + (xy[i][1] / 34) * 44;
      const comp = p ? TLM.compat(slots[i], p.primaryPosition, p.secondaryPositions) : 0;
      return `<button class="tlm-slot ${sel && sel.xi === i ? 'sel' : ''} ${p ? '' : 'empty'}" style="top:${top}%;left:${left}%" data-act="tacPick" data-kind="xi" data-i="${i}">${p ? `<em>${p.number}</em><b>${esc(TLM.shortName(p.canonicalName))}</b><i class="${UI.tone(p.overall)}">${p.overall}</i><span class="pos ${comp < 0.9 ? 'off' : ''}">${slots[i]}${comp < 0.9 ? '!' : ''}</span><span class="fit">${bar(p.fitness, 100, p.fitness >= 70 ? 'ok' : p.fitness >= 50 ? 'warn' : 'bad')}</span>` : `<em>+</em><span class="pos">${slots[i]}</span>`}</button>`;
    }).join('');
  }
  const chip = (p, ref) => `<button class="tlm-pchip ${UI.tac.sel && refName(UI.tac.sel) === refName(ref) ? 'sel' : ''}" data-act="tacPick" data-kind="${ref.bench != null ? 'bench' : 'res'}" data-i="${ref.bench != null ? ref.bench : ''}" data-pid="${p.id}"><em>${p.number}</em><b>${esc(TLM.shortName(p.canonicalName))}</b><span class="tlm-pos ${UI.posClass(p.primaryPosition)}">${p.primaryPosition}</span><i class="${UI.tone(p.overall)}">${p.overall}</i>${p.injury ? '<u title="Lesionado">✚</u>' : ''}</button>`;
  // Reglas de juego colectivo (delanteros/defensas/juego de pases, etc.): las mismas del panel "Tácticas en vivo", guardadas en la carrera (u.rules) y aplicadas al equipo del usuario al empezar cada partido.
  const rulesOf = (u) => { const T = window.LFO_TAC, out = T ? T.defaults() : {}; for (const id in (u.rules || {})) if (out[id]) { out[id].on = !!u.rules[id].on; Object.assign(out[id].p, u.rules[id].p || {}); } return out; };
  const rulesPanel = (u) => {
    const T = window.LFO_TAC; if (!T) return '<p class="muted sm">Las reglas de juego se cargan con el motor 3D.</p>';
    const rs = rulesOf(u); let h = '';
    for (const g of Object.keys(T.GROUPS)) {
      h += `<h4>${T.GROUPS[g]}</h4>`;
      for (const r of T.RULES.filter((x) => x.group === g)) { const st = rs[r.id];
        h += `<div class="tlm-rule${st.on ? ' on' : ''}"><label class="tlm-check"><input type="checkbox" data-chg="ruleOn" data-id="${r.id}" ${st.on ? 'checked' : ''}> <b>${r.label}</b></label><p class="muted sm">${r.desc}</p>` +
          (r.params.length ? `<div class="tlm-rparams">${r.params.map((q) => `<label>${q.label}<input type="number" data-chg="ruleParam" data-id="${r.id}" data-k="${q.k}" min="${q.min}" max="${q.max}" step="${q.step}" value="${st.p[q.k]}"></label>`).join('')}</div>` : '') + '</div>'; }
    }
    return h + '<button class="tlm-btn ghost sm" data-act="ruleReset">Restaurar valores de fábrica</button>';
  };
  UI.screens.tactics = () => {
    const c = UI.career, s = c.state, u = c.user, t = u.tactics, lr = TLM.lineRatings(s, u), probs = TLM.lineupProblems(s, u), sel = UI.tac.sel;
    const inSquad = new Set(u.lineup.xi.concat(u.lineup.bench));
    const res = u.squad.map((id) => s.players[id]).filter((p) => !inSquad.has(p.id)).sort((a, b) => b.overall - a.overall);
    const selP = sel ? (sel.xi != null ? s.players[u.lineup.xi[sel.xi]] : sel.bench != null ? s.players[u.lineup.bench[sel.bench]] : s.players[sel.pid]) : null;
    const opts = selP && sel.xi != null ? TLM.instructionOptions(TLM.FORMATIONS[t.formation][sel.xi]) : null;
    const dials = Object.keys(TLM.TACTIC_OPTIONS).map((k) => `<div class="tlm-dial"><span>${TLM.TACTIC_LABEL[k]}</span><div class="tlm-opts">${TLM.TACTIC_OPTIONS[k].map(([v, l]) => `<button class="${t[k] === v ? 'on' : ''}" data-act="tacSet" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div></div>`).join('');
    const plan = (k, lab) => `<label>${lab}<select data-chg="planSet" data-k="${k}">${TLM.PLAN_LABELS[k].map(([v, l]) => `<option value="${v}" ${(k === 'fromMinute' ? u.plan.fromMinute.mode : u.plan[k]) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
    const rb = (l, v) => `<div class="tlm-rt"><span>${l}</span>${bar(v, 99, UI.tone(v))}<b>${Math.round(v)}</b></div>`;
    return `<h2 class="tlm-h">Tácticas <small>${t.formation} · ${u.lineupMode === 'auto' ? 'once automático' : 'once manual'}</small></h2>
      ${probs.length ? `<div class="tlm-alert bad">${esc(probs[0])}</div>` : ''}
      <div class="tlm-tgrid"><section class="tlm-panel"><div class="tlm-row wrap">${Object.keys(TLM.FORMATIONS).map((f) => `<button class="tlm-btn sm ${t.formation === f ? 'primary' : 'ghost'}" data-act="tacFormation" data-f="${f}">${f}</button>`).join('')}<button class="tlm-btn sm" data-act="tacAuto">Mejor once</button></div>
        <div class="tlm-pitch">${pitchChips(u, s)}</div><p class="muted sm">Tocá un jugador y después otro puesto o suplente para intercambiarlos. ${sel ? '<b>Seleccionado: ' + esc(selP ? selP.canonicalName : 'puesto vacío') + '</b>' : ''}</p>
        <h4>Banquillo (${u.lineup.bench.length}/${TLM.DEFAULTS.maxBench})</h4><div class="tlm-chips">${u.lineup.bench.map((id, i) => chip(s.players[id], { bench: i })).join('') || '<span class="muted">Sin suplentes</span>'}</div>
        <h4>Reservas</h4><div class="tlm-chips">${res.map((p) => chip(p, { pid: p.id })).join('') || '<span class="muted">—</span>'}</div></section>
      <section class="tlm-panel"><h3>Estilo de juego</h3>${dials}<p class="muted sm">Cada dial cambia el comportamiento real del equipo en el partido 3D (presión, línea, ritmo, ancho, mentalidad, salida).</p>
        <h3>Plan de partido</h3><div class="tlm-plan">${plan('ifWinning', 'Si vamos ganando')}${plan('ifLosing', 'Si vamos perdiendo')}${plan('fromMinute', 'Desde el minuto ' + u.plan.fromMinute.minute)}<label>Minuto<input type="range" min="46" max="85" value="${u.plan.fromMinute.minute}" data-inp="planMin"></label></div><label class="tlm-check"><input type="checkbox" data-chg="planAuto" ${u.plan.autoSubs ? 'checked' : ''}> Dejar que el asistente haga los cambios (cansancio y marcador)</label>
        ${opts ? `<h3>Instrucción individual</h3><p>${esc(selP.canonicalName)}</p><div class="tlm-opts wrap">${opts.map(([v, l]) => `<button class="${((u.instructions || {})[selP.id] || '') === v ? 'on' : ''}" data-act="tacInstr" data-v="${v}">${l}</button>`).join('')}</div>` : ''}
        <h3>Reglas de juego</h3>${rulesPanel(u)}
        <h3>Fuerza del once</h3>${rb('Ataque', lr.attack)}${rb('Medio', lr.midfield)}${rb('Defensa', lr.defense)}${rb('Arquero', lr.gk)}</section></div>`;
  };
  A.tacFormation = (el) => { TLM.setFormation(S(), U(), el.dataset.f); U().lineupMode = 'manual'; UI.tac.sel = null; UI.render(); };
  A.tacAuto = () => { TLM.autoLineup(S(), U()); U().lineupMode = 'auto'; UI.tac.sel = null; UI.toast('Once óptimo elegido.', 'ok'); UI.render(); };
  A.ruleOn = (el) => { const u = U(); u.rules = rulesOf(u); u.rules[el.dataset.id].on = !!el.checked; UI.render(); };
  A.ruleParam = (el) => { const u = U(), T = window.LFO_TAC, q = T.RULES.find((r) => r.id === el.dataset.id).params.find((x) => x.k === el.dataset.k); u.rules = rulesOf(u); const v = Math.min(q.max, Math.max(q.min, +el.value || q.def)); u.rules[el.dataset.id].p[el.dataset.k] = v; el.value = v; };
  A.ruleReset = () => { delete U().rules; UI.toast('Reglas de juego restauradas.', 'ok'); UI.render(); };
  A.tacSet = (el) => { U().tactics[el.dataset.k] = el.dataset.v; UI.render(); };
  A.planSet = (el) => { const u = U(), k = el.dataset.k; if (k === 'fromMinute') u.plan.fromMinute.mode = el.value; else u.plan[k] = el.value; };
  A.planMin = (el) => { U().plan.fromMinute.minute = +el.value; };
  A.planAuto = (el) => { U().plan.autoSubs = !!el.checked; };
  A.tacInstr = (el) => { const u = UI.career.user, sel = UI.tac.sel; if (!sel || sel.xi == null) return; const pid = u.lineup.xi[sel.xi]; u.instructions = u.instructions || {}; if (el.dataset.v) u.instructions[pid] = el.dataset.v; else delete u.instructions[pid]; UI.render(); };
  const setRef = (u, r, v) => { if (r.xi != null) u.lineup.xi[r.xi] = v; else if (r.bench != null) u.lineup.bench[r.bench] = v; };
  const getRef = (u, r) => (r.xi != null ? u.lineup.xi[r.xi] : r.bench != null ? u.lineup.bench[r.bench] : r.pid);
  A.tacPick = (el) => {
    const u = U(), k = el.dataset.kind, ref = k === 'xi' ? { xi: +el.dataset.i } : k === 'bench' ? { bench: +el.dataset.i } : { pid: el.dataset.pid }, sel = UI.tac.sel;
    if (!sel) { UI.tac.sel = ref; UI.render(); return; }
    if (refName(sel) === refName(ref)) { UI.tac.sel = null; UI.render(); return; }
    const slot = (r) => r.pid == null;
    if (slot(sel) && slot(ref)) { const a = getRef(u, sel), b = getRef(u, ref); setRef(u, sel, b); setRef(u, ref, a); } // intercambio entre puestos/banquillo
    else if (slot(sel)) setRef(u, sel, ref.pid);   // la reserva entra; el que ocupaba el puesto pasa a reservas
    else if (slot(ref)) setRef(u, ref, sel.pid);
    else { UI.tac.sel = ref; UI.render(); return; }
    u.lineup.bench = u.lineup.bench.filter(Boolean); u.lineupMode = 'manual';
    const seen = new Set(); u.lineup.xi = u.lineup.xi.map((id) => (id && !seen.has(id) ? (seen.add(id), id) : null));
    u.lineup.bench = u.lineup.bench.filter((id) => !seen.has(id));
    if (u.lineup.xi[0] && UI.career.state.players[u.lineup.xi[0]].primaryPosition !== 'POR') UI.toast('Ojo: el arco debería ocuparlo un portero.', 'warn');
    UI.tac.sel = null; UI.render();
  };
  void crest; void formPills;
})(typeof globalThis !== 'undefined' ? globalThis : this);
