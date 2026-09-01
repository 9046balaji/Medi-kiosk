import os
import uvicorn
from fastapi import FastAPI, HTTPException, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from medgemma_engine import medgemma_engine

app = FastAPI(
    title="MediKiosk MedGemma 1.5 Clinical LLM Microservice",
    description=(
        "Colab GPU / On-Premise MedGemma 1.5 — Clinical Synthesis, Multimodal Vision Analysis, "
        "Herb-Drug Interaction Matrix, FHIR R4 Export, Conversational Brain, Patient Translation, "
        "and Chain-of-Verification (CoVe) Reasoning Engine."
    ),
    version="2.1.0",
)

# Enable CORS for browser access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Middleware to bypass ngrok free-tier browser warning page
@app.middleware("http")
async def add_ngrok_headers(request: Request, call_next):
    if request.method == "OPTIONS":
        response = Response(status_code=200)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["ngrok-skip-browser-warning"] = "true"
        return response

    response: Response = await call_next(request)
    response.headers["ngrok-skip-browser-warning"] = "true"
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


# ── Pydantic Models ───────────────────────────────────────────────────────────

class DiscrepancyRequest(BaseModel):
    voice_claim: str = Field(..., example="Patient says no current medications")
    ocr_claim: str = Field(..., example="Pantoprazole 40mg 1-0-0")
    field: Optional[str] = Field("Medication History", example="Medication History")


class SynthesizeRequest(BaseModel):
    voice_transcript: str = Field(..., example="Patient reports burning sensation in stomach after meals")
    ocr_text: Optional[str] = Field("", example="Rx: Pantoprazole 40mg")
    triage_flags: Optional[List[str]] = Field(default_factory=list)
    mode: Optional[str] = Field("dual", example="dual")
    language: Optional[str] = Field("english", example="english")


class GenerateRequest(BaseModel):
    prompt: Optional[str] = Field(None)
    inputs: Optional[str] = Field(None)
    text: Optional[str] = Field(None)
    voice_claim: Optional[str] = None
    ocr_claim: Optional[str] = None
    field: Optional[str] = None
    language: Optional[str] = Field("english", example="english")


class ConversationTurnModel(BaseModel):
    speaker: str  # 'patient' | 'ai'
    text: str
    translatedText: Optional[str] = None
    timestamp: Optional[int] = None
    turnIndex: Optional[int] = None


class IntakeTurnRequest(BaseModel):
    """Request body for the conversational brain intake turn endpoint."""
    conversation_history: List[ConversationTurnModel] = Field(default_factory=list)
    new_transcript: str = Field(..., example="I have been having burning stomach pain for 3 weeks")
    ocr_entities: Optional[List[str]] = Field(default_factory=list)
    mode: Optional[str] = Field("allopathic", example="allopathic")
    dashavidha_step: Optional[int] = Field(1, example=1)
    language: Optional[str] = Field("english", example="english")


class EmergencyContextRequest(BaseModel):
    """Request body for enriched emergency context analysis."""
    transcript: str = Field(..., example="I have severe chest pain radiating to my left arm")
    detected_keywords: Optional[List[str]] = Field(default_factory=list)
    language: Optional[str] = Field("english", example="english")


class VisionRequest(BaseModel):
    """Request body for multimodal vision diagnostic image analysis."""
    image_base64: str = Field(..., example="data:image/jpeg;base64,...")
    prompt: Optional[str] = Field(None, example="Analyze chest radiograph for consolidation")
    language: Optional[str] = Field("english", example="english")


class HerbDrugRequest(BaseModel):
    """Request body for AYUSH & Allopathic herb-drug cross-checking."""
    allopathic_meds: List[str] = Field(..., example=["Warfarin 5mg", "Pantoprazole 40mg"])
    ayush_meds: List[str] = Field(..., example=["Ginkgo Biloba", "Avipattikar Churna"])
    language: Optional[str] = Field("english", example="english")


class FhirExportRequest(BaseModel):
    """Request body for FHIR R4 Bundle exportation."""
    soap_note: Dict[str, Any]
    patient_info: Optional[Dict[str, Any]] = None


class PatientTranslationRequest(BaseModel):
    """Request body for plain-language medical translation."""
    medical_text: str = Field(..., example="Patient exhibits Amlapitta with gastric mucosal erythema")
    target_language: Optional[str] = Field("english", example="english")


class CoVeRequest(BaseModel):
    """Request body for Chain-of-Verification 4-step reasoning."""
    clinical_case: str = Field(..., example="45yo male with epigastric burning and nocturnal cough")
    language: Optional[str] = Field("english", example="english")


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "service": "MediKiosk MedGemma 1.5 Clinical LLM Microservice",
        "version": "2.1.0",
        "port": 8005,
        "status": "running",
        "model": medgemma_engine.model_name,
        "device": medgemma_engine.device,
        "colab_ngrok_url": medgemma_engine.remote_url,
        "endpoints": [
            "POST /generate",
            "POST /api/resolve-discrepancy",
            "POST /api/synthesize",
            "POST /api/intake-turn",
            "POST /api/emergency-context",
            "POST /api/analyze-vision        ← NEW: Multimodal Vision",
            "POST /api/herb-drug-check       ← NEW: Herb-Drug Safety Matrix",
            "POST /api/export-fhir           ← NEW: FHIR R4 Resource Exporter",
            "POST /api/patient-translation   ← NEW: Plain-Language Translator",
            "POST /api/cove-reasoning        ← NEW: Chain-of-Verification",
            "WS   /ws/intake-stream          ← NEW: WebSocket Streaming Intake",
        ],
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "medikiosk-medgemma",
        "version": "2.1.0",
        "model": medgemma_engine.model_name,
        "device": medgemma_engine.device,
        "ready": medgemma_engine.is_ready,
        "ngrok_url": medgemma_engine.remote_url,
        "capabilities": [
            "generate", "discrepancy", "soap", "intake_turn",
            "emergency_context", "vision", "herb_drug", "fhir", "patient_translation", "cove"
        ],
    }


