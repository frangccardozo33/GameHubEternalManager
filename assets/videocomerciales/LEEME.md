# Videos comerciales de la transmisión

Los `.mp4` de esta carpeta salen como **pausas publicitarias** en las transmisiones:

| Dónde | Cuándo |
|---|---|
| Fútbol (`01-futbol/fulbo.html`) | en la previa (entre el estudio y las alineaciones) y en el descanso (después del estudio). También en el descanso de la prórroga. |
| Básquet (LBO) y NFL (LGO) | en el descanso / medio tiempo (después del estudio, vía `assets/broadcast/broadcast.js`). |

Cada tanda dura **como máximo 60 s**: un comercial largo o dos cortos (`assets/broadcast/adbreak.js`). Se elige al azar evitando repetir los últimos 12.
Aparece «PUBLICIDAD», la cuenta «volvemos en…» y un botón SALTAR a los 5 s. El sonido sigue el botón de mute del juego.

**Agregar o quitar un video:** copiarlo en esta carpeta y sumarlo a `manifest.js` (`{ f: "archivo.mp4", d: duración_en_segundos }`). Los de más de 60 s no se usan.
**Apagar los anuncios:** en el fútbol, botón 📺 → «Anuncios en los descansos: OFF»; en cualquier módulo, `localStorage.setItem('lfo.ads', 'off')`.
