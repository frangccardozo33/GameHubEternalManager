import { clamp, distance, move } from './math.js';

export class BlockingSystem {
  update(sim,dt) {
    const { players, play, liveTime, rng }=sim;
    for(const p of players) { p.engaged=null; p.cooldown=Math.max(0,p.cooldown-dt); p.fallen=Math.max(0,p.fallen-dt); }
    for(const b of players.filter(p=>p.side==='O'&&p.assignment.type.includes('block'))) {
      const a=b.assignment;
      if(b.fallen||sim.turnover) continue;
      let defender=players.find(p=>p.id===a.target);
      // A double-team releases to the second level after establishing the gap.
      if(a.double&&liveTime>1.4&&sim.runCommitted) defender=players.filter(p=>p.role==='LB').sort((x,y)=>Math.abs(x.x-a.gap)-Math.abs(y.x-a.gap))[0];
      if(!defender||defender.fallen) continue;
      const run=sim.runCommitted;
      const pull=a.pull&&liveTime<1.1;
      const anchor={x:pull?play.gap:a.gap, z:sim.los+(run?Math.min(4,liveTime*1.1):-Math.min(2.6,liveTime*.9))};
      const canReach=distance(b,defender)<1.6 && defender.cooldown<=0;
      if(canReach) {
        b.engaged=defender.id; defender.engaged=b.id; b.state=run?'drive block':'pass block'; defender.state='engage';
        const leverage=1-clamp(Math.abs(b.x-defender.x)/2,0,1);
        const momentum=clamp((b.vz-defender.vz)*.025,-.15,.15);
        const skill=(run?b.stats.runBlocking:b.stats.passBlocking)*.42+b.stats.strength*.24+b.stats.technique*.2+b.stats.awareness*.14;
        const rush=defender.stats.passRush*.5+defender.stats.strength*.35+defender.stats.agility*.15;
        const push=clamp((skill-rush)*4+leverage*.35+momentum+(run?.2:-.3),-1.3,1.2);
        b.z+=push*dt; defender.z+=push*dt; b.vx*=.5; b.vz*=.5; defender.vx*=.4; defender.vz*=.4;
        b.heading=Math.atan2(defender.x-b.x,defender.z-b.z);
        if(rng.chance(dt*(.09+defender.stats.passRush*.19+(1-leverage)*.2))) { defender.cooldown=.8; defender.x+=Math.sign(defender.x-b.x||a.gap||1)*.55; defender.state='block shed'; b.state='disengage'; }
      } else {
        // Stay in protection lane; never chase a beaten defender downfield.
        if(Math.abs(defender.x-anchor.x)<3.1&&Math.abs(defender.z-anchor.z)<4) anchor.x=clamp(defender.x,a.gap-1.9,a.gap+1.9);
        move(b,anchor,dt,pull?.95:.55); b.state=pull?'pull':run?'run block':'pass block';
      }
    }
  }
}
export class OffensiveAI {
  update(sim,dt) {
    for(const p of sim.players.filter(p=>p.side==='O')) {
      if(p.fallen||p.engaged||p.id===sim.ball.owner||(p.role==='OL'&&!sim.turnover)) continue;
      if(sim.turnover) { const carrier=sim.carrier; if(carrier) { move(p,carrier,dt); p.state='pursuit'; } continue; }
      if(p.assignment.type!=='route') continue;
      if(sim.liveTime<p.assignment.releaseAt) { p.state='stance'; continue; }
      if(sim.ball.mode==='flight'&&sim.ball.flight.kind==='pass'&&sim.ball.flight.target===p.id) {
        move(p,sim.ball.flight.end,dt); p.state='track ball'; continue;
      }
      if(sim.ball.owner&&sim.ball.owner!=='QB') { p.state='escort'; const carrier=sim.carrier; if(carrier) move(p,{x:p.x,z:carrier.z+3},dt,.65); continue; }
      const points=p.assignment.points, target=points[Math.min(p.routeIndex,points.length-1)];
      const press=sim.players.find(d=>d.assignment.type==='man'&&d.assignment.target===p.id&&d.assignment.press&&sim.liveTime<.8);
      const release=press?clamp(.5+p.stats.release*.5-press.stats.press*.3,.4,1):1;
      if(target) { move(p,target,dt,(.8+p.stats.routeRunning*.2)*release); p.state=p.routeIndex>0&&distance(p,target)<2?'cut':'route'; if(distance(p,target)<.8&&p.routeIndex<points.length-1) p.routeIndex++; }
    }
  }
}
export class DefensiveAI {
  update(sim,dt) {
    const qb=sim.players.find(p=>p.id==='QB');
    for(const p of sim.players.filter(p=>p.side==='D')) {
      if(p.fallen||p.engaged||p.id===sim.ball.owner) continue;
      const a=p.assignment;
      const reaction=.25+(1-p.stats.reaction)*.8+(sim.play.playAction?.75:0);
      const carrier=sim.carrier;
      if(sim.turnover) { p.state='escort'; if(carrier) move(p,{x:carrier.x+(p.x>carrier.x?3:-3),z:carrier.z-4},dt,.8); continue; }
      if(sim.ball.mode==='loose') { move(p,sim.ball,dt); p.state='recovery'; continue; }
      const runRead=sim.runCommitted&&sim.liveTime>reaction+.7;
      const receiverHasBall=carrier&&carrier.role!=='QB'&&sim.liveTime>1.2;
      if((runRead||receiverHasBall||sim.scrambling)&&carrier) {
        const anticipation=(p.stats.pursuit+p.stats.awareness)*.16;
        const target={x:carrier.x+carrier.vx*anticipation,z:carrier.z+carrier.vz*anticipation};
        move(p,target,dt,.82+p.stats.pursuit*.18); p.state='pursuit'; continue;
      }
      if(a.type==='rush'||a.type==='contain') {
        const target=sim.liveTime<.65?{x:a.gap,z:sim.los-.8}: a.type==='contain'&&Math.abs(qb.x)<3&&p.z>qb.z+1?{x:Math.sign(a.gap)*5,z:qb.z+1}:qb;
        move(p,target,dt,.84+p.stats.passRush*.16); p.state='rush'; continue;
      }
      if(sim.ball.mode==='flight'&&sim.ball.flight.kind==='pass') {
        const f=sim.ball.flight, reach=distance(p,f.end), remaining=f.duration-f.t;
        // DBs need a read, a viable angle and enough time to arrive; no global ball magnet.
        if(f.t>reaction*(1.3-p.stats.awareness*.5)&&reach<(remaining*7+2)*(p.role==='S'?p.stats.range:1)) { move(p,f.end,dt); p.state='ball read'; continue; }
      }
      if(a.type==='man') {
        const target=sim.players.find(r=>r.id===a.target);
        const lag=(1-p.stats.manCoverage)*1.7;
        const error=Math.sin(sim.liveTime*1.8+p.number)*(1-p.stats.awareness)*1.8;
        move(p,{x:target.x-target.vx*lag+error,z:target.z-target.vz*lag+.8},dt,.86+p.stats.manCoverage*.14); p.state='coverage';
      } else if(a.type==='spy') { move(p,{x:qb.x,z:sim.los+4},dt,.75); p.state='spy'; }
      else if(a.zone) {
        let target={...a.zone};
        const threats=sim.players.filter(r=>r.assignment.type==='route'&&distance(r,a.zone)<a.zone.radius+3);
        const threat=threats.sort((x,y)=>y.z-x.z)[0];
        if(threat&&sim.liveTime>reaction) {
          const radius=a.zone.radius*(.6+p.stats.zoneCoverage*.2);
          target.x=clamp(threat.x,a.zone.x-radius,a.zone.x+radius);
          target.z=a.deep?Math.max(a.zone.z,threat.z+2):clamp(threat.z+1,a.zone.z-4,a.zone.z+4);
        }
        move(p,target,dt,.75+p.stats.zoneCoverage*.2); p.state=sim.liveTime<1.5?'backpedal':'zone';
      }
    }
  }
}
export class RunningSystem {
  update(sim,dt) {
    const carrier=sim.carrier;
    if(!carrier||carrier.fallen) return;
    if(carrier.id==='QB'&&!sim.scrambling) return;
    const direction=carrier.side==='O'?1:-1;
    const enemies=sim.players.filter(p=>p.side!==carrier.side&&!p.fallen);
    let target={x:carrier.x,z:carrier.z+8*direction};
    if(sim.runCommitted&&carrier.z<sim.los+1&&carrier.side==='O') {
      const gap=sim.play.gap||0;
      const options=[gap-1.6,gap,gap+1.6].map(x=>({x,z:sim.los+2}));
      const grade=t=>enemies.reduce((score,d)=>score-Math.max(0,4-distance(d,t)),0)-Math.abs(t.x-gap)*(.8-carrier.stats.vision*.5);
      target=options.sort((a,b)=>grade(b)-grade(a))[0];
      // Counter sells the opposite step before following the pulling guard.
      if(sim.play.id==='counter'&&sim.liveTime<1.5) target={x:2,z:sim.los-2};
    } else {
      const ahead=enemies.filter(d=>(d.z-carrier.z)*direction>0&&(d.z-carrier.z)*direction<5).sort((a,b)=>distance(a,carrier)-distance(b,carrier))[0];
      if(ahead&&distance(ahead,carrier)<4) { target.x+=Math.sign(carrier.x-ahead.x||1)*(2+carrier.stats.agility*2); carrier.state='cut'; }
    }
    for(const friend of sim.players.filter(p=>p.side===carrier.side&&p.id!==carrier.id&&distance(p,carrier)<1.5)) { target.x+=Math.sign(carrier.x-friend.x||target.x||1)*1.2; }
    target.x=clamp(target.x,-25.8,25.8);
    move(carrier,target,dt); if(carrier.state!=='cut') carrier.state=sim.scrambling?'scramble':'run';
  }
}
export class QBDecisionSystem {
  update(sim,dt) {
    const qb=sim.players.find(p=>p.id==='QB');
    if(sim.ball.owner!=='QB'||sim.runCommitted||sim.scrambling) return;
    const rush=sim.players.filter(p=>p.side==='D'&&!p.fallen&&!p.engaged);
    const nearest=[...rush].sort((a,b)=>distance(a,qb)-distance(b,qb))[0];
    sim.pressure=clamp((5-distance(nearest,qb))/4,0,1);
    move(qb,{x:sim.pressure>.5?clamp(qb.x+Math.sign(qb.x-nearest.x||1),-4,4):0,z:sim.los-6.2},dt,.55); qb.state='dropback';
    if(sim.play.playAction&&sim.liveTime<1.6) { qb.state='handoff fake'; return; }
    if(sim.liveTime<.85+(1-qb.stats.awareness)*.4) return;
    const reads=qb.assignment.reads;
    const readIndex=Math.min(reads.length-1,Math.floor((sim.liveTime-.85)/(.38+(1-qb.stats.decisionMaking)*.4)));
    sim.qbRead=reads[readIndex];
    const candidates=reads.slice(0,readIndex+1).map(id=>sim.players.find(p=>p.id===id)).filter(p=>p.assignment.type==='route');
    let best=null,bestValue=-Infinity;
    for(const receiver of candidates) {
      const defenders=sim.players.filter(p=>p.side==='D');
      const separation=Math.min(...defenders.map(d=>distance(d,receiver)));
      const depth=receiver.z-sim.los;
      const passLength=distance(qb,receiver);
      const laneRisk=defenders.filter(d=>d.z>qb.z&&d.z<receiver.z).reduce((v,d)=>{
        const t=(d.z-qb.z)/(receiver.z-qb.z); const crossX=qb.x+(receiver.x-qb.x)*t;
        return v+(Math.abs(d.x-crossX)<1.4?.8:0);
      },0);
      const depthBias=sim.drive.distance>9?Math.min(depth,24)*.035:Math.min(depth,sim.drive.distance)*.04;
      const value=separation+depthBias-laneRisk-(receiver.assignment.priority||0)*.07+(sim.rng.next()-.5)*(1-qb.stats.decisionMaking)*3+(sim.bias?.[receiver.pid]||0);
      const ready=sim.liveTime>receiver.assignment.releaseAt+.4&&(!['post','corner','streak'].includes(receiver.assignment.route)||depth>10||sim.pressure>.65);
      if(ready&&passLength<20+qb.stats.armStrength*42&&value>bestValue) { bestValue=value; best=receiver; }
    }
    const threshold=2.25-sim.pressure*.65+(1-qb.stats.decisionMaking)*.7-(sim.qbAggro||0);
    if(best&&(bestValue>threshold||sim.liveTime>4.1)) { sim.passing.throw(sim,best); return; }
    if(sim.pressure>.7&&sim.liveTime>1.9&&sim.rng.chance(dt*qb.stats.mobility*2)) { sim.scrambling=true; sim.emit('scramble','QB abandona el pocket'); }
    else if(sim.liveTime>4.8) sim.passing.throw(sim,null);
  }
}
export class PassingSystem {
  throw(sim,target) {
    const qb=sim.players.find(p=>p.id==='QB'), ball=sim.ball;
    qb.state='throw'; sim.throwPose=.45; sim.passAttempt=true;
    if(!target) {
      ball.launch({x:ball.x,y:1.8,z:ball.z},{x:29,y:.2,z:Math.max(sim.los+2,qb.z+10)},1.1,2.8,'throwaway'); sim.emit('throw','Pase descartado'); return;
    }
    const length=distance(qb,target);
    const duration=clamp(length/(17+qb.stats.armStrength*11),.32,1.85);
    const rating=length<12?qb.stats.shortAccuracy:length<24?qb.stats.mediumAccuracy:qb.stats.deepAccuracy;
    const error=(1-rating)*3.2+sim.pressure*(1-qb.stats.throwUnderPressure)*3.5;
    const endpoint={x:clamp(target.x+target.vx*duration*.75+sim.rng.range(-error,error),-28,28),y:1.35,z:clamp(target.z+target.vz*duration*.75+sim.rng.range(-error,error),-8,108)};
    ball.launch({x:ball.x,y:1.8,z:ball.z},endpoint,duration,.6+length*.057,'pass',target.id);
    sim.target=target.id; sim.emit('throw',`Pase a ${target.id} · ${Math.round(length)} yd`);
  }
  update(sim,dt) {
    const b=sim.ball;
    if(b.mode!=='flight'||b.flight.kind!=='pass'||b.flight.t<.15||b.y>2.6||b.y<.6) return;
    const defender=sim.players.filter(p=>p.side==='D'&&!p.fallen&&distance(p,b)<.82&&p.state==='ball read').sort((a,c)=>distance(a,b)-distance(c,b))[0];
    if(defender&&sim.rng.chance(dt*3.5*defender.stats.reaction*defender.stats.catching)) sim.catching.intercept(sim,defender);
  }
}
export class CatchSystem {
  intercept(sim,p) {
    sim.ball.attach(p); sim.turnover=true; sim.turnoverKind='interception'; sim.interceptor=p; p.state='interception'; p.cooldown=.7; sim.emit('interception',`INTERCEPCIÓN · #${p.number}`);
  }
  resolve(sim,flight) {
    if(flight.kind==='throwaway') { sim.finish('incomplete'); return; }
    const ball=sim.ball;
    const receiver=sim.players.find(p=>p.id===flight.target);
    const defenders=sim.players.filter(p=>p.side==='D'&&!p.fallen&&distance(p,ball)<1.65).sort((a,b)=>distance(a,ball)-distance(b,ball));
    const defender=defenders[0];
    if(defender&&distance(defender,ball)<1.05&&(!receiver||distance(defender,ball)<distance(receiver,ball)+.15)&&sim.rng.chance(.25+defender.stats.reaction*.33)) { this.intercept(sim,defender); return; }
    if(receiver&&Math.abs(receiver.x)<26.65&&distance(receiver,ball)<1.8) {
      const contested=!!defender;
      const rating=receiver.stats.catching*.65+receiver.stats.awareness*.1+(contested?receiver.stats.contestedCatch:receiver.stats.catching)*.25;
      const chance=clamp(rating+.09-(contested?.2:0)-Math.max(0,distance(receiver,ball)-.8)*.16,.15,.97);
      if(sim.rng.chance(chance)) { ball.attach(receiver); receiver.state='catch'; receiver.cooldown=.3; sim.complete=true; sim.catcher=receiver; sim.emit(contested?'contested':'catch',`${contested?'Recepción disputada':'Recepción'} · #${receiver.number}`); return; }
      sim.emit('drop',`Drop · #${receiver.number}`); sim.dropped.push(receiver);
    }
    sim.finish('incomplete');
  }
}
export class TacklingSystem {
  update(sim,dt) {
    const carrier=sim.carrier;
    if(!carrier||carrier.fallen||carrier.cooldown>0||sim.liveTime<.8) return;
    const enemies=sim.players.filter(p=>p.side!==carrier.side&&!p.fallen&&!p.engaged&&p.cooldown<=0);
    for(const d of enemies) {
      if(distance(carrier,d)>1.05) continue;
      const relative=Math.hypot(carrier.vx-d.vx,carrier.vz-d.vz);
      const frontal=Math.cos(carrier.heading-Math.atan2(d.x-carrier.x,d.z-carrier.z));
      const tackle=frontal>.4?'frontal':frontal<-.45?'arm tackle':relative>8?'lateral':'wrap';
      const attack=d.stats.tackling*.62+d.stats.strength*.23+Math.min(relative/12,1)*.15;
      const resist=carrier.stats.contactBalance*.4+carrier.stats.strength*.2+carrier.stats.agility*.15+carrier.speed/8*.25;
      const success=clamp(.73+(attack-resist)*.55+(frontal>.4?.1:-.05),.3,.96);
      if(sim.rng.chance(success)) {
        if(carrier.id!=='QB'&&sim.rng.chance((1-carrier.stats.carrying)*.075+Math.max(0,relative-7)*.0015)) {
          const b=sim.ball; b.mode='loose'; b.owner=null; b.vx=carrier.vx*.45+sim.rng.range(-2,2); b.vz=carrier.vz*.55; b.vy=3; sim.fumbleTime=0; sim.fumbled=true; sim.forcedFumbleBy=d; sim.tackler=d; carrier.fallen=.9; sim.emit('fumble','FUMBLE · balón suelto'); return;
        }
        carrier.fallen=2; carrier.state='fall'; d.state=`tackle ${tackle}`; d.fallen=1.2; sim.tackler=d;
        // Forward progress is awarded without teleporting the ball carrier.
        sim.contactProgress=carrier.side==='O'?clamp(carrier.speed*.09,0,.6):0;
        sim.emit('tackle',`Tackle ${tackle} · #${d.number}`);
        sim.finish(sim.specialReturn || (carrier.id==='QB'&&!sim.scrambling?'sack':sim.turnover?sim.turnoverKind:'tackle')); return;
      }
      sim.missedTackles.push(d); d.fallen=.8; d.state='missed tackle'; d.cooldown=1.8; carrier.cooldown=.5; carrier.state='stiff arm'; carrier.vx*=.8; carrier.vz*=.8;
      sim.emit('broken','Tackle roto · sigue la carrera'); return;
    }
  }
}
