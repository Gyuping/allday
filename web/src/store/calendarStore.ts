// 캘린더 이벤트 전역 상태 관리
// Firestore 연동 시 addCalendarEvent 등을 직접 호출한다.
// userId는 Providers에서 주입해 실시간 구독을 설정한다.
import { create } from 'zustand'
import type { CalendarEvent } from '@/types'
import {
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/lib/firestore/calendar'

type CalendarStore = {
  events: CalendarEvent[]
  userId: string | null
  setUserId: (id: string | null) => void
  setEvents: (events: CalendarEvent[]) => void
  addEvent: (event: CalendarEvent) => Promise<void>
  updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: [],
  userId: null,

  setUserId: (id) => set({ userId: id }),
  setEvents: (events) => set({ events }),

  addEvent: async (event) => {
    const { userId } = get()
    set((s) => ({ events: [...s.events, event] }))
    if (userId) addCalendarEvent(userId, event).catch(() => {
      set((s) => ({ events: s.events.filter((e) => e.id !== event.id) }))
    })
  },

  updateEvent: async (id, data) => {
    const { userId } = get()
    if (userId) await updateCalendarEvent(userId, id, data)
    else set((s) => ({ events: s.events.map((e) => e.id === id ? { ...e, ...data } : e) }))
  },

  deleteEvent: async (id) => {
    const { userId } = get()
    if (userId) await deleteCalendarEvent(userId, id)
    else set((s) => ({ events: s.events.filter((e) => e.id !== id) }))
  },
}))
