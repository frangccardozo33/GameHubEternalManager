'use strict';
// Transmisión de LRO (assets/broadcast/broadcast.js): placas de eventos y estudio (previa, mitad de carrera y post-carrera).
// Es solo texto en pantalla, como el estudio del fútbol; no hay relato ni voz durante la carrera.
(function () {
  if (!window.Broadcast) return;
  let bc = null, preKey = '';
  function ensure() {
    if (bc && bc.layer.isConnected) return bc;
    const mount = document.querySelector('.broadcast'); if (!mount) return null;
    try { window.Broadcast.setBase(new URL('../assets/', location.href).href); bc = window.Broadcast.attach({ id: 'lro', sport: 'carreras', mount, accent: '#ff4b3e', logo: 'logos/lro-sm.png', league: 'Liga Racing Online' }); } catch (e) { console.warn('Transmisión no disponible', e); }
    return bc;
  }
  const ord = (n) => ['', 'primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'séptimo', 'octavo', 'noveno', 'décimo'][n] || 'puesto ' + n;
  const name = (c) => c.driver.name || c.driver.short;
  const PLATES = { '¡LARGARON!': 'LARGADA', 'CAMBIO DE LÍDER': 'NUEVO LÍDER', 'VUELTA RÁPIDA': 'VUELTA RÁPIDA', 'SPIN': 'TROMPO', 'ABANDONO MECÁNICO': 'ABANDONO', 'SAFETY CAR': 'SAFETY CAR', 'SAFETY CAR VIRTUAL': 'SAFETY CAR VIRTUAL', 'BANDERA ROJA': 'BANDERA ROJA', 'ÚLTIMA VUELTA': 'ÚLTIMA VUELTA', 'BANDERA A CUADROS': 'BANDERA A CUADROS' };
  window.LROcast = function (title, detail) {
    const t = PLATES[title]; if (!t) return; const b = ensure(); if (!b) return;
    b.plate(t, String(detail || '').replace(/ · P\d+$/, ''), '#c8362b');
  };
  const cars = () => (typeof state !== 'undefined' && state.order ? state.order : []);
  window.LROstudio = {
    // antes de la largada: pista y candidatos; llama a then() al terminar (una vez por carrera)
    pre(track, then) {
      const b = ensure(), key = track.id + '|' + (typeof Career !== 'undefined' ? Career.season + '-' + Career.roundIndex : '');
      if (!b || key === preKey) { then(); return; }
      preKey = key; const o = cars();
      b.studio({ kind: 'pre', onDone: then, lines: [
        ['A', `Bienvenidos a ${track.name}, en ${track.region || track.country}.`],
        ['B', `${track.lengthKm.toFixed(2).replace('.', ',')} kilómetros y ${track.corners} curvas: el desgaste de neumáticos va a marcar la estrategia.`],
        o.length >= 3 ? ['A', `Largan primero ${name(o[0])}, ${name(o[1])} y ${name(o[2])}.`] : null,
        ['B', `Probabilidad de lluvia: ${Math.round(track.wetChance * 100)} %. Temperatura de referencia, ${track.tempBase} grados.`]].filter(Boolean) });
    },
    // a mitad de carrera (pausa la carrera mientras habla el estudio)
    half() {
      const b = ensure(); if (!b) return; const o = cars(); if (o.length < 3) return;
      const was = state.paused; state.paused = true;
      b.studio({ kind: 'half', onDone: () => { state.paused = was; }, lines: [
        ['A', `Mitad de carrera: lidera ${name(o[0])}, seguido por ${name(o[1])} y ${name(o[2])}.`],
        ['B', state.fastestCarId != null && state.cars[state.fastestCarId] ? `La vuelta rápida hasta ahora es de ${name(state.cars[state.fastestCarId])}.` : 'Todavía no hay una vuelta rápida clara.'],
        ['B', 'Ahora empiezan a pesar las paradas y el estado de los neumáticos.']] });
    },
    // al terminar: llama a then() (los resultados) cuando cierra el estudio; devuelve true si lo mostró
    post(then) {
      const b = ensure(); const f = typeof state !== 'undefined' ? state.finishes : []; if (!b || !f || f.length < 3) return false;
      b.studio({ kind: 'post', onDone: then, lines: [
        ['A', `Ganó ${name(f[0])} (${f[0].team.name}). Segundo, ${name(f[1])}; tercero, ${name(f[2])}.`],
        state.fastestCarId != null && state.cars[state.fastestCarId] ? ['B', `La vuelta rápida fue de ${name(state.cars[state.fastestCarId])}.`] : null,
        ['B', 'La tabla del campeonato se mueve. Ahora, el resumen de la carrera.']].filter(Boolean) });
      return true;
    },
  };
})();
