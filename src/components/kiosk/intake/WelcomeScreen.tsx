import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { Language } from '../../../types';
import { ALL_SUPPORTED_LANGUAGES } from '../../../lib/languageMap';
import { T } from '../../../context/TranslationContext';
import { playNeuralTts, stopNeuralTts } from '../../../lib/ttsApi';
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
  Volume2,
  Mic,
  CheckCircle2,
  Heart,
  HelpCircle,
  FileText,
  Clock,
  Sparkle
} from 'lucide-react';

import { WelcomeAnimationScreen } from '../welcome/WelcomeAnimationScreen';

// Common languages featured prominently for 1-tap selection
const FEATURED_LANGUAGES: { id: Language; native: string; label: string; greeting: string }[] = [
  { id: 'english', native: 'English', label: 'English', greeting: 'Hello! Tap the green button to speak your health problem.' },
  { id: 'hindi', native: 'हिंदी', label: 'Hindi', greeting: 'नमस्ते! अपना इलाज शुरू करने के लिए हरे बटन को दबाएं।' },
  { id: 'telugu', native: 'తెలుగు', label: 'Telugu', greeting: 'నమస్కారం! మీ సమస్యను చెప్పడానికి పచ్చని బటన్ నొక్కండి.' },
  { id: 'tamil', native: 'தமிழ்', label: 'Tamil', greeting: 'வணக்கம்! உங்கள் பிரச்சனையை கூற பச்சை பட்டனை அழுத்தவும்.' },
  { id: 'bengali', native: 'বাংলা', label: 'Bengali', greeting: 'নমস্কার! আপনার সমস্যার কথা বলতে সবুজ বোতাম টিপুন।' },
  { id: 'marathi', native: 'मराठी', label: 'Marathi', greeting: 'नमस्कार! तुमची तक्रार सांगण्यासाठी हिरवे बटण दाबा.' },
  { id: 'kannada', native: 'ಕನ್ನಡ', label: 'Kannada', greeting: 'ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಹೇಳಲು ಹಸಿರು ಬಟನ್ ಒತ್ತಿರಿ.' },
  { id: 'gujarati', native: 'ગુજરાતી', label: 'Gujarati', greeting: 'નમસ્તે! તમારી તકલીફ જણાવવા માટે લીલું બટન દબાવો.' },
  { id: 'punjabi', native: 'ਪੰਜਾਬੀ', label: 'Punjabi', greeting: 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! ਆਪਣੀ ਸਮੱਸਿਆ ਦੱਸਣ ਲਈ ਹਰਾ ਬਟਨ ਦਬਾਓ।' },
  { id: 'malayalam', native: 'മലയാളം', label: 'Malayalam', greeting: 'നമസ്കാരം! നിങ്ങളുടെ പ്രശ്നം പറയാൻ പച്ച ബട്ടൺ അമർത്തുക.' },
  { id: 'odia', native: 'ଓଡ଼ିଆ', label: 'Odia', greeting: 'ନମସ୍କାର! ଆପଣଙ୍କ ସମସ୍ୟା କହିବାକୁ ସବୁଜ ବଟନ୍ ଦବାନ୍ତୁ।' },
  { id: 'assamese', native: 'অসমীয়া', label: 'Assamese', greeting: 'নমস্কাৰ! আপোনাৰ অসুবিধা কবলৈ সেউজীয়া বুটাম টিপক।' }
];

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, mode, setMode } = useMediKiosk();
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    // Show intro on initial site opening
    return !sessionStorage.getItem('medikiosk_intro_seen');
  });
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleIntroComplete = () => {
    sessionStorage.setItem('medikiosk_intro_seen', 'true');
    setShowIntro(false);
  };

  // Audio greeting playback
  const handlePlayVoiceGuide = (langId?: Language) => {
    const targetLang = langId || language;
    const item = FEATURED_LANGUAGES.find((l) => l.id === targetLang) || FEATURED_LANGUAGES[0];
    setIsPlayingAudio(true);
    playNeuralTts(item.greeting, targetLang).finally(() => {
      setIsPlayingAudio(false);
    });
  };

  const handleSelectLanguage = (langId: Language) => {
    setLanguage(langId);
    handlePlayVoiceGuide(langId);
  };

  const handleStartDirectIntake = () => {
    stopNeuralTts();
    navigate('/intake');
  };

  const handleStartAbha = () => {
    stopNeuralTts();
    navigate('/auth');
  };

  const handleStartReturning = () => {
    stopNeuralTts();
    navigate('/auth/returning');
  };

  return (
    <>
      {/* ── Initial 3D Three.js Welcome Animation Screen (Auto-loads on site open) ── */}
      {showIntro && (
        <WelcomeAnimationScreen onComplete={handleIntroComplete} autoDurationMs={2800} />
      )}

      {/* ── Main Kiosk Page (Languages, Voice Intake, ABHA, Returning Patient) ── */}
      <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col justify-between space-y-6">
        <div className="max-w-6xl mx-auto w-full space-y-6">

          {/* ── Header Banner ── */}
          <div className="relative bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden border-2 border-blue-500/40">
            <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-0 bottom-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowIntro(true)}
                    className="px-3.5 py-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-blue-200 border border-blue-400/40 rounded-full text-xs font-black flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all hover:scale-105 shadow-sm"
                    title="Replay 3D Welcome Animation"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-spin" />
                    <span><T text="Replay 3D Intro" /></span>
                  </button>
                  <span className="px-3.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-black flex items-center gap-1.5 backdrop-blur-md shadow-xs">
                    <Award className="w-4 h-4 text-amber-400" />
                    <T text="National Health Authority Standard" />
                  </span>
                  <span className="px-3.5 py-1 bg-blue-400/20 text-blue-200 border border-blue-400/40 rounded-full text-xs font-black backdrop-blur-md shadow-xs">
                    <T text="Voice-Powered Intake • 22 Indian Languages" />
                  </span>
                </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-md">
                <T text="Smart Patient Registration & Queue Kiosk" />
              </h1>

              <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed">
                <T text="Select your primary language and speak into the microphone to describe your symptoms." />
              </p>
            </div>

            {/* Voice Guide Button */}
            <button
              onClick={() => handlePlayVoiceGuide()}
              className={`shrink-0 px-5 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all cursor-pointer shadow-xl ${
                isPlayingAudio
                  ? 'bg-amber-400 text-slate-950 animate-pulse ring-4 ring-amber-300/50 shadow-lg'
                  : 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 text-white border-2 border-blue-400/30'
              }`}
            >
              <Volume2 className={`w-6 h-6 ${isPlayingAudio ? 'animate-bounce text-slate-900' : 'text-amber-300'}`} />
              <div className="text-left leading-tight">
                <div className="text-[11px] text-blue-200 uppercase tracking-wider font-bold">
                  <T text="Listen in Voice" />
                </div>
                <div className="text-sm font-black">
                  <T text="Audio Assistance" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ── 3-Step Simple Progress Indicator ── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-white p-3 sm:p-4 rounded-2xl border-2 border-slate-200 shadow-sm text-center">
          <div className="flex items-center justify-center gap-2 text-blue-800 font-black text-xs sm:text-sm">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
            <span><T text="Choose Language" /> 🗣️</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-500 font-bold text-xs sm:text-sm border-x border-slate-200">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs">2</span>
            <span><T text="Speak Problem" /> 🎙️</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-500 font-bold text-xs sm:text-sm">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs">3</span>
            <span><T text="Get Token Slip" /> 🎟️</span>
          </div>
        </div>

        {/* ── Step 1: Featured Language Tiles ── */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Languages className="w-6 h-6 text-blue-600" />
              <span>1. <T text="Select Your Language" />:</span>
            </h2>
            <button
              onClick={() => setShowAllLanguages(!showAllLanguages)}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 cursor-pointer"
            >
              {showAllLanguages ? <T text="Show Popular (12)" /> : <T text="View All 22 Languages" />}
            </button>
          </div>

          {/* Primary Language Grid with Big Touch Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {(showAllLanguages ? ALL_SUPPORTED_LANGUAGES : FEATURED_LANGUAGES).map((lang) => {
              const isSelected = language === lang.id;
              const nativeText = 'native' in lang ? lang.native : (lang as any).label;
              const labelText = 'label' in lang ? lang.label : (lang as any).id;

              return (
                <button
                  key={lang.id}
                  onClick={() => handleSelectLanguage(lang.id as Language)}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 relative group ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-lg ring-4 ring-blue-600/20 scale-102'
                      : 'border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-700">
                      {nativeText}
                    </span>
                    {isSelected ? (
                      <span className="w-3 h-3 rounded-full bg-blue-600 ring-2 ring-blue-200" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    {labelText}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Step 2: Giant Primary Action — Talk to Doctor (Direct 1-Tap Start) ── */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border-4 border-blue-400/40 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="px-3.5 py-1 bg-white/20 text-white rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 backdrop-blur-md shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <T text="Fastest • 1-Tap Voice Registration" />
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white drop-shadow-md">
                <T text="Talk to AI Doctor (Voice Intake)" />
              </h2>
              <p className="text-sm text-blue-100 font-medium max-w-xl">
                <T text="Speak directly in your mother tongue without typing. AI records your symptoms and prints your queue slip." />
              </p>
            </div>

            <button
              onClick={handleStartDirectIntake}
              className="w-full sm:w-auto px-8 py-5 bg-white hover:bg-blue-50 text-blue-950 font-black text-lg sm:text-xl rounded-2xl transition-all shadow-2xl hover:scale-105 flex items-center justify-center gap-3 cursor-pointer ring-8 ring-white/30 shrink-0"
            >
              <Mic className="w-7 h-7 text-blue-600 animate-pulse" />
              <span><T text="Tap to Speak (Start)" /></span>
              <ArrowRight className="w-6 h-6 text-blue-600" />
            </button>
          </div>
        </div>

        {/* ── Step 3: Alternate Options (ABHA / Returning / Department) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* ABHA Card */}
          <div
            onClick={handleStartAbha}
            className="bg-white rounded-2xl p-5 border-2 border-teal-200 hover:border-teal-500 shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center gap-4 group hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 text-teal-700 border border-teal-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-black text-teal-700 uppercase tracking-wider">
                <T text="Digital Health ID" />
              </div>
              <div className="font-black text-slate-900 text-sm sm:text-base group-hover:text-teal-900">
                <T text="ABHA Card Registration" />
              </div>
            </div>
          </div>

          {/* Returning Patient */}
          <div
            onClick={handleStartReturning}
            className="bg-white rounded-2xl p-5 border-2 border-amber-200 hover:border-amber-500 shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center gap-4 group hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-700 uppercase tracking-wider">
                <T text="Existing Records" />
              </div>
              <div className="font-black text-slate-900 text-sm sm:text-base group-hover:text-amber-900">
                <T text="Returning Patient Check-In" />
              </div>
            </div>
          </div>

          {/* Department Selection Mode */}
          <div
            onClick={() => setMode(mode === 'ayurvedic' ? 'allopathic' : 'ayurvedic')}
            className="bg-white rounded-2xl p-5 border-2 border-indigo-200 hover:border-indigo-500 shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center gap-4 group hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-black text-indigo-700 uppercase tracking-wider">
                <T text="Switch Department" />
              </div>
              <div className="font-black text-slate-900 text-sm sm:text-base group-hover:text-indigo-900">
                {mode === 'ayurvedic' ? <T text="Ayush / Ayurveda OPD 🌿" /> : <T text="Allopathic General OPD 🩺" />}
              </div>
            </div>
          </div>

        </div>

      </div>
      </div>
    </>
  );
};
