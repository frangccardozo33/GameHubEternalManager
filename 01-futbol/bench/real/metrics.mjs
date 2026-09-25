// Métricas de calibración sobre tracking (real o simulado) — Fase 20/21.
// Ambas fuentes se normalizan al MISMO formato de frames y pasan por la MISMA función, así la comparación es simétrica:
//   frame = { t, home: [{id,x,z}], away: [{id,x,z}], ball: {x,z} }   (metros, campo 105×68 centrado; x,z pueden ser NaN si falta el dato)
// Los datos reales sirven de baseline APROXIMADO: no se copian distribuciones literales entre competiciones.
const hyp = Math.hypot;
const pct = (a, q) => { const s = a.filter(Number.isFinite).sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : NaN; };
const mean = (a) => { const s = a.filter(Number.isFinite); return s.length ? s.reduce((x, y) => x + y, 0) / s.length : NaN; };

// velocidad/aceleración por diferencias centrales sobre una ventana (suaviza el ruido del tracking)
function kinematics(track, dt, w = 2) {
  const n = track.length, sp = new Float32Array(n).fill(NaN), ac = new Float32Array(n).fill(NaN);
  for (let i = w; i < n - w; i++) {
    const a = track[i - w], b = track[i + w];
    if (!a || !b || !Number.isFinite(a.x) || !Number.isFinite(b.x)) continue;
    sp[i] = hyp((b.x - a.x) / (2 * w * dt), (b.z - a.z) / (2 * w * dt));
  }
  for (let i = w; i < n - w; i++) if (Number.isFinite(sp[i - 1]) && Number.isFinite(sp[i + 1])) ac[i] = (sp[i + 1] - sp[i - 1]) / (2 * dt);
  return { sp, ac };
}

