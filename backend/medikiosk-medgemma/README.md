# 🤖 MediKiosk MedGemma 2.1 Clinical LLM Microservice
### Google MedGemma 1.5 / 2.1 PyTorch GPU Engine & Colab Server

[![Version](https://img.shields.io/badge/Release-v2.1.0-amber.svg)](https://github.com/balajikonda9046/Medi-kiosk)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Allopathic AI Clinical Brain** running on **Port 8005** or **Google Colab GPU Ngrok Tunnel**.  
> Features **Adaptive SOCRATES Intake**, **Chain-of-Verification (CoVe) Audit Loop**, **Multimodal Vision Analysis**, **Herb-Drug Cross-Checker**, and **HL7 FHIR R4 Bundle Exporter**.

---

## ☁️ Google Drive Model & Colab Notebook Link

Access pre-trained MedGemma PyTorch weights and Colab Notebook launcher directly on Google Drive:

- 📁 **Google Drive Model Folder & Colab Notebook**: [https://drive.google.com/drive/folders/16uhmYsF8fAhQwwGy3HItju56YzhMKe75?usp=sharing](https://drive.google.com/drive/folders/16uhmYsF8fAhQwwGy3HItju56YzhMKe75?usp=sharing)

---

## 📦 What's in This Directory

```
backend/medikiosk-medgemma/
├── main.py                     # FastAPI server — Port 8005 (/api/generate, /api/synthesize, /api/cove-reasoning)
├── medgemma_engine.py          # PyTorch GPU model wrapper, CoVe audit loop, FHIR exporter
├── colab_medgemma_server.py    # Colab launcher script starting PyNgrok GPU tunnel
├── test_medgemma.py            # Unit test battery verifying live inference & SOAP synthesis
├── requirements.txt            # Dependencies
└── README.md                   # Documentation
```

---

## 🚀 Running on Google Colab GPU

1. Open the Colab notebook from the [Google Drive Folder](https://drive.google.com/drive/folders/16uhmYsF8fAhQwwGy3HItju56YzhMKe75?usp=sharing).
2. Execute the setup cell:
```python
!pip install -q transformers torch pyngrok fastapi uvicorn httpx
!python colab_medgemma_server.py --ngrok-token <YOUR_NGROK_AUTHTOKEN>
```
3. Copy the generated Ngrok tunnel URL (e.g. `https://unilludedly-pipier-paola.ngrok-free.dev`) and set `MEDGEMMA_REMOTE_URL` in `.env`.

---

## 📡 API Reference (Port 8005)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | **Returns GPU status, CUDA memory, and model ready status** |
| `POST` | `/generate` | Direct LLM text generation endpoint |
| `POST` | `/api/synthesize` | Generates Allopathic SOAP notes |
| `POST` | `/api/cove-reasoning` | **Runs Chain-of-Verification (CoVe) 4-stage audit loop** |
| `POST` | `/api/export-fhir` | Exports ABDM-compliant HL7 FHIR R4 Bundle JSON |
