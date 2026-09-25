import { League } from './league.js';
const KEY = 'gridiron-manager-v1';
export function hasSave() { try { return !!localStorage.getItem(KEY); } catch { return false; } }
export function save(league) { try { localStorage.setItem(KEY, league.serialize()); return true; } catch (e) { console.warn('No se pudo guardar', e); return false; } }
export function load() { try { const raw = localStorage.getItem(KEY); return raw ? League.load(raw) : null; } catch (e) { console.warn('Guardado ilegible', e); return null; } }
export function wipe() { try { localStorage.removeItem(KEY); } catch {} }
export function exportFile(league) {
  const blob = new Blob([league.serialize()], { type: 'application/json' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `lgo_franchise_${league.data.year}_w${league.data.week + 1}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}
export const importText = text => League.load(text);
