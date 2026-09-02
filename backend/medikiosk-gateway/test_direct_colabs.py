"""
test_direct_colabs.py — Direct HTTP Verification of Live MedGemma & AyurParam Colab Servers
"""

import sys
import json
import time
import requests

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

MEDGEMMA_URL = "https://unilludedly-pipier-paola.ngrok-free.dev"
AYURPARAM_URL = "https://doormat-undying-detergent.ngrok-free.dev"

HEADERS = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    "User-Agent": "MediKiosk-Test/2.0"
}

def test_endpoint(name: str, url: str, prompt: str):
    print(f"\n=================================================================")
    print(f" 🔍 Pinging {name} at: {url}")
    print(f"=================================================================")
    
    # 1. Health GET check
    try:
        t0 = time.time()
        res_h = requests.get(f"{url}/health", headers=HEADERS, timeout=10)
        dt = (time.time() - t0) * 1000
        print(f"  [GET /health] Status Code: {res_h.status_code} | Latency: {dt:.2f} ms")
        print(f"  [GET /health] Response: {res_h.text[:200]}")
    except Exception as e:
        print(f"  [GET /health] Exception: {e}")

    # 2. Direct POST /generate check
    try:
        t0 = time.time()
        payload = {"prompt": prompt, "inputs": prompt, "max_tokens": 100}
        res_p = requests.post(f"{url}/generate", json=payload, headers=HEADERS, timeout=45)
        dt = (time.time() - t0) * 1000
        print(f"  [POST /generate] Status Code: {res_p.status_code} | Latency: {dt:.2f} ms")
        print(f"  [POST /generate] Raw Response Body:\n{res_p.text[:400]}")
    except Exception as e:
        print(f"  [POST /generate] Exception: {e}")

if __name__ == "__main__":
    test_endpoint("Google MedGemma 2.1 Colab Server", MEDGEMMA_URL, "Patient has acute epigastric pain.")
    test_endpoint("AYUSH AyurParam GGUF Colab Server", AYURPARAM_URL, "Explain Dashavidha Pariksha in Ayurveda.")
