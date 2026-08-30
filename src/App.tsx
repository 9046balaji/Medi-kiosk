import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-900">
      {/* Permanent Fixed Left Side Menu Bar */}
      <ClinicalSidebar />
      
      {/* Main Content View Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with 22-Language IndicTrans2 Selector Present on EVERY Page */}
        <KioskHeader />
        
        <main className="flex-1">
          {children}
        </main>
        
        <Footer isDark={false} />
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

              {/* Kiosk Screens (1A to 3C) */}
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/auth" element={<AbhaAuthScreen />} />
              <Route path="/auth/scan" element={<QrScannerScreen />} />
              <Route path="/auth/returning" element={<ReturningPatientScreen />} />
              <Route path="/intake" element={<IntakeScreen />} />
              <Route path="/scan" element={<DocScannerScreen />} />
              <Route path="/scan/results" element={<OcrResultsScreen />} />
              <Route path="/complete" element={<PatientReceiptScreen />} />
              <Route path="/offline" element={<DegradedModeScreen />} />

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
