// ANTES/DESPUÉS en escenas controladas (Fase 24): mismas posiciones, mismos jugadores, mismos seeds; motor anterior a la Fase 1
// (git HEAD, extraído a bench/results/fulbo_before.html) vs motor actual. Cada escena imprime un ejemplo cualitativo.
//   git show HEAD:fulboact/fulbo.html > bench/results/fulbo_before.html && node bench/before_after.mjs
import { loadEngine } from "../manager/headless.mjs";
import { loadEngineFrom } from "./harness.mjs";
const hyp = Math.hypot;
const AFTER = loadEngine(), BEFORE = loadEngineFrom(process.env.BEFORE_HTML || "bench/results/fulbo_before.html");
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];
function scene(E, seed, players, ownerIdx) {
  const m = new E(seed); m.start(); m.placePlayers(); const d0 = m.direction(0), used = new Set([0, 11]);
  for (const [i, adv, z, va = 0, vz = 0] of players) { const p = m.players[i]; p.x = adv * d0; p.z = z; p.vx = va * d0; p.vz = vz; p.stamina = 100; p.timer = 0; p.think = 0.05; p.ragdoll = null; used.add(i); p.angle = Math.atan2((p.team === 0 ? 1 : -1) * d0, 0); }
  let k = 0; for (const p of m.players) if (!used.has(p.id)) { p.x = (-46 + (k % 2) * 3) * d0; p.z = -30 + (k * 6) % 60; p.vx = p.vz = 0; k++; }
  m.owner = null; m.receiver = null; m.shot = null; m.pendingOffside = null; m.protectedUntil = 0; m.phase = "playing";
  if (ownerIdx != null) { const o = m.players[ownerIdx]; m.owner = o; m.lastTouch = o; o.controlAt = m.elapsed - 1; o.think = 4; m.ball = { x: o.x + 0.4 * d0, z: o.z, y: 0.13, vx: o.vx, vz: o.vz, vy: 0, spin: 0 }; }
  m.ai2UpdatePitch(1 / 12);
  return m;
}
const run = (m, s, cb) => { for (let i = 0; i < Math.round(s * 60); i++) { m.step(1 / 60); if (cb && cb(i / 60) === true) break; } };
const avg = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
const rows = [];
const row = (name, before, after, note) => rows.push({ escena: name, antes: before, despues: after, nota: note });

// 1) 1v1: defensor a 6 m del poseedor que avanza — distancia mínima al poseedor en 2 s y % de escenas con contacto <1.6 m
for (const [nm, E] of [["antes", BEFORE], ["después", AFTER]]) {
  const mins = SEEDS.map((s) => { const m = scene(E, s, [[10, 16, 0, 4, 0], [14, 26, 0.5, 0, 0]], 10); m.players[10].think = 4; let dm = 99; run(m, 2, () => { dm = Math.min(dm, hyp(m.players[14].x - m.players[10].x, m.players[14].z - m.players[10].z)); }); return dm; });
  (nm === "antes" ? (globalThis._b1 = mins) : (globalThis._a1 = mins));
}
row("1v1: distancia mínima defensor–poseedor en 2 s (m, media)", avg(globalThis._b1).toFixed(2), avg(globalThis._a1).toFixed(2), "el defensor cierra en vez de acompañar");

// 2) Atacante en zona de tiro con defensor a 6 m que puede llegar: ¿cuánto tarda el defensor en estar a <2 m? (s, o >3 si nunca)
const tClose = (E) => SEEDS.map((s) => { const m = scene(E, s, [[10, 40, 3, 1, 0], [14, 46, 3]], 10); m.players[10].think = 0.6; let t2 = 3; run(m, 3, (t) => { if (m.owner !== m.players[10]) { t2 = Math.min(t2, t); return true; } if (hyp(m.players[14].x - m.players[10].x, m.players[14].z - m.players[10].z) < 2) { t2 = t; return true; } }); return t2; });
row("Tiro claro: tiempo hasta que el defensor está a <2 m o se corta el tiro (s, media)", avg(tClose(BEFORE)).toFixed(2), avg(tClose(AFTER)).toFixed(2), "defensa por peligro (timeToShot vs timeToContact)");

