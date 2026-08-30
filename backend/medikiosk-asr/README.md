# 🎙️ MediKiosk ASR Microservice
### AI4Bharat IndicConformer 600M — 22-Language Indian Speech Recognition

> **Production-grade Automatic Speech Recognition** for all 22 constitutionally scheduled Indian languages.  
> Powered by `ai4bharat/indic-conformer-600m-multilingual` via **ONNX Runtime + CUDA**.  
> FastAPI server with CTC, RNNT, and word-level timestamp endpoints.

---

## 📦 What's in This Directory

```
backend/medikiosk-asr/
├── main.py                  # FastAPI server — 3 ASR endpoints (CTC, RNNT, Timestamps)
├── indic_asr.py             # ONNX engine wrapper — thread-safe, warmup, CTC+RNNT+timestamps
├── audio_processor.py       # Audio decode → 16kHz mono tensor (no temp files)
├── download_model.py        # One-time HuggingFace model downloader
├── requirements.txt         # Python dependencies
└── models/
    └── indic-conformer-600m-multilingual/   # Downloaded model weights (~2GB)
        ├── model_onnx.py                    # ONNX model class (from AI4Bharat)
        ├── model_ts.py                      # TorchScript variant
        ├── assets/
        │   ├── *.onnx                       # CTC + RNNT ONNX graph files
        │   └── preprocessor.ts              # Binary TorchScript (not TypeScript!)
        └── README.md                        # AI4Bharat model card
```

---

## 🧠 The Model — IndicConformer 600M

### Architecture
- **Model**: Conformer (Convolutional + Transformer hybrid encoder)
- **Parameters**: ~600 Million
- **Training**: 17,000+ hours of speech across all 22 Indian languages
- **Export**: ONNX — no NeMo/PyTorch required at inference time
- **Authors**: AI4Bharat team, IIT Madras — funded by MeitY, Govt. of India

### What It Does
The model takes **raw audio** (any Indian language speaker) and returns the **spoken text** in the native script of that language.

```
Audio Input (16kHz mono WAV)  →  [IndicConformer 600M]  →  Text Output
"मुझे पेट में दर्द है"  (spoken Hindi)  →  "मुझे पेट में दर्द है"  (Devanagari)
"నాకు తలనొప్పి వస్తోంది"  (spoken Telugu)  →  "నాకు తలనొప్పి వస్తోంది"  (Telugu script)
```

### All 22 Supported Languages

| # | Language | ASR Code | Script | Family |
|---|---|---|---|---|
| 1 | Assamese | `as` | Bengali | Indo-Aryan |
| 2 | Bengali | `bn` | Bengali | Indo-Aryan |
| 3 | Bodo | `brx` | Devanagari | Sino-Tibetan |
| 4 | Dogri | `doi` | Devanagari | Indo-Aryan |
| 5 | Gujarati | `gu` | Gujarati | Indo-Aryan |
| 6 | Hindi | `hi` | Devanagari | Indo-Aryan |
| 7 | Kannada | `kn` | Kannada | Dravidian |
| 8 | Kashmiri | `ks` | Arabic / Devanagari | Indo-Aryan |
| 9 | Konkani | `kok` | Devanagari | Indo-Aryan |
| 10 | Maithili | `mai` | Devanagari | Indo-Aryan |
| 11 | Malayalam | `ml` | Malayalam | Dravidian |
| 12 | Manipuri | `mni` | Bengali | Sino-Tibetan |
| 13 | Marathi | `mr` | Devanagari | Indo-Aryan |
| 14 | Nepali | `ne` | Devanagari | Indo-Aryan |
| 15 | Odia | `or` | Odia | Indo-Aryan |
| 16 | Punjabi | `pa` | Gurmukhi | Indo-Aryan |
| 17 | Sanskrit | `sa` | Devanagari | Indo-Aryan |
| 18 | Santali | `sat` | Ol Chiki | Austroasiatic |
| 19 | Sindhi | `sd` | Arabic | Indo-Aryan |
| 20 | Tamil | `ta` | Tamil | Dravidian |
| 21 | Telugu | `te` | Telugu | Dravidian |
| 22 | Urdu | `ur` | Arabic | Indo-Aryan |

