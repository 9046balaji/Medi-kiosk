import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import {
  Users,
  Clock,
  Activity,
  PhoneCall,
  Settings,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const NurseProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="w-full space-y-6">
        
        {/* Header */}
        <div className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-teal-700/20">
                NR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Sr. Nurse S. Mukherjee
                  </h1>
                  <span className="text-xs font-bold px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full flex items-center gap-1">
                    <T text="Triage Officer Station A" />
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  <T text="Badge:" /> #NUR-402 • <T text="Active Shift:" /> Morning (07:00 – 15:00 IST) • <T text="OPD Ground Floor" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/settings/nurse')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Settings className="w-4 h-4 text-teal-700" />
                <span><T text="Nurse Settings" /></span>
              </button>

              <button
                onClick={() => navigate('/nurse')}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span><T text="Open Nurse Console" /></span>
              </button>
            </div>

          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Duty Specs & Station Equipment Telemetry (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <T text="Station Equipment Connectivity" />
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-800"><T text="Bluetooth Pulse Oximeter" /></span>
                  <span className="text-[10px] font-bold text-emerald-800 font-mono"><T text="Connected" /></span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-800"><T text="Digital NIBP Cuff Monitor" /></span>
                  <span className="text-[10px] font-bold text-emerald-800 font-mono"><T text="Connected" /></span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-800"><T text="Casualty ER Intercom Line" /></span>
                  <span className="text-[10px] font-bold text-emerald-800 font-mono"><T text="Active" /></span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Shift Statistics & Emergency Routing Log (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-sm text-center">
                <div className="text-xs text-slate-500"><T text="Patients Triaged" /></div>
                <div className="text-3xl font-black text-slate-900">48</div>
                <div className="text-[10px] text-teal-700 font-bold"><T text="100% processed" /></div>
              </div>

              <div className="p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-sm text-center">
                <div className="text-xs text-slate-500"><T text="P1 Emergencies" /></div>
                <div className="text-3xl font-black text-red-600">3</div>
                <div className="text-[10px] text-red-700 font-bold"><T text="ER Escalated" /></div>
              </div>

              <div className="p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-sm text-center">
                <div className="text-xs text-slate-500"><T text="Shift Time Left" /></div>
                <div className="text-3xl font-black text-emerald-600">2h 45m</div>
                <div className="text-[10px] text-emerald-700 font-bold"><T text="Morning Shift" /></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-red-600" />
                  <T text="Emergency ER Escalation Log" />
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900"><T text="MK-1042 — Rajesh Kumar (45M)" /></div>
                    <div className="text-slate-500"><T text="Acute Retrosternal Chest Burning • BP 128/82 • Routed to Casualty ER" /></div>
                  </div>
                  <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2.5 py-1 rounded-full border border-red-300">
                    <T text="Escalated" />
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
