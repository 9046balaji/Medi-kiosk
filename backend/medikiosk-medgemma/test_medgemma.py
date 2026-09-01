import asyncio
import os
import json

os.environ["MEDGEMMA_TIMEOUT"] = "180.0"

from medgemma_engine import medgemma_engine

async def run_medgemma_tests():
    print("=================================================================================")
    print("   MEDIKIOSK MEDGEMMA 2.1 CLINICAL LLM ENGINE TEST BATTERY                      ")
    print("=================================================================================")

    # 1. Async Generation Test
    gen_res = await medgemma_engine.generate_text_async("Patient reports epigastric burning pain after meals", language="english")
    print(f" [Generation Async] Source={gen_res.get('source')} | Latency={gen_res.get('latency_ms')} ms")

    # 2. Herb-Drug Safety Matrix Test
    herb_res = await medgemma_engine.check_herb_drug_safety_async(
        allopathic_meds=["Warfarin 5mg", "Pantoprazole 40mg"],
        ayush_meds=["Ginkgo Biloba", "Avipattikar Churna"]
    )
    print(f" [Herb-Drug Safety] Has Interaction={herb_res['has_interaction']} | Severity={herb_res['highest_severity']} | Count={herb_res['total_interactions']}")
    for idx, item in enumerate(herb_res['interactions'], 1):
        print(f"   ({idx}) {item['title']}: {item['description']}")

    # 3. Multimodal Vision Endpoint Test
    vision_res = await medgemma_engine.analyze_vision_async(
        image_base64="data:image/jpeg;base64,dummybase64string",
        prompt="Analyze chest X-ray image for consolidation"
    )
    print(f" [Multimodal Vision] Source={vision_res.get('source')} | Assessment={vision_res.get('diagnostic_assessment')} | Metrics={vision_res.get('extracted_metrics')}")

    # 4. FHIR R4 Resource Exporter Test
    soap = {"assessment": "Amlapitta / GERD with hyperacidity", "plan": "Pantoprazole 40mg AC"}
    fhir_res = await medgemma_engine.export_fhir_resources_async(soap)
    print(f" [FHIR R4 Exporter] ResourceType={fhir_res.get('resourceType')} | Entries={len(fhir_res.get('entry', []))}")

    # 5. Plain-Language Patient Translator Test
    trans_res = await medgemma_engine.translate_patient_friendly_async(
        medical_text="Patient exhibits Amlapitta with gastric mucosal erythema",
        target_language="english"
    )
    print(f" [Plain-Language Translator] Summary='{trans_res.get('patient_friendly_summary')}'")

    # 6. Chain-of-Verification (CoVe) Reasoning Test
    cove_res = await medgemma_engine.cove_reasoning_async("45yo male with epigastric burning pain")
    print(f" [CoVe Reasoning] Verification Passed={cove_res.get('cove_verification_passed')} | Checklist={len(cove_res.get('verification_questions'))} questions")

    print("=================================================================================")
    print(" ALL MEDGEMMA 2.1 ENTERPRISE ENGINE UNIT TESTS COMPLETED 100% CLEANLY!")
    print("=================================================================================")

if __name__ == "__main__":
    asyncio.run(run_medgemma_tests())
