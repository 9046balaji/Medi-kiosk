import React, { useState } from 'react';
import { T } from '../../../../context/TranslationContext';
import { FamilyMemberItem } from './types';
import { AddFamilyMemberModal } from './AddFamilyMemberModal';
import {
  Users,
  Volume2,
  Plus,
  Trash2,
  Heart,
  Activity,
  ShieldAlert,
  Phone,
  QrCode,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface PatientFamilyTabProps {
  onPlayTts: (text: string) => void;
}

export const PatientFamilyTab: React.FC<PatientFamilyTabProps> = ({ onPlayTts }) => {
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);

  // Pre-loaded Family Members for Rajesh Kumar
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberItem[]>([
    {
      id: 'fam-1',
      name: 'Ramesh Kumar',
      relationship: 'Father',
      age: 72,
      gender: 'Male',
      bloodGroup: 'B+',
      abhaId: '91-1122-8877-4433',
      chronicConditions: ['Primary Hypertension', 'Coronary Artery Disease (CAD)'],
      status: 'Living • Under Treatment',
      emergencyContact: '+91 98111-22334',
      notes: 'Under regular cardiology follow-up at Apollo Hospital. On daily antihypertensive medications.'
    },
    {
      id: 'fam-2',
      name: 'Sunita Devi',
      relationship: 'Mother',
      age: 68,
      gender: 'Female',
      bloodGroup: 'O+',
      abhaId: '91-3344-9988-1122',
      chronicConditions: ['Type 2 Diabetes Mellitus', 'Bilateral Knee Osteoarthritis'],
      status: 'Living • Under Treatment',
      emergencyContact: '+91 98111-22335',
      notes: 'Managing blood glucose via oral hypoglycemic agents and diabetic diet.'
    },
    {
      id: 'fam-3',
      name: 'Priya Kumar',
      relationship: 'Spouse',
      age: 42,
      gender: 'Female',
      bloodGroup: 'A+',
      abhaId: '91-5566-2211-7788',
      chronicConditions: ['Hypothyroidism (Controlled)'],
      status: 'Living • Healthy',
      emergencyContact: '+91 98765-43210',
      notes: 'Primary emergency contact person. On daily morning Levothyroxine 50mcg.'
    },
    {
      id: 'fam-4',
      name: 'Aarav Kumar',
      relationship: 'Son',
      age: 14,
      gender: 'Male',
      bloodGroup: 'B+',
      abhaId: '91-7788-4433-9900',
      chronicConditions: ['Mild Seasonal Asthma (Vata-Kapha Pratishyaya)'],
      status: 'Living • Healthy',
      emergencyContact: '+91 98765-43210',
      notes: 'Student. Mild wheezing during severe winter smog; uses SOS Salbutamol inhaler as needed.'
    }
  ]);

  const handleAddMember = (member: FamilyMemberItem) => {
    setFamilyMembers((prev) => [member, ...prev]);
  };

  const handleDeleteMember = (id: string) => {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6 w-full">
      <AddFamilyMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onAdd={handleAddMember}
      />

      {/* ─── SECTION 1: Family Members & Hereditary Health Registry ─── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xl space-y-5 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-rose-600" />
              <span><T text="Family Members & ABDM Health Registry" /></span>
            </h3>
            <p className="text-sm text-slate-600 font-medium mt-0.5">
              <T text="Linked family records, ABDM Health IDs, chronic illnesses, and emergency contacts." />
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() =>
                onPlayTts(
                  `Registered family members: ${familyMembers
                    .map((m) => `${m.relationship} ${m.name}, conditions: ${m.chronicConditions.join(', ')}`)
                    .join('. ')}`
                )
              }
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span><T text="Listen Family Details" /> 🔊</span>
            </button>

            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span><T text="Add Family Member" /></span>
            </button>
          </div>
        </div>

        {/* Family Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/80 hover:bg-white hover:border-rose-400 transition-all shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-lg font-bold text-xs bg-rose-100 text-rose-900 border border-rose-300">
                    {member.relationship}
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-200 text-slate-800 rounded-md">
                    {member.bloodGroup}
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-slate-900 text-base leading-snug">{member.name}</h4>
                  <div className="text-xs text-slate-600 font-semibold mt-0.5">
                    {member.age} Yrs • {member.gender}
                  </div>
                </div>

                {member.abhaId && (
                  <div className="p-2 bg-teal-50 border border-teal-300 rounded-xl flex items-center gap-2 text-xs text-teal-950 font-mono font-semibold">
                    <QrCode className="w-4 h-4 text-teal-700 shrink-0" />
                    <span className="truncate">{member.abhaId}</span>
                  </div>
                )}

                {/* Chronic Conditions */}
                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-bold text-slate-600 block">
                    <T text="Chronic / Hereditary Illnesses" />:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {member.chronicConditions.map((cond, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2.5 py-1 bg-amber-50 text-amber-950 border border-amber-300 rounded-lg text-xs font-semibold"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200">
                  {member.notes}
                </p>

                {member.emergencyContact && (
                  <div className="text-xs text-slate-700 flex items-center gap-1.5 font-mono font-bold pt-1">
                    <Phone className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>{member.emergencyContact}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() =>
                    onPlayTts(
                      `${member.relationship} ${member.name}, ${member.age} years old. Chronic conditions: ${member.chronicConditions.join(', ')}. Notes: ${member.notes}`
                    )
                  }
                  className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-rose-800 rounded-xl flex items-center gap-1.5 font-bold text-xs cursor-pointer border border-slate-300"
                  title="Listen with TTS"
                >
                  <Volume2 className="w-4 h-4 text-rose-600" />
                  <span>Listen 🔊</span>
                </button>

                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 cursor-pointer"
                  title="Remove Family Member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SECTION 2: MedGemma AI Hereditary Risk Assessment Matrix ─── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xl space-y-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                <T text="MedGemma AI Hereditary Genetic Risk Synthesis" />
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                <T text="AI-calculated hereditary susceptibility based on first-degree relative conditions." />
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 bg-purple-100 text-purple-900 rounded-full border border-purple-300">
            MedGemma 1.5 Synthesis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {/* Risk 1 */}
          <div className="p-5 rounded-2xl border-2 border-red-300 bg-red-50/70 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-red-950 text-base flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  <T text="Cardiovascular Risk" />
                </span>
                <span className="px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-black shadow-xs">
                  MODERATE
                </span>
              </div>
              <p className="text-red-950 leading-relaxed font-medium">
                Paternal history of Coronary Artery Disease & Hypertension. Annual lipid profile, ECG, and blood pressure monitoring advised.
              </p>
            </div>
            <div className="text-xs text-red-900 font-mono font-bold pt-2 border-t border-red-200">
              Source: Father (Ramesh Kumar)
            </div>
          </div>

          {/* Risk 2 */}
          <div className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/70 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-950 text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-600" />
                  <T text="Endocrine / Diabetes Risk" />
                </span>
                <span className="px-2.5 py-1 bg-amber-600 text-white rounded-md text-xs font-black shadow-xs">
                  ELEVATED
                </span>
              </div>
              <p className="text-amber-950 leading-relaxed font-medium">
                Maternal history of Type 2 Diabetes Mellitus. Patient's current HbA1c is 6.2% (Pre-diabetic); low-glycemic diet recommended.
              </p>
            </div>
            <div className="text-xs text-amber-900 font-mono font-bold pt-2 border-t border-amber-200">
              Source: Mother (Sunita Devi)
            </div>
          </div>

          {/* Risk 3 */}
          <div className="p-5 rounded-2xl border-2 border-teal-300 bg-teal-50/70 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-teal-950 text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-teal-600" />
                  <T text="Ayush Tridosha Vulnerability" />
                </span>
                <span className="px-2.5 py-1 bg-teal-700 text-white rounded-md text-xs font-black shadow-xs">
                  PITTA-VRIDDHI
                </span>
              </div>
              <p className="text-teal-950 leading-relaxed font-medium">
                Familial Pitta-dominant Agni imbalance resulting in Amlapitta (Hyperacidity). Avipattikar Churna and seasonal Virechana advised.
              </p>
            </div>
            <div className="text-xs text-teal-900 font-mono font-bold pt-2 border-t border-teal-200">
              Protocol: Ministry of Ayush
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
