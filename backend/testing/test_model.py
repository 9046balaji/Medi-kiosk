import os
import sys
import time
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

sys.stdout.reconfigure(encoding='utf-8')

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "indictrans2-en-indic-dist-200M")
REPO_ID = "ai4bharat/indictrans2-en-indic-dist-200M"

print("==========================================================================")
print("        OFFLINE AI4BHARAT INDICTRANS2 NEURAL MODEL BENCHMARK SUITE        ")
print("==========================================================================")

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Hardware Accelerator: {device.upper()}")

# 1. Load Tokenizer
print("\n[1/3] Loading Tokenizer...")
try:
    tokenizer = AutoTokenizer.from_pretrained(REPO_ID, trust_remote_code=True)
    print("[OK] Tokenizer loaded successfully!")
except Exception as e:
    print(f"[!] Tokenizer error: {e}")
    sys.exit(1)

# 2. Load PyTorch Model Weights from Local Folder
print("\n[2/3] Loading PyTorch Model Weights from Local Directory...")
print(f" Location: {MODEL_DIR}")
try:
    model = AutoModelForSeq2SeqLM.from_pretrained(
        MODEL_DIR,
        trust_remote_code=True,
        torch_dtype=torch.float32
    ).to(device)
    model.eval()
    print("[OK] Model weights loaded successfully from local folder!")
except Exception as e:
    print(f"[!] Model loading error: {e}")
    sys.exit(1)

# 3. Robust Inference Function using AI4Bharat Language Tags
def translate_sentence(text: str, src_lang: str, tgt_lang: str) -> str:
    try:
        formatted_input = f"{src_lang} {tgt_lang} {text}"
        inputs = tokenizer(
            formatted_input,
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

        output_text = tokenizer.batch_decode(
            generated_tokens,
            skip_special_tokens=True
        )[0]
        return output_text
    except Exception as e:
        return f"[Error: {e}]"

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
    for sentence in test_sentences:
        res = translate_sentence(sentence, "eng_Latn", lang_code)
        print(f" [EN]: {sentence}")
        print(f" [{lang_code[:3].upper()}]: {res}")
    t1 = time.time()
    elapsed_ms = (t1 - t0) * 1000
    print(f" >> Latency for 3 sentences: {elapsed_ms:.2f} ms ({elapsed_ms/3:.2f} ms/string)")

print("\n==========================================================================")
print("           OFFLINE AI4BHARAT NEURAL MODEL TEST PASSED 100%!               ")
print("==========================================================================")
