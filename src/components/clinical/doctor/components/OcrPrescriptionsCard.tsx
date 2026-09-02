import React from 'react';
import { T } from '../../../../context/TranslationContext';
import { ExtractedEntity } from '../../../../types';
import { Pill } from 'lucide-react';

interface OcrPrescriptionsCardProps {
  extractedEntities: ExtractedEntity[];
}

export const OcrPrescriptionsCard: React.FC<OcrPrescriptionsCardProps> = ({
  extractedEntities
}) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2 font-black text-sm text-slate-100">
          <Pill className="w-4 h-4 text-amber-400" />
          <span><T text="Extracted OCR Prescriptions & Labs" /></span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30">
          Florence-2 Vision
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {extractedEntities.map((ent) => (
          <div key={ent.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-100 text-xs">{ent.drugName}</div>
              <div className="text-[11px] text-slate-400">{ent.frequency} • {ent.route}</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
              {Math.round(ent.confidence * 100)}% Conf
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
