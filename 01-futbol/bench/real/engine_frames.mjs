// Muestrea un partido del motor al mismo formato de frames que el tracking real (10 FPS por defecto).
import { Engine } from "../harness.mjs";
export function engineFrames(seed, { seconds = 900, fps = 10, setup } = {}) {
  const m = new Engine(seed);
  setup && setup(m);
  m.start();
  const frames = [], every = Math.round(60 / fps);
  let n = 0;
  while (!m.ended && n < seconds * 60) {
    m.step(1 / 60);
    n++;
    if (n % every === 0 && m.phase === "playing") {
      const side = (tm) => m.players.filter((p) => p.team === tm && !p.sentOff).map((p) => ({ id: "P" + p.id, x: p.x, z: p.z }));
      frames.push({ t: n / 60, home: side(0), away: side(1), ball: { x: m.ball.x, z: m.ball.z } });
    }
  }
  return { frames, match: m };
}
