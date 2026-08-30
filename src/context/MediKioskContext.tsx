import React, { createContext, useContext, useState, useEffect } from 'react';
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
  PatientQueueItem
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

  const handleResetPatientSession = () => {
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
        setLanguage,
        setMode,
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
