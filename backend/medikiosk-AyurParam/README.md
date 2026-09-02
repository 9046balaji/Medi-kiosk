# 🌿 MediKiosk AyurParam GGUF AYUSH LLM Microservice
### Quantized GGUF Q4_K_M Model & Colab GPU Engine

[![Version](https://img.shields.io/badge/Release-v2.0.0-emerald.svg)](https://github.com/balajikonda9046/Medi-kiosk)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **AYUSH Clinical Brain** running on **Port 8006** or **Google Colab GPU Ngrok Tunnel**.  
> Features **10-Fold Dashavidha Pariksha Matrix**, **Tridosha (Vata/Pitta/Kapha) Imbalance Analysis**, **AYUSH & Allopathic Herb-Drug Safety Matrix**, and **HL7 FHIR R4 Bundle Exporter**.

---

## ☁️ Google Drive Model & Colab Notebook Link

Access pre-trained AyurParam GGUF quantized weights (`ayurparam-q4_k_m.gguf`) and Colab Notebook launcher directly on Google Drive:

- 📁 **Google Drive Model Folder & Colab Notebook**: [https://drive.google.com/drive/folders/1RQVaJkrjABn6mkZCk0PnomI7ch2zKwfo?usp=sharing](https://drive.google.com/drive/folders/1RQVaJkrjABn6mkZCk0PnomI7ch2zKwfo?usp=sharing)

---

## 📦 What's in This Directory

```
backend/medikiosk-AyurParam/
├── main.py                     # FastAPI server — Port 8006 (/generate, /api/soap-synthesis, /api/tridosha-analysis)
├── ayurparam_engine.py         # GGUF engine wrapper, 10-Fold Dashavidha matrix, Tridosha analyzer, Herb-Drug checker
├── colab_ayurparam_server.py   # Colab launcher script starting PyNgrok GPU tunnel
├── test_ayurparam.py           # Unit test battery verifying live GGUF inference
├── test_5_questions.py         # 5/5 Clinical Evaluation test suite (100% Pass)
├── requirements.txt            # Dependencies
└── README.md                   # Documentation
```

---

## 🚀 Running on Google Colab GPU

1. Open the Colab notebook from the [Google Drive Folder](https://drive.google.com/drive/folders/1RQVaJkrjABn6mkZCk0PnomI7ch2zKwfo?usp=sharing).
2. Execute the setup cell:
```python
!pip install -q llama-cpp-python pyngrok fastapi uvicorn httpx
!python colab_ayurparam_server.py --ngrok-token <YOUR_NGROK_AUTHTOKEN>
```
3. Copy the generated Ngrok tunnel URL (e.g. `https://doormat-undying-detergent.ngrok-free.dev`) and set `AYURPARAM_REMOTE_URL` in `.env`.

---

## 📡 API Reference (Port 8006)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | **Returns GGUF Q4_K_M model status and CUDA memory** |
| `POST` | `/generate` | Direct GGUF prompt text generation endpoint |
| `POST` | `/api/soap-synthesis` | **Generates 10-Fold Dashavidha Pariksha assessment JSON** |
| `POST` | `/api/tridosha-analysis` | **Calculates Vata/Pitta/Kapha percentage breakdown** |
| `POST` | `/api/herb-drug-check` | Allopathic & AYUSH Herb-Drug interaction safety checker |
