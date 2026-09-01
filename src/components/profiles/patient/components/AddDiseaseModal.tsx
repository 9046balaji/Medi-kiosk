import React, { useState } from 'react';
import { T } from '../../../../context/TranslationContext';
import { PastCondition } from './types';
import { Activity, X } from 'lucide-react';

interface AddDiseaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (condition: PastCondition) => void;
}

export const AddDiseaseModal: React.FC<AddDiseaseModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState<string>('');
  const [year, setYear] = useState<string>('2025');
  const [severity, setSeverity] = useState<PastCondition['severity']>('Moderate');
  const [status, setStatus] = useState<PastCondition['status']>('Active');
  const [hospital, setHospital] = useState<string>('AIIA OPD Delhi');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;

    onAdd({
      id: `cond-${Date.now()}`,
      name: name.trim(),
      code: 'ICD-10 Chronic Registry',
      diagnosedYear: year,
      severity,
      status,
      hospital: hospital.trim() || 'OPD Clinic',
      notes: notes.trim() || 'Logged by patient'
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
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900"><T text="Add Pre-Existing Disease / Condition" /></h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium"><T text="Save your past chronic illness for automatic doctor reference." /></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Condition / Disease Name" /></label>
            <input
              type="text"
              placeholder="e.g. Asthma, Thyroid, Kidney Stones, Migraine..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-2xl font-medium outline-none focus:ring-2 ring-indigo-500 text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Diagnosed Year" /></label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-medium outline-none text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Severity" /></label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-bold outline-none bg-white cursor-pointer text-sm sm:text-base"
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Controlled">Controlled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Diagnosing Hospital / Doctor" /></label>
            <input
              type="text"
              placeholder="e.g. AIIMS Delhi, Dr. Sharma..."
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-medium outline-none text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Notes / Current Medications" /></label>
            <textarea
              rows={2}
              placeholder="e.g. Taking daily inhaler or ayurvedic kadha..."
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
            className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm shadow-md cursor-pointer disabled:opacity-50 transition-all"
          >
            <T text="Save Condition" />
          </button>
        </div>
      </div>
    </div>
  );
};
