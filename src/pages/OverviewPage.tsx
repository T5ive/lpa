import { useMemo, useState } from "react";
import { ComparisonHero } from "@/components/lottery/ComparisonHero";
import { ComparisonLegend } from "@/components/lottery/ComparisonLegend";
import { ResultSummaryCard } from "@/components/lottery/ResultSummaryCard";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/features/lottery/components/DataStatusViews";
import { DrawSelector } from "@/features/lottery/components/DrawSelector";
import { KpiCards } from "@/features/lottery/components/KpiCards";
import { PredictionCard } from "@/features/lottery/components/PredictionCard";
import { useLotteryData } from "@/features/lottery/hooks/useLotteryData";
import { calculateHistoricalStatistics, calculateNextDrawPrediction } from "@/features/lottery/utils/statistics";
import { compareDraws, getPreviousDraw } from "@/features/lottery/utils/compare";

export function OverviewPage() {
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

  const statistics = useMemo(() => calculateHistoricalStatistics(draws), [draws]);
  const prediction = useMemo(() => calculateNextDrawPrediction(draws), [draws]);

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
  if (draws.length === 0) {
    return (
      <PageShell>
        <EmptyState />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">เลขวนงวดล่าสุด</h1>
        <p className="text-sm text-muted-foreground">
          เทียบชุดเลขเด่นของงวดล่าสุดกับงวดก่อนหน้า ดูว่าเลขใดวนกลับมา
        </p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <DrawSelector
          draws={draws}
          value={effectiveDate ?? draws[0].date}
          onChange={setSelectedDate}
        />
        <ComparisonLegend />
      </div>

      {comparison ? (
        <>
          <section aria-label="การเปรียบเทียบงวด">
            <ComparisonHero comparison={comparison} />
          </section>

          <section aria-label="สรุปผลการเปรียบเทียบ">
            <ResultSummaryCard comparison={comparison} />
          </section>
        </>
      ) : null}

      <section aria-label="สรุปตัวเลขภาพรวม" className="space-y-3">
        <h2 className="text-lg font-bold">ภาพรวมทั้งหมด</h2>
        <KpiCards statistics={statistics} />
      </section>

      {prediction ? (
        <section aria-label="การวิเคราะห์งวดถัดไป" className="space-y-3">
          <h2 className="text-lg font-bold">มองไปข้างหน้า</h2>
          <PredictionCard prediction={prediction} />
        </section>
      ) : null}
    </PageShell>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">{children}</div>;
}
