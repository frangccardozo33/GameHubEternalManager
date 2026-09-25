import { card, table, tabs, chip, plink, ovrBadge, posTag, bar, esc, slider, select, stat, teamTag, tdot, record } from '../kit.js';
import { PLAYBOOK, DEFENSES, routePoints } from '../../sim/playbook.js';
import { makeGameplan, DEEP_PLAYS, SHORT_PLAYS } from '../../sim/gameplan.js';
import { scoutReport, matchupGameplan, suggestionNotes, unitRatings, UNITS } from '../../manager/scouting.js';
import { TRAINING_AREAS, fmtM } from '../../manager/constants.js';
import { ageRate } from '../../manager/training.js';
import { avg, pct, r1 } from '../../manager/util.js';

const setPath = (o, path, v) => { const k = path.split('.'); const last = k.pop(); let t = o; for (const x of k) t = t[x]; t[last] = v; };

// ------------------------------------------------------------------ Tactics (playbook + schemes)
function drawPlay(c, play) {
  const ctx = c.getContext('2d'), w = c.width, h = c.height, X = x => w / 2 + x / 30 * (w / 2 - 6), Z = z => h - 14 - (z + 10) / 46 * (h - 26);
  ctx.fillStyle = '#0d1720'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#26363f'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, Z(0)); ctx.lineTo(w, Z(0)); ctx.stroke();
  const y = play.personnel === '11' ? { x: -12, z: -1 } : play.personnel === '12' ? { x: -5, z: -.6 } : { x: 0, z: -4.5 }, rb = { x: play.formation === 'Shotgun' ? 2.2 : 0, z: -6.8 };
  const recv = { X: { x: -20, z: 0 }, Z: { x: 20, z: 0 }, Y: y, TE: { x: 5, z: -.5 }, RB: rb };
  ctx.fillStyle = '#7fb6d8'; for (const x of [-3.2, -1.6, 0, 1.6, 3.2]) { ctx.beginPath(); ctx.arc(X(x), Z(0), 3, 0, 7); ctx.fill(); }
  ctx.beginPath(); ctx.arc(X(0), Z(play.formation === 'Shotgun' ? -5 : -2.2), 3.4, 0, 7); ctx.fill();
  if (play.type === 'run') { const g = play.gap || 0; ctx.strokeStyle = '#a5e5ab'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(rb.x), Z(rb.z)); ctx.lineTo(X(g), Z(2)); ctx.lineTo(X(g), Z(9)); ctx.stroke(); }
  else ['X', 'Z', 'Y', 'TE', 'RB'].forEach((id, i) => { const r = play.routes?.[i] || (id === 'RB' ? 'check' : 'streak'), pts = routePoints(r, recv[id]); ctx.strokeStyle = i === 0 ? '#a5e5ab' : '#5f95b2'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X(recv[id].x), Z(recv[id].z)); for (const p of pts) ctx.lineTo(X(p.x), Z(Math.min(p.z, 34))); ctx.stroke(); ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(X(recv[id].x), Z(recv[id].z), 2.6, 0, 7); ctx.fill(); });
}
const catOf = p => p.type === 'run' ? 'Carrera' : p.rpo ? 'RPO' : p.screen ? 'Screen' : p.playAction ? 'Play action' : DEEP_PLAYS.includes(p.id) ? 'Pase profundo' : SHORT_PLAYS.includes(p.id) ? 'Pase corto/medio' : 'Pase';
const tactics = {
  id: 'tactics', title: 'Tactics', icon: '✎',
  render(app) {
    const gp = app.lg.user.gameplan, W = id => gp.playWeights[id] ?? 1;
    const cards = PLAYBOOK.map(p => `<div class="play"><canvas class="pdiag" data-play="${p.id}" width="170" height="110"></canvas><div class="pi"><b>${p.name}</b><small>${catOf(p)} · ${p.personnel} personnel · ${p.formation}</small><div class="seg" role="group">${[[0, 'Evitar'], [1, 'Normal'], [2, 'Preferir']].map(([v, l]) => `<button class="${W(p.id) === v ? 'on' : ''} ${v === 0 ? 'no' : ''}" data-act="tw" data-id="${p.id}" data-v="${v}">${l}</button>`).join('')}</div></div></div>`).join('');
    return `<div class="grid g2b">${card('Playbook ofensivo', `<p class="muted small">Ajusta cuánto se usa cada concepto. "Preferir" duplica su peso al elegir la jugada; "Evitar" la elimina. Se combina con los sliders del <a href="#/gameplan">Gameplan</a> y con la situación (down, distancia, zona del campo).</p><div class="playgrid">${cards}</div>`)}
      <div>${card('Esquema defensivo', `${select({ path: 'def.front', label: 'Base front', value: gp.def.front, options: [['auto', 'Automático (4-3 / 3-4)'], ['4-3', '4-3 (3 LB)'], ['3-4', '3-4 (4 LB)']], act: 'gp-select' })}${select({ path: 'def.package', label: 'Paquete de pase', value: gp.def.package, options: [['auto', 'Automático (nickel vs 3 WR, dime en 3º-y-largo)'], ['base', 'Siempre base'], ['nickel', 'Siempre nickel (5 DB)'], ['dime', 'Siempre dime (6 DB)']], act: 'gp-select' })}${select({ path: 'def.coverage', label: 'Cobertura preferida', value: gp.def.coverage, options: [['balanced', 'Equilibrada'], ['man', 'Man / Cover 1'], ['cover2', 'Cover 2'], ['cover3', 'Cover 3'], ['cover4', 'Cover 4 (quarters)']], act: 'gp-select' })}
      <div class="notes"><p><b>Coberturas del motor:</b> ${DEFENSES.join(' · ')}.</p><p class="muted small">Las coberturas Man/Cover 1 dejan a los receptores 1-contra-1; las zonales reparten la profundidad. El blitz envía rushers extra y deja al resto en man-to-man sin ayuda. Cada cambio se aplica en el siguiente snap del motor.</p></div>
      <button class="btn" data-act="tw-reset">Restablecer playbook y esquema</button>`)}
      ${card('Cómo se elige una jugada', `<ol class="steps small"><li>Situación: 4º down (patear, field goal o ir) según tu agresividad y el pateador.</li><li>Carrera vs pase: slider del gameplan + down y distancia + reloj.</li><li>Concepto: profundidad, screens y play action ponderados por tus sliders y por el peso de cada jugada.</li></ol>`)}</div></div>`;
  },
  after(app) { document.querySelectorAll('canvas.pdiag').forEach(c => drawPlay(c, PLAYBOOK.find(p => p.id === c.dataset.play))); },
  handlers: {
    tw(app, el) { app.lg.user.gameplan.playWeights[el.dataset.id] = +el.dataset.v; app.commit(); app.refresh(); },
    'tw-reset'(app) { const g = app.lg.user.gameplan; g.playWeights = {}; Object.assign(g.def, { front: 'auto', package: 'auto', coverage: 'balanced' }); app.commit(); app.refresh(); },
  },
  changes: { 'gp-select'(app, el) { setPath(app.lg.user.gameplan, el.dataset.path, el.value); app.commit(); app.refresh(); } },
};

