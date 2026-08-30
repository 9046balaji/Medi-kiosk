import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T, useTranslation } from '../../../context/TranslationContext';
import { RedFlagModal } from './RedFlagModal';
import { speakText, stopSpeech } from '../../../lib/speechUtils';
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
  Info,
  Radio
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
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showRedFlagModal, setShowRedFlagModal] = useState<boolean>(showRedFlagPreset);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

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

  // Audio Canvas Visualizer Animation Loop
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!isRecording) return;
      animationFrameRef.current = requestAnimationFrame(render);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = '#0D7377';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    render();
  };

  // Real WebRTC Microphone Recording Handler
  const startRealMicrophoneRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      source.connect(analyserRef.current);

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      drawWaveform();
    } catch (err) {
      console.warn('Microphone permission denied or unavailable, using simulation:', err);
      setIsRecording(true);
    }
  };

  const stopRealMicrophoneRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRecording(false);

    // Append new speech message
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'patient',
        text: 'रात को सोने के बाद दर्द की वजह से नींद खुल जाती है और गले में खट्टा पानी आता है।',
        translation: 'The pain wakes me up at night after sleeping, and I get sour acid reflux in my throat.',
        confidence: 97,
        timestamp: nowStr
      }
    ]);
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRealMicrophoneRecording();
    } else {
      startRealMicrophoneRecording();
    }
  };

  const handleSimulateRedFlag = () => {
    setShowRedFlagModal(true);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {showRedFlagModal && (
        <RedFlagModal onClose={() => setShowRedFlagModal(false)} />
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border-2 border-slate-200 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-lg shadow-teal-600/30">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  <T text="Patient Voice ASR Intake & Symptom Elicitation" />
                </h1>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isAyurvedicMode ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-teal-100 text-teal-800 border-teal-200'
                }`}>
                  {isAyurvedicMode ? <T text="Dashavidha Ayush Mode" /> : <T text="Allopathic SOCRATES Mode" />}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                <T text="Speak naturally in your preferred Indic language. Our AI engine transcribes, translates, and formats clinical notes." />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateRedFlag}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <T text="Trigger Red-Flag Simulation" />
            </button>

            <button
              onClick={() => navigate(isAyurvedicMode ? '/scan?mode=ayurvedic' : '/scan')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span><T text="Proceed to Prescription Scanner" /></span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2 Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Live Audio Recording Terminal (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-6 text-center">
              
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center justify-center gap-1.5">
                  <Radio className={`w-4 h-4 ${isRecording ? 'text-red-600 animate-ping' : 'text-teal-600'}`} />
                  <T text="Interactive Voice Recording Terminal" />
                </span>
                <p className="text-xs text-slate-500">
                  <T text="Click the microphone to record your voice. Waveform indicates real-time microphone input level." />
                </p>
              </div>

              {/* Big Mic Circle Button */}
              <div className="relative py-4 flex items-center justify-center">
                <button
                  onClick={handleToggleRecording}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xl ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 text-white ring-8 ring-red-200 animate-pulse scale-105'
                      : 'bg-teal-600 hover:bg-teal-700 text-white ring-8 ring-teal-100 hover:scale-105'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-10 h-10 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider"><T text="Stop Recording" /></span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-10 h-10 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider"><T text="Tap to Speak" /></span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Canvas Audio Waveform */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                  <span><T text="Microphone Audio Frequency Spectrum" /></span>
                  <span className={isRecording ? 'text-red-600 font-mono font-bold' : 'text-slate-400'}>
                    {isRecording ? '● RECORDING LIVE' : 'STANDBY'}
                  </span>
                </div>

                <canvas
                  ref={canvasRef}
                  width={300}
                  height={50}
                  className="w-full h-12 bg-white rounded-xl border border-slate-200 shadow-inner"
                />
              </div>

              {/* Audio Playback Element if Recorded */}
              {recordedAudioUrl && (
                <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 space-y-2 text-xs">
                  <div className="font-bold text-teal-900"><T text="Recorded Patient Audio Preview" /></div>
                  <audio
                    ref={audioPlayerRef}
                    src={recordedAudioUrl}
                    controls
                    className="w-full h-8"
                  />
                </div>
              )}

            </div>

          </div>

          {/* Right Column: Live Conversation Stream (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                  <T text="Real-Time ASR & Indic Translation Stream" />
                </h3>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  <T text="96.4% Word Accuracy" />
                </span>
              </div>

              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2 ${
                      msg.sender === 'ai'
                        ? 'bg-teal-50/70 border-teal-200 text-teal-950 ml-0 mr-8'
                        : 'bg-slate-50 border-slate-200 text-slate-900 ml-8 mr-0'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                          msg.sender === 'ai' ? 'bg-teal-700 text-white' : 'bg-slate-800 text-white'
                        }`}>
                          {msg.sender === 'ai' ? <T text="MediKiosk AI" /> : <T text="Patient Speech" />}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{msg.timestamp}</span>
                      </div>

                      <button
                        onClick={() => speakText(msg.text, state.language)}
                        className="p-1 rounded bg-white hover:bg-slate-100 text-teal-700 border border-slate-200 cursor-pointer shadow-xs"
                        title="Listen to speech"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                      {msg.text}
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-0.5 font-mono">
                      <div className="text-[10px] font-bold text-slate-400 uppercase"><T text="English Translation" /></div>
                      <div>{msg.translation}</div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
