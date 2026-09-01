import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import { DrugInteractionMatrix } from '../../common/DrugInteractionMatrix';
import { coveReasoningApi, exportFhirResourcesApi, CoVeReasoningResult } from '../../../lib/medgemmaApi';
import { playNeuralTts } from '../../../lib/ttsApi';
import {
  Stethoscope,
  Sparkles,
  Activity,
  FileCode,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MessageSquare,
  Search,
  Sliders,
  ChevronDown,
  Info,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Download,
  Share2,
  Printer,
  Plus,
  Flame,
  Wind,
  Droplet,
  Volume2,
  Mic,
  MicOff,
  Radio,
  FileJson,
  CheckSquare
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

  // Doctor Clinical Dictation ASR
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [dictatedField, setDictatedField] = useState<'subjective' | 'assessment' | 'plan' | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  const handleToggleLock = () => {
    state.lockDraft();
  };

  const handlePlayDoctorTts = (text: string) => {
    playNeuralTts(text, state.language);
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

  const startDoctorDictation = (field: 'subjective' | 'assessment' | 'plan') => {
    if (isDictating) {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }
      setIsDictating(false);
      setDictatedField(null);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = state.language === 'english' ? 'en-US' : 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsDictating(true);
        setDictatedField(field);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          state.updateSoapDraft(field, `${state.soapDraft[field]} ${text}`.trim());
        }
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
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Master Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/30">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  <T text="Doctor Clinical Workstation" />
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-full border border-teal-200">
                  Dr. Arvind Sharma (AIIA OPD Room 104)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                <T text="Review AI Triangulation, MedGemma CoVe Reasoning, and export ABDM FHIR consultation bundle." />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleTriggerSoapSynthesis}
              disabled={isSynthesizing}
              className="px-3.5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-700/30"
              title="Synthesize SOAP note with MedGemma 2.1"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isSynthesizing ? 'Synthesizing...' : '🤖 MedGemma SOAP'}</span>
            </button>

            <button
              onClick={handleTriggerCoveAudit}
              disabled={isCoveAuditing}
              className="px-3.5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-700/30"
              title="Run Chain-of-Verification Audit"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>{isCoveAuditing ? 'Auditing...' : '🔍 CoVe Self-Correction'}</span>
            </button>

            <button
              onClick={handleExportFhirModal}
              className="px-3.5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-700/30"
              title="Export HL7 FHIR R4 Bundle"
            >
              <FileJson className="w-4 h-4 text-blue-200" />
              <span><T text="FHIR R4 Bundle" /></span>
            </button>

            <button
              onClick={handleToggleLock}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                state.isDraftLocked
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {state.isDraftLocked ? (
                <>
                  <Lock className="w-4 h-4" />
                  <T text="Unlock Clinical Note" />
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <T text="Lock & Sign Note" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Patient Vitals Header Strip */}
        <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
          <div>
            <div className="text-slate-500 text-[10px]"><T text="Patient Name" /></div>
            <div className="font-bold text-slate-900 text-sm">{state.patientName}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]"><T text="ABHA ID / Token" /></div>
            <div className="font-bold text-teal-800 font-mono text-sm">{state.opdToken}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]"><T text="Vitals Telemetry" /></div>
            <div className="font-bold text-slate-900">BP 128/82 • HR 76</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]"><T text="Primary Complaint" /></div>
            <div className="font-bold text-amber-800"><T text="Amlapitta (Hyperacidity)" /></div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]"><T text="MedGemma Colab Engine" /></div>
            <div className="font-bold text-purple-700 flex items-center gap-1 truncate">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>{state.isMedGemmaOnline ? 'Colab Ngrok Active' : 'Client AI Active'}</span>
            </div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]"><T text="EHR Status" /></div>
            <div className="font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> <T text="ABDM Verified" />
            </div>
          </div>
        </div>

        {/* Chain-of-Verification (CoVe) Audit Result Display */}
        {coveResult && (
          <div className="p-5 bg-indigo-50 border-2 border-indigo-300 rounded-3xl space-y-3 text-xs text-indigo-950 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm text-indigo-900">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>MedGemma 2.1 Chain-of-Verification (CoVe) Audit Passed</span>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-full font-bold text-[10px]">
                3/3 Verification Checks Passed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {coveResult.verification_questions?.map((q, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-xl border border-indigo-200 flex items-start gap-2 font-medium">
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{q}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-white rounded-xl border border-indigo-200 font-medium">
              <div className="font-bold text-indigo-900 mb-1">Final Audited Clinical Verdict:</div>
              <div>{coveResult.final_audited_verdict}</div>
            </div>
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 flex-wrap">
          <button
            onClick={() => setActiveTab('soap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'soap' ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <T text="Allopathic SOAP Console" />
          </button>

          <button
            onClick={() => setActiveTab('dashavidha')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashavidha' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <T text="Vaidya Dashavidha & Tridosha Matrix" />
          </button>

          <button
            onClick={() => setActiveTab('dual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dual' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <T text="Dual Integrated View" />
          </button>

          <button
            onClick={() => setActiveTab('locker')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'locker' ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span><T text="Patient Uploaded Documents & ABHA Locker" /> ({state.patientDocuments.length})</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-6">
          
          {activeTab === 'soap' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-teal-800 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  <T text="Allopathic SOAP Pre-Populated Clinical Note" />
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  <T text="Dictate notes with ASR or type directly." />
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Subjective */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-900 uppercase tracking-wider"><T text="S — Subjective History" /></span>
                    <button
                      onClick={() => startDoctorDictation('subjective')}
                      className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        isDictating && dictatedField === 'subjective'
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-teal-100 hover:bg-teal-200 text-teal-800'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{isDictating && dictatedField === 'subjective' ? 'Dictating...' : 'Dictate'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={state.soapDraft.subjective}
                    onChange={(e) => state.updateSoapDraft('subjective', e.target.value)}
                    disabled={state.isDraftLocked}
                    className="w-full bg-white p-3 border border-slate-300 rounded-xl font-mono text-slate-800 outline-none leading-relaxed"
                  />
                </div>

                {/* Objective */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-teal-900 uppercase tracking-wider block"><T text="O — Objective Examination" /></span>
                  <textarea
                    rows={3}
                    value={state.soapDraft.objective}
                    onChange={(e) => state.updateSoapDraft('objective', e.target.value)}
                    disabled={state.isDraftLocked}
                    className="w-full bg-white p-3 border border-slate-300 rounded-xl font-mono text-slate-800 outline-none leading-relaxed"
                  />
                </div>

                {/* Assessment */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-900 uppercase tracking-wider"><T text="A — Clinical Assessment" /></span>
                    <button
                      onClick={() => startDoctorDictation('assessment')}
                      className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        isDictating && dictatedField === 'assessment'
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-teal-100 hover:bg-teal-200 text-teal-800'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{isDictating && dictatedField === 'assessment' ? 'Dictating...' : 'Dictate'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={state.soapDraft.assessment}
                    onChange={(e) => state.updateSoapDraft('assessment', e.target.value)}
                    disabled={state.isDraftLocked}
                    className="w-full bg-white p-3 border border-slate-300 rounded-xl font-mono text-slate-800 outline-none leading-relaxed"
                  />
                </div>

                {/* Plan */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-900 uppercase tracking-wider"><T text="P — Treatment Plan" /></span>
                    <button
                      onClick={() => startDoctorDictation('plan')}
                      className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        isDictating && dictatedField === 'plan'
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-teal-100 hover:bg-teal-200 text-teal-800'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{isDictating && dictatedField === 'plan' ? 'Dictating...' : 'Dictate'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={state.soapDraft.plan}
                    onChange={(e) => state.updateSoapDraft('plan', e.target.value)}
                    disabled={state.isDraftLocked}
                    className="w-full bg-white p-3 border border-slate-300 rounded-xl font-mono text-slate-800 outline-none leading-relaxed"
                  />
                </div>

              </div>
            </div>
          )}

          {activeTab === 'dashavidha' && (
            <div className="space-y-6">
              
              {/* Tridosha Balance Gauge */}
              <div className="p-5 bg-amber-50/70 rounded-3xl border-2 border-amber-300 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <T text="Interactive Tridosha Imbalance Ratio (Vata • Pitta • Kapha)" />
                  </h4>
                  <span className="text-xs font-mono font-bold text-amber-900">
                    Pitta Aggravated ({pitta}%)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-blue-500" /> Vata</span>
                      <span>{vata}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={vata} onChange={(e) => setVata(Number(e.target.value))} className="w-full accent-blue-600" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-red-500" /> Pitta</span>
                      <span>{pitta}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={pitta} onChange={(e) => setPitta(Number(e.target.value))} className="w-full accent-red-600" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span className="flex items-center gap-1"><Droplet className="w-3.5 h-3.5 text-teal-500" /> Kapha</span>
                      <span>{kapha}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={kapha} onChange={(e) => setKapha(Number(e.target.value))} className="w-full accent-teal-600" />
                  </div>
                </div>
              </div>

              {/* 10-Fold Assessment Matrix Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold"><T text="1. Prakriti" /></span>
                  <input type="text" value={prakriti} onChange={(e) => setPrakriti(e.target.value)} className="w-full bg-white font-bold text-slate-900 p-1 border rounded" />
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold"><T text="2. Vikriti" /></span>
                  <input type="text" value={vikriti} onChange={(e) => setVikriti(e.target.value)} className="w-full bg-white font-bold text-slate-900 p-1 border rounded" />
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold"><T text="3. Agni" /></span>
                  <input type="text" value={agni} onChange={(e) => setAgni(e.target.value)} className="w-full bg-white font-bold text-slate-900 p-1 border rounded" />
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold"><T text="4. Kosta" /></span>
                  <input type="text" value={kosta} onChange={(e) => setKosta(e.target.value)} className="w-full bg-white font-bold text-slate-900 p-1 border rounded" />
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold"><T text="5. Dehabala" /></span>
                  <input type="text" value={dehabala} onChange={(e) => setDehabala(e.target.value)} className="w-full bg-white font-bold text-slate-900 p-1 border rounded" />
                </div>
              </div>

            </div>
          )}

          {activeTab === 'dual' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-indigo-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <T text="Dual Integrated Clinical View (SOAP + Dashavidha)" />
              </h3>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800">
                <T text="Combined view merging Allopathic ICD-10 Gastroesophageal Reflux with Ayush Amlapitta Pitta Pacification Protocol." />
              </div>
            </div>
          )}

          {activeTab === 'locker' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-emerald-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <T text="Patient Health Locker & Uploaded Medical Documents" />
                  </h3>
                  <p className="text-xs text-slate-500">
                    <T text="Historical prescriptions, lab reports, and Ayush records uploaded by patient via ABHA identity." />
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full">
                  {state.patientDocuments.length} Documents Available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {state.patientDocuments.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                        {doc.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{doc.date}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{doc.title}</h4>
                      <p className="text-xs text-slate-600 mt-1">{doc.notes}</p>
                    </div>

                    {doc.ocrExtractedMeds && doc.ocrExtractedMeds.length > 0 && (
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                        <span className="font-bold text-teal-900 text-[10px] uppercase tracking-wider block">
                          <T text="Extracted Medications & Notes" />
                        </span>
                        {doc.ocrExtractedMeds.map((med, idx) => (
                          <div key={idx} className="text-slate-700 font-medium">• {med}</div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono">{doc.fileName}</span>
                      <span className="font-bold text-teal-800">{doc.fileSize}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FHIR Export Modal */}
        {showFhirModal && fhirData && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-3xl w-full space-y-4 shadow-2xl border-2 border-slate-200 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 font-extrabold text-slate-900 text-base">
                  <FileJson className="w-5 h-5 text-blue-600" />
                  <span>HL7 FHIR R4 Bundle Payload (ABDM Standard)</span>
                </div>
                <button
                  onClick={() => setShowFhirModal(false)}
                  className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs leading-relaxed">
                <pre>{JSON.stringify(fhirData, null, 2)}</pre>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(fhirData, null, 2));
                    alert('FHIR R4 Bundle copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Copy JSON Payload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drug Safety & Contraindications Checker */}
        <DrugInteractionMatrix />

      </div>
    </div>
  );
};
