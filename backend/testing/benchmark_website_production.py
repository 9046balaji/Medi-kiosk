import os
import sys
import time
import json
import torch
from typing import List, Dict
from bs4 import BeautifulSoup
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from IndicTransToolkit import IndicProcessor

sys.stdout.reconfigure(encoding='utf-8')

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "medikiosk-translation", "models", "indictrans2-en-indic-dist-200M"))
REPO_ID = "ai4bharat/indictrans2-en-indic-dist-200M"

print("==========================================================================")
print("     MEDIKIOSK PRODUCTION WEBSITE FULL TRANSLATION BENCHMARK SUITE       ")
print("==========================================================================")

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Hardware Accelerator: {device.upper()}")
if torch.cuda.is_available():
    print(f"GPU Model           : {torch.cuda.get_device_name(0)}")
    print(f"Initial VRAM        : {torch.cuda.memory_allocated(0)/(1024*1024):.2f} MB")

WEBSITE_UI_CORPUS = [
    "Welcome to MediKiosk",
    "Smart Patient Self-Registration & Queue Kiosk",
    "Ministry of Ayush",
    "National Health Authority",
    "Scan Prescription QR",
    "Walk-In Patient Registration",
    "Returning Patient Check-In",
    "Ayushman Bharat Digital Health ID (ABHA)",
    "Verify your ABHA Health ID for automatic medical history retrieval & paperless OPD.",
    "ABHA Number (14-Digit)",
    "Mobile OTP",
    "Face Authentication",
    "QR Code Scanner",
    "Enter 14-Digit ABHA Number",
    "NDHM Safe Authentication: Your health records will be linked securely. Aadhaar consent is authenticated via UIDAI tokenization.",
    "Don't have ABHA? Walk-In Registration",
    "Verify & Continue",
    "Patient Symptoms & Chief Complaint",
    "Please select or describe your current health symptoms for triage guidance.",
    "Select Chief Complaint",
    "Select Severity Level",
    "Select Duration of Symptoms",
    "Select Primary Consultation Wing",
    "Ayurveda Department",
    "Yoga & Naturopathy",
    "Unani Medicine",
    "Siddha Medicine",
    "Homeopathy",
    "General OPD / Triage",
    "Additional Symptom Notes",
    "Describe your symptoms in detail...",
    "Proceed to Receipt & Token",
    "Registration Receipt & OPD Token",
    "Ayush MediKiosk Token Generated",
    "Token Number",
    "Department Wing",
    "Patient Name",
    "Queue Status",
    "Estimated Wait Time",
    "Print Receipt",
    "Finish & Return to Home"
]

SAMPLE_HTML_PAGE = """
<!DOCTYPE html>
<html>
<head><title>MediKiosk OPD Portal</title></head>
<body>
    <header>
        <h1>Welcome to MediKiosk Smart OPD</h1>
        <p>Ministry of Ayush • National Health Authority ABDM Node</p>
    </header>
    <main>
        <section class="card">
            <h2>ABHA Health ID Authentication</h2>
            <p>Verify your 14-digit ABHA Number for instant medical history synchronization.</p>
            <button>Verify &amp; Continue</button>
        </section>
        <section class="card">
            <h2>Patient Symptom Intake</h2>
            <p>Speak naturally in your native language for AI-driven clinical intake.</p>
            <button>Tap to Record Voice</button>
        </section>
    </main>
</body>
</html>
"""

print(f"\n[1/4] Loaded Entire MediKiosk Website Corpus: {len(WEBSITE_UI_CORPUS)} UI Strings + Sample HTML DOM Page.")

# 2. Initialize Models
print("\n[2/4] Initializing IndicProcessor & Tokenizer...")
ip = IndicProcessor(inference=True)
tokenizer = AutoTokenizer.from_pretrained(REPO_ID, trust_remote_code=True)
print("[OK] Preprocessor & Tokenizer Ready!")

print("\n[3/4] Loading PyTorch Model Weights from Local Path...")
print(f" Path: {MODEL_DIR}")
t_load_0 = time.time()
model_dtype = torch.float16 if device == "cuda" else torch.float32
model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_DIR,
    trust_remote_code=True,
    torch_dtype=model_dtype
).to(device)
model.eval()
t_load = (time.time() - t_load_0) * 1000
print(f"[OK] Model Loaded in {t_load:.2f} ms ({device.upper()} - {model_dtype})!")

# 3. HTML DOM Translation Benchmark Helper
def translate_html_dom(html_content: str, src_lang: str, tgt_lang: str) -> str:
    soup = BeautifulSoup(html_content, "html.parser")
    tags_to_ignore = ["script", "style", "code", "pre", "noscript"]
    text_nodes = []
    raw_texts = []

    for element in soup.find_all(text=True):
        if element.parent and element.parent.name in tags_to_ignore:
            continue
        cleaned = element.strip()
        if cleaned and not cleaned.isnumeric():
            text_nodes.append(element)
            raw_texts.append(cleaned)

    if not raw_texts:
        return str(soup)

    batch_preprocessed = ip.preprocess_batch(raw_texts, src_lang=src_lang, tgt_lang=tgt_lang)
    inputs = tokenizer(batch_preprocessed, return_tensors="pt", padding=True).to(device)

    with torch.inference_mode():
        outputs = model.generate(**inputs, num_beams=1, max_length=256)

    raw_decodes = tokenizer.batch_decode(outputs, skip_special_tokens=True)
    translated_texts = ip.postprocess_batch(raw_decodes, lang=tgt_lang)

    for node, trans in zip(text_nodes, translated_texts):
        node.replace_with(trans)

    return str(soup)

# 4. Benchmark Execution Across Target Languages
TARGET_LANGUAGES = [
    ("Hindi", "hin_Deva"),
    ("Tamil", "tam_Taml"),
    ("Telugu", "tel_Telu"),
    ("Bengali", "ben_Beng"),
    ("Marathi", "mar_Deva"),
    ("Gujarati", "guj_Gujr"),
    ("Kannada", "kan_Knda"),
    ("Malayalam", "mal_Mlym")
]

print("\n[4/4] Benchmarking UI Corpus Batches & HTML Webpage DOM Translation...")
print("==========================================================================")

for lang_name, lang_code in TARGET_LANGUAGES:
    # Text Corpus Batch Test
    t0 = time.time()
    batch_pre = ip.preprocess_batch(WEBSITE_UI_CORPUS, src_lang="eng_Latn", tgt_lang=lang_code)
    inputs = tokenizer(batch_pre, return_tensors="pt", padding=True).to(device)
    with torch.inference_mode():
        outputs = model.generate(**inputs, num_beams=1, max_length=256)
    raw_dec = tokenizer.batch_decode(outputs, skip_special_tokens=True)
    results = ip.postprocess_batch(raw_dec, lang=lang_code)
    t_corpus = (time.time() - t0) * 1000

    # HTML DOM Translation Test
    t1 = time.time()
    translated_html = translate_html_dom(SAMPLE_HTML_PAGE, "eng_Latn", lang_code)
    t_html = (time.time() - t1) * 1000

    has_layout = "<header>" in translated_html and "<main>" in translated_html
    print(f"Language: {lang_name:<10} ({lang_code}) | Corpus (41 items): {t_corpus:6.2f} ms | HTML DOM Page: {t_html:6.2f} ms | DOM Intact: {has_layout}")

print("==========================================================================")
print("✅ PRODUCTION WEBSITE TRANSLATION & DOM BENCHMARK COMPLETE!")
print("==========================================================================")
