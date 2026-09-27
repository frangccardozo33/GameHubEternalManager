"""Aplica el calendario nuevo (una jornada por día, partidos en cola) a server/src/league-do.js. Se corrió una sola vez."""
import os
P = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'league-do.js')
s = open(P, encoding='utf8').read()


def rep(old, new):
    global s
    assert old in s, old[:80]
    s = s.replace(old, new, 1)


rep("import { MODS } from './mods.js';", "import { MODS } from './mods.js';\nimport { PRE_MS, POST_MS, slotOf, firstDay, orderMatches } from './schedule.js';")
rep("const OPEN_BEFORE_MS = 5 * 60e3; // la transmisión se abre 5 min antes (intro, estudio y anuncios en el cliente)\n", "")

a = s.index("  // ---------- calendario")
b = s.index("  socketsOf(matchId)")
new = '''  // ---------- calendario (ver schedule.js): una jornada por día, a la hora del módulo; los partidos de la jornada van en cola, uno atrás del otro
  preMs() { return this.meta.preMs ?? PRE_MS[this.meta.module] ?? 200e3; }
  plannedStart() {
    const m = this.meta, r = m.rounds || 0;
    m.day0 ??= firstDay(m.module, m.firstKickoff);
    const base = m.fast ? m.firstKickoff + r * m.everyMs : slotOf(m.module, m.day0 + r);
    return Math.max(base, m.notBefore || 0);
  }
  // cola de la jornada actual: primero los partidos entre dos DT humanos, después DT contra IA, al final IA contra IA
  plan() {
    const m = this.meta, r = this.mod.round(this.league); if (!r) return null;
    if (!m.q || m.q.round !== (m.rounds || 0)) { m.q = { round: m.rounds || 0, order: orderMatches(r.matches, Object.keys(m.clubs || {})), idx: 0, openAt: this.plannedStart() }; this.metaDirty = true; }
    return m.q;
  }
  cur() {
    const q = this.meta.q; if (!q || q.round !== (this.meta.rounds || 0)) return null;
    const id = q.order[q.idx]; return id ? { id, openAt: q.openAt, kickoff: q.openAt + this.preMs() } : null;
  }
  roundStart() { const q = this.meta.q; return q && q.round === (this.meta.rounds || 0) ? q.openAt : this.plannedStart(); }   // apertura de la transmisión del partido en curso (o del primero de la jornada)
  status(m, now) {
    if (m.played) return 'final';
    const lv = this.live.get(m.id); if (lv && lv.finished) return 'final';
    const c = this.cur(); if (c && c.id === m.id) return now >= c.kickoff ? 'live' : now >= c.openAt ? 'open' : 'scheduled';
    return 'queued';
  }
  publicState(now = Date.now()) {
    const mod = this.mod, r = mod.round(this.league), q = r ? this.plan() : null, c = this.cur(), st = r ? this.roundStart() : null;
    return {
      module: this.meta.module, year: r?.year ?? null, phase: r?.phase ?? null, week: this.meta.rounds || 0, label: r?.label || null, startAt: st, now,
      teams: mod.teams(this.league), clubs: this.meta.clubs || {},
      matches: r ? r.matches.map((f) => ({ ...f, startAt: c && c.id === f.id ? c.kickoff : null, openAt: c && c.id === f.id ? c.openAt : null, order: q ? q.order.indexOf(f.id) + 1 || null : null, status: this.status(f, now), hud: this.live.get(f.id)?.hud() || null, viewers: [...this.socks.values()].filter((a) => a.match === f.id).length })) : [],
      results: mod.results(this.league), standings: mod.standings(this.league),
    };
  }

  // ---------- ciclo de vida de partidos: solo el partido en curso tiene motor; al terminar se abre la transmisión del siguiente
  ensureLive(now) {
    const r = this.mod.round(this.league); if (!r) return;
    const q = this.plan(); if (!q) return;
    while (q.idx < q.order.length && r.matches.find((f) => f.id === q.order[q.idx])?.played) { q.idx++; this.metaDirty = true; }   // ya jugado (p. ej. tras un reinicio)
    const c = this.cur(); if (!c || this.live.has(c.id) || now < c.openAt) return;
    const saved = (this.meta.live ||= {})[c.id] || {};
    const lv = this.mod.makeLive(this.league, c.id, c.kickoff, { ...saved, gameplans: this.meta.gameplans || {} }, now);
    this.live.set(c.id, lv);
    this.meta.live[c.id] = lv.persist(); this.metaDirty = true;
  }
'''
s = s[:a] + new + s[b:]

# tick: cola
rep("""      if (now >= this.roundStart()) {
        const t = this.mod.tickLeague(this.league, now); let dirty = t.changed;
        if (t.done) { this.mod.finishRound(this.league); this.meta.rounds = (this.meta.rounds || 0) + 1; this.meta.notBefore = Date.now() + 60e3; dirty = true; }""",
    """      if (now >= this.roundStart()) {
        const t = this.mod.tickLeague(this.league, now); let dirty = t.changed;
        if (t.done) { this.mod.finishRound(this.league); this.meta.rounds = (this.meta.rounds || 0) + 1; this.meta.notBefore = Date.now() + POST_MS; dirty = true; }""")
rep("""    if (committed) {
      this.meta.rev = (this.meta.rev || 0) + 1;
      const r = this.mod.round(this.league);
      if (r && r.matches.every((f) => f.played)) {
        this.mod.finishRound(this.league);
        this.meta.rounds = (this.meta.rounds || 0) + 1;
        this.meta.notBefore = Date.now() + 60e3;
      }
      await this.save();""",
    """    if (committed) {
      this.meta.rev = (this.meta.rev || 0) + 1;
      const q = this.meta.q, r = this.mod.round(this.league);
      if (q) { q.idx++; q.openAt = Date.now() + POST_MS; }   // apenas termina, empieza la transmisión del siguiente
      if (r && r.matches.every((f) => f.played)) {
        this.mod.finishRound(this.league);
        this.meta.rounds = (this.meta.rounds || 0) + 1;
        this.meta.notBefore = Date.now() + POST_MS;
        this.meta.q = null;
      }
      await this.save();""")
rep("""    const openAt = this.roundStart() - OPEN_BEFORE_MS;
    await this.ctx.storage.setAlarm(this.live.size || now >= openAt ? now + ALARM_LIVE_MS : openAt);""",
    """    const c = this.cur(), openAt = c ? c.openAt : this.plannedStart();
    await this.ctx.storage.setAlarm(this.live.size || now >= openAt ? now + ALARM_LIVE_MS : openAt);""")
rep("startAt: this.roundStart(), now, status: f ? this.status(f, now) : 'final'", "startAt: (this.cur() && this.cur().id === matchId) ? this.cur().kickoff : null, now, status: f ? this.status(f, now) : 'final'")
rep("      this.meta = { module: b.module, firstKickoff: +b.firstKickoff, everyMs: Math.max(60e3, +b.everyMs || 864e5), rounds: 0,", "      this.meta = { module: b.module, firstKickoff: +b.firstKickoff, everyMs: Math.max(1e3, +b.everyMs || 864e5), fast: !!b.fast, preMs: b.preMs || undefined, day0: firstDay(b.module, +b.firstKickoff), rounds: 0,")
open(P, 'w', encoding='utf8').write(s)
print('ok')
