# 🧠 MediKiosk MedGemma 2.1 Clinical LLM Microservice
### Google MedGemma 1.5 / 2.1 — Clinical Reasoning & Multilingual Dialogue

[![Version](https://img.shields.io/badge/Release-v2.1.0-emerald.svg)](https://github.com/balajikonda9046/Medi-kiosk)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Enterprise Clinical AI Reasoning Microservice** running on **Port 8005** (or via Colab Ngrok GPU proxy).  
> Powers adaptive SOCRATES patient intake, SOAP note synthesis, Chain-of-Verification (CoVe) auditing, AYUSH herb-drug safety checking, and NRCES-compliant HL7 FHIR R4 exportation.

---

## 📦 What's in This Directory

```
backend/medikiosk-medgemma/
├── main.py                     # FastAPI server — SOAP, CoVe, Vision, FHIR, /ws/intake-stream
├── medgemma_engine.py          # Clinical LLM Engine — prompt engineering, JSON parser, 180s timeout
├── colab_medgemma_server.py    # Google Colab GPU proxy server with Ngrok tunnel
├── test_medgemma.py            # Unit test battery verifying SOAP generation & remote URL
├── test_5_questions.py         # 5/5 Enterprise Clinical Evaluation Question Test Suite
├── test_stream.py              # WebSocket streaming test
├── requirements.txt            # Python dependencies
└── models/                     # Cache directory for GGUF / HF weights
```

---

## 🚀 Version 2.1.0 Key Features & Enhancements

1. **180-Second Colab GPU Timeout Resilience**:
   - Upgraded HTTP timeouts to 180s in `medgemma_engine.py` with automatic retry logic to handle heavy Colab T4/A100 GPU generation loads.
2. **WebSocket Real-Time Token Generator (`WS /ws/intake-stream`)**:
   - Streams incremental LLM tokens chunk-by-chunk over WebSockets for instant kiosk speech output.
3. **Chain-of-Verification (CoVe) Self-Correction Loop (`POST /api/cove-reasoning`)**:
   - 4-stage audit pipeline:
     1. Baseline Draft Generation
     2. Verification Question Generation
     3. Independent Fact-Checking
     4. Final Audited & Corrected Verdict
4. **5/5 Enterprise Clinical Evaluation Questions Passed**:
   - Evaluated and verified across 5 complex medical diagnostic & triage scenarios (`test_5_questions.py`).
5. **ABDM HL7 FHIR R4 Bundle Generator (`POST /api/export-fhir`)**:
   - Converts clinical encounters into NRCES-compliant FHIR R4 bundles containing `Patient`, `Encounter`, `Condition`, `Observation`, and `MedicationStatement` resources with SNOMED CT and NAMASTE Ayush codings.

---

## 📡 API Reference

Base URL: `http://localhost:8005` (or `MEDGEMMA_REMOTE_URL` Ngrok proxy)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health & GPU backend status |
| `POST` | `/api/soap-synthesis` | Synthesize Allopathic SOAP note & Dashavidha assessment |
| `POST` | `/api/cove-reasoning` | **Chain-of-Verification 4-Stage Self-Correction Audit** |
| `POST` | `/api/analyze-vision` | Multimodal X-ray/Prescription image analysis |
| `POST` | `/api/herb-drug-check` | AYUSH & Allopathic herb-drug contraindication checker |
| `POST` | `/api/export-fhir` | **NRCES-Compliant HL7 FHIR R4 Bundle Exporter** |
| `WS` | `/ws/intake-stream` | **Real-Time Token Streaming Endpoint** |

---

## 🧪 Enterprise Unit Test

Run the 5/5 Clinical Evaluation test suite:

```bash
python backend/medikiosk-medgemma/test_5_questions.py
```
