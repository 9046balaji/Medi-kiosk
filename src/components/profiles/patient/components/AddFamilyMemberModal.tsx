import React, { useState } from 'react';
import { T } from '../../../../context/TranslationContext';
import { FamilyMemberItem } from './types';
import { Users, X } from 'lucide-react';

interface AddFamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (member: FamilyMemberItem) => void;
}

export const AddFamilyMemberModal: React.FC<AddFamilyMemberModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState<string>('');
  const [relationship, setRelationship] = useState<FamilyMemberItem['relationship']>('Father');
  const [age, setAge] = useState<number>(65);
  const [gender, setGender] = useState<FamilyMemberItem['gender']>('Male');
  const [bloodGroup, setBloodGroup] = useState<string>('B+');
  const [abhaId, setAbhaId] = useState<string>('');
  const [chronicConditionsText, setChronicConditionsText] = useState<string>('Hypertension, Diabetes');
  const [status, setStatus] = useState<FamilyMemberItem['status']>('Living • Under Treatment');
  const [emergencyContact, setEmergencyContact] = useState<string>('+91 98765-43210');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;

    const conditionsArray = chronicConditionsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    onAdd({
      id: `fam-${Date.now()}`,
      name: name.trim(),
      relationship,
      age: Number(age) || 50,
      gender,
      bloodGroup: bloodGroup.trim() || 'O+',
      abhaId: abhaId.trim() || undefined,
      chronicConditions: conditionsArray.length > 0 ? conditionsArray : ['No known chronic illness'],
      status,
      emergencyContact: emergencyContact.trim() || undefined,
      notes: notes.trim() || 'Family member registered by patient'
    });

    setName('');
    setNotes('');
    setAbhaId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900"><T text="Add Family Member & Health Details" /></h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium"><T text="Register family hereditary conditions and emergency contact info." /></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Full Name" /></label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-2xl font-medium outline-none focus:ring-2 ring-rose-500 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Relationship" /></label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-2xl font-bold outline-none bg-white cursor-pointer text-sm sm:text-base"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Spouse">Spouse</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Grandfather">Grandfather</option>
                <option value="Grandmother">Grandmother</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Age" /></label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-bold outline-none text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Gender" /></label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-bold outline-none bg-white cursor-pointer text-sm sm:text-base"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Blood Group" /></label>
              <input
                type="text"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-black outline-none text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1.5"><T text="ABHA ID (Optional)" /></label>
              <input
                type="text"
                placeholder="e.g. 91-1122-3344-5566"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-mono font-bold outline-none text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Health Status" /></label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-bold outline-none bg-white cursor-pointer text-sm sm:text-base"
              >
                <option value="Living • Under Treatment">Living • Under Treatment</option>
                <option value="Living • Healthy">Living • Healthy</option>
                <option value="Deceased">Deceased</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Known Hereditary & Chronic Diseases (Comma separated)" /></label>
            <input
              type="text"
              placeholder="e.g. Hypertension, Coronary Artery Disease, Diabetes, Asthma..."
              value={chronicConditionsText}
              onChange={(e) => setChronicConditionsText(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-medium outline-none text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Emergency Phone Number" /></label>
            <input
              type="text"
              placeholder="+91 98765-43210"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-mono font-bold outline-none text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Doctor Remarks / Hereditary Notes" /></label>
            <textarea
              rows={2}
              placeholder="e.g. Under active medication for cardiac care; familial predisposition..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-medium outline-none text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl text-sm cursor-pointer"
          >
            <T text="Cancel" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-7 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-sm shadow-md cursor-pointer disabled:opacity-50 transition-all"
          >
            <T text="Save Family Member" />
          </button>
        </div>
      </div>
    </div>
  );
};
