/* LFO MANAGER — STATIC DATA (nunca se guarda en la partida; la carrera sólo guarda lo que cambia).
   La liga y los clubes actuales son SÓLO la primera configuración (WORLD_CONFIG). Nada más del código
   asume 10/16/20 equipos: el calendario y la tabla se calculan a partir de competition.teams. */
(function (g) {
  'use strict';
  const TLM = (g.TLM = g.TLM || {});

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
  const EDITIONS = [
    { id: 'potrero', name: 'Potrero', cost: 0, stars: 3 }, { id: 'cobre', name: 'Cobre', cost: 0.02, stars: 3 },
    { id: 'plata', name: 'Plata', cost: 0.04, stars: 4 }, { id: 'oro', name: 'Oro de cancha', cost: 0.08, stars: 4 },
    { id: 'barrio', name: 'Ídolo del barrio', cost: 0.1, stars: 4 }, { id: 'promesa', name: 'Primera ovación', cost: 0.06, stars: 4 },
    { id: 'clasico', name: 'Noche de clásico', cost: 0.1, stars: 5 }, { id: 'apertura', name: 'Apertura 2008', cost: 0.12, stars: 5 },
    { id: 'capitan', name: 'Capitán eterno', cost: 0.14, stars: 5 }, { id: 'copa', name: 'La vuelta olímpica', cost: 0.16, stars: 5 },
    { id: 'archivo', name: 'Archivo 2000', cost: 0.12, stars: 4 }, { id: 'leyenda', name: 'Última leyenda', cost: 0.25, stars: 5 },
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
      { name: 'Al-Sahar', shortName: 'SAH', crest: 'equiposfut/alsahar.png', primaryColor: '#870000', secondaryColor: '#ffc000', stadium: 'Estadio Espada de Oro', capacity: 42000, rep: 80, profile: 'starBuyer' },
      { name: 'Olympique de Iberia', shortName: 'OLI', crest: 'equiposfut/olympiquedeiberia.png', primaryColor: '#06256d', secondaryColor: '#ad0c00', stadium: 'Stade Iberia', capacity: 38000, rep: 76, profile: 'starBuyer' },
      { name: 'Grammes FC', shortName: 'GRA', crest: 'equiposfut/grammesfutbolclub.png', primaryColor: '#e10000', secondaryColor: '#ffffff', stadium: 'Estadio de las Flechas', capacity: 36000, rep: 74, profile: 'aggressive' },
      { name: 'Atlético Margin', shortName: 'MAR', crest: 'equiposfut/atleticomargin.png', primaryColor: '#800000', secondaryColor: '#ffc000', stadium: 'Estadio Marginal', capacity: 33000, rep: 70, profile: 'balanced' },
      { name: 'Sportivo Calcio di Kaigam', shortName: 'KAI', crest: 'equiposfut/sportivocalciosdikaigam.png', primaryColor: '#1a6fb5', secondaryColor: '#ffffff', stadium: 'Stadio Kaigam', capacity: 30000, rep: 68, profile: 'offensive' },
      { name: 'CD Héroicos de Peronia', shortName: 'HER', crest: 'equiposfut/clubdeportivoheroicosdeperonia.png', primaryColor: '#47aee0', secondaryColor: '#ffc000', stadium: 'Estadio Solar de Peronia', capacity: 28000, rep: 66, profile: 'youthDeveloper' },
      { name: 'Independiente de Riada', shortName: 'RIA', crest: 'equiposfut/independientederiada.png', primaryColor: '#049245', secondaryColor: '#f41b1b', stadium: 'Estadio de la Ría', capacity: 27000, rep: 64, profile: 'balanced' },
      { name: 'FC Santa Rosa', shortName: 'SRO', crest: 'equiposfut/fcsantarosa.png', primaryColor: '#f58a2a', secondaryColor: '#3a8fe0', stadium: 'Estadio de la Torre', capacity: 25000, rep: 62, profile: 'offensive' },
      { name: 'Melonia City FC', shortName: 'MEL', crest: 'equiposfut/meloniacityfc.png', primaryColor: '#305005', secondaryColor: '#ffffff', stadium: 'Melon Park', capacity: 24000, rep: 60, profile: 'pragmaticSeller' },
      { name: 'Fútbol Club de Tamago', shortName: 'TAM', crest: 'equiposfut/futbolclubdetamago.png', primaryColor: '#0a1678', secondaryColor: '#ffc000', stadium: 'Estadio Tamago', capacity: 22000, rep: 58, profile: 'conservative' },
      { name: 'Universidad Costas Unidas', shortName: 'UCU', crest: 'equiposfut/universidadcostasunidas.png', primaryColor: '#0d76a0', secondaryColor: '#0bbf0b', stadium: 'Campus Deportivo', capacity: 20000, rep: 57, profile: 'youthDeveloper' },
      { name: 'Sköte FC', shortName: 'SKO', crest: 'equiposfut/skotefc.png', primaryColor: '#151515', secondaryColor: '#ffffff', stadium: 'Sköte Arena', capacity: 19000, rep: 55, profile: 'defensive' },
      { name: 'Sporting Magayanes', shortName: 'MAG', crest: 'equiposfut/sportingmagayanes.png', primaryColor: '#f0c400', secondaryColor: '#800000', stadium: 'Castillo de Magayanes', capacity: 16000, rep: 52, profile: 'lowBudget' },
      { name: 'Atlético Morvico', shortName: 'MOR', crest: 'equiposfut/atleticomorvico.png', primaryColor: '#5c1f8a', secondaryColor: '#ffffff', stadium: 'Estadio del Morvico', capacity: 15000, rep: 50, profile: 'aggressive' },
      { name: 'Real Zenet', shortName: 'ZEN', crest: 'equiposfut/realzenet.png', primaryColor: '#0b3d2e', secondaryColor: '#f0c400', stadium: 'Estadio Real Zenet', capacity: 14000, rep: 48, profile: 'conservative' },
      { name: 'Sporting Santa María de Trinidad', shortName: 'SMT', crest: 'equiposfut/sportingsantamariadetrinidad.png', primaryColor: '#8a1c1c', secondaryColor: '#eae4d0', stadium: 'Estadio Santa María', capacity: 13000, rep: 46, profile: 'youthDeveloper' },
    ],
  };

  // ---- CLUBES INVITADOS (Continente Viejo): no juegan la liga LFO, sólo La Cupidité (como una Champions o una Libertadores) ----
  // rep = reputación 1-100 (define la calidad de la plantilla). Los escudos están en equiposfut/continente2.
  // Nombres propios de cada nación del Continente Viejo (los jugadores de los clubes invitados los usan al generarse).
  const NAMES_VIEJO = {
    baikal: { first: ['Dmitri', 'Ivan', 'Nikolai', 'Sergei', 'Mikhail', 'Andrei', 'Pavel', 'Yuri', 'Oleg', 'Anton', 'Vasili', 'Kirill'], last: ['Volkov', 'Petrov', 'Smirnov', 'Kuznetsov', 'Sokolov', 'Morozov', 'Orlov', 'Lebedev', 'Zhukov', 'Baranov', 'Antonov', 'Fedorov'] },
    estovackia: { first: ['Marek', 'Tomas', 'Jaan', 'Matej', 'Andres', 'Peter', 'Karel', 'Lukas', 'Rein', 'Jakub'], last: ['Novak', 'Kask', 'Horvath', 'Tamm', 'Kovac', 'Sepp', 'Magi', 'Hruska', 'Varga', 'Parn'] },
    kostanay: { first: ['Arman', 'Timur', 'Daulet', 'Bauyrzhan', 'Nurlan', 'Yerlan', 'Askar', 'Rustem', 'Marat', 'Aidos'], last: ['Nurgaliev', 'Akhmetov', 'Sadykov', 'Bekov', 'Kasenov', 'Tulegenov', 'Omarov', 'Iskakov', 'Serikov', 'Dauletov'] },
    netanya: { first: ['Yossi', 'Noam', 'Eitan', 'Omer', 'Itai', 'Guy', 'Amir', 'Tal', 'Ori', 'Lior'], last: ['Cohen', 'Levi', 'Mizrahi', 'Peretz', 'Biton', 'Dahan', 'Avraham', 'Friedman', 'Shapiro', 'Katz'] },
    overmark: { first: ['Henrik', 'Magnus', 'Sander', 'Anders', 'Erik', 'Torstein', 'Jonas', 'Kristian', 'Espen', 'Tobias'], last: ['Hansen', 'Berg', 'Lunde', 'Solberg', 'Nilsen', 'Dahl', 'Strand', 'Halvorsen', 'Moen', 'Haugen'] },
  };
  const GUEST_CLUBS = [
    { name: 'Red Gull Club Tellin', shortName: 'RGT', nation: 'estovackia', crest: 'equiposfut/continente2/redgullclubtellin.png', primaryColor: '#f2c500', secondaryColor: '#0a2a6b', stadium: 'Tellin Arena', capacity: 34000, rep: 78, profile: 'starBuyer' },
    { name: 'Maccabi Tel Shava', shortName: 'MTS', nation: 'netanya', crest: 'equiposfut/continente2/maccabitelshava.png', primaryColor: '#0a2a6b', secondaryColor: '#ffc400', stadium: 'Estadio Estrella Dorada', capacity: 31000, rep: 74, profile: 'balanced' },
    { name: 'Sporting Lake Baikal', shortName: 'SLB', nation: 'baikal', crest: 'equiposfut/continente2/sportinglakebaikal.png', primaryColor: '#4f8fd0', secondaryColor: '#1f4e8c', stadium: 'Estadio Lago Profundo', capacity: 30000, rep: 72, profile: 'defensive' },
    { name: 'Sporty VV Klub Estovackia', shortName: 'SKE', nation: 'estovackia', crest: 'equiposfut/continente2/sportyvvklubestovackia.png', primaryColor: '#b3001b', secondaryColor: '#111111', stadium: 'Estadio del Pato Volador', capacity: 28000, rep: 70, profile: 'aggressive' },
    { name: 'Sporty VV Klub Kostanay', shortName: 'SKK', nation: 'kostanay', crest: 'equiposfut/continente2/sportyvvklubkostanay.png', primaryColor: '#151515', secondaryColor: '#ffffff', stadium: 'Estadio Águila Doble', capacity: 26000, rep: 68, profile: 'conservative' },
    { name: 'Groz Sport Kulübü', shortName: 'GRZ', nation: 'baikal', crest: 'equiposfut/continente2/grozsportkulubu.png', primaryColor: '#46a7dc', secondaryColor: '#0b2a63', stadium: 'Arena de la Fortaleza', capacity: 24000, rep: 66, profile: 'offensive' },
    { name: 'Klaipeda United', shortName: 'KLU', nation: 'kostanay', crest: 'equiposfut/continente2/Klaipedaunited.png', primaryColor: '#a4142b', secondaryColor: '#1b1b1b', stadium: 'Estadio del Puerto de Klaipeda', capacity: 21000, rep: 61, profile: 'pragmaticSeller' },
    { name: 'Inter Focuri', shortName: 'IFO', nation: 'overmark', crest: 'equiposfut/continente2/interfocuri.png', primaryColor: '#0fa958', secondaryColor: '#111111', stadium: 'Estadio de las Hogueras', capacity: 20000, rep: 58, profile: 'youthDeveloper' },
    { name: 'ØRK FC', shortName: 'ORK', nation: 'overmark', crest: 'equiposfut/continente2/orkfc.png', primaryColor: '#1c5b2a', secondaryColor: '#ffffff', stadium: 'Estadio Banderín Verde', capacity: 17000, rep: 55, profile: 'lowBudget' },
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
