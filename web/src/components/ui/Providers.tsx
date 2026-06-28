'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCalendarStore } from '@/store/calendarStore'
import { useTodoStore } from '@/store/todoStore'
import { subscribeCalendar } from '@/lib/firestore/calendar'
import { subscribeTodos } from '@/lib/firestore/todos'
import { useEventReminders } from '@/hooks/useEventReminders'

export default function Providers({ children }: { children: React.ReactNode }) {
  useEventReminders()

  const { user } = useAuth()
  const { setUserId: setCalendarUserId, setEvents, setLoading: setCalendarLoading } = useCalendarStore()
  const { setUserId: setTodoUserId, setTodos, setLoading: setTodoLoading, resetExpiredCompleted } = useTodoStore()
  const midnightTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (midnightTimer.current) clearTimeout(midnightTimer.current)

    if (!user) {
      setCalendarUserId(null)
      setTodoUserId(null)
      setEvents([])
      setTodos([])
      setCalendarLoading(false)
      setTodoLoading(false)
      return
    }

    setCalendarUserId(user.uid)
    setTodoUserId(user.uid)

    // Firestore 구독 실패 시 로딩 해제 — 안 하면 isLoading이 영원히 true
    const unsubCalendar = subscribeCalendar(
      user.uid,
      setEvents,
      () => setCalendarLoading(false)
    )
    const unsubTodos = subscribeTodos(
      user.uid,
      setTodos,
      () => setTodoLoading(false)
    )

    // async 함수 호출 시 에러 무시 처리
    resetExpiredCompleted().catch((e) => console.error('[resetExpiredCompleted]', e))

    const scheduleMidnightReset = () => {
      const now = new Date()
      const msUntilMidnight =
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime()
      midnightTimer.current = setTimeout(() => {
        resetExpiredCompleted().catch((e) => console.error('[resetExpiredCompleted]', e))
        scheduleMidnightReset()
      }, msUntilMidnight)
    }
    scheduleMidnightReset()

    return () => {
      // 각각 try-catch로 감싸 하나가 실패해도 나머지가 실행되도록 보장
      try { unsubCalendar() } catch { /* 무시 */ }
      try { unsubTodos() }    catch { /* 무시 */ }
      if (midnightTimer.current) clearTimeout(midnightTimer.current)
    }
  }, [user])

  return <>{children}</>
}
