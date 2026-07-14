'use client'

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
  pendingIds: Set<string>
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
  pendingIds: new Set(),

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
    const { userId, events, pendingIds } = get()
    if (!userId) return
    if (pendingIds.has(id)) return
    const prev = events.find((e) => e.id === id)
    if (!prev) return

    set((s) => {
      const ids = new Set(s.pendingIds)
      ids.add(id)
      return {
        pendingIds: ids,
        events: s.events.map((e) => e.id === id ? { ...e, ...data } : e),
      }
    })
    try {
      await updateCalendarEvent(userId, id, data)
    } catch {
      set((s) => ({ events: s.events.map((e) => e.id === id ? prev : e) }))
      toast.error('일정 수정에 실패했어요. 다시 시도해주세요.')
    } finally {
      set((s) => {
        const ids = new Set(s.pendingIds)
        ids.delete(id)
        return { pendingIds: ids }
      })
    }
  },

  deleteEvent: async (id) => {
    const { userId, events } = get()
    if (!userId) return
    const idx = events.findIndex((e) => e.id === id)
    const prev = events[idx]
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }))
    try {
      await deleteCalendarEvent(userId, id)
    } catch {
      if (prev) set((s) => {
        const restored = [...s.events]
        restored.splice(Math.min(idx, restored.length), 0, prev)
        return { events: restored }
      })
      toast.error('일정 삭제에 실패했어요. 다시 시도해주세요.')
    }
  },
}))
