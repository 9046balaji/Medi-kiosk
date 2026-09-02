import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import { ShiftHandoffModal } from './ShiftHandoffModal';
import { speakText } from '../../../lib/speechUtils';
import { PatientQueueItem } from '../../../types';

import { NurseHeader } from './components/NurseHeader';
import { TriageMetricsBar } from './components/TriageMetricsBar';
import { PatientQueueCard } from './components/PatientQueueCard';
import { VitalsUpdateModal } from './components/VitalsUpdateModal';
import { EmergencyEscalationModal } from './components/EmergencyEscalationModal';

import { UserPlus, X } from 'lucide-react';

export const NurseConsoleScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<'all' | 'P1' | 'P2' | 'P3'>('all');
  const [showHandoffModal, setShowHandoffModal] = useState<boolean>(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Vitals Update Modal State
  const [vitalsPatientModal, setVitalsPatientModal] = useState<PatientQueueItem | null>(null);

  // Emergency Escalation Modal State
  const [emergencyModalPatient, setEmergencyModalPatient] = useState<PatientQueueItem | null>(null);

  // New patient modal inputs
  const [newPatientName, setNewPatientName] = useState<string>('');
  const [newPatientAge, setNewPatientAge] = useState<string>('30');
  const [newPatientGender, setNewPatientGender] = useState<string>('Male');
  const [newPatientPriority, setNewPatientPriority] = useState<'P1' | 'P2' | 'P3'>('P2');

  const filteredQueue = selectedPriorityFilter === 'all'
    ? state.patientQueue
    : state.patientQueue.filter((p) => p.priority === selectedPriorityFilter);

  const p1Count = state.patientQueue.filter((p) => p.priority === 'P1').length;
  const p2Count = state.patientQueue.filter((p) => p.priority === 'P2').length;
  const p3Count = state.patientQueue.filter((p) => p.priority === 'P3').length;

  const handleCallNextPatient = (token: string, name: string) => {
    speakText(`Calling Token ${token}, ${name}, to OPD Consultation Room 104`, state.language);
  };

  const handleAddPatient = () => {
    if (!newPatientName.trim()) return;
    const newToken = `MK-${Math.floor(1000 + Math.random() * 9000)}`;
    state.addPatientToQueue({
      token: newToken,
      name: newPatientName.trim(),
      age: Number(newPatientAge) || 30,
      gender: newPatientGender,
      priority: newPatientPriority,
      waitTime: '0m',
      status: 'waiting'
    });
    setNewPatientName('');
    setShowAddPatientModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-3 sm:p-5 lg:p-6 space-y-5 font-sans">
      
      {showHandoffModal && (
        <ShiftHandoffModal onClose={() => setShowHandoffModal(false)} />
      )}

      {vitalsPatientModal && (
        <VitalsUpdateModal
          patient={vitalsPatientModal}
          onClose={() => setVitalsPatientModal(null)}
          onSaveVitals={(updated) => setVitalsPatientModal(null)}
        />
      )}

      {emergencyModalPatient && (
        <EmergencyEscalationModal
          patientName={emergencyModalPatient.name}
          opdToken={emergencyModalPatient.token}
          symptoms="Acute chest pressure, breathlessness, diaphoresis"
          onClose={() => setEmergencyModalPatient(null)}
          onConfirmErTransfer={() => {
            state.routePatientToEr(emergencyModalPatient.token);
            setEmergencyModalPatient(null);
          }}
        />
      )}

      {/* Add Walk-in Patient Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2.5 font-black text-base text-white">
                <UserPlus className="w-5 h-5 text-teal-400" />
                <span><T text="Register OPD Walk-In Patient" /></span>
              </div>
              <button onClick={() => setShowAddPatientModal(false)} className="p-1.5 text-slate-400 hover:text-white cursor-pointer rounded-lg hover:bg-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1.5"><T text="Patient Name" /></label>
                <input
                  type="text"
                  placeholder="Full Name..."
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl outline-none font-medium text-white focus:ring-2 ring-teal-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1.5"><T text="Age" /></label>
                  <input
                    type="number"
                    value={newPatientAge}
                    onChange={(e) => setNewPatientAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl outline-none font-medium text-white focus:ring-2 ring-teal-500/50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1.5"><T text="Gender" /></label>
                  <select
                    value={newPatientGender}
                    onChange={(e) => setNewPatientGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl outline-none font-medium text-white focus:ring-2 ring-teal-500/50"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1.5"><T text="Triage Priority Tier" /></label>
                <div className="flex items-center gap-2">
                  {(['P1', 'P2', 'P3'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPatientPriority(p)}
                      className={`flex-1 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-xs ${
                        newPatientPriority === p
                          ? p === 'P1'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                            : p === 'P2'
                            ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                            : 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      {p} ({p === 'P1' ? 'Emergency' : p === 'P2' ? 'Urgent' : 'Routine'})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                onClick={() => setShowAddPatientModal(false)}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                <T text="Cancel" />
              </button>

              <button
                onClick={handleAddPatient}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-teal-600/30 cursor-pointer"
              >
                <T text="Add Patient to Queue" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto space-y-5">
        
        {/* ── HEADER COMMAND BAR ────────────────────────────────────────────── */}
        <NurseHeader
          onShowAddPatientModal={() => setShowAddPatientModal(true)}
          onShowHandoffModal={() => setShowHandoffModal(true)}
        />

        {/* ── REAL-TIME METRICS & PRIORITY COUNTERS ─────────────────────────── */}
        <TriageMetricsBar
          totalQueue={state.patientQueue.length}
          p1Count={p1Count}
          p2Count={p2Count}
          p3Count={p3Count}
        />

        {/* ── PRIORITY FILTER TABS ───────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setSelectedPriorityFilter('all')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              selectedPriorityFilter === 'all'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <T text="All Queue Items" /> ({state.patientQueue.length})
          </button>

          <button
            onClick={() => setSelectedPriorityFilter('P1')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              selectedPriorityFilter === 'P1'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-slate-800 border border-red-500/30 text-red-400 hover:bg-slate-700'
            }`}
          >
            🔴 <T text="P1 Critical Emergency" /> ({p1Count})
          </button>

          <button
            onClick={() => setSelectedPriorityFilter('P2')}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              selectedPriorityFilter === 'P2'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-800 border border-amber-500/30 text-amber-400 hover:bg-slate-700'
            }`}
          >
            🟠 <T text="P2 Urgent" /> ({p2Count})
          </button>
        </div>

        {/* ── PATIENT QUEUE CARDS LIST ────────────────────────────────────────── */}
        <div className="space-y-4">
          {filteredQueue.map((patient) => (
            <PatientQueueCard
              key={patient.token}
              patient={patient}
              isPlayingAudio={isPlayingAudio}
              onCallLoudspeaker={handleCallNextPatient}
              onToggleAudioPlayback={() => setIsPlayingAudio(!isPlayingAudio)}
              onOpenVitalsModal={(p) => setVitalsPatientModal(p)}
              onOpenEmergencyModal={(p) => setEmergencyModalPatient(p)}
              onSendToDoctor={() => {
                state.selectQueuePatient(patient);
                navigate('/doctor');
              }}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
