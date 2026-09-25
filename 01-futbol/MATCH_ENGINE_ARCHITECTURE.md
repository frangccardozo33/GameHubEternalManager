# Match Engine — Arquitectura (auditoría, sesión 2026-09-21)

> **Actualización — Fase 1 (reconstrucción radical del comportamiento):** ver [REPORTE_FASE1.md](REPORTE_FASE1.md). El modelo temporal único del balón, el PassPlan, el duelo/defensa por peligro, el pitch control por tiempo de llegada, el ThreatMap operativo y el ritmo por intención viven en el bloque `<<P1_BEGIN/END>>` de `fulbo.html` (fuente: `p1/p1.js`). Varias secciones de este documento (p. ej. `passOption`, `ai2ReceiverTarget`, pitch control gaussiano, `move()` exponencial) describen código que fue **reemplazado** en esa fase.


Este documento resume el resultado de la auditoría profunda del match engine pedida en el
prompt maestro de reconstrucción. **No es una reescritura del motor**: dado el tamaño real del
código (un único `fulbo.html` de ~36.400 líneas / 1.39 MB que concentra motor 3D + IA + UI + editor,
más `tlb/*` y `manager/*`), esta sesión se enfocó en auditar con evidencia real (siguiendo llamadas,
no nombres de función) y corregir con precisión los bugs concretos que el auditoría pudo confirmar y
verificar con el arnés de tests headless existente, dejando documentado y acotado el resto del trabajo
de reconstrucción arquitectónica para continuarlo sin perder lo ya mapeado.

## 1. Dónde vive realmente el motor

Contra lo que sugieren los nombres de archivo, la IA de decisión/posicionamiento/tiro/pase/defensa
**no** vive en `tlb/engine.js` ni en `manager/engine.js`:

- `tlb/engine.js`, `tlb/motion.js`, `tlb/app.js`, `tlb/graphics.js`, `tlb/referee.js` → capa de
  **broadcast/animación/cámara** (BroadcastDirector, poses, stingers, réplicas). Documentado también
  en `tlb/README_TLB.md`. No toma decisiones de fútbol.
- `manager/engine.js` → puente entre el modo carrera (`manager/tlm-*.js`) y el motor 3D: carga la
  configuración (`tlmLoad`), gestiona cambios físicos de jugadores y arma `tlmResult()`. Tampoco
  decide fútbol.
- **El motor real (clase `wc`) vive inyectado dentro de `fulbo.html`**, entre los marcadores
  `<<TLM_ENGINE_BEGIN/END>>` y `<<TLB_ENGINE_BEGIN/END>>`. `manager/headless.mjs` lo extrae de ahí
  con una regex para poder correrlo en Node sin browser — es el mecanismo real que usan
  `manager/tests/engine.test.mjs` para simular partidos completos.

Esto explica por qué buscar `function decide(`, `function updatePlayers(` etc. no encuentra nada: son
métodos de la clase `wc` (`decide()`, `updatePlayers()`, `keeper()`, `commitFoul()`, `restart()`, los
métodos `ai2*`...), no funciones sueltas.

## 2. AI2 vs legado — estado real (no supuesto)

El propio motor documenta la introducción de AI2 en un bloque `// <<AI2_BEGIN>>` (línea ~6274) que
resume su propia arquitectura:

```
1 TEAM BRAIN ............ ai2Brain (histéresis de fase / presión alta), teamTactics()
2 ATTACK COORDINATOR .... ai2CoordAttack   (BALL_CARRIER/SUPPORT/WIDTH/DEPTH/RUNNER/FIXER/...)
3 DEFENSE COORDINATOR ... ai2CoordDefense  (PRESSER/COVER/LANE_BLOCK/MARK/SCREEN/BALANCE/DROP)
4 INDIVIDUAL BRAIN ...... ai2Perceive + ai2Candidates + ai2Select (racionalidad limitada)
5 EXECUTION LAYER ....... ai2ExecQuality (error de ejecución ≠ error de decisión)
```

Es decir: **AI2 ya implementa gran parte de la arquitectura objetivo del prompt** (spatial/tactical
brain → coordinadores → intención individual → ejecución), sólo que quedó montada **al lado** del
motor legado en vez de reemplazarlo, con un flag `this.ai2Enabled` (default `true`, inicializado en
`if (this.ai2Enabled === undefined) this.ai2Enabled = true;`) que decide en cada punto de contacto
si se usa la rama AI2 o la rama legada.

**Hallazgo verificado**: se buscó en todo el repositorio (`fulbo.html`, `manager/*`, `tlb/*`, tests) y
**no existe ningún punto que ponga `ai2Enabled = false`**. El único lugar que lo menciona es un
comentario que describe un arnés de comparación (`ai2/bench.mjs`) que **no existe en este
repositorio** (`tlb/README_MANAGER.md` ya lo marca como roto: *"`tlb/bench.mjs` está roto de origen
(importa `../ai2/sim.mjs`, que no está en el repo)"*). Conclusión: en todo camino real (UI, modo
carrera, los 34+11 tests existentes), **AI2 ya es la única autoridad en tiempo de ejecución**; la
rama legada es código muerto en la práctica, pero sigue física y textualmente compitiendo por el
mismo jugador en 6 sitios con ternario explícito (`ai2Enabled ? ... : ...`) y ~19 sitios adicionales
con guardas `if (this.ai2Enabled && ...)`, lo que es exactamente el patrón "legacy + AI2 + parches"
que el prompt pide eliminar.

