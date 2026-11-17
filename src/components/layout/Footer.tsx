import { AlertTriangle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/70 py-8">
      <div className="mx-auto max-w-6xl space-y-3 px-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
          <p>
            เว็บนี้เป็น<strong>เครื่องมือวิเคราะห์ข้อมูลย้อนหลัง</strong>เพื่อความบันเทิงและการเรียนรู้เท่านั้น
            ไม่ใช่เครื่องมือรับประกันหรือทำนายผลหวย ผลสลากกินแบ่งรัฐบาลออกแบบสุ่ม
            โปรดใช้วิจารณญาณและเล่นอย่างมีความรับผิดชอบ
          </p>
        </div>
        <p className="text-xs">
          ข้อมูลผลหวยย้อนหลังรวบรวมจาก myhora.com และตรวจสอบข้ามแหล่งกับ sanook.com ·
          จัดการข้อมูลทั้งหมดผ่านไฟล์ <code className="rounded bg-muted px-1 py-0.5">src/data/lottery-results.json</code>
        </p>
      </div>
    </footer>
  );
}
