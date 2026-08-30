import { Language } from '../types';

export const LANGUAGE_FLORES_MAP: Record<Language, string> = {
  english: 'eng_Latn',
  hindi: 'hin_Deva',
  assamese: 'asm_Beng',
  bengali: 'ben_Beng',
  bodo: 'brx_Deva',
  dogri: 'doi_Deva',
  gujarati: 'guj_Gujr',
  kannada: 'kan_Knda',
  kashmiri: 'kas_Arab',
  konkani: 'gom_Deva',
  maithili: 'mai_Deva',
  malayalam: 'mal_Mlym',
  manipuri: 'mni_Beng',
  marathi: 'mar_Deva',
  nepali: 'npi_Deva',
  odia: 'ory_Orya',
  punjabi: 'pan_Guru',
  sanskrit: 'san_Deva',
  santali: 'sat_Olck',
  sindhi: 'snd_Arab',
  tamil: 'tam_Taml',
  telugu: 'tel_Telu',
  urdu: 'urd_Arab'
};

export const ALL_SUPPORTED_LANGUAGES: {
  id: Language;
  label: string;
  native: string;
  flores: string;
  badge: string;
}[] = [
  { id: 'english', label: 'English', native: 'English', flores: 'eng_Latn', badge: 'Default' },
  { id: 'hindi', label: 'Hindi', native: 'हिन्दी', flores: 'hin_Deva', badge: 'Scheduled-8' },
  { id: 'assamese', label: 'Assamese', native: 'অসমীয়া', flores: 'asm_Beng', badge: 'Scheduled-8' },
  { id: 'bengali', label: 'Bengali', native: 'বাংলা', flores: 'ben_Beng', badge: 'Scheduled-8' },
  { id: 'bodo', label: 'Bodo', native: 'बड़ो', flores: 'brx_Deva', badge: 'Scheduled-8' },
  { id: 'dogri', label: 'Dogri', native: 'डोगरी', flores: 'doi_Deva', badge: 'Scheduled-8' },
  { id: 'gujarati', label: 'Gujarati', native: 'ગુજરાતી', flores: 'guj_Gujr', badge: 'Scheduled-8' },
  { id: 'kannada', label: 'Kannada', native: 'ಕನ್ನಡ', flores: 'kan_Knda', badge: 'Scheduled-8' },
  { id: 'kashmiri', label: 'Kashmiri', native: 'كأشُر', flores: 'kas_Arab', badge: 'Scheduled-8' },
  { id: 'konkani', label: 'Goan Konkani', native: 'कोंकणी', flores: 'gom_Deva', badge: 'Scheduled-8' },
  { id: 'maithili', label: 'Maithili', native: 'मैथिली', flores: 'mai_Deva', badge: 'Scheduled-8' },
  { id: 'malayalam', label: 'Malayalam', native: 'മലയാളം', flores: 'mal_Mlym', badge: 'Scheduled-8' },
  { id: 'manipuri', label: 'Manipuri', native: 'মৈতৈলোন্', flores: 'mni_Beng', badge: 'Scheduled-8' },
  { id: 'marathi', label: 'Marathi', native: 'मराठी', flores: 'mar_Deva', badge: 'Scheduled-8' },
  { id: 'nepali', label: 'Nepali', native: 'नेपाली', flores: 'npi_Deva', badge: 'Scheduled-8' },
  { id: 'odia', label: 'Odia', native: 'ଓଡ଼ିଆ', flores: 'ory_Orya', badge: 'Scheduled-8' },
  { id: 'punjabi', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', flores: 'pan_Guru', badge: 'Scheduled-8' },
  { id: 'sanskrit', label: 'Sanskrit', native: 'संस्कृतम्', flores: 'san_Deva', badge: 'Scheduled-8' },
  { id: 'santali', label: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', flores: 'sat_Olck', badge: 'Scheduled-8' },
  { id: 'sindhi', label: 'Sindhi', native: 'سنڌي', flores: 'snd_Arab', badge: 'Scheduled-8' },
  { id: 'tamil', label: 'Tamil', native: 'தமிழ்', flores: 'tam_Taml', badge: 'Scheduled-8' },
  { id: 'telugu', label: 'Telugu', native: 'తెలుగు', flores: 'tel_Telu', badge: 'Scheduled-8' },
  { id: 'urdu', label: 'Urdu', native: 'اردو', flores: 'urd_Arab', badge: 'Scheduled-8' }
];

export function getFloresCode(lang: Language): string {
  return LANGUAGE_FLORES_MAP[lang] || 'hin_Deva';
}
