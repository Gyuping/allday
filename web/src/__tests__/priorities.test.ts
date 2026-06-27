import { describe, it, expect } from 'vitest'
import { PRIORITY_CONFIG, PRIORITY_OPTIONS } from '@/lib/priorities'

describe('PRIORITY_CONFIG', () => {
  it('high/medium/low 세 가지 우선순위가 모두 있다', () => {
    expect(PRIORITY_CONFIG).toHaveProperty('high')
    expect(PRIORITY_CONFIG).toHaveProperty('medium')
    expect(PRIORITY_CONFIG).toHaveProperty('low')
  })
  it('각 우선순위에 label, text, bar, color가 있다', () => {
    for (const key of ['high', 'medium', 'low'] as const) {
      expect(PRIORITY_CONFIG[key]).toMatchObject({
        label: expect.any(String),
        text:  expect.any(String),
        bar:   expect.any(String),
        color: expect.any(String),
      })
    }
  })
})

describe('PRIORITY_OPTIONS', () => {
  it('세 가지 옵션이 있다', () => {
    expect(PRIORITY_OPTIONS).toHaveLength(3)
  })
  it('각 옵션에 value, label, color가 있다', () => {
    for (const opt of PRIORITY_OPTIONS) {
      expect(opt).toMatchObject({
        value: expect.any(String),
        label: expect.any(String),
        color: expect.any(String),
      })
    }
  })
})
