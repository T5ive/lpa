import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import type { Digit, LotteryDraw } from "@/features/lottery/types/lottery";
import { extractDigits, getDrawDigitSet, getUpperDigits } from "@/features/lottery/utils/digits";
import { formatThaiDate } from "@/features/lottery/utils/thaiDate";
import { cn } from "@/lib/utils";
import type { DigitTileVariant } from "./DigitTile";
import { DigitRow } from "./DigitRow";

interface DrawCardProps {
  draw: LotteryDraw;
  label: string;
  labelClassName?: string;
  /** ฟังก์ชันกำหนดสีของแต่ละหลัก (ไฮไลต์เลขซ้ำ/เลขใหม่) */
  variantFor: (digit: Digit) => DigitTileVariant;
  className?: string;
}

/** การ์ดผลหวยรายงวด: รางวัลที่ 1, เลขบน, เลขล่าง และชุดเลขเด่น */
export function DrawCard({ draw, label, labelClassName, variantFor, className }: DrawCardProps) {
  const upper = extractDigits(getUpperDigits(draw));
  const lower = extractDigits(draw.lastTwoDigits);
  const digitSet = getDrawDigitSet(draw);
  const firstPrize = extractDigits(draw.firstPrize);

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader className="gap-2 pb-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className={labelClassName}>
            {label}
          </Badge>
          <time dateTime={draw.date} className="text-sm font-medium text-muted-foreground">
            {formatThaiDate(draw.date)}
          </time>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">รางวัลที่ 1</p>
          <DigitRow digits={firstPrize} variant="muted" size="sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">เลข 2 ตัวบน</p>
            <DigitRow digits={upper} variants={upper.map(variantFor)} size="md" withIcon />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">เลข 2 ตัวล่าง</p>
            <DigitRow digits={lower} variants={lower.map(variantFor)} size="md" withIcon />
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            ชุดเลขเด่น (บน + ล่าง ตัดซ้ำ)
          </p>
          <DigitRow digits={digitSet} variants={digitSet.map(variantFor)} size="sm" />
        </div>
      </CardContent>
    </Card>
  );
}
