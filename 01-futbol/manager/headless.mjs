// Carga headless del motor de partido (clase wc + capas AI2/TLB/TLM) extrayéndolo de fulbo.html.
// No modifica nada: sólo lee el HTML, recorta el bloque del motor y lo evalúa en Node.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export function loadEngine() {
  const h = fs.readFileSync(path.join(root, "fulbo.html"), "utf8").split("\n");
  const a = h.findIndex((l) => /^\s{2}te = \(i, t, e\) =>/.test(l));
  let b = h.findIndex((l) => l.includes("// <<TLM_ENGINE_END>>"));
  if (b < 0) b = h.findIndex((l) => l.includes("// <<TLB_ENGINE_END>>"));
  if (a < 0 || b < 0) throw new Error("No se encontró el bloque del motor en fulbo.html");
  const code = "const " + h.slice(a, b + 1).join("\n").trimStart() + "\nreturn wc;";
  const g = globalThis;
  g.window = g.window || g;
  return new Function("window", code)(g.window);
}
export function runMatch(Engine, seed, { setup, maxSteps = 5400 * 60 } = {}) {
  const m = new Engine(seed);
  setup && setup(m);
  m.start();
  let n = 0;
  while (!m.ended && n++ < maxSteps) m.step(1 / 60);
  return m;
}
