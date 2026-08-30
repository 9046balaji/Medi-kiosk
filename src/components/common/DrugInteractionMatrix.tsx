import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Info, Sparkles, Pill, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { T } from '../../context/TranslationContext';

export interface DrugInteraction {
  id: string;
  drugA: string;
  typeA: 'allopathic' | 'ayurvedic';
  drugB: string;
  typeB: 'allopathic' | 'ayurvedic';
  severity: 'high' | 'moderate' | 'synergy';
  title: string;
  mechanism: string;
  recommendation: string;
}

export const DrugInteractionMatrix: React.FC = () => {
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<'all' | 'high' | 'moderate' | 'synergy'>('all');

  const interactions: DrugInteraction[] = [
    {
      id: 'int-1',
      drugA: 'Warfarin (5mg)',
      typeA: 'allopathic',
      drugB: 'Guggulu (Shuddha Guggulu)',
      typeB: 'ayurvedic',
      severity: 'high',
      title: 'Increased Anticoagulation & Bleeding Risk',
      mechanism: 'Guggulsterones inhibit platelet aggregation and potentiate Warfarin activity, significantly elevating INR levels.',
      recommendation: 'Monitor Prothrombin Time (PT/INR) closely. Consider reducing Guggulu dosage or selecting alternative anti-inflammatory Ayush therapy.'
    },
    {
      id: 'int-2',
      drugA: 'Pantoprazole (40mg)',
      typeA: 'allopathic',
      drugB: 'Shankha Bhasma',
      typeB: 'ayurvedic',
      severity: 'synergy',
      title: 'Enhanced Epigastric Synergistic Relief',
      mechanism: 'Shankha Bhasma provides natural antacid calcium carbonate buffering while Pantoprazole reduces gastric acid secretion.',
      recommendation: 'Favorable clinical combination for Hyperacidity (Amlapitta). Administer Shankha Bhasma 30 minutes post-meals.'
    },
    {
      id: 'int-3',
      drugA: 'Metformin (500mg)',
      typeA: 'allopathic',
      drugB: 'Karela / Jambu Churna',
      typeB: 'ayurvedic',
      severity: 'moderate',
      title: 'Additive Hypoglycemic Action Warning',
      mechanism: 'Charantin in Karela enhances peripheral glucose uptake, increasing risk of mild hypoglycemic episodes when taken with Metformin.',
      recommendation: 'Advise patient to log fasting blood glucose daily. Adjust Metformin dose if FBG drops below 80 mg/dL.'
    }
  ];

  const filteredInteractions = selectedSeverityFilter === 'all'
    ? interactions
    : interactions.filter((i) => i.severity === selectedSeverityFilter);

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-5 space-y-4">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold">
            <AlertOctagon className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                <T text="Cross-Discipline Drug Safety & Interaction Engine" />
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-teal-100 text-teal-800 border border-teal-200 rounded font-bold">
                Ayush-Allopathy Sync
              </span>
            </div>
            <p className="text-xs text-slate-500">
              <T text="Real-time cross-referencing of OCR scanned medications vs Ayush herbal formulations." />
            </p>
          </div>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setSelectedSeverityFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              selectedSeverityFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <T text="All" /> ({interactions.length})
          </button>
          <button
            onClick={() => setSelectedSeverityFilter('high')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              selectedSeverityFilter === 'high' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700 hover:bg-red-100'
            }`}
          >
            <T text="High Risk" /> (1)
          </button>
          <button
            onClick={() => setSelectedSeverityFilter('synergy')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              selectedSeverityFilter === 'synergy' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <T text="Synergy" /> (1)
          </button>
        </div>
      </div>

      {/* List of Interactions */}
      <div className="space-y-3">
        {filteredInteractions.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border-2 transition-all space-y-2.5 ${
              item.severity === 'high'
                ? 'border-red-200 bg-red-50/50'
                : item.severity === 'moderate'
                ? 'border-amber-200 bg-amber-50/50'
                : 'border-emerald-200 bg-emerald-50/50'
            }`}
          >
            {/* Pair Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-2xs">
                  <Pill className="w-3.5 h-3.5 text-teal-600" />
                  <T text={item.drugA} />
                </span>

                <span className="text-xs font-bold text-slate-400">⚡</span>

                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-amber-900 flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <T text={item.drugB} />
                </span>
              </div>

              {/* Severity Badge */}
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider self-start sm:self-auto ${
                  item.severity === 'high'
                    ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                    : item.severity === 'moderate'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {item.severity === 'high' ? <T text="High Contraindication" /> : item.severity === 'moderate' ? <T text="Moderate Precaution" /> : <T text="Favorable Synergy" />}
              </span>
            </div>

            {/* Title & Mechanism */}
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900">
                <T text={item.title} />
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                <strong className="text-slate-800 font-bold"><T text="Mechanism of Action:" /> </strong>
                <T text={item.mechanism} />
              </p>
            </div>

            {/* Recommendation Box */}
            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/70 text-xs text-slate-800 flex items-start gap-2">
              <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-teal-900"><T text="Clinical Advisory & Action Plan:" /> </span>
                <T text={item.recommendation} />
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
