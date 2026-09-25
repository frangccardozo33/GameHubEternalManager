/* LFO MANAGER — pestaña COMPETICIONES: la liga (LFO) y La Cupidité con el estilo de cada marca.
   · Liga: candidato al título (el líder), ventaja, jornadas que faltan y zona de clasificación a La Cupidité.
   · La Cupidité: antes del corte muestra los clasificados por el momento (liga + Continente Viejo) y cuánto falta para que empiece;
     durante el torneo, el cuadro de llaves; al final, el campeón. El partido de copa se juega desde MATCHDAY. */
(function (g) {
  'use strict';
  const TLM = g.TLM, UI = TLM.UI; if (!UI || !TLM.CUPS) return;
  const esc = UI.esc, M = UI.M, crest = UI.crest;

  const N = () => g.LFONations;
  const flag = (club, h) => { const f = club && club.nation && N() ? N().flag(club.nation) : ''; return f ? `<img class="cmp-flag" src="${f}" alt="" height="${h || 13}">` : ''; };
  const natName = (club) => (club && club.nation && N() && N().get(club.nation) ? N().get(club.nation).name : '');
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const season = (s) => TLM.seasonLabel(s);
  const when = (n) => (n <= 0 ? 'esta semana' : n === 1 ? 'en 1 jornada' : `en ${n} jornadas`);

  // ---------------------------------------------------------------- tarjetas de trofeo
  function leagueCard(s, u, lo) {
    const lead = s.clubs[lo.leader.clubId], second = lo.table[1] ? s.clubs[lo.table[1].clubId] : null, me = lo.table.find((r) => r.clubId === u.id) || {};
    const status = lo.done ? `Campeón de la temporada: <b>${esc(lead.name)}</b>` : lo.clinched ? `<b>${esc(lead.name)}</b> tiene el título asegurado` : lo.left <= 3 ? `Definición: ${lo.contenders === 1 ? 'un solo candidato' : lo.contenders + ' clubes con chances'}` : `${lo.contenders === lo.table.length ? 'Todo abierto' : plural(lo.contenders, 'club con chances', 'clubes con chances')}`;
    return `<article class="cmp-card lfo"><div class="cmp-brand"><span class="cmp-logo lfo" style="background-image:url('${esc(lo.comp.crest || '')}')"></span><div><small>LIGA · TEMPORADA ${esc(season(s))}</small><h3>${esc(lo.comp.name)}</h3></div></div>
      <div class="cmp-trophy"><small>${lo.done ? 'CAMPEÓN' : lo.pre ? 'FAVORITO AL TÍTULO (POR PLANTILLA)' : 'CANDIDATO AL TÍTULO'}</small><div class="cmp-cand">${crest(lead, 54)}<div><b>${esc(lead.name)}</b><span>${lo.pre ? 'La temporada todavía no empezó' : `${lo.leader.points} pts · ${lo.leader.played} PJ${second && !lo.done ? ` · +${lo.gap} sobre ${esc(second.shortName)}` : ''}`}</span></div></div></div>
      <div class="cmp-meter"><i style="width:${Math.round((lo.played / lo.total) * 100)}%"></i></div>
      <div class="cmp-chips"><span><b>${lo.done ? 0 : lo.left}</b><small>${lo.left === 1 ? 'JORNADA RESTANTE' : 'JORNADAS RESTANTES'}</small></span><span><b>${lo.played}/${lo.total}</b><small>JUGADAS</small></span><span><b>${me.pos || '-'}°</b><small>TU POSICIÓN</small></span></div>
      <p class="cmp-note">${status}.</p><button class="tlm-btn ghost sm" data-act="go" data-screen="competitions" data-param='{"tab":"lfo"}'>Ver la liga →</button></article>`;
  }

  function cupCard(s, u, co) {
    const def = co.def, cup = co.cup;
    let head = '', chips = '', note = '', btn = `<button class="tlm-btn ghost sm" data-act="go" data-screen="competitions" data-param='{"tab":"cup"}'>Ver La Cupidité →</button>`;
    if (co.legacy) { head = `Temporada ${esc(season(s))}`; note = 'Torneo en juego con el formato anterior.'; }
    else if (cup.status === 'qualifying') {
      const q = co.provisional, inNow = co.userIn;
      head = 'CLASIFICACIÓN ABIERTA';
      chips = `<span><b>${co.startsIn <= 0 ? 'Ya' : co.startsIn}</b><small>${co.startsIn <= 0 ? 'ARRANCA' : co.startsIn === 1 ? 'JORNADA PARA EL INICIO' : 'JORNADAS PARA EL INICIO'}</small></span><span><b>${co.cutIn <= 0 ? 'Hoy' : co.cutIn}</b><small>${co.cutIn <= 0 ? 'CIERRA' : co.cutIn === 1 ? 'JORNADA PARA EL CORTE' : 'JORNADAS PARA EL CORTE'}</small></span><span><b>${q.league.length + q.guests.length + (q.prelim ? 1 : 0)}</b><small>CLASIFICADOS</small></span>`;
      note = `Empieza el <b>${esc(co.startDate)}</b> (${esc(co.startName.toLowerCase())}). Los ${q.league.length} primeros de la liga en la J${co.cutRound} clasifican${inNow ? ' — <b class="ok">tu club entraría hoy</b>' : ' — <b class="warn">tu club hoy queda afuera</b>'}.`;
    } else if (cup.status === 'active') {
      head = `EN JUEGO · ${esc((co.nextName || '').toUpperCase())}`;
      const alive = aliveOf(s, cup, u.id);
      chips = `<span><b>${esc(co.nextName || '—')}</b><small>PRÓXIMA RONDA</small></span><span><b>${co.nextIn <= 0 ? 'Ya' : co.nextIn}</b><small>${co.nextIn === 1 ? 'JORNADA' : 'JORNADAS'}</small></span><span><b>${alive ? 'En carrera' : 'Eliminado'}</b><small>TU CLUB</small></span>`;
      note = `${co.nextName ? `Próxima ronda: <b>${esc(co.nextName)}</b> · ${esc(co.nextDate)}.` : ''}`;
    } else if (cup.status === 'done') {
      head = 'FINALIZADA';
      const w = s.clubs[cup.champion];
      chips = `<span><b>${esc(w.shortName)}</b><small>CAMPEÓN</small></span><span><b>${esc(s.clubs[cup.runnerUp].shortName)}</b><small>SUBCAMPEÓN</small></span>`;
      note = `${flag(w)} ${esc(w.name)} ${cup.champion === u.id ? '— ¡tu club! ' : ''}se llevó la copa. La próxima edición arranca con la temporada que viene.`;
    } else { head = 'PRÓXIMA EDICIÓN'; note = 'Esta temporada la copa ya había arrancado cuando se cargó tu carrera.'; }
    return `<article class="cmp-card cup"><div class="cmp-brand"><span class="cmp-logo cup"></span><div><small>${esc(def.motto.toUpperCase())}</small><h3>${esc(def.name)}</h3></div></div>
      <div class="cmp-trophy"><small>${head}</small><div class="cmp-cand"><span class="cmp-diamond"></span><div><b>${cup.status === 'done' ? esc(s.clubs[cup.champion].name) : `${def.size} clubes · partido único`}</b><span>${cup.status === 'done' ? 'Campeón de La Cupidité' : '8 de la LFO + 8 del Continente Viejo'}</span></div></div></div>
      <div class="cmp-chips">${chips}</div><p class="cmp-note">${note}</p>${btn}</article>`;
  }

  // ¿Sigue vivo el club en la copa?
  function aliveOf(s, cup, id) {
    if (cup.status === 'done') return cup.champion === id;
    const fx = Object.values(s.fixtures).filter((f) => f.cup && f.cup.id === cup.id && f.season === cup.season && (f.homeId === id || f.awayId === id)).sort((a, b) => a.round - b.round), last = fx[fx.length - 1];
    if (!cup.entrants.includes(id) && !(cup.qualified && cup.qualified.prelim && cup.qualified.prelim.includes(id))) return false;
    return !last || last.status !== 'played' || last.result.winnerId === id;
  }

  // ---------------------------------------------------------------- llaves
  function tieHTML(s, u, f, dateShort) {
    if (!f) return '<div class="cup-tie tbd"><div class="cup-row"><span class="cup-name">Por definir</span></div><div class="cup-row"><span class="cup-name">Por definir</span></div>' + (dateShort ? `<small class="cup-date">${esc(dateShort)}</small>` : '') + '</div>';
    const played = f.status === 'played', r = f.result || {}, w = r.winnerId;
    const row = (id, goals, pen) => `<div class="cup-row ${w === id ? 'win' : played && w ? 'out' : ''} ${id === u.id ? 'me' : ''}">${crest(s.clubs[id], 20)}<span class="cup-name">${flag(s.clubs[id], 11)} ${esc(s.clubs[id].shortName)} <small>${esc(s.clubs[id].name)}</small></span><b>${played ? goals : ''}${played && pen != null ? `<sup>(${pen})</sup>` : ''}</b></div>`;
    return `<div class="cup-tie ${played ? 'played' : ''} ${f.homeId === u.id || f.awayId === u.id ? 'mine' : ''}">${row(f.homeId, r.hg, r.pens ? r.pens[0] : null)}${row(f.awayId, r.ag, r.pens ? r.pens[1] : null)}${played ? '' : `<small class="cup-date">${esc(dateShort)}</small>`}</div>`;
  }
  const bracketHTML = (s, u, br) => `<div class="cup-bracket">${br.map((rd) => `<div class="cup-col ${rd.prelim ? 'prelim' : ''}"><h4>${esc(rd.name)}<small>${esc(rd.date)}</small></h4>${rd.ties.map((f) => tieHTML(s, u, f, rd.date)).join('')}</div>`).join('')}</div>`;

  // ---------------------------------------------------------------- detalle: La Cupidité
  function cupDetail(s, u, co) {
    const def = co.def, cup = co.cup, hist = (s.history.cups && s.history.cups[def.id]) || [];
    const hero = `<div class="cup-hero"><div class="cup-mark"></div><div><h2>${esc(def.name)}</h2><p>${esc(def.motto)} · Temporada ${esc(season(s))} · ${def.size} clubes · partido único</p></div></div>`;
    const history = hist.length ? `<section class="tlm-panel cup-panel"><h3>Campeones</h3><table class="tlm-table mini"><tbody>${hist.slice().reverse().map((x) => `<tr><td>${x.season}/${String((x.season + 1) % 100).padStart(2, '0')}</td><td class="l">${crest(s.clubs[x.champion] || { name: x.championName }, 18)} ${esc(x.championName)}</td><td class="l muted">${esc(x.runnerUpName)} · ${esc(x.score)}</td></tr>`).join('')}</tbody></table></section>` : '';
    if (cup.status === 'skipped') return `${hero}<div class="tlm-alert info">Esta temporada la copa ya había arrancado cuando se cargó tu carrera: la primera edición para tu club es la de la temporada que viene.</div>${history}`;
    const br = TLM.cupBracket(s, def.id);
    const rules = `<section class="tlm-panel cup-panel"><h3>Cómo se juega</h3><ul class="tlm-list cup-rules"><li><b>Clasificación:</b> los 8 primeros de la LFO en la jornada ${co.cutRound || cup.cutRound || '—'} y 8 clubes del Continente Viejo${cup.hasPrelim ? ' (los dos últimos invitados juegan una ronda previa por el octavo lugar)' : ''}.</li><li><b>Llaves:</b> ${cup.hasPrelim ? 'ronda previa, ' : ''}octavos, cuartos, semifinales y final, todo a partido único.</li><li><b>Empate a los 90′:</b> penales.</li><li><b>Fechas:</b> ${cup.slots.map((sl, i) => `${esc(br[i].name.toLowerCase())} tras la J${sl}`).join(' · ')}.</li></ul></section>`;
    const k = Math.log2(cup.size), plab = ['Octavos', 'Cuartos', 'Semifinales', 'La final (campeón)'].slice(4 - k);
    const prizes = `<section class="tlm-panel cup-panel"><h3>Premios</h3><ul class="tlm-list">${cup.hasPrelim ? `<li>Ronda previa: <b>${M(def.prelimPrize)}</b></li>` : ''}${def.prizes.slice(4 - k).map((p, i) => `<li>${plab[i]}: <b>${M(p)}</b></li>`).join('')}<li>Subcampeón: <b>${M(def.finalist)}</b></li></ul><p class="muted sm">Se cobra por cada ronda superada.</p></section>`;
    const guestsRows = (ids, prelim) => ids.map((id) => `<li class="${id === u.id ? 'me' : ''}">${crest(s.clubs[id], 18)} ${flag(s.clubs[id])} <b>${esc(s.clubs[id].name)}</b> <small class="muted">${esc(natName(s.clubs[id]))} · rep ${Math.round(s.clubs[id].reputation)}</small>${prelim && prelim.includes(id) ? ' <span class="cmp-tag">RONDA PREVIA</span>' : ''}</li>`).join('');
    if (cup.status === 'qualifying') {
      const q = co.provisional, cutLine = (r, i) => `<tr class="${r.id === u.id ? 'me' : ''}"><td>${r.pos}</td><td class="l">${crest(s.clubs[r.id], 18)} ${esc(s.clubs[r.id].name)}</td><td>${r.played}</td><td><b>${r.points}</b></td></tr>`;
      const gAll = TLM.guestClubs(s);
      return `${hero}<div class="tlm-alert info">La clasificación se cierra en la <b>jornada ${co.cutRound}</b> (${esc(co.cutDate)}) — ${co.cutIn <= 0 ? 'se define esta semana' : when(co.cutIn)}. La copa arranca el <b>${esc(co.startDate)}</b>${co.startsIn > 0 ? ` (${when(co.startsIn)})` : ''}. Estos son los clasificados <b>por el momento</b>.</div>
        <div class="tlm-grid c2"><section class="tlm-panel cup-panel"><h3>Liga LFO · clasificados hoy</h3><table class="tlm-table mini"><tbody>${q.league.map(cutLine).join('')}</tbody></table><p class="muted sm">Los ${q.league.length} primeros de la tabla en la jornada ${co.cutRound}.${co.userIn ? '' : ' Tu club hoy no está entre ellos.'}</p></section>
        <section class="tlm-panel cup-panel"><h3>Continente Viejo · invitados</h3><ul class="tlm-list cup-seeds">${guestsRows(gAll.slice(0, gAll.length - (q.prelim ? 2 : 0)))}${q.prelim ? guestsRows(q.prelim, q.prelim) : ''}</ul><p class="muted sm">Clubes de otros países: no juegan la liga, sólo esta copa.</p></section></div>
        <section class="tlm-panel cup-panel"><h3>Cuadro</h3><p class="muted sm">Se sortea al cerrarse la clasificación: los mejor sembrados enfrentan a los últimos.</p>${bracketHTML(s, u, br)}</section><div class="tlm-grid c2">${rules}${prizes}</div>${history}`;
    }
    const mine = Object.values(s.fixtures).filter((f) => f.cup && f.cup.id === def.id && f.season === cup.season && (f.homeId === u.id || f.awayId === u.id)).sort((a, b) => a.round - b.round);
    const mineNow = TLM.cupPendingFixture(s, u.id), alive = aliveOf(s, cup, u.id), inCup = cup.entrants.includes(u.id) || (cup.qualified && cup.qualified.prelim && cup.qualified.prelim.includes(u.id));
    const stat = cup.champion ? `<div class="tlm-alert info">Campeón: <b>${esc(s.clubs[cup.champion].name)}</b>${cup.champion === u.id ? ' — ¡tu club!' : ''} · Subcampeón: ${esc(s.clubs[cup.runnerUp].name)}</div>`
      : mineNow ? `<div class="tlm-alert bad">Tenés partido de copa pendiente (${esc(mineNow.cup.roundName)}). <button class="tlm-btn sm" data-act="go" data-screen="matchday">Ir al Matchday</button></div>`
      : !inCup ? '<div class="tlm-alert warn">Tu club no clasificó esta temporada. Podés seguir el cuadro.</div>'
      : alive ? `<div class="tlm-alert info">Tu club sigue en la copa. Próxima ronda: <b>${esc(co.nextName || '—')}</b> · ${esc(co.nextDate || '')}.</div>` : '<div class="tlm-alert warn">Tu club quedó eliminado. La copa sigue: podés seguir el cuadro.</div>';
    const path = mine.length ? mine.map((f) => `<li>${esc(f.cup.roundName)}: ${esc(s.clubs[f.homeId].shortName)} ${f.status === 'played' ? `<b>${f.result.hg}–${f.result.ag}</b>${f.result.pens ? ` (p. ${f.result.pens[0]}-${f.result.pens[1]})` : ''}` : 'vs'} ${esc(s.clubs[f.awayId].shortName)}</li>`).join('') : `<li class="muted">${inCup ? 'Todavía no jugaste.' : 'No participás esta temporada.'}</li>`;
    const ents = cup.entrants.filter(Boolean), pre = cup.qualified && cup.qualified.prelim ? cup.qualified.prelim.filter((id) => !ents.includes(id)) : [];
    const seeds = `<section class="tlm-panel cup-panel"><h3>Participantes</h3><ul class="tlm-list cup-seeds">${ents.map((id, i) => `<li class="${id === u.id ? 'me' : ''}">${i + 1}. ${crest(s.clubs[id], 16)} ${flag(s.clubs[id], 11)} ${esc(s.clubs[id].name)}${s.clubs[id].foreign ? ' <span class="cmp-tag">C. VIEJO</span>' : ''}</li>`).join('')}${pre.map((id) => `<li class="muted">${crest(s.clubs[id], 16)} ${esc(s.clubs[id].name)} <span class="cmp-tag">ELIMINADO EN LA PREVIA</span></li>`).join('')}</ul></section>`;
    return `${hero}${stat}<section class="tlm-panel cup-panel"><h3>Cuadro</h3>${bracketHTML(s, u, br)}</section>
      <div class="tlm-grid c3"><section class="tlm-panel cup-panel"><h3>Tu camino</h3><ul class="tlm-list">${path}</ul></section>${prizes}${seeds}</div>${history}`;
  }

  // ---------------------------------------------------------------- detalle: liga
  function leagueDetail(s, u, lo, co) {
    const lg = lo.comp, cupQ = co && co.cup && co.cup.status === 'qualifying' ? co.provisional.league.map((x) => x.id) : co && co.cup && co.cup.qualified ? co.cup.qualified.league : [];
    const rows = lo.table.map((r) => `<tr class="${r.clubId === u.id ? 'me' : ''} ${r.pos === 1 ? 'lead' : ''}"><td>${r.pos === 1 ? '★' : r.pos}</td><td class="l">${crest(s.clubs[r.clubId], 20)} ${esc(s.clubs[r.clubId].name)}${cupQ.includes(r.clubId) ? ' <span class="cmp-tag cup">CUPIDITÉ</span>' : ''}</td><td>${r.played}</td><td>${r.won}</td><td>${r.drawn}</td><td>${r.lost}</td><td>${r.gd > 0 ? '+' : ''}${r.gd}</td><td><b>${r.points}</b></td></tr>`).join('');
    return `<div class="lfo-hero"><span class="cmp-logo lfo big" style="background-image:url('${esc(lg.crest || '')}')"></span><div><h2>${esc(lg.name)}</h2><p>Temporada ${esc(season(s))} · ${lo.total} jornadas · ${plural(lg.teams.length, 'club', 'clubes')}</p></div></div>
      <section class="tlm-panel lfo-panel"><h3>Clasificación</h3><table class="tlm-table"><thead><tr><th>#</th><th>Club</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>PTS</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="muted sm">★ candidato al título · CUPIDITÉ = clasifica (o clasificaría hoy) a La Cupidité.</p><div class="tlm-row"><button class="tlm-btn ghost" data-act="go" data-screen="competition" data-param='{"tab":"scorers"}'>Goleadores</button><button class="tlm-btn ghost" data-act="go" data-screen="competition" data-param='{"tab":"history"}'>Historial de campeones</button><button class="tlm-btn ghost" data-act="go" data-screen="calendar">Calendario</button></div></section>`;
  }

  UI.screens.competitions = () => {
    const c = UI.career, s = c.state, u = c.user;
    TLM.cupEnsure(s);
    const lo = TLM.leagueOverview(s), co = TLM.cupOverview(s, 'cupidite');
    const hot = co.cup.status === 'active' && aliveOf(s, co.cup, u.id) && co.cup.entrants.includes(u.id);
    const tab = UI.params.tab || (hot ? 'cup' : 'lfo');
    return `<h2 class="tlm-h">Competiciones</h2><div class="cmp-cards">${leagueCard(s, u, lo)}${cupCard(s, u, co)}</div>
      <div class="tlm-tabs cmp-tabs"><button class="${tab === 'lfo' ? 'on' : ''}" data-act="go" data-screen="competitions" data-param='{"tab":"lfo"}'>Liga LFO</button><button class="${tab === 'cup' ? 'on cup' : 'cup'}" data-act="go" data-screen="competitions" data-param='{"tab":"cup"}'>La Cupidité</button></div>
      <div class="cmp-detail ${tab}">${tab === 'cup' ? cupDetail(s, u, co) : leagueDetail(s, u, lo, co)}</div>`;
  };
  // compatibilidad con los enlaces viejos (Home, alertas): "cup" abre la pestaña de La Cupidité
  UI.screens.cup = () => { UI.params = Object.assign({}, UI.params, { tab: 'cup' }); return UI.screens.competitions(); };
})(typeof globalThis !== 'undefined' ? globalThis : this);
