import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DrawComparison, LotteryDraw } from "../types/lottery";
import { buildDrawPairs, compareDraws } from "../utils/compare";
import { getDrawDigitSet } from "../utils/digits";
import { formatThaiDate } from "../utils/thaiDate";
import { DigitChips } from "@/components/lottery/DigitRow";
import { cn } from "@/lib/utils";
import { HistoryToolbar, type HistoryFilterState } from "./HistoryToolbar";

export interface HistoryRow {
  draw: LotteryDraw;
  comparison: DrawComparison;
  digitSet: ReturnType<typeof getDrawDigitSet>;
}

function statusOf(comparison: DrawComparison): { label: string; className: string } {
  if (comparison.commonCount >= 2) {
    return {
      label: `ซ้ำ ${comparison.commonCount} ตัว`,
      className:
        "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/15 dark:text-emerald-300",
    };
  }
  if (comparison.commonCount === 1) {
    return {
      label: "ซ้ำ 1 ตัว",
      className:
        "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-500/50 dark:bg-amber-500/15 dark:text-amber-300",
    };
  }
  return {
    label: "ไม่พบเลขซ้ำ",
    className: "border-border bg-muted text-muted-foreground",
  };
}

type SortKey = "date" | "commonCount";
interface SortState {
  key: SortKey;
  dir: "asc" | "desc";
}

const PAGE_SIZE = 10;

function buildRows(draws: LotteryDraw[]): HistoryRow[] {
  return buildDrawPairs(draws).map((pair) => ({
    draw: pair.current,
    comparison: compareDraws(pair.current, pair.previous),
    digitSet: getDrawDigitSet(pair.current),
  }));
}

/** ตารางวิเคราะห์ย้อนหลัง + filter/search/sort/pagination + mobile card view */
export function HistoryTable({
  draws,
  onSelectRow,
}: {
  draws: LotteryDraw[];
  onSelectRow: (draw: LotteryDraw) => void;
}) {
  const [filters, setFilters] = useState<HistoryFilterState>({
    year: "all",
    status: "all",
    search: "",
  });
  const [sort, setSort] = useState<SortState>({ key: "date", dir: "desc" });
  const [page, setPage] = useState(0);

  const allRows = useMemo(() => buildRows(draws), [draws]);

  const filteredRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return allRows.filter((row) => {
      const ceYear = Number(row.draw.date.slice(0, 4));
      if (filters.year !== "all" && ceYear !== filters.year) return false;
      if (filters.status === "with" && !row.comparison.hasCommon) return false;
      if (filters.status === "without" && row.comparison.hasCommon) return false;
      if (query) {
        const haystack = [
          row.draw.date,
          formatThaiDate(row.draw.date),
          row.comparison.currentUpper,
          row.comparison.currentLower,
          row.comparison.currentDigits.join(""),
          row.comparison.commonDigits.join(""),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [allRows, filters]);

  const sortedRows = useMemo(() => {
    const rows = [...filteredRows];
    const direction = sort.dir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      if (sort.key === "date") return a.draw.date.localeCompare(b.draw.date) * direction;
      return (a.comparison.commonCount - b.comparison.commonCount) * direction;
    });
    return rows;
  }, [filteredRows, sort]);

  const maxPage = Math.max(0, Math.ceil(sortedRows.length / PAGE_SIZE) - 1);
  const safePage = Math.min(page, maxPage);
  const pageRows = sortedRows.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "date" ? "desc" : "asc" },
    );
    setPage(0);
  };

  const handleFiltersChange = (next: HistoryFilterState) => {
    setFilters(next);
    setPage(0);
  };

  const sortIcon = (key: SortKey) =>
    sort.key !== key ? (
      <ArrowUpDown className="size-3.5 opacity-50" aria-hidden />
    ) : sort.dir === "asc" ? (
      <ArrowUp className="size-3.5" aria-hidden />
    ) : (
      <ArrowDown className="size-3.5" aria-hidden />
    );

  if (allRows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        ต้องมีงวดอย่างน้อย 2 งวดจึงจะเปรียบเทียบได้
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <HistoryToolbar rows={allRows} filters={filters} onChange={handleFiltersChange} />

      {sortedRows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          ไม่พบงวดที่ตรงกับเงื่อนไขที่กรอง — ลองล้างตัวกรองหรือเปลี่ยนคำค้นหา
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 font-medium"
                      onClick={() => toggleSort("date")}
                    >
                      วันที่งวด {sortIcon("date")}
                    </button>
                  </TableHead>
                  <TableHead>เลขบน</TableHead>
                  <TableHead>เลขล่าง</TableHead>
                  <TableHead>ชุดเลขเด่น</TableHead>
                  <TableHead>เลขที่ซ้ำกับงวดก่อน</TableHead>
                  <TableHead>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 font-medium"
                      onClick={() => toggleSort("commonCount")}
                    >
                      จำนวนเลขซ้ำ {sortIcon("commonCount")}
                    </button>
                  </TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((row) => {
                  const status = statusOf(row.comparison);
                  return (
                    <TableRow
                      key={row.draw.date}
                      onClick={() => onSelectRow(row.draw)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatThaiDate(row.draw.date)}
                      </TableCell>
                      <TableCell className="tabular-nums">{row.comparison.currentUpper}</TableCell>
                      <TableCell className="tabular-nums">{row.comparison.currentLower}</TableCell>
                      <TableCell>
                        <DigitChips digits={row.digitSet} variant="neutral" />
                      </TableCell>
                      <TableCell>
                        <DigitChips digits={row.comparison.commonDigits} variant="repeat" />
                      </TableCell>
                      <TableCell className="font-semibold tabular-nums">
                        {row.comparison.commonCount}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-medium", status.className)}>
                          {status.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card view */}
          <ul className="space-y-3 md:hidden">
            {pageRows.map((row) => {
              const status = statusOf(row.comparison);
              return (
                <li key={row.draw.date}>
                  <button
                    type="button"
                    onClick={() => onSelectRow(row.draw)}
                    className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-accent/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{formatThaiDate(row.draw.date)}</span>
                      <Badge variant="outline" className={cn("font-medium", status.className)}>
                        {status.label}
                      </Badge>
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">เลขบน / ล่าง</dt>
                        <dd className="font-semibold tabular-nums">
                          {row.comparison.currentUpper} / {row.comparison.currentLower}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">จำนวนเลขซ้ำ</dt>
                        <dd className="font-semibold tabular-nums">{row.comparison.commonCount}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">ชุดเลขเด่น</dt>
                        <dd>
                          <DigitChips digits={row.digitSet} variant="neutral" />
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">เลขที่ซ้ำ</dt>
                        <dd>
                          <DigitChips digits={row.comparison.commonDigits} variant="repeat" />
                        </dd>
                      </div>
                    </dl>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs text-muted-foreground">
              แสดง {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, sortedRows.length)}{" "}
              จาก {sortedRows.length} งวด
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
              >
                ก่อนหน้า
              </Button>
              <span className="text-xs tabular-nums text-muted-foreground">
                หน้า {safePage + 1}/{maxPage + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= maxPage}
                onClick={() => setPage(safePage + 1)}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
