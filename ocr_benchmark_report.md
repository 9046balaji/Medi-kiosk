# MediKiosk Florence-2 Vision OCR Dedicated Benchmark Report

- **Timestamp**: 2026-08-31 19:07:29
- **Engine**: `microsoft/Florence-2-base` (Port 8003)
- **Hardware VRAM**: 1068 MB Used / 6140 MB Total (5072 MB Free)

## 1. Summary Metrics

| Metric | Result |
|---|---|
| **Total Real Prescriptions Tested** | 7 |
| **Pass Rate** | 7/7 (100%) |
| **Average Latency** | 1534.55 ms |
| **P95 Latency** | 3943.77 ms |
| **Min Latency** | 436.36 ms |
| **Max Latency** | 4714.50 ms |

## 2. Detailed Per-Image OCR Results

| Test Image | Latency (ms) | Extracted Meds | Lab Values | Discrepancies | Raw OCR Sample |
|---|---|---|---|---|---|
| `OIP.webp` | 4714.5 ms | 1 items | 1 items | 1 | Feevan HospitalRag. No. 888664573:00:0000ACAZY, Tiring AMILD... |
| `OIP (1).webp` | 2145.39 ms | 1 items | 0 items | 1 | STATEMENTDARE OF MEMPAGEDECOMPICA DE SONCEOMASACSOCETEAM-ANC... |
| `OIP (2).webp` | 475.65 ms | 0 items | 0 items | 0 | 0.0.00.000.00PAL VOL NER TX2336.00TOTALS185834.3019604.38SF ... |
| `OIP (3).webp` | 748.66 ms | 1 items | 1 items | 1 | Name: Armande CopuaAddress: west Kombo, Makate CityAge-29Sex... |
| `OIP (4).webp` | 985.54 ms | 1 items | 0 items | 1 | DEAN GB 0455516LIC # 976268MEDICAL CENTRE824 1e" StreetNew Y... |
| `OIP (5).webp` | 436.36 ms | 0 items | 0 items | 0 | A.L.M.S. HOSPITAL-Out Patient DepartmentGPR-Methra100111735... |
| `OIP (6).webp` | 1235.76 ms | 1 items | 1 items | 1 | Dr. Y. MAGENDAR RAOConstant Hure - PaymntiDate: 15-03-5Cunne... |
