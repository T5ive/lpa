import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Copy,
  GitCompareArrows,
  ListOrdered,
  Repeat2,
  Scissors,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DigitTile } from "@/components/lottery/DigitTile";
import { DigitRow } from "@/components/lottery/DigitRow";
import { ProbabilitySection } from "@/features/lottery/components/ProbabilitySection";
import {
  ErrorState,
  LoadingState,
} from "@/features/lottery/components/DataStatusViews";
import { useLotteryData } from "@/features/lottery/hooks/useLotteryData";
import { calculateHistoricalStatistics } from "@/features/lottery/utils/statistics";
import { PageShell } from "./OverviewPage";

const STEPS = [
  {
    icon: Copy,
    title: "1. หาเลข 2 ตัวบน",
    body: "เลขบนคือสองหลักท้ายของรางวัลที่ 1 เช่น รางวัลที่ 1 ออก 423224 → เลขบนคือ 24",
  },
  {
    icon: ListOrdered,
    title: "2. หาเลข 2 ตัวล่าง",
    body: "ใช้รางวัลเลขท้าย 2 ตัวของงวดนั้น เช่น 85 — เก็บเลข 0 นำหน้าไว้เสมอ เช่น 06",
  },
  {
    icon: Scissors,
    title: "3. รวมเป็นชุดเลขเด่น",
    body: "เอาเลขบน + เลขล่างมารวมกันแล้วตัดตัวที่ซ้ำออก เช่น 24 กับ 85 → ชุดเลขเด่น [2, 4, 8, 5]",
  },
  {
    icon: GitCompareArrows,
    title: "4. เทียบกับงวดก่อน",
    body: "ดูว่าเลขใดปรากฏทั้งสองงวด (เลขวน), เลขใดหายไป และเลขใดเป็นเลขใหม่",
  },
] as const;

/** ตัวอย่างย่อสำหรับอธิบายความต่างของแต่ละเกณฑ์ */
function CriteriaExample({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
}

function MiniPair({
  upperA,
  lowerA,
  upperB,
  lowerB,
}: {
  upperA: string;
  lowerA: string;
  upperB: string;
  lowerB: string;
}) {
  const tiles = (value: string) =>
    value.split("").map((ch, index) => (
      <DigitTile key={index} digit={Number(ch) as 0} size="sm" />
    ));
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <span className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">งวดก่อน</span>
        {tiles(upperA)} / {tiles(lowerA)}
      </span>
      <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
      <span className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">งวดหลัง</span>
        {tiles(upperB)} / {tiles(lowerB)}
      </span>
    </div>
  );
}

