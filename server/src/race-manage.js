// Gestión del equipo por el DT humano de un campeonato online de carreras (LRO): estrategia de carrera, pilotos (titular, entrenamiento),
// mercado de pilotos y traspasos entre DT. El cliente es una página liviana (07-carreras-apex/lro-manager.html) que recibe una vista del
// equipo (exportState) y manda órdenes que se validan acá.

const clone = (o) => JSON.parse(JSON.stringify(o));
const num = (v, lo, hi) => { v = +v; if (!Number.isFinite(v)) throw new Error('Número inválido'); return Math.min(hi, Math.max(lo, v)); };
const oneOf = (v, list) => { if (!list.includes(v)) throw new Error('Valor inválido'); return v; };
const LAPS = 24;
const CMD_ENUMS = { pace: ['push', 'standard', 'conserve'], tyres: ['push', 'standard', 'save'], overtake: ['attack', 'standard', 'defend'], fuel: ['push', 'standard', 'save'] };
const defaultStrat = () => ({ compound: 'M', pitLap: Math.floor(LAPS / 2), cmds: { pace: 'standard', tyres: 'standard', overtake: 'standard', fuel: 'standard' } });
const isHuman = (g, id) => (g.humans || []).includes(id);
const team = (g, id) => g.career.teams.find((t) => t.id === id);
const driver = (g, id) => g.career.driversPool.find((d) => d.id === id);
const mineDriver = (g, t, id) => { if (!t.driverIds.includes(id)) throw new Error('Ese piloto no es de tu equipo'); return driver(g, id); };

export function setHumans(g, ids) {
  g.humans = ids.map(Number).filter((i) => team(g, i)); g.tradeProps ??= [];
  for (const i of g.humans) { const t = team(g, i); t.isPlayer = false; t.strat ||= defaultStrat(); }
  for (const t of g.career.teams) if (!g.humans.includes(t.id)) delete t.strat;
}

const drv = (d) => ({ id: d.id, name: d.name, short: d.short, number: d.number, nationality: d.nationality, age: d.age, personality: d.personality, rating: d.rating, salary: d.salary, marketValue: d.marketValue, stats: d.stats, photo: d.photo || null, focus: d.focus == null ? null : d.focus, teamId: d.teamId });
// Vista del equipo para su DT (no es el estado completo del juego: el cliente es una página liviana).
export function exportState(g, club) {
  const c = g.career, me = team(g, +club), r = c.calendar[c.roundIndex];
  return JSON.stringify({
    module: 'carreras', me: me.id, laps: LAPS, credits: me.credits,
    team: { id: me.id, name: me.name, color: me.color, logo: me.logo, points: me.points, wins: me.wins, podiums: me.podiums, activeDriverId: me.activeDriverId, driverIds: me.driverIds, strat: me.strat || defaultStrat() },
    drivers: me.driverIds.map((i) => drv(driver(g, i))),
    market: c.driversPool.filter((d) => d.teamId === null).sort((a, b) => b.rating - a.rating).slice(0, 80).map(drv),
    teams: c.teams.map((t) => ({ id: t.id, name: t.name, color: t.color, points: t.points, wins: t.wins, podiums: t.podiums, human: (g.humans || []).includes(t.id), drivers: t.driverIds.map((i) => { const d = driver(g, i); return drv(d); }) })),
    round: r ? { label: `Fecha ${r.round}`, trackId: r.trackId } : null, myMatch: r ? 'race' + c.roundIndex : null,
    tradeProps: (g.tradeProps || []).filter((t) => t.from === me.id || t.to === me.id),
  });
}

const DRV_STATS = 8;
function applyStrat(t, s) {
  s = s || {}; const cur = (t.strat ||= defaultStrat());
  if (s.compound != null) cur.compound = oneOf(s.compound, ['S', 'M', 'H']);
  if (s.pitLap != null) cur.pitLap = Math.round(num(s.pitLap, 2, LAPS - 2));
  if (s.cmds) for (const k of Object.keys(CMD_ENUMS)) if (s.cmds[k] != null) cur.cmds[k] = oneOf(s.cmds[k], CMD_ENUMS[k]);
}

