// Inyecta tlb/engine.js, tlb/app.js y tlb/tlb.css en fulbo.html y engancha los hooks (idempotente).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const dir = path.dirname(fileURLToPath(import.meta.url)), root = path.join(dir, "..");
const f = path.join(root, "fulbo.html");
let hRaw = fs.readFileSync(f, "utf8");
// fulbo.html usa fin de línea CRLF (\r\n) en casi todo el archivo, pero los patrones/marcadores de
// este script (abajo) están escritos con \n — sin esta normalización, cualquier hook o marcador de
// idempotencia que incluya un salto de línea nunca hace match contra el archivo real: el hook nunca
// se detecta como "ya aplicado" y se reinyecta en cada corrida (visto: tlAerialTarget duplicándose
// cada vez que se corre el generador), y otros directamente nunca llegan a aplicarse ("HOOK NO
// APLICADO"). Se procesa todo en LF y se restaura CRLF recién al escribir, así el archivo mantiene
// su convención de fin de línea de siempre.
const crlf = hRaw.includes("\r\n");
let h = crlf ? hRaw.replace(/\r\n/g, "\n") : hRaw;
const rd = (n) => fs.readFileSync(path.join(dir, n), "utf8");
function block(begin, end, code, anchorFn) {
  const b = h.indexOf(begin), e = h.indexOf(end);
  const text = `${begin}\n${code}\n${end}`;
  if (b >= 0 && e > b) h = h.slice(0, b) + text + h.slice(e + end.length);
  else { const at = anchorFn(); h = h.slice(0, at) + text + "\n" + h.slice(at); }
}
// 1) motor: justo después de AI2_END (mismo scope que class wc)
block("// <<TLB_ENGINE_BEGIN>>", "// <<TLB_ENGINE_END>>", rd("engine.js") + "\n" + rd("referee.js"), () => { const i = h.indexOf("// <<AI2_END>>"); return h.indexOf("\n", i) + 1; });
// 2) app: antes del RAF loop
block("// <<TLB_APP_BEGIN>>", "// <<TLB_APP_END>>", rd("motion.js") + "\n" + rd("graphics.js") + "\n" + rd("app.js"), () => h.indexOf("function Pl(i) {"));
// 3) css
block("/* <<TLB_CSS_BEGIN>> */", "/* <<TLB_CSS_END>> */", rd("tlb.css"), () => h.indexOf("</style>"));
// 4) hooks (una sola vez cada uno)
const hooks = [
  ["this.ai2Reset && this.ai2Reset();", "this.ai2Reset && this.ai2Reset();\n    this.tlInit && this.tlInit();"],
  [/(\n    \}\n)(  \}\n  decide\(t\) \{)/, "$1    this.tlOnShot && this.tlOnShot(t, l, e, volley, trivela, o);\n$2", "tlOnShot"],
  ["(t.skillMove = chosen.key),", "(t.skillMove = chosen.key),\n      (this.tlOnSkill && this.tlOnSkill(t, chosen.key)),"],
  [/slide =\n\s+closingFast &&\n\s+this\.random\(\) < te\(0\.3 \+ riskAppetite \* 0\.45, 0\.08, 0\.78\);/, "slide = this.tlSlideDecide && this.tlbEnabled\n            ? this.tlSlideDecide(f, v, closingFast)\n            : closingFast && this.random() < te(0.3 + riskAppetite * 0.45, 0.08, 0.78);", "tlSlideDecide"],
  ["    // Memoria (spec #15): un gol sube bastante", "    this.tlOnGoal && this.tlOnGoal(t, e);\n    // Memoria (spec #15): un gol sube bastante"],
  ["(this.excitement = Math.max(0, this.excitement - t * 4)),", "(this.excitement = Math.max(0, this.excitement - t * 4)),\n        (this.tlTick && this.tlTick(t)),"],
  ["        if (((this.wait -= t), this.wait <= 0))", "        this.phase === \"goal\" && this.tlGoalTick && this.tlGoalTick(t);\n        if (((this.wait -= t), this.wait <= 0))"],
  ["      if (l.role === \"GK\") {\n        this.keeper(l, t);", "      if (l.tlLock > this.elapsed) { this.tlLockMove(l, t); continue; }\n      if (l.role === \"GK\") {\n        this.keeper(l, t);"],
  // renderer: pose procedural antes de la atajada
  ["      // A. ANIMACIÓN DE ATAJADA (Goalkeeper Dive / Catch)", "      if (window.TLB && TLB.pose(p, model, elapsed, idx, speed)) return;\n      // A. ANIMACIÓN DE ATAJADA (Goalkeeper Dive / Catch)"],
  // cámara
  ["    const desiredFov = this.mode === \"tactical\"", "    let ovRate = 0;\n    { const ov = window.TLB && this.mode !== \"tactical\" && TLB.camOverride(m, ball, isReplay); if (ov) { camX = ov.cx; camY = ov.cy; camZ = ov.cz; lookX = ov.lx; lookY = ov.ly; lookZ = ov.lz; ovRate = ov.rate || 4; } }\n    const desiredFov = this.mode === \"tactical\""],
  ["const lerpFactor = 1 - Math.exp(-Math.min(delta, .1) * 3.2);", "const lerpFactor = 1 - Math.exp(-Math.min(delta, .1) * (ovRate || 3.2));"],
  // replay frames: tl + emoji
  ["      dive: i.dive,\n      diveDir: i.diveDir,\n    })),\n  };\n}\nfunction TLplayClip", "      dive: i.dive,\n      diveDir: i.diveDir,\n      tl: i.tl ? { anim: i.tl.anim, kind: i.tl.kind, contact: i.tl.contact, t: ht.elapsed - i.tl.t0 } : null,\n      emo: i.tlEmoji && i.tlEmoji.until > ht.elapsed ? i.tlEmoji.e : null,\n    })),\n  };\n}\nfunction TLplayClip"],
  // eventos / gol
  ["ht.onEvent = (i) => {", "ht.onEvent = (i) => {\n  window.TLB && TLB.onEvent(i);"],
  ["(i.type === \"goal\" || i.type === \"offside\") &&\n      captureIt &&", "(i.type === \"offside\" || (i.type === \"goal\" && !(window.TLB && TLB.goalPkg(i, hlClips[i.id])))) &&\n      captureIt &&"],
  // start (botón + barra espaciadora) → previa
  ["nt(\"start-button\").addEventListener(\"click\", Al);", "nt(\"start-button\").addEventListener(\"click\", TLB_START);"],
  ["i.code === \"Space\" && (i.preventDefault(), Al())", "i.code === \"Space\" && (i.preventDefault(), TLB_START())"],
  // frame + debug
  ["  ($e && $e.render(t, gr, e),", "  window.TLB && TLB.frame(e);\n  ($e && $e.render(t, gr, e),"],
  // 4 s mínimos en reinicios (corner, saque de arco/banda, tiro libre)
  ["(this.wait = kind === \"corner\" ? 1.8 : 1.1),", "(this.wait = kind === \"corner\" ? 4.2 : 1.1),"],
  ["dur: te(Math.hypot(taker.x - e, taker.z - n) / 6.5, 0.5, 2.6),", "dur: te(Math.hypot(taker.x - e, taker.z - n) / 6.5, 4, 5),"],
  ["/ 6.2,\n          0.7,\n          2.4,", "/ 6.2,\n          3.1,\n          3.6,"],
  // árbitro con el mismo rig/animaciones que los jugadores
  ["const playersData = replayFrame?.players ?? m.players;", "window.TLB && TLB.refAttach(this, m);\n    const playersData = replayFrame?.players ?? (m.tlRL && this.models.length > m.players.length ? m.tlRL : m.players);"],
  ["const model = this.models[idx];\n\n      // IMPORTANTE", "const model = this.models[idx];\n      if (!model) return;\n\n      // IMPORTANTE"],
  [/(function Rl\(\) \{\n  return \{\n    at: ht\.elapsed,\n    ball: \{ \.\.\.ht\.ball \},\n    players: )ht\.players\.map/, "$1(ht.tlRL || ht.players).map"],
  ["this.models.forEach((model, i) => {\n      const p = players[i],", "this.models.forEach((model, i) => {\n      if (!players[i]) return;\n      const p = players[i],"],
  ["        this.phase === \"goal\" && this.tlGoalTick && this.tlGoalTick(t);", "        this.tlCornerRoam && this.tlCornerRoam(t);\n        this.phase === \"goal\" && this.tlGoalTick && this.tlGoalTick(t);"],
  ["      if (l.tlLock > this.elapsed) {", "      if (l.tlFrozen > this.elapsed) continue;\n      if (l.tlLock > this.elapsed) {"],
  ["  advanceFreeKick(dt) {\n    const fd = this.freeKickData,", "  advanceFreeKick(dt) {\n    this.tlFreeKickRoam && this.tlFreeKickRoam(dt);\n    const fd = this.freeKickData,"],
  ["          (l.state = \"ReceiveBall\"),", "          this.tlAerialTarget && this.tlAerialTarget(l) && ((f = this._tlA.x), (g = this._tlA.z)),\n          (l.state = \"ReceiveBall\"),"],
  ["          (l.state = h ? \"ChaseBall\" : \"Press\"),", "          this.tlAerialTarget && this.tlAerialTarget(l) && ((f = this._tlA.x), (g = this._tlA.z)),\n          (l.state = h ? \"ChaseBall\" : \"Press\"),"],
];
const done = ["this.tlInit && this.tlInit();","this.tlOnShot && this.tlOnShot(t, l, e","this.tlOnSkill && this.tlOnSkill","this.tlSlideDecide && this.tlbEnabled","this.tlOnGoal && this.tlOnGoal","this.tlTick && this.tlTick","this.tlGoalTick && this.tlGoalTick","this.tlLockMove(l, t)","TLB.pose(p, model","TLB.camOverride","(ovRate || 3.2)","emo: i.tlEmoji","TLB.onEvent(i)","TLB.goalPkg","TLB_START);","TLB_START())","TLB.frame(e)","corner\" ? 4.2","/ 6.5, 4, 5","3.1,\n          3.6","TLB.refAttach(this, m)","if (!model) return;","(ht.tlRL || ht.players).map","if (!players[i]) return;","this.tlCornerRoam &&","l.tlFrozen","this.tlFreeKickRoam &&","this.tlAerialTarget && this.tlAerialTarget(l) && ((f = this._tlA.x), (g = this._tlA.z)),\n          (l.state = \"Re","this.tlAerialTarget && this.tlAerialTarget(l) && ((f = this._tlA.x), (g = this._tlA.z)),\n          (l.state = h"];
hooks.forEach(([a, b], k) => {
  if (h.includes(done[k])) return;
  const before = h;
  h = typeof a === "string" ? h.replace(a, () => b) : h.replace(a, b);
  if (before === h) console.warn("HOOK NO APLICADO:", k, String(a).slice(0, 60));
});
const out = crlf ? h.replace(/\n/g, "\r\n") : h;
fs.writeFileSync(f, out);
// sim.mjs: cargar hasta el fin del bloque del motor TLB
const sp = path.join(root, "ai2", "sim.mjs");
if (fs.existsSync(sp)) {
let s = fs.readFileSync(sp, "utf8");
if (!s.includes("TLB_ENGINE_END")) { s = s.replace('l === "// <<AI2_END>>"', 'l === "// <<TLB_ENGINE_END>>"'); fs.writeFileSync(sp, s); }
}
console.log("TLB inyectado. bytes:", out.length);
