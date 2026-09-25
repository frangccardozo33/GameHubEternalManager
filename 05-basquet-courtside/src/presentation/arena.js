import * as THREE from 'three';
import { Random } from '../simulation/model.js';

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
function line(parent, points, color = 0xf6eee2) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
  const mesh = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color })); parent.add(mesh); return mesh;
}
function label(parent, text, x, y, z, w, h, color = '#edece6', background = '#17272d') {
  const texture = canvasTexture(1024, 128, (c, W, H) => {
    c.fillStyle = background; c.fillRect(0, 0, W, H); c.fillStyle = color;
    c.font = 'bold 52px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, W / 2, H / 2);
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
  mesh.position.set(x, y, z); parent.add(mesh); return mesh;
}

export class Arena {
  constructor(scene) {
    this.group = new THREE.Group(); scene.add(this.group); this.nets = [];
    this.buildCourt(); this.buildHoops(); this.buildStands(); this.buildBenches(); this.buildLighting(scene);
  }
  buildCourt() {
    const random = new Random(882);
    const texture = canvasTexture(2240, 1200, (c, w, h) => {
      c.fillStyle = '#c89c65'; c.fillRect(0, 0, w, h);
      for (let row = 0; row < 60; row++) for (let col = -1; col < 15; col++) {
        const x = col * 170 + (row % 2) * 85, y = row * 20;
        const light = random.range(57, 72);
        c.fillStyle = `hsl(34, 46%, ${light}%)`; c.fillRect(x, y, 169.4, 19.5);
        c.strokeStyle = `rgba(100,65,27,${random.range(0.04, 0.12)})`; c.lineWidth = 0.6;
        for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(x + 5, y + i * 3); c.bezierCurveTo(x + 45, y + i * 3 + 3, x + 90, y + i * 3 - 2, x + 165, y + i * 3); c.stroke(); }
      }
      c.save(); c.translate(w / 2, h / 2); c.scale(80, 80);
      c.lineWidth = 0.055; c.strokeStyle = '#f5ead8';
      c.strokeRect(-13.94, -7.44, 27.88, 14.88);
      c.beginPath(); c.moveTo(0, -7.45); c.lineTo(0, 7.45); c.stroke();
      for (const dir of [-1, 1]) {
        c.save(); c.scale(dir, 1);
        c.fillStyle = '#315c61'; c.fillRect(8.2, -2.45, 5.72, 4.9); c.strokeRect(8.2, -2.45, 5.72, 4.9);
        c.beginPath(); c.arc(8.2, 0, 1.8, Math.PI / 2, Math.PI * 1.5); c.stroke();
        c.save(); c.setLineDash([0.18, 0.18]); c.beginPath(); c.arc(8.2, 0, 1.8, -Math.PI / 2, Math.PI / 2); c.stroke(); c.restore();
        c.beginPath(); c.arc(12.425, 0, 1.25, Math.PI / 2, Math.PI * 1.5); c.stroke();
        const a = Math.asin(6.6 / 6.75), cross = 12.425 - Math.sqrt(6.75 ** 2 - 6.6 ** 2);
        c.beginPath(); c.moveTo(13.95, -6.6); c.lineTo(cross, -6.6); c.arc(12.425, 0, 6.75, Math.PI + a, Math.PI - a, true); c.lineTo(13.95, 6.6); c.stroke();
        for (const x of [9.1, 10.05, 11, 11.95]) { c.beginPath(); c.moveTo(x, -2.45); c.lineTo(x, -2.7); c.moveTo(x, 2.45); c.lineTo(x, 2.7); c.stroke(); }
        c.restore();
      }
      c.fillStyle = '#263b3d'; c.beginPath(); c.arc(0, 0, 1.8, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = '#ee7846';
      c.beginPath(); c.moveTo(-0.8, -0.8); c.lineTo(0.8, -0.8); c.lineTo(0.35, -0.26); c.lineTo(-0.15, -0.26); c.lineTo(-0.48, 0.18); c.lineTo(0.49, 0.18); c.lineTo(-0.16, 0.9); c.lineTo(-0.8, 0.9); c.closePath(); c.fill();
      c.fillStyle = '#465244'; c.font = 'bold 0.19px Arial'; c.textAlign = 'center'; c.fillText('B A S K E T B A L L', 0, 2.3);
      c.restore();
    });
    box(this.group, 34, 0.28, 21, 0, -0.2, 0, material('#18363c', { roughness: 0.45 }));
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 15), material('#ffffff', { map: texture, roughness: 0.32, metalness: 0.08 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.position.y = -0.048; this.group.add(floor);
    for (const x of [-15, 15]) {
      const word = label(this.group, 'L B O', x, -0.045, 0, 9.8, 0.9, '#f4eada', '#18363c');
      word.rotation.x = -Math.PI / 2; word.rotation.z = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    }
    const sideline = label(this.group, 'B A S K E T B A L L', 0, -0.04, 8.5, 6.5, 0.42, '#a8bdb7', '#18363c'); sideline.rotation.x = -Math.PI / 2;
    box(this.group, 80, 0.1, 60, 0, -0.55, 0, material('#080f15'));
  }
  buildHoops() {
    const dark = material('#12252c'), metal = material('#98a7aa', { metalness: 0.7, roughness: 0.3 });
    for (const dir of [-1, 1]) {
      const hoop = new THREE.Group(); this.group.add(hoop);
      box(hoop, 1.7, 0.65, 1.7, dir * 15.5, 0.2, 0, dark);
      const arm = box(hoop, 0.27, 3.5, 0.3, dir * 14.65, 1.95, 0, metal); arm.rotation.z = dir * -0.34;
      box(hoop, 1.3, 0.17, 0.2, dir * 13.65, 3.42, 0, metal);
      box(hoop, 0.09, 1.08, 1.83, dir * 12.97, 3.53, 0, new THREE.MeshPhysicalMaterial({ color: '#d9f1f2', transparent: true, opacity: 0.2, roughness: 0.08, side: THREE.DoubleSide, depthWrite: false }));
      for (const z of [-0.94, 0.94]) box(hoop, 0.11, 1.13, 0.045, dir * 12.97, 3.53, z, metal);
      for (const y of [2.98, 4.08]) box(hoop, 0.11, 0.045, 1.9, dir * 12.97, y, 0, metal);
      line(hoop, [[dir * 12.90, 3.04, -0.3], [dir * 12.90, 3.51, -0.3], [dir * 12.90, 3.51, 0.3], [dir * 12.90, 3.04, 0.3]]);
      box(hoop, 0.33, 0.07, 0.13, dir * 12.72, 3.05, 0, material('#e66532'));
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.022, 8, 32), material('#f17a39', { metalness: 0.25 }));
      rim.position.set(dir * 12.425, 3.05, 0); rim.rotation.x = Math.PI / 2; hoop.add(rim);
      const net = new THREE.Group(); net.position.set(dir * 12.425, 3.05, 0); hoop.add(net); this.nets.push(net);
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2, b = (i + 1) / 12 * Math.PI * 2;
        line(net, [[Math.cos(a) * 0.23, 0, Math.sin(a) * 0.23], [Math.cos(b) * 0.14, -0.4, Math.sin(b) * 0.14]], '#e3e4d6');
        line(net, [[Math.cos(b) * 0.23, 0, Math.sin(b) * 0.23], [Math.cos(a) * 0.14, -0.4, Math.sin(a) * 0.14]], '#e3e4d6');
      }
      box(hoop, 0.18, 0.45, 0.8, dir * 12.99, 4.47, 0, dark);
      const clock = label(hoop, '24', dir * 12.87, 4.48, 0, 0.75, 0.4, '#f79655', '#101617'); clock.rotation.y = -dir * Math.PI / 2;
    }
  }
  buildStands() {
    const random = new Random(921), dummy = new THREE.Object3D();
    const positions = [];
    for (const side of [-1, 1]) for (let row = 0; row < 7; row++) {
      const y = 0.4 + row * 0.54, z = side * (11.8 + row * 0.8);
      box(this.group, 37, 0.6, 0.8, 0, y - 0.35, z, material(row % 2 ? '#192128' : '#151f27'));
      for (let col = 0; col < 55; col++) if (col % 19 !== 0) positions.push({ x: (col - 27) * 0.64, y, z, rotation: side < 0 ? 0 : Math.PI });
    }
    for (const side of [-1, 1]) for (let row = 0; row < 5; row++) {
      const x = side * (18 + row * 0.8), y = 0.4 + row * 0.54;
      box(this.group, 0.8, 0.6, 23, x, y - 0.35, 0, material('#17232a'));
      for (let col = 0; col < 32; col++) positions.push({ x, y, z: (col - 15.5) * 0.68, rotation: -side * Math.PI / 2 });
    }
    const bodies = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.47, 0.24), material('#ffffff'), positions.length);
    const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 7, 6), material('#ffffff'), positions.length);
    const seats = new THREE.InstancedMesh(new THREE.BoxGeometry(0.49, 0.48, 0.18), material('#253b48'), positions.length);
    const shirts = ['#42646b', '#515d68', '#243947', '#af683e', '#d3c4a6', '#222f37', '#496278'];
    const skins = ['#8c6248', '#b48462', '#d2a985', '#614637'];
    positions.forEach((p, i) => {
      dummy.position.set(p.x, p.y + 0.43, p.z); dummy.rotation.set(0, p.rotation, 0); dummy.updateMatrix(); bodies.setMatrixAt(i, dummy.matrix); bodies.setColorAt(i, new THREE.Color(random.pick(shirts)));
      dummy.position.y = p.y + 0.81; dummy.updateMatrix(); heads.setMatrixAt(i, dummy.matrix); heads.setColorAt(i, new THREE.Color(random.pick(skins)));
      dummy.position.y = p.y + 0.29; dummy.position.z -= Math.cos(p.rotation) * 0.15; dummy.updateMatrix(); seats.setMatrixAt(i, dummy.matrix);
    });
    this.group.add(bodies, heads, seats);
    for (let i = -2; i <= 2; i++) {
      box(this.group, 6.9, 0.78, 0.22, i * 7.2, 0.35, -9.8, material('#0a151b'));
      label(this.group, i % 2 ? 'ETERNAL MANAGER' : 'L B O', i * 7.2, 0.38, -9.66, 6.8, 0.7, i % 2 ? '#c1d9d4' : '#ef8651', '#111e25');
    }
  }
  buildBenches() {
    const seat = material('#1c3540'), frame = material('#849b9e');
    for (const side of [-1, 1]) for (let i = 0; i < 7; i++) {
      const x = side * (5 + i * 0.82), z = -8.75;
      box(this.group, 0.54, 0.12, 0.5, x, 0.5, z, seat); box(this.group, 0.54, 0.63, 0.1, x, 0.78, z - 0.22, seat);
      box(this.group, 0.06, 0.5, 0.42, x - 0.2, 0.22, z, frame); box(this.group, 0.06, 0.5, 0.42, x + 0.2, 0.22, z, frame);
    }
    box(this.group, 5, 0.95, 0.9, 0, 0.46, -8.9, material('#182932'));
    label(this.group, 'LIGA DE BÁSQUET ONLINE', 0, 0.46, -8.43, 4.8, 0.8, '#dddac7', '#182932');
  }
  buildLighting(scene) {
    scene.add(new THREE.HemisphereLight('#f8eee0', '#273440', 2.2));
    const key = new THREE.DirectionalLight('#fff4dc', 3.1); key.position.set(-5, 20, 8);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -24; key.shadow.camera.right = 24;
    key.shadow.camera.top = 19; key.shadow.camera.bottom = -19; key.shadow.camera.near = 1; key.shadow.camera.far = 60;
    key.shadow.bias = -0.0005; key.shadow.normalBias = 0.035; scene.add(key);
    const fill = new THREE.DirectionalLight('#a4d8e1', 1.1); fill.position.set(12, 14, -12); scene.add(fill);
    for (const x of [-12, 0, 12]) {
      box(this.group, 5.5, 0.08, 0.22, x, 9, -15, new THREE.MeshBasicMaterial({ color: '#b0d5d8' }));
    }
  }
  update(sim) {
    for (let i = 0; i < this.nets.length; i++) {
      const net = this.nets[i];
      const active = sim.ball.mode === 'scored' && Math.sign(sim.ball.x) === (i === 0 ? -1 : 1);
      net.rotation.x = active ? Math.sin(sim.time * 25) * 0.08 : 0;
    }
  }
}
