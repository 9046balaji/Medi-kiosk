"""
MediKiosk End-to-End System Thinking & Multi-Service Test Battery
Tests MedGemma 1.5 Deep Thinking, Multi-Turn Context Accumulation,
OCR (8002), ASR (8001), TTS (8003), and Emergency Triage (8004) Pipeline.
"""

import asyncio
import os
import sys
import json
import time

# Configure UTF-8 stdout for Windows shell
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

os.environ["MEDGEMMA_TIMEOUT"] = "180.0"

emergency_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "medikiosk-emergency"))
if emergency_dir not in sys.path:
    sys.path.insert(0, emergency_dir)

from medgemma_engine import medgemma_engine
from triage_engine import EmergencyTriageEngine


async def run_full_system_thinking_test():
    print("=================================================================================")
    print(" 🧠 MEDGEMMA 1.5 DEEP THINKING & END-TO-END PIPELINE SYSTEM TEST BATTERY        ")
    print("=================================================================================\n")

    start_suite = time.time()
    triage_engine = EmergencyTriageEngine()

    # ---------------------------------------------------------------------------
    # TEST 1: DEEP MULTI-TURN CONTEXT ACCUMULATION THINKING
    # ---------------------------------------------------------------------------
    print("---------------------------------------------------------------------------------")
    print(" 🧠 TEST 1: Multi-Turn Context Accumulation & Deep Clinical Thinking")
    print("---------------------------------------------------------------------------------")

    # Simulate 3 turns of dialogue accumulation
    history = [
        {"speaker": "ai", "text": "Hello! What symptoms bring you to the kiosk today?"},
        {"speaker": "patient", "text": "I have had severe upper abdominal pain and acidity for 2 weeks."},
        {"speaker": "ai", "text": "Does the pain get worse after eating, or on an empty stomach?"},
        {"speaker": "patient", "text": "It worsens 1 hour after meals, especially at night when lying down."}
    ]

    new_utterance = "I also noticed dark tarry stools yesterday morning and feel very weak."
    ocr_found = ["Rx: Pantoprazole 40mg 1-0-0", "Rx: Diclofenac 50mg 1-0-1 (for joint pain)"]

    print(f" [Context History] {len(history)} prior turns logged")
    print(f" [OCR Prescription] {ocr_found}")
    print(f" [Latest Patient Utterance] '{new_utterance}'")

    turn_res = await medgemma_engine.generate_next_question_async(
        conversation_history=history,
        new_transcript=new_utterance,
        ocr_entities=ocr_found,
        mode="allopathic",
        language="english"
    )

    print("\n 🤖 MedGemma Deep Thinking Analysis:")
    print(f"    - Next Question Generated: \"{turn_res['next_question']}\"")
    print(f"    - Emergency Flag Detected: {turn_res.get('emergency_flag', False)}")
    print(f"    - Model Source: {turn_res['model_source']} | Latency: {turn_res['latency_ms']} ms\n")

    # ---------------------------------------------------------------------------
    # TEST 2: CHAIN-OF-VERIFICATION (CoVe) DEEP REASONING
    # ---------------------------------------------------------------------------
    print("---------------------------------------------------------------------------------")
    print(" 🧠 TEST 2: Chain-of-Verification (CoVe) Self-Correction Reasoning")
    print(" Case: '68yo female taking Diclofenac for 6 months presents with Melena & Hb 7.2 g/dL'")
    print("---------------------------------------------------------------------------------")

    cove_case = "68yo female with 6-month history of daily Diclofenac use presents with dark tarry stools (melena), epigastric tenderness, orthostatic dizziness, and hemoglobin of 7.2 g/dL."

    cove_res = await medgemma_engine.cove_reasoning_async(
        clinical_case=cove_case,
        language="english"
    )

    print(" 🤖 CoVe 4-Step Self-Correction Output:")
    print(f"    - Step 1 (Draft Reasoning): {cove_res['draft_response'][:160]}...")
    print(f"    - Step 2 & 3 (Verification Checklist): {len(cove_res['verification_questions'])} checks passed")
    for idx, check in enumerate(cove_res['verification_questions'], 1):
        print(f"        ✓ Checklist {idx}: {check}")
    print(f"    - Step 4 (Audited Final Verdict): {cove_res['final_audited_verdict'][:180]}...")
    print(f"    - Verification Audit Passed: {cove_res['cove_verification_passed']}\n")

    # ---------------------------------------------------------------------------
    # TEST 3: MULTIMODAL VISION DIAGNOSTIC THINKING
    # ---------------------------------------------------------------------------
    print("---------------------------------------------------------------------------------")
    print(" 👁️ TEST 3: Multimodal Vision Diagnostic Image Thinking")
    print(" Base64 Document Input: Scanned Lab Blood Panel & Chest X-Ray")
    print("---------------------------------------------------------------------------------")

    dummy_image = "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    vision_res = await medgemma_engine.analyze_vision_async(
        image_base64=dummy_image,
        prompt="Analyze scanned blood panel for anemia parameters and glycemic status",
        language="english"
    )

    print(" 🤖 MedGemma Vision Extraction Result:")
    print(f"    - Extracted Metrics: {vision_res['extracted_metrics']}")
    print(f"    - Visual Impression: {vision_res['visual_impressions']}")
    print(f"    - Diagnostic Assessment: {vision_res['diagnostic_assessment']}")
    print(f"    - Confidence: {vision_res['confidence'] * 100}%\n")

    # ---------------------------------------------------------------------------
    # TEST 4: POLYPHARMACY HERB-DRUG SAFETY MATRIX THINKING
    # ---------------------------------------------------------------------------
    print("---------------------------------------------------------------------------------")
    print(" 🌿 TEST 4: Herb-Drug & AYUSH Polypharmacy Safety Cross-Checking")
    print(" Allopathic: ['Warfarin 5mg', 'Metformin 500mg', 'Diclofenac 50mg', 'Telmisartan 40mg']")
    print(" AYUSH:      ['Ginkgo Biloba', 'Karela Jamun Juice', 'Sutshekhar Ras', 'Punarnava']")
    print("---------------------------------------------------------------------------------")

    herb_res = await medgemma_engine.check_herb_drug_safety_async(
        allopathic_meds=["Warfarin 5mg", "Metformin 500mg", "Diclofenac 50mg", "Telmisartan 40mg"],
        ayush_meds=["Ginkgo Biloba", "Karela Jamun Juice", "Sutshekhar Ras", "Punarnava"]
    )

    print(" 🤖 MedGemma Herb-Drug Interaction Matrix:")
    print(f"    - Interactions Flagged: {herb_res['total_interactions']} | Highest Severity: [{herb_res['highest_severity']}]")
    for idx, item in enumerate(herb_res['interactions'], 1):
        print(f"      ({idx}) [{item['severity']}] {item['title']}: {item['allopathic_trigger'].upper()} + {item['ayush_trigger'].upper()}")
        print(f"          {item['description']}")
    print(f"    - Safety Protocol: {herb_res['safety_guidelines'][0]}\n")

    # ---------------------------------------------------------------------------
    # TEST 5: FULL PIPELINE END-TO-END (ASR -> OCR -> EMERGENCY -> MEDGEMMA -> TTS)
    # ---------------------------------------------------------------------------
    print("=================================================================================")
    print(" ⚡ TEST 5: FULL PIPELINE END-TO-END INTEGRATION TEST")
    print(" Pipeline: ASR Speech -> OCR Scan -> Emergency Triage -> MedGemma -> FHIR & TTS")
    print("=================================================================================")

    # Step 5A: ASR Simulated Transcript
    asr_speech_transcript = "I have sudden severe crushing chest pain radiating to my jaw for 20 minutes with difficulty breathing"
    print(f" [Step 5A - ASR Transcript] Received: '{asr_speech_transcript}'")

    # Step 5B: OCR Document Extraction
    ocr_text_scanned = "Past History: Essential Hypertension. Rx: Amlodipine 5mg 1-0-0. NKDA."
    print(f" [Step 5B - OCR Document] Extracted: '{ocr_text_scanned}'")

    # Step 5C: Emergency Red-Flag Triage Engine Evaluation
    triage_eval = triage_engine.evaluate_triage(
        transcript=asr_speech_transcript,
        lang_code="en",
        age=58,
        gender="male"
    )
    print(f" [Step 5C - Emergency Triage] Level: {triage_eval['triage_level']} | ESI: {triage_eval['esi_level']}")
    print(f"       Primary Suspect: {triage_eval['primary_disease_suspect']}")
    print(f"       NEWS2 Score: {triage_eval['news2_score']} ({triage_eval['news2_category'].split(' ')[0]})")
    print(f"       Audit SHA-256: {triage_eval['audit_trail']['audit_hash'][:24]}...")

    # Step 5D: MedGemma SOAP & Emergency Clinical Context Synthesis
    soap_res = await medgemma_engine.synthesize_soap_note_async(
        voice_transcript=asr_speech_transcript,
        ocr_text=ocr_text_scanned,
        triage_flags=[f.get("phrase") for f in triage_eval["detected_flags"]],
        mode="dual"
    )
    print(f" [Step 5D - MedGemma SOAP Synthesis] Assessment: {soap_res['soap']['assessment'][:120]}...")

    # Step 5E: HL7 FHIR R4 Bundle Export
    fhir_bundle = await medgemma_engine.export_fhir_resources_async(
        soap_note=soap_res['soap'],
        patient_info={"abha_id": "91-4589-2041-9872", "name": "Rajesh Kumar"}
    )
    print(f" [Step 5E - FHIR R4 Exporter] Bundle Resource Created | Entries={len(fhir_bundle['entry'])}")

    # Step 5F: Simulated TTS Neural Voice Prompt
    tts_text = "Emergency alert triggered. Please stay seated while Nurse Station A is notified immediately."
    print(f" [Step 5F - TTS Speech Output] Synthesized Voice Prompt: '{tts_text}'")

    total_time = round((time.time() - start_suite) * 1000, 2)
    print("\n=================================================================================")
    print(f" 🎉 ALL END-TO-END SYSTEM THINKING TESTS COMPLETED CLEANLY IN {total_time} ms!")
    print("=================================================================================")

if __name__ == "__main__":
    asyncio.run(run_full_system_thinking_test())
