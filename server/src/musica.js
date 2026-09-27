// Adaptador del módulo 02 (Música / Nocturne Records): mundo compartido donde cada DT humano dirige un sello y todos compiten en el mismo
// chart (con los NPC de la industria). El tiempo corre solo: 1 día de juego = 1 hora real, sin botones de pausa ni de pasar el día.
// La lógica del juego es la original (vendor/musica-core.js, extraída de musica-mejorada.html); cada sello tiene su propio estado y el
// servidor se lo pone al juego por turno (withLabel). Temporada de 100 días de juego (≈ 4 días y 4 horas reales).
import * as C from './vendor/musica-core.js';

export const HOUR = 3600e3, SEASON_DAYS = 100, SLOTS = 16;
const clone = (o) => JSON.parse(JSON.stringify(o));
const num = (v, lo, hi) => { v = +v; if (!Number.isFinite(v)) throw new Error('Número inválido'); return Math.min(hi, Math.max(lo, v)); };
const str = (v, n = 60) => { if (typeof v !== 'string' || !v.trim() || v.length > n) throw new Error('Texto inválido'); return v.trim(); };
const oneOf = (v, list) => { if (!list.includes(v)) throw new Error('Valor inválido'); return v; };
const CTX = ['npcs'];

// El juego lee y escribe un único "state": se le da el del sello, con el mundo (NPC, día, semilla) enganchado mientras corre.
function withLabel(g, L, fn) {
  if (L.npcs) return fn();   // ya está puesto (llamada anidada)
  L.npcs = g.npcs; L.day = g.day; L.seed = g.seed; C.setState(L);
  try { return fn(); } finally { g.seed = L.seed; for (const k of CTX) delete L[k]; delete L.seed; }
}
const labels = (g) => g.order.map((id) => g.labels[id]).filter(Boolean);
const released = (L) => L.songs.filter((s) => s.status === 'released');

function newLabel(g, id, name) {
  const L = { version: 2, day: g.day, cash: 45000, manager: { id: 'me', name }, totalStreams: 0, totalRevenue: 0, dailyRevenue: 0, dailyStreams: 0, expenses: 0, uid: 0, artistUid: 1, prospectSerial: 0, tourUid: 0, eventSerial: 0,
    lastEventDay: g.day - 5, lastScoutDay: g.day - 5, history: [{ day: g.day, daily: 0, total: 0, revenue: 0 }], artists: [], prospects: [], professionals: [], songs: [], tours: [], feed: [], log: [], event: null, grants: 0 };
  withLabel(g, L, () => {
    L.professionals = C.generateProfessionals(); L.prospects = C.generateProspects(6);
    C.addFeed('news', 'The Daily Mix', `${name} abre sus puertas. Todavía no tiene artistas, pero tiene ambición.`);
    C.addLog(`${name} abre sus puertas. Capital inicial: ${C.money(L.cash)}. Tu primera decisión como mánager es encontrar un artista en la escena underground.`);
  });
  return L;
}

// ranking global: los NPC y las canciones de TODOS los sellos compiten en el mismo chart
function updateRanks(g) {
  const all = [...g.npcs, ...labels(g).flatMap(released)].sort((a, b) => b.daily - a.daily);
  all.forEach((s, i) => { s.prevRank = s.rank || 0; s.rank = i + 1; if (s.artistId && s.daily > 0) s.bestRank = Math.min(s.bestRank || 1000, s.rank); });
}

function resolveEvent(g, L, i) {
  withLabel(g, L, () => {
    const d = C.eventDefinition(); if (!d) return;
    let o = d.options[i]; if (!o || (o[2] > 0 && L.cash < o[2])) o = d.options.find((x) => x[2] === 0) || d.options[0];   // sin fondos: la opción gratuita
    if (o[2] > 0 && L.cash < o[2]) { L.event = null; return; }
    L.cash -= o[2]; o[3](); C.addLog(`${d.a.name}: ${o[0]}. ${o[1]}.`); C.addFeed('news', 'Backstage Wire', `El equipo de ${d.a.name} toma una decisión sobre «${d.s.title}»: ${o[0].toLowerCase()}.`); L.event = null;
  });
}

