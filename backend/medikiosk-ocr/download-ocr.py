import os
import sys
from huggingface_hub import snapshot_download
from transformers import AutoProcessor, AutoModelForCausalLM

DEFAULT_MODEL_ID = "microsoft/Florence-2-base"
SAVE_DIR = "./models/florence-2-base"

hf_token = os.getenv("HF_TOKEN")
model_id = os.getenv("FLORENCE_MODEL_ID", DEFAULT_MODEL_ID)

def run_download(target_repo, token_val):
    print(f"\n[DOWNLOAD] Attempting download for '{target_repo}'...")
    token_param = token_val if (isinstance(token_val, str) and token_val.strip()) else None
    
    # Download model snapshot (weights, processor, configs)
    snapshot_download(
        repo_id=target_repo,
        local_dir=SAVE_DIR,
        token=token_param
    )


    print(f"[PRE-LOAD] Verifying model weights & processor from '{target_repo}'...")
    processor = AutoProcessor.from_pretrained(
        target_repo, 
        trust_remote_code=True, 
        token=token_param
    )
    model = AutoModelForCausalLM.from_pretrained(
        target_repo, 
        trust_remote_code=True, 
        token=token_param
    )

    print(f"\n[SUCCESS] Florence-2 download & verification complete! Saved to '{SAVE_DIR}'.")

try:
    run_download(model_id, hf_token)
except Exception as e:
    err_str = str(e)
    if "401" in err_str or "GatedRepoError" in str(type(e)) or "restricted" in err_str:
        print(f"\n[NOTICE] Access to '{model_id}' returned 401 (Token authorization issue).")
        print(f"[NOTICE] Attempting public fallback without token for '{DEFAULT_MODEL_ID}'...")
        try:
            run_download(DEFAULT_MODEL_ID, None)
        except Exception as fallback_err:
            print(f"\n[ERROR] Fallback download failed: {fallback_err}")
            sys.exit(1)
    else:
        print(f"\n[ERROR] Download failed: {e}")
        sys.exit(1)