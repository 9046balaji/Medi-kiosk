import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T, useTranslation } from '../../../context/TranslationContext';
import { RedFlagModal } from './RedFlagModal';
import { speakText, stopSpeech } from '../../../lib/speechUtils';
import { transcribeAudio, checkAsrHealth, ASRResult, ASRHealthResult } from '../../../lib/asrApi';
import { translateText } from '../../../lib/translationApi';
import { getFloresCode } from '../../../lib/languageMap';
import {
  Mic, MicOff, Volume2, Sparkles, AlertTriangle, CheckCircle2,
  ArrowRight, Stethoscope, MessageSquare, Zap, Radio, Cpu,
  Wifi, WifiOff, RefreshCw, Loader2
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
  isError?: boolean;       // backend offline or server error
  isSilent?: boolean;     // audio was genuinely silent
}

type RecordingState = 'idle' | 'recording' | 'processing';
type AsrMode = 'ctc' | 'rnnt';

// ---------------------------------------------------------------------------
// SOCRATES AI question sequence
// ---------------------------------------------------------------------------
const SOCRATES_QUESTIONS: Record<string, string> = {
  S: 'Hello. Please describe the exact location and nature of your discomfort or pain.',
  O: 'When did this symptom begin? Was the onset sudden or gradual?',
  C: 'How would you describe the character of the pain — sharp, dull, burning, pressure?',
  R: 'Does the pain radiate or spread to any other part of your body?',
  A: 'Is there anything that makes the pain better or worse?',
  T: 'On a scale of 1 to 10, how severe is your pain right now? How has it changed over time?',
  E: 'Are there any other symptoms accompanying this — nausea, fever, breathlessness?',
  S2: 'How is this symptom affecting your daily routine, sleep, or appetite?',
};

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

  // --- Core state ---
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [asrMode, setAsrMode] = useState<AsrMode>('ctc');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [showRedFlagModal, setShowRedFlagModal] = useState(showRedFlagPreset);
  const [asrHealth, setAsrHealth] = useState<ASRHealthResult | null>(null);
  const [socratesIndex, setSocratesIndex] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);
  const [latencyCount, setLatencyCount] = useState(0);
  const [waveformActive, setWaveformActive] = useState(false);

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

  // --- Messages ---
  const firstQuestion = SOCRATES_QUESTIONS['S'];
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
        gradient.addColorStop(0, '#0d9488');
        gradient.addColorStop(1, '#14b8a6');
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
      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [waveformActive, drawWaveform]);

  // ---------------------------------------------------------------------------
  // Recording: start — PCM via Web Audio API → 16kHz mono WAV
  // Avoids audio/webm which requires ffmpeg to decode on Windows backend
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

      // Capture raw PCM via ScriptProcessor
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;
      pcmChunksRef.current = [];
      processor.onaudioprocess = (e) => {
        pcmChunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      };
      source.connect(processor);
      processor.connect(ctx.destination);

      // MediaRecorder only used for stream lifecycle (onstop trigger)
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        processor.disconnect();
        processor.onaudioprocess = null;
        // Flatten PCM chunks → WAV
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
  // English: browser SpeechRecognition API (no backend needed)
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
          translation: '',   // English → no translation needed
          confidence,
          timestamp: nowStr,
          latency_ms: latency,
          decoder: 'browser',
        },
      ]);

      if (transcript) {
        const nextIdx = Math.min(socratesIndex + 1, SOCRATES_SEQUENCE.length - 1);
        setSocratesIndex(nextIdx);
        const nextKey = SOCRATES_SEQUENCE[nextIdx];
        setTimeout(() => {
          setMessages((prev) => [...prev, {
            id: `msg-ai-${Date.now()}`, sender: 'ai',
            text: SOCRATES_QUESTIONS[nextKey],
            translation: SOCRATES_QUESTIONS[nextKey],
            confidence: 99, timestamp: now(),
          }]);
        }, 400);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('SpeechRecognition error:', event.error);
      setMessages((prev) => [...prev, {
        id: `msg-err-${Date.now()}`, sender: 'patient',
        text: `⚠️ Recognition error: ${event.error}. Try again.`,
        translation: '', timestamp: now(), isError: true,
      }]);
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

    // Add loading bubble
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

    // ── Classify the result into 3 distinct cases ──────────────────────────
    // 1. Backend offline / network error  → model_name === 'offline'
    // 2. Audio was genuinely silent       → success=true, is_silent=true, transcript=''
    // 3. Real transcript (success)        → success=true, transcript non-empty
    // 4. Backend returned an error        → success=false, model_name !== 'offline'
    const isBackendOffline = result.model_name === 'offline';
    const isTrulySilent   = result.success && result.is_silent;
    const isServerError   = !result.success && !isBackendOffline;
    const transcript      = result.transcript?.trim() || '';

    // Update latency rolling average (only on real responses)
    if (result.latency_ms > 0 && !isBackendOffline) {
      setAvgLatency((prev) => {
        const total = prev * latencyCount + result.latency_ms;
        return total / (latencyCount + 1);
      });
      setLatencyCount((p) => p + 1);
    }

    // Translate transcript → English (only when we have real text)
    let translation = transcript;
    if (transcript && state.language !== 'english' && !isBackendOffline) {
      try {
        const flores = getFloresCode(state.language as never);
        translation = await translateText(transcript, flores, 'eng_Latn');
      } catch {
        translation = transcript;
      }
    }

    // Build the display text based on case
    let displayText = transcript;
    let displayConfidence: number | undefined = result.success ? 94 : undefined;
    let isError = false;

    if (isBackendOffline) {
      displayText = '⚠️ ASR server offline — start the Python backend on port 8001';
      displayConfidence = undefined;
      isError = true;
    } else if (isTrulySilent) {
      displayText = '🔇 Silence detected — please speak clearly into the microphone';
      displayConfidence = undefined;
    } else if (isServerError) {
      displayText = `❌ Transcription error — ${result.transcript || 'unknown error'}`;
      displayConfidence = undefined;
      isError = true;
    }

    // Replace loading bubble
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

    // Advance SOCRATES only on a real successful transcript
    if (transcript && result.success && !isBackendOffline) {
      const nextIdx = Math.min(socratesIndex + 1, SOCRATES_SEQUENCE.length - 1);
      setSocratesIndex(nextIdx);
      const nextKey = SOCRATES_SEQUENCE[nextIdx];
      const nextQuestion = SOCRATES_QUESTIONS[nextKey];

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-ai-${Date.now()}`,
            sender: 'ai',
            text: nextQuestion,
            translation: nextQuestion,
            confidence: 99,
            timestamp: now(),
          },
        ]);
      }, 400);
    }

    setRecordingState('idle');
  };

  const handleToggleRecording = () => {
    if (isEnglish) {
      // English: use browser SpeechRecognition API
      if (recordingState === 'idle') startEnglishRecognition();
      else if (recordingState === 'recording') stopEnglishRecognition();
    } else {
      // Indian languages: use IndicConformer 600M backend
      if (recordingState === 'idle') startRecording();
      else if (recordingState === 'recording') stopRecording();
    }
  };

  // ---------------------------------------------------------------------------
  // Health badge
  // ---------------------------------------------------------------------------
  const healthBadge = () => {
    if (!asrHealth) return null;
    const isOnline = asrHealth.status === 'ok' && asrHealth.model_loaded;
    const isLoading = asrHealth.status === 'initializing';
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
        isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
        isLoading ? 'bg-amber-50 text-amber-700 border-amber-200' :
        'bg-red-50 text-red-700 border-red-200'
      }`}>
        {isOnline ? <Wifi className="w-3 h-3" /> : isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <WifiOff className="w-3 h-3" />}
        ASR {isOnline ? 'ONLINE' : isLoading ? 'LOADING' : 'OFFLINE'}
        {isOnline && <span className="font-mono text-emerald-500">· {asrHealth.device.toUpperCase()}</span>}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 space-y-5">
      {showRedFlagModal && <RedFlagModal onClose={() => setShowRedFlagModal(false)} />}

      <div className="max-w-6xl mx-auto space-y-5">

        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border-2 border-slate-200 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/30">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  <T text="Patient Voice ASR Intake" />
                </h1>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isAyurvedicMode
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-teal-100 text-teal-800 border-teal-200'
                }`}>
                  {isAyurvedicMode
                    ? <T text="Dashavidha Ayush Mode" />
                    : <T text="Allopathic SOCRATES Mode" />}
                </span>
                {healthBadge()}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                <T text="Speak naturally in your preferred Indic language — AI4Bharat IndicConformer 600M transcribes in real-time." />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowRedFlagModal(true)}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <T text="Trigger Red-Flag" />
            </button>
            <button
              onClick={() => navigate(isAyurvedicMode ? '/scan?mode=ayurvedic' : '/scan')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span><T text="Proceed to Scanner" /></span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── Main Columns ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ── LEFT: Recording Terminal ── */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-5 text-center">

              {/* Status label */}
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center justify-center gap-1.5">
                  <Radio className={`w-4 h-4 ${recordingState === 'recording' ? 'text-red-600 animate-pulse' : 'text-teal-600'}`} />
                  <T text="IndicConformer ASR Voice Terminal" />
                </span>
                <p className="text-[11px] text-slate-500">
                  <T text="Tap the mic to record. The AI transcribes your speech instantly in any Indian language." />
                </p>
              </div>

              {/* ── Mic Button ── */}
              <div className="relative flex items-center justify-center py-3">
                {/* Pulse rings when recording */}
                {recordingState === 'recording' && (
                  <>
                    <span className="absolute w-36 h-36 rounded-full bg-red-400/20 animate-ping" />
                    <span className="absolute w-32 h-32 rounded-full bg-red-400/15 animate-ping animation-delay-200" />
                  </>
                )}
                <button
                  onClick={handleToggleRecording}
                  disabled={recordingState === 'processing'}
                  className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl cursor-pointer disabled:cursor-not-allowed ${
                    recordingState === 'recording'
                      ? 'bg-red-600 hover:bg-red-700 text-white ring-8 ring-red-200 scale-105'
                      : recordingState === 'processing'
                      ? 'bg-slate-400 text-white ring-8 ring-slate-200'
                      : 'bg-teal-600 hover:bg-teal-700 text-white ring-8 ring-teal-100 hover:scale-105'
                  }`}
                >
                  {recordingState === 'recording' ? (
                    <>
                      <MicOff className="w-10 h-10 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider"><T text="Stop" /></span>
                    </>
                  ) : recordingState === 'processing' ? (
                    <>
                      <Loader2 className="w-10 h-10 mb-1 animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-wider"><T text="Processing…" /></span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-10 h-10 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider"><T text="Tap to Speak" /></span>
                    </>
                  )}
                </button>
              </div>

              {/* ── Waveform Canvas ── */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span><T text="Audio Frequency Spectrum" /></span>
                  <span className={`font-mono ${recordingState === 'recording' ? 'text-red-600' : 'text-slate-400'}`}>
                    {recordingState === 'recording' ? '● RECORDING LIVE' : recordingState === 'processing' ? '⏳ PROCESSING' : 'STANDBY'}
                  </span>
                </div>
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={48}
                  className="w-full h-12 bg-white rounded-xl border border-slate-200 shadow-inner"
                />
              </div>

              {/* ── Decoder Mode Toggle ── */}
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold"><T text="Decoder:" /></span>
                <button
                  onClick={() => setAsrMode('ctc')}
                  className={`px-3 py-1 rounded-lg font-bold border transition-all ${
                    asrMode === 'ctc'
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'
                  }`}
                >
                  <Zap className="w-3 h-3 inline mr-1" />CTC ~25ms
                </button>
                <button
                  onClick={() => setAsrMode('rnnt')}
                  className={`px-3 py-1 rounded-lg font-bold border transition-all ${
                    asrMode === 'rnnt'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  <Cpu className="w-3 h-3 inline mr-1" />RNNT ~65ms
                </button>
              </div>

              {/* Recorded Audio Player */}
              {recordedAudioUrl && (
                <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 space-y-1.5 text-left">
                  <div className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                    <T text="Last Recording Preview" />
                  </div>
                  <audio src={recordedAudioUrl} controls className="w-full h-8" />
                </div>
              )}

              {/* ── Live Stats ── */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-200">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Lang</div>
                  <div className="font-black text-slate-800 truncate capitalize">{state.language}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-200">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Avg Latency</div>
                  <div className="font-black text-teal-700 font-mono">{avgLatency > 0 ? `${avgLatency.toFixed(0)}ms` : '—'}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-200">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Audio Time</div>
                  <div className="font-black text-slate-800 font-mono">{totalDuration.toFixed(1)}s</div>
                </div>
              </div>

            </div>
          </div>

          {/* ── RIGHT: Conversation Stream ── */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl h-full flex flex-col">

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                  <T text="Real-Time ASR Transcript & SOCRATES Stream" />
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                    {messages.length - 1} exchanges
                  </span>
                  <button
                    onClick={() => setMessages([{
                      id: 'msg-init-reset',
                      sender: 'ai',
                      text: firstQuestion,
                      translation: firstQuestion,
                      confidence: 99,
                      timestamp: now(),
                    }])}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 cursor-pointer transition-all"
                    title="Reset conversation"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SOCRATES progress bar */}
              <div className="flex gap-1 mb-4">
                {SOCRATES_SEQUENCE.map((key, i) => (
                  <div
                    key={key}
                    title={`${key.replace('S2', 'S')} — ${SOCRATES_QUESTIONS[key].slice(0, 40)}…`}
                    className={`flex-1 h-1.5 rounded-full transition-all ${
                      i < socratesIndex ? 'bg-teal-500' :
                      i === socratesIndex ? 'bg-teal-300 animate-pulse' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <div className="text-[10px] font-bold text-slate-400 mb-3">
                SOCRATES {socratesIndex + 1}/8 — {SOCRATES_SEQUENCE[socratesIndex].replace('S2', 'S')}
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[480px]">
                {messages.map((msg) => {
                  // Determine bubble style based on state
                  const bubbleClass = msg.isError
                    ? 'bg-red-50 border-red-200 text-red-900 ml-8 mr-0'
                    : msg.isSilent
                    ? 'bg-amber-50 border-amber-200 text-amber-900 ml-8 mr-0'
                    : msg.sender === 'ai'
                    ? 'bg-teal-50/70 border-teal-200 text-teal-950 ml-0 mr-8'
                    : 'bg-slate-50 border-slate-200 text-slate-900 ml-8 mr-0';

                  return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2 ${bubbleClass} ${msg.isLoading ? 'opacity-60' : ''}`}
                  >
                    {/* Sender row */}
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                          msg.isError ? 'bg-red-700 text-white'
                          : msg.isSilent ? 'bg-amber-600 text-white'
                          : msg.sender === 'ai' ? 'bg-teal-700 text-white' : 'bg-slate-700 text-white'
                        }`}>
                          {msg.isError ? 'Error' : msg.isSilent ? 'Silent' : msg.sender === 'ai' ? <T text="MediKiosk AI" /> : <T text="Patient" />}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{msg.timestamp}</span>
                        {msg.latency_ms && msg.latency_ms > 0 && (
                          <span className="text-[9px] font-mono text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                            {msg.decoder?.toUpperCase()} {msg.latency_ms.toFixed(0)}ms
                          </span>
                        )}
                      </div>
                      {!msg.isLoading && !msg.isError && !msg.isSilent && (
                        <button
                          onClick={() => speakText(msg.text, state.language)}
                          className="p-1 rounded bg-white hover:bg-slate-100 text-teal-700 border border-slate-200 cursor-pointer shadow-sm"
                          title="Listen"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Text */}
                    {msg.isLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                        <span><T text="Transcribing via IndicConformer 600M…" /></span>
                      </div>
                    ) : (
                      <div className={`text-sm font-semibold leading-relaxed ${
                        msg.isError ? 'text-red-800' : msg.isSilent ? 'text-amber-800' : 'text-slate-900'
                      }`}>{msg.text}</div>
                    )}

                    {/* Translation */}
                    {!msg.isLoading && msg.translation && msg.translation !== msg.text && (
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-700 space-y-0.5">
                        <div className="text-[9px] font-bold text-slate-400 uppercase"><T text="English Translation" /></div>
                        <div>{msg.translation}</div>
                      </div>
                    )}

                    {/* Confidence */}
                    {msg.confidence !== undefined && !msg.isLoading && (
                      <div className="flex items-center gap-1 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-teal-500" />
                        <span className="text-slate-400">
                          {msg.confidence}% <T text="confidence" />
                        </span>
                      </div>
                    )}
                  </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
