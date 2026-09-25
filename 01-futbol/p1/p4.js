// ============================================================================================
// FASE 4 — CUERPOS SÓLIDOS: el balón rebota contra los jugadores  (fuente: p1/p4.js, inyectado junto a p1.js y p3.js)
//
// Antes un balón rápido que "no era controlado" atravesaba al jugador (sólo había un radio de contacto con probabilidad).
// Ahora cada jugador de campo es una cápsula vertical (torso r 0.26 m, de los pies a la cabeza; caído/barriéndose: bulto bajo y largo).
// Se hace una prueba BARRIDA (del punto anterior al actual del balón) para que a 30 m/s no haya túnel, y el rebote sale de la física:
//   v' = v_cuerpo + (v_rel − (1+e)·(v_rel·n)·n), con fricción tangencial. e depende de quién es:
//     · compañero/receptor previsto (amortigua: el pase "muere" en el pie/pecho)  e 0.12
//     · rival                                                                      e 0.42
//   El último toque pasa a ser el del jugador (reglamento) y un tiro desviado por un rival cuenta como bloqueo.
// El portero queda fuera (su contacto lo resuelve p3GkContact). Determinista: no usa aleatoriedad.
// ============================================================================================
const P4_BODY_R = 0.26, P4_BALL_R = 0.11;
Object.assign(wc.prototype, {
  // cápsula del jugador: segmento vertical [y0,y1] en (x,z) y radio; caído o barriéndose → bulto bajo y más ancho
  p4Body(p) {
    if (p.ragdoll || p.state === "Slide") return { y0: 0.2, y1: 0.35, r: 0.4 };
    const h = p.heightM || 1.8;
    return { y0: 0.12, y1: Math.max(0.6, h - 0.16), r: P4_BODY_R };
  },
  p4BodyCollide(dt) {
    const b = this.ball, sp = Math.hypot(b.vx, b.vz, b.vy);
    if (sp < 0.6 || b.y > 2.4) return false;
    // Si un arquero ya se comprometió a salir a buscar el centro (claim/punch, ver p3GkCrossRead) el
    // balón es SUYO a disputar — antes un cuerpo cualquiera parado en el área lo desviaba antes de que
    // llegara, y el arquero nunca llegaba a agarrar/despejar nada (0 claims/punches en la práctica).
    const claiming = this.players.find((p) => p.role === "GK" && p.gkAct && (p.gkAct.kind === "claim" || p.gkAct.kind === "punch") && !p.gkAct.done);
    if (claiming) return false;
    // posición anterior aproximada (el integrador ya avanzó un paso)
    const px = b.x - b.vx * dt, pz = b.z - b.vz * dt, py = b.y - b.vy * dt;
    const sx = b.x - px, sz = b.z - pz, sy = b.y - py, sl = sx * sx + sz * sz;
    let best = null;
    for (const p of this.players) {
      if (p.sentOff || p.role === "GK" || this.owner === p) continue;
      if (p === this.lastTouch && this.elapsed - this.kickedAt < 0.3) continue;
      if (this.elapsed - (p.p4At || -9) < 0.12) continue;
      // punto de máximo acercamiento (en planta) sobre el recorrido del balón en este paso
      let u = sl > 1e-9 ? ((p.x - px) * sx + (p.z - pz) * sz) / sl : 1;
      u = u < 0 ? 0 : u > 1 ? 1 : u;
      const cx = px + sx * u, cz = pz + sz * u, cy = py + sy * u;
      if (Math.abs(cx - p.x) > 0.9 || Math.abs(cz - p.z) > 0.9) continue;
      const B = this.p4Body(p), qy = cy < B.y0 ? B.y0 : cy > B.y1 ? B.y1 : cy;
      let nx = cx - p.x, ny = cy - qy, nz = cz - p.z;
      const d = Math.hypot(nx, ny, nz);
      if (d >= B.r + P4_BALL_R) continue;
      if (d < 1e-6) { nx = -b.vx; nz = -b.vz; ny = 0; }
      const m = Math.hypot(nx, ny, nz) || 1; nx /= m; ny /= m; nz /= m;
      const rvx = b.vx - p.vx, rvy = b.vy, rvz = b.vz - p.vz, vn = rvx * nx + rvy * ny + rvz * nz;
      if (vn >= -0.3) continue; // se aleja: no hay choque
      if (!best || u < best.u) best = { p, u, cx, cy, cz, nx, ny, nz, vn, rvx, rvy, rvz, B };
    }
    if (!best) return false;
    const { p, nx, ny, nz, vn, rvx, rvy, rvz, B } = best;
    const mate = this.lastTouch && p.team === this.lastTouch.team, cushion = mate && (p === this.receiver || !this.shot);
    const e = cushion ? 0.12 : 0.42, mu = cushion ? 0.55 : 0.85;
    // componente normal invertida con restitución, tangencial con fricción
    const tx = rvx - vn * nx, ty = rvy - vn * ny, tz = rvz - vn * nz;
    b.vx = p.vx + tx * mu - e * vn * nx;
    b.vy = ty * mu - e * vn * ny;
    b.vz = p.vz + tz * mu - e * vn * nz;
    if (b.vy > 0 && b.vy < 0.4) b.vy = 0;
    // Salvavidas: en un área llena (córner, tumulto) el balón puede rebotar de cuerpo en cuerpo varias
    // veces por segundo; con un roce casi tangente (normal casi vertical) cada choque le puede sumar un
    // poquito de vy y, encadenados, terminaban lanzando la pelota a 40+ m de alto. Un choque nunca debería
    // dejar la pelota más rápido de lo que entró (más el propio jugador), así que se recorta a eso.
    const inSp = Math.hypot(rvx, rvy, rvz), outSp = Math.hypot(b.vx - p.vx, b.vy, b.vz - p.vz), cap = inSp * (1 + e) + 0.5;
    if (outSp > cap) { const k = cap / outSp; b.vx = p.vx + (b.vx - p.vx) * k; b.vy *= k; b.vz = p.vz + (b.vz - p.vz) * k; }
    // ese tope es relativo al jugador (que también se mueve): en un tumulto, cada cuerpo suma un poco de
    // su propia carrera y, choque tras choque, la energía total puede seguir creciendo aunque cada choque
    // individual sea válido. Topes absolutos de verdad: nada realista sale disparado hacia arriba de un
    // cabezazo/rebote en el tumulto (vy aparte, más estricto: si no, con toda la velocidad horizontal
    // convertida en vertical igual se iba a 45+ m de alto).
    const horizSp = Math.hypot(b.vx, b.vz);
    if (horizSp > 30) { const k2 = 30 / horizSp; b.vx *= k2; b.vz *= k2; }
    if (Math.abs(b.vy) > 11) b.vy = Math.sign(b.vy) * 11;
    // fuera del cuerpo
    const rr = B.r + P4_BALL_R + 0.01;
    const qy = best.cy < B.y0 ? B.y0 : best.cy > B.y1 ? B.y1 : best.cy;
    b.x = p.x + nx * rr; b.z = p.z + nz * rr; b.y = Math.max(0.13, qy + ny * rr);
    p.p4At = this.elapsed;
    const wasShot = this.shot && this.shot.team !== p.team;
    this.p1Count(wasShot ? "body_block" : "body_hit");
    if (!mate || wasShot) { this.lastTouch = p; this.kickedAt = this.elapsed; }
    if (wasShot) {
      this.shot = null; this.secondBallUntil = this.elapsed + 1.6; this.excitement = Math.min(100, this.excitement + 10);
      this.event("block", "¡BLOQUEO!", `${p.name} pone el cuerpo y desvía el remate`, p.team, p);
    } else if (Math.hypot(rvx, rvz) > 9) this.secondBallUntil = Math.max(this.secondBallUntil || 0, this.elapsed + 0.8);
    return true;
  },
});
