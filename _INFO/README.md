# GameHub Organizado — el juego final

Todo lo de acá es una **COPIA**. Los archivos originales en Downloads no se tocaron ni se movieron.

## Tienda Diaria (cosméticos)

Estilo Fortnite: se renueva 2 veces al día (medianoche y mediodía, hora local del navegador). Vive en `hub.html` (pestaña "Tienda Diaria" del sidebar) y hoy vende dos tipos de ítems:

- **Música de gol**: 78 audios de `01-futbol/celebrationost/` que duran menos de 60s (se midió la duración real de cada archivo con `music-metadata`; los 2 que eran canciones completas de +3 min — Eminem y Slushii — quedaron afuera). Cada uno tiene precio (Plata o Gemas), portada cuadrada tipo disco de vinilo (color propio por ítem) con botón de preview de audio, y nombre corto (se limpiaron los títulos largos/con ruido de "Official Video", "Lyrics", etc. y se les puso un apodo corto donde hacía falta, p. ej. "Marcha K").
- **Celebraciones**: por ahora solo "Baile Básico" (una animación nueva agregada al motor 3D — ver abajo). Su preview es el modelo 3D real del juego haciendo la animación (spritesheet de 24 cuadros en `assets/celebrations/dance.png`, grabado con el propio motor: se crea un modelo con `createPlayer`, se le aplica la pose con `TLB.pose` frame a frame y se renderiza sobre fondo transparente). Cuando agregues celebraciones nuevas, se graba igual y se le pone `sheet:{src,frames,cols,rows,fps}` en `CELEBRATION_CATALOG`. Al tocar play ves el baile antes de comprar (los previews son de a uno, tocar otro corta el anterior). Es el lugar para sumar más cuando tengas un animador mejor.

Cada apertura de tienda muestra 4 canciones + 1 celebración, elegidas con una semilla determinística (mismo turno = mismos ítems para todos). Cada ítem tiene dos precios y se puede comprar con cualquiera de los dos: Plata (moneda) o Gemas (con sus íconos). Música: 3 a 15 Gemas o 75.000 a 375.000 de Plata; Baile Básico: 20 Gemas o 500.000 de Plata. Descuenta de la billetera de Touchline (misma Plata/Gemas de todo el hub).

**Equipar** se hace en fútbol, no en la tienda: adentro del manager (botón "★ Modo carrera" → pestaña **VESTUARIO** en el menú lateral) hay 3 espacios para música y 3 para celebración:
1. Situación normal (el resto de los goles)
2. Últimos 5 minutos (a partir del minuto 85)
3. A partir del 4º gol del equipo en el partido

Si un espacio queda en "Aleatorio (como siempre)", ese gol usa el sistema viejo (sorteo entre todo el pool), sin romper nada de lo que ya había.

### Cómo funciona por dentro

