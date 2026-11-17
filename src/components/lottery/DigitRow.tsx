import { cn } from "@/lib/utils";
import type { Digit } from "@/features/lottery/types/lottery";
import {
  DigitTile,
  type DigitTileSize,
  type DigitTileVariant,
} from "./DigitTile";

interface DigitRowProps {
  digits: Digit[];
  /** กำหนด variant รายหลัก (เช่น ไฮไลต์เลขซ้ำเป็นสีเขียว) — ถ้าไม่ส่งใช้ variant เดียวทั้งแถว */
  variants?: DigitTileVariant[];
  variant?: DigitTileVariant;
  size?: DigitTileSize;
  withIcon?: boolean;
  className?: string;
}

/** แถวกระดานตัวเลข อ่านเป็นลำดับ */
export function DigitRow({
  digits,
  variants,
  variant = "neutral",
  size = "md",
  withIcon = false,
  className,
}: DigitRowProps) {
  if (digits.length === 0) {
    return <span className={cn("text-sm text-muted-foreground", className)}>—</span>;
  }
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)} role="img" aria-label={`ตัวเลข ${digits.join(" ")}`}>
      {digits.map((digit, index) => (
        <DigitTile
          key={`${digit}-${index}`}
          digit={digit}
          variant={variants?.[index] ?? variant}
          size={size}
          withIcon={withIcon}
        />
      ))}
    </div>
  );
}

/** เลขชิปขนาดจิ๋วสำหรับตาราง (ไม่ใช้สีพิเศษ) */
export function DigitChips({
  digits,
  variant = "neutral",
  className,
}: {
  digits: Digit[];
  variant?: DigitTileVariant;
  className?: string;
}) {
  if (digits.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return (
    <span className={cn("inline-flex flex-wrap gap-1", className)}>
      {digits.map((digit, index) => (
        <span
          key={`${digit}-${index}`}
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-md border text-sm font-semibold tabular-nums",
            VARIANT_MINI[variant],
          )}
        >
          {digit}
        </span>
      ))}
    </span>
  );
}

const VARIANT_MINI: Record<DigitTileVariant, string> = {
  neutral:
    "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-200",
  repeat:
    "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/15 dark:text-emerald-300",
  new: "border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-500/50 dark:bg-orange-500/15 dark:text-orange-300",
  muted: "border-border bg-muted text-muted-foreground",
};
