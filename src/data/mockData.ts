import { DashavidhaParameter, ExtractedEntity, LabValue, PatientQueueItem, RedFlagAlert, Discrepancy, SoapDraft } from '../types';

export const initialDashavidhaParams: Record<string, DashavidhaParameter> = {
  prakriti: {
    id: 'prakriti',
    key: 'Prakriti',
    nameHindi: 'Prakriti (Body Constitution)',
    nameEnglish: 'Prakriti (Body Constitution)',
    aiValue: 'Vata-Pitta',
    currentValue: 'Vata-Pitta',
    confidence: 84,
    options: ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Tridoshic'],
    isOverridden: false,
    provenance: {
      source: 'voice',
      snippetHindi: 'Patient stated: Excessive bloating, dryness and sharp retrosternal burning.',
      snippetEnglish: 'Patient stated: "I experience excessive bloating, dryness and sharp retrosternal burning."',
      confidence: 84,
    }
  },
  vikriti: {
    id: 'vikriti',
    key: 'Vikriti',
    nameHindi: 'Vikriti (Current Pathological State)',
    nameEnglish: 'Vikriti (Current Pathological State)',
    aiValue: 'Pitta Vriddhi + Vata Anulomana',
    currentValue: 'Pitta Vriddhi + Vata Anulomana',
    confidence: 91,
    options: ['Vata Vriddhi', 'Pitta Vriddhi', 'Kapha Vriddhi', 'Pitta Vriddhi + Vata Anulomana', 'Sama Pitta'],
    isOverridden: false,
    provenance: {
      source: 'voice',
      snippetHindi: 'Severe Amlapitta symptoms, sour belching after oily meals since 3 weeks.',
      snippetEnglish: 'Severe Amlapitta symptoms, sour belching after oily meals since 3 weeks.',
      confidence: 91,
    }
  },
  sara: {
    id: 'sara',
    key: 'Sara',
    nameHindi: 'Sara (Tissue Quality & Vitality)',
    nameEnglish: 'Sara (Tissue Quality & Vitality)',
    aiValue: 'Madhyama Rasa-Rakta Sara',
    currentValue: 'Madhyama Rasa-Rakta Sara',
    confidence: 78,
    options: ['Uttama', 'Madhyama', 'Heena', 'Madhyama Rasa-Rakta Sara'],
    isOverridden: false,
    provenance: {
      source: 'inference',
      snippetHindi: 'Skin tone normal, mild conjunctival congestion, moderate tissue tone.',
      snippetEnglish: 'Skin tone normal, mild conjunctival congestion, moderate tissue tone.',
      confidence: 78,
    }
  },
  samhanana: {
    id: 'samhanana',
    key: 'Samhanana',
    nameHindi: 'Samhanana (Body Compactness)',
    nameEnglish: 'Samhanana (Body Compactness)',
    aiValue: 'Madhyama Samhanana',
    currentValue: 'Madhyama Samhanana',
    confidence: 88,
    options: ['Uttama / Compact', 'Madhyama / Moderate', 'Heena / Frail'],
    isOverridden: false,
    provenance: {
      source: 'vitals',
      snippetHindi: 'Height 172cm, Weight 68kg, BMI 23.0 (Normal healthy range).',
      snippetEnglish: 'Height 172cm, Weight 68kg, BMI 23.0 (Normal healthy range).',
      confidence: 88,
    }
  },
  pramana: {
    id: 'pramana',
    key: 'Pramana',
    nameHindi: 'Pramana (Anthropometric Proportion)',
    nameEnglish: 'Pramana (Anthropometric Proportion)',
    aiValue: 'Madhyama Pramana',
    currentValue: 'Madhyama Pramana',
    confidence: 92,
    options: ['Uttama', 'Madhyama', 'Heena'],
    isOverridden: false,
    provenance: {
      source: 'vitals',
      snippetHindi: 'Proportional body limbs with standard symmetrical dimensions.',
      snippetEnglish: 'Proportional body limbs with standard symmetrical dimensions.',
      confidence: 92,
    }
  },
  satmya: {
    id: 'satmya',
    key: 'Satmya',
    nameHindi: 'Satmya (Dietary Adaptability)',
    nameEnglish: 'Satmya (Dietary & Habitual Adaptability)',
    aiValue: 'Madhyama - Katu-Lavana Asatmya',
    currentValue: 'Madhyama - Katu-Lavana Asatmya',
    confidence: 86,
    options: ['Sarva Rasa Satmya', 'Madhyama', 'Eka Rasa Satmya', 'Madhyama - Katu-Lavana Asatmya'],
    isOverridden: false,
    provenance: {
      source: 'voice',
      snippetHindi: 'Immediate epigastric pain and burning upon consuming spicy and salty fried food.',
      snippetEnglish: 'Immediate epigastric pain and burning upon consuming spicy and salty fried food.',
      confidence: 86,
    }
  },
  satva: {
    id: 'satva',
    key: 'Satva',
    nameHindi: 'Satva (Mental Resilience & Strength)',
    nameEnglish: 'Satva (Mental Resilience & Strength)',
    aiValue: 'Madhyama Satva',
    currentValue: 'Madhyama Satva',
    confidence: 80,
    options: ['Pravara / High', 'Madhyama / Medium', 'Avara / Low'],
    isOverridden: false,
    provenance: {
      source: 'voice',
      snippetHindi: 'Patient alert and cooperative though mildly anxious about chronic pain.',
      snippetEnglish: 'Patient alert and cooperative though mildly anxious about chronic pain.',
      confidence: 80,
    }
  },
  aharaShakti: {
    id: 'aharaShakti',
    key: 'Ahara Shakti',
    nameHindi: 'Ahara Shakti (Digestive Capacity)',
    nameEnglish: 'Ahara Shakti (Digestive & Assimilation Capacity)',
    aiValue: 'Vishamagni / Mandagni',
    currentValue: 'Vishamagni / Mandagni',
    confidence: 89,
    options: ['Tikshnagni', 'Mandagni', 'Vishamagni', 'Samagni'],
    isOverridden: false,
    provenance: {
      source: 'voice',
      snippetHindi: 'Appetite erratic, postprandial heaviness lasting >3 hours.',
      snippetEnglish: 'Appetite erratic, postprandial heaviness lasting >3 hours.',
      confidence: 89,
    }
  },
  vyayamaShakti: {
    id: 'vyayamaShakti',
    key: 'Vyayama Shakti',
    nameHindi: 'Vyayama Shakti (Physical Exercise Capacity)',
    nameEnglish: 'Vyayama Shakti (Physical Exercise Capacity)',
    aiValue: 'Avara / Low',
    currentValue: 'Avara / Low',
    confidence: 76,
    options: ['Pravara / High', 'Madhyama / Moderate', 'Avara / Low'],
    isOverridden: false,
    provenance: {
      source: 'voice',
      snippetHindi: 'Fatigue climbing 1 flight of stairs; sedentary lifestyle.',
      snippetEnglish: 'Fatigue climbing 1 flight of stairs; sedentary lifestyle.',
      confidence: 76,
    }
  },
  vaya: {
    id: 'vaya',
    key: 'Vaya',
    nameHindi: 'Vaya (Age & Stage)',
    nameEnglish: 'Vaya (Age & Physiological Stage)',
    aiValue: 'Madhyama Vaya / 45 Yrs',
    currentValue: 'Madhyama Vaya / 45 Yrs',
    confidence: 99,
    options: ['Bala Vaya (<16)', 'Madhyama Vaya (16-60)', 'Vriddha Vaya (>60)'],
    isOverridden: false,
    provenance: {
      source: 'history',
      snippetHindi: 'Age 45 confirmed via ABHA Registry demographic profile.',
      snippetEnglish: 'Age 45 confirmed via ABHA Registry demographic profile.',
      confidence: 99,
    }
  }
};

