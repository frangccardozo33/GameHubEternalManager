import { Random, clamp, distance, move } from './math.js';
import { Ball, TEAMS } from './models.js';
import { choosePlay, chooseDefense, PLAYBOOK } from './playbook.js';
import { callOffense, callDefense } from './gameplan.js';
import { createFormation } from './formation.js';
import { DEFAULT_RULES, ClockSystem, RulesSystem, DriveSystem } from './rules.js';
import { BlockingSystem, OffensiveAI, DefensiveAI, RunningSystem, QBDecisionSystem, PassingSystem, CatchSystem, TacklingSystem } from './systems.js';
import { SpecialTeams } from './special.js';

export const STATES=['HUDDLE','FORMATION','PRE-SNAP','SNAP','PLAY LIVE','BALL RESOLUTION','DEAD BALL','RESULT','NEXT DOWN','HALFTIME','FINAL'];
export const FIXED_DT=1/30;
export class MatchSimulator {
  constructor({seed=42,rules={},teams=TEAMS,recorder=null}={}) {
    this.recorder=recorder; this.top=[0,0]; this.otPeriods=0; this.suddenEnd=false; this.injuries=[]; this.dropped=[]; this.missedTackles=[]; this.penaltyMul=1; this.bias=null; this.qbAggro=0; this.playStartElapsed=0;
    this.seed=seed; this.rng=new Random(seed); this.config={...DEFAULT_RULES,...rules}; this.teams=teams.map(t=>({...t}));
    this.clock=new ClockSystem(this.config); this.rules=new RulesSystem(this.config); this.drive=new DriveSystem(this.config);
    this.ball=new Ball(); this.blocking=new BlockingSystem(); this.offensive=new OffensiveAI(); this.defensive=new DefensiveAI(); this.running=new RunningSystem(); this.qbDecision=new QBDecisionSystem(); this.passing=new PassingSystem(); this.catching=new CatchSystem(); this.tackling=new TacklingSystem(); this.special=new SpecialTeams();
    this.state='HUDDLE'; this.stateTime=0; this.totalTime=0; this.playNumber=0; this.events=[]; this.history=[]; this.forcedPlay=null; this.forcedCoverage=null; this.lastResult=null; this.started=false; this.prepare();
  }
  get carrier() { return this.players.find(p=>p.id===this.ball.owner); }
  get specialPlay() { return ['kickoff','punt','field-goal','extra-point','two-point'].includes(this.play.type); }
  emit(type,text) { this.events.push({id:this.events.length?this.events.at(-1).id+1:1,type,text,quarter:this.clock.quarter,time:this.clock.display,play:this.playNumber}); if(this.events.length>120) this.events.shift(); }
  enter(state) { this.state=state; this.stateTime=0; }
  start() { this.started=true; }
  elapsed() { const c=this.clock,qs=this.config.quarterSeconds,n=this.config.quarters; if(c.quarter<=n) return (c.quarter-1)*qs+(qs-c.remaining); return n*qs+(c.quarter-n-1)*this.config.overtimeSeconds+(this.config.overtimeSeconds-c.remaining); }
  prepare() {
    const d=this.drive, O=this.teams[d.offense], D=this.teams[1-d.offense];
    if(d.pending==='extra-point'&&this.clock.quarter===4&&this.clock.remaining<120&&[2,5,8].includes(d.score[1-d.offense]-d.score[d.offense])) d.pending='two-point';
    O.roster?.beginPlay?.(this); D.roster?.beginPlay?.(this);
    const special=!!d.pending;
    this.play=d.pending?{id:d.pending,name:({'kickoff':'Kickoff','extra-point':'Extra point','two-point':'Conversión de dos'})[d.pending],type:d.pending,personnel:'12',formation:'Special teams'}:this.forcedPlay?{...PLAYBOOK.find(p=>p.id===this.forcedPlay)}:O.gameplan?callOffense(d,this.clock,O.gameplan,this.rng,O.roster?.kickerStats?.()??null):choosePlay(d,this.clock,O,this.rng);
    let front=null;
    if(D.gameplan&&!special) { const call=callDefense(d,D.gameplan,this.rng,this.play); this.coverage=this.forcedCoverage||call.coverage; front=call.front; }
    else this.coverage=this.forcedCoverage||chooseDefense(d,D.defense,this.rng);
    this.los=d.spot; this.playOffense=d.offense;
    const ctx=(O.roster||D.roster)?{pick:(side,pos,i)=>(side==='O'?O:D).roster?.pick(pos,i)??null,front}:null;
    const formation=createFormation(this.play,this.coverage,this.los,this.rng,ctx); this.players=formation.players; this.front=formation.front;
    const tempo=O.gameplan?.off.tempo??50, agg=D.gameplan?.def.aggression??50;
    this.penaltyMul=(O.discipline??1)*(D.discipline??1)*(1+(tempo-50)/100*.5+(agg-50)/100*.35);
    this.qbAggro=O.gameplan?(O.gameplan.off.aggression-50)/100*.9:0;
    const target=O.gameplan?.featured?.target; this.bias=target?{[target]:.9}:null;
    Object.assign(this,{liveTime:0,runCommitted:this.play.type==='run',scrambling:false,turnover:false,turnoverKind:null,complete:false,passAttempt:false,pressure:0,qbRead:'X',target:null,fumbled:false,fumbleTime:0,kicked:false,specialReturn:null,contactProgress:0,throwPose:0,result:null,tackler:null,interceptor:null,catcher:null,forcedFumbleBy:null,dropped:[],missedTackles:[],playStartElapsed:this.elapsed()});
    this.ball.owner=null; this.ball.flight=null; this.ball.mode='dead'; this.ball.x=0; this.ball.z=this.los; this.ball.y=.3;
    if(this.specialPlay) this.special.setup(this);
    this.playNumber++; this.emit('play',`${this.play.name} · ${this.coverage}`);
  }
  finish(kind,extra={}) {
    if(!['SNAP','PLAY LIVE','BALL RESOLUTION','PRE-SNAP'].includes(this.state)) return;
    const carrier=this.carrier;
    const spot=kind==='incomplete'?this.los:carrier?carrier.z+this.contactProgress:this.ball.z;
    this.result={kind,spot,pass:this.passAttempt,complete:this.complete,turnover:this.turnover&&!this.specialReturn,holding:this.config.penalties&&!this.specialPlay&&this.rng.chance(.013*this.penaltyMul),out:Math.abs(this.ball.x)>26.65,...extra};
    this.result.yards=this.result.spot-this.los;
    const pidOf=id=>this.players.find(p=>p.id===id)?.pid??null;
    this.result.detail={off:this.playOffense,playId:this.play.id,playType:this.play.type,coverage:this.coverage,front:this.front,down:this.drive.down,distance:this.drive.distance,spot:this.los,carrier:carrier?.pid??null,carrierSlot:carrier?.id??null,qb:pidOf('QB'),target:this.target?pidOf(this.target):null,catcher:this.catcher?.pid??null,tackler:this.tackler?.pid??null,interceptor:this.interceptor?.pid??null,forcedBy:this.forcedFumbleBy?.pid??null,dropped:this.dropped.map(p=>p.pid),missed:this.missedTackles.map(p=>p.pid),scramble:this.scrambling,pressure:this.pressure,kicker:pidOf('QB')};
    this.ball.mode=kind==='incomplete'?'loose':this.ball.mode;
    if(kind==='incomplete') { this.ball.vy=-.5; this.ball.vx=1; this.ball.vz=2; this.ball.owner=null; }
    this.enter('DEAD BALL'); this.emit('whistle','Final de jugada');
  }
  presnap(dt) {
    this.clock.playClock=Math.max(0,this.clock.playClock-dt);
    // Slot motion changes leverage; the linebacker's box position informs the RPO.
    const slot=this.players.find(p=>p.id==='Y');
    if(['mesh','rpo','counter'].includes(this.play.id)) { move(slot,{x:slot.start.x+3,z:slot.start.z-.2},dt,.5); slot.state='motion'; }
    for(const p of this.players.filter(p=>p.side==='D'&&p.role==='S')) { move(p,{x:p.start.x+(this.coverage==='Cover 1'?2:0),z:p.start.z},dt,.35); }
  }
  snap() {
    if(this.config.penalties&&!this.specialPlay&&this.rng.chance(.022*this.penaltyMul)) { this.finish(this.rng.chance(.55)?'false start':'offside',{spot:this.los,holding:false}); return; }
    if(this.play.rpo) { const box=this.players.filter(p=>p.side==='D'&&Math.abs(p.x)<7&&p.z<this.los+6).length; this.runCommitted=box<7; this.emit('read',`RPO: ${box} en box → ${this.runCommitted?'carrera':'pase'}`); }
    if(this.runCommitted&&this.play.rpo) this.players.filter(p=>p.role==='OL').forEach(p=>p.assignment.type='run block');
    this.clock.running=!['extra-point','two-point'].includes(this.play.type);
    const qb=this.players.find(p=>p.id==='QB');
    if(!this.specialPlay) this.ball.launch({x:0,y:.4,z:this.los},{x:qb.x,y:1.1,z:qb.z},.3,.15,'snap','QB');
    this.emit('snap','Snap'); this.enter('SNAP');
  }
  live(dt) {
    this.liveTime+=dt; this.throwPose=Math.max(0,this.throwPose-dt);
    if(this.specialPlay&&!this.specialReturn) this.special.update(this,dt);
    else {
      this.blocking.update(this,dt); this.offensive.update(this,dt); this.defensive.update(this,dt);
      if(this.runCommitted&&this.ball.owner==='QB'&&this.liveTime>.35) {
        const rb=this.players.find(p=>p.id==='RB'); this.ball.launch({x:this.ball.x,y:this.ball.y,z:this.ball.z},{x:rb.x,y:1.1,z:rb.z},.25,.1,'handoff','RB');
        this.players.find(p=>p.id==='QB').state='handoff'; this.emit('handoff','Handoff · RB');
      }
      this.qbDecision.update(this,dt); this.running.update(this,dt); this.passing.update(this,dt);
      this.tackling.update(this,dt);
    }
    const flight=this.ball.step(dt,this.players);
    if(this.state==='DEAD BALL') return;
    if(flight) {
      if(['snap','handoff'].includes(flight.kind)) this.ball.attach(this.players.find(p=>p.id===flight.target));
      else if(['kick','goal'].includes(flight.kind)) this.special.resolve(this,flight);
      else this.catching.resolve(this,flight);
    }
    if(this.state==='DEAD BALL') return;
    if(this.ball.mode==='loose') {
      this.fumbleTime+=dt;
      for(const p of this.players.filter(p=>!p.fallen)) { move(p,this.ball,dt); p.state='recovery'; }
      const nearest=this.players.filter(p=>!p.fallen).sort((a,b)=>distance(a,this.ball)-distance(b,this.ball))[0];
      if(nearest&&distance(nearest,this.ball)<1.2&&this.fumbleTime>.35&&this.ball.y<1.4) {
        this.ball.attach(nearest); this.turnover=nearest.side==='D'; this.turnoverKind='fumble'; nearest.cooldown=.4; this.emit('recovery',`Recuperación · ${nearest.side==='D'?'defensa':'ataque'}`);
      } else if(this.fumbleTime>4) this.finish('fumble',{spot:clamp(this.ball.z,.5,99.5)});
    }
    const carrier=this.carrier;
    if(carrier) {
      if(Math.abs(carrier.x)>26.65) this.finish(this.specialReturn||'out of bounds',{out:true});
      else if(carrier.side==='O'&&carrier.z>=100) this.finish('touchdown');
      else if(carrier.side==='D'&&carrier.z<=0) this.finish(this.specialReturn||'interception',{spot:0});
      else if(carrier.side==='O'&&carrier.z<=-8) this.finish('safety',{spot:0});
    } else if(this.ball.mode==='loose'&&Math.abs(this.ball.x)>26.65) this.finish('fumble',{out:true});
    if(this.liveTime>this.config.maxLiveSeconds&&this.state!=='DEAD BALL') this.finish(this.specialReturn||(this.ball.mode==='flight'?'incomplete':'forward progress'));
    if(this.ball.mode==='flight'&&['pass','throwaway'].includes(this.ball.flight.kind)&&this.state==='PLAY LIVE') this.enter('BALL RESOLUTION');
    if(this.ball.mode==='carried'&&this.state==='BALL RESOLUTION') this.enter('PLAY LIVE');
  }
  applyResult() {
    const before={offense:this.drive.offense,down:this.drive.down,spot:this.los,score:[...this.drive.score]};
    this.rules.apply(this.drive,this.clock,this.result);
    const r=this.result;
    const scoring=this.drive.score.some((s,i)=>s>before.score[i]);
    let label=r.kind==='incomplete'?'PASE INCOMPLETO':r.kind.toUpperCase();
    if(r.holding) label='HOLDING · −10 YD';
    else if(r.firstDown) label='FIRST DOWN';
    else if(r.onDowns) label='TURNOVER ON DOWNS';
    else if(r.kind==='field-goal'||r.kind==='extra-point'||r.kind==='two-point') label=r.good?'PATADA BUENA':'INTENTO FALLADO';
    else if(r.kind==='kickoff'||r.kind==='punt') label=`${r.kind.toUpperCase()} · ${r.touchback?'TOUCHBACK':'RETORNO'}`;
    this.lastResult={...r,label,before,scoring,play:this.play.name,playNumber:this.playNumber};
    this.history.push(this.lastResult); this.emit(scoring?'score':'result',label+(this.specialPlay?'':` · ${r.yards>=0?'+':''}${r.yards.toFixed(1)} yd`));
    if(this.clock.quarter>this.config.quarters&&scoring) this.suddenEnd=true;
    for(const t of this.teams) t.roster?.afterPlay?.(this,this.lastResult);
    this.recorder?.onPlay(this,this.lastResult);
  }
  finalize() { this.enter('FINAL'); this.emit('final','FINAL DEL PARTIDO'); this.recorder?.onFinal(this); }
  startOvertime() {
    const c=this.clock,d=this.drive; this.otPeriods++; c.quarter++; c.remaining=this.config.overtimeSeconds; c.expired=false; c.finished=false; c.running=false; c.playClock=this.config.playClock;
    d.offense=this.rng.pick([0,1]); d.spot=35; d.pending='kickoff'; d.timeouts=[2,2]; this.emit('quarter','Tiempo extra · muerte súbita');
  }
  step(dt=FIXED_DT) {
    if(!this.started||this.state==='FINAL') return;
    this.totalTime+=dt; this.stateTime+=dt;
    if(['SNAP','PLAY LIVE','BALL RESOLUTION'].includes(this.state)) { if(this.clock.running&&!this.specialPlay) this.top[this.playOffense]+=dt; this.clock.tick(dt); }
    switch(this.state) {
      case 'HUDDLE': if(this.stateTime>.55) this.enter('FORMATION'); break;
      case 'FORMATION': if(this.stateTime>.7) this.enter('PRE-SNAP'); break;
      case 'PRE-SNAP': this.presnap(dt); if(this.stateTime>1.65) this.snap(); break;
      case 'SNAP': this.live(dt); if(this.state==='SNAP'&&this.stateTime>.32) this.enter('PLAY LIVE'); break;
      case 'PLAY LIVE': case 'BALL RESOLUTION': this.live(dt); break;
      case 'DEAD BALL': if(this.ball.mode==='loose') this.ball.step(dt,this.players); if(this.stateTime>.85) { this.applyResult(); this.enter('RESULT'); } break;
      case 'RESULT': if(this.stateTime>1.4) this.enter('NEXT DOWN'); break;
      case 'NEXT DOWN': {
        const d=this.drive,c=this.clock;
        if(c.quarter>=2&&c.remaining<100&&c.running&&d.score[1-d.offense]<d.score[d.offense]&&d.timeouts[1-d.offense]>0) { d.timeout(1-d.offense,c); this.emit('timeout','Timeout defensivo'); }
        if(this.suddenEnd) { c.finished=true; c.running=false; this.finalize(); break; }
        const gp=this.teams[this.playOffense]?.gameplan; let factor=gp?clamp(1.3-gp.off.tempo/100*.6,.6,1.4):1;
        if(gp&&c.quarter>=2&&c.quarter%2===0&&c.remaining<120&&d.score[this.playOffense]<d.score[1-this.playOffense]) factor=Math.min(factor,.55);
        const before=c.remaining; c.runoff(this.config.runoff*factor+this.rng.range(-5,5)); if(!this.specialPlay) this.top[this.playOffense]+=before-c.remaining;
        if(c.expired&&!['extra-point','two-point'].includes(d.pending)) {
          if(this.config.overtime>0&&c.quarter>=this.config.quarters&&d.score[0]===d.score[1]&&this.otPeriods<this.config.overtime) { this.startOvertime(); this.prepare(); this.enter('HUDDLE'); break; }
          c.advance();
          if(c.finished) { this.finalize(); break; }
          if(c.halftime) { d.timeouts=[3,3]; d.offense=0; d.spot=35; d.pending='kickoff'; this.enter('HALFTIME'); this.emit('halftime','DESCANSO'); break; }
          this.emit('quarter',`Inicio del cuarto ${c.quarter}`);
        }
        this.prepare(); this.enter('HUDDLE'); break;
      }
      case 'HALFTIME': if(this.stateTime>3) { this.clock.halftime=false; this.prepare(); this.enter('HUDDLE'); } break;
    }
  }
  simulateToEnd(maxSteps=2000000) { this.start(); let steps=0; while(this.state!=='FINAL'&&steps++<maxSteps) this.step(); if(this.state!=='FINAL') throw new Error(`Match stalled in ${this.state}`); return {score:this.drive.score,plays:this.history.length,stats:this.drive.stats,steps}; }
  snapshot() { return {state:this.state,offense:this.playOffense,los:this.los,lineToGain:this.drive.lineToGain,ball:{x:this.ball.x,y:this.ball.y,z:this.ball.z,mode:this.ball.mode},players:this.players.map(p=>({id:p.id,role:p.role,side:p.side,x:p.x,z:p.z,heading:p.heading,speed:p.speed,state:p.state,fallen:p.fallen,number:p.number,name:p.name,ovr:p.ovr,engaged:p.engaged})),liveTime:this.liveTime,playNumber:this.playNumber}; }
}
