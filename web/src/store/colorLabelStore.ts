'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type ColorLabelStore = {
  labels: Record<string, string>
  setLabel: (color: string, label: string) => void
}

const safeStorage = {
  getItem: (key: string) => {
    try { return localStorage.getItem(key) } catch { return null }
  },
  setItem: (key: string, value: string) => {
    try { localStorage.setItem(key, value) } catch { /* quota 초과 시 무시 */ }
  },
  removeItem: (key: string) => {
    try { localStorage.removeItem(key) } catch { /* 무시 */ }
  },
}

export const useColorLabelStore = create<ColorLabelStore>()(
  persist(
    (set) => ({
      labels: {},
      setLabel: (color, label) =>
        set((s) => ({ labels: { ...s.labels, [color]: label } })),
    }),
    { name: 'allday-color-labels', storage: createJSONStorage(() => safeStorage) }
  )
)
