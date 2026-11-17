import { describe, expect, it } from "vitest";
import {
  formatThaiDate,
  formatThaiMonthKey,
  formatThaiYear,
  getCeYear,
  getNextDrawDate,
} from "./thaiDate";

describe("formatThaiDate", () => {
  it("แปลงเป็น พ.ศ. แบบเต็ม", () => {
    expect(formatThaiDate("2026-11-16")).toBe("16 พฤศจิกายน 2569");
    expect(formatThaiDate("2025-11-16")).toBe("16 พฤศจิกายน 2568");
  });

  it("โหมดเดือนย่อ", () => {
    expect(formatThaiDate("2026-01-02", true)).toBe("2 ม.ค. 69");
  });

  it("ไม่บิดเบือนวันที่ 0 นำหน้า", () => {
    expect(formatThaiDate("2026-05-02")).toBe("2 พฤษภาคม 2569");
  });
});

describe("formatThaiMonthKey", () => {
  it("yyyy-MM → เดือนย่อ + ปี พ.ศ. สองหลัก", () => {
    expect(formatThaiMonthKey("2025-11")).toBe("พ.ย. 68");
    expect(formatThaiMonthKey("2026-03")).toBe("มี.ค. 69");
  });
});

describe("formatThaiYear / getCeYear", () => {
  it("แปลงปี พ.ศ. และ ค.ศ.", () => {
    expect(formatThaiYear("2026-11-16")).toBe(2569);
    expect(getCeYear("2025-12-01")).toBe(2025);
  });
});

describe("getNextDrawDate", () => {
  it("งวดกลางเดือน → งวดวันที่ 16", () => {
    expect(getNextDrawDate("2026-11-01")).toBe("2026-11-16");
  });

  it("งวดวันที่ 16 → งวดวันที่ 1 ของเดือนถัดไป", () => {
    expect(getNextDrawDate("2026-11-16")).toBe("2026-12-01");
  });

  it("งวด 16 ธันวาคม → ปีถัดไป", () => {
    expect(getNextDrawDate("2026-12-16")).toBe("2027-01-01");
  });
});
