
// ===================== Transmisión online =====================
// Todo lo de arriba es la pantalla de partido local; acá se conecta con el servidor y se agrega el panel del DT y los anuncios sin salto.
const QS=new URLSearchParams(location.search);
const API=(QS.get('api')||'http://localhost:8787').replace(/\/+$/,''),LEAGUE=QS.get('league'),MATCH=QS.get('match');
const LIVE={ws:null,hello:null,first:true,done:false,retry:0,skew:0,send(o){if(LIVE.ws&&LIVE.ws.readyState===1)LIVE.ws.send(JSON.stringify(o));}};
const liveStatus=t=>{const el=$('live-status');el.textContent=t||'';el.style.display=t?'block':'none';};
// Antes del partido: presentación -> estudio -> tanda de video, todo automático y sin botones para saltear (el CSS oculta Saltar/Continuar
// y adbreak.js no muestra SALTAR con EM_ONLINE). El entretiempo ya trae su estudio + tanda en broadcast.js.
function wrapAds(){
  if(!bc||bc._ads)return;bc._ads=1;const st=bc.studio.bind(bc);
  bc.studio=c=>{
    if(c&&c.kind==='pre'&&!c._ad){const d0=c.onDone;
      c={...c,_ad:1,onDone(){try{if(window.EM&&EM.opt)EM.opt.ads=true;if(window.EM&&EM.ads)EM.ads.videoBreak(d0,{maxSec:40});else d0&&d0();}catch(e){d0&&d0();}}};}
    return st(c);
  };
}
function recordRemote(){
  if(sim.playNumber!==recordedPlay){if(frames.length>10)lastReplay=frames;frames=[];recordedPlay=sim.playNumber;}
  if(['SNAP','PLAY LIVE','BALL RESOLUTION','DEAD BALL'].includes(sim.state)){frames.push(sim.snapshot());if(frames.length>600)frames.shift();}
  if(sim.state==='RESULT'&&frames.length)lastReplay=frames.slice();
}
setInterval(()=>{if(sim.started&&!replay)recordRemote();},33);
setInterval(()=>{ // cuenta regresiva del kickoff y aviso de medio tiempo (el servidor retiene el partido)
  if(LIVE.hello&&sim.step===0&&!sim.held&&!document.querySelector('.lfo-ad,.bc-intro,.bc-studio')){const l=LIVE.hello.startAt-(Date.now()+LIVE.skew);if(l>0){liveStatus(`Kickoff en ${Math.floor(l/60000)}:${String(Math.floor(l/1000)%60).padStart(2,'0')}`);return;}}
  if(!sim.held){if(LIVE.halfMsg){LIVE.halfMsg=false;liveStatus('');}return;}
  const left=Math.max(0,sim.held-(Date.now()+LIVE.skew));LIVE.halfMsg=true;
  liveStatus(`Descanso · el partido sigue en ${Math.floor(left/60000)}:${String(Math.floor(left/1000)%60).padStart(2,'0')}`);
},500);

function connect(){
  liveStatus('Conectando…');
  const ws=LIVE.ws=new WebSocket(API.replace(/^http/,'ws')+`/api/league/${encodeURIComponent(LEAGUE)}/ws?match=${encodeURIComponent(MATCH)}`);
  ws.onopen=()=>{LIVE.retry=0;liveStatus('');};
  ws.onclose=()=>{if(LIVE.done)return;liveStatus('Conexión perdida · reintentando…');setTimeout(connect,Math.min(5000,1000*(++LIVE.retry)));};
  ws.onmessage=e=>onLive(JSON.parse(e.data));
}
function onLive(d){
  if(d.type==='hello'){
    LIVE.hello=d;LIVE.skew=d.now-Date.now();
    if(!d.teams){liveStatus('El partido todavía no está disponible.');return;}
    sim.setTeams(d.teams);userIdx=d.userIndex>=0?d.userIndex:0;managerCtx={fixture:{type:d.fixtureType||'regular'}};labelKey='';view&&view.setTeams(sim.teams);
    if(d.canTactic)buildCoach(d.gameplan);
  }else if(d.type==='frame'){
    sim.applyFrame(d);
    if(LIVE.first){LIVE.first=false;
      // La previa dura ~100 s y el medio tiempo ~100 s: si el partido está por empezar (o ya empezó) no se repite, para no pisar el juego.
      const now=Date.now()+LIVE.skew,toKick=LIVE.hello.startAt-now;
      if(d.step>0||toKick<120000){bcIntroShown=true;if(sim.state==='HALFTIME'&&(sim.held||0)-now<100000)bcHalf=true;}
      start();}
  }else if(d.type==='final'){LIVE.done=true;}
  else if(d.type==='tactic-ok')toast(d.kind==='force'?'Jugada fijada para el siguiente snap.':'Ajustes enviados: se aplican desde la próxima jugada.');
  else if(d.type==='error')toast(d.error);
}

