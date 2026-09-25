import { LOGO } from './logo.js';
import './manager.css';
import { League } from '../manager/league.js';
import * as store from '../manager/store.js';
import { TEAM_TEMPLATES, fmtM } from '../manager/constants.js';
import { capSpace, payroll } from '../manager/economy.js';
import { esc, tdot, record } from './kit.js';
import { fmtWeek } from '../manager/util.js';
import { corePages } from './pages/core.js';
import { squadPages } from './pages/squad.js';
import { strategyPages } from './pages/strategy.js';
import { businessPages } from './pages/business.js';
import { matchPage } from './pages/match.js';
import { draftPages } from './pages/draft.js';
import { tribunaPages } from './pages/tribuna.js';
import { copaPages } from './pages/copa.js';

const $ = id => document.getElementById(id);
export const PAGES = [...corePages, ...squadPages, ...strategyPages, ...businessPages, ...draftPages, ...copaPages, ...tribunaPages, matchPage];
const byId = Object.fromEntries(PAGES.map(p => [p.id, p]));
const NAV = [
  ['Club', ['dashboard', 'roster', 'depth', 'player', 'contracts', 'finances', 'news']],
  ['Estrategia', ['tactics', 'gameplan', 'training']],
  ['Competición', ['match', 'results', 'schedule', 'standings', 'copa', 'tribuna']],
  ['Mercado', ['market', 'draft']],
];

export const app = {
  lg: null, ui: {}, route: { name: 'dashboard', param: null }, saveTimer: null, lastSaved: null,
  $, esc,
  go(name, param = '') { location.hash = `#/${name}${param ? '/' + param : ''}`; },
  toast(msg, ms = 3200) { const t = $('toast'); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(this._t); this._t = setTimeout(() => t.classList.add('hidden'), ms); },
  commit() { clearTimeout(this.saveTimer); this.saveTimer = setTimeout(() => { if (this.lg && store.save(this.lg)) { this.lastSaved = new Date(); const el = $('save-state'); if (el) el.textContent = 'Guardado ✓'; } }, 350); },
  modal(html) { $('modal-body').innerHTML = html; const m = $('modal'); if (!m.open) m.showModal(); },
  closeModal() { const m = $('modal'); if (m.open) m.close(); this.modalHandlers = null; this.modalInputs = null; },
  confirm(text, onYes, { yes = 'Confirmar', danger = false } = {}) {
    this.modal(`<div class="mm"><h3>${esc(text)}</h3><div class="mm-actions"><button class="btn" data-act="modal-close">Cancelar</button><button class="btn ${danger ? 'danger' : 'primary'}" data-act="modal-yes">${yes}</button></div></div>`);
    this._yes = onYes;
  },
  render() {
    const root = $('manager-root');
    if (!this.lg) { document.body.dataset.page = 'new'; $('page-match').classList.add('hidden'); root.classList.remove('hidden'); root.innerHTML = renderNew(); $('sidebar').innerHTML = ''; $('topbar').innerHTML = ''; return; }
    const { name, param } = this.route, page = byId[name] || byId.dashboard;
    document.body.dataset.page = page.id === 'match' ? 'match' : page.id;
    if (page.id !== 'match') { window.matchLab?.pause(); this.keepMatch = false; }
    $('sidebar').innerHTML = renderSidebar(this); $('topbar').innerHTML = renderTopbar(this, page);
    if (page.id === 'match') { root.classList.add('hidden'); $('page-match').classList.remove('hidden'); page.render(this); page.after?.(this); }
    else { $('page-match').classList.add('hidden'); root.classList.remove('hidden'); root.innerHTML = page.render(this, param); page.after?.(this, param); window.scrollTo(0, 0); }
  },
  refresh() { const y = window.scrollY; this.render(); window.scrollTo(0, y); },
  newLeague(opts) { this.lg = League.create(opts); if (typeof window !== 'undefined' && window.Touchline) { window.Touchline.getBalances().then(r => { if (r && r.ok && this.lg) { this.lg.user.finance.cash = r.balances.silver; store.save(this.lg); this.render(); } }); } this.lastSaved = null; store.save(this.lg); this.route = { name: 'dashboard', param: null }; location.hash = '#/dashboard'; this.render(); this.toast(`Carrera creada · ${this.lg.user.name}`); },
};

function parseHash() { const [, name = 'dashboard', param = ''] = location.hash.split('/'); app.route = { name: byId[name] ? name : 'dashboard', param: decodeURIComponent(param) || null }; }
window.addEventListener('hashchange', () => { parseHash(); app.render(); });

