import { Game, DEFAULT_CFG } from '../manager/game.js';
import { ROLES } from '../manager/data.js';
import { saveGame, loadRaw } from '../manager/storage.js';
import { bindTactics } from './tacdefs.js';
import { PRESETS } from './tacdefs.js';
import { Match } from './match.js';
import * as S from './screens.js';
import { esc, signed, cls, money } from './widgets.js';
import { prefYears, LIM } from '../manager/market.js';
import { ATTRIBUTES } from '../manager/data.js';
import { autoRole } from '../manager/players.js';
import { TEAM_ROLES, ATTR_LABELS, POS_NAMES } from '../manager/data.js';
import '../../../assets/nations/nations.js';
import '../../../assets/tribuna/tribuna.js';

const $ = id => document.getElementById(id);
const app = $('app'), matchScreen = $('match-screen');
const ui = { screen: 'newgame', arg: null, tab: {}, sort: {}, cfg: { ...DEFAULT_CFG }, newTeam: 0, pending: null, preview: null, previewKey: '', seed: 1 + Math.floor(Math.random() * 1e6) };
let game = null, saveTimer = 0;

const NAV = [['dashboard', 'Inicio'], ['roster', 'Plantilla'], ['tactics', 'Tácticas'], ['schedule', 'Calendario'], ['standings', 'Clasificación'], ['stats', 'Estadísticas'],
  ['market', 'Mercado'], ['contracts', 'Contratos'], ['scouting', 'Scouting y draft'], ['training', 'Entrenamiento'], ['finances', 'Finanzas'], ['copa', 'Copa'], ['tribuna', 'Tribuna']];

// ---------- utilidades ----------
const save = () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => game && saveGame(game), 350); };
function toast(t) { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, 2800); }
function busy(text, pct = null) { const b = $('busy'); b.hidden = !text; if (text) { $('busy-text').textContent = text; $('busy-fill').style.width = pct == null ? '15%' : `${Math.round(pct * 100)}%`; } }
const nextFrame = () => new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
function modal(html) { const m = $('modal'); m.innerHTML = html ? `<div>${html}</div>` : ''; m.hidden = !html; }
const keepScroll = fn => { const y = window.scrollY; fn(); window.scrollTo(0, y); };

// ---------- navegación y render ----------
function renderNav() {
  const nav = $('nav'); if (!game) { nav.innerHTML = ''; return; }
  nav.innerHTML = NAV.map(([id, label, soon]) => `<button class="${ui.screen === id ? 'active' : ''} ${soon ? 'soon' : ''}" ${soon ? 'title="Llega en el Tramo C" data-act="soon"' : `data-go="${id}"`}>${label}</button>`).join('')
    + `<span class="grow"></span>${Match.isOpen ? `<button class="${ui.screen === 'match' ? 'active' : ''}" data-go="match">● Partido</button>` : ''}<button data-go="exhibition" class="${ui.screen === 'exhibition' ? 'active' : ''}">Exhibición</button><button data-go="newgame">Menú</button>`;
}
function renderHeader() {
  $('hdr-team').textContent = game ? game.user.name : 'MANAGER'; $('hdr-time').textContent = game ? `T${game.s.season} · ${game.timeline()}` : 'Basketball Manager';
}
function render() {
  const isMatch = ui.screen === 'match' || ui.screen === 'exhibition';
  matchScreen.hidden = !isMatch || !Match.isOpen; app.hidden = isMatch;
  if (!isMatch) {
    if (ui.screen === 'newgame') { const key = JSON.stringify(ui.cfg) + ui.seed; if (ui.previewKey !== key) { ui.preview = Game.create({ ...ui.cfg }, 0, ui.seed); ui.previewKey = key; } }
    const fn = S[ui.screen] ?? S.dashboard;
    app.innerHTML = fn({ g: game, ui, hasSave: !!loadRaw() });
    if (ui.screen === 'tactics') bindTactics(app, (k, v) => { game.user.tactics[k] = v; save(); keepScroll(render); });
  }
  renderNav(); renderHeader();
}
async function go(screen, arg = null) {
  if (screen === 'tribuna') { window.Tribuna.open('lbo'); return; }
  if (screen === 'exhibition') { if (Match.inProgress) return askLeave(() => go(screen, arg)); Match.openExhibition(); ui.screen = 'exhibition'; render(); return; }
  if (screen === 'match') { ui.screen = 'match'; render(); return; }
  if (Match.inProgress) return askLeave(() => go(screen, arg));
  if (Match.isOpen) Match.close();
  if (!game && screen !== 'newgame') screen = 'newgame';
  ui.screen = screen; ui.arg = arg; window.scrollTo(0, 0); render();
}
function askLeave(then) {
  modal(`<h3 style="margin-top:0">Partido en curso</h3><p style="font-size:12px;line-height:1.6">Si sales, el resto del partido se simulará con tus tácticas actuales y se registrará el resultado.</p><div class="row"><button class="btn pri" data-act="leaveMatch">Simular resto y salir</button><button class="btn ghost" data-act="closeModal">Seguir viendo</button></div>`);
  askLeave.then = then;
}

