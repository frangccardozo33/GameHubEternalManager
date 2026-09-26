# Rehacer los recintos: pabellón de básquet, ring de MMA y estadio de la NFL

Tres encargos de **código 3D** (three.js) para una IA con acceso al repo (Claude Opus 5.5 en la nube). Cada uno reemplaza el escenario actual, que hoy es
geometría simple (cajas, cilindros y una multitud de cubos instanciados), por un recinto con aspecto de transmisión de TV.

## Contexto común (pegar antes de cada prompt)
«Trabajás en el repo `GameHubEternalManager`: un hub con módulos de deporte hechos en three.js (v0.180). No tocás la simulación ni las reglas: sólo la
escena 3D y sus materiales. Reglas del proyecto:
1. **Todo procedural o con imágenes propias** dentro del repo (nada de assets con derechos: nada de logos reales ni escudos reales; usar los logos ficticios de `assets/logos/`).
2. **Rendimiento**: mínimo 50 fps en un portátil sin GPU dedicada. Multitud con `InstancedMesh`, texturas de hasta 2048², sombras sólo de la luz principal, sin más de ~250 draw calls.
3. **Accesibilidad de la cámara**: el juego tiene cámaras Broadcast / Wide / Close (y las nuevas Orbital, Dron libre y TV dinámica de `assets/common/em-common.js → EM.cams`). Cualquier posición de cámara tiene que verse bien: nada de "traseras" vacías, techos que tapen, ni aristas feas.
4. **Publicidad**: las vallas LED y los carteles deben usar `EM.sponsorLogo(id, nombre, tamaño)` (SVG) o una textura de canvas con los sponsors ficticios de `assets/common/em-common.js` (lista `CAT`), rotando. Nunca marcas reales.
5. **Iluminación**: 3 modos por partido (día/tarde/noche o luces de pabellón apagadas/encendidas); un `setTimeOfDay(k)` opcional en la clase de escena.
6. **Entrega**: cambios sólo en los archivos indicados, sin romper `npm test`, y recompilando el módulo (comandos al final de cada prompt). Dejá una captura de cada cámara en `_INFO/capturas/`.»

---

## 1) Pabellón de básquet — LBO

Archivos: `05-basquet-courtside/src/presentation/arena.js` (clase `Arena`: `buildCourt`, `buildHoops`, `buildStands`, `buildBenches`, `buildLighting`, `update`) y, si hace falta, `players.js` (sólo para banquillos).
Medidas del motor (no cambiar): cancha 28 × 15 m, x = largo, z = ancho, aros en x = ±12,425 m, altura del aro 3,05 m.

**PROMPT**
«Reescribí `Arena` para que parezca un pabellón profesional de TV:
- **Parquet** con veta de madera procedural (canvas 2048×1024), pintura de la zona en el color del local, círculo central con el logo de la liga (`assets/logos/lbo.png`), líneas reglamentarias FIBA (triple 6,75 m), sombra y reflejo suave del parquet (roughness 0,35 + un envMap barato).
- **Tableros y aros**: tablero de vidrio con marco, soporte de piso con acolchado, aro con red animada (deformación breve al entrar la pelota; hoy `update(sim)` recibe el estado), luces LED del tablero al anotar.
- **Gradas** en dos niveles con palcos, pasillos y escaleras, multitud instanciada (>3.000 espectadores) con 4 variantes de color, saltan al anotar el local (usar `sim` o un evento; dejar un método `cheer(team)`), **sin** cubos: usar planos billboard con textura de atlas de siluetas.
- **Anillo LED perimetral** a nivel de cancha con anuncios rotativos (sponsors ficticios) y un **videomarcador colgante** (cubo con 4 pantallas de canvas que muestran marcador, reloj y repeticiones de texto).
- **Banquillos** de ambos equipos con sillas, toallas, botellas, cuerpo técnico (siluetas), y mesa de anotadores con cronometrador.
- **Iluminación**: focos cenitales (SpotLight con cono visible) + luces de ambiente; modo "show" (apagón parcial) para la presentación de equipos.
- Cámaras de TV: hueco/postes de cámara fija en el borde, carriles de cámara.
Devolvé la clase con la misma API pública (`buildX`, `update`) y agregá `cheer(team)`, `setLights(mode)`. Verificá con `npm run build` + `PYTHONUTF8=1 python inline.py courtside-single.html` y abrí `05-basquet-courtside/courtside-single.html`.»

