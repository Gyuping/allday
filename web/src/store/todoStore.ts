// 할일 목록을 전역으로 관리하는 Zustand 스토어
// persist 미들웨어로 localStorage에 자동 저장/복원된다.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Todo } from '@/types'

type TodoStore = {
  todos: Todo[]
  addTodo: (todo: Todo) => void
  updateTodo: (id: string, todo: Partial<Todo>) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  resetExpiredCompleted: () => void  // 하루 지난 완료 항목을 미완료로 초기화
  clearAll: () => void               // 전체 삭제
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

      // 완료 상태를 토글하면서 completedAt(완료 날짜)도 함께 갱신한다.
      // toLocaleDateString('sv-SE')는 시스템 타임존 기준 'YYYY-MM-DD'를 반환한다.
      // (toISOString은 UTC 기준이라 타임존 차이로 날짜가 어긋날 수 있어서 대신 사용)
      toggleTodo: (id) =>
        set((s) => ({
          todos: s.todos.map((t) => {
            if (t.id !== id) return t
            const completed = !t.completed
            return {
              ...t,
              completed,
              completedAt: completed ? new Date().toLocaleDateString('sv-SE') : undefined,
            }
          }),
        })),

      deleteTodo: (id) =>
        set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),

      clearAll: () => set({ todos: [] }),

      // 앱 시작 시 Providers.tsx에서 호출된다.
      // completedAt이 오늘보다 이전인 완료 항목을 다시 미완료로 되돌린다.
      // 단, completedAt은 유지해야 캘린더에 완료 기록이 남는다.
      resetExpiredCompleted: () => {
        const today = new Date().toLocaleDateString('sv-SE')
        set((s) => ({
          todos: s.todos.map((t) =>
            t.completed && t.completedAt && t.completedAt < today
              ? { ...t, completed: false }  // completed만 false, completedAt은 보존
              : t
          ),
        }))
      },
    }),
    { name: 'allay-todo' }
  )
)
