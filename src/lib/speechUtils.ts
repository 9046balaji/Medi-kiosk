/**
 * Speech Utils for MediKiosk — Hybrid Neural TTS & Browser Fallback Engine
 * Primary: AI4Bharat Indic Parler-TTS (Neural 20-Language Speech Synthesis, port 8002)
 * Fallback: Browser Web Speech API (SpeechSynthesisUtterance)
 */

import { playNeuralTts, stopNeuralTts } from './ttsApi';

// Language code to Web Speech BCP-47 voice locale mapping (Fallback)
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
  sanskrit: 'hi-IN',
  assamese: 'bn-IN',
  odia: 'hi-IN',
  nepali: 'hi-IN'
};

let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Speaks text using AI4Bharat Indic Parler-TTS with browser fallback.
 */
export async function speakText(text: string, langKey: string = 'english', rate: number = 0.9): Promise<void> {
  if (!text || text.trim() === '') return;

  // Stop any active speech (both neural & browser)
  stopSpeech();

  // 1. Try Neural Indic Parler-TTS (FastAPI backend on port 8002)
  try {
    const success = await playNeuralTts(text, langKey);
    if (success) return; // Neural TTS audio successfully played!
  } catch {
    // Fall through to browser fallback
  }

  // 2. Fallback to browser SpeechSynthesis API
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis API not supported in this browser.');
    return;
  }

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
 * Stops any ongoing audio speech (both neural & browser)
 */
export function stopSpeech(): void {
  stopNeuralTts();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

/**
 * Checks if speech is currently playing
 */
export function isSpeaking(): boolean {
  return ('speechSynthesis' in window && window.speechSynthesis.speaking);
}
