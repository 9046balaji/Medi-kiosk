import React from 'react';
import { FileSpreadsheet, Clock, Users, AlertTriangle, Download, X } from 'lucide-react';
import { T } from '../../../context/TranslationContext';

interface ShiftHandoffModalProps {
  onClose: () => void;
}

export const ShiftHandoffModal: React.FC<ShiftHandoffModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 animate-in zoom-in-95 duration-200 text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 border border-teal-300 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                <T text="Nursing Shift Handoff Report" />
              </h2>
              <div className="text-xs text-slate-500">
                Morning Shift (07:00 – 15:00 IST) • Triage Station A
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shift Summary Cards */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px]"><T text="Total Triaged Patients" /></span>
            <div className="font-bold text-slate-900 text-base">48 Patients</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px]"><T text="P1 Emergency Escalations" /></span>
            <div className="font-bold text-red-700 text-base">3 ER Escalated</div>
          </div>
        </div>

        {/* Watchlist */}
        <div className="space-y-2 text-xs">
          <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
            <T text="Critical Watchlist for Afternoon Shift" />
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 space-y-1">
            <div className="font-bold text-teal-900">MK-1042 — Rajesh Kumar (45M)</div>
            <div className="text-[11px] text-slate-500">P1 Cardiac Rule-Out • BP 128/82 • Transferred to Casualty ER</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <T text="Close" />
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-teal-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span><T text="Export Handoff PDF" /></span>
          </button>
        </div>

      </div>
    </div>
  );
};
