"""
main.py — MediKiosk AyurParam GGUF Clinical LLM FastAPI Server 2.0
Port: 8006
Endpoints:
  GET  /                          → service info & health status
  GET  /api/health                → health check endpoint
  POST /api/generate              → raw GGUF text generation
  POST /api/soap-synthesis        → Ayurvedic SOAP & Dashavidha Pariksha synthesis
  POST /api/tridosha-analysis     → Tridosha & Prakriti/Vikriti imbalance analyzer
  POST /api/herb-drug-check       → AYUSH & Allopathic herb-drug safety checker
  POST /api/cove-reasoning        → Chain-of-Verification (CoVe) 4-stage self-correction audit
  POST /api/export-fhir           → NRCES-compliant HL7 FHIR R4 bundle exporter
  POST /api/patient-translation   → Plain language patient advice in 22 languages
  WS   /ws/intake-stream          → WebSocket streaming token generator
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

from ayurparam_engine import ayurparam_engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AyurParam-API")

app = FastAPI(
    title="MediKiosk AyurParam GGUF LLM API",
    description="Specialized Ayurvedic Clinical AI Microservice powered by AyurParam GGUF",
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

# ── Pydantic Request Schemas ──────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="Prompt input text for AyurParam GGUF")
    max_tokens: Optional[int] = Field(1024, description="Maximum tokens to generate")

class IntakeRequest(BaseModel):
    symptoms: str = Field(..., description="Patient symptoms or chief complaint")
    vitals: Optional[Dict[str, Any]] = Field(default_factory=dict)
    patient_info: Optional[Dict[str, Any]] = Field(default_factory=dict)
    language: Optional[str] = Field("english", description="Target language")

class TridoshaRequest(BaseModel):
    symptoms: str = Field(..., description="Patient symptoms")
    vitals: Optional[Dict[str, Any]] = Field(default_factory=dict)
    language: Optional[str] = Field("english")

class HerbDrugRequest(BaseModel):
    medications: List[str] = Field(..., description="List of allopathic and AYUSH medications")

class CoVeRequest(BaseModel):
    intake_data: Dict[str, Any]
    initial_soap: Dict[str, Any]

class PatientTranslationRequest(BaseModel):
    medical_summary: str
    target_language: str = "hindi"


@app.get("/", tags=["Info"])
def read_root():
    return {
        "service": "MediKiosk AyurParam GGUF Clinical Microservice",
        "version": "2.0.0",
        "port": 8006,
        "status": "online",
        "model": ayurparam_engine.model_name,
        "remote_url": ayurparam_engine.remote_url,
        "use_remote": ayurparam_engine.use_remote
    }


@app.get("/health", tags=["Info"])
@app.get("/api/health", tags=["Info"])
def health_check():
    return {
        "status": "ok",
        "service": "MediKiosk AyurParam LLM Engine",
        "model_loaded": ayurparam_engine.is_initialized,
        "remote_url": ayurparam_engine.remote_url
    }


@app.post("/api/generate", tags=["Inference"])
async def generate_text(payload: GenerateRequest):
    try:
        res = await ayurparam_engine._query_remote_endpoint(
            prompt=payload.prompt,
            max_tokens=payload.max_tokens or 1024
        )
        return {
            "status": "success",
            "model": ayurparam_engine.model_name,
            "response": res
        }
    except Exception as err:
        logger.exception("Error in /api/generate")
        raise HTTPException(status_code=500, detail=str(err))


@app.post("/api/soap-synthesis", tags=["Clinical Assessment"])
async def soap_synthesis(payload: IntakeRequest):
    try:
        result = await ayurparam_engine.generate_dashavidha_assessment(
            intake_data=payload.dict(),
            language=payload.language or "english"
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as err:
        logger.exception("Error in /api/soap-synthesis")
        raise HTTPException(status_code=500, detail=str(err))


@app.post("/api/tridosha-analysis", tags=["Clinical Assessment"])
async def tridosha_analysis(payload: TridoshaRequest):
    try:
        result = await ayurparam_engine.analyze_tridosha_imbalance(
            symptoms=payload.symptoms,
            vitals=payload.vitals,
            language=payload.language or "english"
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as err:
        logger.exception("Error in /api/tridosha-analysis")
        raise HTTPException(status_code=500, detail=str(err))


@app.post("/api/herb-drug-check", tags=["Safety"])
def herb_drug_check(payload: HerbDrugRequest):
    alerts = ayurparam_engine.check_herb_drug_interactions(payload.medications)
    return {
        "success": True,
        "alerts": alerts,
        "total_alerts": len(alerts)
    }


@app.post("/api/cove-reasoning", tags=["Audit"])
async def cove_reasoning(payload: CoVeRequest):
    try:
        audit_res = await ayurparam_engine.cove_verify_ayurvedic_diagnosis(
            intake_data=payload.intake_data,
            initial_soap=payload.initial_soap
        )
        return {
            "success": True,
            "audit": audit_res
        }
    except Exception as err:
        logger.exception("Error in /api/cove-reasoning")
        raise HTTPException(status_code=500, detail=str(err))


@app.post("/api/export-fhir", tags=["Interoperability"])
async def export_fhir(payload: Dict[str, Any]):
    bundle = await ayurparam_engine.export_ayush_fhir_bundle(payload)
    return {
        "success": True,
        "fhir_bundle": bundle
    }


@app.post("/api/patient-translation", tags=["Patient Communication"])
async def patient_translation(payload: PatientTranslationRequest):
    try:
        guidance = await ayurparam_engine.translate_patient_guidance(
            medical_summary=payload.medical_summary,
            target_language=payload.target_language
        )
        return {
            "success": True,
            "guidance": guidance
        }
    except Exception as err:
        logger.exception("Error in /api/patient-translation")
        raise HTTPException(status_code=500, detail=str(err))


@app.websocket("/ws/intake-stream")
async def websocket_intake_stream(websocket: WebSocket):
    await websocket.accept()
    logger.info("[AyurParam-WS] Client connected for streaming token intake.")
    try:
        while True:
            data = await websocket.receive_json()
            symptoms = data.get("symptoms", "")
            prompt = f"Analyze symptoms and provide Ayurvedic advice: {symptoms}"
            
            response_text = await ayurparam_engine._query_remote_endpoint(prompt, max_tokens=500)
            words = response_text.split()
            for word in words:
                await websocket.send_json({"token": word + " ", "done": False})
                await asyncio.sleep(0.02)
            await websocket.send_json({"token": "", "done": True})
    except WebSocketDisconnect:
        logger.info("[AyurParam-WS] Client disconnected.")
    except Exception as err:
        logger.error(f"[AyurParam-WS] Error: {err}")
        try:
            await websocket.close()
        except Exception:
            pass


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8006))
    logger.info(f"Starting MediKiosk AyurParam GGUF Microservice 2.0 on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
