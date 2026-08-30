# MediKiosk — Google Stitch Prompt Library
## Every Screen, Every Sub-Feature, Every State
### SIH26047 | Ministry of Ayush | 36-Hour Hackathon UI Generation

---

## HOW TO USE THIS FILE

**Workflow:** Open Google Stitch → Create a DESIGN.md first (Prompt 0 below) → Then generate each screen one by one using the prompts below → Export to React/Tailwind → Drop into your `frontend/src/` folder → Wire to FastAPI endpoints.

**Tips for best results:**
- Paste each prompt in full — do not shorten
- Use "Flash" mode for first drafts, "Thinking" mode for final polish
- After each generation, use Direct Edit to fix details
- Export as React + Tailwind CSS (matches your stack)

---

## PROMPT 0 — DESIGN.MD (Run This First)

> **Paste this into Stitch before generating any screen. This becomes the design system every screen inherits.**

```
Create a DESIGN.md for a healthcare kiosk application called "MediKiosk" with these specifications:

Brand: MediKiosk — AI-Powered Clinical Intake for India's OPDs
Color palette:
- Primary: Deep teal (#0D7377) — trust, medical authority
- Secondary: Warm saffron (#F4A423) — Ayurvedic identity, warmth
- Emergency red: #DC2626 — red-flag alerts only
- Success green: #16A34A — confirmations, completed states
- Background: #F8FAFC (light mode), #0F172A (dark mode for doctor screens)
- Surface cards: white (#FFFFFF) with subtle shadow
- Text primary: #1E293B, Text secondary: #64748B

Typography:
- Headings: Inter Bold, large (24-36px on kiosk, 18-24px on dashboard)
- Body: Inter Regular, 16-18px on kiosk (readability for elderly), 14px on dashboard
- Monospace: JetBrains Mono for FHIR JSON display
- Support for Devanagari (Hindi) and Telugu script rendering

Layout principles:
- Kiosk screens (Screens 1-3): Full-screen, large touch targets (minimum 48x48px), high contrast WCAG AAA, icon-driven, minimal text
- Clinical screens (Screens 4-5): Dense information layout, dark background, data-first, sidebar + main panel pattern
- Admin screens (Screen 7): Dashboard grid with KPI cards, charts, tables

Component library: shadcn/ui style — rounded-lg cards, subtle borders, consistent 8px spacing grid
Icons: Lucide icon set (already in stack)
Accessibility: All interactive elements have aria-labels, focus rings, minimum 4.5:1 contrast ratio
Language: UI text in English with provisions for Hindi/Telugu labels shown alongside
```

---

## SCREEN 1 — WELCOME & AUTHENTICATION TERMINAL

### Prompt 1A: Welcome Screen (Default/Idle State)

```
Design a full-screen healthcare kiosk welcome terminal for "MediKiosk" — a self-service patient intake system deployed in Indian government hospital OPD lobbies.

CONTEXT: This is the FIRST thing a nervous, potentially non-literate patient sees. The design must reduce fear and get them to act within 8 seconds. The kiosk runs on a 15-inch high-contrast touchscreen.

LAYOUT (single full-screen view, portrait orientation):

TOP SECTION (20% height):
- MediKiosk logo (a stylized stethoscope + leaf icon combining allopathy and Ayurveda) centered
- Tagline below logo: "Your Health, Your Language" in English, Hindi (आपकी सेहत, आपकी भाषा), and Telugu (మీ ఆరోగ్యం, మీ భాష) — rotating every 3 seconds with subtle fade animation
- Small government emblem badge: "Ministry of Ayush | Government of India" in top-right corner

MIDDLE SECTION (50% height) — LANGUAGE SELECTION:
- Heading: "Tap your language / अपनी भाषा चुनें" — large, bold, centered
- 6 large square tiles in a 3x2 grid, each tile at least 120x120px:
  - Hindi (हिन्दी) — with a small Indian flag accent
  - English
  - Telugu (తెలుగు)
  - Tamil (தமிழ்)
  - Kannada (ಕನ್ನಡ)
  - Marathi (मराठी)
- Each tile has: the language name in its own script (large, bold), the English name below (smaller), and a subtle speaker icon in the corner indicating "audio available"
- Tiles have rounded corners (16px), white background, teal border on hover/tap, gentle shadow
- Active/selected state: tile fills with teal (#0D7377), text turns white

BOTTOM SECTION (30% height):
- A pulsing circular microphone icon with text: "Or just say your language out loud" / "या बस अपनी भाषा बोलें"
- Volume control slider (horizontal, large thumb) for speaker output
- Small accessibility icon in bottom-left: wheelchair symbol
- Bottom bar: "Privacy: Your voice and documents are used only for this visit and deleted after" — in small but readable text, with a lock icon

DESIGN REQUIREMENTS:
- Background: clean white or very light gradient (not clinical blue — avoid hospital anxiety)
- All text must be minimum 18px for readability at arm's length
- Touch targets minimum 48x48px
- No keyboard anywhere on this screen
- Warm, inviting feel — use rounded shapes, not sharp corners
- Subtle animated wave pattern at the very top edge (like a gentle heartbeat line) in light teal
```

### Prompt 1B: ABHA Authentication Sub-Screen

