import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import { validFhirR4Bundle } from '../../../data/mockData';
import { SessionPurgeModal } from './SessionPurgeModal';
import {
  FileCode,
  CheckCircle2,
  Lock,
  Download,
  Copy,
  Trash2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Code
} from 'lucide-react';

export const FhirExportScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  const [copied, setCopied] = useState<boolean>(false);
  const [showPurgeModal, setShowPurgeModal] = useState<boolean>(false);

  // Dynamic FHIR Bundle Payload
  const dynamicFhirBundle = {
    ...validFhirR4Bundle,
    id: `fhir-bundle-${state.opdToken}`,
    timestamp: new Date().toISOString(),
    entry: validFhirR4Bundle.entry.map((entry: any) => {
      if (entry.resource?.resourceType === 'Patient') {
        return {
          ...entry,
          resource: {
            ...entry.resource,
            name: [{ text: state.patientName }],
            identifier: [{ system: 'https://healthid.ndhm.gov.in', value: '91-4589-2041-9872' }]
          }
        };
      }
      return entry;
    })
  };

  const jsonString = JSON.stringify(dynamicFhirBundle, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR_Bundle_${state.opdToken}.json`;
    a.click();
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {showPurgeModal && (
        <SessionPurgeModal onClose={() => setShowPurgeModal(false)} />
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border-2 border-slate-200 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-lg shadow-teal-600/30">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  <T text="HL7 FHIR R4 Bundle Export & ABDM Sync" />
                </h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full">
                  NRCES Profile Level-3 Verified
                </span>
              </div>
              <p className="text-xs text-slate-500">
                <T text="Cryptographically signed clinical bundle ready for ABDM Health Locker transmission." />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPurgeModal(true)}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <T text="DPDP Ephemeral Session Purge" />
            </button>

            <button
              onClick={handleDownloadJson}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span><T text="Download .json Bundle" /></span>
            </button>
          </div>
        </div>

        {/* Validation Specs Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 space-y-1 shadow-xs">
            <div className="text-slate-500 text-[10px] uppercase font-bold"><T text="Bundle Profile" /></div>
            <div className="font-bold text-teal-800 font-mono">Composition / OPConsultRecord</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 space-y-1 shadow-xs">
            <div className="text-slate-500 text-[10px] uppercase font-bold"><T text="Terminology Codings" /></div>
            <div className="font-bold text-amber-800 font-mono">SNOMED CT + NAMASTE Ayush</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 space-y-1 shadow-xs">
            <div className="text-slate-500 text-[10px] uppercase font-bold"><T text="Digital Signature" /></div>
            <div className="font-bold text-emerald-700 font-mono">RSA-2048 SHA256 Sealed</div>
          </div>
        </div>

        {/* Interactive JSON Payload Code Box */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800">
              <Code className="w-4 h-4 text-teal-600" />
              <span>FHIR_Bundle_{state.opdToken}.json</span>
            </div>

            <button
              onClick={handleCopyJson}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-teal-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-300"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? <T text="Copied to Clipboard!" /> : <T text="Copy Raw JSON" />}
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-teal-300 rounded-2xl border border-slate-800 text-xs font-mono overflow-x-auto max-h-[460px]">
            {jsonString}
          </pre>
        </div>

      </div>
    </div>
  );
};
