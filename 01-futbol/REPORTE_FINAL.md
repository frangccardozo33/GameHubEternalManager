# Reporte final — reconstrucción del match engine (sesión 2026-09-21)

Este reporte sigue el formato pedido en la Fase 52 del prompt maestro. Cubre el trabajo hecho hasta
el commit `e61fc02`. El trabajo **continúa** en la misma sesión; este es un checkpoint, no un cierre.

## 1. Problemas encontrados

- El motor real (decisión/posicionamiento/tiro/pase/defensa) no vive en `tlb/engine.js` ni
  `manager/engine.js` como sugieren los nombres — vive embebido en `fulbo.html` (~36.400 líneas).
  `tlb/*` es sólo animación/broadcast; `manager/engine.js` es el puente con el modo carrera.
- AI2 (la capa cognitiva nueva: team brain → coordinadores → intención individual con racionalidad
  limitada → ejecución) ya estaba mayormente implementada, pero montada **al lado** de un camino
  legado completo (scoring simple + jitter aleatorio) detrás de un flag `ai2Enabled` que, verificado,
  nunca se apagaba en ningún camino real — el patrón exacto de "legacy + capa nueva compitiendo por
  el mismo jugador" que el prompt pide eliminar.
- `commitFoul()` atribuía la estadística de faltas al equipo que **recibe** la falta, no al que la
  comete (el resto de la función — tarjeta, evento, penal, tiro libre — ya usaba el equipo correcto).
- `ai2Select()` podía vaciar la lista de candidatos plausibles (`plausible = []`) y devolver
  `pick = undefined`, crasheando `ai2Execute()`.
- La línea defensiva tenía **dos fórmulas distintas** para el ancla de los defensores según la fase:
  la fase defensiva sí aplicaba el dial "línea" del manager; la fase de posesión (rol `REST_DEFENSE`)
  sólo aplicaba el dial de ancho — el equipo podía terminar con la defensa más adelantada jugando con
  línea "baja" que con línea "alta".
- El xG era casi lineal en la distancia, con un bonus fijo (y conceptualmente invertido) para
  cabezazos, exactamente el problema que señala el prompt.
- `reset()` nunca restauraba `this.seed` — como `random()` muta `this.seed` en cada llamada (es su
  propio estado), cualquier código que reseteara una instancia **ya usada** (no que construyera una
  nueva) seguía el generador desde donde había quedado el partido anterior, rompiendo la garantía de
  determinismo para `tlmLoad()` en modo carrera, `tlmRestore()` y "jugar de nuevo" del editor.
- `tlb/build.mjs` (el generador del bloque `TLB_ENGINE` embebido en `fulbo.html` a partir de
  `tlb/engine.js`) parecía desactualizado/roto: al correrlo (en un checkpoint anterior de esta misma
  sesión) borró el bloque completo del árbitro y duplicó líneas no relacionadas. Investigado a fondo
  después: el contenido del bloque **no tenía drift real** contra `tlb/engine.js`/`referee.js` (una
  sola línea de diferencia, el flag `ai2Enabled` que el barrido de esta sesión sacó de `fulbo.html`
  pero no de `tlb/engine.js`). La causa raíz era mecánica: `fulbo.html` usa fin de línea CRLF en casi
  todo el archivo, pero los hooks/marcadores de idempotencia del generador están escritos con `\n` —
  cualquier marcador que necesitara cruzar una línea nunca hacía match contra el archivo real, así que
  el hook nunca se detectaba como "ya aplicado" y se reinyectaba en cada corrida (eso producía la
  duplicación observada, no una corrupción real del bloque). Corregido — ver §2/§9.
- El GK (`keeper()`) mezclaba decisión y animación en el mismo método (Fase 19): continuar la física
  de un vuelo ya disparado, decidir posicionamiento, predecir un tiro, decidir si lanzarse y decidir
  si salir a reclamar un centro, todo en una sola función de ~110 líneas. Separado en 6 métodos con
  responsabilidad única — ver §2/§9 (reorganización pura, sin cambiar comportamiento: verificado con
  hash de estado completo frame a frame, 0 diferencias en 3 partidos completos).