// ---- panel del entrenador (solo DT de alguno de los dos equipos): mismo panel que el modo local
const PRESETS={run:{runPass:22,deepPass:30,shortPass:55,tempo:35},balanced:{runPass:50,deepPass:50,shortPass:50,tempo:50},air:{runPass:78,deepPass:60,shortPass:55,tempo:60},hurry:{runPass:65,deepPass:30,shortPass:80,tempo:95}};
let myGp=null,pend={off:{},def:{}},pendT=null;
function queueTactic(side,k,v){pend[side][k]=v;clearTimeout(pendT);pendT=setTimeout(()=>{LIVE.send({type:'tactic',patch:pend});pend={off:{},def:{}};},400);}
function buildCoach(gp){
  const el=$('coach-board');if(!gp)return;myGp=gp;el.classList.remove('hidden');
  el.innerHTML=`<div class="section-title"><h2>Panel del entrenador</h2><div class="row-actions">${[['run','Terrestre'],['balanced','Equilibrado'],['air','Aéreo'],['hurry','Sin huddle']].map(([k,l])=>`<button class="btn small" data-cb-preset="${k}">${l}</button>`).join('')}</div></div>
   <p class="muted small">Ajustes en juego: se aplican desde la siguiente jugada. Solo afectan a tu equipo. En Playbook podés fijar la jugada o la cobertura.</p>
   <div class="grid g3"><div><h5>Ataque</h5>${slider({path:'off.runPass',label:'Carrera ↔ Pase',value:gp.off.runPass,lo:'Carrera',hi:'Pase',act:'cb-slider'})}${slider({path:'off.tempo',label:'Ritmo',value:gp.off.tempo,lo:'Lento',hi:'No-huddle',act:'cb-slider'})}${slider({path:'off.deepPass',label:'Pase profundo',value:gp.off.deepPass,act:'cb-slider'})}${slider({path:'off.fourthDown',label:'Agresividad 4º down',value:gp.off.fourthDown,act:'cb-slider'})}</div>
   <div><h5>Defensa</h5>${slider({path:'def.blitz',label:'Blitz',value:gp.def.blitz,act:'cb-slider'})}${slider({path:'def.pressure',label:'Presión',value:gp.def.pressure,act:'cb-slider'})}${slider({path:'def.runFocus',label:'Enfoque anti-carrera',value:gp.def.runFocus,act:'cb-slider'})}${select({path:'def.coverage',label:'Cobertura',value:gp.def.coverage,options:[['balanced','Equilibrada'],['man','Man'],['cover2','Cover 2'],['cover3','Cover 3'],['cover4','Cover 4']],act:'cb-select'})}${select({path:'def.package',label:'Paquete',value:gp.def.package,options:[['auto','Auto'],['base','Base'],['nickel','Nickel'],['dime','Dime']],act:'cb-select'})}</div>
   <div><h5>Rotación</h5><p class="muted small">La rotación de jugadores es automática según fatiga y depth chart.</p></div></div>`;
  el.oninput=e=>{const t=e.target;if(!t.matches('[data-input="cb-slider"]'))return;const [side,k]=t.dataset.path.split('.'),v=+t.value;myGp[side][k]=v;const o=el.querySelector(`[data-val="${t.dataset.path}"]`);if(o)o.textContent=v;queueTactic(side,k,v);};
  el.onchange=e=>{const t=e.target;if(!t.matches('[data-change="cb-select"]'))return;const [side,k]=t.dataset.path.split('.');myGp[side][k]=t.value;queueTactic(side,k,t.value);};
  el.onclick=e=>{const b=e.target.closest('[data-cb-preset]');if(!b)return;const p=PRESETS[b.dataset.cbPreset];Object.assign(myGp.off,p);buildCoach(myGp);for(const [k,v] of Object.entries(p))queueTactic('off',k,v);};
}
if(!LEAGUE||!MATCH)liveStatus('Faltan parámetros de la liga o del partido.');else connect();