// ---------- flujo de partidos ----------
const progressCb = label => (i, n) => { busy(`${label} (${i}/${n})`, i / n); };
async function play(mode) {
  const e = game.userEntry(); if (!e) return simDay();
  if (mode === 'sim') {
    busy('Simulando el partido…'); await nextFrame();
    const m = await game.simulateEntry(e); busy(false); ui.pending = { mid: m.id }; save(); go('result', m.id); return;
  }
  const sim = game.buildSim(e), home = game.team(e.home), away = game.team(e.away), day = game.currentDay();
  const ok = Match.openCareer({ sim, homeName: [home.city.toUpperCase(), home.nick.toUpperCase()], awayName: [away.city.toUpperCase(), away.nick.toUpperCase()], userSide: e.home === game.s.userId ? 0 : 1,
    title: `${home.city} vs ${away.city}`, sub: `${home.name} · ${away.name}`, eyebrow: day.label.toUpperCase(),
    onFinish: s => { const m = game.commit(e, s); Match.close(); ui.pending = { mid: m.id }; save(); go('result', m.id); },
    onSaveBase: d => { const u = game.user; Object.assign(u.tactics, d.tactics); u.usage = d.usage; u.assign = d.assign; u.plan.closer = d.plan.closer ?? u.plan.closer; u.plan.foulPolicy = d.plan.foulPolicy; u.plan.staminaPolicy = d.plan.staminaPolicy; save(); } });
  if (ok === false) return; ui.screen = 'match'; render();
}
async function finishDayUi(label = 'Simulando la jornada') {
  busy(`${label}…`, 0.05); await nextFrame();
  const before = game.s.phase; await game.finishDay(progressCb(label)); busy(false);
  if (game.s.phase !== before && game.s.phase === 'playoffs') toast('¡Empiezan los playoffs!');
  save();
}
async function simDay() { await finishDayUi(); ui.pending = null; go('dashboard'); }
async function simPhase() {
  const phase = game.s.phase; let n = 0;
  while (game.s.phase === phase && game.currentDay() && n < 400) { busy(`Simulando… ${game.currentDay().label}`, 0.1); await nextFrame(); await game.finishDay(null); n++; }
  busy(false); save(); ui.pending = null; go('dashboard');
}
async function afterResult() { await finishDayUi('Simulando el resto de la jornada'); ui.pending = null; go('dashboard'); }
function nextSeason() {
  const rep = game.startNextSeason(); save(); go('dashboard');
  modal(`<h3 style="margin-top:0">Informe de progresión · Temporada ${game.s.season}</h3><p class="muted" style="font-size:11px">Cambios de tu plantilla tras el entrenamiento y el paso del tiempo.</p>
    <table class="tbl"><thead><tr><th class="l">Jugador</th><th>Edad</th><th>OVR</th><th>Cambio</th><th>POT</th></tr></thead><tbody>${rep.players.sort((a, b) => b.ovr - a.ovr).map(p => `<tr><td class="l">${esc(p.name)}</td><td>${p.age}</td><td>${p.ovr}</td><td class="${cls(p.delta)}">${signed(p.delta)}</td><td>${p.pot}</td></tr>`).join('')}</tbody></table>
    ${rep.retired.length ? `<div class="hint warn">Retirados: ${rep.retired.map(esc).join(', ')}</div>` : ''}${rep.rookies.length ? `<div class="hint">Nuevos jóvenes en plantilla: ${rep.rookies.map(esc).join(', ')}</div>` : ''}
    ${rep.training.some(t => t.gain > 0) ? `<div class="hint">Entrenamiento: ${rep.training.filter(t => t.gain > 0).map(t => `${esc(t.name)} +${t.gain} ${esc(t.attr)}`).join(' · ')}</div>` : ''}${rep.expired.length ? `<div class="hint warn">Contratos expirados (se marcharon): ${rep.expired.map(esc).join(', ')}</div>` : ''}${rep.released.length ? `<div class="hint warn">Plantilla por encima de ${LIM.max}: se liberó a ${rep.released.map(esc).join(', ')}</div>` : ''}${game.user.roster.length < 13 ? `<div class="hint">Tu plantilla tiene ${game.user.roster.length} jugadores: revisa el mercado.</div>` : ''}<div class="row" style="margin-top:14px"><button class="btn pri" data-act="closeModal">Empezar la temporada</button></div>`);
}
function ask(text, yes, label = 'Confirmar') { modal(`<p style="font-size:13px;line-height:1.6;margin-top:0">${text}</p><div class="row"><button class="btn pri" data-act="confirm">${label}</button><button class="btn ghost" data-act="closeModal">Cancelar</button></div>`); ask.yes = yes; }