// ----- shell
function renderSidebar(a) {
  const lg = a.lg, t = lg.user, d = lg.data, rank = lg.standings().find(r => r.id === t.id).rank;
  const badge = { market: d.offers.length || '', contracts: lg.roster(t).filter(p => p.expiring).length || '' };
  return `<div class="brand-row"><img src="${LOGO}" alt="" style="height:34px;width:auto"><div><b>LGO</b><small>LIGA DE GRIDIRON ONLINE</small></div></div>
  <div class="team-card" style="--c:${t.color};--d:${t.dark}"><div class="mono-crest lg" style="--c:${t.color};--d:${t.dark}">${t.short}</div><div><b>${esc(t.name)}</b><small>${record(t.record)} · #${rank} · ${d.year}</small></div></div>
  <nav>${NAV.map(([g, items]) => `<div class="nav-group"><span>${g}</span>${items.map(id => { const p = byId[id]; return `<a href="#/${id}" class="${a.route.name === id ? 'on' : ''}"><i>${p.icon}</i>${p.title}${badge[id] ? `<em>${badge[id]}</em>` : ''}</a>`; }).join('')}</div>`).join('')}</nav>
  <div class="side-foot"><button class="btn small" data-act="save-now">Guardar</button><button class="btn small" data-act="export">Exportar</button><button class="btn small" data-act="import">Importar</button><button class="btn small danger" data-act="new-career">Nueva</button><span id="save-state">${a.lastSaved ? 'Guardado ✓' : ''}</span></div>`;
}
function primary(a) {
  const lg = a.lg, d = lg.data;
  if (d.phase === 'offseason') return { label: `Comenzar temporada ${d.year + 1} →`, act: 'next-season' };
  const fx = lg.userFixture();
  if (fx) { const opp = lg.team(fx.home === d.userTeam ? fx.away : fx.home); return { label: `Jornada ${d.week + 1} · vs ${opp.short} →`, act: 'go-match' }; }
  return { label: 'Avanzar semana ▸', act: 'advance-week' };
}
function renderTopbar(a, page) {
  const lg = a.lg, d = lg.data, t = lg.user, w = lg.currentWeek(), p = primary(a), space = capSpace(lg, t);
  const phase = d.phase === 'offseason' ? 'OFFSEASON' : d.phase === 'playoffs' ? 'PLAYOFFS' : 'TEMPORADA REGULAR';
  return `<div class="crumb"><small>${phase} · ${d.year}</small><h2>${page.title}</h2></div>
  <div class="top-chips"><span class="tchip"><small>SEMANA</small><b>${w ? w.label + ' · ' + fmtWeek(d.year, d.week, true) : 'Offseason'}</b></span><span class="tchip"><small>CAJA</small><b>${fmtM(t.finance.cash)}</b></span></div>
  <button class="btn primary big" data-act="${p.act}">${p.label}</button>`;
}
function renderNew() {
  const has = store.hasSave();
  return `<div class="newgame"><div class="ng-head"><img src="${LOGO}" alt="" style="height:88px;width:auto"><div><h1>LGO <span>Franchise</span></h1><p>Modo franquicia: gestiona la plantilla y juega los partidos en 3D.</p></div></div>
  ${has ? `<div class="card"><div class="card-h"><h3>Carrera guardada</h3></div><p class="muted">Se encontró un guardado en este navegador.</p><button class="btn primary" data-act="continue">Continuar carrera</button></div>` : ''}
  <div class="card"><div class="card-h"><h3>Nueva carrera</h3></div>
   <div class="ng-teams">${TEAM_TEMPLATES.map((t, i) => `<label class="ng-team" style="--c:${t.color};--d:${t.dark}"><input type="radio" name="team" value="${t.id}" ${i === 0 ? 'checked' : ''}><div class="mono-crest lg" style="--c:${t.color};--d:${t.dark}">${t.id}</div><b>${t.name}</b><small>Ataque ${t.style.toLowerCase()} · Defensa ${t.defense.toLowerCase()}</small></label>`).join('')}</div>
   <div class="ng-opts"><label class="sel"><b>Temporada</b><select id="ng-len"><option value="7">Corta · 7 partidos + playoffs</option><option value="14" selected>Completa · 14 partidos + playoffs</option></select></label>
   <label class="sel"><b>Duración de cuarto</b><select id="ng-q"><option value="180">3 min · Rápido</option><option value="300" selected>5 min · Exhibición</option><option value="900">15 min · Reglamentario</option></select></label>
   <label class="sel"><b>Semilla</b><input id="ng-seed" type="number" min="1" max="999999" placeholder="aleatoria"></label></div>
   <button class="btn primary big" data-act="start-career">Empezar carrera ↗</button>${has ? '<p class="muted">Empezar una nueva carrera sobrescribirá el guardado actual.</p>' : ''}<button class="btn" data-act="import">Importar guardado (.json)</button></div></div>`;
}

