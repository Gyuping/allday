import { describe, it, expect } from 'vitest'
import { parseDateStr, toDateStr, getDateRange, getEventsForDate, formatDateLabel, dateFromStr } from '@/lib/date'

describe('parseDateStr', () => {
  it('YYYY-MM-DD를 { year, month, day }로 분해한다', () => {
    expect(parseDateStr('2025-07-04')).toEqual({ year: 2025, month: 7, day: 4 })
  })

  it('month는 1~12 기준이다', () => {
    expect(parseDateStr('2025-01-01').month).toBe(1)
    expect(parseDateStr('2025-12-31').month).toBe(12)
  })
})

describe('toDateStr', () => {
  it('JS Date 기준 month(0~11)를 받아 YYYY-MM-DD로 변환한다', () => {
    expect(toDateStr(2025, 6, 4)).toBe('2025-07-04')   // month=6 → 7월
    expect(toDateStr(2025, 0, 1)).toBe('2025-01-01')   // month=0 → 1월
    expect(toDateStr(2025, 11, 31)).toBe('2025-12-31') // month=11 → 12월
  })

  it('날짜를 두 자리로 패딩한다', () => {
    expect(toDateStr(2025, 0, 5)).toBe('2025-01-05')
  })
})

// ─────────────────────────────────────────────────────────────
// dateFromStr — Safari/Chrome 동일 결과 보장
// new Date('YYYY-MM-DD')는 Safari에서 UTC 자정으로 파싱돼
// 한국(UTC+9)에서는 하루가 밀림 → dateFromStr로 로컬 자정 보장
// ─────────────────────────────────────────────────────────────
describe('dateFromStr — Safari/Chrome 동일 결과', () => {
  it.each([
    ['연초',           '2025-01-01', 2025, 0,  1 ],
    ['연말',           '2024-12-31', 2024, 11, 31],
    ['윤년 2월 29일',  '2024-02-29', 2024, 1,  29],
    ['공휴일 삼일절',  '2025-03-01', 2025, 2,  1 ],
    ['공휴일 광복절',  '2025-08-15', 2025, 7,  15],
    ['공휴일 한글날',  '2025-10-09', 2025, 9,  9 ],
    ['공휴일 크리스마스', '2025-12-25', 2025, 11, 25],
  ] as const)('%s(%s) → getFullYear/Month/Date가 정확하다', (_, dateStr, year, month, day) => {
    const d = dateFromStr(dateStr)
    expect(d.getFullYear()).toBe(year)
    expect(d.getMonth()).toBe(month)   // 0-indexed
    expect(d.getDate()).toBe(day)
  })

  it('로컬 자정(00:00:00)을 반환해 타임존 밀림이 없다', () => {
    const d = dateFromStr('2025-01-01')
    expect(d.getHours()).toBe(0)
    expect(d.getMinutes()).toBe(0)
    expect(d.getSeconds()).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────
// getDateRange — 연말/연초, 윤년, 월 경계
// ─────────────────────────────────────────────────────────────
describe('getDateRange', () => {
  it('start~end 사이 모든 날짜를 반환한다', () => {
    expect(getDateRange('2025-07-01', '2025-07-03'))
      .toEqual(['2025-07-01', '2025-07-02', '2025-07-03'])
  })

  it('start > end여도 올바르게 정렬하여 반환한다', () => {
    expect(getDateRange('2025-07-03', '2025-07-01'))
      .toEqual(['2025-07-01', '2025-07-02', '2025-07-03'])
  })

  it('같은 날짜면 배열 길이가 1이다', () => {
    expect(getDateRange('2025-07-04', '2025-07-04')).toEqual(['2025-07-04'])
  })

  it('잘못된 날짜면 빈 배열을 반환한다', () => {
    expect(getDateRange('invalid', '2025-07-04')).toEqual([])
  })

  it('365일 한도를 넘지 않는다', () => {
    expect(getDateRange('2025-01-01', '2026-12-31').length).toBe(365)
  })

  it('월 경계를 올바르게 넘어간다', () => {
    expect(getDateRange('2025-01-30', '2025-02-02'))
      .toEqual(['2025-01-30', '2025-01-31', '2025-02-01', '2025-02-02'])
  })

  // 연말/연초
  it('연도 경계(12월 → 1월)를 올바르게 처리한다', () => {
    expect(getDateRange('2024-12-30', '2025-01-02'))
      .toEqual(['2024-12-30', '2024-12-31', '2025-01-01', '2025-01-02'])
  })

  it('연말 하루(12월 31일)만 선택 시 배열 길이가 1이다', () => {
    expect(getDateRange('2024-12-31', '2024-12-31')).toEqual(['2024-12-31'])
  })

  // 윤년
  it('윤년(2024년) 2월 29일을 포함한 범위를 올바르게 처리한다', () => {
    expect(getDateRange('2024-02-28', '2024-03-01'))
      .toEqual(['2024-02-28', '2024-02-29', '2024-03-01'])
  })

  it('평년(2025년)에는 2월 29일이 포함되지 않는다', () => {
    const result = getDateRange('2025-02-27', '2025-03-01')
    expect(result).toEqual(['2025-02-27', '2025-02-28', '2025-03-01'])
    expect(result).not.toContain('2025-02-29')
  })

  it('윤년 2월 29일 하루만 선택해도 배열 길이가 1이다', () => {
    expect(getDateRange('2024-02-29', '2024-02-29')).toEqual(['2024-02-29'])
  })
})

// ─────────────────────────────────────────────────────────────
// getEventsForDate
// ─────────────────────────────────────────────────────────────
describe('getEventsForDate', () => {
  const events = [
    { id: '1', date: '2025-07-04', endDate: undefined },
    { id: '2', date: '2025-07-03', endDate: '2025-07-06' },
    { id: '3', date: '2025-07-10', endDate: undefined },
  ]

  it('단일 날짜 이벤트를 올바르게 필터링한다', () => {
    const ids = getEventsForDate(events, '2025-07-04').map((e) => e.id)
    expect(ids).toContain('1')
    expect(ids).not.toContain('3')
  })

  it('기간 이벤트가 범위 내 날짜에 포함된다', () => {
    expect(getEventsForDate(events, '2025-07-05').map((e) => e.id)).toContain('2')
  })

  it('기간 이벤트의 시작/종료일에도 포함된다', () => {
    expect(getEventsForDate(events, '2025-07-03').map((e) => e.id)).toContain('2')
    expect(getEventsForDate(events, '2025-07-06').map((e) => e.id)).toContain('2')
  })

  it('기간 이벤트 범위 밖은 포함되지 않는다', () => {
    expect(getEventsForDate(events, '2025-07-07').map((e) => e.id)).not.toContain('2')
  })

  // 연말/연초 걸치는 이벤트
  it('연말~연초에 걸친 기간 이벤트를 올바르게 처리한다', () => {
    const crossYearEvents = [{ id: 'x', date: '2024-12-29', endDate: '2025-01-02' }]
    expect(getEventsForDate(crossYearEvents, '2024-12-31').map((e) => e.id)).toContain('x')
    expect(getEventsForDate(crossYearEvents, '2025-01-01').map((e) => e.id)).toContain('x')
    expect(getEventsForDate(crossYearEvents, '2025-01-03').map((e) => e.id)).not.toContain('x')
  })
})

// ─────────────────────────────────────────────────────────────
// formatDateLabel — 공휴일 날짜 요일 검증
// ─────────────────────────────────────────────────────────────
describe('formatDateLabel', () => {
  it('날짜를 한국어 형식으로 변환한다', () => {
    expect(formatDateLabel('2025-07-04')).toBe('7월 4일 (금)')
  })

  it('월과 일을 올바르게 표시한다', () => {
    expect(formatDateLabel('2025-01-01')).toMatch(/^1월 1일/)
  })

  it.each([
    ['신정',     '2025-01-01', '수'],
    ['삼일절',   '2025-03-01', '토'],
    ['어린이날', '2025-05-05', '월'],
    ['광복절',   '2025-08-15', '금'],
    ['한글날',   '2025-10-09', '목'],
    ['크리스마스','2025-12-25', '목'],
  ] as const)('공휴일 %s(%s)의 요일이 %s이다', (_, date, weekday) => {
    expect(formatDateLabel(date)).toContain(`(${weekday})`)
  })

  it('윤년 2월 29일 formatDateLabel이 정상 동작한다', () => {
    expect(formatDateLabel('2024-02-29')).toMatch(/^2월 29일/)
  })
})
