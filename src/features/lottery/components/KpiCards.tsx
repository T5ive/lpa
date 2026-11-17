import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { HistoricalStatistics } from "../types/lottery";

interface KpiDefinition {
  title: string;
  value: string;
  hint: string;
}

function buildKpiDefinitions(stats: HistoricalStatistics): KpiDefinition[] {
  return [
    {
      title: "งวดที่วิเคราะห์",
      value: String(stats.totalDraws),
      hint: "จำนวนงวดผลหวยทั้งหมดที่มีในชุดข้อมูลปัจจุบัน",
    },
    {
      title: "คู่งวดที่มีเลขซ้ำ",
      value: String(stats.pairsWithCommon),
      hint: "จำนวนคู่ของงวดติดกัน (งวดก่อน → งวดหลัง) ที่มีตัวเลขร่วมกันอย่างน้อยหนึ่งตัว",
    },
    {
      title: "คู่งวดที่ไม่มีเลขซ้ำ",
      value: String(stats.pairsWithoutCommon),
      hint: "จำนวนคู่ของงวดติดกันที่ชุดเลขเด่นไม่มีตัวเลขใดตรงกันเลย",
    },
    {
      title: "อัตราการมีเลขซ้ำ",
      value: `${stats.repeatRatePercent}%`,
      hint: "หมายถึงสัดส่วนคู่ของงวดที่มีตัวเลขร่วมกันอย่างน้อยหนึ่งตัว ไม่ใช่อัตราการถูกรางวัล",
    },
    {
      title: "ค่าเฉลี่ยเลขซ้ำต่อคู่",
      value: String(stats.averageCommonCount),
      hint: "จำนวนเลขที่ซ้ำกันโดยเฉลี่ยเมื่อเทียบงวดติดกันทุกคู่ในชุดข้อมูล",
    },
  ];
}

/** KPI สรุปภาพรวม — ทุกใบมี Tooltip อธิบายความหมาย */
export function KpiCards({ statistics }: { statistics: HistoricalStatistics }) {
  const kpis = buildKpiDefinitions(statistics);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardContent className="space-y-1 px-4 py-4">
            <div className="flex items-start justify-between gap-1">
              <p className="text-xs font-medium leading-snug text-muted-foreground">
                {kpi.title}
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={`ความหมายของ ${kpi.title}`}
                  >
                    <Info className="size-3.5" aria-hidden />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-56 text-xs leading-relaxed">
                  {kpi.hint}
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold tabular-nums">{kpi.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
