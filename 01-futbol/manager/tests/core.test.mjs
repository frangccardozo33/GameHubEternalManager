// Tests del núcleo del manager (sin motor 3D). Uso: node manager/tests/core.test.mjs
import { loadCore } from "./load.mjs";
const TLM = loadCore();
let pass = 0, fail = 0; const failures = [];
const T = (name, fn) => { try { fn(); pass++; console.log("  ✓", name); } catch (e) { fail++; failures.push(name); console.log("  ✗", name, "\n     ", e.message); } };
const eq = (a, b, m) => { if (a !== b) throw new Error((m || "") + ` esperado ${b}, obtuvo ${a}`); };
const ok = (c, m) => { if (!c) throw new Error(m || "falló la condición"); };
const USER = { name: "Club Prueba", shortName: "PRU", primaryColor: "#336699", secondaryColor: "#ffffff", stadium: "Estadio Prueba", capacity: 12000 };
const mk = (o) => TLM.Career.create(Object.assign({ seed: 777, userClub: USER }, o || {}));

// Ficha al usuario un once y banquillo funcional con agentes libres + listados.
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
// juega n jornadas de LIGA (las rondas de copa que se cruzan en el camino no cuentan)
const play = (c, n) => { let done = 0, guard = 0; while (done < n && guard++ < n * 3 + 10) { c.quickSimUser(); const out = c.finishRound(); if (out.cup !== true) done++; } };

console.log("\n1-3 · Crear club, identidad, presupuesto");
T("1. crear club con identidad visual y presupuesto inicial", () => {
  const c = mk(); const u = c.user;
  eq(u.name, "Club Prueba"); eq(u.primaryColor, "#336699"); eq(u.secondaryColor, "#ffffff"); eq(u.stadium.name, "Estadio Prueba"); eq(u.stadium.capacity, 12000);
  eq(u.controlledBy, "user"); eq(u.finances.balance, TLM.DEFAULTS.userStartBudget);
  eq(u.squad.length, 0, "la plantilla inicial del usuario debe estar vacía");
});
T("2. el club del usuario es un Club normal (mismas propiedades que los base)", () => {
  const c = mk(); const base = Object.values(c.state.clubs).find((x) => x.base);
  const ks = (o) => Object.keys(o).filter((k) => k !== "ai").sort().join();
  eq(ks(c.user), ks(base));
  ok(c.comp.teams.includes(c.user.id));
});
T("3. edición de club permitida; no hay API de creación de jugadores", () => {
  const c = mk(); TLM.editClub(c.state, c.user.id, { name: "Nuevo Nombre", primaryColor: "#ff0000", stadium: "Otro" });
  eq(c.user.name, "Nuevo Nombre"); eq(c.user.primaryColor, "#ff0000");
  ok(!TLM.createPlayer && !TLM.addPlayer, "no debe existir createPlayer/addPlayer público");
});

console.log("\n4-6 · Mercado, IDs globales y ediciones");
T("4. comprar jugadores y armar plantilla dentro del presupuesto", () => {
  const c = mk(); buildUserSquad(c);
  ok(c.user.squad.length >= 14, "plantilla=" + c.user.squad.length); ok(c.user.finances.balance >= 0, "saldo negativo");
  eq(TLM.lineupProblems(c.state, c.user).length, 0, TLM.lineupProblems(c.state, c.user).join());
  eq(TLM.validate(c.state).length, 0);
});
T("5. no se puede duplicar un jugador global", () => {
  const c = mk(); buildUserSquad(c); const s = c.state;
  const pid = c.user.squad[0]; const before = Object.keys(s.players).length;
  const r = TLM.signFreeAgent(s, c.user.id, pid, {}); ok(!r.ok, "no debe poder fichar a su propio jugador");
  const r2 = TLM.makeOffer(s, c.user.id, pid, 1e6, {}); ok(!r2.ok);
  eq(Object.keys(s.players).length, before);
  const holders = Object.values(s.clubs).filter((cl) => cl.squad.includes(pid)); eq(holders.length, 1);
});
T("6. comprar una edición especial NO crea un playerId nuevo", () => {
  const c = mk(); buildUserSquad(c); const s = c.state; const p = s.players[c.user.squad[0]];
  const n = Object.keys(s.players).length, id = p.id, ed0 = p.card.edition;
  const r = TLM.buyEdition(s, c.user.id, id, ed0 === "leyenda" ? "oro" : "leyenda"); ok(r.ok, r.reason);
  eq(Object.keys(s.players).length, n); eq(s.players[id].id, id); ok(s.players[id].card.edition !== ed0);
  const li = TLM.searchMarket(s, { source: "listed", excludeClub: c.user.id, maxPrice: 4e6 })[0];
  if (li) { const r2 = TLM.buyNow(s, c.user.id, li.pid, { edition: "copa" }); if (r2.ok) { eq(s.players[li.pid].card.edition, "copa"); eq(Object.keys(s.players).length, n); } }
  eq(TLM.validate(s).length, 0);
});