### Decoder Modes

| Decoder | Endpoint | Latency (RTX 4050) | Accuracy | Best For |
|---|---|---|---|---|
| **CTC** | `/api/transcribe` | **~25 ms** | Good | Real-time kiosk mic |
| **RNNT** | `/api/transcribe-accurate` | **~65 ms** | Higher | Server batch processing |
| **CTC + Timestamps** | `/api/timestamps` | **~30 ms** | Good | Subtitles, clinical notes |

### What the Model Does NOT Do
| ❌ NOT Supported | ✅ What to Use Instead |
|---|---|
| Translate speech to another language | IndicTrans2 (port 8000) |
| Understand meaning / NLU | Clinical LLM layer |
| Real-time streaming (sub-chunk) | Chunk audio every 2–3s |
| Denoise noisy audio | Preprocess with `pydub` / `sox` |
| Speaker diarization (who spoke) | Separate pyannote pipeline |

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.10 or 3.11
- Conda environment (recommended: `attendance`)
- NVIDIA GPU with CUDA 12.1+ *(optional — CPU fallback works)*
- ~3GB disk space for model weights

### Step 1 — Install Dependencies
```bash
# Activate conda environment
conda activate attendance

# Install requirements
pip install -r requirements.txt
```

### Step 2 — Download Model Weights (One-time, ~2GB)
```bash
# From the medikiosk project root
python backend/medikiosk-asr/download_model.py

# Model will be saved to:
# backend/medikiosk-asr/models/indic-conformer-600m-multilingual/
```

> You need a HuggingFace account and access token for the gated model:  
> Set `HF_TOKEN` environment variable or pass it in the download script.

### Step 3 — Start the ASR Server
```bash
# From the medikiosk project root
python backend/medikiosk-asr/main.py

# Or with explicit port:
PORT=8001 python backend/medikiosk-asr/main.py
```

Server starts at **`http://localhost:8001`**  
Swagger UI at **`http://localhost:8001/docs`**

On startup, the server:
1. Loads the ONNX model into CUDA (~5 seconds, one-time)
2. Runs 2 warmup inferences to JIT-compile the GPU graph
3. Begins accepting requests at ~25ms CTC latency

---

## 📡 API Reference

### `GET /api/health`
Check model status and device.

```json
{
  "status": "ok",
  "device": "cuda",
  "model_loaded": true,
  "model_name": "ai4bharat/indic-conformer-600m-multilingual"
}
```

---

### `GET /api/supported-languages`
Returns all 22 language code mappings (including aliases).

```json
{
  "total_languages": 22,
  "mapping": { "hi": "hi", "hindi": "hi", "hin_deva": "hi", ... }
}
```

---

### `POST /api/transcribe` — CTC Decoder (~25ms)
Real-time transcription. Best for live kiosk mic input.

```bash
curl -X POST http://localhost:8001/api/transcribe \
  -F "file=@patient_audio.webm" \
  -F "lang_code=hi"
```

**Response:**
```json
{
  "success": true,
  "language_id": "hi",
  "transcript": "मुझे पिछले तीन हफ्तों से पेट में जलन हो रही है",
  "duration_seconds": 4.1,
  "is_silent": false,
  "latency_ms": 27.4,
  "model_name": "ai4bharat/indic-conformer-600m-multilingual",
  "decoder": "ctc"
}
```

---

### `POST /api/transcribe-accurate` — RNNT Decoder (~65ms)
Higher accuracy. Best for complex symptoms, heavy accents.

```bash
curl -X POST http://localhost:8001/api/transcribe-accurate \
  -F "file=@patient_audio.webm" \
  -F "lang_code=ta"
```

---

### `POST /api/timestamps` — CTC + Word Timestamps (~30ms)
Returns transcript AND word-level start/end times.