// ---------- negociación ----------
function negModal(msg = null, counter = null) {
  const n = ui.neg, p = game.player(n.pid), renew = n.kind === 'renew', ev = game.evalOffer(p, n, renew);
  const capWarn = '';
  const mood = ev.status === 'accept' ? '<span class="pos">Dispuesto a firmar</span>' : ev.status === 'counter' ? '<span style="color:var(--warn)">Casi convencido: pide algo más</span>' : '<span class="neg">Muy lejos de lo que pide</span>';
  modal(`<h3 style="margin-top:0">${renew ? 'Renovar a' : 'Ofertar a'} ${esc(p.name)}</h3><p class="muted" style="font-size:11px">${p.role} · ${p.age} años · OVR ${p.ovr} / POT ${p.pot}${renew ? ` · moral ${Math.round(p.morale)}` : ''}</p>
    <div class="sl" style="grid-template-columns:90px 1fr 60px"><span>Salario</span><input type="range" min="0.5" max="45" step="0.1" value="${n.salary}" data-neg="salary"><output>${Number(n.salary).toFixed(1)} M€</output></div>
    <div class="sl" style="grid-template-columns:90px 1fr"><span>Años</span><select class="f" data-neg="years">${[1, 2, 3, 4, 5].map(y => `<option value="${y}"${y === n.years ? ' selected' : ''}>${y}${y === prefYears(p) ? ' (preferido)' : ''}</option>`).join('')}</select></div>
    <div class="sl" style="grid-template-columns:90px 1fr"><span>Rol</span><select class="f" data-neg="role">${Object.entries(TEAM_ROLES).map(([k, [l]]) => `<option value="${k}"${k === n.role ? ' selected' : ''}>${l}${k === autoRole(p) ? ' (esperado)' : ''}</option>`).join('')}</select></div>
    <p style="font-size:12px;margin:12px 0">Para ese rol y duración pide <b>${ev.ask} M€</b> · ${mood}</p>${capWarn}${msg ? `<div class="hint warn">${esc(msg)}</div>` : ''}
    <div class="row"><button class="btn pri" data-act="negSubmit">Ofrecer contrato</button>${counter ? `<button class="btn" data-act="negCounter" data-ask="${counter}">Ofrecer ${counter} M€</button>` : ''}<button class="btn ghost" data-act="closeModal">Cancelar</button></div>`);
}
function negSubmit() {
  const n = ui.neg, o = { salary: Number(n.salary), years: n.years, role: n.role }, r = n.kind === 'fa' ? game.signFreeAgent(n.pid, o) : game.renewPlayer(n.pid, o);
  if (r.ok) { modal(''); toast(r.msg); save(); render(); } else negModal(r.msg, r.ask && r.ask <= 45 ? r.ask : null);
}

