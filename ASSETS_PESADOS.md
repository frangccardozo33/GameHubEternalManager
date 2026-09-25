# Assets pesados que NO están en el repo

El repo sólo lleva código, datos livianos y documentación. Estas carpetas pesan varios GB y se quedan en la PC original;
sin ellas el juego carga pero le faltan imágenes/modelos. Para usar el proyecto completo hay que copiarlas a mano en la misma ruta.

| Carpeta | Tamaño aprox. |
|---|---|
| `assets/roster/` | 2,6 GB |
| `01-futbol/roster/` | 2,2 GB |
| `assets/carengines/` | 755 MB |

Si una IA (o alguien) edita código desde este repo sin esas carpetas, no puede probar el juego completo: los cambios de código sí se pueden
revisar, y la verificación visual se hace después en la PC que tiene los assets.
