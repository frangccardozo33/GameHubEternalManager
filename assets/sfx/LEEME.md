# Sonidos extra de los módulos (`assets/sfx/`)

`assets/common/em-common.js` (cargado por `touchline-bridge.js` en todos los módulos menos Música) reproduce estos sonidos con **`EM.sfx.play('nombre')`**.

**Cómo funciona el reemplazo**
1. Si en esta carpeta hay un archivo `nombre.ogg | .mp3 | .wav | .m4a` y figura en `index.json`, suena ese.
2. Si no, suena un **placeholder sintetizado** (por eso el juego nunca queda mudo).
3. Para cambiar un placeholder: copiá tu archivo acá con el **nombre exacto** de la lista, y corré `node assets/sfx/build-index.mjs` (regenera `index.json`).
4. En la consola del módulo, `EM.sfx.list()` muestra qué sonidos son reales y cuáles placeholders.
Los bucles largos (ambientes) deberían ser sin silencios al principio y al final (el de básquet ya se recorta 3 s al inicio y al final).

## Ya son reales (vienen de `assets/othersoundeffects/`)
`crowd_basket`, `crowd_nfl` (ambiente de público), `radio_click` (radio F1), `start_lights` (semáforos), `ball_bounce`, `ball_hit`, `ball_hard_hit`, `ball_net`, `ball_catch`, `buzzer`,
`pit_gun` (pistola neumática de boxes), `nba_jingle`, `nfl_chime`.

## PLACEHOLDERS A REEMPLAZAR (sintetizados hoy)
| Nombre | Dónde suena | Qué conviene conseguir |
|---|---|---|
| `crowd_cheer` | gol/canasta/touchdown/podio | ovación de estadio, 2–4 s |
| `crowd_ooh` | tiro fallado, sack, intercepción, derribo | «uuuh» de público, 1–2 s |
| `crowd_boo` | reservado (abucheo) | abucheo 2 s |
| `applause` | reservado | aplausos 3–5 s |
| `crowd_loop` | ambiente de MMA (y de respaldo en LBO/LGO) | ambiente de público de gimnasio/arena, bucle 20–40 s |
| `whistle` | fin de partido (NFL, MMA) e inicio de clasificación | silbato de árbitro |
| `chime` | resultados de clasificación, campanilla | campanilla corta |
| `fanfare` | podio de carreras si no hay canción de celebración equipada | fanfarria de 3–5 s |
| `thunder` | truenos en lluvia fuerte (carreras) | trueno lejano 2–3 s |
| `beep` | semáforo/aviso | pitido corto |
| `pop_in` | cada pop-up informativo | «pop» suave, 0,2 s |
| `whoosh` | transiciones y banners | barrido, 0,5 s |
| `punch`, `kick` | golpes y derribos de MMA | impactos secos, 0,2 s |
| `bell` | campana de round de MMA | campana de boxeo ×3 |
| `horn` | touchdown | bocina de estadio 1 s |
| `tackle` | sack y tacleadas (NFL) | choque de cascos/almohadillas |
| `snap` | reservado (snap del centro) | chasquido corto |
| `shift_up`, `backfire` | cambios de marcha y escapes en cabina (si no están los WAV de motor) | clic mecánico / explosión de escape |
| `cash`, `chip`, `card_flip`, `slot_spin`, `jackpot` | casino y cobro de patrocinadores | monedas, ficha, carta, tragamonedas, premio |
| `swish` | reservado (red) | red de aro |

## Motor de carreras
El motor real sale de `assets/carengines/…/911_RSR_2017/` (muestras de Assetto Corsa/GRID; **no se suben al repo**, ver `ASSETS_PESADOS.md`). `07-carreras-apex/lro-cams.js`
usa `bcl_on_low`, `mpl_on_midlow`, `bcl_on_high3`, `bcl_off_shakey_low`, `bcl_off_mid`, `mpl_off_high_2` para la mezcla por RPM, y `int_shift_up_1`, `int_shift_down`, `backfireEXT_2`, `991_gt3_startup` como golpes.
Si esa carpeta falta, el juego vuelve solo al motor sintetizado. Para cambiar de auto/motor: editar `BASE`, `SETS` y `ONESHOT` al principio de la sección «motor con muestras reales» de `lro-cams.js`.

## Música (no está acá)
La música del hub (`assets/hubost/`) y las canciones de celebración (`01-futbol/celebrationost/`) siguen su propio mecanismo.
