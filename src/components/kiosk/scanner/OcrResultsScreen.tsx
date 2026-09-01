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
  Zap,
  Plus,
  Trash2
} from 'lucide-react';

interface ExtractedMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  confidence: number;
  type: 'allopathic' | 'ayurvedic';
}

export const OcrResultsScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  const [selectedDiscrepancyResolution, setSelectedDiscrepancyResolution] = useState<'voice' | 'ocr'>('ocr');
  const [isAiResolving, setIsAiResolving] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  const handleAiResolve = async () => {
    setIsAiResolving(true);
    if (state.resolveDiscrepancyWithAi) {
      await state.resolveDiscrepancyWithAi(0);
    }
    setSelectedDiscrepancyResolution('ocr');
    setIsAiResolving(false);
  };

  const [medications, setMedications] = useState<ExtractedMedication[]>([
    {
      id: 'med-1',
      name: 'Tab. Pantoprazole 40mg',
      dosage: '40mg',
      frequency: '1-0-0 (Before Meals) • 14 Days',
      confidence: 98,
      type: 'allopathic'
    },
    {
      id: 'med-2',
      name: 'Avipattikar Churna 3g',
      dosage: '3g',
      frequency: '1-0-1 (After Meals with lukewarm water)',
      confidence: 95,
      type: 'ayurvedic'
    },
    {
      id: 'med-3',
      name: 'Sutshekhar Ras (Gold Enriched)',
      dosage: '125mg',
      frequency: '0-0-1 (At Bedtime)',
      confidence: 92,
      type: 'ayurvedic'
    }
  ]);

  const [newMedName, setNewMedName] = useState<string>('');
  const [newMedFreq, setNewMedFreq] = useState<string>('');

  const handleAddMedication = () => {
    if (!newMedName.trim()) return;
    setMedications((prev) => [
      ...prev,
      {
        id: `med-${Date.now()}`,
        name: newMedName.trim(),
        dosage: 'Standard',
        frequency: newMedFreq.trim() || '1-0-1 (After Meals)',
        confidence: 99,
        type: 'allopathic'
      }
    ]);
    setNewMedName('');
    setNewMedFreq('');
  };

  const handleRemoveMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

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

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleAiResolve}
              disabled={isAiResolving}
              className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-purple-700/30"
              title="MedGemma Colab LLM Discrepancy Triangulation"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAiResolving ? 'Resolving via MedGemma...' : '🤖 MedGemma AI Triangulate'}</span>
            </button>

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

        {/* Extracted Drug Entities List & Interactive Editor */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              <T text="Extracted Medications from Prescription OCR" />
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {medications.length} <T text="Items Verified" />
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {medications.map((med) => (
              <div key={med.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span>{med.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      med.type === 'ayurvedic' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-teal-100 text-teal-900 border border-teal-200'
                    }`}>
                      {med.confidence}% Conf
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px]">{med.frequency}</div>
                </div>

                <button
                  onClick={() => handleRemoveMedication(med.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Medication Row */}
          <div className="p-3.5 bg-teal-50/60 rounded-2xl border border-teal-200 flex flex-col sm:flex-row items-center gap-2 pt-3">
            <input
              type="text"
              placeholder="Add medication name (e.g. Tab. Amoxicillin 500mg)..."
              value={newMedName}
              onChange={(e) => setNewMedName(e.target.value)}
              className="w-full sm:flex-1 px-3 py-2 bg-white rounded-xl border border-teal-300 text-xs font-medium text-slate-900 outline-none"
            />
            <input
              type="text"
              placeholder="Frequency (e.g. 1-0-1 After Meals)..."
              value={newMedFreq}
              onChange={(e) => setNewMedFreq(e.target.value)}
              className="w-full sm:flex-1 px-3 py-2 bg-white rounded-xl border border-teal-300 text-xs font-medium text-slate-900 outline-none"
            />
            <button
              onClick={handleAddMedication}
              className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span><T text="Add Medication" /></span>
            </button>
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
