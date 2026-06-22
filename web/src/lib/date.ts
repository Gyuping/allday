export function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function todayStr(): string {
  const t = new Date()
  return toDateStr(t.getFullYear(), t.getMonth(), t.getDate())
}

export function getDateRange(start: string, end: string): string[] {
  const s = new Date(start)
  const e = new Date(end)
  const [from, to] = s <= e ? [s, e] : [e, s]
  const dates: string[] = []
  const d = new Date(from)
  while (d <= to) {
    dates.push(toDateStr(d.getFullYear(), d.getMonth(), d.getDate()))
    d.setDate(d.getDate() + 1)
  }
  return dates
}

export function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][new Date(year, month - 1, day).getDay()]
  return `${month}월 ${day}일 (${weekday})`
}
