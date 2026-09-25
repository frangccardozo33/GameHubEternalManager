# Circuitos de la Serie Nacional GT3 — guía para la IA (o el diseñador) que los hace

La temporada tiene **20 fechas, una por circuito**, repartidas entre 20 de las 21 naciones del mundo (★ = naciones del Continente Viejo: Baikal, Estovackia, Kostanay, Netanya, Overmark). Zenet no tiene fecha esta temporada.
Los trazados y el decorado que hay hoy son **placeholders provisionales**: cada circuito tiene su trazado propio, pero es geometría genérica y casi sin decorado.
Este documento dice qué hay que entregar, con qué reglas técnicas y dónde se pone. **Para pedírselo a una IA usá el prompt único:** `_INFO/PROMPTS_IA/02_circuitos_PROMPT_UNICO.md`.

## 1. Qué hay que entregar
Un archivo **`07-carreras-apex/circuits/<id>.json`** por circuito, **o un único `circuits/circuits.json`** con los 20 (`{ "valleverde": {...}, "autodromocentral": {...}, ... }`).
El juego lo lee al arrancar: si el circuito existe y es válido, **reemplaza** el trazado interno; si no existe o falla la validación, usa el placeholder y avisa en la consola (`[circuits] ...`).
Un `circuits/<id>.json` suelto pisa al del bundle. Los archivos actuales son placeholders: se pisan con el mismo nombre.

```json
{
  "id": "valleverde",
  "theme": "grass",             // grass | desert | coast | forest | city | night | mountain
  "halfWidth": 8.5,             // semiancho del asfalto en metros (6 a 14; recomendado ≤ 9,5)
  "groundColor": "#9dcc95", "skyColor": "#b6c4bd", "foliageColor": "#3f6b3a",   // opcionales
  "treeCount": 120, "hills": true,                                                 // opcionales: árboles / colinas automáticos
  "gripMod": 1, "brakingMod": 1, "aeroMod": 1, "overtakeDiff": 0.5, "wetChance": 0.15, "tempBase": 24,   // opcionales: números de juego
  "layout": [[-220,135],[-80,135],[100,135], ...],
  "props": [ {"type":"tree","x":120,"z":-60,"h":12,"shape":"round","color":"#3f6b3a"}, ... ]
}
```
Los campos que empiezan con «_» (`_estado`, `_referencia`, `_formato`) son sólo referencia y se ignoran al cargar.

## 2. Herramientas
- **Modelo aislado del circuito actual:** en el juego, Campeonato → Atlas de circuitos → **«⬇ Descargar JSON del circuito actual»** (o el botón del detalle de cualquier circuito, o «Descargar los 20»). Trae el trazado, el ancho, el tema y los números de juego,
  más un bloque `_referencia` con el largo, la línea de largada, el carril de boxes, el edificio, las tribunas y carteles por defecto, y el eje de la pista cada 20 m con su radio. En consola: `circuitModel(TRACKS[0])`.
  Un ejemplo completo con decorado: `circuits/_modelo_valleverde.json`.
- **Validador:** `node tools/check_circuit.mjs circuits/<id>.json` (o `circuits/circuits.json`): replica la spline del juego y comprueba largo, cruces, separación de 60 m, radio mínimo, recta de boxes, zona de boxes y distancia de los props.
- **Unir partes:** `node tools/merge_bundle.mjs parte1.json parte2.json …` → `circuits/circuits.json`.

## Requisitos técnicos (el juego los exige; el validador `tools/check_circuit.mjs` los comprueba)

**1. Sistema de coordenadas.** Plano X/Z en metros, vista cenital con **x a la derecha y z hacia abajo**. `y` es la altura (0 = pista; la pista es plana). El mundo mide 3000 × 3000 m
(suelo en ±1500): mantené todo dentro de |x|,|z| ≤ 900 para el trazado y ≤ 1500 para el decorado.

**2. El trazado (`layout`) es una SPLINE.** Es una lista de 8 a 60 puntos `[x, z]` que el juego une con una **spline Catmull-Rom cerrada** (three.js `CatmullRomCurve3`, tipo
`catmullrom`, tensión 0,35). Los puntos son guías, **no vértices**: la curva pasa por ellos pero se redondea, así que:
- El orden de los puntos es el sentido de carrera; el último se une con el primero solo. No repitas el primero al final.
- Usá entre 14 y 32 puntos. Separación de 40 a 150 m en rectas; en curvas cerradas poné 3 puntos (entrada, ápice, salida) a 25–40 m entre sí. **Nunca dos puntos a menos de 25 m** (hacen un lazo).
- La spline «se pasa» un poco de las curvas: antes de una curva cerrada tras una recta larga sumá un punto de guía 30–50 m antes de la entrada para que no se abra.
- **Radio mínimo:** el borde interior del asfalto se pliega si el radio es menor que `halfWidth + 2,5` (11 m con 8,5). Las horquillas reales deben tener radio ≥ 25 m (≥ 2,6 × halfWidth); con menos, los autos las toman a ~40 km/h.
- **Largo total 1,6 a 3,2 km** (el juego calcula el largo real con la spline; de él salen el tiempo de vuelta y la duración de la carrera).
- **Separación:** dos tramos no consecutivos deben estar a **≥ 60 m** entre sí (el guardarraíl está a 20 m del eje por cada lado y el de boxes a 40 m). **Sin cruces** (no hay puentes ni túneles) y sin autointersecciones.
- El juego muestrea la vuelta en 2400 puntos: no hace falta más detalle que el de la spline.

