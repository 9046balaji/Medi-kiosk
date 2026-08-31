"""
test_tts.py — Automated E2E verification test suite for Indic Parler-TTS Microservice
Usage: python test_tts.py
"""

import sys
import time
import requests
import os

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:8002"
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "test_output"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

TEST_CASES = [
    {"text": "नमस्ते! मेडीकियोस्क स्वास्थ्य केंद्र में आपका स्वागत है।", "lang_key": "hindi", "speaker": "Divya"},
    {"text": "Hello, welcome to MediKiosk Healthcare OPD Station.", "lang_key": "english", "speaker": "Mary"},
    {"text": "வணக்கம், உங்களுக்கு என்ன உதவி வேண்டும்?", "lang_key": "tamil", "speaker": "Jaya"},
    {"text": "నమస్కారం, మీకు ఏమి సహాయం కావాలి?", "lang_key": "telugu", "speaker": "Lalitha"},
    {"text": "नमस्कार, मेडीकिऑस्क मध्ये आपले स्वागत आहे.", "lang_key": "marathi", "speaker": "Sunita"}
]

def run_tests():
    print("=" * 70)
    print(" 🎙️ MediKiosk Indic Parler-TTS Microservice E2E Test Suite")
    print("=" * 70)

    # 1. Health check
    print("\n[1/3] Testing GET /api/health...")
    try:
        r = requests.get(f"{BASE_URL}/api/health", timeout=5)
        print(f"   Status Code : {r.status_code}")
        print(f"   Response    : {r.json()}")
        if r.status_code != 200:
            print("❌ Health check failed!")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Server connection failed on {BASE_URL}: {e}")
        sys.exit(1)

    # 2. Speakers list
    print("\n[2/3] Testing GET /api/speakers...")
    r = requests.get(f"{BASE_URL}/api/speakers", timeout=5)
    data = r.json()
    print(f"   Total Supported Languages: {data.get('total_languages')}")

    # 3. Synthesis tests
    print("\n[3/3] Testing POST /api/tts synthesis across Indic languages...")
    pass_count = 0

    for i, tc in enumerate(TEST_CASES, 1):
        print(f"\n   Test {i}/{len(TEST_CASES)}: [{tc['lang_key'].upper()}] - Voice: {tc['speaker']}")
        print(f"   Text: '{tc['text']}'")

        t0 = time.time()
        payload = {
            "text": tc["text"],
            "lang_key": tc["lang_key"],
            "speaker": tc["speaker"],
            "gender": "female",
            "speed": "normal"
        }

        resp = requests.post(f"{BASE_URL}/api/tts", json=payload, timeout=30)
        wall_time_ms = (time.time() - t0) * 1000

        if resp.status_code == 200 and resp.headers.get("Content-Type") == "audio/wav":
            wav_bytes = resp.content
            latency_ms = resp.headers.get("X-Latency-MS", "0")
            duration_sec = resp.headers.get("X-Audio-Duration", "0")

            # Verify WAV header RIFF
            is_valid_wav = wav_bytes.startswith(b"RIFF") and b"WAVE" in wav_bytes[:16]

            # Save sample file
            file_path = os.path.join(OUTPUT_DIR, f"tts_sample_{tc['lang_key']}.wav")
            with open(file_path, "wb") as f:
                f.write(wav_bytes)

            print(f"   ✅ SUCCESS: {len(wav_bytes)} bytes | Duration: {duration_sec}s | Latency: {latency_ms}ms (Wall: {wall_time_ms:.0f}ms)")
            print(f"   Saved to: {file_path}")
            if is_valid_wav:
                pass_count += 1
            else:
                print("   ⚠️ Warning: Audio byte header invalid!")
        else:
            print(f"   ❌ FAILED: Status {resp.status_code} | {resp.text}")

    print("\n" + "=" * 70)
    print(f"📊 SUMMARY: {pass_count}/{len(TEST_CASES)} tests passed cleanly!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
