import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import {
  Printer,
  QrCode,
  CheckCircle2,
  Clock,
  Building2,
  User,
  Phone,
  Home,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const PatientReceiptScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-300 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            <T text="Intake Complete & Token Slip Printed!" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            <T text="Please proceed to the assigned OPD consultation room displayed below." />
          </p>
        </div>

        {/* Printed OPD Slip Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-2xl space-y-6 relative overflow-hidden">
          
          <div className="text-center pb-4 border-b border-slate-100 space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-800">
              <T text="All India Institute of Ayurveda & OPD Center" />
            </div>
            <div className="text-4xl font-black tracking-wider text-slate-900 font-mono">
              TOKEN: {state.opdToken}
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Timestamp: {new Date().toLocaleTimeString()} • Kiosk #01
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[10px]"><T text="Patient Name" /></span>
              <div className="font-bold text-slate-900 text-sm">{state.patientName}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[10px]"><T text="Assigned Room" /></span>
              <div className="font-bold text-teal-800 text-sm"><T text="Room 104 (Ayush OPD)" /></div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[10px]"><T text="Attending Doctor" /></span>
              <div className="font-bold text-slate-900 text-sm"><T text="Dr. Arvind Sharma" /></div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-500 text-[10px]"><T text="Estimated Wait" /></span>
              <div className="font-bold text-amber-700 text-sm"><T text="~4 Minutes (1st Next)" /></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-teal-50 rounded-2xl border border-teal-200 text-xs text-teal-900 font-medium">
            <span><T text="SMS Confirmation sent to +91 98765-XXXXX" /></span>
            <span className="font-bold font-mono">DELIVERED</span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handlePrintReceipt}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <T text="Print Slip" />
            </button>

            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-teal-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <T text="Done / Return to Start" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
