// Lightweight event-driven Web Audio. No external samples or autoplay permissions required.
export class MatchAudio {
  constructor() { this.enabled = false; this.context = null; this.last = {}; }
  async toggle() {
    if (!this.context) {
      this.context = new AudioContext(); this.master = this.context.createGain(); this.master.gain.value = 0.45; this.master.connect(this.context.destination);
      this.createAmbience();
    }
    this.enabled = !this.enabled;
    if (this.enabled) await this.context.resume();
    else await this.context.suspend();
    return this.enabled;
  }
  createAmbience() {
    const c = this.context, buffer = c.createBuffer(1, c.sampleRate * 3, c.sampleRate), data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.2;
    const source = c.createBufferSource(); source.buffer = buffer; source.loop = true;
    const filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 600;
    this.ambient = c.createGain(); this.ambient.gain.value = 0.055;
    source.connect(filter).connect(this.ambient).connect(this.master); source.start();
  }
  tone(frequency, end, duration, volume, type = 'sine', pan = 0) {
    const c = this.context, now = c.currentTime, osc = c.createOscillator(), gain = c.createGain(), stereo = c.createStereoPanner();
    osc.type = type; osc.frequency.setValueAtTime(frequency, now); osc.frequency.exponentialRampToValueAtTime(Math.max(1, end), now + duration);
    gain.gain.setValueAtTime(volume, now); gain.gain.exponentialRampToValueAtTime(0.001, now + duration); stereo.pan.value = pan;
    osc.connect(gain).connect(stereo).connect(this.master); osc.start(); osc.stop(now + duration);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); stereo.disconnect(); };
  }
  consume(sim) {
    const events = sim.audioEvents.splice(0);
    if (!this.enabled || !this.context) return;
    for (const event of events) {
      const now = this.context.currentTime;
      if (now - (this.last[event.type] ?? -100) < 0.07) continue;
      this.last[event.type] = now; const pan = Math.max(-0.8, Math.min(0.8, event.x / 18));
      switch (event.type) {
        case 'bounce': this.tone(135, 52, 0.12, 0.3, 'sine', pan); break;
        case 'rim': this.tone(640, 190, 0.24, 0.12, 'triangle', pan); break;
        case 'board': this.tone(180, 70, 0.15, 0.16, 'triangle', pan); break;
        case 'whistle': this.tone(2500, 2900, 0.4, 0.045, 'sine'); break;
        case 'buzzer': this.tone(145, 143, 0.65, 0.12, 'sawtooth'); break;
        case 'swish': this.tone(700, 170, 0.16, 0.035, 'triangle', pan); break;
        case 'crowd': this.ambient.gain.setTargetAtTime(0.36, now, 0.3); this.ambient.gain.setTargetAtTime(0.055, now + 1.5, 1); break;
      }
    }
    if (sim.phase === 'live' && sim.players.some(p => p.contact > 0.2) && this.context.currentTime - (this.last.squeak || 0) > 1.5) {
      this.last.squeak = this.context.currentTime; this.tone(1100, 1800, 0.1, 0.014, 'sine');
    }
  }
}
