/* Aurum Casino · Online: ruleta multijugador en vivo, sportsbook (apuestas sobre fútbol/básquet/NFL online) y
   ranking entre jugadores. Usa la misma cuenta y servidor que la pestaña "Online" del hub (server/src/casino-do.js).
   Si no hay sesión online, muestra un aviso en vez de la mesa; el resto del casino (juegos locales) sigue igual. */
(function () {
  'use strict';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '$' + Math.round(n).toLocaleString('es-AR');
  const base = () => { try { return (localStorage.getItem('em-api') || 'http://localhost:8787').replace(/\/+$/, ''); } catch { return 'http://localhost:8787'; } };
  const api = async (path, body) => {
    const r = await fetch(base() + path, { method: body === undefined ? 'GET' : 'POST', credentials: 'include', headers: body === undefined ? {} : { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
    const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'Error ' + r.status); return d;
  };
  const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
  const MODS = { futbol: 'Fútbol', basquet: 'Básquet', nfl: 'NFL' };

  let me = null, ws = null, wsTries = 0, view = null; // view: 'roulette' | 'sports' | null (qué hay abierto en el modal)
  const S = { balance: 0, roulette: null, leaderboard: [], bets: [], sportsLeagues: null };

  function connect() {
    if (ws) return;
    const url = base().replace(/^http/, 'ws') + '/api/casino/ws';
    try { ws = new WebSocket(url); } catch { ws = null; return; }
    ws.onopen = () => { wsTries = 0; };
    ws.onmessage = (e) => { let d; try { d = JSON.parse(e.data); } catch { return; } onMsg(d); };
    ws.onclose = () => { ws = null; if (me) setTimeout(connect, Math.min(15000, 1000 * ++wsTries)); };
    ws.onerror = () => {};
  }
  function send(m) { try { ws && ws.readyState === 1 && ws.send(JSON.stringify(m)); } catch {} }

  function onMsg(d) {
    if (d.type === 'hello') { S.balance = d.balance; S.roulette = d.roulette; S.leaderboard = d.leaderboard || []; S.bets = d.bets || []; render(); return; }
    if (d.type === 'round') { S.roulette = d.roulette; render(); return; }
    if (d.type === 'spin') { if (S.roulette) S.roulette.number = d.number; render(true); return; }
    if (d.type === 'ack' || d.type === 'settle') { S.balance = d.balance; if (d.type === 'settle' && typeof window.toast === 'function') window.toast((d.net >= 0 ? '¡Ganaste ' : 'Perdiste ') + money(Math.abs(d.net)) + ' (online)', d.net < 0); render(); return; }
    if (d.type === 'sportsbetResult') { if (d.ok) { S.balance = d.balance; if (typeof window.toast === 'function') window.toast('Apuesta registrada'); loadSportsbook(true); } else if (typeof window.toast === 'function') window.toast(d.reason || 'No se pudo apostar', true); return; }
    if (d.type === 'error') { if (typeof window.toast === 'function') window.toast(d.error, true); return; }
    if (d.type === 'bigwin') { if (typeof window.toast === 'function') window.toast(d.text); return; } // se ve mientras estás en el módulo de casino
  }

  async function ensureSession() {
    if (me !== null) return me;
    try { me = await api('/api/me'); connect(); } catch { me = false; }
    return me;
  }

  // ---------------------------------------------------------------- ruleta multijugador
  function pickKey(p) { return p.type + ':' + p.value; }
  let selected = null, amount = 100;
  function rouletteHtml() {
    const r = S.roulette, phase = r ? r.phase : 'betting', msLeft = r ? Math.max(0, r.msLeft) : 0;
    const numbers = [...Array(37).keys()];
    const board = numbers.map((n) => `<button type="button" class="number-bet ${n === 0 ? 'zero' : RED.has(n) ? 'red' : ''} ${selected && selected.type === 'number' && selected.value === n ? 'selected' : ''}" data-pick="number:${n}">${n}</button>`).join('');
    const quick = [['color:red', 'Rojo (x2)'], ['color:black', 'Negro (x2)'], ['parity:even', 'Par (x2)'], ['parity:odd', 'Impar (x2)'], ['half:low', '1-18 (x2)'], ['half:high', '19-36 (x2)']]
      .map(([k, l]) => `<button type="button" class="${selected && pickKey(selected) === k ? 'selected' : ''}" data-pick="${k}">${l}</button>`).join('');
    const players = (r && r.players || []).map((p) => `<span class="tag" style="display:inline-block;margin:2px 4px 0 0">${esc(p.name)} · ${money(p.total)}</span>`).join('') || '<span class="muted">Sé el primero en apostar esta ronda.</span>';
    return `<div class="game-layout"><div class="game-stage"><div class="coin" style="width:120px;height:120px;font-size:40px">${r && r.number != null ? r.number : '?'}</div>
      <p class="stage-label">${phase === 'betting' ? 'Apostando · cierra en ' + Math.ceil(msLeft / 1000) + 's' : 'Girando…'}</p>
      <div class="roulette-board">${board}</div><div class="roulette-options">${quick}</div>
      <p class="game-rules" style="margin-top:12px">En mesa ahora: ${players}</p></div>
      <div class="bet-panel"><div class="field-label"><span>Saldo online</span><b>${money(S.balance)}</b></div>
      <div class="bet-input-wrap"><input type="number" min="1" max="2000" value="${amount}" id="ro-amount"></div>
      <div class="bet-shortcuts"><button type="button" data-amt="50">$50</button><button type="button" data-amt="100">$100</button><button type="button" data-amt="500">$500</button><button type="button" data-amt="2000">$2000</button></div>
      <button type="button" class="gold-button" id="ro-bet" ${phase !== 'betting' ? 'disabled' : ''}>Apostar</button>
      <p class="game-rules">Ruleta europea (0-36). Número lleno paga 35x; color/par-impar/mitad pagan 1x. Cierra la ronda cada ~18s; tu apuesta se juega contra otros jugadores conectados en este momento, no contra la banca local.</p></div></div>`;
  }
  function wireRoulette() {
    const host = document.getElementById('modal-content'); if (!host) return;
    host.querySelectorAll('[data-pick]').forEach((b) => (b.onclick = () => { const [type, raw] = b.dataset.pick.split(':'); selected = { type, value: type === 'number' ? +raw : raw }; renderModal(); }));
    host.querySelectorAll('[data-amt]').forEach((b) => (b.onclick = () => { amount = +b.dataset.amt; renderModal(); }));
    const inp = document.getElementById('ro-amount'); if (inp) inp.oninput = () => { amount = Math.max(1, Math.min(2000, +inp.value || 1)); };
    const bet = document.getElementById('ro-bet'); if (bet) bet.onclick = () => { if (!selected) { window.toast && window.toast('Elegí un número o una opción primero', true); return; } send({ type: 'bet', amount, pick: selected }); };
  }
  function openRoulette() {
    view = 'roulette'; selected = null;
    ensureSession().then((ok) => {
      if (!ok) return showLoginPrompt('Ruleta Multijugador', 'RULETAS · EN VIVO');
      window.showModal('Ruleta Multijugador', 'RULETAS · EN VIVO', rouletteHtml());
      wireRoulette();
    });
  }

  // ---------------------------------------------------------------- sportsbook
  async function loadSportsbook(silent) {
    try {
      const { leagues } = await api('/api/leagues');
      const usable = leagues.filter((l) => ['futbol', 'basquet', 'nfl'].includes(l.module));
      const out = [];
      for (const l of usable) {
        try { const st = await api('/api/league/' + l.id + '/state'); out.push({ league: l, matches: (st.matches || []).filter((m) => m.status !== 'final').slice(0, 12), teams: Object.fromEntries((st.teams || []).map((t) => [t.id, t])) }); } catch {}
      }
      S.sportsLeagues = out;
    } catch { S.sportsLeagues = []; }
    if (!silent && view === 'sports') renderModal();
    else if (view === 'sports') renderModal();
  }
  function sportsbookHtml() {
    if (S.sportsLeagues == null) return '<div class="game-stage"><p>Cargando tus ligas…</p></div>';
    const rows = [];
    for (const { league, matches, teams } of S.sportsLeagues) {
      for (const m of matches) {
        const home = teams[m.home], away = teams[m.away];
        rows.push(`<div class="item" style="border:1px solid #ffffff10;border-radius:8px;padding:10px;margin-bottom:8px">
          <b>${esc(MODS[league.module] || league.module)}</b> · ${esc(home ? home.name : m.home)} vs ${esc(away ? away.name : m.away)}
          <div class="button-row" style="margin-top:6px"><button type="button" class="action-button" data-bet="${league.id}|${m.id}|${league.module}|home">Local (x1.8)</button>${league.module === 'futbol' ? `<button type="button" class="action-button" data-bet="${league.id}|${m.id}|${league.module}|draw">Empate (x3)</button>` : ''}<button type="button" class="action-button" data-bet="${league.id}|${m.id}|${league.module}|away">Visitante (x1.8)</button></div></div>`);
      }
    }
    const mine = S.bets.map((b) => `<tr><td>${esc(MODS[b.module] || b.module)}</td><td>${esc(b.side)}</td><td>${money(b.amount)}</td><td>${b.status === 'pending' ? 'Pendiente' : b.payout > 0 ? 'Ganada · ' + money(b.payout) : 'Perdida'}</td></tr>`).join('');
    return `<div class="game-layout"><div class="game-stage" style="align-items:stretch;overflow:auto"><div style="width:100%">${rows.join('') || '<p class="muted">No tenés partidos pendientes en tus ligas online de fútbol, básquet o NFL.</p>'}</div></div>
      <div class="bet-panel"><div class="field-label"><span>Saldo online</span><b>${money(S.balance)}</b></div>
      <div class="bet-input-wrap"><input type="number" min="1" max="2000" value="${amount}" id="sb-amount"></div>
      <p class="game-rules">Elegí el resultado y el monto, después tocá una de las opciones del partido para confirmar la apuesta. Se liquida sola cuando el partido termina.</p>
      ${mine.length ? `<table class="history-table"><thead><tr><th>Módulo</th><th>Lado</th><th>Monto</th><th>Estado</th></tr></thead><tbody>${mine}</tbody></table>` : ''}</div></div>`;
  }
  function wireSportsbook() {
    const host = document.getElementById('modal-content'); if (!host) return;
    const inp = document.getElementById('sb-amount'); if (inp) inp.oninput = () => { amount = Math.max(1, Math.min(2000, +inp.value || 1)); };
    host.querySelectorAll('[data-bet]').forEach((b) => (b.onclick = () => { const [league, match, module, side] = b.dataset.bet.split('|'); send({ type: 'sportsbet', league, match, module, side, amount }); }));
  }
  function openSportsbook() {
    view = 'sports'; S.sportsLeagues = null;
    ensureSession().then((ok) => {
      if (!ok) return showLoginPrompt('Apuestas Deportivas', 'SPORTSBOOK · EN VIVO');
      window.showModal('Apuestas Deportivas', 'SPORTSBOOK · FÚTBOL · BÁSQUET · NFL', sportsbookHtml());
      wireSportsbook();
      loadSportsbook();
    });
  }

  // ---------------------------------------------------------------- torneo / ranking
  let leaderboardLoaded = false;
  function leaderboardBody() {
    const rows = S.leaderboard.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.name)}</td><td>${money(r.won_total || 0)}</td><td>${r.big_wins || 0}</td></tr>`).join('');
    return rows ? `<table class="history-table"><thead><tr><th>#</th><th>Jugador</th><th>Ganado</th><th>Victorias grandes</th></tr></thead><tbody>${rows}</tbody></table>` : '<p class="muted">Todavía nadie jugó las mesas online. ¡Sé el primero!</p>';
  }
  function tournamentsHtml() {
    if (!leaderboardLoaded && !me) {
      leaderboardLoaded = true;
      api('/api/casino/leaderboard').then((d) => { S.leaderboard = d.leaderboard || []; const host = document.getElementById('modal-content'); if (host && document.getElementById('modal-title')?.textContent === 'Torneos del Club') host.innerHTML = tournamentsHtml(); }).catch(() => {});
    }
    return `<div style="padding:0"><h3 style="margin-top:0">Ranking del casino online</h3><p class="muted">Quién más ganó jugando la ruleta multijugador y el sportsbook con todos los jugadores conectados. Se actualiza solo.</p>${leaderboardBody()}</div>`;
  }

  function showLoginPrompt(title, sub) {
    window.showModal(title, sub, `<div class="coming" style="margin:auto">${window.icon ? window.icon('crown') : ''}<div class="construction">CONECTATE A TU CUENTA ONLINE</div><h3>Necesitás una cuenta online</h3><p>Entrá con tu cuenta online desde la pestaña "Online" del hub (arriba en el menú) y volvé a esta mesa: se conecta sola.</p></div>`);
  }
  function renderModal() {
    const host = document.getElementById('modal-content'); if (!host || !document.getElementById('modal').classList.contains('open')) return;
    host.innerHTML = view === 'roulette' ? rouletteHtml() : view === 'sports' ? sportsbookHtml() : '';
    if (view === 'roulette') wireRoulette(); else if (view === 'sports') wireSportsbook();
  }
  function render(soft) { if (view === 'roulette' || view === 'sports') renderModal(); }

  window.CasinoOnline = { openRoulette, openSportsbook, tournamentsHtml, closeView: () => { view = null; }, get connected() { return !!me; } };
  ensureSession();
  window.addEventListener('beforeunload', () => { try { ws && ws.close(); } catch {} });
})();
