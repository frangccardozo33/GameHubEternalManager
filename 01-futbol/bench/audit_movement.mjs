// Fase 13/14: AUDITORÍA de velocidad/aceleración ANTES de tocar nada.
import { Engine, measureMatch, pct, mean } from "./harness.mjs";
const KMH = 3.6;
// 1) Física pura: jugador aislado corriendo hacia un punto lejano con distintos atributos y sprint on/off.
function isolated(speedAttr, accAttr, sprinting) {
  const m = new Engine(1); m.start();
  const p = m.players.find((q) => q.role === "MID" && q.team === 0);
  p.stats.speed = speedAttr; p.stats.acceleration = accAttr; p.stamina = 100;
  p.x = -40; p.z = 0; p.vx = p.vz = 0; p.timer = 0;
  const out = { t50: null, t75: null, t90: null, t99: null, vmax: 0 };
  let vmaxRef = null;
  for (let i = 0; i < 60 * 8; i++) {
    p.sprinting = sprinting;
    m.move(p, 45, 0, 1 / 60, 1);
    const v = Math.hypot(p.vx, p.vz), t = (i + 1) / 60;
    out.vmax = Math.max(out.vmax, v);
    p._v = v;
    if (i === 60 * 8 - 1) vmaxRef = out.vmax;
  }
  // segundo pase con referencia conocida
  const ref = out.vmax;
  p.x = -40; p.vx = p.vz = 0;
  for (let i = 0; i < 60 * 8; i++) {
    p.sprinting = sprinting;
    m.move(p, 45, 0, 1 / 60, 1);
    const v = Math.hypot(p.vx, p.vz), t = (i + 1) / 60;
    if (out.t50 == null && v >= 0.5 * ref) out.t50 = t;
    if (out.t75 == null && v >= 0.75 * ref) out.t75 = t;
    if (out.t90 == null && v >= 0.9 * ref) out.t90 = t;
    if (out.t99 == null && v >= 0.99 * ref) out.t99 = t;
  }
  return out;
}
console.log("== 1) FÍSICA AISLADA (m.move, r=1, sin orden de sprint / con sprint) ==");
for (const [sp, ac] of [[60, 60], [75, 75], [90, 90], [99, 99]])
  for (const s of [false, true]) {
    const o = isolated(sp, ac, s);
    console.log(`speed=${sp} acc=${ac} sprint=${s}: vmax=${o.vmax.toFixed(2)} m/s (${(o.vmax * KMH).toFixed(1)} km/h) t50=${o.t50?.toFixed(2)}s t75=${o.t75?.toFixed(2)}s t90=${o.t90?.toFixed(2)}s t99=${o.t99?.toFixed(2)}s`);
  }
console.log("\n== 2) COMPORTAMIENTO EN PARTIDO (tiempo por speedTier, frecuencia de sprint) ==");
const seeds = (process.argv[2] || "11,12,13").split(",").map(Number);
const agg = { tier: {}, max: 0, sprintF: 0, n: 0, sp: 0 };
for (const s of seeds) {
  const M = measureMatch(s, { seconds: +(process.argv[3] || 600) });
  for (const k in M.tier) agg.tier[k] = (agg.tier[k] || 0) + M.tier[k];
  agg.max = Math.max(agg.max, M.maxSpeed); agg.sprintF += M.sprintFrames; agg.n += M.speedN; agg.sp += M.speedSum;
}
const tot = Object.values(agg.tier).reduce((a, b) => a + b, 0);
for (const k in agg.tier) console.log(`${k.padEnd(9)} ${(100 * agg.tier[k] / tot).toFixed(1)}%`);
console.log(`velocidad media jugadores de campo: ${(agg.sp / agg.n).toFixed(2)} m/s (${(agg.sp / agg.n * KMH).toFixed(1)} km/h)`);
console.log(`velocidad máx observada: ${agg.max.toFixed(2)} m/s (${(agg.max * KMH).toFixed(1)} km/h)`);
console.log(`% de frames con orden de sprint: ${(100 * agg.sprintF / agg.n).toFixed(1)}%`);
console.log("Referencia real (tracking profesional): media ~ 1.5-2.0 m/s (5-7 km/h) incl. paradas; ~8-12% del tiempo >5.5 m/s (>20 km/h); picos 8.5-10 m/s (30-36 km/h); t90 aceleración ~2.5-3.5 s.");
