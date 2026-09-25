/* LFO MANAGER — UI de partido: MATCHDAY (previa + plan), arranque del 3D, panel de CAMBIOS en vivo, HUD de sustitución,
   POST-MATCH (resumen, estadísticas, MVP, análisis de estudio) y cierre de jornada. */
(function (g) {
  'use strict';
  const TLM = g.TLM, UI = TLM.UI, B = TLM.Bridge; if (!UI || !B) return;
  const esc = UI.esc, M = UI.M, pill = UI.pill, crest = UI.crest, bar = UI.bar, formPills = UI.formPills, A = UI.actions, $ = UI.$;
  const S = () => UI.career.state, U = () => UI.career.user;
  const HOSTS = { A: 'Lucía Acosta · Análisis', B: 'Diego Ferreyra · Crónica' };

  // =====================================================================================
  //                                    MATCHDAY
  // =====================================================================================
  UI.screens.matchday = () => {
    const c = UI.career, s = c.state, u = c.user, comp = c.comp, r = c.round, f = c.userFixture();
    if (!r) return '<p>La temporada terminó.</p>';
    if (!f) return `<h2 class="tlm-h">Jornada ${r} · descanso</h2><div class="tlm-panel"><p>Tu club no juega esta jornada (liga con número impar de equipos). El resto de los partidos se juega igual.</p><button class="tlm-btn primary big" data-act="closeRound">Cerrar jornada →</button></div>`;
    const lab = TLM.fixtureLabel(s, f);
    if (f.status === 'played') return `<h2 class="tlm-h">${esc(lab.comp)} · ${esc(lab.round)} · jugada</h2><div class="tlm-panel"><p>Resultado: <b>${esc(s.clubs[f.homeId].name)} ${f.result.hg} – ${f.result.ag} ${esc(s.clubs[f.awayId].name)}</b>${f.result.pens ? ` <small>(penales ${f.result.pens[0]}–${f.result.pens[1]} · pasa ${esc(s.clubs[f.result.winnerId].name)})</small>` : ''}</p><div class="tlm-row"><button class="tlm-btn" data-act="go" data-screen="postmatch" data-param='{"fixtureId":"${f.id}"}'>Ver resumen del partido</button><button class="tlm-btn primary big" data-act="closeRound">${lab.cup ? 'Cerrar la ronda de copa' : 'Cerrar jornada'} →</button></div></div>`;
    c.prepareRound();
    const home = f.homeId === u.id, opp = s.clubs[home ? f.awayId : f.homeId], rep = TLM.rivalReport(s, comp, opp.id, u.id), lr = TLM.lineRatings(s, u), probs = TLM.lineupProblems(s, u);
    const t = u.tactics, xi = u.lineup.xi.map((id) => id && s.players[id]).filter(Boolean), avgFit = Math.round(TLM.avg(xi.map((p) => p.fitness))), avgMor = Math.round(TLM.avg(xi.map((p) => p.morale)));
    const me = c.table().find((x) => x.clubId === u.id);
    const cmp = (l, a, b) => `<div class="tlm-cmp"><b class="${a >= b ? 'lead' : ''}">${Math.round(a)}</b>${bar(a, 99, a >= b ? 'ok' : '')}<span>${l}</span>${bar(b, 99, b > a ? 'bad' : '')}<b class="${b > a ? 'lead' : ''}">${Math.round(b)}</b></div>`;
    const plan = (k, lab) => `<label>${lab}<select data-chg="planSet" data-k="${k}">${TLM.PLAN_LABELS[k].map(([v, l]) => `<option value="${v}" ${(k === 'fromMinute' ? u.plan.fromMinute.mode : u.plan[k]) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
    const tag = (k) => (TLM.TACTIC_OPTIONS[k].find(([v]) => v === t[k]) || [0, t[k]])[1];
    const ticket = lab.cup ? `<div class="cup-ticket"><div class="ct-side"></div><div class="ct-main"><div class="ct-brand"></div><div class="ct-vs">${crest(s.clubs[f.homeId], 54)}<span>VS</span>${crest(s.clubs[f.awayId], 54)}</div><b>${esc(s.clubs[f.homeId].shortName)} · ${esc(s.clubs[f.awayId].shortName)}</b><small>${esc(lab.round.toUpperCase())} · ${esc(lab.date)}</small><small>${esc(s.clubs[f.homeId].stadium.name)}</small></div><div class="ct-code"></div></div>` : '';
    return `<h2 class="tlm-h">Matchday <small>${esc(lab.comp)} · ${esc(lab.round)} · ${esc(lab.date)}</small></h2>${ticket}
      ${lab.cup ? '<div class="tlm-alert info">Partido único: si terminan empatados en los 90 minutos se define por penales. Se juega con las gráficas de La Cupidité.</div>' : ''}
      <section class="tlm-panel hero hot"><div class="tlm-vs big"><div>${crest(s.clubs[f.homeId], 84)}<b>${esc(s.clubs[f.homeId].name)}</b><small>${esc(s.clubs[f.homeId].stadium.name)}</small></div><span>VS</span><div>${crest(s.clubs[f.awayId], 84)}<b>${esc(s.clubs[f.awayId].name)}</b><small>${home ? 'Visita' : 'Local'}</small></div></div>
        ${probs.length ? `<div class="tlm-alert bad">${esc(probs[0])} <button class="tlm-btn sm" data-act="go" data-screen="${u.squad.length < 11 ? 'transfers' : 'tactics'}">Resolver</button></div>` : ''}
        <div class="tlm-row"><button class="tlm-btn primary big" data-act="playMatch" ${probs.length ? 'disabled' : ''}>▶ Jugar el partido en 3D</button><button class="tlm-btn ghost" data-act="go" data-screen="tactics">Alineación y táctica</button></div>
        <p class="muted sm">En el 3D vas a ver la previa televisiva con tus cartas, podés pausar para cambiar táctica y hacer sustituciones, y el resultado vuelve a tu carrera.</p></section>
      <div class="tlm-grid c3"><section class="tlm-panel"><h3>Informe del rival</h3><dl class="tlm-kv"><dt>Posición</dt><dd>${rep.position || '-'}° · ${rep.points != null ? rep.points + ' pts' : ''}</dd><dt>Formación</dt><dd>${rep.formation} <small>(${rep.formationConfidence})</small></dd><dt>Últimos 5</dt><dd>${formPills(rep.last5)}</dd><dt>Estilo</dt><dd>${esc((TLM.TACTIC_OPTIONS.mentality.find(([v]) => v === rep.style.mentality) || [0, rep.style.mentality])[1])} · presión ${esc((TLM.TACTIC_OPTIONS.pressing.find(([v]) => v === rep.style.pressing) || [0, ''])[1].toLowerCase())}</dd><dt>Bajas</dt><dd>${rep.injuries}</dd></dl>
          <h4>Jugadores clave</h4><ul class="tlm-list">${rep.keyPlayers.map((p) => `<li><a data-act="playerModal" data-pid="${p.pid}">${esc(p.name)}</a> <small>${p.pos} · OVR ${p.ovr}${p.goals ? ' · ' + p.goals + ' goles' : ''}</small></li>`).join('')}</ul>
          <h4>Tendencias</h4><ul class="tlm-list">${rep.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></section>
        <section class="tlm-panel"><h3>Tú vs ${esc(opp.shortName)}</h3>${cmp('Ataque', lr.attack, rep.ratings.attack)}${cmp('Medio', lr.midfield, rep.ratings.midfield)}${cmp('Defensa', lr.defense, rep.ratings.defense)}${cmp('Arquero', lr.gk, rep.ratings.gk)}
          <dl class="tlm-kv"><dt>Tu posición</dt><dd>${me ? me.pos : '-'}°</dd><dt>Tu forma</dt><dd>${formPills(TLM.recentResults(s, comp, u.id, 5))}</dd><dt>Físico medio del once</dt><dd class="${avgFit < 65 ? 'neg' : ''}">${avgFit}</dd><dt>Moral del once</dt><dd>${avgMor}</dd></dl>
          <h4>Tu once (${t.formation})</h4><div class="tlm-xilist">${u.lineup.xi.map((id, i) => { const p = id && s.players[id]; return p ? `<span title="${esc(p.canonicalName)}"><em>${p.number}</em>${esc(TLM.shortName(p.canonicalName))}<i class="${UI.tone(p.overall)}">${p.overall}</i></span>` : '<span class="empty">—</span>'; }).join('')}</div></section>
        <section class="tlm-panel"><h3>Plan de partido</h3><div class="tlm-plan">${plan('ifWinning', 'Si ganamos')}${plan('ifLosing', 'Si perdemos')}${plan('fromMinute', 'Desde el min. ' + u.plan.fromMinute.minute)}</div><label class="tlm-check"><input type="checkbox" data-chg="planAuto" ${u.plan.autoSubs ? 'checked' : ''}> Dejar que el asistente haga los cambios (cansancio y marcador)</label>
          <h4>Táctica inicial</h4><p>${['mentality', 'buildUp', 'pressing', 'width', 'tempo', 'line'].map((k) => pill(TLM.TACTIC_LABEL[k] + ': ' + tag(k))).join(' ')}</p><button class="tlm-btn sm ghost" data-act="go" data-screen="tactics">Editar en TACTICS</button>
          <p class="muted sm">El plan se traduce en instrucciones reales que el motor aplica cuando se cumple la condición (marcador y minuto).</p></section></div>`;
  };

  A.playMatch = () => {
    const c = UI.career, r = B.start(c);
    if (!r.ok) { UI.toast(r.reason, 'bad'); return; }
    UI.hide(); ensureMatchUI(); refreshSubBtn();
    const vp = $('viewport'); if (vp) vp.scrollIntoView({ behavior: 'smooth', block: 'center' });
    UI.toast('Partido cargado. Pulsá INICIAR PARTIDO para ver la previa televisiva.', 'ok');
  };
  A.quickSim = () => { const c = UI.career; try { const f = c.quickSimUser(); c.save('auto'); UI.go('postmatch', { fixtureId: f.id }); } catch (e) { UI.toast(e.message, 'bad'); } };

  // =====================================================================================
  //                                   POST-MATCH
  // =====================================================================================
  UI.screens.postmatch = () => {
    const c = UI.career, s = c.state, u = c.user, fid = UI.params.fixtureId || Object.keys(s.matchRecords).slice(-1)[0], f = s.fixtures[fid], rec = s.matchRecords[fid];
    if (!f || !rec || f.status !== 'played') return '<h2 class="tlm-h">Post-match</h2><p class="muted">Todavía no hay un partido para resumir.</p>';
    const H = s.clubs[f.homeId], Aw = s.clubs[f.awayId], [a, b] = rec.score, N = (pid) => (s.players[pid] ? s.players[pid].canonicalName : '?');
    const sc = (t) => rec.goalScorers.filter((g) => g.team === t).map((g) => `${esc(N(g.pid))} ${g.minute}′${g.assistPid ? ` <small>(${esc(N(g.assistPid))})</small>` : ''}`).join('<br>') || '<span class="muted">—</span>';
    const rows = [['Posesión', rec.possession, '%'], ['Tiros', rec.shots], ['A puerta', rec.shotsOnTarget], ['xG', rec.xg && rec.xg.map((x) => x.toFixed ? x.toFixed(2) : x)], ['Pases', rec.passes], ['Precisión de pase', rec.passAccuracy, '%'], ['Faltas', rec.fouls], ['Córners', rec.corners], ['Fuera de juego', rec.offsides], ['Atajadas', rec.saves], ['Amarillas', rec.yellow], ['Rojas', rec.red]].filter((r) => r[1]);
    const st = rows.map(([l, v, suf]) => { const x = +v[0], y = +v[1], tot = x + y || 1; return `<div class="tlm-srow"><b>${v[0]}${suf || ''}</b><div class="tlm-sbar"><i style="width:${(x / tot) * 100}%;background:${H.primaryColor}"></i><i style="width:${(y / tot) * 100}%;background:${Aw.primaryColor}"></i></div><span>${l}</span><b>${v[1]}${suf || ''}</b></div>`; }).join('');
    const ps = rec.playerStats, top = Object.values(ps).filter((x) => x.rating).sort((x, y) => y.rating - x.rating), mvp = top[0];
    const myTeam = H.id === u.id ? 0 : 1, myIds = new Set(rec.lineups[myTeam].xi.concat(rec.lineups[myTeam].bench));
    const myRows = Object.values(ps).filter((x) => myIds.has(x.pid) && x.minutes > 0).sort((x, y) => y.rating - x.rating);
    const inj = (rec.injuries || []).filter((i) => myIds.has(i.pid)).map((i) => s.players[i.pid]);
    const lines = TLM.studioAnalysis(s, f, rec);
    const subs = (rec.substitutions || []).map((x) => `${x.minute}′ ${esc(N(x.inPid))} por ${esc(N(x.outPid))} <small>(${s.clubs[x.team === 0 ? f.homeId : f.awayId].shortName})</small>`).join('<br>') || '<span class="muted">Sin cambios</span>';
    const lab = TLM.fixtureLabel(s, f), wid = f.result && f.result.winnerId;
    const me = wid ? (wid === u.id ? 'W' : 'L') : a === b ? 'D' : (myTeam === 0) === (a > b) ? 'W' : 'L';
    return `<h2 class="tlm-h">Post-match <small>${esc(lab.comp)} · ${esc(lab.round)} · ${esc(lab.date)}</small></h2>
      <section class="tlm-panel hero ${me === 'W' ? 'win' : me === 'L' ? 'loss' : ''}"><div class="tlm-vs big score"><div>${crest(H, 76)}<b>${esc(H.name)}</b><small>${sc(0)}</small></div><span class="tlm-scoreline">${a} – ${b}</span><div>${crest(Aw, 76)}<b>${esc(Aw.name)}</b><small>${sc(1)}</small></div></div>
        <p class="tlm-result ${me}">${f.result.pens ? `${me === 'W' ? 'PASÁS' : 'QUEDÁS AFUERA'} POR PENALES ${f.result.pens[0]}–${f.result.pens[1]}` : lab.cup ? (me === 'W' ? (lab.round === 'Final' ? '¡CAMPEÓN!' : 'AVANZÁS DE RONDA') : lab.round === 'Final' ? 'SUBCAMPEÓN' : 'ELIMINADO') : me === 'W' ? 'VICTORIA' : me === 'D' ? 'EMPATE' : 'DERROTA'}${f.result.attendance ? ` · ${f.result.attendance.toLocaleString('es-AR')} espectadores · recaudación ${M(f.result.income)}` : ''}</p></section>
      <div class="tlm-grid c3"><section class="tlm-panel"><h3>Estadísticas</h3>${st}</section>
        <section class="tlm-panel"><h3>Jugador del partido</h3>${mvp ? `<div class="tlm-mvp"><div data-card-pid="${mvp.pid}" class="tlm-cardhost sm">…</div><div><b>${esc(N(mvp.pid))}</b><p>${esc(s.clubs[s.players[mvp.pid].clubId].name)}</p><p class="tlm-rate">${mvp.rating.toFixed(1)}</p><small>${mvp.goals ? mvp.goals + ' gol(es) · ' : ''}${mvp.assists ? mvp.assists + ' asist. · ' : ''}${mvp.minutes}′</small></div></div>` : ''}
          <h4>Cambios</h4><p>${subs}</p>${inj.length ? `<h4>Lesiones en tu equipo</h4><ul class="tlm-list">${inj.map((p) => `<li class="neg">${esc(p.canonicalName)} — ${esc(p.injury ? p.injury.name + ' (' + p.injury.matchdays + ' J)' : 'recuperado')}</li>`).join('')}</ul>` : ''}</section>
        <section class="tlm-panel"><h3>Valoraciones de tu equipo</h3><table class="tlm-table mini"><tbody>${myRows.map((x) => `<tr><td class="l"><a data-act="playerModal" data-pid="${x.pid}">${esc(N(x.pid))}</a></td><td>${x.minutes}′</td><td>${x.goals ? '⚽' + x.goals : ''}${x.assists ? '🅰' + x.assists : ''}${x.yellow ? '🟨' : ''}${x.red ? '🟥' : ''}</td><td><b class="ovr ${x.rating >= 7.5 ? 'hi' : x.rating >= 6.5 ? 'mid' : 'lo'}">${x.rating.toFixed(1)}</b></td></tr>`).join('')}</tbody></table></section></div>
      <section class="tlm-panel"><h3>En el estudio</h3><div class="tlm-studio">${lines.map(([w, t]) => `<div class="tlm-say ${w}"><small>${HOSTS[w]}</small><p>${esc(t)}</p></div>`).join('')}</div></section>
      <div class="tlm-row end"><button class="tlm-btn primary big" data-act="closeRound">${lab.cup ? 'Cerrar la ronda de copa y seguir' : 'Cerrar jornada y avanzar'} →</button></div>`;
  };

  // ---------- cierre de jornada + resumen ----------
  A.closeRound = () => {
    const c = UI.career, s = c.state, u = c.user;
    let out;
    try { out = c.finishRound(); } catch (e) { UI.toast(e.message, 'bad'); return; }
    c.save('auto');
    if (out.cup === true) { cupClosedModal(out); return; }
    const N = (id) => s.players[id].canonicalName, lines = [];
    for (const ev of out.events) {
      const o = ev.offer;
      if (ev.type === 'transfer' && o) { if (o.fromClubId === u.id) lines.push(`✅ ${esc(N(o.playerId))} acepta y llega a tu club (${M(o.amount)}).`); else if (o.toClubId === u.id) lines.push(`💰 Vendiste a ${esc(N(o.playerId))} (${M(o.amount)}).`); }
      else if (ev.type === 'counter' && o && o.fromClubId === u.id) lines.push(`↔ ${esc(s.clubs[o.toClubId].name)} contraoferta ${M(o.counterAmount)} por ${esc(N(o.playerId))}.`);
      else if (['rejected', 'lost', 'expired', 'failed'].includes(ev.type) && o && o.fromClubId === u.id) lines.push(`✖ Oferta por ${esc(N(o.playerId))}: ${esc(o.reason || 'no prosperó')}.`);
      else if (ev.type === 'offer_for_user' || (ev.type === 'ai_offer' && ev.offer.toClubId === u.id)) lines.push(`📩 ${esc(s.clubs[ev.offer.fromClubId].name)} ofrece ${M(ev.offer.amount)} por ${esc(N(ev.offer.playerId))}.`);
      else if (ev.type === 'forced_sale') lines.push(`⚠ La directiva vendió a ${esc(N(ev.playerId))} por la crisis económica.`);
    }
    const tb = c.table(), me = tb.find((r) => r.clubId === u.id);
    const others = out.results.map((r) => { const f = s.fixtures[r.fixtureId]; return `<li>${esc(s.clubs[f.homeId].name)} <b>${r.score[0]} – ${r.score[1]}</b> ${esc(s.clubs[f.awayId].name)}</li>`; }).join('');
    let season = '';
    const cupNext = (out.cup || []).filter((x) => x.pending).map((x) => `<div class="tlm-alert info"><b>${esc(TLM.CUPS[x.cupId].name)}:</b> ${esc(x.name)} entre semana (${esc(TLM.cupDateStr(s, s.cups[x.cupId], x.idx))}). Tu partido es el próximo.</div>`).join('');
    const cupQual = (out.cup || []).filter((x) => x.qualified).map((x) => `<div class="tlm-alert info"><b>${esc(TLM.CUPS[x.cupId].name)}:</b> se cerró la clasificación. <button class="tlm-btn sm" data-act="go" data-screen="cup">Ver el cuadro</button></div>`).join('');
    const cupAuto = (out.cup || []).filter((x) => !x.pending && x.results).map((x) => `<div class="tlm-alert info"><b>${esc(TLM.CUPS[x.cupId].name)} · ${esc(x.name)}:</b> ${x.results.map((y) => { const f = s.fixtures[y.fixtureId]; return `${esc(s.clubs[f.homeId].shortName)} ${y.score[0]}-${y.score[1]}${y.pens ? ' (p. ' + y.pens[0] + '-' + y.pens[1] + ')' : ''} ${esc(s.clubs[f.awayId].shortName)}`; }).join(' · ')}</div>`).join('');
    season += cupQual + cupNext + cupAuto;
    if (out.seasonEnded) { const h = out.season, mine = h.table.find((r) => r.clubId === u.id); season += `<div class="tlm-alert info"><b>Fin de la temporada ${h.season}:</b> campeón ${esc(h.championName)}. Terminaste ${mine ? mine.pos + '°' : '—'} con ${mine ? mine.points : 0} puntos. Goleador: ${h.scorers[0] ? esc(h.scorers[0].name) + ' (' + h.scorers[0].goals + ')' : '—'}. Contratos vencidos: revisá tu plantilla. ¡Empieza la nueva temporada!</div>`; }
    UI.modal(`<h2>Jornada ${out.round} cerrada</h2>${season}<div class="tlm-cols"><div><h3>Resultados</h3><ul class="tlm-list">${others || '<li class="muted">—</li>'}</ul></div><div><h3>Tu club</h3><p>Posición: <b>${me ? me.pos : '-'}°</b> · Saldo ${M(u.finances.balance)}</p><h3>Mercado</h3><ul class="tlm-list">${lines.map((l) => `<li>${l}</li>`).join('') || '<li class="muted">Sin novedades de mercado.</li>'}</ul></div></div><div class="tlm-row"><button class="tlm-btn primary" data-act="afterRound">Continuar</button></div>`, 'wide');
  };
  function cupClosedModal(out) {
    const c = UI.career, s = c.state, u = c.user, cr = out.cupResult, def = TLM.CUPS[cr.cupId], cup = s.cups[cr.cupId];
    const rows = out.results.map((r) => { const f = s.fixtures[r.fixtureId]; return `<li>${esc(s.clubs[f.homeId].name)} <b>${r.score[0]} – ${r.score[1]}</b>${r.pens ? ` <small>(pen. ${r.pens[0]}-${r.pens[1]})</small>` : ''} ${esc(s.clubs[f.awayId].name)}</li>`; }).join('');
    const next = cup.rounds[cr.idx + 1], alive = cup.status === 'active' && cup.rounds[cr.idx] && cup.rounds[cr.idx].fixtureIds.some((id) => s.fixtures[id].result && s.fixtures[id].result.winnerId === u.id);
    const msg = cup.champion ? `<div class="tlm-alert info"><b>${esc(s.clubs[cup.champion].name)}</b> es el campeón de ${esc(def.name)}${cup.champion === u.id ? ' — ¡es tu club!' : ''}.</div>` : alive && next ? `<div class="tlm-alert info">Seguís en carrera: próxima ronda, <b>${esc(next.name)}</b>${cup.slots[cr.idx + 1] ? ' · ' + esc(TLM.cupDateStr(s, cup, cr.idx + 1)) : ''}.</div>` : '<div class="tlm-alert bad">Tu club quedó afuera de la copa.</div>';
    UI.modal(`<h2>${esc(def.name)} · ${esc(cr.name)} cerrada</h2>${msg}<div class="tlm-cols"><div><h3>Otros partidos</h3><ul class="tlm-list">${rows || '<li class="muted">—</li>'}</ul></div><div><h3>Tu club</h3><p>Saldo ${M(u.finances.balance)}</p><button class="tlm-link" data-act="go" data-screen="cup">Ver el cuadro →</button></div></div><div class="tlm-row"><button class="tlm-btn primary" data-act="afterRound">Continuar</button></div>`, 'wide');
  }
  A.afterRound = () => { UI.closeModal(); if (B.active && B.ended) B.leave(); UI.go('home'); };

  // =====================================================================================
  //                        UI EN EL PARTIDO 3D: botones, cambios, HUD
  // =====================================================================================
  let subsWas = false;
  function ensureMatchUI() {
    const ctr = document.querySelector('.match-controls'); if (!ctr || $('tlm-subs-btn')) return;
    const tb = $('tactics-button');
    const mk = (id, html, fn) => { const b = document.createElement('button'); b.id = id; b.className = 'control-button tlm-ctl'; b.type = 'button'; b.innerHTML = html; b.onclick = fn; return b; };
    const subs = mk('tlm-subs-btn', '<span>Cambios</span>', () => toggleSubs()), mgr = mk('tlm-mgr-btn', '<span>★ Manager</span>', () => UI.show());
    if (tb) { tb.insertAdjacentElement('afterend', subs); subs.insertAdjacentElement('afterend', mgr); } else { ctr.appendChild(subs); ctr.appendChild(mgr); }
  }
  function refreshSubBtn() { const b = $('tlm-subs-btn'); if (b) b.style.display = B.active ? '' : 'none'; const m = $('tlm-mgr-btn'); if (m) m.style.display = UI.career ? '' : 'none'; }

  function subsPanel() {
    let p = $('tlm-subs'); if (!p) { p = document.createElement('aside'); p.id = 'tlm-subs'; p.className = 'panel tlm-float'; document.body.appendChild(p); }
    return p;
  }
  function renderSubs() {
    const p = subsPanel(), m = B.A.match, t = B.userTeam, s = S(), opt = m.tlmSubOptions(t), on = m.players.filter((x) => x.team === t), q = m.tlmSubQ || [];
    const sel = UI.subSel || {};
    const stam = (x) => Math.round(x.stamina == null ? 100 : x.stamina);
    const rows = on.map((x) => {
      const pending = q.find((c) => c.outId === x.id), instr = TLM.instructionOptions(x.primaryPosition || 'MC'), cur = m.playerRoles && m.playerRoles[x.id] || '';
      return `<div class="tlm-srow2 ${sel.out === x.id ? 'sel' : ''} ${x.sentOff ? 'off' : ''}"><button ${x.sentOff || pending ? 'disabled' : ''} data-act="subOut" data-id="${x.id}"><em>${x.number}</em><b>${esc(x.name)}</b><span>${x.primaryPosition || ''}</span><i class="${stam(x) > 70 ? 'ok' : stam(x) > 45 ? 'warn' : 'bad'}">${stam(x)}%</i>${x.cards && x.cards.yellow ? '🟨' : ''}${x.sentOff ? '🟥' : ''}${pending ? '<u>salida pendiente</u>' : ''}</button>${instr && !x.sentOff ? `<select data-chg="subInstr" data-id="${x.id}">${instr.map(([v, l]) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${l}</option>`).join('')}</select>` : ''}</div>`;
    }).join('');
    const benchRows = m.bench[t].map((b, i) => `<button class="tlm-benchp ${sel.inn === i ? 'sel' : ''}" data-act="subIn" data-i="${i}"><em>${b.number}</em><b>${esc(b.name)}</b><span>${b.primaryPosition}</span><i class="${UI.tone(b.overall)}">${b.overall}</i></button>`).join('');
    const pend = q.filter((c) => c.team === t).map((c) => { const o = m.players[c.outId], inn = m.bench[t].find((b) => b.tlmPid === c.inIdxPid); return `<li>${esc(o.name)} ↔ ${esc(inn ? inn.name : '?')} <button class="tlm-btn sm ghost" data-act="subCancel" data-id="${c.outId}">Cancelar</button></li>`; }).join('');
    p.innerHTML = `<div class="panel-heading"><h3>Cambios · ${opt.used + opt.pending}/${opt.max}</h3><button class="icon-button" data-act="subsClose" aria-label="Cerrar">✕</button></div>
      <p class="muted sm">El partido está en pausa. Elegí quién sale y quién entra: el cambio se hace en el próximo parón y el jugador sale y entra caminando por la banda.</p>
      <div class="tlm-sbox"><h4>En cancha</h4>${rows}</div><div class="tlm-sbox"><h4>Banquillo</h4>${benchRows || '<span class="muted">Sin suplentes</span>'}</div>
      <button class="tlm-btn primary" data-act="subConfirm" ${sel.out != null && sel.inn != null ? '' : 'disabled'}>Confirmar cambio</button>${pend ? `<h4>Pendientes</h4><ul class="tlm-list">${pend}</ul>` : ''}
      <div class="tlm-row"><button class="tlm-btn sm" data-act="subsResume">▶ Cerrar y continuar</button></div>`;
    void s;
  }
  function toggleSubs() {
    const p = subsPanel(); if (p.classList.contains('on')) { A.subsClose(); return; }
    if (!B.active || B.A.match.ended) return;
    subsWas = B.pause(); UI.subSel = {}; p.classList.add('on'); renderSubs();
  }
  A.subsClose = () => { const p = $('tlm-subs'); if (p) p.classList.remove('on'); if (subsWas) B.resume(); subsWas = false; };
  A.subsResume = () => { const p = $('tlm-subs'); if (p) p.classList.remove('on'); B.resume(); subsWas = false; };
  A.subOut = (el) => { UI.subSel = Object.assign(UI.subSel || {}, { out: +el.dataset.id }); renderSubs(); };
  A.subIn = (el) => { UI.subSel = Object.assign(UI.subSel || {}, { inn: +el.dataset.i }); renderSubs(); };
  A.subCancel = (el) => { B.A.match.tlmCancelSub(B.userTeam, +el.dataset.id); renderSubs(); };
  A.subConfirm = () => { const sel = UI.subSel; const r = B.requestSub(sel.out, sel.inn, 'táctico'); if (!r.ok) { UI.toast(r.reason, 'bad'); return; } UI.subSel = {}; UI.toast('Cambio solicitado: se hará en el próximo parón.', 'ok'); renderSubs(); };
  A.subInstr = (el) => { B.setInstruction(+el.dataset.id, el.value); UI.toast('Instrucción actualizada.', 'ok'); };

  // HUD de sustitución (SUBSTITUTION_PRESENTATION)
  let hudTimer = null;
  function showHUD(ev) {
    const vp = $('viewport'); if (!vp) return; let h = $('tlm-subhud');
    if (!h) { h = document.createElement('div'); h.id = 'tlm-subhud'; vp.appendChild(h); }
    const x = ev.extra || {}, m = B.A.match, team = m.teams[ev.team], out = x.outPid && S().players[x.outPid], inn = x.inPid && S().players[x.inPid];
    h.style.setProperty('--tc', team.color);
    h.innerHTML = `<div class="tlm-sh-tag">CAMBIO · ${esc(team.name.toUpperCase())}</div><div class="tlm-sh-body"><div class="out"><div data-card-pid="${x.outPid}" class="tlm-cardhost xs"></div><span>▼ SALE</span><b>${esc(out ? TLM.shortName(out.canonicalName) : '')}</b></div><div class="in"><div data-card-pid="${x.inPid}" class="tlm-cardhost xs"></div><span>▲ ENTRA</span><b>${esc(inn ? TLM.shortName(inn.canonicalName) : x.inName || '')}</b></div></div>`;
    h.classList.add('on'); UI.hydrateCards(); clearTimeout(hudTimer); hudTimer = setTimeout(() => h.classList.remove('on'), 6500);
  }
  function endBar() {
    const vp = $('viewport'); if (!vp || $('tlm-endbar')) return;
    const d = document.createElement('div'); d.id = 'tlm-endbar'; const fx = S().fixtures[B.fixtureId], pens = fx && fx.result && fx.result.pens;
    d.innerHTML = `<b>FINAL DEL PARTIDO</b><span>${pens ? `Empate: se definió por penales ${pens[0]}–${pens[1]} (pasa ${esc(S().clubs[fx.result.winnerId].name)}).` : 'El resultado ya está en tu carrera.'}</span><button class="tlm-btn primary" data-act="openPostmatch">Ver resumen y análisis →</button>`; vp.appendChild(d);
  }
  A.openPostmatch = () => { const d = $('tlm-endbar'); if (d) d.remove(); UI.show(); UI.go('postmatch', { fixtureId: B.fixtureId }); };

  B.on((t, p) => {
    if (t === 'substitution_presentation') showHUD(p);
    else if (t === 'substitution_pending') UI.toast('Cambio en espera: se hará en el próximo parón.', 'ok');
    else if (t === 'play_resumed') { const h = $('tlm-subhud'); if (h) setTimeout(() => h.classList.remove('on'), 1200); if ($('tlm-subs') && $('tlm-subs').classList.contains('on')) renderSubs(); }
    else if (t === 'finished') { setTimeout(endBar, 4000); const b = $('tlm-subs'); if (b) b.classList.remove('on'); }
    else if (t === 'start') { const e = $('tlm-endbar'); if (e) e.remove(); const h = $('tlm-subhud'); if (h) h.classList.remove('on'); ensureMatchUI(); refreshSubBtn(); }
    else if (t === 'leave') { refreshSubBtn(); const e = $('tlm-endbar'); if (e) e.remove(); }
  });
  // botón «★ Manager» y «Cambios» aparecen en cuanto hay carrera; los cambios sólo mientras hay partido del manager
  const _init = UI.init; UI.init = async () => { await _init(); ensureMatchUI(); refreshSubBtn(); };
  UI.afterRender = () => refreshSubBtn();

  // El botón «NUEVO PARTIDO» tras un partido de carrera no reinicia (el resultado ya está registrado): lleva al resumen.
  document.addEventListener('click', (e) => {
    const b = e.target.closest('#start-button'); if (!b || !B.active || !B.ended) return;
    e.stopImmediatePropagation(); e.preventDefault(); A.openPostmatch();
  }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && UI.modalEl) UI.closeModal(); });
  void formPills;
})(typeof globalThis !== 'undefined' ? globalThis : this);
