/* Eternal Manager · Online: login, registro y lobby de ligas (cliente). */
(function () {
  const DEF = 'http://localhost:8787';
  const MODS = { futbol: 'Fútbol (LFO)', mma: 'Lucha (LLO)', basquet: 'Básquet (LBO)', nfl: 'NFL (LGO)', carreras: 'Carreras (LRO)' };
  let me = null, leagues = [], msg = '', busy = false, cur = null, st = null, poll = null;
  const LIVE = { nfl: '06-nfl-gridiron/dist-live/live.html', basquet: '05-basquet-courtside/courtside-live.html', futbol: '01-futbol/fulbo-live.html', mma: '04-mma/mma-live.html', carreras: '07-carreras-apex/lro-live.html' };
  const MANAGE = { futbol: '01-futbol/fulbo.html' };
  const READY = ['nfl', 'basquet', 'futbol', 'mma', 'carreras'];

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const base = () => { try { return (localStorage.getItem('em-api') || DEF).replace(/\/+$/, ''); } catch { return DEF; } };

  async function api(path, body) {
    const r = await fetch(base() + path, { method: body === undefined ? 'GET' : 'POST', credentials: 'include', headers: body === undefined ? {} : { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(d.error || 'Error ' + r.status); e.status = r.status; throw e; }
    return d;
  }

  async function load() {
    try { me = await api('/api/me'); leagues = (await api('/api/leagues')).leagues; msg = ''; }
    catch (e) { me = null; msg = e.status === 401 ? '' : 'No se pudo conectar con el servidor online (' + base() + ').'; }
  }

  function view() {
    const root = $('page-online'); if (!root) return;
    if (me && cur) return leagueView(root);
    const head = '<div class="welcome"><div><h1>Online <span>ligas y partidos</span></h1><p>Jugá con otros managers: ligas compartidas y partidos en vivo.</p></div></div>';
    const err = msg ? `<p role="alert" style="color:#ff8b9a">${esc(msg)}</p>` : '';
    const server = `<details style="margin-top:10px"><summary>Servidor</summary><div class="inline-form"><input id="onApi" type="url" value="${esc(base())}"><button class="gloss small" id="onApiSave" type="button">Guardar</button></div></details>`;
    if (!me) {
      root.innerHTML = head + `<section class="panel"><div class="panel-title"><svg class="ico"><use href="#i-user"/></svg> Cuenta online</div><div class="panel-body">
        <form id="onAuth"><label class="field" for="onName">USUARIO</label><input id="onName" maxlength="20" required autocomplete="username">
        <label class="field" for="onPass">CONTRASEÑA (mínimo 8 caracteres)</label><input id="onPass" type="password" minlength="8" maxlength="100" required autocomplete="current-password">
        <div class="modal-actions"><button class="gloss small green" data-mode="login">Entrar</button><button class="gloss small purple" data-mode="register" type="button">Crear cuenta</button></div></form>${err}
        <p style="font-size:10px">Esta cuenta es solo para el modo online. No uses una contraseña que ya tengas en otro sitio.</p>${server}</div></section>`;
      const f = $('onAuth');
      const go = (mode) => submit(mode, $('onName').value, $('onPass').value);
      f.onsubmit = (e) => { e.preventDefault(); go('login'); };
      f.querySelector('[data-mode=register]').onclick = () => { if (f.reportValidity()) go('register'); };
    } else {
      const rows = leagues.map((l) => `<div class="shop-item"><div><h3>${esc(MODS[l.module] || l.module)}</h3><p>Código: <b>${esc(l.code)}</b>${l.club ? ' · Club: ' + esc(l.club) : ' · Sin club asignado'}</p></div><button class="gloss small" data-open="${esc(l.id)}" data-mod="${esc(l.module)}">Abrir</button></div>`).join('') || '<p>Todavía no estás en ninguna liga.</p>';
      root.innerHTML = head + `<div class="settings-grid">
        <section class="panel"><div class="panel-title"><svg class="ico"><use href="#i-crown"/></svg> Mis ligas — ${esc(me.name)}</div><div class="panel-body">${rows}${err}<button class="gloss small" id="onLogout">Cerrar sesión</button>${server}</div></section>
        <section class="panel"><div class="panel-title"><svg class="ico"><use href="#i-bolt"/></svg> Crear o unirse</div><div class="panel-body">
          <form id="onCreate"><div class="inline-form"><select id="onMod">${Object.entries(MODS).map(([k, v]) => `<option value="${k}"${READY.includes(k) ? '' : ' disabled'}>${v}${READY.includes(k) ? '' : ' (pronto)'}</option>`).join('')}</select></div><label class="field" for="onWhen">PRIMER PARTIDO</label><input id="onWhen" type="datetime-local" required><label class="field" for="onEvery">CADA CUÁNTO (MINUTOS)</label><input id="onEvery" type="number" min="30" value="1440" required><div class="modal-actions"><button class="gloss small green">Crear liga</button></div></form>
          <form id="onJoin" class="inline-form"><input id="onCode" maxlength="6" placeholder="Código de liga" required style="text-transform:uppercase"><button class="gloss small">Unirme</button></form>
          <p style="font-size:10px">Al crear una liga recibís un código para compartir con tus amigos.</p></div></section></div>`;
      $('onLogout').onclick = async () => { try { await api('/auth/logout', {}); } catch {} me = null; leagues = []; view(); };
      $('onCreate').onsubmit = (e) => { e.preventDefault(); act(() => api('/api/leagues', { module: $('onMod').value, firstKickoff: new Date($('onWhen').value).getTime(), everyMin: +$('onEvery').value })); };
      $('onJoin').onsubmit = (e) => { e.preventDefault(); act(() => api('/api/leagues/join', { code: $('onCode').value })); };
      root.querySelectorAll('[data-open]').forEach((b) => (b.onclick = () => openLeague(b.dataset.open, b.dataset.mod)));
    }
    const sv = $('onApiSave'); if (sv) sv.onclick = () => { try { localStorage.setItem('em-api', $('onApi').value.trim()); } catch {} render(); };
  }

  async function submit(mode, name, password) {
    if (busy) return; busy = true;
    try { await api('/auth/' + mode, { name, password }); await load(); }
    catch (e) { msg = e.message; }
    busy = false; view();
  }
  async function act(fn) {
    if (busy) return; busy = true;
    try { await fn(); await load(); msg = ''; } catch (e) { msg = e.message; }
    busy = false; view();
  }
  async function render() {
    const root = $('page-online');
    if (root && !root.innerHTML) root.innerHTML = '<div class="welcome"><div><h1>Online</h1><p>Conectando con el servidor…</p></div></div>';
    await load(); view();
  }

  const fmt = (ms) => new Date(ms).toLocaleString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const cd = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return (s >= 3600 ? Math.floor(s / 3600) + 'h ' : '') + Math.floor(s / 60) % 60 + 'm ' + (s % 60) + 's'; };
  const LBL = { scheduled: 'PROGRAMADO', open: 'TRANSMISIÓN ABIERTA', live: 'EN VIVO', final: 'FINAL' };

  async function openLeague(id, mod) {
    cur = { id, mod }; st = null; stopPoll(); await refresh(); poll = setInterval(refresh, 4000);
  }
  function stopPoll() { if (poll) clearInterval(poll); poll = null; }
  async function refresh() {
    if (!cur) return stopPoll();
    try { st = await api('/api/league/' + cur.id + '/state'); st.skew = st.now - Date.now(); msg = ''; } catch (e) { msg = e.message; }
    view();
  }
  function teamName(t) { return t ? `${t.city} ${t.mascot}`.trim() : '—'; }
  function leagueView(root) {
    const T = st ? Object.fromEntries(st.teams.map((t) => [t.id, t])) : {};
    const mine = leagues.find((l) => l.id === cur.id);
    const club = mine && mine.club;
    let h = `<div class="welcome"><div><h1>Centro de <span>partidos</span></h1><p>${st ? esc(st.label || 'Temporada finalizada') + ' · ' + st.year : 'Cargando…'}${mine ? ' · Código <b>' + esc(mine.code) + '</b>' : ''}</p></div><button class="gloss small" id="lgBack">← Mis ligas</button></div>`;
    if (msg) h += `<p role="alert" style="color:#ff8b9a">${esc(msg)}</p>`;
    if (st) {
      if (!club) {
        const taken = new Set(Object.keys(st.clubs));
        h += `<section class="panel"><div class="panel-title">Elegí tu club</div><div class="panel-body inline-form">${st.teams.filter((t) => !taken.has(t.id)).map((t) => `<button class="gloss small" data-claim="${esc(t.id)}">${esc(teamName(t))}</button>`).join('') || 'No quedan clubes libres.'}</div></section>`;
      } else h += `<p>Tu club: <b>${esc(teamName(T[club]))}</b>${MANAGE[cur.mod] ? ' <button class="gloss small purple" id="lgManage">Gestionar club</button>' : ''}</p>`;
      const now = Date.now() + st.skew;
      h += `<section class="panel"><div class="panel-title">Partidos de la jornada${st.startAt ? ' · ' + fmt(st.startAt) + ' (' + (now < st.startAt ? 'faltan ' + cd(st.startAt - now) : 'en curso') + ')' : ''}</div><div class="panel-body">`;
      h += st.matches.map((m) => `<div class="shop-item"><div><h3>${m.title ? esc(m.title) : esc(teamName(T[m.home])) + ' <small>vs</small> ' + esc(teamName(T[m.away]))}</h3><p><b>${LBL[m.status]}</b>${m.status === 'final' && m.summary ? ' · ' + esc(m.summary) + (m.method ? ' (' + esc(m.method) + ')' : '') : m.status === 'final' && m.score ? ' · ' + m.score[0] + ' - ' + m.score[1] + (m.method ? ' · ' + esc(m.method) : '') : m.hud && m.hud.text ? ' · ' + esc(m.hud.text) : m.hud ? ' · ' + m.hud.score[0] + ' - ' + m.hud.score[1] + ' · ' + (m.hud.q > 4 ? 'OT' : m.hud.q + 'T') + ' ' + esc(m.hud.time) : ''}${m.viewers ? ' · ' + m.viewers + ' mirando' : ''}${club && (m.home === club || m.away === club || (m.entrants || []).includes(club)) ? ' · <i>tu partido</i>' : ''}</p></div>${m.status === 'open' || m.status === 'live' ? `<button class="gloss small green" data-watch="${esc(m.id)}">${club && (m.home === club || m.away === club || (m.entrants || []).includes(club)) ? 'Dirigir' : 'Ver'}</button>` : ''}</div>`).join('') || '<p>No hay partidos programados.</p>';
      h += `</div></section><section class="panel"><div class="panel-title">Tabla</div><div class="panel-body"><table style="width:100%;font-size:12px"><tr><th align="left">#</th><th align="left">Equipo</th>${((st.standings[0] && st.standings[0].cols) || ['G', 'P', 'E', 'Dif']).map((c) => '<th>' + esc(c) + '</th>').join('')}</tr>${st.standings.map((r) => `<tr><td>${r.rank}</td><td>${esc(teamName(T[r.id]))}${st.clubs[r.id] ? ' · ' + esc(st.clubs[r.id]) : ''}</td><td align="center">${r.w}</td><td align="center">${r.l}</td><td align="center">${r.t}</td><td align="center">${r.diff}</td></tr>`).join('')}</table></div></section>`;
      if (st.results.length) h += `<section class="panel"><div class="panel-title">Resultados</div><div class="panel-body">${st.results.slice().reverse().map((r) => `<p>Sem. ${r.week}: ${r.text ? esc(r.text) : esc(teamName(T[r.home])) + ' ' + r.score[0] + ' - ' + r.score[1] + ' ' + esc(teamName(T[r.away])) + (r.method ? ' · ' + esc(r.method) : '')}</p>`).join('')}</div></section>`;
    }
    root.innerHTML = h;
    $('lgBack').onclick = () => { stopPoll(); cur = null; render(); };
    root.querySelectorAll('[data-claim]').forEach((b) => (b.onclick = async () => { try { await api('/api/league/' + cur.id + '/claim', { club: b.dataset.claim }); await load(); await refresh(); } catch (e) { msg = e.message; view(); } }));
    root.querySelectorAll('[data-watch]').forEach((b) => (b.onclick = () => watch(b.dataset.watch)));
    const gm = $('lgManage'); if (gm) gm.onclick = () => manage();
  }
  function manage() {
    const src = MANAGE[cur.mod]; if (!src) return;
    const ov = document.createElement('div'); ov.id = 'emManage';
    ov.style.cssText = 'position:fixed;inset:0;z-index:9998;background:#000;display:flex;flex-direction:column';
    ov.innerHTML = `<button class="gloss small" style="align-self:flex-end;margin:6px">Cerrar gestión ✕</button><iframe style="flex:1;border:0;width:100%" allow="fullscreen" src="${src}?mgr=online&api=${encodeURIComponent(base())}&league=${encodeURIComponent(cur.id)}"></iframe>`;
    ov.querySelector('button').onclick = () => { ov.remove(); refresh(); };
    document.body.append(ov);
  }
  window.addEventListener('message', (e) => { const d = e.data; if (d && d.type === 'em-online-watch' && cur) { const m = document.getElementById('emManage'); if (m) m.remove(); watch(d.match); } });
  function watch(matchId) {
    const src = LIVE[cur.mod]; if (!src) return;
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000;display:flex;flex-direction:column';
    ov.innerHTML = `<button class="gloss small" style="align-self:flex-end;margin:6px">Cerrar transmisión ✕</button><iframe style="flex:1;border:0;width:100%" allow="fullscreen" src="${src}?api=${encodeURIComponent(base())}&league=${encodeURIComponent(cur.id)}&match=${encodeURIComponent(matchId)}"></iframe>`;
    ov.querySelector('button').onclick = () => ov.remove();
    document.body.append(ov);
  }

  window.EMOnline = { render, api, get me() { return me; }, openLeague };
})();
