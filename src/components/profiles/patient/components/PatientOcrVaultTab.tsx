import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediKiosk } from '../../../../context/MediKioskContext';
import { T } from '../../../../context/TranslationContext';
import {
  FileText,
  Camera,
  Upload,
  Volume2,
  Trash2
} from 'lucide-react';

interface PatientOcrVaultTabProps {
  onOpenUploadModal: () => void;
  onPlayTts: (text: string) => void;
}

export const PatientOcrVaultTab: React.FC<PatientOcrVaultTabProps> = ({
  onOpenUploadModal,
  onPlayTts
}) => {
  const navigate = useNavigate();
  const state = useMediKiosk();

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xl space-y-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" />
            <span><T text="Optical Document OCR Vault & Intelligence" /></span>
          </h3>
          <p className="text-sm text-slate-600 font-medium mt-0.5">
            <T text="All physical papers scanned at the kiosk are OCR-extracted and stored in your vault." />
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/scan')}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <Camera className="w-4 h-4" />
            <span><T text="Scan New Physical Paper" /></span>
          </button>
          <button
            onClick={onOpenUploadModal}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span><T text="Upload Digital File" /></span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {state.patientDocuments.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl border-2 border-slate-200 hover:border-teal-500 bg-slate-50/80 hover:bg-white transition-all shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-teal-100 text-teal-900 border border-teal-300">
                  {doc.category}
                </span>
                <span className="text-xs text-slate-500 font-mono font-bold">{doc.date}</span>
              </div>

              <h4 className="font-black text-slate-900 text-base line-clamp-2 leading-snug">{doc.title}</h4>
              <p className="text-xs sm:text-sm text-slate-600 font-medium line-clamp-2">{doc.notes}</p>

              {doc.ocrExtractedMeds && doc.ocrExtractedMeds.length > 0 && (
                <div className="p-3 bg-white rounded-xl border-2 border-slate-200 space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-teal-900 uppercase tracking-wider block text-xs">
                      <T text="OCR Extracted Intelligence" />:
                    </span>
                    <button
                      onClick={() =>
                        onPlayTts(
                          `Extracted items from ${doc.title}: ${doc.ocrExtractedMeds?.join(', ')}`
                        )
                      }
                      className="p-1 hover:bg-teal-50 rounded text-teal-700 cursor-pointer"
                      title="Listen with TTS"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  {doc.ocrExtractedMeds.map((med, idx) => (
                    <div key={idx} className="text-slate-800 font-medium text-xs leading-relaxed">• {med}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono font-bold">{doc.fileName}</span>
              <button
                onClick={() => state.deletePatientDocument(doc.id)}
                className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 cursor-pointer"
                title="Delete Record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
