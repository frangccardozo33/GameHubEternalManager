// GENERADO por server/tools/build-football.mjs (no editar). Núcleo TLM del fútbol como módulo ES.
import './football-shim.js';

// ---- nations.js
{
/* Eternal Manager · naciones ficticias del mundo.
 *
 * Fuente única de las naciones: nombre, código, bandera y el análogo real en el que están inspiradas (los nombres de
 * los archivos originales en 01-futbol/nations son "nación-análogo"). Sirve a todos los módulos (fútbol, básquet, NFL,
 * carreras, MMA) y a los tests en Node.
 *
 *   LFONations.list                       -> [{id, name, code, analog, weight, flag}]
 *   LFONations.get(nameOrId)              -> nación (acepta el nombre ficticio, el id o un país real de guardados viejos)
 *   LFONations.flag(nameOrId)             -> URL absoluta de la bandera (o '')
 *   LFONations.pick(rng, homeId)          -> nombre de una nación al azar (más peso a la del club); rng = () => [0,1)
 *   LFONations.forClub(clubName)          -> id de la nación de un club conocido (o null)
 *   LFONations.legacy(realName, seed)     -> nación equivalente a un país real (para guardados que usan países reales)
 */
(function (g) {
  'use strict';
  const LIST = [
    { id: 'peronia', name: 'Peronia', code: 'PER', analog: 'Argentina', weight: 4 },
    { id: 'valurria', name: 'Valurria', code: 'VAL', analog: 'Argentina', weight: 3 },
    { id: 'costasunidas', name: 'Costas Unidas', code: 'CUN', analog: 'Chile', weight: 2 },
    { id: 'grammes', name: 'Grammes', code: 'GRA', analog: 'España', weight: 2 },
    { id: 'iberia', name: 'Iberia', code: 'IBE', analog: 'Francia', weight: 2 },
    { id: 'kaigam', name: 'Kaigam', code: 'KAI', analog: 'Inglaterra', weight: 2 },
    { id: 'magayanes', name: 'Magayanes', code: 'MAG', analog: 'Colombia', weight: 2 },
    { id: 'margin', name: 'Margin', code: 'MRG', analog: 'Alemania', weight: 2 },
    { id: 'melonia', name: 'Melonia', code: 'MEL', analog: 'Italia', weight: 2 },
    { id: 'morvicia', name: 'Morvicia', code: 'MOR', analog: 'Paraguay', weight: 2 },
    { id: 'riada', name: 'Riada', code: 'RIA', analog: 'Camerún', weight: 1 },
    { id: 'sahar', name: 'Sahar', code: 'SAH', analog: 'Marruecos', weight: 1 },
    { id: 'skote', name: 'Skote', code: 'SKO', analog: 'Sudáfrica', weight: 1 },
    { id: 'sotoa', name: 'Sotoa', code: 'SOT', analog: 'Ecuador', weight: 1 },
    { id: 'tamago', name: 'Tamago', code: 'TAM', analog: '', weight: 1 },
    { id: 'zenet', name: 'Zenet', code: 'ZEN', analog: 'Croacia', weight: 1 },
    // ---- Continente Viejo: naciones de los clubes invitados a La Cupidité (no juegan la liga LFO) ----
    { id: 'baikal', name: 'Baikal', code: 'BAI', analog: 'Rusia', weight: 1, continent: 'viejo' },
    { id: 'estovackia', name: 'Estovackia', code: 'ESV', analog: 'Estonia / Eslovaquia', weight: 1, continent: 'viejo' },
    { id: 'kostanay', name: 'Kostanay', code: 'KOS', analog: 'Kazajistán', weight: 1, continent: 'viejo' },
    { id: 'netanya', name: 'Netanya', code: 'NET', analog: 'Israel', weight: 1, continent: 'viejo' },
    { id: 'overmark', name: 'Overmark', code: 'OVM', analog: 'Noruega', weight: 1, continent: 'viejo' },
  ];
  LIST.forEach((n) => { if (!n.continent) n.continent = 'nuevo'; });
  // Países reales que aparecían en guardados viejos → nación equivalente. Los que no tienen análogo propio se reparten.
  const LEGACY = { Argentina: 'peronia', Chile: 'costasunidas', España: 'grammes', Francia: 'iberia', Inglaterra: 'kaigam', Colombia: 'magayanes', Alemania: 'margin', Italia: 'melonia', Paraguay: 'morvicia',
    Camerún: 'riada', Marruecos: 'sahar', Sudáfrica: 'skote', Ecuador: 'sotoa', Croacia: 'zenet', Uruguay: 'valurria', Brasil: 'tamago', Perú: 'sotoa', México: 'magayanes', Portugal: 'grammes' };
  // Club conocido → nación (por nombre del club).
  const CLUBS = { 'Al-Sahar': 'sahar', 'Olympique de Iberia': 'iberia', 'Grammes FC': 'grammes', 'Atlético Margin': 'margin', 'Sportivo Calcio di Kaigam': 'kaigam', 'CD Héroicos de Peronia': 'peronia',
    'Independiente de Riada': 'riada', 'FC Santa Rosa': 'valurria', 'Melonia City FC': 'melonia', 'Fútbol Club de Tamago': 'tamago', 'Universidad Costas Unidas': 'costasunidas', 'Sköte FC': 'skote',
    'Sporting Magayanes': 'magayanes', 'Atlético Morvico': 'morvicia', 'Real Zenet': 'zenet', 'Sporting Santa María de Trinidad': 'sotoa',
    'Sporting Lake Baikal': 'baikal', 'Groz Sport Kulübü': 'baikal', 'Sporty VV Klub Estovackia': 'estovackia', 'Red Gull Club Tellin': 'estovackia', 'Sporty VV Klub Kostanay': 'kostanay',
    'Klaipeda United': 'kostanay', 'Maccabi Tel Shava': 'netanya', 'Inter Focuri': 'overmark', 'ØRK FC': 'overmark' };

  let base = '';
  try { if (g.document && g.document.currentScript && g.document.currentScript.src) base = new URL('.', g.document.currentScript.src).href; } catch (e) {}
  const byId = {}, byName = {};
  LIST.forEach((n) => { n.flag = base + n.id + '.jpg'; byId[n.id] = n; byName[n.name.toLowerCase()] = n; });

  const norm = (s) => String(s == null ? '' : s).trim().toLowerCase();
  function get(x) {
    const k = norm(x); if (!k) return null;
    if (byId[k]) return byId[k];
    if (byName[k]) return byName[k];
    for (const real in LEGACY) if (norm(real) === k) return byId[LEGACY[real]];
    return null;
  }
  function pick(rng, homeId) {
    const home = homeId && byId[homeId];
    if (home && rng() < 0.62) return home.name;
    let tot = 0; LIST.forEach((n) => (tot += n.weight));
    let r = rng() * tot;
    for (const n of LIST) { r -= n.weight; if (r <= 0) return n.name; }
    return LIST[0].name;
  }
  function legacy(real, seed) {
    if (get(real)) return get(real).name;
    let h = 2166136261; const s = String(real) + '|' + String(seed);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return LIST[(h >>> 0) % LIST.length].name;
  }
  // Determinista, para módulos que no guardan nacionalidad (básquet, NFL, carreras, MMA): la misma persona da siempre la misma nación.
  const hashStr = (str) => { let h = 2166136261; str = String(str); for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rngOf = (seed) => { let x = seed >>> 0 || 1; return () => { x = (Math.imul(1664525, x) + 1013904223) >>> 0; return x / 4294967296; }; };
  const forKey = (key) => LIST[hashStr('nation|' + key) % LIST.length];
  const forPerson = (personKey, teamKey) => pick(rngOf(hashStr('p|' + personKey)), teamKey != null ? forKey(teamKey).id : null);
  // Base de las banderas cuando el script se empaqueta como módulo (no hay document.currentScript): setBase('../assets/nations/')
  const setBase = (b) => { base = String(b).replace(/\/?$/, '/'); LIST.forEach((n) => (n.flag = base + n.id + '.jpg')); g.LFONations.base = base; };
  g.LFONations = { list: LIST, base, setBase, forKey, forPerson, get, flag: (x) => { const n = get(x); return n ? n.flag : ''; }, pick, legacy, forClub: (name) => CLUBS[name] || null, code: (x) => { const n = get(x); return n ? n.code : String(x || '').slice(0, 3).toUpperCase(); } };
})(typeof globalThis !== 'undefined' ? globalThis : this);

}

// ---- tlm-util.js
{
/* LFO MANAGER — utilidades base: RNG con estado serializable, hash determinista, helpers.
   Todo el núcleo TLM es JS puro (sin DOM) para poder probarlo en Node y reutilizarlo en el navegador. */
(function (g) {
  'use strict';
  const TLM = (g.TLM = g.TLM || {});

  // mulberry32 con estado serializable (state.rngState) — misma semilla + mismas acciones = mismo mundo.
  class RNG {
    constructor(seed) { this.s = seed >>> 0; }
    next() {
      let t = (this.s += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    range(a, b) { return a + this.next() * (b - a); }
    int(a, b) { return Math.floor(this.range(a, b + 1)); }
    pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
    chance(p) { return this.next() < p; }
    gauss() { let u = 0, v = 0; while (!u) u = this.next(); while (!v) v = this.next(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    weighted(items, w) {
      let tot = 0; for (const x of items) tot += w(x);
      if (tot <= 0) return items[0];
      let r = this.next() * tot;
      for (const x of items) { r -= w(x); if (r <= 0) return x; }
      return items[items.length - 1];
    }
    shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  }

  // Hash FNV-1a → [0,1). Sirve para ruido DETERMINISTA por (jugador, club, temporada...) sin consumir el RNG global:
  // las negociaciones son "deterministas + variables": el mismo caso da la misma respuesta, casos distintos varían.
  function hash01(...parts) {
    let h = 2166136261;
    const s = parts.join('|');
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const round = (v) => Math.round(v);
  const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  const clone = (o) => (typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o)));
  const money = (v) => {
    const a = Math.abs(v), s = v < 0 ? '-' : '';
    if (a >= 1e6) return s + '€' + (a / 1e6).toFixed(a >= 1e7 ? 1 : 2).replace(/\.?0+$/, '') + 'M';
    if (a >= 1e3) return s + '€' + Math.round(a / 1e3) + 'K';
    return s + '€' + Math.round(a);
  };
  const roundMoney = (v) => (v >= 5e6 ? Math.round(v / 1e5) * 1e5 : v >= 1e6 ? Math.round(v / 5e4) * 5e4 : v >= 1e5 ? Math.round(v / 1e4) * 1e4 : Math.round(v / 1e3) * 1e3);

  // Contadores de ID por tipo: los IDs de jugador son globales y nunca se reutilizan.
  function nextId(state, kind, prefix) {
    state.counters[kind] = (state.counters[kind] || 0) + 1;
    return (prefix || kind) + '_' + (state.counters[kind] + (kind === 'player' ? 1000 : 0));
  }

  // Bus de eventos mínimo (Career → UI / Broadcast). No hay estado global oculto: cada Career tiene el suyo.
  class Bus {
    constructor() { this.h = {}; }
    on(t, f) { (this.h[t] = this.h[t] || []).push(f); return () => { this.h[t] = this.h[t].filter((x) => x !== f); }; }
    emit(t, p) { for (const f of this.h[t] || []) { try { f(p); } catch (e) { if (g.console) console.error('[TLM bus]', t, e); } } for (const f of this.h['*'] || []) { try { f(t, p); } catch (e) {} } }
  }

  Object.assign(TLM, { RNG, hash01, clamp, round, avg, clone, money, roundMoney, nextId, Bus });
})(typeof globalThis !== 'undefined' ? globalThis : this);

}

// ---- tlm-dates.js
{
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

}

// ---- tlm-data.js
{
/* LFO MANAGER — STATIC DATA (nunca se guarda en la partida; la carrera sólo guarda lo que cambia).
   La liga y los clubes actuales son SÓLO la primera configuración (WORLD_CONFIG). Nada más del código
   asume 10/16/20 equipos: el calendario y la tabla se calculan a partir de competition.teams. */
(function (g) {
  'use strict';
  const TLM = (g.TLM = g.TLM || {});

  // Clubes que no se pueden elegir para dirigir (ni en carrera local ni online): quedan siempre bajo control de la IA.
  const BLOCKED_CLUB_NAMES = ['Al-Sahar', 'Olympique de Iberia', 'Sportivo Calcio di Kaigam'];
  TLM.BLOCKED_CLUB_NAMES = BLOCKED_CLUB_NAMES;
  TLM.isClubBlocked = (name) => BLOCKED_CLUB_NAMES.includes(name);

  // ---- Posiciones (mismas siglas que el álbum: collection.js POS) ----
  const POSITIONS = ['POR', 'LI', 'DFC', 'LD', 'MCD', 'MC', 'MP', 'MI', 'MD', 'EI', 'ED', 'DC'];
  const ROLE_OF = { POR: 'GK', LI: 'DEF', DFC: 'DEF', LD: 'DEF', MCD: 'MID', MC: 'MID', MP: 'MID', MI: 'MID', MD: 'MID', EI: 'FWD', ED: 'FWD', DC: 'FWD' };
  const POS_LABEL = { POR: 'Portero', LI: 'Lateral izq.', DFC: 'Central', LD: 'Lateral der.', MCD: 'Pivote', MC: 'Mediocentro', MP: 'Mediapunta', MI: 'Interior izq.', MD: 'Interior der.', EI: 'Extremo izq.', ED: 'Extremo der.', DC: 'Delantero' };
  const FAMILY = { POR: 'gk', LI: 'wb', LD: 'wb', DFC: 'cb', MCD: 'dm', MC: 'cm', MP: 'am', MI: 'wm', MD: 'wm', EI: 'w', ED: 'w', DC: 'st' };
  // compat[slot][pos] ∈ [0,1]: cuánto rinde un jugador de "pos" jugando en el hueco "slot".
  function compat(slot, pos, secondary) {
    if (slot === pos) return 1;
    if (secondary && secondary.includes(slot)) return 0.94;
    if (slot === 'POR' || pos === 'POR') return 0.25;
    const m = {
      LI: { LD: 0.86, DFC: 0.8, MI: 0.82, EI: 0.72 }, LD: { LI: 0.86, DFC: 0.8, MD: 0.82, ED: 0.72 },
      DFC: { MCD: 0.86, LI: 0.78, LD: 0.78 }, MCD: { DFC: 0.84, MC: 0.9, MI: 0.78, MD: 0.78 },
      MC: { MCD: 0.9, MP: 0.9, MI: 0.86, MD: 0.86 }, MP: { MC: 0.9, DC: 0.84, EI: 0.82, ED: 0.82, MI: 0.84, MD: 0.84 },
      MI: { MD: 0.88, MC: 0.86, EI: 0.9, LI: 0.8, MP: 0.84 }, MD: { MI: 0.88, MC: 0.86, ED: 0.9, LD: 0.8, MP: 0.84 },
      EI: { ED: 0.88, MI: 0.9, DC: 0.84, MP: 0.82 }, ED: { EI: 0.88, MD: 0.9, DC: 0.84, MP: 0.82 },
      DC: { EI: 0.84, ED: 0.84, MP: 0.86 },
    };
    return (m[slot] && m[slot][pos]) || (ROLE_OF[slot] === ROLE_OF[pos] ? 0.7 : 0.45);
  }

  // ---- Formaciones: etiqueta de puesto por índice de hueco. El orden coincide EXACTO con Fa[formación] del motor
  // (índice 0=POR, 1-4=DEF, 5-7=MED, 8-10=DEL para role del motor). "3-5-2" se registra en el motor desde manager/engine.js.
  const FORMATIONS = {
    '4-3-3': ['POR', 'LI', 'DFC', 'DFC', 'LD', 'MC', 'MCD', 'MC', 'EI', 'DC', 'ED'],
    '4-4-2': ['POR', 'LI', 'DFC', 'DFC', 'LD', 'MI', 'MC', 'MC', 'MD', 'DC', 'DC'],
    '4-2-3-1': ['POR', 'LI', 'DFC', 'DFC', 'LD', 'MCD', 'MCD', 'MI', 'MP', 'MD', 'DC'],
    '3-5-2': ['POR', 'DFC', 'DFC', 'DFC', 'LD', 'MI', 'MCD', 'MC', 'MP', 'DC', 'DC'],
  };
  // Coordenadas [x,z] (m, ataque hacia +x, campo 105x68) para el editor visual — reflejan Fa del motor.
  const FORMATION_XY = {
    '4-3-3': [[-49, 0], [-33, -24], [-36, -8], [-36, 8], [-33, 24], [-16, -16], [-21, 0], [-16, 16], [5, -24], [10, 0], [5, 24]],
    '4-4-2': [[-49, 0], [-33, -24], [-36, -8], [-36, 8], [-33, 24], [-12, -24], [-18, -8], [-18, 8], [-12, 24], [10, -9], [10, 9]],
    '4-2-3-1': [[-49, 0], [-33, -24], [-36, -8], [-36, 8], [-33, 24], [-19, -10], [-19, 10], [-2, -23], [-4, 0], [-2, 23], [13, 0]],
    '3-5-2': [[-49, 0], [-37, -13], [-39, 0], [-37, 13], [-20, 26], [-20, -26], [-25, 0], [-15, -9], [-6, 9], [8, -9], [8, 9]],
  };

  const STAT_KEYS = ['speed', 'acceleration', 'dribbling', 'passing', 'shooting', 'defense', 'physical', 'intelligence'];
  const PERS_KEYS = ['aggression', 'composure', 'discipline', 'creativity', 'consistency'];
  const STAT_LABEL = { speed: 'Ritmo', acceleration: 'Aceleración', dribbling: 'Regate', passing: 'Pase', shooting: 'Remate', defense: 'Defensa', physical: 'Físico', intelligence: 'Lectura' };

  // Media por rol — MISMOS pesos que collection.js overall() para que la carta y el manager coincidan.
  const OVR_WEIGHTS = {
    GK: { defense: 3, intelligence: 2, physical: 2, acceleration: 1 },
    DEF: { defense: 4, physical: 2, speed: 1, passing: 1 },
    MID: { passing: 3, intelligence: 2, dribbling: 2, physical: 1 },
    FWD: { shooting: 3, speed: 2, dribbling: 2, acceleration: 1 },
  };
  // Perfil de atributos por rol (offset sobre la media objetivo) para generar jugadores creíbles.
  const STAT_PROFILE = {
    GK: { speed: -14, acceleration: -12, dribbling: -22, passing: -8, shooting: -34, defense: 6, physical: 2, intelligence: 4 },
    DEF: { speed: -2, acceleration: -3, dribbling: -10, passing: -4, shooting: -16, defense: 8, physical: 5, intelligence: 0 },
    MID: { speed: -2, acceleration: -1, dribbling: 2, passing: 6, shooting: -6, defense: -4, physical: -1, intelligence: 4 },
    FWD: { speed: 5, acceleration: 5, dribbling: 5, passing: -3, shooting: 8, defense: -22, physical: -3, intelligence: -1 },
  };

  // Ediciones especiales (cromos): NO son jugadores nuevos — sólo cambian la representación del MISMO playerId.
  // Ediciones "base" (potrero/cobre): sólo cosmética, se compran libremente, sin límite de usos.
  // Ediciones "especiales" (plata en adelante): son cartas de juego reales — no se compran, salen como drop de partidos
  // brillantes (ver rollCardDrop en tlm-market.js), son instancias propias con usos limitados y se pueden vender por
  // separado del jugador. `logic` define su efecto propio (ver applyCardLogic en tlm-players.js).
  const EDITIONS = [
    { id: 'potrero', name: 'Potrero', cost: 0, stars: 3 }, { id: 'cobre', name: 'Cobre', cost: 0.02, stars: 3 },
    { id: 'plata', name: 'Plata', stars: 4, special: true, uses: 20, logic: 'boost', boost: 2 },
    { id: 'oro', name: 'Oro de cancha', stars: 4, special: true, uses: 20, logic: 'boost', boost: 3 },
    { id: 'barrio', name: 'Ídolo del barrio', stars: 4, special: true, uses: 20, logic: 'immune' },
    { id: 'promesa', name: 'Primera ovación', stars: 4, special: true, uses: 20, logic: 'xp' },
    { id: 'clasico', name: 'Noche de clásico', stars: 5, special: true, uses: 5, logic: 'derby', boost: 6 },
    { id: 'apertura', name: 'Apertura 2008', stars: 5, special: true, uses: 5, logic: 'opener', boost: 6 },
    { id: 'capitan', name: 'Capitán eterno', stars: 5, special: true, uses: 5, logic: 'consistency' },
    { id: 'copa', name: 'La vuelta olímpica', stars: 5, special: true, uses: 5, logic: 'cup', boost: 6 },
    { id: 'archivo', name: 'Archivo 2000', stars: 4, special: true, uses: 20, logic: 'veteran' },
    { id: 'leyenda', name: 'Última leyenda', stars: 5, special: true, uses: 5, logic: 'legend', boost: 5 },
  ];

  // ---- Perfiles de manager IA: cada uno decide distinto (no "el mismo bot con ruido") ----
  const AI_PROFILES = {
    balanced: { label: 'Equilibrado', formations: ['4-3-3', '4-4-2', '4-2-3-1'], mentality: 'balanced', buildUp: 'balanced', pressing: 'medium', width: 'normal', tempo: 'normal', line: 'normal',
      spend: 0.55, sellGreed: 1.0, youth: 0.5, star: 0.4, depth: 0.5, loyalty: 0.5, bidAggr: 0.5, renew: 0.5 },
    conservative: { label: 'Conservador', formations: ['4-4-2', '4-2-3-1'], mentality: 'defensive', buildUp: 'balanced', pressing: 'low', width: 'narrow', tempo: 'slow', line: 'low',
      spend: 0.35, sellGreed: 1.1, youth: 0.3, star: 0.2, depth: 0.5, loyalty: 0.7, bidAggr: 0.3, renew: 0.7 },
    aggressive: { label: 'Agresivo', formations: ['4-3-3', '3-5-2'], mentality: 'attacking', buildUp: 'direct', pressing: 'high', width: 'wide', tempo: 'fast', line: 'high',
      spend: 0.7, sellGreed: 1.0, youth: 0.35, star: 0.55, depth: 0.5, loyalty: 0.4, bidAggr: 0.75, renew: 0.4 },
    youthDeveloper: { label: 'Desarrollador de jóvenes', formations: ['4-3-3', '4-2-3-1'], mentality: 'balanced', buildUp: 'possession', pressing: 'medium', width: 'normal', tempo: 'normal', line: 'normal',
      spend: 0.45, sellGreed: 1.2, youth: 0.95, star: 0.15, depth: 0.55, loyalty: 0.55, bidAggr: 0.4, renew: 0.6 },
    starBuyer: { label: 'Comprador de estrellas', formations: ['4-3-3', '4-2-3-1'], mentality: 'attacking', buildUp: 'possession', pressing: 'high', width: 'wide', tempo: 'normal', line: 'high',
      spend: 0.9, sellGreed: 1.25, youth: 0.2, star: 0.95, depth: 0.7, loyalty: 0.3, bidAggr: 0.85, renew: 0.5 },
    pragmaticSeller: { label: 'Vendedor pragmático', formations: ['4-4-2', '4-3-3'], mentality: 'balanced', buildUp: 'balanced', pressing: 'medium', width: 'normal', tempo: 'normal', line: 'normal',
      spend: 0.4, sellGreed: 0.85, youth: 0.5, star: 0.2, depth: 0.45, loyalty: 0.2, bidAggr: 0.35, renew: 0.3 },
    defensive: { label: 'Especialista defensivo', formations: ['4-4-2', '3-5-2'], mentality: 'defensive', buildUp: 'counter', pressing: 'low', width: 'narrow', tempo: 'slow', line: 'low',
      spend: 0.4, sellGreed: 1.1, youth: 0.3, star: 0.25, depth: 0.5, loyalty: 0.6, bidAggr: 0.35, renew: 0.6 },
    offensive: { label: 'Ofensivo', formations: ['4-3-3', '4-2-3-1', '3-5-2'], mentality: 'veryAttacking', buildUp: 'possession', pressing: 'high', width: 'wide', tempo: 'fast', line: 'high',
      spend: 0.65, sellGreed: 1.05, youth: 0.4, star: 0.6, depth: 0.5, loyalty: 0.4, bidAggr: 0.7, renew: 0.45 },
    lowBudget: { label: 'Presupuesto bajo', formations: ['4-4-2', '4-2-3-1'], mentality: 'balanced', buildUp: 'counter', pressing: 'medium', width: 'normal', tempo: 'normal', line: 'normal',
      spend: 0.2, sellGreed: 0.9, youth: 0.6, star: 0.05, depth: 0.35, loyalty: 0.5, bidAggr: 0.2, renew: 0.45 },
  };

  // ---- Opciones tácticas del manager → enums del motor (TACTIC_ENUMS). Sólo diales que el motor USA de verdad. ----
  const TACTIC_OPTIONS = {
    mentality: [['veryDefensive', 'Muy defensiva'], ['defensive', 'Defensiva'], ['balanced', 'Equilibrada'], ['attacking', 'Ofensiva'], ['veryAttacking', 'Muy ofensiva']],
    buildUp: [['possession', 'Posesión'], ['balanced', 'Equilibrada'], ['direct', 'Directa'], ['counter', 'Contraataque']],
    pressing: [['low', 'Baja'], ['medium', 'Media'], ['high', 'Alta'], ['extreme', 'Extrema']],
    width: [['narrow', 'Estrecha'], ['normal', 'Normal'], ['wide', 'Ancha']],
    tempo: [['slow', 'Lento'], ['normal', 'Normal'], ['fast', 'Rápido']],
    line: [['low', 'Baja'], ['normal', 'Normal'], ['high', 'Alta']],
  };
  const TACTIC_LABEL = { mentality: 'Mentalidad', buildUp: 'Construcción', pressing: 'Presión', width: 'Anchura', tempo: 'Ritmo', line: 'Línea defensiva' };
  const DEFAULT_TACTICS = { formation: '4-3-3', mentality: 'balanced', buildUp: 'balanced', pressing: 'medium', width: 'normal', tempo: 'normal', line: 'normal' };
  // manager → TACTIC_ENUMS del motor (ver tlm-tactics.js toEnginePatch)
  const ENGINE_MAP = {
    mentality: { veryDefensive: 'veryDefensive', defensive: 'defensive', balanced: 'balanced', attacking: 'attacking', veryAttacking: 'veryAttacking' },
    pressing: { low: 'low', medium: 'medium', high: 'high', extreme: 'allOut' },
    tempo: { slow: 'slower', normal: 'normal', fast: 'faster' },
    line: { low: 'deep', normal: 'normal', high: 'high' },
  };

  const TRAINING = {
    individual: [['attack', 'Ataque', ['shooting', 'dribbling']], ['defense', 'Defensa', ['defense', 'intelligence']], ['passing', 'Pase', ['passing', 'intelligence']],
      ['dribbling', 'Regate', ['dribbling', 'acceleration']], ['physical', 'Físico', ['physical', 'speed']], ['speed', 'Velocidad', ['speed', 'acceleration']], ['goalkeeping', 'Portería', ['defense', 'intelligence', 'physical']]],
    team: [['attack', 'Ataque'], ['defense', 'Defensa'], ['possession', 'Posesión'], ['pressing', 'Presión'], ['setPieces', 'Balón parado']],
    // efecto real: bonus temporal de atributos en el partido (máx +3 tras varias jornadas seguidas con el mismo foco)
    teamEffect: { attack: ['shooting', 'dribbling'], defense: ['defense', 'intelligence'], possession: ['passing', 'intelligence'], pressing: ['physical', 'acceleration'], setPieces: ['physical', 'shooting'] },
  };

  const NAMES = {
    first: ['Lautaro', 'Julián', 'Facundo', 'Nicolás', 'Matías', 'Lucas', 'Mateo', 'Pablo', 'Iván', 'Adrián', 'Tomás', 'Diego', 'Franco', 'Emiliano', 'Bruno', 'Ramiro', 'Gonzalo', 'Santiago', 'Joaquín', 'Ezequiel', 'Maximiliano', 'Agustín', 'Federico', 'Hernán', 'Leandro', 'Rodrigo', 'Sebastián', 'Damián', 'Cristian', 'Gastón', 'Nahuel', 'Thiago', 'Álvaro', 'Marcos', 'Andrés', 'Óscar', 'Raúl', 'Sergio', 'Hugo', 'Ismael', 'Kevin', 'Yago', 'Renzo', 'Ciro', 'Elías', 'Dante', 'Bautista', 'Valentín', 'Luciano', 'Ignacio', 'Alan', 'Cauê', 'Rafael', 'Iker', 'Aitor', 'Mauro', 'Fabián', 'Walter', 'Claudio', 'Esteban'],
    last: ['Álvarez', 'Benítez', 'Sosa', 'Romero', 'Vidal', 'Torres', 'Herrera', 'Martín', 'Vega', 'Cruz', 'Acosta', 'Silva', 'Ríos', 'Ferreyra', 'Molina', 'Paz', 'Serrano', 'Costa', 'Rubio', 'Navarro', 'Alonso', 'León', 'Duarte', 'Peralta', 'Moretti', 'Ibarra', 'Salas', 'Nieva', 'Quiroga', 'Lombardi', 'Arce', 'Bustos', 'Castro', 'Medina', 'Ortega', 'Giménez', 'Domínguez', 'Ruiz', 'Sánchez', 'Correa', 'Villalba', 'Aguirre', 'Cabrera', 'Luna', 'Ledesma', 'Maidana', 'Bravo', 'Rojas', 'Pereyra', 'Godoy', 'Ponce', 'Barrios', 'Escobar', 'Figueroa', 'Gallardo', 'Ibáñez', 'Juárez', 'Lezcano', 'Montenegro', 'Núñez', 'Olivera', 'Palacios', 'Quintero', 'Robles', 'Suárez', 'Toledo', 'Urquiza', 'Varela', 'Zabala', 'Almada', 'Britos', 'Coria', 'Delgado', 'Espínola', 'Fontana', 'Guerra', 'Heredia', 'Insúa', 'Jara', 'Krause', 'Lagos', 'Mansilla', 'Noriega', 'Ovejero', 'Paredes', 'Roldán', 'Sandoval', 'Tapia', 'Uribe', 'Vera'],
    // naciones ficticias del mundo (la fuente es assets/nations/nations.js; esta lista es el respaldo si no está cargada)
    nations: ['Peronia', 'Peronia', 'Peronia', 'Valurria', 'Valurria', 'Costas Unidas', 'Grammes', 'Magayanes', 'Melonia', 'Morvicia', 'Iberia', 'Kaigam', 'Margin'],
    stadiums: ['Estadio Municipal', 'Parque Central', 'Coloso del Sur', 'Bombonera Vieja', 'Estadio del Puerto', 'La Fortaleza', 'Estadio Centenario', 'Campo de los Héroes', 'Monumental Chico', 'Ciudad Deportiva'],
    clubA: ['Deportivo', 'Atlético', 'Racing', 'Unión', 'Sportivo', 'Real', 'Juventud', 'Estudiantes', 'Argentino', 'Central'],
    clubB: ['Alameda', 'Bahía Norte', 'Cerro Verde', 'Doce de Octubre', 'Estrella Roja', 'Fénix', 'Gualeguay', 'Horizonte', 'Ituzaingó', 'Jacarandá', 'Lomas', 'Monteros', 'Nueva Esperanza', 'Ombú', 'Pampa', 'Quilmes Viejo', 'Rosales', 'San Telmo', 'Tres Arroyos', 'Villa Alegre'],
  };

  // ---- PRIMERA CONFIGURACIÓN DEL MUNDO ----
  // rep = reputación 1-100 (define calidad media de plantilla, presupuesto, aforo). crest = archivo (null → escudo generado).
  const WORLD_CONFIG = {
    id: 'liga-lfo',
    name: 'Liga de Fútbol Online',
    country: 'Argentina',
    crest: 'equiposfut/ligadefutbolonlinelogo.png',
    format: { rounds: 2, pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0, tieBreakRules: ['points', 'goalDifference', 'goalsFor', 'headToHead', 'wins', 'name'] },
    startYear: 2005,
    clubs: [
      { name: 'Al-Sahar', shortName: 'SAH', crest: 'equiposfut/alsahar.png', primaryColor: '#870000', secondaryColor: '#ffc000', kitPattern: 'sash', stadium: 'Estadio Espada de Oro', capacity: 42000, rep: 80, profile: 'starBuyer' },
      { name: 'Olympique de Iberia', shortName: 'OLI', crest: 'equiposfut/olympiquedeiberia.png', primaryColor: '#06256d', secondaryColor: '#ad0c00', kitPattern: 'halves', stadium: 'Stade Iberia', capacity: 38000, rep: 76, profile: 'starBuyer' },
      { name: 'Grammes FC', shortName: 'GRA', crest: 'equiposfut/grammesfutbolclub.png', primaryColor: '#e10000', secondaryColor: '#ffffff', kitPattern: 'chevron', stadium: 'Estadio de las Flechas', capacity: 36000, rep: 74, profile: 'aggressive' },
      { name: 'Atlético Margin', shortName: 'MAR', crest: 'equiposfut/atleticomargin.png', primaryColor: '#800000', secondaryColor: '#ffc000', kitPattern: 'hoops', stadium: 'Estadio Marginal', capacity: 33000, rep: 70, profile: 'balanced' },
      { name: 'Sportivo Calcio di Kaigam', shortName: 'KAI', crest: 'equiposfut/sportivocalciosdikaigam.png', primaryColor: '#1a6fb5', secondaryColor: '#ffffff', kitPattern: 'pinstripes', stadium: 'Stadio Kaigam', capacity: 30000, rep: 68, profile: 'offensive' },
      { name: 'CD Héroicos de Peronia', shortName: 'HER', crest: 'equiposfut/clubdeportivoheroicosdeperonia.png', primaryColor: '#47aee0', secondaryColor: '#ffc000', kitPattern: 'vband', stadium: 'Estadio Solar de Peronia', capacity: 28000, rep: 66, profile: 'youthDeveloper' },
      { name: 'Independiente de Riada', shortName: 'RIA', crest: 'equiposfut/independientederiada.png', primaryColor: '#049245', secondaryColor: '#f41b1b', kitPattern: 'quarters', stadium: 'Estadio de la Ría', capacity: 27000, rep: 64, profile: 'balanced' },
      { name: 'FC Santa Rosa', shortName: 'SRO', crest: 'equiposfut/fcsantarosa.png', primaryColor: '#f58a2a', secondaryColor: '#3a8fe0', kitPattern: 'gradient', stadium: 'Estadio de la Torre', capacity: 25000, rep: 62, profile: 'offensive' },
      { name: 'Melonia City FC', shortName: 'MEL', crest: 'equiposfut/meloniacityfc.png', primaryColor: '#305005', secondaryColor: '#ffffff', kitPattern: 'band', stadium: 'Melon Park', capacity: 24000, rep: 60, profile: 'pragmaticSeller' },
      { name: 'Fútbol Club de Tamago', shortName: 'TAM', crest: 'equiposfut/futbolclubdetamago.png', primaryColor: '#0a1678', secondaryColor: '#ffc000', kitPattern: 'stripes', stadium: 'Estadio Tamago', capacity: 22000, rep: 58, profile: 'conservative' },
      { name: 'Universidad Costas Unidas', shortName: 'UCU', crest: 'equiposfut/universidadcostasunidas.png', primaryColor: '#0d76a0', secondaryColor: '#0bbf0b', kitPattern: 'sidepanels', stadium: 'Campus Deportivo', capacity: 20000, rep: 57, profile: 'youthDeveloper' },
      { name: 'Sköte FC', shortName: 'SKO', crest: 'equiposfut/skotefc.png', primaryColor: '#151515', secondaryColor: '#ffffff', kitPattern: 'stripes', stadium: 'Sköte Arena', capacity: 19000, rep: 55, profile: 'defensive' },
      { name: 'Sporting Magayanes', shortName: 'MAG', crest: 'equiposfut/sportingmagayanes.png', primaryColor: '#f0c400', secondaryColor: '#800000', kitPattern: 'shoulders', stadium: 'Castillo de Magayanes', capacity: 16000, rep: 52, profile: 'lowBudget' },
      { name: 'Atlético Morvico', shortName: 'MOR', crest: 'equiposfut/atleticomorvico.png', primaryColor: '#5c1f8a', secondaryColor: '#ffffff', kitPattern: 'sash', stadium: 'Estadio del Morvico', capacity: 15000, rep: 50, profile: 'aggressive' },
      { name: 'Real Zenet', shortName: 'ZEN', crest: 'equiposfut/realzenet.png', primaryColor: '#0b3d2e', secondaryColor: '#f0c400', kitPattern: 'geometric', stadium: 'Estadio Real Zenet', capacity: 14000, rep: 48, profile: 'conservative' },
      { name: 'Sporting Santa María de Trinidad', shortName: 'SMT', crest: 'equiposfut/sportingsantamariadetrinidad.png', primaryColor: '#8a1c1c', secondaryColor: '#eae4d0', kitPattern: 'checks', stadium: 'Estadio Santa María', capacity: 13000, rep: 46, profile: 'youthDeveloper' },
    ],
  };

  // ---- CLUBES INVITADOS (Continente Viejo): no juegan la liga LFO, sólo La Cupidité (como una Champions o una Libertadores) ----
  // rep = reputación 1-100 (define la calidad de la plantilla). Los escudos están en equiposfut/continente2.
  // Los clubes del Continente Viejo están MUY por encima de los de la liga (Kostanay y Tel Shava: +15/20 de reputación y de media sobre el mejor local).
  // Nombres propios de cada nación del Continente Viejo (los jugadores de los clubes invitados los usan al generarse).
  const NAMES_VIEJO = {
    baikal: { first: ['Dmitri', 'Ivan', 'Nikolai', 'Sergei', 'Mikhail', 'Andrei', 'Pavel', 'Yuri', 'Oleg', 'Anton', 'Vasili', 'Kirill'], last: ['Volkov', 'Petrov', 'Smirnov', 'Kuznetsov', 'Sokolov', 'Morozov', 'Orlov', 'Lebedev', 'Zhukov', 'Baranov', 'Antonov', 'Fedorov'] },
    estovackia: { first: ['Marek', 'Tomas', 'Jaan', 'Matej', 'Andres', 'Peter', 'Karel', 'Lukas', 'Rein', 'Jakub'], last: ['Novak', 'Kask', 'Horvath', 'Tamm', 'Kovac', 'Sepp', 'Magi', 'Hruska', 'Varga', 'Parn'] },
    kostanay: { first: ['Arman', 'Timur', 'Daulet', 'Bauyrzhan', 'Nurlan', 'Yerlan', 'Askar', 'Rustem', 'Marat', 'Aidos'], last: ['Nurgaliev', 'Akhmetov', 'Sadykov', 'Bekov', 'Kasenov', 'Tulegenov', 'Omarov', 'Iskakov', 'Serikov', 'Dauletov'] },
    netanya: { first: ['Yossi', 'Noam', 'Eitan', 'Omer', 'Itai', 'Guy', 'Amir', 'Tal', 'Ori', 'Lior'], last: ['Cohen', 'Levi', 'Mizrahi', 'Peretz', 'Biton', 'Dahan', 'Avraham', 'Friedman', 'Shapiro', 'Katz'] },
    overmark: { first: ['Henrik', 'Magnus', 'Sander', 'Anders', 'Erik', 'Torstein', 'Jonas', 'Kristian', 'Espen', 'Tobias'], last: ['Hansen', 'Berg', 'Lunde', 'Solberg', 'Nilsen', 'Dahl', 'Strand', 'Halvorsen', 'Moen', 'Haugen'] },
  };
  const GUEST_CLUBS = [
    { name: 'Red Gull Club Tellin', shortName: 'RGT', nation: 'estovackia', crest: 'equiposfut/continente2/redgullclubtellin.png', primaryColor: '#f2c500', secondaryColor: '#0a2a6b', kitPattern: 'hoops', stadium: 'Tellin Arena', capacity: 34000, rep: 91, profile: 'starBuyer' },
    { name: 'Maccabi Tel Shava', shortName: 'MTS', nation: 'netanya', crest: 'equiposfut/continente2/maccabitelshava.png', primaryColor: '#0a2a6b', secondaryColor: '#ffc400', kitPattern: 'vband', stadium: 'Estadio Estrella Dorada', capacity: 31000, rep: 97, profile: 'balanced' },
    { name: 'Sporting Lake Baikal', shortName: 'SLB', nation: 'baikal', crest: 'equiposfut/continente2/sportinglakebaikal.png', primaryColor: '#4f8fd0', secondaryColor: '#1f4e8c', kitPattern: 'gradient', stadium: 'Estadio Lago Profundo', capacity: 30000, rep: 89, profile: 'defensive' },
    { name: 'Sporty VV Klub Estovackia', shortName: 'SKE', nation: 'estovackia', crest: 'equiposfut/continente2/sportyvvklubestovackia.png', primaryColor: '#b3001b', secondaryColor: '#111111', kitPattern: 'halves', stadium: 'Estadio del Pato Volador', capacity: 28000, rep: 87, profile: 'aggressive' },
    { name: 'Sporty VV Klub Kostanay', shortName: 'SKK', nation: 'kostanay', crest: 'equiposfut/continente2/sportyvvklubkostanay.png', primaryColor: '#151515', secondaryColor: '#ffffff', kitPattern: 'checks', stadium: 'Estadio Águila Doble', capacity: 26000, rep: 98, profile: 'conservative' },
    { name: 'Groz Sport Kulübü', shortName: 'GRZ', nation: 'baikal', crest: 'equiposfut/continente2/grozsportkulubu.png', primaryColor: '#46a7dc', secondaryColor: '#0b2a63', kitPattern: 'pinstripes', stadium: 'Arena de la Fortaleza', capacity: 24000, rep: 85, profile: 'offensive' },
    { name: 'Klaipeda United', shortName: 'KLU', nation: 'kostanay', crest: 'equiposfut/continente2/Klaipedaunited.png', primaryColor: '#a4142b', secondaryColor: '#1b1b1b', kitPattern: 'quarters', stadium: 'Estadio del Puerto de Klaipeda', capacity: 21000, rep: 82, profile: 'pragmaticSeller' },
    { name: 'Inter Focuri', shortName: 'IFO', nation: 'overmark', crest: 'equiposfut/continente2/interfocuri.png', primaryColor: '#0fa958', secondaryColor: '#111111', kitPattern: 'stripes', stadium: 'Estadio de las Hogueras', capacity: 20000, rep: 79, profile: 'youthDeveloper' },
    { name: 'ØRK FC', shortName: 'ORK', nation: 'overmark', crest: 'equiposfut/continente2/orkfc.png', primaryColor: '#1c5b2a', secondaryColor: '#ffffff', kitPattern: 'chevron', stadium: 'Estadio Banderín Verde', capacity: 17000, rep: 77, profile: 'lowBudget' },
  ];

  const DEFAULTS = {
    userStartBudget: 45e6, userStartReputation: 42, freeAgents: 90, listedPerClub: 3, squadSize: [22, 25], maxBench: 7, maxSubs: 5,
    ticketPrice: 22, baseIncomePerRound: 0.03, // fracción de (rep*20000) por jornada (TV/patrocinio genérico)
    scoutPerRound: 3, offerLifeRounds: 2, minSquadToPlay: 14,
    stadiumLevels: [{ level: 1, capacity: 0 }, { level: 2, add: 4000, cost: 6e6 }, { level: 3, add: 6000, cost: 12e6 }, { level: 4, add: 8000, cost: 22e6 }, { level: 5, add: 10000, cost: 40e6 }],
  };

  Object.assign(TLM, { POSITIONS, ROLE_OF, POS_LABEL, FAMILY, compat, FORMATIONS, FORMATION_XY, STAT_KEYS, PERS_KEYS, STAT_LABEL, OVR_WEIGHTS, STAT_PROFILE, EDITIONS, AI_PROFILES,
    TACTIC_OPTIONS, TACTIC_LABEL, DEFAULT_TACTICS, ENGINE_MAP, TRAINING, NAMES, NAMES_VIEJO, WORLD_CONFIG, GUEST_CLUBS, DEFAULTS });
})(typeof globalThis !== 'undefined' ? globalThis : this);

}

// ---- tlm-roster.js
{
/* LFO MANAGER — BASE DE JUGADORES (generada por assets/roster/tools/build_football_roster.py; no editar a mano).
   Reales (con stats proyectados +4 años), celebridades, 4 especiales y ficticios con retrato. Claves: n nombre, nat nación ficticia, a edad, p posición, s secundarias, o media, pt potencial,
   h altura, b complexión, f pie, at [ritmo, aceleración, regate, pase, remate, defensa, físico, lectura], sk piel, hr pelo, hs peinado, bd barba, ac accesorios, ph retrato, c club, k tipo. */
(function (g) {
  'use strict';
  const TLM = (g.TLM = g.TLM || {});
  TLM.ROSTER = {"version":7,"years":4,"placeholder":"assets/players/placeholder.webp","natPool":{"peronia":"lat","valurria":"lat","costasunidas":"lat","magayanes":"lat","sotoa":"lat","morvicia":"lat","tamago":"tam","grammes":"gra","iberia":"ibe","kaigam":"kai","margin":"mar","melonia":"mel","riada":"ria","sahar":"sah","skote":"sko","zenet":"zen","baikal":"bai","estovackia":"est","kostanay":"kos","netanya":"net","overmark":"ove"},"pools":{"lat":[["Lautaro","Julián","Facundo","Nicolás","Matías","Lucas","Mateo","Pablo","Iván","Adrián","Tomás","Diego","Franco","Emiliano","Bruno","Ramiro","Gonzalo","Santiago","Joaquín","Ezequiel","Maximiliano","Agustín","Federico","Rodrigo","Leandro","Cristian","Ariel","Damián","Hernán","Walter","Sebastián","Martín","Gabriel","Ignacio","Alan","Kevin","Axel","Thiago","Bautista","Valentín","Lisandro","Mauro","Fabián","Claudio","Darío","Ramón","Cristóbal","Marcelo","Esteban","Gustavo","Néstor","Renzo","Milton","Jonatan","Brian","Elías","Ulises","Aníbal","Osvaldo","Rolando"],["Aguilera","Albornoz","Altamirano","Arancibia","Arce","Arellano","Ávalos","Ávila","Baigorria","Barrios","Bazán","Bermúdez","Bianchi","Bordón","Brizuela","Bravo","Burgos","Caballero","Cáceres","Calderón","Camino","Campana","Cañete","Carrizo","Casares","Castaño","Cepeda","Cerda","Chávez","Cisneros","Coria","Correa","Cuello","Cuevas","Delgado","Díaz","Echeverría","Elizondo","Enríquez","Escalante","Espeche","Falcón","Fariña","Figueroa","Flores","Fretes","Gaitán","Galeano","Gallo","Garay","Giménez","Godoy","Gorosito","Guerra","Gutiérrez","Heredia","Hidalgo","Ibáñez","Insúa","Jara","Juárez","Lagos","Lascano","Leiva","Lezcano","Lucero","Luna","Maldonado","Mansilla","Manzur","Medina","Mercado","Miranda","Montenegro","Montiel","Mora","Morán","Muñoz","Nieva","Noriega","Ocampo","Olivera","Ortega","Ortiz","Pacheco","Palacios","Pardo","Pedraza","Pellegrini","Pineda","Pizarro","Ponce","Quintana","Quiroz","Ramírez","Reynoso","Rivas","Rojas","Roldán","Rosales","Ruiz","Saavedra","Sáenz","Salvatierra","Sánchez","Sandoval","Segovia","Sequeira","Soria","Suárez","Tapia","Tello","Trejo","Uribe","Valdez","Valenzuela","Varela","Vargas","Vázquez","Velasco","Verón","Vera","Viera","Villagra","Villarreal","Yáñez","Zabala","Zamora","Zárate","Zúñiga","Abregú","Acuña","Aliendro","Amaya","Andrada","Ardiles","Arias","Astudillo","Bustamante","Bustos","Cabral","Cabrera","Cardozo","Carballo","Cardona","Carrasco","Castellano","Castillo","Cejas","Centurión","Cordero","Cornejo","Cortez","Coronel","Cruz","Dávalos","Domínguez","Duarte","Escobar","Espinoza","Esquivel","Ferreyra","Fuentes","Funes","Gallardo","Gamarra","Gómez","Guzmán","Herrera","Ledesma","Maidana","Márquez","Molina","Navarro","Ojeda","Paz","Peralta","Pereyra","Ríos","Robledo","Romero","Salazar","Silva","Sosa","Toledo","Torres","Vidal","Villalba","Aguirre","Alarcón","Alvarado","Ayala","Benavídez","Bogado","Bolaños","Cantero","Carmona","Contreras","Dueñas","Escudero","Farías","Ferrari","Fontana","Grimaldi","Ianni","Lanzini","Mainero","Marchesín","Marino","Martelli","Mastrángelo","Moretti","Musso","Orsini","Pasquini","Perotti","Perrotta","Ricci","Rinaldi","Salvio","Scarpa","Signorini","Taborda","Tagliafico","Ugarte","Vietto","Zampedri","Zanotti","Baldivieso","Céspedes","Chumacero","Condori","Choque","Mamani","Quispe","Huanca","Llanos","Machaca","Paredes","Tola","Yupanqui","Ticona","Copa","Colque","Achá","Antezana","Aramayo","Arteaga","Balcázar","Bedoya","Cárdenas","Chocano","Crespo","Farfán","Guevara","Guerrero","Ibarra","Loyola","Mendieta","Mosquera","Obando","Palomino","Portocarrero","Restrepo","Ospina","Rentería","Tenorio","Valencia","Zapata","Arboleda","Cuadrado","Hinestroza","Murillo","Quiñones","Caicedo","Angulo","Arroyo","Bolívar","Carabalí","Chará","Dinas","Jiménez","Lerma","Mina","Palacio","Sinisterra","Solano","Tapias","Urrutia","Vélez","Yepes","Zuleta"]],"tam":[["Thiago","Caio","Renan","Vitor","Gustavo","Matheus","Leonardo","Rafael","Felipe","Igor","Davi","Enzo","Kaio","Yuri","Hiroshi","Kenji","Daiki","Ren","Takeshi","Shun","Lucca","Murilo","Otávio","Wesley","Ítalo","Danilo","Ruan","Joaquim","Emerson","Cauã","Yamato","Haruto","Sora","Kaito"],["Souza","Almeida","Barros","Cardoso","Duarte","Fonseca","Guedes","Lopes","Macedo","Nunes","Pires","Ramos","Teixeira","Vieira","Tanaka","Sato","Mori","Hayashi","Kimura","Abe","Albuquerque","Amaral","Andrade","Araújo","Assis","Azevedo","Bastos","Batista","Bezerra","Borges","Brandão","Cabral","Camargo","Campos","Cavalcanti","Coelho","Correia","Dantas","Farias","Freitas","Furtado","Gomes","Lacerda","Leite","Maciel","Magalhães","Medeiros","Moura","Nascimento","Neves","Peixoto","Prado","Rezende","Siqueira","Tavares","Toledo","Vasconcelos","Yamada","Nakamura","Ito","Kobayashi","Matsumoto","Inoue","Shimizu","Yoshida","Okada","Fujita","Hasegawa","Aoki","Sakamoto","Maeda","Ishikawa","Ogawa","Goto","Nishimura","Kondo","Endo","Saito","Ueda"]],"gra":[["Álvaro","Sergio","Iker","Raúl","Dani","Marcos","Hugo","Óscar","Pau","Jorge","Nuno","Rúben","Tiago","Diogo","Aitor","Unai","Borja","Nacho","Pol","Gerard","Xabi","Mikel","Jon","Andoni","Rafa","Fran","Ander","Ibai"],["García","Martínez","López","Gómez","Ruiz","Iglesias","Campos","Ferrer","Marín","Pons","Carvalho","Pinto","Monteiro","Sequeira","Aranda","Bermejo","Bustillo","Cabezas","Cano","Casas","Cordón","Egea","Escribano","Gallego","Garrido","Ibáñez","Lorente","Marcos","Mateos","Nogueira","Olmos","Prieto","Reig","Rubio","Sanz","Tomé","Urrutia","Vallejo","Zubieta","Etxeberria","Goikoetxea","Larrañaga","Ocaña","Pedrosa","Seoane","Barbosa","Cerqueira","Coutinho","Esteves","Gouveia","Matos","Moreira","Rebelo","Sampaio","Valente","Xavier"]],"ibe":[["Julien","Théo","Lucas","Antoine","Maxime","Romain","Baptiste","Quentin","Rémi","Killian","Nolan","Dorian","Alexis","Corentin","Damien","Étienne","Gaël","Hugo","Ilan","Jérémy","Loïc","Mathis","Pierrick","Sacha","Tristan","Valentin","Yoann","Zacharie"],["Lefèvre","Moreau","Girard","Fontaine","Rousseau","Barbier","Perrin","Marchand","Colin","Blanchard","Gaillard","Renard","Aubert","Bailly","Baudry","Benoît","Bertin","Besson","Boucher","Brunet","Carpentier","Chevalier","Collet","Da Costa","Delaunay","Denis","Dumont","Étienne","Fournier","Gauthier","Guérin","Hamon","Huet","Jacquet","Joly","Lambert","Leclerc","Lemaire","Maillard","Meunier","Navarro","Noël","Paris","Picard","Poulain","Rey","Riou","Roux","Servais","Thibault","Vidal","Weber"]],"kai":[["Callum","Jack","Harry","Oliver","Reece","Liam","Connor","Finlay","Rhys","Ewan","Declan","Tommy","Archie","Bradley","Cameron","Dylan","Elliot","Freddie","Gareth","Hamish","Isaac","Jamie","Kieran","Lewis","Morgan","Nathan","Owen","Preston","Rory","Sean","Toby","Wesley"],["Hughes","Walker","Reid","Barnes","Pearce","Doyle","Gallagher","Fraser","Whitlock","Ashworth","Kerr","Marsh","Atkinson","Bagshaw","Baxter","Blackwood","Bradshaw","Cartwright","Chandler","Cowell","Crossley","Dalton","Dawson","Ellison","Farrow","Gilmour","Haworth","Ingram","Jennings","Kirkland","Langley","Lockhart","Maddox","McAllister","McBride","Nolan","Oakley","Pritchard","Quigley","Redmond","Sinclair","Stanton","Thorne","Underwood","Wainwright","Whitaker","Yates","Ainsley","Buchanan","Campbell","Douglas","Gillespie","Henderson","MacLeod","Sutherland"]],"mar":[["Jonas","Lukas","Felix","Niklas","Tobias","Leon","Moritz","Jannik","Florian","Fabian","Sven","Mats","Bastian","Dominik","Emil","Finn","Gero","Hannes","Jasper","Kilian","Lennart","Malte","Noah","Oskar","Paul","Timo","Ole","Veit","Rasmus","Thies","Pieter","Joost","Bram","Daan"],["Weber","Schäfer","Hoffmann","Krüger","Brandt","Lang","Vogel","Keller","Neumann","Hartmann","Sommer","Engel","Albrecht","Baumann","Beckmann","Böhm","Busch","Dietrich","Ebert","Fischer","Graf","Haas","Herrmann","Jäger","Kaiser","Köhler","Lehmann","Maurer","Nowak","Ott","Pohl","Roth","Seidel","Thiel","Ulrich","Vetter","Wagner","Ziegler","Van der Berg","De Boer","Bakker","Visser","Smit","Meijer","Mulder","Bosman","Hendriks","Dijkstra","Vermeulen","Kuiper"]],"mel":[["Matteo","Luca","Federico","Riccardo","Gianluca","Davide","Nicola","Alessio","Stefano","Emanuele","Marco","Simone","Andrea","Cristiano","Daniele","Edoardo","Fabrizio","Giacomo","Lorenzo","Michele","Paolo","Raffaele","Salvatore","Tommaso","Umberto","Vittorio"],["Bianchi","Ferrara","Greco","Conti","Marino","Rizzo","Bruno","Gallo","Costa","Fabbri","Caruso","Moretti","Amato","Barone","Bellini","Benedetti","Bernardi","Caputo","Colombo","D'Angelo","De Luca","Donati","Fiore","Galli","Gentile","Giordano","Grasso","Leone","Longo","Mancini","Martini","Neri","Orlando","Palumbo","Piras","Riva","Santoro","Serra","Testa","Valentini","Vitale","Zanetti"]],"ria":[["Samuel","Achille","Etienne","Brice","Junior","Ferdinand","Blaise","Cedric","Yannick","Patrice","Serge","Romuald","Aristide","Boris","Clovis","Didier","Emmanuel","Francis","Guy","Hervé","Ismaël","Landry","Modeste","Nestor","Olivier","Prosper","Rodrigue"],["Mbarga","Essomba","Ngassa","Manga","Bikoro","Ekambi","Tchoua","Nkembe","Owona","Fouda","Abanda","Mvondo","Atangana","Bekolo","Biyik","Djoumessi","Eboué","Fotso","Kamdem","Kenfack","Mballa","Mbida","Ndzana","Nguema","Ondoa","Onana","Sadjo","Tagne","Tchakounté","Wandji","Yondo","Zambo","Ayissi","Bassong","Etame","Mekongo"]],"sah":[["Yassine","Amine","Karim","Youssef","Hamza","Mehdi","Ilyas","Bilal","Anas","Walid","Zakaria","Nabil","Adil","Badr","Chafik","Driss","Fouad","Hicham","Jalil","Khalid","Larbi","Mounir","Noureddine","Omar","Rachid","Saad","Tarek","Yahya"],["Benali","Haddad","Idrissi","Bennani","Ouali","Tazi","Rahmani","Alaoui","Chraibi","Lahlou","Saidi","Berrada","Amrani","Bouzid","Chaoui","Daoudi","El Fassi","Filali","Ghazali","Hakimi","Jebli","Kadiri","Lamrani","Mansouri","Naciri","Ouazzani","Qadiri","Rifai","Sefrioui","Tahiri","Zniber","Belkadi","Cherkaoui","Drissi","Essaadi","Fassi"]],"sko":[["Thabo","Sipho","Lwazi","Pieter","Johan","Themba","Kagiso","Willem","Bongani","Siya","Ruan","Jaco","Andile","Bheki","Cyril","Dumisani","Eben","Francois","Gcina","Hendrik","Innocent"],["Nkosi","Dlamini","Botha","Naidoo","Mokoena","Van Wyk","Zulu","Mahlangu","Pretorius","Khumalo","Ndlovu","Joubert","Cele","Du Plessis","Ferreira","Gumede","Hlongwane","Jansen","Kruger","Maseko","Molefe","Ngcobo","Nel","Radebe","Sithole","Steyn","Tshabalala","Venter","Xaba","Zondi","Coetzee","Van der Merwe","Motaung","Mthembu"]],"zen":[["Luka","Ivan","Marko","Josip","Ante","Dario","Filip","Tomislav","Nikola","Petar","Mateo","Karlo","Bruno","Davor","Goran","Hrvoje","Igor","Jakov","Kristijan","Leon","Mario","Neven","Robert"],["Horvat","Babić","Jurić","Novak","Kovač","Perić","Vidović","Matić","Bošnjak","Lukić","Tomić","Radić","Bilić","Blažević","Cvitković","Delić","Franjić","Grgić","Jelić","Knežević","Marić","Milić","Pavlović","Rukavina","Šarić","Tadić","Vuković","Zorić","Burić","Dragić","Ćorić"]],"bai":[["Dmitri","Ivan","Nikolai","Sergei","Mikhail","Andrei","Pavel","Yuri","Oleg","Anton","Vasili","Kirill","Alexei","Boris","Denis","Evgeni","Fyodor","Gleb","Ilya","Konstantin","Maxim","Nikita","Roman","Stanislav","Timofei","Vladimir"],["Volkov","Petrov","Smirnov","Kuznetsov","Sokolov","Morozov","Orlov","Lebedev","Zhukov","Baranov","Antonov","Gromov","Alekseev","Belov","Bogdanov","Chernov","Danilov","Fomin","Gusev","Ivanchenko","Kalinin","Kiselev","Lazarev","Maksimov","Nikitin","Osipov","Pavlenko","Rybakov","Savelev","Titov","Ushakov","Vinogradov","Yakovlev","Zaitsev","Tsereteli","Beridze","Kapanadze"]],"est":[["Marek","Tomas","Jaan","Matej","Andres","Peter","Karel","Lukas","Rein","Jakub","Erik","Gustav","Henri","Indrek","Jiri","Kaspar","Martin","Oskar","Rasmus","Silver","Toomas","Viktor"],["Novak","Kask","Horvath","Tamm","Kovac","Sepp","Magi","Hruska","Varga","Parn","Adamec","Bartos","Cerny","Dvorak","Eller","Jarvis","Kallas","Laane","Mikk","Nurk","Ojala","Pihlak","Roos","Saar","Teder","Uibo","Vaher","Kuzmik","Ondrus","Sedlak","Svoboda","Valach"]],"kos":[["Arman","Timur","Daulet","Bauyrzhan","Nurlan","Yerlan","Askar","Rustem","Marat","Aidos","Alibek","Baurzhan","Dias","Erbol","Ilyas","Kanat","Meirzhan","Nurbol","Ruslan","Samat","Zhaslan"],["Nurgaliev","Akhmetov","Sadykov","Bekov","Kasenov","Tulegenov","Omarov","Iskakov","Serikov","Dauletov","Abdrakhmanov","Baimukhanov","Dosmukhamedov","Ermekov","Galiev","Kairatov","Mukhamedov","Nazarbekov","Orazbayev","Rakhimov","Suleimenov","Tokhtarov","Utepov","Zhakupov","Zhumabekov","Amanov","Beisenov","Kenzhebayev","Sagintayev"]],"net":[["Yossi","Noam","Eitan","Omer","Itai","Guy","Amir","Tal","Ori","Lior","Avi","Dor","Elad","Gal","Hadar","Idan","Kobi","Liron","Nir","Oren","Ran","Shai","Uri","Yaniv","Zvi"],["Cohen","Levi","Mizrahi","Peretz","Biton","Dahan","Avraham","Friedman","Shapiro","Katz","Azulay","Barak","Ben-David","Carmi","Dayan","Edri","Gabai","Hadad","Ilan","Jerbi","Kaplan","Lavi","Malka","Navon","Ohana","Pinto","Rosen","Sasson","Tal","Uzan","Vaknin","Yosef","Zohar"]],"ove":[["Henrik","Magnus","Sander","Anders","Erik","Torstein","Jonas","Kristian","Espen","Tobias","Bjørn","Håkon","Ivar","Kåre","Leif","Mikkel","Njål","Odd","Per","Ragnar","Sindre","Trygve","Ulf","Vidar"],["Hansen","Berg","Lunde","Solberg","Nilsen","Dahl","Strand","Halvorsen","Moen","Haugen","Aasen","Bakken","Eide","Fjeld","Grønvold","Hagen","Iversen","Jensen","Knudsen","Lie","Myhre","Næss","Olsen","Pedersen","Rasmussen","Skog","Thorsen","Ulvestad","Vik","Wold","Ødegård","Aamodt","Brekke","Christiansen","Dalen","Ellingsen"]]},"players":[{"id":"r_gabrielvillamil","n":"Gabriel Villamíl","nat":"Sotoa","a":29,"p":"MC","s":["MD"],"o":70,"pt":70,"h":183,"b":100,"f":"D","at":[70,71,71,71,70,60,62,70],"sk":"#b8918c","hr":"#221d1e","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_gabrielvillamil.webp","c":"CD Héroicos de Peronia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_santiagosimon","n":"Santiago Simón","nat":"Peronia","a":28,"p":"LD","s":[],"o":74,"pt":74,"h":181,"b":92,"f":"D","at":[87,84,79,73,61,69,79,72],"sk":"#b68469","hr":"#1f1916","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_santiagosimon.webp","c":"Sporty VV Klub Estovackia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_kimjuchan","n":"Kim Ju Chan","nat":"Tamago","a":26,"p":"EI","s":["MI"],"o":67,"pt":69,"h":174,"b":100,"f":"D","at":[79,79,65,57,56,28,64,63],"sk":"#e4ba9f","hr":"#191718","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_kimjuchan.webp","c":"Independiente de Riada","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_pablocampos","n":"Pablo Campos","nat":"Grammes","a":28,"p":"POR","s":[],"o":70,"pt":70,"h":188,"b":100,"f":"D","at":[25,33,43,62,33,78,73,75],"sk":"#bb765b","hr":"#0b0808","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_pablocampos.webp","c":"Grammes FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_andersonduarte","n":"Anderson Duarte","nat":"Valurria","a":26,"p":"ED","s":["MD"],"o":70,"pt":73,"h":175,"b":100,"f":"I","at":[81,82,70,60,60,37,66,61],"sk":"#dda791","hr":"#1d1513","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_andersonduarte.webp","c":"Sportivo Calcio di Kaigam","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_lachlanbrook","n":"Lachlan Brook","nat":"Kaigam","a":29,"p":"MD","s":["ED"],"o":66,"pt":66,"h":178,"b":100,"f":"I","at":[81,82,78,60,62,36,67,62],"sk":"#b86d68","hr":"#1e1210","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_lachlanbrook.webp","c":"FC Santa Rosa","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_simoneriksson","n":"Simon Eriksson","nat":"Overmark","a":24,"p":"POR","s":[],"o":74,"pt":80,"h":195,"b":92,"f":"D","at":[30,39,47,68,37,79,83,76],"sk":"#da9e88","hr":"#2a2224","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_simoneriksson.webp","c":"Inter Focuri","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_rodrygo","n":"Rodrygo","nat":"Tamago","a":29,"p":"EI","s":[],"o":83,"pt":83,"h":174,"b":92,"f":"D","at":[85,86,87,80,77,29,68,82],"sk":"#aa6f55","hr":"#1d1c1d","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_rodrygo.webp","c":"Red Gull Club Tellin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_giorgiguliashvili","n":"Giorgi Guliashvili","nat":"Baikal","a":29,"p":"DC","s":[],"o":68,"pt":69,"h":175,"b":100,"f":"D","at":[68,72,68,63,68,28,64,63],"sk":"#e9b5a4","hr":"#17110d","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_giorgiguliashvili.webp","c":"Grammes FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_marceloflores","n":"Marcelo Flores","nat":"Kaigam","a":27,"p":"EI","s":["MI"],"o":73,"pt":73,"h":163,"b":92,"f":"D","at":[80,83,79,69,61,35,62,67],"sk":"#b5817e","hr":"#2e1f20","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_marceloflores.webp","c":"ØRK FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_oscarperea","n":"Óscar Perea","nat":"Magayanes","a":25,"p":"MI","s":["MC"],"o":71,"pt":75,"h":174,"b":100,"f":"D","at":[84,86,79,67,60,29,72,70],"sk":"#a95a48","hr":"#161516","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_oscarperea.webp","c":"Grammes FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_nicolasbolcato","n":"Nicolás Bolcato","nat":"Peronia","a":26,"p":"POR","s":[],"o":71,"pt":73,"h":190,"b":100,"f":"D","at":[25,35,45,63,35,77,75,75],"sk":"#db9988","hr":"#201714","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_nicolasbolcato.webp","c":"Grammes FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_cristianolivera","n":"Cristian Olivera","nat":"Valurria","a":28,"p":"ED","s":["MD"],"o":74,"pt":74,"h":175,"b":100,"f":"D","at":[84,85,76,63,63,37,65,61],"sk":"#b17756","hr":"#110d0a","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_cristianolivera.webp","c":"Klaipeda United","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_tomaspalacios","n":"Tomás Palacios","nat":"Valurria","a":27,"p":"DFC","s":[],"o":74,"pt":74,"h":196,"b":92,"f":"I","at":[73,72,59,59,44,77,75,63],"sk":"#ebbcae","hr":"#2f211e","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_tomaspalacios.webp","c":"Sporting Lake Baikal","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_allanwlk","n":"Allan Wlk","nat":"Morvicia","a":27,"p":"DC","s":[],"o":72,"pt":72,"h":188,"b":100,"f":"D","at":[75,75,68,56,71,25,74,58],"sk":"#c89482","hr":"#1c171d","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_allanwlk.webp","c":"Olympique de Iberia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_rodrigochagas","n":"Rodrigo Chagas","nat":"Valurria","a":27,"p":"MC","s":["MCD"],"o":66,"pt":66,"h":176,"b":92,"f":"D","at":[74,74,69,65,63,66,65,63],"sk":"#b88577","hr":"#110d16","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_rodrigochagas.webp","c":"FC Santa Rosa","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_lucasbeltran","n":"Lucas Beltrán","nat":"Valurria","a":29,"p":"DC","s":[],"o":75,"pt":75,"h":174,"b":100,"f":"D","at":[69,73,78,74,77,44,75,76],"sk":"#c98f7d","hr":"#251810","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_lucasbeltran.webp","c":"Sporting Lake Baikal","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_ulisesgimenez","n":"Ulises Giménez","nat":"Peronia","a":24,"p":"DFC","s":[],"o":68,"pt":74,"h":178,"b":92,"f":"D","at":[84,84,69,59,36,64,72,65],"sk":"#c88769","hr":"#261f1a","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_ulisesgimenez.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_kevinjappert","n":"Kevin Jappert","nat":"Peronia","a":26,"p":"DFC","s":[],"o":70,"pt":72,"h":189,"b":100,"f":"D","at":[74,73,59,56,44,70,76,56],"sk":"#ebbb98","hr":"#443928","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_kevinjappert.webp","c":"Al-Sahar","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_juancarlosgauto","n":"Juan Carlos Gauto","nat":"Peronia","a":26,"p":"MD","s":[],"o":72,"pt":74,"h":172,"b":92,"f":"D","at":[84,84,78,70,65,31,67,70],"sk":"#d79272","hr":"#5b4e48","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_juancarlosgauto.webp","c":"Olympique de Iberia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_francowatson","n":"Franco Watson","nat":"Peronia","a":28,"p":"MP","s":["MC"],"o":71,"pt":71,"h":177,"b":92,"f":"D","at":[73,72,70,75,63,56,58,74],"sk":"#9f7261","hr":"#342b25","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_francowatson.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_renzoorihuela","n":"Renzo Orihuela","nat":"Valurria","a":29,"p":"DFC","s":[],"o":69,"pt":69,"h":183,"b":92,"f":"D","at":[72,71,68,62,41,68,74,64],"sk":"#f2c7af","hr":"#4e320c","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_renzoorihuela.webp","c":"FC Santa Rosa","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_manuelpanaro","n":"Manuel Panaro","nat":"Valurria","a":28,"p":"MI","s":["MD"],"o":66,"pt":66,"h":181,"b":100,"f":"D","at":[84,85,77,61,58,34,66,63],"sk":"#dba596","hr":"#3b2820","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_manuelpanaro.webp","c":"Melonia City FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_jeysonchura","n":"Jeyson Chura","nat":"Sotoa","a":28,"p":"MI","s":["MC"],"o":66,"pt":66,"h":176,"b":100,"f":"D","at":[84,82,71,66,59,37,64,62],"sk":"#b79884","hr":"#171313","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_jeysonchura.webp","c":"Independiente de Riada","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_agustinamado","n":"Agustín Amado","nat":"Valurria","a":29,"p":"MC","s":[],"o":69,"pt":69,"h":176,"b":92,"f":"D","at":[68,67,78,71,55,65,47,67],"sk":"#d38e78","hr":"#2c1a18","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_agustinamado.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_facundosanguinetti","n":"Facundo Sanguinetti","nat":"Valurria","a":29,"p":"POR","s":[],"o":72,"pt":72,"h":185,"b":92,"f":"D","at":[25,37,42,65,32,81,69,78],"sk":"#db9e84","hr":"#3e2d22","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_facundosanguinetti.webp","c":"Olympique de Iberia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_ignaciomiramon","n":"Ignacio Miramón","nat":"Valurria","a":27,"p":"MCD","s":[],"o":70,"pt":70,"h":175,"b":100,"f":"D","at":[70,66,74,68,60,68,80,66],"sk":"#ddaa97","hr":"#634638","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_ignaciomiramon.webp","c":"Sportivo Calcio di Kaigam","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_leandrobrey","n":"Leandro Brey","nat":"Peronia","a":28,"p":"POR","s":[],"o":76,"pt":76,"h":193,"b":100,"f":"D","at":[30,41,48,63,38,81,81,80],"sk":"#c9977b","hr":"#0c0a09","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_leandrobrey.webp","c":"Groz Sport Kulübü","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_davidzalazar","n":"David Zalazar","nat":"Valurria","a":28,"p":"ED","s":[],"o":69,"pt":69,"h":180,"b":100,"f":"D","at":[77,79,69,66,61,37,58,67],"sk":"#b1836b","hr":"#292e2f","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_davidzalazar.webp","c":"Independiente de Riada","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_francoalfonso","n":"Franco Alfonso","nat":"Peronia","a":28,"p":"MD","s":["ED"],"o":68,"pt":68,"h":165,"b":100,"f":"D","at":[86,88,82,67,62,42,50,65],"sk":"#dfa188","hr":"#5c463f","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_francoalfonso.webp","c":"Independiente de Riada","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_facundodibiasi","n":"Facundo Di Biasi","nat":"Valurria","a":25,"p":"MCD","s":["MC"],"o":70,"pt":74,"h":175,"b":92,"f":"D","at":[80,76,71,69,53,64,84,64],"sk":"#e2b39c","hr":"#100c08","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_facundodibiasi.webp","c":"Olympique de Iberia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_matiaslugo","n":"Matías Lugo","nat":"Peronia","a":29,"p":"MC","s":[],"o":68,"pt":68,"h":170,"b":100,"f":"D","at":[67,69,69,69,49,66,70,66],"sk":"#b17461","hr":"#1a181b","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_matiaslugo.webp","c":"Grammes FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_gonzalomorales","n":"Gonzalo Morales","nat":"Valurria","a":27,"p":"DC","s":[],"o":72,"pt":72,"h":178,"b":108,"f":"I","at":[85,78,67,60,66,25,75,64],"sk":"#e0a478","hr":"#2f2924","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_gonzalomorales.webp","c":"Grammes FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_jordanbarrera","n":"Jordan Barrera","nat":"Magayanes","a":24,"p":"MP","s":["DC"],"o":68,"pt":74,"h":180,"b":92,"f":"D","at":[81,79,77,68,54,35,61,62],"sk":"#d69976","hr":"#ae7c70","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_jordanbarrera.webp","c":"Melonia City FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_estebanmatus","n":"Esteban Matus","nat":"Costas Unidas","a":28,"p":"LI","s":[],"o":69,"pt":69,"h":173,"b":92,"f":"I","at":[82,74,70,60,55,67,72,57],"sk":"#a9614c","hr":"#040302","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_estebanmatus.webp","c":"Al-Sahar","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_joelcanchimbo","n":"Joel Canchimbo","nat":"Magayanes","a":25,"p":"MD","s":["ED"],"o":72,"pt":75,"h":177,"b":100,"f":"D","at":[84,84,77,72,64,28,70,66],"sk":"#8f5b40","hr":"#11100e","hs":"largo","bd":"corta","ac":[],"ph":"assets/players/football/r_joelcanchimbo.webp","c":"Al-Sahar","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_valentincarboni","n":"Valentín Carboni","nat":"Peronia","a":25,"p":"MP","s":["MC"],"o":79,"pt":83,"h":185,"b":100,"f":"I","at":[80,78,81,80,77,52,72,78],"sk":"#e9c19f","hr":"#0f0d08","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_valentincarboni.webp","c":"Sporting Lake Baikal","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_agustinlagos","n":"Agustín Lagos","nat":"Peronia","a":29,"p":"LD","s":["LI"],"o":70,"pt":70,"h":184,"b":100,"f":"D","at":[83,80,71,66,56,66,75,66],"sk":"#df9074","hr":"#060508","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_agustinlagos.webp","c":"Grammes FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_matkomiljevic","n":"Matko Miljević","nat":"Magayanes","a":29,"p":"MP","s":[],"o":71,"pt":71,"h":175,"b":100,"f":"D","at":[63,64,75,72,66,54,61,69],"sk":"#c4a397","hr":"#393231","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_matkomiljevic.webp","c":"Sportivo Calcio di Kaigam","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_romeobenitez","n":"Romeo Benítez","nat":"Morvicia","a":28,"p":"MI","s":[],"o":70,"pt":70,"h":170,"b":92,"f":"D","at":[80,82,76,69,59,31,61,68],"sk":"#e8a485","hr":"#3b2b2d","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_romeobenitez.webp","c":"FC Santa Rosa","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_francogonzalez","n":"Franco González","nat":"Valurria","a":26,"p":"MP","s":[],"o":70,"pt":72,"h":165,"b":100,"f":"D","at":[82,84,80,69,65,40,63,67],"sk":"#b87c66","hr":"#382a27","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_francogonzalez.webp","c":"CD Héroicos de Peronia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_manuelduarte","n":"Manuel Duarte","nat":"Peronia","a":29,"p":"MC","s":[],"o":65,"pt":65,"h":171,"b":92,"f":"D","at":[73,73,72,66,64,48,58,60],"sk":"#ecb28d","hr":"#534336","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_manuelduarte.webp","c":"Melonia City FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_tomasangel","n":"Tomás Ángel","nat":"Magayanes","a":27,"p":"DC","s":[],"o":70,"pt":70,"h":175,"b":100,"f":"I","at":[77,76,69,59,63,25,67,58],"sk":"#c98a6d","hr":"#3b2823","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_tomasangel.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_brianaguirre","n":"Brian Aguirre","nat":"Peronia","a":27,"p":"EI","s":["ED"],"o":75,"pt":75,"h":175,"b":92,"f":"D","at":[88,84,75,69,64,32,67,65],"sk":"#b67053","hr":"#191514","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_brianaguirre.webp","c":"Klaipeda United","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_yerlinquinonez","n":"Yerlin Quiñónez","nat":"Sotoa","a":29,"p":"MI","s":["EI"],"o":67,"pt":67,"h":177,"b":100,"f":"D","at":[82,81,72,63,64,34,70,67],"sk":"#b3664f","hr":"#191b1e","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_yerlinquinonez.webp","c":"Sköte FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_gastongonzalez","n":"Gastón González","nat":"Peronia","a":29,"p":"MI","s":["MD"],"o":69,"pt":69,"h":183,"b":100,"f":"I","at":[82,78,72,65,68,38,82,66],"sk":"#f5be99","hr":"#402505","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_gastongonzalez.webp","c":"Melonia City FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_ginosantilli","n":"Gino Santilli","nat":"Peronia","a":29,"p":"POR","s":[],"o":67,"pt":67,"h":191,"b":92,"f":"D","at":[25,33,42,60,32,72,72,70],"sk":"#d39378","hr":"#191819","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_ginosantilli.webp","c":"Sportivo Calcio di Kaigam","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_matiasperello","n":"Matías Perelló","nat":"Peronia","a":29,"p":"MD","s":[],"o":67,"pt":67,"h":170,"b":100,"f":"D","at":[69,75,80,64,66,30,53,64],"sk":"#ae8785","hr":"#8b635c","hs":"largo","bd":"ninguna","ac":[],"ph":"assets/players/football/r_matiasperello.webp","c":"Melonia City FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_rubenlezcano","n":"Rubén Lezcano","nat":"Morvicia","a":26,"p":"MD","s":["MI"],"o":74,"pt":76,"h":176,"b":100,"f":"I","at":[78,76,77,76,67,63,69,71],"sk":"#cc9674","hr":"#3a322d","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_rubenlezcano.webp","c":"Groz Sport Kulübü","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_marceloesponda","n":"Marcelo Esponda","nat":"Peronia","a":27,"p":"MCD","s":["DFC"],"o":68,"pt":68,"h":176,"b":100,"f":"D","at":[70,70,69,68,68,66,70,68],"sk":"#b87867","hr":"#351f18","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_marceloesponda.webp","c":"CD Héroicos de Peronia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_josenescobar","n":"Josen Escobar","nat":"Magayanes","a":26,"p":"MCD","s":["DFC"],"o":74,"pt":76,"h":175,"b":100,"f":"D","at":[77,78,77,75,32,72,75,70],"sk":"#925244","hr":"#1c1717","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_josenescobar.webp","c":"Inter Focuri","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_iansubiabre","n":"Ian Subiabre","nat":"Valurria","a":23,"p":"MI","s":["MD"],"o":75,"pt":83,"h":171,"b":100,"f":"I","at":[94,94,85,69,70,38,75,74],"sk":"#b57b65","hr":"#0e0d0b","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_iansubiabre.webp","c":"Sporting Lake Baikal","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_kendrypaez","n":"Kendry Páez","nat":"Sotoa","a":23,"p":"MP","s":["MC"],"o":78,"pt":85,"h":178,"b":92,"f":"I","at":[83,80,86,77,73,50,65,76],"sk":"#ac674e","hr":"#120f0d","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_kendrypaez.webp","c":"Groz Sport Kulübü","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_teorodriguezpagano","n":"Teo Rodríguez Pagano","nat":"Peronia","a":25,"p":"LI","s":["LD"],"o":71,"pt":75,"h":178,"b":92,"f":"I","at":[83,82,71,63,45,71,69,57],"sk":"#f1b499","hr":"#201719","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_teorodriguezpagano.webp","c":"Grammes FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_janogordon","n":"Jano Gordon","nat":"Peronia","a":26,"p":"LD","s":[],"o":75,"pt":77,"h":183,"b":92,"f":"D","at":[81,78,67,70,41,73,78,67],"sk":"#db745f","hr":"#170f13","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_janogordon.webp","c":"Klaipeda United","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_edwinmosquera","n":"Edwin Mosquera","nat":"Magayanes","a":29,"p":"MD","s":[],"o":67,"pt":67,"h":172,"b":92,"f":"D","at":[85,84,73,65,58,25,70,62],"sk":"#834b34","hr":"#211614","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_edwinmosquera.webp","c":"Universidad Costas Unidas","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_lautaromillan","n":"Lautaro Millán","nat":"Costas Unidas","a":25,"p":"MC","s":["MI"],"o":73,"pt":77,"h":169,"b":100,"f":"D","at":[74,77,76,75,56,68,68,71],"sk":"#bd7e6c","hr":"#170d0d","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_lautaromillan.webp","c":"Groz Sport Kulübü","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_mateoponte","n":"Mateo Ponte","nat":"Valurria","a":27,"p":"LD","s":["LI"],"o":71,"pt":71,"h":183,"b":100,"f":"D","at":[87,85,73,62,38,69,72,57],"sk":"#d39578","hr":"#211d1d","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_mateoponte.webp","c":"Olympique de Iberia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_facundomunoa","n":"Facundo Muñoa","nat":"Valurria","a":26,"p":"MI","s":["EI"],"o":70,"pt":72,"h":171,"b":92,"f":"I","at":[76,76,81,64,60,66,69,70],"sk":"#c57852","hr":"#281715","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_facundomunoa.webp","c":"Independiente de Riada","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_lucasvillalba","n":"Lucas Villalba","nat":"Valurria","a":29,"p":"ED","s":[],"o":71,"pt":71,"h":183,"b":92,"f":"D","at":[83,80,68,66,61,38,66,64],"sk":"#e1a48d","hr":"#2d2524","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_lucasvillalba.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_bastianyanez","n":"Bastián Yáñez","nat":"Costas Unidas","a":29,"p":"MI","s":[],"o":68,"pt":68,"h":175,"b":100,"f":"I","at":[82,81,75,66,61,28,76,61],"sk":"#c29b84","hr":"#2a2528","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_bastianyanez.webp","c":"Fútbol Club de Tamago","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_joseespinola","n":"José Espínola","nat":"Morvicia","a":29,"p":"MCD","s":[],"o":67,"pt":67,"h":172,"b":100,"f":"D","at":[74,73,69,63,53,71,80,64],"sk":"#ca8866","hr":"#211c1f","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_joseespinola.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_arthurchaves","n":"Arthur Chaves","nat":"Tamago","a":29,"p":"DFC","s":[],"o":75,"pt":75,"h":188,"b":92,"f":"D","at":[82,77,58,54,36,76,79,58],"sk":"#d9b4a4","hr":"#332d22","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_arthurchaves.webp","c":"Groz Sport Kulübü","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_gabrielaguayo","n":"Gabriel Aguayo","nat":"Morvicia","a":25,"p":"MD","s":["ED"],"o":70,"pt":74,"h":169,"b":92,"f":"D","at":[88,88,80,69,64,41,66,63],"sk":"#dda09d","hr":"#695659","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_gabrielaguayo.webp","c":"Sportivo Calcio di Kaigam","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_janlucumi","n":"Jan Lucumí","nat":"Magayanes","a":26,"p":"ED","s":[],"o":72,"pt":75,"h":180,"b":92,"f":"D","at":[82,80,72,72,64,32,69,64],"sk":"#764337","hr":"#141112","hs":"largo","bd":"completa","ac":[],"ph":"assets/players/football/r_janlucumi.webp","c":"ØRK FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_eliastorres","n":"Elías Torres","nat":"Valurria","a":29,"p":"DC","s":[],"o":69,"pt":69,"h":186,"b":100,"f":"D","at":[77,74,67,58,63,25,79,60],"sk":"#e1b08f","hr":"#1f1a16","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_eliastorres.webp","c":"Sportivo Calcio di Kaigam","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_yairgonzalez","n":"Yair González","nat":"Peronia","a":28,"p":"MI","s":["MD"],"o":67,"pt":67,"h":173,"b":100,"f":"D","at":[78,82,74,68,62,25,50,66],"sk":"#dba48e","hr":"#41261e","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_yairgonzalez.webp","c":"Independiente de Riada","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_juanmanuelgutierrez","n":"Juan Manuel Gutiérrez","nat":"Valurria","a":28,"p":"MI","s":["EI"],"o":71,"pt":71,"h":173,"b":100,"f":"D","at":[86,88,82,68,71,37,68,67],"sk":"#c59783","hr":"#171814","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_juanmanuelgutierrez.webp","c":"Al-Sahar","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_ivanleguizamon","n":"Iván Leguizamón","nat":"Morvicia","a":28,"p":"EI","s":["ED"],"o":72,"pt":72,"h":173,"b":100,"f":"I","at":[86,84,70,69,59,36,63,63],"sk":"#dd9774","hr":"#3d3030","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_ivanleguizamon.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_jeronimodomina","n":"Jerónimo Domina","nat":"Valurria","a":25,"p":"DC","s":[],"o":72,"pt":75,"h":171,"b":100,"f":"D","at":[76,76,73,61,66,42,67,60],"sk":"#efb6a0","hr":"#30190f","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_jeronimodomina.webp","c":"Olympique de Iberia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_diegoenriquez","n":"Diego Enríquez","nat":"Sotoa","a":28,"p":"POR","s":[],"o":71,"pt":71,"h":185,"b":92,"f":"D","at":[25,34,43,64,33,79,71,78],"sk":"#febeaa","hr":"#32322f","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_diegoenriquez.webp","c":"Olympique de Iberia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_matiasfernandez","n":"Matías Fernández","nat":"Peronia","a":29,"p":"MP","s":[],"o":69,"pt":69,"h":173,"b":100,"f":"D","at":[71,73,75,70,64,36,62,65],"sk":"#dc9e83","hr":"#1a1310","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_matiasfernandez.webp","c":"FC Santa Rosa","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_facundolencioni","n":"Facundo Lencioni","nat":"Peronia","a":29,"p":"MI","s":["MC"],"o":70,"pt":70,"h":179,"b":92,"f":"D","at":[73,75,75,69,58,41,69,68],"sk":"#e7ad94","hr":"#241d19","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_facundolencioni.webp","c":"CD Héroicos de Peronia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_alvaromontoro","n":"Álvaro Montoro","nat":"Peronia","a":23,"p":"MI","s":["MD"],"o":78,"pt":86,"h":170,"b":92,"f":"D","at":[83,87,87,80,65,36,59,75],"sk":"#e6ab99","hr":"#231c19","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_alvaromontoro.webp","c":"Maccabi Tel Shava","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_tomasgonzalez","n":"Tomás González","nat":"Peronia","a":27,"p":"DC","s":[],"o":67,"pt":67,"h":168,"b":100,"f":"D","at":[76,78,65,56,59,30,54,56],"sk":"#c78a68","hr":"#4f403d","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_tomasgonzalez.webp","c":"CD Héroicos de Peronia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_santiagogonzalez","n":"Santiago González","nat":"Valurria","a":27,"p":"MC","s":[],"o":70,"pt":70,"h":183,"b":108,"f":"D","at":[72,70,65,71,55,66,84,68],"sk":"#e0a573","hr":"#181e22","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_santiagogonzalez.webp","c":"Olympique de Iberia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_matiasabaldo","n":"Matías Abaldo","nat":"Valurria","a":26,"p":"MI","s":["EI"],"o":75,"pt":77,"h":172,"b":92,"f":"D","at":[84,90,82,76,71,47,60,75],"sk":"#d39d8d","hr":"#564c41","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_matiasabaldo.webp","c":"Sporty VV Klub Estovackia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_lautarovargas","n":"Lautaro Vargas","nat":"Peronia","a":25,"p":"LD","s":["LI"],"o":75,"pt":79,"h":173,"b":100,"f":"D","at":[89,88,76,65,48,71,80,60],"sk":"#c18465","hr":"#2c2829","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_lautarovargas.webp","c":"Klaipeda United","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_juansforza","n":"Juan Sforza","nat":"Peronia","a":28,"p":"MC","s":["MI"],"o":71,"pt":71,"h":180,"b":92,"f":"I","at":[70,74,70,72,64,66,72,70],"sk":"#b77c6e","hr":"#241c1b","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_juansforza.webp","c":"Sportivo Calcio di Kaigam","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_lucassilva","n":"Lucas Silva","nat":"Valurria","a":23,"p":"MCD","s":[],"o":75,"pt":83,"h":179,"b":92,"f":"D","at":[73,64,77,76,61,73,71,72],"sk":"#b7876d","hr":"#0d0c08","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_lucassilva.webp","c":"Sporty VV Klub Estovackia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_matiasgalarza","n":"Matías Galarza","nat":"Valurria","a":28,"p":"MCD","s":["MC"],"o":76,"pt":76,"h":180,"b":100,"f":"D","at":[67,67,80,74,59,72,74,74],"sk":"#a56a56","hr":"#211d1e","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_matiasgalarza.webp","c":"Groz Sport Kulübü","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_hugoquintana","n":"Hugo Quintana","nat":"Morvicia","a":29,"p":"MC","s":["MI"],"o":71,"pt":71,"h":172,"b":100,"f":"D","at":[70,69,76,74,60,57,58,69],"sk":"#dca186","hr":"#392824","hs":"largo","bd":"corta","ac":[],"ph":"assets/players/football/r_hugoquintana.webp","c":"Grammes FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_brunobarticciotto","n":"Bruno Barticciotto","nat":"Costas Unidas","a":29,"p":"DC","s":[],"o":70,"pt":70,"h":176,"b":92,"f":"D","at":[75,76,71,65,64,25,70,64],"sk":"#a67870","hr":"#4f3d38","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_brunobarticciotto.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_francoibarra","n":"Franco Ibarra","nat":"Peronia","a":29,"p":"MCD","s":["MC"],"o":75,"pt":75,"h":175,"b":100,"f":"D","at":[67,69,72,74,54,75,87,73],"sk":"#d39487","hr":"#161320","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_francoibarra.webp","c":"Klaipeda United","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_fabricioperez","n":"Fabricio Pérez","nat":"Peronia","a":25,"p":"MI","s":[],"o":74,"pt":78,"h":180,"b":92,"f":"D","at":[86,88,82,69,68,28,79,71],"sk":"#e19979","hr":"#18120f","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_fabricioperez.webp","c":"Groz Sport Kulübü","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_gustavovargas","n":"Gustavo Vargas","nat":"Morvicia","a":29,"p":"DFC","s":[],"o":72,"pt":72,"h":181,"b":100,"f":"D","at":[67,64,62,49,28,76,77,53],"sk":"#ecaa90","hr":"#271b1b","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_gustavovargas.webp","c":"Al-Sahar","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_franconicola","n":"Franco Nicola","nat":"Valurria","a":28,"p":"MI","s":["MC"],"o":69,"pt":69,"h":178,"b":92,"f":"I","at":[83,78,74,69,66,44,63,66],"sk":"#cea89f","hr":"#070709","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_franconicola.webp","c":"CD Héroicos de Peronia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_felipepenabiafore","n":"Felipe Peña Biafore","nat":"Peronia","a":29,"p":"MCD","s":["MC"],"o":70,"pt":70,"h":180,"b":92,"f":"D","at":[68,67,69,70,62,71,73,69],"sk":"#c0856b","hr":"#2c1b16","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_felipepenabiafore.webp","c":"Sportivo Calcio di Kaigam","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_aulioliveros","n":"Auli Oliveros","nat":"Magayanes","a":29,"p":"MP","s":[],"o":68,"pt":68,"h":170,"b":92,"f":"D","at":[79,81,72,68,68,60,65,65],"sk":"#c88f75","hr":"#090c0c","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_aulioliveros.webp","c":"Fútbol Club de Tamago","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_agustinpalavecino","n":"Agustín Palavecino","nat":"Peronia","a":27,"p":"MD","s":[],"o":70,"pt":70,"h":184,"b":100,"f":"D","at":[83,78,74,68,66,38,75,66],"sk":"#e1a38a","hr":"#2c221c","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_agustinpalavecino.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_marcodicesare","n":"Marco Di Cesare","nat":"Peronia","a":28,"p":"DFC","s":[],"o":79,"pt":79,"h":186,"b":92,"f":"D","at":[70,65,60,60,38,80,90,63],"sk":"#e2b99f","hr":"#191313","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_marcodicesare.webp","c":"Sporting Lake Baikal","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_danielgonzalez","n":"Daniel González","nat":"Costas Unidas","a":28,"p":"DFC","s":[],"o":71,"pt":71,"h":183,"b":92,"f":"D","at":[75,74,56,50,25,72,77,50],"sk":"#ce8c67","hr":"#131709","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_danielgonzalez.webp","c":"Al-Sahar","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_frankarlosbenitez","n":"Frankarlos Benítez","nat":"Magayanes","a":26,"p":"POR","s":[],"o":70,"pt":73,"h":188,"b":100,"f":"D","at":[45,59,45,61,35,75,71,69],"sk":"#c8867a","hr":"#110c11","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_frankarlosbenitez.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_robsonmatheus","n":"Robson Matheus","nat":"Sotoa","a":28,"p":"MC","s":["MD"],"o":72,"pt":72,"h":174,"b":100,"f":"I","at":[71,71,73,73,71,61,71,71],"sk":"#ca9f94","hr":"#1e1c20","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_robsonmatheus.webp","c":"Grammes FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_alcidesbenitez","n":"Alcides Benítez","nat":"Morvicia","a":28,"p":"LD","s":["LI"],"o":71,"pt":71,"h":168,"b":100,"f":"D","at":[96,90,79,61,45,70,65,56],"sk":"#c38668","hr":"#3e302d","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_alcidesbenitez.webp","c":"CD Héroicos de Peronia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_maxlorencastro","n":"Maxloren Castro","nat":"Sotoa","a":23,"p":"EI","s":["MI"],"o":77,"pt":85,"h":168,"b":92,"f":"I","at":[88,88,83,67,63,50,63,69],"sk":"#e0967d","hr":"#12100f","hs":"largo","bd":"corta","ac":[],"ph":"assets/players/football/r_maxlorencastro.webp","c":"Groz Sport Kulübü","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_alexluna","n":"Alex Luna","nat":"Valurria","a":26,"p":"MP","s":["MC"],"o":78,"pt":80,"h":174,"b":92,"f":"D","at":[90,88,82,82,77,51,72,73],"sk":"#b88571","hr":"#1b1615","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_alexluna.webp","c":"Sporty VV Klub Estovackia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_carlosfaya","n":"Carlos Faya","nat":"Magayanes","a":28,"p":"MC","s":[],"o":70,"pt":70,"h":176,"b":92,"f":"D","at":[68,68,69,72,66,65,65,72],"sk":"#e09482","hr":"#36211b","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_carlosfaya.webp","c":"CD Héroicos de Peronia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_fernandocardozo","n":"Fernando Cardozo","nat":"Morvicia","a":29,"p":"MD","s":["ED"],"o":68,"pt":68,"h":173,"b":100,"f":"D","at":[77,77,78,64,70,25,69,65],"sk":"#eab695","hr":"#2f2322","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_fernandocardozo.webp","c":"FC Santa Rosa","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_juancruzdelossantos","n":"Juan Santos","nat":"Valurria","a":27,"p":"EI","s":[],"o":70,"pt":70,"h":174,"b":100,"f":"I","at":[76,80,70,60,63,34,68,58],"sk":"#9a5c38","hr":"#291e17","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_juancruzdelossantos.webp","c":"Grammes FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_omarcampos","n":"Omar Campos","nat":"Magayanes","a":28,"p":"LI","s":[],"o":73,"pt":73,"h":174,"b":92,"f":"I","at":[90,87,77,67,61,71,72,63],"sk":"#ca8879","hr":"#232226","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_omarcampos.webp","c":"Sporty VV Klub Estovackia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_kimryunseong","n":"Kim Ryun Seong","nat":"Tamago","a":28,"p":"LI","s":[],"o":69,"pt":69,"h":179,"b":100,"f":"I","at":[77,74,67,60,38,67,73,58],"sk":"#e8b7a3","hr":"#39281e","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_kimryunseong.webp","c":"Grammes FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_juanbisanz","n":"Juan Bisanz","nat":"Valurria","a":29,"p":"MI","s":["EI"],"o":68,"pt":68,"h":180,"b":92,"f":"D","at":[75,72,76,68,62,46,63,64],"sk":"#db976f","hr":"#2d1a17","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_juanbisanz.webp","c":"Universidad Costas Unidas","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_alejoveliz","n":"Alejo Veliz","nat":"Peronia","a":27,"p":"DC","s":[],"o":74,"pt":74,"h":186,"b":100,"f":"D","at":[76,74,71,60,74,27,78,64],"sk":"#bc8274","hr":"#060405","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_alejoveliz.webp","c":"Inter Focuri","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_josecavadia","n":"José Cavadía","nat":"Magayanes","a":25,"p":"MC","s":["MP"],"o":69,"pt":73,"h":175,"b":92,"f":"D","at":[76,80,72,70,60,54,64,67],"sk":"#ab796b","hr":"#111010","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_josecavadia.webp","c":"Sportivo Calcio di Kaigam","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_lucaschavez","n":"Lucas Chávez","nat":"Sotoa","a":27,"p":"MP","s":[],"o":66,"pt":66,"h":167,"b":100,"f":"D","at":[82,80,70,66,62,51,69,62],"sk":"#c79c96","hr":"#2a282d","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_lucaschavez.webp","c":"Universidad Costas Unidas","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_joaquingarcia","n":"Joaquín García","nat":"Valurria","a":29,"p":"LD","s":[],"o":74,"pt":74,"h":183,"b":100,"f":"D","at":[83,79,73,70,48,72,77,69],"sk":"#d58572","hr":"#140e11","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_joaquingarcia.webp","c":"Sporty VV Klub Estovackia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_totofernandez","n":"Toto Fernández","nat":"Peronia","a":29,"p":"MI","s":["EI"],"o":68,"pt":68,"h":183,"b":100,"f":"D","at":[74,73,65,69,62,35,71,66],"sk":"#e1a27c","hr":"#6f5847","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_totofernandez.webp","c":"CD Héroicos de Peronia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_joaquinblazquez","n":"Joaquín Blázquez","nat":"Valurria","a":29,"p":"POR","s":[],"o":65,"pt":65,"h":193,"b":100,"f":"D","at":[25,30,42,60,32,69,74,69],"sk":"#dc8e7d","hr":"#2a1a16","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_joaquinblazquez.webp","c":"CD Héroicos de Peronia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_joaquinmosqueira","n":"Joaquín Mosqueira","nat":"Valurria","a":26,"p":"MCD","s":[],"o":70,"pt":72,"h":184,"b":92,"f":"D","at":[70,72,71,71,63,66,71,67],"sk":"#cea284","hr":"#332c2a","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_joaquinmosqueira.webp","c":"Grammes FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_francozapiola","n":"Franco Zapiola","nat":"Peronia","a":29,"p":"MI","s":[],"o":71,"pt":71,"h":176,"b":92,"f":"I","at":[79,75,72,72,62,61,75,68],"sk":"#d18270","hr":"#0b0a0f","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_francozapiola.webp","c":"Sportivo Calcio di Kaigam","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_ezequielcannavo","n":"Ezequiel Cannavó","nat":"Peronia","a":28,"p":"LD","s":[],"o":70,"pt":71,"h":183,"b":92,"f":"D","at":[74,76,69,70,53,66,78,66],"sk":"#d4ab90","hr":"#211913","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_ezequielcannavo.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_fabriziosartori","n":"Fabrizio Sartori","nat":"Valurria","a":28,"p":"DC","s":[],"o":72,"pt":72,"h":178,"b":100,"f":"D","at":[81,83,64,61,67,30,78,66],"sk":"#c88472","hr":"#2c1f1d","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_fabriziosartori.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_agustinalvarez","n":"Agustín Álvarez","nat":"Valurria","a":29,"p":"DC","s":[],"o":70,"pt":71,"h":177,"b":100,"f":"D","at":[68,72,73,68,70,34,72,67],"sk":"#ad7d70","hr":"#000000","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_agustinalvarez.webp","c":"Grammes FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_manuelfernandez","n":"Manuel Fernández","nat":"Valurria","a":26,"p":"MD","s":["MI"],"o":67,"pt":69,"h":181,"b":92,"f":"D","at":[88,90,84,64,60,30,56,59],"sk":"#cd9a72","hr":"#212324","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_manuelfernandez.webp","c":"Fútbol Club de Tamago","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_eduardodelmas","n":"Eduardo Delmás","nat":"Morvicia","a":23,"p":"MP","s":[],"o":70,"pt":78,"h":172,"b":92,"f":"I","at":[78,80,81,72,67,34,52,65],"sk":"#ebab8c","hr":"#3b2522","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_eduardodelmas.webp","c":"Independiente de Riada","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_patrikmercado","n":"Patrik Mercado","nat":"Sotoa","a":27,"p":"MC","s":["MCD"],"o":76,"pt":76,"h":175,"b":92,"f":"D","at":[76,78,78,79,68,67,66,73],"sk":"#c1857b","hr":"#181617","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_patrikmercado.webp","c":"Sporty VV Klub Estovackia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_joaoneves","n":"João Neves","nat":"Grammes","a":26,"p":"MC","s":[],"o":85,"pt":87,"h":174,"b":100,"f":"D","at":[68,70,85,85,72,83,83,85],"sk":"#ec9c83","hr":"#211510","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_joaoneves.webp","c":"Sporty VV Klub Kostanay","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_gonzaloalassia","n":"Gonzalo Alassia","nat":"Valurria","a":26,"p":"MC","s":[],"o":70,"pt":72,"h":183,"b":100,"f":"D","at":[72,74,66,71,69,65,75,71],"sk":"#db9b82","hr":"#231811","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_gonzaloalassia.webp","c":"Sportivo Calcio di Kaigam","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_vicentebernedo","n":"Vicente Bernedo","nat":"Costas Unidas","a":29,"p":"POR","s":[],"o":68,"pt":68,"h":187,"b":100,"f":"D","at":[25,37,42,60,32,75,70,71],"sk":"#cb7d7c","hr":"#654b3c","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_vicentebernedo.webp","c":"CD Héroicos de Peronia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_thiagosantamaria","n":"Thiago Santamaría","nat":"Valurria","a":27,"p":"LD","s":["LI"],"o":70,"pt":70,"h":179,"b":92,"f":"D","at":[77,79,70,66,48,67,73,66],"sk":"#d29c7c","hr":"#41270f","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_thiagosantamaria.webp","c":"Independiente de Riada","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_bukayosaka","n":"Bukayo Saka","nat":"Kaigam","a":29,"p":"ED","s":[],"o":82,"pt":82,"h":178,"b":92,"f":"I","at":[77,79,87,81,82,56,70,81],"sk":"#492f2d","hr":"#211210","hs":"afro","bd":"sombra","ac":[],"ph":"assets/players/football/r_bukayosaka.webp","c":"Sporty VV Klub Estovackia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_khvichakvaratskhelia","n":"Khvicha Kvaratskhelia","nat":"Baikal","a":29,"p":"EI","s":["ED"],"o":84,"pt":84,"h":183,"b":100,"f":"D","at":[82,81,86,81,84,54,78,84],"sk":"#dc9785","hr":"#271916","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_khvichakvaratskhelia.webp","c":"Maccabi Tel Shava","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_michaelolise","n":"Michael Olise","nat":"Iberia","a":29,"p":"MD","s":[],"o":85,"pt":85,"h":180,"b":92,"f":"I","at":[76,78,88,88,77,44,66,88],"sk":"#8d5e49","hr":"#100d0e","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_michaelolise.webp","c":"Maccabi Tel Shava","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_florianwirtz","n":"Florian Wirtz","nat":"Margin","a":27,"p":"MP","s":[],"o":83,"pt":83,"h":177,"b":100,"f":"D","at":[74,74,87,86,76,52,64,85],"sk":"#c18a85","hr":"#28201c","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_florianwirtz.webp","c":"Red Gull Club Tellin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_rayancherki","n":"Rayan Cherki","nat":"Iberia","a":27,"p":"ED","s":[],"o":83,"pt":83,"h":177,"b":100,"f":"I","at":[76,78,93,83,82,39,64,84],"sk":"#a36e63","hr":"#0f0e0e","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_rayancherki.webp","c":"Sporting Lake Baikal","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_nunomendes","n":"Nuno Mendes","nat":"Grammes","a":28,"p":"LI","s":[],"o":85,"pt":85,"h":180,"b":100,"f":"I","at":[94,90,83,78,74,85,83,77],"sk":"#834f3f","hr":"#171314","hs":"largo","bd":"completa","ac":[],"ph":"assets/players/football/r_nunomendes.webp","c":"Maccabi Tel Shava","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_willianpacho","n":"Willian Pacho","nat":"Sotoa","a":29,"p":"DFC","s":[],"o":84,"pt":84,"h":188,"b":100,"f":"I","at":[80,71,62,66,30,90,85,73],"sk":"#945440","hr":"#161313","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_willianpacho.webp","c":"Sporty VV Klub Kostanay","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_jamalmusiala","n":"Jamal Musiala","nat":"Margin","a":27,"p":"MP","s":[],"o":84,"pt":84,"h":186,"b":92,"f":"D","at":[74,78,90,83,78,60,70,85],"sk":"#c98f7a","hr":"#100d0d","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_jamalmusiala.webp","c":"Maccabi Tel Shava","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_desiredoue","n":"Désiré Doué","nat":"Iberia","a":25,"p":"ED","s":["EI"],"o":85,"pt":89,"h":181,"b":100,"f":"D","at":[83,84,89,79,83,56,82,84],"sk":"#ad6a56","hr":"#472a22","hs":"largo","bd":"completa","ac":[],"ph":"assets/players/football/r_desiredoue.webp","c":"Sporty VV Klub Kostanay","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_williamsaliba","n":"William Saliba","nat":"Iberia","a":29,"p":"DFC","s":[],"o":83,"pt":83,"h":192,"b":100,"f":"D","at":[75,70,63,69,37,89,82,74],"sk":"#995942","hr":"#0f0e0e","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_williamsaliba.webp","c":"Sporty VV Klub Kostanay","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_moisescaicedo","n":"Moisés Caicedo","nat":"Sotoa","a":29,"p":"MCD","s":["MC"],"o":81,"pt":81,"h":178,"b":100,"f":"D","at":[61,65,81,80,67,80,82,83],"sk":"#683c33","hr":"#958279","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_moisescaicedo.webp","c":"Maccabi Tel Shava","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_agustinmedina","n":"Agustín Medina","nat":"Grammes","a":36,"p":"MC","s":["MD"],"o":63,"pt":63,"h":176,"b":100,"f":"D","at":[49,50,62,61,62,59,68,63],"sk":"#b87c60","hr":"#120e0e","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_agustinmedina.webp","c":"Fútbol Club de Tamago","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_agustinsandez","n":"Agustín Sández","nat":"Morvicia","a":29,"p":"LI","s":[],"o":74,"pt":74,"h":181,"b":100,"f":"I","at":[83,76,63,57,46,71,85,60],"sk":"#c27f65","hr":"#201917","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_agustinsandez.webp","c":"Sporting Lake Baikal","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_alanvelasco","n":"Alan Velasco","nat":"Peronia","a":28,"p":"MI","s":[],"o":73,"pt":73,"h":167,"b":100,"f":"D","at":[74,80,77,71,71,53,66,74],"sk":"#cb947c","hr":"#0d0e0c","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_alanvelasco.webp","c":"ØRK FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_almada","n":"Thiago Almada","nat":"Valurria","a":29,"p":"MP","s":["DC"],"o":81,"pt":81,"h":171,"b":100,"f":"D","at":[79,85,88,83,79,58,61,82],"sk":"#c88971","hr":"#15100d","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_almada.webp","c":"Sporting Lake Baikal","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_aronanselmino","n":"Aarón Anselmino","nat":"Peronia","a":25,"p":"DFC","s":[],"o":75,"pt":79,"h":186,"b":100,"f":"D","at":[78,74,67,68,52,77,74,70],"sk":"#c19581","hr":"#221f1a","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_aronanselmino.webp","c":"Sporty VV Klub Estovackia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_baltasarrodriguez","n":"Baltasar Rodríguez","nat":"Peronia","a":27,"p":"MC","s":["MI"],"o":71,"pt":71,"h":173,"b":92,"f":"D","at":[74,78,77,74,67,57,51,72],"sk":"#d19a82","hr":"#261a14","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_baltasarrodriguez.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_barco","n":"Valentín Barco","nat":"Peronia","a":26,"p":"MC","s":["MD"],"o":85,"pt":87,"h":170,"b":92,"f":"I","at":[83,84,88,89,58,80,69,85],"sk":"#bf816b","hr":"#2f1306","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_barco.webp","c":"Maccabi Tel Shava","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_beltransantiago","n":"Santiago Beltrán","nat":"Peronia","a":26,"p":"POR","s":[],"o":82,"pt":84,"h":190,"b":92,"f":"I","at":[64,69,56,76,46,86,80,85],"sk":"#ba8a73","hr":"#16140f","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_beltransantiago.webp","c":"Sporty VV Klub Kostanay","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_bruninho","n":"Bruninho","nat":"Tamago","a":22,"p":"ED","s":["EI"],"o":81,"pt":91,"h":175,"b":100,"f":"I","at":[98,98,76,68,68,32,58,65],"sk":"#9d6853","hr":"#1a161b","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_bruninho.webp","c":"Groz Sport Kulübü","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_cristianmedina","n":"Cristian Medina","nat":"Valurria","a":28,"p":"MC","s":["MCD"],"o":78,"pt":78,"h":178,"b":92,"f":"D","at":[76,77,82,77,64,72,74,76],"sk":"#ae7256","hr":"#1c1813","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_cristianmedina.webp","c":"Sporty VV Klub Estovackia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_dylangorosito","n":"Dylan Gorosito","nat":"Peronia","a":24,"p":"LD","s":[],"o":62,"pt":68,"h":173,"b":100,"f":"D","at":[78,80,69,48,34,65,54,57],"sk":"#c18771","hr":"#161318","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_dylangorosito.webp","c":"FC Santa Rosa","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_enzofernandez","n":"Enzo Fernández","nat":"Peronia","a":29,"p":"MC","s":["MCD"],"o":87,"pt":87,"h":178,"b":100,"f":"D","at":[70,69,84,90,81,78,79,89],"sk":"#d49b80","hr":"#241f19","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_enzofernandez.webp","c":"Sporty VV Klub Kostanay","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_ezequielherrera","n":"Ezequiel Herrera","nat":"Valurria","a":27,"p":"LD","s":[],"o":66,"pt":66,"h":180,"b":92,"f":"D","at":[72,74,66,56,42,64,73,57],"sk":"#c57f60","hr":"#110f11","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_ezequielherrera.webp","c":"Sportivo Calcio di Kaigam","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_fabricioiacovich","n":"Fabricio Iacovich","nat":"Peronia","a":28,"p":"POR","s":[],"o":69,"pt":69,"h":198,"b":100,"f":"I","at":[45,51,43,64,33,71,76,69],"sk":"#b67d5c","hr":"#332822","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_fabricioiacovich.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_gastonavila","n":"Gastón Ávila","nat":"Valurria","a":29,"p":"DFC","s":[],"o":71,"pt":71,"h":183,"b":100,"f":"I","at":[73,68,72,65,52,72,72,67],"sk":"#bc7f6f","hr":"#272129","hs":"buzz","bd":"sombra","ac":[],"ph":"assets/players/football/r_gastonavila.webp","c":"Al-Sahar","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_gastonveron","n":"Gastón Verón","nat":"Peronia","a":29,"p":"DC","s":[],"o":68,"pt":68,"h":184,"b":100,"f":"D","at":[71,55,72,67,67,40,67,69],"sk":"#c88866","hr":"#060102","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_gastonveron.webp","c":"Independiente de Riada","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_giulianos","n":"Giuliano Simeone","nat":"Valurria","a":28,"p":"MD","s":[],"o":85,"pt":85,"h":174,"b":100,"f":"D","at":[96,98,86,83,81,62,90,85],"sk":"#b57c6a","hr":"#201b17","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_giulianos.webp","c":"Sporty VV Klub Kostanay","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_gonzaloescudero","n":"Gonzalo Escudero","nat":"Valurria","a":23,"p":"DFC","s":[],"o":60,"pt":68,"h":180,"b":92,"f":"I","at":[62,61,47,47,32,62,62,48],"sk":"#c5856b","hr":"#211712","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_gonzaloescudero.webp","c":"Universidad Costas Unidas","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_gonzalozelarayan","n":"Gonzalo Zelarayán","nat":"Valurria","a":26,"p":"MP","s":[],"o":61,"pt":63,"h":179,"b":92,"f":"I","at":[69,68,68,60,58,33,59,58],"sk":"#d28d84","hr":"#14111a","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_gonzalozelarayan.webp","c":"Sporting Magayanes","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_juancruzmeza","n":"Juan Cruz Meza","nat":"Peronia","a":22,"p":"MC","s":[],"o":77,"pt":87,"h":183,"b":92,"f":"D","at":[76,75,78,77,70,72,80,75],"sk":"#be846c","hr":"#140e0b","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_juancruzmeza.webp","c":"Sporting Lake Baikal","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_kevincoronel","n":"Kevin Coronel","nat":"Peronia","a":26,"p":"LD","s":[],"o":61,"pt":63,"h":168,"b":100,"f":"D","at":[73,73,71,69,50,61,52,65],"sk":"#bf8570","hr":"#392418","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_kevincoronel.webp","c":"Melonia City FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_kevinlomonaco","n":"Kevin Lomónaco","nat":"Valurria","a":28,"p":"DFC","s":[],"o":80,"pt":80,"h":192,"b":100,"f":"D","at":[78,78,77,77,56,80,82,80],"sk":"#b6744f","hr":"#070602","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_kevinlomonaco.webp","c":"Red Gull Club Tellin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_kevinzenon","n":"Kevin Zenón","nat":"Peronia","a":29,"p":"MI","s":[],"o":77,"pt":77,"h":181,"b":92,"f":"I","at":[78,79,82,77,71,65,72,73],"sk":"#d08261","hr":"#1a100c","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_kevinzenon.webp","c":"Red Gull Club Tellin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_lautarogutierrez","n":"Lautaro Gutiérrez","nat":"Valurria","a":24,"p":"MP","s":[],"o":66,"pt":72,"h":185,"b":100,"f":"D","at":[70,64,64,69,62,45,65,65],"sk":"#bf836a","hr":"#100d0a","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_lautarogutierrez.webp","c":"Sköte FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_lautarorivero","n":"Lautaro Rivero","nat":"Valurria","a":27,"p":"DFC","s":[],"o":78,"pt":78,"h":185,"b":92,"f":"I","at":[78,73,70,71,59,76,84,75],"sk":"#c5876c","hr":"#120d09","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_lautarorivero.webp","c":"Sporting Lake Baikal","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_leonelflores","n":"Leonel Flores","nat":"Valurria","a":23,"p":"DC","s":[],"o":78,"pt":86,"h":175,"b":100,"f":"D","at":[80,83,80,69,74,26,73,64],"sk":"#b3836d","hr":"#84827d","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_leonelflores.webp","c":"Red Gull Club Tellin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_luisingolotti","n":"Luis Ingolotti","nat":"Valurria","a":30,"p":"POR","s":[],"o":59,"pt":59,"h":184,"b":100,"f":"D","at":[25,31,41,59,31,68,58,62],"sk":"#ebaf90","hr":"#261a11","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_luisingolotti.webp","c":"Fútbol Club de Tamago","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_marcopellegrino","n":"Marco Pellegrino","nat":"Peronia","a":28,"p":"DFC","s":[],"o":70,"pt":70,"h":184,"b":92,"f":"I","at":[66,65,58,53,42,73,74,57],"sk":"#d19e8e","hr":"#2f261b","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_marcopellegrino.webp","c":"Olympique de Iberia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_marcosvictor","n":"Marcos Victor","nat":"Tamago","a":29,"p":"DFC","s":[],"o":70,"pt":70,"h":184,"b":92,"f":"D","at":[69,65,55,46,36,73,78,53],"sk":"#b87158","hr":"#907e70","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_marcosvictor.webp","c":"CD Héroicos de Peronia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_martinluciano","n":"Martín Luciano","nat":"Valurria","a":27,"p":"LI","s":["LD"],"o":65,"pt":65,"h":170,"b":100,"f":"I","at":[84,86,72,55,37,62,68,55],"sk":"#c3816a","hr":"#301e13","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_martinluciano.webp","c":"Olympique de Iberia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_mathiasderitis","n":"Mathías De Ritis","nat":"Valurria","a":27,"p":"LI","s":[],"o":68,"pt":68,"h":183,"b":100,"f":"I","at":[62,66,66,61,47,70,69,58],"sk":"#d29277","hr":"#2d2628","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_mathiasderitis.webp","c":"Olympique de Iberia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_natanael","n":"Natanael Guzmán","nat":"Valurria","a":31,"p":"MI","s":[],"o":60,"pt":60,"h":171,"b":92,"f":"D","at":[72,73,62,63,49,42,44,60],"sk":"#ca8168","hr":"#170f08","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_natanael.webp","c":"Sporting Magayanes","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_nicopaz","n":"Nico Paz","nat":"Peronia","a":26,"p":"MP","s":["MC"],"o":88,"pt":90,"h":186,"b":92,"f":"I","at":[88,90,92,89,87,64,82,87],"sk":"#c38777","hr":"#2e1e16","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_nicopaz.webp","c":"Sporty VV Klub Kostanay","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_openda","n":"Loïs Openda","nat":"Margin","a":30,"p":"DC","s":[],"o":82,"pt":82,"h":175,"b":100,"f":"D","at":[90,90,78,69,76,25,76,71],"sk":"#ad714a","hr":"#161413","hs":"media","bd":"corta","ac":[],"ph":"assets/players/football/r_openda.webp","c":"Maccabi Tel Shava","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_orlandogil","n":"Orlando Gill","nat":"Morvicia","a":30,"p":"POR","s":[],"o":80,"pt":80,"h":198,"b":100,"f":"I","at":[33,37,56,80,46,86,90,84],"sk":"#eead97","hr":"#2a1f1d","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_orlandogil.webp","c":"Red Gull Club Tellin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_oscarcortes","n":"Óscar Cortés","nat":"Magayanes","a":27,"p":"MI","s":[],"o":68,"pt":68,"h":178,"b":100,"f":"D","at":[80,80,74,68,67,51,60,65],"sk":"#a36040","hr":"#010101","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_oscarcortes.webp","c":"FC Santa Rosa","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_ovandoignacio","n":"Ignacio Ovando","nat":"Peronia","a":23,"p":"DFC","s":[],"o":70,"pt":78,"h":183,"b":108,"f":"D","at":[68,67,66,54,30,72,75,61],"sk":"#cc8a75","hr":"#251918","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_ovandoignacio.webp","c":"Olympique de Iberia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_panichelli","n":"Joaquín Panichelli","nat":"Peronia","a":28,"p":"DC","s":[],"o":80,"pt":80,"h":190,"b":92,"f":"D","at":[77,72,77,73,86,28,91,80],"sk":"#d68676","hr":"#39221e","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_panichelli.webp","c":"Sporty VV Klub Kostanay","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_perrone","n":"Máximo Perrone","nat":"Valurria","a":27,"p":"MCD","s":[],"o":81,"pt":81,"h":177,"b":92,"f":"I","at":[75,75,84,83,62,83,70,82],"sk":"#c68775","hr":"#201410","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_perrone.webp","c":"Red Gull Club Tellin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_pizarrovicente","n":"Vicente Pizarro","nat":"Costas Unidas","a":28,"p":"MCD","s":["DFC"],"o":72,"pt":72,"h":172,"b":92,"f":"I","at":[63,65,74,72,59,72,71,70],"sk":"#c4886d","hr":"#1b1715","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_pizarrovicente.webp","c":"Al-Sahar","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_rafaelleao","n":"Rafael Leão","nat":"Grammes","a":31,"p":"EI","s":["MI"],"o":83,"pt":83,"h":188,"b":100,"f":"D","at":[89,88,83,78,78,25,75,79],"sk":"#724635","hr":"#18130e","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_rafaelleao.webp","c":"Sporting Lake Baikal","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_rodrigoauzmendi","n":"Rodrigo Auzmendi","nat":"Peronia","a":29,"p":"DC","s":[],"o":70,"pt":70,"h":191,"b":92,"f":"D","at":[74,69,70,62,68,48,71,67],"sk":"#e09e85","hr":"#3e2c24","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_rodrigoauzmendi.webp","c":"Sportivo Calcio di Kaigam","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_rodriguezalan","n":"Alan Rodríguez","nat":"Valurria","a":30,"p":"MC","s":[],"o":69,"pt":69,"h":171,"b":100,"f":"D","at":[68,72,78,69,62,58,49,69],"sk":"#cd8d7b","hr":"#211e22","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_rodriguezalan.webp","c":"Independiente de Riada","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_santiagomontiel","n":"Santiago Montiel","nat":"Peronia","a":30,"p":"MD","s":[],"o":77,"pt":77,"h":166,"b":100,"f":"I","at":[80,83,83,75,74,71,74,77],"sk":"#da8e76","hr":"#0c0301","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_santiagomontiel.webp","c":"Sporting Lake Baikal","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_santiagonunez","n":"Santiago Núñez","nat":"Peronia","a":30,"p":"DFC","s":[],"o":72,"pt":72,"h":186,"b":100,"f":"D","at":[62,60,59,56,27,74,83,62],"sk":"#c08166","hr":"#18110e","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_santiagonunez.webp","c":"Al-Sahar","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_soule","n":"Matías Soulé","nat":"Peronia","a":27,"p":"MP","s":[],"o":84,"pt":84,"h":176,"b":100,"f":"I","at":[87,90,89,85,83,54,79,80],"sk":"#eea186","hr":"#221711","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_soule.webp","c":"Red Gull Club Tellin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_valentinmoreno","n":"Valentín Moreno","nat":"Peronia","a":27,"p":"LD","s":[],"o":67,"pt":67,"h":172,"b":92,"f":"D","at":[74,72,65,51,46,64,76,57],"sk":"#c38a71","hr":"#372b27","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_valentinmoreno.webp","c":"Olympique de Iberia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_williamsalarcon","n":"Williams Alarcón","nat":"Costas Unidas","a":30,"p":"MC","s":["MI"],"o":69,"pt":69,"h":183,"b":100,"f":"D","at":[63,64,71,68,64,66,72,66],"sk":"#aa725e","hr":"#0b0a08","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_williamsalarcon.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_yoshanvolois","n":"Yoshan Valois","nat":"Magayanes","a":26,"p":"DC","s":[],"o":63,"pt":65,"h":187,"b":108,"f":"D","at":[56,58,59,57,72,25,64,59],"sk":"#704c3e","hr":"#181618","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_yoshanvolois.webp","c":"CD Héroicos de Peronia","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_martinelli","n":"Gabriel Martinelli","nat":"Tamago","a":29,"p":"ED","s":[],"o":84,"pt":84,"h":178,"b":92,"f":"D","at":[87,89,84,78,79,44,73,79],"sk":"#b78c7a","hr":"#0e0e0c","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_martinelli.webp","c":"Red Gull Club Tellin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_nicogonzalez","n":"Nico González","nat":"Valurria","a":32,"p":"MI","s":["EI"],"o":72,"pt":72,"h":180,"b":92,"f":"I","at":[77,77,76,71,72,48,66,72],"sk":"#af745d","hr":"#171515","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_nicogonzalez.webp","c":"Atlético Margin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_facundoarias","n":"Facundo Farías","nat":"Valurria","a":28,"p":"DC","s":[],"o":77,"pt":77,"h":171,"b":108,"f":"D","at":[82,85,77,64,70,34,68,69],"sk":"#c98765","hr":"#1b150f","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_facundoarias.webp","c":"Red Gull Club Tellin","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_gaustovera","n":"Fausto Vera","nat":"Valurria","a":30,"p":"MCD","s":["DFC"],"o":72,"pt":72,"h":180,"b":100,"f":"D","at":[72,71,73,71,72,71,76,72],"sk":"#a9745e","hr":"#1d1c1b","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_gaustovera.webp","c":"Grammes FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_joaquinburgos","n":"Joaquín Tobio Burgos","nat":"Valurria","a":26,"p":"MI","s":[],"o":75,"pt":77,"h":178,"b":92,"f":"I","at":[86,86,84,74,70,50,66,73],"sk":"#e09a75","hr":"#1c1717","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_joaquinburgos.webp","c":"Klaipeda United","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_juanvelazquez","n":"Juan Martín Velázquez","nat":"Peronia","a":26,"p":"MI","s":[],"o":66,"pt":68,"h":181,"b":92,"f":"I","at":[78,77,69,66,64,30,64,63],"sk":"#cb927d","hr":"#1e1614","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_juanvelazquez.webp","c":"Melonia City FC","k":"real","nt":"","dy":0,"tr":"","pa":""},{"id":"r_gastonedul","n":"Gastón Edul","nat":"Peronia","a":34,"p":"MC","s":["MI"],"o":76,"pt":76,"h":155,"b":100,"f":"D","at":[76,74,75,78,67,72,70,75],"sk":"#b77459","hr":"#231b12","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_gastonedul.webp","c":"Olympique de Iberia","k":"celeb","nt":"Periodista deportivo y streamer","dy":104,"tr":"","pa":""},{"id":"r_davidquint","n":"David Quint","nat":"Peronia","a":27,"p":"MP","s":["MC"],"o":77,"pt":77,"h":176,"b":98,"f":"D","at":[75,85,76,81,63,77,69,75],"sk":"#cc937f","hr":"#45321e","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_davidquint.webp","c":"Al-Sahar","k":"celeb","nt":"Davoo Xeneize · streamer de fútbol","dy":0,"tr":"","pa":""},{"id":"r_lautarodelcampo","n":"Lautaro Del Campo","nat":"Peronia","a":32,"p":"DC","s":[],"o":75,"pt":76,"h":178,"b":118,"f":"D","at":[52,53,82,70,92,59,76,73],"sk":"#af7264","hr":"#26221e","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_lautarodelcampo.webp","c":"Al-Sahar","k":"celeb","nt":"La Cobra · streamer (pesado y lento, pero letal en el área)","dy":0,"tr":"","pa":""},{"id":"r_martindisalvo","n":"Martín Di Salvo","nat":"Valurria","a":39,"p":"MC","s":[],"o":78,"pt":78,"h":181,"b":104,"f":"D","at":[64,63,71,86,70,74,75,75],"sk":"#e5a574","hr":"#382c24","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_martindisalvo.webp","c":"Al-Sahar","k":"celeb","nt":"Coscu · pionero del streaming argentino","dy":0,"tr":"","pa":""},{"id":"r_mariogallardo","n":"Mario Gallardo","nat":"Grammes","a":39,"p":"MCD","s":[],"o":76,"pt":76,"h":179,"b":103,"f":"D","at":[66,75,79,74,70,78,73,77],"sk":"#af7f61","hr":"#1c150c","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_mariogallardo.webp","c":"Olympique de Iberia","k":"celeb","nt":"DjMaRiiO · youtuber de fútbol (Móstoles)","dy":0,"tr":"","pa":""},{"id":"r_illojuan","n":"Juan Illo","nat":"Grammes","a":36,"p":"DFC","s":[],"o":75,"pt":75,"h":184,"b":104,"f":"D","at":[57,76,61,62,58,81,77,79],"sk":"#b37d66","hr":"#1f1d17","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_illojuan.webp","c":"Olympique de Iberia","k":"celeb","nt":"IlloJuan · streamer español","dy":0,"tr":"","pa":""},{"id":"r_teodelia","n":"Teo D'Elia","nat":"Peronia","a":29,"p":"ED","s":[],"o":77,"pt":77,"h":178,"b":95,"f":"D","at":[83,70,77,77,75,56,71,78],"sk":"#cc8e75","hr":"#312015","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_teodelia.webp","c":"Al-Sahar","k":"celeb","nt":"Actor y streamer","dy":0,"tr":"","pa":""},{"id":"r_santiagobaietti","n":"Santiago Baietti","nat":"Peronia","a":27,"p":"EI","s":["ED"],"o":75,"pt":75,"h":176,"b":96,"f":"I","at":[76,74,78,76,73,47,72,71],"sk":"#d79b82","hr":"#2e1e15","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_santiagobaietti.webp","c":"Al-Sahar","k":"celeb","nt":"Bauleti · streamer","dy":0,"tr":"","pa":""},{"id":"r_lautaromoschini","n":"Lautaro Moschini","nat":"Valurria","a":27,"p":"MC","s":[],"o":76,"pt":76,"h":180,"b":98,"f":"D","at":[74,80,70,80,68,67,67,81],"sk":"#c7927a","hr":"#312519","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_lautaromoschini.webp","c":"Al-Sahar","k":"celeb","nt":"Moski · streamer","dy":0,"tr":"","pa":""},{"id":"r_manuelmerlo","n":"Manuel Merlo","nat":"Peronia","a":28,"p":"MP","s":["MC"],"o":75,"pt":75,"h":177,"b":97,"f":"D","at":[79,70,74,80,65,65,62,76],"sk":"#c88c73","hr":"#17130b","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_manuelmerlo.webp","c":"Olympique de Iberia","k":"celeb","nt":"Mernuel · streamer","dy":0,"tr":"","pa":""},{"id":"r_agustinpanceta","n":"Agustín Pánceta","nat":"Peronia","a":25,"p":"DC","s":[],"o":78,"pt":80,"h":178,"b":98,"f":"D","at":[80,69,76,74,81,57,76,77],"sk":"#a26966","hr":"#0d0c0e","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_agustinpanceta.webp","c":"Al-Sahar","k":"celeb","nt":"La Agusneta · streamer (Mar del Tuyú)","dy":0,"tr":"","pa":""},{"id":"r_angelovaldes","n":"Ángelo Valdés","nat":"Magayanes","a":38,"p":"DFC","s":[],"o":73,"pt":73,"h":183,"b":104,"f":"D","at":[52,65,68,56,53,82,73,74],"sk":"#d2896a","hr":"#251d19","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_angelovaldes.webp","c":"Grammes FC","k":"celeb","nt":"Will · Los Futbolitos","dy":0,"tr":"","pa":""},{"id":"r_vicentperez","n":"Vicent Peréz","nat":"Magayanes","a":37,"p":"MC","s":[],"o":74,"pt":74,"h":178,"b":100,"f":"I","at":[66,81,69,84,63,76,69,65],"sk":"#c68a70","hr":"#c4ac8d","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_vicentperez.webp","c":"Olympique de Iberia","k":"celeb","nt":"Los Futbolitos","dy":0,"tr":"","pa":""},{"id":"r_geronimobenavidez","n":"Gerónimo Benavídez","nat":"Peronia","a":39,"p":"LD","s":["LI"],"o":75,"pt":75,"h":180,"b":100,"f":"D","at":[68,75,68,64,52,80,74,74],"sk":"#bd8f7d","hr":"#090806","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_geronimobenavidez.webp","c":"Al-Sahar","k":"celeb","nt":"Momo · streamer y abogado","dy":0,"tr":"","pa":""},{"id":"r_joseantoniocacho","n":"José Antonio Cacho","nat":"Grammes","a":40,"p":"POR","s":[],"o":80,"pt":80,"h":184,"b":102,"f":"D","at":[60,55,60,65,50,84,75,92],"sk":"#9a695a","hr":"#302628","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_joseantoniocacho.webp","c":"Al-Sahar","k":"celeb","nt":"Cacho01 · leyenda de FIFA, arquero","dy":0,"tr":"","pa":""},{"id":"r_jordanwild","n":"Jordi Wild","nat":"Grammes","a":46,"p":"DFC","s":[],"o":72,"pt":72,"h":183,"b":106,"f":"D","at":[47,58,60,70,57,81,68,78],"sk":"#bf8368","hr":"#262018","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_jordanwild.webp","c":"Olympique de Iberia","k":"celeb","nt":"Youtuber y podcaster","dy":0,"tr":"","pa":""},{"id":"r_benitoeste","n":"Benito Este","nat":"Peronia","a":34,"p":"MC","s":["MD"],"o":73,"pt":73,"h":175,"b":96,"f":"I","at":[60,59,62,79,69,66,59,83],"sk":"#cd7d5d","hr":"#161111","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_benitoeste.webp","c":"Al-Sahar","k":"celeb","nt":"Benito SDR · pionero de los streams de fútbol","dy":0,"tr":"","pa":""},{"id":"r_alvarocampo","n":"Álvaro Campo","nat":"Peronia","a":31,"p":"MD","s":["MI"],"o":74,"pt":74,"h":178,"b":99,"f":"D","at":[74,70,74,75,59,75,74,73],"sk":"#cb8b75","hr":"#241916","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_alvarocampo.webp","c":"Grammes FC","k":"celeb","nt":"Creador de contenido (identidad sin confirmar)","dy":0,"tr":"","pa":""},{"id":"r_benjaminbarreiro","n":"Benjamín Barreiro","nat":"Valurria","a":28,"p":"EI","s":[],"o":74,"pt":74,"h":177,"b":97,"f":"I","at":[67,76,85,70,71,46,69,80],"sk":"#d08969","hr":"#19130f","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_benjaminbarreiro.webp","c":"Olympique de Iberia","k":"celeb","nt":"Creador de contenido (identidad sin confirmar)","dy":0,"tr":"","pa":""},{"id":"r_ignaciorodriguez","n":"Ignacio Rodríguez","nat":"Peronia","a":32,"p":"MCD","s":[],"o":75,"pt":75,"h":180,"b":101,"f":"D","at":[71,71,78,76,72,76,73,72],"sk":"#e29679","hr":"#1a120f","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_ignaciorodriguez.webp","c":"Al-Sahar","k":"celeb","nt":"Creador de contenido (identidad sin confirmar)","dy":0,"tr":"","pa":""},{"id":"r_juanordonez","n":"Juan Ordóñez","nat":"Valurria","a":31,"p":"LI","s":["LD"],"o":72,"pt":73,"h":176,"b":98,"f":"I","at":[65,74,56,61,57,76,75,69],"sk":"#c27968","hr":"#494642","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_juanordonez.webp","c":"Al-Sahar","k":"celeb","nt":"Creador de contenido (identidad sin confirmar)","dy":0,"tr":"","pa":""},{"id":"r_marcelomorales","n":"Marcelo Morales","nat":"Peronia","a":33,"p":"DC","s":[],"o":74,"pt":74,"h":181,"b":103,"f":"D","at":[69,72,74,75,77,49,70,74],"sk":"#d89581","hr":"#221a18","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_marcelomorales.webp","c":"Al-Sahar","k":"celeb","nt":"Creador de contenido (identidad sin confirmar)","dy":0,"tr":"","pa":""},{"id":"r_ramirohernandez","n":"Ramiro Hernández","nat":"Peronia","a":30,"p":"MI","s":["MD"],"o":74,"pt":74,"h":179,"b":99,"f":"D","at":[72,72,74,74,68,65,65,80],"sk":"#cc8e74","hr":"#1c1713","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_ramirohernandez.webp","c":"Olympique de Iberia","k":"celeb","nt":"Creador de contenido (identidad sin confirmar)","dy":0,"tr":"","pa":""},{"id":"r_rodriginho","n":"Rodriginho","nat":"Tamago","a":29,"p":"ED","s":[],"o":76,"pt":76,"h":172,"b":96,"f":"D","at":[74,75,82,74,74,61,77,75],"sk":"#c78369","hr":"#0d0a07","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_rodriginho.webp","c":"Grammes FC","k":"celeb","nt":"Creador de contenido (identidad sin confirmar)","dy":0,"tr":"","pa":""},{"id":"r_johnathanjesus","n":"Johnathan de Jesús","nat":"Tamago","a":30,"p":"DFC","s":[],"o":75,"pt":75,"h":187,"b":106,"f":"D","at":[63,70,62,68,49,76,83,71],"sk":"#a37460","hr":"#191c1b","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_johnathanjesus.webp","c":"Grammes FC","k":"celeb","nt":"Creador de contenido (identidad sin confirmar)","dy":0,"tr":"","pa":""},{"id":"r_gonzalocorbalan","n":"Gonzalo Corbalán","nat":"Peronia","a":31,"p":"MP","s":["DC"],"o":74,"pt":74,"h":178,"b":99,"f":"D","at":[76,70,73,80,64,71,66,69],"sk":"#c48a71","hr":"#14100e","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_gonzalocorbalan.webp","c":"Grammes FC","k":"celeb","nt":"Creador de contenido (identidad sin confirmar)","dy":0,"tr":"","pa":""},{"id":"r_herrerafacundo","n":"Facundo Herrera","nat":"Peronia","a":25,"p":"LD","s":[],"o":81,"pt":83,"h":176,"b":98,"f":"D","at":[69,78,72,73,62,85,82,77],"sk":"#bb7a61","hr":"#170c09","hs":"largo","bd":"sombra","ac":[],"ph":"assets/players/football/r_herrerafacundo.webp","c":"Al-Sahar","k":"celeb","nt":"Identidad sin confirmar","dy":0,"tr":"","pa":""},{"id":"r_deanhuijsen","n":"Dean Huijsen","nat":"Grammes","a":25,"p":"DFC","s":[],"o":86,"pt":88,"h":197,"b":100,"f":"D","at":[79,85,63,81,73,85,92,87],"sk":"#c29179","hr":"#432f1b","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_deanhuijsen.webp","c":"Maccabi Tel Shava","k":"real","nt":"real (joven promesa)","dy":0,"tr":"","pa":""},{"id":"r_lennartkarl","n":"Lennart Karl","nat":"Margin","a":22,"p":"MP","s":[],"o":82,"pt":87,"h":181,"b":100,"f":"D","at":[78,78,78,86,75,78,77,82],"sk":"#d59c82","hr":"#322114","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_lennartkarl.webp","c":"Red Gull Club Tellin","k":"real","nt":"real (joven promesa)","dy":0,"tr":"","pa":""},{"id":"r_lucasbergvall","n":"Lucas Bergvall","nat":"Overmark","a":24,"p":"MC","s":["MI"],"o":84,"pt":87,"h":187,"b":100,"f":"D","at":[81,89,77,89,78,80,76,86],"sk":"#c68d7f","hr":"#855f48","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_lucasbergvall.webp","c":"Maccabi Tel Shava","k":"real","nt":"real (joven promesa)","dy":0,"tr":"","pa":""},{"id":"r_maxdowman","n":"Max Dowman","nat":"Kaigam","a":20,"p":"EI","s":["MI"],"o":80,"pt":87,"h":180,"b":100,"f":"D","at":[76,75,85,69,80,56,81,80],"sk":"#cf9577","hr":"#624729","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_maxdowman.webp","c":"Sporty VV Klub Estovackia","k":"real","nt":"real (joven promesa)","dy":0,"tr":"","pa":""},{"id":"r_warrenzaireemery","n":"Warren Zaïre-Emery","nat":"Iberia","a":24,"p":"MC","s":[],"o":84,"pt":88,"h":178,"b":100,"f":"D","at":[80,79,78,90,73,79,80,85],"sk":"#a47460","hr":"#0c0c0a","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_warrenzaireemery.webp","c":"Sporty VV Klub Kostanay","k":"real","nt":"real (joven promesa)","dy":0,"tr":"","pa":""},{"id":"r_endrick","n":"Endrick","nat":"Tamago","a":24,"p":"DC","s":[],"o":85,"pt":88,"h":173,"b":100,"f":"I","at":[83,84,90,86,84,58,82,77],"sk":"#9c6649","hr":"#0c0c0a","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_endrick.webp","c":"Maccabi Tel Shava","k":"real","nt":"real (joven promesa)","dy":0,"tr":"","pa":""},{"id":"r_estevao","n":"Estêvão","nat":"Tamago","a":23,"p":"ED","s":["EI"],"o":87,"pt":92,"h":176,"b":100,"f":"I","at":[87,85,82,83,92,66,84,85],"sk":"#8f573c","hr":"#0a0a06","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_estevao.webp","c":"Sporty VV Klub Kostanay","k":"real","nt":"real (joven promesa)","dy":0,"tr":"","pa":""},{"id":"r_francomastantuono","n":"Franco Mastantuono","nat":"Valurria","a":23,"p":"ED","s":["EI"],"o":87,"pt":91,"h":181,"b":100,"f":"I","at":[88,84,84,81,90,68,85,86],"sk":"#bd7e63","hr":"#251d0a","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_francomastantuono.webp","c":"Maccabi Tel Shava","k":"real","nt":"real (joven promesa)","dy":0,"tr":"","pa":""},{"id":"r_lammens","n":"Senne Lammens","nat":"Iberia","a":28,"p":"POR","s":[],"o":83,"pt":83,"h":197,"b":100,"f":"D","at":[63,64,62,79,47,84,86,87],"sk":"#b37e6a","hr":"#101109","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_lammens.webp","c":"Sporty VV Klub Kostanay","k":"real","nt":"real (joven promesa)","dy":0,"tr":"","pa":""},{"id":"r_mainoo","n":"Kobbie Mainoo","nat":"Kaigam","a":25,"p":"MC","s":["MP"],"o":84,"pt":86,"h":178,"b":100,"f":"D","at":[82,82,85,84,82,68,78,84],"sk":"#73432e","hr":"#110e08","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_mainoo.webp","c":"Maccabi Tel Shava","k":"real","nt":"real (joven promesa)","dy":0,"tr":"","pa":""},{"id":"r_paucubarsi","n":"Pau Cubarsí","nat":"Grammes","a":23,"p":"DFC","s":[],"o":88,"pt":91,"h":184,"b":100,"f":"I","at":[77,86,75,79,67,91,90,83],"sk":"#d08e71","hr":"#0a0e13","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_paucubarsi.webp","c":"Sporty VV Klub Kostanay","k":"real","nt":"real (joven promesa)","dy":0,"tr":"","pa":""},{"id":"r_agustingiay","n":"Agustín Giay","nat":"Peronia","a":26,"p":"LD","s":["LI"],"o":82,"pt":83,"h":175,"b":98,"f":"D","at":[80,74,74,68,65,83,87,80],"sk":"#d48f6f","hr":"#100b09","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/r_agustingiay.webp","c":"Sporty VV Klub Kostanay","k":"real","nt":"real","dy":0,"tr":"","pa":""},{"id":"r_facundocolidio","n":"Facundo Colidio","nat":"Peronia","a":30,"p":"ED","s":[],"o":72,"pt":72,"h":175,"b":97,"f":"D","at":[67,71,76,76,74,54,63,64],"sk":"#e09f84","hr":"#311e12","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/r_facundocolidio.webp","c":"Olympique de Iberia","k":"real","nt":"real","dy":0,"tr":"","pa":""},{"id":"r_yurialberto","n":"Yuri Alberto","nat":"Tamago","a":29,"p":"DC","s":[],"o":77,"pt":77,"h":180,"b":101,"f":"D","at":[71,76,80,72,79,57,70,76],"sk":"#ae765a","hr":"#312518","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_yurialberto.webp","c":"Sporty VV Klub Estovackia","k":"real","nt":"real","dy":0,"tr":"","pa":""},{"id":"r_ronaldodejesus","n":"Ronaldo de Jesús","nat":"Morvicia","a":26,"p":"DFC","s":[],"o":71,"pt":72,"h":186,"b":106,"f":"D","at":[67,70,61,62,55,73,72,63],"sk":"#c78565","hr":"#65564b","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_ronaldodejesus.webp","c":"Olympique de Iberia","k":"real","nt":"real","dy":0,"tr":"","pa":""},{"id":"r_vertisemilio","n":"Emiliano Vertis","nat":"Iberia","a":26,"p":"DC","s":["MP","EI"],"o":90,"pt":90,"h":181,"b":100,"f":"D","at":[84,87,93,88,93,38,80,94],"sk":"#b47955","hr":"#5e4721","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_vertisemilio.webp","c":"Olympique de Iberia","k":"special","nt":"El mejor jugador del mundo · especialista en tiros de larga distancia y regates","dy":0,"tr":"longshots+dribbling","pa":"assets/players/football/r_vertisemilianoespecial.webp"},{"id":"r_javiersalamandro","n":"Javier Salamandro","nat":"Sahar","a":29,"p":"POR","s":[],"o":90,"pt":90,"h":192,"b":104,"f":"D","at":[62,93,52,82,40,93,82,93],"sk":"#9a6b55","hr":"#bba07e","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/r_javiersalamandro.webp","c":"Al-Sahar","k":"special","nt":"El mejor arquero del mundo · reflejos por encima del límite humano","dy":0,"tr":"superhuman_reflexes","pa":"assets/players/football/r_javiersalamandroespecial.webp"},{"id":"r_wolfdagan","n":"Amadeus Wolfdagan","nat":"Kaigam","a":25,"p":"DC","s":["EI","ED"],"o":88,"pt":88,"h":184,"b":102,"f":"D","at":[95,95,82,72,84,35,84,80],"sk":"#8a5841","hr":"#281c16","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_wolfdagan.webp","c":"Sportivo Calcio di Kaigam","k":"special","nt":"El jugador más rápido del mundo · delantero centro","dy":0,"tr":"fastest","pa":""},{"id":"r_kevinmoskowitz","n":"Kevin Moskowitz","nat":"Margin","a":30,"p":"MCD","s":["DFC","MC"],"o":88,"pt":88,"h":187,"b":106,"f":"D","at":[76,74,79,89,70,97,89,94],"sk":"#ce987d","hr":"#18110a","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/r_kevinmoskowitz.webp","c":"Atlético Margin","k":"special","nt":"De los mejores mediocampistas del mundo · pivote defensivo","dy":0,"tr":"dm_elite","pa":""},{"id":"x_ficticiofinalnight607800001","n":"Wilmer Cardoso","nat":"Grammes","a":18,"p":"DFC","s":[],"o":50,"pt":67,"h":179,"b":101,"f":"I","at":[47,49,37,40,25,50,57,49],"sk":"#ac7759","hr":"#6e563a","hs":"corto","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight607800001.webp","c":"Grammes FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight602300001","n":"Matteo Murphy","nat":"Margin","a":19,"p":"DFC","s":[],"o":60,"pt":73,"h":182,"b":98,"f":"D","at":[57,53,47,44,44,67,55,59],"sk":"#bc8261","hr":"#bea87a","hs":"afro","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight602300001.webp","c":"Atlético Margin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight301400001","n":"Gonzalo Gamarra","nat":"Costas Unidas","a":28,"p":"POR","s":[],"o":51,"pt":53,"h":197,"b":95,"f":"D","at":[41,37,29,52,25,51,51,57],"sk":"#d0987a","hr":"#643915","hs":"colita","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight301400001.webp","c":"Sportivo Calcio di Kaigam","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight602100001","n":"Matías Lima","nat":"Peronia","a":27,"p":"DFC","s":[],"o":57,"pt":58,"h":197,"b":99,"f":"I","at":[53,52,49,57,46,56,61,62],"sk":"#be8162","hr":"#16140f","hs":"trencitas","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight602100001.webp","c":"CD Héroicos de Peronia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight203300001","n":"Erik Skog","nat":"Overmark","a":22,"p":"POR","s":[],"o":56,"pt":61,"h":196,"b":102,"f":"D","at":[43,40,33,53,25,59,59,56],"sk":"#d29b7f","hr":"#432c17","hs":"corto","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight203300001.webp","c":"Independiente de Riada","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight607600001","n":"Jan Ortega","nat":"Kaigam","a":18,"p":"POR","s":[],"o":47,"pt":62,"h":195,"b":97,"f":"D","at":[38,42,31,39,25,50,44,48],"sk":"#d8a791","hr":"#47533f","hs":"afro","bd":"ninguna","ac":[],"ph":"assets/players/football/x_ficticiofinalnight607600001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight602900001","n":"Nicolás Muñoz","nat":"Magayanes","a":23,"p":"POR","s":[],"o":53,"pt":61,"h":183,"b":102,"f":"D","at":[35,39,31,41,25,58,54,52],"sk":"#c18664","hr":"#3d2714","hs":"rastas","bd":"bigote","ac":[],"ph":"assets/players/football/x_ficticiofinalnight602900001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli11900001","n":"Nicolás Guedes","nat":"Tamago","a":21,"p":"POR","s":[],"o":44,"pt":59,"h":192,"b":103,"f":"D","at":[27,33,25,33,25,49,40,48],"sk":"#b87f5f","hr":"#352a19","hs":"crop","bd":"completa","ac":[],"ph":"assets/players/football/x_futboli11900001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli01800001","n":"Omar Nasser","nat":"Riada","a":29,"p":"POR","s":[],"o":50,"pt":50,"h":190,"b":98,"f":"D","at":[42,34,26,32,25,55,50,51],"sk":"#916247","hr":"#3b2b1c","hs":"corona","bd":"chuletas","ac":[],"ph":"assets/players/football/x_futboli01800001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh00400001","n":"Darius Foster","nat":"Peronia","a":25,"p":"POR","s":[],"o":51,"pt":52,"h":189,"b":106,"f":"D","at":[35,35,25,50,25,56,51,52],"sk":"#b2765f","hr":"#3b2916","hs":"largo","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_futbolh00400001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli09700001","n":"Sergio Lambert","nat":"Iberia","a":29,"p":"POR","s":[],"o":54,"pt":54,"h":190,"b":90,"f":"D","at":[42,38,25,45,27,58,53,58],"sk":"#ab7b65","hr":"#aba88c","hs":"degradado","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_futboli09700001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight203100001","n":"Thiago Cisneros","nat":"Peronia","a":21,"p":"POR","s":[],"o":55,"pt":69,"h":188,"b":104,"f":"D","at":[40,36,40,52,25,62,49,59],"sk":"#c68c6b","hr":"#1d170f","hs":"raya","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight203100001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli16700001","n":"Malik Benali","nat":"Netanya","a":35,"p":"POR","s":[],"o":50,"pt":50,"h":196,"b":94,"f":"D","at":[34,40,25,46,25,53,53,46],"sk":"#99654d","hr":"#0d0e0b","hs":"rastas","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futboli16700001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight302700001","n":"Agustín Suárez","nat":"Peronia","a":27,"p":"POR","s":[],"o":49,"pt":50,"h":191,"b":93,"f":"D","at":[35,30,33,40,25,52,50,53],"sk":"#c2917a","hr":"#523018","hs":"undercut","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight302700001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalv2test00000001","n":"Arjun Patel","nat":"Kostanay","a":30,"p":"DFC","s":[],"o":74,"pt":74,"h":189,"b":97,"f":"I","at":[70,67,73,71,63,75,77,76],"sk":"#a36d4c","hr":"#1e170f","hs":"mullet","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalv2test00000001.webp","c":"Sporty VV Klub Kostanay","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight204900001","n":"Renan Ramos","nat":"Tamago","a":22,"p":"POR","s":[],"o":81,"pt":87,"h":188,"b":103,"f":"A","at":[65,65,64,75,54,82,79,88],"sk":"#b6785b","hr":"#2d190e","hs":"mullet","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight204900001.webp","c":"Maccabi Tel Shava","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg01500001","n":"Minjun Park","nat":"Tamago","a":24,"p":"POR","s":[],"o":71,"pt":77,"h":190,"b":105,"f":"D","at":[57,55,49,70,37,75,67,77],"sk":"#d09d7d","hr":"#131510","hs":"corto","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_futbolg01500001.webp","c":"Red Gull Club Tellin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight205400001","n":"Preston Haworth","nat":"Kaigam","a":21,"p":"POR","s":[],"o":69,"pt":76,"h":189,"b":100,"f":"I","at":[52,61,48,61,37,73,65,71],"sk":"#cc9b86","hr":"#583319","hs":"afro","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight205400001.webp","c":"Sporting Lake Baikal","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight300700001","n":"Matteo Ruiz","nat":"Iberia","a":18,"p":"POR","s":[],"o":78,"pt":96,"h":197,"b":109,"f":"D","at":[64,67,52,75,39,76,81,84],"sk":"#c28b6f","hr":"#6d5234","hs":"rapado","bd":"completa","ac":[],"ph":"assets/players/football/x_ficticiofinalnight300700001.webp","c":"Sporty VV Klub Estovackia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight604600001","n":"Jack Martin","nat":"Kaigam","a":26,"p":"POR","s":[],"o":72,"pt":74,"h":193,"b":99,"f":"D","at":[59,59,49,63,39,73,72,75],"sk":"#a86c4c","hr":"#191611","hs":"rastas","bd":"mosca","ac":[],"ph":"assets/players/football/x_ficticiofinalnight604600001.webp","c":"Groz Sport Kulübü","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight607100001","n":"Matías Souza","nat":"Tamago","a":26,"p":"POR","s":[],"o":72,"pt":74,"h":194,"b":97,"f":"A","at":[58,55,49,70,33,78,75,69],"sk":"#bb8763","hr":"#1a150f","hs":"rulos","bd":"corta","ac":[],"ph":"assets/players/football/x_ficticiofinalnight607100001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli10400001","n":"Dae Singh","nat":"Kostanay","a":19,"p":"POR","s":[],"o":64,"pt":71,"h":201,"b":102,"f":"D","at":[46,52,44,58,27,67,64,64],"sk":"#c18e74","hr":"#3d1e10","hs":"undercut","bd":"corta","ac":[],"ph":"assets/players/football/x_futboli10400001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight600800001","n":"Vinícius Díaz","nat":"Valurria","a":22,"p":"POR","s":[],"o":68,"pt":73,"h":192,"b":106,"f":"D","at":[48,56,50,60,27,72,69,69],"sk":"#bb866a","hr":"#b8a380","hs":"rapado","bd":"desprolija","ac":[],"ph":"assets/players/football/x_ficticiofinalnight600800001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight301700001","n":"Liam Bermejo","nat":"Grammes","a":18,"p":"DFC","s":[],"o":56,"pt":73,"h":185,"b":100,"f":"A","at":[51,53,44,47,44,57,63,52],"sk":"#c5855d","hr":"#1e100c","hs":"rastas","bd":"mosca","ac":[],"ph":"assets/players/football/x_ficticiofinalnight301700001.webp","c":"Grammes FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalvartest00200001","n":"Pieter Müller","nat":"Margin","a":19,"p":"DFC","s":[],"o":44,"pt":62,"h":186,"b":103,"f":"D","at":[36,37,36,40,29,46,45,40],"sk":"#dda885","hr":"#412f1c","hs":"corona","bd":"sombra","ac":[],"ph":"assets/players/football/x_ficticiofinalvartest00200001.webp","c":"Atlético Margin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight301500001","n":"Luca Bianchi","nat":"Kaigam","a":23,"p":"DFC","s":[],"o":59,"pt":65,"h":169,"b":107,"f":"D","at":[55,55,46,53,40,62,57,59],"sk":"#b97e62","hr":"#4e361e","hs":"rastas","bd":"completa","ac":[],"ph":"assets/players/football/x_ficticiofinalnight301500001.webp","c":"Sportivo Calcio di Kaigam","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli03400001","n":"Mason Mitchell","nat":"Peronia","a":27,"p":"DFC","s":[],"o":50,"pt":50,"h":188,"b":106,"f":"D","at":[39,39,33,42,41,52,54,48],"sk":"#b77b5d","hr":"#cda571","hs":"rulos","bd":"ninguna","ac":[],"ph":"assets/players/football/x_futboli03400001.webp","c":"CD Héroicos de Peronia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight609200001","n":"Jack MacDonald","nat":"Grammes","a":23,"p":"POR","s":[],"o":54,"pt":58,"h":190,"b":104,"f":"D","at":[42,44,33,42,25,58,56,52],"sk":"#c78d6c","hr":"#543010","hs":"raya","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight609200001.webp","c":"Independiente de Riada","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh01600001","n":"Andrés Maeda","nat":"Tamago","a":28,"p":"POR","s":[],"o":51,"pt":52,"h":188,"b":103,"f":"A","at":[35,36,29,48,25,57,57,45],"sk":"#996b55","hr":"#7c6551","hs":"afro","bd":"mosca","ac":[],"ph":"assets/players/football/x_futbolh01600001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight604200001","n":"Emeka Diallo","nat":"Netanya","a":25,"p":"POR","s":[],"o":47,"pt":49,"h":186,"b":108,"f":"D","at":[30,35,26,39,25,50,51,44],"sk":"#c6916a","hr":"#614a2e","hs":"engominado","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight604200001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli12600001","n":"Camilo Acosta","nat":"Tamago","a":21,"p":"DFC","s":[],"o":55,"pt":67,"h":190,"b":105,"f":"I","at":[54,44,40,48,46,53,62,55],"sk":"#b68766","hr":"#482c14","hs":"raya","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli12600001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli16000001","n":"Bautista Ricci","nat":"Costas Unidas","a":33,"p":"POR","s":[],"o":50,"pt":50,"h":190,"b":102,"f":"D","at":[39,41,25,38,25,52,50,50],"sk":"#b48369","hr":"#2d2721","hs":"trencitas","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli16000001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli07800001","n":"Brayan Sosa","nat":"Sotoa","a":24,"p":"POR","s":[],"o":48,"pt":55,"h":188,"b":103,"f":"I","at":[29,36,30,39,25,52,47,47],"sk":"#ad7557","hr":"#13130f","hs":"afro","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli07800001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli06400001","n":"Declan Turner","nat":"Kaigam","a":35,"p":"POR","s":[],"o":44,"pt":44,"h":186,"b":104,"f":"D","at":[35,29,25,36,25,45,46,49],"sk":"#c38f70","hr":"#3f2611","hs":"buzz","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli06400001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight606500001","n":"Rafael Quiroga","nat":"Valurria","a":27,"p":"POR","s":[],"o":50,"pt":51,"h":189,"b":108,"f":"D","at":[31,38,30,43,25,51,54,51],"sk":"#ab7558","hr":"#0e262e","hs":"afro","bd":"bigote","ac":[],"ph":"assets/players/football/x_ficticiofinalnight606500001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight604400001","n":"Gabriel Coria","nat":"Sotoa","a":27,"p":"POR","s":[],"o":47,"pt":47,"h":191,"b":104,"f":"I","at":[38,25,28,37,25,55,46,47],"sk":"#cc8d6c","hr":"#6c411e","hs":"corto","bd":"mosca","ac":[],"ph":"assets/players/football/x_ficticiofinalnight604400001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight203700001","n":"Rafael Bezerra","nat":"Tamago","a":19,"p":"POR","s":[],"o":44,"pt":57,"h":193,"b":96,"f":"I","at":[34,26,26,41,25,47,46,45],"sk":"#b17455","hr":"#7b5735","hs":"afro","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight203700001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight303200001","n":"Takumi Suleimenov","nat":"Kostanay","a":24,"p":"LI","s":[],"o":81,"pt":83,"h":182,"b":99,"f":"D","at":[76,81,68,72,67,85,79,75],"sk":"#c79472","hr":"#201910","hs":"corto","bd":"bigote","ac":[],"ph":"assets/players/football/x_ficticiofinalnight303200001.webp","c":"Sporty VV Klub Kostanay","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli00300001","n":"Devin Reed","nat":"Grammes","a":27,"p":"POR","s":[],"o":70,"pt":72,"h":194,"b":98,"f":"D","at":[51,53,43,63,43,75,74,69],"sk":"#b37856","hr":"#544227","hs":"rapado","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli00300001.webp","c":"Maccabi Tel Shava","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight300100001","n":"Luca Tamm","nat":"Estovackia","a":24,"p":"DFC","s":[],"o":75,"pt":82,"h":188,"b":103,"f":"D","at":[68,69,61,65,56,74,84,72],"sk":"#b67e5f","hr":"#21180d","hs":"crop","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight300100001.webp","c":"Red Gull Club Tellin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg00400001","n":"Ezequiel Gómez","nat":"Tamago","a":22,"p":"POR","s":[],"o":75,"pt":77,"h":198,"b":89,"f":"D","at":[61,58,46,60,47,73,82,81],"sk":"#bc886f","hr":"#1a1712","hs":"jopo","bd":"bigote","ac":[],"ph":"assets/players/football/x_futbolg00400001.webp","c":"Sporting Lake Baikal","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli10000001","n":"Matteo Navarro","nat":"Grammes","a":19,"p":"POR","s":[],"o":62,"pt":79,"h":184,"b":104,"f":"D","at":[54,51,47,47,25,68,63,59],"sk":"#b67f67","hr":"#3e1706","hs":"crop","bd":"manubrio","ac":[],"ph":"assets/players/football/x_futboli10000001.webp","c":"Sporty VV Klub Estovackia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli04200001","n":"Jack Jansen","nat":"Baikal","a":26,"p":"DFC","s":[],"o":69,"pt":71,"h":194,"b":96,"f":"D","at":[66,68,60,57,56,72,72,65],"sk":"#cd8f6c","hr":"#2a1d0e","hs":"raya","bd":"anclada","ac":[],"ph":"assets/players/football/x_futboli04200001.webp","c":"Groz Sport Kulübü","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight303100001","n":"Jan Campbell","nat":"Overmark","a":30,"p":"POR","s":[],"o":67,"pt":67,"h":200,"b":106,"f":"D","at":[49,52,44,54,34,67,71,71],"sk":"#cf9c85","hr":"#b9b6a6","hs":"corto","bd":"anclada","ac":[],"ph":"assets/players/football/x_ficticiofinalnight303100001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight302900001","n":"Pieter Solberg","nat":"Overmark","a":27,"p":"DFC","s":[],"o":72,"pt":72,"h":185,"b":96,"f":"D","at":[61,66,63,67,62,75,74,77],"sk":"#bf8964","hr":"#a25013","hs":"raya","bd":"mosca","ac":[],"ph":"assets/players/football/x_ficticiofinalnight302900001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight609600001","n":"Liam Costa","nat":"Overmark","a":29,"p":"POR","s":[],"o":62,"pt":62,"h":185,"b":97,"f":"D","at":[45,49,41,59,25,68,61,61],"sk":"#c79377","hr":"#3e2a16","hs":"manbun","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight609600001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli18700001","n":"Isaiah Jackson","nat":"Grammes","a":21,"p":"LD","s":[],"o":52,"pt":70,"h":186,"b":100,"f":"A","at":[43,55,46,43,37,54,59,52],"sk":"#c58a67","hr":"#c79f86","hs":"raya","bd":"corta","ac":[],"ph":"assets/players/football/x_futboli18700001.webp","c":"Grammes FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli12200001","n":"Callum Beckmann","nat":"Margin","a":23,"p":"DFC","s":[],"o":61,"pt":69,"h":184,"b":106,"f":"D","at":[51,58,52,52,48,64,63,58],"sk":"#cd8c73","hr":"#3a2310","hs":"crop","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futboli12200001.webp","c":"Atlético Margin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight501400001","n":"Finn Reid","nat":"Kaigam","a":25,"p":"DFC","s":[],"o":60,"pt":61,"h":187,"b":103,"f":"I","at":[53,58,55,59,45,60,64,55],"sk":"#c58f77","hr":"#403522","hs":"colita","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight501400001.webp","c":"Sportivo Calcio di Kaigam","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli03700001","n":"Agustín Sinisterra","nat":"Peronia","a":29,"p":"DFC","s":[],"o":49,"pt":49,"h":189,"b":96,"f":"D","at":[38,46,41,45,37,52,50,54],"sk":"#c18d72","hr":"#45170a","hs":"corto","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli03700001.webp","c":"CD Héroicos de Peronia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight604700001","n":"Omar Owona","nat":"Riada","a":21,"p":"DFC","s":[],"o":56,"pt":73,"h":186,"b":106,"f":"A","at":[47,53,44,52,48,56,62,56],"sk":"#9e6747","hr":"#34190d","hs":"rulos","bd":"sombra","ac":[],"ph":"assets/players/football/x_ficticiofinalnight604700001.webp","c":"Independiente de Riada","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli18500001","n":"Nicolás Cejas","nat":"Valurria","a":17,"p":"DFC","s":[],"o":51,"pt":69,"h":185,"b":106,"f":"I","at":[52,44,35,35,30,49,61,48],"sk":"#b2795d","hr":"#1a1a16","hs":"afro","bd":"manubrio","ac":["aros"],"ph":"assets/players/football/x_futboli18500001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli05700001","n":"Luca Grasso","nat":"Melonia","a":29,"p":"DFC","s":[],"o":50,"pt":50,"h":189,"b":102,"f":"A","at":[40,45,30,35,34,54,54,53],"sk":"#bf886a","hr":"#513a24","hs":"afro","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_futboli05700001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli13100001","n":"Yeison Mendoza","nat":"Tamago","a":21,"p":"DFC","s":[],"o":56,"pt":73,"h":193,"b":99,"f":"I","at":[47,52,42,44,38,57,66,66],"sk":"#b77b59","hr":"#0e0d09","hs":"afro","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futboli13100001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight200300001","n":"Adrián Arroyo","nat":"Costas Unidas","a":25,"p":"DFC","s":[],"o":54,"pt":56,"h":181,"b":99,"f":"D","at":[43,49,40,47,42,58,57,61],"sk":"#cc906c","hr":"#14140f","hs":"corto","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight200300001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight00000001","n":"Pieter Maseko","nat":"Skote","a":24,"p":"DFC","s":[],"o":49,"pt":54,"h":187,"b":105,"f":"D","at":[40,44,40,41,32,54,47,51],"sk":"#be805a","hr":"#19170e","hs":"manbun","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight00000001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli18400001","n":"Thiago Rojas","nat":"Magayanes","a":31,"p":"DFC","s":[],"o":51,"pt":51,"h":190,"b":101,"f":"D","at":[44,55,42,35,38,55,53,50],"sk":"#c79171","hr":"#181813","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli18400001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight300600001","n":"Gabriel Ayala","nat":"Morvicia","a":21,"p":"DFC","s":[],"o":53,"pt":68,"h":186,"b":105,"f":"I","at":[46,48,45,51,32,54,55,49],"sk":"#c88866","hr":"#493420","hs":"corto","bd":"candado","ac":[],"ph":"assets/players/football/x_ficticiofinalnight300600001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight608400001","n":"Jan Grgić","nat":"Zenet","a":19,"p":"DFC","s":[],"o":46,"pt":63,"h":189,"b":100,"f":"D","at":[37,40,36,46,26,49,46,46],"sk":"#cc9875","hr":"#8c694c","hs":"rapado","bd":"mosca","ac":[],"ph":"assets/players/football/x_ficticiofinalnight608400001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight204700001","n":"Mateo Rivas","nat":"Sotoa","a":27,"p":"DFC","s":[],"o":52,"pt":52,"h":181,"b":109,"f":"D","at":[43,48,47,43,29,56,51,55],"sk":"#b37e62","hr":"#231a0f","hs":"crop","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight204700001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli14700001","n":"Hiro Chen","nat":"Kostanay","a":34,"p":"LI","s":[],"o":67,"pt":67,"h":186,"b":103,"f":"D","at":[67,61,54,64,50,68,67,70],"sk":"#b17a5a","hr":"#3b2816","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/x_futboli14700001.webp","c":"Sporty VV Klub Kostanay","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli13400001","n":"Amadou Navon","nat":"Netanya","a":26,"p":"DFC","s":[],"o":81,"pt":84,"h":192,"b":102,"f":"D","at":[66,73,70,65,61,88,82,80],"sk":"#a67557","hr":"#513c28","hs":"rapado","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_futboli13400001.webp","c":"Maccabi Tel Shava","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalv2test00500001","n":"Jan Magi","nat":"Estovackia","a":20,"p":"DFC","s":[],"o":66,"pt":74,"h":193,"b":104,"f":"D","at":[62,68,53,51,52,68,73,68],"sk":"#c38c74","hr":"#13292c","hs":"corto","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalv2test00500001.webp","c":"Red Gull Club Tellin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight205200001","n":"Gleb Sokolov","nat":"Baikal","a":19,"p":"DFC","s":[],"o":67,"pt":76,"h":185,"b":106,"f":"D","at":[70,63,58,61,46,68,68,60],"sk":"#d09777","hr":"#70583a","hs":"puas","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight205200001.webp","c":"Sporting Lake Baikal","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight202700001","n":"Silver Dvorak","nat":"Estovackia","a":27,"p":"DFC","s":[],"o":73,"pt":74,"h":191,"b":91,"f":"D","at":[65,72,66,72,59,75,74,74],"sk":"#ca856c","hr":"#55381c","hs":"largo","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight202700001.webp","c":"Sporty VV Klub Estovackia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh01000001","n":"Finn Vinogradov","nat":"Baikal","a":19,"p":"DFC","s":[],"o":60,"pt":69,"h":189,"b":96,"f":"D","at":[52,55,59,47,42,63,64,62],"sk":"#cd936d","hr":"#7f6345","hs":"rapado","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futbolh01000001.webp","c":"Groz Sport Kulübü","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli07600001","n":"Jun Kim","nat":"Kostanay","a":31,"p":"DFC","s":[],"o":67,"pt":67,"h":184,"b":99,"f":"D","at":[56,70,59,51,50,70,73,66],"sk":"#c99575","hr":"#33231b","hs":"trencitas","bd":"candado","ac":[],"ph":"assets/players/football/x_futboli07600001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight303400001","n":"Jan Dalen","nat":"Overmark","a":28,"p":"DFC","s":[],"o":72,"pt":72,"h":180,"b":104,"f":"D","at":[49,65,59,59,48,82,70,75],"sk":"#c48c70","hr":"#483319","hs":"raya","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight303400001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli07500001","n":"Sergio Ulvestad","nat":"Overmark","a":19,"p":"DFC","s":[],"o":64,"pt":71,"h":181,"b":97,"f":"D","at":[52,61,57,57,41,70,61,67],"sk":"#c19070","hr":"#231f18","hs":"trencitas","bd":"corta","ac":[],"ph":"assets/players/football/x_futboli07500001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli01700001","n":"Jonas Walsh","nat":"Grammes","a":26,"p":"DFC","s":[],"o":53,"pt":53,"h":184,"b":102,"f":"A","at":[44,43,40,50,40,55,54,52],"sk":"#c38c6d","hr":"#43301b","hs":"media","bd":"desprolija","ac":[],"ph":"assets/players/football/x_futboli01700001.webp","c":"Grammes FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli13300001","n":"Callum Kuiper","nat":"Margin","a":33,"p":"LI","s":["LD"],"o":56,"pt":56,"h":185,"b":99,"f":"I","at":[53,60,48,49,34,60,52,60],"sk":"#c28f72","hr":"#472610","hs":"buzz","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli13300001.webp","c":"Atlético Margin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli15700001","n":"Oliver Crossley","nat":"Kaigam","a":35,"p":"DFC","s":[],"o":44,"pt":44,"h":187,"b":101,"f":"I","at":[39,39,38,28,25,48,47,36],"sk":"#c9906b","hr":"#2d1d0e","hs":"corto","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli15700001.webp","c":"Sportivo Calcio di Kaigam","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight202600001","n":"Walter Choque","nat":"Peronia","a":29,"p":"LI","s":[],"o":62,"pt":62,"h":185,"b":98,"f":"I","at":[55,65,57,49,41,66,63,56],"sk":"#c98d68","hr":"#5c2c11","hs":"buzz","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight202600001.webp","c":"CD Héroicos de Peronia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinal00400003","n":"Romuald Kenfack","nat":"Riada","a":18,"p":"DFC","s":[],"o":50,"pt":57,"h":180,"b":101,"f":"D","at":[44,50,45,36,37,53,52,54],"sk":"#b77957","hr":"#0e0c08","hs":"engominado","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_ficticiofinal00400003.webp","c":"Independiente de Riada","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight608700001","n":"Gonzalo Zamora","nat":"Valurria","a":28,"p":"DFC","s":[],"o":46,"pt":49,"h":183,"b":107,"f":"D","at":[32,44,36,38,27,51,47,45],"sk":"#ce936f","hr":"#211b15","hs":"manbun","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight608700001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli04500001","n":"Sergio Moretti","nat":"Melonia","a":24,"p":"DFC","s":[],"o":53,"pt":60,"h":179,"b":107,"f":"D","at":[45,48,35,45,36,54,59,50],"sk":"#c58366","hr":"#552b0f","hs":"media","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futboli04500001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli00600001","n":"Ezequiel Barbosa","nat":"Tamago","a":22,"p":"DFC","s":[],"o":46,"pt":51,"h":187,"b":107,"f":"A","at":[36,50,34,39,27,48,49,41],"sk":"#c18c6a","hr":"#3c2011","hs":"manbun","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli00600001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli14400001","n":"Malik Villarreal","nat":"Costas Unidas","a":30,"p":"DFC","s":[],"o":44,"pt":44,"h":185,"b":107,"f":"D","at":[42,39,43,31,25,49,42,48],"sk":"#a86e52","hr":"#562e10","hs":"rulos","bd":"manubrio","ac":[],"ph":"assets/players/football/x_futboli14400001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight603900001","n":"Kwame Bakari","nat":"Skote","a":30,"p":"DFC","s":[],"o":53,"pt":53,"h":184,"b":106,"f":"D","at":[45,50,42,42,41,57,53,56],"sk":"#935e42","hr":"#211e16","hs":"raya","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight603900001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg01100001","n":"Bruno Falcón","nat":"Magayanes","a":24,"p":"DFC","s":[],"o":62,"pt":69,"h":188,"b":104,"f":"D","at":[59,58,55,54,43,64,65,54],"sk":"#b37854","hr":"#1b1b13","hs":"buzz","bd":"completa","ac":[],"ph":"assets/players/football/x_futbolg01100001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight603000001","n":"Diego Zapata","nat":"Morvicia","a":26,"p":"DFC","s":[],"o":55,"pt":55,"h":180,"b":102,"f":"D","at":[41,51,41,44,39,60,59,56],"sk":"#bb7b5a","hr":"#251a0f","hs":"rastas","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight603000001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli12400001","n":"Declan Ferrari","nat":"Zenet","a":34,"p":"DFC","s":[],"o":45,"pt":45,"h":178,"b":100,"f":"D","at":[38,36,34,36,27,47,50,42],"sk":"#b98262","hr":"#705433","hs":"undercut","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futboli12400001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight201400001","n":"Cristóbal Céspedes","nat":"Sotoa","a":28,"p":"DFC","s":[],"o":57,"pt":57,"h":183,"b":104,"f":"D","at":[52,49,46,46,42,60,58,56],"sk":"#b27758","hr":"#512511","hs":"afro","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight201400001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight600700001","n":"Wei Dauletov","nat":"Kostanay","a":26,"p":"LD","s":[],"o":68,"pt":71,"h":185,"b":98,"f":"D","at":[74,67,57,57,50,67,73,67],"sk":"#a66e4f","hr":"#141510","hs":"rastas","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight600700001.webp","c":"Sporty VV Klub Kostanay","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight301600001","n":"Omar Osei","nat":"Netanya","a":22,"p":"DFC","s":[],"o":75,"pt":83,"h":179,"b":107,"f":"A","at":[60,70,77,66,67,80,78,85],"sk":"#bb7953","hr":"#121511","hs":"corto","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight301600001.webp","c":"Maccabi Tel Shava","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight204500001","n":"Silver Kovac","nat":"Estovackia","a":28,"p":"DFC","s":[],"o":72,"pt":72,"h":180,"b":101,"f":"D","at":[66,62,61,62,53,74,74,68],"sk":"#c1896f","hr":"#1d170f","hs":"buzz","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight204500001.webp","c":"Red Gull Club Tellin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli17000001","n":"Callum Lebedev","nat":"Baikal","a":20,"p":"LI","s":["LD"],"o":66,"pt":75,"h":188,"b":103,"f":"D","at":[62,64,63,64,45,69,61,70],"sk":"#d49f7e","hr":"#7e7668","hs":"corto","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli17000001.webp","c":"Sporting Lake Baikal","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg00300001","n":"Sergio Schneider","nat":"Estovackia","a":26,"p":"DFC","s":[],"o":68,"pt":68,"h":183,"b":106,"f":"A","at":[63,64,59,64,54,70,69,69],"sk":"#d09970","hr":"#3e2e1c","hs":"corto","bd":"mosca","ac":[],"ph":"assets/players/football/x_futbolg00300001.webp","c":"Sporty VV Klub Estovackia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli07100001","n":"Hugo Yakovlev","nat":"Baikal","a":34,"p":"DFC","s":[],"o":64,"pt":64,"h":189,"b":93,"f":"D","at":[54,61,57,56,48,67,66,66],"sk":"#cf9878","hr":"#1a160d","hs":"cresta","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futboli07100001.webp","c":"Groz Sport Kulübü","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli02600001","n":"Jun Ermekov","nat":"Kostanay","a":30,"p":"DFC","s":[],"o":74,"pt":74,"h":185,"b":104,"f":"D","at":[71,70,68,62,58,79,70,81],"sk":"#c48c65","hr":"#191914","hs":"raya","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli02600001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight300900001","n":"Jack Aasen","nat":"Overmark","a":24,"p":"DFC","s":[],"o":64,"pt":71,"h":187,"b":102,"f":"D","at":[58,60,51,51,53,68,64,60],"sk":"#c3886c","hr":"#1b150d","hs":"manbun","bd":"corta","ac":[],"ph":"assets/players/football/x_ficticiofinalnight300900001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli11600001","n":"Adrián Næss","nat":"Overmark","a":20,"p":"DFC","s":[],"o":60,"pt":72,"h":189,"b":99,"f":"D","at":[46,53,55,42,48,71,54,61],"sk":"#cb9979","hr":"#115570","hs":"buzz","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_futboli11600001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg01800001","n":"Liam Hartmann","nat":"Margin","a":19,"p":"LI","s":["LD"],"o":51,"pt":58,"h":185,"b":98,"f":"D","at":[57,51,39,41,35,50,56,51],"sk":"#c58c65","hr":"#15100a","hs":"crop","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_futbolg01800001.webp","c":"Atlético Margin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli08500001","n":"Liam Lockhart","nat":"Kaigam","a":32,"p":"DFC","s":[],"o":48,"pt":48,"h":192,"b":104,"f":"D","at":[38,51,35,37,25,50,53,55],"sk":"#c58f74","hr":"#14110b","hs":"puas","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futboli08500001.webp","c":"Sportivo Calcio di Kaigam","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight608000001","n":"Nicolás Perotti","nat":"Peronia","a":25,"p":"LI","s":[],"o":52,"pt":54,"h":188,"b":96,"f":"I","at":[43,56,36,37,37,53,61,52],"sk":"#c08c69","hr":"#2f281d","hs":"manbun","bd":"mosca","ac":[],"ph":"assets/players/football/x_ficticiofinalnight608000001.webp","c":"CD Héroicos de Peronia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalvartest00400001","n":"Moussa Okafor","nat":"Riada","a":29,"p":"DFC","s":[],"o":51,"pt":51,"h":189,"b":107,"f":"D","at":[50,52,48,40,41,53,53,50],"sk":"#83563f","hr":"#5c402b","hs":"raya","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalvartest00400001.webp","c":"Independiente de Riada","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli16400001","n":"Iván Camino","nat":"Valurria","a":23,"p":"DFC","s":[],"o":47,"pt":55,"h":182,"b":105,"f":"D","at":[37,46,36,45,28,51,46,48],"sk":"#b27c5d","hr":"#1b1710","hs":"degradado","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futboli16400001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli17700001","n":"Declan Marino","nat":"Melonia","a":29,"p":"DFC","s":[],"o":48,"pt":48,"h":180,"b":103,"f":"D","at":[46,53,36,38,27,48,52,49],"sk":"#bf8668","hr":"#271d12","hs":"jopo","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli17700001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli05600001","n":"Agustín Ishikawa","nat":"Tamago","a":24,"p":"DFC","s":[],"o":47,"pt":50,"h":180,"b":108,"f":"D","at":[35,45,41,41,29,50,51,48],"sk":"#c6906b","hr":"#543317","hs":"afro","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli05600001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight600200001","n":"Caio Esquivel","nat":"Costas Unidas","a":21,"p":"DFC","s":[],"o":44,"pt":61,"h":181,"b":95,"f":"I","at":[35,38,38,37,32,48,45,47],"sk":"#b97e5b","hr":"#14130d","hs":"corto","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight600200001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli14100001","n":"Amadou Camara","nat":"Skote","a":31,"p":"DFC","s":[],"o":50,"pt":51,"h":177,"b":100,"f":"A","at":[41,48,43,45,31,58,43,46],"sk":"#8b5e4a","hr":"#54351f","hs":"media","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli14100001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight600100001","n":"Maximiliano Ojeda","nat":"Magayanes","a":27,"p":"DFC","s":[],"o":44,"pt":44,"h":190,"b":103,"f":"D","at":[33,39,28,34,35,51,40,38],"sk":"#be8162","hr":"#745535","hs":"flequillo","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight600100001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh00300001","n":"Devin Hayes","nat":"Morvicia","a":19,"p":"DFC","s":[],"o":44,"pt":56,"h":186,"b":97,"f":"I","at":[34,40,39,38,25,48,44,42],"sk":"#c08a6a","hr":"#9d937d","hs":"media","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futbolh00300001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli12800001","n":"Sergio Pavlović","nat":"Zenet","a":27,"p":"DFC","s":[],"o":57,"pt":60,"h":186,"b":96,"f":"A","at":[52,53,50,47,47,61,58,57],"sk":"#b67d59","hr":"#20190f","hs":"afro","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futboli12800001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli11300001","n":"Joaquín Cabrera","nat":"Sotoa","a":17,"p":"DFC","s":[],"o":44,"pt":57,"h":181,"b":107,"f":"I","at":[39,37,34,36,32,44,50,47],"sk":"#c0815d","hr":"#171511","hs":"afro","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli11300001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli07400001","n":"Minjun Sharma","nat":"Kostanay","a":18,"p":"MCD","s":[],"o":69,"pt":81,"h":174,"b":103,"f":"D","at":[70,72,73,70,67,71,61,69],"sk":"#be8c6c","hr":"#222019","hs":"afro","bd":"completa","ac":[],"ph":"assets/players/football/x_futboli07400001.webp","c":"Sporty VV Klub Kostanay","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli07900001","n":"Samuel Malka","nat":"Netanya","a":21,"p":"DFC","s":[],"o":70,"pt":85,"h":191,"b":99,"f":"D","at":[64,73,63,61,53,72,73,72],"sk":"#ae7456","hr":"#362a1b","hs":"engominado","bd":"candado","ac":[],"ph":"assets/players/football/x_futboli07900001.webp","c":"Maccabi Tel Shava","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli09500001","n":"Pieter Valach","nat":"Estovackia","a":35,"p":"LI","s":["LD"],"o":74,"pt":74,"h":186,"b":98,"f":"D","at":[65,71,66,62,62,81,72,79],"sk":"#c58b70","hr":"#583e26","hs":"engominado","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futboli09500001.webp","c":"Red Gull Club Tellin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight204000001","n":"Ilya Titov","nat":"Baikal","a":28,"p":"LD","s":[],"o":70,"pt":70,"h":184,"b":99,"f":"D","at":[69,73,56,59,57,72,71,69],"sk":"#be8664","hr":"#251910","hs":"afro","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight204000001.webp","c":"Sporting Lake Baikal","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight204600001","n":"Jaan Sepp","nat":"Estovackia","a":18,"p":"DFC","s":[],"o":68,"pt":76,"h":185,"b":103,"f":"D","at":[55,69,56,61,55,72,70,61],"sk":"#d49c7f","hr":"#4b2510","hs":"engominado","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight204600001.webp","c":"Sporty VV Klub Estovackia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli17200001","n":"Marco Fomin","nat":"Baikal","a":32,"p":"LI","s":["LD"],"o":82,"pt":82,"h":183,"b":97,"f":"I","at":[78,78,75,77,64,84,83,82],"sk":"#d19973","hr":"#46341d","hs":"buzz","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli17200001.webp","c":"Groz Sport Kulübü","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli02200001","n":"Takumi Kairatov","nat":"Kostanay","a":25,"p":"DFC","s":[],"o":67,"pt":67,"h":188,"b":106,"f":"D","at":[58,56,59,61,49,73,64,69],"sk":"#c78e64","hr":"#1b160e","hs":"crop","bd":"candado","ac":[],"ph":"assets/players/football/x_futboli02200001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight204800001","n":"Ulf Nilsen","nat":"Overmark","a":30,"p":"DFC","s":[],"o":62,"pt":62,"h":178,"b":105,"f":"D","at":[52,59,51,55,37,63,67,67],"sk":"#ca9373","hr":"#20170e","hs":"rulos","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight204800001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight602500001","n":"Lukas Lie","nat":"Overmark","a":20,"p":"DFC","s":[],"o":58,"pt":69,"h":191,"b":90,"f":"D","at":[47,56,50,51,44,58,66,56],"sk":"#d39c77","hr":"#3a2917","hs":"corto","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight602500001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight605600001","n":"Liam Visser","nat":"Margin","a":18,"p":"LD","s":[],"o":44,"pt":57,"h":183,"b":103,"f":"D","at":[41,40,31,41,25,50,37,51],"sk":"#d09e78","hr":"#301312","hs":"afro","bd":"ninguna","ac":[],"ph":"assets/players/football/x_ficticiofinalnight605600001.webp","c":"Atlético Margin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalv3test00000001","n":"Matteo Oakley","nat":"Kaigam","a":22,"p":"LI","s":["LD"],"o":57,"pt":62,"h":185,"b":96,"f":"D","at":[60,55,45,53,40,55,61,56],"sk":"#c99274","hr":"#36220d","hs":"engominado","bd":"anclada","ac":[],"ph":"assets/players/football/x_ficticiofinalv3test00000001.webp","c":"Sportivo Calcio di Kaigam","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh00600001","n":"Caio Baldivieso","nat":"Peronia","a":18,"p":"LD","s":["LI"],"o":45,"pt":60,"h":193,"b":102,"f":"A","at":[35,51,34,34,28,48,50,47],"sk":"#b17758","hr":"#0d0e0b","hs":"rastas","bd":"sombra","ac":[],"ph":"assets/players/football/x_futbolh00600001.webp","c":"CD Héroicos de Peronia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli17800001","n":"Amadou Khalil","nat":"Riada","a":21,"p":"DFC","s":[],"o":50,"pt":67,"h":191,"b":104,"f":"D","at":[36,50,44,35,34,59,46,51],"sk":"#9a674a","hr":"#6d4c2e","hs":"jopo","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futboli17800001.webp","c":"Independiente de Riada","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight608800001","n":"Julián Oliveira","nat":"Valurria","a":18,"p":"LI","s":[],"o":46,"pt":53,"h":180,"b":100,"f":"D","at":[46,46,35,43,25,46,49,47],"sk":"#b97f5f","hr":"#20170d","hs":"afro","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight608800001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli18100001","n":"Liam Colombo","nat":"Melonia","a":23,"p":"DFC","s":[],"o":46,"pt":53,"h":184,"b":106,"f":"D","at":[48,46,38,36,33,48,46,46],"sk":"#cb9b7c","hr":"#5c170d","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/x_futboli18100001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight500500001","n":"Diego Maciel","nat":"Tamago","a":21,"p":"LI","s":["LD"],"o":55,"pt":66,"h":182,"b":103,"f":"D","at":[59,50,43,38,44,59,54,54],"sk":"#c3866a","hr":"#9c8167","hs":"afro","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight500500001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight607900001","n":"Bruno Bermúdez","nat":"Costas Unidas","a":25,"p":"LI","s":[],"o":69,"pt":71,"h":180,"b":96,"f":"D","at":[61,66,64,63,59,70,74,70],"sk":"#be8766","hr":"#161511","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/x_ficticiofinalnight607900001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli07300001","n":"Youssef Zondi","nat":"Skote","a":18,"p":"DFC","s":[],"o":44,"pt":59,"h":186,"b":97,"f":"D","at":[33,41,31,35,31,50,43,46],"sk":"#b16f46","hr":"#805237","hs":"buzz","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futboli07300001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight201000001","n":"Federico Pardo","nat":"Magayanes","a":22,"p":"DFC","s":[],"o":44,"pt":50,"h":175,"b":99,"f":"D","at":[33,43,37,40,34,50,40,39],"sk":"#cd8b67","hr":"#2a261f","hs":"trencitas","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight201000001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli01900001","n":"Malik Sanders","nat":"Morvicia","a":17,"p":"DFC","s":[],"o":44,"pt":50,"h":186,"b":108,"f":"I","at":[38,41,30,32,31,52,38,39],"sk":"#bb7e5c","hr":"#221b10","hs":"rapado","bd":"ninguna","ac":[],"ph":"assets/players/football/x_futboli01900001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli01600001","n":"Hugo Knežević","nat":"Zenet","a":23,"p":"DFC","s":[],"o":49,"pt":54,"h":188,"b":104,"f":"I","at":[46,47,42,33,29,51,54,48],"sk":"#cb936e","hr":"#4c3c2c","hs":"manbun","bd":"ninguna","ac":[],"ph":"assets/players/football/x_futboli01600001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight201200001","n":"Pablo Crespo","nat":"Sotoa","a":23,"p":"DFC","s":[],"o":51,"pt":53,"h":196,"b":93,"f":"D","at":[39,53,38,45,30,57,47,53],"sk":"#b47756","hr":"#8b3b0b","hs":"afro","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight201200001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight600500001","n":"Wei Akhmetov","nat":"Kostanay","a":19,"p":"MCD","s":[],"o":66,"pt":82,"h":179,"b":110,"f":"D","at":[62,60,63,72,54,64,56,63],"sk":"#ce916b","hr":"#7d5b3a","hs":"rastas","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight600500001.webp","c":"Sporty VV Klub Kostanay","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight200400001","n":"Amir Ilan","nat":"Netanya","a":21,"p":"LI","s":["LD"],"o":74,"pt":91,"h":184,"b":101,"f":"D","at":[73,76,61,70,60,75,73,69],"sk":"#bd8262","hr":"#846746","hs":"afro","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight200400001.webp","c":"Maccabi Tel Shava","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli02000001","n":"Matteo Varga","nat":"Estovackia","a":24,"p":"LI","s":["LD"],"o":72,"pt":78,"h":184,"b":105,"f":"I","at":[70,73,62,59,53,79,65,78],"sk":"#d5a182","hr":"#3f2814","hs":"buzz","bd":"ninguna","ac":[],"ph":"assets/players/football/x_futboli02000001.webp","c":"Red Gull Club Tellin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight601000001","n":"Luca Rossi","nat":"Baikal","a":28,"p":"LD","s":[],"o":66,"pt":66,"h":183,"b":104,"f":"D","at":[64,66,62,58,53,67,69,63],"sk":"#c78767","hr":"#8d6945","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/x_ficticiofinalnight601000001.webp","c":"Sporting Lake Baikal","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli16300001","n":"Luca Jarvis","nat":"Estovackia","a":27,"p":"LI","s":["LD"],"o":66,"pt":69,"h":190,"b":99,"f":"D","at":[59,68,56,64,49,64,73,66],"sk":"#c28969","hr":"#281708","hs":"degradado","bd":"mosca","ac":[],"ph":"assets/players/football/x_futboli16300001.webp","c":"Sporty VV Klub Estovackia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli10900001","n":"Finn Osipov","nat":"Baikal","a":21,"p":"LI","s":[],"o":66,"pt":83,"h":184,"b":98,"f":"I","at":[48,60,56,59,57,71,67,65],"sk":"#d59f7e","hr":"#6b5334","hs":"media","bd":"ninguna","ac":[],"ph":"assets/players/football/x_futboli10900001.webp","c":"Groz Sport Kulübü","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli17100001","n":"Rohan Dosmukhamedov","nat":"Kostanay","a":34,"p":"DFC","s":[],"o":64,"pt":64,"h":190,"b":105,"f":"D","at":[54,65,46,56,52,68,65,64],"sk":"#c48e6a","hr":"#845531","hs":"rapado","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli17100001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli06900001","n":"Oliver Aamodt","nat":"Overmark","a":35,"p":"LI","s":["LD"],"o":67,"pt":67,"h":184,"b":91,"f":"D","at":[65,73,57,60,53,71,64,64],"sk":"#c8987a","hr":"#988158","hs":"corto","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futboli06900001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight605100001","n":"Jack Dahl","nat":"Overmark","a":23,"p":"DFC","s":[],"o":62,"pt":66,"h":182,"b":103,"f":"D","at":[57,61,60,56,48,63,64,62],"sk":"#ce8d76","hr":"#715330","hs":"corto","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight605100001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg00200001","n":"Callum Sommer","nat":"Margin","a":23,"p":"DFC","s":[],"o":50,"pt":53,"h":177,"b":110,"f":"I","at":[40,47,35,40,31,54,54,52],"sk":"#d09775","hr":"#7f5f34","hs":"corto","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futbolg00200001.webp","c":"Atlético Margin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg00900001","n":"Jack Jennings","nat":"Kaigam","a":30,"p":"LI","s":[],"o":54,"pt":54,"h":183,"b":97,"f":"D","at":[49,48,42,50,34,56,56,52],"sk":"#c69074","hr":"#493924","hs":"rastas","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_futbolg00900001.webp","c":"Sportivo Calcio di Kaigam","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli06100001","n":"Yeison Lanzini","nat":"Peronia","a":35,"p":"MCD","s":[],"o":49,"pt":49,"h":174,"b":101,"f":"I","at":[43,49,51,49,46,43,51,46],"sk":"#b78663","hr":"#1c1912","hs":"corto","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_futboli06100001.webp","c":"CD Héroicos de Peronia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli00000001","n":"Tariq Haddad","nat":"Riada","a":17,"p":"LI","s":[],"o":50,"pt":68,"h":183,"b":98,"f":"A","at":[49,56,37,43,30,51,53,45],"sk":"#9f6242","hr":"#332519","hs":"mullet","bd":"manubrio","ac":["aros"],"ph":"assets/players/football/x_futboli00000001.webp","c":"Independiente de Riada","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight00100001","n":"Milton Scarpa","nat":"Valurria","a":24,"p":"LI","s":["LD"],"o":54,"pt":60,"h":185,"b":102,"f":"I","at":[50,55,39,38,38,60,54,62],"sk":"#cc8e6c","hr":"#634a32","hs":"afro","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight00100001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli02900001","n":"Oliver Riva","nat":"Melonia","a":33,"p":"LI","s":[],"o":52,"pt":52,"h":181,"b":96,"f":"D","at":[46,49,41,41,38,61,44,52],"sk":"#cb9775","hr":"#a78555","hs":"corto","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli02900001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight607700001","n":"Hiro Coelho","nat":"Tamago","a":25,"p":"LI","s":[],"o":48,"pt":50,"h":181,"b":101,"f":"I","at":[45,45,32,39,29,50,48,54],"sk":"#c79376","hr":"#815832","hs":"undercut","bd":"desprolija","ac":[],"ph":"assets/players/football/x_ficticiofinalnight607700001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight602700001","n":"Ignacio Musso","nat":"Costas Unidas","a":30,"p":"LI","s":["LD"],"o":46,"pt":46,"h":184,"b":100,"f":"A","at":[40,48,32,48,29,46,46,49],"sk":"#c28665","hr":"#1a150e","hs":"engominado","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight602700001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight205100001","n":"Jaco Sithole","nat":"Skote","a":20,"p":"LI","s":["LD"],"o":44,"pt":50,"h":188,"b":93,"f":"I","at":[39,47,36,33,30,47,46,47],"sk":"#b47553","hr":"#13120f","hs":"corto","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight205100001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli01000001","n":"Facundo Vázquez","nat":"Magayanes","a":22,"p":"LI","s":["LD"],"o":57,"pt":64,"h":179,"b":95,"f":"D","at":[55,56,46,50,37,61,54,53],"sk":"#ad7755","hr":"#16150f","hs":"afro","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_futboli01000001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh01300001","n":"Darius Bell","nat":"Morvicia","a":26,"p":"LI","s":["LD"],"o":55,"pt":57,"h":185,"b":101,"f":"D","at":[53,55,46,46,39,57,58,50],"sk":"#b77c5c","hr":"#1e1108","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/x_futbolh01300001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinal00100005","n":"Ante Jurić","nat":"Zenet","a":19,"p":"LI","s":["LD"],"o":44,"pt":52,"h":181,"b":97,"f":"D","at":[42,42,29,29,34,50,40,44],"sk":"#c8937c","hr":"#4b260a","hs":"afro","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinal00100005.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh00900001","n":"Devin Ávalos","nat":"Sotoa","a":27,"p":"LI","s":["LD"],"o":48,"pt":51,"h":188,"b":95,"f":"I","at":[50,53,36,45,43,47,49,48],"sk":"#b98465","hr":"#4e3219","hs":"corto","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futbolh00900001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli14500001","n":"Rohan Lee","nat":"Kostanay","a":20,"p":"MI","s":["EI"],"o":74,"pt":92,"h":182,"b":97,"f":"D","at":[78,70,71,75,75,69,75,77],"sk":"#c58e6b","hr":"#435149","hs":"crop","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futboli14500001.webp","c":"Sporty VV Klub Kostanay","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli12000001","n":"Amadou Yosef","nat":"Netanya","a":33,"p":"LD","s":["LI"],"o":72,"pt":72,"h":190,"b":98,"f":"I","at":[63,75,63,62,50,77,72,65],"sk":"#c28d65","hr":"#382515","hs":"corto","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli12000001.webp","c":"Maccabi Tel Shava","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight201500001","n":"Tommy Bradshaw","nat":"Kaigam","a":29,"p":"LD","s":["LI"],"o":77,"pt":77,"h":183,"b":100,"f":"I","at":[73,68,74,65,63,82,75,86],"sk":"#ca9171","hr":"#15130e","hs":"engominado","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight201500001.webp","c":"Red Gull Club Tellin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalv2test00600001","n":"Luca de Vries","nat":"Baikal","a":27,"p":"MCD","s":["MC"],"o":74,"pt":76,"h":173,"b":105,"f":"D","at":[67,79,68,78,65,68,70,75],"sk":"#c4805e","hr":"#684c32","hs":"rastas","bd":"desprolija","ac":[],"ph":"assets/players/football/x_ficticiofinalv2test00600001.webp","c":"Sporting Lake Baikal","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinal00300003","n":"Aidos Nurgaliev","nat":"Kostanay","a":22,"p":"MCD","s":["DFC"],"o":68,"pt":74,"h":173,"b":105,"f":"D","at":[67,65,68,71,63,62,65,66],"sk":"#c99777","hr":"#34160e","hs":"corto","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinal00300003.webp","c":"Sporty VV Klub Estovackia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight202100001","n":"Mikhail Pavlenko","nat":"Baikal","a":21,"p":"LD","s":[],"o":73,"pt":79,"h":178,"b":101,"f":"D","at":[78,70,68,59,54,75,74,74],"sk":"#c08865","hr":"#2e261d","hs":"rastas","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight202100001.webp","c":"Groz Sport Kulübü","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalv2test00400001","n":"Jun Nguyen","nat":"Kostanay","a":25,"p":"LI","s":["LD"],"o":69,"pt":71,"h":183,"b":101,"f":"D","at":[66,65,60,63,51,73,66,67],"sk":"#cc9a7c","hr":"#453928","hs":"rapado","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalv2test00400001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight300000001","n":"Sergio Pedersen","nat":"Overmark","a":30,"p":"LI","s":[],"o":68,"pt":68,"h":189,"b":95,"f":"D","at":[65,75,67,61,53,70,68,72],"sk":"#cd9e83","hr":"#66391d","hs":"buzz","bd":"bigote","ac":[],"ph":"assets/players/football/x_ficticiofinalnight300000001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli15500001","n":"Tomás Myhre","nat":"Overmark","a":21,"p":"LI","s":[],"o":72,"pt":88,"h":186,"b":102,"f":"D","at":[66,66,50,70,53,76,68,70],"sk":"#d0987d","hr":"#55270b","hs":"crop","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futboli15500001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli10700001","n":"Jack Whitlock","nat":"Kaigam","a":29,"p":"LD","s":["LI"],"o":54,"pt":54,"h":183,"b":97,"f":"D","at":[48,56,42,43,41,60,49,53],"sk":"#af7350","hr":"#0c0b0a","hs":"rastas","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_futboli10700001.webp","c":"Sportivo Calcio di Kaigam","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalv3test00300001","n":"Lautaro Restrepo","nat":"Peronia","a":22,"p":"EI","s":["ED"],"o":60,"pt":64,"h":180,"b":96,"f":"A","at":[62,62,49,58,64,40,58,54],"sk":"#cd9573","hr":"#242113","hs":"manbun","bd":"bigote","ac":[],"ph":"assets/players/football/x_ficticiofinalv3test00300001.webp","c":"CD Héroicos de Peronia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight301900001","n":"Malik Manga","nat":"Riada","a":22,"p":"LI","s":[],"o":48,"pt":56,"h":183,"b":94,"f":"D","at":[49,44,39,38,33,49,49,45],"sk":"#a26b4d","hr":"#20201b","hs":"corona","bd":"sombra","ac":[],"ph":"assets/players/football/x_ficticiofinalnight301900001.webp","c":"Independiente de Riada","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli17600001","n":"Bruno Ramírez","nat":"Valurria","a":28,"p":"LD","s":[],"o":46,"pt":47,"h":176,"b":94,"f":"D","at":[34,40,33,39,25,48,51,47],"sk":"#a97454","hr":"#161510","hs":"degradado","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futboli17600001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight605300001","n":"Callum Mancini","nat":"Melonia","a":30,"p":"LI","s":["LD"],"o":51,"pt":51,"h":181,"b":95,"f":"D","at":[45,50,35,38,34,56,49,46],"sk":"#b88364","hr":"#6e4f33","hs":"afro","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight605300001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg00500001","n":"Agustín Peixoto","nat":"Tamago","a":24,"p":"LD","s":[],"o":59,"pt":63,"h":196,"b":100,"f":"D","at":[50,58,45,55,44,63,59,54],"sk":"#be8662","hr":"#684224","hs":"corto","bd":"mosca","ac":[],"ph":"assets/players/football/x_futbolg00500001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight606300001","n":"Ezequiel Grimaldi","nat":"Costas Unidas","a":19,"p":"LD","s":["LI"],"o":51,"pt":65,"h":186,"b":93,"f":"D","at":[41,50,38,39,35,55,55,50],"sk":"#d0987c","hr":"#67381c","hs":"manbun","bd":"sombra","ac":[],"ph":"assets/players/football/x_ficticiofinalnight606300001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight604900001","n":"Omar Steyn","nat":"Skote","a":21,"p":"LI","s":["LD"],"o":46,"pt":52,"h":183,"b":90,"f":"D","at":[45,52,32,38,29,48,48,51],"sk":"#b47752","hr":"#965e57","hs":"mullet","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight604900001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli08000001","n":"Rodrigo Guerra","nat":"Magayanes","a":19,"p":"LI","s":["LD"],"o":44,"pt":56,"h":180,"b":99,"f":"D","at":[37,43,39,36,29,46,47,44],"sk":"#c79375","hr":"#563114","hs":"corto","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futboli08000001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli16100001","n":"Marcus Carter","nat":"Morvicia","a":34,"p":"LI","s":["LD"],"o":46,"pt":46,"h":185,"b":100,"f":"D","at":[33,49,38,35,27,52,48,48],"sk":"#b97659","hr":"#231c12","hs":"manbun","bd":"corta","ac":[],"ph":"assets/players/football/x_futboli16100001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli09100001","n":"Declan Delić","nat":"Zenet","a":23,"p":"LI","s":[],"o":45,"pt":47,"h":193,"b":105,"f":"D","at":[43,43,36,30,28,50,44,45],"sk":"#c38a6b","hr":"#48351e","hs":"raya","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_futboli09100001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli11500001","n":"Nicolás Correa","nat":"Sotoa","a":22,"p":"LI","s":[],"o":44,"pt":52,"h":176,"b":91,"f":"A","at":[35,41,34,41,27,49,41,50],"sk":"#c79070","hr":"#10120c","hs":"buzz","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_futboli11500001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli04600001","n":"Wei Omarov","nat":"Kostanay","a":26,"p":"DC","s":[],"o":75,"pt":78,"h":184,"b":106,"f":"D","at":[75,80,73,70,75,53,76,72],"sk":"#c08969","hr":"#563920","hs":"raya","bd":"manubrio","ac":[],"ph":"assets/players/football/x_futboli04600001.webp","c":"Sporty VV Klub Kostanay","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight605000001","n":"Tariq Biton","nat":"Netanya","a":19,"p":"LD","s":["LI"],"o":68,"pt":86,"h":186,"b":96,"f":"D","at":[66,71,63,62,49,66,75,67],"sk":"#ba7f63","hr":"#181715","hs":"undercut","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight605000001.webp","c":"Maccabi Tel Shava","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli00100001","n":"Sergio Bagshaw","nat":"Kaigam","a":32,"p":"LD","s":["LI"],"o":73,"pt":73,"h":183,"b":100,"f":"D","at":[72,75,65,57,57,77,73,73],"sk":"#cb9575","hr":"#342617","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli00100001.webp","c":"Red Gull Club Tellin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli13500001","n":"Oliver Savelev","nat":"Baikal","a":28,"p":"MCD","s":[],"o":71,"pt":74,"h":176,"b":99,"f":"D","at":[65,64,70,70,69,60,66,75],"sk":"#c39172","hr":"#302415","hs":"jopo","bd":"corta","ac":[],"ph":"assets/players/football/x_futboli13500001.webp","c":"Sporting Lake Baikal","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli16200001","n":"Emeka Saidi","nat":"Sahar","a":21,"p":"MC","s":["MD"],"o":79,"pt":93,"h":173,"b":99,"f":"D","at":[80,75,77,84,76,80,72,76],"sk":"#af7955","hr":"#181610","hs":"crop","bd":"chuletas","ac":["aros"],"ph":"assets/players/football/x_futboli16200001.webp","c":"Sporty VV Klub Estovackia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli05100001","n":"Marco Halvorsen","nat":"Overmark","a":32,"p":"LD","s":["LI"],"o":64,"pt":64,"h":186,"b":94,"f":"D","at":[62,58,58,48,57,70,61,69],"sk":"#cd9471","hr":"#4e280f","hs":"crop","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futboli05100001.webp","c":"Groz Sport Kulübü","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli06200001","n":"Wei Abdrakhmanov","nat":"Kostanay","a":23,"p":"LI","s":["LD"],"o":60,"pt":67,"h":176,"b":103,"f":"D","at":[55,62,46,50,43,64,59,56],"sk":"#ce9772","hr":"#171611","hs":"corto","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futboli06200001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli09800001","n":"Liam Strand","nat":"Overmark","a":21,"p":"LD","s":[],"o":66,"pt":74,"h":182,"b":88,"f":"D","at":[54,62,59,56,54,72,67,72],"sk":"#cc926d","hr":"#1b160e","hs":"jopo","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli09800001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight300200001","n":"Liam Hansen","nat":"Overmark","a":26,"p":"LI","s":["LD"],"o":63,"pt":64,"h":179,"b":101,"f":"A","at":[54,58,54,58,46,66,65,64],"sk":"#d29777","hr":"#61472f","hs":"rastas","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight300200001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight601600001","n":"Jack Ashworth","nat":"Kaigam","a":24,"p":"EI","s":["ED"],"o":58,"pt":61,"h":173,"b":112,"f":"D","at":[58,56,54,52,60,45,55,56],"sk":"#ca9675","hr":"#411907","hs":"rulos","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight601600001.webp","c":"Sportivo Calcio di Kaigam","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight606800001","n":"Caio Godoy","nat":"Peronia","a":28,"p":"ED","s":[],"o":58,"pt":59,"h":172,"b":99,"f":"D","at":[55,61,61,51,58,36,53,56],"sk":"#b98363","hr":"#2b2216","hs":"corto","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight606800001.webp","c":"CD Héroicos de Peronia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli09900001","n":"Sami Nguema","nat":"Riada","a":29,"p":"LD","s":[],"o":47,"pt":47,"h":182,"b":98,"f":"D","at":[44,52,37,37,26,51,46,38],"sk":"#935b3e","hr":"#5f3923","hs":"rulos","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futboli09900001.webp","c":"Independiente de Riada","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight601800001","n":"Bautista Bordón","nat":"Valurria","a":26,"p":"MCD","s":[],"o":55,"pt":56,"h":179,"b":106,"f":"D","at":[46,52,53,55,48,48,54,56],"sk":"#b98267","hr":"#14110c","hs":"jopo","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight601800001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight200200001","n":"Gustavo Bastos","nat":"Tamago","a":26,"p":"LD","s":["LI"],"o":53,"pt":55,"h":183,"b":93,"f":"D","at":[43,49,40,42,37,57,56,60],"sk":"#ae714e","hr":"#2e170a","hs":"afro","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight200200001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli10600001","n":"Ezequiel Ueda","nat":"Tamago","a":34,"p":"LD","s":[],"o":52,"pt":52,"h":181,"b":99,"f":"A","at":[49,46,41,41,35,52,57,52],"sk":"#9f694b","hr":"#181713","hs":"afro","bd":"completa","ac":[],"ph":"assets/players/football/x_futboli10600001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli04000001","n":"Tyler Johnson","nat":"Costas Unidas","a":19,"p":"LD","s":["LI"],"o":44,"pt":57,"h":187,"b":101,"f":"I","at":[46,43,29,38,27,47,42,52],"sk":"#bc7f5b","hr":"#100c07","hs":"corto","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futboli04000001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight201800001","n":"Andile Khumalo","nat":"Skote","a":28,"p":"LD","s":["LI"],"o":57,"pt":57,"h":185,"b":99,"f":"D","at":[57,61,46,54,29,58,56,61],"sk":"#9b6145","hr":"#51230e","hs":"crop","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight201800001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli15600001","n":"Brayan Zúñiga","nat":"Magayanes","a":23,"p":"LD","s":["LI"],"o":55,"pt":63,"h":186,"b":99,"f":"D","at":[49,49,45,45,42,55,63,47],"sk":"#c4855f","hr":"#775a3a","hs":"raya","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_futboli15600001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight609400001","n":"Nicolás Pereyra","nat":"Morvicia","a":30,"p":"LD","s":[],"o":53,"pt":53,"h":182,"b":98,"f":"D","at":[58,59,47,45,30,52,57,53],"sk":"#c58562","hr":"#805a37","hs":"corto","bd":"anclada","ac":[],"ph":"assets/players/football/x_ficticiofinalnight609400001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalvartest00500001","n":"Emeka Vaknin","nat":"Netanya","a":29,"p":"LD","s":["LI"],"o":56,"pt":57,"h":189,"b":96,"f":"D","at":[52,63,53,50,44,61,53,50],"sk":"#b57d5b","hr":"#533b25","hs":"raya","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalvartest00500001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight204100001","n":"Pablo Jara","nat":"Sotoa","a":20,"p":"LD","s":["LI"],"o":53,"pt":71,"h":184,"b":96,"f":"A","at":[51,51,49,42,45,60,45,46],"sk":"#d09776","hr":"#191713","hs":"jopo","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight204100001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli17500001","n":"Minjun Kenzhebayev","nat":"Kostanay","a":23,"p":"DC","s":[],"o":78,"pt":81,"h":182,"b":107,"f":"A","at":[85,74,80,76,72,58,68,85],"sk":"#c78f67","hr":"#7f5834","hs":"afro","bd":"chuletas","ac":["aros"],"ph":"assets/players/football/x_futboli17500001.webp","c":"Sporty VV Klub Kostanay","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli17400001","n":"Amadou Uzan","nat":"Netanya","a":35,"p":"MCD","s":["MC"],"o":73,"pt":73,"h":176,"b":108,"f":"D","at":[73,74,68,74,65,69,69,79],"sk":"#ac7a5b","hr":"#1d1b15","hs":"corto","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_futboli17400001.webp","c":"Maccabi Tel Shava","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight301200001","n":"Rodrigo Matsumoto","nat":"Tamago","a":29,"p":"MCD","s":[],"o":68,"pt":68,"h":179,"b":99,"f":"D","at":[57,60,66,73,57,69,69,62],"sk":"#b18062","hr":"#100e0b","hs":"rulos","bd":"candado","ac":[],"ph":"assets/players/football/x_ficticiofinalnight301200001.webp","c":"Red Gull Club Tellin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli06800001","n":"Kwame Jerbi","nat":"Netanya","a":29,"p":"MC","s":[],"o":75,"pt":75,"h":177,"b":101,"f":"D","at":[68,79,70,80,72,68,68,75],"sk":"#84563c","hr":"#5f452c","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli06800001.webp","c":"Sporting Lake Baikal","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli00400001","n":"Moussa Al-Farsi","nat":"Netanya","a":22,"p":"MD","s":[],"o":71,"pt":74,"h":175,"b":94,"f":"I","at":[71,74,66,73,58,67,74,71],"sk":"#a0715a","hr":"#0d0e0a","hs":"twists","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_futboli00400001.webp","c":"Sporty VV Klub Estovackia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli03000001","n":"Felipe Pereira","nat":"Tamago","a":28,"p":"MCD","s":["DFC"],"o":62,"pt":65,"h":182,"b":100,"f":"A","at":[56,57,61,60,51,53,65,64],"sk":"#b27c5d","hr":"#14130f","hs":"rastas","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_futboli03000001.webp","c":"Groz Sport Kulübü","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight601300001","n":"Hiro Sadykov","nat":"Kostanay","a":20,"p":"MCD","s":["DFC"],"o":55,"pt":70,"h":175,"b":101,"f":"D","at":[48,45,51,56,48,47,45,61],"sk":"#ce9b7d","hr":"#46543e","hs":"buzz","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight601300001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli16500001","n":"Luca Haugen","nat":"Overmark","a":17,"p":"LD","s":[],"o":61,"pt":77,"h":185,"b":101,"f":"A","at":[54,62,49,49,51,65,62,61],"sk":"#ca8f68","hr":"#795c3f","hs":"rapado","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futboli16500001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight609900001","n":"Hugo O'Connor","nat":"Overmark","a":21,"p":"LD","s":["LI"],"o":68,"pt":86,"h":190,"b":104,"f":"D","at":[49,69,62,55,54,73,76,65],"sk":"#bd8a6a","hr":"#402b14","hs":"afro","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight609900001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight603300001","n":"Matteo Gallagher","nat":"Kaigam","a":26,"p":"DFC","s":[],"o":47,"pt":48,"h":191,"b":108,"f":"D","at":[32,41,37,37,36,53,48,50],"sk":"#c58e6e","hr":"#402210","hs":"rulos","bd":"bigote","ac":[],"ph":"assets/players/football/x_ficticiofinalnight603300001.webp","c":"Sportivo Calcio di Kaigam","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli10500001","n":"Jalen Williams","nat":"Peronia","a":33,"p":"DC","s":[],"o":59,"pt":59,"h":188,"b":99,"f":"I","at":[61,61,62,58,55,35,57,59],"sk":"#c6916d","hr":"#2d271b","hs":"crop","bd":"candado","ac":[],"ph":"assets/players/football/x_futboli10500001.webp","c":"CD Héroicos de Peronia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli10800001","n":"Karim Mbida","nat":"Riada","a":29,"p":"MCD","s":["DFC"],"o":59,"pt":59,"h":172,"b":101,"f":"D","at":[51,56,59,62,54,55,48,60],"sk":"#7f4d34","hr":"#9f8353","hs":"engominado","bd":"completa","ac":[],"ph":"assets/players/football/x_futboli10800001.webp","c":"Independiente de Riada","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight500700001","n":"Nicolás Ardiles","nat":"Valurria","a":19,"p":"MCD","s":[],"o":44,"pt":55,"h":176,"b":99,"f":"D","at":[44,48,42,47,39,40,40,42],"sk":"#c08262","hr":"#1c1710","hs":"afro","bd":"corta","ac":[],"ph":"assets/players/football/x_ficticiofinalnight500700001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli05000001","n":"Santiago Albuquerque","nat":"Tamago","a":23,"p":"MCD","s":["MC"],"o":57,"pt":65,"h":184,"b":103,"f":"D","at":[51,61,55,58,52,50,55,58],"sk":"#a56d4f","hr":"#422e1c","hs":"afro","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futboli05000001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli15400001","n":"Lucas Fujita","nat":"Tamago","a":18,"p":"MCD","s":["MC"],"o":50,"pt":62,"h":173,"b":108,"f":"D","at":[47,48,43,52,38,47,48,57],"sk":"#b97f5f","hr":"#302718","hs":"afro","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_futboli15400001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli18300001","n":"Emiliano Sandoval","nat":"Costas Unidas","a":18,"p":"MCD","s":["DFC"],"o":49,"pt":63,"h":186,"b":103,"f":"D","at":[50,46,47,52,48,50,41,51],"sk":"#bb8768","hr":"#231a11","hs":"mullet","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_futboli18300001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight605400001","n":"Kofi Mthembu","nat":"Skote","a":25,"p":"LD","s":[],"o":47,"pt":48,"h":176,"b":94,"f":"A","at":[41,44,39,34,33,53,45,49],"sk":"#8f5c42","hr":"#604027","hs":"largo","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight605400001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight202000001","n":"Rodrigo Mora","nat":"Magayanes","a":22,"p":"LD","s":["LI"],"o":44,"pt":51,"h":182,"b":98,"f":"D","at":[33,41,31,32,28,50,44,45],"sk":"#c58a68","hr":"#361d0e","hs":"corto","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight202000001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight609000001","n":"Marcos Carabalí","nat":"Morvicia","a":23,"p":"LD","s":["LI"],"o":48,"pt":53,"h":189,"b":103,"f":"D","at":[32,45,44,45,32,52,51,49],"sk":"#bb8062","hr":"#12120f","hs":"raya","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight609000001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli18000001","n":"Hugo Martínez","nat":"Grammes","a":34,"p":"LD","s":["LI"],"o":52,"pt":52,"h":197,"b":94,"f":"D","at":[46,49,46,42,42,55,56,50],"sk":"#b07055","hr":"#221509","hs":"corto","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli18000001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli11800001","n":"Wilmer Cuadrado","nat":"Sotoa","a":19,"p":"LD","s":[],"o":44,"pt":55,"h":175,"b":98,"f":"D","at":[40,44,32,35,28,46,48,42],"sk":"#bb8364","hr":"#262018","hs":"trencitas","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli11800001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli16900001","n":"Dae Utepov","nat":"Kostanay","a":21,"p":"DFC","s":[],"o":69,"pt":79,"h":186,"b":105,"f":"D","at":[62,68,61,55,54,76,67,68],"sk":"#cb9373","hr":"#100f0b","hs":"rastas","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli16900001.webp","c":"Sporty VV Klub Kostanay","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli08100001","n":"Amadou Gabai","nat":"Netanya","a":21,"p":"DC","s":[],"o":70,"pt":78,"h":184,"b":101,"f":"I","at":[71,60,64,69,77,46,65,71],"sk":"#bb8764","hr":"#1a1610","hs":"degradado","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futboli08100001.webp","c":"Maccabi Tel Shava","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight202900001","n":"Fouad Mansouri","nat":"Sahar","a":18,"p":"MC","s":["MI"],"o":66,"pt":75,"h":181,"b":93,"f":"D","at":[70,65,62,70,56,69,56,68],"sk":"#be8562","hr":"#51120a","hs":"puas","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight202900001.webp","c":"Red Gull Club Tellin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg00000001","n":"Finn Olsen","nat":"Overmark","a":26,"p":"DC","s":[],"o":76,"pt":76,"h":178,"b":104,"f":"D","at":[73,79,79,66,74,57,72,74],"sk":"#d19876","hr":"#432c18","hs":"afro","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futbolg00000001.webp","c":"Sporting Lake Baikal","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli07700001","n":"Amadou Chaoui","nat":"Sahar","a":35,"p":"DC","s":[],"o":73,"pt":73,"h":182,"b":96,"f":"D","at":[70,75,73,68,74,51,68,75],"sk":"#b27b59","hr":"#211d15","hs":"corto","bd":"chuletas","ac":["aros"],"ph":"assets/players/football/x_futboli07700001.webp","c":"Sporty VV Klub Estovackia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh01100001","n":"Youssef Essaadi","nat":"Sahar","a":18,"p":"MC","s":[],"o":70,"pt":86,"h":172,"b":105,"f":"D","at":[67,67,70,70,64,63,67,72],"sk":"#b58362","hr":"#182424","hs":"raya","bd":"completa","ac":[],"ph":"assets/players/football/x_futbolh01100001.webp","c":"Groz Sport Kulübü","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight608200001","n":"Jonas McBride","nat":"Kaigam","a":30,"p":"MC","s":["MD"],"o":70,"pt":70,"h":184,"b":94,"f":"D","at":[58,61,70,73,60,74,72,65],"sk":"#cc9676","hr":"#3e301d","hs":"raya","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight608200001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight203000001","n":"Sindre Grønvold","nat":"Overmark","a":30,"p":"MCD","s":["MC"],"o":63,"pt":63,"h":169,"b":108,"f":"D","at":[57,65,64,65,56,60,54,65],"sk":"#c58a70","hr":"#4e3116","hs":"afro","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight203000001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight204300001","n":"Ragnar Eide","nat":"Overmark","a":26,"p":"LD","s":["LI"],"o":65,"pt":65,"h":192,"b":99,"f":"D","at":[54,59,60,49,49,70,67,57],"sk":"#ce9677","hr":"#3d2d19","hs":"corto","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight204300001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli15800001","n":"Bautista Viera","nat":"Peronia","a":22,"p":"DFC","s":[],"o":46,"pt":54,"h":175,"b":103,"f":"I","at":[31,43,41,36,34,50,49,46],"sk":"#b78264","hr":"#53412e","hs":"rapado","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futboli15800001.webp","c":"CD Héroicos de Peronia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinal00100006","n":"Rodrigue Onana","nat":"Riada","a":20,"p":"MCD","s":[],"o":44,"pt":61,"h":175,"b":99,"f":"I","at":[45,45,41,49,29,42,38,44],"sk":"#bf8561","hr":"#252318","hs":"engominado","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_ficticiofinal00100006.webp","c":"Independiente de Riada","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight203400001","n":"Marcelo Varela","nat":"Valurria","a":25,"p":"EI","s":[],"o":50,"pt":53,"h":185,"b":96,"f":"D","at":[44,45,49,40,55,25,43,51],"sk":"#cf9572","hr":"#17120a","hs":"rulos","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight203400001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli06500001","n":"Tomás Aubert","nat":"Iberia","a":32,"p":"MCD","s":["DFC"],"o":46,"pt":46,"h":184,"b":100,"f":"D","at":[45,42,48,46,45,44,40,48],"sk":"#b37b60","hr":"#1e160b","hs":"corto","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_futboli06500001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight205300001","n":"Kaito Shimizu","nat":"Tamago","a":26,"p":"MCD","s":[],"o":48,"pt":51,"h":175,"b":102,"f":"D","at":[44,48,44,52,42,47,42,48],"sk":"#cc9172","hr":"#342a1d","hs":"rastas","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight205300001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight602000001","n":"Camilo Brizuela","nat":"Costas Unidas","a":26,"p":"MCD","s":[],"o":44,"pt":46,"h":170,"b":107,"f":"D","at":[37,50,45,47,34,37,37,44],"sk":"#d79d79","hr":"#4f3c25","hs":"corto","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight602000001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh00500001","n":"Youssef Dlamini","nat":"Skote","a":27,"p":"MCD","s":["DFC"],"o":56,"pt":58,"h":178,"b":106,"f":"D","at":[57,58,57,59,50,48,51,52],"sk":"#8a5940","hr":"#1a150e","hs":"corto","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_futbolh00500001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight606000001","n":"Maximiliano Carballo","nat":"Magayanes","a":19,"p":"MCD","s":[],"o":44,"pt":54,"h":173,"b":100,"f":"I","at":[44,46,40,46,34,42,42,48],"sk":"#bf815e","hr":"#1d160f","hs":"afro","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight606000001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli16600001","n":"Tua Tagoa","nat":"Morvicia","a":35,"p":"MCD","s":["DFC"],"o":61,"pt":61,"h":184,"b":104,"f":"D","at":[56,62,59,60,54,58,63,64],"sk":"#c5815e","hr":"#50341c","hs":"crop","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futboli16600001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight301300001","n":"Caio Kobayashi","nat":"Tamago","a":30,"p":"MCD","s":[],"o":60,"pt":60,"h":179,"b":106,"f":"I","at":[58,58,56,65,59,60,57,59],"sk":"#b8886b","hr":"#261f15","hs":"afro","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight301300001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli05800001","n":"Caio Aliendro","nat":"Sotoa","a":26,"p":"MCD","s":[],"o":51,"pt":54,"h":179,"b":102,"f":"I","at":[46,58,50,50,43,56,44,56],"sk":"#b27d5c","hr":"#56402a","hs":"crop","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futboli05800001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight200000001","n":"Dor Dahan","nat":"Netanya","a":23,"p":"DFC","s":[],"o":74,"pt":81,"h":182,"b":93,"f":"D","at":[69,69,61,74,55,74,78,66],"sk":"#c28865","hr":"#291f14","hs":"largo","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight200000001.webp","c":"Maccabi Tel Shava","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight602400001","n":"Youssef Rahmani","nat":"Sahar","a":18,"p":"MD","s":[],"o":74,"pt":91,"h":178,"b":96,"f":"D","at":[76,72,70,76,64,72,69,78],"sk":"#b7835f","hr":"#15130e","hs":"media","bd":"anclada","ac":[],"ph":"assets/players/football/x_ficticiofinalnight602400001.webp","c":"Red Gull Club Tellin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli12500001","n":"Ibrahim Dayan","nat":"Netanya","a":34,"p":"DC","s":[],"o":68,"pt":68,"h":181,"b":102,"f":"A","at":[65,70,65,61,70,48,64,63],"sk":"#b07a58","hr":"#8f5f40","hs":"buzz","bd":"completa","ac":[],"ph":"assets/players/football/x_futboli12500001.webp","c":"Sporting Lake Baikal","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight303300001","n":"Omar Ben-David","nat":"Netanya","a":22,"p":"DC","s":[],"o":71,"pt":73,"h":177,"b":102,"f":"D","at":[65,70,66,71,78,45,65,68],"sk":"#bb8362","hr":"#312d25","hs":"undercut","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight303300001.webp","c":"Sporty VV Klub Estovackia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli08400001","n":"Lukas Fjeld","nat":"Overmark","a":27,"p":"MC","s":[],"o":68,"pt":71,"h":181,"b":102,"f":"D","at":[61,67,69,67,59,59,67,70],"sk":"#ce9a7b","hr":"#4e361c","hs":"crop","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli08400001.webp","c":"Groz Sport Kulübü","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli14600001","n":"Pablo Ødegård","nat":"Overmark","a":30,"p":"MC","s":[],"o":80,"pt":80,"h":187,"b":96,"f":"I","at":[84,74,79,81,77,76,74,84],"sk":"#c18b6d","hr":"#211d15","hs":"engominado","bd":"chuletas","ac":[],"ph":"assets/players/football/x_futboli14600001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight500100001","n":"Adrián Rasmussen","nat":"Overmark","a":21,"p":"MC","s":["MD"],"o":70,"pt":84,"h":182,"b":100,"f":"A","at":[59,66,62,74,64,65,72,71],"sk":"#c38b6d","hr":"#212519","hs":"largo","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight500100001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli18900001","n":"Enzo Bakken","nat":"Overmark","a":27,"p":"MCD","s":[],"o":66,"pt":67,"h":185,"b":103,"f":"D","at":[67,61,67,65,65,58,71,62],"sk":"#c88e68","hr":"#151109","hs":"raya","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_futboli18900001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinal00000006","n":"Nestor Ekambi","nat":"Riada","a":20,"p":"DC","s":[],"o":62,"pt":68,"h":176,"b":106,"f":"D","at":[59,66,56,61,68,40,60,56],"sk":"#b27554","hr":"#2f1b10","hs":"afro","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinal00000006.webp","c":"Independiente de Riada","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli03500001","n":"Maximiliano Pedraza","nat":"Valurria","a":32,"p":"ED","s":["EI"],"o":58,"pt":58,"h":181,"b":102,"f":"D","at":[55,59,54,55,63,28,57,58],"sk":"#b88967","hr":"#14140f","hs":"corto","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_futboli03500001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli00900001","n":"Jack Marín","nat":"Grammes","a":21,"p":"EI","s":[],"o":58,"pt":66,"h":184,"b":93,"f":"D","at":[58,58,58,55,58,36,57,55],"sk":"#c58c69","hr":"#2a241b","hs":"crop","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_futboli00900001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight205000001","n":"Caio Abe","nat":"Tamago","a":29,"p":"MC","s":["MD"],"o":62,"pt":62,"h":164,"b":110,"f":"D","at":[57,63,68,60,50,53,54,63],"sk":"#a26747","hr":"#1d1108","hs":"afro","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight205000001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg01200001","n":"Santiago Paredes","nat":"Costas Unidas","a":24,"p":"MC","s":["MP"],"o":55,"pt":61,"h":175,"b":105,"f":"D","at":[53,57,50,55,53,52,45,65],"sk":"#c58b6b","hr":"#12120e","hs":"raya","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futbolg01200001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg00700001","n":"Sami Coetzee","nat":"Skote","a":27,"p":"MCD","s":[],"o":45,"pt":46,"h":184,"b":100,"f":"D","at":[39,47,40,48,38,48,48,45],"sk":"#976144","hr":"#19110b","hs":"media","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futbolg00700001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight606600001","n":"Agustín Ledesma","nat":"Magayanes","a":30,"p":"MCD","s":[],"o":46,"pt":46,"h":180,"b":96,"f":"D","at":[49,49,52,47,41,37,41,43],"sk":"#c28a6a","hr":"#1d1812","hs":"afro","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight606600001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli10100001","n":"Liam Ocaña","nat":"Grammes","a":26,"p":"MCD","s":["MC"],"o":46,"pt":47,"h":176,"b":103,"f":"D","at":[39,40,51,49,38,42,41,41],"sk":"#c4916f","hr":"#6d4d29","hs":"afro","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli10100001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli13900001","n":"Brandon Robledo","nat":"Peronia","a":29,"p":"MCD","s":[],"o":48,"pt":48,"h":176,"b":105,"f":"A","at":[46,47,50,52,44,41,41,44],"sk":"#bb8665","hr":"#15110a","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli13900001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight500200001","n":"Lautaro Noriega","nat":"Sotoa","a":24,"p":"MCD","s":[],"o":50,"pt":56,"h":180,"b":104,"f":"D","at":[57,55,51,54,46,51,51,41],"sk":"#bd8466","hr":"#946055","hs":"buzz","bd":"sombra","ac":[],"ph":"assets/players/football/x_ficticiofinalnight500200001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight303000001","n":"Omar Shapiro","nat":"Netanya","a":23,"p":"DC","s":[],"o":72,"pt":79,"h":180,"b":100,"f":"D","at":[73,69,71,70,74,53,69,62],"sk":"#be8868","hr":"#4d1910","hs":"raya","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight303000001.webp","c":"Red Gull Club Tellin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalv2test00200001","n":"Liam Moreau","nat":"Iberia","a":28,"p":"DFC","s":[],"o":71,"pt":71,"h":193,"b":104,"f":"D","at":[63,65,59,64,58,72,78,67],"sk":"#cd9476","hr":"#402b18","hs":"rulos","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalv2test00200001.webp","c":"Sporting Lake Baikal","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli02100001","n":"Kwame Cohen","nat":"Netanya","a":17,"p":"DFC","s":[],"o":62,"pt":71,"h":183,"b":98,"f":"D","at":[57,61,55,52,49,63,68,64],"sk":"#be7f56","hr":"#381a0e","hs":"manbun","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli02100001.webp","c":"Sporty VV Klub Estovackia","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli12900001","n":"Youssef Drissi","nat":"Sahar","a":20,"p":"DC","s":[],"o":63,"pt":73,"h":187,"b":108,"f":"D","at":[56,62,65,64,67,43,63,58],"sk":"#b98666","hr":"#6a3a1c","hs":"afro","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futboli12900001.webp","c":"Groz Sport Kulübü","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli00200001","n":"Moussa Sasson","nat":"Netanya","a":28,"p":"MC","s":[],"o":66,"pt":68,"h":179,"b":96,"f":"D","at":[61,66,66,67,65,60,64,66],"sk":"#be855e","hr":"#8d5c2f","hs":"manbun","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli00200001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli03800001","n":"Oliver Berg","nat":"Overmark","a":29,"p":"MC","s":[],"o":68,"pt":68,"h":180,"b":101,"f":"D","at":[68,73,73,67,61,66,65,66],"sk":"#c39379","hr":"#4b3b29","hs":"rastas","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_futboli03800001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight605200001","n":"Jan Iversen","nat":"Overmark","a":27,"p":"MCD","s":[],"o":61,"pt":64,"h":170,"b":104,"f":"D","at":[62,56,63,58,52,56,58,66],"sk":"#ba8163","hr":"#432c17","hs":"jopo","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight605200001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinal00200005","n":"Blaise Kamdem","nat":"Riada","a":18,"p":"DC","s":[],"o":44,"pt":54,"h":188,"b":103,"f":"A","at":[43,41,41,37,47,25,48,42],"sk":"#c28562","hr":"#734e34","hs":"crop","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinal00200005.webp","c":"Independiente de Riada","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight602800001","n":"Bruno Villagra","nat":"Valurria","a":22,"p":"DC","s":[],"o":53,"pt":59,"h":177,"b":106,"f":"D","at":[52,53,53,55,54,41,51,50],"sk":"#bc805f","hr":"#2b1810","hs":"rastas","bd":"bigote","ac":[],"ph":"assets/players/football/x_ficticiofinalnight602800001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight202200001","n":"Ruan Mori","nat":"Tamago","a":21,"p":"ED","s":["MD"],"o":54,"pt":65,"h":182,"b":97,"f":"D","at":[52,49,46,52,61,25,58,51],"sk":"#b17252","hr":"#17110c","hs":"afro","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight202200001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight201700001","n":"Vitor Magalhães","nat":"Tamago","a":25,"p":"MC","s":["MD"],"o":48,"pt":51,"h":176,"b":93,"f":"D","at":[52,49,49,46,51,34,48,50],"sk":"#b37958","hr":"#1d140d","hs":"afro","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight201700001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli03300001","n":"Gabriel Quispe","nat":"Costas Unidas","a":17,"p":"MC","s":[],"o":50,"pt":58,"h":177,"b":97,"f":"D","at":[43,49,45,53,45,52,49,53],"sk":"#be8967","hr":"#201911","hs":"crop","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli03300001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight200100001","n":"Mikel Vallejo","nat":"Grammes","a":20,"p":"MC","s":["MD"],"o":48,"pt":63,"h":182,"b":99,"f":"I","at":[46,52,47,49,40,45,50,47],"sk":"#d09b7d","hr":"#937651","hs":"corto","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight200100001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli09200001","n":"Vinícius Ospina","nat":"Magayanes","a":25,"p":"MC","s":["MCD"],"o":54,"pt":57,"h":176,"b":100,"f":"D","at":[44,54,54,58,43,48,48,52],"sk":"#b48268","hr":"#141511","hs":"jopo","bd":"completa","ac":[],"ph":"assets/players/football/x_futboli09200001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight601200001","n":"Felipe Murillo","nat":"Magayanes","a":21,"p":"MC","s":["MP"],"o":65,"pt":79,"h":187,"b":104,"f":"D","at":[63,56,64,70,65,60,54,65],"sk":"#cc8f6e","hr":"#20180e","hs":"engominado","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight601200001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg00600001","n":"Facundo Domínguez","nat":"Valurria","a":22,"p":"MC","s":["MP"],"o":55,"pt":57,"h":176,"b":105,"f":"I","at":[50,55,53,55,52,52,61,54],"sk":"#bf8761","hr":"#514738","hs":"afro","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futbolg00600001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight600000001","n":"Facundo Palomino","nat":"Sotoa","a":27,"p":"MC","s":[],"o":54,"pt":54,"h":171,"b":102,"f":"D","at":[52,58,51,60,48,48,51,51],"sk":"#b47958","hr":"#7c1f19","hs":"afro","bd":"candado","ac":[],"ph":"assets/players/football/x_ficticiofinalnight600000001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli18600001","n":"Rodrigo Barrios","nat":"Valurria","a":23,"p":"DFC","s":[],"o":78,"pt":80,"h":185,"b":108,"f":"D","at":[75,72,63,80,64,77,81,82],"sk":"#b37f61","hr":"#15130c","hs":"engominado","bd":"desprolija","ac":[],"ph":"assets/players/football/x_futboli18600001.webp","c":"Red Gull Club Tellin","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalv3test00500001","n":"Agustín Xavier","nat":"Grammes","a":23,"p":"DC","s":[],"o":72,"pt":76,"h":186,"b":89,"f":"D","at":[70,76,77,73,69,53,74,74],"sk":"#c59573","hr":"#2c261c","hs":"media","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalv3test00500001.webp","c":"Groz Sport Kulübü","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight302000001","n":"Karim Sefrioui","nat":"Sahar","a":18,"p":"MD","s":["ED"],"o":58,"pt":71,"h":171,"b":98,"f":"A","at":[63,54,57,63,53,53,58,52],"sk":"#b57f5d","hr":"#231b13","hs":"trencitas","bd":"ninguna","ac":[],"ph":"assets/players/football/x_ficticiofinalnight302000001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight200500001","n":"Bjørn Christiansen","nat":"Overmark","a":28,"p":"MC","s":["MP"],"o":64,"pt":66,"h":178,"b":99,"f":"I","at":[61,60,71,63,64,60,58,63],"sk":"#bf815c","hr":"#21160d","hs":"rastas","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight200500001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight609500001","n":"Pablo Ellingsen","nat":"Overmark","a":20,"p":"MC","s":["MI"],"o":59,"pt":73,"h":178,"b":101,"f":"I","at":[60,57,50,68,49,55,56,57],"sk":"#bf8561","hr":"#221e16","hs":"trencitas","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight609500001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight200800001","n":"Étienne Vidal","nat":"Iberia","a":22,"p":"DFC","s":[],"o":52,"pt":56,"h":186,"b":106,"f":"D","at":[44,51,37,41,38,54,57,51],"sk":"#d29e7d","hr":"#483722","hs":"undercut","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight200800001.webp","c":"Independiente de Riada","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight608600001","n":"Yeison Solano","nat":"Valurria","a":20,"p":"DC","s":[],"o":53,"pt":62,"h":180,"b":104,"f":"D","at":[52,52,50,54,56,31,55,59],"sk":"#cc9578","hr":"#492a11","hs":"afro","bd":"desprolija","ac":[],"ph":"assets/players/football/x_ficticiofinalnight608600001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg01900001","n":"Vinícius Lopes","nat":"Tamago","a":19,"p":"DC","s":[],"o":55,"pt":64,"h":177,"b":98,"f":"I","at":[56,58,53,54,55,38,51,52],"sk":"#b07450","hr":"#1a1711","hs":"afro","bd":"ninguna","ac":[],"ph":"assets/players/football/x_futbolg01900001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight203600001","n":"Kenji Assis","nat":"Tamago","a":30,"p":"EI","s":["MI"],"o":53,"pt":53,"h":181,"b":95,"f":"I","at":[49,49,52,50,57,28,55,52],"sk":"#b27957","hr":"#9c8e7a","hs":"afro","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight203600001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight604000001","n":"Gustavo Cabezas","nat":"Grammes","a":27,"p":"MC","s":["MCD"],"o":44,"pt":46,"h":178,"b":101,"f":"D","at":[37,49,43,48,36,40,38,42],"sk":"#cc8f6b","hr":"#360d10","hs":"corto","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight604000001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight204400001","n":"Sergio Gouveia","nat":"Grammes","a":25,"p":"MC","s":["MD"],"o":52,"pt":53,"h":179,"b":97,"f":"A","at":[44,55,49,54,44,45,46,56],"sk":"#c58a67","hr":"#1c160d","hs":"mullet","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight204400001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight606400001","n":"Maximiliano Condori","nat":"Magayanes","a":22,"p":"MC","s":["MP"],"o":52,"pt":59,"h":170,"b":111,"f":"D","at":[53,53,51,56,44,52,46,50],"sk":"#b87c5c","hr":"#13120f","hs":"afro","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight606400001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight200600001","n":"Aitor Cordón","nat":"Grammes","a":27,"p":"MC","s":["MP"],"o":51,"pt":51,"h":172,"b":100,"f":"D","at":[57,53,50,59,39,49,46,44],"sk":"#d09777","hr":"#6d593f","hs":"crop","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight200600001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh00800001","n":"Jonas Etxeberria","nat":"Grammes","a":30,"p":"MC","s":[],"o":55,"pt":55,"h":181,"b":103,"f":"I","at":[52,59,53,59,45,50,54,50],"sk":"#bf855c","hr":"#402d18","hs":"flequillo","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futbolh00800001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight606900001","n":"Andrés Mendieta","nat":"Sotoa","a":25,"p":"MC","s":["MCD"],"o":54,"pt":57,"h":168,"b":100,"f":"I","at":[50,52,50,57,45,53,56,53],"sk":"#a86f51","hr":"#b39660","hs":"afro","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight606900001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli13700001","n":"Luca Maillard","nat":"Iberia","a":20,"p":"DC","s":[],"o":61,"pt":67,"h":182,"b":94,"f":"D","at":[57,62,57,62,65,38,60,64],"sk":"#cb9275","hr":"#352311","hs":"corto","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futboli13700001.webp","c":"Groz Sport Kulübü","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight606700001","n":"Youssef Zohar","nat":"Netanya","a":26,"p":"MP","s":["MC"],"o":78,"pt":78,"h":178,"b":105,"f":"I","at":[82,79,73,78,69,73,82,79],"sk":"#b9805d","hr":"#20170e","hs":"largo","bd":"bigote","ac":[],"ph":"assets/players/football/x_ficticiofinalnight606700001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh01500001","n":"Malik Amrani","nat":"Sahar","a":27,"p":"MI","s":[],"o":72,"pt":75,"h":175,"b":100,"f":"D","at":[73,73,70,75,61,65,68,73],"sk":"#996853","hr":"#1a140c","hs":"corto","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futbolh01500001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli09600001","n":"Youssef Hadad","nat":"Netanya","a":30,"p":"MC","s":[],"o":69,"pt":69,"h":176,"b":102,"f":"D","at":[62,75,65,73,60,71,65,70],"sk":"#c08058","hr":"#0d0e0d","hs":"corto","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futboli09600001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight603700001","n":"Santiago Obando","nat":"Valurria","a":30,"p":"DC","s":[],"o":51,"pt":51,"h":182,"b":100,"f":"D","at":[46,57,51,48,52,27,50,53],"sk":"#b57958","hr":"#342414","hs":"rastas","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight603700001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli13600001","n":"Bautista Aoki","nat":"Tamago","a":34,"p":"DC","s":[],"o":54,"pt":54,"h":183,"b":94,"f":"D","at":[61,51,51,51,53,32,60,56],"sk":"#9a634a","hr":"#3c070c","hs":"afro","bd":"anclada","ac":[],"ph":"assets/players/football/x_futboli13600001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli18200001","n":"Ignacio Yoshida","nat":"Tamago","a":32,"p":"ED","s":["EI"],"o":52,"pt":52,"h":179,"b":106,"f":"D","at":[54,55,49,53,52,29,56,52],"sk":"#af795a","hr":"#461e0d","hs":"afro","bd":"ninguna","ac":[],"ph":"assets/players/football/x_futboli18200001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli01500001","n":"Facundo Cabral","nat":"Tamago","a":20,"p":"EI","s":["ED"],"o":50,"pt":65,"h":183,"b":100,"f":"D","at":[51,56,51,43,46,25,48,46],"sk":"#c08362","hr":"#60341d","hs":"afro","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli01500001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli08900001","n":"Marcus Seoane","nat":"Grammes","a":34,"p":"MC","s":[],"o":44,"pt":44,"h":169,"b":98,"f":"D","at":[39,44,44,49,45,41,34,43],"sk":"#a66e50","hr":"#0d0d09","hs":"corto","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_futboli08900001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli01400001","n":"Jack Jacquet","nat":"Iberia","a":24,"p":"MC","s":["MI"],"o":48,"pt":54,"h":178,"b":90,"f":"D","at":[47,56,48,48,46,51,43,49],"sk":"#c49572","hr":"#231c13","hs":"corto","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_futboli01400001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight202500001","n":"Aníbal Salvatierra","nat":"Peronia","a":22,"p":"MC","s":["MD"],"o":48,"pt":55,"h":178,"b":98,"f":"D","at":[44,51,48,51,46,37,46,46],"sk":"#cb9572","hr":"#312414","hs":"undercut","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight202500001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli15300001","n":"Brandon Sampaio","nat":"Grammes","a":28,"p":"MC","s":["MP"],"o":47,"pt":49,"h":174,"b":101,"f":"I","at":[50,46,39,54,46,41,43,47],"sk":"#b77f5a","hr":"#1f160c","hs":"rulos","bd":"ninguna","ac":[],"ph":"assets/players/football/x_futboli15300001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli02500001","n":"Jonas Fournier","nat":"Iberia","a":29,"p":"MC","s":["MCD"],"o":44,"pt":44,"h":176,"b":95,"f":"I","at":[46,43,35,50,48,44,42,46],"sk":"#cf9371","hr":"#663514","hs":"crop","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futboli02500001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh00200001","n":"Hassan Chraibi","nat":"Sahar","a":21,"p":"DFC","s":[],"o":64,"pt":70,"h":185,"b":97,"f":"D","at":[64,59,45,60,51,66,60,66],"sk":"#bc865f","hr":"#292018","hs":"raya","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futbolh00200001.webp","c":"Groz Sport Kulübü","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli04900001","n":"Moussa Rosen","nat":"Netanya","a":23,"p":"DC","s":[],"o":68,"pt":70,"h":179,"b":102,"f":"D","at":[68,74,65,65,69,46,71,64],"sk":"#bb7d53","hr":"#8e5e3b","hs":"cresta","bd":"ninguna","ac":[],"ph":"assets/players/football/x_futboli04900001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli11200001","n":"Karim Friedman","nat":"Netanya","a":29,"p":"MD","s":["MC"],"o":70,"pt":70,"h":174,"b":100,"f":"D","at":[69,70,68,76,60,68,61,69],"sk":"#b87d53","hr":"#382717","hs":"crop","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_futboli11200001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight603600001","n":"Youssef Mensah","nat":"Netanya","a":20,"p":"MC","s":["MD"],"o":54,"pt":67,"h":176,"b":105,"f":"I","at":[50,53,47,58,53,56,48,60],"sk":"#ba8967","hr":"#2c2317","hs":"corto","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight603600001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight608300001","n":"Gabriel Zampedri","nat":"Valurria","a":26,"p":"DFC","s":[],"o":50,"pt":50,"h":180,"b":105,"f":"D","at":[31,46,30,41,38,58,49,54],"sk":"#cd9473","hr":"#261a10","hs":"raya","bd":"corta","ac":[],"ph":"assets/players/football/x_ficticiofinalnight608300001.webp","c":"FC Santa Rosa","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli01100001","n":"Sergio Marcos","nat":"Grammes","a":34,"p":"DC","s":[],"o":45,"pt":45,"h":182,"b":102,"f":"D","at":[43,43,45,39,47,27,52,45],"sk":"#b98267","hr":"#2c190e","hs":"degradado","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli01100001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight601700001","n":"Camilo Nunes","nat":"Tamago","a":22,"p":"DC","s":[],"o":68,"pt":77,"h":177,"b":101,"f":"D","at":[66,70,65,63,72,48,61,66],"sk":"#b67b5a","hr":"#250d09","hs":"afro","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight601700001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli05200001","n":"Ezequiel Molina","nat":"Tamago","a":32,"p":"ED","s":[],"o":56,"pt":56,"h":180,"b":103,"f":"D","at":[58,54,51,55,58,37,52,55],"sk":"#b27a58","hr":"#1f170e","hs":"afro","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli05200001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight203800001","n":"Baptiste Paris","nat":"Iberia","a":30,"p":"MD","s":[],"o":54,"pt":54,"h":185,"b":94,"f":"I","at":[48,59,56,49,44,58,50,63],"sk":"#a76f50","hr":"#13100c","hs":"corto","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight203800001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli16800001","n":"Lautaro Sato","nat":"Tamago","a":24,"p":"MD","s":["MI"],"o":53,"pt":56,"h":180,"b":90,"f":"I","at":[56,59,46,61,42,49,48,51],"sk":"#bf8560","hr":"#1c150c","hs":"undercut","bd":"chuletas","ac":[],"ph":"assets/players/football/x_futboli16800001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh01200001","n":"Ignacio Medeiros","nat":"Tamago","a":19,"p":"MI","s":["EI"],"o":47,"pt":65,"h":175,"b":95,"f":"D","at":[47,61,44,49,37,45,42,50],"sk":"#b37656","hr":"#67411f","hs":"afro","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futbolh01200001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli14000001","n":"Camilo Kimura","nat":"Tamago","a":27,"p":"MI","s":["EI"],"o":52,"pt":52,"h":176,"b":95,"f":"D","at":[53,48,48,57,44,43,53,49],"sk":"#b37e60","hr":"#221910","hs":"afro","bd":"corta","ac":[],"ph":"assets/players/football/x_futboli14000001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg01700001","n":"Lautaro Camargo","nat":"Tamago","a":22,"p":"MI","s":["MC"],"o":46,"pt":48,"h":181,"b":92,"f":"A","at":[44,53,44,48,39,39,45,44],"sk":"#b8805c","hr":"#1b150f","hs":"rulos","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_futbolg01700001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli15200001","n":"Caio Hayashi","nat":"Tamago","a":30,"p":"DC","s":[],"o":76,"pt":76,"h":178,"b":103,"f":"D","at":[77,82,73,78,75,45,77,77],"sk":"#ac7a5b","hr":"#251f18","hs":"afro","bd":"chuletas","ac":["aros"],"ph":"assets/players/football/x_futboli15200001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight600400001","n":"Bautista Nogueira","nat":"Grammes","a":30,"p":"MP","s":[],"o":67,"pt":67,"h":172,"b":97,"f":"I","at":[66,69,65,70,64,65,67,66],"sk":"#bf815f","hr":"#9c6a43","hs":"rulos","bd":"completa","ac":[],"ph":"assets/players/football/x_ficticiofinalnight600400001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli08800001","n":"Declan Aranda","nat":"Grammes","a":21,"p":"MD","s":["MC"],"o":67,"pt":81,"h":179,"b":94,"f":"D","at":[70,70,61,62,61,59,67,79],"sk":"#c38665","hr":"#1f160b","hs":"puas","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli08800001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli07000001","n":"Finn Roux","nat":"Iberia","a":30,"p":"DFC","s":[],"o":60,"pt":60,"h":183,"b":111,"f":"D","at":[61,55,45,49,50,64,56,62],"sk":"#c69178","hr":"#462913","hs":"corto","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_futboli07000001.webp","c":"Melonia City FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli12100001","n":"Bruno Teixeira","nat":"Tamago","a":32,"p":"DC","s":[],"o":55,"pt":55,"h":176,"b":103,"f":"D","at":[55,57,52,45,57,39,62,49],"sk":"#ae7b5c","hr":"#2c261e","hs":"corto","bd":"anclada","ac":[],"ph":"assets/players/football/x_futboli12100001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli13800001","n":"Andrés Inoue","nat":"Tamago","a":17,"p":"DC","s":[],"o":50,"pt":66,"h":181,"b":101,"f":"D","at":[46,56,48,45,51,25,53,48],"sk":"#c58f6b","hr":"#322718","hs":"corto","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli13800001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalvartest00000001","n":"Tomás Carvalho","nat":"Grammes","a":27,"p":"EI","s":[],"o":56,"pt":56,"h":187,"b":94,"f":"D","at":[57,58,52,54,58,33,63,59],"sk":"#b87c60","hr":"#533d25","hs":"raya","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalvartest00000001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli12300001","n":"Oliver Baudry","nat":"Iberia","a":26,"p":"EI","s":[],"o":51,"pt":51,"h":169,"b":93,"f":"D","at":[58,52,44,48,50,32,45,46],"sk":"#b07651","hr":"#2f1a0f","hs":"rastas","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_futboli12300001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight607200001","n":"Hugo Reig","nat":"Grammes","a":18,"p":"MD","s":[],"o":44,"pt":50,"h":178,"b":101,"f":"I","at":[49,50,49,43,38,40,39,45],"sk":"#c88b6e","hr":"#351908","hs":"corto","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight607200001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli05900001","n":"Tomás Ibáñez","nat":"Grammes","a":18,"p":"MD","s":["ED"],"o":44,"pt":50,"h":173,"b":102,"f":"D","at":[39,48,42,45,32,31,39,46],"sk":"#c08962","hr":"#10100b","hs":"twists","bd":"candado","ac":[],"ph":"assets/players/football/x_futboli05900001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli14900001","n":"Jonas Chevalier","nat":"Iberia","a":28,"p":"MD","s":["ED"],"o":52,"pt":52,"h":179,"b":96,"f":"D","at":[54,52,48,54,43,49,49,53],"sk":"#b57b59","hr":"#1e1e16","hs":"engominado","bd":"completa","ac":[],"ph":"assets/players/football/x_futboli14900001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight202300001","n":"Ruan Azevedo","nat":"Tamago","a":18,"p":"DC","s":[],"o":56,"pt":63,"h":179,"b":104,"f":"A","at":[49,56,51,49,64,38,42,58],"sk":"#b88264","hr":"#a06157","hs":"raya","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight202300001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli15900001","n":"Facundo Furtado","nat":"Tamago","a":19,"p":"EI","s":["MI"],"o":63,"pt":70,"h":181,"b":94,"f":"D","at":[64,62,62,60,63,42,60,66],"sk":"#bd8361","hr":"#a89e89","hs":"rapado","bd":"candado","ac":[],"ph":"assets/players/football/x_futboli15900001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalv3test00400001","n":"Lukas Barbier","nat":"Iberia","a":18,"p":"MP","s":["DC"],"o":62,"pt":71,"h":172,"b":100,"f":"D","at":[65,66,62,69,49,54,54,56],"sk":"#cb9476","hr":"#735636","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/x_ficticiofinalv3test00400001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli11100001","n":"Bautista Peralta","nat":"Tamago","a":22,"p":"DC","s":[],"o":58,"pt":66,"h":181,"b":100,"f":"D","at":[61,52,60,67,58,44,57,49],"sk":"#b78262","hr":"#241f16","hs":"corto","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli11100001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli04800001","n":"Brayan Barros","nat":"Tamago","a":27,"p":"DC","s":[],"o":53,"pt":53,"h":181,"b":102,"f":"D","at":[51,49,54,51,55,27,45,53],"sk":"#b5805f","hr":"#908a74","hs":"corto","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_futboli04800001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli17300001","n":"Brandon Brooks","nat":"Grammes","a":26,"p":"ED","s":["EI"],"o":55,"pt":58,"h":176,"b":100,"f":"D","at":[53,53,48,53,62,29,54,56],"sk":"#c08967","hr":"#443019","hs":"cresta","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli17300001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight605800001","n":"Agustín Leite","nat":"Tamago","a":18,"p":"ED","s":["MD"],"o":45,"pt":53,"h":173,"b":107,"f":"D","at":[43,49,39,44,50,26,38,46],"sk":"#ac7254","hr":"#5b442c","hs":"afro","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight605800001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg00800001","n":"Andrés Mina","nat":"Peronia","a":22,"p":"MP","s":["MC"],"o":48,"pt":52,"h":170,"b":99,"f":"D","at":[46,44,46,54,42,48,46,41],"sk":"#ba8566","hr":"#291f15","hs":"manbun","bd":"bigote","ac":[],"ph":"assets/players/football/x_futbolg00800001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli13000001","n":"Pieter Mateos","nat":"Grammes","a":27,"p":"MP","s":[],"o":54,"pt":56,"h":178,"b":104,"f":"D","at":[45,53,54,58,44,58,49,52],"sk":"#bd8765","hr":"#351e0b","hs":"cresta","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futboli13000001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli04400001","n":"Facundo Lacerda","nat":"Tamago","a":35,"p":"MP","s":[],"o":47,"pt":47,"h":175,"b":100,"f":"D","at":[50,45,47,50,36,46,43,46],"sk":"#b78365","hr":"#310e12","hs":"corto","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futboli04400001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli02400001","n":"Kyle Cornejo","nat":"Valurria","a":25,"p":"DFC","s":[],"o":66,"pt":67,"h":178,"b":102,"f":"I","at":[56,59,56,57,52,69,70,62],"sk":"#c38c68","hr":"#17140c","hs":"corto","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_futboli02400001.webp","c":"Klaipeda United","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg01400001","n":"Jalen Portocarrero","nat":"Peronia","a":20,"p":"ED","s":["EI"],"o":66,"pt":80,"h":180,"b":100,"f":"D","at":[69,65,64,70,67,47,69,66],"sk":"#c1815e","hr":"#271d13","hs":"rastas","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_futbolg01400001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalvartest00700001","n":"Enzo Rousseau","nat":"Iberia","a":18,"p":"DC","s":[],"o":64,"pt":75,"h":172,"b":104,"f":"D","at":[68,57,53,63,70,48,56,55],"sk":"#ce9375","hr":"#573216","hs":"largo","bd":"sombra","ac":[],"ph":"assets/players/football/x_ficticiofinalvartest00700001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight603200001","n":"Wilmer Tanaka","nat":"Tamago","a":28,"p":"DFC","s":[],"o":54,"pt":57,"h":173,"b":104,"f":"I","at":[45,52,44,47,39,58,54,58],"sk":"#a37054","hr":"#12110f","hs":"afro","bd":"mosca","ac":[],"ph":"assets/players/football/x_ficticiofinalnight603200001.webp","c":"Fútbol Club de Tamago","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight601400001","n":"Joaquín Borges","nat":"Tamago","a":18,"p":"DC","s":[],"o":44,"pt":62,"h":171,"b":104,"f":"D","at":[41,44,40,33,49,25,48,44],"sk":"#be8a67","hr":"#342a20","hs":"trencitas","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight601400001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli00700001","n":"Emiliano Vieira","nat":"Tamago","a":29,"p":"DC","s":[],"o":54,"pt":54,"h":180,"b":106,"f":"I","at":[50,56,53,46,56,27,47,57],"sk":"#ba7f5f","hr":"#302215","hs":"crop","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli00700001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli03200001","n":"Maximiliano Pires","nat":"Tamago","a":34,"p":"DC","s":[],"o":48,"pt":48,"h":178,"b":104,"f":"D","at":[55,40,45,50,48,33,46,48],"sk":"#bb8360","hr":"#443424","hs":"afro","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli03200001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight302400001","n":"Hugo Bertin","nat":"Iberia","a":21,"p":"EI","s":[],"o":52,"pt":68,"h":179,"b":111,"f":"D","at":[45,47,52,48,59,34,50,50],"sk":"#c58461","hr":"#1e150c","hs":"rastas","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight302400001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalv3test00700001","n":"Yeison Cavalcanti","nat":"Tamago","a":25,"p":"EI","s":["MI"],"o":47,"pt":50,"h":170,"b":96,"f":"D","at":[42,52,46,48,50,29,41,50],"sk":"#b57b5a","hr":"#211b13","hs":"rastas","bd":"sombra","ac":[],"ph":"assets/players/football/x_ficticiofinalv3test00700001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli11400001","n":"Jan Girard","nat":"Iberia","a":24,"p":"EI","s":["ED"],"o":52,"pt":59,"h":187,"b":106,"f":"D","at":[45,50,52,47,58,29,54,48],"sk":"#b57d66","hr":"#5a351b","hs":"jopo","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli11400001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight601900001","n":"Luca Pinto","nat":"Grammes","a":26,"p":"DC","s":[],"o":74,"pt":77,"h":171,"b":102,"f":"D","at":[77,64,75,66,74,54,85,75],"sk":"#be886a","hr":"#16140f","hs":"puas","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight601900001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli06600001","n":"Felipe Tavares","nat":"Tamago","a":28,"p":"DC","s":[],"o":74,"pt":74,"h":182,"b":104,"f":"D","at":[69,74,73,69,78,55,70,71],"sk":"#b58667","hr":"#181712","hs":"rulos","bd":"chuletas","ac":["aros"],"ph":"assets/players/football/x_futboli06600001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli08300001","n":"Gabriel Prado","nat":"Tamago","a":21,"p":"DFC","s":[],"o":44,"pt":57,"h":190,"b":104,"f":"D","at":[28,40,43,35,31,47,51,40],"sk":"#b38064","hr":"#442215","hs":"colita","bd":"manubrio","ac":[],"ph":"assets/players/football/x_futboli08300001.webp","c":"Universidad Costas Unidas","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli08600001","n":"Tyler Pons","nat":"Grammes","a":22,"p":"DC","s":[],"o":51,"pt":55,"h":175,"b":109,"f":"D","at":[51,53,47,43,53,32,48,45],"sk":"#cc8e68","hr":"#71431c","hs":"colita","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futboli08600001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh00000001","n":"Andrés Okada","nat":"Tamago","a":19,"p":"DC","s":[],"o":44,"pt":55,"h":178,"b":106,"f":"D","at":[39,44,45,43,47,27,46,40],"sk":"#b37f5d","hr":"#1c1c15","hs":"rapado","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_futbolh00000001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight600600001","n":"Lucas Goto","nat":"Tamago","a":19,"p":"ED","s":["MD"],"o":47,"pt":53,"h":176,"b":99,"f":"D","at":[50,48,48,46,43,25,36,46],"sk":"#bc815d","hr":"#2f2315","hs":"trencitas","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight600600001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh01400001","n":"Camilo Gomes","nat":"Tamago","a":30,"p":"ED","s":["MD"],"o":51,"pt":51,"h":193,"b":105,"f":"D","at":[55,47,42,45,55,30,42,50],"sk":"#b88a6f","hr":"#19150f","hs":"engominado","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futbolh01400001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight606100001","n":"Yeison Fretes","nat":"Valurria","a":26,"p":"ED","s":[],"o":49,"pt":51,"h":180,"b":107,"f":"D","at":[56,46,48,50,45,29,45,47],"sk":"#bf8766","hr":"#22170c","hs":"rulos","bd":"ninguna","ac":[],"ph":"assets/players/football/x_ficticiofinalnight606100001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli03600001","n":"Bautista Quiroz","nat":"Peronia","a":31,"p":"DC","s":[],"o":61,"pt":61,"h":173,"b":97,"f":"D","at":[53,59,61,56,67,39,55,59],"sk":"#b58364","hr":"#1d170f","hs":"rulos","bd":"manubrio","ac":["aros"],"ph":"assets/players/football/x_futboli03600001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight609100001","n":"Matteo Goikoetxea","nat":"Grammes","a":22,"p":"DC","s":[],"o":63,"pt":70,"h":173,"b":106,"f":"I","at":[62,68,62,60,63,44,56,53],"sk":"#cd9676","hr":"#312213","hs":"corto","bd":"sombra","ac":[],"ph":"assets/players/football/x_ficticiofinalnight609100001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli05500001","n":"Declan Weber","nat":"Iberia","a":23,"p":"DC","s":[],"o":48,"pt":53,"h":182,"b":103,"f":"D","at":[42,52,51,46,48,26,45,50],"sk":"#b87b59","hr":"#13100a","hs":"mullet","bd":"corta","ac":[],"ph":"assets/players/football/x_futboli05500001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh00700001","n":"Camilo Saito","nat":"Tamago","a":19,"p":"DC","s":[],"o":44,"pt":51,"h":178,"b":107,"f":"A","at":[47,46,40,38,45,25,43,38],"sk":"#c88a66","hr":"#35231a","hs":"trencitas","bd":"anclada","ac":[],"ph":"assets/players/football/x_futbolh00700001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli10300001","n":"Lukas Marchand","nat":"Iberia","a":32,"p":"DC","s":[],"o":50,"pt":50,"h":180,"b":101,"f":"A","at":[49,54,44,47,54,33,46,52],"sk":"#cb9676","hr":"#382410","hs":"manbun","bd":"ninguna","ac":[],"ph":"assets/players/football/x_futboli10300001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli09300001","n":"Brandon Egea","nat":"Grammes","a":24,"p":"DC","s":[],"o":49,"pt":54,"h":175,"b":106,"f":"A","at":[44,42,55,45,50,32,55,49],"sk":"#c0805c","hr":"#776657","hs":"crop","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli09300001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli12700001","n":"Enzo Tomé","nat":"Grammes","a":29,"p":"DC","s":[],"o":49,"pt":49,"h":178,"b":106,"f":"D","at":[47,46,55,41,47,26,45,52],"sk":"#a06b4a","hr":"#151611","hs":"rastas","bd":"ninguna","ac":[],"ph":"assets/players/football/x_futboli12700001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalvartest00600001","n":"Rodrigo Orsini","nat":"Valurria","a":24,"p":"DFC","s":[],"o":61,"pt":66,"h":183,"b":101,"f":"D","at":[57,63,49,57,50,65,58,60],"sk":"#c18b71","hr":"#593115","hs":"jopo","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalvartest00600001.webp","c":"Inter Focuri","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight605500001","n":"Yeison Astudillo","nat":"Peronia","a":27,"p":"DFC","s":[],"o":62,"pt":65,"h":183,"b":106,"f":"I","at":[55,57,42,60,49,63,65,60],"sk":"#c38b6d","hr":"#aea589","hs":"flequillo","bd":"candado","ac":[],"ph":"assets/players/football/x_ficticiofinalnight605500001.webp","c":"ØRK FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight607000001","n":"Julián Fonseca","nat":"Tamago","a":29,"p":"DFC","s":[],"o":46,"pt":46,"h":186,"b":101,"f":"D","at":[45,37,35,39,34,48,44,48],"sk":"#b2795b","hr":"#1a170d","hs":"corto","bd":"candado","ac":[],"ph":"assets/players/football/x_ficticiofinalnight607000001.webp","c":"Sköte FC","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight600300001","n":"Bruno Rubio","nat":"Grammes","a":22,"p":"DFC","s":[],"o":46,"pt":52,"h":185,"b":105,"f":"I","at":[38,37,37,33,37,49,52,54],"sk":"#c18b69","hr":"#261c10","hs":"engominado","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight600300001.webp","c":"Sporting Magayanes","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight301800001","n":"Rodrigo Ferrer","nat":"Grammes","a":26,"p":"DC","s":[],"o":45,"pt":48,"h":180,"b":107,"f":"D","at":[42,39,44,44,49,25,47,45],"sk":"#bb8160","hr":"#271f15","hs":"trencitas","bd":"corta","ac":[],"ph":"assets/players/football/x_ficticiofinalnight301800001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli06000001","n":"Thiago Araújo","nat":"Tamago","a":24,"p":"DC","s":[],"o":51,"pt":59,"h":177,"b":108,"f":"D","at":[59,48,46,51,50,33,47,45],"sk":"#bf815a","hr":"#382d1c","hs":"buzz","bd":"candado","ac":[],"ph":"assets/players/football/x_futboli06000001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight301000001","n":"Hugo Monteiro","nat":"Grammes","a":18,"p":"DC","s":[],"o":44,"pt":51,"h":174,"b":106,"f":"I","at":[43,39,43,41,47,25,41,44],"sk":"#b37758","hr":"#0b0a07","hs":"engominado","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight301000001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight500900001","n":"Thiago Freitas","nat":"Tamago","a":26,"p":"DC","s":[],"o":44,"pt":44,"h":179,"b":102,"f":"D","at":[46,47,33,41,48,25,37,40],"sk":"#b88866","hr":"#614e36","hs":"buzz","bd":"ninguna","ac":[],"ph":"assets/players/football/x_ficticiofinalnight500900001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli02800001","n":"Darius Casas","nat":"Grammes","a":23,"p":"DC","s":[],"o":51,"pt":54,"h":175,"b":106,"f":"D","at":[43,54,51,46,55,33,46,56],"sk":"#af7a5d","hr":"#88735b","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/x_futboli02800001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight606200001","n":"Emiliano Hasegawa","nat":"Tamago","a":27,"p":"DC","s":[],"o":48,"pt":49,"h":179,"b":103,"f":"D","at":[45,52,52,52,47,25,49,46],"sk":"#be8368","hr":"#613718","hs":"corto","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight606200001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli00800001","n":"Kyle Esteves","nat":"Grammes","a":27,"p":"DFC","s":[],"o":47,"pt":48,"h":178,"b":109,"f":"D","at":[32,43,37,39,30,52,50,48],"sk":"#b67e57","hr":"#1c1a13","hs":"corto","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_futboli00800001.webp","c":"Atlético Morvico","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli02300001","n":"Malik Ponce","nat":"Peronia","a":17,"p":"DFC","s":[],"o":44,"pt":60,"h":172,"b":101,"f":"D","at":[37,40,30,38,28,46,45,46],"sk":"#bd8761","hr":"#7b7162","hs":"raya","bd":"manubrio","ac":["aros"],"ph":"assets/players/football/x_futboli02300001.webp","c":"Real Zenet","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight609800001","n":"Luca Besson","nat":"Iberia","a":22,"p":"DFC","s":[],"o":44,"pt":50,"h":183,"b":95,"f":"D","at":[30,40,30,41,26,49,43,42],"sk":"#c79070","hr":"#2f2215","hs":"flequillo","bd":"mosca","ac":[],"ph":"assets/players/football/x_ficticiofinalnight609800001.webp","c":"Sporting Santa María de Trinidad","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli17900001","n":"Brayan Almeida","nat":"Tamago","a":30,"p":"DFC","s":[],"o":49,"pt":49,"h":184,"b":102,"f":"D","at":[47,45,43,47,36,50,49,45],"sk":"#b08062","hr":"#1a130c","hs":"corto","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli17900001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli09400001","n":"Lukas Cerqueira","nat":"Grammes","a":21,"p":"DFC","s":[],"o":55,"pt":69,"h":180,"b":101,"f":"I","at":[47,49,49,50,37,58,57,59],"sk":"#c8916c","hr":"#352513","hs":"corto","bd":"desprolija","ac":[],"ph":"assets/players/football/x_futboli09400001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli14300001","n":"Brayan Lerma","nat":"Sotoa","a":33,"p":"POR","s":[],"o":53,"pt":53,"h":194,"b":93,"f":"D","at":[34,45,31,53,25,54,52,57],"sk":"#b98672","hr":"#523724","hs":"jopo","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_futboli14300001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight204200001","n":"Baptiste Huet","nat":"Iberia","a":28,"p":"POR","s":[],"o":52,"pt":53,"h":192,"b":97,"f":"D","at":[35,38,26,49,25,55,55,51],"sk":"#b57e5d","hr":"#161512","hs":"rastas","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight204200001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight301100001","n":"Lucas Yamada","nat":"Tamago","a":21,"p":"DFC","s":[],"o":47,"pt":60,"h":187,"b":100,"f":"D","at":[43,42,42,39,34,47,54,48],"sk":"#b57958","hr":"#1a140e","hs":"afro","bd":"mosca","ac":[],"ph":"assets/players/football/x_ficticiofinalnight301100001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight202400001","n":"Jonas Moen","nat":"Overmark","a":29,"p":"POR","s":[],"o":57,"pt":57,"h":198,"b":93,"f":"D","at":[38,39,44,50,25,63,61,54],"sk":"#be8061","hr":"#120d07","hs":"media","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight202400001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli14800001","n":"Devin Marchesín","nat":"Peronia","a":19,"p":"POR","s":[],"o":44,"pt":54,"h":185,"b":108,"f":"I","at":[27,31,25,43,25,42,54,43],"sk":"#bd8b6c","hr":"#2d1c10","hs":"degradado","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_futboli14800001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight604500001","n":"Finn Brekke","nat":"Overmark","a":25,"p":"POR","s":[],"o":52,"pt":52,"h":194,"b":102,"f":"I","at":[50,38,29,40,25,54,54,53],"sk":"#cc9876","hr":"#17120a","hs":"corto","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight604500001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg01000001","n":"Jack Gusev","nat":"Baikal","a":20,"p":"POR","s":[],"o":44,"pt":61,"h":194,"b":102,"f":"D","at":[37,32,25,39,25,47,44,44],"sk":"#c49178","hr":"#453019","hs":"corto","bd":"completa","ac":[],"ph":"assets/players/football/x_futbolg01000001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight604800001","n":"Santiago Cordero","nat":"Valurria","a":22,"p":"DFC","s":[],"o":49,"pt":55,"h":186,"b":107,"f":"D","at":[41,41,43,41,28,52,52,50],"sk":"#b77e5c","hr":"#1f301e","hs":"jopo","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight604800001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli10200001","n":"Youssef Botha","nat":"Skote","a":27,"p":"POR","s":[],"o":57,"pt":58,"h":199,"b":104,"f":"D","at":[47,36,37,51,25,59,61,61],"sk":"#8d5d43","hr":"#60402a","hs":"undercut","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli10200001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli09000001","n":"Jonas Kirkland","nat":"Kaigam","a":24,"p":"POR","s":[],"o":50,"pt":53,"h":191,"b":98,"f":"I","at":[34,43,32,41,25,49,55,51],"sk":"#cb9474","hr":"#41311d","hs":"raya","bd":"completa","ac":[],"ph":"assets/players/football/x_futboli09000001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh01700001","n":"Emiliano Ocampo","nat":"Peronia","a":26,"p":"POR","s":[],"o":54,"pt":57,"h":187,"b":105,"f":"D","at":[39,35,27,44,25,57,59,54],"sk":"#ad7859","hr":"#998c5b","hs":"rulos","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futbolh01700001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight601500001","n":"Liam Volkov","nat":"Baikal","a":29,"p":"POR","s":[],"o":71,"pt":71,"h":191,"b":101,"f":"A","at":[51,59,47,61,39,74,77,67],"sk":"#cc9074","hr":"#5f462b","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/x_ficticiofinalnight601500001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli13200001","n":"Hugo Bernardi","nat":"Melonia","a":17,"p":"POR","s":[],"o":50,"pt":64,"h":191,"b":103,"f":"D","at":[40,38,27,45,25,50,51,53],"sk":"#b9876d","hr":"#35271d","hs":"mullet","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli13200001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli06300001","n":"Tomás Gallego","nat":"Grammes","a":31,"p":"LD","s":[],"o":56,"pt":56,"h":177,"b":100,"f":"D","at":[46,53,53,48,39,60,57,56],"sk":"#cc8f6b","hr":"#44240f","hs":"crop","bd":"bigote","ac":[],"ph":"assets/players/football/x_futboli06300001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight200700001","n":"Murilo Nascimento","nat":"Tamago","a":24,"p":"POR","s":[],"o":54,"pt":62,"h":187,"b":103,"f":"D","at":[43,37,34,46,26,61,48,57],"sk":"#bf7e58","hr":"#402411","hs":"afro","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight200700001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalv3test00600001","n":"Moussa Tazi","nat":"Sahar","a":24,"p":"POR","s":[],"o":52,"pt":60,"h":193,"b":101,"f":"D","at":[34,38,25,37,25,59,52,50],"sk":"#86553a","hr":"#a07952","hs":"puas","bd":"corta","ac":[],"ph":"assets/players/football/x_ficticiofinalv3test00600001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli11700001","n":"Caio Colque","nat":"Sotoa","a":20,"p":"POR","s":[],"o":44,"pt":53,"h":184,"b":94,"f":"D","at":[35,37,27,38,25,49,46,40],"sk":"#bf8a6e","hr":"#231d17","hs":"afro","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli11700001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolh00100001","n":"Gabriel Kondo","nat":"Tamago","a":26,"p":"POR","s":[],"o":56,"pt":59,"h":204,"b":101,"f":"D","at":[44,40,43,52,25,54,65,60],"sk":"#b68266","hr":"#59391b","hs":"jopo","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futbolh00100001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli06700001","n":"Diego Nishimura","nat":"Tamago","a":28,"p":"POR","s":[],"o":49,"pt":52,"h":197,"b":102,"f":"D","at":[33,29,25,43,25,50,49,56],"sk":"#bd8464","hr":"#0c0b07","hs":"twists","bd":"sombra","ac":[],"ph":"assets/players/football/x_futboli06700001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli05400001","n":"Luca Servais","nat":"Iberia","a":26,"p":"POR","s":[],"o":45,"pt":45,"h":188,"b":109,"f":"D","at":[30,36,31,38,25,48,49,42],"sk":"#c18d6e","hr":"#43311b","hs":"corto","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_futboli05400001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight609700001","n":"Liam Thorne","nat":"Kaigam","a":24,"p":"POR","s":[],"o":61,"pt":69,"h":189,"b":106,"f":"D","at":[52,52,40,56,25,63,58,67],"sk":"#c08a76","hr":"#513018","hs":"raya","bd":"sombra","ac":[],"ph":"assets/players/football/x_ficticiofinalnight609700001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalv2test00700001","n":"Enzo Rey","nat":"Iberia","a":30,"p":"POR","s":[],"o":54,"pt":54,"h":187,"b":95,"f":"D","at":[50,37,31,45,25,62,56,47],"sk":"#b38261","hr":"#203c2d","hs":"crop","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalv2test00700001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli08200001","n":"Nicolás Farfán","nat":"Peronia","a":28,"p":"POR","s":[],"o":57,"pt":58,"h":196,"b":100,"f":"I","at":[43,42,35,51,25,64,60,51],"sk":"#a8745d","hr":"#2c1c0f","hs":"corto","bd":"manubrio","ac":["aros"],"ph":"assets/players/football/x_futboli08200001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight605900001","n":"Marcos Correia","nat":"Tamago","a":27,"p":"POR","s":[],"o":54,"pt":54,"h":194,"b":98,"f":"D","at":[37,30,35,42,25,60,56,54],"sk":"#af775c","hr":"#736351","hs":"engominado","bd":"bigote","ac":[],"ph":"assets/players/football/x_ficticiofinalnight605900001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalvartest00300001","n":"Anh Katz","nat":"Netanya","a":18,"p":"POR","s":[],"o":46,"pt":55,"h":188,"b":103,"f":"I","at":[35,27,25,38,25,51,45,51],"sk":"#be8d6f","hr":"#9f8a6b","hs":"corto","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalvartest00300001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli01300001","n":"Devin Cañete","nat":"Sotoa","a":17,"p":"POR","s":[],"o":55,"pt":73,"h":191,"b":100,"f":"I","at":[45,39,34,43,31,56,58,59],"sk":"#be8263","hr":"#503a21","hs":"flequillo","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_futboli01300001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli00500001","n":"Dae Ogawa","nat":"Tamago","a":27,"p":"POR","s":[],"o":56,"pt":57,"h":187,"b":99,"f":"A","at":[44,45,34,54,25,57,52,62],"sk":"#c8916f","hr":"#080704","hs":"corto","bd":"corta","ac":[],"ph":"assets/players/football/x_futboli00500001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli04700001","n":"Yeison Nakamura","nat":"Tamago","a":22,"p":"POR","s":[],"o":50,"pt":56,"h":185,"b":98,"f":"A","at":[30,32,34,51,25,52,50,56],"sk":"#b68163","hr":"#452310","hs":"jopo","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futboli04700001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli05300001","n":"Callum Hagen","nat":"Overmark","a":34,"p":"POR","s":[],"o":50,"pt":50,"h":193,"b":103,"f":"I","at":[28,37,27,42,25,50,55,52],"sk":"#c08c70","hr":"#cb8982","hs":"afro","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_futboli05300001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli03100001","n":"Brayan Endo","nat":"Tamago","a":33,"p":"POR","s":[],"o":47,"pt":47,"h":192,"b":105,"f":"I","at":[39,36,30,36,25,54,43,47],"sk":"#ab785f","hr":"#554028","hs":"engominado","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futboli03100001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight607500001","n":"Thiago Abregú","nat":"Costas Unidas","a":21,"p":"POR","s":[],"o":54,"pt":64,"h":192,"b":106,"f":"I","at":[43,39,37,49,25,55,64,50],"sk":"#c68f6f","hr":"#5e4c31","hs":"colita","bd":"sombra","ac":[],"ph":"assets/players/football/x_ficticiofinalnight607500001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight604300001","n":"Oliver Jensen","nat":"Overmark","a":18,"p":"POR","s":[],"o":44,"pt":55,"h":192,"b":106,"f":"D","at":[28,30,25,34,25,52,41,40],"sk":"#be917c","hr":"#7c6140","hs":"largo","bd":"bigote","ac":[],"ph":"assets/players/football/x_ficticiofinalnight604300001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli08700001","n":"Minjun Tokhtarov","nat":"Kostanay","a":22,"p":"POR","s":[],"o":64,"pt":68,"h":190,"b":93,"f":"D","at":[45,54,46,63,29,68,61,65],"sk":"#cd9b79","hr":"#866345","hs":"rapado","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_futboli08700001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight201100001","n":"Leonardo Batista","nat":"Tamago","a":18,"p":"POR","s":[],"o":44,"pt":51,"h":195,"b":95,"f":"A","at":[27,29,25,43,25,50,44,43],"sk":"#a66948","hr":"#17140f","hs":"afro","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight201100001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli03900001","n":"Tomás Picard","nat":"Iberia","a":17,"p":"POR","s":[],"o":44,"pt":59,"h":195,"b":95,"f":"D","at":[28,25,25,37,25,43,52,47],"sk":"#b78363","hr":"#483520","hs":"crop","bd":"corta","ac":["aros"],"ph":"assets/players/football/x_futboli03900001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight300300001","n":"Lukas Roth","nat":"Margin","a":27,"p":"POR","s":[],"o":47,"pt":49,"h":198,"b":96,"f":"I","at":[31,31,29,45,25,50,46,50],"sk":"#cb8e6d","hr":"#64482b","hs":"corto","bd":"candado","ac":[],"ph":"assets/players/football/x_ficticiofinalnight300300001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli11000001","n":"Camilo Dantas","nat":"Tamago","a":28,"p":"POR","s":[],"o":62,"pt":64,"h":194,"b":96,"f":"I","at":[49,49,48,51,25,65,63,64],"sk":"#b7876e","hr":"#302217","hs":"puas","bd":"mosca","ac":[],"ph":"assets/players/football/x_futboli11000001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg01600001","n":"Omar Ghazali","nat":"Sahar","a":19,"p":"POR","s":[],"o":46,"pt":63,"h":192,"b":96,"f":"D","at":[34,28,25,40,25,51,43,50],"sk":"#c29376","hr":"#2f0f0f","hs":"corto","bd":"ninguna","ac":[],"ph":"assets/players/football/x_futbolg01600001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight202800001","n":"Finlay Nolan","nat":"Kaigam","a":25,"p":"POR","s":[],"o":58,"pt":59,"h":193,"b":102,"f":"D","at":[47,38,39,51,32,56,61,67],"sk":"#c99177","hr":"#a7a291","hs":"corto","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight202800001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight203900001","n":"Baptiste Brunet","nat":"Iberia","a":20,"p":"POR","s":[],"o":52,"pt":59,"h":188,"b":100,"f":"D","at":[33,33,31,41,25,57,56,50],"sk":"#c58a67","hr":"#1b150f","hs":"afro","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight203900001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight302800001","n":"Rodrigo Figueroa","nat":"Sotoa","a":20,"p":"POR","s":[],"o":48,"pt":65,"h":183,"b":100,"f":"A","at":[29,33,25,41,25,47,54,52],"sk":"#cd9273","hr":"#af997e","hs":"puas","bd":"anclada","ac":[],"ph":"assets/players/football/x_ficticiofinalnight302800001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg00100001","n":"Nicolás Siqueira","nat":"Tamago","a":18,"p":"POR","s":[],"o":44,"pt":61,"h":181,"b":101,"f":"D","at":[25,33,25,31,25,48,42,47],"sk":"#b57f5f","hr":"#4a2212","hs":"afro","bd":"anclada","ac":[],"ph":"assets/players/football/x_futbolg00100001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight302200001","n":"Lukas Collet","nat":"Iberia","a":27,"p":"POR","s":[],"o":48,"pt":51,"h":187,"b":96,"f":"A","at":[34,31,25,41,25,49,58,47],"sk":"#cc987c","hr":"#675239","hs":"engominado","bd":"sombra","ac":[],"ph":"assets/players/football/x_ficticiofinalnight302200001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli04300001","n":"Jonas Garrido","nat":"Grammes","a":25,"p":"POR","s":[],"o":58,"pt":59,"h":190,"b":106,"f":"D","at":[42,39,34,50,25,63,59,58],"sk":"#be8c67","hr":"#22190d","hs":"corto","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futboli04300001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight501200001","n":"Pablo Fraser","nat":"Kaigam","a":21,"p":"POR","s":[],"o":53,"pt":67,"h":193,"b":96,"f":"D","at":[41,37,36,39,25,54,54,58],"sk":"#deb69d","hr":"#4c3e30","hs":"corto","bd":"desprolija","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight501200001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli15000001","n":"Brandon Thomas","nat":"Valurria","a":21,"p":"POR","s":[],"o":48,"pt":62,"h":199,"b":105,"f":"D","at":[37,34,31,42,25,50,50,51],"sk":"#b68261","hr":"#11100b","hs":"corto","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futboli15000001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli04100001","n":"Lukas Knudsen","nat":"Overmark","a":22,"p":"POR","s":[],"o":56,"pt":63,"h":196,"b":97,"f":"D","at":[40,42,37,50,25,59,59,55],"sk":"#c48c6a","hr":"#0d0c08","hs":"corto","bd":"mosca","ac":["aros"],"ph":"assets/players/football/x_futboli04100001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futbolg01300001","n":"Andrés Moura","nat":"Tamago","a":23,"p":"POR","s":[],"o":53,"pt":60,"h":195,"b":91,"f":"D","at":[39,45,31,38,25,54,55,53],"sk":"#bd8360","hr":"#352315","hs":"afro","bd":"desprolija","ac":[],"ph":"assets/players/football/x_futbolg01300001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight608100001","n":"Tomás Valente","nat":"Grammes","a":22,"p":"ED","s":["MD"],"o":44,"pt":46,"h":178,"b":95,"f":"D","at":[39,48,44,42,47,25,31,42],"sk":"#c58a6b","hr":"#947651","hs":"crop","bd":"anclada","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight608100001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli02700001","n":"Emeka Bennani","nat":"Sahar","a":33,"p":"POR","s":[],"o":55,"pt":55,"h":194,"b":100,"f":"I","at":[36,40,35,38,25,61,54,56],"sk":"#a97454","hr":"#6c4e37","hs":"corto","bd":"mosca","ac":[],"ph":"assets/players/football/x_futboli02700001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight300800001","n":"Brayan Toledo","nat":"Tamago","a":23,"p":"POR","s":[],"o":49,"pt":57,"h":185,"b":108,"f":"A","at":[30,37,28,45,25,55,44,52],"sk":"#c08b6e","hr":"#443628","hs":"engominado","bd":"completa","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight300800001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli15100001","n":"Marco Maddox","nat":"Kaigam","a":21,"p":"POR","s":[],"o":44,"pt":53,"h":189,"b":104,"f":"D","at":[29,32,26,33,25,50,45,39],"sk":"#c79378","hr":"#382616","hs":"crop","bd":"chuletas","ac":["aros"],"ph":"assets/players/football/x_futboli15100001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight600900001","n":"Ezequiel Ferreyra","nat":"Magayanes","a":21,"p":"POR","s":[],"o":62,"pt":80,"h":188,"b":103,"f":"D","at":[46,37,40,53,30,68,59,68],"sk":"#b47d5e","hr":"#211f19","hs":"afro","bd":"sombra","ac":[],"ph":"assets/players/football/x_ficticiofinalnight600900001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli07200001","n":"Matteo Thibault","nat":"Iberia","a":18,"p":"POR","s":[],"o":48,"pt":56,"h":188,"b":102,"f":"I","at":[35,34,25,43,25,50,54,46],"sk":"#be8d6b","hr":"#614528","hs":"corto","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_futboli07200001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli14200001","n":"Rohan Baimukhanov","nat":"Kostanay","a":26,"p":"POR","s":[],"o":52,"pt":54,"h":186,"b":101,"f":"A","at":[33,34,28,38,25,60,51,49],"sk":"#b17f62","hr":"#65452b","hs":"flequillo","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_futboli14200001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight603800001","n":"Marcos Rezende","nat":"Tamago","a":29,"p":"POR","s":[],"o":53,"pt":53,"h":189,"b":104,"f":"A","at":[28,38,34,36,25,52,57,58],"sk":"#b17c5d","hr":"#163f2e","hs":"afro","bd":"candado","ac":[],"ph":"assets/players/football/x_ficticiofinalnight603800001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_futboli01200001","n":"Santiago Amaral","nat":"Tamago","a":19,"p":"POR","s":[],"o":44,"pt":57,"h":188,"b":100,"f":"D","at":[28,29,25,43,25,52,38,44],"sk":"#b3806a","hr":"#412f20","hs":"media","bd":"ninguna","ac":[],"ph":"assets/players/football/x_futboli01200001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalv3test00200001","n":"Santiago Ticona","nat":"Magayanes","a":19,"p":"POR","s":[],"o":44,"pt":56,"h":187,"b":103,"f":"D","at":[32,30,26,37,25,53,38,45],"sk":"#d0936f","hr":"#825e41","hs":"rapado","bd":"sombra","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalv3test00200001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight201300001","n":"Danilo Brandão","nat":"Tamago","a":19,"p":"POR","s":[],"o":44,"pt":58,"h":187,"b":100,"f":"D","at":[26,30,26,33,25,45,49,43],"sk":"#af7756","hr":"#1e160f","hs":"afro","bd":"candado","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight201300001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight602600001","n":"Liam Lukić","nat":"Zenet","a":19,"p":"POR","s":[],"o":56,"pt":64,"h":192,"b":99,"f":"I","at":[36,41,38,51,25,56,56,63],"sk":"#c38863","hr":"#292216","hs":"trencitas","bd":"bigote","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight602600001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""},{"id":"x_ficticiofinalnight203500001","n":"Matías Segovia","nat":"Costas Unidas","a":24,"p":"POR","s":[],"o":47,"pt":53,"h":189,"b":106,"f":"D","at":[37,40,25,37,25,52,45,46],"sk":"#cc946e","hr":"#12110c","hs":"buzz","bd":"ninguna","ac":["aros"],"ph":"assets/players/football/x_ficticiofinalnight203500001.webp","c":"","k":"fict","nt":"","dy":0,"tr":"","pa":""}]};
})(typeof globalThis !== 'undefined' ? globalThis : this);

}

// ---- tlm-players.js
{
/* LFO MANAGER — JUGADORES: identidad global única, generación, valor/contrato, forma/moral/físico, lesiones,
   entrenamiento y progresión. Un jugador existe UNA sola vez por partida (playerId global); las ediciones/cromos
   son sólo representación (player.card) del MISMO registro deportivo. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { RNG, clamp, round, avg, nextId, roundMoney } = TLM;

  // RNG ligado al estado guardado (state.rngState) — sin estado global.
  function R(state) {
    if (!state._rng) {
      const r = new RNG(state.rngState >>> 0);
      Object.defineProperty(r, 's', { get() { return state.rngState; }, set(v) { state.rngState = v >>> 0; }, configurable: true });
      Object.defineProperty(state, '_rng', { value: r, enumerable: false, writable: true, configurable: true });
    }
    return state._rng;
  }

  const roleOf = (pos) => TLM.ROLE_OF[pos] || 'MID';

  function overall(attrs, pos) {
    const w = TLM.OVR_WEIGHTS[roleOf(pos)];
    let s = 0, t = 0;
    for (const k in w) { s += attrs[k] * w[k]; t += w[k]; }
    return Math.round(s / t);
  }

  function ageValueFactor(age) { return age <= 19 ? 1.5 : age <= 21 ? 1.35 : age <= 24 ? 1.15 : age <= 28 ? 1 : age === 29 ? 0.9 : age === 30 ? 0.78 : age === 31 ? 0.62 : age === 32 ? 0.48 : age === 33 ? 0.36 : 0.26; }

  function valueOf(p) {
    const base = Math.exp((p.overall - 50) * 0.17) * 80000;
    const pot = p.age <= 24 ? 1 + Math.max(0, p.potential - p.overall) * 0.035 : 1;
    return Math.max(25000, roundMoney(base * ageValueFactor(p.age) * pot));
  }
  const salaryOf = (p) => Math.max(30000, roundMoney(valueOf(p) * 0.09 + 20000));

  const editionFor = (ovr) => (ovr >= 80 ? 'oro' : ovr >= 70 ? 'plata' : 'cobre');
  function recalc(p) {
    p.overall = overall(p.attributes, p.primaryPosition);
    if (p.card && ['cobre', 'plata', 'oro', 'potrero'].includes(p.card.edition)) { p.card.edition = editionFor(p.overall); p.card.stars = p.overall >= 80 ? 4 : p.overall >= 70 ? 4 : 3; }
    p.potential = Math.max(p.potential, p.overall);
    p.marketValue = valueOf(p);
    return p;
  }

  function usedNames(state) { const s = new Set(); for (const id in state.players) s.add(state.players[id].canonicalName); return s; }

  // En el juego al jugador se lo identifica por el apellido: dentro de una partida no se repite (los reales del roster son la excepción: no se renombran).
  const surOf = (n) => { const t = String(n).replace(/-/g, ' ').trim().split(/\s+/).filter((x) => !/^(jr|sr|ii|iii|iv)\.?$/i.test(x)); return (t[t.length - 1] || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''); };
  function sursOf(used) { if (!used._sur) { Object.defineProperty(used, '_sur', { value: new Set(), enumerable: false, writable: true }); used.forEach((n) => used._sur.add(surOf(n))); } return used._sur; }
  function claimName(used, n) { used.add(n); sursOf(used).add(surOf(n)); }
  function poolFor(nationality) {
    const RS = TLM.ROSTER; if (!RS || !RS.pools) return null;
    const N = g.LFONations, nat = N && N.get(nationality), key = nat && RS.natPool && RS.natPool[nat.id];
    return RS.pools[key] || RS.pools.lat;
  }
  function genName(state, used, nationality) {
    const r = R(state), sur = sursOf(used), pool = poolFor(nationality), F = pool ? pool[0] : TLM.NAMES.first, L = pool ? pool[1] : TLM.NAMES.last;
    for (let i = 0; i < 80; i++) {
      const ln = r.pick(L); if (sur.has(surOf(ln))) continue;
      const n = r.pick(F) + ' ' + ln; if (!used.has(n)) { claimName(used, n); return n; }
    }
    const RS = TLM.ROSTER;                                            // banco de la región agotado: cualquier apellido libre del mundo
    if (RS && RS.pools) for (const k in RS.pools) for (const ln of RS.pools[k][1]) if (!sur.has(surOf(ln))) { const n = r.pick(RS.pools[k][0]) + ' ' + ln; claimName(used, n); return n; }
    const n = r.pick(F) + ' ' + r.pick(L) + ' ' + r.int(2, 9); claimName(used, n); return n;
  }

  const SKIN = ['#f5cbb1', '#e3b38c', '#c6865d', '#8d5524', '#4a2c11'], HAIR = ['#231e18', '#3f2b21', '#211b18', '#6b4423', '#111'];

  // Nación del jugador: ficticia (assets/nations); más probable la del club donde se crea.
  const pickNation = (r, home) => (g.LFONations ? g.LFONations.pick(() => r.next(), home) : r.pick(TLM.NAMES.nations));
  // Guardados viejos usaban países reales: se pasan a la nación ficticia equivalente (y los clubes reciben la suya).
  function migrateNations(state) {
    const N = g.LFONations; if (!N) return false;
    let changed = false;
    for (const c of Object.values(state.clubs)) if (!c.nation) { c.nation = N.forClub(c.name) || (c.controlledBy === 'user' ? 'peronia' : N.get(N.legacy('?', c.id)).id); changed = true; }
    for (const p of Object.values(state.players)) if (!N.list.some((n) => n.name === p.nationality)) { p.nationality = N.legacy(p.nationality, p.id); changed = true; }
    return changed;
  }
    // makePlayer: crea el registro global. opts: {pos, ovr, age, clubId, name, nationality, seedName}
  function makePlayer(state, opts) {
    const r = R(state), pos = opts.pos, role = roleOf(pos);
    const age = opts.age != null ? opts.age : r.int(18, 34);
    const nat0 = opts.nationality || pickNation(r, opts.nationHome);
    const target = clamp(round(opts.ovr), 38, 75);      // sin foto (jugador generado): máximo 75 de media
    const prof = TLM.STAT_PROFILE[role];
    const attrs = {};
    for (const k of TLM.STAT_KEYS) attrs[k] = clamp(round(target + prof[k] + r.gauss() * 4), 25, 99);
    // Reescalado: se ajusta hasta que la media por posición coincida con el objetivo (mismos pesos que la carta).
    for (let i = 0; i < 6; i++) {
      const d = target - overall(attrs, pos);
      if (!d) break;
      for (const k of TLM.STAT_KEYS) if (TLM.OVR_WEIGHTS[role][k]) attrs[k] = clamp(attrs[k] + d, 25, 99);
    }
    const personality = {};
    for (const k of TLM.PERS_KEYS) personality[k] = clamp(round(r.range(k === 'consistency' ? 30 : 20, k === 'consistency' ? 95 : 92)), 5, 99);
    const sec = [];
    const fam = TLM.POSITIONS.filter((q) => q !== pos && TLM.compat(q, pos) >= 0.86 && q !== 'POR');
    if (role !== 'GK' && fam.length && r.chance(0.55)) sec.push(r.pick(fam));
    const growth = age <= 21 ? r.range(4, 16) : age <= 24 ? r.range(1, 9) : age <= 27 ? r.range(0, 3) : 0;
    const height = clamp(round((role === 'GK' ? 187 : role === 'DEF' ? 182 : role === 'FWD' ? 179 : 176) + r.gauss() * 5 + (attrs.physical - 75) * 0.25), 165, 204);
    const p = {
      id: nextId(state, 'player', 'player'),
      canonicalName: opts.name || genName(state, opts._used || usedNames(state), nat0),
      nationality: nat0,
      age, primaryPosition: pos, secondaryPositions: sec, attributes: attrs, personality,
      overall: overall(attrs, pos), potential: 0, marketValue: 0, salary: 0,
      contract: { clubId: null, salary: 0, endSeason: 0, status: 'free' },
      fitness: 100, morale: 65, form: 50, injury: null, suspension: 0,
      card: { edition: 'potrero', stars: 3, year: state.season, foot: r.chance(0.72) ? 'Derecho' : r.chance(0.7) ? 'Izquierdo' : 'Ambos', height, build: clamp(round(100 + r.gauss() * 3 + (attrs.physical - 75) * 0.15), 88, 116), skin: r.pick(SKIN), hair: r.pick(HAIR), hairStyle: r.pick(['corto', 'corto', 'rapado', 'largo']), pose: 'retrato', angle: r.int(-14, 14), photo: TLM.placeholderPhoto() },
      clubId: null, number: 0, joinedSeason: state.season,
      careerHistory: [], seasonStats: emptySeason(), careerTotals: emptySeason(),
    };
    p.potential = clamp(p.overall + Math.round(growth), p.overall, 96);
    recalc(p);
    p.salary = salaryOf(p);
    // Ediciones base: cobre / plata / oro según la media (recalc ya la fija).
    state.players[p.id] = p;
    return p;
  }


  // ---- Roster fijo (tlm-roster.js): jugadores reales / celebridades / ficticios con retrato. Los que faltan se generan con foto gris. ----
  const assetURL = (path) => (path ? (/^(data:|https?:|\.{0,2}\/)/.test(path) ? path : '../' + path) : path);   // los módulos viven en subcarpetas: las imágenes están en /assets
  const placeholderPhoto = () => assetURL((TLM.ROSTER && TLM.ROSTER.placeholder) || 'assets/players/placeholder.webp');
  const FOOT = { D: 'Derecho', I: 'Izquierdo', A: 'Ambos' };
  const rosterByClub = () => { const RS = TLM.ROSTER; if (!RS) return null; if (!RS._byClub) { const m = {}; RS.players.forEach((e) => { (m[e.c || ''] = m[e.c || ''] || []).push(e); }); Object.defineProperty(RS, '_byClub', { value: m, enumerable: false }); } return RS._byClub; };
  // makeFromRoster: mismo registro global que makePlayer, con datos fijos. used = Set de nombres (para no repetir apellidos al generar otros).
  function makeFromRoster(state, e, used) {
    const r = R(state), pos = e.p, attrs = {};
    TLM.STAT_KEYS.forEach((k, i) => { attrs[k] = clamp(round(e.at[i]), 25, 99); });
    const personality = {};
    for (const k of TLM.PERS_KEYS) personality[k] = clamp(round(r.range(k === 'consistency' ? 30 : 20, k === 'consistency' ? 95 : 92)), 5, 99);
    const nat = g.LFONations && g.LFONations.get(e.nat) ? g.LFONations.get(e.nat).name : e.nat;
    if (used) claimName(used, e.n);
    const p = {
      id: nextId(state, 'player', 'player'), canonicalName: e.n, nationality: nat, age: e.a, primaryPosition: pos, secondaryPositions: (e.s || []).slice(), attributes: attrs, personality,
      overall: overall(attrs, pos), potential: 0, marketValue: 0, salary: 0, contract: { clubId: null, salary: 0, endSeason: 0, status: 'free' }, fitness: 100, morale: 65, form: 50, injury: null, suspension: 0,
      card: { edition: 'potrero', stars: 3, year: state.season, foot: FOOT[e.f] || 'Derecho', height: e.h, build: e.b, skin: e.sk, hair: e.hr, hairStyle: e.hs, pose: 'retrato', angle: r.int(-14, 14), photo: assetURL(e.ph), photoDy: e.dy || 0,
        look: { hairStyle: e.hs, beard: e.bd || 'ninguna', acc: (e.ac || []).slice() } },
      clubId: null, number: 0, joinedSeason: state.season, rosterId: e.id, rosterKind: e.k, note: e.nt || '', trait: e.tr || '',
      careerHistory: [], seasonStats: emptySeason(), careerTotals: emptySeason(),
    };
    p.potential = Math.max(e.pt || p.overall, p.overall);
    recalc(p);
    p.salary = salaryOf(p);
    if (e.k === 'special') p.card.stars = 5;
    state.players[p.id] = p;
    return p;
  }

  function emptySeason() { return { matches: 0, starts: 0, minutes: 0, goals: 0, assists: 0, shots: 0, saves: 0, yellow: 0, red: 0, tackles: 0, fouls: 0, cleanSheets: 0, ratingSum: 0, ratingN: 0 }; }

  // ---- movimiento entre clubes: ÚNICO punto donde cambia clubId → un jugador nunca está en dos clubes ----
  function moveToClub(state, playerId, clubId, contract) {
    const p = state.players[playerId];
    if (!p) throw new Error('Jugador inexistente: ' + playerId);
    if (p.equippedCardId && TLM.unequipCard) TLM.unequipCard(state, p); // la carta especial se queda con el club vendedor; viaja "pelado"
    const from = p.clubId && state.clubs[p.clubId];
    if (from) {
      from.squad = from.squad.filter((id) => id !== playerId);
      if (from.lineup) { from.lineup.xi = from.lineup.xi.map((id) => (id === playerId ? null : id)); from.lineup.bench = from.lineup.bench.filter((id) => id !== playerId); }
    }
    if (p.clubId) closeHistoryStint(state, p);
    p.clubId = clubId;
    if (clubId) {
      const to = state.clubs[clubId];
      if (!to.squad.includes(playerId)) to.squad.push(playerId);
      p.contract = Object.assign({ clubId, salary: p.salary, endSeason: state.season + 2, status: 'active' }, contract || {}, { clubId });
      p.salary = p.contract.salary;
      p.number = assignNumber(state, to, p);
      p.joinedSeason = state.season;
      p.morale = clamp(p.morale + 6, 0, 100);
    } else {
      p.contract = { clubId: null, salary: 0, endSeason: 0, status: 'free' };
      p.number = 0;
    }
    return p;
  }

  function assignNumber(state, club, p) {
    const taken = new Set(club.squad.filter((id) => id !== p.id).map((id) => state.players[id].number));
    const pref = p.primaryPosition === 'POR' ? [1, 13, 25, 12] : ['DFC', 'LI', 'LD'].includes(p.primaryPosition) ? [4, 5, 3, 2, 6, 15, 16, 22] : ['MCD', 'MC', 'MP', 'MI', 'MD'].includes(p.primaryPosition) ? [8, 6, 10, 14, 5, 20, 21, 18] : [9, 11, 7, 10, 17, 19, 23, 24];
    for (const n of pref) if (!taken.has(n)) return n;
    for (let n = 2; n < 100; n++) if (!taken.has(n)) return n;
    return 99;
  }

  // Historial de carrera: se cierra el tramo con el club al cambiar de equipo o de temporada.
  function closeHistoryStint(state, p) {
    const s = p.seasonStats, club = state.clubs[p.clubId];
    if (!club) return;
    if (s.matches || s.minutes) {
      p.careerHistory.push({ season: state.season, clubId: p.clubId, club: club.name, matches: s.matches, goals: s.goals, assists: s.assists, minutes: s.minutes, yellow: s.yellow, red: s.red, rating: s.ratingN ? +(s.ratingSum / s.ratingN).toFixed(2) : null });
      for (const k in s) p.careerTotals[k] = (p.careerTotals[k] || 0) + s[k];
      p.seasonStats = emptySeason();
    }
  }

  // ---- carta especial equipada: cada "logic" tiene su propio efecto en el partido (ver EDITIONS en tlm-data.js).
  // El contexto de partido (derby/apertura/copa) lo pone primeCardContext() antes de armar el once; el resto
  // (boost/consistencia/inmunidad/XP/veteranía) sólo depende del jugador.
  function cardBoostBits(p) {
    const none = { flat: 0, noiseMul: 1, xpMul: 1, immune: false };
    if (!p.equippedCardLogic) return none;
    const ctx = p._cardCtx || {};
    switch (p.equippedCardLogic) {
      case 'boost': return { ...none, flat: p.equippedCardBoost || 0 };
      case 'legend': return { flat: p.equippedCardBoost || 0, noiseMul: 0.7, xpMul: 1.5, immune: true };
      case 'derby': return { ...none, flat: ctx.derby ? (p.equippedCardBoost || 0) : 0 };
      case 'opener': return { ...none, flat: ctx.opener ? (p.equippedCardBoost || 0) : 0 };
      case 'cup': return { ...none, flat: ctx.cup ? (p.equippedCardBoost || 0) : 0 };
      case 'consistency': return { ...none, noiseMul: 0.3 };
      case 'immune': return { ...none, immune: true };
      case 'xp': return { ...none, xpMul: 2 };
      case 'veteran': { const games = (p.careerTotals && p.careerTotals.matches) || 0; return { ...none, flat: Math.min(6, Math.floor(games / 40)) }; }
      default: return none;
    }
  }
  function primeCardContext(state, fixture) {
    const home = state.clubs[fixture.homeId], away = state.clubs[fixture.awayId];
    // "Derby": no hay geografía real entre clubes (cada uno es de una "nación" distinta), así que se define como un
    // partido entre rivales parejos en la tabla (a 2 puestos o menos) — la tensión de un partido cerrado y directo.
    let derby = false;
    const comp = fixture.competitionId && state.competitions[fixture.competitionId];
    if (comp && !fixture.cup) {
      const table = TLM.computeTable(state, comp), rank = {}; table.forEach((r, i) => (rank[r.clubId] = i));
      if (rank[home.id] != null && rank[away.id] != null) derby = Math.abs(rank[home.id] - rank[away.id]) <= 2;
    }
    const ctx = { derby, opener: fixture.round === 1 && !fixture.cup, cup: !!fixture.cup };
    for (const club of [home, away]) for (const pid of club.squad) { const p = state.players[pid]; if (p) p._cardCtx = ctx; }
  }

  // ---- stats efectivos para el partido: base + moral + forma + entrenamiento de equipo + carta especial ----
  function effectiveStats(p, club) {
    const mm = clamp(round((p.morale - 60) / 15), -4, 3), fm = clamp(round((p.form - 50) / 25), -2, 2);
    const tb = (club && club.training && club.training.teamBoost) || 0, focus = club && club.training && club.training.team;
    const eff = TLM.TRAINING.teamEffect[focus] || [];
    const cardFlat = cardBoostBits(p).flat;
    const out = {};
    for (const k of TLM.STAT_KEYS) out[k] = clamp(round(p.attributes[k] + mm + fm + (eff.includes(k) ? tb : 0) + cardFlat), 20, 99);
    return out;
  }

  // ---- XP por partido: rating alto da XP (multiplicado si tiene la carta "Primera ovación"); cada 60 XP hay chance
  // de +1 en un atributo, con la misma gradación de edad/potencial que trainRound (no es rápido ni OP). ----
  function gainMatchXP(state, p, rating) {
    const r = R(state), xpMul = cardBoostBits(p).xpMul;
    const gain = Math.max(0, round((rating - 5.5) * 3)) * xpMul;
    if (!gain) return;
    p.xp = (p.xp || 0) + gain;
    while (p.xp >= 60) {
      p.xp -= 60;
      const ageF = p.age <= 21 ? 1.4 : p.age <= 25 ? 1 : p.age <= 29 ? 0.5 : 0.15;
      const room = p.potential - p.overall;
      if (r.chance((room > 0 ? 0.5 : 0.12) * ageF)) {
        const ro = TLM.roleOf(p.primaryPosition), pool = ro === 'GK' ? ['reflexes', 'handling', 'positioning'] : ro === 'DEF' ? ['marking', 'tackling', 'strength'] : ro === 'MID' ? ['passing', 'vision', 'stamina'] : ['finishing', 'pace', 'dribbling'];
        const k = pool.find((x) => TLM.STAT_KEYS.includes(x)) ? r.pick(pool.filter((x) => TLM.STAT_KEYS.includes(x))) : r.pick(TLM.STAT_KEYS);
        if (p.attributes[k] < 96) { p.attributes[k]++; recalc(p); }
      }
    }
  }

  function isAvailable(p) { return !p.injury && !(p.suspension > 0); }

  const INJURIES = [
    { name: 'Golpe', d: [1, 2], w: 5 }, { name: 'Contractura', d: [1, 3], w: 4 }, { name: 'Esguince de tobillo', d: [2, 5], w: 3 },
    { name: 'Desgarro muscular', d: [4, 8], w: 2 }, { name: 'Rotura de ligamentos', d: [10, 20], w: 0.6 },
  ];
  function injure(state, p, severity) {
    const r = R(state);
    if (p.injury) return p.injury;
    const pool = INJURIES.filter((i) => severity > 0.75 ? i.d[0] >= 4 : severity > 0.4 ? i.d[1] <= 8 : i.d[1] <= 5);
    const t = r.weighted(pool.length ? pool : INJURIES, (i) => i.w);
    const md = r.int(t.d[0], t.d[1]);
    p.injury = { name: t.name, matchdays: md, total: md };
    p.morale = clamp(p.morale - 4, 0, 100);
    return p.injury;
  }

  // Tick por jornada: recuperación física, lesiones, sanciones. `played` = jugó esta jornada (fitness lo fija applyMatchResult).
  function weeklyRecovery(state, p, played) {
    if (p.injury) { p.injury.matchdays--; if (p.injury.matchdays <= 0) p.injury = null; }
    if (p.suspension > 0 && !played) p.suspension--;
    p.fitness = clamp(p.fitness + (played ? 18 : 30), 0, 100);
    // sin jugar minutos, el jugador con ovr alto se molesta un poco; los que juegan suben.
    if (!played && !p.injury && p.suspension <= 0) p.morale = clamp(p.morale - (p.overall >= 70 ? 0.8 : 0.3), 20, 100);
    p.morale += (65 - p.morale) * 0.04; // deriva a neutro
    updateDiscontent(state, p);
  }

  // Descontento: moral floja sostenida o sueldo muy por debajo de su valor de mercado, acumulado varias jornadas seguidas.
  // Al cruzar el umbral el jugador "quiere salir": otros clubes lo ofertan más fácil (reserveValue más bajo) y, si es tuyo,
  // se avisa por noticias para que decidas si lo dejás ir, intentás retenerlo (renovar/mejorar sueldo) o lo ignorás.
  const DISCONTENT_THRESHOLD = 8;
  function updateDiscontent(state, p) {
    if (!p.clubId) { p.discontentStreak = 0; p.wantsOut = false; return; }
    const unhappy = p.morale < 35;
    p.discontentStreak = unhappy ? (p.discontentStreak || 0) + 1 : Math.max(0, (p.discontentStreak || 0) - 2);
    const was = p.wantsOut;
    p.wantsOut = p.discontentStreak >= DISCONTENT_THRESHOLD;
    if (p.wantsOut && !was) {
      const club = state.clubs[p.clubId];
      if (club && TLM.addNews) TLM.addNews(state, 'contract', `${p.canonicalName} está descontento en ${club.name} y pide que lo transfieran.`, { playerId: p.id, clubId: club.id });
    }
  }

  // ---- Entrenamiento individual: probabilidad pequeña por jornada de +1 en los atributos del foco ----
  function trainRound(state, club) {
    const r = R(state), f = club.training && club.training.individual, def = TLM.TRAINING.individual.find((t) => t[0] === f);
    if (!def) return [];
    const out = [];
    for (const id of club.squad) {
      const p = state.players[id];
      if (p.injury) continue;
      const isGK = p.primaryPosition === 'POR';
      if (f === 'goalkeeping' ? !isGK : isGK) continue; // el foco de portería sólo entrena porteros; el resto, sólo jugadores de campo
      const room = p.potential - p.overall;
      const ageF = p.age <= 21 ? 1.4 : p.age <= 25 ? 1 : p.age <= 29 ? 0.5 : 0.15;
      const chance = (room > 0 ? 0.05 : 0.008) * ageF * (1 + (p.personality.consistency - 60) / 200);
      if (r.chance(chance)) {
        const k = r.pick(def[2]);
        if (p.attributes[k] < 96) { p.attributes[k]++; const before = p.overall; recalc(p); out.push({ id, key: k, from: before, to: p.overall }); }
      }
    }
    // Entrenamiento de equipo: acumula bonus temporal (0..3), decae al cambiar de foco (lo gestiona setTraining).
    const tr = club.training;
    if (tr && tr.team) tr.teamBoost = Math.min(3, (tr.teamBoost || 0) + 0.25);
    return out;
  }

  // ---- Progresión de fin de temporada ----
  function seasonProgress(state, p) {
    const r = R(state);
    const a = p.age;
    const trend = a <= 20 ? 2.3 : a <= 22 ? 1.6 : a <= 24 ? 0.9 : a <= 28 ? 0.1 : a <= 31 ? -0.8 : a <= 33 ? -1.6 : -2.4;
    for (const k of TLM.STAT_KEYS) {
      const phys = k === 'speed' || k === 'acceleration' || k === 'physical';
      let d = r.gauss() * 0.9 + trend + (phys && a >= 28 ? -0.7 : 0) + (!phys && a >= 30 ? 0.3 : 0);
      if (p.overall >= p.potential && d > 0) d *= 0.25;
      p.attributes[k] = clamp(round(p.attributes[k] + d), 25, 99);
    }
    p.age++;
    recalc(p);
    if (p.age > 29) p.potential = p.overall;
  }

  Object.assign(TLM, { assetURL, placeholderPhoto, rosterByClub, makeFromRoster, claimName, surOf, migrateNations, R, roleOf, overall, valueOf, salaryOf, recalc, makePlayer, moveToClub, assignNumber, closeHistoryStint, effectiveStats, isAvailable, injure, weeklyRecovery, trainRound, seasonProgress, usedNames, emptySeason, ageValueFactor,
    cardBoostBits, primeCardContext, gainMatchXP });
})(typeof globalThis !== 'undefined' ? globalThis : this);

}

// ---- tlm-competition.js
{
/* LFO MANAGER — COMPETICIÓN: calendario todos-contra-todos para CUALQUIER cantidad de equipos (método del círculo),
   tabla calculada desde los resultados con desempates parametrizables, jornada actual y ciclo de temporada.
   Arquitectura compatible con futuras divisiones: una Competition es una entidad más (state.competitions). */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { nextId } = TLM;

  // Método del círculo. Devuelve rondas [[home, away]...] y byes. n impar → se agrega un "descanso" (null).
  // Las localías se reparten con un pase voraz: en cada partido se elige la orientación que menos alarga las rachas
  // seguidas de local/visita de ambos equipos (desempate: quien lleva menos partidos de local). La vuelta invierte la ida.
  function roundRobin(teamIds) {
    const teams = teamIds.slice();
    if (teams.length < 2) return { rounds: [], byes: [] };
    if (teams.length % 2) teams.push(null);
    const n = teams.length, rounds = [], byes = [];
    const arr = teams.slice(), streak = {}, homes = {};
    for (const t of teamIds) { streak[t] = 0; homes[t] = 0; } // streak>0: locales seguidos; <0: visitas seguidas
    for (let r = 0; r < n - 1; r++) {
      const round = []; let bye = null;
      const pairs = [];
      for (let i = 0; i < n / 2; i++) { const a = arr[i], b = arr[n - 1 - i]; if (a === null || b === null) { bye = a === null ? b : a; continue; } pairs.push([a, b]); }
      // primero los equipos con racha más larga: eligen antes su orientación
      pairs.sort((x, y) => Math.max(Math.abs(streak[y[0]]), Math.abs(streak[y[1]])) - Math.max(Math.abs(streak[x[0]]), Math.abs(streak[x[1]])));
      for (const [a, b] of pairs) {
        const cost = (h, v) => (streak[h] > 0 ? streak[h] + 1 : 1) ** 2 + (streak[v] < 0 ? -streak[v] + 1 : 1) ** 2 + (homes[h] - homes[v]) * 0.3;
        const [h, v] = cost(a, b) <= cost(b, a) ? [a, b] : [b, a];
        streak[h] = streak[h] > 0 ? streak[h] + 1 : 1; streak[v] = streak[v] < 0 ? streak[v] - 1 : -1; homes[h]++;
        round.push([h, v]);
      }
      if (bye !== null) streak[bye] = 0;
      rounds.push(round); byes.push(bye);
      arr.splice(1, 0, arr.pop()); // rota todo menos el primero
    }
    return { rounds, byes };
  }

  // Calendario completo. rounds=1 → solo ida; rounds=2 → ida y vuelta (la vuelta invierte localías).
  function buildSchedule(teamIds, rounds) {
    const base = roundRobin(teamIds);
    const out = [], byes = [];
    for (let leg = 0; leg < (rounds || 2); leg++) {
      base.rounds.forEach((mr, i) => {
        out.push(mr.map(([h, a]) => (leg % 2 ? [a, h] : [h, a])));
        byes.push(base.byes[i]);
      });
    }
    return { rounds: out, byes };
  }

  function createCompetition(state, cfg) {
    const c = {
      id: cfg.id || nextId(state, 'competition', 'comp'), name: cfg.name, country: cfg.country || null, crest: cfg.crest || null,
      teams: cfg.teams.slice(), leagueSize: cfg.teams.length, format: 'league', rounds: cfg.format.rounds,
      pointsForWin: cfg.format.pointsForWin, pointsForDraw: cfg.format.pointsForDraw, pointsForLoss: cfg.format.pointsForLoss,
      tieBreakRules: cfg.format.tieBreakRules.slice(), calendar: [], byes: [], activeSeason: state.season, status: 'ready', level: 1,
    };
    state.competitions[c.id] = c;
    return c;
  }

  // Genera (o regenera) los fixtures de la temporada activa. Los IDs son estables: fx_<season>_<round>_<n>.
  function generateSeason(state, comp) {
    for (const id in state.fixtures) if (state.fixtures[id].competitionId === comp.id && state.fixtures[id].season === comp.activeSeason) delete state.fixtures[id];
    const sch = buildSchedule(comp.teams, comp.rounds);
    comp.calendar = []; comp.byes = sch.byes;
    sch.rounds.forEach((mr, ri) => {
      const ids = [];
      mr.forEach(([h, a], n) => {
        const id = `fx_${comp.activeSeason}_${ri + 1}_${n + 1}`;
        state.fixtures[id] = { id, competitionId: comp.id, season: comp.activeSeason, round: ri + 1, homeId: h, awayId: a, status: 'scheduled', result: null };
        ids.push(id);
      });
      comp.calendar.push(ids);
    });
    comp.status = 'active';
    return comp;
  }

  const fixturesOf = (state, comp, round) => (comp.calendar[round - 1] || []).map((id) => state.fixtures[id]);
  const totalRounds = (comp) => comp.calendar.length;
  // Jornada actual = primera con partidos sin jugar (null si terminó la temporada).
  function currentRound(state, comp) {
    for (let r = 1; r <= comp.calendar.length; r++) if (fixturesOf(state, comp, r).some((f) => f.status !== 'played')) return r;
    return null;
  }
  const isSeasonOver = (state, comp) => currentRound(state, comp) === null;

  function recordResult(state, fixture, hg, ag, extra) {
    fixture.status = 'played';
    fixture.result = Object.assign({ hg, ag }, extra || {});
  }

  // ---- Tabla: derivada de los fixtures jugados (siempre consistente con los resultados) ----
  function computeTable(state, comp, uptoRound) {
    const rows = {};
    for (const t of comp.teams) rows[t] = { clubId: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0, form: [] };
    const played = [];
    for (let r = 1; r <= comp.calendar.length; r++) {
      if (uptoRound && r > uptoRound) break;
      for (const f of fixturesOf(state, comp, r)) if (f.status === 'played') played.push(f);
    }
    for (const f of played) {
      const h = rows[f.homeId], a = rows[f.awayId], { hg, ag } = f.result;
      if (!h || !a) continue;
      h.played++; a.played++; h.gf += hg; h.ga += ag; a.gf += ag; a.ga += hg;
      if (hg > ag) { h.won++; a.lost++; h.points += comp.pointsForWin; a.points += comp.pointsForLoss; h.form.push('W'); a.form.push('L'); }
      else if (hg < ag) { a.won++; h.lost++; a.points += comp.pointsForWin; h.points += comp.pointsForLoss; a.form.push('W'); h.form.push('L'); }
      else { h.drawn++; a.drawn++; h.points += comp.pointsForDraw; a.points += comp.pointsForDraw; h.form.push('D'); a.form.push('D'); }
    }
    for (const t in rows) rows[t].gd = rows[t].gf - rows[t].ga;
    const list = Object.values(rows);
    const nameOf = (id) => (state.clubs[id] ? state.clubs[id].name : id);
    // mini-tabla entre empatados para 'headToHead'
    const h2h = (ids) => {
      const m = {}; ids.forEach((i) => (m[i] = 0));
      for (const f of played) if (m[f.homeId] != null && m[f.awayId] != null) {
        const { hg, ag } = f.result;
        if (hg > ag) m[f.homeId] += comp.pointsForWin; else if (hg < ag) m[f.awayId] += comp.pointsForWin; else { m[f.homeId] += comp.pointsForDraw; m[f.awayId] += comp.pointsForDraw; }
      }
      return m;
    };
    const cmpBy = (rule, a, b, ctx) => {
      switch (rule) {
        case 'points': return b.points - a.points;
        case 'goalDifference': return b.gd - a.gd;
        case 'goalsFor': return b.gf - a.gf;
        case 'wins': return b.won - a.won;
        case 'headToHead': return (ctx.h2h[b.clubId] || 0) - (ctx.h2h[a.clubId] || 0);
        case 'name': return nameOf(a.clubId).localeCompare(nameOf(b.clubId));
        default: return 0;
      }
    };
    // ordena por bloques: primero por la 1ª regla; los empatados se desempatan con las siguientes (h2h sólo entre ellos)
    const sortGroup = (arr, rules) => {
      if (arr.length < 2 || !rules.length) return arr;
      const [rule, ...rest] = rules;
      if (rule === 'headToHead') {
        const m = h2h(arr.map((x) => x.clubId));
        const s = arr.slice().sort((a, b) => (m[b.clubId] || 0) - (m[a.clubId] || 0));
        return groupApply(s, (x) => m[x.clubId] || 0, rest, sortGroup);
      }
      const s = arr.slice().sort((a, b) => cmpBy(rule, a, b, {}));
      const key = { points: (x) => x.points, goalDifference: (x) => x.gd, goalsFor: (x) => x.gf, wins: (x) => x.won, name: (x) => nameOf(x.clubId) }[rule] || (() => 0);
      return groupApply(s, key, rest, sortGroup);
    };
    const groupApply = (sorted, key, rest, fn) => {
      const out = []; let i = 0;
      while (i < sorted.length) {
        let j = i; while (j + 1 < sorted.length && key(sorted[j + 1]) === key(sorted[i])) j++;
        const grp = sorted.slice(i, j + 1);
        out.push(...(grp.length > 1 ? fn(grp, rest) : grp)); i = j + 1;
      }
      return out;
    };
    const sorted = sortGroup(list, comp.tieBreakRules);
    sorted.forEach((row, i) => { row.pos = i + 1; row.form = row.form.slice(-5); });
    return sorted;
  }

  // Racha reciente de un club (últimos n resultados, del más antiguo al más reciente).
  function recentResults(state, comp, clubId, n) {
    const out = [];
    for (let r = 1; r <= comp.calendar.length; r++) for (const f of fixturesOf(state, comp, r)) {
      if (f.status !== 'played' || (f.homeId !== clubId && f.awayId !== clubId)) continue;
      const home = f.homeId === clubId, gf = home ? f.result.hg : f.result.ag, ga = home ? f.result.ag : f.result.hg;
      out.push({ round: r, opp: home ? f.awayId : f.homeId, home, gf, ga, res: gf > ga ? 'W' : gf < ga ? 'L' : 'D', fixtureId: f.id });
    }
    return out.slice(-(n || 5));
  }

  function nextFixtureFor(state, comp, clubId) {
    for (let r = 1; r <= comp.calendar.length; r++) for (const f of fixturesOf(state, comp, r)) if (f.status !== 'played' && (f.homeId === clubId || f.awayId === clubId)) return f;
    return null;
  }

  Object.assign(TLM, { roundRobin, buildSchedule, createCompetition, generateSeason, fixturesOf, totalRounds, currentRound, isSeasonOver, recordResult, computeTable, recentResults, nextFixtureFor });
})(typeof globalThis !== 'undefined' ? globalThis : this);

}

// ---- tlm-club.js
{
/* LFO MANAGER — MUNDO / CLUBES / FINANZAS / ESTADIO.
   createWorld() convierte la configuración estática (WORLD_CONFIG) en estado de carrera. El club del usuario es un Club
   como cualquier otro (mismo objeto, mismas reglas): sólo cambia controlledBy. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { clamp, round, nextId, roundMoney, R } = TLM;

  const SQUAD_TEMPLATE = ['POR', 'POR', 'DFC', 'DFC', 'DFC', 'DFC', 'LI', 'LI', 'LD', 'LD', 'MCD', 'MCD', 'MC', 'MC', 'MC', 'MI', 'MD', 'MP', 'EI', 'ED', 'DC', 'DC', 'DC'];

  function newClub(state, cfg) {
    const id = cfg.id || nextId(state, 'club', 'club');
    const cap = cfg.capacity || 15000;
    const club = {
      id, name: cfg.name, shortName: (cfg.shortName || cfg.name.slice(0, 3)).toUpperCase().slice(0, 4), crest: cfg.crest || null, nation: cfg.nation || (g.LFONations && g.LFONations.forClub(cfg.name)) || null,
      primaryColor: cfg.primaryColor || '#4a8fbf', secondaryColor: cfg.secondaryColor || '#ffffff', kitPattern: cfg.kitPattern || null,
      stadium: { name: cfg.stadium || 'Estadio ' + cfg.name, capacity: cap, level: cfg.level || 1 },
      finances: { balance: cfg.balance != null ? cfg.balance : 20e6, ledger: [], seasonIncome: 0, seasonExpense: 0, debtRounds: 0, ticketPrice: TLM.DEFAULTS.ticketPrice },
      squad: [], reputation: cfg.rep || 50, controlledBy: cfg.controlledBy || 'ai', aiProfile: cfg.profile || 'balanced',
      history: { titles: 0, seasons: [], bestFinish: null }, tactics: TLM.clone(TLM.DEFAULT_TACTICS),
      lineup: { xi: Array(11).fill(null), bench: [] }, lineupMode: 'auto',
      plan: { ifWinning: 'keep', ifLosing: 'keep', fromMinute: { minute: 70, mode: 'keep' }, autoSubs: false },
      training: { individual: 'attack', team: 'attack', teamBoost: 0 }, observed: { matches: 0, channels: { left: 0, center: 0, right: 0 }, pressing: 0, possession: 0 },
      base: !!cfg.base, foreign: !!cfg.foreign,
    };
    state.clubs[id] = club;
    return club;
  }

  function startingBalance(rep) { return roundMoney(Math.pow(rep / 100, 2.2) * 60e6); }

  function fillSquad(state, club, cfg, used) {
    const r = R(state);
    // Roster fijo (tlm-roster.js): si el club tiene jugadores asignados, se usan ésos; los puestos que falten se generan con foto gris.
    const rb = TLM.rosterByClub && TLM.rosterByClub(), rows = rb && rb[club.name];
    if (rows && rows.length) {
      rows.forEach((e) => {
        const p = TLM.makeFromRoster(state, e, used);
        TLM.moveToClub(state, p.id, club.id, { salary: 0, endSeason: state.season + r.int(1, 4) });
        p.morale = clamp(round(60 + r.gauss() * 6), 30, 90);
      });
      const cnt = (pos) => club.squad.filter((id) => state.players[id].primaryPosition === pos).length;
      const need = []; for (let k = cnt('POR'); k < 2; k++) need.push('POR');            // el roster ya trae ~24; sólo se completa si falta gente o un portero
      const missing = Math.max(0, 22 - club.squad.length - need.length); const tmpl = SQUAD_TEMPLATE.filter((q) => q !== 'POR'); for (let k = 0; k < missing; k++) need.push(tmpl[k % tmpl.length]);
      const baseOvr = 40 + club.reputation * (club.foreign ? 0.59 : 0.4);
      need.forEach((pos) => {
        const p = TLM.makePlayer(state, { pos, ovr: baseOvr + r.gauss() * 3.6, age: clamp(round(26 + r.gauss() * 4), 18, 36), _used: used, nationHome: club.nation });
        TLM.moveToClub(state, p.id, club.id, { salary: 0, endSeason: state.season + r.int(1, 4) });
      });
      return;
    }
    const baseOvr = 40 + club.reputation * 0.42;
    const seed = cfg.seedNames || [];
    const template = SQUAD_TEMPLATE.slice();
    if (r.chance(0.5)) template.push(r.pick(['DFC', 'MC', 'DC', 'MCD']));
    template.forEach((pos, i) => {
      const starter = i % 2 === 0;
      const ovr = baseOvr + (starter ? 3 : -3) + r.gauss() * 3.6;
      const p = TLM.makePlayer(state, { pos, ovr, age: clamp(round(26 + r.gauss() * 4), 18, 36), _used: used, nationHome: club.nation });
      TLM.moveToClub(state, p.id, club.id, { salary: 0, endSeason: state.season + r.int(1, 4) });
      p.morale = clamp(round(60 + r.gauss() * 6), 30, 90);
    });
    // Los clubes preexistentes del motor conservan los nombres de su once histórico (misma identidad, ahora con ID global).
    const xiSlots = seed.length ? club.squad.map((id) => state.players[id]).filter((p) => p.primaryPosition) : [];
    if (seed.length) {
      const order = ['POR', 'LI', 'DFC', 'DFC', 'LD', 'MC', 'MCD', 'MC', 'EI', 'DC', 'ED'], taken = new Set();
      order.forEach((pos, i) => {
        const p = xiSlots.filter((x) => !taken.has(x.id) && x.primaryPosition === pos).sort((a, b) => b.overall - a.overall)[0];
        if (p && seed[i]) { taken.add(p.id); used.delete(p.canonicalName); p.canonicalName = seed[i]; used.add(seed[i]); }
      });
    }
  }

  // Estado de carrera nuevo. opts: {seed, totalClubs (incl. usuario), userClub|takeClub, worldConfig}
  function createWorld(opts) {
    opts = opts || {};
    const cfg = opts.worldConfig || TLM.WORLD_CONFIG;
    const state = {
      version: 1, rosterV: (TLM.ROSTER && TLM.ROSTER.version) || 0, id: 'career_' + (opts.seed || Date.now()), seed: (opts.seed || Date.now()) >>> 0, rngState: (opts.seed || Date.now()) >>> 0,
      settings: { rounds: cfg.format.rounds, name: cfg.name }, currentClubId: null, season: cfg.startYear, currentMatchday: 1,
      counters: {}, clubs: {}, players: {}, competitions: {}, fixtures: {},
      market: { listings: {}, offers: {}, freeAgents: [] }, transfers: [], news: [], history: { seasons: [], records: {} },
      scoutReports: {}, matchRecords: {}, scout: { usedThisRound: 0 }, worldConfigId: cfg.id, log: [],
      specialCards: {}, cardListings: {}, cardSeq: 0,
    };
    const r = R(state), used = new Set();
    const wantTotal = Math.max(3, Math.min(opts.totalClubs || cfg.clubs.length + 1, 40));
    const hasUserNew = !!opts.userClub;
    const aiCount = wantTotal - (hasUserNew ? 1 : 0);
    // clubes IA: primero los de la configuración; si hace falta más, se generan clubes procedurales.
    const cfgs = cfg.clubs.slice(0, aiCount);
    for (let i = cfg.clubs.length; cfgs.length < aiCount; i++) cfgs.push(genClubConfig(state, i, used));
    const profiles = Object.keys(TLM.AI_PROFILES);
    cfgs.forEach((c) => {
      const club = newClub(state, Object.assign({ base: true }, c, { balance: startingBalance(c.rep), profile: c.profile || r.pick(profiles) }));
      const f = r.pick(TLM.AI_PROFILES[club.aiProfile].formations); club.tactics.formation = f;
      applyProfileTactics(club);
      fillSquad(state, club, c, used);
    });
    const comp = TLM.createCompetition(state, { id: cfg.id, name: cfg.name, country: cfg.country, crest: cfg.crest, teams: Object.keys(state.clubs), format: cfg.format });
    if (hasUserNew) {
      const u = opts.userClub;
      const club = newClub(state, { name: u.name, shortName: u.shortName, crest: u.crest || null, primaryColor: u.primaryColor, secondaryColor: u.secondaryColor,
        stadium: u.stadium, nation: u.nation || 'peronia', capacity: clamp(round(u.capacity || 12000), 5000, 25000), rep: TLM.DEFAULTS.userStartReputation, balance: TLM.DEFAULTS.userStartBudget, controlledBy: 'user', profile: 'balanced' });
      comp.teams.push(club.id); comp.leagueSize = comp.teams.length;
      state.currentClubId = club.id;
    } else {
      const eligible = Object.values(state.clubs).filter((cl) => !TLM.isClubBlocked(cl.name));
      const wanted = opts.takeClub != null ? Object.values(state.clubs)[opts.takeClub] : null;
      const pick = (wanted && !TLM.isClubBlocked(wanted.name)) ? wanted : eligible.sort((a, b) => a.reputation - b.reputation)[Math.floor(eligible.length / 2)];
      pick.controlledBy = 'user'; state.currentClubId = pick.id;
    }
    // agentes libres + jugadores en venta
    const fa = TLM.DEFAULTS.freeAgents;
    let made = 0;
    const rbf = TLM.rosterByClub && TLM.rosterByClub(), free = (rbf && rbf['']) || [];
    free.forEach((e) => {                                              // agentes libres del roster fijo (con retrato)
      const p = TLM.makeFromRoster(state, e, used);
      p.contract = { clubId: null, salary: 0, endSeason: 0, status: 'free' };
      state.market.freeAgents.push(p.id); made++;
    });
    for (let k = free.filter((e) => e.p === 'POR').length; k < 6; k++, made++) {              // siempre hay porteros libres para armar el once
      const p = TLM.makePlayer(state, { pos: 'POR', ovr: clamp(56 + r.gauss() * 5, 44, 70), age: clamp(round(27 + r.gauss() * 5), 19, 37), _used: used });
      p.contract = { clubId: null, salary: 0, endSeason: 0, status: 'free' };
      state.market.freeAgents.push(p.id);
    }
    for (let i = made; i < fa; i++) {
      const pos = i < 6 ? 'POR' : r.pick(TLM.POSITIONS.filter((p) => p !== 'POR')); // siempre hay porteros libres para armar el once
      const p = TLM.makePlayer(state, { pos, ovr: clamp(58 + r.gauss() * 6.5, 44, 74), age: clamp(round(27 + r.gauss() * 5), 18, 37), _used: used });
      p.contract = { clubId: null, salary: 0, endSeason: 0, status: 'free' };
      state.market.freeAgents.push(p.id);
    }
    TLM.generateSeason(state, comp);
    for (const c of Object.values(state.clubs)) { TLM.autoLineup(state, c); }
    TLM.refreshListings(state);
    addNews(state, 'season', `Arranca la temporada ${seasonLabel(state)} de la ${cfg.name} con ${comp.teams.length} equipos.`);
    return state;
  }

  function genClubConfig(state, i, used) {
    const r = R(state), N = TLM.NAMES;
    let name, tries = 0;
    do { name = r.pick(N.clubA) + ' ' + r.pick(N.clubB); } while (used.has('c:' + name) && tries++ < 30);
    used.add('c:' + name);
    const rep = clamp(round(r.range(40, 66)), 30, 90);
    const hue = r.int(0, 359), col = (h, l) => hslHex(h, 60, l);
    return { name, shortName: name.split(' ').map((w) => w[0]).join('').padEnd(3, 'X').slice(0, 3), crest: null, primaryColor: col(hue, 38), secondaryColor: col((hue + 180) % 360, 88),
      nation: g.LFONations ? r.pick(g.LFONations.list).id : null, stadium: r.pick(N.stadiums) + ' ' + name.split(' ')[1], capacity: round(r.range(12000, 30000) / 1000) * 1000, rep, profile: r.pick(Object.keys(TLM.AI_PROFILES)) };
  }
  function hslHex(h, s, l) {
    s /= 100; l /= 100; const a = s * Math.min(l, 1 - l), f = (n) => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1))))).toString(16).padStart(2, '0'); };
    return '#' + f(0) + f(8) + f(4);
  }

  function applyProfileTactics(club) {
    const pr = TLM.AI_PROFILES[club.aiProfile] || TLM.AI_PROFILES.balanced;
    Object.assign(club.tactics, { mentality: pr.mentality, buildUp: pr.buildUp, pressing: pr.pressing, width: pr.width, tempo: pr.tempo, line: pr.line });
  }

  const seasonLabel = (state) => state.season + '/' + String((state.season + 1) % 100).padStart(2, '0');

  // ---- noticias (plantillas deterministas; la capa completa vive en tlm-news.js) ----
  function addNews(state, kind, text, meta) {
    const n = { id: nextId(state, 'news', 'news'), season: state.season, round: state.currentMatchday, kind, text, meta: meta || null };
    state.news.unshift(n);
    if (state.news.length > 250) state.news.length = 250;
    return n;
  }

  // ---- FINANZAS ----
  function addTx(state, club, type, amount, desc, ref) {
    if (!amount) return;
    club.finances.balance += amount;
    if (amount > 0) club.finances.seasonIncome += amount; else club.finances.seasonExpense += -amount;
    const led = club.finances.ledger;
    led.unshift({ season: state.season, round: state.currentMatchday, type, amount: Math.round(amount), desc, ref: ref || null, balance: Math.round(club.finances.balance) });
    if (led.length > 160) led.length = 160;
  }
  const wageBill = (state, club) => club.squad.reduce((s, id) => s + state.players[id].contract.salary, 0);
  const wagePerRound = (state, club) => wageBill(state, club) / Math.max(1, TLM.totalRounds(state.competitions[state.worldConfigId]) || 30);
  const maintenancePerRound = (club) => club.stadium.capacity * 6 * (1 + (club.stadium.level - 1) * 0.12);
  const baseIncomePerRound = (club) => Math.pow(club.reputation / 100, 2) * 400000;

  function attendance(state, club, opp, formPts) {
    const fill = clamp(0.42 + club.reputation / 200 + (formPts || 0) * 0.02 + opp.reputation / 500 - (club.finances.balance < 0 ? 0.08 : 0), 0.3, 1);
    return round(club.stadium.capacity * fill);
  }
  const ticketPrice = (club) => club.finances.ticketPrice * (1 + (club.reputation - 50) / 200) * (1 + (club.stadium.level - 1) * 0.08);

  // Cobros de la jornada para un club: salarios + mantenimiento (siempre) + TV/base (siempre); entradas sólo local (las cobra applyMatchResult).
  function roundAccounting(state, club) {
    addTx(state, club, 'salary', -wagePerRound(state, club), 'Salarios de la jornada');
    addTx(state, club, 'maintenance', -maintenancePerRound(club), 'Mantenimiento del estadio');
    addTx(state, club, 'tv', baseIncomePerRound(club), 'Derechos y patrocinio');
    // consecuencias de gastar de más
    if (club.finances.balance < 0) {
      club.finances.debtRounds++;
      club.squad.forEach((id) => { const p = state.players[id]; p.morale = clamp(p.morale - (club.finances.debtRounds > 2 ? 2 : 1), 0, 100); });
      club.reputation = clamp(club.reputation - 0.15, 1, 100);
    } else club.finances.debtRounds = 0;
  }

  function financeStatus(state, club) {
    const wb = wageBill(state, club);
    if (club.finances.balance < -Math.max(2e6, wb * 0.5)) return 'crisis';
    if (club.finances.balance < 0) return 'warning';
    return 'ok';
  }
  const canSpend = (club, amount) => club.finances.balance - amount >= 0;

  function projection(state, club, rounds) {
    const n = rounds || 5, comp = state.competitions[state.worldConfigId];
    const cur = TLM.currentRound(state, comp) || 1;
    let bal = club.finances.balance, inc = 0, exp = 0;
    for (let i = 0; i < n; i++) {
      const fx = TLM.fixturesOf(state, comp, cur + i).find((f) => f.homeId === club.id || f.awayId === club.id);
      if (!fx && cur + i > comp.calendar.length) break;
      let inR = baseIncomePerRound(club), exR = wagePerRound(state, club) + maintenancePerRound(club);
      if (fx && fx.homeId === club.id) inR += attendance(state, club, state.clubs[fx.awayId], 0) * ticketPrice(club);
      inc += inR; exp += exR; bal += inR - exR;
    }
    return { rounds: n, income: Math.round(inc), expense: Math.round(exp), balance: Math.round(bal) };
  }

  function upgradeStadium(state, club) {
    const next = TLM.DEFAULTS.stadiumLevels[club.stadium.level]; // índice = nivel actual → siguiente
    if (!next) return { ok: false, reason: 'Nivel máximo' };
    if (!canSpend(club, next.cost)) return { ok: false, reason: 'Saldo insuficiente (' + TLM.money(next.cost) + ')' };
    addTx(state, club, 'stadium', -next.cost, 'Ampliación del estadio a nivel ' + next.level);
    club.stadium.level = next.level; club.stadium.capacity += next.add;
    club.reputation = clamp(club.reputation + 0.5, 1, 100);
    addNews(state, 'club', `${club.name} amplía su estadio: ahora tiene capacidad para ${club.stadium.capacity.toLocaleString('es-AR')} espectadores.`, { clubId: club.id });
    return { ok: true, next };
  }
  const stadiumUpgradeInfo = (club) => TLM.DEFAULTS.stadiumLevels[club.stadium.level] || null;

  function setTraining(state, club, individual, team) {
    if (individual && TLM.TRAINING.individual.some((t) => t[0] === individual)) club.training.individual = individual;
    if (team && TLM.TRAINING.team.some((t) => t[0] === team)) { if (team !== club.training.team) club.training.teamBoost = 0; club.training.team = team; }
    return club.training;
  }

  // Edición del club (nombre, colores, escudo, estadio). NO permite tocar jugadores.
  function editClub(state, clubId, patch) {
    const c = state.clubs[clubId]; if (!c) throw new Error('Club inexistente');
    const hex = (v, d) => (/^#[0-9a-f]{6}$/i.test(v || '') ? v : d);
    if (patch.name) c.name = String(patch.name).slice(0, 32);
    if (patch.shortName) c.shortName = String(patch.shortName).toUpperCase().slice(0, 4);
    if (patch.primaryColor) c.primaryColor = hex(patch.primaryColor, c.primaryColor);
    if (patch.secondaryColor) c.secondaryColor = hex(patch.secondaryColor, c.secondaryColor);
    if (patch.crest !== undefined) c.crest = patch.crest;
    if (patch.stadium) c.stadium.name = String(patch.stadium).slice(0, 40);
    if (patch.capacity && c.controlledBy === 'user' && !c.history.seasons.length) c.stadium.capacity = clamp(round(patch.capacity), 5000, 25000);
    return c;
  }

  Object.assign(TLM, { newClub, createWorld, applyProfileTactics, seasonLabel, addNews, addTx, wageBill, wagePerRound, maintenancePerRound, baseIncomePerRound, attendance, ticketPrice,
    roundAccounting, financeStatus, canSpend, projection, upgradeStadium, stadiumUpgradeInfo, setTraining, editClub, startingBalance, SQUAD_TEMPLATE, fillSquad, profilesOf: () => Object.keys(TLM.AI_PROFILES) });
})(typeof globalThis !== 'undefined' ? globalThis : this);

}

// ---- tlm-tactics.js
{
/* LFO MANAGER — TÁCTICA: alineación (XI + banquillo por hueco de formación), fuerza de equipo, plan de partido,
   ManagerMatchConfig (lo que consume el motor) y análisis del rival con datos reales (nunca inventa). */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { clamp, round, avg, R } = TLM;

  const ORDER = [0, 9, 8, 10, 1, 4, 2, 3, 5, 6, 7]; // GK primero, luego los huecos más escasos/definidos

  function slotScore(p, slotPos, prefer) {
    const c = TLM.compat(slotPos, p.primaryPosition, p.secondaryPositions);
    const fit = 0.86 + 0.14 * (p.fitness / 100);
    const form = 1 + (p.form - 50) / 500;
    return p.overall * c * fit * form + (prefer ? 2.5 : 0);
  }

  // Elige el mejor XI disponible para una formación. `prefer` = ids ya alineados (estabilidad del once).
  function pickXI(state, club, formation, prefer) {
    const slots = TLM.FORMATIONS[formation] || TLM.FORMATIONS['4-3-3'];
    const pool = club.squad.map((id) => state.players[id]).filter(TLM.isAvailable);
    const xi = Array(11).fill(null), used = new Set();
    for (const i of ORDER) {
      let best = null, bs = -1;
      for (const p of pool) {
        if (used.has(p.id)) continue;
        if ((slots[i] === 'POR') !== (p.primaryPosition === 'POR')) continue; // el arquero sólo va al arco y viceversa
        const s = slotScore(p, slots[i], prefer && prefer.includes(p.id));
        if (s > bs) { bs = s; best = p; }
      }
      if (best) { xi[i] = best.id; used.add(best.id); }
    }
    return xi;
  }

  function pickBench(state, club, xi, max) {
    max = max || TLM.DEFAULTS.maxBench;
    const inXI = new Set(xi.filter(Boolean));
    const rest = club.squad.map((id) => state.players[id]).filter((p) => TLM.isAvailable(p) && !inXI.has(p.id)).sort((a, b) => b.overall - a.overall);
    const bench = [];
    const take = (fn) => { const p = rest.find((x) => !bench.includes(x.id) && fn(x)); if (p) bench.push(p.id); };
    take((p) => p.primaryPosition === 'POR');
    take((p) => TLM.roleOf(p.primaryPosition) === 'DEF'); take((p) => TLM.roleOf(p.primaryPosition) === 'MID'); take((p) => TLM.roleOf(p.primaryPosition) === 'FWD');
    for (const p of rest) { if (bench.length >= max) break; if (!bench.includes(p.id) && p.primaryPosition !== 'POR') bench.push(p.id); }
    return bench.slice(0, max);
  }

  function autoLineup(state, club, formation) {
    if (formation) club.tactics.formation = formation;
    const f = club.tactics.formation;
    club.lineup.xi = pickXI(state, club, f, club.lineup.xi.filter(Boolean));
    club.lineup.bench = pickBench(state, club, club.lineup.xi);
    return club.lineup;
  }

  // Valida el once manual: quita a los no disponibles/ajenos y rellena esos huecos con el mejor disponible.
  function repairLineup(state, club) {
    const f = club.tactics.formation, slots = TLM.FORMATIONS[f];
    const ok = (id) => id && state.players[id] && state.players[id].clubId === club.id && TLM.isAvailable(state.players[id]);
    const seen = new Set();
    club.lineup.xi = club.lineup.xi.map((id) => { if (ok(id) && !seen.has(id)) { seen.add(id); return id; } return null; });
    if (club.lineup.xi.some((x) => !x)) {
      const auto = pickXI(state, club, f, club.lineup.xi.filter(Boolean));
      club.lineup.xi = club.lineup.xi.map((id, i) => id || (auto[i] && !seen.has(auto[i]) ? (seen.add(auto[i]), auto[i]) : null));
      // un jugador del auto puede ya estar en otro hueco: se completa con quien reste
      const pool = club.squad.map((id) => state.players[id]).filter((p) => TLM.isAvailable(p) && !seen.has(p.id));
      club.lineup.xi = club.lineup.xi.map((id, i) => {
        if (id) return id;
        const cand = pool.filter((p) => (slots[i] === 'POR') === (p.primaryPosition === 'POR')).sort((a, b) => slotScore(b, slots[i]) - slotScore(a, slots[i]))[0];
        if (cand) { seen.add(cand.id); pool.splice(pool.indexOf(cand), 1); return cand.id; }
        return null;
      });
    }
    club.lineup.bench = club.lineup.bench.filter((id) => ok(id) && !seen.has(id));
    if (club.lineup.bench.length < Math.min(TLM.DEFAULTS.maxBench, club.squad.length - 11)) {
      const extra = pickBench(state, club, club.lineup.xi).filter((id) => !club.lineup.bench.includes(id));
      club.lineup.bench = club.lineup.bench.concat(extra).slice(0, TLM.DEFAULTS.maxBench);
    }
    return club.lineup;
  }

  function setFormation(state, club, formation) {
    if (!TLM.FORMATIONS[formation]) return false;
    const prev = club.lineup.xi.filter(Boolean);
    club.tactics.formation = formation;
    club.lineup.xi = pickXI(state, club, formation, prev);
    club.lineup.bench = pickBench(state, club, club.lineup.xi);
    return true;
  }

  // Intercambia dos jugadores entre huecos/banquillo (uso del editor visual). ref = {xi:i} | {bench:i}
  function swapLineup(state, club, a, b) {
    const get = (r) => (r.xi != null ? club.lineup.xi[r.xi] : club.lineup.bench[r.bench]);
    const set = (r, v) => { if (r.xi != null) club.lineup.xi[r.xi] = v; else club.lineup.bench[r.bench] = v; };
    const va = get(a), vb = get(b);
    set(a, vb); set(b, va);
    club.lineup.bench = club.lineup.bench.filter(Boolean);
    club.lineupMode = 'manual';
    return club.lineup;
  }

  // ---- fuerza del equipo por líneas (con stats efectivos: moral, forma, entrenamiento) ----
  function lineRatings(state, club, xi) {
    xi = xi || club.lineup.xi;
    const slots = TLM.FORMATIONS[club.tactics.formation], parts = { atk: [], mid: [], def: [], gk: [] };
    xi.forEach((id, i) => {
      if (!id) { parts[i === 0 ? 'gk' : i < 5 ? 'def' : i < 8 ? 'mid' : 'atk'].push(38); return; }
      const p = state.players[id], s = TLM.effectiveStats(p, club), c = TLM.compat(slots[i], p.primaryPosition, p.secondaryPositions);
      const fit = 0.9 + 0.1 * (p.fitness / 100);
      const fam = TLM.FAMILY[slots[i]];
      const A = (s.shooting * 0.34 + s.dribbling * 0.24 + s.speed * 0.16 + s.passing * 0.14 + s.acceleration * 0.12) * c * fit;
      const M = (s.passing * 0.32 + s.intelligence * 0.24 + s.dribbling * 0.16 + s.physical * 0.14 + s.defense * 0.14) * c * fit;
      const D = (s.defense * 0.44 + s.physical * 0.2 + s.speed * 0.12 + s.intelligence * 0.16 + s.passing * 0.08) * c * fit;
      if (fam === 'gk') parts.gk.push((s.defense * 0.5 + s.intelligence * 0.25 + s.physical * 0.15 + s.acceleration * 0.1) * c * fit);
      else if (fam === 'cb' || fam === 'wb') { parts.def.push(D); if (fam === 'wb') parts.mid.push(M * 0.7); }
      else if (fam === 'dm') { parts.def.push(D * 0.7); parts.mid.push(M); }
      else if (fam === 'cm' || fam === 'wm') { parts.mid.push(M); parts.atk.push(A * 0.55); }
      else if (fam === 'am') { parts.mid.push(M * 0.8); parts.atk.push(A); }
      else parts.atk.push(A);
    });
    const r = { attack: avg(parts.atk), midfield: avg(parts.mid), defense: avg(parts.def), gk: avg(parts.gk) };
    r.overall = r.attack * 0.3 + r.midfield * 0.28 + r.defense * 0.28 + r.gk * 0.14;
    return r;
  }

  // ---- táctica del manager → parche de diales del motor (sólo diales que el motor usa) ----
  function toEnginePatch(t) {
    const M = TLM.ENGINE_MAP, out = {};
    out.mentality = M.mentality[t.mentality] || 'balanced';
    out.pressing = M.pressing[t.pressing] || 'medium';
    out.tempo = M.tempo[t.tempo] || 'normal';
    out.defensiveLine = M.line[t.line] || 'normal';
    out.attackingWidth = t.width === 'wide' ? 'wide' : t.width === 'narrow' ? 'narrow' : 'balanced';
    out.defensiveWidth = t.width === 'wide' ? 'wide' : t.width === 'narrow' ? 'narrow' : 'balanced';
    switch (t.buildUp) {
      case 'possession': Object.assign(out, { buildUp: 'short', passingRisk: 'safe', counterAttack: 'rare', longBallFrequency: 'rare' }); break;
      case 'direct': Object.assign(out, { buildUp: 'direct', longBallFrequency: 'frequent', counterAttack: 'situational' }); break;
      case 'counter': Object.assign(out, { buildUp: 'direct', counterAttack: 'frequent', longBallFrequency: 'frequent', attackingPlayers: 'minimal' }); break;
      default: Object.assign(out, { buildUp: 'mixed', passingRisk: 'balanced', counterAttack: 'situational', longBallFrequency: 'normal' });
    }
    return out;
  }

  // Plan de partido → lista de reglas {id, when, then}. Se traduce a triggers del motor (evaluateTriggers ya existente).
  const PLAN_WIN = { keep: null, protect: { mentality: 'defensive', tempo: 'slower', pressing: 'low', defensiveLine: 'deep', passingRisk: 'safe', shotRisk: 'conservative', timeWasting: 'on' }, control: { mentality: 'balanced', tempo: 'slower', buildUp: 'short', passingRisk: 'safe', counterAttack: 'rare' } };
  const PLAN_LOSE = { keep: null, push: { mentality: 'attacking', pressing: 'high', tempo: 'faster', defensiveLine: 'high' }, allout: { mentality: 'veryAttacking', pressing: 'allOut', defensiveLine: 'veryHigh', attackingPlayers: 'maximal', shotRisk: 'eager', passingRisk: 'risky' } };
  const PLAN_MIN = { keep: null, chase: { mentality: 'attacking', pressing: 'high' }, hold: { tempo: 'slower', defensiveLine: 'deep', passingRisk: 'safe' } };
  function planRules(plan) {
    const rules = [];
    if (PLAN_WIN[plan.ifWinning]) rules.push({ id: 'plan_win', kind: 'winning', minute: 0, then: PLAN_WIN[plan.ifWinning] });
    if (PLAN_LOSE[plan.ifLosing]) rules.push({ id: 'plan_lose', kind: 'losing', minute: 0, then: PLAN_LOSE[plan.ifLosing] });
    const fm = plan.fromMinute;
    if (fm && fm.mode === 'chase') rules.push({ id: 'plan_min_chase', kind: 'notWinning', minute: fm.minute, then: PLAN_MIN.chase });
    if (fm && fm.mode === 'hold') rules.push({ id: 'plan_min_hold', kind: 'winning', minute: fm.minute, then: PLAN_MIN.hold });
    return rules;
  }
  const PLAN_LABELS = {
    ifWinning: [['keep', 'Mantener'], ['protect', 'Proteger ventaja'], ['control', 'Controlar con la pelota']],
    ifLosing: [['keep', 'Mantener'], ['push', 'Adelantar líneas'], ['allout', 'Todo al ataque']],
    fromMinute: [['keep', 'Sin cambios'], ['chase', 'Buscar el gol si no ganamos'], ['hold', 'Cerrar el partido si ganamos']],
  };

  const INSTR = {
    FWD: [['', 'Sin instrucción'], ['false9', 'Falso 9'], ['target', 'Referencia'], ['attack', 'Profundidad']],
    MID: [['', 'Sin instrucción'], ['attack', 'Llegar al área'], ['roam', 'Libre'], ['hold', 'Cubrir']],
    WIDE: [['', 'Sin instrucción'], ['wide', 'Pegado a la banda'], ['inside', 'Cerrarse'], ['attack', 'Profundidad']],
  };
  function instructionOptions(pos) { return ['EI', 'ED', 'MI', 'MD'].includes(pos) ? INSTR.WIDE : TLM.roleOf(pos) === 'FWD' ? INSTR.FWD : TLM.roleOf(pos) === 'MID' ? INSTR.MID : null; }

  // Datos de la carta (mismo jugador global, con su edición y los colores de su club) para el sistema de cartas existente.
  // Los porteros no llevan la camiseta titular: se elige un color de portero que se distinga de los dos colores del club.
  const GK_KITS = ['#e8a33a', '#3aa76d', '#7b5cd6', '#d8563f', '#2fa4c9', '#d94fa0'];
  function hexRgb(h) { const n = parseInt(String(h).replace('#', '').padEnd(6, '0').slice(0, 6), 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function colorDist(a, b) { const x = hexRgb(a), y = hexRgb(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); }
  function gkKit(club, p) {
    const avoid = club ? [club.primaryColor, club.secondaryColor] : [];
    const start = Math.floor(TLM.hash01('gkkit', p.id) * GK_KITS.length) % GK_KITS.length;
    for (let i = 0; i < GK_KITS.length; i++) { const c = GK_KITS[(start + i) % GK_KITS.length]; if (avoid.every((a) => colorDist(a, c) > 110)) return c; }
    return GK_KITS[start];
  }
  // Aspecto extra de la carta (cortes, barbas, accesorios, poses del módulo cardlook.js). Determinista por jugador: no consume el RNG del mundo.
  const LOOK = {
    hair: ['mohicano', 'afro', 'rulos', 'trenzas', 'rastas', 'melena', 'colita', 'mono', 'rodete', 'flequillo', 'jopo', 'undercut', 'degradado', 'engominado', 'raya', 'puas', 'media', 'taza', 'trencitas', 'corona', 'buzz', 'crop', 'librito', 'mullet', 'texturizado', 'cresta', 'edgar', 'rulosfade', 'brocoli', 'twists', 'manbun', 'mediacola', 'disenio', 'hightop', 'crop', 'texturizado', 'buzz', 'degradado'],
    beard: ['completa', 'corta', 'sombra', 'larga', 'vikinga', 'canosa', 'desprolija', 'candado', 'perilla', 'chivera', 'chivo', 'mosca', 'herradura', 'anclada', 'bigote', 'manubrio', 'fumanchu', 'mostacho', 'patillas', 'chuletas'],
    acc: ['vincha', 'vinchaancha', 'bandana', 'gorrolana', 'munequera', 'cadena', 'aros', 'snood', 'mascaranariz', 'pinturaojos', 'rodillera', 'mangalarga'],
    pose: ['cruzado', 'cintura', 'patada', 'cabezazo', 'punos', 'saludo', 'rodilla', 'gambeta', 'escudo'],
  };
  function lookOf(p) {
    const h = (k) => TLM.hash01('look', k, p.id), pick = (arr, k) => arr[Math.floor(h(k) * arr.length) % arr.length];
    const out = { hairStyle: p.card.hairStyle, beard: 'ninguna', acc: [], pose: p.card.pose };
    if (p.card.look) { out.hairStyle = p.card.look.hairStyle || out.hairStyle; out.beard = p.card.look.beard || 'ninguna'; out.acc = (p.card.look.acc || []).slice(); if (h('a3') < 0.05) out.acc.push('brazalete'); if (p.primaryPosition === 'POR' && h('p') < 0.5) out.pose = 'atajada'; return out; }   // aspecto fijo del roster: se parece a la foto
    if (h('h') < 0.6) out.hairStyle = pick(LOOK.hair, 'h2');
    if (h('b') < 0.34) out.beard = pick(LOOK.beard, 'b2');
    if (h('a') < 0.16) out.acc = [pick(LOOK.acc, 'a2')];
    if (h('a3') < 0.05) out.acc.push('brazalete');
    if (p.primaryPosition === 'POR' && h('p') < 0.5) out.pose = 'atajada';
    else if (p.card.pose === 'retrato' && h('p') < 0.3) out.pose = pick(LOOK.pose, 'p2');
    return out;
  }
  function cardData(state, p) {
    const club = p.clubId ? state.clubs[p.clubId] : null;
    const gk = p.primaryPosition === 'POR', lk = lookOf(p);
    return { edition: p.card.edition, stars: p.card.stars, year: state.season, foot: p.card.foot, height: p.card.height, build: p.card.build, skin: p.card.skin, hair: p.card.hair, hairStyle: lk.hairStyle, beard: lk.beard, acc: lk.acc,
      pose: lk.pose, angle: p.card.angle, position: p.primaryPosition, club: club ? club.name : 'Agente libre', country: p.nationality, photo: p.card.photo || null, photoDy: p.card.photoDy || 0, crest: club && TLM.crestURL ? TLM.crestURL(club) : '', flag: (g.LFONations && g.LFONations.flag(p.nationality)) || '', beardColor: p.card.hair, kit: gk ? gkKit(club, p) : club ? club.primaryColor : '#e7dfc5', accent: club ? club.secondaryColor : '#285f75' };
  }
  function playerPayload(state, club, p, slotIdx, slots) {
    const eff = TLM.effectiveStats(p, club);
    return {
      pid: p.id, name: shortName(p.canonicalName), fullName: p.canonicalName, number: p.number, slot: slotIdx, pos: slotIdx != null ? slots[slotIdx] : p.primaryPosition, primaryPosition: p.primaryPosition,
      role: TLM.roleOf(p.primaryPosition), stats: eff, personality: Object.assign({}, p.personality), heightM: p.card.height / 100, stamina: clamp(round(42 + p.fitness * 0.58), 30, 100),
      overall: p.overall, edition: p.card.edition, card: cardData(state, p),
      morale: p.morale, form: p.form,
    };
  }
  function shortName(n) { const parts = String(n).trim().split(/\s+/); return parts.length > 1 ? parts[0][0] + '. ' + parts.slice(1).join(' ') : n; }

  // ManagerMatchConfig de UN club (el partido se arma con dos).
  // Camiseta: patrón determinista por club y camiseta de arquero contrastada con ambos equipos.
  const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const cdist = (a, b) => { const x = hexRGB(a), y = hexRGB(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
  function pickGkColor(club, opp) {
    const pool = ['#1fa971', '#f2c94c', '#e2725b', '#7a5cff', '#20b8d6', '#ff7ab0'];
    let best = pool[0], bs = -1;
    for (const c of pool) { const sc = Math.min(cdist(c, club.primaryColor), opp ? cdist(c, opp.primaryColor) : 999, cdist(c, club.secondaryColor) * 0.8); if (sc > bs) { bs = sc; best = c; } }
    return best;
  }
  // Diseño de camiseta: el del club (tlm-data) o, en partidas viejas / clubes creados, uno fijo según el nombre (kits.js).
  const KIT_BY_NAME = {};
  [...((TLM.WORLD_CONFIG && TLM.WORLD_CONFIG.clubs) || []), ...(TLM.GUEST_CLUBS || [])].forEach((c) => { if (c.kitPattern) KIT_BY_NAME[c.name] = c.kitPattern; });
  const kitPattern = (club) => {
    if (club.kitPattern) return club.kitPattern;
    const ids = (g.LFOKits && g.LFOKits.ids) || ['stripes', 'band', 'sash', 'plain'];
    return KIT_BY_NAME[club.name] || ids[Math.floor(TLM.hash01(club.id, 'kit') * ids.length) % ids.length];
  };
  function sideConfig(state, club, instructions, opp) {
    repairLineup(state, club);
    const f = club.tactics.formation, slots = TLM.FORMATIONS[f];
    const xi = club.lineup.xi.map((id, i) => (id ? playerPayload(state, club, state.players[id], i, slots) : null));
    const bench = club.lineup.bench.map((id) => playerPayload(state, club, state.players[id], null, slots));
    return {
      clubId: club.id, name: club.name, shortName: club.shortName, color: club.primaryColor, colorAlt: club.secondaryColor, crest: club.crest, controlledBy: club.controlledBy, kitPattern: kitPattern(club), gkColor: pickGkColor(club, opp),
      formation: f, mentality: club.tactics.mentality, buildUpStyle: club.tactics.buildUp, pressing: club.tactics.pressing, width: club.tactics.width, tempo: club.tactics.tempo, defensiveLine: club.tactics.line,
      enginePatch: toEnginePatch(club.tactics), matchPlan: TLM.clone(club.plan), planRules: planRules(club.plan),
      startingXI: xi, bench, playerInstructions: Object.assign({}, instructions || club.instructions || {}), substitutions: [], tacticalChanges: [], stadium: club.stadium.name,
    };
  }
  function buildMatchConfig(state, fixture) {
    if (TLM.primeCardContext) TLM.primeCardContext(state, fixture);
    const home = state.clubs[fixture.homeId], away = state.clubs[fixture.awayId];
    const lab = TLM.fixtureLabel ? TLM.fixtureLabel(state, fixture) : null;
    return { fixtureId: fixture.id, homeClubId: home.id, awayClubId: away.id, season: state.season, round: fixture.round, competition: state.competitions[fixture.competitionId].name, seed: (state.seed + fixture.round * 977 + state.transfers.length + (fixture.cup ? 5003 : 0)) >>> 0,
      roundLabel: lab ? lab.round : 'Jornada ' + fixture.round, cup: fixture.cup ? { id: fixture.cup.id, roundName: fixture.cup.roundName, pkg: lab.pkg } : null,
      home: sideConfig(state, home, null, away), away: sideConfig(state, away, null, home), stadium: home.stadium.name };
  }
  // Un once incompleto (usuario sin jugadores suficientes) no puede jugar.
  function lineupProblems(state, club) {
    repairLineup(state, club);
    const p = [];
    const n = club.lineup.xi.filter(Boolean).length;
    if (n < 11) p.push(`Tu once tiene ${n}/11 jugadores: fichá ${11 - n} más en el mercado.`);
    if (club.lineup.xi[0] && state.players[club.lineup.xi[0]].primaryPosition !== 'POR') p.push('Falta un portero.');
    return p;
  }

  // ---- Análisis del rival: sólo datos reales del universo (resultados, plantilla pública, observaciones de partidos) ----
  function rivalReport(state, comp, rivalId, observerId) {
    const rv = state.clubs[rivalId];
    const res = TLM.recentResults(state, comp, rivalId, 5), table = TLM.computeTable(state, comp);
    const row = table.find((x) => x.clubId === rivalId);
    const lr = lineRatings(state, rv);
    const notes = [];
    const key = rv.squad.map((id) => state.players[id]).filter((p) => TLM.isAvailable(p)).sort((a, b) => b.overall - a.overall).slice(0, 3).map((p) => ({ pid: p.id, name: p.canonicalName, pos: p.primaryPosition, ovr: p.overall, goals: p.seasonStats.goals }));
    const scorers = rv.squad.map((id) => state.players[id]).sort((a, b) => b.seasonStats.goals - a.seasonStats.goals).filter((p) => p.seasonStats.goals >= 3).slice(0, 2);
    const obs = rv.observed, tot = obs.channels.left + obs.channels.center + obs.channels.right;
    let tendency = null;
    if (obs.matches >= 3 && tot >= 12) {
      const L = obs.channels.left / tot, C = obs.channels.center / tot, Rr = obs.channels.right / tot;
      if (Rr > 0.42) notes.push('Ataca principalmente por la banda derecha.'); else if (L > 0.42) notes.push('Ataca principalmente por la banda izquierda.'); else if (C > 0.46) notes.push('Ataca sobre todo por el centro.');
      tendency = { left: L, center: C, right: Rr };
    } else notes.push('Datos insuficientes sobre por dónde ataca (menos de 3 partidos observados).');
    if (rv.tactics.pressing === 'high' || rv.tactics.pressing === 'extreme') notes.push('Utiliza presión alta.');
    if (rv.tactics.buildUp === 'counter') notes.push('Prefiere esperar y salir al contraataque.');
    for (const s of scorers) notes.push(`${s.canonicalName} ha marcado ${s.seasonStats.goals} goles esta temporada.`);
    if (!res.length) notes.push('Todavía no hay resultados recientes de este rival.');
    return { clubId: rivalId, name: rv.name, formation: rv.tactics.formation, formationConfidence: res.length ? 'probable' : 'estimada', style: { mentality: rv.tactics.mentality, buildUp: rv.tactics.buildUp, pressing: rv.tactics.pressing },
      last5: res, position: row ? row.pos : null, points: row ? row.points : null, ratings: { attack: round(lr.attack), midfield: round(lr.midfield), defense: round(lr.defense), gk: round(lr.gk) }, keyPlayers: key, notes, tendency, sample: obs.matches,
      injuries: rv.squad.map((id) => state.players[id]).filter((p) => p.injury).length };
  }

  Object.assign(TLM, { cardData, pickXI, pickBench, autoLineup, repairLineup, setFormation, swapLineup, lineRatings, toEnginePatch, planRules, PLAN_LABELS, instructionOptions, playerPayload, shortName, sideConfig, buildMatchConfig, lineupProblems, rivalReport, slotScore });
})(typeof globalThis !== 'undefined' ? globalThis : this);

}

// ---- tlm-market.js
{
/* LFO MANAGER — MERCADO: valoración, listados, ofertas con estados claros
   (AVAILABLE · OFFERED · NEGOTIATING · ACCEPTED · REJECTED · TRANSFERRED · CANCELLED), contraofertas, ofertas múltiples
   con competencia real, contratos, agentes libres, ediciones de cromo y scouting con incertidumbre.
   Las respuestas son DETERMINISTAS + variables: ruido por hash(jugador, club, temporada), no por tirada global. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { clamp, round, hash01, nextId, roundMoney, money, R, addTx, addNews } = TLM;
  const D = () => TLM.DEFAULTS;

  const comp = (state) => state.competitions[state.worldConfigId];
  const curRound = (state) => TLM.currentRound(state, comp(state)) || comp(state).calendar.length;
  const clubOf = (state, id) => state.clubs[id];
  const profileOf = (club) => TLM.AI_PROFILES[club.aiProfile] || TLM.AI_PROFILES.balanced;

  // ---------- valoración ----------
  function squadDepth(state, club, p, excludeSelf) {
    const fam = TLM.FAMILY[p.primaryPosition];
    return club.squad.map((id) => state.players[id]).filter((q) => (!excludeSelf || q.id !== p.id) && TLM.FAMILY[q.primaryPosition] === fam);
  }
  function isStarter(state, club, p) { return club.lineup.xi.includes(p.id); }

  // Precio mínimo con el que el club VENDEDOR aceptaría vender (determinista con ruido ±5% por caso).
  function reserveValue(state, seller, p, ctx) {
    ctx = ctx || {};
    const prof = profileOf(seller), base = p.marketValue;
    let f = 1;
    const others = squadDepth(state, seller, p, true);
    const better = others.filter((q) => q.overall >= p.overall - 3).length;
    if (isStarter(state, seller, p) || others.filter((q) => q.overall > p.overall).length < 1) f *= 1.15; else f *= 0.92;
    if (!others.length) f *= 1.45; else if (better === 0) f *= 1.18; else if (better >= 2) f *= 0.93;
    if (p.age >= 31) f *= 0.85;
    if (p.age <= 22 && p.potential > p.overall + 8) f *= 1 + prof.youth * 0.3;
    const left = p.contract.endSeason - state.season;
    if (left <= 0) f *= 0.6; else if (left === 1) f *= 0.88;
    if (p.wantsOut) f *= 0.75; // quiere salir: el club vende más barato para sacárselo de encima
    const bal = seller.finances.balance;
    if (bal < 0) f *= 0.8; else if (bal < 2e6) f *= 0.93;
    const avgOvr = TLM.avg(seller.squad.map((id) => state.players[id].overall));
    if (prof.star > 0.6 && p.overall >= avgOvr + 6) f *= 1.15;
    if (p.injury) f *= 0.9;
    f *= prof.sellGreed;
    const l = state.market.listings[p.id];
    if (l && l.clubId === seller.id) f *= 0.92;
    const noise = 1 + (hash01(p.id, seller.id, state.season, ctx.round || 0) - 0.5) * 0.1;
    return Math.max(20000, roundMoney(base * f * noise));
  }

  // Salario anual que el jugador pide para fichar por `club` (o renovar).
  function contractDemand(state, p, club, renewal) {
    let d = TLM.salaryOf(p);
    const gap = p.overall - (club ? club.reputation * 0.42 + 40 : 60);
    if (!renewal) d *= gap > 8 ? 1.2 : gap < -8 ? 0.94 : 1; // le cuesta ir a un club por debajo de su nivel
    if (renewal) d *= p.morale < 45 ? 1.22 : p.morale > 75 ? 0.96 : 1.04;
    return Math.max(30000, roundMoney(d));
  }

  const transferStatus = (state, pid) => {
    const offs = Object.values(state.market.offers).filter((o) => o.playerId === pid && (o.status === 'OFFERED' || o.status === 'NEGOTIATING'));
    if (offs.some((o) => o.status === 'NEGOTIATING')) return 'NEGOTIATING';
    if (offs.length) return 'OFFERED';
    if (state.market.listings[pid] || state.market.freeAgents.includes(pid)) return 'AVAILABLE';
    return null;
  };

  // ---------- listados ----------
  function listPlayer(state, clubId, pid, askingPrice) {
    const p = state.players[pid], club = clubOf(state, clubId);
    if (!p || p.clubId !== clubId) return { ok: false, reason: 'El jugador no pertenece a este club.' };
    const price = roundMoney(askingPrice || p.marketValue * 1.1);
    state.market.listings[pid] = { playerId: pid, clubId, askingPrice: price, listedRound: state.currentMatchday, season: state.season };
    void club;
    return { ok: true, price };
  }
  function unlistPlayer(state, pid) { delete state.market.listings[pid]; }

  // Los clubes IA ponen en venta sobrantes (banquillo profundo, veteranos, exceso en una posición).
  function refreshListings(state) {
    const r = R(state);
    for (const pid of Object.keys(state.market.listings)) { const l = state.market.listings[pid], p = state.players[pid]; if (!p || p.clubId !== l.clubId) delete state.market.listings[pid]; }
    for (const club of Object.values(state.clubs)) {
      if (club.controlledBy === 'user' || club.foreign) continue;
      const prof = profileOf(club);
      const listed = Object.values(state.market.listings).filter((l) => l.clubId === club.id).length;
      const want = Math.round(D().listedPerClub * (0.6 + prof.sellGreed * 0.5)) - listed;
      if (want <= 0 || club.squad.length <= 18) continue;
      const cands = club.squad.map((id) => state.players[id]).filter((p) => !state.market.listings[p.id] && !club.lineup.xi.includes(p.id) && transferStatus(state, p.id) == null)
        .map((p) => ({ p, s: (isSurplus(state, club, p) ? 3 : 0) + (p.age >= 30 ? 2 : 0) + (p.contract.endSeason <= state.season ? 2 : 0) + r.next() * 1.5 - (TLM.FAMILY[p.primaryPosition] === 'gk' && squadDepth(state, club, p).length <= 2 ? 9 : 0) }))
        .sort((a, b) => b.s - a.s).slice(0, want);
      for (const c of cands) listPlayer(state, club.id, c.p.id, reserveValue(state, club, c.p, { round: state.currentMatchday }) * r.range(1.02, 1.18));
    }
  }
  function isSurplus(state, club, p) {
    const fam = squadDepth(state, club, p, true);
    return fam.filter((q) => q.overall >= p.overall).length >= 2 && !club.lineup.xi.includes(p.id);
  }

  // ---------- búsqueda del usuario ----------
  function searchMarket(state, f) {
    f = f || {};
    const rows = [];
    const add = (p, kind) => {
      if (f.pos && !(p.primaryPosition === f.pos || (f.includeSecondary && p.secondaryPositions.includes(f.pos)))) return;
      if (f.role && TLM.roleOf(p.primaryPosition) !== f.role) return;
      if (f.minAge != null && p.age < f.minAge) return; if (f.maxAge != null && p.age > f.maxAge) return;
      if (f.minOvr != null && p.overall < f.minOvr) return; if (f.maxOvr != null && p.overall > f.maxOvr) return;
      if (f.minPot != null && p.potential < f.minPot) return;
      if (f.nationality && p.nationality !== f.nationality) return;
      if (f.clubId && p.clubId !== f.clubId) return;
      const price = kind === 'listed' ? state.market.listings[p.id].askingPrice : kind === 'free' ? 0 : p.marketValue;
      if (f.maxPrice != null && price > f.maxPrice) return; if (f.minPrice != null && price < f.minPrice) return;
      if (f.attr) for (const k in f.attr) if (p.attributes[k] < f.attr[k]) return;
      if (f.name && !p.canonicalName.toLowerCase().includes(String(f.name).toLowerCase())) return;
      rows.push({ pid: p.id, kind, price, status: transferStatus(state, p.id), value: p.marketValue });
    };
    if (f.source !== 'free') for (const pid in state.market.listings) { const p = state.players[pid]; if (p && p.clubId !== f.excludeClub) add(p, 'listed'); }
    if (f.source !== 'listed') for (const pid of state.market.freeAgents) add(state.players[pid], 'free');
    if (f.source === 'all') for (const p of Object.values(state.players)) if (p.clubId && p.clubId !== f.excludeClub && !state.market.listings[p.id] && !state.clubs[p.clubId].foreign) add(p, 'club');
    const key = f.sort || 'ovr';
    rows.sort((a, b) => { const pa = state.players[a.pid], pb = state.players[b.pid]; return key === 'price' ? a.price - b.price : key === 'age' ? pa.age - pb.age : key === 'value' ? pb.marketValue - pa.marketValue : key === 'pot' ? pb.potential - pa.potential : pb.overall - pa.overall; });
    return rows;
  }

  // ---------- transferencias ----------
  function finish(state, offer, status, reason) { offer.status = status; if (reason) offer.reason = reason; offer.closedRound = state.currentMatchday; return offer; }

  function cancelOtherOffers(state, pid, exceptId, reason) {
    for (const o of Object.values(state.market.offers)) if (o.playerId === pid && o.id !== exceptId && (o.status === 'OFFERED' || o.status === 'NEGOTIATING' || o.status === 'ACCEPTED')) finish(state, o, o.fromClubId === state.currentClubId ? 'REJECTED' : 'CANCELLED', reason);
  }

  function executeTransfer(state, offer) {
    const p = state.players[offer.playerId], buyer = clubOf(state, offer.fromClubId), seller = offer.toClubId ? clubOf(state, offer.toClubId) : null;
    if (!p || (seller && p.clubId !== seller.id) || (!seller && p.clubId)) { finish(state, offer, 'CANCELLED', 'El jugador ya no está disponible.'); return { ok: false, reason: offer.reason }; }
    const cost = offer.amount + (seller ? 0 : 0);
    if (!TLM.canSpend(buyer, cost)) { finish(state, offer, 'CANCELLED', 'Saldo insuficiente para cerrar la operación.'); return { ok: false, reason: offer.reason }; }
    if (buyer.squad.length >= 32) { finish(state, offer, 'CANCELLED', 'Plantilla completa (máx. 32).'); return { ok: false, reason: offer.reason }; }
    const fromName = seller ? seller.name : 'agente libre';
    addTx(state, buyer, 'transfer_in', -cost, `Fichaje de ${p.canonicalName} (${fromName})`, p.id);
    if (seller) addTx(state, seller, 'transfer_out', cost, `Venta de ${p.canonicalName} a ${buyer.name}`, p.id);
    if (!seller) state.market.freeAgents = state.market.freeAgents.filter((id) => id !== p.id);
    delete state.market.listings[p.id];
    TLM.moveToClub(state, p.id, buyer.id, { salary: 0, endSeason: state.season + (offer.years || 3) });
    p.morale = clamp(p.morale + 4, 0, 100);
    if (offer.edition && offer.edition !== p.card.edition) applyEdition(state, buyer, p, offer.edition, false); // la edición especial se paga aparte y es del MISMO jugador
    finish(state, offer, 'TRANSFERRED');
    cancelOtherOffers(state, p.id, offer.id, 'El jugador fue traspasado a otro club.');
    const rec = { id: nextId(state, 'transfer', 'tr'), season: state.season, round: state.currentMatchday, playerId: p.id, from: seller ? seller.id : null, to: buyer.id, fee: cost };
    state.transfers.unshift(rec); if (state.transfers.length > 400) state.transfers.length = 400;
    const who = `${p.canonicalName} (${p.primaryPosition}, ${p.overall})`;
    if (seller) addNews(state, 'transfer', `${buyer.name} incorpora a ${who} desde ${seller.name} por ${money(cost)}.`, { playerId: p.id, from: seller.id, to: buyer.id, fee: cost });
    else addNews(state, 'transfer', `${buyer.name} ficha como agente libre a ${who}.`, { playerId: p.id, to: buyer.id, fee: cost });
    return { ok: true, rec };
  }

  function makeOffer(state, buyerId, pid, amount, terms) {
    terms = terms || {};
    const p = state.players[pid], buyer = clubOf(state, buyerId);
    if (!p || !buyer) return { ok: false, reason: 'Datos inválidos.' };
    if (!p.clubId) return { ok: false, reason: 'Es agente libre: ficharlo no requiere oferta.' };
    if (p.clubId === buyerId) return { ok: false, reason: 'Ya es tuyo.' };
    if (Object.values(state.market.offers).some((o) => o.playerId === pid && o.fromClubId === buyerId && (o.status === 'OFFERED' || o.status === 'NEGOTIATING'))) return { ok: false, reason: 'Ya tenés una oferta abierta por este jugador.' };
    amount = roundMoney(amount);
    if (amount <= 0) return { ok: false, reason: 'Monto inválido.' };
    if (!TLM.canSpend(buyer, amount)) return { ok: false, reason: 'Tu saldo no alcanza para esa oferta.' };
    const o = { id: nextId(state, 'offer', 'off'), playerId: pid, fromClubId: buyerId, toClubId: p.clubId, amount, years: terms.years || 3, status: 'OFFERED',
      createdRound: state.currentMatchday, createdSeason: state.season, expiresRound: state.currentMatchday + D().offerLifeRounds, history: [{ by: 'buyer', amount, round: state.currentMatchday }], counterAmount: null, reason: null, source: buyer.controlledBy, edition: terms.edition || null };
    state.market.offers[o.id] = o;
    return { ok: true, offer: o };
  }

  // Evalúa una oferta contra el precio mínimo del vendedor. Devuelve {verdict, counter, reserve}.
  function evaluateOffer(state, offer) {
    const seller = clubOf(state, offer.toClubId), p = state.players[offer.playerId];
    const reserve = reserveValue(state, seller, p, { round: offer.createdRound });
    const ratio = offer.amount / reserve;
    // Un vendedor no deja al club sin arquero (mín. 2) ni con <15 jugadores.
    const gkLeft = seller.squad.filter((id) => id !== p.id && state.players[id].primaryPosition === 'POR').length;
    if ((p.primaryPosition === 'POR' && gkLeft < 1) || seller.squad.length <= 15) return { verdict: 'reject', reserve, reason: 'No puede desprenderse de él: se quedaría sin plantilla suficiente.' };
    if (ratio >= 1) return { verdict: 'accept', reserve };
    if (ratio >= 0.84) return { verdict: 'counter', reserve, counter: roundMoney(Math.max(offer.amount * 1.02, reserve * (1 + 0.02 * (1 - ratio) * 10))) };
    return { verdict: 'reject', reserve, reason: 'La oferta está muy por debajo de lo que vale para el club.' };
  }

  // Procesa TODAS las ofertas abiertas contra jugadores de clubes IA (ofertas múltiples = competencia real).
  function resolveOffers(state) {
    const events = [];
    const byPlayer = {};
    for (const o of Object.values(state.market.offers)) {
      if (o.status !== 'OFFERED') continue;
      const seller = clubOf(state, o.toClubId);
      if (!seller || seller.controlledBy === 'user') continue; // las ofertas al usuario las decide el usuario
      (byPlayer[o.playerId] = byPlayer[o.playerId] || []).push(o);
    }
    for (const pid in byPlayer) {
      const list = byPlayer[pid];
      const p = state.players[pid];
      // el vendedor prefiere la oferta más atractiva: dinero ajustado por prestigio del comprador
      list.sort((a, b) => scoreOffer(state, b) - scoreOffer(state, a));
      let done = false;
      for (const o of list) {
        if (done) { finish(state, o, 'REJECTED', 'Otro club ofreció más por el jugador.'); events.push({ type: 'lost', offer: o }); continue; }
        const ev = evaluateOffer(state, o);
        if (ev.verdict === 'accept') {
          finish(state, o, 'ACCEPTED');
          const r = executeTransfer(state, o);
          events.push({ type: r.ok ? 'transfer' : 'failed', offer: o }); done = r.ok;
        } else if (ev.verdict === 'counter') {
          o.status = 'NEGOTIATING'; o.counterAmount = ev.counter; o.history.push({ by: 'seller', amount: ev.counter, round: state.currentMatchday });
          o.expiresRound = state.currentMatchday + D().offerLifeRounds;
          events.push({ type: 'counter', offer: o });
        } else { finish(state, o, 'REJECTED', ev.reason); events.push({ type: 'rejected', offer: o }); }
      }
      void p;
    }
    // contraofertas de la IA al usuario: si el usuario respondió con otra cifra (NEGOTIATING por parte del comprador, ver counterOffer)
    for (const o of Object.values(state.market.offers)) {
      if (o.status === 'NEGOTIATING' && o.awaiting === 'seller') {
        o.awaiting = null;
        const seller = clubOf(state, o.toClubId);
        if (seller.controlledBy === 'user') continue;
        const ev = evaluateOffer(state, o);
        if (ev.verdict === 'accept') { finish(state, o, 'ACCEPTED'); const r = executeTransfer(state, o); events.push({ type: r.ok ? 'transfer' : 'failed', offer: o }); }
        else if (ev.verdict === 'counter') { o.counterAmount = ev.counter; o.history.push({ by: 'seller', amount: ev.counter, round: state.currentMatchday }); events.push({ type: 'counter', offer: o }); }
        else { finish(state, o, 'REJECTED', ev.reason); events.push({ type: 'rejected', offer: o }); }
      }
    }
    // caducidad
    for (const o of Object.values(state.market.offers)) {
      if ((o.status === 'OFFERED' || o.status === 'NEGOTIATING') && state.currentMatchday > o.expiresRound) { finish(state, o, 'CANCELLED', 'La oferta caducó sin respuesta.'); events.push({ type: 'expired', offer: o }); }
    }
    // limpieza de ofertas cerradas antiguas
    const all = Object.values(state.market.offers);
    if (all.length > 120) all.filter((o) => !['OFFERED', 'NEGOTIATING'].includes(o.status)).sort((a, b) => (a.closedRound || 0) - (b.closedRound || 0)).slice(0, all.length - 100).forEach((o) => delete state.market.offers[o.id]);
    return events;
  }
  function scoreOffer(state, o) { const b = clubOf(state, o.fromClubId); return o.amount * (1 + (b.reputation - 50) / 400) * (b.controlledBy === 'user' ? 1 : 1); }

  // El comprador (usuario) responde a una contraoferta.
  function acceptCounter(state, offerId) {
    const o = state.market.offers[offerId];
    if (!o || o.status !== 'NEGOTIATING' || !o.counterAmount) return { ok: false, reason: 'No hay contraoferta activa.' };
    const buyer = clubOf(state, o.fromClubId);
    if (!TLM.canSpend(buyer, o.counterAmount)) return { ok: false, reason: 'Saldo insuficiente.' };
    o.amount = o.counterAmount; o.counterAmount = null; o.history.push({ by: 'buyer', amount: o.amount, round: state.currentMatchday, note: 'acepta' });
    finish(state, o, 'ACCEPTED');
    return executeTransfer(state, o);
  }
  function counterOffer(state, offerId, amount) {
    const o = state.market.offers[offerId];
    if (!o || o.status !== 'NEGOTIATING') return { ok: false, reason: 'No hay una negociación abierta.' };
    const buyer = clubOf(state, o.fromClubId);
    amount = roundMoney(amount);
    if (!TLM.canSpend(buyer, amount)) return { ok: false, reason: 'Saldo insuficiente.' };
    // vendedor HUMANO (liga online): la contraoferta le queda como oferta abierta para que responda
    if (clubOf(state, o.toClubId).controlledBy === 'user') { o.amount = amount; o.status = 'OFFERED'; o.awaiting = null; o.counterAmount = null; o.history.push({ by: 'buyer', amount, round: state.currentMatchday }); o.expiresRound = state.currentMatchday + D().offerLifeRounds; return { ok: true, status: 'NEGOTIATING', pending: true }; }
    o.amount = amount; o.awaiting = 'seller'; o.history.push({ by: 'buyer', amount, round: state.currentMatchday }); o.counterAmount = null;
    // respuesta inmediata en el mismo turno (no se bloquea): vuelve a evaluarse ya
    const ev = evaluateOffer(state, o);
    o.awaiting = null;
    if (ev.verdict === 'accept') { finish(state, o, 'ACCEPTED'); return executeTransfer(state, o); }
    if (ev.verdict === 'counter') { o.counterAmount = ev.counter; o.history.push({ by: 'seller', amount: ev.counter, round: state.currentMatchday }); return { ok: true, status: 'NEGOTIATING', counter: ev.counter }; }
    finish(state, o, 'REJECTED', ev.reason); return { ok: false, reason: o.reason };
  }
  function withdrawOffer(state, offerId) {
    const o = state.market.offers[offerId];
    if (!o || !['OFFERED', 'NEGOTIATING'].includes(o.status)) return { ok: false, reason: 'La oferta ya no está abierta.' };
    finish(state, o, 'CANCELLED', 'Retirada por el comprador.'); return { ok: true };
  }

  // Compra inmediata al precio pedido (jugador en la lista de transferibles).
  function buyNow(state, buyerId, pid, terms) {
    const l = state.market.listings[pid], p = state.players[pid], buyer = clubOf(state, buyerId);
    if (!l || !p) return { ok: false, reason: 'No está en venta.' };
    if (l.clubId === buyerId) return { ok: false, reason: 'Es tu propio jugador.' };
    if (!TLM.canSpend(buyer, l.askingPrice)) return { ok: false, reason: 'Saldo insuficiente (' + money(l.askingPrice) + ').' };
    const o = { id: nextId(state, 'offer', 'off'), playerId: pid, fromClubId: buyerId, toClubId: l.clubId, amount: l.askingPrice, years: (terms && terms.years) || 3, status: 'ACCEPTED',
      createdRound: state.currentMatchday, createdSeason: state.season, expiresRound: state.currentMatchday, history: [{ by: 'buyer', amount: l.askingPrice, round: state.currentMatchday, note: 'compra directa' }], reason: null, source: buyer.controlledBy, edition: (terms && terms.edition) || null };
    state.market.offers[o.id] = o;
    return executeTransfer(state, o);
  }

  function signFreeAgent(state, clubId, pid, terms) {
    const p = state.players[pid], club = clubOf(state, clubId);
    if (!p || p.clubId || !state.market.freeAgents.includes(pid)) return { ok: false, reason: 'No es agente libre.' };
    const bonus = roundMoney(p.marketValue * 0.12);
    if (!TLM.canSpend(club, bonus)) return { ok: false, reason: 'Saldo insuficiente para la prima de fichaje (' + money(bonus) + ').' };
    const o = { id: nextId(state, 'offer', 'off'), playerId: pid, fromClubId: clubId, toClubId: null, amount: bonus, years: (terms && terms.years) || 2, status: 'ACCEPTED', createdRound: state.currentMatchday, createdSeason: state.season,
      expiresRound: state.currentMatchday, history: [{ by: 'buyer', amount: bonus, round: state.currentMatchday, note: 'agente libre' }], source: club.controlledBy, edition: (terms && terms.edition) || null };
    state.market.offers[o.id] = o;
    return executeTransfer(state, o);
  }

  // ---------- el usuario VENDE: responde a ofertas de clubes IA ----------
  function respondToOffer(state, offerId, action, counter) {
    const o = state.market.offers[offerId];
    if (!o || !['OFFERED', 'NEGOTIATING'].includes(o.status)) return { ok: false, reason: 'La oferta ya no está abierta.' };
    if (action === 'accept') { finish(state, o, 'ACCEPTED'); return executeTransfer(state, o); }
    if (action === 'reject') { finish(state, o, 'REJECTED', 'Rechazada por el club vendedor.'); return { ok: true }; }
    if (action === 'counter') {
      const amt = roundMoney(counter);
      const buyer = clubOf(state, o.fromClubId);
      // comprador HUMANO (liga online): decide él; la contraoferta le queda pendiente para aceptar o contraofertar
      if (buyer.controlledBy === 'user') { o.history.push({ by: 'seller', amount: amt, round: state.currentMatchday }); o.status = 'NEGOTIATING'; o.counterAmount = amt; o.awaiting = null; o.expiresRound = state.currentMatchday + D().offerLifeRounds; return { ok: true, status: 'NEGOTIATING', buyerOffer: amt, human: true }; }
      // el comprador IA evalúa hasta dónde llega: máx = valor percibido según su perfil
      const p = state.players[o.playerId], ceil = buyerCeiling(state, buyer, p);
      o.history.push({ by: 'seller', amount: amt, round: state.currentMatchday });
      if (amt <= ceil && TLM.canSpend(buyer, amt)) { o.amount = amt; finish(state, o, 'ACCEPTED'); return executeTransfer(state, o); }
      if (amt <= ceil * 1.12 && TLM.canSpend(buyer, Math.round(ceil))) { o.status = 'NEGOTIATING'; o.amount = roundMoney(Math.min(ceil, amt)); o.counterAmount = null; o.history.push({ by: 'buyer', amount: o.amount, round: state.currentMatchday }); return { ok: true, status: 'NEGOTIATING', buyerOffer: o.amount }; }
      finish(state, o, 'REJECTED', 'El comprador se retira: pide demasiado.'); return { ok: false, reason: o.reason };
    }
    return { ok: false, reason: 'Acción inválida.' };
  }
  // Máximo que un comprador IA pagaría por un jugador (mismo criterio que usa para ofertar).
  function buyerCeiling(state, buyer, p) {
    const prof = profileOf(buyer);
    const fit = need(state, buyer, p);
    return roundMoney(p.marketValue * (0.95 + prof.bidAggr * 0.3 + Math.max(0, fit) * 0.25) * (p.age <= 23 ? 1 + prof.youth * 0.2 : 1));
  }
  // necesidad del club por este jugador ∈ [-1,1]: mejora al once o cubre un hueco.
  function need(state, club, p) {
    const fam = squadDepth(state, club, p, false).sort((a, b) => b.overall - a.overall);
    const target = TLM.FAMILY[p.primaryPosition] === 'gk' ? 2 : TLM.FAMILY[p.primaryPosition] === 'st' ? 3 : TLM.FAMILY[p.primaryPosition] === 'cb' ? 4 : 3;
    if (fam.length < target) return 1;
    const worstStarter = fam[Math.min(target, fam.length) - 1];
    return clamp((p.overall - worstStarter.overall) / 8, -1, 1);
  }

  // ---------- contratos ----------
  function renewContract(state, clubId, pid, years) {
    const p = state.players[pid], club = clubOf(state, clubId);
    if (!p || p.clubId !== clubId) return { ok: false, reason: 'No es jugador de tu club.' };
    if (p.morale < 25) { return { ok: false, reason: `${p.canonicalName} no quiere renovar: está muy desmotivado.` }; }
    applyRenewal(state, p, years); return { ok: true, status: 'accepted' };
  }
  function applyRenewal(state, p, years) {
    p.contract.endSeason = Math.max(p.contract.endSeason, state.season) + clamp(years || 2, 1, 5); p.contract.status = 'active';
    p.morale = clamp(p.morale + 5, 0, 100);
    addNews(state, 'contract', `${state.clubs[p.clubId].name} renueva a ${p.canonicalName} hasta ${p.contract.endSeason}.`, { playerId: p.id });
  }
  const contractStatus = (state, p) => { const left = p.contract.endSeason - state.season; return !p.clubId ? 'free' : left <= 0 ? 'expiring' : left === 1 ? 'short' : 'active'; };

  // Venta directa al "mercado" (liquidez inmediata al 70% del valor): sale como agente libre no; lo compra un club IA con presupuesto.
  function sellNow(state, clubId, pid) {
    const p = state.players[pid], club = clubOf(state, clubId);
    if (!p || p.clubId !== clubId) return { ok: false, reason: 'No es tuyo.' };
    if (club.squad.length <= TLM.DEFAULTS.minSquadToPlay) return { ok: false, reason: `Necesitás al menos ${TLM.DEFAULTS.minSquadToPlay} jugadores.` };
    const buyers = Object.values(state.clubs).filter((c) => c.controlledBy !== 'user' && !c.foreign && c.squad.length < 30).map((c) => ({ c, ceil: buyerCeiling(state, c, p) })).filter((x) => TLM.canSpend(x.c, x.ceil * 0.7)).sort((a, b) => b.ceil - a.ceil);
    if (!buyers.length) return { ok: false, reason: 'Ningún club puede pagarlo ahora.' };
    const b = buyers[0], price = roundMoney(Math.min(b.ceil, p.marketValue) * 0.75);
    const o = { id: nextId(state, 'offer', 'off'), playerId: pid, fromClubId: b.c.id, toClubId: clubId, amount: price, years: 2, status: 'ACCEPTED', createdRound: state.currentMatchday, createdSeason: state.season, expiresRound: state.currentMatchday, history: [{ by: 'buyer', amount: price, round: state.currentMatchday, note: 'venta directa' }], source: 'ai' };
    state.market.offers[o.id] = o;
    return executeTransfer(state, o);
  }

  // ---------- ediciones de cromo base (el MISMO jugador; sólo cambia su carta). Las especiales (plata en adelante)
  // ya no se compran acá: son cartas reales, ver rollCardDrop/equipCard más abajo. ----------
  function applyEdition(state, club, p, editionId, free) {
    const ed = TLM.EDITIONS.find((e) => e.id === editionId);
    if (!ed) return { ok: false, reason: 'Edición inexistente.' };
    if (ed.special) return { ok: false, reason: 'Esa es una carta especial: se consigue jugando, no se compra.' };
    const cost = free ? 0 : roundMoney(Math.max(20000, p.marketValue * ed.cost));
    if (cost && !TLM.canSpend(club, cost)) return { ok: false, reason: 'Saldo insuficiente (' + money(cost) + ').' };
    if (cost) addTx(state, club, 'card', -cost, `Edición «${ed.name}» de ${p.canonicalName}`, p.id);
    p.card.edition = ed.id; p.card.stars = ed.stars;
    return { ok: true, cost };
  }
  const buyEdition = (state, clubId, pid, editionId) => { const p = state.players[pid]; if (!p || p.clubId !== clubId) return { ok: false, reason: 'No es de tu club.' }; return applyEdition(state, clubOf(state, clubId), p, editionId, false); };

  // ---------- CARTAS ESPECIALES: instancias con dueño (el club, no el jugador) y usos limitados ----------
  // Drop tras un partido brillante (rating >= 8.7): probabilidad chica, elige una edición especial al azar
  // ponderada (las de 5 estrellas son mucho más raras) y crea una instancia para el club actual del jugador.
  const SPECIAL_EDITIONS = () => TLM.EDITIONS.filter((e) => e.special);
  function rollCardDrop(state, p, rating) {
    if (!p.clubId || rating < 8.7) return null;
    const r = R(state), chance = (rating - 8.7) * 0.35; // 8.7 -> ~0%, 10.0 -> ~45%
    if (!r.chance(chance)) return null;
    const pool = SPECIAL_EDITIONS(), ed = r.weighted(pool, (e) => (e.stars >= 5 ? 1 : 4));
    const id = 'card_' + (++state.cardSeq);
    const card = { id, editionId: ed.id, playerId: p.id, ownerClubId: p.clubId, usesLeft: ed.uses, retired: false };
    state.specialCards[id] = card;
    addNews(state, 'card', `¡${p.canonicalName} se ganó la carta especial «${ed.name}»! (${state.clubs[p.clubId].name})`, { playerId: p.id, clubId: p.clubId });
    return card;
  }
  const clubCards = (state, clubId) => Object.values(state.specialCards).filter((c) => c.ownerClubId === clubId && !c.retired);
  const cardsOf = (state, pid) => Object.values(state.specialCards).filter((c) => c.playerId === pid && !c.retired);
  // Equipar: el club tiene que ser dueño de la carta Y del jugador (la base). Al equipar también cambia la carta visual.
  function equipCard(state, clubId, pid, cardId) {
    const p = state.players[pid]; if (!p || p.clubId !== clubId) return { ok: false, reason: 'No es jugador de tu club.' };
    if (!cardId) { unequipCard(state, p); return { ok: true }; }
    const card = state.specialCards[cardId];
    if (!card || card.retired) return { ok: false, reason: 'Carta inexistente.' };
    if (card.ownerClubId !== clubId) return { ok: false, reason: 'Esa carta no es de tu club.' };
    if (card.playerId !== pid) return { ok: false, reason: 'Esa carta es de otro jugador: para usarla necesitás tener también su versión base en tu plantilla.' };
    const ed = TLM.EDITIONS.find((e) => e.id === card.editionId);
    p.equippedCardId = cardId; p.card.edition = ed.id; p.card.stars = ed.stars;
    p.equippedCardLogic = ed.logic; p.equippedCardBoost = ed.boost || 0;
    return { ok: true };
  }
  function unequipCard(state, p) {
    p.equippedCardId = null; p.equippedCardLogic = null; p.equippedCardBoost = 0;
    const ov = p.overall; p.card.edition = ov >= 75 ? 'cobre' : 'potrero'; p.card.stars = 3;
  }
  // Se llama después de cada partido para el jugador que jugó con una carta especial puesta: gasta un uso.
  function consumeCardUse(state, p) {
    if (!p.equippedCardId) return;
    const card = state.specialCards[p.equippedCardId]; if (!card) { p.equippedCardId = null; return; }
    if (card.usesLeft == null) return; // uso ilimitado (no debería pasar con especiales, pero por si acaso)
    card.usesLeft--;
    if (card.usesLeft <= 0) { card.retired = true; addNews(state, 'card', `Se agotaron los usos de la carta «${TLM.EDITIONS.find((e) => e.id === card.editionId).name}» de ${p.canonicalName}.`, { playerId: p.id }); unequipCard(state, p); }
  }
  // Mercado de cartas: se venden por separado del jugador. El comprador puede quedarse con la carta aunque no
  // tenga (todavía) al jugador — pero no podrá equiparla hasta que también lo fiche.
  function listCard(state, clubId, cardId, price) {
    const card = state.specialCards[cardId];
    if (!card || card.retired || card.ownerClubId !== clubId) return { ok: false, reason: 'No es tu carta.' };
    const p = state.players[card.playerId]; if (p && p.equippedCardId === cardId) return { ok: false, reason: 'Desequipala antes de vender.' };
    state.cardListings[cardId] = roundMoney(Math.max(1000, price));
    return { ok: true };
  }
  function unlistCard(state, clubId, cardId) { const card = state.specialCards[cardId]; if (!card || card.ownerClubId !== clubId) return { ok: false, reason: 'No es tu carta.' }; delete state.cardListings[cardId]; return { ok: true }; }
  function buyCard(state, buyerClubId, cardId) {
    const card = state.specialCards[cardId], price = state.cardListings[cardId];
    if (!card || card.retired || price == null) return { ok: false, reason: 'Esa carta no está en venta.' };
    const buyer = clubOf(state, buyerClubId); if (!TLM.canSpend(buyer, price)) return { ok: false, reason: 'Saldo insuficiente (' + money(price) + ').' };
    const seller = state.clubs[card.ownerClubId];
    addTx(state, buyer, 'card', -price, `Carta «${TLM.EDITIONS.find((e) => e.id === card.editionId).name}»`, card.playerId);
    if (seller) addTx(state, seller, 'card', price, `Venta de carta «${TLM.EDITIONS.find((e) => e.id === card.editionId).name}»`, card.playerId);
    card.ownerClubId = buyerClubId; delete state.cardListings[cardId];
    const p = state.players[card.playerId]; if (p && p.equippedCardId === cardId) unequipCard(state, p);
    return { ok: true };
  }

  // ---------- SCOUTING ----------
  function scout(state, clubId, req) {
    req = req || {};
    const club = clubOf(state, clubId);
    if ((state.scout.usedThisRound || 0) >= D().scoutPerRound) return { ok: false, reason: `Tu ojeador ya hizo ${D().scoutPerRound} informes esta jornada. Volvé después del próximo partido.` };
    state.scout.usedThisRound = (state.scout.usedThisRound || 0) + 1;
    const id = nextId(state, 'report', 'rep');
    const acc = clamp(0.6 + club.reputation / 250 + (club.stadium.level - 1) * 0.02, 0.6, 0.98);
    const wide = Math.round(1 + (1 - acc) * 9); // ± puntos de incertidumbre
    let list = Object.values(state.players).filter((p) => p.clubId !== clubId && !(p.clubId && state.clubs[p.clubId].foreign));
    if (req.pos) list = list.filter((p) => p.primaryPosition === req.pos || p.secondaryPositions.includes(req.pos));
    if (req.role) list = list.filter((p) => TLM.roleOf(p.primaryPosition) === req.role);
    if (req.minAge != null) list = list.filter((p) => p.age >= req.minAge); if (req.maxAge != null) list = list.filter((p) => p.age <= req.maxAge);
    const tgt = req.ovr != null ? req.ovr : null;
    if (tgt != null) list = list.filter((p) => Math.abs(p.overall - tgt) <= (req.tol || 6));
    const wantAttrs = (req.attrs || []).filter((k) => TLM.STAT_KEYS.includes(k));
    const prof = req.profile;
    const scored = list.map((p) => {
      let s = 50 - (tgt != null ? Math.abs(p.overall - tgt) * 3 : 0) + (wantAttrs.length ? TLM.avg(wantAttrs.map((k) => p.attributes[k])) - 60 : p.overall * 0.3);
      if (prof === 'young') s += (p.potential - p.overall) * 1.5 - (p.age - 20) * 1.2; else if (prof === 'veteran') s += (p.age - 27) * 1.2; else if (prof === 'star') s += p.overall - 70;
      if (req.maxPrice != null && p.marketValue > req.maxPrice) s -= 40;
      return { p, s };
    }).sort((a, b) => b.s - a.s).slice(0, req.limit || 8);
    const rows = scored.map(({ p }) => {
      const jit = (k) => Math.round((hash01(id, p.id, k) - 0.5) * 2 * wide);
      const top = TLM.STAT_KEYS.slice().sort((a, b) => p.attributes[b] - p.attributes[a]).slice(0, 3);
      const est = clamp(p.overall + jit('o'), 30, 99);
      return {
        pid: p.id, name: p.canonicalName, age: p.age, pos: p.primaryPosition, club: p.clubId ? clubOf(state, p.clubId).name : 'Agente libre', nationality: p.nationality,
        ovr: [Math.max(30, est - Math.ceil(wide / 2)), Math.min(99, est + Math.ceil(wide / 2))], potentialStars: clamp(Math.round((p.potential - 45) / 10 + (hash01(id, p.id, 'p') - 0.5)), 1, 5),
        keyAttrs: top.map((k) => { const v = p.attributes[k] + jit(k); return { key: k, range: [Math.max(20, v - wide), Math.min(99, v + wide)] }; }), value: p.marketValue,
        availability: state.market.listings[p.id] ? 'En venta' : p.clubId ? 'No transferible (requiere oferta)' : 'Libre', confidence: acc,
      };
    });
    const rep = { id, round: state.currentMatchday, season: state.season, clubId, request: req, accuracy: acc, rows };
    state.scoutReports[id] = rep;
    const ids = Object.keys(state.scoutReports); if (ids.length > 20) delete state.scoutReports[ids[0]];
    return { ok: true, report: rep };
  }

  Object.assign(TLM, { reserveValue, contractDemand, transferStatus, listPlayer, unlistPlayer, refreshListings, searchMarket, makeOffer, evaluateOffer, resolveOffers, acceptCounter, counterOffer, withdrawOffer, buyNow,
    signFreeAgent, respondToOffer, renewContract, contractStatus, sellNow, applyEdition, buyEdition, scout, executeTransfer, buyerCeiling, need, isSurplus, squadDepth, curRound, mainComp: comp,
    rollCardDrop, clubCards, cardsOf, equipCard, unequipCard, consumeCardUse, listCard, unlistCard, buyCard });
})(typeof globalThis !== 'undefined' ? globalThis : this);

}

// ---- tlm-ai.js
{
/* LFO MANAGER — IA DE CLUBES ("manager brain"). Cada club IA usa la misma información pública que un humano
   (valor de mercado, OVR visible, contratos, plantillas) y decide según su PERFIL: distinta formación, distinta táctica,
   distinto apetito de gasto/venta/juventud/estrellas. No hay trampas: el potencial ajeno sólo se estima parcialmente. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { clamp, round, hash01, R, money, roundMoney, addNews } = TLM;
  const prof = (club) => TLM.AI_PROFILES[club.aiProfile] || TLM.AI_PROFILES.balanced;
  const aiState = (club) => (club.ai = club.ai || { signingsThisSeason: 0, lastBidRound: -9, notes: [] });
  const viewPotential = (p) => (p.age <= 23 ? p.overall + (p.potential - p.overall) * 0.6 : p.overall);

  const MENT = ['veryDefensive', 'defensive', 'balanced', 'attacking', 'veryAttacking'];
  const stepMent = (m, d) => MENT[clamp(MENT.indexOf(m) + d, 0, 4)];

  // Elige formación: la mejor para su plantilla entre las que prefiere su perfil (con sesgo de estilo).
  function chooseFormation(state, club) {
    const pr = prof(club);
    let best = club.tactics.formation, bs = -1;
    for (const f of pr.formations) {
      const xi = TLM.pickXI(state, club, f, club.lineup.xi.filter(Boolean));
      const lr = TLM.lineRatings(state, Object.assign({}, club, { tactics: Object.assign({}, club.tactics, { formation: f }) }), xi);
      const bias = (f === club.tactics.formation ? 0.6 : 0) + (f === pr.formations[0] ? 0.5 : 0); // estabilidad + preferencia
      const s = lr.overall + bias + xi.filter(Boolean).length * 0.3;
      if (s > bs) { bs = s; best = f; }
    }
    return best;
  }

  // Táctica frente a un rival concreto: base del perfil, corregida por la diferencia de nivel visible.
  function chooseTactics(state, club, opp, isHome) {
    const pr = prof(club), t = club.tactics;
    TLM.applyProfileTactics(club);
    const mine = TLM.lineRatings(state, club).overall, theirs = opp ? TLM.lineRatings(state, opp).overall : mine;
    const diff = mine - theirs;
    let m = pr.mentality;
    if (diff < -4 && !['aggressive', 'offensive'].includes(club.aiProfile)) m = stepMent(m, -1);
    else if (diff > 4 && !['conservative', 'defensive'].includes(club.aiProfile)) m = stepMent(m, +1);
    if (!isHome && club.aiProfile !== 'offensive' && club.aiProfile !== 'aggressive') m = stepMent(m, diff > 6 ? 0 : -0);
    t.mentality = m;
    // Sube la presión sólo si el plantel aguanta físicamente.
    const avgFit = TLM.avg(club.lineup.xi.filter(Boolean).map((id) => state.players[id].fitness)) || 100;
    if (avgFit < 70 && (t.pressing === 'high' || t.pressing === 'extreme')) t.pressing = 'medium';
    if (diff < -7 && club.aiProfile !== 'offensive') t.buildUp = club.aiProfile === 'youthDeveloper' ? t.buildUp : 'counter';
    // Reacción al rendimiento: tres derrotas seguidas → el manager se replantea (más cauto, sin presión extrema);
    // tres victorias seguidas → confía en su idea y sube un punto la intensidad si el plantel aguanta.
    const rec = TLM.recentResults(state, state.competitions[state.worldConfigId], club.id, 3), st = aiState(club);
    if (rec.length === 3 && rec.every((x) => x.res === 'L')) { t.mentality = stepMent(t.mentality, -1); if (t.pressing === 'extreme') t.pressing = 'high'; if (!st.crisisRound || state.currentMatchday - st.crisisRound > 4) { st.crisisRound = state.currentMatchday; TLM.addNews(state, 'tactic', `${club.name} replantea su estilo tras tres derrotas seguidas: el técnico apuesta por un equipo más cauto.`, { clubId: club.id }); } }
    else if (rec.length === 3 && rec.every((x) => x.res === 'W') && avgFit >= 75 && MENT.indexOf(t.mentality) < 3 && club.aiProfile !== 'conservative') t.mentality = stepMent(t.mentality, +1);
    club.plan = club.plan || {};
    club.plan.ifWinning = { conservative: 'protect', defensive: 'protect', lowBudget: 'protect', balanced: 'control', pragmaticSeller: 'control', youthDeveloper: 'control', aggressive: 'keep', offensive: 'keep', starBuyer: 'control' }[club.aiProfile] || 'keep';
    club.plan.ifLosing = { aggressive: 'allout', offensive: 'allout', starBuyer: 'push', balanced: 'push', conservative: 'keep', defensive: 'keep' }[club.aiProfile] || 'push';
    club.plan.fromMinute = { minute: 70, mode: ['aggressive', 'offensive', 'starBuyer', 'balanced'].includes(club.aiProfile) ? 'chase' : 'hold' };
    return t;
  }

  // Alineación con rotación: si un titular está muy cansado (<60) y hay recambio decente, descansa.
  function prepareMatch(state, club, opp, isHome) {
    if (club.controlledBy === 'user') return;
    ensureSquad(state, club, true);
    const prevForm = club.tactics.formation;
    club.tactics.formation = chooseFormation(state, club);
    if (prevForm !== club.tactics.formation && state.currentMatchday > 2 && (!aiState(club).formNewsRound || state.currentMatchday - aiState(club).formNewsRound > 6)) { aiState(club).formNewsRound = state.currentMatchday; TLM.addNews(state, 'tactic', `${club.name} cambia al ${club.tactics.formation} de cara al próximo partido.`, { clubId: club.id }); }
    TLM.autoLineup(state, club, club.tactics.formation);
    const tired = club.lineup.xi.map((id, i) => ({ id, i })).filter((x) => x.id && state.players[x.id].fitness < 62 && state.players[x.id].primaryPosition !== 'POR');
    if (tired.length) {
      const fitCount = (id) => state.players[id].fitness;
      tired.slice(0, 3).forEach((x) => {
        const slot = TLM.FORMATIONS[club.tactics.formation][x.i];
        const alt = club.lineup.bench.map((id) => state.players[id]).filter((p) => TLM.compat(slot, p.primaryPosition, p.secondaryPositions) >= 0.86 && p.fitness > fitCount(x.id) + 12 && p.overall >= state.players[x.id].overall - 7)[0];
        if (alt) { club.lineup.bench = club.lineup.bench.map((id) => (id === alt.id ? x.id : id)); club.lineup.xi[x.i] = alt.id; }
      });
    }
    chooseTactics(state, club, opp, isHome);
  }

  // ---------- plantilla mínima y posiciones débiles ----------
  const TARGET = { gk: 2, cb: 4, wb: 3, dm: 2, cm: 3, wm: 2, am: 1, w: 2, st: 3 };
  function positionGaps(state, club) {
    const gaps = [];
    for (const fam in TARGET) {
      const have = club.squad.map((id) => state.players[id]).filter((p) => TLM.FAMILY[p.primaryPosition] === fam);
      if (have.length < TARGET[fam]) gaps.push({ fam, missing: TARGET[fam] - have.length });
    }
    return gaps;
  }
  const famPositions = (fam) => TLM.POSITIONS.filter((p) => TLM.FAMILY[p] === fam);

  // Evita que la IA se quede sin jugadores: ficha agentes libres baratos para cubrir huecos.
  function ensureSquad(state, club, quiet) {
    const st = aiState(club);
    let guard = 0;
    while ((club.squad.length < 17 || positionGaps(state, club).length) && guard++ < 6) {
      const gaps = positionGaps(state, club), fam = gaps.length ? gaps[0].fam : null;
      const pool = state.market.freeAgents.map((id) => state.players[id]).filter((p) => (!fam || TLM.FAMILY[p.primaryPosition] === fam)).sort((a, b) => b.overall - a.overall);
      const p = pool.find((x) => TLM.canSpend(club, x.marketValue * 0.12 + 1000));
      if (!p) break;
      const r = TLM.signFreeAgent(state, club.id, p.id, { years: 2 });
      if (!r.ok) break;
      st.signingsThisSeason++;
    }
    void quiet;
  }

  // ---------- mercado IA ----------
  function targetsFor(state, club) {
    const pr = prof(club), out = [];
    const budget = Math.max(0, club.finances.balance) * pr.spend * 0.8;
    if (budget < 150000) return out;
    const pool = [];
    for (const pid in state.market.listings) pool.push(state.players[pid]);
    // además, ojea jugadores no listados de otros clubes (con menor probabilidad: requiere oferta)
    const r = R(state);
    const others = Object.values(state.players).filter((p) => p.clubId && p.clubId !== club.id && !state.market.listings[p.id] && !state.clubs[p.clubId].foreign);
    for (let i = 0; i < 24; i++) pool.push(others[Math.floor(r.next() * others.length)]);
    for (const p of pool) {
      if (!p || p.clubId === club.id || TLM.transferStatus(state, p.id) === 'NEGOTIATING') continue;
      const l = state.market.listings[p.id];
      const price = l ? l.askingPrice : p.marketValue * (1.05 + pr.bidAggr * 0.15);
      if (price > budget) continue;
      const nd = TLM.need(state, club, p);
      const upg = nd; if (upg < 0.25) continue;
      const star = clamp((p.overall - TLM.avg(club.squad.map((id) => state.players[id].overall)) - 3) / 10, 0, 1);
      const youth = p.age <= 23 ? clamp((viewPotential(p) - 60) / 25, 0, 1) : 0;
      const score = upg * 2 + star * pr.star * 2 + youth * pr.youth * 1.6 - (price / Math.max(budget, 1)) * (1.2 - pr.spend) - (p.age >= 31 ? 0.7 : 0) + (l ? 0.25 : 0) + hash01(club.id, p.id, state.currentMatchday) * 0.5;
      out.push({ p, price, score, listed: !!l });
    }
    return out.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  function marketRound(state) {
    const r = R(state), events = [];
    for (const club of Object.values(state.clubs)) {
      if (club.controlledBy === 'user' || club.foreign) continue;
      const pr = prof(club), st = aiState(club);
      // crisis financiera: vende al mejor pagado que no es titular
      if (club.finances.balance < 0) {
        const p = club.squad.map((id) => state.players[id]).filter((x) => !state.market.listings[x.id]).sort((a, b) => b.contract.salary - a.contract.salary)[0];
        if (p) TLM.listPlayer(state, club.id, p.id, TLM.reserveValue(state, club, p, { round: state.currentMatchday }) * 0.9);
      }
      if (st.signingsThisSeason >= 8 || club.squad.length >= 28) continue;
      if (r.next() > 0.22 + pr.spend * 0.3 + (positionGaps(state, club).length ? 0.3 : 0)) continue;
      const t = targetsFor(state, club)[0];
      if (!t) continue;
      const p = t.p;
      if (t.listed && r.next() < 0.35 + pr.bidAggr * 0.4) {
        const res = TLM.buyNow(state, club.id, p.id, {});
        if (res.ok) { st.signingsThisSeason++; events.push({ type: 'ai_buy', clubId: club.id, playerId: p.id, fee: res.rec.fee }); }
        continue;
      }
      const ceil = TLM.buyerCeiling(state, club, p);
      const bid = roundMoney(Math.min(ceil, p.marketValue * (0.86 + pr.bidAggr * 0.34) * (1 + hash01(club.id, p.id, 'b') * 0.06)));
      if (bid > club.finances.balance * 0.9) continue;
      const res = TLM.makeOffer(state, club.id, p.id, bid, {});
      if (res.ok) { st.lastBidRound = state.currentMatchday; events.push({ type: 'ai_offer', clubId: club.id, playerId: p.id, offer: res.offer }); }
    }
    return events;
  }

  // Los clubes IA también ofertan por jugadores del usuario (nunca más de uno por jornada, sólo si tiene sentido futbolístico).
  function offersForUser(state) {
    const user = state.clubs[state.currentClubId], r = R(state);
    if (!user || !user.squad.length) return [];
    const cands = user.squad.map((id) => state.players[id]).filter((p) => p.overall >= 62 && TLM.transferStatus(state, p.id) == null);
    if (!cands.length) return [];
    const unhappy = cands.filter((p) => p.wantsOut);
    // un jugador que pide la salida se ofrece prácticamente siempre; si no hay ninguno, la IA solo scoutea de tanto en tanto.
    if (!unhappy.length && !r.chance(0.28)) return [];
    const pool = unhappy.length ? unhappy : cands;
    const p = r.weighted(pool, (x) => Math.max(1, x.overall - 55) * (state.market.listings[x.id] ? 2.5 : 1) * (x.wantsOut ? 3 : 1));
    const buyers = Object.values(state.clubs).filter((c) => c.controlledBy !== 'user' && !c.foreign && c.finances.balance > p.marketValue).map((c) => ({ c, nd: TLM.need(state, c, p) })).filter((x) => x.nd > 0.15).sort((a, b) => b.nd - a.nd);
    if (!buyers.length) return [];
    const b = buyers[Math.floor(r.next() * Math.min(3, buyers.length))].c;
    const pr = prof(b);
    const bid = roundMoney(p.marketValue * (0.85 + pr.bidAggr * 0.3 + r.next() * 0.12));
    const res = TLM.makeOffer(state, b.id, p.id, bid, {});
    if (res.ok) { res.offer.toUser = true; return [{ type: 'offer_for_user', offer: res.offer }]; }
    return [];
  }

  // ---------- renovaciones / fin de contrato ----------
  function seasonEndContracts(state) {
    const out = [];
    for (const club of Object.values(state.clubs)) {
      if (club.controlledBy === 'user' || club.foreign) continue;
      const pr = prof(club);
      for (const id of club.squad.slice()) {
        const p = state.players[id];
        if (p.contract.endSeason > state.season) continue;
        const valued = p.overall >= TLM.avg(club.squad.map((x) => state.players[x].overall)) - 2 && p.age < 34;
        if (valued && hash01(club.id, p.id, state.season, 'renew') < 0.35 + pr.renew * 0.6) {
          const r = TLM.renewContract(state, club.id, p.id, 2); if (r.ok) { out.push({ type: 'renew', playerId: p.id, clubId: club.id }); continue; }
        }
        out.push({ type: 'release', playerId: p.id, clubId: club.id });
      }
    }
    return out;
  }

  function prepareAll(state) { for (const c of Object.values(state.clubs)) if (c.controlledBy !== 'user') ensureSquad(state, c, true); }

  Object.assign(TLM, { aiChooseFormation: chooseFormation, aiChooseTactics: chooseTactics, aiPrepareMatch: prepareMatch, aiEnsureSquad: ensureSquad, aiPositionGaps: positionGaps, aiTargets: targetsFor, aiMarketRound: marketRound, aiOffersForUser: offersForUser, aiSeasonEndContracts: seasonEndContracts, aiPrepareAll: prepareAll, aiState });
  void round; void money; void addNews; void famPositions;
})(typeof globalThis !== 'undefined' ? globalThis : this);

}

// ---- tlm-sim.js
{
/* LFO MANAGER — SIMULACIÓN RÁPIDA (partidos IA vs IA) + APLICACIÓN DE RESULTADOS.
   El partido del usuario lo juega el motor 3D; el resto del mundo usa este simulador estadístico basado en la MISMA alineación,
   táctica y atributos efectivos. Ambos producen el mismo esquema MatchResult y pasan por el mismo applyMatchResult():
   una sola vía para actualizar tabla, estadísticas, lesiones, moral, finanzas y noticias. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { clamp, round, avg, R, addTx, addNews, money } = TLM;
  const MENT = { veryDefensive: -2, defensive: -1, balanced: 0, attacking: 1, veryAttacking: 2 };

  function poisson(r, lam) { const L = Math.exp(-lam); let k = 0, p = 1; do { k++; p *= r.next(); } while (p > L && k < 12); return k - 1; }

  function sideState(state, club) {
    TLM.repairLineup(state, club);
    const xi = club.lineup.xi.filter(Boolean).map((id) => state.players[id]);
    return { club, lr: TLM.lineRatings(state, club), xi, bench: club.lineup.bench.map((id) => state.players[id]), tac: club.tactics };
  }

  // Simula un partido y devuelve un MatchResult (sin tocar el estado; applyMatchResult lo aplica).
  function simulateMatch(state, fixture, opts) {
    const r = R(state), H = sideState(state, state.clubs[fixture.homeId]), A = sideState(state, state.clubs[fixture.awayId]);
    const mh = MENT[H.tac.mentality] || 0, ma = MENT[A.tac.mentality] || 0;
    const lam = (a, d, mid, gkOpp, mentAtk, mentOppAtk, homeAdv) => 1.28 * Math.exp((a.attack - d.defense) * 0.036 + (mid.midfield - a.midfieldOpp) * 0.018 - (gkOpp - 68) * 0.014) * homeAdv * (1 + mentAtk * 0.06) * (1 + mentOppAtk * 0.035);
    const lh = lam({ attack: H.lr.attack, midfieldOpp: A.lr.midfield }, { defense: A.lr.defense }, { midfield: H.lr.midfield }, A.lr.gk, mh, ma, 1.14);
    const la = lam({ attack: A.lr.attack, midfieldOpp: H.lr.midfield }, { defense: H.lr.defense }, { midfield: A.lr.midfield }, H.lr.gk, ma, mh, 0.94);
    const goals = [poisson(r, lh), poisson(r, la)];
    const sides = [H, A], res = { fixtureId: fixture.id, homeClubId: H.club.id, awayClubId: A.club.id, score: goals.slice(), source: 'sim', events: [], goalScorers: [], substitutions: [], injuries: [], playerStats: {}, lineups: [] };
    const ps = res.playerStats;
    const ensure = (p, side, start) => (ps[p.id] = ps[p.id] || { pid: p.id, team: side, minutes: 0, start: !!start, goals: 0, assists: 0, shots: 0, saves: 0, fouls: 0, yellow: 0, red: 0, tackles: 0, rating: 0, cleanSheet: false });
    // ---- cambios (0-3 por equipo, minuto 55-85) ----
    sides.forEach((S, t) => {
      res.lineups.push({ team: t, xi: S.xi.map((p) => p.id), bench: S.bench.map((p) => p.id) });
      S.xi.forEach((p) => { ensure(p, t, true).minutes = 90; });
      const nSubs = Math.min(S.bench.length, r.weighted([0, 1, 2, 3], (k) => [0.15, 0.3, 0.35, 0.2][k]));
      const used = new Set();
      for (let i = 0; i < nSubs; i++) {
        const out = S.xi.filter((p) => p.primaryPosition !== 'POR' && !used.has(p.id)).sort((a, b) => a.fitness - b.fitness + (r.next() - 0.5) * 20)[0];
        if (!out) break;
        const inn = S.bench.filter((b) => !used.has(b.id) && b.primaryPosition !== 'POR').sort((a, b) => TLM.compat(TLM.FORMATIONS[S.tac.formation][S.club.lineup.xi.indexOf(out.id)], b.primaryPosition, b.secondaryPositions) - TLM.compat(TLM.FORMATIONS[S.tac.formation][S.club.lineup.xi.indexOf(out.id)], a.primaryPosition, a.secondaryPositions))[0];
        if (!inn) break;
        const minute = r.int(55, 85);
        used.add(out.id); used.add(inn.id);
        ps[out.id].minutes = minute; ensure(inn, t, false).minutes = 90 - minute;
        res.substitutions.push({ team: t, minute, outPid: out.id, inPid: inn.id });
        res.events.push({ minute, type: 'sub', team: t, pid: inn.id, text: `${inn.canonicalName} entra por ${out.canonicalName}` });
        S._subs = (S._subs || []).concat([{ minute, out, inn }]);
      }
    });
    const onPitch = (S, t, minute) => {
      const subs = S._subs || [];
      return S.xi.filter((p) => !subs.some((s) => s.out.id === p.id && s.minute <= minute)).concat(subs.filter((s) => s.minute <= minute).map((s) => s.inn));
    };
    // ---- goles ----
    [0, 1].forEach((t) => {
      const S = sides[t];
      for (let i = 0; i < goals[t]; i++) {
        const minute = r.int(1, 90), pool = onPitch(S, t, minute);
        const sc = r.weighted(pool, (p) => { const ro = TLM.roleOf(p.primaryPosition); const st = TLM.effectiveStats(p, S.club); return (ro === 'FWD' ? 5.5 : ro === 'MID' ? 2 : ro === 'DEF' ? 0.55 : 0.02) * Math.pow(st.shooting / 70, 2.2); });
        let as = null;
        if (r.chance(0.72)) as = r.weighted(pool.filter((p) => p.id !== sc.id), (p) => { const ro = TLM.roleOf(p.primaryPosition); const st = TLM.effectiveStats(p, S.club); return (ro === 'MID' ? 3 : ro === 'FWD' ? 2.5 : ro === 'DEF' ? 1 : 0.1) * Math.pow(st.passing / 70, 2); });
        ps[sc.id].goals++; as && ps[as.id].assists++;
        res.goalScorers.push({ pid: sc.id, team: t, minute, assistPid: as ? as.id : null });
        res.events.push({ minute, type: 'goal', team: t, pid: sc.id, assist: as ? as.id : null, text: `${sc.canonicalName} marca para ${S.club.shortName}` });
      }
    });
    res.goalScorers.sort((a, b) => a.minute - b.minute); res.events.sort((a, b) => a.minute - b.minute);
    // ---- estadísticas de equipo ----
    const poss0 = clamp(round(50 + (H.lr.midfield - A.lr.midfield) * 1.3 + ({ possession: 4, balanced: 0, direct: -3, counter: -6 }[H.tac.buildUp] || 0) - ({ possession: 4, balanced: 0, direct: -3, counter: -6 }[A.tac.buildUp] || 0) + r.gauss() * 2.5), 32, 68);
    res.possession = [poss0, 100 - poss0];
    res.shots = [0, 1].map((t) => Math.max(goals[t], round(goals[t] / 0.11 * clamp(0.7 + r.next() * 0.6, 0.6, 1.4) * 0.6 + [lh, la][t] * 4 + r.range(0, 4))));
    res.shotsOnTarget = [0, 1].map((t) => Math.min(res.shots[t], goals[t] + round(res.shots[t] * r.range(0.16, 0.32))));
    res.xg = [0, 1].map((t) => +(res.shots[t] * 0.09 + goals[t] * 0.15 + r.range(-0.2, 0.3)).toFixed(2)).map((x) => Math.max(0.1, x));
    res.passes = [0, 1].map((t) => round(300 + res.possession[t] * 4.6 + r.range(-40, 40)));
    res.passAccuracy = [0, 1].map((t) => clamp(round(68 + (sides[t].lr.midfield - 60) * 0.5 + (t === 0 ? 1 : -1) * (poss0 - 50) * 0.15 + r.gauss() * 2), 60, 92));
    res.fouls = [0, 1].map((t) => clamp(round(10 + (['high', 'extreme'].includes(sides[t].tac.pressing) ? 3 : 0) + r.gauss() * 2.5), 5, 24));
    res.corners = [0, 1].map((t) => clamp(round(res.shots[t] * 0.38 + r.range(0, 2)), 0, 14));
    res.offsides = [0, 1].map(() => r.int(0, 4));
    const yl = [0, 1].map((t) => Math.min(5, poisson(r, 1.5 + (res.fouls[t] - 10) * 0.12))), rd = [0, 1].map(() => (r.chance(0.05) ? 1 : 0));
    res.yellow = yl; res.red = rd;
    res.saves = [0, 1].map((t) => Math.max(0, res.shotsOnTarget[1 - t] - goals[1 - t]));
    res.channels = sides.map((S) => { const w = S.tac.width === 'wide' ? 1.2 : S.tac.width === 'narrow' ? 0.7 : 1; const l = r.range(0.6, 1.4) * w, rr = r.range(0.6, 1.4) * w, c = r.range(0.8, 1.6) * (2 - w); const tot = l + rr + c; return { left: round(l / tot * 40), center: round(c / tot * 40), right: round(rr / tot * 40) }; });
    // ---- distribución por jugador ----
    [0, 1].forEach((t) => {
      const S = sides[t], all = S.xi.concat(S.bench.filter((b) => ps[b.id]));
      // tiros
      let remaining = res.shots[t];
      all.forEach((p) => { if (ps[p.id].goals) { ps[p.id].shots += ps[p.id].goals; remaining -= ps[p.id].goals; } });
      for (let i = 0; i < Math.max(0, remaining); i++) { const p = r.weighted(all.filter((x) => x.primaryPosition !== 'POR'), (x) => { const ro = TLM.roleOf(x.primaryPosition); return (ro === 'FWD' ? 4 : ro === 'MID' ? 2 : 0.5) * ps[x.id].minutes / 90; }); ps[p.id].shots++; }
      const gk = all.find((p) => p.primaryPosition === 'POR' && ps[p.id].minutes > 0); if (gk) { ps[gk.id].saves = res.saves[t]; ps[gk.id].cleanSheet = goals[1 - t] === 0; }
      // tarjetas / faltas / recuperaciones
      for (let i = 0; i < yl[t]; i++) { const p = r.weighted(all, (x) => 1 + x.personality.aggression / 40 + (TLM.roleOf(x.primaryPosition) === 'DEF' ? 1 : 0) + (TLM.roleOf(x.primaryPosition) === 'MID' ? 0.6 : 0)); ps[p.id].yellow++; res.events.push({ minute: r.int(5, 89), type: 'card', team: t, pid: p.id, text: `Tarjeta amarilla para ${p.canonicalName}` }); }
      if (rd[t]) { const p = r.pick(S.xi.filter((x) => x.primaryPosition !== 'POR')); ps[p.id].red = 1; ps[p.id].minutes = Math.min(ps[p.id].minutes, r.int(30, 85)); res.events.push({ minute: ps[p.id].minutes, type: 'card', team: t, pid: p.id, red: true, text: `Roja directa para ${p.canonicalName}` }); }
      all.forEach((p) => { const ro = TLM.roleOf(p.primaryPosition); ps[p.id].tackles = ro === 'GK' ? 0 : round(r.range(0.5, ro === 'DEF' ? 6 : ro === 'MID' ? 4.5 : 2) * ps[p.id].minutes / 90); ps[p.id].fouls = round(r.range(0, 2.2) * ps[p.id].minutes / 90); });
    });
    // ---- lesiones (baja frecuencia, más probable con poco fitness) ----
    [0, 1].forEach((t) => sides[t].xi.forEach((p) => { if (r.chance(0.012 * (1 + (100 - p.fitness) / 70))) { const sev = r.next(); res.injuries.push({ pid: p.id, severity: sev }); res.events.push({ minute: r.int(10, 88), type: 'injury', team: t, pid: p.id, text: `${p.canonicalName} se lesiona` }); } }));
    rate(state, res, sides);
    res.events.sort((a, b) => a.minute - b.minute);
    void opts;
    return res;
  }

  // Valoración 1-10 del jugador con lo que hizo (mismo criterio para motor y simulador). Sólo usa datos existentes.
  function rate(state, res, sides) {
    const r = R(state);
    [0, 1].forEach((t) => {
      const my = res.score[t], opp = res.score[1 - t], W = my > opp ? 1 : my < opp ? -1 : 0;
      const lus = res.lineups[t];
      for (const pid of lus.xi.concat(lus.bench)) {
        const s = res.playerStats[pid]; if (!s || s.minutes <= 0) continue;
        const p = state.players[pid], ro = TLM.roleOf(p.primaryPosition), share = Math.min(1, s.minutes / 90);
        let v = 6.0 + W * 0.3 * share + s.goals * 0.95 + s.assists * 0.55 + Math.min(1, s.shots * 0.05) + (ro === 'GK' ? s.saves * 0.14 + (s.cleanSheet ? 0.55 : 0) : 0) + (ro === 'DEF' ? (s.cleanSheet || opp === 0 ? 0.35 : -0.1 * opp) : 0) + s.tackles * 0.05 - s.yellow * 0.3 - s.red * 1.6 - (ro === 'GK' ? opp * 0.22 : 0);
        v += r.gauss() * (0.45 - (p.personality.consistency - 60) / 400) * (TLM.cardBoostBits ? TLM.cardBoostBits(p).noiseMul : 1); // "Capitán eterno"/"Última leyenda": menos variación
        s.rating = +clamp(v, 3.5, 10).toFixed(1);
      }
    });
    void sides;
  }

  // ---- APLICAR RESULTADO (motor o simulador) ----
  function applyMatchResult(state, fixture, res) {
    const comp = state.competitions[fixture.competitionId], home = state.clubs[fixture.homeId], away = state.clubs[fixture.awayId];
    const clubs = [home, away];
    TLM.recordResult(state, fixture, res.score[0], res.score[1], { source: res.source });
    fixture.result.stats = { possession: res.possession, shots: res.shots, shotsOnTarget: res.shotsOnTarget };
    // estadísticas de jugadores + moral/forma/físico/lesiones/sanciones
    for (const pid in res.playerStats) {
      const s = res.playerStats[pid], p = state.players[pid]; if (!p) continue;
      const club = clubs[s.team], my = res.score[s.team], opp = res.score[1 - s.team];
      if (s.minutes > 0) {
        const t = p.seasonStats; t.matches++; if (s.start) t.starts++; t.minutes += s.minutes; t.goals += s.goals; t.assists += s.assists; t.shots += s.shots; t.saves += s.saves; t.yellow += s.yellow; t.red += s.red; t.tackles += s.tackles; t.fouls += s.fouls;
        if (s.cleanSheet) t.cleanSheets++; if (s.rating) { t.ratingSum += s.rating; t.ratingN++; p.form = clamp(p.form * 0.65 + (s.rating - 4) * 20 * 0.35, 0, 100); }
        const drop = s.staminaEnd != null ? (100 - s.staminaEnd) * 0.55 : s.minutes / 90 * (24 - (p.attributes.physical - 60) * 0.12);
        p.fitness = clamp(p.fitness - drop, 20, 100);
        const cardBits = TLM.cardBoostBits ? TLM.cardBoostBits(p) : { immune: false };
        p.morale = clamp(p.morale + (my > opp ? 3 : my < opp ? (cardBits.immune ? 0 : -3) : 0.3) + (s.goals ? 2.5 : 0) + (s.rating >= 8 ? 2 : 0), 0, 100);
        if (s.rating) { TLM.gainMatchXP(state, p, s.rating); TLM.rollCardDrop(state, p, s.rating); TLM.consumeCardUse(state, p); }
        p.yellowAccum = (p.yellowAccum || 0) + s.yellow;
        if (p.yellowAccum >= 5) { p.suspension = 1; p.yellowAccum = 0; addNews(state, 'ban', `${p.canonicalName} (${club.name}) cumple una fecha de suspensión por acumulación de amarillas.`, { playerId: p.id }); }
        if (s.red) { p.suspension = Math.max(p.suspension, 1 + (s.rating < 4 ? 1 : 0)); addNews(state, 'ban', `${p.canonicalName} (${club.name}) es sancionado tras su expulsión.`, { playerId: p.id }); }
        p.played = true;
      } else { p.morale = clamp(p.morale - (p.overall >= 68 && club.lineup.xi.length ? 0.6 : 0.2), 0, 100); }
    }
    for (const inj of res.injuries || []) {
      const p = state.players[inj.pid]; if (!p) continue;
      const it = TLM.injure(state, p, inj.severity);
      if (it) { const lab = p.overall >= 70 ? `${p.canonicalName} (${state.clubs[p.clubId].name}) sufre ${it.name.toLowerCase()} y será baja ${it.matchdays} fecha${it.matchdays > 1 ? 's' : ''}.` : null; lab && addNews(state, 'injury', lab, { playerId: p.id }); }
    }
    // observaciones públicas (alimentan el informe del rival) — sólo datos que el partido produjo
    clubs.forEach((c, t) => { const ch = res.channels && res.channels[t]; c.observed.matches++; if (ch) { c.observed.channels.left += ch.left; c.observed.channels.center += ch.center; c.observed.channels.right += ch.right; } });
    // economía: entradas del local, premios por resultado
    const form = TLM.recentResults(state, comp, home.id, 3).reduce((a, x) => a + (x.res === 'W' ? 1 : x.res === 'L' ? -1 : 0), 0);
    const att = TLM.attendance(state, home, away, form), inc = round(att * TLM.ticketPrice(home));
    addTx(state, home, 'tickets', inc, `Entradas vs ${away.name} (${att.toLocaleString('es-AR')})`);
    fixture.result.attendance = att; fixture.result.income = inc;
    const prize = (c, s) => { const my = res.score[s], opp = res.score[1 - s]; const base = 80000 + c.reputation * 3500; if (my > opp) addTx(state, c, 'prize', base, 'Premio por victoria'); else if (my === opp) addTx(state, c, 'prize', round(base * 0.3), 'Premio por empate'); };
    clubs.forEach(prize);
    // reputación (lenta) y noticias
    clubs.forEach((c, t) => { const my = res.score[t], opp = res.score[1 - t]; c.reputation = clamp(c.reputation + (my > opp ? 0.06 : my < opp ? -0.05 : 0), 1, 100); });
    TLM.newsAfterMatch(state, fixture, res);
    fixture.result.top = topPerformer(res);
    return fixture;
  }
  function topPerformer(res) { let b = null; for (const pid in res.playerStats) { const s = res.playerStats[pid]; if (s.rating && (!b || s.rating > b.rating)) b = { pid, rating: s.rating }; } return b; }

  Object.assign(TLM, { simulateMatch, applyMatchResult, rateMatch: rate, topPerformer });
})(typeof globalThis !== 'undefined' ? globalThis : this);

}

// ---- tlm-news.js
{
/* LFO MANAGER — NOTICIAS Y STUDIO ANALYSIS. Todo por plantillas deterministas (hash del partido) + reglas:
   sin IA generativa y sin inventar datos — cada frase sólo se emite si la condición se cumple con datos reales. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { hash01, addNews } = TLM;

  const pickT = (arr, seed) => arr[Math.floor(hash01(seed) * arr.length) % arr.length];
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] != null ? o[k] : ''));
  const T = (key, seed, o) => fmt(pickT(TXT[key], seed + key), o);

  const TXT = {
    hugeWin: ['{w} golea {a}-{b} a {l} y manda un mensaje al resto de la liga.', 'Paliza de {w}: {a}-{b} frente a {l}.', 'Sin discusión: {w} arrasa a {l} por {a}-{b}.'],
    upset: ['Sorpresa: {w} supera a {l} ({a}-{b}) pese a ser, sobre el papel, el equipo inferior.', '{w} da el golpe ante {l} con un {a}-{b} inesperado.'],
    derbyDraw: ['{h} y {aw} igualan {a}-{b} en un partido muy disputado.', 'Reparto de puntos entre {h} y {aw}: {a}-{b}.'],
    hattrick: ['¡Triplete! {p} marca tres goles para {c}.', '{p} firma un hat-trick con la camiseta de {c}.'],
    brace: ['{p} anota un doblete para {c}.', 'Doblete de {p}: {c} se lleva el partido.'],
    streakW: ['{c} suma {n} victorias consecutivas.', 'Racha ganadora: {c} ya encadena {n} triunfos.'],
    streakL: ['{c} acumula {n} derrotas seguidas y su técnico está en el centro de las críticas.', 'Mala racha para {c}: {n} partidos sin ganar consecutivos perdidos.'],
    unbeaten: ['{c} lleva {n} partidos sin perder.', 'Invicto de {c}: {n} jornadas sin conocer la derrota.'],
    debut: ['{p} ({age}) debuta con {c}.', 'Debut en primera para {p}, de {age} años, en {c}.'],
    formPlayer: ['{p} atraviesa un gran momento de forma en {c}.', '{p} viene en racha: nueva actuación destacada con {c}.'],
    leader: ['{c} se instala como líder de la tabla.', '{c} manda en la clasificación tras la jornada {r}.'],
  };

  function newsAfterMatch(state, fx, res) {
    const comp = state.competitions[fx.competitionId], H = state.clubs[fx.homeId], A = state.clubs[fx.awayId], [a, b] = res.score, seed = fx.id;
    const diff = Math.abs(a - b), W = a > b ? H : b > a ? A : null, L = a > b ? A : b > a ? H : null;
    if (W && diff >= 4) addNews(state, 'result', T('hugeWin', seed, { w: W.name, l: L.name, a: Math.max(a, b), b: Math.min(a, b) }), { fixtureId: fx.id });
    else if (W && W.reputation + 8 < L.reputation && diff >= 1) addNews(state, 'result', T('upset', seed, { w: W.name, l: L.name, a: Math.max(a, b), b: Math.min(a, b) }), { fixtureId: fx.id });
    else if (!W && a >= 3) addNews(state, 'result', T('derbyDraw', seed, { h: H.name, aw: A.name, a, b }), { fixtureId: fx.id });
    for (const pid in res.playerStats) {
      const s = res.playerStats[pid], p = state.players[pid], club = state.clubs[p.clubId];
      if (!club) continue;
      if (s.goals >= 3) addNews(state, 'player', T('hattrick', seed + pid, { p: p.canonicalName, c: club.name }), { playerId: pid });
      else if (s.goals === 2 && p.overall < 78) addNews(state, 'player', T('brace', seed + pid, { p: p.canonicalName, c: club.name }), { playerId: pid });
      if (p.seasonStats.matches === 1 && s.minutes > 0 && p.age <= 20 && p.careerHistory.length === 0) addNews(state, 'player', T('debut', seed + pid, { p: p.canonicalName, age: p.age, c: club.name }), { playerId: pid });
    }
    for (const pid in res.playerStats) {
      const p = state.players[pid], club = state.clubs[p.clubId]; if (!club || res.playerStats[pid].minutes <= 0) continue;
      if (p.form >= 84 && p.seasonStats.matches >= 4 && !p.formNews) { p.formNews = state.currentMatchday; addNews(state, 'player', T('formPlayer', seed + pid + 'f', { p: p.canonicalName, c: club.name }), { playerId: pid }); }
      else if (p.formNews && p.form < 70) p.formNews = 0;
    }
    for (const c of [H, A]) {
      const rec = TLM.recentResults(state, comp, c.id, 6);
      const run = (t) => { let n = 0; for (let i = rec.length - 1; i >= 0 && t(rec[i]); i--) n++; return n; };
      const w = run((x) => x.res === 'W'), l = run((x) => x.res === 'L'), u = run((x) => x.res !== 'L');
      if (w === 3 || w === 5) addNews(state, 'streak', T('streakW', seed + c.id, { c: c.name, n: w }), { clubId: c.id });
      else if (l === 3) addNews(state, 'streak', T('streakL', seed + c.id, { c: c.name, n: l }), { clubId: c.id });
      else if (u === 6) addNews(state, 'streak', T('unbeaten', seed + c.id, { c: c.name, n: u }), { clubId: c.id });
    }
    void comp;
  }

  // Noticia de líder cada 5 jornadas (llamada desde advance)
  function roundNews(state) {
    const comp = TLM.mainComp(state), r = (TLM.currentRound(state, comp) || comp.calendar.length + 1) - 1;
    if (r >= 3 && r % 5 === 0) { const t = TLM.computeTable(state, comp)[0]; addNews(state, 'table', T('leader', 'lead' + r, { c: state.clubs[t.clubId].name, r }), { clubId: t.clubId }); }
  }

  // ================== STUDIO ANALYSIS ENGINE (2 presentadores 3D: A analítico, B narrativo) ==================
  // Devuelve [['A'|'B', texto]]. Todas las frases dependen de datos reales del MatchResult o de la tabla.
  const S = {
    open: ['Bienvenidos al análisis. {h} y {aw} nos dejaron un {a}-{b}.', 'Terminó el partido en {st}: {h} {a}, {aw} {b}.'],
    winPos: ['{w} se quedó con los tres puntos y ahora es {pos}° en la tabla con {pts} unidades.', 'Con este triunfo, {w} sube al {pos}° puesto ({pts} puntos).'],
    drawPos: ['El empate deja a {c} en el {pos}° lugar, con {pts} puntos.'],
    lossPos: ['{l} cae al {pos}° puesto tras la derrota.', 'Duro golpe para {l}, que queda {pos}° en la clasificación.'],
    poss: ['{n} controló gran parte del encuentro con la pelota ({x}% de posesión).', 'El dominio de la posesión fue para {n}: {x}%.'],
    shotsDiff: ['El volumen ofensivo terminó siendo una de las claves del partido: {x} tiros de {n} contra {y}.', '{n} disparó {x} veces contra {y} del rival: se notó en el trámite.'],
    xg: ['Las ocasiones respaldan el resultado: xG {x} de {n} frente a {y}.', 'Según el xG, {n} generó más peligro ({x} a {y}).'],
    xgUnfair: ['Curioso: el xG favorecía a {n} ({x} a {y}) pero el marcador no lo reflejó.'],
    subGoal: ['El cambio desde el banquillo tuvo impacto inmediato: {p} marcó tras entrar.', '{p} salió del banco y anotó: el técnico acertó con el cambio.'],
    early: ['El gol temprano de {p} (min. {m}) condicionó el partido.', 'Muy pronto, en el {m}′, golpeó {p}.'],
    late: ['Y un final dramático: {p} marcó en el minuto {m}.', 'Tarde pero con premio: gol de {p} a los {m} minutos.'],
    comeback: ['Gran remontada de {w}: llegó a ir perdiendo y terminó ganando.', '{w} dio vuelta el partido: carácter de campeón.'],
    cards: ['Hubo {n} tarjeta{s} en el partido; el juego fue áspero por momentos.', 'Se repartieron {n} amarilla{s}: mucha fricción.'],
    red: ['La expulsión de {p} cambió el rumbo del partido.', 'Con la roja a {p}, {c} tuvo que replantear todo.'],
    save: ['{p} fue figura bajo los tres palos con {x} atajadas.', 'Gran partido del arquero {p}: {x} intervenciones.'],
    mvp: ['La figura del partido: {p}, con {r} de valoración.', '{p} ({r}) fue el mejor de la cancha según nuestros datos.'],
    goals: ['Goles de {list}.', 'Marcaron {list}.'],
    assist: ['Una asistencia de {p} para el tanto de {q}.'],
    formLine: ['{c} acumula {r} en sus últimos partidos.', 'La racha reciente de {c}: {r}.'],
    tightGame: ['Partido cerrado, con pocas ocasiones.', 'Encuentro trabado: apenas {x} tiros entre los dos.'],
    wild: ['Un partido de ida y vuelta con {x} goles.', '{x} goles: no hubo respiro para las defensas.'],
    subs: ['{c} hizo {n} cambio{s} y modificó su planteo.'],
    close: ['Eso es todo por hoy. Nos vemos en la próxima jornada.', 'Hasta la próxima fecha, con más análisis.'],
  };
  Object.assign(TXT, S);
  const FORMSTR = (rs) => rs.map((x) => ({ W: 'V', D: 'E', L: 'D' }[x.res])).join(' ');

  function studioAnalysis(state, fx, res) {
    const comp = state.competitions[fx.competitionId], H = state.clubs[fx.homeId], A = state.clubs[fx.awayId], seed = fx.id + '|studio', [a, b] = res.score, out = [];
    const table = TLM.computeTable(state, comp), pos = (id) => table.find((r) => r.clubId === id);
    const name = (pid) => (state.players[pid] ? state.players[pid].canonicalName : 'un jugador');
    const W = a > b ? H : b > a ? A : null, L = a > b ? A : b > a ? H : null;
    out.push(['A', T('open', seed, { h: H.name, aw: A.name, a, b, st: a + '-' + b })]);
    if (comp.format === 'cup') out.push(...TLM.cupStudioLines(state, fx, res));
    else if (W) { const r = pos(W.id); out.push(['B', T('winPos', seed, { w: W.name, pos: r.pos, pts: r.points })]); const lr = pos(L.id); if (Math.abs(lr.pos - r.pos) >= 0) out.push(['A', T('lossPos', seed, { l: L.name, pos: lr.pos })]); }
    else { const r = pos(H.id); out.push(['B', T('drawPos', seed, { c: H.name, pos: r.pos, pts: r.points })]); }
    if (res.possession && Math.max(...res.possession) >= 58) { const i = res.possession[0] > res.possession[1] ? 0 : 1; out.push(['A', T('poss', seed, { n: [H, A][i].name, x: res.possession[i] })]); }
    if (res.shots && Math.abs(res.shots[0] - res.shots[1]) >= 7) { const i = res.shots[0] > res.shots[1] ? 0 : 1; out.push(['B', T('shotsDiff', seed, { n: [H, A][i].name, x: res.shots[i], y: res.shots[1 - i] })]); }
    if (res.xg && Math.abs(res.xg[0] - res.xg[1]) >= 0.9) {
      const i = res.xg[0] > res.xg[1] ? 0 : 1, xgWon = W === [H, A][i];
      out.push(['A', T(xgWon ? 'xg' : 'xgUnfair', seed, { n: [H, A][i].name, x: res.xg[i].toFixed(1), y: res.xg[1 - i].toFixed(1) })]);
    }
    const gs = res.goalScorers || [];
    if (gs.length) {
      const first = gs[0], last = gs[gs.length - 1];
      if (first.minute <= 12) out.push(['B', T('early', seed, { p: name(first.pid), m: first.minute })]);
      if (last.minute >= 85 && gs.length > 1) out.push(['B', T('late', seed, { p: name(last.pid), m: last.minute })]);
      const sc = [0, 0]; let trailed = [false, false]; gs.forEach((x) => { sc[x.team]++; if (sc[0] < sc[1]) trailed[0] = true; if (sc[1] < sc[0]) trailed[1] = true; });
      if (W && trailed[W === H ? 0 : 1]) out.push(['A', T('comeback', seed, { w: W.name })]);
      const subIn = new Map((res.substitutions || []).map((s) => [s.inPid, s.minute]));
      const sg = gs.find((x) => subIn.has(x.pid) && x.minute >= subIn.get(x.pid)); if (sg) out.push(['A', T('subGoal', seed, { p: name(sg.pid) })]);
      const withAs = gs.find((x) => x.assistPid); if (withAs && gs.length <= 4) out.push(['B', T('assist', seed, { p: name(withAs.assistPid), q: name(withAs.pid) })]);
      const list = gs.map((x) => `${name(x.pid)} (${x.minute}′)`).join(', '); out.push(['B', T('goals', seed, { list })]);
    }
    const yc = (res.yellow || [0, 0]).reduce((x, y) => x + y, 0); if (yc >= 6) out.push(['A', T('cards', seed, { n: yc, s: yc > 1 ? 's' : '' })]);
    const rp = Object.values(res.playerStats).find((s) => s.red); if (rp) out.push(['A', T('red', seed, { p: name(rp.pid), c: state.clubs[state.players[rp.pid].clubId].name })]);
    const gkTop = Object.values(res.playerStats).filter((s) => s.saves >= 5).sort((x, y) => y.saves - x.saves)[0]; if (gkTop) out.push(['A', T('save', seed, { p: name(gkTop.pid), x: gkTop.saves })]);
    if (a + b <= 1 && res.shots && res.shots[0] + res.shots[1] < 14) out.push(['B', T('tightGame', seed, { x: res.shots[0] + res.shots[1] })]); else if (a + b >= 5) out.push(['B', T('wild', seed, { x: a + b })]);
    [H, A].forEach((c, i) => { const n = (res.substitutions || []).filter((s) => s.team === i).length; if (n >= 3) out.push(['B', T('subs', seed + i, { c: c.name, n, s: n > 1 ? 's' : '' })]); });
    const top = TLM.topPerformer(res); if (top) out.push(['B', T('mvp', seed, { p: name(top.pid), r: top.rating.toFixed(1) })]);
    const rec = TLM.recentResults(state, comp, W ? W.id : H.id, 5); if (rec.length >= 3 && comp.format !== 'cup') out.push(['A', T('formLine', seed, { c: (W || H).name, r: FORMSTR(rec) })]);
    out.push(['A', T('close', seed, {})]);
    return out;
  }

  // Previa: sólo contexto real de liga (posición, forma, bajas) — complementa el análisis táctico de TLB.
  function studioPre(state, fx) {
    const comp = state.competitions[fx.competitionId], H = state.clubs[fx.homeId], A = state.clubs[fx.awayId], table = TLM.computeTable(state, comp), out = [];
    const rh = table.find((r) => r.clubId === H.id), ra = table.find((r) => r.clubId === A.id);
    if (comp.format === 'cup') out.push(...TLM.cupPreLines(state, fx));
    else if (rh && rh.played) out.push(['A', `${H.name} llega ${rh.pos}° con ${rh.points} puntos; ${A.name}, ${ra.pos}° con ${ra.points}.`]);
    else out.push(['A', `Arranca la temporada para ${H.name} y ${A.name}: todo por escribirse.`]);
    for (const c of [H, A]) { const rec = TLM.recentResults(state, comp.format === 'cup' ? TLM.mainComp(state) : comp, c.id, 5); if (rec.length >= 2) out.push(['B', `Últimos resultados de ${c.name}: ${FORMSTR(rec)}.`]); }
    for (const c of [H, A]) { const inj = c.squad.map((id) => state.players[id]).filter((p) => p.injury && p.overall >= 66); if (inj.length) out.push(['B', `${c.name} tiene bajas por lesión: ${inj.slice(0, 2).map((p) => p.canonicalName).join(' y ')}.`]); }
    return out;
  }

  // Sólo el contexto de liga (posición, racha): lo suma el estudio 3D del broadcast a su análisis del partido.
  function studioLeagueLines(state, fx, res) {
    if (state.competitions[fx.competitionId].format === 'cup') return TLM.cupStudioLines(state, fx, res);
    const keep = ['winPos', 'drawPos', 'lossPos', 'formLine'], all = studioAnalysis(state, fx, res), seed = fx.id + '|studio', out = [];
    for (const [w, t] of all) if (keep.some((k) => S[k].some((tpl) => sameShape(tpl, t)))) out.push([w, t]);
    void seed; return out;
  }
  // ¿la frase t salió de la plantilla tpl? (compara las partes fijas de la plantilla)
  function sameShape(tpl, t) { return tpl.split(/\{\w+\}/).filter((x) => x.length > 6).every((frag) => t.includes(frag)); }

  Object.assign(TLM, { newsAfterMatch, roundNews, studioAnalysis, studioPre, studioLeagueLines });
})(typeof globalThis !== 'undefined' ? globalThis : this);

}

// ---- tlm-cup.js
{
/* LFO MANAGER — COPAS DE ELIMINATORIA (La Cupidité). JS puro, sin DOM.
   Una copa es una competición más (state.competitions['cup_<id>']) con su propio cuadro de partido único.
   Los partidos son fixtures normales (mismo simulador, mismo motor 3D, mismas estadísticas y finanzas); si terminan
   empatados se define por penales.

   FORMATO DE LA CUPIDITÉ (los porcentajes se aplican a la cantidad de jornadas de la liga; con 34 jornadas el corte es la J14):
     · CLASIFICACIÓN — 8 clubes de la LFO (los 8 primeros de la tabla en la jornada de corte, ≈40 % de la liga) y 8 clubes del
       Continente Viejo (los 9 invitados de tlm-data.js GUEST_CLUBS: los 7 mejores entran directo; los dos últimos juegan una
       RONDA PREVIA y el ganador ocupa el octavo lugar). Antes del corte, los clasificados son provisorios.
     · CUADRO — Ronda previa (1 partido) · Octavos · Cuartos · Semifinales · Final. Todo a partido único: si hay empate a los 90′,
       penales. Cada ronda se juega entre semana (miércoles) después de una jornada de liga (≈47 %, 53 %, 67 %, 80 % y 93 % de la liga).
     · SIEMBRA — por reputación (el mejor sembrado enfrenta al ganador de la previa).
     · PREMIOS — por cada ronda superada; subcampeón y campeón aparte.
   Los invitados NO juegan la liga: son clubes del Continente Viejo (state.clubs[id].foreign = true), sin mercado ni finanzas propias.

   Estado (todo serializable): state.cups[id] = { id, season, format:2, status:'qualifying'|'active'|'done'|'skipped', cutRound, hasPrelim,
   entrants[16 | null en el hueco de la previa], slots[], rounds[{name, fixtureIds, done}], champion, runnerUp },
   state.cupPending = { cupId, idx } | null, state.history.cups[id] = [ {season, champion…} ].
   Las copas guardadas con el formato anterior (sin format) se terminan con el formato anterior. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { clamp, round, R, addNews, addTx } = TLM;

  // Definición estática de cada copa. Agregar otra = agregar una entrada.
  const CUPS = {
    cupidite: {
      id: 'cupidite', name: 'La Cupidité', shortName: 'CUPIDITÉ', motto: 'Ad astra per aspera', size: 16, leagueSpots: 8, pkg: 'cupidite',
      crest: 'equiposfut/cupidite/icon.png', logo: 'equiposfut/cupidite/logo.png', wordmark: 'equiposfut/cupidite/wordmark.png', trophy: 'equiposfut/cupidite/icon.png',
      cut: 0.40,                                     // fracción de la liga jugada al cerrarse la clasificación
      slots: [0.47, 0.53, 0.67, 0.80, 0.93],         // fracción de la liga jugada antes de la previa, octavos, cuartos, semis y final
      prizes: [1.5e6, 2.5e6, 4e6, 8e6],              // por ganar octavos, cuartos, semifinales y la final (campeón)
      prelimPrize: 0.6e6, finalist: 3e6, appearance: 0.8e6,
    },
  };
  const ROUND_NAMES = { 64: 'Ronda de 64', 32: 'Dieciseisavos de final', 16: 'Octavos de final', 8: 'Cuartos de final', 4: 'Semifinales', 2: 'Final' };
  const roundName = (n) => ROUND_NAMES[n] || `Ronda de ${n}`;
  const PRELIM = 'Ronda previa';
  const compId = (id) => 'cup_' + id;
  const league = (state) => state.competitions[state.worldConfigId];
  const isNew = (cup) => cup.format === 2;
  const off = (cup) => (cup.hasPrelim ? 1 : 0);

  // Orden clásico de cuadro: 1-16, 8-9, 4-13, 5-12, 2-15, 7-10, 3-14, 6-11 (los mejores sembrados se cruzan lo más tarde posible).
  function bracketOrder(n) {
    let o = [1];
    while (o.length < n) { const m = o.length * 2 + 1; o = o.flatMap((x) => [x, m - x]); }
    return o;
  }
  const pow2Le = (n) => { let s = 2; while (s * 2 <= n) s *= 2; return s; };

  // ---------------------------------------------------------------- clubes invitados (Continente Viejo)
  const guestIds = (state) => Object.keys(state.clubs).filter((id) => state.clubs[id].foreign);
  const guestsByRep = (state) => guestIds(state).sort((a, b) => state.clubs[b].reputation - state.clubs[a].reputation || (a < b ? -1 : 1));

  // Crea los clubes invitados que falten (idempotente: sirve para carreras nuevas y para partidas viejas).
  function ensureGuests(state) {
    const have = new Set(guestIds(state).map((id) => state.clubs[id].name));
    const todo = (TLM.GUEST_CLUBS || []).filter((c) => !have.has(c.name));
    if (!todo.length) return false;
    // los invitados se generan con su propio generador: crearlos no altera el resto del mundo (la liga ni sus partidos)
    const keepRng = state.rngState; state.rngState = ((state.seed ^ 0x51ed270b) >>> 0) || 1;
    const r = R(state), used = TLM.usedNames(state);
    todo.forEach((c) => {
      const club = TLM.newClub(state, Object.assign({}, c, { foreign: true, base: false, balance: TLM.startingBalance(c.rep), profile: c.profile }));
      club.tactics.formation = r.pick(TLM.AI_PROFILES[club.aiProfile].formations);
      TLM.applyProfileTactics(club);
      TLM.fillSquad(state, club, c, used);
      // los jugadores de las naciones del Continente Viejo llevan nombres de su región
      for (const pid of club.squad) {
        const p = state.players[pid]; if (p.rosterId) continue;
        const pool = TLM.NAMES_VIEJO[p.nationality && g.LFONations && g.LFONations.get(p.nationality) ? g.LFONations.get(p.nationality).id : ''];
        if (!pool) continue;
        for (let k = 0; k < 30; k++) { const n = r.pick(pool.first) + ' ' + r.pick(pool.last); if (!used.has(n)) { used.delete(p.canonicalName); used.add(n); p.canonicalName = n; break; } }
      }
      // contratos de largo plazo: los invitados no renuevan ni venden jugadores en el mercado de la liga
      for (const pid of club.squad) { const p = state.players[pid]; p.contract.endSeason = state.season + 40; p.contract.salary = 0; p.salary = 0; }
      TLM.autoLineup(state, club);
    });
    state.rngState = keepRng;
    return true;
  }

  // ---------------------------------------------------------------- clasificación
  function leagueTop(state, n) {
    const lg = league(state), tb = TLM.computeTable(state, lg);
    // antes del primer partido la tabla no dice nada: el pronóstico sale de la reputación de los clubes
    if (tb.every((r) => r.played === 0)) return lg.teams.slice().sort((a, b) => state.clubs[b].reputation - state.clubs[a].reputation).slice(0, n);
    return tb.slice(0, n).map((r) => r.clubId);
  }
  // Clasificados para mostrar y para sortear. Devuelve {league[], guests[], prelim[]|null, size, seeded[]}
  function qualifiers(state, def) {
    ensureGuests(state);
    const lg = league(state), spots = Math.min(def.leagueSpots, lg.teams.length), lgIds = leagueTop(state, spots), gs = guestsByRep(state);
    const total = lgIds.length + gs.length, size = Math.min(def.size, pow2Le(total));
    let direct = gs.slice(), prelim = null;
    if (size === def.size && total === size + 1) { prelim = gs.slice(-2); direct = gs.slice(0, -2); }
    else if (total > size) direct = gs.slice(0, gs.length - (total - size));
    const rep = (id) => state.clubs[id].reputation;
    const seeded = lgIds.concat(direct).sort((a, b) => rep(b) - rep(a) || (a < b ? -1 : 1));
    return { league: lgIds, guests: direct, prelim, size, seeded };
  }

  function slotRounds(total, def, n) {
    const out = []; let prev = Math.max(2, round(total * def.cut));
    def.slots.slice(-n).forEach((f) => { const v = clamp(Math.max(round(total * f), prev + 1), 2, total - 1); out.push(v); prev = v; });
    return out;
  }

  function makeComp(state, def) {
    const c = { id: compId(def.id), name: def.name, country: null, crest: def.crest, teams: [], leagueSize: 0, format: 'cup', cupId: def.id, rounds: 1,
      pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0, tieBreakRules: ['points', 'name'], calendar: [], byes: [], activeSeason: state.season, status: 'active', level: 2 };
    state.competitions[c.id] = c;
    return c;
  }

  // Crea la copa de la temporada actual. Arranca en 'qualifying' (clasificación abierta) hasta la jornada de corte.
  function initCup(state, def) {
    const lg = league(state); if (!lg || !lg.calendar.length) return null;
    ensureGuests(state);
    const total = lg.calendar.length, hasPrelim = def.size === 16 && (Math.min(def.leagueSpots, lg.teams.length) + guestIds(state).length === def.size + 1);
    const nRounds = Math.log2(def.size) + (hasPrelim ? 1 : 0);
    const cup = { id: def.id, format: 2, season: state.season, status: 'qualifying', cutRound: clamp(round(total * def.cut), 1, total - 2), hasPrelim, size: def.size, entrants: [], slots: slotRounds(total, def, nRounds), rounds: [], champion: null, runnerUp: null };
    state.cups[def.id] = cup;
    makeComp(state, def);
    const cur = TLM.currentRound(state, lg);
    if (cur != null && cur > cup.slots[0]) { cup.status = 'skipped'; state.competitions[compId(def.id)].status = 'skipped'; return cup; }   // partida vieja empezada tarde
    if (cur != null && cur > cup.cutRound) finalize(state, cup, def);
    return cup;
  }

  // Cierra la clasificación: fija los 16 participantes y sortea la primera ronda.
  function finalize(state, cup, def) {
    const q = qualifiers(state, def), comp = state.competitions[compId(cup.id)];
    cup.size = q.size; cup.hasPrelim = !!q.prelim;
    cup.qualified = { league: q.league, guests: q.guests, prelim: q.prelim };
    cup.entrants = q.seeded.slice();
    if (q.prelim) cup.entrants.push(null);                    // hueco del ganador de la ronda previa (el peor sembrado)
    cup.slots = slotRounds(league(state).calendar.length, def, Math.log2(cup.size) + (cup.hasPrelim ? 1 : 0));
    comp.teams = cup.entrants.filter(Boolean).concat(q.prelim || []); comp.leagueSize = comp.teams.length;
    cup.status = 'active';
    drawRound(state, cup, 0);
    const lgN = q.league.length, gN = q.guests.length + (q.prelim ? 1 : 0);
    addNews(state, 'cup', `Se cerró la clasificación de ${def.name}: ${lgN} clubes de la liga y ${gN} del Continente Viejo${q.prelim ? ` (${state.clubs[q.prelim[0]].name} y ${state.clubs[q.prelim[1]].name} definen el último lugar en la ronda previa)` : ''}.`);
    return cup;
  }

  // Crea los fixtures de la ronda idx.
  function drawRound(state, cup, idx) {
    const comp = state.competitions[compId(cup.id)], o = off(cup);
    let pairs, name, seedOf;
    if (cup.hasPrelim && idx === 0) { pairs = [cup.qualified.prelim.slice()]; name = PRELIM; seedOf = (id) => state.clubs[id].reputation * -1; }
    else if (idx === o) {                                         // primera ronda del cuadro principal, sembrada
      if (cup.hasPrelim) { const pf = state.fixtures[cup.rounds[0].fixtureIds[0]]; cup.entrants[cup.entrants.length - 1] = pf.result.winnerId; comp.teams = cup.entrants.filter(Boolean); }
      const order = bracketOrder(cup.size); pairs = [];
      for (let i = 0; i < order.length; i += 2) pairs.push([cup.entrants[order[i] - 1], cup.entrants[order[i + 1] - 1]]);
      name = roundName(cup.size); seedOf = (id) => cup.entrants.indexOf(id);
    } else {
      const prev = cup.rounds[idx - 1].fixtureIds.map((id) => state.fixtures[id]); pairs = [];
      for (let i = 0; i < prev.length; i += 2) pairs.push([prev[i].result.winnerId, prev[i + 1].result.winnerId]);
      name = roundName(pairs.length * 2); seedOf = (id) => cup.entrants.indexOf(id);
    }
    const ids = [];
    pairs.forEach(([a, b], n) => {
      const [home, away] = seedOf(a) <= seedOf(b) ? [a, b] : [b, a];
      const id = `fx_cup_${cup.id}_${cup.season}_${idx + 1}_${n + 1}`;
      state.fixtures[id] = { id, competitionId: comp.id, season: cup.season, round: idx + 1, homeId: home, awayId: away, status: 'scheduled', result: null, cup: { id: cup.id, idx, tie: n, roundName: name } };
      ids.push(id);
    });
    cup.rounds[idx] = { name, fixtureIds: ids, done: false };
    comp.calendar[idx] = ids;
    return cup.rounds[idx];
  }

  function ensure(state) {
    if (!state.cups) state.cups = {};
    if (!state.history.cups) state.history.cups = {};
    ensureGuests(state);
    for (const id in CUPS) if (!state.cups[id]) initCup(state, CUPS[id]);
    return state.cups;
  }

  // ---------------------------------------------------------------- penales
  function shootout(state, fx) {
    const r = R(state), sides = [state.clubs[fx.homeId], state.clubs[fx.awayId]];
    const takers = sides.map((c) => {
      const xi = c.lineup.xi.filter(Boolean).map((id) => state.players[id]).filter((p) => p && p.primaryPosition !== 'POR');
      const eff = (p) => TLM.effectiveStats(p, c).shooting;
      return xi.sort((a, b) => eff(b) - eff(a)).map((p) => ({ p, s: eff(p) }));
    });
    const gk = sides.map((c) => TLM.lineRatings(state, c).gk);
    const kick = (t, i) => { const tk = takers[t][i % Math.max(1, takers[t].length)]; const s = tk ? tk.s : 65; return r.chance(clamp(0.76 + (s - 70) * 0.004 - (gk[1 - t] - 68) * 0.003, 0.5, 0.92)); };
    const score = [0, 0], seq = [[], []];
    let i = 0, done = false;
    for (; i < 5 && !done; i++) {
      for (const t of [0, 1]) {
        const ok = kick(t, i); seq[t].push(ok); if (ok) score[t]++;
        const left = [5 - seq[0].length, 5 - seq[1].length];
        if (score[0] > score[1] + left[1] || score[1] > score[0] + left[0]) { done = true; break; }
      }
    }
    while (!done && i < 30) {                 // muerte súbita
      const a = kick(0, i), b = kick(1, i); seq[0].push(a); seq[1].push(b); if (a) score[0]++; if (b) score[1]++;
      if (a !== b) done = true; i++;
    }
    if (score[0] === score[1]) score[r.chance(0.5) ? 0 : 1]++;
    return { pens: score, seq };
  }

  // Después de registrar un resultado de copa: decide quién pasa, paga premios y, si la ronda terminó, sortea la siguiente.
  function afterMatch(state, fx, res) {
    if (!fx.cup) return null;
    const cup = state.cups[fx.cup.id], def = CUPS[fx.cup.id], r = fx.result;
    if (r.hg !== r.ag) r.winnerId = r.hg > r.ag ? fx.homeId : fx.awayId;
    else if (res && res.pens && res.pens[0] !== res.pens[1]) { r.pens = res.pens.slice(); r.pensSeq = res.pensSeq || null; r.winnerId = r.pens[0] > r.pens[1] ? fx.homeId : fx.awayId; } // tanda jugada en 3D
    else { const so = shootout(state, fx); r.pens = so.pens; r.pensSeq = so.seq; r.winnerId = so.pens[0] > so.pens[1] ? fx.homeId : fx.awayId; }
    const W = state.clubs[r.winnerId], L = state.clubs[r.winnerId === fx.homeId ? fx.awayId : fx.homeId];
    const isFinal = fx.cup.roundName === 'Final', isPrelim = fx.cup.roundName === PRELIM;
    const mainIdx = fx.cup.idx - (isNew(cup) ? off(cup) : 0);
    const prize = isPrelim ? def.prelimPrize : def.prizes[Math.min(def.prizes.length - 1, Math.max(0, mainIdx + (def.prizes.length - Math.log2(cup.size))))];
    addTx(state, W, 'prize', prize, `${def.name}: ${fx.cup.roundName} superada`);
    const sc = r.pens ? `${r.hg}-${r.ag} (pen. ${r.pens[0]}-${r.pens[1]})` : `${r.hg}-${r.ag}`;
    if (isFinal) {
      addTx(state, L, 'prize', def.finalist, `${def.name}: subcampeón`);
      cup.champion = W.id; cup.runnerUp = L.id; cup.status = 'done';
      W.reputation = clamp(W.reputation + 1.5, 1, 100); L.reputation = clamp(L.reputation + 0.5, 1, 100);
      W.history.cups = (W.history.cups || 0) + 1;
      (state.history.cups[cup.id] = state.history.cups[cup.id] || []).push({ season: cup.season, champion: W.id, championName: W.name, championNation: W.nation || null, runnerUp: L.id, runnerUpName: L.name, score: sc });
      addNews(state, 'cup', `${W.name} conquista ${def.name} tras vencer a ${L.name} en la final (${sc}).`, { clubId: W.id, fixtureId: fx.id });
    } else if (W.controlledBy === 'user' || L.controlledBy === 'user' || W.reputation + 8 < L.reputation || isPrelim) {
      addNews(state, 'cup', `${def.name} · ${fx.cup.roundName}: ${W.name} elimina a ${L.name} (${sc}).`, { clubId: W.id, fixtureId: fx.id });
    }
    const rd = cup.rounds[fx.cup.idx];
    if (rd.fixtureIds.every((id) => state.fixtures[id].status === 'played' && state.fixtures[id].result.winnerId)) {
      rd.done = true;
      if (!isFinal) drawRound(state, cup, fx.cup.idx + 1);
    }
    void res;
    return r;
  }

  // ---------------------------------------------------------------- calendario
  const pendingOf = (state) => (state.cupPending ? state.cupPending : null);
  function pendingRound(state) {
    const p = pendingOf(state); if (!p) return null;
    const cup = state.cups[p.cupId], rd = cup && cup.rounds[p.idx]; if (!rd) { state.cupPending = null; return null; }
    return { cup, def: CUPS[cup.id], idx: p.idx, round: p.idx + 1, name: rd.name, fixtures: rd.fixtureIds.map((id) => state.fixtures[id]) };
  }
  function pendingFixtureFor(state, clubId) { const p = pendingRound(state); return p ? p.fixtures.find((f) => f.homeId === clubId || f.awayId === clubId) || null : null; }

  // Fecha real de una ronda: el miércoles siguiente a la jornada de liga en la que se inserta.
  function roundDate(state, cup, idx) {
    const lg = league(state), d = TLM.dateOfRound(cup.season, cup.slots[idx], lg.calendar.length);
    return new Date(d.getTime() + 4 * 86400000);
  }
  const fmtDate = (d, short) => d.toLocaleDateString('es-AR', Object.assign({ timeZone: 'UTC' }, short ? { weekday: 'short', day: 'numeric', month: 'short' } : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  const dateStr = (state, cup, idx, short) => fmtDate(roundDate(state, cup, idx), short);

  // Simula todos los partidos sin jugar de la ronda (los clubes IA preparan su once como en liga).
  function simulateRound(state, cup, idx) {
    const out = [];
    for (const id of cup.rounds[idx].fixtureIds) {
      const f = state.fixtures[id]; if (f.status === 'played') continue;
      for (const [cid, oid, home] of [[f.homeId, f.awayId, true], [f.awayId, f.homeId, false]]) if (state.clubs[cid].controlledBy !== 'user') TLM.aiPrepareMatch(state, state.clubs[cid], state.clubs[oid], home);
      const res = TLM.simulateMatch(state, f); TLM.applyMatchResult(state, f, res); afterMatch(state, f, res);
      out.push({ fixtureId: f.id, score: res.score, pens: f.result.pens || null, winnerId: f.result.winnerId });
    }
    return out;
  }

  // Después de cerrar la jornada de liga `leagueRound`: cierra la clasificación si toca y, si hay ronda de copa, queda pendiente
  // (o se juega sola si el usuario no está).
  function afterLeagueRound(state, leagueRound) {
    const info = [];
    ensure(state);
    for (const id in state.cups) {
      const cup = state.cups[id];
      if (cup.status === 'qualifying' && leagueRound >= cup.cutRound) { finalize(state, cup, CUPS[id]); info.push({ cupId: id, qualified: true }); }
      if (cup.status !== 'active') continue;
      const idx = cup.slots.indexOf(leagueRound); if (idx < 0 || !cup.rounds[idx] || cup.rounds[idx].done) continue;
      const hum = state.humanClubs && state.humanClubs.length ? state.humanClubs : [state.currentClubId];   // liga online: cualquier DT humano en la ronda la deja pendiente (se juega en vivo)
      const mine = state.onlineLive || cup.rounds[idx].fixtureIds.map((fid) => state.fixtures[fid]).some((f) => hum.includes(f.homeId) || hum.includes(f.awayId));   // liga online: todas las rondas de copa se juegan en vivo
      if (mine) { state.cupPending = { cupId: id, idx }; info.push({ cupId: id, idx, pending: true, name: cup.rounds[idx].name }); }
      else { const res = simulateRound(state, cup, idx); info.push({ cupId: id, idx, pending: false, name: cup.rounds[idx].name, results: res }); }
    }
    return info;
  }

  // Cierra la ronda pendiente (el usuario ya jugó): simula el resto y libera la liga.
  function closePending(state) {
    const p = pendingRound(state); if (!p) return null;
    const results = simulateRound(state, p.cup, p.idx);
    state.cupPending = null;
    return { cupId: p.cup.id, idx: p.idx, name: p.name, results, done: p.cup.rounds[p.idx].done, champion: p.cup.champion };
  }

  // Al terminar la temporada de liga: lo que quede de la copa se juega solo; luego arranca la copa nueva.
  function endSeason(state) {
    for (const id in state.cups) {
      const cup = state.cups[id];
      if (cup.status === 'qualifying') finalize(state, cup, CUPS[id]);
      for (let idx = 0; idx < 8 && cup.status === 'active'; idx++) { if (!cup.rounds[idx]) break; if (!cup.rounds[idx].done) simulateRound(state, cup, idx); }
    }
    state.cupPending = null;
  }
  function newSeason(state) {
    for (const id in CUPS) { delete state.cups[id]; delete state.competitions[compId(id)]; initCup(state, CUPS[id]); }
  }

  // ---------------------------------------------------------------- lectura para la interfaz
  // Cuadro listo para mostrar: rondas con partidos (los de rondas futuras aparecen como "por definir").
  function bracket(state, id) {
    const cup = state.cups[id], out = [];
    if (isNew(cup)) {
      const names = (cup.hasPrelim ? [PRELIM] : []).concat(Array.from({ length: Math.log2(cup.size) }, (_, i) => roundName(cup.size / 2 ** i)));
      names.forEach((name, idx) => {
        const rd = cup.rounds[idx], nTies = name === PRELIM ? 1 : (cup.size / 2 ** (idx - off(cup))) / 2;
        out.push({ idx, name, date: cup.slots[idx] ? dateStr(state, cup, idx, true) : '', ties: rd ? rd.fixtureIds.map((fid) => state.fixtures[fid]) : Array.from({ length: nTies }, () => null), done: !!(rd && rd.done), prelim: name === PRELIM });
      });
      return out;
    }
    for (let t = cup.size, idx = 0; t >= 2; t /= 2, idx++) {
      const rd = cup.rounds[idx];
      out.push({ idx, name: roundName(t), date: cup.slots[idx] ? dateStr(state, cup, idx, true) : '', ties: rd ? rd.fixtureIds.map((fid) => state.fixtures[fid]) : Array.from({ length: t / 2 }, () => null), done: !!(rd && rd.done) });
    }
    return out;
  }

  // Resumen de La Cupidité para la pestaña Competiciones. phase: qualifying | active | done | skipped
  function overview(state, id) {
    ensure(state);
    const def = CUPS[id], cup = state.cups[id], lg = league(state), total = lg.calendar.length, cur = TLM.currentRound(state, lg) || total + 1;
    const out = { def, cup, phase: cup.status, total, cur };
    out.legacy = !isNew(cup);
    if (cup.status === 'qualifying') {
      const q = qualifiers(state, def), tb = TLM.computeTable(state, lg), row = (cid) => tb.find((r) => r.clubId === cid) || {};
      out.provisional = { league: q.league.map((cid) => ({ id: cid, pos: row(cid).pos, points: row(cid).points, played: row(cid).played })), guests: q.guests, prelim: q.prelim, size: q.size };
      out.cutIn = Math.max(0, cup.cutRound - (cur - 1)); out.cutRound = cup.cutRound; out.cutDate = TLM.roundDateStr(cup.season, cup.cutRound, total);
      out.startsIn = Math.max(0, cup.slots[0] - (cur - 1)); out.startDate = dateStr(state, cup, 0);
      out.startName = q.prelim ? PRELIM : roundName(q.size);
      // el equipo del usuario: ¿entraría hoy?
      out.userIn = q.league.includes(state.currentClubId);
    } else if (cup.status === 'active') {
      const i = cup.rounds.findIndex((r) => r && !r.done);
      out.nextIdx = i; out.nextName = i >= 0 ? cup.rounds[i].name : null; out.nextDate = i >= 0 ? dateStr(state, cup, i) : ''; out.nextIn = i >= 0 ? Math.max(0, cup.slots[i] - (cur - 1)) : 0;
    }
    return out;
  }
  // Resumen de la liga (trofeo): líder actual, ventaja sobre el segundo y jornadas que faltan.
  function leagueOverview(state) {
    const lg = league(state), tb = TLM.computeTable(state, lg), total = lg.calendar.length, cur = TLM.currentRound(state, lg);
    const pre = tb.every((r) => r.played === 0);
    if (pre) tb.sort((a, b) => state.clubs[b.clubId].reputation - state.clubs[a.clubId].reputation).forEach((r, i) => (r.pos = i + 1));
    const played = cur == null ? total : cur - 1, left = total - played;
    const lead = tb[0], second = tb[1], pts = (r) => (r ? r.points : 0);
    // puntos que aún puede sumar cada club = 3 × partidos que le faltan
    const maxLeft = 3 * (left - (lg.byes || []).slice(played).filter((b) => b === lead.clubId).length);
    const clinched = tb.length > 1 && left > 0 && pts(lead) - pts(second) > maxLeft;
    return { pre, comp: lg, table: tb, leader: lead, gap: pts(lead) - pts(second), total, played, left, done: cur == null, clinched, contenders: tb.filter((r) => pts(lead) - pts(r) <= 3 * left).length };
  }

  const isCupFixture = (f) => !!(f && f.cup);
  function labelOf(state, f) {
    if (f && f.cup) { const def = CUPS[f.cup.id], cup = state.cups[f.cup.id]; return { cup: true, cupId: f.cup.id, comp: def.name, round: f.cup.roundName, short: f.cup.roundName, date: cup ? dateStr(state, cup, f.cup.idx) : '', dateShort: cup ? dateStr(state, cup, f.cup.idx, true) : '', pkg: def.pkg }; }
    const lg = league(state);
    return { cup: false, comp: lg.name, round: 'Jornada ' + (f ? f.round : ''), short: 'Jornada ' + (f ? f.round : ''), date: f ? TLM.roundDateStr(state.season, f.round, lg.calendar.length) : '', dateShort: f ? TLM.roundDateStr(state.season, f.round, lg.calendar.length, true) : '', pkg: null };
  }

  // Frases de estudio de un partido de copa (reemplazan a las de tabla de liga).
  function studioLines(state, fx, res) {
    const r = fx.result, W = state.clubs[r.winnerId], L = state.clubs[r.winnerId === fx.homeId ? fx.awayId : fx.homeId], def = CUPS[fx.cup.id], cup = state.cups[fx.cup.id], out = [];
    const isFinal = fx.cup.roundName === 'Final';
    out.push(['A', r.pens ? `Empataron ${r.hg}-${r.ag} y todo se definió desde los doce pasos: ${r.pens[0]}-${r.pens[1]}. Pasa ${W.name}.` : `${W.name} se queda con el pase y deja afuera a ${L.name}.`]);
    if (isFinal) out.push(['B', `${W.name} es el campeón de ${def.name}. ${def.motto}.`]);
    else { const nx = cup.rounds[fx.cup.idx + 1]; out.push(['B', `${W.name} avanza a ${nx ? nx.name.toLowerCase() : 'la siguiente ronda'} de ${def.name}.`]); }
    void res;
    return out;
  }
  function preLines(state, fx) {
    const def = CUPS[fx.cup.id], H = state.clubs[fx.homeId], A = state.clubs[fx.awayId];
    const foreign = [H, A].filter((c) => c.foreign);
    const extra = foreign.length ? `${foreign.map((c) => c.name).join(' y ')} llega${foreign.length > 1 ? 'n' : ''} desde el Continente Viejo.` : 'Si el tiempo reglamentario termina igualado, se define por penales.';
    return [['A', `${def.name}, ${fx.cup.roundName.toLowerCase()}: ${H.name} recibe a ${A.name}. Partido único, sin revancha.`], ['B', extra]];
  }

  Object.assign(TLM, { CUPS, cupEnsure: ensure, cupInit: initCup, cupAfterMatch: afterMatch, cupAfterLeagueRound: afterLeagueRound, cupPendingRound: pendingRound, cupPendingFixture: pendingFixtureFor,
    cupClosePending: closePending, cupEndSeason: endSeason, cupNewSeason: newSeason, cupBracket: bracket, cupDateStr: dateStr, cupRoundDate: roundDate, cupSimulateRound: simulateRound, isCupFixture, fixtureLabel: labelOf,
    cupStudioLines: studioLines, cupPreLines: preLines, cupBracketOrder: bracketOrder, cupOverview: overview, leagueOverview, cupQualifiers: qualifiers, cupFinalize: finalize, ensureGuests, guestClubs: guestsByRep, cupIsNew: isNew, CUP_PRELIM: PRELIM });
})(typeof globalThis !== 'undefined' ? globalThis : this);

}

// ---- tlm-career.js
{
/* LFO MANAGER — CAREER: orquesta jornada → resultado → actualización del mundo, fin de temporada, guardado/carga.
   Flujo: prepareRound() → (partido del usuario: motor 3D o simulación rápida) → finishRound() (resto de partidos, economía,
   entrenamiento, mercado IA, noticias). Career no guarda estado propio: todo vive en `state` (serializable). */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { clamp, round, R, addNews, addTx, money } = TLM;
  const SAVE_KEY = 'lfo-manager-save-v1';

  const validateCfg = (o) => o;

  class Career {
    constructor(state) { this.state = state; this.bus = new TLM.Bus(); }
    static create(opts) { const c = new Career(TLM.createWorld(validateCfg(opts))); TLM.cupEnsure(c.state); return c; }
    static fromJSON(json) { const s = typeof json === 'string' ? JSON.parse(json) : json; if (!s || s.version !== 1 || !s.clubs || !s.players) throw new Error('Guardado inválido o de otra versión.'); const c = new Career(s); TLM.migrateNations(c.state); TLM.cupEnsure(c.state); return c; }
    toJSON() { return JSON.stringify(this.state); }

    get user() { return this.state.clubs[this.state.currentClubId]; }
    get comp() { return TLM.mainComp(this.state); }
    get round() { return TLM.currentRound(this.state, this.comp); }
    get seasonOver() { return TLM.isSeasonOver(this.state, this.comp); }
    club(id) { return this.state.clubs[id]; }
    player(id) { return this.state.players[id]; }
    table() { return TLM.computeTable(this.state, this.comp); }
    squad(clubId) { return this.state.clubs[clubId || this.state.currentClubId].squad.map((id) => this.state.players[id]); }
    // Si hay una ronda de copa pendiente, el partido del usuario es el de la copa (la liga espera).
    get cupPending() { return TLM.cupPendingRound(this.state); }
    userFixture() { const cf = TLM.cupPendingFixture(this.state, this.state.currentClubId); if (cf) return cf; const r = this.round; return r ? TLM.fixturesOf(this.state, this.comp, r).find((f) => f.homeId === this.state.currentClubId || f.awayId === this.state.currentClubId) || null : null; }
    nextUserFixture() { const cf = TLM.cupPendingFixture(this.state, this.state.currentClubId); return cf || TLM.nextFixtureFor(this.state, this.comp, this.state.currentClubId); }

    // Antes del partido: los clubes IA preparan XI y táctica (mismas reglas que el usuario, sin ver su once).
    prepareRound() {
      const s = this.state, cp = TLM.cupPendingRound(s);
      if (cp) {
        for (const f of cp.fixtures) for (const [id, opp, home] of [[f.homeId, f.awayId, true], [f.awayId, f.homeId, false]]) if (s.clubs[id].controlledBy !== 'user') TLM.aiPrepareMatch(s, s.clubs[id], s.clubs[opp], home);
        TLM.repairLineup(s, this.user);
        return cp.round;
      }
      const r = this.round; if (!r) return null;
      s.currentMatchday = r;
      for (const f of TLM.fixturesOf(s, this.comp, r)) {
        for (const [id, opp, home] of [[f.homeId, f.awayId, true], [f.awayId, f.homeId, false]]) if (s.clubs[id].controlledBy !== 'user') TLM.aiPrepareMatch(s, s.clubs[id], s.clubs[opp], home);
      }
      TLM.repairLineup(s, this.user);
      return r;
    }

    // Configuración del partido del usuario para el motor.
    matchConfig() { const f = this.userFixture(); if (!f) return null; this.prepareRound(); return TLM.buildMatchConfig(this.state, f); }

    // El usuario juega su partido con la simulación rápida (misma vía de resultados que el motor).
    quickSimUser() {
      this.prepareRound(); const f = this.userFixture(); if (!f) return null;
      const res = TLM.simulateMatch(this.state, f); return this.applyUserResult(res);
    }
    applyUserResult(res) {
      const f = this.state.fixtures[res.fixtureId];
      if (!f || f.status === 'played') throw new Error('El partido ya fue registrado.');
      TLM.applyMatchResult(this.state, f, res);
      if (f.cup) TLM.cupAfterMatch(this.state, f, res);          // copa: define quién pasa (penales si hay empate)
      this.state.matchRecords[f.id] = trimRecord(res);
      const keys = Object.keys(this.state.matchRecords); if (keys.length > 60) delete this.state.matchRecords[keys[0]];
      this.bus.emit('userMatch', { fixture: f, result: res });
      return f;
    }

    // Cierra la jornada: simula el resto, cobra/paga, entrena, mueve el mercado y avanza.
    finishRound() {
      const s = this.state, cp = TLM.cupPendingRound(s);
      if (cp) return this._finishCupRound(cp);
      const r = this.round; if (!r) return { events: [] };
      const out = { round: r, results: [], events: [], seasonEnded: false };
      const uf = this.userFixture();
      if (uf && uf.status !== 'played') throw new Error('Jugá (o simulá) tu partido antes de cerrar la jornada.');
      this.prepareRound();
      for (const f of TLM.fixturesOf(s, this.comp, r)) {
        if (f.status === 'played') continue;
        const res = TLM.simulateMatch(s, f); TLM.applyMatchResult(s, f, res);
        out.results.push({ fixtureId: f.id, score: res.score });
      }
      // los que no jugaron (descanso por número impar) también cobran/pagan y se recuperan
      for (const club of Object.values(s.clubs)) {
        if (!club.foreign) TLM.roundAccounting(s, club);      // los invitados del Continente Viejo no tienen sueldos ni entrenamiento simulados
        for (const id of club.squad) TLM.weeklyRecovery(s, s.players[id], !!s.players[id].played);
        if (!club.foreign) TLM.trainRound(s, club);
      }
      for (const p of Object.values(s.players)) p.played = false;
      // mercado (ofertas abiertas, pujas IA, nuevas ofertas por jugadores del usuario)
      s.currentMatchday = r + 1;
      s.scout.usedThisRound = 0;
      const ev = TLM.resolveOffers(s).concat(TLM.aiMarketRound(s), TLM.aiOffersForUser(s));
      TLM.refreshListings(s);
      TLM.roundNews(s);
      // consecuencias financieras del usuario
      const st = TLM.financeStatus(s, this.user);
      if (st === 'crisis') { const forced = this._forcedSale(); if (forced) ev.push(forced); }
      out.events = ev;
      // ¿toca una ronda de copa entre semana? (queda pendiente si el usuario juega; si no, se simula sola)
      out.cup = TLM.cupAfterLeagueRound(s, r);
      if (TLM.isSeasonOver(s, this.comp)) { out.seasonEnded = true; out.season = this.endSeason(); }
      else s.currentMatchday = this.round;
      this.bus.emit('round', out);
      return out;
    }

    // Cierra la ronda de copa: el usuario ya jugó, se simula el resto y se libera la liga.
    _finishCupRound(cp) {
      const s = this.state, uf = this.userFixture();
      if (uf && uf.status !== 'played') throw new Error('Jugá (o simulá) tu partido de copa antes de cerrar la ronda.');
      this.prepareRound();
      const res = TLM.cupClosePending(s);
      const out = { round: null, cup: true, cupResult: res, results: (res.results || []).map((x) => ({ fixtureId: x.fixtureId, score: x.score, pens: x.pens })), events: [], seasonEnded: false };
      this.bus.emit('round', out);
      return out;
    }

    // Crisis: si el saldo cae por debajo del umbral, la directiva vende al mejor pagado no titular (consecuencia real de gastar de más).
    _forcedSale() {
      const s = this.state, u = this.user;
      if (u.finances.debtRounds < 3 || u.squad.length <= TLM.DEFAULTS.minSquadToPlay) return null;
      const p = u.squad.map((id) => s.players[id]).filter((x) => !u.lineup.xi.includes(x.id)).sort((a, b) => b.contract.salary - a.contract.salary)[0];
      if (!p) return null;
      const r = TLM.sellNow(s, u.id, p.id);
      if (r.ok) { addNews(s, 'club', `La directiva de ${u.name} vende a ${p.canonicalName} por la crisis económica del club.`, { playerId: p.id }); return { type: 'forced_sale', playerId: p.id, fee: r.rec.fee }; }
      return null;
    }

    // ---- fin de temporada ----
    endSeason() {
      const s = this.state, comp = this.comp, table = TLM.computeTable(s, comp), N = table.length;
      TLM.cupEndSeason(s);   // si quedaba algo de la copa, se juega solo antes de cerrar la temporada
      const champion = s.clubs[table[0].clubId];
      const scorers = Object.values(s.players).filter((p) => p.seasonStats.goals > 0 && !(p.clubId && s.clubs[p.clubId].foreign)).sort((a, b) => b.seasonStats.goals - a.seasonStats.goals).slice(0, 8).map((p) => ({ pid: p.id, name: p.canonicalName, club: p.clubId ? s.clubs[p.clubId].name : '—', goals: p.seasonStats.goals, assists: p.seasonStats.assists }));
      const rec = { season: s.season, champion: champion.id, championName: champion.name, table: table.map((r) => ({ clubId: r.clubId, name: s.clubs[r.clubId].name, pos: r.pos, played: r.played, won: r.won, drawn: r.drawn, lost: r.lost, gf: r.gf, ga: r.ga, points: r.points })), scorers, transfers: s.transfers.filter((t) => t.season === s.season).length };
      s.history.seasons.push(rec);
      // premios por posición
      table.forEach((row) => {
        const c = s.clubs[row.clubId], prize = round(6e6 * (N - row.pos + 1) / N + (row.pos === 1 ? 4e6 : 0));
        addTx(s, c, 'prize', prize, `Premio de la liga (${row.pos}° puesto)`);
        c.history.seasons.push({ season: s.season, pos: row.pos, points: row.points, gf: row.gf, ga: row.ga });
        if (row.pos === 1) c.history.titles++;
        c.history.bestFinish = c.history.bestFinish ? Math.min(c.history.bestFinish, row.pos) : row.pos;
        c.reputation = clamp(c.reputation + (row.pos <= 3 ? 1.2 : row.pos > N - 3 ? -0.8 : 0.1), 1, 100);
      });
      // récords
      const bestScorer = scorers[0]; if (bestScorer && (!s.history.records.topScorer || bestScorer.goals > s.history.records.topScorer.goals)) s.history.records.topScorer = { ...bestScorer, season: s.season };
      const bestPts = table[0].points; if (!s.history.records.mostPoints || bestPts > s.history.records.mostPoints.points) s.history.records.mostPoints = { club: champion.name, points: bestPts, season: s.season };
      addNews(s, 'season', `${champion.name} se consagra campeón de la ${comp.name} ${TLM.seasonLabel(s)} con ${table[0].points} puntos.`, { clubId: champion.id });
      // contratos: IA renueva/libera; usuario: los vencidos pasan a libres
      const ev = TLM.aiSeasonEndContracts(s);
      for (const p of Object.values(s.players)) {
        if (!p.clubId) continue;
        const mine = s.clubs[p.clubId].controlledBy === 'user';
        if (mine && p.contract.endSeason <= s.season) { ev.push({ type: 'release', playerId: p.id, clubId: p.clubId, user: true }); }
      }
      for (const e of ev) if (e.type === 'release') { const p = s.players[e.playerId]; if (p.clubId === e.clubId) { const cn = s.clubs[e.clubId].name; TLM.moveToClub(s, p.id, null); s.market.freeAgents.push(p.id); delete s.market.listings[p.id]; addNews(s, 'contract', `${p.canonicalName} deja ${cn} al finalizar su contrato y queda libre.`, { playerId: p.id }); } }
      // envejecimiento / progresión / retiros
      for (const p of Object.values(s.players)) {
        if (p.retired) continue;
        if (p.clubId) TLM.closeHistoryStint(s, p);
        else { p.seasonStats = TLM.emptySeason(); }
        TLM.seasonProgress(s, p);
        p.fitness = 100; p.form = 50; p.suspension = 0; p.yellowAccum = 0; p.card.year = s.season + 1;
        if (p.injury) p.injury.matchdays = Math.max(0, p.injury.matchdays - 6), p.injury.matchdays <= 0 && (p.injury = null);
        if (p.age >= 37 || (p.age >= 34 && p.overall < 55 && !p.clubId)) { p.retired = true; if (p.clubId) TLM.moveToClub(s, p.id, null); s.market.freeAgents = s.market.freeAgents.filter((x) => x !== p.id); delete s.market.listings[p.id]; }
      }
      // nueva generación: cantera para los clubes IA + agentes libres
      this._youthIntake();
      // nueva temporada
      s.season++; comp.activeSeason = s.season;
      for (const c of Object.values(s.clubs)) { c.finances.seasonIncome = 0; c.finances.seasonExpense = 0; c.observed = { matches: 0, channels: { left: 0, center: 0, right: 0 }, pressing: 0, possession: 0 }; c.training.teamBoost = 0; }
      // limpiar fixtures de temporadas anteriores (la tabla queda en history)
      for (const id in s.fixtures) if (s.fixtures[id].season < s.season) delete s.fixtures[id];
      s.matchRecords = {};
      TLM.generateSeason(s, comp);
      TLM.cupNewSeason(s);
      s.currentMatchday = 1; s.scout.usedThisRound = 0;
      for (const c of Object.values(s.clubs)) { if (c.ai) c.ai.signingsThisSeason = 0; if (c.controlledBy !== 'user') TLM.aiEnsureSquad(s, c, true); TLM.autoLineup(s, c); }
      TLM.refreshListings(s);
      addNews(s, 'season', `Comienza la temporada ${TLM.seasonLabel(s)}.`);
      return rec;
    }

    _youthIntake() {
      const s = this.state, r = R(s), used = TLM.usedNames(s);
      for (const c of Object.values(s.clubs)) {
        if (c.controlledBy === 'user') continue;
        const n = 2 + (TLM.AI_PROFILES[c.aiProfile].youth > 0.7 ? 1 : 0);
        for (let i = 0; i < n; i++) {
          const pos = r.pick(TLM.SQUAD_TEMPLATE);
          const p = TLM.makePlayer(s, { pos, ovr: clamp(40 + c.reputation * 0.15 + r.gauss() * 4, 38, 62), age: r.int(17, 19), _used: used, nationHome: c.nation });
          p.potential = clamp(p.overall + r.int(12, 30), p.overall, 90);
          TLM.recalc(p);
          TLM.moveToClub(s, p.id, c.id, { salary: 0, endSeason: s.season + 3 });
        }
        while (c.squad.length > 27) { const w = c.squad.map((id) => s.players[id]).sort((a, b) => (a.overall + a.potential * 0.3) - (b.overall + b.potential * 0.3))[0]; TLM.moveToClub(s, w.id, null); s.market.freeAgents.push(w.id); }
      }
      for (let i = 0; i < 26; i++) {
        const pos = r.pick(TLM.POSITIONS);
        const p = TLM.makePlayer(s, { pos, ovr: clamp(56 + r.gauss() * 6, 42, 72), age: clamp(round(24 + r.gauss() * 6), 18, 35), _used: used });
        s.market.freeAgents.push(p.id);
      }
    }

    // ---- guardado ----
    save(slot) {
      const key = SAVE_KEY + (slot ? ':' + slot : '');
      const payload = JSON.stringify({ savedAt: Date.now(), summary: { club: this.user.name, season: this.state.season, round: this.state.currentMatchday }, state: this.state });
      try { g.localStorage.setItem(key, payload); return { ok: true, bytes: payload.length }; } catch (e) { return { ok: false, reason: 'No hay espacio para guardar (' + (e && e.name) + '). Exportá la carrera a un archivo.' }; }
    }
    static load(slot) {
      const raw = g.localStorage && g.localStorage.getItem(SAVE_KEY + (slot ? ':' + slot : ''));
      if (!raw) return null;
      try { const st = JSON.parse(raw).state; if (TLM.ROSTER && st.rosterV !== TLM.ROSTER.version) return null; return Career.fromJSON(st); } catch (e) { return null; }   // guardados con la base de jugadores anterior: se descartan
    }
    static saveInfo(slot) { try { const raw = g.localStorage.getItem(SAVE_KEY + (slot ? ':' + slot : '')); const o = raw ? JSON.parse(raw) : null; return o && TLM.ROSTER && o.state && o.state.rosterV !== TLM.ROSTER.version ? null : o; } catch (e) { return null; } }
    static clear(slot) { try { g.localStorage.removeItem(SAVE_KEY + (slot ? ':' + slot : '')); } catch (e) {} }
  }

  // Los registros guardados no llevan el log completo de eventos, sólo lo necesario para el historial.
  function trimRecord(res) {
    return { fixtureId: res.fixtureId, score: res.score, possession: res.possession, shots: res.shots, shotsOnTarget: res.shotsOnTarget, xg: res.xg, passes: res.passes, passAccuracy: res.passAccuracy, yellow: res.yellow, red: res.red, fouls: res.fouls, corners: res.corners, offsides: res.offsides, saves: res.saves,
      goalScorers: res.goalScorers, substitutions: res.substitutions, injuries: res.injuries, playerStats: res.playerStats, events: (res.events || []).slice(0, 80), lineups: res.lineups, source: res.source };
  }

  // Consistencia global: un jugador existe una sola vez y en un solo lugar.
  function validate(state) {
    const errs = [], seen = new Set();
    for (const id in state.players) {
      const p = state.players[id];
      if (p.id !== id) errs.push('ID inconsistente ' + id);
      if (seen.has(id)) errs.push('ID duplicado ' + id); seen.add(id);
    }
    const inClub = {};
    for (const c of Object.values(state.clubs)) for (const pid of c.squad) {
      if (inClub[pid]) errs.push(`${pid} está en dos clubes (${inClub[pid]} y ${c.id})`); inClub[pid] = c.id;
      if (!state.players[pid]) errs.push('plantilla con jugador inexistente ' + pid); else if (state.players[pid].clubId !== c.id) errs.push(`${pid}: clubId no coincide con la plantilla`);
    }
    for (const p of Object.values(state.players)) {
      if (p.clubId && inClub[p.id] !== p.clubId) errs.push(`${p.id}: clubId ${p.clubId} pero no está en su plantilla`);
      if (!p.clubId && inClub[p.id]) errs.push(`${p.id}: libre pero figura en un club`);
      if (p.clubId && state.market.freeAgents.includes(p.id)) errs.push(`${p.id}: club y agente libre a la vez`);
    }
    return errs;
  }

  TLM.Career = Career; TLM.validate = validate; TLM.SAVE_KEY = SAVE_KEY;
})(typeof globalThis !== 'undefined' ? globalThis : this);

}

export const TLM = globalThis.TLM;
