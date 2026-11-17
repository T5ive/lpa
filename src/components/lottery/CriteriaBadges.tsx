import { CheckCircle2, XCircle } from "lucide-react";
import type { DrawComparison } from "@/features/lottery/types/lottery";
import { cn } from "@/lib/utils";

interface CriteriaBadgeProps {
  label: string;
  hint: string;
  active: boolean;
}

/** ป้ายเกณฑ์แยกทีละข้อ — ติ๊ก/กากบาทพร้อมข้อความ ไม่ใช้สีเพียงอย่างเดียว */
function CriteriaBadge({ label, hint, active }: CriteriaBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        active
          ? "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "border-border bg-muted text-muted-foreground",
      )}
      title={hint}
    >
      {active ? (
        <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
      ) : (
        <XCircle className="size-3.5 shrink-0" aria-hidden />
      )}
      {label}
      <span className="sr-only">{active ? "ตรง" : "ไม่ตรง"}</span>
    </span>
  );
}

/**
 * เกณฑ์การเปรียบเทียบทั้ง 4 ข้อ แสดงแยกกันเสมอ (ห้ามรวมเป็นอัตราเดียว)
 * 1) มีเลขซ้ำอย่างน้อย 1 หลัก 2) บนตรง 2 หลัก 3) ล่างตรง 2 หลัก 4) ตรงตามตำแหน่งจริง
 */
export function CriteriaBadges({
  comparison,
  className,
}: {
  comparison: DrawComparison;
  className?: string;
}) {
  if (!comparison.previous) return null;
  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      aria-label="เกณฑ์การเปรียบเทียบทั้ง 4 ข้อ"
    >
      <CriteriaBadge
        label="มีเลขซ้ำ ≥ 1 หลัก"
        hint="มีตัวเลขร่วมกันระหว่างชุดเลขเด่นสองงวดอย่างน้อยหนึ่งตัว"
        active={comparison.hasCommon}
      />
      <CriteriaBadge
        label={`บนตรงทั้ง 2 หลัก (${comparison.previousUpper} → ${comparison.currentUpper})`}
        hint="เลข 2 ตัวบนของทั้งสองงวดตรงกันทุกหลัก"
        active={comparison.upperExactMatch}
      />
      <CriteriaBadge
        label={`ล่างตรงทั้ง 2 หลัก (${comparison.previousLower} → ${comparison.currentLower})`}
        hint="เลข 2 ตัวล่างของทั้งสองงวดตรงกันทุกหลัก"
        active={comparison.lowerExactMatch}
      />
      <CriteriaBadge
        label="ทาย 2 ตัวถูกตามตำแหน่งจริง"
        hint="ใช้เลขบนหรือล่างของงวดก่อนเป็นคำทายแล้วถูกต้องทั้งสองหลัก"
        active={comparison.positionMatch}
      />
    </div>
  );
}
