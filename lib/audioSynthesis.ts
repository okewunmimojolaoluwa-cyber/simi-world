// Premium Web Audio API Sound Synthesizer
// Clean, zero-external-dependency tactile sound design for interactive puzzles

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft tactile click for dials and buttons
  click() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // Heavy mechanical tumbler tick
  tick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  // Musical note chime for celestial music box
  note(frequency: number, duration: number = 0.8) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    // Warm chime envelope
    gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Brass lock release chord
  unlockChord() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const chords = [261.63, 329.63, 392.00, 523.25]; // C major harmonious chord
    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0.18, this.ctx!.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.1 + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.1);
      osc.stop(this.ctx!.currentTime + idx * 0.1 + 1.8);
    });
  }

  // Subtle ambient room tone / warmth
  startRoomTone() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low 55Hz warm room drone

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 3.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      // Fade out and stop after 20 seconds to be gentle
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime + 16);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 20);
      osc.stop(this.ctx.currentTime + 20);
    } catch {
      // AudioContext fallback
    }
  }

  // Wooden drawer slide sound
  drawerSlide() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(75, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  // Vintage music box melody sequence
  playMusicBoxMelody() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // Sweet, charming birthday-like melody notes (C5, D5, E5, G5, E5, C5)
    const notes = [
      { f: 523.25, t: 0.0 },
      { f: 587.33, t: 0.35 },
      { f: 659.25, t: 0.70 },
      { f: 783.99, t: 1.05 },
      { f: 659.25, t: 1.50 },
      { f: 523.25, t: 1.95 },
    ];

    notes.forEach(({ f, t }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx!.currentTime + t);

      gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + t + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + t);
      osc.stop(this.ctx!.currentTime + t + 0.8);
    });
  }

  // Ribbon slide / unwrap whoosh
  ribbonSlide() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }

  // Resonant ambient chime on the big reveal
  reveal() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // Warm C major 7th / 9th harmonic swell
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.18, this.ctx!.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.12 + 3.8);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.12);
      osc.stop(this.ctx!.currentTime + idx * 0.12 + 3.8);
    });
  }
}

export const sounds = new SoundEngine();
