# Tribuna (cartas) — prompts

Contexto común: las cartas son de un álbum de cromos de un videojuego deportivo ambientado en un mundo ficticio. El juego dibuja encima el nombre, OVR, posición, bandera,
escudo y estadísticas, así que **los retratos y marcos no llevan texto ni logos**. Todo con fondo transparente (PNG con canal alfa). Detalle técnico: `assets/tribuna/TRIBUNA_PARA_IA.md`.

## A · Retratos genéricos por deporte
Archivos: `assets/tribuna/portraits/<deporte>/<n>.png`, con n desde 0. 404×440 px, fondo transparente, busto o medio cuerpo, iluminación de estudio, estilo ilustración semirrealista
coherente entre sí. Después activar `Tribuna.options.portraitSets` (ver el .md técnico) con la cantidad entregada.

### LBO · Básquet — 12 retratos (`assets/tribuna/portraits/basquet/0.png` … `11.png`)
PROMPT:
```
Serie de 12 retratos de jugadores de básquet, camiseta y short genéricos grises, pose con balón o de frente. Rostros y físicos variados (distintas edades entre 20 y 36 años, tonos de piel, peinados y barbas). Busto/medio cuerpo, mirada al frente o tres cuartos,
fondo transparente, luz de estudio suave con borde de luz. Sin texto, sin logos, sin números, sin escudos. 404×440 px por retrato, PNG con transparencia. Estilo ilustración semirrealista, mismo trazo y paleta entre todos.
```

### LGO · Fútbol americano — 12 retratos (`assets/tribuna/portraits/nfl/0.png` … `11.png`)
PROMPT:
```
Serie de 12 retratos de jugadores de fútbol americano con casco liso y hombreras, camiseta gris genérica. Rostros y físicos variados (distintas edades entre 20 y 36 años, tonos de piel, peinados y barbas). Busto/medio cuerpo, mirada al frente o tres cuartos,
fondo transparente, luz de estudio suave con borde de luz. Sin texto, sin logos, sin números, sin escudos. 404×440 px por retrato, PNG con transparencia. Estilo ilustración semirrealista, mismo trazo y paleta entre todos.
```

### LRO · Carreras — 10 retratos (`assets/tribuna/portraits/carreras/0.png` … `9.png`)
PROMPT:
```
Serie de 10 retratos de pilotos con mono de carreras gris y casco bajo el brazo o puesto (visera espejada). Rostros y físicos variados (distintas edades entre 20 y 36 años, tonos de piel, peinados y barbas). Busto/medio cuerpo, mirada al frente o tres cuartos,
fondo transparente, luz de estudio suave con borde de luz. Sin texto, sin logos, sin números, sin escudos. 404×440 px por retrato, PNG con transparencia. Estilo ilustración semirrealista, mismo trazo y paleta entre todos.
```

### LLO · MMA — 10 retratos (`assets/tribuna/portraits/mma/0.png` … `9.png`)
PROMPT:
```
Serie de 10 retratos de peleadores con shorts y guantes de MMA, torso descubierto o camiseta ajustada gris, en guardia. Rostros y físicos variados (distintas edades entre 20 y 36 años, tonos de piel, peinados y barbas). Busto/medio cuerpo, mirada al frente o tres cuartos,
fondo transparente, luz de estudio suave con borde de luz. Sin texto, sin logos, sin números, sin escudos. 404×440 px por retrato, PNG con transparencia. Estilo ilustración semirrealista, mismo trazo y paleta entre todos.
```

## B · Marcos por edición (24 archivos, 600×840 px, PNG con transparencia)
Nombres: `assets/tribuna/frames/<deporte>-<edición>.png` con deporte ∈ {basquet, nfl, carreras, mma} y edición ∈ {comun, bronce, plata, oro, elite, leyenda}.
Después activar `Tribuna.options.useFrames = true`. El marco va DEBAJO del contenido: la ventana del retrato (150,118 → 554,558) y la columna izquierda deben quedar libres/oscuras.

PROMPT (repetir por cada combinación cambiando deporte y edición):
```
Marco de carta coleccionable vertical 600×840 px, fondo transparente. Deporte: <DEPORTE> (motivos sutiles del deporte en las esquinas). Edición: <EDICIÓN>.
Materiales por edición: común = cartón gris liso; bronce = metal bronce cepillado; plata = acero pulido; oro = oro con brillo; élite = negro con vetas doradas y detalles luminosos; leyenda = cristal iridiscente con destellos.
Deja libre una ventana rectangular para el retrato (x150–554, y118–558), una columna izquierda para OVR/posición/bandera/escudo (x40–140) y una placa inferior (y574–660) para nombre y equipo, más una franja de estadísticas (y672–742).
Sin texto ni números. Bordes con relieve, sombra interior suave.
```

## C · Escudos de equipos (opcional)
Un escudo por equipo, PNG 256×256 transparente, para pasar en `team.crest`. Ver `05_nombres_mundo.md` para la lista de equipos.
```
Escudo de club deportivo de un mundo ficticio: <NOMBRE DEL EQUIPO>, colores <primario> y <secundario>. Forma clásica (escudo o círculo), símbolo simple reconocible a 48 px,
sin texto largo (máximo 3 letras). Fondo transparente, 256×256 px.
```

## D · Efecto foil y dorso (código)
```
En assets/tribuna/tribuna.js, función drawCard(): agregá un efecto foil animado (degradé holográfico que se desplaza con el mouse) para las ediciones Élite y Leyenda,
y rediseñá el dorso (rama `if (back)`) con una cuadrícula de estadísticas y un gráfico radar. No cambies el formato de los datos ni la firma de las funciones.
```

## Cómo verificar
`python -m http.server 8080` → abrir el módulo (p. ej. `07-carreras-apex/index.html`) → botón Tribuna. En consola: `Tribuna.open('lro')` (o `lbo`, `lgo`, `llo`).
LBO y LGO se compilan con Vite (ver `_INFO/README.md`).
