import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useMediKiosk } from './MediKioskContext';
import { getFloresCode } from '../lib/languageMap';
import { translateBatch } from '../lib/translationApi';

interface TranslationContextType {
  currentLang: string;
  floresCode: string;
  t: (text: string) => string;
  translateAsync: (text: string) => Promise<string>;
  translateBatchAsync: (texts: string[]) => Promise<string[]>;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Persistent LocalStorage cache key
const CACHE_KEY_STORAGE = 'medikiosk_i18n_cache_v3';

const loadPersistedCache = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(CACHE_KEY_STORAGE);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

const savePersistedCache = (cache: Record<string, string>) => {
  try {
    localStorage.setItem(CACHE_KEY_STORAGE, JSON.stringify(cache));
  } catch (e) {
    // Ignore quota errors
  }
};

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useMediKiosk();
  const floresCode = getFloresCode(language);
  const [translationsCache, setTranslationsCache] = useState<Record<string, string>>(loadPersistedCache);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // In-memory ref map for instant synchronous access avoiding stale React state closures
  const cacheRef = useRef<Record<string, string>>(translationsCache);

  useEffect(() => {
    cacheRef.current = translationsCache;
  }, [translationsCache]);

  // Batching Queue Ref for 15ms micro-batching across <T /> components
  const batchQueueRef = useRef<{ text: string; resolve: (val: string) => void }[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateCache = useCallback((newEntries: Record<string, string>) => {
    // Update ref immediately for zero-latency synchronous reads
    cacheRef.current = { ...cacheRef.current, ...newEntries };
    setTranslationsCache((prev) => {
      const updated = { ...prev, ...newEntries };
      savePersistedCache(updated);
      return updated;
    });
  }, []);

  // Synchronous dictionary lookup or raw text
  const t = useCallback(
    (text: string): string => {
      if (!text || language === 'english') return text;
      const key = `${floresCode}:${text}`;
      return cacheRef.current[key] || text;
    },
    [floresCode, language]
  );

  // Flush queued batch translation request in a single HTTP call
  const processBatchQueue = useCallback(async () => {
    if (batchQueueRef.current.length === 0 || language === 'english') return;

    const currentBatch = [...batchQueueRef.current];
    batchQueueRef.current = [];
    batchTimeoutRef.current = null;

    const uniqueTexts = Array.from(new Set(currentBatch.map((item) => item.text)));
    const uncachedTexts = uniqueTexts.filter((txt) => !cacheRef.current[`${floresCode}:${txt}`]);

    let newCacheEntries: Record<string, string> = {};

    if (uncachedTexts.length > 0) {
      try {
        setIsTranslating(true);
        const results = await translateBatch(uncachedTexts, 'eng_Latn', floresCode);
        uncachedTexts.forEach((txt, idx) => {
          newCacheEntries[`${floresCode}:${txt}`] = results[idx] || txt;
        });
        updateCache(newCacheEntries);
      } catch (err) {
        console.warn('Batch translation error:', err);
      } finally {
        setIsTranslating(false);
      }
    }

    // Resolve promises immediately using updated cacheRef + newCacheEntries
    currentBatch.forEach((item) => {
      const key = `${floresCode}:${item.text}`;
      const resolvedVal = newCacheEntries[key] || cacheRef.current[key] || item.text;
      item.resolve(resolvedVal);
    });
  }, [floresCode, language, updateCache]);

  // Async translation helper with micro-batching
  const translateAsync = useCallback(
    (text: string): Promise<string> => {
      if (!text || language === 'english') return Promise.resolve(text);
      const key = `${floresCode}:${text}`;
      if (cacheRef.current[key]) {
        return Promise.resolve(cacheRef.current[key]);
      }

      return new Promise((resolve) => {
        batchQueueRef.current.push({ text, resolve });
        if (!batchTimeoutRef.current) {
          batchTimeoutRef.current = setTimeout(() => {
            processBatchQueue();
          }, 15);
        }
      });
    },
    [floresCode, language, processBatchQueue]
  );

  // Async explicit batch translation helper
  const translateBatchAsync = useCallback(
    async (texts: string[]): Promise<string[]> => {
      if (!texts || texts.length === 0 || language === 'english') return texts;

      const uncached = texts.filter((txt) => !cacheRef.current[`${floresCode}:${txt}`]);

      if (uncached.length > 0) {
        try {
          setIsTranslating(true);
          const results = await translateBatch(uncached, 'eng_Latn', floresCode);
          const newCache: Record<string, string> = {};
          uncached.forEach((txt, i) => {
            newCache[`${floresCode}:${txt}`] = results[i] || txt;
          });
          updateCache(newCache);
        } catch (err) {
          console.warn('Explicit batch translation error:', err);
        } finally {
          setIsTranslating(false);
        }
      }

      return texts.map((txt) => cacheRef.current[`${floresCode}:${txt}`] || txt);
    },
    [floresCode, language, updateCache]
  );

  return (
    <TranslationContext.Provider
      value={{
        currentLang: language,
        floresCode,
        t,
        translateAsync,
        translateBatchAsync,
        isTranslating
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

/**
 * Auto-translating UI Text Component with instant zero-delay render
 */
export const T: React.FC<{ text: string; fallback?: string }> = ({ text, fallback }) => {
  const { t, translateAsync, currentLang } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>(() => t(text) || fallback || text);

  useEffect(() => {
    let isMounted = true;
    if (currentLang === 'english') {
      setTranslatedText(text);
      return;
    }

    const currentTranslated = t(text);
    if (currentTranslated && currentTranslated !== text) {
      setTranslatedText(currentTranslated);
    } else {
      translateAsync(text).then((res) => {
        if (isMounted) {
          setTranslatedText(res);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [text, currentLang, t, translateAsync]);

  return <>{translatedText}</>;
};
