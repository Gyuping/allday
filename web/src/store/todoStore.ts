// 할일 목록 전역 상태 관리 — Firestore 연동
// 낙관적 업데이트: 로컬 먼저 반영 → Firestore 실패 시 롤백
import { create } from 'zustand'
import type { Todo } from '@/types'
import {
  addTodo as fsAdd,
  updateTodo as fsUpdate,
  deleteTodo as fsDelete,
  clearAllTodos as fsClear,
} from '@/lib/firestore/todos'

type TodoStore = {
  todos: Todo[]
  userId: string | null
  setUserId: (id: string | null) => void
  setTodos: (todos: Todo[]) => void
  addTodo: (todo: Todo) => Promise<void>
  updateTodo: (id: string, data: Partial<Todo>) => Promise<void>
  toggleTodo: (id: string) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  clearAll: () => Promise<void>
  resetExpiredCompleted: () => Promise<void>
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  userId: null,

  setUserId: (id) => set({ userId: id }),
  setTodos: (todos) => set({ todos }),

  addTodo: async (todo) => {
    const { userId } = get()
    if (!userId) return
    set((s) => ({ todos: [todo, ...s.todos] }))
    try {
      await fsAdd(userId, todo)
    } catch {
      set((s) => ({ todos: s.todos.filter((t) => t.id !== todo.id) }))
    }
  },

  updateTodo: async (id, data) => {
    const { userId, todos } = get()
    if (!userId) return
    const prev = todos.find((t) => t.id === id)
    if (!prev) return
    set((s) => ({ todos: s.todos.map((t) => t.id === id ? { ...t, ...data } : t) }))
    try {
      await fsUpdate(userId, id, data)
    } catch {
      set((s) => ({ todos: s.todos.map((t) => t.id === id ? prev : t) }))
    }
  },

  toggleTodo: async (id) => {
    const { todos, userId } = get()
    if (!userId) return
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    const completed  = !todo.completed
    const completedAt = completed ? new Date().toLocaleDateString('sv-SE') : undefined
    // 낙관적 업데이트
    set((s) => ({ todos: s.todos.map((t) => t.id === id ? { ...t, completed, completedAt } : t) }))
    try {
      await fsUpdate(userId, id, { completed, completedAt: completedAt ?? null } as Partial<Todo>)
    } catch {
      // 롤백
      set((s) => ({ todos: s.todos.map((t) => t.id === id ? todo : t) }))
    }
  },

  deleteTodo: async (id) => {
    const { userId, todos } = get()
    if (!userId) return
    const prev = todos.find((t) => t.id === id)
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) }))
    try {
      await fsDelete(userId, id)
    } catch {
      if (prev) set((s) => ({ todos: [...s.todos, prev] }))
    }
  },

  // 미완료 항목만 삭제 — 완료된 항목은 캘린더 기록 보존을 위해 유지
  clearAll: async () => {
    const { todos, userId } = get()
    if (!userId) return
    const toDelete  = todos.filter((t) => !t.completed)
    const toKeep    = todos.filter((t) =>  t.completed)
    if (toDelete.length === 0) return
    set({ todos: toKeep })
    try {
      await fsClear(userId, toDelete.map((t) => t.id))
    } catch {
      set({ todos })  // 실패 시 원복
    }
  },

  resetExpiredCompleted: async () => {
    const { todos, userId } = get()
    if (!userId) return
    const today = new Date().toLocaleDateString('sv-SE')
    const expired = todos.filter((t) => t.completed && t.completedAt && t.completedAt < today)
    if (expired.length === 0) return
    const expiredIds = new Set(expired.map((t) => t.id))
    set((s) => ({ todos: s.todos.map((t) => expiredIds.has(t.id) ? { ...t, completed: false } : t) }))
    try {
      await Promise.all(expired.map((t) => fsUpdate(userId, t.id, { completed: false })))
    } catch {
      // 실패해도 다음 앱 실행 시 재시도
    }
  },
}))
