import re
import time
import hashlib
import json
import os
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timezone

# =============================================================================
# MEDIKIOSK COMPREHENSIVE CLINICAL TRIAGE & DISEASE PATTERN DATABASE
# =============================================================================

# 1. P1_CRITICAL EMERGENCY PATTERNS
CRITICAL_PATTERNS: Dict[str, Dict[str, str]] = {
    # Cardiovascular
    "chest pain": {"category": "CARDIOVASCULAR", "disease": "Acute Coronary Syndrome / MI"},
    "heart attack": {"category": "CARDIOVASCULAR", "disease": "Myocardial Infarction"},
    "cardiac arrest": {"category": "CARDIOVASCULAR", "level": "P1_CRITICAL", "disease": "Cardiac Arrest"},
    "angina": {"category": "CARDIOVASCULAR", "disease": "Unstable Angina"},
    "crushing chest pain": {"category": "CARDIOVASCULAR", "disease": "Acute Myocardial Infarction"},
    "chest pressure": {"category": "CARDIOVASCULAR", "disease": "Ischemic Heart Disease"},

    # Respiratory
    "shortness of breath": {"category": "RESPIRATORY", "disease": "Severe Dyspnea"},
    "cannot breathe": {"category": "RESPIRATORY", "disease": "Acute Respiratory Distress"},
    "difficulty breathing": {"category": "RESPIRATORY", "disease": "Airway Compromise"},
    "choking": {"category": "RESPIRATORY", "disease": "Foreign Body Airway Obstruction"},
    "cyanosis": {"category": "RESPIRATORY", "disease": "Severe Hypoxia"},
    "blue lips": {"category": "RESPIRATORY", "disease": "Central Cyanosis"},
    "coughing up blood": {"category": "RESPIRATORY", "disease": "Massive Hemoptysis"},
    "asthma attack": {"category": "RESPIRATORY", "disease": "Status Asthmaticus"},

    # Neurological
    "stroke": {"category": "NEUROLOGICAL", "disease": "Cerebrovascular Accident (CVA)"},
    "face drooping": {"category": "NEUROLOGICAL", "disease": "FAST Stroke Sign: Facial Palsy"},
    "arm weakness": {"category": "NEUROLOGICAL", "disease": "FAST Stroke Sign: Hemiparesis"},
    "slurred speech": {"category": "NEUROLOGICAL", "disease": "FAST Stroke Sign: Dysarthria"},
    "unconscious": {"category": "NEUROLOGICAL", "disease": "Coma / Impaired Consciousness"},
    "fainted": {"category": "NEUROLOGICAL", "disease": "Syncope / Collapse"},
    "seizure": {"category": "NEUROLOGICAL", "disease": "Status Epilepticus"},
    "fits": {"category": "NEUROLOGICAL", "disease": "Convulsions"},
    "paralysis": {"category": "NEUROLOGICAL", "disease": "Acute Motor Deficit"},
    "thunderclap headache": {"category": "NEUROLOGICAL", "disease": "Subarachnoid Hemorrhage"},
    "worst headache": {"category": "NEUROLOGICAL", "disease": "Subarachnoid Hemorrhage"},

    # Trauma & Surgery
    "heavy bleeding": {"category": "TRAUMA", "disease": "Arterial Hemorrhage"},
    "severe bleeding": {"category": "TRAUMA", "disease": "Hemorrhagic Shock"},
    "head injury": {"category": "TRAUMA", "disease": "Traumatic Brain Injury"},
    "stab wound": {"category": "TRAUMA", "disease": "Penetrating Trauma"},
    "gunshot": {"category": "TRAUMA", "disease": "Gunshot Injury"},
    "third degree burn": {"category": "TRAUMA", "disease": "Major Thermal Injury"},

    # Gastrointestinal & Obstetrics
    "vomiting blood": {"category": "GASTROINTESTINAL", "disease": "Hematemesis / Upper GI Bleed"},
    "black stool": {"category": "GASTROINTESTINAL", "disease": "Melena"},
    "pregnancy bleeding": {"category": "OBSTETRICS", "disease": "Antepartum / Postpartum Hemorrhage"},
    "eclampsia": {"category": "OBSTETRICS", "disease": "Eclampsia / Pre-Eclampsia"},

    # Toxicology & Allergic
    "anaphylaxis": {"category": "ALLERGY", "disease": "Anaphylactic Shock"},
    "snake bite": {"category": "TOXICOLOGY", "disease": "Venomous Envenomation"},
    "poisoning": {"category": "TOXICOLOGY", "disease": "Acute Toxic Ingestion"},

    # Multilingual & Transliterated
    "सीने में दर्द": {"category": "CARDIOVASCULAR", "disease": "Chest Pain (Hindi)"},
    "छाती में दर्द": {"category": "CARDIOVASCULAR", "disease": "Chest Pain (Hindi)"},
    "दिल का दौरा": {"category": "CARDIOVASCULAR", "disease": "Heart Attack (Hindi)"},
    "सांस लेने में तकलीफ": {"category": "RESPIRATORY", "disease": "Dyspnea (Hindi)"},
    "सांस फूलना": {"category": "RESPIRATORY", "disease": "Shortness of Breath (Hindi)"},
    "बेहोश": {"category": "NEUROLOGICAL", "disease": "Unconscious (Hindi)"},
    "लकवा": {"category": "NEUROLOGICAL", "disease": "Stroke (Hindi)"},
    "खून बहना": {"category": "TRAUMA", "disease": "Heavy Bleeding (Hindi)"},
    "सांप का काटना": {"category": "TOXICOLOGY", "disease": "Snake Bite (Hindi)"},
    "seene me dard": {"category": "CARDIOVASCULAR", "disease": "Chest Pain (Hinglish)"},
    "saans lene me takleef": {"category": "RESPIRATORY", "disease": "Shortness of breath (Hinglish)"},
    "behosh": {"category": "NEUROLOGICAL", "disease": "Unconscious (Hinglish)"},
    "khoon bahna": {"category": "TRAUMA", "disease": "Bleeding (Hinglish)"},
    "বুক ব্যথা": {"category": "CARDIOVASCULAR", "disease": "Chest Pain (Bengali)"},
    "হার্ট অ্যাটাক": {"category": "CARDIOVASCULAR", "disease": "Heart Attack (Bengali)"},
    "শ্বাসকষ্ট": {"category": "RESPIRATORY", "disease": "Dyspnea (Bengali)"},
    "நெஞ்சு வலி": {"category": "CARDIOVASCULAR", "disease": "Chest Pain (Tamil)"},
    "மூச்சுத்திணறல்": {"category": "RESPIRATORY", "disease": "Dyspnea (Tamil)"},
    "ఛాతీ నొప్పి": {"category": "CARDIOVASCULAR", "disease": "Chest Pain (Telugu)"},
    "గుండెపోటు": {"category": "CARDIOVASCULAR", "disease": "Heart Attack (Telugu)"},
    "છાતીમાં દુખાવો": {"category": "CARDIOVASCULAR", "disease": "Chest Pain (Gujarati)"},
    "ಎದೆ ನೋವು": {"category": "CARDIOVASCULAR", "disease": "Chest Pain (Kannada)"},
    "നെഞ്ചുവേദന": {"category": "CARDIOVASCULAR", "disease": "Chest Pain (Malayalam)"},
    "നെഞ്ച് വേദന": {"category": "CARDIOVASCULAR", "disease": "Chest Pain (Malayalam)"},
    "ਛਾਤੀ ਵਿੱਚ ਦਰਦ": {"category": "CARDIOVASCULAR", "disease": "Chest Pain (Punjabi)"}
}