**3. Línea de largada y boxes (FIJOS: el juego no los mueve, el trazado se adapta a ellos).**
- La línea de largada está en `layout[0]` (s = 0) y el sentido de marcha va hacia +x. **Los tres primeros puntos deben estar sobre `z = 135`** con x creciente, por ejemplo `[-220,135], [-80,135], [100,135]`; el último punto de la lista debería quedar sobre `z = 135` también (por ejemplo `[-300,135]`) para que la parrilla no quede en curva.
- **La recta principal tiene que ser recta desde x = −190 hasta x = +85** (30 a 295 m de la largada): ahí están el carril de boxes, el edificio y las paradas. Empezá a doblar después de x ≈ 100.
- **Parrilla:** 10 autos en dos columnas de 5 (a ±3,2 m del eje), desde 8 m detrás de la línea hacia atrás cada 9 m (hasta 44 m antes de la línea). Necesita asfalto recto y ancho ahí.
- **Carril de boxes (pit lane):** cinta de 15 m de ancho a la **izquierda** del sentido de marcha (en la recta principal, hacia z menores: `lane` +10 a +25 respecto del eje), entre s = 30 y s = 295 m; muro de hormigón cada 12 m en lane +10,5 entre s = 68 y 260. Los autos entran al carril si su distancia de vuelta está entre 32 y 55 m, se ubican en lane 20, **paran en s = 155 + 6 × número de auto** (a lo sumo hasta ~215 m) y salen hasta s = 292 con límite de 17 m/s.
- **Edificio de boxes:** en s = 170, lane +36 (16 × 7 × 175 m) más una torre de control de 14 × 3,5 × 55 m; guardarraíl del lado de los boxes en **lane +40 hasta s = 305**; en el resto de la vuelta el guardarraíl está a lane ±20.
- **Reservá libre** el rectángulo x −200…110, z 70…200: ningún otro tramo de pista ni ningún prop (salvo `grandstand`/`sign` del lado contrario) puede entrar en la franja de boxes (z 84…132).
- **`halfWidth` recomendado ≤ 9,5**: el muro de boxes está a lane +10,5 y con un asfalto más ancho se superponen. Rango permitido 6–14 (por defecto 8,5).
- Elementos automáticos por circuito (no se pueden quitar): pórtico de largada (mástiles a ±10 m, 9 m de alto), tribunas por defecto (en s = 115 lane −33 largo 100; s = largo−65 lane −34 largo 58; s = 555 lane −32 largo 52), 4 carteles (`s` = 125, 475, 830, 1100), postes de luz cada 160 m desde s = 100 en lane −22, carteles de distancia 50/100/150 en s = 350, 380, 410, 670, 700, banquinas de 0,75 m (roja y crema) donde el radio es menor que 333 m y una franja de grava de 5,5 m a cada lado del asfalto.

**4. Decorado (`props`, hasta 600 objetos).** Primitivas: `box`, `cylinder`, `cone`, `sphere`, `tree`, `water`, `grandstand`, `sign` (campos abajo). Cada prop es una malla suelta: apuntá a **150–300** por circuito para que corra fluido y usá pocos props grandes en vez de muchos chicos.
No pongas props a menos de **22 m del eje** (ni la mitad de su tamaño más cerca), ni sobre el carril de boxes ni en la franja z 84…132 de la recta principal. Agrupá en escenas reconocibles y usá colores contrastados: se leen a 200 km/h.
Otros campos opcionales del circuito: `groundColor`, `skyColor` (`#rrggbb`), `foliageColor` (color del follaje de los árboles automáticos), `treeCount` (0–320: cantidad de árboles automáticos; 210 por defecto y 24 en `desert`; poné 0 en hielo, ciudad o salar), `hills: false` (quita las 16 colinas lejanas), y los números de juego `gripMod`, `brakingMod`, `aeroMod`, `overtakeDiff`, `wetChance`, `tempBase`.
Temas: `grass`, `forest` (suelo y follaje verde oscuro), `desert` (suelo ocre, pocos árboles), `coast` (agrega un mar de 1400 × 450 m al lado z = −520), `city` (22 edificios grises en un anillo de radio 650 × 460 m), `night` (cielo oscuro, 16 focos sobre la pista y edificios con ventanas encendidas) y `mountain` (como `grass`, para climas fríos o de altura). Se puede cambiar el aspecto de cualquier tema con `groundColor`/`skyColor`.

**5. Lo que el juego NO soporta:** elevación (todo es plano: los desniveles sólo existen en la ficha), túneles y puentes, modelos 3D externos (`.glb`), boxes distintos por circuito, zonas de DRS, ancho variable, clima propio por circuito distinto de `wetChance`/`tempBase`.

Tipos de props: `box {x,z,y,w,h,d,rot,color}` · `cylinder {x,z,y,r,h,rot,color}` · `cone {x,z,y,r,h,rot,color}` (r = radio de la base, punta arriba) · `sphere {x,z,y,r,squash,color}` (`squash` 0,1–3 achata o estira) · `tree {x,z,y,h,shape:"round"|"pine",color}` · `water {x,z,y,w,d,color}` (plano) · `grandstand {s,lane,length,reverse}` (s = metros desde la largada, lane = desplazamiento lateral, + izquierda / − derecha) · `sign {s,lane,text(≤18),sub(≤34),width,bg,fg}`. `y` es la altura de la base; `rot` en grados (−360…360).

## 3. Cómo probar lo que entrega
1. `python -m http.server 8080` en `GameHub_Organizado` y abrir `http://localhost:8080/07-carreras-apex/index.html` (o el hub).
2. Campeonato → **Atlas de circuitos** → elegir el circuito → «USAR EN ESTA FECHA» → correr la fecha. El mini-mapa del atlas muestra el nuevo trazado.
3. En la consola del navegador: `await CIRCUITS_READY` devuelve cuántos circuitos externos se cargaron.

## 4. Placeholders actuales
Cada `circuits/<id>.svg` es una vista del trazado provisional (punto amarillo = largada). No lo usa el juego: es referencia. Cuatro placeholders (`costasur`, `patagoniapark`, `selvaverde`, `sierragp`) tienen una curva con radio menor que el mínimo y el validador los marca; los nuevos trazados los reemplazan.

