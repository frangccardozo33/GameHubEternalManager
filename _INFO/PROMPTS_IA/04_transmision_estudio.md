# Transmisión (estudio, intro, placas) de LBO, LGO, LRO y LLO — prompts

Contexto común: el fútbol tiene presentación de equipos, estudio con dos presentadores (antes, en el entretiempo y al final) y gráficas de TV. Los otros módulos ya tienen todo eso
**funcionando con arte provisional** (círculos con iniciales y placas de color) en `assets/broadcast/broadcast.js` (constante `CSS`). No hay relato ni voz durante el juego.
Presentadores: **Diego Ferreyra** (crónica) y **Lucía Acosta** (análisis). Detalle técnico: `assets/broadcast/BROADCAST_PARA_IA.md`.

## A · Presentadores ilustrados (para todos los módulos)
Archivos: `assets/broadcast/hosts/diego.png` y `assets/broadcast/hosts/lucia.png` (600×800, transparente). Después reemplazar los círculos de iniciales en `.bc-studio`.
```
Dos presentadores de televisión deportiva en un mundo ficticio, ilustración semirrealista, medio cuerpo, saco oscuro, mirando a cámara, fondo transparente, 600×800 px cada uno.
1) Diego Ferreyra: hombre de unos 45 años, barba corta canosa, gesto entusiasta. 2) Lucía Acosta: mujer de unos 38 años, pelo recogido, gesto analítico y sereno.
Sin logos ni texto.
```

## B · Set de estudio por deporte (1920×1080 JPG, sin personas ni texto)
Archivos: `assets/broadcast/studio/<deporte>.jpg` con deporte ∈ {basquet, nfl, carreras, mma}.
```
Set de estudio de televisión deportiva, vacío, para <DEPORTE>. Mesa curva de presentadores en el centro-abajo, pantalla grande de datos detrás, luces de color <color de la liga>.
Ambientación: básquet = parquet y aro en el fondo; NFL = yardas y casco en pantalla, tonos verdes; carreras = luces de boxes, neumáticos, pantallas de telemetría; MMA = jaula octogonal iluminada al fondo.
Sin personas, sin texto, sin logos. 1920×1080, JPG.
```
Colores: LBO `#ff9a3c`, LGO `#5ec98a`, LRO y LLO: ver el `accent` en `07-carreras-apex/broadcast-lro.js` y `04-mma/assets/app.js`.

## C · Fondos de presentación (intro) — 1920×1080 JPG
Archivos: `assets/broadcast/intro/<deporte>.jpg`.
```
Fondo de presentación de partido para <DEPORTE>: pabellón/estadio/circuito/jaula nocturno estilizado, haces de luz, humo, el centro despejado para dos escudos y un «VS».
Sin texto ni personas. 1920×1080.
```

## D · Placas de eventos (PNG transparente, 1100×260)
Eventos por deporte: básquet (triple, racha, cambia el líder, final), NFL (touchdown, gol de campo, sack, intercepción, jugada grande), carreras (largada, nuevo líder, vuelta rápida, safety car, bandera), MMA (round, knockdown, final).
Archivos: `assets/broadcast/plates/<deporte>-<evento>.png`.
```
Placa de TV horizontal 1100×260 px, fondo transparente, para el evento «<EVENTO>» de <DEPORTE>. Chapa inclinada con el color de la liga y un ícono simple del evento a la izquierda;
el centro liso para escribir el texto. Estilo deportivo moderno. Sin texto.
```

## E · Cambio de código (después de recibir los archivos)
```
En assets/broadcast/broadcast.js, reemplazá el CSS provisional del estudio, la intro y las placas por los archivos de assets/broadcast/{hosts,studio,intro,plates}/ (rutas relativas a Broadcast.setBase).
Mantené la API (Broadcast.attach/intro/studio/event/tick) y que sin los archivos siga funcionando con el diseño actual.
```

## Cómo verificar
Iniciar un partido/combate/carrera en cada módulo: aparece la intro y el estudio de previa; en LBO y LGO el entretiempo pausa el partido hasta «Continuar».
