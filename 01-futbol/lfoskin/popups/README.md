# Anunciantes de los pop-ups

> **Estado:** los cinco logos ya existen en `sponsors/` (marca + nombre, 400×300, transparente). Se pueden reemplazar con el mismo nombre.

Los banners de anunciante que salen durante el partido (`lfoskin/lfo-popups.js`, tipo `sponsor`) usan **marcas ficticias** y un
logo provisional (la inicial sobre el color de la marca). Para poner el logo real de cada una, guardar un PNG con fondo transparente
(recomendado 400×300, logo blanco o a todo color, centrado) con **el mismo id** en `lfoskin/popups/sponsors/`:

| Archivo | Marca | Eslogan | Se ve en |
|---|---|---|---|
| `sponsors/lfoplay.png` | LFO PLAY | TODA LA LIGA, EN VIVO | liga |
| `sponsors/bancoeterno.png` | BANCO ETERNO | TU CLUB, TU CUENTA | liga |
| `sponsors/aerovia.png` | AEROVÍA | VOLÁ A LA PRÓXIMA FECHA | liga |
| `sponsors/arena.png` | ISOTÓNICA ARENA | ENERGÍA HASTA EL FINAL | liga |
| `sponsors/diamantepay.png` | DIAMANTE PAY | PAGÁ COMO UN CAMPEÓN | La Cupidité |

Si el archivo no existe la imagen se descarta sola y queda la inicial. Para agregar una marca nueva: sumarla a `SPONSORS` en
`lfoskin/lfo-popups.js` (id, nombre, eslogan, subtítulo, color; `cup: true` si es sólo de La Cupidité).