## 5. Tabla de circuitos
| # | id | Nombre | Lugar | Tipo | Tema | Largo objetivo | Curvas | Lluvia | Temp. |
|---|---|---|---|---|---|---|---|---|---|
| 01 | `valleverde` | VALLE VERDE | San Esteban, Peronia | Clásico permanente de campo | grass | 1.9 km | 12 | 15% | 24° |
| 02 | `autodromocentral` | TELLIN RAILWORKS | Tellin, Estovackia ★ | Industrial mixto en talleres ferroviarios | city | 1.7 km | 13 | 20% | 22° |
| 03 | `costasur` | COSTA SUR | Punta Marea, Valurria | Costero con viento cruzado | coast | 1.9 km | 12 | 35% | 26° |
| 04 | `montrealpl` | MONTERAL PARK | Monteral, Kaigam | Ribera y horquillas | grass | 2.4 km | 12 | 30% | 18° |
| 05 | `sierragp` | SIERRA GP | Villa Sierra, Costas Unidas | De montaña, en ladera | mountain | 2.1 km | 12 | 25% | 20° |
| 06 | `pampacircuit` | ESTEPA GRANDE | Altyn Dala, Kostanay ★ | Óvalo abierto en la estepa | grass | 2.6 km | 11 | 10% | 22° |
| 07 | `litoralring` | LITORAL RING | Puerto Litoral, Morvicia | De ribera húmedo | forest | 2.2 km | 12 | 40% | 23° |
| 08 | `nortespeed` | NORTE SPEEDWAY | Ciudad Norte, Magayanes | Óvalo peraltado de estadio | grass | 2.5 km | 8 | 20% | 30° |
| 09 | `desiertoring` | DESIERTO RING | Oasis Dorado, Sahar | Desierto al atardecer | desert | 2.3 km | 12 | 4% | 34° |
| 10 | `patagoniapark` | LAGO HELADO PARK | Bahía de Hielo, Baikal ★ | Sobre lago congelado | mountain | 2.0 km | 13 | 10% | -3° |
| 11 | `atlanticospeed` | OCÉANO SPEED | Cabo Espuma, Grammes | Costero rápido | coast | 2.1 km | 10 | 32% | 21° |
| 12 | `selvaverde` | SELVA VERDE | Río Verde, Riada | Selva húmeda cerrada | forest | 2.0 km | 12 | 52% | 29° |
| 13 | `puertourbano` | PUERTO URBANO | Puerto Nuevo, Iberia | Circuito de calle en muelles | city | 2.0 km | 13 | 30% | 23° |
| 14 | `lagunaazul` | MAR SALADO | Orilla Baja, Netanya ★ | Salar bajo el nivel del mar | desert | 2.3 km | 13 | 3% | 38° |
| 15 | `andesendurance` | ALTIPLANO ENDURANCE | Alto Sotoa, Sotoa | Altiplano de resistencia | mountain | 3.1 km | 14 | 12% | 19° |
| 16 | `pampavelocity` | SABANA VELOCITY | Karoo Ancho, Skote | Tri-óvalo de alta velocidad | grass | 2.9 km | 11 | 9% | 32° |
| 17 | `santacruz` | SANTA CRUZ GP | Santa Cruz, Melonia | Histórico de colinas y viñedos | forest | 2.4 km | 15 | 44% | 24° |
| 18 | `nocturnaring` | NOCHE POLAR | Nordhavn, Overmark ★ | Nocturno polar con aurora | night | 2.2 km | 13 | 25% | 2° |
| 19 | `calderaring` | CALDERA RING | Isla Caldera, Tamago | Cráter de volcán apagado | mountain | 2.0 km | 15 | 20% | 27° |
| 20 | `centenario` | AUTÓDROMO DEL CENTENARIO | Rheinau, Margin | Moderno de gala (final del campeonato) | grass | 2.5 km | 14 | 18% | 22° |

## 6. Fichas
### 01 · VALLE VERDE  (`valleverde`) — San Esteban, Peronia · 1961
- **Tipo:** Clásico permanente de campo · **theme:** `grass` · **largo objetivo:** 1.9 km · **curvas:** 12 · **sentido y silueta:** Óvalo alargado con una horquilla al final de la recta y una zona de eses en el fondo; sentido horario.
- **Historia:** Primer autódromo permanente de la Serie Nacional. Se trazó en 1961 sobre el camino de tierra que unía dos estancias del valle de San Esteban y todavía se corre con las tribunas de madera originales en la recta principal.
- **Carácter:** Rápido y equilibrado: el circuito de referencia para comparar autos y el primero al que llega un equipo nuevo.  **Rasgo único:** Un molino de viento gira junto a los boxes; los pilotos lo usan como referencia de dirección del viento.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** La Horqueta (derecha lenta al final de la recta principal; frenada fuerte y única zona clara de sobrepaso); El Alambrado (izquierda-derecha rápida en tercera, sin margen en la salida); Puente Viejo (derecha de radio constante sobre un puentecito de piedra); Los Álamos (curva ciega de izquierda entre dos hileras de álamos).
- **Paisaje:** Pastizales verdes, hileras de álamos, alambrados de campo, cerros bajos al fondo, molino de viento junto a los boxes y tribunas de madera pintadas de blanco.
- **Kit de decorado sugerido (props):** una hilera de álamos (tree round) paralela a la recta trasera, un molino (cylinder + 4 box finas), un galpón de estancia (box + cone) y alambrados (box finas y largas) a 24 m del eje.
- **Colores:** groundColor `#9dcc95`, skyColor `#b6c4bd` · **Números de juego:** gripMod 1, brakingMod 1, aeroMod 1, wetChance 0.15, tempBase 24, overtakeDiff 0.5

### 02 · TELLIN RAILWORKS  (`autodromocentral`) — Tellin, Estovackia · CONTINENTE VIEJO · 1952
- **Tipo:** Industrial mixto en talleres ferroviarios · **theme:** `city` · **largo objetivo:** 1.7 km · **curvas:** 13 · **sentido y silueta:** Rectas cortas unidas por curvas de 90° y una chicane doble; parece un plano de vías, con horquillas cerradas.
- **Historia:** Autódromo levantado dentro de las antiguas naves de reparación de locomotoras de Tellin, en Estovackia. Los boxes son las naves originales de chapa y el trazado esquiva las vías que quedaron a la vista. Se lo conoce por las frenadas.
- **Carácter:** Técnico y duro con los frenos: cuatro de sus curvas lentas llegan después de rectas largas. Poca velocidad punta, mucho trabajo de pedal.  **Rasgo único:** Cruza una vía muerta con un tren museo estacionado; las bocinas del tren suenan en la largada.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** Los Talleres (izquierda de 90° tras la recta principal, muy cerrada); La Chimenea (horquilla de derecha rodeando una chimenea de ladrillo); Horno Alto (chicane rápida de derecha-izquierda con muros cercanos); Cambio de Agujas (S lenta sobre un empedrado de vía).
- **Paisaje:** Naves industriales de ladrillo y chapa, vías oxidadas, chimeneas, vagones abandonados, silos, tribunas metálicas bajas y cielo gris de invierno.
- **Kit de decorado sugerido (props):** chimeneas (cylinder altos), naves (box largas con techo box más finas), vagones (box 12x3x3) en fila, un silo (cylinder), una torre de agua (cylinder + cone).
- **Colores:** groundColor `#8e918c`, skyColor `#a9adb0` · **Números de juego:** gripMod 0.95, brakingMod 1.25, aeroMod 0.9, wetChance 0.2, tempBase 22, overtakeDiff 0.4

