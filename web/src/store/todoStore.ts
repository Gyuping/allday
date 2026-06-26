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
    if (userId) await fsAdd(userId, todo)
  },

  updateTodo: async (id, data) => {
    const { userId } = get()
    if (userId) await fsUpdate(userId, id, data)
  },

  toggleTodo: async (id) => {
    const { todos, userId } = get()
    const todo = todos.find((t) => t.id === id)
    if (!todo || !userId) return
    const completed = !todo.completed
    await fsUpdate(userId, id, {
      completed,
      completedAt: completed ? new Date().toLocaleDateString('sv-SE') : undefined,
    })
  },

  deleteTodo: async (id) => {
    const { userId } = get()
    if (userId) await fsDelete(userId, id)
  },

  clearAll: async () => {
    const { todos, userId } = get()
    if (userId) await fsClear(userId, todos.map((t) => t.id))
  },

  // 하루 지난 완료 항목을 미완료로 초기화 (completedAt 유지)
  resetExpiredCompleted: async () => {
    const { todos, userId } = get()
    if (!userId) return
    const today = new Date().toLocaleDateString('sv-SE')
    const expired = todos.filter(
      (t) => t.completed && t.completedAt && t.completedAt < today
    )
    await Promise.all(expired.map((t) => fsUpdate(userId, t.id, { completed: false })))
  },
}))
