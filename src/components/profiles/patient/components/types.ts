export interface PastCondition {
  id: string;
  name: string;
  code: string;
  diagnosedYear: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Controlled';
  status: 'Active' | 'Under Treatment' | 'Resolved';
  hospital: string;
  notes: string;
}

export interface AllergyItem {
  id: string;
  allergen: string;
  type: 'Drug' | 'Food' | 'Environmental';
  reaction: string;
  severity: 'CRITICAL' | 'MODERATE' | 'MILD';
}

export interface PastMedicineItem {
  id: string;
  name: string;
  formulation: 'Tablet' | 'Capsule' | 'Syrup' | 'Churna' | 'Vati' | 'Injection';
  dosage: string;
  frequency: string;
  system: 'Allopathic' | 'Ayurvedic' | 'Homeopathic';
  prescribedBy: string;
  startDate: string;
  endDate: string;
  discontinuationReason: 'Completed Course' | 'Switched / Replaced' | 'Side Effect / Discontinued' | 'Tapered Off';
  notes: string;
}

export interface FamilyMemberItem {
  id: string;
  name: string;
  relationship: 'Father' | 'Mother' | 'Spouse' | 'Son' | 'Daughter' | 'Brother' | 'Sister' | 'Grandfather' | 'Grandmother';
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  abhaId?: string;
  chronicConditions: string[];
  status: 'Living • Under Treatment' | 'Living • Healthy' | 'Deceased';
  causeOfDeath?: string;
  emergencyContact?: string;
  notes: string;
}
