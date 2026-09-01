import asyncio
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

os.environ["MEDGEMMA_TIMEOUT"] = "180.0"

from medgemma_engine import medgemma_engine

async def test_streaming():
    print("=================================================================================")
    print(" ⚡ TESTING MEDGEMMA 1.5 INSTANT STREAMING RESPONSE                              ")
    print("=================================================================================")
    print(" Requesting: 'Explain how Pantoprazole works for acid reflux in simple terms'\n")

    print(" 📡 Live Stream Tokens Received: ", end="", flush=True)

    chunk_count = 0
    async for chunk in medgemma_engine.generate_text_stream_async("Explain how Pantoprazole works for acid reflux in simple terms"):
        chunk_count += 1
        print(chunk, end="", flush=True)

    print(f"\n\n ✅ Stream finished cleanly! ({chunk_count} token chunks received)")
    print("=================================================================================")

if __name__ == "__main__":
    asyncio.run(test_streaming())
