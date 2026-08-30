/**
 * High-performance client service for website translation
 * Endpoint: http://localhost:8000/api/translate
 * Features: Local browser storage cache + Backend batching + Fast Timeout Fallback
 */

const BACKEND_URL = (import.meta as unknown as { env?: { VITE_TRANSLATION_API_URL?: string } }).env?.VITE_TRANSLATION_API_URL || 'http://localhost:8000';

// In-Memory Frontend Client Cache
const localCache = new Map<string, string>();

export interface TranslationRequestPayload {
  text?: string;
  texts?: string[];
  src_lang: string;
  tgt_lang: string;
  use_beam_search?: boolean;
}

export interface TranslationResponsePayload {
  success: boolean;
  src_lang: string;
  tgt_lang: string;
  translations: string[];
  model_used: string;
}

/**
 * High-speed single text translation (0ms on cache hit)
 */
export async function translateText(
  text: string,
  srcLang: string = 'eng_Latn',
  tgtLang: string = 'hin_Deva'
): Promise<string> {
  const cacheKey = `${srcLang}:${tgtLang}:${text ? text.trim() : text}`;
  if (localCache.has(cacheKey)) {
    return localCache.get(cacheKey)!;
  }

  const results = await translateBatch([text], srcLang, tgtLang);
  return results[0] || text;
}

/**
 * Batched translation for entire pages / DOM arrays (Optimized)
 */
export async function translateBatch(
  texts: string[],
  srcLang: string = 'eng_Latn',
  tgtLang: string = 'hin_Deva'
): Promise<string[]> {
  if (!texts || texts.length === 0) return [];

  const results: (string | null)[] = new Array(texts.length).fill(null);
  const uncachedIndices: number[] = [];
  const uncachedTexts: string[] = [];

  // Check local browser memory cache
  texts.forEach((txt, idx) => {
    const clean = txt ? txt.trim() : '';
    if (!clean) {
      results[idx] = '';
      return;
    }
    const key = `${srcLang}:${tgtLang}:${clean}`;
    if (localCache.has(key)) {
      results[idx] = localCache.get(key)!;
    } else {
      uncachedIndices.push(idx);
      uncachedTexts.push(clean);
    }
  });

  // If all strings were found in browser cache
  if (uncachedTexts.length === 0) {
    return results as string[];
  }

  // Send single batch request to backend with 2500ms AbortController timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const payload: TranslationRequestPayload = {
      texts: uncachedTexts,
      src_lang: srcLang,
      tgt_lang: tgtLang,
      use_beam_search: false // Fast greedy search
    };

    const response = await fetch(`${BACKEND_URL}/api/batch-translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Translation API HTTP ${response.status}`);
    }

    const data: TranslationResponsePayload = await response.json();

    data.translations.forEach((trans, i) => {
      const origIndex = uncachedIndices[i];
      const origText = uncachedTexts[i];
      const key = `${srcLang}:${tgtLang}:${origText}`;

      localCache.set(key, trans);
      results[origIndex] = trans;
    });

    return results as string[];
  } catch (error) {
    console.warn('Backend batch translation error/timeout, using fallback:', error);
    // Fallback logic: return clean text without delay
    uncachedIndices.forEach((origIdx, i) => {
      if (results[origIdx] === null) {
        results[origIdx] = uncachedTexts[i];
      }
    });
    return results as string[];
  }
}

/**
 * Checks if the translation backend service is healthy
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}
