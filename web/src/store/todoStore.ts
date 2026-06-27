// 할일 목록 전역 상태 관리 — Firestore 연동
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
    set((s) => ({ todos: [todo, ...s.todos] }))
    if (userId) fsAdd(userId, todo).catch(() => {
      set((s) => ({ todos: s.todos.filter((t) => t.id !== todo.id) }))
    })
  },

  updateTodo: async (id, data) => {
    const { userId } = get()
    set((s) => ({ todos: s.todos.map((t) => t.id === id ? { ...t, ...data } : t) }))
    if (userId) await fsUpdate(userId, id, data)
  },

  toggleTodo: async (id) => {
    const { todos, userId } = get()
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    const completed = !todo.completed
    const completedAt = completed ? new Date().toLocaleDateString('sv-SE') : undefined
    set((s) => ({ todos: s.todos.map((t) => t.id === id ? { ...t, completed, completedAt } : t) }))
    if (!userId) return
    await fsUpdate(userId, id, { completed, completedAt: completedAt ?? null } as Partial<Todo>)
  },

  deleteTodo: async (id) => {
    const { userId } = get()
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) }))
    if (userId) fsDelete(userId, id).catch(() => {})
  },

  clearAll: async () => {
    const { todos, userId } = get()
    const ids = todos.filter((t) => !t.archived).map((t) => t.id)
    set((s) => ({ todos: s.todos.filter((t) => t.archived) }))
    if (userId) fsClear(userId, ids).catch(() => {})
  },

  // 날짜가 바뀌면 완료 항목을 archived 처리 — To-Do 목록에서 숨기고 캘린더 점은 유지
  resetExpiredCompleted: async () => {
    const { todos, userId } = get()
    const today = new Date().toLocaleDateString('sv-SE')
    const expiredIds = new Set(
      todos.filter((t) => t.completed && t.completedAt && t.completedAt < today).map((t) => t.id)
    )
    if (expiredIds.size === 0) return
    set((s) => ({ todos: s.todos.map((t) => expiredIds.has(t.id) ? { ...t, archived: true } : t) }))
    if (!userId) return
    await Promise.all([...expiredIds].map((id) => fsUpdate(userId, id, { archived: true })))
  },
}))
