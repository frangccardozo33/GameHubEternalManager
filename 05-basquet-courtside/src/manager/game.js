import { Random, clamp, defaultTactics, DEFAULT_RULES } from '../simulation/model.js';
import { MatchSimulator } from '../simulation/match.js';
import { ROLES, TEAM_POOL, TEAM_ROLES, USAGE } from './data.js';
import { makePlayer, newContract, valueOf, progress, NEW_STATS, autoRole } from './players.js';
import { eff } from './stats.js';
import { install, LIM } from './market.js';
import { install as installClub } from './club.js';
import { install as installCup } from './cup.js';
import { fmtDay } from './dates.js';

export const DEFAULT_CFG = { teams: 8, meetings: 2, playoffTeams: 4, bestOf: [3, 3, 5], periodSeconds: 180, shotClock: 24, salaryCap: 1e6 };
const TIERS = [9, 5, 1, -2, -4, -8, -10, -12, -16, -18, -20, -22, -22];
const RANK_W = [1, 0.97, 0.93, 0.88, 0.82, 0.62, 0.5, 0.35, 0.2, 0.1];
const HOME_PATTERN = [1, 1, 0, 0, 1, 0, 1];
export const EFF_REF = 0.75; // eficiencia por minuto "esperada" de un jugador medio (calibrada con partidos simulados)
const tick = () => new Promise(r => setTimeout(r, 0));

export class Game {
  constructor(s) {
    this.s = s; this.rng = new Random(1); this.rng.state = s.rng >>> 0;
    s.cfg.salaryCap = 1e6; // sin tope salarial (igual que en fútbol)
    this.initClub(); if (s.cup === undefined && s.phase === 'regular' && s.schedule?.length) { this.initCup(); if (s.cup && s.day >= s.cup.slots[0]) { s.cup.done = true; s.cup.skipped = true; } } s.prospects ??= []; s.scoutPts ??= 6; s.off ??= null; for (const t of s.teams) t.dead ??= [];
    if (!s.prospects.length && s.phase !== 'offseason') this.generateProspects();
  }
  toJSON() { this.s.rng = this.rng.state; return this.s; }
  // ---------- acceso ----------
  get cfg() { return this.s.cfg; }
  team = id => this.s.teams[id];
  player = id => this.s.players[id];
  get user() { return this.s.teams[this.s.userId]; }
  roster = team => team.roster.map(id => this.s.players[id]);
  gameMinutes() { return this.cfg.periodSeconds * DEFAULT_RULES.periods / 60; }
  payroll = team => this.roster(team).reduce((a, p) => a + (p.contract?.salary ?? 0), 0) + (team.dead ?? []).reduce((a, d) => a + d.amt, 0);
  teamOvr(team) { const ps = this.roster(team).sort((a, b) => b.ovr - a.ovr).slice(0, 8); const w = [1.4, 1.3, 1.1, 1, .9, .6, .4, .3]; return ps.reduce((a, p, i) => a + p.ovr * w[i], 0) / w.slice(0, ps.length).reduce((a, b) => a + b, 0); }

