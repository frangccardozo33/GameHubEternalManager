// Prueba de la liga online de música: dos sellos humanos, mundo que avanza solo (1 día = 1 hora), chart compartido, decisiones con plazo.
import { MODS } from '../src/mods.js';
import * as C from '../src/vendor/musica-core.js';
const M = MODS.musica; let g = M.create(11); const A = 'l1', B = 'l2';
M.setHumans(g, [A, B], { l1: 'ana', l2: 'beto' }); g = M.load(M.serialize(g)); M.setHumans(g, [A, B], { l1: 'ana', l2: 'beto' });
const ok = (c, m) => console.log(c ? 'OK  ' : 'FALLA', m);
const cmd = (club, op, args = []) => { try { return M.command(g, club, { op, args }, {}); } catch (e) { return { ok: false, reason: e.message }; } };
const meta = { firstKickoff: 1e12 }; let now = meta.firstKickoff;
const sA = () => g.labels.l1, sB = () => g.labels.l2;
ok(M.clubs(g).length === 16 && M.teams(g)[0].name === 'Sello de ana', 'clubes y nombres');
ok(!M.tickWorld(g, meta.firstKickoff - 5000, meta).changed && g.day === 1, 'antes de la fecha de inicio el mundo no avanza');
// cada sello ficha un artista
for (const [club, L] of [[A, sA()], [B, sB()]]) {
  const p = L.prospects[0]; let r = cmd(club, 'sign', [p.id]); ok(!r.ok, club + ': no se ficha sin investigar');
  r = cmd(club, 'scout', [p.id]); r = cmd(club, 'sign', [p.id]); ok(r.ok && L.artists.length === 1, club + ': ficha a ' + L.artists[0].name);
}
let r = cmd(A, 'sign', ['pros-99']); ok(!r.ok, 'prospecto inexistente rechazado');
r = cmd('l3', 'explore'); ok(!r.ok, 'sello sin DT rechazado');
// producir un single cada uno
const draft = (a, title) => ({ title, genre: a.genre, subgenre: 'x', theme: 'Amor', target: 'Gen Z', style: 'Comercial', production: 9000, tiktok: 5000, playlists: 5000, pr: 2000, kind: 'single' });
const g1 = sA().artists[0], g2 = sB().artists[0];
r = cmd(A, 'produce', [g1.id, { ...draft(g1, 'Mi tema'), subgenre: 'nada' }]); ok(!r.ok, 'subgénero inválido rechazado');
r = cmd(A, 'produce', [g1.id, { ...draft(g1, 'Mi tema'), subgenre: 'Synthpop', genre: 'Pop' }]);
if (!r.ok) { const sub = Object.entries({ Trap: 'Trap Latino', Reggaetón: 'Neoperreo', Pop: 'Synthpop', Rock: 'Pop Punk', 'Hip-Hop': 'Boom Bap', 'R&B': 'Neo Soul', EDM: 'House', Indie: 'Indie Pop' }); }
const subOf = { Trap: 'Trap Latino', Reggaetón: 'Neoperreo', Pop: 'Synthpop', Rock: 'Pop Punk', 'Hip-Hop': 'Boom Bap' };
const mk = (a, t) => ({ ...draft(a, t), subgenre: C.subgenres[a.genre][0] });
r = cmd(A, 'produce', [g1.id, mk(g1, 'Tema A')]); console.log('  A produce:', r.ok, r.result && r.result.msg || r.reason, g1.genre);
r = cmd(B, 'produce', [g2.id, mk(g2, 'Tema B')]); console.log('  B produce:', r.ok, r.result && r.result.msg || r.reason, g2.genre);
const songA = sA().songs[0]; if (songA) { r = cmd(A, 'rhythm', [songA.id, 100]); ok(r.ok, 'sesión de grabación (puntaje acotado a 90)'); r = cmd(A, 'rhythm', [songA.id, 100]); ok(!r.ok, 'la sesión solo cuenta una vez'); }
r = cmd(A, 'tour', [g1.id, 6000]); ok(r.ok, 'gira');
// el mundo corre solo: 100 días = 100 horas reales
let events = 0, auto = 0, days = 0;
for (let h = 1; h <= 105 && !g.finished; h++) {
  now = meta.firstKickoff + h * 3600e3 + 1; const before = g.day; M.tickWorld(g, now, meta); days += g.day - before;
  for (const L of [sA(), sB()]) if (L.event) { events++; if (h % 2 === 0) { const rr = cmd(L === sA() ? A : B, 'event', [0]); if (rr.ok) events += 0; } }
  // los sellos siguen sacando temas
  if (h % 12 === 0) for (const [club, L] of [[A, sA()], [B, sB()]]) { const a = L.artists[0]; if (a && a.health > 40) cmd(club, 'produce', [a.id, mk(a, 'Tema ' + club + h)]); }
}
ok(g.finished && g.day === 101, 'la temporada termina sola en el día 101 (' + g.day + ')');
ok(days >= 100, 'el mundo avanzó ' + days + ' días sin que nadie los pasara');
const ex = JSON.parse(M.exportState(g, A)); const rivals = ex.npcs.filter((n) => n.rival);
ok(ex.online.ranking.length === 2 && ex.day === 101, 'ranking de sellos: ' + JSON.stringify(ex.online.ranking.map((x) => [x.name, x.streams, x.top100, x.songs])));
ok(rivals.length > 0 && rivals.every((n) => n.artist.includes('Sello de beto')), 'los temas del otro sello aparecen en mi chart (' + rivals.length + ')');
ok(!ex.online.ranking.some((x) => x.id === 'l3') && !('hum' in ex), 'no se filtran sellos ajenos ni estados internos');
console.log('  eventos con plazo:', events, ' caja A/B:', Math.round(sA().cash), Math.round(sB().cash), ' tabla:', M.standings(g).map((x) => x.id + ':' + x.w).join(' '));
r = cmd(A, 'explore'); ok(!r.ok, 'no se puede jugar cuando terminó la temporada');
console.log('  chart top 5:', g.npcs.concat(sA().songs, sB().songs).filter((s) => s.rank <= 5).sort((a, b) => a.rank - b.rank).map((s) => s.rank + ' ' + s.title).join(' | '));