// Un día de juego para todo el mundo (lo que hacía tick() con un solo sello)
function worldTick(g) {
  g.day++;
  const G = { seed: g.seed, day: g.day, npcs: g.npcs, songs: labels(g).flatMap(released) }; C.setState(G);
  const markets = C.market(); C.npcStep(markets); g.seed = G.seed;
  for (const L of labels(g)) {
    withLabel(g, L, () => {
      C.labelPre(); C.labelSongs(markets);
      L.history.push({ day: L.day, daily: L.dailyStreams, total: L.totalStreams, revenue: L.dailyRevenue }); L.history = L.history.slice(-180);
      if (L.day % 3 === 0) C.organicFeed();
      if (L.event && L.day >= L.event.deadline) { /* fuera del withLabel: se resuelve abajo */ }
      else if (!L.event && L.day - L.lastEventDay >= 5) C.maybeEvent();
      if (L.cash < 0 && L.grants < 2) { L.cash += 15000; L.grants++; L.artists.forEach((a) => { a.fame = C.clamp(a.fame - 3); }); C.addLog('Anticipo de emergencia: +$15.000. El contrato de distribución reduce 3 puntos de fama por artista.'); }
    });
    if (L.event && g.day >= L.event.deadline) resolveEvent(g, L, 0);   // no respondió a tiempo: decide el equipo (opción por defecto)
  }
  updateRanks(g);
  if (g.day > SEASON_DAYS) g.finished = true;
}

// resumen de cada sello para el ranking
const rankRow = (g, L) => { const rel = released(L); return { id: L.id, name: L.manager.name, streams: Math.round(L.totalStreams), revenue: Math.round(L.totalRevenue), cash: Math.round(L.cash), artists: L.artists.length, songs: rel.length, top100: rel.filter((s) => s.rank <= 100).length, bestRank: Math.min(1000, ...rel.map((s) => s.bestRank || s.rank || 1000)), daily: Math.round(L.dailyStreams) }; };
const ranking = (g) => labels(g).map((L) => rankRow(g, L)).sort((a, b) => b.streams - a.streams || b.revenue - a.revenue);

