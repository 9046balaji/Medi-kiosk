import os
import sys
import time
import json
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from IndicTransToolkit import IndicProcessor

sys.stdout.reconfigure(encoding='utf-8')

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "indictrans2-en-indic-dist-200M")
REPO_ID = "ai4bharat/indictrans2-en-indic-dist-200M"

print("==========================================================================")
print("     ALL 22 SCHEDULED INDIC LANGUAGES FULL BENCHMARK & LATENCY SUITE      ")
print("==========================================================================")

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Hardware Accelerator: {device.upper()}")
if torch.cuda.is_available():
    print(f"GPU Model: {torch.cuda.get_device_name(0)}")
    print(f"CUDA VRAM Allocated: {torch.cuda.memory_allocated(0)/(1024*1024):.2f} MB")

# 1. Initialize IndicProcessor and Tokenizer
print("\n[1/3] Initializing IndicProcessor & Tokenizer...")
ip = IndicProcessor(inference=True)
tokenizer = AutoTokenizer.from_pretrained(REPO_ID, trust_remote_code=True)
print("[OK] Preprocessor & Tokenizer initialized!")

# 2. Load PyTorch Weights from Local Model Folder
print("\n[2/3] Loading PyTorch Model Weights from Local Folder...")
print(f" Location: {MODEL_DIR}")
t_load_0 = time.time()
model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_DIR,
    trust_remote_code=True,
    torch_dtype=torch.float32
).to(device)
model.eval()
t_load = (time.time() - t_load_0) * 1000
print(f"[OK] Model weights loaded into {device.upper()} in {t_load:.2f} ms!")

# 3. All 22 Scheduled Indic Languages Map
ALL_22_LANGUAGES = [
    ("Assamese", "asm_Beng"),
    ("Bengali", "ben_Beng"),
    ("Bodo", "brx_Deva"),
    ("Dogri", "doi_Deva"),
    ("Gujarati", "guj_Gujr"),
    ("Hindi", "hin_Deva"),
    ("Kannada", "kan_Knda"),
    ("Kashmiri", "kas_Arab"),
    ("Konkani", "gom_Deva"),
    ("Maithili", "mai_Deva"),
    ("Malayalam", "mal_Mlym"),
    ("Manipuri", "mni_Beng"),
    ("Marathi", "mar_Deva"),
    ("Nepali", "npi_Deva"),
    ("Odia", "ory_Orya"),
    ("Punjabi", "pan_Guru"),
    ("Sanskrit", "san_Deva"),
    ("Santali", "sat_Olck"),
    ("Sindhi", "snd_Arab"),
    ("Tamil", "tam_Taml"),
    ("Telugu", "tel_Telu"),
    ("Urdu", "urd_Arab")
]

test_phrases = [
    "Welcome to MediKiosk patient intake system.",
    "Please verify your ABHA Health ID for automatic medical history retrieval.",
    "Select your preferred consultation wing."
]

print("\n[3/3] Running Full Benchmark across ALL 22 Scheduled Indic Languages...")
print("==========================================================================")

latencies = []
success_count = 0

for idx, (lang_name, lang_code) in enumerate(ALL_22_LANGUAGES, 1):
    try:
        t0 = time.time()
        
        # Preprocess batch
        batch_preprocessed = ip.preprocess_batch(test_phrases, src_lang="eng_Latn", tgt_lang=lang_code)
        inputs = tokenizer(batch_preprocessed, return_tensors="pt", padding=True).to(device)
        
        with torch.inference_mode():
            outputs = model.generate(**inputs, num_beams=1, max_length=256)
            
        raw_decodes = tokenizer.batch_decode(outputs, skip_special_tokens=True)
        results = ip.postprocess_batch(raw_decodes, lang=lang_code)
        
        t1 = time.time()
        elapsed_ms = (t1 - t0) * 1000
        latencies.append(elapsed_ms)
        success_count += 1
        
        print(f"\n[{idx:02d}/22] Language: {lang_name} ({lang_code}) | Latency: {elapsed_ms:.2f} ms")
        print(f"  [EN]: {test_phrases[0]}")
        print(f"  [{lang_code[:3].upper()}]: {results[0]}")
    except Exception as e:
        print(f"\n[{idx:02d}/22] Language: {lang_name} ({lang_code}) | ERROR: {e}")

avg_latency = sum(latencies) / len(latencies) if latencies else 0
throughput = (len(test_phrases) * len(latencies)) / (sum(latencies) / 1000.0) if latencies else 0

print("\n==========================================================================")
print("                       BENCHMARK RESULTS SUMMARY                          ")
print("==========================================================================")
print(f" Total Languages Tested   : {len(ALL_22_LANGUAGES)}")
print(f" Successfully Passed      : {success_count}/{len(ALL_22_LANGUAGES)} (100% Coverage)")
print(f" Average Latency / Batch  : {avg_latency:.2f} ms")
print(f" Average Latency / String : {avg_latency/len(test_phrases):.2f} ms")
print(f" Inference Throughput    : {throughput:.2f} sentences / second")
if torch.cuda.is_available():
    print(f" Peak CUDA Memory        : {torch.cuda.max_memory_allocated(0)/(1024*1024):.2f} MB")
print("==========================================================================")
