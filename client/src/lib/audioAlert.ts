/**
 * Audio alert utility for notification sounds
 * Provides methods to play notification sounds with user preference support
 */

export type SoundStyle = "bell" | "chime" | "beep" | "ping" | "ding";
export type NotificationCategory = "achievement" | "challenge" | "ranking" | "streak" | "general";

// Create a bell sound using Web Audio API
function createBellSound(): AudioBuffer {
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

// Create a chime sound (two-note harmonic)
function createChimeSound(): AudioBuffer {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const sampleRate = audioContext.sampleRate;
  const duration = 0.6; // 600ms
  const audioBuffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const data = audioBuffer.getChannelData(0);

  // Create a two-note chime: 600Hz then 900Hz
  for (let i = 0; i < audioBuffer.length; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // First note (600Hz) for first half, second note (900Hz) for second half
    const freq = progress < 0.5 ? 600 : 900;
    const phase = (2 * Math.PI * freq * t) % (2 * Math.PI);

    // Apply envelope
    const envelope = Math.sin((t / duration) * Math.PI);
    data[i] = Math.sin(phase) * envelope * 0.3;
  }

  return audioBuffer;
}

// Create a beep sound (short, sharp)
function createBeepSound(): AudioBuffer {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const sampleRate = audioContext.sampleRate;
  const duration = 0.3; // 300ms - shorter than others
  const audioBuffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const data = audioBuffer.getChannelData(0);

  // Create a simple beep at 1000Hz
  for (let i = 0; i < audioBuffer.length; i++) {
    const t = i / sampleRate;
    const phase = (2 * Math.PI * 1000 * t) % (2 * Math.PI);

    // Sharp envelope for beep effect
    const envelope = Math.sin((t / duration) * Math.PI);
    data[i] = Math.sin(phase) * envelope * 0.35;
  }

  return audioBuffer;
}

// Create a ping sound (high frequency)
function createPingSound(): AudioBuffer {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const sampleRate = audioContext.sampleRate;
  const duration = 0.4; // 400ms
  const audioBuffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const data = audioBuffer.getChannelData(0);

  // Create a ping sound with frequency sweep up (1200Hz -> 1800Hz)
  for (let i = 0; i < audioBuffer.length; i++) {
    const t = i / sampleRate;
    const progress = t / duration;
    const freq = 1200 + 600 * progress; // Sweep from 1200Hz to 1800Hz
    const phase = (2 * Math.PI * freq * t) % (2 * Math.PI);

    // Envelope with quick attack
    const envelope = Math.sin((t / duration) * Math.PI);
    data[i] = Math.sin(phase) * envelope * 0.25;
  }

  return audioBuffer;
}

// Create a ding sound (resonant, pleasant)
function createDingSound(): AudioBuffer {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const sampleRate = audioContext.sampleRate;
  const duration = 0.8; // 800ms - longer for resonance
  const audioBuffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const data = audioBuffer.getChannelData(0);

  // Create a ding with two harmonics (500Hz + 750Hz)
  for (let i = 0; i < audioBuffer.length; i++) {
    const t = i / sampleRate;
    const phase1 = (2 * Math.PI * 500 * t) % (2 * Math.PI);
    const phase2 = (2 * Math.PI * 750 * t) % (2 * Math.PI);

    // Slow decay envelope
    const envelope = Math.exp(-2 * t) * Math.sin((t / duration) * Math.PI);
    data[i] = (Math.sin(phase1) * 0.6 + Math.sin(phase2) * 0.4) * envelope * 0.2;
  }

  return audioBuffer;
}

// Cache for the notification sounds
const soundCache: Record<SoundStyle, AudioBuffer | null> = {
  bell: null,
  chime: null,
  beep: null,
  ping: null,
  ding: null,
};

/**
 * Play a notification sound
 * @param enabled - Whether to play the sound (respects user preference)
 * @param style - The sound style to play
 */
export function playNotificationSound(enabled: boolean = true, style: SoundStyle = "bell"): void {
  if (!enabled) return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Get or create the sound buffer
    let audioBuffer = soundCache[style];
    if (!audioBuffer) {
      switch (style) {
        case "bell":
          audioBuffer = createBellSound();
          break;
        case "chime":
          audioBuffer = createChimeSound();
          break;
        case "beep":
          audioBuffer = createBeepSound();
          break;
        case "ping":
          audioBuffer = createPingSound();
          break;
        case "ding":
          audioBuffer = createDingSound();
          break;
        default:
          audioBuffer = createBellSound();
      }
      soundCache[style] = audioBuffer;
    }

    // Create source and play
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
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

/**
 * Get user's selected notification sound style from localStorage
 */
export function getNotificationSoundStyle(): SoundStyle {
  const stored = localStorage.getItem("notificationSoundStyle");
  const validStyles: SoundStyle[] = ["bell", "chime", "beep", "ping", "ding"];
  return (validStyles.includes(stored as SoundStyle) ? stored : "bell") as SoundStyle;
}

/**
 * Save user's selected notification sound style to localStorage
 */
export function setNotificationSoundStyle(style: SoundStyle): void {
  localStorage.setItem("notificationSoundStyle", style);
}

/**
 * Get all available sound styles
 */
export function getAvailableSoundStyles(): Array<{ value: SoundStyle; label: string; description: string }> {
  return [
    { value: "bell", label: "Bell", description: "Classic bell sound (800Hz to 1200Hz)" },
    { value: "chime", label: "Chime", description: "Two-note harmonic chime" },
    { value: "beep", label: "Beep", description: "Short, sharp beep (1000Hz)" },
    { value: "ping", label: "Ping", description: "High-frequency ping (1200Hz to 1800Hz)" },
    { value: "ding", label: "Ding", description: "Resonant, pleasant ding" },
  ];
}


/**
 * Get all available notification categories
 */
export function getAvailableCategories(): Array<{ value: NotificationCategory; label: string; description: string }> {
  return [
    { value: "achievement", label: "Achievements", description: "When you earn badges or milestones" },
    { value: "challenge", label: "Challenges", description: "When challenges are completed or updated" },
    { value: "ranking", label: "Rankings", description: "When you reach top rankings or leaderboards" },
    { value: "streak", label: "Streaks", description: "When you reach voting streak milestones" },
    { value: "general", label: "General", description: "Other notifications" },
  ];
}

/**
 * Get user's notification sound preference for a specific category from localStorage
 */
export function getCategorySoundPreference(category: NotificationCategory): SoundStyle {
  const stored = localStorage.getItem(`notificationSound_${category}`);
  return (stored as SoundStyle) || getNotificationSoundStyle();
}

/**
 * Save user's notification sound preference for a specific category to localStorage
 */
export function setCategorySoundPreference(category: NotificationCategory, style: SoundStyle): void {
  localStorage.setItem(`notificationSound_${category}`, style);
}

/**
 * Get all category sound preferences
 */
export function getAllCategorySoundPreferences(): Record<NotificationCategory, SoundStyle> {
  const categories: NotificationCategory[] = ["achievement", "challenge", "ranking", "streak", "general"];
  const preferences: Record<NotificationCategory, SoundStyle> = {} as any;

  categories.forEach((category) => {
    preferences[category] = getCategorySoundPreference(category);
  });

  return preferences;
}

/**
 * Reset all category sound preferences to default
 */
export function resetCategorySoundPreferences(): void {
  const categories: NotificationCategory[] = ["achievement", "challenge", "ranking", "streak", "general"];
  categories.forEach((category) => {
    localStorage.removeItem(`notificationSound_${category}`);
  });
}
