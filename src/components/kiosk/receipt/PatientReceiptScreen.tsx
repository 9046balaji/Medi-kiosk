import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import { playNeuralTts } from '../../../lib/ttsApi';
import {
  Printer,
  QrCode,
  CheckCircle2,
  Clock,
  Building2,
  User,
  Phone,
  Home,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Volume2,
  Stethoscope,
  Heart,
  Award,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const PatientReceiptScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Spoken voice announcement on token generation
  const tokenAnnouncement = state.language === 'english'
    ? `Your token number ${state.opdToken || 'K-1042'} is ready. Please proceed to Room 104 for Dr. Arvind Sharma.`
    : `आपका टोकन नंबर ${state.opdToken || 'K-1042'} बन गया है। कृपया कमरा नंबर 104 में डॉक्टर अरविंद शर्मा जी के पास जाएं।`;

  useEffect(() => {
    // Auto-announce token in patient's language
    setIsPlayingAudio(true);
    playNeuralTts(tokenAnnouncement, state.language).finally(() => {
      setIsPlayingAudio(false);
    });
  }, [state.opdToken, state.language]);

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleNewPatient = () => {
    if (state.resetPatientSession) {
      state.resetPatientSession();
    }
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-slate-50 via-emerald-50/20 to-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col justify-between space-y-6">
      <div className="w-full space-y-5">
        
        {/* ── Top Success Banner (Hidden during Print) ── */}
        <div className="text-center space-y-2 print:hidden no-print">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border-4 border-emerald-300 shadow-xl animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
            <T text="Intake Complete & Token Slip Ready!" />
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-bold">
            <T text="Please proceed to your assigned OPD room displayed below." />
          </p>
        </div>

        {/* ── High-Contrast Printed OPD Token Slip (ONLY THIS PRINTS) ── */}
        <div className="opd-token-card-print bg-white rounded-3xl p-6 sm:p-8 border-4 border-emerald-500 shadow-2xl space-y-6 relative overflow-hidden">
          
          <div className="text-center pb-5 border-b-2 border-dashed border-slate-300 space-y-1.5">
            <div className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600 print:hidden" />
              <span><T text="Ministry of Ayush • OPD Token Slip" /></span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              All India Institute of Ayurveda (AIIA) / AIIMS OPD Gateway
            </div>
            
            {/* Giant Token Display */}
            <div className="py-2">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                <T text="Queue Token Number" />
              </div>
              <div className="text-5xl sm:text-6xl font-black tracking-wider text-slate-900 font-mono">
                {state.opdToken || 'K-1042'}
              </div>
            </div>

            <div className="text-xs text-slate-600 font-mono">
              Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • Time: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[11px] font-bold"><T text="Patient Name" /></span>
              <div className="font-black text-slate-900 text-base">{state.patientName || 'Rajesh Kumar'}</div>
              <div className="text-[10px] text-slate-500 font-mono">ABHA: {state.abhaId || '91-4589-2041-9872'}</div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-1">
              <span className="text-emerald-800 text-[11px] font-black uppercase"><T text="Assigned Room" /></span>
              <div className="font-black text-emerald-950 text-base sm:text-lg flex items-center gap-1">
                <Building2 className="w-4 h-4 text-emerald-700 shrink-0 print:hidden" />
                <span><T text="Room 104 (Ayush OPD)" /></span>
              </div>
              <div className="text-[10px] text-emerald-800 font-medium">1st Floor, Ayush Wing</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[11px] font-bold"><T text="Attending Doctor" /></span>
              <div className="font-black text-slate-900 text-sm sm:text-base">Dr. Arvind Sharma (MD)</div>
              <div className="text-[10px] text-slate-500">Reg #NDHM-8842</div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-amber-800 text-[11px] font-bold"><T text="Estimated Wait" /></span>
              <div className="font-black text-amber-900 text-sm sm:text-base flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 print:hidden" />
                <span>~4 Mins (Next in Queue)</span>
              </div>
              <div className="text-[10px] text-amber-800 font-mono">Status: Called Soon</div>
            </div>
          </div>

          {/* Voice Replay Bar (Hidden during Print) */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3 text-xs print:hidden no-print">
            <div className="flex items-center gap-2 font-bold text-emerald-950">
              <Volume2 className={`w-5 h-5 text-emerald-600 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              <span><T text="Listen to token details in voice" /></span>
            </div>
            <button
              onClick={() => playNeuralTts(tokenAnnouncement, state.language)}
              className="px-3 py-1.5 bg-emerald-600 text-white font-black rounded-xl text-xs hover:bg-emerald-700 cursor-pointer shadow-sm"
            >
              <T text="Listen" /> 🔊
            </button>
          </div>

          {/* Print Footer Note (Visible on print) */}
          <div className="text-center pt-3 border-t border-slate-200 text-[10px] text-slate-500 hidden print:block">
            Please show this token slip to the nursing staff outside Room 104. • DPDP Act 2023 Secured
          </div>

          {/* Actions (Hidden during Print) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 print:hidden no-print">
            <button
              onClick={handlePrintReceipt}
              className="w-full sm:flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:scale-102"
            >
              <Printer className="w-5 h-5" />
              <span><T text="Print Token Slip" /></span>
            </button>

            {state.abhaId && (
              <button
                onClick={() => {
                  state.saveCurrentConsultationToLocker();
                  navigate('/profile/patient');
                }}
                className="w-full sm:flex-1 py-4 bg-teal-800 hover:bg-teal-700 text-white font-black rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <MessageSquare className="w-5 h-5" />
                <span><T text="View AI Chat in Locker" /></span>
              </button>
            )}

            <button
              onClick={handleNewPatient}
              className="w-full sm:flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer hover:scale-102"
            >
              <span><T text="Finish & Next Patient" /></span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
