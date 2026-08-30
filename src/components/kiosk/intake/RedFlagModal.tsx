import React from 'react';
import { AlertOctagon, Heart, PhoneCall, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { T } from '../../../context/TranslationContext';

interface RedFlagModalProps {
  onClose: () => void;
  onEscalateToNurse: () => void;
}

export const RedFlagModal: React.FC<RedFlagModalProps> = ({
  onClose,
  onEscalateToNurse
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-4 border-red-500 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Banner */}
        <div className="p-4 bg-red-600 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-red-600/30">
          <AlertOctagon className="w-8 h-8 shrink-0 animate-bounce text-yellow-300" />
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-red-200">
              <T text="P1 Emergency Red Flag Triggered" />
            </div>
            <h2 className="text-lg font-black text-white">
              <T text="High-Risk Symptoms Detected" />
            </h2>
          </div>
        </div>

        {/* Details Card */}
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-slate-700 leading-relaxed font-semibold">
            <T text="Our Voice AI Intake System has flagged acute retrosternal chest compression / cardiac risk indicators requiring immediate clinical triage." />
          </p>

          <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-2">
            <div className="font-bold text-red-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-600" />
              <T text="Emergency Clinical Vitals Snapshot:" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold text-slate-800">
              <div className="bg-white p-2 rounded-lg border border-red-200">
                <div className="text-[10px] text-slate-500 font-sans"><T text="Heart Rate" /></div>
                <div className="text-red-700 text-base">76 bpm</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-red-200">
                <div className="text-[10px] text-slate-500 font-sans"><T text="Blood Pressure" /></div>
                <div className="text-red-700 text-base">128/82</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-red-200">
                <div className="text-[10px] text-slate-500 font-sans"><T text="SpO2 Level" /></div>
                <div className="text-emerald-700 text-base">98%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onEscalateToNurse}
            className="w-full sm:flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl text-xs sm:text-sm transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-5 h-5" />
            <span><T text="Escalate to Nurse Station A (Priority 1)" /></span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
          >
            <T text="Override & Continue Kiosk Intake" />
          </button>
        </div>

      </div>
    </div>
  );
};
