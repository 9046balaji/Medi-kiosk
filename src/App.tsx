import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { MediKioskProvider } from './context/MediKioskContext';
import { TranslationProvider } from './context/TranslationContext';

// Layouts
import { KioskHeader } from './components/layout/KioskHeader';
import { Footer } from './components/layout/Footer';
import { ClinicalSidebar } from './components/layout/ClinicalSidebar';

// Common / Judge
import { DevLauncher } from './components/common/DevLauncher';

// Kiosk Flow Screens (from kiosk index barrel)
import {
  WelcomeAnimationScreen,
  KioskWelcomePage,
  WelcomeScreen,
  AbhaAuthScreen,
  QrScannerScreen,
  ReturningPatientScreen,
  IntakeScreen,
  DocScannerScreen,
  OcrResultsScreen,
  PatientReceiptScreen,
  DegradedModeScreen
} from './components/kiosk';

// Clinical Consoles (from clinical index barrel)
import {
  NurseConsoleScreen,
  DoctorDashboardScreen,
  FhirExportScreen
} from './components/clinical';

// Admin Telemetry
import { AdminDashboardScreen } from './components/admin/AdminDashboardScreen';

// User Profiles
import { PatientProfileScreen } from './components/profiles/patient/PatientProfileScreen';
import { DoctorProfileScreen } from './components/profiles/doctor/DoctorProfileScreen';
import { NurseProfileScreen } from './components/profiles/nurse/NurseProfileScreen';
import { AdminProfileScreen } from './components/profiles/admin/AdminProfileScreen';

// User Settings
import { PatientSettingsScreen } from './components/settings/patient/PatientSettingsScreen';
import { DoctorSettingsScreen } from './components/settings/doctor/DoctorSettingsScreen';
import { NurseSettingsScreen } from './components/settings/nurse/NurseSettingsScreen';
import { SystemSettingsScreen } from './components/settings/system/SystemSettingsScreen';

const isKioskRoute = (pathname: string) => {
  return [
    '/',
    '/intro',
    '/welcome',
    '/register',
    '/auth',
    '/auth/scan',
    '/scan/qr',
    '/auth/returning',
    '/returning',
    '/intake',
    '/scan',
    '/scan/results',
    '/complete',
    '/offline',
    '/profile/patient',
    '/locker',
    '/settings/patient'
  ].includes(pathname);
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isKiosk = isKioskRoute(location.pathname);

  if (location.pathname === '/intro') {
    return (
      <div className="min-h-screen bg-slate-950 text-white select-none">
        <main className="min-h-screen flex flex-col relative">
          {children}
        </main>
        <DevLauncher />
      </div>
    );
  }

  if (isKiosk) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
        {/* Top Kiosk Header */}
        <KioskHeader />

        {/* Full-width Kiosk Screen Container */}
        <main className="flex-1 flex flex-col relative">
          {children}
        </main>

        <Footer isDark={false} />
        <DevLauncher />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900 text-slate-100">
      {/* Clinical Sidebar for Healthcare Professionals */}
      <ClinicalSidebar />

      {/* Clinical Main View */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <KioskHeader />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        <Footer isDark={true} />
        <DevLauncher />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <MediKioskProvider>
      <TranslationProvider>
        <Router>
          <AppLayout>
            <Routes>
              {/* Dev Matrix for Judges */}
              <Route path="/dev" element={<DevLauncher />} />

              {/* Kiosk Screens (0A to 3C) */}
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/intro" element={<WelcomeAnimationScreen />} />
              <Route path="/register" element={<WelcomeScreen />} />
              <Route path="/auth" element={<AbhaAuthScreen />} />
              <Route path="/auth/scan" element={<QrScannerScreen />} />
              <Route path="/scan/qr" element={<QrScannerScreen />} />
              <Route path="/auth/returning" element={<ReturningPatientScreen />} />
              <Route path="/returning" element={<ReturningPatientScreen />} />
              <Route path="/intake" element={<IntakeScreen />} />
              <Route path="/scan" element={<DocScannerScreen />} />
              <Route path="/scan/results" element={<OcrResultsScreen />} />
              <Route path="/complete" element={<PatientReceiptScreen />} />
              <Route path="/offline" element={<DegradedModeScreen />} />
              <Route path="/locker" element={<PatientProfileScreen />} />

              {/* Clinical Screens (4A to 6A) */}
              <Route path="/nurse" element={<NurseConsoleScreen />} />
              <Route path="/doctor" element={<DoctorDashboardScreen />} />
              <Route path="/export" element={<FhirExportScreen />} />

              {/* Admin Telemetry (7A) */}
              <Route path="/admin" element={<AdminDashboardScreen />} />

              {/* Modular User Profiles */}
              <Route path="/profile/patient" element={<PatientProfileScreen />} />
              <Route path="/profile/doctor" element={<DoctorProfileScreen />} />
              <Route path="/profile/nurse" element={<NurseProfileScreen />} />
              <Route path="/profile/admin" element={<AdminProfileScreen />} />

              {/* Modular User Settings */}
              <Route path="/settings/patient" element={<PatientSettingsScreen />} />
              <Route path="/settings/doctor" element={<DoctorSettingsScreen />} />
              <Route path="/settings/nurse" element={<NurseSettingsScreen />} />
              <Route path="/settings/system" element={<SystemSettingsScreen />} />

              {/* Fallback */}
              <Route path="*" element={<WelcomeScreen />} />
            </Routes>
          </AppLayout>
        </Router>
      </TranslationProvider>
    </MediKioskProvider>
  );
}
