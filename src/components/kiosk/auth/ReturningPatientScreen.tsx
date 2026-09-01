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
  FileText,
  Sparkles,
  Volume2
} from 'lucide-react';
import { playNeuralTts } from '../../../lib/ttsApi';

export const ReturningPatientScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  const handleSelectPatientProfile = () => {
    state.setAbhaVerified(true, true);
    navigate('/intake');
  };

  const handlePlaySummaryTts = () => {
    playNeuralTts(
      `Returning Patient summary for ${state.patientName}. Last visit on 14th May with Dr. Arvind Sharma for Amlapitta. 3 active prescriptions retrieved.`,
      state.language
    );
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      <div className="w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-2xl text-slate-800 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <T text="Back to Authentication" />
          </button>

          <span className="text-xs font-mono font-bold px-3.5 py-1 bg-amber-100 text-amber-950 border border-amber-300 rounded-full">
            <T text="EHR History Retrospective" />
          </span>
        </div>

        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
            <T text="Returning Patient Health Summary" />
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            <T text="Previous clinical notes & active prescriptions retrieved from ABDM Health Repository." />
          </p>

          <button
            onClick={handlePlaySummaryTts}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer border border-slate-300 mt-1"
          >
            <Volume2 className="w-4 h-4 text-teal-600" />
            <span><T text="Listen Summary" /> 🔊</span>
          </button>
        </div>

        {/* Found Patient Identity Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-teal-600/30 shrink-0">
                RK
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">{state.patientName}</h3>
                  <span className="text-xs font-black px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full">
                    <T text="ABHA Verified" />
                  </span>
                </div>
                <div className="text-sm text-slate-600 font-mono font-bold mt-1">
                  ABHA ID: {state.abhaId || '91-4589-2041-9872'} • Male, 45 yrs
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => navigate('/profile/patient')}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-teal-700" />
                <span><T text="Health Locker & Uploads" /></span>
              </button>

              <button
                onClick={handleSelectPatientProfile}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span><T text="Confirm & Start Intake" /></span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Past Visit & Prescriptions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Last Visit Details */}
            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-sm font-black text-slate-900 pb-2 border-b border-slate-200">
                <span className="flex items-center gap-2 text-teal-900">
                  <Clock className="w-5 h-5 text-teal-700" />
                  <T text="Last OPD Visit Summary" />
                </span>
                <span className="font-mono text-slate-600 font-bold">14 May 2026</span>
              </div>

              <div className="space-y-2 text-sm text-slate-800 font-medium">
                <div><strong><T text="Attending Clinician:" /></strong> Dr. Arvind Sharma (Ayush OPD Room 104)</div>
                <div><strong><T text="Chief Complaint:" /></strong> Epigastric Burning & Sour Belching (3 Weeks)</div>
                <div><strong><T text="Diagnosis:" /></strong> Amlapitta (Gastroesophageal Acid Reflux / Gastritis)</div>
              </div>
            </div>

            {/* Active Ongoing Prescriptions */}
            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-sm font-black text-slate-900 pb-2 border-b border-slate-200">
                <span className="flex items-center gap-2 text-amber-900">
                  <Pill className="w-5 h-5 text-amber-700" />
                  <T text="Active Prescribed Medications" />
                </span>
                <span className="text-xs bg-amber-100 text-amber-950 px-2.5 py-1 rounded-lg font-mono font-black border border-amber-300">
                  3 Active Rx
                </span>
              </div>

              <ul className="text-sm space-y-2 text-slate-800 font-bold">
                <li className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                  <span><T text="Tab. Pantoprazole 40mg" /></span>
                  <span className="font-mono text-xs text-teal-900 bg-teal-100 px-2 py-0.5 rounded font-black border border-teal-200"><T text="1-0-0 AC" /></span>
                </li>
                <li className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                  <span><T text="Avipattikar Churna 3g" /></span>
                  <span className="font-mono text-xs text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-black border border-amber-200"><T text="1-0-1 PC" /></span>
                </li>
                <li className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                  <span><T text="Sutshekhar Ras 125mg" /></span>
                  <span className="font-mono text-xs text-purple-900 bg-purple-100 px-2 py-0.5 rounded font-black border border-purple-200"><T text="0-0-1 HS" /></span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
