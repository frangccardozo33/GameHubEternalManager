import { card, table, bar, esc, tdot, record, slider, select, chip, plink } from '../kit.js';
import { unitRatings, UNITS } from '../../manager/scouting.js';
import { depthIssues, isInjured } from '../../manager/lineup.js';

const $ = id => document.getElementById(id);
const setPath = (o, path, v) => { const k = path.split('.'), last = k.pop(); let t = o; for (const x of k) t = t[x]; t[last] = v; };
const ml = () => window.matchLab;
const PRESETS = { run: { off: { runPass: 22, deepPass: 30, shortPass: 55, tempo: 35 } }, balanced: { off: { runPass: 50, deepPass: 50, shortPass: 50, tempo: 50 } }, air: { off: { runPass: 78, deepPass: 60, shortPass: 55, tempo: 60 } }, hurry: { off: { runPass: 65, deepPass: 30, shortPass: 80, tempo: 95 } } };

function showLive(on) { $('prematch').classList.toggle('hidden', on); $('match-live').classList.toggle('hidden', !on); }

function prematch(app) {
  const lg = app.lg, d = lg.data, t = lg.user, fx = lg.userFixture(), root = $('prematch');
  if (!fx) { root.innerHTML = card('Sin partido', `<p class="muted">Tu equipo no juega esta semana.</p><div class="row-actions"><button class="btn primary" data-act="advance-week">Avanzar semana ▸</button><button class="btn" data-act="m-exhib">Partido de exhibición</button></div>`); return; }
  const home = fx.home === t.id, opp = lg.team(home ? fx.away : fx.home), a = unitRatings(lg, t.id), b = unitRatings(lg, opp.id), gp = t.gameplan, issues = depthIssues(lg, t);
  const cmp = table({ cols: [{ h: 'Unidad', f: u => u[0] }, { h: t.short, f: u => `<b>${u[1]}</b>` }, { h: '', f: u => bar(u[1], 100, u[1] >= u[2] ? '' : 'warn') }, { h: opp.short, f: u => `<b>${u[2]}</b>` }], rows: Object.entries(UNITS).map(([k, l]) => [l, Math.round(a[k]), Math.round(b[k])]) });
  const hurt = lg.roster(t).filter(isInjured);
  root.innerHTML = `<div class="grid g2b">${card(`${lg.currentWeek().label} · ${d.year}`, `<div class="vs big"><div class="vs-team">${tdot(home ? t : opp)}<b>${esc((home ? t : opp).name)}</b><small>Local</small></div><span class="vs-x">VS</span><div class="vs-team">${tdot(home ? opp : t)}<b>${esc((home ? opp : t).name)}</b><small>Visitante</small></div></div>
    ${issues.length ? `<div class="banner warn">${issues.map(esc).join('<br>')}</div>` : ''}
    <div class="row-actions"><button class="btn primary big" data-act="m-live">▶ Jugar en 3D</button><button class="btn big" data-act="m-sim">⏭ Simular partido</button></div>
    <div class="row-actions"><a class="btn" href="#/gameplan">Gameplan y scouting</a><a class="btn" href="#/depth">Depth chart</a><a class="btn" href="#/tactics">Tactics</a><button class="btn" data-act="m-exhib">Exhibición</button></div>
    <p class="muted small">Jugar en 3D usa exactamente el mismo motor que la simulación rápida. No controlas a los jugadores: decides el gameplan y los ajustes en juego.</p>`)}
    ${card('Cara a cara', cmp)}</div>
    <div class="grid g2">${card('Tu gameplan', `<div class="tend"><div><small>Pase/Carrera</small><b>${gp.off.runPass}</b></div><div><small>Ritmo</small><b>${gp.off.tempo}</b></div><div><small>Profundo</small><b>${gp.off.deepPass}</b></div><div><small>Blitz</small><b>${gp.def.blitz}</b></div><div><small>Presión</small><b>${gp.def.pressure}</b></div><div><small>Cobertura</small><b>${gp.def.coverage}</b></div></div>`)}
    ${card('Lesionados', hurt.length ? hurt.map(p => `<div>${plink(p)} <small>${p.pos} · ${esc(p.injury.type)} · ${p.injury.weeks} sem</small></div>`).join('') : '<div class="empty ok">Sin lesionados.</div>')}</div>`;
}

