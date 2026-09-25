# REPORTE — Fase 1: reconstrucción radical del comportamiento del match engine

Estado: implementado, verificado con las 6 suites (101 tests, 0 fallos) y con benchmarks antes/después sobre los mismos seeds.
Nada está commiteado (el árbol de trabajo queda para revisión). Reproducir todo:

```bash
node --test manager/tests/*.test.mjs                 # 101 tests (incluye 30 micro-tácticos nuevos)
node bench/audit_movement.mjs 11 300                 # auditoría de velocidad/aceleración (Fase 13)
node bench/summary.mjs bench/results/after.json      # métricas de partido (BENCH_HTML=<otro fulbo.html> mide otra versión)
node bench/before_after.mjs                          # escenas antes/después (usa bench/results/fulbo_before.html = git HEAD)
node bench/steals.mjs                                # robos directos vs intercepciones
node bench/real/run_benchmark.mjs --selftest         # pipeline de tracking real (Metrica) validado sin descargar nada
```

## 1. Problemas raíz encontrados (con evidencia, no con intuición)

| # | Síntoma reportado | Causa raíz medida |
|---|---|---|
| 1 | Receptores que "nunca llegan" / pases a 10+ m | Tres modelos de balón distintos: `pass()` (velocidad nominal `16+0.28·d` que ignora el rozamiento real 0.27/s → llegaba a 14-16 m/s), `passOption`/`ai2PassCandidates` (lead fijo 0.55 s) y `ai2ReceiverTarget` (heurística `tStop`). El receptor recibía un `target` congelado al patear. Además un 40 % aleatorio corría el objetivo 4 m ("filtrado"). |
| 2 | Pases a rivales / bloqueados | El riesgo era geométrico ("rival cerca de la línea"), sin tiempo: no respondía "¿llega el rival ANTES que la pelota?". |
| 3 | Defensor acompaña a 4 m | `PRESS` sólo sprintaba si `dist > 4.5·press`; dentro de ese radio corría a `v=1.04` **sin sprint** tras un poseedor que conduce a `0.92·vmax` ⇒ velocidad de cierre ≈ 0. El tackle además exigía `g<1.15` y estaba bloqueado 1.05 s tras cada recepción (`protectedUntil`). |
| 4 | Robo directo casi inexistente | Medido: **7 intentos de duelo y 2 robos directos en 45 min** (125 intercepciones). Causas: ventana de protección de 1.05 s, radio de contacto fijo, falta 22 % por contacto sin importar el ángulo. |
| 5 | "Parecen trotar" | **La auditoría NO lo respalda:** velocidad media 5.3 m/s (19 km/h), 40 % del tiempo en SPRINT/BURST. Lo que estaba mal era la **curva**: 90 % de vmax en **0.38 s** (real ≈ 2-3 s), giros/frenadas instantáneos, picos de 12.6 m/s. Sensación de "trote" = ausencia de aceleración/frenada y presionadores sin sprint al cerrar. |
| 6 | Posicionamiento / persecución | 3+ rivales corriendo hacia el poseedor en el 25 % de los frames; cubridor elegido sólo por distancia (dejaba sin vigilar una ruptura); apoyos evaluados sin línea de pase real desde el poseedor. |
| 7 | Pitch control | Sumas de gaussianas con radio fijo: no responde "quién llega primero" ni con qué margen. |

## 2. Funciones eliminadas / reemplazadas

