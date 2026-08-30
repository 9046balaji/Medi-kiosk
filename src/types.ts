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