export function MethodologyPage() {
  const { draws, loading, error, reload } = useLotteryData();
  const statistics = useMemo(() => calculateHistoricalStatistics(draws), [draws]);

  if (loading) {
    return (
      <PageShell>
        <LoadingState />
      </PageShell>
    );
  }
  if (error) {
    return (
      <PageShell>
        <ErrorState issues={error} onRetry={reload} />
      </PageShell>
    );
  }

  const realPairsLabel = `${statistics.pairsWithCommon} จาก ${statistics.totalPairs} คู่งวด`;

  return (
    <PageShell>
      <section className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">วิธีการวิเคราะห์</h1>
        <p className="text-sm text-muted-foreground">
          อ่านจบหน้านี้แล้วจะรู้ว่าเว็บนี้คิด "เลขวน" อย่างไร และอะไรคืออะไรบ้าง
        </p>
      </section>

      <section aria-label="ขั้นตอนการวิเคราะห์" className="space-y-3">
        <h2 className="text-lg font-bold">วิธีคิดทีละขั้น</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((step) => (
            <Card key={step.title}>
              <CardContent className="flex gap-3 px-4 py-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <step.icon className="size-4" aria-hidden />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-label="แยกเกณฑ์ให้ชัด" className="space-y-3">
        <h2 className="text-lg font-bold">แยกเกณฑ์ให้ชัด — คนละเรื่องกัน ห้ามรวมเป็นอัตราเดียว</h2>
        <div className="grid gap-3 lg:grid-cols-3">
          <CriteriaExample
            title="เลขซ้ำหนึ่งหลัก"
            description="มีตัวเลขอย่างน้อย 1 ตัวที่ปรากฏในชุดเลขเด่นทั้งสองงวด แม้ตำแหน่งจะไม่ตรงกันก็นับ"
          >
            <MiniPair upperA="24" lowerA="85" upperB="54" lowerB="06" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              เลข 4 และ 5 ปรากฏทั้งสองงวด → นับว่า "มีเลขซ้ำ" แต่ยังไม่ใช่การทายถูก
            </p>
          </CriteriaExample>
          <CriteriaExample
            title="เลขซ้ำสองหลัก (ตรงทั้งคู่)"
            description="เลขบนตรงกันทั้งสองหลัก หรือเลขล่างตรงกันทั้งสองหลัก — คือการที่ชุดตัวเลขวนกลับมาเป๊ะ"
          >
            <MiniPair upperA="12" lowerA="85" upperB="12" lowerB="06" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              เลขบนออก 12 ซ้ำกันทั้งสองงวด → นับเกณฑ์ "บนตรง 2 หลัก"
            </p>
          </CriteriaExample>
          <CriteriaExample
            title="ทาย 2 ตัวถูกตามตำแหน่งจริง"
            description="ถ้าใช้เลขบนของงวดก่อนเป็นคำทายสำหรับงวดหลัง แล้วออกตรงเป๊ะ นั่นคือการทายถูกที่ผู้คนมักเข้าใจ"
          >
            <MiniPair upperA="54" lowerA="85" upperB="54" lowerB="06" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              ทายบนว่าจะออก 54 และออกจริง → เกณฑ์นี้เกิดได้ทั้งจากบนหรือล่างตรง 2 หลัก
            </p>
          </CriteriaExample>
        </div>
        <p className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/50 p-3 text-sm leading-relaxed text-muted-foreground">
          <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          เว็บนี้จึงรายงานสถิติแยกตามเกณฑ์เสมอ: อัตรามีเลขซ้ำ / บนตรง 2 หลัก / ล่างตรง 2 หลัก และไม่นำมารวมกันเป็น
          "อัตราแม่นยำ" ที่ชวนเข้าใจผิด
        </p>
      </section>

      <ProbabilitySection
        realRatePercent={statistics.repeatRatePercent}
        realPairsLabel={realPairsLabel}
      />

      <section aria-label="สูตรเลขวน" className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Repeat2 className="size-5 text-primary" aria-hidden />
          สูตรเลขวน ทำงานอย่างไร
        </h2>
        <Card>
          <CardContent className="space-y-3 px-4 py-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              สูตรเลขวนสมมติว่า "เลขเด่นของงวดล่าสุดมีโอกาสกลับมาปรากฏในงวดถัดไป"
              เว็บนี้จึงนำชุดเลขเด่นของงวดล่าสุดมาเป็นตัวเลขวน แล้ววัดกับของจริงย้อนหลังว่า
              แต่ละเลขเคยกลับมากี่ครั้งจากกี่โอกาส และทั้งชุดมีเลขกลับมาอย่างน้อย 1 ตัวบ่อยแค่ไหน
            </p>
            <p>
              ข้อจำกัดที่ต้องรู้: การนับย้อนหลังบอกได้แค่ว่า "ในอดีตเกิดขึ้นบ่อยแค่ไหน"
              ไม่สามารถรับประกันหรือเพิ่มโอกาสถูกรางวัลในอนาคตได้ เพราะผลสลากแต่ละงวดออกแบบสุ่มอิสระจากกัน
            </p>
            <p>
              ดูตัวเลขวนของงวดถัดไปได้ที่หน้า{" "}
              <Link to="/" className="font-medium text-primary underline-offset-2 hover:underline">
                ภาพรวม
              </Link>{" "}
              และดูประวัติทั้งหมดได้ในหน้า{" "}
              <Link to="/history" className="font-medium text-primary underline-offset-2 hover:underline">
                สถิติย้อนหลัง
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>

      <section aria-label="ตัวอย่างชุดเลขเด่น" className="space-y-2">
        <h2 className="text-lg font-bold">ตัวอย่างจากข้อมูลจริง</h2>
        <Card>
          <CardContent className="space-y-3 px-4 py-4 text-sm">
            <p className="leading-relaxed text-muted-foreground">
              งวด 1 พฤศจิกายน 2569 รางวัลที่ 1 คือ 423224 → บน 24 ล่าง 85 → ชุดเลขเด่น:
            </p>
            <DigitRow digits={[2, 4, 8, 5]} size="md" />
            <p className="leading-relaxed text-muted-foreground">
              งวด 16 พฤศจิกายน 2569 รางวัลที่ 1 คือ 645654 → บน 54 ล่าง 06 → ชุดเลขเด่น:
            </p>
            <DigitRow digits={[5, 4, 0, 6]} size="md" />
            <p className="leading-relaxed text-muted-foreground">
              ผลเทียบ: ซ้ำ [4, 5] · หายไป [2, 8] · เลขใหม่ [0, 6] → มีเลขซ้ำ 2 ตัว
            </p>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
