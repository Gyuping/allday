import { describe, it, expect } from 'vitest'
import { REMINDER_OPTIONS } from '@/constants/reminders'

describe('REMINDER_OPTIONS', () => {
  it('5개 옵션이 있다', () => {
    expect(REMINDER_OPTIONS).toHaveLength(5)
  })
  it('첫 번째 옵션은 "없음"이다', () => {
    expect(REMINDER_OPTIONS[0].label).toBe('없음')
    expect(REMINDER_OPTIONS[0].value).toBeUndefined()
  })
  it('나머지 옵션은 양수 분 값을 가진다', () => {
    for (const opt of REMINDER_OPTIONS.slice(1)) {
      expect(opt.value).toBeGreaterThan(0)
    }
  })
  it('값이 오름차순으로 정렬되어 있다', () => {
    const values = REMINDER_OPTIONS.slice(1).map((o) => o.value as number)
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })
})
