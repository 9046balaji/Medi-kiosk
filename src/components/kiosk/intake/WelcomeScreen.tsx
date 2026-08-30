import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { Language } from '../../../types';
import { ALL_SUPPORTED_LANGUAGES } from '../../../lib/languageMap';
import { T } from '../../../context/TranslationContext';
import {
  Stethoscope,
  UserPlus,
  QrCode,
  UserCheck,
  Languages,
  ArrowRight,
  ShieldCheck,
  Activity,
  Award,
  Sparkles,
  FileScan,
  Heart,
  CheckCircle2,
  Lock,
  BookOpen
} from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, mode, setMode } = useMediKiosk();

  const handleStartWalkIn = () => {
    navigate('/intake');
  };

  const handleStartAbha = () => {
    navigate('/auth');
  };

  const handleStartReturning = () => {
    navigate('/returning');
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-6 sm:space-y-8">
        
        {/* Banner Section */}
        <div className="relative bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden border border-teal-800/40">
          <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <T text="National Health Authority Standard" />
                </span>
                <span className="px-3 py-1 bg-teal-400/20 text-teal-200 border border-teal-400/30 rounded-full text-xs font-bold backdrop-blur-md">
                  <T text="ABDM Verified EHR • 22 Indic Languages" />
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                <T text="Smart Patient Registration & Queue Kiosk" />
              </h1>
              
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                <T text="Select your consultation department and primary language to begin paperless intake." />
              </p>
            </div>

            {/* Quick Live Stats Pill */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0 flex items-center gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <T text="Estimated Wait" />
                </div>
                <div className="text-xl font-bold text-amber-300 font-mono"><T text="~4 Mins" /></div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="space-y-0.5">
                <div className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <T text="Active OPD Rooms" />
                </div>
                <div className="text-xl font-bold text-emerald-400 font-mono"><T text="12 Operational" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical OPD Stream Selector */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xl shadow-slate-200/50 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              1. <T text="Select Consultation Wing" />:
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
              <T text="Mode:" /> {mode === 'allopathic' ? <T text="Allopathic OPD" /> : mode === 'ayurvedic' ? <T text="Ayush OPD" /> : <T text="Dual Integrated" />}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <button
              onClick={() => setMode('allopathic')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                mode === 'allopathic'
                  ? 'border-teal-600 bg-teal-50/80 shadow-md ring-2 ring-teal-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  <T text="Modern Medicine" />
                </span>
                {mode === 'allopathic' && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
              </div>
              <div className="font-bold text-slate-900 text-base sm:text-lg">
                <T text="Allopathic OPD" />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <T text="General Medicine, Cardiology, ENT, Pediatrics (SOCRATES Intake)" />
              </div>
            </button>

            <button
              onClick={() => setMode('ayurvedic')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                mode === 'ayurvedic'
                  ? 'border-amber-600 bg-amber-50/80 shadow-md ring-2 ring-amber-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  <T text="Ayush Ministry" />
                </span>
                {mode === 'ayurvedic' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
              </div>
              <div className="font-bold text-slate-900 text-base sm:text-lg">
                <T text="Ayush / Ayurveda OPD" />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <T text="Ayurveda, Yoga, Naturopathy, Unani, Siddha, Homeopathy Assessment" />
              </div>
            </button>

            <button
              onClick={() => setMode('dual')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                mode === 'dual'
                  ? 'border-indigo-600 bg-indigo-50/80 shadow-md ring-2 ring-indigo-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                  <T text="Integrated Dual" />
                </span>
                {mode === 'dual' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
              </div>
              <div className="font-bold text-slate-900 text-base sm:text-lg">
                <T text="Dual Integrated OPD" />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <T text="Comprehensive assessment combining SOCRATES + Dashavidha Pariksha" />
              </div>
            </button>
          </div>
        </div>

        {/* Language Selection Grid */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xl shadow-slate-200/50 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <Languages className="w-5 h-5 text-teal-600" />
              2. <T text="Select Your Language" />:
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              <T text="22 Scheduled Indic Languages Supported" />
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {ALL_SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as Language)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50 shadow-md ring-2 ring-teal-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">
                      {lang.native}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-teal-600" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {lang.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Registration Action Cards */}
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 px-1">
            <UserPlus className="w-5 h-5 text-teal-600" />
            3. <T text="Choose Registration Method" />:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            
            {/* ABHA Auth Card */}
            <div
              onClick={handleStartAbha}
              className="bg-white rounded-3xl p-6 border-2 border-teal-600 hover:border-teal-700 shadow-xl shadow-teal-900/10 hover:shadow-2xl hover:shadow-teal-900/20 transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/30 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    <T text="Fastest • Recommended" />
                  </span>
                  <h3 className="text-xl font-black text-slate-900 pt-1">
                    <T text="ABHA Digital Health ID" />
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <T text="Verify with 14-digit ABHA ID, OTP or Face Auth. Auto-retrieves your EHR history." />
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700 group-hover:text-teal-800">
                <span><T text="Verify ABHA ID" /></span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Walk-In Card */}
            <div
              onClick={handleStartWalkIn}
              className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <UserPlus className="w-7 h-7" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full">
                    <T text="No ABHA Required" />
                  </span>
                  <h3 className="text-xl font-black text-slate-900 pt-1">
                    <T text="Walk-In Registration" />
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <T text="Quick registration for first-time visitors using voice AI or touch keypad." />
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-slate-900">
                <span><T text="New Registration" /></span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Returning Patient Card */}
            <div
              onClick={handleStartReturning}
              className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <UserCheck className="w-7 h-7" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <T text="Existing Record" />
                  </span>
                  <h3 className="text-xl font-black text-slate-900 pt-1">
                    <T text="Returning Patient Check-In" />
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <T text="Check-in with registered mobile number to continue follow-up consultation." />
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-slate-900">
                <span><T text="Search Past Visits" /></span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
