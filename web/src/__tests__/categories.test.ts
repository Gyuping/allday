import { describe, it, expect } from 'vitest'
import { CATEGORIES, getCategoryById } from '@/lib/categories'

describe('CATEGORIES', () => {
  it('5개 카테고리가 있다', () => {
    expect(CATEGORIES).toHaveLength(5)
  })
  it('각 카테고리에 id, label, color가 있다', () => {
    for (const cat of CATEGORIES) {
      expect(cat.id).toBeTruthy()
      expect(cat.label).toBeTruthy()
      expect(cat.color).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
  it('id가 중복되지 않는다', () => {
    const ids = CATEGORIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getCategoryById', () => {
  it('존재하는 id는 카테고리를 반환한다', () => {
    expect(getCategoryById('work')).toBeDefined()
    expect(getCategoryById('work')?.label).toBe('업무')
  })
  it('없는 id는 undefined를 반환한다', () => {
    expect(getCategoryById('nonexistent')).toBeUndefined()
  })
  it('undefined 입력은 undefined를 반환한다', () => {
    expect(getCategoryById(undefined)).toBeUndefined()
  })
})
