import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMediKiosk } from '../../context/MediKioskContext';
import { T } from '../../context/TranslationContext';
import {
  Monitor,
  Stethoscope,
  Activity,
  AlertTriangle,
  FileCode,
  Languages,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
  QrCode,
  FileText,
  UserCheck,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  Lock,
  X,
  Layers,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export const DevLauncher: React.FC<{ forceOpen?: boolean }> = ({ forceOpen = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = useMediKiosk();
  const [isOpen, setIsOpen] = useState(forceOpen || location.pathname === '/dev');

  const isDevRoute = location.pathname === '/dev';

  const screens = [
    {
      category: 'Patient Kiosk Flow (Screen 1–3)',
      color: 'border-teal-500/30 bg-teal-950/20 text-teal-300',
      badge: 'Bilingual Touch Interface',
      items: [
        {
          name: 'Screen 0A: Three.js 3D Welcome Animation Splash Screen',
          path: '/intro',
          desc: 'Clean 3D medical DNA hologram loader, audio chime, auto-transitions to main kiosk page'
        },
        {
          name: 'Screen 1A: Patient Registration & Language Selection',
          path: '/',
          desc: 'Primary touch registration screen, 22 Indian languages, Voice/Touch toggle, Emergency SOS'
        },
        {
          name: 'Screen 1B: ABHA Auth / Identity Verification',
          path: '/auth',
          desc: 'ABHA Number, Mobile OTP, Face Auth, Skip/Anonymous fallback'
        },
        {
          name: 'Screen 1C: ABHA QR Scanner',
          path: '/auth/scan',
          desc: 'Live camera optical QR scanner, ABDM mock scanning, automatic verification'
        },
        {
          name: 'Screen 1D: Returning Patient Profile',
          path: '/auth/returning',
          desc: 'Previous visit summary (14 May 2026), current medicines, quick intake'
        },
        {
          name: 'Screen 2A: Voice AI Intake (SOCRATES Allopathic)',
          path: '/intake',
          desc: 'Audio waveform, live ASR transcript + English translation, MedGemma brain'
        },
        {
          name: 'Screen 2B: Voice AI Intake (Dashavidha Ayush)',
          path: '/intake?mode=ayurvedic',
          desc: 'Ayush 10-fold Dashavidha intake (Prakriti, Vikriti, Agni, Sara, Satmya)'
        },
        {
          name: 'Screen 3A: Optical Document Scanner',
          path: '/scan',
          desc: 'Physical feed guide, scanning laser beam animation, capture & auto-crop'
        },
        {
          name: 'Screen 3B: OCR Drug & Lab Extraction Review',
          path: '/scan/results',
          desc: 'Extracted Rx entities, dosage confidence chips, lab reference ranges, verify/edit'
        },
        {
          name: 'Screen 3C: Printed Token Receipt & Next Steps',
          path: '/complete',
          desc: 'Token K-1042, OPD Counter routing, estimated wait time, SMS confirmation'
        }
      ]
    },
    {
      category: 'Clinical & Nursing Consoles (Screen 4–6)',
      color: 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300',
      badge: 'Deep Dark High-Density UI',
      items: [
        {
          name: 'Screen 4A: Nurse Triage Console & Live Patient Queue',
          path: '/nurse',
          desc: 'Priority tags (P1/P2/P3), Vitals check, Audio playback, Emergency ER rerouting'
        },
        {
          name: 'Screen 5A: Doctor Dashboard (Allopathic SOAP Mode)',
          path: '/doctor',
          desc: 'Pre-populated SOAP clinical note, OCR discrepancy alerts, drug interactions, Lock'
        },
        {
          name: 'Screen 5B: Doctor Dashboard (Ayush Vaidya Mode)',
          path: '/doctor?mode=ayurvedic',
          desc: '10 Dashavidha parameters, AI confidence scores, provenance drawer, Vaidya overrides'
        },
        {
          name: 'Screen 6A: ABDM FHIR R4 Bundle Export & DPDP Purge',
          path: '/export',
          desc: 'Valid HL7 FHIR Composition JSON, NRCES profile validator, ephemeral memory purge'
        }
      ]
    },
    {
      category: 'Hospital Administration & Telemetry',
      color: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-300',
      badge: 'Executive Analytics',
      items: [
        {
          name: 'Screen 7A: Admin Analytics & Kiosk Fleet Telemetry',
          path: '/admin',
          desc: 'Daily throughput charts, Ayush vs Allopathic split, Kiosk fleet health, DPDP logs'
        }
      ]
    },
    {
      category: 'System Failover & Offline Resiliency (Screen 8)',
      color: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
      badge: 'Network Failover',
      items: [
        {
          name: 'Screen 8A: Graceful Degraded Offline Mode',
          path: '/offline',
          desc: 'Network disconnect failover, CPU local model status, local queue fallback, Call Staff button'
        }
      ]
    }
  ];

  // Render content
  const content = (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl border-2 border-teal-500/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              SIH26047 Hackathon Demo Control Hub
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Ministry of Ayush
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-400" />
            <span>MediKiosk | Navigation Matrix & Judge Command Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Production-grade, bilingual AI Patient Intake & Clinical Triangulation System compliant with ABDM FHIR R4 & DPDP Act 2023.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              navigate('/');
              if (!isDevRoute) setIsOpen(false);
            }}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>Launch Kiosk (Screen 1)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              navigate('/doctor');
              if (!isDevRoute) setIsOpen(false);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Console</span>
          </button>
          {!isDevRoute && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              title="Close Judge Matrix"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Global State Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Active Session Patient State (Persisted in Context)</span>
            </h3>
            <button
              onClick={() => state.resetPatientSession?.()}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Demo Data</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-400 text-[10px] font-bold">Patient Name</div>
              <div className="font-bold text-slate-900 text-sm truncate">{state.patientName}</div>
              <div className="text-[10px] text-slate-500">45y, Male</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-400 text-[10px] font-bold">ABHA Health ID</div>
              <div className="font-mono font-bold text-teal-700 text-xs truncate">{state.abhaId || '91-4589-2041-9872'}</div>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified NDHM
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-400 text-[10px] font-bold">OPD Token / Kiosk</div>
              <div className="font-mono font-bold text-slate-900 text-sm">{state.opdToken}</div>
              <div className="text-[10px] text-slate-500">Kiosk 01 (Ayush OPD)</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-400 text-[10px] font-bold">Clinical Draft</div>
              <div className="font-bold text-emerald-700 text-xs">Editable (Unlocked)</div>
              <div className="text-[10px] text-slate-500">SOCRATES & Dashavidha</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-500">Quick Test Actions:</span>
            <button
              onClick={() => state.setMode(state.mode === 'ayurvedic' ? 'allopathic' : 'ayurvedic')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-mono font-bold transition-colors cursor-pointer"
            >
              Toggle Mode: <span className="text-teal-700">{state.mode}</span>
            </button>
            <button
              onClick={() => state.setLanguage(state.language === 'hindi' ? 'english' : 'hindi')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-mono font-bold transition-colors cursor-pointer"
            >
              Language: <span className="text-teal-700">{state.language}</span>
            </button>
            <button
              onClick={() => {
                navigate('/intake?redflag=true');
                if (!isDevRoute) setIsOpen(false);
              }}
              className="px-3 py-1 bg-red-100 border border-red-300 text-red-900 font-bold rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3 text-red-600" />
              <span>Simulate P1 Red Flag Alert (Screen 2C)</span>
            </button>
          </div>
        </div>

        {/* Technical Highlights */}
        <div className="p-5 bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Compliance & Tech Highlights</span>
          </h3>
          <ul className="text-xs space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span><strong>Bilingual ASR & TTS:</strong> AI4Bharat IndicConformer + Indic Parler-TTS across 22 Indic languages.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span><strong>Ayush + Allopathic Dual Triangulation:</strong> 8-part SOCRATES mapped to 10-fold Dashavidha Pariksha.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span><strong>FHIR R4 ABDM Bundles:</strong> Exportable to NDHM Health Locker with cryptographic signature.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-bold">•</span>
              <span><strong>DPDP Act 2023 Compliant:</strong> Zero-trace ephemeral storage with automatic patient session purge.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Screen Matrix Grids */}
      <div className="space-y-6">
        {screens.map((group, gIdx) => (
          <div key={gIdx} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">{group.category}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full border font-bold bg-teal-100 text-teal-800 border-teal-200">
                  {group.badge}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {group.items.map((item, iIdx) => (
                <div
                  key={iIdx}
                  onClick={() => {
                    navigate(item.path);
                    if (!isDevRoute) setIsOpen(false);
                  }}
                  className="p-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-teal-500 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-teal-700 group-hover:text-teal-800 font-bold">
                        {item.path}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // If we are directly on the /dev page
  if (isDevRoute) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {content}
        </div>
      </div>
    );
  }

  // Floating Discreet Judge Hub Pill (Fixed at bottom right)
  return (
    <>
      {/* Floating Trigger Pill */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-teal-300 hover:text-white border-2 border-teal-500/40 rounded-2xl shadow-2xl transition-all flex items-center gap-2 text-xs font-black cursor-pointer hover:scale-105"
        >
          <Layers className="w-4 h-4 text-teal-400" />
          <span>Judge Demo Hub ⚡</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Slide-Up Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-2 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-100 rounded-3xl border-2 border-slate-300 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                SIH26047 Judge & Developer Console
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
};
