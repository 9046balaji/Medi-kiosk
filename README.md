# 🏥 MediKiosk — AI-Powered Indic Multilingual OPD Kiosk & Clinical Workstation

[![Version](https://img.shields.io/badge/Release-v2.2.0_Enterprise-emerald.svg)](https://github.com/balajikonda9046/Medi-kiosk)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10_%7C_3.11-teal.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.3_TypeScript-cyan.svg)](https://reactjs.org/)
[![AI4Bharat](https://img.shields.io/badge/AI4Bharat-IndicConformer_%7C_IndicTrans2_%7C_ParlerTTS-purple.svg)](https://ai4bharat.iitm.ac.in/)
[![MedGemma](https://img.shields.io/badge/LLM-MedGemma_1.5_%2F_2.1-amber.svg)](https://huggingface.co/google/medgemma)

> **Production-Grade Smart Hospital Kiosk Platform** engineered for Indian public healthcare ecosystems — AIIMS, AIIA, District Hospitals, and Primary Health Centers (PHCs).  
> Integrates **real-time ASR in 22 scheduled Indian languages**, **MedGemma 2.1 AI clinical SOAP assessment**, **Ayush AyurParam GGUF Dashavidha & Tridosha Pariksha**, **Florence-2 Vision OCR prescription scanning**, **Indic Parler-TTS neural speech synthesis**, **Enterprise AI Microservice Gateway Router**, and **ABDM HL7 FHIR R4 interoperability**.

---

## 🚀 Key Release Versions & Microservices

| Microservice Module | Tag / Release | Port | Underlying AI Model | Primary Responsibilities |
| --- | --- | --- | --- | --- |
| **Enterprise AI Gateway** | `v2.1.0-ai-gateway-multi-model` | 8007 | Gateway Router Engine | Smart request classification, async multiplexing, automatic cross-model failover, and telemetry. |
| **Allopathic Clinical Brain** | `v2.1.0-medgemma-clinical` | 8005 / Ngrok | Google MedGemma 1.5 / 2.1 | Adaptive SOCRATES intake, token streaming (`/ws/intake-stream`), Chain-of-Verification (CoVe) audit, FHIR synthesis. |
| **AYUSH Clinical Brain** | `v2.0.0-ayurparam-ayush` | 8006 / Ngrok | AyurParam GGUF (4-bit Q4_K_M) | 10-Fold Dashavidha Pariksha assessment, Tridosha imbalance, AYUSH Herb-Drug interaction matrix. |
| **Vision OCR Engine** | `v2.0.0-ocr-vision` | 8002 | Microsoft Florence-2-base | Prescription & lab report scanning, OpenCV CLAHE/deskewing, CDSCO/RxNorm/AYUSH fuzzy drug normalizer. |
| **Speech Synthesis (TTS)** | `v2.0.0-indic-tts` | 8002 | AI4Bharat Indic Parler-TTS | 20-Language + English neural speech, medical G2P acronyms, triage prosody mapping, `< 400ms` streaming (`/api/tts-stream`). |
| **Speech Recognition (ASR)**| `v2.0.0-indic-asr` | 8001 | AI4Bharat IndicConformer 600M | 22 Scheduled Indian languages, CTC (~25ms) & RNNT (~65ms) decoders, Inverse Text Normalization (ITN), WebSocket streaming (`/ws/transcribe`). |
| **Multilingual Translation** | `v2.0.0-indic-translation` | 8000 | AI4Bharat IndicTrans2 FP16 | 22 Language script translation, air-gapped offline model loading, Medical Lexicon Protection Engine (`[MED_PROT_N]`). |

---

## ☁️ Cloud GPU Model Storage & Google Colab Notebook Links

Access pre-trained GPU model weights and Colab Notebook launchers directly on Google Drive:

| Model & Service | Cloud Drive & Colab Notebook Link | Model Specs & Execution Guide |
| --- | --- | --- |
| **🤖 Google MedGemma 1.5 / 2.1 LLM** | [📁 MedGemma Google Drive Folder](https://drive.google.com/drive/folders/16uhmYsF8fAhQwwGy3HItju56YzhMKe75?usp=sharing) | PyTorch FP16 CUDA weights, Colab GPU notebook launcher, PyNgrok tunnel server (`medikiosk-medgemma`). |
| **🌿 AYUSH AyurParam GGUF LLM** | [📁 AyurParam GGUF Google Drive Folder](https://drive.google.com/drive/folders/1RQVaJkrjABn6mkZCk0PnomI7ch2zKwfo?usp=sharing) | `ayurparam-q4_k_m.gguf` (4-bit quantized), 10-Fold Dashavidha assessment engine, PyNgrok tunnel server (`medikiosk-AyurParam`). |

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

### 2. Google MedGemma 2.1 Conversational Clinical Brain
- **Adaptive SOCRATES Intake**: Multi-turn dialogue generation tailoring next questions to patient responses.
- **Chain-of-Verification (CoVe)**: Self-correction audit pipeline generating verification checklists and final audited clinical verdicts.
- **ABDM HL7 FHIR R4 Bundle Exporter**: Auto-synthesizes NRCES-compliant FHIR R4 JSON bundles with SNOMED CT codings.
- **Drive Model Repository**: [MedGemma Drive Folder](https://drive.google.com/drive/folders/16uhmYsF8fAhQwwGy3HItju56YzhMKe75?usp=sharing)

### 3. AYUSH AyurParam GGUF Clinical LLM
- **10-Fold Dashavidha Pariksha Matrix**: Evaluates *Prakriti*, *Vikriti*, *Agni*, *Kosta*, *Sara*, *Samhanana*, *Pramana*, *Satmya*, *Sattva*, and *Vaya*.
- **Tridosha Imbalance Analyzer**: Calculates percentage distribution (*Vata*, *Pitta*, *Kapha*).
- **Herb-Drug Cross-Checker**: Safety contraindication matrix for Allopathic vs AYUSH formulations.
- **Drive Model Repository**: [AyurParam Drive Folder](https://drive.google.com/drive/folders/1RQVaJkrjABn6mkZCk0PnomI7ch2zKwfo?usp=sharing)

---

## 🛠️ Technology Stack

| Architecture Layer | Technology |
| --- | --- |
| **Frontend UI** | React 18.3, TypeScript 5.5, Vite 6.4, Vanilla CSS, Lucide Icons, React Router v6 |
| **AI Gateway Router** | FastAPI, Port 8007, Smart Keyword Classifier, Async `httpx` Multiplexer |
| **ASR Speech Recognition** | AI4Bharat IndicConformer 600M (ONNX CUDA Runtime), FastAPI, Port 8001 |
| **Neural Speech Synthesis** | AI4Bharat Indic Parler-TTS 20-Language (PyTorch FP16 CUDA), FastAPI, Port 8002 |
| **Vision OCR Engine** | Microsoft Florence-2-base, OpenCV CLAHE/deskewing, FastAPI, Port 8002 |
| **Indic Translation** | AI4Bharat IndicTrans2 200M (PyTorch FP16 CUDA), FastAPI, Port 8000 |
| **Allopathic Clinical LLM** | Google MedGemma 1.5 / 2.1 (GPU Colab / Local Service), Port 8005 |
| **AYUSH Clinical LLM** | AyurParam GGUF (GPU Colab / Local Service), Port 8006 |
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

### 3. AI Gateway Microservice (Port 8007)
```bash
cd backend/medikiosk-gateway
pip install -r requirements.txt
python main.py
# → http://localhost:8007
```

### 4. Run Enterprise Test Battery
```bash
# Test AI Gateway Router & Dual Colab Servers
python backend/medikiosk-gateway/test_e2e_full_flow.py

# Test AyurParam GGUF
python backend/medikiosk-AyurParam/test_ayurparam.py

# Test MedGemma
python backend/medikiosk-medgemma/test_medgemma.py
```

---

## 📜 License & Acknowledgments

- **AI4Bharat**: IIT Madras Research — IndicConformer, IndicTrans2, Indic Parler-TTS.
- **Google DeepMind / HuggingFace**: MedGemma 1.5 / 2.1 Clinical LLM.
- **AyurParam Team**: GGUF Quantized AYUSH Model.
- **Microsoft Research**: Florence-2 Vision Model.
- **National Health Authority (NHA)**: ABDM & Ayush Healthcare Interoperability Standards.

---
*Built with ❤️ for Indian Public Healthcare Digitization.*
