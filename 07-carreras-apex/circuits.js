'use strict';
// ==========================================================================
// CIRCUITOS DE LA SERIE NACIONAL GT3 — geografía y lore del mundo ficticio + carga de trazados externos.
//
// Cada circuito tiene su ficha (CIRCUIT_META): nación, región, año, historia, carácter, curvas con nombre y
// una descripción del paisaje. El trazado (layout) y el decorado (props) de hoy son PLACEHOLDERS: para reemplazarlos
// basta con poner circuits/<id>.json (ver CIRCUITOS_PARA_IA.md); si el archivo existe, pisa el trazado interno.
// Las naciones son las de assets/nations/ (mundo ficticio de Eternal Manager).
// ==========================================================================
const CIRCUIT_META = {
 "valleverde": {
  "nation": "Peronia",
  "region": "San Esteban",
  "opened": 1961,
  "kind": "Clásico permanente de campo",
  "theme": "grass",
  "km": 1.9,
  "turns": 12,
  "silhouette": "Óvalo alargado con una horquilla al final de la recta y una zona de eses en el fondo; sentido horario.",
  "ground": "#9dcc95",
  "sky": "#b6c4bd",
  "lore": "Primer autódromo permanente de la Serie Nacional. Se trazó en 1961 sobre el camino de tierra que unía dos estancias del valle de San Esteban y todavía se corre con las tribunas de madera originales en la recta principal.",
  "character": "Rápido y equilibrado: el circuito de referencia para comparar autos y el primero al que llega un equipo nuevo.",
  "quirk": "Un molino de viento gira junto a los boxes; los pilotos lo usan como referencia de dirección del viento.",
  "corners": [
   [
    "La Horqueta",
    "derecha lenta al final de la recta principal; frenada fuerte y única zona clara de sobrepaso"
   ],
   [
    "El Alambrado",
    "izquierda-derecha rápida en tercera, sin margen en la salida"
   ],
   [
    "Puente Viejo",
    "derecha de radio constante sobre un puentecito de piedra"
   ],
   [
    "Los Álamos",
    "curva ciega de izquierda entre dos hileras de álamos"
   ]
  ],
  "landscape": "Pastizales verdes, hileras de álamos, alambrados de campo, cerros bajos al fondo, molino de viento junto a los boxes y tribunas de madera pintadas de blanco.",
  "props": "una hilera de álamos (tree round) paralela a la recta trasera, un molino (cylinder + 4 box finas), un galpón de estancia (box + cone) y alambrados (box finas y largas) a 24 m del eje."
 },
 "autodromocentral": {
  "nation": "Estovackia",
  "region": "Tellin",
  "opened": 1952,
  "kind": "Industrial mixto en talleres ferroviarios",
  "theme": "city",
  "km": 1.7,
  "turns": 13,
  "silhouette": "Rectas cortas unidas por curvas de 90° y una chicane doble; parece un plano de vías, con horquillas cerradas.",
  "ground": "#8e918c",
  "sky": "#a9adb0",
  "lore": "Autódromo levantado dentro de las antiguas naves de reparación de locomotoras de Tellin, en Estovackia. Los boxes son las naves originales de chapa y el trazado esquiva las vías que quedaron a la vista. Se lo conoce por las frenadas.",
  "character": "Técnico y duro con los frenos: cuatro de sus curvas lentas llegan después de rectas largas. Poca velocidad punta, mucho trabajo de pedal.",
  "quirk": "Cruza una vía muerta con un tren museo estacionado; las bocinas del tren suenan en la largada.",
  "corners": [
   [
    "Los Talleres",
    "izquierda de 90° tras la recta principal, muy cerrada"
   ],
   [
    "La Chimenea",
    "horquilla de derecha rodeando una chimenea de ladrillo"
   ],
   [
    "Horno Alto",
    "chicane rápida de derecha-izquierda con muros cercanos"
   ],
   [
    "Cambio de Agujas",
    "S lenta sobre un empedrado de vía"
   ]
  ],
  "landscape": "Naves industriales de ladrillo y chapa, vías oxidadas, chimeneas, vagones abandonados, silos, tribunas metálicas bajas y cielo gris de invierno.",
  "props": "chimeneas (cylinder altos), naves (box largas con techo box más finas), vagones (box 12x3x3) en fila, un silo (cylinder), una torre de agua (cylinder + cone)."
 },
 "costasur": {
  "nation": "Valurria",
  "region": "Punta Marea",
  "opened": 1974,
  "kind": "Costero con viento cruzado",
  "theme": "coast",
  "km": 1.9,
  "turns": 12,
  "silhouette": "Trazado que serpentea entre médanos: una recta de cara al mar, una S lenta en el espigón y un giro largo de derecha; sentido antihorario.",
  "ground": "#d8caa0",
  "sky": "#afcfdf",
  "lore": "Pista sobre la costa de Punta Marea, entre médanos y un faro. El viento cruzado del sur mueve la arena sobre el asfalto y cambia el agarre vuelta a vuelta; llueve seguido.",
  "character": "Técnico y cambiante. Se gana con el ajuste de alerones y la lectura del clima más que con motor.",
  "quirk": "Un faro rojo y blanco marca el punto de frenada de la curva 1.",
  "corners": [
   [
    "Faro",
    "derecha larga en bajada que acaba de cara al mar"
   ],
   [
    "La Escollera",
    "S lenta junto a un espigón de roca"
   ],
   [
    "Médano",
    "izquierda ciega sobre una duna; se ensucia con arena"
   ]
  ],
  "landscape": "Médanos con pasto duro, faro blanco y rojo, escollera de rocas, mar abierto, casas bajas de madera y cielo cambiante.",
  "props": "el faro (cylinder + cone + sphere), el mar (water enorme a un lado), la escollera (sphere achatadas grises), casas de madera (box + cone) y dunas (sphere con squash 0.3)."
 },
 "montrealpl": {
  "nation": "Kaigam",
  "region": "Monteral",
  "opened": 1978,
  "kind": "Ribera y horquillas",
  "theme": "grass",
  "km": 2.4,
  "turns": 12,
  "silhouette": "Dos rectas largas unidas por horquillas de 180° y un tramo rápido junto al río; sentido horario.",
  "ground": "#7f9578",
  "sky": "#a7b3b8",
  "lore": "Parque de carreras junto a un río que se congela en invierno. El asfalto tarda en calentar y castiga a los neumáticos duros; el muro exterior de la última chicane es famoso por su cantidad de choques.",
  "character": "Rectas largas y horquillas: velocidad punta y frenada. Alta posibilidad de sobrepaso.",
  "quirk": "Cada largada empieza con la banda del club de regatas tocando el himno junto al puente de hierro.",
  "corners": [
   [
    "Horquilla del Molino",
    "izquierda de 180° al final de la recta más larga"
   ],
   [
    "Puente Alto",
    "derecha rápida en peralte sobre el río"
   ],
   [
    "Muro de los Campeones",
    "chicane final con muro exterior a un metro"
   ]
  ],
  "landscape": "Abetos oscuros, río ancho, tribunas de acero, puente de hierro, banderas del club de regatas y taludes con nieve sucia.",
  "props": "abetos (tree pine), el río (water largo y angosto), un puente de hierro (box finas), banderas (cylinder finos) y taludes de nieve (sphere achatadas blancas)."
 },
 "sierragp": {
  "nation": "Costas Unidas",
  "region": "Villa Sierra",
  "opened": 1988,
  "kind": "De montaña, en ladera",
  "theme": "mountain",
  "km": 2.1,
  "turns": 12,
  "silhouette": "Vueltas en zigzag como una ladera: dos horquillas, una S encadenada y una cresta rápida; sentido antihorario.",
  "ground": "#a58b6c",
  "sky": "#b7c3cf",
  "lore": "Circuito de montaña abierto en 1988 sobre la ladera de Villa Sierra. Tiene 46 metros de desnivel entre el punto más alto y el más bajo y casi ninguna zona plana (en el juego la pista es plana: el desnivel vive en la ficha y en el paisaje).",
  "character": "Desnivel y técnica. Curvas ciegas en cresta y bajadas que exigen confianza en los frenos.",
  "quirk": "Un teleférico cruza sobre la horquilla más lenta y los pilotos ven las cabinas pasar arriba.",
  "corners": [
   [
    "Cresta",
    "derecha ciega en la cima de la subida"
   ],
   [
    "El Tobogán",
    "bajada en S con frenada a mitad de curva"
   ],
   [
    "La Herradura",
    "horquilla de izquierda en contra-pendiente"
   ]
  ],
  "landscape": "Ladera de cerro con matorral seco, cables de un teleférico, taludes de tierra roja, casas blancas en la parte alta y tribunas en terrazas.",
  "props": "cerros (sphere achatadas color tierra), torres de teleférico (cylinder finos + box), casas blancas (box + box techo) en terrazas, matorral (sphere pequeñas)."
 },
 "pampacircuit": {
  "nation": "Kostanay",
  "region": "Altyn Dala",
  "opened": 1957,
  "kind": "Óvalo abierto en la estepa",
  "theme": "grass",
  "km": 2.6,
  "turns": 11,
  "silhouette": "Óvalo grande y casi plano con curvas anchas y un pequeño quiebre en el fondo; sentido horario.",
  "ground": "#b9b56a",
  "sky": "#c5cfd4",
  "lore": "Óvalo enorme en la estepa de Kostanay, construido en 1957 por una cooperativa de cosmonautas retirados que probaban máquinas junto a la vieja base de lanzamientos. Se sortean sus entradas en la feria de ganado de la aldea de Altyn Dala.",
  "character": "Rápido, abierto y con poca lluvia. Gana quien mejor cuida los neumáticos y la aerodinámica; el viento de la estepa mueve la carrera.",
  "quirk": "Los cohetes oxidados del viejo campo de lanzamiento se ven de fondo en la recta trasera.",
  "corners": [
   [
    "La Manga",
    "derecha larga y ancha de 200 metros, plena en cuarta"
   ],
   [
    "El Yurta",
    "izquierda cerrada, la única frenada fuerte"
   ],
   [
    "Bebedero",
    "curva rápida de derecha con borde de pasto"
   ]
  ],
  "landscape": "Estepa dorada sin árboles, horizonte plano, yurtas y tanques de agua, un cohete oxidado y torres de lanzamiento lejanas, tribunas de chapa y un silo junto a los boxes.",
  "props": "yurtas (cylinder bajo + cone), cohete oxidado (cylinder + cone) y torre de lanzamiento (box altos finos) a 150 m del eje, silos (cylinder), tanques (cylinder)."
 },
 "litoralring": {
  "nation": "Morvicia",
  "region": "Puerto Litoral",
  "opened": 1969,
  "kind": "De ribera húmedo",
  "theme": "forest",
  "km": 2.2,
  "turns": 12,
  "silhouette": "Curvas medias encadenadas que siguen la orilla, con un rulo de horquilla en la zona más baja; sentido antihorario.",
  "ground": "#8aa27a",
  "sky": "#b8c6c3",
  "lore": "Circuito de ribera sobre un río ancho lleno de islas. La humedad no baja nunca y la niebla de la mañana retrasa las largadas con frecuencia; llueve en cuatro de cada diez fechas.",
  "character": "Fluido y húmedo. Trazado de curvas medias encadenadas donde el agarre cambia según el tramo.",
  "quirk": "Las lanchas del club náutico saludan a la carrera desde el agua con bocinas.",
  "corners": [
   [
    "Isla Larga",
    "derecha rápida junto al agua, se inunda primero"
   ],
   [
    "Camalote",
    "S lenta entre pastos altos"
   ],
   [
    "Boya",
    "izquierda de radio decreciente en la zona más baja"
   ]
  ],
  "landscape": "Río marrón con islas, sauces y juncos, muelles de madera, lanchas amarradas, niebla baja y tribunas sobre pilotes.",
  "props": "el río (water grande), sauces (tree round color verde apagado), muelles (box largas y finas sobre el agua), lanchas (box + cone) y tribunas sobre pilotes (grandstand)."
 },
 "nortespeed": {
  "nation": "Magayanes",
  "region": "Ciudad Norte",
  "opened": 1996,
  "kind": "Óvalo peraltado de estadio",
  "theme": "grass",
  "km": 2.5,
  "turns": 8,
  "silhouette": "Óvalo alargado sin curvas lentas: dos peraltes grandes unidos por rectas; sentido antihorario.",
  "ground": "#7da06e",
  "sky": "#c2cdd0",
  "lore": "Speedway con peralte levantado para la copa de estadios de Magayanes. Es el circuito más caluroso de la serie y el único donde las curvas se toman con el auto inclinado (en el juego, sin peralte real).",
  "character": "Velocidad pura sobre óvalo. Se corre en pelotón, con succión y cambios de líder.",
  "quirk": "Se corre con los mástiles de luz encendidos, incluso de día, por la tradición del estadio.",
  "corners": [
   [
    "Peralte Grande",
    "curva 1-2 peraltada, 24° de inclinación"
   ],
   [
    "El Embudo",
    "entrada estrecha en la curva 3"
   ],
   [
    "Cafetal",
    "curva final peraltada hacia la recta de boxes"
   ]
  ],
  "landscape": "Estadio cerrado con tribunas altas en todo el perímetro, mástiles de luz, calor en el aire, cafetales y montañas verdes a lo lejos.",
  "props": "tribunas altas continuas (grandstand y box largas), mástiles de luz (cylinder finos altos con box arriba), cafetales (tree round en filas) y montañas (sphere gigantes) lejos."
 },
 "desiertoring": {
  "nation": "Sahar",
  "region": "Oasis Dorado",
  "opened": 2003,
  "kind": "Desierto al atardecer",
  "theme": "desert",
  "km": 2.3,
  "turns": 12,
  "silhouette": "Trazado abierto que rodea el oasis con una recta larga trasera y una chicane entre dos muros; sentido horario.",
  "ground": "#dabc87",
  "sky": "#e6c9a0",
  "lore": "Pista abierta entre las dunas del desierto de Sahar, junto a un oasis con palmeras. Casi no llueve y el asfalto pasa de 50 °C al mediodía, por eso se corre al atardecer.",
  "character": "Calor extremo y arena. El desgaste de neumáticos y la refrigeración mandan.",
  "quirk": "El paddock es un campamento de tiendas de tela; el té se sirve entre sesiones.",
  "corners": [
   [
    "La Duna",
    "derecha larga que se cubre de arena con el viento"
   ],
   [
    "Zoco",
    "chicane lenta entre dos muros de adobe"
   ],
   [
    "Espejismo",
    "derecha rápida al final de la recta trasera"
   ]
  ],
  "landscape": "Dunas color ocre, palmeras del oasis, muros de adobe, tiendas de tela en el paddock, cielo anaranjado y sol bajo.",
  "props": "dunas (sphere achatadas ocre), el oasis (water pequeña + tree round verde oscuro), muros de adobe (box), tiendas (cone + box)."
 },
 "patagoniapark": {
  "nation": "Baikal",
  "region": "Bahía de Hielo",
  "opened": 2009,
  "kind": "Sobre lago congelado",
  "theme": "mountain",
  "km": 2.0,
  "turns": 13,
  "silhouette": "Trazado amplio sobre una bahía: una recta larga junto a la costa, una horquilla enorme y una zona de curvas ligadas; sentido antihorario.",
  "ground": "#e6eef3",
  "sky": "#c9d6df",
  "lore": "Circuito trazado sobre la bahía de un lago de aguas profundas de Baikal, en el Continente Viejo. En invierno el hielo alcanza un metro y se levanta un asfalto de emergencia con bordes de nieve compactada; sólo tres fechas por temporada tienen luz de sol suficiente.",
  "character": "Frío extremo, agarre bajo y viento lateral. Neumáticos difíciles de calentar y mucho subviraje; el error se paga con un muro de nieve.",
  "quirk": "Los boxes son cabañas de madera sobre patines que remolcan al final de cada temporada.",
  "corners": [
   [
    "Cabo Frío",
    "derecha ciega con viento lateral fuerte"
   ],
   [
    "Grieta",
    "horquilla de izquierda pegada a una fisura marcada con banderines"
   ],
   [
    "La Isla",
    "curva rápida de izquierda alrededor de un islote de rocas"
   ]
  ],
  "landscape": "Superficie blanca y azul de hielo, montañas nevadas, pinos oscuros en la costa, cabañas sobre patines, pescadores a lo lejos y cielo bajo.",
  "props": "hielo (water blanquecina o box planas), pinos (tree pine) en la costa, cabañas (box + cone rojas), un rompehielos (box + cylinder) a un costado, montañas (sphere achatadas blancas)."
 },
 "atlanticospeed": {
  "nation": "Grammes",
  "region": "Cabo Espuma",
  "opened": 1982,
  "kind": "Costero rápido",
  "theme": "coast",
  "km": 2.1,
  "turns": 10,
  "silhouette": "Rectas largas y curvas rápidas en línea con el acantilado; sólo una frenada lenta; sentido antihorario.",
  "ground": "#cfc6a2",
  "sky": "#b3d0e0",
  "lore": "Pista rápida sobre la costa de Grammes, con vista al océano abierto. El aire salado corroe todo lo metálico y los equipos lavan los autos entre sesiones.",
  "character": "Velocidad y viento. Pocas frenadas y muchos sobrepasos en la recta larga.",
  "quirk": "Los banderilleros usan chalecos naranjas para no perderse entre las gaviotas.",
  "corners": [
   [
    "Espuma",
    "derecha de alta velocidad al inicio de la vuelta"
   ],
   [
    "Rompiente",
    "izquierda lenta después de la recta trasera"
   ],
   [
    "Bahía",
    "largo giro de derecha con vista al mar"
   ]
  ],
  "landscape": "Acantilados bajos, mar azul, faros pequeños, casas encaladas de techo naranja, gaviotas y tribunas frente al agua.",
  "props": "mar (water grande), acantilado (box larga baja gris), faros (cylinder + cone), casas encaladas (box blancas + box naranjas)."
 },
 "selvaverde": {
  "nation": "Riada",
  "region": "Río Verde",
  "opened": 1999,
  "kind": "Selva húmeda cerrada",
  "theme": "forest",
  "km": 2.0,
  "turns": 12,
  "silhouette": "Circuito con muchos cambios de dirección, sin rectas largas salvo la principal; sentido horario.",
  "ground": "#5f8f5a",
  "sky": "#9db7a8",
  "lore": "Circuito dentro de la selva de Riada, abierto a machete y asfalto en 1999. Llueve más de la mitad de las fechas y la humedad deja el asfalto brillante incluso con sol.",
  "character": "Húmedo, cerrado y con poco espacio. Curvas técnicas rodeadas de vegetación.",
  "quirk": "Tucanes y monos aulladores interrumpen las prácticas; hay un equipo de cuidadores de fauna en los boxes.",
  "corners": [
   [
    "Liana",
    "derecha lenta bajo un túnel de árboles"
   ],
   [
    "Cascada",
    "izquierda rápida junto a una caída de agua"
   ],
   [
    "Curva del Caimán",
    "horquilla junto a un arroyo, con barro en la salida"
   ]
  ],
  "landscape": "Selva densa, helechos gigantes, arroyos, palmeras altas, neblina, tribunas de madera con techo de paja y cielo tapado.",
  "props": "palmeras y árboles altos (tree round de 18–30 m, verdes oscuros) muy juntos, arroyos (water finas), cascada (box alta azul clara), tribunas con techo de paja (grandstand + cone)."
 },
 "puertourbano": {
  "nation": "Iberia",
  "region": "Puerto Nuevo",
  "opened": 2011,
  "kind": "Circuito de calle en muelles",
  "theme": "city",
  "km": 2.0,
  "turns": 13,
  "silhouette": "Calles cuadriculadas entre galpones: ángulos rectos, chicanes estrechas y una recta paralela al muelle; sentido antihorario.",
  "ground": "#7e8286",
  "sky": "#b1bcc4",
  "lore": "Circuito de calle entre los muelles y galpones del puerto de Iberia. Se arma y desarma en cinco días con vallas de hormigón y las grúas de carga miran la carrera desde arriba.",
  "character": "Urbano y de frenadas fuertes. Paredes muy cerca, casi ningún margen de error.",
  "quirk": "Un buque de carga amarrado tapa la vista de la recta del muelle y se va al día siguiente.",
  "corners": [
   [
    "La Grúa",
    "derecha de 90° debajo de una grúa portacontenedores"
   ],
   [
    "Muelle 4",
    "chicane estrecha entre galpones"
   ],
   [
    "Aduana",
    "izquierda lenta con salida cerrada"
   ]
  ],
  "landscape": "Contenedores apilados, grúas portuarias, galpones de chapa, vallas de hormigón, edificios de oficinas al fondo y barcos amarrados.",
  "props": "contenedores (box 12x2.6x2.4, colores vivos, apilados), grúas (box altas + box horizontal), galpones (box), el buque (box + box), agua del puerto (water)."
 },
 "lagunaazul": {
  "nation": "Netanya",
  "region": "Orilla Baja",
  "opened": 2013,
  "kind": "Salar bajo el nivel del mar",
  "theme": "desert",
  "km": 2.3,
  "turns": 13,
  "silhouette": "Óvalo irregular junto a un lago salado: tramo rápido paralelo a la orilla, horquilla lenta y una S doble; sentido horario.",
  "ground": "#e7dfcc",
  "sky": "#d9e3ea",
  "lore": "Circuito junto al mar salado de Netanya, en el Continente Viejo: es el punto más bajo de todo el calendario, a 400 metros bajo el nivel del mar. El aire denso da más agarre y más motor, y la costra de sal brilla bajo el sol; la carrera termina antes del mediodía por el calor.",
  "character": "Calor seco, aire denso y sal en el asfalto. Frenadas estables y curvas rápidas; el desgaste de neumáticos es bajo pero el sobrecalentamiento amenaza.",
  "quirk": "Los pilotos pueden flotar en el lago tras la carrera: es una tradición y el equipo ganador se tira vestido.",
  "corners": [
   [
    "Orilla",
    "derecha larga pegada al lago salado"
   ],
   [
    "La Costra",
    "horquilla de izquierda sobre sal blanca, agarre bajo"
   ],
   [
    "Gemelas",
    "S doble de derecha-izquierda antes de la recta principal"
   ]
  ],
  "landscape": "Lago de agua celeste turquesa con costra de sal blanca, colinas ocres al fondo, palmeras datileras, tiendas de un mercado y un mirador.",
  "props": "el lago (water celeste grande), sal (box planas blancas), colinas (sphere achatadas ocre), palmeras (tree round verde), tribuna larga baja (grandstand) y toldos (box)."
 },
 "andesendurance": {
  "nation": "Sotoa",
  "region": "Alto Sotoa",
  "opened": 2005,
  "kind": "Altiplano de resistencia",
  "theme": "mountain",
  "km": 3.1,
  "turns": 14,
  "silhouette": "Circuito largo con dos rectas, una zona técnica en bajada y un giro final ancho; es el más extenso del calendario; sentido antihorario.",
  "ground": "#b09a7a",
  "sky": "#a9c8e6",
  "lore": "Circuito en el altiplano de Sotoa, a más de tres mil metros. El aire fino le quita potencia a los motores y hace trabajar más a los frenos. Es el más largo del calendario.",
  "character": "Exigente y largo, con 14 curvas. Se gana con constancia, no con una vuelta rápida.",
  "quirk": "Los equipos cargan tubos de oxígeno y las bocinas suenan en quechua-sotoano para avisar las banderas.",
  "corners": [
   [
    "Apacheta",
    "curva rápida de derecha sobre una loma con mojones de piedra"
   ],
   [
    "El Salar",
    "recta con curva ciega final sobre una costra de sal"
   ],
   [
    "Paso del Cóndor",
    "combinación lenta izquierda-derecha en la bajada"
   ]
  ],
  "landscape": "Altiplano seco, cerros pelados color tierra, salar blanco, llamas, cielo azul muy profundo, banderas de colores y casas de adobe.",
  "props": "cerros pelados (sphere achatadas), llamas (box pequeñas + box), casas de adobe (box), banderas de colores (cylinder finos), salar (box plana blanca)."
 },
 "pampavelocity": {
  "nation": "Skote",
  "region": "Karoo Ancho",
  "opened": 2000,
  "kind": "Tri-óvalo de alta velocidad",
  "theme": "grass",
  "km": 2.9,
  "turns": 11,
  "silhouette": "Tri-óvalo casi plano con tres rectas largas y curvas amplias; sentido horario.",
  "ground": "#c4b072",
  "sky": "#bcd0d8",
  "lore": "Trazado muy rápido en la sabana de Skote, construido para batir marcas. Casi no tiene frenadas y por eso los ingenieros lo llaman «la autopista con banderas»; al atardecer las acacias proyectan sombras largas sobre el asfalto.",
  "character": "Velocidad máxima y poco desgaste de frenos. Muchísima succión y adelantamientos.",
  "quirk": "Una manada de jirafas suele cruzar el fondo del paisaje durante las clasificaciones.",
  "corners": [
   [
    "Tornado",
    "derecha larga plena a fondo"
   ],
   [
    "Cuarenta",
    "curva ciega de izquierda a 40 metros de la valla"
   ],
   [
    "Meseta",
    "chicane rápida antes de la recta principal"
   ]
  ],
  "landscape": "Sabana dorada con acacias de copa plana, termiteros, cerros aislados (kopjes), cielo abierto, tribunas largas y bajas.",
  "props": "acacias (tree round de copa achatada, color oliva), kopjes (sphere achatadas grises), termiteros (cone), tribunas largas bajas (grandstand)."
 },
 "santacruz": {
  "nation": "Melonia",
  "region": "Santa Cruz",
  "opened": 1997,
  "kind": "Histórico de colinas y viñedos",
  "theme": "forest",
  "km": 2.4,
  "turns": 15,
  "silhouette": "Circuito sinuoso con muchas curvas de medio radio, dos horquillas y una subida final; sentido horario.",
  "ground": "#8fa574",
  "sky": "#b9c7d1",
  "lore": "Circuito en las colinas de Melonia, con un castillo en la cima y viñedos alrededor. Se corrió por primera vez en 1997 sobre un camino de carreta y hoy conserva el trazado original con curvas cerradas entre muros de piedra.",
  "character": "Sinuoso y técnico, con 15 curvas y muchos cambios de ritmo. Es de los más largos en tiempo de vuelta.",
  "quirk": "El público invade el borde del asfalto con mesas de vino durante la carrera (detrás de las vallas, claro).",
  "corners": [
   [
    "La Arboleda",
    "derecha rápida entre árboles pegados a la pista"
   ],
   [
    "El Claro",
    "horquilla lenta en un claro con sol"
   ],
   [
    "Cementerio",
    "izquierda ciega en subida junto a un muro de piedra"
   ]
  ],
  "landscape": "Colinas de viñedos en hileras, un castillo, cipreses, muros de piedra, campanario y tribunas de piedra.",
  "props": "viñedos (tree round bajos en hileras), castillo (box + cylinder + cone), cipreses (tree pine finos), muros de piedra (box), campanario (box + cone)."
 },
 "nocturnaring": {
  "nation": "Overmark",
  "region": "Nordhavn",
  "opened": 2015,
  "kind": "Nocturno polar con aurora",
  "theme": "night",
  "km": 2.2,
  "turns": 13,
  "silhouette": "Circuito junto a un fiordo, con recta iluminada, horquilla junto al puerto y una zona de curvas ligadas; sentido antihorario.",
  "ground": "#5d6c78",
  "sky": "#0f1a35",
  "lore": "Circuito iluminado de Overmark, en el Continente Viejo, pensado para correr en la noche polar: durante seis meses el sol no sale y la aurora boreal cubre el cielo. Tiene 640 luminarias y se ve desde el puerto; es la fecha más vista por televisión.",
  "character": "Nocturno, técnico y con frenadas fuertes. La visión importa tanto como el auto; el frío hace más difícil calentar los neumáticos.",
  "quirk": "Durante la carrera se apagan las luces de la ciudad de Nordhavn a mitad de carrera para ver la aurora.",
  "corners": [
   [
    "Luminaria",
    "derecha rápida bajo un arco de luces"
   ],
   [
    "Fiordo",
    "horquilla junto al agua oscura"
   ],
   [
    "Aurora",
    "chicane final con el cielo verde de fondo"
   ]
  ],
  "landscape": "Fiordo negro con montañas nevadas, ciudad portuaria con casas de madera de colores, luces blancas y azules, aurora verde y pista brillante.",
  "props": "casas de madera pintadas (box + cone rojas/amarillas/azules), agua del fiordo (water oscura), montañas nevadas (sphere gigantes), mástiles de luz (cylinder + box) cada 60 m."
 },
 "calderaring": {
  "nation": "Tamago",
  "region": "Isla Caldera",
  "opened": 2016,
  "kind": "Cráter de volcán apagado",
  "theme": "mountain",
  "km": 2.0,
  "turns": 15,
  "silhouette": "Trazado que baja hacia el centro de un cráter y vuelve a subir: curvas cerradas encadenadas y una espiral; sentido antihorario.",
  "ground": "#4b4b4e",
  "sky": "#c2c0be",
  "lore": "Circuito dentro de la caldera de un volcán apagado en la isla de Tamago. La pista baja hacia el centro del cráter y vuelve a subir; la grava negra es de ceniza volcánica.",
  "character": "Difícil, con curvas cerradas y desniveles. Poca velocidad pero muchos cambios de dirección.",
  "quirk": "Sale vapor de una fumarola junto a la salida de la curva 12 y a veces tapa la visión.",
  "corners": [
   [
    "Boca",
    "horquilla de derecha en el borde del cráter"
   ],
   [
    "Lava Fría",
    "S lenta sobre coladas de roca negra"
   ],
   [
    "Fumarola",
    "izquierda ciega junto a una salida de vapor"
   ]
  ],
  "landscape": "Paredes rocosas de un cráter, grava y roca negra, vapor saliendo de la tierra, vegetación escasa, lago verde en el fondo y cielo brumoso.",
  "props": "paredes del cráter (sphere achatadas grises muy grandes en círculo), lago verde (water), coladas (box bajas negras), fumarolas (cylinder finos grises), pocos árboles."
 },
 "centenario": {
  "nation": "Margin",
  "region": "Rheinau",
  "opened": 2018,
  "kind": "Moderno de gala (final del campeonato)",
  "theme": "grass",
  "km": 2.5,
  "turns": 14,
  "silhouette": "Circuito fluido con una recta larga, una sección de eses y un gran giro de radio constante hacia la recta final; sentido horario.",
  "ground": "#8fb17f",
  "sky": "#bfd0dc",
  "lore": "Autódromo inaugurado para el centenario de la federación automovilística de Margin, a orillas del río Rheinau. Es la sede de la fecha final y del acto de premiación del campeonato, con las banderas de todas las naciones.",
  "character": "Rápido y fluido, con curvas de radio amplio y buen espacio para sobrepasar. Cierra el año con el podio del campeonato.",
  "quirk": "El podio se levanta sobre la recta principal y cada campeón recibe una copa con su nación grabada.",
  "corners": [
   [
    "Monumento",
    "derecha rápida junto a un monumento de piedra"
   ],
   [
    "Las Esses",
    "cuatro curvas alternadas en tercera"
   ],
   [
    "Curva del Centenario",
    "gran izquierda de radio constante hacia la recta final"
   ]
  ],
  "landscape": "Complejo moderno con tribunas curvas de hormigón claro, banderas de todas las naciones, un monumento en el infield, césped cuidado y podio frente a la recta.",
  "props": "tribunas curvas (grandstand + box), banderas (cylinder finos altos con box), monumento (box + cylinder), césped y árboles jóvenes (tree round)."
 }
};
// Nombres visibles de los circuitos (los ids de archivo no cambian).
const TRACK_NAMES = {
 "valleverde": "VALLE VERDE",
 "autodromocentral": "TELLIN RAILWORKS",
 "costasur": "COSTA SUR",
 "montrealpl": "MONTERAL PARK",
 "sierragp": "SIERRA GP",
 "pampacircuit": "ESTEPA GRANDE",
 "litoralring": "LITORAL RING",
 "nortespeed": "NORTE SPEEDWAY",
 "desiertoring": "DESIERTO RING",
 "patagoniapark": "LAGO HELADO PARK",
 "atlanticospeed": "OCÉANO SPEED",
 "selvaverde": "SELVA VERDE",
 "puertourbano": "PUERTO URBANO",
 "lagunaazul": "MAR SALADO",
 "andesendurance": "ALTIPLANO ENDURANCE",
 "pampavelocity": "SABANA VELOCITY",
 "santacruz": "SANTA CRUZ GP",
 "nocturnaring": "NOCHE POLAR",
 "calderaring": "CALDERA RING",
 "centenario": "AUTÓDROMO DEL CENTENARIO"
};

