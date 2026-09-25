import * as THREE from 'three';
import { Race, DRIVERS, STAT_NAMES, LENGTH, trackAt, formatLap, clamp } from './simulation.js';
import { BroadcastScene } from './scene.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const race=new Race();let scene;let lastEvent=null,toastUntil=0,podiumShown=false,uiAccumulator=0,accumulator=0,lastFrame=0,notificationTimer;
const clock=t=>`${Math.floor(t/60).toString().padStart(2,'0')}:${Math.floor(t%60).toString().padStart(2,'0')}`;
const icon=id=>`<svg><use href="#i-${id}"/></svg>`;
const notify=text=>{$('#notification').textContent=text;$('#notification').hidden=false;clearTimeout(notificationTimer);notificationTimer=setTimeout(()=>$('#notification').hidden=true,3200);};

// Local synthesis: engine harmonics, tire noise and crowd ambience. No external audio required.
class RaceAudio{
 constructor(){this.enabled=false;this.ctx=null;this.lastGear=0;this.eventKey=null;}
 init(){
  if(this.ctx){this.ctx.resume();return;}
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  try{
   this.ctx=new Audio();const ctx=this.ctx;this.master=ctx.createGain();this.master.gain.value=0;this.master.connect(ctx.destination);this.engines=[];
   const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-16;compressor.ratio.value=7;compressor.connect(this.master);
   for(let i=0;i<3;i++){
    const osc=ctx.createOscillator(),sub=ctx.createOscillator(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();osc.type='sawtooth';sub.type='triangle';filter.type='lowpass';filter.frequency.value=900;gain.gain.value=.03;osc.connect(filter);sub.connect(filter);filter.connect(gain);gain.connect(compressor);osc.start();sub.start();this.engines.push({osc,sub,filter,gain});
   }
   const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;this.noiseBuffer=buffer;
   const noise=ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=850;filter.Q.value=.8;this.tireGain=ctx.createGain();this.tireGain.gain.value=.005;noise.connect(filter);filter.connect(this.tireGain);this.tireGain.connect(compressor);noise.start();
   const crowd=ctx.createBufferSource();crowd.buffer=buffer;crowd.loop=true;const crowdFilter=ctx.createBiquadFilter();crowdFilter.type='lowpass';crowdFilter.frequency.value=420;const crowdGain=ctx.createGain();crowdGain.gain.value=.015;crowd.connect(crowdFilter);crowdFilter.connect(crowdGain);crowdGain.connect(compressor);crowd.start();
  }catch(e){notify('El navegador no permite audio en esta sesión.');}
 }
 toggle(){this.init();this.enabled=!this.enabled;this.sync();}
 sync(){$('#sound').innerHTML=icon(this.enabled?'volume':'muted');$('#sound').setAttribute('aria-label',this.enabled?'Silenciar sonido':'Activar sonido');$('#sound').title=this.enabled?'Silenciar sonido':'Activar sonido';}
 cue(type){if(!this.ctx||!this.enabled)return;const ctx=this.ctx,t=ctx.currentTime,gain=ctx.createGain();gain.connect(this.master);if(type==='CONTACT'){const n=ctx.createBufferSource();n.buffer=this.noiseBuffer;gain.gain.setValueAtTime(.3,t);gain.gain.exponentialRampToValueAtTime(.001,t+.2);n.connect(gain);n.start();n.stop(t+.21);n.onended=()=>gain.disconnect();}else{const o=ctx.createOscillator();o.type='sine';o.frequency.value=type==='LIGHTS OUT'?850:420;gain.gain.setValueAtTime(.05,t);gain.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(gain);o.start();o.stop(t+.23);o.onended=()=>gain.disconnect();}}
 update(){if(!this.ctx)return;const ctx=this.ctx,active=!['grid','podium'].includes(race.phase)&&!race.paused&&!document.hidden;this.master.gain.setTargetAtTime(this.enabled&&active?.58:0,ctx.currentTime,.1);if(!active)return;
  const focus=race.cars[scene?.currentId??0],cars=[focus,...race.cars.filter(c=>c!==focus).sort((a,b)=>Math.abs(a.progress-focus.progress)-Math.abs(b.progress-focus.progress)).slice(0,2)];
  cars.forEach((c,i)=>{const gear=clamp(Math.floor(c.speed/12)+1,1,5),rpm=2100+(c.speed-(gear-1)*11)*270;const f=clamp(rpm/60,37,170);let e=this.engines[i];e.osc.frequency.setTargetAtTime(f*(1+i*.013),ctx.currentTime,.045);e.sub.frequency.setTargetAtTime(f*.5,ctx.currentTime,.045);e.filter.frequency.setTargetAtTime(600+c.speed*21,ctx.currentTime,.1);e.gain.gain.setTargetAtTime(i===0?.07:.028/(1+Math.abs(c.progress-focus.progress)/15),ctx.currentTime,.1);});
  this.tireGain.gain.setTargetAtTime(focus.error>0||focus.state==='Braking'?.055:.005+focus.speed*.0002,ctx.currentTime,.07);
 }
}
const audio=new RaceAudio();

function buildLeaderboard(){
 $('#leaderboard').innerHTML=race.cars.map(c=>`<button class="driver-row ${c.id===0?'selected':''}" data-driver="${c.id}" style="--driver-color:${c.color}" aria-label="Suivre ${c.full}"><span class="driver-position">${c.rank.toString().padStart(2,'0')}</span><i class="team-stripe"></i><span><span class="driver-name">${c.name}</span><span class="driver-team">${c.team}</span></span><span class="driver-gap"><span class="gap-text">—</span><span class="tire-dot ${c.tire==='S'?'soft':c.tire==='M'?'medium':'hard'}">${c.tire}</span></span></button>`).join('');
 $$('.driver-row').forEach(row=>row.onclick=()=>followDriver(Number(row.dataset.driver)));positionRows();
}
function positionRows(){
 const mobile=window.innerWidth<=600,height=window.innerWidth>=1500?45:mobile?43:41;
 for(const c of race.cars){const row=$(`[data-driver="${c.id}"]`);if(!row)continue;const index=c.rank-1;row.style.transform=`translateY(${(mobile?index%5:index)*height}px)`;row.style.left=mobile&&index>=5?'calc(50% + 5px)':'0';row.classList.toggle('p1',c.rank===1);row.querySelector('.driver-position').textContent=c.rank.toString().padStart(2,'0');}
}
function followDriver(id){scene.manualId=id;scene.forceCut=true;$$('.driver-row').forEach(el=>el.classList.toggle('selected',+el.dataset.driver===id));notify(`Cámara siguiendo a ${race.cars[id].full}`);}
function cameraMode(mode){scene.manualId=null;scene.setMode(mode);$$('.camera-card').forEach(b=>b.classList.toggle('active',b.dataset.camera===mode));const descriptions={director:'El director IA busca batallas, adelantamientos y los momentos que importan.',onboard:'Dentro del auto. Selecciona un piloto en la clasificación para seguirlo.',trackside:'Cámaras fijas que siguen la acción desde el borde del circuito.',aerial:'La perspectiva completa: estrategias, distancias y luchas por posición.'};$('#director-description').textContent=descriptions[mode];}
function startRace(){
 if(race.phase!=='grid')return;race.mandatoryPit=$('#pit-toggle').checked;race.start();audio.init();audio.enabled=true;audio.sync();$('#hero-intro').hidden=true;$('#start-lights').hidden=false;$('#broadcast-bottom').hidden=false;$('#pit-toggle').disabled=true;scene.forceCut=true;updateUI();
}
function togglePause(){if(race.phase==='grid'){startRace();return;}if(race.phase==='podium')return;race.paused=!race.paused;let tag=$('.paused-tag');if(race.paused&&!tag){tag=document.createElement('div');tag.className='paused-tag';tag.textContent='PAUSA';$('#broadcast').append(tag);}else if(tag)tag.remove();audio.ctx?.resume();updateUI();}
function resetRace(){
 const pit=$('#pit-toggle').checked;race.reset();race.mandatoryPit=pit;$('#pit-toggle').disabled=false;$('#hero-intro').hidden=false;$('#start-lights').hidden=true;$('#broadcast-bottom').hidden=true;$('#podium-overlay').hidden=true;$('#event-toast').hidden=true;$('.paused-tag')?.remove();$('#detail-dialog').close();podiumShown=false;lastEvent=null;toastUntil=0;accumulator=0;scene.manualId=null;cameraMode('director');$$('[data-speed]').forEach(b=>b.classList.toggle('active',Number(b.dataset.speed)===1));buildLeaderboard();updateUI();
}
function askRestart(){if(race.phase==='grid'||race.phase==='podium'){resetRace();return;}openDialog(`<span class="dialog-eyebrow">NUEVA CARRERA</span><h2>¿Volvemos a la parrilla?</h2><p>Se perderá la carrera actual. Una nueva simulación tendrá decisiones, incidentes y resultados diferentes.</p><div class="podium-actions"><button class="primary-button" id="confirm-restart">REINICIAR CARRERA</button><button class="secondary-button" id="cancel-restart">Seguir mirando</button></div>`);$('#confirm-restart').onclick=resetRace;$('#cancel-restart').onclick=()=>$('#detail-dialog').close();}
function updateUI(){
 positionRows();const phase=race.phase,running=!['grid','podium'].includes(phase);
 const leader=race.order[0];
 for(const c of race.cars){const row=$(`[data-driver="${c.id}"]`),diff=c.finished?c.finishTime-leader.finishTime:(leader.progress-c.progress)/Math.max(24,c.speed);row.querySelector('.gap-text').textContent=phase==='grid'||phase==='start'?'—':c.pitActive?'PIT':c.rank===1?'LEAD':`+${Math.max(0,diff).toFixed(1)}`;row.querySelector('.tire-dot').className=`tire-dot ${c.tire==='S'?'soft':c.tire==='M'?'medium':'hard'}`;row.querySelector('.tire-dot').textContent=c.tire;row.title=`${c.full} · ${c.state} · Neumáticos ${Math.round(c.wear)}% · ${Math.round(c.speed*3.6)} km/h`;}
 const lap=Math.min(race.laps,Math.max(1,leader.lap+1));$('#lap-label').textContent=phase==='grid'?'PRÓXIMA SESIÓN':phase==='lastlap'?'ÚLTIMA VUELTA':phase==='finish'||phase==='podium'?'BANDERA A CUADROS':'VUELTA';$('#lap-counter').innerHTML=phase==='grid'?'GRID <em>/ 10</em>':`${lap.toString().padStart(2,'0')} <em>/ ${race.laps.toString().padStart(2,'0')}</em>`;
 const names={grid:'GRID',start:'START',race:'LIVE',lastlap:'FINAL LAP',finish:'FINISH',podium:'FINAL'};$('#timing-status').textContent=race.paused?'PAUSED':names[phase];$('#live-pill').innerHTML=`<i></i> ${race.paused?'PAUSED':phase==='grid'?'PRE-RACE':names[phase]}`;$('#live-pill').classList.toggle('racing',running&&!race.paused);$('#playback-state').textContent=race.paused?'CARRERA EN PAUSA':phase==='grid'?'LISTO PARA LARGAR':phase==='podium'?'CARRERA FINALIZADA':phase==='start'?'SECUENCIA DE SALIDA':'TRANSMISIÓN EN VIVO';$('#pause-race').innerHTML=icon(running&&!race.paused?'pause':'play');$('#pause-race').disabled=phase==='podium';$('#pause-race').setAttribute('aria-label',phase==='grid'?'Iniciar carrera':race.paused?'Continuar carrera':'Pausar carrera');
 $('#start-lights').hidden=phase!=='start';if(phase==='start')$$('.light-bank i').forEach((el,i)=>el.classList.toggle('on',5-race.countdown>=i));
 $('#session-clock').textContent=clock(race.time)+'.'+Math.floor(race.time%1*1000).toString().padStart(3,'0');
 const camNames={grid:'GRID CAMERA',battle:'BATTLE CAMERA',onboard:'ONBOARD',aerial:'HELICAM',trackside:'TRACKSIDE',front:'LEADER CAMERA',wide:'CIRCUIT CAMERA',chase:'CHASE CAMERA'};
 $('#camera-label').textContent=camNames[scene?.shot]||'DIRECTOR IA';const focus=race.cars[scene?.currentId??0];$('#camera-driver').textContent=`${focus.number} / ${focus.name}`;$('#onboard-hud').hidden=!(scene?.mode==='onboard'&&running);$('#car-speed').textContent=Math.round(focus.speed*3.6);$('#gear-display').textContent=focus.speed<1?'N':clamp(Math.floor(focus.speed/12)+1,1,5);
 const latest=race.events[0];if(latest&&latest!==lastEvent){lastEvent=latest;$('#event-feed').innerHTML=race.events.slice(0,3).map(e=>`<div class="feed-event"><time>${clock(e.time)}</time><div><strong>${e.type}</strong><p>${e.text}</p></div></div>`).join('');if(phase!=='grid'&&phase!=='start'&&phase!=='podium'){$('#toast-type').textContent=latest.type;$('#toast-text').textContent=latest.text;$('#event-toast').hidden=false;toastUntil=race.time+4.5;audio.cue(latest.type);}}
 if(race.time>toastUntil||phase==='podium')$('#event-toast').hidden=true;
 $('#intensity-text').textContent=phase==='grid'?'EN ESPERA':race.excitement>70?'AL ROJO VIVO':race.excitement>35?'BATALLA EN PISTA':'RITMO DE CARRERA';$$('#intensity-bars i').forEach((bar,i)=>{bar.classList.toggle('lit',i<race.excitement/10);bar.classList.toggle('hot',i<race.excitement/10&&i>6);});
 if(phase==='podium'&&!podiumShown){podiumShown=true;showPodium();}
}
function showPodium(){
 const winners=[race.order[1],race.order[0],race.order[2]],winner=race.order[0];
 $('#podium-overlay').innerHTML=`<span class="podium-eyebrow">CHEQUERED FLAG / CLASIFICACIÓN FINAL</span><h2>LA GLORIA TIENE DUEÑO.</h2><p>${race.laps} vueltas · ${clock(winner.finishTime)} de carrera · ${race.overtakes} cambios de posición</p><div class="podium-places">${winners.map(c=>`<div class="podium-place ${c.rank===1?'winner':''}" style="--driver-color:${c.color}"><span class="podium-number">${c.rank===1?'01':c.rank===2?'02':'03'}</span><strong>${c.name}</strong><small>${c.team}</small></div>`).join('')}</div><div class="podium-actions"><button class="primary-button" id="race-again">${icon('reset')} OTRA CARRERA</button><button class="secondary-button" id="see-results">VER RESULTADOS</button></div>`;$('#podium-overlay').hidden=false;$('#race-again').onclick=resetRace;$('#see-results').onclick=showResults;
}
function openDialog(html){$('#dialog-content').innerHTML=html;if(!$('#detail-dialog').open)$('#detail-dialog').showModal();}
function showResults(){openDialog(`<span class="dialog-eyebrow">GRAN PREMIO DEL LITORAL</span><h2>RESULTADOS DE CARRERA</h2><p class="dialog-subtitle">${race.laps} vueltas · ${race.mandatoryPit?'Una parada obligatoria':'Sprint sin paradas'} · ${race.overtakes} cambios de posición</p><table class="result-table"><tr><th>POS</th><th>PILOTO</th><th>EQUIPO</th><th>TIEMPO / GAP</th><th>MEJOR VUELTA</th></tr>${race.order.map(c=>`<tr><td>${c.rank.toString().padStart(2,'0')}</td><td>${c.full}</td><td>${c.team}</td><td>${c.finished?(c.rank===1?formatLap(c.finishTime):'+'+(c.finishTime-race.order[0].finishTime).toFixed(3)):'Sin clasificar'}</td><td>${c.bestLap?formatLap(c.bestLap):'—'}</td></tr>`).join('')}</table><p>Vuelta rápida: ${race.fastest?race.cars[race.fastest.id].full+' · '+formatLap(race.fastest.time):'—'}</p>`);}
function showDrivers(){
 openDialog(`<span class="dialog-eyebrow">TOURING CAR SERIES / TEMPORADA 2006</span><h2>DIEZ PILOTOS. DIEZ PERSONALIDADES.</h2><p class="dialog-subtitle">El ritmo, la agresividad y la consistencia cambian cada batalla. Selecciona a quién seguir.</p><div class="driver-grid">${race.cars.map(c=>`<article class="driver-card" style="--driver-color:${c.color}"><div class="driver-card-header"><div><h3>${c.full}</h3><small>${c.team} / ${c.country}</small></div><span class="driver-number">${c.number}</span></div><div class="stats-grid">${STAT_NAMES.map((n,i)=>`<div class="stat-row"><div><span>${n}</span><strong>${c.stats[i]}</strong></div><div class="stat-track"><i style="width:${c.stats[i]}%"></i></div></div>`).join('')}</div><button class="follow-driver" data-follow="${c.id}">Seguir piloto ${icon('arrow')}</button></article>`).join('')}</div>`);
 $$('[data-follow]').forEach(b=>b.onclick=()=>{followDriver(+b.dataset.follow);$('#detail-dialog').close();});
}
function showCircuit(){
 openDialog(`<span class="dialog-eyebrow">ARGENTINA / CIRCUITO FICTICIO</span><h2>AUTÓDROMO DEL LITORAL</h2><p class="dialog-subtitle">Rectas rápidas. Frenadas profundas. El lugar donde se gana por centímetros.</p><canvas class="circuit-map" id="circuit-map" width="1200" height="480"></canvas><div class="circuit-stats"><div><strong>${(LENGTH/1000).toFixed(2)} km</strong><small>LONGITUD DEL CIRCUITO</small></div><div><strong>12</strong><small>CURVAS Y CAMBIOS DE APOYO</small></div><div><strong>5</strong><small>VUELTAS DE CARRERA</small></div><div><strong>~3 MIN</strong><small>DURACIÓN ESTIMADA</small></div></div><p>La recta principal favorece el rebufo. El sector interior premia el paso por curva y la frenada. Los pianos y las escapatorias penalizan el agarre; el pit lane recorre el exterior de la recta de meta.</p>`);
 const canvas=$('#circuit-map'),ctx=canvas.getContext('2d'),map=p=>[(p.x+220)*2.6,(p.z+135)*1.7];ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();for(let i=0;i<=400;i++){const p=map(trackAt(i/400*LENGTH));i?ctx.lineTo(...p):ctx.moveTo(...p);}ctx.closePath();ctx.strokeStyle='#48563b';ctx.lineWidth=35;ctx.stroke();ctx.strokeStyle='#919c7a';ctx.lineWidth=22;ctx.stroke();ctx.strokeStyle='#d8dfc2';ctx.lineWidth=2;ctx.stroke();const start=map(trackAt(0));ctx.fillStyle='#f17843';ctx.fillRect(start[0]-3,start[1]-25,6,50);ctx.font='bold 16px monospace';ctx.fillText('START / FINISH',start[0]-58,start[1]+48);for(const car of race.cars){const [x,y]=map(trackAt(car.progress,car.offset));ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fillStyle=car.color;ctx.fill();}ctx.fillStyle='#869d73';ctx.font='italic bold 50px Arial';ctx.fillText('LITORAL',425,215);ctx.font='12px monospace';ctx.fillText('AUTÓDROMO • EST. 2006',448,241);
}
function showAbout(){openDialog(`<span class="dialog-eyebrow">LRO</span><h2>ACERCA DE LRO</h2><p>Simulador de carreras con autos 3D controlados por la CPU, sin resultados predefinidos. Inspirado en el automovilismo argentino de los 2000.</p><div class="about-grid"><article><h3>IA que compite</h3><p>Ocho estadísticas por piloto. Aceleran, frenan, buscan espacio lateral, defienden, aprovechan rebufos y cometen errores según su consistencia.</p></article><article><h3>Física simplificada</h3><p>Frenada anticipada por curvatura, adherencia, aceleración progresiva y resolución de contactos. Es un prototipo arcade, no física profesional.</p></article><article><h3>Estrategia de neumáticos</h3><p>Soft: más agarre y desgaste. Medium: equilibrado. Hard: durabilidad. Activa la parada obligatoria antes de largar para ver la estrategia en boxes.</p></article><article><h3>Director de cámaras</h3><p>Un índice de intensidad prioriza batallas, adelantamientos e incidentes. También puedes elegir una vista o seguir a tu piloto favorito.</p></article></div><div class="key-hint">ESPACIO: pausa / continuar · 1–4: cámaras · M: sonido · F: pantalla completa</div><p>Todos los vehículos, equipos y circuito son ficticios. Gráficos y sonido generados en el navegador. Sin multijugador ni sistemas de gestión.</p>`);}
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#broadcast').requestFullscreen();}catch{notify('Pantalla completa no disponible en este navegador.');}}
function bindControls(){
 $('#start-race').onclick=startRace;$('#pause-race').onclick=togglePause;$('#restart').onclick=askRestart;$('#sound').onclick=()=>audio.toggle();$('#fullscreen').onclick=fullscreen;$('#view-grid').onclick=showDrivers;$('#about').onclick=showAbout;
 $$('[data-speed]').forEach(b=>b.onclick=()=>{race.rate=Number(b.dataset.speed);$$('[data-speed]').forEach(x=>x.classList.toggle('active',x===b));});
 $$('[data-camera]').forEach(b=>b.onclick=()=>cameraMode(b.dataset.camera));
 $$('[data-page]').forEach(b=>b.onclick=()=>b.dataset.page==='drivers'?showDrivers():b.dataset.page==='circuit'?showCircuit():$('#detail-dialog').close());
 $('.dialog-close').onclick=()=>$('#detail-dialog').close();$('#detail-dialog').onclick=e=>{if(e.target===$('#detail-dialog')){const rect=e.target.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)e.target.close();}};
 window.addEventListener('resize',positionRows);
 document.addEventListener('keydown',e=>{if($('#detail-dialog').open||['INPUT','BUTTON'].includes(document.activeElement.tagName))return;if(e.code==='Space'){e.preventDefault();togglePause();}if(['1','2','3','4'].includes(e.key))cameraMode(['director','onboard','trackside','aerial'][+e.key-1]);if(e.key.toLowerCase()==='m')audio.toggle();if(e.key.toLowerCase()==='f')fullscreen();});
 document.addEventListener('visibilitychange',()=>{lastFrame=performance.now();accumulator=0;if(document.hidden)audio.update();});
 $('#intensity-bars').innerHTML='<i></i>'.repeat(10);
}
function makeThumbnails(){
 const r=scene.renderer,size=new THREE.Vector2();r.getSize(size);const oldPhase=race.phase,oldMode=scene.mode,oldFov=scene.camera.fov,oldPosition=scene.camera.position.clone(),oldLook=scene.look.clone();race.phase='race';
 $$('.camera-card').forEach((card,i)=>{
  const mode=card.dataset.camera;scene.setMode(mode);scene.forceCut=true;scene.update(.1);const canvas=card.querySelector('canvas');canvas.width=360;canvas.height=150;const ctx=canvas.getContext('2d');ctx.drawImage(r.domElement,0,0,r.domElement.width,r.domElement.height,0,0,360,150);
 });race.phase=oldPhase;scene.mode=oldMode;scene.camera.position.copy(oldPosition);scene.look.copy(oldLook);scene.camera.fov=oldFov;scene.forceCut=true;scene.update(.01);
}
function frame(now){
 requestAnimationFrame(frame);const dt=Math.min(.07,(now-(lastFrame||now))/1000);lastFrame=now;if(document.hidden)return;
 accumulator+=dt*race.rate;let steps=0;while(accumulator>=1/60&&steps<12){race.step(1/60);accumulator-=1/60;steps++;}
 scene.update(dt);audio.update();uiAccumulator+=dt;if(uiAccumulator>.10){updateUI();uiAccumulator=0;}
}
async function init(){
 buildLeaderboard();bindControls();
 try{scene=new BroadcastScene($('#viewport'),race);scene.update(.016);$('#loading').hidden=true;updateUI();requestAnimationFrame(()=>{makeThumbnails();requestAnimationFrame(frame);});
 // Exposed read-only reference is useful for simulation inspection in development.
 if(import.meta.env.DEV)window.__APEX__={race,scene,startRace,resetRace};
 }catch(e){console.error(e);$('#loading').innerHTML=`<strong>NO SE PUDO INICIAR WEBGL</strong><span>Activa la aceleración gráfica y vuelve a cargar.</span><button class="primary-button" onclick="location.reload()">REINTENTAR</button>`;$('#start-race').disabled=true;}
}
init();
