# Auditoría de incongruencias entre módulos (fútbol como referencia)

Estado: **corregido** = ya está en el código; **placeholder** = existe pero es provisional (hay guía para reemplazarlo); **pendiente** = no se hizo.

## Lo que el fútbol tiene y los demás no
| Incongruencia | Estado |
|---|---|
| Presentación de equipos/formaciones antes del partido (LBO, LGO, LLO no la tenían) | corregido (`assets/broadcast`) — arte por deporte en `assets/broadcast/art/` (fondos de intro por deporte y escudo genérico con los colores del equipo) |
| Estudio con dos presentadores antes, en el entretiempo y al final | corregido en LBO, LGO, LRO, LLO: set con fondo por liga, mesa, pantalla con el logo y dos presentadores ilustrados (SVG) con boca y ojos animados. Pendiente: voz |
| Gráficas de TV en el partido (placas de eventos) | corregido: chapa propia de cada deporte (`plate-<liga>.png`) con franjas del color del equipo |
| Tribuna (álbum de cromos) solo existía en fútbol | corregido: `assets/tribuna` en LBO, LGO, LRO, LLO — diseño de carta placeholder (`TRIBUNA_PARA_IA.md`) |
| Torneos de eliminatoria además de la liga | corregido: La Cupidité (fútbol), Copa LGO, Copa LBO. LRO y LLO no tienen |
| Efectos/cosméticos de gol | corregido en fútbol (Explosión); en los otros deportes no existen cosméticos |
| Cartas sin escudo ni país | corregido: bandera de la nación y escudo del club en las cartas de fútbol y en la Tribuna |
| Audio: cánticos, relatores grabados, sonidos de estadio reales (solo fútbol) | pendiente: los demás usan sonidos sintetizados |
| Estadios 3D con hinchada, banderas y rejas (solo fútbol) | pendiente: arenas/estadios de los otros módulos son propios |

## Mundo ficticio (naciones)
| Incongruencia | Estado |
|---|---|
| Jugadores de fútbol con países reales (Argentina, Brasil, España…) | corregido: naciones ficticias (`assets/nations`), migración de partidas viejas |
| Pilotos de LRO con códigos reales (ARG, BRA, URU…) y banderas reales | corregido: códigos y colores de las naciones ficticias, migración de carreras guardadas |
| Peleadores de LLO con países reales | corregido: naciones ficticias + banderas, migración de partidas viejas |
| Básquet y NFL no tienen nacionalidad de jugadores | corregido para las cartas (nación determinista por jugador); no se guarda ni se muestra fuera de la Tribuna |
| Circuitos de LRO en países y ciudades reales (Argentina, Montevideo, Bolivia, Canadá…) | corregido: 20 circuitos con nación, región y lore ficticios; nombres reales renombrados |
| Nombres de equipos de LBO y LGO en inglés y compartidos entre deportes («Metro Foxes», «Harbor Kings», «Austin Outlaws»…) | pendiente: no encajan con el mundo de habla hispana; hay que definir una lista de equipos por nación |
| Nombres de jugadores de LBO/LGO en inglés | pendiente |
| Apodos de peleadores de LLO en inglés/portugués, sin relación con las naciones ficticias | pendiente |

