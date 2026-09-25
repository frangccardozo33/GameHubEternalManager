import * as THREE from 'three';
import { Arena, canvasTexture } from './arena.js';
import { AnimationController, createBall } from './players.js';
import { Player, Random, clamp } from '../simulation/model.js';

export class CameraController {
  constructor(camera) { this.camera = camera; this.mode = 'broadcast'; this.focus = new THREE.Vector3(0, 0, 0); camera.position.set(1, 23, 28); }
  update(ball, dt, aspect, ready = false) {
    const mode = this.mode;
    const x = mode === 'wide' || ready ? 0 : clamp(ball.x * (mode === 'close' ? 0.85 : 0.38), -9, 9);
    const z = mode === 'close' ? ball.z * 0.3 : 0;
    const wide = mode === 'wide' || ready;
    const height = mode === 'close' ? 13.5 : wide ? 25 : 21;
    const depth = mode === 'close' ? 19 : wide ? 28 : 26;
    const portrait = Math.max(1, 1.55 / aspect);
    const desired = new THREE.Vector3(x + (mode === 'close' ? 3 : 0.8), height * portrait, depth * portrait);
    this.camera.position.lerp(desired, 1 - Math.exp(-dt * 2.5));
    this.focus.lerp(new THREE.Vector3(x, mode === 'close' ? 1 : 0, z), 1 - Math.exp(-dt * 3));
    this.camera.lookAt(this.focus);
  }
}

export class MatchView {
  constructor(container, sim) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.05;
    this.renderer.setClearColor('#0b131b'); container.prepend(this.renderer.domElement);
    this.renderer.domElement.setAttribute('aria-label', 'Simulación tridimensional de basketball cinco contra cinco');
    this.scene = new THREE.Scene(); this.scene.fog = new THREE.Fog('#0b131b', 44, 85);
    this.camera = new THREE.PerspectiveCamera(43, 1, 0.1, 150); this.cameraController = new CameraController(this.camera);
    this.arena = new Arena(this.scene);
    const shadowTexture = canvasTexture(64, 64, (c, w, h) => {
      const grad = c.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
      grad.addColorStop(0, 'rgba(0,0,0,.42)'); grad.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = grad; c.fillRect(0, 0, w, h);
    });
    this.shadowTexture = shadowTexture; this.buildRigs(sim);
    this.referees = [0, 1, 2].map(i => {
      const p = new Player(0, i, new Random(20)); p.height = 1.83; p.x = (i - 1) * 10; p.z = i === 1 ? -7.9 : 7.9;
      const rig = new AnimationController(p, '#d1d7d4', true); this.scene.add(rig.root); return rig;
    });
    this.ball = createBall(); this.scene.add(this.ball);
    this.ballShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.48), new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }));
    this.ballShadow.rotation.x = -Math.PI / 2; this.scene.add(this.ballShadow);
    this.halo = new THREE.Mesh(new THREE.RingGeometry(0.46, 0.5, 48), new THREE.MeshBasicMaterial({ color: '#ef9662', transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
    this.halo.rotation.x = -Math.PI / 2; this.scene.add(this.halo);
    this.debugLines = new THREE.Group(); this.scene.add(this.debugLines); this.debug = false;
    this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(container); this.resize();
  }
  // (Re)crea figuras, sombras y etiquetas para los equipos de la simulación actual (nombres, colores y plantillas propios).
  buildRigs(sim) {
    for (const rig of this.rigs?.values() ?? []) { this.scene.remove(rig.root); rig.root.traverse(o => { o.geometry?.dispose(); if (o.material) { o.material.map?.dispose(); o.material.dispose(); } }); }
    for (const shadow of this.shadows?.values() ?? []) { this.scene.remove(shadow); shadow.geometry.dispose(); shadow.material.dispose(); }
    for (const tag of this.labels?.values() ?? []) tag.remove();
    this.rigs = new Map(); this.shadows = new Map(); this.labels = new Map();
    for (const team of sim.teams) for (const p of team.roster) {
      const rig = new AnimationController(p, team.color); this.rigs.set(p.id, rig); this.scene.add(rig.root);
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({ map: this.shadowTexture, transparent: true, depthWrite: false }));
      shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.006; this.scene.add(shadow); this.shadows.set(p.id, shadow);
      const tag = document.createElement('div'); tag.className = 'player-tag'; tag.hidden = true; this.container.appendChild(tag); this.labels.set(p.id, tag);
    }
  }
  resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }
  update(sim, dt, replayFrame = null) {
    let view = sim;
    if (replayFrame) {
      view = Object.create(sim); view.time = replayFrame.time;
      view.ball = { ...replayFrame.ball, owner: null }; view.pendingAction = null;
    }
    for (const team of sim.teams) {
      let benchIndex = 0;
      for (const p of team.roster) {
        const rig = this.rigs.get(p.id);
        const history = replayFrame?.players.find(q => q.id === p.id);
        let active = replayFrame ? !!history : p.active;
        rig.player = history ? { ...p, ...history } : p;
        if (!active) {
          const q = { ...p, x: (team.id ? 1 : -1) * (5.8 + benchIndex++ * 0.82), z: -8.7, vx: 0, vz: 0, facing: 0, action: null, state: 'idle' };
          rig.player = q; rig.update(view, dt, true); rig.body.position.y = -0.3;
        } else {
          if (replayFrame?.ball.owner === p.id) view.ball.owner = rig.player;
          rig.update(view, dt);
        }
        const shadow = this.shadows.get(p.id); shadow.visible = active;
        shadow.position.x = rig.root.position.x; shadow.position.z = rig.root.position.z;
        const tag = this.labels.get(p.id);
        const show = active && (this.debug || sim.ball.owner === p);
        tag.hidden = !show;
        if (show) {
          const position = new THREE.Vector3(rig.player.x, 2.6, rig.player.z).project(this.camera);
          tag.style.left = `${(position.x * 0.5 + 0.5) * this.container.clientWidth}px`;
          tag.style.top = `${(-position.y * 0.5 + 0.5) * this.container.clientHeight}px`;
          tag.innerHTML = this.debug ? `<b>${p.number} ${p.name}</b><span>${rig.player.state} · ${Math.round(p.energy * 100)}%</span>` : `<b>${p.number}</b> ${p.name}`;
          tag.style.borderColor = team.color;
        }
      }
    }
    for (let i = 0; i < this.referees.length; i++) {
      const rig = this.referees[i], p = rig.player;
      const target = clamp(view.ball.x * 0.65 + (i - 1) * 6, -12.5, 12.5);
      p.vx = clamp((target - p.x) * 2, -4, 4); p.x += p.vx * dt;
      p.facing = Math.atan2(view.ball.x - p.x, view.ball.z - p.z); rig.update(view, dt);
    }
    this.ball.position.set(view.ball.x, Math.max(0.12, view.ball.y), view.ball.z);
    if (sim.phase !== 'ready') { this.ball.rotation.z += dt * 5; this.ball.rotation.x += dt * 2; }
    this.ballShadow.position.set(view.ball.x, 0.008, view.ball.z); this.ballShadow.material.opacity = 1 / (1 + view.ball.y * 0.16);
    this.halo.visible = !!view.ball.owner;
    if (view.ball.owner) { this.halo.position.set(view.ball.owner.x, 0.01, view.ball.owner.z); this.halo.material.color.set(sim.teams[view.ball.owner.team].color); }
    this.arena.update(view);
    this.cameraController.update(view.ball, Math.min(0.1, dt || 1 / 60), this.camera.aspect, sim.phase === 'ready');
    this.updateDebug(sim); this.renderer.render(this.scene, this.camera);
  }
  updateDebug(sim) {
    this.debugLines.visible = this.debug;
    if (!this.debug) return;
    while (this.debugLines.children.length) {
      const old = this.debugLines.children[0]; old.geometry.dispose(); old.material.dispose(); this.debugLines.remove(old);
    }
    for (const p of sim.players) {
      const geom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(p.x, 0.05, p.z), new THREE.Vector3(p.target.x, 0.05, p.target.z)]);
      this.debugLines.add(new THREE.Line(geom, new THREE.LineBasicMaterial({ color: sim.teams[p.team].color, transparent: true, opacity: 0.7 })));
    }
  }
}

