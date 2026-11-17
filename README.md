# หวยวน | วิเคราะห์เลขย้อนหลัง (lpa)

เว็บแอปภาษาไทยสำหรับวิเคราะห์ "เลขวน" ของสลากกินแบ่งรัฐบาลไทย — เทียบชุดเลขเด่นระหว่างงวดก่อนกับงวดหลัง ดูเลขซ้ำ เลขใหม่ และสถิติย้อนหลัง เข้าใจง่ายในหน้าเดียว

> **เครื่องมือวิเคราะห์ข้อมูลย้อนหลังเพื่อการเรียนรู้เท่านั้น — ไม่ใช่เครื่องมือรับประกันหรือทำนายผลหวย**

## เทคโนโลยี

- React 19 + TypeScript (Strict Mode) + Vite (bun)
- Tailwind CSS v4 + shadcn/ui + Lucide React
- Recharts (กราฟ), react-router-dom v7
- Vitest + Testing Library (unit tests)
- Dark Mode / Light Mode, Responsive มือถือ→เดสก์ท็อป, ปี พ.ศ., ฟอนต์ Sarabun / IBM Plex Sans Thai

## การติดตั้งและรัน (ใช้ bun)

```bash
bun install      # ติดตั้ง dependencies
bun run dev      # รัน dev server → http://localhost:5173
bun run build    # type-check (tsc -b) + build production ลง dist/
bun run preview  # รันไฟล์ build ที่ได้
bun run test     # รัน unit tests รอบเดียว (vitest run)
bun run test:watch  # รัน tests แบบ watch
```

## หน้าต่างๆ

| หน้า | เส้นทาง | ความสามารถ |
|---|---|---|
| ภาพรวม | `/` | เทียบงวดล่าสุดกับงวดก่อน, เลือกงวดได้, KPI 5 ตัวพร้อม tooltip, การ์ด "งวดถัดไปน่าจะออกอะไรจากสูตรเลขวน" — เลขวนรายหลัก + เลขประกอบ 2 ตัวทุกแบบพร้อมสถิติการออกจริงย้อนหลัง |
| เปรียบเทียบงวด | `/compare` | เลือกงวดใดก็ได้ ดูผลเทียบครบ 4 เกณฑ์แยกกัน |
| สถิติย้อนหลัง | `/history` | ตารางทุกงวด: filter ปี/สถานะ, search, sort, pagination, คลิกแถวเปิด Sheet, กราฟ 3 ตัว |
| วิธีการวิเคราะห์ | `/method` | ขั้นตอนคิด, แยกเกณฑ์เลขซ้ำ 1 หลัก / 2 หลัก / ถูกตำแหน่ง, สไลเดอร์ความน่าจะเป็น |

## หลักการวิเคราะห์

- เลข 2 ตัวบน = สองหลักท้ายของรางวัลที่ 1
- เลข 2 ตัวล่าง = รางวัลเลขท้าย 2 ตัว
- ชุดเลขเด่น = เลขบน + เลขล่าง ตัดตัวที่ซ้ำออก (เก็บเป็น string รักษาเลข 0 นำหน้า)
- เปรียบเทียบกับงวดก่อนหน้า → แยกรายงาน **4 เกณฑ์แยกจากกันเสมอ ไม่รวมเป็นอัตราเดียว**:
  1. มีเลขซ้ำอย่างน้อย 1 หลัก
  2. เลขบนตรงกันทั้ง 2 หลัก
  3. เลขล่างตรงกันทั้ง 2 หลัก
  4. ทายเลข 2 ตัวถูกตามตำแหน่งจริง (ข้อ 2 หรือ 3 เป็นจริง)

## การจัดการข้อมูล — ทำผ่านไฟล์ JSON + เครื่องมือดึงอัตโนมัติ

ชุดข้อมูลปัจจุบัน: **882 งวด ครบทุกงวดที่ myhora มี พ.ศ. 2533 – 2569 (1990–2026)** อยู่ที่ `src/data/lottery-results.json`

### เครื่องมือดึงข้อมูล (`tools/fetch-lottery.ts` — รันด้วย bun)

```bash
bun run fetch              # ดึงเฉพาะงวดใหม่ที่ยังไม่มีในไฟล์ (ใช้ประจำหลังงวดออกทุกวันที่ 1, 16)
bun run fetch:all          # ดึงประวัติทั้งหมด พ.ศ. 2533 → ปัจจุบัน แล้ว merge เข้าไฟล์
bun run fetch -- --dry-run # ดูผลก่อนโดยไม่เขียนไฟล์จริง
bun run fetch:all -- --from-year 2560 --to-year 2569   # เลือกช่วงปีได้
```

