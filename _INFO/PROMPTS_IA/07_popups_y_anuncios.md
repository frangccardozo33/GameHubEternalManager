# Pop-ups de transmisión y anuncios: prompts para la IA de arte

Contexto: `01-futbol/lfoskin/lfo-popups.js` dibuja paneles animados en CSS durante el partido (GOLES, TARJETAS, CAMBIOS, TABLA, ESTADÍSTICAS,
FIGURA, GOLEADORES, ESTADIO Y PÚBLICO, TIEMPO AGREGADO, cartel del cobrador, aviso de tarjeta, banners de anunciante). Todo funciona sin imágenes;
estas piezas sólo mejoran el acabado. Tamaños y nombres: `01-futbol/lfoskin/CUPIDITE_PLACEHOLDERS.md` (sección «Pop-ups») y `lfoskin/popups/README.md`.

## Base común (pegar antes de cada prompt)
«Gráfica de transmisión deportiva de TV, estilo de los años 2010 (paneles de vidrio oscuro con biseles y reflejos), sin texto, sin logos reales,
sin personas, fondo transparente PNG, bordes limpios de 24 px, centro despejado para texto blanco.»

## La Cupidité (esmeralda `#27D468` sobre negro `#050807`, facetas de diamante)
1. `pop-panel-bg.png` 700×420 — «panel vertical oscuro, marco metálico gris con filo esmeralda brillante, trama sutil de facetas de diamante, esquina superior izquierda más clara».
2. `pop-title-bg.png` 700×70 — «barra horizontal esmeralda con degradé de `#0A3020` a `#27D468`, bisel superior brillante, facetas de diamante tenues, extremo derecho en diagonal».
3. `pop-card-bg.png` 720×220 — «placa horizontal negra con marco esmeralda; espacio libre a la izquierda para un rectángulo que cae; halo tenue».
4. `pop-nameplate-bg.png` 800×120 — «placa baja y ancha, negra con filo esmeralda, una franja diagonal a la izquierda».
5. `pop-added-bg.png` 260×260 — «marco de panel electrónico del cuarto árbitro: negro, bordes esmeralda, leds apagados en las esquinas, centro oscuro liso».
6. `pop-sponsor-bg.png` 900×160 — «banner ancho negro-verdoso con degradé lateral, filo esmeralda inferior, una esquina inferior derecha doblada».
7. `pop-venue-bg.png` 900×110 — «franja baja oscura con filo esmeralda y facetas muy tenues».

## Anunciantes (logos, `lfoskin/popups/sponsors/<id>.png`, 400×300, fondo transparente)
- `lfoplay`: «isotipo de un botón de play dentro de un círculo azul, moderno».  - `bancoeterno`: «símbolo de infinito en verde, sobrio».
- `aerovia`: «ala estilizada celeste».  - `arena`: «gota de energía naranja con destello».  - `diamantepay`: «diamante tallado esmeralda con una D».

## Videos
Los comerciales reales van en `assets/videocomerciales/` (ver el LEEME de esa carpeta). No hace falta generar nada más.
