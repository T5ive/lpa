import { useMemo, useState } from "react";
import { DigitFrequencyBar } from "@/components/charts/DigitFrequencyBar";
import { MonthlyTrendLine } from "@/components/charts/MonthlyTrendLine";
import { RepeatDistributionBar } from "@/components/charts/RepeatDistributionBar";
import { DrawDetailSheet } from "@/features/lottery/components/DrawDetailSheet";
import { HistoryTable } from "@/features/lottery/components/HistoryTable";
import { KpiCards } from "@/features/lottery/components/KpiCards";
import {
  ErrorState,
  LoadingState,
} from "@/features/lottery/components/DataStatusViews";
import { useLotteryData } from "@/features/lottery/hooks/useLotteryData";
import type { LotteryDraw } from "@/features/lottery/types/lottery";
import { compareDraws, getPreviousDraw } from "@/features/lottery/utils/compare";
import { calculateHistoricalStatistics } from "@/features/lottery/utils/statistics";
import { PageShell } from "./OverviewPage";

export function HistoryPage() {
  const { draws, drawsAsc, loading, error, reload } = useLotteryData();
  const [detailDate, setDetailDate] = useState<string | null>(null);

  const statistics = useMemo(() => calculateHistoricalStatistics(draws), [draws]);

  const detailDraw = useMemo(
    () => (detailDate ? draws.find((draw) => draw.date === detailDate) ?? null : null),
    [draws, detailDate],
  );
  const detailComparison = useMemo(
    () =>
      detailDraw
        ? compareDraws(detailDraw, getPreviousDraw(drawsAsc, detailDraw))
        : null,
    [drawsAsc, detailDraw],
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

  return (
    <PageShell>
      <section className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">สถิติย้อนหลัง</h1>
        <p className="text-sm text-muted-foreground">
          ตารางเปรียบเทียบทุกงวดกับงวดก่อนหน้า กรอง ค้นหา และเรียงลำดับได้
          คลิกแถวเพื่อดูรายละเอียด
        </p>
      </section>

      <KpiCards statistics={statistics} />

      <section aria-label="ตารางวิเคราะห์ย้อนหลัง">
        <HistoryTable draws={draws} onSelectRow={(draw: LotteryDraw) => setDetailDate(draw.date)} />
      </section>

      <section aria-label="กราฟสถิติ" className="space-y-4">
        <h2 className="text-lg font-bold">กราฟวิเคราะห์</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <RepeatDistributionBar statistics={statistics} />
          <MonthlyTrendLine statistics={statistics} />
          <div className="lg:col-span-2">
            <DigitFrequencyBar draws={draws} />
          </div>
        </div>
      </section>

      <DrawDetailSheet
        comparison={detailComparison}
        open={detailDate !== null}
        onOpenChange={(open) => {
          if (!open) setDetailDate(null);
        }}
      />
    </PageShell>
  );
}
