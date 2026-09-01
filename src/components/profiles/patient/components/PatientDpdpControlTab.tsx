import React from 'react';
import { T } from '../../../../context/TranslationContext';
import {
  Lock,
  CheckCircle2,
  Download,
  ShieldCheck,
  Check,
  Trash2
} from 'lucide-react';

interface PatientDpdpControlTabProps {
  purgeSuccess: boolean;
  isPurging: boolean;
  consentActive: boolean;
  setConsentActive: (val: boolean) => void;
  onExportRecords: () => void;
  onPurgeAllData: () => void;
}

export const PatientDpdpControlTab: React.FC<PatientDpdpControlTabProps> = ({
  purgeSuccess,
  isPurging,
  consentActive,
  setConsentActive,
  onExportRecords,
  onPurgeAllData
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xl space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Lock className="w-6 h-6 text-amber-600" />
            <span><T text="DPDP Act 2023 Patient Privacy & Data Rights Control Center" /></span>
          </h3>
          <p className="text-sm text-slate-600 font-medium mt-0.5">
            <T text="You have absolute legal ownership and control over your medical intake, audio recordings, and OCR records." />
          </p>
        </div>
        <span className="text-xs font-mono font-bold px-3.5 py-1.5 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-full shadow-xs">
          Level-3 DPDP Sealed
        </span>
      </div>

      {purgeSuccess && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-3 text-sm font-bold text-emerald-950 animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>All active session records and ephemeral buffers have been purged in compliance with DPDP Act 2023.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
        {/* Control 1: Export Records */}
        <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-200 space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-900 flex items-center justify-center font-bold">
              <Download className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 text-base"><T text="Export Full Health Record" /></h4>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              <T text="Download your entire consultation history, past diseases, OCR scans, and FHIR R4 Bundle in structured JSON format." />
            </p>
          </div>
          <button
            onClick={onExportRecords}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span><T text="Export FHIR JSON" /></span>
          </button>
        </div>

        {/* Control 2: Consent Management */}
        <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-200 space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 text-base"><T text="Consent Management" /></h4>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              <T text="Manage data sharing consent with attending doctor and hospital OPD repository." />
            </p>
          </div>
          <button
            onClick={() => setConsentActive(!consentActive)}
            className={`w-full py-3.5 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
              consentActive ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{consentActive ? 'Consent Active (Sharing ON)' : 'Consent Revoked (Private)'}</span>
          </button>
        </div>

        {/* Control 3: Right to Erasure / Purge */}
        <div className="p-6 bg-red-50/70 rounded-3xl border-2 border-red-200 space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-black text-red-950 text-base"><T text="Right to Erasure (Purge Data)" /></h4>
            <p className="text-red-900 text-sm font-medium leading-relaxed">
              <T text="Permanently wipe all session transcripts, audio memory, and OCR caches from the kiosk terminal." />
            </p>
          </div>
          <button
            onClick={onPurgeAllData}
            disabled={isPurging}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isPurging ? 'Purging...' : 'Purge All My Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
