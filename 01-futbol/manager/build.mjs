// Inyecta manager/engine.js en fulbo.html (idempotente) y engancha los pocos puntos del renderer/UI que necesita.
// Uso: node manager/build.mjs        Verifica: node manager/build.mjs --check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const dir = path.dirname(fileURLToPath(import.meta.url)), root = path.join(dir, "..");
const f = path.join(root, "fulbo.html");
let h = fs.readFileSync(f, "utf8");
const rd = (n) => fs.readFileSync(path.join(dir, n), "utf8");
function block(begin, end, code, anchorFn) {
  const b = h.indexOf(begin), e = h.indexOf(end), text = `${begin}\n${code}\n${end}`;
  if (b >= 0 && e > b) h = h.slice(0, b) + text + h.slice(e + end.length);
  else { const at = anchorFn(); h = h.slice(0, at) + text + "\n" + h.slice(at); }
}
// 1) bloque del motor: justo después de la capa TLB (mismo scope que la clase wc)
block("// <<TLM_ENGINE_BEGIN>>", "// <<TLM_ENGINE_END>>", rd("engine.js"), () => { const i = h.indexOf("// <<TLB_ENGINE_END>>"); if (i < 0) throw new Error("Falta TLB_ENGINE_END"); return h.indexOf("\n", i) + 1; });
// 1b) assets del manager (CSS + scripts) justo después de collection.js
const FILES = ["tlm-util", "tlm-dates", "tlm-data", "tlm-players", "tlm-competition", "tlm-club", "tlm-tactics", "tlm-market", "tlm-ai", "tlm-sim", "tlm-news", "tlm-cup", "tlm-career", "tlm-bridge", "tlm-ui-core", "tlm-ui-team", "tlm-ui-market", "tlm-ui-match", "tlm-ui-cup", "tlm-ui-wardrobe"];
{
  const begin = "<!-- <<TLM_ASSETS_BEGIN>> -->", end = "<!-- <<TLM_ASSETS_END>> -->", NL = String.fromCharCode(10);
  const text = [begin, '<link rel="stylesheet" href="manager/tlm.css">', '<script src="../assets/nations/nations.js"></script>', ...FILES.map((f) => `<script src="manager/${f}.js"></script>`), '<script>window.TLM_UI && TLM_UI.init();</script>', end].join(NL);
  const b = h.indexOf(begin), e = h.indexOf(end);
  if (b >= 0 && e > b) h = h.slice(0, b) + text + h.slice(e + end.length);
  else { const tag = '<script src="collection.js"></script>', at = h.lastIndexOf(tag); if (at < 0) throw new Error("No se encontró collection.js"); h = h.slice(0, at + tag.length) + NL + text + h.slice(at + tag.length); }
}
// 2) puntos de enganche (una sola vez cada uno)
const hooks = [
  // el renderer oculta al jugador que ya salió y espera fuera (cambio físico)
  ["model.root.visible = !(p.sentOff ?? this.match.players[i].sentOff);", "model.root.visible = !(p.sentOff ?? this.match.players[i].sentOff) && !(this.match.players[i] && this.match.players[i].tlmHid);"],
  // el estado 'playing' del motor + telemetría de puente
];
let changed = 0;
for (const [a, b] of hooks) { if (h.includes(b)) continue; if (!h.includes(a)) throw new Error("Hook no encontrado: " + a.slice(0, 60)); h = h.replace(a, b); changed++; }
if (process.argv.includes("--check")) { console.log("TLM engine block:", h.includes("<<TLM_ENGINE_BEGIN>>") ? "presente" : "AUSENTE"); process.exit(0); }
fs.writeFileSync(f, h);
console.log("fulbo.html actualizado. hooks nuevos:", changed);
