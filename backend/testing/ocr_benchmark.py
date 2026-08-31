import os
import time
import requests
import numpy as np

# Microservice Endpoints
URL_OCR = "http://localhost:8003"
HEALTH_URL = f"{URL_OCR}/api/health"
SCAN_URL = f"{URL_OCR}/api/scan-document"
UNLOAD_URL = f"{URL_OCR}/api/unload"

# 7 Real Prescription Test Images
OCR_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "medikiosk-ocr"))
REAL_OCR_IMAGES = [
    "OIP.webp",
    "OIP (1).webp",
    "OIP (2).webp",
    "OIP (3).webp",
    "OIP (4).webp",
    "OIP (5).webp",
    "OIP (6).webp"
]

def get_vram_info():
    """Reads current GPU VRAM utilization from PyTorch / NVML."""
    try:
        import torch
        if torch.cuda.is_available():
            free_b, total_b = torch.cuda.mem_get_info()
            used_mb = int((total_b - free_b) / (1024 * 1024))
            total_mb = int(total_b / (1024 * 1024))
            free_mb = int(free_b / (1024 * 1024))
            return f"{used_mb} MB Used / {total_mb} MB Total ({free_mb} MB Free)"
    except Exception:
        pass
    return "GPU Info Unavailable"

def p95(latencies):
    if not latencies:
        return 0.0
    return float(np.percentile(latencies, 95))

def run_ocr_benchmark():
    print("================================================================================")
    print("       MEDIKIOSK FLORENCE-2 VISION OCR DEDICATED BENCHMARK SUITE             ")
    print("================================================================================")
    print(f" Timestamp  : {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f" Initial GPU VRAM: {get_vram_info()}")
    print("================================================================================")

    # 1. Health check
    try:
        h = requests.get(HEALTH_URL, timeout=5).json()
        print(f" Status: {h.get('status')} | Device: {h.get('device')} | Model Loaded: {h.get('model_loaded')}")
    except Exception as e:
        print(f" [FAIL] OCR server unavailable on {URL_OCR}: {e}")
        return

    ocr_latencies = []
    ocr_pass = 0
    results = []

    print("\nTesting 7 Real Medical Prescription Images on Port 8003...")

    for idx, img_filename in enumerate(REAL_OCR_IMAGES, 1):
        img_path = os.path.join(OCR_DIR, img_filename)
        if not os.path.exists(img_path):
            print(f"   [{idx:02d}/07] {img_filename:<15} [FAIL] File Not Found")
            continue

        try:
            with open(img_path, "rb") as f:
                img_bytes = f.read()

            t0 = time.time()
            files = {'file': (img_filename, img_bytes, 'image/webp')}
            data = {'doc_type': 'prescription', 'voice_statement': 'Patient stated no medicine taken'}

            res = requests.post(SCAN_URL, files=files, data=data, timeout=45)
            wall_ms = (time.time() - t0) * 1000

            if idx == 1:
                print(f"   [Active GPU Test] Peak Vision OCR VRAM while loaded: {get_vram_info()}")

            if res.status_code == 200:
                payload = res.json()
                lat = payload.get("latency_ms", wall_ms)
                meds = payload.get("extracted_medications", [])
                labs = payload.get("extracted_lab_values", [])
                discrepancies = payload.get("discrepancies", [])
                raw_txt = payload.get("raw_text", "").replace("\n", " ")

                ocr_latencies.append(lat)
                ocr_pass += 1
                results.append({
                    "image": img_filename,
                    "latency_ms": round(lat, 2),
                    "meds_count": len(meds),
                    "labs_count": len(labs),
                    "discrepancies_count": len(discrepancies),
                    "raw_sample": raw_txt[:60],
                    "status": "PASS"
                })

                print(f"   [{idx:02d}/07] {img_filename:<15} | Latency: {lat:6.1f} ms | Meds: {len(meds)} | Labs: {len(labs)} | Status: PASS")
            else:
                print(f"   [{idx:02d}/07] {img_filename:<15} [FAIL] HTTP {res.status_code}")

        except Exception as err:
            print(f"   [{idx:02d}/07] {img_filename:<15} [FAIL] Error: {err}")

    # Unload VRAM post-benchmark
    print(f"\n   Peak Vision OCR VRAM: {get_vram_info()}")
    try:
        requests.post(UNLOAD_URL, timeout=5)
    except Exception:
        pass
    print(f" Post-test GPU VRAM (Evicted): {get_vram_info()}")

    # Generate dedicated Markdown Report
    report_path = os.path.abspath("ocr_benchmark_report.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# MediKiosk Florence-2 Vision OCR Dedicated Benchmark Report\n\n")
        f.write(f"- **Timestamp**: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"- **Engine**: `microsoft/Florence-2-base` (Port 8003)\n")
        f.write(f"- **Hardware VRAM**: {get_vram_info()}\n\n")

        f.write("## 1. Summary Metrics\n\n")
        f.write("| Metric | Result |\n|---|---|\n")
        f.write(f"| **Total Real Prescriptions Tested** | {len(REAL_OCR_IMAGES)} |\n")
        f.write(f"| **Pass Rate** | {ocr_pass}/{len(REAL_OCR_IMAGES)} ({ocr_pass/len(REAL_OCR_IMAGES)*100:.0f}%) |\n")
        if ocr_latencies:
            f.write(f"| **Average Latency** | {sum(ocr_latencies)/len(ocr_latencies):.2f} ms |\n")
            f.write(f"| **P95 Latency** | {p95(ocr_latencies):.2f} ms |\n")
            f.write(f"| **Min Latency** | {min(ocr_latencies):.2f} ms |\n")
            f.write(f"| **Max Latency** | {max(ocr_latencies):.2f} ms |\n")

        f.write("\n## 2. Detailed Per-Image OCR Results\n\n")
        f.write("| Test Image | Latency (ms) | Extracted Meds | Lab Values | Discrepancies | Raw OCR Sample |\n")
        f.write("|---|---|---|---|---|---|\n")
        for item in results:
            f.write(f"| `{item['image']}` | {item['latency_ms']} ms | {item['meds_count']} items | {item['labs_count']} items | {item['discrepancies_count']} | {item['raw_sample']}... |\n")

    print("\n================================================================================")
    print("                     VISION OCR BENCHMARK SUMMARY RESULTS                       ")
    print("================================================================================")
    print(f" Florence-2 Vision OCR : Pass {ocr_pass}/{len(REAL_OCR_IMAGES)} ({ocr_pass/len(REAL_OCR_IMAGES)*100:.0f}%) | Avg: {sum(ocr_latencies)/len(ocr_latencies):.1f}ms | P95: {p95(ocr_latencies):.1f}ms")
    print(f"\nSaved OCR benchmark report to: {report_path}")
    print("================================================================================")

if __name__ == "__main__":
    run_ocr_benchmark()
