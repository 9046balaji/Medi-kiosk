import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import {
  QrCode,
  Camera,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Video,
  AlertCircle
} from 'lucide-react';

export const QrScannerScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scannedSuccess, setScannedSuccess] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let active = true;

    const startCamera = async () => {
      setCameraError(null);
      try {
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false
          });
        } catch (e) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => console.warn('Play error:', err));
        }
      } catch (err) {
        console.warn('Camera permission or device error:', err);
        setCameraError('Camera access not detected. You can tap "Simulate QR Scan" below to proceed.');
      }
    };

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleSimulateQrScan = () => {
    setIsScanning(false);
    setScannedSuccess(true);
    state.setPatientName('Rajesh Kumar');
    state.setOpdToken('MK-1042');
    setTimeout(() => {
      navigate('/intake');
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <T text="Back to Authentication" />
          </button>

          <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
            <T text="ABHA QR Code Scanner" />
          </span>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            <T text="Scan ABHA Card QR Code" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            <T text="Hold your physical ABHA card or ABHA Mobile App QR code in front of the kiosk camera below." />
          </p>
        </div>

        {/* Camera Alert if no permission */}
        {cameraError && (
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="font-bold">{cameraError}</div>
          </div>
        )}

        {/* Camera Viewport with Scanner Target Box */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-6 text-center">
          
          <div className="relative max-w-sm mx-auto aspect-square bg-slate-900 rounded-3xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center p-4">
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-2xl"
            />

            {/* Target Box Overlay */}
            <div className="absolute inset-8 border-4 border-dashed border-teal-400 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-teal-400 shadow-[0_0_15px_#2dd4bf] animate-bounce" />
            </div>

            {scannedSuccess && (
              <div className="absolute inset-0 bg-emerald-900/90 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
                <h3 className="text-lg font-black"><T text="ABHA QR Code Verified!" /></h3>
                <p className="text-xs text-emerald-200">Rajesh Kumar • Token MK-1042</p>
              </div>
            )}
          </div>

          <button
            onClick={handleSimulateQrScan}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 cursor-pointer hover:scale-102"
          >
            <QrCode className="w-5 h-5" />
            <span><T text="Simulate QR Code Scan Detection" /></span>
          </button>

        </div>

      </div>
    </div>
  );
};
