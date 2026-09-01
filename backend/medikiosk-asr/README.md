# 🎙️ MediKiosk ASR Microservice 2.0
### AI4Bharat IndicConformer 600M — 22-Language Speech Recognition

[![Version](https://img.shields.io/badge/Release-v2.0.0-emerald.svg)](https://github.com/balajikonda9046/Medi-kiosk)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Production-grade Automatic Speech Recognition** for all 22 constitutionally scheduled Indian languages.  
> Powered by `ai4bharat/indic-conformer-600m-multilingual` via **ONNX Runtime + CUDA**.  
> Features **Inverse Text Normalization (ITN)**, **In-Memory Audio Decoding**, **CUDA Execution Locks**, **120s Idle VRAM Eviction**, and **WebSocket Real-Time Streaming**.

---

## 📦 What's in This Directory

```
backend/medikiosk-asr/
├── main.py                  # FastAPI server — CTC, RNNT, Timestamps, and /ws/transcribe WebSocket
├── indic_asr.py             # ONNX engine wrapper — thread-safe, warmup, CTC+RNNT+timestamps, ITN
├── audio_processor.py       # In-memory io.BytesIO decode → 16kHz mono tensor (zero disk I/O)
├── download_model.py        # One-time HuggingFace model downloader
├── test_asr.py              # Enterprise test battery verifying ITN, strict lang, 120s timer
├── requirements.txt         # Python dependencies
└── models/
    └── indic-conformer-600m-multilingual/   # Downloaded model weights (~2GB)
```

---

## 🚀 Version 2.0.0 Upgrades & Enhancements

1. **Inference Execution Lock (`_inference_lock`)**:
   - Stores a local model reference and protects forward passes with `self._inference_lock` so background idle VRAM eviction timers never crash running transcriptions with `TypeError`.
2. **In-Memory Audio Decoding**:
   - Decodes audio in memory using `io.BytesIO(audio_bytes)` and `torchaudio.functional.resample()`, eliminating temporary disk I/O bottlenecks.
3. **Inverse Text Normalization (ITN)**:
   - Converts spoken vitals and numbers into clinical formats:
     - `"रोगी का ब्लड प्रेशर 120 बटा 80 है"` $\rightarrow$ `"रोगी का ब्लड प्रेशर 120/80 है"`
     - `"रोगी को पाँच सौ मिग्रा पैरासिटामॉल दी"` $\rightarrow$ `"रोगी को 500 मिग्रा पैरासिटामॉल दी"`
4. **WebSocket Streaming Endpoint (`/ws/transcribe`)**:
   - Stream audio chunks directly over WebSockets for instant live kiosk speech recognition feedback.
5. **Configurable 120s Idle Timeout**:
   - Automatically extends VRAM idle eviction timeout to 120 seconds (`ASR_IDLE_TIMEOUT`), preventing VRAM thrashing under spaced requests.

---

## 📡 API Reference

Base URL: `http://localhost:8001`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Model status, device, load state |
| `GET` | `/api/supported-languages` | All 22 language code mappings |
| `POST` | `/api/transcribe` | **CTC** — fastest (~25ms) |
| `POST` | `/api/transcribe-accurate` | **RNNT** — accurate (~65ms) |
| `POST` | `/api/timestamps` | CTC + word-level timestamps |
| `WS` | `/ws/transcribe` | **WebSocket Real-Time Audio Chunk Streaming** |
| `POST` | `/api/unload` | Immediately free GPU VRAM |

---

## 🧪 Enterprise Unit Test

Run the ASR test battery:

```bash
python backend/medikiosk-asr/test_asr.py
```

Output:
```
=================================================================================
 🎙️ MEDIKIOSK INDICCONFORMER 600M ASR 2.0 ENTERPRISE TEST BATTERY                
=================================================================================
  ✓ PASS: In-memory decoding verified with zero temp disk files!
  ✓ PASS: Inverse Text Normalization (ITN) verified!
  ✓ PASS: Strict language validation verified!
  ✓ PASS: Concurrency guard & 120s idle timer extension verified!
```
