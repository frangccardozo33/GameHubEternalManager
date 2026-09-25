// Inyecta p1.js + p3.js + p4.js en fulbo.html entre <<P1_BEGIN>> y <<P1_END>> (o justo antes de <<TLB_ENGINE_BEGIN>> la primera vez).
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = path.join(root, "fulbo.html");
const read = (f) => fs.readFileSync(path.join(root, "p1", f), "utf8").replace(/\s+$/, "\n");
const src = read("p1.js").replace(/\/\/ <<P1_END>>\s*$/, "") + read("p3.js") + read("p4.js") + "// <<P1_END>>\n";
let h = fs.readFileSync(html, "utf8");
const a = h.indexOf("// <<P1_BEGIN>>"), b = h.indexOf("// <<P1_END>>");
if (a >= 0 && b > a) h = h.slice(0, a) + src.trimEnd() + h.slice(b + "// <<P1_END>>".length);
else { const k = h.indexOf("// <<TLB_ENGINE_BEGIN>>"); if (k < 0) throw new Error("no TLB marker"); h = h.slice(0, k) + src + h.slice(k); }
fs.writeFileSync(html, h);
console.log("P1 + P3 inyectados en fulbo.html");
