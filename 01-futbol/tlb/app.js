// TLB broadcast director: original 3D inserts, joint animation and retro television graphics.
const TLB = (window.TLB = (() => {
  const cfg = { emoji: true, bcast: true, trans: "FULL", autoReplay: true, celeb: "FULL" };
  try { Object.assign(cfg, JSON.parse(localStorage.getItem("tlb.cfg") || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem("tlb.cfg", JSON.stringify(cfg)); } catch (e) {} };
  const H = (s) => { const d = document.createElement("div"); d.innerHTML = s.trim(); return d.firstElementChild; };
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sm = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  const lerp = (a, b, t) => a + (b - a) * t;
  // RNG propio (NO consume this.random() del motor → no altera la simulación)
  let rs = 12345; const rnd = () => ((rs = (1664525 * rs + 1013904223) >>> 0) / 4294967296);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const root = H('<div id="tlb"><div class="tlb-st-slot"></div><div class="tlb-lower" hidden></div><div class="tlb-emo"></div></div>');
  const VP = nt("viewport"); if (getComputedStyle(VP).position === "static") VP.style.position = "relative"; VP.appendChild(root);
  const stSlot = root.querySelector(".tlb-st-slot"), lowerEl = root.querySelector(".tlb-lower"), emoEl = root.querySelector(".tlb-emo");
  const S = { pkg: null, stUntil: 0, camUntil: 0, camKind: null, lastCine: -99, cardCache: new Map(), goals: [], pre: false, half: false };
  const teamName = (t) => ht.teams[t].name;

  // ---------- STINGERS (placeholder 3D con CSS: anillo + placa + barras) ----------
  const KINDS = {
    goal: ["#d7b653", 4200, "GOL"], replay: ["#73b2bd", 1200, "REPETICIÓN"], corner: ["#38d39f", 2600, "CÓRNER"],
    yellow: ["#ffd23f", 2900, "TARJETA AMARILLA"], red: ["#ff4b4b", 3100, "TARJETA ROJA"], sub: ["#b18cff", 2900, "CAMBIO"],
    penalty: ["#ff5a5f", 3100, "PENAL"], freekick: ["#ffa64d", 2600, "TIRO LIBRE"], var: ["#7ee6ff", 3100, "OFFSIDE · VAR"],
    half: ["#ffffff", 3600, "DESCANSO"], final: ["#ffffff", 4200, "FINAL"],
  };
  function stinger(kind, sub = "", title = null, ms = null) {
    if (!cfg.bcast || cfg.trans === "OFF") return;
    const k = KINDS[kind]; if (!k) return;
    const now = performance.now();
    if (now < S.stUntil && kind !== "goal" && kind !== "final") return;
    const dur = (ms || k[1]);
    S.stUntil = now + dur;
    stSlot.innerHTML = "";
    const el = H(`<div class="tlb-st ${cfg.trans === "REDUCED" ? "reduced" : ""} k-${kind}" style="--c:${k[0]};--d:${dur}ms"><div class="tlb-plate"><small>${esc(sub)}</small><b>${esc(title || k[2])}</b><span class="tlb-tvbrand">LFO · TRANSMISIÓN OFICIAL</span></div></div>`);
    stSlot.appendChild(el);
    const visual = cfg.trans === "FULL" ? TLBGraphics.stinger(el,kind,k[0],dur) : null;
    if(visual) el.classList.add('has-3d');
    setTimeout(() => { visual?.stop(); el.remove(); }, dur + 50);
    sfx(kind);
  }
  function sfx(kind) {
    try {
      if (!ua.enabled || !ua.ctx) return;
      if (kind === "goal" || kind === "final") { ua._tone(392, 0.5, 0.12, "triangle"); ua._tone(523, 0.5, 0.12, "triangle", 0.12); ua._tone(659, 0.7, 0.12, "triangle", 0.24); }
      else if (kind === "replay") { ua._noiseBurst(0.35, 0.16, 2400, 1.2); ua._tone(220, 0.3, 0.08, "sawtooth", 0.05); }
      else if (kind === "yellow" || kind === "red") ua._tone(kind === "red" ? 180 : 330, 0.25, 0.1, "square");
      else ua._noiseBurst(0.22, 0.1, 1800, 1.2);
    } catch (e) {}
  }
  function hitSfx(type) { // capas por técnica (golpeo potente / especial / chilena / volea)
    try {
      if (!ua.enabled || !ua.ctx || !ua._ready("tlb_hit", 0.25)) return;
      if (type === "POWER_SHOT" || type === "LONG_SHOT") { ua._noiseBurst(0.09, 0.32, 900, 1.6); ua._tone(95, 0.12, 0.2, "sine"); }
      else if (type === "BICYCLE_KICK" || type === "RABONA" || type === "TRIVELA") { ua._noiseBurst(0.12, 0.3, 1400, 1.4); ua._tone(140, 0.15, 0.16, "triangle"); ua.crowdReact && ua.crowdReact(0.35, "oh"); }
      else if (type === "VOLLEY" || type === "HALF_VOLLEY") ua._noiseBurst(0.08, 0.26, 2600, 1.5);
    } catch (e) {}
  }

  // ---------- CARTAS (mismo cromo del álbum) ----------
  async function cardOf(p) {
    const key = p.id + "|" + p.name;
    if (S.cardCache.has(key)) return S.cardCache.get(key);
    let out = null;
    try { window.lfoCards && window.lfoCards.cardCanvas && (out = await window.lfoCards.cardCanvas(p)); } catch (e) {}
    if(S.cardCache.size>48) S.cardCache.delete(S.cardCache.keys().next().value);
    S.cardCache.set(key, out); return out;
  }
  const ovrOf = (p) => { try { const i = window.lfoCards.cardInfo(p); if (i) return i; } catch (e) {} const s = p.stats, v = Math.round((s.speed + s.acceleration + s.dribbling + s.passing + s.shooting + s.defense + s.physical + s.intelligence) / 8); return { ovr: v, pos: p.role, club: teamName(p.team) }; };
  const POS = { GK: "POR", DEF: "DEF", MID: "MED", FWD: "DEL" };
  async function fillCard(el, p) {
    if(!el||!p)return;
    const cv=await cardOf(p); if(!cv||!el.isConnected)return;
    const slot=el.matches('.tlb-cardslot')?el:el.querySelector('.tlb-cardslot');
    if(!slot)return;
    slot.replaceChildren();
    if(!TLBGraphics.card(slot,cv)){const im=new Image();im.src=cv.toDataURL('image/webp',.8);im.className='tlb-cardimg';slot.appendChild(im);}
  }

  // ---------- LOWER THIRD + CARTA DEL GOLEADOR ----------
  function showGoalLower(G, tag = "GOOOOL") {
    const p = ht.players[G.scorerId], inf = p ? ovrOf(p) : { ovr: "", pos: "", club: "" }, col = ht.teams[G.scorerTeam].color;
    lowerEl.hidden = false;
    lowerEl.innerHTML = `<div class="tlb-gl" style="--tc:${col}"><div class="tlb-glcard tlb-cardslot"><div class="tlb-ph">${esc(p ? p.number : "")}</div></div>
      <div class="tlb-glinfo"><small>${esc(tag)} · ${esc(teamName(G.scorerTeam))} · ${Math.floor(G.goalTime / 60)}′</small><b>${esc(G.scorerName)}</b>
      <span>#${p ? p.number : ""} · ${esc(POS[p ? p.role : ""] || "")} · MEDIA ${inf.ovr}</span>${G.assistName ? `<em>ASISTENCIA · ${esc(G.assistName)}</em>` : ""}</div>
      <div class="tlb-glscore"><span>${ht.score[0]}</span><i>—</i><span>${ht.score[1]}</span></div></div>`;
    p && fillCard(lowerEl.querySelector(".tlb-glcard"), p);
  }
  const hideLower = () => { lowerEl.hidden = true; lowerEl.innerHTML = ""; };

  // ---------- PAQUETE DE GOL ----------
  function goalPkg(ev, clip) {
    if (!cfg.bcast) return false;
    const G = ht.tlGoal; if (!G) return false;
    S.goals.push({ type: G.goalType, min: Math.floor(G.goalTime / 60), team: G.scorerTeam, name: G.scorerName, assist: G.assistName, far: G.goalType === "LONG_SHOT" });
    try { nt("event-callout").classList.remove("show"); ba = 0; } catch (e) {}
    S.pkg = { G, clip, state: "cel", after: [], lastCap: 0, t0: performance.now() };
    if (cfg.celeb === "SHORT") ht.wait = Math.min(ht.wait, 4.4);
    stinger("goal", teamName(G.scorerTeam), "GOL", 4200);
    showGoalLower(G);
    return true;
  }
  function pkgTick() {
    const P = S.pkg; if (!P) return;
    if (P.state === "cel") {
      if (ht.elapsed - P.lastCap >= 1 / 15 && P.after.length < 30) { P.after.push(Rl()); P.lastCap = ht.elapsed; }
      const near = ht.wait <= (cfg.celeb === "SHORT" ? 1.2 : 2.1);
      if (near || ht.phase !== "goal") {
        if (cfg.autoReplay && P.clip && !Ge && ht.phase === "goal") {
          P.state = "stinger"; stinger("replay", "LFO", "REPETICIÓN", 1200);
          setTimeout(() => { if (S.pkg !== P) return; P.state = "replay"; TLplayClip([...P.clip, ...P.after.slice(0, 22)]); P.angles = anglesFor(P.G.goalType); showGoalLower(P.G, "REPETICIÓN"); }, 1100);
        } else { P.state = "done"; hideLower(); S.pkg = null; }
      }
    } else if (P.state === "replay" && !Ge) { P.state = "done"; hideLower(); S.pkg = null; }
  }
  const anglesFor = (t) => ({ TRIVELA: ["close", "wide"], RABONA: ["close", "wide"], BICYCLE_KICK: ["low", "side"], LONG_SHOT: ["wide", "follow"], HEADER: ["side", "goalcam"], VOLLEY: ["side", "follow"], HALF_VOLLEY: ["side", "follow"] }[t] || pick([["side", "wide"], ["behind", "side", "wide"], ["low", "wide"]]));

  // ---------- CÁMARA CONTEXTUAL (devuelve override o null) ----------
  function camOverride(m, ball, isReplay) {
    if (!cfg.bcast || !m.started) return null;
    const now = ht.elapsed, dirOf = (t) => m.direction(t);
    // replay multi-cámara
    if (isReplay && S.pkg && S.pkg.angles && Ge) {
      const A = S.pkg.angles, clipDur = Math.max(1, Ge[Ge.length - 1].at - Ge[0].at), f = clamp(ha / clipDur, 0, 0.999), a = A[Math.min(A.length - 1, Math.floor(f * A.length))];
      const G = S.pkg.G, sx = G.x, sz = G.z, d = G.dir, sgn = ball.z >= 0 ? 1 : -1;
      if (a === "wide") return null;
      if (a === "side") return { cx: clamp(ball.x * 0.9, -50, 50), cy: 8, cz: -sgn * 26, lx: ball.x, ly: 1, lz: ball.z * 0.7, rate: 4 };
      if (a === "low") return { cx: sx - d * 9, cy: 1.3, cz: sz + (sz >= 0 ? -8 : 8), lx: ball.x, ly: 1.2, lz: ball.z, rate: 5 };
      if (a === "behind") return { cx: sx - d * 7, cy: 3.2, cz: sz * 0.85, lx: ball.x, ly: 1.4, lz: ball.z, rate: 5 };
      if (a === "close") return { cx: sx - d * 3, cy: 2.1, cz: sz + 5 * (sz >= 0 ? -1 : 1), lx: sx + d * 2, ly: 1.1, lz: sz, rate: 6 };
      if (a === "goalcam") return { cx: 52.5 * d + d * 4, cy: 2.2, cz: clamp(sz, -8, 8) + 6, lx: ball.x, ly: 1.4, lz: ball.z, rate: 5 };
      if (a === "follow") return { cx: ball.x - d * 12, cy: 4, cz: ball.z + 12, lx: ball.x + d * 6, ly: 1, lz: ball.z, rate: 5 };
      return null;
    }
    if (isReplay) return null;
    // celebración
    const G = m.tlGoal;
    if (m.phase === "goal" && G && !S.pkg?.state?.startsWith("stinger")) {
      const sc = m.players[G.scorerId]; if (!sc) return null;
      if (G.phase === "run") return { cx: sc.x - G.dir * 9, cy: 3.4, cz: sc.z + (sc.z >= 0 ? -10 : 10), lx: sc.x, ly: 1.2, lz: sc.z, rate: 3.2 };
      return { cx: sc.x - G.dir * 7.5, cy: 2.1, cz: sc.z + (sc.z >= 0 ? -3 : 3), lx: sc.x, ly: 1.5, lz: sc.z, rate: 2.4 };
    }
    // córner: cámara se reubica hacia el área
    if (m.phase === "restart" && m.restartData && m.restartData.kind === "corner") {
      const rd = m.restartData, sx = Math.sign(rd.x || 1), sz = Math.sign(rd.z || 1);
      return { cx: rd.x + sx * 9, cy: 5.5, cz: rd.z + sz * 6, lx: rd.x - sx * 12, ly: 1.2, lz: rd.z * 0.15, rate: 2.2 };
    }
    // acciones especiales (una a la vez y con cooldown para no saturar)
    if (S.camUntil > now && S.camP) {
      const p = S.camP, k = S.camKind, sgn = p.z >= 0 ? -1 : 1, d = m.direction(p.team), tl = p.tl;
      const flying = tl && now - tl.t0 > (tl.contact || 0.15);
      if (k === "close") return { cx: p.x - d * 3.5, cy: 1.9, cz: p.z + sgn * 5.5, lx: p.x + d * 1.5, ly: 1, lz: p.z, rate: 7 };
      if (k === "low") return { cx: p.x - d * 5, cy: 1.0, cz: p.z + sgn * 8, lx: p.x, ly: 1.4, lz: p.z, rate: 7 };
      if (k === "slide") return { cx: p.x - d * 2, cy: 0.9, cz: p.z + sgn * 6.5, lx: p.x + p.vx * 0.3, ly: 0.4, lz: p.z + p.vz * 0.3, rate: 8 };
      if (k === "long") return flying ? { cx: clamp(p.x - d * 14, -55, 55), cy: 7, cz: p.z + sgn * 15, lx: ball.x + d * 8, ly: 1.5, lz: ball.z, rate: 4 }
        : { cx: p.x - d * 6, cy: 4, cz: p.z + sgn * 13, lx: p.x + d * 8, ly: 1.5, lz: p.z * 0.8, rate: 5 };
      if (k === "follow") return { cx: p.x - d * 7, cy: 3.2, cz: p.z + sgn * 9, lx: flying ? ball.x : p.x, ly: 1.2, lz: flying ? ball.z : p.z, rate: 5 };
    }
    return null;
  }
  function camWatch() { // decide si un gesto merece corte
    const m = ht; if (!cfg.bcast || S.camUntil > m.elapsed || m.phase !== "playing") return;
    for (const p of m.players) {
      const tl = p.tl; if (!tl || tl.kind !== "shot" || tl.seen) continue;
      if (m.elapsed - tl.t0 > 0.25) continue;
      tl.seen = true;
      const a = tl.anim, big = { TRIVELA: "close", RABONA: "close", BICYCLE_KICK: "low", LONG_SHOT: "long", VOLLEY: "follow", HALF_VOLLEY: "follow" }[a];
      const isSlide = tl.kind === "slide", cool = m.elapsed - S.lastCine > (isSlide ? 9 : 14);
      const worth = big || (a === "POWER_SHOT" && rnd() < 0.25) || (isSlide && (a === "LAST_DITCH_SLIDE" || a === "EMERGENCY_SLIDE" || rnd() < 0.3));
      if (worth && cool) { S.camP = p; S.camKind = isSlide ? "slide" : big || "follow"; S.camUntil = m.elapsed + (isSlide ? 0.9 : 1.7); S.lastCine = m.elapsed; hitSfx(a); }
      else hitSfx(a);
      break;
    }
  }

  // Joint tracks are independent of the broadcast toggle and retain replay timing.
  // Árbitro con el mismo rig/animaciones que los jugadores; kit fluor (color por partido desde el motor).
  function refAttach(r, m) {
    const R = m.tlRef; if (!R || !r.models) return;
    if (r.models.length === m.players.length) {
      const md = r.createPlayer(R);
      const card = new T3.Mesh(new T3.BoxGeometry(0.11, 0.16, 0.012), new T3.MeshBasicMaterial({ color: "#facc15" }));
      card.position.set(0, -0.36, 0.05); card.visible = false; md.rightArm.lower.add(card);
      md.refCard = card; md.refColor = null; r.models.push(md);
      if (r.refGroup) { r.scene.remove(r.refGroup); r.refGroup = null; r.refCard = null; }
    }
    const md = r.models[m.players.length];
    if (md && md.refColor !== R.color) {
      md.refColor = R.color;
      md.root.traverse((o) => { if (o.isMesh && o.material && o.material.map) { o.material.map = null; o.material.color.set(R.color); o.material.needsUpdate = true; } });
    }
  }
  function pose(p, md, elapsed, idx) {
    return TLMotion.pose(p, md, elapsed, idx, ht, !!Ge);
  }

  // ---------- EMOJIS (pool de globos DOM) ----------
  const emoPool = [];
  function emojiFrame(e) {
    const on = cfg.bcast && cfg.emoji; let n = 0;
    if (on && $e) {
      const src = e ? e.players : ht.players;
      for (let i = 0; i < src.length && n < 8; i++) {
        const q = src[i], live = ht.players[i];
        const em = e ? q.emo : live.tlEmoji && live.tlEmoji.until > ht.elapsed ? live.tlEmoji.e : null;
        if (!em) continue;
        let el = emoPool[n]; if (!el) { el = H('<span class="tlb-bubble"></span>'); emoEl.appendChild(el); emoPool[n] = el; }
        const r = $e.project(q.x, 2.9, q.z);
        if (el.textContent !== em) el.textContent = em;
        el.style.transform = `translate(${r.x}px,${r.y}px) translate(-50%,-100%)`; el.hidden = false; n++;
      }
    }
    for (let i = n; i < emoPool.length; i++) emoPool[i].hidden = true;
  }

  // ---------- STUDIO ANALYSIS ENGINE (determinista: reglas + plantillas, sin datos inventados) ----------
  const norm = (v) => (v > 1.5 ? v / 100 : v);
  function profile(t) {
    const ps = ht.players.filter((p) => p.team === t && !p.sentOff).slice(0, 11), by = (r) => ps.filter((p) => r.includes(p.role));
    const avg = (arr, f) => (arr.length ? arr.reduce((s, p) => s + f(p), 0) / arr.length : 0);
    const ovr = (p) => (p.stats.speed + p.stats.acceleration + p.stats.dribbling + p.stats.passing + p.stats.shooting + p.stats.defense + p.stats.physical + p.stats.intelligence) / 8;
    const tt = ht.teamTactics(t);
    const att = by(["FWD"]).concat(by(["MID"]).slice(0, 3));
    let best = ps.filter((p) => p.role !== "GK").sort((a, b) => ovr(b) - ovr(a))[0];
    return { t, name: teamName(t), form: ht.teams[t].formation, ovr: avg(ps, ovr), atk: avg(att, (p) => (p.stats.shooting + p.stats.dribbling + p.stats.speed) / 3), def: avg(by(["DEF"]), (p) => (p.stats.defense + p.stats.physical) / 2),
      mid: avg(by(["MID"]), (p) => (p.stats.passing + p.stats.intelligence) / 2), speed: avg(ps, (p) => p.stats.speed), cre: avg(ps, (p) => p.personality.creativity), phys: avg(ps, (p) => p.stats.physical),
      width: norm(tt.width), direct: norm(tt.directness), press: norm(tt.pressingIntensity), poss: norm(tt.possessionPreference), star: best, ment: ht.teams[t].mentality };
  }
  const L = {
    open: ["{n} sale con un {f}.", "{n} apuesta por un {f} esta noche.", "La propuesta de {n}: un {f}."],
    ovr: ["{a} llega con mejor nivel medio ({x} contra {y}).", "En papel, {a} tiene ventaja: media {x} frente a {y}.", "Los números favorecen a {a}: {x} de media contra {y}."],
    ovrEq: ["Los dos equipos llegan muy parejos: {x} y {y} de media."],
    wide: ["{n} promete mucha amplitud.", "{n} va a abrir el campo con insistencia."], narrow: ["{n} presenta un mediocampo más compacto.", "{n} prefiere cerrarse por dentro."],
    direct: ["{n} llega con un perfil más directo.", "{n} buscará atajos: juego vertical."], poss: ["{n} quiere la pelota y tratará de manejar el ritmo.", "{n} apuesta por la posesión."],
    press: ["{n} saldrá a presionar arriba.", "Presión alta en el plan de {n}."], speed: ["{n} tiene la velocidad como arma ({x} de media).", "Ojo a los espacios: {n} corre mucho ({x})."],
    phys: ["{n} pisa fuerte por arriba: fortaleza física de {x}.", "En el juego aéreo, {n} parte con ventaja ({x})."], cre: ["{n} tiene creatividad de sobra ({x}): pueden inventar algo.", "La chispa de {n} puede aparecer en cualquier momento."],
    duel: ["La atención estará puesta en el duelo entre el ataque de {a} ({x}) y la defensa de {b} ({y}).", "Buen cruce: el ataque de {a} contra la línea de {b}."],
    star: ["Un nombre a seguir: {p}, el de mejor nivel en {n}.", "{p} es la referencia de {n} con {x} de media."],
    close: ["Todo listo. Nos vamos a la cancha.", "Todo listo. Nos vamos a la cancha, que ya empieza."],
    resW: ["{w} se lleva el partido {a}-{b}.", "Final: {w} gana {a} a {b}."], resD: ["Empate {a}-{b}: se reparten los puntos."],
    early: ["El gol temprano de {p} marcó el trámite.", "Muy pronto, minuto {m}, golpeó {p}."], late: ["Y un final de infarto: gol de {p} en el {m}′.", "Tarde, pero con premio: {p} anota en el {m}′."],
    comeback: ["{w} dio vuelta el resultado: gran remontada.", "Remontada de {w}: perdía y terminó ganando."], golazo: ["Hubo golazo: {p} la puso desde lejos.", "El tanto de {p} desde afuera del área es de los que se repiten."],
    dompos: ["{n} manejó el partido con {x}% de posesión.", "Dominio de posesión para {n}: {x}%."], domshots: ["{n} generó más peligro: xG {x} contra {y}.", "En ocasiones, ventaja clara de {n} ({s1} tiros a {s2})."],
    tight: ["Partido cerrado, con pocas ocasiones.", "Poco espacio y pocas llegadas: partido trabado."], chaos: ["Un partido caótico, de ida y vuelta.", "Mucho ida y vuelta: partido sin dueño."],
    red: ["La expulsión condicionó el trámite.", "Con la roja, el partido cambió."], pen: ["Hubo penal en el partido: {n} lo tuvo."], saves: ["Grandes atajadas de {p} ({x}).", "{p} sostuvo a su equipo con {x} atajadas."],
    mvp: ["El destacado: {p}, por {r}.", "Jugador de la noche: {p} ({r})."], upset: ["Ganó el que tenía menos media: sorpresa."], fair: ["El resultado refleja lo visto."],
    halfScore: ["Así llegamos al descanso: {n0} {a} — {b} {n1}.", "Al entretiempo, {n0} {a}, {n1} {b}."],
    halfPosD: ["{n} maneja el balón en el primer tiempo, con {x}% de posesión.", "Más pelota para {n}: {x}% de posesión en la primera mitad."],
    halfPosEq: ["Primer tiempo parejo en la tenencia del balón."],
    halfClose: ["Volvemos enseguida con el complemento.", "Ya se preparan los equipos para la segunda mitad."],
  };
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] ?? ""));
  const line = (k, o = {}) => fmt(pick(L[k]), o);
  function studioPre() {
    const a = profile(0), b = profile(1), out = [];
    out.push(["A", line("open", { n: a.name, f: a.form }) + " " + line("open", { n: b.name, f: b.form })]);
    const d = a.ovr - b.ovr;
    out.push(["B", Math.abs(d) < 1.5 ? line("ovrEq", { x: a.ovr.toFixed(0), y: b.ovr.toFixed(0) }) : line("ovr", { a: d > 0 ? a.name : b.name, x: Math.max(a.ovr, b.ovr).toFixed(0), y: Math.min(a.ovr, b.ovr).toFixed(0) })]);
    const traits = [];
    for (const t of [a, b]) {
      if (t.width > 0.6) traits.push(line("wide", { n: t.name })); else if (t.width < 0.4) traits.push(line("narrow", { n: t.name }));
      if (t.direct > 0.6) traits.push(line("direct", { n: t.name })); else if (t.poss > 0.6) traits.push(line("poss", { n: t.name }));
      if (t.press > 0.65) traits.push(line("press", { n: t.name }));
    }
    const fast = a.speed > b.speed + 2 ? a : b.speed > a.speed + 2 ? b : null; fast && traits.push(line("speed", { n: fast.name, x: fast.speed.toFixed(0) }));
    const strong = a.phys > b.phys + 2 ? a : b.phys > a.phys + 2 ? b : null; strong && traits.push(line("phys", { n: strong.name, x: strong.phys.toFixed(0) }));
    const cre = a.cre > b.cre + 4 ? a : b.cre > a.cre + 4 ? b : null; cre && traits.push(line("cre", { n: cre.name }));
    traits.sort(() => rnd() - 0.5); traits.slice(0, 3).forEach((s, i) => out.push([i % 2 ? "A" : "B", s]));
    out.push(["A", line("duel", { a: a.atk > b.atk ? a.name : b.name, x: Math.max(a.atk, b.atk).toFixed(0), b: a.atk > b.atk ? b.name : a.name, y: (a.atk > b.atk ? b.def : a.def).toFixed(0) })]);
    const st = a.star && b.star ? (a.star && a.ovr >= b.ovr ? a : b) : a; if (st.star) out.push(["B", line("star", { p: st.star.name, n: st.name, x: ovrOf(st.star).ovr })]);
    try { const x = window.TLM_STUDIO && TLM_STUDIO.pre && TLM_STUDIO.pre(); x && x.length && out.push(...x); } catch (e) {} // contexto de liga del manager (sólo datos reales)
    out.push(["A", pick(L.close)]);
    return out;
  }
  function matchFacts() {
    const st = ht.stats, sc = ht.score, ev = ht.events.slice().reverse(), goals = ev.filter((e) => e.type === "goal");
    const pos = [st[0].possession, st[1].possession], tp = pos[0] + pos[1] || 1, pp = [Math.round(pos[0] / tp * 100), Math.round(pos[1] / tp * 100)];
    return { sc, st, goals, pp, ev, cards: ev.filter((e) => e.type === "card"), subs: ev.filter((e) => e.type === "sub") };
  }
  function mvpOf(F) {
    const sco = {}; const add = (id, v, why) => { if (id == null) return; sco[id] = sco[id] || { v: 0, why: [] }; sco[id].v += v; sco[id].why.push(why); };
    F.ev.forEach((e) => { if (e.type === "goal") add(e.player, 3, "gol"); else if (e.type === "save") add(e.player, 1.1, "atajada"); else if (e.type === "tackle") add(e.player, 0.6, "recuperación"); else if (e.type === "block") add(e.player, 0.5, "bloqueo"); });
    S.goals.forEach((g) => { const p = ht.players.find((q) => q.name === g.name); if (p && g.assist) { const a = ht.players.find((q) => q.name === g.assist); a && add(a.id, 1.5, "asistencia"); } });
    const best = Object.entries(sco).sort((a, b) => b[1].v - a[1].v)[0]; if (!best) return null;
    const c = {}; best[1].why.forEach((w) => (c[w] = (c[w] || 0) + 1));
    return { p: ht.players[+best[0]], why: Object.entries(c).map(([w, n]) => (n > 1 ? `${n} ${w}s` : `1 ${w}`)).join(" y ") };
  }
  function studioPost() {
    const F = matchFacts(), [a, b] = F.sc, out = [], W = a > b ? 0 : b > a ? 1 : -1, n0 = teamName(0), n1 = teamName(1);
    out.push(["A", W < 0 ? line("resD", { a, b }) : line("resW", { w: teamName(W), a, b })]);
    const gl = F.goals; const first = gl[0], last = gl[gl.length - 1];
    if (first && first.time < 600) out.push(["B", line("early", { p: ht.players[first.player]?.name || "el goleador", m: Math.floor(first.time / 60) })]);
    if (last && last.time >= 5100 && gl.length > 1) out.push(["B", line("late", { p: ht.players[last.player]?.name || "el goleador", m: Math.floor(last.time / 60) })]);
    let lead = 0, trailed = [false, false], sc = [0, 0]; gl.forEach((g) => { sc[g.team]++; if (sc[0] < sc[1]) trailed[0] = true; if (sc[1] < sc[0]) trailed[1] = true; });
    if (W >= 0 && trailed[W]) out.push(["A", line("comeback", { w: teamName(W) })]);
    const far = S.goals.find((g) => g.far || g.type === "BICYCLE_KICK" || g.type === "RABONA"); far && out.push(["B", far.far ? line("golazo", { p: far.name }) : `${far.name} firmó un gol de otra categoría (${far.type === "RABONA" ? "rabona" : "chilena"}).`]);
    const tp = F.pp, dom = tp[0] > 58 ? 0 : tp[1] > 58 ? 1 : -1; dom >= 0 && out.push(["A", line("dompos", { n: teamName(dom), x: tp[dom] })]);
    const x0 = F.st[0].xg, x1 = F.st[1].xg; if (Math.abs(x0 - x1) > 0.9) { const w = x0 > x1 ? 0 : 1; out.push(["B", line("domshots", { n: teamName(w), x: Math.max(x0, x1).toFixed(1), y: Math.min(x0, x1).toFixed(1), s1: F.st[w].shots, s2: F.st[1 - w].shots })]); }
    if (F.st[0].red + F.st[1].red) out.push(["A", line("red")]);
    if (F.st[0].penalties + F.st[1].penalties) out.push(["B", line("pen", { n: teamName(F.st[0].penalties ? 0 : 1) })]);
    const sv = [0, 1].map((t) => F.st[t].saves), bt = sv[0] >= sv[1] ? 0 : 1; if (sv[bt] >= 5) out.push(["A", line("saves", { p: ht.players[bt * 11].name, x: sv[bt] })]);
    const tot = F.st[0].shots + F.st[1].shots; if (tot < 14 && a + b <= 1) out.push(["B", line("tight")]); else if (a + b >= 5 || F.st[0].fouls + F.st[1].fouls > 30) out.push(["B", line("chaos")]);
    if (W >= 0) { const pw = profile(W), pl = profile(1 - W); pl.ovr - pw.ovr > 2 && out.push(["A", line("upset")]); }
    const mv = mvpOf(F); mv && out.push(["B", line("mvp", { p: mv.p.name, r: mv.why })]);
    try { const x = window.TLM_STUDIO && TLM_STUDIO.post && TLM_STUDIO.post(); x && x.length && out.push(...x); } catch (e) {} // posición en la tabla y racha (manager)
    out.push(["A", line("fair")]); F.mvp = mv; return { lines: out, F };
  }
  function studioHalf() {
    const out = [];
    out.push(["A", line("halfScore", { n0: teamName(0), n1: teamName(1), a: ht.score[0], b: ht.score[1] })]);
    const st = ht.stats, tp = (st[0].possession + st[1].possession) || 1, pp = [Math.round(st[0].possession / tp * 100), Math.round(st[1].possession / tp * 100)];
    const dom = pp[0] > 58 ? 0 : pp[1] > 58 ? 1 : -1;
    out.push(["B", dom >= 0 ? line("halfPosD", { n: teamName(dom), x: pp[dom] }) : pick(L.halfPosEq)]);
    out.push(["A", pick(L.halfClose)]);
    return out;
  }

  // ---------- ESCENA DE ESTUDIO (placeholder) ----------
  function studioScene(host, cls = "") {
    host.innerHTML = `<div class="tlb-studio ${cls}"><div class="tlb-wall"><div class="tlb-screen"></div></div>
      <div class="tlb-hosts"><div class="tlb-host a"><small>LUCÍA ACOSTA · ANÁLISIS</small></div><div class="tlb-host b"><small>DIEGO FERREYRA · CRÓNICA</small></div></div>
      <div class="tlb-station">LFO <span>EN VIVO</span></div><div class="tlb-cap"><b></b><span></span></div></div>`;
    const sc=host.querySelector('.tlb-studio');sc._visual=TLBGraphics.studio(sc);return sc;
  }
  function speak(scene, lines, done) {
    let i = 0, alive = true; const cap = scene.querySelector(".tlb-cap"), ha_ = scene.querySelector(".host.a, .tlb-host.a"), hb = scene.querySelector(".tlb-host.b");
    const next = () => {
      if (!alive) return; if (i >= lines.length) { done && done(); return; }
      const [who, txt] = lines[i++]; cap.classList.add("on"); cap.querySelector("b").textContent = who === "A" ? "LUCÍA ACOSTA · ANÁLISIS" : "DIEGO FERREYRA · CRÓNICA";
      ha_.classList.toggle("talk", who === "A"); hb.classList.toggle("talk", who === "B");
      const sp = cap.querySelector("span"); sp.textContent = ""; let k = 0;
      const iv = setInterval(() => { if (!alive) return clearInterval(iv); sp.textContent = txt.slice(0, ++k); if (k >= txt.length) { clearInterval(iv); scene._t = setTimeout(next, 900 + txt.length * 22); } }, 24);
      scene._iv = iv;
    };
    scene._skip = () => { clearInterval(scene._iv); clearTimeout(scene._t); const sp = cap.querySelector("span"); if (sp.textContent.length < (lines[i - 1]?.[1].length || 0)) { sp.textContent = lines[i - 1][1]; scene._t = setTimeout(next, 700); } else next(); };
    scene._stop = () => { scene._visual?.stop(); alive = false; clearInterval(scene._iv); clearTimeout(scene._t); };
    next(); return scene;
  }

  // ---------- PRE-PARTIDO ----------
  function lineupPitch(t) {
    const ps=ht.players.filter(p=>p.team===t&&!p.sentOff).slice(0,11);
    return `<div class="tlb-lp" style="--tc:${ht.teams[t].color}"><div class="tlb-lp-h"><b>${esc(teamName(t))}</b><span>${esc(ht.teams[t].formation)}</span></div><div class="tlb-formation-body"><div class="tlb-pitch">${ps.map(p=>`<div class="tlb-chip" data-id="${p.id}" style="--dl:0s"><em>${p.number}</em><small>${esc(p.name.split(' ').slice(-1)[0])}</small></div>`).join('')}</div><div class="tlb-roster"><h3>LOS ONCE TITULARES</h3>${ps.map(p=>`<div><em>${p.number}</em><b>${esc(p.name)}</b><small>${POS[p.role]}</small></div>`).join('')}<footer>LFO · ARCHIVO DE CANCHA</footer></div></div></div>`;
  }
  function preMatch(start) {
    if (S.pre) return; S.pre = true;
    const ov = H(`<div class="tlb-pre"><div class="tlb-stage"></div><button class="tlb-skip">SALTAR ▶▶</button></div>`); nt("viewport").appendChild(ov);
    const stage = ov.querySelector(".tlb-stage"); let step = 0, timer = null, scene = null, visual = null, ending = false;
    const end = () => { if(ending)return; ending=true; visual?.stop(); clearTimeout(timer); scene && scene._stop && scene._stop(); ov.classList.add("out"); setTimeout(() => { ov.remove(); S.pre = false; start(); }, 450); };
    const show = (i) => {
      if(ending)return; visual?.stop(); visual=null; step = i; clearTimeout(timer); scene && scene._stop && scene._stop(); scene = null;
      try {
        if (i === 0) { stage.innerHTML = `<div class="tlb-intro"><div class="tlb-intro-title"><small>LFO · LIGA DE FÚTBOL ONLINE</small><h1>${esc(teamName(0))}<span>vs</span>${esc(teamName(1))}</h1><p>EN DIRECTO DESDE LA CANCHA</p></div></div>`; visual=TLBGraphics.intro(stage.querySelector('.tlb-intro')); timer = setTimeout(() => show(1), 6000); }
        else if (i === 1 || i === 2) { stage.innerHTML = `<div class="tlb-lineup">${lineupPitch(i-1)}</div>`; visual=TLBGraphics.tactical(stage.querySelector('.tlb-pitch'),i-1); timer = setTimeout(() => show(i + 1), 11500); }
        else if (i === 3) { const sc = studioScene(stage, "pre"); sc.querySelector(".tlb-screen").innerHTML = `<b>${esc(teamName(0))} ${esc(ht.teams[0].formation)}</b><b>${esc(teamName(1))} ${esc(ht.teams[1].formation)}</b>`; scene = speak(sc, studioPre(), () => { timer=setTimeout(end, 1200); }); }
      } catch (e) { console.error("lineup presentation step failed", i, e); timer = setTimeout(() => i >= 3 ? end() : show(i + 1), 400); }
    };
    ov.querySelector(".tlb-skip").onclick = end;
    ov.onclick = (e) => { if (e.target.closest(".tlb-skip")) return; if (step === 3 && scene) scene._skip(); else show(step + 1); };
    show(0);
  }

  // ---------- MEDIO TIEMPO ----------
  function halftimeBreak() {
    if (S.half || !cfg.bcast) return; S.half = true;
    ua._stopChant();
    const ov = H(`<div class="tlb-pre tlb-half"><div class="tlb-stage"></div><button class="tlb-skip">SALTAR ▶▶</button></div>`); nt("viewport").appendChild(ov);
    const stage = ov.querySelector(".tlb-stage");
    let scene = null;
    const close = () => {
      scene && scene._stop && scene._stop(); ov.classList.add("out");
      setTimeout(() => { ov.remove(); S.half = false; ht.wait = 0.6; }, 450);
    };
    try {
      const sc = studioScene(stage, "half");
      sc.querySelector(".tlb-screen").innerHTML = `<b>${esc(teamName(0))} ${ht.score[0]} — ${ht.score[1]} ${esc(teamName(1))}</b>`;
      scene = speak(sc, studioHalf(), () => setTimeout(close, 900));
    } catch (e) { console.error("halftime studio failed", e); close(); }
    ov.querySelector(".tlb-skip").onclick = close;
    ov.onclick = (e) => { if (!e.target.closest(".tlb-skip")) scene && scene._skip && scene._skip(); };
  }

  // ---------- POST-PARTIDO ----------
  function postMatch() {
    if (!cfg.bcast || document.querySelector(".tlb-post")) return;
    const { lines, F } = studioPost(), [a, b] = F.sc, st = F.st, pp = F.pp;
    const bar = (l, x, y) => `<div class="tlb-sr"><b>${x}</b><span>${l}</span><b>${y}</b></div>`;
    const ov = H(`<div class="tlb-post"><div class="tlb-stage"></div><button class="tlb-skip">CERRAR ✕</button></div>`); nt("viewport").appendChild(ov);
    const stage = ov.querySelector(".tlb-stage"), sc = studioScene(stage, "post"), scr = sc.querySelector(".tlb-screen");
    const acc = (t) => (st[t].passes ? Math.round(st[t].completed / st[t].passes * 100) : 0);
    scr.innerHTML = `<div class="tlb-res"><span>${esc(teamName(0))}</span><strong>${a} — ${b}</strong><span>${esc(teamName(1))}</span></div>
      ${bar("Posesión %", pp[0], pp[1])}${bar("xG", st[0].xg.toFixed(2), st[1].xg.toFixed(2))}${bar("Tiros (a puerta)", `${st[0].shots} (${st[0].onTarget})`, `${st[1].shots} (${st[1].onTarget})`)}${bar("Pases / precisión", `${st[0].passes} · ${acc(0)}%`, `${st[1].passes} · ${acc(1)}%`)}${bar("Tarjetas A/R", `${st[0].yellow}/${st[0].red}`, `${st[1].yellow}/${st[1].red}`)}
      <div class="tlb-goals">${F.goals.map((g) => `${Math.floor(g.time / 60)}′ ${esc(ht.players[g.player]?.name || "")}`).join(" · ") || "Sin goles"}</div>`;
    if (F.mvp) { const mv = F.mvp.p; stage.querySelector(".tlb-studio").insertAdjacentHTML("beforeend", `<div class="tlb-mvp"><small>JUGADOR DESTACADO</small><div class="tlb-cardslot"></div><b>${esc(mv.name)}</b></div>`); fillCard(stage.querySelector(".tlb-mvp"), mv); }
    const scene = speak(sc, lines, null);
    const close = () => { scene._stop(); ov.classList.add("out"); setTimeout(() => ov.remove(), 400); };
    ov.querySelector(".tlb-skip").onclick = close;
    ov.onclick = (e) => { if (!e.target.closest(".tlb-skip")) scene._skip(); };
  }

  // ---------- EVENTOS DEL MOTOR → PRESENTACIÓN ----------
  function onEvent(i) {
    if (!cfg.bcast) return;
    const P = i.player != null ? ht.players[i.player] : null, who = P ? `#${P.number} ${P.name}` : "";
    if (i.type === "card") stinger(/ROJA/.test(i.title) ? "red" : "yellow", `${who} · ${i.team != null ? teamName(i.team) : ""}`);
    else if (i.type === "sub") {
      stinger("sub", i.detail);
      if(P){showGoalLower({scorerId:P.id,scorerTeam:P.team,scorerName:P.name,goalTime:ht.time},"CAMBIO");setTimeout(()=>{if(!S.pkg)hideLower();},6500);}
    }
    else if (i.type === "penalty") stinger("penalty", i.team != null ? teamName(i.team) : "");
    else if (i.type === "offside") stinger("var", i.detail);
    else if (i.type === "halftime") {
      stinger("half", `${teamName(0)} ${ht.score[0]} — ${ht.score[1]} ${teamName(1)}`);
      ua._stopChant();
      ht.wait = 999; setTimeout(halftimeBreak, 1400);
    }
    else if (i.type === "fulltime") { stinger("final", `${teamName(0)} ${ht.score[0]} — ${ht.score[1]} ${teamName(1)}`); setTimeout(postMatch, 4600); }
    else if (i.type === "restart" && i.title === "Tiro de esquina") { const rd = ht.restartData; stinger("corner", `${teamName(i.team ?? 0)}${rd && rd.takerId != null ? " · " + ht.players[rd.takerId].name : ""}`); }
    else if (i.type === "restart" && /libre/i.test(i.title || "")) stinger("freekick", i.team != null ? teamName(i.team) : "");
  }

  // ---------- AJUSTES (panel flotante) ----------
  const setBtn = H('<button class="tlb-gear" title="Transmisión">📺</button>'), panel = H('<div class="tlb-panel" hidden></div>');
  nt("viewport").append(setBtn, panel);
  function panelRender() {
    const row = (k, label, opts) => `<label>${label}<select data-k="${k}">${opts.map(([v, t]) => `<option value="${v}" ${String(cfg[k]) === String(v) ? "selected" : ""}>${t}</option>`).join("")}</select></label>`;
    const onoff = [[true, "ON"], [false, "OFF"]];
    panel.innerHTML = `<b>TRANSMISIÓN</b>${row("emoji", "Mostrar emojis", onoff)}${row("bcast", "Animaciones de broadcast", onoff)}${row("trans", "Transiciones", [["FULL", "FULL"], ["REDUCED", "REDUCED"], ["OFF", "OFF"]])}${row("autoReplay", "Replays automáticos", onoff)}${row("celeb", "Celebraciones", [["FULL", "FULL"], ["SHORT", "SHORT"]])}`;
    panel.querySelectorAll("select").forEach((s) => (s.onchange = () => { const v = s.value; cfg[s.dataset.k] = v === "true" ? true : v === "false" ? false : v; save(); ht.tlEmoOn = cfg.emoji; }));
  }
  setBtn.onclick = () => { panel.hidden = !panel.hidden; !panel.hidden && panelRender(); };

  // ---------- FRAME (llamado cada RAF) + DEBUG ----------
  function frame(e) {
    try { rs ^= ht.seed >>> 0; } catch (x) {}
    ht.tlEmoOn = cfg.emoji && cfg.bcast; ht.tlbEnabled = true;
    pkgTick(); !e && camWatch(); emojiFrame(e);
    TLBGraphics.frame(performance.now());
  }
  function debugLines(p) {
    const tl = p.tl, G = ht.tlGoal, out = [];
    out.push(`TLB ACTION_TYPE ${p.actionType || "-"} · ANIM ${tl ? tl.anim : "-"} · PROGRESS ${tl ? Math.max(0, Math.min(1, (ht.elapsed - tl.t0) / (tl.dur || 1))).toFixed(2) : "-"} · CONTACT ${tl && tl.contact ? tl.contact.toFixed(2) + "s" : "-"}`);
    out.push(`TLB CAMERA ${S.camUntil > ht.elapsed ? S.camKind : "auto"} · BROADCAST ${S.pkg ? "GOAL_PKG/" + S.pkg.state : "LIVE"} · SYNC ${ht.tlHold ? "HOLD" : "free"}`);
    if (G) out.push(`GOAL_PACKAGE SCORER ${G.scorerName} · ASSIST ${G.assistName || "-"} · CELEBRATION ${G.phase === "run" ? "GOAL_RUN" : "CEL_" + G.variant} · REPLAY ${S.pkg ? S.pkg.state : "-"}`);
    if (tl && tl.kind === "slide") out.push(`SLIDE_TYPE ${tl.anim} · REASON ${tl.why || "-"} · SUCCESS ${tl.e ? tl.e.success.toFixed(2) : "-"} · RESULT ${tl.result || "…"}`);
    else if (p.tlSlideInfo) out.push(`SLIDE_ELIGIBILITY p=${p.tlSlideInfo.p.toFixed(2)} · foul=${p.tlSlideInfo.foul.toFixed(2)} · ${p.tlSlideInfo.reasons.join(",") || "-"}`);
    return out;
  }
  return { refAttach, cfg, stinger, goalPkg, camOverride, pose, frame, onEvent, preMatch, postMatch, debugLines, studioPre, studioPost, wantsPre: () => cfg.bcast && cfg.trans !== "OFF", state: S };
})());
function TLB_START() { if (!ht.started && !ht.ended && TLB.wantsPre()) TLB.preMatch(Al); else Al(); }