export class ReplayBuffer {
  constructor() { this.frames = []; this.accumulator = 0; this.active = false; this.index = 0; }
  record(sim, dt) {
    this.accumulator += dt;
    if (this.accumulator < 0.1) return;
    this.accumulator = 0;
    const frame = sim.snapshot();
    frame.players = sim.players.map(p => ({ id: p.id, x: p.x, z: p.z, vx: p.vx, vz: p.vz, facing: p.facing, state: p.state, action: p.action, actionTime: p.actionTime, actionDuration: p.actionDuration }));
    this.frames.push(frame); if (this.frames.length > 120) this.frames.shift();
  }
  start() { if (this.frames.length < 15) return false; this.index = 0; this.active = true; return true; }
  step(dt) {
    this.index += dt * 5;
    if (this.index >= this.frames.length - 1) { this.active = false; return null; }
    const i = Math.floor(this.index), t = this.index - i, a = this.frames[i], b = this.frames[i + 1];
    const mix = (x, y) => x + (y - x) * t;
    return {
      ...a, time: mix(a.time, b.time),
      ball: { ...a.ball, x: mix(a.ball.x, b.ball.x), y: mix(a.ball.y, b.ball.y), z: mix(a.ball.z, b.ball.z) },
      players: a.players.map(p => {
        const q = b.players.find(o => o.id === p.id);
        if (!q) return p;
        const turn = Math.atan2(Math.sin(q.facing - p.facing), Math.cos(q.facing - p.facing));
        return { ...p, x: mix(p.x, q.x), z: mix(p.z, q.z), vx: mix(p.vx, q.vx), vz: mix(p.vz, q.vz), facing: p.facing + turn * t };
      }),
    };
  }
}