### 03 · COSTA SUR  (`costasur`) — Punta Marea, Valurria · 1974
- **Tipo:** Costero con viento cruzado · **theme:** `coast` · **largo objetivo:** 1.9 km · **curvas:** 12 · **sentido y silueta:** Trazado que serpentea entre médanos: una recta de cara al mar, una S lenta en el espigón y un giro largo de derecha; sentido antihorario.
- **Historia:** Pista sobre la costa de Punta Marea, entre médanos y un faro. El viento cruzado del sur mueve la arena sobre el asfalto y cambia el agarre vuelta a vuelta; llueve seguido.
- **Carácter:** Técnico y cambiante. Se gana con el ajuste de alerones y la lectura del clima más que con motor.  **Rasgo único:** Un faro rojo y blanco marca el punto de frenada de la curva 1.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** Faro (derecha larga en bajada que acaba de cara al mar); La Escollera (S lenta junto a un espigón de roca); Médano (izquierda ciega sobre una duna; se ensucia con arena).
- **Paisaje:** Médanos con pasto duro, faro blanco y rojo, escollera de rocas, mar abierto, casas bajas de madera y cielo cambiante.
- **Kit de decorado sugerido (props):** el faro (cylinder + cone + sphere), el mar (water enorme a un lado), la escollera (sphere achatadas grises), casas de madera (box + cone) y dunas (sphere con squash 0.3).
- **Colores:** groundColor `#d8caa0`, skyColor `#afcfdf` · **Números de juego:** gripMod 1.05, brakingMod 0.95, aeroMod 1.15, wetChance 0.35, tempBase 26, overtakeDiff 0.65

### 04 · MONTERAL PARK  (`montrealpl`) — Monteral, Kaigam · 1978
- **Tipo:** Ribera y horquillas · **theme:** `grass` · **largo objetivo:** 2.4 km · **curvas:** 12 · **sentido y silueta:** Dos rectas largas unidas por horquillas de 180° y un tramo rápido junto al río; sentido horario.
- **Historia:** Parque de carreras junto a un río que se congela en invierno. El asfalto tarda en calentar y castiga a los neumáticos duros; el muro exterior de la última chicane es famoso por su cantidad de choques.
- **Carácter:** Rectas largas y horquillas: velocidad punta y frenada. Alta posibilidad de sobrepaso.  **Rasgo único:** Cada largada empieza con la banda del club de regatas tocando el himno junto al puente de hierro.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** Horquilla del Molino (izquierda de 180° al final de la recta más larga); Puente Alto (derecha rápida en peralte sobre el río); Muro de los Campeones (chicane final con muro exterior a un metro).
- **Paisaje:** Abetos oscuros, río ancho, tribunas de acero, puente de hierro, banderas del club de regatas y taludes con nieve sucia.
- **Kit de decorado sugerido (props):** abetos (tree pine), el río (water largo y angosto), un puente de hierro (box finas), banderas (cylinder finos) y taludes de nieve (sphere achatadas blancas).
- **Colores:** groundColor `#7f9578`, skyColor `#a7b3b8` · **Números de juego:** gripMod 1.1, brakingMod 1.1, aeroMod 0.85, wetChance 0.3, tempBase 18, overtakeDiff 0.35

### 05 · SIERRA GP  (`sierragp`) — Villa Sierra, Costas Unidas · 1988
- **Tipo:** De montaña, en ladera · **theme:** `mountain` · **largo objetivo:** 2.1 km · **curvas:** 12 · **sentido y silueta:** Vueltas en zigzag como una ladera: dos horquillas, una S encadenada y una cresta rápida; sentido antihorario.
- **Historia:** Circuito de montaña abierto en 1988 sobre la ladera de Villa Sierra. Tiene 46 metros de desnivel entre el punto más alto y el más bajo y casi ninguna zona plana (en el juego la pista es plana: el desnivel vive en la ficha y en el paisaje).
- **Carácter:** Desnivel y técnica. Curvas ciegas en cresta y bajadas que exigen confianza en los frenos.  **Rasgo único:** Un teleférico cruza sobre la horquilla más lenta y los pilotos ven las cabinas pasar arriba.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** Cresta (derecha ciega en la cima de la subida); El Tobogán (bajada en S con frenada a mitad de curva); La Herradura (horquilla de izquierda en contra-pendiente).
- **Paisaje:** Ladera de cerro con matorral seco, cables de un teleférico, taludes de tierra roja, casas blancas en la parte alta y tribunas en terrazas.
- **Kit de decorado sugerido (props):** cerros (sphere achatadas color tierra), torres de teleférico (cylinder finos + box), casas blancas (box + box techo) en terrazas, matorral (sphere pequeñas).
- **Colores:** groundColor `#a58b6c`, skyColor `#b7c3cf` · **Números de juego:** gripMod 0.92, brakingMod 1.05, aeroMod 1.05, wetChance 0.25, tempBase 20, overtakeDiff 0.55