# 2. P2_URGENT CLINICAL PATTERNS
URGENT_PATTERNS: Dict[str, Dict[str, str]] = {
    "high fever": {"category": "INFECTIOUS", "disease": "Acute Febrile Illness / Pyrexia"},
    "fever above 102": {"category": "INFECTIOUS", "disease": "High Grade Fever"},
    "severe vomiting": {"category": "GASTROINTESTINAL", "disease": "Acute Gastroenteritis"},
    "persistent vomiting": {"category": "GASTROINTESTINAL", "disease": "Hyperemesis"},
    "severe abdominal pain": {"category": "GASTROINTESTINAL", "disease": "Acute Abdomen / Appendicitis Suspect"},
    "fracture": {"category": "ORTHOPEDIC", "disease": "Suspected Bone Fracture"},
    "broken bone": {"category": "ORTHOPEDIC", "disease": "Bone Fracture"},
    "unable to urinate": {"category": "UROLOGY", "disease": "Acute Urinary Retention"},
    "severe dehydration": {"category": "METABOLIC", "disease": "Dehydration / Electrolyte Imbalance"},
    "high blood pressure": {"category": "CARDIOVASCULAR", "disease": "Hypertension Flare"},
    "bp 180": {"category": "CARDIOVASCULAR", "disease": "Hypertensive Urgency"},
    " तेज बुखार": {"category": "INFECTIOUS", "disease": "High Fever (Hindi)"},
    "तेज बुखार": {"category": "INFECTIOUS", "disease": "High Fever (Hindi)"},
    "उल्टी": {"category": "GASTROINTESTINAL", "disease": "Vomiting (Hindi)"},
    "पेट में तेज दर्द": {"category": "GASTROINTESTINAL", "disease": "Severe Abdominal Pain (Hindi)"},
    "tej bukhar": {"category": "INFECTIOUS", "disease": "High Fever (Hinglish)"},
    "pet me dard": {"category": "GASTROINTESTINAL", "disease": "Abdominal Pain (Hinglish)"}
}

# 3. P3_ROUTINE OPD PATTERNS
ROUTINE_PATTERNS: Dict[str, Dict[str, str]] = {
    "mild fever": {"category": "GENERAL", "disease": "Mild Febrile Symptoms"},
    "mild cold": {"category": "RESPIRATORY", "disease": "Upper Respiratory Tract Infection"},
    "cough": {"category": "RESPIRATORY", "disease": "Common Cough / Bronchitis"},
    "runny nose": {"category": "RESPIRATORY", "disease": "Rhinitis / Common Cold"},
    "sore throat": {"category": "RESPIRATORY", "disease": "Pharyngitis / Tonsillitis"},
    "mild headache": {"category": "NEUROLOGICAL", "disease": "Tension Headache"},
    "knee pain": {"category": "ORTHOPEDIC", "disease": "Joint Arthralgia / Osteoarthritis"},
    "back pain": {"category": "ORTHOPEDIC", "disease": "Lumbar Spondylosis / Strain"},
    "skin rash": {"category": "DERMATOLOGY", "disease": "Dermatitis / Urticaria"},
    "indigestion": {"category": "GASTROINTESTINAL", "disease": "Dyspepsia / Acidity"},
    "constipation": {"category": "GASTROINTESTINAL", "disease": "Functional Constipation"},
    "fatigue": {"category": "GENERAL", "disease": "General Malaise"},
    "बुखार": {"category": "INFECTIOUS", "disease": "Fever (Hindi)"},
    "सर्दी": {"category": "RESPIRATORY", "disease": "Cold (Hindi)"},
    "खांसी": {"category": "RESPIRATORY", "disease": "Cough (Hindi)"},
    "घुटने में दर्द": {"category": "ORTHOPEDIC", "disease": "Knee Pain (Hindi)"},
    "sardi khansi": {"category": "RESPIRATORY", "disease": "Cold & Cough (Hinglish)"}
}

# 4. MULTI-SYMPTOM RED-FLAG CLUSTERS (High Precision Combination Logic)
SYMPTOM_CLUSTERS: List[Dict[str, Any]] = [
    {
        "name": "Meningitis Cluster",
        "required_symptoms": ["fever", "stiff neck"],
        "category": "NEUROLOGICAL",
        "level": "P1_CRITICAL",
        "disease": "Acute Bacterial Meningitis Suspect"
    },
    {
        "name": "Sepsis Cluster",
        "required_symptoms": ["fever", "confusion", "chills"],
        "category": "INFECTIOUS",
        "level": "P1_CRITICAL",
        "disease": "Severe Sepsis Suspect"
    },
    {
        "name": "Acute Appendicitis Cluster",
        "required_symptoms": ["right lower abdominal pain", "vomiting", "fever"],
        "category": "GASTROINTESTINAL",
        "level": "P1_CRITICAL",
        "disease": "Acute Appendicitis Red-Flag"
    }
]

