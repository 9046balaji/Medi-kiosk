import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
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
  X
} from 'lucide-react';

export const AbhaAuthScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  const [authMethod, setAuthMethod] = useState<'abha_number' | 'mobile_otp' | 'qr_scan'>('abha_number');
  const [abhaInput, setAbhaInput] = useState<string>('91-4589-2041-9872');
  const [mobileInput, setMobileInput] = useState<string>('9876543210');
  
  // OTP Verification Modal state
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('482910');
  const [otpTimer, setOtpTimer] = useState<number>(30);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpTimer]);

  const handleSendOtp = () => {
    setShowOtpModal(true);
    setOtpTimer(30);
  };

  const handleVerifyOtp = () => {
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setShowOtpModal(false);
      setIsAuthenticated(true);
      state.setPatientName('Rajesh Kumar');
      state.setOpdToken('MK-1042');
    }, 1200);
  };

  const handleProceedToIntake = () => {
    navigate('/intake');
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 text-slate-900 text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 border border-teal-300 mx-auto flex items-center justify-center font-bold">
              <KeyRound className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900"><T text="Enter UIDAI 6-Digit OTP" /></h3>
              <p className="text-xs text-slate-500">
                <T text="Sent to registered mobile number ending in" /> <strong>******3210</strong>
              </p>
            </div>

            <div className="py-2">
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-48 mx-auto text-center text-2xl font-mono font-black tracking-widest px-4 py-3 border-2 border-teal-500 rounded-2xl outline-none focus:ring-4 ring-teal-100 bg-slate-50"
              />
            </div>

            <div className="text-xs text-slate-500 font-mono">
              <T text="Resend OTP in" /> <span className="font-bold text-teal-800">{otpTimer}s</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                <T text="Cancel" />
              </button>

              <button
                onClick={handleVerifyOtp}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isVerifyingOtp ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span><T text="Verify OTP" /></span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full inline-flex items-center gap-1">
            <T text="ABDM Universal Health Stack Level-3 Node" />
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
            <T text="ABHA Health ID Identity Authentication" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            <T text="Authenticate with your 14-digit ABHA Number or Mobile OTP to link lifetime electronic health records." />
          </p>
        </div>

        {/* Authentication Methods Selector */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setAuthMethod('abha_number')}
            className={`p-4 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer flex flex-col items-center gap-2 ${
              authMethod === 'abha_number'
                ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-md'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-6 h-6 text-teal-600" />
            <span><T text="ABHA Number" /></span>
          </button>

          <button
            onClick={() => setAuthMethod('mobile_otp')}
            className={`p-4 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer flex flex-col items-center gap-2 ${
              authMethod === 'mobile_otp'
                ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-md'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-6 h-6 text-teal-600" />
            <span><T text="Mobile OTP" /></span>
          </button>

          <button
            onClick={() => navigate('/scan/qr')}
            className="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs sm:text-sm text-slate-600 transition-all cursor-pointer flex flex-col items-center gap-2"
          >
            <QrCode className="w-6 h-6 text-teal-600" />
            <span><T text="Scan ABHA QR" /></span>
          </button>
        </div>

        {/* Auth Input Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          
          {isAuthenticated ? (
            /* Verified ABHA Health Card Display */
            <div className="p-6 bg-gradient-to-br from-teal-700 to-teal-900 rounded-3xl text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-teal-300" />
                  <span className="font-extrabold text-sm uppercase tracking-wider"><T text="ABHA Health Card Verified" /></span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500 text-white px-2.5 py-0.5 rounded-full font-bold">
                  UIDAI Token Sealed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <div className="text-teal-200 text-[10px] uppercase"><T text="Patient Name" /></div>
                  <div className="font-bold text-lg text-white">Rajesh Kumar</div>
                </div>

                <div>
                  <div className="text-teal-200 text-[10px] uppercase"><T text="ABHA Number" /></div>
                  <div className="font-bold text-lg text-teal-200">91-4589-2041-9872</div>
                </div>

                <div>
                  <div className="text-teal-200 text-[10px] uppercase"><T text="Age / Gender" /></div>
                  <div className="font-bold text-white">45 Years • Male</div>
                </div>

                <div>
                  <div className="text-teal-200 text-[10px] uppercase"><T text="OPD Queue Token" /></div>
                  <div className="font-bold text-amber-300 text-lg">MK-1042</div>
                </div>
              </div>

              <button
                onClick={handleProceedToIntake}
                className="w-full py-3.5 bg-white hover:bg-slate-100 text-teal-900 font-extrabold text-xs rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span><T text="Proceed to Voice Symptom Intake" /></span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Input Form */
            <div className="space-y-4">
              
              {authMethod === 'abha_number' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    <T text="Enter 14-Digit ABHA Number" />
                  </label>
                  <input
                    type="text"
                    value={abhaInput}
                    onChange={(e) => setAbhaInput(e.target.value)}
                    placeholder="91-XXXX-XXXX-XXXX"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-mono font-bold text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
              )}

              {authMethod === 'mobile_otp' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    <T text="Enter Registered Mobile Number" />
                  </label>
                  <input
                    type="text"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-mono font-bold text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
              )}

              <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 flex items-start gap-3 text-xs text-teal-950 font-medium">
                <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong><T text="NDHM Safe Tokenization:" /></strong> <T text="Aadhaar consent is tokenized directly via National Health Authority servers. Zero persistent storage." />
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span><T text="Request UIDAI OTP Authentication" /></span>
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
