import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMediKiosk } from '../../context/MediKioskContext';
import { T } from '../../context/TranslationContext';
import {
  Stethoscope,
  Users,
  Activity,
  FileCode,
  BarChart3,
  Compass,
  Lock,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Monitor,
  UserCheck,
  Mic,
  Scan,
  FileText,
  CheckCircle2,
  Home,
  User,
  ShieldCheck,
  Settings
} from 'lucide-react';

export const ClinicalSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    mode,
    patientQueue,
    isDraftLocked,
    opdToken,
    patientName,
    abhaId
  } = useMediKiosk();

  const isAyurvedic = location.search.includes('mode=ayurvedic') || mode === 'ayurvedic';
  const p1Count = patientQueue.filter((p) => p.priority === 'P1').length;

  const kioskItems = [
    {
      label: 'Welcome Kiosk',
      path: '/',
      icon: Home,
      active: location.pathname === '/'
    },
    {
      label: 'ABHA Auth',
      path: '/auth',
      icon: ShieldCheck,
      active: location.pathname === '/auth' || location.pathname === '/auth/scan'
    },
    {
      label: 'Voice AI Intake',
      path: '/intake',
      icon: Mic,
      active: location.pathname === '/intake'
    },
    {
      label: 'Document Scanner',
      path: '/scan',
      icon: Scan,
      active: location.pathname === '/scan'
    },
    {
      label: 'OCR Review',
      path: '/scan/results',
      icon: FileText,
      active: location.pathname === '/scan/results'
    },
    {
      label: 'Token Receipt',
      path: '/complete',
      icon: CheckCircle2,
      active: location.pathname === '/complete'
    }
  ];

  const clinicalItems = [
    {
      label: 'Nurse Triage',
      path: '/nurse',
      icon: Users,
      badge: p1Count > 0 ? `${p1Count} P1` : null,
      badgeColor: 'bg-red-600 text-white animate-pulse',
      active: location.pathname === '/nurse'
    },
    {
      label: 'Allopathic SOAP',
      path: '/doctor',
      icon: Activity,
      active: location.pathname === '/doctor' && !isAyurvedic
    },
    {
      label: 'Vaidya Dashavidha',
      path: '/doctor?mode=ayurvedic',
      icon: Sparkles,
      iconColor: 'text-amber-500',
      active: location.pathname === '/doctor' && isAyurvedic
    },
    {
      label: 'FHIR R4 Export',
      path: '/export',
      icon: FileCode,
      active: location.pathname === '/export'
    },
    {
      label: 'Analytics Telemetry',
      path: '/admin',
      icon: BarChart3,
      active: location.pathname === '/admin'
    },
    {
      label: 'Judge Matrix',
      path: '/dev',
      icon: Compass,
      active: location.pathname === '/dev'
    }
  ];

  const profileItems = [
    {
      label: 'Patient Profile',
      path: '/profile/patient',
      icon: User,
      active: location.pathname.startsWith('/profile/patient') || location.pathname.startsWith('/settings/patient')
    },
    {
      label: 'Doctor Profile',
      path: '/profile/doctor',
      icon: Stethoscope,
      active: location.pathname.startsWith('/profile/doctor') || location.pathname.startsWith('/settings/doctor')
    },
    {
      label: 'Nurse Profile',
      path: '/profile/nurse',
      icon: Users,
      active: location.pathname.startsWith('/profile/nurse') || location.pathname.startsWith('/settings/nurse')
    },
    {
      label: 'Admin Profile',
      path: '/profile/admin',
      icon: ShieldCheck,
      active: location.pathname.startsWith('/profile/admin') || location.pathname.startsWith('/settings/system')
    }
  ];

  return (
    <>
      {/* Mobile Top Header Toggle Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/doctor')}>
          <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm">
              MediKiosk <span className="text-teal-700"><T text="Clinical Menu" /></span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span><T text="Menu" /></span>
        </button>
      </div>

      {/* Overlay backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Navigation Panel */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-slate-200 flex flex-col justify-between p-3 transition-all duration-200 ease-in-out shadow-lg lg:shadow-none ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Header & Branding */}
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
          <div className="flex items-center justify-between px-1">
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => {
                navigate('/doctor');
                setMobileOpen(false);
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-md shadow-teal-700/20 text-white font-bold shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>

              {!isCollapsed && (
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 text-base tracking-tight group-hover:text-teal-700 transition-colors">
                      MediKiosk
                    </span>
                    <span className="px-1.5 py-0.2 text-[10px] font-mono bg-teal-100 text-teal-900 border border-teal-200 rounded font-bold">
                      v2.4
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium leading-tight">
                    <T text="Clinical Suite ABDM" />
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Side Menu Collapse / Close Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Side Menu Bar' : 'Close / Collapse Side Menu Bar'}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section 1: Clinical Consoles */}
          <nav className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1">
                <T text="Clinical Consoles" />
              </div>
            )}
            {clinicalItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  title={item.label}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center' : 'justify-between'
                  } ${
                    item.active
                      ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-white' : item.iconColor || 'text-slate-500'}`} />
                    {!isCollapsed && <span><T text={item.label} /></span>}
                  </div>

                  {!isCollapsed && (
                    item.badge ? (
                      <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 opacity-40 ${item.active ? 'opacity-100 text-white' : ''}`} />
                    )
                  )}
                </button>
              );
            })}
          </nav>

          {/* Section 2: Kiosk Patient Flow */}
          <nav className="space-y-1 pt-2 border-t border-slate-100">
            {!isCollapsed && (
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1">
                <T text="Kiosk Patient Flow" />
              </div>
            )}
            {kioskItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  title={item.label}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center' : 'justify-between'
                  } ${
                    item.active
                      ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-white' : 'text-slate-500'}`} />
                    {!isCollapsed && <span><T text={item.label} /></span>}
                  </div>

                  {!isCollapsed && (
                    <ChevronRight className={`w-3.5 h-3.5 opacity-40 ${item.active ? 'opacity-100 text-white' : ''}`} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Section 3: Profiles & Settings */}
          <nav className="space-y-1 pt-2 border-t border-slate-100">
            {!isCollapsed && (
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1">
                <T text="User Profiles & Settings" />
              </div>
            )}
            {profileItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  title={item.label}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center transition-all cursor-pointer ${
                    isCollapsed ? 'justify-center' : 'justify-between'
                  } ${
                    item.active
                      ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-white' : 'text-slate-500'}`} />
                    {!isCollapsed && <span><T text={item.label} /></span>}
                  </div>

                  {!isCollapsed && (
                    <ChevronRight className={`w-3.5 h-3.5 opacity-40 ${item.active ? 'opacity-100 text-white' : ''}`} />
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Bottom Section: Active Patient Widget & Clinician Profile */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          
          {/* Active Patient Widget */}
          {!isCollapsed ? (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <T text="Active Session" />
                </span>
                <span className="font-mono text-teal-800">{opdToken}</span>
              </div>
              <div className="text-xs font-extrabold text-slate-900 truncate">
                {patientName}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>{abhaId ? <T text="ABHA Verified" /> : <T text="Walk-in" />}</span>
                {isDraftLocked && (
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> <T text="Signed" />
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-2 bg-teal-50 border border-teal-200 rounded-xl text-center font-mono font-bold text-[10px] text-teal-900" title={`Current Patient: ${patientName} (${opdToken})`}>
              {opdToken}
            </div>
          )}

          {/* Clinician Profile Footer */}
          <div
            onClick={() => navigate('/profile/doctor')}
            className={`p-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 flex items-center cursor-pointer transition-colors ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}
          >
            <div className="w-9 h-9 rounded-xl bg-teal-100 border border-teal-300 text-teal-900 text-xs font-extrabold flex items-center justify-center shrink-0" title="Dr. Arvind Sharma">
              DR
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-bold text-slate-900 truncate">Dr. Arvind Sharma</div>
                <div className="text-[10px] text-slate-500 truncate">#NDHM-8842 • Ayush OPD</div>
              </div>
            )}
          </div>

        </div>
      </aside>
    </>
  );
};
