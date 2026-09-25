import * as THREE from 'three';

const material = color => new THREE.MeshStandardMaterial({ color, roughness:.72 });
const geometries = { body:new THREE.BoxGeometry(.82,.65,.48), helmet:new THREE.SphereGeometry(.29,12,9), limb:new THREE.CylinderGeometry(.11,.095,.52,7), boot:new THREE.BoxGeometry(.2,.16,.38) };
const skin=material('#ae7f62'), pants=material('#e3e6e4'), boots=material('#13202a'), mask=material('#c5d0d6');
export function createPlayer(team,role,number) {
  const root=new THREE.Group(), rig=new THREE.Group(); root.add(rig);
  const shirt=material(team.color), helmetMat=material(team.dark);
  const mesh=(geo,mat,x,y,z,parent=rig)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;};
  const body=mesh(geometries.body,shirt,0,1.12,0);
  const shoulder=mesh(new THREE.BoxGeometry(1,.22,.5),shirt,0,1.34,0);
  const head=mesh(geometries.helmet,helmetMat,0,1.7,0);
  const stripe=mesh(new THREE.BoxGeometry(.08,.43,.5),shirt,0,1.76,0);
  const visor=mesh(new THREE.BoxGeometry(.38,.12,.06),boots,0,1.7,.255);
  const bar=mesh(new THREE.BoxGeometry(.42,.045,.1),mask,0,1.51,.3);
  const hips=mesh(new THREE.BoxGeometry(.58,.25,.4),pants,0,.74,0);
  const limbs=[];
  for(const side of [-1,1]) {
    const arm=new THREE.Group();arm.position.set(side*.48,1.31,0);rig.add(arm);mesh(geometries.limb,shirt,0,-.2,0,arm);
    const forearm=new THREE.Group();forearm.position.y=-.4;arm.add(forearm);mesh(geometries.limb,skin,0,-.13,.03,forearm).scale.y=.7;
    const leg=new THREE.Group();leg.position.set(side*.21,.7,0);rig.add(leg);mesh(geometries.limb,pants,0,-.2,0,leg);
    const shin=new THREE.Group();shin.position.y=-.38;leg.add(shin);mesh(geometries.limb,pants,0,-.12,0,shin).scale.y=.65;mesh(geometries.boot,boots,0,-.28,.08,shin);
    limbs.push({arm,forearm,leg,shin});
  }
  // Number texture is generated locally; no third-party assets are required.
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.font='bold 43px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(number,32,34);
  const numberMat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false});
  const front=new THREE.Mesh(new THREE.PlaneGeometry(.46,.46),numberMat);front.position.set(0,1.15,.246);rig.add(front);
  const back=front.clone();back.rotation.y=Math.PI;back.position.z=-.246;rig.add(back);
  const scale=['OL','DL'].includes(role)?1.13:role==='TE'?1.04:.98;root.scale.setScalar(scale);
  root.userData={rig,limbs,body,head,role,number,shirt,helmetMat,numberMat,texture:numberMat.map};
  return root;
}
export class AnimationController {
  update(root,p,time,dt,ball) {
    const {rig,limbs}=root.userData;
    const blend=1-Math.exp(-dt*12), moving=Math.min(1,p.speed/4), cadence=time*(5+p.speed*1.5)+p.number;
    const block=p.state.includes('block')||p.state==='engage';
    const stance=p.state==='stance';
    const tackle=p.state.includes('tackle')||p.state==='fall';
    const catchPose=['catch','track ball','interception','ball read'].includes(p.state);
    const targetLean=p.fallen?1.4:block?.35:stance?.25:p.state==='dropback'?-.12:moving*.12;
    rig.rotation.x=THREE.MathUtils.lerp(rig.rotation.x,targetLean,blend);
    rig.position.y=THREE.MathUtils.lerp(rig.position.y,p.fallen?-.05:stance?-.14:Math.abs(Math.sin(cadence))*.065*moving,blend);
    limbs.forEach((limb,i)=>{
      const wave=Math.sin(cadence+i*Math.PI)*moving;
      const armTarget=block?-1.05:catchPose?-1.5:p.state==='throw'&&i===1?-2.4:p.state==='stiff arm'&&i===0?-1.4:wave*.7-.15;
      limb.arm.rotation.x=THREE.MathUtils.lerp(limb.arm.rotation.x,armTarget,blend);
      limb.arm.rotation.z=THREE.MathUtils.lerp(limb.arm.rotation.z,(i===0?1:-1)*(block?.22:catchPose?.1:.07),blend);
      limb.forearm.rotation.x=block?-.5:catchPose?-.2:-.65;
      limb.leg.rotation.x=THREE.MathUtils.lerp(limb.leg.rotation.x,p.fallen?-.5:-wave*.7+(stance?-.35:0),blend);
      // Two-bone ground compensation: bend knee while the planted foot stays near turf.
      limb.shin.rotation.x=Math.max(0,wave)*.9+(stance?.6:0);
    });
    if(tackle&&p.fallen) rig.rotation.z=THREE.MathUtils.lerp(rig.rotation.z,.3,blend);
    else rig.rotation.z*=1-blend;
    if(catchPose&&ball) { const angle=Math.atan2(ball.x-p.x,ball.z-p.z)-p.heading; root.userData.head.rotation.y=THREE.MathUtils.clamp(angle,-.8,.8); }
  }
  dispose(root) { const data=root.userData;data.shirt.dispose();data.helmetMat.dispose();data.numberMat.dispose();data.texture.dispose();root.traverse(obj=>{if(obj.geometry&&!Object.values(geometries).includes(obj.geometry)) obj.geometry.dispose();}); }
}
