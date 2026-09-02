import React from 'react';
import { T } from '../../../../context/TranslationContext';
import { AlertTriangle, ShieldAlert, ArrowRight, X } from 'lucide-react';

interface EmergencyEscalationModalProps {
  patientName: string;
  opdToken: string;
  symptoms: string;
  onClose: () => void;
  onConfirmErTransfer: () => void;
}

export const EmergencyEscalationModal: React.FC<EmergencyEscalationModalProps> = ({
  patientName,
  opdToken,
  symptoms,
  onClose,
  onConfirmErTransfer
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-red-500 shadow-2xl max-w-md w-full p-6 rounded-3xl space-y-4 animate-in zoom-in-95 text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-red-500/40">
          <div className="flex items-center gap-2.5 font-black text-red-400 text-base">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
            <span>CRITICAL P1 EMERGENCY ALERT</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-red-950/60 rounded-xl border border-red-500/40 space-y-1">
            <div className="font-bold text-white text-sm">{patientName} (Token: {opdToken})</div>
            <div className="text-red-300 font-semibold">Detected High-Risk Red Flags: "{symptoms}"</div>
          </div>

          <p className="text-slate-300 font-medium leading-relaxed">
            Patient reported high-risk acute symptoms during voice intake. Immediate ER Resuscitation Protocol triggered.
          </p>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer">
            Dismiss
          </button>
          <button
            onClick={() => {
              onConfirmErTransfer();
              onClose();
            }}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-600/40 flex items-center gap-2 cursor-pointer"
          >
            <span>ROUTE TO ER RESUSCITATION</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
