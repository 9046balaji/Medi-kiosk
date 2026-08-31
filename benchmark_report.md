# MediKiosk 22-Language Master System Benchmark Report

- **Timestamp**: 2026-08-31 18:32:29
- **Hardware VRAM**: 510 MB Used / 6141 MB Total (5411 MB Free)

## 1. Summary Metrics

| Component | Supported Languages | Pass Rate | Avg Latency | P95 Latency | Min Latency |
|---|---|---|---|---|---|
| **IndicTrans2 Translation (Port 8000)** | 22 | 22/22 (100%) | 2039.2 ms | 2055.4 ms | 2018.9 ms |
| **IndicConformer ASR (Port 8001)** | 23 | 23/23 (100%) | 465.8 ms | 656.7 ms | 298.7 ms |
| **Indic Parler-TTS (Port 8002)** | 23 | 23/23 (100%) | 4290.6 ms | 6674.5 ms | 2287.7 ms |
| **Emergency Triage Engine** | 9 | 9/9 (100%) | 0.0 ms | 0.0 ms | 0.0 ms |

## 2. Translation Performance (IndicTrans2 — Port 8000)

| Language | FLORES Code | Latency (ms) | Output Sample |
|---|---|---|---|
| Assamese | `asm_Beng` | 2018.92 ms | মেডিকিয়স্ক স্বাস্থ্য কেন্দ্ৰলৈ স্বাগতম জনাইছো। |
| Bengali | `ben_Beng` | 2026.42 ms | মিডিকিওস্ক স্বাস্থ্য কেন্দ্রে আপনাকে স্বাগতম। |
| Bodo | `brx_Deva` | 2028.89 ms | मीडिय'स्क सावस्रि मिरुआव नोंखौ हामसिन। |
| Dogri | `doi_Deva` | 2046.25 ms | मीडियोकियोस्क स्वास्थ केंदर च सुआगत ऐ। |
| Gujarati | `guj_Gujr` | 2043.78 ms | મીડિયોકિયોસ્ક આરોગ્ય કેન્દ્રમાં આપનું સ્વાગત છે. |
| Hindi | `hin_Deva` | 2049.2 ms | मीडियोकियोस्क स्वास्थ्य केंद्र में आपका स्वागत है। |
| Kannada | `kan_Knda` | 2071.34 ms | ಮೀಡಿಯಾಕಿಯೋಸ್ಕ್ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ ಸ್ವಾಗತ. |
| Kashmiri | `kas_Arab` | 2042.37 ms | میڈی کیوسک ہیلتھ سینٹرس منٛز خوش آمدید۔ |
| Konkani | `gom_Deva` | 2047.39 ms | मीडियोकियोस्क भलायकी केंद्रांत येवकार. |
| Maithili | `mai_Deva` | 2055.42 ms | मीडियोकियोस्क स्वास्थ्य केन्द्रमे स्वागत अछि। |
| Malayalam | `mal_Mlym` | 2035.15 ms | മീഡിയികോസ്ക് ആരോഗ്യ കേന്ദ്രത്തിലേക്ക് സ്വാഗതം. |
| Manipuri | `mni_Beng` | 2034.16 ms | মেদিকোস্ক হেল্থ সেন্তরদা নুংঙাইবা ফোঙদোকচরি। |
| Marathi | `mar_Deva` | 2034.96 ms | मीडियोकियोस्क आरोग्य केंद्रात आपले स्वागत आहे. |
| Nepali | `npi_Deva` | 2041.36 ms | मिडियोकियोस्क स्वास्थ्य केन्द्रमा स्वागत छ। |
| Odia | `ory_Orya` | 2027.58 ms | ମେଡିକୋସ୍କ ସ୍ୱାସ୍ଥ୍ଯ଼ କେନ୍ଦ୍ରକୁ ଆପଣଙ୍କୁ ସ୍ୱାଗତ। |
| Punjabi | `pan_Guru` | 2043.2 ms | ਮੀਡੀ ਕਿਓਸਕ ਸਿਹਤ ਕੇਂਦਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। |
| Sanskrit | `san_Deva` | 2037.96 ms | मीडियाकोस्क् स्वास्थ्यकेन्द्रं प्रति भवतां स्वागतम्। |
| Santali | `sat_Olck` | 2022.17 ms | ᱢᱮᱰᱤ ᱠᱤᱣᱚᱥᱠ ᱥᱟᱧᱪᱟᱣ ᱛᱟᱞᱢᱟ ᱨᱮ ᱟᱢ ᱠᱚ ସ୍ବାଗତମ ᱾ |
| Sindhi | `snd_Arab` | 2026.45 ms | MediKiosk صحت مرڪز ۾ خوش آمدید |
| Tamil | `tam_Taml` | 2054.89 ms | மெடிகியோஸ்க் சுகாதார மையத்திற்கு வரவேற்கிறேன். |
| Telugu | `tel_Telu` | 2043.29 ms | మీడియాకోస్క్ ఆరోగ్య కేంద్రానికి స్వాగతం. |
| Urdu | `urd_Arab` | 2030.66 ms | میڈی کیوسک ہیلتھ سینٹر میں خوش آمدید۔ |

## 3. Speech Synthesis Performance (Indic Parler-TTS — Port 8002)

| Language | Speaker Persona | Latency (ms) | Audio Length | File Size |
|---|---|---|---|---|
| Assamese | `Sita` | 3140.1 ms | 2.54s | 219.0 KB |
| Bengali | `Aditi` | 3096.0 ms | 2.61s | 225.0 KB |
| Bodo | `Maya` | 2287.7 ms | 1.78s | 153.0 KB |
| Dogri | `Karan` | 2771.1 ms | 2.26s | 195.0 KB |
| Gujarati | `Neha` | 4462.5 ms | 3.63s | 313.0 KB |
| Hindi | `Divya` | 6179.1 ms | 3.13s | 270.0 KB |
| Kannada | `Anu` | 2559.1 ms | 1.76s | 152.0 KB |
| Kashmiri | `default` | 5583.3 ms | 3.39s | 292.0 KB |
| Konkani | `Sunita` | 5226.9 ms | 2.45s | 211.0 KB |
| Maithili | `Divya` | 3270.7 ms | 2.61s | 225.0 KB |
| Malayalam | `Anjali` | 2297.9 ms | 1.83s | 158.0 KB |
| Manipuri | `Laishram` | 5941.7 ms | 2.74s | 236.0 KB |
| Marathi | `Sunita` | 3401.5 ms | 2.76s | 238.0 KB |
| Nepali | `Amrita` | 7429.1 ms | 2.29s | 197.0 KB |
| Odia | `Debjani` | 5964.3 ms | 3.17s | 273.0 KB |
| Punjabi | `Gurpreet` | 3832.1 ms | 3.18s | 274.0 KB |
| Sanskrit | `Aryan` | 4312.0 ms | 3.62s | 312.0 KB |
| Santali | `Maya` | 2506.5 ms | 1.94s | 167.0 KB |
| Sindhi | `Divya` | 4998.7 ms | 3.72s | 320.0 KB |
| Tamil | `Jaya` | 6674.5 ms | 2.48s | 214.0 KB |
| Telugu | `Lalitha` | 4612.8 ms | 2.03s | 175.0 KB |
| Urdu | `default` | 3592.2 ms | 3.10s | 267.0 KB |
| English | `Mary` | 4544.5 ms | 3.98s | 343.0 KB |
