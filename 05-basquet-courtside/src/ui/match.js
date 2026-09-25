import { MatchSimulator } from '../simulation/match.js';
import { STYLES, PLAY_NAMES } from '../simulation/model.js';
import { MatchView, ReplayBuffer } from '../presentation/view.js';
import { MatchAudio } from '../presentation/audio.js';
import { USAGE } from '../manager/data.js';
import { tacticsHtml, bindTactics, optHtml } from './tacdefs.js';
import '../../../assets/broadcast/broadcast.js';

const $ = id => document.getElementById(id);
const STEP = 1 / 60, MAX_STEPS_PER_FRAME = 16;
const CAMERAS = { broadcast: 'BROADCAST CAM', wide: 'CANCHA COMPLETA', close: 'A PIE DE CANCHA' };
const DEAD_LABELS = { score: 'Saque tras canasta', foul: 'Falta · saque', out: 'Saque de banda', timeout: 'Tiempo muerto', inbound: 'Saque' };
const svg = (body, extra = '') => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" ${extra}>${body}</svg>`;
const ICONS = {
  play: '<svg viewBox="0 0 14 14"><path d="M3 1.5v11l9-5.5z"/></svg>', pause: '<svg viewBox="0 0 14 14"><path d="M3 1.5h3v11H3zM8 1.5h3v11H8z"/></svg>',
  settings: svg('<path d="M2 4.5h7M12 4.5h2M2 11.5h2M7 11.5h7"/><circle cx="10.5" cy="4.5" r="1.5"/><circle cx="5.5" cy="11.5" r="1.5"/>'), camera: svg('<rect x="1.5" y="4" width="9" height="8" rx="1.5"/><path d="M10.5 7l4-2v6l-4-2z"/>'),
  replay: svg('<path d="M2.5 8a5.5 5.5 0 1 0 1.8-4.1"/><path d="M2.5 2.5v3h3"/>'), soundOn: svg('<path d="M2 6v4h2.5L8 13V3L4.5 6z"/><path d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12.3 3.7a6 6 0 0 1 0 8.6"/>'),
  soundOff: svg('<path d="M2 6v4h2.5L8 13V3L4.5 6z"/><path d="M11 6l3.5 4M14.5 6L11 10"/>'), fullscreen: svg('<path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/>'),
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ordinal = n => ({ 1: '1.er', 2: '2.º', 3: '3.er', 4: '4.º' }[n] || `${n}.º`);
const periodLabel = s => s.period > s.rules.periods ? (s.period - s.rules.periods > 1 ? `PRÓRROGA ${s.period - s.rules.periods}` : 'PRÓRROGA') : `${ordinal(s.period)} CUARTO`;
function fmtClock(sec) { sec = Math.max(0, sec); if (sec < 60) return sec.toFixed(1).padStart(4, '0'); return `${String(Math.floor(Math.ceil(sec) / 60)).padStart(2, '0')}:${String(Math.ceil(sec) % 60).padStart(2, '0')}`; }
const fmtEventClock = sec => { sec = Math.ceil(Math.max(0, sec)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; };
const setText = (el, value) => { value = String(value); if (el.__text !== value) { el.__text = value; el.textContent = value; } };
const setHtml = (el, value) => { if (el.__html !== value) { el.__html = value; el.innerHTML = value; } };
const usageKey = v => Object.entries(USAGE).find(([, x]) => Math.abs(x[1] - v) < 0.01)?.[0] ?? 'normal';

const els = {
  screen: $('match-screen'), courtView: $('court-view'), loading: $('loading'), liveLabel: $('live-label'), center: $('center-message'),
  homeScore: $('home-score'), awayScore: $('away-score'), quarter: $('quarter'), clock: $('game-clock'), shotClock: $('shot-clock'), homeFouls: $('home-fouls'), awayFouls: $('away-fouls'),
  possDot: $('possession-dot'), possTeam: $('possession-team'), playLabel: $('play-label'), viewName: $('view-name'),
  playButton: $('play-button'), playIcon: $('play-icon'), playText: $('play-text'), replay: $('replay-button'), audio: $('audio-button'), camera: $('camera-select'), fullscreen: $('fullscreen-button'), skip: $('skip-button'),
  mini: $('mini-court'), shotMap: $('shot-map'), feed: $('event-feed'), lineup: $('lineup-list'), stats: $('stats-list'), homeStyle: $('home-style'), awayStyle: $('away-style'),
  timeout: $('timeout-button'), timeoutsLeft: $('timeouts-left'), debugButton: $('debug-button'), debugPanel: $('debug-panel'), debugRows: $('debug-rows'), debugBall: $('debug-ball'),
  dialog: $('settings-dialog'), form: $('settings-form'), formatLabel: $('format-label'), settingsButton: $('settings-button'), toast: $('toast'), coach: $('tab-coach'), coachTab: $('coach-tab-button'),
  title: $('match-title'), sub: $('match-sub'), eyebrow: $('match-eyebrow'),
};
const crests = [document.querySelector('.score-team.home .team-crest'), document.querySelector('.score-team.away .team-crest')];
const ORIGINAL_CREST = crests.map(c => ({ html: c.innerHTML, cls: c.className }));

const settings = { duration: 180, shotClock: 24, homeStyle: 'PACE & SPACE', awayStyle: 'PICK & ROLL', seed: 41 };
const audio = new MatchAudio();
let sim = null, view = null, replay = new ReplayBuffer(), mode = 'exhibition', career = null, isOpen = false;
let paused = false, speed = 1, accumulator = 0, dialogPaused = false, lastFrame = performance.now(), started = false;
let lastFeedId = -1, lastShotCount = -1, lastPanelUpdate = 0, toastTimer = 0, lastCoach = 0;

function toast(text) { els.toast.textContent = text; els.toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { els.toast.hidden = true; }, 2800); }

// ---------- iconos y selects estáticos ----------
document.querySelector('.settings-icon').innerHTML = ICONS.settings; document.querySelector('.camera-icon').innerHTML = ICONS.camera;
els.replay.innerHTML = ICONS.replay; els.audio.innerHTML = ICONS.soundOff; els.fullscreen.innerHTML = ICONS.fullscreen;
for (const foul of [els.homeFouls, els.awayFouls]) foul.innerHTML = '<i></i>'.repeat(5);
for (const select of [document.querySelector('[name=homeStyle]'), document.querySelector('[name=awayStyle]')]) select.innerHTML = Object.keys(STYLES).map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('');

// ---------- cancha 2D ----------
function courtTransform(canvas) { const pad = 10, s = Math.min((canvas.width - pad * 2) / 28, (canvas.height - pad * 2) / 15); const cx = canvas.width / 2, cy = canvas.height / 2; return { s, cx, cy, X: x => cx + x * s, Y: z => cy + z * s }; }
function drawCourt(ctx, t) {
  const { s, cx, cy } = t; ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.strokeStyle = 'rgba(190,220,215,.34)'; ctx.lineWidth = 1.3 / s;
  ctx.strokeRect(-13.94, -7.44, 27.88, 14.88); ctx.beginPath(); ctx.moveTo(0, -7.44); ctx.lineTo(0, 7.44); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 1.8, 0, Math.PI * 2); ctx.stroke();
  const a = Math.asin(6.6 / 6.75), cross = 12.425 - Math.sqrt(6.75 ** 2 - 6.6 ** 2);
  for (const d of [-1, 1]) {
    ctx.save(); ctx.scale(d, 1); ctx.fillStyle = 'rgba(105,183,181,.09)'; ctx.fillRect(8.2, -2.45, 5.74, 4.9); ctx.strokeRect(8.2, -2.45, 5.74, 4.9);
    ctx.beginPath(); ctx.arc(8.2, 0, 1.8, Math.PI / 2, Math.PI * 1.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(13.94, -6.6); ctx.lineTo(cross, -6.6); ctx.arc(12.425, 0, 6.75, Math.PI + a, Math.PI - a, true); ctx.lineTo(13.94, 6.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12.95, -0.9); ctx.lineTo(12.95, 0.9); ctx.stroke(); ctx.strokeStyle = 'rgba(237,128,80,.7)'; ctx.beginPath(); ctx.arc(12.425, 0, 0.23, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}
function drawMini() {
  const c = els.mini, ctx = c.getContext('2d'), t = courtTransform(c); ctx.clearRect(0, 0, c.width, c.height); drawCourt(ctx, t);
  for (const p of sim.players) {
    const x = t.X(p.x), y = t.Y(p.z); ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fillStyle = sim.teams[p.team].color; ctx.fill();
    if (sim.ball.owner === p) { ctx.lineWidth = 2.5; ctx.strokeStyle = '#f4ede0'; ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(p.facing) * 14, y + Math.cos(p.facing) * 14); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(16,23,27,.75)'; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(t.X(sim.ball.x), t.Y(sim.ball.z), 4.5, 0, Math.PI * 2); ctx.fillStyle = '#f2b36f'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = '#10171b'; ctx.stroke();
}
function drawShotMap() {
  const c = els.shotMap, ctx = c.getContext('2d'), t = courtTransform(c); ctx.clearRect(0, 0, c.width, c.height); drawCourt(ctx, t);
  for (const shot of sim.shots) {
    const x = t.X(shot.x), y = t.Y(shot.z), color = sim.teams[shot.team].color; ctx.lineWidth = 2.2;
    if (shot.made) { ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
    else { ctx.strokeStyle = color; ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4); ctx.stroke(); }
  }
}

// ---------- paneles ----------
function renderFeed() {
  const latest = sim.events[0]?.id ?? 0; if (latest === lastFeedId) return; lastFeedId = latest;
  if (!sim.events.length) { els.feed.innerHTML = '<div class="empty-feed"><div class="empty-lines"><i></i><i></i><i></i></div><b>Sin jugadas todavía.</b><p>Las jugadas importantes aparecerán aquí.</p></div>'; return; }
  els.feed.innerHTML = sim.events.slice(0, 40).map(e => { const who = e.team === null ? '' : `${sim.teams[e.team].short} · `, when = e.period > sim.rules.periods ? 'PRÓR.' : `C${e.period}`;
    return `<div class="event-item${e.type === 'score' ? ' scoring' : ''}"><time>${fmtEventClock(e.clock)}</time><div><b>${esc(e.text)}</b><small>${who}${when}</small></div></div>`; }).join('');
}
function renderLineup() {
  setHtml(els.lineup, sim.teams.map(team => `<div class="lineup-team-title ${team.id ? 'away' : 'home'}-text">${esc(team.name)}</div>` + team.active.map(p => { const pct = Math.round(p.energy * 100);
    return `<div class="lineup-player"><span class="jersey-number">${p.number}</span><div>${esc(p.name)}<small>${p.role} · ${p.stats.points} PTS · ${p.stats.rebounds} REB · ${p.fouls} F</small></div><div style="flex:0 0 40px"><div class="energy-pct">${pct}%</div><div class="energy-bar" style="margin-left:auto"><i style="width:${pct}%"></i></div></div></div>`; }).join('')).join(''));
}
function renderStats() {
  const [h, a] = sim.teams, fouls = t => t.roster.reduce((sum, p) => sum + p.fouls, 0);
  const rows = [['Puntos', h.score, a.score], ['Tiros de campo', h.stats.fgm, a.stats.fgm, `${h.stats.fgm}/${h.stats.fga}`, `${a.stats.fgm}/${a.stats.fga}`], ['Triples', h.stats.tpm, a.stats.tpm, `${h.stats.tpm}/${h.stats.tpa}`, `${a.stats.tpm}/${a.stats.tpa}`],
    ['Tiros libres', h.stats.ftm, a.stats.ftm, `${h.stats.ftm}/${h.stats.fta}`, `${a.stats.ftm}/${a.stats.fta}`], ['Rebotes', h.stats.rebounds, a.stats.rebounds], ['Asistencias', h.stats.assists, a.stats.assists], ['Robos', h.stats.steals, a.stats.steals],
    ['Tapones', h.stats.blocks, a.stats.blocks], ['Pérdidas', h.stats.turnovers, a.stats.turnovers], ['Puntos en contragolpe', h.stats.fastBreakPoints, a.stats.fastBreakPoints], ['Puntos en la pintura', h.stats.paintPoints, a.stats.paintPoints], ['Faltas', fouls(h), fouls(a)]];
  setHtml(els.stats, rows.map(([label, hv, av, ht = hv, at = av]) => { const total = hv + av; return `<div class="stat-row"><div class="stat-values"><b>${ht}</b><span>${label}</span><b>${at}</b></div><div class="stat-bar"><i style="flex:${total ? hv : 1}"></i><i style="flex:${total ? av : 1}"></i></div></div>`; }).join(''));
}
function renderDebug() {
  const b = sim.ball, owner = b.owner ? `${b.owner.number} ${b.owner.name}` : '—'; setText(els.debugBall, `BALÓN · ${b.mode} · ${owner} · y=${b.y.toFixed(2)}`);
  setHtml(els.debugRows, sim.players.map(p => `<tr><td style="color:${sim.teams[p.team].color}">${p.number} ${esc(p.name)}</td><td>${p.state}</td><td>${p.action || '—'}</td><td>${Math.round(p.energy * 100)}%</td><td>${p.target.x.toFixed(1)} / ${p.target.z.toFixed(1)}</td><td>${esc(p.decision)}</td></tr>`).join(''));
}
const activeTab = () => document.querySelector('.sidebar-tabs button.active')?.dataset.tab;

// ---------- panel de decisiones del entrenador (solo modo carrera) ----------
function coachCourtRows() {
  const t = sim.teams[career.userSide], bench = t.roster.filter(p => !p.active);
  const benchOpts = `<option value="">Cambiar por…</option>` + bench.map(b => `<option value="${b.id}"${b.fouls >= sim.rules.foulLimit ? ' disabled' : ''}>#${b.number} ${esc(b.name)} · ${Math.round(b.energy * 100)}% · F${b.fouls}</option>`).join('');
  const queued = t.subQueue.length ? `<div class="hint warn">${t.subQueue.length} cambio(s) programado(s): entrarán en el próximo balón parado.</div>` : '';
  return queued + t.active.map(p => `<div class="mini-row"><span>#${p.number} ${esc(p.name)} <span class="muted">· ${Math.round(p.energy * 100)}% · F${p.fouls}</span></span><select class="f" data-sub="${p.id}">${benchOpts}</select></div>`).join('');
}
function renderCoach() {
  if (!career || !sim) return; const side = career.userSide, t = sim.teams[side], opp = sim.teams[1 - side];
  const pool = t.roster.map(p => `<option value="${p.id}"${t.plan.closer === p.id ? ' selected' : ''}>#${p.number} ${esc(p.name)}</option>`).join('');
  const usageOpts = cur => Object.entries(USAGE).map(([k, [l]]) => `<option value="${k}"${k === cur ? ' selected' : ''}>${l}</option>`).join('');
  const oppOpts = cur => `<option value="">Automático</option>` + opp.active.map(p => `<option value="${p.slot}"${String(cur) === String(p.slot) ? ' selected' : ''}>${p.role} · ${esc(p.name)}</option>`).join('');
  els.coach.innerHTML = `<div class="hint">Los cambios se aplican al instante a la IA de tu equipo.</div><h4>Táctica</h4>${tacticsHtml(t.tactics)}
    <h4>Rotación · en cancha</h4><div id="coach-court">${coachCourtRows()}</div>
    <h4>Jugador de cierre</h4><select class="f" data-plan="closer"><option value="">Ninguno</option>${pool}</select>
    <h4>Gestión de faltas</h4><select class="f" data-plan="foulPolicy">${optHtml([['careful', 'Prudente (sentar pronto)'], ['normal', 'Normal'], ['risky', 'Arriesgar (jugar con faltas)']], t.plan.foulPolicy)}</select>
    <h4>Gestión de stamina</h4><select class="f" data-plan="staminaPolicy">${optHtml([['high', 'Rotar pronto'], ['normal', 'Normal'], ['low', 'Aguantar cansados']], t.plan.staminaPolicy)}</select>
    <h4>Prioridad de balón</h4>${t.active.map(p => `<div class="mini-row"><span>#${p.number} ${esc(p.name)}</span><select class="f" data-usage="${p.id}">${usageOpts(usageKey(p.usage))}</select></div>`).join('')}
    <h4>Asignaciones defensivas</h4>${t.active.map(p => `<div class="mini-row"><span>${esc(p.name)} marca a</span><select class="f" data-mark="${p.id}">${oppOpts(t.assignments[p.id])}</select></div>`).join('')}
    <div style="margin:16px 0 20px"><button class="btn sm pri" data-coach="save">Guardar como plan base</button></div>`;
  bindTactics(els.coach, (k, v) => { sim.setTactics(side, { [k]: v }); });
}
els.coach.addEventListener('change', event => {
  if (!career) return; const el = event.target, side = career.userSide, t = sim.teams[side];
  if (el.dataset.sub !== undefined && el.value) { const r = sim.substitute(side, el.dataset.sub, el.value); toast(r === 'queued' ? 'Cambio programado para el próximo balón parado' : r === 'done' ? 'Cambio realizado' : 'Cambio no válido'); renderCoach(); }
  else if (el.dataset.plan) { t.plan[el.dataset.plan] = el.value || null; }
  else if (el.dataset.usage) { sim.setUsage(side, el.dataset.usage, USAGE[el.value][1]); }
  else if (el.dataset.mark !== undefined) { sim.setAssignment(side, el.dataset.mark, el.value); toast(el.value === '' ? 'Marca automática' : 'Asignación defensiva aplicada'); }
});
els.coach.addEventListener('click', event => {
  if (event.target.dataset.coach !== 'save' || !career) return; const side = career.userSide, t = sim.teams[side], byPid = id => t.roster.find(p => p.id === id)?.pid ?? null;
  career.onSaveBase?.({ tactics: { ...t.tactics }, usage: Object.fromEntries(t.roster.filter(p => p.pid).map(p => [p.pid, usageKey(p.usage)])),
    assign: Object.fromEntries(Object.entries(t.assignments).map(([id, slot]) => [byPid(id), slot]).filter(([pid]) => pid)), plan: { closer: byPid(t.plan.closer), foulPolicy: t.plan.foulPolicy, staminaPolicy: t.plan.staminaPolicy } });
  toast('Plan base guardado para próximos partidos');
});

// ---------- HUD ----------
function playLabel() {
  const b = sim.ball, owner = b.owner;
  switch (sim.phase) {
    case 'ready': return 'Preparados para el salto inicial'; case 'interval': return 'Descanso entre cuartos'; case 'finished': return 'Partido finalizado';
    case 'freeThrows': return `Tiros libres · ${sim.freeThrows.shooter.name}`; case 'dead': return DEAD_LABELS[sim.dead?.reason] || 'Balón muerto';
    default:
      if (b.mode === 'shot') return `Lanzamiento de ${sim.findPlayer(b.flight?.shooter)?.name ?? '…'}`; if (b.mode === 'pass') return 'Pase en el aire'; if (b.mode === 'loose') return 'Balón suelto · rebote';
      return owner ? `${PLAY_NAMES[sim.possession.play] || 'Ataque'} · ${owner.name}` : 'Juego en curso';
  }
}
function centerMessage() {
  const score = `${sim.teams[0].name} ${sim.teams[0].score} — ${sim.teams[1].score} ${sim.teams[1].name}`;
  if (sim.phase === 'finished') { const [h, a] = sim.teams, winner = h.score > a.score ? h : a; return ['FINAL DEL PARTIDO', `${score} · Victoria de ${winner.name}`]; }
  if (sim.phase === 'interval') { if (sim.period >= sim.rules.periods) return ['PRÓRROGA', `Empate a ${sim.teams[0].score} · ${score}`]; return [sim.period === sim.rules.periods / 2 ? 'DESCANSO' : `FIN DEL ${periodLabel(sim)}`, score]; }
  if (sim.phase === 'dead' && sim.dead?.reason === 'timeout') return ['TIEMPO MUERTO', sim.teams[sim.dead.team].name];
  return null;
}
function updateHud() {
  const [home, away] = sim.teams, replaying = replay.active;
  setText(els.homeScore, home.score); setText(els.awayScore, away.score); setText(els.quarter, periodLabel(sim)); setText(els.clock, fmtClock(sim.clock));
  const noShotClock = ['interval', 'finished'].includes(sim.phase); setText(els.shotClock, noShotClock ? '--' : Math.ceil(sim.shotClock));
  els.shotClock.parentElement.style.color = !noShotClock && sim.shotClock <= 5 && sim.phase === 'live' ? '#ff6a5a' : '';
  els.homeFouls.querySelectorAll('i').forEach((el, i) => el.classList.toggle('on', home.fouls > i)); els.awayFouls.querySelectorAll('i').forEach((el, i) => el.classList.toggle('on', away.fouls > i));
  const team = sim.teams[sim.possession.team]; setText(els.possTeam, team.name); els.possDot.style.background = team.color;
  setText(els.playLabel, replaying ? 'Repetición de las últimas jugadas' : playLabel());
  setText(els.liveLabel, replaying ? 'REPETICIÓN' : sim.phase === 'ready' ? 'PREVIA' : sim.phase === 'finished' ? 'FINAL' : paused ? 'PAUSA' : sim.phase === 'interval' ? 'DESCANSO' : 'EN VIVO');
  const text = sim.phase === 'ready' ? 'Iniciar partido' : sim.phase === 'finished' ? (mode === 'career' ? 'Ver resultado' : 'Nuevo partido') : paused ? 'Reanudar' : 'Pausar';
  setText(els.playText, text); setHtml(els.playIcon, text === 'Pausar' ? ICONS.pause : ICONS.play);
  const message = replaying ? null : centerMessage(), key = message ? message.join('|') : '';
  if (els.center.__key !== key) { els.center.__key = key; els.center.hidden = !message; if (message) els.center.innerHTML = `${esc(message[0])}<small>${esc(message[1])}</small>`; }
  els.replay.disabled = sim.phase === 'ready' && !replay.active; setText(els.timeoutsLeft, `${home.timeouts}·${away.timeouts}`);
  els.timeout.disabled = replaying || !['live', 'dead'].includes(sim.phase); els.skip.disabled = sim.phase === 'finished';
}
function updatePanels(now) {
  drawMini(); if (now - lastPanelUpdate < 250) return; lastPanelUpdate = now; renderFeed(); const tab = activeTab();
  if (tab === 'lineup') renderLineup();
  if (tab === 'stats') { renderStats(); if (sim.shots.length !== lastShotCount) { lastShotCount = sim.shots.length; drawShotMap(); } }
  if (tab === 'coach' && now - lastCoach > 1200 && !els.coach.contains(document.activeElement)) { lastCoach = now; const box = $('coach-court'); if (box) setHtml(box, coachCourtRows()); }
  if (!els.debugPanel.hidden) renderDebug();
}

// ---------- ciclo de vida ----------
function crestSvg(team) { return `<svg viewBox="0 0 50 50"><path d="M25 3l19 7v14c0 12-8 20-19 23C14 44 6 36 6 24V10z" fill="${team.color}"/><text x="25" y="31" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-size="15" font-weight="800" fill="#10171b">${esc(team.short)}</text></svg>`; }
function applyTeamsHud(names) {
  const [h, a] = sim.teams; els.screen.style.setProperty('--home', h.color); els.screen.style.setProperty('--away', a.color);
  document.querySelectorAll('.score-team .team-name').forEach((el, i) => {
    const [first, second] = names ? names[i] : i ? ['COASTAL', 'WAVES'] : ['METRO', 'FOXES']; el.querySelector('span').textContent = first; el.querySelector('b').textContent = second;
  });
  crests.forEach((c, i) => { if (mode === 'career') { c.className = 'team-crest'; c.innerHTML = crestSvg(sim.teams[i]); } else { c.className = ORIGINAL_CREST[i].cls; c.innerHTML = ORIGINAL_CREST[i].html; } });
  document.querySelectorAll('.map-legend span:not(.map-label)')[0].lastChild.textContent = h.short; document.querySelectorAll('.map-legend span:not(.map-label)')[1].lastChild.textContent = a.short;
  document.querySelectorAll('.style-row > span').forEach((el, i) => { el.textContent = sim.teams[i].short; });
  document.querySelectorAll('.settings-teams .home-text').forEach(el => { el.textContent = h.name; }); document.querySelectorAll('.settings-teams .away-text').forEach(el => { el.textContent = a.name; });
}
function describe(t) { const d = { man: 'HOMBRE', zone23: 'ZONA 2-3', zone32: 'ZONA 3-2', zone131: 'ZONA 1-3-1' }[t.tactics.defense]; return mode === 'career' ? `${d} · RITMO ${t.tactics.tempo}` : t.style; }
// ---------- transmisión (assets/broadcast): presentación, placas y estudio (previa, descanso y final) ----------
let bc = null, lastEvId = 0, scorers = ['', ''], pts = {}, introShown = false, halfShown = false, postShown = false;
function ensureBc() {
  if (bc || !window.Broadcast) return;
  try { window.Broadcast.setBase(new URL('../assets/', location.href).href); bc = window.Broadcast.attach({ id: 'lbo', sport: 'basquet', mount: els.courtView, accent: '#ff9a3c', logo: 'logos/lbo-sm.png', league: 'Liga de Básquet Online' }); } catch (e) { console.warn('Transmisión no disponible', e); }
}
const teamOvr = t => { const ps = sim.players.filter(p => p.team === t).sort((a, b) => b.ovr - a.ovr).slice(0, 8); return ps.reduce((x, p) => x + p.ovr, 0) / Math.max(1, ps.length); };
const bestOf = t => sim.players.filter(p => p.team === t).sort((a, b) => b.ovr - a.ovr)[0];
const topScorer = () => Object.entries(pts).sort((a, b) => b[1] - a[1])[0];
function bcTick() {
  if (!bc || !sim || replay.active) return;
  for (const ev of sim.events) { if (ev.id <= lastEvId) break; if (ev.type === 'score' && ev.team != null) { const [n, v] = String(ev.text).split(' · '); scorers[ev.team] = n; pts[n] = (pts[n] || 0) + (parseInt(v, 10) || 0); } }
  lastEvId = sim.events[0]?.id ?? lastEvId;
  const [h, a] = sim.teams;
  bc.tick({ scores: [h.score, a.score], names: [h.name, a.name], colors: [h.color, a.color], scorer: scorers, period: sim.period, periods: sim.rules.periods, phase: sim.phase === 'finished' ? 'final' : sim.phase === 'ready' ? 'pre' : 'live' });
  // estudio en el descanso y al final del partido
  if (sim.phase === 'interval' && sim.period === sim.rules.periods / 2 && !halfShown) {
    halfShown = true; const was = paused; paused = true;
    const lead = h.score === a.score ? null : h.score > a.score ? h : a, ts = topScorer();
    bc.studio({ kind: 'half', onDone: () => { paused = was; }, lines: [
      ['A', `Llegamos al descanso: ${h.name} ${h.score}, ${a.name} ${a.score}.`],
      ['B', lead ? `${lead.name} se va al vestuario arriba por ${Math.abs(h.score - a.score)}. Va a tener que sostener el ritmo del segundo tiempo.` : 'Todo igualado al descanso: se define en el segundo tiempo.'],
      ts ? ['A', `El máximo anotador hasta ahora es ${ts[0]} con ${ts[1]} puntos.`] : null,
      ['B', `Las faltas: ${h.name} ${h.fouls}, ${a.name} ${a.fouls}. Quien cuide mejor a sus referentes tiene ventaja.`]].filter(Boolean) });
  }
  if (sim.phase === 'finished' && !postShown) {
    postShown = true; const w = h.score >= a.score ? h : a, l = w === h ? a : h, ts = topScorer();
    setTimeout(() => bc.studio({ kind: 'post', lines: [
      ['A', `Terminó el partido: ${w.name} le ganó a ${l.name} por ${Math.abs(h.score - a.score)} (${h.score}-${a.score}).`],
      ts ? ['B', `${ts[0]} fue el que más anotó del partido, con ${ts[1]} puntos.`] : null,
      ['B', Math.abs(h.score - a.score) <= 5 ? 'Un final muy parejo, que se definió en las últimas posesiones.' : 'La diferencia se construyó con las rachas y con el control del rebote.'],
      ['A', 'Eso es todo por hoy. Gracias por acompañarnos.']].filter(Boolean) }), 3500);
  }
}
function showIntro(then) {
  const [h, a] = sim.teams, active = t => sim.players.filter(p => p.team === t && p.active).map(p => ({ n: p.number, name: p.name, pos: p.role }));
  const comp = els.eyebrow.textContent === 'PARTIDO' ? 'Exhibición · Liga de Básquet Online' : els.eyebrow.textContent;
  bc.intro({ competition: comp, date: els.sub.textContent, venue: '',
    home: { name: h.name, short: h.short, primary: h.color, sub: 'Local' }, away: { name: a.name, short: a.short, primary: a.color, sub: 'Visitante' }, lineups: [active(0), active(1)],
    onDone: () => {
      const bh = bestOf(0), ba = bestOf(1);
      bc.studio({ kind: 'pre', onDone: then, lines: [
        ['A', `Bienvenidos. ${h.name} recibe a ${a.name}: ${comp}.`],
        ['B', `${h.name} llega con un nivel de plantilla de ${teamOvr(0).toFixed(0)} y ${a.name} con ${teamOvr(1).toFixed(0)}.`],
        bh && ba ? ['A', `Las figuras: ${bh.name} (${bh.ovr}) por ${h.short} y ${ba.name} (${ba.ovr}) por ${a.short}.`] : null,
        ['B', `El ritmo va a ser clave: ${h.name} juega a ritmo ${h.tactics.tempo} y ${a.name} a ${a.tactics.tempo}.`]].filter(Boolean) });
    } });
}
function attach(newSim, names) {
  ensureBc(); bc?.reset(); lastEvId = 0; scorers = ['', '']; pts = {}; introShown = false; halfShown = false; postShown = false;
  sim = newSim; replay = new ReplayBuffer(); paused = false; accumulator = 0; lastFeedId = -1; lastShotCount = -1; lastPanelUpdate = 0; lastCoach = 0; started = false;
  els.center.__key = ''; els.center.hidden = true; for (const k of ['__text', '__html']) for (const el of Object.values(els)) if (el && el[k] !== undefined) delete el[k];
  view.buildRigs(sim); view.debug = false; els.debugPanel.hidden = true; els.debugButton.classList.remove('active'); applyTeamsHud(names);
  setText(els.homeStyle, describe(sim.teams[0])); setText(els.awayStyle, describe(sim.teams[1]));
  if (activeTab() === 'stats') drawShotMap(); updateHud(); updatePanels(performance.now() + 1000);
}
function ensureView() {
  if (view) return true;
  try { view = new MatchView(els.courtView, new MatchSimulator({ seed: 1 })); requestAnimationFrame(now => { lastFrame = now; requestAnimationFrame(frame); }); return true; }
  catch (error) { console.error(error); els.loading.hidden = false; els.loading.innerHTML = '<p>No se pudo iniciar el modo 3D (WebGL). Prueba con otro navegador o activa la aceleración por hardware.</p>'; return false; }
}
function selectTab(name) { document.querySelector(`.sidebar-tabs button[data-tab="${name}"]`)?.click(); }
function show(on) { els.screen.hidden = !on; isOpen = on; if (on) lastFrame = performance.now(); }
function createExhibition() { return new MatchSimulator({ seed: settings.seed, rules: { periodSeconds: settings.duration, shotClock: settings.shotClock }, styles: [settings.homeStyle, settings.awayStyle] }); }
function setExhibitionChrome() {
  const minutes = settings.duration / 60; els.formatLabel.innerHTML = `EXHIBICIÓN <i>·</i> ${sim.rules.periods} × ${Number.isInteger(minutes) ? minutes : minutes.toFixed(1)} MIN`;
}

export const Match = {
  get isOpen() { return isOpen; }, get inProgress() { return mode === 'career' && isOpen && sim && sim.phase !== 'finished'; }, get sim() { return sim; },
  openExhibition() {
    if (!ensureView()) return; mode = 'exhibition'; career = null; els.loading.hidden = true;
    els.settingsButton.hidden = false; els.skip.hidden = true; els.coachTab.hidden = true; els.eyebrow.textContent = 'PARTIDO'; els.title.innerHTML = 'Exhibición<span>.</span>'; els.sub.textContent = 'Metro Foxes contra Coastal Waves.';
    selectTab('match'); show(true); attach(createExhibition()); setExhibitionChrome();
  },
  openCareer({ sim: s, homeName, awayName, userSide, title, sub, eyebrow, onFinish, onSaveBase }) {
    if (!ensureView()) return false; mode = 'career'; career = { userSide, onFinish, onSaveBase }; els.loading.hidden = true;
    els.settingsButton.hidden = true; els.skip.hidden = false; els.coachTab.hidden = false; els.eyebrow.textContent = eyebrow; els.title.innerHTML = `${esc(title)}<span>.</span>`; els.sub.textContent = sub;
    selectTab('match'); show(true); attach(s, [homeName, awayName]); renderCoach(); return true;
  },
  close() { show(false); if (audio.enabled) audio.toggle().then(() => { els.audio.innerHTML = ICONS.soundOff; els.audio.classList.remove('active'); }); },
  finishInstantly() { if (sim && sim.phase !== 'finished') { sim.simulateToEnd(1 / 20); } return sim; },
};

// ---------- bucle principal ----------
function frame(now) {
  requestAnimationFrame(frame); if (!isOpen || !sim) { lastFrame = now; return; }
  const dt = Math.min(0.1, (now - lastFrame) / 1000); lastFrame = now;
  try {
    if (replay.active) { const f = replay.step(dt); if (f) view.update(sim, dt, f); else view.update(sim, dt); }
    else {
      if (!paused && sim.phase !== 'ready' && sim.phase !== 'finished') { accumulator += dt * speed; let n = 0; while (accumulator >= STEP && n < MAX_STEPS_PER_FRAME) { sim.step(STEP); replay.record(sim, STEP); accumulator -= STEP; n++; } if (accumulator >= STEP) accumulator = 0; }
      view.update(sim, dt);
    }
    audio.consume(sim); updateHud(); updatePanels(now); bcTick();
  } catch (error) { console.error(error); paused = true; toast('Error en la simulación (ver consola)'); }
}

// ---------- eventos ----------
function togglePlay() {
  if (replay.active) { replay.active = false; return; }
  if (sim.phase === 'ready') { const go = () => { sim.start(); started = true; paused = false; }; if (bc && !introShown) { introShown = true; showIntro(go); } else go(); }
  else if (sim.phase === 'finished') { if (mode === 'career') career.onFinish(sim); else { settings.seed = 1 + Math.floor(Math.random() * 999999); els.form.elements.seed.value = settings.seed; attach(createExhibition()); setExhibitionChrome(); sim.start(); } }
  else paused = !paused;
}
function startReplay() { if (replay.active) { replay.active = false; return; } if (!replay.start()) toast('Aún no hay suficiente juego para repetir'); }
function setCamera(m) { view.cameraController.mode = m; els.camera.value = m; setText(els.viewName, CAMERAS[m]); setText(document.querySelector('.view-tag small'), String(Object.keys(CAMERAS).indexOf(m) + 1).padStart(2, '0')); }
els.playButton.addEventListener('click', () => sim && togglePlay());
document.querySelectorAll('.speed-control button').forEach(button => button.addEventListener('click', () => { speed = Number(button.dataset.speed); document.querySelectorAll('.speed-control button').forEach(b => b.classList.toggle('selected', b === button)); }));
els.replay.addEventListener('click', () => sim && startReplay());
els.camera.addEventListener('change', () => view && setCamera(els.camera.value));
els.skip.addEventListener('click', () => { if (!sim || sim.phase === 'finished') return; if (sim.phase === 'ready') sim.start(); sim.simulateToEnd(1 / 20); replay.active = false; accumulator = 0; toast('Partido simulado hasta el final'); });
els.audio.addEventListener('click', async () => { try { const on = await audio.toggle(); els.audio.innerHTML = on ? ICONS.soundOn : ICONS.soundOff; els.audio.classList.toggle('active', on); els.audio.title = on ? 'Silenciar' : 'Activar sonido'; } catch (e) { toast('No se pudo activar el sonido'); } });
els.fullscreen.addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.querySelector('.match-card').requestFullscreen(); } catch (e) { toast('Pantalla completa no disponible en este contexto'); } });
document.addEventListener('fullscreenchange', () => els.fullscreen.classList.toggle('active', !!document.fullscreenElement));
els.timeout.addEventListener('click', () => { const ok = mode === 'career' ? sim.timeout(career.userSide) : sim.timeout(); if (!ok) toast(mode === 'career' ? 'Solo puedes pedir tiempo muerto con el balón o en balón muerto' : 'Solo el equipo con el balón puede pedir tiempo muerto'); });
els.debugButton.addEventListener('click', () => { els.debugPanel.hidden = !els.debugPanel.hidden; view.debug = !els.debugPanel.hidden; els.debugButton.classList.toggle('active', view.debug); if (view.debug) renderDebug(); });
document.querySelectorAll('.sidebar-tabs button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.sidebar-tabs button').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-selected', b === button); });
  for (const name of ['match', 'lineup', 'stats', 'coach']) $(`tab-${name}`).hidden = name !== button.dataset.tab;
  lastShotCount = -1; lastPanelUpdate = 0; if (!sim) return;
  if (button.dataset.tab === 'lineup') renderLineup(); if (button.dataset.tab === 'stats') { renderStats(); drawShotMap(); } if (button.dataset.tab === 'coach') renderCoach();
}));
els.settingsButton.addEventListener('click', () => {
  const f = els.form.elements; f.duration.value = settings.duration; f.shotClock.value = settings.shotClock; f.homeStyle.value = settings.homeStyle; f.awayStyle.value = settings.awayStyle; f.seed.value = settings.seed;
  dialogPaused = !paused && sim.phase !== 'ready' && sim.phase !== 'finished'; if (dialogPaused) paused = true; els.dialog.showModal();
});
els.dialog.addEventListener('close', () => { if (dialogPaused) { paused = false; dialogPaused = false; } });
$('close-settings').addEventListener('click', () => els.dialog.close());
els.form.addEventListener('submit', event => {
  event.preventDefault(); const f = els.form.elements;
  Object.assign(settings, { duration: Number(f.duration.value), shotClock: Number(f.shotClock.value), homeStyle: f.homeStyle.value, awayStyle: f.awayStyle.value, seed: Math.max(1, Math.min(999999, Math.floor(Number(f.seed.value)) || 41)) });
  dialogPaused = false; els.dialog.close(); attach(createExhibition()); setExhibitionChrome(); toast('Nueva simulación lista · pulsa Iniciar partido');
});
document.addEventListener('keydown', event => {
  if (!isOpen || !sim || event.repeat || event.ctrlKey || event.metaKey || event.altKey || els.dialog.open) return; if (['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
  if (event.code === 'Space') { event.preventDefault(); togglePlay(); } else if (event.code === 'KeyR') startReplay();
  else if (event.code === 'KeyC') { const modes = Object.keys(CAMERAS); setCamera(modes[(modes.indexOf(view.cameraController.mode) + 1) % modes.length]); }
});
document.addEventListener('keyup', event => { if (isOpen && event.code === 'Space' && !els.dialog.open && !['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) event.preventDefault(); });
window.__match = { get sim() { return sim; }, get view() { return view; } };
