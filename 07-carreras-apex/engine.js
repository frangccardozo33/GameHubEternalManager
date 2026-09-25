'use strict';
// ==========================================================================
// APEX GT3 MANAGER — race engine. World units = metres, time = seconds.
// Physics core is the original Autódromo engine; hooks below read the grid,
// track and weather from Career (game-data.js) instead of static arrays.
// ==========================================================================
if (!window.THREE) {
  document.getElementById('loading').textContent = 'No se pudo cargar Three.js. Revisá la conexión y recargá la página.';
  throw new Error('Three.js dependency unavailable');
}
const V3 = THREE.Vector3;
const CONFIG = { laps:4, carCount:10, trackWidth:17, fixedStep:1/60, strategy:'sprint' };
const TIRES = {
  S:{ name:'Soft', class:'soft', grip:1.045, wear:0.125 },
  M:{ name:'Medium', class:'medium', grip:1, wear:0.073 },
  H:{ name:'Hard', class:'hard', grip:0.978, wear:0.042 }
};
let CURRENT_TRACK = currentTrack(Career);
let CURRENT_WEATHER_KEY = 'CLEAR';
let CURRENT_WEATHER_GRIP = 1;
const state = { phase:'grid', elapsed:0, countdown:0, speed:1, paused:false, cars:[], order:[], grid:[], cameraMode:'auto', cameraShot:0, cameraTimer:0, focus:0, focusLocked:false, excitement:0, events:[], eventUntil:0, fastest:Infinity, fastestCarId:-1, finishes:[], dnfCars:[], lastBattle:-20, lastContact:-20, finishAt:0, poleCarId:-1, safetyCar:false, safetyCarEndsAt:0, vsc:false, vscEndsAt:0, redFlag:false, redFlagRealEndsAt:0 };

// --- Renderer and warm, late-afternoon atmosphere --------------------------
const renderer = new THREE.WebGLRenderer({ canvas:$('scene'), antialias:true, alpha:false, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.14;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb6c4bd);
scene.fog = new THREE.FogExp2(0xc3cbbb, .00075);
const camera = new THREE.PerspectiveCamera(46, 1, .3, 2400);
const hemi = new THREE.HemisphereLight(0xdde6e4, 0x747044, 2.2);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe5bc, 3.1);
sun.position.set(-160, 240, 110);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left:-130, right:130, top:130, bottom:-130, near:1, far:650 });
sun.shadow.bias = -.0004;
sun.shadow.normalBias = .08;
scene.add(sun, sun.target);

// Procedural texture generators keep assets original and the app portable.
let scenerySeed = 5721;
function sceneryRandom() { scenerySeed = (scenerySeed * 1664525 + 1013904223) >>> 0; return scenerySeed / 4294967296; }
function textureFromCanvas(width, height, draw) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return texture;
}
function noiseTexture(base, grain, size=256) {
  return textureFromCanvas(size, size, (ctx,w,h) => {
    ctx.fillStyle=base; ctx.fillRect(0,0,w,h);
    for(let i=0;i<22000;i++) {
      const light=sceneryRandom()>.52;
      ctx.fillStyle=light ? `rgba(255,244,205,${sceneryRandom()*grain})` : `rgba(13,25,16,${sceneryRandom()*grain})`;
      const r=sceneryRandom()*2+.5; ctx.fillRect(sceneryRandom()*w,sceneryRandom()*h,r,r);
    }
  });
}
const grassTexture=noiseTexture('#73794d',.30);
grassTexture.wrapS=grassTexture.wrapT=THREE.RepeatWrapping; grassTexture.repeat.set(110,110);
const asphaltTexture=noiseTexture('#575b57',.30);
asphaltTexture.wrapS=asphaltTexture.wrapT=THREE.RepeatWrapping; asphaltTexture.repeat.set(2,120);
const gravelTexture=noiseTexture('#b6ad8d',.42);
gravelTexture.wrapS=gravelTexture.wrapT=THREE.RepeatWrapping; gravelTexture.repeat.set(2,90);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000,3000), new THREE.MeshStandardMaterial({map:grassTexture,roughness:1}));
ground.rotation.x=-Math.PI/2; ground.position.y=-.09; ground.receiveShadow=true; scene.add(ground);
const material = (color, extra={}) => new THREE.MeshStandardMaterial({color,roughness:.72,...extra});
const mats={ concrete:material(0xb0b1a0), dark:material(0x282d27), cream:material(0xe5dec2), red:material(0xba4c32), steel:material(0x7a857e,{metalness:.5,roughness:.45}), roof:material(0x6b756a) };
let circuitWorld=new THREE.Group();scene.add(circuitWorld);
function box(w,h,d,mat,x=0,y=0,z=0,parent=circuitWorld) {
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}

// --- Track: distance lookup table, tangents and curvature ------------------
let curve,trackLength=0,builtTrackId=null;
const SAMPLES=2400;
const track=[];
let mapBounds={cx:0,cz:0,scale:.25};
function setCircuit(def){
  if(builtTrackId===def.id)return;
  curve=RacingArt.trackCurve(def);
  trackLength=curve.getLength();
  track.length=0;
  for(let i=0;i<=SAMPLES;i++) {
    const t=i/SAMPLES,p=curve.getPointAt(t),tangent=curve.getTangentAt(t).normalize();
    const normal=new V3(tangent.z,0,-tangent.x);
    const before=curve.getTangentAt(mod(t-.001,1)),after=curve.getTangentAt(mod(t+.001,1));
    const signed=Math.atan2(before.x*after.z-before.z*after.x,before.dot(after))/(trackLength*.002);
    track.push({p,tangent,normal,curvature:signed});
  }
  const bounds=new THREE.Box3().setFromPoints(track.map(f=>f.p)),size=bounds.getSize(new V3()),center=bounds.getCenter(new V3());
  mapBounds={cx:center.x,cz:center.z,scale:Math.min(174/size.x,106/size.z)};
  buildCircuitWorld(def);
  builtTrackId=def.id;
}
function sample(distance,lane=0) {
  const index=mod(distance,trackLength)/trackLength*SAMPLES;
  const i=Math.floor(index), f=index-i, a=track[i], b=track[i+1];
  const tangent=a.tangent.clone().lerp(b.tangent,f).normalize();
  const normal=new V3(tangent.z,0,-tangent.x);
  return {p:a.p.clone().lerp(b.p,f).addScaledVector(normal,lane),tangent,normal,curvature:lerp(a.curvature,b.curvature,f)};
}
function ribbon(inner,outer,height,mat,start=0,end=trackLength,segments=800) {
  const positions=[],uvs=[],indices=[];
  for(let i=0;i<=segments;i++) {
    const s=start+(end-start)*i/segments;
    for(const [j,offset] of [inner,outer].entries()) { const p=sample(s,offset).p; positions.push(p.x,height,p.z); uvs.push(j,i/segments); }
    if(i<segments) { const a=i*2; indices.push(a,a+1,a+2,a+1,a+3,a+2); }
  }
  const geometry=new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3)); geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); geometry.setIndex(indices); geometry.computeVertexNormals();
  const mesh=new THREE.Mesh(geometry,mat); mesh.receiveShadow=true; circuitWorld.add(mesh); return mesh;
}
function buildCircuitWorld(def){
  // Dispose only per-circuit resources; persistent shared textures/materials stay alive.
  const shared=new Set(Object.values(mats)),textures=new Set([grassTexture,asphaltTexture,gravelTexture]);
  const geometries=new Set(),materials=new Set(),maps=new Set();
  circuitWorld.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])if(!shared.has(m)){materials.add(m);if(m.map&&!textures.has(m.map))maps.add(m.map);}});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());maps.forEach(t=>t.dispose());
  scene.remove(circuitWorld);circuitWorld=new THREE.Group();circuitWorld.name='circuit-'+def.id;scene.add(circuitWorld);
  scenerySeed=5721+TRACKS.indexOf(def)*419;
  const night=def.theme==='night';
  scene.background.set(night?'#111e37':def.theme==='desert'?'#dfcba4':def.theme==='coast'?'#afcfdf':'#b6c4bd');
  scene.fog.color.copy(scene.background);
  hemi.intensity=night?1.5:2.2;sun.intensity=night?1.4:3.1;sun.color.set(night?'#9cc7ff':'#ffe5bc');
  ground.material.color.set(def.theme==='desert'?'#dabc87':def.theme==='forest'?'#9dcc95':night?'#677b85':'#ffffff');
