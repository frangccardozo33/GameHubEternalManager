import { Random } from '../sim/math.js';
import { MatchSimulator } from '../sim/match.js';
import { World, seedTeams, emptySeasonLine, emptyTeamSeason, makeFreeAgents, potentialFor, contractFor } from './generator.js';
import { ROSTER_MAX, ROSTER_TARGET } from './constants.js';
import { autoDepth, LineupProvider, syncDepth } from './lineup.js';
import { GameRecorder } from './recorder.js';
import { weeklyTraining, weeklyRecovery, offseasonProgression } from './training.js';
import { cpuMaintain, generateOffers, weeklyFinance, askFor, newContract, canSign, attachPlayer, releasePlayer, payroll } from './economy.js';
import { matchupGameplan } from './scouting.js';
import { clone, shuffle, sum } from './util.js';
import { makeGameplan } from '../sim/gameplan.js';
import { insertCup, advanceCup } from './cup.js';

const hash = str => { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const NUM_KEYS = Object.keys(emptySeasonLine());

export class League {
  constructor(data) {
    this.data = data;
    if (!data.rng) { data.rng = new Random(0); data.rng.state = data.rngState >>> 0; }
    this.world = new World(data);
    if (data.cup === undefined) data.cup = null;   // partidas guardadas antes de la copa: la primera es la de la temporada que viene
    // El staff técnico fue retirado del juego: se neutralizan sus efectos (rating fijo, sin sueldo ni vencimientos), también en partidas guardadas.
    this._neutralizeStaff(); this._fixTicket();
  }
  _fixTicket() { for (const t of Object.values(this.data.teams || {})) if (t.finance) t.finance.ticket = 85; }
  _neutralizeStaff() { for (const s of Object.values(this.data.staff || {})) { s.rating = 50; s.salary = 0; s.years = 99; s.expiring = false; } }
  get rng() { return this.data.rng; }
  uid(prefix) { return prefix + (++this.data.counters[prefix]); }
  static create({ userTeam = 'NTH', seasonLength = 14, seed = (Date.now() % 900000) + 1, quarterSeconds = 300 } = {}) {
    const data = { v: 1, seed, rng: new Random(seed), counters: { p: 0, s: 0, g: 0, o: 0, n: 0 }, usedNames: {}, year: 2026, phase: 'regular', week: 0, seasonLength, userTeam, settings: { quarterSeconds },
      teams: {}, players: {}, staff: {}, freeAgents: [], staffPool: [], teamOrder: [], calendar: [], results: {}, offers: [], newsLog: [], champions: [], userGames: [], weekStartRanks: {}, history: [] };
    const lg = new League(data);
    seedTeams(lg.world); lg._neutralizeStaff(); lg._fixTicket();
    for (const t of Object.values(data.teams)) autoDepth(lg, t);
    data.teams[userTeam].gameplan = makeGameplan(); // the manager starts from a neutral plan
    lg.buildCalendar(); data.weekStartRanks = lg.rankMap();
    lg.news(`Comienza la temporada ${data.year}. Prepara tu plantilla y tu gameplan.`, 'info');
    return lg;
  }
  serialize() { this.data.rngState = this.data.rng.state; return JSON.stringify({ ...this.data, rng: undefined }); }
  static load(json) { const data = JSON.parse(json); if (!data || data.v !== 1) throw new Error('Guardado incompatible'); return new League(data); }

  // ---------- accessors
  get user() { return this.data.teams[this.data.userTeam]; }
  team(id) { return this.data.teams[id]; }
  player(id) { return this.data.players[id]; }
  roster(team) { return team.roster.map(id => this.data.players[id]); }
  news(text, type = 'info', team = null) { const d = this.data; d.newsLog.unshift({ id: this.uid('n'), year: d.year, week: d.week + 1, text, type, team }); if (d.newsLog.length > 90) d.newsLog.pop(); }

  // ---------- calendar
  buildCalendar() {
    const d = this.data, ids = [...d.teamOrder], n = ids.length, rounds = [];
    const t = [...ids];
    for (let r = 0; r < n - 1; r++) {
      const games = [];
      for (let i = 0; i < n / 2; i++) { let a = t[i], b = t[n - 1 - i]; if ((r + i) % 2 === 1) [a, b] = [b, a]; games.push({ home: a, away: b }); }
      rounds.push(games); t.splice(1, 0, t.pop());
    }
    let order = shuffle(this.rng, rounds);
    if (d.seasonLength > n - 1) order = order.concat(order.map(g => g.map(x => ({ home: x.away, away: x.home }))));
    else order = order.slice(0, d.seasonLength);
    d.calendar = order.map((games, i) => ({ type: 'regular', label: `Semana ${i + 1}`, fixtures: games.map(g => ({ id: this.uid('g'), type: 'regular', home: g.home, away: g.away, played: false, score: null })) }));
    d.calendar = insertCup(this, d.calendar);   // semanas de la Copa LGO intercaladas
  }
  currentWeek() { return this.data.calendar[this.data.week] ?? null; }
  userFixture() { const w = this.currentWeek(); return w ? w.fixtures.find(f => !f.played && (f.home === this.data.userTeam || f.away === this.data.userTeam)) ?? null : null; }
  userSchedule() {
    const u = this.data.userTeam;
    return this.data.calendar.map((w, i) => ({ week: i, label: w.label, type: w.type, fx: w.fixtures.find(f => f.home === u || f.away === u) ?? null }));
  }
  standings() {
    const rows = Object.values(this.data.teams).map(t => { const gp = t.record.w + t.record.l + t.record.t; return { id: t.id, name: t.name, ...t.record, gp, diff: t.record.pf - t.record.pa, pct: gp ? (t.record.w + t.record.t / 2) / gp : 0, form: t.form }; });
    rows.sort((a, b) => b.pct - a.pct || b.diff - a.diff || b.pf - a.pf || hash(a.id) - hash(b.id));
    rows.forEach((r, i) => r.rank = i + 1); return rows;
  }
  rankMap() { return Object.fromEntries(this.standings().map(r => [r.id, r.rank])); }

  // ---------- matches
  seedFor(fx) { return (this.data.seed * 31 + this.data.year * 97 + hash(fx.id)) >>> 0; }
  buildMatch(fx, { userGameplan = null } = {}) {
    const d = this.data, home = d.teams[fx.home], away = d.teams[fx.away];
    const providers = [new LineupProvider(this, home.id), new LineupProvider(this, away.id)];
    const gpFor = (t, o) => t.id === d.userTeam ? clone(userGameplan || t.gameplan) : matchupGameplan(this, t, o);
    const gps = [gpFor(home, away), gpFor(away, home)];
    const teams = [home, away].map((t, i) => ({ id: t.id, name: t.name, short: t.short, city: t.city, mascot: t.mascot, color: t.color, dark: t.dark, style: t.style, defense: t.defense, gameplan: gps[i], roster: providers[i], discipline: providers[i].discipline }));
    const rec = new GameRecorder(this, home.id, away.id);
    const sim = new MatchSimulator({ seed: this.seedFor(fx), rules: { quarterSeconds: d.settings.quarterSeconds, penalties: true, overtime: fx.type === 'regular' ? 1 : 6 }, teams, recorder: rec });
    return { sim, rec, providers, fixture: fx };
  }
  commitGame(ctx) {
    const d = this.data, { sim, rec, providers, fixture: fx } = ctx, P = d.players, ids = [fx.home, fx.away];
    if (fx.played) return d.results[fx.id];
    const summary = rec.summary(sim, { id: fx.id, week: d.week + 1, year: d.year, type: fx.type, home: fx.home, away: fx.away });
    const score = [...sim.drive.score]; fx.played = true; fx.score = score; fx.ot = summary.overtime;
    let win = score[0] > score[1] ? 0 : score[1] > score[0] ? 1 : -1;
    if (win < 0 && fx.type !== 'regular') { win = 0; fx.tiebreak = true; }
    fx.winner = win < 0 ? null : ids[win]; summary.winner = fx.winner;
    summary.week = d.week + 1;
    const userIn = ids.includes(d.userTeam);
    for (let i = 0; i < 2; i++) {
      const t = d.teams[ids[i]], opp = d.teams[ids[1 - i]], res = win === i ? 'W' : win < 0 ? 'T' : 'L', mine = rec.tg[i];
      if (fx.type === 'regular') { t.record[res === 'W' ? 'w' : res === 'L' ? 'l' : 't']++; t.record.pf += score[i]; t.record.pa += score[1 - i]; t.form.push(res); if (t.form.length > 5) t.form.shift(); }
      for (const k of Object.keys(emptyTeamSeason())) { if (k === 'cov') { for (const [c, n] of Object.entries(mine.cov)) t.season.cov[c] = (t.season.cov[c] || 0) + n; } else t.season[k] = (t.season[k] || 0) + (mine[k] || 0); }
      t.finance.hype = Math.max(10, Math.min(95, t.finance.hype + (res === 'W' ? 4 : res === 'L' ? -3 : 0)));
      weeklyFinance(this, t, { home: i === 0, playoff: fx.type === 'semi' || fx.type === 'final' }); t._finWeek = d.week;
      const prov = providers[i];
      for (const [pid, n] of Object.entries(prov.played)) { const p = P[pid]; p.season.gp++; p.form = Math.max(25, Math.min(80, p.form + (res === 'W' ? 3 : res === 'L' ? -2 : 0))); p.morale = Math.max(20, Math.min(95, p.morale + (res === 'W' ? 2 : -1))); }
      for (const [pid, f] of Object.entries(prov.fat)) P[pid].fatigue = Math.round(f * 10) / 10;
      for (const inj of prov.injuries) { const p = P[inj.pid]; p.injury = { type: inj.type, weeks: inj.weeks, total: inj.weeks }; p.form = Math.max(25, p.form - 6); if (t.id === d.userTeam) this.news(`Lesión: ${p.name} (${p.pos}) · ${inj.type} · ${inj.weeks} sem.`, 'injury', t.id); }
      // append to player logs and seasons
      for (const [pid, line] of Object.entries(rec.lines)) {
        const p = P[pid]; if (!p || p.teamId !== t.id) continue;
        for (const k of NUM_KEYS) if (k !== 'gp') p.season[k] += line[k] || 0;
        const text = rec.headline(line, p.pos); if (text) { p.log.push({ year: d.year, week: d.week + 1, opp: opp.short, res: `${res} ${score[i]}-${score[1 - i]}`, text }); if (p.log.length > 8) p.log.shift(); }
      }
    }
    for (const t of summary.top) { const p = P[t.pid]; if (p) p.form = Math.min(80, p.form + 5); }
    d.results[fx.id] = userIn ? summary : { id: fx.id, week: summary.week, year: d.year, type: fx.type, home: fx.home, away: fx.away, score, overtime: summary.overtime, winner: fx.winner, top: summary.top.slice(0, 2), slim: true };
    if (userIn) { d.userGames.push(fx.id); d.lastResult = fx.id; }
    return summary;
  }
  simulateFixture(fx) { const ctx = this.buildMatch(fx); ctx.sim.simulateToEnd(); return this.commitGame(ctx); }

  // Finishes the current week: plays what is left, then training/recovery/finances/market and advances the calendar.
  completeWeek() {
    const d = this.data, wk = this.currentWeek(); if (!wk) return null;
    for (const fx of wk.fixtures) if (!fx.played) this.simulateFixture(fx);
    this.processWeek(wk);
    const userFx = wk.fixtures.find(f => f.home === d.userTeam || f.away === d.userTeam);
    const summary = userFx ? d.results[userFx.id] : null;
    if (summary && !summary.slim) { summary.standings = { before: d.weekStartRanks, after: this.rankMap(), rows: this.standings().map(r => ({ id: r.id, w: r.w, l: r.l, t: r.t })) }; }
    d.weekStartRanks = null;
    d.week++;
    if (wk.type === 'cup') advanceCup(this, wk);
    if ((wk.type === 'regular' || wk.type === 'cup') && d.week >= d.calendar.filter(w => w.type === 'regular' || w.type === 'cup').length) this.startPlayoffs();
    else if (wk.type === 'semi') this.startFinal(wk);
    else if (wk.type === 'final') this.endSeason(wk);
    d.weekStartRanks = this.rankMap();
    return summary;
  }
  finishUserMatch(ctx) { this.commitGame(ctx); return this.completeWeek(); }
  advance() { const fx = this.userFixture(); if (fx) this.simulateFixture(fx); return this.completeWeek(); }
  processWeek(wk) {
    const d = this.data, playedIds = new Set(wk.fixtures.flatMap(f => [f.home, f.away]));
    for (const t of Object.values(d.teams)) {
      const changes = weeklyTraining(this, t), healed = weeklyRecovery(this, t);
      if (!playedIds.has(t.id) || t._finWeek !== d.week) weeklyFinance(this, t, { home: false });
      if (t.id === d.userTeam) {
        for (const c of changes.sort((a, b) => b.delta - a.delta).slice(0, 3)) this.news(`Entrenamiento: ${d.players[c.pid].name} sube a ${d.players[c.pid].ovr} (+${c.delta}).`, 'training', t.id);
        for (const pid of healed) this.news(`${d.players[pid].name} vuelve de su lesión.`, 'injury', t.id);
      } else autoDepth(this, t);
    }
    cpuMaintain(this); generateOffers(this);
  }
  startPlayoffs() {
    const d = this.data, s = this.standings().slice(0, 4);
    d.phase = 'playoffs'; d.seeds = s.map(r => r.id);
    d.calendar.push({ type: 'semi', label: 'Semifinales', fixtures: [[0, 3], [1, 2]].map(([a, b]) => ({ id: this.uid('g'), type: 'semi', home: s[a].id, away: s[b].id, played: false, score: null })) });
    this.news(`Comienzan los playoffs. Clasificados: ${s.map(r => r.id).join(', ')}.`, 'playoffs');
  }
  startFinal(wk) {
    const d = this.data, [a, b] = wk.fixtures.map(f => f.winner), order = [a, b].sort((x, y) => d.seeds.indexOf(x) - d.seeds.indexOf(y));
    d.calendar.push({ type: 'final', label: 'Championship game', fixtures: [{ id: this.uid('g'), type: 'final', home: order[0], away: order[1], played: false, score: null }] });
  }
  leaders(key, n = 5) {
    return Object.values(this.data.players).filter(p => p.season[key] > 0).sort((a, b) => b.season[key] - a.season[key]).slice(0, n).map(p => ({ pid: p.id, name: p.name, team: p.teamId, pos: p.pos, value: Math.round(p.season[key] * 10) / 10 }));
  }
  endSeason(finalWk) {
    const d = this.data, champ = finalWk.fixtures[0].winner, P = d.players;
    d.champions.push({ year: d.year, team: champ });
    d.phase = 'offseason';
    this.news(`${d.teams[champ].name} gana el campeonato ${d.year}.`, 'champion', champ);
    const rows = this.standings();
    d.history.push({ year: d.year, champion: champ, userRecord: { ...this.user.record }, userRank: rows.find(r => r.id === d.userTeam).rank, leaders: { passYds: this.leaders('passYds', 1)[0], rushYds: this.leaders('rushYds', 1)[0], recYds: this.leaders('recYds', 1)[0], sacks: this.leaders('sacks', 1)[0], ints: this.leaders('ints', 1)[0] } });
    for (const p of Object.values(P)) { if (p.season.gp || p.season.passAtt || p.season.rushAtt) p.history.push({ year: d.year, team: p.teamId, ovr: p.ovr, age: p.age, ...p.season }); }
    const retired = offseasonProgression(this);
    for (const pid of retired) {
      const p = P[pid], t = p.teamId ? d.teams[p.teamId] : null;
      if (t) { t.roster = t.roster.filter(x => x !== pid); for (const k of Object.keys(t.depth)) t.depth[k] = t.depth[k].filter(x => x !== pid); if (t.id === d.userTeam) this.news(`${p.name} (${p.pos}, ${p.age}) se retira.`, 'retire', t.id); }
      d.freeAgents = d.freeAgents.filter(x => x !== pid); delete P[pid];
    }
    for (const t of Object.values(d.teams)) {
      for (const id of t.roster) { const p = P[id]; p.contract.years -= 1; if (p.contract.years <= 0) p.expiring = true; }
      syncDepth(this, t);
    }
    // los rookies entran por el draft
    this.startDraft();
  }
  // ---------- Draft ----------
  startDraft() {
    const d = this.data, order = this.standings().slice().sort((a, b) => b.rank - a.rank).map(r => r.id), rounds = 3;
    const pool = makeFreeAgents(this.world, order.length * rounds + 10, { young: true });
    for (const id of pool) d.players[id].prospect = true;
    d.draft = { year: d.year, rounds, order, pick: 0, pool, log: [], done: false };
    this.news(`Se abre el draft ${d.year}: ${pool.length} prospectos disponibles.`, 'draft');
    this.draftAdvance();
  }
  draftCurrent() {
    const dr = this.data.draft; if (!dr || dr.done) return null;
    const n = dr.order.length; return { round: Math.floor(dr.pick / n) + 1, n: (dr.pick % n) + 1, teamId: dr.order[dr.pick % n] };
  }
  _draftSelect(pid) {
    const d = this.data, dr = d.draft, cur = this.draftCurrent(), p = d.players[pid], team = d.teams[cur.teamId];
    if (team.roster.length >= ROSTER_MAX) { const w = this.roster(team).filter(x => !x.prospect).sort((a, b) => a.ovr - b.ovr)[0]; if (w) releasePlayer(this, team.id, w.id, { silent: true }); }
    const factor = Math.max(0.45, 0.85 - (cur.round - 1) * 0.12 - (cur.n - 1) * 0.01);
    dr.pool = dr.pool.filter(x => x !== pid); p.prospect = false; p.joined = d.year;
    attachPlayer(this, team, p, contractFor(this.world, p, { years: 4, factor }));
    dr.log.push({ round: cur.round, n: cur.n, team: team.id, pid });
    if ((cur.round === 1 && cur.n <= 5) || team.id === d.userTeam) this.news(`Draft: ${team.short} elige a ${p.name} (${p.pos}, ${p.ovr}/${p.potential}) en la ronda ${cur.round}.`, 'draft', team.id);
    dr.pick++; if (dr.pick >= dr.order.length * dr.rounds) this._draftClose();
  }
  _draftCpuPick() {
    const d = this.data, dr = d.draft, team = d.teams[this.draftCurrent().teamId], P = d.players;
    const have = {}; for (const id of team.roster) have[P[id].pos] = (have[P[id].pos] || 0) + 1;
    const best = dr.pool.map(id => P[id]).map(p => ({ p, s: p.ovr * .6 + p.potential * .4 + ((have[p.pos] || 0) < (ROSTER_TARGET[p.pos] || 3) ? 4 : -3) - ((p.pos === 'K' || p.pos === 'P') ? 25 : 0) + this.rng.range(-3, 3) })).sort((a, b) => b.s - a.s)[0];
    this._draftSelect(best.p.id);
  }
  draftAdvance() {
    const d = this.data; while (d.draft && !d.draft.done) { const cur = this.draftCurrent(); if (cur.teamId === d.userTeam) return; this._draftCpuPick(); }
  }
  draftPick(pid) {
    const d = this.data, dr = d.draft, cur = this.draftCurrent();
    if (!cur || cur.teamId !== d.userTeam) return { ok: false, message: 'Todavía no es tu turno.' };
    if (!dr.pool.includes(pid)) return { ok: false, message: 'Ese jugador ya no está disponible.' };
    const p = d.players[pid]; this._draftSelect(pid); return { ok: true, message: `Elegiste a ${p.name} (${p.pos}).` };
  }
  draftSimAll() {
    const d = this.data; while (d.draft && !d.draft.done) {
      const cur = this.draftCurrent(), P = d.players;
      if (cur.teamId === d.userTeam) { const b = d.draft.pool.map(id => P[id]).sort((a, c) => (c.ovr + c.potential) - (a.ovr + a.potential))[0]; this._draftSelect(b.id); } else this._draftCpuPick();
    }
  }
  _draftClose() {
    const d = this.data, dr = d.draft; dr.done = true;
    for (const id of dr.pool) { d.players[id].prospect = false; d.freeAgents.push(id); } dr.pool = [];
    this.news('El draft terminó: los prospectos no elegidos pasan a agentes libres.', 'draft');
  }

  startNextSeason() {
    const d = this.data, P = d.players;
    if (d.draft && !d.draft.done) this.draftSimAll();
    for (const t of Object.values(d.teams)) {
      const isUser = t.id === d.userTeam;
      for (const id of [...t.roster]) {
        const p = P[id]; if (!p.expiring) continue;
        const ask = askFor(this, p, t.id), chk = canSign(this, t, p, ask, p);
        const keep = !isUser && chk.ok && (p.ovr >= 68 ? this.rng.chance(.85) : p.ovr >= 60 ? this.rng.chance(.5) : this.rng.chance(.15));
        if (keep) { p.contract = newContract(ask); p.expiring = false; } else releasePlayer(this, t.id, id, { silent: true });
      }
      t.deadCap = 0; t.record = { w: 0, l: 0, t: 0, pf: 0, pa: 0, streak: '' }; t.form = []; t.season = emptyTeamSeason(); t.finance.hype = Math.round(t.finance.hype * .8 + 10); t.finance.log = t.finance.log.slice(-6);
      for (const id of t.roster) { const p = P[id]; p.season = emptySeasonLine(); p.log = []; }
      autoDepth(this, t);
    }
    for (const id of d.freeAgents) P[id].season = emptySeasonLine();
    for (let i = 0; i < 3; i++) cpuMaintain(this);
    // trim the market so the save stays small
    if (d.freeAgents.length > 110) { const drop = d.freeAgents.map(id => P[id]).sort((a, b) => a.ovr - b.ovr).slice(0, d.freeAgents.length - 110); for (const p of drop) delete P[p.id]; d.freeAgents = d.freeAgents.filter(id => P[id]); }
    for (const p of Object.values(P)) p.ovr0 = p.ovr;
    d.year++; d.phase = 'regular'; d.week = 0; d.offers = []; delete d.seeds;
    this.buildCalendar(); d.weekStartRanks = this.rankMap();
    this.news(`Comienza la temporada ${d.year}.`, 'info');
  }
  fireExpiredStaff(team, sid) {
    const d = this.data, s = d.staff[sid];
    for (const k of ['hc', 'oc', 'dc']) if (team.staff[k] === sid) team.staff[k] = null;
    team.staff.scouts = team.staff.scouts.filter(x => x !== sid); team.staff.trainers = team.staff.trainers.filter(x => x !== sid);
    s.teamId = null; s.years = 2; d.staffPool.push(sid); this.news(`${s.name} (staff) deja el club al vencer su contrato.`, 'staff', team.id);
  }
  async advanceMany(weeks, onProgress) {
    let out = 0;
    for (let i = 0; i < weeks && this.data.phase !== 'offseason'; i++) {
      this.advance(); out++; onProgress?.(i + 1, weeks);
      await new Promise(r => setTimeout(r, 0));
    }
    return out;
  }
  validate() {
    const d = this.data, out = [];
    for (const t of Object.values(d.teams)) {
      if (t.roster.length > 53) out.push(`${t.id}: roster ${t.roster.length} > 53`);
    }
    return out;
  }
}
