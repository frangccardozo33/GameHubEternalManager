export const TAC_CONTROLS = [
  { k: 'tempo', label: 'Ritmo', lo: 'Lento', hi: 'Rápido' }, { k: 'inside', label: 'Ataque', lo: 'Perímetro', hi: 'Interior' },
  { k: 'pickRoll', label: 'Pick & roll', lo: 'Poco', hi: 'Mucho' }, { k: 'transition', label: 'Transición', lo: 'Ataque estático', hi: 'Contraataque' },
  { k: 'ballMovement', label: 'Circulación de balón', lo: 'Aislamientos', hi: 'Pase extra' },
  { k: 'shotRim', label: 'Tiros al aro', lo: 'Evitar', hi: 'Buscar' }, { k: 'shotMid', label: 'Media distancia', lo: 'Evitar', hi: 'Buscar' }, { k: 'shotThree', label: 'Triples', lo: 'Evitar', hi: 'Buscar' },
  { k: 'aggression', label: 'Agresividad', lo: 'Prudente', hi: 'Agresivo' }, { k: 'offReb', label: 'Rebote ofensivo', lo: 'Volver a defender', hi: 'Atacar rebote' },
  { k: 'pressure', label: 'Presión defensiva', lo: 'Replegar', hi: 'Presionar' },
];
export const DEFENSES = [['man', 'Hombre a hombre'], ['zone23', 'Zona 2-3'], ['zone32', 'Zona 3-2'], ['zone131', 'Zona 1-3-1']];
export const SWITCHES = [['never', 'Nunca cambiar (pelear pantallas)'], ['screens', 'Cambiar en pantallas'], ['always', 'Cambiar siempre']];
export const PRESETS = {
  'Equilibrado': { tempo: 50, inside: 50, pickRoll: 50, transition: 50, ballMovement: 50, shotRim: 50, shotMid: 50, shotThree: 50, aggression: 50, offReb: 50, pressure: 50, defense: 'man', switching: 'screens' },
  'Pace & space': { tempo: 75, inside: 30, pickRoll: 55, transition: 70, ballMovement: 55, shotRim: 55, shotMid: 30, shotThree: 78, aggression: 50, offReb: 35, pressure: 55, defense: 'man', switching: 'always' },
  'Interior': { tempo: 35, inside: 88, pickRoll: 35, transition: 35, ballMovement: 45, shotRim: 78, shotMid: 45, shotThree: 30, aggression: 55, offReb: 80, pressure: 45, defense: 'zone23', switching: 'screens' },
  'Pick & roll': { tempo: 55, inside: 55, pickRoll: 92, transition: 50, ballMovement: 60, shotRim: 60, shotMid: 55, shotThree: 55, aggression: 50, offReb: 45, pressure: 50, defense: 'man', switching: 'screens' },
  'Contraataque': { tempo: 88, inside: 50, pickRoll: 45, transition: 92, ballMovement: 50, shotRim: 65, shotMid: 40, shotThree: 55, aggression: 60, offReb: 25, pressure: 68, defense: 'man', switching: 'always' },
  'Defensa dura': { tempo: 40, inside: 50, pickRoll: 50, transition: 40, ballMovement: 50, shotRim: 50, shotMid: 50, shotThree: 45, aggression: 72, offReb: 55, pressure: 82, defense: 'man', switching: 'never' },
};
const opt = (list, cur) => list.map(([v, l]) => `<option value="${v}"${v === cur ? ' selected' : ''}>${l}</option>`).join('');
// HTML de sliders y selectores. Cada control lleva data-tac="clave" para que el llamador aplique el cambio.
export function tacticsHtml(t, { keys = null } = {}) {
  const rows = TAC_CONTROLS.filter(c => !keys || keys.includes(c.k)).map(c => `<div class="sl"><span>${c.label}</span><output>${t[c.k]}</output><input type="range" min="0" max="100" step="5" value="${t[c.k]}" data-tac="${c.k}"><small><span>${c.lo}</span><span>${c.hi}</span></small></div>`).join('');
  return `${rows}<div class="sl" style="grid-template-columns:150px 1fr"><span>Defensa</span><select class="f" data-tac="defense">${opt(DEFENSES, t.defense)}</select></div><div class="sl" style="grid-template-columns:150px 1fr"><span>Cambios defensivos</span><select class="f" data-tac="switching">${opt(SWITCHES, t.switching)}</select></div>`;
}
// Enlaza los controles: 'input' actualiza la etiqueta, 'change' aplica el valor.
export function bindTactics(root, apply) {
  root.querySelectorAll('input[data-tac]').forEach(el => el.addEventListener('input', () => { el.parentElement.querySelector('output').textContent = el.value; }));
  root.querySelectorAll('[data-tac]').forEach(el => el.addEventListener('change', () => apply(el.dataset.tac, el.type === 'range' ? Number(el.value) : el.value)));
}
export const optHtml = opt;
