// Empaqueta el simulador de combate de LLO (bundle 04-mma/assets/app.js) y el plantel fijo como módulo ES para Workers.
// Ejecutar tras tocar 04-mma:  node server/tools/build-mma.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = path.join(root, 'server', 'src', 'vendor');
fs.mkdirSync(out, { recursive: true });
const L = fs.readFileSync(path.join(root, '04-mma', 'assets', 'app.js'), 'utf8').split('\n');
const a = L.findIndex((l) => /^const te = \(i, t = 0, e = 100\)/.test(l));
const b = L.findIndex((l) => l.startsWith('const no = "llo-mma-v1"'));
if (a < 0 || b < 0) throw new Error('No se encontró el bloque del simulador en app.js');
// Math determinista (assets/common/dmath.mjs): hypot/sin/cos difieren entre navegadores y servidor
const body = L.slice(a, b).join('\n').replace(/\bMath\.(hypot|sin|cos|atan2|atan|exp|log|pow|tan|asin|acos)\b/g, 'DM.$1');
const roster = fs.readFileSync(path.join(root, '04-mma', 'roster-llo.js'), 'utf8');
const src = `// GENERADO por server/tools/build-mma.mjs (no editar). Simulador de combate y plantel de LLO como módulo ES.
import { DM } from '../../../assets/common/dmath.mjs';
const window = globalThis; if (!globalThis.window) globalThis.window = globalThis;
${roster}
class La { constructor(t = 1) { this.seed = t >>> 0; } next() { let t = (this.seed += 1831565813); return (t = Math.imul(t ^ (t >>> 15), t | 1)), (t ^= t + Math.imul(t ^ (t >>> 7), t | 61)), ((t ^ (t >>> 14)) >>> 0) / 4294967296; } range(t, e) { return t + this.next() * (e - t); } int(t, e) { return Math.floor(this.range(t, e + 1)); } pick(t) { return t[Math.floor(this.next() * t.length)]; } chance(t) { return this.next() < Math.max(0, Math.min(1, t)); } }
${body}
export const STEP_SEC = sr;
export { Hs, dl, Ke, Pe, La, $t, zs, fighterFromRoster };
`;
fs.writeFileSync(path.join(out, 'mma-core.js'), src);
console.log('ok', Math.round(src.length / 1024) + ' KB');
