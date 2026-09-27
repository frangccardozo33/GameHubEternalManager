import * as THREE from 'three';
import {createPlayer,AnimationController} from './animation.js';
import {CameraController} from './camera.js';
import {Random} from '../sim/math.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// ---- utilidades del estadio (contornos redondeados centrados en z = 50, cintas LED con sponsors ficticios, atlas de público)
const SPONSORS=[['aurora','AURORA ENERGY',32],['nova','NOVA BANK',215],['turbo','TURBO COLA',4],['pampa','PAMPA FOODS',95],['andes','ANDES TELECOM',200],['kondor','KÓNDOR MOTORS',355],['lumen','LUMEN TECH',50],['rio','RÍO SPORT',175],['fenix','FÉNIX AIRLINES',18],['titan','TITÁN GEAR',265],['delta','DELTA PAY',150],['sol','SOL DE MAYO SEGUROS',45]];
const sponsorList=()=>{const c=typeof window!=='undefined'&&window.EM?.sponsors?.catalog;return c?.length?c.slice(0,12).map(s=>({id:s.id,name:s.name,hue:s.hue})):SPONSORS.map(([id,name,hue])=>({id,name,hue}));};
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
function ledStrip(cells=8,h=96){const list=sponsorList(),W=2048,cw=W/cells;let tex=null;
  tex=canvasTex(W,h,g=>{for(let i=0;i<cells;i++){const s=list[i%list.length],x=i*cw,gr=g.createLinearGradient(x,0,x,h);gr.addColorStop(0,`hsl(${s.hue} 70% 32%)`);gr.addColorStop(1,`hsl(${(s.hue+30)%360} 75% 16%)`);g.fillStyle=gr;g.fillRect(x,0,cw,h);g.fillStyle='#ffffff22';g.fillRect(x,0,2,h);
    g.fillStyle='#fff';g.font=`900 ${Math.round(h*.42)}px Arial Narrow, Arial`;g.textBaseline='middle';g.fillText(s.name,x+h*.95,h/2+2,cw-h*1.1);
    if(window.EM?.sponsorLogo){const img=new Image();img.onload=()=>{g.drawImage(img,x+h*.14,h*.14,h*.72,h*.72);if(tex)tex.needsUpdate=true;};img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(window.EM.sponsorLogo(s.id,s.name,h).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));}}
    g.fillStyle='rgba(0,0,0,.18)';for(let y=0;y<h;y+=4)g.fillRect(0,y,W,1);});
  tex.wrapS=THREE.RepeatWrapping;return tex;}
function rrect(shape,hx,hz,r,hole=false){const p=hole?new THREE.Path():shape;p.moveTo(-hx+r,-hz);p.lineTo(hx-r,-hz);p.absarc(hx-r,-hz+r,r,-Math.PI/2,0,false);p.lineTo(hx,hz-r);p.absarc(hx-r,hz-r,r,0,Math.PI/2,false);p.lineTo(-hx+r,hz);p.absarc(-hx+r,hz-r,r,Math.PI/2,Math.PI,false);p.lineTo(-hx,-hz+r);p.absarc(-hx+r,-hz+r,r,Math.PI,Math.PI*1.5,false);if(hole)shape.holes.push(p);return p;}
function band(hx,hz,r,w,y0,h){const s=new THREE.Shape();rrect(s,hx+w,hz+w,r+w);rrect(s,hx,hz,r,true);const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:6});g.rotateX(Math.PI/2);g.translate(0,y0+h,50);return g;}
function perimeter(hx,hz,r,step){const pts=[],L1=2*(hx-r),L2=2*(hz-r),La=Math.PI*r/2;
  const segs=[['l',-hx+r,-hz,1,0,L1],['a',hx-r,-hz+r,-Math.PI/2,La],['l',hx,-hz+r,0,1,L2],['a',hx-r,hz-r,0,La],['l',hx-r,hz,-1,0,L1],['a',-hx+r,hz-r,Math.PI/2,La],['l',-hx,hz-r,0,-1,L2],['a',-hx+r,-hz+r,Math.PI,La]];
  const len=s=>s[0]==='l'?s[5]:s[4],total=segs.reduce((a,s)=>a+len(s),0);let acc=0;
  for(const s of segs){const L=len(s);for(let d=(step-(acc%step))%step;d<L;d+=step){let x,z;if(s[0]==='l'){x=s[1]+s[3]*d;z=s[2]+s[4]*d;}else{const a=s[3]+d/r;x=s[1]+Math.cos(a)*r;z=s[2]+Math.sin(a)*r;}pts.push({x,z:z+50,u:(acc+d)/total});}acc+=L;}
  return pts;}