const hw=def.halfWidth||8.5;   // semiancho del asfalto (circuits/<id>.json puede cambiarlo)
ribbon(-(hw+5.5),hw+5.5,.005,new THREE.MeshStandardMaterial({map:gravelTexture,roughness:1,side:THREE.DoubleSide}));
ribbon(-hw,hw,.025,new THREE.MeshStandardMaterial({map:asphaltTexture,roughness:.94,side:THREE.DoubleSide}));
const lineMat=material(0xebe7cd,{side:THREE.DoubleSide});
ribbon(-(hw-.25),-(hw-.41),.045,lineMat); ribbon(hw-.41,hw-.25,.045,lineMat);
for(let s=0;s<trackLength;s+=5) {
  if(Math.abs(sample(s).curvature)>.003) {
    const kerbMat=Math.floor(s/5)%2 ? mats.cream:mats.red;
    ribbon(-(hw+.75),-hw,.07,kerbMat,s,s+5,3); ribbon(hw,hw+.75,.07,kerbMat,s,s+5,3);
  }
}
ribbon(10,25,.035,new THREE.MeshStandardMaterial({map:asphaltTexture,roughness:1,side:THREE.DoubleSide}),30,295,130);
ribbon(24.5,24.7,.05,lineMat,30,295,100);
ribbon(10,10.3,.05,lineMat,55,260,90);
for(let s=68;s<260;s+=12) {
  const p=sample(s,10.5); const m=box(.55,.72,10,mats.concrete,p.p.x,.4,p.p.z); m.rotation.y=Math.atan2(p.tangent.x,p.tangent.z);
}
const startTexture=textureFromCanvas(256,64,(ctx,w,h)=>{ for(let x=0;x<16;x++) for(let y=0;y<4;y++){ctx.fillStyle=(x+y)%2?'#ebe9d4':'#222a24';ctx.fillRect(x*w/16,y*h/4,w/16,h/4);} });
const startMark=new THREE.Mesh(new THREE.PlaneGeometry(hw*2,2.5),new THREE.MeshStandardMaterial({map:startTexture}));
const startFrame=sample(0); startMark.rotation.x=-Math.PI/2; startMark.rotation.z=-Math.atan2(startFrame.tangent.x,startFrame.tangent.z); startMark.position.copy(startFrame.p).y=.08; circuitWorld.add(startMark);
for(let i=0;i<10;i++) {
  const s=-8-Math.floor(i/2)*9, lane=i%2?3.2:-3.2;
  const p=sample(s,lane), group=new THREE.Group(); group.position.copy(p.p); group.rotation.y=Math.atan2(p.tangent.x,p.tangent.z); circuitWorld.add(group);
  box(3.2,.025,.13,lineMat,0,.065,-3.7,group); box(.13,.025,2.2,lineMat,-1.6,.065,-2.65,group); box(.13,.025,2.2,lineMat,1.6,.065,-2.65,group);
}
const railGeometry=new THREE.BoxGeometry(.4,.7,7.5);
const railCount=Math.ceil(trackLength/8)*2;
const rails=new THREE.InstancedMesh(railGeometry,mats.steel,railCount);
const dummy=new THREE.Object3D(); let railIndex=0;
for(let s=0;s<trackLength;s+=8) for(const side of [-1,1]) {
  const lane=side===1&&s<305?40:side*20;
  const p=sample(s,lane); dummy.position.copy(p.p).y=.7; dummy.rotation.set(0,Math.atan2(p.tangent.x,p.tangent.z),0); dummy.updateMatrix(); rails.setMatrixAt(railIndex++,dummy.matrix);
}
rails.count=railIndex; rails.receiveShadow=true; circuitWorld.add(rails);

// --- Scenery: paddock, grandstands, billboards, trees and distant hills -----
function signTexture(title,subtitle,bg='#23382d',fg='#eee7ce') {
  return textureFromCanvas(1024,256,(ctx,w,h)=>{
    ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.fillStyle=fg;ctx.fillRect(20,20,w-40,3);ctx.fillRect(20,h-23,w-40,3);
    ctx.textAlign='center';ctx.font='italic 900 112px Arial';ctx.fillText(title,w/2,143);ctx.font='bold 23px monospace';ctx.fillText(subtitle,w/2,195);
    for(let i=0;i<1300;i++){ctx.fillStyle=`rgba(0,0,0,${sceneryRandom()*.10})`;ctx.fillRect(sceneryRandom()*w,sceneryRandom()*h,2,2);}
  });
}
function sign(title,subtitle,s,lane,width=28,bg,fg) {
  const frame=sample(s,lane), group=new THREE.Group();group.position.copy(frame.p);group.rotation.y=Math.atan2(frame.tangent.x,frame.tangent.z);circuitWorld.add(group);
  const texture=signTexture(title,subtitle,bg,fg);
  const face=new THREE.Mesh(new THREE.PlaneGeometry(width,6),new THREE.MeshStandardMaterial({map:texture,side:THREE.DoubleSide,roughness:.7}));face.position.y=5;group.add(face);
  box(.4,7,.4,mats.steel,-width*.38,3.5,0,group);box(.4,7,.4,mats.steel,width*.38,3.5,0,group);
  return group;
}
sign(def.name,'LIGA RACING ONLINE',125,-31,38,'#e8dfc6','#283e30');
sign('SUR','MOTOR OIL',475,-27,30,'#bc5032','#f6e3b8');
sign('PAMPA','AGRO',830,28,25,'#e6d9b8','#2b4936');
sign('VÉRTICE','SEGUROS',1100,-28,27,'#263d38','#e7d69e');
const gantry=new THREE.Group();gantry.position.copy(startFrame.p);gantry.rotation.y=Math.atan2(startFrame.tangent.x,startFrame.tangent.z);circuitWorld.add(gantry);
box(.6,9,.6,mats.steel,-10,4.5,0,gantry);box(.6,9,.6,mats.steel,10,4.5,0,gantry);
const gantryFace=new THREE.Mesh(new THREE.BoxGeometry(21,2.4,1.2),[mats.dark,mats.dark,mats.dark,mats.dark,new THREE.MeshStandardMaterial({map:signTexture('SERIE NACIONAL','CAMPEONATO GT3')}),mats.dark]);gantryFace.position.y=8.3;gantry.add(gantryFace);
function localGroup(s,lane) { const f=sample(s,lane),g=new THREE.Group();g.position.copy(f.p);g.rotation.y=Math.atan2(f.tangent.x,f.tangent.z);circuitWorld.add(g);return g; }
const pitBuilding=localGroup(170,36);
box(16,7,175,material(0xc0bfa8),0,3.5,0,pitBuilding);
box(18,.6,180,mats.roof,0,7.25,0,pitBuilding);
box(14,3.5,55,material(0xddd9c1),0,9,40,pitBuilding);
box(15,.4,57,mats.dark,0,10.9,40,pitBuilding);
const windowMat=material(0x506963,{metalness:.55,roughness:.25});
for(let z=-75;z<80;z+=13) {
  box(.07,4.5,9,mats.dark,-8.04,2.7,z,pitBuilding);
  box(.1,.5,9,mats.red,-8.09,5.1,z,pitBuilding);
  box(.1,1.1,8,windowMat,-8.08,6.1,z,pitBuilding);
}
for(let z=20;z<66;z+=8)box(.1,2,6,windowMat,-7.08,9,z,pitBuilding);
const crowdPositions=[];
function grandstand(s,lane,length,reverse=false) {
  const g=localGroup(s,lane);if(reverse)g.rotation.y+=Math.PI;
  for(let step=0;step<5;step++) {
    box(2.7,.7,length,mats.concrete,step*2.3,step*.85+.4,0,g);
    box(.2,1.3,length,mats.steel,step*2.3+1.3,step*.85+1.1,0,g);
    for(let z=-length/2+1;z<length/2;z+=1.3) {
      if(sceneryRandom()>.12) {const v=new V3(step*2.3,step*.85+1.1,z);g.localToWorld(v);crowdPositions.push(v);}
    }
  }
  for(let z=-length/2;z<=length/2;z+=12)box(.28,8,.28,mats.steel,10,4,z,g);
  const roof=box(16,.35,length+4,mats.roof,4.5,8.3,0,g);roof.rotation.z=-.08;
  box(.3,1.3,length+4,mats.red,-3.5,7.7,0,g);
}
grandstand(115,-33,100,true);grandstand(trackLength-65,-34,58,true);grandstand(555,-32,52,true);
const audience=new THREE.InstancedMesh(new THREE.BoxGeometry(.48,.85,.4),material(0xffffff),crowdPositions.length);
crowdPositions.forEach((p,i)=>{dummy.position.copy(p);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();audience.setMatrixAt(i,dummy.matrix);audience.setColorAt(i,new THREE.Color([0xc6b78b,0x546f78,0x984a36,0xd0d1b8,0x34493b][i%5]));});circuitWorld.add(audience);
const trees=[];
for(let attempt=0;attempt<1700&&trees.length<(Number.isFinite(def.treeCount)?Math.max(0,Math.min(320,def.treeCount)):def.theme==='desert'?24:210);attempt++) {
  const x=(sceneryRandom()-.5)*1400,z=(sceneryRandom()-.5)*1100;
  if(track.some((f,i)=>i%24===0&&Math.hypot(f.p.x-x,f.p.z-z)<55))continue;
  if(z>145&&z<200&&x>-250&&x<160)continue;
  trees.push([x,z,7+sceneryRandom()*9]);
}
const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.35,.6,1,6),material(0x665842),trees.length);
const foliage=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),material(/^#[0-9a-f]{6}$/i.test(def.foliageColor||'')?parseInt(def.foliageColor.slice(1),16):def.theme==='forest'?0x275942:0x4d6342),trees.length*2);
trees.forEach(([x,z,h],i)=>{
  dummy.position.set(x,h*.35,z);dummy.rotation.set(0,0,0);dummy.scale.set(1,h*.7,1);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
  for(let k=0;k<2;k++){dummy.position.set(x+k*1.6,h*.72+k*h*.13,z);dummy.scale.set(h*.35,h*.42,h*.32);dummy.updateMatrix();foliage.setMatrixAt(i*2+k,dummy.matrix);foliage.setColorAt(i*2+k,new THREE.Color().setHSL(.23+sceneryRandom()*.04,.19,.25+sceneryRandom()*.11));}
});foliage.castShadow=true;circuitWorld.add(trunks,foliage);
if(def.hills!==false)for(let i=0;i<16;i++){const hill=new THREE.Mesh(new THREE.SphereGeometry(1,24,12),material(0x849076));const angle=i/16*Math.PI*2;hill.position.set(Math.cos(angle)*1100,-40,Math.sin(angle)*1000);hill.scale.set(220+sceneryRandom()*200,120+sceneryRandom()*90,200);circuitWorld.add(hill);}
for(let s=100;s<trackLength;s+=160){const g=localGroup(s,-22);box(.18,12,.18,mats.steel,0,6,0,g);box(4,.2,.2,mats.steel,1.7,12,0,g);box(1.2,.2,.8,mats.cream,3.3,11.8,0,g);}
for(const s of [350,380,410,670,700])sign(String((Math.round(s/30)%3+1)*50),'',s,-12,2,'#eee6ca','#25382a');


  if(def.theme==='coast'){
    const water=new THREE.Mesh(new THREE.PlaneGeometry(1400,450),material(0x4698b1,{metalness:.5,roughness:.23}));
    water.rotation.x=-Math.PI/2;water.position.set(0,-.025,-520);circuitWorld.add(water);
  }
  if(def.theme==='city'||night){
    for(let i=0;i<22;i++){
      const a=i/22*Math.PI*2,x=Math.cos(a)*650,z=Math.sin(a)*460,h=25+(i*19%65);
      box(35,h,30,material(night?0x243c5b:0x8d9da5),x,h/2,z);
      if(night)for(let j=0;j<6;j++)box(27,.8,.1,new THREE.MeshBasicMaterial({color:j%2?0x8ed2fa:0xffe6a8}),x,5+j*h/7,z+15.1);
    }
  }
  if(night)for(let i=0;i<16;i++){
    const p=sample(i*trackLength/16,-23).p;
    const light=new THREE.PointLight(0xb9dfff,90,95,1.3);light.position.copy(p).y=12;circuitWorld.add(light);
  }
  if(def.skyColor&&/^#[0-9a-f]{6}$/i.test(def.skyColor)){scene.background.set(def.skyColor);scene.fog.color.copy(scene.background);}
  if(def.groundColor&&/^#[0-9a-f]{6}$/i.test(def.groundColor))ground.material.color.set(def.groundColor);
  // Decorado que trae circuits/<id>.json (placeholders de la IA de circuitos): primitivas simples por tipo.
  if(Array.isArray(def.props))for(const pr of def.props.slice(0,600)){
    try{
      const n=(v,a,b,d)=>Number.isFinite(+v)?Math.max(a,Math.min(b,+v)):d;
      const col=/^#[0-9a-f]{6}$/i.test(pr.color||'')?parseInt(pr.color.slice(1),16):0x8a8f86;
      const x=n(pr.x,-1500,1500,0),z=n(pr.z,-1500,1500,0),y=n(pr.y,-50,200,0),rot=n(pr.rot,-360,360,0)*Math.PI/180;
      let m=null;
      if(pr.type==='box'){const w=n(pr.w,.1,400,4),h=n(pr.h,.1,250,4),d=n(pr.d,.1,400,4);m=box(w,h,d,material(col),x,y+h/2,z);}
      else if(pr.type==='cylinder'||pr.type==='cone'){const r=n(pr.r,.1,120,2),h=n(pr.h,.1,250,6);m=new THREE.Mesh(new THREE.CylinderGeometry(pr.type==='cone'?0:r,r,h,16),material(col));m.position.set(x,y+h/2,z);circuitWorld.add(m);}
      else if(pr.type==='sphere'){const r=n(pr.r,.1,200,3);m=new THREE.Mesh(new THREE.SphereGeometry(r,18,12),material(col));m.scale.y=n(pr.squash,.1,3,1);m.position.set(x,y+r*m.scale.y,z);circuitWorld.add(m);}
      else if(pr.type==='tree'){const h=n(pr.h,2,60,10),g=new THREE.Group();const tr=new THREE.Mesh(new THREE.CylinderGeometry(.3,.5,h*.45,6),material(0x665842));tr.position.y=h*.22;const top=new THREE.Mesh(pr.shape==='pine'?new THREE.ConeGeometry(h*.28,h*.75,8):new THREE.IcosahedronGeometry(h*.34,1),material(col));top.position.y=h*(pr.shape==='pine'?.65:.66);g.add(tr,top);g.position.set(x,y,z);circuitWorld.add(g);m=g;}
      else if(pr.type==='water'){const w=n(pr.w,1,2500,100),d=n(pr.d,1,2500,100);m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),material(col,{metalness:.5,roughness:.23}));m.rotation.x=-Math.PI/2;m.position.set(x,y-.02,z);circuitWorld.add(m);}
      else if(pr.type==='grandstand'){grandstand(n(pr.s,0,trackLength,0),n(pr.lane,-120,120,-33),n(pr.length,10,300,60),!!pr.reverse);}
      else if(pr.type==='sign'){sign(String(pr.text||'').slice(0,18),String(pr.sub||'').slice(0,34),n(pr.s,0,trackLength,0),n(pr.lane,-120,120,-27),n(pr.width,4,60,26),pr.bg,pr.fg);}
      if(m&&pr.type!=='grandstand'&&pr.type!=='sign'&&pr.type!=='water')m.rotation.y=rot;
    }catch(e){console.warn('[circuits] prop ignorado',pr,e);}
  }
}

