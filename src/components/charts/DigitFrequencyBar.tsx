import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartCard } from "./ChartCard";
import type { DigitFrequencyMode, LotteryDraw } from "@/features/lottery/types/lottery";
import { calculateDigitFrequency } from "@/features/lottery/utils/statistics";

const MODE_LABELS: Record<DigitFrequencyMode, string> = {
  both: "รวมบน + ล่าง",
  up: "เฉพาะเลขบน",
  down: "เฉพาะเลขล่าง",
};

/** กราฟความถี่เลข 0–9 พร้อมสลับมุมมอง บน/ล่าง/รวม */
export function DigitFrequencyBar({ draws }: { draws: LotteryDraw[] }) {
  const [mode, setMode] = useState<DigitFrequencyMode>("both");
  const result = calculateDigitFrequency(draws, mode);
  const data = result.counts.map((count, digit) => ({
    digit: String(digit),
    count,
  }));

  return (
    <ChartCard
      title="ความถี่ของแต่ละเลข (0–9)"
      description={`นับจากทุกงวดในชุดข้อมูล โหมดปัจจุบัน: ${MODE_LABELS[mode]}`}
    >
      <div className="mb-3">
        <Tabs value={mode} onValueChange={(value) => setMode(value as DigitFrequencyMode)}>
          <TabsList>
            <TabsTrigger value="both">รวม</TabsTrigger>
            <TabsTrigger value="up">เลขบน</TabsTrigger>
            <TabsTrigger value="down">เลขล่าง</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
            <XAxis
              dataKey="digit"
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
              formatter={(value) => [`${value} ครั้ง`, `โหมด${MODE_LABELS[mode]}`]}
              labelFormatter={(label) => `เลข ${label}`}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[5, 5, 0, 0]} maxBarSize={40} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
