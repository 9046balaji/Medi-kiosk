"""
test_stream.py — AyurParam WebSocket Streaming Test
"""

import sys
import asyncio
import json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from ayurparam_engine import ayurparam_engine

async def test_stream_local():
    print("=================================================================================")
    print(" 🌿 AYURPARAM WEBSOCKET STREAMING TEST                                            ")
    print("=================================================================================")
    res = await ayurparam_engine._query_remote_endpoint("Provide brief 1-line Ayurvedic health tip", max_tokens=60)
    print(f"  Stream Response: '{res.strip()}'")
    assert len(res) > 0
    print("  ✓ PASS: Streaming response verified!")

if __name__ == "__main__":
    asyncio.run(test_stream_local())
