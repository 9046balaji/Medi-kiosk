import React, { useState } from 'react';
import { useMediKiosk } from '../../../../context/MediKioskContext';
import { T } from '../../../../context/TranslationContext';
import { PastCondition, AllergyItem } from './types';
import {
  User,
  QrCode,
  Edit3,
  Activity,
  Plus,
  Volume2,
  Trash2,
  ShieldAlert,
  History,
  Users,
  ArrowRight
} from 'lucide-react';

interface PatientDemographicsTabProps {
  pastConditions: PastCondition[];
  allergies: AllergyItem[];
  onOpenAddDiseaseModal: () => void;
  onDeleteCondition: (id: string) => void;
  onPlayTts: (text: string) => void;
  onNavigateToFamily?: () => void;
}

export const PatientDemographicsTab: React.FC<PatientDemographicsTabProps> = ({
  pastConditions,
  allergies,
  onOpenAddDiseaseModal,
  onDeleteCondition,
  onPlayTts,
  onNavigateToFamily
}) => {
  const state = useMediKiosk();
  const [editDemographics, setEditDemographics] = useState<boolean>(false);
  const [tempBloodGroup, setTempBloodGroup] = useState<string>(state.patientBloodGroup);

  return (
    <div className="space-y-6 w-full">
      {/* Top Row: Digital Card & Demographic Parameters */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full">
        {/* ABHA Digital Card */}
        <div className="xl:col-span-5 space-y-5">
          <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 shadow-2xl border border-teal-800/40 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-teal-500/30 flex items-center justify-center font-black text-teal-300 text-base shadow-inner">
                  MK
                </span>
                <div>
                  <div className="text-sm font-extrabold uppercase tracking-wider text-teal-300">
                    <T text="National Health Authority" />
                  </div>
                  <div className="text-xs text-slate-300 font-medium">ABDM Digital Health Card</div>
                </div>
              </div>
              <QrCode className="w-12 h-12 text-teal-400" />
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="text-xs text-slate-300 font-mono font-bold uppercase tracking-wider">
                <T text="Health ID Number" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-amber-300">
                {state.abhaId || '91-4589-2041-9872'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t border-white/20">
              <div>
                <div className="text-slate-300 text-xs font-semibold"><T text="Patient Name" /></div>
                <div className="font-extrabold text-base text-white">{state.patientName}</div>
              </div>
              <div>
                <div className="text-slate-300 text-xs font-semibold"><T text="Gender / Age" /></div>
                <div className="font-extrabold text-base text-white">{state.patientAge} Yrs • <T text={state.patientGender} /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Demographic Controls */}
        <div className="xl:col-span-7 space-y-5">
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                <span><T text="Demographic Parameters & Profile Controls" /></span>
              </h3>
              <button
                onClick={() => setEditDemographics(!editDemographics)}
                className="text-sm text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border border-teal-200 cursor-pointer transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>{editDemographics ? 'Done' : 'Edit Info'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-1.5">
                <span className="text-slate-600 text-xs font-bold uppercase tracking-wider block"><T text="Blood Group" /></span>
                {editDemographics ? (
                  <input
                    type="text"
                    value={tempBloodGroup}
                    onChange={(e) => setTempBloodGroup(e.target.value)}
                    className="w-full bg-white border-2 border-teal-500 rounded-xl p-2 font-black text-slate-900 text-base"
                  />
                ) : (
                  <div className="font-black text-slate-900 text-lg">{tempBloodGroup}</div>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-1.5">
                <span className="text-slate-600 text-xs font-bold uppercase tracking-wider block"><T text="Height & Weight" /></span>
                <div className="font-black text-slate-900 text-base">{state.patientHeightWeight}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-1.5">
                <span className="text-slate-600 text-xs font-bold uppercase tracking-wider block"><T text="Preferred Language" /></span>
                <div className="font-black text-slate-900 text-base capitalize">{state.language}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-1.5">
                <span className="text-slate-600 text-xs font-bold uppercase tracking-wider block"><T text="Emergency Helpline" /></span>
                <div className="font-black text-teal-800 text-base font-mono">+91 98765-43210</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Existing Diseases & Past Chronic Conditions Section */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-5 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-red-600" />
              <span><T text="Pre-Existing Diseases & Chronic Conditions Registry" /></span>
            </h3>
            <p className="text-sm text-slate-600 font-medium mt-0.5">
              <T text="All known chronic problems, past diagnoses, and ongoing ailments saved in your ABDM Health Record." />
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() =>
                onPlayTts(
                  `Patient has ${pastConditions.length} registered pre-existing conditions: ${pastConditions
                    .map((c) => c.name)
                    .join(', ')}`
                )
              }
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span><T text="Listen All Conditions" /> 🔊</span>
            </button>

            <button
              onClick={onOpenAddDiseaseModal}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span><T text="Add Past Disease / Problem" /></span>
            </button>
          </div>
        </div>

        {/* Disease Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
          {pastConditions.map((cond) => (
            <div
              key={cond.id}
              className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/80 hover:bg-white hover:border-indigo-500 transition-all shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-lg font-bold text-xs ${
                      cond.severity === 'Severe'
                        ? 'bg-red-100 text-red-900 border border-red-300'
                        : cond.severity === 'Moderate'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                  >
                    {cond.severity} • {cond.status}
                  </span>
                  <span className="text-xs text-slate-600 font-bold">Since {cond.diagnosedYear}</span>
                </div>

                <h4 className="font-black text-slate-900 text-base leading-snug">{cond.name}</h4>
                <div className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 inline-block">
                  {cond.code}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200">
                  {cond.notes}
                </p>
                <div className="text-xs text-slate-500 font-semibold">{cond.hospital}</div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() =>
                    onPlayTts(`${cond.name}. Diagnosed in ${cond.diagnosedYear}. Severity: ${cond.severity}. ${cond.notes}`)
                  }
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl flex items-center gap-1.5 font-bold text-xs cursor-pointer border border-teal-200"
                  title="Listen with TTS"
                >
                  <Volume2 className="w-4 h-4 text-teal-700" />
                  <span>Listen 🔊</span>
                </button>

                <button
                  onClick={() => onDeleteCondition(cond.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 cursor-pointer"
                  title="Remove Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Known Allergies & Past Surgeries Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full">
        {/* Allergies (7 cols) */}
        <div className="xl:col-span-7 bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span><T text="Known Drug Allergies & Contraindications" /></span>
            </h3>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
              {allergies.length} Allergies Flagged
            </span>
          </div>

          <div className="space-y-3">
            {allergies.map((alg) => (
              <div
                key={alg.id}
                className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/70 flex items-start justify-between gap-3 text-sm shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-amber-950 text-base">{alg.allergen}</span>
                    <span className="text-xs px-2.5 py-0.5 bg-amber-200 text-amber-900 font-mono font-bold rounded-md">
                      {alg.type}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                        alg.severity === 'CRITICAL' ? 'bg-red-600 text-white shadow-xs' : 'bg-amber-600 text-white'
                      }`}
                    >
                      {alg.severity}
                    </span>
                  </div>
                  <p className="text-amber-950 font-medium leading-relaxed">{alg.reaction}</p>
                </div>

                <button
                  onClick={() => onPlayTts(`Allergy to ${alg.allergen}. Reaction: ${alg.reaction}`)}
                  className="p-2.5 hover:bg-amber-200/60 bg-white border border-amber-200 rounded-xl text-amber-900 cursor-pointer shrink-0"
                  title="Listen with TTS"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Past Surgeries & Inpatient Procedures (5 cols) */}
        <div className="xl:col-span-5 bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="pb-3 border-b border-slate-200">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-teal-600" />
                <span><T text="Past Surgeries & Inpatient Procedures" /></span>
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-1">
                <span className="font-bold text-teal-900 block uppercase tracking-wider text-xs">
                  <T text="Major Surgeries & Operations" />:
                </span>
                <div className="font-black text-slate-900 text-sm sm:text-base">• Laparoscopic Appendectomy (2018)</div>
                <div className="text-slate-600 text-xs sm:text-sm font-medium">Apollo Hospital Delhi • Uncomplicated recovery</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-1">
                <span className="font-bold text-teal-900 block uppercase tracking-wider text-xs">
                  <T text="Ayush Inpatient Therapies" />:
                </span>
                <div className="font-black text-slate-900 text-sm sm:text-base">• Panchakarma 7-day Virechana Detox (Dec 2025)</div>
                <div className="text-slate-600 text-xs sm:text-sm font-medium">AIIA New Delhi • Pitta pacification protocol</div>
              </div>
            </div>
          </div>

          {onNavigateToFamily && (
            <button
              onClick={onNavigateToFamily}
              className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer border-2 border-rose-300 transition-all mt-3 shadow-xs"
            >
              <Users className="w-5 h-5 text-rose-700" />
              <span><T text="View Dedicated Family Members & Health Tree" /></span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
