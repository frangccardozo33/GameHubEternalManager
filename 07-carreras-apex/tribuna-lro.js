'use strict';
// TRIBUNA LRO: álbum de cromos de pilotos (assets/tribuna/tribuna.js). Cada piloto del campeonato es un cromo; la edición sale del rating.
(function () {
  if (!window.Tribuna) return;
  const N = window.LFONations;
  const hex = (n) => '#' + (n >>> 0).toString(16).padStart(6, '0').slice(-6);
  const nationName = (code) => { const n = N && N.list.find((x) => x.code === code); return n ? n.name : code; };
  const LABELS = [['Velocidad punta', 'VEL'], ['Aceleración', 'ACE'], ['Frenada', 'FRE'], ['Paso por curva', 'CUR'], ['Control', 'CTL'], ['Adelantamiento', 'ADE']];
  const ALL = ['Velocidad punta', 'Aceleración', 'Frenada', 'Paso por curva', 'Control', 'Agresividad', 'Consistencia', 'Adelantamiento'];
  Tribuna.register({
    id: 'lro', title: 'Tribuna LRO', sport: 'carreras', accent: '#ff4b3e', logo: 'logos/lro-sm.png', tiers: Tribuna.tiersWith([0, 60, 70, 78, 84, 90]), statLabels: LABELS, drawFront,
    getCards() {
      const c = typeof Career !== 'undefined' ? Career : null; if (!c) return [];
      return c.driversPool.map((d) => cardOf(c, d));
    },
  });
  // Un piloto = una carta, con el MISMO diseño que la ficha del Mercado y de Pilotos (fondo azul, retrato del módulo sobre el color del equipo,
  // rating dorado, nacionalidad, número y stats): se dibuja acá porque el álbum de la Tribuna trabaja con canvas.
  function cardOf(c, d) {
        const team = c.teams.find((t) => t.id === d.teamId) || c.teams.find((t) => t.driverIds.includes(d.id));
        const stats = {}; ALL.forEach((k, i) => { stats[k] = Math.round((d.stats[i] || 0) * 100); });
        return { id: 'lro-' + d.id, name: d.name, number: d.number, pos: 'PIL', posName: 'Piloto', ovr: d.rating, age: d.age, skin: (d.id * 7) % 5,
          team: { id: team ? team.id : 'libre', name: team ? team.name : 'Sin equipo', short: team ? team.name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase() : 'LIB', primary: hex(team ? team.color : d.color), secondary: d.accent || '#f3f0e6' },
          nation: nationName(d.nationality), stats, _d: d,
          portrait: typeof RacingArt !== 'undefined' ? RacingArt.portrait(d) : undefined,
          info: [['Edad', d.age + ' años'], ['Perfil', String(d.personality || '').toLowerCase()], ['Salario', '$' + (d.salary || 0).toLocaleString('es-AR')], ['Valor', '$' + (d.marketValue || 0).toLocaleString('es-AR')]] };
  }
  const imgCache = new Map();
  const loadImg = (src) => imgCache.get(src) || (imgCache.set(src, new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; })), imgCache.get(src));
  const rrect = (x, y, w, h, r, ctx) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  const money = (n) => '$' + (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : Math.round(n));
  async function drawFront(cv, card) {
    const d = card._d; if (!d) return false;
    const W = 600, H = 840, ctx = cv.getContext('2d'), rc = '#' + (d.color >>> 0).toString(16).padStart(6, '0').slice(-6);
    const MONO = "'IBM Plex Mono',monospace", DISP = "'Barlow Condensed',Impact,sans-serif";
    cv.width = W; cv.height = H; ctx.clearRect(0, 0, W, H);
    ctx.save(); rrect(2, 2, W - 4, H - 4, 6, ctx); ctx.clip();
    const bg = ctx.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#1b2d45'); bg.addColorStop(1, '#10192a'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // retrato: caja sobre el color del equipo con la imagen del piloto recortada como en el Mercado (160 % de ancho, centrada)
    const PH = 560; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, PH); ctx.clip();
    const rg = ctx.createRadialGradient(W / 2, PH * 0.6, 0, W / 2, PH * 0.6, W * 0.85); rg.addColorStop(0, rc); rg.addColorStop(0.8, '#162940'); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, PH);
    ctx.strokeStyle = 'rgba(255,255,255,.03)'; ctx.lineWidth = 8; for (let x = -PH; x < W + PH; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + PH * 0.84, PH); ctx.stroke(); }
    const img = card.portrait ? await loadImg(card.portrait) : null;
    if (img) { ctx.save(); ctx.filter = 'drop-shadow(0 12px 18px rgba(0,0,0,.35))'; ctx.drawImage(img, -W * 0.3, PH + 30 - PH * 1.15, W * 1.6, PH * 1.15); ctx.restore(); }
    ctx.restore();
    ctx.fillStyle = rc; ctx.fillRect(0, 0, W, 10); // borde superior del color del equipo
    ctx.textBaseline = 'alphabetic';
    ctx.font = `italic 800 150px ${DISP}`; ctx.fillStyle = 'rgba(255,255,255,.42)'; ctx.textAlign = 'right'; ctx.fillText(String(d.number), W - 30, 150);
    ctx.textAlign = 'left'; ctx.font = `italic 900 104px ${DISP}`; ctx.fillStyle = '#fadc7c'; ctx.fillText(String(d.rating), 32, 118);
    ctx.font = `600 20px ${MONO}`; ctx.fillStyle = '#e5e1c7'; ctx.fillText('RTG', 36, 148);
    const nat = String(d.nationality || '').toUpperCase(); ctx.font = `700 20px ${MONO}`; const nw = ctx.measureText(nat).width + 26;
    ctx.fillStyle = 'rgba(16,28,47,.8)'; ctx.fillRect(30, PH - 60, nw, 36); ctx.fillStyle = '#7ccbf1'; ctx.fillRect(30, PH - 60, 5, 36); ctx.fillStyle = '#fff'; ctx.fillText(nat, 46, PH - 35);
    // ficha
    ctx.fillStyle = '#0e192c'; ctx.fillRect(0, PH, W, H - PH);
    ctx.fillStyle = '#eef4ff'; ctx.font = `italic 800 58px ${DISP}`; ctx.fillText(String(d.name).toUpperCase(), 40, PH + 76, W - 80);
    ctx.fillStyle = '#94a9c5'; ctx.font = `500 19px ${MONO}`; ctx.fillText(`${d.nationality} · ${d.age} años · ${d.personality} · Rating ${d.rating}`, 40, PH + 116, W - 80);
    const S = [[Math.round(d.stats[0] * 100), 'TOP'], [Math.round(d.stats[3] * 100), 'CURVA'], [Math.round(d.stats[5] * 100), 'AGR.'], [Math.round(d.stats[6] * 100), 'REG.'], [money(d.salary || 0), 'SALARIO']];
    S.forEach(([v, l], i) => { const x = 40 + i * ((W - 80) / 5); ctx.fillStyle = '#e9f3ff'; ctx.font = `700 46px ${DISP}`; ctx.fillText(String(v), x, PH + 190); ctx.fillStyle = '#8eacc8'; ctx.font = `500 16px ${MONO}`; ctx.fillText(l, x, PH + 218); });
    ctx.restore();
    ctx.strokeStyle = rc; ctx.lineWidth = 3; rrect(2, 2, W - 4, H - 4, 6, ctx); ctx.stroke();
    return true;
  }
  window.LROCards = { cardOf: (d) => cardOf(Career, d) };
  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('mainnav'); if (!nav) return;
    const b = document.createElement('button'); b.textContent = 'TRIBUNA'; b.dataset.tribuna = '1'; b.onclick = () => Tribuna.open('lro'); nav.appendChild(b);
  });
})();
