'use strict';
// ==========================================================================
// APEX GT3 MANAGER — screen rendering, navigation and round orchestration.
// Reads/writes the Career object from game-data.js. No THREE.js here.
// ==========================================================================
let Career = loadCareer() || newCareer();
window.Career = Career;

let previousFocusEl = null;
let packOpening = false;
function openModal(content){
  if (!$('modal-backdrop').classList.contains('open')) previousFocusEl = document.activeElement;
  $('modal-content').innerHTML = content;
  $('modal-backdrop').classList.add('open');
  $('close-modal').focus();
}
function closeModal(){
  if (packOpening) return;
  $('modal-backdrop').classList.remove('open');
  previousFocusEl && previousFocusEl.focus && previousFocusEl.focus();
}
$('close-modal').onclick = closeModal;
$('modal-backdrop').onclick = e => { if (e.target === $('modal-backdrop')) closeModal(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function money(n){ return '$' + Math.round(n).toLocaleString('es-AR'); }

// ---- Screen router ----------------------------------------------------
const SCREENS = ['home','garage','drivers','market','championship','calendar','practice','race','sponsors','regulations'];
function showScreen(name){
  SCREENS.forEach(s => { const el = $('screen-' + s); if (el) el.classList.toggle('active', s === name); });
  document.querySelectorAll('#mainnav button, #bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.screen === name));
  refreshScreen(name);
  if (name === 'race' && window.onRaceScreenShown) window.onRaceScreenShown();
}
function refreshScreen(name){
  if (name === 'home') renderHome();
  else if (name === 'garage') renderGarage();
  else if (name === 'drivers') renderDrivers();
  else if (name === 'market') renderMarket();
  else if (name === 'championship') renderChampionship();
  else if (name === 'calendar') renderCalendarScreen();
  else if (name === 'practice') renderPractice();
  else if (name === 'sponsors') renderSponsors();
  else if (name === 'regulations') renderRegulations();
}
document.querySelectorAll('#mainnav button, #bottom-nav button').forEach(btn => btn.onclick = () => showScreen(btn.dataset.screen));
$('brand-home').onclick = e => { e.preventDefault(); showScreen('home'); };

function refreshTopBadge(){ $('team-credits-badge').textContent = money(playerTeam(Career).credits); }
function refreshAll(){
  refreshTopBadge();
  refreshScreen(currentActiveScreen());
}
function currentActiveScreen(){
  const active = document.querySelector('.screen.active');
  return active ? active.id.replace('screen-','') : 'home';
}

// ---- HOME ---------------------------------------------------------------
function trackMiniSvg(def=currentTrack(Career)){
  const pts=RacingArt.trackCurve(def).getSpacedPoints(160);
  const xs=pts.map(p=>p.x),zs=pts.map(p=>p.z),minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);
  const scale=Math.min(170/(maxX-minX),100/(maxZ-minZ));
  const xy=p=>[100+(p.x-(minX+maxX)/2)*scale,65+(p.z-(minZ+maxZ)/2)*scale];
  const path=pts.map((p,i)=>{const [x,y]=xy(p);return `${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`;}).join(' ')+'Z';
  const start=xy(pts[0]);
  return `<path d="${path}" fill="none" stroke="#5bd7ed" stroke-width="4" stroke-linejoin="round"/><circle cx="${start[0]}" cy="${start[1]}" r="4" fill="#ffcb64"/>`;
}
function renderHome(){
  const team = playerTeam(Career);
  const round = currentRound(Career);
  const track = currentTrack(Career);
  const driver = activeDriver(Career, team);
  $('home-season').textContent = 'TEMPORADA ' + Career.season;
  $('home-round').textContent = round.round;
  $('home-total-rounds').textContent = Career.calendar.length;
  if ($('home-round-date')) $('home-round-date').textContent = fmtRaceDate(Career.season, round.round);
  $('home-team-name').textContent = team.name.toUpperCase() + '.';
  $('home-credits').textContent = money(team.credits);
  $('home-materials').textContent = team.materials + ' materiales';
  const teamsSorted = [...Career.teams].sort((a,b)=>b.points-a.points);
  const teamPos = teamsSorted.indexOf(team) + 1;
  $('home-team-pos').textContent = 'P' + teamPos;
  $('home-team-pts').textContent = team.points + ' PTS';
  const driverPoints = Career.championship.driverPoints;
  const driversSorted = Career.driversPool.filter(d=>d.teamId!==null).sort((a,b)=>(driverPoints[b.id]||0)-(driverPoints[a.id]||0));
  const driverPos = driversSorted.indexOf(driver) + 1;
  $('home-driver-pos').textContent = driver ? ('P' + driverPos) : '—';
  $('home-driver-name').textContent = driver ? driver.name.toUpperCase() : '—';
  const damagePct = Math.round((1 - (team.carDamage||0)) * 100);
  $('home-car-cond').textContent = damagePct + '%';
  $('home-body-name').textContent = BODIES[team.bodyType].name;
  $('home-hero-art').innerHTML = RacingArt.image('car',team.bodyType);
  $('hero-model').textContent = BODIES[team.bodyType].name;
  $('hero-driver').textContent = driver.name.toUpperCase();
  $('hero-rating').textContent = Math.round(Object.values(computePlayerCarRating(team)).reduce((a,b)=>a+b,0)/5*100);
  $('hero-garage').onclick = () => showScreen('garage');
  $('hero-race').onclick = () => showScreen('race');
  $('home-track-preview').innerHTML = trackMiniSvg();
  $('home-track-name').textContent = track.name;
  $('home-track-loc').textContent = track.country;
  $('home-track-len').textContent = track.lengthKm.toFixed(2);
  $('home-track-wet').textContent = Math.round(track.wetChance*100) + '%';
  const penaltyFlag = team.componentUsage.engine >= Career.regulations.componentLimit;
  $('home-penalty-flag').textContent = penaltyFlag ? 'PENALIZACIÓN' : 'OK';
  $('home-penalty-flag').style.color = penaltyFlag ? '#c93a2e' : '#4c6b3f';
  $('home-goto-event').onclick = () => showScreen('race');
  $('home-sponsors-list').innerHTML = team.sponsors.filter(Boolean).map(s => `<div class="news-item"><b>${s.name}</b> — ${money(s.base)} por carrera<small>${s.bonus.label}</small></div>`).join('') || '<p style="font-size:12px;color:#7c8272">Sin patrocinadores activos. Visitá la sección SPONSORS.</p>';
  $('home-news').innerHTML = Career.news.slice(0,8).map(n => `<div class="news-item"><b>${n.title}</b><small>${n.detail} · Ronda ${n.round} · ${fmtRaceDate(n.season || Career.season, n.round)}</small></div>`).join('');
}
function pushNews(title, detail){
  Career.news.unshift({ title, detail, season: Career.season, round: currentRound(Career) ? currentRound(Career).round : Career.calendar.length });
  Career.news = Career.news.slice(0, 30);
}

// ---- GARAGE ---------------------------------------------------------------
function renderGarage(){
  const team = playerTeam(Career);
  const axes = computePlayerCarRating(team);
  $('garage-showroom').innerHTML = `<div class="showroom-title"><span class="eyebrow">LRO · GARAGE</span><h2>${BODIES[team.bodyType].name}</h2><p>${BODIES[team.bodyType].desc}</p><span class="equipped-label">EQUIPADO / GT3</span></div><div class="showroom-art">${RacingArt.image('car',team.bodyType)}</div><div class="showroom-stats">${Object.entries(axes).map(([k,v])=>`<div><span>${AXIS_LABELS[k]}</span><b>${Math.round(v*100)}</b><i style="--value:${Math.min(100,v*100)}%"></i></div>`).join('')}</div>`;
  $('body-cards').innerHTML = Object.entries(BODIES).sort((a,b)=>Number(!!b[1].edition)-Number(!!a[1].edition)).map(([key,b],i) => `
    <button type="button" class="body-card ${team.bodyType===key?'active':''}" data-body="${key}" aria-pressed="${team.bodyType===key}" style="--rc:${RacingArt.specs[key].color}">
      <div class="collection-label">${b.edition||'EDICIÓN LRO'}<span>${String(i+1).padStart(2,'0')}</span></div>
      <div class="body-art">${RacingArt.image('car',key)}</div>
      <div class="body-info"><h4>${b.name}</h4><small>${b.desc}</small><div class="body-bonuses">${Object.entries(b.axes).map(([a,v])=>`<span class="${v<0?'negative':''}">${AXIS_LABELS[a]} ${v>0?'+':''}${Math.round(v*100)}</span>`).join('')}</div><div class="equip-action">${team.bodyType===key?'EQUIPADO':'EQUIPAR CARROCERÍA'} <span>${team.bodyType===key?'✓':'→'}</span></div></div>
    </button>`).join('');
  document.querySelectorAll('[data-body]').forEach(el => el.onclick = () => {
    if(window.isRaceBusy && window.isRaceBusy()){openModal('<h2 id="modal-title">COCHE EN PISTA</h2><p>Finalizá la sesión antes de cambiar la carrocería.</p>');return;}
    team.bodyType = el.dataset.body; saveCareer(Career); renderGarage();
    if(window.refreshPlayerBody)window.refreshPlayerBody();
  });

  $('parts-cards').innerHTML = PART_TYPES.map(type => {
    const part = team.parts[type];
    const info = RARITY_INFO[part.rarity];
    const stats = partRatingSummary(type, part);
    const cost = 3000 + part.level*1500, matCost = 5 + part.level*2;
    const maxed = part.level >= info.maxLevel;
    return `<div class="part-card" style="--rc:${info.color}">
      <span class="rarity-tag">${part.rarity}</span>
      <div class="part-art">${RacingArt.image('part',type,info.color)}<span class="part-grade">${part.level}</span></div>
      <h4>${PART_LABELS[type]}</h4>
      <div class="lvl">NIVEL ${part.level} / ${info.maxLevel} · DUPES ${part.dupes}/${info.dupToLevel}</div>
      <div class="card-progress"><i style="width:${Math.min(100,part.dupes/info.dupToLevel*100)}%"></i></div>
      <div class="stats-mini">${stats.map(s=>`${s.label}: +${s.value}`).join('<br>')}</div>
      <button data-upgrade="${type}" ${maxed||team.credits<cost||team.materials<matCost?'disabled':''}>${maxed?'NIVEL MÁXIMO':'MEJORAR · '+money(cost)+' + '+matCost+' MAT'}</button>
    </div>`;
  }).join('');
  document.querySelectorAll('[data-upgrade]').forEach(btn => btn.onclick = () => {
    if (upgradePart(Career, btn.dataset.upgrade)) { saveCareer(Career); refreshAll(); }
  });

  $('pack-cards').innerHTML = Object.entries(PACKS).map(([key,p]) => `
    <button type="button" class="pack-card" data-pack="${key}" style="--rc:${['#c78346','#a8cced','#f5c044','#b877ff'][Object.keys(PACKS).indexOf(key)]}"><span class="rarity-tag">${p.cards} CARTAS DE COMPONENTES</span>${RacingArt.pack(key)}<h4>${p.name}</h4><div class="pack-odds">${Object.entries(p.odds).filter(([,v])=>v>0).map(([r,v])=>`<span style="color:${RARITY_INFO[r].color}">${r} ${Math.round(v*100)}%</span>`).join('')}</div><div class="cost">ABRIR · ${money(p.cost)} <span>→</span></div></button>`).join('');
  document.querySelectorAll('[data-pack]').forEach(el => el.onclick = () => openPackFlow(el.dataset.pack));

  const fragEntries = PART_TYPES.map(t => ({type:t, dupes:team.parts[t].dupes}));
  $('fragments-list').innerHTML = fragEntries.map(f => `<div class="fragment-card"><span class="fragment-name">${RacingArt.image('part',f.type,RARITY_INFO[team.parts[f.type].rarity].color)}${PART_LABELS[f.type]}</span><span>${f.dupes} fragmentos</span></div>`).join('');
}
function openPackFlow(packId){
  if(packOpening)return;
  const pack = PACKS[packId], team = playerTeam(Career);
  if (!canAfford(team, pack.cost)) { openModal(`<div class="eyebrow">SOBRES</div><h2 id="modal-title">FONDOS INSUFICIENTES</h2><p>Necesitás ${money(pack.cost)} para abrir un ${pack.name}.</p>`); return; }
  const results = openPack(Career, packId);
  saveCareer(Career);
  refreshTopBadge();
  packOpening=true;
  $('close-modal').disabled=true;
  openModal(`<div class="pack-opening"><div class="eyebrow">COLECCIÓN LRO</div><h2 id="modal-title">${pack.name}</h2>${RacingArt.pack(packId)}<p>DESCIFRANDO COMPONENTES…</p></div>`);
  setTimeout(() => {
    packOpening=false;
    $('close-modal').disabled=false;
    const rows = results.map((r,i) => {
      const info = RARITY_INFO[r.rarity];
      const tag = r.rarityUp ? 'NUEVA PIEZA' : (r.leveledUp ? 'SUBIÓ DE NIVEL' : 'FRAGMENTO AÑADIDO');
      return `<div class="part-card reward-card" style="--rc:${info.color};--delay:${i*.13}s"><span class="rarity-tag">${r.rarity}</span><div class="part-art">${RacingArt.image('part',r.type,info.color)}<span class="reward-count">×1</span></div><h4>${PART_LABELS[r.type]}</h4><div class="reward-status">${tag}</div></div>`;
    }).join('');
    openModal(`<div class="rewards-heading"><div class="eyebrow">${pack.name} / RECOMPENSAS</div><h2 id="modal-title">¡FELICITACIONES!</h2><p>TUS NUEVOS COMPONENTES YA ESTÁN EN EL GARAGE</p></div><div class="rewards-grid">${rows}</div><button class="primary" style="margin:24px auto 0" id="pack-continue">CONTINUAR →</button>`);
    $('pack-continue').onclick = () => { closeModal(); refreshAll(); };
    refreshAll();
  }, 900);
}

// ---- DRIVERS --------------------------------------------------------------
function renderDrivers(){
  const team = playerTeam(Career);
  const drivers = teamDrivers(Career, team);
  $('active-driver-toggle').innerHTML = drivers.map(d => `<button data-active-driver="${d.id}" class="${team.activeDriverId===d.id?'active':''}">${d.name.toUpperCase()}</button>`).join('');
  document.querySelectorAll('[data-active-driver]').forEach(btn => btn.onclick = () => { team.activeDriverId = Number(btn.dataset.activeDriver); saveCareer(Career); renderDrivers(); });
  $('my-drivers-list').innerHTML = drivers.map(d => `
    <div class="driver-card-manager" style="--rc:#${d.color.toString(16).padStart(6,'0')}">
      <div class="driver-portrait" data-did="${d.id}">${RacingArt.image('driver',d)}<div class="driver-rating"><b>${d.rating}</b><span>RTG</span></div><div class="driver-nation">${d.nationality}</div><div class="num">${d.number}</div></div>
      <div class="info"><b>${d.name.toUpperCase()}</b><span>${d.nationality} · ${d.age} años · ${d.personality} · Rating ${d.rating}</span></div>
      <div class="dstats">
        <div><strong>${Math.round(d.stats[0]*100)}</strong>TOP</div>
        <div><strong>${Math.round(d.stats[3]*100)}</strong>CURVA</div>
        <div><strong>${Math.round(d.stats[5]*100)}</strong>AGR.</div>
        <div><strong>${Math.round(d.stats[6]*100)}</strong>REG.</div>
        <div><strong>${money(d.salary)}</strong>SALARIO</div>
      </div><div class="train-box" style="grid-column:1/-1;padding:8px 0"><label style="font-size:11px;letter-spacing:1px">ENFOQUE DE ENTRENAMIENTO&nbsp;<select data-focus="${d.id}">${DRV_STAT_LABELS.map((l,i)=>`<option value="${i}" ${(d.focus==null?recommendedFocus(d):d.focus)===i?'selected':''}>${l} (${Math.round(d.stats[i]*100)})</option>`).join('')}</select></label> <span style="font-size:11px;color:#8a9">Progreso ${Math.round((d.tp||0)/2.5*100)}%</span></div><button class="release-driver" data-release="${d.id}" ${team.driverIds.length<=1?'disabled':''}>LIBERAR PILOTO</button>
    </div>`).join('');
  document.querySelectorAll('[data-focus]').forEach(s => s.onchange = () => { const d = Career.driversPool.find(x => x.id === Number(s.dataset.focus)); d.focus = Number(s.value); d.tp = 0; saveCareer(Career); renderDrivers(); });
  $('train-intensity').innerHTML = Object.entries(TRAIN_INTENSITY).map(([k,v]) => `<button data-intensity="${k}" class="${(Career.trainIntensity||'normal')===k?'active':''}">${v.label.toUpperCase()}${v.cost?' · '+money(v.cost)+'/fecha':''}</button>`).join('');
  document.querySelectorAll('[data-intensity]').forEach(b => b.onclick = () => { Career.trainIntensity = b.dataset.intensity; saveCareer(Career); renderDrivers(); });
  document.querySelectorAll('[data-release]').forEach(b=>b.onclick=()=>{const id=Number(b.dataset.release);openModal('<h2 id="modal-title">¿LIBERAR PILOTO?</h2><p>Volverá al mercado. Podrás contratar un reemplazo.</p><button class="primary" id="confirm-release">CONFIRMAR</button>');$('confirm-release').onclick=()=>{releaseDriver(id);closeModal();};});
}

// ---- MARKET -----------------------------------------------------------
function marketPool(){ return Career.driversPool.filter(d => d.teamId === null); }
function renderMarket(){
  const team = playerTeam(Career);
  const pool = marketPool();
  $('market-list').innerHTML = pool.length ? pool.map(d => `
    <div class="driver-card-manager" style="--rc:#${d.color.toString(16).padStart(6,'0')}">
      <div class="driver-portrait" data-did="${d.id}">${RacingArt.image('driver',d)}<div class="driver-rating"><b>${d.rating}</b><span>RTG</span></div><div class="driver-nation">${d.nationality}</div><div class="num">${d.number}</div></div>
      <div class="info"><b>${d.name.toUpperCase()}</b><span>${d.nationality} · ${d.age} años · ${d.personality} · Rating ${d.rating}</span></div>
      <div class="dstats">
        <div><strong>${money(d.marketValue)}</strong>VALOR</div>
        <div><strong>${money(d.salary)}</strong>SALARIO/F</div>
      </div>
      <button data-sign="${d.id}" ${team.driverIds.length>=2?'disabled title="Liberá un piloto primero"':''}>FICHAR</button>
    </div>`).join('') : '<p style="font-size:12px;color:#7c8272">No hay pilotos libres esta fecha. Volvé después de la próxima carrera.</p>';
  document.querySelectorAll('[data-sign]').forEach(btn => btn.onclick = () => signDriver(Number(btn.dataset.sign)));
}
function signDriver(driverId){
  const team = playerTeam(Career);
  if (team.driverIds.length >= 2) return;
  const driver = Career.driversPool.find(d => d.id === driverId);
  if (!driver || driver.teamId !== null) return;
  if (!canAfford(team, driver.marketValue*.15)) { openModal('<h2 id="modal-title">FONDOS INSUFICIENTES</h2><p>No alcanza el presupuesto para la firma.</p>'); return; }
  spend(team, Math.round(driver.marketValue*.15));
  driver.teamId = team.id;
  driver.contractRounds = 6;
  team.driverIds.push(driver.id);
  pushNews('NUEVO FICHAJE', `${driver.name} firma con ${team.name}.`);
  saveCareer(Career);
  refreshAll();
}
function releaseDriver(driverId){
  const team = playerTeam(Career);
  if (team.driverIds.length <= 1) return;
  const driver = Career.driversPool.find(d => d.id === driverId);
  driver.teamId = null; driver.contractRounds = 0;
  team.driverIds = team.driverIds.filter(id => id !== driverId);
  if (team.activeDriverId === driverId) team.activeDriverId = team.driverIds[0];
  pushNews('SALIDA DEL EQUIPO', `${driver.name} deja ${team.name} y vuelve al mercado.`);
  saveCareer(Career);
  refreshAll();
}
function refreshMarketDynamics(){
  // Contracts tick down; some expire into free agency; AI teams occasionally sign free agents; values drift.
  Career.driversPool.forEach(d => {
    if (d.teamId !== null && d.teamId !== 0){
      d.contractRounds = Math.max(0, (d.contractRounds||6) - 1);
      if (d.contractRounds === 0 && Math.random() < .3){
        const team = Career.teams[d.teamId];
        if (team) team.driverIds = team.driverIds.filter(id => id !== d.id);
        d.teamId = null;
      }
    }
    d.marketValue = Math.max(2000, Math.round(d.marketValue * (0.94 + Math.random()*.14)));
  });
  Career.teams.forEach(team => {
    if (team.isPlayer) return;
    if (team.driverIds.length < 2 && Math.random() < .4){
      const candidate = marketPool()[0];
      if (candidate){ candidate.teamId = team.id; candidate.contractRounds = 5; team.driverIds.push(candidate.id); }
    }
  });
}

// ---- CHAMPIONSHIP -------------------------------------------------------
function renderChampionship(){
  renderCircuitLibrary();
  const dp = Career.championship.driverPoints;
  const drivers = Career.driversPool.filter(d => d.teamId !== null).sort((a,b)=>(dp[b.id]||0)-(dp[a.id]||0));
  $('drivers-champ-table').innerHTML = '<tr><th>POS</th><th>PILOTO</th><th>EQUIPO</th><th>PTS</th></tr>' +
    drivers.map((d,i) => `<tr class="${d.teamId===0?'me':''}"><td>${i+1}</td><td>${d.name.toUpperCase()}</td><td>${Career.teams[d.teamId].name}</td><td>${dp[d.id]||0}</td></tr>`).join('');
  const teamsSorted = [...Career.teams].sort((a,b)=>b.points-a.points);
  $('teams-champ-table').innerHTML = '<tr><th>POS</th><th>EQUIPO</th><th>VICT.</th><th>PODIOS</th><th>PTS</th></tr>' +
    teamsSorted.map((t,i) => `<tr class="${t.isPlayer?'me':''}"><td>${i+1}</td><td>${t.name}</td><td>${t.wins}</td><td>${t.podiums}</td><td>${t.points}</td></tr>`).join('');
  const hist = Career.seasonHistory || [];
  if ($('season-history-table')) $('season-history-table').innerHTML = hist.length
    ? '<tr><th>TEMP.</th><th>PILOTO CAMPEÓN</th><th>EQUIPO CAMPEÓN</th><th>TU EQUIPO</th></tr>' + [...hist].reverse().map(h => `<tr><td>${h.season}</td><td>${h.driver ? h.driver.name.toUpperCase() + ' (' + h.driver.pts + ' pts)' : '—'}</td><td>${h.team.name}</td><td>${h.me.pos}.º · ${h.me.pts} pts · ${h.me.wins} vict.</td></tr>`).join('')
    : '<tr><td>Todavía no terminaste ninguna temporada.</td></tr>';
  $('calendar-list').innerHTML = Career.calendar.map(r => {
    const track = TRACKS.find(t => t.id === r.trackId);
    const isNow = r.round === currentRound(Career).round;
    return `<div class="calendar-row ${r.completed?'done':''} ${isNow?'now':''}"><span class="rnum">${String(r.round).padStart(2,'0')}</span><span style="flex:1">${track.name} — ${track.country} <small style="opacity:.65">${fmtRaceDate(Career.season, r.round)}</small></span><span>${r.completed ? (r.result ? r.result : 'CORRIDA') : (isNow?'PRÓXIMA':'PENDIENTE')}</span></div>`;
  }).join('');
}

// ---- CALENDARIO: todas las fechas de la temporada (jugadas y por venir) con su circuito ---------------------
function renderCalendarScreen(){
  if (!$('cal-races')) return;
  const cur = currentRound(Career), total = Career.calendar.length, done = Career.calendar.filter(r => r.completed).length, left = total - done;
  const N = window.LFONations, flag = n => { const f = N && n ? N.flag(n) : ''; return f ? `<img class="flag" src="${f}" alt="">` : ''; };
  $('cal-summary').innerHTML = `<div class="cal-summary"><div><span class="big">${left}</span><small>${left === 1 ? 'FECHA RESTANTE' : 'FECHAS RESTANTES'}</small></div><div><span class="big">${done}/${total}</span><small>DISPUTADAS · TEMPORADA ${Career.season}</small></div><div><span class="big">${fmtRaceDate(Career.season, cur.round).toUpperCase()}</span><small>PRÓXIMA CARRERA · ${(TRACKS.find(t => t.id === cur.trackId) || {}).name || ''}</small></div><div class="cal-bar"><i style="width:${Math.round(done / total * 100)}%"></i></div></div>`;
  $('cal-races').innerHTML = Career.calendar.map(r => {
    const t = TRACKS.find(x => x.id === r.trackId) || TRACKS[0], isNow = cur && r.round === cur.round;
    return `<article class="cal-race ${r.completed ? 'done' : ''} ${isNow ? 'now' : ''}"><span class="st">${r.completed ? (r.result || 'DISPUTADA') : isNow ? 'PRÓXIMA' : 'PENDIENTE'}</span><div class="top"><span class="rn">${String(r.round).padStart(2, '0')}</span><div><h4>${t.name}</h4><div class="date">${fmtRaceDate(Career.season, r.round).toUpperCase()}</div></div></div><div>${flag(t.nation)}${t.country}${t.opened ? ` · desde ${t.opened}` : ''}</div><p>${t.character || t.desc || ''}</p><div class="chips"><span>${Number(t.lengthKm).toFixed(2)} km</span><span>${t.corners} curvas</span><span>lluvia ${Math.round((t.wetChance || 0) * 100)}%</span><span>${t.tempBase}°C</span></div></article>`;
  }).join('');
}

// Circuit selection edits only the uncompleted round; standings and old results stay intact.
function renderCircuitLibrary(){
  if(!$('circuit-library')) $('screen-championship').insertAdjacentHTML('beforeend','<section class="panel-block circuit-library" id="circuit-library"></section>');
  const current=currentTrack(Career),locked=currentRound(Career).completed||window.isRaceBusy?.();
  $('circuit-library').innerHTML=`<div class="section-kicker"><span>ATLAS DE CIRCUITOS</span><small>${TRACKS.length} CIRCUITOS · TEMPORADA DE ${TRACKS.length} FECHAS</small></div><p class="circuit-help">Elegí el circuito de la próxima carrera. Cambiarlo reinicia la práctica y la clasificación de esta fecha, no tu campeonato.</p><p class="circuit-help"><button type="button" class="ghost" id="dl-current-circuit">⬇ Descargar JSON del circuito actual (${current.name})</button> <button type="button" class="ghost" id="dl-all-circuits">⬇ Descargar los 20 (circuits.json)</button></p><div class="circuit-grid">${TRACKS.map((t,i)=>`<button class="circuit-card ${current.id===t.id?'selected':''}" data-circuit="${t.id}" ${locked?'disabled':''}><div class="circuit-label">${(t.nation||'SERIE NACIONAL').toUpperCase()}<span>${String(i+1).padStart(2,'0')}</span></div><svg viewBox="0 0 200 130" aria-label="Trazado ${t.name}">${trackMiniSvg(t)}</svg><strong>${t.name}</strong><small>${t.country}</small><div class="circuit-specs"><span>${t.lengthKm.toFixed(2)} KM</span><span>${Math.round(t.wetChance*100)}% LLUVIA</span></div><em>${current.id===t.id?'SELECCIONADO':'ELEGIR CIRCUITO'}</em></button>`).join('')}</div>`;
  if($('dl-current-circuit'))$('dl-current-circuit').onclick=()=>window.downloadCircuitJSON&&window.downloadCircuitJSON(current);
  if($('dl-all-circuits'))$('dl-all-circuits').onclick=()=>window.downloadAllCircuitsJSON&&window.downloadAllCircuitsJSON();
  document.querySelectorAll('[data-circuit]').forEach(btn=>btn.onclick=()=>{
    const def=TRACKS.find(t=>t.id===btn.dataset.circuit);
    if(!def||currentRound(Career).completed||window.isRaceBusy?.())return;
    openModal(`<div class="eyebrow">SELECCIÓN DE CIRCUITO</div><h2 id="modal-title">${def.name}</h2><svg class="circuit-modal-map" viewBox="0 0 200 130">${trackMiniSvg(def)}</svg><p>${def.country} · ${def.lengthKm.toFixed(2)} km · ${def.corners} curvas${def.opened?' · abierto en '+def.opened:''}</p><p>${def.kind?'<b>'+def.kind+'</b> · ':''}${def.lore||def.desc}</p>${def.quirk?'<p><i>'+def.quirk+'</i></p>':''}${def.cornerNames?'<p><b>Curvas con nombre:</b> '+def.cornerNames.map(c=>c[0]).join(' · ')+'</p>':''}<p>Se reiniciará la preparación de esta fecha. Los resultados anteriores se conservan.</p><button class="primary" id="confirm-circuit">USAR EN ESTA FECHA</button> <button class="ghost" id="dl-circuit">⬇ Descargar JSON de este circuito</button>`);
    $('dl-circuit').onclick=()=>window.downloadCircuitJSON&&window.downloadCircuitJSON(def);
    $('confirm-circuit').onclick=()=>{
      if(currentRound(Career).completed||window.isRaceBusy?.())return;
      currentRound(Career).trackId=def.id;
      Career.qualifyingDoneRound=-1;Career.practice={score:0,confidence:35,setup:defaultSetup(),lastRoundPracticed:-1};
      saveCareer(Career);
      if(window.Autodromo){window.Autodromo.state.grid=[];window.Autodromo.resetRace();}
      closeModal();showScreen('race');
    };
  });
}

// ---- PRACTICE -------------------------------------------------------------
const SETUP_LABELS = { downforce:'DOWNFORCE', suspension:'RIGIDEZ SUSPENSIÓN', gearRatio:'RELACIÓN DE CAMBIOS', brakeBias:'REPARTO DE FRENOS', tyrePressure:'PRESIÓN DE NEUMÁTICOS', rideHeight:'ALTURA AL SUELO', differential:'DIFERENCIAL' };
function seededRandom(seed){ let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
function idealSetupForRound(){
  const round = currentRound(Career);
  const rnd = seededRandom(round.round * 977 + Career.season * 131);
  const setup = {};
  Object.keys(SETUP_LABELS).forEach(key => setup[key] = Math.round(20 + rnd()*60));
  return setup;
}
function renderPractice(){
  const setup = Career.practice.setup;
  $('setup-sliders').innerHTML = Object.entries(SETUP_LABELS).map(([key,label]) => `
    <div class="slider-row"><label><span>${label}</span><span id="setup-val-${key}">${setup[key]}</span></label>
    <input type="range" min="0" max="100" value="${setup[key]}" data-setup="${key}"></div>`).join('');
  document.querySelectorAll('[data-setup]').forEach(input => input.oninput = () => {
    setup[input.dataset.setup] = Number(input.value);
    $('setup-val-' + input.dataset.setup).textContent = input.value;
  });
  $('practice-score').textContent = Math.round(Career.practice.score);
  $('practice-confidence').textContent = Math.round(Career.practice.confidence) + '%';
  $('practice-laptime').textContent = Career.practice.lastLapText || '—';
  $('run-practice-btn').onclick = runPracticeSimulation;
}
function runPracticeSimulation(){
  const team = playerTeam(Career);
  const driver = activeDriver(Career, team);
  const track = currentTrack(Career);
  const ideal = idealSetupForRound();
  const setup = Career.practice.setup;
  const diffs = {};
  let totalDiff = 0;
  Object.keys(SETUP_LABELS).forEach(key => { const d = Math.abs(setup[key] - ideal[key]); diffs[key] = d; totalDiff += d; });
  const avgDiff = totalDiff / Object.keys(SETUP_LABELS).length;
  const score = clamp(100 - avgDiff*1.4, 5, 100);
  Career.practice.score = score;
  const round = currentRound(Career);
  if (Career.practice.lastRoundPracticed === round.round) {
    // Practicing again with a similar setup builds confidence; wild swings cost it.
    const delta = Math.abs(score - Career.practice.lastScore);
    Career.practice.confidence = clamp(Career.practice.confidence + (delta < 10 ? 8 : -6), 10, 100);
  } else {
    Career.practice.confidence = clamp(Career.practice.confidence + 4, 10, 100);
  }
  Career.practice.lastRoundPracticed = round.round;
  Career.practice.lastScore = score;
  const rating = computePlayerCarRating(team);
  const baseLap = 78 - (driver.stats[0]*6 + rating.top*6) - score*.06;
  const lapTime = Math.max(58, baseLap + (Math.random()-.5)*1.2);
  Career.practice.lastLapText = Math.floor(lapTime/60) + ':' + (lapTime%60).toFixed(3).padStart(6,'0');
  const worst = Object.entries(diffs).sort((a,b)=>b[1]-a[1])[0][0];
  const feedbackMap = {
    downforce: setup.downforce > ideal.downforce ? 'El coche pierde mucha velocidad punta, sobra carga aerodinámica.' : 'Nos falta apoyo, se mueve demasiado en las curvas rápidas.',
    suspension: setup.suspension > ideal.suspension ? 'El coche pierde estabilidad en frenadas fuertes, la suspensión está muy dura.' : 'Tenemos demasiado subviraje en el segundo sector, falta rigidez.',
    gearRatio: setup.gearRatio > ideal.gearRatio ? 'Necesitamos más velocidad punta, la relación es muy corta.' : 'El motor se queda sin marchas antes de cada recta.',
    brakeBias: 'El reparto de frenos no está equilibrado, se bloquea un eje antes que el otro.',
    tyrePressure: 'Los neumáticos delanteros están trabajando demasiado, hay que ajustar la presión.',
    rideHeight: 'La altura al suelo nos está haciendo perder plano en los pianos.',
    differential: 'El diferencial no transmite bien la potencia a la salida de curva.'
  };
  saveCareer(Career);
  renderPractice();
  $('practice-feedback').innerHTML = `<div class="feedback-line"><em>${driver.short}:</em> "${feedbackMap[worst]}"</div><div class="feedback-line">Setup score: <b>${Math.round(score)}</b> · Confianza acumulada: <b>${Math.round(Career.practice.confidence)}%</b></div>`;
}

// ---- SPONSORS ---------------------------------------------------------
function renderSponsors(){
  const team = playerTeam(Career);
  $('active-sponsors').innerHTML = team.sponsors.map((s,i) => s ? `
    <div class="sponsor-card"><div><h4>${s.name}</h4><small>${money(s.base)} por carrera · ${s.bonus.label} · ${s.roundsLeft} fechas restantes</small></div><button data-drop-sponsor="${i}">TERMINAR CONTRATO</button></div>`
    : `<div class="sponsor-card"><div><h4>Slot ${i+1} vacío</h4><small>Elegí una oferta abajo.</small></div></div>`).join('');
  document.querySelectorAll('[data-drop-sponsor]').forEach(btn => btn.onclick = () => { team.sponsors[Number(btn.dataset.dropSponsor)] = null; saveCareer(Career); renderSponsors(); });
  const activeIds = team.sponsors.filter(Boolean).map(s => s.id);
  const offers = SPONSOR_POOL.filter(s => !activeIds.includes(s.id) && team.reputation >= s.reputationReq);
  $('sponsor-offers').innerHTML = offers.map(s => `
    <div class="sponsor-card"><div><h4>${s.name}</h4><small>${money(s.base)} por carrera · ${s.bonus.label} · ${s.duration} fechas</small></div><button data-accept-sponsor="${s.id}" ${team.sponsors.every(Boolean)?'disabled title="No hay slots libres"':''}>ACEPTAR</button></div>`).join('') ||
    '<p style="font-size:12px;color:#7c8272">Sin nuevas ofertas por ahora. Subí tu reputación ganando carreras.</p>';
  document.querySelectorAll('[data-accept-sponsor]').forEach(btn => btn.onclick = () => {
    const slot = team.sponsors.findIndex(s => !s);
    if (slot === -1) return;
    const def = SPONSOR_POOL.find(s => s.id === btn.dataset.acceptSponsor);
    team.sponsors[slot] = Object.assign({}, def, { roundsLeft: def.duration });
    pushNews('NUEVO PATROCINADOR', `${def.name} se suma al equipo.`);
    saveCareer(Career);
    renderSponsors();
    refreshTopBadge();
  });
}

// ---- REGULATIONS --------------------------------------------------------
const VOTE_PROPOSALS = [
  { id:'points10', title:'PUNTUACIÓN AMPLIADA', detail:'25-18-15-12-10-8-6-4-2-1 en vez del sistema base.', apply:r => r.pointsSystem = [25,18,15,12,10,8,6,4,2,1] },
  { id:'flatpoints', title:'PUNTUACIÓN PLANA', detail:'20-16-13-11-9-7-5-3-2-1, carreras más parejas.', apply:r => r.pointsSystem = [20,16,13,11,9,7,5,3,2,1] },
  { id:'noPit', title:'SIN PARADA OBLIGATORIA', detail:'Elimina la parada obligatoria en boxes.', apply:r => r.mandatoryPit = false },
  { id:'strictComponents', title:'LÍMITE DE COMPONENTES ESTRICTO', detail:'Solo 2 usos de motor antes de penalización.', apply:r => r.componentLimit = 2 }
];
function renderRegulations(){
  const r = Career.regulations;
  $('regulations-summary').innerHTML = `
    <h3>REGLAMENTO VIGENTE — TEMPORADA ${Career.season}</h3>
    <p><b>Puntuación:</b> ${r.pointsSystem.join('-')}<br>
    <b>Parada obligatoria:</b> ${r.mandatoryPit ? 'SÍ' : 'NO'}<br>
    <b>Límite de componentes:</b> ${r.componentLimit} usos antes de penalización de grilla<br>
    <b>Formato de clasificación:</b> Vuelta única</p>`;
  const showVote = !Career.voteResolved;
  $('vote-panel').style.display = showVote ? 'block' : 'none';
  if (showVote){
    $('vote-options').innerHTML = VOTE_PROPOSALS.map(p => `<div class="vote-option" data-vote="${p.id}"><h4>${p.title}</h4><small>${p.detail}</small></div>`).join('');
    let selected = null;
    document.querySelectorAll('[data-vote]').forEach(el => el.onclick = () => {
      document.querySelectorAll('[data-vote]').forEach(o => o.classList.remove('active'));
      el.classList.add('active'); selected = el.dataset.vote;
    });
    $('submit-vote').onclick = () => {
      if (!selected) return;
      resolveSeasonVote(selected);
    };
  }
}
function resolveSeasonVote(playerChoiceId){
  // Every AI team leans toward a preference derived from its profile; majority wins, ties favour the player's pick.
  const tally = {};
  VOTE_PROPOSALS.forEach(p => tally[p.id] = 0);
  tally[playerChoiceId]++;
  Career.teams.slice(1).forEach(team => {
    const pref = VOTE_PROPOSALS[Math.floor(Math.random()*VOTE_PROPOSALS.length)];
    tally[pref.id]++;
  });
  const winnerId = Object.entries(tally).sort((a,b)=>b[1]-a[1])[0][0];
  const winner = VOTE_PROPOSALS.find(p => p.id === winnerId);
  winner.apply(Career.regulations);
  Career.voteResolved = true;
  pushNews('NUEVO REGLAMENTO', `La votación aprobó: ${winner.title}.`);
  saveCareer(Career);
  openModal(`<div class="eyebrow">RESULTADO DE LA VOTACIÓN</div><h2 id="modal-title">${winner.title}</h2><p>${winner.detail}</p><p>Votos: ${Object.entries(tally).map(([id,v])=>VOTE_PROPOSALS.find(p=>p.id===id).title+': '+v).join(' · ')}</p><button class="primary" id="vote-continue">CONTINUAR</button>`);
  $('vote-continue').onclick = () => { closeModal(); startNewSeason(); };
}

// ---- Round / season advance --------------------------------------------
function applySponsorPayouts(finishPos, won, poled, fastestLap){
  const team = playerTeam(Career);
  let total = 0;
  team.sponsors.forEach(s => {
    if (!s) return;
    total += s.base;
    if (s.bonus.type === 'podium' && finishPos <= 3) total += s.bonus.amount;
    if (s.bonus.type === 'win' && won) total += s.bonus.amount;
    if (s.bonus.type === 'pole' && poled) total += s.bonus.amount;
    if (s.bonus.type === 'fastestlap' && fastestLap) total += s.bonus.amount;
    if (s.bonus.type === 'top5' && finishPos <= 5) total += s.bonus.amount;
    s.roundsLeft--;
  });
  team.sponsors = team.sponsors.map(s => (s && s.roundsLeft <= 0) ? null : s);
  earn(team, total);
  return total;
}
function onRaceFinished(orderedCars, poleCarId, fastestLapCarId){
  const round = currentRound(Career);
  const points = Career.regulations.pointsSystem;
  orderedCars.forEach((car, i) => {
    const pts = points[i] || 0;
    const team = car.team;
    const driver = car.driver;
    team.points += pts;
    if (i === 0) team.wins++;
    if (i < 3) team.podiums++;
    if (car.dnf) team.dnfs++;
    Career.championship.driverPoints[driver.id] = (Career.championship.driverPoints[driver.id] || 0) + pts;
    if (car.id === poleCarId) team.poles++;
    if (car.id === fastestLapCarId) team.fastestLaps++;
  });
  const team = playerTeam(Career);
  const playerCar = orderedCars.find(c => c.team.isPlayer);
  const finishPos = playerCar ? orderedCars.indexOf(playerCar) + 1 : orderedCars.length;
  const won = finishPos === 1, poled = playerCar && playerCar.id === poleCarId, fl = playerCar && playerCar.id === fastestLapCarId;
  const sponsorIncome = applySponsorPayouts(finishPos, won, poled, fl);
  const prize = Math.max(0, 60000 - (finishPos-1)*5000);
  earn(team, prize);
  team.reputation = clamp(team.reputation + (won ? 6 : finishPos <= 3 ? 3 : finishPos <=6 ? 1 : -1), 0, 100);
  team.componentUsage.engine++;
  team.gridPenaltyNext = team.componentUsage.engine >= Career.regulations.componentLimit ? 1 : 0;
  if (team.gridPenaltyNext) team.componentUsage.engine = 0;
  Career.teams.filter(t=>!t.isPlayer).forEach(t => { t.development += .3 + Math.random()*.4; t.credits += Math.round(40000 - finishPos*500 + Math.random()*30000); });
  round.completed = true;
  round.result = 'P' + finishPos;
  Career.championship.history.push({ round: round.round, order: orderedCars.map(c => ({driverId:c.driver.id, teamId:c.team.id, dnf:!!c.dnf})) });
  pushNews(won ? 'VICTORIA' : 'RESULTADO DE CARRERA', `${team.name} termina ${finishPos}º en ${currentTrack(Career).name}. Ingreso: ${money(sponsorIncome+prize)}.`);
  refreshMarketDynamics();
  Career.qualifyingDoneRound = -1;
  saveCareer(Career);
  return { finishPos, sponsorIncome, prize, penalty: !!team.gridPenaltyNext };
}
// ---- Entrenamiento de pilotos ---------------------------------------------
const DRV_STAT_LABELS = ['Velocidad punta','Aceleración','Frenada','Paso por curva','Control','Agresividad','Consistencia','Adelantamiento'];
const TRAIN_INTENSITY = { low:{ label:'Suave', rate:.6, cost:0 }, normal:{ label:'Normal', rate:1, cost:8000 }, high:{ label:'Intensa', rate:1.5, cost:20000 } };
function recalcDriver(d){
  d.rating = Math.round(d.stats.reduce((a,b)=>a+b,0)/8*100);
  d.salary = Math.round((2000 + d.rating*350) / 100) * 100;
  d.marketValue = Math.round((d.rating*d.rating*30) / 1000) * 1000;
}
function recommendedFocus(d){ let bi = 0; d.stats.forEach((v,i) => { if (v < d.stats[bi]) bi = i; }); return bi; }
// Cada ronda, los pilotos del usuario acumulan puntos de entrenamiento en su área de enfoque; cada 2.5 puntos sube 1 punto de esa estadística.
function trainDrivers(){
  const team = playerTeam(Career), mode = TRAIN_INTENSITY[Career.trainIntensity || 'normal'], notes = [];
  if (mode.cost && canAfford(team, mode.cost)) spend(team, mode.cost); else if (mode.cost) return;
  teamDrivers(Career, team).forEach(d => {
    const ageF = d.age <= 23 ? 1.3 : d.age <= 28 ? 1 : d.age <= 33 ? .7 : .4, f = (d.focus == null ? recommendedFocus(d) : d.focus);
    d.tp = (d.tp || 0) + mode.rate * ageF;
    while (d.tp >= 2.5){ d.tp -= 2.5; if (d.stats[f] < .99){ d.stats[f] = Math.min(.99, d.stats[f] + .01); notes.push(d.name + ': ' + DRV_STAT_LABELS[f] + ' +1'); } }
    recalcDriver(d);
  });
  if (notes.length) pushNews('ENTRENAMIENTO', notes.slice(0,3).join(' · '));
}
// ---- Ofertas de la IA por tus pilotos ------------------------------------
// Una escudería rival propone un intercambio 1x1 (su piloto + un extra en créditos) por uno de los tuyos.
function maybeDriverOffer(){
  const me = playerTeam(Career); if (me.driverIds.length < 2 || Math.random() > .22) return;
  const mine = Career.driversPool.find(d => d.id === me.driverIds[Math.floor(Math.random()*me.driverIds.length)]);
  const teams = Career.teams.filter(t => !t.isPlayer && t.driverIds.length); if (!mine || !teams.length) return;
  const other = teams[Math.floor(Math.random()*teams.length)];
  const theirs = Career.driversPool.filter(d => other.driverIds.includes(d.id)).sort((a,b) => Math.abs(a.rating - mine.rating) - Math.abs(b.rating - mine.rating))[0];
  if (!theirs || theirs.rating > mine.rating + 3 || theirs.rating < mine.rating - 8) return;
  const extra = Math.round(mine.marketValue * .15 * (1 + (mine.rating - theirs.rating) / 20));
  pushNews('OFERTA POR TU PILOTO', other.name + ' ofrece a ' + theirs.name + ' y ' + extra.toLocaleString('es') + ' créditos por ' + mine.name + '.');
  openModal('<div class="eyebrow">OFERTA DE TRASPASO</div><h2 id="modal-title">' + other.name.toUpperCase() + ' QUIERE A ' + mine.name.toUpperCase() + '</h2>' +
    '<p>Ofrecen a <b>' + theirs.name + '</b> (valoración ' + theirs.rating + ') más <b>' + extra.toLocaleString('es') + '</b> créditos por <b>' + mine.name + '</b> (valoración ' + mine.rating + ').</p>' +
    '<div style="display:flex;gap:10px;margin-top:14px"><button class="btn primary" id="offer-yes">ACEPTAR</button><button class="btn" id="offer-no">RECHAZAR</button></div>');
  $('offer-yes').onclick = () => {
    me.driverIds = me.driverIds.filter(id => id !== mine.id).concat(theirs.id); other.driverIds = other.driverIds.filter(id => id !== theirs.id).concat(mine.id);
    mine.teamId = other.id; theirs.teamId = me.id; mine.contractRounds = theirs.contractRounds = 6;
    if (me.activeDriverId === mine.id) me.activeDriverId = theirs.id;
    earn(me, extra); pushNews('TRASPASO', mine.name + ' se va a ' + other.name + ' y llega ' + theirs.name + '.');
    saveCareer(Career); closeModal(); refreshAll();
  };
  $('offer-no').onclick = () => { closeModal(); };
}
function advanceToNextRound(){
  if (Career.roundIndex + 1 >= Career.calendar.length) { endSeason(); return; }
  playerTeam(Career).credits -= teamDrivers(Career, playerTeam(Career)).reduce((sum,d)=>sum+d.salary,0);
  Career.roundIndex++;
  Career.practice.confidence = clamp(Career.practice.confidence - 15, 10, 100);
  trainDrivers();
  saveCareer(Career);
  refreshAll();
  showScreen('home');
  maybeDriverOffer();
}
// ---- Historial de temporadas / evolución de pilotos ----------------------
const ROOKIE_FIRST = ['Tomás','Agustín','Bruno','Emilio','Joaquín','Facundo','Ivo','Santino','Bautista','Lautaro','Thiago','Renzo','Dante','Felipe','Ramiro','Ciro'];
const ROOKIE_LAST = ['Acosta','Benítez','Cabrera','Duarte','Escobar','Fontana','Godoy','Herrera','Ibarra','Juárez','Lombardi','Medina','Navarro','Olivera','Peralta','Quiroga','Rinaldi','Sosa'];
function recordSeasonHistory(){
  Career.seasonHistory = Career.seasonHistory || [];
  if (Career.seasonHistory.some(h => h.season === Career.season)) return;
  const dp = Career.championship.driverPoints;
  const champD = Career.driversPool.filter(d => d.teamId !== null).sort((a,b)=>(dp[b.id]||0)-(dp[a.id]||0))[0];
  const teams = [...Career.teams].sort((a,b)=>b.points-a.points);
  const me = teams.findIndex(t => t.isPlayer) + 1;
  Career.seasonHistory.push({ season: Career.season, driver: champD ? { name: champD.name, team: Career.teams[champD.teamId].name, pts: dp[champD.id]||0 } : null,
    team: { name: teams[0].name, pts: teams[0].points }, me: { pos: me, pts: teams.find(t => t.isPlayer).points, wins: teams.find(t => t.isPlayer).wins } });
}
function developDrivers(){
  const used = new Set(Career.driversPool.map(d => d.name)), rnd = a => a[Math.floor(Math.random()*a.length)];
  Career.driversPool.forEach(d => {
    d.age = (d.age||26) + 1;
    const trend = d.age <= 23 ? .014 : d.age <= 28 ? .003 : d.age <= 33 ? -.005 : -.013;
    d.stats = d.stats.map(v => Math.max(.5, Math.min(.99, v + trend + (Math.random()-.5)*.02)));
    const retire = d.age >= 39 || (d.age >= 35 && Math.random() < (d.age - 34) * .18);
    if (retire){
      let name; do { name = rnd(ROOKIE_FIRST) + ' ' + rnd(ROOKIE_LAST); } while (used.has(name));
      used.add(name);
      const old = d.name, oldTeam = d.teamId;
      d.name = name; d.short = name.split(' ')[1].toUpperCase(); d.age = 18 + Math.floor(Math.random()*3);
      d.stats = d.stats.map(() => .55 + Math.random()*.22); d.personality = rnd(['CONSISTENT','RISK TAKER','AGGRESSIVE','QUALIFYING SPECIALIST']);
      d.contractRounds = 6;
      if (oldTeam !== null && (oldTeam === 0 || Math.random() < .35)) pushNews('RETIRO', old + ' cuelga el casco. ' + name + ' (' + d.age + ') asume su butaca' + (oldTeam === 0 ? ' en tu equipo.' : '.'));
    }
    d.rating = Math.round(d.stats.reduce((a,b)=>a+b,0)/8*100);
    d.salary = Math.round((2000 + d.rating*350) / 100) * 100;
    d.marketValue = Math.round((d.rating*d.rating*30) / 1000) * 1000;
  });
}
function endSeason(){
  recordSeasonHistory();
  pushNews('FIN DE TEMPORADA', `Temporada ${Career.season} completa. Es hora de votar el reglamento.`);
  Career.voteResolved = false;
  saveCareer(Career);
  showScreen('regulations');
  refreshAll();
}
function startNewSeason(){
  recordSeasonHistory();
  developDrivers();
  Career.season++;
  Career.roundIndex = 0;
  Career.calendar = Array.from({length:TRACKS.length}, (_,i) => ({ round:i+1, trackId: TRACKS[(i + Career.season) % TRACKS.length].id, completed:false, result:null, gridPenalty:false }));
  Career.teams.forEach(t => { t.points = 0; t.wins = 0; t.podiums = 0; t.poles = 0; t.fastestLaps = 0; t.dnfs = 0; });
  Career.championship.driverPoints = {};
  pushNews('NUEVA TEMPORADA', `Arranca la temporada ${Career.season} de la Serie Nacional GT3.`);
  saveCareer(Career);
  refreshAll();
  showScreen('home');
}

// ---- New game / reset ---------------------------------------------------
function startNewGame(){
  resetSave();
  Career = newCareer();
  window.Career = Career;
  refreshAll();
  showScreen('home');
}
window.GameUI = { showScreen, refreshAll, onRaceFinished, advanceToNextRound, openModal, closeModal, money, idealSetupForRound, startNewGame, pushNews };

refreshAll();
