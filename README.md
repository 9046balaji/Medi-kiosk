# 🏥 MediKiosk — AI-Powered Indic Multilingual OPD Kiosk & Clinical Workstation

[![Version](https://img.shields.io/badge/Release-v2.1.0_Enterprise-emerald.svg)](https://github.com/balajikonda9046/Medi-kiosk)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10_%7C_3.11-teal.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.3_TypeScript-cyan.svg)](https://reactjs.org/)
[![AI4Bharat](https://img.shields.io/badge/AI4Bharat-IndicConformer_%7C_IndicTrans2_%7C_ParlerTTS-purple.svg)](https://ai4bharat.iitm.ac.in/)
[![MedGemma](https://img.shields.io/badge/LLM-MedGemma_1.5_%2F_2.1-amber.svg)](https://huggingface.co/google/medgemma)

> **Production-Grade Smart Hospital Kiosk Platform** engineered for Indian public healthcare ecosystems — AIIMS, AIIA, District Hospitals, and Primary Health Centers (PHCs).  
> Integrates **real-time ASR in 22 scheduled Indian languages**, **MedGemma 2.1 AI clinical SOAP assessment**, **Ayush Dashavidha & Tridosha Pariksha**, **Florence-2 Vision OCR prescription scanning**, **Indic Parler-TTS neural speech synthesis**, and **ABDM HL7 FHIR R4 interoperability**.

---

## 🚀 Key Release Versions & Microservices

| Microservice Module | Tag / Release | Port | Underlying AI Model | Primary Responsibilities |
| --- | --- | --- | --- | --- |
| **Clinical Brain & LLM** | `v2.1.0-medgemma-clinical` | 8005 / Ngrok | Google MedGemma 1.5 / 2.1 | Adaptive SOCRATES/Dashavidha intake, token streaming (`/ws/intake-stream`), Chain-of-Verification (CoVe) audit, FHIR synthesis. |
| **Vision OCR Engine** | `v2.0.0-ocr-vision` | 8002 | Microsoft Florence-2-base | Prescription & lab report scanning, OpenCV CLAHE/deskewing, CDSCO/RxNorm/AYUSH fuzzy drug normalizer, `<OCR_WITH_REGION>` bounding boxes, handwritten Rx detector. |
| **Speech Synthesis (TTS)** | `v2.0.0-indic-tts` | 8002 | AI4Bharat Indic Parler-TTS | 20-Language + English neural speech, medical G2P acronyms (`BP 120/80` $\rightarrow$ `Blood Pressure 120 over 80`), triage prosody mapping, `< 400ms` streaming (`/api/tts-stream`), 0ms SHA-256 LRU cache. |
| **Speech Recognition (ASR)**| `v2.0.0-indic-asr` | 8001 | AI4Bharat IndicConformer 600M | 22 Scheduled Indian languages, CTC (~25ms) & RNNT (~65ms) decoders, word timestamps, in-memory `io.BytesIO` decoding, Inverse Text Normalization (ITN), WebSocket streaming (`/ws/transcribe`). |
| **Multilingual Translation** | `v2.0.0-indic-translation` | 8000 | AI4Bharat IndicTrans2 FP16 | 22 Language script translation, air-gapped offline model loading, Medical Lexicon Protection Engine (`[MED_PROT_N]`), bounded `OrderedDict` LRU cache (10,000 items). |

---

## 🤖 AI Models & Language Coverage

### 1. AI4Bharat IndicConformer 600M ASR (22 Scheduled Indian Languages)
Supports all 22 official scheduled Indian languages with CTC (~25ms steady-state) and RNNT (~65ms) decoders, ONNX CUDA acceleration, and Inverse Text Normalization (ITN):

```
Assamese (as) • Bengali (bn) • Bodo (brx) • Dogri (doi) • Gujarati (gu) • Hindi (hi)
Kannada (kn) • Kashmiri (ks) • Konkani (kok) • Maithili (mai) • Malayalam (ml)
Manipuri (mni) • Marathi (mr) • Nepali (ne) • Odia (or) • Punjabi (pa) • Sanskrit (sa)
Santali (sat) • Sindhi (sd) • Tamil (ta) • Telugu (te) • Urdu (ur)
```

### 2. Microsoft Florence-2 Vision OCR 2.0 Engine
- **OpenCV Pre-Processing**: CLAHE contrast enhancement (`clipLimit=2.5`, `tileGridSize=(8,8)`), contour minAreaRect auto-deskewing, and Laplacian cursive handwriting detection (`is_handwritten`).
- **Fuzzy Drug Normalization Engine**: Auto-corrects OCR typos against CDSCO, RxNorm, and AYUSH Pharmacopoeia dictionaries (`Paracetmol 500mg` $\rightarrow$ `Paracetamol`, `Pantoprasol 40mg` $\rightarrow$ `Pantoprazole`).
- **Zero False Data Injection**: Replaced hardcoded sample prescription fallbacks with explicit `status: "warning"` low-quality/dark image alerts.
- **Location Bounding Boxes**: Parses `<loc_y1><loc_x1><loc_y2><loc_x2>` tokens returning normalized `[ymin, xmin, ymax, xmax]` arrays for UI region highlights.

### 3. AI4Bharat Indic Parler-TTS 2.0 Engine
- **Medical G2P Pre-Processor**: Expands clinical acronyms before tokenization (`"BP 120/80"` $\rightarrow$ `"Blood Pressure 120 over 80"`, `"ECG"` $\rightarrow$ `"ईसीजी"`).
- **Dynamic Triage Prosody Mapping**: Maps triage priority levels (`P1_CRITICAL` urgent vs `P3_ROUTINE` calm) to voice prompt conditioning.
- **In-Memory SHA-256 LRU Buffer**: Delivers **0.0 ms latency** for repeated kiosk navigation audio prompts.
- **Audio Resampling**: Resamples from 24000Hz down to 16000Hz for WebRTC and hospital intercom compatibility.
- **Streaming Audio Endpoint**: `/api/tts-stream` streams audio chunks in **< 400ms Time-To-First-Audio (TTFA)**.

### 4. Google MedGemma 2.1 Conversational Clinical Brain
- **Adaptive SOCRATES & Dashavidha Intake**: Multi-turn dialogue generation tailoring next questions to patient responses.
- **Token Streaming**: Real-time token generator over `/ws/intake-stream`.
- **Chain-of-Verification (CoVe)**: Self-correction audit pipeline generating verification checklists and final audited clinical verdicts.
- **ABDM HL7 FHIR R4 Bundle Exporter**: Auto-synthesizes NRCES-compliant FHIR R4 JSON bundles with SNOMED CT and NAMASTE Ayush codings.

---

## ✨ Platform Features & User Workflows

### 🎙️ 1. Voice Patient Intake Terminal (`IntakeScreen.tsx`)
- Multi-lingual voice recording via WebRTC `MediaRecorder` connecting to ONNX CUDA ASR backend.
- Live waveform frequency spectrum canvas visualizer.
- Emergency Red-Flag Triage Engine (`RedFlagModal.tsx`) evaluating ESI Levels (1-5), NEWS2 vital scores, PEWS pediatric alerts, MEOWS obstetric warnings, and START mass-casualty disaster tags.

### 📷 2. Prescription & Lab Report Scanner (`DocScannerScreen.tsx` & `OcrResultsScreen.tsx`)
- Live webcam frame snapping onto canvas element with real-time video stream feed.
- Low-lighting / unreadable document warning modal allowing users to re-snap or use demo sample Rx.
- Interactive extracted drug editor with CDSCO/RxNorm/AYUSH **Fuzzy Matched** badges and **Handwritten Prescription** indicators.
- Cross-Discipline Polypharmacy Safety Checker (`DrugInteractionMatrix.tsx`) alerting on Allopathic vs AYUSH contraindications (*Warfarin + Guggulu*, *Aspirin + Arjuna*, *Metformin + Karela*).

### 🩺 3. Doctor Clinical Workstation (`DoctorDashboardScreen.tsx`)
- Pre-populated Allopathic SOAP Note Console & Vaidya 10-Fold Dashavidha Assessment Matrix (*Prakriti*, *Vikriti*, *Agni*, *Kosta*, *Dehabala*).
- Interactive Tridosha Imbalance Sliders (*Vata • Pitta • Kapha*).
- Doctor dictation ASR for voice-to-text note taking.
- MedGemma 2.1 SOAP Note Synthesizer button (`🤖 MedGemma SOAP`).
- Chain-of-Verification Audit Panel (`🔍 CoVe Self-Correction`).
- ABDM HL7 FHIR R4 Bundle Exporter (`📦 FHIR R4 Bundle`).

### 👤 4. Patient Health Locker & AI Assistant (`PatientProfileScreen.tsx`)
- ABDM ABHA 14-digit identity card and health document vault.
- Multi-lingual MedGemma AI Health Assistant with ASR speech input and Neural TTS audio playback.
- Plain-Language Patient Translator simplifying complex medical terminology.
- DPDP Act 2023 Right to Erasure ephemeral session RAM purge.

---

## 🛠️ Technology Stack

| Architecture Layer | Technology |
| --- | --- |
| **Frontend UI** | React 18.3, TypeScript 5.5, Vite 6.4, Vanilla CSS, Lucide Icons, React Router v6 |
| **ASR Speech Recognition** | AI4Bharat IndicConformer 600M (ONNX CUDA Runtime), FastAPI, Port 8001 |
| **Neural Speech Synthesis** | AI4Bharat Indic Parler-TTS 20-Language (PyTorch FP16 CUDA), FastAPI, Port 8002 |
| **Vision OCR Engine** | Microsoft Florence-2-base, OpenCV CLAHE/deskewing, FastAPI, Port 8002 |
| **Indic Translation** | AI4Bharat IndicTrans2 200M (PyTorch FP16 CUDA), FastAPI, Port 8000 |
| **Clinical LLM** | Google MedGemma 1.5 / 2.1 (GPU Colab / Local Service), Port 8005 |
| **Interoperability** | ABDM Level-3, HL7 FHIR R4, SNOMED CT, NAMASTE Ayush |

---

## 🚀 Installation & Setup Guide

### 1. Prerequisites
- **Node.js** v18.0 or higher
- **Python** 3.10 or 3.11 (Conda environment recommended)
- **NVIDIA GPU** with CUDA 11.8+ / 12.0+ (CPU fallback supported)

### 2. Frontend Development Server
```bash
git clone https://github.com/balajikonda9046/Medi-kiosk.git
cd Medi-kiosk
npm install
npm run dev
# → http://localhost:5173
```

### 3. ASR Microservice (Port 8001)
```bash
# Download model weights (one-time)
python backend/medikiosk-asr/download_model.py

# Run ASR Server
python backend/medikiosk-asr/main.py
# → http://localhost:8001
```

### 4. Vision OCR Microservice (Port 8002)
```bash
python backend/medikiosk-ocr/main.py
# → http://localhost:8002
```

### 5. Indic Parler-TTS Microservice (Port 8002)
```bash
python backend/medikiosk-tts/main.py
# → http://localhost:8002
```

### 6. IndicTrans2 Translation Microservice (Port 8000)
```bash
cd backend/medikiosk-translation
pip install -r requirements.txt
python main.py
# → http://localhost:8000
```

### 7. Run Enterprise Test Battery
```bash
# Test ASR
python backend/medikiosk-asr/test_asr.py

# Test Vision OCR
python backend/medikiosk-ocr/test_ocr.py

# Test TTS
python backend/medikiosk-tts/test_tts.py

# Test Translation
python backend/medikiosk-translation/test_translation.py
```

### 8. Production Frontend Build
```bash
npx tsc --noEmit   # Type check
npm run build      # Vite production build → dist/
```

---

## 📜 License & Acknowledgments

- **AI4Bharat**: IIT Madras Research — IndicConformer, IndicTrans2, Indic Parler-TTS.
- **Google DeepMind / HuggingFace**: MedGemma 1.5 / 2.1 Clinical LLM.
- **Microsoft Research**: Florence-2 Vision Model.
- **National Health Authority (NHA)**: ABDM & Ayush Healthcare Interoperability Standards.

---
*Built with ❤️ for Indian Public Healthcare Digitization.*
