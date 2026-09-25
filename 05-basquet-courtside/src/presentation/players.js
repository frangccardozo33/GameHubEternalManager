import * as THREE from 'three';
import { canvasTexture, material } from './arena.js';
import { clamp } from '../simulation/model.js';
const UP = new THREE.Vector3(0, 1, 0);
const vector = (x, y, z) => new THREE.Vector3(x, y, z);
const cylinder = new THREE.CylinderGeometry(1, 1, 1, 9);
const sphere = new THREE.SphereGeometry(1, 12, 10);

function mesh(parent, geometry, mat, scale, position) {
  const object = new THREE.Mesh(geometry, mat); object.scale.set(...scale); object.position.set(...position);
  object.castShadow = true; parent.add(object); return object;
}
function segment(parent, mat, radius) {
  const part = mesh(parent, cylinder, mat, [radius, 1, radius], [0, 0, 0]);
  part.userData.radius = radius; return part;
}
function connect(part, start, end) {
  part.position.copy(start).add(end).multiplyScalar(0.5);
  const delta = end.clone().sub(start); part.scale.y = delta.length();
  part.quaternion.setFromUnitVectors(UP, delta.normalize());
}
// Two-bone analytical IK, with an explicit elbow/knee pole to avoid limb inversion.
function solveJoint(root, target, lengthA, lengthB, pole) {
  const delta = target.clone().sub(root), length = clamp(delta.length(), 0.02, lengthA + lengthB - 0.005);
  const axis = delta.normalize();
  const bend = pole.clone().sub(axis.clone().multiplyScalar(pole.dot(axis))).normalize();
  const along = (lengthA * lengthA - lengthB * lengthB + length * length) / (2 * length);
  return root.clone().add(axis.multiplyScalar(along)).add(bend.multiplyScalar(Math.sqrt(Math.max(0, lengthA * lengthA - along * along))));
}