เครื่องมือนี้ parse หน้าผลย้อนหลังรายปีของ [myhora.com](https://myhora.com/lottery/result-2569.aspx) (เว็บนี้บล็อก HTTP client ของ bun/node ด้วย TLS fingerprint จึงใช้ `curl` ภายในเครื่องเป็นตัวดึง — Windows 10+/macOS/Linux มี curl ในตัวทั้งหมด) จับคู่งวดใหม่ด้วยวันที่ ห้ามซ้ำ และ merge แบบ union โดยข้อมูลเดิมในไฟล์มีสิทธิ์ก่อนเสมอ หลังดึงเสร็จรีเฟรชหน้าเว็บได้เลย

หมายเหตุ: ถ้าดึงติดต่อกันเร็วมาก myhora อาจส่ง Cloudflare challenge (403) — รอสักครู่แล้วรันใหม่ หรือลดจำนวนปีต่อรอบ

### แก้ไฟล์เองก็ได้

```json
{
  "meta": { "source": "…", "updatedAt": "2026-11-17", "note": "…" },
  "draws": [
    { "date": "2026-11-16", "firstPrize": "645654", "lastTwoDigits": "06" }
  ]
}
```

กติกาที่แอปตรวจตอนโหลด (ถ้าผิดจะแสดง Error State ระบุตำแหน่งให้แก้):

- `date` — วันที่ ISO ค.ศ. `yyyy-MM-dd` ต้องเป็นวันที่จริง **และห้ามซ้ำกับงวดอื่น**
- `firstPrize` — string ตัวเลข **6 หลัก** (งวดยุคก่อน พ.ศ. 2538 เป็น **7 หลัก** — เลขบน = สองหลักท้ายเหมือนกันทั้งสองยุค) เก็บ string เพื่อรักษาเลข 0 นำหน้า เช่น `004615`
- `lastTwoDigits` — string ตัวเลข 2 หลัก (เช่น `06`)
- ลำดับในไฟล์ไม่สำคัญ — แอปเรียงตามวันที่เอง

## โครงสร้างโค้ด

```
src/
├── data/                     # lottery-results.json (ข้อมูลจริง + ไฟล์เทสทาบโจทย์)
├── components/
│   ├── layout/               # Header (nav + theme toggle), Footer (disclaimer)
│   ├── lottery/              # DigitTile, DigitRow, DrawCard, ComparisonHero,
│   │                         # ResultSummaryCard, CriteriaBadges, ComparisonLegend
│   ├── charts/               # กราฟ 3 ตัว (Recharts) + ChartCard
│   └── ui/                   # shadcn/ui
├── features/lottery/
│   ├── types/                # LotteryDraw, DrawComparison, สถิติ, ทำนาย
│   ├── utils/                # pure functions: digits, compare, statistics,
│   │                         # thaiDate (พ.ศ.), validate (ตรวจ JSON)
│   ├── services/             # LotteryRepository interface + StaticJsonRepository
│   │                         # (สลับเป็น REST API ภายหลังได้ที่จุดเดียว)
│   ├── hooks/                # useLotteryData (context + loading/error/reload)
│   └── components/           # DrawSelector, KpiCards, HistoryTable, DrawDetailSheet,
│                             # PredictionCard, ProbabilitySection, DataStatusViews
├── lib/                      # cn, ThemeProvider
└── pages/                    # Overview, Compare, History, Methodology
```

Logic หลักเป็น pure functions (`features/lottery/utils/`) มี unit tests ครอบเคสสำคัญ: เลข 0 นำหน้า, เลขซ้ำในงวดเดียวกัน, ไม่มีงวดก่อนหน้า, ชุดตรงทั้งหมด, ไม่ตรงเลย, เกณฑ์บน/ล่าง/ตำแหน่งแยกกัน, ข้อมูลไม่เรียง, การตรวจ JSON และทาบข้อมูลจริงกับตัวอย่างในโจทย์

## แหล่งข้อมูล

ผลหวย 882 งวด (16 ม.ค. 2533 – 16 พ.ย. 2569 / 1990–2026 ครบทุกงวดใน archives ของ myhora) รวบรวมจาก [myhora.com](https://myhora.com/lottery/result-2569.aspx) ด้วย `tools/fetch-lottery.ts` และตรวจสอบข้ามแหล่งกับ [Sanook Lotto](https://news.sanook.com/lotto/check/16102569) โดยงวดตัวอย่างจากโจทย์ (1 พ.ย. 2569 = 423224 / ล่าง 85, 16 พ.ย. 2569 = 645654 / ล่าง 06) ตรงกันทุกหลัก — มี unit test ทาบทุกครั้งที่รันเทส

## ข้อจำกัด (อ่านก่อนใช้)

- การนับสถิติย้อนหลังบอกได้แค่ว่าอดีตเกิดขึ้นบ่อยแค่ไหน ไม่สามารถทำนายหรือเพิ่มโอกาสถูกรางวัลได้ เพราะผลแต่ละงวดสุ่มอิสระจากกัน
- "งวดถัดไปจากสูตรเลขวน" เป็นการนับสถิติตามสูตรเท่านั้น ไม่ใช่การรับประกัน
- ตัวอย่างความน่าจะเป็นในหน้าวิธีการวิเคราะห์ (เช่น 64% ที่ k=4) อ้างอิงสมมติฐานการสุ่มอิสระ ไม่ใช่ความน่าจะเป็นตายตัวของทุกงวด
