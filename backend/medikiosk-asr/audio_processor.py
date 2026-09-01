"""
audio_processor.py — Fast in-memory 16kHz mono WAV conversion + silence detection 2.0.
Decodes raw audio bytes directly using io.BytesIO without disk I/O bottlenecks.
"""

import io
import os
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
    In-memory decoding of audio bytes → 16kHz mono torch.Tensor [1, N].
    Decodes directly from memory buffer (io.BytesIO) to eliminate disk I/O bottlenecks.
    Uses torchaudio.functional.resample instead of per-request object allocation.

    Returns:
        (waveform_tensor, duration_seconds, is_silent)
    """
    import torch
    import torchaudio

    if not audio_bytes or len(audio_bytes) < 100:
        logger.warning("Empty or truncated audio payload.")
        return None, 0.0, True

    buffer = io.BytesIO(audio_bytes)
    waveform = None
    sample_rate = None

    # --- Primary: In-Memory torchaudio decode ---
    try:
        waveform, sample_rate = torchaudio.load(buffer)
    except Exception as e_torch:
        logger.debug(f"torchaudio in-memory load failed ({e_torch}), trying pydub in-memory...")
        try:
            buffer.seek(0)
            from pydub import AudioSegment
            seg = AudioSegment.from_file(buffer)
            seg = seg.set_frame_rate(target_sample_rate).set_channels(1)
            raw = np.array(seg.get_array_of_samples(), dtype=np.float32)
            raw /= max(abs(raw.max()), 1e-6) * 32768.0
            waveform = torch.from_numpy(raw).unsqueeze(0)
            sample_rate = target_sample_rate
        except Exception as e_pydub:
            logger.error(f"In-memory audio decode failed: {e_pydub}")
            return None, 0.0, True

    # Mono down-mix
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)

    # Resample using torchaudio.functional.resample (zero object allocation overhead)
    if sample_rate != target_sample_rate:
        waveform = torchaudio.functional.resample(
            waveform, orig_freq=sample_rate, new_freq=target_sample_rate
        )

    duration = waveform.shape[1] / float(target_sample_rate)

    # RMS silence check
    rms = float(waveform.square().mean().sqrt())
    is_silent = rms < _SILENCE_RMS_THRESHOLD or duration < _MIN_DURATION_SEC

    if is_silent:
        logger.debug(f"Audio silent (rms={rms:.5f}, dur={duration:.2f}s)")
        return None, duration, True

    return waveform, duration, False


def process_audio_input(
    audio_bytes: bytes,
    original_filename: str = "audio.webm",
    target_sample_rate: int = 16000,
) -> Tuple[Optional[str], float, bool]:
    """
    Legacy interface: decode audio → temp WAV path (for callers that need a file path).

    Returns:
        (temp_wav_path, duration_seconds, is_silent)
    """
    import tempfile
    import torchaudio

    waveform, duration, is_silent = load_audio_tensor(
        audio_bytes, original_filename, target_sample_rate
    )
    if is_silent or waveform is None:
        return None, duration, True

    tmp_out = os.path.join(tempfile.gettempdir(), f"asr_out_{os.urandom(4).hex()}.wav")
    torchaudio.save(tmp_out, waveform, target_sample_rate)
    return tmp_out, duration, False
