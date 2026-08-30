import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T, useTranslation } from '../../../context/TranslationContext';
import { RedFlagModal } from './RedFlagModal';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Stethoscope,
  Activity,
  Heart,
  MessageSquare,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'patient';
  text: string;
  translation: string;
  confidence?: number;
  timestamp: string;
}

export const IntakeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const state = useMediKiosk();
  const { t } = useTranslation();

  const isAyurvedicMode = searchParams.get('mode') === 'ayurvedic' || state.mode === 'ayurvedic';
  const showRedFlagPreset = searchParams.get('redflag') === 'true';

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showRedFlagModal, setShowRedFlagModal] = useState<boolean>(showRedFlagPreset);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Hello. Please describe where exactly in your body you are experiencing discomfort or pain.',
      translation: 'Hello. Please describe where exactly in your body you are experiencing discomfort or pain.',
      confidence: 98,
      timestamp: '10:14:02 AM'
    },
    {
      id: 'msg-2',
      sender: 'patient',
      text: 'मुझे पिछले 3 हफ्तों से पेट के ऊपरी हिस्से में बहुत तेज जलन महसूस हो रही है।',
      translation: 'I have been experiencing a severe burning sensation in the upper part of my stomach for the last 3 weeks.',
      confidence: 94,
      timestamp: '10:14:18 AM'
    },
    {
      id: 'msg-3',
      sender: 'ai',
      text: 'यह दर्द सबसे ज्यादा कब होता है, और क्या इसके साथ खट्टी डकारें भी आती हैं?',
      translation: 'When is this pain most intense, and are there associated sour belches?',
      confidence: 99,
      timestamp: '10:14:32 AM'
    },
    {
      id: 'msg-4',
      sender: 'patient',
      text: 'खाना खाने के करीब 45 मिनट बाद यह बहुत ज्यादा बढ़ जाता है, छाती में भारीपन और खट्टी खट्टी डकारें आती हैं।',
      translation: 'It worsens severely about 45 minutes after meals, with pressure in the chest and sour acid belching.',
      confidence: 96,
      timestamp: '10:14:50 AM'
    }
  ]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleSimulateNormalSpeech = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'patient',
          text: 'रात को सोने के बाद दर्द की वजह से नींद खुल जाती है और गले में खट्टा पानी आता है।',
          translation: 'The pain wakes me up at night after sleeping, and I get sour acid reflux in my throat.',
          confidence: 95,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }, 1500);
  };

  const handleSimulateRedFlagSpeech = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      state.triggerRedFlag({
        keyword: 'Acute Chest Compression & Diaphoresis',
        severity: 'P1',
        timestamp: new Date().toLocaleTimeString(),
        description: 'Patient reports sudden retrosternal crushing pain radiating to left jaw.'
      });
      setShowRedFlagModal(true);
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* P1 Red Flag Emergency Modal */}
      {showRedFlagModal && (
        <RedFlagModal
          onClose={() => setShowRedFlagModal(false)}
          onEscalateToNurse={() => navigate('/nurse')}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  <T text="Bilingual Voice AI Intake" />
                </h1>
                <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded-full ${
                  isAyurvedicMode ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-teal-100 text-teal-800 border border-teal-200'
                }`}>
                  {isAyurvedicMode ? <T text="Ayush Dashavidha Mode" /> : <T text="Allopathic SOCRATES Mode" />}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                <T text="Patient speech is transcribed and translated live into clinical English." />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRedFlagModal(true)}
              className="px-3.5 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-900 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
              <T text="Simulate Red Flag Alert" />
            </button>

            <button
              onClick={() => navigate('/scan')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span><T text="Proceed to Document Scanner" /></span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Audio Waveform & Speech Recording Controls */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl border border-teal-800/40 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center font-bold">
                <Mic className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  <T text="Acoustic Voice Sensor" />
                </div>
                <div className="text-sm font-semibold text-slate-200">
                  {isRecording ? <T text="Listening... Speak now" /> : <T text="Tap microphone button to answer" />}
                </div>
              </div>
            </div>

            {/* Audio Waveform Visualization Bar */}
            <div className="flex items-center gap-1 h-8 px-4 bg-slate-950/60 rounded-xl border border-white/10">
              {[40, 70, 30, 90, 50, 80, 20, 100, 60, 40, 70, 30, 85, 45, 95].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 bg-teal-400 rounded-full transition-all duration-150 ${
                    isRecording ? 'animate-pulse' : 'opacity-40'
                  }`}
                  style={{ height: isRecording ? `${h}%` : '20%' }}
                />
              ))}
            </div>
          </div>

          {/* Record Button & Simulation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
            <button
              onClick={toggleRecording}
              className={`px-6 py-3.5 rounded-2xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30 animate-pulse'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/30'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span>{isRecording ? <T text="Stop Voice Recording" /> : <T text="Start Voice Recording" />}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateNormalSpeech}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <T text="⚡ Demo: Normal Hindi Symptom" />
              </button>

              <button
                onClick={handleSimulateRedFlagSpeech}
                className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <T text="⚡ Demo: Cardiac Red Flag" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Bilingual Transcript Chat Stream */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-600" />
              <T text="Live Conversation Transcript (ASR & Translation)" />
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full">
              Bilingual Sync
            </span>
          </div>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-2xl border-2 space-y-1.5 transition-all ${
                  msg.sender === 'ai'
                    ? 'border-teal-200 bg-teal-50/60 ml-0 mr-8 sm:mr-16'
                    : 'border-slate-200 bg-slate-50 mr-0 ml-8 sm:ml-16'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className={msg.sender === 'ai' ? 'text-teal-900' : 'text-slate-900'}>
                    {msg.sender === 'ai' ? 'MediKiosk AI' : `${state.patientName} (Patient)`}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {msg.confidence}% Conf • {msg.timestamp}
                  </span>
                </div>

                {/* Primary Speech Text */}
                <div className="text-sm sm:text-base font-semibold text-slate-900">
                  <T text={msg.text} />
                </div>

                {/* English Clinical Grounding */}
                <div className="text-xs font-mono text-slate-600 bg-white/80 p-2 rounded-lg border border-slate-200/80">
                  EN: {msg.translation}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
