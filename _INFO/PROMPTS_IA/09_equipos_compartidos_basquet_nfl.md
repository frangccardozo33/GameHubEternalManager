# Equipos de básquet (LBO) y NFL (LGO) = los mismos clubes que el fútbol

> **HECHO** (ver `assets/common/clubs.mjs`, usado por `05-basquet-courtside/src/manager/data.js` y `06-nfl-gridiron/src/manager/constants.js`). LBO usa los primeros 12 clubes y LGO los primeros 8. Este archivo queda como referencia si querés ampliar la liga: agregar filas a `CLUBS` y recompilar.

Idea: cada club del fútbol tiene una franquicia de básquet y otra de gridiron **con el mismo escudo** pero con un nombre distinto por deporte
(por ejemplo, la Universidad de Costas Unidas juega en LBO y en LGO como «Coastal Trains»).

## Tabla propuesta (editable)
Los logos están en `01-futbol/equiposfut/` (y `continente2/`). Cada fila conserva el escudo; sólo cambian los nombres.

| Club de fútbol (archivo del escudo) | Básquet (LBO) | Gridiron (LGO) |
|---|---|---|
| universidadcostasunidas.png | Coastal Trains | Coastal Trains |
| olympiquedeiberia.png | Iberia Bulls | Iberia Corsairs |
| realzenet.png | Zenet Royals | Zenet Monarchs |
| skotefc.png | Skote Ravens | Skote Wolves |
| grammesfutbolclub.png | Grammes Gears | Grammes Ironclads |
| meloniacityfc.png | Melonia Metros | Melonia Meteors |
| independientederiada.png | Riada Rapids | Riada Reds |
| atleticomargin.png | Margin Marlins | Margin Mustangs |
| atleticomorvico.png | Morvico Mountaineers | Morvico Mammoths |
| futbolclubdetamago.png | Tamago Tigers | Tamago Titans |
| alsahar.png | Sahar Suns | Sahar Scorpions |
| clubdeportivoheroicosdeperonia.png | Peronia Heroes | Peronia Hawks |
| fcsantarosa.png | Santa Rosa Roses | Santa Rosa Rangers |
| sportingmagayanes.png | Magayanes Mariners | Magayanes Marauders |
| sportingsantamariadetrinidad.png | Trinidad Sharks | Trinidad Stallions |
| sportivocalciosdikaigam.png | Kaigam Kings | Kaigam Knights |
| continente2/redgullclubtellin.png | Tellin Bulls | Tellin Rhinos |
| continente2/sportinglakebaikal.png | Baikal Whalers | Baikal Lynx |
| continente2/sportyvvklubkostanay.png | Kostanay Comets | Kostanay Bears |
| continente2/sportyvvklubestovackia.png | Estovackia Eagles | Estovackia Steelers |
| continente2/orkfc.png | Ork Owls | Ork Outlaws |
| continente2/interfocuri.png | Focuri Flames | Focuri Vipers |
| continente2/klaipedaunited.png | Klaipeda Kraken | Klaipeda Vikings |
| continente2/maccabitelshava.png | Shava Sentinels | Shava Lions |
| continente2/grozsportkulubu.png | Groz Gladiators | Groz Bison |

(Si el módulo usa 8, 16 o 32 equipos, elegir los primeros N de esta tabla y guardar el orden.)

## PROMPT para la IA de código
«En `GameHubEternalManager`, los módulos de básquet (`05-basquet-courtside`) y NFL (`06-nfl-gridiron`) tienen sus propios equipos inventados
(`06-nfl-gridiron/src/manager/constants.js` y `src/sim/models.js`; en básquet la generación está en `src/manager/` y `src/simulation/model.js`) y dibujan un
escudo SVG genérico (`crestSvg` en `05-basquet-courtside/src/ui/match.js`, `06-nfl-gridiron/src/ui/logo.js`).
Hacé lo siguiente, sin cambiar la simulación:
1. Creá `assets/common/clubs.js` (script global `window.EM_CLUBS = [{ id, logo: '01-futbol/equiposfut/…png', name: { fut, bkt, nfl }, city, color, dark }]`) con la tabla de arriba; colores tomados del propio logo (promedio de los dos colores dominantes).
2. Cambiá la generación de equipos de LBO y LGO para que salgan de `EM_CLUBS` (mismo orden, mismas ciudades) y guardá el `clubId` en cada equipo (compatibilidad: al cargar guardados viejos, mapear por nombre o regenerar la liga con aviso).
3. Reemplazá el escudo SVG genérico por `<img src="…/logo.png">` en TODA la UI donde hoy aparece (marcador, tablas, calendario, tribuna, cartas, transmisión `assets/broadcast/broadcast.js` → `shieldSVG`), con `object-fit: contain` y fondo transparente/blanco según el logo.
4. Nombres visibles: usar `name.bkt` en LBO y `name.nfl` en LGO; el nombre de fútbol sólo se usa en LFO.
5. Los archivos de arte que cambien (por ejemplo `assets/tribuna/*`) deben seguir funcionando.
6. Recompilá LBO (`npm run build` + `PYTHONUTF8=1 python inline.py courtside-single.html`) y LGO (`npx vite build --config vite.single.config.js`), corré `npm test` en cada uno, y probá abrir una liga nueva en cada módulo.»

**Cómo verificar**: en LBO y LGO todos los equipos muestran el escudo del club de fútbol correspondiente; el nombre cambia según el deporte; los guardados viejos no rompen.
