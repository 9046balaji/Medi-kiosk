import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import {
  Users,
  Activity,
  PhoneCall,
  Settings,
  ArrowLeft,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export const NurseSettingsScreen: React.FC = () => {
  const navigate = useNavigate();

  const [p1AlertSound, setP1AlertSound] = useState<boolean>(true);
  const [autoRefreshQueue, setAutoRefreshQueue] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/profile/nurse')}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <T text="Back to Nurse Profile" />
          </button>

          <span className="text-xs font-mono font-bold px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full">
            <T text="Nurse Station Settings" />
          </span>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            <T text="Triage Station & Alarm Preferences" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            <T text="Configure P1 emergency chime alerts, auto-refresh live queue feeds, and telemetry thresholds." />
          </p>
        </div>

        {/* Settings Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900"><T text="Audible P1 Emergency Chime" /></div>
                <div className="text-slate-500"><T text="Plays audio alert on Nurse Console when cardiac red-flag is triggered at kiosk" /></div>
              </div>
              <input
                type="checkbox"
                checked={p1AlertSound}
                onChange={(e) => setP1AlertSound(e.target.checked)}
                className="w-5 h-5 accent-teal-600 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900"><T text="Auto-Refresh Live Queue Feed" /></div>
                <div className="text-slate-500"><T text="Refreshes queue items every 5 seconds" /></div>
              </div>
              <input
                type="checkbox"
                checked={autoRefreshQueue}
                onChange={(e) => setAutoRefreshQueue(e.target.checked)}
                className="w-5 h-5 accent-teal-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-teal-600/30 cursor-pointer"
            >
              {saved ? <T text="✓ Triage Settings Saved" /> : <T text="Save Nurse Station Settings" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
