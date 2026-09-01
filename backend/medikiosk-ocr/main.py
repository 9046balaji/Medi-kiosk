import os
import io
import base64
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from ocr_engine import ocr_engine

app = FastAPI(
    title="MediKiosk Document & Prescription Vision OCR Service",
    description="Florence-2-base Vision microservice for paper prescription OCR, OpenCV CLAHE/deskewing, bounding box UI highlights, and fuzzy drug normalization.",
    version="2.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

executor = ThreadPoolExecutor(max_workers=2)

class Base64ScanRequest(BaseModel):
    image_base64: str
    doc_type: Optional[str] = "prescription"
    voice_statement: Optional[str] = ""

@app.get("/")
def read_root():
    port = int(os.environ.get("PORT", 8002))
    return {
        "service": "MediKiosk Document OCR Service",
        "status": "online",
        "model": "microsoft/Florence-2-base",
        "port": port,
        "features": [
            "opencv_clahe_deskewing",
            "fuzzy_drug_normalization_rxnorm_cdsco_ayush",
            "bounding_box_coordinates",
            "handwriting_detection"
        ]
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    import time
    return {
        "status": "ok",
        "device": ocr_engine.device,
        "model_loaded": ocr_engine.is_initialized and ocr_engine.model is not None,
        "last_access_seconds_ago": round(time.time() - ocr_engine.last_access_time, 1)
    }

@app.post("/api/scan-document")
async def scan_document(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    doc_type: str = Form("prescription"),
    voice_statement: str = Form("")
):
    """
    Accepts multipart/form-data upload or base64 image string.
    Runs OpenCV CLAHE/deskewing + Florence-2-base vision OCR + Fuzzy Drug Normalization.
    """
    image_bytes = None

    if file:
        image_bytes = await file.read()
    elif image_base64:
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        try:
            image_bytes = base64.b64decode(image_base64)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid Base64 image payload: {e}")
    else:
        dummy_io = io.BytesIO()
        from PIL import Image
        Image.new("RGB", (640, 480), color=(255, 255, 255)).save(dummy_io, format="JPEG")
        image_bytes = dummy_io.getvalue()

    # FIX: Replace deprecated get_event_loop() with get_running_loop()
    loop = asyncio.get_running_loop()
    res = await loop.run_in_executor(
        executor, 
        ocr_engine.process_image, 
        image_bytes, 
        doc_type, 
        voice_statement
    )
    return res

@app.post("/api/scan-document-json")
async def scan_document_json(payload: Base64ScanRequest):
    """JSON Base64 payload endpoint."""
    image_bytes = None
    if payload.image_base64:
        raw_b64 = payload.image_base64.split(",")[1] if "," in payload.image_base64 else payload.image_base64
        try:
            image_bytes = base64.b64decode(raw_b64)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid Base64 image payload: {e}")

    # FIX: Replace deprecated get_event_loop() with get_running_loop()
    loop = asyncio.get_running_loop()
    res = await loop.run_in_executor(
        executor, 
        ocr_engine.process_image, 
        image_bytes, 
        payload.doc_type, 
        payload.voice_statement
    )
    return res

@app.post("/api/unload")
def unload_model():
    """Explicitly evict Florence-2 vision weights from GPU VRAM."""
    ocr_engine.unload()
    return {"status": "ok", "message": "Florence-2 OCR model unloaded from VRAM"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)
