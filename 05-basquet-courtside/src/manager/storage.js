import { ROSTER } from './roster-data.js';
const KEY = 'courtside-manager-v1';
export function saveGame(g) { try { localStorage.setItem(KEY, JSON.stringify(g.toJSON())); return true; } catch (e) { return false; } }
export function loadRaw() { try { const t = localStorage.getItem(KEY); const o = t ? JSON.parse(t) : null; return o && o.rosterV === ROSTER.version ? o : null; } catch (e) { return null; } }   // guardados con la base de jugadores anterior: se descartan
export function clearSave() { try { localStorage.removeItem(KEY); } catch (e) { /* almacenamiento no disponible */ } }
