'use client'

import { create } from 'zustand'
import type { Todo } from '@/types'
import {
  addTodo as fsAdd,
  updateTodo as fsUpdate,
  deleteTodo as fsDelete,
  clearAllTodos as fsClear,
} from '@/lib/firestore/todos'
import { toast } from '@/store/toastStore'
import { todayKST } from '@/lib/date'

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
      toast.error('할일 저장에 실패했어요.')
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
      toast.error('할일 수정에 실패했어요.')
    }
  },

  toggleTodo: async (id) => {
    const { todos, userId } = get()
    if (!userId) return
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    const completed   = !todo.completed
    const completedAt = completed ? todayKST() : undefined
    set((s) => ({ todos: s.todos.map((t) => t.id === id ? { ...t, completed, completedAt } : t) }))
    try {
      await fsUpdate(userId, id, { completed, completedAt })
    } catch {
      set((s) => ({ todos: s.todos.map((t) => t.id === id ? todo : t) }))
      toast.error('상태 변경에 실패했어요.')
    }
  },

  deleteTodo: async (id) => {
    const { userId, todos } = get()
    if (!userId) return
    const idx  = todos.findIndex((t) => t.id === id)
    const prev = todos[idx]
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) }))
    try {
      await fsDelete(userId, id)
    } catch {
      if (prev) set((s) => {
        const restored = [...s.todos]
        restored.splice(Math.min(idx, restored.length), 0, prev)
        return { todos: restored }
      })
      toast.error('할일 삭제에 실패했어요.')
    }
  },

  clearAll: async () => {
    const { todos, userId } = get()
    if (!userId) return
    const toDelete = todos.filter((t) => !t.completed)
    const toKeep   = todos.filter((t) =>  t.completed)
    if (toDelete.length === 0) return
    set({ todos: toKeep })
    try {
      await fsClear(userId, toDelete.map((t) => t.id))
    } catch {
      set({ todos })
      toast.error('삭제에 실패했어요.')
    }
  },
}))
