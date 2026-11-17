import type {
  CandidateDigit,
  ComposedNumberCandidate,
  Digit,
  DigitFrequencyMode,
  DigitFrequencyResult,
  DrawPair,
  HistoricalStatistics,
  LotteryDraw,
  MonthlyTrendPoint,
  NextDrawPrediction,
  RepeatDistributionBucket,
} from "../types/lottery";
import { buildDrawPairs, compareDraws, sortDrawsAsc } from "./compare";
import { extractDigits, getDrawDigitSet, getUpperDigits } from "./digits";
import { formatThaiDate, formatThaiMonthKey, getNextDrawDate } from "./thaiDate";

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** สถิติรวมทั้งชุดข้อมูล — อิงคู่งวดติดกันเสมอ */
export function calculateHistoricalStatistics(
  draws: LotteryDraw[],
): HistoricalStatistics {
  const pairs = buildDrawPairs(draws);
  const comparisons = pairs.map((pair) =>
    compareDraws(pair.current, pair.previous),
  );

  const totalPairs = pairs.length;
  const pairsWithCommon = comparisons.filter((c) => c.hasCommon).length;
  const totalCommonCount = comparisons.reduce((sum, c) => sum + c.commonCount, 0);

  const distributionCounts = new Array<number>(5).fill(0) as number[];
  for (const c of comparisons) {
    const bucket = Math.min(c.commonCount, 4);
    distributionCounts[bucket] += 1;
  }
  const repeatDistribution: RepeatDistributionBucket[] =
    distributionCounts.map((pairsCount, count) => ({
      count: count as RepeatDistributionBucket["count"],
      pairs: pairsCount,
    }));

  return {
    totalDraws: draws.length,
    totalPairs,
    pairsWithCommon,
    pairsWithoutCommon: totalPairs - pairsWithCommon,
    repeatRatePercent: totalPairs
      ? round1((pairsWithCommon / totalPairs) * 100)
      : 0,
    averageCommonCount: totalPairs ? round2(totalCommonCount / totalPairs) : 0,
    repeatDistribution,
    monthlyTrend: calculateMonthlyTrend(pairs),
  };
}

/** แนวโน้มรายเดือน: จับกลุ่มคู่งวดตามเดือนของ "งวดหลัง" ในแต่ละคู่ */
function calculateMonthlyTrend(pairs: DrawPair[]): MonthlyTrendPoint[] {
  const byMonth = new Map<string, { pairs: number; withCommon: number }>();
  for (const pair of pairs) {
    const key = pair.current.date.slice(0, 7); // yyyy-MM
    const entry = byMonth.get(key) ?? { pairs: 0, withCommon: 0 };
    entry.pairs += 1;
    if (compareDraws(pair.current, pair.previous).hasCommon) {
      entry.withCommon += 1;
    }
    byMonth.set(key, entry);
  }
  const points = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      key,
      month: formatThaiMonthKey(key),
      pairs: value.pairs,
      pairsWithCommon: value.withCommon,
      ratePercent: round1((value.withCommon / value.pairs) * 100),
      rollingRatePercent: null as number | null,
    }));

  // ค่าเฉลี่ยเลื่อน 12 เดือน — อ่านแนวโน้มได้ง่ายเมื่อข้อมูลยาวหลายปี
  const WINDOW = 12;
  for (let index = WINDOW - 1; index < points.length; index++) {
    const windowPoints = points.slice(index - WINDOW + 1, index + 1);
    const totalPairs = windowPoints.reduce((sum, point) => sum + point.pairs, 0);
    const totalWithCommon = windowPoints.reduce(
      (sum, point) => sum + point.pairsWithCommon,
      0,
    );
    points[index].rollingRatePercent = totalPairs
      ? round1((totalWithCommon / totalPairs) * 100)
      : null;
  }
  return points;
}

/** ความถี่ของเลข 0–9 แยกตามตำแหน่งบน / ล่าง / รวม */
export function calculateDigitFrequency(
  draws: LotteryDraw[],
  mode: DigitFrequencyMode = "both",
): DigitFrequencyResult {
  const counts = new Array<number>(10).fill(0);
  for (const draw of draws) {
    if (mode !== "down") {
      for (const digit of extractDigits(getUpperDigits(draw))) {
        counts[digit] += 1;
      }
    }
    if (mode !== "up") {
      for (const digit of extractDigits(draw.lastTwoDigits)) {
        counts[digit] += 1;
      }
    }
  }
  return {
    mode,
    counts,
    totalOccurrences: counts.reduce((sum, count) => sum + count, 0),
  };
}

/**
 * วิเคราะห์ "งวดถัดไปน่าจะออกอะไร จากสูตรเลขวน"
 * ตัวเลขวน = ชุดเลขเด่นของงวดล่าสุด โดยเรียงตามอัตราการวนกลับจริง
 * (เลขนั้นเคยอยู่ในชุดเลขเด่นงวดก่อนแล้วกลับมาปรากฏในงวดถัดมากี่ครั้ง)
 * สถิติบน/ล่างตรง 2 หลักแยกกันตามเกณฑ์ — ไม่รวมเป็นอัตราเดียว
 */
