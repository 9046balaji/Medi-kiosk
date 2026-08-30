import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import { ShiftHandoffModal } from './ShiftHandoffModal';
import {
  Users,
  AlertTriangle,
  Heart,
  Activity,
  Play,
  Pause,
  PhoneCall,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

export const NurseConsoleScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<'all' | 'P1' | 'P2' | 'P3'>('all');
  const [showHandoffModal, setShowHandoffModal] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const filteredQueue = selectedPriorityFilter === 'all'
    ? state.patientQueue
    : state.patientQueue.filter((p) => p.priority === selectedPriorityFilter);

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {showHandoffModal && (
        <ShiftHandoffModal onClose={() => setShowHandoffModal(false)} />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border-2 border-slate-200 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-lg shadow-red-600/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  <T text="Nurse Triage Console & Station A Queue" />
                </h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-red-100 text-red-800 border border-red-200 rounded-full">
                  Station A • Duty Nurse #NUR-402
                </span>
              </div>
              <p className="text-xs text-slate-500">
                <T text="Monitor real-time patient queue, audio recordings, vitals telemetry, and P1 casualty escalations." />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHandoffModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-teal-800 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              <T text="Shift Handoff Report" />
            </button>

            <button
              onClick={() => navigate('/doctor')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span><T text="Open Doctor Dashboard" /></span>
            </button>
          </div>
        </div>

        {/* Priority Filter Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setSelectedPriorityFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedPriorityFilter === 'all' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <T text="All Queue Items" /> ({state.patientQueue.length})
            </button>

            <button
              onClick={() => setSelectedPriorityFilter('P1')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedPriorityFilter === 'P1' ? 'bg-red-600 text-white shadow-sm' : 'bg-white border border-red-200 text-red-700 hover:bg-red-50'
              }`}
            >
              <T text="P1 Critical Emergency" /> (1)
            </button>

            <button
              onClick={() => setSelectedPriorityFilter('P2')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedPriorityFilter === 'P2' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50'
              }`}
            >
              <T text="P2 Urgent" /> (1)
            </button>
          </div>
        </div>

        {/* Patient Queue Cards Grid */}
        <div className="space-y-4">
          {filteredQueue.map((patient) => (
            <div
              key={patient.token}
              className={`p-5 rounded-3xl border-2 transition-all space-y-4 ${
                patient.priority === 'P1'
                  ? 'border-red-300 bg-red-50/70 shadow-lg'
                  : 'border-slate-200 bg-white shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-bold font-mono text-sm flex items-center justify-center">
                    {patient.token}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{patient.name}</h3>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        patient.priority === 'P1' ? 'bg-red-600 text-white animate-pulse' : 'bg-teal-100 text-teal-800 border border-teal-200'
                      }`}>
                        <T text={patient.priority} />
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {patient.age}y • {patient.gender} • Wait: <span className="text-amber-800 font-bold font-mono">{patient.waitTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-teal-800 border border-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {isPlayingAudio ? <Pause className="w-3.5 h-3.5 text-teal-600" /> : <Play className="w-3.5 h-3.5 text-teal-600" />}
                    <T text="Play Kiosk Voice Intake" />
                  </button>

                  <button
                    onClick={() => navigate('/doctor')}
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <T text="Send to Doctor Console" />
                  </button>
                </div>
              </div>

              {/* Vitals Telemetry Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px]"><T text="Blood Pressure" /></span>
                  <div className="font-bold text-slate-900 font-mono">128/82 mmHg</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px]"><T text="Heart Rate" /></span>
                  <div className="font-bold text-slate-900 font-mono">76 bpm</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px]"><T text="SpO2 Oxygen" /></span>
                  <div className="font-bold text-emerald-700 font-mono">98%</div>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px]"><T text="Body Temp" /></span>
                  <div className="font-bold text-slate-900 font-mono">98.4 °F</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
