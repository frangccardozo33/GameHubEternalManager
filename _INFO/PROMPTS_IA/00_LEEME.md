# Prompts para IAs — qué hace falta y cómo pedirlo

Cada archivo de esta carpeta es un **encargo listo para copiar y pegar** a una IA (de imagen, de código o de texto). Todos están escritos
para que la IA no tenga que conocer el proyecto: dicen qué archivo entrega, con qué nombre, tamaño y formato, y qué NO tiene que tocar.

| Carpeta / archivo | Qué pide | Tipo de IA |
|---|---|---|
| `01_cupidite_graficas.md` | Las 17 imágenes de la transmisión de La Cupidité (con el logo en alta resolución) + set 3D del estudio, ceremonia del trofeo | imagen (+ código para 3D) |
| `02_circuitos_PROMPT_UNICO.md` | Los 20 circuitos de carreras en UN solo prompt (reglas técnicas, fichas con lore nuevo y los países del Continente Viejo, formato de entrega en un solo JSON) | código/geometría (JSON) |
| `03_tribuna_cartas.md` | Retratos, 24 marcos de edición y escudos de las cartas de LBO, LGO, LRO y LLO | imagen |
| `04_transmision_estudio.md` | Presentadores/estudio, intros y placas de TV de LBO, LGO, LRO y LLO | imagen / diseño |
| `05_nombres_mundo.md` | Equipos y jugadores de LBO/LGO en el mundo ficticio, apodos de LLO | texto |
| `06_audio.md` | Cánticos, ambientes, stingers de estudio y de copa para los deportes que no tienen audio real | audio |

## Cómo usarlos
1. Abrí el archivo, copiá el bloque que está bajo **«PROMPT»** (los bloques de código) y pegalo tal cual.
2. Si la IA pide contexto, pasale también el «Contexto común» que está arriba de cada archivo.
3. Guardá lo que entregue **con el nombre exacto** que indica el prompt; el juego lo toma solo (no hay que tocar código, salvo donde se aclare).
4. Para verificar, cada archivo termina con «Cómo verificar».

Los documentos técnicos completos que respaldan estos prompts siguen en su lugar:
`01-futbol/lfoskin/CUPIDITE_PLACEHOLDERS.md`, `07-carreras-apex/CIRCUITOS_PARA_IA.md`, `assets/tribuna/TRIBUNA_PARA_IA.md`, `assets/broadcast/BROADCAST_PARA_IA.md`.
