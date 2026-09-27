import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Random } from '../simulation/model.js';

// Pabellón LBO con aspecto de transmisión: parquet procedural, tableros con red animada, dos anillos de tribuna con palcos,
// público en billboards instanciados (reacciona a las anotaciones), anillo LED y videomarcador colgante con sponsors ficticios.
// Medidas del motor: cancha 28 × 15 m (x = largo, z = ancho), aros en x = ±12,425 m a 3,05 m.
// Rendimiento: la geometría estática se fusiona por material; el público es un InstancedMesh animado en el shader.

export function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8; return texture;
}
export function material(color, extra = {}) { return new THREE.MeshStandardMaterial({ color, roughness: 0.65, ...extra }); }
export function box(parent, w, h, d, x, y, z, mat) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}

const LOGO_URL = '../assets/logos/lbo.png';
const SPONSORS_FALLBACK = [['aurora', 'AURORA ENERGY', 32], ['nova', 'NOVA BANK', 215], ['turbo', 'TURBO COLA', 4], ['pampa', 'PAMPA FOODS', 95], ['andes', 'ANDES TELECOM', 200], ['kondor', 'KÓNDOR MOTORS', 355], ['lumen', 'LUMEN TECH', 50], ['rio', 'RÍO SPORT', 175], ['fenix', 'FÉNIX AIRLINES', 18], ['titan', 'TITÁN GEAR', 265], ['delta', 'DELTA PAY', 150], ['sol', 'SOL DE MAYO SEGUROS', 45]];
function sponsors() {
  const cat = typeof window !== 'undefined' && window.EM && window.EM.sponsors && window.EM.sponsors.catalog;
  return cat && cat.length ? cat.slice(0, 12).map(c => ({ id: c.id, name: c.name, hue: c.hue })) : SPONSORS_FALLBACK.map(([id, name, hue]) => ({ id, name, hue }));
}
// logo SVG de sponsor (EM.sponsorLogo) dibujado en el canvas cuando carga
function drawSponsorLogo(ctx, s, x, y, size, redraw) {
  if (!(window.EM && window.EM.sponsorLogo)) return;
  const img = new Image(); img.onload = () => { ctx.drawImage(img, x, y, size, size); redraw(); };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(window.EM.sponsorLogo(s.id, s.name, size).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
}
const hexOf = (c) => '#' + new THREE.Color(c).getHexString();

// cinta de anuncios LED: celdas de sponsors ficticios; rota con texture.offset
function ledStrip(cells = 8, h = 96) {
  const list = sponsors(), W = 2048, cw = W / cells; let tex = null;
  tex = canvasTexture(W, h, (c) => {
    for (let i = 0; i < cells; i++) {
      const s = list[i % list.length], x = i * cw;
      const g = c.createLinearGradient(x, 0, x, h); g.addColorStop(0, `hsl(${s.hue} 70% 32%)`); g.addColorStop(1, `hsl(${(s.hue + 30) % 360} 75% 16%)`);
      c.fillStyle = g; c.fillRect(x, 0, cw, h); c.fillStyle = '#ffffff22'; c.fillRect(x, 0, 2, h);
      c.fillStyle = '#fff'; c.font = `900 ${Math.round(h * .42)}px Arial Narrow, Arial`; c.textAlign = 'left'; c.textBaseline = 'middle';
      c.fillText(s.name, x + h * .95, h / 2 + 2, cw - h * 1.1);
      drawSponsorLogo(c, s, x + h * .14, h * .14, h * .72, () => { if (tex) tex.needsUpdate = true; });
    }
    c.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < h; y += 4) c.fillRect(0, y, W, 1);
  });
  tex.wrapS = THREE.RepeatWrapping; return tex;
}

function rrect(shape, hx, hz, r, hole = false) {
  const p = hole ? new THREE.Path() : shape;
  p.moveTo(-hx + r, -hz); p.lineTo(hx - r, -hz); p.absarc(hx - r, -hz + r, r, -Math.PI / 2, 0, false);
  p.lineTo(hx, hz - r); p.absarc(hx - r, hz - r, r, 0, Math.PI / 2, false);
  p.lineTo(-hx + r, hz); p.absarc(-hx + r, hz - r, r, Math.PI / 2, Math.PI, false);
  p.lineTo(-hx, -hz + r); p.absarc(-hx + r, -hz + r, r, Math.PI, Math.PI * 1.5, false);
  if (hole) shape.holes.push(p); return p;
}
// banda (anillo de rectángulo redondeado) de ancho w, desde y0 con altura h
function bandGeo(hx, hz, r, w, y0, h) {
  const s = new THREE.Shape(); rrect(s, hx + w, hz + w, r + w); rrect(s, hx, hz, r, true);
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 6 });
  g.rotateX(Math.PI / 2); g.translate(0, y0 + h, 0); return g;
}
// puntos a lo largo del contorno redondeado (u = 0..1)
function perimeter(hx, hz, r, step) {
  const pts = [], L1 = 2 * (hx - r), L2 = 2 * (hz - r), La = Math.PI * r / 2;
  const segs = [['l', -hx + r, -hz, 1, 0, L1], ['a', hx - r, -hz + r, -Math.PI / 2, La], ['l', hx, -hz + r, 0, 1, L2], ['a', hx - r, hz - r, 0, La], ['l', hx - r, hz, -1, 0, L1], ['a', -hx + r, hz - r, Math.PI / 2, La], ['l', -hx, hz - r, 0, -1, L2], ['a', -hx + r, -hz + r, Math.PI, La]];
  const lenOf = (s) => (s[0] === 'l' ? s[5] : s[4]), total = segs.reduce((a, s) => a + lenOf(s), 0); let acc = 0;
  for (const s of segs) {
    const len = lenOf(s);
    for (let d = (step - (acc % step)) % step; d < len; d += step) {
      let x, z;
      if (s[0] === 'l') { x = s[1] + s[3] * d; z = s[2] + s[4] * d; } else { const a = s[3] + d / r; x = s[1] + Math.cos(a) * r; z = s[2] + Math.sin(a) * r; }
      pts.push({ x, z, u: (acc + d) / total });
    }
    acc += len;
  }
  return pts;
}

