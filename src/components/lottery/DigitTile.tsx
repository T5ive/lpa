import { ArrowLeftRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Digit } from "@/features/lottery/types/lottery";

export type DigitTileVariant = "neutral" | "repeat" | "new" | "muted";
export type DigitTileSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<DigitTileVariant, string> = {
  // ฟ้า = ตัวเลขทั่วไป
  neutral:
    "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-200",
  // เขียว = ซ้ำกับงวดก่อน
  repeat:
    "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/15 dark:text-emerald-300",
  // ส้ม = ตัวเลขใหม่ในงวดล่าสุด
  new: "border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-500/50 dark:bg-orange-500/15 dark:text-orange-300",
  // เทา = ไม่ตรง
  muted: "border-border bg-muted text-muted-foreground",
};

const SIZE_CLASSES: Record<DigitTileSize, string> = {
  sm: "h-9 w-8 rounded-lg text-lg",
  md: "h-14 w-12 rounded-xl text-2xl",
  lg: "h-16 w-14 rounded-xl text-3xl",
};

const VARIANT_ARIA: Record<DigitTileVariant, string> = {
  neutral: "ตัวเลขทั่วไป",
  repeat: "ตัวเลขซ้ำกับงวดก่อน",
  new: "ตัวเลขใหม่ในงวดนี้",
  muted: "ตัวเลขที่ไม่ตรงกับงวดก่อน",
};

interface DigitTileProps {
  digit: Digit;
  variant?: DigitTileVariant;
  size?: DigitTileSize;
  /** แสดงไอคอนกำกับความหมาย (เขียว = ลูกศรวน, ส้ม = ประกายใหม่) */
  withIcon?: boolean;
  className?: string;
}

/** กระดานตัวเลขขนาดใหญ่ อ่านง่าย — สีมาพร้อมไอคอน/ป้ายเสมอ ไม่ใช้สีบอกความหมายเพียงอย่างเดียว */
export function DigitTile({
  digit,
  variant = "neutral",
  size = "md",
  withIcon = false,
  className,
}: DigitTileProps) {
  const icon =
    variant === "repeat" ? (
      <ArrowLeftRight className="size-3" aria-hidden />
    ) : variant === "new" ? (
      <Sparkles className="size-3" aria-hidden />
    ) : null;

  return (
    <span
      className={cn(
        "relative inline-flex select-none items-center justify-center border font-semibold tabular-nums shadow-sm",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      title={VARIANT_ARIA[variant]}
    >
      {digit}
      {withIcon && icon ? (
        <span className="absolute right-0.5 top-0.5" aria-hidden>
          {icon}
        </span>
      ) : null}
    </span>
  );
}