// ------------------------------------------------------------------ Gameplan + opponent preparation
const HINTS = {
  runPass: 'Reparto base de jugadas. En este motor el pase produce más yardas por intento que la carrera.',
  tempo: 'Ritmo entre jugadas: alto = más posesiones y más fatiga/penalizaciones; bajo = consume reloj.',
  deepPass: 'Peso de rutas profundas (streak, post, corner, comeback). Más alto = más explosivas pero más riesgo.',
  shortPass: 'Peso de rutas cortas/medias. Protegen al QB y castigan el blitz.',
  playAction: 'Frecuencia del play action: engaña a la defensa contra carrera.',
  screen: 'Frecuencia de screens al RB.',
  fourthDown: 'Con 0 patearás casi siempre; con 100 irás por el first down en yardas cortas. Usa la puntería/potencia real de tu kicker.',
  aggression: 'Ataque: tira a ventanas más ajustadas (más completos y más intercepciones).',
  blitz: 'Riesgo alto: los blitzers dejan al resto en man-to-man sin ayuda. Úsalo con moderación.',
  pressure: 'Sube el pass rush de todos tus defensores (sin cambiar la cobertura).',
  runFocus: 'Más jugadores en la caja contra la carrera; puede activar el paquete base.',
  defAggression: 'Defensa: más persecución y reacción, menos disciplina en cobertura (y más penalizaciones).',
};
const OFF = [['runPass', 'Carrera ↔ Pase', 'Carrera', 'Pase'], ['tempo', 'Ritmo (tempo)', 'Lento', 'No-huddle'], ['deepPass', 'Pase profundo', 'Nunca', 'Mucho'], ['shortPass', 'Pase corto', 'Nunca', 'Mucho'], ['playAction', 'Play action', 'Nunca', 'Mucho'], ['screen', 'Screens', 'Nunca', 'Mucho'], ['fourthDown', 'Agresividad en 4º down', 'Conservador', 'Agresivo'], ['aggression', 'Agresividad ofensiva', 'Segura', 'Arriesgada']];
const DEF = [['blitz', 'Frecuencia de blitz', 'Nunca', 'Siempre'], ['pressure', 'Presión (pass rush)', 'Baja', 'Máxima'], ['runFocus', 'Enfoque anti-carrera', 'Ninguno', 'Máximo'], ['aggression', 'Agresividad defensiva', 'Conservadora', 'Agresiva']];
const gameplan = {
  id: 'gameplan', title: 'Gameplan', icon: '⚙',
  render(app) {
    const lg = app.lg, d = lg.data, t = lg.user, gp = t.gameplan, fx = lg.userFixture();
    const oppId = app.ui.scoutTeam || (fx ? (fx.home === t.id ? fx.away : fx.home) : lg.data.teamOrder.find(x => x !== t.id));
    const opp = lg.team(oppId), rep = scoutReport(lg, t.id, oppId), mine = unitRatings(lg, t.id), tend = rep.tendencies, e = rep.efficiency, notes = suggestionNotes(rep, gp);
    const val = (v, f = '') => v == null ? '<span class="muted">—</span>' : `${v}${f}`;
    const report = card(`Informe: ${esc(opp.name)} <small>${record(opp.record)}</small>`, `<div class="row-actions between"><label class="sel inline"><b>Rival</b><select data-change="scout-team">${d.teamOrder.filter(x => x !== t.id).map(x => `<option value="${x}" ${x === oppId ? 'selected' : ''}>${esc(lg.team(x).name)}${fx && (fx.home === x || fx.away === x) ? ' (próximo)' : ''}</option>`).join('')}</select></label><span class="chip">Fiabilidad ${rep.confidence}%</span></div><p class="muted small">${esc(rep.note)}</p>
      <h5>Tendencias</h5><div class="tend">${[['Pase', Math.round(tend.passRate * 100) + '%'], ['Carrera', Math.round((1 - tend.passRate) * 100) + '%'], ['Pase profundo', Math.round(tend.deepRate * 100) + '%'], ['Pase corto', Math.round(tend.shortRate * 100) + '%'], ['Screens', Math.round(tend.screenRate * 100) + '%'], ['Play action', Math.round(tend.paRate * 100) + '%'], ['Blitz', Math.round(tend.blitzRate * 100) + '%'], ['4º down (ir)', val(tend.fourthGoRate, '%')]].map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div>
      <h5>Eficiencia</h5><table class="mtable cmp"><thead><tr><th></th><th>Ataque</th><th>Defensa</th></tr></thead><tbody><tr><td>Yardas por jugada</td><td>${val(e.offense?.ypp)}</td><td>${val(e.defense?.ypp)}</td></tr><tr><td>Yardas de pase / partido</td><td>${val(e.offense?.pass)}</td><td>${val(e.defense?.pass)}</td></tr><tr><td>Yardas de carrera / partido</td><td>${val(e.offense?.rush)}</td><td>${val(e.defense?.rush)}</td></tr><tr><td>Tercer down</td><td>${val(e.offense?.third, '%')}</td><td>${val(e.defense?.third, '%')}</td></tr><tr><td>Red zone (TD%)</td><td>${val(e.offense?.rz, '%')}</td><td>—</td></tr><tr><td>Pérdidas / Recuperaciones</td><td>${val(e.offense?.turnovers)}</td><td>${val(e.defense?.takeaways)}</td></tr><tr><td>Sacks por partido</td><td>—</td><td>${val(e.defense?.sacks)}</td></tr></tbody></table>
      <h5>Unidades (rival vs liga vs tú)</h5>${table({ cols: [{ h: 'Unidad', f: u => u.label }, { h: 'Rival', f: u => `<b>${u.value}</b>` }, { h: 'vs liga', f: u => `<span class="${u.diff >= 3 ? 'loss' : u.diff <= -3 ? 'win' : ''}">${u.diff > 0 ? '+' : ''}${u.diff}</span>` }, { h: 'Tú', f: u => Math.round(mine[u.key]) }], rows: rep.units })}
      <div class="two"><div><h5>Fortalezas</h5>${rep.strengths.map(s => chip(s.label, 'bad')).join(' ')}</div><div><h5>Debilidades</h5>${rep.weaknesses.map(s => chip(s.label, 'good')).join(' ')}</div></div>
      <h5>Jugadores clave</h5>${table({ cols: [{ h: 'Jugador', f: p => `${esc(p.name)}${p.injured ? ' 🩹' : ''}` }, { h: 'Pos', f: p => posTag(p.pos) }, { h: 'Ovr est.', f: p => ovrBadge(p.ovr) }, { h: 'Edad', k: 'age' }], rows: rep.keyPlayers })}
      ${notes.length ? `<h5>Recomendaciones</h5><ul class="alerts">${notes.map(n => `<li class="info">${esc(n)}</li>`).join('')}</ul>` : ''}`);
    const feat = lg.roster(t);
    const controls = card('Tu gameplan', `<div class="row-actions"><button class="btn primary" data-act="gp-suggest">Aplicar recomendaciones vs ${esc(opp.short)}</button><button class="btn" data-act="gp-reset">Restablecer</button></div>
      <h4>Ataque</h4><div class="sliders">${OFF.map(([k, l, lo, hi]) => slider({ path: 'off.' + k, label: l, value: gp.off[k], lo, hi, hint: HINTS[k] })).join('')}${select({ path: 'off.redZone', label: 'Enfoque en red zone', value: gp.off.redZone, options: [['balanced', 'Equilibrado'], ['run', 'Más carrera'], ['pass', 'Más pase'], ['quick', 'Pases rápidos']] })}</div>
      <h4>Defensa</h4><div class="sliders">${DEF.map(([k, l, lo, hi]) => slider({ path: 'def.' + k, label: l, value: gp.def[k], lo, hi, hint: HINTS[k === 'aggression' ? 'defAggression' : k] })).join('')}${select({ path: 'def.coverage', label: 'Cobertura', value: gp.def.coverage, options: [['balanced', 'Equilibrada'], ['man', 'Man / Cover 1'], ['cover2', 'Cover 2'], ['cover3', 'Cover 3'], ['cover4', 'Cover 4']] })}${select({ path: 'def.package', label: 'Paquete', value: gp.def.package, options: [['auto', 'Automático'], ['base', 'Base'], ['nickel', 'Nickel'], ['dime', 'Dime']] })}</div>
      <h4>Uso de jugadores</h4><div class="sliders">${select({ path: 'featured.RB', label: 'RB destacado (más carreras)', value: gp.featured.RB || '', options: [['', 'Automático (depth chart)'], ...feat.filter(p => p.pos === 'RB').map(p => [p.id, `${p.name} (${p.ovr})`])] })}${select({ path: 'featured.target', label: 'Objetivo preferido del QB', value: gp.featured.target || '', options: [['', 'Ninguno'], ...feat.filter(p => ['WR', 'TE', 'RB'].includes(p.pos)).sort((a, b) => b.ovr - a.ovr).map(p => [p.id, `${p.name} · ${p.pos} (${p.ovr})`])] })}</div>
      <p class="muted small">Este plan se usa en el partido de la semana (3D o simulado). Durante el partido puedes retocarlo desde el panel de decisiones.</p>`);
    return `<div class="grid g2">${report}${controls}</div>`;
  },
  handlers: {
    'gp-suggest'(app) { const lg = app.lg, t = lg.user, fx = lg.userFixture(), oppId = app.ui.scoutTeam || (fx ? (fx.home === t.id ? fx.away : fx.home) : null); if (!oppId) return app.toast('No hay rival.'); t.gameplan = matchupGameplan(lg, t, lg.team(oppId)); app.commit(); app.refresh(); app.toast('Recomendaciones aplicadas. Ajusta lo que quieras.'); },
    'gp-reset'(app) { app.lg.user.gameplan = makeGameplan(); app.commit(); app.refresh(); },
  },
  inputs: { 'gp-slider'(app, el) { const v = +el.value; setPath(app.lg.user.gameplan, el.dataset.path, v); const out = document.querySelector(`[data-val="${el.dataset.path}"]`); if (out) out.textContent = v; app.commit(); } },
  changes: {
    'gp-select'(app, el) { setPath(app.lg.user.gameplan, el.dataset.path, el.value || null); app.commit(); },
    'scout-team'(app, el) { app.ui.scoutTeam = el.value; app.refresh(); },
  },
};

