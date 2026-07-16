'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PomodoroSettings, PomodoroPhase } from '@/types'

export const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 50,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
}

type PomodoroStore = {
  settings: PomodoroSettings
  phase: PomodoroPhase
  sessionCount: number
  isRunning: boolean
  secondsLeft: number
  updateSettings: (settings: Partial<PomodoroSettings>) => void
  setPhase: (phase: PomodoroPhase) => void
  setRunning: (running: boolean) => void
  setSecondsLeft: (seconds: number) => void
  incrementSession: () => void
  reset: () => void
}

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      phase: 'work',
      sessionCount: 0,
      isRunning: false,
      secondsLeft: DEFAULT_SETTINGS.workMinutes * 60,

      updateSettings: (updated) =>
        set((s) => ({ settings: { ...s.settings, ...updated } })),

      setPhase: (phase) =>
        set((s) => {
          const mins =
            phase === 'work' ? s.settings.workMinutes
            : phase === 'shortBreak' ? s.settings.shortBreakMinutes
            : s.settings.longBreakMinutes
          return { phase, secondsLeft: mins * 60, isRunning: false }
        }),

      setRunning: (running) => set({ isRunning: running }),
      setSecondsLeft: (seconds) => set({ secondsLeft: seconds }),
      incrementSession: () => set((s) => ({ sessionCount: s.sessionCount + 1 })),

      reset: () => {
        const { settings } = get()
        set({ secondsLeft: settings.workMinutes * 60, isRunning: false, phase: 'work' })
      },
    }),
    {
      name: 'allday-pomodoro',
      partialize: (s) => ({ settings: s.settings, sessionCount: s.sessionCount }),
      // 새로고침 후 secondsLeft를 persisted settings 기준으로 재설정
      // (초기값이 DEFAULT_SETTINGS 고정이라 settings 변경 후 새로고침 시 오표시 방지)
      onRehydrateStorage: () => (state) => {
        // 'allay-pomodoro' 오타 키 → 'allday-pomodoro' 마이그레이션
        try {
          const old = localStorage.getItem('allay-pomodoro')
          if (old) {
            const parsed = JSON.parse(old) as { state?: { settings?: PomodoroSettings; sessionCount?: number } }
            if (state && parsed?.state) {
              if (parsed.state.settings)          state.settings      = parsed.state.settings
              if (parsed.state.sessionCount != null) state.sessionCount = parsed.state.sessionCount
            }
            localStorage.removeItem('allay-pomodoro')
          }
        } catch { /* 마이그레이션 실패 시 무시 */ }

        if (state) state.secondsLeft = state.settings.workMinutes * 60
      },
    }
  )
)
