export class NSDAudio {
  constructor() { this.context = null; this.engine = null; this.engineGain = null; this.nitro = null; this.nitroGain = null; }
  start() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!this.context) {
      this.context = new AudioCtx();
      this.engine = this.context.createOscillator();
      this.engine.type = "sawtooth";
      this.engine.frequency.value = 55;
      this.engineGain = this.context.createGain();
      this.engineGain.gain.value = 0.018;
      this.engine.connect(this.engineGain).connect(this.context.destination);
      this.engine.start();
      this.nitro = this.context.createOscillator();
      this.nitro.type = "triangle";
      this.nitro.frequency.value = 115;
      this.nitroGain = this.context.createGain();
      this.nitroGain.gain.value = 0;
      this.nitro.connect(this.nitroGain).connect(this.context.destination);
      this.nitro.start();
    }
    if (this.context.state === "suspended") this.context.resume();
  }
  setSpeed(speed) {
    if (!this.context || !this.engine) return;
    this.engine.frequency.setTargetAtTime(48 + Math.max(0,Math.min(speed,320))*1.15,this.context.currentTime,0.08);
    this.engineGain.gain.setTargetAtTime(speed > 1 ? 0.018 : 0.006,this.context.currentTime,0.1);
  }
  setNitro(active) {
    if (!this.context || !this.nitroGain) return;
    this.nitroGain.gain.setTargetAtTime(active ? 0.035 : 0,this.context.currentTime,0.06);
  }
  stop() {
    if (!this.context) return;
    this.engineGain.gain.setTargetAtTime(0,this.context.currentTime,0.08);
    this.nitroGain.gain.setTargetAtTime(0,this.context.currentTime,0.08);
  }
}
