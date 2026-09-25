# Tribuna (álbum de cromos) de LBO, LGO, LRO y LLO — dónde trabajar para mejorar los diseños

Instrucciones para la IA (o el diseñador) que rehace las cartas. El **fútbol** ya tiene su propio archivo de tribuna
(`01-futbol/collection.js` + `cardlook.js`, con personajes 3D). Los otros cuatro módulos usan una sola librería nueva,
`assets/tribuna/tribuna.js`, con un **diseño de carta "normal" (placeholder)**: marco por edición, OVR, posición, bandera,
escudo, retrato dibujado con formas simples, nombre, seis estadísticas y estrellas. Todo lo que se ve como provisional
está listado abajo.

## Qué hay hoy
| Módulo | Botón | Cromos | Origen de los datos |
|---|---|---|---|
| LBO · Básquet | «Tribuna» en el menú | todos los jugadores de la liga y los libres | `05-basquet-courtside/src/ui/app.js` (bloque «Tribuna LBO») |
| LGO · NFL | «Tribuna» en Competición | todos los jugadores (≈400 con 32 equipos) | `06-nfl-gridiron/src/ui/pages/tribuna.js` |
| LRO · Carreras | «TRIBUNA» en la barra superior | los pilotos del campeonato | `07-carreras-apex/tribuna-lro.js` |
| LLO · MMA | «Tribuna» en el menú | los peleadores activos | `04-mma/tribuna-llo.js` |

Cada módulo entrega a la librería una lista de cartas (`getCards()`), con este formato:
```js
{ id, name, number, pos, posName, ovr, age, skin /*0-4*/,
  team: { id, name, short, primary, secondary, crest /*URL opcional*/ },
  nation: 'Peronia',                    // nación ficticia (assets/nations/nations.js)
  stats: { 'Triple': 88, … },           // todas las estadísticas (se ven en el detalle y el dorso)
  statLabels: [['Triple','TRI'], …],    // opcional por carta: las 6 que van en el frente (si no, las del módulo)
  info: [['Altura','2.01 m'], …], portrait /*URL opcional*/ }
```
El álbum tiene filtros por edición, posición, equipo y búsqueda, orden, favoritos (se guardan en el navegador), detalle con
dorso y descarga en PNG.

## Ediciones (por OVR)
Seis ediciones: Común, Bronce, Plata, Oro, Élite y Leyenda. Los cortes de OVR de cada deporte están al registrar el módulo
(`Tribuna.tiersWith([0, 60, 68, 74, 80, 88])`). Los colores (`ink`, `paper`, `glow`) están en `TIERS` en `tribuna.js`.

## Qué reemplazar, en orden de impacto
1. **Retratos** (lo más provisional: siluetas dibujadas con canvas en `ART.basquet / ART.nfl / ART.carreras / ART.mma`).
   - Por jugador: el módulo puede pasar `portrait: 'URL'` (PNG con fondo transparente, 404×440 px aprox., busto o medio cuerpo).
   - Genérico por deporte: activar `Tribuna.options.portraitSets = { basquet: 12, nfl: 12, carreras: 10, mma: 10 }` y poner los archivos en
     `assets/tribuna/portraits/<deporte>/<n>.png` (n de 0 a N−1). Se elige uno por jugador de forma fija (por su id). Idealmente el retrato
     es neutro (sin equipo) y el juego dibuja encima el número y los colores; o bien pensarlo con camiseta genérica gris.
   - Deportes: `basquet`, `nfl`, `carreras`, `mma`.
2. **Marcos de edición.** Hoy son un borde doble con degradé y trama. Con arte propio: `Tribuna.options.useFrames = true` y un PNG
   de 600×840 con transparencia por cada combinación en `assets/tribuna/frames/<deporte>-<edición>.png` (24 archivos:
   `basquet-comun.png`, `basquet-bronce.png`, … `mma-leyenda.png`). El marco se dibuja debajo del contenido: dejar libre la ventana del
   retrato (150,118 a 554,558) y las zonas de la columna izquierda y la placa de nombre.
3. **Diseño completo de la carta.** Todas las posiciones están en `drawCard()` de `tribuna.js` (600×840 px):
   - banda superior con el nombre de la edición y el logo del módulo (y 40–104);
   - columna izquierda: OVR (x 96, y 190), posición (y 232), bandera (y 290, 76 px de ancho) y escudo (y 410, 74 px);
   - retrato (x 150, y 118, 404×440);
   - placa de equipo y nombre (y 574–660);
   - seis estadísticas (y 672–742);
   - pie con datos, estrellas y número de serie (y 780–806).
   Si el nuevo diseño mueve algo, se cambia ahí; el resto (filtros, detalle, descarga) no depende del diseño.
4. **Escudos de los equipos.** Básquet, NFL, carreras y MMA no tienen escudos: se dibuja un círculo con las iniciales y los colores del
   equipo. Si se entregan escudos, pasarlos en `team.crest` (URL) desde el módulo.
5. **Fuente.** Usa *Barlow Condensed* (`FONT` al comienzo de `tribuna.js`). Cambiarla ahí.
6. **Dorso.** Hoy es una lista de datos y estadísticas sobre el fondo de la edición (rama `if (back)` de `drawCard`).

## Cosas que no hace todavía (y se pueden pedir)
- No hay sobres ni compra de cromos: el álbum muestra a todos los jugadores del mundo, igual que el del fútbol.
- Los cromos no traen animación ni efecto foil; las ediciones altas solo tienen un resplandor.
- No hay versión «custom» (editor de cromos propios como en el fútbol).

## Cómo probar
1. `python -m http.server 8080` en `GameHub_Organizado`.
2. Abrir el módulo (por ejemplo `http://localhost:8080/07-carreras-apex/index.html`) y usar el botón Tribuna.
3. En la consola: `Tribuna.open('lro')` (o `lbo`, `lgo`, `llo`). Para ver una carta suelta: `await Tribuna.cardCanvas('lro', card)`.
4. LBO y LGO se compilan con Vite: después de tocar `tribuna.js` hay que recompilar (ver «Si volvés a tocar el código» en `_INFO/README.md`).
