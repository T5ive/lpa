import { describe, expect, it } from "vitest";
import {
  calculateDigitFrequency,
  calculateHistoricalStatistics,
  calculateNextDrawPrediction,
} from "./statistics";
import type { LotteryDraw } from "../types/lottery";

function draw(date: string, firstPrize: string, lastTwoDigits: string): LotteryDraw {
  return { date, firstPrize, lastTwoDigits };
}

/**
 * Fixture 5 งวด (ออกแบบให้ทราบคำตอบทุกค่า):
 * d1 {1,2} → d2 {1,2,5,6} ซ้ำ 2 | d2 → d3 {5,9,0} ซ้ำ 1 | d3 → d4 {3,4} ซ้ำ 0 | d4 → d5 {3,4} ซ้ำ 2 (บน 44 ตรง)
 */
const fixture = [
  draw("2026-01-01", "111111", "22"), // d1 บน 11 ล่าง 22
  draw("2026-01-16", "123456", "12"), // d2 บน 56 ล่าง 12
  draw("2026-02-01", "560099", "05"), // d3 บน 99 ล่าง 05
  draw("2026-02-16", "444444", "33"), // d4 บน 44 ล่าง 33
  draw("2026-03-01", "333444", "34"), // d5 บน 44 ล่าง 34
];

describe("calculateHistoricalStatistics", () => {
  const stats = calculateHistoricalStatistics(fixture);

  it("นับจำนวนงวดและคู่งวด", () => {
    expect(stats.totalDraws).toBe(5);
    expect(stats.totalPairs).toBe(4);
  });

  it("แยกคู่ที่มี/ไม่มีเลขซ้ำ", () => {
    expect(stats.pairsWithCommon).toBe(3);
    expect(stats.pairsWithoutCommon).toBe(1);
  });

  it("อัตราการมีเลขซ้ำ 75% และค่าเฉลี่ย 1.25", () => {
    expect(stats.repeatRatePercent).toBe(75);
    expect(stats.averageCommonCount).toBe(1.25);
  });

  it("การกระจายจำนวนเลขซ้ำ 0–4", () => {
    expect(
      stats.repeatDistribution.map((bucket) => bucket.pairs),
    ).toEqual([1, 1, 2, 0, 0]);
  });

  it("แนวโน้มรายเดือนจับกลุ่มตามเดือนของงวดหลัง (ค่าเฉลี่ยเลื่อน 12 เดือนยังเป็น null ใน fixture สั้น)", () => {
    expect(stats.monthlyTrend).toEqual([
      { key: "2026-01", month: "ม.ค. 69", pairs: 1, pairsWithCommon: 1, ratePercent: 100, rollingRatePercent: null },
      { key: "2026-02", month: "ก.พ. 69", pairs: 2, pairsWithCommon: 1, ratePercent: 50, rollingRatePercent: null },
      { key: "2026-03", month: "มี.ค. 69", pairs: 1, pairsWithCommon: 1, ratePercent: 100, rollingRatePercent: null },
    ]);
  });

  it("ค่าเฉลี่ยเลื่อน 12 เดือนคำนวณเมื่อข้อมูลยาวพอ", () => {
    const longFixture: LotteryDraw[] = [];
    // 13 คู่ติดกันข้ามปี: ทุกคู่มีเลขซ้ำ → ค่าเฉลี่ยเลื่อนที่จุดที่ 12 ต้องเป็น 100
    for (let i = 0; i < 14; i++) {
      const year = 2026 + Math.floor(i / 12);
      const month = String((i % 12) + 1).padStart(2, "0");
      longFixture.push({
        date: `${year}-${month}-01`,
        firstPrize: "121212",
        lastTwoDigits: "34",
      });
    }
    const longStats = calculateHistoricalStatistics(longFixture);
    expect(longStats.monthlyTrend).toHaveLength(13);
    expect(longStats.monthlyTrend[10]?.rollingRatePercent).toBeNull();
    expect(longStats.monthlyTrend[11]?.rollingRatePercent).toBe(100);
    expect(longStats.monthlyTrend[12]?.rollingRatePercent).toBe(100);
  });

  it("ชุดข้อมูลว่างไม่พัง", () => {
    const empty = calculateHistoricalStatistics([]);
    expect(empty.totalPairs).toBe(0);
    expect(empty.repeatRatePercent).toBe(0);
    expect(empty.averageCommonCount).toBe(0);
    expect(empty.monthlyTrend).toEqual([]);
  });
});

