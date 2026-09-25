// Carga el núcleo TLM (scripts clásicos) en Node.
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm"; import { fileURLToPath } from "node:url";
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const CORE = ["tlm-util", "tlm-dates", "tlm-data", "tlm-players", "tlm-competition", "tlm-club", "tlm-tactics", "tlm-market", "tlm-ai", "tlm-sim", "tlm-news", "tlm-cup", "tlm-career"];
export function loadCore() {
  const store = {};
  globalThis.window = globalThis.window || globalThis;   // tlm-dates.js se engancha a window
  globalThis.localStorage = globalThis.localStorage || { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
  vm.runInThisContext(fs.readFileSync(path.join(dir, '..', '..', 'assets', 'nations', 'nations.js'), 'utf8'), { filename: 'nations.js' });
  for (const f of CORE) vm.runInThisContext(fs.readFileSync(path.join(dir, f + ".js"), "utf8"), { filename: f + ".js" });
  return globalThis.TLM;
}
