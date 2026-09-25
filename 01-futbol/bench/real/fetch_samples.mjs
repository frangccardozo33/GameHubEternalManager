// Descarga (opt-in, manual) de muestras públicas de tracking para calibrar. NO se ejecuta en el build ni en los tests.
// Uso: node bench/real/fetch_samples.mjs list | metrica     (metrica ≈ 3 CSV grandes; verificar tamaño antes de descargar)
// Fuentes (todas públicas):
//   metrica     https://github.com/metrica-sports/sample-data   (3 partidos, 25 FPS, campo 105×68)          ← soportado por parse_metrica.mjs
//   skillcorner https://github.com/SkillCorner/opendata          (10 partidos A-League 24/25, broadcast tracking + dynamic events)
//   driblab     https://github.com/driblab/open-data             (10 partidos 2025, 10 FPS: posiciones/velocidades/aceleraciones)
//   idsse       https://github.com/spoho-datascience/idsse-data  (7 partidos Bundesliga/2.Bundesliga, tracking + eventos)
// Para SkillCorner/Driblab/IDSSE: convertir a frames normalizados (ver metrics.mjs) y pasarlos a computeMetrics().
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "data");
const M = "https://raw.githubusercontent.com/metrica-sports/sample-data/master/data/Sample_Game_1/";
const SOURCES = { metrica: ["Sample_Game_1_RawTrackingData_Home_Team.csv", "Sample_Game_1_RawTrackingData_Away_Team.csv", "Sample_Game_1_RawEventsData.csv"].map((f) => M + f) };
const what = process.argv[2] || "list";
if (what === "list") { console.log(Object.keys(SOURCES).join("\n")); process.exit(0); }
fs.mkdirSync(dir, { recursive: true });
for (const url of SOURCES[what] || []) {
  const out = path.join(dir, path.basename(url));
  if (fs.existsSync(out)) { console.log("ya existe", out); continue; }
  console.log("descargando", url);
  const r = await fetch(url);
  if (!r.ok) throw new Error(url + " → " + r.status);
  fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
  console.log("→", out);
}
