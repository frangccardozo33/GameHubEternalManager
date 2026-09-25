// Arnés de benchmark del match engine (Fase 20-24): carga el motor headless y mide métricas
// de fútbol sobre partidos simulados con seeds fijos. Sirve para comparar ANTES/DESPUÉS.
import fs from "node:fs";
import { loadEngine } from "../manager/headless.mjs";
// BENCH_HTML=<ruta a un fulbo.html> permite medir otra versión del motor (p.ej. la anterior a la Fase 1) con las MISMAS métricas.
export function loadEngineFrom(file) {
  const h = fs.readFileSync(file, "utf8").split("\n");
  const a = h.findIndex((l) => /^\s{2}te = \(i, t, e\) =>/.test(l));
  let b = h.findIndex((l) => l.includes("// <<TLM_ENGINE_END>>"));
  if (b < 0) b = h.findIndex((l) => l.includes("// <<TLB_ENGINE_END>>"));
  const code = "const " + h.slice(a, b + 1).join("\n").trimStart() + "\nreturn wc;";
  const g = globalThis;
  g.window = g.window || g;
  return new Function("window", code)(g.window);
}
export const Engine = process.env.BENCH_HTML ? loadEngineFrom(process.env.BENCH_HTML) : loadEngine();
const hyp = Math.hypot;
export const pct = (a, q) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
export const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

