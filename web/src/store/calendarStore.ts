// 캘린더 이벤트 전역 상태 관리 — Firestore 연동
// 낙관적 업데이트: 로컬 먼저 반영 → Firestore 실패 시 롤백
import { create } from 'zustand'
import type { CalendarEvent } from '@/types'
import {
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/lib/firestore/calendar'
import { toast } from '@/store/toastStore'

type CalendarStore = {
  events: CalendarEvent[]
  userId: string | null
  isLoading: boolean
  setUserId: (id: string | null) => void
  setEvents: (events: CalendarEvent[]) => void
  setLoading: (v: boolean) => void
  addEvent: (event: CalendarEvent) => Promise<void>
  updateEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: [],
  userId: null,
  isLoading: true,

  setUserId: (id) => set({ userId: id }),
  setEvents: (events) => set({ events, isLoading: false }),
  setLoading: (v) => set({ isLoading: v }),

  addEvent: async (event) => {
    const { userId } = get()
    if (!userId) return
    set((s) => ({ events: [...s.events, event] }))
    try {
      await addCalendarEvent(userId, event)
    } catch {
      set((s) => ({ events: s.events.filter((e) => e.id !== event.id) }))
      toast.error('일정 저장에 실패했어요. 다시 시도해주세요.')
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
      toast.error('일정 수정에 실패했어요. 다시 시도해주세요.')
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
      toast.error('일정 삭제에 실패했어요. 다시 시도해주세요.')
    }
  },
}))
