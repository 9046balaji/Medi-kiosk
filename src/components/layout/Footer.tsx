import React from 'react';
import { ShieldCheck, HeartHandshake, PhoneCall, Lock, Sparkles } from 'lucide-react';
import { T } from '../../context/TranslationContext';

export const Footer: React.FC<{ isDark?: boolean }> = ({ isDark = false }) => {
  return (
    <footer
      className={`border-t py-4 px-4 sm:px-6 transition-colors text-xs ${
        isDark
          ? 'bg-slate-950 border-slate-800/80 text-slate-400'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        
        {/* Left: Ministry & ABDM Compliance */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <div className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span><T text="DPDP Act 2023 Compliant" /></span>
          </div>
          <span className="opacity-40">•</span>
          <span><T text="Ayushman Bharat Digital Mission (ABDM) Level-3 Certified" /></span>
          <span className="opacity-40">•</span>
          <span><T text="Ministry of Ayush (SIH26047)" /></span>
        </div>

        {/* Right: Emergency Helpline numbers & Ephemeral security guarantee */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 font-medium">
          <div className="flex items-center gap-1 text-amber-500">
            <Lock className="w-3.5 h-3.5" />
            <span><T text="Zero-Retention Ephemeral Storage" /></span>
          </div>
          <span className="opacity-40">•</span>
          <div className="flex items-center gap-1">
            <PhoneCall className="w-3.5 h-3.5 text-red-500" />
            <span><T text="Medical Helpline: 108 / 104" /></span>
          </div>
        </div>

      </div>
    </footer>
  );
};
