# Nombres del mundo ficticio (texto) — prompts

Contexto común: el mundo del juego tiene 16 naciones ficticias (ver `assets/nations/nations.js`; ficha con escudo en `assets/nations/*.jpg`): Peronia, Valurria, Kaigam, Costas Unidas, Morvicia, Magayanes, Sahar, Skote,
Grammes, Riada, Iberia, Zenet, Sotoa, Tamago, Melonia y Margin. Idioma de los nombres: español rioplatense con influencias de cada nación. Nada de nombres reales (ni equipos, ni ciudades, ni personas famosas).

## A · Equipos de LBO (básquet) y LGO (NFL)
Hoy usan nombres en inglés compartidos entre deportes («Metro Foxes», «Harbor Kings», «Austin Outlaws»…). Hay que definir una lista por deporte (los archivos están en
`05-basquet-courtside/src/` y `06-nfl-gridiron/src/`, buscar la lista de equipos en `manager/` o `data/`).
```
Generá 30 equipos de básquet (LBO) y 32 de fútbol americano (LGO) para un mundo ficticio de habla hispana. Cada equipo: nombre completo (ciudad + apodo), sigla de 3 letras única,
nación de las 16 listadas, color primario y secundario (#rrggbb, que se distingan entre sí), y una línea de historia (máximo 20 palabras). Que no se repitan nombres entre los dos deportes.
Entregá una tabla JSON con los campos: id, name, short, nation, primary, secondary, lore.
```

## B · Jugadores de LBO y LGO
```
Generá listas de 600 nombres de jugador (nombre y apellido) para básquet y 900 para fútbol americano, con la nación de origen de cada uno según su estilo lingüístico
(p. ej. Peronia = rioplatense, Kaigam = influencia nórdica...). Sin nombres de personas reales. Formato: un JSON con { nation: [ {first, last}, ... ] }.
```

## C · Apodos de peleadores de LLO
Hoy están en inglés/portugués. Archivo: `04-mma/assets/app.js` (buscar los peleadores base).
```
Generá 3 apodos por cada peleador de LLO (adjuntá la lista con nombre, nación, estilo de pelea y división). El apodo debe reflejar el estilo (striker, grappler, etc.) y la
nación de origen, en español, máximo 2 palabras, sin repetir. Formato: JSON { fighterId: [apodo1, apodo2, apodo3] }.
```

## D · Nombres de copas
Ya hay: La Cupidité (fútbol), Copa LGO, Copa LBO. Si querés nombres de marca propios:
```
Proponé 10 nombres de copa de eliminatoria para básquet y 10 para fútbol americano en el mundo ficticio descrito, con lema corto en latín o español, y paleta de 2 colores para cada uno.
```


## E · Continente Viejo (naciones nuevas y clubes invitados de La Cupidité)
Cinco naciones nuevas (`assets/nations/`): Baikal (análogo Rusia), Estovackia (Estonia/Eslovaquia), Kostanay (Kazajistán), Netanya (Israel), Overmark (Noruega); y 9 clubes invitados (`01-futbol/manager/tlm-data.js`, `GUEST_CLUBS`).
Los jugadores de fútbol de esos clubes ya tienen nombres de su región (`NAMES_VIEJO`), pero son listas cortas de 10-12 nombres. Para ampliarlas:
```
Para cada una de estas 5 naciones ficticias del «Continente Viejo» (Baikal, Estovackia, Kostanay, Netanya, Overmark) generá 60 nombres de pila y 60 apellidos plausibles de fútbol profesional,
inspirados en su análogo cultural pero sin personas reales conocidas (evitá combinaciones de futbolistas famosos). Formato JSON: { "baikal": { "first": [...], "last": [...] }, ... }.
Se pegan en NAMES_VIEJO de 01-futbol/manager/tlm-data.js.
```
```
Para los 9 clubes invitados de La Cupidité escribí una línea de historia (máximo 25 palabras) y un apodo de hinchada, sin usar nombres de clubes reales. Devolvé JSON { "Nombre del club": { "historia": "", "apodo": "" } }.
```
