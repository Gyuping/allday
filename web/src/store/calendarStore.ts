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
      addEvent: (event) =>
        set((s) => ({ events: [...s.events, event] })),
      updateEvent: (id, updated) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...updated } : e)),
        })),
      deleteEvent: (id) =>
        set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    { name: 'allay-calendar' }
  )
)
