export type Language =
  | 'english'
  | 'hindi'
  | 'assamese'
  | 'bengali'
  | 'bodo'
  | 'dogri'
  | 'gujarati'
  | 'kannada'
  | 'kashmiri'
  | 'konkani'
  | 'maithili'
  | 'malayalam'
  | 'manipuri'
  | 'marathi'
  | 'nepali'
  | 'odia'
  | 'punjabi'
  | 'sanskrit'
  | 'santali'
  | 'sindhi'
  | 'tamil'
  | 'telugu'
  | 'urdu';
export type ClinicalMode = 'allopathic' | 'ayurvedic' | 'dual';
export type SocratesStep = 'S' | 'O' | 'C' | 'R' | 'A' | 'T' | 'E' | 'Severity';

export interface ScannedDocument {
  id: string;
  thumbnail: string;
  type: 'Prescription' | 'Lab Report' | 'Discharge Summary';
  timestamp: string;
}

export interface PatientLockerDocument {
  id: string;
  title: string;
  category: 'Prescription' | 'Lab Report' | 'Discharge Summary' | 'Scan / X-Ray' | 'Ayush Treatment';
  date: string;
  fileDataUrl?: string;
  fileName: string;
  fileSize: string;
  uploadedBy: 'patient_kiosk' | 'abha_sync' | 'doctor_portal';
  ocrExtractedMeds?: string[];
  notes?: string;
}

export interface ExtractedEntity {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  route: string;
  confidence: number;
  verified: boolean;
  flagged: boolean;
  originalText?: string;
}

export interface LabValue {
  test: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
  direction?: 'high' | 'low' | 'normal';
}

export interface RedFlagAlert {
  keyword: string;
  severity: 'P1' | 'P2';
  timestamp: string;
  description: string;
  vitalContext?: string;
}

export interface Discrepancy {
  voiceSays: string;
  documentSays: string;
  field: string;
  status: 'pending' | 'accepted_voice' | 'accepted_ocr' | 'dismissed';
}

export interface SoapDraft {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface DashavidhaParameter {
  id: string;
  key: string;
  nameHindi: string;
  nameEnglish: string;
  aiValue: string;
  currentValue: string;
  confidence: number;
  options: string[];
  isOverridden: boolean;
  overriddenBy?: string;
  overriddenAt?: string;
  provenance: {
    source: 'voice' | 'vitals' | 'history' | 'inference';
    snippetHindi: string;
    snippetEnglish: string;
    confidence: number;
  };
}

// ── MedGemma Conversational Brain Types ──────────────────────────────────────

export interface ConversationTurn {
  speaker: 'patient' | 'ai';
  text: string;              // Original text (patient's language or AI English)
  translatedText?: string;   // English translation (for patient turns)
  timestamp: number;
  turnIndex: number;
}

export interface DetectedSymptom {
  symptom: string;
  confidence: number;
  socratesField?: string;    // Which SOCRATES dimension this maps to
  dashavidhaField?: string;  // Which Dashavidha param this maps to
}

export interface EmergencyContext {
  suspected_condition: string;
  immediate_actions: string[];
  clinical_summary: string;
  detected_keywords: string[];
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  model_source: string;
}

export interface MedGemmaIntakeResponse {
  next_question: string;
  next_question_translated?: string;
  detected_symptoms: DetectedSymptom[];
  soap_partial: Partial<SoapDraft>;
  dashavidha_update?: Record<string, string>;
  emergency_flag: boolean;
  intake_complete: boolean;
  model_source: string;
  latency_ms: number;
}

export interface PatientSavedConsultation {
  id: string;
  visitDate: string;
  opdToken: string;
  chiefComplaint: string;
  mode: ClinicalMode;
  conversationHistory: ConversationTurn[];
  scannedDocuments: ScannedDocument[];
  extractedEntities: ExtractedEntity[];
  soapSummary: SoapDraft;
  dashavidhaSummary?: Record<string, string>;
  attendingDoctor: string;
  assignedRoom: string;
  abhaId: string;
  status: 'completed' | 'in_progress';
}

export interface PatientQueueItem {
  token: string;
  name: string;
  age: number;
  gender: string;
  complaint?: string;
  priority: 'P1' | 'P2' | 'P3';
  mode?: ClinicalMode;
  kiosk?: string;
  waitTime?: string;
  redFlag?: string | null;
  status?: 'waiting' | 'in_progress' | 'completed';
}

export interface MediKioskState {
  // Session
  language: Language;
  mode: ClinicalMode;
  