function fascia(hx,hz,r,y,h){const pts=perimeter(hx,hz,r,.8);pts.push({...pts[0],u:1});const pos=[],uv=[],idx=[];pts.forEach((p,i)=>{pos.push(p.x,y,p.z,p.x,y+h,p.z);uv.push(p.u,0,p.u,1);if(i){const a=(i-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
function crowdAtlas(){return canvasTex(512,256,c=>{for(let i=0;i<4;i++){const x=i*128+64;c.fillStyle='#ffffff';c.beginPath();c.moveTo(x-40,256);c.quadraticCurveTo(x-42,146,x-18,132);c.lineTo(x+18,132);c.quadraticCurveTo(x+42,146,x+40,256);c.fill();
  if(i===1){for(const s of [-1,1]){c.save();c.translate(x+s*36,140);c.rotate(s*.35);c.fillRect(-7,-72,14,76);c.restore();}}
  if(i===3){c.fillStyle='#f0f0f0';c.fillRect(x-26,150,52,14);c.fillRect(x+6,150,12,70);}
  c.fillStyle=['#c99a7a','#8c6248','#e2bfa3','#6e4b36'][i];c.beginPath();c.ellipse(x,104,21,26,0,0,Math.PI*2);c.fill();
  c.fillStyle=['#2b1d14','#161616','#6b4a2e','#1d1712'][i];c.beginPath();c.ellipse(x,90,22,15,0,Math.PI,0);c.fill();if(i===0){c.fillStyle='#ffffff';c.fillRect(x-24,74,48,10);}}});}

export class StadiumView {
  constructor(container,teams) {
    this.container=container;this.teams=teams;this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#334847');this.scene.fog=new THREE.Fog('#334847',220,520);
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.28;
    container.prepend(this.renderer.domElement);
    this.camera=new THREE.PerspectiveCamera(42,1,.1,900);this.cameraController=new CameraController(this.camera);this.animation=new AnimationController();this.meshes=new Map();this.debugGroup=new THREE.Group();this.scene.add(this.debugGroup);
    this.hemi=new THREE.HemisphereLight('#dce9f2','#465c39',2.3);this.scene.add(this.hemi);
    const sun=new THREE.DirectionalLight('#ffedd1',3.1);sun.position.set(-35,90,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-95,right:95,top:130,bottom:-110,far:320});this.sun=sun;sun.shadow.bias=-.0006;this.scene.add(sun);sun.target.position.set(0,0,45);this.scene.add(sun.target);
    this.buildStadium();this.setTimeOfDay(0);
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
  // línea virtual 3D (estilo TV): cinta levemente elevada con borde luminoso
  fieldLine(color) {
    const g=new THREE.Group(),core=new THREE.Mesh(new THREE.BoxGeometry(53.3,.05,.16),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9,depthWrite:false,toneMapped:false}));
    const glow=new THREE.Mesh(new THREE.PlaneGeometry(53.3,.7),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));glow.rotation.x=-Math.PI/2;glow.position.y=.03;
    core.position.y=.06;g.add(core,glow);g.renderOrder=2;this.scene.add(g);return g;
  }
  updateLines(los,firstDown) { this.losLine.position.z=los;this.firstLine.position.z=Math.min(100,firstDown);this.firstLine.visible=firstDown<=100.5;this.marker.position.z=Math.min(100,firstDown); }
  // césped 1024 × 2048 (x = 53,3 yd, z = 120 yd): franjas de corte, números, hash marks, zonas de anotación con el arte del local
  textureCanvas(teams=this.teams) {
    const c=document.createElement('canvas');c.width=1024;c.height=2048;const ctx=c.getContext('2d'),sx=c.width/53.3,sz=c.height/120;
    const home=teams?.[0]??{color:'#1f5f8b',dark:'#193c4a',mascot:'WOLVES',name:'LOCAL'};
    ctx.fillStyle='#2f6a3b';ctx.fillRect(0,0,c.width,c.height);
    for(let z=0;z<120;z+=5) {ctx.fillStyle=(z/5)%2?'#37793f':'#2e6a38';ctx.fillRect(0,z*sz,c.width,5*sz);}
    // franjas diagonales suaves del corte (a 90°) y grano
    ctx.globalAlpha=.06;for(let x=-2048;x<1024;x+=60){ctx.fillStyle=(x/60)%2?'#fff':'#000';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+30,0);ctx.lineTo(x+30+2048,2048);ctx.lineTo(x+2048,2048);ctx.fill();}ctx.globalAlpha=1;
    const rng=new Random(77);
    for(let i=0;i<70000;i++) {ctx.fillStyle=rng.chance(.5)?'#e2efbc0c':'#071c160d';ctx.fillRect(rng.next()*1024,rng.next()*2048,1.5,3);}
    // zonas de anotación: color del local en ambos extremos con el nombre
    for(const [z0,flip] of [[0,true],[110,false]]) {
      const g=ctx.createLinearGradient(0,z0*sz,0,(z0+10)*sz);g.addColorStop(0,home.dark??'#193c4a');g.addColorStop(1,home.color??'#1f5f8b');ctx.fillStyle=g;ctx.fillRect(0,z0*sz,1024,10*sz);
      ctx.save();ctx.translate(512,(z0+5)*sz);if(flip)ctx.rotate(Math.PI);ctx.fillStyle='#ffffff';ctx.strokeStyle='#00000055';ctx.lineWidth=6;ctx.font='900 italic 118px Arial Narrow, Arial';ctx.textAlign='center';ctx.textBaseline='middle';
      const t=(home.mascot??'LOCAL').split('').join(' ');ctx.strokeText(t,0,4);ctx.fillText(t,0,4);ctx.restore();
    }
    ctx.strokeStyle='#f2f5e6';ctx.lineWidth=4;ctx.strokeRect(2,2,1020,2044);
    for(let z=0;z<=100;z+=5) {const y=(z+10)*sz;ctx.lineWidth=z===0||z===100?7:z%10===0?3.2:2.2;ctx.beginPath();ctx.moveTo(4,y);ctx.lineTo(1020,y);ctx.stroke();}
    for(let z=1;z<100;z++) {if(z%5===0)continue;const y=(z+10)*sz;for(const x of [.9,23.36,29.94,51.75]) {ctx.fillStyle='#f2f5e6';ctx.fillRect(x*sx,y-1.2,.65*sx,2.4);}}
    // marcas de 2 puntos
    for(const z of [3,97]) {ctx.fillStyle='#f2f5e6';ctx.fillRect(26*sx,(z+10)*sz-1.5,1.3*sx,3);}
    ctx.fillStyle='#f4f6e8';ctx.font='700 58px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
    for(let z=10;z<100;z+=10) {const num=String(Math.min(z,100-z)),y=(z+10)*sz;for(const [xx,rot] of [[9*sx,-Math.PI/2],[44.3*sx,Math.PI/2]]){ctx.save();ctx.translate(xx,y);ctx.rotate(rot);ctx.fillText(num.split('').join(' '),0,0);
      if(z!==50){ctx.beginPath();const dir=(z<50)===(rot<0)?-1:1;ctx.moveTo(dir*52,-8);ctx.lineTo(dir*64,0);ctx.lineTo(dir*52,8);ctx.fill();}ctx.restore();}}
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=this.renderer.capabilities.getMaxAnisotropy();
    // logos: liga en el centro y escudo del local en las zonas de anotación (cuando cargan)
    const draw=(src,x,y,s,rot=0)=>{const img=new Image();img.onload=()=>{ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha=.92;ctx.drawImage(img,-s/2,-s/2,s,s);ctx.restore();tex.needsUpdate=true;};img.src=src;};
    draw('../../assets/logos/lgo.png',512,60*sz,300,-Math.PI/2);
    if(home.crest) for(const [z,rot] of [[5,Math.PI/2],[115,-Math.PI/2]]) {draw(home.crest,150,z*sz,150,rot);draw(home.crest,874,z*sz,150,rot);}
    return tex;
  }
  // ---------------------------------------------------------------- estadio
  buildStadium() {
    const V=THREE.Vector3,M=(color,o={})=>new THREE.MeshStandardMaterial({color,roughness:.85,...o});
    const merge=(list,mat,shadow=false)=>{const m=new THREE.Mesh(mergeGeometries(list),mat);m.receiveShadow=true;m.castShadow=shadow;this.scene.add(m);return m;};
    this.stadium={led:[],cones:[],lamps:[]};
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(420,420),M('#1d2a24',{roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.set(0,-.3,50);ground.receiveShadow=true;this.scene.add(ground);
    // entorno del campo: sintético del borde y la franja de equipo
    const surround=new THREE.Mesh(new THREE.PlaneGeometry(74,138),M('#2c5c35',{roughness:1}));surround.rotation.x=-Math.PI/2;surround.position.set(0,-.02,50);surround.receiveShadow=true;this.scene.add(surround);
    this.fieldMaterial=new THREE.MeshStandardMaterial({map:this.textureCanvas(),roughness:.95});const field=new THREE.Mesh(new THREE.PlaneGeometry(53.3,120),this.fieldMaterial);field.rotation.x=-Math.PI/2;field.position.set(0,.015,50);field.receiveShadow=true;this.scene.add(field);
    const box=(list,w,h,d,x,y,z,ry=0)=>{const g=new THREE.BoxGeometry(w,h,d);if(ry)g.rotateY(ry);g.translate(x,y,z);list.push(g);return g;};
    // ---- tribunas: 3 niveles alrededor (anillos de rectángulo redondeado centrados en z = 50)
    const conc=[],seats=[],rails=[],slots=[];
    const tier=(hx,hz,r,rows,d,rise,y0,step)=>{
      for(let i=0;i<rows;i++){const top=y0+.6+i*rise;conc.push(band(hx+i*d,hz+i*d,r+i*d,d+.02,y0-1,top-y0+1));seats.push(band(hx+i*d+d*.62,hz+i*d+d*.62,r+i*d+d*.62,.22,top,.18));
        for(const p of perimeter(hx+i*d+d*.5,hz+i*d+d*.5,r+i*d+d*.5,step))slots.push({...p,y:top});}
      return {hx:hx+rows*d,hz:hz+rows*d,r:r+rows*d,top:y0+.6+(rows-1)*rise};
    };
    const L1=tier(37,68,10,16,1,.55,0,.72);
    conc.push(band(36.4,67.4,9.4,.6,0,1.6)); // muro frontal
    rails.push(band(L1.hx,L1.hz,L1.r,.08,L1.top,1));
    // palcos con vidrio (nivel 2): banda vidriada con interiores iluminados y cinta LED
    const suiteTex=canvasTex(1024,128,(g,w,h)=>{g.fillStyle='#0f141a';g.fillRect(0,0,w,h);for(let i=0;i<16;i++){const x=i*64+3,gr=g.createLinearGradient(0,8,0,h-14);gr.addColorStop(0,'#ffd79a');gr.addColorStop(1,'#6e4524');g.fillStyle=gr;g.fillRect(x,10,58,h-28);g.fillStyle='rgba(15,10,8,.8)';for(let k=0;k<3;k++){const px=x+10+k*18;g.beginPath();g.ellipse(px,62,5,6,0,0,7);g.fill();g.fillRect(px-7,68,14,30);}g.fillStyle='rgba(200,230,255,.25)';g.fillRect(x,10,58,12);}g.fillStyle='#1b2129';g.fillRect(0,h-16,w,16);});
    suiteTex.wrapS=THREE.RepeatWrapping;suiteTex.repeat.set(14,1);
    conc.push(band(L1.hx,L1.hz,L1.r,4,0,L1.top+.2));
    const sy=L1.top+.2;this.scene.add(new THREE.Mesh(fascia(L1.hx+4,L1.hz+4,L1.r+4,sy,3.4),new THREE.MeshBasicMaterial({map:suiteTex,toneMapped:false})));
    const ribbon=ledStrip(10,64);ribbon.repeat.set(10,1);this.stadium.led.push({tex:ribbon,speed:.02});
    const L2base=sy+3.4;this.scene.add(new THREE.Mesh(fascia(L1.hx+4.4,L1.hz+4.4,L1.r+4.4,L2base,1.1),new THREE.MeshBasicMaterial({map:ribbon,toneMapped:false})));
    const L2=tier(L1.hx+4.4,L1.hz+4.4,L1.r+4.4,10,1.05,.7,L2base+.6,.74);
    rails.push(band(L1.hx+4.36,L1.hz+4.36,L1.r+4.36,.08,L2base+1.1,1));
    // nivel 3 (bandeja alta, más empinada)
    const L3base=L2.top+1.8;conc.push(band(L2.hx,L2.hz,L2.r,1.4,0,L3base));
    const ribbon2=ledStrip(10,64);ribbon2.repeat.set(12,1);this.stadium.led.push({tex:ribbon2,speed:-.015});
    this.scene.add(new THREE.Mesh(fascia(L2.hx+1.4,L2.hz+1.4,L2.r+1.4,L3base-1,1),new THREE.MeshBasicMaterial({map:ribbon2,toneMapped:false})));
    const L3=tier(L2.hx+1.4,L2.hz+1.4,L2.r+1.4,14,1.1,.85,L3base,.78);
    rails.push(band(L2.hx+1.36,L2.hz+1.36,L2.r+1.36,.08,L3base+.4,1.1));
    conc.push(band(L3.hx,L3.hz,L3.r,1.2,0,L3.top+2.4)); // muro de coronamiento
    this.bowl={L1,L2,L3};
    // pasillos (escaleras claras) en posiciones fijas del contorno
    const aisles=Array.from({length:24},(_,i)=>(i+.5)/24),inAisle=u=>aisles.some(a=>Math.abs(((u-a+1.5)%1)-.5)<.0035);
    merge(conc,M('#262d35',{roughness:.95}),true);
    this.seatMat=M('#1d3e66',{roughness:.7});merge(seats,this.seatMat);
    merge(rails,M('#8b949e',{metalness:.6,roughness:.4}));
    // ---- techo parcial: voladizo sobre el nivel 3 con cerchas. BackSide: desde arriba (cámaras altas) no tapa; desde el campo se ve
    const roofY=L3.top+7,roofIn=L3.hx-14;
    const roof=new THREE.Mesh(band(roofIn,L3.hz-14,L3.r-6,L3.hx-roofIn+2,roofY,1.2),M('#b9c0c8',{metalness:.3,roughness:.6,side:THREE.BackSide}));this.scene.add(roof);
    const truss=[];for(const p of perimeter(L3.hx-6,L3.hz-6,L3.r-6,9)){const ang=Math.atan2(p.x,p.z-50);
      const g=new THREE.BoxGeometry(.35,.35,16);g.rotateY(ang);g.translate(p.x,roofY-.4,p.z);truss.push(g);
      const col=new THREE.BoxGeometry(.6,roofY-L3.top+.5,.6);col.translate(p.x*1.08,(roofY+L3.top)/2,50+(p.z-50)*1.06);truss.push(col);}
    merge(truss,M('#6b747e',{metalness:.6,roughness:.45}));
    // luminarias en el borde interior del techo (brillo + conos)
    this.lampMat=new THREE.MeshBasicMaterial({color:'#fffbe8',toneMapped:false});const lamps=[];
    for(const p of perimeter(roofIn+.5,L3.hz-13.5,L3.r-5.5,7)){const g=new THREE.BoxGeometry(2.2,.5,.4);g.rotateY(Math.atan2(p.x,p.z-50));g.translate(p.x,roofY-.5,p.z);lamps.push(g);}
    this.scene.add(new THREE.Mesh(mergeGeometries(lamps),this.lampMat));
    // torres de focos en las esquinas
    const towers=[],heads=[];for(const [x,z] of [[-70,-38],[70,-38],[-70,138],[70,138]]){box(towers,1.4,roofY+16,1.4,x,(roofY+16)/2,z);const g=new THREE.BoxGeometry(10,4,.6);g.lookAt(new V(-x,-(roofY+16),50-z));g.translate(x*.97,roofY+16,50+(z-50)*.97);heads.push(g);}
    merge(towers,M('#7c8790',{metalness:.5,roughness:.5}));this.scene.add(new THREE.Mesh(mergeGeometries(heads),this.lampMat));
    // ---- videomarcadores en ambas cabeceras (sobre el nivel 3) y anillo LED alrededor del campo
    this.boards=[];for(const [z,ry] of [[L3.hz+50-8,Math.PI],[50-L3.hz+8,0]]){
      const cv=document.createElement('canvas');cv.width=1024;cv.height=384;const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;
      const g=new THREE.Group();g.position.set(0,L3.top+10,z);g.rotation.y=ry;this.scene.add(g);
      const fr=new THREE.Mesh(new THREE.BoxGeometry(44,17,1.4),M('#0b0e12'));g.add(fr);
      const scr=new THREE.Mesh(new THREE.PlaneGeometry(42,15.7),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));scr.position.z=.72;g.add(scr);
      const leg=new THREE.Mesh(new THREE.BoxGeometry(1.2,12,1.2),M('#39414a'));leg.position.set(-14,-13,0);g.add(leg);const leg2=leg.clone();leg2.position.x=14;g.add(leg2);
      this.boards.push({cv,t,key:''});
    }
    const led=ledStrip(8,96);const ledSegs=[[118,34.2,50,-Math.PI/2,10],[118,-34.2,50,Math.PI/2,10],[56,0,-14.2,0,5],[56,0,114.2,Math.PI,5]];
    for(const [w,x,z,ry,rep] of ledSegs){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;this.scene.add(g);
      const back=new THREE.Mesh(new THREE.BoxGeometry(w,1.1,.35),M('#0b0e12'));back.position.set(0,.55,-.2);g.add(back);
      const tex=led.clone();tex.repeat.set(rep,1);tex.needsUpdate=true;this.stadium.led.push({tex,speed:.025});
      const face=new THREE.Mesh(new THREE.PlaneGeometry(w,.95),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));face.position.set(0,.56,.001);g.add(face);}
    // ---- túnel de jugadores (esquina de la cabecera sur) y banquillos/zona técnica con staff
    // boca del túnel en el muro frontal de la cabecera (el interior queda oculto bajo la tribuna)
    const tun=[];box(tun,.5,4.6,.4,-28,2.3,-17.2);box(tun,.5,4.6,.4,-20,2.3,-17.2);box(tun,8.5,.6,.4,-24,4.4,-17.2);merge(tun,M('#2a313a',{metalness:.4}));
    const mouth=new THREE.Mesh(new THREE.PlaneGeometry(7.6,4.1),new THREE.MeshBasicMaterial({color:'#05070a'}));mouth.position.set(-24,2.05,-17.05);this.scene.add(mouth);
    const tunTex=canvasTex(512,64,(g,w,h)=>{g.fillStyle=this.teams?.[0]?.color??'#1f5f8b';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='900 40px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText((this.teams?.[0]?.mascot??'LOCAL'),w/2,h/2+2);});
    this.tunnelSign=new THREE.Mesh(new THREE.PlaneGeometry(9,1.1),new THREE.MeshBasicMaterial({map:tunTex,toneMapped:false}));this.tunnelSign.position.set(-24,5.3,-17.0);this.scene.add(this.tunnelSign);
    const bench=[],cool=[];
    for(const sign of [-1,1]){for(let z=20;z<=80;z+=4){box(bench,1,.5,3.4,sign*31.5,.25,z);box(bench,.2,.8,3.4,sign*32.1,.7,z);}
      for(const z of [18,50,82])box(cool,.8,1,.8,sign*33,.5,z);
      const stripe=new THREE.Mesh(new THREE.PlaneGeometry(4,70),new THREE.MeshStandardMaterial({color:sign<0?(this.teams?.[0]?.dark??'#193c4a'):(this.teams?.[1]?.dark??'#563c2b'),roughness:1}));stripe.rotation.x=-Math.PI/2;stripe.position.set(sign*31,.005,50);this.scene.add(stripe);}
    merge(bench,M('#39424c'));merge(cool,M('#e0721f',{roughness:.5}));
    // ---- público (billboards instanciados con atlas; ola y reacciones en el shader)
    this.buildCrowd(slots.filter(p=>!inAisle(p.u)));
    const staff=[];for(const sign of [-1,1])for(let z=22;z<=78;z+=2.2)staff.push([sign*(30+Math.random()*2.5),z,Math.random()<.35?1.9:1.7]);
    this.buildStaff(staff);
    // ---- postes (base acolchada), pylons y skycam
    for(const z of [-10,110]) {
      const mat=new THREE.MeshStandardMaterial({color:'#f8ce4f',metalness:.35,roughness:.45});
      const pole=(r,h,x,y,zz,rot=0)=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),mat);p.position.set(x,y,zz);p.rotation.z=rot;p.castShadow=true;this.scene.add(p);};
      pole(.16,3.35,0,1.67,z+(z<0?-1.2:1.2));pole(.12,1.6,0,3.3,z+(z<0?-.6:.6),0);
      const neck=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,1.25,10),mat);neck.rotation.x=Math.PI/2;neck.position.set(0,3.35,z+(z<0?-.6:.6));this.scene.add(neck);
      pole(.12,5.64,0,3.05,z,Math.PI/2);pole(.095,9,3.08,7.85,z);pole(.095,9,-3.08,7.85,z);
      const pad=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,2.2,16),M(this.teams?.[0]?.color??'#1f5f8b',{roughness:.9}));pad.position.set(0,1.1,z+(z<0?-1.2:1.2));pad.castShadow=true;this.scene.add(pad);this.padMat=this.padMat||[];this.padMat.push(pad.material);
      for(const x of [-3.08,3.08]){const flag=new THREE.Mesh(new THREE.PlaneGeometry(.12,1),new THREE.MeshBasicMaterial({color:'#ff6a2a',side:THREE.DoubleSide}));flag.position.set(x,12.6,z);this.scene.add(flag);}
    }
    for(const z of [-10,0,100,110]) for(const x of [-26.8,26.8]) this.box(.3,.9,.3,'#ff7a2a',x,.45,z);
    const cornerAnchors=[[-L2.hx+2,L2.top+2,50-L2.hz+6],[L2.hx-2,L2.top+2,50-L2.hz+6],[-L2.hx+2,L2.top+2,50+L2.hz-6],[L2.hx-2,L2.top+2,50+L2.hz-6]].map(a=>new V(...a));
    this.skycam={anchors:cornerAnchors,pos:new V(0,20,50),cables:new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(new Array(24).fill(0),3)),new THREE.LineBasicMaterial({color:'#20262d'}))};
    this.scene.add(this.skycam.cables);
    const pod=new THREE.Group();const body=new THREE.Mesh(new THREE.SphereGeometry(.7,12,10),M('#15191e',{metalness:.4}));body.scale.set(1,.7,1);pod.add(body);const lens=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,.5,10),M('#0a0a0a'));lens.position.y=-.55;pod.add(lens);
    this.skycam.pod=pod;this.scene.add(pod);
    // referís de campo
    for(const x of [-28.5,28.5]) for(const z of [15,40,65,90]) {
      const ref=createPlayer({color:'#e4e3db',dark:'#17212c'},'CB',0);ref.position.set(x,0,z);ref.scale.setScalar(.9);this.scene.add(ref);
      for(let i=-2;i<=2;i++) {const stripe=new THREE.Mesh(new THREE.BoxGeometry(.045,.64,.495),new THREE.MeshStandardMaterial({color:'#222b30'}));stripe.position.set(i*.14,1.13,0);ref.userData.rig.add(stripe);}
    }
    // cielo (domo) para el modo de día/tarde/noche
    this.sky=new THREE.Mesh(new THREE.SphereGeometry(380,24,12),new THREE.MeshBasicMaterial({side:THREE.BackSide,vertexColors:true,fog:false,depthWrite:false}));
    const sg=this.sky.geometry,cols=[];for(let i=0;i<sg.attributes.position.count;i++)cols.push(1,1,1);sg.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));this.sky.position.set(0,0,50);this.scene.add(this.sky);
  }
  buildCrowd(slots) {
    const n=slots.length,rng=new Random(891),atlas=crowdAtlas();
    const geo=new THREE.PlaneGeometry(.66,1.05);geo.translate(0,.5,0);
    const aVar=new Float32Array(n),aPhase=new Float32Array(n),aFan=new Float32Array(n),aU=new Float32Array(n);
    const uniforms={uTime:{value:0},uCheer:{value:new THREE.Vector2()},uWave:{value:-1}};
    const mat=new THREE.MeshLambertMaterial({map:atlas,alphaTest:.5,side:THREE.DoubleSide});
    mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,uniforms);
      sh.vertexShader='attribute float aVar;attribute float aPhase;attribute float aFan;attribute float aU;uniform float uTime;uniform vec2 uCheer;uniform float uWave;\n'+sh.vertexShader
        .replace('#include <uv_vertex>','#include <uv_vertex>\n vMapUv=vec2((uv.x+aVar)*.25,uv.y);')
        .replace('#include <begin_vertex>',`#include <begin_vertex>
          float ch=aFan>.5?uCheer.y:uCheer.x;
          float dw=abs(fract(aU-uWave+.5)-.5); float wv=uWave<0.?0.:smoothstep(.03,0.,dw);
          transformed.y+=sin(uTime*1.3+aPhase*6.28)*.015+ch*abs(sin(uTime*(7.+aPhase*3.)+aPhase*6.28))*.34+wv*.55;
          transformed.x+=ch*sin(uTime*5.+aPhase*9.)*.03;`);
      sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','').replace('#include <map_fragment>',`#include <map_fragment>
          float skin=step(.12,diffuseColor.r-diffuseColor.b);
          #if defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
            diffuseColor.rgb*=mix(vColor.rgb,vec3(1.),skin);
          #endif`);};
    const mesh=new THREE.InstancedMesh(geo,mat,n);mesh.frustumCulled=false;const d=new THREE.Object3D();this.crowdMeta=[];
    slots.forEach((p,i)=>{d.position.set(p.x,p.y+.02,p.z);d.rotation.set(0,Math.atan2(-p.x,50-p.z),0);const s=rng.range(.92,1.1);d.scale.set(s,s,s);d.updateMatrix();mesh.setMatrixAt(i,d.matrix);
      aVar[i]=Math.floor(rng.next()*4);aPhase[i]=rng.next();aU[i]=p.u;aFan[i]=(p.z<-5&&rng.next()<.7)||rng.next()<.1?1:0;this.crowdMeta.push({fan:aFan[i],k:rng.next()});});
    for(const [k,a] of Object.entries({aVar,aPhase,aFan,aU}))geo.setAttribute(k,new THREE.InstancedBufferAttribute(a,1));
    this.crowd=mesh;this.crowdUniforms=uniforms;this.scene.add(mesh);this.recolorCrowd();
  }
  recolorCrowd() {
    const neutral=['#2b3440','#e9e4da','#3d4a3a','#6b6f78','#1c1f24','#8a5b3b','#415a78'],col=new THREE.Color(),t=this.teams||[];
    this.crowdMeta.forEach((c,i)=>{col.set(c.k<.55?(c.fan?t[1]?.color??'#b0502c':t[0]?.color??'#1f5f8b'):c.k<.62?'#ffffff':neutral[Math.floor(c.k*97)%neutral.length]);col.offsetHSL(0,0,(c.k-.5)*.12);this.crowd.setColorAt(i,col);});
    this.crowd.instanceColor.needsUpdate=true;
  }
  buildStaff(list) {
    const sm=new THREE.InstancedMesh(new THREE.PlaneGeometry(.75,1.15).translate(0,.57,0),new THREE.MeshLambertMaterial({map:crowdAtlas(),alphaTest:.5,side:THREE.DoubleSide}),list.length);
    sm.material.onBeforeCompile=sh=>{sh.vertexShader='attribute float aVar;\n'+sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n vMapUv=vec2((uv.x+aVar)*.25,uv.y);');sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','').replace('#include <map_fragment>','#include <map_fragment>\n float skin=step(.12,diffuseColor.r-diffuseColor.b);\n #ifdef USE_INSTANCING_COLOR\n diffuseColor.rgb*=mix(vColor.rgb,vec3(1.),skin);\n #endif');};
    const av=new Float32Array(list.length),d=new THREE.Object3D(),col=new THREE.Color();
    list.forEach(([x,z,sc],i)=>{d.position.set(x,0,z);d.rotation.set(0,x<0?Math.PI/2:-Math.PI/2,0);d.scale.setScalar(sc);d.updateMatrix();sm.setMatrixAt(i,d.matrix);av[i]=i%4;sm.setColorAt(i,col.set(x<0?(this.teams?.[0]?.color??'#1f5f8b'):(this.teams?.[1]?.color??'#b0502c')).offsetHSL(0,0,-.1));});
    sm.geometry.setAttribute('aVar',new THREE.InstancedBufferAttribute(av,1));this.staffMesh=sm;this.scene.add(sm);
  }
  // el público salta (0 = local, 1 = visitante)
  cheer(team=0,strength=1) { this.cheerLevel=this.cheerLevel||[0,0];const i=team?1:0;this.cheerLevel[i]=Math.max(this.cheerLevel[i],strength); }
  wave() { this.waveT=0; }
  // 0 = día, 1 = atardecer, 2 = noche: luz, niebla, cielo y luminarias
  setTimeOfDay(k) {
    this.tod=Math.max(0,Math.min(2,k|0));const P=[
      {top:'#5d9bd6',hor:'#cfe3f2',fog:'#a9c4d6',sun:'#fff3dc',si:3.1,hemi:2.1,sp:[-35,90,20],lamp:.0,ex:1.2},
      {top:'#2d3f6e',hor:'#f0a060',fog:'#8a6c63',sun:'#ffb070',si:2.1,hemi:1.4,sp:[-90,35,-20],lamp:.6,ex:1.25},
      {top:'#05080f',hor:'#1b2433',fog:'#0d131c',sun:'#cfe0ff',si:.9,hemi:.7,sp:[-20,110,40],lamp:1,ex:1.3}][this.tod];
    this.scene.fog.color.set(P.fog);this.scene.background=new THREE.Color(P.fog);
    const top=new THREE.Color(P.top),hor=new THREE.Color(P.hor),pos=this.sky.geometry.attributes.position,col=this.sky.geometry.attributes.color;
    for(let i=0;i<pos.count;i++){const t=Math.max(0,pos.getY(i)/380);const c=hor.clone().lerp(top,Math.pow(t,.6));col.setXYZ(i,c.r,c.g,c.b);}col.needsUpdate=true;
    this.sun.color.set(P.sun);this.sun.intensity=P.si+P.lamp*1.6;this.sun.position.set(...P.sp);this.hemi.intensity=P.hemi+P.lamp*.5;
    this.lampMat.color.setScalar(.35+P.lamp*.65);this.renderer.toneMappingExposure=P.ex;
  }
  // videomarcadores: el snapshot no trae el marcador; se lee del HUD de la página (#score-0/1, #quarter, #game-clock, #down)
  hud() { const q=id=>document.getElementById(id)?.textContent?.trim()??'';return {s:[q('score-0')||'0',q('score-1')||'0'],q:q('quarter'),clk:q('game-clock'),down:q('down')}; }
  drawBoards() {
    const t=this.teams||[],h=this.hud(),key=JSON.stringify(h);
    for(const b of this.boards){if(b.key===key)continue;b.key=key;const g=b.cv.getContext('2d'),W=1024,H=384;
      g.fillStyle='#05070a';g.fillRect(0,0,W,H);
      for(let i=0;i<2;i++){const x0=i?W/2+10:10;g.fillStyle=t[i]?.color??'#333';g.fillRect(x0,10,W/2-20,80);g.fillStyle='#fff';g.font='900 56px Arial Narrow, Arial';g.textAlign='center';g.fillText((t[i]?.mascot??'').slice(0,14),x0+W/4-10,72);
        g.fillStyle='#ffd24a';g.font='900 170px Arial Narrow, Arial';g.fillText(h.s[i],x0+W/4-10,250);}
      g.fillStyle='#10161f';g.fillRect(0,286,W,98);g.fillStyle='#ff4a3a';g.font='900 70px Arial Narrow, Arial';g.textAlign='center';g.fillText(`${h.q}  ${h.clk}`,W/2,360);
      g.textAlign='left';g.fillStyle='#9fb3c8';g.font='800 36px Arial';g.fillText(h.down,24,350);
      g.fillStyle='rgba(0,0,0,.22)';for(let y=0;y<H;y+=4)g.fillRect(0,y,W,1);b.t.needsUpdate=true;}
  }
  // por cuadro: anillo LED, público (reacción a anotaciones + ola), skycam y videomarcadores
  stadiumTick(snapshot,dt) {
    this.st=(this.st||0)+dt;for(const l of this.stadium.led)l.tex.offset.x=(l.tex.offset.x+l.speed*dt)%1;
    const hs=this.hud().s,sc=[+hs[0]||0,+hs[1]||0];{const s0=sc[0],s1=sc[1];if(this.lastScore&&(s0>this.lastScore[0]||s1>this.lastScore[1])){this.cheer(s0>this.lastScore[0]?0:1,1);if(s0-this.lastScore[0]>=6||s1-this.lastScore[1]>=6)this.wave();}this.lastScore=[s0,s1];}
    this.cheerLevel=this.cheerLevel||[0,0];for(let i=0;i<2;i++)this.cheerLevel[i]=Math.max(0,this.cheerLevel[i]-dt/3.5);
    if(this.waveT==null&&Math.random()<dt/90)this.wave();
    if(this.waveT!=null){this.waveT+=dt;if(this.waveT>9)this.waveT=null;}
    const u=this.crowdUniforms;u.uTime.value=this.st;u.uCheer.value.set(Math.min(1,this.cheerLevel[0]),Math.min(1,this.cheerLevel[1]));u.uWave.value=this.waveT==null?-1:(this.waveT/9)%1;
    // skycam: sigue a la pelota por encima del campo
    const k=this.skycam,b=snapshot.ball;k.pos.lerp(new THREE.Vector3(b.x*.6,19,Math.max(-5,Math.min(105,b.z-10))),1-Math.exp(-dt*1.2));k.pod.position.copy(k.pos);
    const a=k.cables.geometry.attributes.position;k.anchors.forEach((p,i)=>{a.setXYZ(i*2,p.x,p.y,p.z);a.setXYZ(i*2+1,k.pos.x,k.pos.y+.4,k.pos.z);});a.needsUpdate=true;
    this.boardTick=(this.boardTick||0)+dt;if(this.boardTick>.25){this.boardTick=0;this.drawBoards();}
  }
  setTeams(teams) { this.teams=teams;this.rosterKey=null;const old=this.fieldMaterial.map;this.fieldMaterial.map=this.textureCanvas(teams);this.fieldMaterial.needsUpdate=true;old?.dispose();
    if(this.crowd)this.recolorCrowd();for(const m of this.padMat||[])m.color.set(teams?.[0]?.color??'#1f5f8b');if(this.seatMat)this.seatMat.color.set(teams?.[0]?.color??'#1d3e66').multiplyScalar(.5);if(this.boards)this.boards.forEach(b=>b.key=''); }
  resize() { const {clientWidth:w,clientHeight:h}=this.container;if(!w||!h)return;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix(); }
  syncPlayers(snapshot) {
    const key=snapshot.players.map(p=>`${p.id}:${p.role}:${p.number}`).join(',')+snapshot.offense;
    if(key===this.rosterKey)return;
    for(const root of this.meshes.values()) {this.scene.remove(root);this.animation.dispose(root);}this.meshes.clear();
    for(const p of snapshot.players) {const team=this.teams[p.side==='O'?snapshot.offense:1-snapshot.offense];const root=createPlayer(team,p.role,p.number,p.look);if(p.look?.h){const k=Math.max(.9,Math.min(1.1,p.look.h/188)),w=Math.max(.88,Math.min(1.25,Math.pow(p.look.w/225,.32)));root.scale.set(w,k,w);}root.userData.id=p.id;this.meshes.set(p.id,root);this.scene.add(root);}
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
    this.updateLines(snapshot.los,snapshot.lineToGain);this.stadiumTick(snapshot,dt||1/60);
    if(!this.cameraController.__em&&window.EM&&window.EM.cams)window.EM.cams.wrap(this.cameraController,{THREE:{Vector3:THREE.Vector3},dom:this.renderer.domElement,axis:'z',half:[55,27],center:[50,0],hLow:3,hHigh:45,r:60,hOrb:32,pad:14,speed:40,defaultMode:'broadcast',focus:a=>({x:a[0].ball.x*.15,y:1,z:a[0].ball.z})});
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