export function computeMetrics(frames, { fps = 10, label = "" } = {}) {
  const dt = 1 / fps, out = { label, frames: frames.length, minutes: +((frames.length * dt) / 60).toFixed(1) };
  const teams = ["home", "away"], ids = {};
  for (const tm of teams) { const set = new Set(); for (const f of frames) for (const p of f[tm]) set.add(p.id); ids[tm] = [...set]; }
  const tracks = {};
  for (const tm of teams) for (const id of ids[tm]) tracks[tm + id] = frames.map((f) => f[tm].find((p) => p.id === id) || null);
  const speeds = [], accs = [];
  let sprintRuns = 0, standing = 0, walk = 0, jog = 0, run = 0, spr = 0, nS = 0;
  for (const k in tracks) {
    const K = kinematics(tracks[k], dt);
    let runFrames = 0;
    for (let i = 0; i < K.sp.length; i++) {
      const v = K.sp[i];
      if (!Number.isFinite(v) || v > 13) continue;
      speeds.push(v); nS++;
      if (v < 0.6) standing++; else if (v < 2) walk++; else if (v < 4.2) jog++; else if (v < 6.5) run++; else spr++;
      if (Number.isFinite(K.ac[i]) && Math.abs(K.ac[i]) < 12) accs.push(K.ac[i]);
      if (v > 7) runFrames++; else { if (runFrames >= fps) sprintRuns++; runFrames = 0; }
    }
  }
  let vmax = 0; for (const v of speeds) if (v > vmax) vmax = v;
  out.speed = { mean: +mean(speeds).toFixed(2), p50: +pct(speeds, 0.5).toFixed(2), p90: +pct(speeds, 0.9).toFixed(2), p99: +pct(speeds, 0.99).toFixed(2), max: +vmax.toFixed(2) };
  out.tierPct = { STANDING: +((100 * standing) / nS).toFixed(1), WALK: +((100 * walk) / nS).toFixed(1), JOG: +((100 * jog) / nS).toFixed(1), RUN: +((100 * run) / nS).toFixed(1), SPRINT: +((100 * spr) / nS).toFixed(1) };
  out.accel = { p95: +pct(accs, 0.95).toFixed(2), p99: +pct(accs, 0.99).toFixed(2), decelP01: +pct(accs, 0.01).toFixed(2) };
  out.sprintRunsPerPlayer10min = +(sprintRuns / Object.keys(tracks).length / Math.max(0.1, out.minutes / 10)).toFixed(2);
  // poseedor = jugador más cercano a la pelota (si < 2.2 m); defensores cercanos, presión, spacing
  const dDef = [], nDef5 = [], width = [], depth = [], lineGap = [], spacing = [], possDur = [], ctlToPress = [];
  let curTeam = null, curLen = 0, recvAt = null;
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i], b = f.ball;
    if (!b || !Number.isFinite(b.x)) continue;
    let best = null, bd = 99, bt = null;
    for (const tm of teams) for (const p of f[tm]) { if (!Number.isFinite(p.x)) continue; const d = hyp(p.x - b.x, p.z - b.z); if (d < bd) { bd = d; best = p; bt = tm; } }
    if (best && bd < 2.2) {
      const opp = bt === "home" ? "away" : "home";
      let m1 = 99, c5 = 0;
      for (const q of f[opp]) { if (!Number.isFinite(q.x)) continue; const d = hyp(q.x - best.x, q.z - best.z); if (d < m1) m1 = d; if (d < 5) c5++; }
      dDef.push(m1); nDef5.push(c5);
      if (bt !== curTeam) { if (curTeam && curLen > 0) possDur.push(curLen * dt); curTeam = bt; curLen = 0; recvAt = i; }
      curLen++;
      if (recvAt != null && m1 < 3.5 && i > recvAt) { ctlToPress.push((i - recvAt) * dt); recvAt = null; }
    } else if (curTeam && bd > 6) { if (curLen > 0) possDur.push(curLen * dt); curTeam = null; curLen = 0; }
    if (i % Math.max(1, Math.round(fps)) === 0) for (const tm of teams) {
      const ps = f[tm].filter((p) => Number.isFinite(p.x));
      if (ps.length < 8) continue;
      const xs = ps.map((p) => p.x).sort((a, c) => a - c), zs = ps.map((p) => p.z).sort((a, c) => a - c);
      width.push(zs[zs.length - 2] - zs[1]); depth.push(xs[xs.length - 2] - xs[1]);
      const o = xs.slice(1, -1);
      lineGap.push(mean([o[2] - o[0], o[5] - o[3], o[8] - o[6]]));
      let sp = 0;
      for (let a = 0; a < ps.length; a++) { let m = 99; for (let bb = 0; bb < ps.length; bb++) if (a !== bb) m = Math.min(m, hyp(ps[a].x - ps[bb].x, ps[a].z - ps[bb].z)); sp += m; }
      spacing.push(sp / ps.length);
    }
  }
  out.carrierPressure = { defDistMedian: +pct(dDef, 0.5).toFixed(2), defDistP25: +pct(dDef, 0.25).toFixed(2), defDistP75: +pct(dDef, 0.75).toFixed(2), defWithin5m: +mean(nDef5).toFixed(2), timeReceptionToPressure: +pct(ctlToPress, 0.5).toFixed(2) };
  out.possession = { durationMedian: +pct(possDur, 0.5).toFixed(2), durationP90: +pct(possDur, 0.9).toFixed(2) };
  out.shape = { width: +mean(width).toFixed(1), depth: +mean(depth).toFixed(1), meanNearestMate: +mean(spacing).toFixed(1), rowSpacing: +mean(lineGap).toFixed(1) };
  return out;
}

export function compare(a, b) {
  const rows = [];
  const walk = (x, y, p) => {
    for (const k of Object.keys(x)) {
      if (typeof x[k] === "object" && x[k]) walk(x[k], (y || {})[k] || {}, p + k + ".");
      else if (typeof x[k] === "number") rows.push([p + k, x[k], (y || {})[k]]);
    }
  };
  walk(a, b, "");
  return rows;
}
export function printComparison(a, b, na = "real", nb = "motor") {
  console.log("métrica".padEnd(34), na.padStart(10), nb.padStart(10), "  ratio");
  for (const [k, x, y] of compare(a, b)) console.log(k.padEnd(34), String(x).padStart(10), String(y).padStart(10), "  ", Number.isFinite(y / x) ? (y / x).toFixed(2) : "-");
}