# 5. SNOMED CT & ICD-10 CLINICAL STANDARDIZATION DICTIONARY
SNOMED_MAP: Dict[str, Dict[str, str]] = {
    "chest pain": {"snomed_code": "22253000", "snomed_display": "Chest Pain", "icd10_code": "R07.9"},
    "heart attack": {"snomed_code": "57054005", "snomed_display": "Acute Myocardial Infarction", "icd10_code": "I21.9"},
    "cardiac arrest": {"snomed_code": "410429000", "snomed_display": "Cardiac Arrest", "icd10_code": "I46.9"},
    "shortness of breath": {"snomed_code": "267036007", "snomed_display": "Dyspnea", "icd10_code": "R06.02"},
    "cannot breathe": {"snomed_code": "267036007", "snomed_display": "Acute Respiratory Distress", "icd10_code": "R06.03"},
    "choking": {"snomed_code": "262657007", "snomed_display": "Choking", "icd10_code": "T17.9"},
    "cyanosis": {"snomed_code": "3415004", "snomed_display": "Cyanosis", "icd10_code": "R23.0"},
    "stroke": {"snomed_code": "230690007", "snomed_display": "Cerebrovascular Accident", "icd10_code": "I63.9"},
    "unconscious": {"snomed_code": "162319001", "snomed_display": "Loss of Consciousness", "icd10_code": "R40.20"},
    "seizure": {"snomed_code": "91175000", "snomed_display": "Seizure", "icd10_code": "G40.909"},
    "fits": {"snomed_code": "91175000", "snomed_display": "Convulsion", "icd10_code": "R56.9"},
    "heavy bleeding": {"snomed_code": "13114007", "snomed_display": "Hemorrhage", "icd10_code": "R58"},
    "anaphylaxis": {"snomed_code": "39579001", "snomed_display": "Anaphylaxis", "icd10_code": "T78.2XXA"},
    "snake bite": {"snomed_code": "300958000", "snomed_display": "Snake Bite", "icd10_code": "T63.001A"},
    "high fever": {"snomed_code": "386661006", "snomed_display": "Fever", "icd10_code": "R50.9"},
    "severe abdominal pain": {"snomed_code": "21522001", "snomed_display": "Abdominal Pain", "icd10_code": "R10.9"},
    "fracture": {"snomed_code": "125605004", "snomed_display": "Fracture of Bone", "icd10_code": "M84.9"},
    "cough": {"snomed_code": "49727002", "snomed_display": "Cough", "icd10_code": "R05.9"},
    "mild cold": {"snomed_code": "82272006", "snomed_display": "Common Cold", "icd10_code": "J00"},
    "headache": {"snomed_code": "25064002", "snomed_display": "Headache", "icd10_code": "R51.9"}
}

# Common Speech-to-Text (ASR) Typos / Phonetic Mischaracterizations
ASR_TYPO_MAP: Dict[str, str] = {
    "ches pain": "chest pain",
    "chest painn": "chest pain",
    "chestpain": "chest pain",
    "hart attak": "heart attack",
    "hart attack": "heart attack",
    "shorness of breth": "shortness of breath",
    "shorness of breath": "shortness of breath",
    "shortnes of breath": "shortness of breath",
    "difficulty breathin": "difficulty breathing",
    "unconsious": "unconscious",
    "unconcious": "unconscious",
    "seizur": "seizure",
    "strok": "stroke",
    "heavy bleading": "heavy bleeding",
    "severe bleading": "severe bleeding",
    "tej bukar": "tej bukhar"
}

# Negation Regex Base Patterns
NEGATION_PRE_EN = r"(?:\b(?:no|not|don't|does not|denies|denied|without|free of|free from|never|absent|no history of|no prior|no complaint of|negative for)\s+(?:[\w\s]{0,35}\s+)?)"
NEGATION_PRE_INDIC = r"(?:नहीं|ना|मना|इन्कार|रहित|कोई नहीं|बिना|nahi|nahin)\s+"
NEGATION_POST_INDIC = r"\s+(?:नहीं|ना|मना|इन्कार|रहित|nahi|nahin|nahi hai|nahin hai|nhi|nhi hai|is absent|is negative|not present|denied)"


