const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
] as const;

const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
] as const;

interface IsoParts {
  year: number;
  month: number;
  day: number;
}

/** แยก ISO yyyy-MM-dd ด้วย string เท่านั้น — ไม่ผ่าน Date เพื่อเลี่ยงปัญหา timezone */
function parseIso(iso: string): IsoParts {
  const [year, month, day] = iso.split("-").map((part) => Number(part));
  return { year, month, day };
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** วันที่ ISO → "16 พฤศจิกายน 2569" (พ.ศ.) โหมดย่อ → "16 พ.ย. 69" */
export function formatThaiDate(iso: string, shortMonth = false): string {
  const { year, month, day } = parseIso(iso);
  const monthName = shortMonth ? THAI_MONTHS_SHORT[month - 1] : THAI_MONTHS[month - 1];
  const beYear = shortMonth ? String(year + 543).slice(-2) : String(year + 543);
  return `${day} ${monthName} ${beYear}`;
}

/** yyyy-MM → "พ.ย. 69" สำหรับแกนกราฟ */
export function formatThaiMonthKey(key: string): string {
  const [year, month] = key.split("-");
  const beYear = Number(year) + 543;
  return `${THAI_MONTHS_SHORT[Number(month) - 1]} ${String(beYear).slice(-2)}`;
}

/** ปี พ.ศ. จาก ISO เช่น "2026-11-16" → 2569 */
export function formatThaiYear(iso: string): number {
  return parseIso(iso).year + 543;
}

/** ปี ค.ศ. จาก ISO สำหรับใช้เป็น key ของ filter */
export function getCeYear(iso: string): number {
  return parseIso(iso).year;
}

/**
 * วันที่งวดถัดไปตามปฏิทินปกติ (งวดออกวันที่ 1 และ 16 ของทุกเดือน)
 * หมายเหตุ: ทางการอาจเลื่อนวันออกหวยในบางงวด — ค่านี้เป็นการประมาณตามกติกาปกติ
 */
export function getNextDrawDate(latestIso: string): string {
  const { year, month, day } = parseIso(latestIso);
  if (day < 16) {
    return `${year}-${pad2(month)}-16`;
  }
  if (month === 12) {
    return `${year + 1}-01-01`;
  }
  return `${year}-${pad2(month + 1)}-01`;
}
