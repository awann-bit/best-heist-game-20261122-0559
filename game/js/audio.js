// Audio: tiny WebAudio cues, all synthesized — no sound files.
// A soft tick while seen, a chime for loot, a low sting when caught, and a
// little arpeggio for the getaway. Muted until the first user gesture.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.lastTick = 0;
  }

  /** Create the audio context on the first gesture (browsers require it). */
  unlock() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, seconds, type, gainValue, when = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainValue, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.05);
  }

  pickup() {
    this.tone(880, 0.12, 'sine', 0.12);
    this.tone(1318, 0.18, 'sine', 0.1, 0.08);
  }

  emp() {
    this.tone(220, 0.3, 'sawtooth', 0.08);
    this.tone(110, 0.4, 'square', 0.05, 0.05);
  }

  noise() {
    this.tone(660, 0.1, 'triangle', 0.1);
    this.tone(990, 0.1, 'triangle', 0.08, 0.09);
  }

  spottedTick(now) {
    if (now - this.lastTick < 0.5) return;
    this.lastTick = now;
    this.tone(1200, 0.06, 'square', 0.05);
  }

  caught() {
    this.tone(196, 0.5, 'sawtooth', 0.14);
    this.tone(147, 0.7, 'sawtooth', 0.12, 0.15);
  }

  win() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.22, 'sine', 0.11, i * 0.11));
  }
}
