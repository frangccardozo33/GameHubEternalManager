import { ROLES, POS_NAMES, TEAM_POOL, TEAM_ROLES, USAGE, ATTRIBUTES, ATTR_LABELS } from '../manager/data.js';
import { PLAYER_TAGS, valueOf, autoRole } from '../manager/players.js';
import { LIM, prefYears } from '../manager/market.js';
import { INTENSITY, facilityCost, capacityOf, REV_KEYS, EXP_KEYS, sumKeys } from '../manager/club.js';
import { pg, pct, fmt, per36, ts, efg, eff, astTov, usg, teamAdvanced } from '../manager/stats.js';
import { esc, money, signed, cls, meter, pill, dot, ovrColor, link, table, radar, lineChart, attrBars, cmpRow, tabs } from './widgets.js';
import { tacticsHtml, PRESETS, optHtml } from './tacdefs.js';
import { fmtDay } from '../manager/dates.js';

const tname = (g, id) => g.team(id).name;
const tag = (g, id) => `${dot(g.team(id).color)}${esc(g.team(id).short)}`;
const teamLink = (g, id) => `${dot(g.team(id).color)}${esc(g.team(id).name)}`;
const PRESET_BO = { '1,1,1': 'Todas a 1 partido', '3,3,5': 'Al mejor de 3-3-5', '3,5,7': 'Al mejor de 3-5-7', '5,5,7': 'Al mejor de 5-5-7' };
const line = (m, side, pid) => m.box[side].find(b => b.pid === pid);

// ---------------- nueva partida ----------------
export function newgame({ g, ui, hasSave }) {
  const c = ui.cfg, sel = ui.newTeam ?? 0, pv = ui.preview;
  const order = pv ? [...pv.s.teams].sort((a, b) => pv.teamOvr(b) - pv.teamOvr(a)).map(t => t.id) : [];
  const cards = TEAM_POOL.slice(0, c.teams).map(([city, nick, short, color], i) => { const t = pv?.team(i), rank = order.indexOf(i) + 1;
    return `<div class="teamcard ${i === sel ? 'sel' : ''}" data-act="pickTeam" data-id="${i}"><b>${dot(color)}${esc(city)} ${esc(nick)}</b><small class="muted">${short}${t ? ` · OVR ${pv.teamOvr(t).toFixed(0)} · ${rank}.º de ${c.teams}` : ''}</small>${t ? `<small class="muted">Masa salarial ${pv.payroll(t).toFixed(0)} M€ · ${rank <= 2 ? '<span class="pos">Favorito</span>' : rank >= c.teams - 1 ? '<span class="neg">Proyecto</span>' : 'Competitivo'}</small>` : ''}</div>`; }).join('');
  return `<h1>Basketball Manager<span>.</span></h1><p class="sub">Gestión de plantilla, tácticas y temporada, con partidos en 3D.</p>
  <div class="grid g21"><div class="panel"><h3>1 · Elige tu equipo <button class="btn ghost sm" data-act="regen">Regenerar liga</button></h3><div class="grid g4">${cards}</div>
    <div class="hint">La liga se genera aleatoriamente: hay favoritos y proyectos. Un OVR más alto significa una plantilla mejor; los proyectos son más difíciles pero más agradecidos.</div></div>
  <div class="panel"><h3>2 · Formato de la liga</h3>
    <div class="sl" style="grid-template-columns:130px 1fr"><span>Equipos</span><select class="f" data-cfg="teams">${optHtml([[6, '6'], [8, '8'], [10, '10'], [12, '12']], c.teams)}</select></div>
    <div class="sl" style="grid-template-columns:130px 1fr"><span>Partidos por rival</span><select class="f" data-cfg="meetings">${optHtml([[2, '2 (ida y vuelta)'], [4, '4']], c.meetings)}</select></div>
    <div class="sl" style="grid-template-columns:130px 1fr"><span>Playoffs</span><select class="f" data-cfg="playoffTeams">${optHtml([[0, 'Sin playoffs'], [2, 'Final directa'], [4, '4 equipos'], [6, '6 equipos'], [8, '8 equipos']], c.playoffTeams)}</select></div>
    <div class="sl" style="grid-template-columns:130px 1fr"><span>Series</span><select class="f" data-cfg="bestOf">${optHtml(Object.entries(PRESET_BO), c.bestOf.join(','))}</select></div>
    <div class="sl" style="grid-template-columns:130px 1fr"><span>Duración del cuarto</span><select class="f" data-cfg="periodSeconds">${optHtml([[180, '3 min (simulación rápida)'], [300, '5 min'], [480, '8 min'], [600, '10 min']], c.periodSeconds)}</select></div>
    <div class="sl" style="grid-template-columns:130px 1fr"><span>Reloj de posesión</span><select class="f" data-cfg="shotClock">${optHtml([[24, '24 s'], [30, '30 s'], [14, '14 s']], c.shotClock)}</select></div>
    <p class="muted" style="font-size:10px;line-height:1.6">Cuartos más largos generan más datos por partido, pero la simulación de los partidos de fondo tarda más (~25 s por temporada con cuartos de 3 min y 8 equipos).</p>
    <div class="row" style="margin-top:14px"><button class="btn pri" data-act="startGame">Comenzar carrera →</button>${hasSave ? '<button class="btn ghost" data-act="continueGame">Continuar partida guardada</button>' : ''}<button class="btn ghost" data-go="exhibition">Partido de exhibición</button></div></div></div>`;
}

// ---------------- dashboard ----------------
export function dashboard({ g, ui }) {
  const s = g.s, u = g.user, st = g.standings(), pos = st.findIndex(x => x.id === u.id) + 1, rec = st.find(x => x.id === u.id), ps = g.roster(u);
  const last = s.inbox.filter(n => n.type === 'result').slice(0, 5);
  const day = g.currentDay(), entry = g.userEntry();
  let hero;
  if (s.phase === 'offseason') {
    const h = s.history[0];
    hero = `<div class="hero"><div><div class="eyebrow">TEMPORADA ${h.season} FINALIZADA</div><h2>Campeón: ${esc(tname(g, h.champion))}</h2><p class="sub" style="margin:0">Tu posición en liga regular: ${h.userPos}.º${h.mvp ? ` · MVP: ${esc(h.mvp.name)}` : ''}${h.scorer ? ` · Máx. anotador: ${esc(h.scorer.name)} (${h.scorer.ppg})` : ''}</p></div>
      <div class="row">${s.off?.stage === 'draft' ? '<button class="btn" data-go="scouting">Ir al draft</button>' : ''}<button class="btn ghost" data-go="contracts">Contratos${g.roster(u).filter(p => p.contract.years <= 1).length ? ` (${g.roster(u).filter(p => p.contract.years <= 1).length} por renovar)` : ''}</button><button class="btn ghost" data-go="market">Mercado</button><button class="btn pri" data-act="nextSeason">Comenzar temporada ${s.season + 1} →</button></div></div>`;
  } else if (entry) {
    const opp = g.team(entry.home === u.id ? entry.away : entry.home), oRec = st.find(x => x.id === opp.id), home = entry.home === u.id;
    hero = `<div class="hero"><div><div class="eyebrow">${esc(day.label.toUpperCase())}${day.kind === 'playoff' ? ' · PLAYOFFS' : day.kind === 'cup' ? ' · COPA' : ''}</div>
      <div class="vs"><div class="tm"><b>${dot(u.color)}${esc(u.short)}</b><small>${rec.w}-${rec.l} · OVR ${g.teamOvr(u).toFixed(0)}</small></div><span class="at">${home ? 'vs' : '@'}</span><div class="tm"><b>${dot(opp.color)}${esc(opp.short)}</b><small>${oRec.w}-${oRec.l} · OVR ${g.teamOvr(opp).toFixed(0)}</small></div></div>
      <p class="sub" style="margin:8px 0 0">${esc(opp.name)} · ${home ? 'juegas en casa' : 'juegas fuera'} · sus tácticas: ritmo ${opp.tactics.tempo}, ${opp.tactics.defense === 'man' ? 'defensa individual' : 'defensa en zona'}</p></div>
      <div class="row"><button class="btn pri" data-act="play" data-mode="view">▶ Ver partido en 3D</button><button class="btn" data-act="play" data-mode="sim">⏩ Simular partido</button><button class="btn ghost" data-go="tactics">Tácticas</button></div></div>`;
  } else {
    hero = `<div class="hero"><div><div class="eyebrow">${esc(day?.label?.toUpperCase() ?? '')}${s.phase === 'regular' ? ' · ' + fmtDay(s.season, s.day).toUpperCase() : ''}</div><h2>${s.phase === 'playoffs' ? 'Tu equipo no juega en esta ronda' : 'Tu equipo descansa'}</h2><p class="sub" style="margin:0">Puedes simular la jornada para avanzar.</p></div><div class="row"><button class="btn pri" data-act="simDay">Simular jornada</button></div></div>`;
  }
  const skip = s.phase !== 'offseason' ? `<div class="row" style="margin-top:12px"><button class="btn ghost sm" data-act="simDay">Simular solo esta jornada (sin jugar)</button><button class="btn ghost sm" data-act="simPhase">Simular hasta el final de ${s.phase === 'regular' ? 'la liga regular' : 'los playoffs'}</button></div>` : '';
  const top = [...ps].filter(p => p.st.gp).sort((a, b) => b.st.pts / b.st.gp - a.st.pts / a.st.gp).slice(0, 4);
  const tired = ps.filter(p => p.cond < 60).length, unhappy = ps.filter(p => p.morale < 45).length, payroll = g.payroll(u);
  const hints = [];
  const hurt = ps.filter(p => p.inj);
  if (hurt.length) hints.push(`<div class="hint warn">Lesionados: ${hurt.map(p => `${esc(p.name)} (${p.inj.games} PJ)`).join(', ')}.</div>`);
  if (tired >= 2) hints.push(`<div class="hint warn">${tired} jugadores tienen la condición por debajo de 60. Reparte minutos o baja el ritmo.</div>`);
  if (unhappy) hints.push(`<div class="hint warn">${unhappy} jugador(es) con la moral baja. Revisa los minutos y su rol.</div>`);
  if (g.fin.cash < 0) hints.push('<div class="hint warn">La caja está en negativo: no puedes fichar hasta recuperarla. Revisa gastos en Finanzas.</div>');
  if (ps.length < LIM.min) hints.push(`<div class="hint warn">Tienes ${ps.length} jugadores: necesitas ${LIM.min} para jugar. Se fichará a mínimos automáticamente si no actúas.</div>`);
  if (ps.length > LIM.max) hints.push(`<div class="hint warn">Plantilla de ${ps.length}: el máximo es ${LIM.max}. Al empezar la temporada se liberará a los peores.</div>`);
  if (s.phase === 'offseason' && ps.some(p => p.contract.years <= 1)) hints.push('<div class="hint warn">Hay contratos que expiran: si no los renuevas, los jugadores se marcharán al empezar la temporada.</div>');
  if (u.chem < 50) hints.push('<div class="hint">La química es baja: mantener el mismo quinteto varios partidos la mejora.</div>');
  return `<h1>${esc(u.name)}<span>.</span></h1><p class="sub">${esc(g.timeline())} · Temporada ${s.season}</p>${hero}${skip}
  <div class="grid g21" style="margin-top:16px"><div class="grid">
    <div class="panel"><h3>Estado del equipo</h3><div class="grid g4"><div class="kpi"><small>Clasificación</small><b>${pos}.º</b></div><div class="kpi"><small>Balance</small><b>${rec.w}-${rec.l}</b></div><div class="kpi"><small>Química</small><b>${u.chem}</b></div><div class="kpi"><small>Nivel (OVR)</small><b>${g.teamOvr(u).toFixed(0)}</b></div>
      <div class="kpi"><small>Moral media</small><b>${Math.round(ps.reduce((a, p) => a + p.morale, 0) / ps.length)}</b></div><div class="kpi"><small>Condición media</small><b>${Math.round(ps.reduce((a, p) => a + p.cond, 0) / ps.length)}</b></div><div class="kpi"><small>Masa salarial</small><b>${payroll.toFixed(0)} M€</b></div><div class="kpi"><small>Caja</small><b class="${g.fin.cash < 0 ? 'neg' : ''}">${g.fin.cash.toFixed(0)} M€</b></div></div>${hints.join('')}</div>
    <div class="panel"><h3>Destacados de tu equipo</h3>${top.length ? table([{ k: 'n', label: 'Jugador', l: true, html: r => link('player', r.id, r.name) }, { k: 'g', label: 'PJ', html: r => r.st.gp }, { k: 'pts', label: 'PTS', html: r => fmt(pg(r.st, 'pts')) }, { k: 'reb', label: 'REB', html: r => fmt(pg(r.st, 'reb')) }, { k: 'ast', label: 'AST', html: r => fmt(pg(r.st, 'ast')) }, { k: 'ts', label: 'TS%', html: r => fmt(ts(r.st), 0) }], top) : '<p class="muted" style="font-size:11px">Aún no hay estadísticas esta temporada.</p>'}</div>
    <div class="panel"><h3>Bandeja de entrada</h3>${s.inbox.slice(0, 7).map(n => `<div class="news"><b>${esc(n.title)}</b>${esc(n.text)}<br><small>${fmtDay(n.season, n.day)} · jornada ${n.day + 1}</small></div>`).join('')}</div></div>
  <div class="grid"><div class="panel"><h3>Clasificación <a class="lnk" data-go="standings" style="font-size:9px">ver todo</a></h3>${miniStandings(g, st)}</div>
    <div class="panel"><h3>Últimos resultados</h3>${last.length ? last.map(n => `<div class="res"><span>${esc(n.text)}</span><span class="tag ${n.title.startsWith('Vic') ? 'w' : 'l'}">${n.title.startsWith('Vic') ? 'V' : 'D'}</span></div>`).join('') : '<p class="muted" style="font-size:11px">Sin partidos jugados.</p>'}</div></div></div>`;
}
function miniStandings(g, st) {
  const cut = g.cfg.playoffTeams;
  return table([{ k: 'p', label: '#', html: r => r.i + 1 }, { k: 't', label: 'Equipo', l: true, html: r => teamLink(g, r.id) }, { k: 'w', label: 'V-D', html: r => `${r.w}-${r.l}` }, { k: 'd', label: 'DIF', html: r => `<span class="${cls(r.diff)}">${signed(r.diff)}</span>` }],
    st.map((r, i) => ({ ...r, i })), { meId: g.user.id, cut: cut && cut < st.length ? cut - 1 : undefined });
}

