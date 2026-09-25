# p1 — Fase 1 del match engine (fuente del bloque `<<P1_BEGIN/END>>`)

`p1.js` es la **fuente de verdad** del bloque que vive dentro de `fulbo.html` (mismo scope que la clase `wc`, entre `AI2_END` y
`TLB_ENGINE_BEGIN`). Se edita acá y se inyecta:

```bash
node p1/inject.mjs      # reemplaza el bloque entre // <<P1_BEGIN>> y // <<P1_END>> en fulbo.html
```

Los scripts de reemplazo puntual usados durante la reconstrucción se eliminaron; el bloque es la única pieza de código nueva del motor.

Contenido de `p1.js` (ver el encabezado del propio archivo y `REPORTE_FASE1.md`):

| Sección | Métodos |
|---|---|
| Movimiento | `p1Phys`, `p1ETA` |
| Balón (modelo temporal único) | `ballFlightStep`, `p1SimBall`, `p1LivePlan`, `p1KickVel` |
| PassPlan | `p1PlanPass`, `p1PassVariants`, `p1BestPassTo`, `passOption` |
| Receptor | `p1ReceiveTarget` |
| Defensa / duelo | `p1CarrierRead`, `p1TimeToContact`, `p1DefendCarrier`, `p1ShotLaneBlock`, `p1DuelReach`, `p1DuelEval`, `p1DefenderCommit`, `p1DuelBonus` |
| Amenaza | `p1ThreatMap` |
| Ataque sin balón | `p1PosExtras` |
| Ritmo | `p1Pace` |
| Telemetría | `p1Log`, `p1LogDecision`, `p1LogPass`, `p1DebugPlayer`, `p1Count` (`match.p1.log`, `match.p1.cnt`) |

Herramientas: `bench/` (audit_movement, baseline, summary, before_after, real/*) y `manager/tests/micro.test.mjs`.
