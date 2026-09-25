import { clamp } from './math.js';

export const DEFAULT_RULES = Object.freeze({ quarterSeconds:300, quarters:4, firstDownYards:10, downs:4, touchdown:6, fieldGoal:3, extraPoint:1, twoPoint:2, safety:2, touchback:25, puntTouchback:20, falseStartYards:5, offsideYards:5, holdingYards:10, playClock:40, runoff:24, maxLiveSeconds:15, penalties:true, overtime:0, overtimeSeconds:300 });
export class ClockSystem {
  constructor(rules) { this.rules=rules; this.quarter=1; this.remaining=rules.quarterSeconds; this.playClock=rules.playClock; this.running=false; this.expired=false; this.finished=false; this.halftime=false; }
  tick(dt) { if(this.running&&!this.finished) { this.remaining=Math.max(0,this.remaining-dt); this.expired=this.remaining===0; } }
  runoff(seconds) { if(this.running) this.tick(seconds); this.playClock=this.rules.playClock; }
  advance() {
    if(!this.expired) return false;
    if(this.quarter>=this.rules.quarters) { this.finished=true; this.running=false; return true; }
    this.halftime=this.quarter===2; this.quarter++; this.remaining=this.rules.quarterSeconds; this.expired=false; this.running=false; return true;
  }
  get display() { const s=Math.ceil(this.remaining); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
}
export class DriveSystem {
  constructor(rules) { this.rules=rules; this.offense=1; this.spot=35; this.down=1; this.distance=10; this.lineToGain=45; this.score=[0,0]; this.timeouts=[3,3]; this.pending='kickoff'; this.drive=1; this.stats=[this.emptyStats(),this.emptyStats()]; }
  emptyStats() { return { plays:0, yards:0, passing:0, rushing:0, completions:0, attempts:0, turnovers:0, firstDowns:0, sacks:0, touchdowns:0 }; }
  series(spot=this.spot) { this.spot=clamp(spot,.5,99.5); this.down=1; this.lineToGain=Math.min(100,this.spot+this.rules.firstDownYards); this.distance=this.lineToGain-this.spot; }
  possession(team,spot) { this.offense=team; this.series(spot); this.drive++; }
  timeout(team,clock) { if(this.timeouts[team]<=0||clock.finished) return false; this.timeouts[team]--; clock.running=false; return true; }
}
export class RulesSystem {
  constructor(rules) { this.config=rules; }
  apply(drive,clock,result) {
    const r=this.config, team=drive.offense, other=1-team, s=drive.stats[team];
    const beginKickoff = scoring => { drive.offense=scoring; drive.spot=35; drive.pending='kickoff'; clock.running=false; };
    if(result.kind==='false start'||result.kind==='offside') {
      const yards=result.kind==='false start'?-r.falseStartYards:r.offsideYards;
      drive.spot=clamp(drive.spot+yards,drive.spot/2,(drive.spot+100)/2);
      if(drive.spot>=drive.lineToGain) drive.series(); else drive.distance=drive.lineToGain-drive.spot;
      clock.running=false; return;
    }
    if(result.kind==='extra-point'||result.kind==='two-point') {
      if(result.good) drive.score[team]+=result.kind==='extra-point'?r.extraPoint:r.twoPoint;
      beginKickoff(team); return;
    }
    if(result.kind==='kickoff'||result.kind==='punt') {
      drive.pending=null; drive.possession(other,result.touchback ? result.kind==='punt'?r.puntTouchback:r.touchback : clamp(100-result.spot,.5,99.5)); clock.running=false; return;
    }
    if(result.kind==='field-goal') {
      if(result.good) { drive.score[team]+=r.fieldGoal; beginKickoff(team); }
      else drive.possession(other,Math.max(20,100-(drive.spot-7)));
      clock.running=false; return;
    }
    s.plays++;
    if(result.holding) { drive.spot=Math.max(drive.spot/2,drive.spot-r.holdingYards); drive.distance=drive.lineToGain-drive.spot; clock.running=false; return; }
    if(result.pass) { s.attempts++; if(result.complete) s.completions++; }
    if(result.kind==='sack') s.sacks++;
    const yards=result.kind==='incomplete'?0:result.spot-drive.spot;
    if(!result.turnover) { s.yards+=yards; if(result.pass) s.passing+=yards; else s.rushing+=yards; }
    if(result.turnover) {
      s.turnovers++;
      if(result.spot<=0) { drive.score[other]+=r.touchdown; drive.stats[other].touchdowns++; drive.offense=other; drive.pending='extra-point'; drive.spot=98; }
      else drive.possession(other,clamp(100-result.spot,r.puntTouchback,99.5));
      clock.running=false; return;
    }
    if(result.spot>=100) { drive.score[team]+=r.touchdown; s.touchdowns++; drive.pending='extra-point'; drive.spot=98; clock.running=false; return; }
    if(result.spot<=0&&result.kind!=='incomplete') { drive.score[other]+=r.safety; beginKickoff(team); return; }
    if(result.kind!=='incomplete') drive.spot=clamp(result.spot,.5,99.5);
    if(drive.spot+.001>=drive.lineToGain) { drive.series(); s.firstDowns++; result.firstDown=true; }
    else { drive.down++; drive.distance=drive.lineToGain-drive.spot; if(drive.down>r.downs) { result.onDowns=true; drive.possession(other,100-drive.spot); } }
    clock.running=!(result.out||result.kind==='incomplete'||result.onDowns);
  }
}
