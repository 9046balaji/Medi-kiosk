import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { useTranslation, T } from '../../../context/TranslationContext';
import {
  CreditCard,
  Smartphone,
  ScanFace,
  QrCode,
  UserX,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Sparkles,
  Delete,
  RefreshCw,
  Loader2
} from 'lucide-react';

type AuthMethod = 'abha_number' | 'mobile_otp' | 'face_auth';

export const AbhaAuthScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setAbhaVerified, setAnonymousToken } = useMediKiosk();
  
  const [method, setMethod] = useState<AuthMethod>('abha_number');
  const [abhaInput, setAbhaInput] = useState<string>('91-4589-2041-9872');
  const [otpInput, setOtpInput] = useState<string>('789042');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [faceScanned, setFaceScanned] = useState<boolean>(false);

  const handleKeypadPress = (key: string) => {
    if (method === 'abha_number') {
      const raw = abhaInput.replace(/\D/g, '');
      if (raw.length < 14) {
        const updated = raw + key;
        formatAbha(updated);
      }
    } else if (method === 'mobile_otp') {
      if (otpInput.length < 6) {
        setOtpInput((prev) => prev + key);
      }
    }
  };

  const handleKeypadDelete = () => {
    if (method === 'abha_number') {
      const raw = abhaInput.replace(/\D/g, '');
      if (raw.length > 0) {
        const updated = raw.slice(0, -1);
        formatAbha(updated);
      }
    } else if (method === 'mobile_otp') {
      setOtpInput((prev) => prev.slice(0, -1));
    }
  };

  const formatAbha = (digits: string) => {
    const p1 = digits.slice(0, 2);
    const p2 = digits.slice(2, 6);
    const p3 = digits.slice(6, 10);
    const p4 = digits.slice(10, 14);
    let res = p1;
    if (p2) res += '-' + p2;
    if (p3) res += '-' + p3;
    if (p4) res += '-' + p4;
    setAbhaInput(res);
  };

  const handleVerifyAndProceed = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setAbhaVerified(true, true);
      navigate('/auth/returning');
    }, 1000);
  };

  const handleFaceAuthSuccess = () => {
    setFaceScanned(true);
    setTimeout(() => {
      setAbhaVerified(true, true);
      navigate('/auth/returning');
    }, 1200);
  };

  const handleAnonymousFlow = () => {
    setAnonymousToken();
    navigate('/intake');
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <T text="Back" />
          </button>
          
          <div className="text-right">
            <span className="text-xs font-semibold px-3 py-1 bg-teal-100 text-teal-800 rounded-full border border-teal-200">
              ABDM Registry Level 3
            </span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            <T text="Ayushman Bharat Digital Health ID (ABHA)" />
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            <T text="Verify your ABHA Health ID for automatic medical history retrieval & paperless OPD." />
          </p>
        </div>

        {/* Method Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setMethod('abha_number')}
            className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              method === 'abha_number'
                ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-md font-bold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
            }`}
          >
            <CreditCard className="w-5 h-5 text-teal-600" />
            <span className="text-xs sm:text-sm"><T text="ABHA Number (14-Digit)" /></span>
          </button>

          <button
            onClick={() => setMethod('mobile_otp')}
            className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              method === 'mobile_otp'
                ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-md font-bold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Smartphone className="w-5 h-5 text-teal-600" />
            <span className="text-xs sm:text-sm"><T text="Mobile OTP" /></span>
          </button>

          <button
            onClick={() => setMethod('face_auth')}
            className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
              method === 'face_auth'
                ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-md font-bold'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
            }`}
          >
            <ScanFace className="w-5 h-5 text-teal-600" />
            <span className="text-xs sm:text-sm"><T text="Face Authentication" /></span>
          </button>

          <button
            onClick={() => navigate('/auth/scan')}
            className="p-3.5 rounded-2xl border-2 border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/50 flex flex-col items-center gap-1.5 transition-all cursor-pointer text-slate-700"
          >
            <QrCode className="w-5 h-5 text-amber-600" />
            <span className="text-xs sm:text-sm font-semibold"><T text="QR Code Scanner" /></span>
          </button>
        </div>

        {/* Input & Keypad Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl">
          
          {/* Left Form Column */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            {method === 'abha_number' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-800">
                    <T text="Enter 14-Digit ABHA Number" />:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={abhaInput}
                      placeholder="XX-XXXX-XXXX-XXXX"
                      className="w-full text-2xl sm:text-3xl font-mono font-bold tracking-widest text-center py-4 bg-slate-50 border-2 border-teal-600/50 rounded-2xl text-slate-900 focus:outline-none ring-4 ring-teal-500/10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-1 rounded">
                      NDHM
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-teal-900">
                    <strong><T text="NDHM Safe Authentication:" /></strong> <T text="Your health records will be linked securely. Aadhaar consent is authenticated via UIDAI tokenization." />
                  </div>
                </div>

                <button
                  onClick={() => setAbhaInput('91-4589-2041-9872')}
                  className="text-xs text-teal-700 hover:text-teal-900 font-semibold underline cursor-pointer"
                >
                  ⚡ <T text="Demo: Auto-fill Rajesh Kumar (91-4589-2041-9872)" />
                </button>
              </div>
            )}

            {method === 'mobile_otp' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-800">
                    <T text="Enter 6-digit OTP sent to registered mobile number:" />
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-3 py-2">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className={`w-11 h-14 sm:w-14 sm:h-16 rounded-xl border-2 flex items-center justify-center font-mono text-2xl sm:text-3xl font-black ${
                          otpInput[idx]
                            ? 'border-teal-600 bg-teal-50 text-slate-900 shadow'
                            : 'border-slate-200 bg-slate-50 text-slate-400'
                        }`}
                      >
                        {otpInput[idx] || '•'}
                      </div>
                    ))}
                  </div>
                  <div className="text-center text-xs text-slate-500">
                    OTP sent to +91 98765-XXXXX (Valid for 04:59 min)
                  </div>
                </div>

                <button
                  onClick={() => setOtpInput('789042')}
                  className="text-xs text-teal-700 hover:text-teal-900 font-semibold underline cursor-pointer"
                >
                  ⚡ Demo: Auto-fill Valid OTP (789042)
                </button>
              </div>
            )}

            {method === 'face_auth' && (
              <div className="space-y-4 text-center py-4">
                <div className="relative w-48 h-48 mx-auto rounded-full border-4 border-dashed border-teal-500 flex items-center justify-center bg-slate-900 overflow-hidden shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
                    alt="Face scanner"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-teal-500/10 pointer-events-none" />
                  <div className="absolute inset-x-0 h-1 bg-teal-400 animate-scan-laser shadow-[0_0_8px_#14B8A6]" />
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-800">
                    <T text="Look Directly into Camera" />
                  </div>
                  <div className="text-xs text-slate-500">
                    Aadhaar FaceRD Engine v3.1 • Liveness Detection Active
                  </div>
                </div>

                <button
                  onClick={handleFaceAuthSuccess}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  {faceScanned ? <T text="✓ Face Verified" /> : <T text="Simulate Face Match (Rajesh Kumar)" />}
                </button>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleAnonymousFlow}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserX className="w-4 h-4 text-slate-500" />
                <T text="Don't have ABHA? Anonymous Walk-In" />
              </button>

              {method !== 'face_auth' && (
                <button
                  onClick={handleVerifyAndProceed}
                  disabled={isVerifying}
                  className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <T text="Verifying..." />
                    </>
                  ) : (
                    <>
                      <span><T text="Verify & Continue" /></span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Touch Keypad Column */}
          <div className="lg:col-span-5 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
              <T text="Touch Keypad" />
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 my-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeypadPress(num)}
                  className="h-14 sm:h-16 rounded-xl bg-white hover:bg-teal-50 active:bg-teal-100 border border-slate-200 text-slate-900 font-bold text-xl sm:text-2xl shadow-sm transition-all flex items-center justify-center cursor-pointer active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => {
                  setAbhaInput('');
                  setOtpInput('');
                }}
                className="h-14 sm:h-16 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs uppercase shadow-sm transition-all flex items-center justify-center cursor-pointer active:scale-95"
              >
                <T text="Clear" />
              </button>
              <button
                onClick={() => handleKeypadPress('0')}
                className="h-14 sm:h-16 rounded-xl bg-white hover:bg-teal-50 active:bg-teal-100 border border-slate-200 text-slate-900 font-bold text-xl sm:text-2xl shadow-sm transition-all flex items-center justify-center cursor-pointer active:scale-95"
              >
                0
              </button>
              <button
                onClick={handleKeypadDelete}
                className="h-14 sm:h-16 rounded-xl bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800 font-bold text-sm shadow-sm transition-all flex items-center justify-center cursor-pointer active:scale-95"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            <div className="text-[11px] text-slate-400 text-center mt-3">
              Standard Touch Numeric Input for Hospital Kiosks
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
