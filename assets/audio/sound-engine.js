
export class NSDAudio {
  constructor() {
    this.context = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.nitroOsc = null;
    this.nitroGain = null;
  }

  start() {
    if (this.context) {
      this.context.resume();
      return;
    }

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    this.context = new AudioContextClass();

    this.engineOsc = this.context.createOscillator();
    this.engineGain = this.context.createGain();

    this.engineOsc.type = "sawtooth";
    this.engineOsc.frequency.value = 65;
    this.engineGain.gain.value = 0.025;

    this.engineOsc.connect(this.engineGain);
    this.engineGain.connect(this.context.destination);
    this.engineOsc.start();

    this.nitroOsc = this.context.createOscillator();
    this.nitroGain = this.context.createGain();

    this.nitroOsc.type = "sawtooth";
    this.nitroOsc.frequency.value = 110;
    this.nitroGain.gain.value = 0;

    this.nitroOsc.connect(this.nitroGain);
    this.nitroGain.connect(this.context.destination);
    this.nitroOsc.start();
  }

  setSpeed(speed) {
    if (!this.context) return;

    const frequency = 55 + Math.min(speed, 300) * 1.4;

    this.engineOsc.frequency.setTargetAtTime(
      frequency,
      this.context.currentTime,
      0.08
    );
  }

  nitro(active) {
    if (!this.context) return;

    this.nitroGain.gain.setTargetAtTime(
      active ? 0.045 : 0,
      this.context.currentTime,
      0.08
    );
  }

  brake() {
    if (!this.context) return;

    this.engineOsc.frequency.setTargetAtTime(
      45,
      this.context.currentTime,
      0.1
    );
  }

  stop() {
    if (!this.context) return;

    this.engineGain.gain.setTargetAtTime(
      0,
      this.context.currentTime,
      0.1
    );

    this.nitroGain.gain.setTargetAtTime(
      0,
      this.context.currentTime,
      0.1
    );
  }
      }
           
