import React from 'react';
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
  Users,
  Activity,
  Settings,
  ArrowRight,
  CheckCircle2,
  Lock,
  FileCode,
  Calendar
} from 'lucide-react';

export const DoctorProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="w-full space-y-6">
        
        {/* Header */}
        <div className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-teal-900/20">
                DR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Dr. Arvind Sharma
                  </h1>
                  <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <T text="Senior Vaidya Registrar" />
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  <T text="NDHM Reg:" /> #8842 • <T text="Ayush Reg:" /> #AY-4029 • <T text="Location:" /> OPD Room 104, AIIA Delhi
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/settings/doctor')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Settings className="w-4 h-4 text-teal-700" />
                <span><T text="Doctor Settings" /></span>
              </button>

              <button
                onClick={() => navigate('/doctor')}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Stethoscope className="w-4 h-4" />
                <span><T text="Open Clinical Console" /></span>
              </button>
            </div>

          </div>
        </div>

        {/* 2 Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Credentials & Digital Signatures (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* e-Signature Key Card */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-teal-800">
                    <T text="ABDM Cryptographic Signature Key" />
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                  RSA-2048 SEALED
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs font-mono">
                <div className="text-slate-500 text-[10px]"><T text="Signer Identity Fingerprint" /></div>
                <div className="text-teal-800 font-bold truncate">SHA256: 8f9b4c2e10a9f5d3e8b7c6a5d4e3f2a104c9</div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed">
                <T text="All consultation notes locked by Dr. Arvind Sharma are cryptographically timestamped for ABDM Health Locker transmission." />
              </div>
            </div>

            {/* Department & Specialty Specs */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                <T text="Department & Clinical Scope" />
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-500 text-[10px]"><T text="Institution Node" /></div>
                  <div className="font-bold text-slate-900"><T text="All India Institute of Ayurveda (AIIA) & OPD Main" /></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-slate-500 text-[10px]"><T text="Specialization Stream" /></div>
                  <div className="font-bold text-slate-900"><T text="Kayachikitsa (Internal Ayush Medicine) & General OPD" /></div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Performance Telemetry & Clinical Activity (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Practice Statistics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-sm text-center">
                <div className="text-xs text-slate-500"><T text="Patients Seen Today" /></div>
                <div className="text-3xl font-black text-slate-900">42</div>
                <div className="text-[10px] text-teal-700 font-bold"><T text="100% Signed" /></div>
              </div>

              <div className="p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-sm text-center">
                <div className="text-xs text-slate-500"><T text="Ayush Share" /></div>
                <div className="text-3xl font-black text-amber-600">64%</div>
                <div className="text-[10px] text-amber-700 font-bold"><T text="Dashavidha Matrix" /></div>
              </div>

              <div className="p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-sm text-center">
                <div className="text-xs text-slate-500"><T text="Avg Consult Time" /></div>
                <div className="text-3xl font-black text-emerald-600">3.2m</div>
                <div className="text-[10px] text-emerald-700 font-bold"><T text="AI Pre-filled" /></div>
              </div>
            </div>

            {/* Recent Signed Consultations Log */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" />
                  <T text="Recent Signed Consultations Log" />
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900"><T text="Token MK-1042 — Rajesh Kumar (45M)" /></div>
                    <div className="text-slate-500"><T text="Dual Integrated Assessment • Amlapitta (Hyperacidity)" /></div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                    <T text="Signed & FHIR Sealed" />
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900"><T text="Token MK-1043 — Sunita Devi (38F)" /></div>
                    <div className="text-slate-500"><T text="Ayush Dashavidha Mode • Pittaja Shiroroga" /></div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                    <T text="Signed & FHIR Sealed" />
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
