"""
main.py — FastAPI microservice for AI4Bharat Indic Parler-TTS
Runs on http://localhost:8002
"""

import os
import sys
import logging
import threading
from typing import Optional
from fastapi import FastAPI, HTTPException, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Ensure backend directory is on sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from indic_tts import tts_engine, SPEAKER_DIRECTORY

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TTS-API")

app = FastAPI(
    title="MediKiosk Indic Parler-TTS Microservice",
    description="Neural Speech Synthesis microservice for 20 Indian languages + English",
    version="1.0.0"
)

# ---------------------------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Latency-MS", "X-Audio-Duration", "X-Speaker-Used"]
)

# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------
class TTSRequest(BaseModel):
    text: str = Field(..., description="Text prompt to synthesize into speech", example="नमस्ते, आप आज कैसे महसूस कर रहे हैं?")
    lang_key: str = Field("hindi", description="Language key (e.g. hindi, tamil, telugu, english, marathi)", example="hindi")
    speaker: Optional[str] = Field(None, description="Speaker voice name (e.g. Divya, Rohit, Mary, Jaya, Lalitha)", example="Divya")
    gender: str = Field("female", description="Preferred gender ('female' or 'male')", example="female")
    speed: str = Field("normal", description="Speaking rate ('slow', 'normal', 'fast')", example="normal")


# ---------------------------------------------------------------------------
# Background Initialization Trigger
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    logger.info("MediKiosk TTS Server online — Lazy on-demand loading active (0 MB initial VRAM).")

@app.post("/api/unload")
async def unload_model():
    """Immediately unloads Parler-TTS model weights and frees CUDA VRAM."""
    tts_engine.unload()
    return {"status": "unloaded", "message": "TTS model removed from GPU VRAM."}


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/health")
async def health_check():
    """Health check endpoint returning model status & CUDA device."""
    return {
        "status": "ok" if tts_engine.is_initialized else "initializing",
        "device": tts_engine.device or "unknown",
        "model_loaded": tts_engine.is_initialized,
        "sample_rate": tts_engine.sample_rate,
        "model_name": tts_engine.MODEL_ID
    }


@app.get("/api/speakers")
async def get_speakers():
    """Returns available and recommended speakers per language."""
    return {
        "total_languages": len(SPEAKER_DIRECTORY),
        "speakers": SPEAKER_DIRECTORY
    }


@app.post("/api/tts")
def synthesize_tts(req: TTSRequest):
    """
    Synthesize text into 24kHz WAV audio stream.
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty.")

    try:
        wav_bytes, duration_sec, elapsed_ms = tts_engine.synthesize(
            text=req.text,
            lang_key=req.lang_key,
            speaker_name=req.speaker,
            gender=req.gender,
            speed=req.speed
        )

        speaker_used = req.speaker or SPEAKER_DIRECTORY.get(req.lang_key.lower(), {}).get(req.gender, "default")
        tts_engine.reset_idle_timer(15.0)

        return Response(
            content=wav_bytes,
            media_type="audio/wav",
            headers={
                "X-Latency-MS": f"{elapsed_ms:.1f}",
                "X-Audio-Duration": f"{duration_sec:.2f}",
                "X-Speaker-Used": str(speaker_used),
                "Cache-Control": "public, max-age=86400"
            }
        )
    except Exception as e:
        logger.error(f"TTS synthesis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/init-model")
async def trigger_init():
    """Trigger explicit background model loading."""
    if not tts_engine.is_initialized:
        threading.Thread(target=tts_engine.initialize, daemon=True).start()
        return {"status": "initializing", "message": "Model loading started."}
    return {"status": "ready", "message": "Model is already initialized."}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8002))
    logger.info(f"Starting MediKiosk Indic Parler-TTS on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