```
Design a patient authentication screen for MediKiosk kiosk, shown AFTER the patient selects their language on the welcome screen.

CONTEXT: The patient has chosen Hindi. All UI text is now in Hindi with English subtitles. This screen offers three ways to identify: ABHA QR scan, mobile number, or anonymous token.

LAYOUT (full-screen, portrait):

TOP BAR (10%):
- Back arrow (left) to return to language select
- "MediKiosk" small logo (center)
- Selected language badge: "हिन्दी" with a small flag

MAIN CONTENT (70%):
- Heading: "आइए शुरू करें" (Let's begin) — large, warm, centered
- Subheading: "अपनी पहचान चुनें" (Choose your identity) — smaller, gray

Three large vertical cards stacked, each full-width with generous padding:

CARD 1 — ABHA QR Scan (recommended, highlighted with teal border):
- Left side: Large QR code scanner icon (camera frame corners animation)
- Right side:
  - Title: "ABHA कार्ड स्कैन करें" (Scan ABHA Card)
  - Subtitle: "सबसे तेज़ तरीका — पिछली जानकारी अपने आप आ जाएगी" (Fastest — past records load automatically)
  - Small badge: "अनुशंसित" (Recommended) in saffron
- Full card is tappable

CARD 2 — Mobile Number:
- Left side: Phone icon with OTP dots
- Right side:
  - Title: "मोबाइल नंबर से" (Via Mobile Number)
  - Subtitle: "OTP भेजा जाएगा" (OTP will be sent)
- Slightly less prominent than Card 1

CARD 3 — Anonymous / Token:
- Left side: Ticket/token icon
- Right side:
  - Title: "OPD टोकन नंबर" (OPD Token Number)
  - Subtitle: "बिना ABHA के भी शुरू करें" (Start without ABHA)
  - Small note: "रिकॉर्ड सिर्फ़ इस विज़िट तक" (Records for this visit only)

BOTTOM SECTION (20%):
- Audio playback bar: a small speaker icon with "🔊 सुनें" (Listen) — tapping reads the screen aloud via TTS
- Consent statement in a light yellow banner:
  "आपकी आवाज़ और दस्तावेज़ सिर्फ़ इस विज़िट के लिए उपयोग होंगे और बाद में हटा दिए जाएंगे।"
  (Your voice and documents will be used only for this visit and deleted after.)
  Lock icon + "DPDP Act 2023" badge

DESIGN:
- Same warm white background as Screen 1A
- Cards have hover/press states (slight scale up, shadow deepen)
- All text bilingual: Hindi primary (larger), English secondary (smaller, gray)
- Large touch targets on all three cards
```

### Prompt 1C: ABHA QR Scanner Active State

```
Design the active QR scanning overlay for MediKiosk kiosk when patient taps "Scan ABHA Card."

LAYOUT (full-screen):

CENTER: A large camera viewfinder frame (rounded rectangle with animated corner brackets, teal colored, pulsing gently). Inside the frame: live camera feed placeholder (gray with a camera icon). Text below frame: "ABHA QR कोड को फ़्रेम में रखें" (Place ABHA QR code inside the frame) — white text on semi-transparent dark overlay.

BOTTOM: Two buttons side by side:
- "रद्द करें" (Cancel) — outlined, gray
- "मैन्युअल नंबर डालें" (Enter number manually) — outlined, teal

TOP: Small animated dots indicator: "स्कैन हो रहा है..." (Scanning...)

SUCCESS STATE (show as a second frame):
- Green checkmark animation replaces the viewfinder
- "✓ ABHA सत्यापित" (ABHA Verified)
- Patient name appears: "स्वागत है, राजेश कुमार" (Welcome, Rajesh Kumar)
- If returning patient: a small badge "पिछली विज़िट मिली — पुरानी दवाइयाँ लोड हो रही हैं" (Previous visit found — loading past medications)
- "आगे बढ़ें" (Proceed) button — large, teal, centered

DESIGN: Dark overlay behind the camera frame for focus. Green success state feels celebratory but calm. Keep the same font system.
```

### Prompt 1D: Returning Patient Shortcut Screen

```
Design a returning patient shortcut screen for MediKiosk. This appears when ABHA scan detects a previous visit on file.

CONTEXT: Instead of repeating the full intake, this screen confirms what's already known and asks only what changed.

LAYOUT (full-screen):

TOP:
- "वापसी में स्वागत है, राजेश जी" (Welcome back, Rajesh ji) — warm greeting, large
- Last visit date: "पिछली विज़िट: 15 जनवरी 2026, AIIMS दिल्ली"

MAIN — "CONFIRM OR UPDATE" CARDS (scrollable vertical list):

Card 1 — Current Medications:
- Header: "क्या आप अभी भी ये दवाइयाँ ले रहे हैं?" (Are you still taking these medicines?)
- Listed items with checkboxes (pre-checked):
  ☑ Metformin 500mg — twice daily
  ☑ Ecosprin 75mg — once daily
  ☑ Atorvastatin 10mg — at bedtime
- Each item has a small "बदलें" (Change) link
- Bottom of card: "+ नई दवाई जोड़ें" (Add new medicine) button

Card 2 — Prakriti (if Ayurvedic mode was used last time):
- "पिछला प्रकृति आकलन: वात-पित्त" (Previous Prakriti: Vata-Pitta)
- Two buttons: "सही है" (Correct) ✓ | "बदलाव हुआ है" (Changed) ✎

Card 3 — Allergies:
- "ज्ञात एलर्जी: पेनिसिलिन" (Known allergy: Penicillin)
- "सही है" ✓ | "बदलें" ✎

BOTTOM:
- Primary button: "सब सही है — आगे बढ़ें" (All correct — proceed) — large, teal
- Secondary: "पूरी हिस्ट्री दोबारा लें" (Retake full history) — text link

DESIGN: Cards have a soft green left-border indicating "confirmed/known data." Changed items flip to saffron left-border. Clean, spacious, easy for elderly patients.
```

---

## SCREEN 2 — DUAL-MODE INTERACTIVE HISTORY ELICITATION

### Prompt 2A: Main Intake Screen (Allopathic SOCRATES Mode)