export const musica = {
  id: 'musica',
  create(seed) {
    const g = { v: 1, seed: seed | 0 || 728391, day: 1, npcs: [], labels: {}, order: [], names: {}, humans: [], finished: false };
    const G = { seed: g.seed, day: 1, npcs: g.npcs, songs: [] }; C.setState(G);
    for (let i = 0; i < 115; i++) g.npcs.push(C.makeNPC(i));
    g.npcs.forEach((n) => { n.daily = Math.round(n.power * C.lifeCurve(n.age, n.quality)); n.total = n.daily * n.age; });
    g.seed = G.seed; updateRanks(g); return g;
  },
  load: (json) => JSON.parse(json),
  serialize: (g) => JSON.stringify(g),
  clubs: () => Array.from({ length: SLOTS }, (_, i) => 'l' + (i + 1)),
  teams: (g) => Array.from({ length: SLOTS }, (_, i) => { const id = 'l' + (i + 1); return { id, name: g.names[id] ? `Sello de ${g.names[id]}` : `Sello ${i + 1}`, short: 'S' + (i + 1), city: '', mascot: '', color: '#7b5cff', dark: '#3b2a99', crest: '' }; }),
  standings: (g) => ranking(g).map((r, i) => ({ id: r.id, rank: i + 1, w: r.streams, l: r.top100, t: r.songs, diff: r.cash, cols: ['Streams', 'Top 100', 'Temas', 'Caja'] })),
  round: () => null,
  finishRound() {},
  results: () => [],
  makeLive() { throw new Error('la música no tiene partidos'); },
  // los humanos son los sellos: cada uno tiene su estado propio (se crea al elegir el club)
  setHumans(g, ids, names = {}) {
    g.humans = ids.filter((id) => /^l\d+$/.test(id)); g.names = { ...g.names, ...names };
    for (const id of g.humans) { if (!g.labels[id]) { g.labels[id] = newLabel(g, id, `Sello de ${g.names[id] || id}`); g.labels[id].id = id; g.order.push(id); } else if (g.names[id]) g.labels[id].manager.name = `Sello de ${g.names[id]}`; }
  },
  // el mundo avanza solo: 1 día de juego por hora real desde la fecha de inicio de la liga
  tickWorld(g, now, meta) {
    if (g.finished || now < meta.firstKickoff) return { changed: false };
    const target = 1 + Math.floor((now - meta.firstKickoff) / HOUR); let changed = false;
    for (let n = 0; g.day < target && !g.finished && n < 400; n++) { worldTick(g); changed = true; }
    return { changed };
  },
  nextWorldAt(g, now, meta) { if (g.finished) return null; return Math.max(now + 1000, meta.firstKickoff + g.day * HOUR); },
  // vista del sello para su DT: es el "state" del juego original + los temas de los demás sellos como parte del chart
  exportState(g, club) {
    const L = g.labels[club]; if (!L) throw new Error('Ese club no tiene sello');
    const S = clone(L); S.day = g.day; S.seed = 1;
    const rivals = labels(g).filter((x) => x.id !== L.id).flatMap((x) => released(x).map((s) => ({ id: 'rv-' + x.id + '-' + s.id, title: s.title, artist: `${x.artists.find((a) => a.id === s.artistId)?.name || '?'} · ${x.manager.name}`, genre: s.genre, quality: s.quality, age: s.age, power: 0, daily: s.daily, prevRank: s.prevRank, rank: s.rank, total: s.total, cover: s.cover, rival: true })));
    S.npcs = clone(g.npcs).concat(rivals);
    S.online = { me: club, day: g.day, seasonDays: SEASON_DAYS, finished: g.finished, ranking: ranking(g) };
    return JSON.stringify(S);
  },
  command(g, club, body, ctx) {
    const L = g.labels[club]; if (!L || !g.humans.includes(club)) throw new Error('No dirigís este sello');
    if (g.finished) throw new Error('La temporada terminó');
    if (!body || typeof body.op !== 'string') throw new Error('Orden inválida');
    const a = Array.isArray(body.args) ? body.args : [], res = withLabel(g, L, () => OPS[body.op] ? OPS[body.op](g, L, a) : (() => { throw new Error('Orden desconocida'); })());
    return { ok: !res || res.ok !== false, result: res === undefined ? null : res, mutated: true };
  },
};

