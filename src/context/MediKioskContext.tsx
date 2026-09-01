import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MediKioskState,
  Language,
  ClinicalMode,
  SocratesStep,
  ScannedDocument,
  ExtractedEntity,
  LabValue,
  SoapDraft,
  DashavidhaParameter,
  RedFlagAlert,
  Discrepancy,
  PatientQueueItem,
  ConversationTurn,
  DetectedSymptom,
  EmergencyContext,
  PatientLockerDocument,
  PatientSavedConsultation,
} from '../types';
import {
  initialDashavidhaParams,
  initialExtractedEntities,
  initialLabValues,
  initialPatientQueue,
  initialRedFlags,
  initialDiscrepancies,
  initialSoapDraft,
  validFhirR4Bundle
} from '../data/mockData';

import {
  checkMedGemmaHealth,
  resolveDiscrepancyApi,
  synthesizeClinicalNoteApi,
  askMedGemmaNextQuestion,
  runEmergencyContextAnalysis,
} from '../lib/medgemmaApi';
import { playNeuralTts } from '../lib/ttsApi';
import { checkEmergencyTriage } from '../lib/emergencyApi';
import { translateText } from '../lib/translationApi';
import { getFloresCode } from '../lib/languageMap';

const MediKioskContext = createContext<MediKioskState | undefined>(undefined);

