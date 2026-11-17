import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/** โครง placeholder ระหว่างโหลด */
export function LoadingState() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="กำลังโหลดข้อมูล">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
        <div className="hidden h-11 w-11 animate-pulse rounded-full bg-muted md:block" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

/** ข้อมูลเสียหาย — แสดงปัญหาทั้งหมดให้ dev แก้ lottery-results.json ได้ตรงจุด */
export function ErrorState({ issues, onRetry }: { issues: string[]; onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>ข้อมูลผลหวยไม่ถูกต้อง — ไม่สามารถวิเคราะห์ได้</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          พบปัญหาในไฟล์{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">src/data/lottery-results.json</code>{" "}
          โปรดแก้ไขตามรายการต่อไปนี้:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed">
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
          <RefreshCw className="size-3.5" />
          ลองโหลดใหม่
        </Button>
      </AlertDescription>
    </Alert>
  );
}

/** ไม่มีข้อมูลในชุดข้อมูล */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
      <Inbox className="size-10 text-muted-foreground" aria-hidden />
      <p className="font-semibold">ยังไม่มีข้อมูลผลหวย</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        เพิ่มผลหวยได้โดยแก้ไฟล์{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">src/data/lottery-results.json</code>{" "}
        แล้วรีเฟรชหน้าเว็บ
      </p>
    </div>
  );
}
