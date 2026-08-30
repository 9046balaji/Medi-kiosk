import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import {
  Server,
  ShieldCheck,
  Cpu,
  Lock,
  Settings,
  ArrowLeft,
  CheckCircle2,
  Sliders,
  Database
} from 'lucide-react';

export const SystemSettingsScreen: React.FC = () => {
  const navigate = useNavigate();

  const [quantPrecision, setQuantPrecision] = useState<'FP16' | 'INT8'>('FP16');
  const [batchWindowMs, setBatchWindowMs] = useState<number>(15);
  const [purgeIntervalMins, setPurgeIntervalMins] = useState<number>(30);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSaveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/profile/admin')}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <T text="Back to Admin Profile" />
          </button>

          <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-900 text-teal-300 rounded-full">
            <T text="System Architecture Settings" />
          </span>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            <T text="IndicTrans2 Daemon & DPDP Policy Config" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            <T text="Tune translation micro-batching windows, FP16 precision, and ephemeral RAM purge timers." />
          </p>
        </div>

        {/* Settings Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          
          {/* IndicTrans2 Model Pipeline Config */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-600" />
              1. <T text="IndicTrans2 Neural Engine Model Config" />
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900"><T text="Model Weight Quantization" /></div>
                <div className="flex items-center gap-2 pt-1">
                  {(['FP16', 'INT8'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuantPrecision(q)}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        quantPrecision === q ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 border border-slate-300'
                      }`}
                    >
                      {q} ({q === 'FP16' ? 'High Accuracy' : 'Low Latency'})
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900"><T text="Micro-Batch Window (ms)" /></div>
                <div className="flex items-center gap-2 pt-1 font-mono">
                  {[10, 15, 30, 50].map((ms) => (
                    <button
                      key={ms}
                      onClick={() => setBatchWindowMs(ms)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        batchWindowMs === ms ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 border border-slate-300'
                      }`}
                    >
                      {ms}ms
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* DPDP Act Purge Timer */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-600" />
              2. <T text="DPDP Act 2023 Session Retention Timer" />
            </h2>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span><T text="Automatic RAM Purge Timer (Minutes)" /></span>
                <span className="font-mono text-teal-800">{purgeIntervalMins} <T text="mins" /></span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={purgeIntervalMins}
                onChange={(e) => setPurgeIntervalMins(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-teal-300 font-bold rounded-2xl text-xs transition-all shadow-md cursor-pointer"
            >
              {saved ? <T text="✓ System Settings Saved" /> : <T text="Save System Configuration" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
