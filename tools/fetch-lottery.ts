/**
 * เครื่องมือดึงผลสลากกินแบ่งรัฐบาลจาก myhora.com แล้ว merge ลง src/data/lottery-results.json
 *
 * การใช้งาน (รันด้วย bun):
 *   bun run tools/fetch-lottery.ts            # ดึงเฉพาะงวดใหม่ที่ยังไม่มีในไฟล์ (incremental)
 *   bun run tools/fetch-lottery.ts --all      # ดึงประวัติย้อนหลังทั้งหมด (พ.ศ. 2533 → ปัจจุบัน) แล้วแทนที่ไฟล์
 *   bun run tools/fetch-lottery.ts --all --from-year 2560 --to-year 2569
 *   bun run tools/fetch-lottery.ts --dry-run  # ดูผลโดยไม่เขียนไฟล์จริง
 *
 * หมายเหตุ: เว็บ myhora ไม่มี API สาธารณะ เครื่องมือนี้ parse โครงสร้าง HTML ของหน้าผลย้อนหลังรายปี
 * ถ้าเว็บเปลี่ยนโครงสร้าง ให้แก้ parser ใน parseYearPage()
 */

import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const DATA_FILE = path.resolve(import.meta.dirname, "../src/data/lottery-results.json");
const YEAR_URL = (beYear: number) => `https://myhora.com/lottery/result-${beYear}.aspx`;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const MIN_BE_YEAR = 2533; // ปีเก่าสุดที่ myhora มีข้อมูล
const REQUEST_DELAY_MS = 400;

interface LotteryDraw {
  date: string;
  firstPrize: string;
  lastTwoDigits: string;
}

interface DrawFile {
  meta: { source?: string; updatedAt?: string; note?: string };
  draws: LotteryDraw[];
}

function parseArgs(): { all: boolean; dryRun: boolean; fromYear?: number; toYear?: number } {
  const argv = process.argv.slice(2);
  const getNum = (flag: string) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? Number(argv[index + 1]) : undefined;
  };
  return {
    all: argv.includes("--all"),
    dryRun: argv.includes("--dry-run"),
    fromYear: getNum("--from-year"),
    toYear: getNum("--to-year"),
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * ดึงหน้า HTML ผ่าน curl (myhora บล็อก HTTP client ของ bun/node ด้วย TLS fingerprint — 403)
 * ทุกแพลตฟอร์มที่รันโปรเจกต์นี้มี curl ให้ใช้ (Windows 10+ มี curl.exe ในตัว)
 */
async function fetchText(url: string): Promise<string> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = spawnSync(
      "curl",
      [
        "-s",
        "--fail",
        "-L",
        "-A",
        USER_AGENT,
        "-H",
        "Accept: text/html",
        "--max-time",
        "60",
        url,
      ],
      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, windowsHide: true },
    );
    if (result.status === 0 && result.stdout) {
      return result.stdout;
    }
    const reason = result.error?.message ?? `curl exit ${result.status}`;
    if (attempt === 3) {
      throw new Error(`ดึงหน้าไม่สำเร็จ (${reason}): ${url}`);
    }
    await sleep(1200 * attempt);
  }
  throw new Error("unreachable");
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toIsoDate(day: string, month: string, beYear: string): string | null {
  const ceYear = Number(beYear) - 543;
  const iso = `${ceYear}-${month}-${day}`;
  if (!ISO_DATE_RE.test(iso)) return null;
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== iso) return null;
  return iso;
}

/**
 * Parse หน้าผลย้อนหลังรายปี
 * โครงสร้างต่องวด: <a href='/lottery/result-DD-MM-BBBB.aspx' ...> …
 *   <div class='lot-id' …><div class='lot-tr'>หัวคอลัมน์ (lot-tc)</div>
 *   <div class='lot-dr'>
 *     <div class='lot-dc lotto-fxl' …>รางวัลที่ 1 (6 หลัก)</div>
 *     … (เลขหน้า 3 ตัว, เลขท้าย 3 ตัว)
 *     <div class='lot-dc lotto-fxl' …>เลขท้าย 2 ตัว</div>
 */
function parseYearPage(html: string): LotteryDraw[] {
  const draws: LotteryDraw[] = [];
  const chunks = html.split("<a href='/lottery/result-").slice(1);

  for (const chunk of chunks) {
    const dateMatch = chunk.match(/^(\d{2})-(\d{2})-(\d{4})\.aspx/);
    if (!dateMatch) continue;
    const iso = toIsoDate(dateMatch[1], dateMatch[2], dateMatch[3]);
    if (!iso) continue;

    const rowStart = chunk.indexOf("class='lot-dr'");
    if (rowStart === -1) continue;
    const row = chunk.slice(rowStart);
    const cells = [...row.matchAll(/class='lot-dc lotto-fxl'[^>]*>([\d\s&;]*?)</g)].map(
      (match) => match[1].replace(/&nbsp;|\s/g, ""),
    );
    if (cells.length < 2) continue;

    const firstPrize = cells[0];
    const lastTwoDigits = cells[cells.length - 1];
    // ยุคก่อน พ.ศ. 2538 รางวัลที่ 1 มี 7 หลัก — เลขบน (สองหลักท้าย) ใช้ต่อได้เหมือนกัน
    if (!/^\d{6,7}$/.test(firstPrize) || !/^\d{2}$/.test(lastTwoDigits)) continue;

    draws.push({ date: iso, firstPrize, lastTwoDigits });
  }
  return draws;
}

