"""
indic_asr.py — AI4Bharat IndicConformer 600M ONNX ASR Engine
Uses the ONNX runtime model from the downloaded local checkpoint.
Supports all 22 official scheduled Indian languages.
"""

import os
import sys
import time
import logging
import threading
from typing import Dict, Optional, Union, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IndicASR")

# ---------------------------------------------------------------------------
# 22 Scheduled Indian Languages: flexible input → canonical ISO code
# ---------------------------------------------------------------------------
ASR_LANG_MAP: Dict[str, str] = {
    # Assamese
    "as": "as", "asm": "as", "assamese": "as", "asm_beng": "as",
    # Bengali
    "bn": "bn", "ben": "bn", "bengali": "bn", "ben_beng": "bn",
    # Bodo
    "brx": "brx", "bodo": "brx", "brx_deva": "brx",
    # Dogri
    "doi": "doi", "dogri": "doi", "doi_deva": "doi",
    # Gujarati
    "gu": "gu", "guj": "gu", "gujarati": "gu", "guj_gujr": "gu",
    # Hindi
    "hi": "hi", "hin": "hi", "hindi": "hi", "hin_deva": "hi",
    # Kannada
    "kn": "kn", "kan": "kn", "kannada": "kn", "kan_knda": "kn",
    # Kashmiri
    "ks": "ks", "kas": "ks", "kashmiri": "ks", "kas_arab": "ks", "kas_deva": "ks",
    # Konkani
    "kok": "kok", "gom": "kok", "konkani": "kok", "gom_deva": "kok",
    # Maithili
    "mai": "mai", "maithili": "mai", "mai_deva": "mai",
    # Malayalam
    "ml": "ml", "mal": "ml", "malayalam": "ml", "mal_mlym": "ml",
    # Manipuri
    "mni": "mni", "manipuri": "mni", "meitei": "mni", "mni_beng": "mni",
    # Marathi
    "mr": "mr", "mar": "mr", "marathi": "mr", "mar_deva": "mr",
    # Nepali
    "ne": "ne", "npi": "ne", "nepali": "ne", "npi_deva": "ne",
    # Odia / Oriya
    "or": "or", "ory": "or", "odia": "or", "oriya": "or", "ory_orya": "or",
    # Punjabi
    "pa": "pa", "pan": "pa", "punjabi": "pa", "pan_guru": "pa",
    # Sanskrit
    "sa": "sa", "san": "sa", "sanskrit": "sa", "san_deva": "sa",
    # Santali
    "sat": "sat", "santali": "sat", "sat_olck": "sat",
    # Sindhi
    "sd": "sd", "snd": "sd", "sindhi": "sd", "snd_arab": "sd",
    # Tamil
    "ta": "ta", "tam": "ta", "tamil": "ta", "tam_taml": "ta",
    # Telugu
    "te": "te", "tel": "te", "telugu": "te", "tel_telu": "te",
    # Urdu
    "ur": "ur", "urd": "ur", "urdu": "ur", "urd_arab": "ur",
}

_SUPPORTED_LANGS = set(ASR_LANG_MAP.values())  # canonical codes

