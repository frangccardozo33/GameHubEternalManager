/* LFO · Cosméticos de festejo (Tienda Diaria de Touchline).
   Traduce lo que el jugador compró/equipó en el hub (window.Touchline.getCosmetics())
   a decisiones síncronas para celebration.js (música) y el motor de gol (celebration.js
   pide la canción, engine.js — dentro de fulbo.html — pide la variante de animación).
   Todo queda cacheado localmente porque el postMessage con el hub es asíncrono y el
   gol necesita una decisión inmediata; el caché se refresca solo con cada broadcast
   del hub y al comprar/equipar desde el vestuario.
   Situaciones (mismo orden que los 3 slots del vestuario):
     0 = normal (el resto de los goles)
     1 = últimos 5 minutos de partido
     2 = a partir del 4º gol del equipo en el partido
   Si hay empate de situaciones (p. ej. gol tardío que además es el 4º), "últimos 5
   minutos" tiene prioridad sobre "4º gol o más". */
(function (g) {
  'use strict';
  if (typeof g.Touchline === 'undefined') { g.LFOCosmetics = null; return; }

  const SLOT = { normal: 0, late: 1, blowout: 2 };
  let cache = null;

  function findMusic(id) {
    if (!cache || !id) return null;
    const item = (cache.catalogMusic || []).find((x) => x.id === id);
    return item ? { file: item.file, title: item.title } : null;
  }
  function findVariant(id) {
    if (!cache || !id) return null;
    const item = (cache.catalogCel || []).find((x) => x.id === id);
    return item ? item.variant : null;
  }

  g.Touchline.onCosmetics((c) => { cache = c; });
  g.Touchline.getCosmetics().then((r) => { if (r && r.ok && r.cosmetics) cache = r.cosmetics; });

  g.LFOCosmetics = {
    // usado por celebration.js al elegir el tema de festejo
    pickSong(situation) {
      if (!cache) return null;
      const slot = SLOT[situation] != null ? SLOT[situation] : 0;
      return findMusic(cache.equipMusic && cache.equipMusic[slot]);
    },
    // usado por goalfx.js: id del efecto de gol equipado para la situación (o null)
    pickGoalFx(situation) {
      if (!cache) return null;
      const slot = SLOT[situation] != null ? SLOT[situation] : 0;
      const id = cache.equipGfx && cache.equipGfx[slot];
      const item = id && (cache.catalogGfx || []).find((x) => x.id === id);
      return item ? item.fx : null;
    },
    // usado por el motor (tlOnGoal) al elegir la animación de festejo
    pickVariant(situation) {
      if (!cache) return null;
      const slot = SLOT[situation] != null ? SLOT[situation] : 0;
      return findVariant(cache.equipCel && cache.equipCel[slot]);
    },
    refresh() { g.Touchline.getCosmetics().then((r) => { if (r && r.ok && r.cosmetics) cache = r.cosmetics; }); },
  };
})(window);
