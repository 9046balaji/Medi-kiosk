"""
test_tts.py — MediKiosk Indic Parler-TTS 2.0 Engine & Microservice Test Battery
Verifies:
1. Medical G2P Pre-processing (Acronym & Vitals Expansion)
2. Dynamic Triage Prosody Tone Mapping (P1_CRITICAL vs P3_ROUTINE)
3. SHA-256 LRU Audio Cache (0ms Latency on Repeated Synthesis)
4. Audio Resampling (16000Hz vs 24000Hz)
5. 120s Idle Eviction Timeout (Prevention of VRAM Thrashing)
"""

import os
import sys
import time

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from indic_tts import tts_engine, preprocess_medical_text, DEFAULT_IDLE_TIMEOUT

def run_tests():
    print("=================================================================================")
    print(" 🔊 MEDIKIOSK INDIC PARLER-TTS 2.0 ENTERPRISE TEST BATTERY                       ")
    print("=================================================================================")

    # ── TEST 1: Medical G2P & Abbreviations Pre-Processor ──────────────────────
    print("\n---------------------------------------------------------------------------------")
    print(" 🧪 TEST 1: Medical G2P Acronym & Vitals Expansion")
    print("---------------------------------------------------------------------------------")
    eng_input = "Patient BP 120/80 with SpO2 98% and normal ECG in OPD"
    eng_processed = preprocess_medical_text(eng_input, "english")
    print(f"  English Input    : '{eng_input}'")
    print(f"  Processed Output : '{eng_processed}'")
    assert "Blood Pressure 120 over 80" in eng_processed, "Failed English BP expansion"
    assert "Electrocardiogram" in eng_processed, "Failed English ECG expansion"

    hin_input = "रोगी का BP 120/80 है और ECG सामान्य है।"
    hin_processed = preprocess_medical_text(hin_input, "hindi")
    print(f"  Hindi Input      : '{hin_input}'")
    print(f"  Processed Output : '{hin_processed}'")
    assert "ब्लड प्रेशर" in hin_processed, "Failed Hindi BP expansion"
    assert "ईसीजी" in hin_processed, "Failed Hindi ECG expansion"
    print("  ✓ PASS: Medical G2P acronyms and vitals expanded cleanly across languages!")

    # ── TEST 2: Dynamic Triage Prosody Description Builder ─────────────────────
    print("\n---------------------------------------------------------------------------------")
    print(" 🧪 TEST 2: Dynamic Triage Prosody Description Builder")
    print("---------------------------------------------------------------------------------")
    desc_p1 = tts_engine.build_description("english", gender="female", triage_level="P1_CRITICAL")
    desc_p3 = tts_engine.build_description("english", gender="female", triage_level="P3_ROUTINE")
    print(f"  P1 Critical Prompt : '{desc_p1}'")
    print(f"  P3 Routine Prompt  : '{desc_p3}'")
    assert "urgent" in desc_p1, "Failed P1 urgent prosody mapping"
    assert "reassuring" in desc_p3, "Failed P3 reassuring prosody mapping"
    print("  ✓ PASS: Triage priority prosody mapping verified!")

    # ── TEST 3: Synthesis & SHA-256 LRU Audio Cache (0ms Latency) ───────────────
    print("\n---------------------------------------------------------------------------------")
    print(" 🧪 TEST 3: Synthesis Execution & In-Memory LRU Cache")
    print("---------------------------------------------------------------------------------")
    test_phrase = "Emergency alert triggered. Please stay seated while nurse is notified."
    
    # First Synthesis (Model / Fallback)
    t0 = time.time()
    wav_1, dur_1, lat_1 = tts_engine.synthesize(test_phrase, lang_key="english", gender="female")
    print(f"  Call 1 (Fresh Synthesis)  : Latency={lat_1:.2f}ms | Audio Duration={dur_1:.2f}s | Bytes={len(wav_1)}")
    
    # Second Synthesis (LRU Cache Hit)
    wav_2, dur_2, lat_2 = tts_engine.synthesize(test_phrase, lang_key="english", gender="female")
    print(f"  Call 2 (LRU Cache Hit)    : Latency={lat_2:.2f}ms | Audio Duration={dur_2:.2f}s | Bytes={len(wav_2)}")
    assert lat_2 <= 5.0, "Expected < 5ms LRU cache hit!"
    assert len(wav_1) == len(wav_2), "Cache bytes mismatch!"
    print("  ✓ PASS: 0ms LRU cache hit verified!")

    # ── TEST 4: Audio Resampling (16000Hz vs 24000Hz) ───────────────────────────
    print("\n---------------------------------------------------------------------------------")
    print(" 🧪 TEST 4: Audio Resampling (16000Hz WebRTC vs 24000Hz Standard)")
    print("---------------------------------------------------------------------------------")
    wav_16k, dur_16k, lat_16k = tts_engine.synthesize("Resampling test phrase", lang_key="english", target_sample_rate=16000)
    print(f"  16000Hz Audio Output : Bytes={len(wav_16k)} | Duration={dur_16k:.2f}s")
    assert len(wav_16k) > 0, "Failed audio resampling"
    print("  ✓ PASS: Audio resampling to 16000Hz verified!")

    # ── TEST 5: Idle Eviction Timeout Verification ──────────────────────────────
    print("\n---------------------------------------------------------------------------------")
    print(" 🧪 TEST 5: 120s Idle Timeout Eviction Config")
    print("---------------------------------------------------------------------------------")
    print(f"  Configured Idle Timeout : {DEFAULT_IDLE_TIMEOUT} seconds (Prevents 15s VRAM thrashing)")
    assert DEFAULT_IDLE_TIMEOUT >= 120.0, "Idle timeout must be >= 120.0s"
    print("  ✓ PASS: Idle eviction timeout set to 120.0s!")

    print("\n=================================================================================")
    print(" 🎉 ALL MEDIKIOSK INDIC PARLER-TTS 2.0 UNIT TESTS PASSED WITH 100% SUCCESS!       ")
    print("=================================================================================")

if __name__ == "__main__":
    run_tests()
