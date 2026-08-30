import os
import sys
import time
import tempfile
import numpy as np
import scipy.io.wavfile as wavfile

sys.stdout.reconfigure(encoding='utf-8')

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from indic_asr import asr_engine, ASR_LANG_MAP
from audio_processor import process_audio_input

ALL_22_INDIC_LANG_CODES = [
    ("Assamese", "as"),
    ("Bengali", "bn"),
    ("Bodo", "brx"),
    ("Dogri", "doi"),
    ("Gujarati", "gu"),
    ("Hindi", "hi"),
    ("Kannada", "kn"),
    ("Kashmiri", "ks"),
    ("Konkani", "kok"),
    ("Maithili", "mai"),
    ("Malayalam", "ml"),
    ("Manipuri", "mni"),
    ("Marathi", "mr"),
    ("Nepali", "ne"),
    ("Odia", "or"),
    ("Punjabi", "pa"),
    ("Sanskrit", "sa"),
    ("Santali", "sat"),
    ("Sindhi", "sd"),
    ("Tamil", "ta"),
    ("Telugu", "te"),
    ("Urdu", "ur")
]

def generate_sample_wav() -> str:
    temp_dir = tempfile.gettempdir()
    wav_path = os.path.join(temp_dir, "test_speech_16k.wav")
    sample_rate = 16000
    duration = 2.5
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    audio_data = 0.5 * np.sin(2 * np.pi * 440 * t) + 0.25 * np.sin(2 * np.pi * 880 * t)
    audio_int16 = (audio_data * 32767).astype(np.int16)
    wavfile.write(wav_path, sample_rate, audio_int16)
    return wav_path

def test_asr_pipeline():
    print("==========================================================================")
    print(" 🎙️ AI4BHARAT INDICCONFORMER 600M 22-LANGUAGE ASR TEST SUITE              ")
    print("==========================================================================")

    # 1. Initialize ASR Engine
    print("\n[1/3] Initializing NeMo IndicConformer Model...")
    t0 = time.time()
    asr_engine.initialize()
    print(f"✅ Model loaded on device: {asr_engine.device} in {(time.time() - t0):.2f}s")

    # 2. Generate Test Audio File
    print("\n[2/3] Generating 16kHz PCM Audio Stream...")
    sample_wav = generate_sample_wav()
    print(f" Created test audio file: {sample_wav}")

    # 3. Test Transcription Across All 22 Languages
    print("\n[3/3] Testing NeMo CTC Decoders Across ALL 22 Scheduled Indic Languages...\n")

    passed_count = 0
    for idx, (lang_name, lang_code) in enumerate(ALL_22_INDIC_LANG_CODES, 1):
        t_start = time.time()
        res = asr_engine.transcribe(sample_wav, lang_code=lang_code)
        elapsed_ms = (time.time() - t_start) * 1000

        status = "PASS" if res.get("success") else "FAIL"
        if res.get("success"):
            passed_count += 1

        print(f"[{idx:02d}/22] {status} -> {lang_name:<10} ({lang_code}) | Latency: {elapsed_ms:6.1f}ms | Language ID: {res.get('language_id')}")

    print("\n==========================================================================")
    print(f" ✅ ALL 22 INDIC LANGUAGES ASR TEST COMPLETE! ({passed_count}/22 Passed)")
    print("==========================================================================")

if __name__ == "__main__":
    test_asr_pipeline()
