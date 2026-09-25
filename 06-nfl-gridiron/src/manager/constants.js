import { PROFILE, ATTRIBUTES } from '../sim/models.js';
export { ATTRIBUTES, PROFILE };

export const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'];
export const POS_NAMES = { QB: 'Quarterback', RB: 'Running back', WR: 'Wide receiver', TE: 'Tight end', OL: 'Offensive line', DL: 'Defensive line', LB: 'Linebacker', CB: 'Cornerback', S: 'Safety', K: 'Kicker', P: 'Punter' };
export const ROSTER_TARGET = { QB: 3, RB: 4, WR: 6, TE: 3, OL: 8, DL: 7, LB: 5, CB: 5, S: 4, K: 1, P: 1 };
// Minimum to field every formation of the engine (21 personnel needs RB2, dime needs CB4, 3-4 needs LB4).
export const ROSTER_MIN = { QB: 1, RB: 2, WR: 3, TE: 2, OL: 5, DL: 4, LB: 4, CB: 4, S: 2, K: 1, P: 1 };
export const STARTERS = { QB: 1, RB: 1, WR: 3, TE: 1, OL: 5, DL: 4, LB: 3, CB: 3, S: 2, K: 1, P: 1 };
export const ROSTER_MAX = 53;
export const SALARY_CAP = 1e6; // sin tope salarial: se conserva la constante para no tocar el resto del motor

export const LABELS = {
  speed: 'Velocidad', acceleration: 'Aceleración', agility: 'Agilidad', strength: 'Fuerza', awareness: 'Visión de juego', armStrength: 'Fuerza de brazo',
  shortAccuracy: 'Precisión corta', mediumAccuracy: 'Precisión media', deepAccuracy: 'Precisión larga', mobility: 'Movilidad', decisionMaking: 'Toma de decisiones',
  throwUnderPressure: 'Pase bajo presión', vision: 'Visión de carrera', carrying: 'Cuidado del balón', contactBalance: 'Equilibrio en contacto', routeRunning: 'Ruta',
  catching: 'Manos', release: 'Salida de la línea', contestedCatch: 'Balón disputado', passBlocking: 'Bloqueo de pase', runBlocking: 'Bloqueo de carrera',
  technique: 'Técnica', passRush: 'Pass rush', tackling: 'Tackleo', pursuit: 'Persecución', manCoverage: 'Cobertura man', zoneCoverage: 'Cobertura zona',
  reaction: 'Reacción', press: 'Press', range: 'Rango', kickPower: 'Potencia de patada', kickAccuracy: 'Precisión de patada',
};
export const KEY_ATTRS = {
  QB: ['armStrength', 'shortAccuracy', 'mediumAccuracy', 'deepAccuracy', 'decisionMaking', 'awareness', 'throwUnderPressure', 'mobility', 'speed'],
  RB: ['speed', 'acceleration', 'agility', 'vision', 'carrying', 'strength', 'contactBalance', 'catching'],
  WR: ['speed', 'acceleration', 'agility', 'routeRunning', 'release', 'catching', 'contestedCatch'],
  TE: ['speed', 'strength', 'catching', 'contestedCatch', 'routeRunning', 'runBlocking'],
  OL: ['strength', 'passBlocking', 'runBlocking', 'technique', 'speed'],
  DL: ['strength', 'passRush', 'tackling', 'pursuit', 'speed'],
  LB: ['speed', 'strength', 'tackling', 'awareness', 'pursuit', 'passRush'],
  CB: ['speed', 'agility', 'manCoverage', 'zoneCoverage', 'reaction', 'press', 'catching'],
  S: ['speed', 'awareness', 'zoneCoverage', 'tackling', 'reaction', 'range', 'catching'],
  K: ['kickPower', 'kickAccuracy'], P: ['kickPower', 'kickAccuracy'],
};
const WEIGHTS = {
  QB: { shortAccuracy: 2, mediumAccuracy: 2, deepAccuracy: 1.5, decisionMaking: 2, armStrength: 1.5, awareness: 1.5, throwUnderPressure: 1, mobility: .6, speed: .3 },
  OL: { passBlocking: 1.5, runBlocking: 1.5, technique: 1.2, strength: 1.2, speed: .3 },
  WR: { routeRunning: 1.4, catching: 1.4, speed: 1.2 },
  CB: { manCoverage: 1.5, zoneCoverage: 1.3, speed: 1.2 },
  DL: { passRush: 1.6, strength: 1.2, speed: .5 },
};
// Rescale so that a "78 level" player of any position lands at ~78 overall.
const SCALE = {};
for (const pos of POSITIONS) {
  let w = 0, v = 0;
  for (const k of KEY_ATTRS[pos]) { const wt = WEIGHTS[pos]?.[k] ?? 1; w += wt; v += wt * (PROFILE[pos][k] ?? .62) * 100; }
  SCALE[pos] = 78 / (v / w);
}
export function ovrAt(ratings, pos) {
  let w = 0, v = 0;
  for (const k of KEY_ATTRS[pos]) { const wt = WEIGHTS[pos]?.[k] ?? 1; w += wt; v += wt * (ratings[k] ?? 55); }
  return Math.round(Math.max(30, Math.min(99, v / w * SCALE[pos])));
}
export const refreshOvr = p => { p.ovr = ovrAt(p.ratings, p.pos); return p.ovr; };

