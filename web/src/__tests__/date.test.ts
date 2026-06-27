import { describe, it, expect } from 'vitest'
import {
  parseDateStr,
  toDateStr,
  getDateRange,
  getEventsForDate,
  formatDateLabel,
  todayStr,
} from '@/lib/date'

describe('parseDateStr', () => {
  it('YYYY-MM-DD를 { year, month, day }로 파싱한다', () => {
    expect(parseDateStr('2026-06-15')).toEqual({ year: 2026, month: 6, day: 15 })
  })
  it('month는 1~12 범위로 반환한다 (0 기반 아님)', () => {
    expect(parseDateStr('2026-01-01').month).toBe(1)
    expect(parseDateStr('2026-12-31').month).toBe(12)
  })
})

describe('toDateStr', () => {
  it('year, month(0~11), day를 YYYY-MM-DD로 변환한다', () => {
    expect(toDateStr(2026, 0, 1)).toBe('2026-01-01')   // 1월
    expect(toDateStr(2026, 11, 31)).toBe('2026-12-31')  // 12월
  })
  it('한 자리 월/일을 두 자리로 패딩한다', () => {
    expect(toDateStr(2026, 5, 3)).toBe('2026-06-03')
  })
})

describe('todayStr', () => {
  it('YYYY-MM-DD 형식으로 반환한다', () => {
    expect(todayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('getDateRange', () => {
  it('start~end 사이 모든 날짜를 반환한다', () => {
    const result = getDateRange('2026-06-01', '2026-06-03')
    expect(result).toEqual(['2026-06-01', '2026-06-02', '2026-06-03'])
  })
  it('start와 end가 같으면 하나만 반환한다', () => {
    expect(getDateRange('2026-06-01', '2026-06-01')).toEqual(['2026-06-01'])
  })
  it('start > end여도 올바르게 처리한다', () => {
    const result = getDateRange('2026-06-03', '2026-06-01')
    expect(result).toEqual(['2026-06-01', '2026-06-02', '2026-06-03'])
  })
  it('잘못된 날짜 문자열은 빈 배열을 반환한다', () => {
    expect(getDateRange('invalid', '2026-06-01')).toEqual([])
  })
  it('365일 초과 범위는 365개로 제한된다', () => {
    const result = getDateRange('2026-01-01', '2030-12-31')
    expect(result.length).toBe(365)
  })
})

describe('getEventsForDate', () => {
  const events = [
    { id: '1', date: '2026-06-01', title: '단일 일정' },
    { id: '2', date: '2026-06-01', endDate: '2026-06-05', title: '범위 일정' },
    { id: '3', date: '2026-06-10', title: '다른 날 일정' },
  ]

  it('특정 날짜의 이벤트만 반환한다', () => {
    const result = getEventsForDate(events, '2026-06-01')
    expect(result.map((e) => e.id)).toEqual(['1', '2'])
  })
  it('범위 일정은 범위 안의 날짜에서 모두 반환된다', () => {
    const result = getEventsForDate(events, '2026-06-03')
    expect(result.map((e) => e.id)).toEqual(['2'])
  })
  it('해당 날짜에 이벤트가 없으면 빈 배열을 반환한다', () => {
    expect(getEventsForDate(events, '2026-07-01')).toEqual([])
  })
})

describe('formatDateLabel', () => {
  it('YYYY-MM-DD를 "M월 D일 (요일)" 형식으로 변환한다', () => {
    // 2026-06-01은 월요일
    expect(formatDateLabel('2026-06-01')).toBe('6월 1일 (월)')
  })
})
