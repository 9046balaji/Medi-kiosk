import React from 'react';
import { T } from '../../../../context/TranslationContext';
import { PatientQueueItem } from '../../../../types';
import { Megaphone, Play, Pause, ArrowRight, Activity, AlertTriangle } from 'lucide-react';

interface PatientQueueCardProps {
  patient: PatientQueueItem;
  isPlayingAudio: boolean;
  onCallLoudspeaker: (token: string, name: string) => void;
  onToggleAudioPlayback: () => void;
  onOpenVitalsModal: (patient: PatientQueueItem) => void;
  onOpenEmergencyModal: (patient: PatientQueueItem) => void;
  onSendToDoctor: () => void;
}

export const PatientQueueCard: React.FC<PatientQueueCardProps> = ({
  patient,
  isPlayingAudio,
  onCallLoudspeaker,
  onToggleAudioPlayback,
  onOpenVitalsModal,
  onOpenEmergencyModal,
  onSendToDoctor
}) => {
  const isP1 = patient.priority === 'P1';

  return (
    <div
      className={`p-5 rounded-3xl border transition-all space-y-4 ${
        isP1
          ? 'border-red-500/60 bg-red-950/30 shadow-xl shadow-red-950/40'
          : 'border-slate-700/80 bg-slate-800/80 shadow-lg'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 text-teal-300 font-bold font-mono text-base flex items-center justify-center shrink-0">
            {patient.token}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold text-white">{patient.name}</h3>
              <span className={`px-3 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                isP1
                  ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-600/50'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                <T text={patient.priority} /> Priority
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {patient.age}y • {patient.gender} • Wait Time: <span className="text-amber-300 font-bold font-mono">{patient.waitTime}</span>
            </div>
          </div>
        </div>

        {/* Queue Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {isP1 && (
            <button
              onClick={() => onOpenEmergencyModal(patient)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-red-600/40 animate-pulse active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>ROUTER TO ER</span>
            </button>
          )}

          <button
            onClick={() => onCallLoudspeaker(patient.token, patient.name)}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Call Patient via Loudspeaker TTS"
          >
            <Megaphone className="w-4 h-4 text-amber-400" />
            <T text="Call Loudspeaker" />
          </button>

          <button
            onClick={onToggleAudioPlayback}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            {isPlayingAudio ? <Pause className="w-4 h-4 text-teal-400" /> : <Play className="w-4 h-4 text-teal-400" />}
            <T text="Play Voice Intake" />
          </button>

          <button
            onClick={() => onOpenVitalsModal(patient)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Update Vitals</span>
          </button>

          <button
            onClick={onSendToDoctor}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/30 cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <span><T text="Send to Doctor Console" /></span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vitals Telemetry Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs pt-3 border-t border-slate-700/60">
        <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
          <span className="text-slate-400 text-[10px] font-bold uppercase"><T text="Blood Pressure" /></span>
          <div className="font-bold text-white font-mono text-sm">128/82 mmHg</div>
        </div>
        <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
          <span className="text-slate-400 text-[10px] font-bold uppercase"><T text="Heart Rate" /></span>
          <div className="font-bold text-white font-mono text-sm">76 bpm</div>
        </div>
        <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
          <span className="text-slate-400 text-[10px] font-bold uppercase"><T text="SpO2 Oxygen" /></span>
          <div className="font-bold text-emerald-400 font-mono text-sm">98%</div>
        </div>
        <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
          <span className="text-slate-400 text-[10px] font-bold uppercase"><T text="Body Temp" /></span>
          <div className="font-bold text-white font-mono text-sm">98.4 °F</div>
        </div>
        <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
          <span className="text-slate-400 text-[10px] font-bold uppercase">NEWS2 Risk Score</span>
          <div className="font-bold text-amber-300 font-mono text-sm">Score: 1 (Low)</div>
        </div>
        <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50">
          <span className="text-slate-400 text-[10px] font-bold uppercase">ESI Level</span>
          <div className="font-bold text-teal-300 font-mono text-sm">ESI-3 (Urgent)</div>
        </div>
      </div>
    </div>
  );
};
