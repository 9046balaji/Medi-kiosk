import os
import sys
from huggingface_hub import snapshot_download
from huggingface_hub.utils import GatedRepoError
from transformers import AutoTokenizer
from parler_tts import ParlerTTSForConditionalGeneration

DEFAULT_MODEL_ID = "ai4bharat/indic-parler-tts"
UNGATED_MIRROR_ID = "naklitechie/indic-parler-tts"
SAVE_DIR = "./models/indic-parler-tts"

hf_token = os.getenv("HF_TOKEN")

model_id = os.getenv("TTS_MODEL_ID", DEFAULT_MODEL_ID)

def run_download(target_repo, token_val):
    print(f"\n[DOWNLOAD] Attempting download for '{target_repo}'...")
    token_param = token_val if (isinstance(token_val, str) and token_val.strip()) else True
    
    snapshot_download(
        repo_id=target_repo,
        local_dir=SAVE_DIR,
        token=token_param
    )

    print(f"[PRE-LOAD] Verifying model weights from '{target_repo}'...")
    tokenizer = AutoTokenizer.from_pretrained(target_repo, token=token_param)
    model = ParlerTTSForConditionalGeneration.from_pretrained(target_repo, token=token_param)

    desc_tokenizer_path = getattr(model.config.text_encoder, "_name_or_path", "google/flan-t5-large")
    description_tokenizer = AutoTokenizer.from_pretrained(desc_tokenizer_path)
    print(f"\n[SUCCESS] Model download & verification complete! Saved to '{SAVE_DIR}'.")

try:
    run_download(model_id, hf_token)
except Exception as e:
    err_str = str(e)
    if "401" in err_str or "GatedRepoError" in str(type(e)) or "restricted" in err_str:
        print(f"\n[NOTICE] Access to '{model_id}' returned 401 (Gated Repo / Token not authorized).")
        print(f"[NOTICE] Automatically falling back to ungated public mirror: '{UNGATED_MIRROR_ID}'...")
        try:
            run_download(UNGATED_MIRROR_ID, None)
        except Exception as mirror_err:
            print(f"\n[ERROR] Mirror download failed: {mirror_err}")
            sys.exit(1)
    else:
        print(f"\n[ERROR] Download failed: {e}")
        sys.exit(1)