### 06 · ESTEPA GRANDE  (`pampacircuit`) — Altyn Dala, Kostanay · CONTINENTE VIEJO · 1957
- **Tipo:** Óvalo abierto en la estepa · **theme:** `grass` · **largo objetivo:** 2.6 km · **curvas:** 11 · **sentido y silueta:** Óvalo grande y casi plano con curvas anchas y un pequeño quiebre en el fondo; sentido horario.
- **Historia:** Óvalo enorme en la estepa de Kostanay, construido en 1957 por una cooperativa de cosmonautas retirados que probaban máquinas junto a la vieja base de lanzamientos. Se sortean sus entradas en la feria de ganado de la aldea de Altyn Dala.
- **Carácter:** Rápido, abierto y con poca lluvia. Gana quien mejor cuida los neumáticos y la aerodinámica; el viento de la estepa mueve la carrera.  **Rasgo único:** Los cohetes oxidados del viejo campo de lanzamiento se ven de fondo en la recta trasera.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** La Manga (derecha larga y ancha de 200 metros, plena en cuarta); El Yurta (izquierda cerrada, la única frenada fuerte); Bebedero (curva rápida de derecha con borde de pasto).
- **Paisaje:** Estepa dorada sin árboles, horizonte plano, yurtas y tanques de agua, un cohete oxidado y torres de lanzamiento lejanas, tribunas de chapa y un silo junto a los boxes.
- **Kit de decorado sugerido (props):** yurtas (cylinder bajo + cone), cohete oxidado (cylinder + cone) y torre de lanzamiento (box altos finos) a 150 m del eje, silos (cylinder), tanques (cylinder).
- **Colores:** groundColor `#b9b56a`, skyColor `#c5cfd4` · **Números de juego:** gripMod 1, brakingMod 1, aeroMod 1, wetChance 0.1, tempBase 22, overtakeDiff 0.45

### 07 · LITORAL RING  (`litoralring`) — Puerto Litoral, Morvicia · 1969
- **Tipo:** De ribera húmedo · **theme:** `forest` · **largo objetivo:** 2.2 km · **curvas:** 12 · **sentido y silueta:** Curvas medias encadenadas que siguen la orilla, con un rulo de horquilla en la zona más baja; sentido antihorario.
- **Historia:** Circuito de ribera sobre un río ancho lleno de islas. La humedad no baja nunca y la niebla de la mañana retrasa las largadas con frecuencia; llueve en cuatro de cada diez fechas.
- **Carácter:** Fluido y húmedo. Trazado de curvas medias encadenadas donde el agarre cambia según el tramo.  **Rasgo único:** Las lanchas del club náutico saludan a la carrera desde el agua con bocinas.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** Isla Larga (derecha rápida junto al agua, se inunda primero); Camalote (S lenta entre pastos altos); Boya (izquierda de radio decreciente en la zona más baja).
- **Paisaje:** Río marrón con islas, sauces y juncos, muelles de madera, lanchas amarradas, niebla baja y tribunas sobre pilotes.
- **Kit de decorado sugerido (props):** el río (water grande), sauces (tree round color verde apagado), muelles (box largas y finas sobre el agua), lanchas (box + cone) y tribunas sobre pilotes (grandstand).
- **Colores:** groundColor `#8aa27a`, skyColor `#b8c6c3` · **Números de juego:** gripMod 0.98, brakingMod 0.9, aeroMod 1.1, wetChance 0.4, tempBase 23, overtakeDiff 0.6

### 08 · NORTE SPEEDWAY  (`nortespeed`) — Ciudad Norte, Magayanes · 1996
- **Tipo:** Óvalo peraltado de estadio · **theme:** `grass` · **largo objetivo:** 2.5 km · **curvas:** 8 · **sentido y silueta:** Óvalo alargado sin curvas lentas: dos peraltes grandes unidos por rectas; sentido antihorario.
- **Historia:** Speedway con peralte levantado para la copa de estadios de Magayanes. Es el circuito más caluroso de la serie y el único donde las curvas se toman con el auto inclinado (en el juego, sin peralte real).
- **Carácter:** Velocidad pura sobre óvalo. Se corre en pelotón, con succión y cambios de líder.  **Rasgo único:** Se corre con los mástiles de luz encendidos, incluso de día, por la tradición del estadio.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** Peralte Grande (curva 1-2 peraltada, 24° de inclinación); El Embudo (entrada estrecha en la curva 3); Cafetal (curva final peraltada hacia la recta de boxes).
- **Paisaje:** Estadio cerrado con tribunas altas en todo el perímetro, mástiles de luz, calor en el aire, cafetales y montañas verdes a lo lejos.
- **Kit de decorado sugerido (props):** tribunas altas continuas (grandstand y box largas), mástiles de luz (cylinder finos altos con box arriba), cafetales (tree round en filas) y montañas (sphere gigantes) lejos.
- **Colores:** groundColor `#7da06e`, skyColor `#c2cdd0` · **Números de juego:** gripMod 1.08, brakingMod 1, aeroMod 0.9, wetChance 0.2, tempBase 30, overtakeDiff 0.3

### 09 · DESIERTO RING  (`desiertoring`) — Oasis Dorado, Sahar · 2003
- **Tipo:** Desierto al atardecer · **theme:** `desert` · **largo objetivo:** 2.3 km · **curvas:** 12 · **sentido y silueta:** Trazado abierto que rodea el oasis con una recta larga trasera y una chicane entre dos muros; sentido horario.
- **Historia:** Pista abierta entre las dunas del desierto de Sahar, junto a un oasis con palmeras. Casi no llueve y el asfalto pasa de 50 °C al mediodía, por eso se corre al atardecer.
- **Carácter:** Calor extremo y arena. El desgaste de neumáticos y la refrigeración mandan.  **Rasgo único:** El paddock es un campamento de tiendas de tela; el té se sirve entre sesiones.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** La Duna (derecha larga que se cubre de arena con el viento); Zoco (chicane lenta entre dos muros de adobe); Espejismo (derecha rápida al final de la recta trasera).
- **Paisaje:** Dunas color ocre, palmeras del oasis, muros de adobe, tiendas de tela en el paddock, cielo anaranjado y sol bajo.
- **Kit de decorado sugerido (props):** dunas (sphere achatadas ocre), el oasis (water pequeña + tree round verde oscuro), muros de adobe (box), tiendas (cone + box).
- **Colores:** groundColor `#dabc87`, skyColor `#e6c9a0` · **Números de juego:** gripMod 0.94, brakingMod 1.18, aeroMod 0.9, wetChance 0.04, tempBase 34, overtakeDiff 0.32

