import { describe, expect, it } from "vitest";
import { validateDrawFile } from "./validate";

const validFile = {
  meta: { source: "ทดสอบ", updatedAt: "2026-11-17" },
  draws: [
    { date: "2026-11-16", firstPrize: "645654", lastTwoDigits: "06" },
    { date: "2026-11-01", firstPrize: "423224", lastTwoDigits: "85" },
    { date: "2026-10-16", firstPrize: "011781", lastTwoDigits: "48" },
  ],
};

describe("validateDrawFile — ไฟล์ถูกต้อง", () => {
  it("ผ่านและเรียงใหม่สุด → เก่าสุด แม้ข้อมูลสับสน", () => {
    const shuffled = {
      draws: [validFile.draws[2], validFile.draws[0], validFile.draws[1]],
    };
    const result = validateDrawFile(shuffled);
    expect(result.ok).toBe(true);
    expect(result.draws.map((draw) => draw.date)).toEqual([
      "2026-11-16",
      "2026-11-01",
      "2026-10-16",
    ]);
  });

  it("รักษาเลข 0 นำหน้าเป็น string", () => {
    const result = validateDrawFile(validFile);
    expect(result.draws[0]?.lastTwoDigits).toBe("06");
    expect(result.draws.find((d) => d.date === "2026-10-16")?.firstPrize).toBe("011781");
  });
});

describe("validateDrawFile — ไฟล์ผิดรูปแบบ", () => {
  it("ไม่มี draws → ข้อผิดพลาดบอกโครงสร้าง", () => {
    const result = validateDrawFile({ meta: {} });
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain("โครงสร้างไฟล์");
  });

  it("firstPrize ไม่ใช่ string 6 หลัก", () => {
    const result = validateDrawFile({
      draws: [{ date: "2026-11-16", firstPrize: 645654, lastTwoDigits: "06" }],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("6 หลัก"))).toBe(true);
  });

  it("firstPrize มี 5 หลัก", () => {
    const result = validateDrawFile({
      draws: [{ date: "2026-11-16", firstPrize: "12345", lastTwoDigits: "06" }],
    });
    expect(result.ok).toBe(false);
  });

  it("firstPrize 7 หลัก (งวดยุคก่อน พ.ศ. 2538) ผ่านและเลขบน = สองหลักท้าย", () => {
    const result = validateDrawFile({
      draws: [{ date: "1994-02-01", firstPrize: "5984685", lastTwoDigits: "05" }],
    });
    expect(result.ok).toBe(true);
    expect(result.draws[0]?.firstPrize.slice(-2)).toBe("85");
  });

  it("lastTwoDigits มี 1 หลัก", () => {
    const result = validateDrawFile({
      draws: [{ date: "2026-11-16", firstPrize: "645654", lastTwoDigits: "6" }],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("2 หลัก"))).toBe(true);
  });

  it("วันที่งวดซ้ำ", () => {
    const result = validateDrawFile({
      draws: [
        { date: "2026-11-16", firstPrize: "645654", lastTwoDigits: "06" },
        { date: "2026-11-16", firstPrize: "111111", lastTwoDigits: "22" },
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("ซ้ำ"))).toBe(true);
  });

  it("วันที่ไม่มีจริง (2026-02-30)", () => {
    const result = validateDrawFile({
      draws: [{ date: "2026-02-30", firstPrize: "645654", lastTwoDigits: "06" }],
    });
    expect(result.ok).toBe(false);
  });

  it("รูปแบบวันที่ผิด", () => {
    const result = validateDrawFile({
      draws: [{ date: "16/11/2569", firstPrize: "645654", lastTwoDigits: "06" }],
    });
    expect(result.ok).toBe(false);
  });

  it("draws เป็นอาร์เรย์ว่าง", () => {
    const result = validateDrawFile({ draws: [] });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("ไม่พบงวดใดในไฟล์");
  });

  it("entry ไม่ใช่ object", () => {
    const result = validateDrawFile({ draws: ["645654"] });
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain("draws[0]");
  });
});