const OPS = {
  setActive: (g, t, a, ctx) => { if (ctx.locked) throw new Error('La carrera está por empezar o en juego: el piloto titular quedó cerrado.'); mineDriver(g, t, +a[0]); t.activeDriverId = +a[0]; return { ok: true }; },
  setFocus: (g, t, a) => { const d = mineDriver(g, t, +a[0]); d.focus = Math.round(num(a[1], 0, DRV_STATS - 1)); d.tp = 0; return { ok: true }; },
  signDriver: (g, t, a, ctx) => {
    if (ctx.locked) throw new Error('La carrera está por empezar o en juego: no se puede cambiar de piloto ahora.');
    if (t.driverIds.length >= 2) return { ok: false, msg: 'Liberá un piloto primero.' };
    const d = driver(g, +a[0]); if (!d || d.teamId !== null) return { ok: false, msg: 'Ese piloto ya no está disponible.' };
    const fee = Math.round(d.marketValue * 0.15); if (t.credits < fee) return { ok: false, msg: 'No alcanza el presupuesto para la firma.' };
    t.credits -= fee; d.teamId = t.id; d.contractRounds = 6; t.driverIds.push(d.id); if (t.activeDriverId == null) t.activeDriverId = d.id;
    return { ok: true, msg: `${d.name} firma con ${t.name}.` };
  },
  releaseDriver: (g, t, a, ctx) => {
    if (ctx.locked) throw new Error('La carrera está por empezar o en juego: no se puede cambiar de piloto ahora.');
    if (t.driverIds.length <= 1) return { ok: false, msg: 'Necesitás al menos un piloto.' };
    const d = mineDriver(g, t, +a[0]); d.teamId = null; d.contractRounds = 0; t.driverIds = t.driverIds.filter((i) => i !== d.id); if (t.activeDriverId === d.id) t.activeDriverId = t.driverIds[0];
    return { ok: true, msg: `${d.name} vuelve al mercado.` };
  },
  // traspaso de pilotos con otro DT humano (uno por uno): propuesta hasta que responda
  tradePropose: (g, t, a) => {
    const to = team(g, +a[0]); if (!to || to.id === t.id || !isHuman(g, to.id)) throw new Error('Ese equipo no lo dirige otro DT');
    const give = mineDriver(g, t, +a[1]); if (!to.driverIds.includes(+a[2])) throw new Error('Ese piloto no es del otro equipo'); const get = driver(g, +a[2]);
    g.tradeProps = (g.tradeProps || []).filter((x) => x.exp >= g.career.roundIndex); const id = (g.tradeSeq = (g.tradeSeq || 0) + 1);
    g.tradeProps.push({ id, from: t.id, to: to.id, give: give.id, get: get.id, giveName: give.name, getName: get.name, exp: g.career.roundIndex + 2 }); return { ok: true, id, msg: 'Propuesta enviada.' };
  },
  tradeAnswer: (g, t, a, ctx) => {
    const p = (g.tradeProps || []).find((x) => x.id === +a[0] && x.to === t.id); if (!p) throw new Error('La propuesta ya no existe');
    g.tradeProps = g.tradeProps.filter((x) => x !== p); if (!a[1]) return { ok: true, msg: 'Propuesta rechazada.' };
    if (ctx.locked) throw new Error('La carrera está por empezar o en juego: no se puede cambiar de piloto ahora.');
    const A = team(g, p.from), B = t; if (!A.driverIds.includes(p.give) || !B.driverIds.includes(p.get)) return { ok: false, msg: 'Alguno de los pilotos ya no está en su equipo.' };
    A.driverIds = A.driverIds.filter((i) => i !== p.give).concat(p.get); B.driverIds = B.driverIds.filter((i) => i !== p.get).concat(p.give);
    driver(g, p.give).teamId = B.id; driver(g, p.get).teamId = A.id; driver(g, p.give).contractRounds = driver(g, p.get).contractRounds = 6;
    if (A.activeDriverId === p.give) A.activeDriverId = p.get; if (B.activeDriverId === p.get) B.activeDriverId = p.give;
    return { ok: true, msg: 'Traspaso completado.' };
  },
};

export function command(g, club, body, ctx) {
  const t = team(g, +club);
  if (!t || !isHuman(g, t.id)) throw new Error('No dirigís este equipo');
  if (!body || typeof body.op !== 'string') throw new Error('Orden inválida');
  if (body.op === 'strat') {
    if (ctx.locked) throw new Error('La carrera está por empezar o en juego: la estrategia quedó cerrada. Usá los controles de la transmisión.');
    applyStrat(t, body.strat); return { ok: true, mutated: true };
  }
  const fn = OPS[body.op]; if (!fn) throw new Error('Orden desconocida');
  const r = fn(g, t, Array.isArray(body.args) ? body.args : [], ctx);
  return { ok: !r || r.ok !== false, result: r === undefined ? null : r, mutated: true };
}

// Economía y entrenamiento de los equipos humanos al cerrar la fecha (mismas fórmulas que el modo carrera).
const RATE = 1;
export function afterRound(g) {
  const order = (g.last && g.last.order) || [];
  for (const id of g.humans || []) {
    const t = team(g, id), pos = order.findIndex((o) => o.team === String(id));
    t.credits += Math.max(0, 60000 - Math.max(0, pos) * 5000) - t.driverIds.reduce((s, i) => s + driver(g, i).salary, 0);
    for (const i of t.driverIds) {
      const d = driver(g, i), ageF = d.age <= 23 ? 1.3 : d.age <= 28 ? 1 : d.age <= 33 ? 0.7 : 0.4;
      let f = d.focus; if (f == null) { f = 0; d.stats.forEach((v, k) => { if (v < d.stats[f]) f = k; }); }
      d.tp = (d.tp || 0) + RATE * ageF;
      while (d.tp >= 2.5) { d.tp -= 2.5; if (d.stats[f] < 0.99) d.stats[f] = Math.min(0.99, d.stats[f] + 0.01); }
      d.rating = Math.round(d.stats.reduce((a, b) => a + b, 0) / 8 * 100); d.salary = Math.round((2000 + d.rating * 350) / 100) * 100; d.marketValue = Math.round((d.rating * d.rating * 30) / 1000) * 1000;
    }
  }
}
