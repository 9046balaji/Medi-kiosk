# MediKiosk 36-Hour Hackathon Execution Roadmap
**SIH26047 | Ministry of Ayush | Final Submission Blueprint**

---

## 📅 PRE-HACKATHON SETUP (Complete BEFORE Event Starts)

### Setup Window: T-72 to T-24 Hours
**Goal:** Eliminate environment setup delays; maximize coding time during hackathon.

```
Day -3 (72h before):
├─ ✅ Git repository initialized
├─ ✅ requirements.txt finalized (frozen versions)
├─ ✅ Model download scripts tested locally
└─ ✅ Docker image built and tested

Day -2 (48h before):
├─ ✅ All team members have environment set up
├─ ✅ Models cached locally (5.2GB total)
├─ ✅ FastAPI scaffold code ready
├─ ✅ React template with Tailwind configured
└─ ✅ Mock API endpoints stubbed

Day -1 (24h before):
├─ ✅ Dry run: full end-to-end flow (mock data)
├─ ✅ VRAM stress test (ensure <5.5GB sustained)
├─ ✅ Sample prescription + audio files downloaded
├─ ✅ Slide deck template started
└─ ✅ Team gets good sleep 🛌
```

### Pre-Hackathon Checklist
```bash
# Run this script 24h before to confirm readiness
./scripts/pre_hackathon_check.sh

# Output should show:
# ✅ Python 3.10+ installed
# ✅ CUDA 12.1 detected
# ✅ faster-whisper model cached (390MB)
# ✅ Ollama service ready
# ✅ ayurparam:2.9b loaded
# ✅ React build working
# ✅ Total VRAM usage: 5.1GB / 6.0GB ✓
```

---

## ⚡ HACKATHON EXECUTION (36 HOURS)

### PHASE 1: FOUNDATION LAYER (Hours 0-4)
**Objective:** Deploy all backend microservices + confirm VRAM stability

```
T+0:00 — KICKOFF & TEAM HUDDLE (15 min)
├─ Review architecture one final time
├─ Assign roles: 2 backend, 2 frontend, 1 AI, 1 AYUSH domain
├─ Set Slack channel notifications (hourly sync)
└─ Share this roadmap + checkpoint requirements

T+0:15 — Backend: FastAPI Server Setup (1h)
├─ [Backend 1] Scaffold FastAPI app with CORS, error handlers
│   └─ Code: git clone → poetry install → uvicorn main:app --reload
├─ [Backend 2] Spin up Ollama service in background
│   └─ Verify: curl http://localhost:11434/api/tags
└─ [AI] Test Faster-Whisper loading + inference
    └─ Script: test_faster_whisper.py (transcribe 10sec audio sample)

T+1:15 — Frontend: React Scaffold (1h)
├─ [Frontend 1] Spin up Vite dev server
│   └─ npm create vite@latest medikiosk-ui -- --template react
├─ [Frontend 2] Copy MediKioskDashboard.jsx template
│   └─ npm install lucide-react axios ws
└─ Verify: App loads on localhost:3000

T+2:15 — WebSocket Plumbing (1h)
├─ [Backend 1] Implement /ws/intake WebSocket endpoint
│   └─ Accept connection, echo "Listening..." message
├─ [Frontend 1] Build WebSocket client wrapper
│   └─ Connect to ws://localhost:8000/ws/intake
├─ [Both] End-to-end handshake test
└─ Verify: Browser console shows "Connected to intake channel"

T+3:15 — VRAM Stress Test (30 min)
├─ [AI] Run all models simultaneously
│   ├─ Load Faster-Whisper (1.2GB)
│   ├─ Load AyurParam (2.2GB)
│   ├─ Load MedGemma (1.8GB)
│   └─ Measure: nvidia-smi should show 5.1–5.3GB ✓
├─ [Backend] Monitor memory leaks (30 min sustained inference)
└─ Verify: VRAM usage stable, no OOM errors

T+3:45 — CHECKPOINT #1: FOUNDATION ✅
├─ FastAPI server running on port 8000
├─ Ollama service responding
├─ React dev server running on port 3000
├─ WebSocket handshake working
├─ VRAM usage <5.5GB sustained
└─ Git: Commit with tag "checkpoint-1-foundation"
```

