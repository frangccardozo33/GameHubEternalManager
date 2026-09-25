import { card, table, tabs, plink, ovrBadge, posTag, esc, tdot } from '../kit.js';
import { fmtWeek } from '../../manager/util.js';

// ------------------------------------------------------------------ Draft
const draft = {
  id: 'draft', title: 'Draft', icon: '★',
  render(app) {
    const lg = app.lg, d = lg.data, dr = d.draft, P = d.players;
    if (!dr) return card('Draft', '<div class="empty">El draft se abre al terminar la temporada. Aquí eliges a los mejores jugadores universitarios.</div>');
    const cur = lg.draftCurrent(), mine = cur && cur.teamId === d.userTeam;
    const pool = dr.pool.map(id => P[id]).sort((a, b) => (b.ovr + b.potential) - (a.ovr + a.potential)).slice(0, 60);
    const status = dr.done
      ? '<div class="banner ok"><b>Draft finalizado.</b> Los no elegidos pasaron a agentes libres.</div>'
      : `<div class="banner ${mine ? 'ok' : 'warn'}"><b>Ronda ${cur.round} · pick ${cur.n}</b> — ${mine ? '¡Te toca elegir!' : `elige ${esc(lg.team(cur.teamId).name)}`}</div>
         <div class="mm-actions"><button class="btn" data-act="dr-next" ${mine ? 'disabled' : ''}>Simular hasta mi turno</button><button class="btn primary" data-act="dr-all">Simular draft completo</button></div>`;
    const tbl = table({ cols: [{ h: 'Jugador', f: p => plink(p) }, { h: 'Pos', f: p => posTag(p.pos) }, { h: 'Edad', f: p => p.age }, { h: 'Ovr', f: p => ovrBadge(p.ovr) }, { h: 'Pot', f: p => p.potential },
      { h: '', f: p => `<button class="btn small primary" data-act="dr-pick" data-id="${p.id}" ${mine && !dr.done ? '' : 'disabled'}>Elegir</button>` }], rows: dr.done ? [] : pool });
    const log = dr.log.slice(-14).reverse().map(x => { const t = lg.team(x.team), p = P[x.pid]; return `<li>${x.round}.${x.n} ${tdot(t)}<b>${esc(t.short)}</b> · ${p ? `${esc(p.name)} (${p.pos}, ${p.ovr}/${p.potential})` : '—'}</li>`; }).join('');
    const mineLog = dr.log.filter(x => x.team === d.userTeam).map(x => { const p = P[x.pid]; return p ? `<li>${x.round}.${x.n} · ${plink(p)} (${p.pos}, ${p.ovr}/${p.potential})</li>` : ''; }).join('');
    return `<div class="grid g2b"><div>${card(`Draft ${dr.year}`, status + tbl)}</div>
      <div>${card('Tus elecciones', mineLog ? `<ol class="steps">${mineLog}</ol>` : '<div class="empty">Todavía no elegiste a nadie.</div>')}
      ${card('Últimas elecciones', log ? `<ol class="steps">${log}</ol>` : '<div class="empty">Sin elecciones aún.</div>')}</div></div>`;
  },
  handlers: {
    'dr-pick'(app, el) { const r = app.lg.draftPick(el.dataset.id); app.toast(r.message); if (r.ok) app.lg.draftAdvance(); app.commit(); app.refresh(); },
    'dr-next'(app) { app.lg.draftAdvance(); app.commit(); app.refresh(); },
    'dr-all'(app) { app.lg.draftSimAll(); app.commit(); app.refresh(); },
  },
};

// ------------------------------------------------------------------ Noticias
const NEWS_TYPES = [['all', 'Todas'], ['mine', 'Mi equipo'], ['champion', 'Campeonato'], ['injury', 'Lesiones'], ['trade', 'Traspasos'], ['draft', 'Draft']];
const news = {
  id: 'news', title: 'News', icon: '✎',
  render(app) {
    const lg = app.lg, d = lg.data, f = app.ui.newsF || 'all';
    let list = d.newsLog;
    if (f === 'mine') list = list.filter(n => n.team === d.userTeam);
    else if (f !== 'all') list = list.filter(n => n.type === f);
    const rows = list.slice(0, 60).map(n => `<li><small class="muted">${fmtWeek(n.year, n.week - 1, true)} · sem ${n.week}</small> ${n.team && d.teams[n.team] ? tdot(d.teams[n.team]) : ''}${esc(n.text)}</li>`).join('');
    return card('Noticias de la liga', tabs(NEWS_TYPES, f, 'news-f') + (rows ? `<ul class="steps">${rows}</ul>` : '<div class="empty">Sin noticias en esta categoría.</div>'));
  },
  handlers: { 'news-f'(app, el) { app.ui.newsF = el.dataset.v; app.refresh(); } },
};

export const draftPages = [draft, news];