// Ajustes de juego por circuito según su carácter (agarre, frenos, aero, lluvia, temperatura, dificultad de sobrepaso). El JSON del circuito los puede pisar.
const CIRCUIT_MODS = {
  pampacircuit: { tempBase: 22 },
  patagoniapark: { gripMod: 0.82, brakingMod: 1.1, aeroMod: 1.05, wetChance: 0.1, tempBase: -3, overtakeDiff: 0.5 },
  lagunaazul: { gripMod: 1.02, brakingMod: 1.05, aeroMod: 1.12, wetChance: 0.03, tempBase: 38, overtakeDiff: 0.45 },
  nocturnaring: { gripMod: 0.96, tempBase: 2, wetChance: 0.25 },
  santacruz: { tempBase: 24 },
  pampavelocity: { tempBase: 32 },
};
// Ficha visible en el juego (atlas de circuitos) y datos derivados.
TRACKS.forEach(t => {
  const m = CIRCUIT_META[t.id];
  if (!m) return;
  t.nation = m.nation; t.region = m.region; t.opened = m.opened; t.lore = m.lore; t.character = m.character; t.cornerNames = m.corners; t.landscape = m.landscape;
  t.kind = m.kind; t.quirk = m.quirk; t.silhouette = m.silhouette; t.propsKit = m.props; t.targetKm = m.km;
  t.country = m.region + ', ' + m.nation;
  if (TRACK_NAMES[t.id]) t.name = TRACK_NAMES[t.id];
  if (m.turns) t.corners = m.turns;
  t.theme = m.theme;
  if (m.ground && !t.groundColor) t.groundColor = m.ground;
  if (m.sky && !t.skyColor) t.skyColor = m.sky;
  Object.assign(t, CIRCUIT_MODS[t.id] || {});
  t.desc = m.kind;
});

