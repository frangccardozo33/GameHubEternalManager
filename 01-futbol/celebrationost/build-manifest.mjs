// Regenera manifest.js con los audios de esta carpeta (mp3/m4a/ogg/wav). Uso: node celebrationost/build-manifest.mjs
// Para actualizar los recortes: copiá los audios nuevos desde ../../celebrationost a esta carpeta y volvé a correr este script.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const files = fs.readdirSync(dir).filter((f) => /\.(mp3|m4a|ogg|wav|opus|aac)$/i.test(f)).sort((a, b) => a.localeCompare(b));
const songs = files.map((f) => ({ file: f, title: f.replace(/\.[^.]+$/, '') }));
fs.writeFileSync(path.join(dir, 'manifest.js'), '/* generado por build-manifest.mjs — no editar a mano */\nwindow.LFO_CELEBRATION_SONGS = ' + JSON.stringify(songs, null, 1) + ';\n');
console.log(songs.length + ' canciones en manifest.js');
