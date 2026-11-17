import rawDrawFile from "@/data/lottery-results.json";
import { validateDrawFile } from "../utils/validate";
import { LotteryDataError, type LotteryRepository } from "./lotteryRepository";
import type { LotteryDraw } from "../types/lottery";

/** อ่านข้อมูลจาก src/data/lottery-results.json ที่ dev แก้ไขโดยตรง */
export class StaticJsonRepository implements LotteryRepository {
  async getAll(): Promise<LotteryDraw[]> {
    const result = validateDrawFile(rawDrawFile);
    if (!result.ok) {
      throw new LotteryDataError(result.errors);
    }
    return result.draws;
  }
}

export const lotteryRepository: LotteryRepository = new StaticJsonRepository();
