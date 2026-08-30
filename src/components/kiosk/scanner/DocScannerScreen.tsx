import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../context/MediKioskContext';
import { T } from '../../../context/TranslationContext';
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
  VideoOff
} from 'lucide-react';

export const DocScannerScreen: React.FC = () => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  const [docType, setDocType] = useState<'prescription' | 'lab_report' | 'discharge'>('prescription');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScannedImage(event.target?.result as string);
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1200);
      };
      reader.readAsDataURL(file);
    }
  };

  // Live Webcam Handler
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsWebcamActive(true);
    } catch (err) {
      console.warn('Webcam permission denied:', err);
    }
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
      const dataUrl = canvas.toDataURL('image/jpeg');
      setScannedImage(dataUrl);

      // Stop video tracks
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsWebcamActive(false);
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 1200);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/intake')}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <T text="Back to Voice Intake" />
          </button>

          <span className="text-xs font-mono font-bold px-3 py-1 bg-teal-100 text-teal-800 border border-teal-200 rounded-full">
            <T text="Optical Document Scanner 300 DPI" />
          </span>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            <T text="Scan Physical Paper Prescriptions & Lab Reports" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            <T text="Upload an image file or use live camera capture below for instant OCR extraction." />
          </p>
        </div>

        {/* Document Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setDocType('prescription')}
            className={`p-3.5 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              docType === 'prescription'
                ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <T text="Prescription / Rx" />
          </button>

          <button
            onClick={() => setDocType('lab_report')}
            className={`p-3.5 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              docType === 'lab_report'
                ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <T text="Lab Pathology Report" />
          </button>

          <button
            onClick={() => setDocType('discharge')}
            className={`p-3.5 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              docType === 'discharge'
                ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <T text="Discharge Summary" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xl space-y-6">
          
          <div className="relative aspect-video max-w-2xl mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 flex items-center justify-center p-4">
            
            {/* Live Video Feed if Webcam active */}
            {isWebcamActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-xl"
              />
            ) : scannedImage ? (
              <img
                src={scannedImage}
                alt="Scanned Document"
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80"
                alt="Sample Prescription Document"
                className="w-full h-full object-cover rounded-xl opacity-60"
              />
            )}

            {/* Laser Scanning Animation Overlay */}
            {isScanning && (
              <div className="absolute inset-0 bg-teal-500/10 backdrop-blur-xs flex items-center justify-center">
                <div className="w-full h-1 bg-teal-400 shadow-[0_0_15px_#2dd4bf] animate-bounce" />
                <span className="absolute bg-teal-950 text-teal-300 px-4 py-2 rounded-xl text-xs font-mono font-bold border border-teal-800">
                  <T text="OCR Entity Extraction in Progress..." />
                </span>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Real Input Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-all border border-slate-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Upload className="w-4 h-4 text-teal-600" />
              <span><T text="Upload Image File" /></span>
            </button>

            {isWebcamActive ? (
              <button
                onClick={captureWebcamFrame}
                className="w-full sm:w-auto px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Camera className="w-4 h-4" />
                <span><T text="Snap Photo Frame" /></span>
              </button>
            ) : (
              <button
                onClick={startWebcam}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-all border border-slate-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Video className="w-4 h-4 text-teal-600" />
                <span><T text="Open Live Webcam Camera" /></span>
              </button>
            )}

            <button
              onClick={() => navigate('/scan/ocr')}
              className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span><T text="View Extracted OCR Results" /></span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