**If Behind Schedule:**
- ❌ Skip WebSocket optimization (use HTTP polling as fallback)
- ❌ Use mock LLM responses (return hardcoded JSON) until T+8

---

### PHASE 2: CORE AI PIPELINES (Hours 4-12)
**Objective:** Full ASR + LLM + OCR workflows integrated

```
T+4:00 — ASR Integration (2h)
├─ [AI] Implement /api/intake/voice endpoint
│   ├─ Accept .wav file upload
│   ├─ Call Faster-Whisper INT8
│   ├─ Return JSON: {"transcript": "...", "confidence": 0.98}
│   └─ Stress test: 10 concurrent requests → measure latency
├─ [Frontend] Build audio recorder component
│   ├─ Use WebRTC getUserMedia() for live mic access
│   ├─ On "Stop": POST /api/intake/voice
│   ├─ Display transcript real-time (WebSocket streaming)
│   └─ Add voice activity detection (silence = auto-stop)
└─ Verify: Transcribe Hindi sentence <300ms

T+6:00 — LLM Orchestration (2h)
├─ [AI] Implement /api/intake/hpi endpoint
│   ├─ Accept: {"mode": "allopathy|ayush", "transcript": "..."}
│   ├─ Prompt engineering:
│   │   Allopathy: "Organize this patient history using SOCRATES format..."
│   │   Ayush: "Assess this patient's Prakriti, Vikriti, Agni using Dashavidha Pariksha..."
│   ├─ Call ollama.generate(model="ayurparam:2.9b", prompt=...)
│   ├─ Parse response to JSON schema (Pydantic model)
│   └─ Return: {"chief_complaint": "...", "hpi": "...", "prakriti": "..."}
├─ [Backend 2] Implement response validation
│   └─ Ensure output conforms to AYUSH/Allopathy schema
└─ Verify: LLM returns structured JSON <5sec

T+8:00 — OCR + Document Extraction (2h)
├─ [AI] Implement /api/intake/document endpoint
│   ├─ Accept multipart form: image file
│   ├─ Run PaddleOCR.ocr(image) → text regions
│   ├─ Pass to Qwen2-VL: "Extract medications with dosages from this prescription"
│   ├─ Validate drugs against OpenFDA (spaCy NER backup)
│   └─ Return: [{"drug": "Aspirin", "dosage": "75mg", "confidence": 0.97}, ...]
├─ [Frontend] Build image upload + preview
│   ├─ Drag-drop zone
│   ├─ Show extracted entities with confidence badges
│   └─ Manual edit capability (for low-confidence extractions)
└─ Verify: Prescription extraction 95%+ accuracy on test set

T+10:00 — Real-time Streaming (1h)
├─ [Backend] Upgrade ASR endpoint to streaming
│   ├─ Accept WebSocket with audio chunks (16kHz PCM)
│   ├─ Stream partial transcripts back (every 500ms)
│   └─ Measure latency: <300ms per chunk
├─ [Frontend] Implement streaming transcript display
│   └─ Append chunks to textarea in real-time
└─ Verify: Smooth user experience, no transcription gaps

T+11:00 — Emergency Triage Guardrail (1h)
├─ [AI] Deploy spaCy NER + keyword detection
│   ├─ Pre-LLM screening on raw transcript
│   ├─ Red-flag keywords: "chest pain", "dyspnea", "stroke", "bleeding"
│   ├─ If detected: return {"alert": "CRITICAL", "keyword": "chest pain"}
│   └─ Measure: 100% recall test on 20 emergency phrases
├─ [Frontend] Show red banner alert (matching design)
└─ Verify: <500ms detection latency, zero false negatives

T+12:00 — CHECKPOINT #2: AI PIPELINES ✅
├─ ASR: 300ms latency, 95% accuracy (Hindi test set)
├─ LLM: 5sec synthesis, structured JSON output
├─ OCR: 94% entity extraction accuracy
├─ Streaming: Real-time partial transcripts
├─ Emergency triage: 100% recall on red flags
└─ Git: Commit "checkpoint-2-ai-pipelines"

**If Behind Schedule:**
- ❌ Drop streaming (use polling)
- ❌ Use mock LLM responses for remainder
- ❌ Skip OpenFDA validation (spaCy only)
```

