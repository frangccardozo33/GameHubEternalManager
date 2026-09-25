import * as THREE from 'three';
import {createPlayer,AnimationController} from './animation.js';
import {CameraController} from './camera.js';
import {Random} from '../sim/math.js';

export class StadiumView {
  constructor(container,teams) {
    this.container=container;this.teams=teams;this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#334847');this.scene.fog=new THREE.Fog('#334847',160,300);
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.28;
    container.prepend(this.renderer.domElement);
    this.camera=new THREE.PerspectiveCamera(42,1,.1,400);this.cameraController=new CameraController(this.camera);this.animation=new AnimationController();this.meshes=new Map();this.debugGroup=new THREE.Group();this.scene.add(this.debugGroup);
    this.scene.add(new THREE.HemisphereLight('#dce9f2','#465c39',2.3));
    const sun=new THREE.DirectionalLight('#ffedd1',3.1);sun.position.set(-35,90,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-80,right:80,top:110,bottom:-90,far:220});sun.shadow.bias=-.0006;this.scene.add(sun);sun.target.position.set(0,0,45);this.scene.add(sun.target);
    this.buildStadium();
    const ballGeo=new THREE.SphereGeometry(.24,12,8);ballGeo.scale(.75,.75,1.5);this.ball=new THREE.Mesh(ballGeo,new THREE.MeshStandardMaterial({color:'#713f24',roughness:.87}));this.ball.castShadow=true;this.scene.add(this.ball);
    const lace=new THREE.Mesh(new THREE.BoxGeometry(.045,.045,.28),new THREE.MeshBasicMaterial({color:'#e9dbbb'}));lace.position.y=.17;this.ball.add(lace);
    this.ballRing=new THREE.Mesh(new THREE.RingGeometry(.5,.61,32),new THREE.MeshBasicMaterial({color:'#fff1b0',transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));this.ballRing.rotation.x=-Math.PI/2;this.scene.add(this.ballRing);
    this.losLine=this.fieldLine('#58bfee');this.firstLine=this.fieldLine('#f5d365');
    this.marker=this.box(.35,3,.25,'#ed7736',28,1.5,35);this.box(.9,.9,.18,'#ee9e47',28,3.3,35,this.marker,true);
    this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();
    container.addEventListener('pointermove',e=>this.pick(e));container.addEventListener('pointerleave',()=>document.querySelector('#player-label').classList.add('hidden'));
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();
  }
  box(w,h,d,color,x,y,z,parent=this.scene,local=false) { const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.93}));mesh.position.set(local?0:x,local?1.8:y,local?0:z);mesh.receiveShadow=true;parent.add(mesh);return mesh; }
  fieldLine(color) { const mesh=new THREE.Mesh(new THREE.PlaneGeometry(53.3,.14),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.82,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.position.y=.075;this.scene.add(mesh);return mesh; }
  textureCanvas(teams=this.teams) {
    const c=document.createElement('canvas');c.width=1024;c.height=2304;const ctx=c.getContext('2d'),sx=c.width/53.3,sz=c.height/120;
    ctx.fillStyle='#316a3e';ctx.fillRect(0,0,c.width,c.height);
    for(let z=0;z<100;z+=5) {ctx.fillStyle=z%10===0?'#397e47':'#347343';ctx.fillRect(0,(z+10)*sz,c.width,5*sz);}
    const rng=new Random(77);
    for(let i=0;i<90000;i++) {ctx.fillStyle=rng.chance(.5)?'#e2efbc0a':'#071c160b';ctx.fillRect(rng.next()*1024,rng.next()*2304,2,3);}
    ctx.fillStyle=teams?.[0]?.dark??'#193c4a';ctx.fillRect(0,0,1024,10*sz);ctx.fillStyle=teams?.[1]?.dark??'#563c2b';ctx.fillRect(0,110*sz,1024,10*sz);
    ctx.strokeStyle='#e6efd4';ctx.lineWidth=3;ctx.strokeRect(3,3,1018,2298);
    for(let z=0;z<=100;z+=5) {const y=(z+10)*sz;ctx.lineWidth=z%10===0?2.9:1.6;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1024,y);ctx.stroke();}
    for(let z=1;z<100;z++) {if(z%5===0)continue;const y=(z+10)*sz;for(const x of [1.5,23.6,29.7,51.8]) {ctx.fillStyle='#ecf1da';ctx.fillRect(x*sx,y,.75*sx,1.6);}}
    ctx.fillStyle='#f0f2d6';ctx.font='600 48px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
    for(let z=10;z<100;z+=10) {const num=String(Math.min(z,100-z)),y=(z+10)*sz;ctx.save();ctx.translate(7*sx,y);ctx.rotate(-Math.PI/2);ctx.fillText(num,0,0);ctx.restore();ctx.save();ctx.translate(46.3*sx,y);ctx.rotate(Math.PI/2);ctx.fillText(num,0,0);ctx.restore();}
    ctx.font='bold 105px Arial';ctx.fillStyle='#c5dde1';ctx.fillText((teams?.[0]?.mascot??'WOLVES').split('').join(' '),512,5*sz);ctx.fillStyle='#dfc5a7';ctx.save();ctx.translate(512,115*sz);ctx.rotate(Math.PI);ctx.fillText((teams?.[1]?.mascot??'OUTLAWS').split('').join(' '),0,0);ctx.restore();
    ctx.save();ctx.translate(512,60*sz);ctx.rotate(-Math.PI/2);ctx.fillStyle='#e8eee2';ctx.strokeStyle='#1f4534';ctx.lineWidth=9;ctx.font='bold italic 128px Arial';ctx.strokeText('G',0,0);ctx.fillText('G',0,0);ctx.restore();
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=this.renderer.capabilities.getMaxAnisotropy();return texture;
  }
  buildStadium() {
    this.box(180,.8,200,'#263a34',0,-.55,50);
    this.box(66,.12,131,'#ccd0ba',0,-.07,50);
    this.fieldMaterial=new THREE.MeshStandardMaterial({map:this.textureCanvas(),roughness:1});const field=new THREE.Mesh(new THREE.PlaneGeometry(53.3,120),this.fieldMaterial);field.rotation.x=-Math.PI/2;field.position.set(0,.015,50);field.receiveShadow=true;this.scene.add(field);
    for(const sign of [-1,1]) {
      this.box(2,.3,131,'#273c37',sign*34,.1,50);
      for(let r=0;r<12;r++) this.box(2.3,1.2,146,r%3===0?'#31434c':'#283c46',sign*(38+r*2),r*1.1+1,50);
      for(let r=0;r<9;r++) this.box(76+r*3,1.2,2.2,r%3===0?'#34464b':'#293e46',0,r*1.1+1,sign===1?118+r*2:-18-r*2);
      this.box(1,1.5,144,'#11252c',sign*36,.9,50);
      for(let z=4;z<101;z+=12) {
        this.box(1.6,.6,6,'#5a6b6d',sign*30,.6,z);
        this.box(.6,.35,5,'#d6d4c2',sign*30,1,z);
      }
    }
    // Instanced low-poly spectators: deterministic crowd, inexpensive draw calls.
    const rng=new Random(891),count=4500;
    const crowd=new THREE.InstancedMesh(new THREE.BoxGeometry(.48,.7,.4),new THREE.MeshStandardMaterial({roughness:1}),count);
    const dummy=new THREE.Object3D(),colors=['#728289','#617276','#31516a','#aeb1a1','#526973','#ae7960','#1d303d'];
    for(let i=0;i<count;i++) {
      const side=i%2===0?1:-1,row=Math.floor(rng.next()*12),z=rng.range(-20,120),x=side*(38+row*2);
      dummy.position.set(x+rng.range(-.5,.5),row*1.1+2,z);dummy.scale.setScalar(rng.range(.75,1.15));dummy.updateMatrix();crowd.setMatrixAt(i,dummy.matrix);crowd.setColorAt(i,new THREE.Color(rng.pick(colors)));
    }
    this.scene.add(crowd);
    for(const z of [-10,110]) {
      const mat=new THREE.MeshStandardMaterial({color:'#f8ce4f',metalness:.35,roughness:.45});
      const pole=(r,h,x,y,zz,rot=0)=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,10),mat);p.position.set(x,y,zz);p.rotation.z=rot;p.castShadow=true;this.scene.add(p);};
      pole(.16,3.35,0,1.67,z);pole(.12,6.1,0,3.35,z,Math.PI/2);pole(.095,7,3.05,6.85,z);pole(.095,7,-3.05,6.85,z);
      this.box(.58,1.5,.58,'#273440',0,.75,z);
    }
    for(const z of [0,100]) for(const x of [-26.6,26.6]) this.box(.21,.7,.21,'#ff7949',x,.35,z);
    for(const x of [-28.5,28.5]) for(const z of [15,40,65,90]) {
      const ref=createPlayer({color:'#e4e3db',dark:'#17212c'},'CB',0);ref.position.set(x,0,z);ref.scale.setScalar(.9);this.scene.add(ref);
      for(let i=-2;i<=2;i++) {const stripe=new THREE.Mesh(new THREE.BoxGeometry(.045,.64,.495),new THREE.MeshStandardMaterial({color:'#222b30'}));stripe.position.set(i*.14,1.13,0);ref.userData.rig.add(stripe);}
    }
    for(const x of [-45,45]) for(const z of [-10,110]) {
      this.box(.8,35,.8,'#77858c',x,17.5,z);const lamp=this.box(9,2,.7,'#ecf3dd',x,35,z);lamp.material.emissive=new THREE.Color('#dfe8d6');lamp.material.emissiveIntensity=.4;
    }
  }
  setTeams(teams) { this.teams=teams;this.rosterKey=null;const old=this.fieldMaterial.map;this.fieldMaterial.map=this.textureCanvas(teams);this.fieldMaterial.needsUpdate=true;old?.dispose(); }
  resize() { const {clientWidth:w,clientHeight:h}=this.container;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix(); }
  syncPlayers(snapshot) {
    const key=snapshot.players.map(p=>`${p.id}:${p.role}:${p.number}`).join(',')+snapshot.offense;
    if(key===this.rosterKey)return;
    for(const root of this.meshes.values()) {this.scene.remove(root);this.animation.dispose(root);}this.meshes.clear();
    for(const p of snapshot.players) {const team=this.teams[p.side==='O'?snapshot.offense:1-snapshot.offense];const root=createPlayer(team,p.role,p.number);root.userData.id=p.id;this.meshes.set(p.id,root);this.scene.add(root);}
    this.rosterKey=key;
  }
  debug(sim,enabled) {
    if(this.debugKey===`${sim.playNumber}:${enabled}`)return;this.debugKey=`${sim.playNumber}:${enabled}`;
    while(this.debugGroup.children.length) {const item=this.debugGroup.children[0];item.geometry.dispose();item.material.dispose();this.debugGroup.remove(item);}
    if(!enabled)return;
    for(const p of sim.players) {
      const a=p.assignment;let points=[];
      if(a.points) points=[p.start,...a.points];
      else if(a.target) {const t=sim.players.find(d=>d.id===a.target);if(t)points=[p.start,t.start];}
      else if(a.zone) points=Array.from({length:33},(_,i)=>({x:a.zone.x+Math.sin(i/32*Math.PI*2)*a.zone.radius,z:a.zone.z+Math.cos(i/32*Math.PI*2)*a.zone.radius}));
      if(points.length) {const geo=new THREE.BufferGeometry().setFromPoints(points.map(q=>new THREE.Vector3(q.x,.14,q.z)));this.debugGroup.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:p.side==='O'?'#87d7fa':'#ffc481',transparent:true,opacity:.6,depthWrite:false})));}
    }
  }
  update(snapshot,dt,started) {
    this.latest=snapshot;this.syncPlayers(snapshot);
    for(const p of snapshot.players) {const root=this.meshes.get(p.id);root.position.set(p.x,0,p.z);root.rotation.y=p.heading;root.userData.player=p;this.animation.update(root,p,snapshot.liveTime,dt,snapshot.ball);}
    this.ball.position.set(snapshot.ball.x,snapshot.ball.y,snapshot.ball.z);this.ball.rotation.x=snapshot.liveTime*16;this.ball.rotation.z=snapshot.ball.mode==='flight'?.3:0;
    this.ballRing.position.set(snapshot.ball.x,.1,snapshot.ball.z);this.ballRing.scale.setScalar(snapshot.ball.mode==='flight'?.8:1);
    this.losLine.position.z=snapshot.los;this.firstLine.position.z=Math.min(100,snapshot.lineToGain);this.marker.position.z=Math.min(100,snapshot.lineToGain);
    this.cameraController.update(snapshot,dt,started);this.renderer.render(this.scene,this.camera);
  }
  pick(event) {
    const bounds=this.container.getBoundingClientRect();this.pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);
    this.raycaster.setFromCamera(this.pointer,this.camera);const hits=this.raycaster.intersectObjects([...this.meshes.values()],true);const label=document.querySelector('#player-label');
    if(!hits.length){label.classList.add('hidden');return;}
    let root=hits[0].object;while(root.parent&&!root.userData.player)root=root.parent;
    const p=root.userData.player;if(!p)return;label.textContent=`#${p.number} ${p.name||p.id} · ${p.role}${p.ovr?` · OVR ${p.ovr}`:''} / ${p.state}`;label.style.left=`${Math.min(bounds.width-220,Math.max(8,event.clientX-bounds.left+12))}px`;label.style.top=`${event.clientY-bounds.top-30}px`;label.classList.remove('hidden');
  }
}
