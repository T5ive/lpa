import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { LotteryDraw } from "../types/lottery";
import { getNextDraw, getPreviousDraw, sortDrawsDesc } from "../utils/compare";
import { getCeYear, formatThaiDate } from "../utils/thaiDate";
import { getUpperDigits } from "../utils/digits";

interface DrawSelectorProps {
  /** งวดทั้งหมด (ลำดับใดก็ได้ จะเรียงให้เอง) */
  draws: LotteryDraw[];
  /** วันที่ ISO ของงวดที่เลือกอยู่ */
  value: string;
  onChange: (date: string) => void;
  ariaLabel?: string;
}

/**
 * เลือกงวด 2 ชั้น: ปี พ.ศ. แล้วตามด้วยงวดในปีนั้น — จำเป็นเมื่อข้อมูลมีหลายร้อยงวด
 * (dropdown ที่เรนเดอร์ทุกงวดพร้อมกันจะหนักมาก) พร้อมปุ่มก่อนหน้า/ถัดไปเดินทีละงวด
 */
export function DrawSelector({ draws, value, onChange, ariaLabel = "เลือกงวด" }: DrawSelectorProps) {
  const sorted = sortDrawsDesc(draws);
  const selected = sorted.find((draw) => draw.date === value);
  const previous = selected ? getPreviousDraw(draws, selected) : null;
  const next = selected ? getNextDraw(draws, selected) : null;

  const yearsDesc = [...new Set(sorted.map((draw) => getCeYear(draw.date)))].sort(
    (a, b) => b - a,
  );
  const selectedYear = selected ? getCeYear(selected.date) : yearsDesc[0];
  const drawsOfSelectedYear = sorted.filter((draw) => getCeYear(draw.date) === selectedYear);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="ย้อนไปงวดก่อนหน้า"
            disabled={!previous}
            onClick={() => previous && onChange(previous.date)}
          >
            <ChevronLeft className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {previous ? `งวดก่อนหน้า: ${formatThaiDate(previous.date)}` : "งวดนี้เป็นงวดเก่าสุดแล้ว"}
        </TooltipContent>
      </Tooltip>

      <Select
        value={selectedYear ? String(selectedYear) : undefined}
        onValueChange={(yearValue) => {
          const newestOfYear = sorted.find((draw) => getCeYear(draw.date) === Number(yearValue));
          if (newestOfYear) onChange(newestOfYear.date);
        }}
      >
        <SelectTrigger
          className="w-[122px] shrink-0"
          aria-label="เลือกปี"
        >
          <SelectValue placeholder="ปี" />
        </SelectTrigger>
        <SelectContent>
          {yearsDesc.map((year) => (
            <SelectItem key={year} value={String(year)}>
              พ.ศ. {year + 543}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="w-full min-w-0 flex-1 sm:w-[250px] sm:flex-none"
          aria-label={ariaLabel}
        >
          <SelectValue placeholder="เลือกงวด" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {drawsOfSelectedYear.map((draw) => (
            <SelectItem key={draw.date} value={draw.date}>
              {formatThaiDate(draw.date, true)} · บน {getUpperDigits(draw)} ล่าง {draw.lastTwoDigits}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="ไปงวดถัดไป"
            disabled={!next}
            onClick={() => next && onChange(next.date)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {next ? `งวดถัดไป: ${formatThaiDate(next.date)}` : "งวดนี้เป็นงวดใหม่สุดแล้ว"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
