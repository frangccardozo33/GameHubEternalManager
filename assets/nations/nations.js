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
