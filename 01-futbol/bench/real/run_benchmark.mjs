// Compara el motor con tracking REAL (Metrica) o valida el pipeline sin descargas.
//   node bench/real/run_benchmark.mjs --selftest                                  (round-trip sintético: motor → CSV Metrica → parser → métricas)
//   node bench/real/run_benchmark.mjs --metrica bench/real/data/Sample_Game_1     (requiere fetch_samples.mjs metrica)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computeMetrics, printComparison } from "./metrics.mjs";
import { parseTracking, mergeTracking, parseEvents, passMetrics } from "./parse_metrica.mjs";
import { engineFrames } from "./engine_frames.mjs";
const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : null; };
const seeds = (arg("--seeds") || "21").split(",").map(Number), secs = +(arg("--seconds") || 600);

if (process.argv.includes("--selftest")) {
  const { frames } = engineFrames(seeds[0], { seconds: 120 });
  const dirTmp = path.join(here, "data");
  fs.mkdirSync(dirTmp, { recursive: true });
  const write = (tm, name) => {
    const ids = frames[0][tm].map((p) => p.id), head = ["Period,Frame,Time [s]", ...ids.flatMap((i) => [i, ""]), "Ball,"].join(",");
    const rows = frames.map((f, i) => ["1", i + 1, f.t.toFixed(2), ...f[tm].flatMap((p) => [((p.x + 52.5) / 105).toFixed(5), ((p.z + 34) / 68).toFixed(5)]), ((f.ball.x + 52.5) / 105).toFixed(5), ((f.ball.z + 34) / 68).toFixed(5)].join(","));
    const file = path.join(dirTmp, name);
    fs.writeFileSync(file, ["Home,,,,,,", head, ...rows].join("\n"));
    return file;
  };
  const h = parseTracking(write("home", "selftest_home.csv"), "home"), a = parseTracking(write("away", "selftest_away.csv"), "away");
  const back = computeMetrics(mergeTracking(h, a), { fps: 10, label: "roundtrip" }), direct = computeMetrics(frames, { fps: 10, label: "direct" });
  const get = (o, k) => k.split(".").reduce((x, y) => x[y], o);
  const bad = ["speed.mean", "speed.p90", "carrierPressure.defDistMedian", "shape.width", "shape.depth"].filter((k) => Math.abs(get(back, k) - get(direct, k)) > 0.05);
  console.log(bad.length ? "SELFTEST FALLÓ: " + bad.join(",") : "SELFTEST OK: parser Metrica + métricas reproducen el partido exportado");
  console.log(JSON.stringify(back.speed), JSON.stringify(back.carrierPressure));
  process.exit(bad.length ? 1 : 0);
}
const base = arg("--metrica");
const eng = computeMetrics(engineFrames(seeds[0], { seconds: secs }).frames, { fps: 10, label: "motor seed " + seeds[0] });
if (!base) { console.log("Motor (sin datos reales): ", JSON.stringify(eng, null, 1), "\nUso: --metrica <prefijo> | --selftest"); process.exit(0); }
const home = parseTracking(base + "_RawTrackingData_Home_Team.csv", "home"), away = parseTracking(base + "_RawTrackingData_Away_Team.csv", "away"), merged = mergeTracking(home, away);
printComparison(computeMetrics(merged, { fps: 25, label: "Metrica" }), eng, "real", "motor");
if (fs.existsSync(base + "_RawEventsData.csv")) {
  const pm = passMetrics(merged, parseEvents(base + "_RawEventsData.csv"), 25), avg = (a) => (a.reduce((x, y) => x + y, 0) / Math.max(1, a.length)).toFixed(2);
  console.log("\nPases reales: n=" + pm.n, "longitud media", avg(pm.len), "m; viaje del receptor", avg(pm.recvTravel), "m; velocidad del receptor", avg(pm.recvSpeed), "m/s");
}