// One vehicle factory: the exact same body, proportions and details as the garage.
const tireMat=material(0x171b18,{roughness:.93});
const glassMat=material(0x273e3c,{metalness:.5,roughness:.18});
function createCar(driver,index,team){
  const model=RacingArt.car(team.bodyType,undefined,driver.number);
  scene.add(model.group);
  return model;
}
window.isRaceBusy=()=>state.phase==='race'||state.phase==='countdown';
window.refreshPlayerBody=()=>{if(!window.isRaceBusy())resetRace();};

// --- Particle pool: dust, lockup smoke, contact sparks ---------------------
const particleCount=180;
const particlePositions=new Float32Array(particleCount*3);
const particleColors=new Float32Array(particleCount*3);
const particles=Array.from({length:particleCount},()=>({life:0,max:1,v:new V3()}));
particlePositions.fill(-1000);
const particleGeo=new THREE.BufferGeometry();particleGeo.setAttribute('position',new THREE.BufferAttribute(particlePositions,3));particleGeo.setAttribute('color',new THREE.BufferAttribute(particleColors,3));
const smokeTexture=textureFromCanvas(64,64,(ctx)=>{const grad=ctx.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,'#fff9');grad.addColorStop(.4,'#fff4');grad.addColorStop(1,'#fff0');ctx.fillStyle=grad;ctx.fillRect(0,0,64,64);});
const particleCloud=new THREE.Points(particleGeo,new THREE.PointsMaterial({size:3.5,map:smokeTexture,transparent:true,depthWrite:false,vertexColors:true,opacity:.65}));scene.add(particleCloud);
let particleCursor=0;
function emit(car,type,count=5) {
  for(let k=0;k<count;k++) {
    const i=particleCursor++%particleCount,p=particles[i];p.life=p.max=type==='spark'?.35:1.5+Math.random();
    const point=car.mesh.group.position;particlePositions.set([point.x+(Math.random()-.5)*2,.35,point.z+(Math.random()-.5)*2],i*3);
    p.v.set((Math.random()-.5)*4,1+Math.random()*2,(Math.random()-.5)*4);
    const color=new THREE.Color(type==='spark'?0xffbc4a:type==='dust'?0xb5a47a:0xc9cdc2);particleColors.set([color.r,color.g,color.b],i*3);
  }
}
function updateParticles(dt) {
  particles.forEach((p,i)=>{if(p.life>0){p.life-=dt;particlePositions[i*3]+=p.v.x*dt;particlePositions[i*3+1]+=p.v.y*dt;particlePositions[i*3+2]+=p.v.z*dt;if(p.life<=0)particlePositions[i*3+1]=-1000;}});
  particleGeo.attributes.position.needsUpdate=true;particleGeo.attributes.color.needsUpdate=true;
}

// --- Weather engine: rolls off the current track's rain chance, can drift ---
const WEATHER_ORDER=['CLEAR','CLOUDY','LIGHT_RAIN','RAIN','HEAVY_RAIN','DRYING'];
function rollInitialWeather(trackDef){
  const r=Math.random();
  if(r<trackDef.wetChance*.4) return 'RAIN';
  if(r<trackDef.wetChance) return 'LIGHT_RAIN';
  if(r<trackDef.wetChance+.25) return 'CLOUDY';
  return 'CLEAR';
}
function setWeather(key){
  CURRENT_WEATHER_KEY=key;
  CURRENT_WEATHER_GRIP=WEATHER_STATES[key].grip;
  const info=WEATHER_STATES[key];
  $('rc-weather-icon').textContent=info.icon;$('rc-weather-label').textContent=info.label;
  $('rc-weather-detail').textContent=`PISTA ${Math.round(CURRENT_TRACK.tempBase+(key==='CLEAR'?4:key.includes('RAIN')?-3:0))}°C`;
}
function maybeShiftWeather(dt){
  if(Math.random()>=dt*.01)return;
  const idx=WEATHER_ORDER.indexOf(CURRENT_WEATHER_KEY);
  const wetBias=CURRENT_TRACK.wetChance;
  let next=CURRENT_WEATHER_KEY;
  if(CURRENT_WEATHER_KEY==='CLEAR')next=Math.random()<wetBias*.5?'CLOUDY':'CLEAR';
  else if(CURRENT_WEATHER_KEY==='CLOUDY')next=Math.random()<wetBias?'LIGHT_RAIN':(Math.random()<.3?'CLEAR':'CLOUDY');
  else if(CURRENT_WEATHER_KEY==='LIGHT_RAIN')next=Math.random()<.4?'RAIN':(Math.random()<.3?'DRYING':'LIGHT_RAIN');
  else if(CURRENT_WEATHER_KEY==='RAIN')next=Math.random()<.25?'HEAVY_RAIN':(Math.random()<.25?'LIGHT_RAIN':'RAIN');
  else if(CURRENT_WEATHER_KEY==='HEAVY_RAIN')next=Math.random()<.3?'RAIN':'HEAVY_RAIN';
  else if(CURRENT_WEATHER_KEY==='DRYING')next=Math.random()<.4?'CLEAR':(Math.random()<.2?'CLOUDY':'DRYING');
  if(next!==CURRENT_WEATHER_KEY){setWeather(next);addEvent('CAMBIO DE CLIMA',`El tiempo pasa a ${WEATHER_STATES[next].label}.`,null,60);}
}

