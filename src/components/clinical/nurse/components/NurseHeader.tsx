import React from 'react';
import { T } from '../../../../context/TranslationContext';
import { Activity, UserPlus, FileSpreadsheet } from 'lucide-react';

interface NurseHeaderProps {
  onShowAddPatientModal: () => void;
  onShowHandoffModal: () => void;
}

export const NurseHeader: React.FC<NurseHeaderProps> = ({
  onShowAddPatientModal,
  onShowHandoffModal
}) => {
  return (
    <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-md p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center font-bold shadow-lg shadow-red-500/20 shrink-0">
          <Activity className="w-7 h-7 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              <T text="Nurse Triage Console & Station A Queue" />
            </h1>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
              Station A • Duty Nurse #NUR-402
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            <T text="Monitor real-time patient queue, audio recordings, vitals telemetry, and P1 casualty escalations." />
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onShowAddPatientModal}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-teal-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <T text="Register Walk-In Patient" />
        </button>

        <button
          onClick={onShowHandoffModal}
          className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4 text-teal-400" />
          <T text="Shift Handoff Report" />
        </button>
      </div>
    </div>
  );
};
