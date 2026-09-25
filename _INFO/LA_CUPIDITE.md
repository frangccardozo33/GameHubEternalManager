# La Cupidité — cómo está configurada

Torneo de copa del modo carrera de fútbol. Se juega **dentro** de la temporada de la LFO, entre semana, y lo disputan clubes de la liga y clubes de otro continente.
Toda la lógica está en `01-futbol/manager/tlm-cup.js` (motor, sin DOM); la pantalla es la pestaña **COMPETICIONES** (`tlm-ui-cup.js`).

## Participantes: 16 clubes
| Cupo | Cuántos | Cómo entran |
|---|---|---|
| **Liga LFO** | 8 | Los 8 primeros de la tabla en la **jornada de corte** (40 % de la liga: la J14 con 34 jornadas). Antes del corte son clasificados *provisorios* y cambian con cada fecha. |
| **Continente Viejo** | 8 | Los 9 clubes invitados (ver abajo): los 7 mejor rankeados por reputación entran directo; los 2 últimos juegan una **Ronda previa** y el ganador ocupa el octavo lugar. |

Tu club entra **solo si se lo gana** (top 8 al corte); antes del primer partido de liga el pronóstico sale de la reputación de los clubes.

## Clubes invitados (Continente Viejo)
No juegan la liga LFO ni tienen mercado: son equipos de otros países que solo participan en La Cupidité (como una Champions o una Libertadores).
Se crean solos al abrir una carrera (nueva o vieja), con plantilla propia, nación y nombres de su región. Datos en `tlm-data.js` (`GUEST_CLUBS`); escudos en `equiposfut/continente2/`.

| Club | Nación | Rep. |
|---|---|---|
| Red Gull Club Tellin | Estovackia | 78 |
| Maccabi Tel Shava | Netanya | 74 |
| Sporting Lake Baikal | Baikal | 72 |
| Sporty VV Klub Estovackia | Estovackia | 70 |
| Sporty VV Klub Kostanay | Kostanay | 68 |
| Groz Sport Kulübü | Baikal | 66 |
| Klaipeda United | Kostanay | 61 |
| Inter Focuri | Overmark | 58 |
| ØRK FC | Overmark | 55 |

Son **9** clubes (había 9 escudos en `continente2`). Las naciones (banderas en `assets/nations/`): Baikal (análogo Rusia), Estovackia (Estonia/Eslovaquia), Kostanay (Kazajistán), Netanya (Israel), Overmark (Noruega).
La asignación de club → nación de los que no tenían bandera propia (Groz, Klaipeda, Inter Focuri, Tellin) es mía: se cambia en `GUEST_CLUBS`.

## Cuadro y fechas (con la liga actual de 17 clubes y 34 jornadas)
| Etapa | Cuándo | Partidos |
|---|---|---|
| Clasificación | se cierra tras la **J14** | — |
| Ronda previa | miércoles después de la J16 | 1 |
| Octavos de final | después de la J18 | 8 |
| Cuartos de final | después de la J23 | 4 |
| Semifinales | después de la J27 | 2 |
| Final | después de la J32 | 1 |

Las jornadas salen de porcentajes de la liga (`slots` y `cut` en `tlm-cup.js`), así que se ajustan solas si cambia la cantidad de clubes.

## Eliminación
Partido único, sin revancha. **Empate a los 90′ → prórroga (2 × 15′) → tanda de penales**, todo jugado en 3D en el partido del usuario (`tieBreak` del motor); en los partidos que simula el manager el empate se define con una tanda simulada. La prórroga y la tanda también se pueden probar a mano en el Laboratorio del Centro de partidos.
La siembra es por reputación: el mejor sembrado enfrenta al ganador de la previa (1-16, 8-9, 4-13, 5-12…). Local: el mejor sembrado.

## Premios (por ronda superada)
Ronda previa 0,6 M · Octavos 1,5 M · Cuartos 2,5 M · Semifinales 4 M · Final (campeón) 8 M · Subcampeón 3 M. El campeón suma +1,5 de reputación.

## Qué muestra la pestaña COMPETICIONES
- **Tarjeta de la Liga LFO** (estilo azul/oro de la liga): candidato al título (el líder; antes de empezar, el favorito por plantilla), ventaja sobre el segundo, jornadas que faltan, si el título ya está asegurado y tu posición.
- **Tarjeta de La Cupidité** (estilo esmeralda de la copa), según la fase:
  - *Clasificación abierta*: cuántas jornadas faltan para el corte y para el inicio, fecha de inicio y si tu club entraría hoy.
  - *En juego*: próxima ronda, fecha, jornadas que faltan y si seguís en carrera.
  - *Finalizada*: campeón y subcampeón.
- **Detalle de la Cupidité**: clasificados por el momento (liga + invitados con su bandera), el cuadro de llaves (con ronda previa), tu camino, participantes, premios, reglas y campeones anteriores.
- **Detalle de la Liga**: tabla completa con la marca «CUPIDITÉ» en los clasificados y accesos a goleadores, historial y calendario.
- El **Calendario** del manager marca en verde las jornadas antes de las cuales se intercala una fecha de la copa.

## Partidas anteriores
Una copa guardada con el formato viejo (16 clubes de la liga, sin previa) se termina con el formato viejo; la próxima temporada arranca con el nuevo. Los invitados se crean al cargar.
