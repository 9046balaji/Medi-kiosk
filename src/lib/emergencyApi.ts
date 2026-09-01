/**
 * MediKiosk Emergency Red-Flag Triage API Client 2.0
 * Microservice Endpoint: http://localhost:8004/api/triage
 */

export interface TriageFlag {
  phrase: string;
  category: string;
  level: string;
  disease?: string;
  description?: string;
}

export interface PEWSAssessment {
  pews_score: number;
  risk_level: string;
  reasons: string[];
}

export interface MEOWSAssessment {
  meows_score: number;
  red_triggers: number;
  yellow_triggers: number;
  alert_level: string;
  details: string[];
}

export interface STARTDisasterTriage {
  tag: 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';
  category: string;
  priority: number;
}

export interface ParsedVitalAlert {
  vital: string;
  value: string;
  level: string;
  disease: string;
  category: string;
}

export interface ParsedVitals {
  systolic_bp: number | null;
  diastolic_bp: number | null;
  spo2: number | null;
  heart_rate: number | null;
  temperature_f: number | null;
  alerts: ParsedVitalAlert[];
}

export interface TemporalDuration {
  duration_type: string;
  description: string;
}

export interface TriageResult {
  session_id?: string | null;
  is_emergency: boolean;
  triage_level: 'P1_CRITICAL' | 'P2_URGENT' | 'P3_ROUTINE';
  esi_level?: string;
  news2_score?: number;
  news2_category?: string;
  pews_assessment?: PEWSAssessment | null;
  meows_assessment?: MEOWSAssessment | null;
  disaster_triage?: STARTDisasterTriage | null;
  primary_disease_suspect: string;
  detected_flags: TriageFlag[];
  negated_flags: { phrase: string; reason: string }[];
  parsed_vitals?: ParsedVitals;
  temporal_duration?: TemporalDuration;
  fhir_bundle?: any;
  audit_trail?: { timestamp_utc: string; audit_hash: string; raw_transcript: string };
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
  langCode: string = 'en',
  age?: number,
  gender?: string,
  isPregnant?: boolean,
  sessionId?: string,
  enableDisasterMode?: boolean
): Promise<TriageResult> {
  const startT = performance.now();

  try {
    const res = await fetch(EMERGENCY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript,
        lang_code: langCode,
        age: age || undefined,
        gender: gender || undefined,
        is_pregnant: isPregnant || false,
        session_id: sessionId || undefined,
        enable_disaster_mode: enableDisasterMode || false
      })
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
    session_id: sessionId || null,
    is_emergency: isEmerg,
    triage_level: isEmerg ? 'P1_CRITICAL' : 'P3_ROUTINE',
    esi_level: isEmerg ? 'ESI-1 (Immediate Resuscitation)' : 'ESI-5 (Non-Urgent / OPD Routine)',
    news2_score: isEmerg ? 7 : 0,
    news2_category: isEmerg ? 'HIGH (Emergency Clinical Escalation Required)' : 'LOW (Standard Monitoring)',
    primary_disease_suspect: isEmerg ? 'Emergency Red-Flag Triggered' : 'Routine Intake',
    detected_flags: matchedFlags,
    negated_flags: [],
    parsed_vitals: { systolic_bp: null, diastolic_bp: null, spo2: null, heart_rate: null, temperature_f: null, alerts: [] },
    temporal_duration: { duration_type: 'unknown', description: 'Unspecified duration' },
    latency_ms: Math.round(performance.now() - startT)
  };
}
