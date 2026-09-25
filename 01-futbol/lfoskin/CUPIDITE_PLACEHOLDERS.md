# La Cupidité — gráficas de transmisión: qué es placeholder y qué hay que rellenar

Para la IA (o el diseñador) que haga las gráficas. Todo lo que se ve hoy en los partidos de La Cupidité sale del paquete
`data-lfo-pkg="cupidite"` (CSS en `lfoskin/cupidite.css`, lógica en `lfoskin/lfo-broadcast.js`). Se activa solo cuando el
partido del manager es de la copa y vuelve al paquete de la liga (COPA ONLINE) al salir.
Para probarlo a mano, en la consola del navegador: `LFOBroadcast.pushPackage('cupidite')` y `LFOBroadcast.popPackage()`.

## Marca (definitiva)
Tomada del *Brand Identity Guide* que pasó el usuario. Los cuatro archivos de `../equiposfut/cupidite/` se recortaron de esa
imagen (fondo negro quitado) y **son de baja resolución: conviene rehacerlos en vector/PNG grande**, con el mismo nombre.

| Archivo | Contenido | Tamaño actual | Tamaño recomendado |
|---|---|---|---|
| `equiposfut/cupidite/logo.png` | trofeo-diamante + «LFO» + nombre + lema | 1157×1033 | 2400×2143, fondo transparente |
| `equiposfut/cupidite/icon.png` | solo el trofeo-diamante | 551×1033 | 1200×2250, fondo transparente |
| `equiposfut/cupidite/wordmark.png` | solo «LA CUPIDITÉ» | 1442×215 | 3000×450, fondo transparente |
| `equiposfut/cupidite/motto.png` | «Ad astra per aspera» | 934×93 | 2000×200, fondo transparente |

- **Color de marca:** esmeralda `#27D468` (luz `#6FFFA6`, sombra `#0A3020`), sobre negro `#050807`. Blanco solo para números/estrella.
- **Tipografía:** itálica condensada, muy inclinada y angulosa (como el wordmark). En el código se usa *Barlow Condensed* 800 italic como
  sustituta; si hay una fuente propia, ponerla en `--bc-font` (`lfo-broadcast.css`) y en `cupidite.css`.
- **Forma:** trofeo de diamante tallado con dos astas; patrones geométricos de facetas; marcos metálicos oscuros con borde esmeralda brillante.
- **Lema:** *AD ASTRA PER ASPERA* (aparece en la marca de agua y en la intro).

## Slots de arte (`lfoskin/cupidite/`)

> **Estado:** todos los archivos de esta tabla y los cuatro de la marca ya tienen arte definitivo (vectorial, generado a medida
> con los mismos nombres y proporciones). La tabla queda como especificación por si se quieren rehacer.

Cada uno es un archivo generado que lleva su nombre y tamaño escrito abajo a la izquierda (texto tenue). **Para reemplazarlo:
guardar el archivo nuevo con el mismo nombre y las mismas proporciones** (se estira con `background-size:100% 100%` salvo que se indique
otra cosa). Todos se declaran una vez en `cupidite.css`, bloque `:root[data-lfo-pkg="cupidite"]` (variables `--cup-*`); si se
cambia un nombre o formato, se cambia ahí.

| Archivo | Px | Dónde se ve | Qué debe tener |
|---|---|---|---|
| `plate-bg.png` | 1100×260 | Placa de los *stingers* (gol, tarjetas, cambios, córner…) | Chapa horizontal oscura con borde esmeralda luminoso y facetas de diamante. El texto va encima (centrado): dejar libre el centro. Bordes de 24 px sin detalle importante. |
| `goal-burst.png` | 1600×900 | Detrás de la placa cuando hay **gol** (¡¡¡GOOOOL!!!) | Estallido de rayos esmeralda desde el centro y un diamante grande semitransparente detrás del texto; chispas. PNG con transparencia. Se anima (aparece, crece, se desvanece en 4,2 s). |
| `lower-third-bg.png` | 1000×220 | Placa del goleador (abajo a la izquierda) con la carta y el nombre | Igual que la placa pero más baja; a la izquierda queda la carta del jugador (~120 px) y a la derecha el marcador (~140 px): dejar zonas más oscuras ahí. |
| `lineup-header-bg.png` | 800×120 | Cabecera de cada alineación (escudo + nombre del club) | Barra oscura con filo esmeralda; el escudo va a la izquierda (~40 px). |
| `intro-bg.jpg` | 1920×1080 | Fondo de la presentación previa (título + enfrentamiento) | Estadio nocturno estilizado, bruma verde, haces de luz, silueta de ciudad. Sin texto. Zona central (60 %) despejada. |
| `studio-bg.jpg` | 1920×1080 | Fondo del estudio de análisis (previa y post-partido) | Set de televisión oscuro con luces esmeralda y el trofeo de fondo. Sin personas ni texto. |
| `wipe-band.png` | 2400×1080 | Banda de la transición entre planos | Banda verde metálica con facetas, pensada para cruzar la pantalla en diagonal (skew −14°). |
| `wipe-diamond.png` | 512×512 | Emblema que gira en el centro de la transición | El diamante del trofeo, transparente alrededor, con brillo. Idealmente igual al de `icon.png`. |
| `sub-panel-bg.png` | 700×300 | Panel de cambio (sale / entra) | Panel oscuro con borde esmeralda; arriba una pestaña baja para la etiqueta «CAMBIO»; dos mitades (rojo = sale, verde = entra). |
| `stats-panel-bg.png` | 800×520 | Panel de estadísticas del partido (`.tlm-cup-stats`) | Panel oscuro con cabecera con el wordmark; filas con barras esmeralda. Aún no se muestra en el 3D: lo usa el resumen de la copa. |
| `scoreboard-frame.png` | 900×220 | Marco del marcador de TV (arriba a la izquierda) | Marco metálico gris oscuro con filo esmeralda; el interior (equipos, goles, reloj) va encima, así que debe ser oscuro y limpio. La pestaña con el trofeo y el nombre se dibuja aparte (`.tv-score::after`). |
| `poster.jpg` | 1080×1350 | Cabecera de la pantalla de la copa (manager) | Póster vertical de cartelera: estadio, luces, sin escudos (los pone el juego). Se recorta a un banner horizontal. |
| `ticket.png` | 1200×420 | Entrada del partido en la pantalla *Matchday* | Entrada horizontal: talón verde a la izquierda (90 px), cuerpo negro, código de barras a la derecha (≈260 px). El texto se superpone (nombre de la copa, escudos, fecha). |
| `trophy-render.png` | 551×1033 (o mayor) | Trofeo grande (campeón / intro) | Render del trofeo-diamante, fondo transparente. Hoy es el mismo `icon.png`. |

