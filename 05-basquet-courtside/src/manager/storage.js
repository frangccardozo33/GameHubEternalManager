const KEY = 'courtside-manager-v1';
export function saveGame(g) { try { localStorage.setItem(KEY, JSON.stringify(g.toJSON())); return true; } catch (e) { return false; } }
export function loadRaw() { try { const t = localStorage.getItem(KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
export function clearSave() { try { localStorage.removeItem(KEY); } catch (e) { /* almacenamiento no disponible */ } }