### 10 · LAGO HELADO PARK  (`patagoniapark`) — Bahía de Hielo, Baikal · CONTINENTE VIEJO · 2009
- **Tipo:** Sobre lago congelado · **theme:** `mountain` · **largo objetivo:** 2.0 km · **curvas:** 13 · **sentido y silueta:** Trazado amplio sobre una bahía: una recta larga junto a la costa, una horquilla enorme y una zona de curvas ligadas; sentido antihorario.
- **Historia:** Circuito trazado sobre la bahía de un lago de aguas profundas de Baikal, en el Continente Viejo. En invierno el hielo alcanza un metro y se levanta un asfalto de emergencia con bordes de nieve compactada; sólo tres fechas por temporada tienen luz de sol suficiente.
- **Carácter:** Frío extremo, agarre bajo y viento lateral. Neumáticos difíciles de calentar y mucho subviraje; el error se paga con un muro de nieve.  **Rasgo único:** Los boxes son cabañas de madera sobre patines que remolcan al final de cada temporada.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** Cabo Frío (derecha ciega con viento lateral fuerte); Grieta (horquilla de izquierda pegada a una fisura marcada con banderines); La Isla (curva rápida de izquierda alrededor de un islote de rocas).
- **Paisaje:** Superficie blanca y azul de hielo, montañas nevadas, pinos oscuros en la costa, cabañas sobre patines, pescadores a lo lejos y cielo bajo.
- **Kit de decorado sugerido (props):** hielo (water blanquecina o box planas), pinos (tree pine) en la costa, cabañas (box + cone rojas), un rompehielos (box + cylinder) a un costado, montañas (sphere achatadas blancas).
- **Colores:** groundColor `#e6eef3`, skyColor `#c9d6df` · **Números de juego:** gripMod 0.82, brakingMod 1.1, aeroMod 1.05, wetChance 0.1, tempBase -3, overtakeDiff 0.5

### 11 · OCÉANO SPEED  (`atlanticospeed`) — Cabo Espuma, Grammes · 1982
- **Tipo:** Costero rápido · **theme:** `coast` · **largo objetivo:** 2.1 km · **curvas:** 10 · **sentido y silueta:** Rectas largas y curvas rápidas en línea con el acantilado; sólo una frenada lenta; sentido antihorario.
- **Historia:** Pista rápida sobre la costa de Grammes, con vista al océano abierto. El aire salado corroe todo lo metálico y los equipos lavan los autos entre sesiones.
- **Carácter:** Velocidad y viento. Pocas frenadas y muchos sobrepasos en la recta larga.  **Rasgo único:** Los banderilleros usan chalecos naranjas para no perderse entre las gaviotas.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** Espuma (derecha de alta velocidad al inicio de la vuelta); Rompiente (izquierda lenta después de la recta trasera); Bahía (largo giro de derecha con vista al mar).
- **Paisaje:** Acantilados bajos, mar azul, faros pequeños, casas encaladas de techo naranja, gaviotas y tribunas frente al agua.
- **Kit de decorado sugerido (props):** mar (water grande), acantilado (box larga baja gris), faros (cylinder + cone), casas encaladas (box blancas + box naranjas).
- **Colores:** groundColor `#cfc6a2`, skyColor `#b3d0e0` · **Números de juego:** gripMod 1.03, brakingMod 0.95, aeroMod 0.92, wetChance 0.32, tempBase 21, overtakeDiff 0.28

### 12 · SELVA VERDE  (`selvaverde`) — Río Verde, Riada · 1999
- **Tipo:** Selva húmeda cerrada · **theme:** `forest` · **largo objetivo:** 2.0 km · **curvas:** 12 · **sentido y silueta:** Circuito con muchos cambios de dirección, sin rectas largas salvo la principal; sentido horario.
- **Historia:** Circuito dentro de la selva de Riada, abierto a machete y asfalto en 1999. Llueve más de la mitad de las fechas y la humedad deja el asfalto brillante incluso con sol.
- **Carácter:** Húmedo, cerrado y con poco espacio. Curvas técnicas rodeadas de vegetación.  **Rasgo único:** Tucanes y monos aulladores interrumpen las prácticas; hay un equipo de cuidadores de fauna en los boxes.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** Liana (derecha lenta bajo un túnel de árboles); Cascada (izquierda rápida junto a una caída de agua); Curva del Caimán (horquilla junto a un arroyo, con barro en la salida).
- **Paisaje:** Selva densa, helechos gigantes, arroyos, palmeras altas, neblina, tribunas de madera con techo de paja y cielo tapado.
- **Kit de decorado sugerido (props):** palmeras y árboles altos (tree round de 18–30 m, verdes oscuros) muy juntos, arroyos (water finas), cascada (box alta azul clara), tribunas con techo de paja (grandstand + cone).
- **Colores:** groundColor `#5f8f5a`, skyColor `#9db7a8` · **Números de juego:** gripMod 1.08, brakingMod 1.12, aeroMod 1.2, wetChance 0.52, tempBase 29, overtakeDiff 0.67

### 13 · PUERTO URBANO  (`puertourbano`) — Puerto Nuevo, Iberia · 2011
- **Tipo:** Circuito de calle en muelles · **theme:** `city` · **largo objetivo:** 2.0 km · **curvas:** 13 · **sentido y silueta:** Calles cuadriculadas entre galpones: ángulos rectos, chicanes estrechas y una recta paralela al muelle; sentido antihorario.
- **Historia:** Circuito de calle entre los muelles y galpones del puerto de Iberia. Se arma y desarma en cinco días con vallas de hormigón y las grúas de carga miran la carrera desde arriba.
- **Carácter:** Urbano y de frenadas fuertes. Paredes muy cerca, casi ningún margen de error.  **Rasgo único:** Un buque de carga amarrado tapa la vista de la recta del muelle y se va al día siguiente.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** La Grúa (derecha de 90° debajo de una grúa portacontenedores); Muelle 4 (chicane estrecha entre galpones); Aduana (izquierda lenta con salida cerrada).
- **Paisaje:** Contenedores apilados, grúas portuarias, galpones de chapa, vallas de hormigón, edificios de oficinas al fondo y barcos amarrados.
- **Kit de decorado sugerido (props):** contenedores (box 12x2.6x2.4, colores vivos, apilados), grúas (box altas + box horizontal), galpones (box), el buque (box + box), agua del puerto (water).
- **Colores:** groundColor `#7e8286`, skyColor `#b1bcc4` · **Números de juego:** gripMod 0.93, brakingMod 1.28, aeroMod 0.94, wetChance 0.3, tempBase 23, overtakeDiff 0.72