// --- Racing simulation ------------------------------------------------------
function qualiPace(driver,team){
  const setupBonus=team.isPlayer?(Career.practice.score/100)*(Career.practice.confidence/100):0;
  const eff=effectiveStats(driver,team,setupBonus);
  const rnd=(Math.random()-.5)*.06;
  return 100-(eff.top*30+eff.corner*35+eff.brake*15+eff.control*10+driver.stats[1]*10)+rnd*40;
}
function runQualifying(){
  if(Career.qualifyingDoneRound===currentRound(Career).round)return;
  const grid=buildGrid();
  const timed=grid.map(entry=>({entry,pace:qualiPace(entry.driver,entry.team)})).sort((a,b)=>a.pace-b.pace);
  state.grid=timed.map(t=>t.entry);
  state.poleTeamId=state.grid[0].team.id;
  Career.qualifyingDoneRound=currentRound(Career).round;
  if(state.grid[0].team.isPlayer)playerTeam(Career).poles=(playerTeam(Career).poles||0);
  saveCareer(Career);
  addEvent('CLASIFICACIÓN','La grilla queda definida para la carrera.',null,40);
  resetRace();
  GameUI.openModal(`<div class="eyebrow">CLASIFICACIÓN · VUELTA ÚNICA</div><h2 id="modal-title">GRILLA DE SALIDA</h2><table class="roster"><thead><tr><th>POS</th><th>EQUIPO</th><th>PILOTO</th></tr></thead><tbody>${timed.map((t,i)=>`<tr><td>${i+1}</td><td>${t.entry.team.name}</td><td>${t.entry.driver.name.toUpperCase()}</td></tr>`).join('')}</tbody></table>`);
}
function buildGrid(){
  return Career.teams.map(team=>({team,driver:activeDriver(Career,team)}));
}
function resetRace() {
  state.cars.forEach(c=>{scene.remove(c.mesh.group);c.mesh.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const all=Array.isArray(o.material)?o.material:[o.material];all.forEach(m=>{if(m!==tireMat&&m!==glassMat&&!Object.values(mats).includes(m)){if(m.map)m.map.dispose();m.dispose();}});}});});
  Object.assign(state,{phase:'grid',elapsed:0,countdown:0,paused:false,cameraTimer:0,cameraShot:0,focus:0,focusLocked:false,excitement:0,events:[],eventUntil:0,fastest:Infinity,fastestCarId:-1,finishes:[],dnfCars:[],lastBattle:-20,lastContact:-20,finishAt:0,safetyCar:false,vsc:false,redFlag:false});
  CURRENT_TRACK=currentTrack(Career);
  setCircuit(CURRENT_TRACK);
  setWeather(rollInitialWeather(CURRENT_TRACK));
  CONFIG.strategy=Career.regulations.mandatoryPit?'pit':'sprint';
  const grid=state.grid&&state.grid.length===10?state.grid:buildGrid();
  state.grid=grid;
  state.cars=grid.map((entry,i)=>{
    const {driver,team}=entry;
    let startSlot=i;
    if(team.isPlayer&&team.gridPenaltyNext)startSlot=Math.min(9,i+5);
    const setupBonus=team.isPlayer?(Career.practice.score/100)*(Career.practice.confidence/100):0;
    const eff=effectiveStats(driver,team,setupBonus);
    return {id:i,driver,team,top:eff.top,accel:eff.accel,brake:eff.brake,corner:eff.corner,control:eff.control,aggression:eff.aggression,consistency:eff.consistency,overtake:eff.overtake,mesh:createCar(driver,i,team),s:-8-Math.floor(startSlot/2)*9,v:0,lane:startSlot%2?3.2:-3.2,lateralV:0,targetLane:startSlot%2?3.2:-3.2,state:'Grid',lap:1,lapStart:0,lastLap:0,tire:team.isPlayer?Career.strategy.compound:(i%3===0?'S':i%3===1?'M':'H'),wear:100,damage:0,dnf:false,fuel:100,commands:{pace:'standard',tyres:'standard',pit:'stay',overtake:'standard',fuel:'standard'},errorTimer:0,errorCooldown:12+Math.random()*20,spin:0,spinDirection:1,pitLap:team.isPlayer?Math.max(2,Math.floor(CONFIG.laps/2)):2+i%2,pitDone:false,pitStage:0,pitTimer:0,pitStopS:0,finished:false,finishTime:0,rank:i+1,previousRank:i+1,decisionTimer:Math.random()*.4,attackCooldown:0,pace:.97+Math.random()*.06,slipstream:false,lastEvent:-20,position:new V3(),yaw:0,speedHistory:[]};
  });
  state.order=[...state.cars];buildStandings();buildMap();updateCarsVisual(0);updateUI();updateRaceMeta();
  $('intro').style.display='block';$('start-lights').style.display='none';$('event-overlay').classList.remove('show');$('modal-backdrop').classList.remove('open');$('safety-badge').classList.remove('show');
  $('event-log').innerHTML='<div class="log-item"><span class="log-time">—</span><div><strong>El silencio antes de la largada.</strong><br>Diez escuderías. Una sola bandera a cuadros.</div></div>';
  camera.position.copy(sample(-48,-38).p).add(new V3(0,17,0));camera.lookAt(sample(-14).p.clone().add(new V3(0,1,0)));
  cameraAim.copy(sample(-14).p);state.cameraTimer=0;
  particles.forEach((p,i)=>{p.life=0;particlePositions[i*3+1]=-1000;});
  $('commands-panel').style.display='none';
}
function updateRaceMeta(){
  const round=currentRound(Career);
  $('rc-round-label').textContent='FECHA '+String(round.round).padStart(2,'0');
  $('rc-title').textContent=CURRENT_TRACK.name+' · '+CURRENT_TRACK.desc.toUpperCase();
  $('rc-track-name').textContent=CURRENT_TRACK.name;
  $('rc-track-country').textContent=CURRENT_TRACK.country;
  $('rc-circuit-name').innerHTML=CURRENT_TRACK.name.replace(' ','<br>');
  $('rc-track-tag').textContent='CIRCUITO Nº '+String((Career.calendar.indexOf(round)%TRACKS.length)+1).padStart(2,'0');
  $('quali-button').disabled=Career.qualifyingDoneRound===round.round;
}
function addEvent(title,detail,car=null,intensity=20) {
  const event={title,detail,time:state.elapsed};state.events.unshift(event);window.LROcast&&window.LROcast(title,detail);state.events=state.events.slice(0,40);
  state.excitement=Math.max(state.excitement,intensity);state.eventUntil=performance.now()+4300;
  $('event-title').textContent=title;$('event-detail').textContent=detail;$('event-overlay').classList.add('show');
  $('event-log').innerHTML=state.events.slice(0,10).map(e=>`<div class="log-item"><span class="log-time">${formatTime(e.time)}</span><div><strong>${e.title}</strong><br>${e.detail}</div></div>`).join('');
  if(car&&state.cameraMode==='auto'&&!state.focusLocked&&state.phase==='race') {state.focus=car.id;if(intensity>=35){state.cameraTimer=0;state.cameraShot=car.state==='Spin'?3:1;}}
}
function startRace() {
  if(state.phase==='grid'&&window.LROstudio&&!startRace._go){window.LROstudio.pre(CURRENT_TRACK,()=>{startRace._go=true;startRace();startRace._go=false;});return;}
  if(state.phase==='grid') {
    state.phase='countdown';state.countdown=0;$('intro').style.display='none';$('start-lights').style.display='flex';
    addEvent('MOTORES ENCENDIDOS',CURRENT_TRACK.name+' espera la largada.',null,0);
    audio.init();
    $('commands-panel').style.display='block';renderCommandPanel();
  } else if(state.phase==='race'||state.phase==='countdown') {state.paused=!state.paused;}
  else {showRoundResults();}
  updateUI();
}
function targetCornerSpeed(car,distance) {
  const curvature=Math.abs(sample(distance).curvature);
  const wearGrip=.88+.12*car.wear/100;
  const trackGrip=CURRENT_TRACK.gripMod*CURRENT_WEATHER_GRIP;
  const cmdGrip=car.commands&&car.commands.tyres==='push'?1.03:car.commands&&car.commands.tyres==='save'?.97:1;
  return Math.min(64+car.top*10,Math.sqrt((17+car.corner*8*CURRENT_TRACK.aeroMod)*TIRES[car.tire].grip*wearGrip*trackGrip*cmdGrip/Math.max(.0007,curvature)));
}
function decide(car) {
  const curvature=sample(car.s+20).curvature;
  const front=state.cars.filter(other=>other!==car&&!other.finished&&!other.pitStage&&other.s>car.s&&other.s-car.s<65).sort((a,b)=>a.s-b.s)[0];
  const behind=state.cars.find(other=>other!==car&&!other.pitStage&&car.s-other.s>0&&car.s-other.s<15&&Math.abs(other.lane)>2.3);
  const baseLane=clamp(-Math.sign(curvature)*Math.min(2.2,Math.abs(curvature)*150),-2.2,2.2);
  car.targetLane=baseLane;car.state=Math.abs(curvature)>.008?'Cornering':'Racing';
  let aggression=car.aggression;
  if(car.commands){if(car.commands.overtake==='attack')aggression=Math.min(1,aggression+.15);else if(car.commands.overtake==='defend')aggression=Math.max(0,aggression-.15);}
  if(front) {
    const distance=front.s-car.s;
    if(distance<29&&(car.v>front.v-.6||aggression>.82)) {
      const preferred=car.attackCooldown>0?Math.sign(car.lane||1):Math.sign(curvature||1)*(Math.random()<car.overtake?1:-1);
      let lane=front.lane+preferred*3.8;
      if(Math.abs(lane)>6)lane=front.lane-preferred*3.8;
      const blocked=state.cars.some(o=>o!==car&&o!==front&&Math.abs(o.s-car.s)<9&&Math.abs(o.lane-lane)<2.9);
      if(!blocked) {car.targetLane=clamp(lane,-6.15,6.15);car.state='Overtaking';car.attackCooldown=3;}
    }
    if(distance<16&&state.elapsed-state.lastBattle>18) {
      const pack=state.cars.filter(o=>Math.abs(o.s-car.s)<23&&!o.pitStage);
      if(pack.length>=3&&state.elapsed>8) {state.lastBattle=state.elapsed;addEvent('BATALLA A TRES',`${car.driver.short}, ${front.driver.short} y una posición en juego.`,car,65);}
    }
  }
  if(behind&&car.state!=='Overtaking'&&aggression>.78&&Math.abs(behind.lane-baseLane)>2) {
    car.targetLane=clamp(behind.lane*.7,-3.7,3.7);car.state='Defending';
  }
  if(car.pitStage)car.targetLane=20;
}
function updateCar(car,dt) {
  if(car.finished){car.v=Math.max(0,car.v-dt*8);car.s+=car.v*dt;return;}
  car.errorCooldown-=dt;car.attackCooldown-=dt;car.decisionTimer-=dt;
  if(car.decisionTimer<=0){decide(car);car.decisionTimer=.22+Math.random()*.16;}
  const lapDistance=mod(car.s,trackLength);
  if(CONFIG.strategy==='pit'&&!car.pitDone&&car.lap>=car.pitLap&&lapDistance>32&&lapDistance<55&&car.s>0){car.pitStage=1;car.pitStopS=Math.floor(car.s/trackLength)*trackLength+155+car.id*6;car.state='PitEntry';addEvent('PIT ENTRY',`${car.driver.short} toma el camino de boxes.`,car,20);}
  if(car.commands&&car.commands.pit==='now'&&!car.pitStage&&!car.pitDone){car.pitStage=1;car.pitStopS=Math.floor(car.s/trackLength)*trackLength+155+car.id*6;car.state='PitEntry';addEvent('PIT NOW',`${car.driver.short} entra por orden del equipo.`,car,30);}
  const paceCmd=car.commands?car.commands.pace:'standard';
  const fuelCmd=car.commands?car.commands.fuel:'standard';
  let maxSpeed=(64+car.top*10)*car.pace*(1-car.damage*.08)*(paceCmd==='push'?1.03:paceCmd==='conserve'?.95:1)*(fuelCmd==='save'?.97:fuelCmd==='push'?1.015:1);
  if(car.fuel<=8)maxSpeed*=.85;
  car.slipstream=false;
  const front=state.cars.filter(other=>other!==car&&!other.finished&&Math.abs(other.lane-car.lane)<2.9&&other.s>car.s&&other.s-car.s<55).sort((a,b)=>a.s-b.s)[0];
  if(front&&!car.pitStage&&car.v>35&&Math.abs(sample(car.s).curvature)<.004) {car.slipstream=true;maxSpeed*=1.065;}
  const braking=(15+car.brake*9)*(.82+.18*car.wear/100)*CURRENT_TRACK.brakingMod*CURRENT_WEATHER_GRIP;
  let wanted=maxSpeed;
  for(const distance of [0,20,45,75,110]) {const cornerSpeed=targetCornerSpeed(car,car.s+distance);wanted=Math.min(wanted,Math.sqrt(cornerSpeed*cornerSpeed+2*braking*distance));}
  wanted*=.93+.07*car.wear/100;
  if(car.state==='Overtaking')wanted*=1.008+car.overtake*.009;
  if(state.safetyCar&&!car.pitStage)wanted=Math.min(wanted,30);
  else if(state.vsc&&!car.pitStage)wanted=Math.min(wanted,42);
  if(front&&!car.pitStage) {
    const gap=front.s-car.s;
    if(gap<10+car.v*.14&&Math.abs(front.lane-car.lane)<2.9)wanted=Math.min(wanted,Math.max(0,front.v+(gap-7)*1.5));
  }
  if(car.pitStage===1) {
    car.targetLane=20;car.state='PitEntry';wanted=Math.min(16,Math.sqrt(Math.max(0,2*braking*(car.pitStopS-car.s))));
    if(car.pitStopS-car.s<.8&&car.v<3){car.pitStage=2;car.pitTimer=(4.5+Math.random()*2)*(state.safetyCar?.55:1);car.v=0;addEvent('PARADA EN BOXES',`${car.driver.short} · neumáticos nuevos.`,car,35);}
  }
  if(car.pitStage===2) {
    car.state='PitStop';car.v=0;car.pitTimer-=dt;
    if(car.pitTimer<=0){car.pitStage=3;car.wear=100;car.tire=car.lap>=3?'S':'M';car.pitDone=true;if(car.commands)car.commands.pit='stay';addEvent('SALE DE BOXES',`${car.driver.short} vuelve a la pelea.`,car,25);}
    return;
  }
  if(car.pitStage===3){car.state='PitExit';wanted=17;car.targetLane=lapDistance<265?20:0;if(lapDistance>292){car.pitStage=0;car.targetLane=0;}}
  const curvature=Math.abs(sample(car.s).curvature);
  const weatherRisk=2-CURRENT_WEATHER_GRIP;
  if(car.errorCooldown<=0&&!car.pitStage&&car.v>25&&curvature>.008) {
    const risk=(1-car.consistency)*.042*(1+(100-car.wear)/65)*weatherRisk;
    if(Math.random()<risk*dt) {
      const close=state.cars.some(o=>o!==car&&Math.abs(o.s-car.s)<10);
      const spins=Math.random()<(close?.24:.10)*(1.2-car.control*.3);
      car.errorTimer=spins?2.8:1.7;car.spin=spins?Math.PI*2:0;car.spinDirection=Math.random()<.5?-1:1;
      car.targetLane=(Math.sign(car.lane)||1)*10.3;car.state=spins?'Spin':'Recovering';car.errorCooldown=30+Math.random()*25;
      addEvent(spins?'SPIN':'BLOQUEO DE FRENOS',`${car.driver.short} ${spins?'pierde el auto.':'se pasa en la frenada.'}`,car,spins?80:45);audio.effect(spins?'skid':'brake');
    }
  }
  if(car.errorTimer>0) {
    car.errorTimer-=dt;car.state=car.spin?'Spin':'Recovering';wanted*=car.spin?.18:.65;car.targetLane=(Math.sign(car.lane)||1)*10;
    if(Math.random()<dt*15)emit(car,Math.abs(car.lane)>8.5?'dust':'smoke',2);
    if(car.errorTimer<=0){car.spin=0;car.targetLane=0;car.state='Recovering';}
  }
  if(Math.abs(car.lane)>8.5&&!car.pitStage)wanted*=.68;
  if(car.v>wanted+2&&car.state==='Racing')car.state='Braking';
  else if(car.v<wanted-5&&car.state==='Racing')car.state='Accelerating';
  const acceleration=car.v<wanted?(7+car.accel*5)*(1-car.v/115): -braking;
  car.v=Math.max(0,car.v+clamp(wanted-car.v,Math.min(0,acceleration*dt),Math.max(0,acceleration*dt)));
  const lateralAccel=clamp((car.targetLane-car.lane)*4.5-car.lateralV*4,-6-car.control*3,6+car.control*3);
  car.lateralV=clamp(car.lateralV+lateralAccel*dt,-3.2,3.2);car.lane+=car.lateralV*dt;
  car.s+=car.v*dt;
  const tyreCmdWear=car.commands&&car.commands.tyres==='push'?1.3:car.commands&&car.commands.tyres==='save'?.72:1;
  car.wear=Math.max(8,car.wear-dt*TIRES[car.tire].wear*(car.state==='Overtaking'?1.4:1)*tyreCmdWear*(2-CURRENT_WEATHER_GRIP*.4));
  const fuelBurn=(paceCmd==='push'||fuelCmd==='push'?1.35:fuelCmd==='save'?.68:1)*(car.v/95);
  car.fuel=Math.max(0,car.fuel-dt*fuelBurn*(100/(CONFIG.laps*70)));
  car.speedHistory.push(car.v*3.6);if(car.speedHistory.length>60)car.speedHistory.shift();
  // Mechanical reliability ties directly to the team's accumulated engine usage.
  const reliability=1-clamp((car.team.componentUsage.engine)/(Career.regulations.componentLimit*2.4),0,.22);
  if(state.elapsed>15&&!car.dnf&&Math.random()<dt*(1-reliability)*.0022) {
    car.dnf=true;car.finished=true;car.finishTime=state.elapsed;car.v=0;
    addEvent('ABANDONO MECÁNICO',`${car.driver.short} se detiene en pista. Problema de fiabilidad.`,car,85);
  }
  const newLap=Math.floor(Math.max(0,car.s)/trackLength)+1;
  if(newLap>car.lap) {
    car.lastLap=state.elapsed-car.lapStart;car.lapStart=state.elapsed;car.lap=newLap;
    if(car.lastLap<state.fastest&&car.lap>2&&!car.pitStage){state.fastest=car.lastLap;state.fastestCarId=car.id;addEvent('VUELTA RÁPIDA',`${car.driver.short} · ${formatLap(car.lastLap)}`,car,35);}
    if(newLap===Math.floor(CONFIG.laps/2)+1&&state.order[0]===car&&window.LROstudio)window.LROstudio.half();
    if(newLap===CONFIG.laps&&state.order[0]===car)addEvent('ÚLTIMA VUELTA','Una vuelta. Todo por decidir.',car,85);
    if(newLap>CONFIG.laps) {
      car.finished=true;car.finishTime=state.elapsed;car.rank=state.finishes.length+1;state.finishes.push(car);
      if(state.finishes.length===1){state.finishAt=state.elapsed;addEvent('BANDERA A CUADROS',`${car.team.name.toUpperCase()} GANA EN ${CURRENT_TRACK.name}.`,car,100);}
    }
  }
}
function resolveContacts(dt) {
  for(let i=0;i<state.cars.length;i++)for(let j=i+1;j<state.cars.length;j++) {
    const a=state.cars[i],b=state.cars[j];if(a.finished||b.finished)continue;
    const ds=b.s-a.s,dl=b.lane-a.lane;
    if(Math.abs(ds)<5.8&&Math.abs(dl)<2.78) {
      const lateralOverlap=2.78-Math.abs(dl), longitudinalOverlap=5.8-Math.abs(ds);
      const impact=Math.abs(a.v-b.v)+Math.abs(a.lateralV-b.lateralV);
      if(lateralOverlap<longitudinalOverlap) {
        const sign=Math.sign(dl)||1; a.lane-=sign*lateralOverlap*.5;b.lane+=sign*lateralOverlap*.5;
        a.lateralV-=sign*.5;b.lateralV+=sign*.5;a.v*=1-.018*dt;b.v*=1-.018*dt;
      } else {
        const rear=ds>0?a:b,front=ds>0?b:a;
        rear.s-=longitudinalOverlap*.65;front.s+=longitudinalOverlap*.35;
        const shared=(rear.v+front.v)/2;rear.v=Math.min(rear.v,shared-.2);front.v=Math.max(front.v,shared);
      }
      if(impact>4&&state.elapsed-state.lastContact>12&&state.elapsed>4) {
        state.lastContact=state.elapsed;a.damage=Math.min(1,a.damage+.07);b.damage=Math.min(1,b.damage+.07);
        a.mesh.paint.color.multiplyScalar(.98);emit(a,'spark',10);audio.effect('contact');
        addEvent('CONTACTO',`${a.driver.short} y ${b.driver.short} se rozan. Ambos continúan.`,a,65);
        if(impact>10&&Math.random()<(a.aggression-.6)*.2){a.errorTimer=2.6;a.spin=Math.PI*2;a.state='Spin';addEvent('SPIN',`${a.driver.short} pierde adherencia después del contacto.`,a,80);}
        if(impact>13&&Math.random()<.08&&!state.redFlag&&!state.safetyCar){
          state.redFlag=true;state.redFlagRealEndsAt=performance.now()+7000;state.paused=true;
          state.cars.forEach(c=>{c.wear=100;c.damage=Math.max(0,c.damage-.3);});
          addEvent('BANDERA ROJA','Incidente grave. La carrera se detiene brevemente.',a,100);
        }
      }
    }
  }
}
function maybeTriggerIncidentEvents(dt){
  if(state.safetyCar){if(state.elapsed>state.safetyCarEndsAt){state.safetyCar=false;addEvent('SE APAGA EL SAFETY CAR','Pista libre. Vuelve la competencia real.',null,50);}return;}
  if(state.vsc){if(state.elapsed>state.vscEndsAt){state.vsc=false;addEvent('FIN DEL VSC','Los pilotos recuperan el ritmo total.',null,35);}return;}
  if(state.redFlag)return;
  const severeCount=state.cars.filter(c=>c.damage>.4&&!c.finished).length;
  const spinCount=state.cars.filter(c=>c.state==='Spin').length;
  const risk=dt*(.0012+severeCount*.004+spinCount*.01+(CURRENT_WEATHER_GRIP<.8?.002:0));
  if(state.elapsed>10&&Math.random()<risk){
    if(severeCount>=2||Math.random()<.35){state.safetyCar=true;state.safetyCarEndsAt=state.elapsed+22+Math.random()*10;addEvent('SAFETY CAR','El coche de seguridad sale a pista. Se abre la ventana de boxes.',null,90);}
    else{state.vsc=true;state.vscEndsAt=state.elapsed+12+Math.random()*8;addEvent('SAFETY CAR VIRTUAL','Velocidad controlada en toda la pista.',null,70);}
  }
}
function updateRace(dt) {
  if(state.paused)return;
  if(state.phase==='countdown') {
    const previous=Math.floor(state.countdown);state.countdown+=dt;
    document.querySelectorAll('#start-lights i').forEach((light,i)=>light.classList.toggle('on',state.countdown>=i*.75+.3));
    if(Math.floor(state.countdown)!==previous)audio.effect('beep');
    if(state.countdown>4.9){state.phase='race';$('start-lights').style.display='none';addEvent('¡LARGARON!','Comienza la carrera.',null,45);audio.effect('start');}
    return;
  }
  if(state.phase!=='race')return;
  state.elapsed+=dt;state.excitement=Math.max(0,state.excitement-dt*4);
  maybeShiftWeather(dt);maybeTriggerIncidentEvents(dt);
  state.cars.forEach(car=>updateCar(car,dt));resolveContacts(dt);
  const unfinished=state.cars.filter(c=>!c.finished).sort((a,b)=>b.s-a.s);
  const dnfCars=state.cars.filter(c=>c.finished&&c.dnf).sort((a,b)=>b.s-a.s);
  state.dnfCars=dnfCars;
  state.order=[...state.finishes,...unfinished,...dnfCars];
  state.order.forEach((car,index)=>{
    car.previousRank=car.rank;car.rank=index+1;
    if(car.rank<car.previousRank&&state.elapsed>8&&!car.finished&&state.elapsed-car.lastEvent>6) {
      car.lastEvent=state.elapsed;
      const passed=state.order.find(o=>o!==car&&o.previousRank===car.rank);
      addEvent(car.rank===1?'CAMBIO DE LÍDER':'ADELANTAMIENTO',`${car.driver.short} ${passed?'supera a '+passed.driver.short:'avanza'} · P${car.rank}`,car,car.rank===1?90:55);
    }
  });
  if((state.finishes.length+dnfCars.length)===CONFIG.carCount||(state.finishAt&&state.elapsed-state.finishAt>40)) {
    state.phase='finished';state.paused=false;(window.LROstudio&&window.LROstudio.post(showRoundResults))||setTimeout(showRoundResults,1300);
  }
}
function updateCarsVisual(dt) {
  state.cars.forEach(car=>{
    const f=sample(car.s,car.lane);car.position.copy(f.p);car.mesh.group.position.copy(f.p);
    const spinAngle=car.spin?car.spin*(1-car.errorTimer/2.8)*car.spinDirection:0;
    car.yaw=Math.atan2(f.tangent.x,f.tangent.z);
    car.mesh.group.rotation.y=car.yaw+spinAngle+clamp(car.lateralV/Math.max(12,car.v),-.15,.15);
    car.mesh.body.rotation.z=lerp(car.mesh.body.rotation.z,clamp(-f.curvature*car.v*car.v*.0015,-.07,.07),.1);
    car.mesh.body.rotation.x=lerp(car.mesh.body.rotation.x,car.state==='Braking'?.022:car.state==='Accelerating'?-.012:0,.1);
    car.mesh.body.position.y=car.v>1?Math.sin(car.s*1.8)*.012*(Math.abs(car.lane)>8?.9:.3):0;
    car.mesh.wheels.forEach(wheel=>{wheel.rotation.x+=car.v*dt/.6;});
  });
}