describe("calculateDigitFrequency", () => {
  it("โหมดบน: นับเฉพาะสองหลักท้ายของรางวัลที่ 1", () => {
    const result = calculateDigitFrequency(fixture, "up");
    expect(result.totalOccurrences).toBe(10);
    expect(result.counts[4]).toBe(4); // 44, 44
    expect(result.counts[1]).toBe(2); // 11
    expect(result.counts[9]).toBe(2); // 99
    expect(result.counts[0]).toBe(0);
  });

  it("โหมดล่าง: นับเฉพาะเลขท้าย 2 ตัว (รวม 0 นำหน้า)", () => {
    const result = calculateDigitFrequency(fixture, "down");
    expect(result.totalOccurrences).toBe(10);
    expect(result.counts[2]).toBe(3);
    expect(result.counts[3]).toBe(3);
    expect(result.counts[0]).toBe(1); // จาก "05"
  });

  it("โหมดรวม", () => {
    const result = calculateDigitFrequency(fixture, "both");
    expect(result.totalOccurrences).toBe(20);
    expect(result.counts[4]).toBe(5);
    expect(result.counts[5]).toBe(2);
  });
});

describe("calculateNextDrawPrediction", () => {
  const prediction = calculateNextDrawPrediction(fixture);

  it("งวดล่าสุดคืองวดใหม่สุด และเลขวนคือชุดเลขเด่นของงวดนั้น", () => {
    expect(prediction?.latestDraw.date).toBe("2026-03-01");
    expect(
      prediction?.candidateDigits.map((candidate) => candidate.digit),
    ).toEqual([3, 4]);
  });

  it("อัตราการวนกลับรวม = อัตราคู่ที่มีเลขซ้ำอย่างน้อย 1 ตัว", () => {
    expect(prediction?.pairsAnalyzed).toBe(4);
    expect(prediction?.pairsWithAnyRecur).toBe(3);
    expect(prediction?.overallRecurrenceRatePercent).toBe(75);
  });

  it("สถิติบน/ล่างตรง 2 หลัก แยกกัน (ห้ามรวม)", () => {
    expect(prediction?.upperExactHistory).toEqual({
      matched: 1,
      total: 4,
      ratePercent: 25,
    });
    expect(prediction?.lowerExactHistory).toEqual({
      matched: 0,
      total: 4,
      ratePercent: 0,
    });
  });

  it("อัตราวนกลับรายเลขคำนวณจากข้อมูลจริง", () => {
    const byDigit = new Map(
      prediction?.candidateDigits.map((c) => [c.digit, c]),
    );
    expect(byDigit.get(3)).toMatchObject({
      chances: 1,
      recurredTimes: 1,
      recurrenceRatePercent: 100,
    });
    expect(byDigit.get(4)).toMatchObject({
      chances: 1,
      recurredTimes: 1,
      recurrenceRatePercent: 100,
    });
  });

  it("เลขประกอบ 2 ตัว: ครบทุกแบบเรียงลำดับ รวมเลขซ้ำ และนับโอกาสจากของจริง", () => {
    const composed = prediction?.composedNumbers ?? [];
    // ชุดเลขวน {3,4} → 4 แบบ: 33, 34, 43, 44
    expect(composed.map((c) => c.number)).toEqual(["34", "44", "33", "43"]);
    const byNumber = new Map(composed.map((c) => [c.number, c]));
    // "34" ออกเป็นล่าง (งวด d5 ล่าง 34) จากคู่เดียวที่ประกอบได้
    expect(byNumber.get("34")).toMatchObject({
      chances: 1,
      hitTimes: 1,
      hitsAsUpper: 0,
      hitsAsLower: 1,
      ratePercent: 100,
    });
    // "44" ออกเป็นบน (งวด d5 บน 44) จากคู่เดียวที่ประกอบได้
    expect(byNumber.get("44")).toMatchObject({
      chances: 1,
      hitTimes: 1,
      hitsAsUpper: 1,
      hitsAsLower: 0,
      ratePercent: 100,
    });
    // "33" และ "43" ไม่เคยออก
    expect(byNumber.get("33")).toMatchObject({ chances: 1, hitTimes: 0, ratePercent: 0 });
    expect(byNumber.get("43")).toMatchObject({ chances: 1, hitTimes: 0, ratePercent: 0 });
  });

  it("เลขประกอบรักษาเลข 0 นำหน้าและครอบคลุมทุกแบบเรียงลำดับเมื่อชุดมี 4 เลข", () => {
    const draws = [
      { date: "2026-01-01", firstPrize: "111154", lastTwoDigits: "06" },
      { date: "2026-01-16", firstPrize: "222256", lastTwoDigits: "05" },
    ];
    const withZero = calculateNextDrawPrediction(draws);
    // ชุดเลขวนของงวดล่าสุด {5,6,0} → 9 แบบ รวม "05", "06", "00"
    const numbers = withZero?.composedNumbers.map((c) => c.number) ?? [];
    expect(numbers).toHaveLength(9);
    expect(new Set(numbers).size).toBe(9);
    expect(numbers).toContain("05");
    expect(numbers).toContain("06");
    expect(numbers).toContain("00");
  });

  it("ชุดข้อมูลว่าง → null", () => {
    expect(calculateNextDrawPrediction([])).toBeNull();
  });
});