const byDateDesc = (a: LotteryDraw, b: LotteryDraw) => b.date.localeCompare(a.date);

async function main() {
  const args = parseArgs();
  const currentBeYear = new Date().getFullYear() + 543;
  const existing: DrawFile = JSON.parse(readFileSync(DATA_FILE, "utf8"));
  const existingDates = new Set(existing.draws.map((draw) => draw.date));

  let years: number[];
  if (args.all) {
    const fromYear = Math.min(args.fromYear ?? MIN_BE_YEAR, currentBeYear);
    const toYear = Math.min(args.toYear ?? currentBeYear, currentBeYear);
    years = [];
    for (let year = toYear; year >= fromYear; year--) years.push(year);
  } else {
    // incremental: ปีของงวดใหม่สุดในไฟล์ + ปีปัจจุบัน (กันกรณีข้ามปี)
    const newest = [...existing.draws].sort(byDateDesc)[0];
    const newestBeYear = newest ? Number(newest.date.slice(0, 4)) + 543 : currentBeYear;
    years = [...new Set([currentBeYear, newestBeYear])];
  }

  console.log(
    `ดึงข้อมูล ${args.all ? "ประวัติทั้งหมด" : "งวดใหม่"} ปี พ.ศ. ${years[years.length - 1]}–${years[0]} (${years.length} ปี) จาก myhora.com…`,
  );

  const fetched: LotteryDraw[] = [];
  const failedYears: { year: number; draws: number; error: string }[] = [];
  for (const [index, year] of years.entries()) {
    try {
      const html = await fetchText(YEAR_URL(year));
      const draws = parseYearPage(html);
      fetched.push(...draws);
      console.log(`  พ.ศ. ${year}: ${draws.length} งวด`);
      if (draws.length === 0) failedYears.push({ year, draws: 0, error: "parse ได้ 0 งวด (โครงสร้างเว็บเปลี่ยน?)" });
    } catch (error) {
      console.error(`  พ.ศ. ${year}: ผิดพลาด — ${error instanceof Error ? error.message : error}`);
      failedYears.push({ year, draws: 0, error: String(error) });
    }
    if (index < years.length - 1) await sleep(REQUEST_DELAY_MS);
  }

  // union: ของเดิมในไฟล์มีสิทธิ์ก่อน (กันกรณีปีใด fetch พังแล้วข้อมูลหาย)
  // งวดจากการดึงที่ยังไม่มีจะถูกเพิ่มเข้าไป แล้วเรียงใหม่ → เก่า
  const merged = new Map<string, LotteryDraw>();
  for (const draw of existing.draws) merged.set(draw.date, draw);
  let addedFromFetch = 0;
  let dupInFetch = 0;
  for (const draw of fetched) {
    if (merged.has(draw.date)) {
      dupInFetch += 1;
      continue;
    }
    merged.set(draw.date, draw);
    addedFromFetch += 1;
  }
  const nextDraws = [...merged.values()].sort(byDateDesc);

  const result: DrawFile = {
    meta: {
      ...existing.meta,
      source: `สลากกินแบ่งรัฐบาลไทย — รวบรวมจาก myhora.com ด้วย tools/fetch-lottery.ts (ตรวจสอบข้ามแหล่งกับ sanook.com และตัวอย่างในโจทย์)`,
      updatedAt: new Date().toISOString().slice(0, 10),
      note: "เพิ่มงวดใหม่ด้วย bun tools/fetch-lottery.ts (หรือ --all สำหรับประวัติเต็ม) ตัวเลขทั้งหมดเก็บเป็น string เพื่อรักษาเลข 0 นำหน้า ห้ามมีวันที่ซ้ำ",
    },
    draws: nextDraws,
  };

  console.log("\n=== สรุป ===");
  console.log(`งวดในไฟล์เดิม: ${existing.draws.length}`);
  console.log(
    `งวดใหม่ที่ได้เพิ่ม: ${addedFromFetch}${dupInFetch ? ` (งวดที่มีอยู่แล้วจากการดึง: ${dupInFetch})` : ""}`,
  );
  console.log(`งวดรวมหลัง merge: ${result.draws.length}`);
  if (result.draws.length > 0) {
    console.log(`ช่วงงวด: ${result.draws[result.draws.length - 1].date} → ${result.draws[0].date}`);
  }
  if (failedYears.length > 0) {
    console.warn(`ปีที่มีปัญหา: ${failedYears.map((f) => `พ.ศ. ${f.year} (${f.error})`).join(", ")}`);
  }
  if (addedFromFetch === 0) {
    console.log("ข้อมูลเป็นปัจจุบันแล้ว ไม่มีงวดใหม่ให้เพิ่ม");
  }

  if (args.dryRun) {
    const newOnly = fetched
      .filter((draw) => !existingDates.has(draw.date))
      .sort(byDateDesc);
    console.log("\n[dry-run] ไม่เขียนไฟล์จริง — งวดใหม่ล่าสุด 5 งวด:");
    console.log(newOnly.slice(0, 5));
    return;
  }

  if (!args.all && addedFromFetch === 0) {
    console.log("\nไม่เขียนไฟล์ (ไม่มีอะไรเปลี่ยน)");
    return;
  }

  writeFileSync(DATA_FILE, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.log(`\nบันทึกแล้ว: ${path.relative(process.cwd(), DATA_FILE)}`);
}

main().catch((error) => {
  console.error("ล้มเหลว:", error);
  process.exit(1);
});
