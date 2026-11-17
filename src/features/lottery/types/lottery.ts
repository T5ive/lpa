/** ตัวเลขหลักเดียว 0–9 */
export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** ผลหวยรายงวด — ตัวเลขทุกช่องเก็บเป็น string เพื่อรักษาเลข 0 นำหน้า */
export interface LotteryDraw {
  /** วันที่ออกสลาก รูปแบบ ISO ค.ศ. (yyyy-MM-dd) */
  date: string;
  /** รางวัลที่ 1 (6 หลัก) — เลข 2 ตัวบน = สองหลักท้ายของช่องนี้ */
  firstPrize: string;
  /** เลขท้าย 2 ตัว (2 หลัก) */
  lastTwoDigits: string;
}

/** คู่งวดติดกัน (งวดก่อน → งวดหลัง) */
export interface DrawPair {
  previous: LotteryDraw;
  current: LotteryDraw;
}

/** ผลการเปรียบเทียบงวดปัจจุบันกับงวดก่อนหน้า — เกณฑ์ทั้ง 4 แยกกันเสมอ ห้ามรวมเป็นอัตราเดียว */
export interface DrawComparison {
  current: LotteryDraw;
  /** null เมื่อไม่มีงวดก่อนหน้า */
  previous: LotteryDraw | null;
  currentUpper: string;
  currentLower: string;
  /** null เมื่อไม่มีงวดก่อนหน้า */
  previousUpper: string | null;
  previousLower: string | null;
  /** ชุดเลขเด่นของงวดปัจจุบัน (unique เรียงน้อยไปมาก) */
  currentDigits: Digit[];
  /** ชุดเลขเด่นของงวดก่อนหน้า (null เมื่อไม่มีงวดก่อนหน้า) */
  previousDigits: Digit[] | null;
  /** เลขที่ซ้ำกันทั้งสองงวด */
  commonDigits: Digit[];
  /** เลขที่มีเฉพาะในงวดก่อน */
  onlyInPrevious: Digit[];
  /** เลขใหม่ที่มีเฉพาะในงวดปัจจุบัน */
  onlyInCurrent: Digit[];
  commonCount: number;
  /** เกณฑ์ 1: มีเลขซ้ำอย่างน้อย 1 หลัก */
  hasCommon: boolean;
  /** เกณฑ์ 2: เลขบนตรงกันทั้ง 2 หลัก */
  upperExactMatch: boolean;
  /** เกณฑ์ 3: เลขล่างตรงกันทั้ง 2 หลัก */
  lowerExactMatch: boolean;
  /** เกณฑ์ 4: เลข 2 ตัวถูกตามตำแหน่งจริง (บนตรงหรือล่างตรงทั้ง 2 หลัก) */
  positionMatch: boolean;
}

export type RepeatStatus = "repeat2" | "repeat1" | "none";

export interface RepeatDistributionBucket {
  /** จำนวนเลขซ้ำ 0–4 (4 = 4 ตัวขึ้นไป) */
  count: 0 | 1 | 2 | 3 | 4;
  pairs: number;
}

export interface MonthlyTrendPoint {
  /** yyyy-MM ของงวดหลังในคู่ */
  key: string;
  /** ป้ายภาษาไทย เช่น "พ.ย. 69" */
  month: string;
  pairs: number;
  pairsWithCommon: number;
  ratePercent: number;
  /** ค่าเฉลี่ยเลื่อน 12 เดือน (ชี้เมื่อมีข้อมูลครบพอ — null ในช่วงต้น) */
  rollingRatePercent: number | null;
}

export interface HistoricalStatistics {
  totalDraws: number;
  totalPairs: number;
  pairsWithCommon: number;
  pairsWithoutCommon: number;
  /** 0–100 ปัดทศนิยม 1 ตำแหน่ง — สัดส่วนคู่งวดที่มีเลขร่วมกัน ≥1 ตัว ไม่ใช่อัตราถูกรางวัล */
  repeatRatePercent: number;
  /** ปัดทศนิยม 2 ตำแหน่ง */
  averageCommonCount: number;
  repeatDistribution: RepeatDistributionBucket[];
  monthlyTrend: MonthlyTrendPoint[];
}

export type DigitFrequencyMode = "up" | "down" | "both";

export interface DigitFrequencyResult {
  mode: DigitFrequencyMode;
  /** นับความถี่เลข 0–9 (index = ตัวเลข) */
  counts: number[];
  totalOccurrences: number;
}

export interface ExactMatchHistory {
  matched: number;
  total: number;
  ratePercent: number;
}

export interface CandidateDigit {
  digit: Digit;
  /** จำนวนครั้งในอดีตที่เลขนี้อยู่ในชุดเลขเด่นงวดก่อนแล้วกลับมาปรากฏในงวดถัดมา */
  recurredTimes: number;
  /** จำนวนคู่งวดในอดีตที่เลขนี้อยู่ในชุดเลขเด่นของงวดก่อน */
  chances: number;
  recurrenceRatePercent: number;
}

/** เลขประกอบ 2 ตัวจากชุดเลขวน — เก็บเป็น string รักษาเลข 0 นำหน้า (เช่น "04") */
export interface ComposedNumberCandidate {
  /** เลข 2 หลัก เช่น "34", "06" */
  number: string;
  /** จำนวนครั้งที่เลขนี้ออกเป็นเลขบนหรือเลขล่าง จากทุกคู่ที่ประกอบเลขนี้ได้จากชุดเลขวน */
  hitTimes: number;
  /** จำนวนคู่งวดที่ประกอบเลขนี้ได้จากชุดเลขวนของงวดก่อน */
  chances: number;
  ratePercent: number;
  hitsAsUpper: number;
  hitsAsLower: number;
}

/** ผลวิเคราะห์ "งวดถัดไปน่าจะออกอะไร จากสูตรเลขวน" — เป็นสถิติย้อนหลัง ไม่ใช่การรับประกัน */
export interface NextDrawPrediction {
  latestDraw: LotteryDraw;
  /** วันที่งวดถัดไปตามปฏิทินปกติ (งวดที่ 1 และ 16) */
  nextDrawDate: string;
  nextDrawLabel: string;
  /** เลขวนจากสูตร เรียงตามอัตราการวนกลับจริงย้อนหลัง */
  candidateDigits: CandidateDigit[];
  /** เลขประกอบ 2 ตัวจากชุดเลขวน เรียงตามอัตราการออกจริงย้อนหลัง (chances = 0 เมื่อไม่มีข้อมูลคู่งวด) */
  composedNumbers: ComposedNumberCandidate[];
  pairsAnalyzed: number;
  /** จำนวนคู่งวดในอดีตที่มีเลขจากงวดก่อนกลับมาปรากฏอย่างน้อย 1 ตัว */
  pairsWithAnyRecur: number;
  overallRecurrenceRatePercent: number;
  upperExactHistory: ExactMatchHistory;
  lowerExactHistory: ExactMatchHistory;
}
