// Calendario de las ligas online: cada módulo juega una jornada por día, a su horario (hora de Argentina, UTC-3), y los partidos de la
// jornada van uno atrás del otro: primero los de dos DT humanos, después los de un DT humano contra la IA y al final los de IA contra IA.
// Copas, playoffs y torneos usan el mismo horario: cada ronda es una "jornada" más, así que si un día toca copa la liga se corre un día.
// Funciones puras (sin estado del Durable Object) para poder probarlas en Node.

const DAY = 86400000, TZ_MS = 3 * 3600e3;           // Argentina: UTC-3 todo el año (sin horario de verano)
export const PRE_MS = { futbol: 200e3, basquet: 300e3, nfl: 300e3, mma: 90e3, carreras: 60e3 };   // duración de la previa (presentación, estudio, anuncios)
export const POST_MS = 45e3;                         // pausa entre el final de un partido y la apertura de la transmisión del siguiente

// [hora, minuto] de apertura de la transmisión del primer partido, según el día de la semana (0 = domingo)
const START = { futbol: (dow) => (dow >= 1 && dow <= 5 ? [12, 20] : [18, 0]), basquet: () => [15, 0], nfl: () => [13, 0], mma: () => [17, 0], carreras: () => [19, 0] };

export const dayIndex = (t) => Math.floor((t - TZ_MS) / DAY);                       // día local (Argentina) de un instante
export function slotOf(module, day) {                                               // instante UTC en que abre el primer partido de ese día
  const dow = new Date(day * DAY).getUTCDay(), [h, m] = (START[module] || START.futbol)(dow);
  return day * DAY + (h * 60 + m) * 60e3 + TZ_MS;
}
// primer día cuyo horario es igual o posterior a `t` (la liga arranca en el primer horario disponible desde la fecha elegida)
export function firstDay(module, t) { const d = dayIndex(t); return slotOf(module, d) >= t ? d : d + 1; }

// Orden de los partidos de una jornada: 2 DT humanos, 1 DT humano, ninguno; dentro de cada grupo se respeta el orden original.
export function orderMatches(matches, humans) {
  const H = new Set(humans), n = (m) => [...new Set([m.home, m.away, ...(m.entrants || [])])].filter((c) => H.has(c)).length;
  return matches.filter((m) => !m.played).map((m, i) => ({ id: m.id, k: Math.min(2, n(m)), i })).sort((a, b) => b.k - a.k || a.i - b.i).map((x) => x.id);
}