// --- TV director: position-aware cameras with event and battle priority -----
const cameraAim=new V3();
function selectInterestingCar() {
  if(state.focusLocked)return state.cars[state.focus];
  if(state.finishes.length)return state.finishes[0];
  let best=state.order[0],score=-Infinity;
  state.cars.forEach(car=>{
    let interest=car.rank===1?14:0;
    const neighbours=state.cars.filter(o=>o!==car&&Math.abs(o.s-car.s)<22&&!o.pitStage);
    interest+=neighbours.length*20;
    if(car.state==='Overtaking')interest+=25;
    if(car.state==='Spin')interest+=65;
    if(car.state==='PitStop')interest+=15;
    if(car.lap===CONFIG.laps)interest+=car.rank<=2?40:0;
    if(interest>score){score=interest;best=car;}
  });
  state.excitement=Math.max(state.excitement,Math.min(100,score));return best;
}
function updateCamera(dt) {
  if(state.phase==='grid') {
    const t=performance.now()*.00006;
    const f=sample(-16); const desired=f.p.clone().addScaledVector(f.tangent,-34).addScaledVector(f.normal,-33).add(new V3(0,17+Math.sin(t)*2,0));
    camera.position.lerp(desired,.03);cameraAim.lerp(f.p.clone().addScaledVector(f.tangent,6),.03);camera.lookAt(cameraAim);return;
  }
  state.cameraTimer-=dt;
  if(state.cameraMode==='auto'&&state.cameraTimer<=0) {
    const car=selectInterestingCar();state.focus=car.id;
    state.cameraShot=(state.cameraShot+1)%4;state.cameraTimer=state.excitement>55?6:9;
  }
  const car=state.cars[state.focus]||state.order[0],f=sample(car.s,car.lane);
  let mode=state.cameraMode,shot=state.cameraShot;
  if(mode==='auto')mode=['track','chase','side','corner'][shot];
  let pos,aim=f.p.clone().add(new V3(0,1.1,0)),fov=46;
  if(mode==='onboard') {pos=f.p.clone().addScaledVector(f.tangent,.35).add(new V3(0,2.22,0));aim=f.p.clone().addScaledVector(f.tangent,65).add(new V3(0,1.5,0));fov=74;}
  else if(mode==='chase') {pos=f.p.clone().addScaledVector(f.tangent,-16).addScaledVector(f.normal,-5).add(new V3(0,7,0));aim.addScaledVector(f.tangent,10);fov=52;}
  else if(mode==='side') {pos=f.p.clone().addScaledVector(f.tangent,9).addScaledVector(f.normal,-23).add(new V3(0,5.4,0));aim.addScaledVector(f.tangent,2);fov=48;}
  else if(mode==='corner') {const station=sample(car.s+42,-29);pos=station.p.add(new V3(0,11,0));aim.addScaledVector(f.tangent,4);fov=43;}
  else {pos=f.p.clone().addScaledVector(f.tangent,30).addScaledVector(f.normal,-40).add(new V3(0,25,0));aim.addScaledVector(f.tangent,-6);fov=46;}
  if(mode==='onboard'){camera.position.copy(pos);cameraAim.copy(aim);}else{const smooth=1-Math.exp(-dt*3.8);camera.position.lerp(pos,smooth);cameraAim.lerp(aim,smooth);}
  camera.fov=lerp(camera.fov,fov,.06);camera.updateProjectionMatrix();camera.lookAt(cameraAim);
  const names={track:'PANORÁMICA',chase:'PERSECUCIÓN',side:'BATALLA',corner:'CURVA',onboard:'A BORDO'};
  $('camera-label').textContent=`CAM 0${shot+1} · ${names[mode]}`;
  $('onboard-hud').style.display=mode==='onboard'?'block':'none';
  sun.position.copy(f.p).add(new V3(-160,240,110));sun.target.position.copy(f.p);
}

