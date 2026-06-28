import { describe, it, expect } from 'vitest'
import { PRESET_COLORS } from '@/lib/colors'

describe('PRESET_COLORS', () => {
  it('16개 색상이 있다', () => {
    expect(PRESET_COLORS).toHaveLength(16)
  })
  it('모두 유효한 hex 색상 코드다', () => {
    for (const color of PRESET_COLORS) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
  it('중복 색상이 없다', () => {
    expect(new Set(PRESET_COLORS).size).toBe(PRESET_COLORS.length)
  })
})