// ---------------- plantilla ----------------
export function roster({ g, ui }) {
  const u = g.user, ps = g.roster(u), starters = new Set(u.lineup.starters), dressed = new Set([...u.lineup.starters, ...u.lineup.bench]);
  const cols = [
    { k: 'num', label: '#', val: p => p.num, html: p => p.num }, { k: 'name', label: 'Jugador', l: true, val: p => p.name, html: p => `${starters.has(p.id) ? '★ ' : dressed.has(p.id) ? '' : '<span class="muted">– </span>'}${link('player', p.id, p.name)} ${p.inj ? pill('Lesión · ' + p.inj.games + ' PJ', 'bad') : ''}${PLAYER_TAGS(p).slice(0, 2).map(t => pill(t)).join('')}` },
    { k: 'role', label: 'Pos', val: p => ROLES.indexOf(p.role), html: p => p.role }, { k: 'age', label: 'Edad', val: p => p.age, html: p => p.age },
    { k: 'ovr', label: 'OVR', val: p => p.ovr, html: p => `<b style="color:${ovrColor(p.ovr)}">${p.ovr}</b>` }, { k: 'pot', label: 'POT', val: p => p.pot, html: p => p.pot },
    { k: 'form', label: 'Forma', val: p => p.form, html: p => meter(p.form) }, { k: 'cond', label: 'Cond.', val: p => p.cond, html: p => meter(p.cond) }, { k: 'mor', label: 'Moral', val: p => p.morale, html: p => meter(p.morale) },
    { k: 'crole', label: 'Rol', val: p => p.contract?.role ?? '', html: p => TEAM_ROLES[p.contract?.role]?.[0] ?? '-' }, { k: 'sal', label: 'Salario', val: p => p.contract?.salary ?? 0, html: p => money(p.contract?.salary ?? 0) }, { k: 'yrs', label: 'Años', val: p => p.contract?.years ?? 0, html: p => p.contract?.years ?? '-' },
    { k: 'gp', label: 'PJ', val: p => p.st.gp, html: p => p.st.gp }, { k: 'min', label: 'MIN', val: p => pg(p.st, 'min'), html: p => fmt(pg(p.st, 'min')) }, { k: 'pts', label: 'PTS', val: p => pg(p.st, 'pts'), html: p => fmt(pg(p.st, 'pts')) }, { k: 'reb', label: 'REB', val: p => pg(p.st, 'reb'), html: p => fmt(pg(p.st, 'reb')) }, { k: 'ast', label: 'AST', val: p => pg(p.st, 'ast'), html: p => fmt(pg(p.st, 'ast')) },
  ];
  const sort = ui.sort.roster ?? { k: 'ovr', dir: 'desc' }; const sorted = { roster: sort };
  const depth = ROLES.map(r => { const l = ps.filter(p => p.role === r).sort((a, b) => b.ovr - a.ovr); return `<div class="row spread" style="padding:6px 0;border-bottom:1px solid #26343a;font-size:11px"><b>${r} <span class="muted">${POS_NAMES[r]}</span></b><span>${l.slice(0, 3).map(p => `${esc(p.name)} <b style="color:${ovrColor(p.ovr)}">${p.ovr}</b>`).join(' · ') || '<span class="neg">Sin jugadores</span>'}</span></div>`; }).join('');
  const bench = ps.filter(p => !starters.has(p.id)).sort((a, b) => b.ovr - a.ovr).slice(0, 5), depthScore = bench.reduce((a, p) => a + p.ovr, 0) / Math.max(1, bench.length);
  const avgM = ps.reduce((a, p) => a + p.morale, 0) / ps.length;
  return `<h1>Plantilla<span>.</span></h1><p class="sub">${ps.length} jugadores · masa salarial ${money(g.payroll(u))} · ★ titular · “–” no convocado para el partido</p>
  <div class="panel">${table(cols, ps, { sort: sorted, key: 'roster', meId: null })}</div>
  <div class="grid g3" style="margin-top:16px"><div class="panel"><h3>Profundidad por posición</h3>${depth}</div>
  <div class="panel"><h3>Química y moral</h3><div class="grid g2"><div class="kpi"><small>Química</small><b>${u.chem}</b></div><div class="kpi"><small>Moral media</small><b>${Math.round(avgM)}</b></div><div class="kpi"><small>Profundidad (banca)</small><b>${depthScore.toFixed(0)}</b></div><div class="kpi"><small>Quinteto igual</small><b>${u.streak + 1} p.</b></div></div>
    <div class="hint">La química sube al repetir el mismo quinteto y con moral alta. Da hasta ±3 puntos en pase, visión, decisiones y defensa durante el partido.</div></div>
  <div class="panel"><h3>Roles del equipo</h3>${Object.entries(TEAM_ROLES).map(([k, [l]]) => { const n = ps.filter(p => (p.contract?.role) === k); return `<div class="row spread" style="padding:5px 0;border-bottom:1px solid #26343a;font-size:11px"><b>${l}</b><span>${n.map(p => esc(p.name)).join(', ') || '<span class="muted">—</span>'}</span></div>`; }).join('')}</div></div>`;
}

