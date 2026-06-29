'use client'

// ?�일 목록 ?�역 ?�태 관�???Firestore ?�동
// ?��????�데?�트: 로컬 먼�? 반영 ??Firestore ?�패 ??롤백
import { create } from 'zustand'
import type { Todo } from '@/types'
import {
  addTodo as fsAdd,
  updateTodo as fsUpdate,
  deleteTodo as fsDelete,
  clearAllTodos as fsClear,
} from '@/lib/firestore/todos'
import { toast } from '@/store/toastStore'

type TodoStore = {
  todos: Todo[]
  userId: string | null
  isLoading: boolean
  setUserId: (id: string | null) => void
  setTodos: (todos: Todo[]) => void
  setLoading: (v: boolean) => void
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
  isLoading: true,

  setUserId: (id) => set({ userId: id }),
  setTodos: (todos) => set({ todos, isLoading: false }),
  setLoading: (v) => set({ isLoading: v }),

  addTodo: async (todo) => {
    const { userId } = get()
    if (!userId) return
    set((s) => ({ todos: [todo, ...s.todos] }))
    try {
      await fsAdd(userId, todo)
    } catch {
      set((s) => ({ todos: s.todos.filter((t) => t.id !== todo.id) }))
      toast.error('?�일 ?�?�에 ?�패?�어??')
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
      toast.error('?�일 ?�정???�패?�어??')
    }
  },

  toggleTodo: async (id) => {
    const { todos, userId } = get()
    if (!userId) return
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    const completed   = !todo.completed
    const completedAt = completed ? new Date().toLocaleDateString('sv-SE') : undefined
    set((s) => ({ todos: s.todos.map((t) => t.id === id ? { ...t, completed, completedAt } : t) }))
    try {
      await fsUpdate(userId, id, { completed, completedAt: completedAt ?? null } as Partial<Todo>)
    } catch {
      set((s) => ({ todos: s.todos.map((t) => t.id === id ? todo : t) }))
      toast.error('?�태 변경에 ?�패?�어??')
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
      toast.error('?�일 ??��???�패?�어??')
    }
  },

  // 미완�???���???�� ???�료????��?� 캘린??기록 보존???�해 ?��?
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
      set({ todos })  // ?�패 ???�복
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