export const socratesQuestions = [
  {
    step: 'S' as const,
    titleHindi: 'Site: Where exactly is the pain or primary discomfort located?',
    titleEnglish: 'Site: Where exactly is the pain or primary discomfort located?',
    hintHindi: 'e.g., Central retrosternal, epigastric, lower back...',
    hintEnglish: 'e.g., Central retrosternal, epigastric, lower back...',
    voicePromptHindi: 'Hello. Please describe where exactly in your body you are experiencing discomfort or pain.',
    autoExtracted: 'Epigastrium & Retrosternal region'
  },
  {
    step: 'O' as const,
    titleHindi: 'Onset: When and how did this condition first begin?',
    titleEnglish: 'Onset: When and how did this condition first begin?',
    hintHindi: 'e.g., Started gradually 3 weeks ago, worsens after oily meals...',
    hintEnglish: 'e.g., Started gradually 3 weeks ago, worsens after oily meals...',
    voicePromptHindi: 'When did this discomfort start? Did it begin gradually or suddenly?',
    autoExtracted: 'Subacute onset 3 weeks ago, progressively worsening after meals'
  },
  {
    step: 'C' as const,
    titleHindi: 'Character: Describe the quality and sensation of the discomfort',
    titleEnglish: 'Character: Describe the quality and sensation of the discomfort',
    hintHindi: 'e.g., Sharp burning, tight heaviness, throbbing, dull ache...',
    hintEnglish: 'e.g., Sharp burning, tight heaviness, throbbing, dull ache...',
    voicePromptHindi: 'How does the pain feel? Is it burning, heavy pressure, or sharp?',
    autoExtracted: 'Severe burning sensation with intermittent gripping tightness'
  },
  {
    step: 'R' as const,
    titleHindi: 'Radiation: Does the pain travel or radiate elsewhere?',
    titleEnglish: 'Radiation: Does the pain travel or radiate elsewhere?',
    hintHindi: 'e.g., Left shoulder, neck, jaw, interscapular back region...',
    hintEnglish: 'e.g., Left shoulder, neck, jaw, interscapular back region...',
    voicePromptHindi: 'Does the pain spread anywhere else, such as your shoulders, neck, or back?',
    autoExtracted: 'Radiates upward into the neck and anterior throat region'
  },
  {
    step: 'A' as const,
    titleHindi: 'Associations: Are there other concurrent symptoms?',
    titleEnglish: 'Associations: Are there other concurrent symptoms?',
    hintHindi: 'e.g., Acid regurgitation, nausea, diaphoresis, bloating...',
    hintEnglish: 'e.g., Acid regurgitation, nausea, diaphoresis, bloating...',
    voicePromptHindi: 'Are there other symptoms like sour belches, nausea, sweating, or dizziness?',
    autoExtracted: 'Frequent sour eructation (Amlodgara), mild post-meal nausea'
  },
  {
    step: 'T' as const,
    titleHindi: 'Timing: What is the pattern over 24 hours?',
    titleEnglish: 'Timing: What is the pattern over 24 hours?',
    hintHindi: 'e.g., Worse at night when lying flat, 30-60 min post lunch/dinner...',
    hintEnglish: 'e.g., Worse at night when lying flat, 30-60 min post lunch/dinner...',
    voicePromptHindi: 'What time of day is the pain worst? At night or after eating?',
    autoExtracted: 'Peaks 45-60 mins after heavy meals and when supine at night'
  },
  {
    step: 'E' as const,
    titleHindi: 'Exacerbating & Relieving Factors',
    titleEnglish: 'Exacerbating & Relieving Factors',
    hintHindi: 'e.g., Relieved slightly by cold water/antacid; aggravated by tea/spices...',
    hintEnglish: 'e.g., Relieved slightly by cold water/antacid; aggravated by tea/spices...',
    voicePromptHindi: 'Does anything make it feel better or worse?',
    autoExtracted: 'Aggravated by spicy/fried foods; temporary relief with antacid sips'
  },
  {
    step: 'Severity' as const,
    titleHindi: 'Severity: Rate your pain on a 0 to 10 scale',
    titleEnglish: 'Severity: Rate your pain on a 0 to 10 scale',
    hintHindi: '0 = No pain, 10 = Worst imaginable pain',
    hintEnglish: '0 = No pain, 10 = Worst imaginable pain',
    voicePromptHindi: 'On a scale of 0 to 10, how severe is your pain?',
    autoExtracted: '7 / 10 (Moderate to Severe intensity)'
  }
];

