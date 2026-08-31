# 🏥 MediKiosk — AI-Powered Indic Multilingual OPD Kiosk & Clinical Workstation

> **Production-grade hospital kiosk** engineered for Indian public healthcare — AIIMS, AIIA, District Hospitals, and Primary Health Centers.  
> Combines **real-time voice ASR in 22 Indian languages**, **AI clinical SOAP assessment**, **Ayush Dashavidha Pariksha**, **ABDM HL7 FHIR R4 records**, and **OCR prescription scanning** in a single unified platform.

---

## 🤖 AI4Bharat IndicConformer 600M — What This Model Can Do

This project uses **[`ai4bharat/indic-conformer-600m-multilingual`](https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual)** — the most comprehensive open-source ASR model ever built for Indian languages.

### Language Coverage — All 22 Scheduled Indian Languages

| # | Language | Code | Script |
|---|---|---|---|
| 1 | Assamese | `as` | Bengali |
| 2 | Bengali | `bn` | Bengali |
| 3 | Bodo | `brx` | Devanagari |
| 4 | Dogri | `doi` | Devanagari |
| 5 | Gujarati | `gu` | Gujarati |
| 6 | Hindi | `hi` | Devanagari |
| 7 | Kannada | `kn` | Kannada |
| 8 | Kashmiri | `ks` | Arabic / Devanagari |
| 9 | Konkani | `kok` | Devanagari |
| 10 | Maithili | `mai` | Devanagari |
| 11 | Malayalam | `ml` | Malayalam |
| 12 | Manipuri | `mni` | Bengali |
| 13 | Marathi | `mr` | Devanagari |
| 14 | Nepali | `ne` | Devanagari |
| 15 | Odia | `or` | Odia |
| 16 | Punjabi | `pa` | Gurmukhi |
| 17 | Sanskrit | `sa` | Devanagari |
| 18 | Santali | `sat` | Ol Chiki |
| 19 | Sindhi | `sd` | Arabic |
| 20 | Tamil | `ta` | Tamil |
| 21 | Telugu | `te` | Telugu |
| 22 | Urdu | `ur` | Arabic |

### Decoder Modes

| Decoder | Latency (RTX 4050) | Best For |
|---|---|---|
| **CTC** | **~21–28 ms** | Real-time kiosk, streaming UI |
| **RNNT** | **~55–110 ms** | High-accuracy server processing |

### Additional Capabilities

| Capability | Details |
|---|---|
| **Word-level timestamps** | `compute_timestamps='w'` → `[('word', start_sec, end_sec)]` |
| **ONNX Runtime** | Runs via ONNX — no NeMo/PyTorch at inference time |
| **CUDA acceleration** | Automatic GPU detection; falls back to CPU |
| **Warmup / JIT compile** | First 2 calls compile GPU graph; steady-state is instant |
| **Silence detection** | Returns empty transcript on silent audio (no false positives) |
| **Multi-accent** | Trained on diverse regional accents across all 22 languages |
| **Medical vocabulary** | Handles clinical terms (symptoms, body parts, medicines) natively |

### Benchmarked Performance (MediKiosk RTX 4050 Laptop GPU)

```
Model Load Time         :  5.08s  (one-time, at server start)
CTC  22/22 Languages    :  ✅ 100% PASS
CTC  Steady-State       :  21–28 ms per inference
CTC  P95 Latency        :  ~400 ms  (incl. first-call GPU JIT)
RNNT  5/5 Key Languages :  ✅ 100% PASS
RNNT Average Latency    :  64 ms
Word Timestamps (CTC)   :  ✅ Working  ~30 ms
```

### Why This Model for MediKiosk?

- ✅ **Only** open-source model covering all 22 constitutionally scheduled Indian languages
- ✅ Purpose-built by **AI4Bharat** — IIT Madras research, funded by MeitY
- ✅ 600M parameter Conformer — deep enough to handle regional dialects and medical jargon
- ✅ ONNX-exported — production-ready, no training dependencies at runtime
- ✅ MIT licensed — suitable for government/public sector hospital deployment

---

## ✨ Full Platform Features

