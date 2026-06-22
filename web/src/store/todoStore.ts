import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Todo } from '@/types'

type TodoStore = {
  todos: Todo[]
  addTodo: (todo: Todo) => void
  updateTodo: (id: string, todo: Partial<Todo>) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (todo) =>
        set((s) => ({ todos: [...s.todos, todo] })),
      updateTodo: (id, updated) =>
        set((s) => ({
          todos: s.todos.map((t) => (t.id === id ? { ...t, ...updated } : t)),
        })),
      toggleTodo: (id) =>
        set((s) => ({
          todos: s.todos.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),
      deleteTodo: (id) =>
        set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
    }),
    { name: 'allay-todo' }
  )
)
