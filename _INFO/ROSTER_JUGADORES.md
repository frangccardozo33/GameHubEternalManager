# Base de jugadores (roster) — cómo está armada y qué revisar

Todos los deportes usan ahora una **base fija** de jugadores/pilotos/peleadores (reales, celebridades y ficticios con retrato) en lugar de generar
caras y nombres al azar. Cuando falta gente en un puesto, el juego genera un jugador ficticio con **retrato gris** (`assets/players/placeholder.webp`)
y un apellido que no se repite.

## Dónde está cada cosa
| Deporte | Datos (generados) | Retratos | Generador |
|---|---|---|---|
| Fútbol (LFO) | `01-futbol/manager/tlm-roster.js` | `assets/players/football/` | `assets/roster/tools/build_football_roster.py` |
| Básquet (LBO) | `05-basquet-courtside/src/manager/roster-data.js` | `assets/players/basket/` | `build_basket_roster.py` |
| NFL (LGO) | `06-nfl-gridiron/src/manager/roster-data.js` | `assets/players/nfl/` | `build_nfl_roster.py` |
| MMA (LLO) | `04-mma/roster-llo.js` | `assets/players/mma/` | `build_mma_roster.py` |
| Carreras (LRO) | `07-carreras-apex/roster-lro.js` | `assets/players/racing/` | `build_racing_roster.py` |

Pipeline de imágenes: `tools/remove_green_floodfill.py` (fondo verde → PNG transparente, conserva camisetas verdes) → `tools/pack_*.py`
(recorte, WebP 640 px, estimación de piel/pelo con `tools/look_probe.py`) → `build_*_roster.py` (datos). Para regenerar, se corren en ese orden.
Las carpetas `*_alpha` y `football/greenbackrecortar_alpha` son la salida del recorte; los originales no se tocaron.

## Reglas que aplican los generadores
- **Reales por encima de ficticios**: los ficticios salen ~7-10 puntos por debajo del real medio; el 6 % puede ser bueno.
- **Apellidos únicos** en cada deporte (los reales no se renombran, por eso quedan algunos repetidos: González, Fernández, Johnson…).
- **Nacionalidad**: siempre una de las 21 naciones ficticias (`assets/nations`).
- **Fútbol**: reales con stats de FC 27 **proyectados +4 años** (constante `YEARS` del generador). Celebridades y streamers: 72-80 con perfil físico.
  Los 4 especiales (Vertis, Salamandro, Wolfdagan, Moskowitz) están en sus clubes con stats de crack. Continente Viejo: Kostanay y Tel Shava
  ~15-17 puntos por encima del mejor club local (reputación 98/97 vs 80; media de once titular ~96/95 vs ~80).
- **Guardados**: las carreras guardadas con la base anterior se descartan (`rosterV`), empiezan de cero.

## Para revisar (estimaciones mías)
- **Fútbol, identidad sin confirmar** (streamers/creadores de contenido; datos genéricos 72-76): Álvaro Campo, Benjamín Barreiro, Ignacio Rodríguez,
  Juan Ordóñez, Marcelo Morales, Ramiro Hernández, Rodriginho, Johnathan de Jesús, Gonzalo Corbalán, Facundo Herrera.
- **Fútbol, estrellas sin foto** (están en `fut_gg` pero no tienen imagen → retrato gris): João Neves, Saka, Kvaratskhelia, Olise, Wirtz, Cherki,
  Nuno Mendes, Pacho, Musiala, Doué, Saliba, Caicedo (juegan en Kostanay y Tel Shava).
- **Fútbol, no encontrados en FC 27** (stats por mi conocimiento): Agustín Giay, Facundo Colidio, Yuri Alberto, Ronaldo de Jesús.
- **MMA**: el CSV no trae división para 61 peleadores (asigné por conocimiento) ni nacionalidad para ninguno (deducida del apellido). Las 4 peleadoras
  se omitieron (no hay divisiones femeninas). Se ampliaron las divisiones a 8 (mosca, gallo, pluma, ligero, wélter, mediano, semipesado, pesado).
- **NFL**: no hay estadísticas de rendimiento; el nivel sale del orden de fama del CSV y de la posición. K/P faltantes se generan con foto gris.
- **Carreras**: ratings de los pilotos del TC por mi conocimiento; los del GT World Challenge Europe, N(80, 3.6). 32 de 60 tienen nacionalidad real
  (web oficial); el resto, deducida.
- Fotos de fútbol ficticio con logos/textos residuales de la generación (Nike, adidas, "Jack Walsh"): sólo se notan en la carta.