export function calculateNextDrawPrediction(
  draws: LotteryDraw[],
): NextDrawPrediction | null {
  const sorted = sortDrawsAsc(draws);
  if (sorted.length === 0) return null;
  const latestDraw = sorted[sorted.length - 1];
  const pairs = buildDrawPairs(draws);

  const chances = new Array<number>(10).fill(0);
  const recurred = new Array<number>(10).fill(0);
  let pairsWithAnyRecur = 0;
  let upperExact = 0;
  let lowerExact = 0;

  for (const pair of pairs) {
    const previousSet = getDrawDigitSet(pair.previous);
    const currentSet = getDrawDigitSet(pair.current);
    for (const digit of previousSet) {
      chances[digit] += 1;
      if (currentSet.includes(digit)) recurred[digit] += 1;
    }
    if (previousSet.some((digit) => currentSet.includes(digit))) {
      pairsWithAnyRecur += 1;
    }
    if (getUpperDigits(pair.previous) === getUpperDigits(pair.current)) {
      upperExact += 1;
    }
    if (pair.previous.lastTwoDigits === pair.current.lastTwoDigits) {
      lowerExact += 1;
    }
  }

  const candidateDigits: CandidateDigit[] = getDrawDigitSet(latestDraw)
    .map((digit) => {
      const chance = chances[digit];
      return {
        digit,
        chances: chance,
        recurredTimes: recurred[digit],
        recurrenceRatePercent: chance
          ? round1((recurred[digit] / chance) * 100)
          : 0,
      };
    })
    .sort(
      (a, b) =>
        b.recurrenceRatePercent - a.recurrenceRatePercent || a.digit - b.digit,
    );

  /**
   * เลขประกอบ 2 ตัวจากชุดเลขวน (ทุกแบบเรียงลำดับ รวมเลขซ้ำ เช่น 44)
   * "โอกาส" = นับจากของจริง: กี่ครั้งที่เลขนั้นออกเป็นบน/ล่าง จากทุกคู่งวดที่เลขนั้น
   * ถูกประกอบได้จากชุดเลขวนของงวดก่อน (ทั้งสองหลักอยู่ในชุดเลขเด่น)
   */
  const candidateDigitsSet = getDrawDigitSet(latestDraw);
  const composedStats = new Map<
    string,
    { hitTimes: number; chances: number; hitsAsUpper: number; hitsAsLower: number }
  >();
  for (const a of candidateDigitsSet) {
    for (const b of candidateDigitsSet) {
      composedStats.set(`${a}${b}`, {
        hitTimes: 0,
        chances: 0,
        hitsAsUpper: 0,
        hitsAsLower: 0,
      });
    }
  }
  for (const pair of pairs) {
    const previousSet = getDrawDigitSet(pair.previous);
    for (const [number, stat] of composedStats) {
      // สร้างคีย์จาก Digit จริง จึง cast กลับได้อย่างปลอดภัย
      const first = Number(number[0]) as Digit;
      const second = Number(number[1]) as Digit;
      if (!previousSet.includes(first) || !previousSet.includes(second)) continue;
      stat.chances += 1;
      if (getUpperDigits(pair.current) === number) {
        stat.hitTimes += 1;
        stat.hitsAsUpper += 1;
      }
      if (pair.current.lastTwoDigits === number) {
        stat.hitTimes += 1;
        stat.hitsAsLower += 1;
      }
    }
  }
  const composedNumbers: ComposedNumberCandidate[] = [...composedStats.entries()]
    .map(([number, stat]) => ({
      number,
      hitTimes: stat.hitTimes,
      chances: stat.chances,
      ratePercent: stat.chances ? round1((stat.hitTimes / stat.chances) * 100) : 0,
      hitsAsUpper: stat.hitsAsUpper,
      hitsAsLower: stat.hitsAsLower,
    }))
    .sort(
      (a, b) =>
        b.ratePercent - a.ratePercent ||
        b.hitTimes - a.hitTimes ||
        a.number.localeCompare(b.number),
    );

  const toPercent = (matched: number) =>
    pairs.length ? round1((matched / pairs.length) * 100) : 0;

  const nextDrawDate = getNextDrawDate(latestDraw.date);
  return {
    latestDraw,
    nextDrawDate,
    nextDrawLabel: formatThaiDate(nextDrawDate),
    candidateDigits,
    composedNumbers,
    pairsAnalyzed: pairs.length,
    pairsWithAnyRecur,
    overallRecurrenceRatePercent: toPercent(pairsWithAnyRecur),
    upperExactHistory: {
      matched: upperExact,
      total: pairs.length,
      ratePercent: toPercent(upperExact),
    },
    lowerExactHistory: {
      matched: lowerExact,
      total: pairs.length,
      ratePercent: toPercent(lowerExact),
    },
  };
}
