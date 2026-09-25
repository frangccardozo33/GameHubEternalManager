// Validador de circuitos de la Serie Nacional GT3. Uso:
//   node tools/check_circuit.mjs circuits/valleverde.json [más archivos…]
//   node tools/check_circuit.mjs circuits/circuits.json          (bundle con todos: { "<id>": {...} })
// Replica lo que hace el juego (Catmull-Rom cerrada, tensión 0,35) y comprueba las reglas que el juego NO puede arreglar solo
// (boxes, separación entre tramos, radio mínimo, distancia de los props). Sale con código 1 si algún circuito tiene errores.
import fs from "fs";
const files = process.argv.slice(2);
if (!files.length) { console.log("uso: node tools/check_circuit.mjs circuits/<id>.json …"); process.exit(2); }
const THEMES = ["grass", "desert", "coast", "forest", "city", "night", "mountain"];
const RANGES = { halfWidth: [6, 14], gripMod: [0.7, 1.3], brakingMod: [0.7, 1.4], aeroMod: [0.7, 1.4], overtakeDiff: [0.1, 0.95], wetChance: [0, 0.8], tempBase: [-10, 45], treeCount: [0, 320] };
const PROP_TYPES = { box: 1, cylinder: 1, cone: 1, sphere: 1, tree: 1, water: 1, grandstand: 1, sign: 1 };
const HEX = /^#[0-9a-f]{6}$/i;
// three.js CatmullRomCurve3 cerrada tipo 'catmullrom' (tensión 0,35): polinomio cúbico de Hermite por tramo
function sampleCurve(pts, perSeg = 48) {
  const n = pts.length, tension = 0.35, out = [];
  const poly = (x0, x1, t0, t1) => [x0, t0, -3 * x0 + 3 * x1 - 2 * t0 - t1, 2 * x0 - 2 * x1 + t0 + t1];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const px = poly(p1[0], p2[0], tension * (p2[0] - p0[0]), tension * (p3[0] - p1[0])), pz = poly(p1[1], p2[1], tension * (p2[1] - p0[1]), tension * (p3[1] - p1[1]));
    for (let k = 0; k < perSeg; k++) { const t = k / perSeg; out.push([px[0] + t * (px[1] + t * (px[2] + t * px[3])), pz[0] + t * (pz[1] + t * (pz[2] + t * pz[3]))]); }
  }
  return out;
}
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function segIntersect(a, b, c, d) { const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]); return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0; }
function check(id, d) {
  const err = [], warn = [], info = {};
  if (!d || typeof d !== "object") return { err: ["no es un objeto JSON"], warn, info };
  if (d.theme != null && !THEMES.includes(d.theme)) err.push("theme desconocido: " + d.theme);
  for (const k in RANGES) if (d[k] != null && !(d[k] >= RANGES[k][0] && d[k] <= RANGES[k][1])) err.push(`${k} fuera de rango ${RANGES[k].join("–")}: ${d[k]}`);
  for (const k of ["groundColor", "skyColor", "foliageColor"]) if (d[k] != null && !HEX.test(d[k])) err.push(k + " debe ser #rrggbb");
  const L = d.layout;
  if (!Array.isArray(L)) { err.push("falta layout"); return { err, warn, info }; }
  if (L.length < 8 || L.length > 60) err.push(`layout debe tener 8–60 puntos (tiene ${L.length})`);
  if (L.some((p) => !Array.isArray(p) || p.length !== 2 || !Number.isFinite(p[0]) || !Number.isFinite(p[1]) || Math.abs(p[0]) > 900 || Math.abs(p[1]) > 900)) { err.push("cada punto es [x,z] con |valor| ≤ 900"); return { err, warn, info }; }
  if (L.slice(0, 3).some((p) => Math.abs(p[1] - 135) > 0.5) || !(L[0][0] < L[1][0] && L[1][0] < L[2][0])) err.push("los tres primeros puntos deben estar sobre z = 135 y avanzar hacia +x (largada y boxes)");
  const hw = d.halfWidth || 8.5, pts = sampleCurve(L, 48);
  if (hw > 9.5) warn.push(`halfWidth ${hw}: con más de 9,5 el asfalto se superpone con el muro de boxes (lane +10,5)`);
  const last = L[L.length - 1]; if (Math.abs(last[1] - 135) > 6 || last[0] > -250) warn.push("el último punto debería estar sobre z = 135 con x < −250 (p. ej. [-300,135]) para que la parrilla no quede en curva");
  let len = 0; for (let i = 0; i < pts.length; i++) len += dist(pts[i], pts[(i + 1) % pts.length]);
  info.largoKm = +(len / 1000).toFixed(2);
  if (len < 1400 || len > 3400) err.push(`largo ${info.largoKm} km fuera de 1,6–3,2 km`);
  else if (len < 1600 || len > 3200) warn.push(`largo ${info.largoKm} km: apuntá a 1,6–3,2 km`);
  for (let i = 0; i < L.length; i++) if (dist(L[i], L[(i + 1) % L.length]) < 25) warn.push(`puntos ${i} y ${(i + 1) % L.length} a menos de 25 m (riesgo de lazo)`);
  // autointersección + separación entre tramos no consecutivos (el guardarraíl exterior está a 20 m, el de boxes a 40)
  const step = 4; let minSep = 1e9, cross = 0;
  // distancia recorrida REAL entre muestras (los tramos de la spline tienen largos muy distintos, así que no vale len/n)
  const n = pts.length, cum = [0]; for (let i = 1; i < n; i++) cum.push(cum[i - 1] + dist(pts[i - 1], pts[i]));
  const along = (i, j) => { const d = Math.abs(cum[i] - cum[j]); return Math.min(d, len - d); };
  for (let i = 0; i < n; i += step) for (let j = i + step; j < n; j += step) {
    if (along(i, j) < 140) continue; // tramos vecinos
    const dd = dist(pts[i], pts[j]); if (dd < minSep) minSep = dd;
    if (segIntersect(pts[i], pts[(i + step) % n], pts[j], pts[(j + step) % n])) cross++;
  }
  info.separacionMinima = +minSep.toFixed(0);
  if (cross) err.push(`el trazado se cruza a sí mismo (${cross} cruces)`);
  else if (minSep < 60) err.push(`hay tramos a ${minSep.toFixed(0)} m entre sí; el mínimo es 60 m`);
  // radio mínimo (por el ángulo entre tramos de ~15 m)
  let minR = 1e9;
  for (let i = 0; i < n; i++) {
    let ia = i, ic = i, k = 0; while (k++ < n && along(i, ia) < 15) ia = (ia - 1 + n) % n; k = 0; while (k++ < n && along(i, ic) < 15) ic = (ic + 1) % n;
    const a = pts[ia], b = pts[i], c = pts[ic];
    const ab = [b[0] - a[0], b[1] - a[1]], bc = [c[0] - b[0], c[1] - b[1]], ang = Math.abs(Math.atan2(ab[0] * bc[1] - ab[1] * bc[0], ab[0] * bc[0] + ab[1] * bc[1]));
    if (ang > 1e-3) minR = Math.min(minR, (dist(a, b) + dist(b, c)) / 2 / ang);
  }
  info.radioMinimo = +minR.toFixed(0);
  if (minR < hw + 2.5) err.push(`una curva tiene radio ${minR.toFixed(0)} m (< halfWidth + 2,5 = ${(hw + 2.5).toFixed(0)} m): el borde interior del asfalto se pliega sobre sí mismo`);
  else if (minR < 2.6 * hw) warn.push(`radio mínimo ${minR.toFixed(0)} m (< 2,6 × halfWidth): horquilla muy cerrada, sólo a ~40 km/h`);
  // recta de boxes: los primeros ~320 m deben ser rectos (z = 135 ± 2), hasta x ≈ 100
  for (let i = 0; i < n && pts[i][0] < 85; i++) if (pts[i][0] >= -150 && Math.abs(pts[i][1] - 135) > 4) { err.push(`la recta principal se curva antes de los 320 m (en x ≈ ${pts[i][0].toFixed(0)}): el carril de boxes necesita 30–295 m rectos`); break; }
  // zona de boxes: x -235…125, z 75…195 (carril de pit lane +10..+25, edificio lane 36, guardarraíl lane 40, tribuna lane −33)
  const PIT = { x0: -200, x1: 110, z0: 70, z1: 200 };
  for (let i = 0; i < n; i++) { const s = cum[i]; if (s < 340 || s > len - 100) continue; const p = pts[i]; if (p[0] > PIT.x0 && p[0] < PIT.x1 && p[1] > PIT.z0 && p[1] < PIT.z1) { err.push("otro tramo de pista entra en la zona de boxes (x −200…110, z 70…200)"); break; } }
  // props
  const P = d.props || [];
  if (!Array.isArray(P)) err.push("props debe ser una lista");
  else {
    if (P.length > 600) err.push(`props: ${P.length} (máximo 600)`);
    let onTrack = 0, inPit = 0, bad = 0;
    for (const [i, pr] of P.entries()) {
      if (!pr || !PROP_TYPES[pr.type]) { bad++; continue; }
      if (pr.color != null && !HEX.test(pr.color)) bad++;
      if (pr.type === "grandstand" || pr.type === "sign") { if (pr.type === "sign" && String(pr.text || "").length > 18) warn.push(`sign ${i}: texto de más de 18 caracteres (se recorta)`); continue; }
      const pp = [pr.x || 0, pr.z || 0]; let dm = 1e9; for (let k = 0; k < n; k += 2) dm = Math.min(dm, dist(pts[k], pp));
      const size = (pr.r ? pr.r : Math.min(pr.w || 99, pr.d || 99) / 2) * (pr.type === "tree" ? 0 : 1);
      if (pr.type !== "water" && dm - size < 22) { onTrack++; if (onTrack <= 3) warn.push(`  · prop #${i} ${pr.type} en (${pp[0]}, ${pp[1]}) queda a ${(dm - size).toFixed(0)} m de la pista`); }
      if (pr.type !== "water" && pp[0] > PIT.x0 && pp[0] < PIT.x1 && pp[1] > 84 && pp[1] < 132) { inPit++; if (inPit <= 3) warn.push(`  · prop #${i} ${pr.type} en (${pp[0]}, ${pp[1]}) está en la zona de boxes`); }
    }
    if (bad) err.push(`${bad} props con type desconocido o color inválido`);
    if (onTrack) err.push(`${onTrack} props a menos de 22 m del eje de la pista (invaden guardarraíl/asfalto)`);
    if (inPit) err.push(`${inPit} props dentro de la zona de boxes`);
    info.props = P.length;
  }
  if (!P.length) warn.push("sin props: el circuito queda con el decorado genérico");
  return { err, warn, info };
}
let bad = 0;
for (const f of files) {
  let j; try { j = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { console.log(`✗ ${f}: JSON inválido — ${e.message}`); bad++; continue; }
  const items = j && !j.layout && typeof j === "object" ? Object.entries(j).filter(([, v]) => v && typeof v === "object" && v.layout) : [[j.id || f, j]];
  for (const [id, d] of items) {
    const r = check(id, d);
    console.log(`${r.err.length ? "✗" : "✓"} ${id}  ${JSON.stringify(r.info)}`);
    r.err.forEach((e) => console.log("    ERROR  " + e)); r.warn.forEach((e) => console.log("    aviso  " + e));
    if (r.err.length) bad++;
  }
}
process.exit(bad ? 1 : 0);
