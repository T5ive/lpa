import { useState } from "react";
import { Calculator, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

/** จุด 10 ตัวแทนเลข 0–9 — เขียว = อยู่ในชุดเลขเด่น k ตัว */
function DigitDots({ setSize }: { setSize: number }) {
  return (
    <div className="flex flex-wrap gap-1.5" aria-hidden>
      {Array.from({ length: 10 }, (_, digit) => (
        <span
          key={digit}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-lg border text-sm font-semibold tabular-nums",
            digit < setSize
              ? "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/15 dark:text-emerald-300"
              : "border-border bg-muted text-muted-foreground",
          )}
        >
          {digit}
        </span>
      ))}
    </div>
  );
}

/**
 * "เลขซ้ำเกิดขึ้นได้บ่อยแค่ไหน?" — ตัวอย่างความน่าจะเป็นแบบ interactive
 * สมมติฐาน: แต่ละหลักสุ่มอิสระ ทุกค่า 0–9 มีโอกาสเท่ากัน
 * P(อย่างน้อย 1 หลักตรงชุดเลข k ตัว) = 1 − ((10−k)/10)²
 */
export function ProbabilitySection({
  realRatePercent,
  realPairsLabel,
}: {
  /** อัตราจากข้อมูลจริงในชุดข้อมูลปัจจุบัน (เทียบให้เห็นความต่างของ "สมมติฐาน" กับ "ของจริง") */
  realRatePercent: number;
  realPairsLabel: string;
}) {
  const [setSize, setSetSize] = useState(4);
  const missNumerator = 10 - setSize;
  const missPerDigit = missNumerator / 10;
  const missBoth = missPerDigit * missPerDigit;
  const hitPercent = Math.round((1 - missBoth) * 1000) / 10;
  const missPercent = Math.round(missBoth * 1000) / 10;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="size-5 text-primary" aria-hidden />
          เลขซ้ำเกิดขึ้นได้บ่อยแค่ไหน?
        </CardTitle>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ลองเลื่อนขนาดชุดเลขเด่น แล้วดูว่าถ้าสุ่มเลข 2 หลักอย่างอิสระ
          โอกาสที่<strong className="text-foreground">อย่างน้อยหนึ่งหลัก</strong>จะตรงกับชุดเลขเป็นเท่าไร
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <DigitDots setSize={setSize} />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">ขนาดชุดเลขเด่น</span>
            <span className="font-bold tabular-nums">{setSize} ตัวจาก 10 ตัว</span>
          </div>
          <Slider
            value={[setSize]}
            min={0}
            max={10}
            step={1}
            onValueChange={(values) => {
              const next = values[0];
              if (typeof next === "number") setSetSize(next);
            }}
            aria-label="ขนาดชุดเลขเด่น"
          />
        </div>

        <div className="rounded-lg border border-border/70 bg-muted/50 p-4 text-sm leading-relaxed">
          <p className="font-semibold">
            โอกาสที่อย่างน้อยหนึ่งหลักตรงกับชุดเลข ={" "}
            <span className="text-xl font-bold tabular-nums text-primary">{hitPercent}%</span>
          </p>
          <p className="mt-2 text-muted-foreground">
            คิดจากด้านตรงข้าม: โอกาสที่หนึ่งหลัก<span>ไม่</span>ตรงชุดเลข = {missNumerator}/10 ต่อหลัก →
            ทั้งสองหลักไม่ตรง = ({missNumerator}/10)² = {missPercent}% →
            อย่างน้อยหนึ่งหลักตรง = 100 − {missPercent}% = {hitPercent}%
          </p>
          <p className="mt-2 rounded-md bg-background p-2 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">ต้องเข้าใจตรงกันว่า:</strong> นี่เป็นตัวอย่างทางคณิตศาสตร์
            ภายใต้สมมติฐานที่ว่าแต่ละหลักสุ่มอิสระและมีโอกาสเท่ากันทุกค่า
            ไม่ใช่ความน่าจะเป็นตายตัวของทุกงวด และไม่เกี่ยวกับการถูกรางวัล
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-border/70 p-3 text-sm leading-relaxed">
          <Scale className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p>
            เทียบกับข้อมูลจริงในชุดข้อมูลนี้: คู่งวดที่มีเลขซ้ำอย่างน้อย 1 ตัว คิดเป็น{" "}
            <strong className="text-foreground tabular-nums">{realRatePercent}%</strong> ({realPairsLabel})
            ซึ่งเป็นการนับจากของจริง อาจต่างจากตัวอย่างสมมติข้างบนได้
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
