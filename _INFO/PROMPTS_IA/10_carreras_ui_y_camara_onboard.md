# LRO · Rehacer la UI de la transmisión de carreras y la cámara a bordo

Encargo de **código** (HTML/CSS/JS + three.js r15x) para una IA con acceso al repo (Claude Opus 5.5 en la nube). No toca la simulación ni las reglas:
sólo la capa visual de la pantalla «Race Center» y la vista de cabina.

## Contexto común
«Trabajás en el repo `GameHubEternalManager`. El módulo es `07-carreras-apex/` (LRO). Todo es JS clásico sin bundler (scripts en `index.html`,
scope global compartido; three.js viene en `vendor/three.min.js`). Reglas:
1. **Nada de logos/marcas reales**; usá los sponsors ficticios (`EM.sponsorLogo`, `assets/common/em-common.js`, lista `CAT`).
2. **Rendimiento**: 55 fps en un portátil sin GPU dedicada y 30 fps en un teléfono de gama media. La escena ya pasa por un post-proceso (`lro-post.js`); no lo dupliques.
3. **Móvil**: `assets/common/em-mobile.js` aplica una escala global del 75 % en teléfonos y expone las clases `em-touch em-narrow em-portrait em-land` en `<html>`. Todo lo que hagas tiene que verse bien en 390×844 vertical y 844×390 horizontal, con zonas seguras (`--em-sat/sar/sab/sal`).
4. **No romper** los ids que usa `engine.js` / `lro-extras.js` / `lro-cams.js` (`standings`, `lap-display`, `camera-label`, `onboard-hud`, `hud-speed`, `hud-state`, `start-lights`, `event-overlay`, `minimap`, `[data-camera]`, `start-button`…). Si renombrás algo, actualizá a sus consumidores.
5. **Entrega**: sólo los archivos listados; comprobá que la carrera arranca, termina y que no hay errores en consola.»

## Archivos
`07-carreras-apex/index.html` (bloque `<section class="broadcast">` y su CSS en línea), `motorsport.css`, `lro-mobile.css`, `broadcast-lro.js`, `lro-cams.js` (cabina `cock`, `cockCam`, `PIP`),
`lro-extras.js` (tiempos, orden), `assets/broadcast/broadcast.js` (placas de TV compartidas).

## Parte A · UI de la carrera («timing tower», placas, controles)
**Estado actual.** Torre de tiempos flotante a la izquierda, logo/`camera-indicator`/mapa/PiP apilados a la derecha, botones de cámara abajo. En pantallas
chicas se solapan (torre + PiP + mapa + HUD) y en vertical la torre tapa media escena.
**Pedido:**
1. **Torre de posiciones estilo TV real** (referencia: transmisión de Turismo Carretera / F1): barra **horizontal superior** con posición, número en caja de color del equipo, apellido en mayúsculas, marca/escudo del equipo y diferencia (+0,767). Paginada de a 8–12 pilotos con rotación automática cada ~6 s y el líder fijo; el piloto en foco resaltado. Placa de la izquierda con nombre de la serie, vuelta «5/25» y bandera de estado (verde/amarilla/roja/SC/VSC). En vertical: dos filas o una columna delgada de 6 pilotos, nunca más del 22 % del alto.
2. **Placas de eventos** (adelantamiento, mejor vuelta, boxes, trompo, bandera) con animación de entrada/salida coherente y cola (no se pisan; máx. 2 visibles).
3. **Jerarquía y zonas seguras**: nada de la UI se superpone entre sí ni con el auto en foco (zona central protegida). Definí una grilla de anclajes (top-left/top-right/bottom-*) y que cada elemento (logo, mapa, PiP, HUD, cámara) use una.
4. **Controles de cámara** como barra compacta con iconos (auto/circuito/persecución/a bordo/FX) y atajos de teclado visibles; en móvil se colapsa en un solo botón que abre una hoja. El botón `FX TV` (`[data-fx]`, lo agrega `lro-post.js`) tiene que conservarse.
5. **Mapa** de circuito más pequeño y legible (puntos con número, líder resaltado), ocultable.
6. Respetar el modo **horizontal en teléfono** (`em-land`): ya existe `.em-live-land` que oculta la barra inferior del módulo.

## Parte B · Cámara a bordo (cabina)
**Estado actual.** `mode==='onboard'` en `engine.js → updateCamera` pone la cámara pegada al auto (fov 74) y `lro-cams.js` dibuja encima una cabina simple (`cock`, `cockCam`) con volante, tablero y marcha; el HUD es un texto suelto `#onboard-hud` (velocidad y estado).
**Pedido:**
1. **Cabina creíble por categoría** (turismo/GT/monoplaza según `CURRENT_TRACK`/serie): volante que gira con la curva (`cock$.steer`), manos de piloto, pantalla de datos con velocidad, marcha, RPM en barra de leds, vuelta, posición, gap al de adelante/atrás, temperatura y desgaste de neumáticos, aviso de rebufo y de bandera. Retrovisores con un pequeño render real de la cámara trasera (aprovechar el `pcam[1]` del PiP «trasera»).
2. **Movimiento de cámara**: vibración por velocidad y curbs, inclinación (roll) en curva, cabeceo al frenar/acelerar, leve zoom (fov) con la velocidad, «head-look» hacia el vértice de la curva; todo suavizado y desactivable (accesibilidad: opción «reducir movimiento»).
3. **Sin bloques ni cortes**: el parabrisas, el capó visible y el marco de la cabina no deben recortar la visión ni mostrar vacíos; en la vista a bordo desaparece el PiP de «trasera» (ya lo hace) pero los retrovisores lo reemplazan.
4. **Cabina dibujada después del post-proceso** (así queda nítida mientras el fondo lleva motion blur): `lro-cams.js` ya renderiza `cock` con `origRender` tras la escena principal. Mantené ese orden.
5. **Móvil**: en vertical se muestra el volante recortado y el tablero grande arriba; en horizontal, la cabina completa. Toques: doble toque para cambiar de piloto en foco.
6. Mientras se está a bordo, el `#onboard-hud` actual se reemplaza por el tablero de cabina (sin duplicar información con la torre de tiempos).

## Cómo verificar
1. Abrí `07-carreras-apex/index.html`, entrá a Race Center y arrancá una carrera a velocidad ×1 y ×4.
2. Recorré las 5 cámaras; en cada una, mirá que ningún elemento de UI se pise ni tape el auto en foco.
3. Repetí en 390×844, 844×390 y 1920×1080.
4. Forzá un adelantamiento, un trompo y una parada en boxes: las placas no se solapan.
5. Consola sin errores; `npm test` (si aplica) sin cambios.
