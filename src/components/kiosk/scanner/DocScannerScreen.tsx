import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
import { scanDocumentApi } from '../../../lib/ocrApi';
import {
  Scan,
  FileText,
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  RefreshCw,
  Sparkles,
  FileSearch,
  Video,
  VideoOff,
  Mic,
  SkipForward,
  HelpCircle,
  Volume2,
  AlertCircle,
  ImageIcon
} from 'lucide-react';

export const DocScannerScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  const [docType, setDocType] = useState<'prescription' | 'lab_report' | 'discharge'>('prescription');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Attach stream to video element whenever isWebcamActive changes to true
  useEffect(() => {
    if (isWebcamActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((err) => {
        console.warn('Video play error:', err);
      });
    }
  }, [isWebcamActive]);

  // Live Webcam Handler with multi-fallback constraints
  const startWebcam = async () => {
    setCameraError(null);
    try {
      let stream: MediaStream | null = null;
      try {
        // Try rear/environment camera first
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      } catch (firstErr) {
        // Fallback to standard video camera (laptop webcam)
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      setScannedImage(null);
      setIsWebcamActive(true);
    } catch (err: any) {
      console.warn('Webcam start failed:', err);
      setCameraError(
        'Camera permission was not granted or no webcam was detected. You can upload an image or use the demo sample prescription below.'
      );
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  const captureWebcamFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setScannedImage(dataUrl);
      stopWebcam();
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 1200);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopWebcam();
      const reader = new FileReader();
      reader.onload = (event) => {
        setScannedImage(event.target?.result as string);
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1200);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load High-Quality Sample Prescription for Instant Demo
  const handleLoadSamplePrescription = () => {
    stopWebcam();
    setScannedImage('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80');
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1000);
  };

  const handleAnalyzeAndProceed = async () => {
    setIsScanning(true);
    try {
      if (scannedImage) {
        await scanDocumentApi(scannedImage, docType, state.transcript || '');
      }
    } catch (err) {
      console.warn('OCR processing error:', err);
    } finally {
      setIsScanning(false);
      navigate('/scan/results');
    }
  };

  const handleSkipDirectToToken = () => {
    stopWebcam();
    navigate('/complete');
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-3 sm:p-6 lg:p-8 space-y-4">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* ─── 3-Step Breadcrumb ─── */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-bold">
              <T text="Step 1: Speak Symptoms" /> 🎙️
            </span>
            <span className="text-slate-400">➔</span>
            <span className="px-3 py-1 bg-emerald-600 text-white rounded-full flex items-center gap-1.5 shadow-sm">
              <Camera className="w-3.5 h-3.5" />
              <span><T text="Step 2: Scan Paper" /></span>
            </span>
            <span className="text-slate-400">➔</span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-bold">
              <T text="Step 3: Get Token Slip" /> 🎟️
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSkipDirectToToken}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <SkipForward className="w-4 h-4 text-amber-700" />
              <span><T text="No paper? Skip to Token" /> ➔</span>
            </button>
          </div>
        </div>

        {/* ── Header Title ── */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            <T text="Scan Physical Paper Prescriptions & Lab Reports" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            <T text="Hold your prescription up to the camera or upload an image file for instant AI recognition." />
          </p>
        </div>

        {/* Scanner Viewport */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xl space-y-5">
          
          {/* Camera Alert / Error if blocked */}
          {cameraError && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">{cameraError}</div>
                <div className="text-amber-800">
                  Tip: You can click <strong>"Use Demo Sample Rx"</strong> or <strong>"Upload Image"</strong> below to continue!
                </div>
              </div>
            </div>
          )}

          <div className="relative aspect-video max-w-2xl mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 flex items-center justify-center p-3">
            
            {/* Live Video Feed (Rendered and toggled via CSS to maintain stable DOM ref) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover rounded-xl ${isWebcamActive ? 'block' : 'hidden'}`}
            />

            {/* Scanned Image Preview */}
            {!isWebcamActive && scannedImage && (
              <img
                src={scannedImage}
                alt="Scanned Document"
                className="w-full h-full object-contain rounded-xl"
              />
            )}

            {/* Idle Placeholder */}
            {!isWebcamActive && !scannedImage && (
              <div className="text-center space-y-2 p-6 text-white">
                <Camera className="w-16 h-16 text-emerald-400 mx-auto animate-pulse" />
                <div className="text-base sm:text-lg font-black">
                  <T text="Tap Open Camera below to start scanning" />
                </div>
                <div className="text-xs text-slate-400">
                  <T text="(Show paper prescription to camera or upload picture)" />
                </div>
              </div>
            )}

            {/* Target Viewfinder overlay when camera active */}
            {isWebcamActive && (
              <div className="absolute inset-6 sm:inset-10 border-4 border-dashed border-emerald-400 rounded-2xl pointer-events-none flex items-center justify-center">
                <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-bounce" />
              </div>
            )}

            {/* Laser Scanning Animation Overlay */}
            {isScanning && (
              <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-xs flex items-center justify-center">
                <div className="w-full h-1 bg-emerald-400 shadow-[0_0_15px_#34d399] animate-bounce" />
                <span className="absolute bg-slate-950 text-emerald-300 px-4 py-2 rounded-xl text-xs font-mono font-bold border border-emerald-800">
                  <T text="Florence-2 Vision OCR in progress..." />
                </span>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {isWebcamActive ? (
              <>
                <button
                  onClick={captureWebcamFrame}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl animate-pulse"
                >
                  <Camera className="w-5 h-5" />
                  <span><T text="Snap Photo Frame" /></span>
                </button>
                <button
                  onClick={stopWebcam}
                  className="px-5 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                >
                  <VideoOff className="w-4 h-4" />
                  <span><T text="Close Camera" /></span>
                </button>
              </>
            ) : (
              <button
                onClick={startWebcam}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-600/30 hover:scale-105"
              >
                <Camera className="w-5 h-5" />
                <span><T text="Open Camera" /></span>
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-2xl transition-all border border-slate-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span><T text="Upload Image File" /></span>
            </button>

            <button
              onClick={handleLoadSamplePrescription}
              className="px-5 py-4 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-2xl transition-all border border-teal-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              title="Load sample prescription with Pantoprazole + Avipattikar Churna"
            >
              <ImageIcon className="w-4 h-4 text-teal-600" />
              <span><T text="Use Demo Sample Rx" /></span>
            </button>

            {scannedImage && (
              <button
                onClick={handleAnalyzeAndProceed}
                disabled={isScanning}
                className="px-8 py-4 bg-teal-700 hover:bg-teal-800 text-white font-black text-sm rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer animate-in zoom-in-95"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span><T text="Analyze Prescription" /></span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleSkipDirectToToken}
              className="px-6 py-4 bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs sm:text-sm rounded-2xl transition-all border-2 border-amber-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <SkipForward className="w-4 h-4 text-amber-700" />
              <span><T text="Skip to Token Slip" /> ➔</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
