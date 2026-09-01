import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import { playNeuralTts } from '../../../lib/ttsApi';
import {
  CreditCard,
  QrCode,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Lock,
  Sparkles,
  KeyRound,
  RefreshCw,
  FileText,
  Volume2,
  AlertCircle,
  Camera,
  Check,
  User,
  Zap,
  PhoneCall
} from 'lucide-react';

export const AbhaAuthScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  const [authMethod, setAuthMethod] = useState<'abha_number' | 'mobile_otp' | 'qr_scan'>('abha_number');
  
  // ABHA Number State
  const [abhaInput, setAbhaInput] = useState<string>('91-4589-2041-9872');
  const [isVerifyingAbha, setIsVerifyingAbha] = useState<boolean>(false);
  
  // Mobile OTP State
  const [mobileInput, setMobileInput] = useState<string>('9876543210');
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('482910');
  const [otpTimer, setOtpTimer] = useState<number>(30);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  
  // QR Scan Inline State
  const [isQrScanning, setIsQrScanning] = useState<boolean>(false);
  const [qrCameraError, setQrCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Authenticated Profile State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authSuccessData, setAuthSuccessData] = useState<{
    name: string;
    abhaId: string;
    gender: string;
    age: number;
    bloodGroup: string;
    token: string;
  } | null>(null);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpTimer]);

  // Inline QR Camera lifecycle when qr_scan tab is active
  useEffect(() => {
    let active = true;

    if (authMethod === 'qr_scan' && !isAuthenticated) {
      const startCamera = async () => {
        setQrCameraError(null);
        try {
          let stream: MediaStream | null = null;
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: { ideal: 'environment' } },
              audio: false
            });
          } catch (e) {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          }

          if (!active) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        } catch (err) {
          setQrCameraError('Camera access not detected. Tap "Scan Demo ABHA QR Card" below for instant 1-tap testing.');
        }
      };

      startCamera();
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [authMethod, isAuthenticated]);

  // TTS Helper
  const handlePlayTts = (text: string) => {
    playNeuralTts(text, state.language);
  };

  // 1. Handle ABHA Number Formatting (Auto Hyphenation)
  const handleAbhaChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 14);
    let formatted = raw;
    if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)}-${raw.slice(2)}`;
    }
    if (raw.length > 6) {
      formatted = `${raw.slice(0, 2)}-${raw.slice(2, 6)}-${raw.slice(6)}`;
    }
    if (raw.length > 10) {
      formatted = `${raw.slice(0, 2)}-${raw.slice(2, 6)}-${raw.slice(6, 10)}-${raw.slice(10)}`;
    }
    setAbhaInput(formatted);
  };

  // Demo Profile Pickers
  const handleSelectDemoProfile = (name: string, abha: string, mobile: string, age: number, gender: string, bg: string) => {
    setAbhaInput(abha);
    setMobileInput(mobile);
    playNeuralTts(`Selected demo profile for ${name}`, state.language);
  };

  // Verify 14-Digit ABHA Number Directly
  const handleVerifyAbhaNumber = () => {
    setIsVerifyingAbha(true);
    setTimeout(() => {
      setIsVerifyingAbha(false);
      setIsAuthenticated(true);
      const profile = {
        name: abhaInput.includes('4589') ? 'Rajesh Kumar' : 'Priya Devi',
        abhaId: abhaInput || '91-4589-2041-9872',
        gender: abhaInput.includes('4589') ? 'Male' : 'Female',
        age: abhaInput.includes('4589') ? 45 : 38,
        bloodGroup: abhaInput.includes('4589') ? 'B+' : 'O+',
        token: 'MK-1042'
      };
      setAuthSuccessData(profile);
      state.setPatientName(profile.name);
      state.setOpdToken(profile.token);
      playNeuralTts(`ABHA Authentication successful for ${profile.name}. Health locker linked.`, state.language);
    }, 1000);
  };

  // Send Mobile OTP
  const handleSendMobileOtp = () => {
    if (!mobileInput || mobileInput.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    setShowOtpModal(true);
    setOtpTimer(30);
    playNeuralTts('OTP sent to your registered mobile number.', state.language);
  };

  // Verify 6-Digit OTP
  const handleVerifyOtp = () => {
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setShowOtpModal(false);
      setIsAuthenticated(true);
      const profile = {
        name: 'Rajesh Kumar',
        abhaId: '91-4589-2041-9872',
        gender: 'Male',
        age: 45,
        bloodGroup: 'B+',
        token: 'MK-1042'
      };
      setAuthSuccessData(profile);
      state.setPatientName(profile.name);
      state.setOpdToken(profile.token);
      playNeuralTts(`OTP verified successfully for ${profile.name}.`, state.language);
    }, 1100);
  };

  // Simulate/Scan QR Code
  const handleScanQrSuccess = () => {
    setIsAuthenticated(true);
    const profile = {
      name: 'Rajesh Kumar',
      abhaId: '91-4589-2041-9872',
      gender: 'Male',
      age: 45,
      bloodGroup: 'B+',
      token: 'MK-1042'
    };
    setAuthSuccessData(profile);
    state.setPatientName(profile.name);
    state.setOpdToken(profile.token);
    playNeuralTts('ABHA QR Code recognized. Health card verified.', state.language);
  };

  // Guest Walk-in / Skip Auth
  const handleSkipAuthGuest = () => {
    state.setPatientName('Walk-in Patient');
    state.setOpdToken('MK-GUEST');
    playNeuralTts('Starting anonymous guest intake session.', state.language);
    navigate('/intake');
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* ─── 6-DIGIT OTP VERIFICATION MODAL ─── */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 text-slate-900 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 border-2 border-teal-300 mx-auto flex items-center justify-center font-bold shadow-md">
              <KeyRound className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900"><T text="Enter UIDAI 6-Digit OTP" /></h3>
              <p className="text-sm text-slate-600 font-medium">
                <T text="Sent to registered mobile number ending in" /> <strong>******{mobileInput.slice(-4) || '3210'}</strong>
              </p>
            </div>

            <div className="py-2 space-y-2">
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                className="w-56 mx-auto text-center text-3xl font-mono font-black tracking-widest px-4 py-3 border-2 border-teal-500 rounded-2xl outline-none focus:ring-4 ring-teal-100 bg-slate-50"
              />

              <button
                type="button"
                onClick={() => setOtpInput('482910')}
                className="text-xs text-teal-800 bg-teal-50 hover:bg-teal-100 font-bold px-3 py-1 rounded-lg border border-teal-200 cursor-pointer inline-flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span><T text="Tap to Auto-fill Demo OTP: 482910" /></span>
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-500 font-mono font-bold">
              {otpTimer > 0 ? (
                <span><T text="Resend OTP in" /> <span className="text-teal-800">{otpTimer}s</span></span>
              ) : (
                <button
                  onClick={() => setOtpTimer(30)}
                  className="text-teal-700 underline font-bold cursor-pointer"
                >
                  <T text="Resend OTP Now" />
                </button>
              )}
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl text-sm cursor-pointer"
              >
                <T text="Cancel" />
              </button>

              <button
                onClick={handleVerifyOtp}
                disabled={otpInput.length < 6 || isVerifyingOtp}
                className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl text-sm shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                {isVerifyingOtp ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span><T text="Verify OTP" /></span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN AUTHENTICATION CONTAINER ─── */}
      <div className="w-full space-y-6">
        
        {/* Header Strip with Voice Guide */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-950 px-4 py-1 rounded-full border border-amber-300 text-xs font-mono font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <T text="ABDM Universal Health Stack Level-3 Node" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            <T text="ABHA Health ID Identity Authentication" />
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium">
            <T text="Authenticate with your 14-digit ABHA Number, Mobile OTP, or QR Code to link lifetime electronic health records." />
          </p>

          <button
            onClick={() => handlePlayTts('Please authenticate with your 14 digit ABHA number, Mobile OTP, or QR code to access your health locker.')}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer border border-slate-300 mt-1"
          >
            <Volume2 className="w-4 h-4 text-teal-600" />
            <span><T text="Listen Audio Instructions" /> 🔊</span>
          </button>
        </div>

        {/* 3 Login Method Switcher Tabs */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          
          {/* Method 1: ABHA Number */}
          <button
            onClick={() => {
              setAuthMethod('abha_number');
              setIsAuthenticated(false);
            }}
            className={`p-4 sm:p-5 rounded-3xl border-2 font-black text-xs sm:text-base transition-all cursor-pointer flex flex-col items-center gap-2.5 shadow-xs ${
              authMethod === 'abha_number'
                ? 'border-teal-600 bg-teal-50/80 text-teal-950 shadow-md ring-4 ring-teal-100'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`p-2.5 rounded-2xl ${authMethod === 'abha_number' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-teal-700'}`}>
              <CreditCard className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span><T text="14-Digit ABHA Number" /></span>
          </button>

          {/* Method 2: Mobile OTP */}
          <button
            onClick={() => {
              setAuthMethod('mobile_otp');
              setIsAuthenticated(false);
            }}
            className={`p-4 sm:p-5 rounded-3xl border-2 font-black text-xs sm:text-base transition-all cursor-pointer flex flex-col items-center gap-2.5 shadow-xs ${
              authMethod === 'mobile_otp'
                ? 'border-teal-600 bg-teal-50/80 text-teal-950 shadow-md ring-4 ring-teal-100'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`p-2.5 rounded-2xl ${authMethod === 'mobile_otp' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-teal-700'}`}>
              <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span><T text="Aadhaar / Mobile OTP" /></span>
          </button>

          {/* Method 3: Scan ABHA QR */}
          <button
            onClick={() => {
              setAuthMethod('qr_scan');
              setIsAuthenticated(false);
            }}
            className={`p-4 sm:p-5 rounded-3xl border-2 font-black text-xs sm:text-base transition-all cursor-pointer flex flex-col items-center gap-2.5 shadow-xs ${
              authMethod === 'qr_scan'
                ? 'border-teal-600 bg-teal-50/80 text-teal-950 shadow-md ring-4 ring-teal-100'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className={`p-2.5 rounded-2xl ${authMethod === 'qr_scan' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-teal-700'}`}>
              <QrCode className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span><T text="Scan ABHA QR Code" /></span>
          </button>

        </div>

        {/* ─── AUTHENTICATION CONTENT CARD ─── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          
          {isAuthenticated && authSuccessData ? (
            /* Verified ABHA Digital Card Display */
            <div className="p-6 sm:p-7 bg-gradient-to-br from-teal-800 via-slate-900 to-teal-950 rounded-3xl text-white shadow-2xl space-y-5 animate-in zoom-in-95 border-2 border-teal-500/40">
              <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-teal-500/30 flex items-center justify-center font-black text-teal-300 text-base">
                    MK
                  </div>
                  <div>
                    <span className="font-black text-base uppercase tracking-wider block text-teal-300">
                      <T text="ABHA Digital Identity Verified" />
                    </span>
                    <span className="text-xs text-slate-300">National Health Authority • Level-3 Token</span>
                  </div>
                </div>

                <span className="text-xs font-mono bg-emerald-500 text-white px-3 py-1 rounded-full font-extrabold shadow-sm">
                  UIDAI Token Sealed ✓
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-mono pt-1">
                <div>
                  <div className="text-teal-300 text-xs font-bold uppercase"><T text="Patient Name" /></div>
                  <div className="font-black text-lg text-white">{authSuccessData.name}</div>
                </div>

                <div>
                  <div className="text-teal-300 text-xs font-bold uppercase"><T text="ABHA Number" /></div>
                  <div className="font-black text-lg text-amber-300">{authSuccessData.abhaId}</div>
                </div>

                <div>
                  <div className="text-teal-300 text-xs font-bold uppercase"><T text="Age / Gender / Blood" /></div>
                  <div className="font-bold text-base text-white">{authSuccessData.age} Y • {authSuccessData.gender} • {authSuccessData.bloodGroup}</div>
                </div>

                <div>
                  <div className="text-teal-300 text-xs font-bold uppercase"><T text="OPD Token" /></div>
                  <div className="font-black text-amber-300 text-lg">{authSuccessData.token}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/20">
                <button
                  onClick={() => navigate('/profile/patient')}
                  className="py-3.5 bg-teal-900/80 hover:bg-teal-800 text-white font-extrabold text-sm rounded-2xl transition-all border border-teal-400/40 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-5 h-5 text-teal-300" />
                  <span><T text="Open Health Locker & Records" /></span>
                </button>

                <button
                  onClick={() => navigate('/intake')}
                  className="py-3.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span><T text="Proceed to AI Voice Intake" /></span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Active Form Based on Method */
            <div className="space-y-6">

              {/* ─── METHOD 1: 14-DIGIT ABHA NUMBER ─── */}
              {authMethod === 'abha_number' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-extrabold uppercase tracking-wider text-slate-800 block">
                      <T text="Enter 14-Digit ABHA Health ID Number" />
                    </label>
                    <input
                      type="text"
                      value={abhaInput}
                      onChange={(e) => handleAbhaChange(e.target.value)}
                      placeholder="91-XXXX-XXXX-XXXX"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xl sm:text-2xl font-mono font-black text-slate-900 outline-none focus:border-teal-600 focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  {/* 1-Tap Sample ABHA Selectors */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      <T text="Or Select Demo ABHA Profile (1-Tap Fast Fill)" />:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleSelectDemoProfile('Rajesh Kumar', '91-4589-2041-9872', '9876543210', 45, 'Male', 'B+')}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-teal-50 hover:border-teal-300 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        <User className="w-3.5 h-3.5 text-teal-700" />
                        <span>Rajesh Kumar (91-4589-2041-9872)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDemoProfile('Priya Devi', '91-8844-3322-1199', '9811223344', 38, 'Female', 'O+')}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-teal-50 hover:border-teal-300 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        <User className="w-3.5 h-3.5 text-purple-700" />
                        <span>Priya Devi (91-8844-3322-1199)</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-teal-50 rounded-2xl border-2 border-teal-200 flex items-start gap-3 text-sm text-teal-950 font-medium">
                    <ShieldCheck className="w-6 h-6 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <strong><T text="ABDM Zero-Knowledge Architecture:" /></strong>{' '}
                      <T text="Your 14-digit ABHA ID links previous hospital encounters and active prescriptions directly from National Health Authority servers." />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleVerifyAbhaNumber}
                      disabled={isVerifyingAbha || abhaInput.length < 14}
                      className="py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm sm:text-base rounded-2xl transition-all shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingAbha ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span><T text="Direct Instant NHA Verify" /></span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleSendMobileOtp}
                      className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm sm:text-base rounded-2xl transition-all border-2 border-slate-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <KeyRound className="w-5 h-5 text-teal-700" />
                      <span><T text="Authenticate via Mobile OTP" /></span>
                    </button>
                  </div>
                </div>
              )}

              {/* ─── METHOD 2: MOBILE NUMBER OTP ─── */}
              {authMethod === 'mobile_otp' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-extrabold uppercase tracking-wider text-slate-800 block">
                      <T text="Enter 10-Digit Aadhaar Linked Mobile Number" />
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-4 bg-slate-100 border-2 border-slate-300 rounded-2xl font-mono font-black text-lg text-slate-700">
                        +91
                      </span>
                      <input
                        type="text"
                        maxLength={10}
                        value={mobileInput}
                        onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="flex-1 px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xl sm:text-2xl font-mono font-black text-slate-900 outline-none focus:border-teal-600 focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* 1-Tap Sample Mobile Selectors */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <T text="Quick Fill" />:
                    </span>
                    <button
                      type="button"
                      onClick={() => setMobileInput('9876543210')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 cursor-pointer"
                    >
                      9876543210 (Rajesh)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileInput('9811223344')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 cursor-pointer"
                    >
                      9811223344 (Priya)
                    </button>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-200 flex items-start gap-3 text-sm text-indigo-950 font-medium">
                    <ShieldCheck className="w-6 h-6 text-indigo-700 shrink-0 mt-0.5" />
                    <div>
                      <strong><T text="UIDAI OTP Gateway:" /></strong>{' '}
                      <T text="A high-security 6-digit one-time password will be sent via SMS to verify your ABDM identity." />
                    </div>
                  </div>

                  <button
                    onClick={handleSendMobileOtp}
                    disabled={mobileInput.length < 10}
                    className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-base rounded-2xl transition-all shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound className="w-5 h-5" />
                    <span><T text="Request UIDAI 6-Digit OTP" /></span>
                  </button>
                </div>
              )}

              {/* ─── METHOD 3: INLINE LIVE QR CODE SCANNER ─── */}
              {authMethod === 'qr_scan' && (
                <div className="space-y-5 text-center">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900">
                      <T text="Point Your ABHA Card QR to the Camera" />
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      <T text="Hold your physical ABHA card or ABHA mobile app QR code in front of the camera lens." />
                    </p>
                  </div>

                  {qrCameraError && (
                    <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center gap-3 text-xs sm:text-sm text-amber-900 font-bold text-left">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>{qrCameraError}</span>
                    </div>
                  )}

                  {/* Camera Viewport */}
                  <div className="relative max-w-sm mx-auto aspect-square bg-slate-900 rounded-3xl border-4 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center p-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover rounded-2xl"
                    />

                    {/* Laser Target Box Overlay */}
                    <div className="absolute inset-8 border-4 border-dashed border-teal-400 rounded-2xl pointer-events-none flex items-center justify-center">
                      <div className="w-full h-1 bg-teal-400 shadow-[0_0_20px_#2dd4bf] animate-bounce" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleScanQrSuccess}
                      className="py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm sm:text-base rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5 text-yellow-300" />
                      <span><T text="Scan Demo ABHA QR Card" /> (1-Tap)</span>
                    </button>

                    <button
                      onClick={() => navigate('/auth/scan')}
                      className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm sm:text-base rounded-2xl transition-all border-2 border-slate-300 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-5 h-5 text-teal-700" />
                      <span><T text="Open Fullscreen Scanner" /></span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* ─── BOTTOM QUICK SHORTCUTS STRIP ─── */}
        <div className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm"><T text="Emergency Walk-in / No ABHA Card?" /></h4>
              <p className="text-xs text-slate-500 font-medium">
                <T text="You can proceed directly without logging in under DPDP zero-retention ephemeral policy." />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => navigate('/auth/returning')}
              className="flex-1 sm:flex-none px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm rounded-xl border border-slate-300 cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-teal-700" />
              <span><T text="Returning Patient" /></span>
            </button>

            <button
              onClick={handleSkipAuthGuest}
              className="flex-1 sm:flex-none px-5 py-3 bg-teal-800 hover:bg-teal-900 text-white font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <span><T text="Start Walk-in Intake" /></span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
