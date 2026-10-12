// One audio context, quiet tones and no persistent oscillator connections.
class AudioFeedback {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lastTap = 0;
  private tone(frequency: number, duration: number, offset = 0, end = frequency, type: OscillatorType = 'sine') {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx(); this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => {});
      const now = this.ctx.currentTime + offset;
      const oscillator = this.ctx.createOscillator(), gain = this.ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(end, now + duration);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.055, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      oscillator.connect(gain); gain.connect(this.master!);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(now); oscillator.stop(now + duration);
    } catch { /* Audio never interrupts a game. */ }
  }
  click() { const now = performance.now(); if (now - this.lastTap < 45) return; this.lastTap = now; this.tone(800, 0.035, 0, 180); }
  pop() { this.tone(400, 0.055, 0, 750); }
  success() { this.tone(587.33, 0.16); this.tone(880, 0.2, 0.06); }
  error() { this.tone(200, 0.12, 0, 140, 'triangle'); }
  fanfare() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.3, i * 0.07)); }
}
export const sound = new AudioFeedback();
