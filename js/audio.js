// js/audio.js
// Motor de Audio Náutico Procedural con Web Audio API Nativa
(function () {
  let ctx = null;
  let masterGain = null;
  let currentVolume = 0.3;

  function isLocalStorageAvailable() {
    try {
      return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch (e) {
      return false;
    }
  }

  function getStoredMute() {
    if (!isLocalStorageAvailable()) return false;
    try {
      return localStorage.getItem('marejada_sound_muted') === 'true';
    } catch (e) {
      return false;
    }
  }

  function setStoredMute(val) {
    if (!isLocalStorageAvailable()) return;
    try {
      localStorage.setItem('marejada_sound_muted', val ? 'true' : 'false');
    } catch (e) {
      // Ignore storage errors
    }
  }

  let muted = getStoredMute();

  function getContext() {
    if (typeof window === 'undefined') return null;
    if (!ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        ctx = new AudioContext();
        masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(muted ? 0 : currentVolume, ctx.currentTime);
        masterGain.connect(ctx.destination);
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  // Desbloqueo automático en el primer gesto del usuario
  if (typeof window !== 'undefined') {
    ['click', 'touchstart', 'keydown'].forEach(evt => {
      window.addEventListener(evt, () => { getContext(); }, { once: true, passive: true });
    });
  }

  const AudioFX = {
    init() {
      return getContext();
    },
    isMuted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      setStoredMute(muted);
      if (masterGain && ctx) {
        masterGain.gain.setValueAtTime(muted ? 0 : currentVolume, ctx.currentTime);
      }
      return muted;
    },
    setVolume(val) {
      const clamped = Math.max(0, Math.min(1, typeof val === 'number' ? val : currentVolume));
      currentVolume = clamped;
      if (masterGain && ctx && !muted) {
        masterGain.gain.setValueAtTime(currentVolume, ctx.currentTime);
      }
    },
    getVolume() {
      return currentVolume;
    },
    play(name, param) {
      if (muted) return;
      const audioCtx = getContext();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;

      try {
        switch (name) {
          case 'ship_horn': {
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc1.type = 'sawtooth';
            osc2.type = 'triangle';
            osc1.frequency.setValueAtTime(110, now);
            osc2.frequency.setValueAtTime(114, now);
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.4, now + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(masterGain);
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 1.25);
            osc2.stop(now + 1.25);
            break;
          }
          case 'bell': {
            [880, 1760, 2640].forEach((freq, idx) => {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, now);
              gain.gain.setValueAtTime(0.3 / (idx + 1), now);
              gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
              osc.connect(gain);
              gain.connect(masterGain);
              osc.start(now);
              osc.stop(now + 1.5);
            });
            break;
          }
          case 'sonar_ping': {
            const freq = typeof param === 'number' && param > 0 ? param : 1200;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq * 0.8), now + 0.5);
            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.65);
            break;
          }
          case 'error_foghorn': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(75, now);
            osc.frequency.linearRampToValueAtTime(60, now + 0.4);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.55);
            break;
          }
          case 'podium_fanfare': {
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
            notes.forEach((freq, i) => {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(freq, now + i * 0.12);
              gain.gain.setValueAtTime(0.001, now + i * 0.12);
              gain.gain.linearRampToValueAtTime(0.3, now + i * 0.12 + 0.04);
              gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.8);
              osc.connect(gain);
              gain.connect(masterGain);
              osc.start(now + i * 0.12);
              osc.stop(now + i * 0.12 + 0.85);
            });
            break;
          }
          case 'bubble_tap': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.09);
            break;
          }
          default: {
            console.warn(`AudioFX: Sonido no reconocido "${name}"`);
            break;
          }
        }
      } catch (err) {
        console.error(`AudioFX error al reproducir "${name}":`, err);
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.AudioFX = AudioFX;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioFX;
  }
})();
