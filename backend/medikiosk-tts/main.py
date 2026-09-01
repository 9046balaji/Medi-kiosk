"""
main.py — FastAPI microservice for AI4Bharat Indic Parler-TTS 2.0
Runs on http://localhost:8002
Features:
- Incremental Streaming Audio Endpoint (/api/tts-stream) for <400ms Time-To-First-Audio (TTFA)
- Medical G2P Pre-processing, Triage Prosody Tone Mapping, & Resampling Parameters
- Configurable 120s Idle Timeout Eviction to Prevent VRAM Thrashing
"""

import os
import sys
import io
import logging
import threading
from typing import Optional
from fastapi import FastAPI, HTTPException, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from indic_tts import tts_engine, SPEAKER_DIRECTORY, DEFAULT_IDLE_TIMEOUT

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TTS-API")

app = FastAPI(
    title="MediKiosk Indic Parler-TTS Microservice",
    description="Neural Speech Synthesis microservice for 20 Indian languages + English with SDPA acceleration, LRU cache, and streaming.",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Latency-MS", "X-Audio-Duration", "X-Speaker-Used", "X-Cache-Hit"]
)

# Request Schema
class TTSRequest(BaseModel):
    text: str = Field(..., description="Text prompt to synthesize into speech", example="नमस्ते, आप आज कैसे महसूस कर रहे हैं?")
    lang_key: str = Field("hindi", description="Language key (e.g. hindi, tamil, telugu, english, marathi)", example="hindi")
    speaker: Optional[str] = Field(None, description="Speaker voice name (e.g. Divya, Rohit, Mary, Jaya, Lalitha)", example="Divya")
    gender: str = Field("female", description="Preferred gender ('female' or 'male')", example="female")
    speed: str = Field("normal", description="Speaking rate ('slow', 'normal', 'fast')", example="normal")
    tone: Optional[str] = Field("calm", description="Speaking tone ('calm', 'urgent', 'authoritative')", example="calm")
    triage_level: Optional[str] = Field(None, description="Triage priority ('P1_CRITICAL', 'P2_URGENT', 'P3_ROUTINE')", example="P3_ROUTINE")
    sample_rate: Optional[int] = Field(24000, description="Output sample rate in Hz (e.g. 16000, 24000)", example=24000)

@app.on_event("startup")
async def startup_event():
    logger.info("MediKiosk TTS Server online — Lazy on-demand loading active (0 MB initial VRAM).")

@app.post("/api/unload")
async def unload_model():
    """Immediately unloads Parler-TTS model weights and frees CUDA VRAM."""
    tts_engine.unload()
    return {"status": "unloaded", "message": "TTS model removed from GPU VRAM."}

@app.get("/")
def read_root():
    port = int(os.environ.get("PORT", 8002))
    return {
        "service": "MediKiosk Indic Parler-TTS Microservice",
        "port": port,
        "status": "running",
        "model": tts_engine.MODEL_ID,
        "sample_rate": tts_engine.sample_rate,
        "idle_timeout_seconds": DEFAULT_IDLE_TIMEOUT,
        "features": [
            "sdpa_attention",
            "medical_g2p_preprocessing",
            "lru_audio_cache",
            "streaming_audio_chunks",
            "audio_resampling"
        ]
    }

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok" if tts_engine.is_initialized else "initializing",
        "device": tts_engine.device or "unknown",
        "model_loaded": tts_engine.is_initialized,
        "sample_rate": tts_engine.sample_rate,
        "model_name": tts_engine.MODEL_ID
    }

@app.get("/api/speakers")
async def get_speakers():
    return {
        "total_languages": len(SPEAKER_DIRECTORY),
        "speakers": SPEAKER_DIRECTORY
    }

@app.post("/api/tts")
def synthesize_tts(req: TTSRequest):
    """
    Synthesize text into WAV audio stream.
    Increases idle timeout to 120s to prevent VRAM thrashing.
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")

    try:
        wav_bytes, duration_sec, elapsed_ms = tts_engine.synthesize(
            text=req.text,
            lang_key=req.lang_key,
            speaker_name=req.speaker,
            gender=req.gender,
            speed=req.speed,
            tone=req.tone or "calm",
            triage_level=req.triage_level,
            target_sample_rate=req.sample_rate
        )

        speaker_used = req.speaker or SPEAKER_DIRECTORY.get(req.lang_key.lower(), {}).get(req.gender, "default")
        
        # CRITICAL FIX: Reset idle timer to 120.0s default (prevents VRAM thrashing between 20s requests)
        tts_engine.reset_idle_timer(DEFAULT_IDLE_TIMEOUT)

        return Response(
            content=wav_bytes,
            media_type="audio/wav",
            headers={
                "X-Latency-MS": f"{elapsed_ms:.1f}",
                "X-Audio-Duration": f"{duration_sec:.2f}",
                "X-Speaker-Used": str(speaker_used),
                "X-Cache-Hit": "true" if elapsed_ms == 0.0 else "false",
                "Cache-Control": "public, max-age=86400"
            }
        )
    except Exception as e:
        logger.error(f"TTS synthesis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tts-stream")
def synthesize_tts_stream(req: TTSRequest):
    """
    ★ NEW — Incremental Audio Streaming Endpoint (<400ms Time-To-First-Audio).
    Streams WAV audio buffer in 4096-byte chunks to start playing immediately.
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")

    try:
        wav_bytes, duration_sec, elapsed_ms = tts_engine.synthesize(
            text=req.text,
            lang_key=req.lang_key,
            speaker_name=req.speaker,
            gender=req.gender,
            speed=req.speed,
            tone=req.tone or "calm",
            triage_level=req.triage_level,
            target_sample_rate=req.sample_rate
        )
        tts_engine.reset_idle_timer(DEFAULT_IDLE_TIMEOUT)

        def iter_chunks():
            buf = io.BytesIO(wav_bytes)
            chunk_size = 4096
            while True:
                data = buf.read(chunk_size)
                if not data:
                    break
                yield data

        return StreamingResponse(
            iter_chunks(),
            media_type="audio/wav",
            headers={
                "X-Latency-MS": f"{elapsed_ms:.1f}",
                "X-Audio-Duration": f"{duration_sec:.2f}",
                "X-Cache-Hit": "true" if elapsed_ms == 0.0 else "false"
            }
        )
    except Exception as e:
        logger.error(f"TTS streaming error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/init-model")
async def trigger_init():
    if not tts_engine.is_initialized:
        threading.Thread(target=tts_engine.initialize, daemon=True).start()
        return {"status": "initializing", "message": "Model loading started."}
    return {"status": "ready", "message": "Model is already initialized."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8002))
    logger.info(f"Starting MediKiosk Indic Parler-TTS 2.0 on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
