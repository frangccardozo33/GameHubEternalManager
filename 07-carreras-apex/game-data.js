'use strict';
// ==========================================================================
// APEX GT3 MANAGER — data model, economy, championship, save system.
// Pure data + logic; no DOM, no THREE. Consumed by game-ui.js and engine.js.
// ==========================================================================
const clamp01 = (v,min=0,max=1) => Math.max(min,Math.min(max,v));
// Shared by game-ui.js and engine.js (classic scripts share one global scope).
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;
const mod = (n, m) => ((n % m) + m) % m;
const $ = id => document.getElementById(id);

const RARITY_INFO = {
  COMMON:{color:'#9aa08d',mult:1,dupToLevel:2,maxLevel:5},
  UNCOMMON:{color:'#5f9bd6',mult:1.15,dupToLevel:3,maxLevel:7},
  RARE:{color:'#a86bd1',mult:1.35,dupToLevel:4,maxLevel:9},
  EPIC:{color:'#d7a23a',mult:1.6,dupToLevel:5,maxLevel:11},
  LEGENDARY:{color:'#e0562f',mult:2,dupToLevel:6,maxLevel:13}
};
const RARITY_ORDER = ['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY'];
const PART_TYPES = ['engine','gearbox','aero','suspension','brakes','electronics','cooling','tyres'];
const PART_LABELS = {engine:'ENGINE',gearbox:'GEARBOX',aero:'AERO',suspension:'SUSPENSION',brakes:'BRAKES',electronics:'ELECTRONICS',cooling:'COOLING',tyres:'TYRES'};
// Weighted contribution of each part type to the five car-facing performance axes.
const PART_AXES = {
  engine:{top:.55,accel:.35,control:.05,corner:0,brake:0},
  gearbox:{accel:.5,top:.15,control:.1,corner:0,brake:0},
  aero:{corner:.5,control:.25,top:-.1,accel:0,brake:0},
  suspension:{corner:.35,control:.4,brake:.05,top:0,accel:0},
  brakes:{brake:.55,control:.1,top:0,accel:0,corner:0},
  electronics:{control:.45,accel:.1,top:0,brake:0,corner:0},
  cooling:{top:.08,control:.08,accel:.05,brake:0,corner:0},
  tyres:{corner:.2,brake:.15,top:0,accel:0,control:0}
};
const AXIS_LABELS = { top:'Top speed', accel:'Aceleración', brake:'Frenada', corner:'Curva', control:'Control' };
const BODIES = {
  classic:{name:'Camaro ZL1 TC',edition:'V8 AMERICANO · TURISMO CARRETERA',axes:{top:.05,accel:.05,brake:.05,corner:.05,control:.1},desc:'Frente ancho, capó musculoso y techo de coupé. Potencia equilibrada.'},
  touring:{name:'Alfa Romeo Giulia',edition:'BERLINA · TURISMO',axes:{brake:.1,control:.12,corner:.05},desc:'Silueta de cuatro puertas, escudo triangular y precisión de frenada.'},
  sprint:{name:'Mustang GT3',edition:'V8 · GT3',axes:{top:.22,accel:.2,corner:-.06},desc:'Fastback, capó largo y tres luces traseras por lado. Explosivo en recta.'},
  endurance:{name:'BMW M4 GT3',edition:'SEIS CILINDROS · GT3',axes:{control:.1,corner:.04,top:-.05},desc:'Doble riñón vertical, techo alto y pasos ensanchados. Consistencia.'},
  aero:{name:'Mercedes-AMG GT3',edition:'V8 · GT3',axes:{corner:.26,top:-.15},desc:'Capó extralargo, cabina retrasada y parrilla de lamas verticales.'},
  track:{name:'Audi R8 LMS',edition:'V10 CENTRAL · GT3',axes:{corner:.16,brake:.1,top:-.06},desc:'Cabina adelantada, sideblades y parrilla hexagonal. Especialista técnico.'},
  spectre:{name:'Ferrari 296 GT3',edition:'V6 CENTRAL · GT3',color:'#ed3049',axes:{top:.19,accel:.12,corner:.06,brake:-.08},desc:'Morro bajo, tomas laterales profundas y contrafuertes traseros.'},
  raijin:{name:'Nissan GT-R GT3',edition:'V6 BITURBO · GT3',color:'#29b9e5',axes:{accel:.19,control:.13,top:-.06,corner:.03},desc:'Coupé de techo alto, hombros cuadrados y cuatro pilotos circulares.'},
  mistral:{name:'Aston Martin Vantage',edition:'V8 · GT3',color:'#f9bc40',axes:{top:.16,control:.15,accel:-.07,brake:.04},desc:'Gran parrilla baja, capó curvado y cola compacta. Gran turismo.'},
  valkyr:{name:'Porsche 911 GT3 R',edition:'BÓXER TRASERO · GT3',color:'#a1e648',axes:{corner:.17,brake:.14,top:-.08,control:.04},desc:'Faros redondos, techo arqueado continuo y alerón de cuello de cisne.'},
  corsair:{name:'Corvette Z06 GT3.R',edition:'V8 CENTRAL · GT3',color:'#a78bfa',axes:{accel:.20,top:.15,corner:-.08,control:-.03},desc:'Morro en cuña, cabina adelantada y grandes entradas laterales.'}
};
const PACKS = {
  bronze:{name:'BRONZE PACK',icon:'📦',cost:5000,cards:3,odds:{COMMON:.65,UNCOMMON:.25,RARE:.08,EPIC:.02,LEGENDARY:0}},
  silver:{name:'SILVER PACK',icon:'🎁',cost:15000,cards:3,odds:{COMMON:.4,UNCOMMON:.35,RARE:.18,EPIC:.06,LEGENDARY:.01}},
  gold:{name:'GOLD PACK',icon:'🏆',cost:35000,cards:4,odds:{COMMON:.15,UNCOMMON:.35,RARE:.32,EPIC:.15,LEGENDARY:.03}},
  legend:{name:'LEGEND PACK',icon:'👑',cost:80000,cards:5,odds:{COMMON:0,UNCOMMON:.15,RARE:.4,EPIC:.35,LEGENDARY:.1}}
};
const TRACKS = [
  {id:'valleverde',name:'VALLE VERDE',country:'San Esteban, Argentina',lengthKm:1.82,corners:12,gripMod:1,brakingMod:1,aeroMod:1,wetChance:.15,tempBase:24,overtakeDiff:.5,desc:'Alta velocidad, equilibrado.'},
  {id:'autodromocentral',name:'AUTÓDROMO CENTRAL',country:'Córdoba, Argentina',lengthKm:1.82,corners:12,gripMod:.95,brakingMod:1.25,aeroMod:.9,wetChance:.2,tempBase:22,overtakeDiff:.4,desc:'Frenadas exigentes.',layout:[[-220,135], [-80,135], [100,135], [250,135], [290,90], [290,20], [240,-20], [240,-90], [200,-130], [120,-130], [90,-80], [20,-80], [-20,-130], [-110,-150], [-200,-130], [-260,-70], [-270,20], [-250,100]]},
  {id:'costasur',name:'COSTA SUR',country:'Punta del Este, Uruguay',lengthKm:1.82,corners:12,gripMod:1.05,brakingMod:.95,aeroMod:1.15,wetChance:.35,tempBase:26,overtakeDiff:.65,desc:'Técnico y cambiante.',layout:[[-220,135], [-80,135], [100,135], [240,110], [300,50], [280,-10], [200,-30], [160,-90], [200,-150], [120,-190], [20,-170], [-50,-110], [-130,-130], [-220,-100], [-290,-30], [-300,60]]},
  {id:'montrealpl',name:'MONTRÉAL PARK',country:'Quebec, Canadá',lengthKm:1.82,corners:12,gripMod:1.1,brakingMod:1.1,aeroMod:.85,wetChance:.3,tempBase:18,overtakeDiff:.35,desc:'Alta velocidad pura.',layout:[[-220,135], [-40,135], [180,135], [380,135], [450,90], [440,20], [360,-30], [240,-40], [130,-10], [20,-40], [-100,-50], [-210,-30], [-290,10], [-300,80]]},
  {id:'sierragp',name:'SIERRA GP',country:'Santiago, Chile',lengthKm:1.82,corners:12,gripMod:.92,brakingMod:1.05,aeroMod:1.05,wetChance:.25,tempBase:20,overtakeDiff:.55,desc:'Desnivel y técnica.',layout:[[-220,135], [-80,135], [100,135], [220,105], [250,40], [190,0], [240,-50], [300,-100], [240,-160], [140,-140], [110,-80], [40,-50], [-40,-90], [-70,-160], [-170,-170], [-240,-110], [-200,-40], [-270,20], [-290,90]]},
  {id:'pampacircuit',name:'PAMPA CIRCUIT',country:'La Pampa, Argentina',lengthKm:1.82,corners:12,gripMod:1,brakingMod:1,aeroMod:1,wetChance:.1,tempBase:28,overtakeDiff:.45,desc:'Rápido y abierto.',layout:[[-220,135], [-40,135], [200,135], [400,120], [470,60], [470,-60], [400,-130], [200,-150], [0,-150], [-200,-150], [-320,-100], [-350,-10], [-330,80]]},
  {id:'litoralring',name:'LITORAL RING',country:'Rosario, Argentina',lengthKm:1.82,corners:12,gripMod:.98,brakingMod:.9,aeroMod:1.1,wetChance:.4,tempBase:23,overtakeDiff:.6,desc:'Húmedo con frecuencia.',layout:[[-220,135], [-80,135], [100,135], [230,120], [290,60], [300,-30], [240,-90], [150,-90], [100,-40], [30,-30], [-30,-80], [-20,-150], [-100,-190], [-200,-160], [-260,-90], [-250,-10], [-290,60]]},
  {id:'nortespeed',name:'NORTE SPEEDWAY',country:'São Paulo, Brasil',lengthKm:1.82,corners:12,gripMod:1.08,brakingMod:1,aeroMod:.9,wetChance:.2,tempBase:30,overtakeDiff:.3,desc:'Velocidad pura.',layout:[[-220,135], [0,135], [220,135], [400,110], [460,40], [460,-40], [400,-110], [220,-135], [0,-135], [-220,-135], [-390,-110], [-450,-40], [-450,40], [-390,110]]},
  {"id": "desiertoring", "name": "DESIERTO RING", "country": "San Juan, Argentina", "lengthKm": 2, "corners": 12, "gripMod": 0.94, "brakingMod": 1.18, "aeroMod": 0.9, "wetChance": 0.04, "tempBase": 34, "overtakeDiff": 0.32, "theme": "desert", "layout": [[-220, 135], [-80, 135], [100, 135], [300, 125], [345, 45], [310, -90], [175, -145], [60, -135], [15, -65], [-75, -70], [-125, -155], [-290, -145], [-340, -40], [-300, 75]], "desc": "Rectas largas y horquillas sobre arena."},
  {"id": "patagoniapark", "name": "PATAGONIA PARK", "country": "Neuquén, Argentina", "lengthKm": 2, "corners": 13, "gripMod": 0.96, "brakingMod": 1.08, "aeroMod": 1.17, "wetChance": 0.18, "tempBase": 14, "overtakeDiff": 0.58, "theme": "mountain", "layout": [[-220, 135], [-80, 135], [100, 135], [245, 100], [280, 5], [230, -65], [140, -20], [60, -65], [85, -170], [-10, -205], [-110, -145], [-145, -45], [-260, -100], [-315, -25], [-290, 80]], "desc": "Curvas enlazadas y aire frío de montaña."},
  {"id": "atlanticospeed", "name": "ATLÁNTICO SPEED", "country": "Mar del Plata, Argentina", "lengthKm": 2, "corners": 10, "gripMod": 1.03, "brakingMod": 0.95, "aeroMod": 0.92, "wetChance": 0.32, "tempBase": 21, "overtakeDiff": 0.28, "theme": "coast", "layout": [[-220, 135], [-80, 135], [100, 135], [300, 130], [380, 65], [355, -35], [240, -95], [65, -115], [-130, -115], [-290, -65], [-340, 30], [-295, 110]], "desc": "Arcos rápidos junto a la costa."},
  {"id": "selvaverde", "name": "SELVA VERDE", "country": "Misiones, Argentina", "lengthKm": 2, "corners": 12, "gripMod": 1.08, "brakingMod": 1.12, "aeroMod": 1.2, "wetChance": 0.52, "tempBase": 29, "overtakeDiff": 0.67, "theme": "forest", "layout": [[-220, 135], [-80, 135], [100, 135], [235, 100], [265, 15], [180, -25], [225, -120], [135, -170], [45, -100], [-40, -155], [-130, -90], [-230, -155], [-310, -65], [-285, 55]], "desc": "Técnico, húmedo y rodeado de selva."},
  {"id": "puertourbano", "name": "PUERTO URBANO", "country": "Montevideo, Uruguay", "lengthKm": 2, "corners": 12, "gripMod": 0.93, "brakingMod": 1.28, "aeroMod": 0.94, "wetChance": 0.3, "tempBase": 23, "overtakeDiff": 0.72, "theme": "city", "layout": [[-220, 135], [-80, 135], [100, 135], [250, 130], [280, 75], [280, -75], [230, -120], [120, -120], [85, -65], [-15, -65], [-40, -165], [-235, -165], [-285, -105], [-285, 55]], "desc": "Calles estrechas y frenadas de noventa grados."},
  {"id": "lagunaazul", "name": "LAGUNA AZUL", "country": "Bariloche, Argentina", "lengthKm": 2, "corners": 13, "gripMod": 1.04, "brakingMod": 1.1, "aeroMod": 1.1, "wetChance": 0.38, "tempBase": 16, "overtakeDiff": 0.52, "theme": "coast", "layout": [[-220, 135], [-80, 135], [100, 135], [265, 85], [290, -15], [235, -140], [125, -180], [30, -120], [-15, -25], [-100, 15], [-165, -40], [-220, -150], [-300, -135], [-340, -35], [-285, 70]], "desc": "Una gran curva bordeando el lago."},
  {"id": "andesendurance", "name": "ANDES ENDURANCE", "country": "Mendoza, Argentina", "lengthKm": 2, "corners": 14, "gripMod": 0.95, "brakingMod": 1.2, "aeroMod": 1.05, "wetChance": 0.12, "tempBase": 19, "overtakeDiff": 0.43, "theme": "mountain", "layout": [[-220, 135], [-80, 135], [100, 135], [320, 135], [415, 70], [425, -60], [340, -145], [215, -160], [160, -80], [80, -40], [0, -115], [-100, -210], [-275, -210], [-375, -120], [-390, 5], [-310, 100]], "desc": "El trazado más largo; exige resistencia y frenos."},
  {"id": "pampavelocity", "name": "PAMPA VELOCITY", "country": "Santa Rosa, Argentina", "lengthKm": 2, "corners": 11, "gripMod": 1.02, "brakingMod": 0.92, "aeroMod": 0.86, "wetChance": 0.09, "tempBase": 31, "overtakeDiff": 0.25, "theme": "grass", "layout": [[-220, 135], [-80, 135], [100, 135], [360, 125], [420, 30], [380, -75], [215, -115], [70, -95], [-55, -155], [-255, -145], [-350, -75], [-360, 35], [-300, 110]], "desc": "Acelerador a fondo y amplias zonas de adelantamiento."},
  {"id": "santacruz", "name": "SANTA CRUZ GP", "country": "Santa Cruz, Bolivia", "lengthKm": 2, "corners": 15, "gripMod": 1.1, "brakingMod": 1.16, "aeroMod": 1.19, "wetChance": 0.44, "tempBase": 28, "overtakeDiff": 0.6, "theme": "forest", "layout": [[-220, 135], [-80, 135], [100, 135], [245, 110], [270, 25], [185, -45], [80, -20], [30, -90], [100, -155], [25, -225], [-85, -200], [-120, -90], [-215, -30], [-275, -115], [-340, -65], [-330, 35], [-280, 100]], "desc": "Doble sector técnico y curvas de radio cambiante."},
  {"id": "nocturnaring", "name": "NOCTURNA RING", "country": "Buenos Aires, Argentina", "lengthKm": 2, "corners": 13, "gripMod": 1.01, "brakingMod": 1.16, "aeroMod": 1.08, "wetChance": 0.22, "tempBase": 20, "overtakeDiff": 0.48, "theme": "night", "layout": [[-220, 135], [-80, 135], [100, 135], [265, 120], [330, 55], [305, -35], [210, -75], [135, -165], [25, -185], [-25, -100], [-120, -70], [-185, -155], [-290, -115], [-335, -25], [-290, 80]], "desc": "Luces de ciudad y una chicana decisiva."},
  {"id": "calderaring", "name": "CALDERA RING", "country": "Isla Caldera, Tamago", "lengthKm": 2, "corners": 15, "gripMod": 0.97, "brakingMod": 1.14, "aeroMod": 1.02, "wetChance": 0.2, "tempBase": 27, "overtakeDiff": 0.62, "theme": "mountain", "layout": [[-220,135], [-80,135], [100,135], [260,120], [330,50], [300,-40], [200,-70], [130,-140], [40,-190], [-60,-150], [-90,-70], [-170,-30], [-260,-70], [-330,10], [-300,100]]},
  {"id": "centenario", "name": "AUTÓDROMO DEL CENTENARIO", "country": "Buenaventura, Peronia", "lengthKm": 2, "corners": 14, "gripMod": 1.03, "brakingMod": 1.05, "aeroMod": 1.0, "wetChance": 0.18, "tempBase": 22, "overtakeDiff": 0.5, "theme": "grass", "layout": [[-220,135], [-80,135], [100,135], [280,140], [390,100], [430,20], [400,-60], [310,-100], [220,-70], [160,-110], [100,-170], [0,-180], [-90,-140], [-130,-70], [-210,-90], [-290,-80], [-340,-10], [-320,80]]}

];
// Layout IDs remain stable so existing careers and installed bodywork survive updates.
const DEFAULT_LAYOUT = [[-220, 135], [-80, 135], [100, 135], [245, 120], [290, 35], [250, -65], [135, -103], [88, -25], [18, -18], [-9, -119], [-106, -150], [-230, -109], [-290, -15], [-270, 95]];
function layoutForTrack(def){ return def.layout || DEFAULT_LAYOUT; }
function migrateCareer(career){
  if ((career.version || 2) < 3) {
    const existing = new Set(career.calendar.map(r => r.trackId));
    TRACKS.slice(8).forEach(t => {
      if (!existing.has(t.id)) career.calendar.push({round:career.calendar.length+1,trackId:t.id,completed:false,result:null,gridPenalty:false});
    });
    career.teams.forEach((team,i) => {
      if (!team.isPlayer) team.bodyType = Object.keys(BODIES)[i % Object.keys(BODIES).length];
    });
    career.version = 3;
  }
  if ((career.version || 2) < 4) {
    // temporada de 20 fechas: se suman los circuitos que faltan al calendario de las carreras guardadas
    const existing = new Set(career.calendar.map(r => r.trackId));
    TRACKS.forEach(t => {
      if (!existing.has(t.id)) career.calendar.push({round:career.calendar.length+1,trackId:t.id,completed:false,result:null,gridPenalty:false});
    });
    career.calendar.forEach((r,i) => { r.round = i + 1; });
    // nacionalidades: códigos reales -> naciones del mundo ficticio
    const NAT = {ARG:null, BOL:'SOT', BRA:'TAM', CHI:'CUN', PAR:'MOR', URU:'VAL', VEN:'MAG'};
    (career.driversPool || []).forEach(d => { if (d.nationality in NAT) d.nationality = NAT[d.nationality] || (d.id % 3 ? 'PER' : 'VAL'); });
    career.version = 4;
  }
  return career;
}
const WEATHER_STATES = {
  CLEAR:{grip:1,label:'DESPEJADO',icon:'☀'},
  CLOUDY:{grip:.97,label:'NUBLADO',icon:'☁'},
  LIGHT_RAIN:{grip:.82,label:'LLOVIZNA',icon:'🌦'},
  RAIN:{grip:.68,label:'LLUVIA',icon:'🌧'},
  HEAVY_RAIN:{grip:.52,label:'LLUVIA FUERTE',icon:'⛈'},
  DRYING:{grip:.85,label:'SECANDO',icon:'🌤'}
};
const SPONSOR_POOL = [
  {id:'surmotor',name:'SUR MOTOR OIL',base:100000,bonus:{type:'podium',amount:50000,label:'+$50.000 por podio'},duration:4,reputationReq:0},
  {id:'vertice',name:'VÉRTICE',base:60000,bonus:{type:'championship',amount:150000,label:'+$150.000 si gana el campeonato'},duration:6,reputationReq:15},
  {id:'pampaholdings',name:'PAMPA HOLDINGS',base:250000,bonus:{type:'top5',amount:15000,label:'+$15.000 por top 5'},duration:4,reputationReq:40},
  {id:'costabank',name:'COSTA ATLÁNTICA BANK',base:80000,bonus:{type:'win',amount:100000,label:'+$100.000 por victoria'},duration:5,reputationReq:10},
  {id:'litoraltech',name:'LITORAL TECH',base:120000,bonus:{type:'pole',amount:30000,label:'+$30.000 por pole'},duration:4,reputationReq:20},
  {id:'aguilaneumaticos',name:'ÁGUILA NEUMÁTICOS',base:70000,bonus:{type:'fastestlap',amount:20000,label:'+$20.000 por vuelta rápida'},duration:5,reputationReq:5}
];
const TEAM_PROFILES = ['FACTORY','BALANCED','BUDGET','AGGRESSIVE','DEVELOPMENT','TYRE SPECIALIST'];
const PERSONALITIES = ['AGGRESSIVE','DEFENSIVE','TYRE SAVER','QUALIFYING SPECIALIST','WET SPECIALIST','CONSISTENT','RISK TAKER'];
const DEFAULT_REGULATIONS = { mandatoryPit:true, pointsSystem:[25,18,15,12,10,8,6,4,2,1], componentLimit:3, qualifyingFormat:'ONE_SHOT' };