**Cómo verificar**: partido de exhibición, cámaras Broadcast / Close / Wide / Orbital / TV; aros con red; público que reacciona; 50 fps.

---

## 2) Ring / octágono de MMA — LLO

Archivo: `04-mma/assets/app.js` (JavaScript ya compilado a mano; función `Wm(i)` = arena, clase `Ym` = controlador de cámara, constructor de la vista cerca de la línea 25600).
El octágono mide ~9 m de diámetro; los peleadores se mueven dentro de un radio ≈ 4,3 m (no cambiar).

**PROMPT**
«Reemplazá la función `Wm` (arena) para construir un **octágono de MMA de evento grande**:
- Lona con logo central de la liga (`assets/logos/llo.png`) y publicidad en los cuatro cuadrantes (sponsors ficticios), marcas de sangre/sudor **acumulables** (decals que se oscurecen con el daño: método `addMark(x, z)`).
- Reja metálica de 8 paños con postes acolchados, puerta, y **cámaras robóticas** pegadas a la reja. Base elevada del octágono con faldón y escaleras.
- **Sala**: tribuna en anillo, multitud instanciada con siluetas, palcos, **pantalla gigante** colgante (canvas: peleadores, marcador de golpes, reloj del round) y focos de luz volumétricos (conos con `additive blending` suave).
- Esquinas roja y azul con taburete, balde, toallas, y los dos "cornermen" (siluetas).
- Iluminación dramática: luces sobre el octágono, penumbra afuera, humo (partículas) durante la presentación.
Mantené la firma `Wm(scene)` y devolvé el mismo objeto que hoy (leer el código actual antes). Agregá el método `pulseCrowd(intensity)` y llamalo desde los eventos de knockdown / KO (ver `llocast` en el mismo archivo).»

**Cómo verificar**: abrir `04-mma/index.html` desde el hub, iniciar un combate; cámaras Broadcast/Orbital/TV; 50 fps; la reja no tapa a los peleadores.

---

## 3) Estadio de la NFL — LGO

Archivos: `06-nfl-gridiron/src/view/scene.js` (método `buildStadium`, multitud instanciada, postes; texturas de campo en `textureCanvas`).
Medidas: campo 53,3 × 120 yardas (incluye zonas de anotación), z = largo. Los postes están en z = 0 y z = 120 (respetar).

**PROMPT**
«Reescribí `buildStadium` para lograr un **estadio moderno cerrado o abierto**:
- **Césped** con franjas de corte alternadas, número de yardas y hash marks nítidos, zonas de anotación con arte del equipo local (logo en el centro, texto EN LOS DOS EXTREMOS con el nombre del equipo, colores primarios), línea de scrimmage/first down como **líneas 3D virtuales** (`updateLines(los, firstDown)`), sombra suave de las tribunas sobre el césped.
- **Tribunas** en 3 niveles, palcos con vidrio, techo parcial con cerchas, luminarias (torres de focos con brillo), túnel de jugadores, banquillos y zona técnica con siluetas de staff.
- **Multitud** de miles con `InstancedMesh` (o billboards con atlas), con **ola** y reacción (`cheer(team)`).
- **Videomarcadores** en los dos extremos y un anillo LED alrededor del campo con sponsors ficticios rotativos.
- **Postes** con base acolchada, banderines de esquina, cámaras aéreas (Skycam: cable visible sobre el campo).
- Ambiente: 3 horarios (día/atardecer/noche) con luz, niebla y color de cielo distintos.
Mantené la API pública de `Scene`/`View` (constructor, `update(snapshot, dt, started)`, `resize`). Recompilá con `npx vite build --config vite.single.config.js` y probá `06-nfl-gridiron/dist-single/index.html`.»

**Cómo verificar**: partido de exhibición desde el hub, cámaras Broadcast/Wide/Close/Orbital/TV; postes y líneas correctas; 50 fps.
