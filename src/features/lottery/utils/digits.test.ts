import { describe, expect, it } from "vitest";
import {
  differenceSorted,
  extractDigits,
  getDrawDigitSet,
  getUpperDigits,
  getUniqueDigits,
  intersectSorted,
} from "./digits";
import type { LotteryDraw } from "../types/lottery";

describe("extractDigits", () => {
  it("แยกเลข 0 นำหน้าได้ถูกต้อง", () => {
    expect(extractDigits("06")).toEqual([0, 6]);
    expect(extractDigits("004615").slice(0, 3)).toEqual([0, 0, 4]);
  });

  it("แยกทีละหลัก", () => {
    expect(extractDigits("85")).toEqual([8, 5]);
  });
});

describe("getUniqueDigits", () => {
  it("ตัดเลขที่ซ้ำภายในงวดเดียวกันออก (บน 24 ล่าง 82 → [2,4,8])", () => {
    expect(getUniqueDigits("24", "82")).toEqual([2, 4, 8]);
  });

  it("เรียงน้อยไปมากเสมอ", () => {
    expect(getUniqueDigits("95", "06")).toEqual([0, 5, 6, 9]);
  });

  it("รักษาเลข 0", () => {
    expect(getUniqueDigits("06")).toEqual([0, 6]);
  });

  it("ตัวเลขซ้ำหลายรอบในสตริงเดียว", () => {
    expect(getUniqueDigits("112")).toEqual([1, 2]);
  });
});

describe("getUpperDigits", () => {
  it("คือสองหลักท้ายของรางวัลที่ 1", () => {
    expect(getUpperDigits({ date: "2026-11-16", firstPrize: "645654", lastTwoDigits: "06" })).toBe("54");
  });

  it("รักษาเลข 0 นำหน้าของรางวัลที่ 1", () => {
    expect(getUpperDigits({ date: "2026-08-16", firstPrize: "004615", lastTwoDigits: "53" })).toBe("15");
  });
});

describe("getDrawDigitSet", () => {
  it("รวมเลขบนและล่างตัดซ้ำ", () => {
    const draw: LotteryDraw = { date: "2026-11-01", firstPrize: "423224", lastTwoDigits: "85" };
    expect(getDrawDigitSet(draw)).toEqual([2, 4, 5, 8]);
  });
});

describe("intersectSorted / differenceSorted", () => {
  it("หาเลขที่ซ้ำกัน", () => {
    expect(intersectSorted([2, 4, 5, 8], [0, 4, 5, 6])).toEqual([4, 5]);
  });

  it("ไม่มีเลขซ้ำ → อาร์เรย์ว่าง", () => {
    expect(intersectSorted([1, 2, 3], [4, 5, 6])).toEqual([]);
  });

  it("หาเลขที่ไม่ซ้ำ (a − b)", () => {
    expect(differenceSorted([2, 4, 5, 8], [4, 5])).toEqual([2, 8]);
    expect(differenceSorted([0, 4, 5, 6], [4, 5])).toEqual([0, 6]);
  });
});
