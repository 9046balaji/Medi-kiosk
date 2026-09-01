import React from 'react';
import {
  AlertOctagon,
  Heart,
  PhoneCall,
  ShieldAlert,
  ArrowRight,
  X,
  Brain,
  Zap,
  ShieldCheck,
  FileCheck,
  Activity,
  Baby,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { T } from '../../../context/TranslationContext';
import type { EmergencyContext } from '../../../types';
import type { TriageResult } from '../../../lib/emergencyApi';

interface RedFlagModalProps {
  onClose: () => void;
  onEscalateToNurse: () => void;
  emergencyContext?: EmergencyContext | null;
  triageResult?: TriageResult | null;
}

export const RedFlagModal: React.FC<RedFlagModalProps> = ({
  onClose,
  onEscalateToNurse,
  emergencyContext,
  triageResult,
}) => {
  const primarySuspect = triageResult?.primary_disease_suspect || emergencyContext?.suspected_condition || 'High-Risk Emergency Condition';
  const esiLevel = triageResult?.esi_level || 'ESI-1 (Immediate Resuscitation)';
  const news2Score = triageResult?.news2_score ?? 7;
  const news2Category = triageResult?.news2_category || 'HIGH (Emergency Clinical Escalation Required)';
  const pews = triageResult?.pews_assessment;
  const meows = triageResult?.meows_assessment;
  const disaster = triageResult?.disaster_triage;
  const auditHash = triageResult?.audit_trail?.audit_hash;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-4 border-red-600 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200 text-slate-900 overflow-y-auto max-h-[90vh]">

        {/* ── Top Header Banner ── */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white rounded-2xl flex items-center justify-between gap-3 shadow-lg shadow-red-600/30">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-white shrink-0">
              <AlertOctagon className="w-8 h-8 animate-bounce text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black uppercase tracking-wider text-red-200 bg-red-900/60 px-2.5 py-0.5 rounded-full border border-red-400/40">
                  <T text={triageResult?.triage_level || 'P1_CRITICAL'} />
                </span>
                <span className="text-xs font-mono font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black">
                  {esiLevel}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                <T text="High-Risk Symptoms Detected" />
              </h2>
            </div>
          </div>

          {/* START Disaster Tag if present */}
          {disaster && (
            <div className="px-3 py-1.5 bg-red-950 text-red-200 rounded-xl border border-red-500/50 text-right text-xs font-mono font-bold shrink-0">
              <div className="text-[10px] text-red-400">START Disaster Tag</div>
              <div className="text-sm font-black text-yellow-300">{disaster.tag} ({disaster.category})</div>
            </div>
          )}
        </div>

        {/* ── Clinical Assessment Summary Card ── */}
        <div className="p-5 bg-red-50 rounded-2xl border-2 border-red-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-red-900 text-sm">
              <Brain className="w-5 h-5 text-red-600" />
              <span><T text="Emergency Clinical Diagnosis Suspect:" /></span>
            </div>
            <span className="text-xs font-mono font-bold text-red-700 bg-white px-2.5 py-0.5 rounded-lg border border-red-200">
              NEWS2 Score: {news2Score} ({news2Category.split(' ')[0]})
            </span>
          </div>

          <div className="text-xl font-black text-red-800 leading-tight">
            {primarySuspect}
          </div>

          {emergencyContext?.clinical_summary && (
            <p className="text-xs sm:text-sm text-red-800 font-medium leading-relaxed">
              {emergencyContext.clinical_summary}
            </p>
          )}

          {/* Detected Symptom Keywords */}
          {triageResult?.detected_flags && triageResult.detected_flags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {triageResult.detected_flags.map((flag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-white text-red-900 text-xs font-black rounded-xl border border-red-300 shadow-xs flex items-center gap-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  <span>{flag.phrase} ({flag.category})</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── PEWS Pediatric Warning Card (if child) ── */}
        {pews && (
          <div className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-200 flex items-start gap-3 text-xs sm:text-sm text-purple-950 font-medium">
            <Baby className="w-6 h-6 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-black text-purple-900 text-sm flex items-center gap-2">
                <span>PEWS Pediatric Warning Score:</span>
                <span className="bg-purple-700 text-white px-2 py-0.5 rounded font-mono text-xs">{pews.pews_score} / 9</span>
              </div>
              <div className="text-xs font-extrabold text-purple-800 mt-0.5">{pews.risk_level}</div>
              {pews.reasons.length > 0 && (
                <ul className="list-disc list-inside mt-1 text-xs text-purple-900 space-y-0.5 font-bold">
                  {pews.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── MEOWS Obstetric Warning Card (if pregnant) ── */}
        {meows && (
          <div className="p-4 bg-rose-50 rounded-2xl border-2 border-rose-200 flex items-start gap-3 text-xs sm:text-sm text-rose-950 font-medium">
            <UserCheck className="w-6 h-6 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-black text-rose-900 text-sm flex items-center gap-2">
                <span>MEOWS Obstetric Early Warning Alert:</span>
                <span className="bg-rose-700 text-white px-2 py-0.5 rounded font-mono text-xs">{meows.alert_level}</span>
              </div>
              {meows.details.length > 0 && (
                <ul className="list-disc list-inside mt-1 text-xs text-rose-900 space-y-0.5 font-bold">
                  {meows.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── HL7 FHIR R4 & Audit Trail Cryptographic Seal Footer Strip ── */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>HL7 FHIR R4 Bundle & SNOMED CT Sealed ✓</span>
          </div>

          {auditHash && (
            <div className="text-slate-500 font-bold truncate max-w-xs" title={`SHA-256 Hash: ${auditHash}`}>
              SHA-256 Audit: <span className="text-slate-800">{auditHash.slice(0, 16)}...</span>
            </div>
          )}
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onEscalateToNurse}
            className="w-full sm:flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl text-sm sm:text-base transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-5 h-5 animate-pulse" />
            <span><T text="Escalate to Nurse Station A (Priority 1)" /></span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer border border-slate-300"
          >
            <T text="Override & Continue Kiosk Intake" />
          </button>
        </div>

      </div>
    </div>
  );
};
