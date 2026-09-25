// Copa LBO: torneo corto de eliminatoria a partido único que se juega entre jornadas de la liga regular.
// Cuartos, semifinales y final con los mejores 8 equipos por nivel (si la liga tiene 4-7 equipos, semifinales y final).
// Los partidos de copa son partidos normales (mismo motor, lesiones y recaudación) pero no cuentan para la clasificación
// ni para las estadísticas de la temporada. Se guardan en s.cup; los campeones anteriores en s.cupHistory.
import { syncCashToTouchline } from './club.js';

export const CUP = { name: 'Copa LBO', fractions: { 3: [0.22, 0.52, 0.82], 2: [0.4, 0.8] }, prizes: [1, 2, 4], champion: 6, runnerUp: 2 };   // premios en M€ por ronda ganada
const ROUND_NAMES = { 8: 'Cuartos de final', 4: 'Semifinales', 2: 'Final' };
function bracketOrder(n) { let o = [1]; while (o.length < n) { const m = o.length * 2 + 1; o = o.flatMap(x => [x, m - x]); } return o; }

export function install(Game) {
  Object.assign(Game.prototype, {
    // Crea la copa de la temporada actual (se llama al armar el calendario y al cargar partidas viejas sin copa).
    initCup() {
      const s = this.s, n = s.teams.length; if (n < 4) { s.cup = null; return null; }
      const size = n >= 8 ? 8 : 4, rounds = Math.log2(size);
      const seeds = [...s.teams].sort((a, b) => this.teamOvr(b) - this.teamOvr(a)).map(t => t.id).slice(0, size);
      if (!seeds.includes(s.userId)) seeds[size - 1] = s.userId;
      const L = s.schedule.length, slots = CUP.fractions[rounds].map(f => Math.max(1, Math.round(L * f)));
      s.cup = { name: CUP.name, season: s.season, size, seeds, slots, rounds: [], round: 0, done: false, champion: null, runnerUp: null };
      this.makeCupRound(seeds, true);
      return s.cup;
    },
    makeCupRound(ids, first = false) {
      const s = this.s, c = s.cup, n = ids.length, ties = [];
      const order = first ? bracketOrder(n).map(k => ids[k - 1]) : ids;
      for (let i = 0; i < n; i += 2) {
        const a = order[i], b = order[i + 1], hi = c.seeds.indexOf(a) <= c.seeds.indexOf(b);
        ties.push({ id: `E${s.nid.e++}`, home: hi ? a : b, away: hi ? b : a, done: false, cup: true });
      }
      c.rounds.push({ name: ROUND_NAMES[n] ?? 'Ronda', ties });
    },
    // ¿toca una ronda de copa antes de la próxima jornada de liga?
    cupDue() { const c = this.s.cup; return !!(c && !c.done && this.s.phase === 'regular' && c.slots[c.round] != null && this.s.day >= c.slots[c.round]); },
    cupDay() { const c = this.s.cup, r = c.rounds[c.round]; return { kind: 'cup', label: `${c.name} · ${r.name}`, entries: r.ties }; },
    // Termina una ronda de copa: define ganadores, premios y arma la ronda siguiente.
    advanceCup() {
      const s = this.s, c = s.cup, r = c.rounds[c.round]; if (!c || r.ties.some(t => !t.done)) return;
      const u = s.userId, prize = (id, m, why) => { if (id !== u || !m) return; const f = this.fin; f.cash += m; f.season.bonus += m; syncCashToTouchline(m); this.news('Premio de copa', `${why}: +${m} M€.`); };
      r.ties.forEach(t => { t.winner = t.hs > t.as ? t.home : t.away; });
      const winners = r.ties.map(t => t.winner), last = r.ties.length === 1, idx = c.round + (CUP.prizes.length - c.rounds.length + (last ? 0 : 0));
      for (const t of r.ties) {
        const w = this.team(t.winner), l = this.team(t.winner === t.home ? t.away : t.home), you = t.home === u || t.away === u;
        if (you || this.teamOvr(w) + 3 < this.teamOvr(l)) this.news(`${c.name}: ${r.name}`, `${w.name} elimina a ${l.name} (${t.hs}-${t.as}).`, 'result');
      }
      if (last) {
        const t = r.ties[0]; c.done = true; c.champion = t.winner; c.runnerUp = t.winner === t.home ? t.away : t.home;
        (s.cupHistory ??= []).unshift({ season: s.season, champion: c.champion, runnerUp: c.runnerUp, score: `${t.hs}-${t.as}` });
        prize(c.champion, CUP.champion, `Campeón de ${c.name}`); prize(c.runnerUp, CUP.runnerUp, `Subcampeón de ${c.name}`);
        this.news(`¡${this.team(c.champion).name} gana la ${c.name}!`, `Final: ${this.team(t.home).name} ${t.hs} – ${t.as} ${this.team(t.away).name}.`);
      } else {
        for (const t of r.ties) prize(t.winner, CUP.prizes[Math.min(CUP.prizes.length - 1, c.round + (3 - Math.log2(c.size)))], `Tu equipo pasa de ronda en la ${c.name}`);
        c.round++; this.makeCupRound(winners);
      }
      void idx;
    },
    cupInfo() { const c = this.s.cup; return c ? { ...c, roundName: c.rounds[c.round]?.name, nextDay: c.done ? null : c.slots[c.round] } : null; },
  });
}
