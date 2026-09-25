/* LFO MANAGER — VESTUARIO: elegí qué música de gol y qué celebración usa tu equipo en cada situación.
   Los ítems se compran en la Tienda Diaria del hub (fuera de este archivo); acá solo se equipan.
   Los 3 espacios (mismo orden que usa el motor en tlOnGoal): 0=normal, 1=últimos 5 minutos, 2=a partir del 4º gol. */
(function (g) {
  'use strict';
  const TLM = g.TLM, UI = TLM.UI; if (!UI) return;
  const esc = UI.esc;
  const A = UI.actions;
  const SITUATIONS = [
    { slot: 0, label: 'Situación normal', desc: 'El resto de los goles.' },
    { slot: 1, label: 'Últimos 5 minutos', desc: 'Gol marcado a partir del minuto 85.' },
    { slot: 2, label: 'A partir del 4º gol', desc: 'Cuando tu equipo llega a 4 goles o más en el partido.' },
  ];
  let cache = null, loading = true;

  function refresh() {
    if (!g.Touchline) { loading = false; return; }
    g.Touchline.getCosmetics().then((r) => {
      loading = false;
      if (r && r.ok && r.cosmetics) cache = r.cosmetics;
      if (UI.screen === 'wardrobe') UI.render();
    });
  }
  if (g.Touchline) {
    g.Touchline.onCosmetics((c) => { cache = c; if (UI.screen === 'wardrobe') UI.render(); });
    refresh();
  } else {
    loading = false;
  }

  function slotPicker(type, slot) {
    const K = { music: ['ownedMusic', 'equipMusic', 'catalogMusic'], cel: ['ownedCel', 'equipCel', 'catalogCel'], gfx: ['ownedGfx', 'equipGfx', 'catalogGfx'] }[type];
    const owned = cache[K[0]] || [];
    const catalog = cache[K[2]] || [];
    const current = (cache[K[1]] || [])[slot];
    const options = [`<option value="">${type === 'gfx' ? 'Ninguno' : 'Aleatorio (como siempre)'}</option>`].concat(
      owned.map((id) => {
        const it = catalog.find((x) => x.id === id);
        return it ? `<option value="${esc(id)}" ${current === id ? 'selected' : ''}>${esc(it.title)}</option>` : '';
      })
    );
    return `<select data-chg="wardrobeEquip" data-wtype="${type}" data-wslot="${slot}">${options.join('')}</select>`;
  }

  UI.screens.wardrobe = () => {
    if (!g.Touchline) {
      return `<h2 class="tlm-h">Vestuario</h2><p class="muted">La personalización de festejos solo está disponible cuando este módulo corre dentro del hub.</p>`;
    }
    if (loading || !cache) {
      return `<h2 class="tlm-h">Vestuario</h2><p class="muted">Cargando tu colección…</p>`;
    }
    const musicOwnedCount = cache.ownedMusic.length, celOwnedCount = cache.ownedCel.length, gfxOwnedCount = (cache.ownedGfx || []).length;
    return `<h2 class="tlm-h">Vestuario</h2>
    <p class="muted">Elegí qué música de gol y qué celebración usa tu equipo en cada situación. Comprá más ítems en la <b>Tienda Diaria</b> del hub (se renueva a medianoche y al mediodía).</p>
    <section class="tlm-panel wide"><h3>Música de gol <small>(${musicOwnedCount} en tu colección)</small></h3>
      <table class="tlm-table"><tbody>${SITUATIONS.map((s) => `<tr><td><b>${esc(s.label)}</b><br><small class="muted">${esc(s.desc)}</small></td><td>${slotPicker('music', s.slot)}</td></tr>`).join('')}</tbody></table>
      ${musicOwnedCount === 0 ? '<p class="muted">Todavía no compraste ninguna canción: se sigue usando la selección aleatoria de siempre.</p>' : ''}
    </section>
    <section class="tlm-panel wide"><h3>Celebración <small>(${celOwnedCount} en tu colección)</small></h3>
      <table class="tlm-table"><tbody>${SITUATIONS.map((s) => `<tr><td><b>${esc(s.label)}</b><br><small class="muted">${esc(s.desc)}</small></td><td>${slotPicker('cel', s.slot)}</td></tr>`).join('')}</tbody></table>
      ${celOwnedCount === 0 ? '<p class="muted">Todavía no compraste ninguna celebración: se sigue usando la celebración aleatoria de siempre.</p>' : ''}
    </section>
    <section class="tlm-panel wide"><h3>Efecto de gol <small>(${gfxOwnedCount} en tu colección)</small></h3>
      <p class="muted sm">Sale del balón en el punto donde entra cuando tu equipo marca.</p>
      <table class="tlm-table"><tbody>${SITUATIONS.map((s) => `<tr><td><b>${esc(s.label)}</b><br><small class="muted">${esc(s.desc)}</small></td><td>${slotPicker('gfx', s.slot)}</td></tr>`).join('')}</tbody></table>
      ${gfxOwnedCount === 0 ? '<p class="muted">Todavía no compraste ningún efecto: los goles salen sin efecto especial.</p>' : ''}
    </section>`;
  };

  A.wardrobeEquip = (el) => {
    if (!g.Touchline || !cache) return;
    const type = el.dataset.wtype, slot = Number(el.dataset.wslot), id = el.value || null;
    g.Touchline.equipCosmetic(type, slot, id).then((r) => {
      if (r && r.ok && r.cosmetics) cache = r.cosmetics;
      UI.render();
    });
  };
})(window);