console.log("\n7-9 · Liga y calendario");
T("7. liga con diferentes cantidades de equipos (3..24)", () => {
  for (const n of [3, 4, 5, 8, 11, 16, 20, 24]) {
    const c = TLM.Career.create({ seed: n * 13, totalClubs: n, userClub: USER });
    eq(c.comp.teams.length, n, "n=" + n);
    eq(Object.keys(c.state.clubs).filter((k) => !c.state.clubs[k].foreign).length, n);
  }
});
T("8. calendario: todos contra todos, ida y vuelta, descansos, sin duplicados, local/visitante balanceado", () => {
  for (const n of [4, 5, 7, 10, 15, 16, 17, 20]) {
    const ids = Array.from({ length: n }, (_, i) => "t" + i), sch = TLM.buildSchedule(ids, 2);
    const evenN = n % 2 ? n + 1 : n; eq(sch.rounds.length, 2 * (evenN - 1), "rondas n=" + n);
    const pairs = new Map(); const home = {}, run = {}, maxRun = {};
    sch.rounds.forEach((round) => {
      const seen = new Set(); round.forEach(([h, a]) => { ok(h !== a); ok(!seen.has(h) && !seen.has(a), "equipo dos veces en una ronda"); seen.add(h); seen.add(a); const k = h + ">" + a; pairs.set(k, (pairs.get(k) || 0) + 1); });
      ids.forEach((t) => {
        const isH = round.some(([h]) => h === t);
        if (!seen.has(t)) return;
        if (isH) { home[t] = (home[t] || 0) + 1; run[t] = (run[t] > 0 ? run[t] : 0) + 1; } else run[t] = (run[t] < 0 ? run[t] : 0) - 1;
        maxRun[t] = Math.max(maxRun[t] || 0, Math.abs(run[t]));
      });
    });
    for (const a of ids) for (const b of ids) if (a !== b) eq(pairs.get(a + ">" + b), 1, `cruce ${a}>${b} n=${n}`);
    for (const t of ids) { const games = 2 * (n - 1); ok(Math.abs(home[t] - games / 2) <= 1, `localías desbalanceadas ${t}: ${home[t]}/${games} n=${n}`); ok(maxRun[t] <= 4, `racha local/visita ${maxRun[t]} n=${n}`); }
    if (n % 2) eq(sch.byes.filter(Boolean).length, sch.rounds.length, "descansos");
  }
});
T("8b. jornada actual y temporada completa", () => {
  const c = mk({ totalClubs: 6 }); eq(c.round, 1); eq(c.comp.calendar.length, 10);
  buildUserSquad(c);
  play(c, 10);
  eq(c.state.season, 2006, "debería haber pasado a la temporada siguiente"); eq(c.round, 1);
  eq(c.state.history.seasons.length, 1);
});
T("9. la tabla se actualiza con los resultados y respeta desempates", () => {
  const c = mk({ totalClubs: 5 }); buildUserSquad(c);
  c.quickSimUser(); c.finishRound(); const t = c.table();
  const played = t.reduce((a, r) => a + r.played, 0); eq(played, 4, "5 equipos → 2 partidos/jornada");
  for (const r of t) { eq(r.points, r.won * 3 + r.drawn); eq(r.gd, r.gf - r.ga); eq(r.played, r.won + r.drawn + r.lost); }
  eq(t.reduce((a, r) => a + r.gf, 0), t.reduce((a, r) => a + r.ga, 0));
  for (let i = 1; i < t.length; i++) ok(t[i - 1].points >= t[i].points);
});
T("9b. desempates parametrizables (head-to-head / DG / goles a favor)", () => {
  const s = { clubs: { a: { name: "A" }, b: { name: "B" }, c: { name: "C" } }, fixtures: {} };
  const comp = { teams: ["a", "b", "c"], calendar: [["f1", "f2", "f3"]], pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0, tieBreakRules: ["points", "goalDifference", "goalsFor", "name"] };
  s.fixtures = { f1: { id: "f1", homeId: "a", awayId: "b", status: "played", result: { hg: 1, ag: 0 } }, f2: { id: "f2", homeId: "b", awayId: "c", status: "played", result: { hg: 3, ag: 0 } }, f3: { id: "f3", homeId: "c", awayId: "a", status: "played", result: { hg: 1, ag: 0 } } };
  eq(TLM.computeTable(s, comp).map((r) => r.clubId).join(""), "bac", "DG: b(+2) a(0) c(-2)");
  comp.tieBreakRules = ["points", "goalsFor", "name"]; eq(TLM.computeTable(s, comp)[0].clubId, "b", "goles a favor");
  comp.tieBreakRules = ["points", "name"]; eq(TLM.computeTable(s, comp).map((r) => r.clubId).join(""), "abc", "por nombre");
});

