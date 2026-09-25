# LFO · Matchday / Acciones / Broadcast — estado y assets pendientes

Fuente: `tlb/engine.js` (lógica del motor), `tlb/app.js` (BroadcastDirector + estudio + emojis, placeholders DOM/CSS),
`tlb/tlb.css`. `node tlb/build.mjs` los inyecta en `fulbo.html` (entre `TLB_ENGINE_*`, `TLB_APP_*`, `TLB_CSS_*`) y engancha los
hooks. `node tlb/bench.mjs 8` = bench headless. Ajustes en vivo: botón 📺 (abajo a la derecha). Debug: tecla D (líneas `TLB …`).

## Puntos de reemplazo (dónde se pone cada asset)
Todo lo visual actual es PLACEHOLDER. La lógica no cambia al reemplazarlo:

| Placeholder actual | Dónde | Reemplazar por |
|---|---|---|
| Poses de remate/regate/barrida/celebración | `SH`, `SK`, `SL`, `setShot/setHeader/setBicycle/setSkill/setSlide/setCel` en `tlb/app.js` → se llaman desde `TLB.pose()` (hook en el renderer, antes de la atajada) | Animación real por perfil. Entrada: `p.tl = {anim, kind, t0 | t, contact}`; `t` = segundos desde inicio; `contact` = instante del golpe. |
| Stingers (anillo + placa CSS 3D) | `stinger()` + `.tlb-st*` | Paquetes Three.js (placas, barras, balón, numerales) usando el mismo `kind` (`goal, replay, corner, yellow, red, sub, penalty, freekick, var, half, final`) y duración. |
| Estudio (siluetas emoji + escritorio CSS) | `studioScene()`, `.tlb-studio*` | Escena 3D con 2 presentadores (HOST_A analítico, HOST_B narrativo). `speak()` emite `talk` por host; el texto viene de `studioPre()/studioPost()`. |
| Cartas en previa/gol | `cardOf()` (usa `lfoCards.cardCanvas`) | Carta 3D con profundidad (hoy: imagen plana inclinada por CSS). |
| Globos emoji | `.tlb-bubble` | Globo con cola/animación; el emoji viene de `p.tlEmoji`. |
| Sonido | `sfx()`, `hitSfx()` | Samples (stingers, golpeo potente, chilena, multitud). |

## Lista de animaciones que faltan (especificación para la IA de animación)
Rig procedural actual: `body, head, leftLeg/rightLeg{pivot,lower}, leftArm/rightArm{pivot,lower}`; ángulos de Euler; root en y.
Cada animación tiene fases PREPARE → CONTACT → FOLLOW_THROUGH (remates 0.75 s, contacto en `tl.contact`).
El balón ya sale exactamente en CONTACT (retención en el motor).

**Remates** (duración 0.75 s; balón sale en `contact`)
- NORMAL_SHOT (0.14): carrera corta, pierna de golpeo atrás y arriba, brazos de equilibrio, golpeo frontal, follow-through medio.
- POWER_SHOT (0.20): último paso largo, torso inclinado hacia atrás y luego adelante, pierna sube más, brazo opuesto abierto, follow-through largo.
- FINESSE_SHOT (0.14): preparación corta, cuerpo abierto ~45°, golpeo con interior, follow-through suave hacia el palo.
- LOW_SHOT (0.12): centro de gravedad bajo, pierna sigue horizontal, torso sobre la pelota.
- CHIP_SHOT (0.16): pie por debajo, torso levemente hacia atrás, follow-through hacia arriba.
- LONG_SHOT (0.22): como power pero con pequeño salto de apoyo y cuerpo más recto.
- TRIVELA (0.16): pierna con trayectoria exterior (rotación lateral de cadera), tobillo girado, torso inclinado hacia el lado del pie.
- RABONA (0.22): pierna de golpeo cruzada por detrás de la de apoyo, torso inclinado, brazos compensan, pequeño salto.
- VOLLEY (0.18): 1-2 pasos de ajuste, giro hacia la pelota, pierna llega en el aire, caída/recuperación.
- HALF_VOLLEY (0.12): golpeo inmediato tras el bote, timing rápido.
- FIRST_TIME (0.07): casi sin preparación, golpe directo a la recepción.
- HEADER (0.24): carrera, salto, cuello/torso hacia atrás, impacto con la frente, aterrizaje.
- BICYCLE_KICK (0.30): retrocede, salta, rota ~180° hacia atrás, golpea, cae de espaldas/costado (usar corrección de suelo/ragdoll existente; sin poses imposibles).

**Regates** (1.0 s; `SK_<key>` con `moveZ` = lado): roulette (giro 360° con la pelota acompañando), elastico (empuja fuera e imprime vuelta adentro), croqueta (desplazamiento lateral con doble toque), nutmeg (pierna abierta, pelota entre piernas del rival), sombrero (pelota sube sobre el rival, pierna eleva), heelToHeel (taco), stepover (pisada), dragBack (arrastre atrás), ballRoll (suela). Faltan además: reacción REAL de la pelota (curva alrededor del cuerpo en ruleta, ida y vuelta en elástico); hoy la física del balón no se modificó.

**Barridas** (0.7 s; `CLEAN/LATE/CLEARANCE/EMERGENCY/LAST_DITCH_SLIDE`): preparación (pierna atrás), deslizamiento con extensión distinta por tipo, brazos (abiertos / pegados / arriba en last-ditch), caída y recuperación (levantarse). Diferenciar pierna de contacto y torso.

**Celebraciones** (`CEL_arms, knees, jump, sky, open, brake, hug, group`): corrida (ya procedural) + poses finales: rodillas deslizando, salto con puño, señal al cielo, brazos abiertos, frenada con puño, abrazo y grupo (2 jugadores se abrazan al goleador). El motor ya envía al goleador al córner y a 4 compañeros tras él.

**Otras:** saque de córner (preparación del cobrador), barrera/cobro de tiro libre, entrega de tarjeta (árbitro), cambio (jugador saliendo/entrando), expresiones faciales.

## Modelos / escenas / gráficos que faltan
1. Escena de estudio 3D (2 presentadores rigged, mesa curva, pantalla de datos, city backdrop). Cámaras: plano general, cada host, pantalla.
2. Presentadores: HOST_A y HOST_B (gestos: cabeza, manos; no requiere lip-sync).
3. Paquetes de transmisión 3D por `kind` (ver tabla): balón/anillo/placas/numerales/partículas. Transición de repetición 0.6–1.2 s con pull/whip de cámara.
4. Intro de estadio (previa fase 1): plano del estadio, luces móviles, escudos de equipos.
5. Cartas 3D de jugador (profundidad, giro) para previa, lower third de gol, MVP y sustituciones.
6. Cancha táctica 3D para la presentación de formaciones (hoy: pitch CSS con cartas en 3D plano).
7. Árbitro y tarjetas 3D; banderines de córner; barrera de tiro libre; banco de suplentes (cambios).
8. Audio: stingers TV (10), golpeos por técnica, celebración, silbato, ambiente de análisis.

## Qué ya es lógica real (no placeholder)
actionType/`p.tl` por acción, sincronía balón/contacto, decisión de barrida contextual + LAST-DITCH, paquete de gol
(scorer/asistente/carrera al córner/seguidores/replay multi-cámara/after-action), cámara contextual, emojis por
personalidad+contexto con cooldowns, `StudioAnalysisEngine` determinista (frases con variantes; sólo datos existentes),
ajustes ON/OFF, debug y telemetría (`match.tlTele`).
