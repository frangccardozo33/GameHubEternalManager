import { clamp } from '../simulation/model.js';
import { ROLES } from './data.js';
import { makePlayer, valueOf, autoRole } from './players.js';

export const LIM = { min: 10, max: 15, minContract: 1.0 };
export const ROLE_LVL = { star: 5, starter: 4, sixth: 3, rotation: 2, bench: 1, prospect: 0 };
export const prefYears = p => (p.age <= 24 ? 4 : p.age <= 29 ? 3 : p.age <= 32 ? 2 : 1);
const r1 = x => Math.round(x * 10) / 10;

export function install(Game) {
  Object.assign(Game.prototype, {
    // ---------- salario y ofertas ----------
    capRoom(team) { return this.cfg.salaryCap - this.payroll(team); },
    askFor(p, renewal = false) {
      let a = valueOf(p);
      if (renewal) a *= clamp(1 + (65 - p.morale) / 65 * 0.15, 0.92, 1.2); // descontento → pide más
      return Math.max(0.5, r1(a));
    },
    // Evalúa una oferta {salary, years, role}. Acepta si cubre lo que pide (ajustado por rol y duración).
    evalOffer(p, o, renewal = false) {
      let ask = this.askFor(p, renewal); const desired = ROLE_LVL[autoRole(p)], offered = ROLE_LVL[o.role] ?? 0;
      if (offered < desired) ask *= 1 + 0.08 * (desired - offered);
      ask *= 1 + 0.02 * Math.abs(o.years - prefYears(p)); ask = Math.max(0.5, r1(ask));
      const ratio = o.salary / ask;
      return { status: ratio >= 0.98 ? 'accept' : ratio >= 0.88 ? 'counter' : 'reject', ask, ratio };
    },
    freeNumber(team) { const used = new Set(team.roster.map(id => this.player(id).num)); for (let n = 0; n < 100; n++) if (!used.has(n)) return n; return 99; },
    attach(p, team, contract) {
      p.teamId = team.id; p.contract = contract; p.morale = 70; p.num = this.freeNumber(team); p.prospect = false;
      team.roster.push(p.id); this.s.fa = this.s.fa.filter(id => id !== p.id);
    },
    repairLineup(team) {
      const ids = new Set(team.roster), ok = id => ids.has(id) && !this.player(id).inj; let st = team.lineup.starters.filter(ok), bn = team.lineup.bench.filter(id => ok(id) && !st.includes(id));
      const rest = this.roster(team).filter(p => !st.includes(p.id) && !bn.includes(p.id)).sort((a, b) => (a.inj ? 1 : 0) - (b.inj ? 1 : 0) || b.ovr - a.ovr);
      while (st.length < 5 && (bn.length || rest.length)) st.push(bn.length ? bn.shift() : rest.shift().id);
      while (bn.length < 5 && rest.length && !rest[0].inj) bn.push(rest.shift().id);
      team.lineup = { starters: st, bench: bn };
      for (const id of [...st, ...bn]) if (team.plan.minutes[id] == null) team.plan.minutes[id] = 0.3;
      if (!ids.has(team.plan.closer)) team.plan.closer = st[0];
    },
    // ---------- traspasos entre equipos de la IA ----------
    // Intercambios 1x1 de valor parecido entre dos equipos controlados por la IA (respetan tope y plantilla).
    aiTrades(count = 1) {
      const cpu = this.s.teams.filter(t => !t.isUser), cap = this.cfg.salaryCap, pick = arr => arr[Math.floor(this.rng.next() * arr.length)];
      for (let k = 0; k < count; k++) {
        const a = pick(cpu), b = pick(cpu); if (a === b) continue;
        const ra = this.roster(a).filter(p => !p.inj).sort((x, y) => y.ovr - x.ovr).slice(2), rb = this.roster(b).filter(p => !p.inj).sort((x, y) => y.ovr - x.ovr).slice(2);
        if (!ra.length || !rb.length) continue;
        const p1 = pick(ra), v1 = this.tradeValue(p1); if (v1 <= 0) continue;
        const p2 = rb.map(p => ({ p, d: Math.abs(this.tradeValue(p) - v1) / v1 })).filter(x => x.d < 0.15).sort((x, y) => x.d - y.d)[0]?.p; if (!p2) continue;
        const s1 = p1.contract?.salary ?? 0, s2 = p2.contract?.salary ?? 0;
        if (this.payroll(a) - s1 + s2 > cap && s2 > s1) continue; if (this.payroll(b) - s2 + s1 > cap && s1 > s2) continue;
        a.roster = a.roster.filter(x => x !== p1.id).concat(p2.id); b.roster = b.roster.filter(x => x !== p2.id).concat(p1.id);
        p1.teamId = b.id; p2.teamId = a.id; p1.num = this.freeNumber(b); p2.num = this.freeNumber(a); p1.morale = p2.morale = 65;
        this.autoLineup(a); this.autoLineup(b);
        this.news('Traspaso en la liga', `${a.short} y ${b.short} intercambian a ${p1.name} (${p1.ovr}) por ${p2.name} (${p2.ovr}).`, 'trade');
      }
    },
    // ---------- ofertas de la IA por jugadores del usuario ----------
    // Un equipo de la IA propone un 1x1: pide a un jugador tuyo y ofrece uno de valor parecido (o algo mayor).
    genOffers() {
      const s = this.s, u = this.user, cap = this.cfg.salaryCap; s.offers = (s.offers || []).filter(o => o.exp >= s.day && this.player(o.give)?.teamId === u.id && this.player(o.get)?.teamId === o.teamId);
      if (s.offers.length >= 3 || this.rng.next() > 0.3 || u.roster.length <= LIM.min) return;
      const mine = this.roster(u).filter(p => !p.inj && !s.offers.some(o => o.give === p.id)).sort((a, b) => b.ovr - a.ovr).slice(1); if (!mine.length) return;
      const p = mine[Math.floor(this.rng.next() * mine.length)], v = this.tradeValue(p); if (v <= 0) return;
      const cpu = this.s.teams.filter(t => !t.isUser).sort(() => this.rng.next() - 0.5);
      for (const t of cpu) {
        const q = this.roster(t).filter(x => !x.inj).map(x => ({ x, r: this.tradeValue(x) / v })).filter(o => o.r >= 0.75 && o.r <= 1.0).sort((a, b) => b.r - a.r)[0]?.x; if (!q) continue;
        const sp = p.contract?.salary ?? 0, sq = q.contract?.salary ?? 0;
        if (this.payroll(u) - sp + sq > cap && sq > sp) continue; if (this.payroll(t) - sq + sp > cap && sp > sq) continue;
        s.offers.push({ id: s.nid.n++, teamId: t.id, give: p.id, get: q.id, exp: s.day + 6 });
        this.news('Oferta de traspaso', `${t.name} ofrece a ${q.name} (${q.ovr}) por ${p.name} (${p.ovr}). Míralo en Mercado › Ofertas.`, 'trade'); return;
      }
    },
    acceptOffer(id) {
      const s = this.s, o = (s.offers || []).find(x => x.id === id); if (!o) return { ok: false, msg: 'La oferta ya no está disponible.' };
      s.offers = s.offers.filter(x => x !== o);
      const u = this.user, sg = this.player(o.give).contract?.salary ?? 0, sr = this.player(o.get).contract?.salary ?? 0;
      if (this.payroll(u) - sg + sr > this.cfg.salaryCap && sr > sg) return { ok: false, msg: 'Superarías el tope salarial con este traspaso.' };
      this.executeTrade(o.teamId, [o.give], [o.get]); return { ok: true, msg: 'Traspaso completado.' };
    },
    rejectOffer(id) { this.s.offers = (this.s.offers || []).filter(x => x.id !== id); },
    // ---------- agentes libres ----------
    signFreeAgent(pid, o) {
      const p = this.player(pid), t = this.user;
      if (!this.s.fa.includes(pid)) return { ok: false, msg: 'El jugador ya no está disponible.' };
      if (t.roster.length >= LIM.max) return { ok: false, msg: `Plantilla completa (máximo ${LIM.max}). Libera a alguien primero.` };
      const room = this.capRoom(t);
      if (this.fin.cash < 0) return { ok: false, msg: 'Saldo negativo: no puedes fichar.' };
      if (o.salary > room + 1e-9 && o.salary > LIM.minContract) return { ok: false, msg: `No cabe en el tope salarial (margen ${r1(room)} M€). Con el tope superado solo se pueden fichar contratos mínimos (≤ ${LIM.minContract} M€).` };
      const ev = this.evalOffer(p, o);
      if (ev.status !== 'accept') return { ok: false, ...ev, msg: ev.status === 'counter' ? `Casi: pide ${ev.ask} M€ para ese rol y duración.` : `Oferta muy baja: pide ${ev.ask} M€.` };
      this.attach(p, t, { salary: o.salary, years: o.years + (this.s.phase === 'offseason' ? 1 : 0), role: o.role, bonus: 0, clauses: { noTrade: false, rolePromise: false } });
      this.repairLineup(t); this.news('Fichaje', `${p.name} (${p.role}, OVR ${p.ovr}) firma ${o.years} año(s) por ${o.salary} M€.`);
      return { ok: true, msg: `${p.name} ha firmado.` };
    },
    // ---------- renovaciones ----------
    renewPlayer(pid, o) {
      const p = this.player(pid), t = this.user;
      if (p.teamId !== t.id) return { ok: false, msg: 'Ese jugador no es tuyo.' };
      if (p.contract.years > 1) return { ok: false, msg: 'Solo se puede renovar cuando le queda 1 año de contrato.' };
      const ev = this.evalOffer(p, o, true);
      if (ev.status !== 'accept') return { ok: false, ...ev, msg: ev.status === 'counter' ? `Casi: pide ${ev.ask} M€.` : `Muy lejos de lo que pide (${ev.ask} M€).` };
      p.contract = { salary: o.salary, years: 1 + o.years, role: o.role, bonus: 0, clauses: p.contract.clauses }; p.morale = clamp(p.morale + 4, 0, 100);
      this.news('Renovación', `${p.name} renueva ${o.years} año(s) por ${o.salary} M€.`); return { ok: true, msg: `${p.name} ha renovado.` };
    },
    // ---------- liberar (con indemnización) ----------
    releasePlayer(pid, teamId = this.s.userId) {
      const t = this.team(teamId), p = this.player(pid);
      if (t.roster.length <= LIM.min) return { ok: false, msg: `Necesitas al menos ${LIM.min} jugadores.` };
      const c = p.contract, buy = r1(c.salary * 0.5), yrs = Math.min(c.years, 3); (t.dead ??= []).push({ name: p.name, amt: buy, years: yrs });
      t.roster = t.roster.filter(id => id !== pid); p.teamId = null; p.contract = null; this.s.fa.push(pid); this.repairLineup(t);
      if (t.isUser) this.news('Jugador liberado', `${p.name} deja el club. Indemnización: ${buy} M€ durante ${yrs} temporada(s).`);
      return { ok: true, msg: `Liberado. Pagarás ${buy} M€ durante ${yrs} temporada(s).` };
    },
    // ---------- traspasos ----------
    tradeValue(p) {
      const eff = p.ovr + Math.max(0, p.pot - p.ovr) * clamp((27 - p.age) / 8, 0, 1) * 0.6, age = p.age > 30 ? Math.max(0.3, 1 - 0.08 * (p.age - 30)) : 1;
      const sur = clamp((valueOf(p) - (p.contract?.salary ?? 0)) / Math.max(valueOf(p), 1), -0.3, 0.3);
      return Math.pow(Math.max(0, eff - 58), 2.4) * age * (1 + sur) / 40;
    },
    evalTrade(teamId, mine, theirs) {
      const u = this.user, t = this.team(teamId), sum = (ids, f) => ids.reduce((a, id) => a + f(this.player(id)), 0);
      if (!mine.length && !theirs.length) return { ok: false, msg: 'Selecciona jugadores.' };
      if (!theirs.length) return { ok: false, msg: 'Selecciona al menos un jugador que quieras recibir.' };
      const nu = u.roster.length - mine.length + theirs.length, nt = t.roster.length - theirs.length + mine.length;
      if (nu < LIM.min || nu > LIM.max) return { ok: false, msg: `Tu plantilla quedaría en ${nu} jugadores (debe estar entre ${LIM.min} y ${LIM.max}).` };
      if (nt < LIM.min || nt > LIM.max) return { ok: false, msg: `${t.short} quedaría con ${nt} jugadores: no lo aceptan.` };
      const sal = p => p.contract.salary, outU = sum(mine, sal), inU = sum(theirs, sal);
      if (this.payroll(u) - outU + inU > this.cfg.salaryCap && inU > outU) return { ok: false, msg: `Superarías el tope salarial: el salario entrante (${r1(inU)} M€) no puede exceder el saliente (${r1(outU)} M€).` };
      if (this.payroll(t) - inU + outU > this.cfg.salaryCap && outU > inU) return { ok: false, msg: `${t.short} superaría el tope: no pueden absorber ${r1(outU)} M€ a cambio de ${r1(inU)} M€.` };
      const give = sum(mine, p => this.tradeValue(p)), get = sum(theirs, p => this.tradeValue(p)), star = t.roster.map(id => this.player(id)).sort((a, b) => b.ovr - a.ovr)[0];
      const need = theirs.includes(star.id) ? 1.3 : 1.1, ratio = get > 0 ? give / get : 9;
      return ratio >= need ? { ok: true, ratio, msg: '¡Aceptan!' } : { ok: false, ratio, msg: `Valoran tu oferta en un ${Math.round(ratio / need * 100)}% de lo que necesitan${theirs.includes(star.id) ? ' (es su jugador franquicia: exigen un plus)' : ''}.` };
    },
    executeTrade(teamId, mine, theirs) {
      const u = this.user, t = this.team(teamId);
      for (const id of mine) { u.roster = u.roster.filter(x => x !== id); t.roster.push(id); this.player(id).teamId = t.id; this.player(id).num = this.freeNumber(t); this.player(id).morale = 65; }
      for (const id of theirs) { t.roster = t.roster.filter(x => x !== id); u.roster.push(id); this.player(id).teamId = u.id; this.player(id).num = this.freeNumber(u); this.player(id).morale = 65; }
      this.repairLineup(u); this.autoLineup(t);
      this.news('Traspaso', `Con ${t.name}: sales ${mine.map(i => this.player(i).name).join(', ') || '—'}; llegan ${theirs.map(i => this.player(i).name).join(', ')}.`);
    },
    // ---------- scouting y draft ----------
    generateProspects() {
      const s = this.s, rng = this.rng; s.prospects ??= [];
      for (let i = 0; i < s.cfg.teams * 2 + 6; i++) {
        const p = makePlayer(rng, `P${s.nid.p++}`, { role: rng.pick(ROLES), tier: -8 - Math.pow(rng.next(), 0.7) * 20, age: Math.floor(rng.range(19, 22)) });
        p.pot = clamp(Math.round(p.ovr + rng.range(6, 22)), p.ovr, 95); p.prospect = true; p.scout = 0; p.nz = { o: rng.range(-1, 1), p: rng.range(-1, 1) }; p.teamId = null; p.contract = null;
        s.players[p.id] = p; s.prospects.push(p.id);
      }
    },
    // Lo que ve el usuario: estimaciones con margen de error que se reduce al ojear.
    prospectView(p) {
      const err = 1 + 9 * (1 - p.scout / 100), o = p.ovr + p.nz.o * err * 0.6, q = p.pot + p.nz.p * err * 0.6;
      return { ovr: [Math.round(o - err), Math.round(o + err)], pot: [Math.min(99, Math.round(q - err)), Math.min(99, Math.round(q + err))], err };
    },
    scoutProspect(pid) {
      const p = this.player(pid); if (this.s.scoutPts <= 0) return { ok: false, msg: 'No te quedan puntos de scouting esta temporada.' };
      if (p.scout >= 100) return { ok: false, msg: 'Ya lo conoces al detalle.' };
      this.s.scoutPts--; p.scout = Math.min(100, p.scout + 35); return { ok: true };
    },
    rookieSalary: n => Math.max(0.6, r1(3.0 * Math.exp(-0.06 * (n - 1)))),
    startDraft() {
      const s = this.s; if (!s.prospects?.length) this.generateProspects();
      const order = this.standings().map(x => x.id).reverse(), picks = []; let n = 1;
      for (let r = 1; r <= 2; r++) for (const id of order) picks.push({ n: n++, round: r, teamId: id });
      s.off = { stage: 'draft', pos: 0, picks, made: [] };
    },
    draftAvailable() { return this.s.prospects.map(id => this.player(id)); },
    draftSelect(pid) {
      const off = this.s.off, pick = off.picks[off.pos], p = this.player(pid), t = this.team(pick.teamId);
      if (t.roster.length >= LIM.max + 3) { /* margen de plantilla en offseason; se recorta al empezar la temporada */ }
      this.s.prospects = this.s.prospects.filter(id => id !== pid); p.prospect = false; p.teamId = t.id; p.contract = { salary: this.rookieSalary(pick.n), years: 4, role: 'prospect', bonus: 0, clauses: { noTrade: false, rolePromise: false } };
      p.num = this.freeNumber(t); p.morale = 75; t.roster.push(pid); off.made.push({ ...pick, pid }); off.pos++;
      if (t.isUser) this.news('Draft', `Eliges a ${p.name} en el puesto #${pick.n} (${this.rookieSalary(pick.n)} M€ · 4 temporadas).`);
      if (off.pos >= off.picks.length) this.finishDraft();
    },
    draftPickAI() {
      const pool = this.draftAvailable().map(p => ({ p, v: p.pot * 0.6 + p.ovr * 0.4 + this.rng.range(-4, 4) })).sort((a, b) => b.v - a.v);
      this.draftSelect(pool[0].p.id);
    },
    draftToUser() { const off = this.s.off; while (off.stage === 'draft' && off.pos < off.picks.length && off.picks[off.pos].teamId !== this.s.userId) this.draftPickAI(); },
    completeDraft() { const off = this.s.off; while (off?.stage === 'draft') this.draftPickAI(); },
    finishDraft() {
      const s = this.s; for (const id of s.prospects) { const p = this.player(id); p.prospect = false; p.teamId = null; p.contract = null; s.fa.push(id); }
      s.prospects = []; s.off.stage = 'market';
    },
    // ---------- IA en la agencia libre ----------
    aiOffseason() {
      const s = this.s;
      this.aiTrades(5);
      for (const t of s.teams) if (!t.isUser) while (t.roster.length > LIM.max) { const w = this.roster(t).sort((a, b) => a.ovr - b.ovr)[0]; t.roster = t.roster.filter(id => id !== w.id); w.teamId = null; w.contract = null; s.fa.push(w.id); }
      const order = s.teams.filter(t => !t.isUser).sort(() => this.rng.next() - 0.5);
      for (const t of order) for (let g = 0; g < 6 && t.roster.length < 14; g++) {
        const room = this.capRoom(t), c = s.fa.map(id => this.player(id)).filter(p => !p.retired).sort((a, b) => b.ovr - a.ovr).find(p => { const a = this.askFor(p); return a <= room || a <= LIM.minContract; });
        if (!c) break; this.attach(c, t, { salary: Math.max(0.5, this.askFor(c)), years: prefYears(c), role: autoRole(c), bonus: 0, clauses: { noTrade: false, rolePromise: false } });
      }
    },
    // Garantiza que el usuario pueda jugar: ficha automáticamente contratos mínimos si tiene menos de 10 jugadores.
    ensureUserRoster() {
      const t = this.user, added = [];
      while (t.roster.length < LIM.min) {
        const c = this.s.fa.map(id => this.player(id)).filter(p => !p.retired).sort((a, b) => b.ovr - a.ovr)[0]; if (!c) break;
        this.attach(c, t, { salary: LIM.minContract, years: 1, role: 'bench', bonus: 0, clauses: { noTrade: false, rolePromise: false } }); added.push(c.name);
      }
      if (added.length) { this.repairLineup(t); this.news('Fichajes de emergencia', `Con menos de ${LIM.min} jugadores no se puede jugar: se han fichado ${added.join(', ')} con contrato mínimo.`); }
      return added;
    },
  });
}
