import React from 'react';
import { T } from '../../../../context/TranslationContext';
import { SoapDraft } from '../../../../types';
import { FileText, Mic } from 'lucide-react';

interface SoapNoteWorkspaceProps {
  soapDraft: SoapDraft;
  isDictating: boolean;
  dictatedField: 'subjective' | 'objective' | 'assessment' | 'plan' | null;
  onUpdateSoapDraft: (field: keyof SoapDraft, value: string) => void;
  onStartDoctorDictation: (field: 'subjective' | 'objective' | 'assessment' | 'plan') => void;
}

export const SoapNoteWorkspace: React.FC<SoapNoteWorkspaceProps> = ({
  soapDraft,
  isDictating,
  dictatedField,
  onUpdateSoapDraft,
  onStartDoctorDictation
}) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          <span><T text="Allopathic SOAP Clinical Note Workspace" /></span>
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          Tap 🎙️ to dictate into any section
        </span>
      </div>

      {/* Subjective */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">
            Subjective (Patient Symptoms)
          </label>
          <button
            onClick={() => onStartDoctorDictation('subjective')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDictating && dictatedField === 'subjective'
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isDictating && dictatedField === 'subjective' ? 'Listening...' : 'Dictate'}</span>
          </button>
        </div>
        <textarea
          rows={3}
          value={soapDraft.subjective}
          onChange={(e) => onUpdateSoapDraft('subjective', e.target.value)}
          className="w-full p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs text-slate-100 outline-none focus:ring-2 ring-purple-500/50 font-medium leading-relaxed"
        />
      </div>

      {/* Objective */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
            Objective (Vitals & Labs)
          </label>
          <button
            onClick={() => onStartDoctorDictation('objective')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDictating && dictatedField === 'objective'
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isDictating && dictatedField === 'objective' ? 'Listening...' : 'Dictate'}</span>
          </button>
        </div>
        <textarea
          rows={3}
          value={soapDraft.objective}
          onChange={(e) => onUpdateSoapDraft('objective', e.target.value)}
          className="w-full p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs text-slate-100 outline-none focus:ring-2 ring-indigo-500/50 font-medium leading-relaxed"
        />
      </div>

      {/* Assessment */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            Assessment (Diagnosis)
          </label>
          <button
            onClick={() => onStartDoctorDictation('assessment')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDictating && dictatedField === 'assessment'
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isDictating && dictatedField === 'assessment' ? 'Listening...' : 'Dictate'}</span>
          </button>
        </div>
        <textarea
          rows={2}
          value={soapDraft.assessment}
          onChange={(e) => onUpdateSoapDraft('assessment', e.target.value)}
          className="w-full p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs text-slate-100 outline-none focus:ring-2 ring-amber-500/50 font-medium leading-relaxed"
        />
      </div>

      {/* Plan */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
            Plan & Prescriptions
          </label>
          <button
            onClick={() => onStartDoctorDictation('plan')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDictating && dictatedField === 'plan'
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isDictating && dictatedField === 'plan' ? 'Listening...' : 'Dictate'}</span>
          </button>
        </div>
        <textarea
          rows={4}
          value={soapDraft.plan}
          onChange={(e) => onUpdateSoapDraft('plan', e.target.value)}
          className="w-full p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs text-slate-100 outline-none focus:ring-2 ring-emerald-500/50 font-medium leading-relaxed"
        />
      </div>
    </div>
  );
};