```
Design the main voice + touch patient intake screen for MediKiosk in Allopathic (SOCRATES) mode.

CONTEXT: The patient is standing at a kiosk, speaking about their symptoms. The system transcribes their speech in real-time, asks adaptive follow-up questions via TTS, and also offers touch-based input for each question. This is the core interaction screen — the patient spends 3-5 minutes here.

LAYOUT (full-screen, portrait):

TOP BAR (8%):
- Left: Back arrow + "MediKiosk" small logo
- Center: Mode toggle pill — two segments: [एलोपैथी | Allopathic] (active, teal fill) and [आयुर्वेद | Ayurvedic] (inactive, outlined). Tappable to switch.
- Right: Emergency badge — small red dot with "🛡️" icon. If red-flag detected, this pulses and expands into a red banner. Currently dormant (gray).

SECTION 1 — PROGRESS BAR (5%):
- Horizontal stepper: "प्रश्न 3 / ~8" (Question 3 of ~8)
- Small dots or segmented bar showing progress through SOCRATES: S-O-C-R-A-T-E-S, with current segment highlighted
- Below progress: current SOCRATES parameter label: "Character — दर्द कैसा है?" (What does the pain feel like?)

SECTION 2 — LIVE VOICE INTERACTION (35%):
- A large waveform visualization (horizontal, teal gradient) showing live audio input — animated bars that respond to voice volume
- Below waveform: live transcript appearing word by word:
  "मुझे सीने में जलन जैसा दर्द है, तीन दिन से..."
  (I have a burning-type pain in my chest, for three days...)
- Transcript area has a subtle white card background with rounded corners
- Small microphone icon pulsing at the left of the transcript: "🎙️ सुन रहा हूँ..." (Listening...)
- A "Repeat question" button (circular, with a 🔄 icon) — floats at the bottom-right of this section. Tooltip: "डबल-टैप करें — सवाल दोबारा सुनें" (Double-tap to hear the question again)

SECTION 3 — TOUCH FALLBACK GRID (35%):
- Heading: "या नीचे से चुनें" (Or choose from below)
- A grid of large, icon-based touch cards for the current SOCRATES parameter. For "Character" (what the pain feels like), show 6 cards in a 3x2 grid:
  - 🔥 जलन (Burning) — icon of a flame
  - ⚡ तेज़/चुभन (Sharp/Stabbing) — icon of a lightning bolt
  - 🪨 भारीपन (Dull/Heavy) — icon of a weight
  - 🔨 धड़कता (Throbbing) — icon of a heartbeat
  - 🤏 दबाव (Pressure/Squeezing) — icon of a clamp
  - ❓ कुछ और (Something else) — icon of a speech bubble
- Each card: 100x100px minimum, white background, rounded-xl, icon on top (48px), Hindi label below (bold), English label below that (small, gray)
- Selected state: teal border, light teal fill, checkmark overlay

SECTION 4 — BOTTOM ACTION BAR (17%):
- Left: "⏸️ रोकें" (Pause) button — outlined
- Center: Large circular microphone button (teal, 72px) — tap to start/stop recording. Active state: red ring around it
- Right: "अगला सवाल →" (Next Question) button — solid teal, prominent
- Below buttons: tiny text "🔊 आवाज़ ऊँची करें" (Increase volume) — tappable

DESIGN REQUIREMENTS:
- Background: light warm gray (#F8FAFC)
- Waveform uses teal gradient (#0D7377 to #0EA5E9)
- Touch cards must be large enough for elderly patients with imprecise taps
- The mode toggle must be visually prominent — a Vaidya glancing at this screen from 3 feet away must be able to confirm which mode is active
- The red-flag badge in top-right is always visible but dormant unless triggered
- All text bilingual: Hindi primary, English secondary
```

### Prompt 2B: Intake Screen (Ayurvedic Dashavidha Pariksha Mode)

```
Design the MediKiosk intake screen in Ayurvedic Dashavidha Pariksha mode. Same layout structure as the Allopathic mode but with Ayurvedic-specific content.

DIFFERENCES FROM ALLOPATHIC MODE:
- Mode toggle: [आयुर्वेद | Ayurvedic] is now active (filled with saffron #F4A423 instead of teal)
- Background accent shifts subtly: very light saffron tint instead of teal tint
- Progress bar shows 10 Dashavidha parameters instead of SOCRATES:
  प्रकृति → विकृति → सार → संहनन → प्रमाण → सात्म्य → सत्त्व → आहार शक्ति → व्यायाम शक्ति → वय
  Current: "प्रकृति — आपका शरीर किस प्रकार का है?" (Prakriti — What is your body type?)

TOUCH FALLBACK GRID for Prakriti assessment shows 3 large cards (1x3 vertical):
- 🌬️ वात प्रकृति (Vata) — "हल्का शरीर, सूखी त्वचा, तेज़ मन" (Light body, dry skin, quick mind) — icon of wind/air
- 🔥 पित्त प्रकृति (Pitta) — "मध्यम शरीर, गर्म, तेज़ पाचन" (Medium body, warm, sharp digestion) — icon of fire
- 🌊 कफ प्रकृति (Kapha) — "भारी शरीर, तैलीय त्वचा, शांत" (Heavy body, oily skin, calm) — icon of water/earth

Each card is taller than the allopathic cards — includes a 2-line description of the dosha characteristics to help the patient self-identify.

Additional element: Below the touch grid, a small expandable section:
"🤔 समझ नहीं आ रहा?" (Not sure?) — tapping this triggers a short TTS explanation of the three doshas and shows a simple body illustration for each type.

BOTTOM BAR: Same as allopathic mode but the primary accent color is saffron instead of teal.

MODE SWITCH SUGGESTION (conditional overlay):
If the patient describes symptoms that sound allopathic (like "chest pain," "diabetes"), show a subtle banner at the top:
"💡 ऐसा लगता है कि एलोपैथिक आकलन भी उपयोगी होगा — अभी बदलें?" (Looks like an allopathic assessment may also help — switch now?)
Two buttons: "हाँ, बदलें" (Yes, switch) | "नहीं, आयुर्वेद जारी रखें" (No, continue Ayurveda)
```

### Prompt 2C: Red-Flag Emergency Alert State (Overlay on Screen 2)

```
Design the emergency red-flag alert overlay that appears on the MediKiosk intake screen when the system detects emergency keywords (chest pain + sweating, stroke signs, severe dyspnea, anaphylaxis).

CONTEXT: The CPU-based spaCy NER engine detected "chest pain with sweating" in the transcript. This alert fires in <500ms, interrupting the normal intake flow. It must be impossible to miss.

OVERLAY LAYOUT:
- Full-screen semi-transparent red overlay (rgba(220, 38, 38, 0.15)) over the existing intake screen
- Center: Large white card (80% width, auto height) with red top border (8px):

  CARD CONTENT:
  - Top: Red triangle warning icon (⚠️) — large, 64px, animated pulse
  - Heading: "🚨 आपातकालीन चेतावनी" (EMERGENCY ALERT) — bold, red, 28px
  - Body: "सीने में दर्द + पसीना — संभावित हृदय आपात स्थिति" (Chest pain + sweating — possible cardiac emergency) — 18px
  - Subtext: "नर्स को सूचना भेजी जा रही है..." (Notifying nurse...) with a spinning loader
  - Divider line
  - "Nurse Console: Priority 1 alert sent at 10:42:15 AM" — monospace, small, gray (technical detail for demo purposes)

  CARD ACTIONS:
  - "🏥 तुरंत सहायता चाहिए" (Need immediate help) — large red button
  - "✕ यह गलत अलर्ट है — जारी रखें" (This is a false alert — continue) — text link below, smaller

DESIGN:
- The background intake screen is visible but dimmed
- The alert card has a subtle red glow/shadow
- An audio chime icon in the card corner indicates a sound was played
- The animation is urgent but not panic-inducing — pulsing, not flashing
```

