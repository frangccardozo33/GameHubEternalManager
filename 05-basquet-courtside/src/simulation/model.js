// World units are metres; time is seconds. X is court length, Z court width.
export const COURT = { halfLength: 14, halfWidth: 7.5, hoopX: 12.425, rimY: 3.05, rimRadius: 0.23, ballRadius: 0.12 };
export const DEFAULT_RULES = {
  periodSeconds: 180, periods: 4, shotClock: 24, offensiveReset: 14,
  foulLimit: 5, bonusFouls: 5, overtimeSeconds: 120, timeouts: 2,
};
export const STYLES = {
  'PACE & SPACE': { pace: 1.05, three: 1.35, drive: 0.8, pass: 1.2, plays: ['motion', 'pickPop', 'cut', 'motion', 'drive'] },
  'INTERIOR': { pace: 0.88, three: 0.65, drive: 1.15, pass: 0.9, plays: ['post', 'post', 'cut', 'pickRoll', 'drive'] },
  'PICK & ROLL': { pace: 0.97, three: 0.9, drive: 1.05, pass: 1.2, plays: ['pickRoll', 'pickRoll', 'pickPop', 'drive', 'cut'] },
  'TRANSITION': { pace: 1.25, three: 1, drive: 1.3, pass: 1.2, plays: ['drive', 'cut', 'pickRoll', 'motion'] },
  'BALANCED': { pace: 1, three: 1, drive: 1, pass: 1, plays: ['motion', 'pickRoll', 'pickPop', 'cut', 'post', 'drive'] },
};
export const PLAY_NAMES = { motion: 'Circulación', pickRoll: 'Pick & roll', pickPop: 'Pick & pop', cut: 'Corte al aro', drive: 'Penetración', post: 'Juego al poste', transition: 'Transición rápida' };
// Constantes de calibración del motor (1 = neutro). Las tácticas del manager se aplican por encima.
export const TUNING = { intercept: 0.15 };
export const defaultTactics = () => ({
  tempo: 50, inside: 50, pickRoll: 50, transition: 50, ballMovement: 50, shotRim: 50, shotMid: 50, shotThree: 50,
  aggression: 50, offReb: 50, defense: 'man', pressure: 50, switching: 'screens',
});
export const defaultPlan = () => ({ closer: null, foulPolicy: 'normal', staminaPolicy: 'normal' });
export const textOn = hex => { const n = parseInt(hex.slice(1), 16), l = ((n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114); return l > 150 ? '#17252b' : '#fff5e6'; };
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export const lerp = (a, b, t) => a + (b - a) * t;
export const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export const normalize = (x, z) => { const d = Math.hypot(x, z) || 1; return { x: x / d, z: z / d }; };
export function segmentDistance(p, a, b) {
  const dx = b.x - a.x, dz = b.z - a.z;
  const t = clamp(((p.x - a.x) * dx + (p.z - a.z) * dz) / (dx * dx + dz * dz || 1), 0, 1);
  return distance(p, { x: a.x + dx * t, z: a.z + dz * t });
}
export class Random {
  constructor(seed = 41) { this.state = seed >>> 0; }
  next() { let t = this.state += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  range(a, b) { return lerp(a, b, this.next()); }
  pick(items) { return items[Math.floor(this.next() * items.length)]; }
}
export const NAMES = [
  ['D. Vega', 'M. Brooks', 'J. Silva', 'A. Carter', 'N. Okafor', 'L. Reed', 'I. Martín', 'T. Young'],
  ['K. Hayes', 'R. Cruz', 'E. Williams', 'D. Sato', 'A. Diallo', 'S. Cole', 'M. Torres', 'J. Park'],
];
export const BASE_RATINGS = [
  [86, 86, 89, 89, 78, 79, 80, 77, 77, 49, 45, 91, 88, 61, 91],
  [84, 84, 80, 76, 86, 85, 87, 81, 80, 56, 51, 77, 80, 69, 87],
  [80, 78, 77, 78, 80, 83, 79, 83, 85, 72, 71, 79, 81, 80, 85],
  [73, 72, 68, 74, 75, 84, 68, 85, 75, 85, 87, 72, 78, 90, 82],
  [68, 66, 59, 66, 69, 86, 48, 89, 67, 90, 93, 70, 75, 94, 79],
];
export const ATTRIBUTES = ['speed', 'acceleration', 'handling', 'passing', 'shooting', 'two', 'three', 'finishing', 'defense', 'interiorDefense', 'rebounding', 'vision', 'decisions', 'physical', 'stamina'];
export class Player {
  constructor(team, index, random, data = null) {
    this.id = `${team}-${index}`; this.team = team; this.index = index; this.pid = data?.pid ?? null;
    this.role = data?.role ?? ['PG', 'SG', 'SF', 'PF', 'C'][index % 5]; this.name = data?.name ?? NAMES[team][index];
    this.number = data?.number ?? [3, 11, 7, 23, 34, 2, 18, 9][index];
    this.height = data?.height ?? [1.86, 1.94, 2.01, 2.08, 2.16][index % 5];
    this.skin = data?.skin ?? null; this.teamLabel = null; this.numberColor = null;
    this.ratings = data ? { ...data.ratings } : Object.fromEntries(ATTRIBUTES.map((key, i) => [key, clamp(BASE_RATINGS[index % 5][i] + random.range(-7, 7) - (index > 4 ? 4 : 0), 35, 97)]));
    this.ovr = data?.ovr ?? Object.values(this.ratings).reduce((a, b) => a + b, 0) / ATTRIBUTES.length;
    this.x = 0; this.z = 0; this.vx = 0; this.vz = 0; this.facing = 0;
    this.target = { x: 0, z: 0 }; this.state = 'idle'; this.decision = 'Esperar';
    this.energy = data?.energy ?? 1; this.fouls = 0; this.active = data ? !!data.active : index < 5; this.slot = data?.slot ?? index;
    this.starter = this.active; this.targetMin = data?.targetMin ?? null; this.usage = data?.usage ?? 1; this.enteredAt = 0; this.stuck = 0;
    this.action = null; this.actionTime = 0; this.actionDuration = 0;
    this.hand = team ? -1 : 1; this.dribblePhase = 0; this.lastBounce = 0;
    this.heldTime = 0; this.cooldown = 0; this.driveUntil = 0; this.catchQuality = 1;
    this.mark = null; this.contact = 0; this.minutes = 0;
    this.stats = { points: 0, rebounds: 0, oreb: 0, assists: 0, steals: 0, blocks: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0, turnovers: 0, rimA: 0, rimM: 0, pm: 0 };
  }
  animate(name, duration) { this.action = name; this.actionTime = duration; this.actionDuration = duration; }
}
export class Team {
  constructor(id, random, spec = null) {
    this.id = id; this.name = spec?.name ?? (id ? 'COASTAL WAVES' : 'METRO FOXES'); this.short = spec?.short ?? (id ? 'WAV' : 'FOX');
    this.color = spec?.color ?? (id ? '#62b9b8' : '#ed743e'); this.style = spec?.style ?? (id ? 'PICK & ROLL' : 'PACE & SPACE');
    this.roster = spec ? spec.players.map((d, i) => new Player(id, i, random, d)) : Array.from({ length: 8 }, (_, i) => new Player(id, i, random));
    if (spec) for (const p of this.roster) { p.teamLabel = spec.label ?? this.short; p.numberColor = textOn(this.color); }
    this.score = 0; this.fouls = 0; this.timeouts = 2;
    this.tactics = { ...defaultTactics(), ...(spec?.tactics ?? {}) }; this.plan = { ...defaultPlan(), ...(spec?.plan ?? {}) };
    this.assignments = { ...(spec?.assignments ?? {}) }; this.subQueue = []; this._profile = null;
    this.stats = { possessions: 0, fga: 0, fgm: 0, tpa: 0, tpm: 0, fta: 0, ftm: 0, rebounds: 0, offensiveRebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, fastBreakPoints: 0, paintPoints: 0 };
  }
  get active() { return this.roster.filter(p => p.active).sort((a, b) => a.slot - b.slot); }
  // Perfil efectivo = estilo base x tácticas del manager. Con tácticas neutras (50) es idéntico al estilo original.
  get profile() { return this._profile ||= this.buildProfile(); }
  invalidate() { this._profile = null; }
  buildProfile() {
    const s = STYLES[this.style] || STYLES.BALANCED, t = this.tactics, k = v => 1 + (v - 50) * 0.012;
    const inside = (t.inside - 50) / 50, aggr = (t.aggression - 50) / 50, plays = [...s.plays];
    const roll = Math.round((t.pickRoll - 50) / 25), skew = Math.round(inside * 2);
    for (let i = 0; i < Math.abs(roll); i++) {
      if (roll > 0) plays.push('pickRoll', 'pickPop');
      else for (const type of ['pickRoll', 'pickPop']) { const at = plays.indexOf(type); if (at >= 0 && plays.length > 2) plays.splice(at, 1); }
    }
    for (let i = 0; i < Math.abs(skew); i++) plays.push(...(skew > 0 ? ['post', 'drive'] : ['motion', 'pickPop']));
    return {
      pace: s.pace * (1 + (t.tempo - 50) * 0.0072), three: s.three * k(t.shotThree) * (1 - 0.25 * inside), rim: k(t.shotRim) * (1 + 0.2 * inside), mid: k(t.shotMid),
      drive: s.drive * (1 + 0.25 * aggr) * (1 + 0.12 * inside), pass: s.pass * (1 + (t.ballMovement - 50) * 0.005), plays,
      transition: k(t.transition), tempo: t.tempo / 100,
    };
  }
}
export class Ball {
  constructor() {
    this.x = 0; this.y = 1.2; this.z = 0; this.vx = 0; this.vy = 0; this.vz = 0;
    this.mode = 'held'; this.owner = null; this.flight = null; this.looseTime = 0;
  }
}
