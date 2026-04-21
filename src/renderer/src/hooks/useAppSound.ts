import successSfx from '../assets/sounds/success.mp3';
import errorSfx from '../assets/sounds/error.mp3';
import alertSfx from '../assets/sounds/alert.mp3';

type SoundEffect = 'success' | 'error' | 'alert';

// Senior Note: Pre-loading the audio files prevents the 
// delay when playing the sound for the first time.
const soundMap: Record<SoundEffect, HTMLAudioElement> = {
  success: new Audio(successSfx),
  error: new Audio(errorSfx),
  alert: new Audio(alertSfx)
};

export const useAppSound = () => {
  const playSound = (effect: SoundEffect, volume: number = 1.0) => {
    const audio = soundMap[effect];
    
    // Reset sound to start in case it's already playing
    audio.currentTime = 0;
    audio.volume = volume;
    
    // UI sounds should never block the main thread or crash the app
    audio.play().catch((err) => {
      console.warn(`Audio playback blocked by browser/system: ${err.message}`);
    });
  };

  return { playSound };
};