export const MediKioskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session
  const [language, setLanguage] = useState<Language>('english');
  const [mode, setMode] = useState<ClinicalMode>('allopathic');

  // Patient Info
  const [patientName, setPatientName] = useState<string>('Rajesh Kumar');
  const [patientAge, setPatientAge] = useState<number>(45);
  const [patientGender, setPatientGender] = useState<string>('Male');
  const [patientBloodGroup, setPatientBloodGroup] = useState<string>('B+ Positive');
  const [patientHeightWeight, setPatientHeightWeight] = useState<string>('172 cm / 68 kg (BMI: 23.0)');
  const [abhaId, setAbhaId] = useState<string | null>('91-4589-2041-9872');
  const [isReturningPatient, setIsReturningPatient] = useState<boolean>(true);
  const [lastVisitDate, setLastVisitDate] = useState<string>('14 May 2026 (Ayush OPD, Dr. Verma)');
  const [opdToken, setOpdToken] = useState<string>('K-1042');

  // Intake & Voice
  const [transcript, setTranscript] = useState<string>(
    'I have been experiencing a severe burning sensation in the upper part of my stomach for the last 3 weeks. It worsens severely about 45 minutes after meals, with pressure in the chest and sour acid belching.'
  );
  const [transcriptLines, setTranscriptLines] = useState<{ text: string; translation: string; timestamp: number; confidence: number; speaker: 'patient' | 'system' }[]>([
    {
      speaker: 'system',
      text: 'Hello. Please describe where exactly in your body you are experiencing discomfort or pain.',
      translation: 'Hello. Please describe where exactly in your body you are experiencing discomfort or pain.',
      timestamp: Date.now() - 45000,
      confidence: 0.98
    },
    {
      speaker: 'patient',
      text: 'I have been experiencing a severe burning sensation in the upper part of my stomach for the last 3 weeks.',
      translation: 'I have been experiencing a severe burning sensation in the upper part of my stomach for the last 3 weeks.',
      timestamp: Date.now() - 32000,
      confidence: 0.94
    },
    {
      speaker: 'system',
      text: 'When is this pain most intense, and are there associated sour belches?',
      translation: 'When is this pain most intense, and are there associated sour belches?',
      timestamp: Date.now() - 20000,
      confidence: 0.99
    },
    {
      speaker: 'patient',
      text: 'It worsens severely about 45 minutes after meals, with pressure in the chest and sour acid belching.',
      translation: 'It worsens severely about 45 minutes after meals, with pressure in the chest and sour acid belching.',
      timestamp: Date.now() - 8000,
      confidence: 0.96
    }
  ]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(3);
  const [totalQuestions] = useState<number>(8);
  const [socratesStep, setSocratesStep] = useState<SocratesStep>('C');
  const [dashavidhaStep, setDashavidhaStep] = useState<number>(3);

  // OCR
  const [scannedDocuments, setScannedDocuments] = useState<ScannedDocument[]>([
    {
      id: 'doc-1',
      thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      type: 'Prescription',
      timestamp: 'Today, 10:38 AM'
    },
    {
      id: 'doc-2',
      thumbnail: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
      type: 'Lab Report',
      timestamp: 'Today, 10:40 AM'
    }
  ]);

  // Patient Health Locker & Document Vault (Persisted records for returning patient)
  const [patientDocuments, setPatientDocuments] = useState<PatientLockerDocument[]>([
    {
      id: 'pdoc-1',
      title: 'Dr. Arvind Sharma OPD Prescription (AIIA)',
      category: 'Prescription',
      date: '14 May 2026',
      fileName: 'Rx_AIIA_OPD_14May2026.pdf',
      fileSize: '1.4 MB',
      uploadedBy: 'abha_sync',
      ocrExtractedMeds: ['Tab. Pantoprazole 40mg (1-0-0 AC)', 'Avipattikar Churna 3g (1-0-1 PC)', 'Sutshekhar Ras 125mg (0-0-1 HS)'],
      notes: 'Prescribed for severe epigastric burning and acid reflux (Amlapitta)'
    },
    {
      id: 'pdoc-2',
      title: 'Comprehensive Metabolic Panel & Blood Glucose',
      category: 'Lab Report',
      date: '12 May 2026',
      fileName: 'Pathology_Report_AIIA_May2026.pdf',
      fileSize: '840 KB',
      uploadedBy: 'abha_sync',
      ocrExtractedMeds: ['Fasting Blood Sugar: 112 mg/dL (Borderline High)', 'HbA1c: 6.2% (Pre-diabetic)'],
      notes: 'Routine fasting glucose and lipid profile test'
    },
    {
      id: 'pdoc-3',
      title: 'Ayush Panchakarma Therapy Discharge Summary',
      category: 'Ayush Treatment',
      date: '22 Dec 2025',
      fileName: 'Ayush_Discharge_Summary_Dec2025.pdf',
      fileSize: '2.1 MB',
      uploadedBy: 'patient_kiosk',
      ocrExtractedMeds: ['Virechana Karma protocol completed (7 Days)', 'Shaman Aushadhi follow-up'],
      notes: 'Completed 7-day Ayurvedic Pitta detox regimen'
    }
  ]);

  // Saved Past Consultations & AI Intake History for Logged-In ABHA Patient
  const [savedConsultations, setSavedConsultations] = useState<PatientSavedConsultation[]>([
    {
      id: 'consult-1',
      visitDate: '14 May 2026',
      opdToken: 'MK-1042',
      chiefComplaint: 'Epigastric burning pain & post-prandial acid reflux (Amlapitta)',
      mode: 'ayurvedic',
      conversationHistory: [
        {
          speaker: 'ai',
          text: 'Hello! Where exactly in your body are you experiencing discomfort or pain?',
          timestamp: Date.now() - 10000000,
          turnIndex: 0
        },
        {
          speaker: 'patient',
          text: 'मुझे पिछले तीन हफ़्तों से पेट के ऊपरी हिस्से में बहुत जलन हो रही है, खासकर खाना खाने के बाद।',
          translatedText: 'I have severe burning in my upper stomach for the last three weeks, especially after eating.',
          timestamp: Date.now() - 9980000,
          turnIndex: 1
        },
        {
          speaker: 'ai',
          text: 'I understand you are having epigastric burning pain. Does this burning spread up to your chest or throat, and do you experience sour belching?',
          timestamp: Date.now() - 9950000,
          turnIndex: 2
        },
        {
          speaker: 'patient',
          text: 'हाँ, रात को खट्टी डकारें आती हैं और गले तक खट्टा पानी आता है।',
          translatedText: 'Yes, I get sour belching at night and sour fluid rises up to my throat.',
          timestamp: Date.now() - 9920000,
          turnIndex: 3
        }
      ],
      scannedDocuments: [
        {
          id: 'doc-past-1',
          thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
          type: 'Prescription',
          timestamp: '14 May 2026, 10:38 AM'
        }
      ],
      extractedEntities: [
        {
          id: 'ent-1',
          drugName: 'Tab. Pantoprazole 40mg',
          dosage: '40mg',
          frequency: '1-0-0 (Before Meals) • 14 Days',
          route: 'Oral',
          confidence: 0.98,
          verified: true,
          flagged: false
        },
        {
          id: 'ent-2',
          drugName: 'Avipattikar Churna 3g',
          dosage: '3g',
          frequency: '1-0-1 (After Meals)',
          route: 'Oral',
          confidence: 0.95,
          verified: true,
          flagged: false
        }
      ],
      soapSummary: {
        subjective: '45yo male presenting with 3-week history of epigastric burning and nocturnal sour belching.',
        objective: 'Vitals: BP 128/82, HR 76. Epigastric tenderness on deep palpation without guarding.',
        assessment: 'Amlapitta (Gastroesophageal Acid Reflux / Non-ulcer Dyspepsia) with Pitta dominance.',
        plan: 'Pitta pacifying diet, Tab. Pantoprazole 40mg AC, Avipattikar Churna 3g PC with lukewarm water.'
      },
      dashavidhaSummary: {
        Prakriti: 'Pitta-Kapha',
        Vikriti: 'Pitta Vriddhi (Amlapitta)',
        Agni: 'Tikshnagni (Intense / Acidic Fire)',
        Sara: 'Rasa-Mamsa Sara',
        Satmya: 'Katu-Amla Satmya (Aggravating)'
      },
      attendingDoctor: 'Dr. Arvind Sharma (MD Ayush)',
      assignedRoom: 'Room 104 (Ayush OPD)',
      abhaId: '91-4589-2041-9872',
      status: 'completed'
    }
  ]);

  const handleUploadPatientDocument = useCallback((doc: Omit<PatientLockerDocument, 'id' | 'date'>) => {
    const newDoc: PatientLockerDocument = {
      ...doc,
      id: `pdoc-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    setPatientDocuments((prev) => [newDoc, ...prev]);
  }, []);

  const handleDeletePatientDocument = useCallback((id: string) => {
    setPatientDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntity[]>(initialExtractedEntities);
  const [labValues, setLabValues] = useState<LabValue[]>(initialLabValues);

  // Clinical state
  const [soapDraft, setSoapDraft] = useState<SoapDraft>(initialSoapDraft);
  const [dashavidhaDraft, setDashavidhaDraft] = useState<Record<string, DashavidhaParameter>>(initialDashavidhaParams);
  const [redFlags, setRedFlags] = useState<RedFlagAlert[]>(initialRedFlags);
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>(initialDiscrepancies);
  const [isDraftLocked, setIsDraftLocked] = useState<boolean>(false);
  const [dualAssessmentEnabled, setDualAssessmentEnabled] = useState<boolean>(true);

  // Export
  const [fhirBundle, setFhirBundle] = useState<Record<string, any> | null>(validFhirR4Bundle);
  const [fhirValid, setFhirValid] = useState<boolean>(true);
  const [exportStatus, setExportStatus] = useState<'pending' | 'success' | 'queued' | 'failed'>('success');
  const [purgeStatus, setPurgeStatus] = useState<'pending' | 'complete'>('complete');
  const [purgeTimestamp, setPurgeTimestamp] = useState<string>('2026-08-29 10:45:00 UTC (DPDP-Secured)');

  // Queue
  const [patientQueue, setPatientQueue] = useState<PatientQueueItem[]>(initialPatientQueue);

  // MedGemma Colab State
  const [isMedGemmaOnline, setIsMedGemmaOnline] = useState<boolean>(false);
  const [medgemmaEndpoint, setMedgemmaEndpoint] = useState<string>('https://unilludedly-pipier-paola.ngrok-free.dev');

  // MedGemma Conversational Brain State
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [detectedSymptoms, setDetectedSymptoms] = useState<DetectedSymptom[]>([]);
  const [emergencyContext, setEmergencyContext] = useState<EmergencyContext | null>(null);
  const [aiGeneratedQuestion, setAiGeneratedQuestion] = useState<string>(
    'Hello! Where exactly in your body are you experiencing discomfort or pain?'
  );
  const [intakeComplete, setIntakeComplete] = useState<boolean>(false);

  useEffect(() => {
    checkMedGemmaHealth().then((res) => {
      setIsMedGemmaOnline(res.online);
      if (res.endpoint) setMedgemmaEndpoint(res.endpoint);
    });
  }, []);

  const handleResolveDiscrepancyWithAi = async (index: number) => {
    const disc = discrepancies[index];
    if (!disc) return;
    const aiRes = await resolveDiscrepancyApi(disc.voiceSays, disc.documentSays, disc.field);
    setDiscrepancies((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          status: aiRes.recommended_resolution === 'accepted_voice' ? 'accepted_voice' : 'accepted_ocr'
        };
      }
      return updated;
    });
  };

  const handleSynthesizeSoapWithAi = async () => {
    const flags = redFlags.map((rf) => rf.keyword);
    const ocrSummary = extractedEntities.map((e) => `${e.drugName} ${e.dosage} (${e.frequency})`).join('; ');
    const res = await synthesizeClinicalNoteApi(transcript, ocrSummary, flags, mode);
    if (res.soap) {
      setSoapDraft({
        subjective: res.soap.subjective,
        objective: res.soap.objective,
        assessment: res.soap.assessment,
        plan: res.soap.plan
      });
    }
  };

  /**
   * ★ CORE ORCHESTRATOR: AI-driven intake turn.
   *
   * Flow per patient utterance:
   *  1. Record patient turn into conversation history
   *  2. Run deterministic emergency triage (always, zero latency)
   *  3. If emergency → enrich with MedGemma context, set emergencyContext state
   *  4. If no emergency → call MedGemma for next adaptive question
   *  5. Translate question to patient's language
   *  6. Play via TTS
   *  7. Record AI turn into conversation history
   *  8. Update detected symptoms + SOAP partial
   */
  const handleAiDrivenIntakeTurn = useCallback(async (
    rawTranscript: string,
    translatedTranscript: string
  ) => {
    if (!rawTranscript.trim() || isAiThinking) return;

    const turnIdx = conversationHistory.length;

    // Step 1 — Record patient turn
    const patientTurn: ConversationTurn = {
      speaker: 'patient',
      text: rawTranscript,
      translatedText: translatedTranscript || rawTranscript,
      timestamp: Date.now(),
      turnIndex: turnIdx,
    };
    const updatedHistory = [...conversationHistory, patientTurn];
    setConversationHistory(updatedHistory);

    // Step 2 — Deterministic emergency triage (runs in parallel, no wait)
    checkEmergencyTriage(translatedTranscript || rawTranscript, language).then(async (triageRes) => {
      if (triageRes.is_emergency) {
        const keywords = triageRes.detected_flags.map((f) => f.phrase);
        // Step 3 — Enrich with MedGemma emergency context (async, doesn't block question gen)
        const ctx = await runEmergencyContextAnalysis(
          translatedTranscript || rawTranscript,
          keywords,
          language
        );
        setEmergencyContext(ctx);
      }
    });

    // Step 4 — Ask MedGemma for next adaptive question
    setIsAiThinking(true);
    try {
      const ocrSummary = [
        ...extractedEntities.map((e) => `${e.drugName} ${e.dosage}`),
        ...patientDocuments.flatMap((d) => d.ocrExtractedMeds || [])
      ].filter(Boolean);
      const intakeRes = await askMedGemmaNextQuestion(
        updatedHistory,
        translatedTranscript || rawTranscript,
        ocrSummary,
        mode === 'dual' ? 'allopathic' : mode,
        dashavidhaStep,
        language
      );

      let nextQuestion = intakeRes.next_question;

      // Step 5 — Translate back to patient's language (if not English)
      if (language !== 'english' && nextQuestion) {
        try {
          const flores = getFloresCode(language as never);
          nextQuestion = await translateText(nextQuestion, 'eng_Latn', flores) || nextQuestion;
        } catch { /* keep English question */ }
      }

      setAiGeneratedQuestion(nextQuestion);

      // Update detected symptoms
      if (intakeRes.detected_symptoms?.length > 0) {
        setDetectedSymptoms((prev) => [
          ...prev,
          ...intakeRes.detected_symptoms.filter(
            (s) => !prev.some((p) => p.symptom === s.symptom)
          ),
        ]);
      }

      // Update partial SOAP
      if (intakeRes.soap_partial?.subjective) {
        setSoapDraft((prev) => ({
          ...prev,
          subjective: intakeRes.soap_partial.subjective || prev.subjective,
        }));
      }

      // Mark intake complete
      if (intakeRes.intake_complete) {
        setIntakeComplete(true);
        // Auto-synthesize final SOAP when done
        handleSynthesizeSoapWithAi();
      }

      // Step 6 — Play question via TTS (non-blocking)
      playNeuralTts(nextQuestion, language).catch(() => {});

      // Step 7 — Record AI turn
      const aiTurn: ConversationTurn = {
        speaker: 'ai',
        text: nextQuestion,
        timestamp: Date.now(),
        turnIndex: updatedHistory.length,
      };
      setConversationHistory((prev) => [...prev, aiTurn]);

      // Update transcript string for backward compat
      setTranscript((prev) =>
        prev ? `${prev} ${translatedTranscript || rawTranscript}` : translatedTranscript || rawTranscript
      );
    } catch (err) {
      console.error('[MediKiosk Orchestrator] handleAiDrivenIntakeTurn error:', err);
    } finally {
      setIsAiThinking(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationHistory, isAiThinking, language, mode, dashavidhaStep, extractedEntities]);

  const handleClearConversationHistory = () => {
    setConversationHistory([]);
    setDetectedSymptoms([]);
    setEmergencyContext(null);
    setAiGeneratedQuestion('Hello! Where exactly in your body are you experiencing discomfort or pain?');
    setIntakeComplete(false);
  };

  // Actions
  const handleSetAbhaVerified = (verified: boolean, returning = true) => {
    if (verified) {
      setAbhaId('91-4589-2041-9872');
      setPatientName('Rajesh Kumar');
      setPatientAge(45);
      setPatientGender('Male');
      setIsReturningPatient(returning);
      setOpdToken('K-1042');
    } else {
      setAbhaId(null);
    }
  };

  const handleSetAnonymousToken = () => {
    setAbhaId(null);
    setPatientName('Anonymous Walk-in Patient');
    setPatientAge(32);
    setPatientGender('Unspecified');
    setIsReturningPatient(false);
    setOpdToken('K-ANON-9901');
  };

  const handleUpdateSocratesStep = (step: SocratesStep, qIndex?: number) => {
    setSocratesStep(step);
    if (qIndex !== undefined) {
      setCurrentQuestion(qIndex);
    }
  };

  const handleUpdateDashavidhaStep = (step: number) => {
    setDashavidhaStep(step);
  };

  const handleAddScannedDocument = (doc: ScannedDocument) => {
    setScannedDocuments((prev) => [doc, ...prev]);
  };

  const handleVerifyEntity = (id: string, verified: boolean) => {
    setExtractedEntities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, verified } : item))
    );
  };

  const handleUpdateEntity = (id: string, drugName: string, dosage: string, frequency: string) => {
    setExtractedEntities((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, drugName, dosage, frequency, verified: true } : item
      )
    );
  };

  const handleUpdateSoapDraft = (field: keyof SoapDraft, value: string) => {
    if (isDraftLocked) return;
    setSoapDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleOverrideDashavidhaParam = (paramId: string, newValue: string) => {
    if (isDraftLocked) return;
    setDashavidhaDraft((prev) => {
      const existing = prev[paramId];
      if (!existing) return prev;
      return {
        ...prev,
        [paramId]: {
          ...existing,
          currentValue: newValue,
          isOverridden: newValue !== existing.aiValue,
          overriddenBy: 'Dr. A. Sharma (Vaidya Registrar)',
          overriddenAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      };
    });
  };

  const handleLockDraft = () => {
    setIsDraftLocked(true);
  };

  const handleToggleDualAssessment = (enabled: boolean) => {
    setDualAssessmentEnabled(enabled);
  };

  const handleResolveDiscrepancy = (index: number, resolution: 'voice' | 'ocr' | 'dismiss') => {
    setDiscrepancies((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          status: resolution === 'voice' ? 'accepted_voice' : resolution === 'ocr' ? 'accepted_ocr' : 'dismissed'
        };
      }
      return updated;
    });
  };

  const handleTriggerRedFlag = (alert: RedFlagAlert) => {
    setRedFlags((prev) => [alert, ...prev]);
  };

  const handleDismissRedFlag = () => {
    setRedFlags((prev) => prev.slice(1));
  };

  const handleRoutePatientToEr = (token: string) => {
    setPatientQueue((prev) => {
      const updated = prev.map((p) =>
        p.token === token
          ? {
            ...p,
            priority: 'P1' as const,
            complaint: p.complaint.includes('[EMERGENCY ER ROUTED]') ? p.complaint : '[EMERGENCY ER ROUTED] ' + p.complaint
          }
          : p
      );
      // Sort P1 to the top
      return [...updated].sort((a, b) => (a.priority === 'P1' ? -1 : b.priority === 'P1' ? 1 : 0));
    });
  };

  const handleSelectQueuePatient = (item: PatientQueueItem) => {
    setOpdToken(item.token);
    setPatientName(item.name);
    setPatientAge(item.age);
    setPatientGender(item.gender === 'M' || item.gender.toLowerCase().includes('male') ? 'Male' : 'Female');
    setMode(item.mode);
    setAbhaId('91-4589-2041-9872');
  };

  const handleAddTranscriptLine = (line: { text: string; translation: string; speaker: 'patient' | 'system' }) => {
    setTranscriptLines((prev) => [
      ...prev,
      {
        ...line,
        timestamp: Date.now(),
        confidence: 0.95
      }
    ]);
  };

  // Keep FHIR bundle dynamically updated with live session data
  useEffect(() => {
    const dynamicBundle = {
      resourceType: 'Bundle',
      id: `medikiosk-abdm-bundle-${opdToken.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      meta: {
        versionId: '1',
        lastUpdated: new Date().toISOString(),
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle']
      },
      identifier: {
        system: 'https://healthid.ndhm.gov.in/token',
        value: `OPD-${opdToken}-20260829`
      },
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: [
        {
          fullUrl: `urn:uuid:composition-medikiosk-${opdToken}`,
          resource: {
            resourceType: 'Composition',
            id: `composition-medikiosk-${opdToken}`,
            meta: {
              profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/OPConsultRecord']
            },
            language: 'hi-IN',
            status: 'final',
            type: {
              coding: [
                {
                  system: 'https://projecteka.in/snomed',
                  code: '371530004',
                  display: 'Clinical consultation report'
                }
              ],
              text: 'MediKiosk Dual Allopathic-Ayush Clinical Intake Report'
            },
            subject: {
              reference: `urn:uuid:patient-${patientName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              display: `${patientName} (ABHA: ${abhaId || 'Anonymous'})`
            },
            encounter: {
              reference: `urn:uuid:encounter-kiosk-opd-${opdToken}`
            },
            date: new Date().toISOString(),
            author: [
              {
                reference: 'urn:uuid:practitioner-ai-kiosk',
                display: 'MediKiosk AI Engine (Ayush-Allopathic Triangulator v2.4)'
              }
            ],
            title: 'Outpatient Consultation & Dashavidha Pariksha Record',
            section: [
              {
                title: 'Chief Complaint & SOCRATES Breakdown',
                code: {
                  coding: [{ system: 'http://loinc.org', code: '10154-3', display: 'Chief complaint' }]
                },
                text: {
                  status: 'generated',
                  div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>${soapDraft.subjective}</p></div>`
                }
              },
              {
                title: 'Ayush Dashavidha Pariksha',
                code: {
                  coding: [{ system: 'http://ayush.gov.in/namaste', code: 'NAMASTE-DVP-01', display: 'Dashavidha Pariksha Assessment' }]
                },
                text: {
                  status: 'generated',
                  div: `<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Prakriti:</b> ${dashavidhaDraft.prakriti?.currentValue || 'Vata-Pitta'}. <b>Vikriti:</b> ${dashavidhaDraft.vikriti?.currentValue || 'Pitta Vriddhi'}. <b>Ahara Shakti:</b> ${dashavidhaDraft.aharaShakti?.currentValue || 'Vishamagni'}.</p></div>`
                }
              },
              {
                title: 'Assessment & Plan',
                code: {
                  coding: [{ system: 'http://loinc.org', code: '51847-2', display: 'Evaluation and Plan' }]
                },
                text: {
                  status: 'generated',
                  div: `<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Assessment:</b> ${soapDraft.assessment}</p><p><b>Plan:</b> ${soapDraft.plan}</p></div>`
                }
              }
            ]
          }
        },
        {
          fullUrl: `urn:uuid:patient-${patientName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          resource: {
            resourceType: 'Patient',
            id: `patient-${patientName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            identifier: [
              {
                type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR', display: 'Medical Record Number' }] },
                system: 'https://healthid.ndhm.gov.in',
                value: abhaId || '91-4589-2041-9872'
              }
            ],
            name: [{ use: 'official', text: patientName }],
            gender: patientGender.toLowerCase().includes('female') ? 'female' : 'male',
            birthDate: `${2026 - patientAge}-04-12`
          }
        }
      ]
    };
    setFhirBundle(dynamicBundle);
  }, [patientName, opdToken, abhaId, patientGender, patientAge, soapDraft, dashavidhaDraft]);

  const handleSaveCurrentConsultationToLocker = useCallback(() => {
    if (!abhaId) return; // Anonymous patients follow zero-retention ephemeral policy

    const newConsultation: PatientSavedConsultation = {
      id: `consult-${Date.now()}`,
      visitDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      opdToken: opdToken || 'MK-1042',
      chiefComplaint: detectedSymptoms.map((s) => s.symptom).join(', ') || 'Amlapitta & Epigastric Burning',
      mode: mode,
      conversationHistory: conversationHistory.length > 0 ? [...conversationHistory] : [
        {
          speaker: 'ai',
          text: 'Hello! Where exactly in your body are you experiencing discomfort or pain?',
          timestamp: Date.now() - 60000,
          turnIndex: 0
        },
        {
          speaker: 'patient',
          text: transcript || 'मुझे पेट में जलन और एसिडिटी की समस्या है।',
          translatedText: 'I have burning sensation in my stomach and acidity issue.',
          timestamp: Date.now() - 40000,
          turnIndex: 1
        }
      ],
      scannedDocuments: [...scannedDocuments],
      extractedEntities: [...extractedEntities],
      soapSummary: { ...soapDraft },
      attendingDoctor: 'Dr. Arvind Sharma (MD Ayush)',
      assignedRoom: 'Room 104 (Ayush OPD)',
      abhaId: abhaId,
      status: 'completed'
    };

    setSavedConsultations((prev) => [newConsultation, ...prev]);
  }, [abhaId, opdToken, detectedSymptoms, mode, conversationHistory, transcript, scannedDocuments, extractedEntities, soapDraft]);

  const handleResetPatientSession = () => {
    // If patient had an ABHA ID, save their consultation to their lifetime locker before resetting active screen
    if (abhaId && (conversationHistory.length > 0 || transcript.length > 0)) {
      handleSaveCurrentConsultationToLocker();
    }

    setPatientName('Rajesh Kumar');
    setPatientAge(45);
    setPatientGender('Male');
    setAbhaId('91-4589-2041-9872');
    setIsReturningPatient(true);
    setOpdToken('K-1042');
    setSocratesStep('S');
    setCurrentQuestion(0);
    setDashavidhaStep(1);
    setIsDraftLocked(false);
    setTranscript('');
    setTranscriptLines([]);
    setConversationHistory([]);
    setExtractedEntities(initialExtractedEntities);
    setDashavidhaDraft(initialDashavidhaParams);
    setSoapDraft(initialSoapDraft);
    setRedFlags(initialRedFlags);
    setDiscrepancies(initialDiscrepancies);
  };

  const handleAdvanceToNextPatient = () => {
    if (patientQueue.length > 0) {
      const next = patientQueue[0];
      setPatientName(next.name);
      setPatientAge(next.age);
      setPatientGender(next.gender === 'M' ? 'Male' : 'Female');
      setOpdToken(next.token);
      setAbhaId('91-8821-4329-1002');
      setIsReturningPatient(true);
      setPatientQueue((prev) => prev.slice(1));
    }
  };

  return (
    <MediKioskContext.Provider
      value={{
        language,
        mode,
        patientName,
        patientAge,
        patientGender,
        patientBloodGroup,
        patientHeightWeight,
        abhaId,
        isReturningPatient,
        lastVisitDate,
        opdToken,
        transcript,
        transcriptLines,
        currentQuestion,
        totalQuestions,
        socratesStep,
        dashavidhaStep,
        scannedDocuments,
        patientDocuments,
        uploadPatientDocument: handleUploadPatientDocument,
        deletePatientDocument: handleDeletePatientDocument,
        savedConsultations,
        saveCurrentConsultationToLocker: handleSaveCurrentConsultationToLocker,
        extractedEntities,
        labValues,
        soapDraft,
        dashavidhaDraft,
        redFlags,
        discrepancies,
        isDraftLocked,
        dualAssessmentEnabled,
        fhirBundle,
        fhirValid,
        exportStatus,
        purgeStatus,
        purgeTimestamp,
        patientQueue,
        isMedGemmaOnline,
        medgemmaEndpoint,
        resolveDiscrepancyWithAi: handleResolveDiscrepancyWithAi,
        synthesizeSoapWithAi: handleSynthesizeSoapWithAi,
        // Conversational Brain
        conversationHistory,
        isAiThinking,
        detectedSymptoms,
        emergencyContext,
        aiGeneratedQuestion,
        intakeComplete,
        handleAiDrivenIntakeTurn,
        clearConversationHistory: handleClearConversationHistory,
        setLanguage,
        setMode,
        setPatientName,
        setOpdToken,
        addPatientToQueue: (patient: PatientQueueItem) => setPatientQueue((prev) => [patient, ...prev]),
        setAbhaVerified: handleSetAbhaVerified,
        setAnonymousToken: handleSetAnonymousToken,
        updateSocratesStep: handleUpdateSocratesStep,
        updateDashavidhaStep: handleUpdateDashavidhaStep,
        addScannedDocument: handleAddScannedDocument,
        verifyEntity: handleVerifyEntity,
        updateEntity: handleUpdateEntity,
        updateSoapDraft: handleUpdateSoapDraft,
        overrideDashavidhaParam: handleOverrideDashavidhaParam,
        lockDraft: handleLockDraft,
        toggleDualAssessment: handleToggleDualAssessment,
        resolveDiscrepancy: handleResolveDiscrepancy,
        triggerRedFlag: handleTriggerRedFlag,
        dismissRedFlag: handleDismissRedFlag,
        routePatientToEr: handleRoutePatientToEr,
        selectQueuePatient: handleSelectQueuePatient,
        addTranscriptLine: handleAddTranscriptLine,
        resetPatientSession: handleResetPatientSession,
        advanceToNextPatient: handleAdvanceToNextPatient
      }}
    >
      {children}
    </MediKioskContext.Provider>
  );
};

export const useMediKiosk = (): MediKioskState => {
  const context = useContext(MediKioskContext);
  if (!context) {
    throw new Error('useMediKiosk must be used within a MediKioskProvider');
  }
  return context;
};
