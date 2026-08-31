import os
import io
import time
import requests
from PIL import Image

OCR_SERVICE_URL = "http://localhost:8003/api/scan-document"
HEALTH_URL = "http://localhost:8003/api/health"
OCR_DIR = os.path.dirname(__file__)

REAL_TEST_IMAGES = [
    "OIP.webp",
    "OIP (1).webp",
    "OIP (2).webp",
    "OIP (3).webp",
    "OIP (4).webp",
    "OIP (5).webp",
    "OIP (6).webp"
]

def run_test():
    print("==================================================================")
    print("   TESTING REAL PRESCRIPTION WEBP IMAGES WITH FLORENCE-2 OCR (PORT 8003)   ")
    print("==================================================================")

    # 1. Health check
    try:
        r = requests.get(HEALTH_URL, timeout=5)
        print(f"1. Health Check Status: {r.status_code} | Payload: {r.json()}")
    except Exception as e:
        print(f"[FAIL] Server not online at {HEALTH_URL}: {e}")
        return

    # 2. Iterate through all real test images
    print(f"\n2. Testing {len(REAL_TEST_IMAGES)} Real Prescription Images...")
    passed_count = 0

    for idx, img_filename in enumerate(REAL_TEST_IMAGES, 1):
        img_path = os.path.join(OCR_DIR, img_filename)
        if not os.path.exists(img_path):
            print(f"   [{idx}/{len(REAL_TEST_IMAGES)}] [SKIP] File not found: {img_filename}")
            continue

        try:
            with open(img_path, "rb") as f:
                img_bytes = f.read()

            start_t = time.time()
            files = {'file': (img_filename, img_bytes, 'image/webp')}
            data = {
                'doc_type': 'prescription',
                'voice_statement': 'Patient stated no medicine taken'
            }

            res = requests.post(OCR_SERVICE_URL, files=files, data=data, timeout=45)
            elapsed = round((time.time() - start_t) * 1000, 2)

            if res.status_code == 200:
                payload = res.json()
                passed_count += 1
                meds = payload.get("extracted_medications", [])
                labs = payload.get("extracted_lab_values", [])
                discrepancies = payload.get("discrepancies", [])
                raw_txt = payload.get("raw_text", "").replace("\n", " ")

                print(f"\n   [{idx}/{len(REAL_TEST_IMAGES)}] [PASS] Image: {img_filename} | Latency: {elapsed} ms")
                print(f"       Device        : {payload.get('device')}")
                print(f"       Raw OCR Text  : {raw_txt[:70]}...")
                print(f"       Extracted Meds: {len(meds)} items")
                for m in meds[:3]:
                    print(f"         - [{m['type'].upper()}] {m['name']} ({m['frequency']})")
                if labs:
                    print(f"       Extracted Labs: {len(labs)} items")
                    for l in labs[:2]:
                        print(f"         - {l['test_name']}: {l['value']} {l['unit']} [{l['flag'].upper()}]")
                if discrepancies:
                    print(f"       Discrepancies : {len(discrepancies)} detected")
            else:
                print(f"   [{idx}/{len(REAL_TEST_IMAGES)}] [FAIL] Image: {img_filename} | HTTP {res.status_code}")

        except Exception as e:
            print(f"   [{idx}/{len(REAL_TEST_IMAGES)}] [FAIL] Error processing {img_filename}: {e}")

    print("\n==================================================================")
    print(f" REAL OCR TEST RESULTS: {passed_count}/{len(REAL_TEST_IMAGES)} PASSED ({passed_count/len(REAL_TEST_IMAGES)*100:.0f}%)")
    print("==================================================================")

if __name__ == "__main__":
    run_test()
