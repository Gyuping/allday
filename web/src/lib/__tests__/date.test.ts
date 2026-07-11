import { describe, it, expect } from 'vitest'
import { parseDateStr, toDateStr, getDateRange, getEventsForDate, formatDateLabel } from '@/lib/date'

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

describe('getDateRange', () => {
  it('start~end 사이 모든 날짜를 반환한다', () => {
    const result = getDateRange('2025-07-01', '2025-07-03')
    expect(result).toEqual(['2025-07-01', '2025-07-02', '2025-07-03'])
  })

  it('start > end여도 올바르게 정렬하여 반환한다', () => {
    const result = getDateRange('2025-07-03', '2025-07-01')
    expect(result).toEqual(['2025-07-01', '2025-07-02', '2025-07-03'])
  })

  it('같은 날짜면 배열 길이가 1이다', () => {
    expect(getDateRange('2025-07-04', '2025-07-04')).toEqual(['2025-07-04'])
  })

  it('잘못된 날짜면 빈 배열을 반환한다', () => {
    expect(getDateRange('invalid', '2025-07-04')).toEqual([])
  })

  it('365일 한도를 넘지 않는다', () => {
    const result = getDateRange('2025-01-01', '2026-12-31')
    expect(result.length).toBe(365)
  })

  it('월 경계를 올바르게 넘어간다', () => {
    const result = getDateRange('2025-01-30', '2025-02-02')
    expect(result).toEqual(['2025-01-30', '2025-01-31', '2025-02-01', '2025-02-02'])
  })
})

describe('getEventsForDate', () => {
  const events = [
    { id: '1', date: '2025-07-04', endDate: undefined },
    { id: '2', date: '2025-07-03', endDate: '2025-07-06' },
    { id: '3', date: '2025-07-10', endDate: undefined },
  ]

  it('단일 날짜 이벤트를 올바르게 필터링한다', () => {
    const result = getEventsForDate(events, '2025-07-04')
    expect(result.map((e) => e.id)).toContain('1')
    expect(result.map((e) => e.id)).not.toContain('3')
  })

  it('기간 이벤트가 범위 내 날짜에 포함된다', () => {
    const result = getEventsForDate(events, '2025-07-05')
    expect(result.map((e) => e.id)).toContain('2')
  })

  it('기간 이벤트의 시작/종료일에도 포함된다', () => {
    expect(getEventsForDate(events, '2025-07-03').map((e) => e.id)).toContain('2')
    expect(getEventsForDate(events, '2025-07-06').map((e) => e.id)).toContain('2')
  })

  it('기간 이벤트 범위 밖은 포함되지 않는다', () => {
    expect(getEventsForDate(events, '2025-07-07').map((e) => e.id)).not.toContain('2')
  })
})

describe('formatDateLabel', () => {
  it('날짜를 한국어 형식으로 변환한다', () => {
    // 2025-07-04는 금요일
    expect(formatDateLabel('2025-07-04')).toBe('7월 4일 (금)')
  })

  it('월과 일을 올바르게 표시한다', () => {
    expect(formatDateLabel('2025-01-01')).toMatch(/^1월 1일/)
  })
})
