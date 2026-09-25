import { card, table, tabs, chip, plink, ovrBadge, posTag, bar, esc, inj, money, stat, record, teamTag, tdot } from '../kit.js';
import { POSITIONS, ROSTER_MAX, ROSTER_MIN, ROSTER_TARGET, KEY_ATTRS, LABELS, PHYSICAL, capHit, fmtM, ovrAt, marketValue, STARTERS } from '../../manager/constants.js';
import { autoDepth, depthMove, depthAdd, depthRemove, depthIssues, isInjured, DEPTH_KEYS, SLOTS, OFF_PACKAGES, DEF_PACKAGES, retScore } from '../../manager/lineup.js';
import { releasePlayer, deadCapFor, askFor, offerValue } from '../../manager/economy.js';
import { openNegotiation } from '../negotiation.js';
import { avg, r1, pct } from '../../manager/util.js';

const statLine = p => {
  const s = p.season; if (!s.gp) return '<span class="muted">—</span>';
  if (p.pos === 'QB') return `${s.passComp}/${s.passAtt} · ${Math.round(s.passYds)} yd · ${s.passTD} TD · ${s.int} INT`;
  if (p.pos === 'RB') return `${s.rushAtt} car · ${Math.round(s.rushYds)} yd · ${s.rushTD} TD`;
  if (p.pos === 'WR' || p.pos === 'TE') return `${s.rec} rec · ${Math.round(s.recYds)} yd · ${s.recTD} TD`;
  if (p.pos === 'K') return `${s.fgm}/${s.fga} FG`;
  if (p.pos === 'P') return `${s.punts} punts · ${s.punts ? Math.round(s.puntYds / s.punts) : 0} prom.`;
  return `${s.tackles} tkl · ${s.sacks} sacks · ${s.ints} INT`;
};
const sortVal = { name: p => p.name, pos: p => POSITIONS.indexOf(p.pos), age: p => p.age, ovr: p => p.ovr, pot: p => p.potential, salary: p => capHit(p), form: p => p.form, fatigue: p => p.fatigue, years: p => p.contract?.years ?? 0 };

// ------------------------------------------------------------------ Roster
const roster = {
  id: 'roster', title: 'Roster', icon: '☰',
  render(app) {
    const lg = app.lg, t = lg.user, f = app.ui.rosterPos || 'ALL', sort = app.ui.sort || { key: 'ovr', dir: -1 };
    let rows = lg.roster(t); const all = rows;
    if (f !== 'ALL') rows = rows.filter(p => p.pos === f);
    const fn = sortVal[sort.key] || sortVal.ovr; rows = [...rows].sort((a, b) => { const x = fn(a), y = fn(b); return (x > y ? 1 : x < y ? -1 : 0) * sort.dir; });
    const counts = POSITIONS.map(pos => { const n = all.filter(p => p.pos === pos).length, ok = all.filter(p => p.pos === pos && !isInjured(p)).length; return `<span class="pc ${ok < ROSTER_MIN[pos] ? 'bad' : n < ROSTER_TARGET[pos] ? 'warn' : ''}"><b>${pos}</b>${n}<small>/${ROSTER_TARGET[pos]}</small></span>`; }).join('');
    const cols = [{ h: '#', k: 'number', cls: 'num' }, { h: 'Jugador', f: p => plink(p), sort: 'name' }, { h: 'Pos', f: p => posTag(p.pos), sort: 'pos' }, { h: 'Edad', k: 'age', sort: 'age' }, { h: 'Ovr', f: p => ovrBadge(p.ovr), sort: 'ovr' }, { h: 'Pot', f: p => `<span class="pot">${p.potential}</span>`, sort: 'pot' }, { h: 'Contrato', f: p => `${fmtM(capHit(p))} <small>· ${p.contract.years}a</small>${p.expiring ? ' <em class="now">vence</em>' : ''}`, sort: 'salary' }, { h: 'Forma', f: p => bar(p.form - 20, 60, 'form'), sort: 'form' }, { h: 'Fatiga', f: p => bar(p.fatigue, 100, p.fatigue > 60 ? 'warn' : ''), sort: 'fatigue' }, { h: 'Estado', f: p => inj(p) || '<span class="muted">Sano</span>' }, { h: 'Temporada', f: p => statLine(p) }];
    return card(`Plantilla · ${all.length}/${ROSTER_MAX}`, `<div class="pcs">${counts}</div>${tabs([['ALL', 'Todos'], ...POSITIONS.map(p => [p, p])], f, 'roster-pos')}${table({ cols, rows, cls: 'roster' })}`, { right: `<a class="btn small" href="#/market">Buscar jugadores</a>` });
  },
  handlers: { 'roster-pos'(app, el) { app.ui.rosterPos = el.dataset.v; app.refresh(); } },
};

