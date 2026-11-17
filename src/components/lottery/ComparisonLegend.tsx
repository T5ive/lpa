import { ArrowLeftRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const LEGEND_ITEMS = [
  {
    // swatch เขียว
    swatch: "border-emerald-300 bg-emerald-100 dark:border-emerald-500/50 dark:bg-emerald-500/15",
    icon: <ArrowLeftRight className="size-3 text-emerald-700 dark:text-emerald-300" aria-hidden />,
    label: "ซ้ำกับงวดก่อน",
  },
  {
    swatch: "border-orange-300 bg-orange-100 dark:border-orange-500/50 dark:bg-orange-500/15",
    icon: <Sparkles className="size-3 text-orange-700 dark:text-orange-300" aria-hidden />,
    label: "ใหม่ในงวดล่าสุด",
  },
  {
    swatch: "border-indigo-200 bg-indigo-50 dark:border-indigo-500/40 dark:bg-indigo-500/15",
    icon: null,
    label: "ตัวเลขทั่วไป",
  },
  {
    swatch: "border-border bg-muted",
    icon: null,
    label: "ไม่ตรงกัน",
  },
] as const;

/** คำอธิบายสีและไอคอนของกระดานตัวเลข — ผู้ใช้ไม่ต้องเดาความหมายของสี */
export function ComparisonLegend({ className }: { className?: string }) {
  return (
    <ul
      className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground", className)}
      aria-label="คำอธิบายสีของตัวเลข"
    >
      {LEGEND_ITEMS.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            className={cn("inline-flex size-5 items-center justify-center rounded-md border", item.swatch)}
            aria-hidden
          >
            {item.icon}
          </span>
          {item.label}
        </li>
      ))}
    </ul>
  );
}
