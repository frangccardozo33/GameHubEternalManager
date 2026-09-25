import { Player } from './models.js';
import { routePoints } from './playbook.js';

const KICKS = { kickoff: 'K', 'field-goal': 'K', 'extra-point': 'K', punt: 'P' };
// `ctx` (optional) is { pick(side, position, index) -> roster profile | null, front }: it fills the 22 slots with persistent
// roster players chosen by the depth chart. Without it players are random Phase 1 players.
export function createFormation(play, coverage, spot, rng, ctx = null) {
  const players = [];
  const add = (id, role, side, x, z, n, slot = null) => {
    const profile = ctx && slot ? ctx.pick(side, slot[0], slot[1]) : null;
    const p = new Player(id, role, side, x, spot + z, rng, n, profile); players.push(p); return p;
  };
  const line = [-3.2,-1.6,0,1.6,3.2].map((x,i) => add(`O${i}`, 'OL','O',x,0, [72,65,60,68,77][i], ['OL', i]));
  add('QB','QB','O',0,play.formation === 'Shotgun' ? -5 : -2.2,12, [KICKS[play.type] || 'QB', 0]);
  add('RB','RB','O',play.formation === 'Shotgun' ? 2.2 : 0,-6.8,24, ['RB', 0]);
  add('X','WR','O',-20,0,11, ['WR', 0]); add('Z','WR','O',20,0,88, ['WR', 1]);
  if (play.personnel === '11') add('Y','WR','O',-12,-1,18, ['WR', 2]);
  else if (play.personnel === '12') add('Y','TE','O',-5,-.6,84, ['TE', 1]);
  else add('Y','RB','O',0,-4.5,36, ['RB', 1]);
  add('TE','TE','O',5,-.5,87, ['TE', 0]);
  const front = ctx?.front || (play.personnel === '11' ? 'nickel' : rng.chance(.5) ? '4-3' : '3-4');
  const dlCount = front === '3-4' ? 3 : 4;
  const dlX = dlCount === 3 ? [-3,0,3] : [-4.2,-1.2,1.2,4.2];
  dlX.forEach((x,i) => add(`D${i}`,'DL','D',x,1.1,90+i, ['DL', i]));
  const lbCount = front === 'dime' ? 1 : front === 'nickel' ? 2 : front === '4-3' ? 3 : 4;
  for (let i=0; i<lbCount; i++) add(`LB${i}`,'LB','D',(i-(lbCount-1)/2)*4,4.3,50+i, ['LB', i]);
  add('CB0','CB','D',-20,coverage === 'Man' || coverage === 'Cover 1' ? 1.3 : 6,21, ['CB', 0]);
  add('CB1','CB','D',20,coverage === 'Man' || coverage === 'Cover 1' ? 1.3 : 6,23, ['CB', 1]);
  if (front === 'nickel' || front === 'dime') add('CB2','CB','D',-12,5,29, ['CB', 2]);
  if (front === 'dime') add('CB3','CB','D',12,5,27, ['CB', 3]);
  add('S0','S','D',-8,coverage === 'Cover 1' ? 7 : 13,31, ['S', 0]);
  add('S1','S','D',8,coverage === 'Cover 1' ? 17 : 13,32, [play.type === 'kickoff' ? 'KR' : play.type === 'punt' ? 'PR' : 'S', play.type === 'kickoff' || play.type === 'punt' ? 0 : 1]);
  const defenders = players.filter(p => p.side === 'D');
  const rushers = defenders.filter(p => p.role === 'DL');
  if (coverage === 'Blitz' || coverage === 'Zone blitz') rushers.push(...defenders.filter(p => p.role === 'LB').slice(0,coverage === 'Blitz' ? 2 : 1));
  if (coverage === 'Zone blitz') rushers.splice(1,1);
  for (const d of rushers) d.assignment = { type: Math.abs(d.x)>3 ? 'contain' : 'rush', gap: d.x + (d.x < 0 ? -.7 : .7) };
  const used = new Set();
  for (const ol of line) {
    const defender = [...rushers].sort((a,b)=> Math.abs(a.x-ol.x)-Math.abs(b.x-ol.x)).find(d=>!used.has(d.id));
    if (defender) used.add(defender.id);
    ol.assignment = { type: play.type === 'run' ? 'run block' : 'pass block', target: defender?.id || rushers[Math.floor(rushers.length/2)]?.id, gap: ol.x, double: !defender, pull: ['counter','power'].includes(play.id) && ol.id === 'O1' };
  }
  const eligible = ['X','Z','Y','TE','RB'].map(id=>players.find(p=>p.id===id));
  eligible.forEach((p,i) => {
    const route = play.routes?.[i] || (p.role === 'RB' ? 'check' : 'streak');
    p.assignment = { type: 'route', route, points: routePoints(route,p.start), priority: play.screen ? p.id === 'RB' ? 0 : i+1 : i, releaseAt: p.id === 'RB' ? 1.2 : .12 + i*.09, depth: routePoints(route,p.start)[0].z-p.z };
    if (play.type === 'run') p.assignment = p.id === 'RB' ? { type:'carry', gap:play.gap } : { type:'run block', target: defenders.filter(d=>!used.has(d.id)).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0]?.id, gap:p.x };
  });
  players.find(p=>p.id==='QB').assignment = { type:'quarterback', reads: [...eligible].sort((a,b)=>a.assignment.priority-b.assignment.priority).map(p=>p.id) };
  const covering = defenders.filter(d=>!rushers.includes(d));
  const man = ['Man','Cover 1','Blitz'].includes(coverage);
  const matched = new Set();
  covering.forEach((d,i)=> {
    if (man && !(d.role==='S' && coverage==='Cover 1')) {
      const target = [...eligible].sort((a,b)=>Math.abs(a.x-d.x)-Math.abs(b.x-d.x)).find(p=>!matched.has(p.id));
      if (target) { matched.add(target.id); d.assignment={ type:'man', target:target.id, press:d.role==='CB' && d.z-spot<2 }; return; }
    }
    const shells = coverage==='Cover 4' ? 4 : coverage==='Cover 3' ? 3 : coverage==='Cover 2' ? 2 : 1;
    const deep = d.role === 'S' || (shells >=3 && d.role==='CB' && (shells===4 || d.id==='CB0'));
    const deepPlayers = covering.filter(p=>p.role==='S' || (shells>=3 && p.role==='CB' && (shells===4 || p.id==='CB0'))).sort((a,b)=>a.x-b.x);
    const index = deepPlayers.indexOf(d);
    d.assignment = { type: deep ? 'deep zone' : i===covering.length-1 && coverage==='Man' ? 'spy' : 'hook zone', zone: { x:deep ? (index-(deepPlayers.length-1)/2)*(44/deepPlayers.length) : d.x*.7, z:spot+(deep?17:7), radius:deep?13:7 }, deep };
  });
  return { players, front };
}
