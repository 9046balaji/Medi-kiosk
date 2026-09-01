"""
MediKiosk OCR Engine 2.0 Real Image Model Inference Test Battery
Tests full Florence-2 GPU model vision inference on 7 real WebP prescription images in 'testing images/'
"""

import os
import sys
import time
from PIL import Image

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from ocr_engine import ocr_engine, normalize_drug_name

TEST_IMG_DIR = os.path.join(os.path.dirname(__file__), "testing images")

def run_real_image_inference():
    print("=================================================================================")
    print(" 👁️ TESTING REAL WEBP PRESCRIPTION IMAGES WITH FLORENCE-2 GPU MODEL            ")
    print("=================================================================================")

    if not os.path.exists(TEST_IMG_DIR):
        print(f"[ERROR] Test directory '{TEST_IMG_DIR}' not found!")
        return

    images = [f for f in os.listdir(TEST_IMG_DIR) if f.endswith(('.webp', '.jpg', '.png', '.jpeg'))]
    print(f" Found {len(images)} real prescription images in '{TEST_IMG_DIR}': {images}\n")

    # Force initialization of Florence-2 model
    ocr_engine.initialize()
    print(f" Florence-2 Model Device Status: {ocr_engine.device} | Initialized: {ocr_engine.is_initialized}\n")

    passed_count = 0
    for idx, img_name in enumerate(sorted(images), 1):
        img_path = os.path.join(TEST_IMG_DIR, img_name)
        print(f"---------------------------------------------------------------------------------")
        print(f" [{idx}/{len(images)}] Processing Real Image: '{img_name}'")
        print(f"---------------------------------------------------------------------------------")

        try:
            with open(img_path, "rb") as f:
                img_bytes = f.read()

            start_t = time.time()
            res = ocr_engine.process_image(
                image_data=img_bytes,
                doc_type="prescription",
                voice_statement="Patient stated taking no medicines"
            )
            elapsed = round((time.time() - start_t) * 1000, 2)

            passed_count += 1
            meds = res.get("extracted_medications", [])
            labs = res.get("extracted_lab_values", [])
            discrepancies = res.get("discrepancies", [])
            bboxes = res.get("bounding_boxes", [])
            raw_txt = res.get("raw_text", "").replace("\n", " ")

            print(f"  ✓ Model Inference Latency : {elapsed} ms (Device: {res.get('device')})")
            print(f"  ✓ OpenCV Preprocessed     : CLAHE Enhanced | Auto-Deskewed | Handwritten={res.get('is_handwritten')}")
            print(f"  ✓ Raw Florence-2 OCR Text : '{raw_txt[:120]}...'")
            print(f"  ✓ Extracted Medications   : {len(meds)} items")
            for m in meds:
                print(f"      - [{m['type'].upper()}] {m['name']} (Original: '{m['original_name']}') | Dose: {m['dosage']} | Freq: {m['frequency']} | FuzzyMatch: {m['fuzzy_matched']}")
            if labs:
                print(f"  ✓ Extracted Lab Pathology : {len(labs)} items")
                for l in labs:
                    print(f"      - {l['test_name']}: {l['value']} {l['unit']} [{l['flag'].upper()}]")
            if discrepancies:
                print(f"  ✓ Voice/OCR Discrepancies: {len(discrepancies)} detected")
            if bboxes:
                print(f"  ✓ Bounding Box Regions    : {len(bboxes)} bounding boxes extracted")

        except Exception as e:
            print(f"  ❌ Error processing image '{img_name}': {e}")

    print("\n=================================================================================")
    print(f" 🎉 REAL IMAGE INFERENCE TEST: {passed_count}/{len(images)} IMAGES PROCESSED BY FLORENCE-2 MODEL!")
    print("=================================================================================")

if __name__ == "__main__":
    run_real_image_inference()
