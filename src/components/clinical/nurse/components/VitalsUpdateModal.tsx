import React, { useState } from 'react';
import { T } from '../../../../context/TranslationContext';
import { PatientQueueItem } from '../../../../types';
import { Activity, X, Heart, Thermometer, Droplet, CheckCircle2 } from 'lucide-react';

interface VitalsUpdateModalProps {
  patient: PatientQueueItem;
  onClose: () => void;
  onSaveVitals: (updatedPatient: PatientQueueItem) => void;
}

export const VitalsUpdateModal: React.FC<VitalsUpdateModalProps> = ({
  patient,
  onClose,
  onSaveVitals
}) => {
  const [bp, setBp] = useState<string>('128/82');
  const [hr, setHr] = useState<string>('76');
  const [spo2, setSpo2] = useState<string>('98');
  const [temp, setTemp] = useState<string>('98.4');
  const [rr, setRr] = useState<string>('16');
  const [glucose, setGlucose] = useState<string>('112');

  // Simple NEWS2 Score Calculator
  const news2Score = Number(hr) > 100 || Number(spo2) < 95 ? 3 : 1;

  const handleSave = () => {
    onSaveVitals({ ...patient });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2.5 font-black text-base text-white">
            <Activity className="w-5 h-5 text-teal-400" />
            <span>Update Vitals & Triage Score ({patient.name})</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white cursor-pointer rounded-lg hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Blood Pressure (mmHg)</label>
            <input type="text" value={bp} onChange={(e) => setBp(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl outline-none font-mono text-white" />
          </div>
          <div>
            <label className="font-bold text-slate-300 block mb-1">Heart Rate (bpm)</label>
            <input type="text" value={hr} onChange={(e) => setHr(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl outline-none font-mono text-white" />
          </div>
          <div>
            <label className="font-bold text-slate-300 block mb-1">SpO2 Oxygen (%)</label>
            <input type="text" value={spo2} onChange={(e) => setSpo2(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl outline-none font-mono text-emerald-400 font-bold" />
          </div>
          <div>
            <label className="font-bold text-slate-300 block mb-1">Body Temp (°F)</label>
            <input type="text" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl outline-none font-mono text-white" />
          </div>
          <div>
            <label className="font-bold text-slate-300 block mb-1">Respiration Rate (/min)</label>
            <input type="text" value={rr} onChange={(e) => setRr(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl outline-none font-mono text-white" />
          </div>
          <div>
            <label className="font-bold text-slate-300 block mb-1">Blood Glucose (mg/dL)</label>
            <input type="text" value={glucose} onChange={(e) => setGlucose(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl outline-none font-mono text-amber-400 font-bold" />
          </div>
        </div>

        {/* Calculated NEWS2 Score */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300">Calculated NEWS2 Clinical Score:</span>
          <span className={`px-2.5 py-0.5 rounded-md font-mono ${news2Score > 2 ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
            NEWS2: {news2Score} ({news2Score > 2 ? 'Moderate Risk' : 'Low Risk'})
          </span>
        </div>

        <div className="pt-2 flex justify-end gap-2.5">
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold rounded-xl text-xs cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer">
            Save Vitals & Score
          </button>
        </div>
      </div>
    </div>
  );
};
