// Copa LGO: cuadro de eliminatoria (los datos y la lógica están en manager/cup.js).
import { card, teamTag, esc, table } from '../kit.js';
import { fmtWeek } from '../../manager/util.js';

export const copaPages = [{
  id: 'copa', title: 'Copa', icon: '◆',
  render(app) {
    const lg = app.lg, d = lg.data, c = d.cup, u = d.userTeam;
    if (!c) return `<h1 class="page-title">Copa</h1>${card('Copa LGO', '<p class="muted">Esta carrera empezó antes de que existiera la copa: la primera edición es la de la temporada que viene.</p>')}`;
    const weeks = d.calendar.map((w, i) => [w, i]).filter(([w]) => w.type === 'cup');
    const seed = id => c.seeds.indexOf(id) + 1;
    const tie = f => { const w = f.winner, sc = f.played ? f.score : ['', '']; return `<div class="ctie ${f.home === u || f.away === u ? 'mine' : ''}"><div class="${w === f.home ? 'w' : ''}"><span>${teamTag(lg.team(f.home))} <small>(${seed(f.home)})</small></span><b>${sc[0]}</b></div><div class="${w === f.away ? 'w' : ''}"><span>${teamTag(lg.team(f.away))} <small>(${seed(f.away)})</small></span><b>${sc[1]}</b></div></div>`; };
    const cols = c.names.map((n, r) => { const found = weeks.find(([w]) => w.cupRound === r), wk = found && found[0], idx = found ? found[1] : null; const cnt = c.size / 2 ** (r + 1);
      return `<div class="ccol"><h4>${esc(n)}${idx != null ? `<small>${fmtWeek(d.year, idx, true)}</small>` : ''}</h4>${wk && wk.fixtures.length ? wk.fixtures.map(tie).join('') : Array.from({ length: cnt }, () => '<div class="ctie tbd"><div><span class="muted">Por definir</span></div><div><span class="muted">Por definir</span></div></div>').join('')}</div>`; }).join('');
    const mine = weeks.flatMap(([w]) => w.fixtures).filter(f => f.home === u || f.away === u);
    const last = mine[mine.length - 1], nextWk = weeks.find(([w, i]) => i >= d.week && w.fixtures.some(f => !f.played));
    const status = c.done ? `Campeón: <b>${esc(lg.team(c.champion).name)}</b>${c.champion === u ? ' (¡tu equipo!)' : ''}. Subcampeón: ${esc(lg.team(c.runnerUp).name)}.` : (!last || !last.played || last.winner === u) && c.seeds.includes(u) ? `Tu equipo sigue en la copa${nextWk ? `. Próxima ronda: <b>${esc(nextWk[0].label)}</b> · ${fmtWeek(d.year, nextWk[1])}` : ''}.` : 'Tu equipo quedó eliminado de la copa.';
    const hist = (d.cupHistory || []).length ? card('Campeones', table({ cols: [{ h: 'Año', f: h => h.year }, { h: 'Campeón', f: h => `${teamTag(lg.team(h.champion))} ${esc(lg.team(h.champion).name)}` }, { h: 'Subcampeón', f: h => esc(lg.team(h.runnerUp).name) }, { h: 'Final', f: h => h.score }], rows: d.cupHistory })) : '';
    return `<h1 class="page-title">${esc(c.name)}</h1><div class="banner ok"><span>${status}</span></div>${card('Cuadro', `<div class="cbracket">${cols}</div><p class="muted">Partido único entre semanas de la liga regular. Si el marcador termina empatado avanza el equipo de mayor siembra. Premios por ronda ganada.</p>`)}${hist}`;
  },
}];
