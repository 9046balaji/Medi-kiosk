import React, { useState } from 'react';
import { T } from '../../../../context/TranslationContext';
import { PastMedicineItem } from './types';
import { Pill, X } from 'lucide-react';

interface AddPastMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (medicine: PastMedicineItem) => void;
}

export const AddPastMedicineModal: React.FC<AddPastMedicineModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState<string>('');
  const [formulation, setFormulation] = useState<PastMedicineItem['formulation']>('Tablet');
  const [dosage, setDosage] = useState<string>('20mg');
  const [frequency, setFrequency] = useState<string>('Once daily (1-0-0) AC');
  const [system, setSystem] = useState<PastMedicineItem['system']>('Allopathic');
  const [prescribedBy, setPrescribedBy] = useState<string>('Dr. Arvind Sharma');
  const [startDate, setStartDate] = useState<string>('Jan 2024');
  const [endDate, setEndDate] = useState<string>('Dec 2024');
  const [discontinuationReason, setDiscontinuationReason] = useState<PastMedicineItem['discontinuationReason']>('Switched / Replaced');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;

    onAdd({
      id: `past-med-${Date.now()}`,
      name: name.trim(),
      formulation,
      dosage: dosage.trim() || 'Standard',
      frequency: frequency.trim() || 'Daily',
      system,
      prescribedBy: prescribedBy.trim() || 'Physician',
      startDate: startDate.trim() || 'Past',
      endDate: endDate.trim() || 'Discontinued',
      discontinuationReason,
      notes: notes.trim() || 'Past medication record'
    });

    setName('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900"><T text="Add Past Used Medication" /></h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium"><T text="Record previous medicines, syrups or Ayurvedic churnas used in the past." /></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Medicine / Formulation Name" /></label>
            <input
              type="text"
              placeholder="e.g. Cap. Omeprazole 20mg, Shankha Vati, Digene..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-2xl font-medium outline-none focus:ring-2 ring-emerald-500 text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Type" /></label>
              <select
                value={formulation}
                onChange={(e) => setFormulation(e.target.value as any)}
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-bold outline-none bg-white cursor-pointer text-sm sm:text-base"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Churna">Churna</option>
                <option value="Vati">Vati</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
              </select>
            </div>

            <div>
              <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Medical System" /></label>
              <select
                value={system}
                onChange={(e) => setSystem(e.target.value as any)}
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-bold outline-none bg-white cursor-pointer text-sm sm:text-base"
              >
                <option value="Allopathic">Allopathic</option>
                <option value="Ayurvedic">Ayurvedic</option>
                <option value="Homeopathic">Homeopathic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Usage Period" /></label>
              <input
                type="text"
                placeholder="e.g. Jan 2024 - Dec 2024"
                value={`${startDate} - ${endDate}`}
                onChange={(e) => {
                  const parts = e.target.value.split('-');
                  if (parts[0]) setStartDate(parts[0].trim());
                  if (parts[1]) setEndDate(parts[1].trim());
                }}
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-medium outline-none text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Discontinuation Reason" /></label>
              <select
                value={discontinuationReason}
                onChange={(e) => setDiscontinuationReason(e.target.value as any)}
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-bold outline-none bg-white cursor-pointer text-sm sm:text-base"
              >
                <option value="Switched / Replaced">Switched / Replaced</option>
                <option value="Completed Course">Completed Course</option>
                <option value="Tapered Off">Tapered Off</option>
                <option value="Side Effect / Discontinued">Side Effect / Discontinued</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Prescribing Doctor & Notes" /></label>
            <textarea
              rows={2}
              placeholder="e.g. Switched to Pantoprazole for better hyperacidity control..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-medium outline-none text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl text-sm cursor-pointer"
          >
            <T text="Cancel" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-md cursor-pointer disabled:opacity-50 transition-all"
          >
            <T text="Save Past Medicine" />
          </button>
        </div>
      </div>
    </div>
  );
};