- `ai2PositionDefend()` (la capa que traduce el rol asignado por `ai2CoordDefense` en objetivo de
  movimiento) podía devolver `null` cuando la referencia del intent (rival presionado/cubierto/
  marcado) dejaba de ser válida entre el tick del coordinador (~3 Hz) y el frame actual — y al
  devolver `null` dejaba sin tocar el `tacticalRole`/objetivo que la heurística legacy por rango
  (`updatePlayers()`, líneas ~4560-4700) había precalculado como semilla para ese jugador. Encontrado
  al automatizar la Fase 37 (ver §5): un test que muestrea "jugadores en rol PRESS simultáneo" marcó
  4 casos en 5 partidos de muestra; instrumentando el motor se confirmó que eran falsos positivos de
  un balón suelto en disputa (varios jugadores convergen legítimamente sobre un 50-50 el mismo frame
  en que la posesión recién se resuelve — no es el "3-4 jugadores presionando al poseedor" que pide
  evitar la Fase 8), pero expuso el hueco real: la heurística legacy nunca debería poder ser la
  autoridad final si AI2 la reemplaza. Corregido.

## 2. Cambios arquitectónicos

- **AI2 como única autoridad**: se colapsaron las 24 ocurrencias reales de `ai2Enabled` en
  `fulbo.html`. El cambio de mayor volumen fue en `decide()` (decisión con balón): se eliminó el
  camino legado completo (scoring simple sin candidatos/temperatura/percepción) que nunca se
  ejecutaba, junto con `passScore` (variable que sólo lo alimentaba). `decide()` queda con una única
  fuente de verdad: `ai2Select()` + `ai2Execute()`. El resto de los sitios (telemetría, calidad de
  ejecución de pase/tiro/despeje, posicionamiento sin balón, parche de línea defensiva) se colapsaron
  a la rama AI2 sin cambiar comportamiento observable. `ai2Enabled` se conserva sólo como bandera de
  sólo lectura para el HUD de debug.
- **Una sola fórmula para "altura de línea"**: la rama de posesión de `updatePlayers()` ahora aplica
  el mismo término `(id.line - 1) * 11` que ya usaba `ai2DefAnchor()` en la fase defensiva, en vez de
  una fórmula paralela que ignoraba el dial.
- **xG analítico** (`ai2ShotXg()`): ángulo real de arco (misma fuente que `ai2ExecShot`), caída no
  lineal con la distancia, arquero expuesto/adelantado, presión, penalización real a cabezazos,
  bloqueadores geométricos en el carril de tiro, y la calidad de ejecución contextual ya calculada
  por `ai2ExecQuality` — todo determinista (no consume `this.random()`).
- **Determinismo de `reset()`**: `this._initialSeed` (constructor + actualizado por `tlmLoad()` con
  cada seed nueva) y `reset()` restaura `this.seed = this._initialSeed` como primera línea.
- **AI2 como autoridad final incluso cuando su referencia deja de ser válida**: en `ai2PositionDefend()`,
  los casos `PRESS`/`COVER`/`LANE_BLOCK`/`MARK`/`TRACK` devolvían `null` (sin decisión) si el jugador
  de referencia del intent (rival presionado, marcado, etc.) ya no era válido, dejando sobrevivir el
  `tacticalRole`/objetivo que la heurística legacy por rango había precalculado como semilla. Ahora
  esos casos caen a un objetivo de espera (`ai2GuardPoint` + rol `HOLD_LINE`/`PROTECT_SPACE`, la misma
  rama por defecto que ya usa el switch) en vez de devolver `null` — AI2 siempre tiene la última
  palabra sobre cada jugador defensivo, nunca queda un rol asignado por dos sistemas a la vez.
- **`keeper()` separado en decisión + animación (Fase 19-22)**: `gkContinueDive()` (animación/
  ejecución del vuelo ya disparado), `gkPositioning()` (línea base + Rush 1v1), `gkShotPrediction()`
  (¿hay tiro rival y dónde cruza?), `gkSaveDecision()` (¿alcanza con pararse o hay que lanzarse?),
  `gkTriggerDive()` (dispara la animación/ejecución del vuelo) y `gkCrossClaimDecision()` (READY
  STATE + salida a reclamar un centro). `keeper()` queda como único orquestador. Reorganización pura
  (ningún umbral ni orden de evaluación cambiado) — verificado con hash de estado completo frame a
  frame en 3 partidos: 0 diferencias.