**Actualización (sesión 2): barrido completo**. Se colapsaron las 24 ocurrencias reales de
`ai2Enabled` en `fulbo.html` (quedan sólo la asignación en `ai2Reset()` y 2 lecturas de sólo lectura
en el HUD de debug), sitio por sitio, corriendo el arnés real (34 tests de núcleo + 12 de motor,
partidos headless completos) después de cada tanda. El cambio de mayor volumen fue en `decide()`
(la decisión con balón): existía un camino legado completo — scoring simple de shoot/dribble/pass/
clear/hold con jitter aleatorio y sin candidatos/temperatura/percepción — detrás de
`if (this.ai2Enabled && t.ai) {...ai2Select...; return;}`; como todo jugador real tiene `.ai`
(`ai2InitPlayer` se corre para los 22 titulares y el banco en `ai2Reset()`), ese camino nunca se
ejecutaba. Se eliminó junto con `passScore` (variable que sólo alimentaba ese camino muerto), dejando
`decide()` con una única autoridad: `ai2Select()` + `ai2Execute()`. Los demás sitios eran guardas
`if (this.ai2Enabled && x)`/ternarios `this.ai2Enabled && x ? A : B` sobre telemetría, calidad de
ejecución (pase/tiro/despeje), posicionamiento sin balón y el parche de línea defensiva de `move()` —
se colapsaron a la rama AI2 sin cambiar comportamiento (la condición nunca tomaba la otra rama).

**Nota de proceso**: al intentar regenerar el bloque `TLB_ENGINE` de `fulbo.html` desde su fuente
nominal (`node tlb/build.mjs`, tras editar `tlb/engine.js`) se detectó que **el generador está
desactualizado/roto** respecto al contenido real de `fulbo.html` — el build borraba por completo el
bloque del árbitro (`tlRef`/`tlRefTick`/...) y duplicaba líneas no relacionadas. Se revirtió esa vía y
el único cambio que tocaba ese bloque (línea del parche `move()`) se aplicó **directamente en
`fulbo.html`**, dejando `tlb/engine.js` con el mismo `ai2Enabled &&` sin tocar — es decir, hay una
línea de drift conocida y documentada entre ambos. No se intentó reparar `tlb/build.mjs` en esta
sesión; queda como hallazgo de infraestructura para la próxima (Fase 31/51).

## 3. Fuente de verdad por decisión (mapa de autoridad)

Siguiendo las llamadas reales dentro de la clase `wc`:

| Decisión | Autoridad real | Notas |
|---|---|---|
| Posesión / pase / tiro / regate / conducir / sostener | `ai2Select()` + `ai2Execute()` (línea ~6893) | Compite por *score* entre `shot`, `speculative` (tiro especulativo 17-34m), `dribble`, `carry`, `pass` (n candidatos), `clear`, `hold`. Selección por softmax con temperatura (`T`), no un `if` rígido. |
| Posicionamiento sin balón (ataque) | `ai2PositionAttack()` | Llamado desde `updatePlayers()` cuando `ai2Enabled` y el jugador tiene `.ai`. |
| Posicionamiento sin balón (defensa) | `ai2PositionDefend()` + `ai2CoordDefense` (roles PRESSER/COVER/LANE_BLOCK/MARK/SCREEN/BALANCE/DROP) | Ya implementa el patrón "1 presiona / 1 cubre / resto estructura" que pide el prompt (Fase 8) — no es 3-4 jugadores persiguiendo a ciegas *por diseño*, aunque el test de línea defensiva (ver §5) muestra que el resultado agregado no siempre respeta el dial del manager. |
| Línea defensiva de bloque (anti-jitter) | `lfoBackLine()` + patch de `move()` (línea ~8038) | Parche posterior sobre AI2: fuerza que los 4 DEF se muevan como bloque coherente durante fases defensivas, para evitar líneas rotas / offside inexistente. Sólo aplica cuando el jugador **no** tiene rol táctico PRESS/CONTAIN/LATE/BALL_WATCH/ASSUME_COVER. |
| Arquero | `keeper()` (posicionamiento + decisión) mezclado con animación (`t.dive`, `t.state`) en el mismo método | No está separado en capas (decisión → estado listo → predicción de tiro → decisión de save → animación) como pide la Fase 19; es el candidato más claro para refactor futuro. |
| Faltas | `commitFoul()` | **Bug corregido esta sesión** (ver §4). |
| Reinicios (throw-in/free-kick/corner/goal-kick) | `restart()` + `enforceRestartDistance()` + parche "barrera invisible" (comentario en línea ~5663) | El código ya documenta y corrige un bug histórico de reinicio trabado (jugadores empujándose mutuamente sin avanzar los 9.15m); tiene tope duro de 3.5s. No se encontró evidencia de un nuevo bloqueo sin salida en los 100+ partidos headless corridos. |
| Selección racional limitada (candidatos plausibles) | `ai2Select()` | **Bug de crash potencial corregido esta sesión** (ver §4). |

