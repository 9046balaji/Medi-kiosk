import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import { ALL_SUPPORTED_LANGUAGES } from '../../../lib/languageMap';
import { Language } from '../../../types';
import { playNeuralTts, stopNeuralTts } from '../../../lib/ttsApi';
import { ThreeMedicalHologram } from './ThreeMedicalHologram';
import {
  Mic,
  QrCode,
  UserCheck,
  FileText,
  ArrowRight,
  Sparkles,
  Volume2,
  ShieldCheck,
  Activity,
  HeartHandshake,
  Clock,
  Building2,
  Stethoscope,
  Award,
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertOctagon,
  Users
} from 'lucide-react';

const POPULAR_LANGUAGES: { id: Language; native: string; label: string }[] = [
  { id: 'english', native: 'English', label: 'English' },
  { id: 'hindi', native: 'हिंदी', label: 'Hindi' },
  { id: 'telugu', native: 'తెలుగు', label: 'Telugu' },
  { id: 'tamil', native: 'தமிழ்', label: 'Tamil' },
  { id: 'bengali', native: 'বাংলা', label: 'Bengali' },
  { id: 'marathi', native: 'मराठी', label: 'Marathi' },
  { id: 'kannada', native: 'ಕನ್ನಡ', label: 'Kannada' },
  { id: 'gujarati', native: 'ગુજરાતી', label: 'Gujarati' }
];

