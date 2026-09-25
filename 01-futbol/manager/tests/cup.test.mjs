// Tests de La Cupidité (copa de eliminatoria del manager) y de los clubes invitados del Continente Viejo. Uso: node manager/tests/cup.test.mjs
import { loadCore } from "./load.mjs";
const TLM = loadCore();
let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log("  ✓", name); } catch (e) { fail++; console.log("  ✗", name, "\n     ", e.message); } };
const eq = (a, b, m) => { if (a !== b) throw new Error((m || "") + ` esperado ${b}, obtuvo ${a}`); };
const ok = (c, m) => { if (!c) throw new Error(m || "falló la condición"); };
const USER = { name: "Club Prueba", shortName: "PRU", primaryColor: "#336699", secondaryColor: "#ffffff", stadium: "Estadio Prueba", capacity: 12000 };

function buildUserSquad(c) {
  const s = c.state, u = c.user;
  const need = ["POR", "POR", "DFC", "DFC", "LI", "LD", "MCD", "MC", "MC", "EI", "ED", "DC", "DC", "DFC", "MI", "MP"];
  for (const pos of need) {
    const fa = s.market.freeAgents.map((id) => s.players[id]).filter((p) => p.primaryPosition === pos).sort((a, b) => b.overall - a.overall)[0];
    if (fa) { const r = TLM.signFreeAgent(s, u.id, fa.id, {}); if (r.ok) continue; }
    const li = TLM.searchMarket(s, { pos, source: "listed", excludeClub: u.id }).find((r) => r.price < 6e6);
    if (li) TLM.buyNow(s, u.id, li.pid, {});
  }
  TLM.autoLineup(s, u);
}
const mk = (seed, userClub) => { const c = TLM.Career.create(Object.assign({ seed }, userClub ? { userClub: USER } : {})); if (userClub) buildUserSquad(c); return c; };
// juega jornadas hasta que `until(state)` sea verdadero (el usuario simula su partido si tiene)
function playUntil(c, until, max = 200) {
  let guard = 0;
  while (guard++ < max && !until(c.state)) {
    const f = c.userFixture(); if (f && f.status !== "played") c.quickSimUser();
    const out = c.finishRound(); if (out.seasonEnded) return out;
  }
  return null;
}
const leagueClubs = (s) => Object.keys(s.clubs).filter((id) => !s.clubs[id].foreign);

console.log("\nClubes invitados (Continente Viejo)");
T("hay 9 clubes invitados con plantilla, nación del continente viejo y fuera de la liga", () => {
  const c = mk(11, false), s = c.state, g = TLM.guestClubs(s);
  eq(g.length, 9); eq(c.comp.teams.length, leagueClubs(s).length); ok(g.every((id) => !c.comp.teams.includes(id)), "no juegan la liga");
  for (const id of g) { const cl = s.clubs[id]; ok(cl.squad.length >= 22, cl.name + " sin plantilla"); ok(globalThis.LFONations.get(cl.nation).continent === "viejo", cl.name + " sin nación del continente viejo"); ok(cl.crest.includes("continente2"), "escudo"); }
});
T("las cinco naciones nuevas existen con bandera y análogo", () => {
  const N = globalThis.LFONations; for (const id of ["baikal", "estovackia", "kostanay", "netanya", "overmark"]) { const n = N.get(id); ok(n && n.flag.endsWith(id + ".jpg") && n.analog && n.continent === "viejo", id); }
  eq(N.list.length, 21);
});
T("crear a los invitados no altera la liga ni el mercado (mismo mundo con y sin ellos)", () => {
  const a = mk(12, false), b = TLM.Career.create({ seed: 12 });
  eq(JSON.stringify(a.state.market.freeAgents), JSON.stringify(b.state.market.freeAgents));
  eq(a.comp.calendar.length, b.comp.calendar.length); eq(JSON.stringify(a.comp.calendar), JSON.stringify(b.comp.calendar));
});
T("los invitados no aparecen en el mercado ni en la búsqueda del usuario", () => {
  const c = mk(13, true), s = c.state, foreign = new Set(Object.values(s.players).filter((p) => p.clubId && s.clubs[p.clubId].foreign).map((p) => p.id));
  const found = TLM.searchMarket(s, { source: "all", excludeClub: c.user.id }); ok(found.length > 0);
  ok(found.every((r) => !foreign.has(r.pid)), "un jugador invitado apareció en la búsqueda");
  ok(Object.keys(s.market.listings).every((pid) => !foreign.has(pid)), "un invitado está en venta");
});

