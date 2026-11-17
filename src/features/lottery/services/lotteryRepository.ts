import type { LotteryDraw } from "../types/lottery";

/**
 * ชั้นเข้าถึงข้อมูลผลหวย — ปัจจุบันอ่านจากไฟล์ JSON ในโปรเจกต์
 * ออกแบบให้เปลี่ยนไปใช้ REST API ภายหลังได้โดยเขียน implementation ใหม่ของ interface นี้
 */
export interface LotteryRepository {
  /** คืนงวดทั้งหมดเรียงใหม่สุด → เก่าสุด หรือ throw LotteryDataError เมื่อข้อมูลไม่ถูกต้อง */
  getAll(): Promise<LotteryDraw[]>;
}

/** เกิดเมื่อไฟล์ข้อมูลละเมิด schema — issues ระบุตำแหน่งปัญหาให้ dev แก้ไฟล์ */
export class LotteryDataError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super("ข้อมูลใน lottery-results.json ไม่ถูกต้อง");
    this.name = "LotteryDataError";
    this.issues = issues;
  }
}