const POS_VALUE = { QB: 1.6, RB: .75, WR: 1.05, TE: .8, OL: 1, DL: 1.1, LB: .8, CB: 1, S: .75, K: .28, P: .22 };
// Fair market value in M$ per year.
export function marketValue(p) {
  const o = p.ovr, base = o < 55 ? .75 : .75 + Math.pow((o - 55) / 45, 2) * 21;
  const age = p.age <= 24 ? 1.06 : p.age >= 31 ? Math.max(.45, 1 - (p.age - 30) * .08) : 1;
  const pot = Math.max(0, p.potential - o) * .1 * (POS_VALUE[p.pos] > .5 ? 1 : .2);
  return Math.max(.7, Math.round((base * POS_VALUE[p.pos] * age + pot) * 10) / 10);
}
export const capHit = p => p.contract ? p.contract.salary + (p.contract.bonus || 0) / Math.max(1, p.contract.yearsTotal || 1) : 0;
export const fmtM = v => `$${(Math.round(v * 10) / 10).toFixed(1)}M`;

export const TRAINING_AREAS = {
  passing: { label: 'Pase', positions: ['QB'], attrs: ['shortAccuracy', 'mediumAccuracy', 'deepAccuracy', 'decisionMaking', 'throwUnderPressure', 'armStrength'], side: 'off' },
  routeRunning: { label: 'Rutas y manos', positions: ['WR', 'TE', 'RB'], attrs: ['routeRunning', 'release', 'catching', 'contestedCatch'], side: 'off' },
  blocking: { label: 'Bloqueo', positions: ['OL', 'TE', 'RB'], attrs: ['passBlocking', 'runBlocking', 'technique'], side: 'off' },
  passRush: { label: 'Pass rush', positions: ['DL', 'LB'], attrs: ['passRush', 'strength'], side: 'def' },
  coverage: { label: 'Cobertura', positions: ['CB', 'S', 'LB'], attrs: ['manCoverage', 'zoneCoverage', 'reaction', 'press', 'range'], side: 'def' },
  tackling: { label: 'Tackleo', positions: ['DL', 'LB', 'CB', 'S'], attrs: ['tackling', 'pursuit', 'awareness'], side: 'def' },
  conditioning: { label: 'Condición física', positions: POSITIONS, attrs: ['acceleration'], side: 'all' },
};
export const RB_EXTRA = ['vision', 'carrying', 'contactBalance']; // RBs also train ball-carrying under route running
export const PHYSICAL = new Set(['speed', 'acceleration', 'agility', 'strength', 'contactBalance', 'pursuit', 'range', 'mobility']);
export const CATEGORY_LABELS = { off: 'Ataque', def: 'Defensa', st: 'Special teams' };
export const posSide = pos => ['QB', 'RB', 'WR', 'TE', 'OL'].includes(pos) ? 'off' : ['DL', 'LB', 'CB', 'S'].includes(pos) ? 'def' : 'st';