* **Eliminadas:** `passOption` (versión vieja, 100 líneas), `ai2ReceiverTarget`, rama de receptor con `l.target` congelado, el 40 % aleatorio de "filtrado" en `pass()`, la velocidad nominal `nominalSpeed/flightTime` de `pass()`, el gate `passOpt = this.passOption(t)` en `decide` (ahora `p1QuickPassOption`).
* **Reemplazadas:** `move()` (dinámica con límites de aceleración/frenada/giro), cálculo de intensidad de `ai2UpdatePitch` (tiempo de llegada), integrador de `updateBall` (ahora `ballFlightStep`, compartido), rama `PRESS` de `ai2PositionDefend` y `rk===0` de `updatePlayers` (`p1DefendCarrier`), bloque de tackle de `updateBall` (`p1DuelReach/p1DuelEval`), lista de candidatos por receptor de `ai2PassCandidates` (PassPlan), selección de `LANE_BLOCK/MARK/COVER/PRESS` en `ai2CoordDefense` (ThreatMap), `move()` final de `updatePlayers` (`p1Pace`).
* **Autoridad única conservada:** `decide → ai2Select → ai2Execute`; no se agregó otra capa: `p1.js` son los servicios que esas funciones consumen.

## 3. Nueva arquitectura

```
BallPlan (ballFlightStep) ─┐
p1ETA (mismo modelo que move) ─┼─► PassPlan ─► ai2PassCandidates ─► ai2Select ─► pass()  ─┐ mismo interceptPoint
p1Phys (vmax, a0, aBrake, aLat)┘        └► ThreatMap ─► ai2CoordDefense ─► p1DefendCarrier ─► p1Pace ─► move()
pitch control por tiempo de llegada ─► pcControl/pcSpace/pcPress (AI2) ─► ai2EvalPosition (+ p1PosExtras)
receptor: p1ReceiveTarget(BallPlan vivo) ─► p1Pace(RECEIVE) ─► move()
```

Código fuente del bloque: `p1/p1.js` (inyectado en `fulbo.html`, ver `p1/README.md`). ~540 líneas nuevas; el resto son ediciones dirigidas en el motor.

## 4. Modelo temporal del balón

`ballFlightStep(s, dt)` es el **único** integrador (gravedad, efecto, rebote, rozamiento rodando 0.27/s y aire 0.065/s) y lo usan `updateBall` y `p1SimBall` (BallPlan: posición/velocidad/altura cada 0.05 s hasta 3.4 s). `p1LivePlan()` (cacheado por tick) lo consume el receptor; `p1PlanPass` lo consume el pasador; `p1KickVel` fija la velocidad de salida con la misma fórmula que evalúa el plan (rasante: `v0 = v_llegada + 0.27·dist`, así la pelota llega a 9.5-14.5 m/s controlables y no a 16; aérea: tiempo de vuelo elegido + corrección de arrastre refinada con el integrador). Test: el plan predice la posición real a 1.5 s con error < 0.15 m.

## 5. PassPlan

Objeto: `passer, receiver, cls, aim, ball(trajectory), kick, interceptPoint{x,z,t}, flightTime, receiverETA, opponentETA, controlMargin, receiverMargin, interceptionRisk, blockRisk, contestRisk, progression, firstTouchOutcome (clean/pressured/heavy), arrivalSpeed, travel, feasible, reason`.
Factible sólo si: existe una muestra de la trayectoria (pelota < 1.25 m; < 1.5 m si es aérea) donde el receptor llega con margen (`ETA_receptor + alcance de control 0.45 m ≤ t`), sin viajar más de lo que admite el tipo (al pie 3.6 m, espacio 8.5, filtrado 14, cambio 9, centro 9), ningún rival llega antes que la pelota a **ningún punto** de la trayectoria (alcance de intercepción 1.0 m; arquero 1.8 m; muestreo cada 0.1 s) y la velocidad de llegada es controlable (según `firstTouchAbility`). Tipos con geometría propia: `feet / space / through / switch / cross` (`p1PassVariants`). Pasador y receptor comparten `interceptPoint`; el receptor lo persigue **dinámicamente** en el BallPlan vivo (`p1ReceiveTarget`) y **abandona** si se vuelve inalcanzable.
Razones de descarte registradas: `receiver_cannot_reach, too_far_for_kind, lane_blocked, opponent_first, arrival_too_fast, no_window`.

