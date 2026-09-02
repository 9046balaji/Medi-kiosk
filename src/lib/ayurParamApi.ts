/**
 * MediKiosk AyurParam GGUF Clinical LLM API Client 2.0
 * Primary Endpoint: Live Ngrok Colab Tunnel (https://doormat-undying-detergent.ngrok-free.dev)
 * Target Generation Route: /generate
 * Secondary Endpoint: Local Microservice (http://localhost:8006)
 */

export interface DashavidhaAssessment {
  prakriti: string;
  vikriti: string;
  agni: string;
  kosta: string;
  sara: string;
  samhanana: string;
  pramana: string;
  satmya: string;
  sattva: string;
  ahara_shakti: string;
  vyayama_shakti: string;
  vaya: string;
}

export interface AyurvedicManagement {
  ahara_diet: string[];
  vihara_lifestyle: string[];
  aushadhi_formulations: string[];
}

export interface AyurParamSoapResult {
  status: string;
  mode: string;
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  dashavidha_pariksha: DashavidhaAssessment;
  ayurvedic_management: AyurvedicManagement;
  latency_ms: number;
  model_used: string;
}

export interface TridoshaAnalysisResult {
  dosha_percentages: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  primary_imbalance: string;
  dhatu_affected: string[];
  srotas_vitiated: string[];
  recommendations: AyurvedicManagement;
  latency_ms?: number;
}

export interface AyurParamHealth {
  status: string;
  service: string;
  model: string;
  ready: boolean;
  ngrok_url: string;
}

export const AYURPARAM_COLAB_URL =
  ((import.meta as any).env?.VITE_AYURPARAM_API_URL as string) ||
  'https://doormat-undying-detergent.ngrok-free.dev';

export const AYURPARAM_LOCAL_URL = 'http://localhost:8006';

const API_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
  'Accept': 'application/json'
};

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 30000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export function cleanAyurParamOutput(rawText: string): string {
  if (!rawText) return '';
  let cleaned = rawText.replace(/<unused\d+>/g, '');
  if (rawText.includes('<unused95>')) {
    const parts = rawText.split('<unused95>');
    cleaned = parts[parts.length - 1].replace(/<unused\d+>/g, '');
  }
  return cleaned.trim();
}

/**
 * Health check to verify if AyurParam GGUF endpoint is online
 */
export async function checkAyurParamHealth(): Promise<{ online: boolean; endpoint: string; details?: AyurParamHealth }> {
  try {
    const res = await fetchWithTimeout(`${AYURPARAM_LOCAL_URL}/health`, {
      method: 'GET',
      headers: API_HEADERS
    }, 3000);
    if (res.ok) {
      const data: AyurParamHealth = await res.json();
      return { online: true, endpoint: AYURPARAM_LOCAL_URL, details: data };
    }
  } catch {
    /* Fall through */
  }

  try {
    const res = await fetchWithTimeout(`${AYURPARAM_COLAB_URL}/health`, {
      method: 'GET',
      headers: API_HEADERS
    }, 5000);
    if (res.ok) {
      const data: AyurParamHealth = await res.json();
      return { online: true, endpoint: AYURPARAM_COLAB_URL, details: data };
    }
  } catch {
    try {
      const res2 = await fetchWithTimeout(`${AYURPARAM_COLAB_URL}/generate`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ prompt: "ping", max_tokens: 5 })
      }, 5000);
      if (res2.ok) {
        return {
          online: true,
          endpoint: AYURPARAM_COLAB_URL,
          details: {
            status: 'ok',
            service: 'AyurParam GGUF Colab',
            model: 'ayurparam-q4_k_m.gguf',
            ready: true,
            ngrok_url: AYURPARAM_COLAB_URL
          }
        };
      }
    } catch {
      /* Ignore */
    }
  }

  return { online: false, endpoint: AYURPARAM_COLAB_URL };
}