// ---- Base driver roster (10 veteran cards, one per founding team) ---------
const DRIVERS_BASE = [
  { name:'Mateo Martín', short:'MARTÍN', number:'07', color:0xd96a32, accent:'#f4dbad', nationality:'PER', age:29, personality:'CONSISTENT', stats:[.90,.88,.86,.89,.90,.77,.91,.87] },
  { name:'Gabriel Silva', short:'SILVA', number:'22', color:0x347f92, accent:'#eee6c9', nationality:'TAM', age:31, personality:'QUALIFYING SPECIALIST', stats:[.94,.85,.85,.82,.88,.88,.83,.91] },
  { name:'Nicolás Ferraro', short:'FERRARO', number:'16', color:0xbac89c, accent:'#283a2d', nationality:'PER', age:24, personality:'RISK TAKER', stats:[.86,.88,.91,.95,.92,.72,.89,.85] },
  { name:'Lucas Kowalski', short:'KOWALSKI', number:'83', color:0xd9b752, accent:'#302b26', nationality:'VAL', age:33, personality:'AGGRESSIVE', stats:[.92,.91,.84,.84,.85,.92,.77,.89] },
  { name:'Bruno Rossi', short:'ROSSI', number:'11', color:0xa74438, accent:'#f1e6c8', nationality:'VAL', age:27, personality:'CONSISTENT', stats:[.88,.90,.89,.91,.91,.82,.88,.86] },
  { name:'Tomás Acosta', short:'ACOSTA', number:'32', color:0xe1ded0, accent:'#bd493c', nationality:'PER', age:36, personality:'TYRE SAVER', stats:[.91,.86,.90,.86,.88,.81,.90,.86] },
  { name:'Diego Méndez', short:'MÉNDEZ', number:'54', color:0x343e52, accent:'#dfbf65', nationality:'CUN', age:26, personality:'AGGRESSIVE', stats:[.95,.91,.82,.83,.84,.90,.79,.91] },
  { name:'Santiago Vega', short:'VEGA', number:'99', color:0x589580, accent:'#f1deaf', nationality:'PER', age:22, personality:'WET SPECIALIST', stats:[.86,.88,.93,.93,.94,.74,.94,.83] },
  { name:'Agustín Ríos', short:'RÍOS', number:'41', color:0xb688a1, accent:'#f0ded0', nationality:'MOR', age:30, personality:'DEFENSIVE', stats:[.90,.92,.85,.89,.86,.87,.82,.88] },
  { name:'Valentín Costa', short:'COSTA', number:'65', color:0x73a9b2, accent:'#213c40', nationality:'VAL', age:28, personality:'CONSISTENT', stats:[.92,.90,.90,.90,.89,.85,.86,.92] }
];
// ---- Bench/second driver per team, plus free-agent pool for the market ----
const DRIVERS_EXTRA = [
  { name:'Franco Aguirre', short:'AGUIRRE', number:'71', color:0xd96a32, accent:'#f4dbad', nationality:'PER', age:20, personality:'RISK TAKER', stats:[.80,.82,.78,.80,.75,.83,.68,.79] },
  { name:'Pedro Almeida', short:'ALMEIDA', number:'23', color:0x347f92, accent:'#eee6c9', nationality:'TAM', age:34, personality:'WET SPECIALIST', stats:[.83,.80,.85,.86,.84,.70,.87,.78] },
  { name:'Ezequiel Paz', short:'PAZ', number:'17', color:0xbac89c, accent:'#283a2d', nationality:'PER', age:23, personality:'CONSISTENT', stats:[.81,.83,.82,.84,.83,.66,.85,.76] },
  { name:'Rodrigo Sosa', short:'SOSA', number:'84', color:0xd9b752, accent:'#302b26', nationality:'VAL', age:38, personality:'DEFENSIVE', stats:[.79,.85,.80,.78,.79,.75,.83,.77] },
  { name:'Iván Duarte', short:'DUARTE', number:'12', color:0xa74438, accent:'#f1e6c8', nationality:'VAL', age:25, personality:'AGGRESSIVE', stats:[.84,.84,.83,.85,.82,.86,.75,.82] },
  { name:'Cristian Bou', short:'BOU', number:'33', color:0xe1ded0, accent:'#bd493c', nationality:'PER', age:31, personality:'TYRE SAVER', stats:[.82,.81,.86,.81,.83,.72,.88,.80] },
  { name:'Martín Ovalle', short:'OVALLE', number:'55', color:0x343e52, accent:'#dfbf65', nationality:'CUN', age:21, personality:'QUALIFYING SPECIALIST', stats:[.87,.85,.77,.79,.78,.79,.71,.85] },
  { name:'Facundo Ledesma', short:'LEDESMA', number:'98', color:0x589580, accent:'#f1deaf', nationality:'PER', age:35, personality:'CONSISTENT', stats:[.80,.83,.87,.85,.86,.68,.90,.77] },
  { name:'Joaquín Bracho', short:'BRACHO', number:'42', color:0xb688a1, accent:'#f0ded0', nationality:'MAG', age:27, personality:'RISK TAKER', stats:[.83,.86,.79,.82,.80,.84,.73,.83] },
  { name:'Emiliano Duval', short:'DUVAL', number:'66', color:0x73a9b2, accent:'#213c40', nationality:'VAL', age:24, personality:'AGGRESSIVE', stats:[.85,.84,.81,.83,.81,.85,.76,.84] },
  { name:'Ramiro Achával', short:'ACHÁVAL', number:'19', color:0xc9a24b, accent:'#2c2416', nationality:'PER', age:19, personality:'RISK TAKER', stats:[.78,.79,.75,.81,.74,.80,.65,.78] },
  { name:'Julián Cabrera', short:'CABRERA', number:'88', color:0x5c8e77, accent:'#eee0c4', nationality:'PER', age:32, personality:'DEFENSIVE', stats:[.81,.83,.84,.82,.85,.71,.86,.79] },
  { name:'Federico Nazar', short:'NAZAR', number:'05', color:0x8b5a44, accent:'#f2e5c9', nationality:'SOT', age:29, personality:'CONSISTENT', stats:[.82,.82,.83,.83,.84,.74,.85,.80] },
  { name:'Simón Lattuca', short:'LATTUCA', number:'77', color:0x3f5a6b, accent:'#e8dcc0', nationality:'VAL', age:37, personality:'TYRE SAVER', stats:[.80,.81,.88,.80,.87,.69,.91,.76] },
  { name:'Bautista Guzmán', short:'GUZMÁN', number:'03', color:0x9c4f3a, accent:'#f0e2c6', nationality:'PER', age:22, personality:'WET SPECIALIST', stats:[.84,.85,.86,.87,.85,.75,.89,.81] },
  { name:'Thiago Roldán', short:'ROLDÁN', number:'44', color:0x4f6d4f, accent:'#e5dcc0', nationality:'PER', age:26, personality:'AGGRESSIVE', stats:[.86,.87,.80,.81,.79,.89,.74,.86] }
];
function makeDriverPool(){
  let id = 0;
  const all = DRIVERS_BASE.concat(DRIVERS_EXTRA).map(d => {
    const rating = Math.round(d.stats.reduce((a,b)=>a+b,0)/8*100);
    return Object.assign({}, d, {
      id: id++,
      rating,
      salary: Math.round((2000 + rating*350) / 100) * 100,
      marketValue: Math.round((rating*rating*30) / 1000) * 1000,
      contractRounds: 0,
      teamId: null
    });
  });
  return all;
}
const TEAM_DEFS = [
  {name:'Escudería del Sur',color:0xd96a32,profile:'BALANCED'},
  {name:'Río Plata Competición',color:0x347f92,profile:'FACTORY'},
  {name:'Scuderia Austral',color:0xbac89c,profile:'DEVELOPMENT'},
  {name:'Talleres del Oeste',color:0xd9b752,profile:'BUDGET'},
  {name:'Cóndor Motorsport',color:0xa74438,profile:'AGGRESSIVE'},
  {name:'Pampa Racing',color:0xe1ded0,profile:'TYRE SPECIALIST'},
  {name:'Norte Competición',color:0x343e52,profile:'FACTORY'},
  {name:'Cruz del Sur',color:0x589580,profile:'BALANCED'},
  {name:'Litoral Sport',color:0xb688a1,profile:'BUDGET'},
  {name:'Costa Atlántica',color:0x73a9b2,profile:'AGGRESSIVE'}
];
function freshParts(){
  const parts = {};
  PART_TYPES.forEach(t => parts[t] = {rarity:'COMMON', level:1, dupes:0});
  return parts;
}
function makeTeam(index, def, isPlayer){
  return {
    id: index,
    name: def.name,
    color: def.color,
    profile: def.profile,
    isPlayer: !!isPlayer,
    credits: isPlayer ? 450000 : Math.round(150000 + Math.random()*350000),
    materials: isPlayer ? 150 : 0,
    reputation: isPlayer ? 45 : Math.round(30 + Math.random()*45),
    prestige: isPlayer ? 40 : Math.round(30 + Math.random()*45),
    development: 0,
    points: 0, wins: 0, podiums: 0, poles: 0, fastestLaps: 0, dnfs: 0,
    driverIds: [index, 10 + index],
    activeDriverId: index,
    bodyType: Object.keys(BODIES)[index % Object.keys(BODIES).length],
    parts: isPlayer ? freshParts() : null,
    componentUsage: { engine: 0, gearbox: 0 },
    gridPenaltyNext: 0,
    sponsors: [null, null, null]
  };
}
function newCareer(){
  const driversPool = makeDriverPool();
  const teams = TEAM_DEFS.map((def,i) => makeTeam(i, def, i === 0));
  teams.forEach(team => team.driverIds.forEach(did => { if (driversPool[did]) driversPool[did].teamId = team.id; }));
  const shuffledTracks = [...TRACKS];
  const calendar = Array.from({length:TRACKS.length}, (_,i) => ({ round:i+1, trackId: shuffledTracks[i % shuffledTracks.length].id, completed:false, result:null, gridPenalty:false }));
  return {
    version: 4,
    season: 1,
    roundIndex: 0,
    teams,
    driversPool,
    calendar,
    regulations: JSON.parse(JSON.stringify(DEFAULT_REGULATIONS)),
    championship: { driverPoints:{}, teamPoints:{}, history:[] },
    fragments: {},
    news: [{title:'TEMPORADA 1 EN MARCHA', detail:'La Serie Nacional GT3 arranca con diez escuderías en pista.', round:1}],
    practice: { score:0, confidence:35, setup:defaultSetup(), lastRoundPracticed:-1 },
    strategy: { compound:'M', stops:1, pace:'standard', aggression:'standard', tyreMgmt:'standard', fuel:'standard' },
    qualifyingDoneRound: -1,
    voteResolved: true
  };
}
function defaultSetup(){
  return { downforce:50, suspension:50, gearRatio:50, brakeBias:50, tyrePressure:50, rideHeight:50, differential:50 };
}
// Fechas de calendario: la ronda 1 se corre el domingo 8 de marzo del año de la temporada (temporada 1 = 2026) y hay una carrera cada 14 días.
function raceDate(season, round){ return new Date(Date.UTC(2025 + season, 2, 8 + (Math.max(1, round) - 1) * 14)); }
function fmtRaceDate(season, round){ return raceDate(season, round).toLocaleDateString('es-ES', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); }
function playerTeam(career){ return career.teams[0]; }
function currentRound(career){ return career.calendar[career.roundIndex]; }
function currentTrack(career){ const r = currentRound(career); return TRACKS.find(t => t.id === r.trackId) || TRACKS[0]; }
function activeDriver(career, team){ return career.driversPool.find(d => d.id === team.activeDriverId) || career.driversPool.find(d => d.id === team.driverIds[0]); }
function teamDrivers(career, team){ return team.driverIds.map(id => career.driversPool.find(d => d.id === id)).filter(Boolean); }

