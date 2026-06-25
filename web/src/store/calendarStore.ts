// 캘린더 일정 데이터를 전역으로 관리하는 Zustand 스토어
// persist 미들웨어를 통해 localStorage에 자동 저장/복원된다.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CalendarEvent } from '@/types'

type CalendarStore = {
  events: CalendarEvent[]
  addEvent: (event: CalendarEvent) => void
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set) => ({
      events: [],

      // 새 일정 추가 — id는 호출 측에서 crypto.randomUUID()로 생성해서 넘긴다
      addEvent: (event) =>
        set((s) => ({ events: [...s.events, event] })),

      // 특정 일정의 일부 필드만 수정 (Partial로 필요한 필드만 전달)
      updateEvent: (id, updated) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...updated } : e)),
        })),

      deleteEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    { name: 'allay-calendar' }  // localStorage 키 이름
  )
)