## 6. Modelo de duelo (Fase 5/17)

`p1DuelReach` (radio de contacto 1.15 → 1.6 m según exposición de la pelota y cierre) y `p1DuelEval` (probabilidad de ganar y de falta desde la **geometría**: pelota expuesta, ángulo de entrada frontal/lateral/por la espalda, velocidad de cierre, escudo, atributos de ambos). Ventana de protección tras recibir: 1.05 → 0.35 s. Atacante: `p1DefenderCommit` (¿el defensor ya se comprometió?) modula `WAIT` (baja el ritmo si sostiene con rival cerca), el valor de "esperar" del regate y el éxito del cambio de ritmo (`p1DuelBonus`: aceleración/lectura propias vs rival, no una etiqueta).

## 7. Modelo defensivo (Fase 6/7/8/9)

`p1CarrierRead` estima **qué puede hacer el atacante ahora** (`timeToShot`: zona, ángulo, carril, orientación; `timeToPass`; exposición) y `p1TimeToContact` cuándo llega cada defensor. `p1DefendCarrier`: si `timeToContact ≤ timeToShot` ⇒ `CLOSE_DOWN → CONTACT` (sprint, llega del lado que niega el tiro); si no llega ⇒ `SHOT_BLOCK` (se planta en la línea de tiro); sin urgencia ⇒ `CONTAIN` con distancia 1.7-5 m que depende del peligro, cobertura, velocidad rival y agresividad (orienta hacia la banda). El cubridor cierra la línea de tiro si el presionador no llega. `p1ThreatMap` (ahora / tras recibir / tras conducir / a la espalda / remate) reemplaza al `dangerAt` crudo en la elección de PRESS/COVER/LANE_BLOCK/MARK y aporta un **coste de abandono** (un central no sale a presionar lejos ni hace de cubridor con una ruptura a su espalda).

## 8. Posicionamiento ofensivo (Fase 10/11)

`p1PosExtras` en `ai2EvalPosition`: línea de pase real desde el poseedor a la celda candidata, rango de apoyo, **triángulo** (poseedor-yo-otro compañero con lados jugables y ángulo abierto — emerge de la geometría), beneficio por fijar rivales y **penalización de persecución** (un tercer jugador cerca del balón sobra). Pitch control: arribo por celda de 1º y 2º jugador (posición, velocidad, aceleración, giro, vmax, fatiga, reacción) con ETA cerrado calibrado contra el ETA exacto (RMSE 0.22 s) y constantes de control/presión calibradas para conservar la escala sobre la que AI2 estaba calibrado (`bench/pc_compare.mjs`, `bench/pc_fit.mjs`).

## 9. Movimiento y velocidad (Fase 13/14) — auditoría primero

| Medida | Antes | Después | Referencia real |
|---|---|---|---|
| Velocidad máx. (sprint, speed 75-99) | 32-36 km/h | igual (no se tocó) | 30-36 km/h |
| t90 de vmax en sprint | **0.38 s** | **2.1 s** | ~2.5-3.5 s |
| Frenar 8→0 m/s | instantáneo | 0.8 s | ~0.9-1.2 s |
| Pico observado en juego | 12.6 m/s | 10.2 m/s (los >11 m/s que quedan son los desplazamientos guionados de `freekick`/`goal`, pre-existentes) | ≤ 10 |
| Tiempo en SPRINT+BURST | 40 % | 20 % | ~2-4 % |
| Tiempo parado+caminando | 17 % | 18 % | ~60 % |
| Velocidad media | 5.3 m/s | 4.4 m/s | ~1.9 m/s |