  // ---------- creación ----------
  static create(cfgIn = {}, userId = 0, seed = Date.now() % 1e9) {
    const cfg = { ...DEFAULT_CFG, ...cfgIn }; cfg.teams = clamp(cfg.teams - (cfg.teams % 2), 4, TEAM_POOL.length);
    const g = new Game({ v: 1, cfg, season: 1, phase: 'regular', day: 0, userId, teams: [], players: {}, fa: [], schedule: [], po: null, matches: {}, inbox: [], history: [], rng: seed, nid: { p: 1, e: 1, m: 1, n: 1 }, lastReport: null, prospects: [], scoutPts: 6, off: null });
    for (let i = 0; i < cfg.teams; i++) g.createTeam(i);
    g.s.teams.forEach((t, i) => { t.isUser = i === userId; });
    for (let i = 0; i < 14; i++) g.addFreeAgent(-8 - Math.floor(g.rng.range(0, 10)), Math.floor(g.rng.range(22, 35)));
    for (let i = 0; i < 6; i++) g.addFreeAgent(-20, Math.floor(g.rng.range(19, 21)));
    for (let i = 0; i < 3; i++) g.addFreeAgent(-3 - Math.floor(g.rng.range(0, 4)), Math.floor(g.rng.range(31, 35)));
    g.buildSchedule(); g.s.teams.forEach(t => { g.ensureLineup(t, true); });
    g.news('Bienvenido', `Diriges a ${g.user.name}. Ajusta tu quinteto y tus tácticas y juega la primera jornada.`);
    return g;
  }
  createTeam(i) {
    const [city, nick, short, color, alt] = TEAM_POOL[i], rng = this.rng, boost = (rng.range(-1, 1) + rng.range(-1, 1)) * 4.5;
    const t = { id: i, name: `${city} ${nick}`.toUpperCase(), city, nick, short, label: nick.toUpperCase(), color, alt, roster: [], lineup: { starters: [], bench: [] },
      dead: [], tactics: this.aiTactics(), plan: { minutes: {}, closer: null, foulPolicy: 'normal', staminaPolicy: 'normal' }, assign: {}, usage: {}, chem: 60, streak: 0, lastStarters: '', popularity: Math.round(rng.range(40, 80)), isUser: false };
    const roles = [...ROLES].sort(() => rng.next() - 0.5).concat(['PG', 'SG', 'SF', 'PF', 'C', 'SF', 'PF', 'C'].sort(() => rng.next() - 0.5));
    const nums = new Set();
    roles.slice(0, 13).forEach((role, k) => {
      const age = k < 2 ? Math.floor(rng.range(24, 32)) : Math.floor(rng.range(20, 35)), p = makePlayer(rng, `P${this.s.nid.p++}`, { role, tier: TIERS[k] + boost + rng.range(-2, 2), age, teamId: i });
      let n; do { n = Math.floor(rng.range(0, 45)); } while (nums.has(n)); nums.add(n); p.num = n; p.contract = newContract(rng, p); p.morale = 65;
      this.s.players[p.id] = p; t.roster.push(p.id);
    });
    this.s.teams[i] = t; return t;
  }
  aiTactics() { const r = () => Math.round(clamp(50 + this.rng.range(-18, 18), 15, 85)); return { ...defaultTactics(), tempo: r(), inside: r(), pickRoll: r(), transition: r(), ballMovement: 50, shotThree: r(), shotRim: r(), aggression: r(), pressure: r(), defense: this.rng.next() < 0.15 ? 'zone23' : 'man' }; }
  addFreeAgent(tier, age) {
    const p = makePlayer(this.rng, `P${this.s.nid.p++}`, { role: this.rng.pick(ROLES), tier, age }); p.contract = null; p.teamId = null; p.num = Math.floor(this.rng.range(0, 45));
    this.s.players[p.id] = p; this.s.fa.push(p.id); return p;
  }
  news(title, text, type = 'news') { this.s.inbox.unshift({ id: this.s.nid.n++, season: this.s.season, day: this.s.day, type, title, text }); if (this.s.inbox.length > 80) this.s.inbox.pop(); }