---

## SCREEN 3 — DOCUMENT SCANNING & OCR STATION

### Prompt 3A: Document Scanner Main Screen

```
Design the document scanning screen for MediKiosk where patients scan their paper prescriptions, lab reports, or discharge summaries using the kiosk's camera.

CONTEXT: After voice intake, the patient is prompted to scan any paper records they brought. Many patients have crumpled, faded prescriptions in regional scripts. The screen must guide them through proper camera positioning.

LAYOUT (full-screen, portrait):

TOP BAR (8%):
- Back arrow, "MediKiosk" logo, step indicator: "चरण 3/4 — दस्तावेज़ स्कैन" (Step 3/4 — Document Scan)

SECTION 1 — CAMERA VIEWPORT (50%):
- Large camera preview area (16:9 aspect ratio, rounded corners, 2px teal border)
- Overlay on camera: Document corner guide brackets (four L-shaped corners in white, with dashed lines connecting them showing the ideal document placement zone)
- Auto-framing indicator: 
  - If document not detected: Yellow bracket corners + text "दस्तावेज़ को फ़्रेम में रखें" (Place document in frame)
  - If document detected and aligned: Green bracket corners + text "✓ अच्छा! स्थिर रखें..." (Good! Hold steady...)
  - If too dark: Warning icon + "🔦 रोशनी बढ़ाएँ" (Increase lighting)
  - If too tilted: Tilt icon + "📐 सीधा करें" (Straighten the document)

SECTION 2 — CONTROLS (15%):
- Large circular capture button (72px, teal) — "📸 स्कैन करें" (Scan)
- Two smaller buttons flanking:
  - Left: "🔦 फ़्लैश" (Flash toggle)
  - Right: "🔄 फ़्लिप" (Camera flip — front/back)
- Below: Document type selector (horizontal pill toggle):
  [पर्चा | Prescription] (default) — [लैब रिपोर्ट | Lab Report] — [डिस्चार्ज | Discharge Summary]

SECTION 3 — SCANNED DOCUMENTS QUEUE (20%):
- Horizontal scrollable thumbnail strip showing previously scanned pages
- Each thumbnail: small preview image + page number + confidence badge (green ✓ or yellow ⚠️)
- Last position in strip: a "+" card with dashed border: "एक और पेज जोड़ें" (Add another page)

BOTTOM BAR (7%):
- "⏭️ कोई दस्तावेज़ नहीं — छोड़ें" (No documents — Skip) — clearly visible text button, NOT hidden
- "आगे बढ़ें →" (Proceed) — teal button, only enabled when at least one scan is captured

DESIGN:
- Camera area dominates the screen — the patient's primary task is positioning the paper
- Lighting/tilt indicators are large and use icons, not just text
- The "Skip" button is prominent — untested skip paths cause demo failures
- The "Add another page" nudge appears immediately after each successful scan
```

### Prompt 3B: OCR Results — Entity Cards Review Screen

```
Design the OCR extraction results screen for MediKiosk, shown after a prescription is successfully scanned and processed.

CONTEXT: PaddleOCR has segmented the text, Qwen2-VL-2B has extracted drug entities. The patient sees what the machine understood and can flag errors before the data goes to the doctor.

LAYOUT (full-screen):

TOP:
- "स्कैन परिणाम" (Scan Results) — heading
- Scanned document thumbnail (small, top-right, tappable to view full-size)

MAIN — ENTITY CARDS (scrollable vertical list):
Each extracted item is a card:

Card 1 (HIGH CONFIDENCE — 97%):
- Left: Green confidence badge "97%" with ✓ icon
- Center:
  - Drug name: "Tab Ecosprin 75mg" — bold, large
  - Dose: "75mg" — teal tag
  - Frequency: "OD (Once Daily)" — gray tag
  - Route: "Oral" — gray tag
- Right: "✓ सही" (Correct) default state
- Bottom-right: small "✏️ बदलें" (Edit) link

Card 2 (HIGH CONFIDENCE — 94%):
- Same structure: "Tab Atorvastatin 10mg | 10mg | HS (At Bedtime) | Oral"

Card 3 (LOW CONFIDENCE — 62%, FLAGGED):
- Left: Yellow/amber confidence badge "62%" with ⚠️ icon
- Center:
  - Drug name: "Tab M_t_or_in ?00mg" — partially garbled text shown with underscores
  - Yellow highlighted text: "⚠️ ड्राफ़्ट — डॉक्टर सत्यापित करेंगे" (Draft — Doctor will verify)
- Right: "✏️ सही करें" (Correct this) — amber button
- Card has amber left-border and light amber background

Card 4 (LAB VALUE — if lab report scanned):
- Left: Blue badge with lab flask icon
- Center:
  - Test: "HbA1c" — bold
  - Value: "6.8%" — large
  - Reference range: "Normal: 4.0-5.6%" — small gray
  - Status: "⬆️ High" — red tag (out of range)
- Lab values get special formatting to highlight abnormals

BOTTOM:
- Summary bar: "3 दवाइयाँ मिलीं, 1 की पुष्टि बाकी" (3 medications found, 1 needs confirmation)
- "आगे बढ़ें →" (Proceed to summary) — teal button
- "एक और दस्तावेज़ स्कैन करें" (Scan another document) — outlined button

DESIGN:
- Per-item confidence badges — not per-document — because one clear line and one illegible line on the same prescription need different treatment
- Low-confidence items are visually distinct (amber) but not alarming
- The patient doesn't need to fix anything — just flag or proceed. The doctor handles corrections.
```

---

## SCREEN 4 — NURSE PRIORITY TRIAGE CONSOLE

### Prompt 4A: Nurse Queue Dashboard

