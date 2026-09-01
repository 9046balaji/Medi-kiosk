"""
main.py — MediKiosk IndicConformer 600M ASR FastAPI server 2.0.
Endpoints:
  GET  /                        → service info
  GET  /api/health              → health check
  GET  /api/supported-languages → 22-language map
  POST /api/init-model          → trigger background init
  POST /api/transcribe          → CTC inference (fastest, ~25 ms)
  POST /api/transcribe-accurate → RNNT inference (accurate, ~65 ms)
  POST /api/timestamps          → CTC + word-level timestamps
  WS   /ws/transcribe           → Real-time WebSocket streaming transcription
"""

import os
import sys
import threading
import logging
import uvicorn

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from indic_asr import asr_engine, ASR_LANG_MAP, DEFAULT_IDLE_TIMEOUT
from audio_processor import load_audio_tensor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ASR-API")

app = FastAPI(
    title="MediKiosk IndicConformer 600M ASR API",
    description=(
        "High-performance speech recognition for all 22 official Indian languages "
        "using AI4Bharat IndicConformer 600M (ONNX, CUDA). "
        "Supports CTC, RNNT, timestamps, ITN, and WebSocket streaming."
    ),
    version="2.0.0",
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

# Response schemas
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

async def _decode_and_run(
    file: UploadFile,
    lang_code: str,
    decoder: str = "ctc",
    timestamps: bool = False,
):
    """Shared pipeline: upload → in-memory tensor → ASR inference."""
    if not file:
        raise HTTPException(status_code=400, detail="No audio file provided.")

    # Strict language code validation
    try:
        norm_lang = asr_engine.normalize_lang_code(lang_code, strict=True)
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))

    audio_bytes = await file.read()
    waveform, duration, is_silent = load_audio_tensor(
        audio_bytes=audio_bytes,
        original_filename=file.filename or "audio.webm",
    )

    if is_silent or waveform is None:
        return None, duration

    res = asr_engine.transcribe(
        audio_wav_tensor=waveform,
        lang_code=norm_lang,
        decoder=decoder,
        timestamps=timestamps,
    )
    res["duration_seconds"] = duration
    return res, duration


@app.get("/", tags=["Info"])
def read_root():
    port = int(os.environ.get("PORT", 8001))
    return {
        "service": "MediKiosk IndicConformer 600M ASR",
        "port": port,
        "version": "2.0.0",
        "status": "online",
        "model": asr_engine.model_name,
        "model_loaded": asr_engine.is_initialized,
        "device": asr_engine.device or "not-yet-loaded",
        "idle_timeout_seconds": DEFAULT_IDLE_TIMEOUT,
        "supported_languages": 22,
    }


@app.get("/health", response_model=HealthResponse, tags=["Info"])
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


@app.post("/api/transcribe", response_model=TranscribeResponse, tags=["ASR"])
async def transcribe_ctc(
    file: UploadFile = File(..., description="Audio file (wav/webm/mp3/ogg/flac)"),
    lang_code: str = Form("hi", description="Language code (e.g. hi, ta, te, bn)"),
):
    """CTC decoder — lowest latency (~25 ms), ideal for real-time kiosk UI."""
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
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("CTC transcription error")
        raise HTTPException(status_code=500, detail=f"CTC transcription failed: {e}")


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
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("RNNT transcription error")
        raise HTTPException(status_code=500, detail=f"RNNT transcription failed: {e}")


@app.post("/api/timestamps", response_model=TimestampResponse, tags=["ASR"])
async def transcribe_with_timestamps(
    file: UploadFile = File(..., description="Audio file (wav/webm/mp3/ogg/flac)"),
    lang_code: str = Form("hi", description="Language code (e.g. hi, ta, te, bn)"),
):
    """CTC + word-level timestamps. Useful for clinical subtitle generation."""
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
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Timestamp transcription error")
        raise HTTPException(status_code=500, detail=f"Timestamp extraction failed: {e}")


@app.websocket("/ws/transcribe")
async def websocket_transcribe(websocket: WebSocket):
    """
    ★ NEW — Real-Time WebSocket Streaming ASR Endpoint.
    Receives raw audio chunk bytes over WebSocket and streams partial transcriptions back.
    """
    await websocket.accept()
    logger.info("[ASR-WS] Client connected for streaming speech recognition.")
    lang_code = "hi"
    
    try:
        while True:
            data = await websocket.receive_bytes()
            waveform, duration, is_silent = load_audio_tensor(data, "stream.webm")
            if is_silent or waveform is None:
                await websocket.send_json({"transcript": "", "is_silent": True})
                continue
            
            res = asr_engine.transcribe(waveform, lang_code=lang_code, decoder="ctc")
            await websocket.send_json({
                "transcript": res.get("transcript", ""),
                "language_id": res.get("language_id", lang_code),
                "is_silent": False,
                "latency_ms": res.get("latency_ms", 0.0)
            })
    except WebSocketDisconnect:
        logger.info("[ASR-WS] Client disconnected.")
    except Exception as err:
        logger.error(f"[ASR-WS] WebSocket error: {err}")
        try:
            await websocket.close()
        except Exception:
            pass


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    logger.info(f"Starting MediKiosk IndicConformer ASR 2.0 on port {port}…")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