  // ---------- alineaciones ----------
  ensureLineup(team, force = false) {
    const ps = this.roster(team), ids = new Set(team.roster), l = team.lineup;
    const hurt = id => !!this.player(id)?.inj;
    const valid = l.starters.length === 5 && !l.starters.some(hurt) && !l.bench.some(hurt) && l.starters.every(id => ids.has(id)) && new Set(l.starters).size === 5 && l.bench.every(id => ids.has(id) && !l.starters.includes(id));
    if (valid && !force) return;
    if (!force && team.isUser) this.repairLineup(team); else this.autoLineup(team, ps);
  }
  autoLineup(team, ps = this.roster(team)) {
    const healthy = ps.filter(p => !p.inj); if (healthy.length >= 5) ps = healthy;
    const sorted = [...ps].sort((a, b) => b.ovr - a.ovr), used = new Set(), starters = [];
    for (const role of ROLES) { const c = sorted.filter(p => !used.has(p.id)).sort((a, b) => (b.ovr - (b.role === role ? 0 : 7)) - (a.ovr - (a.role === role ? 0 : 7)))[0]; starters.push(c.id); used.add(c.id); }
    team.lineup = { starters, bench: sorted.filter(p => !used.has(p.id)).slice(0, 5).map(p => p.id) };
    team.plan.closer = sorted[0].id; this.autoMinutes(team);
  }
  autoMinutes(team) {
    const dressed = [...team.lineup.starters, ...team.lineup.bench], sum = RANK_W.slice(0, dressed.length).reduce((a, b) => a + b, 0); team.plan.minutes = {};
    dressed.forEach((id, i) => { team.plan.minutes[id] = +Math.min(0.92, RANK_W[i] / sum * 5).toFixed(2); });
  }

