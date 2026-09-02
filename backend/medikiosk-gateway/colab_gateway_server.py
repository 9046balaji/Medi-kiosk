"""
Google Colab Unified Gateway Server Deployment Script (MediKiosk)
Run this script inside Google Colab notebook cell to launch the unified Gateway server on port 8007 over Ngrok tunnel.

Usage in Google Colab Cell:
!pip install -q fastapi uvicorn pyngrok pydantic requests httpx
!python colab_gateway_server.py --ngrok-token <YOUR_NGROK_AUTHTOKEN>
"""

import sys
import os

def setup_and_run_gateway_server(ngrok_authtoken: str = None):
    print("🚀 Initializing MediKiosk Unified AI Microservice Gateway...")

    try:
        from pyngrok import ngrok
        if ngrok_authtoken:
            ngrok.set_auth_token(ngrok_authtoken)
            print("[Gateway Colab] Ngrok auth token configured successfully.")

        tunnel = ngrok.connect(8007)
        public_url = str(tunnel).split('"')[1] if '"' in str(tunnel) else str(tunnel)
    except Exception as e:
        print(f"[Warning] Ngrok auto-tunnel note: {e}")
        public_url = "http://localhost:8007"

    print("=" * 70)
    print("✅ MediKiosk AI Gateway Server operational!")
    print("=" * 70)
    print(f"🚀 Live Public Gateway Endpoint: {public_url}")
    print(f"🔗 Health Route: {public_url}/api/gateway/health")
    print(f"🔗 Smart Generate Route: {public_url}/api/gateway/generate")
    print("=" * 70)

    import uvicorn
    from main import app
    port = int(os.getenv("PORT", 8007))
    uvicorn.run(app, host="0.0.0.0", port=port)

if __name__ == "__main__":
    token = None
    if len(sys.argv) > 1:
        for i, arg in enumerate(sys.argv):
            if arg == "--ngrok-token" and i + 1 < len(sys.argv):
                token = sys.argv[i + 1]

    setup_and_run_gateway_server(token)
