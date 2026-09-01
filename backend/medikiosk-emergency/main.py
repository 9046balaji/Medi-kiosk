import os
import time
import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from triage_engine import triage_engine

app = FastAPI(
    title="MediKiosk Emergency Red-Flag Triage Engine",
    description="Hospital-grade, zero-VRAM, 0 MB memory pure Python Negation-Aware Emergency Red-Flag Triage microservice.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus Observability Metrics
TRIAGE_REQUESTS_TOTAL = Counter(
    "triage_requests_total",
    "Total triage evaluations processed",
    ["triage_level", "status"]
)

EMERGENCY_RED_FLAGS_TOTAL = Counter(
    "emergency_red_flags_total",
    "Total emergency red flags triggered",
    ["category", "level"]
)

TRIAGE_LATENCY_SECONDS = Histogram(
    "triage_latency_seconds",
    "Triage evaluation processing latency in seconds",
    buckets=(0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 0.5)
)


class TriageRequest(BaseModel):
    transcript: str = Field(..., example="Patient has severe chest pain and shortness of breath")
    lang_code: Optional[str] = Field("en", example="en")
    age: Optional[int] = Field(None, example=45)
    gender: Optional[str] = Field(None, example="male")
    is_pregnant: Optional[bool] = Field(False, example=False)
    session_id: Optional[str] = Field(None, example="sess-9842")
    enable_disaster_mode: Optional[bool] = Field(False, example=False)


class TriageBatchItem(BaseModel):
    transcript: str
    lang_code: Optional[str] = "en"
    age: Optional[int] = None
    gender: Optional[str] = None
    is_pregnant: Optional[bool] = False
    session_id: Optional[str] = None


class TriageBatchRequest(BaseModel):
    transcripts: List[TriageBatchItem]


class SessionResetRequest(BaseModel):
    session_id: str


@app.get("/")
def root():
    port = int(os.environ.get("PORT", 8004))
    return {
        "service": "MediKiosk Emergency Red-Flag Triage Engine",
        "port": port,
        "status": "running",
        "version": "2.0.0",
        "memory_vram": "0 MB (Pure Python Regex & Vitals Engine)"
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    port = int(os.environ.get("PORT", 8004))
    return {
        "status": "ok",
        "port": port,
        "engine": "Hospital-Grade Multilingual Disease Pattern Recognition & Vitals Engine",
        "memory_vram_mb": 0,
        "critical_pattern_count": len(triage_engine.critical_patterns),
        "urgent_pattern_count": len(triage_engine.urgent_patterns),
        "routine_pattern_count": len(triage_engine.routine_patterns),
        "cluster_count": len(triage_engine.clusters),
        "active_sessions": len(triage_engine.session_store.sessions)
    }


@app.get("/metrics")
def get_prometheus_metrics():
    """Exposes real-time Prometheus operational metrics for system observability."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.post("/api/triage")
def evaluate_triage(req: TriageRequest):
    start_time = time.time()
    try:
        verdict = triage_engine.evaluate_triage(
            transcript=req.transcript,
            lang_code=req.lang_code or "en",
            age=req.age,
            gender=req.gender,
            is_pregnant=req.is_pregnant or False,
            session_id=req.session_id,
            enable_disaster_mode=req.enable_disaster_mode or False
        )
        latency = time.time() - start_time
        TRIAGE_LATENCY_SECONDS.observe(latency)
        TRIAGE_REQUESTS_TOTAL.labels(triage_level=verdict.get("triage_level", "P3_ROUTINE"), status="success").inc()

        for flag in verdict.get("detected_flags", []):
            EMERGENCY_RED_FLAGS_TOTAL.labels(
                category=flag.get("category", "GENERAL"),
                level=flag.get("level", "P3_ROUTINE")
            ).inc()

        return verdict
    except Exception as e:
        TRIAGE_REQUESTS_TOTAL.labels(triage_level="ERROR", status="error").inc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/triage/fhir")
def evaluate_triage_fhir(req: TriageRequest):
    """Evaluates triage and returns an HL7 FHIR R4 RiskAssessment & Observation Bundle directly."""
    try:
        verdict = triage_engine.evaluate_triage(
            transcript=req.transcript,
            lang_code=req.lang_code or "en",
            age=req.age,
            gender=req.gender,
            is_pregnant=req.is_pregnant or False,
            session_id=req.session_id,
            enable_disaster_mode=req.enable_disaster_mode or False
        )
        return verdict.get("fhir_bundle", {})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/triage-batch")
def evaluate_triage_batch(req: TriageBatchRequest):
    results = []
    for item in req.transcripts:
        try:
            res = triage_engine.evaluate_triage(
                transcript=item.transcript,
                lang_code=item.lang_code or "en",
                age=item.age,
                gender=item.gender,
                is_pregnant=item.is_pregnant or False,
                session_id=item.session_id
            )
            results.append({"status": "success", "data": res})
        except Exception as e:
            results.append({"status": "error", "error": str(e)})
    return {"results": results, "total_processed": len(results)}


@app.post("/api/session/reset")
def reset_session_state(req: SessionResetRequest):
    """Resets the accumulated multi-turn transcript history for a session_id."""
    triage_engine.session_store.clear(req.session_id)
    return {"status": "cleared", "session_id": req.session_id}


@app.websocket("/ws/triage")
async def websocket_triage_endpoint(websocket: WebSocket):
    """
    Real-Time WebSocket Streaming Triage Intercept.
    Clients send JSON: {"transcript": "...", "lang_code": "en", "age": 45, "gender": "male", "is_pregnant": false, "session_id": "sess-1"}
    Emits instantaneous triage verdicts as the patient speaks into the kiosk microphone.
    """
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            transcript = data.get("transcript", "")
            lang_code = data.get("lang_code", "en")
            age = data.get("age")
            gender = data.get("gender")
            is_pregnant = data.get("is_pregnant", False)
            session_id = data.get("session_id")
            enable_disaster = data.get("enable_disaster_mode", False)

            res = triage_engine.evaluate_triage(
                transcript=transcript,
                lang_code=lang_code,
                age=age,
                gender=gender,
                is_pregnant=is_pregnant,
                session_id=session_id,
                enable_disaster_mode=enable_disaster
            )
            await websocket.send_json({"status": "success", "data": res})
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"status": "error", "error": str(e)})
        except Exception:
            pass


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8004))
    uvicorn.run(app, host="0.0.0.0", port=port)
