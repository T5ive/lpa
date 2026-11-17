import { ArrowDown, ArrowRight } from "lucide-react";
import type { Digit, DrawComparison } from "@/features/lottery/types/lottery";
import { DrawCard } from "./DrawCard";
import type { DigitTileVariant } from "./DigitTile";

/** สีเลขของงวดก่อน: ซ้ำ = เขียว ที่เหลือ = เทา */
function previousVariant(comparison: DrawComparison) {
  return (digit: Digit): DigitTileVariant =>
    comparison.commonDigits.includes(digit) ? "repeat" : "muted";
}

/** สีเลขของงวดล่าสุด: ซ้ำ = เขียว ใหม่ = ส้ม ที่เหลือ = ฟ้า */
function currentVariant(comparison: DrawComparison) {
  return (digit: Digit): DigitTileVariant => {
    if (comparison.commonDigits.includes(digit)) return "repeat";
    if (comparison.onlyInCurrent.includes(digit)) return "new";
    return "neutral";
  };
}

/** ส่วนเปรียบเทียบหลัก: การ์ดงวดก่อน ↔ งวดล่าสุด พร้อมลูกศร */
export function ComparisonHero({ comparison }: { comparison: DrawComparison }) {
  if (!comparison.previous) {
    return (
      <div className="mx-auto max-w-md">
        <DrawCard
          draw={comparison.current}
          label="งวดที่เลือก"
          variantFor={currentVariant(comparison)}
        />
        <p className="mt-3 text-center text-sm text-muted-foreground">
          งวดนี้เป็นงวดเก่าสุดในชุดข้อมูล จึงไม่มีงวดก่อนหน้าให้เปรียบเทียบ
        </p>
      </div>
    );
  }

  return (
    <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
      <DrawCard
        draw={comparison.previous}
        label="งวดก่อน"
        variantFor={previousVariant(comparison)}
      />
      <div className="flex items-center justify-center" aria-hidden>
        <div className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm">
          <ArrowRight className="hidden size-5 md:block" />
          <ArrowDown className="size-5 md:hidden" />
        </div>
      </div>
      <DrawCard
        draw={comparison.current}
        label="งวดล่าสุด"
        labelClassName="bg-primary/10 text-primary dark:text-primary-foreground"
        variantFor={currentVariant(comparison)}
      />
    </div>
  );
}