// atlas de siluetas (4 variantes). Blanco = ropa (se tiñe por instancia); tonos cálidos = piel y pelo (se conservan)
function crowdAtlas() {
  return canvasTexture(512, 256, (c) => {
    c.clearRect(0, 0, 512, 256);
    for (let i = 0; i < 4; i++) {
      const x = i * 128 + 64;
      c.fillStyle = '#ffffff';
      c.beginPath(); c.moveTo(x - 40, 256); c.quadraticCurveTo(x - 42, 146, x - 18, 132); c.lineTo(x + 18, 132); c.quadraticCurveTo(x + 42, 146, x + 40, 256); c.fill();
      if (i === 1) { c.save(); c.translate(x - 36, 140); c.rotate(-0.35); c.fillRect(-7, -72, 14, 76); c.restore(); c.save(); c.translate(x + 36, 140); c.rotate(0.35); c.fillRect(-7, -72, 14, 76); c.restore(); }
      if (i === 3) { c.fillStyle = '#f0f0f0'; c.fillRect(x - 26, 150, 52, 14); c.fillRect(x + 6, 150, 12, 70); }
      c.fillStyle = ['#c99a7a', '#8c6248', '#e2bfa3', '#6e4b36'][i]; c.beginPath(); c.ellipse(x, 104, 21, 26, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = ['#2b1d14', '#161616', '#6b4a2e', '#1d1712'][i]; c.beginPath(); c.ellipse(x, 90, 22, 15, 0, Math.PI, 0); c.fill();
      if (i === 0) { c.fillStyle = '#ffffff'; c.fillRect(x - 24, 74, 48, 10); c.fillRect(x - 4, 80, 32, 6); }
    }
  });
}
const SKIN_GLSL = 'float warm = diffuseColor.r - diffuseColor.b; float skin = step(0.12, warm);';

export class Arena {
  constructor(scene) {
    this.scene = scene; this.group = new THREE.Group(); scene.add(this.group);
    this.nets = []; this.boardLeds = []; this.shotClocks = []; this.spots = []; this.cones = []; this.ledTextures = [];
    this.homeColor = '#c8452d'; this.awayColor = '#2f6fb0'; this.lastEventId = null; this.cheerLevel = [0, 0]; this.flash = [0, 0]; this.swish = [0, 0];
    this.mode = 'normal'; this.tod = 2; this.t = 0; this.roofY = 24;
    this.buildCourt(); this.buildHoops(); this.buildStands(); this.buildBenches(); this.buildBroadcastGear(); this.buildLighting(scene); this.buildScoreboard();
  }

  // ------------------------------------------------------------------ parquet
  drawCourt(c, w, h, paint) {
    const random = new Random(882);
    c.fillStyle = '#c99b62'; c.fillRect(0, 0, w, h);
    const plank = 9, len = 150;
    for (let row = 0; row * plank < h; row++) {
      let x = -((row * 53) % len);
      while (x < w) {
        const l = len * (0.6 + random.next() * 0.8), light = 56 + random.next() * 14, hue = 30 + random.next() * 6;
        c.fillStyle = `hsl(${hue}, ${42 + random.next() * 10}%, ${light}%)`; c.fillRect(x, row * plank, l, plank - 0.6);
        c.strokeStyle = `rgba(95,58,24,${0.05 + random.next() * 0.1})`; c.lineWidth = 0.7;
        for (let k = 0; k < 3; k++) { const y = row * plank + 1.5 + k * 2.5 + random.next(); c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + l * .3, y + random.range(-1.5, 1.5), x + l * .6, y + random.range(-1.5, 1.5), x + l, y); c.stroke(); }
        if (random.next() < 0.12) { c.fillStyle = 'rgba(90,50,20,.18)'; c.beginPath(); c.ellipse(x + l * random.next(), row * plank + plank / 2, 4, 1.6, 0, 0, 7); c.fill(); }
        c.fillStyle = 'rgba(60,35,15,.35)'; c.fillRect(x + l - 0.8, row * plank, 0.8, plank);
        x += l;
      }
    }
    const gl = c.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * .6); gl.addColorStop(0, 'rgba(255,245,225,.10)'); gl.addColorStop(1, 'rgba(0,0,0,.08)'); c.fillStyle = gl; c.fillRect(0, 0, w, h);
    c.save(); c.translate(w / 2, h / 2); const S = w / 28; c.scale(S, S);
    c.lineWidth = 0.05; c.strokeStyle = '#f7f1e6';
    c.strokeRect(-13.975, -7.475, 27.95, 14.95);
    c.beginPath(); c.moveTo(0, -7.5); c.lineTo(0, 7.5); c.stroke();
    for (const dir of [-1, 1]) {
      c.save(); c.scale(dir, 1);
      c.globalAlpha = 0.88; c.fillStyle = paint; c.fillRect(8.2, -2.45, 5.8, 4.9); c.globalAlpha = 1; c.strokeRect(8.2, -2.45, 5.8, 4.9);
      c.beginPath(); c.arc(8.2, 0, 1.8, Math.PI / 2, Math.PI * 1.5); c.stroke();
      c.save(); c.setLineDash([0.3, 0.3]); c.beginPath(); c.arc(8.2, 0, 1.8, -Math.PI / 2, Math.PI / 2); c.stroke(); c.restore();
      c.beginPath(); c.arc(12.425, 0, 1.25, Math.PI / 2, Math.PI * 1.5); c.stroke();
      const a = Math.asin(6.6 / 6.75), cross = 12.425 - Math.sqrt(6.75 ** 2 - 6.6 ** 2);
      c.beginPath(); c.moveTo(14, -6.6); c.lineTo(cross, -6.6); c.arc(12.425, 0, 6.75, Math.PI + a, Math.PI - a, true); c.lineTo(14, 6.6); c.stroke();
      for (const x of [9.05, 9.9, 10.75, 11.6]) { c.beginPath(); c.moveTo(x, -2.45); c.lineTo(x, -2.6); c.moveTo(x, 2.45); c.lineTo(x, 2.6); c.stroke(); }
      c.beginPath(); c.moveTo(5.2, 7.5); c.lineTo(5.2, 7.8); c.stroke();
      c.restore();
    }
    c.fillStyle = paint; c.globalAlpha = 0.9; c.beginPath(); c.arc(0, 0, 1.8, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1; c.stroke();
    c.restore();
    if (this.logoImg && this.logoImg.complete && this.logoImg.naturalWidth) { const s = h * .21; c.drawImage(this.logoImg, w / 2 - s / 2, h / 2 - s / 2, s, s); }
    c.fillStyle = 'rgba(255,255,255,.5)'; c.font = '900 26px Arial'; c.textAlign = 'center'; c.fillText('L I G A   D E   B Á S Q U E T   O N L I N E', w / 2, h / 2 + h * .2);
  }
  buildCourt() {
    this.courtCanvas = document.createElement('canvas'); this.courtCanvas.width = 2048; this.courtCanvas.height = 1098;
    this.courtTex = new THREE.CanvasTexture(this.courtCanvas); this.courtTex.colorSpace = THREE.SRGBColorSpace; this.courtTex.anisotropy = 8;
    this.logoImg = new Image(); this.logoImg.onload = () => this.redrawCourt(); this.logoImg.src = LOGO_URL;
    this.redrawCourt();
    // envMap barato (equirectangular de canvas): reflejo suave de las luces del techo sobre el barniz
    const env = canvasTexture(512, 256, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a2f38'); g.addColorStop(.5, '#10141a'); g.addColorStop(1, '#070a0e'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.fillStyle = '#fff6e0'; for (let i = 0; i < 8; i++) c.fillRect(i * 64 + 16, 30, 30, 10);
      c.fillStyle = '#9fb6d0'; c.fillRect(0, 110, w, 8);
    });
    env.mapping = THREE.EquirectangularReflectionMapping;
    this.floorMat = new THREE.MeshStandardMaterial({ map: this.courtTex, roughness: 0.35, metalness: 0.02, envMap: env, envMapIntensity: 0.45 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 15), this.floorMat);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.position.y = -0.048; this.group.add(floor);
    const apron = new THREE.Mesh(new THREE.PlaneGeometry(35, 21), new THREE.MeshStandardMaterial({ color: '#7a5431', roughness: 0.4, envMap: env, envMapIntensity: 0.3 }));
    apron.rotation.x = -Math.PI / 2; apron.position.y = -0.052; apron.receiveShadow = true; this.group.add(apron);
    this.borderMat = new THREE.MeshStandardMaterial({ color: this.homeColor, roughness: 0.45 });
    for (const [w, d, x, z] of [[28.8, .4, 0, 7.75], [28.8, .4, 0, -7.75], [.4, 15.9, 14.2, 0], [.4, 15.9, -14.2, 0]]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), this.borderMat); m.rotation.x = -Math.PI / 2; m.position.set(x, -0.05, z); m.receiveShadow = true; this.group.add(m);
    }
    box(this.group, 90, 0.1, 80, 0, -0.12, 0, material('#0a0e14', { roughness: 0.9 })).castShadow = false;
  }
  redrawCourt() { this.drawCourt(this.courtCanvas.getContext('2d'), this.courtCanvas.width, this.courtCanvas.height, this.homeColor); this.courtTex.needsUpdate = true; }
  setTeamColors(home, away) {
    const h = hexOf(home), a = hexOf(away); if (h === this.homeColor && a === this.awayColor) return;
    this.homeColor = h; this.awayColor = a; this.redrawCourt(); this.borderMat.color.set(h);
    for (const m of this.padMats || []) m.color.set(h);
    this.seatMat.color.set(h).multiplyScalar(0.55);
    if (this.crowdColors) this.recolorCrowd();
  }

  // ------------------------------------------------------------------ aros
  buildHoops() {
    const metal = material('#b8c2c6', { metalness: 0.8, roughness: 0.28 }), dark = material('#15191f', { roughness: 0.6 });
    this.padMats = [];
    for (const dir of [-1, 1]) {
      const hoop = new THREE.Group(); this.group.add(hoop);
      const pad = material(this.homeColor, { roughness: 0.85 }); this.padMats.push(pad);
      box(hoop, 1.9, 0.3, 1.5, dir * 16.2, 0.15, 0, dark);
      box(hoop, 1.96, 0.8, 1.56, dir * 16.2, 0.65, 0, pad);
      box(hoop, 0.5, 1.9, 0.9, dir * 15.55, 1.4, 0, pad);
      const arm = box(hoop, 0.22, 3.9, 0.28, dir * 14.85, 2.4, 0, metal); arm.rotation.z = dir * -0.3;
      box(hoop, 1.55, 0.16, 0.2, dir * 13.75, 3.62, 0, metal);
      box(hoop, 0.36, 0.5, 0.36, dir * 14.3, 3.35, 0, pad);
      // tablero de vidrio 1,80 × 1,05 con marco y leds perimetrales
      const glass = new THREE.MeshPhysicalMaterial({ color: '#dff4f7', transparent: true, opacity: 0.16, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false });
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.05, 1.8), glass); board.position.set(dir * 13.0, 3.475, 0); hoop.add(board);
      for (const z of [-0.915, 0.915]) box(hoop, 0.06, 1.09, 0.035, dir * 13.0, 3.475, z, dark);
      for (const y of [2.935, 4.015]) box(hoop, 0.06, 0.035, 1.86, dir * 13.0, y, 0, dark);
      const led = new THREE.MeshBasicMaterial({ color: '#2a0b0b', toneMapped: false });
      for (const z of [-0.94, 0.94]) box(hoop, 0.04, 1.09, 0.02, dir * 12.97, 3.475, z, led).castShadow = false;
      box(hoop, 0.04, 0.03, 1.9, dir * 12.97, 4.04, 0, led).castShadow = false;
      this.boardLeds.push(led);
      const inner = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.59, 0.45)), new THREE.LineBasicMaterial({ color: '#ffffff' }));
      inner.position.set(dir * 12.975, 3.325, 0); inner.rotation.y = Math.PI / 2; hoop.add(inner);
      box(hoop, 0.3, 0.06, 0.16, dir * 12.8, 3.02, 0, material('#e8612a', { metalness: 0.4, roughness: 0.4 }));
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2295, 0.01, 8, 40), material('#f06a2a', { metalness: 0.45, roughness: 0.35 }));
      rim.position.set(dir * 12.425, 3.05, 0); rim.rotation.x = Math.PI / 2; rim.castShadow = true; hoop.add(rim);
      // red: malla de 12 × 5 nudos que se deforma al anotar
      const RINGS = 5, N = 12, base = [];
      for (let r = 0; r <= RINGS; r++) for (let i = 0; i < N; i++) {
        const t = r / RINGS, a = (i + (r % 2) * 0.5) / N * Math.PI * 2, rad = 0.225 - t * 0.085;
        base.push(Math.cos(a) * rad, -t * 0.42, Math.sin(a) * rad);
      }
      const idx = [];
      for (let r = 0; r < RINGS; r++) for (let i = 0; i < N; i++) { const a = r * N + i; idx.push(a, (r + 1) * N + i, a, (r + 1) * N + ((i + (r % 2 ? 1 : N - 1)) % N)); }
      for (let i = 0; i < N; i++) idx.push(RINGS * N + i, RINGS * N + (i + 1) % N);
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(base.slice(), 3)); g.setIndex(idx);
      const net = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#f2f2ea' }));
      net.position.set(dir * 12.425, 3.05, 0); hoop.add(net);
      this.nets.push({ mesh: net, base: new Float32Array(base) });
      // reloj de posesión sobre el tablero
      const sc = document.createElement('canvas'); sc.width = 128; sc.height = 64; const st = new THREE.CanvasTexture(sc); st.colorSpace = THREE.SRGBColorSpace;
      box(hoop, 0.2, 0.42, 0.9, dir * 13.02, 4.33, 0, dark);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.36), new THREE.MeshBasicMaterial({ map: st, toneMapped: false }));
      face.position.set(dir * 12.915, 4.33, 0); face.rotation.y = -dir * Math.PI / 2; hoop.add(face);
      this.shotClocks.push({ canvas: sc, tex: st, last: '' });
    }
  }

  // ------------------------------------------------------------------ tribunas, palcos y público
  buildStands() {
    const random = new Random(921);
    const conc = [], steps = [], rails = [], seats = [], seatSlots = [];
    const LOW = { hx: 17.6, hz: 11.4, r: 4, rows: 12, d: 0.85, rise: 0.42 };
    for (let i = 0; i < LOW.rows; i++) {
      const hx = LOW.hx + i * LOW.d, hz = LOW.hz + i * LOW.d, rr = LOW.r + i * LOW.d, top = 0.5 + i * LOW.rise;
      conc.push(bandGeo(hx, hz, rr, LOW.d + 0.01, 0, top));
      seats.push(bandGeo(hx + LOW.d * 0.62, hz + LOW.d * 0.62, rr + LOW.d * 0.62, 0.2, top, 0.16));
      for (const p of perimeter(hx + LOW.d * 0.5, hz + LOW.d * 0.5, rr + LOW.d * 0.5, 0.62)) seatSlots.push({ ...p, y: top, tier: 0 });
    }
    conc.push(bandGeo(LOW.hx - 0.3, LOW.hz - 0.3, LOW.r - 0.3, 0.3, 0, 1.1));
    // pasillo y palcos entre los dos anillos
    const SU = { hx: LOW.hx + LOW.rows * LOW.d, hz: LOW.hz + LOW.rows * LOW.d, r: LOW.r + LOW.rows * LOW.d }, topLow = 0.5 + (LOW.rows - 1) * LOW.rise;
    conc.push(bandGeo(SU.hx, SU.hz, SU.r, 3.4, 0, topLow + 0.1));
    rails.push(bandGeo(SU.hx - 0.06, SU.hz - 0.06, SU.r - 0.06, 0.06, topLow + 0.1, 0.9));
    this.suiteTex = canvasTexture(1024, 128, (c, w, h) => {
      c.fillStyle = '#0d1116'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 16; i++) {
        const x = i * 64 + 4, g = c.createLinearGradient(0, 10, 0, h - 16); g.addColorStop(0, '#ffcf8a'); g.addColorStop(1, '#7a4a22');
        c.fillStyle = g; c.fillRect(x, 12, 56, h - 30);
        c.fillStyle = 'rgba(20,14,10,.85)'; for (let k = 0; k < 3; k++) { const px = x + 8 + k * 16 + (i * 7 % 5); c.beginPath(); c.ellipse(px, 64, 5, 6, 0, 0, 7); c.fill(); c.fillRect(px - 7, 70, 14, 30); }
        c.fillStyle = 'rgba(180,220,255,.18)'; c.fillRect(x, 12, 56, 10);
      }
      c.fillStyle = '#20262e'; c.fillRect(0, h - 18, w, 18);
    });
    this.suiteTex.wrapS = THREE.RepeatWrapping; this.suiteTex.repeat.set(7, 1);
    const suiteY = topLow + 0.1;
    const suiteFront = new THREE.Mesh(this.fasciaGeo(SU.hx + 3.4, SU.hz + 3.4, SU.r + 3.4, suiteY, 2.2), new THREE.MeshBasicMaterial({ map: this.suiteTex, toneMapped: false }));
    this.group.add(suiteFront); this.suiteMat = suiteFront.material;
    // cinta LED sobre los palcos (borde del anillo superior)
    const ribbon = ledStrip(10, 64); ribbon.repeat.set(6, 1); this.ledTextures.push({ tex: ribbon, speed: 0.018 });
    const UP = { hx: SU.hx + 3.4, hz: SU.hz + 3.4, r: SU.r + 3.4, rows: 10, d: 0.9, rise: 0.56 }, upBase = suiteY + 2.2;
    this.group.add(new THREE.Mesh(this.fasciaGeo(UP.hx - 0.02, UP.hz - 0.02, UP.r - 0.02, upBase, 0.6), new THREE.MeshBasicMaterial({ map: ribbon, toneMapped: false })));
    for (let i = 0; i < UP.rows; i++) {
      const hx = UP.hx + i * UP.d, hz = UP.hz + i * UP.d, rr = UP.r + i * UP.d, top = upBase + 0.6 + i * UP.rise;
      conc.push(bandGeo(hx, hz, rr, UP.d + 0.01, upBase - 0.5, top - upBase + 0.5));
      seats.push(bandGeo(hx + UP.d * 0.62, hz + UP.d * 0.62, rr + UP.d * 0.62, 0.2, top, 0.16));
      for (const p of perimeter(hx + UP.d * 0.5, hz + UP.d * 0.5, rr + UP.d * 0.5, 0.64)) seatSlots.push({ ...p, y: top, tier: 1 });
    }
    rails.push(bandGeo(UP.hx - 0.06, UP.hz - 0.06, UP.r - 0.06, 0.06, upBase + 0.6, 0.8));
    // escaleras de los pasillos: franjas claras en posiciones fijas del contorno, sin público
    const aisles = [0.03, 0.1, 0.17, 0.25, 0.33, 0.4, 0.47, 0.53, 0.6, 0.67, 0.75, 0.83, 0.9, 0.97];
    const inAisle = (u, tier) => aisles.some(a => Math.abs(((u - a + 1.5) % 1) - 0.5) < (tier ? 0.0045 : 0.0062));
    for (const [D, tier] of [[LOW, 0], [UP, 1]]) for (let i = 0; i < D.rows; i++) {
      const top = tier ? upBase + 0.6 + i * D.rise : 0.5 + i * D.rise;
      for (const p of perimeter(D.hx + i * D.d + D.d * .5, D.hz + i * D.d + D.d * .5, D.r + i * D.d + D.d * .5, 0.2)) if (inAisle(p.u, tier)) {
        const g = new THREE.BoxGeometry(0.2, 0.04, D.d * 0.95); g.rotateY(Math.atan2(p.x, p.z)); g.translate(p.x, top + 0.02, p.z); steps.push(g);
      }
    }
    const stands = new THREE.Mesh(mergeGeometries(conc), material('#1b2029', { roughness: 0.9 })); stands.receiveShadow = true; this.group.add(stands);
    this.seatMat = material('#5a2a20', { roughness: 0.7 });
    this.group.add(new THREE.Mesh(mergeGeometries(seats), this.seatMat));
    if (steps.length) this.group.add(new THREE.Mesh(mergeGeometries(steps), material('#5f6772', { roughness: 0.8 })));
    this.group.add(new THREE.Mesh(mergeGeometries(rails), material('#39414c', { metalness: 0.5, roughness: 0.4 })));
    // cerramiento: muro y techo en BackSide (desde afuera no tapan ninguna cámara; desde adentro cierran el recinto)
    const HX = UP.hx + UP.rows * UP.d + 1, HZ = UP.hz + UP.rows * UP.d + 1;
    this.upperTop = upBase + 0.6 + UP.rows * UP.rise;
    const shell = new THREE.Mesh(new THREE.BoxGeometry(HX * 2, 30, HZ * 2), new THREE.MeshStandardMaterial({ color: '#0c1017', roughness: 1, side: THREE.BackSide }));
    shell.position.y = 14.9; this.group.add(shell);
    this.buildRoof(HX, HZ);
    this.buildCrowd(seatSlots.filter(p => !inAisle(p.u, p.tier)), random);
  }
  // banda vertical que mira hacia adentro sobre un contorno redondeado (frentes de palco, cintas LED)
  fasciaGeo(hx, hz, r, y, h) {
    const pts = perimeter(hx, hz, r, 0.5); pts.push({ ...pts[0], u: 1 });
    const pos = [], uv = [], idx = [];
    pts.forEach((p, i) => { pos.push(p.x, y, p.z, p.x, y + h, p.z); uv.push(p.u, 0, p.u, 1); if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  buildRoof(HX, HZ) {
    const truss = [], Y = this.roofY;
    for (let x = -HX + 5; x <= HX - 5; x += 8) {
      for (const dy of [0, 1.6]) { const g = new THREE.BoxGeometry(0.18, 0.18, HZ * 2); g.translate(x, Y + dy, 0); truss.push(g); }
      for (let z = -HZ + 2, k = 0; z < HZ - 2; z += 2.4, k++) { const g = new THREE.BoxGeometry(0.08, 1.9, 0.08); g.rotateX(k % 2 ? 0.6 : -0.6); g.translate(x, Y + 0.8, z); truss.push(g); }
    }
    for (const z of [-7, 7]) { const g = new THREE.BoxGeometry(HX * 1.6, 0.12, 0.9); g.translate(0, Y - 0.2, z); truss.push(g); }
    this.group.add(new THREE.Mesh(mergeGeometries(truss), material('#3a414b', { metalness: 0.6, roughness: 0.5 })));
  }
  buildCrowd(slots, random) {
    const n = slots.length, atlas = crowdAtlas();
    const geo = new THREE.PlaneGeometry(0.66, 1.05); geo.translate(0, 0.5, 0);
    const aVar = new Float32Array(n), aPhase = new Float32Array(n), aFan = new Float32Array(n);
    const mat = new THREE.MeshLambertMaterial({ map: atlas, alphaTest: 0.5, side: THREE.DoubleSide });
    const uniforms = { uTime: { value: 0 }, uCheer: { value: new THREE.Vector2(0, 0) } };
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, uniforms);
      sh.vertexShader = 'attribute float aVar; attribute float aPhase; attribute float aFan; uniform float uTime; uniform vec2 uCheer;\n' + sh.vertexShader
        .replace('#include <uv_vertex>', '#include <uv_vertex>\n  vMapUv = vec2((uv.x + aVar) * 0.25, uv.y);')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          float ch = aFan > 0.5 ? uCheer.y : uCheer.x;
          transformed.y += sin(uTime * 1.3 + aPhase * 6.28) * 0.015 + ch * abs(sin(uTime * (7.0 + aPhase * 3.0) + aPhase * 6.28)) * 0.34;
          transformed.x += ch * sin(uTime * 5.0 + aPhase * 9.0) * 0.03;`);
      // piel y pelo (tonos cálidos del atlas) no se tiñen con el color de la camiseta
      sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', '').replace('#include <map_fragment>', `#include <map_fragment>
          ${SKIN_GLSL}
          #if defined( USE_COLOR_ALPHA ) || defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
            diffuseColor.rgb *= mix(vColor.rgb, vec3(1.0), skin);
          #endif`);
    };
    const mesh = new THREE.InstancedMesh(geo, mat, n); mesh.frustumCulled = false;
    const d = new THREE.Object3D(); this.crowdColors = [];
    slots.forEach((p, i) => {
      d.position.set(p.x, p.y + 0.02, p.z); d.rotation.set(0, Math.atan2(-p.x, -p.z), 0);
      const s = random.range(0.92, 1.08); d.scale.set(s, s, s); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix);
      aVar[i] = Math.floor(random.next() * 4); aPhase[i] = random.next();
      // hinchas: mayoría local; los visitantes agrupados en la cabecera x > 0
      aFan[i] = (p.x > 19 && random.next() < 0.75) || random.next() < 0.08 ? 1 : 0;
      this.crowdColors.push({ fan: aFan[i], k: random.next() });
    });
    geo.setAttribute('aVar', new THREE.InstancedBufferAttribute(aVar, 1)); geo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(aPhase, 1)); geo.setAttribute('aFan', new THREE.InstancedBufferAttribute(aFan, 1));
    this.crowd = mesh; this.crowdUniforms = uniforms; this.group.add(mesh);
    this.recolorCrowd();
  }
  recolorCrowd() {
    const neutral = ['#2b3440', '#e9e4da', '#3d4a3a', '#6b6f78', '#1c1f24', '#8a5b3b', '#415a78'], col = new THREE.Color();
    this.crowdColors.forEach((c, i) => {
      col.set(c.k < 0.55 ? (c.fan ? this.awayColor : this.homeColor) : c.k < 0.62 ? '#ffffff' : neutral[Math.floor(c.k * 97) % neutral.length]);
      col.offsetHSL(0, 0, (c.k - 0.5) * 0.12); this.crowd.setColorAt(i, col);
    });
    this.crowd.instanceColor.needsUpdate = true;
  }

  // ------------------------------------------------------------------ banquillos, mesa de control, anillo LED
  buildBenches() {
    const chairs = [], frames = [], towels = [], bottles = [], d = new THREE.Object3D();
    for (const side of [-1, 1]) for (let i = 0; i < 9; i++) {
      const x = side * (3.4 + i * 0.72), z = -9.2;
      let g = new THREE.BoxGeometry(0.52, 0.09, 0.48); g.translate(x, 0.48, z); chairs.push(g);
      g = new THREE.BoxGeometry(0.52, 0.6, 0.08); g.rotateX(-0.12); g.translate(x, 0.8, z - 0.24); chairs.push(g);
      for (const dx of [-0.22, 0.22]) { g = new THREE.BoxGeometry(0.04, 0.46, 0.04); g.translate(x + dx, 0.23, z); frames.push(g); }
      if (i % 2 === 0) { g = new THREE.BoxGeometry(0.3, 0.03, 0.46); g.translate(x, 0.54, z + 0.01); towels.push(g); g = new THREE.BoxGeometry(0.3, 0.32, 0.03); g.translate(x, 0.72, z - 0.19); towels.push(g); }
      bottles.push([x + 0.2, z + 0.42]);
    }
    this.group.add(new THREE.Mesh(mergeGeometries(chairs), material('#20252d', { roughness: 0.6 })), new THREE.Mesh(mergeGeometries(frames), material('#9aa3aa', { metalness: 0.7, roughness: 0.35 })), new THREE.Mesh(mergeGeometries(towels), material('#f3f1ea', { roughness: 1 })));
    const bottle = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.24, 8), material('#2f8fd8', { roughness: 0.3 }), bottles.length);
    bottles.forEach(([x, z], i) => { d.position.set(x, 0.12, z); d.updateMatrix(); bottle.setMatrixAt(i, d.matrix); }); this.group.add(bottle);
    // mesa de anotadores con monitores
    const tableTex = ledStrip(4, 128); this.ledTextures.push({ tex: tableTex, speed: 0.01 });
    box(this.group, 5.4, 0.8, 0.8, 0, 0.4, -9.3, material('#14181e'));
    const front = new THREE.Mesh(new THREE.PlaneGeometry(5.3, 0.62), new THREE.MeshBasicMaterial({ map: tableTex, toneMapped: false })); front.position.set(0, 0.42, -8.89); this.group.add(front);
    const mon = [];
    for (let i = 0; i < 5; i++) { const g = new THREE.BoxGeometry(0.42, 0.28, 0.03); g.rotateX(-0.25); g.translate(-2 + i, 0.98, -9.45); mon.push(g); }
    this.group.add(new THREE.Mesh(mergeGeometries(mon), new THREE.MeshStandardMaterial({ color: '#1d2a3a', emissive: '#27435f', emissiveIntensity: 0.8 })));
    // siluetas: cuerpo técnico de pie, suplentes sentados, cronometrador y oficiales
    const staff = [];
    for (const side of [-1, 1]) { staff.push([side * 2.6, -8.5, 1.6, 0], [side * 1.9, -8.8, 1.6, 2]); for (let i = 0; i < 8; i++) staff.push([side * (3.4 + i * 0.72), -9.12, 1.0, i % 4]); }
    for (let i = 0; i < 4; i++) staff.push([-1.5 + i, -9.75, 1.0, i % 4]);
    const sm = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.7, 1.1).translate(0, 0.55, 0), new THREE.MeshLambertMaterial({ map: crowdAtlas(), alphaTest: 0.5, side: THREE.DoubleSide }), staff.length);
    sm.material.onBeforeCompile = (sh) => { sh.vertexShader = 'attribute float aVar;\n' + sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n  vMapUv = vec2((uv.x + aVar) * 0.25, uv.y);'); sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', '').replace('#include <map_fragment>', `#include <map_fragment>\n ${SKIN_GLSL}\n #ifdef USE_INSTANCING_COLOR\n diffuseColor.rgb *= mix(vColor.rgb, vec3(1.0), skin);\n #endif`); };
    const av = new Float32Array(staff.length), col = new THREE.Color();
    staff.forEach(([x, z, sc, v], i) => { d.position.set(x, sc > 1.5 ? 0 : 0.3, z); d.scale.setScalar(sc > 1.5 ? 1.6 : 1.05); d.updateMatrix(); sm.setMatrixAt(i, d.matrix); av[i] = v; sm.setColorAt(i, col.set(sc > 1.5 ? '#1a1d24' : i % 2 ? '#2c3a52' : '#3a3f4a')); });
    sm.geometry.setAttribute('aVar', new THREE.InstancedBufferAttribute(av, 1)); this.group.add(sm);
    // anillo LED perimetral a nivel de cancha
    const led = ledStrip(8, 96), backMat = material('#0b0e12');
    const segs = [[25, 0, -10.45, 0, 5], [15, 17.3, 0, -Math.PI / 2, 3], [15, -17.3, 0, Math.PI / 2, 3], [10.5, 8.2, 10.45, Math.PI, 2], [10.5, -8.2, 10.45, Math.PI, 2]];
    for (const [w, x, z, ry, rep] of segs) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; this.group.add(g);
      box(g, w + 0.1, 0.92, 0.3, 0, 0.46, -0.16, backMat);
      const tex = led.clone(); tex.repeat.set(rep, 1); tex.needsUpdate = true; this.ledTextures.push({ tex, speed: 0.03 });
      const face = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.8), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); face.position.set(0, 0.47, 0.001); g.add(face);
    }
  }
  // cámaras de TV fijas (fosos) y carril de dolly del lado opuesto a los banquillos
  buildBroadcastGear() {
    const black = material('#111418', { roughness: 0.5, metalness: 0.3 }), gray = material('#5d6570', { metalness: 0.6, roughness: 0.4 });
    const parts = [], grays = [];
    const cam = (x, y, z, ry) => {
      let g = new THREE.BoxGeometry(0.34, 0.3, 0.62); g.rotateY(ry); g.translate(x, y, z); parts.push(g);
      g = new THREE.CylinderGeometry(0.09, 0.11, 0.3, 12); g.rotateX(Math.PI / 2); g.rotateY(ry); g.translate(x + Math.sin(ry) * 0.42, y + 0.02, z + Math.cos(ry) * 0.42); parts.push(g);
      for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; g = new THREE.CylinderGeometry(0.02, 0.02, y, 6); g.translate(x + Math.cos(a) * 0.18, y / 2 - 0.1, z + Math.sin(a) * 0.18); grays.push(g); }
    };
    cam(-15.6, 1.35, -8.6, Math.atan2(15.6, 8.6)); cam(15.6, 1.35, -8.6, Math.atan2(-15.6, 8.6));
    cam(-16.8, 1.0, 3.4, Math.PI / 2); cam(16.8, 1.0, -3.4, -Math.PI / 2);
    let g = new THREE.BoxGeometry(24, 0.06, 0.08); g.translate(0, 0.05, 11.0); grays.push(g); g = g.clone(); g.translate(0, 0, 0.35); grays.push(g);
    this.group.add(new THREE.Mesh(mergeGeometries(parts), black), new THREE.Mesh(mergeGeometries(grays), gray));
    this.dolly = new THREE.Group(); this.dolly.position.set(0, 0, 11.17); this.group.add(this.dolly);
    box(this.dolly, 0.7, 0.3, 0.6, 0, 0.25, 0, gray); box(this.dolly, 0.34, 0.3, 0.6, 0, 0.75, 0, black); box(this.dolly, 0.08, 0.5, 0.08, 0, 0.45, 0, gray);
  }

  // ------------------------------------------------------------------ videomarcador colgante (4 pantallas de canvas)
  buildScoreboard() {
    const g = new THREE.Group(); g.position.set(0, 13.6, 0); this.group.add(g); this.jumbo = g;
    const frame = material('#0c0f13', { metalness: 0.5, roughness: 0.4 });
    box(g, 7.4, 3.6, 5.2, 0, 0, 0, frame).castShadow = false;
    box(g, 5.6, 0.6, 3.6, 0, -2.1, 0, frame).castShadow = false;
    const cable = this.roofY - 13.6 - 1.8;
    for (const [x, z] of [[-2, -1.5], [2, -1.5], [-2, 1.5], [2, 1.5]]) box(g, 0.05, cable, 0.05, x, 1.8 + cable / 2, z, frame).castShadow = false;
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { c, t, x: c.getContext('2d') }; };
    this.jLong = mk(1024, 512); this.jShort = mk(512, 400);
    const longMat = new THREE.MeshBasicMaterial({ map: this.jLong.t, toneMapped: false }), shortMat = new THREE.MeshBasicMaterial({ map: this.jShort.t, toneMapped: false });
    for (const s of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(7.1, 3.4), longMat); m.position.set(0, 0, s * 2.61); m.rotation.y = s > 0 ? 0 : Math.PI; g.add(m);
      const n = new THREE.Mesh(new THREE.PlaneGeometry(5, 3.4), shortMat); n.position.set(s * 3.71, 0, 0); n.rotation.y = s * Math.PI / 2; g.add(n);
    }
    const ring = ledStrip(6, 64); ring.repeat.set(2, 1); this.ledTextures.push({ tex: ring, speed: -0.02 });
    const rm = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 0.55, 40, 1, true), new THREE.MeshBasicMaterial({ map: ring, toneMapped: false, side: THREE.DoubleSide })); rm.position.y = -2.1; rm.scale.set(1, 1, 0.66); g.add(rm);
    this.jKey = '';
  }
  drawScoreboard(view) {
    const teams = view.teams || [], T = (i) => teams[i] || { name: i ? 'VISITANTE' : 'LOCAL', short: i ? 'VIS' : 'LOC', score: 0, color: i ? this.awayColor : this.homeColor };
    const clock = Math.max(0, view.clock ?? 0), mm = Math.floor(clock / 60), ss = Math.floor(clock % 60), per = view.period ?? 1;
    const ev = (view.events || []).find(e => e.type === 'score'), rp = ev ? ev.text : '';
    const key = [T(0).score, T(1).score, mm, ss, per, Math.ceil(view.shotClock ?? 24), rp, this.homeColor].join('|'); if (key === this.jKey) return; this.jKey = key;
    const c = this.jLong.x, W = 1024, H = 512;
    c.fillStyle = '#05070a'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 2; i++) {
      const tm = T(i), x0 = i ? W / 2 : 0;
      c.fillStyle = hexOf(tm.color); c.fillRect(x0 + 16, 16, W / 2 - 32, 90);
      c.fillStyle = '#fff'; c.font = '900 58px Arial Narrow, Arial'; c.textAlign = 'center'; c.fillText(String(tm.short || tm.name || '').toUpperCase().slice(0, 14), x0 + W / 4, 82);
      c.font = '900 210px Arial Narrow, Arial'; c.fillStyle = '#ffd24a'; c.fillText(String(tm.score ?? 0), x0 + W / 4, 310);
    }
    c.fillStyle = '#0f1620'; c.fillRect(0, 350, W, 162);
    c.font = '900 110px Arial Narrow, Arial'; c.fillStyle = '#ff4a3a'; c.textAlign = 'center'; c.fillText(`${mm}:${String(ss).padStart(2, '0')}`, W / 2, 470);
    c.font = '800 44px Arial'; c.fillStyle = '#9fb3c8'; c.textAlign = 'left'; c.fillText(per > 4 ? 'PR' : per + '°C', 30, 450);
    c.textAlign = 'right'; c.fillStyle = '#ffb347'; c.fillText(String(Math.max(0, Math.ceil(view.shotClock ?? 24))), W - 30, 450);
    c.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 1);
    this.jLong.t.needsUpdate = true;
    const s = this.jShort.x, SW = 512, SH = 400;
    s.fillStyle = '#05070a'; s.fillRect(0, 0, SW, SH); s.textAlign = 'center';
    s.fillStyle = '#ff4a3a'; s.font = '900 120px Arial Narrow, Arial'; s.fillText(`${mm}:${String(ss).padStart(2, '0')}`, SW / 2, 140);
    s.fillStyle = '#e5233d'; s.fillRect(20, 180, SW - 40, 46); s.fillStyle = '#fff'; s.font = '900 32px Arial'; s.fillText(rp ? 'REPETICIÓN' : 'LBO · EN VIVO', SW / 2, 214);
    s.font = '700 34px Arial Narrow, Arial';
    const words = String(rp || `${T(0).short || ''} ${T(0).score ?? 0} - ${T(1).score ?? 0} ${T(1).short || ''}`).toUpperCase().split(' '); let line = '', y = 280;
    for (const w of words) { if (s.measureText(line + w).width > SW - 40) { s.fillText(line, SW / 2, y); line = ''; y += 42; } line += w + ' '; } s.fillText(line, SW / 2, y);
    this.jShort.t.needsUpdate = true;
  }

  // ------------------------------------------------------------------ luces
  buildLighting(scene) {
    this.hemi = new THREE.HemisphereLight('#f8eee0', '#232c36', 1.7); scene.add(this.hemi);
    const key = new THREE.DirectionalLight('#fff4dc', 2.8); key.position.set(-5, 22, 8);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -24; key.shadow.camera.right = 24;
    key.shadow.camera.top = 19; key.shadow.camera.bottom = -19; key.shadow.camera.near = 1; key.shadow.camera.far = 60;
    key.shadow.bias = -0.0005; key.shadow.normalBias = 0.035; scene.add(key); this.key = key;
    this.fill = new THREE.DirectionalLight('#a4d8e1', 0.9); this.fill.position.set(12, 14, -12); scene.add(this.fill);
    // focos cenitales sin sombra (sólo la luz principal proyecta) + conos visibles aditivos
    this.coneMat = new THREE.MeshBasicMaterial({ color: '#fff3d6', transparent: true, opacity: 0.04, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const rig = [], y = this.roofY - 1.2;
    [[-9, -4], [-9, 4], [0, -5], [0, 5], [9, -4], [9, 4]].forEach(([x, z], i) => {
      const from = new THREE.Vector3(x * 1.4, y, z * 2.2), to = new THREE.Vector3(x, 0, z);
      if (i < 4) { const sp = new THREE.SpotLight('#fff1d8', 60, 45, 0.42, 0.55, 1.4); sp.position.copy(from); sp.target.position.copy(to); scene.add(sp, sp.target); this.spots.push(sp); }
      const len = from.distanceTo(to), cone = new THREE.Mesh(new THREE.ConeGeometry(Math.tan(0.2) * len, len, 24, 1, true), this.coneMat);
      cone.geometry.translate(0, -len / 2, 0); cone.geometry.rotateX(-Math.PI / 2); cone.position.copy(from); cone.lookAt(to); this.group.add(cone); this.cones.push(cone);
      const g = new THREE.CylinderGeometry(0.35, 0.45, 0.4, 12); g.translate(from.x, from.y + 0.2, from.z); rig.push(g);
    });
    this.group.add(new THREE.Mesh(mergeGeometries(rig), new THREE.MeshBasicMaterial({ color: '#fff8e6', toneMapped: false })));
    this.skylightMat = new THREE.MeshBasicMaterial({ color: '#cfe3ff', transparent: true, opacity: 0, toneMapped: false, side: THREE.DoubleSide });
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), this.skylightMat); sky.rotation.x = Math.PI / 2; sky.position.y = this.roofY + 1.95; this.group.add(sky);
    this.setTimeOfDay(2);
  }
  // 'normal' (partido) o 'show' (apagón parcial para la presentación: conos intensos que barren la cancha)
  setLights(mode) {
    this.mode = mode === 'show' ? 'show' : 'normal';
    const show = this.mode === 'show', k = [1.25, 1.05, 0.9][this.tod];
    this.hemi.intensity = (show ? 0.25 : 1.7) * k; this.key.intensity = (show ? 0.35 : 2.8) * k; this.fill.intensity = show ? 0.15 : 0.9 * k;
    this.coneMat.opacity = show ? 0.1 : [0.006, 0.014, 0.022][this.tod];
    this.spots.forEach(s => { s.intensity = show ? 140 : [25, 45, 60][this.tod]; if (!show) s.target.position.set(s.position.x / 1.4, 0, s.position.z / 2.2); });
    if (this.suiteMat) this.suiteMat.color.setScalar(show ? 0.35 : 1);
    if (this.scene.fog) this.scene.fog.color.set(show ? '#040608' : ['#1a222c', '#101820', '#0b131b'][this.tod]);
  }
  // 0 = día (lucernas abiertas), 1 = tarde, 2 = noche
  setTimeOfDay(k) {
    this.tod = Math.max(0, Math.min(2, k | 0)); this.skylightMat.opacity = [0.85, 0.35, 0][this.tod];
    this.hemi.color.set(['#eef4ff', '#ffe7cc', '#f8eee0'][this.tod]); this.key.color.set(['#ffffff', '#ffdcb0', '#fff4dc'][this.tod]);
    this.setLights(this.mode);
  }
  // el público salta: team 0 = local, 1 = visitante
  cheer(team = 0, strength = 1) { const i = team ? 1 : 0; this.cheerLevel[i] = Math.max(this.cheerLevel[i], strength); }

  // ------------------------------------------------------------------ por cuadro
  update(sim) {
    this.t += 1 / 60;
    if (sim.teams && sim.teams.length > 1) this.setTeamColors(sim.teams[0].color, sim.teams[1].color);
    const ev = sim.events && sim.events[0];
    if (ev && ev.id !== this.lastEventId) {
      const fresh = this.lastEventId !== null; this.lastEventId = ev.id;
      if (fresh && ev.type === 'score') {
        const hoop = (sim.ball?.x || 0) < 0 ? 0 : 1; this.flash[hoop] = 1.6; this.swish[hoop] = 1;
        this.cheer(ev.team ?? 0, /TRIPLE/.test(ev.text || '') ? 1.2 : 1);
      }
    }
    for (let i = 0; i < 2; i++) {
      this.flash[i] = Math.max(0, this.flash[i] - 1 / 60); this.boardLeds[i].color.set(this.flash[i] > 0 && (this.t * 8 | 0) % 2 ? '#ff2a1a' : '#2a0b0b');
      this.cheerLevel[i] = Math.max(0, this.cheerLevel[i] - 1 / 60 / 3.5);
    }
    this.crowdUniforms.uTime.value = this.t; this.crowdUniforms.uCheer.value.set(Math.min(1, this.cheerLevel[0]), Math.min(1, this.cheerLevel[1]));
    // red: estirón al entrar la pelota y leve vaivén con la pelota cerca
    this.nets.forEach((n, i) => {
      const s = this.swish[i]; this.swish[i] = Math.max(0, s - 1 / 60 * 1.4);
      const b = sim.ball, near = b && Math.abs(b.x - (i ? 12.425 : -12.425)) < 0.6 && Math.abs(b.z) < 0.6 && b.y < 3.4 && b.y > 2.2 ? 1 : 0;
      if (s <= 0 && !near && !n.dirty) return; n.dirty = s > 0 || near;
      const p = n.mesh.geometry.attributes.position, base = n.base, k = Math.sin((1 - s) * Math.PI) * s, sway = Math.sin(this.t * 22) * 0.02 * (s + near * 0.4);
      for (let v = 0; v < p.count; v++) {
        const t = -base[v * 3 + 1] / 0.42;
        p.setXYZ(v, base[v * 3] * (1 + k * 0.35 * t) + sway * t, base[v * 3 + 1] * (1 + k * 0.45), base[v * 3 + 2] * (1 + k * 0.35 * t) + sway * 0.6 * t);
      }
      p.needsUpdate = true;
    });
    this.slow = (this.slow || 0) + 1;
    if (this.slow % 15 === 1) {
      const sc = String(Math.max(0, Math.ceil(sim.shotClock ?? 24)));
      for (const c of this.shotClocks) if (c.last !== sc) { c.last = sc; const x = c.canvas.getContext('2d'); x.fillStyle = '#050505'; x.fillRect(0, 0, 128, 64); x.fillStyle = '#ff5a2a'; x.font = '900 54px Arial'; x.textAlign = 'center'; x.fillText(sc, 64, 54); c.tex.needsUpdate = true; }
      this.drawScoreboard(sim);
    }
    for (const l of this.ledTextures) l.tex.offset.x = (l.tex.offset.x + l.speed / 60) % 1;
    if (this.dolly && sim.ball) this.dolly.position.x += (Math.max(-11, Math.min(11, sim.ball.x)) - this.dolly.position.x) * 0.03;
    if (this.mode === 'show') this.spots.forEach((s, i) => s.target.position.set(Math.sin(this.t * 0.7 + i * 1.7) * 11, 0, Math.cos(this.t * 0.9 + i) * 6));
  }
}
