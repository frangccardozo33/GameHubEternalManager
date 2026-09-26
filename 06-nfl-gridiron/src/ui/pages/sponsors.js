// Patrocinios LGO: pestaña del modo carrera. El panel lo aporta la capa común (assets/common/em-common.js), sólo dentro del hub.
export const sponsorPages = [{
  id: 'sponsors', title: 'Patrocinios', icon: '★',
  render() { return '<h1 class="page-title">Patrocinios</h1><p class="muted" style="margin:0 0 12px">Contratos, ingresos por partido y ajustes de la transmisión.</p><div id="em-sp-host"></div>'; },
  after() { const el = document.getElementById('em-sp-host'); if (!el) return; if (window.EM && EM.sponsors) EM.sponsors.mount(el); else el.innerHTML = '<p class="muted">Los patrocinios están disponibles al jugar dentro de Eternal Manager.</p>'; },
}];
