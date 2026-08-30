import os
import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from translator import translator_instance, LANG_CODE_MAP

app = FastAPI(
    title="MediKiosk IndicTrans2 Translation API",
    description="High-performance backend microservice with LRU caching, static dictionary, and batched inference for website translation.",
    version="2.0.0"
)

# Enable CORS for React website frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import threading

@app.on_event("startup")
def startup_event():
    print("Auto-initializing PyTorch Neural Translation Model in background thread...")
    thread = threading.Thread(target=translator_instance.initialize, daemon=True)
    thread.start()

class TranslationRequest(BaseModel):
    text: Optional[str] = Field(None, json_schema_extra={"example": "I have severe stomach pain for 3 weeks."})
    texts: Optional[List[str]] = Field(None, json_schema_extra={"example": ["Welcome to MediKiosk", "Scan prescription", "Select language"]})
    src_lang: str = Field("eng_Latn", json_schema_extra={"example": "eng_Latn"})
    tgt_lang: str = Field("hin_Deva", json_schema_extra={"example": "hin_Deva"})
    use_beam_search: Optional[bool] = Field(False, description="Set True for high-precision beam search; False for fast greedy search.")

class TranslationResponse(BaseModel):
    success: bool
    src_lang: str
    tgt_lang: str
    translations: List[str]
    model_used: str
    cached_count: int = 0

@app.get("/")
def read_root():
    return {
        "service": "MediKiosk IndicTrans2 Translation Server",
        "status": "online",
        "model": translator_instance.model_name,
        "model_loaded": translator_instance.is_initialized,
        "cache_entries": len(translator_instance.cache)
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "device": translator_instance.device or "cpu",
        "model_loaded": translator_instance.is_initialized,
        "model_name": translator_instance.model_name,
        "cache_entries": len(translator_instance.cache)
    }

@app.get("/api/supported-languages")
def get_supported_languages():
    return {
        "languages": list(LANG_CODE_MAP.keys()),
        "mapping": LANG_CODE_MAP
    }

@app.post("/api/init-model")
def init_model(background_tasks: BackgroundTasks):
    """Asynchronously loads the IndicTrans2 model into memory."""
    background_tasks.add_task(translator_instance.initialize)
    return {
        "message": "Model initialization process started in background.",
        "status": "initializing"
    }

@app.post("/api/translate", response_model=TranslationResponse)
@app.post("/api/batch-translate", response_model=TranslationResponse)
def translate_text(request: TranslationRequest):
    if not request.text and not request.texts:
        raise HTTPException(status_code=400, detail="Either 'text' or 'texts' must be provided.")
    
    input_sentences = []
    if request.text:
        input_sentences.append(request.text)
    if request.texts:
        input_sentences.extend(request.texts)

    try:
        results = translator_instance.translate(
            sentences=input_sentences,
            src_lang=request.src_lang,
            tgt_lang=request.tgt_lang,
            use_beam_search=bool(request.use_beam_search)
        )
        return TranslationResponse(
            success=True,
            src_lang=request.src_lang,
            tgt_lang=request.tgt_lang,
            translations=results,
            model_used=translator_instance.model_name,
            cached_count=len(translator_instance.cache)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

@app.post("/api/clear-cache")
def clear_cache():
    translator_instance.clear_cache()
    return {"message": "Translation cache cleared successfully.", "cache_entries": 0}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Optimized MediKiosk Translation Backend on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
