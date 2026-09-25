import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { trackAt, LENGTH, mod, clamp } from './simulation.js';
const Y=new THREE.Vector3(0,1,0);
const material=(color,roughness=.7,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
function canvasTexture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function labelTexture(text,bg='#ece9dc',fg='#232b28',small='MOTORSPORT',w=512){return canvasTexture(w,128,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.fillStyle=fg;c.textAlign='center';c.font='italic 900 65px Arial';c.fillText(text,W/2,80);if(small){c.font='bold 14px Arial';c.letterSpacing='4px';c.fillText(small,W/2,109);}});}
function box(w,h,d,mat,x=0,y=0,z=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m;}
function shapeBody(sections,mat){const p=[],idx=[];sections.forEach(([z,w,bottom,top])=>{p.push(-w,bottom,z,w,bottom,z,w,top,z,-w,top,z);});for(let i=0;i<sections.length-1;i++)for(let j=0;j<4;j++){let a=i*4+j,b=i*4+(j+1)%4,c=(i+1)*4+j,d=(i+1)*4+(j+1)%4;idx.push(a,b,d,a,d,c);}idx.push(0,2,1,0,3,2);let e=(sections.length-1)*4;idx.push(e,e+1,e+2,e,e+2,e+3);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;return m;}
export function buildCar(d){
 const car=new THREE.Group(),paint=material(d.color,.29,.3),accent=material(d.second,.35,.15),black=material('#111715',.85),glass=material('#15303a',.15,.65),chrome=material('#a6b0a4',.32,.7);
 car.add(shapeBody([[-2.35,.86,.32,.74],[-1.8,1.07,.30,.99],[.7,1.06,.3,1.01],[1.8,1.03,.28,.85],[2.4,.93,.29,.72]],paint));
 car.add(shapeBody([[-1.5,.81,.91,1.03],[-.88,.76,.97,1.62],[.18,.73,.99,1.60],[.96,.86,.97,1.02]],glass));
 car.add(box(1.54,.07,1.08,accent,0,1.66,-.35));
 for(const x of [-.775,.775]){car.add(box(.065,.57,.08,paint,x,1.31,-.33));car.add(box(.08,.5,.10,paint,x,1.25,-1.1));}
 car.add(box(2.0,.12,.2,black,0,.28,2.38));car.add(box(2.02,.12,.25,black,0,.28,-2.3));
 car.add(box(.7,.028,1.48,accent,0,1.017,1.06));car.add(box(.72,.025,.65,accent,0,.98,-1.72));
 car.add(box(1.23,.28,.04,black,0,.54,2.407));for(let y=.46;y<.67;y+=.068)car.add(box(1.18,.014,.025,chrome,0,y,2.436));
 const lampmat=new THREE.MeshStandardMaterial({color:'#f3e6ba',emissive:'#e8bd68',emissiveIntensity:.45,roughness:.2});
 for(const x of [-.78,-.5,.5,.78]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.135,.135,.035,12),lampmat);l.rotation.x=Math.PI/2;l.position.set(x,.72,2.375);car.add(l);}
 for(const x of [-.71,.71])car.add(box(.43,.16,.03,new THREE.MeshStandardMaterial({color:'#b50f12',emissive:'#8b1411',emissiveIntensity:.4}),x,.66,-2.37));
 for(const x of [-.64,.64])car.add(box(.07,.32,.1,black,x,1.15,-2.03));car.add(box(2.14,.085,.43,accent,0,1.34,-2.05));
 for(const x of [-1.15,1.15]){car.add(box(.27,.16,.32,paint,x,1.06,.55));car.add(box(.06,.07,.27,chrome,x*.91,.43,-.25));}
 car.userData.wheels=[];
 for(const x of [-1.025,1.025])for(const z of [-1.47,1.43]){
  const wheel=new THREE.Group();const tire=new THREE.Mesh(new THREE.CylinderGeometry(.445,.445,.36,16),black);tire.rotation.z=Math.PI/2;wheel.add(tire);
  const rim=new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,.372,12),chrome);rim.rotation.z=Math.PI/2;wheel.add(rim);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.39,10),black);hub.rotation.z=Math.PI/2;wheel.add(hub);
  for(let i=0;i<5;i++){const spoke=box(.386,.055,.46,chrome);spoke.rotation.x=i*Math.PI/5;wheel.add(spoke);}
  wheel.position.set(x,.46,z);car.add(wheel);car.userData.wheels.push(wheel);
 }
 const sponsor=['FIERRO','SUR','VELOCE','NORTE','FIERRO','SUR','VELOCE','CÓNDOR','NORTE','CÓNDOR'][d.id];
 const sideTex=canvasTexture(512,192,(c,w,h)=>{c.fillStyle=d.second;c.fillRect(0,0,w,h);c.fillStyle=d.color;c.fillRect(0,0,12,h);c.fillStyle='#171b19';c.font='italic 900 76px Arial';c.fillText(sponsor,16,94);c.font='bold 24px Arial';c.fillText('COMPETICIÓN • RACING TEAM',18,133);c.fillStyle='#fbf1d0';c.fillRect(385,0,127,192);c.fillStyle='#172020';c.font='italic 900 94px Arial';c.fillText(d.number,391,130);});
 for(const x of [-1.073,1.073]){const p=new THREE.Mesh(new THREE.PlaneGeometry(3.1,.6),new THREE.MeshStandardMaterial({map:sideTex,roughness:.5,side:THREE.DoubleSide}));p.rotation.y=x>0?Math.PI/2:-Math.PI/2;p.position.set(x,.67,-.18);car.add(p);}
 const roof=new THREE.Mesh(new THREE.PlaneGeometry(1.14,.8),new THREE.MeshStandardMaterial({map:labelTexture(String(d.number),d.second,'#182322',''),roughness:.4}));roof.rotation.x=-Math.PI/2;roof.rotation.z=Math.PI;roof.position.set(0,1.704,-.36);car.add(roof);
 const windshield=new THREE.Mesh(new THREE.PlaneGeometry(1.42,.22),new THREE.MeshBasicMaterial({map:labelTexture(sponsor,'#e9e8d9','#172821','')}));windshield.position.set(0,1.50,.34);windshield.rotation.x=-.86;car.add(windshield);
 const hood=new THREE.Mesh(new THREE.PlaneGeometry(1.42,.7),new THREE.MeshStandardMaterial({map:labelTexture(sponsor,d.color,'#f1eee3','LITORAL SERIES')}));hood.rotation.x=-Math.PI/2;hood.position.set(0,1.05,1.2);car.add(hood);
 car.scale.setScalar(1.02);return car;
}

