import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatThaiYear } from "../utils/thaiDate";

export type HistoryStatusFilter = "all" | "with" | "without";

export interface HistoryFilterState {
  /** ปี ค.ศ. ของงวด หรือ "all" */
  year: number | "all";
  status: HistoryStatusFilter;
  search: string;
}

interface HistoryToolbarProps {
  /** แถวทั้งหมดก่อนกรอง — ใช้หาปีที่มีในข้อมูล */
  rows: { draw: { date: string } }[];
  filters: HistoryFilterState;
  onChange: (filters: HistoryFilterState) => void;
}

/** แถบเครื่องมือ: filter ตามปี, filter มี/ไม่มีเลขซ้ำ และช่องค้นหา */
export function HistoryToolbar({ rows, filters, onChange }: HistoryToolbarProps) {
  const years = [...new Set(rows.map((row) => Number(row.draw.date.slice(0, 4))))].sort(
    (a, b) => b - a,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filters.year === "all" ? "all" : String(filters.year)}
        onValueChange={(value) =>
          onChange({ ...filters, year: value === "all" ? "all" : Number(value) })
        }
      >
        <SelectTrigger className="w-[150px]" aria-label="กรองตามปี">
          <SelectValue placeholder="ทุกปี" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทุกปี</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={String(year)}>
              ปี {formatThaiYear(`${year}-01-01`)} (พ.ศ.)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) =>
          onChange({ ...filters, status: value as HistoryStatusFilter })
        }
      >
        <SelectTrigger className="w-[180px]" aria-label="กรองตามสถานะเลขซ้ำ">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทุกงวด</SelectItem>
          <SelectItem value="with">เฉพาะงวดที่มีเลขซ้ำ</SelectItem>
          <SelectItem value="without">เฉพาะงวดที่ไม่มีเลขซ้ำ</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="ค้นหาวันที่ เลขบน ล่าง หรือเลขซ้ำ…"
          className="pl-8"
          aria-label="ค้นหาในตาราง"
        />
      </div>
    </div>
  );
}
