import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMediKiosk } from '../../context/MediKioskContext';
import { useTranslation, T } from '../../context/TranslationContext';
import { ALL_SUPPORTED_LANGUAGES } from '../../lib/languageMap';
import { Language } from '../../types';
import { speakText, stopSpeech } from '../../lib/speechUtils';
import {
  Globe,
  PhoneCall,
  Volume2,
  VolumeX,
  AlertOctagon,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';

export const KioskHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useMediKiosk();
  const [time, setTime] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showSosModal, setShowSosModal] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    const langObj = ALL_SUPPORTED_LANGUAGES.find((l) => l.id === newLang);
    if (soundEnabled && langObj) {
      speakText(`Language changed to ${langObj.label}`, newLang);
    }
  };

  const handleToggleSound = () => {
    if (soundEnabled) {
      stopSpeech();
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
      speakText('Audio guidance enabled', language);
    }
  };

  const languages = ALL_SUPPORTED_LANGUAGES;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          
          {/* Left: Branding with Ayush Emblem & Hospital Header */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-white flex items-center justify-center shadow-md shadow-teal-700/20 font-bold text-base">
              <span className="tracking-tighter">MK</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">MediKiosk</span>
                <span className="text-[11px] px-2 py-0.5 font-semibold bg-amber-100 text-amber-900 rounded-full border border-amber-300 flex items-center gap-1">
                  <T text="Ministry of Ayush" />
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium hidden md:block">
                <T text="National Health Authority • ABDM Integrated Smart Kiosk" />
              </div>
            </div>
          </div>

          {/* Center: Live IST Clock & Terminal Indicator */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>IST {time || '10:45 AM'}</span>
            </div>
            <div className="h-3 w-px bg-slate-300" />
            <div className="text-xs text-slate-700 font-semibold flex items-center gap-1">
              <span className="text-teal-700">Kiosk #01</span>
            </div>
          </div>

          {/* Right: Essential Controls (Language Dropdown, Audio Toggle, SOS Alert) */}
          <div className="flex items-center gap-2">
            
            {/* Language Selector Dropdown with IndicTrans2 AI indicator */}
            <div className="relative flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
              <Globe className="w-4 h-4 text-teal-600 ml-1.5 mr-1" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="text-xs sm:text-sm font-bold text-slate-900 bg-transparent py-0.5 pr-2 outline-none cursor-pointer"
              >
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.native} ({l.label})
                  </option>
                ))}
              </select>
              <span className="text-[10px] font-extrabold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded-md mr-1 hidden lg:inline" title="Powered by ai4bharat/indictrans2-en-indic-dist-200M">
                IndicTrans2
              </span>
            </div>

            {/* Speech Audio Guidance Toggle Button */}
            <button
              onClick={handleToggleSound}
              title="Toggle Audio Instructions"
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                soundEnabled
                  ? 'bg-teal-50 border-teal-300 text-teal-700 shadow-xs'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Emergency Casualty SOS Red Button */}
            <button
              onClick={() => {
                setShowSosModal(true);
                if (soundEnabled) {
                  speakText('Emergency SOS triggered. Triage nurse and casualty team notified.', language);
                }
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              <AlertOctagon className="w-4 h-4" />
              <span className="hidden sm:inline"><T text="Emergency SOS" /></span>
            </button>

          </div>

        </div>
      </header>

      {/* SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-red-500 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 border-2 border-red-300 mx-auto flex items-center justify-center font-bold">
              <PhoneCall className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-xl font-black text-slate-900"><T text="Casualty Emergency Assistance Alerted" /></h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              <T text="Triage Station A Nurse and Casualty ER Duty Officer have been notified. Please remain at Kiosk #01." />
            </p>
            <button
              onClick={() => setShowSosModal(false)}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer hover:bg-red-700 transition-colors"
            >
              <T text="Acknowledge & Close" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
