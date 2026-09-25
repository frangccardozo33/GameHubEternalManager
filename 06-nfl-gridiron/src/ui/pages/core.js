import { card, table, tabs, chip, teamTag, tdot, record, plink, ovrBadge, esc, bar, stat, money, inj, signed } from '../kit.js';
import { capSpace, payroll, teamNeeds } from '../../manager/economy.js';
import { depthIssues, isInjured } from '../../manager/lineup.js';
import { ROSTER_MAX, ROSTER_MIN, SALARY_CAP, POSITIONS, fmtM } from '../../manager/constants.js';
import { scoutReport } from '../../manager/scouting.js';
import { pct, r1, fmtWeek } from '../../manager/util.js';

const mmss = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const formDots = f => `<span class="fdots">${(f || []).map(x => `<i class="${x}">${x}</i>`).join('')}</span>`;

// ------------------------------------------------------------------ Dashboard
const dashboard = {
  id: 'dashboard', title: 'Dashboard', icon: '◧',
  render(app) {
    const lg = app.lg, d = lg.data, t = lg.user, rows = lg.standings(), me = rows.find(r => r.id === t.id), fx = lg.userFixture();
    const roster = lg.roster(t), hurt = roster.filter(isInjured), issues = depthIssues(lg, t), space = capSpace(lg, t), exp = roster.filter(p => p.expiring);
    const alerts = [];
    if (roster.length > ROSTER_MAX) alerts.push(['bad', `Plantilla con ${roster.length} jugadores (máx. ${ROSTER_MAX}).`]);
    for (const pos of POSITIONS) { const n = roster.filter(p => p.pos === pos && !isInjured(p)).length; if (n < ROSTER_MIN[pos]) alerts.push(['bad', `Faltan jugadores sanos en ${pos}: ${n}/${ROSTER_MIN[pos]}.`]); }
    for (const i of issues.filter(x => x.includes('lesionado'))) alerts.push(['warn', i]);
    if (exp.length) alerts.push(['warn', `${exp.length} contrato(s) vencido(s): renueva o quedarán libres.`]);
    if (d.offers.length) alerts.push(['info', `${d.offers.length} oferta(s) de traspaso esperando respuesta.`]);
    if (t.finance.cash < 0) alerts.push(['bad', 'Saldo negativo: no puedes fichar.']);
    let next = '';
    if (d.phase === 'offseason') {
      const champ = d.teams[d.champions.at(-1).team];
      next = card('Offseason', `<p class="big-line">${tdot(champ)} <b>${esc(champ.name)}</b> es campeón ${d.year}.</p><ol class="steps"><li>Renueva contratos vencidos <a href="#/contracts">(Contratos)</a></li><li>Ficha agentes libres y rookies <a href="#/market">(Mercado)</a></li><li>Revisa el depth chart <a href="#/depth">(Depth)</a></li><li>Pulsa <b>Comenzar temporada ${d.year + 1}</b> arriba a la derecha.</li></ol>`, { cls: 'hero' });
    } else if (fx) {
      const home = fx.home === t.id, opp = lg.team(home ? fx.away : fx.home), rep = scoutReport(lg, t.id, opp.id), orow = rows.find(r => r.id === opp.id);
      next = card(`${lg.currentWeek().label} · ${home ? 'En casa' : 'De visitante'}`, `<div class="vs"><div class="vs-team">${tdot(t)}<b>${esc(t.name)}</b><small>${record(t.record)}</small></div><span class="vs-x">VS</span><div class="vs-team">${tdot(opp)}<b>${esc(opp.name)}</b><small>${record(orow)} · #${orow.rank}</small></div></div>
        <div class="two"><div><small class="k">Fortalezas rival</small>${rep.strengths.map(s => chip(`${s.label} ${s.value}`, 'good')).join(' ')}</div><div><small class="k">Debilidades rival</small>${rep.weaknesses.map(s => chip(`${s.label} ${s.value}`, 'bad')).join(' ')}</div></div>
        <div class="row-actions"><a class="btn" href="#/gameplan">Scouting y gameplan</a><a class="btn" href="#/depth">Depth chart</a><a class="btn primary" href="#/match">Ir al partido →</a></div>`, { cls: 'hero' });
    } else next = card('Esta semana', `<p class="muted">Tu equipo no juega esta semana. Avanza el calendario.</p>`, { cls: 'hero' });
    const lastGames = d.userGames.slice(-5).reverse().map(id => d.results[id]);
    return `<div class="grid g3">${next}
      ${card('Tu temporada', `<div class="stats4">${stat('Récord', record(t.record))}${stat('Posición', '#' + me.rank, 'de 8')}${stat('PF / PA', `${t.record.pf} / ${t.record.pa}`)}${stat('Dif.', signed(me.diff))}</div><div class="mt">${formDots(t.form)}</div><small class="k">Últimos resultados</small>${table({ cols: [{ h: 'Sem', f: r => r.week }, { h: 'Rival', f: r => { const o = lg.team(r.home === t.id ? r.away : r.home); return `${r.home === t.id ? 'vs' : '@'} ${o.short}`; } }, { h: 'Res.', f: r => { const i = r.home === t.id ? 0 : 1, w = r.score[i] > r.score[1 - i], tie = r.score[0] === r.score[1]; return `<b class="${w ? 'win' : tie ? '' : 'loss'}">${w ? 'W' : tie ? 'T' : 'L'} ${r.score[i]}-${r.score[1 - i]}</b> <a href="#/results/${r.id}">ver</a>`; } }], rows: lastGames, empty: 'Aún sin partidos.' })}`)}
      ${card('Recursos', `<div class="cap"><div><small class="k">Nómina</small><b>${fmtM(payroll(lg, t))}</b></div></div><div class="stats4 mt">${stat('Caja', fmtM(t.finance.cash))}${stat('Plantilla', `${roster.length}/${ROSTER_MAX}`)}${stat('Lesionados', hurt.length)}</div>`)}</div>
      <div class="grid g2">${card('Alertas', alerts.length ? `<ul class="alerts">${alerts.map(([c, x]) => `<li class="${c}">${esc(x)}</li>`).join('')}</ul>` : '<div class="empty ok">Todo en orden.</div>')}
      ${card('Lesionados', hurt.length ? table({ cols: [{ h: 'Jugador', f: p => plink(p) }, { h: 'Pos', k: 'pos' }, { h: 'Ovr', f: p => ovrBadge(p.ovr) }, { h: 'Lesión', f: p => esc(p.injury.type) }, { h: 'Baja', f: p => `${p.injury.weeks} sem` }], rows: hurt }) : '<div class="empty ok">Sin lesionados.</div>')}</div>
      <div class="grid g2">${card('Noticias', `<div class="news">${d.newsLog.slice(0, 12).map(n => `<div class="n-${n.type}"><small>S${n.week}</small><span>${esc(n.text)}</span></div>`).join('') || '<div class="empty">Sin noticias.</div>'}</div>`)}
      ${card('Necesidades de plantilla', table({ cols: [{ h: 'Pos', f: n => `<span class="pos pos-${n.pos}">${n.pos}</span>` }, { h: 'Necesidad', f: n => bar(n.need, 100, n.need > 60 ? 'warn' : '') }, { h: 'Titulares', f: n => `${n.starterAvg} <small>(liga ${n.leagueAvg})</small>` }, { h: 'Estado', f: n => n.note }], rows: teamNeeds(lg, t.id).slice(0, 5) }), { right: '<a class="btn small" href="#/market">Mercado</a>' })}</div>`;
  },
  handlers: {},
};

