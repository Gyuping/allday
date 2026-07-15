// 'YYYY-MM-DD' 문자열 분해. month는 1~12 (Date의 0~11과 다름)
export function parseDateStr(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number)
  return { year, month, day }
}

// month는 0~11 (Date 기준), 내부에서 +1 처리
export function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function todayStr(): string {
  const t = new Date()
  return toDateStr(t.getFullYear(), t.getMonth(), t.getDate())
}

export function todayKST(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
}

// start > end여도 자동으로 순서를 바로잡아 처리한다.
export function getDateRange(start: string, end: string): string[] {
  const s = dateFromStr(start)
  const e = dateFromStr(end)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return []
  const [from, to] = s <= e ? [s, e] : [e, s]
  const dates: string[] = []
  // getTime() 비교로 부동소수점 오차 방지, 최대 365일 제한으로 무한루프 방어
  const limit = 365
  let count = 0
  const d = new Date(from)
  while (d.getTime() <= to.getTime() && count < limit) {
    dates.push(toDateStr(d.getFullYear(), d.getMonth(), d.getDate()))
    d.setDate(d.getDate() + 1)
    count++
  }
  return dates
}

// 'YYYY-MM-DD' 문자열을 Date 객체로 변환 (Safari 안전 — new Date(string) 직접 사용 금지)
export function dateFromStr(dateStr: string): Date {
  const { year, month, day } = parseDateStr(dateStr)
  return new Date(year, month - 1, day)
}

export function getEventsForDate<T extends { date: string; endDate?: string }>(
  events: T[],
  dateStr: string
): T[] {
  return events.filter((e) =>
    e.endDate ? e.date <= dateStr && dateStr <= e.endDate : e.date === dateStr
  )
}

export function formatDateLabel(dateStr: string): string {
  const { year, month, day } = parseDateStr(dateStr)
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][new Date(year, month - 1, day).getDay()]
  return `${month}월 ${day}일 (${weekday})`
}
