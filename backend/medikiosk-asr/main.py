"""
main.py — MediKiosk IndicConformer 600M ASR FastAPI server.
Endpoints:
  GET  /                        → service info
  GET  /api/health              → health check
  GET  /api/supported-languages → 22-language map
  POST /api/init-model          → trigger background init
  POST /api/transcribe          → CTC inference (fastest, ~25 ms)
  POST /api/transcribe-accurate → RNNT inference (accurate, ~65 ms)
  POST /api/timestamps          → CTC + word-level timestamps
"""

import os
import threading
import logging
import uvicorn

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from indic_asr import asr_engine, ASR_LANG_MAP
from audio_processor import load_audio_tensor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ASR-API")

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="MediKiosk IndicConformer 600M ASR API",
    description=(
        "High-performance speech recognition for all 22 official Indian languages "
        "using AI4Bharat IndicConformer 600M (ONNX, CUDA). "
        "Supports CTC (fast), RNNT (accurate), and word-level timestamps."
    ),
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    logger.info("MediKiosk ASR Server online — Lazy on-demand ONNX loading active (0 MB initial VRAM).")

@app.post("/api/unload", tags=["Management"])
def unload_model():
    """Immediately unloads ASR ONNX sessions and frees CUDA VRAM."""
    asr_engine.unload()
    return {"status": "unloaded", "message": "ASR model removed from GPU VRAM."}


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------
class TranscribeResponse(BaseModel):
    success: bool
    language_id: str
    transcript: str
    duration_seconds: float
    is_silent: bool
    latency_ms: float
    model_name: str
    decoder: str = "ctc"

class TimestampResponse(BaseModel):
    success: bool
    language_id: str
    transcript: str
    timestamps: List[Any]
    duration_seconds: float
    is_silent: bool
    latency_ms: float
    model_name: str

class HealthResponse(BaseModel):
    status: str
    device: str
    model_loaded: bool
    model_name: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
async def _decode_and_run(
    file: UploadFile,
    lang_code: str,
    decoder: str = "ctc",
    timestamps: bool = False,
):
    """Shared pipeline: upload → tensor → ASR inference."""
    if not file:
        raise HTTPException(status_code=400, detail="No audio file provided.")

    audio_bytes = await file.read()
    waveform, duration, is_silent = load_audio_tensor(
        audio_bytes=audio_bytes,
        original_filename=file.filename or "audio.webm",
    )

    if is_silent or waveform is None:
        return None, duration  # caller handles silent case

    res = asr_engine.transcribe(
        audio_wav_tensor=waveform,
        lang_code=lang_code,
        decoder=decoder,
        timestamps=timestamps,
    )
    res["duration_seconds"] = duration
    return res, duration


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/", tags=["Info"])
def read_root():
    return {
        "service": "MediKiosk IndicConformer 600M ASR",
        "version": "3.0.0",
        "status": "online",
        "model": asr_engine.model_name,
        "model_loaded": asr_engine.is_initialized,
        "device": asr_engine.device or "not-yet-loaded",
        "supported_languages": 22,
    }


@app.get("/api/health", response_model=HealthResponse, tags=["Info"])
def health_check():
    return HealthResponse(
        status="ok" if asr_engine.is_initialized else "initializing",
        device=asr_engine.device or "cpu",
        model_loaded=asr_engine.is_initialized,
        model_name=asr_engine.model_name,
    )


@app.get("/api/supported-languages", tags=["Info"])
def get_supported_languages():
    return {
        "total_languages": 22,
        "mapping": ASR_LANG_MAP,
    }


@app.post("/api/init-model", tags=["Management"])
def init_model(background_tasks: BackgroundTasks):
    if asr_engine.is_initialized:
        return {"message": "Model already loaded.", "status": "ready"}
    background_tasks.add_task(asr_engine.initialize)
    background_tasks.add_task(asr_engine.warmup)
    return {"message": "ASR model initialisation started.", "status": "initializing"}


