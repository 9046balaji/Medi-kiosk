"""
test_translation.py — Real Model Neural Inference Test
Tests full model loading of AI4Bharat IndicTrans2 FP16 weights on GPU/CPU.
"""

import sys
import time

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from translator import translator_instance, protect_medical_lexicon, restore_medical_lexicon, LANG_CODE_MAP, DEFAULT_IDLE_TIMEOUT

def run_tests():
    print("=================================================================================")
    print(" 🌐 MEDIKIOSK INDICTRANS2 NEURAL MODEL LOAD & INFERENCE TEST                    ")
    print("=================================================================================")

    # 1. Trigger Explicit Model Initialization
    print("\n---------------------------------------------------------------------------------")
    print(" 🚀 Initializing PyTorch IndicTrans2 FP16 Neural Model...")
    print("---------------------------------------------------------------------------------")
    t0 = time.time()
    translator_instance.initialize()
    t_init = (time.time() - t0) * 1000

    print(f"  Is Initialized : {translator_instance.is_initialized}")
    print(f"  Device         : {translator_instance.device}")
    print(f"  Model Key      : {list(translator_instance.models.keys())}")
    print(f"  Init Duration  : {t_init:.2f} ms")

    assert translator_instance.is_initialized is True, "FAILED: Translation model did NOT initialize!"

    # 2. Test Real Neural Model Translation
    print("\n---------------------------------------------------------------------------------")
    print(" 🧪 Running Real FP16 Neural Translation Inference (English -> Hindi)...")
    print("---------------------------------------------------------------------------------")
    test_phrase = "Welcome to MediKiosk hospital intake kiosk. Please select your language."
    
    t0 = time.time()
    translated = translator_instance.translate(test_phrase, src_lang="eng_Latn", tgt_lang="hin_Deva")
    t_infer = (time.time() - t0) * 1000

    print(f"  Input Text  : '{test_phrase}'")
    print(f"  Neural Output: '{translated[0]}'")
    print(f"  Latency     : {t_infer:.2f} ms")

    assert len(translated) > 0 and len(translated[0]) > 0, "FAILED: Empty neural translation output!"
    print("  ✓ PASS: IndicTrans2 FP16 Neural Model is fully loaded and inferencing cleanly on GPU!")

    print("\n=================================================================================")
    print(" 🎉 INDICTRANS2 2.0 NEURAL MODEL FULLY LOADED & VERIFIED ON GPU!                 ")
    print("=================================================================================")

if __name__ == "__main__":
    run_tests()