## 4. Bugs corregidos (verificados con el arnés real)

### 4.1 `commitFoul()` atribuía la falta al equipo equivocado (Fase 26)

`commitFoul(t, e)` recibe `t` = jugador que comete la falta, `e` = jugador afectado (confirmado en
los dos call-sites: `this.commitFoul(f, v)` con `f` = defensor que entra, `v` = atacante afectado;
y `this.commitFoul(p, opp)` en la barrida). La tarjeta (`showCard(t, ...)`), el evento
(`this.event("foul", ..., n, t)` con `n = t.team`), el penal (`awardPenalty(s, n)`) y el tiro libre
(`restart(s, ...)`) ya usaban correctamente `t`/`n` como el equipo infractor — **sólo el contador de
estadística** usaba el equipo equivocado:

```diff
- this.stats[s].fouls++,   // s = e.team = equipo AFECTADO por la falta
+ this.stats[n].fouls++,   // n = t.team = equipo que LA COMETE
```

Verificado leyendo ambos call-sites y el resto del cuerpo de `commitFoul` para confirmar que `n`/`t`
son consistentemente "infractor" en todo el resto de la función.

### 4.2 `ai2Select()` podía vaciar `plausible` y devolver `pick = undefined` (Fase 30)

Causa raíz confirmada: `plausible = cands.filter(c => c.score >= best.score - K && c.score > -0.2)`.
`cands` **siempre** incluye un candidato `hold` (se empuja incondicionalmente antes del filtro), así
que `cands` nunca está vacío y `best = cands[0]` nunca es `undefined` — pero el umbral absoluto
`c.score > -0.2` no garantiza incluir a `best`: si presión/sesgos/ruido negativo empujan **todas**
las opciones (incluido `hold`) por debajo de `-0.2`, `plausible` queda vacío, `pick = plausible[0]`
queda `undefined`, y `ai2Execute()` explota al leer `pick.score`/`pick.key`.

Fix (sin ocultar el problema con `try/catch`, tal como pide el prompt): si el filtro deja la lista
vacía, se conserva `best` como único candidato plausible y se cuenta el evento
(`ai2Count(t, "select_floor_fallback")`) para poder detectar en telemetría si esto se dispara con
frecuencia anómala — lo que indicaría que el umbral `-0.2` o el piso de `holdScore` necesitan
recalibrarse, en vez de quedar enmascarado.

## 5. Corregido: línea defensiva no respetaba el dial del manager mientras el equipo atacaba

El test `engine.test.mjs → "tácticas del manager producen comportamiento distinto en el motor
(presión/línea)"` fallaba en baseline (confirmado revirtiendo los fixes y volviendo a correr: seguía
fallando igual, así que no era efecto de los bugs de §4). Diagnóstico:

- `tt.defensiveLine` (el valor numérico que agrega mentalidad + dial del manager, línea ~1982) **sí**
  respondía correctamente al dial: en una corrida de 1200s con línea alta/presión extrema el promedio
  fue `1.28`, con línea baja/presión baja fue `0.70` (medido directo con `m.teamTactics(team)`).