console.log("\n10-14 · IA de clubes, mercado y contratos");
T("10/35. los equipos IA hacen fichajes (usan el mercado)", () => {
  const c = mk({ totalClubs: 12 }); buildUserSquad(c); const s = c.state; const n0 = s.transfers.length;
  play(c, 12);
  const aiTr = s.transfers.filter((t) => s.clubs[t.to] && s.clubs[t.to].controlledBy === "ai");
  ok(aiTr.length >= 3, "transferencias IA=" + aiTr.length); ok(s.transfers.length > n0);
  eq(TLM.validate(s).length, 0, TLM.validate(s).join());
});
T("11. equipos IA venden jugadores (listados y ventas a otros clubes)", () => {
  const c = mk({ totalClubs: 12 }); buildUserSquad(c); const s = c.state;
  ok(Object.keys(s.market.listings).length > 10);
  play(c, 12);
  ok(s.transfers.some((t) => t.from && s.clubs[t.from].controlledBy === "ai" && t.to !== c.user.id), "ningún club IA vendió a otro club IA");
});
T("12/13. negociación: rechazo, contraoferta y ofertas múltiples con competencia", () => {
  const c = mk(); buildUserSquad(c); const s = c.state, u = c.user;
  const seller = Object.values(s.clubs).find((x) => x.controlledBy === "ai" && x.squad.length > 20);
  const p = seller.squad.map((id) => s.players[id]).filter((x) => !s.market.listings[x.id]).sort((a, b) => b.overall - a.overall)[1];
  u.finances.balance = 60e6;
  const low = TLM.makeOffer(s, u.id, p.id, p.marketValue * 0.4, {}); ok(low.ok);
  let ev = TLM.resolveOffers(s); ok(ev.some((e) => e.type === "rejected"), "una oferta muy baja debe ser rechazada"); eq(low.offer.status, "REJECTED");
  const mid = TLM.makeOffer(s, u.id, p.id, p.marketValue * 0.9, {}); ok(mid.ok);
  ev = TLM.resolveOffers(s); ok(["NEGOTIATING", "TRANSFERRED", "REJECTED"].includes(mid.offer.status), "estado=" + mid.offer.status);
  const seller2 = Object.values(s.clubs).find((x) => x.controlledBy === "ai" && x.id !== seller.id && x.squad.length > 20);
  const q = seller2.squad.map((id) => s.players[id]).filter((x) => !s.market.listings[x.id]).sort((a, b) => b.overall - a.overall)[2];
  const buyers = Object.values(s.clubs).filter((x) => x.controlledBy === "ai" && x.id !== seller2.id).slice(0, 3); buyers.forEach((b) => (b.finances.balance = 80e6));
  const offs = [0.8, 1.0, 1.5].map((f, i) => TLM.makeOffer(s, buyers[i].id, q.id, q.marketValue * f * 1.6, {}).offer);
  offs.forEach((o) => ok(o && o.status === "OFFERED"));
  TLM.resolveOffers(s);
  const winners = offs.filter((o) => o.status === "TRANSFERRED"); eq(winners.length, 1, "sólo un comprador se lleva al jugador: " + offs.map((o) => o.status));
  eq(winners[0].amount, Math.max(...offs.map((o) => o.amount)), "gana la mejor oferta");
  ok(offs.filter((o) => o.status === "REJECTED").length >= 1, "los perdedores quedan REJECTED");
  eq(TLM.validate(s).length, 0);
});
T("12b. contraoferta: aceptar/retirar; todos los estados son válidos", () => {
  const c = mk(); buildUserSquad(c); const s = c.state, u = c.user; u.finances.balance = 90e6;
  const seller = Object.values(s.clubs).find((x) => x.controlledBy === "ai" && x.squad.length > 20);
  const p = seller.squad.map((id) => s.players[id]).filter((x) => !s.market.listings[x.id]).sort((a, b) => b.overall - a.overall)[3];
  let got = null;
  for (const f of [0.8, 0.85, 0.9, 0.95]) { const r = TLM.makeOffer(s, u.id, p.id, p.marketValue * f, {}); if (!r.ok) continue; TLM.resolveOffers(s); if (r.offer.status === "NEGOTIATING") { got = r.offer; break; } if (r.offer.status === "TRANSFERRED") break; }
  if (got) { const w = TLM.acceptCounter(s, got.id); ok(w.ok, w.reason); eq(got.status, "TRANSFERRED"); eq(s.players[p.id].clubId, u.id); }
  const st = new Set(["OFFERED", "NEGOTIATING", "ACCEPTED", "REJECTED", "TRANSFERRED", "CANCELLED"]);
  for (const o of Object.values(s.market.offers)) ok(st.has(o.status), "estado inválido " + o.status);
  const other = Object.values(s.players).find((x) => x.clubId && x.clubId !== u.id && !s.market.listings[x.id] && TLM.transferStatus(s, x.id) == null);
  const r3 = TLM.makeOffer(s, u.id, other.id, other.marketValue, {});
  ok(r3.ok, r3.reason); const w = TLM.withdrawOffer(s, r3.offer.id); ok(w.ok); eq(r3.offer.status, "CANCELLED");
});
T("12c. el usuario vende: oferta de IA por su jugador → aceptar", () => {
  const c = mk(); buildUserSquad(c); const s = c.state;
  let ev = null; for (let i = 0; i < 60 && !ev; i++) { const e = TLM.aiOffersForUser(s); if (e.length) ev = e[0]; }
  ok(ev, "la IA debería ofertar por jugadores del usuario"); eq(ev.offer.status, "OFFERED");
  const bal = c.user.finances.balance, n = c.user.squad.length;
  const r = TLM.respondToOffer(s, ev.offer.id, "accept"); ok(r.ok, r.reason); eq(ev.offer.status, "TRANSFERRED");
  ok(c.user.finances.balance > bal); eq(c.user.squad.length, n - 1); eq(TLM.validate(s).length, 0);
});
T("14. contratos: renovar, salario exigido, vencimiento", () => {
  const c = mk(); buildUserSquad(c); const s = c.state, u = c.user; const p = s.players[u.squad[0]]; p.morale = 70;
  const dem = TLM.contractDemand(s, p, u, true); const low = TLM.renewContract(s, u.id, p.id, dem * 0.5, 2); ok(!low.ok);
  const hi = TLM.renewContract(s, u.id, p.id, dem, 3); ok(hi.ok, hi.reason); ok(p.contract.endSeason >= s.season + 3);
  eq(TLM.contractStatus(s, p), "active");
  p.contract.endSeason = s.season; eq(TLM.contractStatus(s, p), "expiring");
});

