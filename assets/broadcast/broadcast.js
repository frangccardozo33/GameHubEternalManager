/* Eternal Manager · Kit de transmisión (LBO, LGO, LRO, LLO).
 *
 * El fútbol tiene presentación de equipos, estudio con dos presentadores (previa y post-partido) y gráficas de TV. Los otros
 * módulos tenían solo su HUD. Este kit les agrega lo que faltaba, por encima de la vista del partido y sin tocar los motores:
 *   - INTRO: presentación (logo de la liga, competición, fecha, sede, equipos con colores/escudos y formaciones).
 *   - PLACAS: gráficas de eventos ("TRIPLE", "TOUCHDOWN", "KNOCKDOWN", "VUELTA RÁPIDA"…) con los colores del equipo.
 *   - ESTUDIO: dos presentadores (Diego Ferreyra, crónica; Lucía Acosta, análisis) que hablan antes y después del partido con
 *     datos reales del partido/temporada. Es solo texto en pantalla (sin voz ni relato durante el juego), igual que el estudio del fútbol.
 * Todo el arte es provisional (CSS); ver assets/broadcast/BROADCAST_PARA_IA.md para lo que hay que reemplazar.
 *
 *   const bc = Broadcast.attach({ id, sport, mount, accent, logo, league })
 *   bc.intro({ competition, date, venue, home, away, lineups, onDone })
 *   bc.studio({ title, lines:[['A'|'B', texto], …], onDone })      previa o post-partido
 *   bc.plate(titulo, subtitulo, color)  bc.event(kind, datos)      placas
 *   bc.tick({ scores, names, period, periods, phase })             detecta puntos, cambios de líder, rachas y el final → placas
 */