export const initialExtractedEntities: ExtractedEntity[] = [
  {
    id: 'drug-1',
    drugName: 'Tab. Pantoprazole',
    dosage: '40 mg',
    frequency: 'Once daily (OD) - Before Breakfast',
    route: 'Oral',
    confidence: 96,
    verified: true,
    flagged: false,
    originalText: 'Tab Pantop 40mg 1-0-0 AC x 14 days'
  },
  {
    id: 'drug-2',
    drugName: 'Syp. Sucralfate',
    dosage: '10 ml',
    frequency: 'Thrice daily (TID) - After Meals',
    route: 'Oral suspension',
    confidence: 91,
    verified: true,
    flagged: false,
    originalText: 'Syp Sucrafil 10ml TDS PC'
  },
  {
    id: 'drug-3',
    drugName: 'Avipattikar Churna',
    dosage: '3 gm',
    frequency: 'Twice daily with lukewarm water',
    route: 'Oral (Ayurvedic)',
    confidence: 88,
    verified: false,
    flagged: false,
    originalText: 'Avipattikar churna 3g BD with warm water'
  },
  {
    id: 'drug-4',
    drugName: 'Tab. Domperidone',
    dosage: '10 mg',
    frequency: 'SOS (When needed for nausea)',
    route: 'Oral',
    confidence: 83,
    verified: false,
    flagged: false,
    originalText: 'Tab Domstal 10mg SOS'
  }
];

