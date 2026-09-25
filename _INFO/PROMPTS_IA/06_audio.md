# Audio — prompts

Hoy solo el fútbol tiene audio real (cánticos, relatos de gol, sonidos de estadio en `01-futbol/soundeffects/`). Los demás deportes usan sonidos sintetizados.
Formato pedido: `.m4a` (AAC) o `.ogg`, estéreo, 44.1 kHz, sin música con derechos ni voces reconocibles. Todo original.

## A · La Cupidité (fútbol)
Archivos en `01-futbol/soundeffects/cupidite/`: `anthem.m4a`, `goal.m4a`, `wipe.m4a`, `card.m4a` (hoy la copa reutiliza los de la liga; hay que conectarlos en `lfoskin/lfo-broadcast.js`).
```
Cuatro stingers para un torneo de copa de fútbol de un videojuego, marca «La Cupidité» (diamante, esmeralda, majestuoso, épico, coro y cuerdas):
1) himno corto de 8 s (presentación); 2) sonido de gol de 3 s (impacto + coro ascendente); 3) transición «wipe» de 1 s (barrido metálico brillante); 4) tarjeta de 1 s (golpe seco).
Sin voz con letra. Volumen normalizado a −14 LUFS.
```

## B · Ambientes de estadio para básquet, NFL, carreras y MMA
Archivos en `assets/audio/<deporte>/`: `ambient.m4a` (loop de 60 s), `cheer.m4a` (3 s), `boo.m4a` (2 s), y el sonido característico (silbato, bocina, campana o largada).
```
Ambiente de público para <DEPORTE>, loop perfecto de 60 s sin cortes audibles: murmullo constante de multitud en <pabellón cerrado | estadio abierto | autódromo con motores lejanos | arena de MMA>.
Además: aclamación de gol/canasta/touchdown de 3 s, abucheo de 2 s y el sonido característico (silbato, bocina, campana de round o largada de carrera).
```

## C · Cánticos de hinchada por deporte
```
12 cánticos originales de hinchada de 20–40 s cada uno para <DEPORTE>, en español, sin letras de canciones reales ni de equipos reales, grabados «desde la tribuna» (reverb de estadio, voces masivas, bombos).
Nombralos chant1 … chant12 (.m4a).
```

## D · Estudio (todos los deportes)
```
Stinger de entrada de estudio de TV deportiva de 3 s, y música de fondo de 40 s (loop) para las secciones de previa, entretiempo y final: profesional, ritmo medio, sin voz.
Archivos: assets/audio/studio/intro.m4a y assets/audio/studio/bed.m4a.
```

## Cómo verificar
Fútbol: sonido activado en la barra del partido. Otros deportes: los archivos hay que conectarlos al código del módulo (pedile a la IA de código «reproducir estos archivos en los eventos X e Y»).