// ---------- rotación ----------
function setSlot(i, pid) {
  const u = game.user, slots = [...u.lineup.starters, ...u.lineup.bench]; while (slots.length < 10) slots.push(null);
  const old = slots[i], j = pid ? slots.indexOf(pid) : -1;
  if (pid && j >= 0) slots[j] = old; slots[i] = pid || null;
  if (slots.slice(0, 5).some(x => !x)) { toast('El quinteto titular necesita 5 jugadores'); return; }
  u.lineup = { starters: slots.slice(0, 5), bench: slots.slice(5).filter(Boolean) };
  for (const id of slots.filter(Boolean)) if (u.plan.minutes[id] == null) u.plan.minutes[id] = 0.3;
  save(); keepScroll(render);
}
function normMinutes() {
  const u = game.user, ids = [...u.lineup.starters, ...u.lineup.bench], sum = ids.reduce((a, id) => a + (u.plan.minutes[id] ?? 0), 0) || 1;
  ids.forEach(id => { u.plan.minutes[id] = +Math.min(0.95, (u.plan.minutes[id] ?? 0) / sum * 5).toFixed(2); }); save(); keepScroll(render);
}

// ---------- eventos ----------
const actions = {
  pickTeam: d => { ui.newTeam = Number(d.id); render(); },
  regen: () => { ui.seed = 1 + Math.floor(Math.random() * 1e6); render(); },
  startGame: () => {
    game = ui.preview; game.s.userId = ui.newTeam; game.s.teams.forEach((t, i) => { t.isUser = i === ui.newTeam; }); game.s.inbox = [];
    game.news('Bienvenido', `Diriges a ${game.user.name}. Ajusta tu quinteto y tus tácticas y juega la primera jornada.`); ui.preview = null; ui.previewKey = ''; save(); ui.pending = null; go('dashboard');
  },
  continueGame: () => { const raw = loadRaw(); if (!raw) return toast('No hay partida guardada'); game = new Game(raw); go('dashboard'); },
  play: d => play(d.mode), simDay, afterResult, nextSeason,
  simPhase: () => ask(`Se simularán todas las jornadas hasta el final de ${game.s.phase === 'regular' ? 'la liga regular' : 'los playoffs'} usando tus tácticas actuales. ¿Continuar?`, simPhase, 'Simular'),
  closeModal: () => modal(''), confirm: () => { modal(''); ask.yes?.(); },
  leaveMatch: async () => { modal(''); busy('Simulando el resto del partido…'); await nextFrame(); const s = Match.finishInstantly(); const e = s.entry; const m = game.commit(e, s); Match.close(); busy(false); ui.pending = { mid: m.id }; save(); go('result', m.id); },
  negOpen: d => { const p = game.player(d.id), renew = d.kind === 'renew'; ui.neg = { pid: d.id, kind: d.kind, salary: 1, years: prefYears(p), role: renew ? p.contract.role : autoRole(p) }; ui.neg.salary = game.evalOffer(p, ui.neg, renew).ask; negModal(); },
  negSubmit, negCounter: d => { ui.neg.salary = Number(d.ask); negSubmit(); },
  release: d => { const p = game.player(d.id), c = p.contract; ask(`¿Liberar a ${esc(p.name)}? Pagarás ${money(c.salary * 0.5)} durante ${Math.min(c.years, 3)} temporada(s) y perderás al jugador.`, () => { const r = game.releasePlayer(d.id); toast(r.msg); save(); render(); }, 'Liberar'); },
  offerYes: d => { const r = game.acceptOffer(Number(d.id)); toast(r.msg); save(); keepScroll(render); },
  offerNo: d => { game.rejectOffer(Number(d.id)); save(); keepScroll(render); },
  tradeTeam: (d, el) => { ui.trade = { team: Number(el.value), mine: [], theirs: [], res: null }; keepScroll(render); },
  tradeToggle: (d, el) => { const arr = ui.trade[d.side], i = arr.indexOf(d.id); if (i >= 0) arr.splice(i, 1); else arr.push(d.id); ui.trade.res = null; keepScroll(render); },
  tradePropose: () => { const T = ui.trade, r = game.evalTrade(T.team, T.mine, T.theirs); if (r.ok) { game.executeTrade(T.team, T.mine, T.theirs); toast('Traspaso completado'); ui.trade = { team: T.team, mine: [], theirs: [], res: null }; save(); } else T.res = r; keepScroll(render); },
  scout: d => { const r = game.scoutProspect(d.id); if (!r.ok) toast(r.msg); save(); keepScroll(render); },
  draftPick: d => { game.draftSelect(d.id); game.draftToUser(); save(); keepScroll(render); },
  draftGo: () => { game.draftToUser(); save(); keepScroll(render); },
  draftAuto: () => ask('Se simulará todo el draft; tus picks los elegirá la IA. ¿Continuar?', () => { game.completeDraft(); save(); render(); }, 'Simular draft'),
  setIntensity: (d, el) => { game.s.trainIntensity = el.value; save(); keepScroll(render); },
  setFocus: (d, el) => { const p = game.player(d.id); p.focus = el.value || null; save(); keepScroll(render); },
  autoFocus: () => { for (const p of game.roster(game.user)) p.focus = game.recommendFocus(p); toast('Focos recomendados aplicados'); save(); keepScroll(render); },
  clearFocus: () => { for (const p of game.roster(game.user)) p.focus = null; save(); keepScroll(render); },
  upgrade: d => { const r = game.upgradeFacility(d.key); toast(r.msg); save(); keepScroll(render); },
  soon: () => toast('Esta sección llega en el Tramo C'),
  preset: d => { Object.assign(game.user.tactics, PRESETS[d.name]); save(); keepScroll(render); toast(`Plan “${d.name}” aplicado`); },
  autoLineup: () => { game.autoLineup(game.user); save(); keepScroll(render); }, normMinutes,
  setUsage: (d, el) => { game.user.usage[d.id] = el.value; save(); },
  setAssign: (d, el) => { if (el.value === '') delete game.user.assign[d.id]; else game.user.assign[d.id] = Number(el.value); save(); },
  setPlan: (d, el) => { game.user.plan[d.k] = el.value || null; save(); },
  setSlot: (d, el) => setSlot(Number(d.i), el.value),
  setMinutes: (d, el) => { game.user.plan.minutes[d.id] = Number(el.value) / 100; save(); keepScroll(render); },
};
document.addEventListener('click', event => {
  const t = event.target.closest('[data-go],[data-act],[data-set],th[data-sort]'); if (!t || !app.contains(t) && !$('nav').contains(t) && !$('modal').contains(t)) return;
  if (t.matches('th[data-sort]')) { const k = t.dataset.key, cur = ui.sort[k]; ui.sort[k] = { k: t.dataset.sort, dir: cur?.k === t.dataset.sort && cur.dir === 'desc' ? 'asc' : 'desc' }; keepScroll(render); return; }
  if (t.dataset.set) { const [k, v] = t.dataset.set.split(':'); ui.tab[k] = v; keepScroll(render); return; }
  if (t.dataset.go) { go(t.dataset.go, t.dataset.arg ?? null); return; }
  if (t.dataset.act && t.tagName !== 'SELECT' && t.tagName !== 'INPUT') actions[t.dataset.act]?.(t.dataset, t);
});
document.addEventListener('change', event => {
  const el = event.target;
  if (el.dataset.cfg) { const k = el.dataset.cfg; ui.cfg[k] = k === 'bestOf' ? el.value.split(',').map(Number) : Number(el.value); if (k === 'teams' && ui.newTeam >= ui.cfg.teams) ui.newTeam = 0; render(); return; }
  if (el.dataset.neg) { const k = el.dataset.neg; ui.neg[k] = k === 'role' ? el.value : Number(el.value); negModal(); return; }
  if (el.dataset.act && (el.tagName === 'SELECT' || el.tagName === 'INPUT')) actions[el.dataset.act]?.(el.dataset, el);
});
document.addEventListener('input', event => { const el = event.target; if (el.type === 'range' && el.dataset.act === 'setMinutes') { const o = el.parentElement.querySelector('output'); if (o) o.textContent = (Number(el.value) / 100 * game.gameMinutes()).toFixed(1); } });
window.__app = { get game() { return game; }, ui, go };