export const TEAM_TEMPLATES = [
  { id: 'NTH', name: 'North Wolves', city: 'NORTH', mascot: 'WOLVES', color: '#49a6f5', dark: '#14375c', style: 'BALANCED', defense: 'COVERAGE', talent: 1 },
  { id: 'ATX', name: 'Austin Outlaws', city: 'AUSTIN', mascot: 'OUTLAWS', color: '#ff8552', dark: '#542b20', style: 'RUN HEAVY', defense: 'PRESSURE', talent: 1 },
  { id: 'HBR', name: 'Harbor Kings', city: 'HARBOR', mascot: 'KINGS', color: '#e6c34a', dark: '#4a3b0b', style: 'PASS HEAVY', defense: 'BALANCED', talent: 2 },
  { id: 'DSV', name: 'Desert Vipers', city: 'DESERT', mascot: 'VIPERS', color: '#7bd88f', dark: '#12391f', style: 'DEEP PASS', defense: 'PRESSURE', talent: 0 },
  { id: 'IRN', name: 'Iron Forge', city: 'IRON', mascot: 'FORGE', color: '#c9d1d9', dark: '#2b3540', style: 'RUN HEAVY', defense: 'RUN STOP', talent: 1 },
  { id: 'BAY', name: 'Bay Comets', city: 'BAY', mascot: 'COMETS', color: '#b27cff', dark: '#2e1b52', style: 'QUICK PASS', defense: 'COVERAGE', talent: 0 },
  { id: 'SMT', name: 'Summit Rams', city: 'SUMMIT', mascot: 'RAMS', color: '#ff5c73', dark: '#4d1620', style: 'BALANCED', defense: 'RUN STOP', talent: 0 },
  { id: 'CST', name: 'Coastal Sharks', city: 'COASTAL', mascot: 'SHARKS', color: '#37d4c8', dark: '#0c3a38', style: 'PASS HEAVY', defense: 'PRESSURE', talent: 1 },
];
export const FIRST = ['Marcus','Jalen','Devon','Tyrese','Cameron','Andre','Malik','Trevor','Caleb','Isaiah','Darius','Elijah','Jordan','Xavier','Brandon','Tyler','Micah','Nolan','Landon','Omar','Kenji','Rafael','Mateo','Diego','Lucas','Bruno','Emilio','Julian','Theo','Gavin','Colton','Reggie','Terrell','Damon','Chase','Dominic','Everett','Felix','Grant','Hunter','Ivan','Jasper','Kelvin','Leon','Miles','Noel','Owen','Pierce','Quincy','Roman','Sawyer','Tobias','Ulises','Victor','Wade','Zane','Amir','Baron','Cyrus','Donte'];
export const LAST = ['Reed','Coleman','Brooks','Hayes','Sutton','Ramos','Bennett','Fields','Carver','Delgado','Monroe','Holloway','Vance','Whitaker','Okafor','Navarro','Pruitt','Sinclair','Tanaka','Underwood','Voss','Winslow','Yates','Zimmer','Abbott','Beckett','Crawford','Dawson','Ellis','Foster','Gallo','Hendrix','Ibarra','Jennings','Kessler','Lombardi','Mercer','Nash','Osborne','Pruett','Quinn','Rowland','Stafford','Thorne','Ulrich','Villanueva','Weber','Xiong','Youngblood','Zapata','Alvarez','Blackwell','Cruz','Dunmore','Espinoza','Frazier','Gordon','Harlan','Iglesias','Jamison','Keane','Lockhart','Maddox','Novak','Oyelaran','Pace','Rivas','Salazar','Tate','Vaughn','Walsh','Acosta','Boone','Castillo','Duffy'];
export const INJURY_TYPES = [
  ['Esguince de tobillo', 1, 3, 30], ['Isquiotibiales', 2, 4, 22], ['Contusión', 1, 2, 20], ['Hombro', 3, 6, 10], ['Rodilla (menisco)', 4, 8, 8], ['Conmoción', 1, 3, 6], ['Ligamento cruzado', 10, 16, 4],
];