# ---------------------------------------------------------------------------
# IndicASREngine — ONNX-based, thread-safe singleton
# ---------------------------------------------------------------------------
class IndicASREngine:
    """
    ONNX-backed wrapper around AI4Bharat IndicConformer 600M.
    - Lazy loads on first transcribe call or explicit initialize().
    - GPU (CUDA) preferred; falls back to CPU automatically.
    - Default decoder: CTC (~25 ms on RTX 4050).
    - RNNT decoder available via transcribe(decoder='rnnt').
    - Word-level timestamps available via transcribe(timestamps=True).
    """

    MODEL_NAME = "ai4bharat/indic-conformer-600m-multilingual"

    def __init__(self):
        self.model_name = self.MODEL_NAME
        self.local_model_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "models", "indic-conformer-600m-multilingual")
        )
        self.model = None
        self.device: Optional[str] = None
        self.is_initialized: bool = False
        self._lock = threading.Lock()  # single-init guard
        self._idle_timer: Optional[threading.Timer] = None

    # ------------------------------------------------------------------
    def initialize(self) -> None:
        """Load the ONNX IndicConformer model.  Idempotent & thread-safe."""
        with self._lock:
            if self.is_initialized:
                return

            import torch
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"[IndicASR] Initializing on {self.device} | model dir: {self.local_model_dir}")

            if not os.path.isdir(self.local_model_dir) or not os.listdir(self.local_model_dir):
                raise RuntimeError(
                    f"Local model directory not found or empty: {self.local_model_dir}\n"
                    "Run 'python download_model.py' first."
                )

            try:
                # Add model directory to path so model_onnx.py can be imported
                if self.local_model_dir not in sys.path:
                    sys.path.insert(0, self.local_model_dir)

                from transformers import AutoConfig, AutoModel
                import model_onnx  # model_onnx.py lives inside the downloaded model dir

                AutoConfig.register("iasr", model_onnx.IndicASRConfig, exist_ok=True)
                AutoModel.register(model_onnx.IndicASRConfig, model_onnx.IndicASRModel, exist_ok=True)

                config = model_onnx.IndicASRConfig(ts_folder=self.local_model_dir)
                self.model = model_onnx.IndicASRModel(config)

                self.is_initialized = True
                logger.info(f"[IndicASR] ✅ ONNX model loaded in {self.device.upper()} mode.")

            except Exception as e:
                logger.error(f"[IndicASR] ❌ Model load failed: {e}")
                raise

    # ------------------------------------------------------------------
    def _ensure_ready(self) -> None:
        if not self.is_initialized:
            self.initialize()

    # ------------------------------------------------------------------
    def normalize_lang_code(self, lang_input: str) -> str:
        """Map any supported alias → canonical 2-3 char ISO code (default: hi)."""
        return ASR_LANG_MAP.get(str(lang_input).strip().lower(), "hi")

    # ------------------------------------------------------------------
    def transcribe(
        self,
        audio_wav_tensor,          # torch.Tensor [1, samples] @ 16kHz
        lang_code: str = "hi",
        decoder: str = "ctc",      # 'ctc' or 'rnnt'
        timestamps: bool = False   # word-level timestamps
    ) -> Dict[str, Union[str, float, bool, list]]:
        """
        Run inference on a pre-loaded 16kHz mono waveform tensor.

        Args:
            audio_wav_tensor: torch.Tensor shape [1, N] at 16 kHz.
            lang_code: Language code (any alias accepted).
            decoder: 'ctc' (fast, ~25 ms) or 'rnnt' (accurate, ~65 ms).
            timestamps: If True, also return word-level timestamps.

        Returns:
            dict with keys: success, language_id, transcript, latency_ms,
                            model_name, [timestamps] (if requested)
        """
        self._ensure_ready()
        norm_lang = self.normalize_lang_code(lang_code)

        t0 = time.time()
        try:
            import torch
            with torch.inference_mode():
                if timestamps:
                    text, ts = self.model(audio_wav_tensor, norm_lang,
                                         decoding=decoder, compute_timestamps="w")
                    elapsed_ms = (time.time() - t0) * 1000
                    logger.info(f"[IndicASR] [{norm_lang}|{decoder}|ts] {elapsed_ms:.1f}ms → '{text}'")
                    return {
                        "success": True,
                        "language_id": norm_lang,
                        "transcript": text or "",
                        "timestamps": ts,
                        "latency_ms": elapsed_ms,
                        "model_name": self.model_name,
                    }
                else:
                    text = self.model(audio_wav_tensor, norm_lang, decoding=decoder)
                    elapsed_ms = (time.time() - t0) * 1000
                    logger.info(f"[IndicASR] [{norm_lang}|{decoder}] {elapsed_ms:.1f}ms → '{text}'")
                    return {
                        "success": True,
                        "language_id": norm_lang,
                        "transcript": text or "",
                        "latency_ms": elapsed_ms,
                        "model_name": self.model_name,
                    }

        except Exception as err:
            elapsed_ms = (time.time() - t0) * 1000
            logger.error(f"[IndicASR] Transcription error [{norm_lang}]: {err}")
            return {
                "success": False,
                "language_id": norm_lang,
                "transcript": "",
                "latency_ms": elapsed_ms,
                "error": str(err),
                "model_name": self.model_name,
            }

    # ------------------------------------------------------------------
    def warmup(self) -> None:
        """Run CUDA inferences across key language masks to JIT-compile ONNX graph."""
        try:
            import torch
            dummy = torch.zeros(1, 48000)  # 3s silence
            warmup_langs = ("hi", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa", "ur")
            with torch.inference_mode():
                for lang in warmup_langs:
                    self.transcribe(dummy, lang_code=lang, decoder="ctc")
            logger.info("[IndicASR] Warmup complete — GPU graph compiled for 10 core languages.")
        except Exception as e:
            logger.warning(f"[IndicASR] Warmup skipped: {e}")

    def unload(self) -> None:
        """Thread-safe unloading of ASR ONNX sessions and clearing of CUDA memory."""
        with self._lock:
            if not self.is_initialized:
                return
            logger.info("[IndicASR] Unloading ASR ONNX model from memory...")
            if self._idle_timer:
                self._idle_timer.cancel()
                self._idle_timer = None
            self.model = None
            self.is_initialized = False
            try:
                import torch, gc
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                gc.collect()
            except Exception as e:
                logger.warning(f"Error during CUDA cleanup: {e}")
            logger.info("[IndicASR] 🧹 Unloaded ASR ONNX model — GPU VRAM freed.")

    def reset_idle_timer(self, timeout: float = 15.0) -> None:
        """Schedules auto-eviction after 15 seconds of idle inactivity."""
        with self._lock:
            if self._idle_timer:
                self._idle_timer.cancel()
            self._idle_timer = threading.Timer(timeout, self.unload)
            self._idle_timer.daemon = True
            self._idle_timer.start()


# ---------------------------------------------------------------------------
# Global singleton
# ---------------------------------------------------------------------------
asr_engine = IndicASREngine()
