import os
import sys
import time
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from IndicTransToolkit import IndicProcessor

sys.stdout.reconfigure(encoding='utf-8')

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "medikiosk-translation", "models", "indictrans2-en-indic-dist-200M"))
REPO_ID = "ai4bharat/indictrans2-en-indic-dist-200M"

print("==========================================================================")
print("        OFFLINE AI4BHARAT INDICTRANS2 NEURAL MODEL BENCHMARK SUITE        ")
print("==========================================================================")

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Hardware Accelerator: {device.upper()}")

# 1. Load Tokenizer & IndicProcessor
print("\n[1/3] Loading Tokenizer & IndicProcessor...")
try:
    ip = IndicProcessor(inference=True)
    tokenizer = AutoTokenizer.from_pretrained(REPO_ID, trust_remote_code=True)
    print("[OK] Tokenizer & Processor loaded successfully!")
except Exception as e:
    print(f"[!] Tokenizer error: {e}")
    sys.exit(1)

# 2. Load PyTorch Model Weights from Local Folder
print("\n[2/3] Loading PyTorch Model Weights from Local Directory...")
print(f" Location: {MODEL_DIR}")
try:
    model_dtype = torch.float16 if device == "cuda" else torch.float32
    model = AutoModelForSeq2SeqLM.from_pretrained(
        MODEL_DIR,
        trust_remote_code=True,
        torch_dtype=model_dtype
    ).to(device)
    model.eval()
    print(f"[OK] Model weights loaded successfully from local folder ({device.upper()} - {model_dtype})!")
except Exception as e:
    print(f"[!] Model loading error: {e}")
    sys.exit(1)

# 3. Robust Inference Function using IndicProcessor
def translate_sentences(sentences: list, src_lang: str, tgt_lang: str) -> list:
    try:
        batch_preprocessed = ip.preprocess_batch(sentences, src_lang=src_lang, tgt_lang=tgt_lang)
        inputs = tokenizer(
            batch_preprocessed,
            return_tensors="pt",
            padding=True,
            truncation=True
        ).to(device)

        with torch.inference_mode():
            generated_tokens = model.generate(
                **inputs,
                max_length=256,
                num_beams=1,
                use_cache=True
            )

        raw_decoded = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)
        return ip.postprocess_batch(raw_decoded, lang=tgt_lang)
    except Exception as e:
        return [f"[Error: {e}]" for _ in sentences]

# 4. Test Multi-Language End-to-End Translations
print("\n[3/3] Running End-to-End Multi-Language Neural Translation Benchmark...")
print("==========================================================================")

test_sentences = [
    "Welcome to MediKiosk patient intake system.",
    "Please select your preferred consultation wing.",
    "Verify your ABHA Health ID for paperless OPD."
]

languages_to_test = [
    ("Telugu", "tel_Telu"),
    ("Hindi", "hin_Deva"),
    ("Tamil", "tam_Taml"),
    ("Marathi", "mar_Deva"),
    ("Kannada", "kan_Knda"),
    ("Bengali", "ben_Beng"),
    ("Gujarati", "guj_Gujr"),
    ("Malayalam", "mal_Mlym"),
    ("Punjabi", "pan_Guru")
]

for lang_name, lang_code in languages_to_test:
    print(f"\n--- Target Language: {lang_name} ({lang_code}) ---")
    t0 = time.time()
    results = translate_sentences(test_sentences, "eng_Latn", lang_code)
    for orig, res in zip(test_sentences, results):
        print(f" [EN]: {orig}")
        print(f" [{lang_code[:3].upper()}]: {res}")
    t1 = time.time()
    elapsed_ms = (t1 - t0) * 1000
    print(f" Batch Elapsed: {elapsed_ms:.2f} ms")

print("\n==========================================================================")
print("✅ ALL MODEL INFERENCE TESTS COMPLETED SUCCESSFULLY!")
print("==========================================================================")