export class BroadcastScene {
 constructor(container,race){
  this.container=container;this.race=race;this.mode='director';this.shot='grid';this.manualId=null;this.nextCut=0;this.lastFocus=-1;this.elapsed=0;this.forceCut=true;
  this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#bfc5bf');this.scene.fog=new THREE.Fog('#c5c8b9',160,600);
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.16;container.prepend(this.renderer.domElement);
  this.camera=new THREE.PerspectiveCamera(46,1,.3,1200);this.camera.position.set(-40,20,125);this.look=new THREE.Vector3();
  this.scene.add(new THREE.HemisphereLight('#d7e5f2','#727c48',2.4));
  const sun=new THREE.DirectionalLight('#ffe0ae',3.4);sun.position.set(-140,190,60);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-245;sun.shadow.camera.right=245;sun.shadow.camera.top=180;sun.shadow.camera.bottom=-180;sun.shadow.camera.far=550;sun.shadow.normalBias=.07;sun.shadow.bias=-.00015;this.scene.add(sun);
  this.createWorld();this.cars=race.cars.map(d=>{const c=buildCar(d);this.scene.add(c);return c;});
  this.particles=[];const particleG=new THREE.IcosahedronGeometry(.32,0);for(let i=0;i<65;i++){let m=new THREE.Mesh(particleG,new THREE.MeshBasicMaterial({color:'#d2c6ae',transparent:true,opacity:0,depthWrite:false}));m.visible=false;this.scene.add(m);this.particles.push({m,life:0});}
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();
 }
 resize(){const w=this.container.clientWidth,h=this.container.clientHeight;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 strip(a,b,y,mat,segments=800,colored=false){
  const pos=[],uv=[],idx=[],colors=[];
  for(let i=0;i<=segments;i++){const s=i/segments*LENGTH;for(const offset of [a,b]){const p=trackAt(s,offset);pos.push(p.x,y,p.z);uv.push((offset-a)/(b-a),s/18);if(colored){const color=new THREE.Color(Math.floor(s/3)%2?'#efe6cf':'#b9412d');colors.push(color.r,color.g,color.b);}}if(i<segments){const j=i*2;idx.push(j,j+2,j+1,j+1,j+2,j+3);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));if(colored)g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.receiveShadow=true;this.scene.add(m);return m;
 }
 createWorld(){
  const grass=canvasTexture(256,256,(c,w,h)=>{c.fillStyle='#788351';c.fillRect(0,0,w,h);for(let i=0;i<18000;i++){const r=65+Math.random()*60;c.fillStyle=`rgba(${r},${r+12},${r*.60},.35)`;c.fillRect(Math.random()*w,Math.random()*h,Math.random()*3+1,1);}});grass.wrapS=grass.wrapT=THREE.RepeatWrapping;grass.repeat.set(90,90);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),new THREE.MeshStandardMaterial({map:grass,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.035;ground.receiveShadow=true;this.scene.add(ground);
  const asphalt=canvasTexture(256,256,(c,w,h)=>{c.fillStyle='#575953';c.fillRect(0,0,w,h);for(let i=0;i<23000;i++){let n=50+Math.random()*95;c.fillStyle=`rgba(${n},${n},${n-4},.21)`;c.fillRect(Math.random()*w,Math.random()*h,1,1);}c.fillStyle='rgba(20,22,19,.1)';for(const x of [76,105,166,192])c.fillRect(x,0,6,h);});asphalt.wrapS=asphalt.wrapT=THREE.RepeatWrapping;asphalt.anisotropy=this.renderer.capabilities.getMaxAnisotropy();
  this.strip(-21,21,.005,material('#b1a17c',1));this.strip(-10.5,10.5,.012,new THREE.MeshStandardMaterial({map:grass,roughness:1}));
  this.strip(-6.8,6.8,.027,new THREE.MeshStandardMaterial({map:asphalt,roughness:.96}));
  const curb=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.87,side:THREE.DoubleSide});this.strip(-7.65,-6.8,.047,curb,1500,true);this.strip(6.8,7.65,.047,curb,1500,true);
  this.strip(-6.78,-6.65,.043,material('#e7e2c7'));this.strip(6.65,6.78,.043,material('#e7e2c7'));
  const pits=new THREE.Group();this.scene.add(pits);
  for(let s=LENGTH-65;s<LENGTH+240;s+=2){const ss=mod(s,LENGTH),blend=ss>LENGTH-65?clamp((ss-(LENGTH-65))/42,0,1):ss>185?clamp((235-ss)/50,0,1):1;const p=trackAt(s,-17*blend);const mesh=box(5,.035,2.8,material('#62645b'),p.x,.041,p.z);mesh.rotation.y=Math.atan2(p.tx,p.tz);mesh.castShadow=false;pits.add(mesh);}
  // A painted start line, grid slots, pit markings and period-correct sponsor gantry.
  const p0=trackAt(0);const line=new THREE.Group();line.position.set(p0.x,.07,p0.z);line.rotation.y=Math.atan2(p0.tx,p0.tz);
  for(let r=0;r<3;r++)for(let col=0;col<16;col++)line.add(box(.81,.015,.42,material((r+col)%2?'#f0ebd7':'#242821'),(col-7.5)*.81,0,r*.42));this.scene.add(line);
  for(let s=-8;s>-60;s-=8.5)for(const offset of [-2.7,2.7]){let p=trackAt(s,offset),g=new THREE.Group();g.position.set(p.x,.061,p.z);g.rotation.y=Math.atan2(p.tx,p.tz);g.add(box(2.4,.015,.09,material('#cdcbb8'),0,0,2.7));for(const x of [-1.2,1.2])g.add(box(.08,.015,1.2,material('#cdcbb8'),x,0,2.1));this.scene.add(g);}
  const gantry=new THREE.Group();gantry.position.set(p0.x,0,p0.z);gantry.rotation.y=Math.atan2(p0.tx,p0.tz);
  const steel=material('#777e75',.5,.5);for(const x of [-9,9]){gantry.add(box(.42,8,.42,steel,x,4,0));gantry.add(box(1.5,.4,1.8,material('#b6b6a6'),x,.2,0));}gantry.add(box(19,1.65,.45,material('#203731'),0,7.5,0));
  const banner=new THREE.Mesh(new THREE.PlaneGeometry(17.8,1.45),new THREE.MeshStandardMaterial({map:labelTexture('LRO  /  LITORAL','#203731','#ece8d6','TOURING CAR CHAMPIONSHIP',1024),side:THREE.DoubleSide}));banner.position.set(0,7.5,.235);gantry.add(banner);this.scene.add(gantry);
  // Continuous guard rails are merged to keep draw calls low.
  const rails=[],posts=[];for(let s=0;s<LENGTH;s+=5.8){for(const offset of [-11.8,11.8]){if(offset<0&&(s<240||s>LENGTH-70))continue;const p=trackAt(s,offset),q=new THREE.Quaternion().setFromAxisAngle(Y,Math.atan2(p.tx,p.tz));for(const h of [.5,.88]){const g=new THREE.BoxGeometry(.17,.23,5.96);g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(p.x,h,p.z),q,new THREE.Vector3(1,1,1)));rails.push(g);}const g=new THREE.BoxGeometry(.17,1.1,.17);g.translate(p.x,.55,p.z);posts.push(g);}}
  for(const [gs,mat] of [[rails,material('#b6b8a5',.5,.45)],[posts,steel]]){const mesh=new THREE.Mesh(mergeGeometries(gs),mat);mesh.castShadow=true;mesh.receiveShadow=true;this.scene.add(mesh);gs.forEach(g=>g.dispose());}
  const pitwall=box(177,1.0,.45,material('#d0c9b4'),-9,.5,101.4);this.scene.add(pitwall);
  for(let i=0;i<9;i++){
   const x=-83+i*19;this.scene.add(box(18.7,6,13,material(i%2?'#c6c0aa':'#d8d0bb'),x,3,126));this.scene.add(box(19.0,.36,14.5,material('#5b6359'),x,6.2,126));
   this.scene.add(box(15.8,3.2,.1,material('#2a3531'),x,1.65,119.43));this.scene.add(box(16,1.35,.11,material('#567477',.22,.3),x,4.45,119.39));
   const sign=new THREE.Mesh(new THREE.PlaneGeometry(14,.86),new THREE.MeshStandardMaterial({map:labelTexture(['FIERRO','SUR','VELOCE','NORTE','CÓNDOR'][i%5],i%2?'#d8c9ac':'#253e34',i%2?'#283b30':'#eee3cf','')}));sign.position.set(x,3.7,119.3);sign.rotation.y=Math.PI;this.scene.add(sign);
   const p=trackAt(30+i*17,-17);const pitmark=box(3.5,.02,7,material(i%2?'#c9a34e':'#d6d2bc'),p.x,.075,p.z);pitmark.rotation.y=Math.atan2(p.tx,p.tz);this.scene.add(pitmark);
  }
  this.scene.add(box(14,19,13,material('#b6b3a2'),-117,9.5,123));this.scene.add(box(16,3.5,15,material('#465f61',.2,.35),-117,16.5,123));this.scene.add(box(17,.5,16,material('#d3cbb6'),-117,18.5,123));
  // Terraced stands with thousands of low-cost instanced spectators.
  this.grandstand(46,-133,90,Math.PI);this.grandstand(222,22,67,Math.PI/2);this.grandstand(-210,-38,57,-Math.PI/2);
  const sponsorNames=['LRO MOTORSPORT','FIERRO','LITORAL 2006','NORTE RACING','SUR'];
  for(let i=0;i<20;i++){const p=trackAt(i*LENGTH/20,-13.5);if(p.z>85&&Math.abs(p.x)<160)continue;const g=new THREE.Group();g.position.set(p.x,0,p.z);g.rotation.y=Math.atan2(p.tx,p.tz);for(const z of [-4.8,4.8])g.add(box(.15,2.8,.15,steel,0,1.4,z));const sign=new THREE.Mesh(new THREE.PlaneGeometry(10,2.5),new THREE.MeshStandardMaterial({map:labelTexture(sponsorNames[i%5],i%3?'#eee4ca':'#bd492b',i%3?'#263c32':'#fff0d1','',512),side:THREE.DoubleSide}));sign.rotation.y=Math.PI/2;sign.position.y=2;g.add(sign);this.scene.add(g);}
  const treePositions=[];for(let i=0;i<650;i++){const x=(Math.random()-.5)*1100,z=(Math.random()-.5)*950;let near=false;for(let k=0;k<160;k++){let p=trackAt(k/160*LENGTH);if(Math.hypot(p.x-x,p.z-z)<33){near=true;break;}}if(!near&&!(z>95&&z<153&&Math.abs(x)<170)&&Math.hypot(x,z)>45)treePositions.push([x,z,7+Math.random()*8]);}
  const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.35,.6,1,5),material('#65553b'),treePositions.length),leaves=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),material('#53633a'),treePositions.length),dummy=new THREE.Object3D();
  treePositions.forEach(([x,z,h],i)=>{dummy.position.set(x,h*.35,z);dummy.scale.set(1,h*.7,1);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);dummy.position.set(x,h*.76,z);dummy.scale.set(h*.36,h*.52,h*.36);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);leaves.setColorAt(i,new THREE.Color().setHSL(.21+Math.random()*.05,.20+Math.random()*.16,.25+Math.random()*.14));});leaves.castShadow=true;this.scene.add(trunks,leaves);
  // Low rolling hills and a warm, hazy horizon.
  for(let i=0;i<18;i++){const hill=new THREE.Mesh(new THREE.SphereGeometry(1,20,12),material(i%2?'#7b8662':'#899071',1));let angle=i/18*Math.PI*2;hill.position.set(Math.cos(angle)*670,-20,Math.sin(angle)*650);hill.scale.set(130+Math.random()*120,65+Math.random()*60,140);this.scene.add(hill);}
  const centerText=new THREE.Mesh(new THREE.PlaneGeometry(53,13),new THREE.MeshStandardMaterial({map:labelTexture('LITORAL','#74804f','#e0dbc0','AUTÓDROMO',1024),roughness:1}));centerText.rotation.x=-Math.PI/2;centerText.position.set(20,.06,16);this.scene.add(centerText);
 }
 grandstand(x,z,width,rotation){
  const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=rotation;const concrete=material('#a4a58f'),seats=[material('#d6c9a3'),material('#9e4d35'),material('#536f66')];
  for(let r=0;r<8;r++){group.add(box(width,.8,1.4,concrete,0,1+r*.66,r*1.35));group.add(box(width,.12,.8,seats[r%3],0,1.46+r*.66,r*1.35));}
  const people=new THREE.InstancedMesh(new THREE.BoxGeometry(.42,.7,.36),material('#d9d3b6'),8*Math.floor(width/.9));let idx=0;const dummy=new THREE.Object3D();for(let r=0;r<8;r++)for(let c=0;c<Math.floor(width/.9);c++){dummy.position.set(-width/2+c*.9,1.9+r*.66,r*1.35);dummy.scale.setScalar(.85+Math.random()*.25);dummy.updateMatrix();people.setMatrixAt(idx,dummy.matrix);people.setColorAt(idx,new THREE.Color(['#d8cab0','#e8dfc6','#32443d','#a3422d','#32536c','#c4a453'][Math.floor(Math.random()*6)]));idx++;}group.add(people);
  for(let px=-width/2;px<=width/2;px+=width/4)group.add(box(.3,10,.3,material('#4f5b53'),px,5,10));const roof=box(width+3,.28,13,material('#a6aba0'),0,10.1,5);roof.rotation.x=-.045;group.add(roof);this.scene.add(group);
 }
 setMode(mode){this.mode=mode;this.forceCut=true;this.nextCut=0;}
 update(dt){
  this.elapsed+=dt;const race=this.race;
  for(const c of race.cars){
   const mesh=this.cars[c.id],p=trackAt(c.progress,c.offset);mesh.position.set(p.x,.04+Math.sin(c.progress*2.6)*.012*c.speed/40,p.z);mesh.rotation.y=Math.atan2(p.tx,p.tz)+(c.spin>0?Math.sin(c.spin*1.1)*3.6:clamp(c.offsetV/Math.max(12,c.speed),-.17,.17));mesh.rotation.z=clamp(c.offsetV*.012,-.04,.04);for(const w of mesh.userData.wheels)w.rotation.x=-c.progress/.445;
   if(c.finished){mesh.position.copy(new THREE.Vector3(p.x,.04,p.z));}
   if(!race.paused&&(c.error>0||Math.abs(c.offset)>6.8&&!c.pitActive||c.incidentCooldown>7.8)&&Math.random()<dt*18&&c.speed>4){const particle=this.particles.find(p=>p.life<=0);if(particle){particle.life=1;particle.m.visible=true;particle.m.position.set(p.x,.3,p.z);particle.m.material.color.set(c.incidentCooldown>7.8?'#ffc16a':Math.abs(c.offset)>6.8?'#b5a481':'#dddcd3');particle.m.scale.setScalar(.6);}}
  }
  for(const p of this.particles)if(p.life>0&&!race.paused){p.life-=dt;p.m.position.y+=dt*.9;p.m.scale.addScalar(dt*1.7);p.m.material.opacity=Math.max(0,p.life*.3);if(p.life<=0)p.m.visible=false;}
  let id=this.manualId??(race.time<4?0:race.time<race.focusUntil?race.focus:race.order[0].id);
  if(this.mode==='battle')id=race.bestBattle;
  const c=race.cars[id]||race.cars[0],p=trackAt(c.progress,c.offset),pos=new THREE.Vector3(p.x,1,p.z),tangent=new THREE.Vector3(p.tx,0,p.tz),normal=new THREE.Vector3(p.nx,0,p.nz);
  const desired=new THREE.Vector3(),look=pos.clone();let fov=46;
  if(race.phase==='grid'){
   this.shot='grid';desired.copy(pos).addScaledVector(tangent,25).addScaledVector(normal,-23);desired.y=12.5;look.addScaledVector(tangent,-15);look.y=.8;fov=44;
  }else if(this.mode==='aerial'){
   this.shot='aerial';desired.copy(pos).add(new THREE.Vector3(35,110,65));look.addScaledVector(tangent,10);fov=52;
  }else if(this.mode==='onboard'){
   this.shot='onboard';desired.copy(pos).addScaledVector(tangent,.45);desired.y=1.87;look.addScaledVector(tangent,40);look.y=1.2;fov=78;
  }else{
   if(this.elapsed>this.nextCut||this.forceCut||(id!==this.lastFocus&&race.excitement>55)){
    this.shot=this.mode==='trackside'?'trackside':this.mode==='battle'?'battle':race.excitement>60?'battle':['chase','trackside','front','wide'][Math.floor(this.elapsed/6)%4];
    this.nextCut=this.elapsed+6.5;this.forceCut=true;this.lastFocus=id;
    const tp=trackAt(c.progress+40,-17);this.trackCamera=new THREE.Vector3(tp.x,4.5,tp.z);
   }
   if(this.shot==='trackside'){
    if(this.trackCamera.distanceTo(pos)>85){const tp=trackAt(c.progress+38,-18);this.trackCamera.set(tp.x,4.5,tp.z);this.forceCut=true;}
    desired.copy(this.trackCamera);fov=clamp(35+desired.distanceTo(pos)*.10,37,52);look.y=1;
   }else if(this.shot==='battle'){
    desired.copy(pos).addScaledVector(tangent,-15).addScaledVector(normal,-12);desired.y=6.0;look.addScaledVector(tangent,10);fov=55;
   }else if(this.shot==='front'){
    desired.copy(pos).addScaledVector(tangent,18).addScaledVector(normal,-7);desired.y=3.5;look.addScaledVector(tangent,-5);fov=49;
   }else if(this.shot==='wide'){
    desired.copy(pos).addScaledVector(tangent,-26).addScaledVector(normal,-26);desired.y=21;look.addScaledVector(tangent,12);fov=45;
   }else{
    desired.copy(pos).addScaledVector(tangent,-19).addScaledVector(normal,-6);desired.y=5.8;look.addScaledVector(tangent,12);fov=54;
   }
  }
  if(this.forceCut||this.mode==='onboard'){this.camera.position.copy(desired);this.look.copy(look);this.forceCut=false;}else{this.camera.position.lerp(desired,1-Math.exp(-dt*4));this.look.lerp(look,1-Math.exp(-dt*6));}
  this.camera.fov+=(fov-this.camera.fov)*Math.min(1,dt*4);this.camera.updateProjectionMatrix();this.camera.lookAt(this.look);this.renderer.render(this.scene,this.camera);this.currentId=id;
 }
}
