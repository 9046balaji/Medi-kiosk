import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T, useTranslation } from '../../../context/TranslationContext';
import { DrugInteractionMatrix } from '../../common/DrugInteractionMatrix';
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
  Share2
} from 'lucide-react';

export const DoctorDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = useMediKiosk();

  const isAyurvedicParam = location.search.includes('mode=ayurvedic') || state.mode === 'ayurvedic';

  const [activeTab, setActiveTab] = useState<'soap' | 'dashavidha' | 'dual'>(
    isAyurvedicParam ? 'dashavidha' : 'soap'
  );
  const [showProvenanceDrawer, setShowProvenanceDrawer] = useState<boolean>(false);

  const handleToggleLock = () => {
    state.lockDraft();
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border-2 border-slate-200 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-lg shadow-teal-600/30">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  <T text="Clinician Workstation" />
                </h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-teal-100 text-teal-800 border border-teal-200 rounded-full">
                  NDHM Doctor Reg #8842
                </span>
              </div>
              <p className="text-xs text-slate-500">
                <T text="Pre-populated clinical intake generated from Patient Voice ASR & Scanned OCR." />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProvenanceDrawer(!showProvenanceDrawer)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-teal-800 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Info className="w-4 h-4 text-teal-600" />
              <T text="'Why?' AI Provenance" />
            </button>

            <button
              onClick={handleToggleLock}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
                state.isDraftLocked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
              }`}
            >
              {state.isDraftLocked ? (
                <>
                  <Lock className="w-4 h-4" />
                  <T text="Signed & Locked" />
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
        <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
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
            <div className="font-bold text-amber-800"><T text="Amlapitta (Gastritis)" /></div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]"><T text="EHR Status" /></div>
            <div className="font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> <T text="ABDM Verified" />
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
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
            <T text="Vaidya Dashavidha Matrix" />
          </button>

          <button
            onClick={() => setActiveTab('dual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dual' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <T text="Dual Integrated Mode" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-6">
          {activeTab === 'soap' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-teal-800 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                <T text="Allopathic SOAP Pre-Populated Clinical Note" />
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-bold text-teal-900 uppercase tracking-wider"><T text="S — Subjective History" /></div>
                  <p className="text-slate-800 leading-relaxed font-mono">
                    <T text="45yo male presenting with 3-week history of epigastric burning pain, worsening 45min post-prandial. Associated with sour belching and nocturnal acid regurgitation." />
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-bold text-teal-900 uppercase tracking-wider"><T text="O — Objective Examination" /></div>
                  <p className="text-slate-800 leading-relaxed font-mono">
                    <T text="Vitals: BP 128/82, HR 76, Temp 98.4F, SpO2 98%. Epigastric tenderness present on deep palpation. No guarding or rigidity." />
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dashavidha' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-amber-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <T text="Ayush 10-Fold Dashavidha Pariksha Matrix" />
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-500 text-[10px]"><T text="Prakriti (Constitution)" /></div>
                  <div className="font-bold text-amber-900"><T text="Pitta-Kapha" /></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-500 text-[10px]"><T text="Vikriti (Morbidity)" /></div>
                  <div className="font-bold text-amber-900"><T text="Pitta Vriddhi (High)" /></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-500 text-[10px]"><T text="Agni (Digestive Fire)" /></div>
                  <div className="font-bold text-amber-900"><T text="Tikshnagni (Intense)" /></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-500 text-[10px]"><T text="Kosta (Bowel Habit)" /></div>
                  <div className="font-bold text-amber-900"><T text="Krura Kosta" /></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-500 text-[10px]"><T text="Dehabala (Vitality)" /></div>
                  <div className="font-bold text-amber-900"><T text="Madhyama (Moderate)" /></div>
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
        </div>

      </div>
    </div>
  );
};
