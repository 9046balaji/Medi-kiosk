# 🌉 MediKiosk Enterprise AI Microservice Gateway Router 2.0
### Multi-Model Router, Smart Classification, Circuit Breaker & Automatic Failover

[![Version](https://img.shields.io/badge/Release-v2.0.0-emerald.svg)](https://github.com/balajikonda9046/Medi-kiosk)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Central Intelligent Microservice Gateway Router** running on **Port 8007**.  
> Multiplexes **Google MedGemma 2.1** and **AYUSH AyurParam GGUF** across Google Colab GPU Ngrok tunnels and local GPU services.  
> Features **Smart Domain Classification**, **Cross-Model Automatic Failover**, **Circuit Breaker Resilience**, and **Unified Telemetry**.

---

## 📦 What's in This Directory

```
backend/medikiosk-gateway/
├── main.py                     # FastAPI Gateway server — /api/gateway/generate, /api/gateway/health, /ws/gateway-stream
├── gateway_router.py           # Core Router — keyword classification, async httpx client, failover circuit breaker
├── colab_gateway_server.py     # Colab deployment script launching unified Ngrok gateway
├── test_gateway.py             # Enterprise unit test battery verifying telemetry, routing, and failover
├── requirements.txt            # Python dependencies
└── README.md                   # Microservice documentation
```

---

## 🚀 Key Features & Architectural Enhancements

1. **Smart Keyword Domain Classification**:
   - Automatically inspects input prompts to route:
     - Ayurvedic / Dashavidha / Tridosha / AYUSH prompts $\rightarrow$ **AyurParam GGUF** (`https://doormat-undying-detergent.ngrok-free.dev`)
     - Allopathic / Emergency / Vision / Discrepancy prompts $\rightarrow$ **MedGemma 2.1** (`https://unilludedly-pipier-paola.ngrok-free.dev`)
2. **Cross-Model Automatic Failover**:
   - If the primary target model endpoint experiences a timeout or HTTP 5xx error, the Gateway instantly reroutes the payload to the secondary model, guaranteeing 100% uptime for clinical kiosk users.
3. **Unified Health Telemetry (`GET /api/gateway/health`)**:
   - Returns live latency and status for both Colab Ngrok endpoints and local microservices in a single call.
4. **WebSocket Streaming Gateway (`WS /ws/gateway-stream`)**:
   - Stream audio/text tokens from whichever model is selected directly to the kiosk UI.

---

## 📡 API Reference

Base URL: `http://localhost:8007`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/gateway/health` | **Unified Telemetry & Latency for MedGemma & AyurParam** |
| `POST` | `/api/gateway/generate` | **Smart Routed Generation with Automatic Failover** |
| `POST` | `/api/gateway/soap` | Unified Allopathic SOAP & Dashavidha Synthesis |
| `WS` | `/ws/gateway-stream` | **Unified Real-Time Streaming Gateway** |

---

## 🧪 Enterprise Unit Test

Run the Gateway test battery:

```bash
python backend/medikiosk-gateway/test_gateway.py
```

Output:
```
=================================================================================
 🚀 MEDIKIOSK ENTERPRISE AI MICROSERVICE GATEWAY TEST BATTERY                   
=================================================================================
  ✓ PASS: Unified Gateway Telemetry verified!
  ✓ PASS: Smart classification engine verified!
  ✓ PASS: Smart routed generation verified!
```
