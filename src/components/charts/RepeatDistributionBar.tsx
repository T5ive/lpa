import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import type { HistoricalStatistics } from "@/features/lottery/types/lottery";

const BUCKET_LABELS: Record<number, string> = {
  0: "0 ตัว",
  1: "1 ตัว",
  2: "2 ตัว",
  3: "3 ตัว",
  4: "4 ตัวขึ้นไป",
};

/** กราฟแท่ง: จำนวนคู่งวดแยกตามจำนวนเลขที่ซ้ำ 0–4 ตัว */
export function RepeatDistributionBar({ statistics }: { statistics: HistoricalStatistics }) {
  const data = statistics.repeatDistribution.map((bucket) => ({
    label: BUCKET_LABELS[bucket.count] ?? `${bucket.count} ตัว`,
    pairs: bucket.pairs,
  }));

  return (
    <ChartCard
      title="จำนวนคู่งวดตามจำนวนเลขซ้ำ"
      description="นับจากคู่งวดติดกันทั้งหมดในชุดข้อมูล — เลขซ้ำ 0 ตัว = ไม่มีเลขใดตรงกันเลย"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <Tooltip
            cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
            formatter={(value) => [`${value} คู่งวด`, "จำนวนคู่"]}
          />
          <Bar dataKey="pairs" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={56} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
