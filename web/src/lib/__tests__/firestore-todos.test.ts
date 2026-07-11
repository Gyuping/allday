import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCommit, mockDelete, mockBatch } = vi.hoisted(() => {
  const mockCommit = vi.fn().mockResolvedValue(undefined)
  const mockDelete = vi.fn()
  const mockBatch  = vi.fn(() => ({ delete: mockDelete, commit: mockCommit }))
  return { mockCommit, mockDelete, mockBatch }
})

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  onSnapshot: vi.fn(),
  setDoc: vi.fn().mockResolvedValue(undefined),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
  writeBatch: mockBatch,
  deleteField: vi.fn(() => '__DELETE__'),
}))

vi.mock('@/lib/firebase', () => ({ db: {} }))

import { clearAllTodos } from '@/lib/firestore/todos'

beforeEach(() => vi.clearAllMocks())

describe('clearAllTodos', () => {
  it('빈 배열이면 batch를 실행하지 않는다', async () => {
    await clearAllTodos('user1', [])
    expect(mockBatch).not.toHaveBeenCalled()
  })

  it('10개면 batch를 한 번만 실행한다', async () => {
    const ids = Array.from({ length: 10 }, (_, i) => `id${i}`)
    await clearAllTodos('user1', ids)
    expect(mockBatch).toHaveBeenCalledTimes(1)
    expect(mockCommit).toHaveBeenCalledTimes(1)
    expect(mockDelete).toHaveBeenCalledTimes(10)
  })

  it('501개이면 batch를 두 번 나눠 실행한다', async () => {
    mockCommit.mockResolvedValue(undefined)
    const ids = Array.from({ length: 501 }, (_, i) => `id${i}`)
    await clearAllTodos('user1', ids)
    expect(mockBatch).toHaveBeenCalledTimes(2)
    expect(mockCommit).toHaveBeenCalledTimes(2)
    expect(mockDelete).toHaveBeenCalledTimes(501)
  })

  it('정확히 500개는 batch 한 번으로 처리한다', async () => {
    mockCommit.mockResolvedValue(undefined)
    const ids = Array.from({ length: 500 }, (_, i) => `id${i}`)
    await clearAllTodos('user1', ids)
    expect(mockBatch).toHaveBeenCalledTimes(1)
  })
})
