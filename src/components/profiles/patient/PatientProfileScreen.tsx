import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import {
  User,
  ShieldCheck,
  CreditCard,
  QrCode,
  Heart,
  Activity,
  Pill,
  Clock,
  Phone,
  FileText,
  Settings,
  ArrowRight,
  CheckCircle2,
  Lock,
  Edit3,
  Languages
} from 'lucide-react';

export const PatientProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Profile Master Header */}
        <div className="p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-teal-700/20">
                RK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {state.patientName}
                  </h1>
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <T text="ABHA Verified Patient" />
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  ABHA ID: {state.abhaId || '91-4589-2041-9872'} • Token: <strong className="text-teal-800 font-bold">{state.opdToken}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/settings/patient')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Settings className="w-4 h-4 text-teal-700" />
                <span><T text="Patient Settings" /></span>
              </button>

              <button
                onClick={() => navigate('/intake')}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/30 flex items-center gap-2 cursor-pointer"
              >
                <span><T text="Start Voice Intake" /></span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3 Main Grid Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Personal Demographics & ABHA Digital Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* ABHA Digital Card */}
            <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 shadow-2xl border border-teal-800/40 space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center font-bold text-teal-300 text-sm">
                    MK
                  </span>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-teal-300">
                      <T text="National Health Authority" />
                    </div>
                    <div className="text-[10px] text-slate-400">ABDM Digital Health Card</div>
                  </div>
                </div>
                <QrCode className="w-10 h-10 text-teal-400" />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-mono uppercase tracking-wider"><T text="Health ID Number" /></div>
                <div className="text-2xl font-black font-mono tracking-widest text-amber-300">
                  {state.abhaId || '91-4589-2041-9872'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10">
                <div>
                  <div className="text-slate-400 text-[10px]"><T text="Patient Name" /></div>
                  <div className="font-bold">{state.patientName}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]"><T text="Gender / Age" /></div>
                  <div className="font-bold">{state.patientAge} Yrs • <T text={state.patientGender} /></div>
                </div>
              </div>
            </div>

            {/* Demographics Details Card */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                <T text="Vitals & Demographics" />
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-500 text-[10px]"><T text="Blood Group" /></span>
                  <div className="font-bold text-slate-900 text-sm">{state.patientBloodGroup}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-500 text-[10px]"><T text="Height & Weight" /></span>
                  <div className="font-bold text-slate-900 text-sm">{state.patientHeightWeight}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-500 text-[10px]"><T text="Primary Language" /></span>
                  <div className="font-bold text-slate-900 text-sm capitalize"><T text={state.language} /></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-0.5">
                  <span className="text-slate-500 text-[10px]"><T text="Emergency Contact" /></span>
                  <div className="font-bold text-slate-900 text-sm">+91 98765-43210</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Active Prescriptions, EHR Medical History & OPD Logs (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Active Prescriptions */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-teal-600" />
                  <T text="Active Ongoing Prescriptions" />
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-bold">
                  3 Medications Active
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                    <span><T text="Tab. Pantoprazole 40mg" /></span>
                    <span className="text-[10px] px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-mono font-bold">
                      <T text="Once Daily (1-0-0) AC" />
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <T text="Prescribed by Dr. Arvind Sharma for Gastroesophageal Acid Reflux (Amlapitta)." />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                    <span><T text="Avipattikar Churna 3g" /></span>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-mono font-bold">
                      <T text="Twice Daily (1-0-1) PC" />
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <T text="Ayush formulation for Pitta Pacification & Stomach Acid Buffering." />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                    <span><T text="Syp. Sucralfate 10ml" /></span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-mono font-bold">
                      <T text="Thrice Daily (1-1-1) PC" />
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <T text="Mucosal protective lining agent." />
                  </div>
                </div>
              </div>
            </div>

            {/* Past OPD Visits History */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <T text="Past OPD Consultation History" />
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900"><T text="18 Oct 2024 — Ayush OPD Consultation" /></div>
                    <div className="text-slate-500"><T text="Diagnosis: Amlapitta (Hyperacidity) • Dr. Arvind Sharma" /></div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                    <T text="FHIR Exported" />
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900"><T text="04 Jun 2024 — General Allopathic Checkup" /></div>
                    <div className="text-slate-500"><T text="Diagnosis: Mild Gastritis • Dr. R. K. Gupta" /></div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                    <T text="FHIR Exported" />
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
