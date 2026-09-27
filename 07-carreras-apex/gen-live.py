"""Genera la transmisión online de carreras: live/*.js (copias parcheadas de los scripts del juego) y lro-live.html.
El motor lleva el MISMO reemplazo de azar/matemática que el del servidor (server/tools/build-race.mjs). Ejecutar tras tocar el juego:
    python -X utf8 gen-live.py
"""
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'live'); os.makedirs(OUT, exist_ok=True)
rd = lambda *p: open(os.path.join(HERE, *p), encoding='utf8').read()
DM_RE = re.compile(r'\bMath\.(hypot|sin|cos|atan2|atan|exp|log|pow|tan|asin|acos)\b')
mathdm = lambda s: DM_RE.sub(r'DM.\1', s)


def wr(name, s):
    open(os.path.join(OUT, name), 'w', encoding='utf8').write(s)


def rep(s, old, new, n=1):
    assert s.count(old) == n, ('no encontrado o repetido: ' + old[:70], s.count(old))
    return s.replace(old, new)


# Math determinista (mismo DM que el servidor)
dm = rd('..', 'assets', 'common', 'dmath.mjs').replace('export const DM = {};', 'const DM = {};') + '\nwindow.DM = DM;\n'
wr('dmath.js', dm)

# datos, circuitos y arte: solo Math determinista (+ guardado propio para no pisar la carrera local)
g = mathdm(rd('game-data.js')); g = rep(g, "const SAVE_KEY = 'apexGT3ManagerSave'", "const SAVE_KEY = 'apexGT3ManagerLive'"); wr('game-data.js', g)
wr('circuits.js', mathdm(rd('circuits.js')))
wr('motorsport-art.js', mathdm(rd('motorsport-art.js')))
# la carrera viene del servidor
ui = rd('game-ui.js'); ui = rep(ui, 'let Career = loadCareer() || newCareer();', 'let Career = window.LRO_LIVE_CAREER;')
assert ui.rstrip().endswith('refreshAll();')
ui = ui.rstrip()[:-len('refreshAll();')] + '\n'  # el inicio local pinta el Home del jugador; en vivo se va directo a la carrera
wr('game-ui.js', ui)
# el estudio de mitad de carrera no pausa el motor (la pausa la maneja el conductor con el reloj del servidor)
bc = rd('broadcast-lro.js')
bc = rep(bc, "const was = state.paused; state.paused = true;", "const was = state.paused;")
bc = rep(bc, "onDone: () => { state.paused = was; }, lines: [", "onDone: () => {}, lines: [")
wr('broadcast-lro.js', bc)