```bash
curl -X POST http://localhost:8001/api/timestamps \
  -F "file=@patient_audio.webm" \
  -F "lang_code=te"
```

**Response:**
```json
{
  "success": true,
  "language_id": "te",
  "transcript": "నాకు తలనొప్పి వస్తోంది",
  "timestamps": [[["నాకు", 0.24, 0.48], ["తలనొప్పి", 0.52, 1.04], ["వస్తోంది", 1.08, 1.44]]],
  "duration_seconds": 2.1,
  "is_silent": false,
  "latency_ms": 31.2,
  "model_name": "ai4bharat/indic-conformer-600m-multilingual"
}
```

---

### `POST /api/init-model`
Trigger background model initialization (if not already loaded).

```bash
curl -X POST http://localhost:8001/api/init-model
```

---

## ⚡ Benchmarked Performance

> Hardware: NVIDIA GeForce RTX 4050 Laptop GPU | CUDA 12.1 | PyTorch 2.2.2

| Metric | Value |
|---|---|
| Model load time | **5.08s** (one-time at startup) |
| GPU warmup (JIT) | **~7s** (2 inferences, runs at startup) |
| CTC steady-state latency | **21–28 ms** per request |
| CTC P95 latency | **~400 ms** (includes cold first-call) |
| RNNT steady-state latency | **55–110 ms** per request |
| CTC success rate (22 langs) | **22/22 — 100%** |
| RNNT success rate (5 langs) | **5/5 — 100%** |
| Word timestamp extraction | **~30 ms** (CTC) |
| CPU fallback latency | **300–500 ms** |

---

## 🔧 Code Architecture

### `indic_asr.py` — ONNX Engine
```
IndicASREngine
├── initialize()        → loads ONNX model, thread-safe (Lock)
├── warmup()            → 2 dummy inferences to JIT-compile GPU graph
├── normalize_lang_code() → maps any alias ('hindi', 'hi', 'hin_deva') → 'hi'
└── transcribe(
        audio_wav_tensor,   # torch.Tensor [1, N] @ 16kHz
        lang_code,          # any alias
        decoder='ctc',      # 'ctc' or 'rnnt'
        timestamps=False    # True → word-level timestamps
    )
```

### `audio_processor.py` — Audio Pipeline
```
load_audio_tensor(audio_bytes, filename)
├── Primary:  torchaudio.load() → Tensor [1, N]
├── Fallback: pydub.AudioSegment → Tensor [1, N]
├── Mono down-mix (stereo → mono)
├── Resample to 16kHz
├── RMS silence detection (threshold: 0.001)
└── Returns (Tensor, duration_sec, is_silent)

process_audio_input()   → legacy shim → writes temp WAV (for older callers)
```

### `main.py` — FastAPI Server
```
POST /api/transcribe
POST /api/transcribe-accurate
POST /api/timestamps
  └── _decode_and_run()
        ├── load_audio_tensor()     → Tensor (no disk I/O)
        └── asr_engine.transcribe() → transcript dict
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| `RuntimeError: Local model directory empty` | Run `python download_model.py` first |
| `CUDA out of memory` | Reduce batch or use CPU: `CUDA_VISIBLE_DEVICES="" python main.py` |
| `HuggingFace 403 Forbidden` | Set `HF_TOKEN` env var with your access token |
| First request takes 2s | Normal — GPU ONNX JIT. Subsequent calls are ~25ms |
| Empty transcripts on real audio | Verify audio is 16kHz mono; check RMS > 0.001 |
| `preprocessor.ts` TS errors | Expected — it's a binary TorchScript file, not TypeScript. Add `backend/` to `tsconfig.json` exclude list |

---

## 🔗 References

- [AI4Bharat IndicConformer HuggingFace](https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual)
- [AI4Bharat GitHub](https://github.com/AI4Bharat)
- [ONNX Runtime Docs](https://onnxruntime.ai/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [MeitY AI4Bharat Project](https://ai4bharat.iitm.ac.in/)
