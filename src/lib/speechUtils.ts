/**
 * Web Speech API Text-to-Speech (TTS) Engine for MediKiosk
 * Provides audio voice playback across 22 Indic languages and English
 */

// Language code to Web Speech BCP-47 voice locale mapping
const LOCALE_MAP: Record<string, string> = {
  english: 'en-IN',
  hindi: 'hi-IN',
  tamil: 'ta-IN',
  telugu: 'te-IN',
  marathi: 'mr-IN',
  bengali: 'bn-IN',
  kannada: 'kn-IN',
  malayalam: 'ml-IN',
  gujarati: 'gu-IN',
  punjabi: 'pa-IN',
  urdu: 'ur-IN',
  sanskrit: 'hi-IN'
};

let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Speaks text using browser SpeechSynthesis API
 */
export function speakText(text: string, langKey: string = 'english', rate: number = 0.9): void {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis API not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (!text || text.trim() === '') return;

  const locale = LOCALE_MAP[langKey.toLowerCase()] || 'en-IN';
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  utterance.rate = rate;
  utterance.pitch = 1.0;

  // Try finding best matching voice
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find((v) => v.lang === locale || v.lang.startsWith(locale.split('-')[0]));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

/**
 * Stops any ongoing audio speech
 */
export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

/**
 * Checks if speech is currently playing
 */
export function isSpeaking(): boolean {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking;
}
