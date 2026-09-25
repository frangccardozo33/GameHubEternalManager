import './style.css';
import {MatchSimulator,FIXED_DT} from './sim/match.js';
import {TEAMS,TEAM_STYLES,DEFENSE_STYLES} from './sim/models.js';
import {PLAYBOOK,DEFENSES} from './sim/playbook.js';
import {StadiumView} from './view/scene.js';
import {StadiumAudio} from './view/audio.js';

const $=id=>document.getElementById(id);
let sim=new MatchSimulator(),paused=true,speed=1,accumulator=0,debug=false,tacticSide='offense';
let frames=[],lastReplay=[],recordedPlay=sim.playNumber,replay=null,lastUI=0,lastFeedId=0,lastHistory=0;
const audio=new StadiumAudio();let view;
// Manager bridge: when a franchise match is loaded, `managerCtx` holds {sim, rec, providers, fixture}.
let managerCtx=null,hooks={},finalHandled=false,userIdx=0,matchLoaded=false;
try{view=new StadiumView($('viewport'),TEAMS);}catch(error){console.error(error);$('start-overlay').innerHTML='<h2>WebGL no disponible</h2><p>Activa la aceleración gráfica del navegador y recarga.</p>';}
function toast(text){$('toast').textContent=text;$('toast').classList.remove('hidden');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.add('hidden'),3500);}
// ---- transmisión (assets/broadcast): presentación, placas y estudio (previa, medio tiempo y final) ----
let bc=null,bcLastId=0,bcIntroShown=false,bcHalf=false,bcPost=false;
function ensureBc(){if(bc||!window.Broadcast)return;try{window.Broadcast.setBase(new URL('../../assets/',location.href).href);bc=window.Broadcast.attach({id:'lgo',sport:'nfl',mount:$('viewport'),accent:'#5ec98a',logo:'logos/lgo-sm.png',league:'Liga de Gridiron Online'});}catch(e){console.warn('Transmisión no disponible',e);}}
const yardsOf=i=>Math.round(sim.history.filter(r=>r.before.offense===i&&!['kickoff','punt','extra-point'].includes(r.kind)).reduce((x,r)=>x+(r.yards||0),0));
function bcNfl(){
  if(!bc||!sim||replay)return;
  for(const e of sim.events){if(e.id<=bcLastId)continue;bcLastId=e.id;const t=String(e.text||'');
    if(e.type==='result'){if(/^SACK/.test(t))bc.event('sack',{});else if(/^INTERCEPTION/.test(t))bc.event('interception',{});else{const m=/^FIRST DOWN · (\d+)/.exec(t);if(m&&+m[1]>=20)bc.event('bigplay',{sub:m[1]+' yardas'});}}}
  const T=sim.teams,sc=sim.drive.score;
  bc.tick({scores:[...sc],names:[T[0].name,T[1].name],colors:[T[0].color,T[1].color],period:sim.clock.quarter,periods:4,phase:sim.state==='FINAL'?'final':sim.started?'live':'pre'});
  if(sim.state==='HALFTIME'&&!bcHalf){bcHalf=true;const was=paused;paused=true;const lead=sc[0]===sc[1]?null:T[sc[0]>sc[1]?0:1];
    bc.studio({kind:'half',onDone:()=>{paused=was;},lines:[['A',`Medio tiempo: ${T[0].name} ${sc[0]}, ${T[1].name} ${sc[1]}.`],['B',lead?`${lead.name} manda al vestuario, pero la diferencia de ${Math.abs(sc[0]-sc[1])} se puede dar vuelta con un solo drive.`:'Todo igualado: gana el que mejor ajuste en el segundo tiempo.'],['A',`En yardas: ${T[0].short} ${yardsOf(0)} y ${T[1].short} ${yardsOf(1)}.`]]});}
  if(sim.state==='FINAL'&&!bcPost){bcPost=true;const w=T[sc[0]>=sc[1]?0:1],l=w===T[0]?T[1]:T[0];
    setTimeout(()=>bc.studio({kind:'post',lines:[['A',sc[0]===sc[1]?`Terminó empatado ${sc[0]}-${sc[1]}.`:`Final del partido: ${w.name} le ganó a ${l.name}, ${Math.max(...sc)}-${Math.min(...sc)}.`],['B',`En yardas totales, ${T[0].short} sumó ${yardsOf(0)} y ${T[1].short} ${yardsOf(1)}.`],['B',Math.abs(sc[0]-sc[1])<=7?'Un partido cerrado que se definió en las últimas jugadas.':'La diferencia se construyó con el control del reloj y las jugadas grandes.'],['A','Hasta la próxima semana.']]}),3500);}
}
function doStart(){sim.start();paused=false;$('start-overlay').classList.add('hidden');$('play-pause').textContent='Ⅱ';}
function start(){
  if(sim.state==='FINAL'){if(managerCtx)hooks.onDone?.();else openSettings();return;}
  ensureBc();
  if(bc&&!bcIntroShown){bcIntroShown=true;$('start-overlay').classList.add('hidden');
    const fx=managerCtx&&managerCtx.fixture,comp=fx?({regular:'Liga de Gridiron Online',cup:'Copa LGO',semi:'Semifinal',final:'Gran final'}[fx.type]||'Liga de Gridiron Online'):'Exhibición · Liga de Gridiron Online';
    const t=sim.teams;
    bc.intro({competition:comp,date:'',venue:$('stadium-label')?$('stadium-label').textContent:'',home:{name:t[0].name,short:t[0].short,primary:t[0].color,sub:'Local'},away:{name:t[1].name,short:t[1].short,primary:t[1].color,sub:'Visitante'},
      onDone:()=>bc.studio({kind:'pre',onDone:doStart,lines:[['A',`Bienvenidos. ${t[0].name} recibe a ${t[1].name}: ${comp}.`],['B',`${t[0].name} juega ${String(t[0].style).toLowerCase()} con defensa ${String(t[0].defense).toLowerCase()}; ${t[1].name}, ${String(t[1].style).toLowerCase()} con defensa ${String(t[1].defense).toLowerCase()}.`],['A','Cuatro cuartos, un solo objetivo: llegar a la zona de anotación.']]})});return;}
  doStart();
}
function togglePause(){if(!sim.started){start();return;}if(replay){replay=null;return;}paused=!paused;$('play-pause').textContent=paused?'▶':'Ⅱ';}
$('start-match').addEventListener('click',start);$('play-pause').addEventListener('click',togglePause);
window.addEventListener('keydown',e=>{if(['INPUT','SELECT','BUTTON'].includes(e.target.tagName)||$('settings-dialog').open)return;if(e.code==='Space'){e.preventDefault();togglePause();}if(e.key.toLowerCase()==='d')$('debug-button').click();});
document.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>{speed=+b.dataset.speed;document.querySelectorAll('[data-speed]').forEach(btn=>btn.classList.toggle('active',btn===b));});
document.querySelectorAll('[data-camera]').forEach(b=>b.onclick=()=>{if(view)view.cameraController.mode=b.dataset.camera;document.querySelectorAll('[data-camera]').forEach(btn=>btn.classList.toggle('active',btn===b));});
document.querySelectorAll('[data-side]').forEach(b=>b.onclick=()=>{tacticSide=b.dataset.side;document.querySelectorAll('[data-side]').forEach(btn=>btn.classList.toggle('active',btn===b));renderUI();});
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.body.dataset.tab=b.dataset.tab;document.querySelectorAll('[data-tab]').forEach(btn=>btn.classList.toggle('active',btn===b));$('stats-view').classList.toggle('hidden',b.dataset.tab!=='stats');$('playbook-view').classList.toggle('hidden',b.dataset.tab!=='playbook');renderStats();});
$('audio-button').onclick=async()=>{try{const enabled=await audio.toggle();$('audio-button').setAttribute('aria-pressed',enabled);$('audio-button').innerHTML=`♪ <span>Audio ${enabled?'on':'off'}</span>`;}catch{toast('Audio no disponible en este navegador.');}};
$('debug-button').onclick=()=>{debug=!debug;$('debug-panel').classList.toggle('hidden',!debug);$('debug-button').setAttribute('aria-pressed',debug);};
$('fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else $('viewport').requestFullscreen?.().catch(()=>toast('Pantalla completa no disponible.'));};
function advance(){
  const previousPlay=sim.playNumber;sim.step(FIXED_DT);
  if(sim.playNumber!==recordedPlay){if(frames.length>10)lastReplay=frames;frames=[];recordedPlay=sim.playNumber;}
  if(['SNAP','PLAY LIVE','BALL RESOLUTION','DEAD BALL'].includes(sim.state)){frames.push(sim.snapshot());if(frames.length>600)frames.shift();}
  if(sim.state==='RESULT'&&frames.length)lastReplay=frames.slice();
  return previousPlay!==sim.playNumber;
}
$('next-play').onclick=()=>{if(sim.state==='FINAL'){toast(managerCtx?'Partido finalizado.':'Partido finalizado. Crea otro en Configuración.');return;}sim.start();$('start-overlay').classList.add('hidden');const play=sim.playNumber;let count=0;while(sim.playNumber===play&&sim.state!=='FINAL'&&count++<2000)advance();paused=true;replay=null;accumulator=0;renderUI();toast('Siguiente jugada preparada. Pulsa ▶ para continuar.');};
$('exhibition-button').onclick=()=>{managerCtx=null;matchLoaded=true;openSettings();};
$('sim-rest').onclick=()=>simulateRest();
$('replay-button').onclick=()=>{if(lastReplay.length){replay={frames:lastReplay,index:0,previousMode:view?.cameraController.mode};$('replay-badge').classList.remove('hidden');toast('Replay 0.5× · El partido se reanuda al terminar.');}};
function openSettings(){$('settings-dialog').showModal();}
$('close-settings').onclick=()=>$('settings-dialog').close();
for(const id of ['style-home','style-away']){for(const style of TEAM_STYLES)$(id).add(new Option(style,style));$(id).value=id==='style-home'?TEAMS[0].style:TEAMS[1].style;}
for(const id of ['defense-home','defense-away']){for(const style of DEFENSE_STYLES)$(id).add(new Option(style,style));$(id).value=id==='defense-home'?TEAMS[0].defense:TEAMS[1].defense;}
$('settings-form').onsubmit=e=>{e.preventDefault();const teams=TEAMS.map((t,i)=>({...t,style:$(i?'style-away':'style-home').value,defense:$(i?'defense-away':'defense-home').value}));managerCtx=null;finalHandled=false;sim=new MatchSimulator({seed:+$('seed-input').value,rules:{quarterSeconds:+$('quarter-length').value,penalties:$('penalties-input').checked},teams});paused=true;accumulator=0;replay=null;frames=[];lastReplay=[];recordedPlay=sim.playNumber;lastFeedId=0;lastHistory=0;$('forced-play').value='';$('forced-defense').value='';$('settings-dialog').close();$('start-overlay').classList.remove('hidden');$('result-overlay').classList.add('hidden');$('seed-label').textContent=`SEED ${sim.seed}`;view?.setTeams(sim.teams);userIdx=-1;hooks.onExhibition?.();renderUI();toast('Partido de exhibición listo.');};
for(const p of PLAYBOOK)$('forced-play').add(new Option(p.name,p.id));for(const c of DEFENSES)$('forced-defense').add(new Option(c,c));
$('forced-play').onchange=()=>{sim.forcedPlay=$('forced-play').value||null;toast(sim.forcedPlay?'Jugada fijada para el siguiente snap.':'Play calling autónomo activado.');};
$('forced-defense').onchange=()=>{sim.forcedCoverage=$('forced-defense').value||null;toast('Cobertura actualizada para la siguiente jugada.');};
$('playbook-grid').innerHTML=PLAYBOOK.map(p=>`<button class="play-card" data-play="${p.id}"><strong>${p.name}</strong><span>${p.type.toUpperCase()} · ${p.personnel} PERSONNEL · ${p.formation.toUpperCase()}</span></button>`).join('');
$('playbook-grid').addEventListener('click',e=>{const b=e.target.closest('[data-play]');if(!b)return;$('forced-play').value=b.dataset.play;$('forced-play').onchange();document.querySelectorAll('[data-play]').forEach(p=>p.classList.toggle('selected',p===b));});
$('export-button').onclick=()=>{const payload={version:1,seed:sim.seed,rules:sim.config,teams:sim.teams,score:sim.drive.score,stats:sim.drive.stats,history:sim.history};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`lgo_match_${sim.seed}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Datos del partido exportados.');};
function drawDiagram(){
  const c=$('diagram'),ctx=c.getContext('2d'),w=c.width,h=c.height;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#0d1720';ctx.fillRect(0,0,w,h);
  const special=sim.specialPlay;const minZ=special?0:sim.los-10,range=special?110:45;
  const point=p=>({x:35+(p.x+26.65)/53.3*(w-70),y:h-28-(p.z-minZ)/range*(h-52)});
  ctx.strokeStyle='#25353f';ctx.lineWidth=1;for(let i=1;i<8;i++){ctx.beginPath();ctx.moveTo(20,i*h/8);ctx.lineTo(w-20,i*h/8);ctx.stroke();}
  ctx.setLineDash([6,8]);for(const x of [220,380]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}ctx.setLineDash([]);
  const los=point({x:0,z:sim.los});ctx.strokeStyle='#5d9bd16b';ctx.beginPath();ctx.moveTo(20,los.y);ctx.lineTo(w-20,los.y);ctx.stroke();
  for(const p of sim.players){
    const a=p.assignment,pos=point(p.start);ctx.lineWidth=2;
    if(tacticSide==='offense'&&a.points){ctx.strokeStyle=p.id===sim.qbRead?'#acd9b4':'#5786a0';ctx.beginPath();ctx.moveTo(pos.x,pos.y);for(const dest of a.points){const q=point(dest);ctx.lineTo(q.x,q.y);}ctx.stroke();const q=point(a.points.at(-1));ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.moveTo(q.x,q.y-6);ctx.lineTo(q.x-4,q.y+4);ctx.lineTo(q.x+4,q.y+4);ctx.fill();}
    if(tacticSide==='defense'&&a.zone){const q=point(a.zone);ctx.fillStyle='#ff9b6120';ctx.strokeStyle='#cd946675';ctx.beginPath();ctx.ellipse(q.x,q.y,a.zone.radius*7,a.zone.radius*3,0,0,Math.PI*2);ctx.fill();ctx.stroke();}
    if(tacticSide==='defense'&&a.target){const t=sim.players.find(d=>d.id===a.target);if(t){const q=point(t.start);ctx.strokeStyle='#b7825966';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(pos.x,pos.y);ctx.lineTo(q.x,q.y);ctx.stroke();ctx.setLineDash([]);}}
  }
  for(const p of sim.players){const q=point(p);ctx.fillStyle=p.side==='O'?'#73b9e5':'#e49b6d';ctx.strokeStyle='#101a22';ctx.lineWidth=3;ctx.beginPath();ctx.arc(q.x,q.y,p.id==='QB'?8:6,0,Math.PI*2);ctx.fill();ctx.stroke();if(['QB','RB','X','Z','TE','Y'].includes(p.id)){ctx.fillStyle='#9caebd';ctx.font='14px monospace';ctx.textAlign='center';ctx.fillText(p.id,q.x,q.y+21);}}
}
function renderStats(){const labels={plays:'Jugadas',yards:'Yardas totales',passing:'Yardas de pase',rushing:'Yardas de carrera',completions:'Pases completos',attempts:'Intentos de pase',firstDowns:'First downs',turnovers:'Pérdidas',sacks:'Sacks recibidos',touchdowns:'Touchdowns'};$('stats-content').innerHTML=`<div class="stats-grid">${sim.drive.stats.map((s,i)=>`<div class="stats-team"><h3>${sim.teams[i].name}</h3>${Object.entries(labels).map(([k,v])=>`<div class="stats-row"><span>${v}</span><strong>${Math.round(s[k])}</strong></div>`).join('')}</div>`).join('')}</div>`;}
let labelKey='';
function syncTeamLabels(){
  const key=sim.teams.map(t=>t.name+t.color).join('|');if(key===labelKey)return;labelKey=key;
  const [home,away]=sim.teams,sb=document.querySelector('.scoreboard');
  sb.style.setProperty('--blue',home.color);sb.style.setProperty('--orange',away.color);
  for(const [sel,t] of [['.team-home',home],['.team-away',away]]){const el=sb.querySelector(sel);el.querySelector('.team-name small').textContent=t.city;el.querySelector('.team-name strong').textContent=t.mascot;
    el.querySelector('.crest').innerHTML=`<div class="mono-crest" style="--c:${t.color};--d:${t.dark}">${t.short||t.mascot.slice(0,2)}</div>`;}
  $('stadium-label').textContent=`${home.city.charAt(0)+home.city.slice(1).toLowerCase()} Field`;
}
function loadMatch(ctx,options={}){
  ensureBc();bc&&bc.reset();bcLastId=0;bcIntroShown=false;bcHalf=false;bcPost=false;
  managerCtx=ctx;hooks=options;sim=ctx.sim;userIdx=options.userIndex??0;finalHandled=false;matchLoaded=true;
  paused=true;accumulator=0;replay=null;frames=[];lastReplay=[];recordedPlay=sim.playNumber;lastFeedId=0;lastHistory=0;labelKey='';
  view?.setTeams(sim.teams);$('start-overlay').classList.remove('hidden');$('result-overlay').classList.add('hidden');$('play-pause').textContent='▶';
  $('seed-label').textContent=`SEED ${sim.seed}`;speed=1;document.querySelectorAll('[data-speed]').forEach(b=>b.classList.toggle('active',b.dataset.speed==='1'));
  renderUI();
}
function simulateRest(){
  if(!sim.started)sim.start();$('start-overlay').classList.add('hidden');let n=0;while(sim.state!=='FINAL'&&n++<400000)advance();
  paused=true;replay=null;accumulator=0;renderUI();
  if(sim.state==='FINAL'&&managerCtx&&!finalHandled){finalHandled=true;hooks.onFinal?.(managerCtx);}
}
function renderUI(){
  const d=sim.drive,c=sim.clock;bcNfl();
  for(let i=0;i<2;i++){$(`score-${i}`).textContent=d.score[i];$(`possession-${i}`).classList.toggle('inactive',d.offense!==i);$(`timeouts-${i}`).innerHTML=Array.from({length:3},(_,n)=>`<i class="${n>=d.timeouts[i]?'used':''}"></i>`).join('');}
  $('quarter').textContent=c.quarter>sim.config.quarters?'OT':`${c.quarter}Q`;
  syncTeamLabels();$('game-clock').textContent=c.display;
  $('match-status').innerHTML=`<i></i> ${sim.state==='FINAL'?'FINAL':sim.state==='HALFTIME'?'DESCANSO':!sim.started?'LISTO PARA KICKOFF':paused?'EN PAUSA':'PARTIDO EN VIVO'}`;
  $('down').textContent=sim.specialPlay?sim.play.type.toUpperCase():`${d.down}${['','ST','ND','RD','TH'][d.down]} & ${d.lineToGain===100?'GOAL':Math.ceil(d.distance)}`;
  const stateNames={'HUDDLE':'HUDDLE','FORMATION':'FORMACIÓN','PRE-SNAP':'PRE-SNAP','SNAP':'SNAP','PLAY LIVE':'JUGADA EN VIVO','BALL RESOLUTION':'BALÓN EN EL AIRE','DEAD BALL':'BALÓN MUERTO','RESULT':'RESULTADO','NEXT DOWN':'SIGUIENTE DOWN','HALFTIME':'DESCANSO','FINAL':'FINAL DEL PARTIDO'};
  $('state-label').textContent=!sim.started?'PREPARADO':stateNames[sim.state];$('play-pause').textContent=paused||!sim.started?'▶':'Ⅱ';
  $('play-count').textContent=`#${String(sim.playNumber).padStart(3,'0')}`;
  $('personnel').textContent=tacticSide==='offense'?`${sim.play.personnel} PERSONNEL · ${sim.teams[sim.playOffense].short}`:`${sim.front.toUpperCase()} · ${sim.teams[1-sim.playOffense].short}`;
  $('play-name').textContent=tacticSide==='offense'?sim.play.name:sim.coverage;
  $('play-type').textContent=tacticSide==='offense'?sim.play.rpo?'RPO':sim.play.type==='pass'?'PASS':sim.play.type==='run'?'RUN':'KICK':'DEF';
  $('formation-name').textContent=sim.play.formation;$('coverage-name').textContent=`${sim.coverage} · ${sim.front}`;
  $('qb-read').textContent=sim.specialPlay?'—':sim.runCommitted?'Gap '+(sim.play.gap||'A'):sim.target?`${sim.target} · TARGET`:`${sim.qbRead} → ${sim.players.find(p=>p.id===sim.qbRead)?.assignment.route||'lectura'}`;
  $('pressure-value').textContent=`${Math.round(sim.pressure*100)}%`;$('pressure-meter').style.width=`${sim.pressure*100}%`;$('pressure-meter').style.background=sim.pressure>.6?'#f89361':'#a5e5ab';
  $('ai-note').textContent=sim.specialPlay?'Unidad especial en campo. La posesión se resolverá tras la patada.':sim.runCommitted?'El RB lee el gap y el leverage del bloqueo. La defensa debe reconocer la carrera antes de perseguir.':`${sim.play.playAction?'Play action: engaño de carrera. ':''}Progresión ${sim.players.find(p=>p.id==='QB').assignment.reads.slice(0,3).join(' → ')}. La presión y la separación deciden el pase.`;
  $('field-position').innerHTML=`${d.spot<=50?sim.teams[d.offense].short:sim.teams[1-d.offense].short} ${Math.round(d.spot<=50?d.spot:100-d.spot)}<small>YD</small>`;
  $('drive-label').textContent=`DRIVE ${String(d.drive).padStart(2,'0')}`;$('drive-team').textContent=sim.teams[d.offense].name.toUpperCase();
  let currentDrive=[];for(let i=sim.history.length-1;i>=0;i--){const r=sim.history[i];if(r.before.offense!==d.offense||['kickoff','punt','extra-point'].includes(r.kind))break;currentDrive.unshift(r);}
  $('drive-plays').textContent=currentDrive.length;$('drive-yards').innerHTML=`${Math.round(currentDrive.reduce((s,r)=>s+r.yards,0))}<small>YD</small>`;$('track-progress').style.width=`${d.spot}%`;$('track-ball').style.left=`${d.spot}%`;
  const lastEvent=sim.events.at(-1)?.id||0;
  if(lastEvent!==lastFeedId){lastFeedId=lastEvent;const events=sim.events.filter(e=>!['snap','whistle','play'].includes(e.type)).slice(-20).reverse();$('event-feed').innerHTML=events.length?events.map(e=>`<div class="feed-event ${['score','interception','fumble'].includes(e.type)?'score-event':''}"><span>Q${e.quarter} ${e.time}</span><i></i><div>${e.text}</div></div>`).join(''):'<div class="empty-feed">Sin jugadas todavía.<small>Los eventos del partido aparecerán aquí.</small></div>';}
  const showResult=sim.state==='RESULT'||sim.state==='FINAL'||sim.state==='HALFTIME';$('result-overlay').classList.toggle('hidden',!showResult||!!replay);
  if(showResult){$('result-detail').textContent=sim.state==='FINAL'?'CUATRO CUARTOS · PARTIDO COMPLETO':sim.state==='HALFTIME'?'MEDIO TIEMPO':sim.play.name.toUpperCase();$('result-title').textContent=sim.state==='FINAL'?(d.score[0]===d.score[1]?'EMPATE':`${sim.teams[d.score[0]>d.score[1]?0:1].mascot} WIN`):sim.state==='HALFTIME'?'DESCANSO':sim.lastResult?.label||'';$('result-yards').textContent=sim.state==='FINAL'?`${d.score[0]} — ${d.score[1]}`:sim.state==='HALFTIME'?'Segundo kickoff a continuación':sim.specialPlay?'UNIDAD ESPECIAL':`${sim.lastResult?.yards>=0?'+':''}${sim.lastResult?.yards.toFixed(1)} YARDAS`;}
  $('replay-button').disabled=lastReplay.length<10;$('replay-badge').classList.toggle('hidden',!replay);
  if(debug){$('debug-state').textContent=`${sim.state} · ${d.down} & ${d.distance.toFixed(1)} · LOS ${sim.los.toFixed(1)} · QB ${sim.qbRead}`;$('debug-rows').innerHTML=sim.players.map(p=>`<tr><td>#${p.number} ${p.id}</td><td>${p.role}</td><td>${p.assignment.type}</td><td>${p.assignment.route||p.assignment.zone? p.assignment.route||`${p.assignment.zone.x.toFixed(0)}, ${p.assignment.zone.z.toFixed(0)}`:p.assignment.gap??'—'}</td><td>${p.assignment.target||p.engaged||'—'}</td><td>${p.state}</td></tr>`).join('');}
  if(sim.history.length!==lastHistory){lastHistory=sim.history.length;renderStats();}
  drawDiagram();
}
let lastTime=performance.now();
function tick(now){
  const dt=Math.min(.1,(now-lastTime)/1000);lastTime=now;
  if(document.body.dataset.page!=='match'||!matchLoaded){requestAnimationFrame(tick);return;}
  if(replay){replay.index+=dt/FIXED_DT*.5;if(replay.index>=replay.frames.length){replay=null;$('replay-badge').classList.add('hidden');}}
  else if(sim.started&&!paused&&!$('settings-dialog').open){accumulator+=dt*speed;let iterations=0;while(accumulator>=FIXED_DT&&iterations++<30){advance();accumulator-=FIXED_DT;}if(sim.state==='FINAL')paused=true;}
  if(sim.state==='FINAL'&&managerCtx&&!finalHandled){finalHandled=true;paused=true;hooks.onFinal?.(managerCtx);}
  if(view){view.debug(sim,debug&&!replay);view.update(replay?replay.frames[Math.floor(replay.index)]:sim.snapshot(),dt,sim.started);}
  audio.update(sim.events);
  if(now-lastUI>100){renderUI();lastUI=now;}
  requestAnimationFrame(tick);
}
renderUI();requestAnimationFrame(tick);
// A narrow test bridge: the browser and headless suites inspect the same engine.
window.matchLab={get simulator(){return sim;},get view(){return view;},get paused(){return paused;},get context(){return managerCtx;},get userIndex(){return userIdx;},load:loadMatch,simulateRest,pause(){paused=true;},get loaded(){return matchLoaded;},unload(){matchLoaded=false;managerCtx=null;}};
import './ui/app.js';
import '../../assets/broadcast/broadcast.js';
