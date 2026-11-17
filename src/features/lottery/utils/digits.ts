import type { Digit, LotteryDraw } from "../types/lottery";

/** แยก string ตัวเลขเป็นอาร์เรย์หลักต่อหลัก — ต้องเป็น string ที่ประกอบด้วยตัวเลขเท่านั้น (ผ่าน validate ก่อนแล้ว) */
export function extractDigits(value: string): Digit[] {
  return value.split("").map((ch) => Number(ch) as Digit);
}

/** รวมหลาย string ตัวเลขเป็นชุดเลข unique เรียงน้อยไปมาก (ตัดตัวเลขที่ซ้ำออก) */
export function getUniqueDigits(...values: string[]): Digit[] {
  const set = new Set<Digit>();
  for (const value of values) {
    for (const digit of extractDigits(value)) {
      set.add(digit);
    }
  }
  return [...set].sort((a, b) => a - b);
}

/** ชุดเลขเด่นของงวด = เลขบน (2 หลักท้ายของรางวัลที่ 1) + เลขล่าง ตัดซ้ำ */
export function getDrawDigitSet(draw: LotteryDraw): Digit[] {
  return getUniqueDigits(getUpperDigits(draw), draw.lastTwoDigits);
}

/** เลข 2 ตัวบน = สองหลักท้ายของรางวัลที่ 1 */
export function getUpperDigits(draw: LotteryDraw): string {
  return draw.firstPrize.slice(-2);
}

/** อินเตอร์เซกชันของชุดเลขเรียงแล้ว 2 ชุด */
export function intersectSorted(a: Digit[], b: Digit[]): Digit[] {
  const setB = new Set(b);
  return a.filter((digit) => setB.has(digit));
}

/** เลขใน a ที่ไม่อยู่ใน b (a − b) */
export function differenceSorted(a: Digit[], b: Digit[]): Digit[] {
  const setB = new Set(b);
  return a.filter((digit) => !setB.has(digit));
}