// ----- global actions
const GLOBAL = {
  'modal-close'() { app.closeModal(); },
  'modal-yes'() { app.closeModal(); const f = app._yes; app._yes = null; f?.(); },
  go(a, el) { app.go(el.dataset.route, el.dataset.param || ''); },
  'go-match'() { app.go('match'); },
  'save-now'() { store.save(app.lg); app.lastSaved = new Date(); $('save-state').textContent = 'Guardado ✓'; app.toast('Partida guardada en este navegador.'); },
  export() { store.exportFile(app.lg); },
  import() { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json,application/json'; i.onchange = async () => { try { app.lg = store.importText(await i.files[0].text()); store.save(app.lg); app.go('dashboard'); app.render(); app.toast('Guardado importado.'); } catch (e) { app.toast('Archivo inválido: ' + e.message); } }; i.click(); },
  'new-career'() { app.confirm('¿Empezar una nueva carrera? Se perderá el progreso actual (puedes exportarlo antes).', () => { app.lg = null; app.render(); }, { yes: 'Nueva carrera', danger: true }); },
  continue() { const lg = store.load(); if (lg) { app.lg = lg; app.go('dashboard'); app.render(); } else app.toast('No se pudo leer el guardado.'); },
  'start-career'() {
    const team = document.querySelector('input[name=team]:checked')?.value || 'NTH', seed = +$('ng-seed').value || undefined;
    app.newLeague({ userTeam: team, seasonLength: +$('ng-len').value, quarterSeconds: +$('ng-q').value, seed });
  },
  'advance-week'() {
    const lg = app.lg, w = lg.currentWeek(); app.toast('Simulando semana…');
    setTimeout(() => { lg.advance(); app.commit(); app.go('dashboard'); app.render(); app.toast(w?.type === 'final' ? 'Temporada finalizada.' : 'Semana completada.'); }, 30);
  },
  'next-season'() {
    const lg = app.lg, exp = lg.roster(lg.user).filter(p => p.expiring);
    const text = exp.length ? `Aún tienes ${exp.length} jugador(es) con contrato vencido (${exp.slice(0, 4).map(p => p.name).join(', ')}${exp.length > 4 ? '…' : ''}). Si no los renuevas quedarán libres. ¿Comenzar la temporada ${lg.data.year + 1}?` : `¿Comenzar la temporada ${lg.data.year + 1}?`;
    app.confirm(text, () => { lg.startNextSeason(); window.matchLab?.unload(); app.commit(); app.go('dashboard'); app.render(); app.toast(`Temporada ${lg.data.year} en marcha.`); }, { yes: 'Comenzar' });
  },
  sort(a, el) { const u = a.ui; u.sort = u.sort?.key === el.dataset.key ? { key: el.dataset.key, dir: -u.sort.dir } : { key: el.dataset.key, dir: -1 }; a.refresh(); },
};
const pageHandlers = () => byId[app.route.name]?.handlers || {};
function dispatch(kind, e) {
  const attr = kind === 'click' ? 'data-act' : kind === 'input' ? 'data-input' : 'data-change';
  const el = e.target.closest(`[${attr}]`); if (!el || !app.lg && !['start-career', 'continue', 'import'].includes(el.getAttribute(attr))) return;
  const name = el.getAttribute(attr), table = kind === 'click' ? { ...GLOBAL, ...pageHandlers(), ...(app.modalHandlers || {}) } : { ...(kind === 'input' ? byId[app.route.name]?.inputs : byId[app.route.name]?.changes), ...(app.modalInputs?.[kind] || {}) };
  const fn = table?.[name]; if (fn) { if (kind === 'click' && el.tagName === 'A') e.preventDefault(); fn(app, el, e); }
}
document.addEventListener('click', e => dispatch('click', e));
document.addEventListener('input', e => dispatch('input', e));
document.addEventListener('change', e => dispatch('change', e));
$('modal').addEventListener('click', e => { if (e.target === $('modal')) app.closeModal(); });

// ----- boot
const loaded = store.hasSave() ? store.load() : null;
app.lg = loaded;
parseHash();
if (!location.hash) location.hash = '#/dashboard';
app.render();
window.franchise = app; // test hook

// ----- shared Touchline wallet: keep the user's team cash mirrored to the hub's silver.
if (typeof window !== 'undefined' && window.Touchline) {
  window.Touchline.onBalances(b => {
    if (!app.lg || !b || typeof b.silver !== 'number') return;
    const team = app.lg.user;
    if (team.finance.cash === b.silver) return;
    team.finance.cash = b.silver;
    app.commit(); app.refresh();
  });
  window.Touchline.getBalances().then(r => {
    if (!r || !r.ok || !app.lg) return;
    app.lg.user.finance.cash = r.balances.silver;
    app.commit(); app.refresh();
  });
}
