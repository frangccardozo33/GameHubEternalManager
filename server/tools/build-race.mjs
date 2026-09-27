// Empaqueta el motor de carreras de LRO (07-carreras-apex: plantel, datos, circuitos, arte y engine.js) como módulo ES para Workers.
// Los circuitos externos (circuits/*.json) se incrustan con la misma regla de precedencia que usa el navegador.
// Ejecutar tras tocar 07-carreras-apex:  node server/tools/build-race.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..'), R = path.join(root, '07-carreras-apex');
const out = path.join(root, 'server', 'src', 'vendor');
const rd = (f) => fs.readFileSync(path.join(R, f), 'utf8');
const FIELDS = ['layout', 'halfWidth', 'theme', 'wetChance', 'tempBase', 'gripMod', 'brakingMod', 'aeroMod', 'overtakeDiff', 'hills'];
const pick = (d) => Object.fromEntries(FIELDS.filter((k) => d[k] != null).map((k) => [k, d[k]]));
const bundle = JSON.parse(rd('circuits/circuits.json')), over = {};
for (const id of Object.keys(bundle)) over[id] = pick(bundle[id]);
for (const f of fs.readdirSync(path.join(R, 'circuits'))) {
  if (!f.endsWith('.json') || f === 'circuits.json' || f.startsWith('_')) continue;
  const id = f.slice(0, -5), d = JSON.parse(rd('circuits/' + f));
  if (bundle[id] && d._estado) continue;   // el placeholder no pisa al circuito real del bundle
  over[id] = pick(d);
}
const mathDM = (s) => s.replace(/\bMath\.(hypot|sin|cos|atan2|atan|exp|log|pow|tan|asin|acos)\b/g, 'DM.$1');

let circuits = rd('circuits.js');
const ci = circuits.indexOf('window.CIRCUITS_READY = (async () => {');
if (ci < 0) throw new Error('circuits.js: no se encontró CIRCUITS_READY');
circuits = circuits.slice(0, ci);

// engine.js: azar propio (semilla), reloj propio, sin cuadro de animación
let eng = rd('engine.js');
const iEmit = eng.indexOf('function emit(car,type,count=5)'), iPart = eng.indexOf('function updateParticles(dt)');
const iFrame = eng.indexOf('function frame(now) {');
if (iEmit < 0 || iPart < 0 || iFrame < 0) throw new Error('engine.js: marcadores no encontrados');
const rnd = (s) => s.replace(/Math\.random\(\)/g, 'SRAND()');
eng = rnd(eng.slice(0, iEmit)) + eng.slice(iEmit, iPart) + rnd(eng.slice(iPart, iFrame)); // las partículas usan el azar nativo (solo visual)
eng = eng.replace('state.redFlagRealEndsAt=performance.now()+7000', 'state.redFlagRealEndsAt=SIMT+7000');
eng = eng.replace('window.LROstudio.half()', 'HALFHIT=true');
if (!eng.includes('HALFHIT=true')) throw new Error('engine.js: half no encontrado');
if (!eng.includes('SIMT+7000')) throw new Error('engine.js: bandera roja no encontrada');
eng = mathDM(eng);

const tail = `
function qualify(){ // igual que runQualifying() sin ventanas ni guardado
  const grid=buildGrid();
  const timed=grid.map(entry=>({entry,pace:qualiPace(entry.driver,entry.team)})).sort((a,b)=>a.pace-b.pace);
  state.grid=timed.map(t=>t.entry); state.poleTeamId=state.grid[0].team.id; Career.qualifyingDoneRound=currentRound(Career).round; resetRace();
}
function stepSim(){ // un paso fijo de 1/60 s (igual que el bucle de frame())
  SIMT+=1000/60;
  if(state.redFlag&&SIMT>state.redFlagRealEndsAt){state.redFlag=false;state.paused=false;addEvent('SE REANUDA LA CARRERA','Vuelve la acción en pista.',null,60);}
  if(!state.paused){updateRace(CONFIG.fixedStep);updateParticles(CONFIG.fixedStep);}
}
function beginRace(){ if(state.phase==='grid'){state.phase='countdown';state.countdown=0;addEvent('MOTORES ENCENDIDOS',CURRENT_TRACK.name+' espera la largada.',null,0);} }
resetRace();
return { state, CONFIG, resetRace, qualify, stepSim, beginRace, takeHalf(){ const h=HALFHIT; HALFHIT=false; return h; }, seedRng(s){ RS=s>>>0; }, setSimT(v){ SIMT=v; }, vars(){ return { RS, SIMT, wk:CURRENT_WEATHER_KEY, wg:CURRENT_WEATHER_GRIP }; }, setVars(o){ RS=o.RS; SIMT=o.SIMT; CURRENT_WEATHER_KEY=o.wk; CURRENT_WEATHER_GRIP=o.wg; }, get trackLength(){ return trackLength; }, currentRound, currentTrack, TRACKS, effectiveStats, activeDriver, TEAM_DEFS, newCareer, migrateCareer };
`;
const pre = `let SIMT = 0, RS = 1, HALFHIT = false;
const SRAND = () => { let t = (RS += 0x6D2B79F5) >>> 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
`;
const dataSrc = mathDM(rd('game-data.js')), artSrc = mathDM(rd('motorsport-art.js'));
const body = (withEngine) => `${pre}
${rd('roster-lro.js')}
${dataSrc}
${mathDM(circuits)}
for (const def of TRACKS) { const d = ${JSON.stringify(over)}[def.id]; if (d) applyCircuitFile(def, d); }
${artSrc}
${withEngine ? eng + tail : 'return { newCareer, TRACKS, TEAM_DEFS };'}`;
const src = `// GENERADO por server/tools/build-race.mjs (no editar). Motor de carreras de LRO como módulo ES (sin DOM ni WebGL).
import { DM } from '../../../assets/common/dmath.mjs';
import * as THREE_NS from '../../../07-carreras-apex/vendor/three.min.js';
import { makeEnv } from './race-stubs.js';
const THREE_REAL = globalThis.THREE || THREE_NS.default || THREE_NS;
// Career: partida (JSON) que el motor lee. Sin Career solo se arma el modelo de datos (para crear una liga nueva).
export function makeRace(CareerIn) {
  const { window, document, localStorage } = makeEnv(THREE_REAL);
  const Career = CareerIn, THREE = window.THREE;
  const requestAnimationFrame = () => 0, performance = globalThis.performance || { now: () => Date.now() };
  ${'const navigator = window.navigator, AudioContext = window.AudioContext, webkitAudioContext = window.webkitAudioContext, getComputedStyle = window.getComputedStyle, fetch = undefined, Blob = window.Blob, URL = window.URL, Image = window.Image, ResizeObserver = window.ResizeObserver, MutationObserver = window.MutationObserver, IntersectionObserver = window.IntersectionObserver, cancelAnimationFrame = () => {}, matchMedia = window.matchMedia, screen = window.screen, history = window.history, location = window.location, self = window;'}
  if (!Career) { ${body(false).replace(/\n/g, '\n  ')} }
  ${body(true).replace(/\n/g, '\n  ')}
}
`;
fs.writeFileSync(path.join(out, 'race-core.js'), src);
console.log('ok', Math.round(src.length / 1024) + ' KB');