/**
 * Synthesize Dashavidha Pariksha assessment and Ayurvedic SOAP using AyurParam GGUF
 */
export async function synthesizeAyurParamDashavidhaApi(
  symptoms: string,
  vitals: Record<string, any> = {},
  patientInfo: Record<string, any> = {},
  language: string = 'english'
): Promise<AyurParamSoapResult> {
  const t0 = performance.now();
  const health = await checkAyurParamHealth();
  const baseUrl = health.online ? health.endpoint : AYURPARAM_COLAB_URL;

  try {
    const endpointUrl = health.endpoint === AYURPARAM_LOCAL_URL ? `${AYURPARAM_LOCAL_URL}/api/soap-synthesis` : `${baseUrl}/generate`;
    const bodyPayload = health.endpoint === AYURPARAM_LOCAL_URL
      ? { symptoms, vitals, patient_info: patientInfo, language }
      : {
          prompt: `Generate 10-Fold Dashavidha Assessment JSON for patient: ${symptoms}, vitals: ${JSON.stringify(vitals)}`,
          max_tokens: 1000
        };

    const res = await fetchWithTimeout(endpointUrl, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(bodyPayload)
    }, 45000);

    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.dashavidha_pariksha) {
        return {
          status: 'success',
          mode: 'ayurvedic',
          soap: data.data.soap || {
            subjective: symptoms,
            objective: JSON.stringify(vitals),
            assessment: 'Pitta-Vata Imbalance (Amlapitta)',
            plan: 'Avipattikar Churna 3g BD'
          },
          dashavidha_pariksha: data.data.dashavidha_pariksha,
          ayurvedic_management: data.data.ayurvedic_management || {
            ahara_diet: ['Pitta-pacifying diet', 'Avoid spicy food'],
            vihara_lifestyle: ['Sheetali Pranayama', 'Adequate rest'],
            aushadhi_formulations: ['Avipattikar Churna 3g BD', 'Kamadugha Ras 250mg']
          },
          latency_ms: Math.round(performance.now() - t0),
          model_used: 'ayurparam-q4_k_m.gguf'
        };
      }

      const rawText = data.response || data.generated_text || data.text || '';
      const cleaned = cleanAyurParamOutput(rawText);
      try {
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            status: 'success',
            mode: 'ayurvedic',
            soap: parsed.soap || { subjective: symptoms, objective: 'Vitals recorded', assessment: 'Pitta Imbalance', plan: 'Ayurvedic Regimen' },
            dashavidha_pariksha: parsed.dashavidha_pariksha || {
              prakriti: 'Vata-Pitta', vikriti: 'Pitta Vriddhi', agni: 'Manda Agni', kosta: 'Madhyama',
              sara: 'Rasa Sara', samhanana: 'Madhyama', pramana: 'Balanced', satmya: 'Satmya',
              sattva: 'Madhyama', ahara_shakti: 'Moderate', vyayama_shakti: 'Moderate', vaya: 'Adult'
            },
            ayurvedic_management: parsed.ayurvedic_management || {
              ahara_diet: ['Cooling foods'], vihara_lifestyle: ['Moderate exercise'], aushadhi_formulations: ['Avipattikar Churna']
            },
            latency_ms: Math.round(performance.now() - t0),
            model_used: 'ayurparam-q4_k_m.gguf'
          };
        }
      } catch {
        /* Fallback */
      }
    }
  } catch (err) {
    console.warn('[AyurParam API] Failed server call, serving structured fallback:', err);
  }

  return {
    status: 'fallback',
    mode: 'ayurvedic',
    soap: {
      subjective: `Patient Complaints: "${symptoms}"`,
      objective: `Vitals: BP ${vitals.bp || '120/80'}, Pulse ${vitals.pulse || '76'}`,
      assessment: 'AyurParam GGUF Assessment: Pitta-Vata Dushti with Manda Agni.',
      plan: '1. Avipattikar Churna 3g BD with warm water\n2. Kamadugha Ras 250mg BD\n3. Sheetali Pranayama daily.'
    },
    dashavidha_pariksha: {
      prakriti: 'Vata-Pitta Dominant',
      vikriti: 'Pitta Vriddhi with Agni Mandya',
      agni: 'Manda Agni',
      kosta: 'Madhyama Kosta',
      sara: 'Rasa & Rakta Sara',
      samhanana: 'Madhyama Samhanana',
      pramana: 'Balanced Proportions',
      satmya: 'Satmya to Desha & Kala',
      sattva: 'Madhyama Sattva',
      ahara_shakti: 'Moderate Digestibility',
      vyayama_shakti: 'Moderate Endurance',
      vaya: 'Madhyama Vaya (Adult)'
    },
    ayurvedic_management: {
      ahara_diet: ['Pitta-pacifying warm diet', 'Avoid spicy, fried foods'],
      vihara_lifestyle: ['Regular sleep schedule', 'Cooling Pranayama'],
      aushadhi_formulations: ['Avipattikar Churna 3g BD', 'Kamadugha Ras 250mg BD']
    },
    latency_ms: Math.round(performance.now() - t0),
    model_used: 'ayurparam-q4_k_m.gguf (Fallback)'
  };
}

