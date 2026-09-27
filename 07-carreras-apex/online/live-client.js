// Conductor de la transmisión online de carreras (se anexa a live/live-main.js, ver gen-live.py): corre el MISMO motor que el servidor
// (window.LROE, de live/engine.js) con el reloj del servidor. La previa, el estudio, los anuncios y la interfaz son los de siempre.
(function () {
  'use strict';
  const H = window.LRO_LIVE_HELLO, ws = window.LRO_LIVE_WS, status = window.LRO_LIVE_STATUS || (() => {});
  const E = window.LROE, PRE_MS = 60e3, skew = window.LRO_LIVE_SKEW || 0;
  const send = (o) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); };
  let ls = null, preDone = false, side = H.side, actions = (H.actions || []).map((a) => ({ ...a })), fixes = [];
  const known = new Set(actions.map((a) => JSON.stringify(a)));

  function resync() {
    let last = 0; try { last = +sessionStorage.getItem('lro-resync') || 0; } catch (e) {}
    if (Date.now() - last < 15000) return;
    try { sessionStorage.setItem('lro-resync', String(Date.now())); } catch (e) {}
    location.reload();
  }
  function askSnap() {
    const now = Date.now(); fixes = fixes.filter((t) => now - t < 60000);
    if (fixes.length >= 6) return resync();
    fixes.push(now); send({ type: 'snap' });
  }
  function addActions(list) {
    for (const a of list) {
      const key = JSON.stringify(a); if (known.has(key)) continue; known.add(key);
      if (ls) { ls.addAction(a); if (ls.lateAction(a)) resync(); } else { actions.push(a); actions.sort((x, y) => x.step - y.step); }
    }
  }
  function onMsg(d) {
    if (d.type === 'hello') { if (H) addActions(d.actions || []); }
    else if (d.type === 'action') addActions([d.a]);
    else if (d.type === 'sync') {
      const mine = ls && ls.sigs.get(d.step);
      if (mine !== undefined && mine !== d.sig) { console.warn('DESYNC', d.step); window.__desync = { step: d.step, mine, srv: d.sig }; askSnap(); }
    } else if (d.type === 'snap') { if (ls) { const df = []; applySnap(E, d.snap, df); ls.rewind(d.step, d.st); window.__snapdiff = df; console.warn('SNAP', d.step, JSON.stringify(df.slice(0, 20))); } }
    else if (d.type === 'final') window.LRO_LIVE_FINISHED = true;
    else if (d.type === 'error') { status(d.error); setTimeout(() => status(''), 3000); }
  }
  window.LRO_LIVE_MSG = onMsg;
  (window.LRO_LIVE_QUEUE || []).splice(0).forEach(onMsg);

  window.LRO_LIVE = {
    get teamId() { return side >= 0 && E.state.cars[side] ? E.state.cars[side].team.id : -1; },
    cmd(cmd, val) { if (side < 0) return status('Solo el equipo puede dar órdenes'); send({ type: 'act', a: { k: 'cmd', cmd, val } }); },
    pump() {
      const t = Date.now() + skew;
      if (!ls) { if (!(preDone && t >= H.startAt)) return; E.beginRace(); ls = new Lockstep(E, H.startAt, actions); status(''); }
      ls.advanceTo(t);
    },
  };

  async function start() {
    E.seedRng(H.cfg.seed); E.setSimT(0); E.qualify();
    if (window.GameUI) GameUI.showScreen('race');
    const now = Date.now() + skew, toKick = H.startAt - now;
    if (toKick <= 0) { // ya empezó: se pone al día antes de mostrar nada
      status('Poniéndose al día con la carrera…');
      E.beginRace(); ls = new Lockstep(E, H.startAt, actions);
      await new Promise((res) => { const go = () => { const more = ls.advanceTo(Date.now() + skew); if (more) setTimeout(go, 0); else res(); }; go(); });
      preDone = true; status('');
      return;
    }
    if (toKick > PRE_MS) { status(`La transmisión empieza en ${Math.ceil((toKick - PRE_MS) / 1000)} s…`); await new Promise((r) => setTimeout(r, toKick - PRE_MS)); status(''); }
    if (window.LROstudio) window.LROstudio.pre(E.track, () => { preDone = true; }); else preDone = true;
  }
  start().catch((e) => { console.error(e); status('No se pudo abrir la transmisión.'); });
})();
