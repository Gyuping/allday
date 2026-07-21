// 고정 공휴일 (매년 같은 날짜) — API 실패 시 폴백용, 대체공휴일 자동 계산
// 설날·추석·부처님오신날 등 음력 기반 공휴일은 API에서만 가져옴
const FIXED_PUBLIC_HOLIDAYS: Array<{ mm: number; dd: number; name: string }> = [
  { mm: 1,  dd: 1,  name: '신정' },
  { mm: 3,  dd: 1,  name: '삼일절' },
  { mm: 5,  dd: 5,  name: '어린이날' },
  { mm: 6,  dd: 6,  name: '현충일' },
  { mm: 8,  dd: 15, name: '광복절' },
  { mm: 10, dd: 3,  name: '개천절' },
  { mm: 10, dd: 9,  name: '한글날' },
  { mm: 12, dd: 25, name: '크리스마스' },
]

function fmt(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function generateYearHolidays(year: number): Record<string, string> {
  const result: Record<string, string> = {}

  for (const { mm, dd, name } of FIXED_PUBLIC_HOLIDAYS) {
    result[fmt(year, mm, dd)] = name

    const dow = new Date(year, mm - 1, dd).getDay()
    if (dow === 6 || dow === 0) {
      const offset = dow === 6 ? 2 : 1
      const sub = new Date(year, mm - 1, dd + offset)
      const subStr = fmt(sub.getFullYear(), sub.getMonth() + 1, sub.getDate())
      if (!result[subStr]) result[subStr] = '대체공휴일'
    }
  }

  // 제헌절 — 국경일이지만 공휴일 아님, 대체공휴일 없음
  result[fmt(year, 7, 17)] = '제헌절'

  return result
}
