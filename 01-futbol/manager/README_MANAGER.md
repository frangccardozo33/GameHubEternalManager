# LFO · Capa Manager

Capa de gestión (estilo OSM, sin clonarlo) montada sobre el motor 3D y la capa broadcast existentes. El partido 3D es el resultado
visible de las decisiones del manager: la configuración del manager **entra** al motor y el resultado real **vuelve** a la carrera.

## Cómo usarla
- Abrir `fulbo.html` desde un servidor estático (p. ej. `python -m http.server`) → botón **★ Modo carrera** en el header.
- Tras editar `manager/engine.js` o la lista de scripts: `node manager/build.mjs` (idempotente; inyecta el bloque de motor
  `<<TLM_ENGINE_BEGIN/END>>` y las etiquetas `<script>`/CSS en `fulbo.html`). Tras editar `tlb/*.js`: `node tlb/build.mjs`.
- Tests: `node manager/tests/core.test.mjs` (núcleo, ~2 s) · `node manager/tests/engine.test.mjs` (motor real headless, ~2 min).

## Arquitectura
```
STATIC (tlm-data.js: WORLD_CONFIG, formaciones, perfiles IA, ediciones)   ← no se guarda
   ↓ createWorld()
CAREER STATE (JSON serializable: clubs, players, competitions, fixtures, market, news, history…)   ← se guarda
   ↓ Career.prepareRound() / matchConfig()
MANAGER ENGINE (players, competition, club, tactics, market, ai, sim, news)   → ManagerMatchConfig
   ↓ ht.tlmLoad(cfg)                       (manager/engine.js, dentro del scope de la clase wc)
MATCH ENGINE 3D (wc: motor, AI2, TLB broadcast)  → eventos (cambios, goles…) → BROADCAST/TLB
   ↓ ht.tlmResult()  →  MatchResult
CAREER UPDATE (applyMatchResult: tabla, stats, lesiones, moral, fitness, finanzas, noticias)
```
Los partidos IA-vs-IA usan `tlm-sim.js` (mismo esquema `MatchResult`, mismo `applyMatchResult`).

| Archivo | Responsabilidad |
|---|---|
| `tlm-util/data` | RNG serializable, hash determinista, configuración estática |
| `tlm-players` | Jugador **global único** (`player_NNNN`), valor/contrato, forma/moral/físico, lesiones, entrenamiento, progresión |
| `tlm-competition` | Calendario todos-contra-todos para N equipos (byes, ida/vuelta, localías balanceadas), tabla con desempates configurables |
| `tlm-club` | Mundo inicial, clubes, finanzas, estadio, entrenamiento, edición de club |
| `tlm-tactics` | Once por hueco de formación, fuerza por líneas, plan de partido, `ManagerMatchConfig`, informe del rival |
| `tlm-market` | Valoración, listados, ofertas (`OFFERED·NEGOTIATING·ACCEPTED·REJECTED·TRANSFERRED·CANCELLED`), ofertas múltiples, contratos, ediciones de cromo, scouting |
| `tlm-ai` | "Manager brain" por perfil: formación, táctica, rotación, fichajes, ventas, renovaciones, reacción al rendimiento |
| `tlm-sim` / `tlm-news` | Simulación rápida, aplicación de resultados, noticias y `StudioAnalysis` por plantillas deterministas |
| `tlm-career` | Orquestación de jornada/temporada, guardado/carga/exportación, `validate()` |
| `engine.js` | Extensión del motor: carga de config, **cambios físicos**, log por jugador, `tlmResult()` |
| `tlm-bridge` + `tlm-ui-*` + `tlm.css` | Puente con el 3D/broadcast y pantallas (HOME, SQUAD, TACTICS, TRANSFERS, SCOUT, CLUB, COMPETITION, CALENDAR, MATCHDAY, NEWS, POST-MATCH) |

## Decisiones importantes
- **Jugador único**: `moveToClub()` es el único punto que cambia `clubId`; una edición de cromo (`player.card`) nunca crea un `playerId`.
  No existe API para crear jugadores desde el editor/UI. `TLM.validate(state)` verifica la unicidad.
- **Sin trampas de IA**: los clubes IA usan valor de mercado, OVR visible y plantillas públicas; el potencial ajeno sólo se estima parcialmente.
- **Cambios físicos**: pedido → pendiente → parón (saque/córner/descanso) → presentación → el jugador sale **caminando** por la banda y
  se oculta → el suplente pasa a ser el jugador del hueco (se reconstruye su modelo 3D) → entra caminando → reanuda. El reloj del partido
  queda congelado y nunca hay dos jugadores iguales en cancha. El motor sigue teniendo 22 objetos-hueco; la identidad cambia sólo cuando el
  saliente ya está fuera. Reutiliza `requestSubstitution/checkSubs/forceInjurySub`, que ahora encolan en vez de intercambiar al instante.
- **Sólo diales con efecto real**: mentalidad, construcción, presión, anchura, ritmo y línea se traducen a `TACTIC_ENUMS` del motor; el plan de
  partido (si gano / si pierdo / desde el minuto X) se traduce a triggers del motor (`evaluateTriggers`). `3-5-2` se añadió a `Fa` del motor.
- **Cartas**: se reutiliza `lfoCards` (collection.js). Único cambio en `collection.js`: acepta `p.cardData` (mismo jugador global con su edición y los
  colores de su club) y `applySaved()` no pisa los jugadores del manager.
- **Broadcast**: la previa/postpartido de TLB usan a los jugadores reales; el estudio recibe además contexto de liga real (`window.TLM_STUDIO`).

## Estado / pendiente
- No implementado por decisión del brief: multijugador, 2ª división, ascensos/descensos, objetivos de directiva, staff, sponsors complejos.
- `tlb/bench.mjs` está roto de origen (importa `../ai2/sim.mjs`, que no está en el repo); `manager/headless.mjs` es el cargador headless nuevo.
- Los presentadores 3D y stingers siguen siendo los placeholders de TLB (ver `tlb/README_TLB.md`); el HUD de cambio del manager es DOM/CSS.
- Formaciones disponibles: las que el motor puede jugar (4-3-3, 4-4-2, 4-2-3-1, 3-5-2). El rol del motor depende del índice del hueco.

## Aspecto de los cromos (`cardlook.js`)
23 cortes de pelo, 21 estilos de barba/bigote, 18 accesorios (vincha, bandana, gorro, máscara de nariz/facial, tapabocas, cadena, guantes…) y 13 poses
(3 originales + 10 nuevas). Se construyen con primitivas de three.js sobre el rig de `createPlayer` y también se aplican al jugador en cancha.
El editor (pestaña "Personaje 3D") los expone; los jugadores del modo carrera reciben un aspecto determinista en `TLM.cardData` (`lookOf`).

## Canciones de festejo (`celebration.js`)
Al marcarse un gol suena un tema de `celebrationost/` (por ahora aleatorio, `LFOCelebration.pickSong`). Entrada sin fundido; limpio durante festejo y repetición;
al reanudarse el juego pasa por un efecto de estadio (filtro + reverb + eco) y se apaga con fundido (≈5 s tras reanudar: `HOLD_AFTER_RESUME` + `FADE_OUT`).
Respeta el botón de sonido. Para agregar temas: copiarlos a `celebrationost/` y correr `node celebrationost/build-manifest.mjs`.
