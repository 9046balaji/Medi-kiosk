# 🏥 MediKiosk — AI-Powered Indic Multilingual OPD Kiosk & Clinical Workstation

MediKiosk is an intelligent, accessibility-focused hospital OPD Kiosk and Clinical Decision Support Workstation engineered for Indian healthcare institutions (AIIMS, AIIA, District Hospitals, and Primary Health Centers).

It features **universal 22-language translation**, **Ayush SOAP + Dashavidha Pariksha clinical assessment**, **ABDM HL7 FHIR R4 record exporting**, **voice ASR & OCR document scanning**, and **role-specific modular profiles and settings**.

---

## ✨ Key Features

### 🌐 Universal Top Translation Header
- **Universal Top Header**: Mounted on 100% of screens with a persistent 22-language `IndicTrans2` drop-down, speech audio guidance toggle, and emergency SOS button.
- **Zero-Latency Micro-Batch Queue**: 15ms queue window backed by an in-memory Ref cache for instant, lag-free Indic text rendering.

### 🩺 Dual Integrated Clinical Console
- **Allopathic SOAP Workstation**: Pre-populates Subjective history, Objective vitals, Assessment, and Plan from patient intake.
- **Vaidya Dashavidha Pariksha**: Full 10-fold Ayush assessment matrix (*Prakriti*, *Vikriti*, *Agni*, *Kosta*, *Dehabala*, *Ahara-shakti*).
- **Contraindication Alert Engine**: Detects drug-herb interactions (e.g., Aspirin + Arjuna / Warfarin + Garlic).

### 👥 Dedicated Modular Profiles & Settings
Cleanly organized into role-specific directory structures (`src/components/profiles/` and `src/components/settings/`):
- 🧑‍🦱 **Patient**: ABHA Health Card, lifetime EHR history, voice volume, contrast toggle, and DPDP consent settings.
- 🩺 **Doctor**: Medical Council Credentials, e-Sign RSA-2048 keys, consultation stream preferences, and alert sensitivity thresholds.
- 👩‍⚕️ **Nurse**: Triage duty badge, station equipment connectivity, shift handoff reports, and P1 chime alert settings.
- 🛡️ **Administrator**: ABDM node telemetry, IndicTrans2 FP16 precision controls, and DPDP RAM purge timers.

### 📄 HL7 FHIR R4 Bundle Export & DPDP Privacy
- Generates NRCES-compliant FHIR R4 Composition JSON bundles with SNOMED CT and NAMASTE Ayush codings.
- **DPDP Act 2023 Compliant**: Zero-retention ephemeral RAM purge after session transmission.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons, React Router DOM v6.
- **Backend Translation Engine**: FastAPI, PyTorch (FP16/INT8), AI4Bharat `IndicTrans2` model (`indictrans2-en-indic-dist-200M`).
- **Interoperability**: HL7 FHIR R4 Standard, ABDM (Ayushman Bharat Digital Mission) Level-3 Spec.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: 3.10 or 3.11 (with Conda or `venv`)

### 1. Frontend Setup
```bash
# Install dependencies
npm install

# Run Vite dev server (runs on http://localhost:5173)
npm run dev
```

### 2. Backend Translation Server Setup
```bash
# Navigate to backend directory
cd backend/medikiosk-translation

# Install Python requirements
pip install -r requirements.txt

# Start FastAPI translation daemon (runs on http://localhost:8000)
python main.py
```

### 3. Production Build
```bash
# Type check and build bundle
npx tsc --noEmit
npm run build
```

---

## 📂 Codebase Folder Structure

```
medikiosk/
├── backend/
│   └── medikiosk-translation/   # FastAPI IndicTrans2 translation microservice
├── src/
│   ├── components/
│   │   ├── clinical/            # Clinical Workstation (Doctor, Nurse, FHIR Export)
│   │   ├── kiosk/               # Patient Kiosk Flow (Auth, Intake, Scanner, Receipt)
│   │   ├── layout/              # Universal Header, Sidebar, Footer
│   │   ├── profiles/            # Modular Profile Screens (Patient, Doctor, Nurse, Admin)
│   │   └── settings/            # Modular Settings Screens (Patient, Doctor, Nurse, System)
│   ├── context/                 # MediKioskContext & TranslationContext (15ms Queue)
│   ├── data/                    # Clinical Mock Datasets & FHIR Schemas
│   └── lib/                     # Language Mappings & API Client Services
├── README.md                    # Repository documentation
└── .gitignore                   # Git exclusion rules
```
