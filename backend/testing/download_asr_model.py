import os
import sys
import time
from huggingface_hub import snapshot_download

MODEL_ID = "ai4bharat/indic-conformer-600m-multilingual"
LOCAL_MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "models", "indic-conformer-600m-multilingual"))

def download_indic_conformer_model():
    print("==========================================================================")
    print(" AI4BHARAT INDICCONFORMER 600M MULTILINGUAL ASR DOWNLOADER             ")
    print("==========================================================================")
    print(f"Model ID   : {MODEL_ID}")
    print(f"Destination: {LOCAL_MODEL_DIR}")

    hf_token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")

    if not hf_token:
        print("\n[WARNING] HF_TOKEN environment variable is not set!")
        print(" 'ai4bharat/indic-conformer-600m-multilingual' is a gated repository on Hugging Face.")
        print(" Please accept terms at: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual")
        print(" And set your HF token: $env:HF_TOKEN=\"hf_your_token_here\"\n")

    os.makedirs(LOCAL_MODEL_DIR, exist_ok=True)

    t0 = time.time()
    try:
        download_path = snapshot_download(
            repo_id=MODEL_ID,
            local_dir=LOCAL_MODEL_DIR,
            token=hf_token,
            resume_download=True
        )
        elapsed = time.time() - t0
        print(f"\n[SUCCESS] Model downloaded successfully in {elapsed:.2f} seconds!")
        print(f" Saved at: {download_path}")
        return download_path
    except Exception as e:
        print(f"\n[ERROR] Error downloading model weights: {e}")
        if "401" in str(e) or "GatedRepoError" in str(e):
            print("\n[RESOLUTION INSTRUCTIONS]:")
            print(" 1. Visit: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual")
            print(" 2. Click 'Access repository' or accept terms.")
            print(" 3. Create a free read token at: https://huggingface.co/settings/tokens")
            print(" 4. Run in terminal: $env:HF_TOKEN=\"hf_...\" ; python backend/medikiosk-asr/download_model.py")
        sys.exit(1)

if __name__ == "__main__":
    download_indic_conformer_model()
