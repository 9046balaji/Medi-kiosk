import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import {
  ShieldCheck,
  Server,
  Award,
  Settings,
  Building2,
  Lock,
  Activity,
  Cpu,
  BarChart3
} from 'lucide-react';

export const AdminProfileScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white font-black text-2xl flex items-center justify-center shadow-lg">
                AD
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Hospital Administrator
                  </h1>
                  <span className="text-xs font-bold px-3 py-1 bg-teal-100 text-teal-800 border border-teal-300 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                    <T text="ABDM Level-3 Network Officer" />
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Node: AIIMS / AIIA Delhi • MoA Node ID: #NODE-DEL-9904
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/settings/system')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Settings className="w-4 h-4 text-teal-700" />
                <span><T text="System Settings" /></span>
              </button>

              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-teal-300 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-teal-400" />
                <span><T text="Admin Analytics" /></span>
              </button>
            </div>

          </div>
        </div>

        {/* Fleet Telemetry Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold uppercase text-slate-500"><T text="Active Kiosk Terminals" /></div>
            <div className="text-3xl font-black text-slate-900">5 Online</div>
            <div className="text-xs text-emerald-700 font-bold"><T text="100% Operational" /></div>
          </div>

          <div className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold uppercase text-slate-500"><T text="IndicTrans2 AI Daemon" /></div>
            <div className="text-3xl font-black text-teal-700">Port 8000</div>
            <div className="text-xs text-teal-800 font-bold"><T text="FP16 Micro-batch 15ms" /></div>
          </div>

          <div className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold uppercase text-slate-500"><T text="DPDP Act Audit Status" /></div>
            <div className="text-3xl font-black text-emerald-600">Zero-Retention</div>
            <div className="text-xs text-emerald-700 font-bold"><T text="Verified 0 Bytes Saved" /></div>
          </div>
        </div>

      </div>
    </div>
  );
};
