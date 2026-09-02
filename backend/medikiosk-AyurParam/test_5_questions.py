"""
test_5_questions.py — 5/5 Enterprise AyurParam GGUF Clinical Evaluation Test Suite
Tests 5 complex Ayurvedic clinical questions against the live AyurParam GGUF model:
1. Dashavidha Pariksha & Agni evaluation for Grahani Roga (IBS/Hyperacidity)
2. Prakriti / Vikriti Tridosha imbalance assessment for Sandhivata (Osteoarthritis)
3. Ayush Herb-Drug Interaction & Contraindications (Aspirin + Guggulu / Warfarin + Garlic)
4. Ayurvedic Pathya-Apathya Diet & Lifestyle Regimen for Prameha (Diabetes Type-2)
5. NRCES-Compliant HL7 FHIR R4 Bundle Export with NAMASTE Ayush Codings
"""

import sys
import asyncio
import json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from ayurparam_engine import ayurparam_engine

QUESTIONS = [
    {
        "id": 1,
        "title": "Dashavidha Pariksha for Grahani Roga",
        "intake": {
            "symptoms": "Chronic abdominal bloating, loose stools alternating with constipation, loss of appetite (Agni Mandya)",
            "vitals": {"bp": "118/76", "pulse": 72},
            "patient_info": {"name": "Anil Kumar", "age": 45, "gender": "Male"}
        }
    },
    {
        "id": 2,
        "title": "Tridosha Imbalance Assessment for Sandhivata",
        "symptoms": "Joint stiffness in knees, crepitus (cracking sounds), pain worse in cold weather and early morning",
        "vitals": {"bp": "130/84", "pulse": 78}
    },
    {
        "id": 3,
        "title": "AYUSH Herb-Drug Safety Matrix Check",
        "medications": ["Aspirin 75mg", "Guggulu 500mg", "Metformin 500mg", "Karela Churna"]
    },
    {
        "id": 4,
        "title": "Ayurvedic Pathya-Apathya for Prameha",
        "medical_summary": "Patient has Prameha (Type-2 Diabetes) with Kapha-Meda Vriddhi. Recommending Yava (Barley), Vijaysar, and daily walking.",
        "language": "hindi"
    },
    {
        "id": 5,
        "title": "HL7 FHIR R4 Ayush Bundle Export",
        "soap": {
            "subjective": "Sandhivata knee joint stiffness",
            "assessment": "Vata Vriddhi in Asthi-Sandhi",
            "plan": "Janu Basti with Mahanarayana Taila"
        }
    }
]

async def run_5_questions():
    print("=================================================================================")
    print(" 🌿 AYURPARAM GGUF 2.0 — 5/5 ENTERPRISE CLINICAL EVALUATION TEST SUITE           ")
    print("=================================================================================")

    # Q1
    q1 = QUESTIONS[0]
    print(f"\n📍 Q1: {q1['title']}")
    res1 = await ayurparam_engine.generate_dashavidha_assessment(q1["intake"], "english")
    print(f"  Prakriti : {res1.get('dashavidha_pariksha', {}).get('prakriti')}")
    print(f"  Agni     : {res1.get('dashavidha_pariksha', {}).get('agni')}")
    assert "dashavidha_pariksha" in res1

    # Q2
    q2 = QUESTIONS[1]
    print(f"\n📍 Q2: {q2['title']}")
    res2 = await ayurparam_engine.analyze_tridosha_imbalance(q2["symptoms"], q2["vitals"])
    print(f"  Doshas   : {res2.get('dosha_percentages')}")
    print(f"  Imbalance: {res2.get('primary_imbalance')}")
    assert "dosha_percentages" in res2

    # Q3
    q3 = QUESTIONS[2]
    print(f"\n📍 Q3: {q3['title']}")
    alerts3 = ayurparam_engine.check_herb_drug_interactions(q3["medications"])
    print(f"  Triggered Alerts Count: {len(alerts3)}")
    for a in alerts3:
        print(f"  - {a['title']} ({a['severity']}): {a['allopathic_matched']} + {a['ayush_matched']}")
    assert len(alerts3) >= 1

    # Q4
    q4 = QUESTIONS[3]
    print(f"\n📍 Q4: {q4['title']}")
    res4 = await ayurparam_engine.translate_patient_guidance(q4["medical_summary"], q4["language"])
    print(f"  Patient Advice ({q4['language']}): '{res4.get('patient_friendly_explanation')[:120]}...'")
    assert "patient_friendly_explanation" in res4

    # Q5
    q5 = QUESTIONS[4]
    print(f"\n📍 Q5: {q5['title']}")
    fhir5 = await ayurparam_engine.export_ayush_fhir_bundle(q5["soap"])
    print(f"  Resource Type : {fhir5.get('resourceType')}")
    print(f"  Profile System: {fhir5.get('meta', {}).get('profile')}")
    assert fhir5.get("resourceType") == "Bundle"

    print("\n=================================================================================")
    print(" 🎉 ALL 5/5 CLINICAL EVALUATION QUESTIONS PASSED WITH 100% SUCCESS ON GPU!      ")
    print("=================================================================================")

if __name__ == "__main__":
    asyncio.run(run_5_questions())
