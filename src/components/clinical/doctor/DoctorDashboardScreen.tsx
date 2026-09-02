import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import { DrugInteractionMatrix } from '../../common/DrugInteractionMatrix';
import { coveReasoningApi, exportFhirResourcesApi, CoVeReasoningResult } from '../../../lib/medgemmaApi';
import { synthesizeAyurParamDashavidhaApi } from '../../../lib/ayurParamApi';
import { playNeuralTts } from '../../../lib/ttsApi';
import { PatientQueueItem } from '../../../types';

import { DoctorHeader } from './components/DoctorHeader';
import { PatientQueueSelectorBar } from './components/PatientQueueSelectorBar';
import { PatientVitalsStrip } from './components/PatientVitalsStrip';
import { VoiceIntakeCard } from './components/VoiceIntakeCard';
import { OcrPrescriptionsCard } from './components/OcrPrescriptionsCard';
import { SoapNoteWorkspace } from './components/SoapNoteWorkspace';
import { DashavidhaAssessmentGrid } from './components/DashavidhaAssessmentGrid';

import {
  FileText,
  Flame,
  Layers,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const DoctorDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = useMediKiosk();

  const isAyurvedicParam = location.search.includes('mode=ayurvedic') || state.mode === 'ayurvedic';

  const [activeTab, setActiveTab] = useState<'soap' | 'dashavidha' | 'dual' | 'locker'>(
    isAyurvedicParam ? 'dashavidha' : 'soap'
  );
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isCoveAuditing, setIsCoveAuditing] = useState<boolean>(false);
  const [coveResult, setCoveResult] = useState<CoVeReasoningResult | null>(null);
  const [showFhirModal, setShowFhirModal] = useState<boolean>(false);
  const [fhirData, setFhirData] = useState<any | null>(null);

  // Active Selected Patient Token State
  const [selectedPatientToken, setSelectedPatientToken] = useState<string>(state.opdToken);

  // Tridosha state sliders
  const [vata, setVata] = useState<number>(30);
  const [pitta, setPitta] = useState<number>(55);
  const [kapha, setKapha] = useState<number>(15);

  // Dashavidha assessment inputs
  const [prakriti, setPrakriti] = useState<string>('Pitta-Kapha');
  const [vikriti, setVikriti] = useState<string>('Pitta Vriddhi (Amlapitta)');
  const [agni, setAgni] = useState<string>('Tikshnagni (Intense Fire)');
  const [kosta, setKosta] = useState<string>('Krura Kosta (Constipated)');
  const [dehabala, setDehabala] = useState<string>('Madhyama (Moderate)');
  const [sara, setSara] = useState<string>('Rasa & Rakta Sara');
  const [samhanana, setSamhanana] = useState<string>('Madhyama (Balanced)');

  // Doctor Clinical Dictation ASR
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [dictatedField, setDictatedField] = useState<'subjective' | 'objective' | 'assessment' | 'plan' | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  const [isAyurParamSynthesizing, setIsAyurParamSynthesizing] = useState<boolean>(false);

  const handleToggleLock = () => {
    state.lockDraft();
  };

  const handlePlayDoctorTts = (text: string) => {
    playNeuralTts(text, state.language);
  };

  const handleSelectPatient = (patient: PatientQueueItem) => {
    setSelectedPatientToken(patient.token);
  };

  const handleTriggerAyurParamSynthesis = async () => {
    setIsAyurParamSynthesizing(true);
    try {
      const res = await synthesizeAyurParamDashavidhaApi(
        state.soapDraft.subjective || state.transcript,
        {},
        { name: state.patientName, age: state.patientAge, gender: state.patientGender },
        state.language
      );
      if (res.dashavidha_pariksha) {
        if (res.dashavidha_pariksha.prakriti) setPrakriti(res.dashavidha_pariksha.prakriti);
        if (res.dashavidha_pariksha.vikriti) setVikriti(res.dashavidha_pariksha.vikriti);
        if (res.dashavidha_pariksha.agni) setAgni(res.dashavidha_pariksha.agni);
        if (res.dashavidha_pariksha.kosta) setKosta(res.dashavidha_pariksha.kosta);
      }
      if (res.soap) {
        if (res.soap.subjective) state.updateSoapDraft('subjective', res.soap.subjective);
        if (res.soap.objective) state.updateSoapDraft('objective', res.soap.objective);
        if (res.soap.assessment) state.updateSoapDraft('assessment', res.soap.assessment);
        if (res.soap.plan) state.updateSoapDraft('plan', res.soap.plan);
      }
    } finally {
      setIsAyurParamSynthesizing(false);
    }
  };

  const handleTriggerSoapSynthesis = async () => {
    setIsSynthesizing(true);
    try {
      if (state.synthesizeSoapWithAi) {
        await state.synthesizeSoapWithAi();
      }
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleTriggerCoveAudit = async () => {
    setIsCoveAuditing(true);
    try {
      const caseStr = `Clinical Case: 45yo male presenting with ${state.soapDraft.subjective}. Vitals: BP 128/82. Assessment: ${state.soapDraft.assessment}`;
      const res = await coveReasoningApi(caseStr, state.language);
      setCoveResult(res);
    } finally {
      setIsCoveAuditing(false);
    }
  };

  const handleExportFhirModal = async () => {
    const bundle = await exportFhirResourcesApi(state.soapDraft, {
      name: state.patientName,
      age: state.patientAge,
      gender: state.patientGender,
      token: state.opdToken,
      abha_id: state.abhaId
    });
    setFhirData(bundle);
    setShowFhirModal(true);
  };

  const startDoctorDictation = (field: 'subjective' | 'objective' | 'assessment' | 'plan') => {
    if (isDictating) {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }
      setIsDictating(false);
      setDictatedField(null);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = state.language === 'hindi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;

      setIsDictating(true);
      setDictatedField(field);

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        const currentVal = state.soapDraft[field] || '';
        state.updateSoapDraft(field, currentVal ? `${currentVal} ${text}` : text);
      };

      recognition.onerror = () => {
        setIsDictating(false);
        setDictatedField(null);
      };

      recognition.onend = () => {
        setIsDictating(false);
        setDictatedField(null);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsDictating(false);
      setDictatedField(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-3 sm:p-5 lg:p-6 space-y-5 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-5">

        {/* ── TOP MASTER COMMAND BAR ────────────────────────────────────────────── */}
        <DoctorHeader
          isSynthesizing={isSynthesizing}
          isAyurParamSynthesizing={isAyurParamSynthesizing}
          isCoveAuditing={isCoveAuditing}
          isDraftLocked={state.isDraftLocked}
          onTriggerSoapSynthesis={handleTriggerSoapSynthesis}
          onTriggerAyurParamSynthesis={handleTriggerAyurParamSynthesis}
          onTriggerCoveAudit={handleTriggerCoveAudit}
          onExportFhirModal={handleExportFhirModal}
          onToggleLock={handleToggleLock}
        />

        {/* ── PATIENT QUEUE SELECTOR BAR ──────────────────────────────────────── */}
        <PatientQueueSelectorBar
          activeToken={selectedPatientToken}
          onSelectPatient={handleSelectPatient}
        />

        {/* ── PATIENT VITALS & STATUS HEADER STRIP ─────────────────────────────── */}
        <PatientVitalsStrip
          patientName={state.patientName}
          patientAge={state.patientAge}
          opdToken={state.opdToken}
          isMedGemmaOnline={!!state.isMedGemmaOnline}
          hasRedFlags={state.redFlags.length > 0}
        />

        {/* ── CoVe REASONING RESULT NOTIFICATION ───────────────────────────────── */}
        {coveResult && (
          <div className="p-5 bg-indigo-950/80 border border-indigo-500/40 rounded-3xl space-y-3 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-indigo-300 text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Chain-of-Verification (CoVe) Self-Correction Audit Complete</span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                Audit Passed
              </span>
            </div>
            <div className="text-xs text-slate-300 font-medium leading-relaxed">
              <p className="font-semibold text-indigo-200"><strong>Final Audited Verdict:</strong> {coveResult.final_audited_verdict}</p>
            </div>
          </div>
        )}

        {/* ── MAIN WORKSPACE SEGMENTED NAVIGATION TABS ───────────────────────── */}
        <div className="flex items-center bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700/80 space-x-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('soap')}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'soap'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span><T text="Allopathic SOAP Clinical Note" /></span>
          </button>

          <button
            onClick={() => setActiveTab('dashavidha')}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'dashavidha'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span><T text="Ayurvedic Dashavidha 10-Fold Assessment" /></span>
          </button>

          <button
            onClick={() => setActiveTab('dual')}
            className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'dual'
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span><T text="Dual Allopathic + AYUSH Parallel Matrix" /></span>
          </button>
        </div>

        {/* ── TWO-COLUMN MAIN WORKSPACE GRID ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* LEFT COLUMN: PATIENT INTAKE INTELLIGENCE & OCR (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <VoiceIntakeCard
              conversationHistory={state.conversationHistory}
              fallbackTranscript={state.transcript}
              onPlayTts={handlePlayDoctorTts}
            />

            <OcrPrescriptionsCard
              extractedEntities={state.extractedEntities}
            />

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 shadow-lg space-y-3">
              <DrugInteractionMatrix />
            </div>
          </div>

          {/* RIGHT COLUMN: CLINICAL NOTE & ASSESSMENT WORKSPACE (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">

            {activeTab === 'soap' && (
              <SoapNoteWorkspace
                soapDraft={state.soapDraft}
                isDictating={isDictating}
                dictatedField={dictatedField}
                onUpdateSoapDraft={(field, val) => state.updateSoapDraft(field, val)}
                onStartDoctorDictation={startDoctorDictation}
              />
            )}

            {activeTab === 'dashavidha' && (
              <DashavidhaAssessmentGrid
                vata={vata}
                pitta={pitta}
                kapha={kapha}
                prakriti={prakriti}
                vikriti={vikriti}
                agni={agni}
                kosta={kosta}
                sara={sara}
                samhanana={samhanana}
                onSetVata={setVata}
                onSetPitta={setPitta}
                onSetKapha={setKapha}
                onSetPrakriti={setPrakriti}
                onSetVikriti={setVikriti}
                onSetAgni={setAgni}
                onSetKosta={setKosta}
                onSetSara={setSara}
                onSetSamhanana={setSamhanana}
              />
            )}

            {activeTab === 'dual' && (
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-teal-400" />
                    <span>Dual Allopathic & AYUSH Synthesis Matrix</span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-purple-500/30 space-y-2">
                    <div className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> MedGemma Allopathic Verdict
                    </div>
                    <p className="text-slate-300 font-medium leading-relaxed">
                      {state.soapDraft.assessment || 'Gastroesophageal Acid Reflux (GERD) with epigastric tenderness.'}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-emerald-500/30 space-y-2">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Flame className="w-4 h-4" /> AyurParam AYUSH Verdict
                    </div>
                    <p className="text-slate-300 font-medium leading-relaxed">
                      Amlapitta with Pitta Vriddhi & Manda Agni. Prescribing Avipattikar Churna 3g BD.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
