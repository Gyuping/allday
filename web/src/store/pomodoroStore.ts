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
  totalFocusMinutes: number
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
      totalFocusMinutes: 0,
      isRunning: false,
      secondsLeft: DEFAULT_SETTINGS.workMinutes * 60,

      updateSettings: (updated) => {
        // 다른 탭에서 완료한 세션이 이 탭의 낡은 sessionCount로 덮어써지지 않도록
        // 설정 저장 직전에 localStorage의 최신값과 비교해서 큰 쪽을 유지
        let storedCount = 0
        let storedMins  = 0
        try {
          const raw = localStorage.getItem('allday-pomodoro')
          if (raw) {
            const parsed = JSON.parse(raw) as { state?: { sessionCount?: number; totalFocusMinutes?: number } }
            storedCount = parsed?.state?.sessionCount     ?? 0
            storedMins  = parsed?.state?.totalFocusMinutes ?? 0
          }
        } catch { /* localStorage 접근 실패 시 무시 */ }
        set((s) => ({
          settings: { ...s.settings, ...updated },
          sessionCount:      Math.max(s.sessionCount,      storedCount),
          totalFocusMinutes: Math.max(s.totalFocusMinutes, storedMins),
        }))
      },

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
      incrementSession: () => set((s) => ({
        sessionCount: s.sessionCount + 1,
        totalFocusMinutes: s.totalFocusMinutes + s.settings.workMinutes,
      })),

      reset: () => {
        const { settings } = get()
        set({ secondsLeft: settings.workMinutes * 60, isRunning: false, phase: 'work' })
      },
    }),
    {
      name: 'allday-pomodoro',
      partialize: (s) => ({ settings: s.settings, sessionCount: s.sessionCount, totalFocusMinutes: s.totalFocusMinutes, phase: s.phase }),
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

        if (state) {
          // 페이즈별 남은 시간 복원 (저장하지 않으므로 해당 페이즈 전체 시간으로 리셋)
          const mins =
            state.phase === 'shortBreak' ? state.settings.shortBreakMinutes
            : state.phase === 'longBreak'  ? state.settings.longBreakMinutes
            : state.settings.workMinutes
          state.secondsLeft = mins * 60
          // 기존 사용자 마이그레이션: totalFocusMinutes 없으면 sessionCount 기반으로 초기값 설정
          if (!state.totalFocusMinutes && state.sessionCount > 0) {
            state.totalFocusMinutes = state.sessionCount * state.settings.workMinutes
          }
        }
      },
    }
  )
)
