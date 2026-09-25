import { loadCore } from "./load.mjs";
const TLM = loadCore();
const c = TLM.Career.create({ seed: 12345, userClub: { name: "Club Prueba", shortName: "PRU", primaryColor: "#336699", secondaryColor: "#ffffff", stadium: "Estadio Prueba", capacity: 12000 } });
console.log("clubs", Object.keys(c.state.clubs).length, "players", Object.keys(c.state.players).length, "errs", TLM.validate(c.state));
console.log("rounds", c.comp.calendar.length, "user squad", c.user.squad.length, "free agents", c.state.market.freeAgents.length, "listed", Object.keys(c.state.market.listings).length);
const t0 = Date.now();
// user has no players: use free agents to build XI
console.log(c.table().slice(0,3).map(r=>r.clubId));