console.log("\n15-19 · Finanzas, entrenamiento, lesiones, moral, táctica");
T("15. finanzas: ingresos, gastos, historial y consecuencias de gastar de más", () => {
  const c = mk({ totalClubs: 6 }); buildUserSquad(c); const u = c.user;
  const b0 = u.finances.balance; c.quickSimUser(); c.finishRound();
  ok(u.finances.ledger.some((t) => t.type === "salary") && u.finances.ledger.some((t) => t.type === "maintenance"));
  ok(u.finances.balance !== b0); const pr = TLM.projection(c.state, u, 5); ok(typeof pr.balance === "number");
  u.finances.balance = -9e6; const p0 = c.player(u.squad[0]); p0.morale = 70; c.quickSimUser(); c.finishRound(); ok(p0.morale < 70, "la deuda debe pesar en la moral: " + p0.morale);
  ok(TLM.financeStatus(c.state, u) !== "ok");
  const bad = TLM.makeOffer(c.state, u.id, Object.values(c.state.players).find((p) => p.clubId && p.clubId !== u.id).id, 5e6, {}); ok(!bad.ok, "en deuda no puede ofertar");
});
T("15b. estadio: mejora simple con coste y efecto", () => {
  const c = mk(); const u = c.user; u.finances.balance = 20e6; const cap = u.stadium.capacity;
  const r = TLM.upgradeStadium(c.state, u); ok(r.ok, r.reason); ok(u.stadium.capacity > cap); eq(u.stadium.level, 2); ok(u.finances.balance < 20e6);
});
T("16. entrenamiento básico: foco individual y de equipo", () => {
  const c = mk(); buildUserSquad(c); const u = c.user; TLM.setTraining(c.state, u, "physical", "pressing"); eq(u.training.individual, "physical"); eq(u.training.team, "pressing");
  const sum = () => u.squad.reduce((a, id) => a + c.player(id).attributes.physical + c.player(id).attributes.speed, 0);
  const before = sum();
  let gains = 0; for (let i = 0; i < 60; i++) gains += TLM.trainRound(c.state, u).length; ok(gains > 0, "algún jugador debe progresar");
  ok(sum() >= before); ok(u.training.teamBoost > 0 && u.training.teamBoost <= 3);
  const p = c.player(u.squad[3]); const e0 = TLM.effectiveStats(p, u); u.training.teamBoost = 0; const e1 = TLM.effectiveStats(p, u); ok(e0.physical >= e1.physical);
});
T("17. lesión: se aplica, baja al jugador del once y se recupera", () => {
  const c = mk(); buildUserSquad(c); const s = c.state, u = c.user; const p = s.players[u.lineup.xi[3]];
  const inj = TLM.injure(s, p, 0.9); ok(inj.matchdays >= 4); ok(!TLM.isAvailable(p));
  TLM.repairLineup(s, u); ok(!u.lineup.xi.includes(p.id), "el lesionado no debe seguir en el once");
  for (let i = 0; i < inj.total; i++) TLM.weeklyRecovery(s, p, false); ok(TLM.isAvailable(p));
});
T("18. moral y forma modifican los atributos efectivos", () => {
  const c = mk(); buildUserSquad(c); const p = c.player(c.user.squad[2]);
  p.morale = 95; p.form = 90; const hi = TLM.effectiveStats(p, c.user).passing; p.morale = 20; p.form = 10; const lo = TLM.effectiveStats(p, c.user).passing; ok(hi > lo, `${hi} vs ${lo}`);
});
T("19. táctica → diales del motor; formaciones; plan de partido → reglas", () => {
  const c = mk(); buildUserSquad(c); const u = c.user;
  const pt = TLM.toEnginePatch({ mentality: "veryAttacking", buildUp: "counter", pressing: "extreme", width: "wide", tempo: "fast", line: "high" });
  eq(pt.mentality, "veryAttacking"); eq(pt.pressing, "allOut"); eq(pt.tempo, "faster"); eq(pt.defensiveLine, "high"); eq(pt.counterAttack, "frequent"); eq(pt.attackingWidth, "wide");
  for (const f of Object.keys(TLM.FORMATIONS)) { ok(TLM.setFormation(c.state, u, f)); eq(u.lineup.xi.length, 11); eq(TLM.FORMATIONS[f].length, 11); }
  u.plan = { ifWinning: "protect", ifLosing: "allout", fromMinute: { minute: 70, mode: "chase" } };
  const rules = TLM.planRules(u.plan); eq(rules.length, 3); ok(rules.every((r) => r.then && typeof r.id === "string"));
  const cfg = TLM.sideConfig(c.state, u); eq(cfg.startingXI.length, 11); ok(cfg.startingXI.every((x) => x && x.pid && x.stats)); eq(new Set(cfg.startingXI.map((x) => x.pid)).size, 11);
});

