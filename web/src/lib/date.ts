// 날짜 관련 유틸 함수 모음
// 앱 전체에서 날짜를 다룰 때 이 파일의 함수를 사용한다.
// 날짜 형식은 항상 'YYYY-MM-DD' 문자열로 통일한다.

// 'YYYY-MM-DD' 문자열을 { year, month, day } 숫자 객체로 분해
// month는 1~12 (JavaScript Date의 0~11과 다르니 주의)
export function parseDateStr(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number)
  return { year, month, day }
}

// year/month/day 숫자를 'YYYY-MM-DD' 문자열로 합침
// month는 JavaScript Date 기준 0~11을 받아서 내부에서 +1 처리한다.
export function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// 오늘 날짜를 'YYYY-MM-DD' 형식으로 반환
export function todayStr(): string {
  const t = new Date()
  return toDateStr(t.getFullYear(), t.getMonth(), t.getDate())
}

// 오늘 날짜를 KST(Asia/Seoul) 기준 'YYYY-MM-DD' 형식으로 반환
export function todayKST(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
}

// start부터 end까지 모든 날짜를 배열로 반환 (양 끝 포함)
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

// 특정 날짜(dateStr)에 해당하는 이벤트만 필터링
// endDate가 있는 일정은 그 범위 안에 dateStr이 포함되면 반환한다.
export function getEventsForDate<T extends { date: string; endDate?: string }>(
  events: T[],
  dateStr: string
): T[] {
  return events.filter((e) =>
    e.endDate ? e.date <= dateStr && dateStr <= e.endDate : e.date === dateStr
  )
}

// 'YYYY-MM-DD'를 '6월 15일 (월)' 형식으로 변환
export function formatDateLabel(dateStr: string): string {
  const { year, month, day } = parseDateStr(dateStr)
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][new Date(year, month - 1, day).getDay()]
  return `${month}월 ${day}일 (${weekday})`
}
