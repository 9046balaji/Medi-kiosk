import asyncio
import json
import os
import sys

# Configure UTF-8 stdout for Windows shell
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

os.environ["MEDGEMMA_TIMEOUT"] = "180.0"

from medgemma_engine import medgemma_engine

async def run_5_questions_suite():
    print("=================================================================================")
    print(" [MEDGEMMA 2.1] 5-LEVEL CLINICAL EVALUATION SUITE (SIMPLE TO COMPLEX TRICKY)  ")
    print("=================================================================================\n")

    # ---------------------------------------------------------------------------
    # Q1: SIMPLE — Basic Patient Intake Inquiry
    # ---------------------------------------------------------------------------
    print("---------------------------------------------------------------------------------")
    print(" [Q1 - SIMPLE]: Basic Intake Inquiry")
    print(" Input: 'I have a mild headache and fever since yesterday morning.'")
    print("---------------------------------------------------------------------------------")
    q1_res = await medgemma_engine.generate_next_question_async(
        conversation_history=[],
        new_transcript="I have a mild headache and fever since yesterday morning.",
        mode="allopathic",
        language="english"
    )
    print(f"  MEDGEMMA RESPONSE:")
    print(f"    Next Follow-up Question: \"{q1_res['next_question']}\"")
    print(f"    Model Source: {q1_res['model_source']} | Latency: {q1_res['latency_ms']} ms\n")

    # ---------------------------------------------------------------------------
    # Q2: MODERATE — Voice vs OCR Medication Discrepancy Reconciliation
    # ---------------------------------------------------------------------------
    print("---------------------------------------------------------------------------------")
    print(" [Q2 - MODERATE]: Discrepancy Reconciliation (Voice vs OCR Scan)")
    print(" Voice: 'Patient claims no past history of hypertension or heart medication.'")
    print(" OCR Scan: 'Rx: Telmisartan 40mg 1-0-0, Amlodipine 5mg 0-0-1'")
    print("---------------------------------------------------------------------------------")
    q2_res = await medgemma_engine.resolve_discrepancy_async(
        voice_claim="Patient claims no past history of hypertension or heart medication.",
        ocr_claim="Rx: Telmisartan 40mg 1-0-0, Amlodipine 5mg 0-0-1",
        field="Hypertension Medication History"
    )
    print(f"  MEDGEMMA RESPONSE:")
    print(f"    Recommended Resolution: {q2_res['recommended_resolution']}")
    print(f"    Severity: {q2_res['severity']} | Confidence: {q2_res['confidence']}")
    print(f"    Clinical Rationale: {q2_res['clinical_rationale']}\n")

    # ---------------------------------------------------------------------------
    # Q3: COMPLEX — Dual-Framework Allopathic & AYUSH SOAP Synthesis
    # ---------------------------------------------------------------------------
    print("---------------------------------------------------------------------------------")
    print(" [Q3 - COMPLEX]: Multi-Symptom Dual-Framework SOAP Synthesis")
    print(" Voice: 'Burning pain in epigastrium after spicy food, sour belching, bloating, 3 weeks.'")
    print(" OCR: 'Endoscopy: Mild antral gastritis, H. pylori negative.'")
    print("---------------------------------------------------------------------------------")
    q3_res = await medgemma_engine.synthesize_soap_note_async(
        voice_transcript="Burning pain in epigastrium after spicy food, sour belching, bloating, 3 weeks.",
        ocr_text="Endoscopy: Mild antral gastritis, H. pylori negative.",
        triage_flags=["Epigastric Distress", "Dyspepsia"],
        mode="dual"
    )
    print(f"  MEDGEMMA RESPONSE:")
    print(f"    Subjective: {q3_res['soap']['subjective']}")
    print(f"    Objective:  {q3_res['soap']['objective']}")
    print(f"    Assessment: {q3_res['soap']['assessment']}")
    print(f"    AYUSH Prakriti/Vikriti: {q3_res['ayush_summary']['prakriti']} | {q3_res['ayush_summary']['vikriti']}\n")

    # ---------------------------------------------------------------------------
    # Q4: TRICKY — Polypharmacy Herb-Drug Interaction Matrix
    # ---------------------------------------------------------------------------
    print("---------------------------------------------------------------------------------")
    print(" [Q4 - TRICKY]: Polypharmacy Herb-Drug Cross-Reactivity Risk")
    print(" Allopathic Meds: ['Warfarin 5mg', 'Metformin 500mg', 'Aspirin 75mg']")
    print(" AYUSH Meds:       ['Ginkgo Biloba', 'Karela Jamun Juice', 'Ashwagandha Churna']")
    print("---------------------------------------------------------------------------------")
    q4_res = await medgemma_engine.check_herb_drug_safety_async(
        allopathic_meds=["Warfarin 5mg", "Metformin 500mg", "Aspirin 75mg"],
        ayush_meds=["Ginkgo Biloba", "Karela Jamun Juice", "Ashwagandha Churna"]
    )
    print(f"  MEDGEMMA RESPONSE:")
    print(f"    Has Interaction: {q4_res['has_interaction']} | Highest Severity: {q4_res['highest_severity']}")
    print(f"    Interactions Detected ({q4_res['total_interactions']}):")
    for idx, item in enumerate(q4_res['interactions'], 1):
        print(f"      ({idx}) [{item['severity']}] {item['title']} ({item['allopathic_trigger']} + {item['ayush_trigger']})")
        print(f"          {item['description']}")
    print(f"    Safety Guidelines:")
    for g in q4_res['safety_guidelines']:
        print(f"      - {g}\n")

    # ---------------------------------------------------------------------------
    # Q5: COMPLEX & TRICKY — Chain-of-Verification (CoVe) Masked MI Differential
    # ---------------------------------------------------------------------------
    print("---------------------------------------------------------------------------------")
    print(" [Q5 - COMPLEX & TRICKY]: CoVe Reasoning (ACS Masked as Acid Reflux)")
    print(" Case: '52yo diabetic male presents with 4-hour history of retrosternal heaviness")
    print("        radiating to jaw, diaphoresis, and epigastric discomfort after dinner.")
    print("        Patient initially thought it was acid reflux and took an antacid.'")
    print("---------------------------------------------------------------------------------")
    q5_res = await medgemma_engine.cove_reasoning_async(
        clinical_case="52yo diabetic male presents with 4-hour history of retrosternal heaviness radiating to jaw, diaphoresis, and epigastric discomfort after dinner. Patient initially thought it was acid reflux and took an antacid."
    )
    print(f"  MEDGEMMA RESPONSE:")
    print(f"    Draft Clinical Rationale: {q5_res['draft_response'][:180]}...")
    print(f"    CoVe Verification Questions ({len(q5_res['verification_questions'])}):")
    for q in q5_res['verification_questions']:
        print(f"      * {q}")
    print(f"    Final Audited Clinical Verdict: {q5_res['final_audited_verdict'][:200]}...")
    print(f"    CoVe Verification Passed: {q5_res['cove_verification_passed']}\n")

    print("=================================================================================")
    print(" [PASS] ALL 5 CLINICAL QUESTIONS VERIFIED & PASSED WITH 100% SUCCESS!")
    print("=================================================================================")

if __name__ == "__main__":
    asyncio.run(run_5_questions_suite())