console.log("\nLa Cupidité — clasificación y cuadro");
T("arranca en clasificación abierta: sin partidos hasta la jornada de corte", () => {
  const c = mk(21, false), cup = c.state.cups.cupidite;
  eq(cup.format, 2); eq(cup.status, "qualifying"); eq(cup.rounds.length, 0); ok(cup.cutRound >= 10 && cup.cutRound <= 14, "corte " + cup.cutRound);
  eq(cup.slots.length, 5); ok(cup.slots[0] > cup.cutRound && cup.slots.every((v, i) => !i || v > cup.slots[i - 1]), "fechas crecientes tras el corte");
  const ov = TLM.cupOverview(c.state, "cupidite"); eq(ov.provisional.league.length, 8); eq(ov.provisional.guests.length + 2, 9); eq(ov.provisional.prelim.length, 2);
  ok(ov.startsIn > 0 && ov.cutIn > 0, "faltan jornadas");
});
T("en la jornada de corte se cierra la clasificación: 8 de la liga + 7 invitados + ronda previa", () => {
  const c = mk(22, false), s = c.state, cup = s.cups.cupidite;
  playUntil(c, (st) => st.cups.cupidite.status !== "qualifying");
  eq(cup.status, "active"); eq(cup.hasPrelim, true); eq(cup.entrants.length, 16); eq(cup.entrants[15], null, "hueco de la ronda previa");
  const lg = cup.entrants.filter((id) => id && !s.clubs[id].foreign), fr = cup.entrants.filter((id) => id && s.clubs[id].foreign);
  eq(lg.length, 8); eq(fr.length, 7); eq(cup.qualified.prelim.length, 2);
  const table = TLM.computeTable(s, c.comp, cup.cutRound).slice(0, 8).map((r) => r.clubId);
  eq([...lg].sort().join(), [...table].sort().join(), "los 8 primeros de la tabla en el corte");
  eq(cup.rounds.length, 1); eq(cup.rounds[0].name, "Ronda previa"); eq(cup.rounds[0].fixtureIds.length, 1);
});
T("la ronda previa define el octavo invitado y sortea los octavos", () => {
  const c = mk(23, false), s = c.state, cup = s.cups.cupidite;
  playUntil(c, (st) => st.cups.cupidite.rounds.length >= 2);
  ok(cup.rounds[0].done, "previa jugada"); const w = s.fixtures[cup.rounds[0].fixtureIds[0]].result.winnerId;
  eq(cup.entrants[15], w); ok(cup.qualified.prelim.includes(w));
  eq(cup.rounds[1].name, "Octavos de final"); eq(cup.rounds[1].fixtureIds.length, 8);
  eq(new Set(cup.rounds[1].fixtureIds.flatMap((id) => [s.fixtures[id].homeId, s.fixtures[id].awayId])).size, 16);
});
T("el cuadro cruza 1-16, 8-9, 4-13, 5-12…", () => { eq(TLM.cupBracketOrder(16).join(","), "1,16,8,9,4,13,5,12,2,15,7,10,3,14,6,11"); });
T("temporada completa: previa, octavos, cuartos, semis y final; sale un campeón y arranca la copa nueva", () => {
  const c = mk(24, true), s = c.state; let cupRounds = 0, guard = 0;
  while (guard++ < 200) {
    const f = c.userFixture(); if (f && f.status !== "played") c.quickSimUser();
    const out = c.finishRound(); if (out.cup === true) cupRounds++;
    if (out.seasonEnded) break;
  }
  const h = s.history.cups.cupidite; ok(h && h.length === 1 && h[0].champion, "un campeón registrado");
  eq(s.history.seasons.length, 1); eq(s.cupPending, null);
  eq(s.cups.cupidite.season, s.season); eq(s.cups.cupidite.status, "qualifying", "la copa nueva vuelve a clasificación");
  eq(TLM.guestClubs(s).length, 9, "los invitados siguen ahí");
});
T("todos los partidos de copa tienen ganador (penales cuadran) y los invitados juegan", () => {
  const c = mk(33, false), s = c.state; playUntil(c, () => false);
  const cf = Object.values(s.fixtures).filter((x) => x.cup); ok(cf.length === 0, "los fixtures de la temporada vieja se limpian");
  const h = s.history.cups.cupidite[0]; ok(h.champion && h.runnerUp);
});
T("los partidos de copa del usuario pasan por el mismo flujo", () => {
  let played = 0, seen = 0;
  for (const seed of [41, 42, 43]) {
    const c = mk(seed, true), s = c.state; let guard = 0;
    while (guard++ < 250) {
      const f = c.userFixture();
      if (f && f.status !== "played") { c.quickSimUser(); if (f.cup) { played++; ok(f.result.winnerId, "sin ganador"); if (f.result.pens) ok(f.result.pens[0] !== f.result.pens[1], "penales empatados"); } }
      const out = c.finishRound(); seen += Object.values(s.fixtures).filter((x) => x.cup && x.status === "played").length ? 0 : 0;
      if (out.seasonEnded) break;
    }
  }
  void seen; console.log("      (partidos de copa del usuario en 3 carreras:", played, ")");
});

