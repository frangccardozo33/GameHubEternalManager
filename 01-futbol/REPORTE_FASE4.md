# REPORTE FASE 4 — Cartas rotas del álbum + física del balón

## 1. Cartas rotas
Causa: `cardlook.js` (peinados y barbas de los cromos y de los jugadores) usaba `Float32BufferAttribute`, `CatmullRomCurve3` y
`TubeGeometry`, que el bundle reducido de three.js de `fulbo.html` no exporta. La primera carta sin pelo largo salía bien; al
llegar a una que lo usaba, el dibujado fallaba y el bucle secuencial de `renderGallery` dejaba en blanco el resto.
Arreglo: `Float32BufferAttribute` agregado al namespace `T3`, y `lock()` (mechones) reescrito con su propio barrido
(Catmull-Rom + transporte paralelo, misma topología: 13 anillos × 6 vértices, mismo afinado). Verificado en el navegador: las 12 cartas se dibujan, sin errores.

## 2. Física del balón (`p1/p1.js`, única fuente: `ballFlightStep`)
Datos usados: balón FIFA 0.43 kg, r = 0.11 m; Cd ≈ 0.47 subcrítico → ≈ 0.22 sobre 25 m/s (Goff/Carré y Asai; arXiv 1710.02784:
Cd 0.15–0.55 según velocidad); restitución 0.64–0.68 en balones reglamentarios. Resistencia de rodadura en césped: ≈ 0.75 m/s²
(valor de ingeniería estimado, no pude leer las tablas de ISSS/DIN 18035-7: los PDF no eran legibles).
| | Antes | Ahora |
|---|---|---|
| Aire | arrastre lineal 0.065/s (≈1.6 m/s² a 25 m/s) | cuadrático, ≈ 7–8 m/s² a 25 m/s |
| Rodando | 0.27·v (cola infinita: 91 m hasta parar desde 25 m/s; 10 s desde 5 m/s) | 0.75 + aire: 71 m; 5 s y 12 m desde 5 m/s |
| Pique | e = 0.49 | e = 0.65 y el pique frena 14 % la velocidad horizontal |
| Pique desde 2 m | 0.44 m | 0.78 m |
| Tiro aéreo 30 m/s, 1 s después | 26.8 m/s | ≈ 21–23 m/s |
Sincronizados con la misma ecuación: `p1KickVel` (pase rasante resuelto hacia atrás con la velocidad de llegada; el globo itera 5 veces),
`p3BallAt`, `tlBallLanding` (fulbo.html y tlb/referee.js). Los planes de pase coinciden con el balón real (T plan 0.79 s vs real 0.79 s a 10 m).
## 3. Efecto en el partido (3 seeds × 15 min, contra Metrica)
Pases completados 70.3 % → 64.1 % (real 76.7 %), intercepciones 52 → 64/10 min (real 23): con menos "cola" el balón llega antes a un rival y los tiros
llegan más flojos al arco. Es una consecuencia directa de la física realista y **empeora dos métricas de decisión ya lejanas al real**;
el siguiente paso es que el cerebro de pase elija menos pases largos (19.4 m vs 13.2 m real).
Tests: se ajustaron 2 con justificación (BallPlan: tolerancia 0.15→0.25 m porque el pique con pérdida horizontal depende del instante discreto del bote; p3-K: la velocidad de barrida se mide como mínimo durante la barrida, no a 1 s cuando el jugador ya se levantó). Todas las suites en verde.