// ---------------- perfil de jugador ----------------
export function player({ g, ui }) {
  const p = g.player(ui.arg); if (!p) return '<p>Jugador no encontrado.</p>';
  const team = p.teamId != null ? g.team(p.teamId) : null, mine = p.teamId === g.s.userId, st = p.st, mean = ATTRIBUTES.reduce((s, k) => s + p.a[k], 0) / ATTRIBUTES.length;
  const ranked = [...ATTRIBUTES].sort((a, b) => p.a[b] - p.a[a]);
  const strengths = ranked.slice(0, 3).map(k => `<div class="attr"><span>${ATTR_LABELS[k]}</span><div class="b"><i class="hi" style="width:${p.a[k]}%"></i></div><b>${p.a[k]}</b></div>`).join('');
  const weak = ranked.slice(-3).reverse().map(k => `<div class="attr"><span>${ATTR_LABELS[k]}</span><div class="b"><i class="lo" style="width:${p.a[k]}%"></i></div><b>${p.a[k]}</b></div>`).join('');
  const shotsN = st.fga || 1, tend = st.gp ? [
    ['Uso (posesiones/36)', fmt(usg(st))], ['% de tiros de 3', fmt(st.tpa / shotsN * 100, 0) + '%'], ['% de tiros al aro', fmt(st.rima / shotsN * 100, 0) + '%'], ['Acierto al aro', st.rima ? fmt(pct(st.rim, st.rima), 0) + '%' : '-'], ['Asistencias/pérdida', fmt(astTov(st), 2)], ['Faltas/36', fmt(per36(st, 'pf'))], ['Rebotes ofensivos/36', fmt(per36(st, 'oreb'))],
  ] : [];
  const games = Object.values(g.s.matches).filter(m => m.season === g.s.season && (line(m, 'h', p.id) || line(m, 'a', p.id))).sort((a, b) => b.day - a.day).slice(0, 6);
  const recent = games.map(m => { const side = line(m, 'h', p.id) ? 'h' : 'a', l = line(m, side, p.id), opp = g.team(side === 'h' ? m.away : m.home), won = (side === 'h') === (m.hs > m.as);
    return `<tr class="click" data-go="result" data-arg="${m.id}"><td class="l"><span class="tag ${won ? 'w' : 'l'}">${won ? 'V' : 'D'}</span> ${side === 'h' ? 'vs' : '@'} ${esc(opp.short)}</td><td>${fmt(l.min)}</td><td>${l.pts}</td><td>${l.reb}</td><td>${l.ast}</td><td>${l.stl}/${l.blk}</td><td>${l.fgm}/${l.fga}</td><td class="${cls(l.pm)}">${signed(l.pm)}</td></tr>`; }).join('');
  const seasonRow = (label, s0) => s0.gp ? `<tr><td class="l">${label}</td><td>${s0.gp}</td><td>${fmt(pg(s0, 'min'))}</td><td>${fmt(pg(s0, 'pts'))}</td><td>${fmt(pg(s0, 'reb'))}</td><td>${fmt(pg(s0, 'ast'))}</td><td>${fmt(pg(s0, 'stl'))}</td><td>${fmt(pg(s0, 'blk'))}</td><td>${fmt(pg(s0, 'tov'))}</td><td>${fmt(pct(s0.fgm, s0.fga), 0)}%</td><td>${fmt(pct(s0.tpm, s0.tpa), 0)}%</td><td>${fmt(pct(s0.ftm, s0.fta), 0)}%</td><td>${fmt(ts(s0), 0)}%</td><td>${fmt(eff(s0) / s0.gp)}</td></tr>` : '';
  const hist = p.hist.map(h => seasonRow(`T${h.s} · ${h.team != null ? esc(g.team(h.team)?.short ?? '') : '-'}`, h)).join('');
  const evo = [...p.ovrHist, { s: g.s.season, ovr: p.ovr, pot: p.pot }];
  const c = p.contract;
  return `<div class="row spread"><div><div class="eyebrow">${team ? teamLink(g, team.id) : 'AGENTE LIBRE'} · #${p.num}</div><h1 style="margin:0">${esc(p.first)} ${esc(p.last)}<span>.</span></h1><p class="sub" style="margin:4px 0 0">${POS_NAMES[p.role]} (${p.role}) · ${p.age} años · ${p.h.toFixed(2)} m · valor de mercado ${money(valueOf(p))}</p></div>
    <div class="row"><div class="kpi"><small>OVR</small><b style="color:${ovrColor(p.ovr)}">${p.ovr}</b></div><div class="kpi"><small>Potencial</small><b>${p.pot}</b></div><div class="kpi"><small>Forma</small><b>${Math.round(p.form)}</b></div><div class="kpi"><small>Condición</small><b>${Math.round(p.cond)}</b></div><div class="kpi"><small>Moral</small><b>${Math.round(p.morale)}</b></div></div></div>
  <div style="margin:10px 0 18px">${PLAYER_TAGS(p).map(t => pill(t, 'pri')).join('')}</div>
  <div class="grid g3"><div class="panel"><h3>Atributos</h3>${radar(p.a)}${attrBars(p.a)}</div>
  <div class="grid" style="align-content:start"><div class="panel"><h3>Fortalezas</h3>${strengths}</div><div class="panel"><h3>Debilidades</h3>${weak}</div>
    <div class="panel"><h3>Contrato</h3>${c ? `<div class="grid g2"><div class="kpi"><small>Salario</small><b>${money(c.salary)}</b></div><div class="kpi"><small>Años</small><b>${c.years}</b></div></div><p style="font-size:11px">Rol: <b>${TEAM_ROLES[c.role]?.[0] ?? '-'}</b>${c.bonus ? ` · Bonus ${money(c.bonus)}` : ''}</p><div class="row">${mine && c.years <= 1 ? `<button class="btn sm pri" data-act="negOpen" data-kind="renew" data-id="${p.id}">Renovar</button>` : ''}${mine ? `<button class="btn sm ghost" data-act="release" data-id="${p.id}">Liberar</button>` : ''}</div>` : `<p class="muted" style="font-size:11px">Sin contrato.</p>${g.s.fa.includes(p.id) ? `<button class="btn sm pri" data-act="negOpen" data-kind="fa" data-id="${p.id}">Ofertar contrato</button>` : ''}`}</div></div>
  <div class="grid" style="align-content:start"><div class="panel"><h3>Tendencias</h3>${tend.length ? tend.map(([k, v]) => `<div class="row spread" style="padding:5px 0;border-bottom:1px solid #26343a;font-size:11px"><span>${k}</span><b>${v}</b></div>`).join('') : '<p class="muted" style="font-size:11px">Sin partidos jugados esta temporada.</p>'}</div>
    <div class="panel"><h3>Evolución</h3>${lineChart(evo.map(e => ({ s: e.s, ovr: e.ovr, pot: e.pot })))}</div>${mine ? `<div class="panel"><h3>Prioridad de balón</h3><select class="f" data-act="setUsage" data-id="${p.id}">${Object.entries(USAGE).map(([k, [l]]) => `<option value="${k}"${(g.user.usage[p.id] ?? 'normal') === k ? ' selected' : ''}>${l}</option>`).join('')}</select></div>` : ''}</div></div>
  <div class="panel" style="margin-top:16px"><h3>Estadísticas</h3><div class="scroll"><table class="tbl"><thead><tr><th class="l">Temporada</th><th>PJ</th><th>MIN</th><th>PTS</th><th>REB</th><th>AST</th><th>ROB</th><th>TAP</th><th>PER</th><th>TC%</th><th>3P%</th><th>TL%</th><th>TS%</th><th>EFF</th></tr></thead><tbody>${seasonRow('Actual', st)}${seasonRow('Playoffs', p.stpo)}${hist}</tbody></table></div>
    ${recent ? `<h3 style="margin-top:20px">Últimos partidos</h3><div class="scroll"><table class="tbl"><thead><tr><th class="l">Partido</th><th>MIN</th><th>PTS</th><th>REB</th><th>AST</th><th>ROB/TAP</th><th>TC</th><th>+/-</th></tr></thead><tbody>${recent}</tbody></table></div>` : ''}</div>`;
}

