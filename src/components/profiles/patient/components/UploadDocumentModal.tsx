import React, { useState, useRef } from 'react';
import { useMediKiosk } from '../../../../context/MediKioskContext';
import { T } from '../../../../context/TranslationContext';
import { PatientLockerDocument } from '../../../../types';
import { FileUp, X } from 'lucide-react';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose }) => {
  const state = useMediKiosk();

  const [docTitle, setDocTitle] = useState<string>('');
  const [docCategory, setDocCategory] = useState<PatientLockerDocument['category']>('Prescription');
  const [docNotes, setDocNotes] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      if (!docTitle) setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSaveDocument = () => {
    if (!docTitle.trim()) return;

    state.uploadPatientDocument({
      title: docTitle.trim(),
      category: docCategory,
      fileName: selectedFileName || `${docTitle.trim().replace(/\s+/g, '_')}.pdf`,
      fileSize: '1.2 MB',
      uploadedBy: 'patient_kiosk',
      notes: docNotes.trim() || 'Uploaded by patient for future OPD reference',
      ocrExtractedMeds: ['Document uploaded to ABDM Health Locker. Available for physician review.']
    });

    setDocTitle('');
    setDocNotes('');
    setSelectedFileName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 text-slate-900">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900"><T text="Upload to ABHA Health Locker" /></h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium"><T text="Documents saved here are accessible by doctors during your visit." /></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Document Title" /></label>
            <input
              type="text"
              placeholder="e.g. Apollo Hospital Blood Test, Dr. Sharma Rx..."
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-2xl font-medium outline-none focus:ring-2 ring-teal-500 text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Category" /></label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-bold outline-none bg-white cursor-pointer text-sm sm:text-base"
              >
                <option value="Prescription">Prescription</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Scan / X-Ray">Scan / X-Ray</option>
                <option value="Ayush Treatment">Ayush Treatment</option>
              </select>
            </div>

            <div>
              <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Choose File" /></label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2.5 border-2 border-dashed border-teal-500 bg-teal-50 hover:bg-teal-100 rounded-2xl text-teal-900 font-extrabold text-center truncate cursor-pointer text-sm sm:text-base"
              >
                {selectedFileName || <T text="Browse PDF / Image" />}
              </button>
            </div>
          </div>

          <div>
            <label className="font-extrabold text-slate-800 block mb-1.5"><T text="Doctor Notes / Remarks" /></label>
            <textarea
              rows={2}
              placeholder="Optional details (e.g. Taking this medication for 6 months)..."
              value={docNotes}
              onChange={(e) => setDocNotes(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-2xl font-medium outline-none text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl text-sm cursor-pointer"
          >
            <T text="Cancel" />
          </button>
          <button
            onClick={handleSaveDocument}
            disabled={!docTitle.trim()}
            className="px-7 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl text-sm shadow-md cursor-pointer disabled:opacity-50 transition-all"
          >
            <T text="Save to Health Locker" />
          </button>
        </div>
      </div>
    </div>
  );
};