```
Design the Nurse Triage Console for MediKiosk — a dark-themed clinical dashboard displayed on a separate monitor at the nursing station.

CONTEXT: This is NOT patient-facing. It's a professional clinical UI for the triage nurse monitoring the OPD queue. It shows all patients currently in the intake pipeline, with real-time priority alerts. The nurse needs to see emergencies within 500ms of detection.

LAYOUT (landscape, 1920x1080 desktop):

TOP BAR:
- Left: "MediKiosk — Nurse Triage Console" with a nurse cap icon
- Center: Live clock and date: "28 Aug 2026, 10:42 AM"
- Right: Shift info "Morning Shift — Sister Priya" + notification bell (red badge count: 1)

LEFT SIDEBAR (20% width):
- Queue statistics cards (stacked):
  - "Waiting: 12" — white on dark card
  - "In Progress: 3" — teal accent
  - "Critical: 1" — red accent with pulse animation
  - "Completed Today: 47" — green accent
- Divider
- Filter buttons: [All] [Critical] [Ayurvedic] [Allopathic]
- Divider
- "Shift Handoff Summary" button — at bottom of sidebar

MAIN AREA (80% width) — PATIENT QUEUE TABLE:

Priority-sorted list (most urgent at top):

ROW 1 — CRITICAL (red background stripe):
- Priority: Large "P1" badge, red, pulsing
- Token: "OPD-0042"
- Patient: "R. Kumar" (partially masked)
- Chief Complaint: "सीने में दर्द + पसीना" (Chest pain + sweating)
- Alert: "🚨 CARDIAC — 10:41:52 AM" — red text, bold
- Kiosk: "Kiosk 3"
- Time in queue: "00:47" — red (urgent)
- Actions: [🏥 ER Route] [👁️ View Details] [✕ Dismiss Alert]

ROW 2 — ROUTINE (normal):
- Priority: "P3" badge, gray
- Token: "OPD-0041"
- Patient: "S. Devi"
- Chief Complaint: "Joint pain, 2 weeks"
- Alert: None
- Kiosk: "Kiosk 1"
- Time in queue: "03:12"
- Actions: [👁️ View] [⬆️ Prioritize]

ROW 3 — ROUTINE (Ayurvedic):
- Priority: "P3" badge, gray
- Token: "OPD-0040"
- Patient: "M. Rao"
- Chief Complaint: "Digestive issues — Ayurvedic"
- Alert: None — but a saffron dot indicating Ayurvedic mode
- Actions: [👁️ View] [⬆️ Prioritize]

(Additional rows following same pattern)

EMERGENCY BANNER (appears at very top of main area when a P1 fires):
- Full-width red banner:
  "🚨 PRIORITY 1: Token OPD-0042 — Chest Pain + Sweating — Kiosk 3 — ACTION REQUIRED"
- Two buttons: [🏥 Route to ER] [⏱️ Acknowledged — 15 min] 
- Banner slides down from top with urgency animation
- Audio chime indicator icon

BOTTOM BAR:
- "Add Vitals" quick-entry: [BP: ___/___] [Pulse: ___] [SpO2: ___] [Temp: ___°F]
- "Override Queue" button — moves a patient to top
- "Refresh" auto-refresh indicator: "Auto-updating every 5 seconds"

DESIGN:
- Dark theme: background #0F172A, cards #1E293B, text white/gray
- Critical rows have red left-border (4px) and subtle red background tint
- Ayurvedic patients have a small saffron leaf icon next to their row
- The P1 alert banner must be the most visually dominant element when active
- Dense but scannable — nurse must read the one-line reason in <2 seconds
- No decorative elements — pure clinical efficiency
```

### Prompt 4B: Shift Handoff Summary Modal

```
Design a shift handoff summary modal for the MediKiosk Nurse Console. This appears when a nurse taps "Shift Handoff Summary" at shift change.

MODAL (centered, 600x500px, dark theme):

HEADER:
- "Shift Handoff — Morning → Afternoon" with a handshake icon
- "Sister Priya → Sister Kavita" — names of outgoing and incoming nurse

CONTENT:
Section 1 — Open Red Flags:
- "1 unresolved alert:"
  - "OPD-0042: Chest pain — awaiting ER routing since 10:42 AM (18 min ago)" — red text
  - Action: [Route Now] [Transfer to incoming nurse]

Section 2 — Shift Statistics:
- Patients processed: 47
- Average wait time: 4.2 min
- Red flags triggered: 3 (2 dismissed, 1 open)
- Ayurvedic intakes: 12 | Allopathic: 35

Section 3 — Notes:
- Free-text area: "Kiosk 2 had OCR issues with faded prescriptions — flag for IT"

FOOTER:
- "Confirm Handoff" — teal button
- "Cancel" — outlined
```

---

## SCREEN 5 — DOCTOR/VAIDYA CONSULTATION DASHBOARD

### Prompt 5A: Doctor Dashboard — Allopathic SOAP View

