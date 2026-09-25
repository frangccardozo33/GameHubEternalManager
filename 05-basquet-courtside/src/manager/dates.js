// Fechas de calendario: la temporada 1 arranca el 22 de octubre de 2026 y hay jornada cada 2 días; los playoffs siguen a la liga.
export const dateOfDay = (season, day) => new Date(Date.UTC(2026 + (season - 1), 9, 22 + Math.max(0, day) * 2));
export const fmtDay = (season, day, short = false) => dateOfDay(season, day).toLocaleDateString('es-ES', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', ...(short ? {} : { year: 'numeric' }) });
