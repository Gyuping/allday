import { describe, it, expect, vi, beforeEach } from 'vitest'

// Firestore 모듈 전체를 mock
vi.mock('@/lib/firestore/todos', () => ({
  addTodo: vi.fn().mockResolvedValue(undefined),
  updateTodo: vi.fn().mockResolvedValue(undefined),
  deleteTodo: vi.fn().mockResolvedValue(undefined),
  clearAllTodos: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/store/toastStore', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

import { useTodoStore } from '@/store/todoStore'
import * as fsTodos from '@/lib/firestore/todos'
import { toast } from '@/store/toastStore'
import type { Todo } from '@/types'

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: crypto.randomUUID(),
    title: '테스트 할일',
    completed: false,
    priority: 'medium',
    createdAt: '2025-07-04',
    ...overrides,
  }
}

beforeEach(() => {
  // 스토어 초기화
  useTodoStore.setState({ todos: [], userId: 'test-user', isLoading: false })
  vi.clearAllMocks()
})

describe('addTodo', () => {
  it('낙관적으로 todo를 즉시 추가한다', async () => {
    const todo = makeTodo()
    const promise = useTodoStore.getState().addTodo(todo)
    expect(useTodoStore.getState().todos).toHaveLength(1)
    await promise
    expect(useTodoStore.getState().todos).toHaveLength(1)
  })

  it('Firestore 실패 시 롤백한다', async () => {
    vi.mocked(fsTodos.addTodo).mockRejectedValueOnce(new Error('network'))
    const todo = makeTodo()
    await useTodoStore.getState().addTodo(todo)
    expect(useTodoStore.getState().todos).toHaveLength(0)
  })
})

describe('updateTodo', () => {
  it('낙관적으로 즉시 업데이트한다', async () => {
    const todo = makeTodo({ title: '원본' })
    useTodoStore.setState({ todos: [todo] })
    const promise = useTodoStore.getState().updateTodo(todo.id, { title: '수정됨' })
    expect(useTodoStore.getState().todos[0].title).toBe('수정됨')
    await promise
  })

  it('Firestore 실패 시 원본으로 롤백한다', async () => {
    vi.mocked(fsTodos.updateTodo).mockRejectedValueOnce(new Error('network'))
    const todo = makeTodo({ title: '원본' })
    useTodoStore.setState({ todos: [todo] })
    await useTodoStore.getState().updateTodo(todo.id, { title: '수정됨' })
    expect(useTodoStore.getState().todos[0].title).toBe('원본')
  })
})

describe('toggleTodo', () => {
  it('완료 상태를 토글하고 completedAt을 설정한다', async () => {
    const todo = makeTodo({ completed: false })
    useTodoStore.setState({ todos: [todo] })
    await useTodoStore.getState().toggleTodo(todo.id)
    const updated = useTodoStore.getState().todos[0]
    expect(updated.completed).toBe(true)
    expect(updated.completedAt).toBeTruthy()
  })

  it('완료 → 미완료로 토글하면 completedAt이 사라진다', async () => {
    const todo = makeTodo({ completed: true, completedAt: '2025-07-04' })
    useTodoStore.setState({ todos: [todo] })
    await useTodoStore.getState().toggleTodo(todo.id)
    expect(useTodoStore.getState().todos[0].completed).toBe(false)
    expect(useTodoStore.getState().todos[0].completedAt).toBeUndefined()
  })
})

describe('deleteTodo', () => {
  it('낙관적으로 즉시 삭제한다', async () => {
    const todo = makeTodo()
    useTodoStore.setState({ todos: [todo] })
    const promise = useTodoStore.getState().deleteTodo(todo.id)
    expect(useTodoStore.getState().todos).toHaveLength(0)
    await promise
  })

  it('Firestore 실패 시 복원한다', async () => {
    vi.mocked(fsTodos.deleteTodo).mockRejectedValueOnce(new Error('network'))
    const todo = makeTodo()
    useTodoStore.setState({ todos: [todo] })
    await useTodoStore.getState().deleteTodo(todo.id)
    expect(useTodoStore.getState().todos).toHaveLength(1)
  })
})

describe('clearAll', () => {
  it('미완료 항목만 삭제하고 완료 항목은 유지한다', async () => {
    const active    = makeTodo({ completed: false })
    const completed = makeTodo({ completed: true })
    useTodoStore.setState({ todos: [active, completed] })
    await useTodoStore.getState().clearAll()
    expect(useTodoStore.getState().todos).toHaveLength(1)
    expect(useTodoStore.getState().todos[0].completed).toBe(true)
  })

  it('미완료 항목이 없으면 아무것도 하지 않는다', async () => {
    const completed = makeTodo({ completed: true })
    useTodoStore.setState({ todos: [completed] })
    await useTodoStore.getState().clearAll()
    expect(fsTodos.clearAllTodos).not.toHaveBeenCalled()
  })

  it('Firestore 실패 시 롤백하고 토스트를 표시한다', async () => {
    vi.mocked(fsTodos.clearAllTodos).mockRejectedValueOnce(new Error('network'))
    const todo = makeTodo({ completed: false })
    useTodoStore.setState({ todos: [todo] })
    await useTodoStore.getState().clearAll()
    expect(useTodoStore.getState().todos).toHaveLength(1)
    expect(toast.error).toHaveBeenCalled()
  })
})