// ---- trazados y decorado externos: circuits/<id>.json, o un único circuits/circuits.json con todos ({ "<id>": {...}, ... }) — ver CIRCUITOS_PARA_IA.md ----
const CIRCUIT_THEMES = ['grass', 'desert', 'coast', 'forest', 'city', 'night', 'mountain'];
const CIRCUIT_NUM = { gripMod: [0.7, 1.3], brakingMod: [0.7, 1.4], aeroMod: [0.7, 1.4], overtakeDiff: [0.1, 0.95], wetChance: [0, 0.8], tempBase: [-10, 45], treeCount: [0, 320], halfWidth: [6, 14] };
function validCircuitFile(d) {
  if (!d || typeof d !== 'object') return 'no es un objeto';
  if (d.layout != null) {
    if (!Array.isArray(d.layout) || d.layout.length < 8 || d.layout.length > 60) return 'layout debe tener entre 8 y 60 puntos';
    if (d.layout.some(p => !Array.isArray(p) || p.length !== 2 || !Number.isFinite(p[0]) || !Number.isFinite(p[1]) || Math.abs(p[0]) > 900 || Math.abs(p[1]) > 900)) return 'cada punto de layout es [x,z] en metros, |valor| ≤ 900';
    if (d.layout.slice(0, 3).some(p => Math.abs(p[1] - 135) > 0.5)) return 'los tres primeros puntos deben estar sobre z = 135 (largada y boxes)';
  }
  for (const k in CIRCUIT_NUM) if (d[k] != null && !(d[k] >= CIRCUIT_NUM[k][0] && d[k] <= CIRCUIT_NUM[k][1])) return k + ' fuera de rango ' + CIRCUIT_NUM[k].join('–');
  if (d.theme != null && !CIRCUIT_THEMES.includes(d.theme)) return 'theme desconocido';
  if (d.props != null && (!Array.isArray(d.props) || d.props.length > 600)) return 'props: lista de hasta 600 objetos';
  return null;
}
function applyCircuitFile(def, d) {
  const err = validCircuitFile(d);
  if (err) { console.warn('[circuits] ' + def.id + ' ignorado: ' + err); return false; }
  ['layout', 'halfWidth', 'theme', 'props', 'groundColor', 'skyColor', 'wetChance', 'tempBase', 'gripMod', 'brakingMod', 'aeroMod', 'overtakeDiff', 'treeCount', 'hills', 'foliageColor'].forEach(k => { if (d[k] != null) def[k] = d[k]; });
  def.external = true;
  return true;
}
// Modelo aislado de un circuito: todo lo que hace falta para rehacerlo (y lo que el juego pone alrededor y NO se puede pisar).
// Es el mismo formato que se carga desde circuits/<id>.json; los campos que empiezan con «_» son sólo referencia y se ignoran al cargar.
function circuitModel(def) {
  const T = window.THREE, layout = layoutForTrack(def), r1 = v => Math.round(v * 10) / 10;
  const out = {
    _formato: 'Circuito de la Serie Nacional GT3 · ver 07-carreras-apex/CIRCUITOS_PARA_IA.md. Los campos con «_» son referencia (se ignoran al cargar).',
    id: def.id, name: def.name, nation: def.nation, region: def.region, theme: def.theme || 'grass', halfWidth: def.halfWidth || 8.5,
    groundColor: def.groundColor, skyColor: def.skyColor, wetChance: def.wetChance, tempBase: def.tempBase, gripMod: def.gripMod, brakingMod: def.brakingMod, aeroMod: def.aeroMod, overtakeDiff: def.overtakeDiff,
    layout: layout.map(p => [p[0], p[1]]), props: def.props || [],
  };
  if (def.treeCount != null) out.treeCount = def.treeCount;
  if (def.hills != null) out.hills = def.hills;
  if (!T) return out;
  const curve = new T.CatmullRomCurve3(layout.map(([x, z]) => new T.Vector3(x, 0, z)), true, 'catmullrom', .35); curve.arcLengthDivisions = 5000;
  const L = curve.getLength(), hw = out.halfWidth;
  const at = (s, lane = 0) => { const u = (((s % L) + L) % L) / L, p = curve.getPointAt(u), t = curve.getTangentAt(u).normalize(); return [r1(p.x + t.z * lane), r1(p.z - t.x * lane)]; };
  const edge = (a, b, lane) => { const pts = []; for (let s = a; s <= b; s += 15) pts.push(at(s, lane)); return pts; };
  const center = [];
  for (let s = 0; s < L; s += 20) {
    const u = s / L, tg = curve.getTangentAt(u), t2 = curve.getTangentAt(Math.min(1, u + 20 / L)), ang = Math.atan2(tg.x * t2.z - tg.z * t2.x, tg.dot(t2));
    center.push({ s: Math.round(s), p: at(s), radius: Math.abs(ang) < 1e-3 ? null : Math.round(20 / Math.abs(ang)) });
  }
  out._referencia = {
    largoMetros: Math.round(L), largoKm: r1(L / 100) / 10, sentido: 'El punto 0 es la línea de largada; el auto avanza por el orden de los puntos (hacia +x en la recta principal).',
    largada: { s: 0, punto: at(0), tangente: [+curve.getTangentAt(0).x.toFixed(3), +curve.getTangentAt(0).z.toFixed(3)] },
    parrilla: 'Diez autos en dos columnas, desde s = −8 hacia atrás cada 9 m, a ±3,2 m del eje (ver engine.js buildCircuitWorld).',
    boxes: { carrilBoxes: { desdeS: 30, hastaS: 295, ladoInterior: at(30, 10), ladoExterior: at(30, 25), borde: edge(30, 295, 24.6).slice(0, 5), nota: 'Carril lateral de 15 m (lane +10 a +25) a la IZQUIERDA del sentido de marcha (en la recta principal, hacia z menores). +lane = izquierda, -lane = derecha.' }, edificio: { s: 170, lane: 36, largo: 175, ancho: 16, alto: 7 }, entradaEnBoxes: 'Se activa entre 32 m y 55 m de vuelta; el auto va al carril lane 20 y para en s = vuelta*largo + 155 + 6*id.', guardarrielBoxes: 'lane +40 hasta s = 305; el resto de la vuelta ±20.' },
    tribunasPorDefecto: [{ s: 115, lane: -33, length: 100 }, { s: Math.round(L - 65), lane: -34, length: 58 }, { s: 555, lane: -32, length: 52 }],
    carteles: [{ s: 125, lane: -31, text: def.name }, { s: 475, lane: -27 }, { s: 830, lane: 28 }, { s: 1100, lane: -28 }],
    eje: center,
  };
  return out;
}
function downloadCircuitJSON(def) {
  const model = circuitModel(def), blob = new Blob([JSON.stringify(model, null, 1)], { type: 'application/json' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = def.id + '.json'; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function downloadAllCircuitsJSON() {
  const all = {}; TRACKS.forEach(d => { const m = circuitModel(d); delete m._referencia; all[d.id] = m; });
  const blob = new Blob([JSON.stringify(all, null, 1)], { type: 'application/json' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'circuits.json'; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
window.circuitModel = circuitModel; window.downloadCircuitJSON = downloadCircuitJSON; window.downloadAllCircuitsJSON = downloadAllCircuitsJSON;
window.CIRCUITS_READY = (async () => {
  if (typeof fetch !== 'function') return 0;
  let n = 0; const fromBundle = new Set();
  try { // un solo archivo con todos los circuitos
    const r = await fetch('circuits/circuits.json', { cache: 'no-cache' });
    if (r.ok) { const all = await r.json(); TRACKS.forEach(def => { if (all && all[def.id] && applyCircuitFile(def, all[def.id])) { n++; fromBundle.add(def.id); } }); }
  } catch (e) { /* sin bundle */ }
  await Promise.all(TRACKS.map(async def => {
    try {
      const r = await fetch('circuits/' + def.id + '.json', { cache: 'no-cache' });
      if (!r.ok) return;
      const d = await r.json();
      if (fromBundle.has(def.id) && d && d._estado) return; // el placeholder no pisa al circuito real del bundle
      if (applyCircuitFile(def, d)) n++;
    } catch (e) { /* sin servidor o sin archivo: se usa el trazado interno */ }
  }));
  const T = window.THREE;
  if (T) TRACKS.forEach(def => { const c = new T.CatmullRomCurve3(layoutForTrack(def).map(([x, z]) => new T.Vector3(x, 0, z)), true, 'catmullrom', .35); c.arcLengthDivisions = 5000; def.lengthKm = c.getLength() / 1000; });
  return n;
})();