### 14 · MAR SALADO  (`lagunaazul`) — Orilla Baja, Netanya · CONTINENTE VIEJO · 2013
- **Tipo:** Salar bajo el nivel del mar · **theme:** `desert` · **largo objetivo:** 2.3 km · **curvas:** 13 · **sentido y silueta:** Óvalo irregular junto a un lago salado: tramo rápido paralelo a la orilla, horquilla lenta y una S doble; sentido horario.
- **Historia:** Circuito junto al mar salado de Netanya, en el Continente Viejo: es el punto más bajo de todo el calendario, a 400 metros bajo el nivel del mar. El aire denso da más agarre y más motor, y la costra de sal brilla bajo el sol; la carrera termina antes del mediodía por el calor.
- **Carácter:** Calor seco, aire denso y sal en el asfalto. Frenadas estables y curvas rápidas; el desgaste de neumáticos es bajo pero el sobrecalentamiento amenaza.  **Rasgo único:** Los pilotos pueden flotar en el lago tras la carrera: es una tradición y el equipo ganador se tira vestido.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** Orilla (derecha larga pegada al lago salado); La Costra (horquilla de izquierda sobre sal blanca, agarre bajo); Gemelas (S doble de derecha-izquierda antes de la recta principal).
- **Paisaje:** Lago de agua celeste turquesa con costra de sal blanca, colinas ocres al fondo, palmeras datileras, tiendas de un mercado y un mirador.
- **Kit de decorado sugerido (props):** el lago (water celeste grande), sal (box planas blancas), colinas (sphere achatadas ocre), palmeras (tree round verde), tribuna larga baja (grandstand) y toldos (box).
- **Colores:** groundColor `#e7dfcc`, skyColor `#d9e3ea` · **Números de juego:** gripMod 1.02, brakingMod 1.05, aeroMod 1.12, wetChance 0.03, tempBase 38, overtakeDiff 0.45

### 15 · ALTIPLANO ENDURANCE  (`andesendurance`) — Alto Sotoa, Sotoa · 2005
- **Tipo:** Altiplano de resistencia · **theme:** `mountain` · **largo objetivo:** 3.1 km · **curvas:** 14 · **sentido y silueta:** Circuito largo con dos rectas, una zona técnica en bajada y un giro final ancho; es el más extenso del calendario; sentido antihorario.
- **Historia:** Circuito en el altiplano de Sotoa, a más de tres mil metros. El aire fino le quita potencia a los motores y hace trabajar más a los frenos. Es el más largo del calendario.
- **Carácter:** Exigente y largo, con 14 curvas. Se gana con constancia, no con una vuelta rápida.  **Rasgo único:** Los equipos cargan tubos de oxígeno y las bocinas suenan en quechua-sotoano para avisar las banderas.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** Apacheta (curva rápida de derecha sobre una loma con mojones de piedra); El Salar (recta con curva ciega final sobre una costra de sal); Paso del Cóndor (combinación lenta izquierda-derecha en la bajada).
- **Paisaje:** Altiplano seco, cerros pelados color tierra, salar blanco, llamas, cielo azul muy profundo, banderas de colores y casas de adobe.
- **Kit de decorado sugerido (props):** cerros pelados (sphere achatadas), llamas (box pequeñas + box), casas de adobe (box), banderas de colores (cylinder finos), salar (box plana blanca).
- **Colores:** groundColor `#b09a7a`, skyColor `#a9c8e6` · **Números de juego:** gripMod 0.95, brakingMod 1.2, aeroMod 1.05, wetChance 0.12, tempBase 19, overtakeDiff 0.43

### 16 · SABANA VELOCITY  (`pampavelocity`) — Karoo Ancho, Skote · 2000
- **Tipo:** Tri-óvalo de alta velocidad · **theme:** `grass` · **largo objetivo:** 2.9 km · **curvas:** 11 · **sentido y silueta:** Tri-óvalo casi plano con tres rectas largas y curvas amplias; sentido horario.
- **Historia:** Trazado muy rápido en la sabana de Skote, construido para batir marcas. Casi no tiene frenadas y por eso los ingenieros lo llaman «la autopista con banderas»; al atardecer las acacias proyectan sombras largas sobre el asfalto.
- **Carácter:** Velocidad máxima y poco desgaste de frenos. Muchísima succión y adelantamientos.  **Rasgo único:** Una manada de jirafas suele cruzar el fondo del paisaje durante las clasificaciones.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** Tornado (derecha larga plena a fondo); Cuarenta (curva ciega de izquierda a 40 metros de la valla); Meseta (chicane rápida antes de la recta principal).
- **Paisaje:** Sabana dorada con acacias de copa plana, termiteros, cerros aislados (kopjes), cielo abierto, tribunas largas y bajas.
- **Kit de decorado sugerido (props):** acacias (tree round de copa achatada, color oliva), kopjes (sphere achatadas grises), termiteros (cone), tribunas largas bajas (grandstand).
- **Colores:** groundColor `#c4b072`, skyColor `#bcd0d8` · **Números de juego:** gripMod 1.02, brakingMod 0.92, aeroMod 0.86, wetChance 0.09, tempBase 32, overtakeDiff 0.25

