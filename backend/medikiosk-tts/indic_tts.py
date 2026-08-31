"""
indic_tts.py — AI4Bharat Indic Parler-TTS 20-Language Neural Speech Synthesis Engine
Uses local model checkpoint in ./models/indic-parler-tts
Supports 20 Indian languages + English with speaker & style prompt control.
"""

import os
import sys
import io
import time
import logging
import threading
from typing import Dict, Optional, Tuple, Any
import torch
import soundfile as sf

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IndicTTS")

# ---------------------------------------------------------------------------
# Speaker Directory & Defaults (20 Languages + English)
# ---------------------------------------------------------------------------
SPEAKER_DIRECTORY: Dict[str, Dict[str, Any]] = {
    "hindi": {"default": "Divya", "female": "Divya", "male": "Rohit", "all": ["Divya", "Rohit", "Aman", "Rani"]},
    "english": {"default": "Mary", "female": "Mary", "male": "Thoma", "all": ["Mary", "Thoma", "Swapna", "Dinesh", "Meera", "Jatin", "Sneha", "Kabir", "Priya", "Tarun"]},
    "tamil": {"default": "Jaya", "female": "Jaya", "male": "Jaya", "all": ["Jaya", "Kavitha"]},
    "telugu": {"default": "Lalitha", "female": "Lalitha", "male": "Prakash", "all": ["Lalitha", "Prakash", "Kiran"]},
    "bengali": {"default": "Aditi", "female": "Aditi", "male": "Arjun", "all": ["Aditi", "Arjun", "Tapan", "Rashmi", "Arnav", "Riya"]},
    "marathi": {"default": "Sunita", "female": "Sunita", "male": "Sanjay", "all": ["Sunita", "Sanjay", "Nikhil", "Radha", "Varun", "Isha"]},
    "gujarati": {"default": "Neha", "female": "Neha", "male": "Yash", "all": ["Neha", "Yash"]},
    "kannada": {"default": "Anu", "female": "Anu", "male": "Suresh", "all": ["Anu", "Suresh", "Chetan", "Vidya"]},
    "malayalam": {"default": "Anjali", "female": "Anjali", "male": "Harish", "all": ["Anjali", "Harish", "Anju"]},
    "assamese": {"default": "Sita", "female": "Sita", "male": "Amit", "all": ["Sita", "Amit", "Poonam", "Rakesh"]},
    "punjabi": {"default": "Gurpreet", "female": "Gurpreet", "male": "Divjot", "all": ["Gurpreet", "Divjot"]},
    "sanskrit": {"default": "Aryan", "female": "Aryan", "male": "Aryan", "all": ["Aryan"]},
    "odia": {"default": "Debjani", "female": "Debjani", "male": "Manas", "all": ["Debjani", "Manas"]},
    "bodo": {"default": "Maya", "female": "Maya", "male": "Bikram", "all": ["Maya", "Bikram", "Kalpana"]},
    "dogri": {"default": "Karan", "female": "Karan", "male": "Karan", "all": ["Karan"]},
    "nepali": {"default": "Amrita", "female": "Amrita", "male": "Amrita", "all": ["Amrita"]},
    "manipuri": {"default": "Laishram", "female": "Laishram", "male": "Ranjit", "all": ["Laishram", "Ranjit"]},
    "konkani": {"default": "Sunita", "female": "Sunita", "male": "Sanjay", "all": ["Sunita", "Sanjay"]},
    "maithili": {"default": "Divya", "female": "Divya", "male": "Rohit", "all": ["Divya", "Rohit"]},
    "sindhi": {"default": "Rohit", "female": "Divya", "male": "Rohit", "all": ["Divya", "Rohit"]},
    "santali": {"default": "Maya", "female": "Maya", "male": "Bikram", "all": ["Maya", "Bikram"]}
}


