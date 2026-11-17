import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./ChartCard";
import type { HistoricalStatistics } from "@/features/lottery/types/lottery";

/** กราฟเส้น: แนวโน้มอัตราการมีเลขซ้ำรายเดือน (%) */
export function MonthlyTrendLine({ statistics }: { statistics: HistoricalStatistics }) {
  const data = statistics.monthlyTrend;

  return (
    <ChartCard
      title="แนวโน้มอัตราการมีเลขซ้ำรายเดือน"
      description="จับกลุ่มคู่งวดตามเดือนของงวดหลัง เพื่อดูว่าเลขซ้ำเกิดถี่หรือห่างแค่ไหนในแต่ละช่วง"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: -8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
            className="text-muted-foreground"
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value: number) => `${value}%`}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <Tooltip
            formatter={(value, name, item) => {
              const point = item?.payload as
                | { pairs?: number; pairsWithCommon?: number }
                | undefined;
              return [
                `${value}% (${point?.pairsWithCommon ?? 0}/${point?.pairs ?? 0} คู่งวด)`,
                name === "rollingRatePercent"
                  ? "ค่าเฉลี่ยเลื่อน 12 เดือน"
                  : "อัตราการมีเลขซ้ำรายเดือน",
              ];
            }}
          />
          <Line
            type="monotone"
            dataKey="ratePercent"
            stroke="#a5b4fc"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="rollingRatePercent"
            stroke="#4f46e5"
            strokeWidth={2.5}
            dot={false}
            connectNulls
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
