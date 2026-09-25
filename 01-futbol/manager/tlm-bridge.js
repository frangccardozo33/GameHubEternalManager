/* LFO MANAGER — PUENTE CON EL MOTOR 3D Y LA CAPA BROADCAST (sólo navegador).
   Aplica la configuración del manager al partido, refresca marcadores/escudos/camisetas, detecta el final y devuelve el
   resultado al Career. No reemplaza nada del motor: usa ht.tlmLoad / tlmRequestSub / tlmResult (manager/engine.js). */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  if (typeof document === 'undefined') return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const B = (TLM.Bridge = { A: null, active: false, ended: false, career: null, listeners: [] });
  const emit = (t, p) => B.listeners.forEach((f) => { try { f(t, p); } catch (e) { console.error(e); } });
  B.on = (f) => B.listeners.push(f);

  B.ready = () => new Promise((res) => { const t = () => { if (g.lfoArchive && g.lfoArchive.view && g.lfoCards) { B.A = g.lfoArchive; res(B.A); } else setTimeout(t, 60); }; t(); });

  // ---- branding del marcador: nombres, formaciones, escudos y competición (guarda los originales para restaurarlos) ----
  const orig = {};
  function keep(key, el) { if (el && !(key in orig)) orig[key] = el.innerHTML; }
  function crestInner(c, cls) { return c.crest ? `<img src="${esc(c.crest)}" alt="" class="tlm-sb-crest">` : `<span class="tlm-sb-mono" style="background:${c.color};color:${c.colorAlt}">${esc((c.short || c.name).slice(0, 1))}</span>`; }
  B.brand = (cfg) => {
    const m = B.A.match, [h, a] = m.teams;
    const q = (s) => document.querySelector(s);
    const set = (key, el, html) => { if (!el) return; keep(key, el); el.innerHTML = html; };
    set('hn', q('.team.home h2'), esc(h.name)); set('an', q('.team.away h2'), esc(a.name));
    set('hf', $('home-formation'), esc(h.formation)); set('af', q('.team.away .formation-label'), esc(a.formation));
    set('hc', q('.crest.arg'), crestInner(h)); set('ac', q('.crest.ibu'), crestInner(a));
    const tv = document.querySelectorAll('.tv-score > b'); if (tv[0]) { keep('tv0', tv[0]); tv[0].textContent = (h.short || '').slice(0, 3); } if (tv[1]) { keep('tv1', tv[1]); tv[1].textContent = (a.short || '').slice(0, 3); }
    const st = document.querySelectorAll('.stats-teams span'); if (st[0]) { keep('st0', st[0]); st[0].innerHTML = `<b class="team-dot home-dot"></b> ${esc(h.short)}`; } if (st[1]) { keep('st1', st[1]); st[1].innerHTML = `${esc(a.short)} <b class="team-dot away-dot"></b>`; }
    document.querySelectorAll('[data-lineup]').forEach((b, i) => { keep('lu' + i, b); b.textContent = i ? a.short : h.short; });
    document.querySelectorAll('[data-tacteam]').forEach((b, i) => { keep('tt' + i, b); b.textContent = i ? a.short : h.short; });
    const kick = q('#pitch-intro .intro-kicker'); if (kick) { keep('kick', kick); kick.textContent = `${h.name} vs. ${a.name}`.toUpperCase(); }
    const strip = q('.match-strip > span:first-child'); if (strip) { keep('strip', strip); strip.innerHTML = `<span class="tiny-square"></span> ${esc(cfg.competition.toUpperCase())} <span class="strip-divider">/</span> <span class="muted">${esc((cfg.roundLabel || 'Jornada ' + cfg.round).toUpperCase())}</span>`; }
    const stad = q('.stadium-text'); if (stad) { keep('stad', stad); stad.innerHTML = `<i data-lucide="map-pin"></i> ${esc(cfg.stadium)} <span class="strip-divider">·</span> ${esc(cfg.home.name)}`; }
    const rt = q('.broadcast-watermark span'); if (rt) { keep('wm', rt); rt.textContent = `VIVO · ${cfg.competition.toUpperCase()}`; }
    document.body.classList.add('tlm-match');
  };
  B.unbrand = () => {
    const q = (s) => document.querySelector(s), map = { hn: '.team.home h2', an: '.team.away h2', hf: '#home-formation', af: '.team.away .formation-label', hc: '.crest.arg', ac: '.crest.ibu', kick: '#pitch-intro .intro-kicker', strip: '.match-strip > span:first-child', stad: '.stadium-text', wm: '.broadcast-watermark span' };
    for (const k in map) { const el = q(map[k]); if (el && k in orig) el.innerHTML = orig[k]; }
    const tv = document.querySelectorAll('.tv-score > b'); [0, 1].forEach((i) => { if (tv[i] && 'tv' + i in orig) tv[i].textContent = orig['tv' + i]; });
    const st = document.querySelectorAll('.stats-teams span'); [0, 1].forEach((i) => { if (st[i] && 'st' + i in orig) st[i].innerHTML = orig['st' + i]; });
    document.querySelectorAll('[data-lineup]').forEach((b, i) => { if ('lu' + i in orig) b.innerHTML = orig['lu' + i]; });
    document.querySelectorAll('[data-tacteam]').forEach((b, i) => { if ('tt' + i in orig) b.innerHTML = orig['tt' + i]; });
    document.body.classList.remove('tlm-match');
  };

  // ---- modelos 3D: se reconstruyen con las camisetas/dorsales/apariencia del club (sin tocar el árbitro del TLB) ----
  B.rebuildModels = () => {
    const v = B.A.view, m = B.A.match; if (!v || !v.models) return;
    const ref = v.models.slice(m.players.length);
    v.models.slice(0, m.players.length).forEach((mod) => { try { mod.root.removeFromParent(); } catch (e) {} });
    v.models = m.players.map((p) => v.createPlayer(p)).concat(ref);
  };
  B.rebuildModel = (idx) => {
    const v = B.A.view, m = B.A.match, old = v.models[idx]; if (old) { try { old.root.removeFromParent(); } catch (e) {} }
    v.models[idx] = v.createPlayer(m.players[idx]);
  };

  // El álbum de cromos (collection.js) puede estar abierto: el render 3D se pausa mientras lo está.
  B.showMatchView = () => { if (document.body.classList.contains('album-open')) { const n = $('match-nav'); if (n) n.click(); } };

  // ---- ciclo del partido del usuario ----
  B.start = (career) => {
    const cfg = career.matchConfig(); if (!cfg) return { ok: false, reason: 'No hay partido esta jornada.' };
    const probs = TLM.lineupProblems(career.state, career.user); if (probs.length) return { ok: false, reason: probs[0] };
    const m = B.A.match; B.career = career; B.cfg = cfg; B.ended = false; B.fixtureId = cfg.fixtureId; B.userTeam = cfg.home.clubId === career.user.id ? 0 : 1;
    m.tlmLoad(cfg);
    // copa (La Cupidité): si empatan a los 90′ hay prórroga de 2 × 15′ y, si sigue igual, tanda de penales en 3D
    m.tieBreak = cfg.cup ? { et: true, pens: true } : null;
    m.onTlmSwap = (idx) => { B.rebuildModel(idx); emit('swap', idx); };
    if (!B._wired) { B._wired = true; const prev = m.onEvent; m.onEvent = (ev) => { prev && prev(ev); B.onEvent(ev); }; }
    B.rebuildModels();
    // mismo flujo que "Nuevo partido" de la interfaz (limpia replays, eventos y estado de vista) — el motor reaplica tlmCfg
    const btn = $('confirm-reset'); if (btn) btn.click();
    // reglas de juego del once del usuario (pantalla Tácticas de la carrera)
    { const R = career.user.rules; if (R && m.setRule) for (const id in R) m.setRule(B.userTeam, id, { on: R[id].on, p: R[id].p }); }
    B.brand(cfg);
    // partidos de copa: gráficas propias de la copa (La Cupidité); la liga vuelve al paquete normal
    if (g.LFOBroadcast) { if (cfg.cup && cfg.cup.pkg) g.LFOBroadcast.pushPackage(cfg.cup.pkg); else g.LFOBroadcast.popPackage(); }
    B.A.refresh();
    B.showMatchView();
    B.active = true; B.decorateControls(true);
    emit('start', cfg);
    return { ok: true, cfg };
  };
  B.onEvent = (ev) => {
    if (!B.active) return;
    if (ev.type === 'fulltime') { const m = B.A.match; if (m.finalTie && m.tieBreak && m.tieBreak.pens && !m.shootout) return; B.finish(); } // con penales pendientes todavía no terminó
    else if (['substitution_presentation', 'substitution_pending', 'substitution_stopping_point', 'player_exit', 'player_entry', 'play_resumed', 'substitution_requested'].includes(ev.type)) emit(ev.type, ev);
    else if (ev.type === 'sub') emit('sub_applied', ev);
    else if (ev.type === 'goal') emit('goal', ev);
    else if (ev.type === 'halftime') emit('halftime', ev);
  };
  B.finish = () => {
    if (B.ended || !B.career) return; B.ended = true;
    try {
      const m = B.A.match, res = m.tlmResult(); TLM.rateMatch(B.career.state, res);
      B.result = res; B.career.applyUserResult(res); B.career.save('auto');
      emit('finished', res);
    } catch (e) { console.error('[TLM] no se pudo registrar el resultado', e); emit('error', e); }
  };
  // Abandonar el partido sin registrar (sólo válido antes del pitazo inicial)
  B.abort = () => {
    const m = B.A.match; if (m.started && !m.ended) return false;
    B.leave(); return true;
  };
  B.leave = () => {
    B.unbrand(); B.active = false; B.decorateControls(false);
    if (g.LFOBroadcast) g.LFOBroadcast.popPackage();
    const m = B.A.match; m.tieBreak = null; m.tlmRestore(); B.rebuildModels();
    const btn = $('confirm-reset'); if (btn) btn.click(); B.A.refresh();
    emit('leave');
  };
  B.decorateControls = (on) => {
    const cfgBtn = $('configure-button'); if (cfgBtn) cfgBtn.style.display = on ? 'none' : '';
    document.body.classList.toggle('tlm-manager-match', on);
  };

  // ---- acciones en vivo (el Match Engine consume al instante, sin reiniciar) ----
  B.pause = () => { const m = B.A.match; const was = m.running; m.running = false; B.A.refresh(); return was; };
  B.resume = () => { const m = B.A.match; if (m.started && !m.ended) { m.running = true; B.A.refresh(); } };
  B.requestSub = (engineId, benchIdx, reason) => B.A.match.tlmRequestSub(B.userTeam, engineId, benchIdx, reason || 'táctico');
  B.setInstruction = (engineId, instr) => { const m = B.A.match; if (!instr) { delete m.playerRoles[engineId]; return true; } return m.setPlayerRole(engineId, instr); };

  // Estudio del broadcast (TLB): suma contexto de liga real a la previa y al post-partido cuando hay un partido de carrera.
  g.TLM_STUDIO = {
    pre: () => { if (!B.active || !B.career) return null; const f = B.career.state.fixtures[B.fixtureId]; return f ? TLM.studioPre(B.career.state, f) : null; },
    post: () => { if (!B.active || !B.career || !B.result) return null; const f = B.career.state.fixtures[B.fixtureId]; return f ? TLM.studioLeagueLines(B.career.state, f, B.result) : null; },
  };

  // Datos vivos para los pop-ups de la transmisión (tabla de la liga o llaves de La Cupidité, goleadores del torneo).
  g.TLM_STUDIO.live = () => {
    if (!B.active || !B.career) return null;
    const c = B.career, s = c.state, f = s.fixtures[B.fixtureId]; if (!f) return null;
    const lab = TLM.fixtureLabel(s, f), crest = (id) => (s.clubs[id] ? TLM.crestURL(s.clubs[id]) : ''), sh = (id) => (s.clubs[id] ? s.clubs[id].shortName || s.clubs[id].name : '');
    const out = { cup: !!lab.cup, comp: lab.comp, round: lab.round, ids: [f.homeId, f.awayId] };
    if (lab.cup) {
      const br = TLM.cupBracket(s, f.cup.id)[f.cup.idx];
      out.ties = br ? br.ties.filter(Boolean).map((t) => ({ home: sh(t.homeId), away: sh(t.awayId), hc: crest(t.homeId), ac: crest(t.awayId), score: t.status === 'played' && t.result ? t.result.hg + '–' + t.result.ag : null, me: t.id === f.id })) : [];
    } else {
      out.table = c.table().map((r) => ({ id: r.clubId, pos: r.pos, name: s.clubs[r.clubId].name, short: sh(r.clubId), crest: crest(r.clubId), pts: r.points, pj: r.played, gd: r.gf - r.ga, mine: r.clubId === f.homeId || r.clubId === f.awayId }));
      out.scorers = Object.values(s.players).filter((p) => p.seasonStats.goals > 0 && p.clubId && s.clubs[p.clubId] && !s.clubs[p.clubId].foreign).sort((a, b) => b.seasonStats.goals - a.seasonStats.goals).slice(0, 5).map((p) => ({ name: p.canonicalName, crest: crest(p.clubId), goals: p.seasonStats.goals }));
    }
    return out;
  };

  B.crest = (club, size) => TLM.crestHTML ? TLM.crestHTML(club, size) : '';
  B.esc = esc;
})(typeof globalThis !== 'undefined' ? globalThis : this);