---

### PHASE 3: PHYSICIAN SUMMARY & FHIR (Hours 12-24)
**Objective:** Draft summary generation → Physician dashboard → FHIR export

```
T+12:00 — Summary Generation Engine (2h)
├─ [AI] Implement /api/summary/generate endpoint
│   ├─ Input: {transcript, ocr_entities, mode, emergency_alerts}
│   ├─ Prompt: "Generate a clinical SOAP note summary..."
│   ├─ Output: {chief_complaint, hpi, ros, assessment, plan}
│   └─ Template-based post-processing (ensure key sections present)
├─ [Backend] Implement summary versioning (in-memory)
│   └─ Store: {"version": 1, "content": "...", "timestamp": "..."}
└─ Verify: Summary generation <5sec end-to-end

T+14:00 — Physician Dashboard (3h)
├─ [Frontend 1] Build MediKiosk layout from template
│   ├─ Header: MediKiosk branding + emergency alert banner
│   ├─ Left panel: Patient data summary (Prakriti, medications, etc.)
│   ├─ Center panel: Editable summary textarea
│   ├─ Right panel: Quick-actions (Lock, Export, Clear)
│   └─ Responsive design (works on touch screens)
├─ [Frontend 2] Implement state management
│   ├─ useState for: {mode, transcript, ocrData, summary, editDraft, isDraftLocked}
│   ├─ Handle state persistence (sessionStorage only, no localStorage)
│   └─ Implement "Clear Session" for DPDP compliance
└─ Verify: Dashboard renders without errors, all buttons clickable

T+17:00 — Physician Editing Interface (2h)
├─ [Frontend 1] Build edit mode
│   ├─ Toggle between View/Edit modes
│   ├─ Textarea with autosave to sessionStorage (not persistent)
│   └─ Word count + character limit enforcement
├─ [Frontend 2] Implement "Lock & Confirm" workflow
│   ├─ Lock button: set isDraftLocked = true
│   ├─ Once locked: show "Export to ABDM" button only
│   ├─ Prevent editing after lock (unless unlock)
│   └─ Visual feedback: locked = green checkmark
└─ Verify: Edit flow intuitive, locked state prevents changes

T+19:00 — FHIR R4 Bundle Generation (2h)
├─ [Backend 1] Implement /api/export/fhir endpoint
│   ├─ Input: {summary, ocr_entities, mode, patient_abha}
│   ├─ Generate ABDM Composition resource:
│   │   {
│   │     "resourceType": "Composition",
│   │     "status": "preliminary",
│   │     "subject": {"reference": "Patient/ABHA-xxx@ndhm"},
│   │     "section": [
│   │       {"title": "Chief Complaint", "text": {"div": "..."}},
│   │       {"title": "HPI", "text": {"div": "..."}},
│   │       {"title": "Medications", "entry": [...]},
│   │       {"title": "Dashavidha Pariksha", "text": {"div": "..."}} (if AYUSH)
│   │     ]
│   │   }
│   ├─ Validate against FHIR schema (use fhir-validator)
│   └─ Return: {valid: true, bundle: {...}, errors: []}
├─ [Backend 2] Implement FHIR schema validation
│   └─ Use: from fhir.resources import Composition
├─ [Frontend] Implement export UI
│   ├─ "Download FHIR Bundle" button (generates JSON file)
│   ├─ Show bundle size + validation status
│   └─ Display export confirmation
└─ Verify: Bundle validates against NHA FHIR schema (zero errors)

T+21:00 — Session Clear (DPDP Compliance) (30 min)
├─ [Frontend] Implement auto-wipe on export
│   ├─ After successful export, clear all state:
│   │   setTranscript(""), setOcrData([]), setEditDraft("")
│   ├─ Show: "Session cleared. Ready for next patient."
│   └─ No persistent storage of audio/text (browser cache cleared)
├─ [Backend] Implement server-side cleanup
│   └─ Auto-delete temp files after 1 hour
└─ Verify: sessionStorage empty after export, privacy compliance ✓

T+21:30 — Testing & Bug Fixes (2.5h)
├─ [All] End-to-end flow test:
│   ├─ Voice input (Hindi) → Transcript
│   ├─ Upload prescription → Extract medications
│   ├─ Review summary → Edit → Lock
│   ├─ Export FHIR → Download JSON
│   ├─ Verify session cleared
│   └─ Measure total latency <8sec
├─ [Frontend] Fix styling bugs, responsive issues
├─ [Backend] Fix any API crashes, error handling
└─ Git: Commit "checkpoint-3-fhir-export"

T+24:00 — CHECKPOINT #3: FULL FLOW ✅
├─ Summary generation working end-to-end
├─ Physician dashboard complete + intuitive
├─ FHIR bundle generation + validation
├─ Session clear (DPDP compliant)
├─ No crashes on realistic data
├─ Total flow: <8 seconds voice→export
└─ Git: Commit "checkpoint-3-full-flow"
```

