import { Info, Repeat2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DrawComparison } from "@/features/lottery/types/lottery";
import { formatThaiDate } from "@/features/lottery/utils/thaiDate";
import { DigitRow } from "./DigitRow";
import { CriteriaBadges } from "./CriteriaBadges";

/** การ์ดสรุปผล: "พบเลขซ้ำ 2 ตัว ได้แก่ 4 และ 5" + คำอธิบายกันเข้าใจผิด */
export function ResultSummaryCard({ comparison }: { comparison: DrawComparison }) {
  const { commonDigits, onlyInCurrent, previous, current } = comparison;
  const commonText = commonDigits.length
    ? commonDigits.join(" และ ")
    : "";

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Repeat2 className="size-5 text-primary" aria-hidden />
          ผลการเปรียบเทียบ
        </CardTitle>
        {previous ? (
          <p className="text-sm text-muted-foreground">
            งวดวันที่ {formatThaiDate(previous.date)} เทียบกับงวดวันที่ {formatThaiDate(current.date)}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {!previous ? (
          <p className="text-sm text-muted-foreground">
            ไม่มีงวดก่อนหน้าให้เปรียบเทียบ เลือกงวดที่ใหม่กว่าเพื่อดูผลการเปรียบเทียบ
          </p>
        ) : commonDigits.length > 0 ? (
          <>
            <p className="text-lg font-semibold leading-relaxed">
              พบเลขซ้ำ {commonDigits.length} ตัว ได้แก่ {commonText}
            </p>
            <DigitRow digits={commonDigits} variant="repeat" size="lg" withIcon />
            <div className="space-y-2 rounded-lg border border-border/70 bg-muted/50 p-3 text-sm leading-relaxed text-muted-foreground">
              <p className="flex items-start gap-2">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  หมายถึงตัวเลข {commonText} ปรากฏอยู่ในชุดเลขเด่นของทั้งสองงวด
                  <strong className="mx-1 text-foreground">ไม่ได้หมายความว่าทายเลข 2 ตัวถูก</strong>
                  เพราะตำแหน่งและลำดับอาจไม่ตรงกัน
                </span>
              </p>
              {onlyInCurrent.length > 0 ? (
                <p>
                  และมีเลขใหม่ที่ปรากฏเฉพาะในงวดล่าสุด {onlyInCurrent.length} ตัว ได้แก่ {onlyInCurrent.join(" และ ")}
                </p>
              ) : null}
            </div>
            <CriteriaBadges comparison={comparison} />
          </>
        ) : (
          <>
            <p className="text-lg font-semibold">ไม่พบเลขซ้ำในงวดนี้</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              ชุดเลขเด่นของทั้งสองงวดไม่มีตัวเลขใดตรงกันเลย เกิดขึ้นได้ตามปกติ
              และมีเลขใหม่ {onlyInCurrent.length} ตัว ได้แก่ {onlyInCurrent.join(" และ ")}
            </p>
            <CriteriaBadges comparison={comparison} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
