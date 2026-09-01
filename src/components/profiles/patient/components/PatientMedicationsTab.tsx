import React, { useState } from 'react';
import { T } from '../../../../context/TranslationContext';
import { PastMedicineItem } from './types';
import { AddPastMedicineModal } from './AddPastMedicineModal';
import {
  Pill,
  Volume2,
  Clock,
  History,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface PatientMedicationsTabProps {
  onPlayTts: (text: string) => void;
}

export const PatientMedicationsTab: React.FC<PatientMedicationsTabProps> = ({ onPlayTts }) => {
  const [showAddPastMedModal, setShowAddPastMedModal] = useState<boolean>(false);

  // Pre-loaded Past Medications History for Rajesh Kumar
  const [pastMedicines, setPastMedicines] = useState<PastMedicineItem[]>([
    {
      id: 'pmed-1',
      name: 'Cap. Omeprazole 20mg',
      formulation: 'Capsule',
      dosage: '20mg',
      frequency: 'Once Daily (1-0-0) AC',
      system: 'Allopathic',
      prescribedBy: 'Dr. Arvind Sharma (AIIA OPD)',
      startDate: 'Jan 2024',
      endDate: 'Dec 2024',
      discontinuationReason: 'Switched / Replaced',
      notes: 'Switched to Tab. Pantoprazole 40mg for superior control of nocturnal acid regurgitation.'
    },
    {
      id: 'pmed-2',
      name: 'Tab. Telmisartan 40mg',
      formulation: 'Tablet',
      dosage: '40mg',
      frequency: 'Once Daily Morning',
      system: 'Allopathic',
      prescribedBy: 'Apollo Clinic Delhi',
      startDate: 'Mar 2023',
      endDate: 'Nov 2023',
      discontinuationReason: 'Tapered Off',
      notes: 'Blood pressure stabilized to 124/80 on dietary salt reduction and morning walking; tapered off.'
    },
    {
      id: 'pmed-3',
      name: 'Shankha Vati 250mg',
      formulation: 'Vati',
      dosage: '250mg',
      frequency: 'Twice Daily (1-0-1) PC with warm water',
      system: 'Ayurvedic',
      prescribedBy: 'Dr. Arvind Sharma (MD Ayush)',
      startDate: 'May 2024',
      endDate: 'Jun 2024',
      discontinuationReason: 'Completed Course',
      notes: 'Deepana-Pachana formulation used for 30 days to improve digestive fire (Agni).'
    },
    {
      id: 'pmed-4',
      name: 'Syrup Digene 10ml',
      formulation: 'Syrup',
      dosage: '10ml',
      frequency: 'SOS (As needed after spicy meals)',
      system: 'Allopathic',
      prescribedBy: 'Self / OTC Pharmacy',
      startDate: 'Dec 2023',
      endDate: 'Jan 2024',
      discontinuationReason: 'Side Effect / Discontinued',
      notes: 'Discontinued due to temporary symptomatic relief only; initiated formal Ayurvedic consultation.'
    },
    {
      id: 'pmed-5',
      name: 'Triphala Churna 5g',
      formulation: 'Churna',
      dosage: '5g',
      frequency: 'Once at bedtime with lukewarm water',
      system: 'Ayurvedic',
      prescribedBy: 'AIIA Panchakarma Unit',
      startDate: 'Nov 2025',
      endDate: 'Dec 2025',
      discontinuationReason: 'Completed Course',
      notes: 'Used for mild bowel cleansing and Pitta regulation prior to 7-day Virechana Karma.'
    }
  ]);

  const handleAddPastMedicine = (medicine: PastMedicineItem) => {
    setPastMedicines((prev) => [medicine, ...prev]);
  };

  const handleDeletePastMedicine = (id: string) => {
    setPastMedicines((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6 w-full">
      <AddPastMedicineModal
        isOpen={showAddPastMedModal}
        onClose={() => setShowAddPastMedModal(false)}
        onAdd={handleAddPastMedicine}
      />

      {/* ─── SECTION 1: Active Prescriptions ─── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xl space-y-5 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Pill className="w-6 h-6 text-teal-600" />
              <span><T text="Active Prescribed Medications & Dosages" /></span>
            </h3>
            <p className="text-sm text-slate-600 font-medium mt-0.5">
              <T text="Currently active ongoing prescriptions prescribed by your attending doctor." />
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-teal-100 text-teal-900 px-3.5 py-1.5 rounded-full border border-teal-300">
            3 Active Regimens
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {/* Active Med 1 */}
          <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-3 flex flex-col justify-between shadow-xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between font-black text-slate-900 text-base">
                <span>Tab. Pantoprazole 40mg</span>
                <span className="text-xs px-2.5 py-1 bg-teal-100 text-teal-900 rounded-lg font-mono font-bold border border-teal-300">
                  1-0-0 (AC)
                </span>
              </div>
              <p className="text-slate-700 font-medium text-sm leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                Take once daily on an empty stomach in the morning before breakfast.
              </p>
              <div className="text-xs text-teal-900 font-extrabold">Dr. Arvind Sharma (AIIA OPD)</div>
            </div>

            <button
              onClick={() =>
                onPlayTts(
                  'Tab Pantoprazole 40mg. Take once daily on an empty stomach in the morning before breakfast.'
                )
              }
              className="w-full mt-2 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-900 font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-teal-300 shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-teal-700" />
              <span><T text="Listen Dosage Schedule" /> 🔊</span>
            </button>
          </div>

          {/* Active Med 2 */}
          <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-3 flex flex-col justify-between shadow-xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between font-black text-slate-900 text-base">
                <span>Avipattikar Churna 3g</span>
                <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg font-mono font-bold border border-amber-300">
                  1-0-1 (PC)
                </span>
              </div>
              <p className="text-slate-700 font-medium text-sm leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                Take twice daily after meals with lukewarm water for Pitta pacification.
              </p>
              <div className="text-xs text-amber-900 font-extrabold">Ayush Formulation (Ministry of Ayush)</div>
            </div>

            <button
              onClick={() =>
                onPlayTts(
                  'Avipattikar Churna 3 grams. Take twice daily after meals with lukewarm water for Pitta pacification.'
                )
              }
              className="w-full mt-2 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-amber-300 shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-amber-700" />
              <span><T text="Listen Dosage Schedule" /> 🔊</span>
            </button>
          </div>

          {/* Active Med 3 */}
          <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-3 flex flex-col justify-between shadow-xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between font-black text-slate-900 text-base">
                <span>Sutshekhar Ras 125mg</span>
                <span className="text-xs px-2.5 py-1 bg-purple-100 text-purple-900 rounded-lg font-mono font-bold border border-purple-300">
                  0-0-1 (HS)
                </span>
              </div>
              <p className="text-slate-700 font-medium text-sm leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                Take once at bedtime with milk or water to prevent nocturnal sour belching.
              </p>
              <div className="text-xs text-purple-900 font-extrabold">Ayush Rasashastra Regimen</div>
            </div>

            <button
              onClick={() =>
                onPlayTts(
                  'Sutshekhar Ras 125 milligrams. Take once at bedtime with milk or water to prevent nocturnal sour belching.'
                )
              }
              className="w-full mt-2 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer border border-purple-300 shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-purple-700" />
              <span><T text="Listen Dosage Schedule" /> 🔊</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: Complete Past Medication History & Discontinued Regimens Registry ─── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xl space-y-5 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <History className="w-6 h-6 text-indigo-600" />
              <span><T text="Past Used Medication History & Discontinued Regimens" /></span>
            </h3>
            <p className="text-sm text-slate-600 font-medium mt-0.5">
              <T text="All previous allopathic medicines, syrups, and Ayurvedic formulations taken in the past." />
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() =>
                onPlayTts(
                  `Past medication history includes ${pastMedicines.length} previous medicines: ${pastMedicines
                    .map((m) => m.name)
                    .join(', ')}`
                )
              }
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span><T text="Listen Past Medicines" /> 🔊</span>
            </button>

            <button
              onClick={() => setShowAddPastMedModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span><T text="Add Past Medicine" /></span>
            </button>
          </div>
        </div>

        {/* Past Medicines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
          {pastMedicines.map((med) => (
            <div
              key={med.id}
              className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/80 hover:bg-white hover:border-indigo-500 transition-all shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-lg font-bold text-xs ${
                      med.system === 'Ayurvedic'
                        ? 'bg-amber-100 text-amber-950 border border-amber-300'
                        : 'bg-teal-100 text-teal-950 border border-teal-300'
                    }`}
                  >
                    {med.system} • {med.formulation}
                  </span>

                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-200 text-slate-800 rounded-md">
                    {med.discontinuationReason}
                  </span>
                </div>

                <h4 className="font-black text-slate-900 text-base leading-snug">{med.name}</h4>
                <div className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200 inline-block">
                  <strong>Dosage:</strong> {med.dosage} ({med.frequency})
                </div>

                <div className="text-xs text-slate-600 font-mono font-semibold">
                  <strong>Period:</strong> {med.startDate} ➔ {med.endDate}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200">
                  {med.notes}
                </p>

                <div className="text-xs text-slate-500 font-semibold">Prescribed by: {med.prescribedBy}</div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() =>
                    onPlayTts(
                      `${med.name}. Used from ${med.startDate} to ${med.endDate}. ${med.notes}`
                    )
                  }
                  className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-indigo-800 rounded-xl flex items-center gap-1.5 font-bold text-xs cursor-pointer border border-slate-300"
                  title="Listen with TTS"
                >
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <span>Listen 🔊</span>
                </button>

                <button
                  onClick={() => handleDeletePastMedicine(med.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 cursor-pointer"
                  title="Remove Past Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
