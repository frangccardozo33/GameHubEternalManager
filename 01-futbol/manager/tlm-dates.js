/* LFO MANAGER — fechas de calendario. Cada jornada tiene fecha real: la temporada arranca el primer sábado desde el 15 de agosto del año inicial,
   una jornada por semana (sábados) y un receso invernal de 3 semanas a mitad de campeonato. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  function dateOfRound(season, round, total) {
    const half = Math.floor((total || 38) / 2), days = (Math.max(1, round) - 1) * 7 + (round > half ? 21 : 0);
    const first = new Date(Date.UTC(season, 7, 15)), toSat = (6 - first.getUTCDay() + 7) % 7; // primer sábado desde el 15 de agosto
    return new Date(Date.UTC(season, 7, 15 + toSat + days));
  }
  function roundDateStr(season, round, total, short) {
    const d = dateOfRound(season, round || 1, total);
    const opts = short ? { weekday: 'short', day: 'numeric', month: 'short' } : { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return d.toLocaleDateString('es-AR', Object.assign({ timeZone: 'UTC' }, opts));
  }
  Object.assign(TLM, { dateOfRound, roundDateStr });
})(window);