  // Patient
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientBloodGroup: string;
  patientHeightWeight: string;
  abhaId: string | null;
  isReturningPatient: boolean;
  lastVisitDate: string;
  opdToken: string;
  
  // Intake Data
  transcript: string;
  transcriptLines: { text: string; translation: string; timestamp: number; confidence: number; speaker: 'patient' | 'system' }[];
  currentQuestion: number;
  totalQuestions: number;
  socratesStep: SocratesStep;
  dashavidhaStep: number; // 1-10
  
  // OCR Data
  scannedDocuments: ScannedDocument[];
  extractedEntities: ExtractedEntity[];
  labValues: LabValue[];
  
  // Clinical
  soapDraft: SoapDraft;
  dashavidhaDraft: Record<string, DashavidhaParameter>;
  redFlags: RedFlagAlert[];
  discrepancies: Discrepancy[];
  isDraftLocked: boolean;
  dualAssessmentEnabled: boolean;
  
  // Export
  fhirBundle: Record<string, any> | null;
  fhirValid: boolean;
  exportStatus: 'pending' | 'success' | 'queued' | 'failed';
  purgeStatus: 'pending' | 'complete';
  purgeTimestamp?: string;
  
  // Queue (for nurse/doctor views)
  patientQueue: PatientQueueItem[];

  // MedGemma Colab Integration
  isMedGemmaOnline?: boolean;
  medgemmaEndpoint?: string;
  resolveDiscrepancyWithAi?: (index: number) => Promise<void>;
  synthesizeSoapWithAi?: () => Promise<void>;

  // MedGemma Conversational Brain State
  conversationHistory: ConversationTurn[];
  isAiThinking: boolean;
  detectedSymptoms: DetectedSymptom[];
  emergencyContext: EmergencyContext | null;
  aiGeneratedQuestion: string;
  intakeComplete: boolean;
  handleAiDrivenIntakeTurn?: (transcript: string, translatedTranscript: string) => Promise<void>;
  clearConversationHistory?: () => void;

  // Patient Health Locker & Document Vault
  patientDocuments: PatientLockerDocument[];
  uploadPatientDocument: (doc: Omit<PatientLockerDocument, 'id' | 'date'>) => void;
  deletePatientDocument: (id: string) => void;
  savedConsultations: PatientSavedConsultation[];
  saveCurrentConsultationToLocker: () => void;

  // Actions
  setLanguage: (lang: Language) => void;
  setMode: (mode: ClinicalMode) => void;
  setPatientName: (name: string) => void;
  setOpdToken: (token: string) => void;
  addPatientToQueue: (patient: PatientQueueItem) => void;
  setAbhaVerified: (verified: boolean, returning?: boolean) => void;
  setAnonymousToken: () => void;
  updateSocratesStep: (step: SocratesStep, qIndex?: number) => void;
  updateDashavidhaStep: (step: number) => void;
  addScannedDocument: (doc: ScannedDocument) => void;
  verifyEntity: (id: string, verified: boolean) => void;
  updateEntity: (id: string, drugName: string, dosage: string, frequency: string) => void;
  updateSoapDraft: (field: keyof SoapDraft, value: string) => void;
  overrideDashavidhaParam: (paramId: string, newValue: string) => void;
  lockDraft: () => void;
  toggleDualAssessment: (enabled: boolean) => void;
  resolveDiscrepancy: (index: number, resolution: 'voice' | 'ocr' | 'dismiss') => void;
  triggerRedFlag: (alert: RedFlagAlert) => void;
  dismissRedFlag: () => void;
  routePatientToEr: (token: string) => void;
  selectQueuePatient: (patient: PatientQueueItem) => void;
  addTranscriptLine: (line: { text: string; translation: string; speaker: 'patient' | 'system' }) => void;
  resetPatientSession: () => void;
  advanceToNextPatient: () => void;
}
