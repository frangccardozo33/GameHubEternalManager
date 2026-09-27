# Online — liga compartida en vivo (Eternal Manager)

Servidor: **Cloudflare Workers + Durable Objects (una liga = un DO) + D1 (cuentas)**, en `server/`. Front: el hub (`hub.html` + `online.js`).
Cuentas propias (usuario + contraseña, PBKDF2), sesión por cookie firmada. Menos de 20 jugadores por liga, **un DT humano por club**, una sola temporada.

## Cómo probarlo en local
```bash
cd server && npm install && npx wrangler dev --port 8787        # servidor (usa .dev.vars y una D1 local)
python -m http.server 8080                                       # en la raíz del repo; abrir http://localhost:8080/hub.html
```
Hub → **Online** → registrarse → crear liga (módulo, primer partido, cada cuántos minutos) → elegir club → **Gestionar club** / **Ver / Dirigir**.

## Qué hace cada pieza
- **Centro de partidos** (`online.js`): tarjetas de programados, en vivo y terminados, tabla y resultados. La transmisión se abre 5 min antes; cualquiera mira; los DT de ambos equipos dan órdenes en vivo. Si un DT no está, juega la IA. Los DT pueden entrar y salir cuantas veces quieran.
- **Partidos en vivo**: el servidor los corre por reloj real. Fútbol, básquet, MMA y carreras usan *lockstep* (mismo motor determinista en servidor y navegadores; solo viajan las órdenes y un checkpoint cada 5 s; si un cliente se desvía, el servidor le manda una foto completa del estado). NFL transmite cuadros desde el servidor. Presentación, estudio y anuncios son los de siempre (sin botones de saltar); descansos/mitad de carrera se "congelan" con el mismo reloj para todos.
- **Gestión del club** (antes del partido, todo lo del modo carrera): el cliente trabaja sobre una copia del estado y manda órdenes; el servidor las valida y las aplica (`/api/league/:id/career`, `/cmd`, `/rev`).
  - Fútbol (`01-futbol/online/manager-online.js`, `server/src/futbol-manage.js`): plantel, once, formación, reglas y plan de juego, mercado (con otros DT: ofertas, contraofertas), copa La Cupidité.
  - Básquet (`05.../src/online/manager.js`, `basquet-manage.js`): rotación, tácticas, mercado, traspasos con la IA o propuestas entre DT, copa, playoffs y **draft con reloj** (90 s por pick de cada DT; después elige la IA).
  - NFL (`06.../src/online/manager.js`, `nfl-manage.js`): gameplan, depth chart, entrenamiento, mercado, traspasos, copa y **draft con reloj**.
  - MMA (`04-mma/mma-manager.html`, `mma-manage.js`): liga de 8 cuadras (cada DT una, 4 peleadores), táctica por peleador, campamento, mercado, traspasos.
  - Carreras (`07-carreras-apex/lro-manager.html`, `race-manage.js`): estrategia de salida (neumático, parada, ritmo…), pilotos, mercado de pilotos, traspasos.
  - El once/plan/estrategia se cierra cuando se abre la transmisión (5 min antes); después solo valen los controles en vivo.

## Regenerar lo generado
| Qué | Comando |
|---|---|
| Núcleo y motor de fútbol para el servidor | `node server/tools/build-football.mjs` |
| Simulador de MMA / motor de carreras para el servidor | `node server/tools/build-mma.mjs` · `node server/tools/build-race.mjs` |
| Transmisión de fútbol / MMA / carreras | `python -X utf8 01-futbol/gen-live.py` · `04-mma/gen-live.py` · `07-carreras-apex/gen-live.py` |
| Transmisión y gestión de básquet | `cd 05-basquet-courtside && python gen-live.py && npx vite build -c vite.live.config.js && python -X utf8 inline.py courtside-live.html dist-live` · `python gen-mgr.py && npx vite build -c vite.mgr.config.js && python -X utf8 inline.py courtside-manager.html dist-mgr mgr.html` |
| Transmisión y gestión de NFL | `cd 06-nfl-gridiron && python gen-live.py && npx vite build -c vite.live.config.js` · `python gen-mgr.py && npx vite build -c vite.mgr.config.js` |
| Hacer al núcleo de NFL consciente de varios DT | `python server/tools/patch-nfl-humans.py` (ya aplicado) |

## Pruebas (Node, sin navegador)
`node server/tools/football-manage-check.mjs` · `basquet-manage-check.mjs` · `nfl-manage-check.mjs` · `mma-league-check.mjs` · `race-manage-check.mjs` · `race-league-check.mjs` · `snap-check.mjs`. Cada una opera con dos DT humanos, prueba las validaciones (jugador ajeno, plan cerrado, propuestas propias…) y juega la liga completa.

## Pendiente
Despliegue en Cloudflare (D1 real, `SESSION_SECRET`, `APP_ORIGIN`, URL del Worker en el front), medir CPU del plan gratuito, anti-trampa con pruebas de ataque, límites de ligas por usuario y respaldo de la base.