## Cosas que NO son imagen y quedan como placeholder
1. **Estudio 3D** (dos presentadores y set en `tlb/graphics.js`/`tlb/app.js`): sigue con los colores del paquete de liga; falta un set 3D con la
   paleta de la copa (mesa curva esmeralda, pantalla de datos con el diamante, fondo de ciudad nocturna).
2. **Presentación de alineaciones 3D** (`tlb/app.js`, cancha táctica): solo se recolorea con CSS; falta una cancha táctica con marco de diamantes.
3. **Ceremonia de entrega del trofeo** (campeón): no existe; hoy solo hay noticia + banner en la pantalla de la copa. Hace falta animación 3D del
   trofeo (`trophy-render.png` sirve de referencia) y confeti esmeralda.
4. **Audio:** *stingers* de la copa (himno corto, gol, transición, tarjeta) — hoy se reutilizan los de la liga (`soundeffects/`).
5. **Balón**: hecho (`LFO_BALL` en `fulbo.html`, tema `cupidite`: negro con facetas esmeralda; cambia solo con `pushPackage`). Redes y banderines de córner con la marca: no hay.

## Cómo verificar un cambio
1. `python -m http.server 8080` en `GameHub_Organizado` y abrir `http://localhost:8080/01-futbol/fulbo.html`.
2. Consola: `LFOBroadcast.pushPackage('cupidite')`, ir a *Centro de partidos* → *Iniciar partido* (saltar la intro con «SALTAR») y disparar
   un gol de prueba: `TLB.stinger('goal','Nombre del club','GOL',6000)`.
3. Para volver al paquete normal: `LFOBroadcast.popPackage()`.


## Pop-ups de transmisión (placeholders nuevos)
Los pop-ups del partido (`lfoskin/lfo-popups.js` + `lfoskin/popups.css`) tienen piel LFO (azul/oro) y piel La Cupidité (esmeralda). La piel de la
copa usa estos archivos de `lfoskin/cupidite/` (mismo criterio: reemplazar conservando nombre y proporciones; se declaran como `--cup-pop-*` al
principio de `popups.css`). Hoy son placeholders generados (facetas + filo esmeralda); el título está superpuesto por el juego.

| Archivo | Px | Dónde se ve | Qué debe tener |
|---|---|---|---|
| `pop-panel-bg.png` | 700×420 | Fondo de los paneles GOLES, TARJETAS, CAMBIOS, TABLA / LLAVES, ESTADÍSTICAS, FIGURA, GOLEADORES | Panel oscuro con marco metálico y filo esmeralda; el texto va encima (filas de ~30 px): mantenerlo limpio. |
| `pop-title-bg.png` | 700×70 | Barra del título de cada panel (arriba) | Barra esmeralda con facetas de diamante y un bisel brillante; el título (blanco/negro, itálica) va encima. Sin texto propio. |
| `pop-card-bg.png` | 720×220 | Aviso de tarjeta amarilla / roja | Placa oscura; a la izquierda queda la carta que cae (78 px) y a la derecha nombre y equipo. |
| `pop-nameplate-bg.png` | 800×120 | Cartel del cobrador (penal, tiro libre, córner) | Placa baja; a la izquierda el dorsal sobre el color del equipo (108 px). |
| `pop-added-bg.png` | 260×260 | Cartel de tiempo agregado (cuarto árbitro) | Marco de panel electrónico negro con bordes esmeralda; el «+N» rojo/verde luminoso va al centro. |
| `pop-sponsor-bg.png` | 900×160 | Banner de anunciante | Banner horizontal oscuro con filo esmeralda; el logo va a la izquierda (96 px) y el texto en el centro. |
| `pop-venue-bg.png` | 900×110 | Estadio y público | Franja baja con filo esmeralda; dos líneas de texto. |