# --- CTC: fastest real-time path (~25 ms on RTX 4050) ---
@app.post("/api/transcribe", response_model=TranscribeResponse, tags=["ASR"])
async def transcribe_ctc(
    file: UploadFile = File(..., description="Audio file (wav/webm/mp3/ogg/flac)"),
    lang_code: str = Form("hi", description="Language code (e.g. hi, ta, te, bn)"),
):
    """CTC decoder — lowest latency, ideal for real-time kiosk UI."""
    try:
        res, duration = await _decode_and_run(file, lang_code, decoder="ctc")
        if res is None:
            return TranscribeResponse(
                success=True,
                language_id=asr_engine.normalize_lang_code(lang_code),
                transcript="", duration_seconds=duration,
                is_silent=True, latency_ms=0.0,
                model_name=asr_engine.model_name, decoder="ctc",
            )
        asr_engine.reset_idle_timer(15.0)
        return TranscribeResponse(
            success=res.get("success", False),
            language_id=res.get("language_id", lang_code),
            transcript=res.get("transcript", ""),
            duration_seconds=duration,
            is_silent=False,
            latency_ms=res.get("latency_ms", 0.0),
            model_name=asr_engine.model_name,
            decoder="ctc",
        )
    except Exception as e:
        logger.exception("CTC transcription error")
        raise HTTPException(status_code=500, detail=f"CTC transcription failed: {e}")


# --- RNNT: accurate server-side path (~65 ms on RTX 4050) ---
@app.post("/api/transcribe-accurate", response_model=TranscribeResponse, tags=["ASR"])
async def transcribe_rnnt(
    file: UploadFile = File(..., description="Audio file (wav/webm/mp3/ogg/flac)"),
    lang_code: str = Form("hi", description="Language code (e.g. hi, ta, te, bn)"),
):
    """RNNT decoder — higher accuracy, best for server-side processing."""
    try:
        res, duration = await _decode_and_run(file, lang_code, decoder="rnnt")
        if res is None:
            return TranscribeResponse(
                success=True,
                language_id=asr_engine.normalize_lang_code(lang_code),
                transcript="", duration_seconds=duration,
                is_silent=True, latency_ms=0.0,
                model_name=asr_engine.model_name, decoder="rnnt",
            )
        return TranscribeResponse(
            success=res.get("success", False),
            language_id=res.get("language_id", lang_code),
            transcript=res.get("transcript", ""),
            duration_seconds=duration,
            is_silent=False,
            latency_ms=res.get("latency_ms", 0.0),
            model_name=asr_engine.model_name,
            decoder="rnnt",
        )
    except Exception as e:
        logger.exception("RNNT transcription error")
        raise HTTPException(status_code=500, detail=f"RNNT transcription failed: {e}")


# --- Timestamps: CTC + word-level timestamp extraction ---
@app.post("/api/timestamps", response_model=TimestampResponse, tags=["ASR"])
async def transcribe_with_timestamps(
    file: UploadFile = File(..., description="Audio file (wav/webm/mp3/ogg/flac)"),
    lang_code: str = Form("hi", description="Language code (e.g. hi, ta, te, bn)"),
):
    """CTC + word-level timestamps. Useful for subtitle generation."""
    try:
        res, duration = await _decode_and_run(file, lang_code, decoder="ctc", timestamps=True)
        if res is None:
            return TimestampResponse(
                success=True,
                language_id=asr_engine.normalize_lang_code(lang_code),
                transcript="", timestamps=[],
                duration_seconds=duration, is_silent=True,
                latency_ms=0.0, model_name=asr_engine.model_name,
            )
        return TimestampResponse(
            success=res.get("success", False),
            language_id=res.get("language_id", lang_code),
            transcript=res.get("transcript", ""),
            timestamps=res.get("timestamps", []),
            duration_seconds=duration,
            is_silent=False,
            latency_ms=res.get("latency_ms", 0.0),
            model_name=asr_engine.model_name,
        )
    except Exception as e:
        logger.exception("Timestamp transcription error")
        raise HTTPException(status_code=500, detail=f"Timestamp extraction failed: {e}")


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    logger.info(f"Starting MediKiosk IndicConformer ASR on port {port}…")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
