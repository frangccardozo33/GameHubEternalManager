// Local Web Audio synthesis. Audio is opt-in and never affects simulation outcomes.
export class StadiumAudio {
  constructor(){this.enabled=false;this.lastEvent=0;}
  async toggle(){
    if(!this.context){
      this.context=new AudioContext();this.master=this.context.createGain();this.master.gain.value=0;this.master.connect(this.context.destination);
      const buffer=this.context.createBuffer(1,this.context.sampleRate*3,this.context.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.4;
      const source=this.context.createBufferSource();source.buffer=buffer;source.loop=true;
      const filter=this.context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=550;this.crowd=this.context.createGain();this.crowd.gain.value=.09;source.connect(filter).connect(this.crowd).connect(this.master);source.start();
    }
    await this.context.resume();this.enabled=!this.enabled;this.master.gain.setTargetAtTime(this.enabled?.55:0,this.context.currentTime,.15);return this.enabled;
  }
  tone(frequency,duration,volume,type='sine'){
    const c=this.context,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(frequency,c.currentTime);g.gain.setValueAtTime(volume,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);o.connect(g).connect(this.master);o.start();o.stop(c.currentTime+duration);
  }
  update(events){
    const fresh=events.filter(e=>e.id>this.lastEvent);this.lastEvent=events.at(-1)?.id||0;
    if(!this.enabled)return;
    for(const e of fresh){
      if(e.type==='whistle')this.tone(2100,.18,.13);
      if(e.type==='snap'||e.type==='catch')this.tone(280,.065,.15,'triangle');
      if(e.type==='tackle'||e.type==='broken')this.tone(70,.2,.5,'triangle');
      if(['score','interception','fumble','contested'].includes(e.type)) {const now=this.context.currentTime;this.crowd.gain.cancelScheduledValues(now);this.crowd.gain.setTargetAtTime(e.type==='score'?.7:.4,now,.15);this.crowd.gain.setTargetAtTime(.09,now+2,1);if(e.type==='score'){this.tone(440,.6,.14,'triangle');this.tone(660,.8,.1,'triangle');}}
    }
  }
}
