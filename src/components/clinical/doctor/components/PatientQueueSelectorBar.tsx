import React from 'react';
import { useMediKiosk } from '../../../../context/MediKioskContext';
import { T } from '../../../../context/TranslationContext';
import { PatientQueueItem } from '../../../../types';
import { Users, Clock, AlertTriangle, ChevronRight, UserCheck } from 'lucide-react';

interface PatientQueueSelectorBarProps {
  activeToken: string;
  onSelectPatient: (patient: PatientQueueItem) => void;
}

export const PatientQueueSelectorBar: React.FC<PatientQueueSelectorBarProps> = ({
  activeToken,
  onSelectPatient
}) => {
  const state = useMediKiosk();

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 shadow-lg space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-black text-slate-200">
          <Users className="w-4 h-4 text-teal-400" />
          <span><T text="Active OPD Patient Queue" /> ({state.patientQueue.length} <T text="Patients Waiting" />)</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">
          Select patient to load intake history & vitals
        </span>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
        {state.patientQueue.map((patient) => {
          const isSelected = activeToken === patient.token || state.opdToken === patient.token;

          return (
            <button
              key={patient.token}
              onClick={() => {
                state.selectQueuePatient(patient);
                onSelectPatient(patient);
              }}
              className={`p-3 rounded-xl border transition-all text-left shrink-0 min-w-[200px] cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-400 shadow-md scale-[1.02]'
                  : patient.priority === 'P1'
                  ? 'bg-red-950/40 border-red-500/50 text-slate-200 hover:bg-red-900/40'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-mono font-bold text-xs">{patient.token}</span>
                <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full uppercase ${
                  patient.priority === 'P1'
                    ? 'bg-red-600 text-white animate-pulse'
                    : patient.priority === 'P2'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                }`}>
                  {patient.priority}
                </span>
              </div>

              <div className="font-bold text-xs truncate w-full">{patient.name}</div>
              <div className="text-[10px] opacity-80 mt-0.5 truncate flex items-center justify-between">
                <span>{patient.age}y • {patient.gender}</span>
                <span className="font-mono font-semibold">{patient.waitTime} wait</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
