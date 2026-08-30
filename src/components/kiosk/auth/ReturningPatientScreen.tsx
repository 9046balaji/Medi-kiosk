import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import {
  UserCheck,
  Search,
  Calendar,
  Stethoscope,
  Pill,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const ReturningPatientScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  const handleSelectPatientProfile = () => {
    state.setAbhaVerified(true, true);
    navigate('/intake');
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <T text="Back" />
          </button>

          <span className="text-xs font-mono font-semibold px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
            <T text="EHR History Retrospective" />
          </span>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            <T text="Returning Patient Health Summary" />
          </h1>
          <p className="text-sm text-slate-600">
            <T text="Previous clinical notes & active prescriptions retrieved from ABDM Health Repository." />
          </p>
        </div>

        {/* Found Patient Identity Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-teal-600/30">
                RK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{state.patientName}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full">
                    <T text="ABHA Verified" />
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  ABHA ID: {state.abhaId || '91-4589-2041-9872'} • Male, 45 yrs
                </div>
              </div>
            </div>

            <button
              onClick={handleSelectPatientProfile}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span><T text="Confirm & Start Intake" /></span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Past Visit & Prescriptions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Last Visit Details */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-teal-800">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <T text="Last OPD Visit Summary" />
                </span>
                <span className="font-mono text-slate-500">14 May 2026</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div><strong><T text="Attending Clinician:" /></strong> Dr. Arvind Sharma (Ayush OPD Room 104)</div>
                <div><strong><T text="Chief Complaint:" /></strong> Epigastric Burning & Sour Belching (3 Weeks)</div>
                <div><strong><T text="Diagnosis:" /></strong> Amlapitta (Gastroesophageal Acid Reflux / Gastritis)</div>
              </div>
            </div>

            {/* Active Ongoing Prescriptions */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 text-amber-800">
                  <Pill className="w-4 h-4 text-amber-600" />
                  <T text="Active Prescribed Medications" />
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">
                  3 Active Rx
                </span>
              </div>

              <ul className="text-xs space-y-2 text-slate-700">
                <li className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                  <span><T text="Tab. Pantoprazole 40mg" /></span>
                  <span className="font-mono text-[10px] text-teal-700 font-bold"><T text="1-0-0 AC" /></span>
                </li>
                <li className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                  <span><T text="Avipattikar Churna 3g" /></span>
                  <span className="font-mono text-[10px] text-amber-700 font-bold"><T text="1-0-1 PC" /></span>
                </li>
                <li className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                  <span><T text="Syp. Sucralfate 10ml" /></span>
                  <span className="font-mono text-[10px] text-slate-600 font-bold"><T text="1-1-1 PC" /></span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
