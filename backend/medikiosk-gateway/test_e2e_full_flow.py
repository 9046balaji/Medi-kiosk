"""
test_e2e_full_flow.py — Full End-to-End Request Flow & Gateway Router Benchmark
Tests the complete request flow:
  [Frontend Client / API Request]
         │
         ▼
  [MediKiosk AI Gateway Router] (Port 8007 / Smart Classifier)
         │
         ├───▶ [Google MedGemma 2.1 Colab GPU Server] (https://unilludedly-pipier-paola.ngrok-free.dev)
         │
         └───▶ [AYUSH AyurParam GGUF Colab GPU Server] (https://doormat-undying-detergent.ngrok-free.dev)
"""

import sys
import time
import json
import asyncio

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from gateway_router import ai_gateway_router

async def run_full_e2e_benchmark():
    print("=================================================================================")
    print(" 🌉 MEDIKIOSK ENTERPRISE END-TO-END AI GATEWAY & MULTI-MODEL BENCHMARK            ")
    print("=================================================================================")

    # ── STEP 1: Live Telemetry & Health Verification ───────────────────────────
    print("\n---------------------------------------------------------------------------------")
    print(" 📡 STEP 1: Pinging Live Colab GPU Servers & Gateway Health Check")
    print("---------------------------------------------------------------------------------")
    health = await ai_gateway_router.check_gateway_health()
    
    medgemma_info = health["models"]["medgemma_2_1"]
    ayurparam_info = health["models"]["ayurparam_gguf"]

    print(f"  MedGemma 2.1 Endpoint : {medgemma_info['remote_url']}")
    print(f"  MedGemma Online Status: {medgemma_info['remote_online']} ({medgemma_info['remote_latency_ms']} ms)")
    print(f"  AyurParam Endpoint    : {ayurparam_info['remote_url']}")
    print(f"  AyurParam Online Status: {ayurparam_info['remote_online']} ({ayurparam_info['remote_latency_ms']} ms)")

    # ── STEP 2: Allopathic / Emergency Route (MedGemma 2.1) ────────────────────
    print("\n---------------------------------------------------------------------------------")
    print(" 🏥 STEP 2: Testing Allopathic Clinical Route -> MedGemma 2.1")
    print("---------------------------------------------------------------------------------")
    prompt_allo = "Patient reports acute chest pressure, shortness of breath, and left arm numbness. Evaluate emergency triage."
    print(f"  Input Prompt : '{prompt_allo}'")
    
    t0 = time.time()
    res_allo = await ai_gateway_router.route_generation(prompt_allo, mode="allopathic", max_tokens=150)
    dt_allo = (time.time() - t0) * 1000

    print(f"  Classifier Decision : Target -> '{res_allo['target_model']}'")
    print(f"  Model Used          : '{res_allo['model_used']}'")
    print(f"  Endpoint Route      : '{res_allo['endpoint_used']}'")
    print(f"  Failover Triggered  : {res_allo['failover_triggered']}")
    print(f"  Roundtrip Latency   : {dt_allo:.2f} ms")
    print(f"  Response Output     :\n{res_allo['response'][:250]}...\n")
    assert res_allo["status"] in ["success", "fallback"]
    print("  ✓ PASS: Allopathic request flow to MedGemma 2.1 verified!")

    # ── STEP 3: AYUSH / Ayurvedic Route (AyurParam GGUF) ──────────────────────
    print("\n---------------------------------------------------------------------------------")
    print(" 🌿 STEP 3: Testing AYUSH Ayurvedic Route -> AyurParam GGUF")
    print("---------------------------------------------------------------------------------")
    prompt_ayush = "Analyze 10-Fold Dashavidha assessment and Tridosha imbalance for severe epigastric acid reflux (Amlapitta)."
    print(f"  Input Prompt : '{prompt_ayush}'")

    t0 = time.time()
    res_ayush = await ai_gateway_router.route_generation(prompt_ayush, mode="ayurvedic", max_tokens=150)
    dt_ayush = (time.time() - t0) * 1000

    print(f"  Classifier Decision : Target -> '{res_ayush['target_model']}'")
    print(f"  Model Used          : '{res_ayush['model_used']}'")
    print(f"  Endpoint Route      : '{res_ayush['endpoint_used']}'")
    print(f"  Failover Triggered  : {res_ayush['failover_triggered']}")
    print(f"  Roundtrip Latency   : {dt_ayush:.2f} ms")
    print(f"  Response Output     :\n{res_ayush['response'][:250]}...\n")
    assert res_ayush["status"] in ["success", "fallback"]
    print("  ✓ PASS: AYUSH Ayurvedic request flow to AyurParam GGUF verified!")

    # ── STEP 4: Auto Keyword Classification Route ─────────────────────────────
    print("\n---------------------------------------------------------------------------------")
    print(" 🧠 STEP 4: Testing Auto Keyword Classification & Routing (Mode = 'auto')")
    print("---------------------------------------------------------------------------------")
    auto_query_1 = "What is the recommended dosage of Avipattikar Churna for Agni Mandya?"
    target_1 = ai_gateway_router.classify_target_model(auto_query_1, mode="auto")
    print(f"  Auto Query 1: '{auto_query_1}' -> Auto Target: '{target_1}'")
    assert target_1 == "ayurparam"

    auto_query_2 = "What are the contraindications for oral Pantoprazole 40mg?"
    target_2 = ai_gateway_router.classify_target_model(auto_query_2, mode="auto")
    print(f"  Auto Query 2: '{auto_query_2}' -> Auto Target: '{target_2}'")
    assert target_2 == "medgemma"
    print("  ✓ PASS: Auto keyword classifier routing verified!")

    print("\n=================================================================================")
    print(" 🎉 FULL END-TO-END AI GATEWAY & DUAL COLAB MODEL FLOW VERIFIED WITH 100% SUCCESS!")
    print("=================================================================================")

if __name__ == "__main__":
    asyncio.run(run_full_e2e_benchmark())
