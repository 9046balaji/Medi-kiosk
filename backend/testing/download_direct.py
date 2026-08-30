import os
import sys
import time
from huggingface_hub import hf_hub_download, list_repo_files

REPO_ID = os.environ.get("TRANSLATION_MODEL", "ai4bharat/indictrans2-en-indic-dist-200M")
TOKEN = os.environ.get("HF_TOKEN", None)
LOCAL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "indictrans2-en-indic-dist-200M")

os.makedirs(LOCAL_DIR, exist_ok=True)

print("==========================================================================")
print(f" DOWNLOADING ALL MODEL FILES TO LOCAL FOLDER:")
print(f" {LOCAL_DIR}")
print("==========================================================================")

files = [
    "config.json",
    "configuration_indictrans.py",
    "dict.SRC.json",
    "dict.TGT.json",
    "generation_config.json",
    "model.SRC",
    "model.TGT",
    "model.safetensors",
    "modeling_indictrans.py",
    "special_tokens_map.json",
    "tokenization_indictrans.py",
    "tokenizer_config.json"
]

t0 = time.time()
for idx, filename in enumerate(files, 1):
    local_file_path = os.path.join(LOCAL_DIR, filename)
    if os.path.exists(local_file_path) and os.path.getsize(local_file_path) > 100:
        size_mb = os.path.getsize(local_file_path) / (1024 * 1024)
        print(f"[{idx}/{len(files)}] ALREADY DOWNLOADED: {filename} ({size_mb:.2f} MB)")
        continue

    print(f"[{idx}/{len(files)}] Downloading {filename} ...")
    try:
        hf_hub_download(
            repo_id=REPO_ID,
            filename=filename,
            token=TOKEN,
            local_dir=LOCAL_DIR
        )
        size_mb = os.path.getsize(local_file_path) / (1024 * 1024) if os.path.exists(local_file_path) else 0
        print(f"    [OK] Complete: {filename} ({size_mb:.2f} MB)")
    except Exception as e:
        print(f"    [!] Error downloading {filename}: {e}")

elapsed = time.time() - t0
print("==========================================================================")
print(f" ALL MODEL FILES SAVED LOCALLY IN {elapsed:.2f} SECONDS!")
print("==========================================================================")
