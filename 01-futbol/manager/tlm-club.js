/* LFO MANAGER — MUNDO / CLUBES / FINANZAS / ESTADIO.
   createWorld() convierte la configuración estática (WORLD_CONFIG) en estado de carrera. El club del usuario es un Club
   como cualquier otro (mismo objeto, mismas reglas): sólo cambia controlledBy. */
(function (g) {
  'use strict';
  const TLM = g.TLM;
  const { clamp, round, nextId, roundMoney, R } = TLM;

  const SQUAD_TEMPLATE = ['POR', 'POR', 'DFC', 'DFC', 'DFC', 'DFC', 'LI', 'LI', 'LD', 'LD', 'MCD', 'MCD', 'MC', 'MC', 'MC', 'MI', 'MD', 'MP', 'EI', 'ED', 'DC', 'DC', 'DC'];

  function newClub(state, cfg) {
    const id = cfg.id || nextId(state, 'club', 'club');
    const cap = cfg.capacity || 15000;
    const club = {
      id, name: cfg.name, shortName: (cfg.shortName || cfg.name.slice(0, 3)).toUpperCase().slice(0, 4), crest: cfg.crest || null, nation: cfg.nation || (g.LFONations && g.LFONations.forClub(cfg.name)) || null,
      primaryColor: cfg.primaryColor || '#4a8fbf', secondaryColor: cfg.secondaryColor || '#ffffff',
      stadium: { name: cfg.stadium || 'Estadio ' + cfg.name, capacity: cap, level: cfg.level || 1 },
      finances: { balance: cfg.balance != null ? cfg.balance : 20e6, ledger: [], seasonIncome: 0, seasonExpense: 0, debtRounds: 0, ticketPrice: TLM.DEFAULTS.ticketPrice },
      squad: [], reputation: cfg.rep || 50, controlledBy: cfg.controlledBy || 'ai', aiProfile: cfg.profile || 'balanced',
      history: { titles: 0, seasons: [], bestFinish: null }, tactics: TLM.clone(TLM.DEFAULT_TACTICS),
      lineup: { xi: Array(11).fill(null), bench: [] }, lineupMode: 'auto',
      plan: { ifWinning: 'keep', ifLosing: 'keep', fromMinute: { minute: 70, mode: 'keep' }, autoSubs: false },
      training: { individual: 'attack', team: 'attack', teamBoost: 0 }, observed: { matches: 0, channels: { left: 0, center: 0, right: 0 }, pressing: 0, possession: 0 },
      base: !!cfg.base, foreign: !!cfg.foreign,
    };
    state.clubs[id] = club;
    return club;
  }

  function startingBalance(rep) { return roundMoney(Math.pow(rep / 100, 2.2) * 60e6); }

  function fillSquad(state, club, cfg, used) {
    const r = R(state);
    const baseOvr = 40 + club.reputation * 0.42;
    const seed = cfg.seedNames || [];
    const template = SQUAD_TEMPLATE.slice();
    if (r.chance(0.5)) template.push(r.pick(['DFC', 'MC', 'DC', 'MCD']));
    template.forEach((pos, i) => {
      const starter = i % 2 === 0;
      const ovr = baseOvr + (starter ? 3 : -3) + r.gauss() * 3.6;
      const p = TLM.makePlayer(state, { pos, ovr, age: clamp(round(26 + r.gauss() * 4), 18, 36), _used: used, nationHome: club.nation });
      TLM.moveToClub(state, p.id, club.id, { salary: TLM.salaryOf(p), endSeason: state.season + r.int(1, 4) });
      p.morale = clamp(round(60 + r.gauss() * 6), 30, 90);
    });
    // Los clubes preexistentes del motor conservan los nombres de su once histórico (misma identidad, ahora con ID global).
    const xiSlots = seed.length ? club.squad.map((id) => state.players[id]).filter((p) => p.primaryPosition) : [];
    if (seed.length) {
      const order = ['POR', 'LI', 'DFC', 'DFC', 'LD', 'MC', 'MCD', 'MC', 'EI', 'DC', 'ED'], taken = new Set();
      order.forEach((pos, i) => {
        const p = xiSlots.filter((x) => !taken.has(x.id) && x.primaryPosition === pos).sort((a, b) => b.overall - a.overall)[0];
        if (p && seed[i]) { taken.add(p.id); used.delete(p.canonicalName); p.canonicalName = seed[i]; used.add(seed[i]); }
      });
    }
  }

  // Estado de carrera nuevo. opts: {seed, totalClubs (incl. usuario), userClub|takeClub, worldConfig}
  function createWorld(opts) {
    opts = opts || {};
    const cfg = opts.worldConfig || TLM.WORLD_CONFIG;
    const state = {
      version: 1, id: 'career_' + (opts.seed || Date.now()), seed: (opts.seed || Date.now()) >>> 0, rngState: (opts.seed || Date.now()) >>> 0,
      settings: { rounds: cfg.format.rounds, name: cfg.name }, currentClubId: null, season: cfg.startYear, currentMatchday: 1,
      counters: {}, clubs: {}, players: {}, competitions: {}, fixtures: {},
      market: { listings: {}, offers: {}, freeAgents: [] }, transfers: [], news: [], history: { seasons: [], records: {} },
      scoutReports: {}, matchRecords: {}, scout: { usedThisRound: 0 }, worldConfigId: cfg.id, log: [],
    };
    const r = R(state), used = new Set();
    const wantTotal = Math.max(3, Math.min(opts.totalClubs || cfg.clubs.length + 1, 40));
    const hasUserNew = !!opts.userClub;
    const aiCount = wantTotal - (hasUserNew ? 1 : 0);
    // clubes IA: primero los de la configuración; si hace falta más, se generan clubes procedurales.
    const cfgs = cfg.clubs.slice(0, aiCount);
    for (let i = cfg.clubs.length; cfgs.length < aiCount; i++) cfgs.push(genClubConfig(state, i, used));
    const profiles = Object.keys(TLM.AI_PROFILES);
    cfgs.forEach((c) => {
      const club = newClub(state, Object.assign({ base: true }, c, { balance: startingBalance(c.rep), profile: c.profile || r.pick(profiles) }));
      const f = r.pick(TLM.AI_PROFILES[club.aiProfile].formations); club.tactics.formation = f;
      applyProfileTactics(club);
      fillSquad(state, club, c, used);
    });
    const comp = TLM.createCompetition(state, { id: cfg.id, name: cfg.name, country: cfg.country, crest: cfg.crest, teams: Object.keys(state.clubs), format: cfg.format });
    if (hasUserNew) {
      const u = opts.userClub;
      const club = newClub(state, { name: u.name, shortName: u.shortName, crest: u.crest || null, primaryColor: u.primaryColor, secondaryColor: u.secondaryColor,
        stadium: u.stadium, nation: u.nation || 'peronia', capacity: clamp(round(u.capacity || 12000), 5000, 25000), rep: TLM.DEFAULTS.userStartReputation, balance: TLM.DEFAULTS.userStartBudget, controlledBy: 'user', profile: 'balanced' });
      comp.teams.push(club.id); comp.leagueSize = comp.teams.length;
      state.currentClubId = club.id;
    } else {
      const pick = opts.takeClub != null ? Object.values(state.clubs)[opts.takeClub] : Object.values(state.clubs).sort((a, b) => a.reputation - b.reputation)[Math.floor(Object.keys(state.clubs).length / 2)];
      pick.controlledBy = 'user'; state.currentClubId = pick.id;
    }
    // agentes libres + jugadores en venta
    const fa = TLM.DEFAULTS.freeAgents;
    for (let i = 0; i < fa; i++) {
      const pos = i < 6 ? 'POR' : r.pick(TLM.POSITIONS.filter((p) => p !== 'POR')); // siempre hay porteros libres para armar el once
      const p = TLM.makePlayer(state, { pos, ovr: clamp(58 + r.gauss() * 6.5, 44, 74), age: clamp(round(27 + r.gauss() * 5), 18, 37), _used: used });
      p.contract = { clubId: null, salary: 0, endSeason: 0, status: 'free' };
      state.market.freeAgents.push(p.id);
    }
    TLM.generateSeason(state, comp);
    for (const c of Object.values(state.clubs)) { TLM.autoLineup(state, c); }
    TLM.refreshListings(state);
    addNews(state, 'season', `Arranca la temporada ${seasonLabel(state)} de la ${cfg.name} con ${comp.teams.length} equipos.`);
    return state;
  }

  function genClubConfig(state, i, used) {
    const r = R(state), N = TLM.NAMES;
    let name, tries = 0;
    do { name = r.pick(N.clubA) + ' ' + r.pick(N.clubB); } while (used.has('c:' + name) && tries++ < 30);
    used.add('c:' + name);
    const rep = clamp(round(r.range(40, 66)), 30, 90);
    const hue = r.int(0, 359), col = (h, l) => hslHex(h, 60, l);
    return { name, shortName: name.split(' ').map((w) => w[0]).join('').padEnd(3, 'X').slice(0, 3), crest: null, primaryColor: col(hue, 38), secondaryColor: col((hue + 180) % 360, 88),
      nation: g.LFONations ? r.pick(g.LFONations.list).id : null, stadium: r.pick(N.stadiums) + ' ' + name.split(' ')[1], capacity: round(r.range(12000, 30000) / 1000) * 1000, rep, profile: r.pick(Object.keys(TLM.AI_PROFILES)) };
  }
  function hslHex(h, s, l) {
    s /= 100; l /= 100; const a = s * Math.min(l, 1 - l), f = (n) => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1))))).toString(16).padStart(2, '0'); };
    return '#' + f(0) + f(8) + f(4);
  }

  function applyProfileTactics(club) {
    const pr = TLM.AI_PROFILES[club.aiProfile] || TLM.AI_PROFILES.balanced;
    Object.assign(club.tactics, { mentality: pr.mentality, buildUp: pr.buildUp, pressing: pr.pressing, width: pr.width, tempo: pr.tempo, line: pr.line });
  }

  const seasonLabel = (state) => state.season + '/' + String((state.season + 1) % 100).padStart(2, '0');

  // ---- noticias (plantillas deterministas; la capa completa vive en tlm-news.js) ----
  function addNews(state, kind, text, meta) {
    const n = { id: nextId(state, 'news', 'news'), season: state.season, round: state.currentMatchday, kind, text, meta: meta || null };
    state.news.unshift(n);
    if (state.news.length > 250) state.news.length = 250;
    return n;
  }

  // ---- FINANZAS ----
  function addTx(state, club, type, amount, desc, ref) {
    if (!amount) return;
    club.finances.balance += amount;
    if (amount > 0) club.finances.seasonIncome += amount; else club.finances.seasonExpense += -amount;
    const led = club.finances.ledger;
    led.unshift({ season: state.season, round: state.currentMatchday, type, amount: Math.round(amount), desc, ref: ref || null, balance: Math.round(club.finances.balance) });
    if (led.length > 160) led.length = 160;
  }
  const wageBill = (state, club) => club.squad.reduce((s, id) => s + state.players[id].contract.salary, 0);
  const wagePerRound = (state, club) => wageBill(state, club) / Math.max(1, TLM.totalRounds(state.competitions[state.worldConfigId]) || 30);
  const maintenancePerRound = (club) => club.stadium.capacity * 6 * (1 + (club.stadium.level - 1) * 0.12);
  const baseIncomePerRound = (club) => Math.pow(club.reputation / 100, 2) * 400000;

  function attendance(state, club, opp, formPts) {
    const fill = clamp(0.42 + club.reputation / 200 + (formPts || 0) * 0.02 + opp.reputation / 500 - (club.finances.balance < 0 ? 0.08 : 0), 0.3, 1);
    return round(club.stadium.capacity * fill);
  }
  const ticketPrice = (club) => club.finances.ticketPrice * (1 + (club.reputation - 50) / 200) * (1 + (club.stadium.level - 1) * 0.08);

  // Cobros de la jornada para un club: salarios + mantenimiento (siempre) + TV/base (siempre); entradas sólo local (las cobra applyMatchResult).
  function roundAccounting(state, club) {
    addTx(state, club, 'salary', -wagePerRound(state, club), 'Salarios de la jornada');
    addTx(state, club, 'maintenance', -maintenancePerRound(club), 'Mantenimiento del estadio');
    addTx(state, club, 'tv', baseIncomePerRound(club), 'Derechos y patrocinio');
    // consecuencias de gastar de más
    if (club.finances.balance < 0) {
      club.finances.debtRounds++;
      club.squad.forEach((id) => { const p = state.players[id]; p.morale = clamp(p.morale - (club.finances.debtRounds > 2 ? 2 : 1), 0, 100); });
      club.reputation = clamp(club.reputation - 0.15, 1, 100);
    } else club.finances.debtRounds = 0;
  }

  function financeStatus(state, club) {
    const wb = wageBill(state, club);
    if (club.finances.balance < -Math.max(2e6, wb * 0.5)) return 'crisis';
    if (club.finances.balance < 0) return 'warning';
    return 'ok';
  }
  const canSpend = (club, amount) => club.finances.balance - amount >= 0;

  function projection(state, club, rounds) {
    const n = rounds || 5, comp = state.competitions[state.worldConfigId];
    const cur = TLM.currentRound(state, comp) || 1;
    let bal = club.finances.balance, inc = 0, exp = 0;
    for (let i = 0; i < n; i++) {
      const fx = TLM.fixturesOf(state, comp, cur + i).find((f) => f.homeId === club.id || f.awayId === club.id);
      if (!fx && cur + i > comp.calendar.length) break;
      let inR = baseIncomePerRound(club), exR = wagePerRound(state, club) + maintenancePerRound(club);
      if (fx && fx.homeId === club.id) inR += attendance(state, club, state.clubs[fx.awayId], 0) * ticketPrice(club);
      inc += inR; exp += exR; bal += inR - exR;
    }
    return { rounds: n, income: Math.round(inc), expense: Math.round(exp), balance: Math.round(bal) };
  }

  function upgradeStadium(state, club) {
    const next = TLM.DEFAULTS.stadiumLevels[club.stadium.level]; // índice = nivel actual → siguiente
    if (!next) return { ok: false, reason: 'Nivel máximo' };
    if (!canSpend(club, next.cost)) return { ok: false, reason: 'Saldo insuficiente (' + TLM.money(next.cost) + ')' };
    addTx(state, club, 'stadium', -next.cost, 'Ampliación del estadio a nivel ' + next.level);
    club.stadium.level = next.level; club.stadium.capacity += next.add;
    club.reputation = clamp(club.reputation + 0.5, 1, 100);
    addNews(state, 'club', `${club.name} amplía su estadio: ahora tiene capacidad para ${club.stadium.capacity.toLocaleString('es-AR')} espectadores.`, { clubId: club.id });
    return { ok: true, next };
  }
  const stadiumUpgradeInfo = (club) => TLM.DEFAULTS.stadiumLevels[club.stadium.level] || null;

  function setTraining(state, club, individual, team) {
    if (individual && TLM.TRAINING.individual.some((t) => t[0] === individual)) club.training.individual = individual;
    if (team && TLM.TRAINING.team.some((t) => t[0] === team)) { if (team !== club.training.team) club.training.teamBoost = 0; club.training.team = team; }
    return club.training;
  }

  // Edición del club (nombre, colores, escudo, estadio). NO permite tocar jugadores.
  function editClub(state, clubId, patch) {
    const c = state.clubs[clubId]; if (!c) throw new Error('Club inexistente');
    const hex = (v, d) => (/^#[0-9a-f]{6}$/i.test(v || '') ? v : d);
    if (patch.name) c.name = String(patch.name).slice(0, 32);
    if (patch.shortName) c.shortName = String(patch.shortName).toUpperCase().slice(0, 4);
    if (patch.primaryColor) c.primaryColor = hex(patch.primaryColor, c.primaryColor);
    if (patch.secondaryColor) c.secondaryColor = hex(patch.secondaryColor, c.secondaryColor);
    if (patch.crest !== undefined) c.crest = patch.crest;
    if (patch.stadium) c.stadium.name = String(patch.stadium).slice(0, 40);
    if (patch.capacity && c.controlledBy === 'user' && !c.history.seasons.length) c.stadium.capacity = clamp(round(patch.capacity), 5000, 25000);
    return c;
  }

  Object.assign(TLM, { newClub, createWorld, applyProfileTactics, seasonLabel, addNews, addTx, wageBill, wagePerRound, maintenancePerRound, baseIncomePerRound, attendance, ticketPrice,
    roundAccounting, financeStatus, canSpend, projection, upgradeStadium, stadiumUpgradeInfo, setTraining, editClub, startingBalance, SQUAD_TEMPLATE, fillSquad, profilesOf: () => Object.keys(TLM.AI_PROFILES) });
})(typeof globalThis !== 'undefined' ? globalThis : this);
