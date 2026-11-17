import { describe, expect, it } from "vitest";
import rawDrawFile from "./lottery-results.json";
import { validateDrawFile } from "@/features/lottery/utils/validate";
import { calculateHistoricalStatistics } from "@/features/lottery/utils/statistics";
import { buildDrawPairs } from "@/features/lottery/utils/compare";

/**
 * ทาบข้อมูลจริงในไฟล์กับตัวอย่างจากโจทย์ + ตรวจว่า KPI คำนวณได้จริง
 * (งวดตัวอย่างในโจทย์: 1 พ.ย. 2569 = 423224 / ล่าง 85, 16 พ.ย. 2569 = 645654 / ล่าง 06)
 * ไฟล์ถูกขยายด้วย tools/fetch-lottery.ts — เทสจึงผูกกับโครงสร้างและงวดสำคัญ ไม่ผูกกับจำนวนงวดตายตัว
 */
describe("lottery-results.json (ข้อมูลจริง)", () => {
  const validated = validateDrawFile(rawDrawFile);

  it("ผ่านการตรวจ schema", () => {
    expect(validated.errors).toEqual([]);
    expect(validated.ok).toBe(true);
  });

  it("มีงวดจำนวนมาก เรียงใหม่สุดก่อน และไม่มีวันที่ซ้ำ", () => {
    expect(validated.draws.length).toBeGreaterThanOrEqual(24);
    const dates = validated.draws.map((draw) => draw.date);
    expect(new Set(dates).size).toBe(dates.length);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("ครอบคลุมช่วงปียาว (ย้อนหลังกว่า 10 ปี)", () => {
    const years = new Set(validated.draws.map((draw) => Number(draw.date.slice(0, 4))));
    expect(years.size).toBeGreaterThanOrEqual(10);
  });

  it("งวดตัวอย่างจากโจทย์ตรงทุกหลัก", () => {
    const nov16 = validated.draws.find((d) => d.date === "2026-11-16");
    const nov1 = validated.draws.find((d) => d.date === "2026-11-01");
    expect(nov16).toMatchObject({ firstPrize: "645654", lastTwoDigits: "06" });
    expect(nov1).toMatchObject({ firstPrize: "423224", lastTwoDigits: "85" });
  });

  it("งวดใหม่สุดคือ 16 พ.ย. 2569 และเทียบกับ 1 พ.ย. ได้เลขซ้ำ [4,5] ตามโจทย์", () => {
    const latest = validated.draws[0];
    expect(latest?.date).toBe("2026-11-16");

    const pairs = buildDrawPairs(validated.draws);
    expect(pairs).toHaveLength(validated.draws.length - 1);
    const lastPair = pairs[pairs.length - 1];
    expect(lastPair.previous.date).toBe("2026-11-01");
    expect(lastPair.previous.lastTwoDigits).toBe("85");
    expect(lastPair.current.date).toBe("2026-11-16");
  });

  it("สถิติรวมคำนวณจากคู่งวดจริงและได้อัตราอยู่ในช่วงที่สมเหตุสมผล", () => {
    const stats = calculateHistoricalStatistics(validated.draws);
    expect(stats.totalDraws).toBe(validated.draws.length);
    expect(stats.totalPairs).toBe(validated.draws.length - 1);
    expect(stats.pairsWithCommon + stats.pairsWithoutCommon).toBe(stats.totalPairs);
    expect(stats.repeatRatePercent).toBeGreaterThan(50);
    expect(stats.repeatRatePercent).toBeLessThanOrEqual(100);
    expect(stats.monthlyTrend.length).toBeGreaterThan(100);
  });
});
