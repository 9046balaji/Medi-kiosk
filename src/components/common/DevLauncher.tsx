import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Lock
} from 'lucide-react';

export const DevLauncher: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  const screens = [
    {
      category: 'Patient Kiosk Flow (Screen 1–3)',
      color: 'border-teal-500/30 bg-teal-950/20 text-teal-300',
      badge: 'Bilingual Touch Interface',
      items: [
        {
          name: 'Screen 1A: Kiosk Welcome / Language Selection',
          path: '/',
          desc: 'Primary touch screen, 6 Indian languages, Voice/Touch toggle, Emergency SOS'
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
          desc: 'Audio waveform, live ASR Hindi transcript + English translation, 8-step SOCRATES'
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
      color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
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
      color: 'border-amber-500/30 bg-amber-950/20 text-amber-800',
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border-2 border-slate-200 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200 rounded-full flex items-center gap-1.5 font-bold">
                <Award className="w-3.5 h-3.5 text-teal-700" />
                <T text="SIH26047 Hackathon Demo Control Hub" />
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold">
                <T text="Ministry of Ayush" />
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              MediKiosk <span className="text-teal-700 font-semibold text-xl md:text-2xl">| <T text="Navigation Matrix & Judge Command Center" /></span>
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-3xl">
              <T text="Production-grade, bilingual AI Patient Intake & Clinical Triangulation System compliant with ABDM FHIR R4 & DPDP Act 2023." />
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10">
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-teal-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Monitor className="w-4 h-4" />
              <T text="Launch Kiosk (Screen 1)" />
            </button>
            <button
              onClick={() => navigate('/doctor')}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-teal-300 text-sm font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Stethoscope className="w-4 h-4 text-teal-400" />
              <T text="Doctor Console" />
            </button>
          </div>
        </div>

        {/* Live Patient Quick Profile & Simulation Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-5 bg-white border-2 border-slate-200 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-700" />
                <T text="Active Session Patient State (Persisted in Context)" />
              </h3>
              <button
                onClick={state.resetPatientSession}
                className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 text-teal-800 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer font-bold"
              >
                <RefreshCw className="w-3 h-3" />
                <T text="Reset Demo Data" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500"><T text="Patient Name" /></div>
                <div className="text-sm font-bold text-slate-900 truncate">{state.patientName}</div>
                <div className="text-xs text-slate-600">{state.patientAge}y, {state.patientGender}</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500"><T text="ABHA Health ID" /></div>
                <div className="text-sm font-mono text-teal-800 font-bold truncate">{state.abhaId || 'Anonymous'}</div>
                <div className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> <T text="Verified NDHM" />
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500"><T text="OPD Token / Kiosk" /></div>
                <div className="text-sm font-bold text-amber-800">{state.opdToken}</div>
                <div className="text-xs text-slate-600"><T text="Kiosk 01 (Ayush OPD)" /></div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500"><T text="Clinical Draft" /></div>
                <div className="text-sm font-semibold text-slate-900">
                  {state.isDraftLocked ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> <T text="Locked & Signed" /></span>
                  ) : (
                    <span className="text-amber-800 font-bold"><T text="Editable (Unlocked)" /></span>
                  )}
                </div>
                <div className="text-xs text-slate-600">SOCRATES & Dashavidha</div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-600 font-bold"><T text="Quick Test Actions:" /></span>
              <button
                onClick={() => state.setMode(state.mode === 'allopathic' ? 'ayurvedic' : 'allopathic')}
                className="text-xs px-3 py-1.5 bg-teal-100 border border-teal-300 text-teal-900 font-bold rounded-lg hover:bg-teal-200 transition-colors cursor-pointer"
              >
                <T text="Toggle Mode:" /> <span className="font-extrabold uppercase text-teal-800">{state.mode}</span>
              </button>
              <button
                onClick={() => state.setLanguage(state.language === 'hindi' ? 'english' : 'hindi')}
                className="text-xs px-3 py-1.5 bg-indigo-100 border border-indigo-300 text-indigo-900 font-bold rounded-lg hover:bg-indigo-200 transition-colors cursor-pointer"
              >
                <T text="Language:" /> <span className="font-extrabold uppercase text-indigo-800">{state.language}</span>
              </button>
              <button
                onClick={() => {
                  state.triggerRedFlag({
                    keyword: 'Acute Chest Compression',
                    severity: 'P1',
                    timestamp: new Date().toLocaleTimeString(),
                    description: 'Simulated cardiac red-flag trigger from Dev Panel.'
                  });
                  navigate('/intake?redflag=true');
                }}
                className="text-xs px-3 py-1.5 bg-red-100 border border-red-300 text-red-900 font-bold rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <AlertTriangle className="w-3 h-3 text-red-600" />
                <T text="Simulate P1 Red Flag Alert (Screen 2C)" />
              </button>
            </div>
          </div>

          {/* Quick Technical Specs for Judges */}
          <div className="p-5 bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <T text="Compliance & Tech Highlights" />
            </h3>
            <ul className="text-xs space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong><T text="Bilingual ASR & TTS:" /></strong> <T text="Hindi primary with real-time English clinical translation." /></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong><T text="Ayush + Allopathic Dual Triangulation:" /></strong> <T text="8-part SOCRATES mapped to 10-fold Dashavidha Pariksha." /></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong><T text="FHIR R4 ABDM Bundles:" /></strong> <T text="Exportable to NDHM Health Locker with cryptographic signature." /></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span><strong><T text="DPDP Act 2023 Compliant:" /></strong> <T text="Zero-trace ephemeral storage with automatic patient session purge." /></span>
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
                  <h2 className="text-lg font-extrabold text-slate-900"><T text={group.category} /></h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full border font-bold bg-teal-100 text-teal-800 border-teal-200">
                    <T text={group.badge} />
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    onClick={() => navigate(item.path)}
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
                        <T text={item.name} />
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        <T text={item.desc} />
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
