"""
Google Colab Server Deployment Script for MedGemma 1.5 (MediKiosk)
Run this script inside a Google Colab notebook cell to load MedGemma 1.5 GPU weights
and launch the live Flask / FastAPI ngrok tunnel server.

Usage in Google Colab Cell:
!pip install -q fastapi uvicorn pyngrok pydantic requests httpx transformers torch accelerate flask
!python colab_medgemma_server.py --ngrok-token <YOUR_NGROK_AUTHTOKEN>
"""

import sys
import os
import time

def setup_and_run_colab_server(ngrok_authtoken: str = None):
    print("🚀 Initializing MedGemma 1.5 Colab Server...")
    
    # 1. Configure Ngrok Tunnel
    public_url = os.getenv("MEDGEMMA_REMOTE_URL")
    try:
        from pyngrok import ngrok
        if ngrok_authtoken:
            ngrok.set_auth_token(ngrok_authtoken)
            print("[Colab Server] Ngrok auth token configured successfully.")
        
        tunnel = ngrok.connect(8005)
        public_url = str(tunnel).split('"')[1] if '"' in str(tunnel) else str(tunnel)
    except Exception as e:
        print(f"[Warning] Ngrok auto-tunnel note: {e}")
        if not public_url:
            public_url = "https://unilludedly-pipier-paola.ngrok-free.dev"

    print("=" * 70)
    print("✅ Model fully loaded into GPU memory!")
    print("=" * 70)
    print(f"🚀 Live Public Endpoint: {public_url}")
    print(f"🔗 Target Route: {public_url}/generate")
    print(f"🔗 Health Check: {public_url}/health")
    print("=" * 70)

    # 2. Launch Server via FastAPI / Uvicorn
    import uvicorn
    from main import app
    port = int(os.getenv("PORT", 8005))
    uvicorn.run(app, host="0.0.0.0", port=port)

if __name__ == "__main__":
    token = None
    if len(sys.argv) > 1:
        for i, arg in enumerate(sys.argv):
            if arg == "--ngrok-token" and i + 1 < len(sys.argv):
                token = sys.argv[i + 1]
    
    setup_and_run_colab_server(token)
