import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import {
  Scan,
  FileText,
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  RefreshCw,
  Sparkles,
  FileSearch
} from 'lucide-react';

export const DocScannerScreen: React.FC = () => {
  const navigate = useNavigate();
  const [docType, setDocType] = useState<'prescription' | 'lab_report' | 'discharge'>('prescription');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanComplete, setScanComplete] = useState<boolean>(false);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/intake')}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <T text="Back to Voice Intake" />
          </button>

          <span className="text-xs font-mono font-bold px-3 py-1 bg-teal-100 text-teal-800 border border-teal-200 rounded-full">
            <T text="Optical Document Scanner 300 DPI" />
          </span>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            <T text="Scan Physical Paper Prescriptions & Lab Reports" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            <T text="Place paper document on scanner bed below for instant OCR extraction." />
          </p>
        </div>

        {/* Document Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setDocType('prescription')}
            className={`p-3.5 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              docType === 'prescription'
                ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <T text="Prescription / Rx" />
          </button>

          <button
            onClick={() => setDocType('lab_report')}
            className={`p-3.5 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              docType === 'lab_report'
                ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <T text="Lab Pathology Report" />
          </button>

          <button
            onClick={() => setDocType('discharge')}
            className={`p-3.5 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              docType === 'discharge'
                ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <T text="Discharge Summary" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-6">
          <div className="relative aspect-video max-w-2xl mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 flex items-center justify-center p-4">
            
            <img
              src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"
              alt="Scanned prescription document"
              className="w-full h-full object-cover opacity-70 filter contrast-125"
            />

            {/* Laser Beam */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-scan-laser shadow-[0_0_15px_#14B8A6]" />
            )}

            {scanComplete && (
              <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex items-center justify-center">
                <div className="text-center space-y-2">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                  <div className="text-base font-bold text-white"><T text="Document Scanned Successfully!" /></div>
                  <div className="text-xs text-emerald-300 font-mono">3 Medicines & 2 Lab Tests Detected</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-teal-700/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
              <span>{isScanning ? <T text="Scanning Lens Active..." /> : <T text="Simulate Document Capture" />}</span>
            </button>

            <button
              onClick={() => navigate('/scan/results')}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-teal-300 font-black text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span><T text="Review Extracted OCR Entities" /></span>
              <ArrowRight className="w-4 h-4 text-teal-400" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
