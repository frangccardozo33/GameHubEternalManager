/* ---------- ONLINE (se anexa al final del juego de música, ver gen-online.py) ----------
   El estado y el reloj son del servidor: 1 día de juego = 1 hora real, sin pausa ni botón de pasar el día. Las acciones del jugador se
   mandan al servidor (que las valida y las aplica) y la pantalla se refresca con el estado que devuelve. */
(function () {
  const QS = new URLSearchParams(location.search), API = (QS.get('api') || 'http://localhost:8787').replace(/\/+$/, ''), LEAGUE = QS.get('league'), base = `${API}/api/league/${encodeURIComponent(LEAGUE)}`;
  let rev = window.EM_REV || 0, busy = false;
  const call = async (path, body) => {
    const r = await fetch(base + path, body ? { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : { credentials: 'include' });
    const d = await r.json().catch(() => ({})); if (!r.ok && !d.reason) throw new Error(d.error || 'Error de conexión'); return d;
  };
  async function reload() {
    const d = await call('/career'); if (!d.state) return; rev = d.rev; state = d.state; render();
    if (state.event && !modal) openEvent();
  }
  async function cmd(op, args) {
    if (busy) return null; busy = true;
    try {
      const r = await call('/cmd', { op, args: args || [] });
      if (r.ok === false) toast(r.reason || (r.result && r.result.msg) || 'No se pudo completar la acción');
      else if (r.result && r.result.msg) toast(r.result.msg);
      await reload(); return r;
    } catch (e) { toast(e.message); return null; } finally { busy = false; }
  }
  // acciones del original -> órdenes al servidor
  exploreScene = () => cmd('explore');
  scoutProspect = (id) => cmd('scout', [id]);
  signProspect = async (id) => { const r = await cmd('sign', [id]); if (r && r.ok !== false) navigate('artists'); };
  artistAction = async (id, type) => { await cmd('artistAction', [id, type]); closeModal(); };
  renameArtist = (id) => { const v = document.getElementById('artist-name').value.trim(); if (!v) return toast('El nombre no puede estar vacío.'); cmd('rename', [id, v]); };
  submitProduction = async (e) => {
    e.preventDefault(); const c = getDraft(), r = await cmd('produce', [draftArtist, c]);
    if (r && r.ok !== false && r.result && r.result.songId) { closeModal(); openRhythmGame(r.result.songId); }
  };
  finalizeRhythm = async (score, songId) => { await cmd('rhythm', [songId, score]); closeModal(true); render(); };
  bookTour = async (id) => { const b = +document.getElementById('tour-budget').value; const r = await cmd('tour', [id, b]); if (r && r.ok !== false) closeModal(); };
  sponsor = () => cmd('sponsor');
  resolveEvent = async (i) => { await cmd('event', [i]); closeModal(true); };
  confirmReset = importSave = exportSave = () => toast('No está disponible en el modo online.');
  save = () => {}; resetTimer = () => {}; togglePlay = () => {}; setSpeed = () => {};
  const _renderTop = renderTop;
  renderTop = function () {
    _renderTop(); const o = state.online || {};
    const s = document.getElementById('sim-status'); if (s) s.textContent = o.finished ? 'Temporada terminada' : `Día ${state.day} de ${o.seasonDays} · 1 día = 1 hora`;
    const d = document.getElementById('status-dot'); if (d) d.style.background = o.finished ? '#8b8397' : 'var(--green)';
  };
  // ranking de sellos (todos los jugadores compiten en el mismo chart)
  window.rankingPage = function () {
    const o = state.online || { ranking: [], seasonDays: 100 }, pct = Math.min(100, Math.round((state.day - 1) / o.seasonDays * 100));
    return `<div class="page-heading"><div><h1>Ranking de sellos</h1><p>${o.finished ? 'La temporada terminó: este es el ranking final.' : `Día ${state.day} de ${o.seasonDays} · el tiempo corre solo (1 día de juego = 1 hora real).`} Se ordena por streams totales.</p></div></div>
      <section class="panel" style="padding:14px"><div style="height:8px;background:#26262e;border-radius:6px;overflow:hidden"><div style="width:${pct}%;height:100%;background:var(--purple)"></div></div>
      <div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>#</th><th>Sello</th><th>Streams totales</th><th>Ingresos</th><th>Hoy</th><th>Temas</th><th>En el Top 100</th><th>Mejor puesto</th><th>Caja</th></tr></thead><tbody>${o.ranking.map((r, i) => `<tr style="${r.id === o.me ? 'background:#22203a' : ''}"><td>${i + 1}</td><td><b>${esc(r.name)}</b>${r.id === o.me ? ' <span class="badge">TÚ</span>' : ''}</td><td>${fmt(r.streams)}</td><td>${money(r.revenue)}</td><td>${fmt(r.daily)}</td><td>${r.songs}</td><td>${r.top100}</td><td>${r.bestRank >= 1000 ? '—' : '#' + r.bestRank}</td><td>${money(r.cash)}</td></tr>`).join('') || '<tr><td colspan="9">Todavía no hay sellos.</td></tr>'}</tbody></table></div></section>`;
  };
  // el mundo avanza en el servidor: se trae el estado nuevo cada tanto (sin molestar si hay una ventana abierta)
  setInterval(async () => { try { const d = await call('/rev'); if (d.rev !== rev && !busy && !modal) await reload(); } catch (e) {} }, 15000);
  renderTop(); render(); if (state.event) openEvent();
})();
