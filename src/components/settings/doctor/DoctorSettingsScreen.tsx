import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import {
  Stethoscope,
  Sparkles,
  Award,
  KeyRound,
  ShieldCheck,
  Building2,
  Settings,
  ArrowLeft,
  CheckCircle2,
  Sliders,
  AlertTriangle
} from 'lucide-react';

export const DoctorSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  const [defaultStream, setDefaultStream] = useState<'allopathic' | 'ayurvedic' | 'dual'>(state.mode);
  const [alertSensitivity, setAlertSensitivity] = useState<'high' | 'all'>('high');
  const [autoSignEnabled, setAutoSignEnabled] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSaveSettings = () => {
    state.setMode(defaultStream);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/profile/doctor')}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <T text="Back to Doctor Profile" />
          </button>

          <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
            <T text="Doctor Console Settings" />
          </span>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            <T text="Clinical Workstation Preferences" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            <T text="Configure default OPD consultation stream, drug interaction alert thresholds, and e-Signature settings." />
          </p>
        </div>

        {/* Settings Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          
          {/* Default Consultation Stream */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              1. <T text="Default Clinical Consultation Stream" />
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <button
                onClick={() => setDefaultStream('allopathic')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  defaultStream === 'allopathic'
                    ? 'border-teal-600 bg-teal-50 shadow-md font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900"><T text="Allopathic SOAP" /></div>
                <div className="text-[11px] text-slate-500 mt-1"><T text="Focus on SOCRATES Intake & ICD-10 Codings" /></div>
              </button>

              <button
                onClick={() => setDefaultStream('ayurvedic')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  defaultStream === 'ayurvedic'
                    ? 'border-amber-600 bg-amber-50 shadow-md font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900"><T text="Vaidya Dashavidha" /></div>
                <div className="text-[11px] text-slate-500 mt-1"><T text="Ayush 10-fold Pariksha & Pathya Advisories" /></div>
              </button>

              <button
                onClick={() => setDefaultStream('dual')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  defaultStream === 'dual'
                    ? 'border-indigo-600 bg-indigo-50 shadow-md font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-slate-900"><T text="Dual Integrated" /></div>
                <div className="text-[11px] text-slate-500 mt-1"><T text="Combined Allopathic + Ayush Assessment" /></div>
              </button>
            </div>
          </div>

          {/* Drug Interaction Alerts */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              2. <T text="Drug Interaction Alert Sensitivity" />
            </h2>

            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => setAlertSensitivity('high')}
                className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  alertSensitivity === 'high' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <T text="High Risk Contraindications Only" />
              </button>

              <button
                onClick={() => setAlertSensitivity('all')}
                className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  alertSensitivity === 'all' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <T text="Show All (High, Moderate & Synergy)" />
              </button>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-teal-600/30 cursor-pointer"
            >
              {saved ? <T text="✓ Doctor Workstation Settings Saved" /> : <T text="Save Doctor Workstation Settings" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
