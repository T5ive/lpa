import { describe, expect, it } from "vitest";
import {
  buildDrawPairs,
  compareDraws,
  getNextDraw,
  getPreviousDraw,
  sortDrawsAsc,
} from "./compare";
import type { LotteryDraw } from "../types/lottery";

function draw(date: string, firstPrize: string, lastTwoDigits: string): LotteryDraw {
  return { date, firstPrize, lastTwoDigits };
}

/** ตัวอย่างจากโจทย์: งวด 1 พ.ย. 2569 และ 16 พ.ย. 2569 */
const NOV1 = draw("2026-11-01", "423224", "85");
const NOV16 = draw("2026-11-16", "645654", "06");

describe("compareDraws — ตัวอย่างจากโจทย์", () => {
  const comparison = compareDraws(NOV16, NOV1);

  it("ชุดเลขเด่นถูกต้อง", () => {
    expect(comparison.previousDigits).toEqual([2, 4, 5, 8]);
    expect(comparison.currentDigits).toEqual([0, 4, 5, 6]);
  });

  it("เลขที่ซ้ำกัน [4,5] / เลขที่หายไป [2,8] / เลขใหม่ [0,6]", () => {
    expect(comparison.commonDigits).toEqual([4, 5]);
    expect(comparison.onlyInPrevious).toEqual([2, 8]);
    expect(comparison.onlyInCurrent).toEqual([0, 6]);
    expect(comparison.commonCount).toBe(2);
    expect(comparison.hasCommon).toBe(true);
  });

  it("เกณฑ์บน/ล่าง/ตำแหน่งแยกจากกัน — กรณีนี้ไม่มีอะไรตรงตามตำแหน่ง", () => {
    expect(comparison.upperExactMatch).toBe(false);
    expect(comparison.lowerExactMatch).toBe(false);
    expect(comparison.positionMatch).toBe(false);
  });

  it("เก็บเลข 0 นำหน้าของเลขล่าง", () => {
    expect(comparison.currentLower).toBe("06");
    expect(comparison.previousLower).toBe("85");
  });
});

describe("compareDraws — ไม่มีงวดก่อนหน้า", () => {
  const comparison = compareDraws(NOV1, null);

  it("previous เป็น null และทุกเกณฑ์เป็น false", () => {
    expect(comparison.previous).toBeNull();
    expect(comparison.previousDigits).toBeNull();
    expect(comparison.previousUpper).toBeNull();
    expect(comparison.previousLower).toBeNull();
    expect(comparison.commonCount).toBe(0);
    expect(comparison.hasCommon).toBe(false);
    expect(comparison.upperExactMatch).toBe(false);
    expect(comparison.lowerExactMatch).toBe(false);
    expect(comparison.positionMatch).toBe(false);
  });

  it("ยังแสดงชุดเลขเด่นของงวดปัจจุบันได้", () => {
    expect(comparison.currentDigits).toEqual([2, 4, 5, 8]);
  });
});

describe("compareDraws — ชุดเลขตรงกันทั้งหมด", () => {
  const a = draw("2026-01-01", "110012", "34"); // บน 12 ล่าง 34 → {1,2,3,4}
  const b = draw("2026-01-16", "340034", "12"); // บน 34 ล่าง 12 → {1,2,3,4}
  const comparison = compareDraws(b, a);

  it("นับเลขซ้ำได้ครบ 4 ตัวแม้ตำแหน่งสลับ", () => {
    expect(comparison.commonDigits).toEqual([1, 2, 3, 4]);
    expect(comparison.commonCount).toBe(4);
    expect(comparison.onlyInPrevious).toEqual([]);
    expect(comparison.onlyInCurrent).toEqual([]);
  });

  it("ชุดตรงทั้งหมด ≠ ถูกตามตำแหน่ง (เกณฑ์ต้องแยก)", () => {
    expect(comparison.hasCommon).toBe(true);
    expect(comparison.upperExactMatch).toBe(false);
    expect(comparison.lowerExactMatch).toBe(false);
    expect(comparison.positionMatch).toBe(false);
  });
});