// Corre un partido y recoge métricas. Observación pasiva: envuelve pass() sólo para registrar.
export function measureMatch(seed, { seconds = 900, setup } = {}) {
  const m = new Engine(seed);
  setup && setup(m);
  const M = {
    seed, frames: 0,
    tier: { STANDING: 0, WALK: 0, JOG: 0, RUN: 0, SPRINT: 0, BURST: 0 }, maxSpeed: 0, speedSum: 0, speedN: 0, sprintFrames: 0,
    passes: 0, complete: 0, lostToRival: 0, otherMate: 0, dead: 0, passDist: [], recvTravel: [], recvSpeedAvg: [], recvLate: 0,
    laneBlockedAtKick: 0, longNormal: 0, carrierPressDist: [], shotChanceFrames: 0, shotChanceDefFar: 0, chasers3: 0, chaseSamples: 0,
    thirdChaseFrames: 0, ownerFrames: 0, defClosing: [], tackleContacts: 0,
  };
  let pend = null;
  const origPass = m.pass.bind(m);
  m.pass = function (t, e, ...rest) {
    const r = e.p, d = hyp(r.x - t.x, r.z - t.z), opps = this.players.filter((q) => q.team !== t.team && !q.sentOff && q.role !== "GK");
    // bloqueo visible al soltar: rival a <1.2 m de la trayectoria real hacia (e.x,e.z)
    let blocked = false;
    const dx = e.x - t.x, dz = e.z - t.z, L2 = dx * dx + dz * dz || 1;
    for (const q of opps) { const u = Math.min(1, Math.max(0, ((q.x - t.x) * dx + (q.z - t.z) * dz) / L2)); if (u > 0.08 && u < 0.95 && hyp(q.x - (t.x + u * dx), q.z - (t.z + u * dz)) < 1.2 && !e.loft) blocked = true; }
    pend = { at: this.elapsed, passer: t, recv: r, d, tgt: { x: e.x, z: e.z }, r0: { x: r.x, z: r.z }, loft: !!e.loft, kind: e.kind, dist: hyp(e.x - t.x, e.z - t.z), blocked, spd: 0, n: 0 };
    M.passes++; M.passDist.push(pend.dist);
    if (blocked) M.laneBlockedAtKick++;
    if (pend.dist > 22 && !["through", "switch", "cross"].includes(e.kind)) M.longNormal++;
    return origPass(t, e, ...rest);
  };
  m.start();
  const dt = 1 / 60, N = seconds * 60;
  let n = 0;
  const t0 = performance.now();
  while (!m.ended && n++ < N) {
    m.step(dt);
    M.frames++;
    for (const p of m.players) {
      if (p.sentOff || p.role === "GK") continue;
      const sp = hyp(p.vx, p.vz);
      M.tier[p.speedTier || "STANDING"]++;
      if (sp > M.maxSpeed) M.maxSpeed = sp;
      M.speedSum += sp; M.speedN++;
      if (p.sprinting) M.sprintFrames++;
    }
    if (pend) {
      pend.spd += hyp(pend.recv.vx, pend.recv.vz); pend.n++;
      if (m.owner && m.elapsed - pend.at > 0.08) {
        if (m.owner.team !== pend.passer.team) M.lostToRival++;
        else if (m.owner === pend.recv) { M.complete++; M.recvTravel.push(hyp(pend.recv.x - pend.r0.x, pend.recv.z - pend.r0.z)); M.recvSpeedAvg.push(pend.spd / pend.n); }
        else M.otherMate++;
        pend = null;
      } else if (m.elapsed - pend.at > 4.5 || m.phase !== "playing") { M.dead++; pend = null; }
    }
    if (m.owner && m.owner.role !== "GK") {
      const o = m.owner;
      let dmin = 99;
      for (const q of m.players) if (q.team !== o.team && q.role !== "GK" && !q.sentOff) { const d = hyp(q.x - o.x, q.z - o.z); if (d < dmin) dmin = d; }
      M.carrierPressDist.push(dmin);
      const dir = m.direction(o.team), dg = hyp(52.5 * dir - o.x, o.z);
      if (dg < 26 && Math.abs(o.z) < 20 && o.x * dir > 22) { M.shotChanceFrames++; if (dmin > 3.5) M.shotChanceDefFar++; }
      // cuántos jugadores rivales de la mitad "corren a la pelota" (dist<12 y con velocidad hacia el balón)
      let chasers = 0;
      for (const q of m.players) if (q.team !== o.team && q.role !== "GK" && !q.sentOff) { const d = hyp(q.x - o.x, q.z - o.z); if (d < 14 && d > 0.1 && (q.vx * (o.x - q.x) + q.vz * (o.z - q.z)) / d > 2.5) chasers++; }
      M.ownerFrames++; if (chasers >= 3) M.thirdChaseFrames++;
    }
  }
  M.ms = performance.now() - t0;
  M.match = m;
  return M;
}
export function summarize(list) {
  const S = { n: list.length, frames: 0, passes: 0, complete: 0, lostToRival: 0, otherMate: 0, dead: 0, laneBlockedAtKick: 0, longNormal: 0, shotChanceFrames: 0, shotChanceDefFar: 0, ownerFrames: 0, thirdChaseFrames: 0, ms: 0 };
  const dist = [], press = [], trav = [], rspd = [], tier = {}, st = { tackles: 0, interceptions: 0, fouls: 0, shots: 0, goals: 0, saves: 0 };
  let max = 0, sprintF = 0, spN = 0, spSum = 0;
  for (const M of list) {
    for (const k of ["frames", "passes", "complete", "lostToRival", "otherMate", "dead", "laneBlockedAtKick", "longNormal", "shotChanceFrames", "shotChanceDefFar", "ownerFrames", "thirdChaseFrames", "ms"]) S[k] += M[k];
    dist.push(...M.passDist); press.push(...M.carrierPressDist); trav.push(...M.recvTravel); rspd.push(...M.recvSpeedAvg);
    for (const k in M.tier) tier[k] = (tier[k] || 0) + M.tier[k];
    max = Math.max(max, M.maxSpeed); sprintF += M.sprintFrames; spN += M.speedN; spSum += M.speedSum;
    for (const t of [0, 1]) { const s = M.match.stats[t]; st.tackles += s.tackles || 0; st.fouls += s.fouls || 0; st.shots += s.shots || 0; st.saves += s.saves || 0; st.goals += M.match.score ? 0 : 0; }
    const tel = M.match.ai2Telemetry ? M.match.ai2Telemetry() : null;
  }
  const tot = Object.values(tier).reduce((a, b) => a + b, 0) || 1;
  return { ...S, passDistMean: mean(dist), passDistP90: pct(dist, 0.9), pressDistMedian: pct(press, 0.5), pressDistP25: pct(press, 0.25), pressDistP75: pct(press, 0.75),
    completePct: S.complete / Math.max(1, S.passes), lostPct: S.lostToRival / Math.max(1, S.passes), lanePct: S.laneBlockedAtKick / Math.max(1, S.passes),
    shotChanceDefFarPct: S.shotChanceDefFar / Math.max(1, S.shotChanceFrames), threeChasePct: S.thirdChaseFrames / Math.max(1, S.ownerFrames),
    recvTravelMean: mean(trav), recvSpeedMean: mean(rspd), tierPct: Object.fromEntries(Object.entries(tier).map(([k, v]) => [k, +(100 * v / tot).toFixed(1)])),
    meanSpeed: spSum / Math.max(1, spN), maxSpeed: max, sprintOrderPct: sprintF / Math.max(1, spN), tackles: st.tackles, fouls: st.fouls, shots: st.shots, saves: st.saves };
}