// ---------------- tácticas ----------------
export function tactics({ g, ui }) {
  const tab = ui.tab.tactics ?? 'tactics', u = g.user, gm = g.gameMinutes(), ps = g.roster(u);
  const head = `<h1>Tácticas<span>.</span></h1><p class="sub">Todo lo que elijas aquí modifica la simulación 3D real: posicionamiento, decisiones de tiro, defensa, rotaciones y sustituciones.</p>${tabs([['tactics', 'Estrategia'], ['rotation', 'Rotación y minutos'], ['defense', 'Asignaciones y prioridades']], tab, 'tactics')}`;
  if (tab === 'tactics') {
    const t = u.tactics, adv = advice(g, u);
    return head + `<div class="grid g21"><div class="panel"><h3>Plan de juego</h3><div class="row" style="margin-bottom:12px">${Object.keys(PRESETS).map(n => `<button class="btn ghost sm" data-act="preset" data-name="${n}">${n}</button>`).join('')}</div><div id="tac-form">${tacticsHtml(t)}</div></div>
      <div class="panel"><h3>Asesor</h3>${adv.map(a => `<div class="hint${a.warn ? ' warn' : ''}">${a.text}</div>`).join('')}<div class="hint">Los ajustes también se pueden cambiar durante el partido (pestaña “Banquillo”) y guardarse como plan base.</div></div></div>`;
  }
  if (tab === 'rotation') {
    const slots = [...u.lineup.starters, ...u.lineup.bench], all = [...ps].sort((a, b) => b.ovr - a.ovr);
    const opts = cur => `<option value="">— vacío —</option>` + all.map(p => `<option value="${p.id}"${p.id === cur ? ' selected' : ''}>${esc(p.name)} · ${p.role} · ${p.ovr}${p.inj ? ' · LESIONADO (' + p.inj.games + ' PJ)' : p.cond < 60 ? ' · cansado' : ''}</option>`).join('');
    const rows = Array.from({ length: 10 }, (_, i) => { const id = slots[i], p = id ? g.player(id) : null; const share = p ? (u.plan.minutes[id] ?? 0.3) : 0;
      return `<tr><td class="l">${i < 5 ? `<b>Titular ${ROLES[i]}</b>` : `Banquillo ${i - 4}`}</td><td class="l"><select class="f" data-act="setSlot" data-i="${i}">${opts(id)}</select></td><td>${p ? `<b style="color:${ovrColor(p.ovr)}">${p.ovr}</b>` : ''}</td><td>${p ? meter(p.cond) : ''}</td><td class="l" style="min-width:170px">${p ? `<input type="range" min="0" max="100" step="5" value="${Math.round(share * 100)}" data-act="setMinutes" data-id="${id}" style="width:120px;accent-color:var(--orange)"> <output>${(share * gm).toFixed(1)}</output> min` : ''}</td></tr>`; }).join('');
    const total = slots.reduce((a, id) => a + (id ? (u.plan.minutes[id] ?? 0) : 0), 0) * gm, want = 5 * gm;
    return head + `<div class="grid g21"><div class="panel"><h3>Quinteto y banquillo <span class="row"><button class="btn sm" data-act="autoLineup">Automático</button><button class="btn sm ghost" data-act="normMinutes">Normalizar minutos</button></span></h3>
      <div class="scroll"><table class="tbl"><thead><tr><th class="l">Puesto</th><th class="l">Jugador</th><th>OVR</th><th>Cond.</th><th class="l">Minutos objetivo</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p style="font-size:11px" class="${Math.abs(total - want) / want > 0.08 ? 'neg' : 'muted'}">Total: ${total.toFixed(1)} min de ${want.toFixed(0)} disponibles (5 jugadores × ${gm.toFixed(0)} min). ${Math.abs(total - want) / want > 0.08 ? 'Ajusta o pulsa “Normalizar”.' : ''}</p></div>
    <div class="panel"><h3>Reglas de rotación</h3><div class="sl" style="grid-template-columns:1fr"><span>Jugador de cierre</span><select class="f" data-act="setPlan" data-k="closer"><option value="">Ninguno</option>${slots.filter(Boolean).map(id => `<option value="${id}"${u.plan.closer === id ? ' selected' : ''}>${esc(g.player(id).name)}</option>`).join('')}</select></div>
      <div class="sl" style="grid-template-columns:1fr"><span>Gestión de faltas</span><select class="f" data-act="setPlan" data-k="foulPolicy">${optHtml([['careful', 'Prudente: sentar pronto a jugadores con faltas'], ['normal', 'Normal'], ['risky', 'Arriesgar: jugar con faltas']], u.plan.foulPolicy)}</select></div>
      <div class="sl" style="grid-template-columns:1fr"><span>Gestión de stamina</span><select class="f" data-act="setPlan" data-k="staminaPolicy">${optHtml([['high', 'Rotar pronto (piernas frescas)'], ['normal', 'Normal'], ['low', 'Aguantar con los mejores']], u.plan.staminaPolicy)}</select></div>
      <div class="hint">El jugador de cierre entra y recibe más balones en los últimos minutos si el partido está igualado. Los minutos objetivo guían las sustituciones; la fatiga y las faltas pueden adelantarlas.</div></div></div>`;
  }
  const oppEntry = g.userEntry(), opp = oppEntry ? g.team(oppEntry.home === u.id ? oppEntry.away : oppEntry.home) : null;
  const oppStarters = opp ? opp.lineup.starters.map(id => g.player(id)) : [];
  const starters = u.lineup.starters.map(id => g.player(id));
  return head + `<div class="grid g2"><div class="panel"><h3>Asignaciones defensivas ${opp ? `· vs ${esc(opp.short)}` : ''}</h3><p class="muted" style="font-size:10px">Elige a qué posición rival marca cada titular. “Automático” = marca al jugador de su misma casilla.</p>
    ${starters.map(p => `<div class="row spread" style="padding:6px 0;border-bottom:1px solid #26343a;font-size:11px"><span>${esc(p.name)} <span class="muted">${p.role}</span></span><select class="f" data-act="setAssign" data-id="${p.id}"><option value="">Automático</option>${ROLES.map((r, i) => `<option value="${i}"${String(u.assign[p.id]) === String(i) ? ' selected' : ''}>${r}${oppStarters[i] ? ` · ${esc(oppStarters[i].name)} (${oppStarters[i].ovr})` : ''}</option>`).join('')}</select></div>`).join('')}</div>
  <div class="panel"><h3>Prioridad de balón</h3><p class="muted" style="font-size:10px">“Referente” busca más sus tiros y recibe más pases; “Bajo” cede protagonismo.</p>
    ${[...starters, ...u.lineup.bench.map(id => g.player(id))].map(p => `<div class="row spread" style="padding:6px 0;border-bottom:1px solid #26343a;font-size:11px"><span>${esc(p.name)} <span class="muted">${p.role} · ${p.ovr}</span></span><select class="f" data-act="setUsage" data-id="${p.id}">${Object.entries(USAGE).map(([k, [l]]) => `<option value="${k}"${(u.usage[p.id] ?? 'normal') === k ? ' selected' : ''}>${l}</option>`).join('')}</select></div>`).join('')}</div></div>`;
}
function advice(g, u) {
  const ps = g.roster(u), out = [], t = u.tactics, avg = k => ps.slice().sort((a, b) => b.ovr - a.ovr).slice(0, 8).reduce((s, p) => s + p.a[k], 0) / 8;
  if (t.defense !== 'man') out.push({ warn: avg('interiorDefense') < 62, text: `Defensa en zona: tu defensa interior media es ${avg('interiorDefense').toFixed(0)}${avg('interiorDefense') < 62 ? ' (baja: la zona puede sufrir en la pintura)' : ' (suficiente para proteger el aro)'}. La zona reduce faltas pero cede espacios exteriores.` });
  else out.push({ text: `Defensa individual: tu defensa exterior media es ${avg('defense').toFixed(0)}. Si es baja, prueba una zona 2-3.` });
  if (t.shotThree >= 65) out.push({ warn: avg('three') < 75, text: `Priorizas los triples: tu acierto de tres medio (atributo) es ${avg('three').toFixed(0)}${avg('three') < 75 ? ', quizá insuficiente' : ', buen respaldo'}.` });
  if (t.tempo >= 70) out.push({ warn: avg('stamina') < 78, text: `Ritmo alto: consume más energía. Tu resistencia media es ${avg('stamina').toFixed(0)}; usa “Rotar pronto” si ves cansancio.` });
  if (t.inside >= 70) out.push({ text: `Ataque interior: tus mejores finalizadores son ${ps.sort((a, b) => b.a.finishing - a.a.finishing).slice(0, 2).map(p => esc(p.name)).join(' y ')}.` });
  if (t.pressure >= 70) out.push({ warn: true, text: 'Presión alta: genera robos y pérdidas, pero cansa más a tus defensores y puede provocar faltas.' });
  if (!out.length) out.push({ text: 'Plan equilibrado. Ajusta un par de controles según el rival.' });
  return out;
}

// ---------------- calendario ----------------
export function schedule({ g, ui }) {
  const s = g.s, u = s.userId;
  // Copa LBO: cada ronda se juega antes de una jornada de la liga (c.slots[k] = índice de esa jornada); acá se muestran todas las fechas, jugadas y por venir.
  const cup = s.cup, cupNames = { 8: 'Cuartos de final', 4: 'Semifinales', 2: 'Final' };
  const cupRows = i => cup && !cup.skipped ? cup.slots.map((sl, k) => sl === i ? k : -1).filter(k => k >= 0).map(k => {
    const rd = cup.rounds[k], name = rd ? rd.name : cupNames[cup.size / 2 ** k] ?? 'Ronda', t = rd && rd.ties.find(x => x.home === u || x.away === u);
    const vs = t ? `${t.home === u ? 'vs' : '@'} ${teamLink(g, t.home === u ? t.away : t.home)}` : cup.round > k ? '<span class="muted">No participaste</span>' : rd ? '<span class="muted">No clasificado</span>' : '<span class="muted">Por definir</span>';
    const res = t && t.done ? `<span class="tag ${t.winner === u ? 'w' : 'l'}">${t.winner === u ? 'V' : 'D'}</span> ${t.hs}-${t.as}` : (cup.round === k && !cup.done ? '<span class="pill pri">Siguiente</span>' : cup.round > k ? '<span class="muted">jugada</span>' : '<span class="muted">—</span>');
    return `<tr class="cup-row"><td class="l"><b>${esc(cup.name)}</b> · ${esc(name)} <small class="muted">antes de la jornada ${i + 1} · ${fmtDay(s.season, i, true)}</small></td><td class="l">${vs}</td><td>${res}</td></tr>`;
  }).join('') : '';
  const rows = s.schedule.map((d, i) => { const e = d.games.find(x => x.home === u || x.away === u), home = e.home === u, opp = g.team(home ? e.away : e.home);
    const res = e.done ? `<span class="tag ${(home ? e.hs > e.as : e.as > e.hs) ? 'w' : 'l'}">${(home ? e.hs > e.as : e.as > e.hs) ? 'V' : 'D'}</span> ${e.hs}-${e.as}` : (i === s.day && s.phase === 'regular' ? '<span class="pill pri">Siguiente</span>' : '<span class="muted">—</span>');
    return cupRows(i) + `<tr class="${e.done ? 'click' : ''}" ${e.done ? `data-go="result" data-arg="${e.mid}"` : ''}><td class="l">Jornada ${i + 1} <small class="muted">${fmtDay(s.season, i, true)}</small></td><td class="l">${home ? 'vs' : '@'} ${teamLink(g, opp.id)}</td><td>${res}</td></tr>`; }).join('');
  const other = s.schedule[Math.min(s.day, s.schedule.length - 1)];
  return `<h1>Calendario<span>.</span></h1><p class="sub">${esc(g.timeline())}</p><div class="grid g2"><div class="panel"><h3>Tus partidos</h3><div class="scroll" style="max-height:640px"><table class="tbl"><thead><tr><th class="l">Jornada</th><th class="l">Rival</th><th>Resultado</th></tr></thead><tbody>${rows}</tbody></table></div></div>
    <div class="panel"><h3>${s.phase === 'playoffs' || s.po ? 'Playoffs' : `Todos los partidos · jornada ${Math.min(s.day + 1, s.schedule.length)} · ${fmtDay(s.season, Math.min(s.day, s.schedule.length - 1), true)}`}</h3>${s.po ? bracket(g) : `<div>${other.games.map(e => `<div class="res"><span>${teamLink(g, e.home)} vs ${teamLink(g, e.away)}</span><span>${e.done ? `${e.hs}-${e.as}` : '—'}</span></div>`).join('')}</div>`}</div></div>`;
}
export function bracket(g) {
  const po = g.s.po; if (!po) return '';
  return `<div class="bracket">${po.rounds.map(r => `<div class="col"><div class="panel-title">${r.name}</div>${r.byes.map(id => `<div class="series"><div>${tag(g, id)}<span class="muted">Exento</span></div></div>`).join('')}${r.series.map(x => `<div class="series"><div class="${x.winner === x.a ? 'w' : ''}"><span>${tag(g, x.a)} <small>(${po.seeds.indexOf(x.a) + 1})</small></span><b>${x.wA}</b></div><div class="${x.winner === x.b ? 'w' : ''}"><span>${tag(g, x.b)} <small>(${po.seeds.indexOf(x.b) + 1})</small></span><b>${x.wB}</b></div><small>Al mejor de ${x.bo}</small></div>`).join('')}</div>`).join('')}</div>${po.champion != null ? `<div class="hint">🏆 Campeón: <b>${esc(tname(g, po.champion))}</b></div>` : ''}`;
}

