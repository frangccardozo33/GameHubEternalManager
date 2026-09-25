# Transmisión de LBO, LGO, LRO y LLO — qué hay y qué reemplazar

El fútbol tiene presentación de equipos, estudio con dos presentadores (antes, en el entretiempo y al final) y gráficas de TV. Los otros
módulos tenían solo su HUD. `assets/broadcast/broadcast.js` les da lo mismo, por encima de la vista del partido y sin tocar los motores.
**No hay relato ni voz durante el juego**: los presentadores solo aparecen en el estudio, con texto en pantalla.

## Qué muestra cada módulo
| Momento | LBO (básquet) | LGO (NFL) | LRO (carreras) | LLO (MMA) |
|---|---|---|---|---|
| Presentación (intro) | equipos + quintetos titulares | equipos | *(ya tenía su intro propia)* | peleadores, récord, división |
| Estudio previa | nivel de plantilla, figuras, ritmo | estilos ofensivo y defensivo | pista, candidatos, clima | estilos y récords |
| Entretiempo | descanso: marcador, máximo anotador, faltas | medio tiempo: marcador, yardas | mitad de carrera: líder y vuelta rápida | entre rounds: quién ganó el round |
| Post-partido | resultado, máximo anotador | resultado, yardas | podio y vuelta rápida | método, round, golpes |
| Placas (gráficas) | triple, racha, cambia el líder, final | touchdown, gol de campo, sack, intercepción, jugada grande | largada, nuevo líder, vuelta rápida, safety car, bandera | round, knockdown, final |

Los textos usan datos reales del partido; las plantillas están en los propios módulos:
`05-basquet-courtside/src/ui/match.js` (`bcTick`, `showIntro`), `06-nfl-gridiron/src/main.js` (`bcNfl`, `start`),
`07-carreras-apex/broadcast-lro.js` y `04-mma/assets/app.js` (`llocast`, `llofinal`, bloque de intro en `sg`).

## Presentadores
Diego Ferreyra (crónica) y Lucía Acosta (análisis), los mismos del estudio del fútbol. Nombres y roles: `HOSTS` en `broadcast.js`.

## Arte provisional para reemplazar (todo es CSS en `broadcast.js`, constante `CSS`)
- **Estudio** (`.bc-studio`): hoy son dos círculos con iniciales y un escritorio. Falta un set con presentadores ilustrados o 3D, mesa, pantalla de datos y fondo de la liga.
- **Intro** (`.bc-intro`): fondo degradé, escudos genéricos con las iniciales del equipo, logo de la liga. Falta fondo del estadio/pabellón/circuito/jaula y escudos reales de los equipos (`team.crest`).
- **Placas** (`.bc-plate`): banda inclinada con el color del equipo. Falta un paquete gráfico por deporte (con la marca de cada liga).
- **Marca de cada liga**: usa `assets/logos/<liga>-sm.png`.
- **Audio**: no hay stingers ni ambiente de estudio.

## Cómo probar
`python -m http.server 8080` en `GameHub_Organizado`, abrir el módulo y empezar un partido/combate/carrera: aparece la intro y después el estudio; en LBO y LGO,
el estudio de entretiempo pausa el partido hasta «Continuar». LBO y LGO se compilan con Vite (ver `_INFO/README.md`).
