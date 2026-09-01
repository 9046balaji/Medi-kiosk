import React from 'react';
import { AlertOctagon, Heart, PhoneCall, ShieldAlert, ArrowRight, X, Brain, Zap } from 'lucide-react';
import { T } from '../../../context/TranslationContext';
import type { EmergencyContext } from '../../../types';

interface RedFlagModalProps {
  onClose: () => void;
  onEscalateToNurse: () => void;
  emergencyContext?: EmergencyContext | null;
}

export const RedFlagModal: React.FC<RedFlagModalProps> = ({
  onClose,
  onEscalateToNurse,
  emergencyContext,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-4 border-red-500 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200">

        {/* ── Banner ── */}
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

        {/* ── MedGemma Clinical Context (if available) ── */}
        {emergencyContext ? (
          <div className="space-y-3">
            {/* Suspected Condition */}
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-900 text-sm">
                <Brain className="w-4 h-4 text-red-600" />
                <span>
                  <T text="MedGemma 1.5 Clinical Assessment:" />
                </span>
              </div>
              <div className="text-base font-black text-red-800">
                {emergencyContext.suspected_condition}
              </div>
              <p className="text-xs text-red-700 leading-relaxed">
                {emergencyContext.clinical_summary}
              </p>
            </div>

            {/* Detected Keywords */}
            {emergencyContext.detected_keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {emergencyContext.detected_keywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-red-100 text-red-800 text-[10px] font-bold rounded-full border border-red-200"
                  >
                    🚨 {kw}
                  </span>
                ))}
              </div>
            )}

            {/* Immediate Actions */}
            {emergencyContext.immediate_actions?.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <div className="font-bold text-amber-900 text-xs flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <T text="Immediate Actions Required:" />
                </div>
                <ol className="list-decimal list-inside space-y-1">
                  {emergencyContext.immediate_actions.map((action, i) => (
                    <li key={i} className="text-xs text-amber-900 font-semibold">
                      {action}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Risk Level */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${
                emergencyContext.risk_level === 'CRITICAL'
                  ? 'bg-red-600 text-white border-red-700'
                  : 'bg-amber-500 text-white border-amber-600'
              }`}>
                {emergencyContext.risk_level} RISK
              </span>
              <span className="text-[10px] text-slate-500">
                Analyzed by: MedGemma 1.5 ({emergencyContext.model_source})
              </span>
            </div>
          </div>
        ) : (
          /* Default static content when MedGemma context not yet available */
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
        )}

        {/* ── Action Buttons ── */}
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
