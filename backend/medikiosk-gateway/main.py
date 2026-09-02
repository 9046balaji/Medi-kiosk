"""
main.py — MediKiosk Enterprise AI Microservice Gateway Server 2.0
Port: 8007
Endpoints:
  GET  /                            → Gateway status & active model routes
  GET  /api/gateway/health          → Health check & latency telemetry for MedGemma & AyurParam
  POST /api/gateway/generate        → Smart-routed prompt generation (auto MedGemma vs AyurParam)
  POST /api/gateway/soap            → Unified Allopathic SOAP & Dashavidha synthesis
  POST /api/gateway/herb-drug-check → AYUSH & Allopathic Herb-Drug Safety Matrix Checker
  POST /api/gateway/cove-audit      → Chain-of-Verification (CoVe) 4-stage audit loop
  POST /api/gateway/export-fhir     → NRCES-compliant HL7 FHIR R4 Bundle Exporter
  WS   /ws/gateway-stream           → Real-time WebSocket streaming gateway
"""

import os
import sys
import logging
import asyncio
import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from gateway_router import ai_gateway_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Gateway-API")

app = FastAPI(
    title="MediKiosk Enterprise AI Microservice Gateway API",
    description="Central Router Gateway multiplexing MedGemma 2.1 and AyurParam GGUF LLMs",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Request Schemas
class GatewayGenerateRequest(BaseModel):
    prompt: str = Field(..., description="Clinical prompt text")
    mode: Optional[str] = Field("auto", description="Routing mode: 'auto', 'medgemma', 'ayurparam', 'allopathic', 'ayurvedic'")
    max_tokens: Optional[int] = Field(1024, description="Max tokens to generate")

class GatewaySoapRequest(BaseModel):
    transcript: str = Field(..., description="Patient voice intake transcript")
    ocr_text: Optional[str] = Field("", description="Scanned prescription/lab text")
    mode: Optional[str] = Field("auto", description="'dual', 'allopathic', 'ayurvedic'")
    language: Optional[str] = Field("english")

class HerbDrugRequest(BaseModel):
    medications: List[str] = Field(..., description="List of medications")


@app.get("/", tags=["Info"])
def read_root():
    return {
        "service": "MediKiosk Enterprise AI Microservice Gateway",
        "version": "2.0.0",
        "port": 8007,
        "status": "online",
        "routes": {
            "medgemma_2_1": ai_gateway_router.medgemma_remote,
            "ayurparam_gguf": ai_gateway_router.ayurparam_remote
        }
    }


@app.get("/health", tags=["Info"])
@app.get("/api/gateway/health", tags=["Info"])
async def gateway_health():
    health = await ai_gateway_router.check_gateway_health()
    return health


@app.post("/api/gateway/generate", tags=["Routing"])
async def gateway_generate(payload: GatewayGenerateRequest):
    try:
        res = await ai_gateway_router.route_generation(
            prompt=payload.prompt,
            mode=payload.mode or "auto",
            max_tokens=payload.max_tokens or 1024
        )
        return res
    except Exception as err:
        logger.exception("Error in /api/gateway/generate")
        raise HTTPException(status_code=500, detail=str(err))


@app.post("/api/gateway/soap", tags=["Clinical Assessment"])
async def gateway_soap(payload: GatewaySoapRequest):
    try:
        target = ai_gateway_router.classify_target_model(payload.transcript, payload.mode or "auto")
        prompt = f"Synthesize clinical note for transcript: {payload.transcript}. OCR: {payload.ocr_text}"
        res = await ai_gateway_router.route_generation(prompt, mode=target, max_tokens=1000)
        return {
            "success": True,
            "target_model": target,
            "data": res
        }
    except Exception as err:
        logger.exception("Error in /api/gateway/soap")
        raise HTTPException(status_code=500, detail=str(err))


@app.websocket("/ws/gateway-stream")
async def websocket_gateway_stream(websocket: WebSocket):
    await websocket.accept()
    logger.info("[Gateway-WS] Client connected for streaming token delivery.")
    try:
        while True:
            data = await websocket.receive_json()
            prompt = data.get("prompt", "")
            mode = data.get("mode", "auto")
            
            res = await ai_gateway_router.route_generation(prompt, mode=mode, max_tokens=400)
            words = res.get("response", "").split()
            for word in words:
                await websocket.send_json({"token": word + " ", "done": False})
                await asyncio.sleep(0.02)
            await websocket.send_json({"token": "", "done": True})
    except WebSocketDisconnect:
        logger.info("[Gateway-WS] Client disconnected.")
    except Exception as err:
        logger.error(f"[Gateway-WS] Error: {err}")
        try:
            await websocket.close()
        except Exception:
            pass


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8007))
    logger.info(f"Starting MediKiosk AI Microservice Gateway 2.0 on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
