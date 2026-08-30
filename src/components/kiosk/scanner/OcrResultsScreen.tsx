import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import { DrugInteractionMatrix } from '../../common/DrugInteractionMatrix';
import {
  FileText,
  AlertOctagon,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Pill,
  Activity,
  Edit3,
  Check,
  Zap
} from 'lucide-react';

export const OcrResultsScreen: React.FC = () => {
  const navigate = useNavigate();

  const [selectedDiscrepancyResolution, setSelectedDiscrepancyResolution] = useState<'voice' | 'ocr'>('ocr');
  const [confirmed, setConfirmed] = useState<boolean>(false);

  const handleConfirmAndProceed = () => {
    setConfirmed(true);
    setTimeout(() => {
      navigate('/complete');
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/scan')}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <T text="Back to Document Scanner" />
          </button>

          <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full">
            <T text="OCR Vision Confidence: 96.4%" />
          </span>
        </div>

        {/* Discrepancy Triangulation Banner */}
        <div className="p-5 bg-amber-50 rounded-3xl border-2 border-amber-300 shadow-md space-y-3">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0" />
            <h3 className="text-sm font-extrabold text-amber-900">
              <T text="Voice vs OCR Prescription Discrepancy Triangulation" />
            </h3>
          </div>

          <div className="text-xs text-amber-950 leading-relaxed font-medium">
            <T text="Voice intake indicated 'Pantoprazole 40mg Twice Daily', whereas scanned paper prescription states 'Pantoprazole 40mg Once Daily (1-0-0) AC'." />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setSelectedDiscrepancyResolution('ocr')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                selectedDiscrepancyResolution === 'ocr'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-amber-900 border border-amber-300'
              }`}
            >
              <T text="Accept Scanned OCR Rx (Once Daily)" />
            </button>

            <button
              onClick={() => setSelectedDiscrepancyResolution('voice')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                selectedDiscrepancyResolution === 'voice'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-amber-900 border border-amber-300'
              }`}
            >
              <T text="Keep Patient Voice Statement (Twice Daily)" />
            </button>
          </div>
        </div>

        {/* Extracted Drug Entities List */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" />
            <T text="Extracted Medications from Prescription OCR" />
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span><T text="Tab. Pantoprazole 40mg" /></span>
                <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-bold">
                  98% Conf
                </span>
              </div>
              <div className="text-slate-500"><T text="Frequency: 1-0-0 (Before Meals) • Duration: 14 Days" /></div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span><T text="Avipattikar Churna 3g" /></span>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                  95% Conf
                </span>
              </div>
              <div className="text-slate-500"><T text="Frequency: 1-0-1 (After Meals with warm water)" /></div>
            </div>
          </div>
        </div>

        {/* Cross-Discipline Interaction Safety Matrix */}
        <DrugInteractionMatrix />

        {/* Action Controls */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleConfirmAndProceed}
            className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-teal-600/30 flex items-center gap-2 cursor-pointer"
          >
            {confirmed ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span><T text="OCR Confirmed!" /></span>
              </>
            ) : (
              <>
                <span><T text="Confirm Entities & Print Token Slip" /></span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
