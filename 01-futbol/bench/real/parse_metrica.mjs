// Parser del formato Metrica Sports "Sample Data" (https://github.com/metrica-sports/sample-data)
//  RawTrackingData_{Home,Away}_Team.csv: cabecera "Period,Frame,Time [s],Player11,,Player1,,...,Ball," con coordenadas
//  normalizadas 0..1 (x,y); campo 105×68. Se convierte a metros centrados (x: -52.5..52.5, z: -34..34).
import fs from "node:fs";
const hyp = Math.hypot;
const num = (s) => { const v = parseFloat(s); return Number.isFinite(v) ? v : NaN; };

export function parseTracking(file, teamLabel) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
  const head = lines.findIndex((l) => l.startsWith("Period,Frame"));
  if (head < 0) throw new Error("cabecera Metrica no encontrada en " + file);
  const cols = lines[head].split(","), players = [];
  for (let c = 3; c < cols.length; c += 2) { const name = cols[c]; if (name) players.push({ name, c }); }
  const frames = [];
  for (let i = head + 1; i < lines.length; i++) {
    const r = lines[i].split(","), fr = { period: +r[0], frame: +r[1], t: num(r[2]), players: [], ball: null };
    for (const p of players) {
      const x = num(r[p.c]), y = num(r[p.c + 1]), m = { x: Number.isFinite(x) ? x * 105 - 52.5 : NaN, z: Number.isFinite(y) ? y * 68 - 34 : NaN };
      if (p.name === "Ball") fr.ball = m; else fr.players.push({ id: p.name, ...m });
    }
    frames.push(fr);
  }
  return { team: teamLabel, frames };
}
export function mergeTracking(home, away) {
  const n = Math.min(home.frames.length, away.frames.length), frames = [];
  for (let i = 0; i < n; i++) frames.push({ t: home.frames[i].t, home: home.frames[i].players, away: away.frames[i].players, ball: home.frames[i].ball });
  return frames;
}
// Eventos: Team,Type,Subtype,Period,Start Frame,Start Time [s],End Frame,End Time [s],From,To,Start X,Start Y,End X,End Y
export function parseEvents(file) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean), out = [];
  for (let i = 1; i < lines.length; i++) {
    const r = lines[i].split(",");
    out.push({ team: r[0], type: r[1], sub: r[2], period: +r[3], sf: +r[4], st: num(r[5]), ef: +r[6], et: num(r[7]), from: r[8], to: r[9] });
  }
  return out;
}
// Pases reales: longitud, tiempo de vuelo y cuánto se movió el receptor entre el pase y la recepción
// (Fase 21: distancia recorrida por el receptor antes de recibir / velocidad del receptor hacia el punto de encuentro).
export function passMetrics(frames, events, fps = 25) {
  const res = { n: 0, len: [], flight: [], recvTravel: [], recvSpeed: [] };
  const idx = (f0) => Math.max(0, Math.min(frames.length - 1, f0));
  for (const e of events) {
    if (e.type !== "PASS" || !e.to || !e.from) continue;
    const a = frames[idx(e.sf - 1)], b = frames[idx(e.ef - 1)];
    if (!a || !b) continue;
    const tm = e.team === "Home" ? "home" : "away", r0 = a[tm].find((p) => p.id === e.to), r1 = b[tm].find((p) => p.id === e.to);
    if (!r0 || !r1 || !Number.isFinite(r0.x) || !Number.isFinite(r1.x)) continue;
    const T = Math.max(0.1, (e.ef - e.sf) / fps), tr = hyp(r1.x - r0.x, r1.z - r0.z);
    res.n++; res.len.push(hyp(b.ball.x - a.ball.x, b.ball.z - a.ball.z)); res.flight.push(T); res.recvTravel.push(tr); res.recvSpeed.push(tr / T);
  }
  return res;
}