// ------------------------------------------------------------------ Schedule
const schedule = {
  id: 'schedule', title: 'Schedule', icon: '▦',
  render(app) {
    const lg = app.lg, d = lg.data, u = d.userTeam, rows = lg.userSchedule();
    const list = table({ cols: [{ h: 'Semana', f: r => `${r.label} <small class="muted">${fmtWeek(d.year, r.week, true)}</small>${r.week === d.week && d.phase !== 'offseason' ? ' <em class="now">actual</em>' : ''}` }, { h: 'Rival', f: r => { if (!r.fx) return '<span class="muted">—</span>'; const o = lg.team(r.fx.home === u ? r.fx.away : r.fx.home); return `${r.fx.home === u ? 'vs' : '@'} ${teamTag(o)} ${esc(o.name)}`; } }, { h: 'Resultado', f: r => { if (!r.fx?.played) return r.fx ? '<span class="muted">Pendiente</span>' : ''; const i = r.fx.home === u ? 0 : 1, s = r.fx.score, w = s[i] > s[1 - i], tie = s[0] === s[1]; return `<b class="${w ? 'win' : tie ? '' : 'loss'}">${w ? 'W' : tie ? 'T' : 'L'} ${s[i]}-${s[1 - i]}${r.fx.ot ? ' (OT)' : ''}</b> <a href="#/results/${r.fx.id}">detalle</a>`; } }], rows: rows.filter(r => r.fx || r.week >= d.week), });
    const wk = lg.currentWeek(), around = wk ? table({ cols: [{ h: 'Local', f: f => `${teamTag(lg.team(f.home))} ${esc(lg.team(f.home).name)}` }, { h: 'Visitante', f: f => `${teamTag(lg.team(f.away))} ${esc(lg.team(f.away).name)}` }, { h: 'Marcador', f: f => f.played ? `<b>${f.score[0]}-${f.score[1]}</b>` : '<span class="muted">—</span>' }], rows: wk.fixtures }) : '';
    const remaining = d.calendar.slice(d.week).filter(w => w.type === 'regular' || w.type === 'cup').length;
    return `<div class="grid g2b">${card('Tu calendario', list, { right: d.phase === 'regular' && remaining ? `<button class="btn small" data-act="sim-season">Simular ${remaining} semana(s) restantes</button>` : '' })}
      ${card(wk ? `Semana: ${wk.label} · ${fmtWeek(d.year, d.week)}` : 'Offseason', wk ? around : '<p class="muted">La temporada terminó. Gestiona la plantilla y comienza la siguiente.</p>')}</div>`;
  },
  handlers: {
    'sim-season'(app) {
      const lg = app.lg, n = lg.data.calendar.slice(lg.data.week).filter(w => w.type === 'regular' || w.type === 'cup').length;
      app.confirm(`Se simularán ${n} semana(s) con tu gameplan guardado. ¿Continuar?`, async () => {
        app.modal('<div class="mm"><h3>Simulando temporada…</h3><div class="bar"><i id="sim-prog" style="width:0%"></i></div></div>');
        await lg.advanceMany(n, (i, tot) => { const el = document.getElementById('sim-prog'); if (el) el.style.width = `${i / tot * 100}%`; });
        app.closeModal(); app.commit(); app.refresh(); app.toast('Temporada regular simulada.');
      });
    },
  },
};

