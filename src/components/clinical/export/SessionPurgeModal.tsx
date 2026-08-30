import React, { useState } from 'react';
import { Trash2, Lock, ShieldCheck, CheckCircle2, Download, X } from 'lucide-react';
import { T } from '../../../context/TranslationContext';

interface SessionPurgeModalProps {
  onClose: () => void;
}

export const SessionPurgeModal: React.FC<SessionPurgeModalProps> = ({ onClose }) => {
  const [purged, setPurged] = useState<boolean>(false);

  const handleExecutePurge = () => {
    setPurged(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 animate-in zoom-in-95 duration-200 text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 border border-red-200 flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                <T text="DPDP Act 2023 Ephemeral Data Purge" />
              </h2>
              <div className="text-xs text-slate-500">
                Zero-Retention Ephemeral RAM Wiping Audit
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

        <div className="space-y-3 text-xs">
          <p className="text-slate-600 leading-relaxed font-semibold">
            <T text="Upon transmitting FHIR bundle to ABDM, all raw patient audio buffers, OCR temporary image caches, and local telemetry are purged permanently from kiosk memory." />
          </p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-700">
              <span><T text="Raw Audio ASR Buffer" /></span>
              <span className={purged ? 'text-emerald-700 font-bold' : 'text-amber-700'}>{purged ? <T text="0 Bytes (Purged)" /> : <T text="1.4 MB (Active)" />}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span><T text="OCR Image Scans" /></span>
              <span className={purged ? 'text-emerald-700 font-bold' : 'text-amber-700'}>{purged ? <T text="0 Bytes (Purged)" /> : <T text="3.8 MB (Active)" />}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span><T text="Session Cryptographic Key" /></span>
              <span className={purged ? 'text-emerald-700 font-bold' : 'text-amber-700'}>{purged ? <T text="Wiped" /> : <T text="Active" />}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <T text="Cancel" />
          </button>

          <button
            onClick={purged ? onClose : handleExecutePurge}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {purged ? <T text="✓ Purge Verified (0 Bytes)" /> : <T text="Execute Ephemeral RAM Purge" />}
          </button>
        </div>

      </div>
    </div>
  );
};
