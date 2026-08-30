import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Info, Sparkles, Pill, AlertOctagon, CheckCircle2, Search, Plus } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [interactions, setInteractions] = useState<DrugInteraction[]>([
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
      drugA: 'Aspirin (75mg)',
      typeA: 'allopathic',
      drugB: 'Arjuna Churna (Terminalia arjuna)',
      typeB: 'ayurvedic',
      severity: 'high',
      title: 'Synergistic Antiplatelet Potentiation Warning',
      mechanism: 'Arjunolic acid combined with acetylsalicylic acid elevates antiplatelet response, increasing risk of gastric mucosal bleeding.',
      recommendation: 'Stagger administration timing by 4 hours. Advise patient to monitor for dark stools.'
    },
    {
      id: 'int-3',
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
      id: 'int-4',
      drugA: 'Metformin (500mg)',
      typeA: 'allopathic',
      drugB: 'Karela / Jambu Churna',
      typeB: 'ayurvedic',
      severity: 'moderate',
      title: 'Additive Hypoglycemic Action Warning',
      mechanism: 'Charantin in Karela enhances peripheral glucose uptake, increasing risk of mild hypoglycemic episodes when taken with Metformin.',
      recommendation: 'Advise patient to log fasting blood glucose daily. Adjust Metformin dose if FBG drops below 80 mg/dL.'
    }
  ]);

  const filteredInteractions = interactions.filter((i) => {
    const matchesFilter = selectedSeverityFilter === 'all' || i.severity === selectedSeverityFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      i.drugA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.drugB.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            <T text="High Risk" /> (2)
          </button>
          <button
            onClick={() => setSelectedSeverityFilter('moderate')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              selectedSeverityFilter === 'moderate' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-800 hover:bg-amber-100'
            }`}
          >
            <T text="Moderate" /> (1)
          </button>
          <button
            onClick={() => setSelectedSeverityFilter('synergy')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              selectedSeverityFilter === 'synergy' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <T text="Synergistic" /> (1)
          </button>
        </div>
      </div>

      {/* Interactive Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search drug or herb (e.g. Aspirin, Arjuna, Warfarin, Guggulu, Metformin)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-all"
        />
      </div>

      {/* Interaction Cards List */}
      <div className="space-y-3">
        {filteredInteractions.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 font-medium">
            <T text="No drug-herb contraindication risk detected for this query." />
          </div>
        ) : (
          filteredInteractions.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border-2 transition-all space-y-2 text-xs ${
                item.severity === 'high'
                  ? 'border-red-300 bg-red-50/50'
                  : item.severity === 'moderate'
                  ? 'border-amber-300 bg-amber-50/50'
                  : 'border-emerald-300 bg-emerald-50/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.drugA}</span>
                  <span className="text-slate-400 font-bold">+</span>
                  <span className="font-bold text-slate-900">{item.drugB}</span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.severity === 'high'
                      ? 'bg-red-600 text-white shadow-xs'
                      : item.severity === 'moderate'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-emerald-600 text-white shadow-xs'
                  }`}
                >
                  {item.severity === 'high' && <T text="High Risk Contraindication" />}
                  {item.severity === 'moderate' && <T text="Moderate Monitoring Advised" />}
                  {item.severity === 'synergy' && <T text="Synergistic Complementary Effect" />}
                </span>
              </div>

              <div className="font-bold text-slate-900 text-sm">{item.title}</div>

              <div className="text-slate-700 leading-relaxed font-medium">
                <strong><T text="Mechanism:" /></strong> {item.mechanism}
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800 font-medium">
                <strong className="text-teal-800"><T text="Clinical Recommendation:" /></strong> {item.recommendation}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