@app.post("/generate")
@app.post("/api/generate")
async def generate_text(req: GenerateRequest):
    try:
        query_text = req.prompt or req.inputs or req.text or ""
        if not query_text and req.voice_claim and req.ocr_claim:
            query_text = f"Reconcile discrepancy. Voice: {req.voice_claim}, OCR: {req.ocr_claim}"
        if not query_text:
            query_text = "MedGemma clinical intake evaluation request."

        res = await medgemma_engine.generate_text_async(query_text, language=req.language or "english")
        return {
            "response": res.get("response", ""),
            "tokens_generated": len(res.get("response", "").split()),
            "source": res.get("source", "colab_gpu"),
            "model": "MedGemma 1.5",
            "latency_ms": res.get("latency_ms", 0),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/resolve-discrepancy")
async def resolve_discrepancy(req: DiscrepancyRequest):
    try:
        result = await medgemma_engine.resolve_discrepancy_async(
            voice_claim=req.voice_claim,
            ocr_claim=req.ocr_claim,
            field=req.field or "Medication History",
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/synthesize")
async def synthesize_soap(req: SynthesizeRequest):
    try:
        result = await medgemma_engine.synthesize_soap_note_async(
            voice_transcript=req.voice_transcript,
            ocr_text=req.ocr_text or "",
            triage_flags=req.triage_flags,
            mode=req.mode or "dual",
            language=req.language or "english"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/intake-turn")
async def intake_turn(req: IntakeTurnRequest):
    """
    Conversational Brain Endpoint.
    Receives full history + new transcript and generates the next adaptive question.
    """
    try:
        history_dicts = [t.model_dump() for t in req.conversation_history]
        result = await medgemma_engine.generate_next_question_async(
            conversation_history=history_dicts,
            new_transcript=req.new_transcript,
            ocr_entities=req.ocr_entities or [],
            mode=req.mode or "allopathic",
            dashavidha_step=req.dashavidha_step or 1,
            language=req.language or "english",
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/emergency-context")
async def emergency_context(req: EmergencyContextRequest):
    """Emergency Context Analysis Endpoint."""
    try:
        result = await medgemma_engine.analyze_emergency_context_async(
            transcript=req.transcript,
            detected_keywords=req.detected_keywords or [],
            language=req.language or "english",
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-vision")
async def analyze_vision(req: VisionRequest):
    """★ NEW — Multimodal Vision Analysis Endpoint."""
    try:
        result = await medgemma_engine.analyze_vision_async(
            image_base64=req.image_base64,
            prompt=req.prompt,
            language=req.language or "english"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/herb-drug-check")
async def check_herb_drug_safety(req: HerbDrugRequest):
    """★ NEW — AYUSH & Allopathic Herb-Drug Interaction Matrix Endpoint."""
    try:
        result = await medgemma_engine.check_herb_drug_safety_async(
            allopathic_meds=req.allopathic_meds,
            ayush_meds=req.ayush_meds,
            language=req.language or "english"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/export-fhir")
async def export_fhir_resources(req: FhirExportRequest):
    """★ NEW — FHIR R4 Bundle Resource Exporter Endpoint."""
    try:
        result = await medgemma_engine.export_fhir_resources_async(
            soap_note=req.soap_note,
            patient_info=req.patient_info
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/patient-translation")
async def translate_patient_friendly(req: PatientTranslationRequest):
    """★ NEW — Plain-Language Patient Friendly Translator Endpoint."""
    try:
        result = await medgemma_engine.translate_patient_friendly_async(
            medical_text=req.medical_text,
            target_language=req.target_language or "english"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/cove-reasoning")
async def cove_reasoning(req: CoVeRequest):
    """★ NEW — Chain-of-Verification (CoVe) 4-Step Self-Correction Endpoint."""
    try:
        result = await medgemma_engine.cove_reasoning_async(
            clinical_case=req.clinical_case,
            language=req.language or "english"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws/intake-stream")
async def websocket_intake_stream(websocket: WebSocket):
    """
    ★ NEW — WebSocket Streaming Conversational Intake.
    Streams MedGemma token responses incrementally chunk-by-chunk as soon as generation
    starts so the kiosk avatar/audio starts speaking without waiting for full completion.
    """
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            new_transcript = data.get("new_transcript", "")
            mode = data.get("mode", "allopathic")
            dashavidha_step = data.get("dashavidha_step", 1)
            language = data.get("language", "english")

            await websocket.send_json({"status": "streaming_start", "mode": mode})

            # Stream token chunks incrementally as soon as generation starts
            async for chunk in medgemma_engine.generate_text_stream_async(
                prompt=f"Generate intake question for: {new_transcript}",
                language=language
            ):
                await websocket.send_json({"status": "chunk", "text_chunk": chunk})

            # Signal stream completion immediately
            await websocket.send_json({"status": "complete"})
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"status": "error", "error": str(e)})
        except Exception:
            pass


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8005))
    uvicorn.run(app, host="0.0.0.0", port=port)