// --- Web Audio: layered engine harmonics, air, tyres and transient impacts --
const audio={ctx:null,muted:true,engines:[],master:null,noiseGain:null,lastGear:0,
  init(){
    if(this.ctx){this.ctx.resume();return;}
    const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;
    this.ctx=new AudioContext();this.master=this.ctx.createGain();this.master.gain.value=this.muted?0:.38;this.master.connect(this.ctx.destination);
    const filter=this.ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=850;filter.Q.value=.6;filter.connect(this.master);this.filter=filter;
    for(let i=0;i<4;i++){const oscillator=this.ctx.createOscillator(),gain=this.ctx.createGain();oscillator.type=i===0?'sawtooth':'triangle';oscillator.frequency.value=45+i*10;gain.gain.value=i===0?.09:.035;oscillator.connect(gain);gain.connect(filter);oscillator.start();this.engines.push({oscillator,gain});}
    const buffer=this.ctx.createBuffer(1,this.ctx.sampleRate*2,this.ctx.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    this.noiseBuffer=buffer;const noise=this.ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;
    const noiseFilter=this.ctx.createBiquadFilter();noiseFilter.type='lowpass';noiseFilter.frequency.value=450;
    this.noiseGain=this.ctx.createGain();this.noiseGain.gain.value=.015;noise.connect(noiseFilter);noiseFilter.connect(this.noiseGain);this.noiseGain.connect(this.master);noise.start();
  },
  toggle(){this.init();this.muted=!this.muted;this.master?.gain.setTargetAtTime(this.muted?0:.38,this.ctx.currentTime,.08);$('sound-icon').setAttribute('d',this.muted?'M11 4 5 9H2v6h3l6 5ZM16 9l6 6m0-6-6 6':'M11 4 5 9H2v6h3l6 5ZM16 7a7 7 0 0 1 0 10M19 4a11 11 0 0 1 0 16');$('sound-button').title=this.muted?'Activar sonido':'Silenciar';$('sound-button').setAttribute('aria-label',$('sound-button').title);},
  update(){if(!this.ctx)return;const car=state.cars[state.focus];if(!car)return;const time=this.ctx.currentTime;const active=state.phase==='race'&&!state.paused;const gear=clamp(Math.floor(car.v/14)+1,1,5);const rpm=active?65+(car.v%14)*5:32;
    if(gear!==this.lastGear&&active){this.lastGear=gear;this.engines[0].gain.gain.setTargetAtTime(.025,time,.02);}
    this.engines.forEach((e,i)=>{e.oscillator.frequency.setTargetAtTime(rpm*(i===0?1:i*.52+1),time,.08);e.gain.gain.setTargetAtTime(state.paused?0:(i===0?.085:.025),time,.1);});
    this.filter.frequency.setTargetAtTime(350+car.v*14,time,.1);this.noiseGain.gain.setTargetAtTime(state.paused?0:.006+car.v*.0005,time,.1);
  },
  effect(type){if(!this.ctx||this.muted)return;const t=this.ctx.currentTime,gain=this.ctx.createGain();gain.connect(this.master);
    if(['contact','skid','brake'].includes(type)){const source=this.ctx.createBufferSource();source.buffer=this.noiseBuffer;const filter=this.ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=type==='contact'?200:2100;filter.Q.value=type==='contact'?.7:4;source.connect(filter);filter.connect(gain);gain.gain.setValueAtTime(type==='contact'?.5:.12,t);gain.gain.exponentialRampToValueAtTime(.001,t+.55);source.start();source.stop(t+.6);}
    else {const oscillator=this.ctx.createOscillator();oscillator.frequency.value=type==='start'?880:440;oscillator.connect(gain);gain.gain.setValueAtTime(.12,t);gain.gain.exponentialRampToValueAtTime(.001,t+.2);oscillator.start();oscillator.stop(t+.25);}
  }
};

// --- Broadcast UI and accessible controls -----------------------------------
function formatTime(seconds){return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;}
function formatLap(seconds){return `${Math.floor(seconds/60)}:${(seconds%60).toFixed(3).padStart(6,'0')}`;}
function buildStandings() {
  $('standings').innerHTML=state.cars.map(car=>`<div class="driver-row" data-driver="${car.id}" role="button" tabindex="0" aria-label="Seguir a ${car.driver.name}"><span class="pos">${car.rank}</span><i class="stripe" style="background:#${car.team.color.toString(16).padStart(6,'0')}"></i><span class="name">${car.driver.short}</span><span class="gap">—</span><span class="compound ${TIRES[car.tire].class}">${car.tire}</span></div>`).join('');
  document.querySelectorAll('.driver-row').forEach(row=>{const select=()=>{state.focus=Number(row.dataset.driver);state.focusLocked=true;state.cameraTimer=5;updateUI();};row.onclick=select;row.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}};});
}
const mapXY=p=>[100+(p.x-mapBounds.cx)*mapBounds.scale,69+(p.z-mapBounds.cz)*mapBounds.scale];
function buildMap() {
  const path=track.filter((_,i)=>i%12===0).map((f,i)=>{const [x,y]=mapXY(f.p);return `${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`;}).join(' ')+' Z';
  $('minimap').innerHTML=`<path d="${path}" class="map-edge"/><path d="${path}" class="map-track"/>`+state.cars.map(c=>`<circle id="map-car-${c.id}" class="map-car" r="3.2" fill="#${c.team.color.toString(16).padStart(6,'0')}"/>`).join('');
  $('circuit-preview').innerHTML=`<path d="${path}" fill="none" stroke="#354939" stroke-width="5"/><path d="M37 110h18" stroke="#d2683b" stroke-width="5"/><circle cx="45" cy="116" r="3" fill="#d2683b"/>`;
  $('track-length').textContent=(trackLength/1000).toFixed(2);
}
const stateNames={Grid:'EN PARRILLA',Racing:'EN CARRERA',Braking:'FRENANDO',Cornering:'EN CURVA',Accelerating:'ACELERANDO',Overtaking:'AL ATAQUE',Defending:'DEFENDIENDO',Recovering:'RECUPERANDO',Spin:'TROMPO',PitEntry:'ENTRA A BOXES',PitStop:'EN BOXES',PitExit:'SALE DE BOXES'};
function updateUI() {
  const running=state.phase==='race',leader=state.order[0],car=state.cars[state.focus];if(!leader||!car)return;
  const lap=state.phase==='grid'||state.phase==='countdown'?0:Math.min(CONFIG.laps,leader.lap);
  $('session-label').textContent=state.phase==='finished'?'RESULTADO FINAL':state.finishes.length?'BANDERA A CUADROS':lap===CONFIG.laps?'ÚLTIMA VUELTA':running?'CLASIFICACIÓN':'PARRILLA DE SALIDA';
  $('lap-display').textContent=`V ${lap} / ${CONFIG.laps}`;$('race-clock').textContent=formatTime(state.elapsed);
  $('start-label').textContent=state.phase==='grid'?'START RACE':state.phase==='finished'?'VER RESULTADOS':state.paused?'RESUME':'PAUSE';
  $('start-button').querySelector('.play').textContent=state.phase==='grid'||state.paused?'▶':state.phase==='finished'?'▤':'Ⅱ';
  $('status-label').textContent=state.redFlag?'BANDERA ROJA':state.safetyCar?'SAFETY CAR':state.vsc?'VIRTUAL SAFETY CAR':state.paused?'TRANSMISIÓN EN PAUSA':state.phase==='grid'?'TODO LISTO EN LA PARRILLA':state.phase==='countdown'?'SE APAGAN LOS SEMÁFOROS…':state.phase==='finished'?'TENEMOS UN GANADOR':state.finishes.length?'BANDERA A CUADROS':lap===CONFIG.laps?'LA ÚLTIMA VUELTA':'LA CARRERA ESTÁ VIVA';
  $('status-detail').textContent=state.phase==='grid'?`${Career.regulations.mandatoryPit?'Una parada obligatoria':'Sin parada obligatoria'} · ${WEATHER_STATES[CURRENT_WEATHER_KEY].label}`:`${formatTime(state.elapsed)} · ${state.finishes.length?state.finishes.length+' / 10 en meta':'Vuelta '+lap+' de '+CONFIG.laps} · ${state.speed}×`;
  $('flag-label').textContent=state.finishes.length?'CHEQUERED FLAG':state.safetyCar?'SAFETY CAR':state.phase==='race'?'GREEN FLAG · PISTA LIBRE':'10 EQUIPOS';
  const badge=$('safety-badge');
  if(state.redFlag){badge.textContent='BANDERA ROJA';badge.className='safety-badge show red';}
  else if(state.safetyCar){badge.textContent='SAFETY CAR';badge.className='safety-badge show sc';}
  else if(state.vsc){badge.textContent='VIRTUAL SAFETY CAR';badge.className='safety-badge show vsc';}
  else badge.className='safety-badge';
  const rowHeight=window.innerWidth<=700?29:33;
  document.querySelectorAll('.driver-row').forEach(row=>{
    const c=state.cars[Number(row.dataset.driver)],ahead=state.order[c.rank-2];
    row.style.transform=`translateY(${(c.rank-1)*rowHeight}px)`;row.classList.toggle('selected',c.id===state.focus);row.querySelector('.pos').textContent=c.rank;
    let gap='—';
    if(c.dnf)gap='DNF';
    else if(c.finished)gap=c.rank===1?'WIN':`+${(c.finishTime-state.finishes[0].finishTime).toFixed(1)}`;
    else if(running&&c.rank===1)gap='LÍDER';
    else if(running&&ahead)gap=`+${Math.max(0,(ahead.s-c.s)/Math.max(22,c.v)).toFixed(2)}`;
    if(c.pitStage===2)gap='PIT';row.querySelector('.gap').textContent=gap;
    const tire=row.querySelector('.compound');tire.className=`compound ${TIRES[c.tire].class}`;tire.textContent=c.tire;
    const [x,y]=mapXY(c.position),marker=$('map-car-'+c.id);marker.setAttribute('cx',x);marker.setAttribute('cy',y);marker.setAttribute('r',c.id===state.focus?'4.5':'3');
  });
  $('focus-number').textContent=car.driver.number;$('focus-number').style.color='#'+car.team.color.toString(16).padStart(6,'0');$('focus-number').style.borderColor='#'+car.team.color.toString(16).padStart(6,'0');
  $('focus-name').textContent=car.driver.name.toUpperCase();$('focus-team').textContent=car.team.name.toUpperCase();$('focus-position').textContent=`POS. ${String(car.rank).padStart(2,'0')}`;
  $('focus-speed').textContent=Math.round(car.v*3.6);$('focus-tire').textContent=`${car.tire} · ${Math.round(car.wear)}%`;$('tire-bar-fill').style.width=car.wear+'%';$('focus-state').textContent=car.dnf?'ABANDONÓ':car.finished?'EN META':stateNames[car.state]||'EN CARRERA';
  $('focus-fuel').textContent=Math.round(car.fuel);$('focus-damage').textContent=Math.round(car.damage*100)+'%';
  $('focus-delta').textContent=state.fastest<Infinity&&car.lastLap?(car.lastLap-state.fastest>=0?'+':'')+(car.lastLap-state.fastest).toFixed(2):'—';
  $('hud-speed').textContent=Math.round(car.v*3.6);$('hud-state').textContent=car.slipstream?'REBUFO ACTIVO':car.state.toUpperCase();
  $('director-label').textContent=state.focusLocked?`SIGUIENDO A ${car.driver.short}`:`DIRECTOR IA · ${state.excitement>65?'BATALLA EN PISTA':'SEÑAL AUTOMÁTICA'}`;
  if(performance.now()>state.eventUntil)$('event-overlay').classList.remove('show');
}
function renderCommandPanel(){
  const playerCar=state.cars.find(c=>c.team.isPlayer);
  $('command-car-toggle').innerHTML=playerCar?`<button class="active" style="flex:2">DIRIGIENDO A ${playerCar.driver.name.toUpperCase()} · P${playerCar.rank}</button>`:'';
  if(!playerCar)return;
  document.querySelectorAll('#commands-panel [data-cmd]').forEach(group=>{
    const cmd=group.dataset.cmd;
    group.querySelectorAll('button').forEach(btn=>{
      btn.classList.toggle('active',playerCar.commands[cmd]===btn.dataset.val);
      btn.onclick=()=>{
        if(cmd==='pit'&&btn.dataset.val==='now'){playerCar.commands.pit='now';}
        else if(cmd==='pit'&&btn.dataset.val==='next'){playerCar.pitLap=playerCar.lap+1;playerCar.commands.pit='next';}
        else playerCar.commands[cmd]=btn.dataset.val;
        group.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));
      };
    });
  });
}
function showRoundResults() {
  if(state.phase!=='finished')return;
  const order=state.order;
  const summary=onRaceFinished(order,state.poleTeamId?order.find(c=>c.team.id===state.poleTeamId)?.id:-1,state.fastestCarId);
  const podiumHtml=order.slice(0,3).map((c,i)=>`<div class="podium-step" style="border-color:#${c.team.color.toString(16).padStart(6,'0')}"><b>${i+1}º</b><strong>${c.driver.short}</strong><small>${c.team.name.toUpperCase()}</small></div>`).join('');
  const rowsHtml=order.map((c,i)=>`<tr><td>${i+1}</td><td>${c.team.name.toUpperCase()}</td><td>${c.driver.name.toUpperCase()}</td><td>${c.dnf?'DNF':(c.finished?(i===0?formatLap(c.finishTime):'+'+(c.finishTime-order[0].finishTime).toFixed(3)):'NO FINALIZÓ')}</td></tr>`).join('');
  GameUI.openModal(`<div class="eyebrow">${CURRENT_TRACK.name} · RESULTADO OFICIAL</div><h2 id="modal-title">LA GLORIA TIENE NOMBRE.</h2><div class="podium">${podiumHtml}</div><table class="roster"><thead><tr><th>POS</th><th>EQUIPO</th><th>PILOTO</th><th>TIEMPO / DIF.</th></tr></thead><tbody>${rowsHtml}</tbody></table><p>Ingreso de la fecha: <b>${GameUI.money(summary.sponsorIncome+summary.prize)}</b>${summary.penalty?' · <b style="color:#c93a2e">Penalización de grilla la próxima fecha por límite de motor.</b>':''}</p><button class="primary" id="round-continue">CONTINUAR A LA SIGUIENTE FECHA &nbsp; ↗</button>`);
  $('round-continue').onclick=()=>{GameUI.closeModal();GameUI.advanceToNextRound();};
}
$('start-button').onclick=startRace;$('restart-button').onclick=resetRace;$('sound-button').onclick=()=>audio.toggle();
$('quali-button').onclick=runQualifying;
$('strategy-button').onclick=openStrategyModal;
function openStrategyModal(){
  const s=Career.strategy;
  const presets={ATTACK:{pace:'push',aggression:'attack',tyreMgmt:'push',fuel:'push',stops:1},BALANCED:{pace:'standard',aggression:'standard',tyreMgmt:'standard',fuel:'standard',stops:1},CONSERVE:{pace:'conserve',aggression:'defend',tyreMgmt:'save',fuel:'save',stops:1}};
  GameUI.openModal(`<div class="eyebrow">ESTRATEGIA DE CARRERA</div><h2 id="modal-title">${CURRENT_TRACK.name}</h2>
    <div class="strategy-choice">${Object.keys(presets).map(p=>`<button data-preset="${p}">${p}</button>`).join('')}</div>
    <div class="slider-row"><label><span>COMPUESTO INICIAL</span></label><div class="strategy-choice">${['S','M','H'].map(t=>`<button data-compound="${t}" class="${s.compound===t?'active':''}">${TIRES[t].name.toUpperCase()}</button>`).join('')}</div></div>
    <p>El formato de temporada exige ${Career.regulations.mandatoryPit?'una parada obligatoria':'ninguna parada obligatoria'} en boxes. Ajustá el compuesto y el enfoque general; podés seguir dando órdenes en vivo desde DIRECCIÓN DE CARRERA una vez arrancada la carrera.</p>
    <button class="primary" id="strategy-close">LISTO</button>`);
  document.querySelectorAll('[data-preset]').forEach(btn=>btn.onclick=()=>{Object.assign(Career.strategy,presets[btn.dataset.preset]);saveCareer(Career);openStrategyModal();});
  document.querySelectorAll('[data-compound]').forEach(btn=>btn.onclick=()=>{Career.strategy.compound=btn.dataset.compound;saveCareer(Career);openStrategyModal();});
  $('strategy-close').onclick=()=>GameUI.closeModal();
}
$('fullscreen-button').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){addEvent('PANTALLA COMPLETA','Tu navegador no permite este modo.');}};
document.querySelectorAll('[data-speed]').forEach(button=>button.onclick=()=>{state.speed=Number(button.dataset.speed);document.querySelectorAll('[data-speed]').forEach(b=>b.classList.toggle('active',b===button));updateUI();});
document.querySelectorAll('[data-camera]').forEach(button=>button.onclick=()=>{state.cameraMode=button.dataset.camera;if(state.cameraMode==='auto')state.focusLocked=false;state.cameraTimer=0;document.querySelectorAll('[data-camera]').forEach(b=>b.classList.toggle('active',b===button));});
document.addEventListener('keydown',e=>{
  if($('modal-backdrop').classList.contains('open'))return;
  if(currentActiveScreen()!=='race')return;
  if(['BUTTON','SELECT','INPUT'].includes(document.activeElement.tagName))return;
  if(e.code==='Space'){e.preventDefault();startRace();}
  if(e.key.toLowerCase()==='m')audio.toggle();
  if(e.key.toLowerCase()==='c'){const buttons=[...document.querySelectorAll('[data-camera]')],index=buttons.findIndex(b=>b.classList.contains('active'));buttons[(index+1)%buttons.length].click();}
});
function resize(){const rect=$('scene').getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();updateUI();}
new ResizeObserver(resize).observe(document.querySelector('.broadcast'));
window.onRaceScreenShown=()=>{resize();updateRaceMeta();};