```
Design the Doctor/Physician Consultation Dashboard for MediKiosk — the highest-value screen in the entire system. This is shown on the physician's desktop/tablet when the next patient's pre-populated draft appears.

CONTEXT: The patient has completed intake at the kiosk. The doctor sees an auto-generated SOAP draft, OCR-extracted medications, and any red-flag alerts — all BEFORE the patient sits down. The doctor reviews in ~15 seconds, makes edits, then locks and exports. AI assists, never replaces clinical judgment.

LAYOUT (landscape, 1920x1080, dark theme):

TOP BAR:
- Left: "MediKiosk — Physician Dashboard" + doctor icon
- Center: Patient identifier: "Token OPD-0042 | ABHA: ****-****-7890" (partially masked)
- Right: Mode badge [एलोपैथी | Allopathic] in teal pill + "Next Patient" button

DISCREPANCY BANNER (conditional — only shown if voice ≠ document conflict):
- Yellow banner below top bar:
  "⚠️ विसंगति: रोगी ने 'कोई दवाई नहीं' कहा, लेकिन OCR में Metformin 500mg मिला"
  (Discrepancy: Patient said 'no current meds' but OCR found Metformin 500mg)
- Two buttons: [Accept OCR] [Accept Patient Statement] [Ask Patient]

LEFT PANEL (30% width) — PATIENT CONTEXT:
- Card 1 — Demographics:
  - Name: Rajesh Kumar | Age: 52 | Gender: M
  - ABHA: Linked ✓
  - Language: Hindi
  - Visit Type: Follow-up (returning patient badge)

- Card 2 — Current Medications (from OCR):
  Each med as a compact row:
  - ✓ Ecosprin 75mg OD — [97% confidence] green dot
  - ✓ Atorvastatin 10mg HS — [94%] green dot
  - ⚠️ Metformin ?00mg BD — [62%] amber dot, "Verify" link

- Card 3 — Lab Values (if scanned):
  - HbA1c: 6.8% ⬆️ (highlighted red — out of range)
  - Creatinine: 1.1 mg/dL ✓
  - Lipid Panel: Pending

- Card 4 — Red-Flag Status:
  - "🚨 Chest pain + sweating detected at intake"
  - Or "✓ No red flags" in green

CENTER PANEL (45% width) — EDITABLE SOAP DRAFT:
- Header: "Draft Clinical Summary" with a pencil icon
- Status badge: "🔓 DRAFT — Editing" (amber) or "🔒 LOCKED — Exported" (green)

Four collapsible sections, each with an expand/collapse toggle:

S — Subjective:
"52-year-old male presents with burning chest pain for 3 days, non-radiating, aggravated by exertion, relieved by rest. No associated dyspnea, nausea, or diaphoresis at current examination. Reports compliance with current medications. History of Type 2 DM (HbA1c 6.8%)."
- Editable textarea — physician can type directly
- "Why did the AI say this?" expand link → shows source: "Line 3 of voice transcript: 'मुझे सीने में जलन जैसा दर्द है...'"

O — Objective:
"[Awaiting physician examination]"
- Empty editable field — physician fills this during consultation

A — Assessment:
"Atypical chest pain — rule out GERD vs. ACS. Suboptimal glycemic control (HbA1c 6.8%)."
- Editable
- "Why?" provenance expand → "Derived from: OCR lab value HbA1c 6.8% + voice complaint of burning chest pain"

P — Plan:
"[Physician to complete]"
- Editable

RIGHT PANEL (25% width) — ACTIONS:
- "Lock Draft" button — large, teal. Locks the SOAP note and disables editing
- "Export FHIR →" button — appears after locking, green
- "Clear Session" button — red outlined, triggers DPDP purge
- Divider
- "Patient Queue" — small list showing next 3 patients in line
- Divider
- "View FHIR JSON" toggle — for demo: shows raw JSON output in monospace

PROVENANCE EXPAND (appears inline when doctor taps "Why did the AI say this?" next to any auto-filled field):
- Light overlay card showing:
  - Source type icon (🎙️ Voice or 📄 Document)
  - Original text: "Transcript line 3: 'मुझे सीने में जलन जैसा दर्द है, तीन दिन से, मेहनत करने पर बढ़ता है'"
  - Confidence: 94%
  - Collapse link: "✕ Close"

DESIGN:
- Dark theme (#0F172A background) — reduces eye strain for doctors working long shifts
- SOAP sections have a slight left-border color coding: S=blue, O=gray, A=amber, P=green
- Editable fields have a subtle dashed border; locked fields have solid border
- The discrepancy banner is the FIRST thing the doctor sees — it must be above the fold
- Dense but organized — this is a clinical tool, not a patient-facing UI
- Provenance expand is cheap to build (data already exists from pipeline) and is the #1 trust builder
```

### Prompt 5B: Vaidya Dashboard — Dashavidha Pariksha Grid View

```
Design the Ayurvedic Vaidya Dashboard variant of Screen 5 for MediKiosk. Same layout structure as the doctor dashboard but with Dashavidha Pariksha grid replacing the SOAP format.

DIFFERENCES FROM ALLOPATHIC DASHBOARD:

MODE BADGE: [आयुर्वेद | Ayurvedic] in saffron pill (not teal)

CENTER PANEL replaces SOAP with DASHAVIDHA PARIKSHA GRID:
- Header: "दशविध परीक्षा आकलन" (Dashavidha Pariksha Assessment) — saffron accent
- 10 parameter cards in a 2x5 grid (or 5x2), each card contains:

Card 1 — प्रकृति (Prakriti):
- AI Assessment: "वात-पित्त" (Vata-Pitta) — bold, large
- Confidence: 92%
- One-click override dropdown: [वात | पित्त | कफ | वात-पित्त | पित्त-कफ | वात-कफ | त्रिदोष]
- "Why?" provenance link
- Status: ✓ Confirmed | ✏️ Override pending

Card 2 — विकृति (Vikriti):
- AI Assessment: "पित्त वृद्धि" (Pitta Increase)
- Same structure

Card 3 — अग्नि (Agni):
- AI Assessment: "मन्द" (Manda / Sluggish)
- Dropdown: [तीक्ष्ण | मन्द | सम | विषम]

Card 4 — कोष्ठ (Koshtha):
- AI Assessment: "क्रूर" (Krura / Hard)
- Dropdown: [क्रूर | मध्य | मृदु]

Card 5 — सार (Sara):
- AI Assessment: "रस सार" (Rasa Sara)
- Dropdown: [रस | रक्त | मांस | मेद | अस्थि | मज्जा | शुक्र]

Cards 6-10: Samhanana, Pramana, Satmya, Sattva, Ahara Shakti, Vyayama Shakti, Vaya — same structure with appropriate options

OVERRIDE LOGGING:
When a Vaidya changes any parameter (e.g., changes Prakriti from "Vata-Pitta" to "Pitta-Kapha"):
- The card border flashes saffron
- A small log entry appears: "✏️ Overridden by Dr. Sharma at 10:45 AM"
- Original AI value shown as strikethrough: "~~वात-पित्त~~ → पित्त-कफ"

RIGHT PANEL additions:
- "Dual Assessment" toggle (stretch goal): "Run SOCRATES too?" — enables both frameworks on same transcript
- FHIR export includes the Dashavidha section in the Composition

DESIGN:
- Saffron accent color throughout instead of teal
- Dashavidha cards have a subtle mandala-inspired border pattern (thin, decorative but not distracting)
- The grid is dense but each card is scannable in <2 seconds
- Override dropdowns are large enough for touch use on a tablet
```

---