// ------------------------------------------------------------------ Standings
const standings = {
  id: 'standings', title: 'Standings', icon: '≡',
  render(app) {
    const lg = app.lg, d = lg.data, rows = lg.standings();
    const tbl = table({ cls: 'stand', cols: [{ h: '#', k: 'rank' }, { h: 'Equipo', f: r => { const t = lg.team(r.id); return `${tdot(t)} <b ${r.id === d.userTeam ? 'class="me"' : ''}>${esc(t.name)}</b>`; } }, { h: 'V', k: 'w' }, { h: 'D', k: 'l' }, { h: 'E', k: 't' }, { h: '%', f: r => r.pct.toFixed(3).replace(/^0/, '') }, { h: 'PF', k: 'pf' }, { h: 'PA', k: 'pa' }, { h: 'Dif', f: r => signed(r.diff) }, { h: 'Forma', f: r => formDots(r.form) }], rows: rows.map(r => ({ ...r, _attr: `class="${r.rank === 4 ? 'cut' : ''} ${r.id === d.userTeam ? 'mine' : ''}"` })) });
    const L = (k, label) => card(label, `<ol class="leaders">${lg.leaders(k, 5).map(x => `<li>${esc(x.name)} <small>${x.team} · ${x.pos}</small><b>${Math.round(x.value)}</b></li>`).join('') || '<li class="muted">Sin datos</li>'}</ol>`);
    const champs = d.champions.length ? card('Campeones', `<ul class="champs">${d.champions.map(c => `<li>${c.year}: ${tdot(lg.team(c.team))} ${esc(lg.team(c.team).name)}</li>`).join('')}</ul>`) : '';
    return `${card(`Clasificación ${d.year}`, tbl + '<p class="muted small">Los 4 primeros clasifican a semifinales (1º–4º, 2º–3º) y final. Empates decididos en playoffs por tiempo extra.</p>')}<div class="grid g5">${L('passYds', 'Yardas de pase')}${L('rushYds', 'Yardas de carrera')}${L('recYds', 'Yardas de recepción')}${L('sacks', 'Sacks')}${L('ints', 'Intercepciones')}</div>${champs}`;
  },
  handlers: {},
};

