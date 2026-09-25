// Convierte los estadios exportados por Object3D.toJSON (arrays de números en texto, 50–70 MB cada uno)
// a un formato binario compacto que carga el simulador: `.lfos`.
//
// Formato: "LFOS" | uint32 largo del header | header (JSON utf8, alineado a 4) | blob binario.
// El header es el JSON original con cada array reemplazado por {"bin":[byteOffset, cantidad]} y cada imagen por
// {"bin":[byteOffset, bytes]} (PNG crudo). Uso: node stadiums/build-bin.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const CTORS = { Float32Array, Uint16Array, Uint32Array, Uint8Array, Int16Array, Int32Array, Int8Array };

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const chunks = [];
  let off = 0;
  const putBytes = (buf) => {
    const pad = (4 - (off % 4)) % 4;
    if (pad) { chunks.push(Buffer.alloc(pad)); off += pad; }
    const o = off;
    chunks.push(buf);
    off += buf.length;
    return o;
  };
  const putArray = (type, arr) => {
    const ta = new CTORS[type](arr);
    const o = putBytes(Buffer.from(ta.buffer, ta.byteOffset, ta.byteLength));
    return [o, ta.length];
  };

  for (const g of j.geometries) {
    const d = g.data;
    if (!d) continue;
    for (const a of Object.values(d.attributes || {})) {
      a.bin = putArray(a.type, a.array);
      delete a.array;
    }
    if (d.index && d.index.array) {
      d.index.bin = putArray(d.index.type, d.index.array);
      delete d.index.array;
    }
  }
  (function walk(n) {
    for (const k of ['instanceMatrix', 'instanceColor']) {
      if (n[k] && n[k].array) { n[k].bin = putArray(n[k].type, n[k].array); delete n[k].array; }
    }
    (n.children || []).forEach(walk);
  })(j.object);
  for (const im of j.images) {
    const m = /^data:([^;]+);base64,(.*)$/s.exec(im.url);
    im.mime = m[1];
    im.bin = [putBytes(Buffer.from(m[2], 'base64'))];
    im.bin.push(Buffer.from(m[2], 'base64').length);
    delete im.url;
  }
  const header = Buffer.from(JSON.stringify(j), 'utf8');
  const hpad = (4 - (header.length % 4)) % 4;
  const head = Buffer.alloc(8);
  head.write('LFOS', 0, 'latin1');
  head.writeUInt32LE(header.length + hpad, 4);
  const out = path.join(dir, f.replace(/\.json$/, '.lfos'));
  fs.writeFileSync(out, Buffer.concat([head, header, Buffer.alloc(hpad), ...chunks]));
  console.log(f, '->', path.basename(out), (fs.statSync(out).size / 1048576).toFixed(1) + ' MB');
}