## SCREEN 6 — FHIR EXPORT & CONFIRMATION

### Prompt 6A: Export Confirmation Screen

```
Design the FHIR Export & Session Purge confirmation screen for MediKiosk. This appears after the doctor locks and exports the clinical summary.

CONTEXT: This is the COMPLIANCE moment of the entire system. It proves DPDP Act adherence and ABDM FHIR validity to judges. Making it explicit (its own screen) is worth more than folding it into a button click.

LAYOUT (landscape, desktop, dark theme):

TOP:
- "Export & Privacy Confirmation" heading with a shield + checkmark icon

CENTER — THREE STATUS CARDS (horizontal row):

Card 1 — FHIR Schema Validation:
- Large green checkmark icon (animated draw)
- "FHIR R4 Composition — Valid ✓"
- Schema badge: "HL7 FHIR R4 v4.0.1"
- "Validated against HAPI FHIR R4 endpoint" — small gray text
- Bottom: "View FHIR JSON" toggle button — tapping shows a code block:
  ```json
  {
    "resourceType": "Bundle",
    "type": "document",
    "entry": [{ "resource": { "resourceType": "Composition", "status": "final", ... }}]
  }
  ```
  (Truncated, scrollable, syntax-highlighted in monospace)

Card 2 — Export Destinations:
- Two rows with status:
  - "🏥 Hospital HIS: Pushed ✓" — green
  - "🆔 ABHA PHR (Patient Record): Linked ✓" — green
- If export failed: "🏥 Hospital HIS: Queued ⏳" — amber with "Retry" button
  - "HIS offline — FHIR bundle encrypted and queued. Will auto-retry on reconnect."

Card 3 — Session Data Purge:
- Large lock icon with a sweep animation
- "Session Purged ✓" — green
- Checklist:
  - ☑ Voice audio buffers: Cleared
  - ☑ Transcript text: Cleared
  - ☑ Document images: Cleared
  - ☑ OCR working memory: Cleared
  - ☑ LLM context window: Cleared
- "DPDP Act 2023 Compliant" badge — with government emblem
- Timestamp: "Purged at 10:47:23 AM IST"

BOTTOM:
- "Next Patient →" — large teal button
- "Print Summary" — outlined button (prints a paper copy for patient)
- "View Purge Log" — small text link (for admin audit trail)

DESIGN:
- Each card has a sequential animation: Validate → Export → Purge, playing left to right with 500ms delays
- Green success states dominate — this screen should feel conclusive and trustworthy
- The FHIR JSON toggle is specifically for the demo — judges want to SEE the schema-valid output
- The purge confirmation is not just a status — it's proof of compliance
```

---

## SCREEN 7 — ADMIN / FLEET ANALYTICS DASHBOARD

### Prompt 7A: Admin Analytics Dashboard (Can Be Mocked with Static Data)

```
Design a Fleet & Analytics Dashboard for MediKiosk — used by Hospital Administrators and Ministry of Ayush officials to monitor kiosk deployment health, patient throughput, and compliance.

CONTEXT: This screen answers "how does the Ministry know this is working at scale?" — a guaranteed judge question. For the hackathon, it can use mocked data from the 50-case pilot. It does NOT need to be wired to real-time data.

LAYOUT (landscape, 1920x1080, light theme):

TOP BAR:
- "MediKiosk — Admin Dashboard" with a chart icon
- Hospital name: "AIIMS Delhi — OPD Block A"
- Date range selector: [Today] [This Week] [This Month] — pill toggle
- "Export CSV" and "Export PDF" buttons — top right

ROW 1 — KPI CARDS (4 cards, horizontal):

Card 1: "Patients Today"
- Large number: "127"
- Trend: "↑ 23% vs last week" — green arrow
- Sparkline mini-chart showing last 7 days trend

Card 2: "Avg Intake Time"
- "4.2 min"
- Trend: "↓ 18% from baseline 5.1 min" — green (lower is better)

Card 3: "Red-Flag Rate"
- "2.4%"
- "3 alerts today (2 true, 1 false positive)"
- Small donut chart: green=routine, red=critical

Card 4: "FHIR Export Success"
- "98.4%"
- "125/127 successful, 2 queued"
- Green status dot

ROW 2 — CHARTS (2 charts side by side):

Chart 1 (60% width): "Daily Patient Throughput — Last 30 Days"
- Bar chart with daily patient counts
- Two colors: teal=Allopathic, saffron=Ayurvedic
- Y-axis: patient count, X-axis: dates

Chart 2 (40% width): "Intake Mode Distribution"
- Donut chart:
  - Allopathic: 68% (teal)
  - Ayurvedic: 24% (saffron)
  - Dual Assessment: 8% (purple)

ROW 3 — TWO PANELS:

Panel 1 (50% width): "Kiosk Fleet Status"
- Table:
  | Kiosk | Status | VRAM | Uptime | Patients Today |
  | Kiosk 1 | 🟢 Online | 5.1/6.0 GB | 99.8% | 42 |
  | Kiosk 2 | 🟢 Online | 5.3/6.0 GB | 99.2% | 38 |
  | Kiosk 3 | 🟡 Warning | 5.8/6.0 GB | 97.1% | 31 |
  | Kiosk 4 | 🔴 Offline | — | 0% (since 9:15 AM) | 16 |

Panel 2 (50% width): "DPDP Purge Compliance Log"
- Table:
  | Time | Patient Token | Purge Status | FHIR Export |
  | 10:47 AM | OPD-0042 | ✅ Purged | ✅ Exported |
  | 10:39 AM | OPD-0041 | ✅ Purged | ✅ Exported |
  | 10:32 AM | OPD-0040 | ✅ Purged | ⏳ Queued |
  | ... | ... | ... | ... |
- "100% purge compliance — 0 violations" — green badge at bottom

ROW 4 — LANGUAGE BREAKDOWN (small, bottom):
- Horizontal bar chart showing usage by language:
  Hindi: 45% | Telugu: 22% | English: 18% | Tamil: 10% | Kannada: 5%
- Insight text: "Telugu TTS quality flagged — 3 patients switched to touch-only mode"

DESIGN:
- Light theme (#F8FAFC background) — admin screens are used in well-lit offices
- KPI cards have white background, subtle shadow, rounded corners
- Charts use the brand colors: teal for allopathic, saffron for Ayurvedic, red for alerts
- The DPDP Purge Log is the key compliance proof — make it prominently visible
- Dense but not cluttered — think Google Analytics, not a cockpit
- All numbers can be mocked with realistic pilot data for the demo
```

