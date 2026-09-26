// Genera sfx/index.json con los audios que hay en esta carpeta. Correr después de agregar/quitar archivos:
//   node assets/sfx/build-index.mjs
import { readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, basename } from 'node:path';
const dir = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(dir).filter((f) => /\.(ogg|mp3|wav|m4a)$/i.test(f)).sort();
writeFileSync(join(dir, 'index.json'), JSON.stringify({ files }, null, 1));
console.log(files.length + ' audios →', join(dir, 'index.json'));