- El problema estaba aguas abajo, y era exactamente el patrón que predice la auditoría del prompt
  ("posicionamiento y cobertura que pueden producir decisiones contradictorias", "múltiples capas de
  decisión parcialmente superpuestas"): **dos** sistemas calculan el ancla base de los defensores y
  sólo uno de los dos leía el dial de línea.
  - Fase **defensiva** (el equipo no tiene la pelota): el ancla ya incorporaba el dial en dos sitios —
    `ai2DefAnchor()` (línea ~7167, defensor con rol de coordinador) y la rama correspondiente de
    `updatePlayers()` (línea ~4787), ambos con el mismo término `(id.line - 1) * 11`.
  - Fase de **posesión** (el equipo SÍ tiene la pelota): la rama equivalente de `updatePlayers()`
    (línea ~4803-4806, la que alimenta `ai2PositionAttack()` y por lo tanto también el ancla del rol
    `REST_DEFENSE` — los defensores que se quedan atrás dando equilibrio mientras el equipo ataca)
    sólo aplicaba el dial de **ancho** (`id.width`), nunca el de **línea** (`id.line`). Instrumentando
    por separado: en fase defensiva la diferencia entre línea alta/baja ya era pequeña y correcta;
    en fase de posesión el equipo de línea **baja**/mentalidad muy defensiva mostraba defensores más
    adelantados en promedio que el de línea **alta**/mentalidad muy ofensiva — lo contrario de lo
    esperado, y suficiente para invertir el promedio combinado del test.

**Fix**: se agregó el mismo término `(id.line - 1) * 11` (idéntico al que ya usa `ai2DefAnchor()`) al
cálculo del ancla base en la rama de posesión de `updatePlayers()` — una única fórmula de
desplazamiento por línea, reutilizada en ambas fases, en vez de que cada una tuviera la suya. Con el
fix, 1200s con línea alta/presión extrema dan un promedio de X de defensores de `-15.6` (más
adelantado) contra `-26.6` con línea baja/presión baja (medido en el mismo eje normalizado por
dirección de ataque) — la dirección y magnitud esperadas. El resto del arnés (34 tests de núcleo + 12
de motor real, incluidos partidos completos de 90' con las 4 formaciones) sigue en verde.

Nota sobre un efecto colateral esperado: al cambiar la dinámica real del partido (los defensores ahora
se posicionan de forma distinta también en fase de ataque), un test que dependía de que ningún trigger
del "plan de partido" interviniera en una ventana de tiempo específica de una semilla fija dejó de
cumplirse por una razón legítima — el plan por defecto del usuario en ese test trae reglas propias
(`autoTactics = rules.length > 0`), así que el asistente táctico automático puede pisar un pedido
manual más tarde si el marcador lo justifica; eso es comportamiento correcto, no un bug. Se endureció
ese test (`manager/tests/engine.test.mjs`, caso "20/21") apagando explícitamente el asistente justo
antes de verificar que un pedido *manual* persiste, que es lo que el test dice probar.

## 5.1 Verificación del criterio de aceptación "menos jugadores persiguiendo al poseedor" (Fase 49)

El prompt pide explícitamente evitar "3-4 jugadores persiguiendo simultáneamente al poseedor". Antes
de asumir que hacía falta reconstruir el Defensive Coordinator, se midió directamente sobre un partido
real (45', muestreo cada 2s mientras el equipo rival tiene la pelota): cantidad de rivales a menos de
4m del portador del balón.

| Rivales a <4m del portador | % de las muestras |
|---|---|
| 0 | 41% |
| 1 | 45% |
| 2 | 12% |
| 3 | 1.8% |
| 4+ | 0% |

El caso "1 defensor presionando" domina (45%), "0" (fuera de rango de presión inmediata, cubriendo/
marcando) es el segundo más común, y **nunca** se observaron 4 simultáneos en esta muestra; 3
simultáneos es raro (<2%). Esto confirma que `ai2CoordDefense` (PRESSER/COVER/LANE_BLOCK/MARK/SCREEN/
BALANCE/DROP, ya implementado) cumple en términos generales el patrón "1 presiona + resto cubre/
estructura" que pide la Fase 8 — no se encontró evidencia de que el síntoma original (múltiples
defensores duplicando la presión) siga presente como problema dominante tras las correcciones de esta
sesión. Queda como referencia cuantitativa de base para comparar contra futuros cambios.

## 6. Frecuencia de actualización / performance (referencia, no modificado)

`teamTactics()` cachea por equipo (recalcula a ~3 Hz, `< 0.33`s desde el último cálculo — antes tenía
un segundo valor `0.5` para cuando `ai2Enabled` era falso, eliminado en el barrido de §2 ya que nunca
se usaba), en línea con la Fase 34 del prompt ("Tactical phase: baja frecuencia"). El resto de las
frecuencias (`pcHz`, `brainHz` en `AI2_CFG`) no se tocó esta sesión.

## 7. Determinismo (referencia, no modificado)

El motor headless (`manager/headless.mjs`) crea `new Engine(seed)` y corre con `step(1/60)`; los
tests de integración (`engine.test.mjs`) ya validan varias semillas con resultados coherentes y el
test `core.test.mjs` valida guardado/carga con "estado idéntico y futuro determinista". No se
encontraron usos de `Math.random()`/`Date.now()` fuera de un RNG con seed en la inspección realizada;
una auditoría exhaustiva de los 36k líneas para confirmar el 100% de los sitios queda pendiente.

## 8. Qué NO se tocó y por qué

Siguiendo la Fase 46 del prompt ("no rehacer todo ciegamente"), no se modificó: física, animaciones
(`tlb/*`), tácticas (motor de traducción manager→engine ya funciona y está testeado), atributos,
telemetría existente, estadísticas correctas, set pieces (ya tienen fixes documentados en el propio
código). (El GK `keeper()` y `tlb/build.mjs`, mencionados acá en un checkpoint anterior de esta misma
sesión como pendientes, se resolvieron — ver §15/§16.)

## 9. xG recalibrado (Fase 28)

La fórmula original (`0.42 - distancia*0.01 + (cabezazo ? 0.06 : 0)`, acotada a [0.025, 0.55]) era
casi lineal en la distancia, tal como señalaba el prompt, y el bonus de cabezazo era conceptualmente
al revés: en xG real los cabezazos convierten *menos* que un remate de pie a igualdad de geometría
(salvo muy cerca del arco), no más.

Se reemplazó por `ai2ShotXg()` (junto a `ai2ExecShot` en el mixin AI2), que combina:
- **Ángulo real de arco** subtendido desde la posición del rematador (mismo cálculo que ya usa
  `ai2ExecShot` para la dificultad de ejecución — una sola fuente de verdad para "ángulo del tiro").
- **Caída no lineal con la distancia** (`exp(-dist/16)`) en vez de resta lineal.
- **Arquero expuesto/adelantado** de su línea (mismo patrón `gkOff` que ya usaba `ai2Select` para el
  tiro especulativo).
- **Presión** sobre el rematador (menos tiempo/limpieza para definir).
- **Cabezazo**: ahora penaliza (×0.55 si el remate es a más de 8m del arco, ×0.8 si es más cercano),
  no bonifica.
- **Bloqueadores geométricos**: cuenta rivales de campo parados en el carril rematador→arco
  (proyección sobre el segmento, no sólo "cerca del rematador") y penaliza multiplicativamente
  (×0.72 por cada uno).
- **Calidad de ejecución contextual** ya calculada por `ai2ExecQuality` (pie, orientación, volea,
  trivela, primera intención...) como modulador final (±15%).

Es una función puramente determinista (no consume `this.random()`): es una estimación estadística,
no debe alterar el resultado real del partido, sólo la lectura de "qué tan buena fue la ocasión".

**Calibración**: se descartaron dos primeras versiones por instrumentación directa antes de fijar los
coeficientes — una daba ~0.31 xG/tiro (3.4 xG/equipo/partido contra ~1.4 goles/equipo/partido reales,
muy por encima) y otra ~0.04 xG/tiro (muy por debajo). La versión final da **~0.096 xG/tiro** y
**~1.08 xG/equipo/partido** contra **~1.31 goles/equipo/partido** medidos en la misma muestra (8
partidos headless, 16 instancias equipo-partido) — en el rango de lo que se observa en fútbol real,
sin intentar calibrar contra estadísticas reales exactas (el prompt pide evitar eso explícitamente).

Verificado: 34/34 tests de núcleo + 12/12 de motor real en verde tras el cambio; no se tocó el
penal (`+= 0.76` fijo, ya calibrado de forma razonable y no depende de esta función).

## 10. Determinismo: `reset()` no restauraba la seed ni las marcas (Fase 35) — corregido por completo

`random()` implementa un LCG que **muta `this.seed` en cada llamada** (es su propio estado, no una
seed separada de un estado interno oculto). `reset()` nunca restauraba `this.seed`, así que cualquier
código que reseteara una instancia ya usada (no que construyera una nueva) continuaba el generador
desde donde hubiera quedado el partido anterior, no desde la seed original — rompiendo la garantía
"misma seed + mismo estado inicial → mismo partido" para todo lo que no fuera "construir `new
Engine(seed)` una sola vez y jugar una vez". Esto es real y alcanzable: `tlmLoad()` (recarga de
partido en modo carrera), `tlmRestore()` (exhibición) y el "jugar de nuevo" del editor **reusan la
misma instancia** llamando `reset()` directamente.

**Fix**: se agregó `this._initialSeed` (fijado en el constructor y actualizado por `tlmLoad()` cuando
llega una seed nueva) y `reset()` ahora empieza restaurando `this.seed = this._initialSeed` antes de
generar nada (el propio `reset()` consume `random()` al inicializar jugadores, así que el orden
importa). Verificado: dos instancias **nuevas** con la misma seed post-`tlmLoad` ya daban resultados
idénticos antes del fix (ese camino ya era determinista) — el fix es específicamente para la instancia
**reusada**: ahora, tras recargar, la seed y las posiciones iniciales de los 22 jugadores coinciden
exactamente con una instancia nueva (antes ni eso).

**Segunda causa encontrada y corregida** (sesión 3): instrumentando el mismo escenario paso a paso
(comparando instancia nueva vs. instancia que ya jugó 900s y se recargó con `tlmLoad(mismoCfg)`,
frame por frame) se aisló el punto exacto de divergencia: **frame 91 (t=1.53s)**, con `this.seed`
**idéntico** en ambas instancias en ese instante (descartando de una vez el generador aleatorio como
causa) pero el jugador 9 en un estado táctico distinto (`BlindSideRun` vs `DepthRun`) — es decir, una
decisión determinista tomada con una entrada distinta, no un desvío de RNG.

Causa raíz: `assignMarks()` (asigna qué defensor marca a qué atacante) sólo se vuelve a ejecutar
cuando `this.elapsed - this._marksAt > 0.3`, y **ni `this.marks` ni `this._marksAt` se reseteaban en
`reset()`**. En una instancia reusada, `_marksAt` queda con un valor grande de la sesión anterior
(p. ej. ~900) mientras el nuevo partido arranca en `elapsed=0`: la resta da negativa, nunca supera
0.3, y `this.marks` queda **congelado con las marcas del partido anterior** durante un buen tramo del
partido nuevo — alimentando decisiones de posicionamiento/marca con datos viejos.

**Fix**: se agregó `this.marks = null; this._marksAt = -9;` al bloque de reseteo de `reset()` (junto
a `pendingOffside`, etc.), forzando que `assignMarks()` se recalcule desde cero en el primer
`updatePlayers()` del partido nuevo. Verificado exhaustivamente: instancia nueva vs. instancia
reusada-y-recargada (mismo escenario que detectó el bug) ahora dan **0 diferencias en pelota o
jugadores durante los 5400s completos del partido** (324.000 frames comparados uno a uno,
`2-1` idéntico en ambas). El determinismo "misma seed + mismo estado inicial → mismo partido" queda
garantizado también para instancias reusadas, no sólo para "una instancia por partido".

## 11. Simetría entre equipos (Fase 36)

Se corrieron 12 partidos de exhibición (motor puro, sin manager, formaciones/plantillas por defecto
simétricas) con semillas distintas: **28 goles equipo 0 vs 30 goles equipo 1**, **153 vs 165 tiros**.
No hay evidencia de sesgo estructural hacia el equipo 0/local — si acaso, el equipo 1 quedó
ligeramente adelante en esta muestra chica, lo que ya descarta un favoritismo sistemático hacia el
primer equipo. No se buscó igualdad exacta (el prompt pide explícitamente no exigirla en muestras
chicas) — sólo ausencia de anomalías sistemáticas, que es lo que se encontró.

## 12. Invariantes automatizados (Fase 39) + investigación de "reinicio atascado" (Fase 23)

Se agregó `manager/tests/invariants.test.mjs`: corre varios partidos completos headless (exhibición
motor puro y modo carrera vía `tlmLoad`) y falla si aparece cualquier NaN/Infinity en pelota o
jugadores, alguien queda fuera de los límites reales de cancha, un `phase==="restart"` se mantiene
más de 15s seguidos, el xG o el marcador quedan en un valor inválido, o el partido no termina dentro
del presupuesto de steps. Antes esto se verificaba con scripts sueltos en la sesión (no quedaban);
ahora es parte del arnés (`node manager/tests/invariants.test.mjs`).

Al escribirlo, el chequeo de "reinicio atascado" falló en la primera versión: partidos reales podían
pasar 20-45s seguidos en `phase==="restart"`. Se investigó a fondo pensando que era el bug de la
Fase 23 ("un partido permaneció demasiado tiempo en restart") — instrumentando frame a frame se
encontró la causa real: `manager/engine.js` envuelve `step()` para **congelar deliberadamente** toda
la física del partido (`return` antes de llamar al `step()` del motor) mientras dura una secuencia de
sustitución (`tlmSubSeq`, la animación de "sale caminando por la banda / entra caminando" que ya
documenta `README_MANAGER.md`), y esas sustituciones sólo se procesan en una parada real —
coincidiendo con `phase==="restart"` la mayoría de las veces. No es un bug: es la mecánica de cambios
físicos funcionando como está diseñada, sólo que puede tardar bastante más que un reinicio normal.
Se corrigió el propio test para no contar el tiempo con `tlmSubSeq` activo (documentado inline en el
test) — con eso, 0 fallos en 5 partidos.

Un intento de fix en `updatePlayers()` (saltear al cobrador del reinicio para que sólo `advanceTo()`
lo mueva, evitando una hipotética doble llamada a `move()` con el arquero en un saque de arco) se
implementó primero, pero al aislar la causa real (el freeze de sustituciones) se confirmó — revirtiendo
el cambio y volviendo a correr el test — que **no era necesario**: el test pasa igual sin él. Se
descartó esa edición en vez de dejarla con una explicación de causa ya conocida como incorrecta; no
se encontró evidencia de un reinicio atascado real (sin sustitución de por medio) en esta sesión.

## 13. Verificaciones que confirmaron que ya estaba bien (sin cambios)

Para no repetir trabajo ni inventar bugs, se verificaron puntualmente varias fases del prompt que
resultaron ya satisfechas por el código existente:

- **Fase 24/25 (no spam de tackles)**: ya existe un cooldown real (`this.elapsed - f.tackleAt > 1.4`)
  antes de que un defensor pueda intentar otra entrada/barrida.
- **Fase 27 (offside)**: `isOffside()`/`offsideLineX()` ya son puramente espaciales (segundo último
  rival real, con un margen de "beneficio de la duda" de centímetros) — no hay probabilidad
  arbitraria en la regla en sí (sólo en si el jugador con la pelota LA VE u no, que es percepción
  imperfecta, no la regla).
- **Fase 40 (events limitado a 100 no debe ocultar info crítica)**: `this.events` (capado a 100,
  usado por la UI/replay) y `this.tlmLog` (sin capar, usado por `tlmResult()` para goleadores/
  stats de jugador/rating) **ya son dos logs separados** — confirmado con un partido real que generó
  208 eventos totales (más del doble del cap de UI) y aun así `tlmResult()` sigue derivando las
  estadísticas del log completo, no del recortado.
- **Fase 42 (no hardcodear fútbol)**: los estilos/roles (`p.style === "Winger"`, etc.) aparecen como
  **sumandos de peso** dentro de funciones de scoring más amplias (p. ej. `+0.4` al score de
  amplitud), no como reglas absolutas (`if winger => always wide`) — consistente con "roles +
  atributos + tácticas + estado espacial" en vez de código rígido.
- **Fase 22 (bug de diving)**: se instrumentaron 5 partidos completos (dos tandas, semillas
  distintas) contando cada transición a `dive>0` y verificando que siempre coincida con un tiro real
  reciente (`this.shot` de un rival en el último segundo) — **0 dives sin tiro reciente** en 19+49
  eventos observados, y **0 duraciones de dive fuera de rango**. No se encontró el síntoma que
  describía el prompt original con la instrumentación disponible en esta sesión; sigue quedando la
  mezcla arquitectónica decisión/animación en `keeper()` como nota de diseño (Fase 19), no como bug
  confirmado.

## 14. Escenarios reproducibles (Fase 37) y un hueco real de autoridad única encontrado al automatizarlos

Se agregó `manager/tests/scenarios.test.mjs` cubriendo los 10 escenarios A-J del prompt (recepción
simple, cambio de frente, intercepción, through ball, defensor 1v1, 2v1/marca doble, pressing
coordinado, campo abierto/contraataque, tiro presionado, goalkeeper). El motor no tiene un punto de
entrada para inyectar una jugada aislada con geometría exacta — cada decisión depende del estado
completo del partido — así que cada escenario se verifica sobre una muestra de 5 partidos headless
completos con seeds fijas (201-205), usando la telemetría por equipo que ya existe para esto
(`this.aiTele`, Fase 32/33: `through_balls`, `missed_marks`, `bad_press_events`, `speculative_shots`,
etc.) más, para G (pressing), un muestreo en vivo cada ~2s de cuántos jugadores llevan
`tacticalRole === "PRESS"` al mismo tiempo.

Al escribir el test G apareció un caso de 4 jugadores en `PRESS` simultáneo en la seed 203 (t≈262s),
aparentemente violando el criterio de aceptación de la Fase 8/49 ("menos jugadores persiguiendo
simultáneamente al poseedor"). Instrumentando ese instante exacto (`p.ai.dintent` de cada jugador) se
encontró que **no era el bug que el test buscaba**: los 4 jugadores tenían `dintent.role === "HOLD"`
(el coordinador ya los había reasignado) pero conservaban `tacticalRole === "PRESS"` de un frame
anterior — un balón suelto en disputa (50-50) reúne legítimamente a varios jugadores el mismo frame en
que la posesión se resuelve, y `updatePlayers()` corre esa rama legacy de persecución de balón suelto
(líneas ~4611-4650, `!this.owner`) **antes** de que `updateBall()` asigne el nuevo poseedor dentro del
mismo `step()` — así que el test, al muestrear después de `m.step()`, veía `m.owner` ya asignado pero
los `tacticalRole` calculados un instante antes con la pelota todavía suelta. Se corrigió el test para
exigir posesión asentada >0.4s antes de muestrear (documentado inline).

Sin embargo, instrumentar el caso expuso un hueco real, distinto del que motivó la investigación:
`ai2PositionDefend()` (la función que traduce el intent del coordinador en objetivo de movimiento,
única llamada desde `updatePlayers()` que puede sobrescribir el `tacticalRole` legacy) devolvía `null`
en los casos `PRESS`/`COVER`/`LANE_BLOCK`/`MARK`/`TRACK` cuando la referencia del intent (el rival
presionado/cubierto/marcado) ya no era válida (se fue de la cancha, por ejemplo) entre el tick del
coordinador (~3 Hz) y el frame actual. Al devolver `null`, `updatePlayers()` simplemente no toca
`l.tacticalRole`, dejando sobrevivir el valor que la heurística legacy por rango había precalculado
como semilla para ese jugador — exactamente el patrón de "dos sistemas compitiendo por el mismo
jugador" que la regla más importante del prompt pide eliminar, aunque acotado a un caso borde (ref
inválida) en vez de ser el patrón general. Corregido: esos cinco casos ahora caen a un objetivo de
espera (`ai2GuardPoint` + rol `HOLD_LINE`/`PROTECT_SPACE`, la misma rama que ya usa el `default` del
switch) en vez de `return null` — AI2 nunca deja de tener la última palabra sobre un jugador
defensivo. Verificado: los 10 escenarios pasan, y la suite completa (34+12+5+10 = 61 tests) sigue en
0 fallos tras el cambio.

## 15. GK: decisión y animación separadas (Fase 19-22)

`keeper(t, e)` mezclaba en un único método de ~110 líneas todo lo que la Fase 19 pide separar:

- continuar la física de un vuelo ya disparado en un frame anterior (`t.dive`/`t.diveDir`/`t.z`);
- **GK POSITIONING**: ancla en la línea + Rush ante un 1v1 genuinamente aislado (#27);
- **GK READY STATE**: postura por defecto (`TrackBall`) o de espera antes de un save (`PrepareSave`);
- **SHOT PREDICTION**: si hay un tiro rival en vuelo, dónde cruza la línea del arquero;
- **SAVE DECISION**: si el margen alcanza para pararse o hace falta lanzarse ya;
- **CROSS_CLAIM** (#25-27): si un balón aéreo que no es remate directo merece salir a buscarlo.

Se descompuso en seis métodos con responsabilidad única, todos dentro de la misma clase `wc`:

- `gkContinueDive(t, e)` — **ANIMACIÓN/EJECUCIÓN**. Continúa el arco de un vuelo ya disparado; no
  decide nada nuevo. `keeper()` llama a esto primero y corta ahí si sigue en el aire.
- `gkPositioning(t, s, r)` — **GK POSITIONING**. Ancla base en la línea + Rush 1v1 + adelanto en
  centro (v15). Devuelve `{a, o}`.
- `gkShotPrediction(t, s)` — **SHOT PREDICTION**. Sin efectos secundarios; devuelve `null` si no hay
  tiro rival que atender este frame, o `{d, l, isHeader}` con dónde cruza la línea.
- `gkSaveDecision(t, pred)` — **SAVE DECISION**. Con la predicción ya calculada, decide pararse o
  lanzarse; si se lanza, delega la animación a `gkTriggerDive()` y devuelve `true`.
- `gkTriggerDive(t, dir)` — **ANIMACIÓN/EJECUCIÓN**. Arranca el vuelo (`gkContinueDive` lo continúa
  en los frames siguientes).
- `gkCrossClaimDecision(t, s, r)` — **GK READY STATE** + decisión de salida. Sin tiro en curso,
  evalúa si vale la pena salir a reclamar un centro; devuelve el punto de salida o `null`.

`keeper()` queda como el único orquestador, llamando a cada etapa en el mismo orden que antes.

Es una reorganización pura, no una reescritura — ningún umbral, ninguna condición ni el orden de
evaluación cambiaron, sólo la forma en que el código está agrupado. Verificado con la técnica más
estricta disponible: un hash SHA-256 del estado completo (posición/velocidad de la pelota + posición/
velocidad/dive/estado de los 22 jugadores) tomado en **cada uno** de los 5400 frames de 3 partidos
completos (semillas 301/302/303), calculado antes y después del refactor. Los tres hashes son
**idénticos byte a byte** — no sólo "el resultado da igual", sino que absolutamente ningún frame
intermedio difiere. La batería completa (34+12+5+10 = 61 tests) también sigue en 0 fallos.

No se encontró un bug reproducible de diving en esta sesión (instrumentado en un checkpoint anterior,
5 partidos, 0 anomalías) — este cambio resuelve la mezcla arquitectónica que señalaba la Fase 19, no
un bug de comportamiento del que no hay evidencia (consistente con no inventar cambios especulativos).

## 16. `tlb/build.mjs` reparado: la causa real era CRLF vs LF, no drift del bloque TLB_ENGINE

Un checkpoint anterior de esta sesión había investigado `tlb/build.mjs`, lo corrió, vio que borraba el
bloque completo del árbitro y duplicaba líneas no relacionadas, revirtió el daño con `git checkout` y
decidió no usarlo — documentado como "desactualizado/roto" y dejado para una sesión futura.

Al retomarlo, antes de intentar repararlo, se comparó el bloque `TLB_ENGINE` embebido en `fulbo.html`
línea por línea contra `tlb/engine.js` + `tlb/referee.js` (las fuentes que el generador inyecta): la
diferencia real de contenido era **una sola línea** — el flag `ai2Enabled` que el barrido de esta
sesión sacó de `fulbo.html` pero no de `tlb/engine.js` (drift ya documentado en §2 de una versión
anterior de este reporte). Sincronizada esa línea, el bloque coincide al 100%. Esto ya contradecía la
hipótesis de "el bloque está desactualizado" — el generador en sí, en la parte que hace el reemplazo
del bloque (`block()`), es sólido.

Corriendo el generador de nuevo con esa única línea sincronizada, apareció el síntoma real: dos líneas
de `this.tlAerialTarget(l)` duplicándose en cada corrida (el mismo síntoma del checkpoint anterior,
pero aislado y sin la destrucción del bloque del árbitro, que resultó ser una consecuencia de una
duplicación pre-existente de 3x en esa misma llamada — ver más abajo). Instrumentando el chequeo de
idempotencia del script (`done[]`, strings que buscan si un hook "ya se aplicó" antes de reinyectarlo)
contra el contenido real del archivo se encontró la causa exacta:

```
$ node -e '... h.includes("this.tlAerialTarget && ...,\n          (l.state = \"Re")'
false   // sobre el fulbo.html real
```

`fulbo.html` usa fin de línea **CRLF** (`\r\n`) en el 96% de sus líneas (35.732 CRLF contra 647 LF
sueltos, estos últimos dentro de strings de JS, no saltos de línea reales). Los hooks y marcadores de
idempotencia de `tlb/build.mjs` están escritos con `\n` (LF) a secas. Cualquier marcador que necesite
cruzar una línea (el done[] de `tlAerialTarget`, o el patrón de búsqueda del hook "4s mínimos en
reinicios", que también mostraba "HOOK NO APLICADO") **nunca hace match** contra el `\r\n` real del
archivo — el hook nunca se detecta como aplicado, así que se reinyecta en cada corrida. Eso es
exactamente lo que producía la duplicación: no una corrupción del bloque, un chequeo de idempotencia
roto por una diferencia de fin de línea.

Como consecuencia lateral se descubrió (y se corrigió por separado, ver §2) que `fulbo.html` YA tenía
una triplicación de esa misma llamada desde antes de esta sesión — residuo de una corrida anterior del
generador roto, en algún punto previo a este proyecto. No cambiaba comportamiento (la llamada
recalcula el mismo objetivo, es idempotente en sí misma), pero al no coincidir con el patrón de "1
copia" que esperaba el marcador, hacía que el generador agregara una cuarta copia en cada corrida.

**Fix**: en `tlb/build.mjs`, se normaliza el buffer completo a LF al leerlo (`hRaw.replace(/\r\n/g,
"\n")`) y se restaura CRLF recién al escribir (`h.replace(/\n/g, "\r\n")`), preservando la convención
de fin de línea de siempre del archivo. Verificado: corrida limpia sin ningún "HOOK NO APLICADO", y —
la prueba de idempotencia real — correrlo dos veces seguidas produce un `fulbo.html` **byte a byte
idéntico** entre la primera y la segunda corrida. La batería completa (61 tests) sigue en 0 fallos.