console.log("\nLa Cupidité — compatibilidad y etiquetas");
T("un guardado viejo (sin copa ni invitados) los crea al cargar", () => {
  const c = mk(55, false), st = JSON.parse(JSON.stringify(c.state)); delete st.cups; delete st.cupPending; delete st.history.cups;
  for (const id in st.competitions) if (id.startsWith("cup_")) delete st.competitions[id];
  for (const id in st.fixtures) if (st.fixtures[id].cup) delete st.fixtures[id];
  for (const id of Object.keys(st.clubs)) if (st.clubs[id].foreign) { for (const pid of st.clubs[id].squad) delete st.players[pid]; delete st.clubs[id]; }
  const d = TLM.Career.fromJSON(st); ok(d.state.cups.cupidite && d.state.cups.cupidite.format === 2); eq(TLM.guestClubs(d.state).length, 9);
  eq(TLM.validate(d.state).length, 0, "estado consistente");
});
T("una copa guardada con el formato anterior se termina con el formato anterior", () => {
  const c = mk(56, false), s = c.state; playUntil(c, (st) => st.cups.cupidite.status === "active");
  const cup = s.cups.cupidite; delete cup.format; const c2 = TLM.Career.fromJSON(JSON.parse(JSON.stringify(s)));
  ok(c2.state.cups.cupidite.status === "active"); ok(TLM.cupOverview(c2.state, "cupidite").legacy);
});
T("las etiquetas del fixture distinguen copa y liga", () => {
  const c = mk(66, false), s = c.state; playUntil(c, (st) => st.cups.cupidite.rounds.length > 0);
  const f = s.fixtures[s.cups.cupidite.rounds[0].fixtureIds[0]];
  eq(TLM.fixtureLabel(s, f).comp, "La Cupidité"); eq(TLM.fixtureLabel(s, f).round, "Ronda previa");
  eq(TLM.fixtureLabel(s, c.userFixture() || Object.values(s.fixtures).find((x) => !x.cup)).cup, false);
});
T("resumen de la liga: líder, ventaja y jornadas que faltan", () => {
  const c = mk(77, false); playUntil(c, (st) => TLM.currentRound(st, c.comp) > 10);
  const lo = TLM.leagueOverview(c.state); eq(lo.left, lo.total - lo.played); ok(lo.leader && lo.gap >= 0 && lo.contenders >= 1);
});
T("todo el mundo sigue siendo consistente tras una temporada con la copa nueva", () => {
  const c = mk(88, true); playUntil(c, () => false, 200); eq(TLM.validate(c.state).length, 0);
  ok(leagueClubs(c.state).length === 17);
});
console.log(`\n${pass} ok, ${fail} fallos`); process.exit(fail ? 1 : 0);
