# MediKiosk MedGemma 1.5 Clinical LLM Microservice

The **MediKiosk MedGemma Microservice** is a clinical LLM reasoning microservice running on **Port 8005** (or via Colab Ngrok GPU) that powers AI-driven patient intake dialogue, SOAP note synthesis, discrepancy reconciliation, multimodal vision analysis, AYUSH herb-drug safety cross-checking, and FHIR R4 exportation.

---

## Code Refinements & Bug Fixes

1. **Dynamic Remote Ngrok URL**:
   - Replaced hardcoded Ngrok URLs with `MEDGEMMA_REMOTE_URL` environment variables (`medgemma_engine.remote_url`).
2. **Non-Blocking Asynchronous Execution (`httpx.AsyncClient`)**:
   - Converted route handlers to `async def` using `httpx.AsyncClient` with a 45-second timeout, preventing FastAPI threadpool blocking during GPU model generation.
3. **Multi-Stage Robust JSON Parser**:
   - Implemented `_parse_json_robust()` to clean trailing commas, repair unquoted keys, and handle unescaped quotes in LLM responses.
4. **Explicit Multilingual Prompt Translation**:
   - Added target language instructions to prompts when `language` is not English (e.g. Hindi, Telugu, Tamil, Hinglish, Bengali, etc.).

---

## Feature Roadmap & API Endpoints

| Endpoint | Method | Feature & Clinical Impact |
| --- | --- | --- |
| `POST /api/analyze-vision` | `POST` | **Multimodal Vision Analysis**: Accepts Base64 image inputs (X-rays, skin lesions, lab panels) and extracts lab metrics (HbA1c, eGFR, Glucose) and visual diagnostic impressions. |
| `POST /api/herb-drug-check` | `POST` | **Herb-Drug & AYUSH Safety Cross-Checker**: Verifies active allopathic prescriptions against AYUSH formulations (e.g. Warfarin + Ginkgo bleeding risk) to prevent adverse interactions. |
| `POST /api/export-fhir` | `POST` | **FHIR R4 Resource Exporter**: Converts SOAP notes into HL7 FHIR R4 compliant JSON bundles (`Patient`, `Condition`, `Observation`, `MedicationStatement`). |
| `POST /api/patient-translation` | `POST` | **Plain-Language Patient Translator**: Translates complex medical jargon into simple, patient-friendly summaries. |
| `POST /api/cove-reasoning` | `POST` | **Chain-of-Verification (CoVe)**: Self-correction 4-step prompt loop (Draft -> Verification Questions -> Fact Checking -> Audited Verdict). |
| `WS /ws/intake-stream` | `WS` | **WebSocket Streaming Intake**: Streams MedGemma token responses incrementally for real-time kiosk speech output. |

---

## Quick Start

### 1. Local Run
```bash
cd backend/medikiosk-medgemma
pip install -r requirements.txt
python main.py
```
Server runs at `http://localhost:8005`.

### 2. Google Colab GPU Deployment
```bash
python colab_medgemma_server.py --ngrok-token <YOUR_NGROK_AUTHTOKEN>
```
Remote GPU proxy endpoint configured via `MEDGEMMA_REMOTE_URL`.
