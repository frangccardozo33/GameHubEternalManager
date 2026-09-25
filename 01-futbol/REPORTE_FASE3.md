# REPORTE FASE 3 — Calibración contra tracking real + porteros, barridas, pelotas paradas y laboratorio de jugadas

Todo el código nuevo vive en `p1/p3.js` (se inyecta junto a `p1/p1.js` con `node p1/inject.mjs`). Tests: `manager/tests/p3.test.mjs` (14) + las 6 suites previas (101) + 12 del benchmark, **todas en verde**.
Aclaración sobre cómo verifiqué las animaciones: el navegador integrado no permite ver a un jugador de cerca (cámara TV lejana), así que las poses se validaron **midiendo los huesos en el render real** (posición mundial de cabeza y botas durante cada acción), no con capturas.

## 1. Calibración contra Metrica (las 4 prioridades del informe de la Fase 2)

Mismas 3 seeds × 15 min; real = Metrica Sample Game 1+2 (190.8 min). `F1` = motor al cierre de la Fase 1, `F3` = ahora.

| Métrica | F1 | **F3** | Real | Estado |
|---|---|---|---|---|
| Aceleración tangencial p99 (m/s²) | 7.50 | **5.09** | 2.92 | mejor; sigue alta (ver nota) |
| Frenada tangencial p1 (m/s²) | −9.61 | **−6.44** | −3.00 | mejor; sigue brusca |
| t al 90 % de la velocidad pico (s) | 2.3 | **3.1** | 3.0 | **igual al real** |
| Velocidad media (m/s) | 4.52 | **3.75** | 1.87 | mejor; tempo aún 2× |
| Tiempo en sprint (≥5.5 m/s) | 40.4 % | **16.4 %** | 2.0 % | mejor; aún alto |
| m/min sin balón | 274 | **222** | 135 | mejor |
| Seguimiento del balón (slope x) | 0.57 | **0.47** | 0.37 | mejor |
| Retención del orden a 5 s | 0.72 | **0.80** | 0.91 | mejor |
| Cambios de dirección / jugador·10 min | 14.0 | **4.4** | — | (el motor giraba de golpe) |
| Margen del receptor p50 (s) | 0.06 | **0.16** | 0.46 | mejor |
| Pases completados | 67.5 % | **70.3 %** | 76.7 % | mejor |
| Intercepciones / 10 min | 60.6 | **52.2** | 23.2 | mejor; aún 2.3× |
| Tackles / 10 min | 27.2 | 22.2 | 25.0 | ≈ real |
| Línea de pase interceptable | 35.2 % | **33.8 %** | 18.6 % | poco cambio |
| Longitud media de pase (m) | 19.4 | 18.9 | 13.2 | **casi sin cambio** |
| Área del bloque (m²) | 1229 | 1196 | 841 | **casi sin cambio** |
| Defensor→poseedor p50 (m) | 3.97 | 3.72 | 4.59 | (ya era parecido) |
| Tiempo hasta contacto p50 (s) | 1.47 | 1.69 | 2.38 | algo mejor |

**Qué cambié (y por qué):** `p1Phys` (aceleración a0 = 3.3+0.036·ac, frenada 4.6+0.022·ac, giro 5+0.03·ac), `p1Pace` (al posicionarse se trota, sólo se corre fuerte con urgencia y la urgencia escala con la distancia), ritmo de conducción del poseedor (0.62 en vez de 0.8), penalización de pases largos e interceptables. No toqué velocidades máximas.

**Lo que NO logré (honesto):** longitud de pase, compactación del bloque y línea de pase interceptable apenas se movieron; aceleración y frenada mejoraron mucho pero siguen 1.7–2.1× por encima del real (el t90 ya coincide, así que bajar más la aceleración retrasaría los arranques sin acercarme al real en lo que se ve). Además Metrica está suavizado, así que su −3.0 m/s² subestima los picos reales. El tempo global sigue ~2×: es una decisión de intensidad del cerebro, no de física, y es el siguiente frente.
Tres de mis propios tests micro se ajustaron por esta recalibración (rango de t90 de 1.6–3.2 a 1.6–4.0 s; dos escenas de pase con geometría acorde a la aceleración realista) y uno de integración (la altura de la línea defensiva se mide ahora **respecto de la pelota**: con la seed fija por `tlmLoad` las tres "seeds" eran el mismo partido y la altura absoluta dependía de dónde estuvo el balón).

## 2. Porteros

**Bug de animación (se tiran hacia adelante/atrás):** la causa exacta: la pose de estirada fijaba `model.root.rotation.y` (pecho hacia el campo) pero `finishArchiveFrame` la pisaba después con `visualAngle` (dirección de carrera). Con el eje de rotación lateral mal orientado el cuerpo se acostaba a lo largo del eje x. Arreglo: `model.yawOverride`, que `finishArchiveFrame` respeta. **Verificado midiendo huesos en el render**: en la estirada lateral el vector botas→cabeza queda en (dx −0.08, dz **1.44**) → cuerpo horizontal a lo largo de la línea de gol.

**Nuevas acciones** (`t.dive` como temporizador + `diveKind`/`diveDur`, también en el replay):
| Acción | Cuándo | Animación |
|---|---|---|
| `side` | tiro esquinado | estirada lateral (corregida) |
| `back` | globo por encima del arquero (altura prevista 2.05–3.6 m) | salto arqueado hacia atrás con brazos arriba (botas→cabeza dx −1.37, dy 0.53 medido) |
| `claim` | centro que puede ganar | salto con dos manos arriba, rodilla flexionada |
| `punch` | centro con tráfico o poca confianza | salto, dos puños; despeja lejos y a los costados |
| `smother` | rival con la pelota larga a <3.5 m | lanzamiento de pecho a los pies, brazos adelante; duelo: roba (evento "¡LE SACÓ LA PELOTA DE LOS PIES!"), falla o comete falta/penal (usa `commitFoul`) |

