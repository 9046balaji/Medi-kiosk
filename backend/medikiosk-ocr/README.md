# 👁️ MediKiosk Vision OCR Microservice 2.0
### Microsoft Florence-2-base — Prescription & Lab Report Extraction

[![Version](https://img.shields.io/badge/Release-v2.0.0-emerald.svg)](https://github.com/balajikonda9046/Medi-kiosk)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Production-Grade Vision OCR Engine** for handwritten and printed medical prescriptions, lab reports, and clinical documents.  
> Powered by `microsoft/Florence-2-base` via PyTorch FP16 CUDA acceleration.  
> Features **OpenCV CLAHE Contrast & Deskewing**, **CDSCO/RxNorm/AYUSH Fuzzy Drug Normalization**, **Bounding Box Region Highlighting**, and **Handwriting Detection**.

---

## 📦 What's in This Directory

```
backend/medikiosk-ocr/
├── main.py              # FastAPI server — /api/scan-ocr, /api/health, /api/unload
├── ocr_engine.py        # Vision OCR Engine — Florence-2 parser, OpenCV pre-processor, CDSCO normalizer
├── download-ocr.py      # One-time HuggingFace model downloader
├── test_ocr.py          # Enterprise unit test battery verifying CLAHE, fuzzy drug lookup, bounding boxes
├── requirements.txt     # Python dependencies
└── models/
    └── Florence-2-base/ # Downloaded model weights (~0.9GB)
```

---

## 🚀 Version 2.0.0 Key Enhancements

1. **Zero Hardcoded Data Injection**:
   - Replaced static sample prescription fallbacks with clean error payloads, allowing frontend UI to show explicit `status: "warning"` low-quality/dark image alerts.
2. **OpenCV Pre-Processing Pipeline**:
   - Applies CLAHE contrast enhancement (`clipLimit=2.5`, `tileGridSize=(8,8)`), Gaussian denoising, and contour `minAreaRect` auto-deskewing for tilted camera frames.
3. **CDSCO / RxNorm / AYUSH Fuzzy Drug Normalizer**:
   - Auto-corrects OCR typos against official drug pharmacopoeia dictionaries (`Paracetmol 500mg` $\rightarrow$ `Paracetamol`, `Pantoprasol 40mg` $\rightarrow$ `Pantoprazole`).
4. **Florence-2 `<OCR_WITH_REGION>` Bounding Box Parser**:
   - Parses `<loc_y1><loc_x1><loc_y2><loc_x2>` tokens returning normalized `[ymin, xmin, ymax, xmax]` coordinates for frontend visual highlighting.
5. **Handwriting Detection (`is_handwritten`)**:
   - Evaluates image stroke variance via Laplacian edge analysis to mark cursive handwritten prescriptions.

---

## 📡 API Reference

Base URL: `http://localhost:8002` (or configured port)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service status, device, model state |
| `POST` | `/api/scan-ocr` | Process prescription image file / base64 string |
| `POST` | `/api/unload` | Free GPU VRAM immediately |

---

## 🧪 Enterprise Unit Test

Run the Vision OCR test battery:

```bash
python backend/medikiosk-ocr/test_ocr.py
```

Output:
```
=================================================================================
 👁️ MEDIKIOSK FLORENCE-2 VISION OCR 2.0 ENTERPRISE TEST BATTERY                  
=================================================================================
  ✓ PASS: OpenCV CLAHE contrast & deskewing pipeline verified!
  ✓ PASS: CDSCO / RxNorm / AYUSH fuzzy drug normalization verified!
  ✓ PASS: Florence-2 bounding box region token parser verified!
  ✓ PASS: Handwriting detection algorithm verified!
  ✓ PASS: 60s idle eviction timer verified!
```
