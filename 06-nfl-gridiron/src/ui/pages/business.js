import { card, table, tabs, chip, plink, ovrBadge, posTag, bar, esc, stat, tdot, teamTag, money, slider } from '../kit.js';
import { POSITIONS, KEY_ATTRS, LABELS, capHit, fmtM, SALARY_CAP, marketValue } from '../../manager/constants.js';
import { askFor, offerValue, payroll, capSpace, evaluateTrade, executeTrade, releasePlayer, deadCapFor, teamNeeds, tradeValue, staffPayroll, projectedAttendance, hireStaff, fireStaff } from '../../manager/economy.js';
import { STAFF_ROLES } from '../../manager/generator.js';
import { openNegotiation } from '../negotiation.js';
import { isInjured } from '../../manager/lineup.js';
import { r1, sum } from '../../manager/util.js';

// ------------------------------------------------------------------ Market
const market = {
  id: 'market', title: 'Market', icon: '⇄',
  render(app) {
    const lg = app.lg, d = lg.data, t = lg.user, tab = app.ui.mTab || 'fa', P = d.players;
    const tabsBar = tabs([['fa', 'Agentes libres'], ['trades', 'Traspasos'], ['offers', `Ofertas${d.offers.length ? ` (${d.offers.length})` : ''}`], ['needs', 'Necesidades'], ['compare', 'Comparador']], tab, 'm-tab');
    let body = '';
    if (tab === 'fa') {
      const f = app.ui.faPos || 'ALL', sort = app.ui.sort || { key: 'ovr', dir: -1 };
      let rows = d.freeAgents.map(id => P[id]).filter(p => f === 'ALL' || p.pos === f);
      const fn = { ovr: p => p.ovr, age: p => p.age, pot: p => p.potential, ask: p => offerValue(askFor(lg, p, t.id)) }[sort.key] || (p => p.ovr);
      rows = rows.sort((a, b) => (fn(b) - fn(a)) * -sort.dir).slice(0, 60);
      body = tabs([['ALL', 'Todos'], ...POSITIONS.map(p => [p, p])], f, 'fa-pos') + table({ cols: [{ h: 'Jugador', f: p => plink(p) }, { h: 'Pos', f: p => posTag(p.pos) }, { h: 'Edad', k: 'age', sort: 'age' }, { h: 'Ovr', f: p => ovrBadge(p.ovr), sort: 'ovr' }, { h: 'Pot', k: 'potential', sort: 'pot' }, { h: 'Pide', f: p => { const a = askFor(lg, p, t.id); return `${fmtM(offerValue(a))} <small>· ${a.years}a</small>`; }, sort: 'ask' }, { h: '', f: p => `<button class="btn small primary" data-act="fa-sign" data-id="${p.id}">Negociar</button> <button class="btn small" data-act="p-compare" data-id="${p.id}">+</button>` }], rows, empty: 'No hay agentes libres en esa posición.' });
    }
    if (tab === 'trades') {
      const oppId = app.ui.tradeTeam || d.teamOrder.find(x => x !== t.id), tr = app.ui.trade ??= { A: [], B: [] };
      const opp = lg.team(oppId), list = (team, side) => `<div class="tlist">${lg.roster(team).sort((a, b) => b.ovr - a.ovr).map(p => `<label class="tl ${tr[side].includes(p.id) ? 'on' : ''}"><input type="checkbox" data-change="tr-toggle" data-side="${side}" data-id="${p.id}" ${tr[side].includes(p.id) ? 'checked' : ''}>${posTag(p.pos)} <span>${esc(p.name)}</span> ${ovrBadge(p.ovr)} <small>${p.age}a · ${fmtM(capHit(p))}${p.injury ? ' 🩹' : ''}</small></label>`).join('')}</div>`;
      const ev = tr.A.length || tr.B.length ? evaluateTrade(lg, { teamA: t.id, teamB: oppId, giveA: tr.A, giveB: tr.B }) : null;
      body = `<label class="sel inline"><b>Equipo</b><select data-change="tr-team">${d.teamOrder.filter(x => x !== t.id).map(x => `<option value="${x}" ${x === oppId ? 'selected' : ''}>${esc(lg.team(x).name)}</option>`).join('')}</select></label>
      <div class="grid g2"><div><h5>Envías (${esc(t.short)})</h5>${list(t, 'A')}</div><div><h5>Recibes (${esc(opp.short)})</h5>${list(opp, 'B')}</div></div>
      ${ev ? `<div class="banner ${ev.accept ? 'ok' : 'warn'}"><b>${esc(ev.reason)}</b><br><small>Valor enviado ${ev.valueGiven} · recibido ${ev.valueReceived} · plantilla ${ev.rosterA ?? ''}</small></div>` : '<p class="muted">Selecciona jugadores de ambos lados para evaluar.</p>'}
      <button class="btn primary" data-act="tr-go" ${ev?.accept ? '' : 'disabled'}>Proponer traspaso</button>`;
    }
    if (tab === 'offers') body = d.offers.length ? d.offers.map(o => { const from = lg.team(o.from); return `<div class="offer"><b>${teamTag(from)} ${esc(from.name)}</b> ofrece <b>${o.give.map(i => `${esc(P[i].name)} (${P[i].pos} ${P[i].ovr})`).join(', ')}</b> por <b>${o.want.map(i => `${esc(P[i].name)} (${P[i].pos} ${P[i].ovr})`).join(', ')}</b><small>Vence en la semana ${o.expires + 1}</small><span><button class="btn small primary" data-act="of-ok" data-id="${o.id}">Aceptar</button> <button class="btn small" data-act="of-no" data-id="${o.id}">Rechazar</button></span></div>`; }).join('') : '<div class="empty">Sin ofertas de la CPU por ahora. Aparecen durante la temporada.</div>';
    if (tab === 'needs') {
      const needs = teamNeeds(lg, t.id);
      body = table({ cols: [{ h: 'Pos', f: n => posTag(n.pos) }, { h: 'Necesidad', f: n => bar(n.need, 100, n.need > 60 ? 'warn' : '') }, { h: 'Titulares', f: n => `${n.starterAvg} <small>(liga ${n.leagueAvg})</small>` }, { h: 'Estado', k: 'note' }, { h: 'Mejor libre', f: n => { const b = d.freeAgents.map(i => P[i]).filter(p => p.pos === n.pos).sort((a, c) => c.ovr - a.ovr)[0]; return b ? `${plink(b)} ${ovrBadge(b.ovr)}` : '—'; } }], rows: needs });
    }
    if (tab === 'compare') {
      const ids = (app.ui.compare ||= []).filter(i => P[i]);
      body = ids.length ? `<div class="tscroll"><table class="mtable cmp"><thead><tr><th></th>${ids.map(i => `<th>${plink(P[i])} <button class="btn small" data-act="cmp-rm" data-id="${i}">✕</button></th>`).join('')}</tr></thead><tbody>${[['Pos', p => p.pos], ['Edad', p => p.age], ['Ovr', p => p.ovr], ['Potencial', p => p.potential], ['Contrato', p => p.contract ? `${fmtM(capHit(p))} · ${p.contract.years}a` : 'Libre'], ['Valor mercado', p => fmtM(marketValue(p))], ...[...new Set(ids.flatMap(i => KEY_ATTRS[P[i].pos]))].map(k => [LABELS[k], p => KEY_ATTRS[p.pos].includes(k) ? p.ratings[k] : '—'])].map(([l, f]) => `<tr><td>${l}</td>${ids.map(i => `<td>${f(P[i])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<div class="empty">Añade jugadores con “+ Comparar” desde su perfil o desde la lista de agentes libres (máx. 3).</div>';
    }
    return card('Mercado', tabsBar + body, { right: `<span class="chip">Caja ${fmtM(t.finance.cash)}</span>` });
  },
  handlers: {
    'm-tab'(app, el) { app.ui.mTab = el.dataset.v; app.ui.sort = null; app.refresh(); },
    'fa-pos'(app, el) { app.ui.faPos = el.dataset.v; app.refresh(); },
    'fa-sign'(app, el) { openNegotiation(app, el.dataset.id, 'sign'); },
    'p-compare'(app, el) { const c = app.ui.compare ??= []; if (!c.includes(el.dataset.id)) c.push(el.dataset.id); if (c.length > 3) c.shift(); app.toast('Añadido al comparador.'); },
    'cmp-rm'(app, el) { app.ui.compare = app.ui.compare.filter(i => i !== el.dataset.id); app.refresh(); },
    'tr-go'(app) {
      const lg = app.lg, tr = app.ui.trade, oppId = app.ui.tradeTeam || lg.data.teamOrder.find(x => x !== lg.data.userTeam), args = { teamA: lg.data.userTeam, teamB: oppId, giveA: tr.A, giveB: tr.B };
      const ev = evaluateTrade(lg, args); if (!ev.accept) return app.toast(ev.reason);
      executeTrade(lg, args); app.ui.trade = { A: [], B: [] }; app.commit(); app.refresh(); app.toast('Traspaso completado.');
    },
    'of-ok'(app, el) {
      const lg = app.lg, d = lg.data, o = d.offers.find(x => x.id === el.dataset.id); if (!o) return;
      const args = { teamA: d.userTeam, teamB: o.from, giveA: o.want, giveB: o.give }, ev = evaluateTrade(lg, args);
      if (!ev.ok) return app.toast(ev.reason);
      executeTrade(lg, args); d.offers = d.offers.filter(x => x.id !== o.id); app.commit(); app.refresh(); app.toast('Oferta aceptada.');
    },
    'of-no'(app, el) { app.lg.data.offers = app.lg.data.offers.filter(x => x.id !== el.dataset.id); app.commit(); app.refresh(); },
  },
  changes: {
    'tr-toggle'(app, el) { const tr = app.ui.trade ??= { A: [], B: [] }, a = tr[el.dataset.side]; const i = a.indexOf(el.dataset.id); if (i >= 0) a.splice(i, 1); else a.push(el.dataset.id); app.refresh(); },
    'tr-team'(app, el) { app.ui.tradeTeam = el.value; app.ui.trade = { A: [], B: [] }; app.refresh(); },
  },
};

// ------------------------------------------------------------------ Contracts
const contracts = {
  id: 'contracts', title: 'Contracts', icon: '✍',
  render(app) {
    const lg = app.lg, t = lg.user, sort = app.ui.sort || { key: 'cap', dir: -1 }, all = lg.roster(t);
    const fn = { cap: p => capHit(p), years: p => p.contract.years, ovr: p => p.ovr, age: p => p.age }[sort.key] || (p => capHit(p));
    const rows = [...all].sort((a, b) => (fn(a) - fn(b)) * sort.dir), pay = payroll(lg, t), exp = all.filter(p => p.expiring);
    const cols = [{ h: 'Jugador', f: p => plink(p) }, { h: 'Pos', f: p => posTag(p.pos) }, { h: 'Edad', k: 'age', sort: 'age' }, { h: 'Ovr', f: p => ovrBadge(p.ovr), sort: 'ovr' }, { h: 'Salario', f: p => fmtM(p.contract.salary) }, { h: 'Bonus', f: p => fmtM(p.contract.bonus) }, { h: 'Costo anual', f: p => `<b>${fmtM(capHit(p))}</b>`, sort: 'cap' }, { h: 'Años', f: p => p.contract.years + (p.expiring ? ' ⚠' : ''), sort: 'years' }, { h: 'Bonus pendiente', f: p => fmtM(deadCapFor(p)) }, { h: '', f: p => `<button class="btn small" data-act="c-renew" data-id="${p.id}">Renovar</button> <button class="btn small danger" data-act="c-release" data-id="${p.id}">Liberar</button>` }];
    return `<div class="grid g3">${card('Nómina', `<b class="big-line">${fmtM(pay)}</b><div class="stats4 mt">${stat('Caja', fmtM(t.finance.cash))}${stat('Bonus pendientes', fmtM(t.deadCap || 0))}${stat('Contratos', all.length)}${stat('Vencidos', exp.length)}</div>`)}
      ${card('Por vencer', exp.length ? `<div class="explist">${exp.map(p => `<div>${posTag(p.pos)} ${plink(p)} ${ovrBadge(p.ovr)} <button class="btn small primary" data-act="c-renew" data-id="${p.id}">Renovar</button></div>`).join('')}</div><p class="muted small">Si no renuevas antes de comenzar la temporada, quedan libres.</p>` : '<div class="empty ok">Ningún contrato vencido.</div>')}
      ${card('Consejo', '<p class="muted">El costo anual es salario + bonus/años. Liberar a un jugador deja el bonus pendiente. Los jugadores con mucha moral piden menos.</p>')}</div>
      ${card('Todos los contratos', table({ cols, rows }))}`;
  },
  handlers: {
    'c-renew'(app, el) { openNegotiation(app, el.dataset.id, 'renew'); },
    'c-release'(app, el) { const p = app.lg.player(el.dataset.id); app.confirm(`¿Liberar a ${p.name}? Bonus pendiente: ${fmtM(deadCapFor(p))}.`, () => { app.toast(releasePlayer(app.lg, app.lg.data.userTeam, p.id).message); app.commit(); app.refresh(); }, { yes: 'Liberar', danger: true }); },
  },
};

// ------------------------------------------------------------------ Finances
const finances = {
  id: 'finances', title: 'Finances', icon: '$',
  render(app) {
    const lg = app.lg, t = lg.user, f = t.finance, log = f.log.filter(x => x.year === lg.data.year), rev = sum(log.map(x => x.revenue)), exp = sum(log.map(x => x.expenses));
    return `<div class="grid g3">${card('Caja', `<b class="big-line">${fmtM(f.cash)}</b><div class="stats4 mt">${stat('Ingresos', fmtM(rev), 'temporada')}${stat('Gastos', fmtM(exp), 'temporada')}${stat('Beneficio', fmtM(rev - exp))}${stat('Hype', Math.round(f.hype))}</div>`)}
      ${card('Entradas', `<p>El precio de las entradas lo fija el club según su popularidad (como en el resto de los módulos).</p><p>Asistencia estimada: <b id="att">${Math.round(projectedAttendance(t) * 100)}%</b></p>`)}
      ${card('Gastos fijos', `<div class="kvs"><div class="kv"><span>Nómina</span><b>${fmtM(payroll(lg, t))}</b></div><div class="kv"><span>Operaciones</span><b>$18.0M</b></div></div>`)}</div>
      ${card('Semana a semana', table({ cols: [{ h: 'Temp.', k: 'year' }, { h: 'Sem', k: 'week' }, { h: 'Ingresos', f: x => fmtM(x.revenue) }, { h: 'Gastos', f: x => fmtM(x.expenses) }, { h: 'Beneficio', f: x => `<b class="${x.profit >= 0 ? 'win' : 'loss'}">${fmtM(x.profit)}</b>` }, { h: 'Taquilla', f: x => fmtM(x.gate) }, { h: 'Asist.', f: x => x.att ? x.att + '%' : '—' }], rows: [...f.log].reverse().slice(0, 20), empty: 'Sin movimientos todavía.' }))}`;
  },
};

export const businessPages = [market, contracts, finances];