// ------------------------------------------------------------------ Depth chart
const GROUPS = { off: ['QB', 'RB', 'WR', 'TE', 'OL'], def: ['DL', 'LB', 'CB', 'S'], st: ['K', 'P', 'KR', 'PR'] };
const ROWLABEL = ['Titular', 'Suplente', '3er string', '4to string', '5to string', '6to string', '7mo string', '8vo string'];
const groupTitle = { QB: 'Quarterback', RB: 'Running backs', WR: 'Wide receivers', TE: 'Tight ends', OL: 'Línea ofensiva', DL: 'Línea defensiva', LB: 'Linebackers', CB: 'Cornerbacks', S: 'Safeties', K: 'Kicker', P: 'Punter', KR: 'Retornador de kickoff', PR: 'Retornador de punt' };
function lineupText(lg, t, spec) {
  const P = lg.data.players, used = new Set(), out = [];
  for (const [pos, n] of Object.entries(spec)) { const L = t.depth[pos].map(id => P[id]).filter(p => p && !isInjured(p) && !used.has(p.id)); const take = L.slice(0, n); take.forEach(p => used.add(p.id)); out.push(`<span><b>${pos}</b> ${take.map(p => `${plink(p)} <small>${p.ovr}</small>`).join(', ')}${take.length < n ? ' <em class="loss">¡faltan!</em>' : ''}</span>`); }
  return out.join('');
}
const depth = {
  id: 'depth', title: 'Depth Chart', icon: '▤',
  render(app) {
    const lg = app.lg, t = lg.user, tab = app.ui.depthTab || 'off', P = lg.data.players, issues = depthIssues(lg, t);
    const grp = key => {
      const list = t.depth[key], isRet = key === 'KR' || key === 'PR';
      const rows = list.map((id, i) => { const p = P[id]; const val = isRet ? Math.round(retScore(p)) : ovrAt(p.ratings, key); return `<div class="drow ${i < SLOTS[key] ? 'starter' : ''} ${isInjured(p) ? 'hurt' : ''}"><span class="dl">${ROWLABEL[i] || `${i + 1}º`}</span>${posTag(p.pos)}<span class="dn">${plink(p)}</span><span class="dv" title="${isRet ? 'Puntuación de retorno' : 'Overall en esta posición'}">${val}</span><span class="dfat">${bar(p.fatigue, 100, p.fatigue > 60 ? 'warn' : '')}</span>${inj(p)}<span class="dbtn"><button data-act="d-up" data-k="${key}" data-id="${id}" ${i === 0 ? 'disabled' : ''}>▲</button><button data-act="d-dn" data-k="${key}" data-id="${id}" ${i === list.length - 1 ? 'disabled' : ''}>▼</button><button data-act="d-rm" data-k="${key}" data-id="${id}" ${list.length <= 1 ? 'disabled' : ''}>✕</button></span></div>`; }).join('');
      const others = lg.roster(t).filter(p => !list.includes(p.id)).map(p => ({ p, v: isRet ? Math.round(retScore(p)) : ovrAt(p.ratings, key) })).sort((a, b) => b.v - a.v).slice(0, 40);
      return card(groupTitle[key], `<div class="dlist">${rows}</div><select data-change="d-add" data-k="${key}"><option value="">+ Añadir jugador…</option>${others.map(({ p, v }) => `<option value="${p.id}">${esc(p.name)} (${p.pos} ${v})</option>`).join('')}</select>`, { cls: 'dgroup' });
    };
    let pk = '';
    if (tab === 'off') pk = card('Paquetes ofensivos (quién jugaría)', `<div class="pkgs">${Object.entries(OFF_PACKAGES).map(([k, spec]) => `<div class="pkg"><h5>${k} personnel <small>${spec.RB} RB · ${spec.TE} TE · ${spec.WR} WR</small></h5><div class="pkgl"><span><b>QB</b> ${lineupText(lg, t, { QB: 1 }).replace(/<\/?span[^>]*>/g, '')}</span>${lineupText(lg, t, { RB: spec.RB, WR: spec.WR, TE: spec.TE, OL: 5 })}</div></div>`).join('')}</div><p class="muted small">El motor usa 11 (3 WR), 12 (2 TE) y 21 (2 RB) según la jugada. WR1/WR2 juegan de X/Z y el tercero de slot; TE2 entra en 12; RB2 en 21.</p>`);
    if (tab === 'def') pk = card('Paquetes defensivos: base, nickel, dime', `<div class="pkgs">${Object.entries(DEF_PACKAGES).map(([k, spec]) => `<div class="pkg"><h5>${k === 'nickel' || k === 'dime' ? k.toUpperCase() : 'Base ' + k} <small>${spec.DL} DL · ${spec.LB} LB · ${spec.CB} CB · ${spec.S} S</small></h5><div class="pkgl">${lineupText(lg, t, spec)}</div></div>`).join('')}</div><p class="muted small">El paquete se elige en <a href="#/gameplan">Gameplan</a> (auto / base / nickel / dime) y contra 3 WR el motor usa nickel por defecto.</p>`);
    return `${issues.length ? `<div class="banner warn">${issues.map(esc).join('<br>')}</div>` : ''}<div class="row-actions between">${tabs([['off', 'Ataque'], ['def', 'Defensa'], ['st', 'Special teams']], tab, 'depth-tab')}<button class="btn" data-act="d-auto">Depth chart automático</button></div>
      <p class="muted small">Los titulares del depth chart juegan en el motor 3D: sus atributos reales determinan bloqueos, rutas, coberturas y patadas. Si un titular se lesiona o se agota, entra el siguiente de la lista. Puedes colocar a cualquier jugador en cualquier grupo (ej. un WR como retornador).</p>
      <div class="grid g${tab === 'st' ? 4 : tab === 'off' ? 3 : 2} dcols">${GROUPS[tab].map(grp).join('')}</div>${pk}`;
  },
  handlers: {
    'depth-tab'(app, el) { app.ui.depthTab = el.dataset.v; app.refresh(); },
    'd-up'(app, el) { depthMove(app.lg.user, el.dataset.k, el.dataset.id, -1); app.commit(); app.refresh(); },
    'd-dn'(app, el) { depthMove(app.lg.user, el.dataset.k, el.dataset.id, 1); app.commit(); app.refresh(); },
    'd-rm'(app, el) { depthRemove(app.lg.user, el.dataset.k, el.dataset.id); app.commit(); app.refresh(); },
    'd-auto'(app) { app.confirm('Reordenar todo el depth chart por overall. ¿Continuar?', () => { autoDepth(app.lg, app.lg.user); app.commit(); app.refresh(); app.toast('Depth chart reordenado.'); }); },
  },
  changes: { 'd-add'(app, el) { if (!el.value) return; depthAdd(app.lg.user, el.dataset.k, el.value); app.commit(); app.refresh(); } },
};