// ------------------------------------------------------------------ Training
const training = {
  id: 'training', title: 'Training', icon: '↗',
  render(app) {
    const lg = app.lg, t = lg.user, plan = t.training, S = lg.data.staff, F = plan.focus, tot = Object.values(F).reduce((a, b) => a + b, 0) || 1;
        const rows = lg.roster(t).map(p => ({ p, d: p.ovr - (p.ovr0 || p.ovr) })).sort((a, b) => b.d - a.d);
    const areas = Object.entries(TRAINING_AREAS).map(([k, a]) => `<div class="tarea"><label class="slider"><span class="s-top"><b>${a.label}</b><em id="tp-${k}">${Math.round(F[k] / tot * 100)}%</em></span><input type="range" min="0" max="100" value="${F[k]}" data-input="tr-slider" data-k="${k}"><span class="s-hint">${a.positions.length === 11 ? 'Todos los jugadores' : a.positions.join(' · ')}</span></label></div>`).join('');
    const tbl = table({ cols: [{ h: 'Jugador', f: x => plink(x.p) }, { h: 'Pos', f: x => posTag(x.p.pos) }, { h: 'Edad', f: x => x.p.age }, { h: 'Ovr', f: x => ovrBadge(x.p.ovr) }, { h: 'Pot', f: x => x.p.potential }, { h: 'Cambio (temporada)', f: x => `<b class="${x.d > 0 ? 'win' : x.d < 0 ? 'loss' : ''}">${x.d > 0 ? '+' : ''}${x.d}</b>` }, { h: 'Ritmo de desarrollo', f: x => bar(Math.round(ageRate(x.p.age) * Math.max(0, x.p.potential - x.p.ovr) * 8), 100) }], rows: [...rows.slice(0, 8), ...rows.slice(-4)] });
    return `<div class="grid g2b">${card('Plan de entrenamiento semanal', `<p class="muted small">Reparte el esfuerzo entre áreas: cada semana los jugadores mejoran <b>atributos reales</b> (los mismos que lee el motor). Los jóvenes con potencial crecen más; los veteranos casi nada. Los porcentajes se normalizan a 100%.</p><div class="tareas">${areas}</div>${(() => '')()}
      <label class="sel"><b>Intensidad</b><select data-change="tr-int"><option value="light" ${plan.intensity === 'light' ? 'selected' : ''}>Ligera (×0.7 · menos fatiga)</option><option value="normal" ${plan.intensity === 'normal' ? 'selected' : ''}>Normal</option><option value="heavy" ${plan.intensity === 'heavy' ? 'selected' : ''}>Intensa (×1.3 · +fatiga y más lesiones)</option></select></label><div class="row-actions"><button class="btn" data-act="tr-balance">Repartir por igual</button></div>`)}
      <div>
      ${card('Progreso de la plantilla (mejores y peores)', tbl)}</div></div>`;
  },
  inputs: { 'tr-slider'(app, el) { const F = app.lg.user.training.focus; F[el.dataset.k] = +el.value; const tot = Object.values(F).reduce((a, b) => a + b, 0) || 1; for (const k of Object.keys(F)) { const o = document.getElementById(`tp-${k}`); if (o) o.textContent = `${Math.round(F[k] / tot * 100)}%`; } app.commit(); } },
  changes: { 'tr-int'(app, el) { app.lg.user.training.intensity = el.value; app.commit(); } },
  handlers: { 'tr-balance'(app) { for (const k of Object.keys(app.lg.user.training.focus)) app.lg.user.training.focus[k] = 15; app.commit(); app.refresh(); } },
};
export const strategyPages = [tactics, gameplan, training];
