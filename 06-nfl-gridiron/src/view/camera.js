import * as THREE from 'three';
export class CameraController {
  constructor(camera) { this.camera=camera;this.mode='broadcast';this.focus=new THREE.Vector3(0,0,50);this.initial=true; }
  update(snapshot,dt,started) {
    const {ball,los}=snapshot;
    let center=THREE.MathUtils.clamp(los+8,8,95);
    if(['PLAY LIVE','BALL RESOLUTION','DEAD BALL','RESULT'].includes(snapshot.state)) center=THREE.MathUtils.lerp(los+6,ball.z,.7);
    const wide=this.mode==='wide'||!started;
    if(wide) center=50;
    const target=new THREE.Vector3(wide?0:ball.x*.15,0,center);
    const offset=this.mode==='close'&&started?new THREE.Vector3(35,30,19):wide?new THREE.Vector3(100,108,24):new THREE.Vector3(73,69,20);
    const blend=this.initial?1:1-Math.exp(-dt*2.4);
    this.focus.lerp(target,blend);this.camera.position.lerp(this.focus.clone().add(offset),blend);this.camera.lookAt(this.focus);this.initial=false;
  }
}
