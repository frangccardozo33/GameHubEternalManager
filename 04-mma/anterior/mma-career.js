/* CAGESIDE — MODO CARRERA
   Capa de gestión sobre el simulador de combate 3D (mma3d.html). Mismo esqueleto que los demás módulos del hub:
   temporada con calendario de eventos, plantel con contratos, mercado (agentes libres, cantera y ofertas), entrenamiento,
   lesiones, finanzas, clasificación, noticias e historial. El dinero es la plata compartida del hub (window.Touchline).
   Depende de las variables globales del simulador: config, reset, finish, finishInfo, fighters, STYLES, roundLength. */
(function () {
  'use strict';
  if (typeof config === 'undefined' || typeof reset !== 'function') return;

  // ------------------------------------------------------------------ constantes
  const KEY = 'cageside_career_v1';
  const STATS = ['striking', 'wrestling', 'bjj', 'defense', 'cardio', 'chin', 'power', 'aggression'];
  const STAT_LBL = { striking: 'Striking', wrestling: 'Wrestling', bjj: 'BJJ', defense: 'Defensa', cardio: 'Cardio', chin: 'Barbilla', power: 'Poder', aggression: 'Agresividad' };
  const STYLE_W = {
    'Striker de Distancia': { striking: 3, defense: 1.4, cardio: 1, chin: 1, power: 1.4, aggression: .5, wrestling: .5, bjj: .3 },
    'Wrestler de Presión': { striking: 1, defense: 1.2, cardio: 1.4, chin: 1, power: 1.2, aggression: 1, wrestling: 3, bjj: .6 },
    'Especialista en Sumisión': { striking: .6, defense: 1.6, cardio: 1, chin: 1, power: .6, aggression: .5, wrestling: 1.2, bjj: 3 },
    'Brawler': { striking: 1.8, defense: .6, cardio: 1, chin: 1.8, power: 2, aggression: 1.6, wrestling: .4, bjj: .3 },
  };
  const EVENTS = 7, MAX_ROSTER = 6, MIN_ROSTER = 3; // 7 eventos regulares + la Noche de Campeones (títulos)
  const DIVS = [['Ligero', '70 kg'], ['Wélter', '77 kg'], ['Medio', '84 kg']], DIV_NAMES = DIVS.map(d => d[0]);
  const FIRST = ['Alex', 'Iván', 'Marco', 'Diego', 'Kenji', 'Lucas', 'Omar', 'Rafael', 'Tomás', 'Viktor', 'Nico', 'Andrés', 'Bruno', 'Cristian', 'Dario', 'Emil', 'Fabio', 'Gonzalo', 'Hugo', 'Ismael', 'Joel', 'Leandro', 'Mauro', 'Nelson', 'Oleg', 'Pablo', 'Quique', 'Ramiro', 'Sergio', 'Tiago'];
  const LAST = ['Silva', 'Volkov', 'Ferrer', 'Ortega', 'Tanaka', 'Moreau', 'Haddad', 'Costa', 'Petrov', 'Rojas', 'Novak', 'Duarte', 'Kaya', 'Lopes', 'Marín', 'Nakamura', 'Ibarra', 'Sokolov', 'Vega', 'Ramos', 'Cruz', 'Blanco', 'Ito', 'Bauer', 'Salazar', 'Quintero', 'Romero', 'Zamora', 'Acosta', 'Barros'];
  const NICKS = ['Viper', 'Bear', 'Ghost', 'Hammer', 'Storm', 'Wolf', 'Cobra', 'Titan', 'Blade', 'Falcon', 'Rex', 'Bull', 'Shark', 'Fox', 'Raven', 'Ace'];
  const COLORS = [0xe85c51, 0x548de0, 0xd9b752, 0x6fcf97, 0xc77dff, 0xf2994a, 0x56ccf2, 0xeb5757];
  const GYM_NAMES = [['Gimnasio LLO', 'LLO'], ['Dragon Team', 'DRG'], ['Hierro Norte', 'HRN'], ['Lobos del Sur', 'LBS'], ['Cóndor MMA', 'CDR'], ['Fénix Fight', 'FNX'], ['Tigre Blanco', 'TGB'], ['Puño de Acero', 'PDA']];
  const FAC_COST = lvl => 200000 * lvl;

  // ------------------------------------------------------------------ utilidades
  const $ = id => document.getElementById(id);
  const clampN = (n, a, b) => Math.max(a, Math.min(b, n));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ri = (a, b) => Math.floor(rnd(a, b + 1));
  const pickOne = arr => arr[Math.floor(Math.random() * arr.length)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = n => Math.round(n).toLocaleString('es');
  const COIN = '<svg class="mc-ico" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#cfd8dc" stroke="#78909c"/><circle cx="8" cy="8" r="4.2" fill="none" stroke="#90a4ae"/></svg>';
  const money = n => COIN + fmt(n);
  // Fechas de calendario: el primer evento de la temporada 1 es el sábado 17 de enero de 2026; un evento cada 3 semanas.
  const evDate = (season, ev) => new Date(Date.UTC(2025 + season, 0, 17 + Math.max(0, ev) * 21)).toLocaleDateString('es-ES', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  let S = null;              // estado de la carrera
  let view = 'home';         // pantalla actual
  let ui = {};               // estado de la interfaz (filtros, selección…)
  let pendingSummary = null; // resumen del último evento a mostrar
  const hasTL = () => typeof window.Touchline !== 'undefined';

  // ------------------------------------------------------------------ billetera compartida
  const W = { silver: null };
  function cash() { return hasTL() && W.silver != null ? W.silver : S.cash; }
  function earn(n) { if (n <= 0) return; if (hasTL()) { W.silver = (W.silver || 0) + n; window.Touchline.addSilver(n); } else S.cash += n; }
  function spend(n) {
    if (n <= 0) return true; if (cash() < n) return false;
    if (hasTL()) { W.silver -= n; window.Touchline.removeSilver(n); } else S.cash -= n; return true;
  }
  if (hasTL()) {
    window.Touchline.getBalances().then(r => { if (r.ok) { W.silver = r.balances.silver; if (open) render(); } });
    window.Touchline.onBalances(b => { W.silver = b.silver; if (open) render(); });
  }

  // ------------------------------------------------------------------ jugadores
  function ovrOf(f, st = f.stats) {
    const w = STYLE_W[f.style]; let s = 0, t = 0;
    for (const k of STATS) { s += st[k] * w[k]; t += w[k]; }
    return Math.round(s / t);
  }
  const salaryOf = f => Math.round((2000 + Math.pow(Math.max(0, f.ovr - 45), 2) * 22) / 500) * 500;
  const valueOf = f => Math.round(salaryOf(f) * (f.age <= 24 ? 12 : f.age <= 30 ? 10 : 6) * (1 + Math.max(0, f.pot - f.ovr) / 40) / 1000) * 1000;
  function refresh(f) { f.ovr = ovrOf(f); f.pot = Math.max(f.pot, f.ovr); }
  function makeFighter(level, age, opts = {}) {
    const style = opts.style || pickOne(Object.keys(STYLE_W)), w = STYLE_W[style], st = {};
    for (const k of STATS) st[k] = clampN(Math.round(level + (w[k] - 1) * 4.5 + rnd(-6, 6)), 30, 97);
    const first = pickOne(FIRST), last = pickOne(LAST);
    const f = { id: 'f' + (S.nid++), name: first + ' ' + last, short: last.toUpperCase(), nick: pickOne(NICKS), color: pickOne(COLORS), age, style, stats: st, gym: null, div: opts.div || pickOne(DIV_NAMES), titles: 0,
      cond: 100, inj: 0, form: 0, tp: 0, focus: null, contract: null, rec: { w: 0, l: 0, d: 0, ko: 0, sub: 0 }, pts: 0, hist: [] };
    f.ovr = ovrOf(f); f.pot = Math.min(97, f.ovr + (age <= 22 ? ri(6, 18) : age <= 25 ? ri(2, 9) : age <= 29 ? ri(0, 3) : 0));
    return f;
  }
  const F = id => S.fighters[id];
  const gymOf = id => S.gyms[id];
  const roster = g => g.fighters.map(F);
  const avail = f => !f.inj && f.cond >= 40;
  function recommendFocus(f) {
    const w = STYLE_W[f.style]; let best = STATS[0], bv = -1;
    for (const k of STATS) { const v = w[k] * (95 - f.stats[k]); if (v > bv) { bv = v; best = k; } }
    return best;
  }

  // ------------------------------------------------------------------ noticias
  function news(title, text, type = 'info') { S.news.unshift({ season: S.season, ev: S.ev + 1, title, text, type }); if (S.news.length > 100) S.news.pop(); }

  // ------------------------------------------------------------------ nueva carrera
  function newCareer() {
    S = { v: 2, champs: {}, season: 1, ev: 0, nid: 1, cash: 300000, debt: 0, gyms: [], fighters: {}, fa: [], schedule: [], results: [], picks: null, offers: [], news: [], history: [],
      fac: 1, intensity: 'normal', ledger: { prizes: 0, sponsors: 0, tv: 0, salaries: 0, ops: 0, fees: 0 }, ledgerHist: [] };
    GYM_NAMES.forEach(([name, short], i) => S.gyms.push({ id: i, name, short, color: COLORS[i], pts: 0, w: 0, l: 0, d: 0, fighters: [] }));
    S.gyms.forEach((g, i) => {
      for (let k = 0; k < 3; k++) {
        const f = makeFighter(rnd(58, 72) + (i === 0 ? -2 : 0), ri(21, 32), { div: DIV_NAMES[k] });
        f.gym = i; f.contract = { salary: salaryOf(f), events: ri(7, 14) }; f.rec = { w: ri(2, 12), l: ri(0, 6), d: 0, ko: ri(0, 5), sub: ri(0, 4) }; g.fighters.push(f.id); S.fighters[f.id] = f;
      }
    });
    for (let k = 0; k < 10; k++) { const f = makeFighter(rnd(48, 66), ri(19, 34)); S.fighters[f.id] = f; S.fa.push(f.id); }
    DIV_NAMES.forEach(dv => { const c = Object.values(S.fighters).filter(f => f.gym !== null && f.div === dv).sort((a, b) => b.ovr - a.ovr)[0]; S.champs[dv] = c.id; c.titles = 1; });
    buildSchedule();
    news('Comienza la temporada 1', 'Ocho gimnasios, tres divisiones, siete eventos y la Noche de Campeones con los títulos en juego. Ficha, entrena y elige a tu peleador para cada cartelera.');
    save();
  }
  function buildSchedule() {
    const n = S.gyms.length, ids = S.gyms.map(g => g.id), rounds = [];
    let arr = [...ids]; if (S.season % 2 === 0) arr.reverse();
    for (let r = 0; r < n - 1; r++) {
      const pairs = []; for (let i = 0; i < n / 2; i++) pairs.push(r % 2 ? [arr[n - 1 - i], arr[i]] : [arr[i], arr[n - 1 - i]]);
      rounds.push(pairs); arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)];
    }
    S.schedule = rounds; S.results = []; S.picks = null; S.ev = 0;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function load() { try { const r = localStorage.getItem(KEY); if (r) { const d = JSON.parse(r); if (d && d.v === 2) { S = d; return true; } } } catch (e) {} return false; }

  // ------------------------------------------------------------------ simulación rápida de un combate
  function effStats(f, div) { const m = (.85 + .15 * f.cond / 100 + f.form * .01) * (div && f.div !== div ? .92 : 1), o = {}; for (const k of STATS) o[k] = clampN(f.stats[k] * m, 20, 99); return o; }
  function simBout(a, b, div) {
    const sa = effStats(a, div), sb = effStats(b, div), ea = ovrOf(a, sa), eb = ovrOf(b, sb);
    const styleEdge = (x, y) => { const sx = x.style, sy = y.style; return (sx === 'Striker de Distancia' && sy === 'Wrestler de Presión') || (sx === 'Wrestler de Presión' && sy === 'Especialista en Sumisión') || (sx === 'Especialista en Sumisión' && sy === 'Brawler') || (sx === 'Brawler' && sy === 'Striker de Distancia') ? 2 : 0; };
    const d = ea - eb + styleEdge(a, b) - styleEdge(b, a), p = 1 / (1 + Math.exp(-d / 7));
    let win = Math.random() < p ? 'a' : 'b';
    const w = win === 'a' ? sa : sb, l = win === 'a' ? sb : sa;
    const ko = clampN(.10 + (w.power + w.striking - l.chin * 1.3 - l.defense * .3) / 300, .04, .5);
    const sub = clampN(.08 + (w.bjj - l.defense * .8 - l.bjj * .2 + w.wrestling * .3) / 260, .02, .32);
    const r = Math.random(); let method, round, finish = true;
    if (r < ko) { method = Math.random() < .7 ? 'KO · Golpe a la cabeza' : 'TKO · Ground & Pound'; round = ri(1, 3); }
    else if (r < ko + sub) { method = 'Sumisión'; round = ri(1, 3); }
    else { finish = false; round = 3; method = 'Decisión ' + (Math.random() < .7 ? 'unánime' : 'dividida'); if (Math.abs(d) < 2 && Math.random() < .06) { win = null; method = 'Empate'; } }
    const dmg = who => clampN(Math.round((finish && win !== who ? 60 : 20) + rnd(0, 35) - (who === 'a' ? sa : sb).chin / 4), 8, 100);
    return { winner: win, method, round, finish, dmgA: dmg('a'), dmgB: dmg('b') };
  }
  function applyBout(bt) { // bt: {a,b (ids), winner, method, round, finish, dmgA, dmgB, src}
    const A = F(bt.a), B = F(bt.b), gA = gymOf(A.gym), gB = gymOf(B.gym);
    for (const [f, other, who, g] of [[A, B, 'a', gA], [B, A, 'b', gB]]) {
      const won = bt.winner === who;
      if (bt.winner === null) { f.rec.d++; g.d++; if (!bt.title) g.pts += 1; f.pts += 1; }
      else if (won) { f.rec.w++; g.w++; if (!bt.title) g.pts += 3; f.pts += 3 + (bt.finish ? 1 : 0) + (bt.title ? 2 : 0); if (bt.finish) { if (/Sumisi/.test(bt.method)) f.rec.sub++; else f.rec.ko++; } }
      else { f.rec.l++; g.l++; }
      const dmg = who === 'a' ? bt.dmgA : bt.dmgB;
      f.cond = clampN(f.cond - (26 + dmg * .32), 10, 100);
      f.form = clampN(f.form + (bt.winner === null ? 0 : won ? 2 : -2), -6, 6);
      const risk = (.05 + dmg / 260) * (won ? .8 : 1.15) * (bt.finish && !won ? 1.5 : 1);
      if (Math.random() < risk) {
        const r = Math.random(); f.inj = r < .6 ? ri(1, 2) : r < .92 ? ri(3, 4) : ri(5, 7);
        if (f.gym === 0) news('Lesión', f.name + ' se lesionó en el combate: baja ' + f.inj + ' evento' + (f.inj > 1 ? 's' : '') + '.', 'injury');
      }
      f.hist.push({ season: S.season, ev: S.ev + 1, opp: other.name, res: bt.winner === null ? 'E' : won ? 'V' : 'D', method: bt.method });
      if (f.hist.length > 30) f.hist.shift();
    }
  }

  // ------------------------------------------------------------------ evento
  function bestPick(g, div) {
    return roster(g).sort((x, y) => (avail(y) ? 1 : 0) - (avail(x) ? 1 : 0) || (y.div === div ? 1 : 0) - (x.div === div ? 1 : 0) || (y.ovr * (.6 + y.cond / 250)) - (x.ovr * (.6 + x.cond / 250)))[0];
  }
  const beltOf = f => S.champs[f.div] === f.id ? '<span class="mc-pill warn">CAMPEÓN</span>' : '';
  function ensureChamps() {
    DIV_NAMES.forEach(dv => {
      const c = S.fighters[S.champs[dv]]; if (c && c.gym !== null) return;
      const n = Object.values(S.fighters).filter(f => f.gym !== null && f.div === dv).sort((a, b) => b.ovr - a.ovr)[0];
      if (n) { S.champs[dv] = n.id; n.titles++; news('Cinturón vacante', n.name + ' recibe el cinturón de ' + dv + ' por vacante.', 'champion'); }
    });
  }
  const isFinal = () => S.ev >= EVENTS;
  const divOf = (ev, idx) => DIV_NAMES[(ev + idx) % DIV_NAMES.length];
  function titleBouts() {
    ensureChamps();
    return DIV_NAMES.map(dv => {
      const ch = Object.values(S.fighters).filter(f => f.gym !== null && f.div === dv && f.id !== S.champs[dv]).sort((a, b) => b.pts - a.pts || b.ovr - a.ovr)[0];
      return { div: dv, champ: S.champs[dv], chall: ch ? ch.id : null };
    }).filter(b => b.chall && F(b.champ));
  }
  function currentPairs() { return S.schedule[S.ev] || []; }
  function userPair() { const pairs = currentPairs(), i = pairs.findIndex(([a, b]) => a === 0 || b === 0); return i < 0 ? null : { oppGym: pairs[i][0] === 0 ? pairs[i][1] : pairs[i][0], idx: i }; }
  function preparePicks() {
    if (S.picks && S.picks.ev === S.ev && S.picks.season === S.season) return S.picks;
    if (isFinal()) {
      const mineB = titleBouts().find(b => F(b.champ).gym === 0 || F(b.chall).gym === 0);
      const mineId = mineB ? (F(mineB.champ).gym === 0 ? mineB.champ : mineB.chall) : null, oppId = mineB ? (mineId === mineB.champ ? mineB.chall : mineB.champ) : null;
      S.picks = { season: S.season, ev: S.ev, final: true, div: mineB ? mineB.div : null, mine: mineId, opp: oppId, oppGym: oppId ? F(oppId).gym : null };
      return S.picks;
    }
    const up = userPair(), div = divOf(S.ev, up.idx), opp = bestPick(gymOf(up.oppGym), div), mine = bestPick(gymOf(0), div);
    S.picks = { season: S.season, ev: S.ev, div, oppGym: up.oppGym, mine: mine ? mine.id : null, opp: opp ? opp.id : null };
    return S.picks;
  }
  const SIM_PAY = { win: 90000, finBonus: 15000, loss: 30000, draw: 45000 };
  // Cierra el evento: resuelve los combates de la IA, aplica la economía y avanza el calendario.
  function finishEvent(userBout) {
    const bouts = [], pairs = currentPairs();
    if (isFinal()) {
      for (const tb of titleBouts()) {
        const involvesUser = F(tb.champ).gym === 0 || F(tb.chall).gym === 0;
        let bt;
        if (involvesUser && userBout && userBout.div === tb.div) bt = userBout;
        else { const A = F(tb.champ), B = F(tb.chall), r = simBout(A, B, tb.div); bt = { a: A.id, b: B.id, ...r, div: tb.div, src: 'sim' }; }
        bt.title = true; bt.div = tb.div; applyBout(bt); bouts.push(bt);
        const winId = bt.winner === 'a' ? bt.a : bt.winner === 'b' ? bt.b : null;
        if (winId && winId !== S.champs[tb.div]) { const nw = F(winId), old = F(S.champs[tb.div]); S.champs[tb.div] = winId; nw.titles++; news('Nuevo campeón de ' + tb.div, nw.name + ' derrota a ' + (old ? old.name : 'el campeón') + ' y se queda con el cinturón.', 'champion'); }
        else if (winId) news('Defensa exitosa', F(winId).name + ' retiene el cinturón de ' + tb.div + '.', 'champion');
      }
    } else pairs.forEach(([gA, gB], idx) => {
      const div = divOf(S.ev, idx);
      if (gA === 0 || gB === 0) { if (userBout) { applyBout(userBout); bouts.push(userBout); } return; }
      const a = bestPick(gymOf(gA), div), b = bestPick(gymOf(gB), div); if (!a || !b) return;
      const r = simBout(a, b, div), bt = { a: a.id, b: b.id, ...r, div, src: 'sim' }; applyBout(bt); bouts.push(bt);
    });
    // premios del combate del usuario
    let prize = 0;
    if (userBout) {
      const mineIsA = F(userBout.a).gym === 0, won = userBout.winner === (mineIsA ? 'a' : 'b');
      prize = userBout.winner === null ? SIM_PAY.draw : won ? SIM_PAY.win + (userBout.finish ? SIM_PAY.finBonus : 0) : SIM_PAY.loss;
      if (userBout.title && won) prize += 150000;
      earn(prize); S.ledger.prizes += prize;
    }
    // ingresos y gastos fijos del evento
    const sponsors = 20000 + 4000 * S.fac + Math.max(0, S.gyms[0].w) * 1500, tv = 25000, ops = 8000 + 4000 * S.fac;
    const salaries = roster(gymOf(0)).reduce((a, f) => a + f.contract.salary, 0);
    earn(sponsors + tv); S.ledger.sponsors += sponsors; S.ledger.tv += tv;
    let due = salaries + ops + S.debt, paid = Math.min(due, cash()); if (paid > 0) spend(paid);
    S.debt = Math.max(0, due - paid); S.ledger.salaries += salaries; S.ledger.ops += ops;
    if (S.debt > 0) news('Deudas', 'No alcanzó la caja para pagar salarios y gastos. Deuda pendiente: ' + fmt(S.debt) + '.', 'bad');
    // entrenamiento, recuperación, lesiones y contratos de todos los peleadores
    for (const f of Object.values(S.fighters)) {
      if (f.inj > 0) f.inj--;
      f.cond = clampN(f.cond + 22 + (f.gym === 0 ? S.fac * 2 : 2) - (f.gym === 0 && S.intensity === 'high' ? 6 : 0) + (f.gym === 0 && S.intensity === 'low' ? 5 : 0), 0, 100);
      f.form *= .6;
      if (f.gym === null) continue;
      const rate = (f.gym === 0 ? { low: .6, normal: 1, high: 1.5 }[S.intensity] * (1 + .1 * (S.fac - 1)) : 1) * (f.age <= 23 ? 1.3 : f.age <= 27 ? 1.1 : f.age <= 31 ? .8 : .4);
      const focus = f.focus || recommendFocus(f); f.tp += rate * (f.ovr >= f.pot ? .5 : 1);
      while (f.tp >= 3) { f.tp -= 3; if (f.stats[focus] < 95) { f.stats[focus]++; } refresh(f); }
      f.contract.events--;
      if (f.contract.events <= 0) {
        if (f.gym === 0) { news('Contrato vencido', f.name + ' abandona el gimnasio: su contrato terminó.', 'bad'); leaveGym(f); }
        else if (Math.random() < .85) { f.contract = { salary: salaryOf(f), events: ri(7, 14) }; } else leaveGym(f);
      }
    }
    cpuMoves(); genOffers();
    const summary = { season: S.season, ev: S.ev + 1, bouts, prize, sponsors, tv, salaries, ops };
    S.lastEvent = summary; S.results.push(bouts.map(b => ({ ...b })));
    S.ev++; S.picks = null;
    if (S.ev > EVENTS) endSeason(summary);
    save(); return summary;
  }
  function leaveGym(f) { const g = gymOf(f.gym); g.fighters = g.fighters.filter(id => id !== f.id); f.gym = null; f.contract = null; if (!S.fa.includes(f.id)) S.fa.push(f.id); }
  function joinGym(f, gymId, contract) { S.fa = S.fa.filter(id => id !== f.id); f.gym = gymId; f.contract = contract; gymOf(gymId).fighters.push(f.id); }
  function cpuMoves() {
    for (const g of S.gyms) {
      if (g.id === 0) continue;
      while (g.fighters.length < MIN_ROSTER) { const c = S.fa.map(F).sort((x, y) => y.ovr - x.ovr)[0]; if (!c) break; joinGym(c, g.id, { salary: salaryOf(c), events: ri(7, 14) }); }
    }
    if (Math.random() < .25) { // intercambio de peleadores entre gimnasios de la IA
      const cpu = S.gyms.filter(g => g.id !== 0), a = pickOne(cpu), b = pickOne(cpu);
      if (a !== b) {
        const pa = pickOne(roster(a)), pb = roster(b).map(f => ({ f, d: Math.abs(f.ovr - pa.ovr) })).sort((x, y) => x.d - y.d)[0].f;
        if (Math.abs(pa.ovr - pb.ovr) <= 3) {
          a.fighters = a.fighters.filter(i => i !== pa.id).concat(pb.id); b.fighters = b.fighters.filter(i => i !== pb.id).concat(pa.id); pa.gym = b.id; pb.gym = a.id;
          news('Traspaso en el circuito', a.short + ' y ' + b.short + ' intercambian a ' + pa.name + ' (' + pa.ovr + ') por ' + pb.name + ' (' + pb.ovr + ').', 'trade');
        }
      }
    }
  }
  function genOffers() {
    S.offers = S.offers.filter(o => o.exp > S.ev && F(o.fid) && F(o.fid).gym === 0);
    if (Math.random() < .35) {
      const c = roster(gymOf(0)).filter(f => f.ovr >= 58 && !S.offers.some(o => o.fid === f.id));
      if (c.length && roster(gymOf(0)).length > MIN_ROSTER) {
        const f = pickOne(c), g = pickOne(S.gyms.filter(x => x.id !== 0 && x.fighters.length < MAX_ROSTER)); if (!g) return;
        S.offers.push({ fid: f.id, gym: g.id, amount: Math.round(valueOf(f) * rnd(.9, 1.3) / 1000) * 1000, exp: S.ev + 2 });
        news('Oferta recibida', g.name + ' ofrece ' + fmt(S.offers[S.offers.length - 1].amount) + ' por ' + f.name + '.', 'trade');
      }
    }
  }
  // ------------------------------------------------------------------ fin de temporada
  function endSeason(lastEv) {
    const gyms = [...S.gyms].sort((a, b) => b.pts - a.pts || b.w - a.w), champ = gyms[0];
    const fs = Object.values(S.fighters).filter(f => f.gym !== null).sort((a, b) => b.pts - a.pts), best = fs[0];
    const mePos = gyms.findIndex(g => g.id === 0) + 1;
    let bonus = 0; if (champ.id === 0) { bonus = 300000; earn(bonus); S.ledger.prizes += bonus; } else if (mePos <= 3) { bonus = 80000; earn(bonus); S.ledger.prizes += bonus; }
    S.history.unshift({ season: S.season, belts: DIV_NAMES.map(dv => dv + ': ' + (F(S.champs[dv]) ? F(S.champs[dv]).name : '—')), champion: champ.name, champPts: champ.pts, best: best ? best.name + ' (' + best.pts + ' pts)' : '—', me: mePos, mePts: S.gyms[0].pts, bonus, net: ledgerNet() });
    S.ledgerHist.unshift({ season: S.season, ...S.ledger });
    news('Fin de temporada ' + S.season, 'Campeón: ' + champ.name + '. Mejor peleador: ' + (best ? best.name : '—') + '. ' + (bonus ? 'Premio a tu gimnasio: ' + fmt(bonus) + '.' : ''), 'champion');
    lastEv.seasonEnd = { champ: champ.name, me: mePos, bonus };
    // envejecimiento, retiros y cantera
    for (const f of Object.values(S.fighters)) {
      f.age++;
      const trend = f.age <= 24 ? 1 : f.age >= 31 ? -1 : 0;
      for (const k of STATS) { const dv = trend * (Math.random() < .5 ? 1 : 0) * (f.age >= 33 && (k === 'cardio' || k === 'chin') ? 2 : 1); f.stats[k] = clampN(f.stats[k] + dv + (trend === 0 && Math.random() < .2 ? 1 : 0), 30, 97); }
      f.pts = 0; f.inj = Math.max(0, f.inj - 2); f.cond = 100; f.form = 0; refresh(f);
      if (f.age >= 38 || (f.age >= 35 && Math.random() < (f.age - 34) * .16)) {
        if (f.gym !== null) { if (f.gym === 0) news('Retiro', f.name + ' (' + f.age + ') cuelga los guantes.', 'retire'); leaveGym(f); }
        S.fa = S.fa.filter(id => id !== f.id); delete S.fighters[f.id];
      }
    }
    for (let k = 0; k < 6; k++) { const f = makeFighter(rnd(45, 60), ri(18, 21)); S.fighters[f.id] = f; S.fa.push(f.id); }
    if (S.fa.length > 26) { S.fa.map(F).sort((a, b) => a.ovr + a.pot / 2 - b.ovr - b.pot / 2).slice(0, S.fa.length - 26).forEach(f => { S.fa = S.fa.filter(id => id !== f.id); delete S.fighters[f.id]; }); }
    news('Cantera', 'Llegaron 6 jóvenes promesas al mercado de agentes libres.', 'info');
    S.gyms.forEach(g => { g.pts = 0; g.w = 0; g.l = 0; g.d = 0; }); cpuMoves(); ensureChamps();
    S.ledger = { prizes: 0, sponsors: 0, tv: 0, salaries: 0, ops: 0, fees: 0 };
    S.season++; buildSchedule();
    news('Comienza la temporada ' + S.season, 'Nuevo calendario de siete eventos.', 'info');
  }
  const ledgerNet = () => S.ledger.prizes + S.ledger.sponsors + S.ledger.tv - S.ledger.salaries - S.ledger.ops - S.ledger.fees;

  // ------------------------------------------------------------------ combate 3D
  function launch3D() {
    const p = preparePicks(), me = F(p.mine), opp = F(p.opp); if (!me || !opp) return;
    if (!avail(me) && !confirm(me.name + ' no está en condiciones (lesión o poca condición). ¿Pelear igual?')) return;
    const mk = (f, i) => ({ name: f.name, short: f.short, nick: f.nick, color: i ? 0x548de0 : 0xe85c51, style: f.style, stats: effStats(f, p.div) });
    const c0 = mk(me, 0), c1 = mk(opp, 1);
    for (const c of [c0, c1]) for (const k of STATS) c.stats[k] = Math.round(c.stats[k]);
    config[0] = c0; config[1] = c1; window.__mmaCareerFight = { me: me.id, opp: opp.id, div: p.div, title: !!p.final };
    document.body.classList.add('mc-fight'); hideOverlay();
    reset();
    const tag = document.querySelector('.page-heading .tag'), dvi = DIVS.find(d => d[0] === p.div); if (tag && dvi) tag.textContent = (p.final ? 'TÍTULO · ' : '') + 'PESO ' + dvi[0].toUpperCase() + ' · ' + dvi[1].toUpperCase();
    const nm = document.querySelectorAll('.score-name'), mt = document.querySelectorAll('.score-meta');
    if (nm[0]) nm[0].textContent = me.name.toUpperCase() + ' “' + me.nick.toUpperCase() + '”';
    if (nm[1]) nm[1].textContent = opp.name.toUpperCase() + ' “' + opp.nick.toUpperCase() + '”';
    if (mt[0]) mt[0].innerHTML = me.rec.w + '–' + me.rec.l + '–' + me.rec.d + ' &nbsp; / &nbsp; ' + esc(gymOf(0).name.toUpperCase());
    if (mt[1]) mt[1].innerHTML = opp.rec.w + '–' + opp.rec.l + '–' + opp.rec.d + ' &nbsp; / &nbsp; ' + esc(gymOf(opp.gym).name.toUpperCase());
    const l0 = document.querySelector('#label0 .label-name'), l1 = document.querySelector('#label1 .label-name'); if (l0) l0.textContent = me.short; if (l1) l1.textContent = opp.short;
    showBanner('Pulsa START COMBAT para comenzar. Resultado y premios se registran solos.');
    window.scrollTo(0, 0);
  }
  function onFightFinished() {
    const cf = window.__mmaCareerFight; if (!cf || !finishInfo) return; window.__mmaCareerFight = null;
    const fi = finishInfo, A = fighters[0], B = fighters[1], head = f => 100 - f.head, body = f => 100 - f.body;
    const bt = { a: cf.me, b: cf.opp, winner: fi.winner === null ? null : fi.winner === 0 ? 'a' : 'b', method: fi.method, round: fi.round, finish: !fi.decision && fi.winner !== null,
      dmgA: clampN(Math.round(head(A) * .7 + body(A) * .3), 8, 100), dmgB: clampN(Math.round(head(B) * .7 + body(B) * .3), 8, 100), div: cf.div, title: cf.title, src: '3D' };
    pendingSummary = finishEvent(bt); showBanner(null, true);
  }
  // el motor llama a finish(): lo encadenamos para registrar el resultado de un combate de carrera
  const prevFinish = finish;
  finish = function () { const r = prevFinish.apply(this, arguments); if (window.__mmaCareerFight) setTimeout(onFightFinished, 0); return r; };

  function simulateMine() {
    const p = preparePicks(), me = F(p.mine), opp = F(p.opp); if (!me || !opp) return;
    const r = simBout(me, opp, p.div); pendingSummary = finishEvent({ a: me.id, b: opp.id, ...r, div: p.div, src: 'sim' }); ui.summary = true; render();
  }
  function simulateWithout() { // el usuario no presenta peleador (plantel sin disponibles)
    pendingSummary = finishEvent(null); ui.summary = true; render();
  }

  // ------------------------------------------------------------------ interfaz: contenedor
  let open = false;
  function css() {
    if ($('mc-style')) return;
    const st = document.createElement('style'); st.id = 'mc-style';
    st.textContent = `
    #mc-root{position:fixed;inset:0;z-index:30;background:#101212;color:#f0f2ed;display:none;flex-direction:column;font-family:'DM Sans',system-ui,sans-serif;font-size:13px}
    #mc-root.on{display:flex}
    .mc-top{display:flex;align-items:center;gap:14px;padding:10px 18px;border-bottom:1px solid #2a2e2e;background:#141716}
    .mc-brand{font:800 22px 'Barlow Condensed',Impact,sans-serif;letter-spacing:1px;color:#d3f769}
    .mc-cash{margin-left:auto;display:flex;align-items:center;gap:12px;font:600 13px 'JetBrains Mono',monospace}
    .mc-ico{width:14px;height:14px;vertical-align:-2px;margin-right:4px}
    .mc-nav{display:flex;gap:2px;padding:0 12px;border-bottom:1px solid #2a2e2e;background:#141716;overflow-x:auto}
    .mc-nav button{background:none;border:0;color:#858d8b;padding:10px 13px;font:700 12px 'Barlow Condensed',sans-serif;letter-spacing:1.2px;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap}
    .mc-nav button.on{color:#d3f769;border-color:#d3f769}
    .mc-body{flex:1;overflow:auto;padding:18px;max-width:1150px;width:100%;margin:0 auto}
    .mc-grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
    .mc-card{background:#191c1c;border:1px solid #2a2e2e;border-radius:9px;padding:14px 16px;margin-bottom:14px}
    .mc-card h3{margin:0 0 10px;font:700 15px 'Barlow Condensed',sans-serif;letter-spacing:1px;color:#d3f769}
    .mc-muted{color:#858d8b}.mc-good{color:#6fcf97}.mc-bad{color:#ec655e}.mc-warn{color:#f2c94c}
    table.mc-t{width:100%;border-collapse:collapse}
    .mc-t th{font:600 10px 'JetBrains Mono',monospace;letter-spacing:.8px;color:#858d8b;text-align:left;padding:5px 6px;border-bottom:1px solid #2a2e2e;font-weight:600}
    .mc-t td{padding:6px;border-bottom:1px solid #20262a}
    .mc-t tr.me td{background:#232b1c}
    .mc-t tr.click{cursor:pointer}.mc-t tr.click:hover td{background:#20262a}
    .mc-btn{background:#232928;color:#f0f2ed;border:1px solid #3a4240;border-radius:6px;padding:7px 12px;font:700 12px 'Barlow Condensed',sans-serif;letter-spacing:1px;cursor:pointer}
    .mc-btn:hover{border-color:#d3f769}.mc-btn.pri{background:#d3f769;color:#101212;border-color:#d3f769}.mc-btn[disabled]{opacity:.4;cursor:not-allowed}
    .mc-btn.sm{padding:4px 9px;font-size:11px}
    .mc-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.mc-sp{justify-content:space-between}
    .mc-pill{display:inline-block;padding:1px 7px;border-radius:9px;background:#26343b;font-size:10px;margin-left:4px}
    .mc-pill.bad{background:#4a2321;color:#ec9a95}.mc-pill.ok{background:#25392f;color:#a9d3b6}.mc-pill.warn{background:#43391b;color:#f2d67a}
    .mc-bar{height:6px;background:#2a2e2e;border-radius:3px;overflow:hidden;min-width:60px}.mc-bar i{display:block;height:100%;background:#d3f769}
    .mc-vs{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;text-align:center;margin:8px 0 14px}
    .mc-vs b{font:800 22px 'Barlow Condensed',sans-serif}.mc-vs small{display:block;color:#858d8b}
    .mc-vs .x{font:800 26px 'Barlow Condensed',sans-serif;color:#d3f769}
    .mc-stats{display:grid;grid-template-columns:auto 1fr auto;gap:4px 10px;align-items:center;font-size:12px}
    .mc-shade{position:fixed;inset:0;z-index:31;background:#080b0acc;display:grid;place-items:center;padding:16px}
    .mc-modal{width:min(640px,100%);max-height:90vh;overflow:auto;background:#1a1f1b;border:1px solid #414b37;border-radius:10px;padding:22px}
    .mc-modal h2{margin:0 0 10px;font:800 24px 'Barlow Condensed',sans-serif}
    .mc-fab{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:29;display:none;gap:10px;align-items:center;background:#1a1f1b;border:1px solid #d3f769;border-radius:10px;padding:10px 14px;box-shadow:0 8px 30px #000a;font:600 13px 'DM Sans',sans-serif}
    .mc-fab.on{display:flex}
    body.mc-fight #resetBtn,body.mc-fight #configBtn,body.mc-fight #rematchBtn{display:none!important}
    .mc-open{background:#d3f769;color:#101212;border:0;border-radius:6px;padding:7px 12px;font:800 12px 'Barlow Condensed',sans-serif;letter-spacing:1.2px;cursor:pointer;margin-left:12px}
    .mc-li{padding:7px 0;border-bottom:1px solid #20262a}
    `;
    document.head.appendChild(st);
  }
  function mount() {
    css();
    const root = document.createElement('div'); root.id = 'mc-root'; document.body.appendChild(root);
    const fab = document.createElement('div'); fab.id = 'mc-fab'; fab.className = 'mc-fab'; document.body.appendChild(fab);
    const hdr = document.querySelector('.header-right'); if (hdr) { const b = document.createElement('button'); b.className = 'mc-open'; b.textContent = 'MODO CARRERA'; b.onclick = showOverlay; hdr.prepend(b); }
    root.addEventListener('click', onClick); root.addEventListener('change', onChange);
    document.addEventListener('click', e => { if (e.target && e.target.id === 'mc-continue') { if (typeof closeModal === 'function') closeModal(); document.body.classList.remove('mc-fight'); ui.summary = true; showBanner(null, false); showOverlay(); } });
  }
  function showBanner(text, cont) {
    const f = $('mc-fab'); if (!f) return;
    if (text) { f.innerHTML = '<span>' + esc(text) + '</span>'; f.classList.add('on'); }
    else if (cont) { f.innerHTML = '<span>Combate registrado.</span><button class="mc-btn pri" id="mc-continue">CONTINUAR CARRERA ▶</button>'; f.classList.add('on'); }
    else f.classList.remove('on');
  }
  function showOverlay() { open = true; $('mc-root').classList.add('on'); if (!S) { if (!load()) newCareer(); } if (pendingSummary) ui.summary = true; render(); }
  function hideOverlay() { open = false; $('mc-root').classList.remove('on'); }

  // ------------------------------------------------------------------ pantallas
  const TABS = [['home', 'INICIO'], ['squad', 'PLANTEL'], ['market', 'MERCADO'], ['training', 'ENTRENAMIENTO'], ['table', 'CLASIFICACIÓN'], ['calendar', 'CALENDARIO'], ['finance', 'FINANZAS'], ['news', 'NOTICIAS'], ['history', 'HISTORIAL']];
  function render() {
    if (!open || !S) return; const root = $('mc-root');
    const alertsN = S.offers.length;
    root.innerHTML = `<div class="mc-top"><span class="mc-brand">LLO · CARRERA</span><span class="mc-muted">Temporada ${S.season} · Evento ${Math.min(S.ev + 1, EVENTS + 1)}/${EVENTS + 1} · ${evDate(S.season, S.ev)}</span>
      <div class="mc-cash"><span>${money(cash())}</span>${S.debt ? `<span class="mc-bad">Deuda ${fmt(S.debt)}</span>` : ''}<button class="mc-btn sm" data-act="exit">SALIR AL SIMULADOR</button></div></div>
      <div class="mc-nav">${TABS.map(([k, l]) => `<button data-act="tab" data-v="${k}" class="${view === k ? 'on' : ''}">${l}${k === 'market' && alertsN ? ' (' + alertsN + ')' : ''}</button>`).join('')}</div>
      <div class="mc-body">${SCREENS[view]()}</div>${ui.summary && pendingSummary ? summaryModal() : ''}${ui.modal || ''}`;
  }
  const statBars = f => STATS.map(k => `<span>${STAT_LBL[k]}</span><div class="mc-bar"><i style="width:${f.stats[k]}%"></i></div><b>${f.stats[k]}</b>`).join('');
  const condPill = f => f.inj ? `<span class="mc-pill bad">Lesión · ${f.inj} ev.</span>` : f.cond < 60 ? '<span class="mc-pill warn">Cansado</span>' : '';
  const recStr = f => f.rec.w + '-' + f.rec.l + (f.rec.d ? '-' + f.rec.d : '');

  const SCREENS = {
    home() {
      const p = preparePicks(), me = F(p.mine), opp = F(p.opp), og = p.oppGym != null ? gymOf(p.oppGym) : null, mine = roster(gymOf(0));
      const alerts = [];
      const hurt = mine.filter(f => f.inj); if (hurt.length) alerts.push(`<div class="mc-li mc-warn">Lesionados: ${hurt.map(f => esc(f.name) + ' (' + f.inj + ')').join(', ')}</div>`);
      if (mine.length < MIN_ROSTER) alerts.push(`<div class="mc-li mc-bad">Tienes solo ${mine.length} peleadores (mínimo ${MIN_ROSTER}). Ficha en el mercado.</div>`);
      const exp = mine.filter(f => f.contract.events <= 2); if (exp.length) alerts.push(`<div class="mc-li mc-warn">Contrato por vencer: ${exp.map(f => esc(f.name)).join(', ')}</div>`);
      if (S.offers.length) alerts.push(`<div class="mc-li mc-good">${S.offers.length} oferta(s) por tus peleadores en el Mercado.</div>`);
      if (S.debt) alerts.push(`<div class="mc-li mc-bad">Tienes una deuda de ${fmt(S.debt)} por impagos.</div>`);
      const last = S.lastEvent;
      const opts = mine.map(f => `<option value="${f.id}" ${f.id === p.mine ? 'selected' : ''}>${esc(f.name)} · ${f.div} · ${f.ovr}${f.div !== p.div ? ' · fuera de peso' : ''}${f.inj ? ' · LESIONADO' : f.cond < 60 ? ' · cansado' : ''}</option>`).join('');
      return `<div class="mc-grid"><div class="mc-card"><h3>${p.final ? 'NOCHE DE CAMPEONES' : 'PRÓXIMO EVENTO'} · ${S.ev + 1} de ${EVENTS + 1}</h3><div class="mc-muted">${evDate(S.season, S.ev)}</div>${p.div ? '<div class="mc-muted">' + (p.final ? 'Combate por el título' : 'Combate') + ' de ' + p.div + ' (' + DIVS.find(d => d[0] === p.div)[1] + ')</div>' : (p.final ? '<div class="mc-muted">Tu gimnasio no disputa títulos esta noche.</div>' : '')}
        <div class="mc-vs"><div><b>${me ? esc(me.name) : '—'}</b><small>${me ? 'OVR ' + me.ovr + ' · ' + esc(me.style) + ' · ' + recStr(me) : ''}</small><small>${esc(gymOf(0).name)}</small></div><span class="x">VS</span>
        <div><b>${opp ? esc(opp.name) : '—'}</b><small>${opp ? 'OVR ' + opp.ovr + ' · ' + esc(opp.style) + ' · ' + recStr(opp) : ''}</small><small>${og ? esc(og.name) : ''}</small></div></div>
        ${p.final ? '' : `<div class="mc-row"><label class="mc-muted">Tu peleador&nbsp;<select data-chg="pickMine">${opts}</select></label></div>`}
        <div class="mc-row" style="margin-top:12px"><button class="mc-btn pri" data-act="fight3d" ${me ? '' : 'disabled hidden'}>PELEAR EN 3D (DIRIGES LAS ESQUINAS)</button><button class="mc-btn" data-act="simMine">${me ? 'SIMULAR COMBATE' : 'SIMULAR EVENTO'}</button></div>
        <p class="mc-muted" style="font-size:11px">Los otros combates de la cartelera se simulan solos. Premios: victoria ${fmt(SIM_PAY.win)} (+${fmt(SIM_PAY.finBonus)} por finalización), derrota ${fmt(SIM_PAY.loss)}.</p></div>
        <div class="mc-card"><h3>AVISOS</h3>${alerts.join('') || '<span class="mc-muted">Todo en orden.</span>'}</div></div>
        <div class="mc-grid"><div class="mc-card"><h3>TU GIMNASIO</h3>${gymTable(mine)}</div>
        <div class="mc-card"><h3>ÚLTIMO EVENTO</h3>${last ? boutList(last.bouts) : '<span class="mc-muted">Todavía no hubo eventos.</span>'}</div></div>`;
    },
    squad() {
      const mine = roster(gymOf(0));
      return `<div class="mc-card"><h3>PLANTEL (${mine.length}/${MAX_ROSTER})</h3><table class="mc-t"><tr><th>PELEADOR</th><th>ESTILO</th><th>PESO</th><th>EDAD</th><th>OVR</th><th>POT</th><th>RÉCORD</th><th>COND.</th><th>SALARIO</th><th>CONTRATO</th></tr>
      ${mine.sort((a, b) => b.ovr - a.ovr).map(f => `<tr class="click" data-act="profile" data-id="${f.id}"><td>${esc(f.name)} ${condPill(f)}${beltOf(f)}</td><td>${esc(f.style)}</td><td>${f.div}</td><td>${f.age}</td><td><b>${f.ovr}</b></td><td>${f.pot}</td><td>${recStr(f)}</td><td><div class="mc-bar"><i style="width:${f.cond}%"></i></div></td><td>${fmt(f.contract.salary)}</td><td>${f.contract.events} ev.</td></tr>`).join('')}</table>
      <p class="mc-muted" style="font-size:11px">Toca un peleador para ver sus atributos, renovar o liberarlo. Salarios se pagan en cada evento.</p></div>`;
    },
    market() {
      const tab = ui.mTab || 'fa';
      const tabs = `<div class="mc-row" style="margin-bottom:12px">${[['fa', 'Agentes libres'], ['offers', 'Ofertas (' + S.offers.length + ')']].map(([k, l]) => `<button class="mc-btn ${tab === k ? 'pri' : ''}" data-act="mtab" data-v="${k}">${l}</button>`).join('')}</div>`;
      if (tab === 'offers') {
        return tabs + `<div class="mc-card"><h3>OFERTAS POR TUS PELEADORES</h3>${S.offers.length ? S.offers.map((o, i) => { const f = F(o.fid); return `<div class="mc-li mc-row mc-sp"><span><b>${esc(f.name)}</b> (OVR ${f.ovr}) → ${esc(gymOf(o.gym).name)}<br><span class="mc-muted">Ofrecen ${money(o.amount)} · vence en ${o.exp - S.ev} evento(s)</span></span><span><button class="mc-btn pri sm" data-act="offerYes" data-i="${i}">ACEPTAR</button> ${o.countered ? '' : `<button class="mc-btn sm" data-act="offerCounter" data-i="${i}">CONTRAOFERTAR +15%</button> `}<button class="mc-btn sm" data-act="offerNo" data-i="${i}">RECHAZAR</button></span></div>`; }).join('') : '<span class="mc-muted">No hay ofertas ahora.</span>'}</div>`;
      }
      const fa = S.fa.map(F).sort((a, b) => b.ovr - a.ovr);
      const full = gymOf(0).fighters.length >= MAX_ROSTER;
      return tabs + `<div class="mc-card"><h3>AGENTES LIBRES Y CANTERA</h3><p class="mc-muted" style="font-size:11px">Fichar cuesta una prima de 4 salarios. Plantel ${gymOf(0).fighters.length}/${MAX_ROSTER}.</p><table class="mc-t"><tr><th>PELEADOR</th><th>ESTILO</th><th>PESO</th><th>EDAD</th><th>OVR</th><th>POT</th><th>SALARIO</th><th>PRIMA</th><th></th></tr>
      ${fa.map(f => { const fee = salaryOf(f) * 4; return `<tr><td class="click" data-act="profile" data-id="${f.id}">${esc(f.name)}${f.age <= 21 ? '<span class="mc-pill ok">Promesa</span>' : ''}</td><td>${esc(f.style)}</td><td>${f.div}</td><td>${f.age}</td><td><b>${f.ovr}</b></td><td>${f.pot}</td><td>${fmt(salaryOf(f))}</td><td>${money(fee)}</td><td><button class="mc-btn sm pri" data-act="negOpen" data-kind="sign" data-id="${f.id}" ${full ? 'disabled' : ''}>OFERTAR</button></td></tr>`; }).join('')}</table></div>`;
    },
    training() {
      const mine = roster(gymOf(0));
      return `<div class="mc-grid"><div class="mc-card"><h3>INTENSIDAD DEL GIMNASIO</h3><div class="mc-row">${[['low', 'Suave'], ['normal', 'Normal'], ['high', 'Intensa']].map(([k, l]) => `<button class="mc-btn ${S.intensity === k ? 'pri' : ''}" data-act="intensity" data-v="${k}">${l}</button>`).join('')}</div>
        <p class="mc-muted" style="font-size:11px">Intensa: progresan más rápido pero recuperan menos condición. Suave: recuperan más.</p></div>
        <div class="mc-card"><h3>INSTALACIONES · NIVEL ${S.fac}</h3><p class="mc-muted" style="font-size:11px">Cada nivel: +10% de progreso, +2 de recuperación y más patrocinio (gasto fijo mayor).</p>
        ${S.fac < 5 ? `<button class="mc-btn pri" data-act="upgrade" ${cash() < FAC_COST(S.fac) ? 'disabled' : ''}>MEJORAR · ${money(FAC_COST(S.fac))}</button>` : '<span class="mc-pill ok">Máximo</span>'}</div></div>
      <div class="mc-card"><h3>ENFOQUE INDIVIDUAL</h3><table class="mc-t"><tr><th>PELEADOR</th><th>OVR</th><th>POT</th><th>ENFOQUE</th><th>PROGRESO</th></tr>${mine.map(f => `<tr><td>${esc(f.name)}</td><td>${f.ovr}</td><td>${f.pot}</td>
        <td><select data-chg="focus" data-id="${f.id}">${STATS.map(k => `<option value="${k}" ${(f.focus || recommendFocus(f)) === k ? 'selected' : ''}>${STAT_LBL[k]} (${f.stats[k]})</option>`).join('')}</select></td><td><div class="mc-bar"><i style="width:${f.tp / 3 * 100}%"></i></div></td></tr>`).join('')}</table></div>`;
    },
    table() {
      const gyms = [...S.gyms].sort((a, b) => b.pts - a.pts || b.w - a.w), dv = ui.tDiv || DIV_NAMES[0], champ = F(S.champs[dv]), fs = Object.values(S.fighters).filter(f => f.gym !== null && f.div === dv).sort((a, b) => b.pts - a.pts || b.ovr - a.ovr).slice(0, 20);
      return `<div class="mc-grid"><div class="mc-card"><h3>GIMNASIOS · TEMPORADA ${S.season}</h3><table class="mc-t"><tr><th>#</th><th>GIMNASIO</th><th>V</th><th>D</th><th>E</th><th>PTS</th></tr>${gyms.map((g, i) => `<tr class="${g.id === 0 ? 'me' : ''}"><td>${i + 1}</td><td>${esc(g.name)}</td><td>${g.w}</td><td>${g.l}</td><td>${g.d}</td><td><b>${g.pts}</b></td></tr>`).join('')}</table></div>
      <div class="mc-card"><h3>RANKING · ${dv.toUpperCase()}</h3><div class="mc-row" style="margin-bottom:8px">${DIV_NAMES.map(d => `<button class="mc-btn sm ${d === dv ? 'pri' : ''}" data-act="tdiv" data-v="${d}">${d}</button>`).join('')}</div><div class="mc-muted" style="margin-bottom:8px">Campeón: <b>${champ ? esc(champ.name) + ' (' + esc(gymOf(champ.gym).short) + ')' : 'vacante'}</b></div><table class="mc-t"><tr><th>#</th><th>PELEADOR</th><th>GIM.</th><th>OVR</th><th>RÉC.</th><th>PTS</th></tr>${fs.map((f, i) => `<tr class="${f.gym === 0 ? 'me' : ''}"><td>${i + 1}</td><td>${esc(f.name)}${beltOf(f)}</td><td>${esc(gymOf(f.gym).short)}</td><td>${f.ovr}</td><td>${recStr(f)}</td><td><b>${f.pts}</b></td></tr>`).join('')}</table></div></div>`;
    },
    calendar() {
      return `<div class="mc-card"><h3>CALENDARIO · TEMPORADA ${S.season}</h3>${S.schedule.map((pairs, i) => {
        const mineP = pairs.find(([a, b]) => a === 0 || b === 0), opp = gymOf(mineP[0] === 0 ? mineP[1] : mineP[0]), res = S.results[i], tag = i < S.ev ? '' : i === S.ev ? '<span class="mc-pill ok">PRÓXIMO</span>' : '';
        let r = ''; if (res) { const mb = res.find(b => F0(b.a).gym === 0 || F0(b.b).gym === 0); if (mb) { const mineA = F0(mb.a).gym === 0, won = mb.winner === (mineA ? 'a' : 'b'); r = mb.winner === null ? '<span class="mc-pill">EMPATE</span>' : won ? '<span class="mc-pill ok">VICTORIA</span>' : '<span class="mc-pill bad">DERROTA</span>'; r += ' <span class="mc-muted">' + esc(mb.method) + '</span>'; } }
        return `<div class="mc-li mc-row mc-sp"><span>Evento ${i + 1} <small class="mc-muted">${evDate(S.season, i)}</small> · vs <b>${esc(opp.name)}</b> ${tag}</span><span>${r}</span></div>`;
      }).join('')}<div class="mc-li mc-row mc-sp"><span>Evento ${EVENTS + 1} <small class="mc-muted">${evDate(S.season, EVENTS)}</small> · <b>Noche de Campeones</b> (combates por el título) ${S.ev === EVENTS ? '<span class="mc-pill ok">PRÓXIMO</span>' : ''}</span><span class="mc-muted">${(S.results[EVENTS] || []).length ? 'Disputada' : ''}</span></div></div>`;
    },
    finance() {
      const L = S.ledger, rows = [['Premios', L.prizes], ['Patrocinadores', L.sponsors], ['Derechos de TV', L.tv]], exp = [['Salarios', L.salaries], ['Operaciones del gimnasio', L.ops], ['Primas de fichaje', L.fees]];
      const row = ([l, v]) => `<div class="mc-li mc-row mc-sp"><span>${l}</span><b>${money(v)}</b></div>`;
      return `<div class="mc-grid"><div class="mc-card"><h3>INGRESOS (TEMPORADA)</h3>${rows.map(row).join('')}</div><div class="mc-card"><h3>GASTOS (TEMPORADA)</h3>${exp.map(row).join('')}</div>
      <div class="mc-card"><h3>BALANCE</h3><div class="mc-li mc-row mc-sp"><span>Neto</span><b class="${ledgerNet() >= 0 ? 'mc-good' : 'mc-bad'}">${money(ledgerNet())}</b></div><div class="mc-li mc-row mc-sp"><span>Caja (billetera del hub)</span><b>${money(cash())}</b></div>
      <p class="mc-muted" style="font-size:11px">La caja es la misma plata que usas en el resto de los módulos. Si no alcanza para los salarios se genera una deuda.</p></div></div>
      <div class="mc-card"><h3>HISTORIAL DE TEMPORADAS</h3>${S.ledgerHist.length ? `<table class="mc-t"><tr><th>TEMP.</th><th>PREMIOS</th><th>PATROC.</th><th>TV</th><th>SALARIOS</th><th>OPER.</th><th>FICHAJES</th></tr>${S.ledgerHist.map(h => `<tr><td>${h.season}</td><td>${fmt(h.prizes)}</td><td>${fmt(h.sponsors)}</td><td>${fmt(h.tv)}</td><td>${fmt(h.salaries)}</td><td>${fmt(h.ops)}</td><td>${fmt(h.fees)}</td></tr>`).join('')}</table>` : '<span class="mc-muted">Se llena al terminar la primera temporada.</span>'}</div>`;
    },
    news() {
      return `<div class="mc-card"><h3>NOTICIAS</h3>${S.news.slice(0, 60).map(n => `<div class="mc-li"><span class="mc-muted">${evDate(n.season, n.ev - 1)} · E${n.ev}</span> <b>${esc(n.title)}</b><br>${esc(n.text)}</div>`).join('') || '<span class="mc-muted">Sin noticias.</span>'}</div>`;
    },
    history() {
      return `<div class="mc-card"><h3>HISTORIAL DE TEMPORADAS</h3>${S.history.length ? `<table class="mc-t"><tr><th>TEMP.</th><th>CAMPEÓN</th><th>MEJOR PELEADOR</th><th>TU GIMNASIO</th><th>CINTURONES</th><th>PREMIO</th></tr>${S.history.map(h => `<tr><td>${h.season}</td><td>${esc(h.champion)} (${h.champPts})</td><td>${esc(h.best)}</td><td>${h.me}.º · ${h.mePts} pts</td><td>${(h.belts || []).map(esc).join('<br>')}</td><td>${h.bonus ? money(h.bonus) : '—'}</td></tr>`).join('')}</table>` : '<span class="mc-muted">Todavía no terminó ninguna temporada.</span>'}</div>`;
    },
  };
  const F0 = id => S.fighters[id] || { gym: -1 };
  function gymTable(mine) {
    return `<table class="mc-t"><tr><th>PELEADOR</th><th>OVR</th><th>RÉC.</th><th>COND.</th></tr>${mine.map(f => `<tr><td>${esc(f.name)} ${condPill(f)}</td><td>${f.ovr}</td><td>${recStr(f)}</td><td><div class="mc-bar"><i style="width:${f.cond}%"></i></div></td></tr>`).join('')}</table>`;
  }
  function boutList(bouts) {
    return bouts.map(b => { const A = F0(b.a), B = F0(b.b), w = b.winner === 'a' ? A : b.winner === 'b' ? B : null; return `<div class="mc-li"><b>${esc(A.name || '?')}</b> vs <b>${esc(B.name || '?')}</b><br><span class="${w && w.gym === 0 ? 'mc-good' : (A.gym === 0 || B.gym === 0) ? 'mc-bad' : 'mc-muted'}">${w ? esc(w.name) + ' gana · ' : ''}${esc(b.method)}${b.finish ? ' (R' + b.round + ')' : ''}</span>${b.div ? ' <span class="mc-pill">' + b.div + '</span>' : ''}${b.title ? ' <span class="mc-pill warn">TÍTULO</span>' : ''}${b.src === '3D' ? ' <span class="mc-pill ok">3D</span>' : ''}</div>`; }).join('');
  }
  function summaryModal() {
    const s = pendingSummary, mb = s.bouts.find(b => F0(b.a).gym === 0 || F0(b.b).gym === 0);
    let head = 'EVENTO ' + s.ev + ' FINALIZADO';
    if (mb) { const mineA = F0(mb.a).gym === 0, won = mb.winner === (mineA ? 'a' : 'b'); head = mb.winner === null ? 'EMPATE' : won ? '¡VICTORIA!' : 'DERROTA'; }
    return `<div class="mc-shade"><div class="mc-modal"><h2>${head}</h2>${boutList(s.bouts)}
      <div class="mc-li mc-row mc-sp"><span>Premio del combate</span><b class="mc-good">+${money(s.prize)}</b></div><div class="mc-li mc-row mc-sp"><span>Patrocinio + TV</span><b class="mc-good">+${money(s.sponsors + s.tv)}</b></div><div class="mc-li mc-row mc-sp"><span>Salarios y gastos</span><b class="mc-bad">−${money(s.salaries + s.ops)}</b></div>
      ${s.seasonEnd ? `<div class="mc-card" style="margin-top:12px"><h3>FIN DE TEMPORADA</h3>Campeón: <b>${esc(s.seasonEnd.champ)}</b>. Tu gimnasio terminó ${s.seasonEnd.me}.º.${s.seasonEnd.bonus ? ' Premio: ' + money(s.seasonEnd.bonus) + '.' : ''}</div>` : ''}
      <div class="mc-row" style="margin-top:14px;justify-content:flex-end"><button class="mc-btn pri" data-act="closeSummary">CONTINUAR</button></div></div></div>`;
  }
  function profileModal(f) {
    const mine = f.gym === 0;
    return `<div class="mc-shade"><div class="mc-modal"><h2>${esc(f.name)} “${esc(f.nick)}” ${beltOf(f)}</h2><div class="mc-muted">${esc(f.style)} · ${f.div} · ${f.age} años · OVR ${f.ovr} / POT ${f.pot} · ${recStr(f)} (${f.rec.ko} KO, ${f.rec.sub} sum.) ${f.gym !== null ? '· ' + esc(gymOf(f.gym).name) : '· Agente libre'}</div>
      <div class="mc-stats" style="margin:12px 0">${statBars(f)}</div>
      ${f.hist.length ? `<div class="mc-muted" style="font-size:11px">Últimos combates: ${f.hist.slice(-5).reverse().map(h => h.res + ' vs ' + esc(h.opp)).join(' · ')}</div>` : ''}
      <div class="mc-row" style="margin-top:14px;justify-content:flex-end">${mine ? `<button class="mc-btn" data-act="negOpen" data-kind="renew" data-id="${f.id}">NEGOCIAR RENOVACIÓN</button><button class="mc-btn" data-act="release" data-id="${f.id}">LIBERAR</button>` : ''}<button class="mc-btn pri" data-act="closeModal">CERRAR</button></div></div></div>`;
  }

  // ------------------------------------------------------------------ negociación de contratos
  const negAsk = (f, kind, events) => Math.round(salaryOf(f) * (kind === 'renew' ? 1.1 : 1) * (events === 21 ? 1.05 : events === 7 ? .97 : 1) / 100) * 100;
  function negModal() {
    const n = ui.neg, f = F(n.fid), renew = n.kind === 'renew', ask = negAsk(f, n.kind, n.events), r = n.salary / ask;
    const mood = r >= 1 ? '<span class="mc-good">Dispuesto a firmar</span>' : r >= .88 ? '<span class="mc-warn">Casi convencido: pide algo más</span>' : '<span class="mc-bad">Muy lejos de lo que pide</span>';
    return `<div class="mc-shade"><div class="mc-modal"><h2>${renew ? 'RENOVAR A' : 'OFERTAR A'} ${esc(f.name)}</h2>
      <div class="mc-muted">${esc(f.style)} · ${f.div} · ${f.age} años · OVR ${f.ovr} / POT ${f.pot}</div>
      <div class="mc-row" style="margin:14px 0"><label>Salario por evento&nbsp;<input type="number" data-chg="negSalary" min="1000" step="500" value="${n.salary}" style="width:110px"></label>
      <label>Duración&nbsp;<select data-chg="negEvents">${[7, 14, 21].map(e => `<option value="${e}" ${n.events === e ? 'selected' : ''}>${e} eventos</option>`).join('')}</select></label></div>
      <p>Para esa duración pide <b>${money(ask)}</b> por evento · ${mood}</p>
      <p class="mc-muted" style="font-size:11px">Prima de firma: ${money(n.salary * (renew ? 2 : 4))}.</p>${n.msg ? `<div class="mc-warn">${esc(n.msg)}</div>` : ''}
      <div class="mc-row" style="justify-content:flex-end;margin-top:12px"><button class="mc-btn pri" data-act="negSubmit">OFRECER CONTRATO</button>${n.counter ? `<button class="mc-btn" data-act="negCounter">OFRECER ${fmt(n.counter)}</button>` : ''}<button class="mc-btn" data-act="closeModal">CANCELAR</button></div></div></div>`;
  }
  function doNeg() {
    const n = ui.neg, f = F(n.fid), renew = n.kind === 'renew', ask = negAsk(f, n.kind, n.events), r = n.salary / ask, fee = Math.round(n.salary * (renew ? 2 : 4));
    n.counter = null;
    if (r < .88) n.msg = f.name + ' rechaza la oferta.';
    else if (r < 1) { n.msg = 'Contraoferta: ' + f.name + ' pide ' + fmt(ask) + ' por evento.'; n.counter = ask; }
    else if (!renew && gymOf(0).fighters.length >= MAX_ROSTER) n.msg = 'El plantel está completo.';
    else if (!spend(fee)) n.msg = 'No alcanza la caja para la prima (' + fmt(fee) + ').';
    else {
      S.ledger.fees += fee;
      if (renew) { f.contract = { salary: n.salary, events: n.events }; news('Renovación', f.name + ' renueva por ' + n.events + ' eventos.', 'info'); }
      else { joinGym(f, 0, { salary: n.salary, events: n.events }); news('Fichaje', f.name + ' (OVR ' + f.ovr + ') firma con tu gimnasio.', 'info'); }
      ui.modal = ''; return;
    }
    ui.modal = negModal();
  }

  // ------------------------------------------------------------------ eventos de la interfaz
  function onClick(e) {
    const el = e.target.closest('[data-act]'); if (!el) return; const a = el.dataset.act, id = el.dataset.id;
    if (a === 'tab') { view = el.dataset.v; ui.modal = ''; }
    else if (a === 'exit') { hideOverlay(); return; }
    else if (a === 'mtab') ui.mTab = el.dataset.v;
    else if (a === 'closeSummary') { ui.summary = false; pendingSummary = null; }
    else if (a === 'closeModal') ui.modal = '';
    else if (a === 'profile') ui.modal = profileModal(F(id));
    else if (a === 'negOpen') { const f = F(id), kind = el.dataset.kind; ui.neg = { kind, fid: id, events: 14, salary: negAsk(f, kind, 14), msg: '', counter: null }; ui.modal = negModal(); }
    else if (a === 'negSubmit') doNeg();
    else if (a === 'negCounter') { ui.neg.salary = ui.neg.counter; doNeg(); }
    else if (a === 'tdiv') ui.tDiv = el.dataset.v;
    else if (a === 'offerCounter') { const o = S.offers[Number(el.dataset.i)]; if (o) { if (Math.random() < .5) { o.amount = Math.round(o.amount * 1.15 / 1000) * 1000; o.countered = true; news('Contraoferta aceptada', gymOf(o.gym).name + ' sube su oferta por ' + F(o.fid).name + ' a ' + fmt(o.amount) + '.', 'trade'); } else { S.offers.splice(Number(el.dataset.i), 1); news('Oferta retirada', 'Rechazaron tu contraoferta por ' + F(o.fid).name + '.', 'trade'); } } }
    else if (a === 'fight3d') { launch3D(); return; }
    else if (a === 'simMine') { const p = preparePicks(); if (!p.mine) simulateWithout(); else simulateMine(); return; }
    else if (a === 'intensity') S.intensity = el.dataset.v;
    else if (a === 'upgrade') { const c = FAC_COST(S.fac); if (spend(c)) { S.fac++; S.ledger.fees += c; news('Instalaciones', 'El gimnasio sube al nivel ' + S.fac + '.', 'info'); } }
    else if (a === 'sign') { const f = F(id), fee = salaryOf(f) * 4; if (gymOf(0).fighters.length < MAX_ROSTER && spend(fee)) { S.ledger.fees += fee; joinGym(f, 0, { salary: salaryOf(f), events: 14 }); news('Fichaje', f.name + ' (OVR ' + f.ovr + ') firma con tu gimnasio.', 'info'); } }
    else if (a === 'renew') { const f = F(id), fee = salaryOf(f) * 2; if (spend(fee)) { S.ledger.fees += fee; f.contract = { salary: Math.round(salaryOf(f) * 1.1), events: 14 }; news('Renovación', f.name + ' renueva por 14 eventos.', 'info'); ui.modal = profileModal(f); } else ui.modal = profileModal(f); }
    else if (a === 'release') { const f = F(id); if (gymOf(0).fighters.length <= MIN_ROSTER) { alert('Necesitas al menos ' + MIN_ROSTER + ' peleadores.'); return; } const c = Math.round(f.contract.salary * f.contract.events * .3); if (!confirm('¿Liberar a ' + f.name + '? Indemnización: ' + fmt(c))) return; if (spend(c)) { S.ledger.fees += c; leaveGym(f); news('Baja', f.name + ' deja el gimnasio.', 'info'); ui.modal = ''; } else alert('No alcanza la caja para la indemnización.'); }
    else if (a === 'offerYes') { const o = S.offers[Number(el.dataset.i)]; if (o && roster(gymOf(0)).length > MIN_ROSTER) { const f = F(o.fid); earn(o.amount); S.ledger.prizes += o.amount; gymOf(0).fighters = gymOf(0).fighters.filter(x => x !== f.id); f.gym = o.gym; f.contract = { salary: salaryOf(f), events: 14 }; gymOf(o.gym).fighters.push(f.id); S.offers.splice(Number(el.dataset.i), 1); news('Traspaso', f.name + ' se va a ' + gymOf(o.gym).name + ' por ' + fmt(o.amount) + '.', 'trade'); } else alert('Necesitas mantener al menos ' + MIN_ROSTER + ' peleadores.'); }
    else if (a === 'offerNo') S.offers.splice(Number(el.dataset.i), 1);
    save(); render();
  }
  function onChange(e) {
    const el = e.target.closest('[data-chg]'); if (!el) return;
    if (el.dataset.chg === 'pickMine') { preparePicks().mine = el.value; }
    else if (el.dataset.chg === 'focus') { F(el.dataset.id).focus = el.value; }
    else if (el.dataset.chg === 'negSalary') { ui.neg.salary = Math.max(1000, Math.round(Number(el.value) || 0)); ui.neg.msg = ''; ui.neg.counter = null; ui.modal = negModal(); }
    else if (el.dataset.chg === 'negEvents') { ui.neg.events = Number(el.value); ui.neg.salary = negAsk(F(ui.neg.fid), ui.neg.kind, ui.neg.events); ui.neg.msg = ''; ui.neg.counter = null; ui.modal = negModal(); }
    save(); render();
  }

  // ------------------------------------------------------------------ arranque
  function init() {
    mount();
    // Textos fijos del simulador que nombraban a los peleadores de ejemplo
    window.MMACareer = { open: showOverlay, state: () => S, newCareer: () => { newCareer(); render(); }, _sim: { simBout, finishEvent } };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