console.log("\n25-36 · Resultados, historial, noticias, guardado, previa/post, scouting");
T("26/27/28. el resultado vuelve al manager: estadísticas de jugadores e historial", () => {
  const c = mk({ totalClubs: 6 }); buildUserSquad(c); const s = c.state;
  const cfg = c.matchConfig(); ok(cfg && cfg.home && cfg.away); c.quickSimUser(); c.finishRound();
  const played = Object.values(s.players).filter((p) => p.seasonStats.matches > 0); ok(played.length >= 20);
  const goals = Object.values(s.players).reduce((a, p) => a + p.seasonStats.goals, 0);
  const tg = c.table().reduce((a, r) => a + r.gf, 0); eq(goals, tg, "goles de jugadores = goles de la tabla");
  play(c, 19);
  const withHist = Object.values(s.players).filter((p) => p.careerHistory.length > 0); ok(withHist.length > 20, "careerHistory=" + withHist.length);
  const h = withHist[0].careerHistory[0]; ok(h.club && h.season === 2005 && h.matches > 0);
  ok(s.history.seasons[0].champion && s.history.seasons[0].table.length === 6);
  ok(s.history.records.topScorer);
});
T("29. noticias", () => {
  const c = mk({ totalClubs: 6 }); buildUserSquad(c); play(c, 8);
  ok(c.state.news.length >= 5, "news=" + c.state.news.length); ok(c.state.news.every((n) => n.text && n.kind));
  ok(new Set(c.state.news.map((n) => n.kind)).size >= 3);
});
T("30. guardado y carga: estado idéntico y futuro determinista", () => {
  const c = mk({ totalClubs: 6 }); buildUserSquad(c); play(c, 4);
  const r = c.save("t1"); ok(r.ok, r.reason); const d = TLM.Career.load("t1"); ok(d, "no cargó");
  eq(JSON.stringify(d.state), JSON.stringify(c.state), "el estado cargado debe ser idéntico");
  eq(TLM.validate(d.state).length, 0); d.quickSimUser(); d.finishRound();
  c.quickSimUser(); c.finishRound(); eq(JSON.stringify(d.table()), JSON.stringify(c.table()), "el futuro debe ser determinista tras cargar");
});
T("31. previa: informe del rival con datos reales o incertidumbre explícita", () => {
  const c = mk({ totalClubs: 6 }); buildUserSquad(c); const f = c.userFixture(); const opp = f.homeId === c.user.id ? f.awayId : f.homeId;
  let rep = TLM.rivalReport(c.state, c.comp, opp, c.user.id); ok(rep.notes.some((n) => /insuficientes/.test(n)), "sin datos debe decirlo"); eq(rep.tendency, null); ok(rep.ratings.attack > 30); eq(rep.last5.length, 0);
  play(c, 4);
  const f2 = c.userFixture(); const opp2 = f2.homeId === c.user.id ? f2.awayId : f2.homeId; rep = TLM.rivalReport(c.state, c.comp, opp2, c.user.id); ok(rep.last5.length >= 3); ok(rep.sample >= 3);
});
T("32/33. post-partido y análisis de estudio (sólo datos reales, determinista)", () => {
  const c = mk({ totalClubs: 6 }); buildUserSquad(c); c.prepareRound(); const f = c.userFixture(); const res = TLM.simulateMatch(c.state, f); c.applyUserResult(res);
  const a = TLM.studioAnalysis(c.state, f, res), b = TLM.studioAnalysis(c.state, f, res);
  ok(a.length >= 4); eq(JSON.stringify(a), JSON.stringify(b), "determinista"); ok(a.every(([w, t]) => (w === "A" || w === "B") && t.length > 8 && !/undefined|NaN|\{/.test(t)), a.map((x) => x[1]).join("|"));
  const st = res.score[0] + "-" + res.score[1]; ok(a[0][1].includes(st));
  const scorers = res.goalScorers.map((g) => c.player(g.pid).canonicalName); if (scorers.length) ok(a.some(([, t]) => scorers.some((n) => t.includes(n))), "debe mencionar a los goleadores");
  const nf = Object.values(c.state.fixtures).find((x) => x.status !== "played"); ok(TLM.studioPre(c.state, nf).length >= 1);
});
T("34. scouting: informe con incertidumbre y límite por jornada", () => {
  const c = mk(); buildUserSquad(c); const s = c.state;
  const r = TLM.scout(s, c.user.id, { pos: "DC", minAge: 18, maxAge: 24, ovr: 68, profile: "young" }); ok(r.ok); ok(r.report.rows.length > 0, "sin candidatos");
  for (const row of r.report.rows) { const p = s.players[row.pid]; ok(row.ovr[0] <= row.ovr[1]); ok(p.age >= 18 && p.age <= 24); ok(row.keyAttrs.length === 3 && row.keyAttrs[0].range[0] <= row.keyAttrs[0].range[1]); ok(!("attributes" in row), "no debe revelar todo"); }
  const r2 = TLM.scout(s, c.user.id, { pos: "MC" }); const r3 = TLM.scout(s, c.user.id, { pos: "DFC" }); ok(r2.ok && r3.ok);
  ok(!TLM.scout(s, c.user.id, {}).ok, "límite por jornada");
});
T("36. club creado por el usuario se comporta igual que uno base (fixtures, tabla, finanzas, observaciones)", () => {
  const c = mk({ totalClubs: 6 }); buildUserSquad(c); play(c, 6);
  const row = c.table().find((r) => r.clubId === c.user.id); ok(row && row.played >= 5);
  ok(c.user.finances.ledger.length > 5); ok(c.user.observed.matches >= 5);
});
T("mundo: IDs únicos y coherencia tras una temporada completa con mercado", () => {
  const c = mk({ totalClubs: 10 }); buildUserSquad(c); play(c, 18);
  const errs = TLM.validate(c.state); eq(errs.length, 0, errs.slice(0, 3).join(";")); eq(c.state.season, 2006);
  const ai = Object.values(c.state.clubs).filter((x) => x.controlledBy === "ai"); ok(ai.every((cl) => cl.squad.length >= 15), "toda plantilla IA ≥ 15: " + ai.map((x) => x.squad.length));
});

console.log("\nIA: perfiles distintos y reacción al rendimiento");
T("6b. los perfiles de IA toman decisiones distintas (no son el mismo bot con ruido)", () => {
  const c = mk({ totalClubs: 16 }); const s = c.state; c.prepareRound();
  const ai = Object.values(s.clubs).filter((x) => x.controlledBy === "ai");
  const sig = (x) => [x.tactics.mentality, x.tactics.buildUp, x.tactics.pressing, x.tactics.width, x.tactics.tempo, x.tactics.line].join("/");
  const byProfile = {}; ai.forEach((x) => (byProfile[x.aiProfile] = byProfile[x.aiProfile] || sig(x)));
  ok(Object.keys(byProfile).length >= 6, "perfiles presentes: " + Object.keys(byProfile).length); ok(new Set(Object.values(byProfile)).size >= 5, "estilos distintos: " + [...new Set(Object.values(byProfile))].length);
  const def = ai.find((x) => x.aiProfile === "defensive") || ai.find((x) => x.aiProfile === "conservative"), off = ai.find((x) => x.aiProfile === "offensive") || ai.find((x) => x.aiProfile === "aggressive");
  const M = ["veryDefensive", "defensive", "balanced", "attacking", "veryAttacking"]; ok(M.indexOf(off.tactics.mentality) > M.indexOf(def.tactics.mentality), "ofensivo más ofensivo que defensivo");
  const low = ai.find((x) => x.aiProfile === "lowBudget"), star = ai.find((x) => x.aiProfile === "starBuyer");
  if (low && star) { low.finances.balance = 8e6; star.finances.balance = 8e6; const tl = TLM.aiTargets(s, low), ts = TLM.aiTargets(s, star); const avg = (t) => (t.length ? t.reduce((a, x) => a + x.p.overall, 0) / t.length : 0); if (tl.length && ts.length) ok(avg(ts) >= avg(tl) - 1, "el comprador de estrellas apunta más alto"); ok(tl.every((x) => x.price <= 8e6 * 0.2 * 0.8 + 1), "presupuesto bajo → sólo fichajes baratos"); }
});
T("6c. la IA reacciona a tres derrotas seguidas (más cauta) y lo publica", () => {
  const c = mk({ totalClubs: 8 }); const s = c.state, comp = c.comp; const club = Object.values(s.clubs).find((x) => x.aiProfile === "aggressive" || x.aiProfile === "offensive" || x.aiProfile === "starBuyer") || Object.values(s.clubs).find((x) => x.controlledBy === "ai");
  for (let r = 1; r <= 3; r++) for (const f of TLM.fixturesOf(s, comp, r)) { if (f.homeId === club.id) TLM.recordResult(s, f, 0, 2); else if (f.awayId === club.id) TLM.recordResult(s, f, 2, 0); else TLM.recordResult(s, f, 1, 1); }
  s.currentMatchday = 4; const M = ["veryDefensive", "defensive", "balanced", "attacking", "veryAttacking"];
  const base = M.indexOf(TLM.AI_PROFILES[club.aiProfile].mentality); const opp = Object.values(s.clubs).find((x) => x.id !== club.id);
  TLM.aiPrepareMatch(s, club, opp, true);
  ok(M.indexOf(club.tactics.mentality) <= Math.max(0, base), "debería ser al menos tan cauto como su perfil: " + club.tactics.mentality);
  ok(s.news.some((n) => n.kind === "tactic" && n.text.includes(club.name)), "noticia de cambio táctico");
});
T("16b. plan de partido: cambios automáticos opcionales viajan en la config", () => {
  const c = mk(); buildUserSquad(c); c.user.plan.autoSubs = true; const cfg = c.matchConfig(); const side = cfg.home.clubId === c.user.id ? cfg.home : cfg.away; eq(side.matchPlan.autoSubs, true); ok(typeof side.kitPattern === "string" && /^#/.test(side.gkColor));
});

console.log(`\n${pass} ok · ${fail} fallos`); if (fail) { console.log(failures.join("\n")); process.exit(1); }
