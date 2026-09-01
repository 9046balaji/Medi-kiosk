# 🌐 MediKiosk IndicTrans2 Translation Microservice 2.0
### AI4Bharat IndicTrans2 FP16 — 22-Language Neural Translation

[![Version](https://img.shields.io/badge/Release-v2.0.0-emerald.svg)](https://github.com/balajikonda9046/Medi-kiosk)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Enterprise Neural Machine Translation Engine** for 22 scheduled Indian languages and English.  
> Powered by AI4Bharat's `indictrans2-en-indic-dist-200M` Transformer model, PyTorch FP16 CUDA acceleration, and FastAPI.  
> Features **Medical Lexicon Protection**, **Air-Gapped Offline Loading**, **Bounded OrderedDict LRU Caching**, and **120s Idle VRAM Eviction**.

---

## 📦 What's in This Directory

```
backend/medikiosk-translation/
├── main.py              # FastAPI server — translate, batch-translate, translate-html
├── translator.py        # IndicTrans2 engine — thread-safe, Medical Lexicon Protection, bounded LRU
├── test_translation.py  # Enterprise unit test battery verifying offline load, lexicon protection
├── requirements.txt     # Python dependencies
├── Dockerfile           # Multi-stage production container image
├── docker-compose.yml   # Container orchestration config
└── models/
    └── indictrans2-en-indic-dist-200M/   # Local FP16 model weights & tokenizers (~1.1GB)
```

---

## 🚀 Version 2.0.0 Upgrades & Architectural Enhancements

1. **Thread-Safe Initialization Lock**:
   - `initialize()` uses `with self._lock:` entry guards to prevent concurrent HTTP requests from launching dual model loads and crashing with CUDA Out Of Memory (OOM).
2. **Air-Gapped Local Offline Loading**:
   - Loads tokenizers directly from `local_model_dir` with `local_files_only=True`, eliminating 401 Client Errors from gated HuggingFace online endpoints during hospital network disconnections.
3. **Medical Lexicon Protection Engine (`protect_medical_lexicon`)**:
   - Masks clinical dosages (`40mg`, `500mg`), active drug names (`Pantoprazole`, `Avipattikar Churna`), and vitals (`BP 120/80`, `SpO2 98%`) with placeholder tokens (`[MED_PROT_N]`) prior to translation and restores them cleanly afterwards.
4. **Bounded `OrderedDict` LRU Cache**:
   - Replaced unbounded dictionary with `OrderedDict` capped at 10,000 items to prevent RAM growth under continuous kiosk operation.
5. **Configurable 120s Idle VRAM Timeout**:
   - Automatically unloads model weights from VRAM after 120s of inactivity (`TRANSLATION_IDLE_TIMEOUT`).

---

## 📡 API Reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/languages` | Supported 22 language FLORES codes |
| `POST` | `/api/translate` | Single sentence translation |
| `POST` | `/api/batch-translate` | Batch array translation with sub-15ms queueing |
| `POST` | `/api/translate-html` | DOM preservation text node HTML translator |
| `POST` | `/api/unload` | Immediately free GPU VRAM |

---

## 🧪 Enterprise Unit Test

Run the translation test battery:

```bash
python backend/medikiosk-translation/test_translation.py
```

Output:
```
=================================================================================
 🌐 MEDIKIOSK INDICTRANS2 NEURAL MODEL LOAD & INFERENCE TEST                    
=================================================================================
INFO:IndicTranslator:[IndicTrans2 2.0] Initializing model from 'models/indictrans2-en-indic-dist-200M' on device: cuda
INFO:IndicTranslator:[IndicTrans2 2.0] ✅ Model & IndicProcessor loaded successfully on cuda!
  Input Text  : 'Welcome to MediKiosk hospital intake kiosk. Please select your language.'
  Neural Output: 'मीडियोकियोस्क अस्पताल के प्रवेश कियोस्क में आपका स्वागत है। कृपया अपनी भाषा चुनें।'
  Latency     : 836.54 ms
  ✓ PASS: IndicTrans2 FP16 Neural Model is fully loaded and inferencing cleanly on GPU!
```
