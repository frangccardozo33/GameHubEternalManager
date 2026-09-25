'use strict';
// TRIBUNA LLO: álbum de cromos de peleadores (assets/tribuna/tribuna.js). La edición sale del OVR (promedio de atributos).
(function () {
  if (!window.Tribuna) return;
  const N = window.LFONations;
  const NAMES = { accuracy: 'Precisión', defense: 'Defensa', power: 'Potencia', speed: 'Velocidad', wrestling: 'Wrestling', grappling: 'Grappling', cardio: 'Cardio', initiative: 'Iniciativa', intelligence: 'Inteligencia', chin: 'Resistencia' };
  const DIV = { feather: 'Pluma', light: 'Ligero', welter: 'Wélter' };
  const hue = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h % 360; };
  const hsl = (h, l) => `hsl(${h} 58% ${l}%)`;
  const nationName = (code) => { const n = N && N.list.find((x) => x.code === code); return n ? n.name : code; };
  Tribuna.register({
    id: 'llo', title: 'Tribuna LLO', sport: 'mma', accent: '#d9463b', logo: 'logos/llo-sm.png', tiers: Tribuna.tiersWith([0, 60, 68, 72, 77, 83]),
    statLabels: [['Potencia', 'POT'], ['Velocidad', 'VEL'], ['Precisión', 'PRE'], ['Wrestling', 'WRE'], ['Grappling', 'GRA'], ['Cardio', 'CAR']],
    getCards() {
      const c = window.__llo && window.__llo.career; if (!c) return [];
      const s = c.state;
      return s.fighters.filter((f) => !f.retired).map((f) => cardOf(s, f));
    },
  });
  // Un peleador = una carta: la misma en la ficha del peleador y en la Tribuna.
  function cardOf(s, f) {
        const vals = Object.values(f.attributes), ovr = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length), gym = f.gym || (s.roster.includes(f.id) ? 'Tu gimnasio' : 'Agente libre'), h = hue(gym);
        const stats = {}; Object.keys(NAMES).forEach((k) => { if (f.attributes[k] != null) stats[NAMES[k]] = Math.round(f.attributes[k]); });
        return { id: 'llo-' + f.id, name: f.firstName + ' ' + f.lastName, number: null, pos: (DIV[f.division] || f.division).slice(0, 3).toUpperCase(), posName: 'Peso ' + (DIV[f.division] || f.division).toLowerCase(), ovr, age: f.age, skin: typeof f.skin === 'number' ? f.skin : (parseInt(String(f.skin).slice(-1), 16) || 0) % 5,
          team: { id: gym, name: gym, short: gym.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase(), primary: hsl(h, 38), secondary: hsl((h + 180) % 360, 88) },
          nation: nationName(f.country), stats,
          portrait: window.__llo && window.__llo.portrait ? window.__llo.portrait(f) : undefined,
          info: [['Apodo', '“' + f.nickname + '”'], ['Récord', f.record.wins + '–' + f.record.losses + '–' + f.record.draws], ['Estilo', String(f.style)], ['Potencial', f.potential]] };
  }
  const paint = () => document.querySelectorAll('.llo-cardslot:not([data-done])').forEach(async (el) => {
    const c = window.__llo && window.__llo.career, f = c && c.state.fighters.find((x) => x.id === el.dataset.fid); if (!f) return; el.dataset.done = '1';
    try { const cv = await Tribuna.cardCanvas('llo', cardOf(c.state, f)); el.classList.add('carded'); el.innerHTML = `<img class="llo-card" alt="Carta de ${f.firstName} ${f.lastName}" src="${cv.toDataURL('image/png')}">`; } catch (e) { /* queda el retrato simple */ }
  });
  new MutationObserver(() => paint()).observe(document.documentElement, { childList: true, subtree: true });
  window.LLOCards = { paint };
})();
