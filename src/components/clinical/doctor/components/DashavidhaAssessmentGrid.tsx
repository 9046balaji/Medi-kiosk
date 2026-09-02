import React from 'react';
import { T } from '../../../../context/TranslationContext';
import { Flame, Sliders, Wind, Droplet } from 'lucide-react';

interface DashavidhaAssessmentGridProps {
  vata: number;
  pitta: number;
  kapha: number;
  prakriti: string;
  vikriti: string;
  agni: string;
  kosta: string;
  sara: string;
  samhanana: string;
  onSetVata: (val: number) => void;
  onSetPitta: (val: number) => void;
  onSetKapha: (val: number) => void;
  onSetPrakriti: (val: string) => void;
  onSetVikriti: (val: string) => void;
  onSetAgni: (val: string) => void;
  onSetKosta: (val: string) => void;
  onSetSara: (val: string) => void;
  onSetSamhanana: (val: string) => void;
}

export const DashavidhaAssessmentGrid: React.FC<DashavidhaAssessmentGridProps> = ({
  vata,
  pitta,
  kapha,
  prakriti,
  vikriti,
  agni,
  kosta,
  sara,
  samhanana,
  onSetVata,
  onSetPitta,
  onSetKapha,
  onSetPrakriti,
  onSetVikriti,
  onSetAgni,
  onSetKosta,
  onSetSara,
  onSetSamhanana
}) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <span><T text="Vaidya 10-Fold Dashavidha Pariksha Matrix" /></span>
        </h3>
        <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
          AyurParam GGUF Engine
        </span>
      </div>

      {/* Tridosha Imbalance Sliders */}
      <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700/60 space-y-4">
        <div className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-teal-400" />
          <span>Tridosha Imbalance Ratio</span>
        </div>

        <div className="space-y-3 text-xs font-bold">
          <div>
            <div className="flex justify-between mb-1 text-sky-300">
              <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> Vata (Air/Ether)</span>
              <span>{vata}%</span>
            </div>
            <input type="range" min={0} max={100} value={vata} onChange={(e) => onSetVata(Number(e.target.value))} className="w-full accent-sky-400 cursor-pointer" />
          </div>

          <div>
            <div className="flex justify-between mb-1 text-amber-300">
              <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> Pitta (Fire/Water)</span>
              <span>{pitta}%</span>
            </div>
            <input type="range" min={0} max={100} value={pitta} onChange={(e) => onSetPitta(Number(e.target.value))} className="w-full accent-amber-400 cursor-pointer" />
          </div>

          <div>
            <div className="flex justify-between mb-1 text-emerald-300">
              <span className="flex items-center gap-1"><Droplet className="w-3.5 h-3.5" /> Kapha (Water/Earth)</span>
              <span>{kapha}%</span>
            </div>
            <input type="range" min={0} max={100} value={kapha} onChange={(e) => onSetKapha(Number(e.target.value))} className="w-full accent-emerald-400 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* 10-Fold Assessment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/50 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">1. Prakriti (Constitution)</span>
          <input type="text" value={prakriti} onChange={(e) => onSetPrakriti(e.target.value)} className="w-full bg-transparent border-b border-slate-700 font-bold text-teal-300 outline-none" />
        </div>
        <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/50 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">2. Vikriti (Current Imbalance)</span>
          <input type="text" value={vikriti} onChange={(e) => onSetVikriti(e.target.value)} className="w-full bg-transparent border-b border-slate-700 font-bold text-amber-300 outline-none" />
        </div>
        <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/50 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">3. Agni (Digestive Fire)</span>
          <input type="text" value={agni} onChange={(e) => onSetAgni(e.target.value)} className="w-full bg-transparent border-b border-slate-700 font-bold text-slate-200 outline-none" />
        </div>
        <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/50 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">4. Kosta (Bowel Habit)</span>
          <input type="text" value={kosta} onChange={(e) => onSetKosta(e.target.value)} className="w-full bg-transparent border-b border-slate-700 font-bold text-slate-200 outline-none" />
        </div>
        <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/50 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">5. Sara (Tissue Quality)</span>
          <input type="text" value={sara} onChange={(e) => onSetSara(e.target.value)} className="w-full bg-transparent border-b border-slate-700 font-bold text-slate-200 outline-none" />
        </div>
        <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-700/50 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">6. Samhanana (Body Build)</span>
          <input type="text" value={samhanana} onChange={(e) => onSetSamhanana(e.target.value)} className="w-full bg-transparent border-b border-slate-700 font-bold text-slate-200 outline-none" />
        </div>
      </div>

    </div>
  );
};