---

## BONUS SCREENS

### Prompt 8: Patient Summary Receipt Screen (Post-Consultation)

```
Design a simple patient-facing receipt/summary screen shown on the kiosk AFTER the doctor has completed the consultation and the FHIR export is done.

CONTEXT: The patient walks back past the kiosk on their way out. The screen shows a simple confirmation that their records were saved.

LAYOUT (full-screen, portrait, patient-facing):

CENTER:
- Large green checkmark animation
- "आपका रिकॉर्ड सुरक्षित है ✓" (Your record is saved ✓) — large, warm
- "ABHA से जोड़ा गया" (Linked to ABHA) — if ABHA was used
- Visit summary in plain language:
  - "आज की शिकायत: सीने में जलन" (Today's complaint: Chest burning)
  - "दवाइयाँ रिकॉर्ड: 3" (Medications recorded: 3)
  - "अगला कदम: डॉक्टर ने जाँच सुझाई है" (Next step: Doctor suggested tests)
- "कोई भी आवाज़ या तस्वीर सेव नहीं हुई है" (No voice or images were saved) — small, with lock icon

BOTTOM:
- "नई विज़िट शुरू करें" (Start New Visit) — returns to Screen 1
- QR code: "ABHA ऐप में अपना रिकॉर्ड देखें" (View your record in ABHA app) — links to ABHA PHR

DESIGN: Warm, reassuring, minimal. Large text. Green + white only. The patient should feel respected, not processed.
```

### Prompt 9: Error/Offline Fallback Screen

```
Design a graceful error state screen for MediKiosk kiosk when the GPU crashes, a model fails to load, or the system enters degraded mode.

LAYOUT (full-screen, portrait):

CENTER:
- Amber warning icon (not red — red is for medical emergencies only)
- Heading: "सिस्टम धीमा चल रहा है" (System is running slowly) — not "Error" or "Crashed"
- Subtext: "कुछ सुविधाएँ अस्थायी रूप से उपलब्ध नहीं हैं" (Some features are temporarily unavailable)

STATUS CARDS showing what works and what doesn't:
- ✅ Voice recording: Working
- ✅ Document scanning: Working
- ⚠️ AI summary: Delayed (using backup)
- ❌ Ayurvedic assessment: Temporarily unavailable

BOTTOM:
- "जारी रखें — डॉक्टर ट्रांसक्रिप्ट देखेंगे" (Continue — Doctor will see the transcript directly) — teal button
- "कर्मचारी को बुलाएँ" (Call staff) — outlined button
- Technical detail in small text: "VRAM: 5.9/6.0 GB — Model offloaded to CPU fallback"

DESIGN: Calm, not alarming. The system is degrading gracefully, not crashing. Use amber tones, not red. The patient should feel guided, not abandoned.
```

### Prompt 10: Dual Assessment Toggle Confirmation (Stretch Goal)

```
Design a small confirmation modal that appears when a doctor enables "Dual Assessment" mode — running both SOCRATES (Allopathic) and Dashavidha Pariksha (Ayurvedic) frameworks on the same patient transcript.

MODAL (centered, 500x300px):

HEADER: "Dual Assessment Mode" with a split icon (half teal, half saffron)

BODY:
"This will generate BOTH an Allopathic SOAP summary AND an Ayurvedic Dashavidha Pariksha grid from the same patient transcript."

- "Same voice data, two clinical frameworks"
- "No additional patient interaction required"
- "Both assessments will appear in the FHIR export"

Visual: A small split-screen preview showing SOAP on the left and Dashavidha grid on the right, with a dotted line divider

FOOTER:
- "Enable Dual Mode" — gradient button (teal → saffron)
- "Cancel" — text link
```

---

## STITCH GENERATION ORDER (RECOMMENDED)

For a 36-hour hackathon, generate screens in this priority order:

| Priority | Screen | Stitch Prompt | Export to Code? |
|----------|--------|---------------|-----------------|
| 1 | Screen 5A — Doctor Dashboard (Allopathic) | Prompt 5A | YES — v0 for production code |
| 2 | Screen 2A — Voice Intake (Allopathic) | Prompt 2A | YES — v0 for production code |
| 3 | Screen 1A — Welcome/Language Select | Prompt 1A | YES — v0 |
| 4 | Screen 3A — Document Scanner | Prompt 3A | YES — v0 |
| 5 | Screen 6A — FHIR Export Confirmation | Prompt 6A | YES — v0 |
| 6 | Screen 3B — OCR Entity Cards | Prompt 3B | YES — v0 |
| 7 | Screen 4A — Nurse Console | Prompt 4A | YES — v0 |
| 8 | Screen 1B — ABHA Authentication | Prompt 1B | YES — v0 |
| 9 | Screen 5B — Vaidya Dashavidha Grid | Prompt 5B | YES — v0 |
| 10 | Screen 7A — Admin Dashboard | Prompt 7A | Stitch mock only — do not code |
| 11 | Screen 2B — Ayurvedic Intake Mode | Prompt 2B | Adapt from 2A |
| 12 | Screen 1C — QR Scanner | Prompt 1C | Build if time |
| 13 | Screen 1D — Returning Patient | Prompt 1D | Build if time |
| 14 | Screen 2C — Red-Flag Overlay | Prompt 2C | Build if time |
| 15 | Screen 8 — Patient Receipt | Prompt 8 | Stretch |
| 16 | Screen 9 — Error Fallback | Prompt 9 | Stretch |
| 17 | Screen 10 — Dual Assessment Modal | Prompt 10 | Stretch |
| 18 | Screen 4B — Shift Handoff Modal | Prompt 4B | Stretch |

**Time estimate:** ~2-3 hours in Stitch to generate all 18 screens → ~3-4 hours in v0 to convert the top 9 into React + Tailwind code → Total frontend generation: ~6 hours out of your 36.

---

*Generated for SIH26047 MediKiosk | All prompts calibrated against the master blueprint, in-depth spec document, judge Q&A playbook, and 36-hour roadmap.*
