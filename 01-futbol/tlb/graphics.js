// Original broadcast models, built locally from geometry. One shared GPU context for all inserts.
const TLBGraphics = (() => {
  const views=new Set(); let renderer=null, last=0;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mesh(g,m,p,x=0,y=0,z=0){const o=new T3.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o;}
  const material=(c,metal=.05)=>new T3.MeshStandardMaterial({color:c,roughness:metal>.3?.32:.78,metalness:metal});
  const box=(p,w,h,d,c,x=0,y=0,z=0)=>mesh(new T3.BoxGeometry(w,h,d),typeof c==='object'?c:material(c),p,x,y,z);
  const sphere=(p,r,c,x=0,y=0,z=0)=>mesh(new T3.SphereGeometry(r,16,12),typeof c==='object'?c:material(c),p,x,y,z);
  const cylinder=(p,a,b,h,c,x=0,y=0,z=0)=>mesh(new T3.CylinderGeometry(a,b,h,32),typeof c==='object'?c:material(c),p,x,y,z);
  function texture(w,h,paint){const c=document.createElement('canvas');c.width=w;c.height=h;paint(c.getContext('2d'),w,h);const t=new T3.CanvasTexture(c);t.colorSpace=T3.SRGBColorSpace;return t;}
  function textBoard(p,text,w,h,x,y,z,bg='#153543',fg='#eee6cc'){
    const t=texture(1024,256,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.fillStyle=fg;c.fillRect(0,H-14,W,6);c.textAlign='center';c.font='bold 72px Arial';c.fillText(text,W/2,148,W-50);});
    return mesh(new T3.PlaneGeometry(w,h),new T3.MeshBasicMaterial({map:t}),p,x,y,z);
  }
  function scene(){const s=new T3.Scene();s.add(new T3.HemisphereLight('#e4eff6','#454346',2.2));const l=new T3.DirectionalLight('#fff0d3',3);l.position.set(-3,6,7);s.add(l);const fill=new T3.DirectionalLight('#aac5dc',1.5);fill.position.set(5,3,-2);s.add(fill);return s;}
  function dispose(s){const geo=new Set(),mat=new Set(),tex=new Set();s.traverse(o=>{if(o.geometry)geo.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){mat.add(m);for(const v of Object.values(m))if(v?.isTexture)tex.add(v);}});geo.forEach(x=>x.dispose());mat.forEach(x=>x.dispose());tex.forEach(x=>x.dispose());}
  function mount(host,s,camera,update,{className='tlb-gfx',fps=30}={}){
    if(!renderer){try{renderer=new T3.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(1);renderer.outputColorSpace=T3.SRGBColorSpace;renderer.setClearColor(0x000000,0);}catch(e){console.warn('Broadcast 3D unavailable',e);return null;}}
    const canvas=document.createElement('canvas');canvas.className=className;canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
    const v={host,canvas,ctx:canvas.getContext('2d'),scene:s,camera,update,fps,at:performance.now(),last:0,stop(){views.delete(v);dispose(s);canvas.remove();}};views.add(v);return v;
  }
  function frame(now){
    if(now-last<32)return;last=now;
    for(const v of views){
      if(!v.host.isConnected){v.stop();continue;}
      if(now-v.last<1000/v.fps||v.host.closest('[hidden]'))continue;
      const r=v.host.getBoundingClientRect();if(r.width<2||r.height<2)continue;
      v.last=now;const scale=Math.min(1.35,devicePixelRatio||1,1280/r.width),w=Math.round(r.width*scale),h=Math.round(r.height*scale);
      if(v.canvas.width!==w||v.canvas.height!==h){v.canvas.width=w;v.canvas.height=h;}
      renderer.setSize(w,h,false);v.camera.aspect=w/h;v.camera.updateProjectionMatrix();
      v.update?.((now-v.at)/1000,v);renderer.render(v.scene,v.camera);
      v.ctx.clearRect(0,0,w,h);v.ctx.drawImage(renderer.domElement,0,0,w,h);
    }
  }
  function camera(fov=38){const c=new T3.PerspectiveCamera(fov,1,.05,200);c.position.set(0,2,9);c.lookAt(0,1,0);return c;}
  function ball(p,r=.7){
    const map=texture(512,256,(c,w,h)=>{c.fillStyle='#e7e3d8';c.fillRect(0,0,w,h);c.strokeStyle='#6e736f';c.lineWidth=2;for(let row=0;row<4;row++)for(let col=0;col<8;col++){const x=col*72+(row%2)*36,y=row*78;c.beginPath();for(let j=0;j<6;j++){const a=j*Math.PI/3;c.lineTo(x+37*Math.cos(a),y+37*Math.sin(a));}c.closePath();c.stroke();if((col+row)%3===0){c.fillStyle='#1a2329';c.fill();}}});
    return mesh(new T3.SphereGeometry(r,28,20),new T3.MeshStandardMaterial({map,roughness:.5}),p);
  }
  // --- LFO: caché de imágenes (escudos/logos reales del juego) ---
  const imgCache=new Map();
  function loadImg(src){
    if(!src)return null;
    if(imgCache.has(src))return imgCache.get(src);
    const im=new Image();im.crossOrigin='anonymous';im.src=src;imgCache.set(src,im);return im;
  }
  const LFO_LOGO='equiposfut/ligadefutbolonlinelogo.png';
  const LFO_TROPHY='equiposfut/copaonline.png';
  function crestSrc(t){
    try{const T=ht.teams[t];if(T&&T.crest)return T.crest;}catch(e){}
    return LFO_LOGO;
  }
  /* Textura que se repinta cuando la imagen termina de cargar: las gráficas 3D
     muestran el escudo real del club, no las iniciales. */
  function liveTexture(w,h,paint,src){
    const cv=document.createElement('canvas');cv.width=w;cv.height=h;
    const ctx=cv.getContext('2d');
    const tex=new T3.CanvasTexture(cv);tex.colorSpace=T3.SRGBColorSpace;
    const im=loadImg(src);
    const draw=()=>{paint(ctx,w,h,im&&im.complete&&im.naturalWidth?im:null);tex.needsUpdate=true;};
    draw();
    if(im&&!im.complete)im.addEventListener('load',draw,{once:true});
    return tex;
  }
  // Escudo 3D: placa cromada + logo real del club
  function shield(p,name,color,x,y,z,scale=1,team=null){
    const g=new T3.Group();p.add(g);g.position.set(x,y,z);g.scale.setScalar(scale);
    const plate=box(g,1.12,1.3,.15,'#d7dde3',0,0,0);plate.rotation.z=.02;
    const src=team!=null?crestSrc(team):LFO_LOGO;
    const map=liveTexture(256,320,(c,w,h,im)=>{
      c.clearRect(0,0,w,h);
      // silueta de escudo con borde cromado
      c.beginPath();c.moveTo(20,16);c.lineTo(236,16);c.lineTo(220,220);c.lineTo(128,300);c.lineTo(36,220);c.closePath();
      const gr=c.createLinearGradient(0,0,0,h);
      gr.addColorStop(0,'#ffffff');gr.addColorStop(.42,'#c9d2db');gr.addColorStop(.5,'#8e99a5');gr.addColorStop(.62,'#d3dbe3');gr.addColorStop(1,'#ffffff');
      c.fillStyle=gr;c.fill();
      c.save();c.clip();
      c.fillStyle=color||'#003366';c.globalAlpha=.55;c.fillRect(0,0,w,h);c.globalAlpha=1;
      if(im){c.drawImage(im,34,40,188,188);}
      else{c.fillStyle='#f0f5fa';c.fillRect(35,116,186,64);c.fillStyle='#01274c';c.font='bold 54px Arial';c.textAlign='center';c.fillText(name.split(' ').map(x=>x[0]).slice(0,4).join(''),128,165,178);}
      c.restore();
      c.strokeStyle='#ffffff';c.lineWidth=12;c.stroke();
      // nombre corto abajo
      c.fillStyle='#01274c';c.fillRect(38,238,180,36);
      c.fillStyle='#ffffff';c.font='bold 26px Arial';c.textAlign='center';
      c.fillText((name||'').toUpperCase().slice(0,12),128,264,170);
    },src);
    mesh(new T3.PlaneGeometry(1.08,1.34),new T3.MeshBasicMaterial({map,transparent:true}),g,0,0,.085);return g;
  }
  // Placa/plano con el logo de la liga o la copa (para stingers y transiciones)
  function logoPlane(p,x,y,z,size=1.6,src=LFO_TROPHY){
    const map=liveTexture(320,320,(c,w,h,im)=>{
      c.clearRect(0,0,w,h);
      if(im)c.drawImage(im,0,0,w,h);
    },src);
    return mesh(new T3.PlaneGeometry(size,size),new T3.MeshBasicMaterial({map,transparent:true}),p,x,y,z);
  }
  function stinger(host,kind,color,duration){
    const s=scene(),c=camera(36),g=new T3.Group();s.add(g);c.position.set(0,.6,10);c.lookAt(0,0,0);
    const chrome=material('#dfe5ea',.92);
    box(g,7.8,2.7,.24,chrome);box(g,7.58,2.48,.26,'#01274c',0,0,.04);
    box(g,7.6,.17,.34,color,0,-1.08,.12);
    box(g,7.6,.13,.32,'#ffffff',0,1.12,.12);
    // Copa Online / logo de la liga a la izquierda de la placa (marca de la transmisión)
    const stCup=logoPlane(g,-2.95,.15,.3,1.9,LFO_TROPHY);
    for(let i=0;i<5;i++){const q=box(g,.14,2.4,.15,color,-3.5+i*.18,0,.25);q.rotation.z=-.2;}
    const orbit=new T3.Group();g.add(orbit);orbit.position.set(2.8,.8,.5);
    const ring=mesh(new T3.RingGeometry(.83,.91,64),chrome,orbit);ring.material.side=T3.DoubleSide;ring.rotation.x=.55;
    let obj;
    if(kind==='yellow'||kind==='red'){obj=box(orbit,.66,1.03,.07,kind==='yellow'?'#edc837':'#b92c28');obj.rotation.z=-.16;}
    else if(kind==='sub'){obj=new T3.Group();orbit.add(obj);for(const [y,col,sgn]of [[.25,'#80ae70',1],[-.25,'#ca5140',-1]]){box(obj,1.15,.12,.12,col,0,y,.2);for(const z of [-1,1]){const b=box(obj,.4,.12,.12,col,sgn*.46,y+z*.12,.2);b.rotation.z=z*sgn*Math.PI/4;}}}
    else if(kind==='corner'){obj=new T3.Group();orbit.add(obj);cylinder(obj,.025,.025,1.7,chrome);box(obj,.6,.4,.035,color,.28,.55,0);}
    else obj=ball(orbit,.64);
    const particles=[];for(let i=0;i<14;i++){const p=box(s,.07,.22,.04,i%2?color:chrome);particles.push(p);}
    return mount(host,s,c,(t)=>{
      const u=t/(duration/1000),enter=smooth(t/.48),exit=smooth((u-.84)/.16);
      g.position.x=reduced?0:(1-enter)*-12+exit*14;g.rotation.y=reduced?0:(1-enter)*-.85+exit*.7;
      obj.rotation.y=t*.9;ring.rotation.z=t*.6;
      if(stCup){stCup.position.y=.15+Math.sin(t*2.1)*.07;stCup.rotation.z=Math.sin(t*1.4)*.08;}
      particles.forEach((p,i)=>{p.position.set(Math.sin(i*7.31)*5,Math.cos(i*2.71)*2.2+Math.sin(t+i)*.15,-1);p.rotation.z=t+i;});
      c.position.z=10+(1-enter)*3+exit*2;
      // Narrow viewports fit the entire plate rather than clipping names.
      c.position.z=Math.max(c.position.z,4.5/Math.tan(c.fov*Math.PI/360)/c.aspect);
    });
  }
  function human(parent,{female=false,suit='#343d4b',shirt='#e2dfd4',skin='#c38d6b',jersey=false}={}){
    const root=new T3.Group();parent.add(root);const body=new T3.Group();root.add(body);
    const cloth=material(suit),skinMat=material(skin),white=material(shirt),dark=material('#262222');
    for(const x of [-.14,.14]){cylinder(body,.10,.08,.84,dark,x,.46);const boot=box(body,.19,.11,.34,'#171a1b',x,.065,.065);}
    const torso=cylinder(body,female?.24:.30,.21,.66,cloth,0,1.17);torso.scale.z=.65;
    box(body,.22,.44,.028,white,0,1.28,.17);
    if(!jersey){for(const sign of [-1,1]){const lapel=box(body,.13,.39,.04,cloth,sign*.14,1.34,.2);lapel.rotation.z=sign*.22;}if(!female)box(body,.055,.34,.035,'#8e3835',0,1.23,.20);}
    cylinder(body,.07,.085,.12,skinMat,0,1.53);
    const head=new T3.Group();head.position.y=1.72;body.add(head);
    const face=sphere(head,.185,skinMat);face.scale.set(.84,1.13,.85);
    const hair=sphere(head,.19,'#30251f',0,.09,-.028);hair.scale.set(.86,.68,.84);
    if(female){const back=sphere(head,.20,'#34251f',0,-.055,-.105);back.scale.set(.93,1.45,.5);}
    for(const sign of [-1,1]){
      sphere(head,.033,skinMat,sign*.153,-.012,0);
      const eye=sphere(head,.019,'#e8e4d8',sign*.065,.017,.139);eye.scale.y=.6;
      sphere(head,.009,'#272b2c',sign*.064,.017,.154);
      box(head,.048,.01,.017,'#392a23',sign*.064,.053,.14);
    }
    const nose=sphere(head,.032,skinMat,0,-.02,.164);nose.scale.set(.63,1.1,.9);
    const mouth=box(head,.060,.012,.015,female?'#8d4c45':'#794f42',0,-.092,.144);
    const arms=[];
    for(const sign of [-1,1]){
      const pivot=new T3.Group();pivot.position.set(sign*.29,1.43,0);body.add(pivot);
      cylinder(pivot,.083,.072,.33,cloth,0,-.14);
      const elbow=new T3.Group();elbow.position.y=-.32;pivot.add(elbow);
      cylinder(elbow,.065,.045,.3,jersey?skinMat:cloth,0,-.14);
      sphere(elbow,.057,skinMat,0,-.33,.025);
      for(let i=0;i<4;i++)cylinder(elbow,.008,.006,.07,skinMat,(i-1.5)*.018,-.38,.036);
      arms.push({pivot,elbow,sign});
    }
    return {root,body,head,mouth,arms};
  }
  function studio(host){
    const s=scene(),c=camera(42);s.background=new T3.Color('#84949b');
    box(s,24,.18,18,'#4b5861',0,-.1,0);
    cylinder(s,4.8,4.8,.08,'#8d8e85',0,.02,.3);
    cylinder(s,4.6,4.6,.08,'#26404c',0,.065,.3);
    // Avenida at dusk: modeled skyline, warm windows and the obelisk.
    const windows=texture(128,256,(ctx,w,h)=>{ctx.fillStyle='#4f606b';ctx.fillRect(0,0,w,h);for(let y=8;y<h;y+=23)for(let x=8;x<w;x+=21){ctx.fillStyle=((x+y)%4)?'#c7b78a':'#314854';ctx.fillRect(x,y,9,12);}});
    const citymat=new T3.MeshStandardMaterial({map:windows,roughness:1});
    for(let i=0;i<25;i++){const h=1.6+(Math.sin(i*4.83)+1)*1.4;box(s,.5+(i%3)*.24,h,.8,citymat,(i-12)*.72,h/2,-6-(i%3)*.35);}
    cylinder(s,.045,.20,3.8,'#c6c8b7',-4,1.9,-5.8);
    for(const x of [-6,-3,3,6])box(s,.09,5.8,.12,'#c1c4bd',x,2.9,-4.7);
    for(const y of [1.0,4.3])box(s,14,.07,.10,'#c1c4bd',0,y,-4.7);
    box(s,4.9,2.45,.35,'#adb2b1',0,2.42,-3.2);
    box(s,4.62,2.2,.38,'#18282e',0,2.42,-3.17);
    const screenCanvas=document.createElement('canvas');screenCanvas.width=1024;screenCanvas.height=512;
    const screenTexture=new T3.CanvasTexture(screenCanvas);screenTexture.colorSpace=T3.SRGBColorSpace;
    mesh(new T3.PlaneGeometry(4.42,2),new T3.MeshBasicMaterial({map:screenTexture}),s,0,2.42,-2.96);
    let screenText='';
    const lucia=human(s,{female:true,suit:'#744545',skin:'#cf9b7d'}),diego=human(s,{suit:'#26374b',skin:'#b88664'});
    lucia.root.position.set(-1.5,.18,0);diego.root.position.set(1.5,.18,0);
    lucia.root.scale.setScalar(1.12);diego.root.scale.setScalar(1.16);
    // Segmented curved desk with a real thick worktop, chrome rails and ribbed fascia.
    const silver=material('#b8c0bd',.7);
    for(let i=0;i<19;i++){
      const a=-1.0+i/18*2,x=Math.sin(a)*3.25,z=Math.cos(a)*1.25;
      const panel=box(s,.35,.88,.20,'#42606a',x,.62,z);panel.rotation.y=-a*.45;
      const top=box(s,.43,.10,.83,silver,x,1.10,z);top.rotation.y=-a*.45;
      for(const y of [.35,.78]){const rail=box(s,.39,.045,.24,silver,x,y,z+.14);rail.rotation.y=-a*.45;}
    }
    textBoard(s,'LFO · LIGA DE FÚTBOL ONLINE',2.8,.32,0,.68,1.48);
    for(const x of [-1.6,1.6]){cylinder(s,.09,.075,.19,'#ece5d0',x,1.25,1);box(s,.40,.025,.27,'#e8dfc8',x+.3,1.17,.97);}
    for(const x of [-4.8,4.8]){box(s,.33,4.1,.45,silver,x,2,-1.1);for(const y of [.5,1.4,2.3,3.2])box(s,.36,.08,.48,'#ab4635',x,y,-1.1);}
    const overhead=mesh(new T3.RingGeometry(3.1,3.65,64),silver,s,0,4,0);overhead.rotation.x=Math.PI/2;overhead.material.side=T3.DoubleSide;
    textBoard(s,'EN VIVO',1.6,.35,4,3.4,-1.0,'#912e2d');
    const pos=new T3.Vector3(0,2.8,10),look=new T3.Vector3(0,1.55,0),target=new T3.Vector3();
    return mount(host,s,c,(t)=>{
      const who=host.querySelector('.tlb-host.a')?.classList.contains('talk')?0:1;
      [lucia,diego].forEach((h,i)=>{
        const active=i===who, beat=active?Math.sin(t*3.8):Math.sin(t*.65)*.15;
        h.head.rotation.set(active?Math.sin(t*2.6)*.05:.02,active?Math.sin(t*.7)*.1:(i?-.2:.2),beat*.018);
        h.body.rotation.z=Math.sin(t*.8+i)*.015;
        h.arms.forEach((arm,j)=>{arm.pivot.rotation.set(-.6-(active?.18*Math.sin(t*2+j):0),0,arm.sign*.14);arm.elbow.rotation.x=-.8-(active?.22*(.5+.5*Math.sin(t*3+j)):0);});
        h.mouth.scale.y=active?1+.25*Math.sin(t*7):1;
      });
      const mode=reduced?0:Math.floor(t/9)%4;
      if(mode===0){target.set(0,2.8,10);look.lerp(new T3.Vector3(0,1.55,0),.08);}
      else if(mode===3){target.set(0,2.6,5.9);look.lerp(new T3.Vector3(0,2,-2),.08);}
      else {target.set(who?2.1:-2.1,2.25,7.5);look.lerp(new T3.Vector3(who?.85:-.85,1.6,0),.06);}
      target.z=Math.max(target.z,7.3/Math.max(.75,c.aspect));pos.lerp(target,.035);c.position.copy(pos);c.lookAt(look);
      const txt=host.querySelector('.tlb-screen')?.textContent||'LFO';
      if(txt!==screenText){screenText=txt;const ctx=screenCanvas.getContext('2d');ctx.fillStyle='#13353b';ctx.fillRect(0,0,1024,512);ctx.fillStyle='#bfcac2';ctx.fillRect(0,0,1024,62);ctx.fillStyle='#19333f';ctx.font='bold 32px Arial';ctx.fillText('LFO | MESA DE ANÁLISIS',28,43);ctx.fillStyle='#eee6ce';ctx.font='bold 29px Arial';const words=txt.split(/\s+/);let line='',y=120;for(const word of words){if(ctx.measureText(line+' '+word).width>940){ctx.fillText(line,32,y);y+=43;line=word;}else line+=' '+word;}ctx.fillText(line,32,y);screenTexture.needsUpdate=true;}
    });
  }
  function card(host,source){
    const s=scene(),c=camera(34);c.position.set(0,0,4.1);c.lookAt(0,0,0);
    const g=new T3.Group();s.add(g);const ratio=source.width/source.height,h=2,w=2*ratio;
    box(g,w+.07,h+.07,.09,material('#c7bb91',.55));
    const map=new T3.CanvasTexture(source);map.colorSpace=T3.SRGBColorSpace;
    mesh(new T3.PlaneGeometry(w,h),new T3.MeshBasicMaterial({map}),g,0,0,.052);
    textBoard(g,'LFO',w,h,0,0,-.052).rotation.y=Math.PI;
    return mount(host,s,c,(t)=>{g.rotation.y=reduced?-.12:Math.sin(t*.9)*.18-.12;g.rotation.z=-.025;c.position.z=Math.max(3.5,(w+.12)/(2*Math.tan(c.fov*Math.PI/360)*c.aspect));},{className:'tlb-gfx tlb-card3d',fps:15});
  }
  function tactical(host,team){
    const s=scene(),c=camera(40);s.background=new T3.Color('#17343b');c.position.set(0,12,8);c.lookAt(0,0,0);
    const map=texture(768,1024,(ctx,w,h)=>{
      for(let i=0;i<12;i++){ctx.fillStyle=i%2?'#335e51':'#2d574b';ctx.fillRect(0,i*h/12,w,h/12);}
      ctx.strokeStyle='#b4c7b6';ctx.lineWidth=5;ctx.strokeRect(22,22,w-44,h-44);ctx.beginPath();ctx.moveTo(22,h/2);ctx.lineTo(w-22,h/2);ctx.stroke();ctx.beginPath();ctx.arc(w/2,h/2,94,0,Math.PI*2);ctx.stroke();for(const y of [22,h-185])ctx.strokeRect(w*.2,y,w*.6,163);for(const y of [22,h-82])ctx.strokeRect(w*.36,y,w*.28,60);
    });
    box(s,7.5,.2,10,'#bdc0ac',0,-.16,0);const pitch=mesh(new T3.PlaneGeometry(7.35,9.85),new T3.MeshStandardMaterial({map,roughness:1}),s);pitch.rotation.x=-Math.PI/2;
    const ps=ht.players.filter(p=>p.team===team).slice(0,11),ranks={GK:0,DEF:1,MID:2,FWD:3}, rows={};ps.forEach(p=>(rows[p.role]??=[]).push(p));
    const models=[];for(const p of ps){const row=rows[p.role],i=row.indexOf(p),x=(i-(row.length-1)/2)*Math.min(1.4,5.6/row.length),z=3.8-ranks[p.role]*2.4;
      const m=human(s,{suit:ht.teams[team].color,shirt:ht.teams[team].color,jersey:true,skin:p.appearance?.skin||'#c38d6b'});m.root.position.set(x,0,z);m.root.scale.setScalar(.40);models.push(m);
    }
    const point=new T3.Vector3();const chips=[...host.querySelectorAll('.tlb-chip')];
    return mount(host,s,c,t=>{if(!reduced)c.position.x=Math.sin(t*.22)*.2;c.position.y=Math.max(12,9/c.aspect);c.lookAt(0,0,0);c.updateMatrixWorld();models.forEach((m,i)=>{m.head.rotation.y=Math.sin(t+i)*.06;point.copy(m.root.position);point.y=.02;point.project(c);const el=chips[i];if(el){el.style.left=((point.x+1)*50)+'%';el.style.top=((-point.y+1)*50+2)+'%';}});});
  }
  function intro(host){
    const s=scene(),c=camera(44);s.background=new T3.Color('#758b95');
    box(s,11,.22,7,'#426849',0,0,0);
    for(const z of [-4.5,4.5])for(let i=0;i<6;i++)box(s,14,.38,.6,i%2?'#b3b1a1':'#7c8582',0,.3+i*.38,z+Math.sign(z)*i*.46);
    for(const x of [-7,7])for(let i=0;i<6;i++)box(s,.6,.38,10,i%2?'#a7aba0':'#738284',x+Math.sign(x)*i*.46,.3+i*.38,0);
    for(const z of [-6.3,6.3])box(s,17,.14,2.5,'#8b999c',0,3,z);
    const lights=[];for(const x of [-8,8])for(const z of [-6,6]){cylinder(s,.055,.09,5,'#9ba9a6',x,2.5,z);box(s,1.3,.8,.1,'#e7e4cf',x,5,z);const beam=mesh(new T3.CylinderGeometry(.15,1.2,5,12,1,true),new T3.MeshBasicMaterial({color:'#efe6c7',transparent:true,opacity:.065,depthWrite:false,side:T3.DoubleSide}),s,x,2.5,z);lights.push(beam);}
    const a=shield(s,ht.teams[0].name,ht.teams[0].color,-3.1,3.6,3,1.6,0),b=shield(s,ht.teams[1].name,ht.teams[1].color,3.1,3.6,3,1.6,1);
    // Copa Online flotando entre los dos escudos
    const cup=logoPlane(s,0,4.1,3.2,2.4,LFO_TROPHY);
    return mount(host,s,c,t=>{c.position.set(reduced?0:Math.sin(t*.17)*2,8.2,18);c.lookAt(0,1.4,0);c.position.z=Math.max(18,17/c.aspect);a.rotation.y=Math.sin(t*.5)*.08;b.rotation.y=-a.rotation.y;lights.forEach((l,i)=>l.rotation.z=Math.sin(t+i)*.13);if(cup){cup.position.y=4.1+Math.sin(t*1.1)*.16;cup.rotation.z=Math.sin(t*.7)*.06;}});
  }
  // Upgrade the existing referee in place; the original event positioning remains authoritative.
  let field=null;
  function fieldFrame(r,m,time){
    if(!r||!r.refGroup)return;
    if(!field||field.renderer!==r){
      r.refGroup.children.slice().forEach(o=>{r.refGroup.remove(o);dispose(o);});
      const ref=human(r.refGroup,{suit:'#d4b440',shirt:'#d4b440',jersey:true});
      const card=box(ref.arms[1].elbow,.13,.21,.025,'#edcc36',0,-.44,.035);card.visible=false;
      // Old render logic still controls visibility and event-relative placement of this object.
      r.refCard=card;field={renderer:r,ref,card};
    }
    const {ref,card}=field, ev=m.events.find(e=>e.type==='card'&&m.elapsed-e.at<4);
    if(ev){const age=Math.max(0,m.elapsed-ev.at),e=smooth(age/.55)*(1-smooth((age-2.6)/1.2));ref.arms[1].pivot.rotation.x=-2.9*e;ref.arms[1].elbow.rotation.x=-.12;card.visible=e>.1;card.material.color.set(/ROJA/.test(ev.title)?'#bf3429':'#e5c22f');card.material.opacity=1;}
    else{ref.arms.forEach((a,i)=>{a.pivot.rotation.x=Math.sin(time*3+i*Math.PI)*.15;a.elbow.rotation.x=-.35;});card.visible=false;}
    // Blink and emotional mouth shape reuse existing face meshes, no per-frame allocation.
    r.models.forEach((md,i)=>{
      if(!md.tlFace){md.tlFace=md.body.children.filter(o=>o.isMesh&&o.position.z>.12&&o.position.y>1.68&&o.position.y<1.85);}
      const blink=Math.sin(time*.63+i*3)> .997;
      for(const o of md.tlFace)if(o.geometry?.type==='SphereGeometry'&&o.geometry.parameters.radius<.02)o.scale.y=blink?.09:.65;
    });
  }
  return {frame,stinger,studio,card,tactical,intro,fieldFrame,views,shield,logoPlane,crestSrc,LFO_LOGO,LFO_TROPHY};
})();
