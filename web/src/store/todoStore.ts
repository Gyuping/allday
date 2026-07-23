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
  fetchError: boolean
  retryToken: number
  setUserId: (id: string | null) => void
  setTodos: (todos: Todo[]) => void
  setLoading: (v: boolean) => void
  setFetchError: (v: boolean) => void
  setSubscriptionFailed: () => void
  requestRetry: () => void
  addTodo: (todo: Todo) => void
  updateTodo: (id: string, data: Partial<Todo>) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  clearAll: () => void
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  userId: null,
  isLoading: true,
  fetchError: false,
  retryToken: 0,

  setUserId: (id) => set({ userId: id }),
  setTodos: (todos) => set({ todos, isLoading: false, fetchError: false }),
  setLoading: (v) => set({ isLoading: v }),
  setFetchError: (v) => set({ fetchError: v }),
  setSubscriptionFailed: () => set({ isLoading: false, fetchError: true }),
  requestRetry: () => set((s) => ({ isLoading: true, fetchError: false, retryToken: s.retryToken + 1 })),

  addTodo: (todo) => {
    const { userId } = get()
    if (!userId) return
    set((s) => ({ todos: [todo, ...s.todos] }))
    fsAdd(userId, todo).catch(() => {
      set((s) => ({ todos: s.todos.filter((t) => t.id !== todo.id) }))
      toast.error('할일 저장에 실패했어요.')
    })
  },

  updateTodo: (id, data) => {
    const { userId, todos } = get()
    if (!userId) return
    const prev = todos.find((t) => t.id === id)
    if (!prev) return
    set((s) => ({ todos: s.todos.map((t) => t.id === id ? { ...t, ...data } : t) }))
    fsUpdate(userId, id, data).catch(() => {
      set((s) => ({ todos: s.todos.map((t) => t.id === id ? prev : t) }))
      toast.error('할일 수정에 실패했어요.')
    })
  },

  toggleTodo: (id) => {
    const { todos, userId } = get()
    if (!userId) return
    const todo = todos.find((t) => t.id === id)
    if (!todo) return
    const completed   = !todo.completed
    const completedAt = completed ? todayKST() : undefined
    set((s) => ({ todos: s.todos.map((t) => t.id === id ? { ...t, completed, completedAt } : t) }))
    fsUpdate(userId, id, { completed, completedAt }).catch(() => {
      set((s) => ({ todos: s.todos.map((t) => t.id === id ? todo : t) }))
      toast.error('상태 변경에 실패했어요.')
    })
  },

  deleteTodo: (id) => {
    const { userId, todos } = get()
    if (!userId) return
    const prev = todos.find((t) => t.id === id)
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) }))
    fsDelete(userId, id).catch(() => {
      if (prev) set((s) => {
        // 롤백 시점의 배열 기준으로 원래 위치에 복원
        const currentIdx = s.todos.findIndex((t) => t.id === id)
        if (currentIdx !== -1) return s  // 이미 있으면 패스
        const restored = [...s.todos, prev]
        return { todos: restored }
      })
      toast.error('할일 삭제에 실패했어요.')
    })
  },

  clearAll: () => {
    const { todos, userId } = get()
    if (!userId) return
    const toDeleteIds = todos.filter((t) => !t.completed).map((t) => t.id)
    const toDeleteSet = new Set(toDeleteIds)
    if (toDeleteIds.length === 0) return
    set((s) => ({ todos: s.todos.filter((t) => t.completed) }))
    fsClear(userId, toDeleteIds).catch(() => {
      // 전체 스냅샷 덮어쓰기 대신 삭제했던 항목만 되돌림
      set((s) => ({ todos: [...s.todos, ...todos.filter((t) => toDeleteSet.has(t.id))] }))
      toast.error('삭제에 실패했어요.')
    })
  },
}))
