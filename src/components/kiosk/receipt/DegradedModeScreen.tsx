import React from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../../../context/TranslationContext';
import {
  WifiOff,
  Cpu,
  AlertTriangle,
  RefreshCw,
  PhoneCall,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

export const DegradedModeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <T text="Back to Main Kiosk" />
          </button>

          <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
            CPU Offline Resiliency Active
          </span>
        </div>

        <div className="p-6 bg-white border-2 border-amber-300 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <WifiOff className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                <T text="Network Connectivity Degraded — Local Mode Active" />
              </h1>
              <p className="text-xs text-slate-500">
                <T text="Cloud translation daemon offline. Falling back to local INT8 quantized model." />
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700 font-medium"><T text="Local Audio Recording" /></span>
              <span className="text-emerald-700 font-bold font-mono"><T text="Operational" /></span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700 font-medium"><T text="Document Scanner" /></span>
              <span className="text-emerald-700 font-bold font-mono"><T text="Operational" /></span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700 font-medium"><T text="Cloud AI Sync" /></span>
              <span className="text-amber-800 font-bold font-mono"><T text="Local Queue" /></span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700 font-medium"><T text="Print Engine" /></span>
              <span className="text-emerald-700 font-bold font-mono"><T text="Operational" /></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
