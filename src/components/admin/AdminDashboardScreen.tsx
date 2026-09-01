import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, T } from '../../context/TranslationContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  BarChart3,
  Users,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2,
  Server,
  Printer,
  Wifi,
  Activity,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';

export const AdminDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Hourly patient throughput data
  const hourlyData = [
    { hour: '08:00', patients: 18, ayush: 9, allopathic: 9 },
    { hour: '09:00', patients: 42, ayush: 22, allopathic: 20 },
    { hour: '10:00', patients: 68, ayush: 38, allopathic: 30 },
    { hour: '11:00', patients: 74, ayush: 40, allopathic: 34 },
    { hour: '12:00', patients: 56, ayush: 30, allopathic: 26 },
    { hour: '13:00', patients: 28, ayush: 14, allopathic: 14 },
    { hour: '14:00', patients: 36, ayush: 20, allopathic: 16 },
    { hour: '15:00', patients: 20, ayush: 11, allopathic: 9 }
  ];

  // Consultation distribution pie data
  const modeDistribution = [
    { name: t('Ayush / Ayurveda'), value: 48, color: '#F59E0B' },
    { name: t('General Allopathic'), value: 36, color: '#0D7377' },
    { name: t('Dual Integrated'), value: 16, color: '#6366F1' }
  ];

  // Kiosk Fleet Telemetry Data
  const kioskFleet = [
    { id: 'Kiosk 01', location: 'OPD Main Lobby', status: 'Online', paper: 84, cpu: '14%', scans: 84, lastPing: 'Just now' },
    { id: 'Kiosk 02', location: 'Ayush Wing (1st Floor)', status: 'Online', paper: 62, cpu: '11%', scans: 76, lastPing: '12s ago' },
    { id: 'Kiosk 03', location: 'Chest & Medicine Clinic', status: 'Online', paper: 91, cpu: '18%', scans: 62, lastPing: 'Just now' },
    { id: 'Kiosk 04', location: 'Fever & Triage Desk', status: 'Online', paper: 44, cpu: '16%', scans: 58, lastPing: '4s ago' },
    { id: 'Kiosk 05', location: 'Emergency Gateway', status: 'Online', paper: 95, cpu: '9%', scans: 62, lastPing: 'Just now' }
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border-2 border-slate-200 rounded-3xl shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-teal-100 text-teal-800 rounded-full border border-teal-200 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-teal-600" />
                <T text="Hospital Administration Suite" />
              </span>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                MoA Node: AIIMS / AIIA Delhi
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              <T text="MediKiosk Analytics & Fleet Telemetry" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              <T text="Real-time patient throughput, Ayush adoption metrics, and DPDP compliance logs." />
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dev')}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-teal-300 text-xs font-mono font-bold rounded-xl transition-colors cursor-pointer"
            >
              <T text="Judge Command Center (/dev)" />
            </button>
          </div>
        </div>

        {/* 4 High-Level Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500">
              <span><T text="Patients Triaged Today" /></span>
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900">342</div>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> <T text="+24% vs manual desk" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500">
              <span><T text="Avg Intake Duration" /></span>
              <Clock className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900">2.4m</div>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span>⚡ <T text="-68% waiting reduction" /></span>
            </div>
          </div>

          <div className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500">
              <span><T text="Ayush Consultation Share" /></span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-amber-600">52.4%</div>
            <div className="text-xs font-semibold text-slate-500">
              <T text="Target >40% achieved" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-3xl border-2 border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500">
              <span><T text="P1 Red Flags Intercepted" /></span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-red-600">7</div>
            <div className="text-xs font-semibold text-red-700">
              <T text="100% routed to Casualty" />
            </div>
          </div>

        </div>

        {/* Charts Section: Hourly Throughput (Left 7) + Mode Share (Right 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Hourly Intake BarChart (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                <T text="Hourly Patient Intake Throughput" />
              </h2>
              <span className="text-xs text-slate-500"><T text="Peak: 11:00 AM" /></span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="ayush" name={t("Ayush OPD")} fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="allopathic" name={t("Allopathic OPD")} fill="#0D7377" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mode Share PieChart (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <T text="Consultation Wing Distribution" />
              </h2>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {modeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="text-xs text-center text-slate-500 pt-2 border-t border-slate-100">
              <T text="Ayush Dashavidha intake chosen by" /> <strong><T text="64% of recurring patients" /></strong>.
            </div>
          </div>

        </div>

        {/* Kiosk Fleet Telemetry Table */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-teal-600" />
              <T text="Hospital Kiosk Fleet Telemetry (5 Active Terminals)" />
            </h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              <T text="Fleet Health: 100% Operational" />
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3"><T text="Terminal ID" /></th>
                  <th className="p-3"><T text="Location" /></th>
                  <th className="p-3"><T text="Network Status" /></th>
                  <th className="p-3"><T text="Thermal Paper" /></th>
                  <th className="p-3"><T text="Scans Today" /></th>
                  <th className="p-3"><T text="CPU / Mem" /></th>
                  <th className="p-3"><T text="Telemetry Ping" /></th>
                  <th className="p-3"><T text="Remote Actions" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {kioskFleet.map((kiosk) => (
                  <tr key={kiosk.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900 font-mono">{kiosk.id}</td>
                    <td className="p-3"><T text={kiosk.location} /></td>
                    <td className="p-3">
                      <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <T text={kiosk.status} />
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              kiosk.paper < 50 ? 'bg-amber-500' : 'bg-teal-600'
                            }`}
                            style={{ width: `${kiosk.paper}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px]">{kiosk.paper}%</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900">{kiosk.scans}</td>
                    <td className="p-3 font-mono">{kiosk.cpu}</td>
                    <td className="p-3 text-slate-500 font-mono"><T text={kiosk.lastPing} /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => alert(`Remote Printer Test initiated for ${kiosk.id} (${kiosk.location})`)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition-colors cursor-pointer"
                          title="Trigger thermal printer test"
                        >
                          🖨️ <T text="Printer Test" />
                        </button>
                        <button
                          onClick={() => alert(`Camera Calibration pattern sent to ${kiosk.id}`)}
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded text-[11px] font-bold border border-teal-200 transition-colors cursor-pointer"
                          title="Calibrate OCR camera 60FPS feed"
                        >
                          📷 <T text="OCR Calibrate" />
                        </button>
                        <button
                          onClick={() => alert(`Ephemeral RAM Zeroing executed on ${kiosk.id}`)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold border border-emerald-200 transition-colors cursor-pointer"
                          title="DPDP zero-retention memory flush"
                        >
                          🧹 <T text="Flush RAM" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
