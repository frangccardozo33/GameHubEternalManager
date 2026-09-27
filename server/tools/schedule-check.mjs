// Prueba del calendario: horarios por módulo (hora de Argentina) y la cola de partidos del Durable Object, con un módulo falso y un reloj simulado.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { slotOf, firstDay, dayIndex, orderMatches } from '../src/schedule.js';
const ok = (c, m) => console.log(c ? 'OK  ' : 'FALLA', m);
const ar = (t) => new Date(t - 3 * 3600e3).toISOString().replace('T', ' ').slice(0, 16);
// lunes 28/9/2026 es día 20624 (UTC-3)
const mon = dayIndex(Date.UTC(2026, 8, 28, 15)), sat = mon + 5;
ok(ar(slotOf('futbol', mon)) === '2026-09-28 12:20', 'fútbol lunes 12:20 → ' + ar(slotOf('futbol', mon)));
ok(ar(slotOf('futbol', mon + 4)) === '2026-10-02 12:20', 'fútbol viernes 12:20');
ok(ar(slotOf('futbol', sat)) === '2026-10-03 18:00' && ar(slotOf('futbol', sat + 1)) === '2026-10-04 18:00', 'fútbol sábado y domingo 18:00');
ok(ar(slotOf('basquet', mon)).endsWith('15:00') && ar(slotOf('nfl', mon)).endsWith('13:00') && ar(slotOf('mma', sat)).endsWith('17:00') && ar(slotOf('carreras', sat + 1)).endsWith('19:00'), 'básquet 15, NFL 13, MMA 17, carreras 19');
ok(firstDay('futbol', Date.UTC(2026, 8, 28, 20, 0)) === mon + 1, 'creada lunes 17:00: el 12:20 de ese lunes ya pasó, arranca el martes');
ok(firstDay('futbol', Date.UTC(2026, 8, 28, 10, 0)) === mon, 'creada lunes 07:00: arranca ese lunes');
const ms = [{ id: 'a', home: 'X', away: 'Y' }, { id: 'b', home: 'H1', away: 'Y' }, { id: 'c', home: 'H1', away: 'H2' }, { id: 'd', home: 'Z', away: 'W' }, { id: 'e', home: 'H2', away: 'W' }, { id: 'f', home: 'K', away: 'L', played: true }];
ok(orderMatches(ms, ['H1', 'H2']).join() === 'c,b,e,a,d', 'orden: humano-humano, humano-IA, IA-IA (' + orderMatches(ms, ['H1', 'H2']).join() + ')');

// ---- Durable Object con módulo falso y reloj simulado
const src = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'league-do.js'), 'utf8')
  .replace("import { DurableObject } from 'cloudflare:workers';", 'class DurableObject { constructor(ctx, env) { this.ctx = ctx; } }')
  .replace("import { MODS } from './mods.js';", "import { MODS } from './fake-mods.mjs';");
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
fs.writeFileSync(path.join(dir, '.tmp-do.mjs'), src);
let T = Date.UTC(2026, 8, 28, 10, 0);   // reloj simulado: lunes 07:00 (Argentina)
const realNow = Date.now; Date.now = () => T;
const DUR = 600e3;                      // cada partido dura 10 minutos
const played = new Set(); let finishes = 0;
const MATCHES = ['a', 'b', 'c', 'd', 'e'];
class FakeLive { constructor(id, startAt, now) { this.id = id; this.startAt = startAt; } get finished() { return T >= this.startAt + DUR; } advanceTo() {} frames() { return []; } full() { return []; } hud() { return {}; } hello() { return {}; } persist() { return {}; } commit() { played.add(this.id); return { score: [1, 0] }; } teamIdx() { return -1; } }
const mod = { round: () => (finishes >= 2 ? null : { label: 'J' + (finishes + 1), type: 'liga', matches: MATCHES.map((id) => ({ id, home: id === 'c' ? 'H1' : id === 'b' ? 'H1' : 'X', away: id === 'c' ? 'H2' : 'Y', played: played.has(id + finishes) })) }), create: () => ({}), serialize: () => '{}', load: () => ({}), makeLive: (l, id, st) => { const lv = new FakeLive(id + finishes, st, T); lv.id = id + finishes; return lv; }, finishRound: () => { finishes++; }, clubs: () => [], teams: () => [], standings: () => [], results: () => [] };
fs.writeFileSync(path.join(dir, 'fake-mods.mjs'), 'export let MODS = {};\nexport const set = (m) => { MODS.fake = m; };\n');
const fm = await import('../src/fake-mods.mjs'); fm.set(mod);
const { LeagueDO } = await import('../src/.tmp-do.mjs');
const store = new Map(); let alarm = 0;
const ctx = { blockConcurrencyWhile: (f) => f(), storage: { get: async (k) => (Array.isArray(k) ? new Map(k.map((x) => [x, store.get(x)])) : store.get(k)), put: async (o) => { for (const [k, v] of Object.entries(o)) store.set(k, v); }, delete: async () => {}, setAlarm: async (t) => { alarm = t; } } };
const doo = new LeagueDO(ctx, {}); await doo.ready;
await doo.fetch(new Request('https://do/init', { method: 'POST', body: JSON.stringify({ module: 'fake', firstKickoff: Date.UTC(2026, 8, 28, 10, 0) }) }));
doo.meta.module = 'futbol'; doo.meta.day0 = firstDay('futbol', doo.meta.firstKickoff); doo.mod = mod; doo.meta.clubs = { H1: 'u1', H2: 'u2' };
const log = []; let last = '';
for (let i = 0; i < 20000; i++) { T += 15e3; await doo.tick(); const c = doo.cur(); const s = c ? c.id + '@' + c.openAt : '-'; if (s !== last) { log.push((c ? ar(c.openAt) : ar(T)) + ' ' + (finishes ? 'J2 ' : 'J1 ') + (c ? c.id : '-')); last = s; } if (finishes >= 2) break; }
console.log(log.join('\n'));
const idx = (t) => log.findIndex((l) => l.includes(t));
ok(log[0].includes('2026-09-28 12:20') && log[0].endsWith(' J1 c'), 'la jornada 1 abre a las 12:20 con el partido humano-humano (c)');
ok(log.slice(0, 5).map((l) => l.split(' ').pop()).join() === 'c,b,a,d,e', 'cola de la jornada 1: c,b,a,d,e → ' + log.slice(0, 6).map((l) => l.split(' ').pop()).join());
const j2 = log.find((l) => l.includes(' J2 c')); ok(j2 && j2.includes('2026-09-29 12:20'), 'la jornada 2 es al día siguiente a las 12:20 → ' + j2);
ok(finishes === 2, 'las dos jornadas se completan');
Date.now = realNow; fs.rmSync(path.join(dir, '.tmp-do.mjs')); fs.rmSync(path.join(dir, 'fake-mods.mjs'));