// ---------------- copa ----------------
export function copa({ g }) {
  const c = g.s.cup, u = g.user;
  if (!c) return `<h1>Copa<span>.</span></h1><p class="sub">La liga necesita al menos 4 equipos para jugar la copa.</p>`;
  const total = Math.log2(c.size), names = { 3: ['Cuartos de final', 'Semifinales', 'Final'], 2: ['Semifinales', 'Final'] }[total];
  const seed = id => c.seeds.indexOf(id) + 1;
  const tie = t => `<div class="series ${t.home === u.id || t.away === u.id ? 'mine' : ''}"><div class="${t.winner === t.home ? 'w' : ''}"><span>${tag(g, t.home)} <small>(${seed(t.home)})</small></span><b>${t.done ? t.hs : ''}</b></div><div class="${t.winner === t.away ? 'w' : ''}"><span>${tag(g, t.away)} <small>(${seed(t.away)})</small></span><b>${t.done ? t.as : ''}</b></div></div>`;
  const cols = names.map((n, i) => { const r = c.rounds[i]; return `<div class="col"><div class="panel-title">${esc(n)}${c.slots[i] != null ? `<span class="muted">${fmtDay(g.s.season, c.slots[i], true)}</span>` : ''}</div>${r ? r.ties.map(tie).join('') : Array.from({ length: c.size / 2 ** (i + 1) }, () => '<div class="series"><div><span class="muted">Por definir</span></div><div><span class="muted">Por definir</span></div></div>').join('')}</div>`; }).join('');
  const mine = c.rounds.flatMap(r => r.ties.filter(t => t.home === u.id || t.away === u.id));
  const alive = !c.done && (!mine.length || !mine[mine.length - 1].done || mine[mine.length - 1].winner === u.id);
  const status = c.skipped ? 'La copa de esta temporada ya había pasado su primera fecha cuando se cargó la partida: se juega desde la próxima.' : c.done ? `Campeón: <b>${esc(tname(g, c.champion))}</b>${c.champion === u.id ? ' (¡tu equipo!)' : ''}. Subcampeón: ${esc(tname(g, c.runnerUp))}.` : g.cupDue() ? `Tienes partido de copa antes de la próxima jornada: <b>${esc(c.rounds[c.round].name)}</b>.` : alive ? `Tu equipo sigue en la copa. Próxima ronda: <b>${esc(c.rounds[c.round].name)}</b> después de la jornada ${c.slots[c.round]}.` : 'Tu equipo quedó eliminado de la copa.';
  const hist = (g.s.cupHistory ?? []).length ? `<div class="panel" style="margin-top:16px"><h3>Campeones</h3>${table([{ k: 's', label: 'Temp.', l: true, html: h => h.season }, { k: 'c', label: 'Campeón', l: true, html: h => teamLink(g, h.champion) }, { k: 'r', label: 'Subcampeón', l: true, html: h => teamLink(g, h.runnerUp) }, { k: 'x', label: 'Final', html: h => h.score }], g.s.cupHistory)}</div>` : '';
  return `<h1>${esc(c.name)}<span>.</span></h1><p class="sub">Eliminatoria a partido único · ${c.size} equipos · se juega entre jornadas de la liga regular · premios en M€ por ronda ganada</p><div class="hint">${status}</div>
    <div class="panel"><h3>Cuadro</h3><div class="bracket">${cols}</div></div>${hist}`;
}

// ---------------- clasificación ----------------
export function standings({ g, ui }) {
  const st = g.standings(), cut = g.cfg.playoffTeams;
  const t = table([{ k: 'p', label: '#', html: r => st.indexOf(r) + 1 }, { k: 't', label: 'Equipo', l: true, html: r => teamLink(g, r.id) }, { k: 'g', label: 'PJ', html: r => r.g }, { k: 'w', label: 'V', html: r => r.w }, { k: 'l', label: 'D', html: r => r.l }, { k: 'pct', label: '%', html: r => fmt(r.pct * 100, 0) },
    { k: 'pf', label: 'PF', html: r => r.pf }, { k: 'pa', label: 'PC', html: r => r.pa }, { k: 'd', label: 'DIF', html: r => `<span class="${cls(r.diff)}">${signed(r.diff)}</span>` }, { k: 's', label: 'Racha', html: r => r.streak }, { k: 'l10', label: 'Últ.10', html: r => r.l10 }, { k: 'o', label: 'OVR', html: r => g.teamOvr(g.team(r.id)).toFixed(0) }], st, { meId: g.s.userId, cut: cut && cut < st.length ? cut - 1 : undefined });
  const hist = g.s.history.length ? table([{ k: 's', label: 'Temp.', l: true, html: h => h.season }, { k: 'c', label: 'Campeón', l: true, html: h => teamLink(g, h.champion) }, { k: 'b', label: 'Mejor liga regular', l: true, html: h => teamLink(g, h.best) }, { k: 'm', label: 'MVP', l: true, html: h => h.mvp ? esc(h.mvp.name) : '-' }, { k: 'p', label: 'Tu posición', html: h => `${h.userPos}.º` }], g.s.history) : '';
  return `<h1>Clasificación<span>.</span></h1><p class="sub">${esc(g.timeline())}${cut ? ` · los ${cut} primeros acceden a playoffs` : ''}</p><div class="panel">${t}</div>${g.s.po ? `<div class="panel" style="margin-top:16px"><h3>Playoffs</h3>${bracket(g)}</div>` : ''}${hist ? `<div class="panel" style="margin-top:16px"><h3>Historial</h3>${hist}</div>` : ''}`;
}

// ---------------- estadísticas ----------------
const CATS = { pts: ['Puntos', s => s.pts / s.gp, 1], reb: ['Rebotes', s => s.reb / s.gp, 1], ast: ['Asistencias', s => s.ast / s.gp, 1], stl: ['Robos', s => s.stl / s.gp, 1], blk: ['Tapones', s => s.blk / s.gp, 1], eff: ['Valoración (EFF)', s => eff(s) / s.gp, 1], ts: ['TS%', s => ts(s), 1], tp: ['Triples %', s => (s.tpa >= 8 ? pct(s.tpm, s.tpa) : 0), 1] };
export function stats({ g, ui }) {
  const tab = ui.tab.stats ?? 'players', cat = ui.tab.statcat ?? 'pts', u = g.user;
  const head = `<h1>Estadísticas<span>.</span></h1><p class="sub">Temporada ${g.s.season} · liga regular</p>${tabs([['players', 'Líderes'], ['mine', 'Mi equipo'], ['teams', 'Equipos (avanzadas)']], tab, 'stats')}`;
  if (tab === 'players') {
    const [label, fn] = CATS[cat], lead = g.leaders(fn, 15);
    return head + `<div class="row" style="margin-bottom:12px">${Object.entries(CATS).map(([k, [l]]) => `<button class="btn sm ${k === cat ? 'pri' : 'ghost'}" data-set="statcat:${k}">${l}</button>`).join('')}</div><div class="panel">${lead.length ? table([{ k: 'i', label: '#', html: r => lead.indexOf(r) + 1 }, { k: 'p', label: 'Jugador', l: true, html: r => link('player', r.p.id, r.p.name) }, { k: 't', label: 'Equipo', l: true, html: r => tag(g, r.p.teamId) }, { k: 'g', label: 'PJ', html: r => r.p.st.gp }, { k: 'v', label: label, html: r => `<b>${fmt(r.v)}</b>` }], lead) : '<p class="muted" style="font-size:11px">Aún no hay suficientes partidos.</p>'}</div>`;
  }
  if (tab === 'mine') {
    const ps = g.roster(u).filter(p => p.st.gp);
    const cols = [{ k: 'n', label: 'Jugador', l: true, val: p => p.name, html: p => link('player', p.id, p.name) }, { k: 'gp', label: 'PJ', val: p => p.st.gp, html: p => p.st.gp }, { k: 'min', label: 'MIN', val: p => pg(p.st, 'min'), html: p => fmt(pg(p.st, 'min')) }, { k: 'pts', label: 'PTS', val: p => pg(p.st, 'pts'), html: p => fmt(pg(p.st, 'pts')) }, { k: 'reb', label: 'REB', val: p => pg(p.st, 'reb'), html: p => fmt(pg(p.st, 'reb')) }, { k: 'ast', label: 'AST', val: p => pg(p.st, 'ast'), html: p => fmt(pg(p.st, 'ast')) }, { k: 'stl', label: 'ROB', val: p => pg(p.st, 'stl'), html: p => fmt(pg(p.st, 'stl')) }, { k: 'blk', label: 'TAP', val: p => pg(p.st, 'blk'), html: p => fmt(pg(p.st, 'blk')) }, { k: 'tov', label: 'PER', val: p => pg(p.st, 'tov'), html: p => fmt(pg(p.st, 'tov')) }, { k: 'pf', label: 'FAL', val: p => pg(p.st, 'pf'), html: p => fmt(pg(p.st, 'pf')) },
      { k: 'fg', label: 'TC%', val: p => pct(p.st.fgm, p.st.fga), html: p => fmt(pct(p.st.fgm, p.st.fga), 0) }, { k: 'tp', label: '3P%', val: p => pct(p.st.tpm, p.st.tpa), html: p => fmt(pct(p.st.tpm, p.st.tpa), 0) }, { k: 'ft', label: 'TL%', val: p => pct(p.st.ftm, p.st.fta), html: p => fmt(pct(p.st.ftm, p.st.fta), 0) },
      { k: 'ts', label: 'TS%', val: p => ts(p.st), html: p => fmt(ts(p.st), 0) }, { k: 'efg', label: 'eFG%', val: p => efg(p.st), html: p => fmt(efg(p.st), 0) }, { k: 'eff', label: 'EFF/PJ', val: p => eff(p.st) / p.st.gp, html: p => fmt(eff(p.st) / p.st.gp) }, { k: 'usg', label: 'USO/36', val: p => usg(p.st), html: p => fmt(usg(p.st)) }, { k: 'at', label: 'AST/PER', val: p => astTov(p.st), html: p => fmt(astTov(p.st), 2) }, { k: 'pm', label: '+/-', val: p => pg(p.st, 'pm'), html: p => `<span class="${cls(p.st.pm)}">${signed(pg(p.st, 'pm'), 1)}</span>` }];
    return head + `<div class="panel">${ps.length ? table(cols, ps, { sort: ui.sort, key: 'mine' }) : '<p class="muted" style="font-size:11px">Aún no hay partidos jugados.</p>'}<p class="muted" style="font-size:10px">TS% = acierto verdadero · eFG% = acierto efectivo · EFF = puntos+reb+ast+rob+tap−fallos−pérdidas · USO/36 = posesiones usadas por 36 min · +/− medio por partido.</p></div>`;
  }
  const ms = g.matchesOfSeason();
  const rows = g.s.teams.map(t => ({ id: t.id, ...teamAdvanced(ms, t.id) })).filter(r => r.g);
  const cols = [{ k: 't', label: 'Equipo', l: true, val: r => g.team(r.id).name, html: r => teamLink(g, r.id) }, { k: 'g', label: 'PJ', val: r => r.g, html: r => r.g }, { k: 'pts', label: 'PTS', val: r => r.pts / r.g, html: r => fmt(r.pts / r.g) }, { k: 'opp', label: 'PC', val: r => r.opp / r.g, html: r => fmt(r.opp / r.g) }, { k: 'ortg', label: 'ORTG', val: r => r.ortg, html: r => fmt(r.ortg, 0) }, { k: 'drtg', label: 'DRTG', val: r => r.drtg, html: r => fmt(r.drtg, 0) }, { k: 'net', label: 'NET', val: r => r.net, html: r => `<span class="${cls(r.net)}">${signed(r.net, 1)}</span>` }, { k: 'pace', label: 'RITMO', val: r => r.pace, html: r => fmt(r.pace, 0) },
    { k: 'efg', label: 'eFG%', val: r => r.efg, html: r => fmt(r.efg) }, { k: 'oefg', label: 'eFG% rival', val: r => r.oefg, html: r => fmt(r.oefg) }, { k: 'tov', label: 'PER%', val: r => r.tovPct, html: r => fmt(r.tovPct) }, { k: 'orb', label: 'REB.OF%', val: r => r.orbPct, html: r => fmt(r.orbPct) }, { k: 'ftr', label: 'TL/TC', val: r => r.ftr, html: r => fmt(r.ftr, 2) }, { k: 'stl', label: 'ROB', val: r => r.stl / r.g, html: r => fmt(r.stl / r.g) }, { k: 'blk', label: 'TAP', val: r => r.blk / r.g, html: r => fmt(r.blk / r.g) }, { k: 'fast', label: 'P.CONTRA', val: r => r.fast / r.g, html: r => fmt(r.fast / r.g) }, { k: 'paint', label: 'P.PINTURA', val: r => r.paint / r.g, html: r => fmt(r.paint / r.g) }];
  return head + `<div class="panel">${rows.length ? table(cols, rows, { sort: ui.sort, key: 'teams', meId: u.id }) : '<p class="muted" style="font-size:11px">Aún no hay partidos.</p>'}<p class="muted" style="font-size:10px">ORTG/DRTG = puntos por 100 posesiones · NET = diferencia · PER% = % de posesiones con pérdida · REB.OF% = % de rebotes ofensivos capturados.</p></div>`;
}

