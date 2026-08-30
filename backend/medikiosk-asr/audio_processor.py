"""
audio_processor.py — Fast 16kHz mono WAV conversion + silence detection.
Returns a torch.Tensor [1, N] directly (no temp file needed by default).
Falls back to a temp WAV file path only when the caller requests it.
"""

import os
import io
import tempfile
import logging
from typing import Tuple, Optional

import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AudioProcessor")

_SILENCE_RMS_THRESHOLD = 0.001   # below this → silent
_MIN_DURATION_SEC       = 0.1    # clips shorter than this → silent


def load_audio_tensor(
    audio_bytes: bytes,
    original_filename: str = "audio.webm",
    target_sample_rate: int = 16000,
):
    """
    Decode raw audio bytes → 16kHz mono torch.Tensor [1, N].
    Tries torchaudio first (fastest), falls back to pydub (handles webm/ogg).

    Returns:
        (waveform_tensor, duration_seconds, is_silent)
        waveform_tensor is None when audio is silent or invalid.
    """
    import torch, torchaudio

    if not audio_bytes or len(audio_bytes) < 100:
        logger.warning("Empty or truncated audio payload.")
        return None, 0.0, True

    # Write input to a temp file (torchaudio needs a seekable file for some formats)
    ext = os.path.splitext(original_filename)[1].lower() or ".webm"
    tmp_in = os.path.join(tempfile.gettempdir(), f"asr_in_{os.urandom(4).hex()}{ext}")
    try:
        with open(tmp_in, "wb") as f:
            f.write(audio_bytes)

        waveform = None
        sample_rate = None

        # --- primary: torchaudio ---
        try:
            waveform, sample_rate = torchaudio.load(tmp_in)
        except Exception as e_torch:
            logger.debug(f"torchaudio failed ({e_torch}), trying pydub…")
            try:
                from pydub import AudioSegment
                seg = AudioSegment.from_file(tmp_in)
                seg = seg.set_frame_rate(target_sample_rate).set_channels(1)
                raw = np.array(seg.get_array_of_samples(), dtype=np.float32)
                raw /= max(abs(raw.max()), 1e-6) * 32768.0
                waveform = torch.from_numpy(raw).unsqueeze(0)
                sample_rate = target_sample_rate
            except Exception as e_pydub:
                logger.error(f"Audio decode failed: {e_pydub}")
                return None, 0.0, True

        # Mono down-mix
        if waveform.shape[0] > 1:
            waveform = waveform.mean(dim=0, keepdim=True)

        # Resample if needed
        if sample_rate != target_sample_rate:
            resampler = torchaudio.transforms.Resample(
                orig_freq=sample_rate, new_freq=target_sample_rate
            )
            waveform = resampler(waveform)

        duration = waveform.shape[1] / target_sample_rate

        # RMS silence check
        rms = float(waveform.square().mean().sqrt())
        is_silent = rms < _SILENCE_RMS_THRESHOLD or duration < _MIN_DURATION_SEC

        if is_silent:
            logger.debug(f"Audio silent (rms={rms:.5f}, dur={duration:.2f}s)")
            return None, duration, True

        return waveform, duration, False

    finally:
        if os.path.exists(tmp_in):
            try:
                os.remove(tmp_in)
            except Exception:
                pass


def process_audio_input(
    audio_bytes: bytes,
    original_filename: str = "audio.webm",
    target_sample_rate: int = 16000,
) -> Tuple[Optional[str], float, bool]:
    """
    Legacy interface: decode audio → temp WAV path (for callers that need a file path).
    Prefer load_audio_tensor() for new code.

    Returns:
        (temp_wav_path, duration_seconds, is_silent)
    """
    import torch, torchaudio

    waveform, duration, is_silent = load_audio_tensor(
        audio_bytes, original_filename, target_sample_rate
    )
    if is_silent or waveform is None:
        return None, duration, True

    tmp_out = os.path.join(tempfile.gettempdir(), f"asr_out_{os.urandom(4).hex()}.wav")
    torchaudio.save(tmp_out, waveform, target_sample_rate)
    return tmp_out, duration, False
