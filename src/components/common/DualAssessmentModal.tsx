import React from 'react';
import { Sparkles, Activity, CheckCircle2, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { T } from '../../context/TranslationContext';

interface DualAssessmentModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export const DualAssessmentModal: React.FC<DualAssessmentModalProps> = ({
  onClose,
  onConfirm
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                <T text="Dual Integrated Clinical Assessment" />
              </h2>
              <div className="text-xs text-slate-500">
                <T text="Allopathic SOAP + Ayush Dashavidha Integrated Intake" />
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informational Cards */}
        <div className="space-y-3 text-xs">
          <p className="text-slate-600 leading-relaxed font-medium">
            <T text="You are entering the integrated clinical assessment mode combining Allopathic SOAP intake with Ayush Dashavidha Pariksha." />
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-teal-900">
                <Activity className="w-4 h-4 text-teal-700" />
                <span><T text="Allopathic 8-SOAP" /></span>
              </div>
              <p className="text-[11px] text-teal-800">
                <T text="Onset, Location, Severity & Vitals Telemetry check." />
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span><T text="Vaidya 10-Dashavidha" /></span>
              </div>
              <p className="text-[11px] text-amber-800">
                <T text="Prakriti, Agni, Kosta & Dehabala assessment." />
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-slate-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <span><T text="Ministry of Ayush & ABDM NHA Guideline Standardized." /></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <T text="Cancel" />
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-teal-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span><T text="Start Dual Mode" /></span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