// ------------------------------------------------------------------ Results (post-game)
const TEAMROWS = [
  ['Jugadas', t => t.plays], ['Yardas totales', t => Math.round(t.yards)], ['Yardas de pase', t => Math.round(t.passYds)], ['Yardas de carrera', t => Math.round(t.rushYds)], ['Yardas por jugada', t => t.plays ? (t.yards / t.plays).toFixed(1) : '0.0'],
  ['First downs', t => t.firstDowns], ['Tercer down', t => `${t.thirdConv}/${t.thirdAtt} (${pct(t.thirdConv, t.thirdAtt)}%)`], ['Cuarto down', t => `${t.fourthConv}/${t.fourthAtt}`], ['Red zone (TD/visitas)', t => `${t.rzTD}/${t.rzTrips}`],
  ['Pases (C/A)', t => `${t.passComp}/${t.passAtt}`], ['Sacks recibidos', t => `${t.sacksTaken} (${Math.round(t.sackYds)} yd)`], ['Pérdidas (turnovers)', t => t.turnovers], ['Penalizaciones', t => `${t.penalties} (${t.penYds} yd)`], ['Posesión', t => mmss(t.top)],
];
function playerTables(app, r, teamIdx) {
  const lg = app.lg, id = teamIdx === 0 ? r.home : r.away, mine = Object.entries(r.players).filter(([, x]) => x.team === id).map(([pid, x]) => ({ pid, ...x, l: x.line }));
  const g = (title, filter, cols) => { const rows = mine.filter(filter); return rows.length ? `<h5>${title}</h5>${table({ cols: [{ h: 'Jugador', f: x => `<a class="plink" href="#/player/${x.pid}">${esc(x.name)}</a> <small>${x.pos}</small>` }, ...cols], rows })}` : ''; };
  return g('Pase', x => x.l.passAtt, [{ h: 'C/A', f: x => `${x.l.passComp}/${x.l.passAtt}` }, { h: 'YDS', f: x => Math.round(x.l.passYds) }, { h: 'TD', f: x => x.l.passTD }, { h: 'INT', f: x => x.l.int }, { h: 'Sacks', f: x => x.l.sacksTaken }])
    + g('Carrera', x => x.l.rushAtt, [{ h: 'CAR', f: x => x.l.rushAtt }, { h: 'YDS', f: x => Math.round(x.l.rushYds) }, { h: 'Y/C', f: x => (x.l.rushYds / x.l.rushAtt).toFixed(1) }, { h: 'TD', f: x => x.l.rushTD }, { h: 'Fum', f: x => x.l.fumbles }])
    + g('Recepción', x => x.l.tgt || x.l.rec, [{ h: 'REC/TGT', f: x => `${x.l.rec}/${x.l.tgt}` }, { h: 'YDS', f: x => Math.round(x.l.recYds) }, { h: 'TD', f: x => x.l.recTD }, { h: 'Drops', f: x => x.l.drops }])
    + g('Defensa', x => x.l.tackles || x.l.sacks || x.l.ints || x.l.ff || x.l.missed, [{ h: 'TKL', f: x => x.l.tackles }, { h: 'SACK', f: x => x.l.sacks }, { h: 'INT', f: x => x.l.ints }, { h: 'FF', f: x => x.l.ff }, { h: 'Fall.', f: x => x.l.missed }])
    + g('Pateo', x => x.l.fga || x.l.xpa || x.l.punts, [{ h: 'FG', f: x => `${x.l.fgm}/${x.l.fga}` }, { h: 'XP', f: x => `${x.l.xpm}/${x.l.xpa}` }, { h: 'Punts', f: x => x.l.punts ? `${x.l.punts} (${Math.round(x.l.puntYds / x.l.punts)} prom.)` : '—' }]);
}
const results = {
  id: 'results', title: 'Results', icon: '✓',
  render(app, param) {
    const lg = app.lg, d = lg.data, id = param || d.lastResult, r = id ? d.results[id] : null, u = d.userTeam;
    const list = card('Partidos', d.userGames.length ? `<div class="glist">${[...d.userGames].reverse().map(gid => { const g = d.results[gid], i = g.home === u ? 0 : 1, o = lg.team(g.home === u ? g.away : g.home), w = g.score[i] > g.score[1 - i]; return `<a href="#/results/${gid}" class="${gid === id ? 'on' : ''}"><small>${g.year} · S${g.week}${g.type !== 'regular' ? ' · playoffs' : ''}</small><b>${g.home === u ? 'vs' : '@'} ${o.short}</b><em class="${w ? 'win' : g.score[0] === g.score[1] ? '' : 'loss'}">${g.score[i]}-${g.score[1 - i]}</em></a>`; }).join('')}</div>` : '<div class="empty">Aún no has jugado ningún partido.</div>');
    if (!r) return `<div class="grid g2b">${list}${card('Post-game', '<div class="empty">Juega o simula un partido para ver aquí el resumen, box score, errores y evolución de la clasificación.</div>')}</div>`;
    if (r.slim) return `<div class="grid g2b">${list}${card('Resultado', `<p class="big-line">${esc(lg.team(r.home).name)} ${r.score[0]} — ${r.score[1]} ${esc(lg.team(r.away).name)}</p><p class="muted">Este partido no involucró a tu equipo, por eso solo se guarda el resumen.</p>`)}</div>`;
    const tab = app.ui.resTab || 'summary', H = lg.team(r.home), A = lg.team(r.away), win = r.winner ? lg.team(r.winner) : null, mine = r.home === u ? 0 : 1;
    const head = `<div class="rhead"><div class="rt">${tdot(H)}<b>${esc(H.name)}</b><span class="rs ${r.score[0] > r.score[1] ? 'w' : ''}">${r.score[0]}</span></div><div class="rmid"><small>${r.year} · ${r.type === 'regular' ? 'Semana ' + r.week : r.type === 'semi' ? 'Semifinal' : 'Championship game'}${r.overtime ? ' · OT' : ''}</small><b>${win ? (win.id === u ? '¡VICTORIA!' : 'DERROTA') : 'EMPATE'}</b></div><div class="rt right"><span class="rs ${r.score[1] > r.score[0] ? 'w' : ''}">${r.score[1]}</span><b>${esc(A.name)}</b>${tdot(A)}</div></div>`;
    const T = [r.teamStats[0], r.teamStats[1]];
    let body = '';
    if (tab === 'summary') {
      body = `<div class="grid g2">${card('Marcador (jugadas de anotación)', `<div class="score-list">${r.scoring.map(s => `<div><small>Q${s.q} ${s.clock}</small>${tdot(lg.team(s.team === 0 ? r.home : r.away))}<span>${esc(s.text)}</span><b>${s.score[0]}-${s.score[1]}</b></div>`).join('') || '<div class="empty">Sin anotaciones.</div>'}</div>`)}
      ${card('Jugadores destacados', `<div class="tops">${r.top.map(x => `<div><b>${esc(x.name)}</b><small>${x.team} · ${x.pos} #${x.number}</small><span>${esc(x.headline)}</span></div>`).join('')}</div>`)}</div>
      ${card('Resumen de drives', table({ cols: [{ h: 'Equipo', f: x => `${tdot(lg.team(x.team === 0 ? r.home : r.away))} ${lg.team(x.team === 0 ? r.home : r.away).short}` }, { h: 'Q', k: 'q' }, { h: 'Reloj', k: 'clock' }, { h: 'Inicio', k: 'start' }, { h: 'Jug.', k: 'plays' }, { h: 'Yardas', f: x => signed(x.yards) }, { h: 'Tiempo', f: x => mmss(x.secs) }, { h: 'Resultado', f: x => `<b class="res-${x.result.replace(/\s/g, '')}">${esc(x.result)}</b>` }], rows: r.drives }))}`;
    } else if (tab === 'box') {
      body = card('Estadísticas de equipo', `<table class="mtable cmp"><thead><tr><th></th><th>${esc(H.short)}</th><th>${esc(A.short)}</th></tr></thead><tbody>${TEAMROWS.map(([l, f]) => `<tr><td>${l}</td><td>${f(T[0])}</td><td>${f(T[1])}</td></tr>`).join('')}</tbody></table>`)
        + `<div class="grid g2">${[0, 1].map(i => card(esc([H, A][i].name), playerTables(app, r, i))).join('')}</div>`;
    } else if (tab === 'errors') {
      body = card('Errores y jugadas que costaron el partido', r.errors.length ? `<div class="errs">${r.errors.map(e => `<div class="e-${e.kind}"><span>${tdot(lg.team(e.team === 0 ? r.home : r.away))} ${lg.team(e.team === 0 ? r.home : r.away).short}</span>${esc(e.text)}</div>`).join('')}</div>` : '<div class="empty ok">Partido limpio: sin errores destacados.</div>')
        + (r.injuries.length ? card('Lesiones', `<div class="errs">${r.injuries.map(i => `<div class="e-injury"><span>${lg.team(i.team === 0 ? r.home : r.away).short}</span>${esc(i.name)} · ${esc(i.type)} · ${i.weeks} sem</div>`).join('')}</div>`) : '');
    } else if (tab === 'standings') {
      const s = r.standings; body = s ? card('Evolución de la clasificación', table({ cols: [{ h: 'Equipo', f: x => `${tdot(lg.team(x.id))} <b ${x.id === u ? 'class="me"' : ''}>${esc(lg.team(x.id).name)}</b>` }, { h: 'Antes', f: x => '#' + s.before[x.id] }, { h: 'Ahora', f: x => '#' + s.after[x.id] }, { h: 'Cambio', f: x => { const c = s.before[x.id] - s.after[x.id]; return c ? `<b class="${c > 0 ? 'win' : 'loss'}">${c > 0 ? '▲' : '▼'} ${Math.abs(c)}</b>` : '—'; } }, { h: 'Récord', f: x => record(x) }], rows: [...s.rows].sort((a, b) => s.after[a.id] - s.after[b.id]) })) : card('Clasificación', '<div class="empty">La evolución se completa al cerrar la semana.</div>');
    }
    return `<div class="grid g2b">${list}<div>${head}${tabs([['summary', 'Resumen'], ['box', 'Box score'], ['errors', 'Errores'], ['standings', 'Standings']], tab, 'res-tab')}${body}</div></div>`;
  },
  handlers: { 'res-tab'(app, el) { app.ui.resTab = el.dataset.v; app.refresh(); } },
};
export const corePages = [dashboard, schedule, standings, results];
