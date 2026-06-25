// 포모도로 타이머 상태를 전역으로 관리하는 Zustand 스토어
// 타이머 동작 상태(phase, secondsLeft 등)는 새로고침 시 초기화되고,
// 사용자 설정(settings)만 localStorage에 저장된다.
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

      // 페이즈를 변경하면 해당 페이즈 시간으로 타이머가 자동 리셋되고 멈춘다.
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

      // 현재 설정의 집중 시간으로 타이머를 초기화하고 멈춤
      reset: () => {
        const { settings } = get()
        set({ secondsLeft: settings.workMinutes * 60, isRunning: false, phase: 'work' })
      },
    }),
    {
      name: 'allay-pomodoro',
      // settings만 저장하고 타이머 상태(phase, isRunning 등)는 저장하지 않는다.
      // 새로고침 후 진행 중이던 타이머가 이상한 상태로 복원되는 걸 방지
      partialize: (s) => ({ settings: s.settings }),
    }
  )
)
