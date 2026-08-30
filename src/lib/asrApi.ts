/**
 * asrApi.ts — Frontend client for MediKiosk IndicConformer 600M ASR Service
 * Endpoint: http://localhost:8001
 * - POST /api/transcribe          → CTC (~25ms), real-time
 * - POST /api/transcribe-accurate → RNNT (~65ms), higher accuracy
 * - GET  /api/health              → health + model status
 */

const ASR_BASE_URL =
  (import.meta as unknown as { env?: { VITE_ASR_API_URL?: string } }).env
    ?.VITE_ASR_API_URL ?? 'http://localhost:8001';

export interface ASRResult {
  success: boolean;
  language_id: string;
  transcript: string;
  duration_seconds: number;
  is_silent: boolean;
  latency_ms: number;
  model_name: string;
  decoder: 'ctc' | 'rnnt';
}

export interface ASRHealthResult {
  status: 'ok' | 'initializing' | 'offline';
  device: string;
  model_loaded: boolean;
  model_name: string;
}

// -------------------------------------------------------------------------
// Language code mapper: app Language enum → ASR ISO code
// NOTE: 'english' is intentionally NOT in this map — English speech is
// handled by the browser's native SpeechRecognition API in the frontend,
// because IndicConformer 600M only covers the 22 Indian languages.
// -------------------------------------------------------------------------
const LANG_TO_ASR: Record<string, string> = {
  hindi: 'hi',
  assamese: 'as',
  bengali: 'bn',
  bodo: 'brx',
  dogri: 'doi',
  gujarati: 'gu',
  kannada: 'kn',
  kashmiri: 'ks',
  konkani: 'kok',
  maithili: 'mai',
  malayalam: 'ml',
  manipuri: 'mni',
  marathi: 'mr',
  nepali: 'ne',
  odia: 'or',
  punjabi: 'pa',
  sanskrit: 'sa',
  santali: 'sat',
  sindhi: 'sd',
  tamil: 'ta',
  telugu: 'te',
  urdu: 'ur',
};

export function getAsrLangCode(appLang: string): string {
  return LANG_TO_ASR[appLang.toLowerCase()] ?? 'hi';
}

// -------------------------------------------------------------------------
// Transcribe audio blob (real mic recording) via backend ASR
// -------------------------------------------------------------------------
export async function transcribeAudio(
  audioBlob: Blob,
  appLang: string,
  mode: 'ctc' | 'rnnt' = 'ctc'
): Promise<ASRResult> {
  const langCode = getAsrLangCode(appLang);
  const endpoint = mode === 'rnnt' ? '/api/transcribe-accurate' : '/api/transcribe';

  const form = new FormData();
  form.append('file', audioBlob, 'recording.wav');
  form.append('lang_code', langCode);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000); // 10s timeout

  try {
    const response = await fetch(`${ASR_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`ASR API error ${response.status}: ${err}`);
    }

    return (await response.json()) as ASRResult;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('[ASR] transcription failed:', error);
    return {
      success: false,
      language_id: langCode,
      transcript: '',
      duration_seconds: 0,
      is_silent: false,
      latency_ms: 0,
      model_name: 'offline',
      decoder: mode,
    };
  }
}

// -------------------------------------------------------------------------
// Health check
// -------------------------------------------------------------------------
export async function checkAsrHealth(): Promise<ASRHealthResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${ASR_BASE_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) return (await res.json()) as ASRHealthResult;
    return { status: 'offline', device: 'unknown', model_loaded: false, model_name: '' };
  } catch {
    return { status: 'offline', device: 'unknown', model_loaded: false, model_name: '' };
  }
}