### 17 · SANTA CRUZ GP  (`santacruz`) — Santa Cruz, Melonia · 1997
- **Tipo:** Histórico de colinas y viñedos · **theme:** `forest` · **largo objetivo:** 2.4 km · **curvas:** 15 · **sentido y silueta:** Circuito sinuoso con muchas curvas de medio radio, dos horquillas y una subida final; sentido horario.
- **Historia:** Circuito en las colinas de Melonia, con un castillo en la cima y viñedos alrededor. Se corrió por primera vez en 1997 sobre un camino de carreta y hoy conserva el trazado original con curvas cerradas entre muros de piedra.
- **Carácter:** Sinuoso y técnico, con 15 curvas y muchos cambios de ritmo. Es de los más largos en tiempo de vuelta.  **Rasgo único:** El público invade el borde del asfalto con mesas de vino durante la carrera (detrás de las vallas, claro).
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** La Arboleda (derecha rápida entre árboles pegados a la pista); El Claro (horquilla lenta en un claro con sol); Cementerio (izquierda ciega en subida junto a un muro de piedra).
- **Paisaje:** Colinas de viñedos en hileras, un castillo, cipreses, muros de piedra, campanario y tribunas de piedra.
- **Kit de decorado sugerido (props):** viñedos (tree round bajos en hileras), castillo (box + cylinder + cone), cipreses (tree pine finos), muros de piedra (box), campanario (box + cone).
- **Colores:** groundColor `#8fa574`, skyColor `#b9c7d1` · **Números de juego:** gripMod 1.1, brakingMod 1.16, aeroMod 1.19, wetChance 0.44, tempBase 24, overtakeDiff 0.6

### 18 · NOCHE POLAR  (`nocturnaring`) — Nordhavn, Overmark · CONTINENTE VIEJO · 2015
- **Tipo:** Nocturno polar con aurora · **theme:** `night` · **largo objetivo:** 2.2 km · **curvas:** 13 · **sentido y silueta:** Circuito junto a un fiordo, con recta iluminada, horquilla junto al puerto y una zona de curvas ligadas; sentido antihorario.
- **Historia:** Circuito iluminado de Overmark, en el Continente Viejo, pensado para correr en la noche polar: durante seis meses el sol no sale y la aurora boreal cubre el cielo. Tiene 640 luminarias y se ve desde el puerto; es la fecha más vista por televisión.
- **Carácter:** Nocturno, técnico y con frenadas fuertes. La visión importa tanto como el auto; el frío hace más difícil calentar los neumáticos.  **Rasgo único:** Durante la carrera se apagan las luces de la ciudad de Nordhavn a mitad de carrera para ver la aurora.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** Luminaria (derecha rápida bajo un arco de luces); Fiordo (horquilla junto al agua oscura); Aurora (chicane final con el cielo verde de fondo).
- **Paisaje:** Fiordo negro con montañas nevadas, ciudad portuaria con casas de madera de colores, luces blancas y azules, aurora verde y pista brillante.
- **Kit de decorado sugerido (props):** casas de madera pintadas (box + cone rojas/amarillas/azules), agua del fiordo (water oscura), montañas nevadas (sphere gigantes), mástiles de luz (cylinder + box) cada 60 m.
- **Colores:** groundColor `#5d6c78`, skyColor `#0f1a35` · **Números de juego:** gripMod 0.96, brakingMod 1.16, aeroMod 1.08, wetChance 0.25, tempBase 2, overtakeDiff 0.48

### 19 · CALDERA RING  (`calderaring`) — Isla Caldera, Tamago · 2016
- **Tipo:** Cráter de volcán apagado · **theme:** `mountain` · **largo objetivo:** 2.0 km · **curvas:** 15 · **sentido y silueta:** Trazado que baja hacia el centro de un cráter y vuelve a subir: curvas cerradas encadenadas y una espiral; sentido antihorario.
- **Historia:** Circuito dentro de la caldera de un volcán apagado en la isla de Tamago. La pista baja hacia el centro del cráter y vuelve a subir; la grava negra es de ceniza volcánica.
- **Carácter:** Difícil, con curvas cerradas y desniveles. Poca velocidad pero muchos cambios de dirección.  **Rasgo único:** Sale vapor de una fumarola junto a la salida de la curva 12 y a veces tapa la visión.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** Boca (horquilla de derecha en el borde del cráter); Lava Fría (S lenta sobre coladas de roca negra); Fumarola (izquierda ciega junto a una salida de vapor).
- **Paisaje:** Paredes rocosas de un cráter, grava y roca negra, vapor saliendo de la tierra, vegetación escasa, lago verde en el fondo y cielo brumoso.
- **Kit de decorado sugerido (props):** paredes del cráter (sphere achatadas grises muy grandes en círculo), lago verde (water), coladas (box bajas negras), fumarolas (cylinder finos grises), pocos árboles.
- **Colores:** groundColor `#4b4b4e`, skyColor `#c2c0be` · **Números de juego:** gripMod 0.97, brakingMod 1.14, aeroMod 1.02, wetChance 0.2, tempBase 27, overtakeDiff 0.62

### 20 · AUTÓDROMO DEL CENTENARIO  (`centenario`) — Rheinau, Margin · 2018
- **Tipo:** Moderno de gala (final del campeonato) · **theme:** `grass` · **largo objetivo:** 2.5 km · **curvas:** 14 · **sentido y silueta:** Circuito fluido con una recta larga, una sección de eses y un gran giro de radio constante hacia la recta final; sentido horario.
- **Historia:** Autódromo inaugurado para el centenario de la federación automovilística de Margin, a orillas del río Rheinau. Es la sede de la fecha final y del acto de premiación del campeonato, con las banderas de todas las naciones.
- **Carácter:** Rápido y fluido, con curvas de radio amplio y buen espacio para sobrepasar. Cierra el año con el podio del campeonato.  **Rasgo único:** El podio se levanta sobre la recta principal y cada campeón recibe una copa con su nación grabada.
- **Curvas con nombre (en este orden de vuelta, la primera es la más cercana a la largada):** Monumento (derecha rápida junto a un monumento de piedra); Las Esses (cuatro curvas alternadas en tercera); Curva del Centenario (gran izquierda de radio constante hacia la recta final).
- **Paisaje:** Complejo moderno con tribunas curvas de hormigón claro, banderas de todas las naciones, un monumento en el infield, césped cuidado y podio frente a la recta.
- **Kit de decorado sugerido (props):** tribunas curvas (grandstand + box), banderas (cylinder finos altos con box), monumento (box + cylinder), césped y árboles jóvenes (tree round).
- **Colores:** groundColor `#8fb17f`, skyColor `#bfd0dc` · **Números de juego:** gripMod 1.03, brakingMod 1.05, aeroMod 1, wetChance 0.18, tempBase 22, overtakeDiff 0.5