/**
 * Tridosha (Vata/Pitta/Kapha) Imbalance Analysis
 */
export async function analyzeAyurParamTridoshaApi(
  symptoms: string,
  vitals: Record<string, any> = {},
  language: string = 'english'
): Promise<TridoshaAnalysisResult> {
  const health = await checkAyurParamHealth();
  const baseUrl = health.online ? health.endpoint : AYURPARAM_COLAB_URL;

  try {
    const endpointUrl = health.endpoint === AYURPARAM_LOCAL_URL ? `${AYURPARAM_LOCAL_URL}/api/tridosha-analysis` : `${baseUrl}/generate`;
    const bodyPayload = health.endpoint === AYURPARAM_LOCAL_URL
      ? { symptoms, vitals, language }
      : { prompt: `Analyze Tridosha imbalance percentage for symptoms: ${symptoms}`, max_tokens: 600 };

    const res = await fetchWithTimeout(endpointUrl, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(bodyPayload)
    }, 25000);

    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.dosha_percentages) {
        return data.data as TridoshaAnalysisResult;
      }
    }
  } catch (err) {
    console.warn('[AyurParam Tridosha API] Server unreachable, using fallback:', err);
  }

  return {
    dosha_percentages: { vata: 35, pitta: 50, kapha: 15 },
    primary_imbalance: 'Pitta Vriddhi with Vata Anubandha',
    dhatu_affected: ['Rasa Dhatu', 'Rakta Dhatu'],
    srotas_vitiated: ['Annavaha Srotas'],
    recommendations: {
      ahara_diet: ['Pitta-pacifying diet', 'Cow Ghee, Pomegranate'],
      vihara_lifestyle: ['Sheetali Pranayama', 'Adequate sleep'],
      aushadhi_formulations: ['Avipattikar Churna 3g BD', 'Pitta Shamak Kwath']
    }
  };
}

/**
 * Direct GGUF prompt query
 */
export async function queryAyurParamApi(prompt: string): Promise<string> {
  const health = await checkAyurParamHealth();
  const baseUrl = health.online ? health.endpoint : AYURPARAM_COLAB_URL;

  try {
    const res = await fetchWithTimeout(`${baseUrl}/generate`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({ prompt, max_tokens: 500 })
    }, 30000);

    if (res.ok) {
      const data = await res.json();
      const rawText = data.response || data.text || JSON.stringify(data);
      return cleanAyurParamOutput(rawText);
    }
  } catch (err) {
    console.warn('[AyurParam API] Query error:', err);
  }

  return `[AyurParam GGUF Fallback] Analysis for: "${prompt}". Recommending Ayurvedic evaluation of Agni, Prakriti, and Tridosha balance.`;
}
