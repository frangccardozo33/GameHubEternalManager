// Tribuna LGO: álbum de cromos de todos los jugadores de la liga (assets/tribuna/tribuna.js). La edición sale del OVR.
import '../../../../assets/nations/nations.js';
import '../../../../assets/tribuna/tribuna.js';
import { KEY_ATTRS, LABELS, POS_NAMES } from '../../manager/constants.js';
import { esc } from '../kit.js';

let registered = false;
function register(app) {
  if (registered || !window.Tribuna) return;
  registered = true;
  try {
    window.LFONations.setBase(new URL('../../assets/nations/', location.href).href);   // dist-single/index.html -> assets/
    window.Tribuna.setBase(new URL('../../assets/', location.href).href);
  } catch (e) { /* sin base: se usa la del script */ }
  window.Tribuna.register({
    id: 'lgo', title: 'Tribuna LGO', sport: 'nfl', accent: '#5ec98a', logo: 'logos/lgo-sm.png', tiers: window.Tribuna.tiersWith([0, 58, 66, 74, 82, 90]),
    statLabels: [],   // se completa por jugador (cada posición tiene sus atributos clave)
    getCards() {
      const lg = app.lg; if (!lg) return [];
      const d = lg.data;
      return Object.values(d.players).filter(p => !p.retired).map(p => {
        const t = p.teamId != null ? d.teams[p.teamId] : null, keys = (KEY_ATTRS[p.pos] || []).slice(0, 6), stats = {};
        Object.keys(p.ratings || {}).forEach(k => { stats[LABELS[k] || k] = Math.round(p.ratings[k]); });
        return { id: 'lgo-' + p.id, name: p.name, number: p.number || null, pos: p.pos, posName: POS_NAMES[p.pos], ovr: p.ovr, age: p.age, skin: (String(p.id).length * 3 + p.age) % 5,
          team: t ? { id: t.id, name: t.name, short: t.short, primary: t.color, secondary: t.dark } : { id: 'libre', name: 'Agente libre', short: 'LIB', primary: '#5b6673', secondary: '#e8edf2' },
          nation: window.LFONations.forPerson(p.id, t ? t.short : 'libre'), statLabels: keys.map(k => [LABELS[k] || k, (LABELS[k] || k).replace(/[^A-Za-zÁÉÍÓÚáéíóú ]/g, '').slice(0, 4).toUpperCase()]), stats,
          info: [['Edad', p.age + ' años'], ['Potencial', p.potential], ['Contrato', p.contract ? `${p.contract.salary ?? p.contract.amount ?? '?'} M · ${p.contract.years ?? '?'} años` : 'sin contrato']] };
      });
    },
  });
}

export const tribunaPages = [{
  id: 'tribuna', title: 'Tribuna', icon: '★',
  render(app) {
    register(app);
    return `<h1 class="page-title">Tribuna</h1><div class="card"><p>Álbum de cromos de toda la liga: cada jugador tiene su carta, con la bandera de su nación, el escudo de su equipo y una edición según su nivel.</p><p><button class="btn primary" data-act="tribuna-open">Abrir el álbum</button></p></div>`;
  },
  after(app) { register(app); document.querySelector('[data-act="tribuna-open"]')?.addEventListener('click', () => window.Tribuna.open('lgo')); window.Tribuna.open('lgo'); },
}];
void esc;
