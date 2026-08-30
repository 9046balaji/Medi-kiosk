import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import {
  QrCode,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Camera,
  RefreshCw,
  Zap,
  ShieldCheck
} from 'lucide-react';

export const QrScannerScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setAbhaVerified } = useMediKiosk();

  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scannedSuccess, setScannedSuccess] = useState<boolean>(false);

  const handleSimulateQrScan = () => {
    setIsScanning(false);
    setScannedSuccess(true);

    setTimeout(() => {
      setAbhaVerified(true, true);
      navigate('/intake');
    }, 1200);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-100 text-slate-900 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <T text="Back" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 bg-teal-100 text-teal-800 border border-teal-200 rounded-full font-mono font-semibold">
              ABDM Optical QR v2.1
            </span>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            <T text="Scan ABHA Card or App QR Code" />
          </h1>
          <p className="text-sm text-slate-600">
            <T text="Hold your ABHA Card or Aarogya Setu QR Code inside the scanner frame below." />
          </p>
        </div>

        {/* Scanner Viewport */}
        <div className="relative max-w-md mx-auto aspect-square bg-slate-900 rounded-3xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center p-4">
          
          {/* Mock Camera Background Preview */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80"
              alt="Hospital Kiosk Optical Camera"
              className="w-full h-full object-cover opacity-20 filter grayscale"
            />
          </div>

          {/* Scanner Optical Reticle */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl border-2 border-teal-500/40 flex items-center justify-center animate-pulse-bracket">
            {/* Corner Brackets */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-teal-400 rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-teal-400 rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-teal-400 rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-teal-400 rounded-br-xl" />

            {/* Scanning Laser Beam Sweep */}
            {isScanning && !scannedSuccess && (
              <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-scan-laser shadow-[0_0_12px_#14B8A6]" />
            )}

            {/* Target QR Mock Placeholder */}
            {!scannedSuccess ? (
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-center space-y-2">
                <QrCode className="w-16 h-16 text-teal-300 mx-auto opacity-80" />
                <div className="text-[11px] font-mono text-teal-200 uppercase tracking-wider">
                  <T text="Align QR Code" />
                </div>
              </div>
            ) : (
              <div className="p-6 bg-emerald-950/90 backdrop-blur-md rounded-2xl border-2 border-emerald-500 text-center space-y-2 animate-in zoom-in-90 duration-300">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                <div className="text-sm font-bold text-white"><T text="QR Code Verified!" /></div>
                <div className="text-xs text-emerald-300 font-mono">ABHA: 91-4589-2041-9872</div>
              </div>
            )}
          </div>

          {/* Optical Scanner Status Footer Bar */}
          <div className="absolute bottom-4 inset-x-4 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span><T text="Kiosk Optical Lens: Active" /></span>
            </div>
            <span className="text-[10px] text-teal-400 font-mono">NDHM Tokenization</span>
          </div>

        </div>

        {/* Action Button */}
        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={handleSimulateQrScan}
            disabled={scannedSuccess}
            className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-black rounded-2xl text-base transition-all shadow-xl shadow-teal-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Camera className="w-5 h-5" />
            <span><T text="Simulate QR Code Scan (Rajesh Kumar)" /></span>
          </button>
        </div>

      </div>
    </div>
  );
};