---

### PHASE 4: DEMO POLISH & SLIDE DECK (Hours 24-36)
**Objective:** Judge-ready demo + presentation materials

```
T+24:00 — Demo Script Preparation (2h)
├─ [Team Lead] Write demo script in Hindi (2-3 minutes)
│   ├─ Real patient scenario: "60-year-old with chest pain"
│   ├─ Voice input: "Mujhe teen din se chest pain hai..." (recorded)
│   ├─ Prescription scan: Show actual prescription image
│   ├─ Live commentary: "System is now processing..."
│   ├─ Show FHIR output: "Here's the structured record"
│   └─ Emphasize: Offline + DPDP compliant + ABDM ready
├─ [Frontend] Prepare demo slides
│   ├─ Screenshot 1: Voice intake in progress
│   ├─ Screenshot 2: Prescription OCR extraction
│   ├─ Screenshot 3: Summary draft + physician edit
│   ├─ Screenshot 4: FHIR bundle export
│   ├─ Screenshot 5: Red-flag emergency alert (show it)
│   └─ Screenshot 6: "Session cleared" message
├─ [AI] Prepare model stats handout
│   ├─ AyurParam F1=73% on Ayurvedic concepts
│   ├─ Faster-Whisper 300ms latency
│   ├─ PaddleOCR 95% accuracy
│   └─ Total VRAM: 5.2GB / 6GB ✓
└─ Dry run: Full demo <5 minutes, no crashes

T+26:00 — Slide Deck (Official SIH 6-Slide Template) (2h)
├─ Slide 1: Title + Team
├─ Slide 2: Problem & Solution (use updated problem analysis)
├─ Slide 3: Technical Architecture (reference diagram)
├─ Slide 4: Innovation & Feasibility
├─ Slide 5: Impact & Scalability
├─ Slide 6: Prototype Status + References
├─ Animations: Subtle transitions only (no distractions)
└─ Speaker notes: Provided verbatim (provided in Phase 3 above)

T+28:00 — Q&A Preparation (2h)
├─ [Domain Expert] Anticipate 20 judge questions:
│   ├─ "Why AyurParam over Llama?" → Answer: BhashaBench benchmarks
│   ├─ "How do you handle offline?" → Answer: Local GPU, no cloud APIs
│   ├─ "What about data privacy?" → Answer: DPDP Act 2023, session wipe
│   ├─ "How does red-flag detection work?" → Answer: Pre-LLM spaCy NER
│   ├─ "Can this scale to 10,000 kiosks?" → Answer: Commodity hardware, ₹80K
│   ├─ "What if transcription is wrong?" → Answer: Document OCR + physician edits
│   ├─ ... (see Q&A Playbook below)
├─ [Team] Role-play mock judging
│   ├─ Designate 1 person as "judge"
│   ├─ Ask toughest questions
│   ├─ Practice confident answers (don't say "I don't know")
│   └─ Do 2 full mock rounds
└─ [All] Memorize key stats:
    ├─ 2–5 min OPD bottleneck
    ├─ 60–70% low-literacy patients
    ├─ 300% throughput increase
    ├─ 5.2GB VRAM usage
    ├─ 100% red-flag recall
    └─ ₹500L annual savings (Phase 1)

T+30:00 — Performance Optimization (1h)
├─ [AI] Profile inference latency
│   ├─ Measure: Total time from voice→export
│   ├─ Target: <8 seconds
│   ├─ If >8s: enable batch processing, reduce context window
├─ [Backend] Check for memory leaks
│   └─ Run for 30min, monitor nvidia-smi
├─ [Frontend] Lighthouse performance audit
│   └─ Target: >90 score
└─ Optimize if needed, commit final version

T+31:00 — Final Testing & Documentation (2h)
├─ [QA] Full regression test
│   ├─ Test case 1: English allopathy + prescription
│   ├─ Test case 2: Hindi AYUSH intake only
│   ├─ Test case 3: Emergency red-flag detection
│   ├─ Test case 4: Document extraction edge cases (rotated, low quality)
│   ├─ Test case 5: FHIR schema validation
│   └─ Test case 6: Session clear + privacy check
├─ [Docs] Write README.md with setup instructions
│   ├─ "Installation (5 min)"
│   ├─ "Running the System"
│   ├─ "API Endpoints"
│   ├─ "Future Roadmap"
│   └─ "Known Limitations"
└─ Git: Final commit "medikiosk-v1.0-hackathon-final"

T+33:00 — Dry Run & Contingency Planning (1.5h)
├─ [All] Full demo from start to finish
│   ├─ Cold start system (all models load fresh)
│   ├─ Do voice + document intake
│   ├─ Export FHIR
│   ├─ Measure end-to-end time
│   ├─ Check: no crashes, VRAM stable
│   └─ Time: <10 minutes total
├─ [Team Lead] Prepare contingencies:
│   ├─ If GPU dies: Have pre-recorded demo video ready
│   ├─ If WebSocket fails: Use HTTP polling backup
│   ├─ If Ollama crashes: Show screenshot of output
│   ├─ If network fails: Everything is offline anyway ✓
│   └─ If slides corrupt: Have PDF backup + markdown version
└─ Git: Final push to remote, confirm all code on GitHub

T+34:30 — Rest & Mental Prep (1.5h)
├─ [Team] Take a break (eat, shower, nap if possible)
├─ [All] Review slide deck one more time
├─ [Lead] Brief everyone on demo flow
├─ [All] Get good sleep (or stay caffeinated 😄)
└─ Arrive at judging venue 30 min early

T+36:00 — SHOWTIME ⭐
├─ Setup laptop, test display/projector
├─ Do sound check (speaker volume for audio playback)
├─ Confirm internet connectivity (show it works offline 👍)
├─ Introduce team confidently
├─ Execute demo flawlessly
├─ Answer judge questions thoughtfully
├─ Celebrate! 🎉
└─ Result: Top 5 finalists → Winning proposal
```

