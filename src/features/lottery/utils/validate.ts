import type { LotteryDraw } from "../types/lottery";
import { sortDrawsDesc } from "./compare";

export interface ValidationResult {
  ok: boolean;
  /** งวดทั้งหมดเรียงใหม่สุด → เก่าสุด (เมื่อ ok เท่านั้น) */
  draws: LotteryDraw[];
  /** รายการปัญหาของไฟล์ เพื่อให้ dev แก้ lottery-results.json ได้ตรงจุด */
  errors: string[];
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
/** รางวัลที่ 1: 6 หลัก (ยุคปัจจุบัน) หรือ 7 หลัก (งวดก่อน พ.ศ. 2538) */
const FIRST_PRIZE_RE = /^\d{6,7}$/;
const TWO_DIGIT_RE = /^\d{2}$/;

/** ตรวจ ISO วันที่จริง (จับ 2026-02-30 และ 0 นำหน้า) */
function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * ตรวจความถูกต้องของไฟล์ข้อมูลผลหวย
 * - draws ต้องเป็นอาร์เรย์ของ { date, firstPrize (6 หลัก หรือ 7 หลักในยุคเก่า), lastTwoDigits (2 หลัก) }
 * - ตัวเลขต้องเป็น string (รักษาเลข 0 นำหน้า)
 * - ห้ามมีวันที่งวดซ้ำ
 */
export function validateDrawFile(file: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof file !== "object" || file === null || !Array.isArray((file as { draws?: unknown }).draws)) {
    return {
      ok: false,
      draws: [],
      errors: ['โครงสร้างไฟล์ต้องเป็น { "meta": {...}, "draws": [ ... ] }'],
    };
  }

  const rawDraws = (file as { draws: unknown[] }).draws;
  const validDraws: LotteryDraw[] = [];
  const seenDates = new Set<string>();

  rawDraws.forEach((entry, index) => {
    const label = `draws[${index}]`;
    if (typeof entry !== "object" || entry === null) {
      errors.push(`${label}: ต้องเป็น object`);
      return;
    }
    const { date, firstPrize, lastTwoDigits } = entry as Record<string, unknown>;

    if (typeof date !== "string" || !isValidIsoDate(date)) {
      errors.push(`${label}: "date" ต้องเป็นวันที่ ISO เช่น "2026-11-16" (ได้รับ: ${JSON.stringify(date)})`);
    } else if (seenDates.has(date)) {
      errors.push(`${label}: วันที่ "${date}" ซ้ำกับงวดอื่น`);
    }
    if (typeof date === "string") seenDates.add(date);

    if (typeof firstPrize !== "string" || !FIRST_PRIZE_RE.test(firstPrize)) {
      errors.push(
        `${label}: "firstPrize" ต้องเป็น string ตัวเลข 6 หลัก (งวดก่อน พ.ศ. 2538 ใช้ 7 หลัก) (ได้รับ: ${JSON.stringify(firstPrize)})`,
      );
    }
    if (typeof lastTwoDigits !== "string" || !TWO_DIGIT_RE.test(lastTwoDigits)) {
      errors.push(`${label}: "lastTwoDigits" ต้องเป็น string ตัวเลข 2 หลัก (ได้รับ: ${JSON.stringify(lastTwoDigits)})`);
    }

    if (
      typeof date === "string" &&
      isValidIsoDate(date) &&
      !errors.some((e) => e.startsWith(label))
    ) {
      validDraws.push({ date, firstPrize: firstPrize as string, lastTwoDigits: lastTwoDigits as string });
    }
  });

  if (errors.length === 0 && validDraws.length === 0) {
    errors.push("ไม่พบงวดใดในไฟล์");
  }
  const hasErrors = errors.length > 0;

  return {
    ok: !hasErrors && validDraws.length > 0,
    draws: sortDrawsDesc(validDraws),
    errors,
  };
}
