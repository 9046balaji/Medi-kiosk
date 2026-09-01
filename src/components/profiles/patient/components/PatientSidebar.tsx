import React from 'react';
import { useMediKiosk } from '../../../../context/MediKioskContext';
import { T } from '../../../../context/TranslationContext';
import { Upload } from 'lucide-react';

interface NavMenuItem {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentType<any>;
  count?: number;
  color: string;
}

interface PatientSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  navMenuItems: NavMenuItem[];
  onOpenUploadModal: () => void;
}

export const PatientSidebar: React.FC<PatientSidebarProps> = ({
  activeTab,
  setActiveTab,
  navMenuItems,
  onOpenUploadModal
}) => {
  const state = useMediKiosk();

  return (
    <aside className="w-full lg:w-80 bg-white border-r-2 border-slate-200 shadow-lg flex flex-col justify-between shrink-0 p-5 sticky top-0 h-auto lg:h-[calc(100vh-65px)] z-20 overflow-y-auto">
      <div className="space-y-6">
        {/* Patient Profile Identification Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b-2 border-slate-200">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white font-black text-xl flex items-center justify-center shadow-md shadow-teal-700/20 shrink-0">
            RK
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-base text-slate-900 truncate">{state.patientName}</h3>
            <div className="text-xs text-teal-800 font-mono font-extrabold truncate">
              {state.abhaId || '91-4589-2041-9872'}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-0.5">
              {state.patientAge} Yrs • <T text={state.patientGender} /> • {state.patientBloodGroup}
            </div>
          </div>
        </div>

        {/* Navigation Menu List */}
        <nav className="space-y-2">
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                    : 'hover:bg-slate-100 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isActive ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-sm truncate"><T text={item.title} /></div>
                    <div className={`text-xs truncate font-medium ${isActive ? 'text-teal-100' : 'text-slate-500'}`}>
                      <T text={item.desc} />
                    </div>
                  </div>
                </div>

                {item.count !== undefined && (
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      isActive ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Action: ONLY Upload OCR Document Button */}
      <div className="pt-4 border-t-2 border-slate-200 mt-4">
        <button
          onClick={onOpenUploadModal}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg cursor-pointer transition-all active:scale-95"
        >
          <Upload className="w-5 h-5" />
          <span><T text="Upload OCR Documents" /></span>
        </button>
      </div>
    </aside>
  );
};
