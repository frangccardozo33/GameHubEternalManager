// Reglas colectivas: compara partidos con todas las reglas apagadas vs. las de fábrica (mismas semillas).
import { Engine } from "./harness.mjs";
const N = +(process.argv[2] || 3), MIN = +(process.argv[3] || 12);
function run(seed, on) {
  const m = new Engine(seed); m.start();
  if (!on) for (const t of [0, 1]) for (const id in m.ruleSet(t)) m.setRule(t, id, { on: false });
  const S = { f: 0, crowd: 0, close5: 0, pairs: 0, defSpread: 0, defN: 0, boxRun: 0, lastThird: 0, chasers: 0, chN: 0 };
  for (let k = 0; k < 60 * 60 * MIN && !m.ended; k++) {
    m.step(1 / 60);
    if (m.phase !== "playing" || k % 12) continue;
    S.f++;
    const b = m.ball;
    for (const t of [0, 1]) {
      const d = m.direction(t), mates = m.players.filter((p) => p.team === t && p.role !== "GK" && !p.sentOff);
      const near = mates.filter((p) => Math.hypot(p.x - b.x, p.z - b.z) < 12).length; S.crowd += Math.max(0, near - 2); 
      for (let i = 0; i < mates.length; i++) for (let j = i + 1; j < mates.length; j++) { S.pairs++; if (Math.hypot(mates[i].x - mates[j].x, mates[i].z - mates[j].z) < 5) S.close5++; }
      const ds = mates.filter((p) => p.role === "DEF").map((p) => p.x * d); if (ds.length > 2) { const mean = ds.reduce((a, b) => a + b) / ds.length; S.defSpread += Math.sqrt(ds.reduce((a, x) => a + (x - mean) ** 2, 0) / ds.length); S.defN++; }
      if (m.owner && m.owner.team === t && m.owner.x * d > 17.5) { S.lastThird++; S.boxRun += mates.filter((p) => p !== m.owner && Math.hypot(p.x - 52.5 * d, p.z) < 16).length; }
    }
  }
  return { goals: m.score.join("-"), shots: m.stats.map((s) => s.shots).join("/"), crowd: +(S.crowd / S.f).toFixed(2), pairsUnder5m: +(100 * S.close5 / S.pairs).toFixed(1) + "%", defLineSpread: +(S.defSpread / S.defN).toFixed(1), inBoxWhenLastThird: +(S.boxRun / Math.max(1, S.lastThird)).toFixed(2) };
}
const A={off:[0,0,0],on:[0,0,0]}; for (let i = 0; i < N; i++) for (const on of [false,true]) { const r=run(60+i,on); const g=r.goals.split("-").map(Number), sh=r.shots.split("/").map(Number); const a=A[on?"on":"off"]; a[0]+=g[0]+g[1]; a[1]+=sh[0]+sh[1]; a[2]+=r.defLineSpread; console.log(on?"ON ":"OFF", r); } console.log("TOTAL goles,tiros,spread", A);