function coach(app) {
  const c = ml().context, el = $('coach-board'); if (!c) { el.classList.add('hidden'); return; }
  const idx = ml().userIndex, sim = c.sim, gp = sim.teams[idx].gameplan, lg = app.lg, prov = c.providers[idx];
  el.classList.remove('hidden');
  if (!gp) { el.innerHTML = ''; return; }
  const tired = Object.entries(prov.fat || {}).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([pid, f]) => ({ p: lg.player(pid), f })).filter(x => x.p);
  el.innerHTML = `${c.fixture.played ? `<div class="banner ok"><b>Partido finalizado y registrado.</b> <button class="btn primary" data-act="m-results">Ver resultados →</button></div>` : ''}
   <div class="section-title"><h2>Panel del entrenador</h2><div class="row-actions"><button class="btn small" data-act="cb-preset" data-v="run">Terrestre</button><button class="btn small" data-act="cb-preset" data-v="balanced">Equilibrado</button><button class="btn small" data-act="cb-preset" data-v="air">Aéreo</button><button class="btn small" data-act="cb-preset" data-v="hurry">Sin huddle</button></div></div>
   <p class="muted small">Ajustes en juego: se aplican desde la siguiente jugada. Solo afectan a tu equipo.</p>
   <div class="grid g3"><div><h5>Ataque</h5>${slider({ path: 'off.runPass', label: 'Carrera ↔ Pase', value: gp.off.runPass, lo: 'Carrera', hi: 'Pase', act: 'cb-slider' })}${slider({ path: 'off.tempo', label: 'Ritmo', value: gp.off.tempo, lo: 'Lento', hi: 'No-huddle', act: 'cb-slider' })}${slider({ path: 'off.deepPass', label: 'Pase profundo', value: gp.off.deepPass, act: 'cb-slider' })}${slider({ path: 'off.fourthDown', label: 'Agresividad 4º down', value: gp.off.fourthDown, act: 'cb-slider' })}</div>
   <div><h5>Defensa</h5>${slider({ path: 'def.blitz', label: 'Blitz', value: gp.def.blitz, act: 'cb-slider' })}${slider({ path: 'def.pressure', label: 'Presión', value: gp.def.pressure, act: 'cb-slider' })}${slider({ path: 'def.runFocus', label: 'Enfoque anti-carrera', value: gp.def.runFocus, act: 'cb-slider' })}${select({ path: 'def.coverage', label: 'Cobertura', value: gp.def.coverage, options: [['balanced', 'Equilibrada'], ['man', 'Man'], ['cover2', 'Cover 2'], ['cover3', 'Cover 3'], ['cover4', 'Cover 4']], act: 'cb-select' })}${select({ path: 'def.package', label: 'Paquete', value: gp.def.package, options: [['auto', 'Auto'], ['base', 'Base'], ['nickel', 'Nickel'], ['dime', 'Dime']], act: 'cb-select' })}</div>
   <div><h5>Jugadores más fatigados</h5>${tired.map(x => `<div class="tl">${plink(x.p)} <small>${x.p.pos}</small>${bar(x.f, 100, x.f > 60 ? 'warn' : '')}</div>`).join('') || '<p class="muted small">Aún sin datos.</p>'}<button class="btn small" data-act="cb-refresh">Actualizar</button><p class="muted small">La rotación es automática según fatiga y depth chart.</p></div></div>`;
}

export const matchPage = {
  id: 'match', title: 'Match', icon: '▶',
  render(app) {
    const m = ml(), c = m?.context;
    if (c && c.fixture.played && !app.keepMatch) m.unload();
    const live = m && m.loaded;
    showLive(!!live);
    if (live) coach(app); else { $('coach-board').classList.add('hidden'); prematch(app); }
  },
  handlers: {
    'm-live'(app) {
      const lg = app.lg, fx = lg.userFixture(); if (!fx) return;
      const ctx = lg.buildMatch(fx, { userGameplan: lg.user.gameplan });
      ml().load(ctx, {
        userIndex: fx.home === lg.data.userTeam ? 0 : 1,
        onFinal(c) { lg.finishUserMatch(c); app.commit(); app.keepMatch = true; app.render(); app.toast('Partido finalizado y registrado.'); },
        onDone() { app.go('results'); },
      });
      app.keepMatch = true; app.render();
    },
    'm-sim'(app) { app.toast('Simulando…'); setTimeout(() => { app.lg.advance(); app.commit(); app.go('results'); }, 30); },
    'm-exhib'() { $('exhibition-button').click(); showLive(true); },
    'm-results'(app) { app.keepMatch = false; app.go('results'); },
    'cb-preset'(app, el) { const gp = ml().context.sim.teams[ml().userIndex].gameplan, p = PRESETS[el.dataset.v].off; Object.assign(gp.off, p); coach(app); },
    'cb-refresh'(app) { coach(app); },
  },
  inputs: { 'cb-slider'(app, el) { const gp = ml().context.sim.teams[ml().userIndex].gameplan, v = +el.value; setPath(gp, el.dataset.path, v); const o = document.querySelector(`#coach-board [data-val="${el.dataset.path}"]`); if (o) o.textContent = v; } },
  changes: { 'cb-select'(app, el) { setPath(ml().context.sim.teams[ml().userIndex].gameplan, el.dataset.path, el.value); } },
};
