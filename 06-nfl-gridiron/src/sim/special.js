import { clamp, distance, move } from './math.js';

export const fgDistance = spot => 117 - spot;
// Field goal probability. With kicker stats (persistent roster player) accuracy and power matter; without them the Phase 1 curve is kept.
export function fgChance(yards, k = null) {
  if (!k) return clamp(1.06 - Math.max(0, yards - 25) * .015, .12, .98);
  const base = .55 + k.kickAccuracy * .5, decay = .0205 - k.kickPower * .0082;
  return clamp(base - Math.max(0, yards - 25) * decay - Math.max(0, yards - (48 + k.kickPower * 16)) * .045, .04, .99);
}
export class SpecialTeams {
  setup(sim) {
    const kind=sim.play.type;
    const qb=sim.players.find(p=>p.id==='QB');
    qb.z=sim.los-(kind==='punt'?12:7); qb.start.z=qb.z;
    if(kind==='kickoff') {
      sim.players.filter(p=>p.side==='O').forEach((p,i)=>{p.x=(i-5)*4.4;p.z=sim.los-(i===5?3:0);p.start={x:p.x,z:p.z};});
      sim.players.filter(p=>p.side==='D').forEach((p,i)=>{p.x=(i-5)*4;p.z=i===10?91:65+(i%3)*4;p.start={x:p.x,z:p.z};});
    }
    if(kind==='punt') { const returner=sim.players.find(p=>p.id==='S1'); returner.z=Math.min(96,sim.los+42); returner.x=0; }
    sim.ball.x=0; sim.ball.z=sim.los; sim.ball.y=.3; sim.ball.mode='dead';
  }
  update(sim,dt) {
    const kind=sim.play.type, ball=sim.ball;
    if(sim.specialReturn) return;
    if(sim.liveTime>.65&&!sim.kicked) {
      sim.kicked=true;
      const kicker=sim.players.find(p=>p.id==='QB'), kp=kicker?.pid?kicker.stats:null;
      if(kind==='field-goal'||kind==='extra-point'||kind==='two-point') {
        const yards=fgDistance(sim.los);
        const chance=kind==='two-point'?.47:kind==='extra-point'?(kp?clamp(.86+kp.kickAccuracy*.13,.85,.995):.94):fgChance(yards,kp);
        sim.kickGood=sim.rng.chance(chance);
        const x=sim.kickGood?sim.rng.range(-2.1,2.1):sim.rng.pick([-1,1])*sim.rng.range(3.5,8);
        ball.launch({x:0,y:.3,z:sim.los-7},{x,y:sim.kickGood?5:2.5,z:110},2.3,10,'goal');
        sim.emit('kick',`${kind==='field-goal'?'Field goal':kind==='two-point'?'Conversión de dos (abstracta)':'Extra point'} · ${Math.round(yards)} yd`);
      } else {
        const landing=kind==='kickoff'?(kp?84+kp.kickPower*14+sim.rng.range(-6,6):sim.rng.range(90,105)):sim.los+(kp?29+kp.kickPower*22+sim.rng.range(-8,8):sim.rng.range(37,53));
        const scatter=kp?1.25-kp.kickAccuracy*.6:1;
        ball.launch({x:ball.x,y:.4,z:ball.z},{x:sim.rng.range(-16,16)*scatter,y:1.2,z:Math.min(109,landing)},kind==='kickoff'?3.8:3.5,18,'kick'); sim.emit('kick',kind==='kickoff'?'Kickoff':'Punt');
      }
    }
    if(ball.mode==='flight'&&ball.flight.kind==='kick') {
      for(const p of sim.players) {
        if(p.side==='O') { move(p,{x:ball.flight.end.x*.4+p.start.x*.4,z:ball.flight.end.z},dt,.95); p.state='pursuit'; }
        else if(p.id==='S1') { move(p,ball.flight.end,dt,1.1); p.state='track ball'; }
      }
    }
  }
  resolve(sim,flight) {
    if(flight.kind==='goal') { sim.finish(sim.play.type,{good:sim.kickGood}); return; }
    if(flight.end.z>=100) { sim.finish(sim.play.type,{touchback:true,spot:100}); return; }
    const returner=sim.players.filter(p=>p.side==='D').sort((a,b)=>distance(a,sim.ball)-distance(b,sim.ball))[0];
    if(distance(returner,sim.ball)>2.2) { sim.finish(sim.play.type,{spot:flight.end.z}); return; }
    sim.ball.attach(returner); sim.turnover=true; sim.specialReturn=sim.play.type; returner.cooldown=.4; sim.emit('return','Retorno de patada');
  }
}