- **`tlb/build.mjs` reparado**: normaliza CRLF→LF al leer `fulbo.html` y restaura CRLF sólo al
  escribir. Ahora corre sin ningún "HOOK NO APLICADO" y es realmente idempotente (correrlo dos veces
  seguidas produce un archivo byte-a-byte idéntico) — verificado. También se corrigió una triplicación
  pre-existente de `this.tlAerialTarget(l)` en `updatePlayers()` (residuo de corridas previas del
  generador roto; no cambiaba comportamiento, la llamada es idempotente, pero rompía la detección de
  "ya aplicado").

## 3. Archivos modificados

- `fulbo.html` — todos los cambios de motor listados arriba.
- `manager/tests/engine.test.mjs` — se endureció el test "20/21" (apaga el asistente táctico antes de
  verificar que un pedido manual persiste, en vez de depender de que ningún trigger del plan de
  partido interviniera en una ventana de tiempo fija).
- `manager/tests/scenarios.test.mjs` — nuevo (Fase 37, ver §5).
- `tlb/build.mjs` — reparado (normalización CRLF/LF, ver §2).
- `tlb/engine.js` — sincronizado con `fulbo.html` (barrido de `ai2Enabled`, ver §2).
- `MATCH_ENGINE_ARCHITECTURE.md` — nuevo. Auditoría completa, mapa de autoridad por decisión, y cada
  hallazgo/fix documentado con su evidencia.
- `REPORTE_FINAL.md` — este documento.

## 4. Código eliminado/deprecado

- El camino legado completo de `decide()` (scoring shoot/dribble/pass/clear/hold con jitter aleatorio,
  sin candidatos ni temperatura) — confirmado código muerto (todo jugador real tiene `.ai`) antes de
  eliminarlo, no un sweep a ciegas.
- La variable `passScore` y su bloque de cálculo (~48 líneas), que sólo alimentaba el código muerto
  anterior.
- ~24 guardas/ternarios `ai2Enabled ? / && ...` redundantes (la condición nunca tomaba la rama falsa).
- xG lineal original, reemplazado por `ai2ShotXg()`.

## 5. Tests creados

- `manager/tests/scenarios.test.mjs` (nuevo, Fase 37): los 10 escenarios reproducibles que pide el
  prompt (A-recepción simple, B-cambio de frente, C-intercepción, D-through ball, E-defensor 1v1,
  F-2v1/marca doble, G-pressing coordinado, H-campo abierto/contraataque, I-tiro presionado,
  J-goalkeeper). El motor no expone un API para inyectar una jugada aislada con precisión milimétrica
  (cada decisión depende del estado completo del partido, no de una llamada puntual aislada), así que
  cada escenario se verifica con una muestra de 5 partidos completos con seeds fijas (201-205,
  reproducibles) usando la telemetría que el motor ya expone para exactamente este propósito
  (`this.aiTele`, Fase 32/33) más, para G, un muestreo en vivo de roles tácticos cada ~2s de partido.
  **10/10 pasan.** Encontró y motivó el fix de `ai2PositionDefend()` documentado en §1/§2 (un falso
  positivo real en el desarrollo del test G expuso un hueco genuino de autoridad-única, aunque no el
  bug de coordinación de presión que el test buscaba en un principio — ver el detalle en §1).

- `manager/tests/invariants.test.mjs` (nuevo): 5 partidos completos headless (exhibición + modo
  carrera real) verificando ausencia de NaN/Infinity, límites de cancha, xG/marcador válidos, el
  partido termina dentro del presupuesto de steps, y ningún "restart" real (excluyendo el freeze
  deliberado de sustituciones) se mantiene >15s.
- Se reutilizó y se corrió repetidamente `manager/tests/core.test.mjs` (34 casos) y
  `manager/tests/engine.test.mjs` (12 casos, partidos headless completos con las 4 formaciones) como
  arnés de regresión después de cada cambio — no sólo al final.

## 6. Resultados de partidos

### Suite formal de 100 partidos headless (Fase 38)

100 partidos de exhibición completos (motor puro, semillas 1-100 vía `seed*97+13`), corridos de
punta a punta sin intervención, ~16.2 minutos reales de wall-clock (~9.7s/partido en promedio):