export class AnimationController {
  constructor(player, color, referee = false) {
    this.player = player; this.root = new THREE.Group(); this.body = new THREE.Group(); this.root.add(this.body);
    this.phase = player.index * 0.7; this.blend = 0; this.jump = 0;
    const skin = material(['#b98257', '#65422f', '#d4a47d', '#986144', '#52382c'][(player.skin ?? player.index) % 5]);
    const jersey = material(referee ? '#d7e0dd' : color);
    const trim = material(referee ? '#17282f' : player.team ? '#e9e7d8' : '#22313a');
    const shoes = material(player.team ? '#e4e5df' : '#27333a');
    this.torso = mesh(this.body, new THREE.CylinderGeometry(0.245, 0.19, 0.57, 10), jersey, [1, 1, 0.68], [0, 1.27, 0]);
    mesh(this.body, cylinder, skin, [0.082, 0.13, 0.082], [0, 1.61, 0]);
    this.head = mesh(this.body, sphere, skin, [0.145, 0.185, 0.145], [0, 1.8, 0]);
    mesh(this.body, new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.51), material('#231d1b'), [0.15, player.index % 3 === 0 ? 0.205 : 0.18, 0.15], [0, 1.84, -0.008]);
    mesh(this.body, sphere, skin, [0.04, 0.045, 0.05], [0, 1.79, 0.14]);
    for (const side of [-1, 1]) mesh(this.body, sphere, material('#211c1b'), [0.013, 0.011, 0.009], [side * 0.052, 1.84, 0.133]);
    this.arms = []; this.legs = [];
    for (const side of [-1, 1]) {
      mesh(this.body, sphere, skin, [0.104, 0.11, 0.11], [side * 0.245, 1.47, 0]);
      this.arms.push({ upper: segment(this.body, skin, 0.075), lower: segment(this.body, skin, 0.06), hand: mesh(this.body, sphere, skin, [0.055, 0.078, 0.035], [0, 0, 0]), side, handTarget: vector(side * 0.3, 0.95, 0) });
      mesh(this.body, new THREE.CylinderGeometry(0.14, 0.145, 0.32, 9), jersey, [1, 1, 0.9], [side * 0.12, 0.91, 0]);
      this.legs.push({ upper: segment(this.body, skin, 0.092), lower: segment(this.body, skin, 0.069), sock: segment(this.body, trim, 0.073), foot: mesh(this.body, new THREE.BoxGeometry(0.16, 0.12, 0.32), shoes, [1, 1, 1], [0, 0, 0]), side });
    }
    if (!referee) {
      const texture = canvasTexture(128, 128, (c, w, h) => {
        c.clearRect(0, 0, w, h); c.fillStyle = player.numberColor ?? (player.team ? '#163a42' : '#fff2df'); c.textAlign = 'center';
        c.font = 'bold 65px Arial'; c.fillText(player.number, w / 2, 88); c.font = 'bold 15px Arial'; c.fillText(player.teamLabel ?? (player.team ? 'WAVES' : 'FOXES'), w / 2, 26);
      });
      for (const side of [-1, 1]) {
        const number = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.33), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }));
        number.position.set(0, 1.28, side * 0.168); number.rotation.y = side === 1 ? 0 : Math.PI; this.body.add(number);
      }
    }
    this.root.scale.setScalar(player.height / 1.99);
    this.root.position.set(player.x, 0, player.z);
  }
  update(sim, dt, bench = false) {
    const p = this.player, speed = Math.hypot(p.vx, p.vz);
    this.phase += speed * dt * 2.4;
    const defensive = ['defense', 'help', 'closeout'].includes(p.state);
    const actionProgress = p.actionDuration ? 1 - p.actionTime / p.actionDuration : 0;
    const jumping = ['shoot', 'layup', 'dunk', 'contest', 'rebound', 'block'].includes(p.action) && p.actionTime > 0;
    const targetJump = jumping ? Math.sin(actionProgress * Math.PI) * (p.action === 'dunk' ? 0.75 : p.action === 'layup' ? 0.48 : 0.32) : 0;
    this.jump += (targetJump - this.jump) * Math.min(1, dt * 18);
    const crouch = defensive ? 0.12 : p.state === 'drive' ? 0.08 : 0;
    this.root.position.set(p.x, this.jump, p.z); this.root.rotation.y = p.facing;
    this.body.position.y = -crouch + Math.abs(Math.sin(this.phase)) * Math.min(0.035, speed * 0.006);
    this.body.rotation.x = Math.min(speed * 0.022, 0.1);
    this.body.rotation.z = p.action === 'crossover' ? Math.sin(actionProgress * Math.PI * 2) * 0.12 : -p.contact * 0.08;
    this.root.updateMatrixWorld(true);
    const stride = Math.min(speed / 6, 1) * 0.55;
    for (const leg of this.legs) {
      const phase = this.phase + (leg.side === 1 ? Math.PI : 0);
      const foot = vector(leg.side * (defensive ? 0.24 : 0.12), 0.09 + Math.max(0, Math.sin(phase)) * stride * 0.5, Math.cos(phase) * stride);
      if (bench) foot.set(leg.side * 0.16, 0.08, 0.38);
      const hip = vector(leg.side * 0.12, bench ? 0.58 : 0.88 - crouch * 0.3, 0);
      const knee = solveJoint(hip, foot, 0.42, 0.42, vector(0, 0, 1));
      connect(leg.upper, hip, knee); connect(leg.lower, knee, foot);
      connect(leg.sock, foot.clone().lerp(knee, 0.38), foot);
      leg.foot.position.copy(foot); leg.foot.position.z += 0.08;
    }
    for (const arm of this.arms) {
      const shoulder = vector(arm.side * 0.255, 1.47, 0);
      let target = vector(arm.side * 0.31, 1.03, -Math.cos(this.phase + arm.side * 1.57) * stride * 0.55 + 0.15);
      if (defensive) target.set(arm.side * 0.58, 1.34, 0.22);
      if (p.state === 'screen') target.set(arm.side * 0.19, 1.17, 0.25);
      if (['shoot', 'freeThrow', 'layup', 'dunk', 'contest', 'block', 'rebound'].includes(p.action)) {
        const lift = Math.sin(Math.min(1, actionProgress * 2) * Math.PI / 2);
        target.set(arm.side * 0.16, 1.5 + lift * 0.64, 0.25);
      }
      if (p.action === 'pass' || p.action === 'catch') target.set(arm.side * 0.18, 1.38, 0.53);
      if (sim.ball.owner === p && (p.hand === arm.side || sim.pendingAction)) {
        const ballTarget = this.body.worldToLocal(vector(sim.ball.x, sim.ball.y + 0.05, sim.ball.z));
        // Do not stretch the arm through the floor: the hand releases at the top of the bounce.
        ballTarget.y = Math.max(ballTarget.y, 0.96); target = ballTarget;
      }
      arm.handTarget.lerp(target, Math.min(1, dt * 16));
      const delta = arm.handTarget.clone().sub(shoulder);
      if (delta.length() > 0.63) arm.handTarget.copy(shoulder).add(delta.setLength(0.63));
      const elbow = solveJoint(shoulder, arm.handTarget, 0.32, 0.32, vector(arm.side, -0.4, -0.3));
      connect(arm.upper, shoulder, elbow); connect(arm.lower, elbow, arm.handTarget); arm.hand.position.copy(arm.handTarget);
    }
  }
}

export function createBall() {
  const texture = canvasTexture(512, 256, (c, w, h) => {
    c.fillStyle = '#d6742b'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) for (let x = 0; x < w; x += 4) {
      c.fillStyle = (x + y) % 12 ? '#bc612a' : '#e08a3d'; c.fillRect(x, y, 1, 1);
    }
    c.strokeStyle = '#35251b'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke();
    for (const x of [0, 128, 256, 384, 512]) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (const shift of [0, 256]) { c.beginPath(); for (let y = 0; y <= h; y++) { const x = shift + 128 + Math.sin(y / h * Math.PI * 2) * 80; if (!y) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); }
  });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.125, 24, 18), material('#ffffff', { map: texture, roughness: 0.87 }));
  ball.castShadow = true; return ball;
}