### 🎙️ Voice ASR Intake (IndicConformer 600M)
- **Real microphone recording** — WebRTC `MediaRecorder` → ONNX ASR backend
- **CTC decoder** (~25ms): optimal for real-time kiosk UI
- **RNNT decoder** (~65ms): higher accuracy for complex symptoms
- **Word-level timestamps**: subtitle and clinical note generation
- **Auto-translation**: ASR transcript → English via `IndicTrans2`
- **SOCRATES clinical flow**: AI-guided 8-step symptom elicitation questionnaire
- **Live waveform visualizer**: real-time `AnalyserNode` canvas spectrum

### 🌐 Universal 22-Language Translation (IndicTrans2)
- **Zero-latency micro-batch queue**: 15ms batching window with in-memory cache
- **Full page translation**: every UI string translated on language switch
- **Backend**: `indictrans2-en-indic-dist-200M` via FastAPI (port 8000)
- **Fallback**: graceful degradation to source text on backend timeout

### 🩺 Dual Clinical Console
- **Allopathic SOAP Workstation**: Subjective, Objective, Assessment, Plan
- **Ayush Dashavidha Pariksha**: 10-fold assessment (*Prakriti*, *Vikriti*, *Agni*, *Bala*, *Satwa*, *Ahara-shakti*, *Vyayamshakti*, *Vayah*, *Kosta*, *Deha*)
- **Contraindication engine**: drug-herb interaction alerts (Aspirin + Arjuna, Warfarin + Garlic)
- **Red-flag detection**: auto-escalates P1 emergencies to ER with one-click

### 📷 OCR Prescription & Lab Report Scanner
- Multi-document scan queue (WebRTC camera / file upload)
- Extracts drug names, dosages, frequencies, lab values
- Discrepancy resolution: voice vs. scanned values

### 🔐 ABDM / ABHA Integration
- ABHA 14-digit ID verification + OTP / Face Auth
- HL7 FHIR R4 bundle generation (NRCES-compliant, SNOMED CT + NAMASTE codings)
- DPDP Act 2023: ephemeral RAM purge, zero data retention

### 👥 Role-Specific Profiles
| Role | Features |
|---|---|
| **Patient** | ABHA health card, EHR history, accessibility settings |
| **Doctor** | Medical credentials, e-Sign RSA-2048, alert thresholds |
| **Nurse** | Triage badge, P1 chime alerts, shift handoff reports |
| **Administrator** | ABDM telemetry, IndicTrans2 precision controls, purge timers |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, React Router v6 |
| **ASR Engine** | AI4Bharat IndicConformer 600M (ONNX Runtime + CUDA), FastAPI, port 8001 |
| **TTS Engine** | AI4Bharat Indic Parler-TTS 20-Language (PyTorch CUDA), FastAPI, port 8002 |
| **Translation** | AI4Bharat IndicTrans2 200M (PyTorch FP16), FastAPI, port 8000 |
| **Interoperability** | HL7 FHIR R4, ABDM Level-3, SNOMED CT, NAMASTE Ayush |
| **Privacy** | DPDP Act 2023 compliant, ephemeral session RAM |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **Python** 3.10 / 3.11 (Conda `attendance` env recommended)
- **CUDA GPU** (optional — CPU fallback supported)

### 1. Frontend
```bash
npm install
npm run dev
# → http://localhost:5173
```

### 2. ASR Backend (IndicConformer 600M — port 8001)
```bash
# Download model weights first (one-time, ~2GB)
python backend/medikiosk-asr/download_model.py

# Start ASR server
C:\ProgramData\anaconda3\envs\attendance\python.exe backend/medikiosk-asr/main.py
# → http://localhost:8001
# → http://localhost:8001/docs  (Swagger UI)
```

### 3. TTS Backend (Indic Parler-TTS — port 8002)
```bash
# Download model weights (one-time, ~3.75GB)
python backend/medikiosk-tts/download_tts.py

# Start TTS server
C:\ProgramData\anaconda3\envs\attendance\python.exe backend/medikiosk-tts/main.py
# → http://localhost:8002
# → http://localhost:8002/docs  (Swagger UI)
```

