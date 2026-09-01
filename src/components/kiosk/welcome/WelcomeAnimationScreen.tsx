import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThreeMedicalHologram } from './ThreeMedicalHologram';
import {
  Activity,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  Radio,
  Building2,
  Stethoscope,
  Clock,
  Heart,
  Globe,
  Award,
  PhoneCall,
  Lock,
  Flame,
  Fingerprint,
  Users
} from 'lucide-react';

const hospitalLobbyPath = '/assets/hospital_lobby.jpg';
const ayushClinicalPath = '/assets/ayush_clinical.jpg';

interface WelcomeAnimationScreenProps {
  onComplete?: () => void;
  autoDurationMs?: number;
}

export const WelcomeAnimationScreen: React.FC<WelcomeAnimationScreenProps> = ({
  onComplete,
  autoDurationMs = 3800
}) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Initializing MediKiosk AI Terminal...');
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [heartRate, setHeartRate] = useState<number>(72);

  // Live time ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
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

  // Subtle Heartbeat flutter simulation
  useEffect(() => {
    const bpmInterval = setInterval(() => {
      setHeartRate(70 + Math.floor(Math.random() * 5));
    }, 2000);
    return () => clearInterval(bpmInterval);
  }, []);

  // Play high-tech synthesized harmonic chime with Web Audio API
  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
          gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + idx * 0.09 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.09 + 0.7);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.09);
          osc.stop(ctx.currentTime + idx * 0.09 + 0.75);
        });
      }
    } catch (e) { }
  }, []);

  // Smooth diagnostic loading progress bar
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / autoDurationMs) * 100), 100);
      setProgress(pct);

      if (pct < 25) {
        setStatusText('Connecting to ABDM National Health Gateway...');
      } else if (pct < 50) {
        setStatusText('Loading 22 Indian Language Voice ASR & TTS Core...');
      } else if (pct < 75) {
        setStatusText('Calibrating Ayush Dashavidha & Allopathic Triangulation Engine...');
      } else if (pct < 95) {
        setStatusText('Syncing Hospital Queue & OPD Counter Telemetry...');
      } else {
        setStatusText('MediKiosk AI Ready • Entering Main Page...');
      }

      if (pct >= 100) {
        clearInterval(interval);
        handleFinish();
      }
    }, 35);

    return () => clearInterval(interval);
  }, [autoDurationMs]);

  const handleFinish = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate('/');
      }
    }, 450);
  };

  return (
    <div
      onClick={handleFinish}
      className={`fixed inset-0 z-50 bg-[#0b132b] text-white flex flex-col justify-between select-none cursor-pointer transition-opacity duration-400 overflow-hidden ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
    >
      {/* ── Background Shaders & Clean Medical Blue Glows ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#1e40af_0%,#0f172a_50%,#0b132b_100%)] pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f60d_1px,transparent_1px),linear-gradient(to_bottom,#3b82f60d_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

      {/* ── TOP HEADER: Professional Medical Navy & Badges ── */}
      <div className="relative z-20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-auto border-b border-blue-500/25 bg-slate-900/85 backdrop-blur-xl shadow-xl">

        {/* Left: MediKiosk Branding & Hospital Emblem */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-blue-400/40 shrink-0">
            MK
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-2xl sm:text-3xl text-white tracking-tight drop-shadow-sm">
                MediKiosk AI
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                Ministry of Ayush
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/40">
                ABDM Level-3
              </span>
            </div>
            <p className="text-xs text-blue-200 font-semibold tracking-wide">
              National Health Authority • Central Integrated Hospital & Smart OPD Terminal #01
            </p>
          </div>
        </div>

        {/* Right: Hospital Live Clock, Emergency Hotline & Skip Button */}
        <div className="flex items-center gap-3 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-mono font-bold text-slate-200 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            <span>IST {currentTime || '19:30:00'}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-bold shadow-sm">
            <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            <span>ER: 108 / 104</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFinish();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <span>Skip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ── CENTER STAGE: Split Layout with Hospital Imagery (Left) & Dedicated 3D Hologram (Right) ── */}
      <div className="relative z-10 w-full px-4 sm:px-8 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

          {/* Left Column: Hospital Information & Real Visual Image Cards */}
          <div className="lg:col-span-6 space-y-4 text-left">

            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-blue-400/40 text-blue-200 text-xs font-mono font-bold backdrop-blur-xl shadow-md">
              <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>AUTONOMOUS CLINICAL REGISTRATION TERMINAL</span>
            </div>

            {/* Main Title */}
            <div className="space-y-1.5">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
                Welcome to MediKiosk
              </h1>
              <p className="text-sm sm:text-base text-blue-200 font-semibold max-w-lg">
                Ayushman Bharat Integrated Smart OPD & Ayush Clinical Check-In System
              </p>
            </div>

            {/* Hospital Visual Image Showcase Grid (2 Real Image Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">

              {/* Image Card 1: Modern Smart Hospital Lobby */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500/30 bg-slate-900/90 shadow-xl group">
                <img
                  src={hospitalLobbyPath}
                  alt="Modern Hospital Kiosks Lobby"
                  className="w-full h-32 sm:h-36 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-3 flex flex-col justify-end">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-200">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Central OPD Lobby</span>
                  </div>
                  <div className="text-[11px] text-blue-300 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                    <span>14 OPD Rooms Open • Avg Wait ~6m</span>
                  </div>
                </div>
              </div>

              {/* Image Card 2: Ayush & Modern Doctor Care */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500/30 bg-slate-900/90 shadow-xl group">
                <img
                  src={ayushClinicalPath}
                  alt="Ayush Clinical Care Station"
                  className="w-full h-32 sm:h-36 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-3 flex flex-col justify-end">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ayush Dual-Care Station</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <span>SOCRATES + Dashavidha AI</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Feature Capability Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-xl text-xs font-bold text-blue-200 backdrop-blur-md flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>22 Languages Voice AI</span>
              </span>
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-xl text-xs font-bold text-blue-200 backdrop-blur-md flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>ABHA Card Sync</span>
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-xs font-bold text-indigo-200 backdrop-blur-md flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-300" />
                <span>DPDP 2023 Privacy</span>
              </span>
            </div>

          </div>

          {/* Right Column: Dedicated Unobstructed 3D Three.js Hologram Canvas */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            <div className="w-full h-80 sm:h-96 relative rounded-3xl overflow-hidden border-2 border-blue-500/30 bg-slate-950/80 shadow-2xl backdrop-blur-md flex items-center justify-center">

              {/* Unobstructed 3D Three.js Hologram */}
              <ThreeMedicalHologram variant="fullscreen" interactive={true} pulseIntensity={1.2} />

              {/* Corner Live Status Badges on 3D Card */}
              <div className="absolute top-3 left-3 pointer-events-none">
                <div className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-blue-500/30 text-[11px] font-mono font-bold text-blue-300 backdrop-blur-md flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  <span>3D BIOMETRIC CORE</span>
                </div>
              </div>

              <div className="absolute top-3 right-3 pointer-events-none">
                <div className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-blue-500/30 text-[11px] font-mono font-bold text-blue-300 backdrop-blur-md flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>{heartRate} BPM (Normal)</span>
                </div>
              </div>

              <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-blue-500/30 text-[11px] font-mono text-slate-300 backdrop-blur-md">
                  ⚡ Interactive 3D • Drag to rotate in 360°
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ── BOTTOM CONTROLS: Progress Bar, Status & Enter Prompt ── */}
      <div className="relative z-20 p-4 sm:pb-6 max-w-xl mx-auto w-full px-6 space-y-2.5 text-center pointer-events-auto">

        {/* Status Line */}
        <div className="flex items-center justify-between text-xs font-mono text-blue-200 font-bold px-1">
          <span className="truncate max-w-[340px] text-left">{statusText}</span>
          <span className="font-bold text-white ml-2 text-sm">{progress}%</span>
        </div>

        {/* Progress Bar Track with Medical Blue Gradient */}
        <div className="w-full h-3 bg-slate-950/90 rounded-full border border-blue-500/40 overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 rounded-full transition-all duration-75 shadow-md shadow-blue-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Enter Prompt */}
        <div className="pt-1 flex items-center justify-center gap-2 text-xs font-bold text-slate-300">
          <Fingerprint className="w-4 h-4 text-blue-400 animate-bounce" />
          <span>Tap anywhere to enter main kiosk page • स्पर्श करें और आगे बढ़ें</span>
        </div>

      </div>

    </div>
  );
};