---

## 🚨 RISK MITIGATION & CONTINGENCIES

### Critical Risks & Fallbacks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| GPU OOM crash during hackathon | Medium | High | Pre-quantize all models; add swap layer; have CPU-only fallback |
| Ollama service becomes unresponsive | Low | Critical | Have alternative llama.cpp binary ready; script auto-restart |
| Network connectivity issues | Medium | Low | System is offline-first; test all features without internet |
| React build suddenly breaks | Low | Medium | Keep old build cached; use Rollup minified bundle as backup |
| LLM generates bad output (hallucinations) | Medium | Medium | Pydantic schema validation; spaCy NER post-processing; physician review |
| FHIR schema validation fails | Low | High | Use `fhir-cli validate` locally first; have sample valid bundles |
| Demo crashes in front of judges | Low | Critical | Pre-recorded demo video as backup; hardcoded example output |
| Time runs out, prototype incomplete | Medium | Critical | Prioritize: MVP → UI → Polish. Accept "partial" if needed |

### Contingency Actions

**If GPU runs out of VRAM:**
```bash
# Quick fixes (in order):
1. pkill -f ollama  # Free up space
2. unload non-critical model
3. Reduce batch size to 1
4. Switch to CPU-only mode (slow, but works)
5. Fall back to pre-recorded demo output
```

**If Ollama service crashes:**
```bash
# Use llama.cpp directly
./llama-cli -m ./models/AyurParam-2.9B.gguf -p "Patient has..." -n 128
```