export const initialLabValues: LabValue[] = [
  { test: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', referenceRange: '13.0 - 17.0', isAbnormal: false, direction: 'normal' },
  { test: 'Fasting Blood Sugar', value: '118', unit: 'mg/dL', referenceRange: '70 - 99', isAbnormal: true, direction: 'high' },
  { test: 'Serum Bilirubin (Total)', value: '0.9', unit: 'mg/dL', referenceRange: '0.2 - 1.2', isAbnormal: false, direction: 'normal' },
  { test: 'Serum Creatinine', value: '0.95', unit: 'mg/dL', referenceRange: '0.7 - 1.3', isAbnormal: false, direction: 'normal' },
  { test: 'SGPT (ALT)', value: '38', unit: 'U/L', referenceRange: '7 - 56', isAbnormal: false, direction: 'normal' }
];

export const initialRedFlags: RedFlagAlert[] = [
  {
    keyword: 'Retrosternal Gripping Pain',
    severity: 'P1',
    timestamp: '10:41 AM',
    description: 'Voice engine flagged potential retrosternal chest pressure and burning symptoms. Immediate casualty triage recommended.',
    vitalContext: 'BP 128/82 • HR 76 bpm'
  }
];

export const initialDiscrepancies: Discrepancy[] = [
  {
    field: 'Discrepancy: Pantoprazole Frequency',
    voiceSays: 'Patient states taking Pantoprazole twice daily (BD)',
    documentSays: 'Prescription OCR specifies once daily (OD) before breakfast',
    status: 'pending'
  }
];

export const initialSoapDraft: SoapDraft = {
  subjective: '45-year-old male presents with a 3-week history of epigastric burning pain and retrosternal discomfort. Symptoms peak 45 minutes postprandially, accompanied by sour belching.',
  objective: 'Vitals: BP 128/82 mmHg, Pulse 76 bpm, SpO2 98% on room air. Abdomen: Soft, mild epigastric tenderness on deep palpation, no organomegaly.',
  assessment: 'Primary Diagnosis: Gastroesophageal Reflux Disease (GERD) / Severe Amlapitta with Pitta-Vata involvement. Rule out H. pylori gastropathy.',
  plan: '1. Tab. Pantoprazole 40mg OD before breakfast for 14 days.\n2. Syp. Sucralfate 10ml TID post meals.\n3. Avipattikar Churna 3g BD with warm water.\n4. Follow-up in 2 weeks or immediate ER visit if chest pressure recurs.'
};

export const initialPatientQueue: PatientQueueItem[] = [
  {
    token: 'K-1042',
    name: 'Rajesh Kumar',
    age: 45,
    gender: 'Male',
    complaint: 'Severe Epigastric Pain',
    priority: 'P2',
    mode: 'dual',
    kiosk: 'Kiosk 01',
    waitTime: '~4 mins',
    redFlag: 'Cardiac Rule-out P1',
    status: 'in_progress'
  },
  {
    token: 'K-1043',
    name: 'Priya Sharma',
    age: 38,
    gender: 'Female',
    complaint: 'Chronic Migraine & Nausea',
    priority: 'P3',
    mode: 'allopathic',
    kiosk: 'Kiosk 02',
    waitTime: '~12 mins',
    redFlag: null,
    status: 'waiting'
  },
  {
    token: 'K-1044',
    name: 'Amitabh Sen',
    age: 62,
    gender: 'Male',
    complaint: 'Joint Pain & Stiffness',
    priority: 'P3',
    mode: 'ayurvedic',
    kiosk: 'Kiosk 03',
    waitTime: '~18 mins',
    redFlag: null,
    status: 'waiting'
  }
];

export const validFhirR4Bundle = {
  resourceType: 'Bundle',
  type: 'transaction',
  entry: [
    {
      resource: {
        resourceType: 'Patient',
        id: 'pat-rajesh-kumar',
        name: [{ text: 'Rajesh Kumar' }],
        gender: 'male',
        birthDate: '1981-08-15'
      }
    }
  ]
};