class IndicTTSEngine:
    """
    Singleton Neural TTS engine wrapping AI4Bharat Indic Parler-TTS.
    """
    MODEL_ID = "ai4bharat/indic-parler-tts"

    def __init__(self):
        self.local_model_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "models", "indic-parler-tts")
        )
        self.model = None
        self.tokenizer = None
        self.description_tokenizer = None
        self.device: Optional[str] = None
        self.sample_rate: int = 24000
        self.is_initialized: bool = False
        self._lock = threading.Lock()
        self._desc_cache: Dict[str, Any] = {}
        self._idle_timer: Optional[threading.Timer] = None

    def initialize(self) -> None:
        """Load the Indic Parler-TTS model and dual tokenizers. Thread-safe & idempotent."""
        with self._lock:
            if self.is_initialized:
                return

            self.device = "cuda:0" if torch.cuda.is_available() else "cpu"
            logger.info(f"[IndicTTS] Initializing on {self.device} | local dir: {self.local_model_dir}")

            model_path = self.local_model_dir if os.path.isdir(self.local_model_dir) and os.listdir(self.local_model_dir) else self.MODEL_ID

            try:
                from parler_tts import ParlerTTSForConditionalGeneration
                from transformers import AutoTokenizer

                logger.info(f"[IndicTTS] Loading model from '{model_path}'...")
                self.model = ParlerTTSForConditionalGeneration.from_pretrained(
                    model_path,
                    torch_dtype=torch.float16 if self.device.startswith("cuda") else torch.float32
                ).to(self.device)

                self.tokenizer = AutoTokenizer.from_pretrained(model_path)
                desc_path = getattr(self.model.config.text_encoder, "_name_or_path", "google/flan-t5-large")
                self.description_tokenizer = AutoTokenizer.from_pretrained(desc_path)

                self.sample_rate = getattr(self.model.config, "sampling_rate", 24000)
                self.is_initialized = True
                logger.info(f"[IndicTTS] ✅ Indic Parler-TTS loaded successfully on {self.device} (Sample Rate: {self.sample_rate}Hz).")

            except Exception as e:
                logger.error(f"[IndicTTS] ❌ Model load failed: {e}")
                raise

    def _ensure_ready(self):
        if not self.is_initialized:
            self.initialize()

    def build_description(
        self,
        lang_key: str = "english",
        speaker_name: Optional[str] = None,
        gender: str = "female",
        speed: str = "normal",
        quality: str = "high"
    ) -> str:
        """
        Builds natural voice description prompt for Parler-TTS text encoder.
        """
        lang = lang_key.lower().strip()
        speaker_info = SPEAKER_DIRECTORY.get(lang, SPEAKER_DIRECTORY["english"])

        if not speaker_name or speaker_name not in speaker_info["all"]:
            speaker_name = speaker_info.get(gender, speaker_info["default"])

        pace_map = {
            "slow": "slightly slow pace",
            "normal": "moderate pace",
            "fast": "slightly fast pace"
        }
        pace_str = pace_map.get(speed, "moderate pace")

        description = (
            f"{speaker_name}'s voice is clear, natural, and expressive, delivered with a {pace_str} "
            f"and balanced pitch. The recording is of very high quality with close audio and no background noise."
        )
        return description

    def synthesize(
        self,
        text: str,
        lang_key: str = "hindi",
        speaker_name: Optional[str] = None,
        gender: str = "female",
        speed: str = "normal"
    ) -> Tuple[bytes, float, float]:
        """
        Synthesizes text into 24kHz WAV audio bytes.

        Returns:
            (wav_bytes, duration_seconds, latency_ms)
        """
        self._ensure_ready()
        text = text.strip()
        if not text:
            raise ValueError("Input text cannot be empty.")

        t0 = time.time()
        description = self.build_description(lang_key, speaker_name, gender, speed)

        try:
            with torch.inference_mode():
                cache_key = f"{description}_{self.device}"
                if cache_key in self._desc_cache:
                    desc_inputs = self._desc_cache[cache_key]
                else:
                    desc_inputs = self.description_tokenizer(description, return_tensors="pt").to(self.device)
                    self._desc_cache[cache_key] = desc_inputs

                prompt_inputs = self.tokenizer(text, return_tensors="pt").to(self.device)

                generation = self.model.generate(
                    input_ids=desc_inputs.input_ids,
                    attention_mask=desc_inputs.attention_mask,
                    prompt_input_ids=prompt_inputs.input_ids,
                    prompt_attention_mask=prompt_inputs.attention_mask
                )

                audio_arr = generation.cpu().to(torch.float32).numpy().squeeze()

            # Encode to WAV buffer
            wav_buf = io.BytesIO()
            sf.write(wav_buf, audio_arr, self.sample_rate, format='WAV', subtype='PCM_16')
            wav_bytes = wav_buf.getvalue()

            duration_sec = len(audio_arr) / float(self.sample_rate)
            elapsed_ms = (time.time() - t0) * 1000

            logger.info(
                f"[IndicTTS] [{lang_key}|{speaker_name or 'default'}] Synthesized {len(text)} chars "
                f"→ {duration_sec:.2f}s audio in {elapsed_ms:.1f}ms."
            )
            return wav_bytes, duration_sec, elapsed_ms

        except Exception as e:
            logger.error(f"[IndicTTS] Synthesis failed: {e}")
            raise

    def warmup(self):
        """Run 1 dummy inference to compile GPU graph and prevent first-request latency."""
        try:
            logger.info("[IndicTTS] Running GPU warmup inference...")
            self.synthesize("नमस्ते", lang_key="hindi")
            logger.info("[IndicTTS] Warmup complete — GPU pipeline ready.")
        except Exception as e:
            logger.warning(f"[IndicTTS] Warmup skipped: {e}")

    def unload(self) -> None:
        """Thread-safe unloading of Parler-TTS model weights and clearing of CUDA memory."""
        with self._lock:
            if not self.is_initialized:
                return
            logger.info("[IndicTTS] Unloading Parler-TTS model from memory...")
            if self._idle_timer:
                self._idle_timer.cancel()
                self._idle_timer = None
            self.model = None
            self.tokenizer = None
            self.description_tokenizer = None
            self._desc_cache.clear()
            self.is_initialized = False
            try:
                import torch, gc
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                gc.collect()
            except Exception as e:
                logger.warning(f"Error during CUDA cleanup: {e}")
            logger.info("[IndicTTS] 🧹 Unloaded Parler-TTS model — GPU VRAM freed.")

    def reset_idle_timer(self, timeout: float = 60.0) -> None:
        """Schedules auto-eviction after 60 seconds of idle inactivity."""
        with self._lock:
            if self._idle_timer:
                self._idle_timer.cancel()
            self._idle_timer = threading.Timer(timeout, self.unload)
            self._idle_timer.daemon = True
            self._idle_timer.start()


# Global singleton
tts_engine = IndicTTSEngine()