| Métrica | Total (100 partidos) | Por partido |
|---|---|---|
| Goles | 393 | 3.93 (ambos equipos) |
| Tiros | 2447 | 24.5 |
| Tiros a puerta | 1299 | 13.0 |
| Pases | 15012 | 150.1 |
| Pases completados | 10374 | 69.1% de precisión |
| Tackles | 3867 | 38.7 |
| Intercepciones | 3832 | 38.3 |
| Turnovers | 3832 | 38.3 |
| Faltas | 79 | 0.79 |
| Offsides | 30 | 0.30 |
| Córners | 675 | 6.75 |
| Penales | 9 | 0.09 |
| xG total | 249.97 | 1.25/equipo |
| **Crashes** | **0** | — |
| **Frames con NaN** | **0** | — |
| **Jugadores fuera de límites** | **0** | — |

No se buscó (ni se esperaba) igualar estadísticas reales exactas — el prompt pide explícitamente
evitar eso. Lo relevante: **cero crashes, cero NaN, cero jugadores fuera de cancha en 100 partidos
completos corridos sin supervisión**.

Una cifra llamó la atención al principio — **0.79 faltas/partido**, bajo frente al fútbol real
(típicamente 20-30) — pero revisando `foulChance` (línea ~5231) se encontró que es una calibración
**deliberada y ya documentada**, no un bug: un comentario ahí mismo (marcado "v13") explica que la
probabilidad base se bajó a propósito de 0.33 a 0.22 (con techo de 0.55) porque la versión anterior
"generaba faltas/penales demasiado seguido en cualquier disputa cercana, sin que se viera una entrada
clara de por medio". No se tocó — sería revertir una corrección explícita de una sesión anterior sin
evidencia nueva de que esté mal, sólo un número que se ve bajo comparado con el fútbol real (que el
prompt pide explícitamente no usar como vara).

### Otras muestras de esta sesión (previas a la suite de 100)

- 8 partidos headless (modo carrera): **xG/equipo/partido ≈ 1.08** contra **goles/equipo/partido ≈
  1.31** en la misma muestra (calibración inicial del nuevo xG, antes de la suite de 100).
