# 🌿 MediKiosk AyurParam GGUF Clinical LLM Microservice 2.0
### AyurParam GGUF (`ayurparam-q4_k_m.gguf`) — AYUSH & Ayurvedic AI Clinical Intelligence

[![Version](https://img.shields.io/badge/Release-v2.0.0-emerald.svg)](https://github.com/balajikonda9046/Medi-kiosk)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Specialized Ayurvedic AI Microservice** running on **Port 8006** (or via Colab Ngrok GPU proxy).  
> Powered by `ayurparam-q4_k_m.gguf` via `llama-cpp-python` and FastAPI.  
> Features **10-Fold Dashavidha Pariksha Matrix**, **Tridosha (Vata/Pitta/Kapha) Imbalance Analysis**, **AYUSH & Allopathic Herb-Drug Interaction Matrix**, **Chain-of-Verification (CoVe) Audit**, and **NRCES-Compliant HL7 FHIR R4 Export**.

---

## 📦 What's in This Directory

```
backend/medikiosk-AyurParam/
├── main.py                     # FastAPI server — SOAP, Tridosha, Herb-Drug, CoVe, FHIR, /ws/intake-stream
├── ayurparam_engine.py         # AyurParam Engine — GGUF remote proxy, JSON repair parser, Dashavidha matrix
├── colab_ayurparam_server.py   # Google Colab GPU proxy server script with Ngrok tunnel
├── test_ayurparam.py           # Enterprise unit test battery verifying live GGUF, Dashavidha, Tridosha
├── test_5_questions.py         # 5/5 Enterprise AyurParam Clinical Evaluation Question Test Suite
├── test_stream.py              # WebSocket streaming test
├── requirements.txt            # Python dependencies
└── model/
    └── ayurparam-q4_k_m.gguf   # Local GGUF Q4_K_M model weights (~4.1GB)
```

---

## 🚀 Key Features & Capabilities

1. **10-Fold Dashavidha Pariksha Matrix**:
   - Synthesizes full Ayurvedic patient profiles across *Prakriti*, *Vikriti*, *Agni*, *Kosta*, *Sara*, *Samhanana*, *Pramana*, *Satmya*, *Sattva*, *Ahara Shakti*, *Vyayama Shakti*, and *Vaya*.
2. **Tridosha Imbalance Analyzer**:
   - Computes real-time percentage breakdown for Vata, Pitta, and Kapha doshas and prescribes targeted Ahara (Diet), Vihara (Lifestyle), and Aushadhi (Formulations).
3. **AYUSH & Allopathic Herb-Drug Safety Matrix**:
   - Cross-checks prescribed medications against known contraindications (e.g. *Aspirin + Guggulu* bleeding risk, *Metformin + Karela* hypoglycemia risk).
4. **180-Second Async Timeout Resilience**:
   - Uses non-blocking `httpx.AsyncClient` with 180s timeout resilience for high-load Colab T4/A100 GPU generation.
5. **NRCES-Compliant HL7 FHIR R4 Bundle Exporter**:
   - Export clinical notes as FHIR R4 JSON bundles tagged with NAMASTE Ayush and LOINC codings.

---

## 📡 API Reference

Base URL: `http://localhost:8006` (or `AYURPARAM_REMOTE_URL` Ngrok proxy)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health & model load status |
| `POST` | `/api/generate` | Direct GGUF text generation |
| `POST` | `/api/soap-synthesis` | **Ayurvedic SOAP & Dashavidha 10-Fold Synthesis** |
| `POST` | `/api/tridosha-analysis` | **Tridosha Imbalance Analyzer** |
| `POST` | `/api/herb-drug-check` | **AYUSH & Allopathic Herb-Drug Interaction Matrix** |
| `POST` | `/api/cove-reasoning` | **Chain-of-Verification 4-Stage Audit** |
| `POST` | `/api/export-fhir` | **NRCES HL7 FHIR R4 Bundle Exporter** |
| `POST` | `/api/patient-translation` | **Plain-Language Patient Advice in 22 Languages** |
| `WS` | `/ws/intake-stream` | **Real-Time Token Streaming Endpoint** |

---

## 🧪 Enterprise Unit Test

Run the 5/5 Clinical Evaluation test suite:

```bash
python backend/medikiosk-AyurParam/test_5_questions.py
```

Output:
```
=================================================================================
 🎉 ALL 5/5 CLINICAL EVALUATION QUESTIONS PASSED WITH 100% SUCCESS ON GPU!      
=================================================================================
```
