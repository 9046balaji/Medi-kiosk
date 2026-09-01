/**
 * MediKiosk Emergency Red-Flag Triage API Client
 * Microservice Endpoint: http://localhost:8004/api/triage
 */

export interface TriageFlag {
  phrase: string;
  category: string;
  level: string;
  description?: string;
}

export interface TriageResult {
  is_emergency: boolean;
  triage_level: 'P1_CRITICAL' | 'P2_URGENT' | 'P3_ROUTINE';
  primary_disease_suspect: string;
  detected_flags: TriageFlag[];
  negated_flags: { phrase: string; reason: string }[];
  latency_ms: number;
}

const EMERGENCY_API_URL = 'http://localhost:8004/api/triage';

// Client-side fallback red flag list for instant offline zero-latency evaluation
const FALLBACK_RED_FLAGS = [
  'chest pain', 'heart attack', 'shortness of breath', 'cannot breathe',
  'difficulty breathing', 'unconscious', 'fainted', 'slurred speech',
  'stroke', 'paralysis', 'heavy bleeding', 'severe bleeding', 'head injury',
  'seizure', 'fits', 'anaphylaxis', 'snake bite', 'poisoning',
  'सीने में दर्द', 'सांस लेने में तकलीफ', 'बेहोश', 'लकवा', 'खून बहना',
  'seene me dard', 'saans lene me takleef', 'behosh'
];

export async function checkEmergencyTriage(
  transcript: string,
  langCode: string = 'en'
): Promise<TriageResult> {
  const startT = performance.now();

  try {
    const res = await fetch(EMERGENCY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, lang_code: langCode })
    });

    if (res.ok) {
      const data: TriageResult = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('[Emergency API] Backend Port 8004 unreachable, using client-side triage engine:', err);
  }

  // Client-side fallback logic
  const lowerText = transcript.toLowerCase();
  const matchedFlags: TriageFlag[] = [];

  for (const flag of FALLBACK_RED_FLAGS) {
    if (lowerText.includes(flag.toLowerCase())) {
      // Basic negation check (no / denies / nahi)
      if (
        lowerText.includes(`no ${flag}`) || 
        lowerText.includes(`denies ${flag}`) || 
        lowerText.includes(`${flag} nahi`)
      ) {
        continue;
      }
      matchedFlags.push({
        phrase: flag,
        category: 'EMERGENCY',
        level: 'P1_CRITICAL',
        description: 'Red Flag Symptom Detected'
      });
    }
  }

  const isEmerg = matchedFlags.length > 0;
  return {
    is_emergency: isEmerg,
    triage_level: isEmerg ? 'P1_CRITICAL' : 'P3_ROUTINE',
    primary_disease_suspect: isEmerg ? 'Emergency Red-Flag Triggered' : 'Routine Intake',
    detected_flags: matchedFlags,
    negated_flags: [],
    latency_ms: Math.round(performance.now() - startT)
  };
}