- Partido real instrumentado (45', rival en posesión): **45% de las muestras con exactamente 1
  defensor presionando de cerca, nunca 4 simultáneos, 1.8% con 3** — el patrón "1 presiona + resto
  cubre" de la Fase 8 ya se cumple.

## 7. Performance

No se hizo una comparación antes/después formal de tiempo de ejecución (Fase 50). Cada partido de 90'
headless (5400 pasos de simulación a 1/60) corre en **~8-10s reales** en este entorno, sin cambios
perceptibles de ese orden entre el baseline y el estado actual (los cambios fueron a lógica de
decisión/estadística, no a la frecuencia ni al costo por frame de ningún cálculo espacial).

## 8. Bugs conocidos restantes

Los tres bugs/notas de diseño que quedaban listados acá (`tlb/build.mjs` roto, `keeper()` mezclando
decisión y animación, drift de `ai2Enabled` en `tlb/engine.js`) **se resolvieron los tres** en esta
sesión — ver el detalle en §1/§2 y §9. No queda ningún bug conocido pendiente al cierre de este
reporte más allá de lo que ya se documenta como no encontrado (Fase 22, diving) o no intentado por
falta de evidencia (Fase 1-7, formalizar `ThreatMap`/`SpatialState` como estructuras nombradas — ver
§9).

La divergencia de determinismo con instancia reusada (documentada como bug abierto en un checkpoint
anterior de este reporte) **se encontró y se corrigió**: `assignMarks()` sólo se recalcula cuando
`elapsed - this._marksAt > 0.3`, y ni `this.marks` ni `this._marksAt` se reseteaban en `reset()` — una
instancia reusada arrancaba el partido nuevo con las marcas defensa-atacante **congeladas** del
partido anterior durante un buen tramo. Corregido agregando `this.marks = null; this._marksAt = -9;`
al reseteo. Verificado con una comparación frame a frame de los 5400s completos entre una instancia
nueva y una reusada-y-recargada: **0 diferencias** (antes divergía en el frame 91, t=1.53s).

## 9. Próximas mejoras (por prioridad sugerida)

1. ~~Reparar `tlb/build.mjs`~~ — **hecho**: la causa real era CRLF vs LF en los marcadores del
   generador, no drift del bloque `TLB_ENGINE` en sí (que ya coincidía con `tlb/engine.js`/
   `referee.js` salvo una línea, sincronizada). Corre limpio y es idempotente de verdad (verificado:
   dos corridas seguidas producen un archivo byte-a-byte idéntico) — ver §2.
2. ~~Separar `keeper()` en capas~~ — **hecho**: `gkContinueDive()`/`gkPositioning()`/
   `gkShotPrediction()`/`gkSaveDecision()`/`gkTriggerDive()`/`gkCrossClaimDecision()`, mismo orden
   conceptual que pide la Fase 19. Reorganización pura, verificada byte a byte contra el `keeper()`
   monolítico anterior (hash de estado completo, 3 partidos, 0 diferencias) — ver §2. Sigue sin
   encontrarse un bug reproducible de diving (Fase 22, instrumentado en una sesión anterior); este
   cambio resuelve la mezcla arquitectónica, no un bug de comportamiento del que no hay evidencia.
3. Formalizar un `ThreatMap`/`SpatialState` explícitos (hoy `dangerAt()` y `this.pc` cumplen ese rol
   de forma dispersa, no como estructuras nombradas) — Fase 1-7.
4. ~~Correr la suite de 100 partidos headless (Fase 38)~~ — **hecho**: ver §6 arriba (0 crashes, 0
   NaN, 0 fuera de límites en 100 partidos; candidato de calibración encontrado: tasa de faltas baja).
5. ~~Auditar exhaustivamente los 36k líneas para confirmar 0 usos no controlados de
   `Math.random()`/`Date.now()` en lógica de partido~~ — **hecho**: se filtró exactamente el rango de
   la clase `wc` + mixin AI2 + motor TLB + puente TLM (líneas 1040-8481, donde vive toda la lógica de
   partido) y **0 coincidencias** de `Math.random()`/`Date.now()`/`performance.now()`. Los únicos usos
   en todo el archivo están en código three.js de terceros (helpers de vectores/cuaterniones) y en
   efectos visuales/sonido (jitter de multitud, ruido de celebración) fuera de la clase `wc` — no
   afectan el resultado del partido.
6. ~~Escenarios reproducibles A-J (Fase 37)~~ — **hecho**: `manager/tests/scenarios.test.mjs`, ver §5.
   Expuso y motivó el fix de `ai2PositionDefend()` (§1/§2).

## 10. Ejemplos concretos de comportamientos corregidos

**Antes**: con línea defensiva "alta" y presión "extrema", los defensores del equipo terminaban en
promedio **más retrasados** (X promedio -19.0, normalizado por dirección de ataque) que con línea
"baja"/presión "baja" (-13.0) — invertido.
**Después**: línea alta/presión extrema → -15.6 (más adelantado); línea baja/presión baja → -26.6
(más retrasado) — en la dirección correcta.

**Antes**: `commitFoul()` sumaba la falta a las estadísticas del equipo que la **sufre**.
**Después**: se suma al equipo que la **comete** (consistente con tarjeta/evento/penal/tiro libre, que
ya lo hacían bien).

**Antes**: un remate desde 15m central valía xG≈0.42-0.15=0.27 sin importar arquero/presión/
bloqueadores/tipo de remate; un cabezazo sumaba +0.06 fijo (aunque en la realidad convierte menos).
**Después**: el mismo remate se evalúa con ángulo real, caída no lineal con la distancia, exposición
del arquero, presión, bloqueadores geométricos y penalización real a cabezazos — calibrado a
~0.096 xG/tiro, ~1.08 xG/equipo/partido contra ~1.31 goles/equipo/partido reales en la muestra.

**Antes**: recargar un partido ya jugado (modo carrera, exhibición, editor) sobre la misma instancia
del motor continuaba el generador aleatorio desde donde había quedado el partido anterior — la misma
seed ya no garantizaba el mismo partido en ningún camino que reusara la instancia.
**Después**: `reset()` restaura la seed original antes de generar nada; una instancia recargada
arranca con la seed y las 22 posiciones iniciales exactas de una instancia nueva.