describe("compareDraws — ไม่มีเลขตรงกันเลย", () => {
  const a = draw("2026-01-01", "111112", "34");
  const b = draw("2026-01-16", "222256", "78");
  const comparison = compareDraws(b, a);

  it("ทุกเกณฑ์เป็น false", () => {
    expect(comparison.commonDigits).toEqual([]);
    expect(comparison.commonCount).toBe(0);
    expect(comparison.hasCommon).toBe(false);
    expect(comparison.positionMatch).toBe(false);
  });

  it("แยกเลขข้างเดียวได้ครบ", () => {
    expect(comparison.onlyInPrevious).toEqual([1, 2, 3, 4]);
    expect(comparison.onlyInCurrent).toEqual([5, 6, 7, 8]);
  });
});

describe("compareDraws — เกณฑ์ตามตำแหน่ง", () => {
  it("บนตรงทั้งสองหลัก", () => {
    const prev = draw("2026-01-01", "999912", "34");
    const cur = draw("2026-01-16", "888812", "56");
    const c = compareDraws(cur, prev);
    expect(c.upperExactMatch).toBe(true);
    expect(c.lowerExactMatch).toBe(false);
    expect(c.positionMatch).toBe(true);
  });

  it("ล่างตรงทั้งสองหลัก (รักษา 0 นำหน้า)", () => {
    const prev = draw("2026-01-01", "999934", "06");
    const cur = draw("2026-01-16", "888856", "06");
    const c = compareDraws(cur, prev);
    expect(c.lowerExactMatch).toBe(true);
    expect(c.upperExactMatch).toBe(false);
    expect(c.positionMatch).toBe(true);
  });

  it("บนตรงหรือล่างตรงอย่างใดอย่างหนึ่ง = positionMatch", () => {
    const prev = draw("2026-01-01", "999912", "85");
    const cur = draw("2026-01-16", "777712", "85");
    const c = compareDraws(cur, prev);
    expect(c.upperExactMatch).toBe(true);
    expect(c.lowerExactMatch).toBe(true);
    expect(c.positionMatch).toBe(true);
  });
});

describe("sortDrawsAsc / buildDrawPairs", () => {
  const d1 = draw("2025-11-16", "458145", "37");
  const d2 = draw("2025-12-01", "461252", "22");
  const d3 = draw("2026-01-02", "837706", "16");

  it("เรียงข้อมูลที่ไม่ได้เรียงมาให้ถูกลำดับ", () => {
    expect(sortDrawsAsc([d3, d1, d2]).map((d) => d.date)).toEqual([
      "2025-11-16",
      "2025-12-01",
      "2026-01-02",
    ]);
  });

  it("จับคู่งวดติดกันจากข้อมูลที่ไม่เรียง", () => {
    const pairs = buildDrawPairs([d2, d3, d1]);
    expect(pairs).toEqual([
      { previous: d1, current: d2 },
      { previous: d2, current: d3 },
    ]);
  });

  it("มี 1 งวด → ไม่มีคู่", () => {
    expect(buildDrawPairs([d1])).toEqual([]);
  });

  it("ไม่มีงวด → ไม่มีคู่", () => {
    expect(buildDrawPairs([])).toEqual([]);
  });
});

describe("getPreviousDraw / getNextDraw", () => {
  const draws = [
    draw("2026-11-16", "645654", "06"),
    draw("2026-11-01", "423224", "85"),
    draw("2026-10-16", "011781", "48"),
  ];

  it("งวดเก่าสุดไม่มีงวดก่อนหน้า", () => {
    expect(getPreviousDraw(draws, draws[2])).toBeNull();
  });

  it("หางวดก่อนหน้าของงวดกลางได้", () => {
    expect(getPreviousDraw(draws, draws[1])).toEqual(draws[2]);
  });

  it("งวดใหม่สุดไม่มีงวดถัดไป", () => {
    expect(getNextDraw(draws, draws[0])).toBeNull();
  });

  it("หางวดถัดไปได้", () => {
    expect(getNextDraw(draws, draws[1])).toEqual(draws[0]);
  });
});
