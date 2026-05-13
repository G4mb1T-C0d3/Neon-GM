
type AudioState = 'EXPLORATION' | 'COMBAT' | 'NETRUN' | 'SILENT';

class AudioService {
  private ambient: HTMLAudioElement | null = null;
  private currentMode: AudioState = 'SILENT';
  private initialized = false;

  private tracks: Record<Exclude<AudioState, 'SILENT'>, string> = {
    EXPLORATION: 'https://assets.mixkit.co/music/preview/mixkit-night-city-740.mp3', // Moody synth
    COMBAT: 'https://assets.mixkit.co/music/preview/mixkit-driving-in-the-dark-742.mp3', // Faster synth
    NETRUN: 'https://assets.mixkit.co/music/preview/mixkit-hazy-after-hours-132.mp3' // Glichy/Ethereal
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.ambient = new Audio();
      this.ambient.loop = true;
      this.ambient.volume = 0.3;
    }
  }

  public init() {
    if (this.initialized) return;
    this.initialized = true;
    this.setMode('EXPLORATION');
  }

  public setMode(mode: AudioState) {
    if (!this.ambient || mode === this.currentMode) return;

    this.currentMode = mode;

    if (mode === 'SILENT') {
      this.ambient.pause();
      return;
    }

    const wasPlaying = !this.ambient.paused;
    this.ambient.src = this.tracks[mode];
    this.ambient.load();
    
    // We only play if it was already playing or initialized by user gesture
    if (wasPlaying || this.initialized) {
      this.ambient.play().catch(e => console.warn('Audio play failed:', e));
    }
  }

  public toggleMute() {
    if (this.ambient) {
      this.ambient.muted = !this.ambient.muted;
    }
  }

  public playSFX(type: 'CLICK' | 'ERROR' | 'SUCCESS' | 'DICE') {
    const sfx = new Audio();
    const urls = {
        CLICK: 'https://assets.mixkit.co/sfx/preview/mixkit-digital-quick-scan-2566.mp3',
        ERROR: 'https://assets.mixkit.co/sfx/preview/mixkit-computer-beep-alert-2303.mp3',
        SUCCESS: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3',
        DICE: 'https://assets.mixkit.co/sfx/preview/mixkit-dice-dropping-and-rolling-on-table-2035.mp3'
    };
    sfx.src = urls[type];
    sfx.volume = 0.4;
    sfx.play().catch(() => {});
  }
}

export const audioService = new AudioService();
