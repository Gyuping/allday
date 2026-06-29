'use client'

// ?�모?�로 ?�?�머 ?�태�??�역?�로 관리하??Zustand ?�토??// ?�?�머 ?�작 ?�태(phase, secondsLeft ?????�로고침 ??초기?�되�?
// ?�용???�정(settings)�?localStorage???�?�된??
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PomodoroSettings, PomodoroPhase } from '@/types'

const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 50,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
}

type PomodoroStore = {
  settings: PomodoroSettings
  phase: PomodoroPhase
  sessionCount: number  // 오늘 완료한 집중 세션 수
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

      // ?�이즈�? 변경하�??�당 ?�이�??�간?�로 ?�?�머가 ?�동 리셋?�고 멈춘??
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

      // ?�재 ?�정??집중 ?�간?�로 ?�?�머�?초기?�하�?멈춤
      reset: () => {
        const { settings } = get()
        set({ secondsLeft: settings.workMinutes * 60, isRunning: false, phase: 'work' })
      },
    }),
    {
      name: 'allay-pomodoro',
      // settings�??�?�하�??�?�머 ?�태(phase, isRunning ?????�?�하지 ?�는??
      // ?�로고침 ??진행 중이???�?�머가 ?�상???�태�?복원?�는 �?방�?
      partialize: (s) => ({ settings: s.settings }),
    }
  )
)
