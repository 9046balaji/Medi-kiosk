# 🏥 MediKiosk IndicTrans2 Translation Backend Microservice

An ultra-fast, high-throughput AI translation backend designed for rural & urban Indian hospital OPD kiosks and clinical workstations. Powered by AI4Bharat's `indictrans2-en-indic-dist-200M` Transformer model, FastAPI, PyTorch FP16/INT8 precision, and micro-batch queueing.

---

## 🌟 Key Features

- **22 Scheduled Indic Languages**: Supports Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, Sanskrit, Nepali, Manipuri, Bodo, Santhali, Dogri, Kashmiri, Konkani, Maithili, and Sindhi.
- **FastAPI Micro-Batch Server**: Asynchronous HTTP endpoint with sub-15ms queue window.
- **Zero-Latency In-Memory LRU Cache**: 0.0ms hit latency for pre-compiled UI dictionary strings.
- **PyTorch FP16 Acceleration**: Reduced GPU/CPU VRAM footprint with FP16/INT8 weight quantization.
- **ABDM & DPDP Act 2023 Compliant**: Zero-retention ephemeral RAM purge after session transmission.

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10 or 3.11
- Conda or standard `venv`
- PyTorch 2.0+

### 2. Environment Setup (Conda)
```bash
# Activate Conda environment
conda activate attendance

# Install dependencies
pip install -r requirements.txt
```

### 3. Run FastAPI Backend Server
```bash
# Start FastAPI server on port 8000
python main.py
```
The server will run at: `http://localhost:8000`

---

## 🐳 Docker Deployment

You can run the microservice using Docker or Docker Compose:

```bash
# Build and run container
docker compose up -d --build

# View server logs
docker compose logs -f
```

---

## 📡 API Endpoints Reference

### 1. Health Check
`GET /api/health`
- **Response**: `{"status": "ok", "service": "MediKiosk IndicTrans2 Microservice"}`

### 2. Supported Languages List
`GET /api/languages`
- **Response**: Returns JSON list of all 22 supported Indic languages and FLORES-200 codes.

### 3. Single Text Translation
`POST /api/translate`
- **Request Body**:
```json
{
  "text": "Welcome to AIIMS OPD Registration Kiosk",
  "src_lang": "eng_Latn",
  "tgt_lang": "hin_Deva"
}
```
- **Response**:
```json
{
  "success": true,
  "src_lang": "eng_Latn",
  "tgt_lang": "hin_Deva",
  "translations": ["एम्स ओपीडी पंजीकरण कियोस्क में आपका स्वागत है"],
  "model_used": "ai4bharat/indictrans2-en-indic-dist-200M"
}
```

### 4. High-Throughput Batch Translation
`POST /api/batch-translate`
- **Request Body**:
```json
{
  "texts": [
    "Patient Name",
    "Blood Pressure",
    "Chief Complaint"
  ],
  "src_lang": "eng_Latn",
  "tgt_lang": "tam_Taml"
}
```

---

## 📂 Project Architecture

```
backend/medikiosk-translation/
├── main.py              # FastAPI server entry point & route definitions
├── translator.py        # IndicTrans2 PyTorch model loader & micro-batcher
├── requirements.txt     # Python dependencies
├── Dockerfile           # Multi-stage production container image
├── docker-compose.yml   # Container orchestration config
└── start.bat            # Quick launch script for Windows environments
```
