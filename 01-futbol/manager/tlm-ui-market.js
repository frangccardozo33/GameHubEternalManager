/* LFO MANAGER — UI de mercado: TRANSFERS (lista, filtros, compra inmediata, ofertas, contraofertas, ventas) y SCOUT. */
(function (g) {
  'use strict';
  const TLM = g.TLM, UI = TLM.UI; if (!UI) return;
  const esc = UI.esc, M = UI.M, pill = UI.pill, crest = UI.crest, A = UI.actions, S = () => UI.career.state, U = () => UI.career.user;
  const $ = (id) => document.getElementById(id);
  UI.mk = { pos: '', role: '', minAge: '', maxAge: '', minOvr: '', maxOvr: '', minPot: '', nat: '', clubId: '', maxPrice: '', q: '', source: 'mix', sort: 'ovr', limit: 40 };
  const STATUS = { OFFERED: ['Enviada', 'info'], NEGOTIATING: ['Negociando', 'warn'], ACCEPTED: ['Aceptada', 'ok'], REJECTED: ['Rechazada', 'bad'], TRANSFERRED: ['Traspasado', 'ok'], CANCELLED: ['Cancelada', ''], AVAILABLE: ['Disponible', 'ok'] };
  const stPill = (k) => pill((STATUS[k] || [k])[0], (STATUS[k] || [])[1]);
  const num = (v) => (v === '' || v == null ? null : +v);

  UI.screens.transfers = () => {
    const tab = UI.params.tab || 'market', s = S(), u = U();
    const open = Object.values(s.market.offers).filter((o) => ['OFFERED', 'NEGOTIATING'].includes(o.status));
    const rec = open.filter((o) => o.toClubId === u.id).length, sent = open.filter((o) => o.fromClubId === u.id).length;
    const tabs = [['market', 'Mercado'], ['offers', `Ofertas${rec + sent ? ' (' + (rec + sent) + ')' : ''}`], ['mine', 'Mis jugadores en venta'], ['history', 'Historial de traspasos']];
    let body = '';
    if (tab === 'market') body = marketTab();
    else if (tab === 'offers') body = offersTab();
    else if (tab === 'mine') body = mineTab();
    else body = historyTab();
    return `<h2 class="tlm-h">Transferencias <small>Saldo ${M(u.finances.balance)} · plantilla ${u.squad.length}</small></h2><div class="tlm-tabs">${tabs.map(([id, l]) => `<button class="${tab === id ? 'on' : ''}" data-act="go" data-screen="transfers" data-param='{"tab":"${id}"}'>${l}</button>`).join('')}</div>${body}`;
  };

  function marketTab() {
    const s = S(), u = U(), f = UI.mk;
    const filt = { pos: f.pos || undefined, role: f.role || undefined, minAge: num(f.minAge), maxAge: num(f.maxAge), minOvr: num(f.minOvr), maxOvr: num(f.maxOvr), maxPrice: num(f.maxPrice) != null ? num(f.maxPrice) * 1e6 : undefined, minPot: num(f.minPot), nationality: f.nat || undefined, clubId: f.clubId || undefined, name: f.q || undefined, excludeClub: u.id, sort: f.sort,
      source: f.source === 'mix' ? undefined : f.source };
    const rows = TLM.searchMarket(s, filt), shown = rows.slice(0, f.limit);
    const sel = (k, opts) => `<select data-chg="mkSet" data-k="${k}">${opts.map(([v, l]) => `<option value="${v}" ${String(f[k]) === String(v) ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
    const inp = (k, ph, w) => `<input type="number" placeholder="${ph}" value="${esc(f[k])}" data-chg="mkSet" data-k="${k}" style="width:${w || 72}px">`;
    const pc = u.squad.length;
    return `<div class="tlm-filters">${sel('source', [['mix', 'En venta + libres'], ['listed', 'Sólo en venta'], ['free', 'Agentes libres'], ['all', 'Todos los jugadores (por oferta)']])}${sel('pos', [['', 'Cualquier posición'], ...TLM.POSITIONS.map((p) => [p, p + ' · ' + TLM.POS_LABEL[p]])])}${inp('minAge', 'Edad ≥')}${inp('maxAge', 'Edad ≤')}${inp('minOvr', 'OVR ≥')}${inp('maxOvr', 'OVR ≤')}${inp('minPot', 'POT ≥')}${inp('maxPrice', 'Máx M€', 82)}${sel('nat', [['', 'Nacionalidad'], ...[...new Set(Object.values(s.players).map((p) => p.nationality))].sort().map((n) => [n, n])])}${sel('clubId', [['', 'Cualquier club'], ...Object.values(s.clubs).filter((c) => c.id !== u.id).map((c) => [c.id, c.name])])}<input placeholder="Nombre…" value="${esc(f.q)}" data-chg="mkSet" data-k="q" style="width:130px">${sel('sort', [['ovr', 'Ordenar: OVR'], ['price', 'Precio'], ['age', 'Edad'], ['pot', 'Potencial'], ['value', 'Valor']])}</div>
      ${pc < 11 ? `<div class="tlm-alert warn">Tenés ${pc} jugadores: necesitás 11 para jugar (arco incluido). Los agentes libres no cuestan traspaso.</div>` : ''}
      <div class="tlm-scroll"><table class="tlm-table players"><thead><tr><th class="l">Jugador</th><th>Pos</th><th>Edad</th><th>OVR</th><th>POT</th><th>Nac.</th><th class="l">Club</th><th>Precio</th><th>Salario</th><th></th></tr></thead><tbody>${shown.map((r) => {
        const p = s.players[r.pid], cl = p.clubId ? s.clubs[p.clubId] : null, dem = TLM.contractDemand(s, p, u);
        return `<tr><td class="l"><a data-act="playerModal" data-pid="${p.id}"><b>${esc(p.canonicalName)}</b></a> ${p.card.edition !== 'potrero' ? '<small class="ed">★</small>' : ''}</td><td><span class="tlm-pos ${UI.posClass(p.primaryPosition)}">${p.primaryPosition}</span></td><td>${p.age}</td><td><b class="ovr ${UI.tone(p.overall)}">${p.overall}</b></td><td>${p.age <= 24 ? p.potential : '—'}</td><td>${UI.flag(p.nationality, 12)} ${esc(g.LFONations ? g.LFONations.code(p.nationality) : p.nationality.slice(0, 3).toUpperCase())}</td><td class="l">${cl ? crest(cl, 18) + ' ' + esc(cl.shortName) : '<i>Libre</i>'}</td><td><b>${r.kind === 'free' ? 'Gratis' : M(r.price)}</b>${r.kind === 'club' ? '<small> valor</small>' : ''}</td><td>${M(dem)}</td><td>${r.status && r.status !== 'AVAILABLE' ? stPill(r.status) : ''} <button class="tlm-btn sm ${r.kind === 'club' ? 'ghost' : 'primary'}" data-act="buyModal" data-pid="${p.id}">${r.kind === 'free' ? 'Fichar' : r.kind === 'listed' ? 'Comprar' : 'Ofertar'}</button></td></tr>`;
      }).join('') || '<tr><td colspan="10" class="muted">Ningún jugador coincide con el filtro.</td></tr>'}</tbody></table></div>${rows.length > shown.length ? `<button class="tlm-btn ghost" data-act="mkMore">Ver más (${rows.length - shown.length})</button>` : ''}`;
  }
  A.mkSet = (el) => { UI.mk[el.dataset.k] = el.value; UI.mk.limit = 40; UI.render(); };
  A.mkMore = () => { UI.mk.limit += 40; UI.render(); };

  // ---------- comprar / ofertar ----------
  A.buyModal = (el) => {
    const s = S(), u = U(), p = s.players[el.dataset.pid]; if (!p) return;
    const l = s.market.listings[p.id], free = s.market.freeAgents.includes(p.id), cl = p.clubId ? s.clubs[p.clubId] : null, dem = TLM.contractDemand(s, p, u);
    const bonus = Math.round(p.marketValue * 0.12);
    const modes = free ? [['free', 'Firmar como agente libre']] : l ? [['now', `Comprar ya por ${M(l.askingPrice)}`], ['offer', 'Ofertar otra cifra']] : [['offer', 'Enviar oferta']];
    const my = Object.values(s.market.offers).find((o) => o.playerId === p.id && o.fromClubId === u.id && ['OFFERED', 'NEGOTIATING'].includes(o.status));
    UI.modal(`<div class="tlm-buy"><h2>${free ? 'Fichar' : 'Comprar'} a ${esc(p.canonicalName)}</h2><p class="muted">${p.primaryPosition} · ${p.age} años · OVR ${p.overall} · ${cl ? esc(cl.name) : 'Agente libre'} · valor ${M(p.marketValue)}</p>
      ${my ? `<div class="tlm-alert info">Ya tenés una oferta abierta por ${M(my.amount)} (${(STATUS[my.status] || [my.status])[0]}). Gestionala en Ofertas.</div>` : ''}
      <div class="tlm-opts wrap">${modes.map(([v, lab], i) => `<button class="${i === 0 ? 'on' : ''}" data-act="buyMode" data-v="${v}">${lab}</button>`).join('')}</div><input type="hidden" id="buyMode" value="${modes[0][0]}">
      <div class="tlm-fields"><label id="amtRow" ${modes[0][0] === 'offer' ? '' : 'hidden'}>Oferta (€)<input id="buyAmt" type="number" step="50000" value="${Math.round((l ? l.askingPrice * 0.9 : p.marketValue) / 10000) * 10000}"></label>
        <label>Salario anual (€) <small>pide ${M(dem)}</small><input id="buySal" type="number" step="10000" value="${dem}"></label><label>Años de contrato<select id="buyYrs">${[1, 2, 3, 4, 5].map((y) => `<option ${y === 3 ? 'selected' : ''}>${y}</option>`).join('')}</select></label>
        <label>Edición del cromo (opcional)<select id="buyEd"><option value="">Mantener (${esc((TLM.EDITIONS.find((e) => e.id === p.card.edition) || {}).name)})</option>${TLM.EDITIONS.filter((e) => e.id !== p.card.edition).map((e) => `<option value="${e.id}">${esc(e.name)} (+${M(Math.max(20000, p.marketValue * e.cost))})</option>`).join('')}</select></label></div>
      <p class="muted sm">${free ? `Prima de fichaje ${M(bonus)}.` : 'Las ofertas se responden al cerrar la jornada: otros clubes pueden pujar por el mismo jugador y el vendedor elige la mejor oferta.'} Saldo: ${M(u.finances.balance)}.</p>
      <div class="tlm-row"><button class="tlm-btn primary big" data-act="doBuy" data-pid="${p.id}">Confirmar</button><button class="tlm-btn ghost" data-act="closeModal">Cancelar</button></div></div>`);
  };
  A.buyMode = (el) => { $('buyMode').value = el.dataset.v; el.parentElement.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === el)); const r = $('amtRow'); if (r) r.hidden = el.dataset.v !== 'offer'; };
  A.doBuy = (el) => {
    const s = S(), u = U(), pid = el.dataset.pid, mode = $('buyMode').value, terms = { salary: +$('buySal').value, years: +$('buyYrs').value, edition: $('buyEd').value || null };
    let r;
    if (mode === 'free') r = TLM.signFreeAgent(s, u.id, pid, terms);
    else if (mode === 'now') r = TLM.buyNow(s, u.id, pid, terms);
    else { r = TLM.makeOffer(s, u.id, pid, +$('buyAmt').value, terms); if (r.ok) { UI.closeModal(); UI.toast('Oferta enviada. Se responde al cerrar la jornada.', 'ok'); UI.render(); return; } }
    if (r.ok) { UI.closeModal(); UI.toast(`¡${s.players[pid].canonicalName} es jugador de ${u.name}!`, 'ok'); UI.career.save('auto'); TLM.autoLineupIfAuto && TLM.autoLineupIfAuto(s, u); if (u.lineupMode === 'auto') TLM.autoLineup(s, u); UI.render(); } else UI.toast(r.reason || 'No se pudo completar.', 'bad');
  };

  // ---------- ofertas ----------
  function offerRow(o, dir) {
    const s = S(), p = s.players[o.playerId], other = s.clubs[dir === 'sent' ? o.toClubId : o.fromClubId];
    const open = ['OFFERED', 'NEGOTIATING'].includes(o.status), hist = o.history.map((h) => `${h.by === 'buyer' ? 'Comprador' : 'Vendedor'} ${M(h.amount)}`).join(' → ');
    let act = '';
    if (dir === 'sent') {
      if (o.status === 'NEGOTIATING' && o.counterAmount) act = `<div class="tlm-row wrap">Contraoferta: <b>${M(o.counterAmount)}</b><button class="tlm-btn sm primary" data-act="acceptCounter" data-id="${o.id}">Aceptar</button><input id="co_${o.id}" type="number" step="50000" value="${Math.round((o.amount + o.counterAmount) / 2 / 10000) * 10000}" style="width:110px"><button class="tlm-btn sm" data-act="sendCounter" data-id="${o.id}">Contraofertar</button><button class="tlm-btn sm ghost" data-act="withdraw" data-id="${o.id}">Retirar</button></div>`;
      else if (open) act = `<button class="tlm-btn sm ghost" data-act="withdraw" data-id="${o.id}">Retirar</button>`;
    } else if (open) act = `<div class="tlm-row wrap"><button class="tlm-btn sm primary" data-act="respond" data-id="${o.id}" data-v="accept">Aceptar</button><button class="tlm-btn sm danger" data-act="respond" data-id="${o.id}" data-v="reject">Rechazar</button><input id="rc_${o.id}" type="number" step="50000" value="${Math.round(o.amount * 1.2 / 10000) * 10000}" style="width:110px"><button class="tlm-btn sm" data-act="respond" data-id="${o.id}" data-v="counter">Contraofertar</button></div>`;
    return `<tr><td class="l"><a data-act="playerModal" data-pid="${p.id}"><b>${esc(p.canonicalName)}</b></a> <small>${p.primaryPosition} · ${p.overall}</small></td><td class="l">${crest(other, 18)} ${esc(other.shortName)}</td><td><b>${M(o.amount)}</b></td><td>${stPill(o.status)}</td><td class="l"><small>${esc(hist)}${o.reason ? '<br>' + esc(o.reason) : ''}</small></td><td>${act}</td></tr>`;
  }
  function offersTab() {
    const s = S(), u = U(), all = Object.values(s.market.offers), sent = all.filter((o) => o.fromClubId === u.id).sort((a, b) => b.createdRound - a.createdRound), rec = all.filter((o) => o.toClubId === u.id).sort((a, b) => b.createdRound - a.createdRound);
    const tbl = (list, dir) => `<div class="tlm-scroll"><table class="tlm-table"><thead><tr><th class="l">Jugador</th><th class="l">${dir === 'sent' ? 'Vendedor' : 'Comprador'}</th><th>Importe</th><th>Estado</th><th class="l">Negociación</th><th></th></tr></thead><tbody>${list.slice(0, 25).map((o) => offerRow(o, dir)).join('') || '<tr><td colspan="6" class="muted">Sin ofertas.</td></tr>'}</tbody></table></div>`;
    return `<h3>Ofertas recibidas por tus jugadores</h3>${tbl(rec, 'rec')}<h3>Ofertas que enviaste</h3>${tbl(sent, 'sent')}`;
  }
  const done = (r, ok) => { UI.toast(r.ok ? ok : r.reason || 'No se pudo.', r.ok ? 'ok' : 'bad'); UI.career.save('auto'); UI.render(); };
  A.withdraw = (el) => done(TLM.withdrawOffer(S(), el.dataset.id), 'Oferta retirada.');
  A.acceptCounter = (el) => done(TLM.acceptCounter(S(), el.dataset.id), '¡Trato cerrado!');
  A.sendCounter = (el) => { const r = TLM.counterOffer(S(), el.dataset.id, +$('co_' + el.dataset.id).value); UI.toast(r.ok ? (r.status === 'NEGOTIATING' ? 'El vendedor contraoferta ' + M(r.counter) : '¡Trato cerrado!') : r.reason, r.ok ? 'ok' : 'bad'); UI.career.save('auto'); UI.render(); };
  A.respond = (el) => {
    const v = el.dataset.v, r = TLM.respondToOffer(S(), el.dataset.id, v, v === 'counter' ? +$('rc_' + el.dataset.id).value : undefined);
    UI.toast(r.ok ? (v === 'accept' ? 'Jugador vendido.' : v === 'reject' ? 'Oferta rechazada.' : r.status === 'NEGOTIATING' ? 'El comprador acepta negociar: ' + M(r.buyerOffer) : 'Venta cerrada.') : r.reason, r.ok ? 'ok' : 'bad'); UI.career.save('auto'); UI.render();
  };

  function mineTab() {
    const s = S(), u = U(), list = Object.values(s.market.listings).filter((l) => l.clubId === u.id);
    return `<p class="muted">Poné jugadores en venta desde su ficha (Plantilla). Los clubes IA pueden comprar directo o mandar ofertas que verás en la pestaña Ofertas.</p><table class="tlm-table"><thead><tr><th class="l">Jugador</th><th>OVR</th><th>Precio pedido</th><th>Valor</th><th></th></tr></thead><tbody>${list.map((l) => { const p = s.players[l.playerId]; return `<tr><td class="l"><a data-act="playerModal" data-pid="${p.id}"><b>${esc(p.canonicalName)}</b></a></td><td>${p.overall}</td><td>${M(l.askingPrice)}</td><td>${M(p.marketValue)}</td><td><button class="tlm-btn sm ghost" data-act="unlistRow" data-pid="${p.id}">Retirar</button></td></tr>`; }).join('') || '<tr><td colspan="5" class="muted">No tenés jugadores en venta.</td></tr>'}</tbody></table>`;
  }
  A.unlistRow = (el) => { TLM.unlistPlayer(S(), el.dataset.pid); UI.render(); };
  function historyTab() {
    const s = S();
    return `<table class="tlm-table"><thead><tr><th>Temp/J</th><th class="l">Jugador</th><th class="l">De</th><th class="l">A</th><th>Traspaso</th></tr></thead><tbody>${s.transfers.slice(0, 40).map((t) => { const p = s.players[t.playerId]; return `<tr class="${t.to === s.currentClubId || t.from === s.currentClubId ? 'me' : ''}"><td>${t.season % 100}/${t.round}</td><td class="l">${esc(p.canonicalName)} <small>${p.overall}</small></td><td class="l">${t.from ? esc(s.clubs[t.from].shortName) : 'Libre'}</td><td class="l">${esc(s.clubs[t.to].shortName)}</td><td>${M(t.fee)}</td></tr>`; }).join('') || '<tr><td colspan="5" class="muted">Sin traspasos aún.</td></tr>'}</tbody></table>`;
  }

  // =====================================================================================
  //                                        SCOUT
  // =====================================================================================
  UI.sc = { pos: '', minAge: '', maxAge: '', ovr: '', profile: '', attrs: [], maxPrice: '' };
  UI.screens.scout = () => {
    const s = S(), f = UI.sc, left = TLM.DEFAULTS.scoutPerRound - (s.scout.usedThisRound || 0), rep = UI.params.rep ? s.scoutReports[UI.params.rep] : Object.values(s.scoutReports).slice(-1)[0];
    const reps = Object.values(s.scoutReports).slice(-6).reverse();
    return `<h2 class="tlm-h">Scouting <small>${left} informe${left === 1 ? '' : 's'} disponible${left === 1 ? '' : 's'} esta jornada</small></h2><div class="tlm-tgrid"><section class="tlm-panel"><h3>Qué buscás</h3><div class="tlm-fields">
      <label>Posición<select data-chg="scSet" data-k="pos"><option value="">Cualquiera</option>${TLM.POSITIONS.map((p) => `<option value="${p}" ${f.pos === p ? 'selected' : ''}>${p} · ${TLM.POS_LABEL[p]}</option>`).join('')}</select></label>
      <label>Edad mín.<input type="number" value="${esc(f.minAge)}" data-chg="scSet" data-k="minAge"></label><label>Edad máx.<input type="number" value="${esc(f.maxAge)}" data-chg="scSet" data-k="maxAge"></label><label>OVR aproximado<input type="number" value="${esc(f.ovr)}" data-chg="scSet" data-k="ovr"></label>
      <label>Perfil<select data-chg="scSet" data-k="profile">${[['', 'Cualquiera'], ['young', 'Joven promesa'], ['veteran', 'Veterano'], ['star', 'Estrella']].map(([v, l]) => `<option value="${v}" ${f.profile === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label><label>Precio máx. (M€)<input type="number" value="${esc(f.maxPrice)}" data-chg="scSet" data-k="maxPrice"></label></div>
      <h4>Atributos clave</h4><div class="tlm-opts wrap">${TLM.STAT_KEYS.map((k) => `<button class="${f.attrs.includes(k) ? 'on' : ''}" data-act="scAttr" data-k="${k}">${TLM.STAT_LABEL[k]}</button>`).join('')}</div>
      <button class="tlm-btn primary big" data-act="scoutGo" ${left > 0 ? '' : 'disabled'}>Pedir informe del ojeador</button><p class="muted sm">El ojeador devuelve estimaciones (rangos), no los números exactos. Los jugadores en venta y los agentes libres son públicos.</p>
      ${reps.length > 1 ? `<h4>Informes anteriores</h4>${reps.map((r) => `<button class="tlm-link" data-act="go" data-screen="scout" data-param='{"rep":"${r.id}"}'>J${r.round} · ${esc(r.request.pos || 'cualquier posición')} (${r.rows.length})</button>`).join('')}` : ''}</section>
      <section class="tlm-panel"><h3>Informe ${rep ? '· jornada ' + rep.round : ''}</h3>${rep ? `<p class="muted sm">Precisión del ojeador: ${Math.round(rep.accuracy * 100)}%</p><div class="tlm-scroll"><table class="tlm-table"><thead><tr><th class="l">Jugador</th><th>Edad</th><th>OVR est.</th><th>Pot.</th><th class="l">Destacado</th><th class="l">Club</th><th>Valor</th><th></th></tr></thead><tbody>${rep.rows.map((r) => `<tr><td class="l"><a data-act="playerModal" data-pid="${r.pid}"><b>${esc(r.name)}</b></a> <span class="tlm-pos ${UI.posClass(r.pos)}">${r.pos}</span></td><td>${r.age}</td><td>${r.ovr[0]}–${r.ovr[1]}</td><td>${'★'.repeat(r.potentialStars)}<span class="muted">${'★'.repeat(5 - r.potentialStars)}</span></td><td class="l"><small>${r.keyAttrs.map((a) => TLM.STAT_LABEL[a.key] + ' ' + a.range[0] + '–' + a.range[1]).join(' · ')}</small></td><td class="l"><small>${esc(r.club)}<br>${esc(r.availability)}</small></td><td>${M(r.value)}</td><td><button class="tlm-btn sm" data-act="buyModal" data-pid="${r.pid}">${r.availability === 'Libre' ? 'Fichar' : 'Ofertar'}</button></td></tr>`).join('') || '<tr><td colspan="8" class="muted">Nadie coincide con ese perfil.</td></tr>'}</tbody></table></div>` : '<p class="muted">Todavía no pediste ningún informe.</p>'}</section></div>`;
  };
  A.scSet = (el) => { UI.sc[el.dataset.k] = el.value; };
  A.scAttr = (el) => { const a = UI.sc.attrs, k = el.dataset.k; UI.sc.attrs = a.includes(k) ? a.filter((x) => x !== k) : a.length < 3 ? a.concat(k) : a; UI.render(); };
  A.scoutGo = () => {
    const f = UI.sc, req = { pos: f.pos || undefined, minAge: num(f.minAge) ?? undefined, maxAge: num(f.maxAge) ?? undefined, ovr: num(f.ovr) ?? undefined, profile: f.profile || undefined, attrs: f.attrs.slice(), maxPrice: num(f.maxPrice) != null ? num(f.maxPrice) * 1e6 : undefined, limit: 10 };
    const r = TLM.scout(S(), U().id, req); if (!r.ok) { UI.toast(r.reason, 'bad'); return; } UI.params = { rep: r.report.id }; UI.render();
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