**IA del arquero** (`p3GkRead` → `p3GkPosition` → acción):
- **Libero / dar juego:** sin delanteros a <30 m sube (3.5–16 m, más si es "Sweeper Keeper") y se ofrece en el lado libre del que tiene la pelota. Los defensas ahora **pueden pasarle atrás** (`p3GkBackpassOk`: sólo bajo presión, en campo propio y con el arquero libre); el arquero **debe jugarla con los pies** (regla del pase atrás, evento "PASE ATRÁS").
- **1v1:** achica siguiendo la bisectriz del carril al arco (profundidad ∝ distancia del rival).
- **Pase filtrado:** `p3GkSweepRead` recorre la trayectoria del balón y sale si el arquero llega antes que el delantero y ningún defensa llega antes que este; **fuera del área nunca usa las manos** (0 casos en los tests) y juega de pie.
- **Rebotes:** retención vs rebote (depende de la fuerza del remate, si estiró y de sus atributos). Rebotes al **córner**, a un **costado** o **al centro del área** (evento "REBOTE AL CENTRO DEL ÁREA"); un buen arquero controla más el rebote.

## 3. Barridas
Diagnóstico: la barrida usaba `move()` a ritmo de carrera; con la aceleración realista casi no avanzaba, y la pose lo acostaba **de costado**.
- **Física:** impulso real (6.2–9.4 m/s hacia el punto de contacto) con rozamiento; medido: se desliza **4.0–4.4 m**, de 7.5 a <1 m/s.
- **Animación:** tronco reclinado hacia atrás, cadera al piso, pierna extendida al frente, pierna interior flexionada, brazos abiertos, se incorpora. Medido en el render: cabeza de 1.62 a 0.91 m, botas 1.16 m por delante de la cabeza.
- **Nuevos usos** (`p3SlideScan`): (a) **quitar el balón al portador desde fuera del alcance de la pierna** (2.3–4.6 m, cerrando a >3 m/s); (b) **tapar tiros** (`ctx.block`: el balón pierde fuerza y sale desviado, evento "¡BLOQUEÓ EL DISPARO!"; 9/12 de las escenas de prueba). Las dos ocurren solas en partidos completos.

## 4. Pelotas paradas
- **Causa del bug:** el cobrador de tiro libre "no directo" pasaba a poseedor normal (`possession` + `phase=playing`) y la IA podía **conducir/regatear**. Ahora `taker.spTaker` activa `p3SetPieceFilter`: sólo **pase / centro / despeje / tiro (si es directo y a ≤36 m)**, y queda quieto hasta jugarla. Medido: conducción del cobrador **0.0 m** en 48 tiros libres (4 escenas × 8 seeds × 2 equipos), libera la pelota en el 100 %.
- **Posicionamiento:** en tiros libres que van al área (<44 m): los atacantes (menos 3 de descuento) ocupan 8 puestos (primer palo, penal, segundo palo, borde…), los defensores forman línea zonal y 3 marcan hombre a hombre, respetando 9.15 m; el cobrador **espera hasta 10 s** a que los atacantes estén en sus puestos. Los directos a ≤30 m siguen usando la secuencia cinematográfica existente (barrera + disparo).
- **Corregido de paso:** los reinicios "por fuera" (córner, saque de banda, saque de arco) se cancelaban solos si la pelota seguía adentro; el laboratorio la deja fuera, como en un partido real.

## 5. Laboratorio de jugadas (Centro de partidos → panel lateral)
Panel **"Laboratorio de jugadas"** con selector de 23 situaciones, equipo que ataca (ARG / IBU / alternar), **"repetir en bucle"** cada N segundos de juego, "Ejecutar ahora" y "Detener bucle". Escenas: tiro libre directo cerca/medio, lejano y lateral (centro), en mitad de cancha y en campo propio, penal, córners (izq./der.), saque de banda, saque de arco, faltas en el área/borde/mitad, 1v1, rival con balón largo (smother), centro, pase filtrado, globo, tiro esquinado, salida jugada del portero, y las dos barridas. También `window.LFO_LAB` (consola) y `match.p3DebugScenario(kind, team)` (headless).

## 6. Verificación
`p3.test.mjs` (14): estiradas por tipo · claim/punch · 1v1 (achica, se lanza, duelo) · pase filtrado sin manos fuera del área · rebotes (retiene / córner / costado / centro) · libero · las 23 escenas sin NaN · cobrador sin conducir · área ocupada · directo y penal · impulso de barrida · bloqueo · barridas espontáneas en partidos · sin NaN. Suites previas: cognitive 10, core 34, engine 12, invariants 5, micro 30, scenarios 10 y benchmark 12: todas OK.

## 7. Pendiente / límites
- Tempo (~2× real), longitud de pase, compactación e intercepciones siguen por encima del real (tabla §1).
- Las poses nuevas se validaron por geometría de huesos, no visualmente de cerca; conviene mirarlas en el laboratorio con la cámara cercana y ajustar (sobre todo `claim`, `punch` y `smother`, que no pude medir en el render).
- Los contadores `gk_sweep`/`gk_side` en `p1.cnt` cuentan **frames**, no eventos.
- No hice ningún commit.