### 4. Translation Backend (IndicTrans2 — port 8000)
```bash
cd backend/medikiosk-translation
pip install -r requirements.txt
python main.py
# → http://localhost:8000
```

### 5. Production Build
```bash
npx tsc --noEmit   # type check
npm run build      # → dist/
```

---

## 📡 ASR API Reference

Base URL: `http://localhost:8001`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Model status, device, load state |
| `GET` | `/api/supported-languages` | All 22 language codes |
| `POST` | `/api/transcribe` | **CTC** — fastest (~25ms) |
| `POST` | `/api/transcribe-accurate` | **RNNT** — accurate (~65ms) |
| `POST` | `/api/timestamps` | CTC + word-level timestamps |
| `POST` | `/api/init-model` | Trigger background init |

**Example — transcribe audio:**
```bash
curl -X POST http://localhost:8001/api/transcribe \
  -F "file=@audio.webm" \
  -F "lang_code=hi"
```

**Response:**
```json
{
  "success": true,
  "language_id": "hi",
  "transcript": "मुझे पेट में बहुत दर्द हो रहा है",
  "duration_seconds": 3.2,
  "is_silent": false,
  "latency_ms": 27.4,
  "model_name": "ai4bharat/indic-conformer-600m-multilingual",
  "decoder": "ctc"
}
```

---

## 📂 Project Structure

```
medikiosk/
├── backend/
│   ├── medikiosk-asr/              # IndicConformer 600M ASR service (port 8001)
│   │   ├── main.py                 # FastAPI app — 3 ASR endpoints
│   │   ├── indic_asr.py            # ONNX engine, thread-safe, CTC+RNNT+timestamps
│   │   ├── audio_processor.py      # Tensor-direct audio decode (no temp files)
│   │   ├── download_model.py       # One-time model weight downloader
│   │   └── models/
│   │       └── indic-conformer-600m-multilingual/   # Downloaded model weights
│   └── medikiosk-translation/      # IndicTrans2 translation service (port 8000)
│       ├── main.py
│       └── requirements.txt
├── src/
│   ├── components/
│   │   ├── clinical/               # Doctor/Nurse workstation, FHIR export
│   │   ├── kiosk/
│   │   │   ├── auth/               # ABHA verification flow
│   │   │   ├── intake/
│   │   │   │   ├── IntakeScreen.tsx     # Real ASR voice intake (IndicConformer)
│   │   │   │   ├── WelcomeScreen.tsx    # Language + OPD mode selector
│   │   │   │   └── RedFlagModal.tsx     # P1 emergency escalation modal
│   │   │   ├── scanner/            # OCR prescription scanner
│   │   │   └── receipt/            # Token receipt + queue display
│   │   ├── layout/                 # Universal header, sidebar, footer
│   │   ├── profiles/               # Patient, Doctor, Nurse, Admin profiles
│   │   └── settings/               # Role-specific settings screens
│   ├── context/
│   │   ├── MediKioskContext.tsx    # Global session state
│   │   └── TranslationContext.tsx  # 15ms micro-batch translation queue
│   ├── lib/
│   │   ├── asrApi.ts               # IndicConformer 600M API client
│   │   ├── translationApi.ts       # IndicTrans2 batch translation client
│   │   ├── speechUtils.ts          # Web Speech API TTS engine
│   │   └── languageMap.ts          # 22-language FLORES-200 code map
│   └── types.ts                    # Full TypeScript type definitions
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 🌍 Environment Variables

Create `.env` from `.env.example`:

```env
VITE_ASR_API_URL=http://localhost:8001        # IndicConformer ASR backend
VITE_TRANSLATION_API_URL=http://localhost:8000 # IndicTrans2 translation backend
```

---

## 📜 License & Attribution

- **IndicConformer 600M**: AI4Bharat, IIT Madras — [HuggingFace](https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual)
- **IndicTrans2**: AI4Bharat — [GitHub](https://github.com/AI4Bharat/IndicTrans2)
- **ABDM Standards**: National Health Authority, Government of India
- **MediKiosk Platform**: Built for Indian public healthcare digitization
