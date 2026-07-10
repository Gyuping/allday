// 음력 기반 공휴일 — 매년 양력 날짜가 바뀌므로 API 없을 때 쓸 폴백만 유지
// 새 연도가 가까워지면 여기에 추가할 것
const LUNAR_HOLIDAYS: Record<number, Record<string, string>> = {
  2026: {
    '2026-02-16': '설날 전날',
    '2026-02-17': '설날',
    '2026-02-18': '설날 연휴',
    '2026-05-24': '부처님오신날',
    '2026-05-25': '대체공휴일',
    '2026-09-30': '추석 전날',
    '2026-10-01': '추석',
    '2026-10-02': '추석 연휴',
  },
}

// 고정 공휴일 (매년 같은 날짜) — 대체공휴일은 연도별로 자동 계산
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

// 연도를 받아 고정 공휴일 + 대체공휴일 + 음력 폴백을 합쳐 반환
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

  // 제헌절 — 국경일이지만 공휴일 아님 → 대체공휴일 없음
  result[fmt(year, 7, 17)] = '제헌절'

  // 음력 공휴일 (알려진 연도만 — 없으면 API에서 가져옴)
  Object.assign(result, LUNAR_HOLIDAYS[year] ?? {})

  return result
}
