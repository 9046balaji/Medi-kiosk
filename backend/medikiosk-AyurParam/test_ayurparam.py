"""
test_ayurparam.py — MediKiosk AyurParam GGUF 2.0 Test Battery
Verifies:
1. Direct GGUF Inference via Live Ngrok URL (https://doormat-undying-detergent.ngrok-free.dev)
2. Dashavidha 10-Fold Assessment Matrix Synthesis
3. Tridosha Imbalance Analysis (Vata/Pitta/Kapha)
4. Herb-Drug Safety Matrix Check (Allopathic vs AYUSH)
"""

import sys
import asyncio
import json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from ayurparam_engine import ayurparam_engine

async def run_tests():
    print("=================================================================================")
    print(" 🌿 MEDIKIOSK AYURPARAM GGUF 2.0 ENTERPRISE TEST BATTERY                         ")
    print("=================================================================================")

    # ── TEST 1: Direct Live Ngrok GGUF Inference ───────────────────────────────
    print("\n---------------------------------------------------------------------------------")
    print(" 🧪 TEST 1: Direct Live Ngrok GGUF Inference (https://doormat-undying-detergent.ngrok-free.dev)")
    print("---------------------------------------------------------------------------------")
    prompt = "Explain the clinical significance of Agni (digestive fire) in Ayurveda."
    print(f"  Querying Prompt : '{prompt}'")
    
    resp = await ayurparam_engine._query_remote_endpoint(prompt, max_tokens=150)
    print(f"  Live GGUF Response snippet: '{resp[:150]}...'")
    assert len(resp) > 0, "Failed GGUF remote inference"
    print("  ✓ PASS: Direct live Ngrok AyurParam GGUF inference verified!")

    # ── TEST 2: Dashavidha 10-Fold Assessment ─────────────────────────────────
    print("\n---------------------------------------------------------------------------------")
    print(" 🧪 TEST 2: Dashavidha 10-Fold Pariksha Assessment Synthesis")
    print("---------------------------------------------------------------------------------")
    intake_data = {
        "symptoms": "Hyperacidity, burning sensation in stomach after meals, and mild bloating",
        "vitals": {"bp": "120/80", "pulse": 76},
        "patient_info": {"name": "Rajesh Sharma", "age": 42, "gender": "Male"}
    }
    
    dash_res = await ayurparam_engine.generate_dashavidha_assessment(intake_data, "english")
    print(f"  Prakriti Assessment : {dash_res.get('dashavidha_pariksha', {}).get('prakriti')}")
    print(f"  Vikriti State       : {dash_res.get('dashavidha_pariksha', {}).get('vikriti')}")
    print(f"  Agni State          : {dash_res.get('dashavidha_pariksha', {}).get('agni')}")
    assert "dashavidha_pariksha" in dash_res, "Failed Dashavidha synthesis"
    print("  ✓ PASS: Dashavidha 10-Fold Assessment synthesis verified!")

    # ── TEST 3: Tridosha Imbalance Analysis ───────────────────────────────────
    print("\n---------------------------------------------------------------------------------")
    print(" 🧪 TEST 3: Tridosha Imbalance Analyzer (Vata / Pitta / Kapha)")
    print("---------------------------------------------------------------------------------")
    tridosha_res = await ayurparam_engine.analyze_tridosha_imbalance("Burning eyes, acid reflux, excessive thirst")
    print(f"  Dosha Percentages : {tridosha_res.get('dosha_percentages')}")
    print(f"  Primary Imbalance : {tridosha_res.get('primary_imbalance')}")
    assert "dosha_percentages" in tridosha_res, "Failed Tridosha analysis"
    print("  ✓ PASS: Tridosha Imbalance analyzer verified!")

    # ── TEST 4: Herb-Drug Interaction Matrix Check ────────────────────────────
    print("\n---------------------------------------------------------------------------------")
    print(" 🧪 TEST 4: Herb-Drug Safety Matrix Check (Allopathic vs AYUSH)")
    print("---------------------------------------------------------------------------------")
    meds = ["Aspirin 75mg", "Guggulu 500mg", "Pantoprazole 40mg"]
    alerts = ayurparam_engine.check_herb_drug_interactions(meds)
    print(f"  Tested Medications: {meds}")
    print(f"  Triggered Safety Alerts ({len(alerts)}): {json.dumps(alerts, indent=2)}")
    assert len(alerts) > 0, "Expected herb-drug interaction alert for Aspirin + Guggulu"
    print("  ✓ PASS: Herb-Drug interaction matrix verified!")

    print("\n=================================================================================")
    print(" 🎉 ALL MEDIKIOSK AYURPARAM GGUF 2.0 UNIT TESTS PASSED WITH 100% SUCCESS!        ")
    print("=================================================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
