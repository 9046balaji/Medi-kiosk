import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMediKiosk } from '../../context/MediKioskContext';
import { useTranslation, T } from '../../context/TranslationContext';
import { ALL_SUPPORTED_LANGUAGES } from '../../lib/languageMap';
import { Language } from '../../types';
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
                onChange={(e) => setLanguage(e.target.value as Language)}
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

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute voice instructions' : 'Enable voice instructions'}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                  : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={() => setShowSosModal(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <AlertOctagon className="w-4 h-4" />
              <span><T text="SOS Emergency" /></span>
            </button>
          </div>
        </div>
      </header>

      {/* SOS Emergency Trigger Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-4 border-red-500 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl mx-auto flex items-center justify-center">
              <PhoneCall className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-red-100 text-red-800 font-bold text-xs rounded-full uppercase tracking-wider">
                <T text="P1 Critical Emergency Code Red" />
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                <T text="Emergency Nurse & Casualty Triggered" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                <T text="Kiosk Location telemetry dispatched to OPD Casualty Station A & ICU Triage Team." />
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs font-semibold text-red-900 space-y-1 text-left">
              <div><T text="• Hospital ER Helpline: 108 / 104" /></div>
              <div><T text="• Kiosk ID: Kiosk #01 (OPD Lobby Ground Floor)" /></div>
              <div><T text="• Automatic ER Red Flag Logged into ABHA Portal" /></div>
            </div>

            <button
              onClick={() => setShowSosModal(false)}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-colors cursor-pointer"
            >
              <T text="Dismiss SOS Alert" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