export const KioskWelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, mode, setMode } = useMediKiosk();
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const handlePlayVoiceGreeting = (targetLang: Language = language) => {
    setIsPlayingAudio(true);
    const greetingText =
      targetLang === 'hindi'
        ? 'स्मार्ट ओपीडी कियोस्क में आपका स्वागत है। नया पर्चा बनवाने के लिए हरे बटन को दबाएं या अपना विकल्प चुनें।'
        : 'Welcome to MediKiosk. Tap Start OPD Registration or choose any quick option to begin.';

    playNeuralTts(greetingText, targetLang).finally(() => {
      setIsPlayingAudio(false);
    });
  };

  const handleSelectLanguage = (langId: Language) => {
    setLanguage(langId);
    handlePlayVoiceGreeting(langId);
  };

  const handleStartRegistration = () => {
    stopNeuralTts();
    navigate('/register');
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-slate-900 via-slate-900 to-teal-950 text-white p-3 sm:p-6 lg:p-8 flex flex-col justify-between space-y-6 select-none relative overflow-hidden">
      
      {/* ── Background Subtle Glow & Grid ── */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full space-y-6 relative z-10">

        {/* ── Hero Welcome Section with 3D Hologram & Hospital Badges ── */}
        <div className="relative bg-gradient-to-r from-teal-950/90 via-slate-900/90 to-emerald-950/90 border-2 border-teal-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Column: Headlines & Callout */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-black flex items-center gap-1.5 backdrop-blur-md">
                  <Award className="w-4 h-4 text-amber-400" />
                  <T text="Ministry of Ayush • ABDM Level-3" />
                </span>
                <span className="px-3 py-1 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-black flex items-center gap-1.5 backdrop-blur-md">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <T text="22 Indian Languages Supported" />
                </span>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                  <T text="Welcome to MediKiosk" />
                </h1>
                <p className="text-base sm:text-lg font-bold text-teal-300">
                  <T text="Autonomous AI Patient Registration & Triage Kiosk" />
                </p>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
                  <T text="Instant OPD token generation, voice-assisted symptom capture, ABHA card integration, and Ayush dual-care clinical support." />
                </p>
              </div>

              {/* Action Buttons: Voice Guide & Replay 3D Intro */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => handlePlayVoiceGreeting()}
                  className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer shadow-lg ${
                    isPlayingAudio
                      ? 'bg-amber-400 text-slate-900 animate-pulse ring-4 ring-amber-300/40'
                      : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/30'
                  }`}
                >
                  <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-bounce text-slate-900' : 'text-amber-400'}`} />
                  <span><T text="Listen Voice Assistance" /></span>
                </button>

                <button
                  onClick={() => navigate('/intro')}
                  className="px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
                  title="Replay Fullscreen 3D Welcome Animation"
                >
                  <RotateCcw className="w-4 h-4 text-teal-400" />
                  <span><T text="Replay 3D Intro" /></span>
                </button>
              </div>

            </div>

            {/* Right Column: Embedded Interactive 3D Hologram Badge */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="w-64 h-56 sm:w-72 sm:h-64 relative rounded-2xl overflow-hidden border-2 border-teal-500/30 bg-slate-950/60 shadow-2xl shadow-teal-500/10">
                <ThreeMedicalHologram variant="compact" interactive={true} pulseIntensity={1.1} />
                <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-teal-500/30 text-[10px] font-mono text-teal-300 backdrop-blur-md">
                    ⚡ Drag to interact 3D
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ── Live Hospital Telemetry & Queue Status Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex items-center gap-3 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase"><T text="Active Doctors" /></div>
              <div className="text-base sm:text-lg font-black text-white">14 <T text="On Duty" /></div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex items-center gap-3 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase"><T text="Avg Wait Time" /></div>
              <div className="text-base sm:text-lg font-black text-amber-300">~7 <T text="Mins" /></div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex items-center gap-3 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase"><T text="Current Token" /></div>
              <div className="text-base sm:text-lg font-mono font-black text-emerald-400">#A-1042</div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex items-center gap-3 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase"><T text="Casualty / ER" /></div>
              <div className="text-base sm:text-lg font-black text-red-400">24x7 <T text="Ready" /></div>
            </div>
          </div>
        </div>

        {/* ── GIANT PRIMARY CTA: Start OPD Registration ── */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-3xl blur-md opacity-60 group-hover:opacity-90 transition duration-300" />
          
          <button
            onClick={handleStartRegistration}
            className="relative w-full p-6 sm:p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-3xl border-2 border-emerald-300/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-inner">
                <Sparkles className="w-9 h-9 text-amber-300 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-black tracking-widest text-emerald-200 uppercase">
                  <T text="Primary Fast-Track Touch Action" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                  <T text="Start OPD Registration" />
                </div>
                <div className="text-xs sm:text-sm text-emerald-100 font-medium">
                  <T text="Touch here to choose your language, speak your health issue, or scan your ABHA ID" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-6 py-4 bg-white text-emerald-950 font-black rounded-2xl shadow-xl text-base sm:text-lg shrink-0 group-hover:bg-emerald-50">
              <span><T text="Tap to Begin" /></span>
              <ArrowRight className="w-6 h-6 text-emerald-700 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* ── 4 Quick-Action Touch Triage Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Voice AI Intake */}
          <div
            onClick={() => {
              stopNeuralTts();
              navigate('/intake');
            }}
            className="p-5 rounded-2xl bg-slate-800/90 hover:bg-slate-750 border-2 border-teal-500/40 hover:border-teal-400 transition-all duration-300 cursor-pointer shadow-lg group flex flex-col justify-between gap-4 hover:-translate-y-1"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-xs font-black text-teal-400 uppercase tracking-wider">
                <T text="Voice AI Doctor" />
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                <T text="Speak Your Problem" />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                <T text="No typing required. Talk directly in Hindi, Tamil, Telugu, Bengali & 18 more languages." />
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-teal-400 pt-2 border-t border-slate-700">
              <span><T text="Start Voice Intake" /></span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: ABHA Card */}
          <div
            onClick={() => {
              stopNeuralTts();
              navigate('/auth');
            }}
            className="p-5 rounded-2xl bg-slate-800/90 hover:bg-slate-750 border-2 border-emerald-500/40 hover:border-emerald-400 transition-all duration-300 cursor-pointer shadow-lg group flex flex-col justify-between gap-4 hover:-translate-y-1"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                <T text="Digital Health ID" />
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                <T text="ABHA Registration" />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                <T text="Scan your ABHA QR card or enter 14-digit ABHA ID for instant paperless record link." />
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 pt-2 border-t border-slate-700">
              <span><T text="Scan ABHA Card" /></span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Returning Patient */}
          <div
            onClick={() => {
              stopNeuralTts();
              navigate('/auth/returning');
            }}
            className="p-5 rounded-2xl bg-slate-800/90 hover:bg-slate-750 border-2 border-amber-500/40 hover:border-amber-400 transition-all duration-300 cursor-pointer shadow-lg group flex flex-col justify-between gap-4 hover:-translate-y-1"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="text-xs font-black text-amber-400 uppercase tracking-wider">
                <T text="Existing Records" />
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                <T text="Returning Patient" />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                <T text="Fast check-in using your mobile number to retrieve previous prescriptions and lab history." />
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 pt-2 border-t border-slate-700">
              <span><T text="Returning Check-In" /></span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Prescription OCR Scanner */}
          <div
            onClick={() => {
              stopNeuralTts();
              navigate('/scan');
            }}
            className="p-5 rounded-2xl bg-slate-800/90 hover:bg-slate-750 border-2 border-cyan-500/40 hover:border-cyan-400 transition-all duration-300 cursor-pointer shadow-lg group flex flex-col justify-between gap-4 hover:-translate-y-1"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                <T text="Optical Digitizer" />
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                <T text="Scan Old Prescriptions" />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                <T text="Hold paper prescriptions or lab reports in front of camera to auto-extract medicines." />
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 pt-2 border-t border-slate-700">
              <span><T text="Open Scanner" /></span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* ── 1-Tap Quick Language Selection Strip ── */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-2.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>🗣️ <T text="Quick Select Language" /> / भाषा चुनें:</span>
            <span className="text-teal-400 font-mono text-[11px]">AI4Bharat IndicTrans2 Enabled</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {POPULAR_LANGUAGES.map((lang) => {
              const isSelected = language === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => handleSelectLanguage(lang.id)}
                  className={`p-2.5 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-md ring-2 ring-teal-400/40 font-black scale-102'
                      : 'bg-slate-900/60 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-teal-500/50'
                  }`}
                >
                  <div className="text-sm font-black">{lang.native}</div>
                  <div className="text-[10px] opacity-75 uppercase">{lang.label}</div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
