import * as THREE from 'three';

export const TRACK = new THREE.CatmullRomCurve3([
  [-100,90],[0,90],[105,90],[173,65],[188,12],[151,-24],[101,-34],[65,-88],[-12,-106],[-69,-77],[-76,-25],[-137,-13],[-173,23],[-159, seventy()]
].map(([x,z])=>new THREE.Vector3(x,0,z)),true,'catmullrom',0.35);
function seventy(){return 70;}
TRACK.arcLengthDivisions=2400; TRACK.updateArcLengths();
export const LENGTH=TRACK.getLength();
export const SAMPLES=1400;
export const mod=(a,n)=>((a%n)+n)%n;
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const samples=Array.from({length:SAMPLES},(_,i)=>{
  const t=i/SAMPLES,p=TRACK.getPointAt(t),v=TRACK.getTangentAt(t).normalize();
  const a=TRACK.getTangentAt(mod(t-.002,1)),b=TRACK.getTangentAt(mod(t+.002,1));
  return {x:p.x,z:p.z,tx:v.x,tz:v.z,nx:v.z,nz:-v.x,curve:a.angleTo(b)/(.004*LENGTH)};
});
export function trackAt(s,offset=0){
  const f=mod(s,LENGTH)/LENGTH*SAMPLES,i=Math.floor(f),k=f-i,a=samples[i],b=samples[(i+1)%SAMPLES];
  const out={}; for(const key of ['x','z','tx','tz','nx','nz','curve'])out[key]=a[key]+(b[key]-a[key])*k;
  out.x+=out.nx*offset;out.z+=out.nz*offset;return out;
}
export const DRIVERS=[
 {name:'S. MARTÍN',full:'Santiago Martín',team:'Fierro Racing',number:7,color:'#f16c31',second:'#eee8cf',country:'ARG',stats:[92,89,90,91,92,82,94,92]},
 {name:'L. SILVA',full:'Lucas Silva',team:'Sur Motorsport',number:12,color:'#40b0a8',second:'#f2eee4',country:'BRA',stats:[93,93,87,89,89,91,87,94]},
 {name:'N. FERRARO',full:'Nicolás Ferraro',team:'Scuderia Veloce',number:23,color:'#c73832',second:'#f4eee1',country:'ARG',stats:[90,91,94,94,93,84,93,88]},
 {name:'M. KOWALSKI',full:'Mateo Kowalski',team:'Norte Competición',number:44,color:'#e8c549',second:'#171c26',country:'ARG',stats:[97,90,84,85,87,95,80,92]},
 {name:'T. ROJAS',full:'Tomás Rojas',team:'Fierro Racing',number:16,color:'#de7138',second:'#242b31',country:'ARG',stats:[89,91,90,92,94,80,96,89]},
 {name:'B. COSTA',full:'Bruno Costa',team:'Sur Motorsport',number:31,color:'#64b9c7',second:'#182d40',country:'BRA',stats:[94,91,89,86,87,94,84,93]},
 {name:'F. BIANCHI',full:'Franco Bianchi',team:'Scuderia Veloce',number:8,color:'#ece8d8',second:'#b42e26',country:'ITA',stats:[89,88,96,95,94,81,94,87]},
 {name:'D. VEGA',full:'Diego Vega',team:'Cóndor Racing',number:55,color:'#587bbe',second:'#f2d754',country:'CHI',stats:[95,95,85,87,86,92,81,94]},
 {name:'A. PEREYRA',full:'Agustín Pereyra',team:'Norte Competición',number:19,color:'#c2c9a5',second:'#253c2c',country:'ARG',stats:[92,86,92,92,92,79,93,89]},
 {name:'J. MOLINA',full:'Julián Molina',team:'Cóndor Racing',number:63,color:'#897bb4',second:'#f0e7d5',country:'URU',stats:[90,94,89,90,86,93,83,94]}
];
export const STAT_NAMES=['Velocidad punta','Aceleración','Frenada','Paso por curva','Control','Agresividad','Consistencia','Adelantamiento'];
export class Race {
 constructor(seed=Date.now()){this.seed=seed>>>0;this.reset();}
 random(){this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0;return this.seed/4294967296;}
 reset(){
  this.phase='grid';this.time=0;this.countdown=5;this.laps=5;this.mandatoryPit=false;this.paused=false;this.rate=1;this.events=[];this.excitement=0;this.focus=0;this.focusUntil=0;this.fastest=null;this.finishOrder=[];this.lastEvent=-10;this.battleTimer=0;this.overtakes=0;this.bestBattle=0;
  this.cars=DRIVERS.map((d,i)=>({...d,id:i,progress:-8-Math.floor(i/2)*8.5,offset:i%2?2.7:-2.7,targetOffset:i%2?2.7:-2.7,offsetV:0,speed:0,rank:i+1,previousRank:i+1,state:'Grid',tire:['M','S','M','S','H','S','M','S','H','M'][i],wear:100,damage:0,spin:0,error:0,decision:0,attackTimer:0,cooldown:8+this.random()*15,lap:0,lastCross:0,lastLap:null,bestLap:null,draft:false,pitActive:false,pitted:false,pitStopped:false,pitTime:0,pitLap:2+(i%2),finished:false,finishTime:0,pace:.976+this.random()*.048,incidentCooldown:0}));
  this.order=[...this.cars];this.emit('RACE READY','10 pilotos. Una sola bandera a cuadros.',0,0);
 }
 start(){if(this.phase==='grid'){this.phase='start';this.countdown=5;this.emit('GRID PROCEDURE','Secuencia de salida en marcha',0,10);}}
 emit(type,text,id=0,intensity=20){
  if(this.time-this.lastEvent<1.5 && intensity<40)return;
  this.events.unshift({type,text,id,time:this.time,key:Math.random()});if(this.events.length>40)this.events.pop();this.lastEvent=this.time;this.excitement=clamp(this.excitement+intensity,0,100);
  if(intensity>=25){this.focus=id;this.focusUntil=this.time+5;}
 }
 step(dt){
  if(this.paused||this.phase==='grid'||this.phase==='podium')return;
  if(this.phase==='start'){this.countdown-=dt;if(this.countdown<=0){this.phase='race';this.emit('LIGHTS OUT','¡Se larga el Gran Premio del Litoral!',0,60);}return;}
  this.time+=dt;this.excitement=Math.max(0,this.excitement-dt*4.2);
  const active=this.cars.filter(c=>!c.finished);
  for(const c of active){
   const st=c.stats,s=mod(c.progress,LENGTH),surface=Math.abs(c.offset)>6.3?.70:1;
   c.cooldown-=dt;c.incidentCooldown-=dt;c.decision-=dt;c.attackTimer-=dt;c.error=Math.max(0,c.error-dt);
   c.wear=Math.max(0,c.wear-dt*({S:.20,M:.125,H:.077}[c.tire])*(1+Math.abs(trackAt(s).curve)*12));
   const grip=({S:1.065,M:1,H:.966}[c.tire])*(.87+c.wear*.0013)*surface;
   let target=(48+st[0]*.155)*c.pace*(1-c.damage*.0015);
   let bend=0;
   for(const look of [0,15,30,50,72]){
    const cv=trackAt(s+look).curve; bend=Math.max(bend,look<31?cv:0);
    const v=Math.sqrt((10.7+st[3]*.044)*grip/Math.max(.003,cv));
    target=Math.min(target,Math.sqrt(v*v+2*(7.2+st[2]*.044)*(.8+c.wear*.002)*look));
   }
   c.draft=false;let ahead=null,gap=1e9;
   for(const other of this.cars){if(other===c||other.finished||other.pitActive!==c.pitActive)continue;const d=mod(other.progress-c.progress,LENGTH);if(d>0&&d<gap){gap=d;ahead=other;}}
   if(ahead&&gap<42&&gap>4&&bend<.012&&Math.abs(c.offset-ahead.offset)<2.3){c.draft=true;target*=1.07;}
   if(c.decision<=0&&!c.spin&&!c.error&&!c.pitActive){
    c.decision=.32+this.random()*.3;
    if(ahead&&gap<22&&c.speed>12&&this.random()<(.35+st[5]*.006)){
     const left=-3.0,right=3.0;
     const safe=lane=>!this.cars.some(o=>o!==c&&o!==ahead&&Math.abs(mod(o.progress-c.progress+LENGTH/2,LENGTH)-LENGTH/2)<8&&Math.abs(o.offset-lane)<2);
     let lane=ahead.offset>=0?left:right;
     if(safe(lane)){c.targetOffset=lane;c.attackTimer=2.0+st[7]*.025;c.state='Overtaking';}
    }else if(c.attackTimer<=0){
     const rear=this.cars.find(o=>o!==c&&mod(c.progress-o.progress,LENGTH)<15&&o.speed>c.speed+.5);
     if(rear&&this.random()<st[5]/180){c.targetOffset=clamp(rear.offset*.7,-2.8,2.8);c.state='Defending';}
     else c.targetOffset=Math.sin(s*.013+c.id)*.5+(bend>.017?1.0:0);
    }
   }
   if(ahead&&gap<13&&Math.abs(c.offset-ahead.offset)<2.15){
    const safeSpeed=Math.sqrt(Math.max(0,ahead.speed*ahead.speed+2*9*(gap-5.4)));
    target=Math.min(target,safeSpeed);
   }
   if(this.mandatoryPit&&!c.pitted&&!c.pitActive&&c.lap>=c.pitLap-1&&s>LENGTH-65){c.pitActive=true;c.state='PitEntry';this.emit('PIT ENTRY',`${c.name} entra a boxes`,c.id,30);}
   if(c.pitActive){
    const blend=s>LENGTH-65?clamp((s-(LENGTH-65))/42,0,1):s>185?clamp((235-s)/50,0,1):1;
    c.targetOffset=-17*blend;target=Math.min(target,18);c.state='PitEntry';
    if(s>70&&s<112&&!c.pitStopped){target=0;c.state='PitStop';if(c.speed<.8){c.pitTime+=dt;if(c.pitTime>3.6){c.pitStopped=true;c.wear=100;c.tire=c.lap>=3?'S':'M';this.emit('PIT STOP',`${c.name} · ${c.tire==='S'?'Soft':'Medium'} nuevos · 3.6 s`,c.id,35);}}}
    if(c.pitStopped){c.state='PitExit';if(s>230&&s<300){c.pitActive=false;c.pitted=true;c.targetOffset=0;}}
   }
   if(c.cooldown<0&&c.speed>24&&bend>.014&&!c.pitActive){
    c.cooldown=12+this.random()*18;
    const chance=(101-st[6])*.012+(100-c.wear)*.0012;
    if(this.random()<chance){
     const spin=this.random()>(st[4]/110)&&this.time>18;
     c.error=spin?4:1.4;c.spin=spin?3.3:0;c.targetOffset=(this.random()>.5?1:-1)*(spin?7.8:6.5);
     this.emit(spin?'SPIN':'LOCK-UP',`${c.name} ${spin?'pierde el auto. ¡Trompo!':'bloquea en la frenada'}`,c.id,spin?55:28);
    }
   }
   if(c.spin>0){c.spin=Math.max(0,c.spin-dt);target=5;c.state='Spin';}
   else if(c.error>0){target*=.65;c.state='Recovering';}
   else if(!c.pitActive){c.state=c.attackTimer>0?'Overtaking':target<c.speed-2?'Braking':bend>.016?'Cornering':c.draft?'Slipstream':target>c.speed+2?'Accelerating':'Racing';}
   const acc=(4.0+st[1]*.046)*(c.draft?1.13:1),brake=7+st[2]*.06;
   c.speed=clamp(c.speed+clamp(target-c.speed,-brake*dt,acc*dt),0,76);
   const lateral=clamp((c.targetOffset-c.offset)*2.4,-3.2,3.2);
   c.offsetV+=(lateral-c.offsetV)*Math.min(1,dt*5);c.offset+=c.offsetV*dt;
   c.progress+=c.speed*dt;
  }
  // Resolve car footprints: longitudinal separation and lateral impulses, never pass through.
  for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){
   const a=active[i],b=active[j];if(a.pitActive!==b.pitActive)continue;
   const ds=mod(a.progress-b.progress+LENGTH/2,LENGTH)-LENGTH/2,lat=a.offset-b.offset;
   if(Math.abs(ds)<4.55&&Math.abs(lat)<1.95){
    const front=ds>=0?a:b,back=ds>=0?b:a,closing=Math.max(0,back.speed-front.speed);
    const overlap=4.55-Math.abs(ds);front.progress+=overlap*.22;back.progress-=overlap*.78;
    back.speed=Math.min(back.speed,front.speed*.97);front.speed*=.999;
    const push=(lat>=0?1:-1)*.16;a.offset+=push;b.offset-=push;
    if(closing>3&&a.incidentCooldown<0&&b.incidentCooldown<0&&this.time>5){
     a.damage=Math.min(35,a.damage+closing*.4);b.damage=Math.min(35,b.damage+closing*.3);a.incidentCooldown=b.incidentCooldown=8;
     this.emit('CONTACT',`${a.name} y ${b.name} se tocan`,back.id,35);
     if(closing>9&&this.random()<.18){back.spin=2.2;back.error=3;back.targetOffset=6.5;}
    }
   }
  }
  for(const c of active){
   const lap=Math.floor(Math.max(0,c.progress)/LENGTH);
   if(lap>c.lap){
    c.lastLap=this.time-c.lastCross;c.lastCross=this.time;c.lap=lap;
    if(!c.bestLap||c.lastLap<c.bestLap)c.bestLap=c.lastLap;
    if(!this.fastest||c.lastLap<this.fastest.time){this.fastest={id:c.id,time:c.lastLap};this.emit('FASTEST LAP',`${c.name} · ${formatLap(c.lastLap)}`,c.id,24);}
    if(c.lap===this.laps-1&&this.phase==='race'){this.phase='lastlap';this.emit('FINAL LAP','Última vuelta. Todo por decidir.',this.order[0].id,60);}
   }
   if(c.progress>=LENGTH*this.laps&&!c.finished){
    c.finished=true;c.finishTime=this.time;c.rank=this.finishOrder.length+1;this.finishOrder.push(c);
    if(this.finishOrder.length===1){this.phase='finish';this.emit('CHEQUERED FLAG',`${c.full} gana en el Litoral`,c.id,80);}
   }
  }
  const previous=this.order.map(c=>c.id);
  this.order=[...this.finishOrder,...this.cars.filter(c=>!c.finished).sort((a,b)=>b.progress-a.progress)];
  this.order.forEach((c,i)=>{
   c.previousRank=c.rank;c.rank=i+1;
   if(c.rank<c.previousRank&&this.time>8&&!c.finished){
    const passed=this.cars[previous[i]];
    if(passed&&!passed.pitActive&&!c.pitActive){this.overtakes++;this.emit(c.rank===1?'LEAD CHANGE':'OVERTOOK',`${c.name} supera a ${passed.name}`,c.id,40);}
   }
  });
  this.battleTimer-=dt;
  if(this.battleTimer<=0&&this.time>8){
   this.battleTimer=4.5;let best=-1,id=this.order[0].id;
   for(let i=0;i<this.order.length-1;i++){
    const a=this.order[i],b=this.order[i+1],distance=a.progress-b.progress;
    if(a.finished||b.finished||a.pitActive||b.pitActive)continue;
    let score=Math.max(0,30-distance)+(b.attackTimer>0?25:0)+(this.phase==='lastlap'&&i<2?40:0);
    if(this.order[i+2]&&b.progress-this.order[i+2].progress<15)score+=25;
    if(score>best){best=score;id=b.id;}
   }
   this.bestBattle=id;
   if(best>25){this.excitement=Math.min(100,this.excitement+20);if(this.time>this.focusUntil){this.focus=id;this.focusUntil=this.time+4;}}
   if(best>65&&this.random()<.4)this.emit('THREE-WAY BATTLE','Tres pilotos, una sola posición',id,35);
  }
  if(this.finishOrder.length===this.cars.length||(this.phase==='finish'&&this.time-this.finishOrder[0].finishTime>35)){
   this.phase='podium';this.emit('RACE COMPLETE','Clasificación final confirmada',this.order[0].id,0);
  }
 }
}
export function formatLap(sec){return `${Math.floor(sec/60)}:${(sec%60).toFixed(3).padStart(6,'0')}`;}
