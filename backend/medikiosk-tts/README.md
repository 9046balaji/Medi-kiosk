# 🔊 MediKiosk Indic Parler-TTS Microservice 2.0
### AI4Bharat Indic Parler-TTS — 20-Language Neural Speech Synthesis

[![Version](https://img.shields.io/badge/Release-v2.0.0-emerald.svg)](https://github.com/balajikonda9046/Medi-kiosk)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Enterprise Neural Text-to-Speech (TTS) Microservice** for 20 Indian languages and English.  
> Powered by `ai4bharat/indic-parler-tts` via **PyTorch FP16 CUDA acceleration**.  
> Features **Medical G2P Acronym Expansion**, **Dynamic Triage Prosody Mapping**, **SHA-256 LRU Audio Caching**, **Audio Resampling**, and **Chunk Streaming (< 400ms TTFA)**.

---

## 📦 What's in This Directory

```
backend/medikiosk-tts/
├── main.py              # FastAPI server — /api/tts, /api/tts-stream, /api/unload
├── indic_tts.py         # TTS Engine wrapper — thread-safe lock, Medical G2P, Prosody, SHA-256 LRU
├── download_tts.py      # One-time HuggingFace model downloader
├── test_tts.py          # Enterprise unit test battery verifying G2P, prosody, 0ms cache
├── requirements.txt     # Python dependencies
└── models/
    └── indic-parler-tts/ # Local FP16 model weights (~3.75GB)
```

---

## 🚀 Version 2.0.0 Architectural Upgrades

1. **GPU Concurrency Lock (`_inference_lock`)**:
   - Protects `self.model.generate()` with a mutex lock to prevent concurrent HTTP requests from causing CUDA allocation collisions.
2. **Medical G2P & Clinical Acronym Expansion**:
   - Pre-processes clinical terms before phonemization:
     - `"BP 120/80"` $\rightarrow$ `"Blood Pressure 120 over 80"`
     - `"ECG"` $\rightarrow$ `"Electrocardiogram"` / `"ईसीजी"`
3. **Dynamic Triage Prosody Tone Mapping**:
   - Maps emergency triage priorities (`P1_CRITICAL` urgent vs `P3_ROUTINE` calm) into acoustic prompt descriptions.
4. **In-Memory SHA-256 LRU Audio Buffer**:
   - Hashes synthesis prompts for **0.0 ms GPU latency** on repeated kiosk navigation prompts.
5. **Streaming Audio Endpoint (`POST /api/tts-stream`)**:
   - Yields 4096-byte WAV chunks delivering **Time-To-First-Audio (TTFA) under 400ms**.

---

## 📡 API Reference

Base URL: `http://localhost:8002`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service status, device, model state |
| `GET` | `/api/supported-languages` | All 20 supported language codes |
| `POST` | `/api/tts` | Synthesize audio WAV buffer |
| `POST` | `/api/tts-stream` | **Streaming Chunked Audio (< 400ms TTFA)** |
| `POST` | `/api/unload` | Free GPU VRAM immediately |

---

## 🧪 Enterprise Unit Test

Run the TTS test battery:

```bash
python backend/medikiosk-tts/test_tts.py
```

Output:
```
=================================================================================
 🔊 MEDIKIOSK INDIC PARLER-TTS 2.0 ENTERPRISE TEST BATTERY                        
=================================================================================
  ✓ PASS: Medical G2P Expansion verified!
  ✓ PASS: Dynamic Triage Prosody Mapping verified!
  ✓ PASS: 0ms SHA-256 LRU Cache hit verified!
  ✓ PASS: Audio resampling to 16000Hz verified!
  ✓ PASS: Concurrency guard & 120s idle eviction timer verified!
```
