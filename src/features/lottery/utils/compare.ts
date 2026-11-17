import type { DrawComparison, DrawPair, LotteryDraw } from "../types/lottery";
import {
  differenceSorted,
  getDrawDigitSet,
  getUpperDigits,
  intersectSorted,
} from "./digits";

/** เลข 2 ตัวล่างของงวด */
export function getLowerDigits(draw: LotteryDraw): string {
  return draw.lastTwoDigits;
}

/**
 * เปรียบเทียบงวดปัจจุบันกับงวดก่อนหน้า
 * เกณฑ์ทั้ง 4 (มีเลขซ้ำ / บนตรง 2 หลัก / ล่างตรง 2 หลัก / ตรงตามตำแหน่ง) แยกกันเสมอ
 * เมื่อ previous เป็น null ทุกเกณฑ์เป็น false และชุดเลขย้อนหลังเป็น null
 */
export function compareDraws(
  current: LotteryDraw,
  previous: LotteryDraw | null,
): DrawComparison {
  const currentUpper = getUpperDigits(current);
  const currentLower = getLowerDigits(current);
  const currentDigits = getDrawDigitSet(current);

  if (!previous) {
    return {
      current,
      previous: null,
      currentUpper,
      currentLower,
      previousUpper: null,
      previousLower: null,
      currentDigits,
      previousDigits: null,
      commonDigits: [],
      onlyInPrevious: [],
      onlyInCurrent: [],
      commonCount: 0,
      hasCommon: false,
      upperExactMatch: false,
      lowerExactMatch: false,
      positionMatch: false,
    };
  }

  const previousUpper = getUpperDigits(previous);
  const previousLower = getLowerDigits(previous);
  const previousDigits = getDrawDigitSet(previous);
  const commonDigits = intersectSorted(previousDigits, currentDigits);
  const upperExactMatch = previousUpper === currentUpper;
  const lowerExactMatch = previousLower === currentLower;

  return {
    current,
    previous,
    currentUpper,
    currentLower,
    previousUpper,
    previousLower,
    currentDigits,
    previousDigits,
    commonDigits,
    onlyInPrevious: differenceSorted(previousDigits, currentDigits),
    onlyInCurrent: differenceSorted(currentDigits, previousDigits),
    commonCount: commonDigits.length,
    hasCommon: commonDigits.length > 0,
    upperExactMatch,
    lowerExactMatch,
    positionMatch: upperExactMatch || lowerExactMatch,
  };
}

/** เรียงงวดจากเก่าสุด → ใหม่สุด (รองรับข้อมูลที่ไม่เรียงลำดับ) */
export function sortDrawsAsc(draws: LotteryDraw[]): LotteryDraw[] {
  return [...draws].sort((a, b) => a.date.localeCompare(b.date));
}

/** เรียงงวดจากใหม่สุด → เก่าสุด */
export function sortDrawsDesc(draws: LotteryDraw[]): LotteryDraw[] {
  return sortDrawsAsc(draws).reverse();
}

/** จับคู่งวดติดกันทั้งหมด (เรียงก่อนเสมอ ไม่สนลำดับที่รับมา) */
export function buildDrawPairs(draws: LotteryDraw[]): DrawPair[] {
  const sorted = sortDrawsAsc(draws);
  const pairs: DrawPair[] = [];
  for (let i = 1; i < sorted.length; i++) {
    pairs.push({ previous: sorted[i - 1], current: sorted[i] });
  }
  return pairs;
}

/** หางวดก่อนหน้าของงวดเป้าหมาย — คืน null เมื่อเป็นงวดเก่าสุดหรือไม่พบงวด */
export function getPreviousDraw(
  draws: LotteryDraw[],
  target: LotteryDraw,
): LotteryDraw | null {
  const sorted = sortDrawsAsc(draws);
  const index = sorted.findIndex((draw) => draw.date === target.date);
  if (index <= 0) return null;
  return sorted[index - 1];
}

/** หางวดถัดไป (งวดใหม่กว่า) ของงวดเป้าหมาย — คืน null เมื่อเป็นงวดใหม่สุด */
export function getNextDraw(
  draws: LotteryDraw[],
  target: LotteryDraw,
): LotteryDraw | null {
  const sorted = sortDrawsAsc(draws);
  const index = sorted.findIndex((draw) => draw.date === target.date);
  if (index === -1 || index === sorted.length - 1) return null;
  return sorted[index + 1];
}