// ------------------------------------------------------------------ Player profile
const SUM_LABEL = { passAtt: 'Pases intentados', passComp: 'Pases completos', passYds: 'Yardas de pase', passTD: 'TD de pase', int: 'Intercepciones lanzadas', sacksTaken: 'Sacks recibidos', rushAtt: 'Carreras', rushYds: 'Yardas de carrera', rushTD: 'TD de carrera', fumbles: 'Fumbles', tgt: 'Targets', rec: 'Recepciones', recYds: 'Yardas de recepción', recTD: 'TD de recepción', drops: 'Drops', tackles: 'Tackles', sacks: 'Sacks', ints: 'Intercepciones', ff: 'Fumbles forzados', missed: 'Tackles fallados', fgm: 'FG convertidos', fga: 'FG intentados', xpm: 'XP convertidos', xpa: 'XP intentados', punts: 'Punts', puntYds: 'Yardas de punt' };
const player = {
  id: 'player', title: 'Player Profile', icon: '◉',
  render(app, param) {
    const lg = app.lg, d = lg.data;
    let p = param ? lg.player(param) : app.ui.lastPlayer ? lg.player(app.ui.lastPlayer) : null;
    if (!p) p = lg.roster(lg.user).sort((a, b) => b.ovr - a.ovr)[0];
    app.ui.lastPlayer = p.id;
    const team = p.teamId ? lg.team(p.teamId) : null, mine = p.teamId === d.userTeam, c = p.contract, ask = askFor(lg, p, d.userTeam);
    const keys = KEY_ATTRS[p.pos], phys = ['speed', 'acceleration', 'agility', 'strength'].filter(k => !keys.includes(k));
    const attr = k => `<div class="attr"><span>${LABELS[k]}</span>${bar(p.ratings[k], 100, p.ratings[k] >= 85 ? 'elite' : p.ratings[k] < 60 ? 'low' : '')}<b>${p.ratings[k]}</b></div>`;
    const gp = lg.user.gameplan, featuredRB = gp.featured.RB === p.id, featuredT = gp.featured.target === p.id;
    const hist = [{ year: d.year + ' (actual)', team: p.teamId, ovr: p.ovr, age: p.age, ...p.season }, ...[...p.history].reverse()];
    const histRows = table({ cols: [{ h: 'Temporada', k: 'year' }, { h: 'Equipo', f: h => h.team ?? '—' }, { h: 'Edad', k: 'age' }, { h: 'Ovr', k: 'ovr' }, { h: 'PJ', k: 'gp' }, { h: 'Estadísticas', f: h => statLine({ pos: p.pos, season: h }) }], rows: hist });
    const sumRows = Object.entries(p.season).filter(([k, v]) => k !== 'gp' && v).map(([k, v]) => `<div class="kv"><span>${SUM_LABEL[k] || k}</span><b>${Math.round(v * 10) / 10}</b></div>`).join('') || '<div class="empty">Sin estadísticas esta temporada.</div>';
    const actions = mine ? `<button class="btn" data-act="p-renew" data-id="${p.id}">Renovar</button><button class="btn danger" data-act="p-release" data-id="${p.id}">Liberar</button>${['RB'].includes(p.pos) ? `<button class="btn ${featuredRB ? 'primary' : ''}" data-act="p-feat-rb" data-id="${p.id}">${featuredRB ? '★ RB destacado' : '☆ Destacar como RB'}</button>` : ''}${['WR', 'TE', 'RB'].includes(p.pos) ? `<button class="btn ${featuredT ? 'primary' : ''}" data-act="p-feat-t" data-id="${p.id}">${featuredT ? '★ Objetivo preferido del QB' : '☆ Objetivo preferido del QB'}</button>` : ''}` : (!p.teamId ? `<button class="btn primary" data-act="p-sign" data-id="${p.id}">Negociar fichaje</button>` : `<a class="btn" href="#/market">Ver traspasos</a>`);
    return `<div class="phead"><div class="pnum">#${p.number}</div><div><h1>${esc(p.name)}</h1><p>${posTag(p.pos)} ${p.age} años · ${team ? `${teamTag(team)} ${esc(team.name)}` : 'Agente libre'} ${inj(p)}</p></div><div class="pbig"><small>OVR</small>${ovrBadge(p.ovr)}<small>POT ${p.potential}</small></div></div>
     <div class="row-actions">${actions}<button class="btn" data-act="p-compare" data-id="${p.id}">+ Comparar</button></div>
     <div class="grid g3">${card('Atributos (los que lee el motor)', `<div class="attrs">${keys.map(attr).join('')}${phys.map(attr).join('')}</div><p class="muted small">Estos valores se convierten directamente en las estadísticas del jugador 3D (0.30–0.98), modificadas por fatiga y forma.</p>`)}
      ${card('Estado', `<div class="attrs"><div class="attr"><span>Forma</span>${bar(p.form - 20, 60, 'form')}<b>${Math.round(p.form)}</b></div><div class="attr"><span>Fatiga</span>${bar(p.fatigue, 100, p.fatigue > 60 ? 'warn' : '')}<b>${Math.round(p.fatigue)}</b></div><div class="attr"><span>Moral</span>${bar(p.morale)}<b>${Math.round(p.morale)}</b></div><div class="attr"><span>Resistencia</span>${bar(p.stamina)}<b>${Math.round(p.stamina)}</b></div><div class="attr"><span>Durabilidad</span>${bar(p.durability)}<b>${Math.round(p.durability)}</b></div></div>
       <div class="kvs">${p.injury ? `<div class="kv"><span>Lesión</span><b class="loss">${esc(p.injury.type)} · ${p.injury.weeks} sem</b></div>` : '<div class="kv"><span>Lesión</span><b class="win">Sano</b></div>'}</div>`)}
      ${card('Contrato', c ? `<div class="kvs"><div class="kv"><span>Salario</span><b>${fmtM(c.salary)}</b></div><div class="kv"><span>Bonus de firma</span><b>${fmtM(c.bonus)}</b></div><div class="kv"><span>Años restantes</span><b>${c.years}${p.expiring ? ' (vencido)' : ''}</b></div><div class="kv"><span>Costo anual</span><b>${fmtM(capHit(p))}</b></div><div class="kv"><span>Dead cap si se libera</span><b>${fmtM(deadCapFor(p))}</b></div><div class="kv"><span>Valor de mercado</span><b>${fmtM(marketValue(p))}</b></div></div>` : `<div class="kvs"><div class="kv"><span>Sin contrato</span><b>Agente libre</b></div><div class="kv"><span>Pide</span><b>${fmtM(offerValue(ask))}/año · ${ask.years}a</b></div><div class="kv"><span>Valor de mercado</span><b>${fmtM(marketValue(p))}</b></div></div>`)}</div>
     <div class="grid g2">${card('Estadísticas de la temporada', `<div class="kvs">${sumRows}</div>`)}${card('Últimos partidos', p.log.length ? `<div class="glog">${[...p.log].reverse().map(l => `<div><small>${l.year} S${l.week}</small><b>${l.res} vs ${l.opp}</b><span>${esc(l.text)}</span></div>`).join('')}</div>` : '<div class="empty">Sin partidos registrados.</div>')}</div>
     ${card('Historial', histRows)}`;
  },
  handlers: {
    'p-renew'(app, el) { openNegotiation(app, el.dataset.id, 'renew'); },
    'p-sign'(app, el) { openNegotiation(app, el.dataset.id, 'sign'); },
    'p-release'(app, el) { const p = app.lg.player(el.dataset.id); app.confirm(`¿Liberar a ${p.name}? Bonus pendiente: ${fmtM(deadCapFor(p))}.`, () => { const r = releasePlayer(app.lg, app.lg.data.userTeam, p.id); app.toast(r.message); app.commit(); app.go('roster'); }, { yes: 'Liberar', danger: true }); },
    'p-feat-rb'(app, el) { const f = app.lg.user.gameplan.featured; f.RB = f.RB === el.dataset.id ? null : el.dataset.id; app.commit(); app.refresh(); },
    'p-feat-t'(app, el) { const f = app.lg.user.gameplan.featured; f.target = f.target === el.dataset.id ? null : el.dataset.id; app.commit(); app.refresh(); },
    'p-compare'(app, el) { const c = app.ui.compare ??= []; if (!c.includes(el.dataset.id)) c.push(el.dataset.id); if (c.length > 3) c.shift(); app.toast(`Comparador: ${c.length} jugador(es). Ábrelo en Mercado.`); },
  },
};
export const squadPages = [roster, depth, player];