Decisión: **no se cambiaron las velocidades máximas** (correctas). Se reemplazó la curva: `a = a0(1−v/vmax)` (a0 = 4.8+0.055·accel, ×fatiga), frenada `aBrake`, giro `aLat`, curva de frenada al llegar. La velocidad ahora sale de `p1Pace`: destino + intención + urgencia + atributos (receptor corre lo que necesita para llegar con ventaja y frena antes de recibir; presionador/`SHOT_BLOCK`/carrera al espacio sprintan; posicionamiento es un controlador proporcional a la distancia). **Limitación honesta:** el tempo global sigue ~2.3× el real (el motor es un juego más activo que un partido real); calibrarlo contra tracking real está pendiente (ver 11/15).

## 10. Individualidad por atributos (Fase 19)

Ningún código nuevo usa OVR (test Z lo verifica). Los atributos entran en: ETA (speed, acceleration, stamina, anticipación como reacción), recepción (`firstTouchAbility`), lectura del tiro (anticipación estima `timeToShot`; test Y), horizonte de pase (`decisionHorizon`), coste de abandono (`spatialUnderstanding`), duelo (defense, physical, intelligence, consistency, dribbling, composure, creativity, estilo), agresividad (distancia de contención). Tests: X (rápido alcanza el pase que el lento no), Y (mejor anticipación lee antes el tiro).

## 11. Benchmarks reales

* Herramientas: `bench/real/` — parser Metrica (tracking 25 FPS + eventos), `metrics.mjs` (velocidad, aceleración, distancia defensor-poseedor, defensores <5 m, tiempo recepción→presión, spacing, ancho/profundo, líneas, duración de posesión, sprints), `engine_frames.mjs` (el motor muestreado al mismo formato), `run_benchmark.mjs`, `fetch_samples.mjs` (Metrica; documenta SkillCorner/Driblab/IDSSE).
* Validación: `--selftest` exporta un partido del motor a CSV Metrica, lo re-parsea y compara métricas: **OK**.
* **No se ejecutó contra datos reales:** descargarlos (3 CSV de Metrica, cientos de MB) requiere tu aprobación explícita. Con `node bench/real/fetch_samples.mjs metrica` y luego `run_benchmark.mjs --metrica bench/real/data/Sample_Game_1` sale la tabla real vs motor. SkillCorner/Driblab/IDSSE necesitan conversores a frames normalizados (no escritos: no verifiqué sus esquemas y prefiero no inventarlos).

## 12. Tests micro-tácticos (`manager/tests/micro.test.mjs`, 30 tests)

Física (aceleración, frenada, ETA vs `move()`), BallPlan, A pase corto, B pase al espacio (mismo punto pasador/receptor), C pase imposible, D pase bloqueado, E cambio de frente, F receptor que abandona, G 1v1, H tiro con defensor cerca, I tiro con defensor lejos, J duelo por geometría, K robos directos, L delantero de espaldas, M 2v1, N salida por banda, O ruptura, P centro/cutback, Q segunda pelota, R presión alta, S low block, T transición, U distribución del arquero, V anti-persecución, W ritmo por intención, X/Y/Z individualidad. Cada uno corre 8 seeds. Umbrales fijados por mí; los que fallaron al principio dieron **cambios de motor reales** (ETA con alcance de intercepción, `timeToShot` sin ángulo, cubridor con ruptura) salvo dos ajustes de test que justifico: L pasó a medir la decisión en el instante de recibir (el propio `move()` gira al portador en 1 frame) y P usa radio 12 m (los defensores marcan a los atacantes que se abren).

## 13. Antes / después

Motor anterior = `git HEAD` (`bench/results/fulbo_before.html`), mismos seeds 21-24 × 900 s:

| Métrica | Antes | Después |
|---|---|---|
| Pases completados | 51 % | **75 %** |
| Pases perdidos al rival | 24 % | **9 %** |
| Longitud media del pase | 24.6 m | 21.1 m |
| Frames de tiro claro con el defensor a >3.5 m | 49 % | **29 %** |
| Distancia mediana defensor-poseedor | 4.15 m | 3.86 m |
| Frames con ≥3 rivales corriendo al poseedor | 25 % | **16 %** |
| Intentos de duelo (45 min) | 7 | **56** |
| **Robos directos** (45 min) | **2** | **25** |
| Intercepciones (45 min) | 125 | 64 |
| Faltas (45 min) | 0 | 7 |
| Tiempo de simulación por 90 min | 41.9 s | **38.8 s** |

