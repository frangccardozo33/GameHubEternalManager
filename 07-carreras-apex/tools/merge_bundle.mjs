// Une varios JSON parciales ({ "<id>": {...}, ... }) en circuits/circuits.json y valida que cada circuito tenga layout.
//   node tools/merge_bundle.mjs parte1.json parte2.json …            → circuits/circuits.json
//   node tools/merge_bundle.mjs --split circuits/circuits.json      → además escribe circuits/<id>.json por circuito
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url)), out = path.join(here, "..", "circuits");
let args = process.argv.slice(2); const split = args[0] === "--split"; if (split) args = args.slice(1);
if (!args.length) { console.log("uso: node tools/merge_bundle.mjs [--split] parte1.json [parte2.json …]"); process.exit(2); }
const all = {};
for (const f of args) {
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const [id, d] of Object.entries(j)) { if (d && typeof d === "object" && Array.isArray(d.layout)) all[id] = { ...d, id }; else console.log("  (se ignora «" + id + "»: no tiene layout)"); }
}
fs.mkdirSync(out, { recursive: true });
if (!split) fs.writeFileSync(path.join(out, "circuits.json"), JSON.stringify(all));
else for (const [id, d] of Object.entries(all)) fs.writeFileSync(path.join(out, id + ".json"), JSON.stringify(d));
console.log(`${Object.keys(all).length} circuitos → ${split ? "circuits/<id>.json" : "circuits/circuits.json"}`);
