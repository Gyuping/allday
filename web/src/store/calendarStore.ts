// 캘린더 이벤트 전역 상태 관리 — Firestore 연동
// 낙관적 업데이트: 로컬 먼저 반영 → Firestore 실패 시 롤백
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
    if (!userId) return
    set((s) => ({ events: [...s.events, event] }))
    try {
      await addCalendarEvent(userId, event)
    } catch {
      set((s) => ({ events: s.events.filter((e) => e.id !== event.id) }))
    }
  },

  updateEvent: async (id, data) => {
    const { userId, events } = get()
    if (!userId) return
    const prev = events.find((e) => e.id === id)
    if (!prev) return
    set((s) => ({ events: s.events.map((e) => e.id === id ? { ...e, ...data } : e) }))
    try {
      await updateCalendarEvent(userId, id, data)
    } catch {
      set((s) => ({ events: s.events.map((e) => e.id === id ? prev : e) }))
    }
  },

  deleteEvent: async (id) => {
    const { userId, events } = get()
    if (!userId) return
    const prev = events.find((e) => e.id === id)
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }))
    try {
      await deleteCalendarEvent(userId, id)
    } catch {
      if (prev) set((s) => ({ events: [...s.events, prev] }))
    }
  },
}))
