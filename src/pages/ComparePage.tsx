import { useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { ComparisonHero } from "@/components/lottery/ComparisonHero";
import { ComparisonLegend } from "@/components/lottery/ComparisonLegend";
import { ResultSummaryCard } from "@/components/lottery/ResultSummaryCard";
import {
  ErrorState,
  LoadingState,
} from "@/features/lottery/components/DataStatusViews";
import { DrawSelector } from "@/features/lottery/components/DrawSelector";
import { useLotteryData } from "@/features/lottery/hooks/useLotteryData";
import { compareDraws, getPreviousDraw } from "@/features/lottery/utils/compare";
import { PageShell } from "./OverviewPage";

export function ComparePage() {
  const { draws, drawsAsc, loading, error, reload } = useLotteryData();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const effectiveDate = selectedDate ?? draws[0]?.date ?? null;
  const selected = useMemo(
    () => draws.find((draw) => draw.date === effectiveDate) ?? null,
    [draws, effectiveDate],
  );
  const previous = useMemo(
    () => (selected ? getPreviousDraw(drawsAsc, selected) : null),
    [drawsAsc, selected],
  );
  const comparison = useMemo(
    () => (selected ? compareDraws(selected, previous) : null),
    [selected, previous],
  );

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
  if (!selected) {
    return (
      <PageShell>
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          ต้องมีข้อมูลงวดอย่างน้อย 1 งวดจึงจะเปรียบเทียบได้
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">เปรียบเทียบงวด</h1>
        <p className="text-sm text-muted-foreground">
          เลือกงวดที่ต้องการ แล้วดูผลเทียบกับงวดก่อนหน้าทันที ครบทั้ง 4 เกณฑ์แยกกันชัดเจน
        </p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <DrawSelector draws={draws} value={selected.date} onChange={setSelectedDate} />
        <ComparisonLegend />
      </div>

      <section aria-label="การเปรียบเทียบงวดที่เลือก">
        {comparison ? <ComparisonHero comparison={comparison} /> : null}
      </section>

      {comparison ? <ResultSummaryCard comparison={comparison} /> : null}

      <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/50 p-4 text-sm leading-relaxed text-muted-foreground">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <p>
          เกณฑ์ "มีเลขซ้ำ" กับ "ทาย 2 ตัวถูกตามตำแหน่ง" เป็นคนละเรื่องกัน
          มีเลขซ้ำได้ทั้งที่ตำแหน่งไม่ตรง และไม่มีเลขซ้ำย่อมไม่มีทางถูกตามตำแหน่ง
          — ดูรายละเอียดวิธีคิดได้ในหน้า "วิธีการวิเคราะห์"
        </p>
      </div>
    </PageShell>
  );
}
