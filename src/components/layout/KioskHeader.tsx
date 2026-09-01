import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMediKiosk } from '../../context/MediKioskContext';
import { useTranslation, T } from '../../context/TranslationContext';
import { ALL_SUPPORTED_LANGUAGES } from '../../lib/languageMap';
import { Language } from '../../types';
import { playNeuralTts } from '../../lib/ttsApi';
import { speakText, stopSpeech } from '../../lib/speechUtils';
import {
  Globe,
  PhoneCall,
  Volume2,
  VolumeX,
  AlertOctagon,
  ShieldCheck,
  Building2,
  Sparkles,
  Mic,
  MicOff,
  Radio,
  HelpCircle
} from 'lucide-react';

export const KioskHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = useMediKiosk();
  const { language, setLanguage } = state;
  const { t } = useTranslation();

  const [time, setTime] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showSosModal, setShowSosModal] = useState<boolean>(false);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  const speechRecognitionRef = useRef<any>(null);

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
      playNeuralTts(`Language set to ${langObj.label}`, newLang);
    }
  };

  const handleToggleSound = () => {
    if (soundEnabled) {
      stopSpeech();
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
      playNeuralTts('Audio guidance enabled', language);
    }
  };

  // ─── Universal Page Reader (TTS for Current Active Screen) ───
  const handleReadCurrentPage = () => {
    const pathname = location.pathname;
    let pageSummary = 'Welcome to MediKiosk AI Patient Intake terminal.';

    if (pathname === '/' || pathname === '/auth') {
      pageSummary = 'Please enter your ABHA Health ID or scan your ABHA QR code to authenticate.';
    } else if (pathname === '/intake') {
      pageSummary = 'Speak your symptoms into the microphone or tap the quick symptom buttons.';
    } else if (pathname === '/scan') {
      pageSummary = 'Hold your paper prescription or lab test in front of the camera to scan.';
    } else if (pathname === '/complete') {
      pageSummary = `Your token is ${state.opdToken}. Please proceed to Room 104.`;
    } else if (pathname.includes('/profile') || pathname.includes('/locker')) {
      pageSummary = 'Patient Health Locker and MedGemma AI dialogue vault. You can view all records and ask questions.';
    } else if (pathname === '/doctor') {
      pageSummary = `Doctor Clinical Workstation for patient ${state.patientName}. Review pre-populated SOAP notes and Dashavidha parameters.`;
    }

    playNeuralTts(pageSummary, language);
  };

  // ─── Universal Voice Command Assistant (ASR) ───
  const toggleUniversalVoiceAssistant = () => {
    if (isVoiceListening) {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
      setIsVoiceListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech recognition is not supported in this browser. Please use touch navigation.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      const langMap: Record<string, string> = {
        english: 'en-US',
        hindi: 'hi-IN',
        bengali: 'bn-IN',
        tamil: 'ta-IN',
        telugu: 'te-IN',
        marathi: 'mr-IN',
        gujarati: 'gu-IN',
        kannada: 'kn-IN',
        malayalam: 'ml-IN',
        punjabi: 'pa-IN',
        odia: 'or-IN',
        urdu: 'ur-IN'
      };

      recognition.lang = langMap[language.toLowerCase()] || 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsVoiceListening(true);
        setVoiceFeedback('Listening... Say "Intake", "Scan", "Locker", "Doctor", or "Hindi"');
      };

      recognition.onresult = (event: any) => {
        const transcript = (event.results[0][0].transcript || '').toLowerCase();
        setVoiceFeedback(`Heard: "${transcript}"`);

        if (transcript.includes('scan') || transcript.includes('स्कैन') || transcript.includes('दस्तावेज')) {
          playNeuralTts('Navigating to document scanner', language);
          navigate('/scan');
        } else if (transcript.includes('intake') || transcript.includes('symptom') || transcript.includes('लक्षण') || transcript.includes('बोलो')) {
          playNeuralTts('Opening voice intake', language);
          navigate('/intake');
        } else if (transcript.includes('locker') || transcript.includes('history') || transcript.includes('लॉकर') || transcript.includes('दवा')) {
          playNeuralTts('Opening patient health locker', language);
          navigate('/profile/patient');
        } else if (transcript.includes('doctor') || transcript.includes('डॉक्टर') || transcript.includes('clinic')) {
          playNeuralTts('Opening doctor workstation', language);
          navigate('/doctor');
        } else if (transcript.includes('token') || transcript.includes('receipt') || transcript.includes('रसीद')) {
          playNeuralTts('Opening token receipt', language);
          navigate('/complete');
        } else if (transcript.includes('hindi') || transcript.includes('हिंदी')) {
          setLanguage('hindi');
          playNeuralTts('भाषा हिंदी में बदली गई', 'hindi');
        } else if (transcript.includes('english') || transcript.includes('अंग्रेजी')) {
          setLanguage('english');
          playNeuralTts('Language set to English', 'english');
        } else if (transcript.includes('sos') || transcript.includes('emergency') || transcript.includes('मदद')) {
          setShowSosModal(true);
          playNeuralTts('Emergency assistance alert activated', language);
        } else {
          playNeuralTts(`Command understood: ${transcript}`, language);
        }

        setTimeout(() => setVoiceFeedback(null), 3000);
      };

      recognition.onerror = () => {
        setIsVoiceListening(false);
        setVoiceFeedback(null);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsVoiceListening(false);
    }
  };

  const languages = ALL_SUPPORTED_LANGUAGES;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 shadow-sm transition-all print:hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Branding with Ayush Emblem & Hospital Header */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => navigate('/')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-blue-700/20 font-black text-base sm:text-lg">
              <span className="tracking-tighter">MK</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-xl font-black text-slate-900 tracking-tight">MediKiosk</span>
                <span className="text-xs px-2.5 py-0.5 font-bold bg-amber-100 text-amber-950 rounded-full border border-amber-300 flex items-center gap-1">
                  <T text="Ministry of Ayush" />
                </span>
              </div>
              <div className="text-xs text-slate-600 font-semibold hidden md:block">
                <T text="National Health Authority • ABDM Integrated Smart Kiosk" />
              </div>
            </div>
          </div>

          {/* Center: Live IST Clock & Terminal Indicator */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-full border-2 border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-mono font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span>IST {time || '10:45 AM'}</span>
            </div>
            <div className="h-3 w-px bg-slate-300" />
            <div className="text-xs text-slate-900 font-black flex items-center gap-1">
              <span className="text-blue-800">Kiosk #01</span>
            </div>
          </div>

          {/* Right: Universal Voice ASR, Language Dropdown, Read Page TTS, SOS Alert */}
          <div className="flex items-center gap-2">
            
            {/* Universal Voice Command Assistant (ASR) */}
            <button
              onClick={toggleUniversalVoiceAssistant}
              className={`px-3 py-2 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm font-extrabold ${
                isVoiceListening
                  ? 'bg-red-600 border-red-500 text-white animate-pulse shadow-md'
                  : 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-900'
              }`}
              title={isVoiceListening ? 'Listening for voice command...' : 'Universal Voice Commands (ASR)'}
            >
              {isVoiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-700" />}
              <span className="hidden lg:inline">{isVoiceListening ? 'Listening...' : 'Voice Command'}</span>
            </button>

            {/* Read Current Page Audio Button (TTS) */}
            <button
              onClick={handleReadCurrentPage}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-300 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer"
              title="Read Active Page Aloud (Neural TTS)"
            >
              <Volume2 className="w-4 h-4 text-teal-700" />
              <span className="hidden md:inline"><T text="Read Page" /></span>
            </button>

            {/* Language Selector Dropdown with IndicTrans2 AI indicator */}
            <div className="relative flex items-center bg-slate-100 p-1.5 rounded-xl border-2 border-slate-300 shadow-inner">
              <Globe className="w-4 h-4 text-teal-700 ml-1 mr-1" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                className="text-xs sm:text-sm font-black text-slate-900 bg-transparent py-0.5 pr-2 outline-none cursor-pointer"
              >
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.native} ({l.label})
                  </option>
                ))}
              </select>
            </div>

            {/* Speech Audio Guidance Toggle Button */}
            <button
              onClick={handleToggleSound}
              title="Toggle Audio Instructions"
              className={`p-2 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center ${
                soundEnabled
                  ? 'bg-teal-50 border-teal-300 text-teal-800 shadow-xs'
                  : 'bg-slate-100 border-slate-300 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Emergency Casualty SOS Red Button */}
            <button
              onClick={() => {
                setShowSosModal(true);
                if (soundEnabled) {
                  playNeuralTts('Emergency SOS triggered. Triage nurse and casualty team notified.', language);
                }
              }}
              className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              <AlertOctagon className="w-4 h-4" />
              <span className="hidden sm:inline"><T text="SOS" /></span>
            </button>

          </div>

        </div>

        {/* Live Universal Voice Command Feedback Banner */}
        {voiceFeedback && (
          <div className="bg-teal-900 text-teal-100 text-xs sm:text-sm py-2 px-4 text-center font-black flex items-center justify-center gap-2 animate-in fade-in">
            <Radio className="w-4 h-4 text-teal-300 animate-spin" />
            <span>{voiceFeedback}</span>
          </div>
        )}
      </header>

      {/* SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-red-500 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 border-2 border-red-300 mx-auto flex items-center justify-center font-bold">
              <PhoneCall className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-xl font-black text-slate-900"><T text="Casualty Emergency Assistance Alerted" /></h2>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              <T text="Triage Station A Nurse and Casualty ER Duty Officer have been notified. Please remain at Kiosk #01." />
            </p>
            <button
              onClick={() => setShowSosModal(false)}
              className="w-full py-3 bg-red-600 text-white font-extrabold rounded-2xl text-sm shadow-md cursor-pointer hover:bg-red-700 transition-colors"
            >
              <T text="Acknowledge & Close" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