// ---------------- resultado del partido ----------------
export function result({ g, ui }) {
  const m = g.s.matches[ui.arg]; if (!m) return '<p>Partido no disponible (los partidos antiguos se archivan).</p>';
  const u = g.s.userId, mine = m.home === u || m.away === u, meSide = m.home === u ? 'h' : 'a', opSide = meSide === 'h' ? 'a' : 'h', H = g.team(m.home), A = g.team(m.away);
  const boxTable = side => { const rows = m.box[side].filter(b => b.min > 0 || true).sort((a, b) => b.gs - a.gs || b.min - a.min);
    return table([{ k: 'n', label: 'Jugador', l: true, html: b => `${b.gs ? '★ ' : ''}${link('player', b.pid, b.name)} <span class="muted">${b.role}</span>` }, { k: 'min', label: 'MIN', html: b => fmt(b.min) }, { k: 'pts', label: 'PTS', html: b => `<b>${b.pts}</b>` }, { k: 'reb', label: 'REB', html: b => b.reb }, { k: 'ast', label: 'AST', html: b => b.ast }, { k: 'stl', label: 'ROB', html: b => b.stl }, { k: 'blk', label: 'TAP', html: b => b.blk }, { k: 'tov', label: 'PER', html: b => b.tov }, { k: 'pf', label: 'FAL', html: b => b.pf }, { k: 'fg', label: 'TC', html: b => `${b.fgm}/${b.fga}` }, { k: 'tp', label: '3P', html: b => `${b.tpm}/${b.tpa}` }, { k: 'ft', label: 'TL', html: b => `${b.ftm}/${b.fta}` }, { k: 'pm', label: '+/-', html: b => `<span class="${cls(b.pm)}">${signed(b.pm)}</span>` }], rows); };
  const qs = m.periods.length, qCols = m.periods.map((_, i) => `<th>${i < 4 ? `C${i + 1}` : 'PR'}</th>`).join('');
  const t = m.ts, h = t.h, a = t.a, pc = (x, y) => (y ? x / y * 100 : 0);
  const all = [...m.box.h.map(b => ({ ...b, side: 'h' })), ...m.box.a.map(b => ({ ...b, side: 'a' }))].sort((x, y) => eff(y) - eff(x)).slice(0, 4);
  const cmp = [cmpRow('Tiros de campo', pc(h.fgm, h.fga), pc(a.fgm, a.fga), `${fmt(pc(h.fgm, h.fga), 0)}%`, `${fmt(pc(a.fgm, a.fga), 0)}%`), cmpRow('Triples', pc(h.tpm, h.tpa), pc(a.tpm, a.tpa), `${h.tpm}/${h.tpa}`, `${a.tpm}/${a.tpa}`), cmpRow('Tiros libres', pc(h.ftm, h.fta), pc(a.ftm, a.fta), `${h.ftm}/${h.fta}`, `${a.ftm}/${a.fta}`), cmpRow('Rebotes', h.rebounds, a.rebounds), cmpRow('Rebotes ofensivos', h.offensiveRebounds, a.offensiveRebounds), cmpRow('Asistencias', h.assists, a.assists), cmpRow('Robos', h.steals, a.steals), cmpRow('Tapones', h.blocks, a.blocks), cmpRow('Pérdidas', h.turnovers, a.turnovers, h.turnovers, a.turnovers, true), cmpRow('Puntos contraataque', h.fastBreakPoints, a.fastBreakPoints), cmpRow('Puntos en la pintura', h.paintPoints, a.paintPoints), cmpRow('Faltas', h.fouls, a.fouls, h.fouls, a.fouls, true)].join('');
  let analysis = '', conseq = '';
  if (mine) {
    const me = t[meSide], op = t[opSide], mt = m.tac[meSide], ot = m.tac[opSide], won = (meSide === 'h') === (m.hs > m.as), bullets = [];
    const efgM = (me.fgm + 0.5 * me.tpm) / Math.max(1, me.fga) * 100, efgO = (op.fgm + 0.5 * op.tpm) / Math.max(1, op.fga) * 100;
    if (Math.abs(efgM - efgO) > 4) bullets.push(efgM > efgO ? `Ganaste el duelo del acierto: eFG ${fmt(efgM, 0)}% contra ${fmt(efgO, 0)}%.` : `Tu rival tiró mejor (eFG ${fmt(efgO, 0)}% contra ${fmt(efgM, 0)}%): revisa el marcaje y la calidad de tus tiros.`);
    if (Math.abs(me.rebounds - op.rebounds) >= 4) bullets.push(me.rebounds > op.rebounds ? `Dominaste el rebote (${me.rebounds}-${op.rebounds}).` : `Perdiste la batalla del rebote (${me.rebounds}-${op.rebounds}). Considera subir el rebote ofensivo o cambiar el quinteto.`);
    if (me.turnovers - op.turnovers >= 4) bullets.push(`Demasiadas pérdidas (${me.turnovers} contra ${op.turnovers}).${mt.ballMovement >= 65 ? ' Tu circulación de balón alta puede estar arriesgando pases.' : ''}`);
    if (op.turnovers - me.turnovers >= 4) bullets.push(`Forzaste ${op.turnovers} pérdidas${mt.pressure >= 60 ? ': la presión defensiva funcionó' : ''}.`);
    if (mt.defense !== 'man') bullets.push(`Jugaste en zona: el rival tiró ${op.tpm}/${op.tpa} de tres y ${fmt(pc(op.fgm, op.fga), 0)}% de campo.`);
    if (ot.defense !== 'man') bullets.push(`El rival defendió en zona: tus triples fueron ${me.tpm}/${me.tpa}.`);
    if (Math.abs(me.paintPoints - op.paintPoints) >= 8) bullets.push(me.paintPoints > op.paintPoints ? `Controlaste la pintura (${me.paintPoints}-${op.paintPoints}).` : `Te castigaron en la pintura (${op.paintPoints}-${me.paintPoints}).`);
    if (Math.abs(me.fastBreakPoints - op.fastBreakPoints) >= 6) bullets.push(me.fastBreakPoints > op.fastBreakPoints ? `Buen contraataque (${me.fastBreakPoints}-${op.fastBreakPoints}).` : `Sufriste en transición defensiva (${op.fastBreakPoints}-${me.fastBreakPoints}).`);
    const bench = m.box[meSide].filter(b => !b.gs).reduce((s, b) => s + b.pts, 0); bullets.push(`Aportación del banquillo: ${bench} puntos.`);
    const star = all.find(x => x.side === meSide); if (star) bullets.push(`Jugador clave: ${esc(star.name)} (${star.pts} pts, ${star.reb} reb, ${star.ast} ast).`);
    analysis = `<div class="panel"><h3>Análisis del partido</h3>${bullets.map(b => `<div class="hint">${b}</div>`).join('')}</div>`;
    const lines = m.box[meSide].filter(b => b.d);
    conseq = `<div class="panel"><h3>Consecuencias</h3>${table([{ k: 'n', label: 'Jugador', l: true, html: b => link('player', b.pid, b.name) }, { k: 'min', label: 'MIN', html: b => fmt(b.min) }, { k: 'f', label: 'Forma', html: b => `<span class="${cls(b.d.form)}">${signed(b.d.form)}</span>` }, { k: 'm', label: 'Moral', html: b => `<span class="${cls(b.d.morale)}">${signed(b.d.morale)}</span>` }, { k: 'c', label: 'Condición', html: b => `<span class="${cls(b.d.cond)}">${signed(b.d.cond)}</span>` }], lines)}
      <p class="muted" style="font-size:10px">${won ? 'La victoria sube la moral. ' : 'La derrota baja la moral. '}Los jugadores con pocos minutos respecto a su rol pierden moral. La química del equipo es ahora ${g.user.chem}.</p></div>`;
  }
  const pend = ui.pending && ui.pending.mid === m.id;
  return `<div class="row spread"><div><div class="eyebrow">${m.kind === 'playoff' ? 'PLAYOFFS' : m.kind === 'cup' ? 'COPA LBO' : `JORNADA ${m.day + 1} · ${fmtDay(m.season, m.day).toUpperCase()}`}${m.ot ? ' · PRÓRROGA' : ''}</div><h1 style="margin:0">Resultado<span>.</span></h1></div><div class="row">${pend ? '<button class="btn pri" data-act="afterResult">Continuar →</button>' : '<button class="btn ghost" data-go="dashboard">Volver</button>'}</div></div>
  <div class="panel" style="margin:16px 0"><div class="bigscore"><div><small>${teamLink(g, m.home)}</small>${m.hs}</div><span style="font-size:24px;color:var(--muted)">—</span><div><small>${teamLink(g, m.away)}</small>${m.as}</div></div>
    <table class="tbl" style="max-width:460px;margin:12px auto 0"><thead><tr><th class="l">Puntos por cuarto</th>${qCols}<th>Total</th></tr></thead><tbody><tr><td class="l">${esc(H.short)}</td>${m.periods.map(p => `<td>${p[0]}</td>`).join('')}<td><b>${m.hs}</b></td></tr><tr><td class="l">${esc(A.short)}</td>${m.periods.map(p => `<td>${p[1]}</td>`).join('')}<td><b>${m.as}</b></td></tr></tbody></table></div>
  <div class="grid g21"><div class="grid">${analysis}<div class="panel"><h3><span>${teamLink(g, m.home)}</span></h3>${boxTable('h')}</div><div class="panel"><h3><span>${teamLink(g, m.away)}</span></h3>${boxTable('a')}</div></div>
  <div class="grid" style="align-content:start"><div class="panel"><h3>Mejores jugadores</h3>${all.map(b => `<div class="row spread" style="padding:7px 0;border-bottom:1px solid #26343a;font-size:11px"><span>${tag(g, b.side === 'h' ? m.home : m.away)} ${link('player', b.pid, b.name)}</span><b>${b.pts}p ${b.reb}r ${b.ast}a</b></div>`).join('')}</div>
    <div class="panel"><h3>Comparativa · ${esc(H.short)} / ${esc(A.short)}</h3>${cmp}</div>${conseq}</div></div>`;
}