- `hub.html`: tiene el catálogo (`MUSIC_CATALOG`, `CELEBRATION_CATALOG`), la lógica de rotación (`currentShop()`), compra/equipar (`buyCosmetic`/`equipCosmetic`) y expone todo por el mismo protocolo `postMessage` que ya usa la economía compartida.
- `touchline-bridge.js`: agregó `Touchline.getCosmetics()`, `Touchline.buyCosmetic(type,id)`, `Touchline.equipCosmetic(type,slot,id)`, `Touchline.onCosmetics(fn)`.
- `01-futbol/celebration-cosmetics.js` (nuevo): cachea localmente lo que el jugador equipó (la decisión tiene que ser instantánea al patear el gol, no puede esperar un viaje de ida y vuelta por postMessage).
- `01-futbol/celebration.js`: si hay una canción equipada para la situación del gol, la usa; si no, sigue siendo aleatoria como antes.
- El motor de gol (dentro de `01-futbol/fulbo.html`, función `tlOnGoal`): calcula la situación (normal/últimos 5'/4º gol+) y, si hay una celebración equipada, la usa en vez de sortear una de las 6 de siempre.
- `01-futbol/manager/tlm-ui-wardrobe.js` (nuevo): la pantalla de Vestuario dentro del manager.
- **Nueva animación** "Baile Básico" (`variant: 'dance'`): se agregó un `case 'dance'` a la función `celebrate()` del motor 3D — un balanceo rítmico simple con brazos y piernas. Es deliberadamente básica, pensada para reemplazarse cuando haya mejores animaciones.

## Cómo correr el juego

Courtside, Gridiron y Apex usan ES modules (`<script type="module">`), que los navegadores **bloquean si abrís el HTML directamente con doble clic** (protocolo `file://`). Hace falta un servidor local estático. Desde esta carpeta:

```bash
python -m http.server 8080
```

o, si tenés Node:

```bash
npx serve -l 8080
```

y después abrí `http://localhost:8080/hub.html`. Probado y confirmado funcionando (fútbol, música, casino, mma, básquet, nfl y carreras cargan y comparten la misma billetera).

## Carpetas (código esencial, sin cache/basura)

| Carpeta | Módulo | Fuente original | Notas |
|---|---|---|---|
| `hub.html` | Hub central | `Downloads\hub.html` | Reescrito: ahora conecta los 7 módulos y quedó ~25x más liviano (se sacaron ~1.7MB de una versión vieja de fútbol/casino que estaba embebida en base64 y ya no se usaba). |
| `touchline-bridge.js` | Puente de economía compartida | nuevo, escrito para este proyecto | Ver sección "Economía compartida" abajo. |
| `01-futbol/` | Fútbol (manager) | `Downloads\webapp434523\webapp` | Versión más nueva (22-sep). Sin historial git (nunca se hizo commit). |
| `02-musica/` | Música | `Downloads\musica-mejorada.html` | Versión más nueva y completa. |
| `03-casino/` | Casino | `Downloads\casinov3.html` | v3, la más nueva. |
| `04-mma/` | MMA | `Downloads\manager\mma3d.html` | Elegida a pedido; NINGUNA versión de MMA tenía wallet/currency integrado todavía — hay que agregarlo. |
| `05-basquet-courtside/` | Básquet (Courtside) | `Downloads\courtside-codigo-completo.zip` | El hub carga `courtside-single.html` (ver nota de build abajo), no `index.html`. |
| `06-nfl-gridiron/` | NFL (Gridiron) | `Downloads\gridiron_franchise_project.zip` | El hub carga `dist-single/index.html` (ver nota de build abajo), no `index.html`. |
| `07-carreras-apex/` | Carreras (Apex) | `Downloads\manager\webapp (1)\webapp` | Repo git con 8 commits reales. Se excluyó node_modules/dist (regenerables con `npm install`/`npm run build`). |

## Qué se EXCLUYÓ al copiar (cache/basura, no se copió, sigue en el original si lo necesitás)

- **`comfy/`** dentro de `webapp434523\webapp` — ~5-6 GB de un checkout completo de ComfyUI (herramienta de IA para imágenes) que no tiene nada que ver con el juego. Si lo necesitás está en el original.
- `.git/` del módulo fútbol — no tenía commits, no aportaba nada.
- `node_modules/`, `dist/`, `.npm-cache/`, `node-compile-cache/` — todo regenerable con `npm install` / build, en cualquier módulo donde aparecía.
- `.claude/` — configuración de sesiones de Claude Code, no es parte del juego.
- `analysis/real_football_benchmark/` dentro de fútbol — datasets CSV de benchmarking de decenas de MB, no es código del juego.

## Versiones alternativas que NO se copiaron (por si querés rescatar algo)

- Fútbol: `Downloads\webapp\webapp`, `Downloads\manager\webapp21312\webapp\fulboact` (con historial git de fixes), `Downloads\manager\webapp32423\webapp32423\fulboact`, `Downloads\manager\fulbo.html`, `fulbo.pre-ai2.html`, `fulbo.zip`, `fubolaimatchengine.zip`, `Downloads\manager\viejo\touchline-soccer-game-v8-*.html` (prototipos viejos).
- Música: `Downloads\manager\musica.html` (versión vieja), `Downloads\manager\index (1).html` ("Nocturne", prototipo distinto).
- Casino: `Downloads\manager\casinov1.html` (vieja).
- MMA: `Downloads\manager\CORNER_MMA.html`, `Downloads\manager\index (4).html` (otros prototipos del mismo día), `Downloads\apex-mma-manager.zip` (build compilado/minificado, sin código fuente legible).
- Carreras: `Downloads\manager\apex-race-game.html` (prototipo viejo), `Downloads\apexmodule.zip` (mismo proyecto que 07, pero empaquetado con ~44MB de cache npm).

## Bug real que se encontró y arregló: Courtside y Gridiron no cargaban

Ambos son apps Vite cuyo `main.js` hace `import './style.css'` — una transformación que **solo Vite sabe hacer** (dev server o build). Servidos como archivos sueltos (aunque sea con un servidor real, no con `file://`), esa importación de CSS-como-JS-module se rompía y toda la interfaz quedaba sin estilos — se veía como formas negras gigantes tapando la pantalla (los íconos de escudo, pensados para 24px, se renderizaban a tamaño completo).

Arreglo aplicado — se compiló cada proyecto a un HTML único y autocontenido (JS+CSS inlineados, cero imports externos):

- **Courtside**: `npm install && npm run build`, y después `05-basquet-courtside/inline.py` (script que ya venía en el proyecto) generó `courtside-single.html`.
- **Gridiron**: ya traía `vite.single.config.js` con el plugin `vite-plugin-singlefile`; se corrió `npm install && npx vite build --config vite.single.config.js`, que regeneró `dist-single/index.html`.
- `hub.html` ahora apunta a esos dos archivos compilados en vez de a los `index.html` de código fuente.
- Se borraron los `node_modules`/`dist` temporales que dejó el build (ya cumplieron su función, son regenerables con `npm install`/`npm run build` si hace falta tocar el código fuente de nuevo).

Confirmado con capturas: ambos módulos cargan completos, con estilos, y el HUD de moneda compartida visible.

## Economía compartida — estado real

Ninguno de los 7 módulos (ni siquiera fútbol/música/casino, a pesar de lo que decía la descripción vieja del hub) hablaba realmente con la billetera compartida del hub. Se agregó la integración a los 7:

- **`touchline-bridge.js`** (en la raíz) se inyectó con un `<script src="../touchline-bridge.js">` en el `<head>` de los 7 archivos de entrada (`fulbo.html`, `musica-mejorada.html`, `casinov3.html`, `mma3d.html`, y los 3 `index.html` de Courtside/Gridiron/Apex).
- Cada módulo, apenas carga, muestra un badge fijo arriba a la derecha con la Plata y las Gemas compartidas (se actualiza solo).
- Cada módulo tiene disponible `window.Touchline` con:
  - `Touchline.getBalances()`
  - `Touchline.addSilver(n)` / `Touchline.removeSilver(n)`
  - `Touchline.addRubies(n)` / `Touchline.removeRubies(n)`
  - `Touchline.onBalances(fn)` para reaccionar a cambios
- Probado en vivo (servidor local + navegador): los 7 módulos cargan, muestran el badge, y `addSilver`/`removeSilver` desde un módulo actualiza en tiempo real la billetera del hub y de todos los demás módulos abiertos.

### Ya conectado de verdad (no solo el HUD) — probado en vivo módulo por módulo

Se encontró el "punto único" de cada juego donde se gasta o gana dinero, y se conectó a la Plata de Touchline (ganás o gastás en un módulo y el saldo cambia en todos):

- **Casino** (`03-casino/casinov3.html`): se enganchó su función `save()`. Cualquier cambio de `state.balance` (apuestas, pagos, bono diario) sincroniza con Touchline. Probado: bono diario de $1,000 → sumó exacto en el hub.
- **MMA** (`04-mma/mma3d.html`): se enganchó `finish()`. Ganar una pelea paga una bolsa (5.000 por decisión, 8.000 por nocaut/sumisión). Probado: victoria por decisión → +$5,000.
- **Fútbol** (`01-futbol/fulbo.html`): se enganchó `career.save()` del motor de carrera (LFO Manager). Cualquier cambio en `finances.balance` del club del usuario (fichajes, ventas, premios, salarios) sincroniza. Probado: +$10,000 → reflejado exacto.
- **Apex / Carreras** (`07-carreras-apex/index.html`): se enganchó `saveCareer()`. Cualquier cambio en `credits` del equipo del jugador sincroniza. Probado: +$25,000 → reflejado exacto.
- **Courtside / Básquet** (`05-basquet-courtside/`): se editó el código fuente (`src/manager/club.js`) para sincronizar `fin.cash` en sus 4 puntos de cambio (ingresos de partido, día a día, mejoras de instalaciones, cierre de temporada/tasa de lujo/primas). Probado: mejorar el pabellón costó 25 M€ → -$25 exacto en Touchline. **Se recompiló** (`npm run build` + `inline.py`) para aplicar el cambio — si volvés a tocar el código fuente hay que recompilar de nuevo (ver abajo).
- **Gridiron / NFL** (`06-nfl-gridiron/`): se editó el código fuente (`src/manager/economy.js` y `src/ui/app.js`) para sincronizar `finance.cash` del equipo del usuario en cada finanza semanal (`weeklyFinance`) y despido de staff (`fireStaff`), y para arrancar una franquicia nueva con la Plata compartida como caja inicial. Probado: simular una semana restó ~$0,7 según ingresos/gastos → reflejado exacto. **También recompilado.**

**Courtside no tiene un mecanismo de "comprar con dinero" fuera de mejoras de instalaciones** (su "salary cap" es un tope, no algo que se gaste) — no se inventó una mecánica de gasto donde el juego no la tenía.

### Si volvés a tocar el código de Courtside o Gridiron

Estos dos NO se sirven desde su `index.html` de código fuente (los navegadores bloquean sus `import` de ES modules fuera de un servidor Vite). El hub carga una versión ya compilada:

```bash
# Courtside
cd 05-basquet-courtside && npm install && npm run build
python -c "$(cat inline.py | sed 's/read_text()/read_text(encoding=\"utf-8\")/;s/write_text(/write_text(encoding=\"utf-8\",/')" courtside-single.html
# (o simplemente correr inline.py con Python en modo UTF-8 si tu Windows da error de encoding)

# Gridiron
cd 06-nfl-gridiron && npm install && npx vite build --config vite.single.config.js
# luego corregir a mano la ruta del bridge en dist-single/index.html:
#   "../touchline-bridge.js"  →  "../../touchline-bridge.js"
```
Después de compilar, borrá `node_modules` y `dist` (no son necesarios para jugar, solo para compilar).

## Homogeneización de módulos (paridad con el fútbol)

Cambios hechos tras comparar todos los módulos contra el modelo de fútbol:

- **Staff técnico eliminado** (básquet y NFL): ya no hay pantalla, contrataciones ni sueldos de staff. En NFL los objetos de staff siguen en el guardado pero se neutralizan al cargar (`League._neutralizeStaff`); en básquet se sacaron los niveles de entrenador/ojeadores/preparador y su coste. Quedan las **instalaciones** (pabellón / centro de entrenamiento).
- **Básquet (Courtside):** lesiones (`rollInjury` / `healInjuries`, los lesionados salen de la alineación y se marcan en Plantilla) y traspasos 1x1 entre equipos de la IA (`aiTrades`).
- **NFL (Gridiron):** draft de 3 rondas al terminar la temporada (`startDraft`, pantalla *Draft*; el orden es inverso a la clasificación, la IA elige por necesidad y potencial) y pantalla *News* con filtros. Los rookies ya no caen directo a agentes libres.
- **Carreras (Apex):** historial de temporadas en Campeonato (`recordSeasonHistory`), evolución de pilotos por edad y retiros con relevo por un novato (`developDrivers`).
- **MMA (Cageside):** nuevo **Modo Carrera** (`04-mma/mma-career.js`, botón *MODO CARRERA* en el simulador): 8 gimnasios, 7 eventos por temporada, plantel con contratos, mercado (agentes libres, cantera y ofertas), entrenamiento e instalaciones, lesiones, finanzas con la plata del hub, clasificación, noticias e historial. El combate del usuario se puede jugar en el motor 3D (dirigiendo las esquinas) o simular; el resto de la cartelera se simula solo.
- Para reconstruir después de tocar el código fuente: Courtside `npm install && npm run build && PYTHONUTF8=1 python inline.py courtside-single.html`; Gridiron `npm install && npx vite build --config vite.single.config.js` y luego cambiar en `dist-single/index.html` el script del puente a `../../touchline-bridge.js`.
- **Precio de entradas:** ya no es configurable en básquet ni NFL (en fútbol nunca lo fue): lo fija el club según su popularidad.
- **Ofertas de la IA por tus jugadores:** ahora también en básquet (Mercado › Ofertas, intercambios 1x1) y Apex (ventana al avanzar de ronda, intercambio de pilotos más créditos).
- **Sin tope salarial ni objetivos de directiva** (básquet y NFL, como en fútbol): en básquet `cfg.salaryCap` queda en 1e6 (se fuerza al cargar) y se quitaron la tasa de lujo, la confianza y el objetivo de la directiva; en NFL `SALARY_CAP = 1e6`, "cap hit" pasó a "costo anual" y "dead cap" a "bonus pendiente". En ambos, con la caja en negativo no se puede fichar (misma regla que fútbol).
- **Fechas de calendario en todos los módulos** (cada jornada/semana/ronda/evento tiene fecha real, visible en calendario, cabecera y noticias): fútbol (`01-futbol/manager/tlm-dates.js`: sábados desde el 15 de agosto, receso invernal de 3 semanas), básquet (`src/manager/dates.js`: desde el 22 de octubre, jornada cada 2 días), NFL (`weekDate` en `src/manager/util.js`: domingos desde el 13 de septiembre), Apex (`raceDate` en `game-data.js`: domingos desde el 8 de marzo, carrera cada 14 días) y MMA (`evDate` en `mma-career.js`: sábados desde el 17 de enero, evento cada 3 semanas).
- **Apex:** entrenamiento de pilotos (enfoque por piloto + intensidad Suave/Normal/Intensa con costo por fecha).
- **MMA:** tres divisiones (Ligero 70 kg, Wélter 77 kg, Medio 84 kg), cinturones y *Noche de Campeones* (evento 8 de cada temporada: combates por el título), y negociación con contraoferta al fichar/renovar y ante ofertas de otros gimnasios. Las partidas de carrera guardadas con la versión anterior (v1) se descartan.

## Renombrado a Eternal Manager y limpieza de textos

- El juego se llama **Eternal Manager**. Logo con fondo transparente en `assets/eternal-manager-logo.png` (usado en el hub como marca y favicon).
- Todos los textos visibles con "Touchline" / "Multisport Manager" pasaron a "Eternal Manager". Se conservan los identificadores internos para no romper guardados ni el protocolo entre módulos: `touchline-bridge.js`, `window.Touchline`, mensajes `TOUCHLINE_*`, claves de localStorage (`touchline-hub-v1`, `touchline-cromos-v1`) y el formato de exportación `touchline-save`.
- Se sacaron eslóganes, kickers y textos de venta de todos los módulos (hub, fútbol, música, casino, MMA, básquet, NFL, carreras). Los módulos quedan con títulos y descripciones funcionales.
- Comandos del clicker del hub: `.trabajo`, `.turno`, `.riesgo` (antes `.work`, `.slut`, `.crime`; las claves internas no cambiaron).
- Para regenerar básquet y NFL después de tocar `src/` ver las instrucciones de reconstrucción más arriba.

## Música de fondo

- Las pistas están en `assets/hubost/` y las reproduce el hub (`bgMusic` en `hub.html`) según la página activa: `hubost` (inicio, tienda, ajustes), `fulboost`, `musicost`, `casinoost`, `mmaost`, `nflost`, `raceost`.
- Básquet no tiene pista todavía: para agregarla, poner `basquetost.ogg` en esa carpeta y sumar `basquet:'basquetost'` al objeto `TRACKS`.
- Fundido de 0,9 s entre pistas, volumen 35 %, botón de silencio en la barra superior (se recuerda en `em-music`). Arranca con la primera interacción, por la política de autoplay del navegador.

## Nombres de las ligas y logos

- Fútbol = LFO (Liga de Fútbol Online), Básquet = LBO (Liga de Básquet Online), NFL = LGO (Liga de Gridiron Online), Carreras = LRO (Liga Racing Online), MMA = LLO (Liga Lucha Online).
- Logos con fondo transparente en `assets/logos/` (`lbo`, `lgo`, `lro`, `llo`; versiones `-sm` y `-xs`). Básquet y NFL llevan el logo embebido en base64 porque se compilan a un único HTML (`src/ui/logo.js` en NFL).
- Se conservan los identificadores internos (claves de guardado `courtside-manager-v1`, `gridiron-manager-v1`, `cageside_career_v1`).

## MMA: nuevo módulo (LLO) — reemplaza al anterior

- El módulo real es el manager de MMA de `Downloads/manager` (el `index.html` de esa carpeta es sólo el molde de Vite y apunta a `/src/main.js`, que no existe; el código está en `apex-mma-manager.zip`, ya compilado). Se importó a `04-mma/` (`index.html`, `assets/app.js`, `assets/style.css`). No tiene dependencias externas salvo las fuentes de Google; three.js viene dentro de `app.js`.
- Como no hay fuente, `assets/app.js` es el bundle **formateado** (prettier) y se edita directamente. Clases principales: `xl` (carrera: estado, fichajes, contratos, ofertas, eventos), `Hs` (simulador de combate), vistas `ro/ao/yl/El/bl/Tl/Al/wl/Rl/Pl/Dl/Ll`.
- El módulo anterior (`mma3d.html` + `mma-career.js`) quedó en `04-mma/anterior/`, sin uso.
- Cambios de homogeneización: saldo = Plata del hub (formato `$`, sincronizado con `touchline-bridge.js`); se quitaron sponsors, comisión de representación y "Crear prospecto" (el fútbol tampoco los tiene); se agregaron ofertas de gimnasios CPU por tus peleadores (aceptar / contraofertar +15% / rechazar), movimiento de la CPU en el mercado (fichan y sueltan peleadores cada semana), negociación con contraoferta al fichar y renovar, y relevo de retirados con prospectos nuevos (además de uno por división por año). Se sacaron los textos de relleno y todo pasó a LLO (logo incluido). Clave de guardado: `llo-mma-v1`.

## Estadios 3D (fútbol)

- `01-futbol/stadiums/*.json` son los 4 estadios exportados de three.js (50–70 MB cada uno). `node stadiums/build-bin.mjs` los convierte a `.lfos` (~26 MB, binario; es lo que carga el juego).
- `01-futbol/stadium-loader.js` reconstruye la escena con la versión reducida de three.js del simulador y anima hinchada y banderas (el `stadium-runtime.js` que pedía el export no existía). Se descarta el "Campo_original" del export (se usa el del motor). Hay un patch en `fulbo.html` (constructor de `zm`, `stadiumTick`, `loadStadium`, selector "Estadio" en el diálogo de estrategia).
- Al cargar un estadio se ocultan las tribunas, el techo, las pantallas y la hinchada del motor. Los materiales "Pintura club 0/1/2" toman los colores del local. En modo carrera el estadio se elige por club (determinista); en el centro de partidos hay selector (Automático o uno fijo).
- El techo se parte en 12 sectores y se oculta el del lado de la cámara (corte de transmisión); si no, tapa la vista de TV. "Rendimiento: ligero" baja la hinchada al 35 %.

## Estadios: alambrado, banderas y efectos de hinchada (fútbol)
- `01-futbol/stadium-fx.js` (cargado por `stadium-loader.js`): las banderas del export venían sin posición (todas apiladas en el centro); se descartan y se generan ~640 sobre las butacas (banderas con palo y trapos en alto, más en las populares; diseños con los colores y el nombre del club local).
- Alambrado perimetral con postes, malla romboidal y remate curvado hacia la cancha, detrás de los carteles.
- Efectos: bengalas de humo de colores al gol (muchas si convierte el local, pocas si el visitante), papelitos y globos durante el partido según la energía de la hinchada, recibimiento al pitazo inicial. "Rendimiento: ligero" reduce las cantidades a la mitad.
- Los eventos se disparan desde `stadiumTick` en `fulbo.html` por cambio de `match.phase` (`goal`, `ready` → `playing`).

## Copas, naciones, tribuna, transmisión y circuitos (ronda de completitud)

- **Copas de eliminatoria** (partido único, entre jornadas de la liga):
  - Fútbol: **La Cupidité** (`01-futbol/manager/tlm-cup.js`, pantalla «LA CUPIDITÉ» en el manager). 16 clubes, octavos a final, se juega entre semana; penales si hay empate; premios por ronda. Al jugar el partido en 3D se activan las gráficas propias de la copa (`lfoskin/cupidite.css`, marca en `equiposfut/cupidite/`). Placeholders y qué reemplazar: `01-futbol/lfoskin/CUPIDITE_PLACEHOLDERS.md`. Pruebas: `node manager/tests/cup.test.mjs`.
  - Básquet: **Copa LBO** (`05-basquet-courtside/src/manager/cup.js`, pantalla «Copa»). NFL: **Copa LGO** (`06-nfl-gridiron/src/manager/cup.js`, página «Copa»; las semanas de copa son semanas del calendario). Los nombres están en la constante `CUP` de cada archivo.
- **Efecto de gol** (cosmético tipo `gfx` en la Tienda Diaria del hub): «Explosión» sale del balón cuando el equipo del usuario marca (`01-futbol/goalfx.js`). Se equipa en Vestuario (3 situaciones, igual que música y celebración).
- **Naciones ficticias**: `assets/nations/nations.js` (banderas en `assets/nations/*.jpg`, copias limpias de `01-futbol/nations`). Los jugadores de fútbol, los pilotos de LRO y los peleadores de LLO usan esas naciones; las cartas de fútbol muestran bandera y escudo.
- **Tribuna** para LBO, LGO, LRO y LLO: `assets/tribuna/tribuna.js` (guía: `assets/tribuna/TRIBUNA_PARA_IA.md`).
- **Transmisión** (intro, placas y estudio en LBO, LGO, LRO, LLO): `assets/broadcast/broadcast.js` (guía: `assets/broadcast/BROADCAST_PARA_IA.md`). El estudio es solo texto: presentadores antes, en el entretiempo y al final.
- **Carreras**: 20 fechas y 20 circuitos con lore (`07-carreras-apex/circuits.js`); los archivos `circuits/<id>.json` reemplazan trazado y decorado. Guía para la IA: `07-carreras-apex/CIRCUITOS_PARA_IA.md`.
- **Auditoría** de incongruencias entre módulos: `_INFO/AUDITORIA.md`.
- Para recompilar Courtside y Gridiron después de tocar su código o los archivos de `assets/` que empaquetan (`tribuna.js`, `nations.js`, `broadcast.js`): `npm install`, build, `inline.py` (Courtside) o corregir la ruta del puente en `dist-single` (Gridiron), y borrar `node_modules`.

## Competiciones, clubes invitados y calendarios
- **COMPETICIONES (fútbol):** pestaña nueva del manager con la tarjeta de la liga y la de La Cupidité, clasificados provisorios, cuadro de llaves y campeones. Configuración completa en `_INFO/LA_CUPIDITE.md`.
- **Clubes invitados:** 9 clubes del Continente Viejo (`GUEST_CLUBS`), sin liga ni mercado; se crean al abrir la carrera. Naciones nuevas en `assets/nations/nations.js` (campo `continent`).
- **Laboratorio de jugadas (Centro de partidos):** ahora también elige estadio y competición, simula la prórroga (2 × 15′) y la tanda de penales. En consola: `LFO_LAB.setComp('cupidite')`, `LFO_LAB.extraTime()`, `LFO_LAB.shootout()`. El motor acepta `match.tieBreak = { et: true, pens: true }`.
- **Calendarios:** LRO (`CALENDARIO`), LLO (`Calendario`), LBO (filas de copa en `Calendario`), fútbol (marcas de copa en `CALENDAR`).
- **Cartas:** LRO: la Tribuna usa el diseño de carta del Mercado (retrato del módulo); LLO: la ficha del peleador muestra la carta de la Tribuna con el retrato del módulo.
- **Pruebas nuevas:** `node manager/tests/cup.test.mjs` (16 casos), `node bench/defense_check.mjs` (delanteros solos), `node bench/et_check.mjs` (prórroga), `node bench/pen_check.mjs` (conversión de penales).



## Transmisión: penales, anuncios y pop-ups
- **Tanda de penales rehecha:** la juega el motor (`ht.startShootout()` / `ht.simulateShootout()`), con un solo arco; los dos equipos esperan en el círculo central, el cobrador queda solo contra el arquero y patea a los **10 s**; el marcador (`PKUI` en `fulbo.html`) muestra quién patea, el resultado de cada penal, la **repetición** y pasa al siguiente. Termina en cuanto un equipo ya no puede alcanzar al otro y sigue en muerte súbita. Prueba: `node bench/so_check.mjs`.
- **Copa en la carrera:** un empate a los 90′ en La Cupidité va a **prórroga (2 × 15′)** y, si sigue igual, a la **tanda en 3D**; el resultado de los penales se registra en el manager.
- **Anuncios:** `assets/videocomerciales/` (28 videos) + `assets/broadcast/adbreak.js`: tanda de ≤ 60 s (uno largo o dos cortos) en la previa y el descanso del fútbol y en el descanso de LBO y LGO. Ver `assets/videocomerciales/LEEME.md`.
- **Pop-ups de TV** (`01-futbol/lfoskin/lfo-popups.js`, `popups.css`): GOLES, TARJETAS, CAMBIOS, TABLA (o llaves en la copa), ESTADÍSTICAS, FIGURA, GOLEADORES, ESTADIO Y PÚBLICO, TIEMPO AGREGADO, cartel del cobrador, aviso de tarjeta y banners de anunciante. Cada ~40 s de juego con la pelota viva; ajuste en 📺 «Pop-ups de TV». Piel de La Cupidité automática. Prompts de arte: `_INFO/PROMPTS_IA/07_popups_y_anuncios.md`.
- **Cartas de carreras:** la Tribuna ahora dibuja la carta con el diseño del Mercado (`drawFront` en `assets/tribuna/tribuna.js`, usado por `tribuna-lro.js`); el Mercado y Pilotos volvieron a su diseño original.

## Arquero, reglas de juego colectivo y disciplina de formación
- **Arquero** (`01-futbol/fulbo.html`): nueva **estirada abierta** (`spread`, brazos y piernas en cruz; se usa al salir al cruce del rival que llega solo y en remates a menos de ~9 m), **recogida** (`gather`, pelota mansa en el área) y abrazo sostenido. Al agarrar la pelota la retiene **mínimo 5 s** (`GK_HOLD_S`), pegada al pecho, y nadie se la puede sacar de las manos. Posición: bisectriz centro-del-arco → pelota; la salida de la línea depende de la distancia del rival con la pelota (`p3GkPosition`). Un temporizador de seguridad evita que quede colgado en el aire (`diveAge`).
- **Reglas de juego colectivo** (panel TÁCTICAS → «Reglas de juego», por equipo, con números editables y guardado en el navegador): Juego de pases, Distancia personal, En busca del centro, Defensa plantada, Defensa férrea (activas de fábrica) + Tope de perseguidores, Ancla de formación, Línea defensiva coordinada, Bloque compacto (disciplina, activas) + Extremos abiertos, Laterales al ataque, Delantero de enlace, Carrera al contragolpe, Llegada al segundo palo (apagadas). Definición: `TAC_RULES` (fulbo.html); efecto: `tacPrep()` / `tacApply()`. Prueba: `node bench/tac_check.mjs`.
- **Red del arco:** gol sólo si la pelota sale del campo por la línea; paños laterales, fondo y techo sólidos.
- Pruebas del arquero: `bench/gk_check.mjs`, `bench/gk_stuck.mjs`, `bench/gk_hold.mjs`.

## Circuitos de carreras: lore nuevo, prompt único y modelo descargable
- **Lore rehecho** (`07-carreras-apex/circuits.js`, `CIRCUIT_META`): 20 circuitos en 20 naciones (Zenet sin fecha), incluidas las 5 del Continente Viejo (Estovackia: talleres ferroviarios; Kostanay: estepa con cohetes; Baikal: lago helado; Netanya: salar bajo el nivel del mar; Overmark: noche polar). Cada ficha suma tipo, silueta, rasgo único y kit de decorado; los temas, colores y números de juego (agarre, lluvia, temperatura) cambian con el carácter.
- **Un solo prompt:** `_INFO/PROMPTS_IA/02_circuitos_PROMPT_UNICO.md` (reemplaza a los 21 archivos anteriores). Devuelve un único `circuits/circuits.json`, que el juego carga solo.
- **Modelo aislado en JSON:** botón «⬇ Descargar JSON del circuito actual» (Campeonato → Atlas de circuitos) y `circuits/_modelo_valleverde.json` con decorado de ejemplo.
- **Requisitos técnicos** (spline, boxes, parrilla, guardarraíles, zona reservada, props) en `07-carreras-apex/CIRCUITOS_PARA_IA.md`; validador `tools/check_circuit.mjs` y unión de partes `tools/merge_bundle.mjs`. Nuevos campos opcionales: `treeCount`, `hills`, `foliageColor`, `gripMod`, `brakingMod`, `aeroMod`, `overtakeDiff`.

## Tiro lejano, fin de tiempo y arquero con la pelota
- **Tiros de lejos** (`fulbo.html`, `ai2Select`): el remate desde >17 m se desalienta (`LONG_SHOT_DAMP`, `LONG_SHOT_PENALTY`; 1 y 0 = como antes) salvo especialistas (Long Shot / buen pegador), arquero adelantado, carril libre o compañeros tapados. Sigue existiendo el **golazo** (remate lejano a la escuadra que el arquero no ataja; más probable con Long Shot y buena puntería). Prueba: `bench/shot_dist.mjs`.
- **Fin de los tiempos** (`periodCheck`): cumplido el tiempo (45′/90′ + descuento; 15′ de prórroga) no se corta en juego: se espera a que la pelota salga. Un córner se juega (última jugada). Antes el corte se disparaba con un salvavidas de +400 s de reloj (~27 s reales) en medio del juego. Prueba: `bench/end_check.mjs`.
- **Arquero con la pelota agarrada:** camina dentro del área (`p3GkCarry`), animación de pelota «embolsada» (abrazada al pecho con los dos antebrazos) y los rivales no pueden acercarse a menos de 5 m (`GK_BUBBLE`, `gkBubble`); la retiene 5 s como mínimo. Prueba: `bench/gk_hold3.mjs`.

## IA de remates, tiros libres y reglas nuevas
- **Plan de remate** (`fulbo.html`: `ai2ShotPlan` + `ai2ShotSolve`): el delantero evalúa ~100 candidatos (tipo × punto del arco × altura) con la posición real del arquero (lateral, cuánto salió, si ya se tira, su reacción), los defensores en la línea de tiro, su puntería/presión y la distancia; elige el de mayor P(entra) × (1 − P(el arquero llega)) × (1 − P(lo tapan)) con una decisión «acotada». La velocidad inicial se RESUELVE simulando la pelota real (gravedad, roce, efecto) para pasar por el punto elegido. Tipos: Tiro potente / lejano, Tiro colocado (con efecto), Rosca (efecto fuerte al ángulo), Tiro raso / Raso cruzado, Picada, Vaselina y Trivela (rasgo). Prueba: `bench/shot_types.mjs`.
- **Tiros libres directos:** la secuencia de disparo cubre hasta 32 m y ±24 m de ancho, y en los que no entran en ella el remate siempre es una opción (`p3SetPieceFilter`). Prueba: `bench/fk_lab.mjs`.
- **Reglas de juego nuevas:** «Sin pasarse del último defensor» (activada) y «En busca del centro» ahora va primero a buscar la pelota que pasa cerca (`grab`, 9 m). Prueba: `bench/offs_check.mjs` (fuera de juego 10 → 0 en 4 partidos).
- **Remates de primera:** cerca del arco (≤ ~24 m, de frente) los jugadores eligen mucho más definir de primera (`ai2ChooseTouch`); la precisión de esos remates baja con la velocidad con que llega la pelota (`recvSpeed`) y con la velocidad de carrera. Regla opcional **«Toques de primera»** (desactivada; +60 % de chance, editable) para pases y remates. Prueba: `bench/first_check.mjs` (remates de primera cerca del arco: 19 % → ~35 %, ~40 % con la regla).

- Arquero con la pelota: pose de embolsada corregida (brazos hacia adelante, la pelota sigue hacia dónde mira). Arqueros: reflejos, alcance, retención y velocidad de embolsar dependen de su habilidad (`gkSkill`) y en general son más lentos. Remates: menos errados (un solo filtro de precisión) y se prefiere tirar al marco antes que afuera. Prueba: `01-futbol/bench/gk_goals.mjs`.

- Chat (chat/chat.js, chat.css, stickers.js): página "Chat" en el hub, cajón flotante 💬 en todos los módulos, DMs, lista de jugadores, stickers de /reactions (video + audio) con enfriamiento de 10 s. Transporte local entre pestañas; `EMChat.useWebSocket(url)` para un servidor. Bridge: `Touchline.chat.setRoom/sendText/sendSticker/open`.
- Reglas de juego (delanteros/defensas/pases…) también en Modo carrera → Tácticas → "Reglas de juego" (se guardan en la carrera y se aplican al empezar cada partido).
- Temblor de cámara: gol (fuerte), palo, roja; se apaga en "Ajustar equipo".
- Reacción de arqueros: retardo mínimo 0,14 s (mejores) a 0,26 s (peores) (se revirtió el +0,1 s de los peores).

- Circuitos de carreras: instalados los 20 reales (GT3_20_Circuitos.zip) con decorado; los provisionales están en `07-carreras-apex/_backup_circuits_provisionales/`. Validar: `node 07-carreras-apex/tools/check_circuit.mjs 07-carreras-apex/circuits/circuits.json`.