function computePlayerCarRating(team){
  const body = BODIES[team.bodyType] || BODIES.classic;
  const axes = { top:.5, accel:.5, brake:.5, corner:.5, control:.5 };
  Object.keys(body.axes).forEach(k => axes[k] += body.axes[k]);
  PART_TYPES.forEach(type => {
    const part = team.parts[type];
    if (!part) return;
    const info = RARITY_INFO[part.rarity];
    const power = (part.level / info.maxLevel) * info.mult * .5;
    const weights = PART_AXES[type];
    Object.keys(weights).forEach(axis => axes[axis] += weights[axis] * power);
  });
  Object.keys(axes).forEach(k => axes[k] = clamp01(axes[k], .25, 1.12));
  return axes;
}
function computeAiCarRating(team){
  const base = .55 + (team.prestige/100)*.3 + team.development*.02;
  const v = clamp01(base, .35, 1.05);
  return { top:v, accel:v, brake:v, corner:v, control:v };
}
function effectiveStats(driver, team, setupBonus){
  const rating = team.isPlayer ? computePlayerCarRating(team) : computeAiCarRating(team);
  const bonus = setupBonus || 0;
  const blend = (dv, cv) => clamp01(dv*.55 + cv*.45, .32, 1.1);
  return {
    top: blend(driver.stats[0], rating.top),
    accel: blend(driver.stats[1], rating.accel),
    brake: blend(driver.stats[2], rating.brake),
    corner: blend(driver.stats[3], rating.corner + bonus*.15),
    control: blend(driver.stats[4], rating.control + bonus*.1),
    aggression: driver.stats[5],
    consistency: clamp01(driver.stats[6] + bonus*.08, 0, 1),
    overtake: driver.stats[7]
  };
}
function partRatingSummary(type, part){
  const info = RARITY_INFO[part.rarity];
  const power = (part.level / info.maxLevel) * info.mult * .5;
  const weights = PART_AXES[type];
  return Object.keys(weights).filter(axis => weights[axis] !== 0).map(axis => ({axis, label: AXIS_LABELS[axis], value: Math.round(weights[axis]*power*100)}));
}

