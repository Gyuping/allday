import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/firestore/todos', () => ({
  addTodo:       vi.fn().mockResolvedValue(undefined),
  updateTodo:    vi.fn().mockResolvedValue(undefined),
  deleteTodo:    vi.fn().mockResolvedValue(undefined),
  clearAllTodos: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/store/toastStore', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

import { useTodoStore } from '@/store/todoStore'
import * as firestoreTodos from '@/lib/firestore/todos'
import type { Todo } from '@/types'

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id:          'todo-1',
  title:       '테스트 할일',
  completed:   false,
  priority:    'medium',
  createdAt:   '2026-06-15T00:00:00.000Z',
  ...overrides,
})

beforeEach(() => {
  useTodoStore.setState({ todos: [], userId: 'user-1', isLoading: false })
  vi.clearAllMocks()
})

describe('addTodo', () => {
  it('목록 맨 앞에 즉시 추가된다', async () => {
    await useTodoStore.getState().addTodo(makeTodo({ id: 'a' }))
    await useTodoStore.getState().addTodo(makeTodo({ id: 'b' }))
    expect(useTodoStore.getState().todos[0].id).toBe('b')
  })

  it('Firestore 실패 시 롤백된다', async () => {
    vi.mocked(firestoreTodos.addTodo).mockRejectedValueOnce(new Error('fail'))
    await useTodoStore.getState().addTodo(makeTodo())
    expect(useTodoStore.getState().todos).toHaveLength(0)
  })

  it('userId 없으면 추가하지 않는다', async () => {
    useTodoStore.setState({ userId: null })
    await useTodoStore.getState().addTodo(makeTodo())
    expect(useTodoStore.getState().todos).toHaveLength(0)
  })
})

describe('toggleTodo', () => {
  beforeEach(async () => {
    await useTodoStore.getState().addTodo(makeTodo())
  })

  it('미완료 → 완료로 전환된다', async () => {
    await useTodoStore.getState().toggleTodo('todo-1')
    expect(useTodoStore.getState().todos[0].completed).toBe(true)
  })

  it('완료 시 completedAt이 오늘 날짜로 설정된다', async () => {
    const today = new Date().toLocaleDateString('sv-SE')
    await useTodoStore.getState().toggleTodo('todo-1')
    expect(useTodoStore.getState().todos[0].completedAt).toBe(today)
  })

  it('완료 → 미완료로 전환 시 completedAt이 제거된다', async () => {
    await useTodoStore.getState().toggleTodo('todo-1')  // 완료
    await useTodoStore.getState().toggleTodo('todo-1')  // 미완료
    expect(useTodoStore.getState().todos[0].completed).toBe(false)
    expect(useTodoStore.getState().todos[0].completedAt).toBeUndefined()
  })

  it('Firestore 실패 시 원래 상태로 롤백된다', async () => {
    vi.mocked(firestoreTodos.updateTodo).mockRejectedValueOnce(new Error('fail'))
    await useTodoStore.getState().toggleTodo('todo-1')
    expect(useTodoStore.getState().todos[0].completed).toBe(false)
  })

  it('존재하지 않는 todo는 무시한다', async () => {
    await useTodoStore.getState().toggleTodo('없는-id')
    expect(firestoreTodos.updateTodo).not.toHaveBeenCalled()
  })
})

describe('deleteTodo', () => {
  beforeEach(async () => {
    await useTodoStore.getState().addTodo(makeTodo())
  })

  it('할일을 즉시 삭제한다', async () => {
    await useTodoStore.getState().deleteTodo('todo-1')
    expect(useTodoStore.getState().todos).toHaveLength(0)
  })

  it('Firestore 실패 시 복원된다', async () => {
    vi.mocked(firestoreTodos.deleteTodo).mockRejectedValueOnce(new Error('fail'))
    await useTodoStore.getState().deleteTodo('todo-1')
    expect(useTodoStore.getState().todos).toHaveLength(1)
  })
})

describe('clearAll', () => {
  beforeEach(async () => {
    await useTodoStore.getState().addTodo(makeTodo({ id: 'a', completed: false }))
    await useTodoStore.getState().addTodo(makeTodo({ id: 'b', completed: true,  completedAt: '2026-06-15' }))
    await useTodoStore.getState().addTodo(makeTodo({ id: 'c', completed: false }))
  })

  it('미완료 항목만 삭제한다', async () => {
    await useTodoStore.getState().clearAll()
    const todos = useTodoStore.getState().todos
    expect(todos).toHaveLength(1)
    expect(todos[0].id).toBe('b')
  })

  it('완료된 항목은 유지된다 (캘린더 기록 보존)', async () => {
    await useTodoStore.getState().clearAll()
    expect(useTodoStore.getState().todos[0].completed).toBe(true)
  })

  it('미완료 항목이 없으면 Firestore를 호출하지 않는다', async () => {
    useTodoStore.setState({ todos: [makeTodo({ id: 'x', completed: true })] })
    await useTodoStore.getState().clearAll()
    expect(firestoreTodos.clearAllTodos).not.toHaveBeenCalled()
  })

  it('Firestore 실패 시 전체 목록을 복원한다', async () => {
    vi.mocked(firestoreTodos.clearAllTodos).mockRejectedValueOnce(new Error('fail'))
    const before = useTodoStore.getState().todos.length
    await useTodoStore.getState().clearAll()
    expect(useTodoStore.getState().todos).toHaveLength(before)
  })
})

describe('resetExpiredCompleted', () => {
  it('어제 완료된 항목을 미완료로 되돌린다', async () => {
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('sv-SE')
    useTodoStore.setState({
      todos: [makeTodo({ id: 'old', completed: true, completedAt: yesterday })],
    })
    await useTodoStore.getState().resetExpiredCompleted()
    expect(useTodoStore.getState().todos[0].completed).toBe(false)
  })

  it('오늘 완료된 항목은 유지된다', async () => {
    const today = new Date().toLocaleDateString('sv-SE')
    useTodoStore.setState({
      todos: [makeTodo({ id: 'new', completed: true, completedAt: today })],
    })
    await useTodoStore.getState().resetExpiredCompleted()
    expect(useTodoStore.getState().todos[0].completed).toBe(true)
  })

  it('만료 항목이 없으면 Firestore를 호출하지 않는다', async () => {
    const today = new Date().toLocaleDateString('sv-SE')
    useTodoStore.setState({
      todos: [makeTodo({ completed: true, completedAt: today })],
    })
    await useTodoStore.getState().resetExpiredCompleted()
    expect(firestoreTodos.updateTodo).not.toHaveBeenCalled()
  })
})

describe('updateTodo', () => {
  beforeEach(async () => {
    await useTodoStore.getState().addTodo(makeTodo())
  })

  it('일부 필드만 수정할 수 있다', async () => {
    await useTodoStore.getState().updateTodo('todo-1', { title: '수정된 제목', priority: 'high' })
    const todo = useTodoStore.getState().todos[0]
    expect(todo.title).toBe('수정된 제목')
    expect(todo.priority).toBe('high')
    expect(todo.completed).toBe(false)  // 나머지는 유지
  })

  it('Firestore 실패 시 롤백된다', async () => {
    vi.mocked(firestoreTodos.updateTodo).mockRejectedValueOnce(new Error('fail'))
    await useTodoStore.getState().updateTodo('todo-1', { title: '수정 실패' })
    expect(useTodoStore.getState().todos[0].title).toBe('테스트 할일')
  })
})
