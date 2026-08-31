/**
 * ttsApi.ts — Frontend client service for MediKiosk Indic Parler-TTS Microservice
 * Endpoint: http://localhost:8002
 * Features: 20-Language Neural Speech Synthesis + HTML5 Audio playback + Speaker Voice mapping
 */

const TTS_BASE_URL =
  (import.meta as unknown as { env?: { VITE_TTS_API_URL?: string } }).env
    ?.VITE_TTS_API_URL ?? 'http://localhost:8002';

export interface TTSHealthResult {
  status: 'ok' | 'initializing' | 'offline';
  device: string;
  model_loaded: boolean;
  sample_rate: number;
  model_name: string;
}

export interface SpeakerInfo {
  default: string;
  female: string;
  male: string;
  all: string[];
}

// Language to default speaker voice map
export const DEFAULT_SPEAKERS: Record<string, string> = {
  english: 'Mary',
  hindi: 'Divya',
  tamil: 'Jaya',
  telugu: 'Lalitha',
  bengali: 'Aditi',
  marathi: 'Sunita',
  gujarati: 'Neha',
  kannada: 'Anu',
  malayalam: 'Anjali',
  assamese: 'Sita',
  punjabi: 'Gurpreet',
  sanskrit: 'Aryan',
  odia: 'Debjani',
  bodo: 'Maya',
  dogri: 'Karan',
  nepali: 'Amrita',
  manipuri: 'Laishram',
  sindhi: 'Rohit',
  santali: 'Maya',
};

// Global audio player handle for stopping ongoing speech
let activeAudioElement: HTMLAudioElement | null = null;

/**
 * Checks if the TTS microservice backend is healthy
 */
export async function checkTtsHealth(): Promise<TTSHealthResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${TTS_BASE_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) return (await res.json()) as TTSHealthResult;
    return { status: 'offline', device: 'unknown', model_loaded: false, sample_rate: 24000, model_name: '' };
  } catch {
    return { status: 'offline', device: 'unknown', model_loaded: false, sample_rate: 24000, model_name: '' };
  }
}

/**
 * Fetches neural TTS audio Blob (24kHz WAV) from the backend
 */
export async function fetchTtsAudioBlob(
  text: string,
  langKey: string = 'english',
  speaker?: string,
  speed: 'slow' | 'normal' | 'fast' = 'normal'
): Promise<Blob | null> {
  if (!text || text.trim() === '') return null;

  const lang = langKey.toLowerCase();
  const selectedSpeaker = speaker || DEFAULT_SPEAKERS[lang] || 'Divya';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for synthesis

    const response = await fetch(`${TTS_BASE_URL}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        lang_key: lang,
        speaker: selectedSpeaker,
        gender: 'female',
        speed: speed,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[TTS] Backend returned HTTP ${response.status}`);
      return null;
    }

    return await response.blob();
  } catch (error) {
    console.warn('[TTS] Synthesis request failed or timed out:', error);
    return null;
  }
}

/**
 * Synthesizes and plays neural TTS audio in browser.
 * Returns Promise resolving true on success, false if offline/fallback needed.
 */
export async function playNeuralTts(
  text: string,
  langKey: string = 'english',
  speed: 'slow' | 'normal' | 'fast' = 'normal'
): Promise<boolean> {
  // Stop any active audio playback
  stopNeuralTts();

  const blob = await fetchTtsAudioBlob(text, langKey, undefined, speed);
  if (!blob) return false;

  return new Promise((resolve) => {
    try {
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      activeAudioElement = audio;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        activeAudioElement = null;
        resolve(true);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        activeAudioElement = null;
        resolve(false);
      };

      audio.play().catch((err) => {
        console.warn('[TTS] HTML5 Audio play error:', err);
        URL.revokeObjectURL(audioUrl);
        activeAudioElement = null;
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

/**
 * Stops any active neural TTS audio playback
 */
export function stopNeuralTts(): void {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.currentTime = 0;
    activeAudioElement = null;
  }
}