## Otros hallazgos
| Hallazgo | Estado |
|---|---|
| LRO: los 8 primeros circuitos usaban el mismo trazado (solo cambiaban nombre y modificadores) | corregido: 20 trazados distintos (provisionales) |
| LRO: calendario de 18 fechas | corregido: 20 fechas (migración de carreras guardadas) |
| LRO: archivos muertos de un prototipo anterior (`main.js`, `scene.js`, `simulation.js`, `style.css`, `package.json`, `tests`) | movidos a `07-carreras-apex/_legacy/` |
| LRO: eventos de carrera en inglés («OVERTOOK», «FASTEST LAP», «PIT STOP»…) | corregido: traducidos |
| LRO: carteles con eslóganes («EL CAMINO ES TUYO», «DESDE 1968») | corregido |
| Fútbol: `manager/build.mjs` y `tests/load.mjs` no incluían los archivos agregados después (fechas, vestuario) | corregido |
| Fútbol: pruebas viejas contaban 1 fecha = 1 llamada a `finishRound` | corregido (las rondas de copa no cuentan) |
| Estadio 3D del fútbol: el nombre del estadio de la tarjeta del club no está ligado al modelo 3D | pendiente |
| LLO y LRO no tienen copas | fuera de alcance |
| La música del hub sonaba por debajo de las canciones de la Tienda | corregido: la música de fondo se pausa mientras suena una preview (`bgMusic.duck`) |
| Fútbol: dos cánticos a la vez y el botón de sonido no los cortaba | corregido: token por cántico + `_killAll()` al silenciar (`ua` en `fulbo.html`, expuesto como `window.LFO_AUDIO`) |
| Fútbol: los defensores soltaban al delantero cerca del arco | corregido: marca reservada antes de presionar/cubrir, marca pegajosa, sin errores humanos con un rival cerca del arco, presión base ×1.12 (`bench/defense_check.mjs` mide delanteros solos) |
| Calendario propio en cada módulo: fútbol (con las fechas de La Cupidité), LBO (con las rondas de la Copa LBO), LGO (semanas de copa), LRO (pestaña CALENDARIO con las 20 fechas y su circuito) y LLO (pestaña Calendario con las próximas 16 semanas) | corregido |
| Carreras y MMA: la carta de la Tribuna no se parecía al piloto/peleador del módulo | corregido: en carreras la Tribuna usa el retrato y el diseño de carta del Mercado; en MMA la ficha del peleador muestra la carta de la Tribuna con el retrato del módulo |
| Naciones del Continente Viejo (Baikal, Estovackia, Kostanay, Netanya, Overmark) y 9 clubes invitados de La Cupidité | corregido: ver `_INFO/LA_CUPIDITE.md`. Pendiente: nombres de jugadores del Continente Viejo solo en fútbol (los otros módulos usan las naciones nuevas sin nombres propios) |
| Fútbol: pestaña COMPETICIONES (tarjeta de trofeo de la liga y de La Cupidité, clasificados provisorios, cuadro de llaves) | corregido |
| Fútbol: Laboratorio de jugadas con estadio, competición (liga / La Cupidité), prórroga y tanda de penales | corregido |
| Fútbol: los arqueros atajaban ~98 % de los penales (leían la trayectoria perfecta) | corregido: eligen lado antes del remate (conversión ~65 %) |

| Fútbol: la tanda de penales eran patadas seguidas, no terminaba cuando ya había ganador y un penal podía no contarse | corregido: tanda dentro del motor con turnos, 10 s de espera, cobrador vs arquero, repetición y regla de fin anticipado (`bench/so_check.mjs`) |
| Fútbol: los penales de copa de la carrera se sorteaban sin verse | corregido: prórroga y tanda 3D conectadas a los partidos de La Cupidité (`tieBreak` + `pens` en el resultado) |
| LRO: el calendario tenía texto del color del fondo | corregido (tema oscuro en `motorsport.css`) |
| LRO: la Tribuna dibujaba otro diseño de carta que el Mercado | corregido: la Tribuna usa el diseño del Mercado (`drawFront`) |
| Anuncios reales (`assets/videocomerciales/`) en previa y descanso (fútbol, LBO, LGO) | hecho: `assets/broadcast/adbreak.js`. Pendiente: LLO y LRO no tienen descansos |
| Pop-ups de TV (tarjetas, goles, cambios, tabla, estadísticas…) con piel de La Cupidité | hecho: `lfoskin/lfo-popups.js`. Arte de los `pop-*.png` y logos de los 5 anunciantes hechos (`lfoskin/popups/sponsors/`) |
| LRO: lore de circuitos repetitivo y sin las naciones del Continente Viejo; 20 prompts separados | corregido: lore nuevo con variedad, 20 naciones, un solo prompt (`02_circuitos_PROMPT_UNICO.md`), bundle `circuits/circuits.json`, validador y modelo descargable |
| LRO: los 20 circuitos eran trazados provisionales sin decorado (y 4 con curvas más cerradas que la pista) | corregido: se instalaron los 20 circuitos reales de `GT3_20_Circuitos.zip` (trazado + 210–250 props cada uno) en `07-carreras-apex/circuits/`; los provisionales quedaron en `_backup_circuits_provisionales/`. El validador pasa 20/20 |
| `tools/check_circuit.mjs` daba un falso «tramos a 50 m» en horquillas cerradas | corregido: usa la distancia recorrida real y no el largo medio por muestra |

| Fútbol: gráficas de La Cupidité (21 placeholders de `lfoskin/cupidite/`) y logos en baja resolución | hecho: arte definitivo con los mismos nombres y proporciones, usando solo la marca oficial (logo, icono, wordmark y lema sin cambios). Set 3D del estudio y ceremonia del trofeo hechos (ver `CUPIDITE_PLACEHOLDERS.md`). Marcador en cancha rediseñado según el Broadcast Pack |
| Fútbol: balón de la liga y de La Cupidité | hecho: `LFO_BALL` (`fulbo.html`), cambia solo con el paquete de la copa |
| Fútbol: peinados de los jugadores 3D | rehechos 11 estilos y 14 nuevos (`cardlook.js`) |
