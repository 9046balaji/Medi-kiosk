import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T, useTranslation } from '../../../context/TranslationContext';
import { RedFlagModal } from './RedFlagModal';
import { speakText, stopSpeech } from '../../../lib/speechUtils';
import { transcribeAudio, checkAsrHealth, ASRResult, ASRHealthResult } from '../../../lib/asrApi';
import { translateText } from '../../../lib/translationApi';
import { checkEmergencyTriage, TriageResult } from '../../../lib/emergencyApi';
import { getFloresCode } from '../../../lib/languageMap';
import { playNeuralTts, stopNeuralTts } from '../../../lib/ttsApi';
import {
  Mic, MicOff, Volume2, Sparkles, AlertTriangle, CheckCircle2,
  ArrowRight, Stethoscope, MessageSquare, Zap, Radio, Cpu,
  Wifi, WifiOff, RefreshCw, Loader2, Brain, Tag, HeartHandshake,
  HelpCircle, Eye, EyeOff, VolumeX
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ChatMessage {
  id: string;
  sender: 'ai' | 'patient';
  text: string;
  translation: string;
  confidence?: number;
  timestamp: string;
  latency_ms?: number;
  decoder?: string;
  isLoading?: boolean;
  isError?: boolean;
  isSilent?: boolean;
}

type RecordingState = 'idle' | 'recording' | 'processing';
type AsrMode = 'ctc' | 'rnnt';

// ---------------------------------------------------------------------------
// 1-Tap Quick Symptom Chips (Default in English, translated dynamically via <T />)
// ---------------------------------------------------------------------------
const QUICK_SYMPTOM_CHIPS = [
  { icon: '🫀', text: 'Severe chest pain or pressure', category: 'cardiac' },
  { icon: '🤢', text: 'Stomach burning, acidity or pain', category: 'gi' },
  { icon: '🌡️', text: 'High fever and chills', category: 'fever' },
  { icon: '🦵', text: 'Joint and knee pain while walking', category: 'ortho' },
  { icon: '🤧', text: 'Persistent cough and breathing difficulty', category: 'resp' },
  { icon: '🤕', text: 'Severe headache and dizziness', category: 'neuro' },
  { icon: '🩸', text: 'Routine diabetes and blood pressure checkup', category: 'general' },
  { icon: '🌿', text: 'Ayurvedic consultation and weakness', category: 'ayush' }
];

const FIRST_QUESTION = 'Hello! Please describe the exact location and nature of your discomfort or pain.';

const SOCRATES_SEQUENCE = ['S', 'O', 'C', 'R', 'A', 'T', 'E', 'S2'];

const now = () =>
  new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const IntakeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const state = useMediKiosk();
  const { t } = useTranslation();

  const isAyurvedicMode =
    searchParams.get('mode') === 'ayurvedic' || state.mode === 'ayurvedic';
  const showRedFlagPreset = searchParams.get('redflag') === 'true';

  // Pull conversational brain state from context
  const {
    isAiThinking,
    handleAiDrivenIntakeTurn,
    detectedSymptoms,
    emergencyContext,
    aiGeneratedQuestion,
    intakeComplete,
    clearConversationHistory,
  } = state;

  // --- Core state ---
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [asrMode, setAsrMode] = useState<AsrMode>('ctc');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [showRedFlagModal, setShowRedFlagModal] = useState(showRedFlagPreset);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [asrHealth, setAsrHealth] = useState<ASRHealthResult | null>(null);
  const [socratesIndex, setSocratesIndex] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);
  const [latencyCount, setLatencyCount] = useState(0);
  const [waveformActive, setWaveformActive] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);

  // --- Refs ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recordingStartRef = useRef<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const speechRecognitionRef = useRef<any>(null);

  const isEnglish = state.language === 'english';

  // --- Messages: first question is instant (no MedGemma wait) ---
  const firstQuestion = FIRST_QUESTION;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: firstQuestion,
      translation: firstQuestion,
      confidence: 99,
      timestamp: now(),
    },
  ]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Health check on mount
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const health = await checkAsrHealth();
      if (!cancelled) setAsrHealth(health);
    };
    check();
    const interval = setInterval(check, 15_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // ---------------------------------------------------------------------------
  // Play Voice Prompt via Neural TTS
  // ---------------------------------------------------------------------------
  const handlePlayMessageAudio = (text: string) => {
    setIsSpeakingAudio(true);
    playNeuralTts(text, state.language).finally(() => {
      setIsSpeakingAudio(false);
    });
  };

  // ---------------------------------------------------------------------------
  // Quick 1-Tap Symptom Chip Click Handler
  // ---------------------------------------------------------------------------
  const handleSelectQuickChip = (chip: typeof QUICK_SYMPTOM_CHIPS[0]) => {
    const symptomText = chip.text;
    
    // Add patient message
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-chip-${Date.now()}`,
        sender: 'patient',
        text: `${chip.icon} ${symptomText}`,
        translation: symptomText,
        confidence: 99,
        timestamp: now(),
      },
    ]);

    // Send to MedGemma conversational brain
    if (handleAiDrivenIntakeTurn) {
      handleAiDrivenIntakeTurn(symptomText, symptomText).then(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-ai-${Date.now()}`,
            sender: 'ai',
            text: state.aiGeneratedQuestion || FIRST_QUESTION,
            translation: state.aiGeneratedQuestion || FIRST_QUESTION,
            confidence: 99,
            timestamp: now(),
          },
        ]);
        handlePlayMessageAudio(state.aiGeneratedQuestion || FIRST_QUESTION);
      });
    }

    // Emergency triage check
    checkEmergencyTriage(symptomText, state.language, state.patientAge, state.patientGender, false, state.abhaId || 'kiosk-sess-1').then((triageRes) => {
      setTriageResult(triageRes);
      if (triageRes.is_emergency) {
        setShowRedFlagModal(true);
      }
    });
  };

  // ---------------------------------------------------------------------------
  // Waveform Visualizer
  // ---------------------------------------------------------------------------
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!waveformActive) return;
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, '#059669');
        gradient.addColorStop(1, '#10b981');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, Math.max(barWidth - 1, 1), barHeight, 2);
        ctx.fill();
        x += barWidth + 1;
      }
    };
    render();
  }, [waveformActive]);

  useEffect(() => {
    if (waveformActive) drawWaveform();
    else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      const canvas = canvasRef.current;
      if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [waveformActive, drawWaveform]);

  // ---------------------------------------------------------------------------
  // Recording: start — PCM via Web Audio API → 16kHz mono WAV
  // ---------------------------------------------------------------------------
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const SAMPLE_RATE = 16000;

  const pcmToWav = (pcm: Float32Array, sampleRate: number): Blob => {
    const numSamples = pcm.length;
    const buf = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buf);
    const ws = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); view.setUint32(4, 36 + numSamples * 2, true);
    ws(8, 'WAVE'); ws(12, 'fmt '); view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    ws(36, 'data'); view.setUint32(40, numSamples * 2, true);
    for (let i = 0; i < numSamples; i++) {
      const s = Math.max(-1, Math.min(1, pcm[i]));
      view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Blob([buf], { type: 'audio/wav' });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: SAMPLE_RATE, channelCount: 1, echoCancellation: true }
      });
      const AudioCtx = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 64;
      source.connect(analyserRef.current);

      const processor = ctx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;
      pcmChunksRef.current = [];
      processor.onaudioprocess = (e) => {
        pcmChunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      };
      source.connect(processor);
      processor.connect(ctx.destination);

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        processor.disconnect();
        processor.onaudioprocess = null;
        const totalLen = pcmChunksRef.current.reduce((s, c) => s + c.length, 0);
        const merged = new Float32Array(totalLen);
        let off = 0;
        for (const chunk of pcmChunksRef.current) { merged.set(chunk, off); off += chunk.length; }
        const wavBlob = pcmToWav(merged, SAMPLE_RATE);
        setRecordedAudioUrl(URL.createObjectURL(wavBlob));
        await handleTranscribe(wavBlob);
      };
      mr.start();
      recordingStartRef.current = Date.now();
      setRecordingState('recording');
      setWaveformActive(true);
    } catch (err) {
      console.warn('Mic unavailable:', err);
    }
  };

  // ---------------------------------------------------------------------------
  // English SpeechRecognition
  // ---------------------------------------------------------------------------
  const startEnglishRecognition = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setMessages((prev) => [...prev, {
        id: `msg-err-${Date.now()}`, sender: 'patient',
        text: '⚠️ Browser speech recognition not supported. Please use Chrome or Edge.',
        translation: '', timestamp: now(), isError: true,
      }]);
      return;
    }
    const recognition = new SR();
    speechRecognitionRef.current = recognition;
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    setRecordingState('recording');
    recordingStartRef.current = Date.now();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript?.trim() || '';
      const confidence = Math.round(event.results[0][0].confidence * 100);
      const latency = Date.now() - recordingStartRef.current;
      const nowStr = now();

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-en-${Date.now()}`,
          sender: 'patient',
          text: transcript || '(nothing heard)',
          translation: '',
          confidence,
          timestamp: nowStr,
          latency_ms: latency,
          decoder: 'browser',
        },
      ]);

      if (transcript) {
        if (handleAiDrivenIntakeTurn) {
          handleAiDrivenIntakeTurn(transcript, transcript).then(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: `msg-ai-${Date.now()}`,
                sender: 'ai',
                text: state.aiGeneratedQuestion || FIRST_QUESTION,
                translation: state.aiGeneratedQuestion || FIRST_QUESTION,
                confidence: 99,
                timestamp: now(),
              },
            ]);
            handlePlayMessageAudio(state.aiGeneratedQuestion || FIRST_QUESTION);
          });
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('SpeechRecognition error:', event.error);
      setRecordingState('idle');
    };

    recognition.onend = () => {
      setRecordingState('idle');
      speechRecognitionRef.current = null;
    };

    recognition.start();
  };

  const stopEnglishRecognition = () => {
    speechRecognitionRef.current?.stop();
    setRecordingState('idle');
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setWaveformActive(false);
    setRecordingState('processing');
  };

  // ---------------------------------------------------------------------------
  // Transcribe via ASR backend + translate to English
  // ---------------------------------------------------------------------------
  const handleTranscribe = async (blob: Blob) => {
    const recDuration = (Date.now() - recordingStartRef.current) / 1000;
    setTotalDuration((p) => p + recDuration);

    const loadingId = `msg-loading-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        sender: 'patient',
        text: '…',
        translation: '',
        timestamp: now(),
        isLoading: true,
      },
    ]);

    const result: ASRResult = await transcribeAudio(blob, state.language, asrMode);
    const isBackendOffline = result.model_name === 'offline';
    const isTrulySilent = result.success && result.is_silent;
    const isServerError = !result.success && !isBackendOffline;
    const transcript = result.transcript?.trim() || '';

    if (result.latency_ms > 0 && !isBackendOffline) {
      setAvgLatency((prev) => {
        const total = prev * latencyCount + result.latency_ms;
        return total / (latencyCount + 1);
      });
      setLatencyCount((p) => p + 1);
    }

    let translation = transcript;
    if (transcript && state.language !== 'english' && !isBackendOffline) {
      try {
        const flores = getFloresCode(state.language as never);
        translation = await translateText(transcript, flores, 'eng_Latn');
      } catch {
        translation = transcript;
      }
    }

    let displayText = transcript;
    let displayConfidence: number | undefined = result.success ? 94 : undefined;
    let isError = false;

    if (isBackendOffline) {
      displayText = '⚠️ Speech recording unavailable — please try again or select from the quick touch buttons below';
      displayConfidence = undefined;
      isError = true;
    } else if (isTrulySilent) {
      displayText = '🔇 Silence detected — please speak clearly into the microphone';
      displayConfidence = undefined;
    } else if (isServerError) {
      displayText = `❌ Audio error — ${result.transcript || 'please try speaking again'}`;
      displayConfidence = undefined;
      isError = true;
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === loadingId
          ? {
              ...m,
              text: displayText,
              translation: !isError && !isTrulySilent ? (translation || transcript) : '',
              isLoading: false,
              confidence: displayConfidence,
              latency_ms: isBackendOffline ? undefined : result.latency_ms,
              decoder: isBackendOffline ? undefined : result.decoder,
              isError,
              isSilent: isTrulySilent,
            }
          : m
      )
    );

    if (transcript && result.success && !isBackendOffline) {
      if (handleAiDrivenIntakeTurn) {
        handleAiDrivenIntakeTurn(transcript, translation || transcript).then(() => {
          handlePlayMessageAudio(state.aiGeneratedQuestion || FIRST_QUESTION);
        }).catch(console.error);
      }

      if (state.emergencyContext) {
        setShowRedFlagModal(true);
      } else {
        checkEmergencyTriage(transcript, state.language, state.patientAge, state.patientGender, false, state.abhaId || 'kiosk-sess-1').then((triageRes) => {
          setTriageResult(triageRes);
          if (triageRes.is_emergency) {
            setShowRedFlagModal(true);
          }
        });
      }
    }

    setRecordingState('idle');
  };

  const handleToggleRecording = () => {
    if (isEnglish) {
      if (recordingState === 'idle') startEnglishRecognition();
      else if (recordingState === 'recording') stopEnglishRecognition();
    } else {
      if (recordingState === 'idle') startRecording();
      else if (recordingState === 'recording') stopRecording();
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-3 sm:p-6 space-y-4">
      {showRedFlagModal && (
        <RedFlagModal
          onClose={() => setShowRedFlagModal(false)}
          onEscalateToNurse={() => {
            setShowRedFlagModal(false);
            navigate('/complete');
          }}
          emergencyContext={emergencyContext}
          triageResult={triageResult}
        />
      )}

      <div className="w-full space-y-4">

        {/* ─── 3-Step Breadcrumb Bar ─── */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
            <span className="px-3 py-1 bg-emerald-600 text-white rounded-full flex items-center gap-1.5 shadow-sm">
              <Mic className="w-3.5 h-3.5" />
              <span><T text="Step 1: Speak Symptoms" /></span>
            </span>
            <span className="text-slate-400">➔</span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-bold">
              <T text="Step 2: Scan Paper" /> 📄
            </span>
            <span className="text-slate-400">➔</span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-bold">
              <T text="Step 3: Get Token Slip" /> 🎟️
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              {showTechnicalDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showTechnicalDetails ? <T text="Simple Mode" /> : <T text="Telemetry Details" />}</span>
            </button>

            <button
              onClick={() => navigate(isAyurvedicMode ? '/scan?mode=ayurvedic' : '/scan')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer hover:scale-102"
            >
              <span><T text="Proceed to Scanner" /> 📄</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── Main Columns ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ── LEFT: Giant Microphone Terminal ── */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-5 text-center relative overflow-hidden">
              
              {/* Spoken prompt banner */}
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 text-xs sm:text-sm font-bold flex items-center justify-between gap-2 shadow-inner">
                <div className="flex items-center gap-2 text-left">
                  <Volume2 className="w-5 h-5 text-emerald-600 shrink-0 animate-pulse" />
                  <span><T text="Tap the mic and speak your health issue" /></span>
                </div>
                <button
                  onClick={() => handlePlayMessageAudio('Hello! Please tap the microphone button and describe your symptoms.')}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-black shrink-0 hover:bg-emerald-700 cursor-pointer"
                >
                  <T text="Listen" /> 🔊
                </button>
              </div>

              {/* ── GIANT PULSING MICROPHONE BUTTON ── */}
              <div className="relative flex items-center justify-center py-4">
                {/* Visual pulse waves */}
                {recordingState === 'recording' && (
                  <>
                    <span className="absolute w-48 h-48 rounded-full bg-red-500/20 animate-ping" />
                    <span className="absolute w-40 h-40 rounded-full bg-red-500/30 animate-pulse" />
                  </>
                )}
                {isAiThinking && (
                  <span className="absolute w-44 h-44 rounded-full bg-violet-500/20 animate-pulse" />
                )}

                <button
                  onClick={handleToggleRecording}
                  disabled={recordingState === 'processing' || !!isAiThinking}
                  className={`relative w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl cursor-pointer disabled:cursor-not-allowed ${
                    recordingState === 'recording'
                      ? 'bg-red-600 hover:bg-red-700 text-white ring-12 ring-red-200 scale-105'
                      : recordingState === 'processing' || isAiThinking
                      ? 'bg-violet-600 text-white ring-12 ring-violet-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-12 ring-emerald-100 hover:scale-105'
                  }`}
                >
                  {recordingState === 'recording' ? (
                    <>
                      <MicOff className="w-12 h-12 mb-1.5 animate-bounce" />
                      <span className="text-xs font-black uppercase tracking-wider"><T text="Stop Speaking" /></span>
                    </>
                  ) : recordingState === 'processing' || isAiThinking ? (
                    <>
                      <Loader2 className="w-12 h-12 mb-1.5 animate-spin" />
                      <span className="text-xs font-black uppercase tracking-wider">
                        {isAiThinking ? <T text="Thinking…" /> : <T text="Analyzing…" />}
                      </span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-14 h-14 mb-1" />
                      <span className="text-xs font-black uppercase tracking-wider"><T text="Tap to Speak" /></span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Hint */}
              <div className="font-bold text-xs sm:text-sm">
                {recordingState === 'recording' ? (
                  <span className="text-red-600 font-black animate-pulse flex items-center justify-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    <T text="Listening... please speak clearly into the mic" />
                  </span>
                ) : isAiThinking ? (
                  <span className="text-violet-700 font-black flex items-center justify-center gap-1.5">
                    <Brain className="w-4 h-4 animate-spin text-violet-600" />
                    <T text="MedGemma AI is formulating the next question..." />
                  </span>
                ) : (
                  <span className="text-slate-600">
                    <T text="Tap the mic button above and speak your symptom" />
                  </span>
                )}
              </div>

              {/* ── Quick Symptom Presets ── */}
              <div className="pt-2 space-y-2 text-left border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-black text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span><T text="Or choose from common symptoms:" /></span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {QUICK_SYMPTOM_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuickChip(chip)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/60 text-left transition-all cursor-pointer flex items-center gap-2 group"
                    >
                      <span className="text-lg shrink-0 group-hover:scale-125 transition-transform">{chip.icon}</span>
                      <span className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-950 leading-tight">
                        <T text={chip.text} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Technical Details (Visible in Telemetry Mode) */}
              {showTechnicalDetails && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-left">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>Waveform Spectrum & Decoder</span>
                    <span className="font-mono text-emerald-600">IndicConformer 600M</span>
                  </div>
                  <canvas ref={canvasRef} width={300} height={40} className="w-full h-10 bg-white rounded-lg border" />
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => setAsrMode('ctc')}
                      className={`flex-1 py-1 rounded text-[10px] font-bold border ${asrMode === 'ctc' ? 'bg-teal-600 text-white' : 'bg-white'}`}
                    >
                      CTC (25ms)
                    </button>
                    <button
                      onClick={() => setAsrMode('rnnt')}
                      className={`flex-1 py-1 rounded text-[10px] font-bold border ${asrMode === 'rnnt' ? 'bg-indigo-600 text-white' : 'bg-white'}`}
                    >
                      RNNT (65ms)
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── RIGHT: Doctor AI Conversation Stream ── */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xl h-full flex flex-col justify-between space-y-4">

              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-emerald-600" />
                    <span><T text="Clinical Consultation Conversation" /></span>
                  </h3>
                  <button
                    onClick={() => setMessages([{
                      id: 'msg-init-reset',
                      sender: 'ai',
                      text: firstQuestion,
                      translation: firstQuestion,
                      confidence: 99,
                      timestamp: now(),
                    }])}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 cursor-pointer"
                    title="Reset conversation"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Messages List */}
                <div className="space-y-3 overflow-y-auto pr-1 max-h-[460px]">
                  {messages.map((msg) => {
                    const isAi = msg.sender === 'ai';
                    return (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-2xl border transition-all space-y-2 ${
                          isAi
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 mr-6'
                            : 'bg-white border-slate-200 text-slate-900 ml-6 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-black ${
                              isAi ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-white'
                            }`}>
                              {isAi ? <T text="MediKiosk AI Doctor" /> : <T text="You (Patient)" />}
                            </span>
                            <span className="text-slate-400 text-[10px]">{msg.timestamp}</span>
                          </div>

                          {/* Sound button to listen */}
                          <button
                            onClick={() => handlePlayMessageAudio(msg.text)}
                            className="p-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer shadow-sm flex items-center gap-1 text-[11px] font-bold"
                            title="Listen"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span><T text="Listen" /></span>
                          </button>
                        </div>

                        <div className="text-sm sm:text-base font-bold leading-relaxed text-slate-900">
                          {msg.isLoading ? (
                            <div className="flex items-center gap-2 text-slate-500 font-normal">
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                              <span><T text="Processing your voice transcript..." /></span>
                            </div>
                          ) : (
                            msg.text
                          )}
                        </div>

                        {/* Translation (if applicable) */}
                        {!msg.isLoading && msg.translation && msg.translation !== msg.text && (
                          <div className="p-2 bg-white/80 rounded-xl border border-slate-200 text-xs font-mono text-slate-600">
                            {msg.translation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Bottom Proceed Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-bold">
                  <T text="Finished describing symptoms? Proceed below ➔" />
                </div>
                <button
                  onClick={() => navigate(isAyurvedicMode ? '/scan?mode=ayurvedic' : '/scan')}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer hover:scale-102"
                >
                  <span><T text="Scan Paper Prescriptions" /> ➔</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