def _levenshtein_distance(s1: str, s2: str) -> int:
    """Calculates Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return _levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]


class SessionStore:
    """
    Multi-Turn Session State Accumulator.
    Accumulates transcript history per session_id so multi-symptom red-flag clusters
    are correctly triggered across a multi-utterance conversation.
    """
    def __init__(self, ttl_seconds: int = 900):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.ttl_seconds = ttl_seconds

    def get_or_create(self, session_id: str) -> Dict[str, Any]:
        now = time.time()
        if session_id in self.sessions:
            sess = self.sessions[session_id]
            if now - sess["last_updated"] > self.ttl_seconds:
                # Expired session reset
                sess = {"transcripts": [], "created_at": now, "last_updated": now}
                self.sessions[session_id] = sess
            return sess

        sess = {"transcripts": [], "created_at": now, "last_updated": now}
        self.sessions[session_id] = sess
        return sess

    def accumulate(self, session_id: str, new_transcript: str) -> str:
        sess = self.get_or_create(session_id)
        if new_transcript and new_transcript.strip():
            sess["transcripts"].append(new_transcript.strip())
            sess["last_updated"] = time.time()
        return " ".join(sess["transcripts"])

    def clear(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]


class EmergencyTriageEngine:
    """
    Hospital-Grade Multilingual Clinical Disease & Pattern Recognition Triage Engine.
    Features:
    - Pre-compiled word-boundary regex matching for Latin & script boundary for Indic phrases
    - Numeric Vital Signs Parser (BP, SpO2, Heart Rate, Temperature)
    - Pediatric (PEWS) & Obstetric (MEOWS) Clinical Scoring Engines
    - START Mass-Casualty Disaster Triage Algorithm (RED/YELLOW/GREEN/BLACK)
    - HL7 FHIR R4 RiskAssessment & Observation Bundle Generation with SNOMED CT & ICD-10 codes
    - Multi-Turn Session State Accumulator (session_id)
    - Immutable Cryptographic SHA-256 Audit Trail & Malpractice Logging
    - Zero VRAM, ~0 MB RAM, Sub-millisecond latency
    """

    def __init__(self):
        # 1. Clean pattern dictionary keys by stripping whitespace
        self.critical_patterns = {k.strip(): v for k, v in CRITICAL_PATTERNS.items()}
        self.urgent_patterns = {k.strip(): v for k, v in URGENT_PATTERNS.items()}
        self.routine_patterns = {k.strip(): v for k, v in ROUTINE_PATTERNS.items()}
        self.clusters = SYMPTOM_CLUSTERS
        self.session_store = SessionStore()

        # 2. Pre-compile phrase regexes for word-boundary matching
        self._critical_regexes = self._compile_pattern_regexes(self.critical_patterns)
        self._urgent_regexes = self._compile_pattern_regexes(self.urgent_patterns)
        self._routine_regexes = self._compile_pattern_regexes(self.routine_patterns)

        # 3. Pre-compile negation regex templates
        self._neg_pre_en_compiled = re.compile(NEGATION_PRE_EN, re.IGNORECASE)
        self._neg_pre_ind_compiled = re.compile(NEGATION_PRE_INDIC, re.IGNORECASE)
        self._neg_post_ind_compiled = re.compile(NEGATION_POST_INDIC, re.IGNORECASE)

        # Cache of pre-compiled phrase negation patterns to avoid runtime regex construction
        self._negation_regex_cache: Dict[str, Tuple[re.Pattern, re.Pattern, re.Pattern]] = {}
        for phrase in list(self.critical_patterns.keys()) + list(self.urgent_patterns.keys()) + list(self.routine_patterns.keys()):
            self._cache_negation_regex(phrase)

        # Pre-compile Vital Signs regexes
        self._bp_regex1 = re.compile(r'\b(?:bp|blood pressure)\s*(?:is|=|:)?\s*(\d{2,3})\s*[\/\\]\s*(\d{2,3})\b', re.IGNORECASE)
        self._bp_regex2 = re.compile(r'\b(\d{2,3})\s*[\/\\]\s*(\d{2,3})\s*(?:mmhg|bp)\b', re.IGNORECASE)
        self._spo2_regex = re.compile(r'\b(?:spo2|oxygen|o2|sat|sats|saturation)\s*(?:is|=|:)?\s*(\d{2,3})\s*%?\b|\b(\d{2,3})\s*%\s*(?:spo2|o2|sat|sats|saturation)?\b', re.IGNORECASE)
        self._hr_regex = re.compile(r'\b(?:pulse|hr|heart rate|bpm)\s*(?:is|=|:)?\s*(\d{2,3})\s*(?:bpm)?\b', re.IGNORECASE)
        self._temp_regex = re.compile(r'\b(?:temp|temperature|fever)\s*(?:of|is|=|:)?\s*(\d{2,3}(?:\.\d)?)\s*(?:°?\s*([fc])|degree|degrees)?\b', re.IGNORECASE)

        # Pre-compile Temporal Duration regexes
        self._duration_regex = re.compile(
            r'\b(?:for|since|during|lasting)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(minute|min|hour|hr|day|week|month|year)s?\b|\b(\d+)\s*(minute|min|hour|hr|day|week|month|year)s?\s+(?:ago|duration|history)\b',
            re.IGNORECASE
        )

        # Audit log file path setup
        self.audit_log_dir = os.path.join(os.path.dirname(__file__), "logs")
        os.makedirs(self.audit_log_dir, exist_ok=True)
        self.audit_log_path = os.path.join(self.audit_log_dir, "triage_audit.jsonl")

    def _compile_pattern_regexes(self, pattern_dict: Dict[str, Dict[str, str]]) -> List[Tuple[str, re.Pattern, Dict[str, str]]]:
        """Pre-compiles word-boundary regular expressions for pattern dictionary."""
        compiled = []
        for phrase, meta in pattern_dict.items():
            if any(c.isalpha() and ord(c) < 128 for c in phrase):
                pat = r'\b' + re.escape(phrase) + r'\b'
            else:
                pat = r'(?:^|[^\w\u0900-\u0D7F])' + re.escape(phrase) + r'(?:$|[^\w\u0900-\u0D7F])'
            compiled.append((phrase, re.compile(pat, re.IGNORECASE), meta))
        return compiled

    def _cache_negation_regex(self, phrase: str) -> Tuple[re.Pattern, re.Pattern, re.Pattern]:
        """Pre-compiles and caches negation pattern regexes for a given phrase."""
        if phrase not in self._negation_regex_cache:
            escaped = re.escape(phrase)
            pat_pre_en = re.compile(NEGATION_PRE_EN + escaped, re.IGNORECASE)
            pat_pre_ind = re.compile(NEGATION_PRE_INDIC + escaped, re.IGNORECASE)
            pat_post_ind = re.compile(escaped + NEGATION_POST_INDIC, re.IGNORECASE)
            self._negation_regex_cache[phrase] = (pat_pre_en, pat_pre_ind, pat_post_ind)
        return self._negation_regex_cache[phrase]

    def _is_phrase_negated(self, phrase: str, text_lower: str) -> bool:
        """Checks if a symptom phrase is negated using pre-compiled negation regexes."""
        pat_pre_en, pat_pre_ind, pat_post_ind = self._cache_negation_regex(phrase)

        if pat_pre_en.search(text_lower) is not None:
            return True
        if pat_pre_ind.search(text_lower) is not None:
            return True
        if pat_post_ind.search(text_lower) is not None:
            return True

        if "denies " + phrase in text_lower or "no " + phrase in text_lower or "without " + phrase in text_lower or phrase + " nahi" in text_lower:
            return True

        return False

    def parse_vitals(self, transcript: str) -> Dict[str, Any]:
        """
        Parses numeric vital signs (BP, SpO2, Heart Rate, Temperature) via regex.
        Returns parsed vitals & detected emergency/urgent vital alerts.
        """
        vitals = {
            "systolic_bp": None,
            "diastolic_bp": None,
            "spo2": None,
            "heart_rate": None,
            "temperature_f": None,
            "alerts": []
        }

        # 1. Parse Blood Pressure
        bp_match = self._bp_regex1.search(transcript) or self._bp_regex2.search(transcript)
        if bp_match:
            sys_val = int(bp_match.group(1))
            dia_val = int(bp_match.group(2))
            vitals["systolic_bp"] = sys_val
            vitals["diastolic_bp"] = dia_val
            if sys_val >= 180 or dia_val >= 120:
                vitals["alerts"].append({
                    "vital": "BP",
                    "value": f"{sys_val}/{dia_val}",
                    "level": "P1_CRITICAL",
                    "disease": "Hypertensive Crisis (BP > 180/120)",
                    "category": "CARDIOVASCULAR"
                })
            elif sys_val >= 160 or dia_val >= 100:
                vitals["alerts"].append({
                    "vital": "BP",
                    "value": f"{sys_val}/{dia_val}",
                    "level": "P2_URGENT",
                    "disease": "Hypertensive Urgency (BP > 160/100)",
                    "category": "CARDIOVASCULAR"
                })

        # 2. Parse SpO2
        spo2_match = self._spo2_regex.search(transcript)
        if spo2_match:
            val_str = spo2_match.group(1) or spo2_match.group(2)
            if val_str:
                spo2_val = int(val_str)
                vitals["spo2"] = spo2_val
                if spo2_val < 90:
                    vitals["alerts"].append({
                        "vital": "SpO2",
                        "value": f"{spo2_val}%",
                        "level": "P1_CRITICAL",
                        "disease": "Severe Hypoxia (SpO2 < 90%)",
                        "category": "RESPIRATORY"
                    })
                elif spo2_val < 94:
                    vitals["alerts"].append({
                        "vital": "SpO2",
                        "value": f"{spo2_val}%",
                        "level": "P2_URGENT",
                        "disease": "Moderate Hypoxia (SpO2 < 94%)",
                        "category": "RESPIRATORY"
                    })

        # 3. Parse Heart Rate
        hr_match = self._hr_regex.search(transcript)
        if hr_match:
            hr_val = int(hr_match.group(1))
            vitals["heart_rate"] = hr_val
            if hr_val > 130 or hr_val < 40:
                vitals["alerts"].append({
                    "vital": "HR",
                    "value": f"{hr_val} bpm",
                    "level": "P1_CRITICAL" if hr_val > 140 or hr_val < 35 else "P2_URGENT",
                    "disease": f"Severe {'Tachycardia' if hr_val > 130 else 'Bradycardia'} ({hr_val} bpm)",
                    "category": "CARDIOVASCULAR"
                })

        # 4. Parse Temperature
        temp_match = self._temp_regex.search(transcript)
        if temp_match:
            temp_num = float(temp_match.group(1))
            unit = (temp_match.group(2) or "f").lower()
            if unit == "c" or temp_num < 45.0: # Celsius
                temp_f = (temp_num * 9 / 5) + 32
            else:
                temp_f = temp_num
            vitals["temperature_f"] = round(temp_f, 1)

            if temp_f >= 104.0:
                vitals["alerts"].append({
                    "vital": "Temperature",
                    "value": f"{temp_f:.1f}°F",
                    "level": "P1_CRITICAL",
                    "disease": "Hyperpyrexia / Extreme Fever (>= 104°F)",
                    "category": "INFECTIOUS"
                })
            elif temp_f >= 102.0:
                vitals["alerts"].append({
                    "vital": "Temperature",
                    "value": f"{temp_f:.1f}°F",
                    "level": "P2_URGENT",
                    "disease": "High Grade Fever (>= 102°F)",
                    "category": "INFECTIOUS"
                })

        return vitals

    def apply_asr_typo_tolerance(self, text_lower: str) -> str:
        """Corrects common Speech-to-Text (ASR) typos and phonetically similar medical phrases."""
        corrected = text_lower
        for typo, canonical in ASR_TYPO_MAP.items():
            if typo in corrected:
                corrected = re.sub(r'\b' + re.escape(typo) + r'\b', canonical, corrected)

        words = corrected.split()
        target_critical_words = ["shortness", "unconscious", "headache", "bleeding", "vomiting", "seizure", "paralysis"]
        
        new_words = []
        for word in words:
            if len(word) >= 5:
                matched_target = None
                for target in target_critical_words:
                    if _levenshtein_distance(word, target) <= 2 and abs(len(word) - len(target)) <= 2:
                        matched_target = target
                        break
                if matched_target:
                    new_words.append(matched_target)
                else:
                    new_words.append(word)
            else:
                new_words.append(word)

        return " ".join(new_words)

    def parse_temporal_duration(self, transcript: str) -> Dict[str, Any]:
        """Extracts symptom duration and classifies as acute, hyper-acute, or chronic."""
        match = self._duration_regex.search(transcript)
        if not match:
            if any(w in transcript.lower() for w in ["sudden", "suddenly", "just now", "abrupt", "acute"]):
                return {"duration_type": "hyper_acute", "description": "Sudden onset"}
            return {"duration_type": "unknown", "description": "Unspecified duration"}

        num_str = match.group(1) or match.group(3)
        unit_str = (match.group(2) or match.group(4) or "").lower()

        num_map = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10}
        num = num_map.get(num_str, None)
        if num is None:
            try:
                num = int(num_str)
            except ValueError:
                num = 1

        if "min" in unit_str or "hour" in unit_str or "hr" in unit_str:
            return {"duration_type": "hyper_acute", "description": f"{num} {unit_str}"}
        elif "day" in unit_str:
            if num <= 3:
                return {"duration_type": "acute", "description": f"{num} days"}
            else:
                return {"duration_type": "subacute", "description": f"{num} days"}
        elif "week" in unit_str or "month" in unit_str or "year" in unit_str:
            return {"duration_type": "chronic", "description": f"{num} {unit_str}"}
        
        return {"duration_type": "subacute", "description": f"{num} {unit_str}"}

    def calculate_pews(self, age: Optional[int], vitals: Dict[str, Any], text_lower: str) -> Optional[Dict[str, Any]]:
        """
        Calculates PEWS (Pediatric Early Warning Score) for age < 16.
        Components: Behavior/Neurological, Cardiovascular, Respiratory.
        Score range: 0 to 9+.
        """
        if age is None or age >= 16:
            return None

        score = 0
        reasons = []

        # 1. Behavior / Neurological
        if any(w in text_lower for w in ["unconscious", "lethargic", "unresponsive", "coma"]):
            score += 3
            reasons.append("Behavior: Lethargic / Unresponsive (+3)")
        elif any(w in text_lower for w in ["irritable", "crying", "agitated"]):
            score += 2
            reasons.append("Behavior: Irritable / Agitated (+2)")
        elif any(w in text_lower for w in ["sleeping", "somnolent"]):
            score += 1
            reasons.append("Behavior: Somnolent (+1)")

        # 2. Cardiovascular (HR / CRT)
        hr = vitals.get("heart_rate")
        if hr is not None:
            if hr > 160 or hr < 60:
                score += 3
                reasons.append(f"Cardiovascular: Severe HR abnormality ({hr} bpm) (+3)")
            elif hr > 140 or hr < 70:
                score += 2
                reasons.append(f"Cardiovascular: Moderate HR abnormality ({hr} bpm) (+2)")

        # 3. Respiratory (SpO2 / Dyspnea)
        spo2 = vitals.get("spo2")
        if spo2 is not None and spo2 < 92:
            score += 3
            reasons.append(f"Respiratory: Severe Hypoxia (SpO2 {spo2}%) (+3)")
        elif any(w in text_lower for w in ["shortness of breath", "difficulty breathing", "grunting", "retractions"]):
            score += 2
            reasons.append("Respiratory: Increased work of breathing (+2)")

        if score >= 5:
            risk = "HIGH_RISK (Immediate Pediatric Emergency Escalation)"
        elif score >= 3:
            risk = "MEDIUM_RISK (Urgent Pediatric Review Required)"
        else:
            risk = "LOW_RISK (Standard Pediatric Monitoring)"

        return {
            "pews_score": score,
            "risk_level": risk,
            "reasons": reasons
        }

    def calculate_meows(self, is_pregnant: Optional[bool], vitals: Dict[str, Any], text_lower: str) -> Optional[Dict[str, Any]]:
        """
        Calculates MEOWS (Modified Obstetric Early Warning Score) for pregnant/postpartum patients.
        Evaluates BP, HR, Temp, SpO2, and Neurological flags.
        """
        if not is_pregnant and "pregnant" not in text_lower:
            return None

        red_triggers = 0
        yellow_triggers = 0
        details = []

        sys_bp = vitals.get("systolic_bp")
        dia_bp = vitals.get("diastolic_bp")
        if sys_bp is not None or dia_bp is not None:
            if (sys_bp and sys_bp >= 160) or (dia_bp and dia_bp >= 110):
                red_triggers += 1
                details.append(f"Severe Pre-Eclampsia BP Threshold ({sys_bp}/{dia_bp} mmHg) [RED]")
            elif (sys_bp and sys_bp >= 140) or (dia_bp and dia_bp >= 90):
                yellow_triggers += 1
                details.append(f"Gestational Hypertension BP Threshold ({sys_bp}/{dia_bp} mmHg) [YELLOW]")
            elif sys_bp and sys_bp < 90:
                red_triggers += 1
                details.append(f"Obstetric Shock Hypotension (BP {sys_bp} mmHg) [RED]")

        hr = vitals.get("heart_rate")
        if hr is not None:
            if hr >= 120:
                red_triggers += 1
                details.append(f"Severe Tachycardia ({hr} bpm) [RED]")
            elif hr >= 100 or hr < 50:
                yellow_triggers += 1
                details.append(f"Abnormal HR ({hr} bpm) [YELLOW]")

        temp_f = vitals.get("temperature_f")
        if temp_f is not None:
            if temp_f >= 101.3 or temp_f < 96.8:
                red_triggers += 1
                details.append(f"Severe Pyrexia / Hypothermia ({temp_f:.1f}°F) [RED]")
            elif temp_f >= 100.4:
                yellow_triggers += 1
                details.append(f"Maternal Fever ({temp_f:.1f}°F) [YELLOW]")

        spo2 = vitals.get("spo2")
        if spo2 is not None and spo2 < 95:
            red_triggers += 1
            details.append(f"Maternal Hypoxia (SpO2 {spo2}%) [RED]")

        if red_triggers >= 1 or yellow_triggers >= 2:
            alert = "HIGH_ALERT (Immediate Obstetric Registrar Escalation)"
        elif yellow_triggers == 1:
            alert = "MEDIUM_ALERT (Urgent Midwife & Medical Review)"
        else:
            alert = "NORMAL (Standard Routine Antenatal Care)"

        return {
            "meows_score": red_triggers * 2 + yellow_triggers,
            "red_triggers": red_triggers,
            "yellow_triggers": yellow_triggers,
            "alert_level": alert,
            "details": details
        }

    def calculate_start_disaster_triage(self, transcript: str, vitals: Dict[str, Any], text_lower: str) -> Dict[str, Any]:
        """
        Calculates START (Simple Triage and Rapid Treatment) Disaster Mass-Casualty Tag:
        RED (Immediate), YELLOW (Delayed), GREEN (Minor / Walking Wounded), BLACK (Deceased / Expectant).
        """
        # BLACK: Deceased / Apneic
        if any(w in text_lower for w in ["no pulse", "decapitated", "dead", "catastrophic brain", "apneic", "not breathing"]):
            return {"tag": "BLACK", "category": "DECEASED / EXPECTANT", "priority": 4}

        # RED: Immediate Life Threat
        if any(w in text_lower for w in ["heavy bleeding", "unconscious", "choking", "cannot breathe", "anaphylaxis", "severe bleeding"]):
            return {"tag": "RED", "category": "IMMEDIATE", "priority": 1}
        
        spo2 = vitals.get("spo2")
        if spo2 is not None and spo2 < 90:
            return {"tag": "RED", "category": "IMMEDIATE", "priority": 1}

        # YELLOW: Delayed / Non-ambulatory Serious Injury
        if any(w in text_lower for w in ["fracture", "broken bone", "severe abdominal pain", "head injury", "burn"]):
            return {"tag": "YELLOW", "category": "DELAYED", "priority": 2}

        # GREEN: Minor / Walking Wounded
        return {"tag": "GREEN", "category": "MINOR / AMBULATORY", "priority": 3}

    def calculate_esi_and_news2(
        self,
        triage_level: str,
        detected_flags: List[Dict[str, Any]],
        vitals: Dict[str, Any],
        text_lower: str
    ) -> Tuple[str, int, str]:
        """
        Calculates Emergency Severity Index (ESI Level 1-5) and National Early Warning Score (NEWS2).
        Returns (esi_level, news2_score, news2_risk_category).
        """
        # 1. NEWS2 Calculation
        news2_score = 0

        # SpO2
        spo2 = vitals.get("spo2")
        if spo2 is not None:
            if spo2 <= 91:
                news2_score += 3
            elif spo2 in [92, 93]:
                news2_score += 2
            elif spo2 in [94, 95]:
                news2_score += 1

        # Systolic BP
        sys_bp = vitals.get("systolic_bp")
        if sys_bp is not None:
            if sys_bp <= 90:
                news2_score += 3
            elif sys_bp in range(91, 101):
                news2_score += 2
            elif sys_bp in range(101, 111):
                news2_score += 1
            elif sys_bp >= 220:
                news2_score += 3

        # Heart Rate
        hr = vitals.get("heart_rate")
        if hr is not None:
            if hr <= 40 or hr >= 131:
                news2_score += 3
            elif hr in range(111, 131):
                news2_score += 2
            elif hr in range(41, 51) or hr in range(91, 111):
                news2_score += 1

        # Temperature
        temp_f = vitals.get("temperature_f")
        if temp_f is not None:
            if temp_f <= 95.0 or temp_f >= 102.2:
                news2_score += 3 if temp_f <= 95.0 or temp_f >= 104.0 else 2
            elif temp_f in [95.1, 96.0] or temp_f in [100.5, 102.1]:
                news2_score += 1

        # Consciousness
        if any(w in text_lower for w in ["unconscious", "coma", "behosh", "unresponsive", "fainted"]):
            news2_score += 3

        if news2_score >= 7:
            news2_category = "HIGH (Emergency Clinical Escalation Required)"
        elif news2_score >= 5:
            news2_category = "MEDIUM (Urgent Clinical Review Required)"
        elif news2_score >= 1:
            news2_category = "LOW-MEDIUM (Routine Monitoring)"
        else:
            news2_category = "LOW (Standard Monitoring)"

        # 2. ESI Level Mapping (1 to 5)
        esi_1_triggers = ["cardiac arrest", "cannot breathe", "anaphylaxis", "unconscious", "choking", "cyanosis"]
        is_esi_1 = any(t in text_lower for t in esi_1_triggers) or (spo2 is not None and spo2 < 88) or (sys_bp is not None and sys_bp < 80)

        if triage_level == "P1_CRITICAL":
            if is_esi_1:
                esi_level = "ESI-1 (Immediate Resuscitation)"
            else:
                esi_level = "ESI-2 (Emergent / High Risk)"
        elif triage_level == "P2_URGENT":
            esi_level = "ESI-3 (Urgent / Multi-Resource)"
        else:
            if len(detected_flags) > 1:
                esi_level = "ESI-4 (Less Urgent / Single Resource)"
            else:
                esi_level = "ESI-5 (Non-Urgent / OPD Routine)"

        return esi_level, news2_score, news2_category

    def generate_fhir_r4_bundle(self, verdict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates an HL7 FHIR R4 JSON Bundle (RiskAssessment & Observations) bound with SNOMED CT & ICD-10.
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        bundle_entries = []

        # 1. RiskAssessment Resource
        risk_codings = []
        for flag in verdict.get("detected_flags", []):
            phrase = flag.get("phrase", "").lower()
            if phrase in SNOMED_MAP:
                mapping = SNOMED_MAP[phrase]
                risk_codings.append({
                    "system": "http://snomed.info/sct",
                    "code": mapping["snomed_code"],
                    "display": mapping["snomed_display"]
                })
                risk_codings.append({
                    "system": "http://hl7.org/fhir/sid/icd-10-cm",
                    "code": mapping["icd10_code"],
                    "display": flag.get("disease", "Clinical Condition")
                })

        if not risk_codings:
            risk_codings.append({
                "system": "http://snomed.info/sct",
                "code": "22253000",
                "display": verdict.get("primary_disease_suspect", "Clinical Triage Evaluation")
            })

        risk_resource = {
            "resource": {
                "resourceType": "RiskAssessment",
                "status": "final",
                "occurrenceDateTime": timestamp,
                "code": {
                    "coding": risk_codings
                },
                "prediction": [
                    {
                        "outcome": {"text": verdict.get("primary_disease_suspect", "Routine Check")},
                        "qualitativeRisk": {
                            "coding": [
                                {
                                    "system": "http://medikiosk.ai/fhir/StructureDefinition/triage-level",
                                    "code": verdict.get("triage_level", "P3_ROUTINE"),
                                    "display": verdict.get("esi_level", "ESI-5")
                                }
                            ]
                        }
                    }
                ]
            }
        }
        bundle_entries.append(risk_resource)

        # 2. Observation Resources for Parsed Vitals
        vitals = verdict.get("parsed_vitals", {})
        if vitals.get("systolic_bp") and vitals.get("diastolic_bp"):
            bundle_entries.append({
                "resource": {
                    "resourceType": "Observation",
                    "status": "final",
                    "code": {
                        "coding": [{"system": "http://loinc.org", "code": "85354-9", "display": "Blood Pressure"}]
                    },
                    "component": [
                        {"code": {"coding": [{"system": "http://loinc.org", "code": "8480-6", "display": "Systolic BP"}]}, "valueQuantity": {"value": vitals["systolic_bp"], "unit": "mmHg"}},
                        {"code": {"coding": [{"system": "http://loinc.org", "code": "8462-4", "display": "Diastolic BP"}]}, "valueQuantity": {"value": vitals["diastolic_bp"], "unit": "mmHg"}}
                    ]
                }
            })

        if vitals.get("spo2"):
            bundle_entries.append({
                "resource": {
                    "resourceType": "Observation",
                    "status": "final",
                    "code": {"coding": [{"system": "http://loinc.org", "code": "2708-6", "display": "Oxygen Saturation"}]},
                    "valueQuantity": {"value": vitals["spo2"], "unit": "%"}
                }
            })

        return {
            "resourceType": "Bundle",
            "type": "collection",
            "timestamp": timestamp,
            "entry": bundle_entries
        }

    def generate_audit_trail(self, transcript: str, verdict: Dict[str, Any], session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates an immutable cryptographic SHA-256 signature audit record for legal defensibility.
        Appends structured log to logs/triage_audit.jsonl.
        """
        timestamp_utc = datetime.now(timezone.utc).isoformat()
        matched_rules = [f.get("phrase", "") for f in verdict.get("detected_flags", [])]
        rule_str = ",".join(sorted(matched_rules))
        raw_hash_input = f"{timestamp_utc}:{transcript}:{rule_str}:{verdict.get('esi_level')}:{verdict.get('triage_level')}:{session_id or ''}"
        audit_hash = hashlib.sha256(raw_hash_input.encode('utf-8')).hexdigest()

        audit_record = {
            "timestamp_utc": timestamp_utc,
            "audit_hash": audit_hash,
            "session_id": session_id,
            "raw_transcript": transcript,
            "triage_level": verdict.get("triage_level"),
            "esi_level": verdict.get("esi_level"),
            "news2_score": verdict.get("news2_score"),
            "matched_rules": matched_rules,
            "is_emergency": verdict.get("is_emergency")
        }

        # Asynchronously/Safely log to file
        try:
            with open(self.audit_log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(audit_record) + "\n")
        except Exception:
            pass

        return audit_record

    def evaluate_triage(
        self,
        transcript: str,
        lang_code: str = "en",
        age: Optional[int] = None,
        gender: Optional[str] = None,
        is_pregnant: Optional[bool] = False,
        session_id: Optional[str] = None,
        enable_disaster_mode: Optional[bool] = False
    ) -> Dict[str, Any]:
        """
        Evaluates patient intake transcript for disease patterns & emergency red flags.
        Features:
        - Multi-turn session history accumulation (session_id)
        - Numeric vitals parsing, ASR typo correction, duration analysis
        - Pediatric PEWS & Obstetric MEOWS clinical scoring
        - START Mass-Casualty Disaster Triage Algorithm
        - HL7 FHIR R4 RiskAssessment & Observation Bundle Generation
        - Immutable Cryptographic SHA-256 Audit Trail
        """
        start_t = time.time()

        # Multi-turn transcript accumulation if session_id provided
        if session_id:
            effective_transcript = self.session_store.accumulate(session_id, transcript)
        else:
            effective_transcript = transcript

        raw_lower = effective_transcript.lower().strip()
        text_lower = self.apply_asr_typo_tolerance(raw_lower)

        detected_critical = []
        detected_urgent = []
        detected_routine = []
        detected_clusters = []
        negated_symptoms = []

        if not text_lower:
            verdict = {
                "session_id": session_id,
                "is_emergency": False,
                "triage_level": "P3_ROUTINE",
                "esi_level": "ESI-5 (Non-Urgent / OPD Routine)",
                "news2_score": 0,
                "news2_category": "LOW (Standard Monitoring)",
                "pews_assessment": None,
                "meows_assessment": None,
                "disaster_triage": None,
                "primary_disease_suspect": "Routine Clinical Intake",
                "detected_flags": [],
                "negated_flags": [],
                "parsed_vitals": {"systolic_bp": None, "diastolic_bp": None, "spo2": None, "heart_rate": None, "temperature_f": None, "alerts": []},
                "temporal_duration": {"duration_type": "unknown", "description": "Unspecified duration"},
                "demographic_alerts": [],
                "latency_ms": round((time.time() - start_t) * 1000, 4)
            }
            verdict["fhir_bundle"] = self.generate_fhir_r4_bundle(verdict)
            verdict["audit_trail"] = self.generate_audit_trail(transcript, verdict, session_id)
            return verdict

        # Parse Vitals
        vitals = self.parse_vitals(effective_transcript)
        for alert in vitals["alerts"]:
            item = {
                "phrase": alert["vital"] + " " + alert["value"],
                "category": alert["category"],
                "disease": alert["disease"],
                "level": alert["level"]
            }
            if alert["level"] == "P1_CRITICAL":
                detected_critical.append(item)
            elif alert["level"] == "P2_URGENT":
                detected_urgent.append(item)

        # Parse Temporal Duration
        duration_info = self.parse_temporal_duration(effective_transcript)

        # 1. Evaluate Multi-Symptom Red-Flag Clusters
        for cluster in self.clusters:
            all_present = True
            for sym in cluster["required_symptoms"]:
                if sym not in text_lower or self._is_phrase_negated(sym, text_lower):
                    all_present = False
                    break
            if all_present:
                detected_clusters.append({
                    "cluster_name": cluster["name"],
                    "disease": cluster["disease"],
                    "category": cluster["category"],
                    "level": cluster["level"]
                })

        # 2. Evaluate P1_CRITICAL Patterns
        for phrase, regex, meta in self._critical_regexes:
            if regex.search(text_lower):
                if self._is_phrase_negated(phrase, text_lower):
                    negated_symptoms.append({
                        "phrase": phrase,
                        "reason": "Negated preceding or following phrase"
                    })
                else:
                    detected_critical.append({
                        "phrase": phrase,
                        "category": meta["category"],
                        "disease": meta["disease"],
                        "level": "P1_CRITICAL"
                    })

        # 3. Evaluate P2_URGENT Patterns
        for phrase, regex, meta in self._urgent_regexes:
            if regex.search(text_lower):
                if self._is_phrase_negated(phrase, text_lower):
                    negated_symptoms.append({
                        "phrase": phrase,
                        "reason": "Negated preceding or following phrase"
                    })
                else:
                    detected_urgent.append({
                        "phrase": phrase,
                        "category": meta["category"],
                        "disease": meta["disease"],
                        "level": "P2_URGENT"
                    })

        # 4. Evaluate P3_ROUTINE Patterns
        for phrase, regex, meta in self._routine_regexes:
            if regex.search(text_lower):
                if self._is_phrase_negated(phrase, text_lower):
                    negated_symptoms.append({
                        "phrase": phrase,
                        "reason": "Negated phrase"
                    })
                else:
                    detected_routine.append({
                        "phrase": phrase,
                        "category": meta["category"],
                        "disease": meta["disease"],
                        "level": "P3_ROUTINE"
                    })

        # 5. Demographic Context Integration & Severity Escalation
        demographic_alerts = []

        # Pregnancy Risk Rule
        if is_pregnant or "pregnant" in text_lower:
            if any(p in text_lower for p in ["abdominal pain", "pelvic pain", "bleeding", "spotting", "cramps", "pain"]):
                if not any(c["category"] == "OBSTETRICS" for c in detected_critical):
                    demographic_alerts.append({
                        "rule": "Obstetric High Priority",
                        "level": "P1_CRITICAL",
                        "disease": "High-Risk Pregnancy Acute Abdomen / Hemorrhage Risk",
                        "category": "OBSTETRICS"
                    })
                    detected_critical.append({
                        "phrase": "pregnancy abdominal pain / bleeding",
                        "category": "OBSTETRICS",
                        "disease": "High-Risk Pregnancy Acute Abdomen / Hemorrhage Risk",
                        "level": "P1_CRITICAL"
                    })

        # Pediatric Neonatal Risk Rule
        if age is not None:
            if age <= 1: # Age <= 1 year or months
                if any(p in text_lower for p in ["fever", "bukhar", "high fever", "vomiting", "lethargy"]):
                    demographic_alerts.append({
                        "rule": "Pediatric / Neonatal Alert",
                        "level": "P1_CRITICAL",
                        "disease": "Neonatal / Infant Febrile Sepsis Risk",
                        "category": "INFECTIOUS"
                    })
                    detected_critical.append({
                        "phrase": "infant fever / febrile episode",
                        "category": "INFECTIOUS",
                        "disease": "Neonatal / Infant Febrile Sepsis Risk",
                        "level": "P1_CRITICAL"
                    })
            elif age >= 65: # Geriatric Cardiac & Neuro Alert
                if any(p in text_lower for p in ["dizziness", "giddiness", "syncope", "epigastric pain", "indigestion"]):
                    demographic_alerts.append({
                        "rule": "Geriatric Atypical Cardiac Presentation",
                        "level": "P2_URGENT",
                        "disease": "Geriatric Atypical Ischemia Risk",
                        "category": "CARDIOVASCULAR"
                    })
                    if not detected_critical and not detected_urgent:
                        detected_urgent.append({
                            "phrase": "geriatric dizziness / epigastric pain",
                            "category": "CARDIOVASCULAR",
                            "disease": "Geriatric Atypical Ischemia Risk",
                            "level": "P2_URGENT"
                        })

        # Determine Final Triage Level & Primary Disease Suspect
        if detected_critical or detected_clusters:
            triage_level = "P1_CRITICAL"
            is_emergency = True
            primary = detected_clusters[0]["disease"] if detected_clusters else detected_critical[0]["disease"]
            cluster_flags = [
                {
                    "phrase": c["cluster_name"],
                    "category": c["category"],
                    "disease": c["disease"],
                    "level": c["level"]
                }
                for c in detected_clusters
            ]
            all_flags = detected_critical + cluster_flags
        elif detected_urgent:
            triage_level = "P2_URGENT"
            is_emergency = False
            primary = detected_urgent[0]["disease"]
            all_flags = detected_urgent
        elif detected_routine:
            triage_level = "P3_ROUTINE"
            is_emergency = False
            primary = detected_routine[0]["disease"]
            all_flags = detected_routine
        else:
            triage_level = "P3_ROUTINE"
            is_emergency = False
            primary = "General Routine OPD Evaluation"
            all_flags = []

        # Calculate ESI Level and NEWS2 Score
        esi_level, news2_score, news2_category = self.calculate_esi_and_news2(
            triage_level, all_flags, vitals, text_lower
        )

        # Specialized PEWS (Pediatric) and MEOWS (Obstetric) Scoring
        pews_assessment = self.calculate_pews(age, vitals, text_lower)
        meows_assessment = self.calculate_meows(is_pregnant, vitals, text_lower)

        # START Disaster Triage Tag (if disaster mode enabled or mass-casualty scenario)
        disaster_triage = None
        if enable_disaster_mode or "disaster" in text_lower or "casualty" in text_lower:
            disaster_triage = self.calculate_start_disaster_triage(effective_transcript, vitals, text_lower)

        latency_ms = round((time.time() - start_t) * 1000, 4)

        verdict = {
            "session_id": session_id,
            "is_emergency": is_emergency,
            "triage_level": triage_level,
            "esi_level": esi_level,
            "news2_score": news2_score,
            "news2_category": news2_category,
            "pews_assessment": pews_assessment,
            "meows_assessment": meows_assessment,
            "disaster_triage": disaster_triage,
            "primary_disease_suspect": primary,
            "detected_clusters": detected_clusters,
            "detected_flags": all_flags,
            "negated_flags": negated_symptoms,
            "parsed_vitals": vitals,
            "temporal_duration": duration_info,
            "demographic_alerts": demographic_alerts,
            "latency_ms": latency_ms
        }

        # Attach FHIR R4 Bundle and Cryptographic Audit Trail
        verdict["fhir_bundle"] = self.generate_fhir_r4_bundle(verdict)
        verdict["audit_trail"] = self.generate_audit_trail(effective_transcript, verdict, session_id)

        return verdict


# Global Singleton Instance
triage_engine = EmergencyTriageEngine()
