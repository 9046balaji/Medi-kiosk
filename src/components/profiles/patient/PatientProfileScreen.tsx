import React, { useState, useRef, useEffect } from 'react';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import { playNeuralTts } from '../../../lib/ttsApi';
import { askMedGemmaNextQuestion } from '../../../lib/medgemmaApi';

// Sub-components & Modals
import { PastCondition, AllergyItem } from './components/types';
import { UploadDocumentModal } from './components/UploadDocumentModal';
import { AddDiseaseModal } from './components/AddDiseaseModal';
import { PatientSidebar } from './components/PatientSidebar';
import { PatientDemographicsTab } from './components/PatientDemographicsTab';
import { PatientFamilyTab } from './components/PatientFamilyTab';
import { PatientMedicationsTab } from './components/PatientMedicationsTab';
import { PatientMedGemmaTab } from './components/PatientMedGemmaTab';
import { PatientOcrVaultTab } from './components/PatientOcrVaultTab';
import { PatientDpdpControlTab } from './components/PatientDpdpControlTab';

import {
  User,
  ShieldCheck,
  FileText,
  Lock,
  Upload,
  Sparkles,
  Pill,
  Users,
  Maximize2,
  Minimize2
} from 'lucide-react';

export const PatientProfileScreen: React.FC = () => {
  const state = useMediKiosk();

  // Navigation Tabs: 6 Dedicated Modular Section Views
  const [activeTab, setActiveTab] = useState<'profile' | 'family' | 'prescriptions' | 'medgemma' | 'ocr_vault' | 'dpdp_control'>('profile');

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showAddDiseaseModal, setShowAddDiseaseModal] = useState<boolean>(false);

  // Interactive AI Assistant in Patient Portal
  const [aiChatInput, setAiChatInput] = useState<string>('');
  const [aiChatLoading, setAiChatLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeSpeakingText, setActiveSpeakingText] = useState<string | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  const [patientAiMessages, setPatientAiMessages] = useState<{ speaker: 'patient' | 'ai'; text: string; time: string }[]>([
    {
      speaker: 'ai',
      text: 'Hello Rajesh! I am your MedGemma AI health assistant. You can speak or type to ask me anything about your symptoms, prescribed medications (like Pantoprazole or Avipattikar Churna), or diet advice.',
      time: 'Just now'
    }
  ]);

  // Expanded consultation state
  const [expandedConsultationId, setExpandedConsultationId] = useState<string | null>(
    state.savedConsultations[0]?.id || null
  );

  // DPDP Privacy Controls
  const [consentActive, setConsentActive] = useState<boolean>(true);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [purgeSuccess, setPurgeSuccess] = useState<boolean>(false);

  // Pre-Existing Diseases & Past Chronic Conditions
  const [pastConditions, setPastConditions] = useState<PastCondition[]>([
    {
      id: 'cond-1',
      name: 'Gastroesophageal Reflux Disease (Amlapitta)',
      code: 'ICD-10 K21.9 • NAMASTE-AMP-01',
      diagnosedYear: '2024',
      severity: 'Moderate',
      status: 'Active',
      hospital: 'AIIA OPD New Delhi',
      notes: 'Pitta-dominant hyperacidity, nocturnal sour belching, epigastric burning post-meals.'
    },
    {
      id: 'cond-2',
      name: 'Primary Essential Hypertension',
      code: 'ICD-10 I10',
      diagnosedYear: '2023',
      severity: 'Controlled',
      status: 'Under Treatment',
      hospital: 'Apollo Clinic Delhi',
      notes: 'Controlled on dietary sodium restriction and daily morning walking.'
    },
    {
      id: 'cond-3',
      name: 'Type 2 Pre-Diabetes Mellitus',
      code: 'ICD-10 R73.03',
      diagnosedYear: '2025',
      severity: 'Mild',
      status: 'Under Treatment',
      hospital: 'Max Healthcare',
      notes: 'Borderline fasting blood glucose, HbA1c 6.2%. Managed with low-glycemic Ayurvedic diet.'
    },
    {
      id: 'cond-4',
      name: 'Seasonal Allergic Rhinitis (Vata-Kapha Pratishyaya)',
      code: 'ICD-10 J30.9',
      diagnosedYear: '2021',
      severity: 'Mild',
      status: 'Active',
      hospital: 'AIIA Shalakya OPD',
      notes: 'Aggravated during seasonal weather transitions and dust exposure.'
    }
  ]);

  // Known Allergies & Adverse Drug Reactions
  const [allergies, setAllergies] = useState<AllergyItem[]>([
    {
      id: 'alg-1',
      allergen: 'Penicillin / Amoxicillin',
      type: 'Drug',
      reaction: 'Cutaneous urticaria, erythematous rash & pruritus',
      severity: 'CRITICAL'
    },
    {
      id: 'alg-2',
      allergen: 'NSAIDs (Diclofenac / Ibuprofen)',
      type: 'Drug',
      reaction: 'Acute epigastric burning & gastric mucosal irritation',
      severity: 'MODERATE'
    },
    {
      id: 'alg-3',
      allergen: 'Dust Mites & Particulate Matter',
      type: 'Environmental',
      reaction: 'Nasal congestion, sneezing & ocular itching',
      severity: 'MILD'
    }
  ]);

  // Listen to browser fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // TTS Audio Playback Helper
  const handlePlayTts = (text: string) => {
    setActiveSpeakingText(text);
    playNeuralTts(text, state.language).finally(() => {
      setActiveSpeakingText(null);
    });
  };

  // ASR Voice Input Handler
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      const langMap: Record<string, string> = {
        english: 'en-US',
        hindi: 'hi-IN',
        bengali: 'bn-IN',
        tamil: 'ta-IN',
        telugu: 'te-IN',
        marathi: 'mr-IN',
        gujarati: 'gu-IN',
        kannada: 'kn-IN',
        malayalam: 'ml-IN',
        punjabi: 'pa-IN',
        odia: 'or-IN',
        urdu: 'ur-IN'
      };

      recognition.lang = langMap[state.language.toLowerCase()] || 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setAiChatInput(transcript);
          handleAskMedGemma(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  // Add Past Disease Handler
  const handleAddDisease = (condition: PastCondition) => {
    setPastConditions((prev) => [condition, ...prev]);
  };

  const handleDeleteCondition = (id: string) => {
    setPastConditions((prev) => prev.filter((c) => c.id !== id));
  };

  // Patient Ask MedGemma Handler
  const handleAskMedGemma = async (customPrompt?: string) => {
    const promptToSend = (typeof customPrompt === 'string' ? customPrompt : aiChatInput).trim();
    if (!promptToSend || aiChatLoading) return;
    setAiChatInput('');

    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    setPatientAiMessages((prev) => [...prev, { speaker: 'patient', text: promptToSend, time: nowTime }]);
    setAiChatLoading(true);

    try {
      const medgemmaRes = await askMedGemmaNextQuestion(
        state.conversationHistory,
        promptToSend,
        ['Tab. Pantoprazole 40mg', 'Avipattikar Churna 3g'],
        'ayurvedic',
        1,
        'english'
      );

      const aiReply =
        medgemmaRes?.next_question ||
        `Based on your Amlapitta history and Tab. Pantoprazole 40mg prescription, it is advisable to avoid sour, fried, and spicy foods. Take your Avipattikar Churna after meals with lukewarm water.`;

      setPatientAiMessages((prev) => [...prev, { speaker: 'ai', text: aiReply, time: nowTime }]);
      handlePlayTts(aiReply);
    } catch (e) {
      const fallbackReply =
        'Pantoprazole 40mg is best taken on an empty stomach in the morning. Avipattikar Churna is an Ayurvedic Pitta-pacifying compound taken after meals. Please consult Dr. Arvind Sharma for dosage alterations.';
      setPatientAiMessages((prev) => [
        ...prev,
        {
          speaker: 'ai',
          text: fallbackReply,
          time: nowTime
        }
      ]);
      handlePlayTts(fallbackReply);
    } finally {
      setAiChatLoading(false);
    }
  };

  // Export Full Patient FHIR Records
  const handleExportPatientRecords = () => {
    const dataToExport = {
      patientId: state.abhaId,
      name: state.patientName,
      demographics: {
        age: state.patientAge,
        gender: state.patientGender,
        bloodGroup: state.patientBloodGroup
      },
      pastConditions,
      allergies,
      consultations: state.savedConsultations,
      documents: state.patientDocuments,
      fhirBundle: state.fhirBundle,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ABHA_Health_Records_${state.patientName.replace(/\s+/g, '_')}.json`;
    a.click();
  };

  // DPDP Right to Erasure Purge
  const handlePurgeAllData = () => {
    if (
      window.confirm(
        'Are you sure you want to permanently delete all your medical records and conversation history under the DPDP Act 2023 Right to Erasure? This cannot be undone.'
      )
    ) {
      setIsPurging(true);
      setTimeout(() => {
        state.resetPatientSession();
        setIsPurging(false);
        setPurgeSuccess(true);
        setTimeout(() => setPurgeSuccess(false), 3000);
      }, 1200);
    }
  };

  const navMenuItems = [
    {
      id: 'profile',
      title: 'ABHA ID & Medical History',
      desc: 'Health Card, Diseases & Vitals',
      icon: User,
      color: 'text-indigo-600'
    },
    {
      id: 'family',
      title: 'Family Members & Health Tree',
      desc: 'Relatives, Hereditary & ABDM IDs',
      icon: Users,
      count: 4,
      color: 'text-rose-600'
    },
    {
      id: 'prescriptions',
      title: 'Active & Past Medications',
      desc: 'Current Doses & Medicine History',
      icon: Pill,
      count: 3,
      color: 'text-emerald-600'
    },
    {
      id: 'medgemma',
      title: 'MedGemma AI Dialogues',
      desc: 'Voice transcripts & AI Chat',
      icon: Sparkles,
      count: state.savedConsultations.length,
      color: 'text-yellow-500'
    },
    {
      id: 'ocr_vault',
      title: 'Document OCR Vault',
      desc: 'Scanned Prescriptions & Reports',
      icon: FileText,
      count: state.patientDocuments.length,
      color: 'text-teal-600'
    },
    {
      id: 'dpdp_control',
      title: 'Privacy & Data Controls',
      desc: 'Export, Consent & Erasure',
      icon: Lock,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] w-full bg-slate-100 flex flex-col lg:flex-row text-slate-900">
      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />

      {/* Add Disease Modal */}
      <AddDiseaseModal
        isOpen={showAddDiseaseModal}
        onClose={() => setShowAddDiseaseModal(false)}
        onAdd={handleAddDisease}
      />

      {/* ─── STATIONARY NON-MOVING LEFT SIDEBAR MENU ─── */}
      <PatientSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navMenuItems={navMenuItems}
        onOpenUploadModal={() => setShowUploadModal(true)}
      />

      {/* ─── RIGHT MAIN VIEWPORT (FULL-SCREEN WIDTH & FLUID) ─── */}
      <main className="flex-1 p-4 sm:p-6 lg:p-7 space-y-6 overflow-y-auto w-full min-w-0">
        {/* Top Full-Width Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-sm w-full">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span><T text={navMenuItems.find((m) => m.id === activeTab)?.title || 'Patient Portal'} /></span>
            </h2>
            <p className="text-sm text-slate-600 font-medium mt-0.5">
              <T text={navMenuItems.find((m) => m.id === activeTab)?.desc || ''} />
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono font-bold px-3.5 py-1.5 bg-emerald-100 text-emerald-900 rounded-full border border-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ABDM Level-3 Vault</span>
            </span>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5 text-xs sm:text-sm font-extrabold border border-slate-300"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}</span>
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4" />
              <span><T text="Upload OCR Document" /></span>
            </button>
          </div>
        </div>

        {/* TAB 1: ABHA ID, Demographics & Pre-Existing Diseases Registry */}
        {activeTab === 'profile' && (
          <PatientDemographicsTab
            pastConditions={pastConditions}
            allergies={allergies}
            onOpenAddDiseaseModal={() => setShowAddDiseaseModal(true)}
            onDeleteCondition={handleDeleteCondition}
            onPlayTts={handlePlayTts}
            onNavigateToFamily={() => setActiveTab('family')}
          />
        )}

        {/* TAB 2: Dedicated Family Members & Hereditary Health Tree */}
        {activeTab === 'family' && (
          <PatientFamilyTab onPlayTts={handlePlayTts} />
        )}

        {/* TAB 3: Active & Complete Past Medications History */}
        {activeTab === 'prescriptions' && (
          <PatientMedicationsTab onPlayTts={handlePlayTts} />
        )}

        {/* TAB 4: MedGemma AI Voice Dialogue & Interactive Assistant */}
        {activeTab === 'medgemma' && (
          <PatientMedGemmaTab
            expandedConsultationId={expandedConsultationId}
            setExpandedConsultationId={setExpandedConsultationId}
            patientAiMessages={patientAiMessages}
            aiChatInput={aiChatInput}
            setAiChatInput={setAiChatInput}
            aiChatLoading={aiChatLoading}
            isListening={isListening}
            activeSpeakingText={activeSpeakingText}
            onPlayTts={handlePlayTts}
            onToggleSpeechRecognition={toggleSpeechRecognition}
            onAskMedGemma={handleAskMedGemma}
          />
        )}

        {/* TAB 5: Optical OCR & Document Intelligence Hub */}
        {activeTab === 'ocr_vault' && (
          <PatientOcrVaultTab
            onOpenUploadModal={() => setShowUploadModal(true)}
            onPlayTts={handlePlayTts}
          />
        )}

        {/* TAB 6: DPDP Act Privacy & Full Patient Data Control Center */}
        {activeTab === 'dpdp_control' && (
          <PatientDpdpControlTab
            purgeSuccess={purgeSuccess}
            isPurging={isPurging}
            consentActive={consentActive}
            setConsentActive={setConsentActive}
            onExportRecords={handleExportPatientRecords}
            onPurgeAllData={handlePurgeAllData}
          />
        )}
      </main>
    </div>
  );
};
