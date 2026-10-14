/**
 * Synthesised projector sounds (Web Audio API) — no audio files required.
 *
 * Rules:
 *  - The AudioContext is only created inside a user gesture (`unlock`).
 *  - A global mute is honoured by every sound, including music.
 *  - Looping beds (motor hum, fan, room tone) crossfade; they duck while music plays.
 *  - The context is suspended while the tab is hidden.
 */

export type SoundName =
  | "switch"
  | "carousel"
  | "slideIn"
  | "slideOut"
  | "focusTick"
  | "button"
  | "cord"
  | "drawer"
  | "lamp"
  | "film"
  | "rustle"
  | "flash"
  | "paper"
  | "hang";

class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bed: GainNode | null = null;
  private music: GainNode | null = null;
  private bedNodes: AudioScheduledSourceNode[] = [];
  private noiseBuffer: AudioBuffer | null = null;
  private enabled = true;
  private running = false;
  private musicPlaying = false;
  private lastTick = 0;
  private visibilityBound = false;

  get context() {
    return this.ctx;
  }

  /** Must be called from a user gesture handler. Safe to call repeatedly. */
  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.enabled ? 0.9 : 0;
      this.master.connect(this.ctx.destination);
      this.bed = this.ctx.createGain();
      this.bed.gain.value = 0;
      this.bed.connect(this.master);
      this.music = this.ctx.createGain();
      this.music.gain.value = 1;
      this.music.connect(this.master);
      this.noiseBuffer = this.makeNoise(2);
    }
    if (this.ctx.state === "suspended" && document.visibilityState === "visible") void this.ctx.resume();
    if (!this.visibilityBound) {
      this.visibilityBound = true;
      document.addEventListener("visibilitychange", () => {
        if (!this.ctx) return;
        if (document.visibilityState === "hidden") void this.ctx.suspend();
        else void this.ctx.resume();
      });
    }
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(on ? 0.9 : 0, this.ctx.currentTime, 0.05);
    }
  }

  isEnabled() {
    return this.enabled;
  }

  /** Destination for the Play section's music element. */
  musicDestination(): AudioNode | null {
    return this.music;
  }

  setMusicPlaying(playing: boolean) {
    this.musicPlaying = playing;
    this.updateBed();
  }

  /** Motor hum + fan + faint room tone. */
  startProjector(warmMs = 1500) {
    if (!this.ctx || !this.bed || this.running) return;
    this.running = true;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const rampTo = now + warmMs / 1000;

    // Motor: a warm 100 Hz tone (audible on laptop speakers, unlike a 50 Hz sine)
    const hum = ctx.createOscillator();
    hum.type = "triangle";
    hum.frequency.setValueAtTime(80, now);
    hum.frequency.linearRampToValueAtTime(100, rampTo);
    const humGain = ctx.createGain();
    humGain.gain.value = 0.035;
    hum.connect(humGain).connect(this.bed);
    const hum2 = ctx.createOscillator();
    hum2.type = "sine";
    hum2.frequency.setValueAtTime(120, now);
    hum2.frequency.linearRampToValueAtTime(150, rampTo);
    const hum2Gain = ctx.createGain();
    hum2Gain.gain.value = 0.012;
    hum2.connect(hum2Gain).connect(this.bed);

    // Fan: low, airy whoosh (no hiss) with a slow, gentle wobble like a real blade.
    const fan = this.noiseSource(true);
    const fanLp = ctx.createBiquadFilter();
    fanLp.type = "lowpass";
    fanLp.frequency.setValueAtTime(380, now);
    fanLp.frequency.linearRampToValueAtTime(900, rampTo);
    fanLp.Q.value = 0.4;
    const fanHp = ctx.createBiquadFilter();
    fanHp.type = "highpass";
    fanHp.frequency.value = 160;
    const fanGain = ctx.createGain();
    fanGain.gain.value = 0.06;
    const wobble = ctx.createOscillator();
    wobble.frequency.value = 0.35;
    const wobbleDepth = ctx.createGain();
    wobbleDepth.gain.value = 0.01;
    wobble.connect(wobbleDepth).connect(fanGain.gain);
    fan.connect(fanHp).connect(fanLp).connect(fanGain).connect(this.bed);

    // Room tone, barely there.
    const room = this.noiseSource(true);
    const roomLp = ctx.createBiquadFilter();
    roomLp.type = "lowpass";
    roomLp.frequency.value = 250;
    const roomGain = ctx.createGain();
    roomGain.gain.value = 0.01;
    room.connect(roomLp).connect(roomGain).connect(this.bed);

    hum.start();
    hum2.start();
    fan.start();
    wobble.start();
    room.start();
    this.bedNodes = [hum, hum2, fan, wobble, room];
    this.updateBed(warmMs / 1000);
  }

  stopProjector(coolMs = 1100) {
    if (!this.ctx || !this.bed || !this.running) return;
    this.running = false;
    const t = this.ctx.currentTime;
    this.bed.gain.cancelScheduledValues(t);
    this.bed.gain.setValueAtTime(this.bed.gain.value, t);
    this.bed.gain.linearRampToValueAtTime(0, t + coolMs / 1000);
    const nodes = this.bedNodes;
    this.bedNodes = [];
    nodes.forEach((n) => {
      try {
        n.stop(t + coolMs / 1000 + 0.05);
      } catch {
        /* already stopped */
      }
    });
  }

  private updateBed(rampS = 0.6) {
    if (!this.ctx || !this.bed || !this.running) return;
    const t = this.ctx.currentTime;
    const target = this.musicPlaying ? 0.2 : 1;
    this.bed.gain.cancelScheduledValues(t);
    this.bed.gain.setValueAtTime(this.bed.gain.value, t);
    this.bed.gain.linearRampToValueAtTime(target, t + rampS);
  }

  play(name: SoundName) {
    if (!this.ctx || !this.master || !this.enabled) return;
    const t = this.ctx.currentTime;
    switch (name) {
      case "switch":
        this.click(t, 2400, 0.35, 0.025);
        this.click(t + 0.012, 900, 0.25, 0.04);
        break;
      case "button":
        this.click(t, 1800, 0.18, 0.02);
        break;
      case "carousel":
        for (let i = 0; i < 6; i++) this.click(t + i * 0.07 + Math.random() * 0.01, 1400 + Math.random() * 300, 0.07, 0.015);
        this.motor(t, 0.42);
        break;
      case "slideIn":
        this.thunk(t, 140, 0.32);
        this.click(t + 0.02, 2000, 0.2, 0.02);
        break;
      case "slideOut":
        this.thunk(t, 220, 0.18);
        this.click(t, 1500, 0.12, 0.02);
        break;
      case "focusTick": {
        if (t - this.lastTick < 0.045) return;
        this.lastTick = t;
        this.click(t, 3200, 0.06, 0.01);
        break;
      }
      case "cord":
        for (let i = 0; i < 5; i++) this.click(t + i * 0.035, 2600 + i * 120, 0.05, 0.012);
        this.whoosh(t + 0.05, 0.5, 0.06);
        break;
      case "drawer":
        this.whoosh(t, 0.28, 0.12, 500);
        this.thunk(t + 0.26, 180, 0.12);
        break;
      case "lamp":
        this.click(t, 2200, 0.2, 0.02);
        break;
      case "film":
        this.whoosh(t, 0.18, 0.05, 1800);
        break;
      case "flash":
        this.click(t, 3000, 0.25, 0.03);
        this.whoosh(t + 0.02, 0.35, 0.05, 4000);
        break;
      case "hang":
        // soft creak of a headband on a nail
        this.thunk(t, 320, 0.05);
        this.click(t + 0.03, 1700, 0.04, 0.03);
        break;
      case "paper":
        this.whoosh(t, 0.25, 0.05, 1400);
        break;
      case "rustle":
        // dry leaves brushing: a few short, bright noise bursts
        for (let i = 0; i < 7; i++) this.whoosh(t + i * 0.045 + Math.random() * 0.03, 0.12 + Math.random() * 0.08, 0.035, 2600 + Math.random() * 1800);
        break;
    }
  }

  private makeNoise(seconds: number) {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  private noiseSource(loop = false) {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = loop;
    return src;
  }

  private click(t: number, freq: number, gain: number, dur: number) {
    const ctx = this.ctx!;
    const src = this.noiseSource();
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq;
    bp.Q.value = 2.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp).connect(g).connect(this.master!);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  private thunk(t: number, freq: number, gain: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.45, t + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(g).connect(this.master!);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  private motor(t: number, dur: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(70, t);
    osc.frequency.linearRampToValueAtTime(95, t + dur * 0.5);
    osc.frequency.linearRampToValueAtTime(60, t + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 320;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.035, t + 0.05);
    g.gain.linearRampToValueAtTime(0, t + dur);
    osc.connect(lp).connect(g).connect(this.master!);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private whoosh(t: number, dur: number, gain: number, freq = 900) {
    const ctx = this.ctx!;
    const src = this.noiseSource();
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(freq, t);
    bp.frequency.linearRampToValueAtTime(freq * 1.6, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + dur * 0.3);
    g.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(bp).connect(g).connect(this.master!);
    src.start(t);
    src.stop(t + dur + 0.05);
  }
}

export const audio = new AudioManager();
