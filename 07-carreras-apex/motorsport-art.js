'use strict';
// Original, procedural artwork. Shared geometry powers the collection and race.
const RacingArt = (() => {
  const T = window.THREE;
  const cache = new Map();
  // Each profile has its own bonnet, roof line, wheelbase and front/rear treatment.
  const specs = {
    classic:   {color:'#ff7c24',width:1.03,length:1.02,roof:2.02,cabin:-.35,roofLen:1.36,nose:1.24,axle:1.96,grille:'camaro',lights:'slit',rear:'square'},
    touring:   {color:'#b92035',width:.98,length:1.02,roof:2.22,cabin:.03,roofLen:1.95,nose:1.22,axle:2.02,grille:'alfa',lights:'triple',rear:'slit'},
    sprint:    {color:'#346ee7',width:1.04,length:1.05,roof:2.04,cabin:-.35,roofLen:1.5,nose:1.3,axle:2.04,grille:'mustang',lights:'triple',rear:'triple'},
    endurance: {color:'#e8edf2',width:1.04,length:1.05,roof:2.18,cabin:-.08,roofLen:1.68,nose:1.31,axle:2.03,grille:'bmw',lights:'twin',rear:'slit'},
    aero:      {color:'#13bfae',width:1.05,length:1.07,roof:1.99,cabin:-.68,roofLen:1.35,nose:1.22,axle:2.07,grille:'amg',lights:'slash',rear:'slit'},
    track:     {color:'#96a9b9',width:1.04,length:1,roof:1.93,cabin:.22,roofLen:1.45,nose:1.07,axle:1.99,grille:'audi',lights:'slash',rear:'slit',mid:true},
    spectre:   {color:'#ed3049',width:1.05,length:1,roof:1.87,cabin:.3,roofLen:1.15,nose:.97,axle:1.95,grille:'ferrari',lights:'blade',rear:'round',mid:true},
    raijin:    {color:'#4484df',width:1.07,length:1.04,roof:2.16,cabin:-.08,roofLen:1.75,nose:1.34,axle:2.01,grille:'nissan',lights:'slash',rear:'round'},
    mistral:   {color:'#78b849',width:1.04,length:1.03,roof:1.98,cabin:-.46,roofLen:1.38,nose:1.14,axle:2.04,grille:'aston',lights:'blade',rear:'bar'},
    valkyr:    {color:'#f6c743',width:1.01,length:.95,roof:2.03,cabin:.18,roofLen:1.15,nose:1.01,axle:1.88,grille:'porsche',lights:'round',rear:'bar'},
    corsair:   {color:'#ae87ee',width:1.08,length:1.03,roof:1.89,cabin:.38,roofLen:1.14,nose:1.03,axle:2.02,grille:'corvette',lights:'blade',rear:'square',mid:true}
  };
  function trackCurve(def){
    const curve = new T.CatmullRomCurve3(layoutForTrack(def).map(([x,z])=>new T.Vector3(x,0,z)),true,'catmullrom',.35);
    curve.arcLengthDivisions=5000;
    return curve;
  }
  if(T) TRACKS.forEach(def=>{def.lengthKm=trackCurve(def).getLength()/1000;});
  const mat = (c,metalness=.25,roughness=.32) => new T.MeshStandardMaterial({color:c,metalness,roughness});
  function mesh(g,geo,m,x=0,y=0,z=0){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
  function block(g,m,w,h,d,x=0,y=0,z=0){return mesh(g,new T.BoxGeometry(w,h,d),m,x,y,z);}
  function cyl(g,m,r,h,x=0,y=0,z=0,n=32){return mesh(g,new T.CylinderGeometry(r,r,h,n),m,x,y,z);}
  function ball(g,m,r,x=0,y=0,z=0){return mesh(g,new T.SphereGeometry(r,32,20),m,x,y,z);}
  function tube(g,m,points,r){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),32,r,8,false),m);}
  function shell(g,m,sections){
    const vertices=[],indices=[];
    sections.forEach(([z,w,base,top,tw])=>vertices.push(-w,base,z,w,base,z,tw,top,z,-tw,top,z));
    for(let i=0;i<sections.length-1;i++)for(let j=0;j<4;j++){const a=i*4+j,b=i*4+(j+1)%4,c=a+4,d=b+4;indices.push(a,b,c,b,d,c);}
    indices.push(0,2,1,0,3,2);let e=(sections.length-1)*4;indices.push(e,e+1,e+2,e,e+2,e+3);
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();return mesh(g,geo,m);
  }
  function decal(text,color='#ffffff',bg=null){
    const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');
    if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);}ctx.fillStyle=color;ctx.font='italic 900 82px Arial';ctx.textAlign='center';ctx.fillText(text,256,94);
    const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
    return new T.MeshStandardMaterial({map,transparent:true,roughness:.45,side:T.DoubleSide});
  }
  function panel(g,m,points,z){
    const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
    return mesh(g,new T.ShapeGeometry(shape),m,0,0,z);
  }
  function car(key='classic',color,number='07'){
    const s=specs[key]||specs.classic,g=new T.Group(),body=new T.Group();g.add(body);
    g.userData.bodyType=key;g.userData.model=BODIES[key]?.name||key;
    const paint=mat(color||s.color,.48,.28),carbon=mat('#111820',.25,.5),chrome=mat('#adbdca',.8,.25),glass=mat('#122735',.65,.17),white=mat('#f2f5f3',.2,.4);
    const lamp=new T.MeshStandardMaterial({color:'#edfaff',emissive:'#c3ebff',emissiveIntensity:.8});
    const red=new T.MeshStandardMaterial({color:'#ef1631',emissive:'#ea0823',emissiveIntensity:.7});
    // A chamfered monocoque with real wheel cutouts, not the old flat prototype slab.
    const sections=[];
    for(let i=0;i<=64;i++){
      const z=-3.1+i*6.2/64;
      const end=Math.pow(Math.abs(z)/3.1,5),waist=Math.exp(-Math.pow(z/.95,2));
      const width=1.51-end*.2-waist*(s.mid?.16:.07);
      const hood=z>1?(1.36+(s.nose-1.36)*(z-1)/2.1):1.38;
      const top=z< -2.25?1.35-(Math.abs(z)-2.25)*.12:hood;
      let base=.43;
      for(const axle of [-s.axle,s.axle]){const dz=Math.abs(z-axle);if(dz<.67)base=Math.max(base,.61+Math.sqrt(.67*.67-dz*dz));}
      sections.push([z,width,Math.min(base,top-.045),top,width-.16]);
    }
    shell(body,paint,sections);
    block(body,carbon,2.6,.13,6.22,0,.41,0);
    // A separate greenhouse changes the actual silhouette of every model.
    const back=s.cabin-s.roofLen/2,front=s.cabin+s.roofLen/2;
    const rearFoot=key==='valkyr'?-2.65:back-(s.mid?.63:1.0);
    const cabSections=[[rearFoot,1.12,1.35,1.39,1.05],[back-.25,1.13,1.37,s.roof-.15,.96],[back,1.13,1.37,s.roof, .94],[front,1.13,1.34,s.roof-.035,.94],[front+.82,1.12,1.32,1.38,1.08]];
    shell(body,glass,cabSections);
    shell(body,paint,[[back-.21,.96,s.roof-.13,s.roof-.1,.94],[back,.97,s.roof-.015,s.roof+.035,.93],[front,.97,s.roof-.04,s.roof,.93]]);
    // Windscreen frames, door seams, broad fenders and GT side skirts.
    for(const side of [-1,1]){
      tube(body,paint,[[side*1.11,1.39,front+.82],[side*.95,s.roof,front],[side*.95,s.roof+.02,back],[side*1.11,1.4,rearFoot]],.05);
      const pillar=block(body,paint,.06,s.roof-1.36,.11,side*1.075,(s.roof+1.36)/2,s.cabin-.15);pillar.rotation.z=side*.2;
      block(body,carbon,.10,.14,3.15,side*1.49,.45,0);
      block(body,white,.045,.045,2.64,side*1.51,.58,-.05);
      block(body,carbon,.21,.09,.13,side*1.44,1.18,s.cabin-.5);
      block(body,carbon,.25,.07,.23,side*1.48,1.48,front+.28);
      block(body,paint,.29,.15,.36,side*1.63,1.51,front+.29);
      const l=mesh(body,new T.PlaneGeometry(2.15,.38),decal(s.grille.toUpperCase()),side*1.451,.89,-.1);l.rotation.y=side*Math.PI/2;
      const n=mesh(body,new T.PlaneGeometry(.58,.43),decal(number,'#111927','#f4efdb'),side*1.475,1.08,.73);n.rotation.y=side*Math.PI/2;
      if(key==='touring')block(body,carbon,.024,.5,.025,side*1.445,.96,-.6);
      if(s.mid||key==='track'){
        block(body,carbon,.06,.55,.7,side*1.46,1.06,-.95);
        const blade=block(body,key==='track'?chrome:paint,.10,.68,.12,side*1.5,1.13,-1.28);blade.rotation.x=-.35;
      }
      // Fenders arch above the tyres and follow their silhouette.
      for(const z of [-s.axle,s.axle]){
        const arch=mesh(body,new T.TorusGeometry(.68,.045,6,24,Math.PI),paint,side*1.49,.61,z);arch.rotation.y=Math.PI/2;
        for(let j=0;j<3;j++)block(body,carbon,.19,.015,.055,side*1.21,1.395,z-.13+j*.11);
      }
    }
    // Brand-specific front fascia geometry, not just a different paint color.
    const z=3.115;
    const outline=(pts)=>panel(body,carbon,pts,z);
    if(s.grille==='alfa'){
      panel(body,chrome,[[-.4,1.18],[.4,1.18],[0,.51]],z+.025);
      panel(body,carbon,[[-.32,1.13],[.32,1.13],[0,.61]],z+.03);
      for(const x of [-.85,.85])block(body,carbon,.77,.25,.07,x,.71,z);
    }else if(s.grille==='bmw'){
      for(const x of [-.31,.31]){
        block(body,chrome,.55,.82,.07,x,.92,z);
        block(body,carbon,.46,.75,.08,x,.92,z+.015);
        for(let j=0;j<5;j++)block(body,chrome,.39,.022,.025,x,.64+j*.14,z+.06);
      }
      for(const x of [-1.02,1.02])block(body,carbon,.43,.29,.07,x,.73,z);
    }else{
      const shape=s.grille==='audi'?[[-1.03,.63],[-1.15,.85],[-.87,1.15],[.87,1.15],[1.15,.85],[1.03,.63]]:
        s.grille==='aston'?[[-1.12,.6],[-1.25,.85],[-.8,1.02],[.8,1.02],[1.25,.85],[1.12,.6]]:
        s.grille==='amg'?[[-1.08,.64],[-1.18,.86],[-.93,1.16],[.93,1.16],[1.18,.86],[1.08,.64]]:
        [[-1.0,.62],[-1.15,.84],[-.8,Math.min(1.12,s.nose-.1)],[.8,Math.min(1.12,s.nose-.1)],[1.15,.84],[1,.62]];
      outline(shape);
      if(s.grille==='amg'){
        for(let j=-7;j<=7;j++)block(body,chrome,.027,.37,.025,j*.125,.88,z+.02);
        const ring=mesh(body,new T.TorusGeometry(.18,.024,8,24),chrome,0,.89,z+.05);
        for(let j=0;j<3;j++){const spoke=block(body,chrome,.025,.18,.025,Math.sin(j*2.094)*.08,.89+Math.cos(j*2.094)*.08,z+.06);spoke.rotation.z=-j*2.094;}
      }else{
        for(let j=0;j<3;j++)block(body,chrome,1.58,.018,.026,0,.72+j*.095,z+.01);
      }
      if(s.grille==='camaro')block(body,carbon,2.45,.13,.09,0,1.19,z);
      if(s.grille==='nissan'){for(const x of [-.61,.61])block(body,chrome,.06,.48,.035,x,.91,z+.02);}
    }
    for(const side of [-1,1]){
      if(s.lights==='round'){
        const housing=ball(body,carbon,.3,side*1.05,1.27,2.82);housing.scale.set(1,1.25,.42);
        const light=ball(body,lamp,.238,side*1.05,1.29,2.93);light.scale.set(1,1.24,.42);
      }else{
        const ly=s.nose-.02;
        const h=block(body,carbon,.67,.19,.09,side*.95,ly,z+.01);h.rotation.z=side*(s.lights==='slash'?.18:0);
        const l=block(body,lamp,.59,.046,.035,side*.95,ly+.035,z+.07);l.rotation.z=h.rotation.z;
        if(s.lights==='triple'||s.lights==='twin')for(let j=0;j<(s.lights==='triple'?3:2);j++)block(body,lamp,.045,.095,.03,side*(.76+j*.17),ly-.035,z+.075);
        if(s.lights==='blade'){const l=block(body,lamp,.05,.16,.04,side*1.22,ly-.05,z+.05);l.rotation.z=side*-.55;}
      }
      if(s.rear==='round')for(const x of [.72,1.1]){const tail=ball(body,red,.135,side*x,1.16,-3.1);tail.scale.z=.28;}
      else if(s.rear==='triple')for(let j=0;j<3;j++)block(body,red,.1,.25,.05,side*(.65+j*.2),1.11,-3.12);
      else block(body,red,s.rear==='bar'?1.23:.74,.065,.05,side*(s.rear==='bar'?.63:.92),1.12,-3.12);
      const support=block(body,carbon,.095,.59,.14,side*.99,1.63,-2.7);support.rotation.x=key==='valkyr'?-.35:.1;
      block(body,paint,.06,.32,.83,side*1.65,1.94,-2.75);
    }
    block(body,carbon,3.1,.09,.5,0,.42,3.02);
    block(body,carbon,3.35,.105,.77,0,1.97,-2.73);
    block(body,paint,3.3,.025,.09,0,2.04,-3.08);
    for(let j=-4;j<=4;j++)block(body,carbon,.045,.24,.48,j*.28,.5,-3.02);
    const exhausts=s.mid?[-.3,.3]:[-.97,.97];
    for(const x of exhausts){const pipe=cyl(body,chrome,.11,.22,x,.65,-3.14);pipe.rotation.x=Math.PI/2;}
    if(s.mid)for(let j=0;j<7;j++)block(body,carbon,1.45,.03,.06,0,1.43,-1.7-j*.13);
    if(key==='spectre'||key==='corsair')for(const x of [-.87,.87])shell(body,paint,[[-2.65,.08,1.32,1.4,.05],[-1.25,.10,1.33,1.68,.04],[-.95,.08,1.34,1.75,.04]]).position.x=x;
    if(key==='classic'||key==='sprint')shell(body,carbon,[[1.0,.38,1.36,1.5,.31],[1.8,.4,1.3,1.43,.32],[2.65,.32,s.nose,1.33,.25]]);
    const hood=mesh(body,new T.PlaneGeometry(.63,.63),decal(number),0,1.405,1.22);hood.rotation.x=-Math.PI/2;hood.rotation.z=Math.PI;
    const roofNumber=mesh(body,new T.PlaneGeometry(.73,.68),decal(number),0,s.roof+.065,s.cabin);roofNumber.rotation.x=-Math.PI/2;roofNumber.rotation.z=Math.PI;
    const wheels=[],rubber=mat('#101115',.02,.95),rimMat=mat(key==='valkyr'?'#dfbd66':'#697985',.8,.28);
    for(const x of [-1.47,1.47])for(const z of [-s.axle,s.axle]){
      const w=new T.Group();w.position.set(x,.61,z);body.add(w);
      const tire=cyl(w,rubber,.61,.43,0,0,0,24);tire.rotation.z=Math.PI/2;
      const rim=cyl(w,carbon,.43,.449,0,0,0,24);rim.rotation.z=Math.PI/2;
      const disc=cyl(w,chrome,.34,.452,0,0,0,20);disc.rotation.z=Math.PI/2;
      block(w,mat('#ff4433'),.46,.28,.12,0,.19,.2);
      for(let j=0;j<10;j++){const a=j*Math.PI/5;const spoke=block(w,rimMat,.47,.035,.41,0,Math.sin(a)*.2,Math.cos(a)*.2);spoke.rotation.x=-a;}
      const hub=cyl(w,chrome,.08,.48,0,0,0,12);hub.rotation.z=Math.PI/2;wheels.push(w);
    }
    body.scale.set(s.width,1,s.length);
    return {group:g,body,wheels,paint};
  }
  function part(type,color='#40baff'){
    const g=new T.Group(),metal=mat('#afbbc8',.88,.25),dark=mat('#252d3b',.75,.32),accent=mat(color,.56,.23),rubber=mat('#111620',.05,.8);
    if(type==='engine'){
      block(g,dark,1.4,.9,1.65,0,.1,0);
      for(const x of [-.65,.65]){const head=block(g,metal,.67,.55,1.7,x,.65,0);head.rotation.z=-Math.sign(x)*.3;block(g,accent,.56,.16,1.64,x,.96,0);
        for(let j=0;j<4;j++)tube(g,metal,[[x,.5,-.6+j*.4],[x*1.6,.28,-.6+j*.4],[x*1.7,-.4,-.5+j*.4],[x*.7,-.55,.85]],.085);}
      for(const [r,y] of [[.4,.3],[.27,-.4]]){const c=cyl(g,metal,r,.16,0,y,1);c.rotation.x=Math.PI/2;const h=cyl(g,dark,r*.6,.18,0,y,1.03);h.rotation.x=Math.PI/2;}
      block(g,accent,.9,.26,.9,0,1.13,-.1);
    }else if(type==='brakes'||type==='tyres'){
      const wheel=cyl(g,type==='tyres'?rubber:metal,1,.42);wheel.rotation.x=Math.PI/2;
      const ring=mesh(g,new T.TorusGeometry(.8,.1,12,48),type==='tyres'?accent:dark,0,0,.24);
      const hub=cyl(g,dark,.4,.52);hub.rotation.x=Math.PI/2;
      for(let j=0;j<12;j++){const a=j/12*Math.PI*2;if(type==='brakes')for(const r of [.62,.82]){const hole=cyl(g,dark,.035,.02,Math.cos(a)*r,Math.sin(a)*r,.22);hole.rotation.x=Math.PI/2;}else{const spoke=block(g,metal,.09,1.4,.07,0,0,.28);spoke.rotation.z=a;}}
      if(type==='brakes')block(g,accent,.46,1.14,.5,.84,0,.2);
    }else if(type==='aero'){
      for(const x of [-.9,.9]){block(g,metal,.14,1,.23,x,-.2,0);block(g,accent,.1,.6,1.25,x*1.55,.42,0);}
      const wing=block(g,accent,2.95,.16,1.1,0,.43,0);wing.rotation.x=-.13;block(g,dark,2.85,.06,.2,0,.56,-.5);
    }else if(type==='suspension'){
      cyl(g,metal,.13,2.8);cyl(g,dark,.24,1.6,0,-.5);cyl(g,accent,.43,.13,0,-1.05);cyl(g,accent,.43,.13,0,1.05);
      const pts=Array.from({length:180},(_,i)=>{const a=i/179*Math.PI*18;return [Math.cos(a)*.34,-.9+i/179*1.8,Math.sin(a)*.34];});tube(g,accent,pts,.075);g.rotation.z=-.38;
    }else if(type==='gearbox'){
      for(let i=0;i<5;i++){const c=cyl(g,i%2?dark:metal,.7-i*.1,.4,0,0,-.7+i*.38);c.rotation.x=Math.PI/2;}
      block(g,accent,1.2,.6,1.1,0,.3,-.5);const axle=cyl(g,metal,.13,2.5);axle.rotation.z=Math.PI/2;
    }else if(type==='cooling'){
      block(g,dark,2,1.8,.4);for(let i=0;i<20;i++)block(g,metal,1.8,.035,.45,0,-.79+i*.08,0);
      for(const x of [-1,1])block(g,accent,.18,1.95,.5,x,0,0);tube(g,metal,[[-1,.8,0],[-1.3,1,0],[-1.3,1.3,0]],.12);
    }else{
      block(g,metal,1.9,.6,1.65);block(g,accent,1.75,.065,1.5,0,.34,0);for(let i=0;i<7;i++)block(g,dark,.09,.07,1.25,-.6+i*.2,.41,0);
      for(let i=0;i<4;i++){block(g,dark,.3,.23,.32,-.6+i*.4,0,.93);tube(g,i%2?accent:rubber,[[-.6+i*.4,0,1],[-.6+i*.4,-.4,1.5],[.8,-.6,1.4]],.05);}
    }
    return g;
  }
  // Original vector portraits: stable facial identity per driver, zero WebGL cost.
  function portrait(d){
    const n=Number(d.id)||0,seed=(n*7+Number(d.number))%31;
    const skin=['#edb89a','#c98863','#e0a681','#b87a56','#f1c5a7','#9d654a'][seed%6];
    const shade=['#c88672','#9d5e44','#b3795b','#895039','#c9967d','#774630'][seed%6];
    const hair=['#25232a','#3d2c27','#6c4930','#b08a57','#181b23'][n%5];
    const color='#'+d.color.toString(16).padStart(6,'0'),accent=d.accent||'#e8e4d4';
    const jaw=47+(n%4)*3,eye=112+(n%3)*2,brow=eye-10;
    const hairstyles=[
      'M99 102Q84 47 116 38Q147 11 186 39Q210 51 204 99L192 84 184 65Q151 83 113 68Z',
      'M97 99Q81 75 97 56Q87 38 109 36Q119 16 137 28Q154 13 172 30Q195 23 203 46Q223 56 204 98L189 76Q150 58 109 82Z',
      'M99 96 96 64Q103 27 150 29Q197 30 203 67L201 97 189 72Q154 54 111 72Z',
      'M97 111Q79 60 109 41Q150 15 189 36Q220 59 200 110L190 79Q176 57 145 60L111 83 108 110Z',
      'M96 99 91 56 106 61 111 32 125 41 139 24 153 34 177 26 178 40 197 38 207 64 201 105 188 76Q144 66 111 81Z'
    ];
    const beard=d.age>=29&&n%3!==1?`<path d="M104 133Q113 175 150 182Q190 170 198 133L186 153 173 159Q152 169 127 157Z" fill="${hair}" opacity=".48"/><path d="M132 149Q150 144 168 149" fill="none" stroke="${hair}" stroke-width="3"/>`:'';
    // colores de las banderas de las naciones ficticias (assets/nations)
    const flagColors={PER:['#f4f7fb','#7fbde0','#f4f7fb'],VAL:['#3b8fdc','#fff','#f58a2a'],CUN:['#0c76a0','#fff','#0bbf0b'],GRA:['#f41b1b','#fff','#f0c030'],IBE:['#aa1000','#111','#06256d'],KAI:['#1a8fd0','#fff','#12469a'],MAG:['#fcc200','#0a1678','#a00000'],MRG:['#e87232','#fff','#000'],MEL:['#f5423f','#92b81c','#4a7a08'],MOR:['#103a68','#5397d9','#103a68'],RIA:['#f41f1b','#ffc000','#f41f1b'],SAH:['#fff','#000','#880000'],SKO:['#3f87c7','#f0c030','#000'],SOT:['#06256d','#fff','#a00000'],TAM:['#0a1678','#ffc000','#0a1678'],ZEN:['#4f174d','#fff','#4f174d']};
    const flags=flagColors[d.nationality]||flagColors.PER;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 360">
      <defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#101c30"/></linearGradient><linearGradient id="face" x2="1" y2=".3"><stop stop-color="${skin}"/><stop offset=".65" stop-color="${skin}"/><stop offset="1" stop-color="${shade}"/></linearGradient><linearGradient id="suit" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#142136"/></linearGradient></defs>
      <path fill="url(#bg)" d="M0 0h300v360H0z"/>
      <path d="M-70 330 180 0h66L-5 360zm217 30L300 158v56L190 360Z" fill="${accent}" opacity=".12"/>
      <path d="M0 318 238 0M36 360 300 13" stroke="${accent}" stroke-width="2" opacity=".3"/>
      <text x="288" y="300" font-family="Arial" font-size="180" font-weight="900" text-anchor="end" fill="#fff" opacity=".06">${escape(d.number)}</text>
      <g transform="translate(${(n%3-1)*5} 29)">
      <path d="M25 339 34 228Q41 204 117 185L183 185Q259 206 266 230L278 339Z" fill="url(#suit)" stroke="#111e30" stroke-width="3"/>
      <path d="M41 221 76 210 98 339H25ZM258 222 225 211 208 339H277Z" fill="#111e30"/>
      <path d="M53 217 69 212 94 339H78Zm194 0-16-5-23 127h17Z" fill="${accent}" opacity=".85"/>
      <path d="M123 160 121 195 151 218 181 195 177 156Z" fill="${shade}"/>
      <path d="M127 167 128 190 150 203 173 188 173 162Z" fill="${skin}"/>
      <path d="M116 186 149 208 181 186 190 203 156 222 144 222 109 203Z" fill="#112034" stroke="${accent}" stroke-width="2"/>
      <path d="M150 223v112" stroke="${accent}" opacity=".65"/>
      <ellipse cx="101" cy="120" rx="10" ry="18" fill="${shade}"/><ellipse cx="199" cy="120" rx="10" ry="18" fill="${shade}"/>
      <path d="M101 82Q101 42 150 43Q200 43 200 84L${150+jaw} 139Q190 164 168 178Q151 190 133 178Q110 164 ${150-jaw} 139Z" fill="url(#face)"/>
      <path d="M102 90 115 85 108 130 119 151 110 151 103 136Z" fill="${shade}" opacity=".4"/>
      <path d="M156 104 150 128 162 135 150 138 141 135" stroke="${shade}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M113 ${brow}Q125 ${brow-5} 137 ${brow+1}M165 ${brow+1}Q180 ${brow-5} 190 ${brow}" stroke="${hair}" stroke-width="4" fill="none"/>
      <path d="M112 ${eye}Q124 ${eye-7} 138 ${eye}Q124 ${eye+5} 112 ${eye}M164 ${eye}Q178 ${eye-7} 190 ${eye}Q178 ${eye+5} 164 ${eye}" fill="#f3ece3"/>
      <g fill="${n%3===0?'#7a998b':'#67533d'}"><ellipse cx="126" cy="${eye-1}" rx="4" ry="4.5"/><ellipse cx="176" cy="${eye-1}" rx="4" ry="4.5"/></g>
      <g fill="#202733"><circle cx="126" cy="${eye-1}" r="2.2"/><circle cx="176" cy="${eye-1}" r="2.2"/></g>
      <path d="M112 ${eye-1}Q124 ${eye-7} 138 ${eye}M164 ${eye}Q177 ${eye-7} 190 ${eye-1}" fill="none" stroke="${hair}" stroke-width="1.6"/>
      <path d="M132 ${151+n%3}Q149 148 170 ${151+n%3}Q151 163 132 ${151+n%3}" fill="#a76660"/>
      <path d="M134 153Q151 155 168 152" fill="none" stroke="#70463f" stroke-width="1.5"/>
      ${beard}<path d="${hairstyles[n%5]}" fill="${hair}"/>
      <path d="M110 58Q147 36 184 49M109 65Q150 43 183 56" fill="none" stroke="${accent}" opacity=".12" stroke-width="2"/>
      <path d="M98 96 107 87 107 111 102 119ZM193 89 201 97 198 121 192 110Z" fill="${hair}"/>
      <g font-family="Arial" font-weight="900"><rect x="91" y="232" width="48" height="20" rx="3" fill="${accent}"/><text x="115" y="246" font-size="10" fill="#192132" text-anchor="middle">LRO</text><text x="185" y="245" font-size="11" fill="#fff" text-anchor="middle">GT3</text><text x="150" y="281" font-style="italic" font-size="30" fill="#f4f0e6" text-anchor="middle">MOTORSPORT</text><text x="150" y="297" font-size="7" letter-spacing="4" fill="${accent}" text-anchor="middle">RACING DIVISION</text><text x="183" y="326" font-size="25" fill="${accent}">${escape(d.number)}</text></g>
      </g>
      <g transform="translate(18 16)">${flags.map((c,i)=>`<path d="M0 ${i*6}h30v6H0z" fill="${c}"/>`).join('')}<path d="M0 0h30v18H0z" fill="none" stroke="#fff" stroke-opacity=".4"/></g>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }
  let renderer,studio,camera;
  function init(){
    if(renderer)return;
    renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setSize(800,480);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
    studio=new T.Scene();studio.add(new T.HemisphereLight(0xc5e5ff,0x334061,3));
    [[-4,7,7,0xffffff,95],[6,4,-3,0x67baff,100],[0,5,-6,0xffffff,110]].forEach(([x,y,z,c,p])=>{const light=new T.PointLight(c,p);light.position.set(x,y,z);studio.add(light);});
    camera=new T.PerspectiveCamera(34,800/480,.1,100);
  }
  function render(kind,key,color){
    const id=kind+':'+(kind==='driver'?key.id:key)+':'+color;if(cache.has(id))return cache.get(id);
    if(kind==='driver'){const url=portrait(key);cache.set(id,url);return url;}
    try{
      init();let model;
      if(kind==='car'){model=car(key,color).group;camera.position.set(8.6,4.8,11);camera.lookAt(0,.7,0);}
      else {model=part(key,color);camera.position.set(3.3,2.5,4.5);camera.lookAt(0,0,0);}
      studio.add(model);renderer.render(studio,camera);const url=renderer.domElement.toDataURL('image/png');studio.remove(model);
      const geometries=new Set(),materials=new Set(),textures=new Set();model.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);if(m.map)textures.add(m.map);}}});geometries.forEach(o=>o.dispose());materials.forEach(o=>o.dispose());textures.forEach(o=>o.dispose());
      cache.set(id,url);return url;
    }catch(err){console.warn('Artwork renderer unavailable:',err.message);return 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120"><path fill="'+(color||'#e73549')+'" d="M20 80V50l40-30h65l40 30 18 8v22H20z"/><circle cx="50" cy="80" r="18" fill="#121827"/><circle cx="145" cy="80" r="18" fill="#121827"/><path d="M65 28h52l27 24H44z" fill="#213b54"/></svg>');}
  }
  const escape = s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function image(kind,key,color,cls=''){const k=kind==='driver'?key.id:key;const id=kind+':'+k+':'+color;let url=cache.get(id);if(!url){url=render(kind,key,color);cache.set(id,url);}return `<img class="art-render ${cls}" src="${url}" alt="${escape(kind==='driver'?'Piloto '+key.name:kind==='car'?(BODIES[key]?.name||key):PART_LABELS[key]||key)}" draggable="false">`;}
  let packSerial=0;
  function pack(key,cls=''){
    const colors={bronze:['#895038','#edbd91'],silver:['#65869f','#e7f5fc'],gold:['#b77c1b','#ffe8a0'],legend:['#7135b6','#ddb7ff']};
    const [a,b]=colors[key]||colors.gold,id='pack-'+(++packSerial),label={bronze:'BRONZE',silver:'SILVER',gold:'GOLD',legend:'LEGEND'}[key]||'GOLD';
    // Instance-unique SVG IDs prevent invisible gradients when a hidden screen owns the first pack.
    return `<svg class="pack-art ${cls}" viewBox="0 0 240 290" role="img" aria-label="Sobre ${label}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="${b}"/><stop offset=".18" stop-color="${a}"/><stop offset=".46" stop-color="${b}"/><stop offset=".53" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><linearGradient id="${id}-dark" x2=".8" y2="1"><stop stop-color="#263750"/><stop offset="1" stop-color="#080e1c"/></linearGradient></defs>
      <ellipse cx="122" cy="269" rx="81" ry="10" fill="#000" opacity=".3"/>
      <path d="M37 14H203L209 268H31Z" fill="url(#${id})" stroke="${b}" stroke-width="1.5"/>
      <path d="M40 36h160l5 210H35Z" fill="url(#${id}-dark)"/>
      <path d="M35 214 158 36h42L63 246H35Z" fill="${a}" opacity=".22"/>
      <path d="m37 211 121-175M56 246 146 115" stroke="${b}" opacity=".4"/>
      <path d="M40 39h160M35 243h170" stroke="${b}" stroke-width="2"/>
      <g stroke="#0c1424" opacity=".4">${Array.from({length:31},(_,i)=>`<path d="M${43+i*5} 17v15m-5 219v13"/>`).join('')}</g>
      <g font-family="Arial" text-anchor="middle"><text x="120" y="68" fill="#fff" font-size="23" font-weight="900" font-style="italic">LRO</text><text x="120" y="82" fill="${b}" font-size="7" letter-spacing="3">MOTORSPORT COLLECTION</text></g>
      <path d="m120 102 52 25v42l-52 30-52-30v-42Z" fill="#102239" stroke="${b}" stroke-width="2"/>
      <path d="M84 154v-13l16-13h39l17 13v13M81 154h78v9H81Z" fill="${b}"/>
      <path d="m103 133-10 10h54l-11-10Z" fill="#152338"/><path d="M88 152h13m38 0h13" stroke="#fff" stroke-width="3"/>
      <g fill="${b}" font-family="Arial" text-anchor="middle"><text x="120" y="223" font-size="23" font-weight="900" letter-spacing="3">${label}</text><text x="120" y="236" font-size="6.5" letter-spacing="2">GT3 / PERFORMANCE SERIES</text></g>
      <path d="M42 39h5l-3 204h-6Z" fill="#fff" opacity=".17"/>
      </svg>`;
  }
  return {car,part,image,pack,specs,trackCurve,portrait};
})();
