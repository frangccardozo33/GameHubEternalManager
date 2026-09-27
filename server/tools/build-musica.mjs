// Extrae la lógica del juego de música (02-musica/musica-mejorada.html) como módulo ES para el servidor (sin interfaz).
// El juego original tiene un único estado global y un solo sello: acá se conserva su lógica tal cual y el servidor le pone el estado de cada
// sello por turno (ver server/src/musica.js). Ejecutar tras tocar la lógica del juego:  node server/tools/build-musica.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const L = fs.readFileSync(path.join(root, '02-musica', 'musica-mejorada.html'), 'utf8').split('\n');
const line = (start) => { const l = L.find((x) => x.startsWith(start)); if (!l) throw new Error('no encontrado: ' + start); return l; };
const consts = ['const clamp=', 'const nf=', 'const genres=', 'const themes=', 'const subgenres=', 'const themeMatrix=', 'const targetMatrix=', 'const styleMatrix=', 'const PRO_ROLES=', 'const RELEASE_KINDS=', 'const PROSPECT_NAMES=', 'const TRAIT_POOL=', 'const PRO_NAMES='].map(line);
const has = (n) => L.filter((x) => x.includes('function ' + n + '('));
const names = ['rand', 'pick', 'between', 'pro', 'artist', 'makeNPC', 'pickTraits', 'makeProspect', 'generateProspects', 'generateProfessionals', 'execDiscount', 'journalistBonus', 'proFee', 'addLog', 'addFeed', 'lifeCurve', 'market', 'synergy', 'qualityBase', 'estimateQuality', 'computeCost', 'releaseDuration', 'updateRanks', 'launch', 'organicFeed', 'maybeEvent', 'createEvent', 'eventDefinition'];
const lines = [...new Set(names.flatMap((n) => { const h = has(n); if (!h.length) throw new Error('no encontrado: ' + n); return h; }))];
let out = lines.join('\n');
// las decisiones ya no frenan el reloj: tienen plazo (3 días de juego) y, si no se responden, decide el equipo del sello
out = out.replace("state.event={type,songId:s.id};", "state.event={type,songId:s.id,deadline:state.day+3};");
out = out.replace('El tiempo se detiene hasta que respondas.', 'Tienes 3 días de juego para decidir; si no, decide tu equipo.');
if (!out.includes('deadline:state.day+3')) throw new Error('createEvent no encontrado');

// tick(): se parte en las tres partes que el servidor recorre por separado (el mundo avanza una vez; cada sello, una vez)
const tick = has('tick')[0];
const M1 = 'const markets=market();', M2 = "state.songs.filter(s=>s.status==='released').forEach(s=>{const a=artist(s.artistId);s.age++;", M3 = 'updateRanks();state.history.push(';
const i0 = tick.indexOf('state.dailyRevenue=0'), i1 = tick.indexOf(M1), i2 = tick.indexOf(M2), i3 = tick.indexOf(M3);
if (i0 < 0 || i1 < i0 || i2 < i1 || i3 < i2) throw new Error('tick() cambió: revisar los cortes');
const pre = tick.slice(i0, i1), npc = tick.slice(i1 + M1.length, i2), songs = tick.slice(i2, i3);
out += `\nfunction labelPre(){${pre}}\nfunction npcStep(markets){${npc}}\nfunction labelSongs(markets){${songs}}\n`;
const src = `// GENERADO por server/tools/build-musica.mjs (no editar). Lógica del juego de música (Nocturne Records) sin interfaz.
let state = null, modal = null, playing = false;
const toast = () => {}, save = () => {}, render = () => {}, openEvent = () => {};
${consts.join('\n')}
${out}
export const setState = (s) => { state = s; };
export const getState = () => state;
export { rand, pick, between, pro, artist, makeNPC, makeProspect, generateProspects, generateProfessionals, execDiscount, journalistBonus, proFee, addLog, addFeed, lifeCurve, market, synergy, qualityBase, estimateQuality, computeCost, releaseDuration, updateRanks, launch, organicFeed, maybeEvent, createEvent, eventDefinition, labelPre, npcStep, labelSongs, clamp, genres, themes, subgenres, RELEASE_KINDS, PRO_ROLES, money };
`;
fs.writeFileSync(path.join(root, 'server', 'src', 'vendor', 'musica-core.js'), src);
console.log('ok', Math.round(src.length / 1024) + ' KB');