// ================= TRAMO B: contratos, mercado, scouting y draft =================
const roleOpts = cur => Object.entries(TEAM_ROLES).map(([k, [l]]) => `<option value="${k}"${k === cur ? ' selected' : ''}>${l}</option>`).join('');
const capBar = (g) => `<small class="muted">${g.payroll(g.user).toFixed(1)} M€ en salarios</small>`;

export function contracts({ g, ui }) {
  const u = g.user, ps = g.roster(u), off = g.s.phase === 'offseason', dead = u.dead ?? [];
  const cols = [{ k: 'n', label: 'Jugador', l: true, val: p => p.name, html: p => link('player', p.id, p.name) }, { k: 'pos', label: 'Pos', val: p => ROLES.indexOf(p.role), html: p => p.role }, { k: 'age', label: 'Edad', val: p => p.age, html: p => p.age }, { k: 'ovr', label: 'OVR', val: p => p.ovr, html: p => `<b style="color:${ovrColor(p.ovr)}">${p.ovr}</b>` }, { k: 'pot', label: 'POT', val: p => p.pot, html: p => p.pot },
    { k: 'sal', label: 'Salario', val: p => p.contract.salary, html: p => money(p.contract.salary) }, { k: 'val', label: 'Valor mercado', val: p => valueOf(p), html: p => `<span class="${valueOf(p) > p.contract.salary * 1.15 ? 'pos' : valueOf(p) < p.contract.salary * 0.85 ? 'neg' : ''}">${money(valueOf(p))}</span>` },
    { k: 'yrs', label: 'Años', val: p => p.contract.years, html: p => p.contract.years <= 1 ? pill(off ? 'Expira' : 'Último año', 'warn') : p.contract.years }, { k: 'role', label: 'Rol', val: p => p.contract.role, html: p => TEAM_ROLES[p.contract.role][0] }, { k: 'mor', label: 'Moral', val: p => p.morale, html: p => meter(p.morale) },
    { k: 'act', label: '', html: p => `${p.contract.years <= 1 ? `<button class="btn sm pri" data-act="negOpen" data-kind="renew" data-id="${p.id}">Renovar</button> ` : ''}<button class="btn sm ghost" data-act="release" data-id="${p.id}">Liberar</button>` }];
  const expiring = ps.filter(p => p.contract.years <= 1).length;
  return `<h1>Contratos<span>.</span></h1><p class="sub">Plantilla ${ps.length}/${LIM.max} (mínimo ${LIM.min})</p>
  <div class="grid g3"><div class="panel"><h3>Masa salarial</h3>${capBar(g)}</div><div class="panel"><h3>Contratos por renovar</h3><div class="kpi"><b>${expiring}</b><small>${off ? 'expiran al empezar la temporada' : 'en su último año'}</small></div></div>
  <div class="panel"><h3>Indemnizaciones pendientes</h3>${dead.length ? dead.map(d => `<div class="row spread" style="font-size:11px;padding:4px 0"><span>${esc(d.name)}</span><span>${money(d.amt)} · ${d.years} temp.</span></div>`).join('') : '<p class="muted" style="font-size:11px">Ninguna.</p>'}</div></div>
  <div class="panel" style="margin-top:16px">${table(cols, ps, { sort: ui.sort, key: 'contracts' })}
  <div class="hint">Renovar solo es posible con 1 año restante. Los jugadores descontentos piden más y los que no ven cumplido su rol se enfadan. Liberar cuesta el 50 % del salario durante los años que queden (máx. 3).</div></div>`;
}

export function market({ g, ui }) {
  const tab = ui.tab.market ?? 'fa', u = g.user;
  const head = `<h1>Mercado<span>.</span></h1><p class="sub">Plantilla ${u.roster.length}/${LIM.max} · nómina ${g.payroll(u).toFixed(1)} M€</p>${tabs([['fa', 'Agentes libres'], ['trade', 'Traspasos'], ['offers', `Ofertas${(g.s.offers || []).length ? ' (' + g.s.offers.length + ')' : ''}`]], tab, 'market')}`;
  if (tab === 'offers') {
    const offs = g.s.offers || [];
    return head + `<div class="panel"><h3>Ofertas por tus jugadores</h3>${offs.length ? offs.map(o => { const t = g.team(o.teamId), me = g.player(o.give), he = g.player(o.get); return `<div class="row spread" style="padding:9px 0;border-bottom:1px solid #26343a;font-size:11px"><span><b>${esc(t.name)}</b> ofrece a <b>${esc(he.name)}</b> (${he.role} · OVR ${he.ovr} · ${money(he.contract.salary)}) por <b>${esc(me.name)}</b> (${me.role} · OVR ${me.ovr} · ${money(me.contract.salary)})<br><span class="muted">Vence en ${Math.max(0, o.exp - g.s.day)} jornada(s)</span></span><span><button class="btn sm pri" data-act="offerYes" data-id="${o.id}">Aceptar</button> <button class="btn sm ghost" data-act="offerNo" data-id="${o.id}">Rechazar</button></span></div>`; }).join('') : '<p class="muted" style="font-size:11px">No hay ofertas por ahora. Los equipos de la IA proponen traspasos durante la temporada.</p>'}</div>`;
  }
  if (tab === 'fa') {
    const pos = ui.tab.faPos ?? 'ALL', list = g.s.fa.map(id => g.player(id)).filter(p => !p.retired && (pos === 'ALL' || p.role === pos));
    const cols = [{ k: 'n', label: 'Jugador', l: true, val: p => p.name, html: p => `${link('player', p.id, p.name)} ${PLAYER_TAGS(p).slice(0, 2).map(t => pill(t)).join('')}` }, { k: 'pos', label: 'Pos', val: p => ROLES.indexOf(p.role), html: p => p.role }, { k: 'age', label: 'Edad', val: p => p.age, html: p => p.age }, { k: 'ovr', label: 'OVR', val: p => p.ovr, html: p => `<b style="color:${ovrColor(p.ovr)}">${p.ovr}</b>` }, { k: 'pot', label: 'POT', val: p => p.pot, html: p => p.pot },
      { k: 'ask', label: 'Pide (aprox.)', val: p => g.askFor(p), html: p => `${money(g.askFor(p))} · ${prefYears(p)} a.` }, { k: 'act', label: '', html: p => `<button class="btn sm pri" data-act="negOpen" data-kind="fa" data-id="${p.id}">Ofertar</button>` }];
    return head + `<div class="row" style="margin-bottom:12px">${['ALL', ...ROLES].map(r => `<button class="btn sm ${r === pos ? 'pri' : 'ghost'}" data-set="faPos:${r}">${r === 'ALL' ? 'Todos' : r}</button>`).join('')}</div>
      <div class="panel">${table(cols, list, { sort: { fa: ui.sort.fa ?? { k: 'ovr', dir: 'desc' } }, key: 'fa' })}<div class="hint">Con la caja en negativo no puedes fichar. El precio depende del valor del jugador, del rol que le ofrezcas y de los años. Los agentes libres se muestran con sus atributos reales; solo los prospectos del draft tienen incertidumbre.</div></div>`;
  }
  const others = g.s.teams.filter(t => t.id !== u.id), T = ui.trade ??= { team: others[0].id, mine: [], theirs: [], res: null }, tm = g.team(T.team);
  const sal = ids => ids.reduce((a, id) => a + g.player(id).contract.salary, 0), row = (p, side) => `<label class="row spread" style="padding:6px 0;border-bottom:1px solid #26343a;font-size:11px;cursor:pointer"><span><input type="checkbox" data-act="tradeToggle" data-side="${side}" data-id="${p.id}" ${T[side].includes(p.id) ? 'checked' : ''}> ${esc(p.name)} <span class="muted">${p.role} · ${p.age}a</span></span><span><b style="color:${ovrColor(p.ovr)}">${p.ovr}</b>/${p.pot} · ${money(p.contract.salary)} · ${p.contract.years}a</span></label>`;
  const outU = sal(T.mine), inU = sal(T.theirs), after = g.payroll(u) - outU + inU;
  return head + `<div class="panel"><h3>Traspaso con <select class="f" data-act="tradeTeam">${others.map(t => `<option value="${t.id}"${t.id === T.team ? ' selected' : ''}>${esc(t.name)} · OVR ${g.teamOvr(t).toFixed(0)}</option>`).join('')}</select></h3>
    <div class="grid g2"><div><div class="panel-title">Tú envías</div>${g.roster(u).sort((a, b) => b.ovr - a.ovr).map(p => row(p, 'mine')).join('')}</div><div><div class="panel-title">Tú recibes</div>${g.roster(tm).sort((a, b) => b.ovr - a.ovr).map(p => row(p, 'theirs')).join('')}</div></div>
    <div class="row spread" style="margin-top:14px"><span style="font-size:11px">Sales ${money(outU)} · entran ${money(inU)} · nómina resultante <b>${after.toFixed(1)} M€</b> · plantilla ${u.roster.length - T.mine.length + T.theirs.length}/${LIM.max}</span><button class="btn pri" data-act="tradePropose">Proponer traspaso</button></div>
    ${T.res ? `<div class="hint ${T.res.ok ? '' : 'warn'}">${esc(T.res.msg)}</div>` : ''}<div class="hint">La IA valora edad, OVR, potencial y contrato. No cedas a su jugador franquicia sin ofrecer mucho más.</div></div>`;
}

