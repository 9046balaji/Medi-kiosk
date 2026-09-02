import React from 'react';
import { T } from '../../../../context/TranslationContext';
import { CheckCircle2, Cpu, Activity, AlertTriangle } from 'lucide-react';

interface PatientVitalsStripProps {
  patientName: string;
  patientAge: number;
  opdToken: string;
  isMedGemmaOnline: boolean;
  hasRedFlags: boolean;
}

export const PatientVitalsStrip: React.FC<PatientVitalsStripProps> = ({
  patientName,
  patientAge,
  opdToken,
  isMedGemmaOnline,
  hasRedFlags
}) => {
  return (
    <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 shadow-md grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider"><T text="Patient Name" /></div>
        <div className="font-bold text-white text-sm truncate">{patientName} ({patientAge}y)</div>
      </div>

      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider"><T text="ABHA ID / Token" /></div>
        <div className="font-bold text-teal-400 font-mono text-sm truncate">{opdToken}</div>
      </div>

      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider"><T text="Vitals Telemetry" /></div>
        <div className="font-bold text-slate-200">BP 128/82 • HR 76 • 98% SpO2</div>
      </div>

      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider"><T text="Primary Complaint" /></div>
        <div className="font-bold text-amber-400 truncate"><T text="Amlapitta (Hyperacidity)" /></div>
      </div>

      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider"><T text="AI Microservice Gateway" /></div>
        <div className="font-bold text-purple-400 flex items-center gap-1.5 truncate">
          <Cpu className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>{isMedGemmaOnline ? 'MedGemma + AyurParam Active' : 'Gateway Fallback Active'}</span>
        </div>
      </div>

      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider"><T text="Triage / EHR Status" /></div>
        <div className={`font-bold flex items-center gap-1 ${hasRedFlags ? 'text-red-400' : 'text-emerald-400'}`}>
          {hasRedFlags ? <AlertTriangle className="w-3.5 h-3.5 animate-bounce" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>{hasRedFlags ? 'Red Flag Alert!' : 'ABDM Level-3 Synced'}</span>
        </div>
      </div>
    </div>
  );
};
