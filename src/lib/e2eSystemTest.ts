/**
 * e2eSystemTest.ts — Programmatic End-to-End Microservice Handshake & Integration Tester
 * Tests Port 8000 (Translation), Port 8001 (ASR), and Port 8002 (TTS).
 */

import { checkTtsHealth, fetchTtsAudioBlob } from './ttsApi';
import { checkAsrHealth } from './asrApi';
import { checkBackendHealth as checkTranslationHealth, translateText } from './translationApi';

export interface E2ETestResult {
  component: string;
  port: number;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  latency_ms: number;
  details: string;
}

export async function runFullSystemDiagnostics(): Promise<E2ETestResult[]> {
  const results: E2ETestResult[] = [];

  // 1. Translation Microservice Check (Port 8000)
  const t0 = performance.now();
  try {
    const isTransOnline = await checkTranslationHealth();
    const elapsed = Math.round(performance.now() - t0);
    if (isTransOnline) {
      const sampleTrans = await translateText('Welcome to MediKiosk', 'eng_Latn', 'hin_Deva');
      results.push({
        component: 'IndicTrans2 NMT Translation',
        port: 8000,
        status: 'ONLINE',
        latency_ms: elapsed,
        details: `Translation verified: "Welcome to MediKiosk" → "${sampleTrans}"`,
      });
    } else {
      results.push({
        component: 'IndicTrans2 NMT Translation',
        port: 8000,
        status: 'OFFLINE',
        latency_ms: elapsed,
        details: 'Translation server unreachable on port 8000',
      });
    }
  } catch (err) {
    results.push({
      component: 'IndicTrans2 NMT Translation',
      port: 8000,
      status: 'OFFLINE',
      latency_ms: Math.round(performance.now() - t0),
      details: `Error: ${String(err)}`,
    });
  }

  // 2. ASR Microservice Check (Port 8001)
  const t1 = performance.now();
  try {
    const asrHealth = await checkAsrHealth();
    const elapsed = Math.round(performance.now() - t1);
    if (asrHealth && asrHealth.status === 'ok' && asrHealth.model_loaded) {
      results.push({
        component: 'IndicConformer 600M ASR',
        port: 8001,
        status: 'ONLINE',
        latency_ms: elapsed,
        details: `Model loaded on device: ${asrHealth.device} (${asrHealth.model_name})`,
      });
    } else {
      results.push({
        component: 'IndicConformer 600M ASR',
        port: 8001,
        status: asrHealth?.status === 'initializing' ? 'DEGRADED' : 'OFFLINE',
        latency_ms: elapsed,
        details: asrHealth?.status === 'initializing' ? 'Model is initializing on GPU' : 'ASR server offline on port 8001',
      });
    }
  } catch (err) {
    results.push({
      component: 'IndicConformer 600M ASR',
      port: 8001,
      status: 'OFFLINE',
      latency_ms: Math.round(performance.now() - t1),
      details: `Error: ${String(err)}`,
    });
  }

  // 3. TTS Microservice Check (Port 8002)
  const t2 = performance.now();
  try {
    const ttsHealth = await checkTtsHealth();
    const elapsed = Math.round(performance.now() - t2);
    if (ttsHealth && ttsHealth.status === 'ok' && ttsHealth.model_loaded) {
      // Test audio blob fetch
      const blob = await fetchTtsAudioBlob('नमस्ते', 'hindi', 'Divya');
      results.push({
        component: 'Indic Parler-TTS Speech Synthesis',
        port: 8002,
        status: 'ONLINE',
        latency_ms: elapsed,
        details: `Loaded on device: ${ttsHealth.device} | Audio Blob: ${blob ? `${blob.size} bytes` : 'Failed'}`,
      });
    } else {
      results.push({
        component: 'Indic Parler-TTS Speech Synthesis',
        port: 8002,
        status: ttsHealth?.status === 'initializing' ? 'DEGRADED' : 'OFFLINE',
        latency_ms: elapsed,
        details: ttsHealth?.status === 'initializing' ? 'TTS model is initializing in GPU memory' : 'TTS server offline on port 8002',
      });
    }
  } catch (err) {
    results.push({
      component: 'Indic Parler-TTS Speech Synthesis',
      port: 8002,
      status: 'OFFLINE',
      latency_ms: Math.round(performance.now() - t2),
      details: `Error: ${String(err)}`,
    });
  }

  return results;
}