export function scouting({ g, ui }) {
  const s = g.s, off = s.off, drafting = off?.stage === 'draft', pick = drafting ? off.picks[off.pos] : null, myTurn = pick?.teamId === s.userId;
  const list = g.draftAvailable().map(p => ({ p, v: g.prospectView(p) })).sort((a, b) => (b.v.pot[0] + b.v.pot[1] + b.v.ovr[0] + b.v.ovr[1]) - (a.v.pot[0] + a.v.pot[1] + a.v.ovr[0] + a.v.ovr[1]));
  const cols = [{ k: 'i', label: '#', html: r => list.indexOf(r) + 1 }, { k: 'n', label: 'Prospecto', l: true, html: r => `${esc(r.p.name)} <span class="muted">${r.p.role} · ${r.p.age}a · ${r.p.h.toFixed(2)} m</span>` }, { k: 'o', label: 'OVR', html: r => `${r.v.ovr[0]}–${r.v.ovr[1]}` }, { k: 'p', label: 'POT', html: r => `<b>${r.v.pot[0]}–${r.v.pot[1]}</b>` }, { k: 's', label: 'Conocimiento', html: r => meter(r.p.scout) },
    { k: 'a', label: '', html: r => `<button class="btn sm ghost" data-act="scout" data-id="${r.p.id}" ${r.p.scout >= 100 || !s.scoutPts ? 'disabled' : ''}>Ojear</button>${myTurn ? ` <button class="btn sm pri" data-act="draftPick" data-id="${r.p.id}">Elegir</button>` : ''}` }];
  let panel;
  if (drafting) panel = `<div class="panel"><h3>Draft · puesto #${pick.n} (ronda ${pick.round}) — turno de ${teamLink(g, pick.teamId)}</h3><div class="row">${myTurn ? '<b class="pos">¡Es tu turno! Elige un prospecto de la lista.</b>' : `<button class="btn" data-act="draftGo">Simular hasta mi turno</button>`}<button class="btn ghost" data-act="draftAuto">Simular el draft completo</button></div>
    <p class="muted" style="font-size:10px">Orden: el peor clasificado elige primero. Los elegidos firman 4 años con salario de rookie según el puesto. Los no elegidos pasan a agentes libres.</p>${off.made.length ? `<div style="max-height:150px;overflow:auto">${off.made.slice(-10).reverse().map(m => `<div class="row spread" style="font-size:11px;padding:3px 0"><span>#${m.n} ${tag(g, m.teamId)}</span><span>${esc(g.player(m.pid).name)} <span class="muted">${g.player(m.pid).role}</span></span></div>`).join('')}</div>` : ''}</div>`;
  else if (off) panel = `<div class="panel"><h3>Draft completado</h3><p style="font-size:11px">Tus elegidos: ${off.made.filter(m => m.teamId === s.userId).map(m => `${link('player', m.pid, g.player(m.pid).name)} (#${m.n})`).join(', ') || 'ninguno'}. Los no elegidos están en el mercado de agentes libres.</p></div>`;
  else panel = `<div class="panel"><h3>Próximo draft</h3><p style="font-size:11px">Se celebra al terminar la temporada (tras los playoffs). Hasta entonces puedes ojear a los prospectos: cuanto más conocimiento, más estrecho es el margen de las estimaciones.</p></div>`;
  return `<h1>Scouting y draft<span>.</span></h1><p class="sub">Puntos de scouting: <b>${s.scoutPts}</b> · cada ojeo aporta +35 % de conocimiento y estrecha el margen de error</p>${panel}
  <div class="panel" style="margin-top:16px"><h3>Clase del draft (${list.length} prospectos)</h3>${table(cols, list)}<div class="hint">Las cifras son estimaciones del scouting, no los valores reales: sin ojear, el margen es de ±10. Los prospectos con potencial alto son apuestas a largo plazo; su progresión no está garantizada.</div></div>`;
}


// ================= TRAMO C: entrenamiento y finanzas =================
export function training({ g, ui }) {
  const u = g.user, ps = g.roster(u).sort((a, b) => b.ovr - a.ovr), f = g.fin, cur = g.s.trainIntensity, mult = g.trainMult();
  const cols = [{ k: 'n', label: 'Jugador', l: true, val: p => p.name, html: p => link('player', p.id, p.name) }, { k: 'pos', label: 'Pos', val: p => ROLES.indexOf(p.role), html: p => p.role }, { k: 'age', label: 'Edad', val: p => p.age, html: p => p.age }, { k: 'ovr', label: 'OVR', val: p => p.ovr, html: p => `<b style="color:${ovrColor(p.ovr)}">${p.ovr}</b>` }, { k: 'pot', label: 'POT', val: p => p.pot, html: p => p.pot },
    { k: 'foc', label: 'Foco de entrenamiento', l: true, html: p => `<select class="f" data-act="setFocus" data-id="${p.id}"><option value="">Sin foco</option>${ATTRIBUTES.map(k => `<option value="${k}"${p.focus === k ? ' selected' : ''}>${ATTR_LABELS[k]} (${p.a[k]})${k === g.recommendFocus(p) ? ' ★' : ''}</option>`).join('')}</select>` },
    { k: 'tp', label: 'Progreso acumulado', val: p => p.tp || 0, html: p => p.focus ? `${meter(Math.min(100, (p.tp || 0) / 5 * 100)).replace(/(<\/span>)\d+$/, '$1')} <b>+${Math.min(5, Math.round(p.tp || 0))}</b> <span class="muted">${(p.tp || 0).toFixed(1)}</span>` : '<span class="muted">—</span>' }];
  return `<h1>Entrenamiento<span>.</span></h1><p class="sub">El foco elegido acumula puntos cada jornada y se convierte en mejora del atributo al cerrar la temporada.</p>
  <div class="grid g3"><div class="panel"><h3>Intensidad del equipo</h3><select class="f" data-act="setIntensity" style="width:100%">${Object.entries(INTENSITY).map(([k, v]) => `<option value="${k}"${k === cur ? ' selected' : ''}>${v.label}</option>`).join('')}</select>
    <p class="muted" style="font-size:10px;line-height:1.6">Suave: menos progreso, +4 de recuperación por jornada. Normal: equilibrado. Intensa: más progreso pero −5 de recuperación (más cansancio en los partidos).</p></div>
  <div class="panel"><h3>Efectividad</h3><div class="grid g2"><div class="kpi"><small>Multiplicador</small><b>×${mult.toFixed(2)}</b></div><div class="kpi"><small>Recuperación</small><b>${g.recoveryBonus() >= 0 ? '+' : ''}${g.recoveryBonus()}</b></div></div>
    <p class="muted" style="font-size:10px">Centro de entrenamiento nivel ${f.trainFac}. Mejóralos en <a class="lnk" data-go="finances">Finanzas</a>.</p></div>
  <div class="panel"><h3>Acciones rápidas</h3><div class="row"><button class="btn sm pri" data-act="autoFocus">Aplicar ★ recomendados a todos</button><button class="btn sm ghost" data-act="clearFocus">Quitar todos</button></div>
    <p class="muted" style="font-size:10px;line-height:1.6">★ = el atributo con más margen de mejora entre los que más pesan en el OVR de su posición. Los jóvenes progresan más rápido; los veteranos, menos; y quien ya ha alcanzado su potencial rinde mucho menos.</p></div></div>
  <div class="panel" style="margin-top:16px">${table(cols, ps, { sort: ui.sort, key: 'training' })}</div>`;
}

export function finances({ g, ui }) {
  const f = g.fin, l = f.season, rev = sumKeys(l, REV_KEYS), exp = sumKeys(l, EXP_KEYS), bal = rev - exp;
  const att = g.attendance(), capy = capacityOf(f.stadium), gr = g.gameRevenue();
  const rows = (keys, tot) => keys.map(([k, lab]) => `<div class="row spread" style="padding:5px 0;border-bottom:1px solid #26343a;font-size:11px"><span>${lab}</span><b>${money(l[k])}</b></div>`).join('') + `<div class="row spread" style="padding:7px 0;font-size:12px"><b>Total</b><b>${money(tot)}</b></div>`;
  const fac = [['stadium', 'Pabellón', `capacidad ${capacityOf(f.stadium).toLocaleString('es')} → ${capacityOf(f.stadium + 1).toLocaleString('es')}`], ['trainFac', 'Centro de entrenamiento', `entrenamiento ×${(1 + 0.08 * (f.trainFac - 1)).toFixed(2)} → ×${(1 + 0.08 * f.trainFac).toFixed(2)}`]].map(([k, lab, eff]) => `<div style="padding:8px 0;border-bottom:1px solid #26343a"><div class="row spread" style="font-size:11px"><b>${lab} · nivel ${f[k]}</b>${f[k] < 5 ? `<button class="btn sm ${f.cash >= facilityCost(k, f[k]) ? 'pri' : 'ghost'}" data-act="upgrade" data-key="${k}">Mejorar · ${facilityCost(k, f[k])} M€</button>` : '<span class="pill ok">Máximo</span>'}</div><small class="muted">${f[k] < 5 ? eff : 'Al máximo'} · mantenimiento 1 M€/nivel al año</small></div>`).join('');
  const hist = f.history.length ? table([{ k: 's', label: 'Temp.', l: true, html: h => h.season }, { k: 'r', label: 'Ingresos', html: h => money(h.rev) }, { k: 'e', label: 'Gastos', html: h => money(h.exp) }, { k: 'p', label: 'Beneficio', html: h => `<span class="${cls(h.profit)}">${money(h.profit)}</span>` }, { k: 'a', label: 'Asistencia', html: h => h.att.toLocaleString('es') }, { k: 'po', label: 'Pos.', html: h => `${h.pos}.º` }, { k: 'ca', label: 'Caja', html: h => money(h.cash) }], f.history) : '<p class="muted" style="font-size:11px">Se guardará al final de cada temporada.</p>';
  return `<h1>Finanzas<span>.</span></h1><p class="sub">Temporada ${g.s.season} (acumulado hasta hoy) · cifras en M€</p>
  <div class="grid g4"><div class="panel kpi"><small>Caja</small><b class="${f.cash < 0 ? 'neg' : ''}">${f.cash.toFixed(1)}</b></div><div class="panel kpi"><small>Ingresos</small><b>${rev.toFixed(1)}</b></div><div class="panel kpi"><small>Gastos</small><b>${exp.toFixed(1)}</b></div><div class="panel kpi"><small>Balance</small><b class="${cls(bal)}">${signed(bal, 1)}</b></div></div>
  <div class="grid g3" style="margin-top:16px"><div class="panel"><h3>Ingresos</h3>${rows(REV_KEYS, rev)}</div><div class="panel"><h3>Gastos</h3>${rows(EXP_KEYS, exp)}</div>
  </div>
  <div class="grid g3" style="margin-top:16px"><div class="panel"><h3>Entradas</h3>    <div class="grid g2"><div class="kpi"><small>Asistencia</small><b>${att.toLocaleString('es')}</b></div><div class="kpi"><small>Ocupación</small><b>${Math.round(att / capy * 100)}%</b></div><div class="kpi"><small>Ingreso/partido</small><b>${gr.toFixed(2)}</b></div><div class="kpi"><small>Demanda</small><b>${Math.round(g.demand() * 100)}</b></div></div>
    <p class="muted" style="font-size:10px;line-height:1.5">El precio de las entradas lo fija el club según su popularidad y su pabellón. (El ingreso por partido está escalado a una temporada de 41 partidos en casa.)</p></div>
  <div class="panel"><h3>Instalaciones</h3>${fac}<p class="muted" style="font-size:10px">Se pagan con la caja al instante.</p></div></div>
  <div class="panel" style="margin-top:16px"><h3>Historial</h3>${hist}</div>`;
}