**If WebSocket is unstable:**
```javascript
// Fallback to polling
const fetchTranscript = setInterval(() => {
  fetch('/api/intake/transcript').then(r => r.json()).then(data => {
    setTranscript(data.text);
  });
}, 1000);
```

**If React build fails:**
```bash
# Use pre-built static HTML
npm run build:static  # Creates index.html without build step
# Serve with: npx http-server
```

---

## 📊 Hourly Checkpoint Tracking

```markdown
# Hackathon Progress Tracker

## Phase 1: Foundation (T+0 to T+4)
- [ ] T+1h: FastAPI server running
- [ ] T+2h: React dev server up
- [ ] T+3h: WebSocket handshake working
- [ ] T+4h: VRAM <5.5GB ✓ CHECKPOINT #1

## Phase 2: AI Pipelines (T+4 to T+12)
- [ ] T+6h: ASR working <300ms
- [ ] T+8h: LLM returning structured JSON
- [ ] T+10h: OCR extraction 95%+ accuracy
- [ ] T+11h: Emergency triage 100% recall
- [ ] T+12h: All three pipelines integrated ✓ CHECKPOINT #2

## Phase 3: Physician Workflow (T+12 to T+24)
- [ ] T+14h: Summary generation working
- [ ] T+17h: Dashboard + edit UI complete
- [ ] T+19h: FHIR bundle generation + validation
- [ ] T+21h: Session clear (DPDP compliant)
- [ ] T+24h: End-to-end flow <8 sec ✓ CHECKPOINT #3

## Phase 4: Demo & Presentation (T+24 to T+36)
- [ ] T+26h: Slide deck complete (6 slides)
- [ ] T+28h: Q&A preparation done
- [ ] T+30h: Performance optimized
- [ ] T+33h: Dry run successful
- [ ] T+36h: JUDGING TIME ⭐
```

---

## 👥 Team Roles & Responsibilities

| Role | Person | Hours 0-12 | Hours 12-24 | Hours 24-36 |
|------|--------|-----------|------------|------------|
| **Backend Lead** | Person A | FastAPI + Ollama | FHIR generation | Testing |
| **AI/ML Engineer** | Person B | ASR + LLM integration | Emergency triage | Q&A prep |
| **Frontend Lead** | Person C | React + WebSocket | Dashboard UI | Slide deck |
| **Full Stack** | Person D | OCR + validation | Physician workflow | Demo script |
| **Domain/Clinical** | Person E | AYUSH prompts | FHIR validation | Judge prep |
| **Project Manager** | Lead | Coordination | Risk management | Presentation |

**Daily Syncs:**
- 9 AM: 30-min standup (status + blockers)
- 3 PM: 30-min technical sync (merge conflicts + architecture)
- 11 PM: 15-min status before sleep

---

## ✅ Final Submission Checklist

**Code & Deployment:**
- [ ] All code on GitHub (public repo, clean history)
- [ ] README.md with setup instructions
- [ ] requirements.txt with pinned versions
- [ ] Dockerfile with build instructions
- [ ] .gitignore excludes models/ (too large)
- [ ] No hardcoded API keys, credentials, or personal data
- [ ] License file (Apache 2.0 or MIT recommended)

**Documentation:**
- [ ] System architecture diagram (included)
- [ ] 6-slide pitch deck (official SIH template)
- [ ] Speaker notes for all 6 slides
- [ ] API documentation (endpoints + examples)
- [ ] FHIR bundle schema validation proof
- [ ] Benchmark numbers (latency, accuracy, VRAM)

**Demo Readiness:**
- [ ] Offline-first verification (no internet required)
- [ ] Live demo script (2-3 min, in Hindi)
- [ ] Backup demo video (pre-recorded, 2 min)
- [ ] Sample prescription images (3+ test cases)
- [ ] Audio samples (Hindi + Telugu)
- [ ] FHIR output examples (valid bundles)

**Compliance & Legality:**
- [ ] DPDP Act 2023 compliance documented
- [ ] No personal data stored persistently
- [ ] Session clear working (verified)
- [ ] Open-source licenses respected (documented)
- [ ] No proprietary code from third parties

---

**Last Updated:** January 2025  
**Hackathon Duration:** 36 hours  
**Target Rank:** Top 5 Finalists / Winner  
**Good Luck! 🚀**
