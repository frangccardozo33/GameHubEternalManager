// Empaqueta el núcleo TLM (scripts clásicos) y el motor de partido de fulbo.html como módulos ES estáticos,
// para que corran en Cloudflare Workers (que no permite eval / new Function). Ejecutar tras tocar 01-futbol:
//   node server/tools/build-football.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = path.join(root, 'server', 'src', 'vendor');
const CORE = ['tlm-util', 'tlm-dates', 'tlm-data', 'tlm-roster', 'tlm-players', 'tlm-competition', 'tlm-club', 'tlm-tactics', 'tlm-market', 'tlm-ai', 'tlm-sim', 'tlm-news', 'tlm-cup', 'tlm-career'];
fs.mkdirSync(out, { recursive: true });

let core = '// GENERADO por server/tools/build-football.mjs (no editar). Núcleo TLM del fútbol como módulo ES.\nimport \'./football-shim.js\';\n';
const files = [path.join(root, 'assets', 'nations', 'nations.js'), ...CORE.map((f) => path.join(root, '01-futbol', 'manager', f + '.js'))];
for (const f of files) core += `\n// ---- ${path.basename(f)}\n{\n${fs.readFileSync(f, 'utf8')}\n}\n`;
core += '\nexport const TLM = globalThis.TLM;\n';
fs.writeFileSync(path.join(out, 'football-core.js'), core);

const h = fs.readFileSync(path.join(root, '01-futbol', 'fulbo.html'), 'utf8').split('\n');
const a = h.findIndex((l) => /^\s{2}te = \(i, t, e\) =>/.test(l));
let b = h.findIndex((l) => l.includes('// <<TLM_ENGINE_END>>'));
if (b < 0) b = h.findIndex((l) => l.includes('// <<TLB_ENGINE_END>>'));
if (a < 0 || b < 0) throw new Error('No se encontró el bloque del motor en fulbo.html');
// Math determinista (ver 01-futbol/online/dmath.mjs): el motor de las transmisiones en vivo usa DM en lugar de Math
const body = h.slice(a, b + 1).join('\n').trimStart().replace(/\bMath\./g, 'DM.');
const engine = "// GENERADO por server/tools/build-football.mjs (no editar). Motor de partido de fulbo.html (con Math determinista).\nimport { DM } from '../../../assets/common/dmath.mjs';\nexport function makeEngine(window) {\nconst " + body + '\nreturn wc;\n}\n';
fs.writeFileSync(path.join(out, 'football-engine.js'), engine);
fs.writeFileSync(path.join(out, 'football-shim.js'), `// Entorno mínimo que esperan los scripts clásicos del fútbol (window, localStorage, eventos).
const g = globalThis;
if (!g.window) g.window = g;
const store = {};
if (!g.localStorage) g.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
if (typeof g.dispatchEvent !== 'function') g.dispatchEvent = () => true;
if (typeof g.CustomEvent !== 'function') g.CustomEvent = class { constructor(t, o) { this.type = t; this.detail = o && o.detail; } };
`);
console.log('ok', Math.round(core.length / 1024) + ' KB core,', Math.round(engine.length / 1024) + ' KB motor');