(function (g) {
  'use strict';
  const BASE = (() => { try { return new URL('.', document.currentScript.src).href; } catch (e) { return ''; } })();
  let ROOT = BASE ? new URL('../', BASE).href : '';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const fill = (t, v) => String(t).replace(/\{(\w+)\}/g, (m, k) => (v && v[k] != null ? v[k] : ''));
  const HOSTS = { A: { name: 'Diego Ferreyra', role: 'Crónica' }, B: { name: 'Lucía Acosta', role: 'Análisis' } };

  const PLATES = {
    basquet: { score3: 'TRIPLE', lead: 'CAMBIA EL LÍDER', run: 'RACHA', final: 'FINAL', half: 'DESCANSO', timeout: 'TIEMPO MUERTO' },
    nfl: { sack: 'SACK', interception: 'INTERCEPCIÓN', bigplay: 'GRAN JUGADA', touchdown: 'TOUCHDOWN', fieldgoal: 'GOL DE CAMPO', safety: 'SAFETY', lead: 'CAMBIA EL LÍDER', final: 'FINAL', half: 'MEDIO TIEMPO' },
    carreras: { start: 'LARGADA', lead: 'NUEVO LÍDER', final: 'BANDERA A CUADROS' },
    mma: { knockdown: 'KNOCKDOWN', round: 'ROUND', final: 'FINAL DEL COMBATE' },
  };

  // ---- presentadores ilustrados (SVG, sin archivos): boca y ojos animados por CSS ----
  function hostSVG(who, ac) {
    const A = who === 'A', skin = A ? '#c98f68' : '#e2b08c', hair = A ? '#2a1d15' : '#5a3320', suit = A ? '#1e2a3a' : '#2c2f37';
    const back = A ? '' : `<path d="M52 92 C48 40 152 40 148 92 L156 190 L44 190 Z" fill="${hair}"/>`;
    const top = A ? `<path d="M58 88 C54 46 146 42 142 86 C136 70 118 62 100 64 C84 62 66 70 58 88 Z" fill="${hair}"/><path d="M66 118 C70 150 130 150 134 118 C130 142 70 142 66 118 Z" fill="${hair}" opacity=".35"/>`
      : `<path d="M58 96 C52 44 150 40 144 96 C134 64 112 58 96 62 C80 60 64 72 58 96 Z" fill="${hair}"/><path d="M60 92 C70 70 96 64 104 62 C92 74 78 84 60 92 Z" fill="#6d4028"/>`;
    const neck = `<rect x="86" y="130" width="28" height="34" rx="8" fill="${skin}"/>`;
    const body = `<path d="M18 230 C22 186 44 166 80 160 L100 190 L120 160 C156 166 178 186 182 230 Z" fill="${suit}"/>
      <path d="M80 160 L100 206 L120 160 L112 158 L100 180 L88 158 Z" fill="#f2f4f6"/>` + (A ? `<path d="M96 176 L104 176 L108 214 L100 224 L92 214 Z" fill="${ac}"/>` : `<path d="M80 160 L96 214 L88 230 L66 170 Z M120 160 L104 214 L112 230 L134 170 Z" fill="${ac}" opacity=".9"/>`);
    const face = `<ellipse cx="100" cy="100" rx="38" ry="46" fill="${skin}"/><ellipse cx="62" cy="104" rx="7" ry="11" fill="${skin}"/><ellipse cx="138" cy="104" rx="7" ry="11" fill="${skin}"/>
      <path d="M78 88 Q86 83 94 88 M106 88 Q114 83 122 88" stroke="${hair}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <ellipse class="ey" cx="86" cy="98" rx="4" ry="4.6" fill="#1b1512"/><ellipse class="ey" cx="114" cy="98" rx="4" ry="4.6" fill="#1b1512"/>
      <path d="M100 100 Q96 114 101 117" stroke="#0003" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse class="mo" cx="100" cy="128" rx="9" ry="5" fill="${A ? '#6b2b25' : '#a3374a'}"/>` + (A ? '' : `<circle cx="62" cy="118" r="3.5" fill="${ac}"/><circle cx="138" cy="118" r="3.5" fill="${ac}"/>`);
    return `<svg viewBox="0 0 200 230" aria-hidden="true">${back}${body}${neck}${face}${top}</svg>`;
  }
  // Escudo genérico con los colores del equipo cuando no hay escudo propio.
  function shieldSVG(t) {
    const p = esc(t.primary || '#3b6ea5'), q = esc(t.secondary || '#ffffff'), ini = esc((t.short || t.name || '').slice(0, 3).toUpperCase());
    return `<svg viewBox="0 0 100 116"><path d="M50 3 L94 16 L90 64 C86 88 70 102 50 113 C30 102 14 88 10 64 L6 16 Z" fill="${q}"/><path d="M50 10 L87 21 L84 63 C80 84 67 96 50 105 C33 96 20 84 16 63 L13 21 Z" fill="${p}"/><path d="M50 10 L87 21 L85 40 L15 40 L13 21 Z" fill="${q}" opacity=".25"/><text x="50" y="74" text-anchor="middle" font-family="Barlow Condensed,Arial Narrow,Arial" font-weight="900" font-style="italic" font-size="${ini.length > 2 ? 30 : 38}" fill="${q}">${ini}</text></svg>`;
  }

  // ---- estilos --------------------------------------------------------------------------------------------------------------
  const CSS = `
.bc-layer{position:absolute;inset:0;pointer-events:none;z-index:40;font-family:"Barlow Condensed","Arial Narrow",Arial,sans-serif;--a:#f2a03a;--h:#3b6ea5;--w:#c94b4b}
.bc-layer *{box-sizing:border-box}
.bc-plate{position:absolute;left:50%;top:14%;transform:translate(-50%,-20px) skewX(-8deg);min-width:320px;text-align:center;background:var(--pbg,linear-gradient(180deg,color-mix(in srgb,var(--pc,#222) 45%,#15191d),#0c0f12)) center/100% 100% no-repeat;box-shadow:0 0 30px color-mix(in srgb,var(--pc,#fff) 45%,transparent),0 10px 26px #000a;padding:12px 46px 14px;opacity:0;transition:opacity .2s,transform .3s}
.bc-plate::before,.bc-plate::after{content:"";position:absolute;top:18%;bottom:18%;width:8px;background:var(--pc,#fff);box-shadow:0 0 12px var(--pc,#fff);transform:none}.bc-plate::before{left:14px}.bc-plate::after{right:14px}
.bc-plate.on{opacity:1;transform:translate(-50%,0) skewX(-8deg)}
.bc-plate>*{transform:skewX(8deg)}
.bc-plate b{display:block;font-size:44px;line-height:1;font-style:italic;font-weight:900;letter-spacing:.06em;color:#fff;text-shadow:0 3px 0 #0009;text-transform:uppercase}
.bc-plate small{display:block;margin-top:2px;font-size:14px;letter-spacing:.24em;font-weight:700;color:#fff;opacity:.9;text-transform:uppercase}
.bc-intro{position:absolute;inset:0;pointer-events:auto;background:radial-gradient(ellipse at 50% 45%,#0000 0,#000c 80%),var(--ibg,none) center/cover no-repeat,radial-gradient(ellipse at 50% 20%,color-mix(in srgb,var(--a) 22%,#0d1115) 0,#06090c 70%);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center;opacity:0;transition:opacity .35s}
.bc-intro.on{opacity:1}
.bc-intro .lg{height:54px;width:auto;filter:drop-shadow(0 4px 12px #000a)}
.bc-intro .comp{font-size:15px;letter-spacing:.34em;text-transform:uppercase;color:var(--a);font-weight:800}
.bc-intro .vs{display:flex;align-items:center;justify-content:center;gap:clamp(18px,5vw,64px)}
.bc-intro .tm{display:flex;flex-direction:column;align-items:center;gap:8px;animation:bcin .8s cubic-bezier(.2,.9,.2,1) both}
.bc-intro .tm:last-child{animation-delay:.16s}
.bc-intro .cr{width:clamp(70px,11vw,112px);height:clamp(70px,11vw,112px);border-radius:50%;display:grid;place-items:center;font-size:clamp(26px,4vw,44px);font-weight:900;font-style:italic;border:4px solid #fff;box-shadow:0 0 34px color-mix(in srgb,var(--tc) 60%,transparent),0 8px 24px #000a;background:var(--tc);color:var(--tc2,#fff);overflow:hidden}
.bc-intro .cr.sh{border:0;border-radius:0;background:none;box-shadow:none;overflow:visible;filter:drop-shadow(0 0 22px color-mix(in srgb,var(--tc) 60%,transparent)) drop-shadow(0 8px 16px #000a)}.bc-intro .cr.sh svg{width:100%;height:100%}
.bc-intro .cr img{width:82%;height:82%;object-fit:contain}
.bc-intro .tm b{font-size:clamp(20px,3vw,32px);font-style:italic;letter-spacing:.04em;text-transform:uppercase}
.bc-intro .tm small{font-size:13px;letter-spacing:.2em;color:#ffffffb0;text-transform:uppercase}
.bc-intro .mid{font-size:clamp(30px,5vw,54px);font-weight:900;font-style:italic;color:var(--a);animation:bcpop .9s .25s both}
.bc-intro .meta{font-size:14px;letter-spacing:.16em;color:#ffffffc0;text-transform:uppercase}
.bc-intro .lines{display:flex;gap:clamp(18px,6vw,80px);justify-content:center;font-size:14px;line-height:1.5;color:#ffffffd8;margin-top:4px}
.bc-intro .lines div{min-width:150px;text-align:left}.bc-intro .lines h5{margin:0 0 4px;font-size:12px;letter-spacing:.24em;color:var(--a);text-transform:uppercase}
.bc-intro .lines i{font-style:normal;color:#ffffff90;margin-right:6px;display:inline-block;min-width:24px;text-align:right}
.bc-intro button{margin-top:6px;font:800 14px "Barlow Condensed",Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#0b0f13;background:var(--a);border:0;border-radius:4px;padding:9px 20px;cursor:pointer}
.bc-studio{position:absolute;inset:0;pointer-events:auto;background:linear-gradient(180deg,#0006,#000a 70%,#000d),var(--sbg,none) center/cover no-repeat,linear-gradient(180deg,#0b1116,#04070a);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:18px;opacity:0;transition:opacity .35s}
.bc-studio.on{opacity:1}
.bc-studio .st-top{display:flex;align-items:center;gap:12px}.bc-studio .st-top img{height:34px}.bc-studio .st-top b{font-size:18px;letter-spacing:.2em;text-transform:uppercase}.bc-studio .st-top span{background:var(--a);color:#0b0f13;font-weight:900;letter-spacing:.2em;font-size:13px;padding:3px 10px}
.bc-studio .st-set{position:relative;display:flex;align-items:flex-end;justify-content:center;gap:clamp(60px,16vw,220px);width:min(760px,94%);padding-bottom:clamp(14px,3.4vh,24px);margin-top:4px}
.bc-studio .st-screen{position:absolute;left:50%;top:6%;transform:translateX(-50%);width:clamp(90px,16vw,170px);aspect-ratio:16/10;display:grid;place-items:center;background:radial-gradient(circle,color-mix(in srgb,var(--a) 30%,#000) 0,#050709 75%);border:2px solid var(--a);box-shadow:0 0 24px color-mix(in srgb,var(--a) 50%,transparent)}.bc-studio .st-screen img{width:70%;height:70%;object-fit:contain}
.bc-studio .st-desk{position:absolute;left:0;right:0;bottom:0;height:clamp(34px,7vh,52px);background:linear-gradient(180deg,#e9edf1 0,#b4bdc6 9%,#2a3037 10%,#12161a 100%);clip-path:polygon(4% 0,96% 0,100% 100%,0 100%);box-shadow:0 -2px 0 var(--a) inset;z-index:2}
.bc-studio .st-desk::after{content:"";position:absolute;left:10%;right:10%;top:34%;height:4px;background:var(--a);box-shadow:0 0 14px var(--a)}
.bc-studio .st-host{position:relative;display:flex;flex-direction:column;align-items:center;filter:brightness(.62) saturate(.8);transition:filter .25s,transform .25s;z-index:1}.bc-studio .st-host.talk{filter:none;transform:translateY(-3px)}
.bc-studio .st-host svg{width:clamp(120px,17vw,190px);height:auto;display:block}
.bc-studio .st-tags{position:absolute;left:0;right:0;bottom:-18px;z-index:3;display:flex;justify-content:space-around}.bc-studio .st-tags .tag{white-space:nowrap;background:#0b0f13e6;border-left:4px solid var(--a);padding:2px 10px}
.bc-studio .st-tags b{display:block;font-size:15px;letter-spacing:.06em;text-transform:uppercase}.bc-studio .st-tags small{display:block;font-size:11px;letter-spacing:.2em;color:var(--a);text-transform:uppercase}
.bc-studio .st-host .mo{transform-box:fill-box;transform-origin:center;transform:scaleY(.3)}.bc-studio .st-host.talk .mo{animation:bctalk .22s ease-in-out infinite alternate}
.bc-studio .st-host .ey{transform-box:fill-box;transform-origin:center;animation:bcblink 5s infinite}.bc-studio .st-host.b .ey{animation-delay:1.7s}
.bc-studio .st-say{width:min(680px,92%);display:flex;flex-direction:column;gap:8px;min-height:120px;margin-top:10px}
.bc-studio .st-say p{margin:0;padding:8px 14px;background:linear-gradient(90deg,#0b0f13f0,#0b0f13b0);border-left:4px solid var(--a);font-size:19px;line-height:1.25;font-weight:600;animation:bcin .5s both}.bc-studio .st-say p.b{border-left-color:#fff}
.bc-studio .st-say small{display:block;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--a);font-weight:800}
.bc-studio button{font:800 14px "Barlow Condensed",Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#0b0f13;background:var(--a);border:0;border-radius:4px;padding:9px 20px;cursor:pointer}
@keyframes bctalk{to{transform:scaleY(1.15)}}@keyframes bcblink{0%,95%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}@keyframes bcin{from{opacity:0;transform:translateY(24px) scale(.88)}}@keyframes bcpop{from{opacity:0;transform:scale(2.2) rotate(-10deg)}}
`;
  function css() { if (g.document.getElementById('bc-css')) return; const s = g.document.createElement('style'); s.id = 'bc-css'; s.textContent = CSS; g.document.head.appendChild(s); }

  function attach(o) {
    css();
    const mount = o.mount; if (!mount) throw new Error('Broadcast.attach: falta mount');
    if (g.getComputedStyle(mount).position === 'static') mount.style.position = 'relative';
    // Avisa al hub que hay un partido en curso (el hub silencia su música de fondo mientras dure).
    let flagged = false;
    const flag = (on) => { if (flagged === on) return; flagged = on; try { if (g.parent && g.parent !== g) g.parent.postMessage({ type: 'EM_MATCH', on }, '*'); } catch (e) { /* sin hub */ } };
    const layer = g.document.createElement('div'); layer.className = 'bc-layer'; layer.style.setProperty('--a', o.accent || '#f2a03a');
    // Arte de cada liga (assets/broadcast/art): fondo de la intro, set del estudio y chapa de las placas.
    if (/^(lbo|lgo|lro|llo)$/.test(o.id || '')) for (const [v, n] of [['--ibg', 'intro-' + o.id + '.jpg'], ['--sbg', 'studio-' + o.id + '.jpg'], ['--pbg', 'plate-' + o.id + '.png']]) layer.style.setProperty(v, `url("${ROOT}broadcast/art/${n}")`);
    layer.innerHTML = '<div class="bc-plate"><b></b><small></small></div>';
    mount.appendChild(layer);
    const plate = layer.querySelector('.bc-plate'), plates = PLATES[o.sport] || {};
    let plT = 0, introEl = null, studioEl = null, last = null, run = { team: -1, pts: 0 }, said = {};
    const logo = o.logo && !/^(https?:|data:|\/)/.test(o.logo) ? ROOT + o.logo : o.logo;

    const api = {
      layer, sport: o.sport,
      plate(title, sub, color) {
        plate.style.setProperty('--pc', color || o.accent || '#f2a03a'); plate.querySelector('b').textContent = title; plate.querySelector('small').textContent = sub || '';
        plate.classList.add('on'); clearTimeout(plT); plT = setTimeout(() => plate.classList.remove('on'), 2400);
      },
      // placa por tipo de evento (kind: clave de PLATES); d.plate / d.sub / d.color la personalizan
      event(kind, d = {}) {
        if (kind === 'final') flag(false);
        const now = Date.now(); if (said[kind] && now - said[kind] < 2500 && kind !== 'final') return; said[kind] = now;
        const title = d.plate || plates[kind]; if (title) api.plate(title, d.sub || d.p || '', d.color);
      },
      // Presentación previa. home/away: {name, short, primary, secondary, crest, sub}; lineups: [[{n,name,pos}], [..]]
      intro(c) {
        flag(true);
        api.removeIntro();
        const el = g.document.createElement('div'); el.className = 'bc-intro';
        const team = (t) => `<div class="tm" style="--tc:${esc(t.primary || '#3b6ea5')};--tc2:${esc(t.secondary || '#fff')}">${t.crest ? `<div class="cr"><img src="${esc(t.crest)}" alt=""></div>` : `<div class="cr sh">${shieldSVG(t)}</div>`}<b>${esc(t.name)}</b><small>${esc(t.sub || '')}</small></div>`;
        const lu = (l, t) => (l && l.length ? `<div><h5>${esc(t.short || t.name)}</h5>${l.slice(0, 11).map((x) => `<div><i>${esc(x.n == null ? '' : x.n)}</i>${esc(x.name)}${x.pos ? ` <small style="opacity:.6">${esc(x.pos)}</small>` : ''}</div>`).join('')}</div>` : '');
        el.innerHTML = `${logo ? `<img class="lg" src="${esc(logo)}" alt="">` : ''}<div class="comp">${esc(c.competition || o.league || '')}</div>
          <div class="vs">${team(c.home)}<span class="mid">${c.away ? 'VS' : ''}</span>${c.away ? team(c.away) : ''}</div>
          <div class="meta">${esc([c.date, c.venue].filter(Boolean).join(' · '))}</div>
          ${c.lineups ? `<div class="lines">${lu(c.lineups[0], c.home)}${lu(c.lineups[1], c.away)}</div>` : ''}
          <button type="button">Saltar ▶</button>`;
        layer.appendChild(el); introEl = el; requestAnimationFrame(() => el.classList.add('on'));
        let done = false;
        const finish = () => { if (done) return; done = true; clearTimeout(timer); api.removeIntro(); c.onDone && c.onDone(); };
        el.querySelector('button').onclick = finish;
        const timer = setTimeout(finish, c.ms || 8000);
        return { skip: finish };
      },
      removeIntro() { if (introEl) { introEl.remove(); introEl = null; } },
      // ESTUDIO: dos presentadores que comentan antes, en el entretiempo y al final. lines: [['A'|'B', texto], …] (solo texto).
      // kind: 'pre' | 'half' | 'post' (cambia el rótulo). Se cierra con «Continuar» o solo, al terminar las líneas.
      studio(c) {
        // en el descanso, después del estudio va la pausa comercial (una tanda de hasta 60 s: assets/broadcast/adbreak.js)
        if (c.kind === 'half' && !c._ads) { const done0 = c.onDone; c = Object.assign({}, c, { _ads: true, onDone: () => api.adBreak(done0) }); }
        api.removeStudio();
        const lines = (c.lines || []).filter((r) => r && r[1]);
        if (!lines.length) { c.onDone && c.onDone(); return { skip() {} }; }
        const tag = { pre: 'PREVIA', half: 'ENTRETIEMPO', post: 'POST-PARTIDO' }[c.kind] || (c.title || 'ESTUDIO');
        const el = g.document.createElement('div'); el.className = 'bc-studio';
        el.innerHTML = `<div class="st-top">${logo ? `<img src="${esc(logo)}" alt="">` : ''}<b>${esc(o.league || '')}</b><span>${esc(tag)}</span></div>
          <div class="st-set">${logo ? `<div class="st-screen"><img src="${esc(logo)}" alt=""></div>` : ''}<div class="st-host a">${hostSVG('A', o.accent || '#f2a03a')}</div><div class="st-desk"></div><div class="st-host b">${hostSVG('B', o.accent || '#f2a03a')}</div>
            <div class="st-tags"><div class="tag"><b>${esc(HOSTS.A.name)}</b><small>${esc(HOSTS.A.role)}</small></div><div class="tag"><b>${esc(HOSTS.B.name)}</b><small>${esc(HOSTS.B.role)}</small></div></div></div>
          <div class="st-say"></div><button type="button">Continuar ▶</button>`;
        layer.appendChild(el); studioEl = el; requestAnimationFrame(() => el.classList.add('on'));
        const say = el.querySelector('.st-say'), hosts = { A: el.querySelector('.st-host.a'), B: el.querySelector('.st-host.b') };
        let i = 0, done = false, t = 0;
        const finish = () => { if (done) return; done = true; clearTimeout(t); api.removeStudio(); c.onDone && c.onDone(); };
        const step = () => {
          if (done) return; const r = lines[i];
          if (!r) { t = setTimeout(finish, 2200); return; }
          hosts.A.classList.toggle('talk', r[0] !== 'B'); hosts.B.classList.toggle('talk', r[0] === 'B');
          const row = g.document.createElement('p'); row.className = r[0] === 'B' ? 'b' : 'a'; row.innerHTML = `<small>${esc(HOSTS[r[0] === 'B' ? 'B' : 'A'].name)}</small>${esc(r[1])}`; say.appendChild(row);
          while (say.children.length > 3) say.removeChild(say.firstChild);
          i++; t = setTimeout(step, c.ms || Math.max(3200, r[1].length * 55));
        };
        el.querySelector('button').onclick = finish; step();
        return { skip: finish };
      },
      removeStudio() { if (studioEl) { studioEl.remove(); studioEl = null; } },
      // Pausa comercial: carga (una vez) manifest.js + adbreak.js de los assets, emite la tanda sobre el partido y sigue con cb.
      adBreak(cb) {
        const go = () => { if (!g.LFOAds || !g.LFOAds.enabled()) return cb && cb(); g.LFOAds.play({ mount: layer, channel: o.league || 'LFO', onDone: cb }); };
        if (g.LFOAds) return go();
        const roots = [ROOT, '../assets/', 'assets/'].filter((x, i, a) => x != null && a.indexOf(x) === i);
        const load = (src) => new Promise((res) => { const t = g.document.createElement('script'); t.src = src; t.onload = () => res(true); t.onerror = () => res(false); g.document.head.appendChild(t); });
        (async () => { for (const r of roots) { if (await load(r + 'videocomerciales/manifest.js') && await load(r + 'broadcast/adbreak.js')) break; } go(); })();
      },
      // Estado del partido (se llama seguido): detecta puntos, cambios de líder, rachas y el final → solo placas gráficas
      tick(s) {
        if (!s || !s.scores) return;
        flag(s.phase !== 'final');
        const sc = s.scores, nm = s.names || ['Local', 'Visitante'];
        const sTxt = `${nm[0]} ${sc[0]} - ${sc[1]} ${nm[1]}`;
        if (last) {
          for (const t of [0, 1]) {
            const d = sc[t] - last.scores[t];
            if (d > 0) {
              const color = (s.colors || [])[t], who = (s.scorer && s.scorer[t]) || nm[t];
              const kind = o.sport === 'basquet' ? (d >= 3 ? 'score3' : '') : o.sport === 'nfl' ? (d >= 6 ? 'touchdown' : d === 3 ? 'fieldgoal' : d === 2 ? 'safety' : '') : '';
              if (kind) api.event(kind, { p: who, sub: nm[t], color });
              if (o.sport === 'basquet') { if (run.team === t) run.pts += d; else run = { team: t, pts: d }; if (run.pts >= 8 && run.pts - d < 8) api.event('run', { color, plate: 'RACHA ' + run.pts + '-0', sub: nm[t] }); }
              const lead = sc[0] > sc[1] ? 0 : sc[1] > sc[0] ? 1 : -1, was = last.scores[0] > last.scores[1] ? 0 : last.scores[1] > last.scores[0] ? 1 : -1;
              if (lead >= 0 && was >= 0 && lead !== was) api.event('lead', { color: (s.colors || [])[lead], sub: nm[lead] });
            }
          }
          if (s.phase === 'final' && last.phase !== 'final') { const w = sc[0] >= sc[1] ? 0 : 1; flag(false); api.event('final', { sub: sTxt, color: (s.colors || [])[w] }); }
        }
        last = { scores: sc.slice(), period: s.period, phase: s.phase };
      },
      reset() { flag(false); last = null; run = { team: -1, pts: 0 }; said = {}; api.removeIntro(); api.removeStudio(); plate.classList.remove('on'); },
      dispose() { api.reset(); layer.remove(); },
    };
    return api;
  }

  g.Broadcast = { attach, HOSTS, get base() { return ROOT; }, setBase(b) { ROOT = String(b).replace(/\/?$/, '/'); } };
})(window);
