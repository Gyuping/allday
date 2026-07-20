import { create } from 'zustand'
import { Alert } from 'react-native'
import type { CalendarEvent } from '@/types'
import {
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/lib/firestore/calendar'

type CalendarStore = {
  events: CalendarEvent[]
  userId: string | null
  isLoading: boolean
  fetchError: boolean
  retryToken: number
  pendingIds: Set<string>
  setUserId: (id: string | null) => void
  setEvents: (events: CalendarEvent[]) => void
  setLoading: (v: boolean) => void
  setFetchError: (v: boolean) => void
  setSubscriptionFailed: () => void
  requestRetry: () => void
  addEvent: (event: CalendarEvent) => void
  updateEvent: (id: string, data: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: [],
  userId: null,
  isLoading: true,
  fetchError: false,
  retryToken: 0,
  pendingIds: new Set(),

  setUserId: (id) => set({ userId: id }),
  setEvents: (events) => set({ events, isLoading: false, fetchError: false }),
  setLoading: (v) => set({ isLoading: v }),
  setFetchError: (v) => set({ fetchError: v }),
  setSubscriptionFailed: () => set({ isLoading: false, fetchError: true }),
  requestRetry: () => set((s) => ({ isLoading: true, fetchError: false, retryToken: s.retryToken + 1 })),

  addEvent: (event) => {
    const { userId } = get()
    if (!userId) return
    set((s) => ({ events: [...s.events, event] }))
    addCalendarEvent(userId, event).catch(() => {
      set((s) => ({ events: s.events.filter((e) => e.id !== event.id) }))
      Alert.alert('오류', '일정 저장에 실패했어요.')
    })
  },

  updateEvent: (id, data) => {
    const { userId, events, pendingIds } = get()
    if (!userId || pendingIds.has(id)) return
    const prev = events.find((e) => e.id === id)
    if (!prev) return
    set((s) => {
      const ids = new Set(s.pendingIds)
      ids.add(id)
      return { pendingIds: ids, events: s.events.map((e) => e.id === id ? { ...e, ...data } : e) }
    })
    updateCalendarEvent(userId, id, data)
      .catch(() => {
        set((s) => ({ events: s.events.map((e) => e.id === id ? prev : e) }))
        Alert.alert('오류', '일정 수정에 실패했어요.')
      })
      .finally(() => {
        set((s) => {
          const ids = new Set(s.pendingIds)
          ids.delete(id)
          return { pendingIds: ids }
        })
      })
  },

  deleteEvent: (id) => {
    const { userId, events } = get()
    if (!userId) return
    const idx = events.findIndex((e) => e.id === id)
    const prev = events[idx]
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }))
    deleteCalendarEvent(userId, id).catch(() => {
      if (prev) set((s) => {
        const restored = [...s.events]
        restored.splice(Math.min(idx, restored.length), 0, prev)
        return { events: restored }
      })
      Alert.alert('오류', '일정 삭제에 실패했어요.')
    })
  },
}))
