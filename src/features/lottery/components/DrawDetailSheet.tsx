import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ComparisonHero } from "@/components/lottery/ComparisonHero";
import { ResultSummaryCard } from "@/components/lottery/ResultSummaryCard";
import type { DrawComparison } from "../types/lottery";

/** รายละเอียดการเปรียบเทียบของหนึ่งงวด เปิดจากการคลิกแถวในตาราง */
export function DrawDetailSheet({
  comparison,
  open,
  onOpenChange,
}: {
  comparison: DrawComparison | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>รายละเอียดการเปรียบเทียบ</SheetTitle>
          <SheetDescription>
            เปรียบเทียบงวดที่เลือกกับงวดก่อนหน้าทีละเกณฑ์
          </SheetDescription>
        </SheetHeader>
        {comparison ? (
          <div className="space-y-4 px-4 pb-8">
            <ComparisonHero comparison={comparison} />
            <Separator />
            <ResultSummaryCard comparison={comparison} />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
