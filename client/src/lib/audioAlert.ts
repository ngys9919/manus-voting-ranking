/**
 * Audio alert utility for notification sounds
 * Provides methods to play notification sounds with user preference support
 */

// Create a simple notification sound using Web Audio API
function createNotificationSound(): AudioBuffer {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const sampleRate = audioContext.sampleRate;
  const duration = 0.5; // 500ms
  const audioBuffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const data = audioBuffer.getChannelData(0);

  // Create a pleasant notification sound using sine waves
  // Frequency sweep: 800Hz -> 1200Hz
  const startFreq = 800;
  const endFreq = 1200;

  for (let i = 0; i < audioBuffer.length; i++) {
    const t = i / sampleRate;
    const progress = t / duration;
    const freq = startFreq + (endFreq - startFreq) * progress;
    const phase = (2 * Math.PI * freq * t) % (2 * Math.PI);

    // Apply envelope to avoid clicks
    const envelope = Math.sin((t / duration) * Math.PI);
    data[i] = Math.sin(phase) * envelope * 0.3;
  }

  return audioBuffer;
}

// Cache for the notification sound
let cachedAudioBuffer: AudioBuffer | null = null;

/**
 * Play a notification sound
 * @param enabled - Whether to play the sound (respects user preference)
 */
export function playNotificationSound(enabled: boolean = true): void {
  if (!enabled) return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create or use cached audio buffer
    if (!cachedAudioBuffer) {
      cachedAudioBuffer = createNotificationSound();
    }

    // Create source and play
    const source = audioContext.createBufferSource();
    source.buffer = cachedAudioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  } catch (error) {
    console.error("Failed to play notification sound:", error);
  }
}

/**
 * Check if audio context is supported
 */
export function isAudioSupported(): boolean {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
}

/**
 * Get user's notification sound preference from localStorage
 */
export function getNotificationSoundPreference(): boolean {
  const stored = localStorage.getItem("notificationSoundEnabled");
  // Default to true if not set
  return stored === null ? true : stored === "true";
}

/**
 * Save user's notification sound preference to localStorage
 */
export function setNotificationSoundPreference(enabled: boolean): void {
  localStorage.setItem("notificationSoundEnabled", String(enabled));
}
