// GENERADO por server/tools/build-football.mjs (no editar). Motor de partido de fulbo.html (con Math determinista).
import { DM } from '../../../assets/common/dmath.mjs';
export function makeEngine(window) {
const te = (i, t, e) => DM.max(t, DM.min(e, i)),
  ze = (i, t) => DM.hypot(i.x - t.x, i.z - t.z),
  $i = (i, t) => {
    const e = DM.hypot(i, t) || 1;
    return { x: i / e, z: t / e };
  },
  Fa = {
    "4-3-3": [
      [-49, 0],
      [-33, -24],
      [-36, -8],
      [-36, 8],
      [-33, 24],
      [-16, -16],
      [-21, 0],
      [-16, 16],
      [5, -24],
      [10, 0],
      [5, 24],
    ],
    "4-2-3-1": [
      [-49, 0],
      [-33, -24],
      [-36, -8],
      [-36, 8],
      [-33, 24],
      [-19, -10],
      [-19, 10],
      [-2, -23],
      [-4, 0],
      [-2, 23],
      [13, 0],
    ],
    "4-4-2": [
      [-49, 0],
      [-33, -24],
      [-36, -8],
      [-36, 8],
      [-33, 24],
      [-12, -24],
      [-18, -8],
      [-18, 8],
      [-12, 24],
      [10, -9],
      [10, 9],
    ],
  },
  Ac = [
    {
      name: "Argentina FC",
      short: "ARG",
      color: "#8edbff",
      colorAlt: "#0b2f52",
      kitTrim: "#ffffff",
      kitPattern: "stripes",
      crest: "equiposfut/ligadefutbolonlinelogo.png",
      formation: "4-3-3",
      mentality: "balanced",
      names: [
        "E. Ríos",
        "N. Acosta",
        "M. Ferreyra",
        "T. Molina",
        "J. Benítez",
        "F. Sosa",
        "S. Paz",
        "M. Vidal",
        "L. Torres",
        "L. Álvarez",
        "N. Romero",
      ],
      numbers: [1, 2, 4, 6, 3, 8, 5, 10, 7, 9, 11],
    },
    {
      name: "Iberia United",
      short: "IBU",
      color: "#f77986",
      colorAlt: "#5c1420",
      kitPattern: "hoops",
      crest: "equiposfut/olympiquedeiberia.png",
      formation: "4-3-3",
      mentality: "balanced",
      names: [
        "D. Serrano",
        "H. Costa",
        "Á. Rubio",
        "M. Navarro",
        "I. Vega",
        "P. Martín",
        "R. Alonso",
        "D. Silva",
        "A. Cruz",
        "M. Herrera",
        "S. León",
      ],
      numbers: [1, 2, 4, 5, 3, 8, 6, 10, 7, 9, 11],
    },
  ];
// ================= REGLAS DE JUEGO COLECTIVO (opciones activables con números configurables) =================
// Cada regla se activa/desactiva por equipo desde el panel TÁCTICAS y tiene parámetros numéricos propios (mín/máx/paso). Son efectivas en el
// partido: tacApply() (más abajo) corrige el punto de destino de cada jugador antes de moverlo. `group`: "juego" = las pedidas para armar
// jugadas y llegar al área; "disciplina" = orden de línea (que la formación no se rompa); "extra" = opcionales. `on` = valor por defecto.
const TAC_RULES = [
  { id: "passPlay", on: true, group: "juego", label: "Juego de pases", desc: "Los jugadores más cercanos al que tiene la pelota corren (sprint) a ofrecerse: uno se ubica atrás, para recibir un pase en retroceso, y el otro adelante, para seguir avanzando.",
    params: [{ k: "n", label: "Jugadores", def: 2, min: 1, max: 5, step: 1 }, { k: "dist", label: "Distancia al poseedor (m)", def: 15, min: 6, max: 30, step: 1 }] },
  { id: "personalSpace", on: true, group: "juego", label: "Distancia personal", desc: "Los jugadores evitan acercarse a sus compañeros a menos de esa distancia (no se amontonan).",
    params: [{ k: "dist", label: "Distancia mínima (m)", def: 5, min: 2, max: 12, step: 0.5 }] },
  { id: "crossHunt", on: true, group: "juego", label: "En busca del centro", desc: "Cuando un compañero pisa el último tercio, los jugadores más cercanos al área se ubican rápido cerca del punto penal.",
    params: [{ k: "n", label: "Jugadores", def: 2, min: 1, max: 4, step: 1 }, { k: "spot", label: "Distancia a la línea de gol (m)", def: 11, min: 5, max: 16, step: 0.5 }, { k: "third", label: "Inicio del último tercio (m del medio)", def: 17.5, min: 8, max: 35, step: 0.5 }, { k: "grab", label: "Ir a buscar la pelota si pasa a menos de (m)", def: 9, min: 3, max: 20, step: 1 }] },
  { id: "lastDefender", on: true, group: "juego", label: "Sin pasarse del último defensor", desc: "Los atacantes (también los que van al área) no se ubican más allá del último defensor rival: esperan sobre su línea para no caer en fuera de juego.",
    params: [{ k: "margin", label: "Margen sobre la línea (m)", def: 0.5, min: -3, max: 5, step: 0.5 }] },
  { id: "defPlanted", on: true, group: "juego", label: "Defensa plantada", desc: "Los centrales nunca se alejan de su área más que esta distancia.",
    params: [{ k: "dist", label: "Máximo desde el área (m)", def: 25, min: 8, max: 50, step: 1 }] },
  { id: "defIron", on: true, group: "juego", label: "Defensa férrea", desc: "Los centrales quedan a menos de esta distancia de los rivales más cercanos al área y nunca más adelantados que ellos.",
    params: [{ k: "gap", label: "Distancia al rival (m)", def: 5, min: 1.5, max: 12, step: 0.5 }] },
  { id: "chaseCap", on: true, group: "disciplina", label: "Tope de perseguidores", desc: "Sólo esta cantidad de jugadores por equipo corre detrás de la pelota; el resto conserva su puesto.",
    params: [{ k: "n", label: "Perseguidores", def: 2, min: 1, max: 5, step: 1 }] },
  { id: "leash", on: true, group: "disciplina", label: "Ancla de formación", desc: "Ningún jugador se aleja de su puesto más que este radio (por línea), salvo el que persigue la pelota.",
    params: [{ k: "def", label: "Defensas (m)", def: 12, min: 5, max: 30, step: 1 }, { k: "mid", label: "Medios (m)", def: 18, min: 8, max: 35, step: 1 }, { k: "fwd", label: "Delanteros (m)", def: 24, min: 10, max: 45, step: 1 }] },
  { id: "lineSync", on: true, group: "disciplina", label: "Línea defensiva coordinada", desc: "Los defensas suben y bajan juntos: ninguno se desprende de la línea más que esta tolerancia.",
    params: [{ k: "tol", label: "Tolerancia (m)", def: 3.5, min: 1, max: 10, step: 0.5 }] },
  { id: "compact", on: true, group: "disciplina", label: "Bloque compacto", desc: "Limita cuánto se separan del balón los jugadores de campo (hacia atrás y hacia adelante).",
    params: [{ k: "back", label: "Hacia atrás (m)", def: 34, min: 15, max: 60, step: 1 }, { k: "front", label: "Hacia adelante (m)", def: 36, min: 15, max: 60, step: 1 }] },
  { id: "oneTouchPlay", on: false, group: "extra", label: "Toques de primera", desc: "Los jugadores tienen más chance de jugarla de primera (pase o remate) al recibir.",
    params: [{ k: "bonus", label: "Más chance (%)", def: 60, min: 0, max: 200, step: 5 }] },
  { id: "wideWingers", on: false, group: "extra", label: "Extremos abiertos", desc: "Los extremos atacan pegados a la banda para abrir la defensa rival.",
    params: [{ k: "z", label: "Ancho mínimo (m del eje)", def: 24, min: 14, max: 31, step: 1 }] },
  { id: "fbPush", on: false, group: "extra", label: "Laterales al ataque", desc: "Con la pelota, los laterales suben hasta pasar el medio.",
    params: [{ k: "x", label: "Altura mínima (m del medio)", def: 10, min: 0, max: 35, step: 1 }] },
  { id: "dropNine", on: false, group: "extra", label: "Delantero de enlace", desc: "Un delantero baja a buscar el juego cuando la pelota está lejos del área rival.",
    params: [{ k: "dist", label: "Distancia al poseedor (m)", def: 14, min: 6, max: 25, step: 1 }] },
  { id: "counterRun", on: false, group: "extra", label: "Carrera al contragolpe", desc: "Al recuperar la pelota, los delanteros salen disparados hacia el arco rival.",
    params: [{ k: "n", label: "Jugadores", def: 2, min: 1, max: 4, step: 1 }, { k: "run", label: "Metros por delante de la pelota", def: 28, min: 10, max: 45, step: 1 }] },
  { id: "farPost", on: false, group: "extra", label: "Llegada al segundo palo", desc: "Con la pelota en la banda, en el último tercio, un jugador más aparece al segundo palo.",
    params: [{ k: "n", label: "Jugadores", def: 1, min: 1, max: 3, step: 1 }, { k: "z", label: "Ancho del palo (m del eje)", def: 6, min: 2, max: 12, step: 0.5 }] },
];
const TAC_RULE_GROUPS = { juego: "Juego y defensa", disciplina: "Disciplina de formación", extra: "Opcionales" };
const tacRulesDefault = () => { const o = {}; for (const r of TAC_RULES) { o[r.id] = { on: r.on, p: {} }; for (const q of r.params) o[r.id].p[q.k] = q.def; } return o; };
window.LFO_TAC = { RULES: TAC_RULES, GROUPS: TAC_RULE_GROUPS, defaults: tacRulesDefault }; // para la pantalla Tácticas del modo carrera (manager/tlm-ui-team.js)
// ================= MANAGER LAYER — TÁCTICAS EN TIEMPO REAL =================
// El "entrenador" (UI en vivo hoy, un juego de manager completo mañana) sólo puede hablar en estos
// enums — nunca controla un jugador directamente. Cada enum mapea a un número que la IA colectiva
// ya existente (teamTactics()) usa como una capa de ajuste, y ese número sólo se alcanza de a poco
// (ver Match.updateLiveTactics) para que un cambio de táctica se sienta como una instrucción que el
// equipo va asimilando, no como un interruptor.
const TACTIC_ENUMS = {
    mentality: {
      veryDefensive: -2,
      defensive: -1,
      balanced: 0,
      positive: 0.5,
      attacking: 1,
      veryAttacking: 2,
    },
    tempo: { muchSlower: -2, slower: -1, normal: 0, faster: 1, muchFaster: 2 },
    attackingWidth: { narrow: -1, balanced: 0, wide: 1 },
    defensiveWidth: { narrow: -1, balanced: 0, wide: 1 },
    defensiveLine: { deep: -1, normal: 0, high: 1, veryHigh: 2 },
    pressing: { none: -2, low: -1, medium: 0, high: 1, allOut: 2 },
    buildUp: { short: -1, mixed: 0, direct: 1 },
    passingRisk: { safe: -1, balanced: 0, risky: 1 },
    counterAttack: { rare: -1, situational: 0, frequent: 1 },
    counterPress: { off: -2, situational: 0, aggressive: 1 },
    marking: { zonal: -1, mixed: 0, man: 1 },
    attackingPlayers: { minimal: -1, normal: 0, extra: 1, maximal: 2 },
    overlapFrequency: { rare: -1, normal: 0, frequent: 1 },
    crossFrequency: { rare: -1, normal: 0, frequent: 1 },
    longBallFrequency: { rare: -1, normal: 0, frequent: 1 },
    shotRisk: { conservative: -1, normal: 0, eager: 1 },
    timeWasting: { off: 0, on: 1 },
    substitutionPolicy: { conservative: -1, normal: 0, aggressive: 1 },
  },
  TACTIC_DEFAULTS = {
    mentality: "balanced",
    tempo: "normal",
    attackingWidth: "balanced",
    defensiveWidth: "balanced",
    defensiveLine: "normal",
    pressing: "medium",
    buildUp: "mixed",
    passingRisk: "balanced",
    counterAttack: "situational",
    counterPress: "situational",
    marking: "mixed",
    attackingPlayers: "normal",
    overlapFrequency: "normal",
    crossFrequency: "normal",
    longBallFrequency: "normal",
    shotRisk: "normal",
    timeWasting: "off",
    substitutionPolicy: "normal",
  },
  // Presets (spec #14/#15): sólo parchean un subconjunto de diales — el resto queda en lo que ya
  // estuviera. "TACTIC_PRESET_LABELS" es lo único que la UI necesita para pintar los botones.
  TACTIC_PRESETS = {
    holdLead: {
      mentality: "defensive",
      tempo: "slower",
      pressing: "low",
      defensiveLine: "deep",
      defensiveWidth: "narrow",
      passingRisk: "safe",
      counterAttack: "situational",
      counterPress: "situational",
      shotRisk: "conservative",
      timeWasting: "on",
      attackingPlayers: "minimal",
    },
    controlMatch: {
      mentality: "positive",
      tempo: "normal",
      pressing: "medium",
      buildUp: "short",
      passingRisk: "safe",
      defensiveLine: "normal",
      counterAttack: "situational",
    },
    highPress: {
      mentality: "attacking",
      pressing: "allOut",
      counterPress: "aggressive",
      defensiveLine: "veryHigh",
      tempo: "faster",
      defensiveWidth: "narrow",
    },
    counterAttack: {
      mentality: "balanced",
      defensiveLine: "deep",
      buildUp: "direct",
      counterAttack: "frequent",
      tempo: "faster",
      attackingPlayers: "minimal",
      longBallFrequency: "frequent",
    },
    possessionControl: {
      mentality: "positive",
      buildUp: "short",
      tempo: "normal",
      passingRisk: "safe",
      counterAttack: "rare",
      pressing: "medium",
    },
    allOutAttack: {
      mentality: "veryAttacking",
      defensiveLine: "veryHigh",
      pressing: "allOut",
      counterPress: "aggressive",
      attackingPlayers: "maximal",
      shotRisk: "eager",
      passingRisk: "risky",
      crossFrequency: "frequent",
      overlapFrequency: "frequent",
    },
    defendDeep: {
      mentality: "veryDefensive",
      defensiveLine: "deep",
      pressing: "none",
      defensiveWidth: "narrow",
      passingRisk: "safe",
      counterAttack: "situational",
      attackingPlayers: "minimal",
    },
  },
  TACTIC_PRESET_LABELS = {
    holdLead: "Hold Lead",
    controlMatch: "Control Match",
    highPress: "Press High",
    counterAttack: "Counter Attack",
    possessionControl: "Possession Control",
    allOutAttack: "All Out Attack",
    defendDeep: "Defend Deep",
  };
const STYLE_POOL = {
  GK: ["Sweeper Keeper", "Shot Stopper"],
  DEF_FB: [
    "Overlapping Fullback",
    "Defensive Fullback",
    "Ball Playing Defender",
  ],
  DEF_CB: ["Ball Playing Defender", "Stopper"],
  MID: ["Deep Playmaker", "Playmaker", "Ball Winner", "Box Crasher"],
  FWD: ["Poacher", "Target Man", "False 9", "Winger", "Speedster", "Finisher"],
};
const TRAIT_DEFS = [
  {
    key: "Power Shot",
    test: (s) => s.stats.shooting > 80 && s.personality.aggression > 58,
    score: (s) => s.stats.shooting + s.personality.aggression,
  },
  {
    key: "Finesse Shot",
    test: (s) => s.stats.shooting > 76 && s.personality.creativity > 62,
    score: (s) => s.stats.shooting + s.personality.creativity,
  },
  {
    key: "Quick Dribbler",
    test: (s) => s.stats.dribbling > 80 && s.stats.acceleration > 74,
    score: (s) => s.stats.dribbling + s.stats.acceleration,
  },
  {
    key: "One-Touch Pass",
    test: (s) => s.stats.passing > 80 && s.stats.intelligence > 74,
    score: (s) => s.stats.passing + s.stats.intelligence,
  },
  {
    key: "Through Ball Specialist",
    test: (s) => s.stats.passing > 77 && s.personality.creativity > 68,
    score: (s) => s.stats.passing + s.personality.creativity,
  },
  {
    key: "Trivela",
    test: (s) => s.stats.shooting > 74 && s.personality.creativity > 74,
    score: (s) => s.stats.shooting + s.personality.creativity,
  },
  {
    key: "Aerial Threat",
    test: (s) => s.stats.physical > 77 && s.role !== "GK",
    score: (s) => s.stats.physical,
  },
  {
    key: "Long Shot",
    test: (s) => s.stats.shooting > 77 && s.personality.creativity > 54,
    score: (s) => s.stats.shooting,
  },
  {
    key: "Flair",
    test: (s) => s.personality.creativity > 79,
    score: (s) => s.personality.creativity,
  },
  {
    key: "Acrobat",
    test: (s) => s.stats.dribbling > 77 && s.personality.creativity > 71,
    score: (s) => s.stats.dribbling + s.personality.creativity,
  },
  {
    key: "Rapid",
    test: (s) => s.stats.speed > 84,
    score: (s) => s.stats.speed,
  },
  {
    key: "Technical Dribbler",
    test: (s) => s.stats.dribbling > 81,
    score: (s) => s.stats.dribbling,
  },
  {
    key: "Block Specialist",
    test: (s) => s.stats.defense > 81 && s.role !== "FWD",
    score: (s) => s.stats.defense,
  },
];
// v9 Fase 1: dimensiones de campo con nombre compartido (antes números mágicos duplicados
// entre sim y render) y calibración de escala jugador/campo. BASE_MODEL_HEIGHT es la altura
// aproximada (tope de cabeza) del rig sin escalar tal como lo construye createPlayer() a scale=1.
const FIELD_L = 105,
  FIELD_W = 68;
const BASE_MODEL_HEIGHT = 1.97,
  PLAYER_SCALE_BASE = 0.9;
class wc {
  constructor(t = 73191) {
    ((this.seed = t >>> 0),
      (this._initialSeed = this.seed),
      (this.teams = Ac.map((e) => ({ ...e }))),
      (this.onEvent = () => {}),
      (this.debug = false),
      this.reset());
  }
  random() {
    return (
      (this.seed = (1664525 * this.seed + 1013904223) >>> 0),
      this.seed / 4294967296
    );
  }
  range(t, e) {
    return t + this.random() * (e - t);
  }
  reset() {
    // Fase 35: random() muta this.seed en cada llamada (es el propio estado del LCG), así que sin
    // esta línea reset() reanudaba el generador donde lo hubiera dejado el partido anterior en vez
    // de reproducir el mismo partido para la misma seed — "seed + teams + tactics + initial state"
    // dejaba de garantizar el mismo resultado en cualquier código que reusara la instancia (tlmRestore,
    // "jugar de nuevo" del editor, etc.). Quien quiera una seed nueva la fija ANTES de llamar reset()
    // actualizando this._initialSeed (ver tlmLoad), no sólo this.seed.
    this.seed = this._initialSeed;
    ((this.so = null), (this.shootout = null));
    ((this.time = 0),
      (this.elapsed = 0),
      (this.half = 1),
      (this.running = !1),
      (this.started = !1),
      (this.ended = !1),
      (this.score = [0, 0]),
      (this.events = []),
      (this.excitement = 0),
      (this.phase = "ready"),
      (this.wait = 0),
      (this.lastNarrative = -999),
      (this.nextNarrativeGap = 30),
      (this.injuryData = null),
      (this.stats = [0, 1].map(() => ({
        shots: 0,
        onTarget: 0,
        passes: 0,
        completed: 0,
        possession: 0,
        saves: 0,
        tackles: 0,
        dribbles: 0,
        xg: 0,
        fouls: 0,
        yellow: 0,
        red: 0,
        offside: 0,
        corners: 0,
        penalties: 0,
        // FASE F — telemetría táctica (spec #22): contadores de debug, no muestran nada en el
        // marcador por ahora — se leen desde el panel de debug (tecla D) y matchDebugInfo().
        progressivePasses: 0,
        passesByKind: {},
        turnovers: 0,
        forcedTurnovers: 0,
        successfulDribbles: 0,
        failedDribbles: 0,
        interceptions: 0,
        recoveries: 0,
        secondBallsWon: 0,
        counterattacks: 0,
        counterpressActions: 0,
        crosses: 0,
        cutbacks: 0,
        shotsByZone: { left: 0, center: 0, right: 0 },
        attacksByChannel: { left: 0, center: 0, right: 0 },
        touchesByZone: { def: 0, mid: 0, att: 0 },
        widthSamples: [],
        lineSamples: [],
      }))),
      (this.ball = { x: 0, z: 0, y: 0.13, vx: 0, vz: 0, vy: 0, spin: 0 }),
      (this.owner = null),
      (this.lastTouch = null),
      (this.receiver = null),
      (this.kickedAt = -10),
      (this.protectedUntil = 0),
      (this.shot = null),
      (this.players = []));
    ((this.counterUntil = [0, 0]),
      (this.lastTurnoverEvent = 0),
      (this.lastRestartEvent = 0),
      (this.lastClearEvent = 0),
      (this.deflectBehind = -9),
      (this.pressTriggerUntil = [-9, -9]),
      (this.lostBallAt = [-9, -9]),
      (this.secondBallUntil = -9),
      (this.lastCrossAt = -9),
      (this.pendingOffside = null),
      // Fase 35 (determinismo): assignMarks() sólo se vuelve a llamar cuando
      // `this.elapsed - this._marksAt > 0.3` — si `_marksAt` no se resetea acá, una instancia
      // reusada (tlmLoad/tlmRestore/reset() sobre un motor que ya jugó) arranca con un valor viejo
      // (p.ej. ~900) mientras el nuevo partido empieza en elapsed=0: la resta da negativo, nunca
      // supera 0.3, y this.marks queda congelado con las marcas del partido ANTERIOR durante un
      // buen rato — decisiones de posicionamiento/marca divergen de una instancia nueva aunque la
      // seed y las posiciones iniciales sean idénticas.
      (this.marks = null),
      (this._marksAt = -9));
    // FASE A/B — estado táctico colectivo (spec #1/#5): snapshot de equipo cacheado (no se
    // recalcula por jugador por frame, ver teamTactics()), fase de posesión reciente para
    // distinguir transición de "juego asentado", y el modo de transición elegido al perder/ganar
    // la pelota (counterpress / delayed_press / immediate_retreat / regroup / tactical_foul y
    // counterattack / fast_progression / possession_reset — spec #5).
    ((this.gainedBallAt = [-9, -9]),
      (this._tacticsCache = [null, null]),
      (this._tacticsCacheAt = [-9, -9]),
      (this.transitionMode = [
        { mode: "regroup", until: -9 },
        { mode: "regroup", until: -9 },
      ]),
      (this.transitionAttackMode = [null, null]),
      (this.consolidateUntil = [-9, -9]),
      (this._lastTelemetrySample = -9));
    this.initLiveTactics();
    for (let t = 0; t < 2; t++)
      for (let e = 0; e < 11; e++) {
        const n = e === 0 ? "GK" : e < 5 ? "DEF" : e < 8 ? "MID" : "FWD",
          s = {
            id: t * 11 + e,
            team: t,
            index: e,
            role: n,
            name: this.teams[t].names[e],
            number: this.teams[t].numbers[e],
            x: 0,
            z: 0,
            vx: 0,
            vz: 0,
            angle: t ? -DM.PI / 2 : DM.PI / 2,
            state: "Positioning",
            timer: 0,
            think: this.range(0, 0.3),
            tackleAt: -10,
            dribbleAt: -10,
            controlAt: -10,
            action: 0,
            anim: 0,
            dive: 0,
            diveDir: 1,
            burst: 0,
            moveZ: 0,
            target: null,
            duelWith: null,
            lastDecision: "",
            stats: {},
          };
        for (const r of [
          "speed",
          "acceleration",
          "dribbling",
          "passing",
          "shooting",
          "defense",
          "physical",
          "intelligence",
        ])
          s.stats[r] = DM.round(this.range(62, 88));
        (n === "FWD" &&
          ((s.stats.shooting += 8),
          (s.stats.speed += 5),
          (s.stats.dribbling += 7)),
          n === "DEF" && ((s.stats.defense += 10), (s.stats.physical += 7)),
          n === "MID" && ((s.stats.passing += 9), (s.stats.intelligence += 6)),
          (s.heightM = te(
            1.76 +
              (s.stats.physical - 75) * 0.0022 +
              (n === "GK" ? this.range(0.03, 0.07) : this.range(-0.05, 0.05)),
            1.68,
            n === "GK" ? 1.95 : 1.9,
          )),
          (s.scale = s.heightM / BASE_MODEL_HEIGHT),
          (s.personality = {
            aggression: DM.round(this.range(20, 92)),
            composure: DM.round(this.range(20, 92)),
            discipline: DM.round(this.range(20, 92)),
            creativity: DM.round(this.range(20, 92)),
            consistency: DM.round(this.range(30, 95)),
          }),
          (s.stamina = 100),
          (s.cards = { yellow: 0, red: !1 }),
          (s.sentOff = !1),
          (s.foulAt = -10),
          (s.skillCooldowns = {}),
          (s.pressTrigger = 0),
          (s.expectingReturn = null),
          // FASE E — memoria temporal (spec #15): efectos sutiles, no arcade — confidence empieza
          // neutro y drifta de vuelta a 50 solo (ver decayMemory()), nunca queda "enganchado" ni
          // arriba ni abajo.
          (s.memory = {
            confidence: 50,
            recentMistakes: 0,
            recentSuccesses: 0,
            recentDuelResults: 0,
            lastOpponent: null,
            lastPassTarget: null,
            pressureMemory: 0,
            recentFatigue: 0,
          }),
          this.deriveIdentity(s),
          this.players.push(s));
      }
    (this.placePlayers(), this.buildBench());
    // AI2 — capa cognitiva (pitch control, coordinadores, telemetría). Ver bloque <<AI2_BEGIN>>.
    this.ai2Reset && this.ai2Reset();
    this.tlInit && this.tlInit();
  }
  // Picks a tactical style from the role-appropriate pool and derives 0-4 special traits from stat
  // thresholds (PlayStyles-lite, spec #30/#31) — these read into decision scoring, not just flavor text.
  deriveIdentity(s) {
    const pool =
      s.role === "GK"
        ? STYLE_POOL.GK
        : s.role === "DEF"
          ? DM.abs(Fa["4-3-3"][s.index] ? Fa["4-3-3"][s.index][1] : 0) > 15
            ? STYLE_POOL.DEF_FB
            : STYLE_POOL.DEF_CB
          : s.role === "MID"
            ? STYLE_POOL.MID
            : STYLE_POOL.FWD;
    s.style = pool[DM.floor(this.range(0, pool.length))];
    s.traits = TRAIT_DEFS.filter((d) => d.test(s))
      .sort((a, b) => b.score(s) - a.score(s))
      .slice(0, 4)
      .map((d) => d.key);
    // AI2: rasgos internos + biblioteca de recursos se re-derivan cuando cambian stats/traits (también al
    // asignar un cromo del álbum, ver collection.js → applyAssignment()).
    this.ai2InitPlayer && this.ai2InitPlayer(s);
  }
  hasTrait(t, key) {
    return !!(t.traits && t.traits.includes(key));
  }
  buildBench() {
    ((this.bench = [[], []]),
      (this.subsUsed = [0, 0]),
      (this.maxSubs = 5),
      (this.lastSubCheck = 0));
    const t = [
      "A. Duarte",
      "R. Peralta",
      "J. Moretti",
      "C. Ibarra",
      "V. Salas",
      "O. Nieva",
      "B. Quiroga",
      "F. Lombardi",
      "G. Arce",
      "T. Bustos",
    ];
    for (let e = 0; e < 2; e++)
      for (let n = 0; n < 5; n++) {
        const s = ["DEF", "MID", "MID", "FWD", "GK"][n],
          r = {
            name: t[e * 5 + n],
            number: 12 + n,
            role: s,
            stats: {},
            personality: {
              aggression: DM.round(this.range(20, 92)),
              composure: DM.round(this.range(20, 92)),
              discipline: DM.round(this.range(20, 92)),
              creativity: DM.round(this.range(20, 92)),
              consistency: DM.round(this.range(30, 95)),
            },
          };
        for (const a of [
          "speed",
          "acceleration",
          "dribbling",
          "passing",
          "shooting",
          "defense",
          "physical",
          "intelligence",
        ])
          r.stats[a] = DM.round(this.range(58, 84));
        (s === "FWD" && ((r.stats.shooting += 7), (r.stats.speed += 5)),
          s === "DEF" && ((r.stats.defense += 9), (r.stats.physical += 6)),
          s === "MID" && ((r.stats.passing += 8), (r.stats.intelligence += 5)),
          (r.heightM = te(
            1.76 +
              (r.stats.physical - 75) * 0.0022 +
              (s === "GK" ? this.range(0.03, 0.07) : this.range(-0.05, 0.05)),
            1.68,
            s === "GK" ? 1.95 : 1.9,
          )),
          (r.scale = r.heightM / BASE_MODEL_HEIGHT),
          (r.index = n === 0 ? 1 : n),
          (r.memory = {
            confidence: 50,
            recentMistakes: 0,
            recentSuccesses: 0,
            recentDuelResults: 0,
            lastOpponent: null,
            lastPassTarget: null,
            pressureMemory: 0,
            recentFatigue: 0,
          }),
          this.deriveIdentity(r),
          this.bench[e].push(r));
      }
  }
  direction(t) {
    return (t === 0 ? 1 : -1) * (this.half === 1 || this.half === 3 ? 1 : -1);
  }
  placePlayers() {
    for (const t of this.players) {
      const e = this.direction(t.team),
        n = this.formationSlot(t.team, t.index);
      ((t.x = n[0] * e),
        (t.z = n[1] * e),
        (t.vx = t.vz = 0),
        (t.dive = t.action = t.burst = t.timer = 0),
        (t.ragdoll = null),
        (t.skillMove = null),
        (t.sprinting = false),
        (t.state = "Positioning"),
        (t.target = null));
    }
  }
  configure(t, e) {
    ((this.teams[0].formation = t),
      (this.teams[0].mentality = e),
      this.started || this.placePlayers());
  }
  start() {
    (this.ended && this.reset(),
      this.started ||
        ((this.started = !0),
        this.kickoff(0),
        this.event(
          "kickoff",
          "¡Comienza el partido!",
          "Dos equipos. Una nueva historia.",
          0,
        )),
      (this.running = !0));
  }
  event(t, e, n = "", s = null, r = null, extra = null) {
    this.onShake && this.onShake(t, e);
    const a = {
      type: t,
      title: e,
      detail: n,
      team: s,
      player: (r == null ? void 0 : r.id) ?? null,
      time: this.time,
      at: this.elapsed,
      id: `${this.elapsed}-${this.events.length}`,
      extra,
    };
    // Tiempo de descuento (pedido explícito): faltas, tarjetas, cambios y lesiones acumulan
    // segundos perdidos por mitad, que después se suman al reloj de esa mitad en vez de cortar
    // siempre a los 45/90 minutos justos.
    if (this.stopClock == null) this.stopClock = [0, 0];
    const halfIdx = this.half === 2 ? 1 : 0;
    if (t === "foul") this.stopClock[halfIdx] += 4;
    else if (t === "card") this.stopClock[halfIdx] += 20;
    else if (t === "sub") this.stopClock[halfIdx] += 25;
    else if (t === "injury") this.stopClock[halfIdx] += 45;
    else if (t === "penalty") this.stopClock[halfIdx] += 20;
    (this.events.unshift(a),
      (this.events = this.events.slice(0, 100)),
      this.onEvent(a));
  }
  kickoff(t) {
    (this.placePlayers(),
      (this.phase = "playing"),
      (this.shot = null),
      (this.receiver = null),
      (this.pendingOffside = null));
    const e = this.players[t * 11 + 9];
    ((e.x = -0.8 * this.direction(t)),
      (e.z = 0),
      (this.ball = { x: 0, z: 0, y: 0.13, vx: 0, vz: 0, vy: 0, spin: 0 }),
      (this.owner = e),
      (this.lastTouch = e),
      (e.controlAt = this.elapsed),
      (e.think = 0.6),
      (this.protectedUntil = this.elapsed + 1.3));
    // FIX — SAQUE DE CENTRO (Ley 8 FIFA): quien saca no puede tocar el balón por segunda vez antes
    // de que otro jugador lo toque, así que un kickoff real SIEMPRE es un pase (nunca una conducción
    // en solitario). Antes esto quedaba en manos del decide() genérico, que a veces elegía "hold" y
    // el jugador arrancaba a conducir en vez de tocarla — acá se fuerza el pase de arranque, igual
    // que ya se hace con córners/saques de banda/tiros libres.
    const opt = this.passOption(e);
    if (opt) this.pass(e, opt, !1);
  }

  // ---- Tactical/identity helpers ----
  identity(t) {
    const m = this.teams[t].mentality;
    switch (m) {
      case "attacking":
      case "aggressive":
        return {
          press: 1.14,
          line: 1.06,
          shotEager: 0.05,
          longPass: 0.95,
          tempo: 0.9,
          width: 1.05,
        };
      case "defensive":
        return {
          press: 0.86,
          line: 0.9,
          shotEager: -0.04,
          longPass: 1.05,
          tempo: 1.08,
          width: 0.94,
        };
      case "possession":
        return {
          press: 0.96,
          line: 1,
          shotEager: -0.02,
          longPass: 0.82,
          tempo: 1.1,
          width: 1.02,
        };
      case "counter":
        return {
          press: 0.9,
          line: 0.92,
          shotEager: 0.03,
          longPass: 1.12,
          tempo: 0.85,
          width: 1,
        };
      case "direct":
        return {
          press: 1.02,
          line: 1,
          shotEager: 0.04,
          longPass: 1.18,
          tempo: 0.82,
          width: 0.98,
        };
      default:
        return {
          press: 1,
          line: 1,
          shotEager: 0,
          longPass: 1,
          tempo: 1,
          width: 1,
        };
    }
  }
  // ================= MANAGER LAYER — API pública para el entrenador (UI hoy, manager mañana) =====
  // Todo lo que un DT (o el futuro juego de manager) puede pedirle al partido pasa por acá. Nunca
  // toca un jugador directamente — sólo cambia `requested`, que después se persigue con retardo
  // real en updateLiveTactics(). Separación explícita (spec #21): esto es "MANAGER DATA"; el motor
  // de partido (teamTactics/decide/updatePlayers) es "MATCH ENGINE" y no sabe de dónde vino el pedido.
  initLiveTactics() {
    // Por defecto el rival (team 1) juega con el asistente táctico interno activado (spec #8:
    // responde solo a la situación); el equipo que se maneja desde el panel TACTICS (team 0) queda
    // en manual para que ningún trigger le pise una decisión sin avisar.
    (this.teams[0].autoTactics == null && (this.teams[0].autoTactics = !1),
      this.teams[1].autoTactics == null && (this.teams[1].autoTactics = !0));
    this.liveTactics = [0, 1].map(() => {
      const requested = { ...TACTIC_DEFAULTS };
      return {
        requested,
        requestedNum: this.tacticEnumToNum(requested),
        active: this.tacticEnumToNum(requested),
        formation: null,
        requestedFormation: null,
        formationFrom: null,
        formationBlend: 1,
        pendingChanges: [],
        lastAppliedAt: -9,
        lastPreset: null,
      };
    });
    this.playerRoles = {};
  }
  tacticEnumToNum(reqObj) {
    const out = {};
    for (const k in reqObj) out[k] = TACTIC_ENUMS[k][reqObj[k]] ?? 0;
    return out;
  }
  // Pide un cambio de instrucciones (parcial — sólo lo que venga en `patch`). Devuelve la lista de
  // claves que realmente cambiaron (para loguear/mostrar). No aplica nada instantáneamente.
  requestTactic(team, patch, meta = {}) {
    const lt = this.liveTactics[team];
    if (!lt) return [];
    const changed = [];
    for (const k in patch) {
      if (!(k in TACTIC_ENUMS)) continue;
      if (!(patch[k] in TACTIC_ENUMS[k])) continue;
      if (lt.requested[k] !== patch[k]) {
        changed.push({ key: k, from: lt.requested[k], to: patch[k] });
        lt.requested[k] = patch[k];
      }
    }
    if (!changed.length) return [];
    lt.requestedNum = this.tacticEnumToNum(lt.requested);
    lt.lastAppliedAt = this.elapsed;
    const now = this.elapsed;
    changed.forEach((c) => lt.pendingChanges.push({ ...c, at: now }));
    (lt.pendingChanges.length > 24 &&
      (lt.pendingChanges = lt.pendingChanges.slice(-24)),
      this.event(
        "tactical_change",
        "CAMBIO TÁCTICO",
        changed.map((c) => `${c.key}: ${c.from} → ${c.to}`).join(", "),
        team,
        null,
        { changed, source: meta.source || "manager" },
      ));
    return changed;
  }
  applyPreset(team, name) {
    const preset = TACTIC_PRESETS[name];
    if (!preset) return [];
    const changed = this.requestTactic(team, preset, { source: "preset:" + name });
    this.liveTactics[team].lastPreset = name;
    changed.length &&
      this.event(
        "tactical_change",
        "PRESET TÁCTICO",
        TACTIC_PRESET_LABELS[name] || name,
        team,
        null,
        { preset: name },
      );
    return changed;
  }
  // Formación en vivo (spec #2): nunca teletransporta — sólo fija el objetivo; formationSlot()
  // hace el resto interpolando la posición real cuadro a cuadro (ver updateLiveTactics/updatePlayers).
  requestFormation(team, formation) {
    if (!Fa[formation]) return !1;
    const lt = this.liveTactics[team];
    if (!lt) return !1;
    const current = lt.formation || this.teams[team].formation;
    if (formation === current && !lt.requestedFormation) return !1;
    if (lt.requestedFormation === formation) return !1;
    ((lt.requestedFormation = formation),
      (lt.formationFrom = lt.formation || current),
      (lt.formationBlend = 0),
      this.event(
        "formation_change",
        "CAMBIO DE FORMACIÓN",
        `${current} → ${formation}`,
        team,
      ));
    return !0;
  }
  // Posición de formación real para este instante — mezcla la formación de origen y la pedida
  // según cuánto haya avanzado la transición (spec #2: "adaptar la nueva estructura progresivamente").
  formationSlot(team, index) {
    const lt = this.liveTactics[team];
    const activeForm = (lt && lt.formation) || this.teams[team].formation;
    if (!lt || !lt.requestedFormation) return Fa[activeForm][index];
    const from = Fa[lt.formationFrom || activeForm][index],
      to = Fa[lt.requestedFormation][index],
      b = lt.formationBlend;
    return [from[0] + (to[0] - from[0]) * b, from[1] + (to[1] - from[1]) * b];
  }
  // Instrucción de rol por jugador (spec #10/#11): no cambia su posición base ni su `role`
  // (GK/DEF/MID/FWD) — sólo un objetivo de comportamiento que la IA individual ya existente lee
  // como un sesgo más (igual que style/traits). Habilita asimetría real (spec #11): cada jugador
  // se ajusta independientemente, sin tocar a sus compañeros de línea.
  setPlayerRole(playerId, instruction) {
    const p = this.players.find((pl) => pl.id === playerId);
    if (!p) return !1;
    (this.playerRoles || (this.playerRoles = {})),
      (this.playerRoles[playerId] = instruction);
    return !0;
  }
  // Wrapper manual de sustitución (spec #9): reusa exactamente el mismo mecanismo que ya usan los
  // cambios automáticos de checkSubs()/forceInjurySub() — sólo cambia quién decide.
  requestSubstitution(team, outId, reason = "táctico") {
    this.event("substitution_requested", "CAMBIO SOLICITADO", reason, team, null, {
      outId,
    });
    if (this.subsUsed[team] >= this.maxSubs || !this.bench[team].length)
      return !1;
    const out = this.players.find((p) => p.id === outId && p.team === team);
    if (!out || out.sentOff) return !1;
    let idx = this.bench[team].findIndex((l) => l.role === out.role);
    if (idx < 0) idx = this.bench[team].findIndex((l) => l.role !== "GK");
    if (idx < 0) return !1;
    const inPlayer = this.bench[team].splice(idx, 1)[0],
      outName = out.name;
    ((out.name = inPlayer.name),
      (out.number = inPlayer.number),
      (out.stats = { ...inPlayer.stats }),
      (out.personality = { ...inPlayer.personality }),
      (out.style = inPlayer.style),
      (out.traits = inPlayer.traits),
      (out.heightM = inPlayer.heightM),
      (out.scale = inPlayer.scale),
      (out.stamina = 100),
      (out.cards = { yellow: 0, red: !1 }),
      (out.subbedIn = !0),
      (out.memory = {
        confidence: 50,
        recentMistakes: 0,
        recentSuccesses: 0,
        recentDuelResults: 0,
        lastOpponent: null,
        lastPassTarget: null,
        pressureMemory: 0,
        recentFatigue: 0,
      }),
      this.subsUsed[team]++,
      this.event(
        "substitution_completed",
        "CAMBIO",
        `${inPlayer.name} entra por ${outName} (${reason})`,
        team,
        out,
      ));
    return !0;
  }
  // Se llama una vez por frame (spec #13: requested/transition/active): persigue los diales
  // numéricos hacia lo pedido a una velocidad que depende de cuán "compenetrado" está el plantel
  // (spec #17 — inteligencia/consistencia promedio) y de si la fatiga se lo permite (spec #18).
  updateLiveTactics(dt) {
    if (!this.liveTactics) return;
    for (let team = 0; team < 2; team++) {
      const lt = this.liveTactics[team];
      if (!lt) continue;
      if (lt.formation == null) lt.formation = this.teams[team].formation;
      const mine = this.players.filter((p) => p.team === team && !p.sentOff);
      const avgIntel = mine.length
          ? mine.reduce((a, p) => a + p.stats.intelligence, 0) / mine.length
          : 70,
        avgConsist = mine.length
          ? mine.reduce((a, p) => a + p.personality.consistency, 0) / mine.length
          : 70,
        avgStamina = mine.length
          ? mine.reduce((a, p) => a + (p.stamina ?? 100), 0) / mine.length
          : 100,
        // Compenetración (spec #17): planteles más inteligentes/consistentes adoptan una
        // instrucción más rápido; uno reventado físicamente (spec #18) tarda más en sostenerla
        // aunque la entienda, porque no llega corriendo a ejecutarla.
        compliance = te(
          0.72 +
            ((avgIntel + avgConsist) / 2 - 65) * 0.011 +
            (avgStamina < 55 ? -0.18 : 0),
          0.55,
          1.4,
        ),
        rateConst = 0.032 * compliance,
        factor = 1 - DM.exp(-rateConst * dt);
      for (const k in lt.active) lt.active[k] += (lt.requestedNum[k] - lt.active[k]) * factor;
      if (lt.requestedFormation) {
        lt.formationBlend = te(lt.formationBlend + dt / (22 / compliance), 0, 1);
        if (lt.formationBlend >= 1) {
          ((lt.formation = lt.requestedFormation),
            (this.teams[team].formation = lt.requestedFormation),
            (lt.requestedFormation = null),
            (lt.formationFrom = null),
            (lt.formationBlend = 1));
        }
      }
      lt.pendingChanges.length &&
        (lt.pendingChanges = lt.pendingChanges.filter(
          (c) => this.elapsed - c.at < 45,
        ));
    }
  }
  // ================= TACTICAL MANAGER INTERNO (spec #8/#12) =================
  // Lee sólo lo que un entrenador real vería (marcador, minuto, posesión, tiros, territorio,
  // pérdidas, tarjetas, lesiones, cambios disponibles, y el COMPORTAMIENTO observable del rival —
  // nunca sus atributos ocultos) y devuelve una recomendación. No aplica nada por sí solo salvo
  // que se lo pidan explícitamente (autoManage) — así la UI puede mostrarlo como sugerencia.
  matchSituation(team) {
    const diff = this.score[team] - this.score[1 - team];
    return diff > 0 ? "WINNING" : diff < 0 ? "LOSING" : "DRAW";
  }
  // Reconocimiento de patrones del rival (spec #12) a partir de telemetría YA existente — nada de
  // información mágica sobre atributos escondidos, sólo lo que el equipo mostró en cancha.
  scoutOpponent(team) {
    const opp = 1 - team,
      st = this.stats[opp],
      tt = this.teamTactics(opp),
      wideAttacks = st.attacksByChannel.left + st.attacksByChannel.right,
      centerAttacks = st.attacksByChannel.center,
      totalAttacks = wideAttacks + centerAttacks || 1,
      avgWidth =
        st.widthSamples.length
          ? st.widthSamples.reduce((a, v) => a + v, 0) / st.widthSamples.length
          : 40,
      avgLine =
        st.lineSamples.length
          ? st.lineSamples.reduce((a, v) => a + v, 0) / st.lineSamples.length
          : 0;
    return {
      buildsWide: wideAttacks / totalAttacks > 0.62,
      buildsCentral: centerAttacks / totalAttacks > 0.55,
      pressesHigh: tt.pressingIntensity > 1.08,
      lowBlock: tt.pressingIntensity < 0.82 && avgLine < -5,
      veryOpen: avgWidth > 46,
      veryCompact: avgWidth < 32,
      direct: tt.directness > 1.15,
      counterThreat:
        st.counterattacks > 1 && this.stats[opp].xg / DM.max(1, this.time / 60) > 0.02,
    };
  }
  // Evalúa la situación con los mismos datos que #8 pide y arma una lista de sugerencias
  // {patch, reason} — nunca decide sola; `autoManage()` es la única que las aplica, y sólo si se
  // la invoca (para un equipo controlado por CPU, o para un botón "Sugerencia del asistente").
  recommendTactics(team) {
    const situation = this.matchSituation(team),
      minute = this.time / 60,
      opp = this.scoutOpponent(team),
      mine = this.players.filter((p) => p.team === team && !p.sentOff),
      avgStamina = mine.length
        ? mine.reduce((a, p) => a + (p.stamina ?? 100), 0) / mine.length
        : 100,
      recs = [];
    if (situation === "WINNING" && minute > 70)
      recs.push({
        preset: "holdLead",
        reason: `Ganando y quedan ${DM.max(0, DM.round(90 - minute))}' — proteger el resultado`,
      });
    else if (situation === "LOSING" && minute > 65)
      recs.push({
        // Diferencia de gol + minuto (spec #6/#8) — perder por 2+ pesa tanto como estar sobre el
        // final: cualquiera de las dos ya justifica ir "con todo" en vez de un press alto normal.
        preset: minute >= 80 || this.score[team] - this.score[1 - team] <= -2
          ? "allOutAttack"
          : "highPress",
        reason: `Perdiendo al minuto ${DM.round(minute)} — hace falta volumen ofensivo`,
      });
    if (opp.buildsWide)
      recs.push({
        patch: { defensiveWidth: "narrow" },
        reason: "El rival construye por las bandas — cerrar el ancho defensivo",
      });
    if (opp.counterThreat && situation === "WINNING")
      recs.push({
        patch: { defensiveLine: "deep", passingRisk: "safe" },
        reason: "El rival es peligroso al contraataque — bajar línea y arriesgar menos",
      });
    if (avgStamina < 58)
      recs.push({
        patch: { pressing: "low", counterPress: "situational" },
        reason: "Piernas cansadas — el pressing alto ya no rinde",
      });
    return recs;
  }
  // Aplica UNA recomendación concreta (llamado explícito — nunca automático sin que algo lo pida).
  autoManage(team, rec) {
    if (!rec) return [];
    if (rec.preset) return this.applyPreset(team, rec.preset);
    if (rec.patch) return this.requestTactic(team, rec.patch, { source: "auto" });
    return [];
  }
  // ================= TACTICAL TRIGGERS (spec #7) =================
  // Datos, no código rígido: cada trigger es {when(ctx)->bool, then: patch|preset, once}. Se
  // evalúan periódicamente (ver step()) contra un contexto liviano; universales de fábrica más los
  // dos ejemplos explícitos del spec — cualquiera puede agregar los suyos sin tocar la IA.
  buildTriggerContext(team) {
    return {
      team,
      minute: this.time / 60,
      winning: this.matchSituation(team) === "WINNING",
      losing: this.matchSituation(team) === "LOSING",
      draw: this.matchSituation(team) === "DRAW",
      scoreDiff: this.score[team] - this.score[1 - team],
      opponent: this.scoutOpponent(team),
      avgStamina:
        this.players
          .filter((p) => p.team === team && !p.sentOff)
          .reduce((a, p, _, arr) => a + (p.stamina ?? 100) / arr.length, 0) || 100,
    };
  }
  ensureTriggers(team) {
    (this._triggers || (this._triggers = [[], []]));
    if (!this._triggers[team].length)
      this._triggers[team] = [
        {
          id: "late_losing_push",
          when: (c) => c.minute > 70 && c.losing,
          then: { mentality: "attacking", pressing: "high" },
        },
        {
          id: "late_winning_vs_counter",
          when: (c) => c.minute > 80 && c.winning && c.opponent.counterThreat,
          then: { tempo: "slower", defensiveLine: "deep", passingRisk: "safe" },
        },
        {
          id: "opponent_builds_wide",
          when: (c) => c.opponent.buildsWide,
          then: { defensiveWidth: "narrow" },
        },
      ];
    return this._triggers[team];
  }
  evaluateTriggers(team) {
    const ctx = this.buildTriggerContext(team),
      triggers = this.ensureTriggers(team),
      fired = [];
    for (const trig of triggers) {
      const key = "_fired_" + trig.id;
      if (trig.once && this[key]) continue;
      let ok = !1;
      try {
        ok = !!trig.when(ctx);
      } catch (e) {
        ok = !1;
      }
      if (ok) {
        this.requestTactic(team, trig.then, { source: "trigger:" + trig.id });
        (fired.push(trig.id), (this[key] = !0));
      }
    }
    return fired;
  }
  // ================= FASE A — MODELO TÁCTICO COLECTIVO (spec #2) =================
  // Snapshot de equipo derivado de formación + mentalidad + fase del partido + contexto actual
  // (marcador, tiempo, stamina). Se cachea ~0.5s por equipo (spec #23: no recalcular por jugador
  // por frame) y es la única fuente de: fase táctica, ancho/línea/compacidad/pressing efectivos,
  // y las preferencias de estilo (build-up, tempo, riesgo, contraataque, posesión, directness).
  // Devuelve además los mismos campos que identity() (press/line/shotEager/longPass/tempo/width)
  // así que reemplaza 1:1 cualquier `this.identity(team)` existente sin romper nada.
  teamTactics(team) {
    if (
      this._tacticsCache[team] &&
      this.elapsed - this._tacticsCacheAt[team] < 0.33
    )
      return this._tacticsCache[team];
    const id = this.identity(team),
      opp = 1 - team,
      mine = this.players.filter(
        (p) => p.team === team && p.role !== "GK" && !p.sentOff,
      ),
      // AI2 (spec #13): con la capa nueva activa, "tener la pelota" sale del cerebro colectivo con
      // histéresis (evidencia acumulada, umbral de entrada ≠ salida) en vez de flipear por cada toque.
      hasBall = this.brain[team].hasBall,
      justWon = this.elapsed - (this.gainedBallAt[team] ?? -9) < 3.2,
      justLost = this.elapsed - (this.lostBallAt[team] ?? -9) < 3.2,
      inStoppage = this.phase === "restart" || this.phase === "freekick",
      urgency = this.urgency(team),
      avgStamina = mine.length
        ? mine.reduce((a, p) => a + (p.stamina ?? 100), 0) / mine.length
        : 100,
      staminaFactor = te(avgStamina / 100, 0.55, 1.05),
      scoreDiff = this.score[team] - this.score[opp],
      lateGame = this.time / 60 > 80;
    let phase = inStoppage
      ? "set_piece"
      : hasBall
        ? justWon
          ? "transition_attack"
          : "attacking"
        : justLost
          ? "transition_defense"
          : "defensive";
    const emergency =
      !inStoppage &&
      lateGame &&
      ((!hasBall && scoreDiff < 0) || (hasBall && scoreDiff <= -2));
    if (emergency) phase = "emergency";

    // Formación → ancho/compacidad base (spec #20): un 4-4-2 es intrínsecamente más compacto y
    // menos ancho en ataque que un 4-3-3 con extremos abiertos; un 4-2-3-1 reparte el mediocampo
    // en dos líneas (doble pivote + mediapunta) lo que le da más cobertura central pero menos
    // gente llegando ancha al área.
    const formation = this.teams[team].formation,
      formShape =
        {
          "4-3-3": { width: 1.08, compact: 0.94, support: 1.1, prog: 1.05 },
          "4-2-3-1": { width: 0.98, compact: 1.05, support: 1.18, prog: 0.95 },
          "4-4-2": { width: 1, compact: 1.1, support: 0.92, prog: 0.98 },
        }[formation] || { width: 1, compact: 1, support: 1, prog: 1 };

    let pressingIntensity = te(
        id.press * 1.12 *
          staminaFactor *
          (1 + urgency * 0.025) *
          (phase === "emergency"
            ? 1.3
            : phase === "transition_defense"
              ? 1.12
              : phase === "defensive"
                ? 1
                : 0.85),
        0.55,
        1.55,
      ),
      compactness = te(
        formShape.compact *
          (1.05 - urgency * 0.015) *
          (phase === "defensive" || phase === "emergency" ? 1.06 : 0.96) *
          (staminaFactor < 0.8 ? 1.08 : 1),
        0.72,
        1.3,
      ),
      attackingWidth = te(id.width * formShape.width, 0.75, 1.35),
      defensiveWidth = te(id.width * (2 - formShape.compact) * 0.95, 0.7, 1.15),
      defensiveLine = te(
        id.line * (phase === "emergency" ? 1.12 : 1) -
          (phase === "transition_defense" ? 0.06 : 0),
        0.75,
        1.25,
      ),
      attackingLine = te(defensiveLine * (1 + urgency * 0.01), 0.75, 1.3),
      riskTolerance = te(
        0.5 +
          urgency * 0.05 +
          (phase === "transition_attack" ? 0.08 : 0) +
          (this.teams[team].mentality === "possession" ? -0.08 : 0) +
          (this.teams[team].mentality === "direct" ? 0.1 : 0),
        0.15,
        0.9,
      ),
      possessionPreference = te(
        (this.teams[team].mentality === "possession" ? 0.75 : 0.4) *
          formShape.support -
          urgency * 0.03,
        0.15,
        0.95,
      ),
      counterAttackPreference = te(
        (this.teams[team].mentality === "counter" ? 0.78 : 0.35) +
          (staminaFactor > 0.85 ? 0.08 : -0.06),
        0.1,
        0.95,
      ),
      directness = te(
        id.longPass * (this.teams[team].mentality === "direct" ? 1.15 : 1) *
          formShape.prog -
          possessionPreference * 0.3,
        0.55,
        1.5,
      ),
      passingTempo = te(
        id.tempo * (phase === "transition_attack" ? 1.08 : 1) -
          (staminaFactor < 0.75 ? 0.08 : 0),
        0.65,
        1.35,
      );

    // ================= MANAGER LAYER — TÁCTICAS EN TIEMPO REAL =================
    // Capa que el "entrenador" (UI o, mañana, el juego de manager) controla — nunca sustituye la
    // IA colectiva de arriba, sólo la inclina: toma los valores YA calculados (fase, formación,
    // stamina, urgencia...) y los ajusta con los diales en vivo (liveTactics.active), que a su vez
    // sólo llegan ahí después de "propagarse" con retardo real (ver updateLiveTactics()) — nunca
    // hay un salto instantáneo de comportamiento cuando el entrenador cambia algo.
    const lv = this.liveTactics && this.liveTactics[team] && this.liveTactics[team].active;
    if (lv) {
      pressingIntensity = te(
        pressingIntensity * (1 + lv.pressing * 0.17 + lv.mentality * 0.04),
        0.45,
        1.85,
      );
      compactness = te(
        compactness *
          (1 - lv.attackingWidth * 0.05 + (lv.defensiveWidth < 0 ? 0.1 : -0.03)),
        0.6,
        1.4,
      );
      attackingWidth = te(attackingWidth * (1 + lv.attackingWidth * 0.15), 0.6, 1.5);
      defensiveWidth = te(defensiveWidth * (1 + lv.defensiveWidth * 0.15), 0.55, 1.3);
      defensiveLine = te(
        defensiveLine * (1 + lv.defensiveLine * 0.14 + lv.mentality * 0.04),
        0.55,
        1.55,
      );
      attackingLine = te(attackingLine * (1 + lv.mentality * 0.05), 0.55, 1.6);
      riskTolerance = te(
        riskTolerance + lv.passingRisk * 0.15 + lv.mentality * 0.06 + lv.shotRisk * 0.05,
        0.08,
        0.97,
      );
      possessionPreference = te(
        possessionPreference + (lv.buildUp < 0 ? 0.15 : 0) - (lv.buildUp > 0 ? 0.15 : 0),
        0.08,
        0.98,
      );
      directness = te(
        directness + lv.buildUp * 0.17 + lv.longBallFrequency * 0.15,
        0.4,
        1.75,
      );
      counterAttackPreference = te(
        counterAttackPreference + lv.counterAttack * 0.17,
        0.03,
        0.98,
      );
      passingTempo = te(passingTempo * (1 + lv.tempo * 0.1), 0.5, 1.55);
    }
    const midfieldLine = (defensiveLine + attackingLine) / 2,
      buildUpStyle =
        possessionPreference > 0.55
          ? "possession"
          : directness > 1.1
            ? "direct"
            : "mixed",
      defensiveBlock =
        phase === "emergency"
          ? "high"
          : pressingIntensity > 1.05
            ? "high"
            : pressingIntensity < 0.8
              ? "low"
              : "mid",
      transitionPriority =
        this.transitionMode[team] && this.transitionMode[team].until > this.elapsed
          ? this.transitionMode[team].mode
          : phase === "transition_defense"
            ? "regroup"
            : phase === "transition_attack"
              ? this.transitionAttackMode[team] || "fast_progression"
              : "none";

    const tt = {
      ...id, // press/line/shotEager/longPass/tempo/width — compatibilidad hacia atrás
      phase,
      mentality: this.teams[team].mentality,
      attackingWidth,
      defensiveWidth,
      defensiveLine,
      midfieldLine,
      attackingLine,
      compactness,
      pressingIntensity,
      buildUpStyle,
      passingTempo,
      riskTolerance,
      counterAttackPreference,
      possessionPreference,
      directness,
      defensiveBlock,
      transitionPriority,
      // Sobrescribe press/line/width de identity() con las versiones moduladas por fase/stamina —
      // así todo el código existente que ya lee id.press/id.line/id.width se vuelve dinámico gratis.
      press: pressingIntensity,
      line: defensiveLine,
      width: attackingWidth,
      // Diales que no tenían un correlato numérico propio en el modelo colectivo — se leen directo
      // en los puntos de la IA individual que corresponden (ver decide()/updatePlayers()/assignMarks()).
      marking: lv ? lv.marking : 0,
      attackingPlayers: lv ? lv.attackingPlayers : 0,
      overlapFrequency: lv ? lv.overlapFrequency : 0,
      crossFrequency: lv ? lv.crossFrequency : 0,
      longBallFrequency: lv ? lv.longBallFrequency : 0,
      shotRisk: lv ? lv.shotRisk : 0,
      timeWasting: lv ? lv.timeWasting : 0,
      mentalityLevel: lv ? lv.mentality : 0,
      manager: this.liveTactics ? this.liveTactics[team] : null,
    };
    // AI2: fase detallada del cerebro colectivo (spec #1) — sólo lectura/debug y coordinadores; el
    // resto de la IA sigue leyendo las fases legadas de arriba.
    if (this.brain) {
      const bb = this.brain[team];
      tt.highPress = bb.highPress;
      tt.brainPhase = bb.phaseDetail =
        phase === "set_piece" || phase === "emergency"
          ? phase
          : transitionPriority === "counterattack"
            ? "counter"
            : transitionPriority === "counterpress"
              ? "counterpress"
              : transitionPriority === "immediate_retreat"
                ? "retreat"
                : transitionPriority === "possession_reset"
                  ? "possession_reset"
                  : phase === "transition_attack"
                    ? "fast_progression"
                    : phase === "transition_defense"
                      ? "transition_defense"
                      : phase === "attacking"
                        ? possessionPreference > 0.6
                          ? "possession_control"
                          : "settled_attack"
                        : "settled_defense";
    }
    return (
      (this._tacticsCache[team] = tt), (this._tacticsCacheAt[team] = this.elapsed), tt
    );
  }
  // ================= FASE B — TRANSICIONES (spec #5) =================
  // Se llama una sola vez, en el instante exacto de la pérdida/recuperación (possession()), nunca
  // por jugador por frame. Decide cómo reacciona el equipo que PIERDE la pelota (contrapresión /
  // presión demorada / repliegue inmediato / reagrupe / falta táctica) y qué busca el que la GANA
  // (contraataque / progresión rápida / reset de posesión) — spec explícito: "no todos los robos
  // deben producir contraataque".
  decideTransitions(gainTeam, loseTeam, lossX, lossZ) {
    const loseMine = this.players.filter(
        (p) => p.team === loseTeam && p.role !== "GK" && !p.sentOff,
      ),
      gainMine = this.players.filter(
        (p) => p.team === gainTeam && p.role !== "GK" && !p.sentOff,
      ),
      dirLose = this.direction(loseTeam),
      nearLossCount = loseMine.filter(
        (p) => DM.hypot(p.x - lossX, p.z - lossZ) < 12,
      ).length,
      dangerToLoser = this.dangerAt(lossX, lossZ, gainTeam),
      avgStaminaLose = loseMine.length
        ? loseMine.reduce((a, p) => a + (p.stamina ?? 100), 0) / loseMine.length
        : 100,
      idLose = this.identity(loseTeam),
      linesSpread = DM.abs(
        DM.max(...loseMine.map((p) => p.x * dirLose)) -
          DM.min(...loseMine.map((p) => p.x * dirLose)),
      );
    // AL PERDER (loseTeam): counterpress si hay número cerca, la posición no es letal, y hay
    // piernas/pressing para sostenerlo; repliegue inmediato si el peligro es grande o el equipo
    // está deshecho de líneas/stamina; falta táctica sólo como último recurso en transición
    // peligrosa sin cobertura; si no, presión demorada o reagrupe simple.
    let loseMode;
    if (dangerToLoser > 0.62 && nearLossCount <= 1)
      loseMode = "tactical_foul";
    else if (
      nearLossCount >= 2 &&
      avgStaminaLose > 55 &&
      idLose.press >= 0.94 &&
      dangerToLoser < 0.55
    )
      loseMode = "counterpress";
    else if (dangerToLoser > 0.45 || avgStaminaLose < 45 || linesSpread > 34)
      loseMode = "immediate_retreat";
    else if (nearLossCount >= 1) loseMode = "delayed_press";
    else loseMode = "regroup";
    this.transitionMode[loseTeam] = {
      mode: loseMode,
      until: this.elapsed + (loseMode === "counterpress" ? 4.5 : 3),
    };
    if (loseMode === "counterpress")
      this.stats[loseTeam].counterpressActions++;

    // AL RECUPERAR (gainTeam): no todo robo es contraataque — sólo cuando hay espacio real por
    // delante, pocos rivales entre la pelota y el arco, y el equipo tiene piernas/perfil para
    // explotarlo. Si el rival ya está replegado y compacto, mejor progresión rápida controlada o,
    // si el propio equipo está desordenado/cansado, directamente resetear la posesión.
    const oppAhead = gainMine.length
        ? this.players.filter(
            (p) =>
              p.team === loseTeam &&
              p.role !== "GK" &&
              !p.sentOff &&
              (p.x - lossX) * this.direction(gainTeam) > 3,
          ).length
        : 0,
      avgStaminaGain = gainMine.length
        ? gainMine.reduce((a, p) => a + (p.stamina ?? 100), 0) / gainMine.length
        : 100,
      idGain = this.identity(gainTeam),
      spaceAheadOfLoss = this.spaceAt(
        lossX + 14 * this.direction(gainTeam),
        lossZ,
        this.players.filter((p) => p.team === loseTeam && p.role !== "GK"),
      );
    let gainMode;
    if (
      oppAhead <= 2 &&
      spaceAheadOfLoss > 9 &&
      avgStaminaGain > 50 &&
      idGain.press >= 0 &&
      this.random() < te(idGain.press * 0.55 + 0.15, 0.15, 0.85)
    )
      gainMode = "counterattack";
    else if (avgStaminaGain < 42 || oppAhead >= 5)
      gainMode = "possession_reset";
    else gainMode = "fast_progression";
    // AI2: la transición al recuperar se evalúa con el mapa de control (espacio delante, compañeros en
    // ventaja, aislamiento, stamina, marcador/minuto) en vez de umbrales fijos.
    gainMode = this.ai2GainMode(gainTeam, loseTeam, lossX, lossZ, gainMode);
    this.transitionAttackMode[gainTeam] = gainMode;
    if (gainMode === "possession_reset")
      this.consolidateUntil[gainTeam] = this.elapsed + 3.5;
    if (gainMode === "counterattack")
      (this.counterUntil[gainTeam] = this.elapsed + (3 + this.range(0, 1.5)),
        this.stats[gainTeam].counterattacks++);
  }
  // Cheap deterministic pairwise chemistry in [0,1], stable per pair of ids.
  chem(a, b) {
    const h = (a.id * 137 + b.id * 461 + (a.id ^ b.id) * 29) % 211;
    return h / 211;
  }
  // Distance from (x,z) to nearest player in `list` (min-distance = free space proxy).
  spaceAt(x, z, list) {
    let best = 40;
    for (const p of list) {
      const d = DM.hypot(p.x - x, p.z - z);
      if (d < best) best = d;
    }
    return best;
  }
  // Estimate how dangerous it is for `team` to have the ball at (x,z): 0 (harmless) .. ~1 (huge chance).
  dangerAt(x, z, team) {
    const dir = this.direction(team),
      distGoal = 52.5 - x * dir,
      wide = DM.abs(z);
    if (distGoal < 0 || distGoal > 60) return 0.02;
    const angle = DM.atan2(wide, DM.max(distGoal, 1.5)),
      angleFactor = te(1 - angle / 1.1, 0, 1),
      distFactor = te(1 - distGoal / 46, 0, 1);
    let v = distFactor * 0.55 + angleFactor * 0.45;
    if (distGoal < 16.5 && wide < 20.15) v = v * 0.5 + 0.52;
    else if (distGoal < 30 && wide < 26) v += 0.1;
    return te(v, 0, 1);
  }
  // Composite -0.3..0.9 risk appetite from personality + technical quality; higher = takes more chances.
  riskProfile(t) {
    return te(
      (t.personality.creativity - 50) * 0.009 +
        (t.personality.aggression - 50) * 0.004 -
        (t.personality.consistency - 55) * 0.003 +
        (t.stats.dribbling - 70) * 0.003,
      -0.3,
      0.65,
    );
  }
  // ================= ATRIBUTOS INTERNOS DERIVADOS (spec #16) =================
  // No son estadísticas nuevas visibles al usuario — se calculan a partir de las que ya existen
  // (physical/defense/shooting/intelligence/personality) y sólo alimentan decisiones (córners,
  // primer toque, lectura del arquero). aerialAbility ~ "quién gana el cabezazo"; firstTouch ~
  // "calidad del primer contacto"; anticipation ~ "lee la jugada antes de que pase".
  aerialAbility(p) {
    return te(
      p.stats.physical * 0.5 +
        p.stats.defense * 0.2 +
        p.stats.shooting * 0.15 +
        p.personality.aggression * 0.15,
      0,
      100,
    );
  }
  firstTouchAbility(p) {
    return te(
      p.stats.dribbling * 0.4 +
        p.stats.passing * 0.25 +
        p.stats.intelligence * 0.2 +
        p.personality.composure * 0.15,
      0,
      100,
    );
  }
  anticipation(p) {
    return te(
      p.stats.intelligence * 0.55 + p.personality.consistency * 0.45,
      0,
      100,
    );
  }
  // FASE F — quién gana un balón dividido (spec #17): no "el más cercano" a secas, sino distancia +
  // velocidad/aceleración + físico + anticipación + stamina + si ya viene cerrando el ángulo hacia
  // la pelota (un jugador que ya está encarando la jugada llega mejor que uno igual de cerca pero
  // de espaldas o parado). Sólo determina orden de prioridad entre candidatos ya elegibles por las
  // condiciones geométricas propias de cada rama (GK/tackle/bloqueo/recepción) — no reemplaza esas
  // condiciones, sólo decide quién de ellos se evalúa primero cuando dos o más califican a la vez.
  looseBallScore(p, ball) {
    if (p.sentOff || p.ragdoll) return -1e9;
    const d = ze(p, ball),
      toBall = $i(ball.x - p.x, ball.z - p.z),
      speed = DM.hypot(p.vx, p.vz),
      closing = speed > 0.2 ? (p.vx * toBall.x + p.vz * toBall.z) / speed : 0,
      staminaFactor = (p.stamina ?? 100) / 100;
    return (
      -d * 2.2 +
      p.stats.speed * 0.05 +
      p.stats.acceleration * 0.04 +
      p.stats.physical * 0.02 +
      this.anticipation(p) * 0.03 +
      staminaFactor * 3 +
      closing * 1.6
    );
  }
  // Lightweight "is something big on" signal (#42): a teammate in real space up the pitch, numbers in the
  // final third, or an active counter — the higher it reads, the more the team should push its luck now.
  opportunityScore(team) {
    const dir = this.direction(team),
      mine = this.players.filter(
        (p) => p.team === team && !p.sentOff && p.role !== "GK",
      ),
      theirs = this.players.filter(
        (p) => p.team !== team && !p.sentOff && p.role !== "GK",
      );
    let best = 0;
    for (const p of mine) {
      const adv = p.x * dir;
      if (adv < 0) continue;
      const space = this.spaceAt(p.x, p.z, theirs),
        sc = te(space / 9, 0, 1) * te((adv + 15) / 55, 0, 1);
      if (sc > best) best = sc;
    }
    const superiority = te(
        (mine.filter((p) => p.x * dir > 17.5).length -
          theirs.filter((p) => p.x * dir > 12).length) /
          3,
        0,
        1,
      ),
      counter = this.counterUntil[team] > this.elapsed ? 0.3 : 0;
    return te(best * 0.6 + superiority * 0.3 + counter, 0, 1);
  }
  possession(t) {
    // FUERA DE JUEGO diferido (Ley 11 FIFA): si había un offside "pendiente" de un pase anterior,
    // recién ahora se resuelve — sólo es infracción si el que toca la pelota es justo el jugador
    // que estaba adelantado. Si la toca cualquier otro (compañero, rival que la corta), la jugada
    // sigue como si nada — tal como marca el reglamento.
    if (this.pendingOffside) {
      if (t.id === this.pendingOffside.offenderId) {
        this.resolvePendingOffside(t);
        return;
      }
      this.pendingOffside = null;
    }
    const e = this.lastTouch;
    this.receiver &&
      e &&
      e.team === t.team &&
      e.id !== t.id &&
      this.stats[t.team].completed++;
    // AI2: pase completado → memoria del pasador (más si fue arriesgado) y acciones "afortunadas"
    if (this.receiver && e && e.ai && e.team === t.team && e.id !== t.id && this.elapsed - (e.ai.lastPassAt ?? -9) < 4) {
      this.ai2Outcome(e, "pass", true, { risky: e.ai.lastPassRisky });
      if ((e.ai.lastPassEst ?? 1) < 0.28) this.ai2Count(e, "lucky_actions");
      e.ai.lastPassAt = -9;
      // espacio generado que alguien aprovecha: un compañero (≠ creador) recibe cerca del hueco
    }
    if (e && e.team !== t.team && this.elapsed - this.kickedAt > 0.4) {
      this.stats[t.team].tackles++;
      // FASE B — telemetría de la transición (spec #22): distinguir intercepción (la pelota
      // estaba en el aire/viajando hacia un compañero de e) de tackle/robo directo (e la tenía
      // controlada) usando el estado de posesión de ESTE mismo instante, antes de reasignarlo más
      // abajo.
      const wasOwned = !!(this.owner && this.owner.team === e.team);
      (this.stats[t.team].recoveries++,
        this.stats[t.team].forcedTurnovers++,
        this.stats[e.team].turnovers++,
        !wasOwned && this.stats[t.team].interceptions++,
        this.gainedBallAt[t.team] = this.elapsed,
        this.decideTransitions(t.team, e.team, t.x, t.z));
      // AI2: telemetría + memoria del que perdió el pase + reacción tardía del equipo que pierde
      !wasOwned && this.ai2Count(t, "interceptions");
      if (e.ai && this.elapsed - (e.ai.lastPassAt ?? -9) < 4) {
        this.ai2Outcome(e, "pass", false, { risky: e.ai.lastPassRisky });
        e.ai.lastPassAt = -9;
      }
      this.ai2OnTurnover(e.team, t.x, t.z);
      this.lostBallAt[e.team] = this.elapsed;
      // Memoria (spec #15): perder la pelota (encima o en un pase cortado) pesa un poco sobre la
      // confianza de quien la perdió — sutil, se recupera solo en unos segundos (ver decay en
      // updatePlayers()).
      e.memory &&
        ((e.memory.recentMistakes += 1),
          (e.memory.confidence = te(e.memory.confidence - 2.5, 15, 88)));
      if (this.elapsed - (this.lastTurnoverEvent || 0) > 7) {
        (this.event(
          "intercept",
          t.x * this.direction(t.team) < 5 ? "CONTRAATAQUE" : "Intercepción",
          `${t.name} recupera y busca espacio`,
          t.team,
          t,
        ),
          (this.lastTurnoverEvent = this.elapsed));
      }
    }
    ((this.owner = t),
      (this.lastTouch = t),
      (this.receiver = null),
      (this.shot = null),
      // Fase 1: la ventana en que un rival no puede disputar al que acaba de recibir se acortó (1.05 s → 0.35 s): recibir bajo
      // presión es justo donde nacen los robos directos; con 1.05 s el defensor que llegaba a tiempo no podía tocar nada.
      (this.protectedUntil = this.elapsed + 0.35),
      (t.controlAt = this.elapsed),
      (t.think = this.range(0.35, 0.65)),
      (t.state = "Receive"),
      (t.action = 0.25));

    // ================= FASE C — RECEPCIÓN Y PRIMER TOQUE (spec #8) =================
    // Body orientation (#44) + first touch (#10): receiving with your back to the opponent's goal is
    // structurally a worse touch than receiving already facing forward — you have to open up first.
    const dir2 = this.direction(t.team),
      facing = DM.cos(t.angle - (dir2 > 0 ? DM.PI / 2 : -DM.PI / 2)),
      backToGoal = facing < -0.2;
    const nearestOpp = this.players.filter(
      (p) => p.team !== t.team && !p.sentOff,
    );
    const pressure = te(1 - this.spaceAt(t.x, t.z, nearestOpp) / 6, 0, 1);
    const ballSpeed = DM.hypot(this.ball.vx, this.ball.vz);
    const fta = this.firstTouchAbility(t) / 100;
    const touchQuality = te(
      (t.stats.dribbling * 0.55 + t.personality.consistency * 0.45) / 100 -
        pressure * 0.22 -
        ballSpeed * 0.006 -
        (backToGoal ? 0.1 : 0) -
        ((t.stamina ?? 100) < 45 ? 0.06 : 0),
      0.12,
      0.98,
    );
    if (backToGoal && pressure > 0.45)
      ((t.pressTrigger = this.elapsed),
        (this.pressTriggerUntil[t.team] = this.elapsed + 1.8));
    if (touchQuality < 0.5) this.pressTriggerUntil[t.team] = this.elapsed + 1.8;
    const spaceAheadRecv = this.spaceAt(t.x + 6 * dir2, t.z, nearestOpp);
    // Un jugador no sólo "controla bien o mal" — elige QUÉ tipo de toque le conviene según cómo
    // llega la pelota, cuánta presión tiene encima y qué tan bueno es de primeras: proteger,
    // devolver de primera, girar hacia el arco, controlar hacia la banda o directamente atacar el
    // espacio que tiene libre por delante.
    let touchType;
    if (touchQuality < 0.55 && this.random() < (1 - touchQuality) * 0.5)
      touchType = "heavy"; // primer toque malo (spec #19: error contextual, no aleatorio puro)
    else if (pressure > 0.58 && backToGoal && t.stats.physical > 62)
      touchType = "protect";
    else if (backToGoal && (fta < 0.62 || pressure > 0.4))
      touchType = "turn";
    else if (!backToGoal && spaceAheadRecv > 7 && pressure < 0.4)
      touchType = "attack_space";
    else if (DM.abs(t.z) > 20 && !backToGoal)
      touchType = "control_wide";
    else touchType = "control_forward";
    // AI2 (spec #20): el primer toque es una decisión del cerebro — considera presión, mapa de control,
    // velocidad del balón y recursos (descargar de primera); luego sigue pudiendo fallar (heavy).
    if (t.ai)
      ((t.ai.recvSpeed = ballSpeed), (touchType = this.ai2ChooseTouch(t, touchType, { pressure, backToGoal, ballSpeed, fta })));
    t.lastTouchType = touchType;
    if (touchType === "heavy") {
      const wob = (1 - touchQuality) * 2.6;
      this.ball.vx = this.ball.vx * 0.34 + this.range(-wob, wob);
      this.ball.vz = this.ball.vz * 0.34 + this.range(-wob, wob);
      this.ball.vy = 0.2;
    } else if (touchType === "protect") {
      // Cuerpo entre la pelota y el rival: la mata casi en seco, apenas la corre del lado
      // contrario a la presión para poder shieldearla en el próximo instante.
      const away = nearestOpp.length
        ? DM.sign(t.z - nearestOpp.sort((a, b) => ze(t, a) - ze(t, b))[0].z) || 1
        : 1;
      ((this.ball.vx *= 0.12), (this.ball.vz = this.ball.vz * 0.12 + away * 0.4), (this.ball.vy = 0));
    } else if (touchType === "turn") {
      // Abrir el cuerpo: primero un toque lateral/de contención antes de poder mirar para
      // adelante — no empuja el balón hacia el propio arco, sólo lo prepara para el próximo toque.
      const side = t.z >= 0 ? 1 : -1;
      ((this.ball.vx *= 0.22), (this.ball.vz = this.ball.vz * 0.22 + side * 0.9 * fta), (this.ball.vy = 0));
    } else if (touchType === "attack_space") {
      // Toque de primera hacia el espacio libre por delante — el más agresivo de los limpios.
      ((this.ball.vx = this.ball.vx * 0.26 + dir2 * 0.34 * fta),
        (this.ball.vz *= 0.26),
        (this.ball.vy = 0));
    } else if (touchType === "control_wide") {
      const side = t.z >= 0 ? 1 : -1;
      ((this.ball.vx = this.ball.vx * 0.28 + dir2 * 0.08),
        (this.ball.vz = this.ball.vz * 0.28 + side * 0.22 * fta),
        (this.ball.vy = 0));
    } else {
      // control_forward: toque limpio estándar, hacia el espacio pero sin exagerar.
      const boost = pressure < 0.4 ? 0.12 : 0;
      ((this.ball.vx = this.ball.vx * 0.28 + dir2 * boost * 3),
        (this.ball.vz *= 0.28),
        (this.ball.vy = 0));
    }
    this.ball.spin *= 0.1;
    // AI2: consecuencias del toque sobre la próxima decisión (sesgos chicos y temporales)
    if (t.ai) {
      this.ai2AfterTouch(t, touchType, { pressure, backToGoal });
      if (touchType === "one_touch") t.think = 0.06;
    }
  }
  pass(t, e, n = !1, exemptOffside = !1, meta = null) {
    t.spTaker = null;
    if (e && e.p && e.p.role === "GK" && e.p.team === t.team) this.p3Foot = { id: e.p.id, at: this.elapsed }; // pase atrás al arquero: sólo con los pies
    // Fase 1: "filtrado" es una CLASE de pase del PassPlan (antes un 40% aleatorio que corría el objetivo 4 m
    // y rompía el contrato pasador/receptor: el pasador creía que llegaba a X y el receptor corría a Y).
    const r = this.direction(t.team),
      a = e.kind === "through";
    // FUERA DE JUEGO (spec #24 + Ley 11 FIFA — pedido explícito de revisar el reglamento): estar
    // en posición adelantada NO es en sí mismo una infracción — recién se sanciona si el jugador
    // se involucra en la jugada (toca el balón, o interfiere). Antes se cobraba apenas salía el
    // pase, aunque el balón nunca llegara a tocarlo. Ahora el pase sale con total normalidad y
    // sólo queda "pendiente": si el balón termina en los pies del jugador adelantado, ahí se
    // cobra (resolvePendingOffside(), enganchado en possession()); si lo intercepta un rival, lo
    // toca un compañero primero, o sale de la cancha, no pasa nada — exactamente como en la
    // realidad. exemptOffside cubre el córner corto (no hay offside directo de un córner); el
    // saque de banda tiene su propio método (throwIn) y ni pasa por acá. El saque de arco sí pasa
    // por acá (el arquero recupera posesión y luego la juega como un pase normal), así que su
    // primer toque se exime consumiendo taker.offsideExempt una sola vez.
    const goalKickExempt = !!t.offsideExempt;
    t.offsideExempt = !1;
    if (!exemptOffside && !goalKickExempt && this.isOffside(t, e.p))
      this.pendingOffside = {
        offenderId: e.p.id,
        team: t.team,
        lineX: this.offsideLineX(t),
        pasX: t.x,
        pasZ: t.z,
        offAtPassX: e.p.x,
        offAtPassZ: e.p.z,
        passerName: t.name,
        frame: this.snapshotFrame(),
      };
    const s = this.ball,
      o = te(e.x, -49, 49),
      c = e.z;
    // AI2 (spec #3/#4): ejecución contextual — el error sale de la dificultad real del pase (distancia,
    // carril, presión, pie, orientación...) y se registra aparte del error de decisión.
    const ai2x = t.ai ? this.ai2ExecPass(t, e, n, meta, o, c) : null;
    // Execution quality: better passers under less pressure hit cleaner balls; fatigue and pressure add noise.
    const opps = this.players.filter((p) => p.team !== t.team && !p.sentOff),
      pressure = te(1 - this.spaceAt(t.x, t.z, opps) / 7, 0, 1),
      fatigue = (100 - (t.stamina ?? 100)) * 0.003,
      quality = ai2x
        ? ai2x.q
        : te(t.stats.passing / 100 - pressure * 0.16 - fatigue, 0.12, 0.98),
      l = (1 - quality) * 3.3,
      dx = o - s.x + (ai2x ? ai2x.ex : this.range(-l, l)),
      dz = c - s.z + (ai2x ? ai2x.ez : this.range(-l, l)),
      dist = DM.max(1, DM.hypot(dx, dz)),
      d = { x: dx / dist, z: dz / dist },
      h = n || e.loft,
      underhit = ai2x
        ? ai2x.under
        : this.random() < (1 - quality) * 0.22 ? this.range(0.72, 0.92) : 1,
      // Fase 1: velocidad de salida = MISMA fórmula (p1KickVel) con la que el PassPlan evaluó el pase — la pelota
      // rasante sale para llegar con velocidad controlable (v_arr) dado el rozamiento real; la aérea aterriza en el
      // punto de apunte. underhit se aplica sólo a la horizontal (un golpeo flojo se queda corto, no "teletransporta").
      cls = n ? "cross" : e.plan ? e.plan.cls : e.kind === "through" ? "through" : e.kind === "switch" ? "switch" : "feet",
      kv = this.p1KickVel(s, s.x + dx, s.z + dz, cls, h),
      p = kv.speed * underhit,
      plan = e.plan || (e.p ? this.p1PlanPass(t, e.p, cls, o, c, { loft: h, allowContest: !0, kind: e.kind }) : null);
    ((s.vx = d.x * p),
      (s.vz = d.z * p),
      (s.vy = h ? kv.vy : 0.35),
      (s.spin = this.range(-0.3, 0.3)),
      this.stats[t.team].passes++,
      (this.stats[t.team].passesByKind[e.kind || "safe"] =
        (this.stats[t.team].passesByKind[e.kind || "safe"] || 0) + 1),
      e.progress > 5 && this.stats[t.team].progressivePasses++,
      n && this.stats[t.team].crosses++,
      e.kind === "cutback" && this.stats[t.team].cutbacks++,
      (this.owner = null),
      (this.receiver = e.p),
      (this.lastTouch = t),
      (this.kickedAt = this.elapsed),
      (t.state = n ? "Cross" : "Pass"),
      (t.action = 0.55),
      (t.think = 0.7),
      // Marca cuándo fue el último centro (spec #17/#20): mientras está en el aire, los demás
      // atacantes cercanos al área pueden elegir primer palo / segundo palo / punto penal en vez
      // de mantener la posición de ataque genérica (ver updatePlayers()).
      n && (this.lastCrossAt = this.elapsed),
      // pasador y receptor comparten el mismo punto de encuentro (interceptPoint del PassPlan)
      (this.passPlan = plan),
      this.p1LogPass(t, e, plan, kv, p),
      (e.p.target = plan && plan.interceptPoint ? { x: plan.interceptPoint.x, z: plan.interceptPoint.z } : { x: o, z: c }),
      (e.p.state = "ReceiveBall"),
      (e.p.lastPasser = t.id),
      (e.p.lastPassAt = this.elapsed),
      (t.lastPassKind = e.kind),
      t.memory && (t.memory.lastPassTarget = e.p.id),
      // Press trigger (#39): a backpass invites the opponent to squeeze up as a team, not just chase the ball.
      e.kind === "backpass" &&
        (this.pressTriggerUntil[t.team] = this.elapsed + 2.2),
      (n || a || h) &&
        this.event(
          "pass",
          n ? "CENTRO AL ÁREA" : a ? "PASE FILTRADO" : "Cambio de frente",
          `${t.name} → ${e.p.name}`,
          t.team,
          t,
        ));
  }
  clearBall(t) {
    t.spTaker = null;
    if (this.elapsed - this.lastClearEvent < 6) {
      this._clear(t);
      return;
    }
    (this._clear(t),
      this.event("clear", "DESPEJE", `${t.name} aleja el peligro`, t.team, t),
      (this.lastClearEvent = this.elapsed));
  }
  _clear(t) {
    const dir = this.direction(t.team),
      s = this.ball,
      tx = te(t.x + dir * this.range(24, 34), -50, 50),
      // v16 (pedido explícito, video del líbero — orden de prioridad al despejar: banda antes que
      // al medio, nunca ciego): antes salía a cualquier lado con la misma probabilidad, incluido
      // justo al medio del área rival donde puede quedar servida. Se sesga hacia la banda más
      // cercana al jugador (matar el peligro mandándola afuera) en vez de un ángulo puramente al
      // azar; qué tan bien ejecuta esa prioridad escala con la lectura del jugador, no es un
      // reemplazo total del azar (uno limitado sigue despejando bastante errático).
      tz = this.range(-27, 27),
      d0 = $i(tx - s.x, tz - s.z),
      // AI2: el despeje también se ejecuta con error contextual (presión/orientación); uno defectuoso
      // puede salir cruzado, corto o hacia un lado peligroso.
      ce = t.ai ? this.ai2ClearError(t, dir) : null,
      d = ce
        ? {
            x: d0.x * DM.cos(ce.ang) - d0.z * DM.sin(ce.ang),
            z: d0.x * DM.sin(ce.ang) + d0.z * DM.cos(ce.ang),
          }
        : d0,
      power = this.range(25, 32) * (ce && ce.bad ? 0.8 : 1);
    ((s.vx = d.x * power),
      (s.vz = d.z * power),
      (s.vy = te(this.range(8, 13), 6, 14)),
      (s.spin = this.range(-0.2, 0.2)));
    ((this.owner = null),
      (this.receiver = null),
      (this.lastTouch = t),
      (this.kickedAt = this.elapsed),
      (t.state = "Shoot"),
      (t.action = 0.55),
      (t.think = 0.7));
  }
  // Cooldown (seconds) per named skill — spec #6: "cada habilidad debe tener nivel, contexto, riesgo,
  // probabilidad de éxito y cooldown". Plain moves have none; flashy ones need real recovery time so
  // the same player can't machine-gun caños/sombreros.
  skillCooldown(key) {
    return (
      {
        dragBack: 3,
        sharpTouch: 3,
        autopase: 5,
        stepover: 6,
        ballRoll: 5,
        croqueta: 5,
        roulette: 9,
        elastico: 9,
        nutmeg: 12,
        sombrero: 12,
        heelToHeel: 16,
      }[key] || 0
    );
  }
  startDuel(t, defender) {
    const dir = this.direction(t.team),
      opps = this.players.filter((p) => p.team !== t.team && !p.sentOff),
      spaceUp = this.spaceAt(t.x, t.z + 3.2, opps),
      spaceDown = this.spaceAt(t.x, t.z - 3.2, opps),
      openSide = spaceUp > spaceDown ? 1 : -1;
    let moveZ = t.z !== defender.z ? DM.sign(t.z - defender.z) : openSide;
    if (this.random() < 0.35) moveZ = openSide;

    const distToDef = ze(t, defender),
      spaceBehindDef = this.spaceAt(
        t.x + dir * (distToDef + 2.4),
        defender.z,
        opps,
      ),
      nearbyDefenders = opps.filter((p) => ze(t, p) < 5).length,
      risk = this.riskProfile(t),
      skill = te((t.stats.dribbling - 55) / 45, 0, 1),
      level = te(
        DM.round(
          (t.stats.dribbling - 50) / 13 + (t.personality.creativity - 50) / 20,
        ),
        0,
        3,
      ),
      frontal =
        DM.abs(defender.z - t.z) < 2.6 && (defender.x - t.x) * dir > -0.5,
      defClosing =
        (t.x - defender.x) * -dir * defender.vx +
          (t.z - defender.z) * defender.vz >
          0 && DM.hypot(defender.vx, defender.vz) > 2,
      flairTrait = this.hasTrait(t, "Flair") || this.hasTrait(t, "Acrobat"),
      techTrait =
        this.hasTrait(t, "Technical Dribbler") ||
        this.hasTrait(t, "Quick Dribbler"),
      onCooldown = (key) =>
        this.elapsed - (t.skillCooldowns[key] ?? -99) < this.skillCooldown(key);

    // Base moves are always available; flashy skills only surface when the 1v1 is genuinely isolated,
    // matching "dos defensores cerca -> no intentar algo espectacular" / "espacio abierto -> no hace falta".
    const candidates = [
      {
        key: "change",
        label: "Cambio de dirección",
        weight: 3,
        success: 0.78,
        flashy: !1,
      },
      { key: "feint", label: "Amague", weight: 2.4, success: 0.74, flashy: !1 },
      { key: "sprint", label: "Sprint", weight: 2.2, success: 0.8, flashy: !1 },
      { key: "cut", label: "Recorte", weight: 1.8, success: 0.72, flashy: !1 },
    ];
    // Defensor conservador/protección: pisar hacia atrás para ganar tiempo bajo presión física.
    if (!onCooldown("dragBack") && t.stats.physical > 62)
      candidates.push({
        key: "dragBack",
        label: "Drag back",
        weight: 1.3 + (t.personality.composure - 50) * 0.01,
        success: 0.7 + skill * 0.1,
        flashy: !1,
      });
    // Defensor corriendo hacia el jugador: toque corto y cambio de ritmo lo deja pasar de largo.
    if (!onCooldown("sharpTouch") && defClosing)
      candidates.push({
        key: "sharpTouch",
        label: "Sharp Touch",
        weight: 2.2,
        success: 0.68 + skill * 0.18,
        flashy: !1,
      });
    if (nearbyDefenders <= 1) {
      candidates.push({
        key: "autopase",
        label: "Autopase",
        weight: (1.1 + risk) * (onCooldown("autopase") ? 0.15 : 1),
        success: 0.62 + skill * 0.15,
        flashy: !1,
      });
      if (!onCooldown("stepover"))
        candidates.push({
          key: "stepover",
          label: "Pisada",
          weight: 0.55 + risk * 1.1 + skill + (techTrait ? 0.3 : 0),
          success: 0.56 + skill * 0.22 + level * 0.03,
          flashy: !0,
        });
      if (!onCooldown("ballRoll"))
        candidates.push({
          key: "ballRoll",
          label: "Ball roll",
          weight: 0.5 + risk + skill * 0.9 + (techTrait ? 0.25 : 0),
          success: 0.55 + skill * 0.2 + level * 0.03,
          flashy: !0,
        });
      if (!onCooldown("croqueta"))
        candidates.push({
          key: "croqueta",
          label: "Croqueta",
          weight: 0.45 + risk + skill * 0.8,
          success: 0.54 + skill * 0.2 + level * 0.03,
          flashy: !0,
        });
      if (!onCooldown("roulette"))
        candidates.push({
          key: "roulette",
          label: "Ruleta",
          weight: 0.5 + risk * 1.4 + skill + (flairTrait ? 0.3 : 0),
          success: 0.5 + skill * 0.25 + level * 0.03,
          flashy: !0,
        });
      if (!onCooldown("elastico"))
        candidates.push({
          key: "elastico",
          label: "Elástico",
          weight: 0.4 + risk * 1.3 + skill + (flairTrait ? 0.3 : 0),
          success: 0.48 + skill * 0.25 + level * 0.03,
          flashy: !0,
        });
      if (
        level >= 2 &&
        !onCooldown("heelToHeel") &&
        flairTrait &&
        spaceBehindDef > 4
      )
        candidates.push({
          key: "heelToHeel",
          label: "Taquito",
          weight: 0.12 + risk * 0.8,
          success: 0.3 + skill * 0.2,
          flashy: !0,
        });
      if (
        !onCooldown("nutmeg") &&
        frontal &&
        distToDef > 1 &&
        distToDef < 3.6 &&
        spaceBehindDef > 3
      )
        candidates.push({
          key: "nutmeg",
          label: "Caño",
          weight: 1.3 + risk * 2 + skill * 1.3,
          success: te(
            0.4 + skill * 0.3 - defender.stats.defense * 0.0015,
            0.14,
            0.72,
          ),
          flashy: !0,
        });
      if (
        !onCooldown("sombrero") &&
        distToDef < 1.9 &&
        defender.personality.aggression > 58 &&
        spaceBehindDef > 3
      )
        candidates.push({
          key: "sombrero",
          label: "Sombrero",
          weight: 0.3 + risk * 1.4 + skill * 0.7,
          success: te(
            0.42 + skill * 0.28 - defender.stats.defense * 0.001,
            0.12,
            0.7,
          ),
          flashy: !0,
        });
    }
    const total = candidates.reduce((s, c) => s + DM.max(0.05, c.weight), 0);
    let roll = this.random() * total,
      chosen = candidates[0];
    for (const c of candidates) {
      roll -= DM.max(0.05, c.weight);
      if (roll <= 0) {
        chosen = c;
        break;
      }
    }
    if (this.skillCooldown(chosen.key))
      t.skillCooldowns[chosen.key] = this.elapsed;

    const successChance = te(
        chosen.success +
          (t.personality.composure - 55) * 0.0015 -
          (nearbyDefenders > 1 ? 0.12 : 0) +
          // Memoria (spec #15): un jugador que viene de ganar sus últimos duelos encara con algo
          // más de soltura; uno que viene golpeado, algo menos — efecto chico a propósito.
          ((t.memory ? t.memory.confidence : 50) - 50) * 0.0012 +
          // Fase 17: el cambio de ritmo pega si el defensor ya se comprometió (no puede rectificar); depende de
          // aceleración/regate propios vs los del rival — no de una etiqueta "regateador".
          this.p1DuelBonus(t, defender, chosen.key),
        0.1,
        0.95,
      ),
      win = this.random() < successChance;
    if (t.memory && defender.memory) {
      const dm = win ? 2.2 : -3,
        fm = win ? -1.6 : 1.4;
      ((t.memory.confidence = te(t.memory.confidence + dm, 15, 88)),
        (t.memory.recentDuelResults += win ? 1 : -1),
        win ? t.memory.recentSuccesses++ : t.memory.recentMistakes++,
        (t.memory.lastOpponent = defender.id),
        (defender.memory.confidence = te(
          defender.memory.confidence + fm,
          15,
          88,
        )),
        (defender.memory.recentDuelResults += win ? -1 : 1),
        (defender.memory.lastOpponent = t.id));
    }

    ((t.dribbleAt = this.elapsed),
      (t.moveZ =
        chosen.key === "cut" || chosen.key === "croqueta" ? -moveZ : moveZ),
      (t.burst =
        chosen.key === "sprint" ||
        chosen.key === "autopase" ||
        chosen.key === "nutmeg" ||
        chosen.key === "sharpTouch"
          ? 1.6
          : 0.9),
      (t.skillMove = chosen.key),
      (this.tlOnSkill && this.tlOnSkill(t, chosen.key)),
      (t.duelWith = defender.id),
      (t.state = "Dribble"),
      (t.action = 1),
      (t.think = 0.9));

    const reaction = te(
      0.2 +
        t.stats.dribbling * 0.0022 -
        defender.stats.defense * 0.0009 -
        (defender.stats.intelligence - 60) * 0.0008,
      0.08,
      0.55,
    );
    defender.timer = win
      ? reaction * (chosen.flashy ? 1.7 : 1.3)
      : DM.max(reaction * 0.5, 0.1);

    if (chosen.key === "autopase" || chosen.key === "nutmeg")
      ((this.ball.vx = dir * (chosen.key === "nutmeg" ? 8.5 : 10)),
        (this.ball.vz = moveZ * (chosen.key === "nutmeg" ? 2 : 4)));
    if (chosen.key === "sombrero" || (chosen.key === "heelToHeel" && win))
      ((this.ball.vx = dir * (chosen.key === "heelToHeel" ? 5 : 6.5)),
        (this.ball.vz = moveZ * 1.5),
        (this.ball.vy = chosen.key === "heelToHeel" ? 3 : 4.4));

    (this.stats[t.team].dribbles++,
      win
        ? this.stats[t.team].successfulDribbles++
        : this.stats[t.team].failedDribbles++,
      (this.ai2Count(t, win ? "successful_dribbles" : "failed_dribbles"),
      successChance < 0.3 && win && this.ai2Count(t, "lucky_actions")),
      (this.excitement = DM.min(
        100,
        this.excitement + (chosen.flashy ? 22 : 15),
      )));

    if (chosen.key === "nutmeg" && win)
      this.event(
        "dribble",
        "¡CAÑO!",
        `${t.name} deja a ${defender.name} en el piso`,
        t.team,
        t,
      );
    else if (chosen.key === "sombrero" && win)
      this.event(
        "dribble",
        "¡SOMBRERO!",
        `${t.name} se la pasa por arriba a ${defender.name}`,
        t.team,
        t,
      );
    else if (chosen.flashy && win)
      this.event(
        "dribble",
        `¡${chosen.label.toUpperCase()}!`,
        `${t.name} deja parado a ${defender.name}`,
        t.team,
        t,
      );
    // v13: los movimientos base (cambio de dirección, amague, sprint, recorte) ya NO generan un
    // evento por cada intento — antes cualquier 1v1, ganado o perdido, aparecía en "Desde la
    // cancha" y daba la sensación de que el equipo sólo encaraba solo todo el partido, cuando en
    // los números reales (stats.passes) se pasa bastante más de lo que se regatea.
  }
  isOffside(t, r) {
    if (r.role === "GK") return !1;
    const e = this.direction(t.team);
    if ((r.x - t.x) * e <= 1 || r.x * e < 2) return !1;
    const n = this.players
      .filter((s) => s.team !== t.team && !s.sentOff)
      .map((s) => s.x * e)
      .sort((s, a) => s - a);
    // BUG CRÍTICO CORREGIDO: n queda ordenado ascendente por x*e, y en ese eje el jugador MÁS
    // adelantado en su propio ataque tiene el valor más CHICO mientras que el que está más cerca
    // de defender su propio arco (el último hombre) tiene el valor más GRANDE — el arquero, al
    // fondo de todo, siempre termina último (n[n.length-1]), no primero. Antes se comparaba
    // contra n[1] (el segundo MÁS ADELANTADO del equipo que defiende, casi siempre un delantero
    // rival empujado arriba) en vez de n[n.length-2] (el segundo último defensor real) — por eso
    // la línea aparecía cerca de mitad de cancha en vez de pegada a la última línea defensiva.
    // Margen real de "beneficio de la duda" (spec #24): unos pocos centímetros, no varios metros.
    return n.length < 2 ? !1 : r.x * e > n[n.length - 2] + 0.3;
  }
  // Línea de fuera de juego (spec #24 + VAR): posición real (no *dir) del segundo último rival —
  // se usa tanto para decidir como para dibujar la línea en la repetición.
  offsideLineX(t) {
    const e = this.direction(t.team),
      n = this.players
        .filter((s) => s.team !== t.team && !s.sentOff)
        .map((s) => s.x * e)
        .sort((s, a) => s - a);
    return n.length < 2 ? null : n[n.length - 2] * e;
  }
  // Snapshot liviano de una posición del partido (mismos campos que usa el render/replay) — se
  // guarda en el instante del pase para poder mostrar, más tarde, el freeze-frame de ESE momento
  // exacto en la revisión VAR, aunque el offside recién se cobre unos instantes después.
  snapshotFrame() {
    return {
      at: this.elapsed,
      ball: { ...this.ball },
      players: this.players.map((p) => ({
        role: p.role,
        id: p.id,
        team: p.team,
        ragdoll: p.ragdoll ? { ...p.ragdoll } : null,
        timer: p.timer,
        sprinting: p.sprinting,
        skillMove: p.skillMove,
        moveZ: p.moveZ,
        sentOff: p.sentOff,
        x: p.x,
        z: p.z,
        vx: p.vx,
        vz: p.vz,
        angle: p.angle,
        state: p.state,
        action: p.action,
        burst: p.burst,
        dive: p.dive,
        diveDir: p.diveDir,
        diveKind: p.diveKind,
        diveDur: p.diveDur,
      })),
    };
  }
  // Se llama recién cuando el jugador adelantado (this.pendingOffside.offenderId) REALMENTE toca
  // el balón (ver possession()) — spec + Ley 11 FIFA: estar en posición adelantada no es en sí
  // una infracción, sólo lo es si termina participando de la jugada.
  resolvePendingOffside(offender) {
    const po = this.pendingOffside;
    this.pendingOffside = null;
    (this.stats[po.team].offside++,
      this.ai2CountTeam && this.aiTele && this.ai2CountTeam(po.team, "offside_events"),
      (this.owner = null),
      (this.receiver = null),
      this.event(
        "offside",
        "FUERA DE JUEGO",
        `${offender.name} estaba adelantado cuando ${po.passerName} tocó el balón`,
        po.team,
        offender,
        // pasX/pasZ: dónde estaba el que dio el pase; atkX/atkZ: dónde estaba el adelantado, AMBOS
        // en el instante exacto del pase (Ley 11) — frame: el estado completo de la cancha en ese
        // instante, para el freeze-frame orbital de la repetición (no un replay, un solo cuadro).
        {
          lineX: po.lineX,
          atkX: po.offAtPassX,
          atkZ: po.offAtPassZ,
          pasX: po.pasX,
          pasZ: po.pasZ,
          frame: po.frame,
        },
      ),
      this.restart(
        1 - po.team,
        te(offender.x, -49, 49),
        te(offender.z, -30, 30),
        "Tiro libre",
      ));
  }
  commitFoul(t, e) {
    const n = t.team,
      s = e.team,
      r = this.direction(n),
      a = -52.5 * r,
      o = DM.abs(e.x - a) < 16.5 && DM.abs(e.z) < 20.15;
    const c = this.players.filter(
        (h) =>
          h.team === n && h.id !== t.id && !h.sentOff && (e.x - h.x) * r > 0,
      ).length,
      l = !o && c === 0 && e.x * r < -18 && this.random() < 0.5;
    // Pedido explícito: bajar la frecuencia de tarjetas — antes casi cualquier falta promedio
    // (aggression media + algo de azar) ya cruzaba el umbral de amarilla, y las rojas salían con
    // demasiada facilidad. Se reduce el peso del azar/aggression y se suben los umbrales de abajo.
    let d =
      (t.personality.aggression - 40) / 150 +
      this.random() * 0.2 +
      (o ? 0.05 : 0) +
      (l ? 0.32 : 0);
    d = te(d, 0, 1.3);
    (this.stats[n].fouls++,
      (t.foulAt = this.elapsed),
      (this.owner = null),
      (this.receiver = null),
      (this.shot = null),
      (this.ball.vx = this.ball.vz = this.ball.vy = 0));
    // v9 Fase 1: la falta dispara contacto físico visible (ragdoll o tropiezo) en el instante del
    // contacto, en vez de sólo congelar la pelota — no todas las faltas se ven igual de fuertes.
    const impactSeverity = te(
      d * 0.6 +
        (DM.hypot(e.vx, e.vz) - DM.hypot(t.vx, t.vz)) * 0.05 +
        this.range(-0.1, 0.1),
      0,
      1,
    );
    // v9 Fase 4: una entrada muy fuerte tiene una pequeña chance de ser una lesión real — el
    // reinicio (tiro libre/penal) queda en espera hasta que el jugador termine de reponerse.
    const severeInjury = impactSeverity > 0.8 && this.random() < 0.12;
    impactSeverity > 0.38
      ? this.startRagdoll(
          e,
          impactSeverity,
          $i(e.x - t.x || 0.01, e.z - t.z || 0.01),
          severeInjury,
        )
      : ((e.state = "Stumble"), (e.timer = 0.45), (e.vx *= 0.4), (e.vz *= 0.4));
    ((t.state = "Foul"), (t.timer = impactSeverity > 0.38 ? 0.5 : 0.4));
    this.event("foul", "FALTA", `${t.name} comete falta sobre ${e.name}`, n, t);
    d > 1.05 || (l && d > 0.78)
      ? this.showCard(t, "red")
      : d > 0.62 && this.showCard(t, "yellow");
    severeInjury
      ? ((this.phase = "injury"),
        (this.injuryData = {
          playerId: e.id,
          isPenalty: o,
          attackTeam: s,
          defendTeam: n,
          x: te(e.x, -49, 49),
          z: te(e.z, -30, 30),
        }))
      : o
        ? this.awardPenalty(s, n)
        : this.restart(s, te(e.x, -49, 49), te(e.z, -30, 30), "Tiro libre", !0);
  }
  showCard(t, e) {
    if (e === "yellow") {
      if ((t.cards.yellow++, t.cards.yellow >= 2))
        return this.sendOff(t, "doble amarilla");
      (this.stats[t.team].yellow++,
        this.event(
          "card",
          "TARJETA AMARILLA",
          `${t.name} queda amonestado`,
          t.team,
          t,
        ));
    } else this.sendOff(t, "roja directa");
  }
  sendOff(t, e) {
    ((t.cards.red = !0),
      (t.sentOff = !0),
      this.stats[t.team].red++,
      this.event(
        "card",
        "TARJETA ROJA",
        `${t.name} es expulsado (${e})`,
        t.team,
        t,
      ));
  }
  awardPenalty(t, e, opt) {
    // opt.shootout: penal de una tanda (sin estadística ni aviso de "penal", el cobrador viene de la lista de la tanda,
    // todos los demás esperan en el círculo central y el disparo se demora opt.hold segundos).
    const so = !!(opt && opt.shootout);
    so || (this.stats[t].penalties++, this.event("penalty", "PENAL", "Se cobra la pena máxima", t));
    this.phase = "penalty";
    const n = this.direction(e);
    this.ball = { x: -40.15 * n, z: 0, y: 0.13, vx: 0, vz: 0, vy: 0, spin: 0 };
    // v9 Fase 2: PENALTY_KICK_SEQUENCE — se elige ya al cobrador y al arquero (en vez de al
    // final de la espera) para poder animar la caminata + carrera de aproximación.
    const taker = (so && opt.taker) || this.players
        .filter(
          (l) => l.team === t && l.role !== "GK" && !l.sentOff && !l.ragdoll,
        )
        .sort(
          (l, d) =>
            d.stats.shooting * 0.6 +
            d.personality.composure * 0.4 -
            (l.stats.shooting * 0.6 + l.personality.composure * 0.4),
        )[0],
      gk = this.players.find((l) => l.team === e && l.role === "GK");
    this.penaltyData = {
      attackTeam: t,
      defendTeam: e,
      takerId: taker ? taker.id : null,
      gkId: gk ? gk.id : null,
      stage: "approach",
      t: 0,
      // Pedido explícito: estaba con el signo invertido — el cobrador arrancaba la carrera DEL LADO
      // DEL ARCO respecto de la pelota (más cerca del arquero que la pelota misma) y terminaba
      // "runup" volviendo hacia el centro, es decir pateando de espaldas al arco (como de taco). El
      // punto de arranque tiene que quedar detrás de la pelota, del lado contrario al arco: el gol
      // que se ataca en el penal está en -52.5·n (ver arriba), la pelota en -40.15·n (entre medio),
      // así que "atrás" es sumar, no restar.
      backX: this.ball.x + n * 2.6,
      t0: this.elapsed,
      hold: so ? (opt.hold == null ? 10 : opt.hold) : 0,
      so,
    };
    // Pedido explícito: "si el arquero estaba en media cancha se patea ahí" — el arquero podía
    // haber subido como líbero (o estar donde sea) cuando se cobra el penal, y nada lo hacía
    // volver a su arco antes del disparo: el resto de la escena (la carrera del cobrador, el
    // "achicar" del arquero) terminaba pasando lejos del arco real. El reglamento exige que esté
    // parado en la línea, sobre el arco, así que se lo reubica ahí de una (como al balón, arriba),
    // no animado — para cuando arranca la secuencia ya está en su puesto, como en un partido real.
    // El arquero suele quedar en ragdoll justo antes del penal (la falta que lo originó), y como
    // advancePenalty() no vuelve a llamar updateRagdoll mientras dura la secuencia, se lo saca a
    // mano acá — si no, queda tirado en el piso durante toda la corrida y el remate.
    if (gk) { gk.x = -52.5 * n; gk.z = 0; gk.vx = gk.vz = 0; gk.angle = DM.atan2(n, 0); gk.ragdoll = null; gk.state = "Positioning"; }
    // Pedido explícito: en el penal (a diferencia del resto de los reinicios, que ya no se
    // congelan) sí tiene que verse a todos los demás jugadores retirándose fuera del área —
    // se les da un destino y advancePenalty() los va moviendo ahí con la física normal (no
    // es un teletransporte) mientras dura la carrera del cobrador.
    const gatherX = te(-52.5 * n + n * 25, -46, 46),
      bystanders = so ? [] : this.players.filter(
        (l) =>
          !l.sentOff &&
          !l.ragdoll &&
          l.role !== "GK" &&
          !(taker && l.id === taker.id),
      );
    // Tanda: los dos equipos (arquero del que patea incluido) forman dos filas a los lados de la línea de mitad de cancha.
    if (so) {
      const row = [0, 0];
      this.players.forEach((l) => {
        if (l.sentOff || l.ragdoll || (taker && l.id === taker.id) || (l.role === "GK" && l.team === e)) return;
        const k = row[l.team]++;
        l.penaltyRetreatTarget = { x: (l.team === 0 ? -1 : 1) * 1.7, z: te(-9.5 + k * 1.9, -19, 19) };
      });
    }
    bystanders.forEach((l, i) => {
      const side = i % 2 === 0 ? 1 : -1,
        row = DM.floor(i / 2);
      l.penaltyRetreatTarget = {
        x: te(gatherX + row * 1.6 * n, -49, 49),
        z: te(side * (5 + row * 3), -32, 32),
      };
    });
    !taker && (this.wait = 0);
  }
  advancePenalty(dt) {
    const pd = this.penaltyData,
      taker =
        pd.takerId != null
          ? this.players.find((p) => p.id === pd.takerId)
          : null,
      gk = pd.gkId != null ? this.players.find((p) => p.id === pd.gkId) : null;
    if (!taker || !gk || taker.sentOff || taker.ragdoll) {
      this.resolvePenalty();
      return;
    }
    for (const l of this.players)
      l.penaltyRetreatTarget &&
        !l.sentOff &&
        !l.ragdoll &&
        ((l.state = "Positioning"),
        this.move(
          l,
          l.penaltyRetreatTarget.x,
          l.penaltyRetreatTarget.z,
          dt,
          0.85,
        ));
    gk.state = "TrackBall";
    if (pd.stage === "approach") {
      pd.run = pd.run || {
        dur: pd.so ? te(DM.hypot(taker.x - pd.backX, taker.z) / 4.5, 1.5, 8) : te(DM.hypot(taker.x - pd.backX, taker.z) / 6, 0.8, 2.4),
      };
      const prog = this.advanceTo(taker, pd.backX, 0, dt, pd.run);
      taker.state = "Positioning";
      prog >= 1 &&
        ((pd.stage = "pause"), (pd.t = 0), (taker.vx = taker.vz = 0));
    } else if (pd.stage === "pause") {
      ((pd.t += dt),
        pd.t > 0.55 && this.elapsed - pd.t0 >= pd.hold && ((pd.stage = "runup"), (pd.run = { dur: 0.55 })));
    } else if (pd.stage === "runup") {
      const prog = this.advanceTo(taker, this.ball.x, this.ball.z, dt, pd.run);
      taker.state = "Sprint";
      prog >= 1 && ((taker.vx = taker.vz = 0), this.resolvePenalty());
    }
  }
  // v13: el penal ahora PATEA de verdad — antes saltaba directo al resultado (gol/atajada
  // decididos a mano, sin que la pelota se moviera). Ahora sólo apunta y patea con física real
  // (misma idea que shoot()) y devuelve el control al loop normal — el arquero reacciona con la
  // MISMA lógica de keeper()/updateBall() que ya usa para cualquier remate, así se ve la carrera
  // del arquero, la estirada, la atajada o el gol, en vez de un resultado contado.
  resolvePenalty() {
    const pd = this.penaltyData,
      { attackTeam: t, defendTeam: e } = pd,
      n =
        (pd.takerId != null && this.players.find((l) => l.id === pd.takerId)) ||
        this.players
          .filter((l) => l.team === t && l.role !== "GK" && !l.sentOff)
          .sort(
            (l, d) =>
              d.stats.shooting * 0.6 +
              d.personality.composure * 0.4 -
              (l.stats.shooting * 0.6 + l.personality.composure * 0.4),
          )[0],
      s =
        (pd.gkId != null && this.players.find((l) => l.id === pd.gkId)) ||
        this.players.find((l) => l.team === e && l.role === "GK");
    if (!n || !s) {
      this.phase = "playing";
      return;
    }
    const dirn = this.direction(t),
      goalX = 52.5 * dirn,
      quality = te(
        0.74 +
          (n.stats.shooting - 70) * 0.005 +
          (n.personality.composure - 60) * 0.003 -
          (n.personality.composure < 35 ? 0.12 : 0),
        0.28,
        0.94,
      ),
      onTarget = this.random() < quality,
      side = this.random() < 0.5 ? -1 : 1,
      targetZ = onTarget
        ? side * this.range(1.1, 3.3)
        : side * this.range(3.75, 6.3),
      targetY = onTarget ? this.range(0.25, 1.85) : this.range(0.3, 2.7),
      ball = this.ball,
      dx = goalX - ball.x,
      dz = targetZ - ball.z,
      dist = DM.max(1, DM.hypot(dx, dz)),
      speed = this.range(23, 29),
      dir = { x: dx / dist, z: dz / dist },
      flightTime = dist / speed;
    ((ball.vx = dir.x * speed),
      (ball.vz = dir.z * speed),
      (ball.vy = (targetY - ball.y + 0.5 * 9.81 * flightTime * flightTime) /
        DM.max(0.15, flightTime)),
      (ball.spin = this.range(-0.3, 0.3)),
      (n.state = "Shoot"),
      (n.action = 0.75),
      (n.think = 1),
      (this.owner = null),
      (this.receiver = null),
      (this.lastTouch = n),
      (this.kickedAt = this.elapsed),
      (this.shot = { team: t, player: n.id, at: this.elapsed, type: "Penal", onTarget }),
      this.stats[t].shots++,
      onTarget && this.stats[t].onTarget++,
      (this.stats[t].xg += 0.76),
      (this.excitement = DM.min(100, this.excitement + 42)),
      this.event(
        "shot",
        "PENAL",
        `${n.name} dispara desde los doce pasos`,
        t,
        n,
      ),
      // Vuelve al loop normal: updateBall()/keeper() se hacen cargo del vuelo, la estirada del
      // arquero y el resultado (gol, atajada, palo o afuera) con la misma física de cualquier tiro.
      (this.phase = "playing"));
  }
  // FASE F — CÓRNERS con roles por atributo (spec #10/#18): antes se ordenaba a los atacantes por
  // physical+shooting y se los repartía en un cajón fijo sin distinguir para qué sirve cada zona.
  // Ahora primer palo/segundo palo/punto penal (las tres posiciones más cerca del arco) se reparten
  // entre los mejores cabeceadores (aerialAbility derivada — spec #16), y el borde del área (zona de
  // rebote/segunda pelota) queda para quien mejor remata de lejos, no para "el que sobró".
  takeCorner(kicker, team, cx, cz) {
    const d = this.direction(team),
      gx = 52.5 * d,
      def = 1 - team,
      side = DM.sign(cz) || 1,
      pool = this.players.filter(
        (q) =>
          q.team === team &&
          q.role !== "GK" &&
          !q.sentOff &&
          q.id !== kicker.id,
      ),
      aerialSorted = [...pool].sort(
        (q, w) => this.aerialAbility(w) - this.aerialAbility(q),
      ),
      edgeCandidate = [...pool].sort(
        (q, w) =>
          w.stats.shooting +
          w.stats.intelligence -
          (q.stats.shooting + q.stats.intelligence),
      )[0],
      // Slots 0/1 = primer/segundo palo, 2 = punto penal, 3/4 = relleno de área, 5 = borde del
      // área (zona de rebote — spec #10 "rebound zone"/"second-ball zone").
      box = [
        [-5.5, -5],
        [-5.5, 5],
        [-10.5, 0],
        [-10.5, -8],
        [-10.5, 8],
        [-15, 2],
      ],
      roleLabels = [
        "NearPost",
        "FarPost",
        "PenaltySpot",
        "Edge",
        "Edge",
        "ReboundZone",
      ],
      used = new Set(edgeCandidate ? [edgeCandidate.id] : []),
      atk = [];
    for (const p of aerialSorted) {
      if (used.has(p.id)) continue;
      atk.push(p);
      used.add(p.id);
      if (atk.length >= 5) break;
    }
    edgeCandidate && atk.push(edgeCandidate);
    atk.slice(0, 6).forEach((q, i) => {
      const b = box[i] || [-13, 0];
      ((q.x = gx + b[0] * d),
        (q.z = b[1]),
        (q.vx = q.vz = 0),
        (q.state = "Positioning"),
        (q.tacticalRole = roleLabels[i] || "Area"));
    });
    const dfs = this.players.filter(
      (q) => q.team === def && q.role !== "GK" && !q.sentOff,
    );
    atk.slice(0, 6).forEach((q, i) => {
      const m = dfs[i];
      m &&
        ((m.x = q.x - d * 1.1),
        (m.z = q.z + (i % 2 ? 0.9 : -0.9)),
        (m.vx = m.vz = 0),
        (m.state = "Mark"));
    });
    // El objetivo del centro pesa hacia los mejores cabeceadores (primer/segundo palo/punto penal)
    // en vez de un sorteo parejo entre los cuatro primeros — pero sigue habiendo azar real para no
    // volverse un patrón leíble (spec: "evita comportamientos deterministas").
    const frontThree = atk.slice(0, 3).filter(Boolean),
      weights = frontThree.map((p) => 0.4 + this.aerialAbility(p) / 100),
      totalW = weights.reduce((a, w) => a + w, 0) || 1;
    let roll = this.random() * totalW,
      tgt = frontThree[0] || atk[0];
    for (let i = 0; i < frontThree.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        tgt = frontThree[i];
        break;
      }
    }
    if (!tgt) {
      (this.possession(kicker), (this.phase = "playing"));
      return;
    }
    const sh =
      this.random() < te(0.22 + (kicker.stats.passing - 70) * 0.006, 0.1, 0.45);
    if (sh) {
      const near =
        atk.find((q) => DM.abs(q.z - cz) < 14 && DM.abs(q.x - cx) < 16) ||
        tgt;
      (this.pass(
        kicker,
        {
          p: near,
          x: near.x,
          z: near.z,
          length: ze(kicker, near),
          loft: !1,
          progress: 2,
        },
        !1,
        !0,
      ),
        this.event(
          "restart",
          "CÓRNER EN CORTO",
          `${kicker.name} la juega corta`,
          team,
          kicker,
        ));
    } else {
      const acc = (100 - kicker.stats.passing) * 0.03,
        tx = tgt.x + this.range(-acc, acc),
        tz = tgt.z + this.range(-acc, acc),
        dst = DM.hypot(tx - cx, tz - cz),
        dir = $i(tx - cx, tz - cz),
        spd = te(dst * 0.72, 14, 24);
      ((this.ball.vx = dir.x * spd),
        (this.ball.vz = dir.z * spd),
        (this.ball.vy = te(dst * 0.28, 6, 10)),
        (this.ball.spin = -side * 0.5),
        (this.owner = null),
        (this.receiver = tgt),
        (this.lastTouch = kicker),
        (this.kickedAt = this.elapsed),
        this.stats[team].passes++,
        (kicker.state = "Cross"),
        (kicker.action = 0.6),
        (tgt.target = { x: tx, z: tz }),
        (tgt.state = "ReceiveBall"),
        (this.excitement = DM.min(100, this.excitement + 34)),
        this.event(
          "restart",
          "CENTRO AL ÁREA",
          `${kicker.name} busca la cabeza de ${tgt.name}`,
          team,
          kicker,
        ));
    }
    this.phase = "playing";
  }
  checkSubs() {
    if (this.elapsed - this.lastSubCheck < 6) return;
    this.lastSubCheck = this.elapsed;
    for (let t = 0; t < 2; t++) {
      if (this.subsUsed[t] >= this.maxSubs || !this.bench[t].length) continue;
      const e = this.players.filter(
          (o) => o.team === t && !o.sentOff && o.role !== "GK",
        ),
        n = this.score[t] - this.score[1 - t],
        s = this.time / 60;
      let r = null,
        a = "cansancio";
      // Dial de sustituciones en vivo (spec #1): "aggressive" espera más (guarda cambios para más
      // tarde/otro motivo), "conservative" saca a un cansado antes.
      const subDial = this.liveTactics ? this.liveTactics[t].active.substitutionPolicy : 0,
        staminaThreshold = te(58 - subDial * 6, 44, 68);
      const o = e.slice().sort((c, l) => c.stamina - l.stamina)[0];
      if (o && o.stamina < staminaThreshold && s > 55) r = o;
      else if (s > 62 && n < 0) {
        const c = e
          .filter((l) => l.role !== "FWD")
          .sort((l, d) => l.stats.shooting - d.stats.shooting)[0];
        c &&
          this.bench[t].some((l) => l.role === "FWD") &&
          ((r = c), (a = "cambio ofensivo"));
      } else if (s > 70 && n > 0) {
        const c = e
          .filter((l) => l.role === "FWD")
          .sort((l, d) => l.stats.defense - d.stats.defense)[0];
        c &&
          this.bench[t].some((l) => l.role === "DEF") &&
          ((r = c), (a = "cambio defensivo"));
      } else {
        const c = e.find(
          (l) =>
            l.cards.yellow >= 1 &&
            l.personality.aggression > 72 &&
            l.stamina < 74 &&
            s > 55,
        );
        c && ((r = c), (a = "riesgo de expulsión"));
      }
      if (!r && s > 75 && this.subsUsed[t] === 0) {
        const c = e.slice().sort((l, d) => l.stamina - d.stamina)[0];
        c && c.stamina < 70 && (r = c);
      }
      if (!r) continue;
      let c = this.bench[t].findIndex(
        (l) =>
          l.role ===
          (a === "cambio ofensivo"
            ? "FWD"
            : a === "cambio defensivo"
              ? "DEF"
              : r.role),
      );
      if (
        (c < 0 && (c = this.bench[t].findIndex((l) => l.role !== "GK")), c < 0)
      )
        continue;
      const l = this.bench[t].splice(c, 1)[0],
        d = r.name;
      ((r.name = l.name),
        (r.number = l.number),
        (r.stats = { ...l.stats }),
        (r.personality = { ...l.personality }),
        (r.style = l.style),
        (r.traits = l.traits),
        (r.heightM = l.heightM),
        (r.scale = l.scale),
        (r.stamina = 100),
        (r.cards = { yellow: 0, red: !1 }),
        (r.subbedIn = !0),
        (r.memory = {
          confidence: 50,
          recentMistakes: 0,
          recentSuccesses: 0,
          recentDuelResults: 0,
          lastOpponent: null,
          lastPassTarget: null,
          pressureMemory: 0,
          recentFatigue: 0,
        }),
        this.subsUsed[t]++,
        this.event("sub", "CAMBIO", `${l.name} entra por ${d} (${a})`, t, r));
    }
  }
  urgency(t) {
    const e = this.score[t] - this.score[1 - t],
      n = this.time / 60,
      s = this.players.filter((o) => o.team === t && !o.sentOff).length,
      r = this.players.filter((o) => o.team !== t && !o.sentOff).length,
      a = te((n - 55) / 35, 0, 1);
    let c = 0;
    return (
      e < 0 && (c += a * (e <= -2 ? 7 : 5.5)),
      e > 0 && (c -= a * (e >= 2 ? 3 : 4.5)),
      e === 0 && n > 82 && (c += a * 2.5),
      (c += (s - r) * 2.2),
      te(c, -6, 8)
    );
  }
  momentum(t) {
    const e = this.stats[t],
      n = this.stats[1 - t],
      s = e.shots - n.shots,
      r = e.xg - n.xg;
    return te(
      s * 0.02 + r * 0.12 + (this.score[t] - this.score[1 - t]) * 0.05,
      -0.4,
      0.4,
    );
  }
  shoot(t, e = !1, n = !1, volley = !1, meta = null) {
    t.spTaker = null;
    const s = this.ball,
      r = this.direction(t.team),
      a = 52.7 * r,
      o = DM.hypot(a - s.x, s.z),
      c = this.players[(1 - t.team) * 11];
    const opps = this.players.filter((p) => p.team !== t.team && !p.sentOff),
      pressure = te(1 - this.spaceAt(t.x, t.z, opps) / 5, 0, 1);
    const trivela =
      !e &&
      !volley &&
      this.hasTrait(t, "Trivela") &&
      o < 24 &&
      this.random() < 0.16;
    let l = e
      ? "Cabeceo"
      : volley
        ? "Volea"
        : trivela
          ? "Trivela"
          : n
            ? "Primera intención"
            : o > 26
              ? "Tiro lejano"
              : this.random() < 0.38
                ? "Tiro colocado"
                : "Tiro potente";
    !e &&
      !volley &&
      !trivela &&
      DM.abs(c.x) < 47 &&
      o < 27 &&
      this.random() < 0.38 &&
      (l = "Vaselina");
    // v15 (pedido explícito): hasta ahora todo remate que no fuera vaselina terminaba con una
    // parábola alta — el "tiro raso" es una variante explícita de baja altura (ver `u` más abajo),
    // más difícil de leer para el arquero porque llega rápido y pegado al piso.
    !e &&
      !volley &&
      !trivela &&
      l !== "Vaselina" &&
      o < 24 &&
      this.random() < 0.34 &&
      (l = "Tiro raso");
    // AI2 (spec #22): el TIPO de remate ya es una decisión previa (ai2ShotType); acá sólo se ejecuta.
    meta && meta.shotType && !e && !volley && !n && (l = meta.shotType);
    // PLAN DE REMATE (ver ai2ShotPlan): destino, potencia, efecto y altura según arquero, defensores, distancia y puntería.
    const plan = t.ai && !e && !volley ? this.ai2ShotPlan(t, o, pressure, { prior: meta && meta.shotType, trivela }) : null;
    if (plan) l = plan.name;
    // AI2: calidad de ejecución contextual (dificultad real del remate), separada de la decisión.
    const ai2q = t.ai
      ? this.ai2ExecShot(t, l, o, e, n, volley, meta)
      : null;
    const traitAcc =
        (this.hasTrait(t, "Power Shot") && l === "Tiro potente" ? 0.05 : 0) +
        (this.hasTrait(t, "Finesse Shot") &&
        (l === "Tiro colocado" || l === "Tiro raso")
          ? 0.06
          : 0) +
        (this.hasTrait(t, "Long Shot") && l === "Tiro lejano" ? 0.06 : 0) +
        (e && this.hasTrait(t, "Aerial Threat") ? 0.09 : 0),
      volleyPenalty = volley ? 0.1 : 0,
      trivelaPenalty = trivela ? 0.12 : 0,
      d = ai2q ? te(0.2 + 0.8 * ai2q.pOn * (plan ? te(plan.geo / 0.85, 0.6, 1.05) : 1), 0.14, 0.95) : te(
        0.76 +
          (t.stats.shooting - 75) * 0.004 -
          o * 0.006 -
          (100 - (t.stamina ?? 100)) * 0.0006 -
          pressure * 0.1 -
          (t.personality.composure < 40 ? pressure * 0.08 : 0) +
          traitAcc -
          volleyPenalty -
          trivelaPenalty,
        0.22,
        0.88,
      ),
      h = this.random() < d,
      p = c.z > 0.3 ? -1 : c.z < -0.3 ? 1 : this.random() < 0.5 ? -1 : 1,
      f = plan
        ? h
          ? te(plan.zt + (this.random() + this.random() + this.random() - 1.5) * plan.sig * 0.3, -3.35, 3.35)
          : (DM.sign(plan.zt) || p) * this.range(3.7, 6.4)
        : l === "Tiro raso"
          ? p * this.range(h ? 0.8 : 3.7, h ? 2.6 : 6.4)
          : h
            ? p * this.range(1.1, 3.3)
            : p * this.range(3.7, 6.4),
      g = $i(a - s.x, f - s.z),
      v =
        (ai2q && h ? ai2q.weak : 1) *
        (plan
          ? plan.v
          : e
          ? this.range(16, 22)
          : volley
            ? this.range(24, 32)
            : l === "Tiro colocado"
              ? this.range(23, 29)
              : l === "Tiro raso"
                ? this.range(24, 30)
                : l === "Vaselina"
                  ? this.range(16, 21)
                  : this.range(29, 36)),
      // Salvavidas: un despeje de cabeza cerca del propio arco también pasa por acá, y `o` (distancia
      // al arco RIVAL, siempre lejano en ese caso) puede terminar siendo casi todo el largo de la
      // cancha — el término 0.5·g·m² de más abajo crece con el CUADRADO de m y mandaba el cabezazo a
      // 25+ m/s hacia arriba (pedido explícito: apareció al revisar un "vuelo absurdo" del balón).
      // Con un tiempo de vuelo tope realista (ida de punta a punta del área grande, de sobra para
      // cualquier despeje/remate real) la parábola se queda dentro de lo jugable.
      m = te(o / v, 0.15, 3),
      u = plan
        ? h
          ? te(plan.ht + (this.random() + this.random() - 1) * plan.sig * 0.2, 0.15, 2.25)
          : this.range(0.5, 3.2)
        : l === "Tiro raso"
          ? h
            ? this.range(0.05, 0.35)
            : this.range(0.05, 0.9)
          : h
            ? this.range(0.25, 1.95)
            : this.range(0.5, 3.2);
    // con plan, la velocidad inicial se RESUELVE simulando la pelota real (gravedad, roce, efecto) para que pase por el punto elegido
    const sol = plan ? this.ai2ShotSolve(s, r, f, u, v, plan.spin, null) : null;
    ((s.vx = sol ? sol.vx : g.x * v),
      (s.vz = sol ? sol.vz : g.z * v),
      (s.vy =
        sol
          ? sol.vy
          : l === "Vaselina"
            ? 7.2
            : (u - s.y + 0.5 * 9.81 * m * m) / DM.max(0.15, m)),
      (s.spin =
        plan
          ? plan.spin
          : l === "Tiro colocado"
            ? -p * 0.65
            : trivela
              ? p * 0.9
              : this.range(-0.08, 0.08)),
      e
        ? ((s.y = DM.max(s.y, 1.65)), (t.state = "Head"))
        : (t.state = "Shoot"),
      (t.action = 0.75),
      (t.think = 1),
      (this.owner = null),
      (this.receiver = null),
      (this.lastTouch = t),
      (this.kickedAt = this.elapsed),
      (this.shot = {
        team: t.team,
        player: t.id,
        at: this.elapsed,
        type: l,
        onTarget: h,
      }),
      this.stats[t.team].shots++,
      (this.stats[t.team].shotsByZone[
        t.z < -8.83 ? "left" : t.z > 8.83 ? "right" : "center"
      ]++),
      h && this.stats[t.team].onTarget++,
      (this.stats[t.team].xg += this.ai2ShotXg(t, s, a, o, e, pressure, c, ai2q)),
      (this.excitement = DM.min(100, this.excitement + 42)),
      this.event(
        "shot",
        l.toUpperCase(),
        `${t.name} busca el arco`,
        t.team,
        t,
      ));
    t.ai && ai2q && this.ai2ShotRecord(t, l, o, h, ai2q, meta);
    // SHOT_INTERCEPTION_POINT (spec #21): un defensor que YA está parado sobre la línea de tiro
    // (no uno que recién viene corriendo desde lejos) puede llegar a taparlo antes de que salga
    // limpio — se calcula geométricamente proyectando su posición sobre la trayectoria real del
    // disparo, en vez de dejarlo sólo a la colisión genérica por proximidad de updateBall().
    const shotDist = DM.hypot(a - s.x, f - s.z);
    let blocker = null,
      blockProj = 1 / 0;
    for (const p of this.players) {
      if (p.team === t.team || p.role === "GK" || p.sentOff) continue;
      const proj = (p.x - s.x) * g.x + (p.z - s.z) * g.z;
      if (proj < 0.8 || proj > shotDist - 0.3) continue;
      const px = s.x + g.x * proj,
        pz = s.z + g.z * proj,
        perp = DM.hypot(p.x - px, p.z - pz),
        reach = 1.05 + p.stats.defense * 0.0025;
      if (perp > reach) continue;
      const ballETA = proj / v,
        defETA = DM.max(0, perp - reach * 0.4) / (3.2 + p.stats.speed * 0.03);
      defETA <= ballETA + 0.1 &&
        proj < blockProj &&
        ((blocker = p), (blockProj = proj));
    }
    if (blocker) {
      const bdir = this.direction(blocker.team);
      ((s.vx = bdir * this.range(3, 7)),
        (s.vz = this.range(-6, 6)),
        (s.vy = this.range(0.6, 2.4)),
        (s.spin = 0),
        (this.shot = null),
        (this.lastTouch = blocker),
        (this.kickedAt = this.elapsed),
        (this.secondBallUntil = this.elapsed + 1.6),
        (blocker.state = "Block"),
        (blocker.action = 0.5),
        this.event(
          "block",
          "¡BLOQUEO!",
          `${blocker.name} se interpone en el disparo de ${t.name}`,
          blocker.team,
          blocker,
        ));
    }
    this.tlOnShot && this.tlOnShot(t, l, e, volley, trivela, o);
  }
  decide(t) {
    if (
      this.owner !== t ||
      this.elapsed - t.controlAt <
        (t.ai && t.ai.oneTouch ? 0.1 : 0.42)
    )
      return;
    const dir = this.direction(t.team),
      distGoal = 52.5 - t.x * dir,
      wideness = DM.abs(t.z),
      opps = this.players.filter(
        (p) => p.team !== t.team && p.role !== "GK" && !p.sentOff,
      );
    let nearest = opps[0],
      nd = 999;
    for (const p of opps) {
      const dd = ze(t, p);
      if (dd < nd) ((nd = dd), (nearest = p));
    }
    const pressure = te(1 - nd / 8, 0, 1),
      spaceAhead = this.spaceAt(t.x + 6 * dir, t.z, opps),
      passOpt = this.p1QuickPassOption(t),
      id = this.teamTactics(t.team),
      surrounded = opps.filter((p) => ze(t, p) < 5).length >= 3,
      risk = this.riskProfile(t),
      currentDanger = this.dangerAt(t.x, t.z, t.team),
      clearSight =
        pressure < 0.35 &&
        (!nearest ||
          DM.abs(nearest.z - t.z) > 1.3 ||
          (nearest.x - t.x) * dir < 0),
      // Body orientation (#44): facing the near goal makes shooting/carrying natural; receiving/turning
      // with your back to it favors laying it off instead. facing in [-1,1], 1 = square on to the goal.
      facing = DM.cos(t.angle - (dir > 0 ? DM.PI / 2 : -DM.PI / 2)),
      opp = this.opportunityScore(t.team),
      // FASE A/B — el intento colectivo (spec #2/#5) inclina la elección individual sin
      // reemplazarla: un equipo que acaba de recuperar y elige "resetear posesión" prioriza el
      // pase seguro un rato; uno que busca contraataque o juego directo favorece progresar ya.
      consolidating = this.consolidateUntil[t.team] > this.elapsed,
      wantsCounter =
        id.transitionPriority === "counterattack" ||
        id.transitionPriority === "fast_progression",
      // Memoria (spec #15): efecto sutil — confianza alta anima un poco más el remate/regate,
      // fatiga acumulada (más allá de la stamina instantánea) empuja a decisiones más simples y
      // conservadoras, presión reciente hace preferir soltarla antes que forzarla de nuevo.
      memConf = t.memory ? (t.memory.confidence - 50) / 50 : 0,
      memFatigue = t.memory ? t.memory.recentFatigue : 0,
      memPressure = t.memory ? te(t.memory.pressureMemory / 60, 0, 1) : 0;

    // 1) SHOOT — inside the box with a clear-ish sight of goal this should dominate almost every other option.
    const canShoot = distGoal < 30 && wideness < 22;
    let shotScore = -2;
    if (canShoot) {
      const inBox = distGoal < 16.5 && wideness < 20.15,
        farRange = distGoal > 22,
        traitBonus =
          (this.hasTrait(t, "Power Shot") || this.hasTrait(t, "Long Shot")
            ? 0.12
            : 0) +
          (this.hasTrait(t, "Finesse Shot") && inBox ? 0.1 : 0) +
          (farRange && this.hasTrait(t, "Long Shot") ? 0.1 : 0);
      // v15 (pedido explícito): con arco libre pero lejos del área, si el rival más cercano no
      // tiene chance real de alcanzarlo y hay espacio por delante, conviene seguir corriendo para
      // tirar más cerca en vez de forzar el remate de lejos apenas "nadie lo apura".
      // v16 (pedido explícito, video de táctica): "willBeCaught" comparaba velocidades nominales,
      // no si el rival LLEGA a tiempo de verdad — se reemplaza por el mismo modelo de tiempo de
      // cierre que ya usa la defensa (p1TimeToContact) para decidir si de verdad conviene seguir.
      const closeInfo = nearest ? this.p1TimeToContact(nearest, t) : null,
        timeToCatch = closeInfo ? closeInfo.t : 4,
        willBeCaught = !!nearest && (nd < 4 || timeToCatch < 0.9),
        keepRunningInstead =
          farRange && !willBeCaught && spaceAhead > 6 && distGoal > 18;
      shotScore =
        (inBox ? 0.78 : 0.22 + (t.stats.shooting - 75) * 0.009) +
        currentDanger * 0.3 +
        (t.personality.creativity - 50) * 0.0016 +
        this.momentum(t.team) * 0.12 -
        pressure * 0.12 -
        (t.stamina < 55 ? 0.06 : 0) +
        id.shotEager +
        risk * 0.08 +
        traitBonus +
        (facing < 0 ? -0.15 : 0) +
        opp * 0.08 +
        (consolidating ? -0.12 : 0) +
        (wantsCounter ? 0.06 : 0) +
        memConf * 0.06 -
        memFatigue * 0.08 +
        id.shotRisk * 0.09;
      if (t.personality.composure < 40 && pressure > 0.5) shotScore -= 0.1;
      if ((!passOpt || nd > 3) && !keepRunningInstead) shotScore += 0.1;
      if (distGoal < 20 && wideness < 14 && clearSight) shotScore += 0.35;
      // v16: la fuerza con la que se resiste el remate lejano evitable escala con qué tan bien lee
      // el jugador que "seguir corriendo" es lo que corresponde (cog.riskAssessment) — uno de buena
      // lectura casi no tira de lejos pudiendo achicar más; uno limitado todavía lo hace bastante.
      if (keepRunningInstead) shotScore -= 0.18 + 0.24 * t.ai.cog.riskAssessment;
      // v16 (pedido explícito, "rematar siempre a una sola intención dentro del área, sin dudar"):
      // con buena visión de arco y dentro del área, un delantero de buena decisión no se
      // recontrapiensa el remate — el bonus escala con decisionQuality, no es un empujón fijo.
      if (inBox && clearSight && t.role === "FWD") shotScore += 0.15 * t.ai.cog.decisionQuality;
    }

    // 2) DRIBBLE — favors risk-takers and technical players when there is room to actually use it.
    const canDuel =
      nd < 4.6 && nd > 1.05 && this.elapsed - t.dribbleAt > 1.5 && !surrounded;
    const dribbleTrait =
      (this.hasTrait(t, "Quick Dribbler") ||
      this.hasTrait(t, "Technical Dribbler")
        ? 0.1
        : 0) + (this.hasTrait(t, "Flair") ? 0.06 : 0);
    let dribbleScore = canDuel
      ? 0.35 +
        (t.stats.dribbling - 45) / 100 +
        risk * 0.3 +
        (spaceAhead > 6 ? 0.16 : 0) -
        pressure * 0.04 +
        currentDanger * 0.08 +
        dribbleTrait +
        (consolidating ? -0.18 : 0) +
        (id.riskTolerance - 0.5) * 0.3 +
        memConf * 0.08 -
        memPressure * 0.1
      : -2;
    // Fase 16/17 ("esperar" como acción real): dentro de la ventana de duelo, nd cerca del borde
    // lejano (4.6) es un defensor que TODAVÍA no se comprometió del todo — encararlo ahí es
    // prematuro. Un jugador de buena lectura de riesgo lo nota y prefiere seguir llevándola un
    // instante más (vía el candidato "hold", más abajo) en vez de encarar ya; uno de peor lectura
    // entra al duelo apenas el rival cae en rango, sin esperar a que se comprometa.
    // Fase 17: el defensor "se compromete" cuando cierra rápido y ya está cerca — recién ahí el regate tiene sentido para quien
    // sabe esperar; el que no lee al rival lo encara antes (riskAssessment ya pesa abajo).
    const commit = canDuel && nearest ? this.p1DefenderCommit(t, nearest, nd) : 0,
      premature = canDuel ? ai2Sat((nd - 2.6) / 2) * (1 - 0.75 * commit) : 0;
    if (canDuel) dribbleScore -= premature * t.ai.cog.riskAssessment * 0.22;

    let clearScore = -2;
    if (t.role === "DEF" && t.x * dir < -30 && pressure > 0.5)
      clearScore = 0.5 + pressure * 0.3;

    // 4) HOLD/PROTECT — shielding-lite: physical players under real pressure with no space just shield the ball.
    let holdScore =
      0.12 +
      (spaceAhead > 8 ? 0.18 : 0) -
      pressure * 0.2 +
      (pressure > 0.55 && t.stats.physical > 70 ? 0.1 : 0) +
      premature * (0.5 * t.ai.cog.riskAssessment + 0.5 * t.ai.patience) * 0.16;

    // AI2 (spec #2): racionalidad limitada. El scoring de arriba se CONSERVA como una de las entradas;
    // ahora se generan candidatos (con percepción imperfecta), se filtra lo absurdo, se conserva TOP-K
    // y se elige con softmax/temperatura dependiente del jugador y del contexto. AI2 es la única
    // autoridad de decisión con balón: el camino legado (scoring simple + jitter, sin candidatos ni
    // temperatura) se eliminó — todo jugador real tiene `.ai` (ai2InitPlayer se corre para todos en
    // ai2Reset), así que nunca se ejecutaba.
    const perc = this.ai2Perceive(t),
      ctx = {
        dir, distGoal, wideness, nearest, nd, pressure, spaceAhead, id, risk, currentDanger, facing, opp,
        consolidating, wantsCounter, memConf, memFatigue, memPressure, canShoot, shotScore, canDuel,
        dribbleScore, clearScore, holdScore, perc, pressure2: perc.pressure,
        oneTouch: !!t.ai.oneTouch, setpieceCross: (t.setpieceCrossBias || 0) > this.elapsed, passCands: null,
      };
    t.ai.oneTouch = false;
    ctx.passCands = this.ai2PassCandidates(t, ctx);
    ctx.bestPassRisk = ctx.passCands.length ? ctx.passCands[0].interceptRisk : 1;
    // v16: se guarda para que ai2CoordAttack (que corre aparte, a ~3Hz, sin este ctx) sepa si el
    // poseedor está realmente aislado sin recalcular PassPlan — evita duplicar el costo.
    t.ai.lastPassCandCount = ctx.passCands.length;
    t.ai.lastPassCandAt = this.elapsed;
    const sel = this.ai2Select(t, ctx);
    this.ai2Execute(t, sel, ctx);
  }
  // ================= FASE E — DISTRIBUCIÓN DEL ARQUERO (spec #13) =================
  // Antes el arquero, apenas tenía la pelota (saque de arco o tras una atajada), pasaba por el
  // mismo decide() que un jugador de campo — nunca "elegía" realmente cómo construir. Ahora es su
  // propia decisión: salida corta al mejor central libre, pase intermedio a un lateral, pelota
  // larga al delantero/canal cuando conviene, achique bajo presión, o reinicio rápido si hay un
  // contragolpe armado. Usa teamTactics() (buildUpStyle/riskTolerance/directness) así que la
  // mentalidad y la fase del partido realmente cambian cómo saca el equipo, no sólo cómo defiende.
  goalKeeperDecide(t) {
    // CONTROLAR EL RITMO (spec #13): ganando y sobre el final, el arquero no tiene apuro — tarda
    // un poco más en decidir (dentro de lo que el reglamento tolera) antes de sacarla. No es una
    // mecánica nueva de pelota quieta, sólo estira el propio think-gate de esta decisión.
    const timeWastingDial = this.teamTactics(t.team).timeWasting > 0.5,
      winningLate =
        timeWastingDial ||
        (this.time / 60 > 78 && this.score[t.team] > this.score[1 - t.team]);
    if (
      this.owner !== t ||
      this.elapsed < (t.gkHoldUntil || 0) ||
      this.elapsed - t.controlAt < (winningLate ? 1.4 : 0.5)
    )
      return;
    const dir = this.direction(t.team),
      tt = this.teamTactics(t.team),
      opps = this.players.filter((p) => p.team !== t.team && !p.sentOff),
      pressure = te(1 - this.spaceAt(t.x, t.z, opps) / 12, 0, 1),
      mates = this.players.filter(
        (p) => p.team === t.team && p.id !== t.id && !p.sentOff,
      );
    // Reinicio rápido (#13/#5): si el equipo ya decidió ir al contraataque al recuperar, no tiene
    // sentido perder tiempo con una salida corta y segura — buscar directo al hombre más adelantado
    // libre antes de que el rival recomponga la línea.
    if (this.transitionAttackMode[t.team] === "counterattack") {
      const runner = mates
        .filter((p) => p.role !== "GK" && (p.x - t.x) * dir > 5)
        .sort((a, b) => this.spaceAt(b.x, b.z, opps) - this.spaceAt(a.x, a.z, opps))[0];
      if (runner && this.spaceAt(runner.x, runner.z, opps) > 8) {
        this.pass(
          t,
          {
            p: runner,
            x: te(runner.x + runner.vx * 0.6, -49, 49),
            z: te(runner.z + runner.vz * 0.6, -31, 31),
            length: ze(t, runner),
            loft: !0,
            progress: (runner.x - t.x) * dir,
            kind: "progressive",
          },
          !1,
        );
        return;
      }
    }
    // Bajo presión real (delantero encima) no arriesga la salida jugada — despeja.
    if (pressure > 0.62 && t.stats.defense < 85) {
      this.clearBall(t);
      return;
    }
    const shortOpt = mates
        .filter(
          (p) =>
            (p.role === "DEF" || p.role === "MID") &&
            ze(t, p) < 30 &&
            this.spaceAt(p.x, p.z, opps) > 4.5,
        )
        .map((p) => ({
          p,
          score:
            this.spaceAt(p.x, p.z, opps) * 1.4 -
            ze(t, p) * 0.05 +
            (p.role === "DEF" ? 0.6 : 0) +
            this.chem(t, p) * 0.5,
        }))
        .sort((a, b) => b.score - a.score)[0],
      target = mates
        .filter((p) => p.role === "FWD" || p.role === "MID")
        .sort((a, b) => b.x * dir - a.x * dir)[0],
      longSpace = target ? this.spaceAt(target.x, target.z, opps) : 0,
      wantsLong =
        !winningLate &&
        (tt.buildUpStyle === "direct" ||
          (tt.directness > 1.15 && longSpace > 7) ||
          (!shortOpt && longSpace > 5));
    if (wantsLong && target) {
      this.pass(
        t,
        {
          p: target,
          x: te(target.x + target.vx * 0.5, -49, 49),
          z: te(target.z + target.vz * 0.5, -31, 31),
          length: ze(t, target),
          loft: !0,
          progress: (target.x - t.x) * dir,
          kind: "progressive",
        },
        !1,
      );
      return;
    }
    if (shortOpt) {
      this.pass(
        t,
        {
          p: shortOpt.p,
          x: shortOpt.p.x,
          z: shortOpt.p.z,
          length: ze(t, shortOpt.p),
          loft: ze(t, shortOpt.p) > 20,
          progress: (shortOpt.p.x - t.x) * dir,
          kind: "safe",
        },
        !1,
      );
      return;
    }
    this.clearBall(t);
  }
  // v9 Fase 2: movimiento guionado (no depende de atributos) usado para las caminatas/carreras de
  // presentación — cobrador yendo a buscar la pelota, barrera formándose, etc. `run` guarda
  // {from, t, dur} y se crea perezosamente la primera vez que se llama con un `run` nuevo.
  advanceTo(p, toX, toZ, dt, run) {
    run.from || (run.from = { x: p.x, z: p.z });
    run.t = DM.min(run.dur, (run.t || 0) + dt);
    const prog = run.t / run.dur,
      ease = prog * prog * (3 - 2 * prog),
      nx = run.from.x + (toX - run.from.x) * ease,
      nz = run.from.z + (toZ - run.from.z) * ease;
    ((p.vx = dt > 0 ? (nx - p.x) / dt : 0),
      (p.vz = dt > 0 ? (nz - p.z) / dt : 0));
    DM.hypot(p.vx, p.vz) > 0.05 && (p.angle = DM.atan2(p.vx, p.vz));
    return ((p.x = nx), (p.z = nz), prog);
  }
  move(t, e, n, s, r = 1) {
    t.timer > 0 && (r *= 0.35);
    // AI2: reacción tardía tras perder la pelota / error de lectura — arranca más lento un instante
    t.ai && t.ai.slowUntil > this.elapsed && (r *= 0.62);
    // Fase 1 (auditoría de movimiento, bench/audit_movement.mjs): las velocidades máximas ya eran plausibles
    // (24-29 km/h a ritmo de carrera, hasta ~36 sprintando) pero la CURVA no: 90% de vmax en 0.4 s (real ≈ 2-3 s),
    // giros y frenadas instantáneos. Se reemplaza el filtro exponencial por dinámica con límites de aceleración
    // (misma que usa p1ETA para predecir llegadas): a = a0·(1−v/vmax) hacia adelante, aBrake al frenar, aLat al girar.
    const P = this.p1Phys(t),
      st = t.stamina ?? 100,
      fat = 0.8 + (0.2 * st) / 100;
    ((r *= fat), t.sprinting && st > 40 && (r *= 1.24));
    const a = e - t.x,
      o = n - t.z,
      c = DM.hypot(a, o),
      l = $i(a, o);
    // Retroceder mirando al frente / desplazarse "de costado" tipo cangrejo (pedido explícito): un
    // jugador con t.faceAt (marcando de cerca / cubriendo un tiro / el arquero achicando) no gira la
    // espalda para ir hacia su destino — sigue mirando ahí (ver más abajo) — pero como en la realidad
    // no corre igual de rápido de espaldas o de costado que de frente, así que la velocidad máxima se
    // recorta según qué tan "hacia atrás" respecto de esa mirada es el movimiento.
    let faceSlow = 1;
    if (t.faceAt) {
      const fx = t.faceAt.x - t.x, fz = t.faceAt.z - t.z, fl = DM.hypot(fx, fz);
      if (fl > 0.15) {
        const fwd = (l.x * fx + l.z * fz) / fl; // 1 de frente .. -1 yendo de espaldas a la mirada
        faceSlow = fwd > 0.3 ? 1 : fwd > -0.35 ? 0.8 : 0.62;
      }
    }
    const d = (4.4 + t.stats.speed * 0.037) * r * faceSlow,
      // velocidad objetivo: nunca más de la que permite frenar antes de llegar (curva de frenada real)
      h = DM.min(d, DM.sqrt(2 * P.aBrake * 0.9 * c));
    const sp0 = DM.hypot(t.vx, t.vz),
      ux = sp0 > 0.25 ? t.vx / sp0 : l.x,
      uz = sp0 > 0.25 ? t.vz / sp0 : l.z,
      dvx = l.x * h - t.vx,
      dvz = l.z * h - t.vz;
    let along = dvx * ux + dvz * uz;
    const px = dvx - along * ux,
      pz = dvz - along * uz,
      perp = DM.hypot(px, pz),
      capA = (along > 0 ? DM.max(0.9, P.a0 * (1 - sp0 / (P.vsp * 1.02))) : P.aBrake) * s,
      capP = P.aLat * s;
    along = along > capA ? capA : along < -capA ? -capA : along;
    const kp = perp > capP ? capP / perp : 1;
    ((t.vx += ux * along + px * kp),
      (t.vz += uz * along + pz * kp),
      (t.x = te(t.x + t.vx * s, -52, 52)),
      (t.z = te(t.z + t.vz * s, -33.5, 33.5)));
    if (t.faceAt) {
      const fx = t.faceAt.x - t.x, fz = t.faceAt.z - t.z;
      DM.hypot(fx, fz) > 0.2 && (t.angle = DM.atan2(fx, fz));
    } else {
      DM.hypot(t.vx, t.vz) > 0.3 && (t.angle = DM.atan2(t.vx, t.vz));
    }
    t.speedTier = this.speedTier(DM.hypot(t.vx, t.vz));
  }
  speedTier(mps) {
    return mps < 0.6
      ? "STANDING"
      : mps < 2
        ? "WALK"
        : mps < 4.2
          ? "JOG"
          : mps < 6.5
            ? "RUN"
            : mps < 8.6
              ? "SPRINT"
              : "BURST";
  }
  // v9 Fase 1: active ragdoll híbrido. No es un motor de físicas — es una máquina de 4 fases
  // (impact → falling → down → recovering) que toma el control de vx/vz/state por un lapso corto
  // y siempre devuelve al jugador a animación/IA normal al final (nunca queda "muerto" en el piso).
  startRagdoll(p, severity = 0.5, dir = null, injury = false) {
    severity = te(severity, 0, 1);
    const downDur = injury
      ? this.range(4, 7.5)
      : te(0.4 + severity * 0.9, 0.4, 1.3);
    p.ragdoll = {
      phase: "impact",
      t: 0,
      severity,
      dir: dir || $i(p.vx || this.range(-1, 1), p.vz || this.range(-1, 1)),
      downDur,
      injury,
    };
    ((p.state = "Ragdoll_impact"),
      (p.timer = 0),
      (p.think = 0),
      (p.sprinting = !1));
    p.action = p.burst = p.dive = 0;
    p.vx = p.vx * 0.35 + p.ragdoll.dir.x * (1.2 + severity * 3);
    p.vz = p.vz * 0.35 + p.ragdoll.dir.z * (1.2 + severity * 3);
    // v9 Fase 4: LESIÓN VISIBLE — reusa el mismo ragdoll, sólo que queda mucho más tiempo en el
    // piso y el árbitro/cámara se quedan con él (ver fase "injury" en step()).
    injury &&
      this.event(
        "injury",
        "LESIÓN",
        `${p.name} queda en el piso pidiendo atención médica`,
        p.team,
        p,
      );
  }
  updateRagdoll(p, dt) {
    const r = p.ragdoll;
    r.t += dt;
    if (r.phase === "impact")
      ((p.vx *= DM.exp(-7 * dt)),
        (p.vz *= DM.exp(-7 * dt)),
        r.t > 0.12 && ((r.phase = "falling"), (r.t = 0)));
    else if (r.phase === "falling")
      ((p.vx *= DM.exp(-5 * dt)),
        (p.vz *= DM.exp(-5 * dt)),
        r.t > te(0.22 + r.severity * 0.16, 0.22, 0.4) &&
          ((r.phase = "down"), (r.t = 0)));
    else if (r.phase === "down") {
      p.vx = p.vz = 0;
      if (r.t > r.downDur) ((r.phase = "recovering"), (r.t = 0));
    } else if (r.phase === "recovering" && r.t > 0.85) {
      ((p.ragdoll = null), (p.state = "Positioning"), (p.think = 0));
      r.injury && this.random() < 0.35 && this.forceInjurySub(p);
      return;
    }
    p.state = "Ragdoll_" + r.phase;
  }
  // v9 Fase 4: si la lesión es seria, ~35% de las veces el jugador no puede seguir — sale
  // reemplazado (si hay cambios disponibles) o sigue en cancha a las patadas si no los hay.
  forceInjurySub(p) {
    const t = p.team;
    if (this.subsUsed[t] >= this.maxSubs || !this.bench[t].length) {
      this.event(
        "injury",
        "SIGUE EN CANCHA",
        `${p.name} continúa en el partido pese al golpe`,
        t,
        p,
      );
      return;
    }
    let c = this.bench[t].findIndex((l) => l.role === p.role);
    c < 0 && (c = this.bench[t].findIndex((l) => l.role !== "GK"));
    if (c < 0) {
      this.event(
        "injury",
        "SIGUE EN CANCHA",
        `${p.name} continúa en el partido pese al golpe`,
        t,
        p,
      );
      return;
    }
    const l = this.bench[t].splice(c, 1)[0],
      d = p.name;
    ((p.name = l.name),
      (p.number = l.number),
      (p.stats = { ...l.stats }),
      (p.personality = { ...l.personality }),
      (p.style = l.style),
      (p.traits = l.traits),
      (p.heightM = l.heightM),
      (p.scale = l.scale),
      (p.stamina = 100),
      (p.cards = { yellow: 0, red: !1 }),
      (p.subbedIn = !0),
      (p.memory = {
        confidence: 50,
        recentMistakes: 0,
        recentSuccesses: 0,
        recentDuelResults: 0,
        lastOpponent: null,
        lastPassTarget: null,
        pressureMemory: 0,
        recentFatigue: 0,
      }),
      this.subsUsed[t]++,
      this.event(
        "sub",
        "CAMBIO OBLIGADO",
        `${l.name} entra por ${d} (lesión)`,
        t,
        p,
      ));
  }
  // Fase 3: el arquero (keeper, posición, salidas, atajadas, contacto) vive en el bloque P1/P3 (p1/p3.js). Único responsable.
  // ================= FASE C — CLASIFICACIÓN DE BALÓN SUELTO (spec #6) =================
  // ball_to_player: claramente va a un receptor concreto y nadie rival llega antes.
  // ball_to_space: nadie la tiene todavía pero el equipo que la busca llega primero.
  // dangerous_ball: independientemente de quién llegue, cae en zona de peligro real.
  // uncontestable_ball: ninguno de los dos equipos la puede disputar en lo inmediato (rueda sola).
  classifyBall() {
    const e = this.ball;
    if (this.owner) return { type: "controlled", forTeam: this.owner.team };
    const forTeam = this.receiver
        ? this.receiver.team
        : this.lastTouch
          ? this.lastTouch.team
          : 0,
      eta = (p) =>
        DM.hypot(p.x - e.x, p.z - e.z) /
        (4.2 + p.stats.speed * 0.035 + p.stats.acceleration * 0.015),
      mine = this.players.filter(
        (p) => p.team === forTeam && !p.sentOff && p.role !== "GK",
      ),
      theirs = this.players.filter(
        (p) => p.team !== forTeam && !p.sentOff && p.role !== "GK",
      ),
      myETA = mine.length ? DM.min(...mine.map(eta)) : 99,
      oppETA = theirs.length ? DM.min(...theirs.map(eta)) : 99,
      danger = this.dangerAt(e.x + e.vx * 0.4, e.z + e.vz * 0.4, forTeam);
    let type;
    if (danger > 0.55) type = "dangerous_ball";
    else if (myETA > 2.2 && oppETA > 2.2) type = "uncontestable_ball";
    else if (this.receiver && myETA < oppETA - 0.25) type = "ball_to_player";
    else type = "ball_to_space";
    return { type, forTeam, myETA, oppETA };
  }
  assignMarks(pt) {
    const prevM = this.marks || {};
    this.marks = {};
    const df = 1 - pt,
      d = this.direction(df),
      dfs = this.players.filter(
        (q) => q.team === df && q.role !== "GK" && !q.sentOff && !q.tlmSubbing,
      ),
      atk = this.players
        .filter((q) => q.team === pt && q.role !== "GK" && !q.sentOff && !q.tlmSubbing)
        .sort((q, w) => q.x * d - w.x * d),
      tk = new Set();
    for (const a of atk) {
      let b = null,
        bd = 1 / 0;
      for (const q of dfs)
        tk.has(q.id) || ze(q, a) >= bd || ((bd = ze(q, a)), (b = q));
      // Marca pegajosa (pedido explícito): el defensor que ya lo venía marcando lo sigue marcando salvo que otro
      // esté claramente más cerca — si no, dos defensores se cambian el hombre y uno queda solo.
      const pv = dfs.find((q) => prevM[q.id] === a.id && !tk.has(q.id));
      if (pv && b && pv !== b && ze(pv, a) < bd + 4) ((b = pv), (bd = ze(pv, a)));
      b && (tk.add(b.id), (this.marks[b.id] = a.id));
    }
    // Double marking (#26): against a genuinely dangerous attacker, the second-closest defender leans
    // in to cover rather than both defenders simply chasing the ball elsewhere.
    let worst = null,
      worstDanger = -1;
    for (const a of atk) {
      const dv =
        this.dangerAt(a.x, a.z, pt) + (a.stats ? a.stats.dribbling * 0.003 : 0);
      if (dv > worstDanger) ((worstDanger = dv), (worst = a));
    }
    // Dial de marca en vivo (spec #5/#16): "man" baja el umbral para comprometer una segunda marca
    // (más agresivo saliendo del sistema); "zonal" lo sube (prioriza no descuadrarse).
    const markingDial = this.teamTactics(df).marking,
      doubleMarkThreshold = te(0.55 - markingDial * 0.12, 0.3, 0.75);
    if (worst && worstDanger > doubleMarkThreshold) {
      const covering = dfs
        .filter((q) => this.marks[q.id] !== worst.id)
        .sort((q, w) => ze(q, worst) - ze(w, worst))[0];
      this.doubleMark = covering
        ? { target: worst.id, coverer: covering.id }
        : null;
    } else this.doubleMark = null;
  }
  updatePlayers(t) {
    var r, a, o, c;
    const e = this.ball,
      n =
        ((r = this.owner) == null ? void 0 : r.team) ??
        ((a = this.lastTouch) == null ? void 0 : a.team) ??
        0;
    (!this.marks || this.elapsed - (this._marksAt ?? -9) > 0.3) &&
      (this.assignMarks(n), (this._marksAt = this.elapsed));
    const s = [0, 1].map((l) =>
      this.players
        .filter((d) => d.team === l && d.role !== "GK" && !d.sentOff)
        .sort((d, h) => ze(d, e) - ze(h, e))
        .map((d) => d.id),
    );
    // FASE C — lectura del balón (spec #6): una sola clasificación por tick (no por jugador) de
    // qué tan "jugable" es el balón suelto ahora mismo — a quién va, si va a espacio, si es
    // peligroso más allá de quién llegue primero, o si en realidad nadie lo va a disputar todavía.
    this.ballThreat = this.classifyBall();
    // AI2: mapa de control (~12 Hz), cerebro de equipo y coordinadores (~3 Hz) — todo cacheado.
    this.ai2Tick(t);
    this.tacPrep();
    for (const l of this.players) {
      l.tacticalRole = null;
      // Retroceder/desplazarse de costado mirando al frente (pedido explícito): por defecto no hay
      // punto fijo que mirar (el jugador encara hacia donde corre, como antes); las ramas de marca/
      // cobertura de tiro más abajo lo fijan al rival/pelota que están vigilando.
      l.faceAt = null;
      // Reloj de seguridad de la estirada: t.dive sólo bajaba dentro de p3GkAct (keeper()), y ese camino se salta cuando el arquero
      // tiene la pelota (atajó en el aire), está congelado/bloqueado o en ragdoll → quedaba clavado en la pose, en el aire.
      if (l.role === "GK" && l.dive > 0) {
        l.diveAge = (l.diveAge || 0) + t;
        if (l.diveAge > (l.diveDur || 0.7) + 0.08) { l.dive = 0; l.gkAct = null; l.diveKind = null; if (l.state === "Dive") l.state = "Positioning"; }
      }
      if (
        ((l.action = DM.max(0, l.action - t)),
        (l.timer = DM.max(0, l.timer - t)),
        (l.burst = DM.max(0, l.burst - t)),
        (l.think -= t),
        l.stamina === void 0 && (l.stamina = 100),
        !l.sentOff)
      ) {
        const act = DM.hypot(l.vx, l.vz),
          rec = act < 1.5 ? 0.085 : 0;
        l.stamina = te(
          l.stamina -
            (0.033 +
              act * 0.017 +
              (l.sprinting ? 0.22 : 0) -
              (l.stats.physical - 70) * 0.0011 -
              rec) *
              t,
          20,
          100,
        );
        // FASE E — memoria temporal (spec #15): decae sola hacia neutro cada tick — nunca queda
        // "pegada" en un extremo por el resto del partido, sólo influye mientras el efecto está
        // fresco (confianza tras un buen/mal momento, presión reciente, fatiga acumulada).
        if (l.memory) {
          const m = l.memory;
          ((m.confidence += (50 - m.confidence) * 0.02 * t),
            (m.recentMistakes *= DM.exp(-0.15 * t)),
            (m.recentSuccesses *= DM.exp(-0.15 * t)),
            (m.recentDuelResults *= DM.exp(-0.1 * t)),
            (m.pressureMemory *= DM.exp(-0.2 * t)),
            (m.recentFatigue +=
              ((100 - l.stamina) / 100 - m.recentFatigue) * 0.05 * t));
        }
      }
      if (l.ragdoll) {
        (this.updateRagdoll(l, t),
          (l.x = te(l.x + l.vx * t, -52, 52)),
          (l.z = te(l.z + l.vz * t, -33.5, 33.5)));
        continue;
      }
      if (l.sentOff) {
        ((l.x = 52 * this.direction(l.team) * -1.02),
          (l.z = -33),
          (l.vx = l.vz = 0));
        continue;
      }
      // Cambio en curso (pedido explícito): mientras el saliente camina afuera / el entrante
      // camina hacia su puesto (tlmSubTick los mueve a mano), no reciben IA/movimiento normal
      // acá — así el resto del equipo sigue jugando en vez de que se congele todo el partido.
      if (l.tlmSubbing) continue;
      if (l.tlFrozen > this.elapsed) continue;
      if (l.tlLock > this.elapsed) { this.tlLockMove(l, t); continue; }
      if (l.role === "GK") {
        this.keeper(l, t);
        continue;
      }
      if (l.p3Move && l.p3Move.until > this.elapsed && this.owner !== l) { l.tacticalRole = l.p3Move.role || "SET_PIECE"; l.sprinting = false; this.move(l, l.p3Move.x, l.p3Move.z, t, l.p3Move.r); continue; }
      const d = this.direction(l.team),
        h = l.team === n,
        p = this.formationSlot(l.team, l.index),
        id = this.teamTactics(l.team);
      const counter =
        h &&
        this.counterUntil[l.team] > this.elapsed &&
        (l.role === "FWD" || l.role === "MID");
      if (this.owner === l) {
        // Decision speed (#34/#43): sharper, more aware players read the game and act sooner;
        // creative players can linger a touch longer chasing a better option.
        if (
          (l.think <= 0 &&
            ((l.think = te(
              this.range(0.45, 0.85) -
                (l.stats.intelligence - 70) * 0.004 +
                (l.personality.creativity > 72 ? this.range(0, 0.12) : 0),
              0.2,
              1.05,
            )),
            this.decide(l)),
          this.owner !== l)
        )
          continue;
        const u = 52.5 - l.x * d < 26 ? l.z * 0.65 : l.z * 0.9;
        let y = 0,
          minD = 99;
        for (const b of this.players)
          if (b.team !== l.team && b.role !== "GK") {
            const S = ze(l, b);
            S < minD && (minD = S);
            S < 6 &&
              (b.x - l.x) * d > 0 &&
              (y += (l.z >= b.z ? 1 : -1) * (6 - S) * 1.2);
          }
        // Fase 1: el poseedor conduce a ritmo de conducción y sólo sprinta cuando el cerebro lo pide (carry/burst).
        const carrySprint = l.burst > 0 || l.state === "Sprint",
          // WAIT (Fase 17): un jugador que decidió sostener frente a un defensor cercano baja el ritmo para no
          // comprometerse antes que el rival — el duelo lo gana quien espera y cambia de ritmo después.
          waiting = !carrySprint && l.lastDecision === "hold" && minD < 4.6 && this.elapsed - l.controlAt < 2.5;
        l.sprinting = carrySprint;
        if (l.spTaker && l.spTaker.until > this.elapsed) { l.sprinting = false; this.move(l, l.x, l.z, t, 0.3); continue; } // pelota parada: no conduce
        this.move(
          l,
          l.x + 8 * d,
          u + y + (l.burst > 0 ? l.moveZ * 7 : 0),
          t,
          l.burst > 0 ? 1 : carrySprint ? 0.92 : waiting ? 0.45 : 0.62,
        );
        continue;
      }
      let f,
        g,
        v = 1;
      const rk = s[l.team].indexOf(l.id),
        car = this.owner,
        // Press trigger (#39) + counterpress (#40): a mistake by the team on the ball, or having
        // just lost it themselves seconds ago, pulls an extra player into the scramble for it —
        // instead of always exactly the two nearest chasing, a genuine team-wide squeeze can kick in.
        pressTriggerActive = this.pressTriggerUntil[n] > this.elapsed,
        // FASE B: la decisión de contrapresión ahora la toma decideTransitions() una sola vez al
        // perder la pelota (spec #5) en vez de este umbral fijo por jugador/frame — se mantiene el
        // umbral de pressing como red de seguridad para equipos muy intensos fuera de esa ventana.
        transMode = this.transitionMode[l.team],
        inTransitionDefense =
          !h && transMode && transMode.until > this.elapsed,
        counterpressing =
          !h &&
          ((inTransitionDefense && transMode.mode === "counterpress") ||
            (this.elapsed - (this.lostBallAt[l.team] ?? -9) < 2.2 &&
              (id.press >= 0.96 ||
                (id.manager && id.manager.active.counterPress > 0.4)))),
        retreating = inTransitionDefense && transMode.mode === "immediate_retreat",
        // Second balls (#24): right after a block/save/post, it's a genuine scramble for everyone
        // nearby, not a clean handover — widen the chase on both sides briefly.
        secondBall = this.secondBallUntil > this.elapsed,
        // Lectura del balón (spec #6): un balón "incontestable" (rodando solo, nadie llega en lo
        // inmediato) no necesita mandar un tercer/cuarto jugador a perseguirlo; uno claramente
        // peligroso sí amerita esa urgencia extra aunque no haya contrapresión activa.
        ballThreatType = this.ballThreat && this.ballThreat.type,
        chaseRank =
          2 +
          (pressTriggerActive ? 1 : 0) +
          (counterpressing ? 1 : 0) +
          (secondBall ? 1 : 0) +
          (!h && ballThreatType === "dangerous_ball" ? 1 : 0) -
          (retreating ? 1 : 0) -
          (ballThreatType === "uncontestable_ball" ? 1 : 0),
        chaseCapP = this.tacP(l.team, "chaseCap"),
        chaseMax = chaseCapP ? DM.min(chaseRank, chaseCapP.n + (secondBall ? 1 : 0)) : chaseRank;
      // Fase 1: el receptor persigue el punto de la trayectoria VIVA del balón (BallPlan único) donde llega con ventaja;
      // si la pelota ya es inalcanzable para él deja de correr tras un imposible y vuelve a su rol.
      const rcv = this.receiver === l && !this.owner ? this.p1ReceiveTarget(l) : null;
      if (((l.sprinting = !1), rcv))
        ((f = rcv.x),
          (g = rcv.z),
          this.tlAerialTarget && this.tlAerialTarget(l) && ((f = this._tlA.x), (g = this._tlA.z)),
          (l.state = "ReceiveBall"),
          (l.tacticalRole = "RECEIVE"),
          (l.aiChase = this.elapsed),
          (l.p1 || (l.p1 = {})),
          (l.p1.recv = rcv));
      else if (!this.owner && this.phase === "playing" && rk < chaseMax)
        ((f = e.x + e.vx * 0.24),
          (g = e.z + e.vz * 0.24),
          this.tlAerialTarget && this.tlAerialTarget(l) && ((f = this._tlA.x), (g = this._tlA.z)),
          (l.state = h ? "ChaseBall" : "Press"),
          (l.tacticalRole = h ? "CHASE" : "PRESS"),
          (l.aiChase = this.elapsed),
          (l.sprinting = ze(l, e) > 3.5));
      else if (!h) {
        const gx = -52.5 * d,
          dg = DM.hypot(e.x - gx, e.z),
          pressDist = 4.5 * id.press;
        if (car && rk === 0) {
          const tg = 0.5 + (l.personality.aggression - 50) * 0.005;
          if (retreating) {
            ((f = car.x + car.vx * 0.3 - d * tg),
              (g = car.z + car.vz * 0.3),
              (l.state = "Press"),
              (l.tacticalRole = "CONTAIN"),
              (l.sprinting = !1),
              (v = 0.85 * id.press),
              (l.faceAt = { x: car.x, z: car.z }));
          } else {
            const df = this.p1DefendCarrier(l, car, { press: id.press });
            // Fase (pedido explícito): SHOT_BLOCK (plantarse en la línea de tiro) no es lo mismo que
            // PRESS (encimar al que lleva la pelota) — contarlo como PRESS inflaba el conteo de
            // "jugadores presionando a la vez" con defensores que en realidad sólo tapan el ángulo de
            // tiro, sin perseguir al poseedor. SHOT_BLOCK ya es un tacticalRole propio en el resto del
            // motor (ver p1DefendCarrier / case SHOT_BLOCK más abajo); acá faltaba distinguirlo.
            ((f = df.x), (g = df.z), (l.state = "Press"), (l.tacticalRole = df.mode === "CONTAIN" ? "CONTAIN" : df.mode === "SHOT_BLOCK" ? "SHOT_BLOCK" : "PRESS"), (l.sprinting = df.sprint), (v = df.v));
            // CONTAIN/SHOT_BLOCK (pedido explícito): el defensor que cierra/tapa un tiro retrocede o se
            // desplaza de costado sin dejar de mirar al portador — si gira para "caminar de frente" a su
            // destino pierde de vista el amague y lo regatean.
            if (l.tacticalRole === "CONTAIN" || l.tacticalRole === "SHOT_BLOCK") l.faceAt = { x: car.x, z: car.z };
          }
        } else if (car && rk === 1)
          // COVER / SCREEN_PASS (spec #4): un mediocentro que cubre en vez de marcar hombre suele
          // estar cerrando la línea de pase central antes que "acompañando" al presionador.
          ((f = car.x - d * 6),
            (g = car.z * 0.62 + (l.z >= car.z ? 1.8 : -1.8)),
            (l.state = "Cover"),
            (l.tacticalRole = l.role === "MID" ? "SCREEN_PASS" : "COVER"),
            (l.sprinting = DM.hypot(f - l.x, g - l.z) > 8),
            (v = 1.02));
        else if (car && dg < 20 && rk === 2) {
          const k = te(0.34 + (l.stats.intelligence - 70) * 0.004, 0.22, 0.46);
          ((f = gx + (e.x - gx) * (1 - k)),
            (g = e.z * (1 - k) * 0.9),
            (l.state = "Block"),
            (l.tacticalRole = "BALANCE"),
            (l.sprinting = DM.hypot(f - l.x, g - l.z) > 7),
            (v = 1.02));
        } else {
          const mid = this.marks ? this.marks[l.id] : null,
            mk = mid != null && l.role === "DEF" ? this.players[mid] : null;
          if (mk && !mk.sentOff) {
            const ant = te(
                (l.stats.intelligence + l.personality.consistency) / 2,
                40,
                95,
              ),
              // Dial de marca en vivo: "man" acorta la distancia de anticipación (marca más pegada
              // y personal); "zonal" la alarga (prioriza el espacio, no al hombre).
              gs = te(3.4 + (95 - ant) * 0.04 - id.marking * 1.1, 0.7, 6.2),
              // TRACK_RUN vs MARK (spec #4): si el marcado está corriendo fuerte hacia el espacio
              // en vez de simplemente parado/orientándose, es una carrera a seguir, no un marcaje
              // estático.
              markerRunning = DM.hypot(mk.vx, mk.vz) > 4.2,
              // Fase (pedido explícito): antes, incluso corriendo una ruptura, el punto final se
              // mezclaba mitad y mitad con la línea del equipo — el defensor "comprometía" hacia la
              // altura del bloque en vez de perseguir de verdad, y el delantero se iba solo. Ante una
              // carrera real se pega mucho más cerca (gsEff) y sigue casi todo el peso al rival, no
              // a la línea (trackW).
              gsEff = markerRunning ? gs * 0.5 : gs,
              trackW = markerRunning ? 0.9 : 0.55;
            ((f = mk.x + mk.vx * 0.3 - d * gsEff), (g = mk.z + mk.vz * 0.3));
            const u = te(e.x * d * 0.52 + 2, -23, 22) * id.line;
            ((f = f * trackW + (p[0] + u) * d * (1 - trackW)),
              (g = g * (markerRunning ? 0.88 : 0.6) + (p[1] * d + e.z * 0.14) * (markerRunning ? 0.12 : 0.4)),
              (l.state = "Mark"),
              (l.tacticalRole = markerRunning ? "TRACK_RUN" : "MARK"),
              (l.sprinting = markerRunning || DM.hypot(f - l.x, g - l.z) > 11),
              // Marca de cerca (pedido explícito): sigue mirando al rival que marca en vez de darle la
              // espalda al retroceder/acompañar de costado — si no, lo regatea apenas gira a caminar.
              (l.faceAt = { x: mk.x, z: mk.z }));
            // Double mark (#26): the nominated coverer drifts toward the half-space around the
            // team's most dangerous attacker instead of only tracking their own assignment.
            if (this.doubleMark && this.doubleMark.coverer === l.id) {
              const danger = this.players.find(
                (q) => q.id === this.doubleMark.target,
              );
              danger &&
                ((f = f * 0.6 + danger.x * 0.4),
                (g = g * 0.6 + danger.z * 0.4),
                (l.state = "Cover"),
                (l.tacticalRole = "COVER"));
            }
          } else {
            // PROTECT_SPACE / HOLD_LINE (spec #4): sin marca directa asignada, un mediocentro se
            // ubica cubriendo el espacio delante de la línea; un defensor mantiene la altura de la
            // línea junto a sus compañeros — ninguno de los dos simplemente "va hacia la pelota".
            const u = te(e.x * d * 0.52 + 2, -23, 22) * id.line;
            ((f = (p[0] + u) * d),
              (g =
                p[1] * d * id.defensiveWidth * id.compactness + e.z * 0.16),
              (l.state = "Defend"),
              (l.tacticalRole = l.role === "MID" ? "PROTECT_SPACE" : "HOLD_LINE"));
          }
          v = 0.98;
        }
        if (retreating) f -= 3.5 * d;
        const y = this.teams[l.team].mentality;
        (y === "defensive" && (f -= 4 * d),
          y === "attacking" && (f += 1.5 * d),
          (f += this.urgency(l.team) * 0.5 * d),
          (f = te(f, -50, 50)),
          (g = te(g, -31, 31)));
      } else {
        const m = e.x * d,
          u = te(m * 0.57 + 19, -5, 39) * id.width;
        // Misma línea de verdad que ai2DefAnchor/la rama de defensa de arriba (id.line - 1) * 11:
        // el ancla base con balón también debe correr con el dial de línea defensiva del manager,
        // si no la defensa de descanso (REST_DEFENSE) y el resto del bloque quedan a una altura que
        // no responde a "línea alta/baja" mientras el equipo ataca, sólo mientras defiende.
        ((f = (p[0] + u + (id.line - 1) * 11) * d), (g = p[1] * d * id.width + e.z * 0.16));
        let overlapState = null;
        if (l.role === "FWD") {
          const oppD = this.players.filter(
            (q) => q.team !== l.team && q.role !== "GK" && !q.sentOff,
          );
          const spaceBehind = this.spaceAt(
            te(e.x * d + 16, 4, 49) * d,
            p[1] * d * 0.8,
            oppD,
          );
          // Player style (#30) + instrucción de rol en vivo (spec #10, "STRIKER: target/complete/
          // press/false9/run_behind") — la instrucción en vivo pisa el style de fábrica si el DT
          // la fijó explícitamente para ESTE jugador, misma idea que ya hace el lateral de arriba.
          const roleInstr = this.playerRoles && this.playerRoles[l.id],
            effectiveRole = roleInstr || l.style,
            styleShift =
              effectiveRole === "False 9" || effectiveRole === "false9"
                ? -8
                : effectiveRole === "Target Man" || effectiveRole === "target"
                  ? 4
                  : effectiveRole === "Poacher"
                    ? -3
                    : effectiveRole === "run_behind"
                      ? 6
                      : 0,
            runBoost =
              counter || effectiveRole === "run_behind"
                ? 10
                : spaceBehind > 9
                  ? 5
                  : 0;
          ((f = te(e.x * d + 12 + runBoost + styleShift, 0, 48) * d),
            (g = p[1] * d * (effectiveRole === "Poacher" ? 0.45 : 0.8) + e.z * 0.14));
          // Conciencia de fuera de juego (spec #24: "si salgo ahora, ¿quedo adelantado?"): un
          // delantero real sí ataca el espacio pegado a la última línea (y a veces se pasa un
          // poco, lo cual es justamente lo que produce un offside real de vez en cuando) pero no
          // se queda esperando 10+ metros adelantado todo el partido — sólo se recorta el exceso,
          // no se lo empuja a quedar siempre en posición habilitada.
          if (!counter) {
            const offLine = this.offsideLineX(l);
            if (offLine != null) f = DM.min(f * d, offLine * d + 1.6) * d;
          }
        }
        if (l.role === "MID") {
          // Instrucción de mediocampista en vivo (spec #10: hold/support/roam/attack) — desplaza el
          // objetivo de línea sin tocar su posición base ni su marca; permite la asimetría del
          // spec #11 ("un mediocentro sosteniendo, otro avanzando") jugador por jugador.
          const midInstr = this.playerRoles && this.playerRoles[l.id],
            midShift =
              midInstr === "attack"
                ? 6
                : midInstr === "roam"
                  ? 3
                  : midInstr === "hold"
                    ? -6
                    : 0;
          f = te(p[0] + u + midShift, -32, counter ? 40 : 36) * d;
        }
        // Instrucción de extremo en vivo (spec #10: wide/inside/support/attack) — un extremo
        // "wide" se pega más a la raya, uno "inside" juega más al medio (a la Robben/Arjen), sin
        // cambiar su rol base ni su posición de formación.
        if ((l.role === "FWD" || l.role === "MID") && DM.abs(p[1]) > 15) {
          const wingInstr = this.playerRoles && this.playerRoles[l.id],
            wideSide = DM.sign(p[1]) || 1;
          if (wingInstr === "wide") g = te(g + wideSide * 4, -32, 32);
          else if (wingInstr === "inside") g = te(g - wideSide * 6, -32, 32);
          else if (wingInstr === "attack") f = te(f + 3 * d, -48, 48);
        }
        // Fullbacks: overlap the flank when the winger has tucked inside, underlap through the
        // half-space when the winger is already hugging the touchline (spec #16 / #38).
        if (l.role === "DEF" && DM.abs(p[1]) > 15) {
          const side = DM.sign(p[1]) || 1,
            winger = this.players
              .filter(
                (q) =>
                  q.team === l.team &&
                  q.id !== l.id &&
                  (q.role === "FWD" || q.role === "MID") &&
                  DM.sign(
                    this.formationSlot(l.team, q.index)[1] || side,
                  ) === side,
              )
              .sort(
                (qa, qb) =>
                  DM.abs(qa.z - side * 26) - DM.abs(qb.z - side * 26),
              )[0],
            wingerWide = winger && DM.abs(winger.z) > 20,
            // Instrucción de rol en vivo (spec #10/#11): si el DT le puso "attacking"/"defensive" a
            // ESTE lateral en particular, pesa más que el style de fábrica — permite la asimetría
            // explícita del spec (uno ofensivo, el otro defensivo) sin tocar a su compañero de línea.
            roleInstr = this.playerRoles && this.playerRoles[l.id],
            aggr = te(
              (l.personality.aggression - 45) / 60 +
                (l.style === "Overlapping Fullback"
                  ? 0.35
                  : l.style === "Defensive Fullback"
                    ? -0.35
                    : 0) +
                (roleInstr === "attacking" ? 0.4 : roleInstr === "defensive" ? -0.4 : 0) +
                id.overlapFrequency * 0.3,
              0,
              1,
            ),
            push = te(m * 0.5 + 14, -4, 30) * te(0.4 + aggr * 0.6, 0.1, 1.1);
          if (wingerWide)
            ((f = te(m * 0.55 + push * 0.6, -30, 40) * d),
              (g = p[1] * d * 0.55 + e.z * 0.1),
              (overlapState = "Underlap"));
          else
            ((f = te(m * 0.5 + push, -30, 42) * d),
              (g = side * te(24 + DM.abs(e.z) * 0.1, 20, 32)),
              (overlapState = "Overlap"));
        }
        // Pass & move / one-two (#13/#14): a player who just set up a return ball sprints into the
        // space behind their marker instead of standing still admiring the pass they just made.
        const oneTwoRun =
          l.expectingReturn && this.elapsed - l.expectingReturn.at < 2.2;
        if (oneTwoRun)
          ((f = te(f + 6 * d, -49, 49)),
            (overlapState = overlapState ?? "PassAndMove"));
        // THIRD_MAN_RUN (spec #7): mientras dos compañeros combinan cerca (uno de ellos espera
        // la devolución), un tercero cercano ataca el espacio que esa combinación abre, en vez de
        // quedarse mirando la jugada — la combinación es emergente, no un patrón scripteado.
        const thirdManCombo =
          !oneTwoRun &&
          this.players.find(
            (p) =>
              p.team === l.team &&
              p.id !== l.id &&
              p.expectingReturn &&
              this.elapsed - p.expectingReturn.at < 2.2 &&
              ze(l, p) > 4 &&
              ze(l, p) < 18,
          );
        if (thirdManCombo)
          ((f = te(f + 5 * d, -48, 48)),
            (overlapState = overlapState ?? "ThirdMan"));
        // BLIND_SIDE_RUN (spec #6): si el marcador directo quedó mirando la pelota (más cerca de
        // ella que del propio arco a defender), el atacante puede escaparse por el lado que el
        // defensor no está vigilando — esto es lo que debería dejar a un extremo rápido solo
        // frente a un lateral lento (criterio de éxito del spec).
        const directMarker =
          this.marks &&
          Object.entries(this.marks).find(([, atkId]) => atkId === l.id);
        if (directMarker) {
          const mk = this.players[directMarker[0]];
          if (mk && !mk.sentOff) {
            const markerBallWatching =
              DM.hypot(mk.x - e.x, mk.z - e.z) <
              DM.hypot(mk.x - 52.5 * d, mk.z) - 14;
            if (markerBallWatching) {
              ((f = te(f + 2.5 * d, -48, 48)),
                (overlapState = overlapState ?? "BlindSideRun"),
                (l.sprinting = !0));
            }
          }
        }
        // Salvaguarda de offside (spec #24): ningún empuje de arriba (uno-dos, tercer hombre,
        // lado ciego) puede mandar a un FWD/MID muy por delante de la última línea salvo en
        // contragolpe — si no, cualquiera de esos empujes reabre el mismo problema que ya se
        // ajustó en isOffside()/passOption(). No aplica a fullbacks (overlap/underlap real).
        if ((l.role === "FWD" || l.role === "MID") && !counter) {
          const offLineFinal = this.offsideLineX(l);
          if (offLineFinal != null) f = DM.min(f * d, offLineFinal * d + 1.6) * d;
        }
        // WIDE_RUN / CHANNEL_RUN (spec #6): etiqueta de lectura — no toca f/g, sólo clasifica el
        // movimiento ya calculado arriba para debug/lectura del partido cuando no hay ya un
        // estado más específico (overlap, uno-dos, tercer hombre, lado ciego, centro activo).
        !overlapState &&
          (l.role === "FWD" || l.role === "MID") &&
          DM.abs(p[1]) > 15 &&
          f * d > l.x * d + 2 &&
          (overlapState = DM.abs(g) > 18 ? "WideRun" : "ChannelRun");
        // DECOY_RUN (spec #6): etiqueta de lectura — un atacante que un marcador sigue de cerca
        // sin ser opción real de pase (no va a buscar el balón ni corre a un espacio propio) está
        // funcionando como distracción aunque no se le esté por dar la pelota. No toca f/g.
        if (!overlapState && (l.role === "FWD" || l.role === "MID")) {
          const myMarkerId =
            this.marks &&
            Object.keys(this.marks).find((k) => this.marks[k] === l.id);
          const myMarker = myMarkerId != null ? this.players[myMarkerId] : null;
          myMarker &&
            !myMarker.sentOff &&
            ze(l, myMarker) < 4 &&
            l !== this.receiver &&
            (overlapState = "DecoyRun");
        }
        const y = this.teams[l.team].mentality,
          // FASE B: tras un "possession_reset" el equipo consolida un par de segundos en vez de
          // seguir empujando gente arriba inmediatamente después de recuperar desordenado.
          holdingShape = this.consolidateUntil[l.team] > this.elapsed;
        (y === "attacking" && (f += (holdingShape ? 1.5 : 4) * d),
          y === "defensive" && (f -= 4 * d),
          (f += this.urgency(l.team) * d),
          // Dial "attackingPlayers" en vivo (spec #1/#16): más cuerpos comprometidos arriba se
          // traduce en empujar un poco más la línea de ataque/mediocampo hacia adelante — no en
          // teletransportar jugadores, sólo en correr el objetivo que ya persigue move().
          (f += id.attackingPlayers * 2.2 * d),
          holdingShape && (f -= 3 * d),
          (f = te(f, -48, 48)),
          (g = te(g, -30, 30)),
          (l.state = overlapState ?? "Positioning"),
          (v = counter ? 1.12 : overlapState ? 1.05 : 0.85),
          (l.sprinting =
            ((l.role !== "DEF" || overlapState) &&
              DM.hypot(f - l.x, g - l.z) > 14) ||
            counter ||
            oneTwoRun));
      }
      // AI2 (spec #11/#12/#15/#23): el objetivo de posición ya no es sólo formationSlot() + retoques.
      // Sin balón, cada jugador elige entre candidatos evaluados con el mapa de control / valor de espacio
      // (ataque) o cumple el rol asignado por el coordinador defensivo (presión/cobertura/línea de
      // pase/marca/pantalla/equilibrio/caída). Los que persiguen un balón suelto siguen la lógica legacy.
      if (l.ai && l.aiChase !== this.elapsed) {
        const r = h
          ? this.ai2PositionAttack(l, f, g, d, counter)
          : this.ai2PositionDefend(l, f, g, d);
        if (r) {
          ((f = r.x), (g = r.z));
          if (r.v) v = r.v;
          if (r.sprint !== undefined) l.sprinting = r.sprint;
          if (r.state) l.state = r.state;
          if (r.role) l.tacticalRole = r.role;
          if (r.faceAt) l.faceAt = r.faceAt;
        }
      }
      // BOX_CRASH / NEAR_POST / FAR_POST (spec #17/#20): mientras un centro propio sigue en el aire,
      // el resto del ataque no mantiene la forma genérica de posicionamiento — cada atacante libre
      // (no el receptor esperado) elige primer palo, segundo palo o el borde del área, en vez de
      // amontonarse todos en el mismo punto del círculo.
      const activeCross =
        h &&
        this.elapsed - this.lastCrossAt < 1.8 &&
        !this.owner &&
        l !== this.receiver &&
        (l.role === "FWD" || l.role === "MID");
      if (activeCross) {
        const gx = 52.5 * d,
          crosserSide =
            DM.sign((this.lastTouch && this.lastTouch.z) || 1) || 1,
          spot = DM.floor(l.id * 7 + this.lastCrossAt * 10) % 3;
        if (spot === 0)
          ((f = gx - 5 * d), (g = crosserSide * 3), (l.state = "NearPost"));
        else if (spot === 1)
          ((f = gx - 4 * d), (g = -crosserSide * 7), (l.state = "FarPost"));
        else ((f = gx - 15 * d), (g = l.z * 0.4), (l.state = "Edge"));
        l.sprinting = !0;
      } else if (l.role === "FWD" || l.role === "MID") {
        // CHECK_TO / CHECK_AND_GO (spec #6): un atacante bien marcado y lejos del balón puede
        // "venir a buscarla" un par de segundos (encima del marcador, hacia la pelota) y después
        // girar de nuevo hacia el arco — en vez de quedarse siempre fijo en su posición de shape.
        // No reemplaza el posicionamiento normal: sólo lo desvía temporalmente cuando se activa.
        const now = this.elapsed;
        if (l.checkPhase === "in" && now < (l.checkUntil || 0)) {
          ((f = te(f * 0.35 + e.x * 0.65, -48, 48)),
            (g = g * 0.35 + e.z * 0.65),
            (l.state = "CheckTo"),
            (l.sprinting = !0));
        } else if (l.checkPhase === "go" && now < (l.checkGoUntil || 0)) {
          ((f = te(f + d * 7, -48, 48)),
            (l.state = "CheckAndGo"),
            (l.sprinting = !0));
        } else {
          (l.checkPhase === "in"
            ? ((l.checkPhase = "go"), (l.checkGoUntil = now + this.range(1, 1.6)))
            : l.checkPhase === "go" &&
              ((l.checkPhase = null),
              (l.checkCooldownUntil = now + this.range(6, 12))));
          if (
            !l.checkPhase &&
            now > (l.checkCooldownUntil || 0) &&
            now > (l.nextCheckEval || 0)
          ) {
            l.nextCheckEval = now + this.range(2, 4);
            const opps = this.players.filter(
                (p) => p.team !== l.team && !p.sentOff,
              ),
              marker = opps.sort((a, b) => ze(l, a) - ze(l, b))[0],
              tight = marker && ze(l, marker) < 3.2,
              farFromBall = ze(l, e) > 14;
            tight &&
              farFromBall &&
              this.random() < 0.3 &&
              ((l.checkPhase = "in"), (l.checkUntil = now + this.range(1, 1.5)));
          }
        }
      }
      {
        const tr = this.tacApply(l, f, g, v, { h, d, p, chasing: l.aiChase === this.elapsed, rcv: !!rcv });
        if (tr) {
          f = tr.f; g = tr.g; v = tr.v;
          if (tr.sprint !== undefined) l.sprinting = tr.sprint;
          if (tr.state) { l.state = tr.state; l.tacticalRole = tr.state; }
        }
      }
      for (const m of this.players)
        if (m !== l && m.role !== "GK") {
          const u = ze(l, m);
          u > 0 &&
            u < 1.25 &&
            ((f += ((l.x - m.x) / u) * 2), (g += ((l.z - m.z) / u) * 2));
        }
      // Debug (spec #21): si ninguna rama de arriba fijó un rol táctico más específico (PRESS,
      // MARK, PROTECT_SPACE...), el estado de movimiento normal (Overlap, ThirdMan, Positioning...)
      // sirve como rol de lectura igual.
      l.tacticalRole || (l.tacticalRole = l.state);
      // Fase 1: la velocidad es consecuencia de destino + intención + urgencia + atributos (p1Pace), no un multiplicador suelto.
      const pc = this.p1Pace(l, f, g, v, l.sprinting);
      ((l.sprinting = pc.sprint), l.p1 || (l.p1 = {}), (l.p1.mv = { tx: f, tz: g, r: pc.r, why: pc.why }));
      this.move(l, f, g, t, pc.r);
      // Fase 16 — primer control y orientación: con ventaja de tiempo, el receptor abre el cuerpo hacia el juego (delante) en los
      // últimos metros en vez de llegar mirando la pelota; bajo presión (sin ventaja) no se gira, protege.
      if (rcv && rcv.dist < 3.4 && rcv.margin > 0.2) {
        const want = DM.atan2(d, 0), df = DM.atan2(DM.sin(want - l.angle), DM.cos(want - l.angle)), lim = 7 * t;
        l.angle += df > lim ? lim : df < -lim ? -lim : df;
      }
    }
  }
  updateBall(t) {
    var c, l, d, h, p;
    const e = this.ball,
      n = e.x;
    if (this.tlHold && this.elapsed < this.tlHold.until && this.lastTouch === this.tlHold.p && !this.owner) return;
    const guided = this.owner && this.tlSkillBall && this.tlSkillBall(this.owner, t);
    if (this.owner && !guided) {
      const f = this.owner,
        g = ze(f, e);
      if (f.role === "GK" && (f.gkHoldUntil || 0) > this.elapsed) {
        // agarrada: la pelota va contra el pecho del arquero hasta que la suelte (mínimo GK_HOLD_S)
        // delante del pecho según hacia dónde MIRA (t.angle), no según el sentido del ataque: si el arquero camina de lado o gira, la pelota lo acompaña
        const ang = f.angle ?? (this.direction(f.team) > 0 ? DM.PI / 2 : -DM.PI / 2);
        e.x = f.x + DM.sin(ang) * 0.4; e.z = f.z + DM.cos(ang) * 0.4; e.y = 1.1; e.vx = e.vz = e.vy = 0; e.spin = 0;
      } else if (g > 3.4 || e.y > 1.2) this.owner = null;
      else {
        const v =
            DM.hypot(f.vx, f.vz) > 0.4
              ? $i(f.vx, f.vz)
              : { x: this.direction(f.team), z: 0 },
          m = f.x + v.x * 0.85,
          u = f.z + v.z * 0.85;
        g < 1.6 &&
          this.elapsed - (f.touchAt ?? -1) > 0.16 &&
          ((e.vx = f.vx + (m - e.x) * 4.3),
          (e.vz = f.vz + (u - e.z) * 4.3),
          (e.vy = 0.55),
          (e.spin *= 0.3),
          (f.touchAt = this.elapsed));
      }
    }
    // Fase 1: integrador ÚNICO del balón (ballFlightStep) — el mismo que usa el BallPlan para predecir.
    const s = DM.hypot(e.vx, e.vz);
    this.ballFlightStep(e, t);
    for (const f of [-52.5, 52.5])
      if ((n - f) * (e.x - f) <= 0) {
        const g = DM.abs((f - n) / (e.x - n || 1)),
          v = e.z - e.vz * t * (1 - g),
          m = DM.abs(DM.abs(v) - 3.66) < 0.28 && e.y < 2.7,
          u = DM.abs(e.y - 2.44) < 0.25 && DM.abs(v) < 3.9;
        if (m || u) {
          ((e.x = f - DM.sign(e.vx) * 0.35),
            (e.vx *= -0.64),
            (e.vz += this.range(-3, 3)),
            u && (e.vy = -DM.abs(e.vy) * 0.6),
            (this.excitement = 90),
            this.event(
              "post",
              u ? "¡AL TRAVESAÑO!" : "¡TIRO AL PALO!",
              "El arco le dice que no",
              (c = this.lastTouch) == null ? void 0 : c.team,
            ),
            (this.shot = null),
            (this.secondBallUntil = this.elapsed + 1.6));
          return;
        }
        if (DM.abs(v) < 3.55 && e.y < 2.34 && e.vx * DM.sign(f) > 0) {
          if (this.elapsed - (this.deflectBehind || -9) < 1.2) {
            e.x = f + DM.sign(f) * 0.9;
            break;
          }
          this.goal(
            f > 0
              ? this.direction(0) > 0
                ? 0
                : 1
              : this.direction(0) < 0
                ? 0
                : 1,
          );
          return;
        }
      }
    // Red lateral sólida (pedido explícito): un tiro desde un costado que pasa por AFUERA del palo no puede colarse por la red ni contar gol;
    // rebota contra el paño lateral (largo 2,2 m detrás de la línea, alto 2,44 m).
    for (const f of [-52.5, 52.5]) {
      const dxo = (e.x - f) * DM.sign(f), pz = e.z - e.vz * t;
      if (dxo > 0 && dxo < 2.25 && e.y < 2.5 && (DM.abs(pz) - 3.66) * (DM.abs(e.z) - 3.66) < 0 && DM.abs(pz) > 3.66) {
        e.z = DM.sign(pz) * (3.66 + 0.12); e.vz *= -0.22; e.vx *= 0.7;
      }
    }
    // ================= FASE F — BALONES DIVIDIDOS (spec #17) =================
    // Antes, cuando dos o más jugadores calificaban en el mismo instante para levantar una pelota
    // suelta o ganar un tackle (ambos dentro del radio de contacto), quien se quedaba con ella era
    // literalmente el primero en el orden fijo del array `this.players` (equipo 0 antes que
    // equipo 1, y dentro de cada equipo por índice) — ni siquiera "el más cercano" real, spec #17
    // explícitamente pide evitar eso. Se recorre en el orden de este score (distancia, velocidad,
    // aceleración, físico, anticipación, stamina y si ya viene cerrando el ángulo hacia la pelota)
    // así que, entre dos rivales igual de cerca, gana el duelo quien realmente está mejor parado
    // para la pelota, no quien casualmente está antes en la lista.
    const duelOrder = [...this.players].sort(
      (a2, b2) => this.looseBallScore(b2, e) - this.looseBallScore(a2, e),
    );
    for (const f of duelOrder) {
      if (
        f.sentOff ||
        f.ragdoll ||
        f.tlmSubbing ||
        this.owner === f ||
        (f === this.lastTouch && this.elapsed - this.kickedAt < 0.6)
      )
        continue;
      const g = ze(f, e);
      if (f.role === "GK") {
        this.p3GkContact(f, e);
        continue;
      }
      if (
        this.owner &&
        !(this.owner.role === "GK" && (this.owner.gkHoldUntil || 0) > this.elapsed) &&
        f.team !== this.owner.team &&
        g < this.p1DuelReach(f, this.owner) &&
        e.y < 0.65 &&
        this.elapsed > this.protectedUntil &&
        this.elapsed - f.tackleAt > 1.4
      ) {
        const v = this.owner,
          // FASE B (spec #5): si el equipo eligió "falta táctica" como respuesta a esta transición
          // (peligro real y sin cobertura), el defensor más cercano tiene más chance de cortar la
          // jugada con una entrada dura antes que dejar seguir el contraataque limpio.
          tacticalFoulMode =
            this.transitionMode[f.team] &&
            this.transitionMode[f.team].mode === "tactical_foul" &&
            this.transitionMode[f.team].until > this.elapsed,
          // v13: bajado de 0.33 base (y techo 0.55) — generaba faltas/penales demasiado
          // seguido en cualquier disputa cercana, sin que se viera una entrada clara de por
          // medio (spec #30: "no toda colisión debe ser falta").
          // Fase 1 (duelo real): la falta y el resultado salen de la GEOMETRÍA del contacto (ángulo de entrada, exposición de la
          // pelota, velocidad de cierre, atributos) — no de un porcentaje fijo por contacto.
          duel = this.p1DuelEval(f, v),
          foulChance = te(duel.foulP + (tacticalFoulMode ? 0.22 : 0), 0.03, 0.6);
        // v9 Fase 1: BARRIDA (slide tackle). El defensor la elige en vez de la entrada de pie
        // cuando llega corriendo fuerte y no le da el tiempo para pararse a tacklear parado —
        // tiene su propia secuencia (preparación → deslizamiento → resultado) y puede terminar
        // en robo limpio, falla (el defensor queda en el piso) o falta (ragdoll en el atacante).
        const defSpeed = DM.hypot(f.vx, f.vz),
          atkSpeed = DM.hypot(v.vx, v.vz),
          closingFast = defSpeed > 4 && defSpeed >= atkSpeed * 0.75,
          nearOwnBox =
            DM.abs(f.x - -52.5 * this.direction(f.team)) < 22 &&
            DM.abs(f.z) < 24,
          riskAppetite = te(
            (f.personality.aggression - 40) / 80 -
              (f.cards.yellow ? 0.22 : 0) -
              (nearOwnBox ? 0.1 : 0),
            0.05,
            0.95,
          ),
          slide = this.tlSlideDecide && this.tlbEnabled
            ? this.tlSlideDecide(f, v, closingFast)
            : closingFast && this.random() < te(0.3 + riskAppetite * 0.45, 0.08, 0.78);
        if (this.random() < foulChance * (slide ? 1.2 : 1)) {
          this.commitFoul(f, v);
          return;
        }
        ((f.tackleAt = this.elapsed), (f.action = 0.6));
        if (slide) {
          f.state = "Slide";
          // Tipos de barrida (spec #22): la misma decisión "barrida" ya tomada arriba se matiza
          // según el contexto en el que realmente llega el defensor — no cambia la mecánica base,
          // sólo el matiz de probabilidad/resultado/texto, para que se lean distinto en pantalla.
          const dir2 = this.direction(f.team),
            comesFromBehind = (v.x - f.x) * dir2 > 0.3,
            emergency =
              nearOwnBox && this.dangerAt(v.x, v.z, v.team) > 0.5,
            slideType = emergency
              ? "EMERGENCY_SLIDE"
              : comesFromBehind
                ? "LATE_SLIDE"
                : nearOwnBox
                  ? "CLEARANCE_SLIDE"
                  : "CLEAN_SLIDE";
          f.slideType = slideType;
          const atkScore2 =
              v.stats.dribbling * 0.25 +
              v.stats.acceleration * 0.15 +
              v.personality.composure * 0.1,
            defScore2 =
              f.stats.defense * 0.38 +
              f.stats.speed * 0.18 +
              f.personality.consistency * 0.12,
            typeAdj =
              (slideType === "LATE_SLIDE" ? -0.07 : 0) +
              (slideType === "CLEAN_SLIDE" ? 0.05 : 0);
          if (
            this.random() <
            0.5 + (defScore2 - atkScore2) * 0.006 + typeAdj
          ) {
            // CLEARANCE_SLIDE / EMERGENCY_SLIDE: no es momento de intentar iniciar una jugada
            // propia — se manda lejos/afuera antes que arriesgar perderla de nuevo ahí mismo.
            const clearAway =
              slideType === "EMERGENCY_SLIDE" || slideType === "CLEARANCE_SLIDE";
            ((this.owner = null),
              (e.vx = clearAway
                ? dir2 * this.range(9, 15)
                : f.vx * 0.5 + dir2 * 5),
              (e.vz = clearAway
                ? this.range(-10, 10)
                : f.vz * 0.5 + this.range(-3, 3)),
              (e.vy = clearAway ? this.range(2, 5) : 0.5),
              (v.timer = 0.5),
              (v.think = 0.7),
              (this.protectedUntil = this.elapsed + 0.65),
              this.stats[f.team].tackles++,
              clearAway && (this.secondBallUntil = this.elapsed + 1.6),
              this.event(
                "tackle",
                slideType === "EMERGENCY_SLIDE"
                  ? "¡BARRIDA DE EMERGENCIA!"
                  : slideType === "CLEARANCE_SLIDE"
                    ? "BARRIDA Y AL CÓRNER"
                    : slideType === "LATE_SLIDE"
                      ? "BARRIDA JUSTA"
                      : "¡BARRIDA LIMPIA!",
                clearAway
                  ? `${f.name} llega justo para rechazar el peligro`
                  : `${f.name} se lleva el balón con una entrada perfecta`,
                f.team,
                f,
              ));
          } else
            (this.startRagdoll(f, 0.42, $i(f.vx || 0.1, f.vz || 0.1)),
              this.event(
                "tackle",
                slideType === "LATE_SLIDE"
                  ? "BARRIDA TARDÍA"
                  : "BARRIDA FALLIDA",
                slideType === "LATE_SLIDE"
                  ? `${f.name} llega tarde y se tira al piso`
                  : `${f.name} se tira al piso y no llega`,
                f.team,
                f,
              ));
          return;
        }
        f.state = "Tackle";
        // Shielding (#11): a player who just chose to protect the ball (RIVAL <- JUGADOR <- BALÓN)
        // leans on physical + composure to make the challenge harder, not just raw dribbling.
        const shielding =
            v.lastDecision === "hold" && this.elapsed - v.controlAt < 2.5,
          atkScore =
            v.stats.dribbling * 0.3 +
            v.stats.speed * 0.16 +
            v.stats.acceleration * 0.1 +
            v.stats.physical * (shielding ? 0.24 : 0.1) +
            v.personality.creativity * 0.12 +
            v.personality.composure * (shielding ? 0.2 : 0.1) +
            (shielding ? 9 : 0),
          defScore =
            f.stats.defense * 0.32 +
            f.stats.speed * 0.14 +
            f.stats.physical * 0.14 +
            f.stats.intelligence * 0.2 +
            f.personality.consistency * 0.1 +
            (f.style === "Ball Winner" ? 7 : 0),
          // Memoria (spec #15): efecto chico — quien viene de perder duelos seguidos defiende/ataca
          // ese contacto puntual con algo menos de aplomo, no es un modificador dominante.
          memAdj =
            ((v.memory ? v.memory.confidence : 50) -
              (f.memory ? f.memory.confidence : 50)) *
            0.05,
          defenderWins = this.random() < te(duel.winP + memAdj * 0.001, 0.1, 0.9);
        this.p1Count(defenderWins ? "duel_won" : "duel_lost");
        this.p1Log("duel", { def: f.name, atk: v.name, winP: +duel.winP.toFixed(2), foulP: +duel.foulP.toFixed(2), exposure: +duel.exposure.toFixed(2), front: +duel.front.toFixed(2), won: defenderWins });
        if (v.memory && f.memory) {
          ((v.memory.pressureMemory = te(v.memory.pressureMemory + 8, 0, 60)),
            (v.memory.confidence = te(
              v.memory.confidence + (defenderWins ? -2.5 : 1.5),
              15,
              88,
            )),
            (v.memory.recentDuelResults += defenderWins ? -1 : 1),
            defenderWins ? v.memory.recentMistakes++ : v.memory.recentSuccesses++,
            (v.memory.lastOpponent = f.id),
            (f.memory.confidence = te(
              f.memory.confidence + (defenderWins ? 2 : -1.5),
              15,
              88,
            )),
            (f.memory.recentDuelResults += defenderWins ? 1 : -1),
            (f.memory.lastOpponent = v.id));
        }
        defenderWins
          ? ((this.owner = null),
            (e.vx = f.vx * 0.4 + this.direction(f.team) * 4),
            (e.vz = f.vz * 0.4 + this.range(-3, 3)),
            (e.vy = 0.6),
            (v.timer = 0.55),
            (v.tackleAt = this.elapsed),
            (v.think = 0.7),
            (this.protectedUntil = this.elapsed + 0.65))
          : (f.timer = 0.55);
      } else if (
        !this.owner &&
        g < (this.hasTrait(f, "Block Specialist") ? 1.22 : 1) &&
        this.elapsed > this.protectedUntil - 0.7
      ) {
        if (
          e.y > 1.05 &&
          e.y < 2.5 &&
          DM.abs(f.x) > 29 &&
          f.team === ((l = this.lastTouch) == null ? void 0 : l.team) &&
          this.elapsed - this.kickedAt > 0.6
        ) {
          this.shoot(f, !0);
          break;
        }
        if (e.y < 0.8 && (s < 18 || this.random() < 0.24)) {
          // A pass just released beats the marker who was already beaten by the decision to
          // release it — an opponent standing right next to the passer shouldn't get a free
          // instant steal on the very same touch. Teammates (intended receiver or not) are unaffected.
          if (
            this.receiver &&
            this.lastTouch &&
            f.team !== this.lastTouch.team &&
            this.elapsed - this.kickedAt < 0.16
          )
            continue;
          if (this.shot && this.shot.team !== f.team && s > 17) {
            const dd = this.direction(f.team),
              beh = f.x * dd < -33 && this.random() < 0.76;
            (beh
              ? ((this.deflectBehind = this.elapsed),
                (e.vx = -dd * this.range(5, 9)),
                (e.vz = (e.z >= 0 ? 1 : -1) * this.range(8, 15)),
                (e.vy = this.range(2, 5)))
              : ((e.vx *= 0.45),
                (e.vz += this.range(-9, 9)),
                (e.vy = this.range(1, 4))),
              (this.lastTouch = f),
              (this.shot = null),
              (this.kickedAt = this.elapsed),
              (this.secondBallUntil = this.elapsed + 1.6),
              this.event(
                "block",
                "¡BLOQUEO!",
                `${f.name} se cruza a tiempo`,
                f.team,
                f,
              ));
            continue;
          }
          const v =
              s > 8 &&
              ((d = this.lastTouch) == null ? void 0 : d.team) === f.team &&
              f.x * this.direction(f.team) > 32 &&
              DM.abs(f.z) < 15 &&
              this.random() < 0.32,
            wasAerial = e.y > 0.4;
          (this.possession(f), v && this.shoot(f, !1, !0, wasAerial));
          break;
        }
      }
    }
    if (!this.owner && !this.p4Off) this.p4BodyCollide(t); // Fase 4: los cuerpos son sólidos (el balón rebota, ya no atraviesa)
    if (DM.abs(e.z) > 34.4) {
      const f = 1 - (((h = this.lastTouch) == null ? void 0 : h.team) ?? 0);
      this.restart(
        f,
        te(e.x, -47, 47),
        DM.sign(e.z) * 32,
        "Saque de banda",
        !1,
        "throwin",
      );
    } else if (DM.abs(e.x) > 53.2) {
      const f = this.direction(0) * e.x > 0 ? 1 : 0,
        g = ((p = this.lastTouch) == null ? void 0 : p.team) === f;
      this.restart(
        g ? 1 - f : f,
        g ? DM.sign(e.x) * 51.8 : DM.sign(e.x) * 47.5,
        g ? DM.sign(e.z || 1) * 33.2 : 0,
        g ? "Tiro de esquina" : "Saque de arco",
        !1,
        g ? "corner" : "goalkick",
      );
    }
  }
  // v15 (pedido explícito): mientras la pelota está fuera de la cancha esperando un reinicio, sigue
  // una física simple propia (gravedad, pique con pérdida de energía, fricción de rodadura) en vez
  // de quedar congelada — no toca jugadores ni dispara goles/eventos, porque la jugada ya terminó
  // al cruzar la línea; sólo es la continuación visual de su recorrido hasta que se repone.
  coastBall(dt) {
    const b = this.ball,
      grav = 9.81,
      ground = 0.13;
    ((b.vy -= grav * dt),
      (b.x += b.vx * dt),
      (b.z += b.vz * dt),
      (b.y += b.vy * dt));
    if (b.y <= ground) {
      ((b.y = ground), (b.vy = b.vy < 0 ? -b.vy * 0.42 : b.vy));
      if (DM.abs(b.vy) < 0.6) b.vy = 0;
      ((b.vx *= 0.82), (b.vz *= 0.82));
    }
    ((b.vx *= 1 - 0.15 * dt), (b.vz *= 1 - 0.15 * dt));
  }
  restart(t, e, n, s, direct = !1, kind = null) {
    // Salvavidas: si la pelota sale de la cancha (o hay cualquier otro reinicio) sin que el
    // jugador adelantado la haya tocado, el offside pendiente queda sin efecto — la fase de
    // juego terminó sin que se involucrara (resolvePendingOffside ya la limpia antes de llegar
    // acá cuando SÍ se cobra, así que esto es un no-op en ese caso).
    this.pendingOffside = null;
    ((this.owner = null), (this.receiver = null), (this.shot = null));
    // v9 Fase 2: un tiro libre directo con ángulo de arco se resuelve con su propia secuencia
    // cinematográfica (carrera + barrera + cámara dedicada) en vez del reinicio genérico.
    const dirn0 = this.direction(t),
      distGoal0 = DM.hypot(52.5 * dirn0 - e, n);
    if (direct && kind !== "corner" && distGoal0 < 32 && DM.abs(n) < 24) {
      this.beginFreeKick(t, e, n);
      return;
    }
    ((this.phase = "restart"),
      (this.wait = kind === "corner" ? 4.2 : 1.1),
      (this.restartData = {
        team: t,
        x: e,
        z: n,
        direct,
        kind,
        since: this.elapsed,
      }));
    // v15 (pedido explícito): antes la pelota se colocaba de inmediato en el punto de reinicio y
    // quedaba congelada ahí — ahora sigue su recorrido real (ver coastBall) fuera de la cancha; el
    // cobrador ya se designa y empieza a trotar hacia el punto fijo, pero la pelota recién se repone
    // ahí cuando de verdad se saca (ver el bloque de "restart" en el loop principal).
    if (kind !== "corner") {
      const elig = this.players.filter(
          (a) => a.team === t && !a.sentOff && !a.ragdoll,
        ),
        taker = (
          elig.length
            ? elig
            : this.players.filter((a) => a.team === t && !a.sentOff)
        ).sort(
          (a, o) => DM.hypot(a.x - e, a.z - n) - DM.hypot(o.x - e, o.z - n),
        )[0];
      taker &&
        ((this.restartData.takerId = taker.id),
        (this.restartData.run = {
          dur: te(DM.hypot(taker.x - e, taker.z - n) / 6.5, 4, 5),
        }));
    }
    (s === "Tiro de esquina" && this.stats[t].corners++,
      this.elapsed - (this.lastRestartEvent || 0) > 9 &&
        (this.event("restart", s, this.teams[t].name, t),
        (this.lastRestartEvent = this.elapsed)));
  }
  // v15 (pedido explícito): saques de banda y tiros libres lejos del arco ahora exigen que el
  // rival se retire a los 9.15m reglamentarios antes de poder cobrarse — antes sólo el tiro libre
  // directo cerca del área armaba barrera (ver beginFreeKick) y cualquier otro reinicio se sacaba
  // apenas el cobrador llegaba, sin importar si tenía un rival encima. Empuja a quien esté
  // demasiado cerca hacia afuera del radio y devuelve si ya está todo despejado para sacar.
  // FASE F (spec #18): marca al cobrador de un tiro libre indirecto/lejano para que, apenas
  // decida, incline su primera opción hacia el centro si cae en una zona ancha cerca del área
  // rival — sin obligarlo si no hay compañero realista para recibirlo.
  setPieceCrossBias(taker, rd) {
    const dirAtk = this.direction(taker.team),
      wideDangerous = rd.x * dirAtk > 22 && DM.abs(rd.z) > 17;
    if (wideDangerous) taker.setpieceCrossBias = this.elapsed + 3;
  }
  // FIX — "barrera invisible" en saques de banda/tiros libres: updatePlayers() sigue moviendo a
  // TODOS los jugadores cada frame durante el reinicio (para que el resto del equipo no quede
  // congelado — ver el comentario junto al llamado con savedTouch), incluidos los rivales que acá
  // se supone deben retroceder. Como esa función corre ANTES que este método en el mismo tick, un
  // rival cuya marca normal lo empuja hacia la pelota y este método empujándolo hacia afuera
  // terminaban compitiendo por la misma velocidad cada frame — al ser dos llamadas a move()
  // (que sólo ajusta vx/vz por aceleración) con objetivos opuestos, el avance neto real quedaba
  // casi en cero: el jugador se quedaba "empujando contra una pared" sin llegar nunca a los 9.15m,
  // y el saque no se ejecutaba hasta el tope de 3.5s. La corrección de posición directa de acá
  // (además de la velocidad) no depende de qué haya hecho updatePlayers() este mismo frame, así
  // que el retroceso avanza de verdad en vez de trabarse.
  enforceRestartDistance(rd, dt) {
    const min = 9.15;
    let clear = !0;
    for (const p of this.players) {
      if (p.team === rd.team || p.sentOff || p.ragdoll || p.role === "GK")
        continue;
      const dx = p.x - rd.x,
        dz = p.z - rd.z,
        d = DM.hypot(dx, dz);
      if (d < min) {
        clear = !1;
        const ux = d > 0.05 ? dx / d : this.direction(rd.team) * -1,
          uz = d > 0.05 ? dz / d : 0,
          tx = te(rd.x + ux * (min + 0.5), -52, 52),
          tz = te(rd.z + uz * (min + 0.5), -34, 34);
        this.move(p, tx, tz, dt, 1.15);
        // Corrección posicional directa: garantiza progreso real hacia afuera de la zona vedada
        // este mismo frame, sin importar qué target haya fijado la lógica normal de marca/presión
        // segundos (o instantes) antes en el mismo tick.
        const step = te((6 + p.stats.speed * 0.03) * dt, 0, DM.hypot(tx - p.x, tz - p.z));
        ((p.x = te(p.x + ux * step, -52, 52)), (p.z = te(p.z + uz * step, -34, 34)));
        (p.state = "Retreat"), (p.sprinting = !0);
      }
    }
    return clear;
  }
  // SAQUE DE BANDA (pedido explícito — reglamento FIFA, Ley 15): se cobra con las dos manos
  // por encima de la cabeza, no de pie. Antes el cobrador simplemente ganaba posesión y su
  // decide() normal la sacaba jugando con el pie como cualquier pase; ahora es su propia acción,
  // sin pasar por pass()/shoot() — y de paso, exenta de offside como marca la ley (igual que ya
  // se hizo con el córner corto).
  throwIn(taker, team) {
    const candidates = this.players.filter(
        (p) => p.team === team && p.id !== taker.id && !p.sentOff && !p.ragdoll,
      ),
      dirAtk = this.direction(team),
      // SAQUE LARGO (spec #18): un lanzador físico, cerca del área rival, con gente esperando
      // adentro, prefiere un lanzamiento largo hacia el área — casi un córner de mano — antes que
      // la devolución corta de siempre. No todos los saques de banda cerca del área son así (sólo
      // cuando el propio lanzador realmente tiene el físico para llegar).
      longThrowCapable = taker.stats.physical > 76 && DM.abs(taker.z) > 24,
      nearOppBox = taker.x * dirAtk > 28,
      boxTarget =
        longThrowCapable && nearOppBox
          ? candidates
              .filter((p) => p.x * dirAtk > 38 && DM.abs(p.z) < 20)
              .sort((a, b) => this.aerialAbility(b) - this.aerialAbility(a))[0]
          : null,
      target =
        boxTarget ||
        candidates
          .filter((p) => ze(taker, p) < 24)
          .sort(
            (a, b) =>
              ze(taker, a) -
              ze(taker, b) -
              (this.chem(taker, a) - this.chem(taker, b)) * 2,
          )[0] ||
        candidates.sort((a, b) => ze(taker, a) - ze(taker, b))[0];
    let dir = target
      ? $i(target.x - taker.x, target.z - taker.z)
      : { x: this.direction(team), z: 0 };
    // v15 fix: si el compañero elegido queda del mismo lado de la raya que el cobrador, el vector
    // le daba un envión hacia afuera de la cancha — el saque de banda se iba directo de nuevo por
    // la línea. Se corrige para que el componente lateral siempre apunte hacia adentro.
    DM.abs(taker.z) > 25 &&
      DM.sign(dir.z || 0) === DM.sign(taker.z) &&
      (dir = $i(dir.x, -DM.sign(taker.z) * (DM.abs(dir.z) + 0.4)));
    const dist = target ? te(ze(taker, target), 4, 26) : 9,
      speed = boxTarget ? te(dist * 0.95, 12, 18) : te(dist * 0.85, 6, 13);
    ((this.ball.x = taker.x),
      (this.ball.z = taker.z),
      (this.ball.y = 1.9),
      (this.ball.vx = dir.x * speed),
      (this.ball.vz = dir.z * speed),
      (this.ball.vy = boxTarget ? te(dist * 0.24, 3, 6.5) : te(dist * 0.14, 1, 3.2)),
      (this.ball.spin = 0),
      (this.owner = null),
      (this.receiver = target || null),
      (this.lastTouch = taker),
      (this.kickedAt = this.elapsed),
      (this.protectedUntil = this.elapsed + 0.4),
      (taker.state = "Throw"),
      (taker.action = 0.55),
      (taker.think = 0.8),
      this.stats[team].passes++,
      boxTarget &&
        this.event(
          "restart",
          "SAQUE DE BANDA LARGO",
          `${taker.name} busca directo el área`,
          team,
          taker,
        ));
    target &&
      ((target.target = {
        x: taker.x + dir.x * dist,
        z: taker.z + dir.z * dist,
      }),
      (target.state = "ReceiveBall"),
      (target.lastPasser = taker.id),
      (target.lastPassAt = this.elapsed));
    this.phase = "playing";
  }
  // v9 Fase 2: TIRO LIBRE DIRECTO — secuencia dedicada (carrera + barrera + cámara), en vez de
  // resolverse con la misma rutina genérica de disparo/pase.
  beginFreeKick(team, x, z) {
    this.phase = "freekick";
    const def = 1 - team,
      dirn = this.direction(team),
      gx = 52.5 * dirn,
      toGoal = DM.max(6, DM.hypot(gx - x, z)),
      ux = (gx - x) / toGoal,
      uz = (0 - z) / toGoal,
      px = -uz,
      pz = ux,
      wallX = x + ux * 9.15,
      wallZ = z + uz * 9.15,
      taker = this.players
        .filter((l) => l.team === team && !l.sentOff && !l.ragdoll)
        .sort(
          (l, d) =>
            d.stats.shooting * 0.55 +
            d.personality.composure * 0.25 +
            d.personality.creativity * 0.2 -
            (l.stats.shooting * 0.55 +
              l.personality.composure * 0.25 +
              l.personality.creativity * 0.2),
        )[0],
      wallSize = toGoal < 18 ? 4 : toGoal < 25 ? 3 : 2,
      wallers = this.players
        .filter(
          (l) => l.team === def && l.role !== "GK" && !l.sentOff && !l.ragdoll,
        )
        .sort((l, d) => ze(l, { x, z }) - ze(d, { x, z }))
        .slice(0, wallSize);
    this.freeKickData = {
      team,
      x,
      z,
      gx,
      ux,
      uz,
      wallX,
      wallZ,
      px,
      pz,
      takerId: taker ? taker.id : null,
      wallerIds: wallers.map((w) => w.id),
      stage: "approach",
      t: 0,
    };
    taker && (taker.approachTarget = { x: x - ux * 2.3, z: z - uz * 2.3 });
    wallers.forEach((w, i) => {
      const off = (i - (wallSize - 1) / 2) * 0.62;
      w.wallTarget = { x: wallX + px * off, z: wallZ + pz * off };
    });
    this.event("restart", "TIRO LIBRE DIRECTO", this.teams[team].name, team);
  }
  advanceFreeKick(dt) {
    this.tlFreeKickRoam && this.tlFreeKickRoam(dt);
    const fd = this.freeKickData,
      taker =
        fd.takerId != null
          ? this.players.find((p) => p.id === fd.takerId)
          : null;
    if (!taker || taker.sentOff || taker.ragdoll) {
      ((this.phase = "playing"),
        this.possession(
          this.players.find((p) => p.team === fd.team && !p.sentOff),
        ));
      return;
    }
    for (const id of fd.wallerIds) {
      const w = this.players.find((p) => p.id === id);
      if (w && w.wallTarget && !w.sentOff && !w.ragdoll)
        ((w.wallRun = w.wallRun || { dur: 1.1 }),
          this.advanceTo(w, w.wallTarget.x, w.wallTarget.z, dt, w.wallRun),
          (w.state = "Positioning"));
    }
    if (fd.stage === "approach") {
      fd.run = fd.run || {
        dur: te(
          DM.hypot(
            taker.x - taker.approachTarget.x,
            taker.z - taker.approachTarget.z,
          ) / 6.2,
          3.1,
          3.6,
        ),
      };
      const prog = this.advanceTo(
        taker,
        taker.approachTarget.x,
        taker.approachTarget.z,
        dt,
        fd.run,
      );
      taker.state = "Positioning";
      prog >= 1 &&
        ((fd.stage = "pause"), (fd.t = 0), (taker.vx = taker.vz = 0));
    } else if (fd.stage === "pause") {
      ((fd.t += dt),
        fd.t > 0.5 && ((fd.stage = "runup"), (fd.run = { dur: 0.5 })));
    } else if (fd.stage === "runup") {
      const prog = this.advanceTo(taker, fd.x, fd.z, dt, fd.run);
      taker.state = "Sprint";
      prog >= 1 && ((taker.vx = taker.vz = 0), this.strikeFreeKick());
    }
  }
  strikeFreeKick() {
    const fd = this.freeKickData,
      taker = this.players.find((p) => p.id === fd.takerId);
    ((this.lastTouch = taker), this.shoot(taker));
    const spd = DM.hypot(this.ball.vx, this.ball.vz) || 1,
      timeToWall = DM.hypot(fd.wallX - fd.x, fd.wallZ - fd.z) / spd,
      bx = this.ball.x + this.ball.vx * timeToWall,
      bz = this.ball.z + this.ball.vz * timeToWall,
      wallers = fd.wallerIds
        .map((id) => this.players.find((p) => p.id === id))
        .filter((w) => w && !w.sentOff);
    for (const w of wallers) {
      const toW = DM.hypot(w.x - bx, w.z - bz);
      if (
        toW < 1.1 &&
        this.random() <
          te(0.5 - toW * 0.2 + (w.stats.defense - 65) * 0.003, 0.08, 0.68)
      ) {
        ((this.ball.vx *= 0.12),
          (this.ball.vz *= -0.3),
          (this.ball.vy = this.range(1.5, 3.4)),
          (this.ball.spin = 0),
          (this.shot = null),
          (this.secondBallUntil = this.elapsed + 1.6));
        this.event(
          "block",
          "¡LA BARRERA LA TAPA!",
          `${w.name} evita el gol con el cuerpo`,
          w.team,
          w,
        );
        break;
      }
    }
    this.phase = "playing";
  }
  goal(t) {
    var n;
    if (this.so) return void this.soResult("goal");
    (this.score[t]++,
      (this.excitement = 100),
      (this.phase = "goal"),
      (this.wait = 5),
      (this.nextKickoff = 1 - t),
      (this.counterUntil = [0, 0]));
    const e =
      this.players[(n = this.shot) == null ? void 0 : n.player] ??
      this.lastTouch;
    this.tlOnGoal && this.tlOnGoal(t, e);
    // Memoria (spec #15): un gol sube bastante la confianza del autor; el arquero que lo recibe
    // sólo baja un poco (un gol no es siempre "su culpa" salvo que el sistema de errores ya lo
    // haya marcado como tal en otro lado).
    // AI2: resultado del remate → memoria de forma; gol "improbable" (lejano/mal ejecutado) = acción afortunada
    if (this._aiShot && e === this._aiShot.player) {
      this._aiShot.result = "goal";
      this.ai2Outcome(e, "shot", "goal", { risky: this._aiShot.spec });
      if (this._aiShot.dist > 24) { this.ai2Count(e, "goals_from_far"); this.ai2Count(e, "lucky_actions"); }
      else if (this._aiShot.q < 0.32) this.ai2Count(e, "lucky_actions");
    }
    if (e && e.memory) {
      ((e.memory.confidence = te(e.memory.confidence + 10, 15, 92)),
        e.memory.recentSuccesses++);
      const gk = this.players.find((p) => p.team === 1 - t && p.role === "GK");
      gk && gk.memory && (gk.memory.confidence = te(gk.memory.confidence - 4, 15, 88));
    }
    (this.event(
      "goal",
      "¡GOOOOL!",
      `${(e == null ? void 0 : e.name) ?? this.teams[t].name} · ${this.score[0]} — ${this.score[1]}`,
      t,
      e,
    ),
      (this.owner = null),
      (this.shot = null),
      // Antes se frenaba casi del todo acá y, como updateBall() deja de correr en phase="goal",
      // la pelota quedaba clavada justo en la línea. Ahora se amortigua menos y es step() el que
      // sigue moviéndola (coastBall) hasta que se frena sola dentro del arco.
      (this.ball.vx *= 0.55),
      (this.ball.vz *= 0.55));
    for (const s of this.players) s.team === t && (s.state = "Celebrate");
  }
  step(t) {
    if (!(!this.running || this.ended)) {
      if (
        ((t = te(t, 0, 1 / 30)),
        (this.elapsed += t),
        (this.excitement = DM.max(0, this.excitement - t * 4)),
        (this.tlTick && this.tlTick(t)),
        this.so && this.soStep(t))
      )
        return;
      if (this.phase === "freekick")
        return void this.advanceFreeKick(t);
      if (this.phase === "penalty") return void this.advancePenalty(t);
      if (this.phase === "injury") {
        // v9 Fase 4: el partido queda en espera (como cualquier pelota parada) hasta que el
        // jugador lesionado termina el ragdoll extendido; recién ahí se resuelve el tiro
        // libre/penal que la falta ya había decidido.
        const id = this.injuryData,
          p = id && this.players.find((pl) => pl.id === id.playerId);
        if (p && p.ragdoll) return void this.updateRagdoll(p, t);
        this.phase = "playing";
        id &&
          (id.isPenalty
            ? this.awardPenalty(id.attackTeam, id.defendTeam)
            : this.restart(id.attackTeam, id.x, id.z, "Tiro libre", !0));
        return;
      }
      if (
        this.phase === "goal" ||
        this.phase === "halftime" ||
        this.phase === "restart"
      ) {
        // v15 (pedido explícito): la pelota ya no se congela — sigue rodando/rebotando fuera de la
        // cancha (coastBall) mientras se resuelve el reinicio, y si por su propio recorrido vuelve
        // a entrar a la cancha, el reinicio se cancela y el partido sigue en vivo donde quedó, en
        // vez de forzar sí o sí el saque.
        // v15 fix: esto sólo tiene sentido cuando la pelota realmente salió de la cancha (saque de
        // banda, córner, saque de arco) — una falta/offside nunca la saca del campo, así que ahí no
        // hay nada que "hacer rodar" ni que pueda "volver sola" (antes esto se colaba también para
        // faltas y, como el balón ya estaba detenido dentro de la cancha, el reinicio se cancelaba
        // solo a los 0.6s y el tiro libre nunca se llegaba a cobrar).
        if (this.phase === "restart" && this.periodCheck(true)) return;
        const wentOutOfBounds =
          this.restartData &&
          (this.restartData.kind === "throwin" ||
            this.restartData.kind === "corner" ||
            this.restartData.kind === "goalkick");
        if (this.phase === "restart" && wentOutOfBounds) {
          this.coastBall(t);
          // v15 fix: el margen contra el límite real de cancha (34.4/53.2) era demasiado chico y
          // no miraba hacia dónde seguía yendo la pelota — apenas rebotaba un centímetro adentro
          // se cancelaba el reinicio, y al toque siguiente updateBall() la volvía a mandar afuera:
          // eso generaba el bucle de "saca y se va altiro". Ahora pide un margen real y que la
          // pelota ya no esté yéndose hacia la línea por la que salió.
          const backIn =
            DM.abs(this.ball.x) < 49 &&
            DM.abs(this.ball.z) < 30 &&
            this.elapsed - this.restartData.since > 0.6 &&
            (this.restartData.kind === "throwin"
              ? this.ball.vz * DM.sign(this.restartData.z) < 1
              : this.ball.vx * DM.sign(this.restartData.x) < 1);
          if (backIn) {
            ((this.phase = "playing"),
              (this.restartData = null),
              (this.owner = null),
              (this.receiver = null));
            return;
          }
        }
        // v9 Fase 2: un reinicio normal (no córner) ya trae cobrador + caminata asignados desde
        // restart() — acá sólo lo hacemos avanzar hasta que llega a la pelota.
        if (
          this.phase === "restart" &&
          this.restartData &&
          this.restartData.kind !== "corner" &&
          this.restartData.takerId != null
        ) {
          // v14 (pedido explícito): el resto de los jugadores sigue moviéndose/reacomodándose
          // durante el reinicio en vez de quedar congelado hasta que el cobrador llega a la
          // pelota — sólo el penal amerita esa pausa total (ver awardPenalty/advancePenalty).
          // this.lastTouch se pisa un instante para que la formación trate al equipo que saca
          // como "el que va a tener la pelota" (si no, con this.owner=null durante el reinicio,
          // updatePlayers() usaría el último toque real — normalmente el equipo contrario que
          // cometió la falta — y las dos formaciones quedarían invertidas).
          const savedTouch = this.lastTouch;
          ((this.lastTouch = { team: this.restartData.team }),
            this.p3SetPieceShape(this.restartData, t),
            this.updatePlayers(t),
            (this.lastTouch = savedTouch));
          const rd = this.restartData,
            taker = this.players.find((p) => p.id === rd.takerId);
          if (taker && !taker.sentOff && !taker.ragdoll && rd.run) {
            const prog = this.advanceTo(taker, rd.x, rd.z, t, rd.run);
            taker.state = "Positioning";
            // Fase 3: un tiro libre que va al área espera (máx. 7 s) a que los atacantes ocupen sus posiciones antes de cobrarse
            if (prog >= 1 && (rd.p3mode !== "cross" || rd.p3ready || this.elapsed - rd.since > 10)) {
              // v15 (pedido explícito): antes se sacaba apenas el cobrador llegaba a la pelota,
              // así hubiera un rival encima — ahora en saque de banda y tiro libre lejos del arco
              // se espera (con un tope de 3.5s para no trabar el partido) a que el rival respete
              // los 9.15m.
              const needsSpace = rd.kind === "throwin" || rd.kind === null;
              rd.retreatSince == null && (rd.retreatSince = this.elapsed);
              const clear = needsSpace
                ? this.enforceRestartDistance(rd, t)
                : !0;
              if (clear || this.elapsed - rd.retreatSince > 3.5)
                ((taker.vx = taker.vz = 0),
                // v15 (pedido explícito): la pelota "nueva" recién aparece en el punto de reinicio
                // en este instante — antes se colocaba ahí desde el principio del reinicio.
                (this.ball.x = rd.x),
                (this.ball.z = rd.z),
                (this.ball.y = 0.13),
                (this.ball.vx = this.ball.vz = this.ball.vy = 0),
                rd.kind === "throwin"
                  ? this.throwIn(taker, rd.team)
                  : (this.possession(taker),
                    // Fase 3: el cobrador de una pelota parada NO puede salir jugando con el balón (Ley 13/16): su cerebro cambia
                    // a modo "pelota parada" (sólo pase/tiro/centro/despeje) hasta que la juega. Ver p3SetPieceFilter.
                    (taker.spTaker = { kind: rd.kind || "freekick", until: this.elapsed + 8, x: rd.x, z: rd.z, direct: !!rd.direct }),
                    (this.phase = "playing"),
                    // Reglamento FIFA (Ley 11): no hay offside directo de un saque de arco — el
                    // primer pase del arquero tras la reposición queda exento (igual que ya se
                    // hizo con el córner corto y el saque de banda).
                    rd.kind === "goalkick" && (taker.offsideExempt = !0),
                    // FASE F — TIRO LIBRE INDIRECTO/LEJANO (spec #18): un tiro libre que no entra
                    // en la secuencia cinemática de disparo directo (beginFreeKick) igual puede
                    // pedir "centro" en vez de una jugada cualquiera cuando cae en una zona ancha y
                    // peligrosa — la primera decisión del cobrador se inclina hacia el centro sin
                    // forzarlo si no hay opción real.
                    rd.kind == null && this.setPieceCrossBias(taker, rd)));
            }
          } else {
            const fb = this.players.find(
              (p) => p.team === rd.team && !p.sentOff,
            );
            fb && (this.possession(fb), (this.phase = "playing"));
          }
          return;
        }
        this.tlCornerRoam && this.tlCornerRoam(t);
        if (this.phase === "goal") {
          this.tlGoalTick && this.tlGoalTick(t);
          // Pedido explícito: que la pelota no quede estática al entrar el gol — sigue su
          // recorrido (gravedad/pique/roce) en vez de congelarse justo en la línea. No hay malla
          // de red modelada, así que se la frena con un límite blando detrás del arco para que no
          // atraviese todo el fondo de la cancha.
          this.coastBall(t);
          // Red modelada como caja: fondo a 2,2 m de la línea, paños laterales en los palos y techo a 2,44 m; la pelota rebota y muere adentro.
          const bl = this.ball, gx = DM.sign(bl.x) * 52.5, inNet = DM.abs(bl.x) > 52.5 && DM.abs(bl.z) < 3.9;
          if (inNet) {
            const back = 52.5 + 2.2 - 0.14;
            if (DM.abs(bl.x) > back) { bl.x = DM.sign(bl.x) * back; bl.vx *= -0.18; }
            if (DM.abs(bl.z) > 3.66 - 0.12) { bl.z = DM.sign(bl.z) * (3.66 - 0.12); bl.vz *= -0.25; }
            if (bl.y > 2.44 - 0.12) { bl.y = 2.44 - 0.12; bl.vy = -DM.abs(bl.vy) * 0.2; }
          } else if (DM.abs(bl.x) > 55.5) { bl.x = DM.sign(bl.x) * 55.5; bl.vx = 0; }
        }
        if (((this.wait -= t), this.wait <= 0))
          if (this.phase === "restart") {
            const { team: e, x: n, z: s } = this.restartData,
              elig = this.players.filter(
                (a) => a.team === e && !a.sentOff && !a.ragdoll,
              ),
              r = (
                elig.length
                  ? elig
                  : this.players.filter((a) => a.team === e && !a.sentOff)
              ).sort(
                (a, o) =>
                  DM.hypot(a.x - n, a.z - s) - DM.hypot(o.x - n, o.z - s),
              )[0];
            ((r.x = n),
              (r.z = s),
              (this.ball = {
                x: n + this.direction(e) * 0.7,
                z: s,
                y: 0.13,
                vx: 0,
                vz: 0,
                vy: 0,
                spin: 0,
              }));
            return this.takeCorner(r, e, n, s);
          } else this.kickoff(this.nextKickoff ?? 1);
        return;
      }
      this.time += t * 15;
      if (this.periodCheck(false)) return;
      (this.owner && (this.stats[this.owner.team].possession += t),
        this.checkSubs(),
        this.updateLiveTactics(t),
        this.updatePlayers(t),
        this.gkBubble(t),
        this.updateBall(t),
        this.sampleTelemetry());
      // Triggers (spec #7): evaluación liviana, no por frame — cada ~4s. Sólo autoaplican para el
      // equipo que tenga `autoTactics` activo (por defecto el rival/CPU — team 1 — para que
      // responda solo; el equipo que maneja el usuario via el panel TACTICS queda en manual salvo
      // que active el asistente, así ningún trigger le pisa una decisión propia sin avisar).
      if (this.elapsed - (this._lastTriggerCheck ?? -9) > 4) {
        this._lastTriggerCheck = this.elapsed;
        for (let team = 0; team < 2; team++)
          this.teams[team].autoTactics && this.evaluateTriggers(team);
      }
      // v10: se retira la "LECTURA DEL PARTIDO" (comentario de color genérico cada 42-75s) — el
      // broadcast ahora sólo informa hechos del partido (faltas, tarjetas, offside, goles...).
    }
  }
  // FASE F — telemetría de forma de equipo (spec #22): muestreo liviano y espaciado (~1.5s, no
  // por frame — spec #23) de ancho/línea/canal de ataque/touches por tercio. Sólo debug, no
  // afecta marcador ni IA; arrays acotados para no crecer sin límite en partidos largos.
  sampleTelemetry() {
    if (this.elapsed - this._lastTelemetrySample < 1.5) return;
    this._lastTelemetrySample = this.elapsed;
    for (let team = 0; team < 2; team++) {
      const mine = this.players.filter(
        (p) => p.team === team && p.role !== "GK" && !p.sentOff,
      );
      if (!mine.length) continue;
      const dir = this.direction(team),
        xs = mine.map((p) => p.x * dir),
        zs = mine.map((p) => p.z),
        width = DM.max(...zs) - DM.min(...zs),
        line = xs.reduce((a, v) => a + v, 0) / xs.length,
        st = this.stats[team];
      (st.widthSamples.push(width),
        st.lineSamples.push(line),
        st.widthSamples.length > 200 && st.widthSamples.shift(),
        st.lineSamples.length > 200 && st.lineSamples.shift());
    }
    if (this.owner) {
      const p = this.owner,
        dir = this.direction(p.team),
        adv = p.x * dir,
        zone = adv < -17.5 ? "def" : adv < 17.5 ? "mid" : "att",
        channel = p.z < -8.83 ? "left" : p.z > 8.83 ? "right" : "center";
      (this.stats[p.team].touchesByZone[zone]++,
        adv > 17.5 && this.stats[p.team].attacksByChannel[channel]++);
    }
  }
  // v9 Fase 4: clasifica el estado actual del partido a partir de datos ya existentes (momentum,
  // excitement, posesión, marcador, minuto) — no guioniza nada, sólo resume condiciones.
  matchState() {
    const diff = DM.abs(this.score[0] - this.score[1]),
      lateGame = this.time / 60 > 75,
      m0 = this.momentum(0),
      dom = DM.max(DM.abs(m0), DM.abs(this.momentum(1))),
      totalPoss = this.stats[0].possession + this.stats[1].possession,
      possSkew = totalPoss
        ? DM.abs(this.stats[0].possession - this.stats[1].possession) /
          totalPoss
        : 0;
    if (this.excitement > 78 && dom < 0.15) return "CHAOTIC";
    if (lateGame && diff >= 1 && diff <= 2) return "LATE_PRESSURE";
    if (dom > 0.22) return "ONE_SIDED";
    if (this.excitement > 55) return "INTENSE";
    if (possSkew > 0.3 && this.excitement < 35) return "CONTROLLED";
    if (this.excitement < 22) return "DEFENSIVE_STANDOFF";
    return "OPEN";
  }
  narrate() {
    ((this.lastNarrative = this.elapsed),
      (this.nextNarrativeGap = this.range(42, 75)));
    if (!this.started || this.ended || this.phase !== "playing") return;
    const state = this.matchState(),
      m0 = this.momentum(0),
      dom = m0 > 0.12 ? 0 : m0 < -0.12 ? 1 : null,
      domName = dom !== null ? this.teams[dom].name : null,
      bank = {
        CHAOTIC: [
          "El partido se rompe: ida y vuelta sin ningún control.",
          "Nadie logra hilar dos pases seguidos — puro caos arriba y abajo.",
        ],
        LATE_PRESSURE: [
          domName
            ? `${domName} tira todo hacia adelante buscando el resultado.`
            : "Los minutos finales aprietan a los dos equipos.",
        ],
        ONE_SIDED: [
          domName
            ? `${domName} está dominando por completo.`
            : "Un equipo maneja claramente el partido.",
        ],
        INTENSE: [
          "El ritmo del partido no da respiro.",
          "Ida y vuelta constante — el marcador puede moverse en cualquier momento.",
        ],
        CONTROLLED: [
          domName
            ? `${domName} controla la posesión sin sobresaltos.`
            : "El partido se juega a un ritmo tranquilo.",
        ],
        DEFENSIVE_STANDOFF: [
          "Ninguno de los dos quiere arriesgar — partido trabado en el medio.",
          "Los centrales mandan: pocos espacios para atacar.",
        ],
        OPEN: [
          "Partido parejo, mano a mano.",
          "Cualquiera de los dos se lo puede llevar.",
        ],
      },
      opts = bank[state] || bank.OPEN;
    this.event(
      "narrative",
      "LECTURA DEL PARTIDO",
      opts[DM.floor(this.random() * opts.length)],
      null,
    );
  }
  // Cierra el partido. Si sigue igualado queda marcado (finalTie) para que la copa o el laboratorio definan por penales.
  finishMatch(at) {
    ((this.time = at), (this.running = !1), (this.ended = !0), (this.phase = "ended"));
    this.finalTie = this.score[0] === this.score[1];
    this.event("fulltime", "FINAL DEL PARTIDO", `${this.teams[0].name} ${this.score[0]} — ${this.score[1]} ${this.teams[1].name}`);
  }
  // Salta a la prórroga: 2 × 15′ (también sirve para probarla a mano desde el laboratorio, con cualquier marcador).
  startExtraTime(base) {
    const at = base != null ? base : 5400;
    ((this.ended = !1), (this.running = !0), (this.finalTie = !1), (this.time = at), (this.etBase = at), (this.half = 3), (this.phase = "halftime"), (this.wait = 3), (this.nextKickoff = 0), (this.counterUntil = [0, 0]), (this.owner = null), (this.receiver = null));
    this.players.forEach((pl) => { pl.sentOff || (pl.stamina = DM.min(100, pl.stamina + 10)); });
    this.event("halftime", "PRÓRROGA", "Se juegan dos tiempos de 15 minutos");
  }
  // ---- TANDA DE PENALES (todo en el motor: un solo arco, 22 jugadores, resultado determinista) ----
  // Cada penal: los dos equipos se ubican en el círculo central, el cobrador y el arquero quedan solos, 10 s de espera,
  // remate con la física normal y, cuando el resultado es claro (gol / atajada / palo / afuera), la escena se congela
  // (phase "so_result") hasta que quien maneja la presentación llama soAdvance() (repetición y siguiente cobrador).
  soKicker(t) {
    const done = this.so.kicks[t].length,
      rate = (p) => p.stats.shooting * 0.6 + p.personality.composure * 0.4,
      pool = this.players.filter((p) => p.team === t && !p.sentOff),
      ord = pool.filter((p) => p.role !== "GK").sort((a, b) => rate(b) - rate(a)).concat(pool.filter((p) => p.role === "GK"));
    return ord[done % ord.length];
  }
  startShootout(first) {
    if (this.so) return;
    const f = first != null ? first : this.random() < 0.5 ? 0 : 1;
    this.so = { score: [0, 0], kicks: [[], []], n: 0, first: f, saved: this.score.slice(), time0: this.time, half0: this.half, res: null, kickAt: null, cur: null, winner: null };
    ((this.ended = !1), (this.running = !0), (this.finalTie = !1), (this.shootout = null), (this.owner = null), (this.receiver = null), (this.shot = null));
    this.event("shootout", "TANDA DE PENALES", `Patea primero ${this.teams[f].name}`, f);
    this.onShootout && this.onShootout("start", this.so);
    this.soNext();
  }
  soNext() {
    const so = this.so,
      t = so.n % 2 === 0 ? so.first : 1 - so.first,
      e = 1 - t,
      taker = this.soKicker(t),
      gk = this.players.find((p) => p.team === e && p.role === "GK");
    so.cur = { team: t, taker: taker.id, gk: gk ? gk.id : null, idx: so.kicks[t].length, n: so.n };
    ((so.res = null), (so.kickAt = null));
    // El arco es siempre el mismo (el de la izquierda): direction(e) = +1 para el equipo que defiende.
    this.half = e === 0 ? 3 : 4;
    ((this.score = so.saved.slice()), (this.time = so.time0));
    this.players.forEach((p) => {
      ((p.tlFrozen = 0), (p.ragdoll = null), (p.dive = 0), (p.penaltyRetreatTarget = null));
    });
    ((this.owner = null), (this.receiver = null), (this.shot = null), (this.ended = !1), (this.running = !0));
    this.awardPenalty(t, e, { shootout: !0, taker, hold: 10 });
    this.onShootout && this.onShootout("next", so.cur);
  }
  soStep(t) {
    const so = this.so;
    if (this.phase === "penalty") {
      this.advancePenalty(t);
      if (this.phase === "playing") {
        so.kickAt = this.elapsed;
        for (const p of this.players) p.id !== so.cur.gk && (p.tlFrozen = this.elapsed + 999);
        this.onShootout && this.onShootout("kick", so.cur);
      }
      return !0;
    }
    if (so.res) return (this.coastBall(t), !0);
    if (so.kickAt == null) return !0;
    this.updatePlayers(t);
    this.updateBall(t);
    if (!so.res) {
      const ev = this.events.find((x) => x.at >= so.kickAt - 0.02 && (x.type === "save" || x.type === "post"));
      if (ev) this.soResult(ev.type === "post" ? "post" : "save");
      else if (this.phase === "restart" || this.elapsed - so.kickAt > 5) this.soResult("miss");
    }
    return !0;
  }
  soResult(kind) {
    const so = this.so;
    if (!so || so.res) return;
    ((so.res = kind), (so.resAt = this.elapsed), (this.phase = "so_result"), (this.shot = null));
    kind === "goal" && ((this.ball.vx *= 0.55), (this.ball.vz *= 0.55), (this.owner = null));
    this.onShootout && this.onShootout("result", so.cur, kind);
  }
  soDecided() {
    const k = this.so.kicks, sc = this.so.score, a = k[0].length, b = k[1].length;
    if (a <= 5 && b <= 5) {
      if (sc[0] > sc[1] + (5 - b)) return 0;
      if (sc[1] > sc[0] + (5 - a)) return 1;
      return null;
    }
    return a === b && sc[0] !== sc[1] ? (sc[0] > sc[1] ? 0 : 1) : null;
  }
  // Registra el penal recién resuelto y pasa al siguiente cobrador (o termina la tanda). Devuelve "next" | "end".
  soAdvance() {
    const so = this.so;
    if (!so || !so.res) return null;
    const t = so.cur.team, ok = so.res === "goal";
    so.kicks[t].push(ok);
    ok && so.score[t]++;
    so.n++;
    const w = this.soDecided();
    if (w != null) return (this.soFinish(w), "end");
    this.soNext();
    return "next";
  }
  soFinish(w) {
    const so = this.so;
    this.shootout = { score: so.score.slice(), winner: w, kicks: so.kicks.map((k) => k.slice()), first: so.first };
    ((this.score = so.saved.slice()), (this.time = so.time0), (this.half = so.half0));
    this.players.forEach((p) => ((p.tlFrozen = 0), (p.penaltyRetreatTarget = null)));
    this.so = null;
    ((this.running = !1), (this.ended = !0), (this.phase = "ended"), (this.finalTie = !1));
    this.onShootout && this.onShootout("end", this.shootout);
    this.event("fulltime", "FINAL DEL PARTIDO", `${this.teams[0].name} ${this.score[0]} — ${this.score[1]} ${this.teams[1].name} · ${this.teams[w].name} gana por penales (${this.shootout.score[0]}–${this.shootout.score[1]})`);
  }
  // Tanda completa sin presentación (para simulación y pruebas): devuelve el resultado.
  simulateShootout(first) {
    this.startShootout(first);
    let guard = 0;
    while (this.so && guard++ < 60 * 40 * 60) {
      this.step(1 / 60);
      this.so && this.so.res && this.soAdvance();
    }
    return this.shootout;
  }
  // Fin de cada tiempo (45′ + descuento; 15′ de prórroga): NUNCA se corta con la pelota en juego. Cumplido el tiempo, se espera a que la pelota salga
  // (`dead` = pelota fuera / reanudación); un córner sí se juega (última jugada) y recién termina en el siguiente balón muerto. Sin balón muerto,
  // el salvavidas de `slack` segundos de reloj (~2 min reales) evita un tiempo infinito. Devuelve true si cambió de fase.
  periodCheck(dead) {
    if (this.stopClock == null) this.stopClock = [0, 0];
    if (this.injuryTime == null) this.injuryTime = [0, 0];
    const stop = !!dead && !(this.restartData && this.restartData.kind === "corner"), slack = 1800;
    if (this.stopClock == null) this.stopClock = [0, 0];
    if (this.injuryTime == null) this.injuryTime = [0, 0];
    // Tiempo de descuento (pedido explícito): la mitad/el partido no corta justo a los 45/90
    // minutos de reloj — se le suma lo perdido en faltas/tarjetas/cambios/lesiones (acumulado en
    // this.stopClock vía event()), y aun llegado ese target el juego sigue con normalidad hasta
    // que la pelota se va afuera (phase="restart"); recién ahí se corta, nunca a mitad de jugada.
    // El tope de +400 es sólo un salvavidas por si nunca hay una detención natural.
    if (this.half === 1) {
      const added1 = DM.min(600, DM.round(this.stopClock[0] / 60) * 60),
        target1 = 2700 + added1;
      if (this.time >= target1) {
        this.injuryTime[0] = DM.round(added1 / 60);
        if (stop || this.time >= target1 + slack) {
          ((this.time = target1),
            (this.half = 2),
            (this.phase = "halftime"),
            (this.wait = 4),
            (this.nextKickoff = 1),
            (this.counterUntil = [0, 0]),
            this.players.forEach((pl) => {
              pl.sentOff || (pl.stamina = DM.min(100, pl.stamina + 18));
            }),
            (this.stopClock[1] = 0),
            this.event("halftime", "Descanso", this.injuryTime[0] ? `Los equipos cambian de campo (45+${this.injuryTime[0]}′)` : "Los equipos cambian de campo"));
          return true;
        }
      }
    }
    if (this.half === 2) {
      const added2 = DM.min(600, DM.round(this.stopClock[1] / 60) * 60),
        target2 = 5400 + added2;
      if (this.time >= target2) {
        this.injuryTime[1] = DM.round(added2 / 60);
        if (stop || this.time >= target2 + slack) {
          // Copa / laboratorio: si termina igualado y el partido pide prórroga, se juegan 2 tiempos de 15′.
          if (this.tieBreak && this.tieBreak.et && this.score[0] === this.score[1]) { this.startExtraTime(target2); return true; }
          this.finishMatch(target2);
          return true;
        }
      }
    }
    // Prórroga: dos tiempos de 15 minutos sin tiempo agregado (etBase = reloj al terminar los 90′ + descuento).
    if (this.half === 3 && this.time >= this.etBase + 900 && (stop || this.time >= this.etBase + 900 + slack)) {
      ((this.time = this.etBase + 900), (this.half = 4), (this.phase = "halftime"), (this.wait = 3), (this.nextKickoff = 1), (this.counterUntil = [0, 0]));
      this.event("halftime", "Fin del primer tiempo de la prórroga", "Los equipos cambian de campo");
      return true;
    }
    if (this.half === 4 && this.time >= this.etBase + 1800 && (stop || this.time >= this.etBase + 1800 + slack)) {
      this.finishMatch(this.etBase + 1800);
      return true;
    }
    return false;
  }
  periodLabel() {
    return this.so ? "PENALES" : this.ended ? "FINAL" : this.phase === "halftime" ? (this.half >= 3 ? "PRÓRROGA" : "DESCANSO") : this.started ? (this.half >= 3 ? `PRÓRROGA ${this.half - 2}` : `${this.half}º TIEMPO`) : "PREVIA";
  }
  clock() {
    const t = DM.floor(this.time / 60),
      e = DM.floor(this.time % 60);
    return `${String(t).padStart(2, "0")}:${String(e).padStart(2, "0")}`;
  }
}
// <<AI2_BEGIN>>
// ============================================================================================
// FÚTBOL IA 2.0 — capa cognitiva local (sin LLM, determinista vía this.random()).
// Se monta como mixin sobre wc.prototype (ver marcas "AI2" en el motor). Es la única autoridad de
// decisión: `decide()`/posicionamiento sin balón llaman directo a ai2Select/ai2PositionAttack/
// ai2PositionDefend, sin un camino legado alternativo (el arnés de comparación ai2/bench.mjs que
// motivó el flag `ai2Enabled` original no forma parte de este repositorio). `match.ai2Enabled` se
// conserva como bandera de sólo lectura para el HUD de debug.
//   1 TEAM BRAIN ............ ai2Brain (histéresis de fase / presión alta), teamTactics()
//   2 ATTACK COORDINATOR .... ai2CoordAttack   (BALL_CARRIER/SUPPORT/WIDTH/DEPTH/RUNNER/FIXER/...)
//   3 DEFENSE COORDINATOR ... ai2CoordDefense  (PRESSER/COVER/LANE_BLOCK/MARK/SCREEN/BALANCE/DROP)
//   4 INDIVIDUAL BRAIN ...... ai2Perceive + ai2Candidates + ai2Select (racionalidad limitada)
//   5 EXECUTION LAYER ....... ai2ExecQuality (error de ejecución ≠ error de decisión)
//   + pitch control cacheado (ai2UpdatePitch), valor del espacio, generación/ocupación de espacio,
//     posicionamiento sin balón por candidatos (ai2PositionOffball), memoria/forma, telemetría, debug.
// ============================================================================================
const ai2Sat = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const ai2Clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const ai2Hash = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = DM.imul(h ^ str.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
};
const AI2_TELE_KEYS = [
  "shots_total", "long_shots", "speculative_shots", "passes_total", "risky_passes", "through_balls",
  "decision_errors", "execution_errors", "heavy_touches", "failed_dribbles", "successful_dribbles",
  "interceptions", "space_generation_events", "successful_space_generation_events", "offside_events",
  "bad_press_events", "missed_marks", "late_reactions", "lucky_actions",
  // extras útiles para calibrar (no piden en el spec pero explican los números de arriba)
  "decision_errors_good_exec", "exec_errors_good_decision", "assumed_cover_events", "goals_from_far",
  "decisions_total", "cross_attempts", "backpasses", "first_time_actions", "hesitations",
];
const AI2_CFG = {
  pcHz: 12, // frecuencia del mapa de control (10–20 Hz)
  brainHz: 3, // frecuencia del cerebro colectivo (2–4 Hz)
  gx: 24,
  gz: 16,
};

Object.assign(wc.prototype, {
  // ------------------------------------------------------------------ estado / init
  ai2Reset() {
    // AI2 es la única autoridad de decisión del motor (no queda ningún camino legado que este flag
    // pudiera desactivar) — se mantiene sólo como bandera de sólo lectura para el HUD de debug.
    this.ai2Enabled = true;
    this.aiTele = [0, 1].map(() => {
      const o = {};
      for (const k of AI2_TELE_KEYS) o[k] = 0;
      return o;
    });
    this.pc = this.ai2MakeGrid();
    this.brain = [0, 1].map(() => ({
      hasBall: false, sig: 0.5, since: -9, phaseDetail: "settled_defense", highPress: false,
      pressScore: 0.5, pressSince: -9, objective: "control", lowSince: -9, highSince: -9,
    }));
    this._aiShot = null;
    this._aiHoles = [];
    this._aiClock = { pc: 0, last: [-9, -8.83] };
    this.aiRoles = [{}, {}]; // rol asignado por jugador (debug/coordinación) por equipo
    for (const p of this.players) this.ai2InitPlayer(p);
    for (const side of this.bench || []) for (const p of side) this.ai2InitPlayer(p);
  },
  // Rasgos internos derivados (spec #17): no reemplazan aggression/composure/... — los complementan.
  // `quirk` es una firma individual determinista (hash del nombre) para que dos jugadores con los
  // mismos números puedan comportarse distinto sin gastar RNG (spec #19).
  ai2InitPlayer(p) {
    if (!p || !p.stats || !p.personality) return;
    const s = p.stats,
      ps = p.personality,
      seed = `${p.name}|${p.number}|${p.role}`,
      qa = ai2Hash(seed + "a") * 2 - 1,
      qb = ai2Hash(seed + "b") * 2 - 1,
      qc = ai2Hash(seed + "c") * 2 - 1,
      cr = ps.creativity / 100, ag = ps.aggression / 100, co = ps.composure / 100,
      di = ps.discipline / 100, cn = ps.consistency / 100, it = s.intelligence / 100;
    const old = p.ai;
    const fh = ai2Hash(seed + "foot"),
      pref = p.preferredFoot === "Izquierdo" ? "L" : p.preferredFoot === "Ambos" ? "B" : p.preferredFoot === "Derecho" ? "R" : fh < 0.68 ? "R" : fh < 0.9 ? "L" : "B";
    p.ai = {
      boldness: ai2Clamp(0.5 * ag + 0.35 * cr + 0.15 * (1 - cn) + qa * 0.12, 0, 1),
      patience: ai2Clamp(0.4 * co + 0.3 * di + 0.3 * cn + qb * 0.1, 0, 1),
      spontaneity: ai2Clamp(0.6 * cr + 0.25 * (1 - cn) + 0.15 * ag + qc * 0.12, 0, 1),
      anticipation: this.anticipation(p) / 100,
      tacticalDiscipline: ai2Clamp(0.6 * di + 0.4 * it, 0, 1),
      cog: this.ai2CognitiveProfile(p),
      riskMemory: old ? old.riskMemory : 0,
      quirk: { shoot: qa * 0.05, pass: qb * 0.05, dribble: qc * 0.05 },
      foot: pref,
      res: null,
      role: old ? old.role : null, roleAt: old ? old.roleAt : -9, roleTag: null,
      dintent: null, posKind: "anchor", posAt: -9, tx: p.x || 0, tz: p.z || 0, nextEval: (p.id || 0) * 0.045,
      err: null, errCooldown: 0, slowUntil: 0, reactUntil: 0,
      touchBias: null, lastShotMissAt: -99, dbg: null, lastExec: null, marker: null,
      perc: null, tele: {}, pvx: 0, pvz: 0, lastDecisionAt: -9,
    };
    p.ai.res = this.ai2Repertoire(p);
  },
  // CognitiveProfile (prompt Fase 2, Paso 1): facetas cognitivas derivadas de los atributos reales
  // del jugador — NO son atributos nuevos visibles, NO usan overall como "inteligencia" (spec Fase 2).
  // El motor ya tenía piezas de esto dispersas (boldness/patience/spontaneity/anticipation arriba,
  // más el cálculo de `conf` inline dentro de ai2Perceive): esta función las consolida en un único
  // objeto nombrado y agrega las facetas que todavía no existían (vision, decisionQuality,
  // riskAssessment, concentration, spatialUnderstanding, decisionHorizon) para que las próximas
  // etapas (percepción, generación de candidatos, selección) puedan leerlas de un solo lugar en vez
  // de recalcular combinaciones de stats/personality ad-hoc en cada función. Sólo hay UN stat
  // cognitivo real (`intelligence`); las facetas distintas emergen de ponderar ese stat junto con
  // composure/consistency/discipline/creativity/aggression de forma distinta según lo que modelan
  // conceptualmente, no de inventar atributos nuevos.
  ai2CognitiveProfile(p) {
    const s = p.stats, ps = p.personality,
      it = s.intelligence / 100, cr = ps.creativity / 100, co = ps.composure / 100,
      cn = ps.consistency / 100, di = ps.discipline / 100, ag = ps.aggression / 100;
    const decisionQuality = ai2Clamp(0.6 * it + 0.4 * cn, 0, 1);
    return {
      // qué tan bien detecta lo que ocurre alrededor (usado hoy como `conf` dentro de ai2Perceive)
      perception: ai2Clamp(0.55 * it + 0.25 * co + 0.2 * cn, 0, 1),
      // cuántas alternativas es capaz de identificar (no cuántas ejecuta bien)
      vision: ai2Clamp(0.5 * it + 0.5 * cr, 0, 1),
      // predicción de trayectorias/carreras — reutiliza anticipation() existente, no se duplica
      anticipation: this.anticipation(p) / 100,
      // elige la mejor opción entre las que comprendió (separado de qué tan bien la ejecuta después)
      decisionQuality,
      // calibración de riesgo: cuánto entiende cuándo vale la pena arriesgar (≠ boldness, que es apetito)
      riskAssessment: ai2Clamp(0.4 * co + 0.35 * di + 0.25 * cn, 0, 1),
      composure: co,
      // estabilidad frente a lapsos/errores puntuales
      concentration: ai2Clamp(0.6 * cn + 0.4 * co, 0, 1),
      spatialUnderstanding: ai2Clamp(0.6 * it + 0.4 * di, 0, 1),
      creativity: cr,
      // cuánto futuro considera antes de decidir (Fase 6), en segundos, escala continua
      decisionHorizon: te(0.4 + decisionQuality * 1.4, 0.4, 1.8),
    };
  },
  // Biblioteca de recursos (spec #5): afinidad 0..1 por recurso, derivada de atributos/rasgos/estilo.
  // Afinidad = qué tan probable es que el jugador CONSIDERE ese recurso (no que lo ejecute siempre).
  ai2Repertoire(p) {
    const s = p.stats, ps = p.personality, cr = ps.creativity / 100, cn = ps.consistency / 100,
      sh = s.shooting / 100, pa = s.passing / 100, dr = s.dribbling / 100, it = s.intelligence / 100,
      T = (k) => (this.hasTrait(p, k) ? 1 : 0), fw = p.role === "FWD", mid = p.role === "MID",
      gk = p.role === "GK";
    return {
      longShot: gk ? 0 : ai2Clamp(0.06 + T("Long Shot") * 0.55 + (sh - 0.62) * 0.9 + (cr - 0.45) * 0.25 + (mid ? 0.06 : 0), 0.02, 1),
      throughBall: ai2Clamp(0.25 + T("Through Ball Specialist") * 0.45 + (pa - 0.62) * 0.7 + (cr - 0.45) * 0.4 + (it - 0.7) * 0.3, 0.05, 1),
      switchPlay: ai2Clamp(0.25 + (pa - 0.62) * 0.9 + (it - 0.7) * 0.3 + (mid ? 0.1 : 0), 0.05, 1),
      earlyCross: ai2Clamp(0.25 + (p.style === "Winger" || p.style === "Overlapping Fullback" ? 0.35 : 0) + (pa - 0.6) * 0.5, 0.05, 1),
      lob: ai2Clamp(0.1 + T("Finesse Shot") * 0.3 + (cr - 0.5) * 0.5 + (sh - 0.65) * 0.4, 0.03, 1),
      trivela: ai2Clamp(T("Trivela") * 0.7 + T("Flair") * 0.2 + (cr - 0.6) * 0.3, 0, 1),
      heel: ai2Clamp(T("Flair") * 0.5 + T("Acrobat") * 0.2 + (cr - 0.65) * 0.9 + (dr - 0.75) * 0.5, 0, 1),
      trick: ai2Clamp(T("Technical Dribbler") * 0.4 + T("Quick Dribbler") * 0.3 + T("Flair") * 0.2 + (dr - 0.65) * 0.7 + (cr - 0.5) * 0.3, 0.05, 1),
      volley: ai2Clamp(0.2 + (sh - 0.68) * 0.9 + T("Power Shot") * 0.2, 0.05, 1),
      oneTouch: ai2Clamp(0.25 + T("One-Touch Pass") * 0.5 + (it - 0.7) * 0.7, 0.05, 1),
      carry: ai2Clamp(0.3 + T("Rapid") * 0.25 + T("Quick Dribbler") * 0.25 + (dr - 0.65) * 0.5, 0.05, 1),
    };
  },
  ai2Res(p, key) {
    return p.ai && p.ai.res ? p.ai.res[key] || 0 : 0.3;
  },
  // ------------------------------------------------------------------ helpers RNG / telemetría
  ai2Gauss() {
    return (this.random() + this.random() + this.random() - 1.5) * 2;
  },
  ai2Count(p, key, n = 1) {
    if (!this.aiTele || !p) return;
    const tm = this.aiTele[p.team];
    tm[key] = (tm[key] || 0) + n;
    if (p.ai) p.ai.tele[key] = (p.ai.tele[key] || 0) + n;
  },
  ai2CountTeam(team, key, n = 1) {
    if (this.aiTele) this.aiTele[team][key] = (this.aiTele[team][key] || 0) + n;
  },
  aiSummary() {
    const out = {};
    for (const k of AI2_TELE_KEYS) out[k] = this.aiTele[0][k] + this.aiTele[1][k];
    return out;
  },
  // ------------------------------------------------------------------ memoria / forma (spec #18)
  // Estado de "forma" emergente de la memoria ya existente (confidence/pressureMemory/mistakes...).
  ai2Form(p) {
    const m = p.memory;
    if (!m) return "NEUTRAL";
    const conf = (m.confidence - 50) / 50, pm = m.pressureMemory / 60;
    if (m.recentMistakes >= 3.2 && conf < -0.3) return "SHAKEN";
    if (pm > 0.55) return "UNDER_PRESSURE";
    if (m.recentMistakes >= 2 && conf < -0.12) return "FRUSTRATED";
    if (conf > 0.42 && m.recentSuccesses >= 2) return "IN_FORM";
    if (conf > 0.18) return "CONFIDENT";
    if (conf < -0.2) return "CAUTIOUS";
    return "NEUTRAL";
  },
  // Sesgo pequeño y temporal (spec #18): {risk: +valentía/-cautela, temp: dudas}. Nunca extremo.
  ai2Bias(p) {
    const form = this.ai2Form(p), ai = p.ai, bold = ai ? ai.boldness : 0.5;
    let risk = 0, temp = 0;
    if (form === "CONFIDENT") risk = 0.03;
    else if (form === "IN_FORM") { risk = 0.06; temp = -0.01; }
    else if (form === "CAUTIOUS") { risk = -0.04; temp = 0.01; }
    else if (form === "SHAKEN") { risk = -0.07; temp = 0.03; }
    else if (form === "FRUSTRATED") { risk = bold > 0.55 ? 0.05 : -0.04; temp = 0.015; }
    else if (form === "UNDER_PRESSURE") { risk = -0.02; temp = 0.03; }
    let retry = 0;
    if (ai && this.elapsed - ai.lastShotMissAt < 25)
      retry = bold > 0.58 ? 0.05 : bold < 0.4 ? -0.06 : 0;
    if (ai) risk -= ai.riskMemory * 0.25;
    return { form, risk, temp, retry };
  },
  // Resultado de una acción → memoria (spec #18): sesgos chicos; se recuperan solos (decay en tick).
  ai2Outcome(p, kind, ok, meta) {
    if (!p || !p.memory) return;
    const m = p.memory, ai = p.ai, risky = !!(meta && meta.risky);
    if (kind === "pass") {
      if (ok) { m.confidence = te(m.confidence + (risky ? 2.2 : 0.7), 15, 90); m.recentSuccesses += risky ? 1 : 0.4; if (ai && risky) ai.riskMemory = DM.max(0, ai.riskMemory - 0.06); }
      else { m.confidence = te(m.confidence - (risky ? 3.2 : 1.6), 15, 90); if (ai && risky) ai.riskMemory = DM.min(0.6, ai.riskMemory + 0.14); m.pressureMemory = DM.min(100, m.pressureMemory + 2); }
    } else if (kind === "shot") {
      if (ok === "goal") { m.confidence = te(m.confidence + 4, 15, 92); if (ai) ai.riskMemory = DM.max(0, ai.riskMemory - 0.1); }
      else { m.confidence = te(m.confidence - (ok === "save" ? 0.6 : 2.4), 15, 90); if (ai) { ai.lastShotMissAt = this.elapsed; if (risky) ai.riskMemory = DM.min(0.6, ai.riskMemory + 0.08); } }
    }
  },
  // Resolución diferida de disparos (para memoria/telemetría "lucky"): se llama cada tick.
  ai2ResolveShot() {
    const s = this._aiShot;
    if (!s) return;
    if (s.result || this.elapsed - s.at > 3.5 || (this.shot == null && this.elapsed - s.at > 0.5)) {
      const res = s.result || "miss";
      if (res !== "goal" && res !== "save") this.ai2Outcome(s.player, "shot", "miss", { risky: s.spec });
      else if (res === "save") this.ai2Outcome(s.player, "shot", "save", { risky: s.spec });
      this._aiShot = null;
    }
  },
  // Decaimiento de los estados propios de la IA 2.0 (riskMemory, etc.).
  ai2DecayPlayer(p, dt) {
    const ai = p.ai;
    if (!ai) return;
    ai.riskMemory *= DM.exp(-0.03 * dt);
    if (ai.touchBias && ai.touchBias.until < this.elapsed) ai.touchBias = null;
  },
});

// ============================== PITCH CONTROL / SPACE VALUE (spec #8–#10) ==============================
// Malla cacheada 24×16 (≈4.4×4.3 m/celda). Se recalcula ~12 Hz para TODO el campo a la vez
// (nunca por jugador por frame). Cada jugador aporta una influencia gaussiana ANISOTRÓPICA:
// más alcance hacia donde corre, menos hacia atrás, radio dependiente de la distancia a la pelota
// (Fernández & Bornn simplificado), penalizada por giros/aceleración lateral, stamina y aturdimiento.
// control(team0) = sigmoid(k·(I0 − I1)) ∈ [0,1] — continuo, no "gana el más cercano".
Object.assign(wc.prototype, {
  ai2MakeGrid() {
    const gx = AI2_CFG.gx, gz = AI2_CFG.gz, n = gx * gz, g = {
      gx, gz, n, cw: 105 / gx, ch: 68 / gz,
      cx: new Float32Array(n), cz: new Float32Array(n),
      I0: new Float32Array(n), I1: new Float32Array(n),
      ctrl: new Float32Array(n), prev: new Float32Array(n).fill(0.5),
      T0: new Float32Array(n), T1: new Float32Array(n), T0b: new Float32Array(n), T1b: new Float32Array(n),
      d0: new Float32Array(n), d1: new Float32Array(n), n0: new Int8Array(n), n1: new Int8Array(n),
      press0: new Float32Array(n), press1: new Float32Array(n),
      base: [new Float32Array(n), new Float32Array(n)], baseKey: -1,
      sv: [new Float32Array(n), new Float32Array(n)],
      acc: new Float32Array(n), accTeam: -1,
      line: [0, 0], pvx: new Float32Array(22), pvz: new Float32Array(22), at: -9,
    };
    for (let j = 0; j < gz; j++)
      for (let i = 0; i < gx; i++) {
        g.cx[j * gx + i] = -52.5 + (i + 0.5) * g.cw;
        g.cz[j * gx + i] = -34 + (j + 0.5) * g.ch;
      }
    return g;
  },
  // Valor geométrico del espacio para un equipo que ataca hacia +x·dir (spec #9). NO es "más cerca del
  // arco = mejor": mezcla proximidad, ángulo de tiro, caja, half-space, progresión y bandas de centro.
  ai2BuildSpaceBase() {
    const g = this.pc;
    for (let team = 0; team < 2; team++) {
      const dir = this.direction(team), b = g.base[team];
      for (let k = 0; k < g.n; k++) {
        const adv = g.cx[k] * dir, dg = DM.max(1.5, 52.5 - adv), z = g.cz[k], wide = DM.abs(z);
        const th = DM.abs(DM.atan((z + 3.66) / dg) - DM.atan((z - 3.66) / dg)),
          prox = DM.exp(-dg / 21),
          shotAngle = dg < 40 ? ai2Sat(th / 0.55) : 0,
          box = dg < 16.5 && wide < 20.2 ? 0.22 : 0,
          half = wide > 7.5 && wide < 16.5 && dg < 38 ? 0.09 : 0,
          crossZone = wide > 21 && dg < 26 && dg > 5 ? 0.06 : 0,
          prog = ai2Sat((adv + 52.5) / 105) * 0.22;
        b[k] = ai2Clamp(0.27 * prox + 0.27 * shotAngle + box + half + crossZone + prog, 0, 1);
      }
    }
    g.baseKey = this.half;
  },
  ai2UpdatePitch(dt) {
    const g = this.pc, ball = this.ball, GX = g.gx, N = g.n;
    if (g.baseKey !== this.half) this.ai2BuildSpaceBase();
    g.prev.set(g.ctrl);
    g.I0.fill(0);
    g.I1.fill(0);
    g.d0.fill(1e6);
    g.d1.fill(1e6);
    // Fase 12 — PITCH CONTROL POR TIEMPO DE LLEGADA (reemplaza las gaussianas/distancia): cada celda guarda el tiempo en que llega
    // el 1º y el 2º jugador de cada equipo (posición, velocidad, aceleración, giro, vmax, fatiga, reacción — mismo modelo que
    // move()/p1ETA). Control = quién llega primero y por cuánto margen; presión/intensidad = cercanía temporal del rival.
    g.T0.fill(99); g.T1.fill(99); g.T0b.fill(99); g.T1b.fill(99);
    const owner = this.owner;
    for (const p of this.players) {
      if (p.sentOff) continue;
      const id = p.id, team = p.team, ax0 = (p.vx - g.pvx[id]);
      g.pvx[id] = p.vx;
      g.pvz[id] = p.vz;
      const Ph = this.p1Phys(p), vm = Ph.vsp * (p.role === "GK" ? 0.92 : 1), ae = Ph.a0 * 0.7, ha = 1 / (2 * ae), dAm = (vm * vm) / (2 * ae), an = p.ai ? p.ai.anticipation : 0.6;
      let react = 0.1 + (1 - an) * 0.22;
      if (p.ragdoll) react += 1.2; else if (p.timer > 0) react += 0.45;
      if (owner === p) react -= 0.1;
      const T = team === 0 ? g.T0 : g.T1, Tb = team === 0 ? g.T0b : g.T1b, D = team === 0 ? g.d0 : g.d1, NI = team === 0 ? g.n0 : g.n1, vx = p.vx, vz = p.vz, aLat = Ph.aLat;
      for (let k = 0; k < N; k++) {
        const dx = g.cx[k] - p.x, dz = g.cz[k] - p.z, r2 = dx * dx + dz * dz;
        if (r2 < D[k]) { D[k] = r2; NI[k] = id; }
        const d = DM.sqrt(r2);
        let eta;
        if (d < 0.05) eta = react * 0.5;
        else {
          // ETA de malla: aceleración constante equivalente (k=0.7·a0, ajustada contra p1ETA exacto: RMSE 0.22 s, bench/eta_fit.mjs);
          // cerrada (sin iteraciones) porque se evalúa 22 jugadores × 384 celdas a 12 Hz.
          const inv = 1 / d, ux = dx * inv, uz = dz * inv, v0 = vx * ux + vz * uz, perp = DM.abs(-vx * uz + vz * ux);
          let t;
          if (v0 >= 0) {
            const al = v0 < vm * 0.98 ? v0 : vm * 0.98, dA = (vm * vm - al * al) * ha;
            t = d <= dA ? (DM.sqrt(al * al + 2 * ae * d) - al) / ae : (vm - al) / ae + (d - dA) / vm;
          } else {
            const dd = d + (v0 * v0) / (2 * ae);
            t = -v0 / ae + (dd <= dAm ? DM.sqrt(2 * ae * dd) / ae : vm / ae + (dd - dAm) / vm);
          }
          eta = react + t + (perp / aLat) * 0.55;
        }
        if (eta < T[k]) { Tb[k] = T[k]; T[k] = eta; } else if (eta < Tb[k]) Tb[k] = eta;
      }
    }
    const l0 = this._aiLineX(0), l1 = this._aiLineX(1);
    g.line[0] = l0; // adv (x·dir) de la 2ª línea rival que enfrenta el equipo 0
    g.line[1] = l1;
    const dir0 = this.direction(0), dir1 = this.direction(1);
    for (let k = 0; k < N; k++) {
      // (constantes calibradas para que las distribuciones de control/presión coincidan con la escala sobre la que están calibrados
      //  los umbrales de AI2 — bench/pc_compare.mjs compara cuantiles contra el mapa gaussiano anterior)
      g.I0[k] = DM.min(1.3, 2 * DM.exp(-(g.T0[k] - 0.7) / 0.7));
      g.I1[k] = DM.min(1.3, 2 * DM.exp(-(g.T1[k] - 0.7) / 0.7));
      const c = 1 / (1 + DM.exp(-(g.T1[k] - g.T0[k]) / 1.3));
      g.ctrl[k] = c;
      g.press0[k] = 1 - DM.exp(-0.9 * g.I1[k]);
      g.press1[k] = 1 - DM.exp(-0.9 * g.I0[k]);
      g.d0[k] = DM.sqrt(g.d0[k]);
      g.d1[k] = DM.sqrt(g.d1[k]);
      // Valor de espacio contextual (spec #9): geometría × libertad × alcanzabilidad × temporalidad
      // (una zona que se está cerrando vale menos: "abierta sólo 1 segundo") + espalda de la defensa.
      const trend = c - g.prev[k];
      for (let team = 0; team < 2; team++) {
        const own = team === 0 ? c : 1 - c, tr = team === 0 ? trend : -trend, dir = team === 0 ? dir0 : dir1;
        const adv = g.cx[k] * dir, ln = g.line[team], depth = adv - ln;
        let v = g.base[team][k] * (0.14 + 0.86 * own) * ai2Clamp(1 + tr * 5, 0.6, 1.2);
        if (depth > -2 && depth < 15 && own > 0.35) v += 0.1 * own * (1 - ai2Sat(depth / 15));
        g.sv[team][k] = ai2Clamp(v, 0, 1);
      }
    }
    g.at = this.elapsed;
    this.ai2UpdateAccess();
  },
  // 2ª línea rival (adv) que enfrenta `team`: referencia de fuera de juego / espalda de la defensa.
  _aiLineX(team) {
    const dir = this.direction(team);
    let a = -99, b = -99;
    for (const p of this.players) {
      if (p.team === team || p.role === "GK" || p.sentOff) continue;
      const v = p.x * dir;
      if (v > a) { b = a; a = v; } else if (v > b) b = v;
    }
    return b === -99 ? 0 : b;
  },
  // passAccessibility (spec #8): ¿llega un pase desde la pelota a cada celda? (carril libre × cercanía × control propio)
  ai2UpdateAccess() {
    const g = this.pc, pt = this.owner ? this.owner.team : this.lastTouch ? this.lastTouch.team : 0, b = this.ball;
    g.accTeam = pt;
    for (let k = 0; k < g.n; k++) {
      const x = g.cx[k], z = g.cz[k], dx = x - b.x, dz = z - b.z, dist = DM.hypot(dx, dz);
      let blocked = 0;
      for (let s = 1; s <= 3; s++) {
        const f = s === 1 ? 0.3 : s === 2 ? 0.55 : 0.8, ix = this.ai2CellIdx(b.x + dx * f, b.z + dz * f),
          oppI = pt === 0 ? g.I1[ix] : g.I0[ix];
        const bl = 1 - DM.exp(-0.9 * oppI);
        if (bl > blocked) blocked = bl;
      }
      const own = pt === 0 ? g.ctrl[k] : 1 - g.ctrl[k];
      g.acc[k] = (1 - blocked) * (0.35 + 0.65 * own) * DM.exp(-dist / 45);
    }
  },
  ai2CellIdx(x, z) {
    const g = this.pc;
    let i = DM.floor((x + 52.5) / g.cw), j = DM.floor((z + 34) / g.ch);
    i = i < 0 ? 0 : i >= g.gx ? g.gx - 1 : i;
    j = j < 0 ? 0 : j >= g.gz ? g.gz - 1 : j;
    return j * g.gx + i;
  },
  // accesores (todos O(1) sobre la malla cacheada)
  pcControl(team, x, z) { const c = this.pc.ctrl[this.ai2CellIdx(x, z)]; return team === 0 ? c : 1 - c; },
  pcSpace(team, x, z) { return this.pc.sv[team][this.ai2CellIdx(x, z)]; },
  pcPress(team, x, z) { const k = this.ai2CellIdx(x, z); return team === 0 ? this.pc.press0[k] : this.pc.press1[k]; },
  pcAccess(x, z) { return this.pc.acc[this.ai2CellIdx(x, z)]; },
  // utilidad real de un espacio = valor × control alcanzable (spec #9: "valor + control + accesibilidad")
  ai2SpaceUtility(team, x, z) {
    const k = this.ai2CellIdx(x, z), g = this.pc, own = team === 0 ? g.ctrl[k] : 1 - g.ctrl[k];
    return g.sv[team][k] * (0.35 + 0.65 * own);
  },
  // ------------------------------------------------------------------ carril de pase (compartido)
  // p = riesgo de bloqueo del carril (0..1); this._lf = distancia libre del rival más cercano al destino.
  ai2LaneRisk(ax, az, bx, bz, list, thru) {
    const l = bx - ax, d = bz - az, h = l * l + d * d || 1, a = DM.sqrt(h);
    let p = 0, f = 20;
    for (let i = 0; i < list.length; i++) {
      const y = list[i];
      f = DM.min(f, DM.hypot(y.x - bx, y.z - bz));
      const b = ai2Clamp(((y.x - ax) * l + (y.z - az) * d) / h, 0, 1);
      if (b < 0.07 || b > 0.97) continue;
      const S = DM.hypot(y.x - (ax + b * l), y.z - (az + b * d)), R = 1.15 + ((b * a) / 24) * 2.2;
      const v = ai2Clamp(1 - S / R, 0, 1);
      if (v > p) p = v;
    }
    this._lf = f;
    return p;
  },
  // ------------------------------------------------------------------ SPACE GENERATION (spec #10)
  // ¿Cuánto espacio útil libera para OTRO compañero si `p` se mueve a (cx,cz) y su marcador lo sigue?
  // Devuelve {gen, hole:{x,z}, marker, beneficiary}. Sólo tiene sentido con marcador cercano.
  ai2SpaceGen(p, cx, cz, marker) {
    if (!marker) return null;
    const team = p.team, dir = this.direction(team);
    const hx = p.x, hz = p.z; // el hueco queda donde el jugador estaba (su marcador se va tras él)
    const moveDist = DM.hypot(cx - p.x, cz - p.z);
    if (moveDist < 3) return null;
    // ¿el marcador acompaña? cuanto más se acerca el destino al balón/línea y más "disciplinado" el rival
    const drag = ai2Clamp(0.35 + marker.stats.defense * 0.003 + (marker.ai ? marker.ai.tacticalDiscipline * 0.2 : 0) - (moveDist < 5 ? 0.15 : 0), 0.15, 0.85);
    const holeVal = this.pc.base[team][this.ai2CellIdx(hx, hz)] * (0.5 + 0.5 * (1 - this.pcControl(team, hx, hz) * 0.4));
    let best = 0, ben = null;
    for (const q of this.players) {
      if (q.team !== team || q.id === p.id || q.role === "GK" || q.sentOff) continue;
      const d = DM.hypot(q.x - hx, q.z - hz);
      if (d > 24) continue;
      const fwdRun = ai2Sat(((hx - q.x) * dir + 6) / 20), spd = ai2Sat((q.stats.speed - 55) / 45);
      const v = holeVal * (1 - d / 24) * (0.45 + 0.55 * spd) * (0.5 + 0.5 * fwdRun) * (q.role === "DEF" ? 0.45 : 1);
      if (v > best) { best = v; ben = q; }
    }
    return { gen: best * drag * 1.6, hole: { x: hx, z: hz }, marker, beneficiary: ben };
  },
  // Registro de eventos de generación de espacio (telemetría + éxito cuando alguien explota el hueco)
  ai2TrackHoles() {
    const holes = this._aiHoles;
    for (let i = holes.length - 1; i >= 0; i--) {
      const h = holes[i], age = this.elapsed - h.at, m = this.players[h.markerId], c = this.players[h.creator];
      if (!h.confirmed && age > 1.1) {
        // ¿Se llevó realmente al marcador? (desplazamiento del rival hacia el creador)
        const moved = DM.hypot(m.x - h.m0.x, m.z - h.m0.z);
        if (moved > 2.0 && DM.hypot(m.x - c.x, m.z - c.z) < 9) {
          h.confirmed = true;
          this.ai2Count(c, "space_generation_events");
        } else { holes.splice(i, 1); continue; }
      }
      if (age > 5.5) { holes.splice(i, 1); continue; }
      if (h.confirmed && !h.success) {
        const b = this.ball, holder = this.owner;
        if (holder && holder.team === h.team && holder.id !== h.creator && DM.hypot(holder.x - h.x, holder.z - h.z) < 11) {
          h.success = true;
          this.ai2Count(c, "successful_space_generation_events");
          holes.splice(i, 1);
        }
      }
    }
  },
});

// ============================== CEREBRO INDIVIDUAL (spec #2–#7, #17, #20–#22) ==============================
Object.assign(wc.prototype, {
  // ------------------------------------------------------------------ presión contextual
  // No es "distancia al rival más cercano": tiempo disponible (distancia + velocidad de cierre),
  // presión espacial del mapa de control, y cuántos rivales cierran a la vez.
  ai2Pressure(t) {
    let tob = 9, n = 0, close = 99, nearest = null;
    for (const q of this.players) {
      if (q.team === t.team || q.role === "GK" || q.sentOff) continue;
      const dx = q.x - t.x, dz = q.z - t.z, d = DM.hypot(dx, dz);
      if (d < close) { close = d; nearest = q; }
      if (d < 5.5) n++;
      if (d > 14) continue;
      const rvx = q.vx - t.vx, rvz = q.vz - t.vz, closing = DM.max(0, -(dx * rvx + dz * rvz) / (d || 1)),
        tt = (d - 0.9) / (3.4 + closing * 0.9 + q.stats.speed * 0.012);
      if (tt < tob) tob = tt;
    }
    const dir = this.direction(t.team), facing = DM.cos(t.angle - (dir > 0 ? DM.PI / 2 : -DM.PI / 2));
    const pcp = this.pcPress(t.team, t.x, t.z), timeP = 1 - ai2Sat(tob / 1.5), crowd = ai2Sat(n / 3);
    // de espaldas al rival más cercano: recibe peor (spec #4 "recibir de espaldas")
    const back = !!nearest && facing < -0.15 && (nearest.x - t.x) * dir > -1;
    const p = ai2Clamp(0.55 * timeP + 0.25 * pcp + 0.2 * crowd + (back ? 0.05 : 0), 0, 1);
    return { p, tob, n, close, nearest, facing, back };
  },
  // ------------------------------------------------------------------ percepción imperfecta (spec #7)
  // PERCEPTION CONFIDENCE: la inteligencia reduce la incertidumbre, no la elimina. Cada rival/compañero
  // se "ve" con cierta probabilidad (campo visual, distancia, presión, fatiga) y con error de posición.
  ai2Perceive(t) {
    const ai = t.ai, ps = t.personality, s = t.stats, pr = this.ai2Pressure(t),
      intel = s.intelligence / 100, co = ps.composure / 100, cn = ps.consistency / 100,
      fatigue = (100 - (t.stamina ?? 100)) / 100, bias = this.ai2Bias(t);
    const conf = ai2Clamp(0.5 + 0.32 * intel + 0.08 * co + 0.05 * cn - 0.3 * pr.p * (1.15 - co) - 0.12 * fatigue - (pr.back ? 0.07 : 0) - bias.temp * 1.2, 0.22, 0.97);
    const sp = DM.hypot(t.vx, t.vz), fx = sp > 0.5 ? t.vx / sp : DM.sin(t.angle), fz = sp > 0.5 ? t.vz / sp : DM.cos(t.angle);
    const mates = [], opps = [];
    let unseenMates = 0, unseenOpps = 0;
    for (const q of this.players) {
      if (q === t || q.sentOff || q.tlmSubbing) continue; // saliendo/entrando por un cambio: nadie le pasa ni lo marca mientras camina por la banda
      const dx = q.x - t.x, dz = q.z - t.z, d = DM.hypot(dx, dz);
      const cosang = (dx * fx + dz * fz) / (d || 1);
      const angF = cosang > 0.3 ? 1 : cosang > -0.3 ? 0.8 : 0.45 + 0.3 * (ai ? ai.anticipation : 0.6);
      const distF = 1 - ai2Sat((d - 8) / 60) * 0.5, mate = q.team === t.team;
      const run = mate ? ai2Sat(DM.hypot(q.vx, q.vz) / 8) * 0.1 : 0;
      const pSeen = d < 6.5 ? 0.98 : ai2Clamp(conf * angF * distF + run + 0.08, 0.05, 0.98);
      if (this.random() >= pSeen) { mate ? unseenMates++ : unseenOpps++; continue; }
      const sig = (1 - conf) * (0.25 + d * 0.03), vk = 0.7 + 0.3 * conf;
      const o = { p: q, id: q.id, x: q.x + this.ai2Gauss() * sig, z: q.z + this.ai2Gauss() * sig, vx: q.vx * vk, vz: q.vz * vk, d };
      (mate ? mates : opps).push(o);
    }
    return { conf, mates, opps, unseenMates, unseenOpps, pressure: pr.p, tob: pr.tob, n: pr.n, back: pr.back, facing: pr.facing, nearest: pr.nearest, close: pr.close, bias };
  },
  // ------------------------------------------------------------------ dificultad y calidad de ejecución (spec #3, #4)
  // Ejecución = habilidad − dificultad continua. NO existe un "10% de error": el riesgo sale de la
  // situación (distancia, carril, presión, tiempo, orientación, pie débil, fatiga, velocidad...).
  ai2WeakFootPenalty(t, dx, dz) {
    const f = t.ai ? t.ai.foot : "R";
    if (f === "B") return 0;
    const sp = DM.hypot(t.vx, t.vz), fx = sp > 0.5 ? t.vx / sp : DM.sin(t.angle), fz = sp > 0.5 ? t.vz / sp : DM.cos(t.angle),
      cross = fx * dz - fz * dx; // >0: objetivo a la izquierda del cuerpo (según convención x/z)
    const rightSide = cross < 0;
    const need = f === "R" ? rightSide : !rightSide;
    return need ? 0 : 0.05;
  },
  ai2ExecQuality(t, kind, o = {}) {
    const s = t.stats, ps = t.personality, cn = ps.consistency / 100, co = ps.composure / 100,
      fat = (100 - (t.stamina ?? 100)) / 100, pr = o.pr || this.ai2Pressure(t), sp = DM.hypot(t.vx, t.vz),
      m = t.memory, formQ = m ? (m.confidence - 50) / 50 * 0.03 : 0, T = (k) => (this.hasTrait(t, k) ? 1 : 0);
    let skill, diff;
    if (kind === "shot") {
      skill = (0.7 * s.shooting + 0.15 * ps.composure + 0.15 * ps.consistency) / 100;
      const dg = o.dist ?? 20, angleBad = 1 - ai2Sat((o.angle ?? 0.5) / 0.5);
      diff = 0.05 + (dg / 50) * 0.45 + pr.p * 0.22 + (pr.facing < 0 ? 0.1 : 0) + angleBad * 0.12 + (o.first ? 0.06 + ai2Sat(((t.ai && t.ai.recvSpeed) || 8) / 22) * 0.14 : 0) + (o.volley ? 0.16 : 0) +
        (o.header ? 0.12 : 0) + (sp > 6 ? 0.04 : 0) + (o.lob ? 0.07 : 0) + (o.trivela ? 0.1 : 0) + this.ai2WeakFootPenalty(t, o.dx || 0, o.dz || 0) - (o.first ? T("One-Touch Pass") * 0.02 : 0);
      skill += T("Power Shot") * (o.power ? 0.05 : 0) + T("Finesse Shot") * (o.placed ? 0.06 : 0) + T("Long Shot") * (dg > 22 ? 0.06 : 0) - (o.header ? 0 : 0);
      if (o.header && this.hasTrait(t, "Aerial Threat")) skill += 0.09;
    } else if (kind === "clear") {
      skill = (0.4 * s.physical + 0.3 * s.defense + 0.3 * ps.composure) / 100;
      diff = 0.1 + pr.p * 0.3 + (pr.facing < -0.2 ? 0.12 : 0) + (sp > 5 ? 0.05 : 0);
    } else {
      skill = (0.62 * s.passing + 0.13 * s.intelligence + 0.25 * ps.consistency) / 100;
      const dist = o.dist ?? 12;
      diff = 0.05 + (dist / 50) * 0.26 + (o.loft ? 0.1 : 0) + (o.lane || 0) * 0.13 + (sp > 6 ? 0.04 : 0) + (pr.back ? 0.05 : 0) + pr.p * 0.12 +
        (pr.tob < 0.5 ? 0.05 : 0) + this.ai2WeakFootPenalty(t, o.dx || 0, o.dz || 0) + (o.first ? 0.05 - T("One-Touch Pass") * 0.05 : 0) + (o.improv ? 0.22 : 0) + (o.cross ? 0.08 : 0);
      if (o.through) skill += T("Through Ball Specialist") * 0.05;
    }
    // presión pega más a quien tiene poca compostura; fatiga y forma modulan poco
    const q = ai2Clamp(skill * 0.7 + 0.3 - diff * (1.05 - 0.5 * skill) - fat * 0.1 - pr.p * (0.04 + 0.1 * (1 - co)) + formQ, 0.05, 0.99);
    return { q, diff: ai2Clamp(diff, 0, 1), skill, cn, pr };
  },
  // ------------------------------------------------------------------ candidatos de pase (spec #21)
  ai2PassCandidates(t, ctx) {
    const perc = ctx.perc, dir = ctx.dir, team = t.team, id = ctx.id, ai = t.ai, out = [];
    const oppList = perc.opps.filter((o) => true);
    const farSide = this.spaceAt(t.x + 14 * dir, -t.z * 0.6, this.players.filter((q) => q.team !== team && q.role !== "GK" && !q.sentOff));
    const curSpace = this.pcSpace(team, t.x, t.z), tb = ai.touchBias;
    const goalX = 52.5 * dir, res = ai.res, cr01 = t.personality.creativity / 100, spont = ai.spontaneity;
    for (const m of perc.mates) {
      const r = m.p;
      if (r.role === "GK" && !this.p3GkBackpassOk(t, r, ctx)) continue;
      const a = DM.hypot(m.x - t.x, m.z - t.z);
      if (a < 4.5 || a > 46) continue;
      // Fase 1: cada candidato pasa por el PassPlan (BallPlan único + ETA real de receptor y rivales). Sin ventana
      // espacio-temporal alcanzable NO es candidato (salvo desesperación). Fase 6: decisionHorizon modula cuánto
      // anticipa el pase — un horizonte largo apunta más lejos hacia dónde va a estar el receptor.
      const horizonF = te(0.6 + 0.8 * ((ai.cog.decisionHorizon - 0.4) / 1.4), 0.6, 1.4);
      const plan = this.p1BestPassTo(t, m, a, dir, farSide, ctx.desperate, horizonF);
      if (!plan) { this.p1Count("pass_rejected_unreachable"); continue; }
      const ip = plan.interceptPoint || plan.aim, o = ip.x, c = ip.z, p = plan.blockRisk, f = DM.max(0.5, plan.oppDist);
      // el tipo es GEOMÉTRICO (lado opuesto + aéreo + lado débil libre), no depende de qué variante ganó el desempate del plan
      const throughFlag = plan.cls === "through", loft = plan.loft, switchFlag = plan.cls === "switch" || (loft && a > 20 && DM.sign(m.z) !== DM.sign(t.z) && farSide > 8 && plan.cls !== "through");
      // detección (Fase 7/35, distinta de la afinidad ai.res.*): una opción lejana/de cambio de
      // frente existe geométricamente, pero un jugador de poca visión/horizonte de decisión puede
      // simplemente no llegar a verla — no es que la vea y la descarte, ni siquiera se genera como
      // candidato. Jugadores de alta visión la detectan casi siempre; los de baja, rara vez.
      if (switchFlag || (throughFlag && a > 30)) {
        const farVision = ai2Clamp(0.15 + ai.cog.vision * 0.55 + ((ai.cog.decisionHorizon - 0.4) / 1.4) * 0.2, 0.1, 0.95);
        // hash determinístico (no consume this.random()): varía por jugador y por momento del
        // partido sin desincronizar el LCG compartido — un draw extra acá desfasaría toda la
        // secuencia de aleatoriedad del resto del partido (confirmado: rompía un invariante de
        // línea defensiva no relacionado, en manager/tests/engine.test.mjs, por efecto mariposa).
        if (ai2Hash(t.id + "|swv|" + DM.floor(this.elapsed * 3)) >= farVision) continue;
      }
      const v = (o - t.x) * dir, dangerGain = this.dangerAt(o, c, team) - ctx.currentDanger, spaceGain = this.pcSpace(team, o, c) - curSpace,
        ctrlT = this.pcControl(team, o, c), pressT = this.pcPress(team, o, c);
      const fta = this.firstTouchAbility(r) / 100, expectedControl = ai2Clamp(0.55 * plan.expectedControl + 0.3 * fta + 0.15 * (1 - pressT) - ai2Sat(a / 60) * 0.1, 0, 1);
      const interceptRisk = ai2Clamp(plan.interceptionRisk * 0.85 + (1 - ctrlT) * 0.1, 0, 1);
      const offside = this.isOffside(t, r) && this.random() < 0.3 + 0.45 * ai.tacticalDiscipline * perc.conf; // no siempre lo detecta
      const cutNear = 52.5 - t.x * dir < 15 && DM.abs(t.z) > 10, trailing = (r.x - t.x) * dir < -1 && DM.abs(r.z) < 11 && a < 20;
      const kind = throughFlag ? "through" : switchFlag ? "switch" : cutNear && trailing ? "cutback" : v < -3 ? "backpass" : interceptRisk > 0.42 ? "risky" : v > 9 ? "progressive" : a < 12 ? "short" : "safe";
      // calidad heurística heredada de passOption() (misma escala) — se reutiliza, no se tira
      const oneTwo = r.lastPasser === t.id && this.elapsed - (r.lastPassAt ?? -9) < 3.5 ? 2.6 : 0;
      const heur = v * 0.62 + DM.min(f, 12) * 1.45 - a * 0.12 - p * (throughFlag ? 2 : 28) * (t.stats.intelligence / 100) + (r.role === "FWD" ? 3 : 0) +
        this.chem(t, r) * 2.4 + oneTwo + (cutNear && trailing ? 3.4 : 0) - (offside ? 6 : 0);
      const uselessSafe = v < 1.5 && dangerGain < 0.04 && ctx.pressure < 0.35 && a < 16 ? 0.5 : 0;
      const isLong = kind === "through" || kind === "switch" || kind === "progressive";
      let sc = 0.1 + v * 0.05 + dangerGain * 1.7 + spaceGain * 0.55 + (1 - p - 0.5) * 0.2 + expectedControl * 0.09 + heur * 0.007 + this.chem(t, r) * 0.05 +
        ctx.pressure * 0.16 - uselessSafe - ctx.risk * 0.06 + ai.quirk.pass + (this.hasTrait(t, "One-Touch Pass") ? 0.05 : 0);
      // Fase 1: distancia = dificultad + tiempo de reacción del rival — pases largos sólo compiten si aportan (progresión/peligro)
      sc -= ai2Sat((a - 8) / 22) * 0.42 * (isLong ? 0.7 : 1); // Fase 3: el real completa pases de ~13 m de media
      const why = [];
      if (kind === "through" || kind === "switch") { sc += (this.hasTrait(t, "Through Ball Specialist") ? 0.1 : 0) + (res.throughBall - 0.4) * 0.06; if (this.hasTrait(t, "Through Ball Specialist")) why.push("especialista en filtrados"); }
      if (isLong) sc += (id.directness - 1) * 0.24 + (ctx.wantsCounter ? v * 0.012 : 0);
      if (kind !== "backpass") sc += id.possessionPreference > 0.55 ? 0.08 : 0;
      if (ctx.consolidating) sc += kind === "safe" || kind === "short" ? 0.3 : interceptRisk > 0.3 ? -0.25 : 0;
      if (ctx.facing < -0.3) sc += 0.12 * (kind === "backpass" || kind === "short" || kind === "safe" ? 1 : 0.3);
      sc += ctx.memPressure * 0.12 + ctx.memFatigue * 0.05;
      // riesgo de intercepción pesa según cuánta osadía tenga el jugador/equipo (sesgo, no imposición)
      sc -= interceptRisk * (0.62 - 0.2 * ai.boldness - id.riskTolerance * 0.08 + ai.riskMemory * 0.25); // Fase 3: el real pierde ~2.6× menos pases en vuelo
      if (offside) sc -= 0.14 * (0.6 + ai.tacticalDiscipline * 0.4);
      // sesgo del primer toque (spec #19): control hacia adelante → progresar; protegido → apoyo; ancho → combinación
      if (tb) { sc += (isLong || kind === "progressive" ? tb.progress || 0 : 0) + (kind === "short" || kind === "safe" || kind === "backpass" ? tb.support || 0 : 0) + (tb.combo && DM.abs(m.z) > 18 ? tb.combo : 0); }
      // tercer hombre: devolver a quien acaba de darme el pase y ya viene atacando el espacio
      if (oneTwo && this.pcSpace(team, r.x, r.z) > 0.25) { sc += 0.08; why.push("tercer hombre"); }
      // tercer hombre: recibí bajo presión y un compañero (no quien me pasó) ya ataca el espacio generado
      if (!oneTwo && ctx.pressure > 0.3 && this.elapsed - t.controlAt < 1.6 && r.ai && (r.ai.role === "THIRD_MAN" || r.ai.role === "RUNNER" || r.ai.role === "DEPTH") && DM.hypot(r.vx, r.vz) > 2.5 && this.pcSpace(team, o, c) > 0.2 && p < 0.3) { sc += 0.11; why.push("tercer hombre"); }
      const diff = ai2Clamp(0.06 + (a / 45) * 0.3 + (loft ? 0.1 : 0) + p * 0.16 + ctx.pressure * 0.18, 0, 1);
      out.push({ key: "pass", kind, rec: r, p: r, x: plan.aim.x, z: plan.aim.z, plan, a, v, loft, laneRisk: p, free: f, score: sc, diff, risky: interceptRisk > 0.42 || diff > 0.55, danger: dangerGain, spaceGain, lane: 1 - p, interceptRisk, expectedControl, recvQ: fta, tactical: (isLong ? id.directness - 1 : 0), improv: 0, why, progress: v, length: a, risk: p });
    }
    // mejor por receptor y por tipo → diversidad
    out.sort((x, y) => y.score - x.score);
    const kinds = {}, keep = [];
    for (const c of out) { if ((kinds[c.kind] || 0) >= 2 || keep.length >= 6) continue; kinds[c.kind] = (kinds[c.kind] || 0) + 1; keep.push(c); }
    // ---- centro (early/segundo palo): opciones improvisadas/tácticas hacia el área (spec #5)
    const dg = 52.5 - t.x * dir, wide = DM.abs(t.z);
    if (dg < 42 && dg > 8 && wide > 16 && !ctx.setpieceCross) {
      const side = DM.sign(t.z) || 1, spots = [
        { n: "primer palo", x: goalX - 6 * dir, z: side * 3.2 },
        { n: "punto de penal", x: goalX - 11 * dir, z: 0 },
        { n: "segundo palo", x: goalX - 5 * dir, z: -side * 8 },
      ];
      let bestSpot = null, bestV = -1;
      for (const sp of spots) {
        let vsum = 0, rec = null, rd = 99;
        for (const m of perc.mates) { const dd = DM.hypot(m.x - sp.x, m.z - sp.z); if (dd < 8) vsum += (8 - dd) / 8; else if (dd < 18) vsum += ((18 - dd) / 10) * 0.35; /* atacantes que llegan a rematar */ if (dd < rd && m.p.role !== "GK" && m.p.role !== "DEF") { rd = dd; rec = m.p; } }
        const dfn = perc.opps.filter((q) => DM.hypot(q.x - sp.x, q.z - sp.z) < 6).length;
        const val = vsum - dfn * 0.25 + this.random() * 0.15;
        if (rec && val > bestV) { bestV = val; bestSpot = { sp, rec, dfn, vsum }; }
      }
      if (!bestSpot) { // nadie llegando: se tira igual al área (atacantes que se incorporan), receptor nominal = delantero más cercano
        const r0 = perc.mates.filter((m) => m.p.role === "FWD").sort((x, y) => DM.hypot(x.x - goalX, x.z) - DM.hypot(y.x - goalX, y.z))[0];
        if (r0) bestSpot = { sp: spots[1], rec: r0.p, dfn: 0, vsum: 0 };
      }
      if (bestSpot) {
        const early = dg > 27, aff = res.earlyCross, dGain = this.dangerAt(bestSpot.sp.x, bestSpot.sp.z, team) - ctx.currentDanger, sc = 0.32 + DM.max(0, dGain) * 1.3 * (0.55 + 0.45 * DM.min(1, bestSpot.vsum)) + id.crossFrequency * 0.2 + bestSpot.vsum * 0.16 + (aff - 0.4) * 0.14 - bestSpot.dfn * 0.05 + ai.quirk.pass + (wide > 22 ? 0.04 : 0) - ctx.pressure * 0.04 + (early ? -0.03 : 0);
        // Fase 1: un centro también necesita una ventana alcanzable (alguien llega al punto antes de que la pelota se pierda)
        const cpl = this.p1PlanPass(t, bestSpot.rec, "cross", bestSpot.sp.x, bestSpot.sp.z, { loft: true, allowContest: true, kind: "cross", slack: 0.45 });
        if (cpl.interceptPoint)
        keep.push({ key: "pass", kind: "cross", rec: bestSpot.rec, p: bestSpot.rec, x: bestSpot.sp.x, z: bestSpot.sp.z, plan: cpl, a: DM.hypot(bestSpot.sp.x - t.x, bestSpot.sp.z - t.z), v: (bestSpot.sp.x - t.x) * dir, loft: true, laneRisk: 0.2, free: 3, score: sc, diff: 0.42, risky: false, danger: 0, spaceGain: 0, lane: 0.8, interceptRisk: 0.25, expectedControl: 0.5, recvQ: 0.6, improv: early ? 0.5 : 0.2, cross: true, why: [bestSpot.sp.n, early ? "centro temprano" : "centro"], progress: 8, length: 20, risk: 0.2, optional: early, aff });
      }
    }
    // ---- pase de tacón (improvisado): compañero cercano/atrás bajo presión, sólo con recursos técnicos
    const heelAff = res.heel;
    if (heelAff > 0.25 && ctx.pressure > 0.4) {
      const near = keep.filter((c) => c.a < 11 && c.kind !== "cross").sort((x, y) => y.score - x.score)[0];
      if (near) keep.push({ ...near, kind: "improvised", improv: 1, why: ["pase de tacón"], score: near.score + 0.02 + (heelAff - 0.35) * 0.1 - 0.05, diff: DM.min(1, near.diff + 0.22), risky: true, optional: true, aff: heelAff, heel: true });
    }
    return keep;
  },
  // ------------------------------------------------------------------ tipo de remate como DECISIÓN (spec #22)
  // ================= PLAN DE REMATE (dónde y cómo pegarle) =================
  // Antes el destino era «al lado contrario del arquero» y la altura al azar. Ahora el delantero evalúa candidatos (tipo de remate × punto del arco × altura) con lo que ve:
  // dónde está el arquero (lateral, cuánto salió de la línea, si ya se está tirando), cuánto tarda la pelota en llegar a él, defensores en la línea de tiro, su propia
  // puntería (más margen con los palos si es malo o está presionado) y el ángulo. Cada candidato vale P(entra en el arco) × (1 − P(el arquero llega)) × (1 − P(lo tapan));
  // elige con una decisión «acotada» (más ruido si decide mal). Familias: potente, colocado (con efecto), rosca (efecto fuerte al ángulo), raso, picada y vaselina (por encima del arquero).
  ai2ShotSolve(s, r, zt, ht, v, spin, gkx) {
    const gxl = 52.5 * r, dx = gxl - s.x;
    if (dx * r <= 0.5) return null;
    let phi = DM.atan2(zt - s.z, dx * r), hd = DM.hypot(dx, zt - s.z), T = te(hd / v, 0.12, 3), vy = (ht - s.y + 0.5 * 9.81 * T * T) / T, out = null;
    for (let it = 0; it < 7; it++) {
      const st = { x: s.x, z: s.z, y: s.y, vx: r * DM.cos(phi) * v, vz: DM.sin(phi) * v, vy, spin };
      let pl = null, prev = null, tt = 0, n = 0;
      while ((st.x - gxl) * r < 0 && n++ < 250) {
        prev = { x: st.x, z: st.z, y: st.y };
        this.ballFlightStep(st, 0.02); tt += 0.02;
        if (gkx != null && !pl && (st.x - gkx) * r >= 0 && (prev.x - gkx) * r < 0) { const k = (gkx - prev.x) / ((st.x - prev.x) || 1); pl = { z: prev.z + (st.z - prev.z) * k, y: prev.y + (st.y - prev.y) * k, t: tt - 0.02 + 0.02 * k }; }
      }
      if (!prev || (st.x - gxl) * r < 0) return null;
      const k = (gxl - prev.x) / ((st.x - prev.x) || 1), zc = prev.z + (st.z - prev.z) * k, yc = prev.y + (st.y - prev.y) * k, Tc = tt - 0.02 + 0.02 * k;
      out = { vx: r * DM.cos(phi) * v, vz: DM.sin(phi) * v, vy, zc, yc, gkPlane: pl, T: Tc };
      if (DM.abs(zt - zc) < 0.06 && DM.abs(ht - yc) < 0.08) break;
      phi += (zt - zc) / DM.max(4, DM.hypot(gxl - s.x, zc - s.z)); vy += (ht - yc) / DM.max(0.2, Tc);
    }
    return out;
  },
  ai2ShotPlan(t, o, pressure, opt) {
    opt = opt || {};
    const s = this.ball, r = this.direction(t.team), ai = t.ai, res = ai.res, skill = t.stats.shooting / 100, comp = t.personality.composure / 100;
    const gk = this.players[(1 - t.team) * 11], gkOk = !!(gk && !gk.sentOff), gkSkill = gkOk ? te(0.6 + (gk.stats.defense - 70) * 0.006, 0.45, 0.95) : 0.5;
    const opps = this.players.filter((p) => p.team !== t.team && !p.sentOff && p.role !== "GK");
    const T = (k) => (this.hasTrait(t, k) ? 1 : 0), phi = (x) => 1 / (1 + DM.exp(-1.702 * x));
    const sigBase = te(0.42 + 0.032 * o - (skill - 0.7) * 0.9 + pressure * 0.35 - (comp - 0.5) * 0.25, 0.3, 2.2);
    const react = 0.22 + (gkOk && gk.ai ? (1 - gk.ai.cog.anticipation) * 0.16 : 0.08) + (gkOk && gk.dive > 0 ? 0.12 : 0);
    const FAM = [
      { name: o > 26 ? "Tiro lejano" : "Tiro potente", v: [29, 35], spins: [0], hs: [0.3, 1.0, 1.8], sig: 1.2, w: 0.6 + T("Power Shot") * 0.35 + (o > 22 ? 0.1 : 0) + (t.personality.aggression - 50) * 0.003 },
      { name: "Tiro colocado", v: [21, 26], spins: [-0.7, 0.7], hs: [0.4, 1.3, 2.0], sig: 0.8, w: 0.45 + T("Finesse Shot") * 0.35 },
      { name: "Rosca", v: [20, 25], spins: [-1.5, 1.5], hs: [1.6, 2.1], sig: 0.95, min: 11, max: 30, w: 0.35 + T("Finesse Shot") * 0.3 + (res.trivela || 0) * 0.25 },
      { name: "Tiro raso", v: [24, 30], spins: [0], hs: [0.3, 0.55], sig: 0.85, max: 28, w: 0.62 + T("Finesse Shot") * 0.1 },
      { name: "Picada", v: [15, 19], spins: [0], hs: [1.7], sig: 0.9, max: 24, chip: 1, w: 0.22 + (res.lob || 0.3) * 0.5 },
      { name: "Vaselina", v: [11.5, 15], spins: [0], hs: [1.9], sig: 1.0, max: 18, chip: 1, w: 0.12 + (res.lob || 0.3) * 0.5 },
    ];
    if (opt.trivela) FAM.push({ name: "Trivela", v: [21, 26], spins: [-1.05, 1.05], hs: [0.6, 1.4, 2.0], sig: 0.9, w: 3 });
    const ZS = [-3.1, -2.0, -0.8, 0.8, 2.0, 3.1], cands = [];
    for (const fam of FAM) {
      if ((fam.min && o < fam.min) || (fam.max && o > fam.max)) continue;
      if (fam.chip && !gkOk) continue;
      const w = DM.pow(DM.max(0.05, fam.w) * (opt.prior && opt.prior === fam.name ? 1.4 : 1), 0.6);
      for (const sp of fam.spins) for (const ht of fam.hs) for (const zt of ZS) {
        const v = fam.v[0] + (fam.v[1] - fam.v[0]) * this.random();
        const sol = this.ai2ShotSolve(s, r, zt, ht, v, sp, gkOk ? gk.x : null);
        if (!sol) continue;
        const sz = sigBase * fam.sig, sy = sz * 0.55;
        const geo = (phi((3.5 - zt) / sz) - phi((-3.5 - zt) / sz)) * (phi((2.3 - ht) / sy) - phi((0.2 - ht) / sy));
        let psave = 0;
        if (gkOk && sol.gkPlane) {
          const pl = sol.gkPlane, dzg = DM.abs(pl.z - gk.z);
          const need = react + DM.max(0, dzg - 1.0) / 5.8 + (pl.y > 1.9 ? 0.07 : 0) + (pl.y < 0.5 ? 0.04 : 0);
          psave = te(0.5 + (pl.t - need) * 2.4, 0.03, 0.94) * gkSkill;
          if (pl.y > 2.55) psave *= 0.08; // pasa por encima de sus manos (picada / vaselina)
        }
        // defensores en la línea de tiro (sólo tapan lo que va bajo)
        let pb = 0;
        const gxl = 52.5 * r, hx = gxl - s.x, hz = zt - s.z, hl = DM.hypot(hx, hz) || 1;
        for (const q of opps) {
          const u = ((q.x - s.x) * hx + (q.z - s.z) * hz) / (hl * hl);
          if (u <= 0.03 || u >= 1) continue;
          const d = DM.hypot(q.x - (s.x + hx * u), q.z - (s.z + hz * u));
          const reachH = fam.chip ? 0.25 : ht > 1.7 && sol.T > 0.4 ? 0.35 : 1;
          pb = DM.max(pb, te(1 - d / 1.1, 0, 1) * reachH * (u < 0.35 ? 1 : 0.7));
        }
        // mandarla al arco siempre vale más que tirarla afuera: aunque el arquero la ataje (o el rebote quede vivo), un tiro dentro del marco suma un poco
        cands.push({ fam, v, sp, ht, zt, geo, value: (geo * (1 - psave) * (1 - 0.85 * pb) + 0.1 * geo * (1 - 0.6 * pb)) * w });
      }
    }
    if (!cands.length) return null;
    const best = cands.reduce((a, b) => (b.value > a.value ? b : a)), tau = 0.045 + (1 - (ai.cog ? ai.cog.decisionQuality : 0.6)) * 0.05 + pressure * 0.02;
    let sum = 0; const ws = cands.map((c) => { const x = DM.exp((c.value - best.value) / tau); sum += x; return x; });
    let rr = this.random() * sum, k = 0;
    for (; k < ws.length - 1; k++) { rr -= ws[k]; if (rr <= 0) break; }
    const c = cands[k];
    let name = c.fam.name;
    if (name === "Tiro raso" && DM.abs(s.z) > 5 && DM.sign(c.zt) === -DM.sign(s.z)) name = "Raso cruzado";
    return { name, zt: c.zt, ht: c.ht, v: c.v, spin: c.sp, geo: DM.max(0.05, c.geo), sig: sigBase * c.fam.sig };
  },
  ai2ShotType(t, ctx, dg, ang, first) {
    const ai = t.ai, res = ai.res, gk = this.players[(1 - t.team) * 11], dir = ctx.dir;
    const gkOff = gk && DM.abs(gk.x) < 47.5 && (52.5 - DM.abs(gk.x)) > 3.3 ? ai2Sat((52.5 - DM.abs(gk.x) - 2.5) / 6) : 0;
    const wide = ai2Sat(DM.abs(t.z) / 20), T = (k) => (this.hasTrait(t, k) ? 1 : 0), pr = ctx.pressure;
    const opts = [
      ["Tiro colocado", 0.34 + T("Finesse Shot") * 0.14 + (t.personality.composure - 50) * 0.002 + (1 - pr) * 0.08 - (dg > 26 ? 0.1 : 0) + (wide > 0.3 ? 0.06 : 0)],
      ["Tiro potente", 0.3 + T("Power Shot") * 0.16 + pr * 0.14 + (dg > 22 ? 0.12 : 0) + (t.personality.aggression - 50) * 0.002],
      ["Tiro raso", dg < 24 ? 0.26 + (1 - gkOff) * 0.08 + (ang > 0.35 ? 0.05 : 0) : -1],
      ["Vaselina", dg < 27 ? 0.02 + gkOff * 0.55 * (0.5 + res.lob * 0.5) + (res.lob - 0.3) * 0.15 - pr * 0.05 : -1],
      ["Trivela", dg < 25 && res.trivela > 0.2 ? 0.04 + res.trivela * 0.32 + wide * 0.08 : -1],
    ];
    if (dg > 26) opts.push(["Tiro lejano", 0.5 + res.longShot * 0.2]);
    // decisión probabilística suave (temperatura baja): rara vez la segunda mejor
    const best = DM.max(...opts.map((o) => o[1])), Tm = 0.07 + (1 - ai.patience) * 0.04;
    let sum = 0;
    const w = opts.map((o) => (o[1] < 0 ? 0 : DM.exp((o[1] - best) / Tm)));
    for (const x of w) sum += x;
    let r = this.random() * sum, i = 0;
    for (; i < w.length - 1; i++) { r -= w[i]; if (r <= 0) break; }
    return opts[i][0];
  },
  // ------------------------------------------------------------------ selección (spec #2: bounded rationality)
  ai2Select(t, ctx) {
    const ai = t.ai, ps = t.personality, id = ctx.id, perc = ctx.perc, cr01 = ps.creativity / 100, intel = t.stats.intelligence / 100,
      cn = ps.consistency / 100, co = ps.composure / 100, dir = ctx.dir, bias = perc.bias, pr = ctx.pressure2;
    const cons = (aff, base, extra = 0) => ai2Clamp(base + aff * 0.45 + (cr01 - 0.5) * 0.35 + (ai.spontaneity - 0.5) * 0.2 + extra, 0.03, 0.97);
    const cands = [];
    ctx.oneTouchBoost = ctx.oneTouch && ctx.distGoal <= 24 ? 0.2 * ai2Sat((25 - ctx.distGoal) / 12) : 0; // llegó de primera cerca del arco: el remate gana peso
    // 1) tiro "normal" (legado): se conserva el scoring existente
    if (ctx.canShoot && ctx.distGoal <= 21) cands.push({ key: "shot", kind: "shot", score: ctx.shotScore + ai.quirk.shoot + bias.risk * 0.5 + bias.retry * 0.6 + (ctx.oneTouchBoost || 0) - DM.max(0, ctx.distGoal - 17) * LONG_SHOT_PENALTY, diff: 0.05 + (ctx.distGoal / 50) * 0.45 + pr * 0.22, risky: ctx.distGoal > 20, why: [ctx.distGoal < 16.5 ? "dentro del área" : "tiro directo"], spec: false });
    // 2) REMATE ESPECULATIVO (spec #6): zona de 17–34 m donde el tiro compite con el pase; nace del mismo sistema
    const dg = ctx.distGoal;
    if (dg > 21 && dg < 35 && DM.abs(t.z) < 26 && ctx.facing > -0.35) {
      const rangeF = DM.pow(1 - ai2Sat((dg - 20) / 16), 1.25), sk = t.stats.shooting / 100, why = [];
      const th = DM.abs(DM.atan((t.z + 3.66) / dg) - DM.atan((t.z - 3.66) / dg));
      // carril al arco con lo que el jugador VE (información incompleta)
      const gx = 52.5 * dir, lane = 1 - this.ai2LaneRisk(t.x, t.z, gx, t.z * 0.3, perc.opps);
      const gk = this.players[(1 - t.team) * 11], gkOff = gk && DM.abs(gk.x) < 49 ? ai2Sat((52.5 - DM.abs(gk.x) - 2) / 6) : 0;
      const tobBonus = perc.tob > 0.9 ? 0.06 : 0;
      // riskAssessment (Fase 8/23, ≠ boldness): boldness es cuánto le gusta arriesgar; riskAssessment
      // es cuán bien lee SI el contexto realmente lo justifica. Por eso sólo escala los términos que
      // dependen del contexto (carril, arquero adelantado, defensor tardando, compañeros tapados) —
      // un jugador osado pero de mala lectura tira igual de seguido, pero menos "cuando corresponde".
      const ra = ai.cog.riskAssessment;
      let sc = 0.04 + rangeF * (0.3 + (sk - 0.6) * 0.6 + ai.res.longShot * 0.16 + ai.boldness * 0.1 + ai.spontaneity * 0.05) +
        (0.09 * lane + gkOff * 0.1 * rangeF + tobBonus * rangeF) * (0.5 + 0.5 * ra) +
        (id.shotRisk || 0) * 0.09 * rangeF + (id.shotEager || 0) + ai.quirk.shoot + bias.risk * 0.6 + bias.retry * 0.7 -
        pr * 0.1 - ai.riskMemory * 0.25 - (ctx.consolidating ? 0.1 : 0) + ctx.opp * 0.03 + th * 0.15;
      if (ctx.bestPassRisk > 0.4) sc += 0.05 * (0.4 + 0.6 * ra); // compañeros cubiertos → el tiro gana peso (más si lo lee bien)
      if (ai.res.longShot > 0.6) why.push("Long Shot");
      if (lane > 0.75) why.push("arco visible");
      if (gkOff > 0.4) why.push("arquero adelantado");
      if (perc.tob > 0.9) why.push("defensor tarda en salir");
      if (ctx.bestPassRisk > 0.4) why.push("compañeros cubiertos");
      // consideración: creatividad = considera más soluciones plausibles (no "más random")
      // Disciplina de tiro lejano: el remate desde lejos compite mal con el pase salvo que el contexto lo justifique (arquero adelantado, carril limpio,
      // compañeros tapados) o el jugador sea un especialista (Long Shot / buen pegador). Queda la chance de un golazo.
      const specialist = DM.max(0, ai.res.longShot - 0.55) * 0.35 + DM.max(0, sk - 0.82) * 0.5 + (this.hasTrait(t, "Long Shot") ? 0.05 : 0);
      sc = sc * LONG_SHOT_DAMP - 0.02 + specialist + (gkOff > 0.4 ? 0.04 : 0);
      if (this.random() < cons(ai.res.longShot, 0.04, (id.shotRisk || 0) * 0.05))
        cands.push({ key: "speculative", kind: "shot", score: sc, diff: 0.1 + (dg / 50) * 0.5 + pr * 0.22, risky: true, why, spec: true, aff: ai.res.longShot, rangeF });
    }
    // 3) regate (legado) + 4) conducción explícita
    if (ctx.canDuel) cands.push({ key: "dribble", kind: "dribble", score: ctx.dribbleScore + ai.quirk.dribble + bias.risk * 0.5 + (ai.res.trick - 0.4) * 0.06 + ((ai.touchBias && ai.touchBias.dribble) || 0), diff: 0.3 + ctx.pressure * 0.3, risky: true, why: ["1v1"] });
    if (ctx.spaceAhead > 6.5 && ctx.pressure < 0.55) {
      const ah = this.pcSpace(t.team, t.x + 8 * dir, t.z);
      cands.push({ key: "carry", kind: "carry", score: 0.24 + ctx.spaceAhead * 0.011 + ah * 0.45 + (ai.res.carry - 0.4) * 0.1 + ((ai.touchBias && ai.touchBias.dribble) || 0) + (ctx.wantsCounter ? 0.05 : 0) - (ctx.consolidating ? 0.12 : 0) + ai.quirk.dribble, diff: 0.1, risky: false, why: ["espacio por delante"] });
    }
    // 5) pases (nuevo): múltiples candidatos con receptor/objetivo/riesgo/valor
    const passes = ctx.passCands;
    for (const c of passes) {
      if (c.optional && this.random() >= cons(c.aff || 0.3, 0.02)) continue;
      // criterio de consideración según tipo (spec #16: rasgos cambian el espacio de decisión, no imponen)
      if (c.kind === "through" && this.random() >= cons(ai.res.throughBall, 0.38, (id.directness - 1) * 0.3)) continue;
      if (c.kind === "switch" && this.random() >= cons(ai.res.switchPlay, 0.42, (id.directness - 1) * 0.3)) continue;
      if (c.kind === "progressive" && id.directness < 0.9 && this.random() < 0.3) continue;
      if (c.kind === "cross" && !c.optional && this.random() >= cons(ai.res.earlyCross, 0.5, id.crossFrequency * 0.15)) continue;
      cands.push(c);
    }
    // 6) despeje y sostener (legado)
    if (ctx.clearScore > -1) cands.push({ key: "clear", kind: "clear", score: ctx.clearScore, diff: 0.3, risky: false, why: ["zona de peligro"] });
    cands.push({ key: "hold", kind: "hold", score: ctx.holdScore + ((ai.touchBias && ai.touchBias.hold) || 0), diff: 0.05, risky: false, why: ["proteger"] });
    for (let i = cands.length - 1; i >= 0; i--) if (!(cands[i].score === cands[i].score)) cands.splice(i, 1); // NaN guard
    this.p3SetPieceFilter(t, ctx, cands);
    // ruido perceptual chico: la lectura imperfecta mueve un poco los scores (menos con inteligencia)
    for (const c of cands) c.score += (this.random() - 0.5) * (1 - perc.conf) * 0.08;
    cands.sort((a, b) => b.score - a.score);
    const best = cands[0];
    // absurdas fuera: score muy por debajo o inviable (spec #2 punto 4)
    let plausible = cands.filter((c) => c.score >= best.score - (0.3 + 0.16 * cr01) && c.score > -0.2);
    if (!plausible.length) {
      // Salvaguarda (no oculta el bug): el umbral absoluto (-0.2) puede dejar la lista vacía cuando
      // TODA opción, incluido "hold" (que siempre está en cands), puntúa por debajo de -0.2 —por
      // presión/sesgos/ruido negativos acumulados. Nunca debe crashear ai2Execute por falta de
      // candidato: se conserva la mejor opción real y se cuenta para poder detectar si esto se
      // dispara con una frecuencia anómala (ver telemetría "select_floor_fallback").
      plausible = [best];
      this.ai2Count(t, "select_floor_fallback");
    }
    const K = ai2Clamp(2 + (cr01 > 0.55 ? 1 : 0) + (ai.spontaneity > 0.6 ? 1 : 0) + (cn < 0.5 ? 1 : 0) - (intel > 0.85 && cn > 0.75 ? 1 : 0), 2, 5);
    plausible = plausible.slice(0, K);
    // temperatura de decisión (spec #2): sube con presión/fatiga/incoherencia, baja con inteligencia/compostura
    const fat = (100 - (t.stamina ?? 100)) / 100, conf01 = t.memory ? t.memory.confidence / 100 : 0.5;
    let T = 0.055 + (1 - intel) * 0.075 + (1 - cn) * 0.09 + (1 - co) * pr * 0.1 + pr * 0.035 + fat * 0.04 + (0.5 - conf01) * 0.05 + cr01 * 0.03 +
      ai.spontaneity * 0.03 + bias.temp + id.riskTolerance * 0.02 + best.diff * 0.03 - (this.hasTrait(t, "One-Touch Pass") && ctx.oneTouch ? 0.01 : 0);
    T = ai2Clamp(T, 0.045, 0.26);
    const ws = plausible.map((c) => DM.exp((c.score - best.score) / T));
    let sum = 0;
    for (const w of ws) sum += w;
    let r = this.random() * sum, pick = plausible[0];
    for (let i = 0; i < plausible.length; i++) { r -= ws[i]; if (r <= 0) { pick = plausible[i]; break; } }
    const second = plausible[1] || null, gap = second ? best.score - second.score : 0.5;
    // confianza de decisión (spec #17): opción dominante → rápido; opciones parecidas → duda
    const dconf = ai2Clamp(0.18 + 0.5 * ai2Sat(gap / 0.3) + 0.15 * intel + 0.1 * cn + 0.07 * perc.conf - 0.08 * pr, 0, 1);
    const errRisk = 1 - ws[0] / sum + 0; // probabilidad de elegir algo que no es lo mejor
    return { cands, plausible, pick, best, T, dconf, errRisk, gap, ws };
  },
  // ------------------------------------------------------------------ ejecutar la decisión elegida
  ai2Execute(t, sel, ctx) {
    const pick = sel.pick, best = sel.best, ai = t.ai, dir = ctx.dir, worse = best.score - pick.score;
    const decisionError = pick !== best && worse > 0.07;
    // Lapso de decisión "tarde/sostener de más" (spec #3 A): depende de compostura, inteligencia, presión
    const lateP = 0.015 + 0.12 * ctx.pressure2 * (1 - t.personality.composure / 100) * (1 - t.stats.intelligence / 200) * (1.3 - t.personality.consistency / 100);
    ai.dbg = { at: this.elapsed, options: sel.plausible.map((c) => ({ key: c.key, kind: c.kind, score: c.score, why: c.why || [] })), all: sel.cands.length, sel: pick, temp: sel.T, dconf: sel.dconf, errRisk: sel.errRisk, pressure: ctx.pressure2, space: ctx.spaceAhead, spaceValue: this.pcSpace(t.team, t.x + 6 * dir, t.z), control: this.pcControl(t.team, t.x, t.z), pconf: ctx.perc.conf, form: ctx.perc.bias.form, decisionError, execQ: null, execErr: null, intended: pick.key + (pick.kind && pick.kind !== pick.key ? ":" + pick.kind : ""), actual: null, unseenMates: ctx.perc.unseenMates };
    this.ai2Count(t, "decisions_total");
    this.p1LogDecision(t, sel, ctx, decisionError, worse);
    t.lastDecision = pick.key === "speculative" ? "shoot" : pick.key === "pass" ? "pass" : pick.key;
    ai.intent = { key: pick.key, kind: pick.kind, decisionError, at: this.elapsed, worse, risky: !!pick.risky, spec: !!pick.spec };
    if (decisionError) this.ai2Count(t, "decision_errors");
    // hesitación: opciones parejas → algo más de tiempo (sin pausas largas)
    if (sel.gap < 0.06 && pick.key !== "hold") { t.think = DM.max(t.think, 0.12 + 0.1 * (1 - sel.dconf)); this.ai2Count(t, "hesitations"); }
    if (this.random() < lateP && pick.key !== "hold" && pick.key !== "clear" && !(ctx.distGoal < 12)) {
      this.ai2Count(t, "decision_errors");
      ai.dbg.decisionError = true;
      ai.dbg.actual = "decisión tardía (sostuvo la pelota)";
      t.state = "Dribble";
      t.think = this.range(0.3, 0.5);
      return;
    }
    switch (pick.key) {
      case "shot":
      case "speculative": {
        const first = !!ctx.oneTouch;
        this.shoot(t, false, first, false, { spec: !!pick.spec, decision: ai.intent, ctx, shotType: this.ai2ShotType(t, ctx, ctx.distGoal, DM.abs(DM.atan((t.z + 3.66) / DM.max(1.5, ctx.distGoal)) - DM.atan((t.z - 3.66) / DM.max(1.5, ctx.distGoal))), first) });
        return;
      }
      case "dribble":
        this.startDuel(t, ctx.nearest);
        return;
      case "clear":
        this.clearBall(t);
        return;
      case "pass": {
        const setpieceCross = (t.setpieceCrossBias || 0) > this.elapsed && pick.kind !== "through" && (pick.rec.role === "FWD" || pick.rec.role === "MID");
        t.setpieceCrossBias = 0;
        const cross = pick.kind === "cross" || setpieceCross;
        const oneTwo = (pick.kind === "short" || pick.kind === "safe") && this.chem(t, pick.rec) > 0.55 && this.random() < 0.5;
        if (oneTwo) t.expectingReturn = { at: this.elapsed, target: pick.rec.id };
        if (pick.kind === "backpass") this.ai2Count(t, "backpasses");
        this.pass(t, pick, cross, false, { cand: pick, decision: ai.intent, ctx });
        return;
      }
      case "carry":
      case "hold":
      default:
        t.state = ctx.nd > 7 || pick.key === "carry" ? "Sprint" : "Dribble";
        t.think = this.range(0.45, 0.85);
    }
  },
});

// ============================== TEAM BRAIN / COORDINADORES / POSICIONAMIENTO (spec #10–#16, #23–#25) ==============================
const AI2_ROLE_FIT = {
  // pesos por rol: fit de tipo de candidato + pesos de términos (calibrables)
  SUPPORT: { fit: { support: 0.5, lateral: 0.35, anchor: 0.1, between: 0.15 }, space: 0.7, ctrl: 0.3, access: 1.0, prog: 0.1, gen: 0, supp: 0.5 },
  WIDTH: { fit: { width: 0.6, anchor: 0.15, depth: 0.2 }, space: 0.6, ctrl: 0.3, access: 0.5, prog: 0.25, gen: 0, supp: 0.1 },
  DEPTH: { fit: { depth: 0.55, blind: 0.3, halfspace: 0.2, box: 0.45 }, space: 0.9, ctrl: 0.1, access: 0.6, prog: 0.6, gen: 0, supp: 0 },
  RUNNER: { fit: { depth: 0.5, blind: 0.4, halfspace: 0.3, occupy: 0.3, box: 0.55 }, space: 0.9, ctrl: 0.1, access: 0.4, prog: 0.7, gen: 0.2, supp: 0 },
  FIXER: { fit: { anchor: 0.35, depth: 0.15, between: 0.05, box: 0.4 }, space: 0.4, ctrl: 0.2, access: 0.3, prog: 0.1, gen: 0, supp: 0.1, stay: 0.4 },
  THIRD_MAN: { fit: { between: 0.5, halfspace: 0.3, support: 0.2, box: 0.25 }, space: 0.8, ctrl: 0.2, access: 0.8, prog: 0.3, gen: 0.2, supp: 0.3 },
  SPACE_CREATOR: { fit: { support: 0.35, between: 0.3, lateral: 0.2, blind: 0.05 }, space: 0.3, ctrl: 0.2, access: 0.4, prog: 0.1, gen: 1.5, supp: 0.3 },
  REST_DEFENSE: { fit: { cover: 0.6, anchor: 0.4 }, space: 0.1, ctrl: 0.5, access: 0.1, prog: -0.2, gen: 0, supp: 0, stay: 0.7 },
  NONE: { fit: { anchor: 0.35, occupy: 0.1, halfspace: 0.05, support: 0.1, box: 0.2, depth: 0.12 }, space: 0.55, ctrl: 0.25, access: 0.35, prog: 0.15, gen: 0.25, supp: 0.15 },
};
const AI2_ATT_ROLE_TAG = { BALL_CARRIER: "ball carrier", SUPPORT: "apoyo", WIDTH: "amplitud", DEPTH: "profundidad", RUNNER: "ruptura", FIXER: "fija", THIRD_MAN: "tercer hombre", REST_DEFENSE: "defensa de descanso", SPACE_CREATOR: "crea espacio" };

Object.assign(wc.prototype, {
  ai2Outfield(team) {
    return this.players.filter((p) => p.team === team && p.role !== "GK" && !p.sentOff);
  },
  // ------------------------------------------------------------------ orquestación por frecuencias distintas (spec #26)
  ai2Tick(dt) {
    const c = this._aiClock, now = this.elapsed;
    c.pc += dt;
    if (c.pc >= 1 / AI2_CFG.pcHz) { this.ai2UpdatePitch(c.pc); c.pc = 0; }
    const per = 1 / AI2_CFG.brainHz;
    for (let tm = 0; tm < 2; tm++) {
      if (now - c.last[tm] >= per) {
        c.last[tm] = now;
        this.ai2Brain(tm);
        if (this.phase === "playing") {
          const b = this.brain[tm];
          if (b.hasBall) this.ai2CoordAttack(tm);
          else this.ai2CoordDefense(tm);
        } else for (const p of this.players) if (p.team === tm && p.ai) { p.ai.dintent = null; p.ai.role = null; }
      }
    }
    this.ai2TrackHoles();
    this.ai2ResolveShot();
    for (const p of this.players) if (!p.sentOff) this.ai2DecayPlayer(p, dt);
  },
  // ------------------------------------------------------------------ TEAM BRAIN con histéresis (spec #13)
  // hasBall ya no oscila con cada toque: hace falta evidencia acumulada (umbral de entrada ≠ de salida,
  // con inercia temporal). pressScore usa entrada 0.72 / salida 0.58.
  ai2Brain(tm) {
    const b = this.brain[tm], now = this.elapsed, dt = DM.min(0.5, now - (b.last ?? now - 0.33)), ball = this.ball;
    b.last = now;
    const own = this.owner ? (this.owner.team === tm ? 1 : 0) : this.lastTouch ? (this.lastTouch.team === tm ? 0.7 : 0.3) : 0.5;
    const target = 0.7 * own + 0.3 * this.pcControl(tm, ball.x, ball.z);
    b.sig += (target - b.sig) * (1 - DM.exp(-dt * 2.2));
    // posesión clara (dueño estable ≥0.5 s) cambia la fase ya; la pelota suelta/en disputa usa evidencia acumulada
    const ow = this.owner, stable = ow && now - ow.controlAt > 0.5;
    if (stable && (ow.team === tm) !== b.hasBall && now - b.since > 0.9) { b.hasBall = ow.team === tm; b.since = now; }
    else if (!ow && !b.hasBall && b.sig > 0.66 && now - b.since > 0.6) { b.hasBall = true; b.since = now; }
    else if (!ow && b.hasBall && b.sig < 0.34 && now - b.since > 0.6) { b.hasBall = false; b.since = now; }
    const dir = this.direction(tm), adv = ball.x * dir, id = this.identity(tm), lv = this.liveTactics && this.liveTactics[tm] && this.liveTactics[tm].active;
    const avgSt = this.ai2Outfield(tm).reduce((a, p) => a + (p.stamina ?? 100), 0) / 10;
    const pressInt = ai2Clamp(id.press * (1 + (lv ? lv.pressing * 0.17 + lv.mentality * 0.04 : 0)), 0.45, 1.85);
    const ps = 0.42 * ai2Sat((pressInt - 0.6) / 0.9) + 0.3 * ai2Sat((adv + 8) / 40) + 0.15 * (this.pressTriggerUntil[1 - tm] > now ? 1 : 0) + 0.13 * ai2Sat((avgSt - 50) / 50);
    b.pressScore += (ps - b.pressScore) * (1 - DM.exp(-dt * 1.5));
    if (!b.highPress && b.pressScore > 0.72 && now - b.pressSince > 2) { b.highPress = true; b.pressSince = now; }
    else if (b.highPress && b.pressScore < 0.58 && now - b.pressSince > 2) { b.highPress = false; b.pressSince = now; }
  },
  // ------------------------------------------------------------------ ATTACKING COORDINATOR (spec #14)
  ai2CoordAttack(tm) {
    const now = this.elapsed, d = this.direction(tm), tt = this.teamTactics(tm), owner = this.owner;
    const carrier = owner && owner.team === tm ? owner : this.receiver && this.receiver.team === tm ? this.receiver : this.lastTouch && this.lastTouch.team === tm ? this.lastTouch : null;
    if (!carrier) { for (const p of this.ai2Outfield(tm)) { p.ai.dintent = null; p.ai.role = null; } return; }
    const pool = this.ai2Outfield(tm).filter((p) => p !== carrier), opps = this.ai2Outfield(1 - tm), taken = new Set(), R = {};
    const asg = (role, p) => { if (p && !taken.has(p.id)) { taken.add(p.id); R[p.id] = role; } };
    const slot = (p) => this.formationSlot(tm, p.index), sticky = (p, role) => (p.ai.role === role && now - p.ai.roleAt < 8 ? 0.3 : 0);
    const best = (role, fn, minScore = -1e9) => {
      let bp = null, bs = minScore;
      for (const p of pool) { if (taken.has(p.id)) continue; const s = fn(p, slot(p)); if (s === null) continue; const sc = s + sticky(p, role); if (sc > bs) { bs = sc; bp = p; } }
      return bp;
    };
    const bx = this.ball.x, bz = this.ball.z, urg = this.urgency(tm);
    // 1) DEFENSA DE DESCANSO — cuántos guardan estructura depende de riesgo/posesión/urgencia/marcador
    let nRest = 2 + (tt.possessionPreference > 0.6 ? 1 : 0) - (tt.riskTolerance > 0.66 || urg > 4 || tt.phase === "emergency" ? 1 : 0);
    nRest = ai2Clamp(nRest - (this.ball.x * d > 20 ? 1 : 0) - (tt.attackingPlayers > 0.4 ? 1 : 0), 1, 3); // más gente arriba cuando se ataca en el último tercio
    const restFit = (p, s) => (p.role === "DEF" ? 1 : 0.15) + (p.role === "MID" && (this.playerRoles && this.playerRoles[p.id] === "hold" || s[0] * d < -14) ? 0.5 : 0) - s[0] * d * 0.012 + p.ai.tacticalDiscipline * 0.3 - (DM.abs(s[1]) > 15 && p.ai.boldness > 0.55 ? 0.35 : 0) - (this.playerRoles && this.playerRoles[p.id] === "attacking" ? 0.5 : 0);
    for (let i = 0; i < nRest; i++) asg("REST_DEFENSE", best("REST_DEFENSE", restFit));
    // carrileros ofensivos: si un lateral está muy adelantado, un mediocentro compensa (spec #33)
    let comp = 0;
    for (const p of pool) if (comp < 1 && p.role === "DEF" && DM.abs(slot(p)[1]) > 15 && (p.x - slot(p)[0] * d) * d > 18 && !taken.has(p.id) && Object.values(R).filter((r) => r === "REST_DEFENSE").length < 2) {
      const mid = best("REST_DEFENSE", (q, s) => (q.role === "MID" ? 0.6 - s[0] * d * 0.02 + q.ai.tacticalDiscipline * 0.3 : null));
      if (mid) { asg("REST_DEFENSE", mid); comp++; }
    }
    // 2) AMPLITUD por flanco libre
    for (const sgn of [-1, 1]) {
      // con la jugada avanzada por un costado, el extremo del lado débil entra al área (no se queda pegado a la raya)
      if (this.ball.x * d > 18 && DM.abs(bz) > 10 && sgn !== DM.sign(bz)) continue;
      const w = best("WIDTH", (p, s) => (DM.sign(s[1]) === sgn && DM.abs(s[1]) > 10 ? 0.6 + (p.role === "FWD" ? 0.35 : p.role === "MID" ? 0.12 : 0) + (p.style === "Winger" ? 0.4 : 0) + (p.style === "Overlapping Fullback" ? 0.3 : 0) + (this.playerRoles && (this.playerRoles[p.id] === "wide" || this.playerRoles[p.id] === "attacking") ? 0.3 : 0) - DM.abs(p.z - sgn * 28) / 60 : null));
      if (w) asg("WIDTH", w);
    }
    // en zona de centro (banda, cerca del fondo) tener pocas líneas de pase CORTAS es normal y lo
    // que corresponde es que los compañeros ataquen el área (ya cubierto por RUNNER/WIDTH más abajo),
    // no que se acerquen al centrador — si no, el refuerzo de apoyo vacía el área durante los centros.
    const dgCarrier = 52.5 - carrier.x * d, wideCarrier = DM.abs(carrier.z),
      inCrossZone = dgCarrier < 42 && dgCarrier > 8 && wideCarrier > 16;
    const isolated = !inCrossZone && !!carrier.ai && this.elapsed - (carrier.ai.lastPassCandAt ?? -9) < 1.2 && (carrier.ai.lastPassCandCount ?? 9) <= 1;
    // 3) PROFUNDIDAD / RUPTURA sólo si hay espacio detrás de la línea (mapa de control)
    const lineAdv = this.pc.line[tm], behindVal = this.pcSpace(tm, (lineAdv + 6) * d, 0) + this.pcSpace(tm, (lineAdv + 6) * d, 14) * 0.5;
    if (behindVal > 0.16 || tt.counterAttackPreference > 0.6 || isolated) {
      // desdoblamiento al lado ciego (video extremo #5): con el balón claramente de un lado, el
      // atacante del carril contrario a la pelota gana puntos para la ruptura diagonal a la espalda
      // de su marcador en vez de quedarse quieto esperando que el balón le llegue. El bonus de lado
      // ciego es sólo para construcción en juego abierto — con la jugada ya centrada (inCrossZone)
      // esto es tarea de RUNNER/WIDTH, no de este rol (si no, un atacante puede llegar de más al
      // punto de caída de un centro y pisarle la salida al arquero).
      const dep = best("DEPTH", (p, s) => (p.role === "FWD" || p.role === "MID" ? p.stats.speed * 0.01 + (p.role === "FWD" ? 0.4 : 0) + (p.style === "Speedster" || p.style === "Poacher" || (this.playerRoles && this.playerRoles[p.id] === "run_behind") ? 0.3 : 0) - DM.abs(p.z - carrier.z) * 0.004 + (!inCrossZone && DM.abs(bz) > 12 && DM.sign(s[1]) !== DM.sign(bz) ? 0.35 * (0.5 + 0.5 * p.ai.cog.spatialUnderstanding) : 0) : null));
      if (dep) asg("DEPTH", dep);
    }
    // 4) FIJADOR: un delantero pegado a la última línea (target/false 9 quedan fuera de este rol)
    const fixer = best("FIXER", (p, s) => (p.role === "FWD" ? 0.6 + (p.style === "Target Man" ? 0.4 : 0) - (p.style === "False 9" ? 0.6 : 0) - DM.abs(p.z) * 0.02 : null));
    if (fixer) asg("FIXER", fixer);
    // 5) APOYO corto — con el poseedor aislado se manda un cuerpo más (hasta 3) y más cerca (video
    // "desmarque de apoyo": acercarse al portador, no un offset fijo de ~11 m sin mirar la
    // situación); el jugador de mejor lectura espacial es el preferido para llenar el hueco.
    const nSupport = isolated ? DM.min(3, this.ball.x * d > 20 ? 2 : 3) : this.ball.x * d > 20 ? 1 : 2;
    for (let i = 0; i < nSupport; i++) {
      const sup = best("SUPPORT", (p) => {
        const dd = DM.hypot(p.x - carrier.x, p.z - carrier.z), targetD = isolated ? 7 : 11;
        return dd < 24 ? 1 - DM.abs(dd - targetD) / 14 + (p.role === "MID" ? 0.2 : 0) + (isolated ? 0.2 + 0.25 * p.ai.cog.spatialUnderstanding : 0) : null;
      });
      if (sup) asg("SUPPORT", sup);
    }
    // 6) CREADOR DE ESPACIO: delantero/mediapunta con marcador central cerca y un beneficiario que ataca detrás.
    // v16 (video delantero #7, "engaño"): también se activa sin un runner ya en marcha si el
    // poseedor está aislado — el marcado que no va a recibir este ciclo debe liberar espacio para
    // otro en vez de quedarse fijo esperando la pelota que no le va a llegar.
    const hasRunner = Object.values(R).some((r) => r === "DEPTH" || r === "WIDTH");
    if (hasRunner || isolated) {
      const cre = best("SPACE_CREATOR", (p) => { if (p.role === "DEF") return null; const mk = this.ai2NearestOpp(p, 6.5, opps); return mk ? 0.4 + p.personality.creativity * 0.006 + p.stats.intelligence * 0.003 + (p.style === "False 9" ? 0.4 : 0) + (isolated ? 0.15 * p.ai.cog.decisionQuality : 0) : null; });
      if (cre) asg("SPACE_CREATOR", cre);
    }
    // 7) TERCER HOMBRE y RUPTURA extra
    const third = best("THIRD_MAN", (p) => { if (p.role === "DEF") return null; const dd = DM.hypot(p.x - carrier.x, p.z - carrier.z); return dd > 13 && dd < 28 ? 0.5 + p.stats.intelligence * 0.004 - DM.abs(dd - 19) * 0.02 : null; });
    if (third) asg("THIRD_MAN", third);
    // llegadores: más cuerpos atacando el área cuando la jugada está en el último tercio (spec #14)
    const nRun = 1 + (this.ball.x * d > 18 ? 1 : 0) + (tt.attackingPlayers > 0.3 ? 1 : 0);
    for (let i = 0; i < nRun; i++) {
      const run = best("RUNNER", (p) => (p.role !== "DEF" ? p.stats.speed * 0.006 + this.pcSpace(tm, p.x + 8 * d, p.z) + (p.role === "FWD" ? 0.15 : 0) + p.ai.boldness * 0.15 : null), 0.1);
      if (run) asg("RUNNER", run);
    }
    for (const p of pool) {
      const r = R[p.id] || null;
      if (p.ai.role !== r) { p.ai.role = r; p.ai.roleAt = now; }
      p.ai.dintent = null;
    }
    carrier.ai.role = "BALL_CARRIER";
    carrier.ai.dintent = null;
  },
  ai2NearestOpp(p, maxD, list) {
    let b = null, bd = maxD;
    for (const q of list) { const dd = DM.hypot(q.x - p.x, q.z - p.z); if (dd < bd) { bd = dd; b = q; } }
    return b;
  },
  // ------------------------------------------------------------------ DEFENSIVE COORDINATOR (spec #15, #22, #23)
  ai2DefAnchor(l) {
    const d = this.direction(l.team), id = this.teamTactics(l.team), p = this.formationSlot(l.team, l.index), e = this.ball,
      u = te(e.x * d * 0.52 + 2, -23, 22);
    // v16 (pedido explícito, video de laterales): el lateral del lado CONTRARIO al balón no debe
    // quedar más alto que su extremo, o un contragolpe tras pérdida lo deja mal parado. No hay una
    // referencia barata a "su extremo" acá (el coordinador corre aparte, a otra frecuencia), así que
    // se acota directamente cuánto puede adelantarse ese lateral mientras la jugada está clara del
    // otro lado — un defensor de mejor lectura espacial respeta este límite casi siempre, uno
    // limitado lo hace menos.
    const isFarSideFB = l.role === "DEF" && DM.abs(p[1]) > 10 && DM.abs(e.z) > 12 && DM.sign(e.z) !== DM.sign(p[1]),
      cap = isFarSideFB ? 22 - 16 * (l.ai ? l.ai.cog.spatialUnderstanding : 0.4) : 22,
      uCapped = te(u, -23, cap);
    // la altura de la línea del manager (defensiveLine/mentalidad) desplaza toda la línea, no sólo escala el ajuste por balón
    return { x: (p[0] + uCapped + (id.line - 1) * 11) * d, z: p[1] * d * id.defensiveWidth * id.compactness + e.z * 0.16 };
  },
  // Punto de guardia: el defensor no sólo persigue hombres — protege el ESPACIO de mayor valor rival
  // cercano a su ancla, usando el mapa de control (spec #23).
  ai2GuardPoint(l, ax, az, rad = 6) {
    const opp = 1 - l.team, d = this.direction(l.team);
    let bx = ax, bz = az, bs = -1e9;
    for (let k = 0; k < 9; k++) {
      const ox = ((k % 3) - 1) * rad * 0.8, oz = (DM.floor(k / 3) - 1) * rad;
      const x = te(ax + ox, -50, 50), z = te(az + oz, -31, 31), thr = this.pcSpace(opp, x, z) * (0.35 + 0.65 * this.pcControl(opp, x, z));
      let s = thr * 1.4 - 0.012 * DM.hypot(ox, oz);
      // sostén de la línea: no adelantarse por encima de la ancla en zona propia (evita romper la línea)
      if (l.role === "DEF" && ox * d > 2) s -= 0.15;
      if (s > bs) { bs = s; bx = x; bz = z; }
    }
    return { x: bx, z: bz };
  },
  ai2CoordDefense(tm) {
    const now = this.elapsed, d = this.direction(tm), tt = this.teamTactics(tm), b = this.brain[tm], opTeam = 1 - tm;
    const car = this.owner && this.owner.team !== tm ? this.owner : null, ball = this.ball;
    const cx = car ? car.x : ball.x, cz = car ? car.z : ball.z;
    const mine = this.ai2Outfield(tm).filter((p) => !p.ragdoll), opps = this.ai2Outfield(opTeam), taken = new Set(), I = {};
    const set = (p, role, ref, extra) => { if (!p || taken.has(p.id)) return false; taken.add(p.id); I[p.id] = { role, ref: ref ?? null, ...extra }; return true; };
    // ---- 1) PRESIÓN: presupuesto colectivo (no "todos a la pelota")
    const carDanger = car ? this.dangerAt(car.x, car.z, opTeam) : 0;
    const threatOf0 = (a) => ai2Clamp(this.dangerAt(a.x, a.z, opTeam) * 1.6, 0, 1.3);
    let budget = 1 + (b.highPress ? 1 : 0) + (tt.pressingIntensity > 1.12 ? 1 : 0) + (tt.pressingIntensity > 1.32 ? 1 : 0) - (carDanger > 0.55 ? 1 : 0) - (tt.pressingIntensity < 0.8 ? 1 : 0);
    budget = ai2Clamp(budget, car && carDanger > 0.3 ? 1 : 0, 3); // cerca del arco siempre alguien contiene
    // ---- 0) MARCA INNEGOCIABLE (pedido explícito): nadie que vigila a un delantero cerca del arco lo suelta para
    // presionar, cubrir, bloquear pases o equilibrar. Se reserva antes que todo lo demás; sólo se libera al que marca al
    // poseedor (ése sí puede salir a presionar). Los defensores se quedan del lado del arco, entre el rival y la portería.
    for (const p of mine) {
      const mid = this.marks ? this.marks[p.id] : null, atk = mid != null ? this.players[mid] : null;
      if (!atk || atk.sentOff || atk === car) continue;
      const dGoal = atk.x * d + 52.5;
      if ((p.role === "DEF" && (dGoal < 40 || threatOf0(atk) > 0.3)) || (p.role === "MID" && dGoal < 22)) set(p, DM.hypot(atk.vx, atk.vz) > 4.2 ? "TRACK" : "MARK", atk.id, { at: now, locked: true });
    }
    // Fase 9: THREAT MAP operativo — peligro de cada atacante ahora / tras recibir / tras conducir / a la espalda / de remate.
    // Todo lo que sigue (quién presiona, quién bloquea líneas, a quién se marca) decide con "qué pasa si lo abandono".
    const tmap = car ? this.p1ThreatMap(tm) : (this.p1S().threat[tm] = []), thr = new Map(tmap.map((e) => [e.p.id, e]));
    const threatOf = (a) => { const e = thr.get(a.id); return e ? ai2Clamp(e.total * 1.6, 0, 1.3) : 0; };
    const leaveCost = (p) => { let c = 0; for (const e of tmap) if (DM.hypot(e.p.x - p.x, e.p.z - p.z) < 9) c += ai2Clamp(e.total * 1.6, 0, 1.2); return c; };
    // un defensor central/lateral no sale a presionar lejos ni hace de cubridor si hay una ruptura detrás de la línea que él vigila
    const backThreat = (p) => p.role === "DEF" && tmap.some((e) => e.behind > 0.2 && DM.hypot(e.p.x - p.x, e.p.z - p.z) < 16);
    const speedOf = (p) => 4.4 + p.stats.speed * 0.037;
    const presserCost = (p) => {
      // Fase 18/25: "qué pasa si salgo a presionar" es lectura espacial + disciplina táctica, no sólo
      // intelligence cruda — spatialUnderstanding (CognitiveProfile) ya combina ambas.
      const dd = DM.hypot(p.x - cx, p.z - cz), eta = dd / speedOf(p), spat = p.ai.cog.spatialUnderstanding;
      const behind = p.role === "DEF" ? 1.1 * this.pcSpace(opTeam, p.x - d * 3, p.z) * (1.25 - spat) : p.role === "MID" ? 0.35 * this.pcSpace(opTeam, p.x - d * 3, p.z) : 0;
      const wasP = p.ai.dintent && p.ai.dintent.role === "PRESS" && now - p.ai.dintent.at < 2 ? 0.35 : 0;
      return eta - (p.personality.aggression / 100 - 0.5) * 0.5 - wasP + behind * (p.ai.tacticalDiscipline * 0.8 + 0.4) + 0.45 * leaveCost(p) * (0.4 + 0.6 * p.ai.cog.spatialUnderstanding);
    };
    const ranked = mine.slice().sort((a, c) => presserCost(a) - presserCost(c));
    const pressers = [];
    if (car) for (const p of ranked) { if (pressers.length >= budget) break; if (DM.hypot(p.x - cx, p.z - cz) / speedOf(p) < 4.6 && !(backThreat(p) && DM.hypot(p.x - cx, p.z - cz) > 9)) { set(p, "PRESS", car.id, { at: now }); pressers.push(p); } }
    // ---- 2) COBERTURA detrás del presionador
    if (pressers.length) {
      // Fase 9: el cubridor NO puede ser quien deja sin vigilar a un atacante peligroso (coste de abandono) — se elige por distancia + amenaza que abandona
      const pr = pressers[0], cov = mine.filter((p) => !taken.has(p.id)).sort((a, c) => (DM.hypot(a.x - pr.x, a.z - pr.z) - a.ai.tacticalDiscipline * 3 + 5 * leaveCost(a) + (backThreat(a) ? 9 : 0)) - (DM.hypot(c.x - pr.x, c.z - pr.z) - c.ai.tacticalDiscipline * 3 + 5 * leaveCost(c) + (backThreat(c) ? 9 : 0)))[0];
      cov && set(cov, "COVER", pr.id, { at: now });
    }
    // ---- 3) BLOQUEO DE LÍNEA DE PASE hacia los receptores más peligrosos (espacio/peligro antes que marca)
    if (car) {
      const threats = opps.filter((a) => a !== car && DM.hypot(a.x - car.x, a.z - car.z) > 6).map((a) => ({ a, v: threatOf(a) * 0.8 + (1 - this.pcControl(tm, a.x, a.z)) * 0.2 })).sort((x, y) => y.v - x.v).slice(0, 2);
      for (const th of threats) {
        if (th.v < 0.3) continue;
        const mx = (car.x + th.a.x) / 2, mz = (car.z + th.a.z) / 2;
        const blk = mine.filter((p) => !taken.has(p.id) && p.role !== "DEF").sort((x, y) => DM.hypot(x.x - mx, x.z - mz) - DM.hypot(y.x - mx, y.z - mz))[0];
        if (blk && DM.hypot(blk.x - mx, blk.z - mz) < 14) set(blk, "LANE_BLOCK", th.a.id, { at: now });
      }
    }
    // ---- 4) PANTALLA (mediocentro que protege la zona central) y EQUILIBRIO (lado débil)
    const scr = mine.filter((p) => !taken.has(p.id) && p.role === "MID").sort((x, y) => DM.abs(x.z - cz * 0.4) - DM.abs(y.z - cz * 0.4))[0];
    if (scr && (carDanger > 0.2 || DM.abs(cz) < 22)) set(scr, "SCREEN", null, { at: now });
    const bal = mine.filter((p) => !taken.has(p.id) && DM.abs(this.formationSlot(tm, p.index)[1]) > 12 && DM.sign(this.formationSlot(tm, p.index)[1] * d) !== DM.sign(cz || 1)).sort((x, y) => DM.abs(x.z) - DM.abs(y.z))[0];
    bal && set(bal, "BALANCE", null, { at: now });
    // ---- 5) MARCA / SEGUIMIENTO (sólo a atacantes peligrosos o cerca del arco) y CAÍDA (protege profundidad)
    const runnersAhead = opps.filter((a) => (a.x * d + 52.5) < 36 && DM.hypot(a.vx, a.vz) > 4.2 && (a.vx * -d) > 1.5).length;
    for (const p of mine) {
      if (taken.has(p.id)) continue;
      const mid = this.marks ? this.marks[p.id] : null, atk = mid != null ? this.players[mid] : null, near = atk && (atk.x * d + 52.5) < 34 && !atk.sentOff;
      if (atk && (near || threatOf(atk) > 0.3) && p.role === "DEF") { set(p, DM.hypot(atk.vx, atk.vz) > 4.2 ? "TRACK" : "MARK", atk.id, { at: now }); continue; }
      if (p.role === "DEF" && (runnersAhead > 0 || (car && carDanger > 0.3 && DM.hypot(car.x - p.x, car.z - p.z) > 12))) { set(p, "DROP", null, { at: now, depth: 2.5 + runnersAhead * 1.5 }); continue; }
      set(p, "HOLD", null, { at: now });
    }
    // ---- 6) ERRORES HUMANOS de defensa (spec #16/#22/#24): poco frecuentes, dependientes de contexto
    const errBase = 0.0011 * (this.ai2ErrScale ?? 1) * (1 + (tt.pressingIntensity - 1) * 0.35 + (tt.defensiveLine - 1) * 0.25) * (tt.compactness > 1.05 ? 0.85 : 1);
    for (const p of mine) {
      const it = I[p.id], ai = p.ai;
      if (!it) continue;
      if (it.locked || (p.role === "DEF" && opps.some((a) => a.x * d + 52.5 < 32))) { ai.err = null; continue; } // sin fallos humanos con un delantero cerca del arco
      if (ai.errCooldown > now) { if (ai.err && ai.err.until > now) it.err = ai.err; continue; }
      if (ai.err && ai.err.until <= now) ai.err = null;
      const antic = ai.anticipation, fatigue = (100 - (p.stamina ?? 100)) / 100, pr = this.pcPress(tm, p.x, p.z);
      const pe = errBase * (1.65 - antic) * (0.7 + 0.8 * fatigue + 0.5 * pr) * (1.25 - p.personality.consistency / 200) * (1.3 - ai.tacticalDiscipline * 0.5);
      if (this.random() >= pe) continue;
      ai.errCooldown = now + this.range(6, 14);
      const r = this.random();
      if (it.role === "PRESS") {
        ai.err = { type: "late_press", until: now + 1, delay: this.range(0.35, 0.75) };
        ai.reactUntil = now + ai.err.delay;
        this.ai2Count(p, "late_reactions");
      } else if (it.role === "MARK" || it.role === "TRACK") {
        ai.err = { type: "lost_mark", until: now + 1.8, stale: { x: p.x, z: p.z } };
        this.ai2Count(p, "missed_marks");
      } else if (car && r < (p.role === "DEF" && DM.abs(this.formationSlot(tm, p.index)[1]) > 15 ? 0.7 : 0.4)) {
        ai.err = { type: "ball_watch", until: now + this.range(1.6, 2.6) };
        this.ai2CountTeam(tm, "space_leaks");
      } else if (r < 0.75) {
        const other = mine.find((q) => q !== p && !q.ai.err && DM.hypot(q.x - p.x, q.z - p.z) < 12 && q.ai.errCooldown < now);
        if (other) {
          p.ai.err = { type: "assume_cover", until: now + 1.7 };
          other.ai.err = { type: "assume_cover", until: now + 1.7 };
          other.ai.errCooldown = now + 8;
          this.ai2Count(p, "assumed_cover_events");
          this.ai2Count(p, "missed_marks");
        }
      } else {
        ai.err = { type: "late_react", until: now + 1, delay: this.range(0.3, 0.6) };
        ai.reactUntil = now + ai.err.delay;
        this.ai2Count(p, "late_reactions");
      }
      it.err = ai.err;
    }
    // "dos salen sobre el mismo rival": segunda pressión no prevista por el presupuesto → pressing descoordinado
    if (car && pressers.length >= 1 && mine.length && this.random() < 0.01 * (this.ai2ErrScale ?? 1) * (1.3 - tt.compactness * 0.2)) {
      const extra = mine.filter((p) => !taken.has(p.id) || I[p.id].role === "HOLD").sort((x, y) => DM.hypot(x.x - cx, x.z - cz) - DM.hypot(y.x - cx, y.z - cz))[0];
      if (extra && DM.hypot(extra.x - cx, extra.z - cz) < 18 && extra.ai.errCooldown < now) {
        I[extra.id] = { role: "PRESS", ref: car.id, at: now, err: { type: "double_press", until: now + 1.8 } };
        extra.ai.errCooldown = now + 8;
        this.ai2Count(extra, "bad_press_events");
      }
    }
    // persistencia: no cambiar de rol no crítico más de una vez cada ~0.9 s (anti-oscilación)
    for (const p of mine) {
      const ai = p.ai, prev = ai.dintent, it = I[p.id];
      if (!it) continue;
      const critical = it.role === "PRESS" || it.role === "COVER";
      if (prev && !critical && !it.locked && prev.role !== it.role && now - prev.since < 0.9 && prev.role !== "PRESS" && prev.role !== "COVER") { prev.at = now; ai.role = prev.role; if (it.err) prev.err = it.err; continue; }
      it.since = prev && prev.role === it.role ? prev.since : now;
      ai.dintent = it;
      ai.role = it.role;
    }
    for (const p of this.players) if (p.team === tm && p.role !== "GK" && !I[p.id] && p.ai) { p.ai.dintent = null; p.ai.role = null; }
  },
  // ------------------------------------------------------------------ POSICIÓN DEFENSIVA POR ROL (por frame, barato)
  ai2PositionDefend(l, f0, g0, d) {
    const it = l.ai && l.ai.dintent;
    if (!it || this.elapsed - it.at > 1.2) return null;
    const now = this.elapsed, ai = l.ai, e = this.ball, car = this.owner, id = this.teamTactics(l.team), err = it.err && it.err.until > now ? it.err : null;
    // reacción tardía: el jugador mantiene el rumbo anterior un instante (spec #16 "salir tarde", "reaccionar tarde")
    if (ai.reactUntil > now && ai.lastPos) return { x: ai.lastPos.x, z: ai.lastPos.z, v: 0.9, sprint: false, role: "LATE" };
    const anc = this.ai2DefAnchor(l), tr = this.transitionMode[l.team], retreating = tr && tr.until > now && tr.mode === "immediate_retreat";
    let x = anc.x, z = anc.z, v = 0.98, sprint = false, state = "Defend", role = it.role, faceAt = null;
    const ref = it.ref != null ? this.players[it.ref] : null;
    // Fase 8/9 (autoridad única): si la referencia del intent (rival presionado/marcado) ya no es
    // válida (se fue del campo entre el tick del coordinador y este frame), el jugador NUNCA debe
    // quedarse con el rol/objetivo legacy que updatePlayers() precalculó como semilla — siempre debe
    // recibir una decisión final de AI2, aunque sea la de espera por defecto, para que no puedan
    // convivir dos autoridades (coordinador + heurística legacy por rango) sobre el mismo jugador.
    const guardFallback = () => {
      const g = this.ai2GuardPoint(l, anc.x, anc.z, l.role === "DEF" ? 4 : 6);
      return { x: g.x, z: g.z, state: "Defend", role: l.role === "MID" ? "PROTECT_SPACE" : "HOLD_LINE" };
    };
    switch (it.role) {
      case "PRESS": {
        if (!ref || ref.sentOff) { const fb = guardFallback(); x = fb.x; z = fb.z; state = fb.state; role = fb.role; break; }
        state = "Press";
        if (car && ref === car && !retreating) {
          // Fase 5-7: el defensor decide por PELIGRO (timeToShot vs timeToContact), no por "sigo a X metros": cierra y entra al
          // duelo si llega antes de que el atacante pueda hacer daño, se planta en la línea de tiro si no llega, o contiene.
          const df = this.p1DefendCarrier(l, car, { press: id.press });
          x = df.x; z = df.z; sprint = df.sprint; v = df.v;
          // ver nota de más arriba (updatePlayers): SHOT_BLOCK no cuenta como PRESS.
          role = df.mode === "CONTAIN" ? "CONTAIN" : df.mode === "SHOT_BLOCK" ? "SHOT_BLOCK" : "PRESS";
          if (role === "CONTAIN" || role === "SHOT_BLOCK") faceAt = { x: car.x, z: car.z };
        } else {
          const tg = 0.5 + (l.personality.aggression - 50) * 0.005;
          x = ref.x + ref.vx * 0.3 - d * (retreating ? 2.6 : tg);
          z = ref.z + ref.vz * 0.3;
          const dd = DM.hypot(l.x - ref.x, l.z - ref.z);
          sprint = !retreating && dd > 4.5 * id.press;
          v = (retreating ? 0.85 : 1.04) * id.press;
          role = retreating ? "CONTAIN" : "PRESS";
        }
        if (err && err.type === "double_press") role = "PRESS_DESCOORD";
        break;
      }
      case "COVER": {
        const pr = ref && !ref.sentOff ? ref : null;
        if (!pr) { const fb = guardFallback(); x = fb.x; z = fb.z; state = fb.state; role = fb.role; break; }
        // Shot denial (Fase 7): si el poseedor puede tirar antes de que el presionador llegue, el cubridor cierra la línea de tiro.
        const sb = car && car.team !== l.team ? this.p1ShotLaneBlock(l, car) : null;
        if (sb) { x = sb.x; z = sb.z; sprint = sb.sprint; v = sb.v; state = "Block"; role = "CONTAIN"; break; }
        const inside = -DM.sign(pr.z || 1) * 2.4;
        x = pr.x - d * 5.6;
        z = pr.z * 0.6 + inside;
        sprint = DM.hypot(x - l.x, z - l.z) > 8;
        v = 1.02;
        state = "Cover";
        role = l.role === "MID" ? "SCREEN_PASS" : "COVER";
        break;
      }
      case "LANE_BLOCK": {
        const t = ref && !ref.sentOff ? ref : null, c0 = car || e;
        if (!t) { const fb = guardFallback(); x = fb.x; z = fb.z; state = fb.state; role = fb.role; break; }
        x = c0.x + (t.x - c0.x) * 0.48 - d * 0.8;
        z = c0.z + (t.z - c0.z) * 0.48;
        sprint = DM.hypot(x - l.x, z - l.z) > 7;
        v = 1.03;
        state = "Block";
        role = "PASS_LANE_BLOCK";
        break;
      }
      case "MARK":
      case "TRACK": {
        const mk = ref && !ref.sentOff ? ref : null;
        if (!mk) { const fb = guardFallback(); x = fb.x; z = fb.z; state = fb.state; role = fb.role; break; }
        const ant = te((l.stats.intelligence + l.personality.consistency) / 2, 40, 95), gs = te(3.4 + (95 - ant) * 0.04 - id.marking * 1.1, 0.7, 6.2);
        const px = err && err.type === "lost_mark" ? err.stale.x : mk.x, pz = err && err.type === "lost_mark" ? err.stale.z : mk.z;
        // Fase (pedido explícito): ante una carrera de ruptura (TRACK, o el rival corriendo fuerte)
        // se pega mucho más cerca y sigue casi todo el peso al rival en vez de comprometer hacia la
        // línea del equipo — antes eso dejaba a los delanteros irse solos porque nadie los seguía.
        const breaking = it.role === "TRACK" || DM.hypot(mk.vx, mk.vz) > 4.2, isDef = l.role === "DEF";
        // Un defensor sostiene la marca pegado y del lado del arco: sigue al rival casi todo el peso y se cierra
        // un poco hacia el centro del arco (cubre la portería a su espalda) en vez de volver a la línea.
        const danger = (mk.x * d + 52.5) < 30, gsEff = breaking ? gs * 0.5 : isDef && danger ? DM.min(gs, 2.4) : gs, trackW = isDef ? (breaking ? 0.95 : danger ? 0.86 : 0.55) : breaking ? 0.9 : 0.5;
        x = px + mk.vx * 0.3 - d * gsEff;
        z = pz + mk.vz * 0.3;
        if (isDef && danger) z *= 0.86;
        x = x * trackW + anc.x * (1 - trackW);
        z = z * (isDef && (danger || breaking) ? 0.9 : breaking ? 0.88 : 0.6) + anc.z * (isDef && (danger || breaking) ? 0.1 : breaking ? 0.12 : 0.4);
        sprint = DM.hypot(x - l.x, z - l.z) > 11;
        state = "Mark";
        role = it.role === "TRACK" ? "TRACK_RUN" : "MARK";
        faceAt = { x: mk.x, z: mk.z };
        break;
      }
      case "SCREEN": {
        const g = this.ai2GuardPoint(l, anc.x, anc.z * 0.6 + e.z * 0.15, 6);
        x = g.x; z = g.z;
        sprint = DM.hypot(x - l.x, z - l.z) > 9;
        v = 1.0;
        state = "Block";
        role = "SCREEN";
        break;
      }
      case "BALANCE": {
        const gx = -52.5 * d, k = te(0.34 + (l.stats.intelligence - 70) * 0.004, 0.22, 0.46);
        x = gx + (e.x - gx) * (1 - k);
        z = e.z * (1 - k) * 0.5 - DM.sign(e.z || 1) * 3;
        sprint = DM.hypot(x - l.x, z - l.z) > 7;
        v = 1.0;
        state = "Block";
        role = "BALANCE";
        break;
      }
      case "DROP": {
        // Fase 5: un defensor de mejor anticipación empieza a retroceder más antes de que la
        // ruptura sea obvia (cae un poco más profundo ante la misma amenaza); uno de baja
        // anticipación reacciona más pegado a lo que ya está viendo ahora mismo.
        x = anc.x - d * (it.depth || 3) * te(0.97 + 0.06 * ai.cog.anticipation, 0.97, 1.03);
        z = anc.z;
        state = "Defend";
        role = "DROP";
        break;
      }
      default: {
        const g = this.ai2GuardPoint(l, anc.x, anc.z, l.role === "DEF" ? 4 : 6);
        x = g.x; z = g.z;
        state = "Defend";
        role = l.role === "MID" ? "PROTECT_SPACE" : "HOLD_LINE";
      }
    }
    // errores que cambian el objetivo
    if (err) {
      if (err.type === "ball_watch") { x = x * 0.4 + e.x * 0.6; z = z * 0.4 + e.z * 0.6; role = "BALL_WATCH"; }
      else if (err.type === "assume_cover") { x = l.x; z = l.z; v = 0.55; role = "ASSUME_COVER"; sprint = false; }
    }
    if (retreating) x -= 3.5 * d;
    const my = this.teams[l.team].mentality;
    if (my === "defensive") x -= 4 * d;
    if (my === "attacking") x += 1.5 * d;
    x += this.urgency(l.team) * 0.5 * d;
    ai.lastPos = { x: l.x, z: l.z };
    return { x: te(x, -50, 50), z: te(z, -31, 31), v, sprint, state, role, faceAt };
  },
  // ------------------------------------------------------------------ POSICIONAMIENTO SIN BALÓN POR CANDIDATOS (spec #11)
  ai2PositionAttack(l, f0, g0, d, counter) {
    const ai = l.ai, now = this.elapsed;
    const role = ai.role && ai.role !== "BALL_CARRIER" ? ai.role : "NONE";
    if (now >= ai.nextEval || ai.posRole !== role) {
      ai.nextEval = now + 0.55 + ((l.id * 37) % 17) * 0.03;
      ai.posRole = role;
      this.ai2EvalPosition(l, f0, g0, d, counter, role);
    }
    if (ai.posKind === "anchor") return { x: f0, z: g0, role: ai.roleTag || l.tacticalRole };
    // el objetivo elegido persiste (anti-jitter) pero como OFFSET relativo a la pelota o al ancla en vivo,
    // así el equipo no se queda rezagado cuando la jugada avanza rápido.
    const cur = this.ai2TargetNow(l, f0, g0);
    let x = cur.x, z = cur.z;
    if (!counter && (l.role === "FWD" || l.role === "MID")) {
      const offLine = this.offsideLineX(l);
      if (offLine != null && role !== "REST_DEFENSE") x = DM.min(x * d, offLine * d + 1.6) * d;
    }
    return { x, z, role: ai.roleTag, v: ai.posV, sprint: ai.posSprint, state: ai.posState };
  },
  ai2TargetNow(l, f0, g0) {
    const ai = l.ai, b = this.ball;
    if (ai.posRef === "ball") return { x: te(b.x + ai.ox, -48, 48), z: te(b.z + ai.oz, -31, 31) };
    if (ai.posRef === "anchorX") return { x: te(f0 + ai.ox, -48, 48), z: ai.tz };
    if (ai.posRef === "anchor") return { x: te(f0 + ai.ox, -48, 48), z: te(g0 + ai.oz, -31, 31) };
    return { x: ai.tx, z: ai.tz };
  },
  ai2EvalPosition(l, f0, g0, d, counter, role) {
    const ai = l.ai, tm = l.team, b = this.ball, W = AI2_ROLE_FIT[role] || AI2_ROLE_FIT.NONE, s = DM.sign(g0 || l.z || 1) || 1;
    const carrier = this.owner && this.owner.team === tm ? this.owner : this.receiver || this.lastTouch || { x: b.x, z: b.z };
    const cxb = b.x, czb = b.z, opps = this.ai2Outfield(1 - tm), mates = this.ai2Outfield(tm), mk = this.ai2NearestOpp(l, 6.5, opps);
    ai.marker = mk;
    const offLine = this.offsideLineX(l), offAdv = offLine != null ? offLine * d : 99, tt = this.teamTactics(tm);
    const cl = (x, z) => [te(x, -48, 48), te(z, -31, 31)];
    const C = [];
    const add = (kind, xy) => { if (xy) C.push({ kind, x: xy[0], z: xy[1] }); };
    add("anchor", [f0, g0]);
    add("support", cl(cxb - d * 5, czb + s * 9));
    add("support", cl(cxb + d * 6, czb + s * 11));
    add("lateral", cl(cxb - d * 1, czb + s * 15));
    add("halfspace", cl(f0 + d * 3, s * 11));
    add("depth", cl(DM.min(f0 + d * 10, (offAdv + 1.2) * d), g0));
    add("width", cl(f0, s * 29.5));
    if (mk) { const ux = mk.x - cxb, uz = mk.z - czb, ul = DM.hypot(ux, uz) || 1; add("blind", cl(mk.x + (ux / ul) * 2.5, mk.z + (uz / ul) * 2.5)); }
    { // entre líneas: carril más libre según el mapa de control
      const bx = ((this.pc.line[tm] - 7) * d) , lanes = [-12, 0, 12];
      let bz = 0, bv = -1;
      for (const z of lanes) { const v = this.pcSpace(tm, bx, z) - DM.abs(z - g0) * 0.004; if (v > bv) { bv = v; bz = z; } }
      add("between", cl(bx, bz));
    }
    add("cover", cl(cxb - d * 18, g0 * 0.6));
    { // ocupar: mejor celda local (valor de espacio × control alcanzable)
      const g = this.pc, k0 = this.ai2CellIdx(f0, g0), i0 = k0 % g.gx, j0 = DM.floor(k0 / g.gx);
      let bk = k0, bv = -1;
      for (let j = DM.max(0, j0 - 2); j <= DM.min(g.gz - 1, j0 + 2); j++)
        for (let i = DM.max(0, i0 - 3); i <= DM.min(g.gx - 1, i0 + 3); i++) { const k = j * g.gx + i, v = this.ai2SpaceUtility(tm, g.cx[k], g.cz[k]) - 0.01 * DM.hypot(g.cx[k] - f0, g.cz[k] - g0); if (v > bv) { bv = v; bk = k; } }
      add("occupy", cl(g.cx[bk], g.cz[bk]));
    }
    // llegada al área: con la pelota en el último tercio los atacantes atacan primer palo / punto penal / segundo palo
    if ((l.role === "FWD" || (l.role === "MID" && ai.boldness > 0.45)) && role !== "REST_DEFENSE" && cxb * d > 22) {
      const gx = 52.5 * d, bsd = DM.sign(czb) || 1, sp = (l.id + DM.floor(this.elapsed / 3)) % 3;
      add("box", sp === 0 ? cl(gx - 6 * d, bsd * 3.5) : sp === 1 ? cl(gx - 11 * d, -bsd * 1.5) : cl(gx - 5.5 * d, -bsd * 8.5));
    }
    { const kn = this.ai2TargetNow(l, f0, g0); add("keep", [kn.x, kn.z]); }
    add("stay", cl(l.x, l.z));
    const roleR = { NONE: 30, SUPPORT: 16, WIDTH: 20, DEPTH: 28, RUNNER: 30, FIXER: 14, THIRD_MAN: 24, SPACE_CREATOR: 26, REST_DEFENSE: 8 }[role] || 24;
    let best = null, bs = -1e9;
    for (const c of C) {
      const k = this.ai2CellIdx(c.x, c.z), own = this.pcControl(tm, c.x, c.z), fit = (W.fit[c.kind === "keep" || c.kind === "stay" ? ai.posKind : c.kind] || 0);
      const dist = DM.hypot(c.x - l.x, c.z - l.z), adv = c.x * d, prog = ai2Sat(((c.x - l.x) * d + 4) / 16);
      const dBall = DM.hypot(c.x - cxb, c.z - czb), suppV = ai2Sat(1 - DM.abs(dBall - 13) / 12);
      let crowd = 0;
      for (const m of mates) if (m !== l && DM.hypot(m.x - c.x, m.z - c.z) < 5.5) crowd += 0.22;
      let gen = 0;
      if (W.gen > 0.1 && mk && c.kind !== "anchor" && c.kind !== "keep" && c.kind !== "stay") { const sg = this.ai2SpaceGen(l, c.x, c.z, mk); if (sg) { gen = sg.gen; c.sg = sg; } }
      const offside = (l.role !== "DEF" && !counter && adv > offAdv + (role === "RUNNER" || role === "DEPTH" ? 0.4 : 0.1)) ? 0.8 * (0.6 + ai.tacticalDiscipline * 0.5) : 0;
      const dAnc = DM.hypot(c.x - f0, c.z - g0), conflict = DM.max(0, dAnc - roleR) * 0.03 * (0.5 + ai.tacticalDiscipline);
      const stay = W.stay ? W.stay * ai2Sat(1 - dAnc / 14) : 0;
      // compensación defensiva: si el equipo está muy expuesto atrás, valora estar cerca de la línea de descanso
      const trans = tt.phase === "attacking" ? 0 : 0;
      let sc = fit * (role === "NONE" ? 1 : 1.6) + W.space * this.ai2SpaceUtility(tm, c.x, c.z) + W.ctrl * (own - 0.5) + W.access * this.pc.acc[k] + W.prog * prog * (0.5 + 0.5 * (tt.attackingPlayers > 0 ? 1 : 0.6)) +
        W.gen * gen + W.supp * suppV * 0.6 + stay + trans - crowd - this.pcPress(tm, c.x, c.z) * 0.4 - offside - dist * 0.014 - conflict;
      // Fase 10/11: línea de pase real, triángulos, beneficio al compañero y anti-persecución de la pelota
      sc += this.p1PosExtras(l, c, carrier, opps, mates, role);
      // Fase 11: "NO todos los jugadores deben valorar igual el mismo espacio" — un jugador de
      // baja spatialUnderstanding no siempre identifica la celda objetivamente mejor; ruido
      // determinístico (no toca this.random(), ver nota de Fase 7 más arriba) acotado por faceta,
      // estable durante todo el ciclo de reevaluación (ai.nextEval, cada ~0.55s) para no generar
      // jitter frame a frame.
      sc += (1 - l.ai.cog.spatialUnderstanding) * 0.15 * (ai2Hash(l.id + "|pos|" + DM.floor(this.elapsed / 0.55)) - 0.5);
      if (c.kind === "keep") sc += 0.1; // histéresis: mantener el objetivo actual salvo mejora clara
      if (c.kind === "anchor") sc += 0.04;
      // instrucciones del manager (carrileros ofensivos / wide / inside / attack) → utilidades, no scripts
      const instr = this.playerRoles && this.playerRoles[l.id];
      if (instr === "wide" && c.kind === "width") sc += 0.12;
      if (instr === "inside" && c.kind === "halfspace") sc += 0.12;
      if ((instr === "attack" || instr === "attacking") && (c.kind === "depth" || c.kind === "width")) sc += 0.1;
      if (instr === "hold" && (c.kind === "cover" || c.kind === "anchor")) sc += 0.12;
      c.score = sc;
      if (sc > bs) { bs = sc; best = c; }
    }
    if (!best) return;
    const chosen = best.kind === "keep" || best.kind === "stay" ? ai.posKind : best.kind;
    ai.posKind = chosen === "anchor" ? "anchor" : chosen;
    if (best.kind !== "keep") {
      ai.tx = best.x; ai.tz = best.z;
      ai.posRef = chosen === "support" || chosen === "lateral" || chosen === "cover" ? "ball" : chosen === "width" || chosen === "box" ? "anchorX" : "anchor";
      ai.ox = ai.posRef === "ball" ? best.x - b.x : best.x - f0;
      ai.oz = ai.posRef === "ball" ? best.z - b.z : best.z - g0;
    }
    if (best.kind === "stay") { ai.tx = l.x; ai.tz = l.z; ai.posRef = "abs"; }
    ai.roleTag = role !== "NONE" ? role : { anchor: null, support: "SUPPORT", lateral: "SUPPORT", halfspace: "HALF_SPACE", depth: "DEPTH_RUN", width: "WIDTH", blind: "BLIND_SIDE_RUN", between: "BETWEEN_LINES", cover: "COVER_BEHIND", occupy: "OCCUPY_SPACE", box: "BOX_CRASH" }[chosen] || null;
    ai.posState = { box: "BoxCrash", support: "Support", halfspace: "ChannelRun", depth: "DepthRun", width: "WideRun", blind: "BlindSideRun", between: "BetweenLines", occupy: "Occupy" }[chosen] || "Positioning";
    const moving = DM.hypot(ai.tx - l.x, ai.tz - l.z);
    ai.posSprint = (chosen === "depth" || chosen === "blind" || role === "RUNNER" || role === "DEPTH") && moving > 6;
    ai.posV = role === "REST_DEFENSE" ? 0.9 : chosen === "depth" || chosen === "blind" ? 1.08 : 0.92;
    // ocupación / generación: evento de telemetría + hueco a evaluar
    if (best.sg && best.sg.gen > 0.1 && (role === "SPACE_CREATOR" || chosen === "support" || chosen === "between") && this.elapsed - (ai.lastGenAt || -9) > 4) {
      ai.lastGenAt = this.elapsed;
      this._aiHoles.push({ team: tm, creator: l.id, markerId: best.sg.marker.id, x: best.sg.hole.x, z: best.sg.hole.z, at: this.elapsed, m0: { x: best.sg.marker.x, z: best.sg.marker.z }, ben: best.sg.beneficiary ? best.sg.beneficiary.id : null, confirmed: false });
    }
    ai.occ = this.ai2SpaceUtility(tm, ai.tx, ai.tz);
  },
});

// ============================== EJECUCIÓN / PRIMER TOQUE / CONSECUENCIAS / DEBUG (spec #3, #4, #19–#21, #28–#30) ==============================
Object.assign(wc.prototype, {
  // ------------------------------------------------------------------ pase: ejecución contextual
  // Devuelve el vector de error (en metros, mundo) y el "golpeo corto" (underhit). El ERROR DE EJECUCIÓN
  // se registra aparte del ERROR DE DECISIÓN (ai.intent.decisionError): un pase bien elegido puede salir
  // mal y uno mal elegido puede salir perfecto.
  ai2ExecPass(t, e, cross, meta, o, c) {
    const ai = t.ai, cand = meta && meta.cand, dx0 = o - t.x, dz0 = c - t.z, dist = DM.hypot(dx0, dz0) || 1;
    const real = this.players.filter((q) => q.team !== t.team && !q.sentOff);
    const lane = this.ai2LaneRisk(t.x, t.z, o, c, real);
    const ex = this.ai2ExecQuality(t, "pass", { dist, loft: cross || e.loft, lane, dx: dx0, dz: dz0, through: e.kind === "through", first: !!ai.firstTime, improv: cand && cand.improv ? 1 : 0, cross });
    const q = ex.q, cn = t.personality.consistency / 100, mish = this.random() < (1 - cn) * 0.05 * (0.3 + ex.diff);
    let sig = DM.pow(1 - q, 1.5) * (0.9 + dist * 0.17);
    // cola pesada: golpeo defectuoso ocasional (más probable con poca calidad / poca consistencia)
    if (mish || this.random() < 0.01 + (1 - q) * 0.05 + (1 - cn) * 0.01) sig *= 3.2;
    const along = this.ai2Gauss() * sig, lat = this.ai2Gauss() * sig * 0.8, ux = dx0 / dist, uz = dz0 / dist;
    const under = this.random() < (1 - q) * 0.16 ? this.range(0.72, 0.92) : 1;
    const errMag = DM.hypot(along, lat), tol = DM.max(1.8, dist * 0.11), execErr = errMag > tol || under < 0.86;
    const kind = e.kind || "safe", intent = meta && meta.decision;
    this.ai2Count(t, "passes_total");
    if ((cand && cand.risky) || kind === "risky") this.ai2Count(t, "risky_passes");
    if (kind === "through") this.ai2Count(t, "through_balls");
    if (cross) this.ai2Count(t, "cross_attempts");
    if (ai.firstTime) this.ai2Count(t, "first_time_actions");
    ai.firstTime = false;
    if (execErr) {
      this.ai2Count(t, "execution_errors");
      if (intent && !intent.decisionError) this.ai2Count(t, "exec_errors_good_decision");
    }
    if (intent && intent.decisionError && !execErr) this.ai2Count(t, "decision_errors_good_exec");
    const word = under < 0.9 ? "flojo/corto" : errMag > tol ? (along > tol * 0.6 ? "largo" : along < -tol * 0.6 ? "corto" : DM.abs(lat) > tol * 0.6 ? "desviado" : "impreciso") : "limpio";
    ai.lastExec = { kind: "pass:" + kind, q, diff: ex.diff, err: errMag, tol, execErr, word, at: this.elapsed, pr: ex.pr.p };
    if (ai.dbg) { ai.dbg.execQ = q; ai.dbg.execErr = ex.diff; ai.dbg.actual = `pase ${kind} ${word} (err ${errMag.toFixed(1)} m)`; }
    ai.lastPassEst = q * (1 - lane * 0.9);
    ai.lastPassRisky = !!(cand && cand.risky);
    ai.lastPassAt = this.elapsed;
    return { q, ex: ux * along - uz * lat, ez: uz * along + ux * lat, under, execErr };
  },
  // ------------------------------------------------------------------ remate: ejecución contextual
  ai2ExecShot(t, l, o, header, first, volley, meta) {
    const dir = this.direction(t.team), ai = t.ai, dg = DM.max(1.5, o);
    const ang = DM.abs(DM.atan((t.z + 3.66) / dg) - DM.atan((t.z - 3.66) / dg));
    const ex = this.ai2ExecQuality(t, "shot", { dist: o, angle: ang, first: !!first, volley: !!volley, header: !!header, lob: l === "Vaselina", trivela: l === "Trivela", power: l === "Tiro potente" || l === "Tiro lejano", placed: l === "Tiro colocado" || l === "Tiro raso", dx: 52.7 * dir - t.x, dz: -t.z });
    let pOn = ai2Clamp((0.27 + 0.68 * DM.pow(ex.q, 1.1)) * (1 - 0.012 * DM.max(0, o - 20)) + (o > 22 && this.hasTrait(t, "Long Shot") ? 0.05 : 0), 0.06, 0.92);
    const weak = this.random() < (1 - ex.q) * 0.28 ? 0.72 : 1; // "tiro flojo": entra al arco pero sin veneno
    ai.lastExec = { kind: "shot:" + l, q: ex.q, diff: ex.diff, err: 0, execErr: false, word: "", at: this.elapsed, pOn };
    return { q: ex.q, pOn, weak, diff: ex.diff, ang };
  },
  // xG analítico (Fase 28): antes era casi lineal en la distancia (0.42 - dist*0.01 + bonus cabezazo
  // fijo). Ahora combina ángulo real de arco (mismo cálculo que ai2ExecShot), distancia, presión sobre
  // el rematador, qué tan expuesto/adelantado está el arquero, bloqueadores geométricos en el carril
  // de tiro (rematador→arco) y la calidad de ejecución contextual ya calculada (ex.q, que a su vez ya
  // pesa pie/orientación/volea/trivela/etc.) — sin volver a tirar dados: es una estimación determinista,
  // no debe mover this.random() (no altera el resultado real del partido, sólo la estadística).
  ai2ShotXg(t, s, goalX, dist, header, pressure, gk, ex) {
    const dg = DM.max(1.5, dist),
      ang = ex ? ex.ang : DM.abs(DM.atan((t.z + 3.66) / dg) - DM.atan((t.z - 3.66) / dg)),
      angFactor = ai2Clamp(ang / 0.9, 0, 1),
      // Curva de caída con la distancia (no lineal: la mayoría de los remates de media/larga
      // distancia deben valer poco, sólo los realmente cercanos valen mucho) calibrada para que
      // el xG total del partido no se dispare muy por encima de los goles reales.
      distDecay = DM.exp(-dg / 16);
    let xg = 0.9 * distDecay * DM.pow(angFactor, 1.3);
    const gk2 = gk && DM.abs(gk.x) < 49 ? ai2Clamp((52.5 - DM.abs(gk.x) - 2) / 6, 0, 1) : 0;
    xg *= 1 + gk2 * 0.3;
    xg *= 1 - pressure * 0.3;
    xg *= header ? (dg > 8 ? 0.55 : 0.8) : 1;
    const dxLine = goalX - t.x, dzLine = -t.z, lenSq = dxLine * dxLine + dzLine * dzLine || 1;
    let blockers = 0;
    for (const p of this.players) {
      if (p.team === t.team || p.role === "GK" || p.sentOff) continue;
      const u = ((p.x - t.x) * dxLine + (p.z - t.z) * dzLine) / lenSq;
      if (u <= 0.08 || u >= 0.97) continue;
      const px = t.x + u * dxLine, pz = t.z + u * dzLine;
      if (DM.hypot(p.x - px, p.z - pz) < 1.3) blockers++;
    }
    xg *= DM.pow(0.72, blockers);
    if (ex) xg *= 0.85 + 0.3 * ex.q;
    return ai2Clamp(xg, 0.01, 0.85);
  },
  // Resultado del remate ya conocido (h = a puerta): telemetría / decisión vs ejecución / afortunados
  ai2ShotRecord(t, l, o, h, ex, meta) {
    const ai = t.ai, spec = !!(meta && meta.spec), intent = meta && meta.decision;
    this.ai2Count(t, "shots_total");
    if (o > 24) this.ai2Count(t, "long_shots");
    if (spec) this.ai2Count(t, "speculative_shots");
    if (!h) { this.ai2Count(t, "execution_errors"); if (intent && !intent.decisionError) this.ai2Count(t, "exec_errors_good_decision"); }
    if (intent && intent.decisionError && h && ex.q > 0.55) this.ai2Count(t, "decision_errors_good_exec");
    ai.lastExec.execErr = !h;
    ai.lastExec.word = h ? (ex.weak < 1 ? "a puerta, sin fuerza" : "a puerta") : "desviado";
    if (ai.dbg) { ai.dbg.execQ = ex.q; ai.dbg.execErr = ex.diff; ai.dbg.actual = `${l} ${ai.lastExec.word} (calidad ${ex.q.toFixed(2)})`; }
    this._aiShot = { player: t, at: this.elapsed, spec, dist: o, q: ex.q, onT: h, type: l, result: null };
  },
  // Despeje: error de dirección contextual (bajo presión y de espaldas sale peor; puede irse "en contra")
  ai2ClearError(t, dir) {
    const ex = this.ai2ExecQuality(t, "clear"), ai = t.ai;
    const ang = this.ai2Gauss() * DM.pow(1 - ex.q, 1.2) * 1.05, bad = DM.abs(ang) > 0.7;
    if (bad) {
      this.ai2Count(t, "execution_errors");
      const intent = ai && ai.intent;
      if (intent && !intent.decisionError) this.ai2Count(t, "exec_errors_good_decision");
    }
    if (ai) ai.lastExec = { kind: "clear", q: ex.q, diff: ex.diff, err: DM.abs(ang), execErr: bad, word: bad ? "despeje defectuoso" : "limpio", at: this.elapsed };
    if (ai && ai.dbg) { ai.dbg.execQ = ex.q; ai.dbg.actual = "despeje " + ai.lastExec.word; }
    return { ang, bad, q: ex.q };
  },
  // ------------------------------------------------------------------ primer toque como parte del cerebro (spec #20)
  ai2ChooseTouch(t, legacy, info) {
    // recepción "de primera" (descargar sin controlar): jugadores con buena lectura, poco tiempo y opciones
    const ai = t.ai;
    if (legacy === "heavy" || legacy === "protect") return legacy;
    const res = ai.res.oneTouch, dirT = this.direction(t.team), dgT = DM.hypot(52.5 * dirT - t.x, t.z);
    // cerca del arco (≤ ~24 m, de frente) la definición de primera es lo natural: la pelota llega y se pega sin controlar
    const near = info.backToGoal || t.role === "DEF" ? 0 : ai2Sat((24 - dgT) / 12), boost = this.tacP(t.team, "oneTouchPlay");
    let p = ai2Clamp(0.05 + 0.32 * res + 0.32 * info.pressure - (info.backToGoal ? 0.15 : 0) + (info.ballSpeed > 9 ? 0.06 : 0) + near * 0.5 * (0.55 + 0.45 * (t.stats.shooting / 100)), 0, 0.85);
    if (boost) p = DM.min(0.97, p * (1 + boost.bonus / 100));
    if (info.fta > (near > 0.3 || boost ? 0.36 : 0.5) && this.random() < p * (t.role === "DEF" ? 0.7 : 1)) return "one_touch";
    // el espacio libre lo dice el mapa de control, no sólo "el rival más cercano"
    if (legacy === "control_forward" && this.pcSpace(t.team, t.x + 6 * this.direction(t.team), t.z) > 0.3 && info.pressure < 0.35) return "attack_space";
    return legacy;
  },
  ai2AfterTouch(t, type, info) {
    const ai = t.ai, now = this.elapsed;
    if (type === "heavy") {
      this.ai2Count(t, "heavy_touches");
      // un mal control genera estados nuevos: pelota suelta disputable + presión inmediata + confianza
      this.secondBallUntil = DM.max(this.secondBallUntil, now + 0.9);
      ai.touchBias = { hold: -0.12, support: 0.05, until: now + 1.0 };
      if (t.memory) { t.memory.confidence = te(t.memory.confidence - 1.5, 15, 90); t.memory.pressureMemory = DM.min(100, t.memory.pressureMemory + 6); }
      ai.oneTouch = false;
      return;
    }
    ai.touchBias = ({
      control_forward: { progress: 0.06, dribble: 0.03, until: now + 1.3 },
      attack_space: { progress: 0.05, dribble: 0.07, until: now + 1.4 },
      turn: { dribble: 0.05, hold: 0.04, until: now + 1.3 },
      protect: { support: 0.09, hold: 0.05, until: now + 1.4 },
      control_wide: { combo: 0.09, support: 0.03, until: now + 1.6 },
      one_touch: { support: 0.05, progress: 0.03, until: now + 0.8 },
    })[type] || null;
    ai.oneTouch = type === "one_touch";
    ai.firstTime = ai.oneTouch;
  },
  // Transición: quien pierde la pelota no reacciona igual de rápido (spec #16/#24 "transición defensiva lenta")
  ai2OnTurnover(loseTeam, x, z) {
    const now = this.elapsed;
    for (const p of this.players) {
      if (p.team !== loseTeam || p.role === "GK" || p.sentOff || !p.ai) continue;
      const dir = this.direction(loseTeam), adv = ai2Sat((p.x * dir + 10) / 55), fat = (100 - (p.stamina ?? 100)) / 100;
      const delay = 0.12 + (1 - p.ai.anticipation) * 0.5 + fat * 0.3 + adv * 0.12 + (p.personality.discipline < 40 ? 0.1 : 0);
      p.ai.slowUntil = now + delay * 0.8;
      if (delay > 0.62 && this.random() < 0.5) this.ai2Count(p, "late_reactions");
    }
  },

  // ------------------------------------------------------------------ receptor: reacciona al balón real (spec #20)
  // No corre a un punto exacto del que "sabe" de antemano: apunta al destino previsto, pero a medida que
  // vuela la pelota corrige hacia donde realmente va — más rápido cuanto mejor anticipa (inteligencia).
  // ------------------------------------------------------------------ transición al recuperar (spec #24/#25)
  // Ya no "robo ⇒ correr hacia adelante": pondera espacio libre delante (mapa de control), compañeros en
  // ventaja, rivales replegados, stamina, aislamiento del recuperador, marcador y minuto.
  ai2GainMode(gainTeam, loseTeam, lossX, lossZ, base) {
    const dir = this.direction(gainTeam), mates = this.ai2Outfield(gainTeam), opps = this.ai2Outfield(loseTeam);
    const ahead = mates.filter((p) => (p.x - lossX) * dir > 6 && DM.hypot(p.x - lossX, p.z - lossZ) < 40).length;
    const oppAhead = opps.filter((p) => (p.x - lossX) * dir > 3).length;
    const spaceAhead = this.pcSpace(gainTeam, lossX + 14 * dir, lossZ) + this.pcSpace(gainTeam, lossX + 20 * dir, lossZ * 0.5) * 0.6;
    const stam = mates.reduce((a, p) => a + (p.stamina ?? 100), 0) / (mates.length || 1);
    const lead = this.score[gainTeam] - this.score[loseTeam], late = this.time / 60 > 78;
    const tt = this.teamTactics(gainTeam), rec = this.owner && this.owner.team === gainTeam ? this.owner : null;
    let v = 0.35 * ai2Sat(spaceAhead / 0.7) + 0.25 * ai2Sat(ahead / 3) + 0.2 * ai2Sat((6 - oppAhead) / 5) + 0.1 * ai2Sat((stam - 45) / 45) + 0.1 * (rec ? ai2Sat(rec.stats.speed / 100 - 0.4) : 0.2);
    v += (tt.counterAttackPreference - 0.4) * 0.3 + (tt.riskTolerance - 0.5) * 0.15;
    if (lead > 0 && late) v -= 0.25; // proteger el resultado
    if (lead < 0 && late) v += 0.15;
    if (!ahead) v -= 0.25; // recuperador aislado: reiniciar es mejor
    v += (this.random() - 0.5) * 0.12;
    if (v > 0.55) return "counterattack";
    if (v < 0.3 || stam < 42 || oppAhead >= 5) return "possession_reset";
    return "fast_progression";
  },
  // ------------------------------------------------------------------ DEBUG (spec #28)
  ai2DebugLines(p) {
    const ai = p && p.ai, L = [];
    if (!ai) return L;
    const d = ai.dbg, tt = this.teamTactics(p.team), br = this.brain && this.brain[p.team], m = p.memory, dir = this.direction(p.team);
    L.push("— IA 2.0 (jugador focal) —");
    L.push(`FASE ${tt.phase}/${br ? br.phaseDetail : "—"}  PRESS_ALTA ${br && br.highPress ? "SI" : "no"} (${br ? br.pressScore.toFixed(2) : "—"})  POSESION_EQ ${br && br.hasBall ? "SI" : "no"}`);
    L.push(`ROL ${p.role}  TACTICAL_ROLE ${p.tacticalRole || "—"}  IA_ROLE ${ai.role || "—"}  POS_KIND ${ai.posKind}`);
    L.push(`RASGOS bold=${ai.boldness.toFixed(2)} pat=${ai.patience.toFixed(2)} spont=${ai.spontaneity.toFixed(2)} disc=${ai.tacticalDiscipline.toFixed(2)} riskMem=${ai.riskMemory.toFixed(2)} pie=${ai.foot}`);
    L.push(`RECURSOS longShot=${ai.res.longShot.toFixed(2)} through=${ai.res.throughBall.toFixed(2)} trick=${ai.res.trick.toFixed(2)} heel=${ai.res.heel.toFixed(2)}`);
    if (d) {
      L.push(`PERCEPCION conf=${d.pconf.toFixed(2)} (no ve ${d.unseenMates} comp.)  PRESION ${d.pressure.toFixed(2)}  ESPACIO ${d.space.toFixed(1)}m  SPACE_VALUE ${d.spaceValue.toFixed(2)}  PITCH_CONTROL ${d.control.toFixed(2)}`);
      L.push(`OPCIONES (${d.all} generadas, ${d.options.length} plausibles):`);
      d.options.forEach((o, i) => L.push(`  ${["TOP   ", "2ª    ", "3ª    ", "4ª    ", "5ª    "][i] || "      "} ${(o.key + (o.kind !== o.key ? ":" + o.kind : "")).padEnd(20)} ${o.score.toFixed(2)}${o.why.length ? "  · " + o.why.slice(0, 2).join(", ") : ""}`));
      L.push(`ELEGIDA ${d.sel.key}${d.sel.kind !== d.sel.key ? ":" + d.sel.kind : ""}  TEMPERATURA ${d.temp.toFixed(3)}  DEC_CONFIDENCE ${d.dconf.toFixed(2)}  DEC_ERR_RISK ${d.errRisk.toFixed(2)}  ${d.decisionError ? "[ERROR DE DECISIÓN]" : ""}`);
      L.push(`EJECUCIÓN intención=${d.intended}  real=${d.actual || "—"}  calidad=${d.execQ == null ? "—" : d.execQ.toFixed(2)}  dificultad=${d.execErr == null ? "—" : d.execErr.toFixed(2)}`);
    } else L.push("(sin decisión reciente — se llena cuando el jugador decide con balón)");
    if (m) L.push(`MEMORIA forma=${this.ai2Form(p)} confianza=${m.confidence.toFixed(0)} presión=${m.pressureMemory.toFixed(0)} fatiga=${m.recentFatigue.toFixed(2)} fallos=${m.recentMistakes.toFixed(1)} aciertos=${m.recentSuccesses.toFixed(1)}`);
    const roles = { marking: [], covering: [], creating: [], occupying: [], attacking: [], pressing: [], laneBlock: [] };
    for (const q of this.players) {
      if (q.team !== p.team || !q.ai || q.sentOff) continue;
      const it = q.ai.dintent, nm = `${q.number}`;
      if (it && (it.role === "MARK" || it.role === "TRACK") && it.ref != null) roles.marking.push(`${nm}→${this.players[it.ref].number}`);
      if (it && it.role === "COVER") roles.covering.push(nm);
      if (it && it.role === "PRESS") roles.pressing.push(nm);
      if (it && it.role === "LANE_BLOCK") roles.laneBlock.push(nm);
      if (q.ai.role === "SPACE_CREATOR") roles.creating.push(nm);
      if (q.ai.role === "DEPTH" || q.ai.role === "RUNNER") roles.attacking.push(nm);
      if (q.ai.posKind === "occupy" || q.ai.role === "WIDTH" || q.ai.role === "FIXER") roles.occupying.push(nm);
    }
    L.push(`EQUIPO  presiona[${roles.pressing}] cubre[${roles.covering}] línea_pase[${roles.laneBlock}] marca[${roles.marking}]`);
    L.push(`        crea_espacio[${roles.creating}] ocupa[${roles.occupying}] ataca_espacio[${roles.attacking}]`);
    const tl = this.aiTele[p.team], ts = ai.tele;
    L.push(`TELEMETRÍA eq: tiros ${tl.shots_total} (lejanos ${tl.long_shots}, especul. ${tl.speculative_shots}) err_dec ${tl.decision_errors} err_ejec ${tl.execution_errors} toques_pesados ${tl.heavy_touches} | jugador: err_dec ${ts.decision_errors || 0} err_ejec ${ts.execution_errors || 0}`);
    // Fase 1 — movimiento / defensa / recepción explicables
    const dbg = this.p1DebugPlayer(p);
    L.push(`MOVIMIENTO ${dbg.kmh} km/h (${dbg.tier}) sprint=${dbg.sprinting ? "SI" : "no"} stamina=${dbg.stamina}${dbg.mv ? `  objetivo=(${dbg.mv.tx.toFixed(0)},${dbg.mv.tz.toFixed(0)}) r=${dbg.mv.r.toFixed(2)} motivo=${dbg.mv.why}` : ""}`);
    if (dbg.def && this.elapsed - (p.p1.logAt || -9) < 1.5) L.push(`DEFENSA modo=${dbg.def.mode} tShot=${dbg.def.tShot.toFixed(2)}s tContacto=${dbg.def.tContact.toFixed(2)}s dist=${dbg.def.dist.toFixed(1)}m (${dbg.def.why})`);
    if (p.p1 && p.p1.recv && this.receiver === p) L.push(`RECEPCIÓN punto=(${p.p1.recv.x.toFixed(1)},${p.p1.recv.z.toFixed(1)}) t=${p.p1.recv.t.toFixed(2)}s margen=${p.p1.recv.margin.toFixed(2)}s`);
    const pp = this.passPlan;
    if (pp && this.elapsed - this.kickedAt < 3) L.push(`PASSPLAN ${pp.cls} ${pp.feasible ? "viable" : "NO viable (" + pp.reason + ")"} vuelo=${pp.flightTime.toFixed(2)}s recvETA=${pp.receiverETA.toFixed(2)} rivalETA=${pp.opponentETA.toFixed(2)} margen=${pp.controlMargin.toFixed(2)} bloqueo=${pp.blockRisk.toFixed(2)} primerToque=${pp.firstTouchOutcome}`);
    return L;
  },
  // Overlay opcional de pitch control (sólo debug): proyecta la malla con la cámara del HUD
  ai2DrawPitchControl(ctx, proj, focusTeam) {
    const g = this.pc, w = ctx.canvas.width, h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
    const px = [], gx1 = g.gx + 1, gz1 = g.gz + 1;
    for (let j = 0; j <= g.gz; j++) for (let i = 0; i <= g.gx; i++) px.push(proj(-52.5 + i * g.cw, 0.03, -34 + j * g.ch));
    for (let j = 0; j < g.gz; j++)
      for (let i = 0; i < g.gx; i++) {
        const k = j * g.gx + i, own = focusTeam === 0 ? g.ctrl[k] : 1 - g.ctrl[k];
        const a = px[j * gx1 + i], b = px[j * gx1 + i + 1], c = px[(j + 1) * gx1 + i + 1], e = px[(j + 1) * gx1 + i];
        const disputed = 1 - DM.abs(own - 0.5) * 2;
        let col;
        if (disputed > 0.62) col = `rgba(255,214,60,${0.12 + disputed * 0.16})`;
        else if (own > 0.5) col = `rgba(60,220,110,${0.08 + (own - 0.5) * 0.4})`;
        else col = `rgba(255,70,80,${0.08 + (0.5 - own) * 0.4})`;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(e.x, e.y); ctx.closePath(); ctx.fill();
        const sv = g.sv[focusTeam][k];
        if (sv > 0.3) { ctx.strokeStyle = `rgba(80,160,255,${DM.min(0.9, sv)})`; ctx.lineWidth = 1 + sv * 2; ctx.stroke(); }
      }
    // influencia de jugadores: flecha de velocidad + rol
    ctx.font = "700 9px DM Sans, sans-serif";
    for (const p of this.players) {
      if (p.sentOff) continue;
      const a = proj(p.x, 0.2, p.z), b = proj(p.x + p.vx * 0.6, 0.2, p.z + p.vz * 0.6);
      ctx.strokeStyle = p.team === 0 ? "#8edbff" : "#ff929e"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      const tag = p.ai && (p.ai.dintent ? p.ai.dintent.role : p.ai.role);
      if (tag) { ctx.fillStyle = "#fff"; ctx.fillText(tag.slice(0, 6), a.x + 4, a.y - 6); }
    }
  },
});

// <<AI2_END>>
// <<P1_BEGIN>>
// ============================================================================================
// FASE 1 — RECONSTRUCCIÓN DEL COMPORTAMIENTO DEL MATCH ENGINE  (fuente: p1/p1.js, inyectado por p1/inject.mjs)
//
// Una única cadena causal:  BALL PLAN → ETA/PITCH CONTROL → PASS PLAN → THREAT → DEFENSA/DUELO → PACE → move()
//
//  1. Movimiento ......... p1Phys / p1ETA (mismo modelo de aceleración que usa move(): ETA = física real)
//  2. Balón .............. ballFlightStep (integrador ÚNICO, también usado por updateBall) + p1SimBall / p1LivePlan
//  3. Pase ............... p1PlanPass (PassPlan) + p1PassVariants; pasador y receptor comparten interceptPoint
//  4. Receptor ........... p1ReceiveTarget: persigue el punto de la trayectoria viva (no un target congelado)
//  5. Defensa ............ p1CarrierRead / p1DefendCarrier (timeToShot vs timeToContact), p1DuelEval (duelo real)
//  6. Amenaza ............ p1ThreatMap (amenaza operativa que decide PRESS/COVER/MARK/TRACK/BLOCK)
//  7. Ataque sin balón ... p1PosExtras (línea de pase, triángulos, beneficio al compañero, anti-persecución)
//  8. Ritmo .............. p1Pace: velocidad = destino + intención + urgencia + atributos
//  9. Telemetría ......... p1Log / p1DebugPlayer
// ============================================================================================
// Física del balón (Fase 4, datos reales: ver REPORTE_FASE4.md). Balón FIFA: 0.43 kg, r = 0.11 m (A = 0.038 m²).
//  · Aire: arrastre cuadrático, F = ½·ρ·Cd·A·v² ⇒ a = 0.053·Cd·v². Cd cae de ≈0.47 (subcrítico, ≤12 m/s) a ≈0.22 (>25 m/s).
//  · Rodando sobre césped: resistencia casi constante (μ≈0.075 ⇒ 0.75 m/s²) + arrastre del aire; se detiene (no hay cola infinita).
//  · Pique: e ≈ 0.65 (0.64–0.68 medido en balones reglamentarios) y el césped frena la componente horizontal.
const BALL_ROLL_A = 0.75, BALL_E = 0.65, BALL_BOUNCE_H = 0.86;
function ballCd(v) { return v <= 12 ? 0.47 : v >= 25 ? 0.22 : 0.47 - 0.0192 * (v - 12); }
function ballDecel(v, ground) { return (ground ? BALL_ROLL_A : 0) + 0.053 * ballCd(v) * v * v; }
const P1_ARRIVAL = { feet: 11, space: 12.5, through: 14.5, switch: 12.5, cross: 12 };
const P1_TRAVEL = { feet: 3.6, space: 8.5, through: 14, switch: 9, cross: 9 };
const P1_MARGIN = { feet: 0.12, space: 0.0, through: -0.05, switch: 0.05, cross: -0.15 };

Object.assign(wc.prototype, {
  // ------------------------------------------------------------------ estado / telemetría
  p1S() {
    return this.p1 || (this.p1 = { log: [], threat: [[], []], cnt: {}, plan: null, planAt: -9, planKey: "", rt: null });
  },
  p1Count(k, n = 1) {
    const c = this.p1S().cnt;
    c[k] = (c[k] || 0) + n;
  },
  p1Log(kind, o) {
    const s = this.p1S();
    if (s.off) return;
    o.kind = kind;
    o.at = +this.elapsed.toFixed(2);
    s.log.push(o);
    if (s.log.length > 600) s.log.splice(0, 200);
  },
  // ------------------------------------------------------------------ 1) MOVIMIENTO: parámetros físicos + ETA
  // vrun/vsp conservan las velocidades máximas originales (auditadas: 24-29 km/h a ritmo de carrera,
  // hasta ~36 km/h en sprint — plausibles). Lo que se reemplazó es la CURVA: aceleración limitada
  // (m/s²) que decrece al acercarse a vmax, frenada y giro con límites propios.
  p1Phys(p) {
    const st = p.stamina ?? 100,
      fat = 0.8 + (0.2 * st) / 100,
      vrun = (4.4 + p.stats.speed * 0.037) * fat,
      ac = p.stats.acceleration,
      af = 0.88 + (0.12 * st) / 100;
    return { vrun, vsp: vrun * (st > 40 ? 1.24 : 1), a0: (3.3 + ac * 0.036) * af, aBrake: 4.6 + ac * 0.022, aLat: 5 + ac * 0.03 }; // Fase 3: calibrado contra Metrica (aceleración p99 ≈3-5, frenada ≈-5..-6 m/s²)
  },
  // Tiempo de llegada (s) a (x,z): resuelve x(t)=vm·t+(v0−vm)·τ·(1−e^(−t/τ)) — exactamente la dinámica de move()
  // (aceleración a0·(1−v/vm)) — más reacción y corrección lateral. `o.react` sobreescribe la reacción.
  p1ETA(p, x, z, o) {
    const dx = x - p.x, dz = z - p.z, d = DM.hypot(dx, dz), P = this.p1Phys(p), an = p.ai ? p.ai.anticipation : 0.6;
    let react = o && o.react != null ? o.react : 0.1 + (1 - an) * 0.22;
    if (p.ragdoll) react += 1.2;
    else if (p.timer > 0) react += 0.45;
    const reach = o && o.reach ? o.reach : 0, dd = DM.max(0, d - reach);
    if (dd < 0.05) return react * 0.5;
    const vm = o && o.vm ? o.vm : P.vsp, ux = dx / d, uz = dz / d, v0 = p.vx * ux + p.vz * uz, perp = DM.abs(-p.vx * uz + p.vz * ux), tau = vm / P.a0;
    let t = dd / vm + tau * 0.6;
    for (let i = 0; i < 4; i++) {
      const ex = DM.exp(-t / tau), f = vm * t + (v0 - vm) * tau * (1 - ex) - dd, fp = vm + (v0 - vm) * ex;
      t -= f / DM.max(0.6, fp);
      if (t < 0.04) t = 0.04;
    }
    return react + t + (perp / P.aLat) * 0.55;
  },
  // ------------------------------------------------------------------ 2) MODELO TEMPORAL ÚNICO DEL BALÓN
  // Mismo integrador que updateBall (gravedad, efecto, rebote, rozamiento rodando/aire). Nadie más predice el balón.
  ballFlightStep(s, dt) {
    const r = s.spin * 0.12, a = s.vx;
    s.vx += -s.vz * r * dt;
    s.vz += a * r * dt;
    s.vy -= 9.81 * dt;
    s.y += s.vy * dt;
    if (s.y < 0.13) {
      s.y = 0.13;
      if (s.vy < -0.8) { s.vy = -s.vy * BALL_E; if (s.vy > 1.2) { s.vx *= BALL_BOUNCE_H; s.vz *= BALL_BOUNCE_H; } } else s.vy = 0;
    }
    const sp = DM.hypot(s.vx, s.vz);
    if (sp > 0) {
      const o = DM.max(0, sp - ballDecel(sp, s.y <= 0.24) * dt) / sp;
      s.vx *= o;
      s.vz *= o;
    }
    s.spin *= DM.exp(-dt * 0.5);
    s.x += s.vx * dt;
    s.z += s.vz * dt;
  },
  // BallPlan: posición/velocidad/altura de la pelota en t=0, step, 2·step… (arrays planos).
  p1SimBall(b, horizon = 3.4, step = 0.05) {
    const n = DM.ceil(horizon / step) + 1, P = { step, n, nValid: n, x: new Float32Array(n), z: new Float32Array(n), y: new Float32Array(n), vx: new Float32Array(n), vz: new Float32Array(n) };
    const s = { x: b.x, z: b.z, y: b.y, vx: b.vx, vz: b.vz, vy: b.vy, spin: b.spin || 0 };
    for (let i = 0; i < n; i++) {
      P.x[i] = s.x; P.z[i] = s.z; P.y[i] = s.y; P.vx[i] = s.vx; P.vz[i] = s.vz;
      if (P.nValid === n && (DM.abs(s.x) > 52.6 || DM.abs(s.z) > 34.2)) P.nValid = i + 1;
      this.ballFlightStep(s, step);
    }
    return P;
  },
  // Plan de la pelota ACTUAL (cacheado por tick). Receptor, interceptores y pasador lo consumen igual.
  p1LivePlan() {
    const S = this.p1S(), b = this.ball;
    if (S.plan && S.planAt === this.elapsed) return S.plan;
    S.plan = this.p1SimBall(b);
    S.planAt = this.elapsed;
    return S.plan;
  },
  // Velocidad de salida de un pase (única fórmula: usada por p1PlanPass y por pass()).
  // Rasante: la velocidad se resuelve para que la pelota LLEGUE con una velocidad controlable (v_arr) considerando
  // el rozamiento real (v_llegada = v0·e^(−0.27T) ⇒ v0 = v_arr + 0.27·dist). Aéreo: tiempo de vuelo elegido y
  // velocidad horizontal corregida por el arrastre del aire; se refina con el propio integrador.
  p1KickVel(b, ax, az, cls, loft) {
    const dx = ax - b.x, dz = az - b.z, dist = DM.max(1, DM.hypot(dx, dz)), ux = dx / dist, uz = dz / dist;
    if (!loft) {
      // se integra hacia atrás desde la velocidad de llegada: v·dv/ds = a(v) ⇒ v0 tal que la pelota llega a v_arr tras `dist`
      const arr = dist < 8 ? 9.5 : P1_ARRIVAL[cls] || 11;
      let v = arr, T = 0;
      const ds = dist / 12;
      for (let i = 0; i < 12; i++) { const a = ballDecel(v, true), v2 = v + (a / v) * ds; T += ds / ((v + v2) / 2); v = v2; }
      const v0 = te(v, 11, 30);
      return { vx: ux * v0, vz: uz * v0, vy: 0.35, speed: v0, dist, loft: false, T };
    }
    const T = te(0.75 + dist * 0.028, 1, 2.3);
    let sp = dist / T, vy = 4.905 * T;
    for (let k = 0; k < 5; k++) {
      const s = { x: b.x, z: b.z, y: DM.max(0.13, b.y || 0.13), vx: ux * sp, vz: uz * sp, vy, spin: 0 };
      let landed = false;
      for (let i = 0; i < 80 && !landed; i++) {
        this.ballFlightStep(s, 0.05);
        if (i > 4 && s.y <= 0.14 && s.vy > -0.3) landed = true;
        else if (i > 4 && s.y < 0.5 && s.vy < 0) { landed = true; }
      }
      const got = DM.hypot(s.x - b.x, s.z - b.z);
      if (got > 1) sp *= te(dist / got, 0.8, 1.25);
    }
    sp = te(sp, 10, 30);
    return { vx: ux * sp, vz: uz * sp, vy, speed: sp, dist, loft: true, T };
  },
  // ------------------------------------------------------------------ 3) PASS PLAN
  // Evalúa un pase concreto (receptor + tipo + punto de apunte) contra el modelo temporal del balón. Devuelve el
  // PassPlan completo; `feasible` sólo si existe una ventana espacio-temporal donde el receptor llega ANTES que
  // cualquier rival, la trayectoria no está cortada y la pelota llega a una velocidad controlable.
  p1PlanPass(t, r, cls, ax, az, o = {}) {
    const b = this.ball, dir = this.direction(t.team), loft = !!(o.loft || cls === "switch" || cls === "cross");
    const kv = o.kick || this.p1KickVel(b, ax, az, cls, loft), S = this.p1SimBall({ x: b.x, z: b.z, y: DM.max(0.13, b.y || 0.13), vx: kv.vx, vz: kv.vz, vy: kv.vy, spin: 0 }, 3.2, 0.05);
    const step = S.step, N = DM.min(S.nValid, S.n), plan = {
      passer: t, receiver: r, cls, kind: o.kind || cls, loft, aim: { x: ax, z: az }, kick: kv, ball: S, feasible: false, reason: "no_window", interceptPoint: null,
      flightTime: 0, receiverETA: 99, opponentETA: 99, controlMargin: -9, receiverMargin: -9, interceptionRisk: 1, blockRisk: 1, contestRisk: 1, progression: 0, firstTouchOutcome: "n/a", arrivalSpeed: 0, travel: 99, oppDist: 0,
    };
    const react = o.recvReact != null ? o.recvReact : 0.06, ux0 = DM.hypot(ax - r.x, az - r.z) || 1, along0 = (r.vx * (ax - r.x) + r.vz * (az - r.z)) / ux0, travelCap = (P1_TRAVEL[cls] || 4) + 0.6 * DM.max(0, along0),
      need = (P1_MARGIN[cls] ?? 0.1) - (o.slack || 0);
    let ir = -1, bestGap = -9;
    for (let i = 3; i < N; i++) {
      const y = S.y[i];
      if (y > (loft ? 1.5 : 1.25)) continue;
      if (loft && i * step < kv.T * 0.55) continue;
      const px = S.x[i], pz = S.z[i];
      if (DM.abs(px) > 52.2 || DM.abs(pz) > 33.8) break;
      const t_i = i * step, eta = this.p1ETA(r, px, pz, { react, reach: 0.45 }), gap = t_i - eta;
      if (gap > bestGap) bestGap = gap;
      if (gap >= need && DM.hypot(px - r.x, pz - r.z) <= travelCap) { ir = i; break; }
    }
    plan.receiverMargin = bestGap;
    if (ir < 0) {
      plan.reason = bestGap < need && bestGap > -9 ? (DM.hypot(ax - r.x, az - r.z) > travelCap ? "too_far_for_kind" : "receiver_cannot_reach") : "no_window";
      return plan;
    }
    const px = S.x[ir], pz = S.z[ir], tr = ir * step, arrSp = DM.hypot(S.vx[ir], S.vz[ir]);
    plan.interceptPoint = { x: px, z: pz, t: tr };
    plan.flightTime = tr;
    plan.receiverETA = tr - bestGap;
    plan.receiverMargin = tr - this.p1ETA(r, px, pz, { react, reach: 0.45 });
    plan.arrivalSpeed = arrSp;
    plan.travel = DM.hypot(px - r.x, pz - r.z);
    plan.progression = (px - b.x) * dir;
    // rivales: ¿alguno llega a ALGÚN punto de la trayectoria antes que la pelota (o antes que el receptor)?
    let slackMax = -9, atPoint = 99, dmin = 99, worst = null;
    const ex = S.x[ir] - S.x[0], ez = S.z[ir] - S.z[0], L2 = ex * ex + ez * ez || 1;
    for (const q of this.players) {
      if (q.team === t.team || q.sentOff) continue;
      const Pq = this.p1Phys(q), u = te(((q.x - S.x[0]) * ex + (q.z - S.z[0]) * ez) / L2, 0, 1), segd = DM.hypot(q.x - (S.x[0] + u * ex), q.z - (S.z[0] + u * ez));
      const dP = DM.hypot(q.x - px, q.z - pz);
      if (dP < dmin) dmin = dP;
      const rch = q.role === "GK" ? 1.8 : 1.0, etaP = this.p1ETA(q, px, pz, { reach: rch });
      if (etaP - tr < atPoint) atPoint = etaP - tr;
      if (segd > Pq.vsp * (tr + 0.15) + 1.3) continue;
      // el portero sólo intercepta con las manos cerca de su área
      for (let i = 2; i <= ir; i += 2) {
        if (S.y[i] > (q.role === "GK" ? 2.3 : 2.1)) continue;
        const ti = i * step, eta = this.p1ETA(q, S.x[i], S.z[i], { reach: rch }), s = ti - eta;
        if (s > slackMax) { slackMax = s; worst = q; }
      }
    }
    plan.opponentETA = tr + atPoint;
    plan.controlMargin = atPoint;
    plan.oppDist = dmin;
    plan.worstOpp = worst;
    // riesgo de bloqueo/corte: sigmoide de cuánto ANTES llega el rival a la trayectoria (s>0 ⇒ llega antes que la pelota)
    plan.blockRisk = ai2Clamp(1 / (1 + DM.exp(-(slackMax + 0.06) / 0.11)), 0, 1);
    plan.contestRisk = ai2Clamp(1 / (1 + DM.exp(-(-atPoint + 0.3) / 0.28)), 0, 1);
    plan.interceptionRisk = DM.max(plan.blockRisk, plan.contestRisk * 0.7);
    const fta = this.firstTouchAbility(r) / 100, ctlMax = (loft ? 17 : 14.5) + fta * 6;
    const diff = 0.3 * (arrSp / 15) + 0.4 * plan.contestRisk + 0.15 * (plan.travel / 8) - 0.25 * fta;
    plan.firstTouchOutcome = diff < 0.22 ? "clean" : diff < 0.42 ? "pressured" : "heavy";
    plan.expectedControl = ai2Clamp(1 - diff, 0, 1);
    if (arrSp > ctlMax) plan.reason = "arrival_too_fast";
    else if (plan.blockRisk >= 0.5) plan.reason = "lane_blocked";
    else if (atPoint < -0.2 && !o.allowContest) plan.reason = "opponent_first";
    else { plan.feasible = true; plan.reason = "ok"; }
    return plan;
  },
  // Variantes geométricas de un pase a un compañero: NO todos los pases tienen la misma geometría (pie/espacio/filtrado/cambio).
  p1PassVariants(t, m, a, dir, farSide, hf = 1) {
    const out = [], vx = m.vx, vz = m.vz, sp = DM.hypot(vx, vz), Tf = te(a / 13, 0.35, 2.4);
    // al pie: el receptor apenas se mueve — apunta a donde ESTARÁ a la llegada (con poco avance: el receptor frena/ajusta)
    const lead = DM.min(Tf * 0.8 * hf, 1.6);
    out.push({ cls: "feet", ax: te(m.x + vx * lead, -49, 49), az: te(m.z + vz * lead, -31, 31), loft: a > 30 });
    if (sp > 2 || (m.x - t.x) * dir > 5) {
      const T2 = (Tf + 0.55) * hf;
      out.push({ cls: "space", ax: te(m.x + vx * T2 + dir * (sp < 2 ? 3 : 1), -49, 49), az: te(m.z + vz * T2, -31, 31), loft: a > 26 });
    }
    if ((m.x - t.x) * dir > 6 && m.p.role !== "DEF" && a > 14 && a < 42)
      out.push({ cls: "through", ax: te(m.x + dir * (5 + 0.5 * sp) + vx * 0.4, -49, 49), az: te(m.z * 0.9 + vz * 0.4, -31, 31), loft: a > 30 });
    if (a > 20 && DM.sign(m.z) !== DM.sign(t.z) && farSide > 8) out.push({ cls: "switch", ax: te(m.x + vx * te(a * 0.04, 0.6, 1.6), -49, 49), az: te(m.z + vz * te(a * 0.04, 0.6, 1.6), -31, 31), loft: true });
    return out;
  },
  // Mejor plan alcanzable hacia un compañero (o el menos malo si `desperate`). null si nada es físicamente viable.
  p1BestPassTo(t, m, a, dir, farSide, desperate, hf = 1) {
    let best = null, bs = -1e9, fallback = null, fs = -1e9;
    for (const v of this.p1PassVariants(t, m, a, dir, farSide, hf)) {
      const pl = this.p1PlanPass(t, m.p, v.cls, v.ax, v.az, { loft: v.loft, recvReact: 0.06 });
      const q = (pl.interceptPoint ? DM.min(pl.receiverMargin, 1) * 0.5 : -1) - pl.blockRisk * 3.2 - pl.contestRisk * 1.0 + pl.progression * 0.02 + (v.cls === "feet" ? 0.18 : v.cls === "switch" ? 0.22 : 0) - (pl.travel > 5 ? 0.2 : 0);
      if (pl.feasible && q > bs) { bs = q; best = pl; }
      if (pl.interceptPoint && q > fs && pl.blockRisk < 0.75) { fs = q; fallback = pl; }
    }
    return best || (desperate ? fallback : null);
  },
  // Sustituye al viejo passOption(): mismo contrato de salida, pero cada candidato pasa por el PassPlan.
  passOption(t) {
    const dir = this.direction(t.team), out = [], opps = this.players.filter((r) => r.team !== t.team && r.role !== "GK" && !r.sentOff),
      farSide = this.spaceAt(t.x + 14 * dir, -t.z * 0.6, opps);
    for (const r of this.players) {
      if (r.team !== t.team || r.id === t.id || r.role === "GK" || r.sentOff) continue;
      const a = ze(t, r);
      if (a < 4.5 || a > 44) continue;
      const pl = this.p1BestPassTo(t, { p: r, x: r.x, z: r.z, vx: r.vx, vz: r.vz }, a, dir, farSide, false);
      if (!pl) continue;
      const v = pl.progression, dangerGain = (this.dangerAt(pl.interceptPoint.x, pl.interceptPoint.z, t.team) - this.dangerAt(t.x, t.z, t.team)) * 6;
      const score = v * 0.62 + DM.min(pl.oppDist, 12) * 1.45 - a * 0.12 - pl.blockRisk * 8 + (r.role === "FWD" ? 3 : 0) + this.chem(t, r) * 2.4 + dangerGain - (this.isOffside(t, r) ? 6 : 0) + this.range(-1.5, 1.5);
      const kind = pl.cls === "through" ? "through" : pl.cls === "switch" ? "switch" : v < -3 ? "backpass" : v > 9 ? "progressive" : a < 12 ? "short" : "safe";
      out.push({ p: r, x: pl.aim.x, z: pl.aim.z, length: a, loft: pl.loft, score, progress: v, risk: pl.blockRisk, kind, plan: pl });
    }
    return out.sort((x, y) => y.score - x.score)[0];
  },
  // Fase 23 — telemetría explicable de decisiones con balón
  p1LogDecision(t, sel, ctx, decisionError, worse) {
    if (this.p1S().off) return;
    const pick = sel.pick, ai = t.ai, pl = pick.plan, nd = ctx.nearest ? this.p1DefFor(ctx.nearest) : null;
    this.p1Log("decision", {
      player: t.name, role: t.role, tacticalRole: ai.role || null,
      attributesUsed: { vision: +ai.cog.vision.toFixed(2), anticipation: +ai.anticipation.toFixed(2), horizon: +ai.cog.decisionHorizon.toFixed(2), passing: t.stats.passing, composure: t.personality.composure },
      perceivedThreat: +ctx.pressure2.toFixed(2), timeToShot: nd ? nd.tShot : null, timeToContact: nd ? nd.tContact : null,
      receiverETA: pl ? +pl.receiverETA.toFixed(2) : null, opponentETA: pl ? +pl.opponentETA.toFixed(2) : null, predictedBall: pl && pl.interceptPoint ? { x: +pl.interceptPoint.x.toFixed(1), z: +pl.interceptPoint.z.toFixed(1), t: +pl.interceptPoint.t.toFixed(2) } : null,
      candidateActions: sel.plausible.map((c) => ({ k: c.key + (c.kind && c.kind !== c.key ? ":" + c.kind : ""), s: +c.score.toFixed(3) })),
      selectedAction: pick.key + (pick.kind && pick.kind !== pick.key ? ":" + pick.kind : ""), decisionQuality: +(1 - DM.min(1, worse / 0.4)).toFixed(2), decisionError: !!decisionError,
      reason: (pick.why && pick.why.length ? pick.why.join(", ") : pick.kind) + (pl ? " | " + pl.reason : ""),
    });
  },
  p1DefFor(q) { return q.p1 && q.p1.def ? q.p1.def : null; },
  p1LogPass(t, e, plan, kv, speed) {
    if (!plan) return;
    this.p1Count("passes");
    if (plan.feasible) this.p1Count("passes_feasible");
    else this.p1Count("passes_infeasible_" + plan.reason);
    this.p1Log("pass", { passer: t.name, receiver: e.p && e.p.name, cls: plan.cls, feasible: plan.feasible, reason: plan.reason, interceptPoint: plan.interceptPoint && { x: +plan.interceptPoint.x.toFixed(1), z: +plan.interceptPoint.z.toFixed(1), t: +plan.interceptPoint.t.toFixed(2) },
      flightTime: +plan.flightTime.toFixed(2), receiverETA: +plan.receiverETA.toFixed(2), opponentETA: +plan.opponentETA.toFixed(2), controlMargin: +plan.controlMargin.toFixed(2), receiverMargin: +plan.receiverMargin.toFixed(2), laneBlocked: plan.blockRisk >= 0.5,
      blockRisk: +plan.blockRisk.toFixed(2), interceptionRisk: +plan.interceptionRisk.toFixed(2), firstTouch: plan.firstTouchOutcome, speed: +speed.toFixed(1), arrival: +plan.arrivalSpeed.toFixed(1) });
  },
  // ¿Existe algún compañero con carril razonablemente libre? (barato: sólo geometría; el juicio fino lo hace el PassPlan)
  p1QuickPassOption(t) {
    const opps = this.players.filter((r) => r.team !== t.team && r.role !== "GK" && !r.sentOff);
    for (const r of this.players) {
      if (r.team !== t.team || r.id === t.id || r.role === "GK" || r.sentOff) continue;
      const a = ze(t, r);
      if (a < 5 || a > 34) continue;
      if (this.ai2LaneRisk(t.x, t.z, r.x, r.z, opps) < 0.38 && this._lf > 2) return true;
    }
    return false;
  },
  // ------------------------------------------------------------------ 4) RECEPTOR: persigue la trayectoria VIVA
  // Devuelve null si la pelota ya es inalcanzable para él (entonces deja de correr detrás de un imposible y vuelve a su
  // rol). Sino {x,z,t,margin,dist}: el primer punto de la trayectoria al que llega con ventaja.
  p1ReceiveTarget(l) {
    const S = this.p1S(), b = this.ball;
    const plan = this.p1LivePlan(), step = plan.step, N = DM.min(plan.nValid, plan.n), pp = this.passPlan;
    // el receptor comprometido con el pase conserva la ventana ya calculada por el pasador mientras siga siendo válida
    let best = null, bestGap = -9, bi = -1;
    for (let i = 2; i < N; i++) {
      const y = plan.y[i], loose = pp && pp.receiver === l && pp.loft;
      if (y > (loose ? 1.5 : 1.3)) continue;
      const px = plan.x[i], pz = plan.z[i];
      if (DM.abs(px) > 52.2 || DM.abs(pz) > 33.8) break;
      const t_i = i * step, eta = this.p1ETA(l, px, pz, { react: 0.04, reach: 0.45 }), gap = t_i - eta;
      if (gap > bestGap) { bestGap = gap; bi = i; }
      if (gap >= 0.02) { best = { x: px, z: pz, t: t_i, margin: gap, i }; break; }
    }
    if (!best) {
      // ninguna ventana: seguir sólo si está cerca del mejor punto (pelota rasante que se frena) — sino, abandonar
      if (bi < 0) return null;
      const px = plan.x[bi], pz = plan.z[bi], d = DM.hypot(px - l.x, pz - l.z);
      const near = bestGap > -0.35 && d < 9;
      if (!near) { this.p1Count("receiver_gave_up"); return null; }
      best = { x: px, z: pz, t: bi * step, margin: bestGap, i: bi };
    }
    best.dist = DM.hypot(best.x - l.x, best.z - l.z);
    // recepción "abierta": si sobra tiempo, se ubica del lado opuesto al rival más cercano y ligeramente hacia adelante
    if (best.margin > 0.25 && best.dist < 6) {
      const dir = this.direction(l.team);
      let nq = null, nd = 99;
      for (const q of this.players) if (q.team !== l.team && !q.sentOff && q.role !== "GK") { const d = DM.hypot(q.x - best.x, q.z - best.z); if (d < nd) { nd = d; nq = q; } }
      if (nq && nd < 6) {
        const away = $i(best.x - nq.x, best.z - nq.z), k = DM.min(0.9, best.margin * 0.8) * (1 - nd / 6);
        best.x = te(best.x + away.x * k, -50, 50);
        best.z = te(best.z + away.z * k + 0, -32, 32);
      }
      best.x = te(best.x + dir * 0.25, -50, 50);
    }
    return best;
  },
  // ------------------------------------------------------------------ 5) LECTURA DEL POSEEDOR + DEFENSA
  // Qué puede hacer el atacante AHORA: cuándo puede tirar / pasar con peligro, cuán expuesta tiene la pelota.
  p1CarrierRead(car) {
    const S = this.p1S();
    if (S.read && S.readAt === this.elapsed && S.readFor === car.id) return S.read;
    const tm = car.team, dir = this.direction(tm), gx = 52.5 * dir, dG = DM.hypot(gx - car.x, car.z), b = this.ball,
      sp = DM.hypot(car.vx, car.vz), toward = sp > 0.3 ? (car.vx * dir) / sp : 0, opps = this.ai2Outfield(1 - tm);
    const th = DM.abs(DM.atan((car.z + 3.66) / DM.max(1.5, dG)) - DM.atan((car.z - 3.66) / DM.max(1.5, dG)));
    const lane = 1 - this.ai2LaneRisk(car.x, car.z, gx, car.z * 0.3, opps.filter((q) => DM.hypot(q.x - car.x, q.z - car.z) > 1.2));
    const facing = DM.cos(car.angle - (dir > 0 ? DM.PI / 2 : -DM.PI / 2)), shooter = (car.stats.shooting - 50) / 50;
    // tiempo hasta un tiro con sentido: en zona ⇒ preparación mínima; fuera ⇒ tiempo de entrar (a su velocidad hacia el arco)
    const zone = dG < 27 && th > 0.15, prep = 0.3 + (facing < -0.1 ? 0.35 : 0) - 0.12 * ai2Clamp(shooter, -0.5, 1);
    let tShot = zone ? prep : 0.3 + DM.max(0, dG - 25) / DM.max(3.2, 4 + sp * DM.max(0, toward)) + prep * 0.5 + (dG < 27 ? 1.6 : 0);
    if (lane < 0.35) tShot += 0.5;
    if (dG > 34) tShot += 4;
    const exposure = DM.max(0, DM.hypot(b.x - car.x, b.z - car.z) - 0.9);
    const thr = this.p1S().threat[1 - tm] || [], recv = thr.length ? thr[0].recv : 0.3;
    const tPass = recv > 0.55 ? 0.35 : recv > 0.3 ? 0.55 : 0.85;
    const R = { car, dir, dG, zone, th, lane, tShot, tPass, exposure, facing, sp, danger: this.dangerAt(car.x, car.z, tm), shotThreat: ai2Sat((3 - tShot) / 2.6) * (zone ? 1 : 0.55) * (0.4 + 0.6 * lane) };
    S.read = R; S.readAt = this.elapsed; S.readFor = car.id;
    return R;
  },
  // Contacto: tiempo mínimo en que `def` alcanza la pelota del poseedor (que sigue con su velocidad ≤1.3 s).
  p1TimeToContact(def, car) {
    const b = this.ball, bvx = car.vx * 0.9, bvz = car.vz * 0.9;
    let best = { t: 4, x: b.x, z: b.z };
    for (let t = 0.15; t <= 2.6; t += 0.15) {
      const k = DM.min(t, 1.3), px = b.x + bvx * k, pz = b.z + bvz * k, d = DM.hypot(px - def.x, pz - def.z);
      const ux = d > 0.01 ? (px - def.x) / d : 0, uz = d > 0.01 ? (pz - def.z) / d : 0, rx = px - ux * 0.8, rz = pz - uz * 0.8;
      if (this.p1ETA(def, rx, rz) <= t) { best = { t, x: px, z: pz }; break; }
    }
    return best;
  },
  // Decisión del defensor más cercano: CLOSE_DOWN/PRESSURE/CONTACT (llega antes de que pueda tirar) o SHOT_BLOCK (no llega:
  // se planta en la línea de tiro) o CONTAIN (sin urgencia: temporiza/orienta a la banda con distancia que depende del peligro).
  p1DefendCarrier(l, car, opts = {}) {
    const R = this.p1CarrierRead(car), tm = l.team, d = this.direction(tm), goalSide = -d, gx = 52.5 * R.dir;
    const me = this.p1TimeToContact(l, car), ann = l.ai ? l.ai.cog.anticipation : 0.6, agg = (l.personality.aggression - 50) / 100;
    // lectura imperfecta del peligro: uno de mala anticipación estima el tiro más lejos de lo que está (sale tarde)
    const tShot = R.tShot + (0.55 - ann) * 0.5, dist = DM.hypot(l.x - car.x, l.z - car.z);
    const guard = this.players.filter((q) => q.team === tm && q.id !== l.id && q.role !== "GK" && !q.sentOff && (q.x - car.x) * R.dir > 0 && DM.hypot(q.x - car.x, q.z - car.z) < 11).length;
    const lastMan = guard === 0 && (car.x * R.dir) > 20;
    let mode, x, z, sprint, v = 1, why;
    const toGoalX = (gx - car.x) / DM.max(1, R.dG), toGoalZ = (0 - car.z) / DM.max(1, R.dG);
    const pk = opts.press || 1;
    if (me.t <= tShot + 0.2 + (pk - 1) * 0.6 && me.t < 2.3 && (!lastMan || tShot < 1.2 || R.exposure > 0.5)) {
      mode = dist < 2.6 ? "CONTACT" : "CLOSE_DOWN";
      const cx = me.x, cz = me.z;
      // llega por el lado que niega el tiro/avance: pegado, del lado del arco propio y hacia adentro
      x = cx + toGoalX * 0.7 + goalSide * 0.15;
      z = cz + toGoalZ * 0.7;
      sprint = dist > 2.2 || R.exposure > 0.4;
      v = 1.04;
      why = me.t.toFixed(2) + "<=" + tShot.toFixed(2);
    } else if (R.shotThreat > 0.35 || tShot < 1.6) {
      // no llega antes del tiro: se interpone en la línea de tiro (y molesta) en vez de acompañar a 4 m
      mode = "SHOT_BLOCK";
      const k = te(1.5 + 0.35 * DM.hypot(car.vx, car.vz), 1.4, 3.6);
      x = car.x + toGoalX * k;
      z = car.z + toGoalZ * k * 0.9;
      sprint = dist > 3;
      v = 1.04;
      why = "no_llega " + me.t.toFixed(2) + ">" + tShot.toFixed(2);
    } else {
      // CONTAIN: distancia de contención según peligro, cobertura, agresividad y velocidad del rival
      mode = "CONTAIN";
      const sp = R.sp, gap = te((2.4 + 0.22 * sp + (guard === 0 ? 0.9 : 0) - agg * 1.4 - 0.6 * ai2Sat((3.5 - tShot) / 2.2) - (R.exposure > 0.55 ? 0.8 : 0)) / DM.sqrt(pk), 1.7, 5);
      const u = $i(gx - car.x, 0 - car.z), side = DM.sign(car.z) || 1, force = DM.abs(car.z) > 15 ? -side * 0.7 : side * 0.0;
      // v16 (pedido explícito, videos de defensa): "dirigir el duelo" hacia la pierna mala del
      // rival en vez de encararlo simétrico/de frente — se sesga la aproximación hacia el lado del
      // pie hábil del atacante (lo empuja a salir por su lado débil), perpendicular a la línea
      // defensor→arco. Un defensor de mejor lectura espacial lo hace más marcado; uno limitado casi
      // no lo nota (aproximación ~simétrica, comportamiento previo). Magnitud acotada (probada contra
      // el arnés de portero en córners/centros: valores mayores desestabilizan la forma defensiva lo
      // suficiente como para que el arquero deje de poder salir a agarrar centros).
      const footSign = car.ai ? (car.ai.foot === "L" ? -1 : car.ai.foot === "R" ? 1 : 0) : 0,
        perpX = -u.z, perpZ = u.x, jockey = footSign * 0.18 * ann;
      x = car.x + u.x * gap + car.vx * 0.25 + perpX * jockey;
      z = car.z + u.z * gap + car.vz * 0.25 + force + perpZ * jockey;
      sprint = dist > gap + 3.2 || (me.t < 1.4 && R.exposure > 0.5);
      v = 0.92;
      why = "temporiza gap=" + gap.toFixed(1);
    }
    // arrival: el objetivo nunca se cruza más allá de la pelota hacia el arco propio
    const out = { x: te(x, -51, 51), z: te(z, -33, 33), sprint, v, mode, tShot, tContact: me.t, dist, why };
    if (l.p1 === undefined) l.p1 = {};
    l.p1.def = out;
    if (mode !== "CONTAIN") l.p1.urgentAt = this.elapsed;
    if (mode !== "CONTAIN" || dist < 5) this.p1Count("def_" + mode);
    if (this.elapsed - (l.p1.logAt || -9) > 0.6) {
      l.p1.logAt = this.elapsed;
      this.p1Log("defense", { defender: l.name, role: l.role, defenderTarget: car.name, threatTarget: R.zone ? "shot" : "progress", pressDistance: +dist.toFixed(1), shotDenial: mode === "SHOT_BLOCK", coverValue: guard, tackleWindow: +(me.t).toFixed(2), timeToShot: +tShot.toFixed(2), timeToContact: +me.t.toFixed(2), mode, why });
    }
    return out;
  },
  // Segundo defensor: si el poseedor puede tirar antes de que el presionador llegue, el segundo cierra la línea de tiro.
  p1ShotLaneBlock(l, car) {
    const R = this.p1CarrierRead(car);
    if (R.shotThreat < 0.35) return null;
    const gx = 52.5 * R.dir, u = $i(gx - car.x, 0 - car.z), k = te(3.4 + 0.15 * R.dG * 0.3, 3, 6.5);
    (l.p1 || (l.p1 = {})).urgentAt = this.elapsed;
    return { x: te(car.x + u.x * k, -51, 51), z: te(car.z + u.z * k, -33, 33), sprint: DM.hypot(l.x - car.x, l.z - car.z) > 5, v: 1.03 };
  },
  // ------------------------------------------------------------------ 5a) DUELO ATACANTE: ¿el defensor ya se comprometió?
  // 0 = sigue temporizando; 1 = viene cerrando fuerte y ya está a distancia de entrada (no puede frenar/cambiar de lado a tiempo).
  p1DefenderCommit(t, q, nd) {
    const dx = t.x - q.x, dz = t.z - q.z, d = DM.hypot(dx, dz) || 1, closing = (q.vx * dx + q.vz * dz) / d, sp = DM.hypot(q.vx, q.vz);
    const P = this.p1Phys(q), stopD = (sp * sp) / (2 * P.aBrake) + 0.5; // distancia que necesita para frenar/rectificar
    return ai2Sat((closing - 2.5) / 3.5) * ai2Sat((3.6 - nd) / 1.6) * (nd < stopD + 1.6 ? 1 : 0.6);
  },
  p1DuelBonus(t, q, key) {
    const commit = this.p1DefenderCommit(t, q, DM.hypot(t.x - q.x, t.z - q.z)), rhythm = key === "change" || key === "sprint" || key === "sharpTouch" || key === "cut" || key === "autopase";
    const acc = (t.stats.acceleration - q.stats.acceleration) * 0.0022 * (0.35 + 0.65 * commit), read = (t.stats.intelligence - 60) * 0.0008;
    return acc + read + (rhythm ? 0.07 * commit : -0.03 * commit);
  },
  // ------------------------------------------------------------------ 5b) DUELO REAL (geometría de la disputa)
  p1DuelReach(f, owner) {
    const b = this.ball, ex = DM.max(0, DM.hypot(b.x - owner.x, b.z - owner.z) - 0.9), dv = { x: owner.x - f.x, z: owner.z - f.z }, dl = DM.hypot(dv.x, dv.z) || 1;
    const closing = (f.vx * dv.x + f.vz * dv.z) / dl;
    return 1.15 + 0.3 * ai2Sat(ex / 0.8) + 0.1 * ai2Sat((closing - 2) / 4);
  },
  p1DuelEval(f, v) {
    const b = this.ball, dvx = b.x - v.x, dvz = b.z - v.z, ex = DM.max(0, DM.hypot(dvx, dvz) - 0.9);
    const toDef = $i(f.x - v.x, f.z - v.z), vsp = DM.hypot(v.vx, v.vz), vdir = vsp > 0.3 ? { x: v.vx / vsp, z: v.vz / vsp } : { x: DM.sin(v.angle), z: DM.cos(v.angle) };
    const front = vdir.x * toDef.x + vdir.z * toDef.z;                  // 1: el defensor está de frente al atacante
    const dsp = DM.hypot(f.vx, f.vz), closing = dsp > 0.3 ? (f.vx * -toDef.x + f.vz * -toDef.z) / dsp * dsp : 0;
    const atk = v.stats.dribbling * 0.3 + v.stats.speed * 0.12 + v.stats.acceleration * 0.12 + v.stats.physical * 0.1 + v.personality.composure * 0.1 + v.personality.creativity * 0.06;
    const def = f.stats.defense * 0.34 + f.stats.speed * 0.1 + f.stats.acceleration * 0.06 + f.stats.physical * 0.14 + f.stats.intelligence * 0.18 + f.personality.consistency * 0.08 + (f.style === "Ball Winner" ? 6 : 0);
    const shielding = v.lastDecision === "hold" && this.elapsed - v.controlAt < 2.5;
    let winP = 0.42 + (def - atk) * 0.006 + 0.42 * ai2Sat(ex / 0.9) + 0.06 * ai2Clamp(closing / 5, -1, 1) - (front < -0.3 ? 0.12 : 0) + (front > 0.5 ? 0.04 : 0) - (shielding ? 0.12 : 0);
    // lado/espalda: ganar la pelota entrando por detrás es raro y casi siempre falta
    const fromBehind = front < -0.35 && vsp > 1;
    const foulP = ai2Clamp(0.07 + (f.personality.aggression - 50) * 0.003 - (f.personality.discipline - 50) * 0.0025 - (f.stats.defense - 60) * 0.0012 + (fromBehind ? 0.2 : 0) + (closing > 6 ? 0.06 : 0) + (ex > 0.5 ? -0.03 : 0), 0.03, 0.5);
    return { winP: ai2Clamp(winP, 0.12, 0.88), foulP, exposure: ex, front, fromBehind };
  },
  // ------------------------------------------------------------------ 6) THREAT MAP OPERATIVO
  // Para cada atacante rival: qué peligro aparece si lo abandono (ahora, tras recibir, tras conducir, tras pase, a la espalda, remate).
  p1ThreatMap(tm) {
    const S = this.p1S(), opTeam = 1 - tm, car = this.owner && this.owner.team !== tm ? this.owner : null, list = [], d = this.direction(tm), dOp = this.direction(opTeam);
    const opps = this.ai2Outfield(opTeam), mine = this.ai2Outfield(tm), lineAdv = this.pc ? this.pc.line[opTeam] : 0;
    // última línea propia (por delante del arco propio) para "a la espalda"
    let last = -99;
    for (const q of mine) last = DM.max(last, -q.x * d + 0 * 0);
    const b = this.ball;
    for (const a of opps) {
      if (a === car) continue;
      const adv = a.x * dOp, dG = DM.max(1.5, 52.5 - adv), sp = DM.hypot(a.vx, a.vz);
      const now = this.dangerAt(a.x, a.z, opTeam);
      const carry = this.dangerAt(te(a.x + a.vx * 1.4, -50, 50), te(a.z + a.vz * 1.4, -31, 31), opTeam);
      let recv = 0, prog = 0;
      if (car) {
        const dd = DM.hypot(a.x - car.x, a.z - car.z);
        if (dd > 4 && dd < 46) {
          const pl = this.p1BestPassTo(car, { p: a, x: a.x, z: a.z, vx: a.vx, vz: a.vz }, dd, dOp, 10, false);
          if (pl) { recv = (1 - pl.interceptionRisk) * this.dangerAt(pl.interceptPoint.x, pl.interceptPoint.z, opTeam); prog = ai2Sat(pl.progression / 25); }
        }
      }
      // a la espalda: no sólo "ya está detrás" sino "estará detrás en ~1.2 s" (carrera de ruptura)
      const advF = adv + DM.max(0, a.vx * dOp) * 1.2, behind = sp > 2.5 && a.vx * dOp > 1.5 && advF > lineAdv - 0.5 ? 0.45 + 0.5 * ai2Sat((advF - lineAdv) / 8) : 0;
      const th = DM.abs(DM.atan((a.z + 3.66) / dG) - DM.atan((a.z - 3.66) / dG)), shot = dG < 24 ? ai2Sat(th / 0.5) * ai2Sat((24 - dG) / 16) : 0;
      const total = ai2Clamp(0.34 * recv + 0.2 * now + 0.12 * carry + 0.14 * behind + 0.14 * shot * (0.4 + 0.6 * DM.min(1, recv * 1.5)) + 0.06 * prog, 0, 1.2);
      list.push({ p: a, now, carry, recv, prog, behind, shot, total });
    }
    list.sort((x, y) => y.total - x.total);
    S.threat[tm] = list;
    return list;
  },
  // ------------------------------------------------------------------ 7) ATAQUE SIN BALÓN (extras de evaluación de posición)
  p1PosExtras(l, c, carrier, opps, mates, role) {
    const tm = l.team, dCar = DM.hypot(c.x - carrier.x, c.z - carrier.z);
    let sc = 0;
    // línea de pase real desde el poseedor: sin línea, un apoyo no existe (por muy "libre" que esté la celda)
    const lane = 1 - this.ai2LaneRisk(carrier.x, carrier.z, c.x, c.z, opps), inRange = ai2Sat(1 - DM.abs(dCar - 12) / 12);
    const wantsLane = role === "SUPPORT" || role === "THIRD_MAN" || role === "NONE" || role === "SPACE_CREATOR" ? 1 : role === "WIDTH" ? 0.6 : 0.3;
    sc += 0.34 * wantsLane * lane * inRange;
    // triángulo: (poseedor, yo, otro compañero) con lados jugables y ángulo abierto — emerge de la geometría, no de una forma rígida
    let tri = 0;
    for (const m of mates) {
      if (m === l || m === carrier) continue;
      const a1 = DM.hypot(m.x - carrier.x, m.z - carrier.z), a2 = DM.hypot(m.x - c.x, m.z - c.z);
      if (a1 < 5 || a1 > 20 || a2 < 5 || a2 > 22 || dCar < 5 || dCar > 20) continue;
      const cosA = ((c.x - carrier.x) * (m.x - carrier.x) + (c.z - carrier.z) * (m.z - carrier.z)) / (dCar * a1);
      if (cosA < 0.8 && cosA > -0.5) { tri = 0.1; break; }
    }
    sc += tri;
    // fijar/liberar: cerca de un rival lo ata (beneficio al compañero) sólo si no es un apoyo cercano
    let bound = 0;
    for (const q of opps) if (DM.hypot(q.x - c.x, q.z - c.z) < 4.5) bound++;
    if (bound && role !== "SUPPORT" && dCar > 12) sc += 0.05 * DM.min(2, bound);
    // anti-persecución de la pelota: sólo el apoyo elegido se acerca; con 2+ compañeros ya alrededor del balón, otro más sobra
    let near = 0;
    for (const m of mates) if (m !== l && m !== carrier && DM.hypot(m.x - carrier.x, m.z - carrier.z) < 10) near++;
    if (dCar < 8 && role !== "SUPPORT") sc -= 0.3;
    if (near >= 2 && dCar < 11) sc -= 0.28;
    return sc;
  },
  // ------------------------------------------------------------------ 8) RITMO: velocidad como consecuencia de destino + intención + urgencia + atributos
  // Devuelve el multiplicador `r` para move() y si corre en sprint. Sustituye los "v" y "sprinting" sueltos del código viejo.
  p1Pace(l, tx, tz, v0, sprint0) {
    const dx = tx - l.x, dz = tz - l.z, dist = DM.hypot(dx, dz), role = l.tacticalRole || l.state, st = l.stamina ?? 100;
    let urgency = 0, why = "cruise";
    const urgentRole = role === "PRESS" || role === "PRESS_DESCOORD" || role === "CONTACT" || role === "CLOSE_DOWN" || role === "SHOT_BLOCK" || role === "RECEIVE" || role === "CHASE" || role === "TRACK_RUN" || role === "PASS_LANE_BLOCK" || role === "DEPTH_RUN" || role === "BLIND_SIDE_RUN" || role === "RUNNER" || role === "BOX_CRASH" || role === "DROP" || role === "LATE";
    if (urgentRole || sprint0) { urgency = 0.7 + 0.3 * ai2Sat(dist / 10); why = urgentRole ? "intent:" + role : "run_to_space"; }
    else if (l.p1 && l.p1.urgentAt === this.elapsed) { urgency = 0.85; why = "deny_shot/close_down"; }
    else if (role === "CONTAIN") { urgency = 0.55; why = "contain"; }
    else if (v0 >= 1.05) { urgency = 0.5; why = "transition"; }
    let r;
    if (role === "RECEIVE" && l.p1 && l.p1.recv) {
      // el receptor no corre siempre a tope: corre lo que necesita para llegar con ventaja y frena antes de recibir
      const P = this.p1Phys(l), rc = l.p1.recv, need = dist / DM.max(0.2, rc.t - 0.08);
      const rr = te(need / P.vrun, 0.22, 1);
      return { r: rr, sprint: need > P.vrun * 0.93 && dist > 3 && st > 40, why: "receive need=" + need.toFixed(1) };
    }
    if (urgency > 0.5) r = urgency > 0.68 ? te(0.62 + 0.05 * dist, 0.62, 1) : 0.7; // Fase 3: la urgencia escala con la distancia (a 3 m no se sprinta)
    else r = te(0.2 + 0.03 * dist, 0.2, 0.7); // Fase 3: al posicionarse se camina/trota; sólo se corre fuerte con urgencia
    if (dist < 0.7) r = DM.min(r, 0.3);
    const sprint = urgency > 0.68 && dist > 3.5 && st > 40;
    if (!sprint && sprint0 && dist > 14 && st > 40 && urgency <= 0.68) return { r, sprint: true, why: "long_recover" };
    return { r, sprint, why };
  },
  // Snapshot explicable de un jugador (Fase 23 — movimiento)
  p1DebugPlayer(p) {
    const sp = DM.hypot(p.vx, p.vz);
    return { name: p.name, role: p.role, state: p.state, tactical: p.tacticalRole, speed: +sp.toFixed(2), kmh: +(sp * 3.6).toFixed(1), tier: p.speedTier, sprinting: !!p.sprinting, stamina: +(p.stamina ?? 100).toFixed(0), def: p.p1 && p.p1.def, mv: p.p1 && p.p1.mv };
  },
});
// ============================================================================================
// FASE 3 — PORTERO, BARRIDAS, PELOTAS PARADAS, LABORATORIO DE JUGADAS  (fuente: p1/p3.js, inyectado junto a p1.js)
//
//  A. Portero ........ keeper (reemplaza al anterior): lectura de situación → posición (línea / achica 1v1 / libero) → acción
//                      (atajada lateral, estirada hacia atrás, salida a cruces: agarra o despeja con los puños, "sacar la pelota de los pies",
//                      barrida de portero libero ante pase filtrado). p3GkContact resuelve el contacto: retiene o rebota (al córner, a un lado
//                      o AL CENTRO DEL ÁREA) y respeta el reglamento (fuera del área / pase de pie de un compañero → sólo con los pies).
//  B. Pelota parada .. p3SetPieceFilter (el cobrador NO puede llevar la pelota: pasa/tira/centra) + p3SetPieceShape (el resto se ubica).
//  C. Barrida ........ p3SlideScan: barrida para quitar el balón al portador desde lejos y para tapar tiros (el impulso/animación viven en
//                      tlStartSlide/tlLockMove y en TLB.pose).
//  D. Laboratorio .... p3DebugScenario(kind, team): arma jugadas (tiros libres, penales, córners, faltas, 1v1, centros, pases filtrados…).
// ============================================================================================
const P3_AREA_X = 16.5, P3_AREA_Z = 20.16;
const LONG_SHOT_DAMP = 0.42, LONG_SHOT_PENALTY = 0.08; // qué tanto se desalienta el tiro desde lejos (1 = como antes / 0 = nunca)
const GK_BUBBLE = 5; // metros: distancia mínima de los rivales al arquero que tiene la pelota agarrada
const GK_HOLD_S = 5; // segundos mínimos que el arquero se queda con la pelota en las manos antes de soltarla
const P3_SCENARIOS = [
  ["fk_direct_near", "Tiro libre directo · 20 m centrado"],
  ["fk_direct_mid", "Tiro libre directo · 26 m, ángulo"],
  ["fk_far_cross", "Tiro libre lejano centrado (centro al área) · 34 m"],
  ["fk_wide_cross", "Tiro libre lateral (centro al área)"],
  ["fk_midfield", "Tiro libre en mitad de cancha (saque jugado)"],
  ["fk_own_third", "Tiro libre en campo propio"],
  ["penalty", "Penal"],
  ["corner_l", "Córner (lado izquierdo)"],
  ["corner_r", "Córner (lado derecho)"],
  ["throwin_att", "Saque de banda en ataque"],
  ["goalkick", "Saque de arco"],
  ["foul_box", "Falta dentro del área (penal)"],
  ["foul_edge", "Falta en el borde del área"],
  ["foul_mid", "Falta en mitad de cancha"],
  ["gk_1v1", "Portero: 1v1 (achicar / sacar de los pies)"],
  ["gk_smother", "Portero: rival llega con el balón largo (sacársela de los pies)"],
  ["gk_cross", "Portero: centro al área (agarrar / puños)"],
  ["gk_through", "Portero: pase filtrado (salir a despejar)"],
  ["gk_lob", "Portero: globo por arriba (estirada hacia atrás)"],
  ["gk_shot", "Portero: tiro esquinado (atajada lateral)"],
  ["gk_build", "Portero: salida jugada con los defensas"],
  ["slide_tackle", "Barrida: quitarle el balón al portador desde lejos"],
  ["slide_block", "Barrida: tapar un tiro"],
];
Object.assign(wc.prototype, {
  // ================================================================== B. PELOTA PARADA
  // El cobrador de una pelota parada tiene su propio cerebro: sólo puede pasar, tirar (si el libre es directo y está a tiro), centrar o despejar.
  // Antes salía "jugando" con la pelota como si fuera un poseedor cualquiera (infracción: la pelota debe ser jugada por otro / tocada una vez).
  p3SetPieceFilter(t, ctx, cands) {
    const sp = t.spTaker;
    if (!sp || sp.until <= this.elapsed) return;
    const dg = ctx.distGoal;
    for (let i = cands.length - 1; i >= 0; i--) {
      const c = cands[i], ok = c.key === "pass" || c.key === "clear" || (c.kind === "shot" && sp.direct && dg <= 36);
      if (!ok) { cands.splice(i, 1); continue; }
      if (c.kind === "shot") c.score += dg < 26 ? 0.14 : 0.04; // tiro libre a distancia de remate: el tiro compite fuerte con el pase
    }
    // Tiro libre directo a corta/media distancia: el remate tiene que estar siempre entre las opciones (antes dependía de un sorteo y el cobrador terminaba tocando corto).
    if (sp.direct && sp.kind === "freekick" && dg <= 34 && !cands.some((c) => c.kind === "shot"))
      cands.push({ key: "shot", kind: "shot", score: 0.85 - dg * 0.018 + (ctx.shotScore > 0 ? 0.05 : 0), diff: 0.1 + (dg / 50) * 0.4, risky: dg > 26, why: ["tiro libre directo"], spec: false });
    if (!cands.length) cands.push({ key: "clear", kind: "clear", score: 0, diff: 0.3, risky: false, why: ["pelota parada"] });
  },
  // Coreografía del equipo mientras se prepara un tiro libre no cinemático (lejano / lateral): atacantes al área, defensores en línea.
  p3SetPieceShape(rd, dt) {
    if (!rd || rd.kind === "throwin" || rd.kind === "goalkick" || rd.kind === "corner" || rd.takerId == null) return;
    const A = rd.team, D = 1 - A, dir = this.direction(A), gx = 52.5 * dir, dGoal = DM.hypot(gx - rd.x, rd.z);
    const mode = dGoal < 44 ? "cross" : "build";
    rd.p3mode = mode;
    if (mode !== "cross") return;
    const until = this.elapsed + 0.25;
    const off = this.players.filter((p) => p.team === A && !p.sentOff && !p.ragdoll && p.id !== rd.takerId && p.role !== "GK");
    const def = this.players.filter((p) => p.team === D && !p.sentOff && !p.ragdoll && p.role !== "GK");
    const rest = new Set([...off].sort((a, b) => a.x * dir - b.x * dir).slice(0, 3).map((p) => p.id)); // defensa de descuento
    const going = off.filter((p) => !rest.has(p.id));
    let near = 0;
    const slots = [[6, 2.6], [8, -3.4], [11, 7], [11.5, -7], [15, 0], [7, 10.5], [14, 12], [14, -12]].map(([b, z]) => ({ x: gx - dir * b, z, taken: false }));
    for (const p of [...going].sort((a, b) => DM.abs(b.x * dir) - DM.abs(a.x * dir))) {
      let best = null, bd = 1e9;
      for (const s of slots) { if (s.taken) continue; const d = DM.hypot(s.x - p.x, s.z - p.z); if (d < bd) { bd = d; best = s; } }
      if (!best) break;
      best.taken = true;
      p.p3Move = { x: best.x, z: best.z, r: 1, until, role: "SET_PIECE_BOX" };
      if (DM.hypot(best.x - p.x, best.z - p.z) < 6) near++;
    }
    if (near >= DM.min(4, going.length) || this.elapsed - rd.since > 9) rd.p3ready = true;
    let k = 0;
    for (const p of [...rest]) { const q = off.find((z) => z.id === p); if (!q) continue; q.p3Move = { x: gx - dir * 34, z: (k++ - 1) * 14, r: 0.55, until, role: "REST_DEFENSE" }; }
    // defensores: línea zonal frente al área chica y dos marcando hombre a hombre a los atacantes más peligrosos
    const dl = [...def].sort((a, b) => DM.abs(a.z) - DM.abs(b.z));
    dl.forEach((p, i) => {
      const zone = -15 + (30 * i) / DM.max(1, dl.length - 1);
      let tx = gx - dir * (i % 3 === 0 ? 5.5 : 9), tz = zone;
      const mk = i < 3 ? going[i] : null;
      if (mk) { tx = mk.x + dir * 1.2; tz = mk.z * 0.94; }
      // respeta los 9.15 m a la pelota
      const dx = tx - rd.x, dz = tz - rd.z, dd = DM.hypot(dx, dz);
      if (dd < 9.6) { tx = rd.x + (dx / (dd || 1)) * 9.6; tz = rd.z + (dz / (dd || 1)) * 9.6; }
      p.p3Move = { x: te(tx, -51, 51), z: te(tz, -32, 32), r: 1, until, role: "SET_PIECE_MARK" };
    });
  },
  // ¿el arquero debe jugar la pelota con los pies? (pase atrás de un compañero, o pelota fuera del área)
  p3MustPlayByFoot(f) { return !!(this.p3Foot && this.p3Foot.id === f.id && this.elapsed - this.p3Foot.at < 8 && this.lastTouch && this.lastTouch.team === f.team); },
  // pase atrás al arquero: sólo con el equipo presionado, en campo propio y con el arquero libre
  p3GkBackpassOk(t, gk, ctx) {
    if (gk.sentOff || gk.ragdoll) return false;
    const dir = this.direction(t.team);
    if (t.x * dir > -6 || ctx.pressure < 0.4) return false;
    const d = DM.hypot(gk.x - t.x, gk.z - t.z);
    if (d < 6 || d > 34) return false;
    return !this.players.some((q) => q.team !== t.team && !q.sentOff && q.role !== "GK" && DM.hypot(q.x - gk.x, q.z - gk.z) < 9);
  },
  // ================================================================== A. PORTERO
  p3InArea(t, x, z) {
    const s = this.direction(t.team), r = -52.5 * s, l = (x - r) * s;
    return l > -1 && l < P3_AREA_X && DM.abs(z) < P3_AREA_Z;
  },
  // balón en tau segundos (rodando o en el aire) sin rebotes: suficiente para leer un pase filtrado / centro
  p3BallAt(tau) {
    const b = this.ball, ground = b.y < 0.3;
    let x = b.x, z = b.z, vx = b.vx, vz = b.vz;
    for (let t = 0; t < tau; t += 0.05) {
      const dt = DM.min(0.05, tau - t), sp = DM.hypot(vx, vz);
      x += vx * dt; z += vz * dt;
      if (sp > 0) { const o = DM.max(0, sp - ballDecel(sp, ground) * dt) / sp; vx *= o; vz *= o; }
    }
    return { x, z };
  },
  p3GkRead(t, s, r) {
    const b = this.ball, rivals = this.players.filter((p) => p.team !== t.team && !p.sentOff && p.role !== "GK"), mates = this.players.filter((p) => p.team === t.team && !p.sentOff && p.role !== "GK");
    const carrier = this.owner && this.owner.team !== t.team ? this.owner : null;
    let threat = 99;
    for (const p of rivals) threat = DM.min(threat, DM.hypot(p.x - r, p.z));
    return { b, rivals, mates, carrier, threat, ballLine: (b.x - r) * s, ownPoss: !!(this.owner && this.owner.team === t.team) };
  },
  // Posición base del arquero (referencia: cómo se para un arquero real — sobre la BISECTRIZ del ángulo que forman los dos palos vistos
  // desde la pelota, es decir la recta centro-del-arco → pelota; y cuánto sale de la línea depende de lo lejos que esté el rival con la pelota:
  // lejos (>30 m) se queda cerca de la línea o hace de líbero; a media distancia da 1,5–4 m; con el rival solo de frente achica saliendo en
  // proporción a la distancia, y a corta distancia se le tira encima con la estirada abierta (p3GkSpreadRead).
  p3GkPosition(t, s, r, R) {
    const b = R.b, c = R.carrier, sweeper = t.style === "Sweeper Keeper" ? 1.35 : 0.85;
    const bx = c && !this.shot ? c.x + c.vx * 0.3 : b.x, bz = c && !this.shot ? c.z + c.vz * 0.3 : b.z;
    const D = DM.max(1, DM.hypot(bx - r, bz)), ux = (bx - r) / D, uz = bz / D;
    let off = te(1.4 + DM.max(0, 32 - D) * 0.085, 1.4, 4.1), mode = "line";
    if (c && !this.shot) {
      const isolated = !R.rivals.some((q) => q !== c && ze(q, c) < 9) && !R.mates.some((m) => ze(m, c) < 6 && (m.x - r) * s < (c.x - r) * s + 1.5);
      if (D < 30) {
        if (isolated) { off = te(D * (D < 10 ? 0.5 : 0.36) * sweeper, 1.8, 11); mode = "closedown"; } // solo de frente: achica
        else off = te(1.5 + (30 - D) * 0.09, 1.5, 4.4); // hay defensores: se queda más cerca de la línea
      }
    } else if (!this.shot && R.threat > 30 && !(this.owner && this.owner.team !== t.team)) {
      // no hay delanteros cerca: libero — sube a ofrecer el pase de seguridad y a cubrir la espalda de la línea
      const depth = te((R.ballLine - 18) * 0.3 + 4, 3.5, 16) * DM.min(1.2, sweeper);
      const o = this.owner && this.owner.team === t.team ? this.owner : null;
      const zz = o ? -DM.sign(o.z || 1) * DM.min(7, DM.abs(o.z) * 0.5 + 2) : te(b.z * 0.25, -7, 7);
      return { x: r + s * depth, z: zz, mode: "sweeper" };
    }
    let x = r + ux * off, z = te(uz * off, -5.5, 5.5);
    // PRIMER PALO en ángulo cerrado (pedido explícito: "disparan desde cerca de la línea del córner
    // en un costado y en vez de cuidar el palo el arquero está en el medio"): cuanto más ancho (cerca
    // de la línea de banda) y más cerca de la línea de fondo esté el balón, más se cierra hacia el
    // palo cercano — y sale un paso de la línea para recortar el ángulo. No aplica con la pelota en
    // el aire (un centro/globo cae en otro punto — ahí no corresponde "cerrar el palo", rompía el
    // agarre de centros) ni en "sweeper" (no hay ángulo de remate que cubrir, está armando juego).
    // v2 (pedido explícito, "le siguen metiendo goles por no cubrir el poste cuando alguien va por el
    // costado"): antes esto SÓLO se aplicaba en modo "line" — pero un delantero aislado yendo por el
    // costado hacia el fondo cae en "closedown" (líneas de arriba, lo sigue por la recta arco-pelota),
    // que es justo el caso típico de ángulo cerrado, y se saltaba el cierre de palo entero. Ahora
    // también se mezcla en "closedown" (con menos peso, para no romper el achique del 1v1 recto).
    if (mode !== "sweeper" && b.y < 1.4) {
      const wideness = te((DM.abs(b.z) - 12) / 18, 0, 1), depth = DM.max(1, (b.x - r) * s), closeness = te(1 - depth / 22, 0, 1), tight = wideness * closeness;
      if (tight > 0) {
        const nearPost = DM.sign(b.z || 1) * (2.8 + tight * 1.3);
        const blend = mode === "closedown" ? tight * 0.55 : tight;
        z = z * (1 - blend) + te(nearPost, -4.1, 4.1) * blend;
        if (mode === "line") x = r + s * (2.1 + tight * 1.4);
      }
    }
    return { x, z, mode };
  },
  // ¿Hay un balón suelto / pase filtrado que un rival alcanza antes que cualquiera de nuestros defensores y que el arquero SÍ puede ganar?
  p3GkSweepRead(t, s, r, R) {
    const b = this.ball;
    if (this.owner || this.shot || b.y > 1.5) return null;
    const sp = DM.hypot(b.vx, b.vz);
    let prevOk = false;
    for (let tau = 0.3; tau <= 2.8; tau += 0.25) {
      const P = this.p3BallAt(tau);
      if (DM.abs(P.x) > 52 || DM.abs(P.z) > 33) break;
      const line = (P.x - r) * s;
      if (line < 1.5 || line > 36 || DM.abs(P.z) > 27) continue;
      const gk = this.p1ETA(t, P.x, P.z, { reach: 0.7 });
      let riv = 99, def = 99;
      for (const q of R.rivals) riv = DM.min(riv, this.p1ETA(q, P.x, P.z, { reach: 0.6 }));
      for (const q of R.mates) def = DM.min(def, this.p1ETA(q, P.x, P.z, { reach: 0.6 }));
      if (sp < 2.5 && line > 22) continue;
      if (gk <= tau + 0.05 && gk + 0.12 < riv && riv < tau + 0.9 && def > riv - 0.1) return { x: P.x, z: P.z, tau, gk, riv, line };
      prevOk = true;
    }
    void prevOk;
    return null;
  },
  // tiempo en que el balón (cayendo) cruza la altura h; null si no llega
  p3BallHeightTime(h) {
    const b = this.ball, a = -4.905, B = b.vy, C = b.y - h, disc = B * B - 4 * a * C;
    if (disc < 0) return null;
    const t1 = (-B - DM.sqrt(disc)) / (2 * a), t2 = (-B + DM.sqrt(disc)) / (2 * a), T = DM.max(t1, t2);
    return T > 0 ? T : null;
  },
  // Centros: ¿salgo a por él? y ¿lo agarro o lo despejo con los puños?
  p3GkCrossRead(t, s, r) {
    const n = this.ball, airborne = !this.owner && n.y > 0.9 && DM.hypot(n.vx, n.vz) > 3;
    if (!airborne || this.shot) return null;
    const grav = 9.81, disc = n.vy * n.vy + 2 * grav * (n.y - 0.13);
    if (disc <= 0) return null;
    const tLand = (n.vy + DM.sqrt(disc)) / grav;
    const tHand = this.p3BallHeightTime(2.5), tt = tHand != null && tHand < tLand ? tHand : tLand;
    const P = this.p3BallAt(tt), lx = te(P.x, -52, 52), lz = te(P.z, -34, 34);
    if (!(DM.abs(lx - r) < 16 && DM.abs(lz) < 19.5)) return null;
    const gkSpeed = 5.0 + t.stats.acceleration * 0.02, gkETA = DM.hypot(lx - t.x, lz - t.z) / gkSpeed;
    const crowd = this.players.filter((p) => p.role !== "GK" && !p.sentOff && DM.hypot(p.x - lx, p.z - lz) < 5).length;
    const rivalsIn = this.players.filter((p) => p.team !== t.team && p.role !== "GK" && !p.sentOff && DM.hypot(p.x - lx, p.z - lz) < 3.2).length;
    const conf = te(0.55 + (t.stats.defense - 70) * 0.006 - crowd * 0.1 + (t.personality.composure - 55) * 0.004 + (t.style === "Sweeper Keeper" ? 0.15 : 0), 0.08, 0.92);
    if (!(gkETA < tt + 0.2 + 0.15 * this.gkSkill(t))) return null;
    // rival ganándole de cabeza: no sale
    let rivETA = 99;
    for (const p of this.players) if (p.team !== t.team && p.role !== "GK" && !p.sentOff) rivETA = DM.min(rivETA, this.p1ETA(p, lx, lz, { reach: 0.5 }));
    if (rivETA + 0.15 < gkETA) return null;
    const fist = crowd >= 3 || rivalsIn >= 2 || conf < 0.45;
    return { x: lx, z: te(lz, -9, 9), tHit: tt, gkETA, kind: fist ? "punch" : "claim", conf, crowd };
  },
  // dispara una acción de portero (usa t.dive como temporizador: el render y el contacto leen diveKind/diveDur)
  p3GkStartAct(t, kind, o = {}) {
    const durs = { side: 0.66, back: 0.72, claim: 0.78, punch: 0.72, smother: 0.62, step: 0.34, spread: 1.05, gather: 0.75 };
    t.dive = durs[kind] || 0.66; t.diveAge = 0; t.diveKind = kind; t.diveDur = t.dive; t.diveDir = o.dir || 1; t.state = "Dive";
    // Estirada baja/alta (pedido explícito): antes toda estirada lateral usaba la misma animación "a
    // media altura" sin importar si el remate iba raso o a la escuadra. o.height ("low"/"high", lo
    // decide gkSaveDecision según la altura del balón predicha) sólo cambia la pose que dibuja el
    // render — no toca el alcance real de la atajada.
    t.diveHeight = o.height || "mid";
    t.gkAct = { kind, tx: o.tx ?? t.x, tz: o.tz ?? t.z, t0: this.elapsed, done: false };
    if (o.tx != null) t.angle = DM.atan2(o.tx - t.x, o.tz - t.z);
    t.gkCd = this.elapsed + (kind === "smother" ? 2.4 : kind === "spread" ? 1.6 : 0.5);
    this.p1Count && this.p1Count("gk_" + kind);
  },
  p3GkAct(t, e) {
    if (!(t.dive > 0)) return false;
    t.dive = DM.max(0, t.dive - e);
    if (t.dive <= 0) { t.gkAct = null; t.diveKind = null; return false; }
    const A = t.gkAct || {}, k = t.diveKind || "side", s = this.direction(t.team), r = -52.5 * s, dur = t.diveDur || 0.66, prog = 1 - t.dive / dur;
    let dx = 0, dz = 0;
    if (k === "side") {
      // Alcance atado al destino real (pedido explícito: "se tira de más, en realidad iba más cerca
      // de lo que se tiró"): antes se movía a velocidad fija (6/s) durante toda la animación sin
      // importar a dónde iba el remate — siempre recorría los mismos ~4m, así que un tiro apenas
      // desviado del cuerpo lo mandaba a estirarse de más y terminaba fuera de posición cuando la
      // pelota llegaba (p3GkContact mide distancia a la posición ACTUAL, no a la de destino). Ahora
      // avanza hacia gkAct.tz (el punto real por donde predijo que cruza el balón, ver
      // gkSaveDecision) y frena al llegar, en vez de recorrer siempre la misma distancia.
      const rem = te((A.tz ?? t.z) - t.z, -5.3, 5.3);
      dz = (rem === 0 ? t.diveDir : DM.sign(rem)) * DM.min(DM.abs(rem), 6 * e);
    } else if (k === "step") {
      // Paso corto (pedido explícito): misma lógica de "frenar al llegar" que la estirada, pero con
      // techo de velocidad más bajo — es un paso reactivo, no un vuelo lateral completo.
      const rem = te((A.tz ?? t.z) - t.z, -5.3, 5.3);
      dz = (rem === 0 ? t.diveDir : DM.sign(rem)) * DM.min(DM.abs(rem), 4.2 * e);
    }
    else if (k === "back") { dx = -s * 3.4 * e; dz = te((A.tz - t.z) * 2.2, -4, 4) * e; }
    else if (k === "claim" || k === "punch") { const f = DM.min(1, 5 * e); dx = (A.tx - t.x) * f; dz = (A.tz - t.z) * f; }
    else if (k === "spread") { const L = DM.hypot(A.tx - t.x, A.tz - t.z), sp = prog < 0.42 ? 6.6 : 0; if (L > 0.05 && sp) { dx = ((A.tx - t.x) / L) * DM.min(L, sp * e); dz = ((A.tz - t.z) / L) * DM.min(L, sp * e); } }
    else if (k === "gather") { const L = DM.hypot(A.tx - t.x, A.tz - t.z), sp = prog < 0.5 ? 3.0 : 0; if (L > 0.05 && sp) { dx = ((A.tx - t.x) / L) * DM.min(L, sp * e); dz = ((A.tz - t.z) / L) * DM.min(L, sp * e); } }
    else if (k === "smother") { const L = DM.hypot(A.tx - t.x, A.tz - t.z), sp = prog < 0.6 ? 6.4 : 1.5; if (L > 0.05) { dx = ((A.tx - t.x) / L) * DM.min(L, sp * e); dz = ((A.tz - t.z) / L) * DM.min(L, sp * e); } }
    t.x = te(t.x + dx, -52.4, 52.4);
    const lateral = k === "side" || k === "step";
    t.z = te(t.z + dz, lateral ? -5.3 : -33, lateral ? 5.3 : 33);
    t.vx = dx / e; t.vz = dz / e;
    t.state = "Dive";
    if (k === "smother" || k === "spread") this.p3GkSmotherHit(t);
    return true;
  },
  // Sacar la pelota de los pies: el arquero se lanza al balón; si el rival la lleva, es un duelo (puede terminar en falta/penal).
  p3GkSmotherHit(f) {
    const c = this.owner;
    if (!c || c.team === f.team || !f.gkAct || f.gkAct.done) return;
    if (DM.hypot(c.x - f.x, c.z - f.z) > 1.55 && DM.hypot(this.ball.x - f.x, this.ball.z - f.z) > 1.3) return;
    f.gkAct.done = true;
    const pWin = te(0.5 + (f.stats.defense - 70) * 0.004 + (f.ai ? (f.ai.anticipation - 0.6) * 0.25 : 0) - (c.stats.dribbling - 70) * 0.004 - (c.stats.physical - 70) * 0.002 - (c.lastDecision === "hold" ? 0.06 : 0), 0.14, 0.86);
    this.p1Count && this.p1Count("gk_smother_duel");
    if (this.random() < pWin) {
      c.timer = 0.6; c.tackleAt = this.elapsed; c.think = 0.7;
      this.gkGrab(f);
      this.event("save", "¡LE SACÓ LA PELOTA DE LOS PIES!", `${f.name} se lanza y se la quita a ${c.name}`, f.team, f);
      this.excitement = DM.min(100, this.excitement + 14);
    } else if (this.random() < 0.3 + (c.stats.dribbling - 70) * 0.002) {
      this.commitFoul(f, c);
    } else { f.timer = 0.55; }
  },
  // Decisión de salir a sacarle el balón de los pies al rival (lanzarse a sus pies) — con cadencia (no cada frame)
  p3GkSmotherRead(t, R) {
    const c = R.carrier, b = R.b;
    if (!c || this.shot || (t.gkCd || 0) > this.elapsed || (t.p3n || 0) > this.elapsed) return null;
    t.p3n = this.elapsed + 0.22;
    const dBall = DM.hypot(b.x - t.x, b.z - t.z), dCar = ze(c, t);
    if (dBall > 3.5 || dBall < 0.8 || dCar > 4.6) return null;
    const s = this.direction(t.team), line = (c.x - (-52.5 * s)) * s;
    if (line > 19 || DM.abs(c.z) > 22) return null;
    const exposed = DM.hypot(b.x - c.x, b.z - c.z) > 0.6 || DM.hypot(c.vx, c.vz) > 4.6;
    if (!exposed) return null;
    const p = te(0.42 + (t.personality.aggression - 50) / 160 + (t.style === "Sweeper Keeper" ? 0.16 : 0) + (t.stats.defense - 70) * 0.004 - (c.stats.dribbling - 70) * 0.003, 0.12, 0.88);
    if (this.random() > p) return null;
    return { tx: b.x + b.vx * 0.16, tz: b.z + b.vz * 0.16 };
  },
  // Estirada abierta (brazos y piernas en cruz, como los 1v1 de los arqueros de élite): el rival viene de frente con la pelota dominada,
  // ya a menos de ~6 m, sin un defensor que lo tape — el arquero le sale al cruce, se tira al piso abierto y tapa todo el ancho.
  p3GkSpreadRead(t, s, r, R) {
    const c = R.carrier;
    if (!c || this.shot || (t.gkCd || 0) > this.elapsed || (t.p3s || 0) > this.elapsed) return null;
    t.p3s = this.elapsed + 0.2;
    const D = ze(c, t), dl = (c.x - r) * s;
    if (D > 6.2 || D < 1.6 || dl > 24 || DM.abs(c.z) > 21) return null;
    const cover = R.mates.some((m) => ze(m, c) < 2.4 && (m.x - r) * s < dl);
    if (cover) return null;
    if (DM.hypot(this.ball.x - c.x, this.ball.z - c.z) > 3) return null; // la pelota tiene que estar con él
    const p = te(0.55 + (t.personality.aggression - 50) / 200 + (t.style === "Sweeper Keeper" ? 0.15 : 0) + (t.stats.defense - 70) * 0.004 - (c.stats.dribbling - 70) * 0.003, 0.25, 0.92);
    if (this.random() > p) return null;
    const k = 0.5; // sale hasta la mitad del camino entre él y el rival
    return { tx: t.x + (c.x - t.x) * k, tz: t.z + (c.z - t.z) * k };
  },
  // Agarrar la pelota "a voluntad": pelota mansa en el área, sin rival encima → el arquero se agacha y la levanta con las manos.
  p3GkGatherRead(t, s, r, R) {
    const b = this.ball;
    if (this.owner || this.shot || b.y > 0.45 || (t.gkCd || 0) > this.elapsed) return null;
    if (DM.hypot(b.vx, b.vz) > 7.5 || !this.p3InArea(t, b.x, b.z) || this.p3MustPlayByFoot(t)) return null;
    const d = DM.hypot(b.x - t.x, b.z - t.z);
    if (d > 2.4 || d < 0.35) return null;
    if (R.rivals.some((q) => ze(q, b) < 1.3)) return null;
    // no la levanta al instante: decide con cadencia y según su habilidad
    if ((t.p3g || 0) > this.elapsed) return null;
    t.p3g = this.elapsed + 0.35;
    if (this.random() > 0.5 + 0.3 * this.gkSkill(t)) return null;
    return { tx: b.x + b.vx * 0.2, tz: b.z + b.vz * 0.2 };
  },
  // ---------- REGLAS DE JUEGO COLECTIVO ----------
  ruleSet(team) { return (this.rules || (this.rules = [tacRulesDefault(), tacRulesDefault()]))[team]; },
  setRule(team, id, patch) {
    const r = this.ruleSet(team)[id], def = TAC_RULES.find((x) => x.id === id);
    if (!r || !def) return false;
    if (patch && "on" in patch) r.on = !!patch.on;
    if (patch && patch.p) for (const q of def.params) if (q.k in patch.p) { const v = Number(patch.p[q.k]); if (isFinite(v)) r.p[q.k] = DM.min(q.max, DM.max(q.min, v)); }
    return true;
  },
  tacP(team, id) { const r = this.ruleSet(team)[id]; return r && r.on ? r.p : null; },
  // Se llama una vez por cuadro antes de mover a los jugadores: decide quiénes cumplen cada rol (receptor, cazadores de centro, centrales…).
  tacPrep() {
    if (this.phase !== "playing") { this._tac = null; return; }
    const o = this.owner, now = this.elapsed, T = this._tac = [{}, {}];
    this._tacKeep = this._tacKeep || [null, null];
    for (const team of [0, 1]) {
      const d = this.direction(team), gxOwn = -52.5 * d, rec = T[team] = { d, gxOwn, pass: new Set(), passRole: new Map(), hunt: new Set(), huntList: [], far: new Set(), drop: null, cent: [], iron: new Map(), minRival: 99, defMed: null, run: new Set(), lastDef: 0 };
      const mates = this.players.filter((p) => p.team === team && p.role !== "GK" && !p.sentOff && !p.ragdoll && !p.tlmSubbing && !(p.tlFrozen > now));
      rec.mates = mates;
      { let ld = -60; for (const q of this.players) if (q.team !== team && q.role !== "GK" && !q.sentOff) ld = DM.max(ld, q.x * d); rec.lastDef = ld; } // último defensor rival (línea de fuera de juego)
      const car = o && o.team === team ? o : null, others = car ? mates.filter((m) => m !== car) : mates;
      let P;
      if (car && (P = this.tacP(team, "passPlay"))) {
        // los más cercanos al poseedor; el que quedó más atrás ofrece el pase en retroceso y el más adelantado la opción para seguir avanzando (el resto alterna)
        const near = others.slice().sort((a, b) => ze(a, car) - ze(b, car)).slice(0, P.n).sort((a, b) => a.x * d - b.x * d);
        near.forEach((m, i) => { rec.pass.add(m.id); rec.passRole.set(m.id, near.length === 1 ? (m.x * d < car.x * d ? "back" : "front") : i === 0 ? "back" : i === near.length - 1 ? "front" : i % 2 ? "front" : "back"); });
      }
      if (car && (P = this.tacP(team, "dropNine")) && car.x * d < 20) { const f = others.filter((m) => m.role === "FWD").sort((a, b) => ze(a, car) - ze(b, car))[0]; if (f) rec.drop = f.id; }
      if ((P = this.tacP(team, "crossHunt"))) {
        if (car && car.x * d > P.third) {
          const prev = this._tacKeep[team];
          if (!prev || prev.until < now + 1.6) { // se renueva la selección sólo si venció (no cambia de gente a cada cuadro)
            const cand = others.filter((m) => m.role !== "DEF").sort((a, b) => DM.hypot(a.x - 52.5 * d, a.z) - DM.hypot(b.x - 52.5 * d, b.z)).slice(0, P.n);
            this._tacKeep[team] = { ids: cand.map((m) => m.id), until: now + 2.4 };
          }
        } else if (o && o.team !== team) this._tacKeep[team] = null;
        const k = this._tacKeep[team];
        if (k && k.until > now) k.ids.forEach((id) => { const m = this.players[id]; if (m && !m.sentOff && m.role !== "GK" && m !== car) { rec.hunt.add(id); rec.huntList.push(id); } });
      }
      if (car && (P = this.tacP(team, "farPost")) && DM.abs(car.z) > 20 && car.x * d > 14) {
        const gz = -DM.sign(car.z) * P.z;
        others.filter((m) => m.role !== "DEF" && !rec.hunt.has(m.id)).sort((a, b) => DM.hypot(a.x - 47 * d, a.z - gz) - DM.hypot(b.x - 47 * d, b.z - gz)).slice(0, P.n).forEach((m) => rec.far.add(m.id));
      }
      if (car && (P = this.tacP(team, "counterRun")) && this.elapsed - (this.gainedBallAt[team] ?? -9) < 4.5)
        others.filter((m) => m.role === "FWD").sort((a, b) => b.x * d - a.x * d).slice(0, P.n).forEach((m) => rec.run.add(m.id));
      // centrales: los 2 defensas más centrales según el puesto de formación
      const defs = mates.filter((m) => m.role === "DEF");
      if (this.tacP(team, "defPlanted") || this.tacP(team, "defIron")) {
        rec.cent = defs.slice().sort((a, b) => DM.abs(this.formationSlot(team, a.index)[1]) - DM.abs(this.formationSlot(team, b.index)[1])).slice(0, 2);
        const riv = this.players.filter((p) => p.team !== team && p.role !== "GK" && !p.sentOff).sort((a, b) => (a.x - gxOwn) * d - (b.x - gxOwn) * d);
        rec.minRival = riv.length ? (riv[0].x - gxOwn) * d : 99;
        const top = riv.slice(0, 2).sort((a, b) => a.z - b.z), cs = rec.cent.slice().sort((a, b) => a.z - b.z);
        cs.forEach((c, i) => { const r2 = top[DM.min(i, top.length - 1)]; if (r2) rec.iron.set(c.id, r2); });
      }
      if (this.tacP(team, "lineSync") && defs.length >= 3) { const ds = defs.map((m) => (m.x - gxOwn) * d).sort((a, b) => a - b); rec.defMed = ds[ds.length >> 1]; }
    }
  },
  // Corrige el destino (f,g) de un jugador según las reglas activas de su equipo. Devuelve {f,g,v,sprint,state} (campos opcionales).
  tacApply(l, f, g, v, ctx) {
    const T = this._tac && this._tac[l.team];
    if (!T || l.role === "GK") return null;
    const d = T.d, gxOwn = T.gxOwn, e = this.ball, id = l.id, car = this.owner, h = ctx.h;
    let sprint, state, free = ctx.chasing || ctx.rcv; // el perseguidor/receptor conserva su objetivo (salvo los límites de defensa)
    const depth = (x) => (x - gxOwn) * d, fromDepth = (dp) => gxOwn + dp * d;
    const P = (rid) => this.tacP(l.team, rid);
    const role = l.role;
    let Q;
    // --- disciplina ---
    if (!free && !T.hunt.has(id) && (Q = P("leash"))) {
      const rad = role === "DEF" ? Q.def : role === "MID" ? Q.mid : Q.fwd, p = ctx.p;
      const u = h ? te(e.x * d * 0.57 + 19, -5, 39) : te(e.x * d * 0.52 + 2, -23, 22);
      const ax = (p[0] + u) * d, az = p[1] * d * 0.9 + e.z * 0.18, dd = DM.hypot(f - ax, g - az);
      if (dd > rad) { f = ax + ((f - ax) / dd) * rad; g = az + ((g - az) / dd) * rad; }
    }
    if (!free && role === "DEF" && T.defMed != null && (Q = P("lineSync"))) f = fromDepth(te(depth(f), T.defMed - Q.tol, T.defMed + Q.tol));
    if (!free && !T.hunt.has(id) && !T.pass.has(id) && !T.run.has(id) && (Q = P("compact"))) { const bd = depth(e.x); f = fromDepth(te(depth(f), bd - Q.back, bd + Q.front)); }
    // --- opcionales ---
    if (h && (role === "FWD" || role === "MID") && (Q = P("wideWingers")) && DM.abs(ctx.p[1]) > 15) { const sd = DM.sign(ctx.p[1]) * d || 1; g = sd * DM.max(DM.abs(g), Q.z); }
    if (h && role === "DEF" && (Q = P("fbPush")) && DM.abs(ctx.p[1]) > 15) f = DM.max(f * d, Q.x) * d;
    if (T.run.has(id) && (Q = P("counterRun"))) { f = te(DM.max(f * d, e.x * d + Q.run), -49, 49) * d; sprint = true; state = "CounterRun"; v = 1.15; free = true; }
    if (T.far.has(id) && (Q = P("farPost"))) { f = 47 * d; g = -DM.sign(car ? car.z : 1) * Q.z; sprint = true; state = "FarPost"; v = 1.1; free = true; }
    // --- pases y llegada al área ---
    if (car && T.drop === id && (Q = P("dropNine"))) {
      const dx = l.x - car.x, dz = l.z - car.z, dl = DM.hypot(dx, dz) || 1;
      if (dl > Q.dist) { f = car.x + (dx / dl) * (Q.dist - 1); g = car.z + (dz / dl) * (Q.dist - 1); state = "Link"; sprint = dl > Q.dist + 8; }
    }
    if (car && T.pass.has(id) && !T.hunt.has(id) && !ctx.rcv && (Q = P("passPlay"))) {
      // uno se ubica ATRÁS del poseedor (pase en retroceso) y el otro ADELANTE (para seguir avanzando), a la distancia configurada y sprintando
      const back = T.passRole.get(id) === "back", side = car.z > 0 ? -1 : 1, k = T.passRole.get(id) === "back" ? -1 : 1;
      let tx = car.x + d * k * Q.dist * (back ? 0.6 : 0.9), tz = car.z + side * Q.dist * (back ? -0.5 : 0.3);
      if (!back && (role === "FWD" || role === "MID")) { const off = this.offsideLineX(l); if (off != null) tx = DM.min(tx * d, off * d + 1.6) * d; }
      f = te(tx, -50, 50); g = te(tz, -31, 31); state = back ? "SupportBack" : "SupportFront"; sprint = true; v = 1.3; free = true;
    }
    if (T.hunt.has(id) && !ctx.rcv && (Q = P("crossHunt"))) {
      const i = T.huntList.indexOf(id);
      // si la pelota suelta pasa cerca de él, PRIMERO va a buscarla (después se posiciona)
      if (!car && DM.hypot(e.x + e.vx * 0.3 - l.x, e.z + e.vz * 0.3 - l.z) < Q.grab) { f = e.x + e.vx * 0.24; g = e.z + e.vz * 0.24; state = "ChaseBall"; sprint = true; v = 1.2; free = true; ctx.chasing = true; }
      else { f = 52.5 * d - Q.spot * d + (i > 1 ? -3 * d : 0); g = (i % 2 === 0 ? 1 : -1) * 2.5 * (1 + (i >> 1)); sprint = true; state = "BoxRun"; v = 1.18; free = true; }
    }
    // --- no pasarse del último defensor rival (los que persiguen o reciben quedan exentos) ---
    if (h && !ctx.chasing && !ctx.rcv && (Q = P("lastDefender"))) { const lim = DM.max(T.lastDef, e.x * d, 0) + Q.margin; if (f * d > lim) f = lim * d; }
    // --- distancia personal entre compañeros ---
    if (!free && (Q = P("personalSpace"))) {
      for (const m of T.mates) {
        if (m === l || T.hunt.has(m.id)) continue;
        const dx = f - m.x, dz = g - m.z, dd = DM.hypot(dx, dz);
        if (dd < Q.dist) { const k = dd > 0.05 ? (Q.dist - dd) / dd : 1; f += (dd > 0.05 ? dx : d) * k; g += (dd > 0.05 ? dz : (l.id % 2 ? 1 : -1)) * k; }
      }
    }
    // --- defensas centrales (reglas duras, valen también para el que persigue) ---
    if (T.cent.includes(l)) {
      if ((Q = P("defIron"))) {
        const r2 = T.iron.get(id);
        if (r2) { const dx = f - r2.x, dz = g - r2.z, dd = DM.hypot(dx, dz); if (dd > Q.gap) { f = r2.x + (dx / dd) * Q.gap; g = r2.z + (dz / dd) * Q.gap; } }
        if (T.minRival < 99) f = fromDepth(DM.min(depth(f), T.minRival));
      }
      if ((Q = P("defPlanted"))) f = fromDepth(DM.min(depth(f), 16.5 + Q.dist));
    }
    f = te(f, -52, 52); g = te(g, -33, 33);
    return { f, g, v, sprint, state };
  },
  // Con la pelota en las manos el arquero puede caminar dentro del área (no la suelta hasta cumplir GK_HOLD_S): se aleja del rival más cercano
  // y se acomoda para sacar, sin salir del área grande.
  p3GkCarry(t, e) {
    const s = this.direction(t.team), r = -52.5 * s; let nr = null, nd = 99;
    for (const p of this.players) if (p.team !== t.team && !p.sentOff && p.role !== "GK") { const d = ze(p, t); if (d < nd) { nd = d; nr = p; } }
    let depth = nr && nd < 16 ? 6 : 9, z = nr ? -DM.sign(nr.z - t.z || 1) * 7 : 0;
    depth = te(depth, 2.5, P3_AREA_X - 2); z = te(z, -(P3_AREA_Z - 3), P3_AREA_Z - 3);
    t.faceAt = { x: t.x + s * 10, z: t.z }; t.sprinting = false;
    this.move(t, r + s * depth, z, e, 0.42);
  },
  // Nadie se acerca a menos de 5 m del arquero que tiene la pelota agarrada: los rivales que estén dentro son empujados hacia afuera.
  gkBubble(dt) {
    const o = this.owner;
    if (!o || o.role !== "GK" || (o.gkHoldUntil || 0) <= this.elapsed) return;
    for (const p of this.players) {
      if (p.team === o.team || p.sentOff) continue;
      const dx = p.x - o.x, dz = p.z - o.z, d = DM.hypot(dx, dz);
      if (d >= GK_BUBBLE) continue;
      const ux = d > 0.05 ? dx / d : this.direction(o.team), uz = d > 0.05 ? dz / d : 0, push = DM.min(GK_BUBBLE - d, 30 * dt);
      p.x += ux * push; p.z += uz * push;
      const vin = p.vx * ux + p.vz * uz;
      if (vin < 0) { p.vx -= ux * vin; p.vz -= uz * vin; }
    }
  },
  // ---- keeper(): orquestador
  keeper(t, e) {
    if (this.owner === t) { this.goalKeeperDecide(t); if (this.owner === t && (t.gkHoldUntil || 0) > this.elapsed) this.p3GkCarry(t, e); return; }
    if (this.p3GkAct(t, e)) return;
    const s = this.direction(t.team), r = -52.5 * s, R = this.p3GkRead(t, s, r);
    let { x: a, z: o, mode } = this.p3GkPosition(t, s, r, R), rate = 0.7, sprint = false;
    const pred = this.gkShotPrediction(t, s);
    if (pred) {
      o = te(pred.d, pred.isHeader ? -5.4 : -4.5, pred.isHeader ? 5.4 : 4.5);
      t.state = "PrepareSave";
      if (this.gkSaveDecision(t, pred)) return;
    } else {
      t.state = "TrackBall";
      const smo = this.p3GkSmotherRead(t, R);
      if (smo) { this.p3GkStartAct(t, "smother", smo); return; }
      const spr = this.p3GkSpreadRead(t, s, r, R);
      if (spr) { this.p3GkStartAct(t, "spread", spr); return; }
      const gat = this.p3GkGatherRead(t, s, r, R);
      if (gat) { this.p3GkStartAct(t, "gather", gat); return; }
      const sweep = this.p3GkSweepRead(t, s, r, R);
      const cross = sweep ? null : this.p3GkCrossRead(t, s, r);
      if (sweep) { a = sweep.x; o = sweep.z; rate = 1.05; sprint = true; t.state = "Sweep"; t.p1 = t.p1 || {}; this.p1Count && this.p1Count("gk_sweep"); }
      else if (cross) {
        a = cross.x; o = cross.z; t.state = "Rush"; rate = 1;
        const near = DM.hypot(cross.x - t.x, cross.z - t.z) < 2.1 && cross.tHit < 0.5;
        if (near) { this.p3GkStartAct(t, cross.kind, { tx: cross.x, tz: cross.z }); return; }
      } else if (mode === "closedown") { t.state = "Rush"; rate = 0.95; }
    }
    if (!this.shot && DM.abs(this.ball.x - r) < 12 && DM.abs(this.ball.z) < 13 && !this.owner) { a = this.ball.x; o = this.ball.z; }
    if (!sprint && mode === "closedown") rate = DM.max(rate, 0.95);
    else if (!sprint && R.carrier) rate = DM.max(rate, 0.82);
    t.sprinting = sprint;
    // El arquero nunca le da la espalda a la pelota mientras achica/retrocede/se reacomoda en la línea
    // (pedido explícito) — mira siempre hacia el balón, sin importar hacia dónde tenga que moverse.
    // OJO: esto NO debe frenarlo cuando ya se comprometió a salir corriendo a algo (Rush/Sweep, cross,
    // 1v1) — ahí el destino es "adelantarse a dónde va a caer/estar la pelota", no "retroceder sin dar
    // la espalda", y la pelota en el aire suele estar bastante lejos del punto de caída que persigue:
    // aplicarle el freno de "retroceso" ahí lo hacía llegar tarde y dejó de atajar centros (0 agarres).
    if (!sprint && t.state !== "Rush" && t.state !== "Sweep") t.faceAt = { x: this.ball.x, z: this.ball.z };
    this.move(t, a, o, e, rate);
  },
  // ¿la predicción es un globo por encima del arquero? → estirada hacia atrás
  gkShotPrediction(t, s) {
    const n = this.ball, isHeader = this.shot && this.shot.type === "Cabeceo", l = n.vx * s < -5 ? (t.x - n.x) / n.vx : 100, shotWindow = isHeader ? 1.55 : 1.25;
    if (!(this.shot && this.shot.team !== t.team && l > 0 && l < shotWindow)) return null;
    return { d: n.z + n.vz * l, l, isHeader, h: n.y + n.vy * l - 4.905 * l * l };
  },
  // Habilidad del arquero -1..1 (defensa + anticipación): manda sobre reflejos, alcance, si retiene o rebota y cuánto tarda en embolsar.
  gkSkill(t) { return te(((t.stats.defense || 70) - 70) / 25 + (((t.ai && t.ai.cog && t.ai.cog.anticipation) ?? 0.6) - 0.6) * 0.8, -1, 1); },
  // Agarra la pelota con las manos: la gesticulación de embolsarla (bagDur) es más lenta cuanto peor es el arquero.
  gkGrab(f) { this.possession(f); f.state = "Catch"; f.think = 0.8; f.bagDur = 0.3 + (1 - this.gkSkill(f)) * 0.2; f.gkHoldUntil = this.elapsed + GK_HOLD_S; },
  gkSaveDecision(t, pred) {
    const cog = t.ai.cog, sk = this.gkSkill(t), reactWindow = 0.33 * te(0.75 + cog.anticipation * 0.5, 0.7, 1.25) * (0.84 + 0.16 * sk), marginNeeded = 0.65 * te(1.3 - cog.decisionQuality * 0.5, 0.75, 1.3) * (1.12 - 0.12 * sk);
    // reflejos: el arquero recién puede decidir un rato después del remate (los mejores ~0,14 s, los peores ~0,26 s)
    if (this.elapsed - this.kickedAt <= 0.2 - 0.06 * sk) return false;
    // Cooldown tras tirarse (pedido explícito, medio segundo): t.gkCd ya lo fija p3GkStartAct pero
    // nunca se consultaba — apenas terminaba la animación del vuelo (t.dive llega a 0) el arquero
    // podía volver a lanzarse en el mismo frame si otra predicción de tiro lo disparaba.
    if ((t.gkCd || 0) > this.elapsed) return false;
    // PENAL: el arquero tiene que elegir el lado antes de ver a dónde va el remate. Antes leía la trayectoria
    // perfecta y atajaba casi todos (2 % de conversión); ahora sólo acierta el lado una parte de las veces.
    const pens = this.shot && this.shot.type === "Penal" ? this.shot : null;
    if (pens) {
      if (pens.gkChose) return false;
      pens.gkChose = true;
      const real = DM.sign(pred.d - t.z) || 1, right = this.random() < te(0.2 + (t.stats.defense - 70) * 0.003, 0.1, 0.4);
      this.p3GkStartAct(t, "side", { dir: right ? real : -real, tz: right ? pred.d : -real * 3.4, height: "mid" });
      return true;
    }
    const lob = pred.h != null && pred.h > 2.05 && pred.h < 3.6 && pred.l < reactWindow * 1.5 && DM.abs(pred.d) < 4.2;
    if (lob) { this.p3GkStartAct(t, "back", { tx: t.x, tz: te(pred.d, -4.2, 4.2), dir: DM.sign(pred.d - t.z) || 1 }); return true; }
    const off = DM.abs(pred.d - t.z);
    const close = DM.hypot(this.ball.x - t.x, this.ball.z - t.z) < 9.5;
    if (close && pred.l < 0.6 && off < 1.35 && (pred.h == null || pred.h < 1.9)) { this.p3GkStartAct(t, "spread", { tx: t.x, tz: te(pred.d, t.z - 1.2, t.z + 1.2) }); return true; }
    if (pred.l < reactWindow && off > marginNeeded) {
      const height = pred.h == null ? "mid" : pred.h < 0.55 ? "low" : pred.h > 1.5 ? "high" : "mid";
      this.p3GkStartAct(t, "side", { dir: DM.sign(pred.d - t.z) || 1, tz: pred.d, height });
      return true;
    }
    // PASO CORTO (pedido explícito, "le hacen gol porque en realidad iba más cerca de lo que se
    // tiró"): entre el radio parado (p3GkContact, ~0.6-0.7m) y marginNeeded (el umbral que dispara la
    // estirada completa, ~0.5-0.85m) había una franja de tiros a media distancia que no llegaba a
    // taparse parado PERO tampoco disparaba ninguna reacción — el arquero se quedaba quieto y la
    // dejaba pasar. Cubre esa franja con un paso reactivo corto, sin comprometerse a la estirada
    // completa (que ahora además frena al llegar a destino, ver p3GkAct — esto es un refuerzo extra
    // para los casos que ni siquiera necesitan tanto viaje).
    if (pred.l < reactWindow * 1.15 && off > 0.5 && off <= marginNeeded * 1.4) {
      this.p3GkStartAct(t, "step", { dir: DM.sign(pred.d - t.z) || 1, tz: pred.d });
      return true;
    }
    return false;
  },
  gkTriggerDive(t, dir) { this.p3GkStartAct(t, "side", { dir }); },
  // ---- Contacto arquero-balón (reemplaza el bloque inline del bucle de balones divididos)
  p3GkContact(f, e) {
    const s = DM.hypot(e.vx, e.vz), g = ze(f, e), kind = f.dive > 0 ? f.diveKind || "side" : null, dd = this.direction(f.team);
    if ((kind === "smother" || kind === "spread") && this.owner && this.owner.team !== f.team) { this.p3GkSmotherHit(f); return; }
    const reachMod = te((f.heightM || 1.8) / 1.85, 0.9, 1.08), reactMs = this.elapsed - this.kickedAt, diveGrow = f.dive > 0 ? te(reactMs * 2.1, 0, 0.55) : 0, groundedFast = e.y < 0.5 && s > 20 ? 0.82 : 1;
    const gsk = this.gkSkill(f);
    let v = (0.66 + diveGrow) * reachMod * groundedFast * (0.93 + 0.05 * gsk), m = (f.dive > 0 ? 1.75 : 2.15) * reachMod;
    if (kind === "claim" || kind === "punch") { m = 3.05 * reachMod; v = 1.15 * reachMod + 0.3; }
    else if (kind === "back") { m = 3.0 * reachMod; v = 1.0 + diveGrow * 0.6; }
    else if (kind === "smother") { m = 0.9; v = 1.3 * reachMod; }
    else if (kind === "spread") { m = 1.95 * reachMod; v = 1.5 * reachMod; } // estirada abierta (brazos y piernas): tapa todo el ancho del cuerpo
    else if (kind === "gather") { m = 0.95; v = 1.2; }
    else if (kind === "side") {
      // Hitbox atada a la pose real (pedido explícito: "ajustar la hitbox al área de contacto real
      // del modelo"): antes la estirada lateral usaba SIEMPRE el mismo techo de altura (m) y el mismo
      // alcance lateral (v), sin importar si diveHeight ("low"/"high", ver fulbo.html render) mostraba
      // al arquero tirándose raso con las manos abajo o estirándose hacia arriba a la escuadra — la
      // pose visual cambiaba pero la zona de contacto real no la seguía. Los factores salen de la
      // animación misma: sin(rollMax) de cada pose (low=0.85rad→~0.75, mid=1.48rad→~0.996,
      // high=1.85rad→~0.96) marca cuánto se estira realmente el cuerpo hacia el costado.
      const dh = f.diveHeight || "mid";
      v *= dh === "low" ? 0.8 : dh === "high" ? 0.97 : 1;
      m = (dh === "low" ? 1.15 : dh === "high" ? 2.3 : 1.75) * reachMod;
    }
    // PASO CORTO (pedido explícito, nueva reacción intermedia entre "parado" y "estirada completa",
    // ver gkSaveDecision): más alcance lateral que parado pero techo de altura más bajo que una
    // estirada — es un paso con las manos al costado, no llega a taparse remates altos con esto.
    else if (kind === "step") { m = 1.35 * reachMod; v = te(0.95 + diveGrow * 0.5, 0.95, 1.4) * reachMod; }
    if (!(g < v && e.y < m && !this.owner && this.elapsed - this.kickedAt > 0.15)) return;
    // Reglamento: fuera del área o pase de pie de un compañero → el arquero juega con los pies (sin manos).
    const inArea = this.p3InArea(f, e.x, e.z), foot = !inArea || this.p3MustPlayByFoot(f);
    if (foot) {
      this.possession(f); f.state = "Receive"; f.think = 0.45; f.gkFootAt = this.elapsed;
      if (inArea) this.event("restart", "PASE ATRÁS", `${f.name} debe jugarla con los pies`, f.team, f);
      return;
    }
    const skill = (f.stats.defense - 70) * 0.004 + (f.personality.consistency - 70) * 0.002;
    if (this.shot && this.shot.team !== f.team) {
      if (this.random() < te(0.07 - 0.05 * gsk, 0.02, 0.12)) return;
      this.secondBallUntil = this.elapsed + 1.6; this.stats[f.team].saves++;
      this._aiShot && (this._aiShot.result = "save"); this.excitement = 90;
      this.event("save", f.dive > 0 ? "¡ATAJADÓN!" : "¡Buena atajada!", `${f.name} mantiene vivo a su equipo`, f.team, f);
      // ¿la retiene o rebota? Los remates fuertes / estirados / la mala mano rebotan; un arquero bien parado se queda con la pelota.
      const holdP = te(0.46 + skill + gsk * 0.08 - DM.max(0, s - 22) * 0.02 - (kind === "side" ? 0.14 : 0) - (kind === "back" ? 0.1 : 0) - (e.y < 0.4 && s > 20 ? 0.04 : 0), 0.12, 0.9);
      if (this.random() < holdP) { this.gkGrab(f); this.p1Count && this.p1Count("gk_hold"); return; }
      // rebote: córner (hacia atrás) / a un lado (sigue el juego) / AL CENTRO DEL ÁREA (peligroso). El buen arquero controla el rebote.
      const safe = te(0.5 + skill * 1.4, 0.2, 0.85), rr = this.random();
      const sd = e.z >= 0 ? 1 : -1;
      let how;
      if (rr < safe * 0.55) how = "corner"; else if (rr < safe) how = "wide"; else how = "centre";
      if (how === "corner") { this.deflectBehind = this.elapsed; e.vx = -dd * this.range(4, 8); e.vz = sd * this.range(10, 18); e.vy = this.range(3, 6); }
      else if (how === "wide") { e.vx = dd * this.range(0, 4); e.vz = sd * this.range(8, 14); e.vy = this.range(2, 4.5); }
      else { e.vx = dd * this.range(4, 8); e.vz = this.range(-3.5, 3.5) - DM.sign(e.z || 0) * 1.5; e.vy = this.range(2, 4); this.event("save", "REBOTE AL CENTRO DEL ÁREA", "la pelota queda viva frente al arco", f.team, f); }
      this.p1Count && this.p1Count("gk_rebound_" + how);
      this.shot = null; this.lastTouch = f; this.kickedAt = this.elapsed; f.state = "Parry";
      return;
    }
    if (e.y > 0.55) { // centro
      const crowded = this.players.filter((p) => p.role !== "GK" && !p.sentOff && DM.hypot(p.x - f.x, p.z - f.z) < 5).length;
      const punchNow = kind === "punch" || (kind == null && crowded >= 2 && this.random() < te(0.1 + crowded * 0.13 - (f.stats.defense - 70) * 0.003, 0.04, 0.6));
      if (punchNow) {
        const side = (e.z >= 0 ? 1 : -1) * (this.random() < 0.7 ? 1 : -1);
        e.vx = dd * this.range(8, 13); e.vz = side * this.range(3, 10); e.vy = this.range(4, 7);
        this.lastTouch = f; this.kickedAt = this.elapsed; this.secondBallUntil = this.elapsed + 1.6; f.state = "Parry";
        this.event("save", "DESPEJE CON PUÑOS", `${f.name} rechaza el centro`, f.team, f);
        this.p1Count && this.p1Count("gk_punch");
        return;
      }
      if (kind === "claim") {
        const okP = te(0.66 + skill - crowded * 0.07 - (e.y > 2.3 ? 0.07 : 0), 0.2, 0.95);
        if (this.random() > okP) { // se le escapa: cae suelto
          e.vx *= 0.3; e.vz += this.range(-3, 3); e.vy = this.range(1, 3); this.lastTouch = f; this.kickedAt = this.elapsed; f.state = "Parry";
          this.p1Count && this.p1Count("gk_claim_fumble");
          return;
        }
        this.event("save", "¡SALE Y SE QUEDA CON EL CENTRO!", `${f.name} agarra la pelota en el aire`, f.team, f);
        this.p1Count && this.p1Count("gk_claim");
      }
    }
    this.gkGrab(f);
  },
  // ================================================================== C. BARRIDAS
  // Barrida para (a) quitarle el balón al portador desde fuera del alcance de la pierna y (b) tapar un tiro.
  p3SlideScan() {
    if (!this.tlbEnabled) return;
    const b = this.ball, sp = DM.hypot(b.vx, b.vz);
    const free = (d) => !(d.sentOff || d.ragdoll || d.role === "GK" || (d.tl && d.tl.kind === "slide" && this.elapsed - d.tl.t0 < 1.2) || this.elapsed - (d.tackleAt || -9) < 2.2 || (d.slideCdAt || 0) > this.elapsed || d.state === "Shoot");
    if (this.shot && b.y < 1.15 && sp > 10) {
      let best = null;
      for (const d of this.players) {
        if (d.team === this.shot.team || !free(d)) continue;
        for (const tau of [0.15, 0.25, 0.35, 0.5, 0.65]) {
          const px = b.x + b.vx * tau, pz = b.z + b.vz * tau, dist = DM.hypot(px - d.x, pz - d.z);
          if (dist > 3.4 || dist < 0.6) continue;
          const stand = dist / (4.2 + d.stats.speed * 0.035) < tau - 0.04; // llega corriendo y se para: no hace falta tirarse
          if (stand && dist < 1.8) break;
          if (!best || tau < best.tt) best = { d, px, pz, tt: tau, dist };
          break;
        }
      }
      if (best) {
        const e = this.tlSlideEval(best.d, this.lastTouch || best.d, { loose: true, pass: false });
        const p = te(0.28 + (best.d.personality.aggression - 50) / 220 + (best.d.stats.defense - 60) / 500, 0.08, 0.6);
        best.d.slideCdAt = this.elapsed + 4;
        if (this.random() < p) this.tlStartSlide({ d: best.d, px: best.px, pz: best.pz, e: { ...e, success: te(0.5 + best.d.stats.defense * 0.003, 0.3, 0.8) }, ctx: { block: true, loose: true }, tt: best.tt, dist: best.dist });
      }
      return;
    }
    const c = this.owner;
    if (!c || c.role === "GK" || this.elapsed - (c.controlAt || 0) < 0.2) return;
    for (const d of this.players) {
      if (d.team === c.team || !free(d)) continue;
      const dist = DM.hypot(c.x - d.x, c.z - d.z);
      if (dist < 2.3 || dist > 4.6) continue;
      const ux = (c.x - d.x) / dist, uz = (c.z - d.z) / dist, closing = d.vx * ux + d.vz * uz, dSp = DM.hypot(d.vx, d.vz);
      if (closing < 3.0 || dSp < 3.6) continue;
      if (this.owner.x * this.direction(d.team) < -46) continue;
      const reach = (4.2 + d.stats.speed * 0.035), tArrive = (dist - 1.7) / reach;
      if (tArrive < 0.28) continue; // ya llega con la pierna
      const ev = this.tlSlideEval(d, c, { closingFast: true, canRun: false });
      const p = te(ev.p * 0.55 + 0.05 + (c.stats.dribbling > 82 ? -0.04 : 0), 0.02, 0.5);
      d.slideCdAt = this.elapsed + 5;
      if (this.random() < p) { this.tlStartSlide({ d, px: c.x + c.vx * 0.3, pz: c.z + c.vz * 0.3, e: ev, ctx: { tackleFar: true, loose: false }, tt: DM.max(0.2, tArrive), dist }); break; }
    }
  },
  // ================================================================== D. LABORATORIO DE JUGADAS
  p3Scenarios() { return P3_SCENARIOS; },
  p3Place(p, x, z) { p.x = x; p.z = z; p.vx = p.vz = 0; p.state = "Positioning"; p.timer = 0; p.tl = null; p.tlLock = 0; p.dive = 0; p.ragdoll = null; },
  p3DebugScenario(kind, team = 0) {
    if (this.ended) return false;
    const A = team, D = 1 - team, dir = this.direction(A), gx = 52.5 * dir, own = -52.5 * dir;
    const outfield = (t) => this.players.filter((p) => p.team === t && p.role !== "GK" && !p.sentOff);
    const gkOf = (t) => this.players.find((p) => p.team === t && p.role === "GK" && !p.sentOff);
    const stop = () => { this.owner = null; this.receiver = null; this.shot = null; this.pendingOffside = null; const b = this.ball; b.vx = b.vz = b.vy = 0; b.y = 0.13; this.tlSlideCd = [0, 0]; };
    const outBall = (x, z, vx, vz) => { const b = this.ball; b.x = x; b.z = z; b.y = 0.13; b.vx = vx; b.vz = vz; b.vy = 0; if (this.restartData) this.restartData.since = this.elapsed; };
    const setBall = (x, z) => { const b = this.ball; b.x = x; b.z = z; b.y = 0.13; b.vx = b.vz = b.vy = 0; };
    this.phase = "playing"; this.wait = 0;
    stop();
    const cx = (m) => te(m, -51, 51);
    switch (kind) {
      case "fk_direct_near": stop(); return this.restart(A, gx - dir * 20, 1.5, "Tiro libre", true), true;
      case "fk_direct_mid": return this.restart(A, gx - dir * 25, -9, "Tiro libre", true), true;
      case "fk_far_cross": return this.restart(A, gx - dir * 34, 3, "Tiro libre", true), true;
      case "fk_wide_cross": return this.restart(A, gx - dir * 26, 26, "Tiro libre", true), true;
      case "fk_midfield": return this.restart(A, gx - dir * 52, 8, "Tiro libre", true), true;
      case "fk_own_third": return this.restart(A, own + dir * 22, -12, "Tiro libre", true), true;
      case "penalty": return this.awardPenalty(A, D), true;
      // Los reinicios "por fuera de la cancha" cancelan solos si el balón sigue adentro (backIn): se lo deja fuera, como en un partido real.
      case "corner_l": case "corner_r": { const z = kind === "corner_l" ? -1 : 1; this.restart(A, gx - dir * 1.2, z * 33.2, "Tiro de esquina", false, "corner"); return outBall(dir * 53.6, z * 30, dir * 2, 0), true; }
      case "throwin_att": { this.restart(A, cx(gx - dir * 22), -32, "Saque de banda", false, "throwin"); return outBall(cx(gx - dir * 22), -34.8, 0, -2), true; }
      case "goalkick": { this.restart(A, own + dir * 5.5, 0, "Saque de arco", false, "goalkick"); return outBall(-dir * 53.6, 1, -dir * 2, 0), true; }
      case "foul_box": case "foul_edge": case "foul_mid": {
        const fx = kind === "foul_box" ? gx - dir * 11 : kind === "foul_edge" ? gx - dir * 19 : dir * 0, fz = kind === "foul_box" ? 5 : 3;
        const vic = outfield(A).find((p) => p.role === "FWD") || outfield(A)[0], fou = outfield(D).find((p) => p.role === "DEF") || outfield(D)[0];
        this.p3Place(vic, fx, fz); this.p3Place(fou, fx - dir * 0.9, fz - 0.4); setBall(fx + dir * 0.4, fz);
        this.possession(vic); vic.vx = dir * 2; fou.vx = dir * 3;
        this.commitFoul(fou, vic); return true;
      }
      case "gk_1v1": {
        const c = outfield(A).find((p) => p.role === "FWD") || outfield(A)[0];
        for (const p of outfield(D)) this.p3Place(p, gx - dir * 44, p.z * 0.6);
        for (const p of outfield(A)) if (p !== c) this.p3Place(p, gx - dir * 46, p.z * 0.6);
        this.p3Place(c, gx - dir * 22, 3); setBall(c.x + dir * 0.5, 3); this.possession(c); return true;
      }
      case "gk_smother": {
        const c = outfield(A).find((p) => p.role === "FWD") || outfield(A)[0];
        for (const p of outfield(D)) this.p3Place(p, gx - dir * 44, p.z * 0.6);
        for (const p of outfield(A)) if (p !== c) this.p3Place(p, gx - dir * 46, p.z * 0.6);
        this.p3Place(c, gx - dir * 12, 1.2); c.vx = dir * 4.6; this.possession(c); c.think = 3; this.ball.x = c.x + dir * 1.5; this.ball.vx = dir * 5.2; return true;
      }
      case "gk_cross": {
        const c = outfield(A).find((p) => p.role !== "DEF") || outfield(A)[0];
        this.p3Place(c, gx - dir * 8, 30); setBall(c.x, 30); const b = this.ball;
        const tx = gx - dir * 6, tz = 2.5, T = 1.35;
        for (const p of outfield(A)) if (DM.hypot(p.x - tx, p.z - tz) < 9) this.p3Place(p, gx - dir * 24, p.z);
        for (const p of outfield(D)) if (DM.hypot(p.x - tx, p.z - tz) < 4) this.p3Place(p, gx - dir * 14, p.z); b.vx = (tx - b.x) / T; b.vz = (tz - b.z) / T; b.vy = 0.5 * 9.81 * T - (b.y - 0.13) / T; b.y = 0.5;
        this.lastTouch = c; this.receiver = null; this.kickedAt = this.elapsed; return true;
      }
      case "gk_through": {
        const f = outfield(A).find((p) => p.role === "FWD") || outfield(A)[0], m = outfield(A).find((p) => p.role === "MID" && p !== f) || outfield(A)[1];
        for (const p of outfield(D)) this.p3Place(p, gx - dir * (34 + DM.abs(p.z) * 0.15), p.z * 0.8);
        this.p3Place(f, gx - dir * 34, 5); this.p3Place(m, gx - dir * 48, 3); setBall(m.x, m.z); const b = this.ball;
        b.vx = dir * 15; b.vz = 0.4; b.vy = 0; this.lastTouch = m; this.receiver = f; this.kickedAt = this.elapsed; return true;
      }
      case "gk_lob": {
        const f = outfield(A).find((p) => p.role === "FWD") || outfield(A)[0], g = gkOf(D);
        this.p3Place(f, gx - dir * 19, 1); if (g) this.p3Place(g, gx - dir * 6, 0); setBall(f.x + dir * 0.4, 1); const b = this.ball;
        b.vx = dir * 15.5; b.vz = -0.5; b.vy = 7.3; b.y = 0.4; this.lastTouch = f; this.kickedAt = this.elapsed;
        this.shot = { team: A, player: f.id, type: "Tiro", at: this.elapsed, power: 1 }; return true;
      }
      case "gk_shot": {
        const f = outfield(A).find((p) => p.role === "FWD") || outfield(A)[0];
        this.p3Place(f, gx - dir * 17, 6); setBall(f.x + dir * 0.4, 6); const b = this.ball;
        b.vx = dir * 21; b.vz = -3.6; b.vy = 1.2; b.y = 0.2; this.lastTouch = f; this.kickedAt = this.elapsed;
        this.shot = { team: A, player: f.id, type: "Tiro", at: this.elapsed, power: 1 }; return true;
      }
      case "slide_tackle": {
        const c = outfield(A).find((p) => p.role === "MID") || outfield(A)[0], d = outfield(D).find((p) => p.role === "DEF") || outfield(D)[0], x0 = dir * -6;
        this.p3Place(c, x0, 8); setBall(c.x + dir * 0.6, 8); this.possession(c); c.vx = dir * 3.2;
        this.p3Place(d, x0 + dir * 5.2, 8.6); d.vx = -dir * 5.5; d.vz = 0; c.lastDecision = "carry";
        const ev = this.tlSlideEval(d, c, { closingFast: true });
        this.tlStartSlide({ d, px: c.x + dir * 0.9, pz: 8, e: { ...ev, success: 0.9 }, ctx: { tackleFar: true }, tt: 0.4, dist: 4.4 }); return true;
      }
      case "slide_block": {
        const f = outfield(A).find((p) => p.role === "FWD") || outfield(A)[0], d = outfield(D).find((p) => p.role === "DEF") || outfield(D)[0];
        this.p3Place(f, gx - dir * 19, 2); setBall(f.x + dir * 0.4, 2); const b = this.ball; b.vx = dir * 22; b.vz = -0.5; b.vy = 0; b.y = 0.2;
        this.lastTouch = f; this.kickedAt = this.elapsed; this.shot = { team: A, player: f.id, type: "Tiro", at: this.elapsed, power: 1 };
        this.p3Place(d, gx - dir * 13, 1.2); d.vx = dir * -1; d.vz = 0;
        const ev = this.tlSlideEval(d, f, { loose: true });
        this.tlStartSlide({ d, px: gx - dir * 12.4, pz: 1.4, e: { ...ev, success: 0.95 }, ctx: { block: true, loose: true }, tt: 0.26, dist: 1 }); return true;
      }
      case "gk_build": {
        const g = gkOf(A), d1 = outfield(A).find((p) => p.role === "DEF");
        for (const p of outfield(D)) this.p3Place(p, own + dir * 42 + (p.z > 0 ? 3 : -3), p.z * 0.7);
        if (g) { this.p3Place(g, own + dir * 3, 0); setBall(g.x + dir * 0.6, 0); this.possession(g); g.controlAt = this.elapsed - 2; }
        void d1; return true;
      }
    }
    return false;
  },
});
// ============================================================================================
// FASE 4 — CUERPOS SÓLIDOS: el balón rebota contra los jugadores  (fuente: p1/p4.js, inyectado junto a p1.js y p3.js)
//
// Antes un balón rápido que "no era controlado" atravesaba al jugador (sólo había un radio de contacto con probabilidad).
// Ahora cada jugador de campo es una cápsula vertical (torso r 0.26 m, de los pies a la cabeza; caído/barriéndose: bulto bajo y largo).
// Se hace una prueba BARRIDA (del punto anterior al actual del balón) para que a 30 m/s no haya túnel, y el rebote sale de la física:
//   v' = v_cuerpo + (v_rel − (1+e)·(v_rel·n)·n), con fricción tangencial. e depende de quién es:
//     · compañero/receptor previsto (amortigua: el pase "muere" en el pie/pecho)  e 0.12
//     · rival                                                                      e 0.42
//   El último toque pasa a ser el del jugador (reglamento) y un tiro desviado por un rival cuenta como bloqueo.
// El portero queda fuera (su contacto lo resuelve p3GkContact). Determinista: no usa aleatoriedad.
// ============================================================================================
const P4_BODY_R = 0.26, P4_BALL_R = 0.11;
Object.assign(wc.prototype, {
  // cápsula del jugador: segmento vertical [y0,y1] en (x,z) y radio; caído o barriéndose → bulto bajo y más ancho
  p4Body(p) {
    if (p.ragdoll || p.state === "Slide") return { y0: 0.2, y1: 0.35, r: 0.4 };
    const h = p.heightM || 1.8;
    return { y0: 0.12, y1: DM.max(0.6, h - 0.16), r: P4_BODY_R };
  },
  p4BodyCollide(dt) {
    const b = this.ball, sp = DM.hypot(b.vx, b.vz, b.vy);
    if (sp < 0.6 || b.y > 2.4) return false;
    // Si un arquero ya se comprometió a salir a buscar el centro (claim/punch, ver p3GkCrossRead) el
    // balón es SUYO a disputar — antes un cuerpo cualquiera parado en el área lo desviaba antes de que
    // llegara, y el arquero nunca llegaba a agarrar/despejar nada (0 claims/punches en la práctica).
    const claiming = this.players.find((p) => p.role === "GK" && p.gkAct && (p.gkAct.kind === "claim" || p.gkAct.kind === "punch") && !p.gkAct.done);
    if (claiming) return false;
    // posición anterior aproximada (el integrador ya avanzó un paso)
    const px = b.x - b.vx * dt, pz = b.z - b.vz * dt, py = b.y - b.vy * dt;
    const sx = b.x - px, sz = b.z - pz, sy = b.y - py, sl = sx * sx + sz * sz;
    let best = null;
    for (const p of this.players) {
      if (p.sentOff || p.role === "GK" || this.owner === p) continue;
      if (p === this.lastTouch && this.elapsed - this.kickedAt < 0.3) continue;
      if (this.elapsed - (p.p4At || -9) < 0.12) continue;
      // punto de máximo acercamiento (en planta) sobre el recorrido del balón en este paso
      let u = sl > 1e-9 ? ((p.x - px) * sx + (p.z - pz) * sz) / sl : 1;
      u = u < 0 ? 0 : u > 1 ? 1 : u;
      const cx = px + sx * u, cz = pz + sz * u, cy = py + sy * u;
      if (DM.abs(cx - p.x) > 0.9 || DM.abs(cz - p.z) > 0.9) continue;
      const B = this.p4Body(p), qy = cy < B.y0 ? B.y0 : cy > B.y1 ? B.y1 : cy;
      let nx = cx - p.x, ny = cy - qy, nz = cz - p.z;
      const d = DM.hypot(nx, ny, nz);
      if (d >= B.r + P4_BALL_R) continue;
      if (d < 1e-6) { nx = -b.vx; nz = -b.vz; ny = 0; }
      const m = DM.hypot(nx, ny, nz) || 1; nx /= m; ny /= m; nz /= m;
      const rvx = b.vx - p.vx, rvy = b.vy, rvz = b.vz - p.vz, vn = rvx * nx + rvy * ny + rvz * nz;
      if (vn >= -0.3) continue; // se aleja: no hay choque
      if (!best || u < best.u) best = { p, u, cx, cy, cz, nx, ny, nz, vn, rvx, rvy, rvz, B };
    }
    if (!best) return false;
    const { p, nx, ny, nz, vn, rvx, rvy, rvz, B } = best;
    const mate = this.lastTouch && p.team === this.lastTouch.team, cushion = mate && (p === this.receiver || !this.shot);
    const e = cushion ? 0.12 : 0.42, mu = cushion ? 0.55 : 0.85;
    // componente normal invertida con restitución, tangencial con fricción
    const tx = rvx - vn * nx, ty = rvy - vn * ny, tz = rvz - vn * nz;
    b.vx = p.vx + tx * mu - e * vn * nx;
    b.vy = ty * mu - e * vn * ny;
    b.vz = p.vz + tz * mu - e * vn * nz;
    if (b.vy > 0 && b.vy < 0.4) b.vy = 0;
    // Salvavidas: en un área llena (córner, tumulto) el balón puede rebotar de cuerpo en cuerpo varias
    // veces por segundo; con un roce casi tangente (normal casi vertical) cada choque le puede sumar un
    // poquito de vy y, encadenados, terminaban lanzando la pelota a 40+ m de alto. Un choque nunca debería
    // dejar la pelota más rápido de lo que entró (más el propio jugador), así que se recorta a eso.
    const inSp = DM.hypot(rvx, rvy, rvz), outSp = DM.hypot(b.vx - p.vx, b.vy, b.vz - p.vz), cap = inSp * (1 + e) + 0.5;
    if (outSp > cap) { const k = cap / outSp; b.vx = p.vx + (b.vx - p.vx) * k; b.vy *= k; b.vz = p.vz + (b.vz - p.vz) * k; }
    // ese tope es relativo al jugador (que también se mueve): en un tumulto, cada cuerpo suma un poco de
    // su propia carrera y, choque tras choque, la energía total puede seguir creciendo aunque cada choque
    // individual sea válido. Topes absolutos de verdad: nada realista sale disparado hacia arriba de un
    // cabezazo/rebote en el tumulto (vy aparte, más estricto: si no, con toda la velocidad horizontal
    // convertida en vertical igual se iba a 45+ m de alto).
    const horizSp = DM.hypot(b.vx, b.vz);
    if (horizSp > 30) { const k2 = 30 / horizSp; b.vx *= k2; b.vz *= k2; }
    if (DM.abs(b.vy) > 11) b.vy = DM.sign(b.vy) * 11;
    // fuera del cuerpo
    const rr = B.r + P4_BALL_R + 0.01;
    const qy = best.cy < B.y0 ? B.y0 : best.cy > B.y1 ? B.y1 : best.cy;
    b.x = p.x + nx * rr; b.z = p.z + nz * rr; b.y = DM.max(0.13, qy + ny * rr);
    p.p4At = this.elapsed;
    const wasShot = this.shot && this.shot.team !== p.team;
    this.p1Count(wasShot ? "body_block" : "body_hit");
    if (!mate || wasShot) { this.lastTouch = p; this.kickedAt = this.elapsed; }
    if (wasShot) {
      this.shot = null; this.secondBallUntil = this.elapsed + 1.6; this.excitement = DM.min(100, this.excitement + 10);
      this.event("block", "¡BLOQUEO!", `${p.name} pone el cuerpo y desvía el remate`, p.team, p);
    } else if (DM.hypot(rvx, rvz) > 9) this.secondBallUntil = DM.max(this.secondBallUntil || 0, this.elapsed + 0.8);
    return true;
  },
});
// <<P1_END>>
// <<TLB_ENGINE_BEGIN>>
// ===== TLB engine — capa de acciones/transmisión (lógica, sin visuales). Gated: match.tlbEnabled =====
// Estados visuales (actionType/tl), sincronización balón/contacto, decisión de barrida, GOAL_RUN,
// paquete de gol, emojis contextuales y telemetría. La presentación vive en el bloque TLB_APP.
const TLB_SHOT = {
  NORMAL_SHOT: { c: 0.14 }, POWER_SHOT: { c: 0.2 }, FINESSE_SHOT: { c: 0.14 }, LOW_SHOT: { c: 0.12 },
  CHIP_SHOT: { c: 0.16 }, LONG_SHOT: { c: 0.22 }, TRIVELA: { c: 0.16 }, RABONA: { c: 0.22 }, VOLLEY: { c: 0.18 },
  FIRST_TIME: { c: 0.07 }, HALF_VOLLEY: { c: 0.12 }, HEADER: { c: 0.24 }, BICYCLE_KICK: { c: 0.3 },
};
const TLB_SHOT_BY_NAME = {
  "Tiro potente": "POWER_SHOT", "Tiro colocado": "FINESSE_SHOT", "Tiro raso": "LOW_SHOT", Vaselina: "CHIP_SHOT", Rosca: "FINESSE_SHOT", Picada: "CHIP_SHOT", "Raso cruzado": "LOW_SHOT",
  "Tiro lejano": "LONG_SHOT", Trivela: "TRIVELA", Volea: "VOLLEY", "Primera intención": "FIRST_TIME", Cabeceo: "HEADER",
};
Object.assign(wc.prototype, {
  tlInit() {
    this.tlbEnabled = this.tlbEnabled !== false;
    this.tlSync = true;
    this.tlHold = null; this.tlGoal = null; this.tlEmoCd = 0; this.tlSlideAt = 0; this.tlPrev = [null, null]; this.tlSlideCd = [0, 0];
    this.tlTele = { shots: {}, skills: {}, slides: {}, slideFail: 0, lastDitch: 0, emoji: 0, goals: 0, holds: 0 };
    this.tlEmoOn = true;
  },
  tlCount(bag, k) { const o = this.tlTele && this.tlTele[bag]; o && (o[k] = (o[k] || 0) + 1); },
  // ---- REMATES: decisión → actionType → contacto sincronizado -------------------------------------
  tlOnShot(p, name, head, volley, trivela, dist) {
    if (!this.tlbEnabled) return;
    if (!this.tlTele) this.tlInit();
    const b = this.ball, dir = this.direction(p.team), cre = p.personality.creativity;
    let type = TLB_SHOT_BY_NAME[name] || "NORMAL_SHOT";
    const facing = DM.sin(p.angle) * dir; // angle = atan2(vx, vz): >0 mira al arco rival
    if (volley && !head) {
      if (b.y > 1.0 && facing < 0.6 && this.random() < 0.7) type = "BICYCLE_KICK";
      else if (b.y < 0.85) type = "HALF_VOLLEY";
    }
    if (!head && !volley && !trivela && (name === "Tiro colocado" || name === "Tiro potente" || name === "Primera intención") &&
        dist > 9 && dist < 27 && cre > 58 && this.random() < 0.02 + (cre - 58) * 0.0035) type = "RABONA";
    p.actionType = type;
    p.tl = { anim: type, t0: this.elapsed, dur: 0.75, contact: TLB_SHOT[type].c, kind: "shot" };
    this.tlCount("shots", type);
    // Sincronía balón/jugador: el resultado ya está decidido (determinista); el balón sale visualmente en CONTACT.
    if (this.tlSync && this.shot && this.phase === "playing") {
      const c = TLB_SHOT[type].c * (0.85 + 0.3 * (1 - p.stats.shooting / 100));
      p.tl.contact = c;
      this.tlHold = { p, until: this.elapsed + c, x: b.x, y: DM.max(b.y, 0.13), z: b.z, vx: b.vx, vy: b.vy, vz: b.vz, spin: b.spin };
      b.vx = b.vy = b.vz = 0; b.spin = 0; this.tlTele.holds++;
    }
  },
  tlOnSkill(p, key) {
    if (!this.tlbEnabled) return;
    if (!this.tlTele) this.tlInit();
    p.actionType = "DRIBBLE_" + key.toUpperCase();
    p.tl = { anim: "SK_" + key, t0: this.elapsed, dur: 1.0, kind: "skill", side: DM.sign(p.moveZ) || 1 };
    this.tlCount("skills", key);
  },
  tlTick(t) {
    if (!this.tlbEnabled) return;
    if (!this.tlTele) this.tlInit();
    const h = this.tlHold, b = this.ball;
    if (h) {
      if (this.owner || this.phase !== "playing" || this.lastTouch !== h.p) this.tlHold = null; // alguien tocó/cortó: no forzar
      else if (this.elapsed >= h.until) { b.vx = h.vx; b.vy = h.vy; b.vz = h.vz; b.spin = h.spin; this.tlHold = null; }
      else { b.x = h.x; b.y = h.y; b.z = h.z; b.vx = b.vy = b.vz = 0; }
    }
    const o = this.owner; // último pasador del equipo (para la asistencia)
    if (o) { const pv = this.tlPrev[o.team]; if (!pv || pv.p !== o) this.tlPrev[o.team] = { p: o, prev: pv && pv.p, at: this.elapsed }; }
    if (this.phase === "playing") {
      this.tlSlideAt -= t;
      if (this.tlSlideAt <= 0) { this.tlSlideAt = 0.15; this.tlSlideScan(); this.p3SlideScan(); }
    }
    this.tlEmoCd = DM.max(0, this.tlEmoCd - t);
  },
  // Foot-guided ball velocity, not a render-only offset. Normal collisions, tackles and
  // touch ownership remain authoritative; never drag a ball back after a turnover.
  tlSkillBall(p, dt) {
    const a=p.tl, b=this.ball;
    if(!a || a.kind!=="skill" || this.owner!==p || this.phase!=="playing" || this.shot || this.tlHold) return false;
    const u=this.elapsed-a.t0;
    if(u<0 || u>=1 || DM.hypot(b.x-p.x,b.z-p.z)>2.5) return false;
    const s=a.side||1, e=DM.sin(DM.PI*u), w=DM.sin(2*DM.PI*u), key=a.anim.slice(3);
    let f=.65, lateral=0, y=.13;
    if(key==="roulette") { f=.65*DM.cos(2*DM.PI*u); lateral=s*.65*DM.sin(2*DM.PI*u); }
    else if(key==="elastico") { lateral=s*.7*w*e; f=.65+.25*e; }
    else if(key==="croqueta") lateral=s*.65*w;
    else if(key==="nutmeg") f=.65+1.1*e;
    else if(key==="sombrero") { f=.65+.6*e; y=.13+.85*e; }
    else if(key==="heelToHeel") f=.65-.5*w;
    else if(key==="dragBack") f=.65-.85*e;
    else if(key==="ballRoll") lateral=s*.55*w;
    const sn=DM.sin(p.angle), cs=DM.cos(p.angle);
    const tx=p.x+sn*f+cs*lateral, tz=p.z+cs*f-sn*lateral;
    // A bounded spring gives continuous trajectories and leaves the ball contestable.
    const gain=1-DM.exp(-dt*24), step=DM.max(dt,.001);
    b.vx=(tx-b.x)*gain/step; b.vz=(tz-b.z)*gain/step;
    b.vy=(y-b.y)*gain/step+9.81*dt; b.spin=s*w*1.2;
    return true;
  },
  // ---- BARRIDA: decisión contextual (no "closingFast + random") ------------------------------------
  tlSlideEval(d, v, ctx = {}) {
    const dir = this.direction(d.team), ownGoalX = -52.5 * dir;
    const dSp = DM.hypot(d.vx, d.vz), dist = DM.hypot(v.x - d.x, v.z - d.z);
    const danger = this.dangerAt(v.x, v.z, v.team) || 0;
    const behind = this.players.filter((q) => q.team === d.team && q.role !== "GK" && !q.sentOff && q !== d && (q.x - v.x) * dir < -1).length;
    const lastMan = behind === 0 ? 1 : 0;
    const nearLine = DM.max(0, 1 - DM.min(34 - DM.abs(v.z), 52.5 - DM.abs(v.x)) / 6);
    const reasons = [];
    let p = 0.03;
    if (dSp > 4 && dist < 3.4) { p += 0.1; reasons.push("closing"); }
    if (ctx.closingFast) p += 0.16;
    if (lastMan && danger > 0.35) { p += 0.28; reasons.push("last_man"); }
    if (ctx.loose) { p += 0.1; reasons.push("loose_ball"); }
    if (ctx.outgoing) { p += 0.3; reasons.push("last_ditch"); }
    if (ctx.pass) { p += 0.14; reasons.push("pass_beats_defender"); }
    p += danger * 0.16 + nearLine * 0.1;
    p += (d.personality.aggression - 50) / 220 + (d.stats.defense - 60) / 400 - (d.personality.discipline - 50) / 260;
    p -= (d.cards.yellow ? 0.2 : 0) + (d.stamina < 30 ? 0.06 : 0) + (ctx.canRun ? 0.18 : 0);
    const ownBox = DM.abs(d.x - ownGoalX) < 17 && DM.abs(d.z) < 21 ? 1 : 0;
    p -= ownBox && !lastMan ? 0.08 : 0;
    const foul = DM.min(0.6, 0.12 + (dSp - 4) * 0.02 + (ctx.behind ? 0.22 : 0) - d.stats.defense * 0.001 - d.personality.discipline * 0.001);
    const success = DM.max(0.12, DM.min(0.9, 0.48 + d.stats.defense * 0.004 + (ctx.outgoing ? 0.05 : 0) - DM.max(0, dist - 1.6) * 0.16));
    return { p: DM.max(0.01, DM.min(0.85, p)), foul, success, reasons, lastMan, danger };
  },
  tlSlideDecide(f, v, closingFast) {
    const e = this.tlSlideEval(f, v, { closingFast });
    f.tlSlideInfo = e;
    return this.random() < e.p;
  },
  // Barrida sobre balón suelto / que se va / pase que deja atrás. ~6 Hz, un solo candidato por vez.
  tlSlideScan() {
    const b = this.ball, sp = DM.hypot(b.vx, b.vz);
    if (this.owner || b.y > 1.1 || this.shot) return;
    const ox = b.x + b.vx * 0.95, oz = b.z + b.vz * 0.95, outSoon = !!this.lastTouch && (DM.abs(ox) > 52.6 || DM.abs(oz) > 34.1);
    let best = null, bestS = 0;
    for (const d of this.players) {
      if (d.sentOff || d.ragdoll || d.role === "GK" || (d.tl && d.tl.kind === "slide" && this.elapsed - d.tl.t0 < 1.2)) continue;
      if (this.elapsed - (d.tackleAt || -9) < 1.5 || d.state === "Shoot" || d.state === "Head") continue;
      if (sp < 1.5 && DM.hypot(b.x - d.x, b.z - d.z) > 2.6) continue;
      for (const tt of [0.35, 0.6, 0.85]) {
        const px = b.x + b.vx * tt * 0.86, pz = b.z + b.vz * tt * 0.86, dist = DM.hypot(px - d.x, pz - d.z);
        const outNow = outSoon && this.lastTouch.team === d.team;
        if (dist > (outNow ? 4.8 : 3.0) || dist < 0.5) continue;
        const canRun = dist / (4.2 + d.stats.speed * 0.035) < tt - 0.05;
        const outgoing = outNow;
        const ctx = { loose: true, outgoing, pass: !!this.receiver && this.receiver.team !== d.team && sp > 6, canRun, closingFast: DM.hypot(d.vx, d.vz) > 4.5 };
        const e = this.tlSlideEval(d, this.receiver || this.lastTouch || d, ctx);
        const s = e.p * (canRun ? 0.35 : 1) * (dist < 2.6 ? 1 : 0.7);
        if (s > bestS) { bestS = s; best = { d, px, pz, e, ctx, tt, dist }; }
        break;
      }
    }
    if (best && this.elapsed >= (this.tlSlideCd[best.d.team] || 0) && this.random() < best.e.p * (best.ctx.outgoing ? 0.12 : 0.035)) { this.tlSlideCd[best.d.team] = this.elapsed + 14; this.tlStartSlide(best); }
  },
  tlStartSlide(c) {
    const d = c.d, ctx = c.ctx;
    const type = ctx.outgoing ? "LAST_DITCH_SLIDE" : c.e.lastMan && c.e.danger > 0.4 ? "EMERGENCY_SLIDE" : ctx.pass ? "CLEARANCE_SLIDE" : ctx.loose ? "CLEAN_SLIDE" : "LATE_SLIDE";
    d.state = "Slide"; d.action = 0.6; d.slideType = type; d.tackleAt = this.elapsed;
    d.tl = { anim: type, t0: this.elapsed, dur: 0.7, kind: "slide", tx: c.px, tz: c.pz, hit: this.elapsed + (ctx && ctx.block ? DM.max(0.1, c.tt) : DM.max(0.12, c.tt * 0.55)), done: false, e: c.e, ctx, why: (c.e.reasons || []).join(",") };
    // Fase 3: la barrida es un IMPULSO real hacia el punto de contacto (no un move() a ritmo de carrera): el jugador se lanza, cae y se desliza
    // frenado por el rozamiento del césped. Antes, con la aceleración realista, casi no avanzaba.
    { const dx = c.px - d.x, dz = c.pz - d.z, L = DM.hypot(dx, dz) || 1, v0 = DM.hypot(d.vx, d.vz), vs = te(DM.max(v0, 4.5) * 1.08 + 1.6, 6.2, 9.4);
      d.tl.dirx = dx / L; d.tl.dirz = dz / L; d.vx = d.tl.dirx * vs; d.vz = d.tl.dirz * vs; d.angle = DM.atan2(d.vx, d.vz); d.sprinting = false; }
    d.tlLock = this.elapsed + 0.7;
    d.actionType = type;
    this.tlCount("slides", type);
    type === "LAST_DITCH_SLIDE" && this.tlTele.lastDitch++;
    this.event("tackle", "BARRIDA", `${d.name} se lanza (${type.replace("_SLIDE", "").toLowerCase()})`, d.team, d);
  },
  tlLockMove(p, t) {
    const s = p.tl;
    if (!s || s.kind !== "slide") { p.tlLock = 0; return; }
    { const age = this.elapsed - s.t0, dec = age < 0.15 ? 2 : age < 0.6 ? 7.5 : 13; const sp = DM.max(0, DM.hypot(p.vx, p.vz) - dec * t);
      p.vx = (s.dirx || 0) * sp; p.vz = (s.dirz || 0) * sp; p.x = te(p.x + p.vx * t, -52, 52); p.z = te(p.z + p.vz * t, -33.5, 33.5); }
    if (s.done || this.elapsed < s.hit) return;
    s.done = true;
    const b = this.ball, reach = 1.9 + p.stats.speed * 0.004;
    const opp = this.owner && this.owner.team !== p.team ? this.owner : null;
    if (s.ctx && s.ctx.block && DM.hypot(b.x - p.x, b.z - p.z) < reach + 0.4 && b.y < 1.2 && this.random() < s.e.success) {
      // tapó el tiro con el cuerpo/pierna: el balón pierde fuerza y sale desviado
      const sp0 = DM.hypot(b.vx, b.vz), ang = DM.atan2(b.vz, b.vx) + (this.random() < 0.5 ? -1 : 1) * this.range(0.5, 1.5), sp1 = sp0 * this.range(0.18, 0.42);
      b.vx = DM.cos(ang) * sp1; b.vz = DM.sin(ang) * sp1; b.vy = this.range(0.5, 2.5);
      this.shot = null; this.lastTouch = p; this.kickedAt = this.elapsed; this.secondBallUntil = this.elapsed + 1.6; s.result = "block";
      this.event("tackle", "¡BLOQUEÓ EL DISPARO!", `${p.name} se barre y tapa el remate`, p.team, p); this.excitement = DM.min(100, this.excitement + 15); this.tlCount("slides", "SHOT_BLOCK");
    } else if (DM.hypot(b.x - p.x, b.z - p.z) < reach && b.y < 1.2 && this.random() < s.e.success) {
      const dir = this.direction(p.team), out = s.anim === "LAST_DITCH_SLIDE";
      const mate = this.players.filter((q) => q.team === p.team && q !== p && q.role !== "GK" && !q.sentOff)
        .sort((a, c) => DM.hypot(a.x - p.x, a.z - p.z) - DM.hypot(c.x - p.x, c.z - p.z))[0];
      const r = this.random();
      let tx, tz, spd, how;
      if (out && r < 0.55) { tx = b.x * 0.7; tz = -DM.sign(b.z || 1) * 12; spd = 9; how = "keep_in"; }
      else if (out && r < 0.75) { tx = b.x + dir * 6; tz = DM.sign(b.z || 1) * 40; spd = 10; how = "deflect_out"; }
      else if (mate && r < 0.6) { tx = mate.x; tz = mate.z; spd = 9; how = "to_mate"; }
      else { tx = p.x - dir * 22; tz = p.z + (b.z >= 0 ? -1 : 1) * 12; spd = 13; how = "clear"; }
      const dx = tx - b.x, dz = tz - b.z, n = DM.hypot(dx, dz) || 1;
      b.vx = (dx / n) * spd; b.vz = (dz / n) * spd; b.vy = how === "clear" ? 3 : 0.4;
      this.owner = null; this.receiver = null; this.lastTouch = p; this.kickedAt = this.elapsed;
      s.result = how;
      this.event("tackle", how === "deflect_out" ? "DESVÍO DE BARRIDA" : "¡BARRIDA SALVADORA!", `${p.name} llega en el último instante`, p.team, p);
      this.excitement = DM.min(100, this.excitement + 12);
    } else {
      s.result = "miss"; this.tlTele.slideFail++;
      if (opp && DM.hypot(opp.x - p.x, opp.z - p.z) < 1.4 && this.random() < s.e.foul) { s.result = "foul"; this.commitFoul(p, opp); }
    }
  },
  // ---- GOL: paquete + GOAL_RUN ---------------------------------------------------------------------
  tlOnGoal(team, scorer) {
    // efectos de gol (cosmético): el equipo del usuario los dispara en el punto donde entró el balón (goalfx.js)
    try {
      const cfg = this.tlmCfg, mine = !cfg ? team === 0 : cfg.home.controlledBy === "user" ? team === 0 : cfg.away.controlledBy === "user" ? team === 1 : false;
      window.dispatchEvent(new CustomEvent("lfo:goal", { detail: { team, mine, situation: (this.time / 60 >= 85) ? "late" : (this.score[team] >= 4 ? "blowout" : "normal"), x: this.ball.x, y: this.ball.y, z: this.ball.z } }));
    } catch (e) {}
    if (!this.tlbEnabled) return;
    if (!this.tlTele) this.tlInit();
    const pv = this.tlPrev[team], cand = pv && pv.p === scorer ? pv.prev : pv && pv.p;
    const as = cand && cand !== scorer && cand.team === team && pv && this.elapsed - pv.at < 9 ? cand : null;
    const dir = this.direction(team), sx = scorer ? scorer.x : 0, sz = scorer ? scorer.z : 0;
    const variants = ["arms", "knees", "jump", "sky", "open", "brake"];
    // Cosméticos de la Tienda Diaria (Touchline): últimos 5' > 4º gol o más > normal.
    const situation = (this.time / 60 >= 85) ? "late" : (this.score[team] >= 4 ? "blowout" : "normal");
    const cosmeticVariant = window.LFOCosmetics && window.LFOCosmetics.pickVariant ? window.LFOCosmetics.pickVariant(situation) : null;
    const G = this.tlGoal = {
      scorerId: scorer ? scorer.id : -1, scorerName: scorer ? scorer.name : this.teams[team].name, scorerTeam: team,
      goalType: scorer && scorer.tl && scorer.tl.kind === "shot" ? scorer.tl.anim : "NORMAL_SHOT",
      goalTime: this.time, assistId: as ? as.id : null, assistName: as ? as.name : null, x: sx, z: sz,
      phase: "run", t0: this.elapsed, dir, situation, variant: cosmeticVariant || variants[DM.floor(this.random() * variants.length)],
      corner: { x: 52.5 * dir - dir * 3.2, z: (sz >= 0 ? 1 : -1) * 31 }, followers: [],
    };
    this.tlTele.goals++;
    this.wait = DM.min(16, DM.max(9.6, DM.hypot(G.corner.x-sx, G.corner.z-sz)/7+4));
    if (scorer) {
      const mates = this.players.filter((q) => q.team === team && q !== scorer && !q.sentOff)
        .sort((a, c) => DM.hypot(a.x - sx, a.z - sz) - DM.hypot(c.x - sx, c.z - sz));
      G.followers = mates.slice(0, 4).map((q, i) => ({ id: q.id, delay: 0.35 + i * 0.25, ox: i < 2 ? (i ? .65 : -.65) : (this.random() - 0.5) * 3, oz: i < 2 ? .25 : (this.random() - 0.5) * 3, hug: i < 2 }));
      scorer.state = "Positioning"; scorer.tl = { anim: "CEL_" + G.variant, t0: this.elapsed, kind: "cel", dur: 9 };
    }
  },
  tlGoalTick(t) {
    const G = this.tlGoal; if (!G) return;
    const sc = this.players[G.scorerId], el = this.elapsed - G.t0;
    if (!sc) return;
    const cx = G.corner.x, cz = G.corner.z;
    if (G.phase === "run") {
      if (DM.hypot(cx - sc.x, cz - sc.z) > 2.2) { this.move(sc, cx, cz, t, 1.35); sc.state = "Positioning"; }
      else { G.phase = "cel"; G.celAt = this.elapsed; sc.state = "Celebrate"; if (sc.tl) sc.tl.t0 = this.elapsed; }
    } else if (G.variant === "knees" && this.elapsed - G.celAt < 0.7) { sc.x += sc.vx * t; sc.z += sc.vz * t; sc.vx *= 0.94; sc.vz *= 0.94; }
    else { sc.vx = sc.vz = 0; }
    for (const f of G.followers) {
      const q = this.players[f.id]; if (!q || el < f.delay) continue;
      const tx = sc.x + f.ox, tz = sc.z + f.oz;
      if (DM.hypot(tx - q.x, tz - q.z) > (f.hug ? .22 : .8)) { this.move(q, tx, tz, t, 1.1); q.state = "Positioning"; }
      else {
        q.vx = q.vz = 0; q.state = "Celebrate"; q.angle = DM.atan2(sc.x - q.x, sc.z - q.z);
        if (!q.tl || !String(q.tl.anim).startsWith("CEL_")) q.tl = { anim: f.hug ? "CEL_hug" : "CEL_group", t0: this.elapsed, kind: "cel" };
      }
    }
  },
  // ---- EMOJIS CONTEXTUALES ------------------------------------------------------------------------
  tlExpressive(p) {
    const pe = p.personality;
    return DM.max(0.12, DM.min(1, (pe.creativity * 0.35 + pe.aggression * 0.3 + (100 - pe.composure) * 0.35) / 100 + 0.1));
  },
  tlEmote(p, list, chance = 1) {
    if (!p || !this.tlEmoOn || this.tlEmoCd > 0) return;
    if (p.tlEmoji && p.tlEmoji.until > this.elapsed) return;
    if (this.random() > chance * this.tlExpressive(p)) return;
    const conf = p.memory ? p.memory.confidence : 50;
    const e = list[DM.floor(this.random() * list.length)];
    p.tlEmoji = { e: conf < 35 && e === "😎" ? "😅" : e, until: this.elapsed + 2.2, at: this.elapsed };
    this.tlEmoCd = 2.5; this.tlTele.emoji++;
  },
  tlOnEvent(ev) {
    if (!this.tlbEnabled || !ev) return;
    if (!this.tlTele) this.tlInit();
    const P = ev.player != null ? this.players[ev.player] : null;
    switch (ev.type) {
      case "goal":
        this.tlEmote(P, ["🙌", "🔥", "😎", "😂", "😭", "💪"], 1.6);
        this.players.filter((q) => q.team === ev.team && q !== P).slice(0, 3).forEach((q) => this.tlEmote(q, ["🙌", "🔥", "👏"], 0.7));
        { const gk = this.players[(1 - ev.team) * 11]; gk && this.tlEmote(gk, ["😭", "😔", "🤦"], 1.1); } break;
      case "save": this.tlEmote(P, ["🙌", "😮", "😱", "💪"], 1.2); break;
      case "post": this.tlEmote(P, ["😱", "🤦", "😩", "😮‍💨"], 1.3); break;
      case "block": case "tackle": this.tlEmote(P, ["😤", "😮", "💪", "🔥"], 0.8); break;
      case "foul": this.tlEmote(P, ["😤", "😡", "😮"], 0.7); break;
      case "card": this.tlEmote(P, ["😡", "🤦", "😔", "🫡"], 1.0); break;
    }
  },
});
// Gol tras un desvío/rebote del rival (o autogol): el motor acreditaba el gol a quien tocó la pelota por última vez, aunque fuera del equipo que
// recibió el gol → el rival salía a festejar y los del equipo goleador lo abrazaban. Se acredita al último atacante que tuvo la pelota (o al
// atacante más cercano) para que el festejo, el autor y las estadísticas sean coherentes.
{
  const _goal = wc.prototype.goal;
  wc.prototype.goal = function (t) {
    const sp = this.shot && this.players[this.shot.player], cur = sp || this.lastTouch;
    if (!cur || cur.team !== t || cur.id == null || cur.sentOff) {
      const pv = this.tlPrev && this.tlPrev[t];
      let a = pv && pv.p && pv.p.team === t && !pv.p.sentOff && pv.p.role !== "GK" ? pv.p : null;
      if (!a) {
        const b = this.ball;
        a = this.players.filter((q) => q.team === t && q.role !== "GK" && !q.sentOff).sort((x, y) => DM.hypot(x.x - b.x, x.z - b.z) - DM.hypot(y.x - b.x, y.z - b.z))[0] || null;
      }
      if (a) { this.lastTouch = a; if (sp && sp.team !== t) this.shot = null; }
    }
    return _goal.call(this, t);
  };
}
// Línea defensiva coherente: los defensas bajaban a distinta profundidad (marca/seguimiento de los delanteros, DROP individual, retroceso) y la
// línea se rompía y quedaba muy atrás → casi nunca había offside. Ahora, sin balón, la línea de zagueros se mueve como bloque: el objetivo de
// cada DEF queda a ±LINE_BAND de una línea común (anclas de formación + altura del manager + repliegue colectivo). Se exceptúan los que
// presionan/persiguen la pelota y el portador/receptor. Se aplica al objetivo final de move() dentro de updatePlayers().
{
  const LINE_BAND = 2.2, _up = wc.prototype.updatePlayers, _mv = wc.prototype.move;
  // Línea común: se define respecto de la PELOTA y del dial de altura del manager, no de las anclas de formación (que llegaban a quedar más
  // atrás que la propia línea de gol cuando la pelota estaba en campo propio → toda la defensa pegada al arco y sin fuera de juego).
  wc.prototype.lfoBackLine = function (tm, d) {
    const c = this._lfoBL || (this._lfoBL = [null, null]);
    if (c[tm] && c[tm].at === this.elapsed) return c[tm];
    const defs = this.ai2Outfield(tm).filter((p) => p.role === "DEF" && !p.sentOff);
    if (!defs.length) return (c[tm] = { at: this.elapsed, base: null, mean: 0 });
    let mean = 0; for (const p of defs) mean += this.formationSlot(tm, p.index)[0] * d; mean /= defs.length;
    const tt = this.teamTactics(tm), tr = this.transitionMode && this.transitionMode[tm], my = this.teams[tm].mentality;
    let gap = 22 - (tt.defensiveLine - 1) * 14;               // metros por detrás de la pelota (línea alta → más cerca)
    if (tr && tr.until > this.elapsed && tr.mode === "immediate_retreat") gap += 3;
    if (my === "defensive") gap += 4; else if (my === "attacking") gap -= 2;
    gap -= this.urgency(tm) * 0.5;
    const opps = this.ai2Outfield(1 - tm);
    if (opps.some((a) => a.x * d + 52.5 < 36 && DM.hypot(a.vx, a.vz) > 4.2 && a.vx * -d > 1.5)) gap += 2;   // repliegue colectivo, no individual
    const hi = -14 + (tt.defensiveLine - 1) * 8, base = DM.max(-40, DM.min(hi, this.ball.x * d - gap));
    return (c[tm] = { at: this.elapsed, base, mean });
  };
  wc.prototype.updatePlayers = function (t) { this._lfoUP = true; try { return _up.call(this, t); } finally { this._lfoUP = false; } };
  wc.prototype.move = function (p, x, z, t, v) {
    if (this._lfoUP && this.lfoLineFix !== false && p && p.role === "DEF" && this.phase === "playing" && !p.sentOff && p.ai && p !== this.owner && p !== this.receiver && p.aiChase !== this.elapsed) {
      const defending = this.owner ? this.owner.team !== p.team : !!(this.lastTouch && this.lastTouch.team !== p.team), tr = p.tacticalRole;
      if (defending && tr !== "PRESS" && tr !== "PRESS_DESCOORD" && tr !== "CONTAIN" && tr !== "LATE" && tr !== "BALL_WATCH" && tr !== "ASSUME_COVER") {
        const d = this.direction(p.team), B = this.lfoBackLine(p.team, d);
        if (B.base != null) {
          const L = B.base + (this.formationSlot(p.team, p.index)[0] * d - B.mean), xd = DM.max(L - LINE_BAND, DM.min(L + LINE_BAND, x * d));
          x = xd * d;
        }
      }
    }
    return _mv.call(this, p, x, z, t, v);
  };
}
// Enganche de eventos sin tocar la lógica de fútbol: el motor sigue llamando event(); acá sólo se observa.
{
  const _ev = wc.prototype.event;
  wc.prototype.event = function (...a) { const r = _ev.apply(this, a); this.tlOnEvent && this.tlOnEvent(this.events[0]); return r; };
}

// ===== TLB referee — árbitro como entidad del motor (mismo rig y animaciones que los jugadores) =====
// No forma parte de match.players (no juega, no marca, no afecta a la IA). Se anexa sólo a la lista de render
// (match.tlRL = 22 jugadores + árbitro) y a los frames de replay.
const TLB_FLUOR = ["#39ff14", "#ffea00", "#ff2e97", "#00e5ff", "#ff7a00", "#b6ff00", "#c400ff", "#ff3b3b"];
{
  const _init = wc.prototype.tlInit, _tick = wc.prototype.tlTick, _ev = wc.prototype.tlOnEvent;
  Object.assign(wc.prototype, {
    tlInit() {
      _init.call(this);
      // color fluor determinista por partido (hash de la seed; no consume this.random())
      const h = (DM.imul((this.seed || 1) >>> 0, 2654435761) >>> 0) % TLB_FLUOR.length;
      this.tlRef = {
        id: 22, team: 2, index: 22, role: "REF", name: "Árbitro", number: 0, x: 0, z: -8, vx: 0, vz: 0, angle: 0, state: "Idle",
        timer: 0, action: 0, burst: 0, dive: 0, diveDir: 1, moveZ: 1, sentOff: false, ragdoll: null, skillMove: null, sprinting: false,
        stats: { speed: 60, acceleration: 60, dribbling: 50, passing: 50, shooting: 40, defense: 50, physical: 60, intelligence: 60 },
        scale: 0.95, appearance: { skin: ["#e3b38c", "#c6865d", "#f5cbb1", "#8d5524"][(h + 1) % 4] }, color: TLB_FLUOR[h], tl: null, act: null, tlEmoji: null,
      };
      this.tlRL = new Array(23);
    },
    tlTick(t) {
      _tick.call(this, t);
      if (this.tlbEnabled && this.tlRef) this.tlRefTick(t);
    },
    tlOnEvent(ev) {
      _ev.call(this, ev);
      if (this.tlbEnabled && this.tlRef && ev) this.tlRefEvent(ev);
    },
    tlRefSay(anim, dur, extra = {}) {
      const R = this.tlRef;
      R.tl = { anim, kind: "ref", t0: this.elapsed, dur, ...extra };
    },
    tlRefEvent(ev) {
      const R = this.tlRef, P = ev.player != null ? this.players[ev.player] : null;
      switch (ev.type) {
        case "foul": this.tlRefSay("REF_WHISTLE", 0.9); break;
        case "offside": this.tlRefSay("REF_WHISTLE", 0.9); break;
        case "card": if (P) R.act = { type: "card", pid: P.id, red: /ROJA/.test(ev.title), at: this.elapsed, started: false }; break;
        case "penalty": R.act = { type: "penalty", at: this.elapsed, started: false, team: ev.team }; this.tlRefSay("REF_WHISTLE", 0.9); break;
        case "goal": R.act = { type: "goal", at: this.elapsed, started: false }; break;
        case "halftime": case "fulltime": this.tlRefSay("REF_WHISTLE_LONG", 1.6); break;
      }
    },
    tlRefTick(dt) {
      const R = this.tlRef, b = this.ball, now = this.elapsed;
      this.tlRL.length = 23;
      for (let i = 0; i < 22; i++) this.tlRL[i] = this.players[i];
      this.tlRL[22] = R;
      if (R.tl && now - R.tl.t0 > R.tl.dur) R.tl = null;
      let tx, tz, face = null, max = 6.3;
      const clampx = (v) => DM.max(-50, DM.min(50, v)), clampz = (v) => DM.max(-32, DM.min(32, v));
      const A = R.act;
      if (A && A.type === "card") {
        const P = this.players[A.pid];
        if (P) {
          tx = P.x - DM.sign(P.x - R.x || 1) * 2.0; tz = P.z; face = P; max = 7.6;
          const d = DM.hypot(P.x - R.x, P.z - R.z);
          if (!A.started && (d < 3.2 || now - A.at > 3.4)) { A.started = true; A.t = now; this.tlRefSay(A.red ? "REF_RED" : "REF_YELLOW", 2.6); }
          if (A.started && now - A.t > 2.8) R.act = null;
        } else R.act = null;
      } else if (A && A.type === "goal") {
        tx = 0; tz = 0; face = { x: 0, z: 0 };
        if (!A.started && now - A.at > 1.4) { A.started = true; this.tlRefSay("REF_POINT_CENTER", 1.8); }
        if (now - A.at > 4) R.act = null;
      } else if (A && A.type === "penalty") {
        const bx = this.ball.x, sx = DM.sign(bx || 1);
        tx = clampx(bx - sx * 12); tz = 8; face = { x: bx, z: 0 };
        if (!A.started && now - A.at > 0.9) { A.started = true; this.tlRefSay("REF_POINT_SPOT", 1.8); }
        if (now - A.at > 3) R.act = null;
      } else if (this.phase === "injury" && this.injuryData && this.players[this.injuryData.playerId]) {
        const q = this.players[this.injuryData.playerId]; tx = q.x + 1.6; tz = q.z + 1.2; face = q;
      } else if (this.phase === "restart" && this.restartData) {
        const rd = this.restartData, k = rd.kind;
        if (k === "corner") { tx = clampx(rd.x - DM.sign(rd.x) * 20); tz = DM.sign(rd.z || 1) * 9; }
        else { tx = clampx(rd.x * 0.9 - DM.sign(rd.x || 1) * 6); tz = clampz(rd.z + (rd.z >= 0 ? -9 : 9)); }
        face = { x: rd.x, z: rd.z };
      } else if (this.phase === "freekick" || this.phase === "penalty") {
        tx = clampx(b.x * 0.85 - DM.sign(b.x || 1) * 10); tz = clampz(b.z + (b.z >= 0 ? -9 : 9)); face = b;
      } else if (this.phase === "goal" || this.phase === "halftime" || this.phase === "ended") {
        tx = 0; tz = 4; face = { x: 0, z: 0 };
      } else {
        // juego: diagonal detrás de la jugada, manteniendo distancia (~10 m)
        tx = clampx(b.x * 0.92 - DM.sign(b.vx || b.x || 1) * 5); tz = clampz(b.z + (b.z >= 0 ? -10 : 10));
        face = b; max = DM.min(7.2, 5 + DM.hypot(b.vx, b.vz) * 0.12);
      }
      const busy = R.tl && R.tl.kind === "ref" && R.tl.dur > 1.0;
      const dx = tx - R.x, dz = tz - R.z, d = DM.hypot(dx, dz);
      let vd = 0;
      if (!busy && d > 1.6) vd = DM.min(max, (d - 1.2) * 1.5);
      const ux = d > 0.01 ? dx / d : 0, uz = d > 0.01 ? dz / d : 0, k = DM.min(1, dt * 3);
      R.vx += (ux * vd - R.vx) * k; R.vz += (uz * vd - R.vz) * k;
      R.x = DM.max(-52.5, DM.min(52.5, R.x + R.vx * dt)); R.z = DM.max(-34, DM.min(34, R.z + R.vz * dt));
      const sp = DM.hypot(R.vx, R.vz);
      let want = R.angle;
      if (sp > 0.6) want = DM.atan2(R.vx, R.vz); else if (face) want = DM.atan2(face.x - R.x, face.z - R.z);
      let da = want - R.angle; da = DM.atan2(DM.sin(da), DM.cos(da));
      R.angle += da * DM.min(1, dt * 6);
      R.state = sp > 0.35 ? "Run" : "Idle";
    },
  });
}
// Durante la espera de 4 s de corners y tiros libres el resto de los jugadores se mueve y se posiciona.
Object.assign(wc.prototype, {
  tlRoam(dt, team, frozen) {
    for (const p of frozen) p.tlFrozen = this.elapsed + 0.1;
    const st = this.lastTouch; this.lastTouch = { team };
    this.updatePlayers(dt);
    this.lastTouch = st;
  },
  tlCornerRoam(dt) {
    const rd = this.restartData;
    if (this.tlbEnabled && rd && rd.kind === "corner") this.tlRoam(dt, rd.team, []);
  },
  tlFreeKickRoam(dt) {
    const fd = this.freeKickData; if (!this.tlbEnabled || !fd) return;
    const ids = new Set([fd.takerId, ...(fd.wallerIds || [])]);
    this.tlRoam(dt, fd.team, this.players.filter((p) => ids.has(p.id)));
  },
});
// Predicción de balón aéreo: integra la misma física que updateBall (gravedad, arrastre) hasta el primer bote.
// Los jugadores apuntan al punto de caída con un error que depende de su inteligencia y del tiempo que falta.
Object.assign(wc.prototype, {
  tlBallLanding() {
    const b = this.ball;
    if (this._tlL && this._tlL.at === this.elapsed) return this._tlL;
    let x = b.x, y = b.y, z = b.z, vx = b.vx, vy = b.vy, vz = b.vz, t = 0;
    const dt = 1 / 30;
    while (t < 4.5) {
      vy -= 9.81 * dt; y += vy * dt;
      if (y < 0.13) break;
      { const sp = DM.hypot(vx, vz), o = sp > 0 ? DM.max(0, sp - ballDecel(sp, false) * dt) / sp : 1; vx *= o; vz *= o; }
      x += vx * dt; z += vz * dt; t += dt;
    }
    return (this._tlL = { at: this.elapsed, x: x + vx * 0.2, z: z + vz * 0.2, t });
  },
  tlAerialTarget(p) {
    const b = this.ball;
    if (this.tlAerialOn === false || !this.tlbEnabled || this.owner || (b.y < 0.9 && b.vy < 2.5)) return false;
    const L = this.tlBallLanding();
    if (L.t < 0.05) return false;
    const intel = (p.stats.intelligence || 60) / 100, k = DM.min(1, DM.max(0.15, L.t / 1.5));
    const r = (0.3 + (1 - intel) * 2.0) * k, h1 = DM.sin(p.id * 12.9898 + DM.floor(L.at * 0.5) * 78.233) * 43758.5453, h2 = DM.sin(p.id * 39.346 + 11.135) * 24634.6345;
    this._tlA = this._tlA || { x: 0, z: 0 };
    this._tlA.x = DM.max(-52, DM.min(52, L.x + ((h1 - DM.floor(h1)) - 0.5) * 2 * r));
    this._tlA.z = DM.max(-33.5, DM.min(33.5, L.z + ((h2 - DM.floor(h2)) - 0.5) * 2 * r));
    return true;
  },
});

// <<TLB_ENGINE_END>>
// <<TLM_ENGINE_BEGIN>>
// ===== TLM engine layer — el manager consume/configura el motor sin reemplazarlo =====
// Se inyecta con manager/build.mjs entre <<TLM_ENGINE_BEGIN>> / <<TLM_ENGINE_END>> (mismo scope que la clase wc).
//  · tlmLoad(cfg): aplica un ManagerMatchConfig (clubes, XI, banquillo, táctica, plan, instrucciones).
//  · Cambios físicos: pedido → pendiente → punto de parada → presentación → sale (camina) → entra → aplicado → reanuda.
//  · Log por jugador (goles, asistencias, tiros, atajadas, tarjetas, minutos) y tlmResult(): MatchResult para el manager.
Fa["3-5-2"] = [[-49, 0], [-37, -13], [-39, 0], [-37, 13], [-20, 26], [-20, -26], [-25, 0], [-15, -9], [-6, 9], [8, -9], [8, 9]];
const TLM_MENT = { veryDefensive: "defensive", defensive: "defensive", balanced: "balanced", attacking: "attacking", veryAttacking: "attacking" };
{
  const _reset = wc.prototype.reset, _event = wc.prototype.event, _step = wc.prototype.step;
  wc.prototype.reset = function () {
    _reset.call(this);
    if (this.tlmCfg && !this._tlmLoading) this.tlmApply();
  };
  // registro de eventos con el ocupante REAL del hueco (tras un cambio el mismo hueco tiene otro jugador)
  wc.prototype.event = function (t, e, n, s, r, extra) {
    const res = _event.call(this, t, e, n, s, r, extra);
    if (this.tlmLog) {
      const pl = r != null && r.id != null ? r : null;
      this.tlmLog.push({ t: this.time, type: t, title: e, detail: n, team: s, slot: pl ? pl.id : null, pid: pl ? pl.tlmPid || null : null, extra: extra || null,
        assistPid: t === "goal" && this.tlGoal && this.tlGoal.assistId != null && this.players[this.tlGoal.assistId] ? this.players[this.tlGoal.assistId].tlmPid : null });
    }
    return res;
  };
  const _pass = wc.prototype.pass;
  wc.prototype.pass = function (t, ...a) {
    if (this.tlmPS && t && t.tlmPid) { const s = this.tlmPS[t.tlmPid]; if (s) s.passes++; }
    return _pass.call(this, t, ...a);
  };
  const _rag = wc.prototype.startRagdoll;
  wc.prototype.startRagdoll = function (p, severity, dir, injury) {
    if (injury && this.tlmInj && p && p.tlmPid) this.tlmInj.push({ pid: p.tlmPid, severity: severity == null ? 0.5 : severity, at: this.time });
    return _rag.call(this, p, severity, dir, injury);
  };
  // v2 (pedido explícito): antes esto reemplazaba el step() entero mientras duraba el cambio —
  // el partido entero quedaba congelado (pelota y los otros 21 jugadores parados) todo lo que
  // tardaba la animación de salir/entrar, que en fútbol real no pasa: el juego sigue, sólo el
  // jugador que sale y el que entra están "fuera de foco" un rato. Ahora sólo se arranca la
  // secuencia en una detención real del juego (igual que antes) pero el step normal SIEMPRE
  // corre — tlmSubTick sólo mueve a mano a esos dos jugadores (marcados con tlmSubbing, así que
  // updatePlayers los deja en paz) mientras el resto del partido sigue en vivo.
  wc.prototype.step = function (t) {
    if (this.running && !this.ended && this.tlmSubQ && (this.tlmSubSeq || this.tlmSubQ.length)) {
      if (!this.tlmSubSeq && (this.phase === "restart" || this.phase === "halftime") && this.tlmSubStart) this.tlmSubStart();
      if (this.tlmSubSeq) this.tlmSubTick(te(t, 0, 1 / 30));
    }
    return _step.call(this, t);
  };
}
const TLM_STYLE_IDX = (pos) => (pos === "LI" || pos === "LD" ? 1 : pos === "DFC" ? 2 : 5);
Object.assign(wc.prototype, {
  // ---------- carga de configuración ----------
  tlmLoad(cfg) {
    if (!this._tlmOrig) this._tlmOrig = this.teams.map((t) => ({ ...t }));
    const S = [cfg.home, cfg.away];
    this.tlmCfg = cfg; this._initialSeed = this.seed = (cfg.seed || this.seed) >>> 0;
    this.teams = S.map((s) => ({ name: s.name, short: s.shortName, color: s.color, colorAlt: s.colorAlt, crest: s.crest, formation: s.formation, mentality: TLM_MENT[s.mentality] || "balanced",
      kitPattern: s.kitPattern, gkColor: s.gkColor, names: s.startingXI.map((x, i) => (x ? x.name : "Jugador " + (i + 1))), numbers: s.startingXI.map((x, i) => (x ? x.number : i + 1)), tlmClubId: s.clubId, controlledBy: s.controlledBy, stadium: cfg.stadium }));
    this._tlmLoading = true; this.reset(); this._tlmLoading = false; this.tlmApply();
  },
  tlmRestore() { // vuelve a los dos equipos de exhibición del motor
    this.tlmCfg = null; this.tlmLog = null; this.tlmPS = null; this.tlmSubQ = null; this.tlmSubSeq = null; this._triggers = null; this.playerRoles = {};
    if (this._tlmOrig) this.teams = this._tlmOrig.map((t) => ({ ...t }));
    this.reset();
  },
  tlmAssign(p, x, t) {
    p.tlmPid = x.pid; p.name = x.name; p.fullName = x.fullName; p.number = x.number; p.stats = { ...x.stats }; p.personality = { ...x.personality };
    p.heightM = x.heightM; p.scale = x.heightM / BASE_MODEL_HEIGHT; p.stamina = x.stamina == null ? 100 : x.stamina; p.cards = { yellow: 0, red: false };
    p.cardData = x.card; p.tlmOvr = x.overall; p.primaryPosition = x.primaryPosition; p.tlmMorale = x.morale;
    const k = x.card || {};
    p.appearance = { skin: k.skin, hair: k.hair, cut: /^(largo|melena|media|trenzas|rastas|colita|mediacola|mullet|manbun|mono|rodete|twists|trencitas|taza)$/.test(k.hairStyle) ? "long" : /^(rapado|corona)$/.test(k.hairStyle) ? "bald" : undefined, kit: p.role === "GK" ? this.teams[t].gkColor || this.teams[t].color : this.teams[t].color, trim: p.role === "GK" ? "#ffffff" : this.teams[t].colorAlt, pattern: p.role === "GK" ? "plain" : this.teams[t].kitPattern || "stripes" };
    delete p.collectibleId; delete p.collectionZones; delete p.preferredFoot;
    p.memory = { confidence: 50, recentMistakes: 0, recentSuccesses: 0, recentDuelResults: 0, lastOpponent: null, lastPassTarget: null, pressureMemory: 0, recentFatigue: 0 };
    this.deriveIdentity(p);
  },
  tlmBenchEntry(x, t, i) {
    const role = x.role, r = { name: x.name, fullName: x.fullName, number: x.number, role, stats: { ...x.stats }, personality: { ...x.personality }, heightM: x.heightM, scale: x.heightM / BASE_MODEL_HEIGHT,
      index: TLM_STYLE_IDX(x.primaryPosition), tlmPid: x.pid, card: x.card, stamina: x.stamina, overall: x.overall, primaryPosition: x.primaryPosition, morale: x.morale, team: t,
      memory: { confidence: 50, recentMistakes: 0, recentSuccesses: 0, recentDuelResults: 0, lastOpponent: null, lastPassTarget: null, pressureMemory: 0, recentFatigue: 0 } };
    this.deriveIdentity(r); return r;
  },
  tlmApply() {
    const cfg = this.tlmCfg; if (!cfg) return;
    const S = [cfg.home, cfg.away];
    this.tlmLog = []; this.tlmPS = {}; this.tlmInj = []; this.tlmMin = {}; this.tlmSubQ = []; this.tlmSubSeq = null; this.tlmSubsDone = []; this.tlmMode = "manager";
    this.maxSubs = 5; this.subsUsed = [0, 0]; this.playerRoles = {};
    for (let t = 0; t < 2; t++) {
      const s = S[t], lt = this.liveTactics[t];
      s.startingXI.forEach((x, e) => {
        const p = this.players[t * 11 + e]; if (!x) return;
        this.tlmAssign(p, x, t);
        this.tlmPS[x.pid] = { pid: x.pid, team: t, passes: 0 }; this.tlmMin[x.pid] = { team: t, on: 0, off: null, start: true, stamina: null };
        if (s.playerInstructions && s.playerInstructions[x.pid]) this.playerRoles[p.id] = s.playerInstructions[x.pid];
      });
      this.bench[t] = s.bench.map((x, i) => this.tlmBenchEntry(x, t, i));
      s.bench.forEach((x) => { this.tlmPS[x.pid] = { pid: x.pid, team: t, passes: 0 }; });
      // tácticas: se aplican YA (no hay retardo de "asimilación" antes del pitazo inicial)
      Object.assign(lt.requested, s.enginePatch); lt.requestedNum = this.tacticEnumToNum(lt.requested); lt.active = { ...lt.requestedNum }; lt.formation = s.formation; lt.requestedFormation = null; lt.formationBlend = 1;
      // plan de partido → triggers reales del motor (evaluateTriggers ya existente)
      this._triggers = this._triggers || [[], []];
      const rules = (s.planRules || []).map((r) => ({ id: "tlm_" + r.id, once: true, then: r.then,
        when: r.kind === "winning" ? (c) => c.winning && c.minute >= DM.max(25, r.minute) : r.kind === "losing" ? (c) => c.losing && c.minute >= DM.max(15, r.minute) : (c) => !c.winning && c.minute >= r.minute }));
      this._triggers[t] = rules;
      for (const k of Object.keys(this)) if (k.startsWith("_fired_tlm_")) delete this[k];
      this.teams[t].autoTactics = rules.length > 0 || s.controlledBy === "ai";
    }
    this.tlmClock = this.time;
  },
  // ---------- CAMBIOS FÍSICOS ----------
  tlmSubOptions(team) { return { used: this.subsUsed[team], max: this.maxSubs, pending: (this.tlmSubQ || []).filter((q) => q.team === team).length, bench: this.bench[team].map((b, i) => ({ i, pid: b.tlmPid, name: b.name, number: b.number, role: b.role, pos: b.primaryPosition, ovr: b.overall })) }; },
  tlmRequestSub(team, outId, benchIdx, reason = "táctico", opts = {}) {
    if (!this.tlmSubQ) this.tlmSubQ = [];
    const out = this.players.find((p) => p.id === outId && p.team === team), inn = this.bench[team][benchIdx];
    if (!out || !inn) return { ok: false, reason: "Cambio inválido." };
    if (inn.tlmPid == null) inn.tlmPid = "auto_" + team + "_" + inn.number + "_" + benchIdx; // partido de exhibición (sin carrera): identidad propia del suplente
    if (out.sentOff) return { ok: false, reason: "Ese jugador ya fue expulsado." };
    if (this.subsUsed[team] + this.tlmSubQ.filter((q) => q.team === team).length >= this.maxSubs) return { ok: false, reason: `Ya usaste los ${this.maxSubs} cambios.` };
    if (this.tlmSubQ.some((q) => q.team === team && q.outId === outId)) return { ok: false, reason: "Ya hay un cambio pendiente para ese jugador." };
    if (this.tlmSubQ.some((q) => q.team === team && q.inIdxPid === inn.tlmPid)) return { ok: false, reason: "Ese suplente ya está asignado a otro cambio." };
    if ((out.role === "GK") !== (inn.role === "GK") && !opts.force) return { ok: false, reason: "El portero sólo puede ser reemplazado por otro portero." };
    const q = { team, outId, inIdxPid: inn.tlmPid, reason, at: this.time, urgent: !!opts.urgent };
    this.tlmSubQ.push(q);
    this.event("substitution_requested", "CAMBIO SOLICITADO", `${inn.name} por ${out.name} (${reason})`, team, out, { outId, inPid: inn.tlmPid });
    this.event("substitution_pending", "CAMBIO EN ESPERA", "Se hará en el próximo parón del juego", team, out, { outId, inPid: inn.tlmPid });
    return { ok: true, queued: true };
  },
  tlmCancelSub(team, outId) { if (!this.tlmSubQ) return false; const n = this.tlmSubQ.length; this.tlmSubQ = this.tlmSubQ.filter((q) => !(q.team === team && q.outId === outId)); return this.tlmSubQ.length < n; },
  tlmSubStart() {
    const q = this.tlmSubQ.find((c) => { const out = this.players[c.outId]; if (!out || out.sentOff || out.ragdoll || this.subsUsed[c.team] >= this.maxSubs) return false; if (this.restartData && this.restartData.takerId === out.id) return false; return true; });
    if (!q) { this.tlmSubQ = this.tlmSubQ.filter((c) => { const o = this.players[c.outId]; return o && !o.sentOff && this.subsUsed[c.team] < this.maxSubs; }); return; }
    const out = this.players[q.outId], bi = this.bench[q.team].findIndex((b) => b.tlmPid === q.inIdxPid);
    if (bi < 0) { this.tlmSubQ = this.tlmSubQ.filter((c) => c !== q); return; }
    const side = out.z >= 0 ? 1 : -1, ex = te(out.x, -22, 22);
    this.tlmSubSeq = { q, phase: "present", t: 0, outId: out.id, benchIdx: bi, side, exit: { x: ex, z: side * 35.6 }, bench: { x: ex, z: side * 39.5 }, injured: /lesi/i.test(q.reason), swapped: false };
    out.tlmSubbing = true; // el juego sigue: este jugador queda "fuera de foco" mientras sale y entra el suplente
    this.event("substitution_stopping_point", "CAMBIO EN CURSO", "El juego sigue mientras se completa el cambio", q.team, out);
    const inn = this.bench[q.team][bi];
    this.event("substitution_presentation", "CAMBIO", `Sale ${out.name} · Entra ${inn.name}`, q.team, out, { outId: out.id, outPid: out.tlmPid, inPid: inn.tlmPid, inName: inn.name, inNumber: inn.number });
  },
  tlmSubTick(dt) {
    const S = this.tlmSubSeq, p = this.players[S.outId]; S.t += dt; // this.elapsed ya lo avanza el step() normal, que ahora corre siempre (v2)
    if (!this.tlmMin) this.tlmMin = {}; if (!this.tlmSubsDone) this.tlmSubsDone = [];
    const walk = (tx, tz, spd) => {
      const dx = tx - p.x, dz = tz - p.z, d = DM.hypot(dx, dz);
      if (d < 0.35) { p.vx = p.vz = 0; return true; }
      const v = DM.min(spd, d / DM.max(dt, 1e-3));
      p.vx = (dx / d) * v; p.vz = (dz / d) * v; p.x += p.vx * dt; p.z += p.vz * dt; p.angle = DM.atan2(p.vx, p.vz); p.state = "Positioning"; return false;
    };
    if (S.phase === "present") { p.vx = p.vz = 0; if (S.t > 1.6) { S.phase = "exit"; S.t = 0; this.event("player_exit", "SALE", `${p.name} abandona el campo`, p.team, p); } return; }
    if (S.phase === "exit") {
      const spd = S.injured ? 2.2 : 3.6;
      if (!S.leftPitch) { if (walk(S.exit.x, S.exit.z, spd)) S.leftPitch = true; }
      else if (walk(S.bench.x, S.bench.z, spd)) { p.tlmHid = true; S.phase = "swap"; S.t = 0; }
      if (S.t > 40) S.phase = "swap"; // salvavidas
      return;
    }
    if (S.phase === "swap") {
      // el saliente ya está fuera y oculto: recién ahora el suplente pasa a ser el jugador del hueco
      const q = S.q, inn = this.bench[q.team][S.benchIdx], outName = p.name, outPid = p.tlmPid, outStamina = p.stamina;
      const m = this.tlmMin[outPid]; if (m) { m.off = this.time; m.stamina = outStamina; }
      this.bench[q.team].splice(S.benchIdx, 1);
      this.tlmAssign(p, { ...inn, stats: inn.stats, personality: inn.personality, pid: inn.tlmPid, name: inn.name, fullName: inn.fullName, number: inn.number, heightM: inn.heightM, stamina: 100, card: inn.card, overall: inn.overall, primaryPosition: inn.primaryPosition, morale: inn.morale }, p.team);
      p.subbedIn = true; p.tlmHid = false; p.tlmHidden = false; p.sprinting = false; p.timer = 0; p.action = 0; p.tl = null;
      this.tlmMin[inn.tlmPid] = { team: p.team, on: this.time, off: null, start: false };
      this.tlmSubsDone.push({ team: p.team, minute: DM.floor(this.time / 60), outPid, inPid: inn.tlmPid });
      this.subsUsed[q.team]++; this.tlmSubQ = this.tlmSubQ.filter((c) => c !== q);
      S.outName = outName; S.outPid = outPid; S.phase = "enter"; S.t = 0; S.entered = false;
      p.vx = p.vz = 0;
      this.onTlmSwap && this.onTlmSwap(p.id, p);
      this.event("player_entry", "ENTRA", `${p.name} espera en la banda`, p.team, p);
      return;
    }
    if (S.phase === "enter") {
      const slot = this.formationSlot(p.team, p.index), dir = this.direction(p.team), tx = slot[0] * dir, tz = slot[1] * dir;
      if (!S.entered) { if (walk(S.exit.x, S.exit.z, 3.4)) S.entered = true; }
      else if (walk(tx, tz, 4.2) || S.t > 14) S.phase = "done";
      if (S.t > 30) S.phase = "done";
      return;
    }
    if (S.phase === "done") {
      const q = S.q;
      this.event("sub", "CAMBIO", `${p.name} entra por ${S.outName} (${q.reason})`, q.team, p, { applied: true, outPid: S.outPid, inPid: p.tlmPid });
      p.tlmSubbing = false;
      this.tlmSubSeq = null; p.state = "Positioning";
    }
  },
  // Sustituciones automáticas (mismas reglas que checkSubs original) pero encoladas: nunca un "swap" instantáneo.
  checkSubs() {
    if (this.elapsed - this.lastSubCheck < 6) return;
    this.lastSubCheck = this.elapsed;
    for (let t = 0; t < 2; t++) {
      const side = this.tlmCfg ? [this.tlmCfg.home, this.tlmCfg.away][t] : null;
      if (side && side.controlledBy === "user" && !(side.matchPlan && side.matchPlan.autoSubs)) continue; // el usuario decide sus cambios (salvo que active el asistente; la lesión siempre fuerza el cambio)
      const used = this.subsUsed[t] + (this.tlmSubQ || []).filter((q) => q.team === t).length;
      if (used >= this.maxSubs || !this.bench[t].length || (this.tlmSubQ || []).some((q) => q.team === t)) continue;
      const on = this.players.filter((o) => o.team === t && !o.sentOff && o.role !== "GK"), diff = this.score[t] - this.score[1 - t], min = this.time / 60;
      let r = null, why = "cansancio";
      const dial = this.liveTactics ? this.liveTactics[t].active.substitutionPolicy : 0, th = te(58 - dial * 6, 44, 68);
      const tired = on.slice().sort((a, b) => a.stamina - b.stamina)[0];
      if (tired && tired.stamina < th && min > 55) r = tired;
      else if (min > 62 && diff < 0) { const c = on.filter((l) => l.role !== "FWD").sort((a, b) => a.stats.shooting - b.stats.shooting)[0]; if (c && this.bench[t].some((l) => l.role === "FWD")) { r = c; why = "cambio ofensivo"; } }
      else if (min > 70 && diff > 0) { const c = on.filter((l) => l.role === "FWD").sort((a, b) => a.stats.defense - b.stats.defense)[0]; if (c && this.bench[t].some((l) => l.role === "DEF")) { r = c; why = "cambio defensivo"; } }
      else { const c = on.find((l) => l.cards.yellow >= 1 && l.personality.aggression > 72 && l.stamina < 74 && min > 55); if (c) { r = c; why = "riesgo de expulsión"; } }
      if (!r && min > 75 && used === 0) { const c = on.slice().sort((a, b) => a.stamina - b.stamina)[0]; if (c && c.stamina < 70) r = c; }
      if (!r) continue;
      const want = why === "cambio ofensivo" ? "FWD" : why === "cambio defensivo" ? "DEF" : r.role;
      let bi = this.bench[t].findIndex((l) => l.role === want); if (bi < 0) bi = this.bench[t].findIndex((l) => l.role !== "GK"); if (bi < 0) continue;
      this.tlmRequestSub(t, r.id, bi, why);
    }
  },
  requestSubstitution(team, outId, reason = "táctico") {
    const out = this.players.find((p) => p.id === outId && p.team === team); if (!out) return false;
    let bi = this.bench[team].findIndex((l) => l.role === out.role); if (bi < 0) bi = this.bench[team].findIndex((l) => l.role !== "GK"); if (bi < 0) return false;
    return this.tlmRequestSub(team, outId, bi, reason).ok;
  },
  forceInjurySub(p) {
    const t = p.team, used = this.subsUsed[t] + (this.tlmSubQ || []).filter((q) => q.team === t).length;
    let bi = this.bench[t].findIndex((l) => l.role === p.role); if (bi < 0) bi = this.bench[t].findIndex((l) => l.role !== "GK");
    if (used >= this.maxSubs || bi < 0) { this.event("injury", "SIGUE EN CANCHA", `${p.name} continúa en el partido pese al golpe`, t, p); return; }
    const r = this.tlmRequestSub(t, p.id, bi, "lesión", { urgent: true, force: p.role === "GK" });
    if (r.ok) this.tlmSubQ.unshift(this.tlmSubQ.pop());
  },
  // ---------- RESULTADO ----------
  tlmResult() {
    const cfg = this.tlmCfg; if (!cfg) return null;
    const st = this.stats, tot = st[0].possession + st[1].possession || 1, log = this.tlmLog || [], ps = {};
    const P = (pid, team) => (ps[pid] = ps[pid] || { pid, team, minutes: 0, start: false, goals: 0, assists: 0, shots: 0, saves: 0, fouls: 0, yellow: 0, red: 0, tackles: 0, passes: 0, rating: 0, cleanSheet: false });
    const end = DM.round(this.time / 60 * 100) / 100, endMin = DM.min(90, DM.max(1, end));
    for (const pid in this.tlmMin) { const m = this.tlmMin[pid], s = P(pid, m.team); s.start = !!m.start; const off = m.off != null ? m.off / 60 : endMin; s.minutes = DM.max(0, DM.round(DM.min(90, off) - m.on / 60)); if (m.sentOffAt != null) s.minutes = DM.min(s.minutes, DM.round(m.sentOffAt / 60)); }
    const timeline = [], goalScorers = [];
    for (const e of log) {
      const minute = DM.max(1, DM.min(90, DM.ceil(e.t / 60)));
      if (e.type === "goal" && e.pid) { P(e.pid, e.team).goals++; if (e.assistPid) P(e.assistPid, e.team).assists++; goalScorers.push({ pid: e.pid, team: e.team, minute, assistPid: e.assistPid || null }); timeline.push({ minute, type: "goal", team: e.team, pid: e.pid, assist: e.assistPid || null, text: e.detail }); }
      else if (e.type === "shot" && e.pid) P(e.pid, e.team).shots++;
      else if (e.type === "save" && e.pid) P(e.pid, e.team).saves++;
      else if (e.type === "foul" && e.pid) P(e.pid, e.team).fouls++;
      else if ((e.type === "tackle" || e.type === "intercept") && e.pid) P(e.pid, e.team).tackles++;
      else if (e.type === "card" && e.pid) { const red = /ROJA/.test(e.title); const s = P(e.pid, e.team); if (red) { s.red = 1; if (this.tlmMin[e.pid]) this.tlmMin[e.pid].sentOffAt = e.t; s.minutes = DM.min(s.minutes || 90, minute); } else s.yellow++; timeline.push({ minute, type: "card", team: e.team, pid: e.pid, red, text: e.detail }); }
      else if (e.type === "sub" && e.extra && e.extra.applied) timeline.push({ minute, type: "sub", team: e.team, pid: e.pid, text: e.detail });
    }
    for (const pid in this.tlmPS) if (ps[pid]) ps[pid].passes = this.tlmPS[pid].passes;
    // stamina final de los que siguen en cancha (para el desgaste físico posterior)
    for (const p of this.players) if (p.tlmPid && ps[p.tlmPid]) ps[p.tlmPid].staminaEnd = DM.round(p.stamina);
    for (const pid in this.tlmMin) { const m = this.tlmMin[pid]; if (m.off != null && m.stamina != null && ps[pid]) ps[pid].staminaEnd = DM.round(m.stamina); }
    for (let t = 0; t < 2; t++) { const g0 = (t === 0 ? cfg.home : cfg.away).startingXI[0], gs = g0 && ps[g0.pid]; if (gs && gs.minutes > 0) gs.cleanSheet = this.score[1 - t] === 0; }
    const acc = (t) => (st[t].passes ? DM.round((st[t].completed / st[t].passes) * 100) : 0);
    const lineups = [cfg.home, cfg.away].map((s, t) => ({ team: t, xi: s.startingXI.map((x) => x && x.pid), bench: s.bench.map((x) => x.pid) }));
    timeline.sort((a, b) => a.minute - b.minute);
    return { fixtureId: cfg.fixtureId, homeClubId: cfg.homeClubId, awayClubId: cfg.awayClubId, score: this.score.slice(), possession: [DM.round((st[0].possession / tot) * 100), 100 - DM.round((st[0].possession / tot) * 100)],
      shots: [st[0].shots, st[1].shots], shotsOnTarget: [st[0].onTarget, st[1].onTarget], xg: [+(st[0].xg || 0).toFixed(2), +(st[1].xg || 0).toFixed(2)], passes: [st[0].passes, st[1].passes], passAccuracy: [acc(0), acc(1)],
      yellow: [st[0].yellow, st[1].yellow], red: [st[0].red, st[1].red], fouls: [st[0].fouls, st[1].fouls], corners: [st[0].corners, st[1].corners], offsides: [st[0].offside, st[1].offside], saves: [st[0].saves, st[1].saves],
      goalScorers, eventTimeline: timeline, substitutions: (this.tlmSubsDone || []).slice(), injuries: (this.tlmInj || []).map((i) => ({ pid: i.pid, severity: i.severity })), playerStats: ps, events: timeline, lineups,
      channels: [0, 1].map((t) => ({ left: st[t].attacksByChannel.left, center: st[t].attacksByChannel.center, right: st[t].attacksByChannel.right })), source: "engine", penalties: [st[0].penalties, st[1].penalties], pens: this.shootout ? this.shootout.score.slice() : null, pensSeq: this.shootout ? this.shootout.kicks.map((k) => k.slice()) : null };
  },
});
// <<TLM_ENGINE_LOCAL>>

// <<TLM_ENGINE_END>>
return wc;
}
