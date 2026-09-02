import React from 'react';
import { T } from '../../../../context/TranslationContext';
import {
  Stethoscope,
  Sparkles,
  Flame,
  ShieldCheck,
  FileJson,
  Lock,
  Unlock
} from 'lucide-react';

interface DoctorHeaderProps {
  isSynthesizing: boolean;
  isAyurParamSynthesizing: boolean;
  isCoveAuditing: boolean;
  isDraftLocked: boolean;
  onTriggerSoapSynthesis: () => void;
  onTriggerAyurParamSynthesis: () => void;
  onTriggerCoveAudit: () => void;
  onExportFhirModal: () => void;
  onToggleLock: () => void;
}

export const DoctorHeader: React.FC<DoctorHeaderProps> = ({
  isSynthesizing,
  isAyurParamSynthesizing,
  isCoveAuditing,
  isDraftLocked,
  onTriggerSoapSynthesis,
  onTriggerAyurParamSynthesis,
  onTriggerCoveAudit,
  onExportFhirModal,
  onToggleLock
}) => {
  return (
    <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-md p-5 rounded-3xl shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-teal-500/20 shrink-0">
          <Stethoscope className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              <T text="Doctor Clinical Workstation" />
            </h1>
            <span className="text-xs font-bold px-3 py-1 bg-teal-500/10 text-teal-300 rounded-full border border-teal-500/30">
              Dr. Arvind Sharma (AIIA Room 104)
            </span>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
              ABDM Verified
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            <T text="Review AI Triangulation, MedGemma CoVe Reasoning, and export ABDM FHIR consultation bundle." />
          </p>
        </div>
      </div>

      {/* AI Action Buttons */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          onClick={onTriggerSoapSynthesis}
          disabled={isSynthesizing}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-50"
          title="Synthesize SOAP note with MedGemma 2.1"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>{isSynthesizing ? 'Synthesizing...' : '🤖 MedGemma SOAP'}</span>
        </button>

        <button
          onClick={onTriggerAyurParamSynthesis}
          disabled={isAyurParamSynthesizing}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
          title="Synthesize 10-Fold Dashavidha Assessment with AyurParam GGUF"
        >
          <Flame className="w-4 h-4 text-amber-300" />
          <span>{isAyurParamSynthesizing ? 'Synthesizing...' : '🌿 AyurParam Dashavidha'}</span>
        </button>

        <button
          onClick={onTriggerCoveAudit}
          disabled={isCoveAuditing}
          className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-indigo-200 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer border border-indigo-500/30 shadow-md transition-all active:scale-95 disabled:opacity-50"
          title="Run Chain-of-Verification Audit"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{isCoveAuditing ? 'Auditing...' : '🔍 CoVe Self-Correction'}</span>
        </button>

        <button
          onClick={onExportFhirModal}
          className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-blue-200 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer border border-blue-500/30 shadow-md transition-all active:scale-95"
          title="Export HL7 FHIR R4 Bundle"
        >
          <FileJson className="w-4 h-4 text-blue-400" />
          <span><T text="FHIR R4 Bundle" /></span>
        </button>

        <button
          onClick={onToggleLock}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
            isDraftLocked
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
              : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/30'
          }`}
        >
          {isDraftLocked ? (
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
  );
};