  // ---------- calendario ----------
  buildSchedule() {
    const n = this.s.cfg.teams, ids = [...Array(n).keys()], rounds = [];
    let arr = [...ids]; // método del círculo
    for (let r = 0; r < n - 1; r++) {
      const round = []; for (let i = 0; i < n / 2; i++) { const a = arr[i], b = arr[n - 1 - i]; round.push(r % 2 ? [b, a] : [a, b]); }
      rounds.push(round); arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)];
    }
    const days = []; const cycles = Math.max(1, Math.round(this.cfg.meetings / 2));
    for (let c = 0; c < cycles; c++) {
      for (const round of rounds) days.push(round.map(([h, a]) => (c % 2 ? [a, h] : [h, a])));
      for (const round of rounds) days.push(round.map(([h, a]) => (c % 2 ? [h, a] : [a, h])));
    }
    this.s.schedule = days.map((games, d) => ({ day: d, games: games.map(([h, a]) => ({ id: `E${this.s.nid.e++}`, home: h, away: a, done: false })) }));
    this.s.day = 0; this.s.phase = 'regular'; this.s.po = null;
    this.initCup();
  }
  standings() {
    const rec = this.s.teams.map(t => ({ id: t.id, w: 0, l: 0, pf: 0, pa: 0, res: [] }));
    for (const d of this.s.schedule) for (const e of d.games) if (e.done) {
      const h = rec[e.home], a = rec[e.away]; h.pf += e.hs; h.pa += e.as; a.pf += e.as; a.pa += e.hs;
      if (e.hs > e.as) { h.w++; a.l++; h.res.push('W'); a.res.push('L'); } else { a.w++; h.l++; a.res.push('W'); h.res.push('L'); }
    }
    return rec.map(r => { const g = r.w + r.l, last = r.res[r.res.length - 1]; let k = 0; for (let i = r.res.length - 1; i >= 0 && r.res[i] === last; i--) k++;
      return { ...r, g, pct: g ? r.w / g : 0, diff: r.pf - r.pa, streak: g ? `${last}${k}` : '-', l10: r.res.slice(-10).filter(x => x === 'W').length + '-' + r.res.slice(-10).filter(x => x === 'L').length }; })
      .sort((a, b) => b.pct - a.pct || b.diff - a.diff || b.pf - a.pf);
  }
  // ---------- día actual ----------
  currentDay() {
    const s = this.s;
    if (this.cupDue()) return this.cupDay();   // ronda de copa entre jornadas
    if (s.phase === 'regular') { const d = s.schedule[s.day]; return d ? { kind: 'regular', label: `Jornada ${s.day + 1} de ${s.schedule.length}`, entries: d.games } : null; }
    if (s.phase === 'playoffs') {
      const r = s.po.rounds[s.po.round]; if (!r) return null;
      if (!s.po.day) s.po.day = r.series.filter(x => !x.done).map(x => {
        const n = x.games.length, hi = HOME_PATTERN[n] === 1; const e = { id: `E${s.nid.e++}`, home: hi ? x.a : x.b, away: hi ? x.b : x.a, done: false, series: x.id, gameNo: n + 1 }; return e;
      });
      return { kind: 'playoff', label: `${r.name} · ${s.po.day[0] ? `Partido ${s.po.day[0].gameNo}` : ''}`, entries: s.po.day };
    }
    return null;
  }
  userEntry() { const d = this.currentDay(); return d?.entries.find(e => !e.done && (e.home === this.s.userId || e.away === this.s.userId)) ?? null; }
  userInPlay() { const d = this.currentDay(); return !!d?.entries.some(e => e.home === this.s.userId || e.away === this.s.userId); }

  // ---------- puente con el motor ----------
  buildSpec(team, side, opp) {
    this.ensureLineup(team); const dressed = [...team.lineup.starters, ...team.lineup.bench].map(id => this.player(id)), gm = this.gameMinutes();
    const bonus = (team.chem - 55) / 45 * 3;
    const clash = side === 1 && this.colorDistance(team.color, opp.color) < 90;
    const players = dressed.map((p, i) => {
      const f = 1 + (p.form - 60) * 0.0007 + (p.morale - 60) * 0.0004, ratings = {};
      for (const k of Object.keys(p.a)) ratings[k] = clamp(p.a[k] * f + (['passing', 'vision', 'decisions', 'defense'].includes(k) ? bonus : 0), 30, 99);
      return { pid: p.id, name: p.name, number: p.num, height: p.h, role: p.role, ratings, ovr: p.ovr, energy: 0.7 + 0.3 * p.cond / 100, skin: p.skin, active: i < 5, slot: i, targetMin: (team.plan.minutes[p.id] ?? 0.3) * gm, usage: USAGE[team.usage[p.id] ?? 'normal'][1] };
    });
    const idOf = pid => { const i = dressed.findIndex(p => p.id === pid); return i < 0 ? null : `${side}-${i}`; };
    const assignments = {}; for (const [defPid, slot] of Object.entries(team.assign)) { const id = idOf(defPid); if (id != null && slot !== '' && slot != null) assignments[id] = Number(slot); }
    return { name: team.name, short: team.short, label: team.label, color: clash ? team.alt : team.color, players, tactics: { ...team.tactics }, plan: { closer: idOf(team.plan.closer), foulPolicy: team.plan.foulPolicy, staminaPolicy: team.plan.staminaPolicy }, assignments, style: 'BALANCED' };
  }
  colorDistance(a, b) { const c = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const [x, y] = [c(a), c(b)]; return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); }
  buildSim(e) {
    const home = this.team(e.home), away = this.team(e.away), seed = Math.floor(this.rng.next() * 1e9) + 1;
    const sim = new MatchSimulator({ seed, rules: { periodSeconds: this.cfg.periodSeconds, shotClock: this.cfg.shotClock }, teams: [this.buildSpec(home, 0, away), this.buildSpec(away, 1, home)] });
    sim.entry = e; return sim;
  }
  async simulateEntry(e, fast = false) {
    const sim = this.buildSim(e); sim.start();
    while (sim.phase !== 'finished') { for (let i = 0; i < 1800 && sim.phase !== 'finished'; i++) sim.step(1 / 20); if (!fast) await tick(); }
    return this.commit(e, sim);
  }
  // ---------- resultado de un partido ----------
  commit(e, sim) {
    const s = this.s, r = sim.result(), gm = r.gameMinutes, po = !!e.series, mid = `M${s.nid.m++}`;
    e.done = true; e.hs = r.scores[0]; e.as = r.scores[1]; e.mid = mid;
    const homeWin = e.hs > e.as, conseq = [], cup = !!e.cup;
    const box = r.teams.map((t, side) => t.players.filter(p => p.pid).map(p => ({ pid: p.pid, name: p.name, num: p.number, role: p.role, gs: p.starter ? 1 : 0, min: +p.minutes.toFixed(2), pts: p.points, reb: p.rebounds, oreb: p.oreb, ast: p.assists, stl: p.steals, blk: p.blocks, tov: p.turnovers, pf: p.fouls, fgm: p.fgm, fga: p.fga, tpm: p.tpm, tpa: p.tpa, ftm: p.ftm, fta: p.fta, pm: p.pm })));
    const teamIds = [e.home, e.away];
    r.teams.forEach((t, side) => {
      const team = this.team(teamIds[side]), won = side === 0 ? homeWin : !homeWin;
      for (const line of box[side]) {
        const p = this.player(line.pid), share = line.min / gm, d = { morale: 0, form: 0, cond: 0 };
        if (line.min > 0) {
          const st = po ? p.stpo : p.st; if (!cup) { st.gp++; st.gs += line.gs; st.min += line.min;
          for (const k of ['pts', 'reb', 'oreb', 'ast', 'stl', 'blk', 'tov', 'pf', 'fgm', 'fga', 'tpm', 'tpa', 'ftm', 'fta', 'pm']) st[k] += line[k];
          const p1 = t.players.find(x => x.pid === line.pid); st.rim += p1.rimM; st.rima += p1.rimA; }
        }
        if (line.min > 0 && share >= 0.12) { const perMin = eff(line) / Math.max(line.min, 0.5), exp = EFF_REF * (0.7 + p.ovr / 270); d.form = clamp(Math.round((perMin - exp) * 9), -6, 6); }
        d.cond = -Math.round(38 * share);
        const exp = TEAM_ROLES[p.contract?.role ?? autoRole(p)][1];
        d.morale = (won ? 2 : -2) * (po ? 1.5 : 1) + (share < exp * 0.5 && exp >= 0.3 ? -2 : share >= exp ? 1 : 0);
        p.form = clamp(p.form + d.form, 20, 100); p.cond = clamp(p.cond + d.cond, 25, 100); p.morale = clamp(Math.round(p.morale + d.morale), 10, 100);
        this.rollInjury(p, share, po, team.isUser);
        line.d = d;
      }
      const set = [...team.lineup.starters].sort().join(); team.streak = set === team.lastStarters ? team.streak + 1 : 0; team.lastStarters = set;
      const avgM = this.roster(team).reduce((a, p) => a + p.morale, 0) / team.roster.length; team.chem = clamp(Math.round(50 + Math.min(team.streak, 20) * 1.6 + (avgM - 65) * 0.4), 20, 95);
    });
    const ts = { h: { ...r.teams[0].stats, fouls: box[0].reduce((a, b) => a + b.pf, 0) }, a: { ...r.teams[1].stats, fouls: box[1].reduce((a, b) => a + b.pf, 0) } };
    s.matches[mid] = { id: mid, season: s.season, day: s.day, kind: po ? 'playoff' : cup ? 'cup' : 'regular', home: e.home, away: e.away, hs: e.hs, as: e.as, periods: r.periods, ot: r.overtime, box: { h: box[0], a: box[1] }, ts, tac: { h: { ...sim.teams[0].tactics }, a: { ...sim.teams[1].tactics } }, series: e.series ?? null, gm };
    if (e.home === s.userId) this.bookMatchRevenue(e);
    if (po) { const x = this.series(e.series); x.games.push(mid); if (e.hs > e.as === (e.home === x.a)) x.wA++; else x.wB++; }
    const u = this.s.userId;
    if (e.home === u || e.away === u) { const won = (e.home === u) === (e.hs > e.as); this.news(`${won ? 'Victoria' : 'Derrota'} ${e.hs}-${e.as}`, `${this.team(e.home).name} ${e.hs} – ${e.as} ${this.team(e.away).name}`, 'result'); }
    return s.matches[mid];
  }
  // ---------- fin de jornada ----------
  async finishDay(onProgress, fast = false) {
    const day = this.currentDay(); if (!day) return;
    this.ensureUserRoster();
    const pending = day.entries.filter(e => !e.done);
    for (const t of this.s.teams) if (!t.isUser) this.ensureLineup(t);
    let i = 0;
    for (const e of pending) { onProgress?.(++i, pending.length); await this.simulateEntry(e, fast); }
    this.endDay(day);
  }
  // ---------- lesiones ----------
  rollInjury(p, share, po, isUser) {
    if (p.inj || share <= 0) return;
    const chance = 0.014 * share * (1.25 - p.cond / 250) * (po ? 0.8 : 1);
    if (this.rng.next() >= chance) return;
    const r = this.rng.next(), games = r < 0.6 ? 1 + Math.floor(this.rng.next() * 2) : r < 0.92 ? 2 + Math.floor(this.rng.next() * 4) : 5 + Math.floor(this.rng.next() * 6);
    const types = ['Esguince de tobillo', 'Molestias en la rodilla', 'Distensión muscular', 'Golpe en la espalda', 'Lesión en la muñeca', 'Fatiga muscular'];
    p.inj = { games, total: games, type: types[Math.floor(this.rng.next() * types.length)] };
    if (isUser) this.news('Lesión', `${p.name}: ${p.inj.type}. Baja ${games} partido${games > 1 ? 's' : ''}.`, 'injury');
  }
  healInjuries() {
    for (const p of Object.values(this.s.players)) {
      if (!p.inj) continue; p.inj.games--;
      if (p.inj.games <= 0) { delete p.inj; if (p.teamId === this.s.userId) this.news('Lesión', `${p.name} vuelve a estar disponible.`, 'injury'); }
    }
  }
  endDay(day) {
    const s = this.s;
    this.healInjuries();
    this.genOffers();
    if (day.kind === 'regular' && s.day % 6 === 5) this.aiTrades(1);
    const recBonus = this.recoveryBonus();
    for (const p of Object.values(s.players)) { p.cond = clamp(p.cond + 30 + (p.teamId === s.userId ? recBonus : 0), 0, 100); p.form += (60 - p.form) * 0.08; p.morale += (65 - p.morale) * 0.03; }
    if (day.kind === 'regular') {
      this.bookDay(); this.trainDay(); s.day++;
      if (s.day >= s.schedule.length) { if (this.cfg.playoffTeams >= 2) this.startPlayoffs(); else this.closeSeason(this.standings()[0].id); }
    } else if (day.kind === 'cup') this.advanceCup();
    else this.advancePlayoffs();
  }
  // ---------- playoffs ----------
  series = id => this.s.po.rounds.flatMap(r => r.series).find(x => x.id === id);
  startPlayoffs() {
    const s = this.s, P = clamp(this.cfg.playoffTeams, 2, 8), seeds = this.standings().slice(0, P).map(x => x.id);
    s.phase = 'playoffs'; s.po = { seeds, rounds: [], round: 0, day: null, champion: null };
    this.makeRound(seeds); this.news('¡Empiezan los playoffs!', `Clasificados: ${seeds.map(id => this.team(id).short).join(', ')}`);
    if (!seeds.includes(s.userId)) this.news('Fuera de los playoffs', 'Tu equipo no se ha clasificado. Puedes simular el resto de la temporada.');
  }
  makeRound(ids) {
    const s = this.s, n = ids.length, size = 2 ** Math.ceil(Math.log2(n)), idx = s.po.rounds.length, roundsTotal = Math.ceil(Math.log2(size));
    const name = size === 2 ? 'Final' : size === 4 ? 'Semifinales' : size === 8 ? 'Cuartos de final' : 'Ronda'; if (s.po.total == null) s.po.total = roundsTotal; const arr = this.cfg.bestOf, bo = arr[arr.length - s.po.total + idx] ?? arr[Math.min(idx, arr.length - 1)] ?? 3;
    const order = [...ids].sort((a, b) => s.po.seeds.indexOf(a) - s.po.seeds.indexOf(b)), series = []; const advance = [];
    for (let i = 0; i < size / 2; i++) {
      const A = order[i], B = order[size - 1 - i];
      if (B === undefined) { advance.push(A); continue; }
      series.push({ id: `S${s.po.rounds.length}_${i}`, a: A, b: B, wA: 0, wB: 0, bo, games: [], done: false, winner: null });
    }
    s.po.rounds.push({ name, series, byes: advance }); s.po.round = s.po.rounds.length - 1; s.po.day = null; s.po.roundsTotal = roundsTotal;
    if (!series.length) this.advancePlayoffs();
  }
  advancePlayoffs() {
    const s = this.s, r = s.po.rounds[s.po.round]; s.po.day = null;
    for (const x of r.series) if (!x.done) { const need = Math.ceil(x.bo / 2); if (x.wA >= need || x.wB >= need) { x.done = true; x.winner = x.wA >= need ? x.a : x.b; } }
    if (r.series.some(x => !x.done)) return;
    const winners = [...r.byes, ...r.series.map(x => x.winner)];
    if (winners.length === 1) { s.po.champion = winners[0]; this.closeSeason(winners[0]); return; }
    this.makeRound(winners);
  }
  // ---------- cierre de temporada ----------
  closeSeason(champId) {
    const s = this.s; s.phase = 'offseason'; const st = this.standings();
    const qual = Object.values(s.players).filter(p => p.teamId != null && p.st.gp >= Math.max(1, s.schedule.length * 0.5));
    const best = key => qual.map(p => ({ p, v: key(p) })).sort((a, b) => b.v - a.v)[0]?.p;
    const mvp = best(p => eff(p.st) / p.st.gp), scorer = best(p => p.st.pts / p.st.gp);
    s.history.unshift({ season: s.season, champion: champId, best: st[0].id, mvp: mvp ? { id: mvp.id, name: mvp.name, team: mvp.teamId } : null, scorer: scorer ? { id: scorer.id, name: scorer.name, team: scorer.teamId, ppg: +(scorer.st.pts / scorer.st.gp).toFixed(1) } : null, userPos: st.findIndex(x => x.id === s.userId) + 1 });
    this.news(`Final de la temporada ${s.season}`, `Campeón: ${this.team(champId).name}${mvp ? ` · MVP: ${mvp.name}` : ''}`);
    this.closeFinance(champId, st.findIndex(x => x.id === s.userId) + 1); this.startDraft(); this.news('Draft', 'La clase del draft está lista. Tienes contratos por renovar y el mercado abierto.');
  }
  // ---------- nueva temporada: envejecimiento, progresión, renovaciones y retiradas ----------
  startNextSeason() {
    const s = this.s, rng = this.rng, report = { players: [], retired: [], rookies: [], renewed: [], expired: [], released: [], training: [] };
    if (s.off?.stage === 'draft') this.completeDraft();
    for (const p of Object.values(s.players)) {
      if (p.retired) continue;
      if (p.st.gp || p.stpo.gp) p.hist.push({ s: s.season, team: p.teamId, ...p.st, po: { ...p.stpo }, ovr: p.ovr, age: p.age });
      p.ovrHist.push({ s: s.season, ovr: p.ovr, pot: p.pot }); p.st = NEW_STATS(); p.stpo = NEW_STATS(); p.age++;
      if (p.teamId != null && p.teamId !== s.userId) this.aiTraining(p);
      const r = progress(rng, p); const tr = this.applyTraining(p); if (tr) { r.delta += tr.ovrDelta; if (p.teamId === s.userId) report.training.push(this.trainingReport(p, tr)); } p.cond = 100; p.form = 60; p.morale += (65 - p.morale) * 0.5;
      if (p.teamId === s.userId) report.players.push({ id: p.id, name: p.name, age: p.age, ovr: p.ovr, delta: r.delta, pot: p.pot });
      if (p.age >= 35 && p.ovr < 82 && rng.next() < (p.age - 34) * 0.28) {
        if (p.teamId != null) { const t = this.team(p.teamId); t.roster = t.roster.filter(id => id !== p.id); if (p.teamId === s.userId) report.retired.push(p.name); }
        s.fa = s.fa.filter(id => id !== p.id); p.retired = true; p.teamId = null; p.contract = null; continue;
      }
      if (p.teamId != null && p.contract) {
        p.contract.years--;
        if (p.contract.years <= 0) {
          const mine = p.teamId === s.userId, keep = !mine && (p.ovr >= 64 || rng.next() < 0.3) && rng.next() < 0.8;
          if (keep) p.contract = newContract(rng, p, autoRole(p));
          else { const t = this.team(p.teamId); t.roster = t.roster.filter(id => id !== p.id); p.teamId = null; p.contract = null; s.fa.push(p.id); if (mine) report.expired.push(p.name); }
        }
      }
    }
    for (const t of s.teams) { t.dead = (t.dead ?? []).map(d => ({ ...d, years: d.years - 1 })).filter(d => d.years > 0); }
    this.aiOffseason();
    for (const t of s.teams) {
      if (t.isUser) continue;
      while (t.roster.length < 13) { const p = this.addFreeAgent(-16 + rng.range(-3, 3), Math.floor(rng.range(19, 22))); s.fa = s.fa.filter(id => id !== p.id); p.teamId = t.id; p.contract = newContract(rng, p, 'prospect'); p.num = this.freeNumber(t); t.roster.push(p.id); }
    }
    const u = this.user; while (u.roster.length > LIM.max) { const w = this.roster(u).sort((a, b) => a.ovr - b.ovr)[0]; u.roster = u.roster.filter(id => id !== w.id); w.teamId = null; w.contract = null; s.fa.push(w.id); report.released.push(w.name); }
    this.ensureUserRoster();
    s.fa = s.fa.filter(id => !s.players[id].retired); s.fa.sort((a, b) => s.players[b].ovr - s.players[a].ovr); s.fa = s.fa.slice(0, 40);
    for (let i = 0; i < 8; i++) this.addFreeAgent(-9 - Math.floor(rng.range(0, 8)), Math.floor(rng.range(20, 35)));
    for (const [id, m] of Object.entries(s.matches)) if (m.season < s.season) delete s.matches[id];
    s.season++; s.off = null; this.newSeasonFinance(); this.generateProspects(); this.buildSchedule(); for (const t of s.teams) { t.streak = 0; this.autoLineupIfBroken(t); }
    this.news(`Temporada ${s.season}`, 'La progresión ha sido aplicada. Revisa el informe de tu plantilla.'); s.lastReport = report; return report;
  }
  autoLineupIfBroken(t) { if (t.isUser) this.repairLineup(t); else this.autoLineup(t); }
  // ---------- estadísticas ----------
  leaders(key, n = 10, po = false) {
    const min = Math.max(1, (po ? 1 : this.s.schedule.length * 0.35));
    return Object.values(this.s.players).filter(p => p.teamId != null && (po ? p.stpo : p.st).gp >= (po ? 1 : Math.ceil(min))).map(p => ({ p, v: key(po ? p.stpo : p.st) })).sort((a, b) => b.v - a.v).slice(0, n);
  }
  matchesOfSeason() { return Object.values(this.s.matches).filter(m => m.season === this.s.season && m.kind === 'regular'); }
  timeline() { return this.s.phase === 'offseason' ? 'Fuera de temporada' : this.s.phase === 'playoffs' ? `Playoffs · ${this.s.po.rounds[this.s.po.round]?.name ?? ''} · ${fmtDay(this.s.season, this.s.schedule.length + this.s.po.round * 4, true)}` : `Liga regular · jornada ${Math.min(this.s.day + 1, this.s.schedule.length)}/${this.s.schedule.length} · ${fmtDay(this.s.season, Math.min(this.s.day, this.s.schedule.length - 1), true)}`; }
}
export { valueOf };
install(Game);
installCup(Game);
installClub(Game);