# motor: igual que el del servidor + conductor en vivo
e = rd('engine.js')
iEmit, iPart, iFrame = e.index('function emit(car,type,count=5)'), e.index('function updateParticles(dt)'), e.index('function frame(now) {')
rnd = lambda s: s.replace('Math.random()', 'SRAND()')
frame_and_tail = e[iFrame:]
e = rnd(e[:iEmit]) + e[iEmit:iPart] + rnd(e[iPart:iFrame])
e = rep(e, 'state.redFlagRealEndsAt=performance.now()+7000', 'state.redFlagRealEndsAt=SIMT+7000')
e = rep(e, 'window.LROstudio.half()', '(HALFHIT=true,window.LROstudio.half())')
e = mathdm(e)
# mando de carrera: el equipo del humano, y las órdenes viajan por el servidor
e = rep(e, "const playerCar=state.cars.find(c=>c.team.isPlayer);\n  $('command-car-toggle')", "const playerCar=state.cars.find(c=>window.LRO_LIVE?c.team.id===window.LRO_LIVE.teamId:c.team.isPlayer);\n  $('command-car-toggle')")
e = rep(e, "btn.onclick=()=>{\n        if(cmd==='pit'&&btn.dataset.val==='now')", "btn.onclick=()=>{\n        if(window.LRO_LIVE){window.LRO_LIVE.cmd(cmd,btn.dataset.val);return;}\n        if(cmd==='pit'&&btn.dataset.val==='now')")
e = rep(e, "$('round-continue').onclick=()=>{GameUI.closeModal();GameUI.advanceToNextRound();};", "$('round-continue').onclick=()=>{GameUI.closeModal();};")
# cuadro: el motor lo avanza el conductor (pump), no la velocidad ni el reloj local
f = frame_and_tail
f = re.sub(r"  if\(state\.redFlag&&performance\.now\(\)>state\.redFlagRealEndsAt\)\{[^\n]*\n", '', f, count=1)
f = rep(f, "while(accumulator>=CONFIG.fixedStep){updateRace(CONFIG.fixedStep);updateParticles(CONFIG.fixedStep);accumulator-=CONFIG.fixedStep;}", "if(window.LRO_LIVE)window.LRO_LIVE.pump();")
f = rep(f, "const simulationDt=state.paused?0:realDt*state.speed;", "const simulationDt=realDt;")
tail = """
function qualify(){ // igual que en el servidor: la grilla sale de la semilla
  const grid=buildGrid();
  const timed=grid.map(entry=>({entry,pace:qualiPace(entry.driver,entry.team)})).sort((a,b)=>a.pace-b.pace);
  state.grid=timed.map(t=>t.entry); state.poleTeamId=state.grid[0].team.id; Career.qualifyingDoneRound=currentRound(Career).round; resetRace();
}
function stepSim(){
  SIMT+=1000/60;
  if(state.redFlag&&SIMT>state.redFlagRealEndsAt){state.redFlag=false;state.paused=false;addEvent('SE REANUDA LA CARRERA','Vuelve la acción en pista.',null,60);}
  if(!state.paused){updateRace(CONFIG.fixedStep);updateParticles(CONFIG.fixedStep);}
}
function beginRace(){ // igual que el servidor + la parte visual de startRace()
  if(state.phase!=='grid')return;
  state.phase='countdown';state.countdown=0;$('intro').style.display='none';$('start-lights').style.display='flex';
  addEvent('MOTORES ENCENDIDOS',CURRENT_TRACK.name+' espera la largada.',null,0);
  $('commands-panel').style.display='block';renderCommandPanel();
}
window.LROE={ state, CONFIG, qualify, stepSim, beginRace, get track(){return CURRENT_TRACK;}, takeHalf(){const h=HALFHIT;HALFHIT=false;return h;}, seedRng(s){RS=s>>>0;}, setSimT(v){SIMT=v;},
  vars(){return {RS,SIMT,wk:CURRENT_WEATHER_KEY,wg:CURRENT_WEATHER_GRIP};}, setVars(o){RS=o.RS;SIMT=o.SIMT;CURRENT_WEATHER_KEY=o.wk;CURRENT_WEATHER_GRIP=o.wg;} };
"""
pre = """let SIMT = 0, RS = 1, HALFHIT = false;
const SRAND = () => { let t = (RS += 0x6D2B79F5) >>> 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
"""
wr('engine.js', pre + e + f + tail)

# conductor: motor de snapshot + lockstep (sin módulos) + cliente
fb = rd('..', '01-futbol', 'online', 'lockstep.mjs')
snap = fb[fb.index('const NOT_DATA'):fb.index('export class Lockstep')].replace('export function snapOf', 'function snapAny').replace('export function applySnap', 'function applyAny')
ls = rd('online', 'lockstep.mjs')
ls = '\n'.join(l for l in ls.split('\n') if not l.startswith('import '))
ls = ls.replace('export ', '')
cl = rd('online', 'live-client.js')
wr('live-main.js', '(function(){ /* lockstep */\n' + snap + '\n' + ls + '\nwindow.Lockstep = Lockstep; window.applySnap = applySnap;\n})();\n' + cl)

h = rd('index.html')
h = h.replace('<script src="../touchline-bridge.js"></script>', '')
i0 = h.index('<script src="vendor/three.min.js"></script>')
i1 = h.index('</body>')
h = h[:i0] + '<script src="online/live-boot.js"></script>\n' + h[i1:]
css = ('<style>.topbar,.bottom-nav,.masthead,.transport,#commands-panel .toggle-driver,.lower-grid .panel:first-child,footer,#quali-button,#strategy-button,#start-button,#restart-button,#speed-controls,[data-speed],.speed-control,'
       '.bc-intro button,.bc-studio button,.lfo-ad .ad-skip,.bc-skip{display:none!important}.bc-intro,.bc-studio{pointer-events:none!important}'
       '#live-status{position:fixed;left:50%;transform:translateX(-50%);bottom:10px;background:#0b1118e6;color:#e8eef5;padding:5px 14px;border-radius:14px;font:600 12px system-ui;z-index:2147483000;display:none}</style>')
h = h.replace('</head>', '<script>window.EM_ONLINE=true</script>' + css + '</head>', 1)
h = h.replace('<section class="screen active" id="screen-home">', '<section class="screen" id="screen-home">')
open(os.path.join(HERE, 'lro-live.html'), 'w', encoding='utf8').write(h)
print('ok')
