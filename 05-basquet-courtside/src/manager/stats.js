export const pct = (m, a) => (a ? m / a * 100 : 0);
export const perGame = (st, k) => (st.gp ? st[k] / st.gp : 0);
export const per36 = (st, k) => (st.min ? st[k] / st.min * 36 : 0);
export const efg = st => (st.fga ? (st.fgm + 0.5 * st.tpm) / st.fga * 100 : 0);
export const ts = st => { const d = 2 * (st.fga + 0.44 * st.fta); return d ? st.pts / d * 100 : 0; };
export const eff = st => st.pts + st.reb + st.ast + st.stl + st.blk - (st.fga - st.fgm) - (st.fta - st.ftm) - st.tov;
export const astTov = st => (st.tov ? st.ast / st.tov : st.ast);
export const usg = st => (st.min ? (st.fga + 0.44 * st.fta + st.tov) / st.min * 36 : 0); // posesiones usadas por 36 min
export const fmt = (n, d = 1) => (Number.isFinite(n) ? n.toFixed(d) : '-');
// Estadísticas avanzadas de equipo a partir de los registros de partido de una temporada.
export function teamAdvanced(matches, teamId) {
  const t = { g: 0, pts: 0, opp: 0, poss: 0, oposs: 0, fga: 0, fgm: 0, tpm: 0, fta: 0, tov: 0, oreb: 0, dreb: 0, ooreb: 0, odreb: 0, ofga: 0, ofgm: 0, otpm: 0, ofta: 0, otov: 0, stl: 0, blk: 0, ast: 0, tpa: 0, otpa: 0, fast: 0, paint: 0 };
  for (const m of matches) {
    const me = m.home === teamId ? 'h' : m.away === teamId ? 'a' : null; if (!me) continue;
    const a = m.ts[me], o = m.ts[me === 'h' ? 'a' : 'h']; t.g++; t.pts += me === 'h' ? m.hs : m.as; t.opp += me === 'h' ? m.as : m.hs;
    t.poss += a.possessions; t.oposs += o.possessions; t.fga += a.fga; t.fgm += a.fgm; t.tpm += a.tpm; t.tpa += a.tpa; t.fta += a.fta; t.tov += a.turnovers; t.oreb += a.offensiveRebounds;
    t.dreb += a.rebounds - a.offensiveRebounds; t.ooreb += o.offensiveRebounds; t.odreb += o.rebounds - o.offensiveRebounds; t.ofga += o.fga; t.ofgm += o.fgm; t.otpm += o.tpm; t.otpa += o.tpa; t.ofta += o.fta; t.otov += o.turnovers;
    t.stl += a.steals; t.blk += a.blocks; t.ast += a.assists; t.fast += a.fastBreakPoints; t.paint += a.paintPoints;
  }
  const p = Math.max(1, (t.poss + t.oposs) / 2);
  return { ...t, ortg: t.pts / p * 100, drtg: t.opp / p * 100, net: (t.pts - t.opp) / p * 100, pace: t.g ? p / t.g : 0, efg: t.fga ? (t.fgm + 0.5 * t.tpm) / t.fga * 100 : 0, tovPct: t.fga + 0.44 * t.fta + t.tov ? t.tov / (t.fga + 0.44 * t.fta + t.tov) * 100 : 0,
    orbPct: t.oreb + t.odreb ? t.oreb / (t.oreb + t.odreb) * 100 : 0, ftr: t.fga ? t.fta / t.fga : 0, oefg: t.ofga ? (t.ofgm + 0.5 * t.otpm) / t.ofga * 100 : 0, otovPct: t.ofga + 0.44 * t.ofta + t.otov ? t.otov / (t.ofga + 0.44 * t.ofta + t.otov) * 100 : 0 };
}
export const pg = perGame;