Escenas (`bench/before_after.mjs`): pase largo a un receptor que un rival alcanza antes: **se jugaba en el 100 %, ahora 0 %**. Pase con rival sobre la línea: 0 % → 0 % (el motor viejo ya cortaba el caso extremo; la mejora estructural está en el largo/aéreo y en el receptor).
Cualitativos: (a) ANTES `pase aparentemente correcto / receptor nunca llega` → DESPUÉS `pase descartado (reason=receiver_cannot_reach/lane_blocked) o apunte modificado al punto alcanzable`; (b) ANTES `atacante en zona de tiro, defensor a 4 m mantiene distancia` → DESPUÉS `defensor entra en SHOT_BLOCK/CLOSE_DOWN con sprint y del lado que niega el tiro; el cubridor cierra la línea si el presionador no llega`.

**Regresiones que hay que decir:** (1) En escenas estáticas de 1v1 el defensor tarda **más** en llegar (1.16 → 1.73 m de distancia mínima en 2 s; 0.46 → 0.76 s hasta estar a <2 m): antes "llegaba" porque aceleraba en 0.38 s; con aceleración humana debe empezar antes, y lo hace por decisión, no por física. (2) **Los tiros por partido subieron** (83 → 135 en 60 min, ambos equipos): más pases completados ⇒ más ataques, más faltas ⇒ más tiros libres, y menos opciones de pase factibles empujan a tirar. Ambos números (antes y después) están muy por encima de lo real (~25/partido); su calibración no se abordó.

## 14. Performance

Coste por paso ~0.12 ms (partido de 90 min en 38.8 s en Node, ≈ igual que antes). El pitch control por arribo era el 44 % del coste con Newton por celda; se pasó a una fórmula cerrada calibrada (12.1 → 7.0 s por 600 s de juego). El ThreatMap corre a 3 Hz; los PassPlan sólo en decisiones del poseedor y a 3 Hz por atacante rival; BallPlan cacheado por tick.

## 15. Problemas pendientes (sin maquillar)

1. **Datos reales sin correr** (necesita tu OK para descargar); sin ellos el tempo global (2.3× real), la proporción caminar/trotar y la cantidad de tiros no se pueden calibrar con evidencia.
2. Tiros/partido inflados (ver 13). Requiere calibración de `ai2Select`/faltas.
3. `firstTouchOutcome` del PassPlan se **estima** y filtra el pase, pero el modelo de primer toque de `possession()` no lo consume todavía; la orientación de recepción es una apertura de cuerpo simple.
4. Dribbling (Fase 17): `WAIT`, lectura de compromiso y cambio de ritmo con atributos están; `FEINT/SLOW/RELEASE` como estados propios siguen siendo las habilidades de `startDuel`. `FORCE_PASS`/escudo: sólo orientación a la banda en `CONTAIN`.
5. `wc.prototype.move` sigue envuelto por el parche de línea defensiva (`lfoBackLine`, bloque TLB): es el patrón "parche sobre la IA" que conviene eliminar cuando el ancla de línea de `ai2DefAnchor` lo cubra (medirlo con `engine.test.mjs`).
6. `tlb/engine.js`/`tlb/build.mjs` siguen desincronizados de `fulbo.html` (deuda ya documentada); `p1/p1.js` es fuente de verdad del bloque nuevo.
7. Refinamiento local del pitch control y "threat after pass" completo (hoy aproximado por `progression`) no implementados.
8. Los desplazamientos guionados de reinicios (`freekick`) producen velocidades de 11-15 m/s que no pasan por `move()`.
