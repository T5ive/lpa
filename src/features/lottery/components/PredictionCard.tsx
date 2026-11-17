import { AlertTriangle, Sparkles, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NextDrawPrediction } from "../types/lottery";
import { formatThaiDate } from "../utils/thaiDate";

/** แถบความก้าวหน้าเล็กแสดงอัตรา % */
function RateBar({ percent, label }: { percent: number; label: string }) {
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
      role="img"
      aria-label={`${label} ${percent} เปอร์เซ็นต์`}
    >
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

/**
 * การ์ด "งวดต่อไปน่าจะออกอะไร จากสูตรเลขวน"
 * ตัวเลขวน = ชุดเลขเด่นงวดล่าสุด เรียงตามอัตราการวนกลับจริงย้อนหลังของแต่ละเลข
 * พร้อมคำเตือนชัดเจนว่าเป็นสถิติ ไม่ใช่การรับประกัน
 */
export function PredictionCard({ prediction }: { prediction: NextDrawPrediction }) {
  const { candidateDigits, composedNumbers: composed, latestDraw, nextDrawLabel } = prediction;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="size-5 text-primary" aria-hidden />
          งวดถัดไปน่าจะออกอะไร จากสูตรเลขวน
        </CardTitle>
        <p className="text-sm leading-relaxed text-muted-foreground">
          สูตรเลขวนใช้ชุดเลขเด่นของงวดล่าสุด ({formatThaiDate(latestDraw.date)}) เป็นตัวเลขวนสำหรับ
          งวดวันที่ <strong className="text-foreground">{nextDrawLabel}</strong> (โดยประมาณตามปฏิทินงวดที่ 1 และ 16)
          แล้วเรียงตามอัตราการวนกลับจริงย้อนหลังของแต่ละเลข
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <ul className="space-y-3">
          {candidateDigits.map((candidate) => (
            <li key={candidate.digit} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex size-10 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-xl font-bold text-indigo-700 tabular-nums dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-200">
                    {candidate.digit}
                  </span>
                  <div className="text-sm">
                    <p className="font-semibold">เลข {candidate.digit}</p>
                    <p className="text-xs text-muted-foreground">
                      เคยกลับมา {candidate.recurredTimes} จาก {candidate.chances} ครั้งที่อยู่ในชุดเลขวน
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums">
                  {candidate.recurrenceRatePercent}%
                </span>
              </div>
              <RateBar
                percent={candidate.recurrenceRatePercent}
                label={`อัตราการวนกลับของเลข ${candidate.digit}`}
              />
            </li>
          ))}
        </ul>

        <div className="space-y-2.5">
          <p className="text-sm font-semibold">เลขประกอบ 2 ตัว จากชุดเลขวน</p>
          {prediction.pairsAnalyzed > 0 ? (
            <>
              <p className="text-xs leading-relaxed text-muted-foreground">
                นำชุดเลขวนมาประกอบเป็นเลข 2 ตัวได้ทั้งหมด {composed.length} แบบ
                เรียงตามอัตราการออกจริงย้อนหลัง — กี่ครั้งที่เลขนั้นออกเป็นบนหรือล่าง
                จากทุกคู่งวดที่เลขนั้นถูกประกอบได้จากงวดก่อน (ชี้ที่ตัวเลขเพื่อดูรายละเอียด)
              </p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {composed.map((candidate) => (
                  <div
                    key={candidate.number}
                    className="flex flex-col items-center gap-1 rounded-lg border border-border/70 bg-muted/40 py-2"
                    title={`เลข ${candidate.number}: ออกเป็นบน ${candidate.hitsAsUpper} ครั้ง, ล่าง ${candidate.hitsAsLower} ครั้ง จาก ${candidate.chances} คู่งวดที่ประกอบได้`}
                  >
                    <span className="inline-flex h-8 w-11 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 text-lg font-bold text-indigo-700 tabular-nums dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-200">
                      {candidate.number}
                    </span>
                    <span className="text-xs font-bold tabular-nums">
                      {candidate.ratePercent}%
                    </span>
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {candidate.hitTimes}/{candidate.chances}
                    </span>
                  </div>
                ))}
              </div>
              <p className="rounded-md bg-background p-2 text-xs leading-relaxed text-muted-foreground">
                ตามทฤษฎีแล้วโอกาสของเลข 2 ตัวใด ๆ คือ 1 ใน 100 ตัวเลขข้างบนเป็นการ
                <strong className="text-foreground">นับสถิติย้อนหลังตามสูตร</strong>เท่านั้น ไม่ใช่โอกาสถูกรางวัลที่เพิ่มขึ้น
              </p>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              {composed.map((candidate) => (
                <span
                  key={candidate.number}
                  className="inline-flex h-9 w-12 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 text-lg font-bold text-indigo-700 tabular-nums dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-200"
                >
                  {candidate.number}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/50 p-3 text-sm leading-relaxed">
          <TrendingUp className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p>
            ในอดีต มีเลขจากงวดก่อนกลับมาปรากฏอย่างน้อย 1 ตัว ใน{" "}
            <strong className="text-foreground">
              {prediction.pairsWithAnyRecur} จาก {prediction.pairsAnalyzed} คู่งวด
            </strong>{" "}
            ({prediction.overallRecurrenceRatePercent}%)
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/70 p-3">
            <p className="text-xs text-muted-foreground">เลขบนตรงทั้ง 2 หลัก (แยกตามเกณฑ์)</p>
            <p className="text-lg font-bold tabular-nums">
              {prediction.upperExactHistory.matched}/{prediction.upperExactHistory.total}{" "}
              <span className="text-sm font-medium">({prediction.upperExactHistory.ratePercent}%)</span>
            </p>
          </div>
          <div className="rounded-lg border border-border/70 p-3">
            <p className="text-xs text-muted-foreground">เลขล่างตรงทั้ง 2 หลัก (แยกตามเกณฑ์)</p>
            <p className="text-lg font-bold tabular-nums">
              {prediction.lowerExactHistory.matched}/{prediction.lowerExactHistory.total}{" "}
              <span className="text-sm font-medium">({prediction.lowerExactHistory.ratePercent}%)</span>
            </p>
          </div>
        </div>

        <Alert className="border-amber-500/50 bg-amber-500/10 text-foreground">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle>อ่านก่อนใช้</AlertTitle>
          <AlertDescription className="leading-relaxed">
            ตัวเลขข้างต้นเป็นการ<strong>นับสถิติย้อนหลังตามสูตรเลขวน</strong>จากชุดข้อมูลที่มีอยู่เท่านั้น
            ไม่ใช่การรับประกันหรือทำนายผลหวยงวดถัดไป ผลสลากออกแบบสุ่ม
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
