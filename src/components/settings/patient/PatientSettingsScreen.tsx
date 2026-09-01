import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { ALL_SUPPORTED_LANGUAGES } from '../../../lib/languageMap';
import { Language } from '../../../types';
import { T } from '../../../context/TranslationContext';
import {
  Settings,
  Globe,
  Volume2,
  Lock,
  Eye,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Sliders,
  UserCheck
} from 'lucide-react';

export const PatientSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useMediKiosk();

  const [volume, setVolume] = useState<number>(80);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [dpdpConsent, setDpdpConsent] = useState<boolean>(true);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/profile/patient')}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <T text="Back to Patient Profile" />
          </button>

          <span className="text-xs font-mono font-bold px-3 py-1 bg-teal-100 text-teal-800 border border-teal-200 rounded-full">
            <T text="Patient Preference Settings" />
          </span>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            <T text="Patient Accessibility & Language Preferences" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            <T text="Customize primary Indic language, voice audio volume, font size, and DPDP privacy options." />
          </p>
        </div>

        {/* Settings Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          
          {/* Section 1: Language */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-600" />
              1. <T text="Primary Preferred Language" />
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ALL_SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLanguage(l.id as Language)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    language === l.id
                      ? 'border-teal-600 bg-teal-50 shadow-md font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="text-sm font-bold text-slate-900">{l.native}</div>
                  <div className="text-[11px] text-slate-500">{l.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Audio & Kiosk Voice Controls */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-teal-600" />
              2. <T text="Kiosk Audio Guidance & Speech Volume" />
            </h2>

            <div className="space-y-2 max-w-md">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span><T text="Voice Instruction Output Volume" /></span>
                <span className="font-mono text-teal-800">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>
          </div>

          {/* Section 3: Visual Accessibility */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-600" />
              3. <T text="Display & Contrast Options" />
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900"><T text="High Contrast Text Mode" /></div>
                  <div className="text-[11px] text-slate-500"><T text="Improves readability for elderly patients" /></div>
                </div>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="w-5 h-5 accent-teal-600 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900"><T text="Kiosk Text Size" /></div>
                <div className="flex items-center gap-2 pt-1">
                  {(['normal', 'large', 'xlarge'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setTextSize(sz)}
                      className={`px-3 py-1 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                        textSize === sz ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 border border-slate-300'
                      }`}
                    >
                      <T text={sz} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Privacy & DPDP Consent */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-600" />
              4. <T text="DPDP Act 2023 Consent & ABHA Repository Tokenization" />
            </h2>

            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-2 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dpdpConsent}
                  onChange={(e) => setDpdpConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-teal-600 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-teal-900"><T text="Enable ABDM Health Locker Auto-Transmission" /></span>
                  <div className="text-teal-800 text-[11px] mt-0.5">
                    <T text="I authorize MediKiosk to securely transmit my consultation note to my linked ABHA Health Locker." />
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-teal-600/30 cursor-pointer"
            >
              {saved ? <T text="✓ Preferences Saved" /> : <T text="Save Patient Preferences" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