const artist = (L, id) => { const x = L.artists.find((q) => q.id === +id); if (!x) throw new Error('Ese artista no es de tu sello'); return x; };
const OPS = {
  explore: (g, L) => {
    if (L.day - L.lastScoutDay < 3) return { ok: false, msg: 'Todavía no hay una ronda nueva de prospectos (cada 3 días).' };
    if (L.cash < 600) return { ok: false, msg: 'Necesitas $600 para explorar la escena.' };
    L.cash -= 600; L.lastScoutDay = L.day; L.prospects = C.generateProspects(6); return { ok: true, msg: 'Nueva ronda de prospectos disponible.' };
  },
  scout: (g, L, a) => {
    const p = L.prospects.find((x) => x.id === a[0]); if (!p || p.discovered) return { ok: false, msg: 'Ese prospecto ya no está disponible.' };
    if (L.cash < p.scoutCost) return { ok: false, msg: 'Fondos insuficientes para investigar a este prospecto.' };
    L.cash -= p.scoutCost; p.discovered = true; return { ok: true, msg: `Investigación completa: ${p.name} ahora muestra sus estadísticas.` };
  },
  sign: (g, L, a) => {
    const p = L.prospects.find((x) => x.id === a[0]); if (!p || !p.discovered) return { ok: false, msg: 'Primero investiga al prospecto.' };
    if (L.cash < p.signCost) return { ok: false, msg: 'Fondos insuficientes para fichar a este artista.' };
    L.cash -= p.signCost; const first = L.artists.length === 0;
    L.artists.push({ id: L.artistUid++, name: p.name, genre: p.genre, talent: p.talent, ego: p.ego, health: p.health, scandal: p.scandal, fame: p.fame, traits: p.traits, restUntil: 0, trained: 0, cover: p.cover, managerId: L.manager.id, signedDay: L.day });
    L.prospects = L.prospects.filter((x) => x.id !== p.id);
    C.addLog(`${first ? 'Tu primer fichaje' : 'Nuevo fichaje'}: ${p.name} se une a ${L.manager.name}.`); C.addFeed('news', 'The Daily Mix', `${L.manager.name} ficha a ${p.name}, un talento del underground de ${p.genre}.`);
    return { ok: true, msg: `${p.name} ahora forma parte de tu sello.` };
  },
  artistAction: (g, L, a) => {
    const x = artist(L, a[0]), type = oneOf(a[1], ['rest', 'therapy', 'train']);
    if (type === 'rest') { if (x.restUntil >= L.day) return { ok: false, msg: 'Ya está descansando.' }; x.restUntil = L.day + 7; x.health = C.clamp(x.health + 8); x.ego = C.clamp(x.ego - 3); }
    if (type === 'therapy') { if (L.cash < 2500) return { ok: false, msg: 'Fondos insuficientes.' }; L.cash -= 2500; x.health = C.clamp(x.health + 18); x.scandal = C.clamp(x.scandal - 4); }
    if (type === 'train') { if (L.cash < 4000 || x.trained > L.day || x.talent >= 100) return { ok: false, msg: 'No se puede entrenar ahora.' }; L.cash -= 4000; x.talent = C.clamp(x.talent + 3); x.health = C.clamp(x.health - 4); x.trained = L.day + 10; }
    C.addLog(`${x.name}: ${type === 'rest' ? 'descanso creativo de 7 días' : type === 'therapy' ? 'sesión de apoyo psicológico' : 'coaching artístico'}.`); return { ok: true, msg: 'Inversión registrada.' };
  },
  rename: (g, L, a) => { artist(L, a[0]).name = str(a[1], 40); return { ok: true, msg: 'Nombre artístico actualizado.' }; },
  produce: (g, L, a) => {
    const x = artist(L, a[0]), c = a[1] || {};
    const cfg = { title: str(c.title, 60), genre: oneOf(c.genre, C.genres), theme: oneOf(c.theme, ['Despecho', 'Amor', 'Fiestas', 'Dinero', 'Crítica Social', 'Melancolía']), target: oneOf(c.target, ['Gen Z', 'Millennials', 'Audiencia Masiva']), style: oneOf(c.style, ['Minimalista', 'Sobrecargado', 'Comercial', 'Underground']),
      production: num(c.production, 2000, 15000), tiktok: num(c.tiktok, 0, 15000), playlists: num(c.playlists, 0, 15000), pr: num(c.pr, 0, 10000), kind: oneOf(c.kind, Object.keys(C.RELEASE_KINDS)), collab: c.collab ? +c.collab : '', producer: c.producer || '', promoter: c.promoter || '' };
    cfg.subgenre = oneOf(c.subgenre, C.subgenres[cfg.genre]);
    if (cfg.collab) artist(L, cfg.collab); if (cfg.producer && !C.pro(cfg.producer)) throw new Error('Productor inválido'); if (cfg.promoter && !C.pro(cfg.promoter)) throw new Error('Promotor inválido');
    if (L.songs.some((s) => s.title.toLowerCase() === cfg.title.toLowerCase())) return { ok: false, msg: 'Ya existe un lanzamiento con ese nombre en tu catálogo.' };
    const cost = C.computeCost(cfg);
    if (cost > L.cash || x.restUntil >= L.day || x.health < 22 || L.songs.some((s) => s.artistId === x.id && s.status === 'production')) return { ok: false, msg: 'El artista o el presupuesto no están disponibles.' };
    const inspiration = C.between(0.85, 1.15), q = C.clamp(C.estimateQuality(x, cfg) * inspiration); L.cash -= cost;
    const s = { title: cfg.title, genre: cfg.genre, subgenre: cfg.subgenre, theme: cfg.theme, target: cfg.target, style: cfg.style, production: cfg.production, tiktok: cfg.tiktok, playlists: cfg.playlists, pr: cfg.pr, kind: cfg.kind, collabWith: cfg.collab ? +cfg.collab : null, producerId: cfg.producer || null, promoterId: cfg.promoter || null,
      id: ++L.uid, artistId: x.id, managerId: L.manager.id, quality: q, inspiration, synergy: C.synergy(cfg.genre, cfg.theme, cfg.target, cfg.style, cfg.subgenre), cost, status: 'production', releaseDay: L.day + C.releaseDuration(x, cfg), createdDay: L.day, age: 0, daily: 0, total: 0, revenue: 0, rank: 0, prevRank: 0, bestRank: 0, hype: 1, viral: 1, history: [], cover: x.cover };
    L.songs.push(s); x.health = C.clamp(x.health - 5 - (x.traits.includes('Perfeccionista') ? 2 : 0));
    C.addLog(`«${s.title}» entra al estudio con ${x.name} (${C.RELEASE_KINDS[s.kind].label}). Inversión: ${C.money(cost)}. Estreno previsto: día ${s.releaseDay}.`);
    C.addFeed('news', 'Nocturne / Inside', `${x.name} prepara «${s.title}». ${cfg.genre}, ${cfg.theme.toLowerCase()} y una nueva etapa. Disponible el día ${s.releaseDay}.`);
    return { ok: true, songId: s.id, msg: 'Lanzamiento en producción.' };
  },
  // sesión de grabación (minijuego del cliente): ajusta hasta ±15 % la calidad, una sola vez por lanzamiento y mientras esté en el estudio
  rhythm: (g, L, a) => {
    const s = L.songs.find((x) => x.id === a[0]); if (!s || s.status !== 'production' || s.rhythmDone) return { ok: false, msg: 'Esa sesión ya no está disponible.' };
    const score = Math.min(90, num(a[1], 0, 100)); s.rhythmDone = true; s.quality = C.clamp(s.quality * (0.85 + score / 100 * 0.3));
    for (const pid of [s.producerId, s.promoterId]) if (pid) { const p = C.pro(pid); if (p) p.relationship = C.clamp(p.relationship + 4, 0, 100); }
    return { ok: true, msg: `Sesión terminada: ${Math.round(score)}/100 de precisión. Calidad final: ${Math.round(s.quality)}/100.` };
  },
  tour: (g, L, a) => {
    const x = artist(L, a[0]), budget = Math.round(num(a[1], 2000, 20000));
    if (L.cash < budget) return { ok: false, msg: 'Fondos insuficientes para esta gira.' };
    if (L.tours.some((t) => t.artistId === x.id && t.status === 'active')) return { ok: false, msg: 'Este artista ya está de gira.' };
    L.cash -= budget; const duration = 7 + Math.round(budget / 3000);
    L.tours.push({ id: 'tour-' + (L.tourUid++), artistId: x.id, startDay: L.day, endDay: L.day + duration, budget, revenue: 0, status: 'active' });
    C.addLog(`${x.name} sale de gira. Presupuesto: ${C.money(budget)}. Regresa el día ${L.day + duration}.`); C.addFeed('news', 'Tour Wire', `${x.name} anuncia una nueva gira. La expectativa crece.`);
    return { ok: true, msg: 'Gira confirmada.' };
  },
  sponsor: (g, L) => {
    if (L.cash >= 15000) return { ok: false, msg: 'Solo se aceptan patrocinios con la caja por debajo de $15.000.' };
    L.cash += 12000; L.artists.forEach((x) => { x.fame = C.clamp(x.fame - 5); x.ego = C.clamp(x.ego + 3); });
    C.addLog('Patrocinio aceptado: +$12.000. La audiencia cuestiona la autenticidad del sello: fama −5 y ego +3 por artista.'); return { ok: true, msg: 'Patrocinio firmado.' };
  },
  event: (g, L, a) => { if (!L.event) return { ok: false, msg: 'No hay decisión pendiente.' }; const d = withLabel(g, L, () => C.eventDefinition()); resolveEvent(g, L, Math.round(num(a[0], 0, d.options.length - 1))); return { ok: true, msg: 'Decisión tomada.' }; },
};