// Fixed physics timestep independent of rendering or selected playback speed.
let lastFrame=performance.now(),accumulator=0,lastUI=0;
function frame(now) {
  requestAnimationFrame(frame);
  const realDt=Math.min((now-lastFrame)/1000,.10);lastFrame=now;
  if(state.redFlag&&performance.now()>state.redFlagRealEndsAt){state.redFlag=false;state.paused=false;addEvent('SE REANUDA LA CARRERA','Vuelve la acción en pista.',null,60);}
  if(!document.hidden&&currentActiveScreen()==='race'){
    const simulationDt=state.paused?0:realDt*state.speed;
    accumulator+=simulationDt;
    while(accumulator>=CONFIG.fixedStep){updateRace(CONFIG.fixedStep);updateParticles(CONFIG.fixedStep);accumulator-=CONFIG.fixedStep;}
    updateCarsVisual(simulationDt);updateCamera(realDt);audio.update();
    if(now-lastUI>150){updateUI();if(state.phase==='race')renderCommandPanel();lastUI=now;}
    renderer.render(scene,camera);
  }
}
resetRace();resize();$('loading').style.display='none';requestAnimationFrame(frame);
window.Autodromo={state,CONFIG,get trackLength(){return trackLength;},get trackId(){return builtTrackId;},resetRace,startRace,updateRace,showRoundResults};