// ---------- Tribuna LBO: álbum de cromos (assets/tribuna/tribuna.js) ----------
try {
  window.LFONations.setBase(new URL('../assets/nations/', location.href).href);
  window.Tribuna.setBase(new URL('../assets/', location.href).href);
  window.Tribuna.register({
    id: 'lbo', title: 'Tribuna LBO', sport: 'basquet', accent: '#ff9a3c', logo: 'logos/lbo-sm.png', tiers: window.Tribuna.tiersWith([0, 60, 68, 74, 80, 88]),
    statLabels: [['Triple', 'TRI'], ['Tiro', 'TIR'], ['Pase', 'PAS'], ['Defensa exterior', 'DEF'], ['Rebote', 'REB'], ['Velocidad', 'VEL']],
    getCards() {
      if (!game) return [];
      const s = game.s;
      return Object.values(s.players).map(p => {
        const t = p.teamId != null ? s.teams[p.teamId] : null, stats = {};
        Object.keys(ATTR_LABELS).forEach(k => { if (p.a[k] != null) stats[ATTR_LABELS[k]] = Math.round(p.a[k]); });
        return { id: 'lbo-' + p.id, name: p.first && p.last ? `${p.first} ${p.last}` : p.name, number: p.num, pos: p.role, posName: POS_NAMES[p.role], ovr: p.ovr, age: p.age, skin: p.skin,
          team: t ? { id: t.id, name: t.name, short: t.short, primary: t.color, secondary: t.alt } : { id: 'libre', name: 'Agente libre', short: 'LIB', primary: '#5b6673', secondary: '#e8edf2' },
          nation: window.LFONations.forPerson(p.id, t ? t.short : 'libre'), stats,
          info: [['Altura', p.h.toFixed(2) + ' m'], ['Edad', p.age + ' años'], ['Potencial', p.pot], ['Contrato', p.contract ? p.contract.salary + ' M€ · ' + p.contract.years + ' años' : 'sin contrato']] };
      });
    },
  });
} catch (e) { console.warn('Tribuna no disponible', e); }

// ---------- arranque ----------
const raw = loadRaw();
if (raw) { try { game = new Game(raw); ui.screen = 'dashboard'; } catch (e) { game = null; } }
render();

// ----- economía compartida Touchline: la caja del club se refleja con la Plata del hub.
if (typeof window !== 'undefined' && window.Touchline) {
  window.Touchline.onBalances(b => {
    if (!game || !game.fin || !b || typeof b.silver !== 'number') return;
    if (game.fin.cash === b.silver) return;
    game.fin.cash = b.silver;
    keepScroll(render);
  });
  window.Touchline.getBalances().then(r => {
    if (!r || !r.ok || !game || !game.fin) return;
    game.fin.cash = r.balances.silver;
    save(); keepScroll(render);
  });
}