// ---- Economy ---------------------------------------------------------------
function canAfford(team, cost){ return team.credits >= cost; }
function spend(team, cost){ team.credits -= cost; }
function earn(team, amount){ team.credits += Math.round(amount); }

// ---- Packs -------------------------------------------------------------
function rollRarity(odds){
  const r = Math.random();
  let acc = 0;
  for (const rarity of RARITY_ORDER){
    acc += odds[rarity] || 0;
    if (r <= acc) return rarity;
  }
  return 'COMMON';
}
function openPack(career, packId){
  const pack = PACKS[packId];
  const team = playerTeam(career);
  if (!canAfford(team, pack.cost)) return null;
  spend(team, pack.cost);
  const results = [];
  for (let i=0;i<pack.cards;i++){
    const rarity = rollRarity(pack.odds);
    const type = PART_TYPES[Math.floor(Math.random()*PART_TYPES.length)];
    results.push(applyFragment(career, type, rarity));
  }
  return results;
}
function applyFragment(career, type, rarity){
  const team = playerTeam(career);
  const part = team.parts[type];
  const rarityRank = RARITY_ORDER.indexOf(rarity);
  const currentRank = RARITY_ORDER.indexOf(part.rarity);
  let leveledUp = false, rarityUp = false;
  if (rarityRank > currentRank){
    // A higher-rarity drop replaces the part outright at level 1.
    part.rarity = rarity; part.level = 1; part.dupes = 0; rarityUp = true;
  } else {
    part.dupes++;
    const info = RARITY_INFO[part.rarity];
    if (part.dupes >= info.dupToLevel && part.level < info.maxLevel){
      part.dupes -= info.dupToLevel;
      part.level++;
      leveledUp = true;
    }
  }
  return { type, rarity, leveledUp, rarityUp, part };
}
function upgradePart(career, type){
  const team = playerTeam(career);
  const part = team.parts[type];
  const info = RARITY_INFO[part.rarity];
  if (part.level >= info.maxLevel) return false;
  const cost = 3000 + part.level*1500;
  const materialsCost = 5 + part.level*2;
  if (!canAfford(team, cost) || team.materials < materialsCost) return false;
  spend(team, cost);
  team.materials -= materialsCost;
  part.level++;
  return true;
}

// ---- Save system ------------------------------------------------------
const SAVE_KEY = 'apexGT3ManagerSave';
function saveCareer(career){
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(career)); return true; }
  catch(e){ console.warn('No se pudo guardar la partida', e); return false; }
}
function loadCareer(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.teams || !parsed.driversPool || !parsed.calendar) return null;
    return migrateCareer(parsed);
  } catch(e){ console.warn('Save corrupto, se descarta.', e); return null; }
}
function resetSave(){ try { localStorage.removeItem(SAVE_KEY); } catch(e){} }
