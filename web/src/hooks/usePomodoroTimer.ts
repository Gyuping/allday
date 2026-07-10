'use client'

import { useEffect, useRef } from 'react'
import { usePomodoroStore } from '@/store/pomodoroStore'
import { playWorkComplete, playBreakComplete } from '@/lib/sounds'
import type { PomodoroPhase } from '@/types'

// AppShell에서 호출 — 페이지 이동과 무관하게 타이머가 계속 흐름
export function usePomodoroTimer() {
  const isRunning = usePomodoroStore((s) => s.isRunning)
  const { setSecondsLeft, setPhase, setRunning, incrementSession } = usePomodoroStore()

  const completeRef = useRef(() => {
    const { phase, sessionCount, settings } = usePomodoroStore.getState()
    setRunning(false)
    if (phase === 'work') {
      const newCount = sessionCount + 1
      incrementSession()
      const next: PomodoroPhase =
        newCount % settings.sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak'
      setPhase(next)
      playWorkComplete()
      if ('Notification' in window && Notification.permission === 'granted')
        new Notification('집중 완료! 🎉 휴식을 취하세요', { icon: '/favicon.ico' })
    } else {
      setPhase('work')
      playBreakComplete()
      if ('Notification' in window && Notification.permission === 'granted')
        new Notification('휴식 종료! 다시 집중해볼까요?', { icon: '/favicon.ico' })
    }
  })

  useEffect(() => {
    if (!isRunning) return
    const tick = setInterval(() => {
      const { secondsLeft: cur } = usePomodoroStore.getState()
      if (cur <= 1) {
        clearInterval(tick)
        setSecondsLeft(0)
        completeRef.current()
      } else {
        setSecondsLeft(Math.max(0, cur - 1))
      }
    }, 1000)
    return () => clearInterval(tick)
  }, [isRunning, setSecondsLeft])
}