// 3) Pase bloqueado: rival parado sobre la línea. ¿El motor elige ese receptor? (passOption / candidatos)
const blocked = (E) => SEEDS.map((s) => { const m = scene(E, s, [[6, 0, 0], [7, 16, 0], [12, 8, 0.4]], 6); const o = m.passOption(m.players[6]); return !!(o && o.p === m.players[7]); });
row("Pase con rival sobre la línea: % de semillas donde igualmente se elige ese pase", (100 * blocked(BEFORE).filter(Boolean).length / 8).toFixed(0) + "%", (100 * blocked(AFTER).filter(Boolean).length / 8).toFixed(0) + "%", "el PassPlan lo descarta por margen temporal negativo");

// 4) Pase imposible a receptor lejano con rival más cerca del punto de recepción
const impossible = (E) => SEEDS.map((s) => { const m = scene(E, s, [[6, 0, 0], [9, 28, -6], [12, 22, -5]], 6); const o = m.passOption(m.players[6]); return !!(o && o.p === m.players[9]); });
row("Pase largo a receptor que un rival alcanza antes: % que se juega igual", (100 * impossible(BEFORE).filter(Boolean).length / 8).toFixed(0) + "%", (100 * impossible(AFTER).filter(Boolean).length / 8).toFixed(0) + "%", "");

// 5) Pase normal a 10 m: ¿cuánto recorre el receptor y llega? (pasando por pass() con el candidato que el motor elige)
const short = (E) => SEEDS.map((s) => { const m = scene(E, s, [[6, 0, 0], [7, 10, 2], [15, 30, -20]], 6), t = m.players[6], r = m.players[7], o = m.passOption(t); if (!o || o.p !== r) return { chosen: false }; const r0 = { x: r.x, z: r.z }; m.pass(t, o, false); let got = false; run(m, 3.5, () => { if (m.owner === r) { got = true; return true; } }); return { chosen: true, got, tr: hyp(r.x - r0.x, r.z - r0.z), spd: 0 }; });
const sb = short(BEFORE), sa = short(AFTER), f = (a) => { const g = a.filter((x) => x.chosen && x.got); return g.length ? avg(g.map((x) => x.tr)).toFixed(1) + " m (llegó " + g.length + "/" + a.filter((x) => x.chosen).length + ")" : "n/a"; };
row("Pase corto a 10 m: recorrido del receptor hasta controlar", f(sb), f(sa), "recepción al pie: no persigue la pelota");

// 6) Aceleración: tiempo a 90% de vmax en sprint (s) y frenada 8→0 (s)
const acc = (E) => { const m = new E(1); m.start(); const p = m.players[6]; p.stats.speed = 80; p.stats.acceleration = 80; p.x = -40; p.z = 0; p.vx = p.vz = 0; p.stamina = 100; let t90 = null, vmax = 0; const ref = 8.9 * 1.0; for (let i = 0; i < 480; i++) { p.sprinting = true; m.move(p, 45, 0, 1 / 60, 1); const v = hyp(p.vx, p.vz); vmax = Math.max(vmax, v); if (t90 == null && v >= 0.9 * vmax * 0 + 0.9 * 9.0) t90 = (i + 1) / 60; } return t90; };
row("Sprint: tiempo a 8.1 m/s (90% de ~9 m/s) (s)", acc(BEFORE)?.toFixed(2), acc(AFTER)?.toFixed(2), "curva de aceleración humana (auditada)");
console.log(JSON.stringify(rows, null, 1));
import fs from "node:fs"; fs.mkdirSync("bench/results", { recursive: true }); fs.writeFileSync("bench/results/before_after.json", JSON.stringify(rows, null, 1));
